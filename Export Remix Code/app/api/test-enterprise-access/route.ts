import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    console.log("Button clicked")

    // Create Supabase client with service role key for admin operations
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get the current user from the request
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    // Verify this is the owner
    if (user.email !== "aloewind@yahoo.com") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { data: userSettings, error: settingsError } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: user.id,
          tier: "enterprise",
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      )
      .select()
      .single()

    if (settingsError) {
      return NextResponse.json(
        {
          success: false,
          error: `Database error: ${settingsError.message}`,
          details: settingsError,
        },
        { status: 500 },
      )
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        role: "admin",
      })
      .eq("id", user.id)

    if (profileError) {
      console.error("[v0] Failed to update profile role:", profileError)
      // Don't fail the request if profile update fails, just log it
    }

    console.log("Success")

    return NextResponse.json({
      success: true,
      message: "Enterprise access enabled with admin role",
      userSettings,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 },
    )
  }
}
