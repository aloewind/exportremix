export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin-utils"
import { AnalyticsClient } from "@/components/analytics/analytics-client"

export default async function AnalyticsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const adminStatus = await isAdmin(user.id)
  if (!adminStatus) {
    redirect("/dashboard")
  }

  return <AnalyticsClient userId={user.id} />
}
