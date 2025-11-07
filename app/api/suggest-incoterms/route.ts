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
    const { origin, destination, value, hsCode, description } = body

    if (!origin || !destination) {
      return NextResponse.json({ error: "Origin and destination are required" }, { status: 400 })
    }

    console.log("[SuggestIncoterms] Suggesting incoterms for:", origin, "→", destination)

    const { text } = await generateText({
      model: openai("gpt-4o"),
      temperature: 0.3,
      maxOutputTokens: 600,
      prompt: `Suggest the best Incoterm (International Commercial Terms) for this shipment. Return ONLY valid JSON (no markdown):

Origin: ${origin}
Destination: ${destination}
Value: $${value || "Not specified"}
HS Code: ${hsCode || "Not specified"}
Description: ${description || "Not specified"}

Common Incoterms 2020:
- EXW (Ex Works): Seller's premises, buyer handles all transport/customs
- FCA (Free Carrier): Seller delivers to carrier, buyer handles main transport
- CPT (Carriage Paid To): Seller pays transport to destination, buyer handles import
- CIP (Carriage and Insurance Paid): Like CPT + insurance
- DAP (Delivered At Place): Seller delivers to destination, buyer handles import
- DPU (Delivered at Place Unloaded): Like DAP + unloading
- DDP (Delivered Duty Paid): Seller handles everything including import duties

Return JSON:
{
  "recommended": "INCOTERM_CODE",
  "confidence": 0-100,
  "risk": "low|medium|high",
  "cost": "low|medium|high",
  "explanation": "Why this term is recommended",
  "alternatives": [
    {
      "term": "INCOTERM_CODE",
      "risk": "low|medium|high",
      "cost": "low|medium|high",
      "whenToUse": "When to use this term"
    }
  ]
}`,
    })

    console.log("[SuggestIncoterms] AI response:", text)

    let result: any = {}
    try {
      const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```\s*$/, "")
      result = JSON.parse(cleaned)
    } catch (parseError) {
      console.error("[SuggestIncoterms] Failed to parse AI response:", parseError)
      // Fallback recommendation
      result = {
        recommended: "DDP",
        confidence: 70,
        risk: "low",
        cost: "medium",
        explanation: "DDP provides maximum protection for buyer with seller handling all logistics",
        alternatives: [
          { term: "DAP", risk: "medium", cost: "low", whenToUse: "When buyer can handle import customs" },
          { term: "CIP", risk: "low", cost: "medium", whenToUse: "When buyer wants transport paid but handles import" },
        ],
      }
    }

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error: any) {
    console.error("[SuggestIncoterms] Error:", error)
    return NextResponse.json({ error: error.message || "Failed to suggest incoterms" }, { status: 500 })
  }
}

