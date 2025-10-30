import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin-utils"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get analytics for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: events, error } = await supabase
      .from("analytics_events")
      .select("*")
      .gte("created_at", thirtyDaysAgo.toISOString())

    if (error) throw error

    // Calculate metrics
    const loginCount = events?.filter((e) => e.event_type === "login").length || 0
    const remixCount = events?.filter((e) => e.event_type === "remix").length || 0
    const predictCount = events?.filter((e) => e.event_type === "predict").length || 0
    const exportCount = events?.filter((e) => e.event_type === "export").length || 0
    const shareCount = events?.filter((e) => e.event_type === "share").length || 0

    const uniqueUsers = new Set(events?.map((e) => e.user_id)).size

    const avgRemixesPerUser = uniqueUsers > 0 ? Math.round(remixCount / uniqueUsers) : 0

    // Calculate daily breakdown
    const dailyBreakdown = events?.reduce(
      (acc, event) => {
        const date = new Date(event.created_at).toLocaleDateString()
        if (!acc[date]) {
          acc[date] = { date, logins: 0, remixes: 0, predicts: 0, exports: 0 }
        }
        if (event.event_type === "login") acc[date].logins++
        if (event.event_type === "remix") acc[date].remixes++
        if (event.event_type === "predict") acc[date].predicts++
        if (event.event_type === "export") acc[date].exports++
        return acc
      },
      {} as Record<string, any>,
    )

    return NextResponse.json({
      summary: {
        logins: loginCount,
        remixes: remixCount,
        predicts: predictCount,
        exports: exportCount,
        shares: shareCount,
        uniqueUsers,
        avgRemixesPerUser,
        disruptionRate: 76, // Simulated 76% disruption rate
      },
      dailyBreakdown: Object.values(dailyBreakdown || {}),
    })
  } catch (error) {
    console.error("[v0] Analytics stats error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
