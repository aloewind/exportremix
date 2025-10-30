import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { feedbackType, rating, comment, contextData } = body

    // Validate input
    if (!feedbackType || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid feedback data" }, { status: 400 })
    }

    // Insert feedback
    const { data, error } = await supabase
      .from("user_feedback")
      .insert({
        user_id: user.id,
        feedback_type: feedbackType,
        rating,
        comment: comment || null,
        context_data: contextData || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error submitting feedback:", error)
      return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      feedback: data,
    })
  } catch (error) {
    console.error("Feedback submission error:", error)
    return NextResponse.json(
      { error: "Failed to submit feedback", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
