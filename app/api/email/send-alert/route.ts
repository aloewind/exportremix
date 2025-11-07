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

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("[Email Alert] JSON parse error:", parseError)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { alertId, alertData } = body

    if (!alertData || !alertId) {
      return NextResponse.json({ error: "Missing alertId or alertData" }, { status: 400 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, email, email_alerts_enabled")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("[Email Alert] Error fetching profile:", profileError)
      return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
    }

    console.log("[v0] Alert notification - using in-app display only", {
      userId: user.id,
      alertTitle: alertData?.title || "Unknown",
    })

    await supabase.from("email_logs").insert({
      user_id: user.id,
      email_type: "surge_alert",
      recipient_email: profile?.email || "unknown",
      subject: `${alertData?.severity?.toUpperCase() || "INFO"} Alert: ${alertData?.title || "Unknown"}`,
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
