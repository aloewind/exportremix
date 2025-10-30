import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { session_id, page } = await request.json()

    if (!session_id || !page) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log("[v0] Service role key not configured, skipping A/B conversion tracking")
      return NextResponse.json({ success: true, skipped: true })
    }

    // Use service role to bypass RLS
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { error } = await supabase
      .from("ab_tests")
      .update({
        converted: true,
        converted_at: new Date().toISOString(),
      })
      .eq("session_id", session_id)
      .eq("page", page)

    if (error) {
      if (error.code === "42501" || error.message?.includes("row-level security")) {
        console.log("[v0] RLS policy blocking update - table may need setup. Skipping tracking.")
        return NextResponse.json({ success: true, skipped: true })
      }
      console.error("[v0] Error tracking A/B conversion:", error)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error in A/B conversion tracking API:", error)
    return NextResponse.json({ success: true })
  }
}
