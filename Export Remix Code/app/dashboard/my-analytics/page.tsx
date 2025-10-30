import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MyAnalyticsClient } from "@/components/analytics/my-analytics-client"

export const dynamic = "force-dynamic"

export default async function MyAnalyticsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user's personal analytics
  const { data: events } = await supabase
    .from("analytics_events")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100)

  // Aggregate stats
  const stats = {
    totalEvents: events?.length || 0,
    remixes: events?.filter((e) => e.event_type === "remix").length || 0,
    predictions: events?.filter((e) => e.event_type === "predict").length || 0,
    exports: events?.filter((e) => e.event_type === "export").length || 0,
    shares: events?.filter((e) => e.event_type === "share").length || 0,
    surgesDetected: 28, // Mock data - would come from policy_sentinel_alerts
  }

  return <MyAnalyticsClient stats={stats} events={events || []} />
}
