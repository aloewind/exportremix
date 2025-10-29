import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { SuccessClient } from "@/components/billing/success-client"

export const dynamic = "force-dynamic"

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get the user's subscription to show the tier
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("tier, status")
    .eq("user_id", user.id)
    .single()

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessClient tier={subscription?.tier || "free"} />
    </Suspense>
  )
}
