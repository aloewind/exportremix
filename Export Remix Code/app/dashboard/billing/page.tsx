import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { BillingClient } from "@/components/billing/billing-client"

export const dynamic = "force-dynamic"

export default async function BillingPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: subscription } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).single()

  const { data: usage } = await supabase
    .from("usage_tracking")
    .select("*")
    .eq("user_id", user.id)
    .eq("month", new Date().toISOString().slice(0, 7))

  return <BillingClient subscription={subscription} usage={usage || []} />
}
