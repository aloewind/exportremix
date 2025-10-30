import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { checkAdminAccess, checkManagerAccess, getUserRole } from "@/lib/admin-utils"
import { AdminClient } from "@/components/admin/admin-client"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  console.log("[v0] Admin page loading...")

  const isAdmin = await checkAdminAccess()
  const isManager = await checkManagerAccess()

  console.log(`[v0] Admin page access check - isAdmin: ${isAdmin}, isManager: ${isManager}`)

  if (!isAdmin && !isManager) {
    console.log("[v0] Access denied - redirecting to dashboard")
    redirect("/dashboard")
  }

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log("[v0] No user found - redirecting to dashboard")
    redirect("/dashboard")
  }

  const userRole = await getUserRole(user.id)
  console.log(`[v0] Admin page rendering for user ${user.email} with role: ${userRole}`)

  return <AdminClient userId={user.id} userRole={userRole} />
}
