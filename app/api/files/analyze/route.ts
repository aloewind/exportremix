import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export const dynamic = "force-dynamic"

// Fuzzy column mapping function
function mapColumns(headers: string[]): Record<string, number> {
  const columnMap: Record<string, number> = {}

  const patterns = {
    manifest_id: /manifest.*id|entry.*id|line.*id|^id$|ref|reference/i,
    origin: /origin|country.*origin|ship.*from/i,
    destination: /destination|country.*destination|ship.*to/i,
    hs_code: /^hs$|hs.*code|harmonized|tariff|hts|hts.*code/i,
    description: /description|commodity|goods|item/i,
    quantity: /qty|quantity|units|pkgs/i,
    uom: /uom|unit|unit.*measure/i,
    unit_value: /unit.*value|price.*each|unit.*price/i,
    total_value: /^value$|line.*value|amount|extended.*value/i,
    weight: /weight|total.*weight|net.*weight|gross.*weight|kg/i,
    currency: /currency|curr/i,
    incoterm: /incoterm|terms/i,
    duty: /est.*duty|estimated.*duty|^duty$|tariff.*duty/i,
    date: /ship.*date|^date$|export.*date/i,
    tariff_rate: /tariff.*rate|rate/i,
  }

  headers.forEach((header, index) => {
    const normalized = header
      .trim()
      .toLowerCase()
      .replace(/[_\s.-]+/g, " ")

    for (const [key, pattern] of Object.entries(patterns)) {
      if (pattern.test(normalized) && !columnMap[key]) {
        columnMap[key] = index
      }
    }
  })

  return columnMap
}

// Convert date from MM/DD/YYYY to YYYY-MM-DD
function convertDate(dateStr: any): string | null {
  if (!dateStr) return null

  const str = String(dateStr).trim()

  // Check if already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str
  }

  // Convert MM/DD/YYYY to YYYY-MM-DD
  const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (match) {
    const [, month, day, year] = match
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  }

  return null
}

// Normalize numeric value
function normalizeNumeric(value: any): number | null {
  if (value === null || value === undefined || value === "") return null

  const str = String(value).replace(/[$,\s]/g, "")
  const num = Number.parseFloat(str)

  return isNaN(num) ? null : num
}

function validateHSCode(code: string): { valid: boolean; normalized?: string; reason?: string } {
  if (!code) return { valid: false, reason: "HS Code is missing" }

  // Normalize: remove dots, spaces, dashes
  const normalized = code.replace(/[\s.-]/g, "")

  // Must be numeric
  if (!/^\d+$/.test(normalized)) {
    return { valid: false, reason: "HS Code contains non-numeric characters" }
  }

  // Must be 6-10 digits
  if (normalized.length < 6 || normalized.length > 10) {
    return { valid: false, reason: `HS Code has ${normalized.length} digits (must be 6-10 digits)` }
  }

  // Flag 6-digit codes without leading zero as medium priority
  if (normalized.length === 6 && !normalized.startsWith("0")) {
    return {
      valid: false,
      normalized: `0${normalized}`,
      reason: `HS Code ${normalized} should have leading zero: 0${normalized}`,
    }
  }

  // Validate HTS range for electronics (6000-8499)
  const firstFour = normalized.substring(0, 4)
  const rangeNum = Number.parseInt(firstFour, 10)

  if (rangeNum >= 6000 && rangeNum <= 8499) {
    // Valid electronics range
    return { valid: true, normalized }
  } else {
    return {
      valid: false,
      reason: `HS Code ${normalized} is outside the 2025 HTS electronics range (6000-8499). Verify classification.`,
    }
  }
}

// Validate duty calculation
function validateDuty(
  value: number,
  tariffRate: number,
  duty: number | null,
): { valid: boolean; expected?: number; reason?: string } {
  if (value === 0) {
    // If value is 0 (samples/NCV), duty can be 0
    return { valid: true }
  }

  if (duty === null || duty === 0) {
    const expected = value * (tariffRate / 100)
    return {
      valid: false,
      expected,
      reason: `Est. Duty is blank but should be $${expected.toFixed(2)} (Value: $${value}, Tariff Rate: ${tariffRate}%)`,
    }
  }

  const expected = value * (tariffRate / 100)
  const tolerance = 0.01

  if (Math.abs(duty - expected) > tolerance) {
    return {
      valid: false,
      expected,
      reason: `Est. Duty ($${duty.toFixed(2)}) does not match calculated value ($${expected.toFixed(2)})`,
    }
  }

  return { valid: true }
}

// Find duplicate business keys
function findDuplicates(data: any[], columnMap: Record<string, number>): any[] {
  const businessKeys = new Map<string, { rows: number[]; data: any }>()

  data.forEach((row, index) => {
    const origin = row[columnMap.origin] || ""
    const destination = row[columnMap.destination] || ""
    const hsCode = row[columnMap.hs_code] || ""
    const description = row[columnMap.description] || ""
    const totalValue = normalizeNumeric(row[columnMap.total_value]) || 0

    const key = `${origin}|${destination}|${hsCode}|${description}|${totalValue}`.toLowerCase()

    if (businessKeys.has(key)) {
      businessKeys.get(key)!.rows.push(index + 2) // +2 for header and 1-based indexing
    } else {
      businessKeys.set(key, {
        rows: [index + 2],
        data: { origin, destination, hsCode, description, totalValue },
      })
    }
  })

  const duplicates: any[] = []
  businessKeys.forEach((value, key) => {
    if (value.rows.length > 1) {
      duplicates.push({
        key: value.data,
        manifest_ids: value.rows.map((r) => `Row ${r}`),
        count: value.rows.length,
        rows: value.rows,
      })
    }
  })

  return duplicates
}

async function parseXML(content: string): Promise<any[]> {
  try {
    const rows: any[] = []

    // Extract shipment-level metadata
    let shipmentId = ""
    let manifestId = ""
    let totalValue = ""
    let totalWeight = ""

    // Look for ShipmentID or ManifestID at document level
    const shipmentIdMatch = content.match(/<ShipmentID[^>]*>([^<]+)<\/ShipmentID>/i)
    const manifestIdMatch = content.match(/<ManifestID[^>]*>([^<]+)<\/ManifestID>/i)
    const totalValueMatch = content.match(/<TotalValue[^>]*>([^<]+)<\/TotalValue>/i)
    const totalWeightMatch = content.match(/<TotalWeight[^>]*>([^<]+)<\/TotalWeight>/i)

    if (shipmentIdMatch) shipmentId = shipmentIdMatch[1].trim()
    if (manifestIdMatch) manifestId = manifestIdMatch[1].trim()
    if (totalValueMatch) totalValue = totalValueMatch[1].trim()
    if (totalWeightMatch) totalWeight = totalWeightMatch[1].trim()

    console.log(
      "[v0] XML Metadata - ShipmentID:",
      shipmentId,
      "ManifestID:",
      manifestId,
      "TotalValue:",
      totalValue,
      "TotalWeight:",
      totalWeight,
    )

    // Look for CargoItem, Item, LineItem, or similar nodes
    const itemPatterns = [
      /<CargoItem[^>]*>([\s\S]*?)<\/CargoItem>/gi,
      /<LineItem[^>]*>([\s\S]*?)<\/LineItem>/gi,
      /<Item[^>]*>([\s\S]*?)<\/Item>/gi,
    ]

    let itemMatches: IterableIterator<RegExpMatchArray> | null = null

    for (const pattern of itemPatterns) {
      const matches = content.matchAll(pattern)
      const matchArray = Array.from(matches)
      if (matchArray.length > 0) {
        itemMatches = matchArray[Symbol.iterator]() as any
        console.log("[v0] Found", matchArray.length, "items using pattern:", pattern.source)
        break
      }
    }

    if (!itemMatches) {
      console.log("[v0] No CargoItem/LineItem/Item nodes found in XML")
      return []
    }

    for (const match of itemMatches as any) {
      const itemContent = match[1]
      const row: any = {}

      // Add shipment-level metadata to each row
      if (shipmentId) row.shipment_id = shipmentId
      if (manifestId) row.manifest_id = manifestId

      // Extract all XML tags and their values from CargoItem
      const tagMatches = itemContent.matchAll(/<([^>/\s]+)[^>]*>([^<]+)<\/\1>/g)
      for (const tagMatch of tagMatches) {
        const key = tagMatch[1].trim()
        const value = tagMatch[2].trim()

        // Map common XML field names to standard manifest fields
        const keyLower = key.toLowerCase()
        if (keyLower.includes("hscode") || keyLower === "hs" || keyLower === "tariffcode") {
          row.hs_code = value
        } else if (keyLower.includes("value") && !keyLower.includes("unit")) {
          row.total_value = value
        } else if (keyLower.includes("tariffrate") || keyLower.includes("dutyrate")) {
          row.tariff_rate = value
        } else if (keyLower.includes("duty") || keyLower.includes("estimatedduty")) {
          row.duty = value
        } else if (keyLower.includes("origin") || keyLower === "from") {
          row.origin = value
        } else if (keyLower.includes("destination") || keyLower === "to") {
          row.destination = value
        } else if (keyLower.includes("quantity") || keyLower === "qty") {
          row.quantity = value
        } else if (keyLower.includes("uom") || keyLower.includes("unit")) {
          row.uom = value
        } else if (keyLower.includes("description")) {
          row.description = value
        } else if (keyLower.includes("weight")) {
          row.weight = value
        } else {
          row[key] = value
        }
      }

      if (Object.keys(row).length > 0) {
        rows.push(row)
      }
    }

    console.log("[v0] Parsed", rows.length, "cargo items from XML")
    return rows
  } catch (error) {
    console.error("[v0] XML parsing error:", error)
    return []
  }
}

// Parse EDI content
async function parseEDI(content: string): Promise<any[]> {
  try {
    const rows: any[] = []
    const lines = content.split(/\r?\n/)
    let currentRow: any = {}

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      // Parse EDI segments (e.g., N9*HS*0847120)
      const segments = trimmed.split("*")
      if (segments.length >= 2) {
        const segmentType = segments[0]

        // Map common EDI segments to manifest fields
        if (segmentType === "N9" && segments[1] === "HS") {
          currentRow.hs_code = segments[2]
        } else if (segmentType === "AMT") {
          currentRow.total_value = segments[2]
        } else if (segmentType === "N1") {
          if (segments[1] === "SF") currentRow.origin = segments[2]
          if (segments[1] === "ST") currentRow.destination = segments[2]
        } else if (segmentType === "SE") {
          // End of transaction set - save row
          if (Object.keys(currentRow).length > 0) {
            rows.push({ ...currentRow })
            currentRow = {}
          }
        }
      }
    }

    // Add last row if exists
    if (Object.keys(currentRow).length > 0) {
      rows.push(currentRow)
    }

    return rows
  } catch (error) {
    console.error("[v0] EDI parsing error:", error)
    return []
  }
}

// Parse PDF content
async function parsePDF(content: string): Promise<any[]> {
  try {
    // Extract tabular data from PDF text
    const rows: any[] = []
    const lines = content.split(/\r?\n/)

    // Try to detect header row
    let headers: string[] = []
    let dataStarted = false

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      // Split by multiple spaces or tabs
      const columns = trimmed.split(/\s{2,}|\t/)

      if (!dataStarted && columns.length > 3) {
        // Potential header row
        headers = columns.map((h) => h.trim())
        dataStarted = true
        continue
      }

      if (dataStarted && columns.length === headers.length) {
        const row: any = {}
        columns.forEach((value, index) => {
          row[headers[index]] = value.trim()
        })
        rows.push(row)
      }
    }

    return rows
  } catch (error) {
    console.error("[v0] PDF parsing error:", error)
    return []
  }
}

async function parseFileContent(fileName: string, content: any): Promise<{ data: any[]; isXML: boolean }> {
  const extension = fileName.split(".").pop()?.toLowerCase()

  console.log("[v0] Detecting file format:", extension)

  // If already parsed as array, return as-is
  if (Array.isArray(content)) {
    console.log("[v0] File already parsed as array")
    return { data: content, isXML: false }
  }

  // If content is an object, wrap in array
  if (typeof content === "object" && content !== null) {
    console.log("[v0] File is single object, wrapping in array")
    return { data: [content], isXML: false }
  }

  // Parse raw content based on file type
  const rawContent = String(content)

  switch (extension) {
    case "xml":
      console.log("[v0] Parsing XML file...")
      return { data: await parseXML(rawContent), isXML: true }

    case "edi":
    case "x12":
      console.log("[v0] Parsing EDI file...")
      return { data: await parseEDI(rawContent), isXML: false }

    case "pdf":
      console.log("[v0] Parsing PDF file...")
      return { data: await parsePDF(rawContent), isXML: false }

    case "json":
      console.log("[v0] Parsing JSON file...")
      try {
        const parsed = JSON.parse(rawContent)
        return Array.isArray(parsed) ? { data: parsed, isXML: false } : { data: [parsed], isXML: false }
      } catch {
        return { data: [], isXML: false }
      }

    case "csv":
    case "txt":
    default:
      console.log("[v0] Parsing CSV file...")
      // CSV parsing - detect delimiter
      const lines = rawContent.split(/\r?\n/)
      if (lines.length === 0) return { data: [], isXML: false }

      // Detect delimiter
      const firstLine = lines[0]
      const delimiters = [",", "\t", ";", "|"]
      let delimiter = ","
      let maxCount = 0

      for (const d of delimiters) {
        const count = (firstLine.match(new RegExp(`\\${d}`, "g")) || []).length
        if (count > maxCount) {
          maxCount = count
          delimiter = d
        }
      }

      console.log("[v0] Detected CSV delimiter:", delimiter === "\t" ? "TAB" : delimiter)

      // Parse CSV
      const headers = lines[0].split(delimiter).map((h) => h.trim())
      const rows: any[] = []

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const values = line.split(delimiter)
        const row: any = {}

        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || ""
        })

        rows.push(row)
      }

      return { data: rows, isXML: false }
  }
}

export async function POST(request: Request) {
  try {
    console.log("[v0] Starting Export Manifest Quality Audit...")
    console.log("[v0] ✅ ChatGPT-4o Active.")

    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { fileId } = body

    console.log("[v0] Analyzing file:", fileId, "for user:", user.id)

    const { data: file, error: fileError } = await supabase
      .from("manifests")
      .select("*")
      .eq("id", fileId)
      .eq("user_id", user.id)
      .single()

    if (fileError || !file) {
      console.error("[v0] Error fetching file:", fileError)
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    console.log("[v0] File loaded:", file.file_name)

    const { data: fileData, isXML } = await parseFileContent(file.file_name, file.data)

    if (fileData.length === 0) {
      return NextResponse.json(
        {
          error: "File is empty or could not be parsed",
          analysis: {
            errors: [
              {
                type: "PARSING_FAILED",
                description: "File contains no data or format not supported",
                severity: "critical",
              },
            ],
            suggestions: [
              {
                category: "File Format",
                recommendation: "Ensure file is in CSV, JSON, XML, EDI, or PDF format",
                impact: "Enable analysis",
              },
            ],
            feedback: {
              overall_quality: "0",
              summary: "File parsing failed",
              next_steps: ["Check file format", "Verify file content"],
            },
          },
        },
        { status: 400 },
      )
    }

    console.log("[v0] Processing", fileData.length, "rows")

    console.log("[v0] Preprocessing data: removing spaces from numeric fields, converting dates...")
    const preprocessedData = fileData.map((row, index) => {
      console.log(`[v0] Parsing Row ${index + 1}`)
      const cleanedRow: any = {}

      Object.entries(row).forEach(([key, value]) => {
        const lowerKey = key.toLowerCase()

        // Clean numeric fields (Value, Est. Duty, Tariff Rate, etc.)
        if (
          lowerKey.includes("value") ||
          lowerKey.includes("duty") ||
          lowerKey.includes("rate") ||
          lowerKey.includes("price") ||
          lowerKey.includes("amount")
        ) {
          const cleaned = String(value || "").replace(/[$,\s]/g, "")
          cleanedRow[key] = cleaned
        }
        // Convert date fields
        else if (lowerKey.includes("date")) {
          const converted = convertDate(value)
          cleanedRow[key] = converted || value
        }
        // Keep other fields as-is
        else {
          cleanedRow[key] = value
        }
      })

      return cleanedRow
    })

    console.log("[v0] Data preprocessing complete")

    // Step 1: Parse headers and create column map
    const headers = Object.keys(preprocessedData[0])
    const columnMap = mapColumns(headers)
    const missingColumns: string[] = []

    const requiredColumns = ["hs_code", "total_value", "origin", "destination"]
    requiredColumns.forEach((col) => {
      if (columnMap[col] === undefined) {
        missingColumns.push(col)
      }
    })

    console.log("[v0] Column mapping:", columnMap)

    if (!isXML && missingColumns.length > 0) {
      console.log("[v0] Missing columns:", missingColumns)
    } else if (isXML) {
      console.log("[v0] XML file detected - using flexible field mapping")
    }

    const issues: any[] = []

    // Step 2: Validate each row
    console.log("[v0] Validating rows...")

    preprocessedData.forEach((row, index) => {
      const rowNum = index + 2 // +2 for header and 1-based indexing
      console.log(`[v0] Analyzing Row ${rowNum}`)
      const rowData: any = {}

      // Extract data using column map
      Object.entries(columnMap).forEach(([key, colIndex]) => {
        rowData[key] = row[headers[colIndex]]
      })

      // A. Manifest ID validation
      const manifestId = rowData.manifest_id
      if (!manifestId || String(manifestId).trim() === "") {
        issues.push({
          severity: "critical",
          confidence: 1.0,
          manifest_id: `Row ${rowNum}`,
          row_index: rowNum,
          field: "manifest_id",
          code: "MANIFEST_ID_MISSING",
          message: "Manifest ID is empty",
          why_it_matters: "Customs requires unique identifiers for each line item to track and process entries",
          suggested_fix: "Assign a unique ID (e.g., MAN-1001, MAN-1002) to each row",
          context: { raw: { manifest_id: manifestId } },
        })
      }

      // B. HS Code validation
      if (columnMap.hs_code !== undefined) {
        const hsCode = rowData.hs_code
        const validation = validateHSCode(hsCode)

        if (!validation.valid) {
          console.log(`[v0] Error at Row ${rowNum}: ${validation.reason}`)
          issues.push({
            severity: "medium",
            confidence: 1.0,
            manifest_id: manifestId || `Row ${rowNum}`,
            row_index: rowNum,
            field: "hs_code",
            code: "HS_INVALID_FORMAT",
            message: validation.reason,
            why_it_matters:
              "Customs uses HS Codes to determine duties, restrictions, and compliance requirements. Invalid codes will block clearance.",
            suggested_fix: validation.normalized
              ? `Use the corrected format: ${validation.normalized}`
              : "Provide a valid 6-10 digit HS Code (e.g., 0847120 for computers)",
            autofix: validation.normalized
              ? {
                  proposed_value: validation.normalized,
                  note: "Corrected HS Code format",
                }
              : undefined,
            context: { raw: { hs_code: hsCode } },
          })
        }
      }

      // C. Duty validation
      if (columnMap.total_value !== undefined && columnMap.tariff_rate !== undefined) {
        const value = normalizeNumeric(rowData.total_value) || 0
        const tariffRate = normalizeNumeric(rowData.tariff_rate) || 0
        const duty = normalizeNumeric(rowData.duty)

        const dutyValidation = validateDuty(value, tariffRate, duty)

        if (!dutyValidation.valid) {
          console.log(`[v0] Error at Row ${rowNum}: ${dutyValidation.reason}`)
          issues.push({
            severity: "high",
            confidence: 1.0,
            manifest_id: manifestId || `Row ${rowNum}`,
            row_index: rowNum,
            field: "duty",
            code: "DUTY_MISSING",
            message: dutyValidation.reason,
            why_it_matters:
              "Incorrect duty calculations lead to billing errors, compliance issues, and potential penalties",
            suggested_fix: `Set Est. Duty to $${dutyValidation.expected?.toFixed(2)} (Value × Tariff Rate)`,
            autofix: dutyValidation.expected
              ? {
                  proposed_value: dutyValidation.expected.toFixed(2),
                  note: "Calculated as Value × Tariff Rate",
                }
              : undefined,
            context: {
              raw: { value: rowData.total_value, tariff_rate: rowData.tariff_rate, duty: rowData.duty },
              business_key: { value, tariffRate, duty },
            },
          })
        }
      }

      // D. Value validation
      if (columnMap.total_value !== undefined) {
        const totalValue = normalizeNumeric(rowData.total_value)

        if (totalValue === null || totalValue < 0) {
          issues.push({
            severity: "major",
            confidence: 1.0,
            manifest_id: manifestId || `Row ${rowNum}`,
            row_index: rowNum,
            field: "total_value",
            code: "VALUE_INVALID",
            message: "Total Value is missing or negative",
            why_it_matters: "Customs requires accurate values for duty calculation and statistical purposes",
            suggested_fix: "Provide a valid numeric value ≥ 0 (use 0 for samples/NCV with documentation)",
            context: { raw: { total_value: rowData.total_value } },
          })
        }
      }

      // E. Quantity & UOM validation
      if (columnMap.quantity !== undefined) {
        const quantity = normalizeNumeric(rowData.quantity)

        if (quantity === null || quantity <= 0) {
          issues.push({
            severity: "major",
            confidence: 0.9,
            manifest_id: manifestId || `Row ${rowNum}`,
            row_index: rowNum,
            field: "quantity",
            code: "QUANTITY_INVALID",
            message: "Quantity is missing or ≤ 0",
            why_it_matters: "Quantity is required for customs declaration and inventory tracking",
            suggested_fix: "Provide a valid quantity > 0",
            context: { raw: { quantity: rowData.quantity } },
          })
        }

        if (!rowData.uom || String(rowData.uom).trim() === "") {
          issues.push({
            severity: "major",
            confidence: 0.9,
            manifest_id: manifestId || `Row ${rowNum}`,
            row_index: rowNum,
            field: "uom",
            code: "UOM_MISSING",
            message: "Unit of Measure (UOM) is missing",
            why_it_matters: "UOM clarifies what the quantity represents (e.g., pieces, kg, liters)",
            suggested_fix: "Specify UOM (e.g., PCS, KG, LTR, CTN)",
            context: { raw: { uom: rowData.uom } },
          })
        }
      }
    })

    // Step 3: Find duplicates
    console.log("[v0] Checking for duplicate business keys...")
    const duplicates = findDuplicates(preprocessedData, columnMap)

    duplicates.forEach((dup) => {
      issues.push({
        severity: "major",
        confidence: 1.0,
        manifest_id: dup.manifest_ids.join(", "),
        row_index: null,
        field: "business_key",
        code: "DUP_BUSINESS_KEY",
        message: `Duplicate entry detected: ${dup.key.origin} → ${dup.key.destination}, HS: ${dup.key.hsCode} (appears ${dup.count} times)`,
        why_it_matters: "Duplicate entries may indicate data entry errors or need for line consolidation",
        suggested_fix: `Review rows ${dup.rows.join(", ")} to verify if they should be merged or have different package IDs`,
        context: {
          business_key: dup.key,
          duplicate_rows: dup.rows,
        },
      })
    })

    console.log("[v0] Total issues found:", issues.length)

    // Step 4: Generate AI analysis
    console.log("[v0] Sending to GPT-4o for comprehensive analysis...")

    const { text } = await generateText({
      model: openai("gpt-4o"),
      temperature: 0.7,
      maxOutputTokens: 1500,
      prompt: `Analyze and correct manifest. Normalize: remove spaces from numbers, convert MM/DD/YYYY to YYYY-MM-DD. Fix: missing/mismatched EstDuty, invalid HSCode (6-10 digits, 6000-8499), duplicate CargoItems/Origin-Destination pairs, add Manifest ID if missing. Output quality score 0-10, issues with locations/priorities, 3 fixes, and corrected file content as JSON.

File: ${file.file_name}
Format: ${file.file_name.split(".").pop()?.toUpperCase()}
Rows: ${preprocessedData.length}
Missing Columns: ${missingColumns.join(", ") || "None"}

Pre-validated issues: ${issues.length}
${issues.length > 0 ? JSON.stringify(issues.slice(0, 10), null, 2) : "None"}

Sample data (first 3 rows, preprocessed):
${JSON.stringify(preprocessedData.slice(0, 3), null, 2)}

Return PURE JSON (no markdown):
{
  "errors": [{"type": "string", "description": "specific issue", "severity": "high|medium|low", "location": "Row X"}],
  "suggestions": [{"category": "string", "recommendation": "actionable step", "impact": "expected improvement"}],
  "feedback": {
    "overall_quality": "0-10",
    "summary": "brief assessment",
    "next_steps": ["fix 1", "fix 2", "fix 3"]
  }
}`,
    })

    console.log("[v0] GPT-4o response received, parsing...")

    let analysis
    try {
      let cleanedText = text.trim()
      cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/```\s*$/, "")
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/```\s*$/, "")

      analysis = JSON.parse(cleanedText)

      // Merge pre-validated issues with AI analysis
      const preValidatedErrors = issues.map((issue) => ({
        type: issue.code,
        description: issue.message,
        severity: issue.severity,
        location: issue.manifest_id,
      }))

      analysis.errors = [...preValidatedErrors, ...(analysis.errors || [])]

      if (!analysis.suggestions) analysis.suggestions = []
      if (!analysis.feedback) {
        analysis.feedback = {
          overall_quality: "N/A",
          summary: "Analysis completed",
          next_steps: [],
        }
      }

      // Sort by severity
      const severityOrder = { critical: 1, major: 2, medium: 3, low: 4 }
      analysis.errors.sort((a: any, b: any) => {
        const aSeverity = severityOrder[a.severity?.toLowerCase() as keyof typeof severityOrder] || 999
        const bSeverity = severityOrder[b.severity?.toLowerCase() as keyof typeof severityOrder] || 999
        return aSeverity - bSeverity
      })

      const criticalCount = analysis.errors.filter((e: any) => e.severity === "critical").length
      const majorCount = analysis.errors.filter((e: any) => e.severity === "major" || e.severity === "high").length

      if (criticalCount === 0 && majorCount === 0) {
        analysis.feedback.overall_quality = "9"
        analysis.feedback.summary = "No major errors - Fully compliant with WCO/HTS standards"
      }

      console.log("[v0] Analysis complete:")
      console.log("[v0] - Total errors:", analysis.errors.length)
      console.log("[v0] - Suggestions:", analysis.suggestions.length)
      console.log("[v0] - Quality score:", analysis.feedback.overall_quality)
    } catch (e) {
      console.error("[v0] Failed to parse AI response:", e)

      analysis = {
        errors: issues.map((issue) => ({
          type: issue.code,
          description: issue.message,
          severity: issue.severity,
          location: issue.manifest_id,
        })),
        suggestions: [
          {
            category: "Data Quality",
            recommendation: "Review and fix all critical issues before customs submission",
            impact: "Prevent clearance delays and penalties",
          },
        ],
        feedback: {
          overall_quality: issues.filter((i) => i.severity === "critical").length === 0 ? "7" : "4",
          summary: `Found ${issues.length} issues requiring attention`,
          next_steps: [
            "Fix all critical issues (HS Codes, Duties, Manifest IDs)",
            "Review major issues (Values, Quantities, Duplicates)",
            "Validate data before resubmission",
          ],
        },
      }
    }

    await supabase.from("manifests").update({ status: "analyzed" }).eq("id", fileId)

    console.log("[v0] Export Manifest Quality Audit complete")

    return NextResponse.json({ analysis })
  } catch (error: any) {
    console.error("[v0] Error in POST /api/files/analyze:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
