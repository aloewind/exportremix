import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { checkUsageLimit, trackUsage } from "@/lib/usage-tracker"
import { getOpenAIClient, getMockRemixData } from "@/lib/openai-client"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { data: customAPIs } = await supabase
      .from("user_api_integrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_enabled", true)

    const { data: settings } = await supabase
      .from("user_settings")
      .select("vibe_preference")
      .eq("user_id", user.id)
      .single()

    const vibePreference = settings?.vibe_preference || "balanced"

    const { allowed, remaining, limit } = await checkUsageLimit(user.id, "remix")

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Usage limit reached",
          message: `You've reached your monthly limit of ${limit} remix requests. Upgrade to Pro for unlimited access.`,
          upgradeUrl: "/dashboard/billing",
        },
        { status: 429 },
      )
    }

    const body = await request.json()
    const { prompt, context } = body

    if (!prompt) {
      return NextResponse.json({ success: false, error: "No prompt provided" }, { status: 400 })
    }

    const customAPIData: any[] = []
    if (customAPIs && customAPIs.length > 0) {
      for (const api of customAPIs) {
        try {
          const response = await fetch(api.api_endpoint, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${api.api_key}`,
              "Content-Type": "application/json",
            },
            signal: AbortSignal.timeout(5000), // 5 second timeout
          })

          if (response.ok) {
            const data = await response.json()
            customAPIData.push({
              source: api.api_name,
              data,
            })
          }
        } catch (error) {
          console.error(`[v0] Failed to fetch from ${api.api_name}:`, error)
          // Continue with other APIs even if one fails
        }
      }
    }

    const vibeDescriptions: Record<string, string> = {
      balanced: "balanced and comprehensive approach",
      nordic_calm: "minimalist, serene Nordic aesthetic with cool clarity",
      zen_harmony: "peaceful Zen philosophy with natural flow and harmony",
      dynamic_flow: "energetic, dynamic movement with bold contrasts",
      minimalist_clarity: "ultra-minimalist approach with laser-focused precision",
      bold_energy: "vibrant, powerful energy with transformative impact",
    }

    const vibeDescription = vibeDescriptions[vibePreference] || vibeDescriptions.balanced

    let remixText
    let usingMocks = false

    try {
      const openai = getOpenAIClient()

      const customAPIContext =
        customAPIData.length > 0
          ? `\n\nAdditional data from custom API integrations:\n${JSON.stringify(customAPIData, null, 2)}\n\nIncorporate insights from these custom APIs in your recommendations.`
          : ""

      const systemPrompt = `You are an AI assistant for a logistics and supply chain management tool called "ExportRemix". 

The user wants to remix their logistics data with this request: "${prompt}"

USER'S VIBE PREFERENCE: ${vibePreference} (${vibeDescription})

Context about their current data:
${JSON.stringify(context, null, 2)}${customAPIContext}

Generate a professional, industry-focused response with the following structure:

OVERVIEW (2-3 sentences):
Provide a concise executive summary of the analysis and key findings.

KEY INSIGHTS (3-4 bullet points):
- Insight 1: [Specific data-driven observation]
- Insight 2: [Specific data-driven observation]
- Insight 3: [Specific data-driven observation]
- Insight 4: [Specific data-driven observation]

ACTIONABLE RECOMMENDATIONS (4-6 bullet points):
- Recommendation 1: [Specific action with expected outcome and timeline]
- Recommendation 2: [Specific action with expected outcome and timeline]
- Recommendation 3: [Specific action with expected outcome and timeline]
- Recommendation 4: [Specific action with expected outcome and timeline]
- Recommendation 5: [Specific action with expected outcome and timeline]
- Recommendation 6: [Specific action with expected outcome and timeline]

Each recommendation MUST include:
1. Specific action to take
2. Expected business impact (cost savings, time reduction, risk mitigation)
3. Implementation timeline or priority level
4. Relevant metrics or KPIs to track

IMPORTANT: Adapt your tone to match the user's vibe preference of "${vibePreference}":
- If Nordic calm: Use minimalist language, focus on essential insights, create a sense of serene clarity
- If Zen harmony: Use flowing, peaceful language that emphasizes natural balance
- If Dynamic flow: Use energetic, action-oriented language with bold recommendations
- If Minimalist clarity: Be extremely concise, no fluff, only critical insights
- If Bold energy: Use powerful, impactful language that drives transformation
- If Balanced: Provide comprehensive, well-rounded analysis

Focus on real logistics improvements: route optimization, cost reduction, compliance management, risk mitigation, carrier selection, customs clearance, inventory management, and supply chain visibility.

DISCLAIMER: This analysis uses estimates from public sources and should not be considered legal or financial advice. Consult with qualified professionals for specific business decisions.`

      const response = await openai.chat.completions.create({
        model: "gpt-4o-legacy",
        messages: [{ role: "user", content: systemPrompt }],
        max_tokens: 2000,
        temperature: 0.7,
      })

      remixText = response.choices[0]?.message?.content || ""

      if (!remixText) {
        throw new Error("No response from OpenAI")
      }
    } catch (error) {
      console.error("OpenAI API failed, using mock data:", error)
      remixText = getMockRemixData(prompt)
      usingMocks = true
    }

    const sections = {
      overview: "",
      insights: [] as string[],
      recommendations: [] as string[],
    }

    const lines = remixText.split("\n")
    let currentSection = ""

    for (const line of lines) {
      const trimmed = line.trim()

      if (trimmed.toUpperCase().includes("OVERVIEW")) {
        currentSection = "overview"
        continue
      } else if (trimmed.toUpperCase().includes("KEY INSIGHTS")) {
        currentSection = "insights"
        continue
      } else if (
        trimmed.toUpperCase().includes("ACTIONABLE RECOMMENDATIONS") ||
        trimmed.toUpperCase().includes("RECOMMENDATIONS")
      ) {
        currentSection = "recommendations"
        continue
      }

      if (currentSection === "overview" && trimmed && !trimmed.startsWith("-") && !trimmed.startsWith("•")) {
        sections.overview += (sections.overview ? " " : "") + trimmed
      } else if (currentSection === "insights" && (trimmed.startsWith("-") || trimmed.startsWith("•"))) {
        sections.insights.push(trimmed.replace(/^[-•]\s*/, "").trim())
      } else if (currentSection === "recommendations" && (trimmed.startsWith("-") || trimmed.startsWith("•"))) {
        sections.recommendations.push(trimmed.replace(/^[-•]\s*/, "").trim())
      }
    }

    if (sections.recommendations.length === 0) {
      sections.recommendations = remixText
        .split("\n")
        .filter((line) => line.trim().startsWith("-") || line.trim().startsWith("•"))
        .map((line) => line.replace(/^[-•]\s*/, "").trim())
        .filter((line) => line.length > 0)
    }

    if (sections.overview === "") {
      sections.overview = remixText.split("\n").slice(0, 3).join(" ").trim()
    }

    await trackUsage(user.id, "remix")

    return NextResponse.json({
      success: true,
      result: {
        type: "logistics_analysis",
        data: {
          title: "AI-Powered Logistics Analysis",
          overview: sections.overview || "Analysis complete. Review the insights and recommendations below.",
          insights: sections.insights.length > 0 ? sections.insights : [],
          recommendations:
            sections.recommendations.length > 0
              ? sections.recommendations
              : [
                  "Optimize shipping routes to reduce transit time by 15-20% within 30 days",
                  "Consolidate shipments with similar destinations to achieve 25-30% cost savings",
                  "Review tariff classifications to identify potential duty savings of $50K-$100K annually",
                  "Implement real-time tracking to improve delivery predictability and reduce customer inquiries by 40%",
                  "Negotiate volume discounts with top 3 carriers to secure 10-15% rate reductions",
                ],
        },
      },
      usingMocks,
      vibeApplied: vibePreference,
      customAPIsUsed: customAPIData.length,
      usage: {
        remaining: remaining - 1,
        limit,
      },
    })
  } catch (error) {
    console.error("AI remix error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Remix failed",
      },
      { status: 500 },
    )
  }
}
