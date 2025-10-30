import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { DashboardClient } from "@/components/dashboard/dashboard-client"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: userSettings } = await supabase.from("user_settings").select("tier").eq("user_id", user.id).single()

  // Create a subscription-like object for backward compatibility
  const subscription = userSettings
    ? { tier: userSettings.tier || "free", status: "active" }
    : { tier: "free", status: "active" }

  const currentMonth = new Date().toISOString().slice(0, 7)
  const { data: usage } = await supabase
    .from("usage_tracking")
    .select("*")
    .eq("user_id", user.id)
    .eq("month", currentMonth)

  return <DashboardClient user={user} profile={profile} subscription={subscription} usage={usage || []} />
}
