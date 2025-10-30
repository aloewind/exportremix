import { generateText } from "ai"

export async function verifyOpenAIConnection(): Promise<{
  connected: boolean
  usingMocks: boolean
  error?: string
}> {
  // Check if OpenAI API key is available
  const hasApiKey = !!process.env.OPENAI_API_KEY

  if (!hasApiKey) {
    return {
      connected: false,
      usingMocks: true,
      error: "No API key configured - using mock data",
    }
  }

  try {
    // Simple test to verify OpenAI API is working
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: "Reply with just 'OK' if you can read this.",
      maxOutputTokens: 10,
    })

    return {
      connected: text.toLowerCase().includes("ok"),
      usingMocks: false,
    }
  } catch (error) {
    console.error("[v0] OpenAI verification failed:", error)
    return {
      connected: false,
      usingMocks: true,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export function getMockAnalysisData() {
  return {
    alerts: [
      {
        id: "alert-1",
        type: "critical" as const,
        title: "19% Steel Tariff Surge Detected",
        message:
          "Critical tariff increase detected for steel imports (HS 7208-7216). Immediate cost impact expected. Consider alternative sourcing or expedited shipments before effective date.",
        timestamp: new Date().toISOString(),
        affectedShipments: 12,
      },
      {
        id: "alert-2",
        type: "warning" as const,
        title: "Port Congestion Alert - Los Angeles",
        message:
          "Increased wait times at LA/Long Beach ports. Average delay: 4-6 days. Consider routing through Oakland.",
        timestamp: new Date().toISOString(),
        affectedShipments: 8,
      },
      {
        id: "alert-3",
        type: "info" as const,
        title: "Optimization Opportunity",
        message:
          "Consolidation of 5 shipments could save $2,400 in freight costs. Review shipments MAN-2024-001 through 005.",
        timestamp: new Date().toISOString(),
        affectedShipments: 5,
      },
    ],
    insights: {
      totalShipments: 15,
      riskScore: 68,
      predictedSavings: 12500,
      optimizationRate: 76,
      keyFindings: [
        "19% tariff surge on steel imports will impact 12 shipments (~$45,000 additional cost)",
        "Route optimization could reduce transit time by 3-5 days for 8 shipments",
        "Consolidation opportunities identified for 5 shipments (potential savings: $2,400)",
        "3 shipments flagged for customs documentation review to avoid delays",
      ],
    },
    predictions: [
      {
        category: "Tariff Changes",
        prediction: "19% steel tariff increase effective next quarter - high cost impact",
        confidence: 92,
        impact: "high" as const,
      },
      {
        category: "Supply Chain",
        prediction: "Port congestion expected to ease in 2-3 weeks based on historical patterns",
        confidence: 78,
        impact: "medium" as const,
      },
      {
        category: "Cost Optimization",
        prediction: "Shipment consolidation could reduce costs by 15-20% for current volume",
        confidence: 85,
        impact: "medium" as const,
      },
    ],
  }
}

export function getMockRemixData(prompt: string) {
  const responses: Record<string, string> = {
    "nordic calm": `**Nordic Calm Logistics Flow**

Your supply chain reimagined with Scandinavian minimalism and efficiency:

**Balanced Operations:**
- Streamline to 3 core shipping routes (eliminate redundancy)
- Implement "lagom" inventory levels - just right, not excess
- Focus on sustainable, predictable transit times

**Minimalist Approach:**
- Consolidate shipments for cleaner logistics footprint
- Reduce documentation complexity by 40%
- Single-point coordination for all customs clearance

**Calm Optimization:**
- Predictable weekly shipping schedules (no rush orders)
- Buffer inventory at strategic points for smooth flow
- Automated alerts only for critical issues (reduce noise)

**Recommendations:**
- Switch to rail freight for 60% of domestic routes (lower stress, lower cost)
- Implement 2-week rolling forecasts for steady planning
- Partner with fewer, more reliable carriers for consistency`,
    default: `**AI-Remixed Logistics Strategy**

Based on your creative prompt, here's a reimagined approach to your supply chain:

**Strategic Recommendations:**
- Optimize routing to reduce transit time by 15-20%
- Consolidate shipments where possible for cost efficiency
- Implement predictive analytics for demand forecasting
- Diversify supplier base to reduce risk concentration

**Operational Improvements:**
- Automate documentation processes to reduce errors
- Establish backup routes for critical shipments
- Implement real-time tracking for all high-value cargo
- Create contingency plans for identified risk areas

**Cost Optimization:**
- Negotiate volume discounts with primary carriers
- Utilize intermodal transport for long-distance shipments
- Optimize warehouse locations for reduced handling
- Implement just-in-time inventory where feasible

**Risk Mitigation:**
- Monitor tariff changes proactively
- Maintain safety stock for critical components
- Diversify port usage to avoid congestion
- Regular compliance audits to prevent delays`,
  }

  const lowerPrompt = prompt.toLowerCase()
  if (lowerPrompt.includes("nordic") || lowerPrompt.includes("calm")) {
    return responses["nordic calm"]
  }

  return responses.default
}
