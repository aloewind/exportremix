import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { searchHSCodesByDescription, formatHSCodesForPrompt } from "@/lib/hs-codes"

export const dynamic = "force-dynamic"

// Validate and normalize HS code
function normalizeHSCode(code: string): string | null {
  if (!code) return null
  // Strip all non-numeric characters
  const normalized = code.replace(/[^\d]/g, "")
  // Must be 6-10 digits
  if (normalized.length >= 6 && normalized.length <= 10) {
    return normalized
  }
  return null
}

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
    const { description, origin, destination } = body

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 })
    }

    console.log("[SuggestHS] Suggesting HS code for:", description)

    // Get HS codes from HSCodeList.json reference first
    const jsonMatches = searchHSCodesByDescription(description, 10)
    let dbSuggestions: Array<{ code: string; description: string }> = jsonMatches.map((m) => ({
      code: m.code,
      description: m.description,
    }))
    
    console.log("[SuggestHS] Found", jsonMatches.length, "matches from HSCodeList.json")
    
    // Also try Supabase DB as supplement
    try {
      const { data: hsCodes } = await supabase
        .from("hs_codes_reference")
        .select("code, description")
        .ilike("description", `%${description}%`)
        .limit(10)

      if (hsCodes && hsCodes.length > 0) {
        // Merge with JSON results
        for (const item of hsCodes) {
          if (!dbSuggestions.find(s => s.code === item.code)) {
            dbSuggestions.push({
              code: item.code,
              description: item.description,
            })
          }
        }
      }
    } catch (dbError) {
      console.log("[SuggestHS] Supabase HS codes lookup failed, using JSON reference only")
    }

    // Use AI to suggest HS codes
    const { text } = await generateText({
      model: openai("gpt-4o"),
      temperature: 0.2,
      maxOutputTokens: 500,
      prompt: `Suggest the top 3 most accurate HS codes (6-10 digits, numeric only) for this product description. Use WTO/HTSUS standards, no assumptions. Return ONLY valid JSON (no markdown, no code blocks):

Product: ${description}
Origin: ${origin || "Not specified"}
Destination: ${destination || "Not specified"}

${dbSuggestions.length > 0 ? `HS Code Reference Matches from HSCodeList.json:\n${formatHSCodesForPrompt(jsonMatches)}\n` : ""}

Return JSON:
{
  "suggestions": [
    {
      "code": "6-10 digit numeric code",
      "confidence": 95,
      "description": "Brief description of classification"
    }
  ]
}

CRITICAL REQUIREMENTS:
- Codes must be 6-10 digits, numeric only (no letters, dots, dashes, spaces)
- Use WTO Harmonized System and HTSUS classification standards
- Confidence should be 0-100 (be conservative, only high confidence)
- Return top 3 matches ordered by confidence
- Prefer database matches if available
- If uncertain, indicate lower confidence`,
    })

    console.log("[SuggestHS] Raw AI response:", text)

    let aiSuggestions: any[] = []
    let retryCount = 0
    const maxRetries = 2
    
    while (retryCount <= maxRetries) {
      try {
        let cleaned = text.trim()
        cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```\s*$/, "")
        cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "")
        const parsed = JSON.parse(cleaned)
        aiSuggestions = parsed.suggestions || []
        
        // Validate suggestions have valid codes
        if (aiSuggestions.length > 0 && aiSuggestions.every(s => normalizeHSCode(s.code))) {
          break // Success
        }
      } catch (parseError) {
        retryCount++
        console.error(`[SuggestHS] Failed to parse AI response (attempt ${retryCount}):`, parseError)
        
        if (retryCount <= maxRetries) {
          // Retry with stricter prompt
          const { text: retryText } = await generateText({
            model: openai("gpt-4o"),
            temperature: 0.1,
            maxOutputTokens: 300,
            prompt: `Return ONLY valid JSON (no markdown) with HS code suggestions for: ${description}

{
  "suggestions": [
    {"code": "847130", "confidence": 90, "description": "Product classification"}
  ]
}`,
          })
          // Use retry text for next iteration
          const cleaned = retryText.trim().replace(/^```json\s*/i, "").replace(/```\s*$/, "")
          try {
            const parsed = JSON.parse(cleaned)
            aiSuggestions = parsed.suggestions || []
            break
          } catch {
            // Continue to next retry
          }
        }
      }
    }

    // Normalize and validate all suggestions
    const suggestions = aiSuggestions
      .map((s) => {
        const normalized = normalizeHSCode(s.code)
        if (!normalized) return null
        return {
          code: normalized,
          confidence: Math.min(100, Math.max(0, Number.parseInt(s.confidence) || 0)),
          description: s.description || "",
        }
      })
      .filter((s): s is { code: string; confidence: number; description: string } => s !== null)
      .slice(0, 3)

    // If no valid suggestions, retry with stricter prompt
    if (suggestions.length === 0) {
      console.log("[SuggestHS] No valid suggestions, retrying...")
      const { text: retryText } = await generateText({
        model: openai("gpt-4o"),
        temperature: 0.1,
        maxOutputTokens: 300,
        prompt: `Suggest ONE HS code (6-10 digits, NUMERIC ONLY, no letters or special characters) for: ${description}

Return ONLY the numeric code (e.g., "847130" or "0847120"), nothing else.`,
      })

      const retryCode = normalizeHSCode(retryText.trim())
      if (retryCode) {
        suggestions.push({
          code: retryCode,
          confidence: 75,
          description: "AI-suggested code",
        })
      }
    }

    if (suggestions.length === 0) {
      return NextResponse.json(
        { error: "Could not generate valid HS code suggestions. Please enter manually." },
        { status: 400 }
      )
    }

    console.log("[SuggestHS] Valid suggestions:", suggestions)

    return NextResponse.json({
      success: true,
      suggestions,
    })
  } catch (error: any) {
    console.error("[SuggestHS] Error:", error)
    return NextResponse.json({ error: error.message || "Failed to suggest HS code" }, { status: 500 })
  }
}

