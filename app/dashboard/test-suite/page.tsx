import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TestSuiteClient } from "@/components/test-suite/test-suite-client"

export const dynamic = "force-dynamic"

export default async function TestSuitePage() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/login")
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (profileError) {
    console.error("[TestSuite] Error fetching profile:", profileError)
    redirect("/dashboard")
  }

  if (!profile?.is_admin) {
    redirect("/dashboard")
  }

  return <TestSuiteClient />
}
