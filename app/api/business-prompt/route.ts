import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Business prompt API called")

    // Verify authentication
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[v0] Authentication failed:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] User authenticated:", user.email)

    // Parse request body
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== "string") {
      console.error("[v0] Invalid prompt provided")
      return NextResponse.json({ error: "Invalid prompt" }, { status: 400 })
    }

    console.log("[v0] Processing business prompt:", prompt)

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("[v0] OpenAI API key not configured")
      return NextResponse.json(
        {
          error: "AI service not configured",
          message: "OpenAI API key is missing. Please add OPENAI_API_KEY to your environment variables.",
        },
        { status: 500 },
      )
    }

    console.log("[v0] ✅ ChatGPT-4o Active - Processing business query")

    // Call ChatGPT-4o with the business prompt
    const { text } = await generateText({
      model: openai("gpt-4o"),
      temperature: 0.7,
      maxOutputTokens: 2000,
      prompt: `You are an AI assistant specialized in export, trade, and logistics. 

The user has submitted the following business query related to exports, tariffs, manifests, or trade compliance:

"${prompt}"

Provide a detailed, professional response that:
1. Directly addresses their query with specific, actionable information
2. Includes relevant data points, regulations, or best practices
3. Suggests next steps or recommendations
4. Uses clear, business-appropriate language

If the query involves:
- Tariff predictions: Provide analysis based on current trade policies and historical trends
- Manifest optimization: Suggest cost-saving strategies and compliance improvements
- HS codes: Explain classification requirements and potential issues
- Route optimization: Consider cost, time, and risk factors
- Compliance: Reference relevant regulations and standards

Keep your response concise but comprehensive (aim for 200-400 words).`,
    })

    console.log("[v0] ChatGPT-4o response received successfully")

    // Log usage for analytics
    await supabase.from("usage_logs").insert({
      user_id: user.id,
      action_type: "business_prompt",
      metadata: { prompt: prompt.substring(0, 100) },
    })

    return NextResponse.json({
      success: true,
      response: text,
      model: "gpt-4o",
    })
  } catch (error) {
    console.error("[v0] Business prompt API error:", error)
    return NextResponse.json(
      {
        error: "Failed to process prompt",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
