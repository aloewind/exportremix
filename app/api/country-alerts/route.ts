import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { origin, destination, hsCode } = body

    if (!origin || !destination) {
      return NextResponse.json({ error: "Origin and destination are required" }, { status: 400 })
    }

    console.log("[CountryAlerts] Checking regulations for:", origin, "→", destination)

    const { text } = await generateText({
      model: openai("gpt-4o"),
      temperature: 0.2,
      maxOutputTokens: 800,
      prompt: `Check for country-specific export/import regulations, restrictions, bans, license requirements, and de minimis thresholds. Return ONLY valid JSON (no markdown):

Origin Country: ${origin}
Destination Country: ${destination}
HS Code: ${hsCode || "Not specified"}

Check for:
1. Export bans or restrictions from origin
2. Import bans or restrictions to destination
3. License/permit requirements
4. De minimis thresholds (value below which no duty/tax)
5. Special documentation requirements
6. Embargoes or sanctions

Return JSON:
{
  "alerts": [
    {
      "type": "ban|restriction|license|de_minimis|documentation|embargo",
      "severity": "critical|high|medium|low",
      "title": "Alert title",
      "message": "Detailed message",
      "action": "Required action or recommendation"
    }
  ],
  "deMinimis": {
    "value": "USD amount or null",
    "currency": "USD",
    "note": "Explanation"
  },
  "licenses": [
    {
      "type": "Export|Import|Both",
      "required": true|false,
      "description": "License description"
    }
  ]
}`,
    })

    console.log("[CountryAlerts] AI response:", text)

    let result: any = {}
    try {
      const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```\s*$/, "")
      result = JSON.parse(cleaned)
    } catch (parseError) {
      console.error("[CountryAlerts] Failed to parse AI response:", parseError)
      // Fallback: basic structure
      result = {
        alerts: [],
        deMinimis: { value: null, currency: "USD", note: "Check destination country customs" },
        licenses: [],
      }
    }

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error: any) {
    console.error("[CountryAlerts] Error:", error)
    return NextResponse.json({ error: error.message || "Failed to check country alerts" }, { status: 500 })
  }
}

