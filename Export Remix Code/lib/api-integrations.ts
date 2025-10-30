// Real-time data integration utilities for CBP, WTO, and ITC APIs

export interface TariffData {
  htsCode: string
  description: string
  rate: number
  effectiveDate: string
  source: string
}

export interface TradeAlert {
  type: "surge" | "delay" | "policy_change"
  severity: "low" | "medium" | "high"
  message: string
  affectedCountries: string[]
  timestamp: string
  source: string
}
