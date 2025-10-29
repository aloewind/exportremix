import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Email preferences POST request received")
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] Email preferences auth error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("[v0] Email preferences body:", body)

    const { policyAlerts, weeklyDigest, systemUpdates } = body

    // Enable email alerts if any preference is true
    const email_alerts_enabled = policyAlerts || weeklyDigest || systemUpdates

    const { error } = await supabase.from("profiles").update({ email_alerts_enabled }).eq("id", user.id)

    if (error) {
      console.error("[v0] Email preferences update error:", error)
      throw error
    }

    console.log("[v0] Email preferences updated successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Email preferences error:", error)
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { email_alerts_enabled, alert_frequency } = body

    const updates: any = {}
    if (typeof email_alerts_enabled === "boolean") {
      updates.email_alerts_enabled = email_alerts_enabled
    }
    if (alert_frequency) {
      updates.alert_frequency = alert_frequency
    }

    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update email preferences error:", error)
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 })
  }
}
