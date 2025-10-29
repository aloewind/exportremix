import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { OnboardingClient } from "@/components/onboarding/onboarding-client"

export const dynamic = "force-dynamic"

export default async function OnboardingPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return <OnboardingClient />
}
