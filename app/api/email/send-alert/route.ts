import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
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
    const { alertId, alertData } = body

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, email_alerts_enabled")
      .eq("id", user.id)
      .single()

    console.log("[v0] Alert notification - using in-app display only", {
      userId: user.id,
      alertTitle: alertData.title,
    })

    await supabase.from("email_logs").insert({
      user_id: user.id,
      email_type: "surge_alert",
      recipient_email: profile?.email || "unknown",
      subject: `${alertData.severity.toUpperCase()} Alert: ${alertData.title}`,
      status: "in-app-notification",
      error_message: null,
      metadata: { alert_id: alertId, mode: "in-app-only" },
    })

    return NextResponse.json({
      success: true,
      mode: "in-app-notification",
      message: "Alert will be displayed in dashboard",
    })
  } catch (error) {
    console.error("[v0] Alert notification error:", error)
    return NextResponse.json({ error: "Failed to process alert" }, { status: 500 })
  }
}
