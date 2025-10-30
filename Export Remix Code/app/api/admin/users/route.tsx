import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { checkAdminAccess } from "@/lib/admin-utils"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("[v0] Admin users API - GET request")

    const isAdmin = await checkAdminAccess()

    if (!isAdmin) {
      console.error("[v0] Admin access denied - user is not admin or enterprise")
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
    }

    const supabase = await createServerClient()

    // Fetch profiles separately
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (profilesError) {
      console.error("[v0] Error fetching profiles:", profilesError)
      throw profilesError
    }

    console.log(`[v0] Successfully fetched ${profiles?.length || 0} profiles`)

    // Fetch user_settings separately
    const { data: userSettings, error: settingsError } = await supabase.from("user_settings").select("user_id, tier")

    if (settingsError) {
      console.error("[v0] Error fetching user_settings:", settingsError)
    }

    // Create a map of user_id to tier
    const tierMap = new Map<string, string>()
    userSettings?.forEach((setting) => {
      tierMap.set(setting.user_id, setting.tier || "free")
    })

    // Merge the data
    const usersWithStats = profiles?.map((profile) => ({
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role || "user",
      tier: tierMap.get(profile.id) || "free",
      status: "active",
      totalRequests: 0,
      createdAt: profile.created_at,
      onboardingCompleted: profile.onboarding_completed,
    }))

    console.log(`[v0] Returning ${usersWithStats?.length || 0} users with tier information`)
    return NextResponse.json({ users: usersWithStats })
  } catch (error) {
    console.error("[v0] Error in admin users API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log("[v0] Admin users API - POST request (create user)")

    const isAdmin = await checkAdminAccess()

    if (!isAdmin) {
      console.error("[v0] User creation denied - not admin or enterprise")
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
    }

    const { email, fullName, password, role } = await request.json()

    if (!email || !password) {
      console.error("[v0] Missing email or password")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (!["user", "admin", "manager"].includes(role)) {
      console.error(`[v0] Invalid role: ${role}`)
      return NextResponse.json({ error: "Invalid role. Must be user, admin, or manager" }, { status: 400 })
    }

    console.log(`[v0] Creating new user: ${email} with role: ${role}`)

    const supabase = await createServerClient()

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || "",
      },
    })

    if (authError) {
      console.error("[v0] Error creating auth user:", authError)
      return NextResponse.json(
        {
          error: "Failed to create user",
          details: authError.message,
        },
        { status: 500 },
      )
    }

    if (!authData.user) {
      console.error("[v0] No user data returned from auth.admin.createUser")
      return NextResponse.json(
        {
          error: "Failed to create user",
          details: "No user data returned",
        },
        { status: 500 },
      )
    }

    console.log(`[v0] Auth user created: ${authData.user.id}`)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        role,
        full_name: fullName || "",
        email: email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", authData.user.id)

    if (profileError) {
      console.error("[v0] Error updating profile:", profileError)
    } else {
      console.log(`[v0] Profile updated for user ${authData.user.id}`)
    }

    const { error: settingsError } = await supabase.from("user_settings").upsert(
      {
        user_id: authData.user.id,
        tier: "free",
        is_confirmed: false,
        api_cbp_enabled: false,
        api_wto_enabled: false,
        api_itc_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    )

    if (settingsError) {
      console.error("[v0] Error creating user_settings:", settingsError)
    } else {
      console.log(`[v0] User settings created for user ${authData.user.id}`)
    }

    try {
      const confirmationToken = crypto.randomUUID()
      const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/confirm?token=${confirmationToken}&email=${encodeURIComponent(email)}`

      console.log("[v0] Sending confirmation email to:", email)

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "ExportRemix <onboarding@resend.dev>",
          to: [email],
          subject: "Welcome to ExportRemix - Confirm Your Email",
          html: `
            <h1>Welcome to ExportRemix!</h1>
            <p>Hello ${fullName || "there"},</p>
            <p>Your account has been created by an administrator. Please confirm your email address to activate your account.</p>
            <p><strong>Your temporary password:</strong> ${password}</p>
            <p>Please change this password after your first login.</p>
            <p><a href="${confirmationUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Confirm Email Address</a></p>
            <p>Or copy and paste this link into your browser:</p>
            <p>${confirmationUrl}</p>
            <p>If you didn't request this account, please ignore this email.</p>
            <p>Best regards,<br>The ExportRemix Team</p>
          `,
        }),
      })

      if (!resendResponse.ok) {
        const resendError = await resendResponse.json()
        console.error("[v0] Error sending confirmation email:", resendError)
      } else {
        console.log("[v0] Confirmation email sent successfully to:", email)
      }
    } catch (emailError) {
      console.error("[v0] Exception sending confirmation email:", emailError)
      // Don't fail the user creation if email fails
    }

    console.log(`[v0] Successfully created user ${email} with role ${role}`)

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: fullName,
        role,
      },
    })
  } catch (error) {
    console.error("[v0] Error creating user:", error)
    return NextResponse.json(
      {
        error: "Failed to create user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
