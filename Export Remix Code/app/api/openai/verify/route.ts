import { NextResponse } from "next/server"
import { verifyOpenAIConnection } from "@/lib/openai-utils"

export async function GET() {
  try {
    const result = await verifyOpenAIConnection()

    return NextResponse.json({
      success: result.connected,
      message: result.connected ? "OpenAI API connected successfully" : "OpenAI API connection failed",
      error: result.error,
      usingMocks: !result.connected,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify OpenAI connection",
        error: error instanceof Error ? error.message : "Unknown error",
        usingMocks: true,
      },
      { status: 500 },
    )
  }
}
