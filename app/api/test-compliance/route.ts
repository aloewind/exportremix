import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { searchHSCodesByDescription, getHSCodeByCode, formatHSCodesForPrompt } from "@/lib/hs-codes"

export const dynamic = "force-dynamic"

function validateHSCode(code: string): boolean {
  if (!code) return false
  const normalized = code.replace(/[^\d]/g, "")
  return normalized.length >= 6 && normalized.length <= 10
}

function validateValue(value: string | number): boolean {
  const num = typeof value === "string" ? Number.parseFloat(value) : value
  return !isNaN(num) && num >= 0
}

function validateQuantity(quantity: string | number): boolean {
  const num = typeof quantity === "string" ? Number.parseFloat(quantity) : quantity
  return !isNaN(num) && num > 0
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
    // Extract ALL manifest fields
    const {
      description, hsCode, quantity, value, valueFOB, valueCIF, origin, destination, uom, weight, weightGross, weightNet,
      usppiName, usppiId, exporterName, exporterAddress, consigneeName, consigneeAddress,
      notifyPartyName, notifyPartyAddress, incoterms, bolNumber, carrierName, scacCode,
      vesselFlightNumber, exportDate, licensePermitInfo, eccn, hazardousMaterial,
      packagingType, packagingNumber, insuranceValue, freightCharges, dutiesTariffsEstimate,
      scheduleBNumber, signatureCertification, notes
    } = body

    console.log("[TestCompliance] Testing compliance for manifest data with ALL fields")

    // Use valueFOB or value (backward compatibility)
    const actualValue = valueFOB || value

    // Comprehensive validation for ALL fields
    const breakdown = {
      hsCode: validateHSCode(hsCode),
      tariff: true, // Will be validated by AI
      value: validateValue(actualValue),
      quantity: validateQuantity(quantity),
      origin: !!origin && origin.trim().length > 0,
      destination: !!destination && destination.trim().length > 0,
      description: !!description && description.trim().length > 0,
      usppiName: !!usppiName && usppiName.trim().length > 0,
      consigneeName: !!consigneeName && consigneeName.trim().length > 0,
      incoterms: !incoterms || (incoterms.trim().length > 0 && /^(FOB|CIF|EXW|DDP|DAP|DAT|CPT|CIP|FCA|FAS|CFR|DDU)$/i.test(incoterms)),
      exportDate: !exportDate || (exportDate.trim().length > 0),
    }

    const errors: Array<{
      field: string
      message: string
      severity: "critical" | "high" | "medium" | "low"
    }> = []

    if (!breakdown.hsCode) {
      errors.push({
        field: "hsCode",
        message: "HS Code must be 6-10 digits (numeric only)",
        severity: "critical",
      })
    }

    if (!breakdown.value) {
      errors.push({
        field: "value",
        message: "Value (FOB or value) must be a valid number ≥ 0",
        severity: "critical",
      })
    }

    if (!breakdown.quantity) {
      errors.push({
        field: "quantity",
        message: "Quantity must be a valid number > 0",
        severity: "high",
      })
    }

    if (!breakdown.origin) {
      errors.push({
        field: "origin",
        message: "Origin country is required",
        severity: "critical",
      })
    }

    if (!breakdown.destination) {
      errors.push({
        field: "destination",
        message: "Destination country is required",
        severity: "critical",
      })
    }

    if (!breakdown.description) {
      errors.push({
        field: "description",
        message: "Commodity description is required",
        severity: "critical",
      })
    }

    if (!breakdown.usppiName) {
      errors.push({
        field: "usppiName",
        message: "USPPI Name is required for US exports",
        severity: "critical",
      })
    }

    if (!breakdown.consigneeName) {
      errors.push({
        field: "consigneeName",
        message: "Consignee Name is required",
        severity: "critical",
      })
    }

    if (incoterms && !breakdown.incoterms) {
      errors.push({
        field: "incoterms",
        message: "Invalid Incoterms code. Must be one of: FOB, CIF, EXW, DDP, DAP, DAT, CPT, CIP, FCA, FAS, CFR, DDU",
        severity: "medium",
      })
    }

    // Query HS codes reference for validation
    let hsCodeValidated = false
    let tariffRate: number | null = null
    let hsCodeReference: string = ""
    
    if (hsCode) {
      const normalizedHS = hsCode.replace(/[^\d]/g, "")
      if (normalizedHS.length >= 6 && normalizedHS.length <= 10) {
        // Check HS codes reference JSON
        const hsMatch = getHSCodeByCode(normalizedHS.substring(0, 4))
        if (hsMatch) {
          hsCodeValidated = true
          hsCodeReference = `${hsMatch.code}: ${hsMatch.description}`
          console.log("[TestCompliance] Found HS code in reference:", hsCodeReference)
        } else {
          hsCodeValidated = true // Valid format but not in reference
        }
      }
      
      // Also try Supabase DB as fallback
      try {
        const { data: hsRef } = await supabase
          .from("hs_codes_reference")
          .select("code, tariff_rate")
          .eq("code", normalizedHS)
          .single()
        
        if (hsRef?.tariff_rate) {
          tariffRate = Number.parseFloat(hsRef.tariff_rate)
        }
      } catch (dbError) {
        // Ignore DB errors, use JSON reference
      }
    }
    
    // Search for matching HS codes based on description
    let suggestedHSCodes: string = ""
    if (description && !hsCodeValidated) {
      const matches = searchHSCodesByDescription(description, 5)
      if (matches.length > 0) {
        suggestedHSCodes = formatHSCodesForPrompt(matches)
        console.log("[TestCompliance] Found", matches.length, "HS code suggestions from reference")
      }
    }

    // Use AI for comprehensive compliance check with strict validation of ALL fields
    const { text } = await generateText({
      model: openai("gpt-4o"),
      temperature: 0.2,
      maxOutputTokens: 2000,
      prompt: `Test export manifest compliance against WCO/HTS/WTO/CBP standards for ALL fields. Use WTO/HTSUS standards, no assumptions. Return ONLY valid JSON (no markdown, no code blocks):

COMPLETE MANIFEST DATA:
- USPPI Name: ${usppiName || "Not provided"}
- USPPI ID: ${usppiId || "Not provided"}
- Exporter Name: ${exporterName || "Not provided"}
- Exporter Address: ${exporterAddress || "Not provided"}
- Consignee Name: ${consigneeName || "Not provided"}
- Consignee Address: ${consigneeAddress || "Not provided"}
- Notify Party Name: ${notifyPartyName || "Not provided"}
- Notify Party Address: ${notifyPartyAddress || "Not provided"}
- Description: ${description || "Not provided"}
- HS Code: ${hsCode || "Not provided"}
- Schedule B Number: ${scheduleBNumber || "Not provided"}
- Quantity: ${quantity || "Not provided"}
- UOM: ${uom || "Not provided"}
- Gross Weight: ${weightGross || weight || "Not provided"} kg
- Net Weight: ${weightNet || "Not provided"} kg
- Value FOB: $${valueFOB || value || "Not provided"}
- Value CIF: $${valueCIF || "Not provided"}
- Origin: ${origin || "Not provided"}
- Destination: ${destination || "Not provided"}
- Incoterms: ${incoterms || "Not provided"}
- BOL Number: ${bolNumber || "Not provided"}
- Carrier Name: ${carrierName || "Not provided"}
- SCAC Code: ${scacCode || "Not provided"}
- Vessel/Flight Number: ${vesselFlightNumber || "Not provided"}
- Export Date: ${exportDate || "Not provided"}
- License/Permit Info: ${licensePermitInfo || "Not provided"}
- ECCN: ${eccn || "Not provided"}
- Hazardous Material: ${hazardousMaterial ? "Yes" : "No"}
- Packaging Type: ${packagingType || "Not provided"}
- Packaging Number: ${packagingNumber || "Not provided"}
- Insurance Value: $${insuranceValue || "Not provided"}
- Freight Charges: $${freightCharges || "Not provided"}
- Duties/Tariffs Estimate: $${dutiesTariffsEstimate || "Not provided"}
- Signature/Certification: ${signatureCertification || "Not provided"}
- Notes: ${notes || "Not provided"}
${tariffRate !== null ? `- Reference Tariff Rate: ${tariffRate}%` : ""}
${hsCodeReference ? `- HS Code Reference: ${hsCodeReference}` : ""}
${suggestedHSCodes ? `\nSuggested HS Codes from Reference:\n${suggestedHSCodes}` : ""}

CRITICAL VALIDATION RULES FOR ALL FIELDS:
1. HS Code: Must be exactly 6-10 digits, numeric only (no letters, dots, dashes). If invalid format, mark as critical error.
2. Tariff Rate: Must be > 0% and < 100% (unless verified free trade agreement like USMCA). If 0% or missing, mark as high severity error requiring verification.
3. Required Fields (CRITICAL): description, hsCode, quantity, value (FOB or value), origin, destination, usppiName, consigneeName must all be present and non-empty.
4. Value: Must be > 0 (cannot be zero or negative). Check both valueFOB and valueCIF if provided.
5. Quantity: Must be > 0 (cannot be zero or negative).
6. Origin/Destination: Must be valid ISO country codes (2-3 letters, e.g., US, CN, CA, EU).
7. Incoterms: If provided, must be valid (FOB, CIF, EXW, DDP, DAP, DAT, CPT, CIP, FCA, FAS, CFR, DDU). Check for compliance risks.
8. USPPI Information: USPPI Name is required for US exports. USPPI ID (EIN) should be provided if available.
9. Consignee: Consignee Name is required. Address should be provided.
10. Export Date: Should be valid date format if provided.
11. BOL/Carrier: BOL Number and Carrier Name should be provided for shipping compliance.
12. Weight: If provided, must be > 0. Gross weight typically required.
13. Packaging: If quantity > 1, packaging details should be provided.
14. ECCN/License: If exporting controlled goods, ECCN or license info must be provided.
15. Hazardous Material: If marked as hazardous, proper documentation and labeling requirements must be met.

Return JSON:
{
  "score": 0-100,
  "confidence": 0-100,
  "errors": [
    {
      "field": "field name",
      "message": "specific issue",
      "severity": "critical|high|medium|low"
    }
  ],
  "warnings": ["warning messages"],
  "recommendations": ["recommendation messages"],
  "details": "Overall compliance assessment"
}

SCORING CRITERIA (strict):
- 100: Fully compliant - HS code valid (6-10 digits numeric), tariff > 0% verified, all required fields present, values > 0, valid country codes, no issues
- 90-99: Minor issues - mostly compliant but minor warnings
- 70-89: Some issues - missing optional fields or minor validation issues
- 50-69: Multiple issues - missing required fields or invalid formats
- 0-49: Critical issues - invalid HS code, missing critical fields, zero tariff without verification

CONFIDENCE THRESHOLD:
- Must be > 90% to pass (score 100)
- If confidence < 90%, reduce score accordingly

COMPREHENSIVE VALIDATION CHECKLIST (ALL FIELDS):
✓ HS Code: 6-10 digits, numeric only
✓ Tariff Rate: > 0% (or verified FTA exemption like USMCA)
✓ Description: Present and non-empty
✓ Quantity: > 0
✓ Value (FOB/CIF): > 0
✓ Origin: Valid ISO country code
✓ Destination: Valid ISO country code
✓ USPPI Name: Present (required for US exports)
✓ Consignee Name: Present
✓ UOM: Consistent with quantity (if provided)
✓ Incoterms: Valid and compliant (if provided)
✓ Export Date: Valid date format (if provided)
✓ BOL Number: Present (if shipping)
✓ Carrier Name: Present (if shipping)
✓ Weight: > 0 if provided
✓ Packaging: Consistent with quantity (if provided)
✓ ECCN/License: Present if controlled goods
✓ Hazardous Material: Properly documented if marked`,
    })

    console.log("[TestCompliance] Raw AI response:", text)

    let aiResult: any = {}
    let retryCount = 0
    const maxRetries = 2
    
    while (retryCount <= maxRetries) {
      try {
        let cleaned = text.trim()
        // Remove markdown code blocks
        cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```\s*$/, "")
        cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "")
        aiResult = JSON.parse(cleaned)
        
        // Validate required fields in response
        if (typeof aiResult.score !== "number" || aiResult.score < 0 || aiResult.score > 100) {
          throw new Error("Invalid score in AI response")
        }
        
        break // Successfully parsed
      } catch (parseError) {
        retryCount++
        console.error(`[TestCompliance] Failed to parse AI response (attempt ${retryCount}):`, parseError)
        
        if (retryCount > maxRetries) {
          // Fallback scoring
          const validFields = Object.values(breakdown).filter((v) => v).length
          const totalFields = Object.keys(breakdown).length
          aiResult = {
            score: Math.round((validFields / totalFields) * 100),
            confidence: 50,
            errors: errors,
            warnings: [],
            recommendations: [],
            details: "Fallback scoring due to parsing error",
          }
        } else {
          // Retry with stricter prompt
          const { text: retryText } = await generateText({
            model: openai("gpt-4o"),
            temperature: 0.1,
            maxOutputTokens: 500,
            prompt: `Return ONLY valid JSON (no markdown, no explanations) for compliance test:

{
  "score": ${Math.round((Object.values(breakdown).filter((v) => v).length / Object.keys(breakdown).length) * 100)},
  "confidence": 85,
  "errors": ${JSON.stringify(errors)},
  "warnings": [],
  "recommendations": [],
  "details": "Compliance check completed"
}`,
          })
          // Use retry text for next iteration
          const cleaned = retryText.trim().replace(/^```json\s*/i, "").replace(/```\s*$/, "")
          aiResult = JSON.parse(cleaned)
          break
        }
      }
    }

    // Merge errors
    const allErrors = [...errors, ...(aiResult.errors || [])]

    // Check tariff validity - add error if tariff is 0% or missing
    if (tariffRate === 0 || (tariffRate === null && hsCode)) {
      allErrors.push({
        field: "tariff",
        message: "Tariff rate is 0% or missing - requires verification for compliance",
        severity: "high",
      })
      breakdown.tariff = false
    } else if (tariffRate !== null && tariffRate > 0) {
      breakdown.tariff = true
    }

    // Calculate final score with confidence threshold
    let score = aiResult.score || 0
    const confidence = aiResult.confidence || 0
    
    // Apply confidence threshold - must be > 90% for perfect score
    if (score === 100 && confidence < 90) {
      score = Math.min(95, score - (90 - confidence))
      console.log(`[TestCompliance] Score reduced due to low confidence: ${confidence}%`)
    }
    
    // Apply error-based penalties
    const criticalErrors = allErrors.filter((e) => e.severity === "critical").length
    const highErrors = allErrors.filter((e) => e.severity === "high").length
    
    if (criticalErrors > 0) {
      score = Math.min(score, 60)
    }
    if (highErrors > 0) {
      score = Math.min(score, 80)
    }
    
    // Ensure score reflects actual compliance
    if (score === 100 && allErrors.length > 0) {
      score = Math.max(90, score - (allErrors.length * 5))
    }

    // Update breakdown based on errors
    allErrors.forEach((error) => {
      if (error.field in breakdown) {
        ;(breakdown as any)[error.field] = false
      }
    })

    console.log("[TestCompliance] Final score:", score, "Confidence:", confidence, "Errors:", allErrors.length)

    return NextResponse.json({
      success: true,
      score: Math.max(0, Math.min(100, score)),
      confidence: confidence,
      breakdown,
      errors: allErrors,
      warnings: aiResult.warnings || [],
      recommendations: aiResult.recommendations || [],
      details: aiResult.details || (score === 100 ? "All compliant" : "Issues found requiring fixes"),
    })
  } catch (error: any) {
    console.error("[TestCompliance] Error:", error)
    return NextResponse.json({ error: error.message || "Failed to test compliance" }, { status: 500 })
  }
}

