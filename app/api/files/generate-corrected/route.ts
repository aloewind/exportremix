import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

export const dynamic = "force-dynamic"

function normalizeNumeric(value: any): number | null {
  if (value === null || value === undefined || value === "") return null
  const str = String(value).replace(/[$,\s]/g, "")
  const num = Number.parseFloat(str)
  return isNaN(num) ? null : num
}

function standardizeHSCode(code: string): string {
  if (!code) return code
  const normalized = code.replace(/[\s.-]/g, "")

  // Ensure 6-10 digits with leading zeros if needed
  if (normalized.length === 6 && !normalized.startsWith("0")) {
    return `0${normalized}`
  }
  if (normalized.length < 6) {
    return normalized.padStart(6, "0")
  }
  return normalized
}

function calculateEstDuty(value: number, tariffRate: number): number {
  return value * (tariffRate / 100)
}

function findColumnIndex(headers: string[], patterns: RegExp[]): number {
  for (let i = 0; i < headers.length; i++) {
    const normalized = headers[i]
      .trim()
      .toLowerCase()
      .replace(/[_\s.-]+/g, " ")
    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        return i
      }
    }
  }
  return -1
}

function generateXML(data: any[], originalFileName: string): string {
  const manifestId = uuidv4()

  const cargoItems = data.map((row: any) => {
    const fields = Object.entries(row)
      .map(([key, value]) => `    <${key}>${value}</${key}>`)
      .join("\n")
    return `  <CargoItem>\n${fields}\n  </CargoItem>`
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
<Manifest>
  <ManifestID>${manifestId}</ManifestID>
  <FileName>${originalFileName}</FileName>
${cargoItems.join("\n")}
</Manifest>`
}

function generateEDI(data: any[]): string {
  const segments = data.map((row: any, index: number) => {
    const parts: string[] = []
    const headers = Object.keys(row)

    const hsCodeIdx = findColumnIndex(headers, [/^hs$|hs.*code/i])
    const valueIdx = findColumnIndex(headers, [/value/i])
    const originIdx = findColumnIndex(headers, [/origin/i])
    const destIdx = findColumnIndex(headers, [/destination/i])

    if (hsCodeIdx !== -1) parts.push(`N9*HS*${row[headers[hsCodeIdx]]}`)
    if (valueIdx !== -1) parts.push(`AMT*${row[headers[valueIdx]]}`)
    if (originIdx !== -1) parts.push(`N1*SF*${row[headers[originIdx]]}`)
    if (destIdx !== -1) parts.push(`N1*ST*${row[headers[destIdx]]}`)
    parts.push(`SE*${index + 1}`)

    return parts.join("\n")
  })

  return segments.join("\n")
}

export async function POST(request: Request) {
  try {
    console.log("[v0] Generating corrected manifest with same-format output...")

    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { fileId, issues } = body

    const { data: file, error: fileError } = await supabase
      .from("manifests")
      .select("*")
      .eq("id", fileId)
      .eq("user_id", user.id)
      .single()

    if (fileError || !file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const fileData = Array.isArray(file.data) ? file.data : [file.data]
    const correctedData = JSON.parse(JSON.stringify(fileData))

    let issuesFixed = 0

    correctedData.forEach((row: any, index: number) => {
      const headers = Object.keys(row)

      const manifestIdIdx = findColumnIndex(headers, [/manifest.*id|entry.*id|^id$/i])
      const hsCodeIdx = findColumnIndex(headers, [/^hs$|hs.*code|harmonized|tariff|hts/i])
      const valueIdx = findColumnIndex(headers, [/^value$|line.*value|amount|extended.*value|total.*value/i])
      const tariffRateIdx = findColumnIndex(headers, [/tariff.*rate|rate/i])
      const dutyIdx = findColumnIndex(headers, [/est.*duty|estimated.*duty|^duty$/i])

      // Add Manifest ID if missing
      if (manifestIdIdx !== -1) {
        const manifestIdKey = headers[manifestIdIdx]
        if (!row[manifestIdKey] || String(row[manifestIdKey]).trim() === "") {
          row[manifestIdKey] = uuidv4()
          issuesFixed++
          console.log(`[v0] Row ${index + 1}: Added Manifest ID ${row[manifestIdKey]}`)
        }
      } else {
        // Add new Manifest ID field if column doesn't exist
        row["Manifest_ID"] = uuidv4()
        issuesFixed++
        console.log(`[v0] Row ${index + 1}: Created Manifest ID field with ${row["Manifest_ID"]}`)
      }

      if (hsCodeIdx !== -1) {
        const hsCodeKey = headers[hsCodeIdx]
        const hsCode = row[hsCodeKey]
        if (hsCode) {
          const standardized = standardizeHSCode(String(hsCode))
          if (standardized !== hsCode) {
            row[hsCodeKey] = standardized
            issuesFixed++
            console.log(`[v0] Row ${index + 1}: Standardized HS Code from ${hsCode} to ${standardized}`)
          }
        }
      }

      // Calculate missing EstDuty = Value * TariffRate
      if (valueIdx !== -1 && tariffRateIdx !== -1 && dutyIdx !== -1) {
        const valueKey = headers[valueIdx]
        const tariffRateKey = headers[tariffRateIdx]
        const dutyKey = headers[dutyIdx]

        const value = normalizeNumeric(row[valueKey])
        const tariffRate = normalizeNumeric(row[tariffRateKey])
        const duty = normalizeNumeric(row[dutyKey])

        if (value !== null && tariffRate !== null && (duty === null || duty === 0)) {
          const calculatedDuty = calculateEstDuty(value, tariffRate)
          row[dutyKey] = calculatedDuty.toFixed(2)
          issuesFixed++
          console.log(
            `[v0] Row ${index + 1}: Calculated EstDuty = $${calculatedDuty.toFixed(2)} (Value: $${value}, Rate: ${tariffRate}%)`,
          )
        }
      }
    })

    const businessKeyMap = new Map<string, any>()
    let duplicatesRemoved = 0

    correctedData.forEach((row: any) => {
      const headers = Object.keys(row)
      const originIdx = findColumnIndex(headers, [/origin|country.*origin|ship.*from/i])
      const destinationIdx = findColumnIndex(headers, [/destination|country.*destination|ship.*to/i])
      const hsCodeIdx = findColumnIndex(headers, [/^hs$|hs.*code|harmonized|tariff|hts/i])
      const descriptionIdx = findColumnIndex(headers, [/description|commodity|goods|item/i])

      const origin = originIdx !== -1 ? row[headers[originIdx]] : ""
      const destination = destinationIdx !== -1 ? row[headers[destinationIdx]] : ""
      const hsCode = hsCodeIdx !== -1 ? row[headers[hsCodeIdx]] : ""
      const description = descriptionIdx !== -1 ? row[headers[descriptionIdx]] : ""

      const businessKey = `${origin}|${destination}|${hsCode}|${description}`.toLowerCase()

      if (businessKeyMap.has(businessKey)) {
        duplicatesRemoved++
        console.log(`[v0] Removed duplicate: ${origin} → ${destination}, HS: ${hsCode}`)
      } else {
        businessKeyMap.set(businessKey, row)
      }
    })

    const deduplicatedData = Array.from(businessKeyMap.values())

    const extension = file.file_name.split(".").pop()?.toLowerCase()
    let content: string
    let mimeType: string

    console.log(`[v0] Generating output in ${extension?.toUpperCase()} format...`)

    switch (extension) {
      case "csv":
        const headers = Object.keys(deduplicatedData[0])
        const csvRows = [
          headers.join(","),
          ...deduplicatedData.map((row: any) => headers.map((h) => `"${row[h] || ""}"`).join(",")),
        ]
        content = csvRows.join("\n")
        mimeType = "text/csv"
        console.log("[v0] Generated CSV with", deduplicatedData.length, "rows")
        break

      case "json":
        content = JSON.stringify(deduplicatedData, null, 2)
        mimeType = "application/json"
        console.log("[v0] Generated JSON with", deduplicatedData.length, "items")
        break

      case "xml":
        content = generateXML(deduplicatedData, file.file_name)
        mimeType = "application/xml"
        console.log("[v0] Generated XML with", deduplicatedData.length, "CargoItems")
        break

      case "edi":
      case "x12":
        content = generateEDI(deduplicatedData)
        mimeType = "application/edi"
        console.log("[v0] Generated EDI with", deduplicatedData.length, "segments")
        break

      default:
        content = JSON.stringify(deduplicatedData, null, 2)
        mimeType = "application/json"
        console.log("[v0] Generated JSON (default) with", deduplicatedData.length, "items")
    }

    console.log("[v0] Corrected manifest generated successfully")
    console.log(`[v0] - Issues fixed: ${issuesFixed}`)
    console.log(`[v0] - Duplicates removed: ${duplicatesRemoved}`)
    console.log(`[v0] - Output format: ${extension?.toUpperCase()}`)

    return NextResponse.json({
      content,
      mimeType,
      fileName: file.file_name.replace(/(\.[^.]+)$/, "_corrected$1"),
      issuesFixed,
      duplicatesRemoved,
    })
  } catch (error: any) {
    console.error("[v0] Error generating corrected manifest:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
