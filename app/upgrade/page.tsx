import { createServerClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UpgradeClient } from "@/components/upgrade/upgrade-client"

export const dynamic = "force-dynamic"

export default async function UpgradePage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let currentTier = "free"
  if (user) {
    const { data: subscription } = await supabase.from("subscriptions").select("tier").eq("user_id", user.id).single()
    currentTier = subscription?.tier || "free"
  }

  // If user is authenticated, wrap in DashboardLayout
  if (user) {
    return (
      <DashboardLayout>
        <UpgradeClient currentTier={currentTier} isAuthenticated={true} />
      </DashboardLayout>
    )
  }

  // If not authenticated, show public version without sidebar
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <UpgradeClient currentTier={currentTier} isAuthenticated={false} />
      </div>
    </div>
  )
}
