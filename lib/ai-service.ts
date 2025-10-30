export interface AIAnalysisRequest {
  manifestData: any[]
}

export interface AIRemixRequest {
  prompt: string
  context: any
}

export async function analyzeManifestData(request: AIAnalysisRequest) {
  const response = await fetch("/api/ai/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Analysis failed")
  }

  return response.json()
}

export async function remixData(request: AIRemixRequest) {
  const response = await fetch("/api/ai/remix", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Remix failed")
  }

  return response.json()
}
