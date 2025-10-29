import { NextResponse } from "next/server"
import { fetchAllTradeData } from "@/lib/trade-data-apis"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const data = await fetchAllTradeData()

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error in trade data API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch trade data",
      },
      { status: 500 },
    )
  }
}
