import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { RealTimeAPIInsights } from "@/components/dashboard/real-time-api-insights"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Real-Time API Insights | ExportRemix",
  description: "View real-time trade data from connected public APIs",
}

export default async function APIInsightsPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return <RealTimeAPIInsights userId={user.id} />
}
