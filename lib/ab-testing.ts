import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export type ABVariant = "A" | "B"

export interface ABTest {
  id: string
  session_id: string
  variant: ABVariant
  page: string
  assigned_at: string
  converted: boolean
  converted_at?: string
  user_id?: string
}

export interface ABTestStats {
  variant: ABVariant
  total_views: number
  total_conversions: number
  conversion_rate: number
}

function isSupabaseConfigured(): boolean {
  return !!(
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// Get or assign A/B test variant for a session
export function getABVariant(page = "landing"): ABVariant {
  // Check if variant is already stored in sessionStorage
  const storageKey = `ab_variant_${page}`
  const stored = typeof window !== "undefined" ? sessionStorage.getItem(storageKey) : null

  if (stored === "A" || stored === "B") {
    return stored as ABVariant
  }

  // Randomly assign variant (50/50 split)
  const variant: ABVariant = Math.random() < 0.5 ? "A" : "B"

  // Store in sessionStorage
  if (typeof window !== "undefined") {
    sessionStorage.setItem(storageKey, variant)
  }

  return variant
}

// Track A/B test assignment
export async function trackABTest(variant: ABVariant, page = "landing") {
  if (!isSupabaseConfigured()) {
    return
  }

  try {
    const sessionId = getSessionId()

    await fetch("/api/ab-test/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        variant,
        page,
      }),
    })
  } catch (error: any) {}
}

// Track conversion (signup)
export async function trackABConversion(page = "landing") {
  if (!isSupabaseConfigured()) {
    return
  }

  try {
    const sessionId = getSessionId()

    await fetch("/api/ab-test/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        page,
      }),
    })
  } catch (error: any) {}
}

// Get session ID (create if doesn't exist)
function getSessionId(): string {
  if (typeof window === "undefined") return ""

  let sessionId = sessionStorage.getItem("ab_session_id")

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem("ab_session_id", sessionId)
  }

  return sessionId
}

// Get A/B test statistics (admin only)
export async function getABTestStats(page = "landing"): Promise<ABTestStats[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  try {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.rpc("get_ab_test_stats", { test_page: page })

    if (error) throw error

    return data || []
  } catch (error: any) {
    console.error("Error fetching A/B test stats:", error.message || error)
    return []
  }
}
