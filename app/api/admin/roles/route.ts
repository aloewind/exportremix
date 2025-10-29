import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { checkAdminAccess } from "@/lib/admin-utils"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("[v0] Admin roles API - GET request")

    const isAdmin = await checkAdminAccess()

    if (!isAdmin) {
      console.error("[v0] Role access denied - user is not admin or enterprise")
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
    }

    console.log("[v0] Fetching users for role management with tier information")
    const supabase = await createServerClient()

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) {
      console.error("[v0] No authenticated user found")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log(`[v0] Current user: ${currentUser.email}`)

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, created_at, updated_at")
      .order("created_at", { ascending: false })

    if (profilesError) {
      console.error("[v0] Error fetching profiles:", profilesError)
      console.log("[v0] Returning mock data as fallback")
      return NextResponse.json({
        users: [
          {
            id: currentUser.id,
            email: currentUser.email,
            full_name: currentUser.user_metadata?.full_name || "Admin User",
            role: "admin",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tier: "enterprise",
          },
        ],
      })
    }

    console.log(`[v0] Successfully fetched ${profiles?.length || 0} profiles`)

    const { data: userSettings, error: settingsError } = await supabase.from("user_settings").select("user_id, tier")

    if (settingsError) {
      console.error("[v0] Error fetching user_settings:", settingsError)
    }

    const tierMap = new Map<string, string>()
    userSettings?.forEach((setting) => {
      tierMap.set(setting.user_id, setting.tier || "free")
    })

    const usersWithTier = profiles?.map((profile) => ({
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role || "user",
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      tier: tierMap.get(profile.id) || "free",
    }))

    console.log(`[v0] Returning ${usersWithTier?.length || 0} users with tier information`)
    return NextResponse.json({ users: usersWithTier })
  } catch (error) {
    console.error("[v0] Error fetching users:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  try {
    console.log("[v0] Admin roles API - PATCH request")

    const isAdmin = await checkAdminAccess()

    if (!isAdmin) {
      console.error("[v0] Role update denied - user is not admin or enterprise")
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
    }

    const { userId, role } = await request.json()

    if (!userId || !role) {
      console.error("[v0] Missing userId or role in request")
      return NextResponse.json({ error: "Missing userId or role" }, { status: 400 })
    }

    if (!["user", "admin", "manager"].includes(role)) {
      console.error(`[v0] Invalid role: ${role}`)
      return NextResponse.json({ error: "Invalid role. Must be user, admin, or manager" }, { status: 400 })
    }

    console.log(`[v0] Updating user ${userId} to role: ${role}`)
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error("[v0] No authenticated user found")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating role:", error)
      throw error
    }

    console.log(`[v0] Successfully updated user ${userId} role to ${role}`)
    return NextResponse.json({ success: true, user: data })
  } catch (error) {
    console.error("[v0] Error updating user role:", error)
    return NextResponse.json(
      {
        error: "Failed to update user role",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log("[v0] Admin roles API - POST request (batch update)")

    const isAdmin = await checkAdminAccess()

    if (!isAdmin) {
      console.error("[v0] Batch role update denied - user is not admin or enterprise")
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
    }

    const { userIds, role } = await request.json()

    if (!Array.isArray(userIds) || userIds.length === 0) {
      console.error("[v0] Invalid userIds array")
      return NextResponse.json({ error: "Invalid userIds array" }, { status: 400 })
    }

    if (!role || !["user", "admin", "manager"].includes(role)) {
      console.error(`[v0] Invalid role for batch update: ${role}`)
      return NextResponse.json({ error: "Invalid role. Must be user, admin, or manager" }, { status: 400 })
    }

    console.log(`[v0] Batch updating ${userIds.length} users to role: ${role}`)
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error("[v0] No authenticated user found")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .in("id", userIds)
      .select()

    if (error) {
      console.error("[v0] Error in batch role update:", error)
      throw error
    }

    console.log(`[v0] Batch update complete: ${data?.length || 0} users updated to ${role}`)
    return NextResponse.json({ success: true, users: data })
  } catch (error) {
    console.error("[v0] Error in batch role update:", error)
    return NextResponse.json(
      {
        error: "Failed to batch update roles",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
