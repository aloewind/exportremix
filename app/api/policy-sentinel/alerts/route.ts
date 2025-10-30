import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user's policy alerts
    const { data: alerts, error: alertsError } = await supabase
      .from("policy_alerts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)

    if (alertsError) {
      throw alertsError
    }

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error("Error fetching policy alerts:", error)
    return NextResponse.json(
      { error: "Failed to fetch alerts", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { alertId, isRead } = await request.json()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update alert read status
    const { error: updateError } = await supabase
      .from("policy_alerts")
      .update({ is_read: isRead })
      .eq("id", alertId)
      .eq("user_id", user.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating alert:", error)
    return NextResponse.json(
      { error: "Failed to update alert", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
