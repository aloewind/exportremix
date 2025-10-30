import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { APIIntegrationsPage } from "@/components/dashboard/api-integrations-page"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export const dynamic = "force-dynamic"

export default async function IntegrationsPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <DashboardLayout>
      <APIIntegrationsPage userId={user.id} />
    </DashboardLayout>
  )
}
