import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BackOffice } from "@/components/dashboard/back-office"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default async function BackOfficePage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <DashboardLayout>
      <BackOffice />
    </DashboardLayout>
  )
}

