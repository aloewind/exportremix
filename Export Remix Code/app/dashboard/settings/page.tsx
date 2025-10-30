import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { SettingsClient } from "@/components/settings/settings-client"
import { getLocale } from "@/lib/i18n-utils"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: subscription } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).single()

  const currentMonth = new Date().toISOString().slice(0, 7)
  const { data: usage } = await supabase
    .from("usage_tracking")
    .select("*")
    .eq("user_id", user.id)
    .eq("month", currentMonth)

  const locale = await getLocale()

  return <SettingsClient user={user} subscription={subscription} usage={usage || []} locale={locale} />
}
