import { createServerClient } from "@/lib/supabase/server"
import { SUBSCRIPTION_TIERS } from "@/lib/subscription-tiers"

export type ActionType = "ai_analysis" | "remix" | "policy_check" | "export"

const TEST_ENTERPRISE_EMAIL = "testenterprise@exportremix.com"

export async function checkUsageLimit(
  userId: string,
  actionType: ActionType,
): Promise<{ allowed: boolean; remaining: number; limit: number | "unlimited" }> {
  const supabase = await createServerClient()

  const { data: profile } = await supabase.from("profiles").select("email").eq("id", userId).single()

  if (profile?.email === TEST_ENTERPRISE_EMAIL) {
    return { allowed: true, remaining: Number.POSITIVE_INFINITY, limit: "unlimited" }
  }

  // Get user's subscription tier
  const { data: subscription } = await supabase.from("subscriptions").select("tier").eq("user_id", userId).single()

  const tier = SUBSCRIPTION_TIERS.find((t) => t.id === (subscription?.tier || "free"))!

  // Pro and Enterprise users have unlimited access
  if (tier.limits.requestsPerMonth === "unlimited") {
    return { allowed: true, remaining: Number.POSITIVE_INFINITY, limit: "unlimited" }
  }

  // Check current month usage
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

  const { data: usage } = await supabase
    .from("usage_tracking")
    .select("count")
    .eq("user_id", userId)
    .eq("action_type", actionType)
    .eq("month", currentMonth)
    .single()

  const currentCount = usage?.count || 0
  const limit = tier.limits.requestsPerMonth as number
  const remaining = Math.max(0, limit - currentCount)

  return {
    allowed: currentCount < limit,
    remaining,
    limit,
  }
}

export async function trackUsage(userId: string, actionType: ActionType): Promise<void> {
  const supabase = await createServerClient()

  const { data: profile } = await supabase.from("profiles").select("email").eq("id", userId).single()

  if (profile?.email === TEST_ENTERPRISE_EMAIL) {
    return // Don't track usage for test user
  }

  const currentMonth = new Date().toISOString().slice(0, 7)

  // Upsert usage record
  const { data: existing } = await supabase
    .from("usage_tracking")
    .select("id, count")
    .eq("user_id", userId)
    .eq("action_type", actionType)
    .eq("month", currentMonth)
    .single()

  if (existing) {
    await supabase
      .from("usage_tracking")
      .update({
        count: existing.count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
  } else {
    await supabase.from("usage_tracking").insert({
      user_id: userId,
      action_type: actionType,
      month: currentMonth,
      count: 1,
    })
  }
}
