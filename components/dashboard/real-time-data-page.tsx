"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, TrendingUp, TrendingDown, Clock, RefreshCw, Globe } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface RealTimeDataProps {
  userId: string
  hasIntegrations: boolean
}

interface DataPoint {
  source: string
  category: string
  value: string
  trend: "up" | "down" | "stable"
  change: string
  timestamp: string
  description: string
}

export function RealTimeDataPage({ userId, hasIntegrations }: RealTimeDataProps) {
  const [data, setData] = useState<DataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchRealTimeData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/trade-data")
      const result = await response.json()

      if (result.success) {
        setData(result.data)
        setLastUpdate(new Date())
      } else {
        console.error("[v0] Failed to fetch trade data:", result.error)
      }
    } catch (error) {
      console.error("[v0] Error fetching real-time data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasIntegrations) {
      fetchRealTimeData()

      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchRealTimeData()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [hasIntegrations, userId])

  if (!hasIntegrations) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Real-Time Trade Data
            </CardTitle>
            <CardDescription>Live data from WTO, USITC, and Port of LA with 30-second refresh</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Updated {lastUpdate.toLocaleTimeString()}</span>
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Disclaimer */}
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg border">
          <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Data shown is from public sources (WTO API, USITC DataWeb, Port of LA Dashboard) and represents current
            estimates. This information is not legal advice and should not be used as the sole basis for compliance
            decisions. Some data may be estimated when APIs are unavailable.
          </p>
        </div>

        {/* Data Grid */}
        {loading && data.length === 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-32 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((item, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {item.source}
                    </Badge>
                    {item.trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {item.trend === "down" && <TrendingDown className="w-4 h-4 text-red-500" />}
                    {item.trend === "stable" && <div className="w-4 h-0.5 bg-muted-foreground" />}
                  </div>
                  <CardTitle className="text-base mt-2">{item.category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{item.value}</span>
                    <span
                      className={`text-sm ${
                        item.trend === "up"
                          ? "text-green-500"
                          : item.trend === "down"
                            ? "text-red-500"
                            : "text-muted-foreground"
                      }`}
                    >
                      {item.change}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Data Sources Info */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            <strong>Data Sources:</strong> WTO API (World Trade Organization), USITC DataWeb (US International Trade
            Commission), Port of LA Cargo Operations Dashboard. Data refreshes automatically every 30 seconds. API keys
            can be obtained from respective portals for enhanced accuracy.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
