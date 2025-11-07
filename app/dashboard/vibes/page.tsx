import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { VibesClient } from "@/components/vibes/vibes-client"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Vibe Customization | ExportRemix",
  description: "Customize your remix themes and prediction styles",
}

export default async function VibesPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profileError) {
    console.error("[Vibes] Error fetching profile:", profileError)
  }

  return (
    <DashboardLayout>
      <VibesClient profile={profile} />
    </DashboardLayout>
  )
}
