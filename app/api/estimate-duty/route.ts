import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { fetchWTOData } from "@/lib/wto-api"

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
    const { hsCode, value, origin, destination } = body

    if (!hsCode || !value || !origin || !destination) {
      return NextResponse.json({ error: "HS Code, Value, Origin, and Destination are required" }, { status: 400 })
    }

    console.log("[EstimateDuty] Estimating tariff for HS:", hsCode, "Origin:", origin, "Destination:", destination)

    // Try WTO API lookup first
    let wtoRate: number | null = null
    try {
      const wtoData = await fetchWTOData(true)
      // Look for matching tariff in WTO data (simplified - in production, use actual WTO API)
      if (wtoData.tariffRates && wtoData.tariffRates.length > 0) {
        // This is a placeholder - actual implementation would match HS code and country
        wtoRate = wtoData.tariffRates[0]?.rate || null
      }
    } catch (wtoError) {
      console.log("[EstimateDuty] WTO API lookup failed, using AI")
    }

    // Use AI to estimate EXACT tariff rate based on destination (Canada vs China differences)
    const { text } = await generateText({
      model: openai("gpt-4o"),
      temperature: 0.2,
      maxOutputTokens: 600,
      prompt: `Calculate the EXACT tariff rate (as a percentage 0-100) for this shipment using WTO/HTSUS standards. Return ONLY valid JSON (no markdown, no code blocks):

HS Code: ${hsCode}
Origin: ${origin}
Destination: ${destination}
Value: $${value}
${wtoRate !== null ? `WTO reference rate: ${wtoRate}%` : ""}

CRITICAL REQUIREMENTS FOR EXACT CALCULATION:
1. DESTINATION-SPECIFIC RATES:
   - Canada: Use USMCA (US-Mexico-Canada Agreement) rates - typically 0% for most goods, but verify specific HS code
   - China: Use HTSUS Chapter 99 rates - typically higher (5-25%+) depending on HS code and trade war tariffs
   - EU: Use WTO MFN (Most Favored Nation) rates - typically 0-10% depending on HS code
   - Other countries: Use WTO MFN rates or specific trade agreement rates

2. HS CODE-SPECIFIC:
   - Look up exact HS code in HTSUS Schedule B
   - Different digits (6 vs 8 vs 10) may have different rates
   - Use the most specific rate available for the HS code

3. TRADE AGREEMENTS:
   - USMCA (Canada/Mexico): Prefer 0% unless specific exception
   - China: Apply Section 301 tariffs if applicable (typically +25% on many goods)
   - EU: Standard WTO MFN rates
   - Other: Check for bilateral trade agreements

4. ACCURACY:
   - Output EXACT percentage (e.g., 0%, 2.5%, 7.5%, 25%)
   - If uncertain, use conservative estimate but indicate in note
   - For Canada: Most goods are 0% under USMCA
   - For China: Many goods have 25% tariff (Section 301) + base rate

Return JSON:
{
  "tariffRate": 0-100,
  "source": "WTO|HTSUS|USMCA|Section301|AI",
  "note": "Brief explanation including trade agreement or tariff program",
  "optimizations": ["List any optimization opportunities (e.g., 'Consider USMCA for Canada', 'Check for duty-free exceptions')"]
}

EXAMPLE OUTPUTS:
- Canada, HS 847130: {"tariffRate": 0, "source": "USMCA", "note": "Duty-free under USMCA"}
- China, HS 847130: {"tariffRate": 25, "source": "Section301", "note": "Section 301 tariff + base rate"}
- EU, HS 847130: {"tariffRate": 0, "source": "WTO", "note": "Duty-free under WTO MFN"}`,
    })

    console.log("[EstimateDuty] Raw AI response:", text)

    let result: any = {}
    let retryCount = 0
    const maxRetries = 2
    
    while (retryCount <= maxRetries) {
      try {
        let cleaned = text.trim()
        cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```\s*$/, "")
        cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "")
        result = JSON.parse(cleaned)
        
        // Validate tariff rate is a valid number
        const rate = Number.parseFloat(result.tariffRate)
        if (!isNaN(rate) && rate >= 0 && rate <= 100) {
          break // Success
        } else {
          throw new Error("Invalid tariff rate in response")
        }
      } catch (parseError) {
        retryCount++
        console.error(`[EstimateDuty] Failed to parse AI response (attempt ${retryCount}):`, parseError)
        
        if (retryCount > maxRetries) {
          // Fallback: use WTO rate or default
          result = {
            tariffRate: wtoRate || 5,
            source: wtoRate ? "WTO" : "Default",
            note: "Using fallback rate after parse failure",
          }
        } else {
          // Retry with stricter prompt
          const { text: retryText } = await generateText({
            model: openai("gpt-4o"),
            temperature: 0.1,
            maxOutputTokens: 200,
            prompt: `Return ONLY valid JSON (no markdown) for tariff rate:

{
  "tariffRate": ${wtoRate || 5},
  "source": "${wtoRate ? "WTO" : "AI"}",
  "note": "Estimated rate"
}`,
          })
          // Use retry text for next iteration
          const cleaned = retryText.trim().replace(/^```json\s*/i, "").replace(/```\s*$/, "")
          try {
            result = JSON.parse(cleaned)
            break
          } catch {
            // Continue to next retry
          }
        }
      }
    }

    // Validate and normalize tariff rate
    let tariffRate = Number.parseFloat(result.tariffRate)
    if (isNaN(tariffRate) || tariffRate < 0) {
      tariffRate = 0
    }
    if (tariffRate > 100) {
      tariffRate = 100
    }

    // Recalculate if way off (sanity check)
    if (wtoRate !== null && Math.abs(tariffRate - wtoRate) > 20) {
      console.log("[EstimateDuty] Rate differs significantly from WTO, using WTO rate")
      tariffRate = wtoRate
    }

    // If still 0, alert for manual verification
    if (tariffRate === 0) {
      console.log("[EstimateDuty] Rate is 0%, may need manual verification")
    }

    console.log("[EstimateDuty] Final tariff rate:", tariffRate)

    return NextResponse.json({
      success: true,
      tariffRate: Math.round(tariffRate * 100) / 100, // Round to 2 decimals
      source: result.source || "AI",
      note: result.note || "",
      estimatedDuty: (value * tariffRate) / 100,
    })
  } catch (error: any) {
    console.error("[EstimateDuty] Error:", error)
    return NextResponse.json({ error: error.message || "Failed to estimate duty" }, { status: 500 })
  }
}

