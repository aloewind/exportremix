import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { checkAdminAccess } from "@/lib/admin-utils"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("[v0] Admin usage stats API - GET request")

    const isAdmin = await checkAdminAccess()

    if (!isAdmin) {
      console.log("[v0] Usage stats access denied - user is not admin or enterprise")
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
    }

    const supabase = await createServerClient()

    const { count: totalUsers, error: countError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("[v0] Error counting users:", countError)
    }

    const { data: userSettings, error: settingsError } = await supabase.from("user_settings").select("tier")

    if (settingsError) {
      console.error("[v0] Error fetching user settings:", settingsError)
    }

    const tierCounts = userSettings?.reduce(
      (acc: any, setting) => {
        const tier = setting.tier || "free"
        acc[tier] = (acc[tier] || 0) + 1
        return acc
      },
      { free: 0, pro: 0, enterprise: 0 },
    ) || { free: 0, pro: 0, enterprise: 0 }

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: usageData, error: usageError } = await supabase
      .from("usage_tracking")
      .select("request_count, action_type")
      .gte("period_start", startOfMonth.toISOString())

    if (usageError) {
      console.error("[v0] Error fetching usage data:", usageError)
    }

    const totalRequests = usageData?.reduce((sum, u) => sum + (u.request_count || 0), 0) || 0

    const actionBreakdown = usageData?.reduce((acc: any, u) => {
      acc[u.action_type] = (acc[u.action_type] || 0) + u.request_count
      return acc
    }, {})

    console.log(`[v0] Successfully fetched usage stats: ${totalUsers} users, ${totalRequests} requests`)

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      tierCounts,
      totalRequests,
      actionBreakdown: actionBreakdown || {},
    })
  } catch (error) {
    console.error("[v0] Error in usage stats API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch usage stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
