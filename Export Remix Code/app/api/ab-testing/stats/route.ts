import { NextResponse } from "next/server"
import { getSupabaseRouteHandlerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseRouteHandlerClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      console.error("[v0] Error fetching profile:", profileError)
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    if (!profile.is_admin) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    // Get A/B test statistics
    const { data: stats, error } = await supabase.rpc("get_ab_test_stats", { test_page: "landing" })

    if (error) throw error

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("[v0] Error fetching A/B test stats:", error)
    return NextResponse.json({ error: "Failed to fetch A/B test stats" }, { status: 500 })
  }
}
