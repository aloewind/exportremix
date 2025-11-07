import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Admin Dashboard - ExportRemix",
  description: "Admin panel for ExportRemix",
}

export default async function AdminPage() {
  const supabase = await createServerClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (profileError) {
    console.error("[Admin] Error fetching profile:", profileError)
    redirect("/dashboard")
  }

  if (!profile?.is_admin) {
    redirect("/dashboard")
  }

  // Fetch admin data
  const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false })

  const { data: usageStats } = await supabase
    .from("usage_tracking")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  return (
    <div className="min-h-screen bg-background">
      <AdminDashboard users={users || []} subscriptions={subscriptions || []} usageStats={usageStats || []} />
    </div>
  )
}
