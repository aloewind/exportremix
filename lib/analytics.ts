import { getSupabaseBrowserClient } from "./supabase/client"

export type AnalyticsEvent = "login" | "signup" | "upload" | "predict" | "remix" | "export" | "share" | "feedback"

export async function trackEvent(eventType: AnalyticsEvent, eventData?: Record<string, any>) {
  try {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from("analytics_events").insert({
      user_id: user.id,
      event_type: eventType,
      event_data: eventData || {},
    })
  } catch (error) {
    console.error("[v0] Failed to track analytics event:", error)
  }
}
