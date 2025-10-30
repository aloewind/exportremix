export interface ManifestData {
  id: string
  shipmentId: string
  origin: string
  destination: string
  hsCode: string
  description: string
  value: number
  weight: number
  tariffRate: number
  estimatedDuty: number
  status?: string
  items?: number
  riskLevel?: string
}

export interface PredictionAlert {
  id: string
  type: "surge" | "delay" | "reroute" | "compliance"
  severity: "high" | "medium" | "low"
  title: string
  description: string
  impact: string
  recommendation: string
  timestamp: string
}

export function generateMockManifestData(count = 10): ManifestData[] {
  const origins = ["Shanghai, CN", "Hamburg, DE", "Los Angeles, US", "Singapore, SG", "Rotterdam, NL"]
  const destinations = ["New York, US", "London, UK", "Tokyo, JP", "Sydney, AU", "Toronto, CA"]
  const descriptions = [
    "Electronic Components",
    "Textile Products",
    "Machinery Parts",
    "Consumer Electronics",
    "Automotive Parts",
  ]

  return Array.from({ length: count }, (_, i) => ({
    id: `MAN-${1000 + i}`,
    shipmentId: `SHP-${2000 + i}`,
    origin: origins[Math.floor(Math.random() * origins.length)],
    destination: destinations[Math.floor(Math.random() * destinations.length)],
    hsCode: `${8400 + Math.floor(Math.random() * 100)}.${10 + Math.floor(Math.random() * 90)}`,
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    value: Math.floor(Math.random() * 50000) + 10000,
    weight: Math.floor(Math.random() * 5000) + 500,
    tariffRate: Math.floor(Math.random() * 25) + 5,
    estimatedDuty: 0,
    status: ["Pending", "In Transit", "Delivered"][Math.floor(Math.random() * 3)],
    items: Math.floor(Math.random() * 100) + 1,
    riskLevel: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
  })).map((item) => ({
    ...item,
    estimatedDuty: Math.floor(item.value * (item.tariffRate / 100)),
  }))
}

export function generatePredictionAlerts(): PredictionAlert[] {
  return [
    {
      id: "ALERT-001",
      type: "surge",
      severity: "high",
      title: "Tariff Surge Detected - 19% Increase",
      description: "19% tariff increase predicted for HS Code 8471.30 affecting electronic components",
      impact: "Estimated $45,000 additional cost across 12 shipments. 76% of current routes experiencing disruptions.",
      recommendation: "Consider rerouting through alternative ports or delaying shipments by 2 weeks",
      timestamp: new Date().toISOString(),
    },
    {
      id: "ALERT-002",
      type: "delay",
      severity: "high",
      title: "Critical Port Congestion - 76% Disruption Rate",
      description: "Los Angeles port experiencing 5-7 day delays with 76% of shipments affected",
      impact: "8 active shipments may miss delivery deadlines. Supply chain disruption at critical levels.",
      recommendation: "Notify customers of potential delays and consider air freight for urgent items",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "ALERT-003",
      type: "reroute",
      severity: "medium",
      title: "Cost Optimization Opportunity",
      description: "Alternative route via Vancouver could save 35% and avoid congestion",
      impact: "Potential savings of $28,000 on current shipments. Reduced exposure to disrupted routes.",
      recommendation: "Reroute 8 shipments through Vancouver port for optimal cost efficiency",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "ALERT-004",
      type: "compliance",
      severity: "medium",
      title: "Regulatory Update Required",
      description: "New customs documentation requirements for textile imports",
      impact: "5 shipments require updated compliance documentation",
      recommendation: "Update manifest documentation to meet new regulatory standards",
      timestamp: new Date(Date.now() - 10800000).toISOString(),
    },
  ]
}
