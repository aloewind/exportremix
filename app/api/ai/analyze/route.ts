import { NextResponse } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"
import { checkUsageLimit, trackUsage } from "@/lib/usage-tracker"
import { getOpenAIClient, getMockAnalysisData } from "@/lib/openai-client"

const manifestAnalysisSchema = z.object({
  alerts: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["critical", "warning", "info"]),
      title: z.string(),
      message: z.string(),
      timestamp: z.string(),
      affectedShipments: z.number().optional(),
    }),
  ),
  insights: z.object({
    totalShipments: z.number(),
    riskScore: z.number().min(0).max(100),
    predictedSavings: z.number(),
    optimizationRate: z.number().min(0).max(100),
    keyFindings: z.array(z.string()),
  }),
  predictions: z.array(
    z.object({
      category: z.string(),
      prediction: z.string(),
      confidence: z.number().min(0).max(100),
      impact: z.enum(["high", "medium", "low"]),
    }),
  ),
})

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { allowed, remaining, limit } = await checkUsageLimit(user.id, "ai_analysis")

    if (!allowed) {
      return NextResponse.json(
        {
          error: "Usage limit exceeded",
          limit,
          remaining,
        },
        { status: 429 },
      )
    }

    const body = await request.json()
    const { manifestData, vibePreference } = body

    const { data: customAPIs } = await supabase
      .from("custom_apis")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)

    const customAPIsArray = customAPIs ?? []

    const vibeStyle = vibePreference || "professional"

    let analysisResult
    let usingMocks = false
    const vibeStyles: Record<string, string> = {
      balanced: "Provide balanced, comprehensive analysis with equal focus on all aspects.",
      nordic_calm:
        "Present findings with minimalist clarity and calm precision. Use concise language and focus on essential insights.",
      zen_harmony:
        "Frame analysis with peaceful, flowing language. Emphasize natural patterns and harmonious solutions.",
      dynamic_flow: "Use energetic, action-oriented language. Highlight urgent opportunities and bold recommendations.",
      minimalist_clarity:
        "Be extremely concise and focused. Present only the most critical insights with no embellishment.",
      bold_energy:
        "Use powerful, impactful language. Emphasize high-priority actions and transformative opportunities.",
      professional: "Maintain a formal and precise tone throughout the analysis.",
    }

    try {
      const openai = getOpenAIClient()

      const customAPIContext =
        customAPIsArray.length > 0
          ? `\n\nAdditional data from custom API integrations:\n${JSON.stringify(customAPIsArray, null, 2)}`
          : ""

      const prompt = `Analyze this logistics manifest data and provide predictions for tariff surges, delays, and optimization opportunities. 
      
Manifest Data:
${JSON.stringify(manifestData.slice(0, 10), null, 2)}

Total shipments: ${manifestData.length}${customAPIContext}

STYLE PREFERENCE: ${vibeStyle}

Provide:
1. Critical alerts (especially look for tariff surge patterns - if you detect potential tariff increases, create an alert with "Tariff surge: X% incoming" where X is your predicted percentage)
2. Risk analysis and optimization insights
3. Predictions for supply chain disruptions

${customAPIsArray.length > 0 ? "Incorporate insights from the custom API data provided above." : ""}

Be specific and actionable. Focus on real logistics concerns like customs delays, tariff changes, route optimization, and cost savings.
Adapt your tone and presentation to match the style preference above.

DISCLAIMER: This analysis uses estimates from public sources and should not be considered legal or financial advice.

Return your response as a JSON object matching this schema:
{
  "alerts": [{"id": "string", "type": "critical|warning|info", "title": "string", "message": "string", "timestamp": "ISO string", "affectedShipments": number}],
  "insights": {"totalShipments": number, "riskScore": number (0-100), "predictedSavings": number, "optimizationRate": number (0-100), "keyFindings": ["string"]},
  "predictions": [{"category": "string", "prediction": "string", "confidence": number (0-100), "impact": "high|medium|low"}]
}`

      const response = await openai.chat.completions.create({
        model: "gpt-4o-legacy",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0.7,
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error("No response from OpenAI")
      }

      analysisResult = JSON.parse(content)
    } catch (error) {
      console.error("[v0] OpenAI API failed, using mock data:", error)
      analysisResult = getMockAnalysisData()
      usingMocks = true
    }

    await trackUsage(user.id, "ai_analysis")

    return NextResponse.json({
      success: true,
      ...analysisResult,
      usingMocks,
      vibeApplied: vibePreference,
      customAPIsUsed: customAPIsArray.length,
      usage: {
        remaining: remaining - 1,
        limit,
      },
    })
  } catch (error) {
    console.error("[v0] AI analysis error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Analysis failed",
      },
      { status: 500 },
    )
  }
}
