import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { parseStringPromise } from "xml2js"

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
    const { xmlContent, fileName } = body

    if (!xmlContent) {
      return NextResponse.json({ error: "XML content is required" }, { status: 400 })
    }

    console.log("[ExtractData] Parsing XML content...")

    // Parse XML using xml2js
    let parsedXml: any
    try {
      parsedXml = await parseStringPromise(xmlContent, { explicitArray: false, mergeAttrs: true })
    } catch (parseError) {
      console.error("[ExtractData] XML parse error:", parseError)
      return NextResponse.json({ error: "Invalid XML format" }, { status: 400 })
    }

    console.log("[ExtractData] XML parsed successfully")

    // Extract data from parsed XML
    const item = parsedXml.manifest?.item || parsedXml.manifest?.Item || parsedXml.item || parsedXml.Item

    // Use AI to extract ALL manifest fields from XML structure
    const { text } = await generateText({
      model: openai("gpt-4o"),
      temperature: 0.2,
      maxOutputTokens: 2000,
      prompt: `Extract ALL possible manifest data fields from this XML structure for US export company manifest. Return ONLY valid JSON (no markdown, no code blocks):

XML Structure:
${JSON.stringify(parsedXml, null, 2)}

Extract ALL standard US export manifest fields (CBP/WTO standards):
- usppiName: USPPI (US Principal Party in Interest) Name
- usppiId: USPPI ID (EIN/Tax ID)
- exporterName: Exporter Name
- exporterAddress: Exporter Address
- consigneeName: Consignee Name
- consigneeAddress: Consignee Address
- notifyPartyName: Notify Party Name (if applicable)
- notifyPartyAddress: Notify Party Address (if applicable)
- description: Commodity Description
- hsCode: HS Code (6-10 digits, numeric only)
- scheduleBNumber: Schedule B Number (if available)
- quantity: Quantity
- uom: Unit of Measure (PCS, KG, LTR, etc.)
- weightGross: Gross Weight (kg)
- weightNet: Net Weight (kg)
- valueFOB: Value FOB (USD)
- valueCIF: Value CIF (USD)
- origin: Country of Origin
- destination: Ultimate Destination Country
- incoterms: Incoterms (FOB, CIF, EXW, DDP, etc.)
- bolNumber: Bill of Lading/Air Waybill Number
- carrierName: Carrier Name
- scacCode: SCAC Code (if available)
- vesselFlightNumber: Vessel/Flight Number
- exportDate: Export Date
- licensePermitInfo: License/Permit Info (if controlled)
- eccn: ECCN (Export Control Classification Number, if applicable)
- hazardousMaterial: Hazardous Material Indicators (true/false)
- packagingType: Packaging Type
- packagingNumber: Packaging Number
- insuranceValue: Insurance Value (USD)
- freightCharges: Freight Charges (USD)
- dutiesTariffsEstimate: Duties/Tariffs Estimate (USD)
- signatureCertification: Signature/Certification (if available)
- notes: Additional notes/declarations

Return JSON with ALL fields (use null if not found):
{
  "usppiName": "string or null",
  "usppiId": "string or null",
  "exporterName": "string or null",
  "exporterAddress": "string or null",
  "consigneeName": "string or null",
  "consigneeAddress": "string or null",
  "notifyPartyName": "string or null",
  "notifyPartyAddress": "string or null",
  "description": "string or null",
  "hsCode": "string or null (6-10 digits)",
  "scheduleBNumber": "string or null",
  "quantity": "string or null",
  "uom": "string or null",
  "weightGross": "string or null",
  "weightNet": "string or null",
  "valueFOB": "string or null",
  "valueCIF": "string or null",
  "origin": "string or null",
  "destination": "string or null",
  "incoterms": "string or null",
  "bolNumber": "string or null",
  "carrierName": "string or null",
  "scacCode": "string or null",
  "vesselFlightNumber": "string or null",
  "exportDate": "string or null",
  "licensePermitInfo": "string or null",
  "eccn": "string or null",
  "hazardousMaterial": "boolean or null",
  "packagingType": "string or null",
  "packagingNumber": "string or null",
  "insuranceValue": "string or null",
  "freightCharges": "string or null",
  "dutiesTariffsEstimate": "string or null",
  "signatureCertification": "string or null",
  "notes": "string or null"
}

CRITICAL: Extract EVERY field that exists in the XML. Use null only if field is truly missing.`,
    })

    console.log("[ExtractData] AI extraction response:", text)

    let extracted: any = {}
    try {
      let cleaned = text.trim()
      cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```\s*$/, "")
      cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "")
      extracted = JSON.parse(cleaned)
    } catch (parseError) {
      console.error("[ExtractData] Failed to parse AI response, using direct extraction")

      // Fallback: direct extraction from parsed XML
      if (item) {
        extracted = {
          description: item.description || item.Description || item.description?.[0] || null,
          hsCode: item.hsCode || item.HSCode || item.hs_code || item.hsCode?.[0] || null,
          quantity: item.quantity || item.Quantity || item.quantity?.[0] || null,
          value: item.value || item.Value || item.value?.[0] || null,
          origin: item.origin || item.Origin || item.origin?.[0] || null,
          destination: item.destination || item.Destination || item.destination?.[0] || null,
          uom: item.uom || item.UOM || item.uom?.[0] || null,
          weightGross: item.weightGross || item.weight_gross || item.weightGross?.[0] || null,
          weightNet: item.weightNet || item.weight_net || item.weightNet?.[0] || null,
          incoterms: item.incoterms || item.Incoterms || item.incoterms?.[0] || null,
          bolNumber: item.bolNumber || item.bol_number || item.bolNumber?.[0] || null,
          carrierName: item.carrierName || item.carrier_name || item.carrierName?.[0] || null,
          exportDate: item.exportDate || item.export_date || item.exportDate?.[0] || null,
        }
      }
    }

    // Normalize HS code: strip non-numerics
    if (extracted.hsCode) {
      extracted.hsCode = extracted.hsCode.toString().replace(/[^\d]/g, "")
    }

    // Normalize numeric fields (remove non-numeric except decimal point)
    const numericFields = ['quantity', 'valueFOB', 'valueCIF', 'weightGross', 'weightNet', 
      'insuranceValue', 'freightCharges', 'dutiesTariffsEstimate', 'packagingNumber']
    
    numericFields.forEach(field => {
      if (extracted[field]) {
        extracted[field] = extracted[field].toString().replace(/[^\d.]/g, "")
      }
    })

    // Legacy field mapping for backward compatibility
    if (extracted.valueFOB && !extracted.value) {
      extracted.value = extracted.valueFOB
    }
    if (extracted.weightGross && !extracted.weight) {
      extracted.weight = extracted.weightGross
    }

    console.log("[ExtractData] Extracted data:", extracted)

    return NextResponse.json({
      success: true,
      extracted,
    })
  } catch (error: any) {
    console.error("[ExtractData] Error:", error)
    return NextResponse.json({ error: error.message || "Failed to extract data" }, { status: 500 })
  }
}

