import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

const VALID_VIBES = ["balanced", "nordic_calm", "zen_harmony", "dynamic_flow", "minimalist_clarity", "bold_energy"]

export async function GET() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { data: settings, error } = await supabase
      .from("user_settings")
      .select("vibe_preference")
      .eq("user_id", user.id)
      .single()

    if (error) {
      console.error("[v0] Failed to fetch vibe preference:", error)
      return NextResponse.json({ success: true, vibePreference: "balanced" })
    }

    return NextResponse.json({
      success: true,
      vibePreference: settings?.vibe_preference || "balanced",
    })
  } catch (error) {
    console.error("[v0] Error fetching vibe preference:", error)
    return NextResponse.json({ success: true, vibePreference: "balanced" })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { vibePreference } = body

    if (!vibePreference || !VALID_VIBES.includes(vibePreference)) {
      return NextResponse.json({ success: false, error: "Invalid vibe preference" }, { status: 400 })
    }

    // Check if user_settings row exists
    const { data: existing } = await supabase.from("user_settings").select("id").eq("user_id", user.id).single()

    if (existing) {
      // Update existing row
      const { error } = await supabase
        .from("user_settings")
        .update({ vibe_preference: vibePreference, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)

      if (error) {
        console.error("[v0] Failed to update vibe preference:", error)
        return NextResponse.json({ success: false, error: "Failed to save vibe preference" }, { status: 500 })
      }
    } else {
      // Insert new row
      const { error } = await supabase.from("user_settings").insert({
        user_id: user.id,
        vibe_preference: vibePreference,
      })

      if (error) {
        console.error("[v0] Failed to insert vibe preference:", error)
        return NextResponse.json({ success: false, error: "Failed to save vibe preference" }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      vibePreference,
      message: "Vibe preference saved successfully",
    })
  } catch (error) {
    console.error("[v0] Error saving vibe preference:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save vibe preference",
      },
      { status: 500 },
    )
  }
}
