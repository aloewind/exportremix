"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Globe, TrendingUp, TrendingDown, Clock, RefreshCw, Settings } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

interface APISettings {
  api_cbp_enabled: boolean
  api_wto_enabled: boolean
  api_itc_enabled: boolean
}

interface DataPoint {
  source: string
  category: string
  value: string
  trend: "up" | "down" | "stable"
  change: string
  description: string
}

export function APIDataPageClient({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const [settings, setSettings] = useState<APISettings>({
    api_cbp_enabled: false,
    api_wto_enabled: false,
    api_itc_enabled: false,
  })
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DataPoint[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)

  const allAPIsConnected = settings.api_cbp_enabled && settings.api_wto_enabled && settings.api_itc_enabled

  useEffect(() => {
    loadSettings()
  }, [userId])

  useEffect(() => {
    if (allAPIsConnected) {
      fetchRealTimeData()

      const interval = setInterval(() => {
        fetchRealTimeData()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [allAPIsConnected])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("api_cbp_enabled, api_wto_enabled, api_itc_enabled")
        .eq("user_id", userId)
        .maybeSingle()

      if (error) {
        console.log("[v0] API settings fetch failed:", error)
        setError(`Failed to load API settings: ${error.message}`)
      } else if (data) {
        setSettings(data)
      } else {
        console.log("[v0] No API settings found for user, using defaults")
        setSettings({
          api_cbp_enabled: false,
          api_wto_enabled: false,
          api_itc_enabled: false,
        })
      }
    } catch (error) {
      console.log("[v0] API settings fetch failed:", error)
      setError(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const fetchRealTimeData = async () => {
    setDataLoading(true)
    try {
      const response = await fetch("/api/trade-data")

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        const filteredData = result.data.filter((item: DataPoint) => {
          if (item.source === "CBP" && settings.api_cbp_enabled) return true
          if (item.source === "WTO" && settings.api_wto_enabled) return true
          if (item.source === "ITC" && settings.api_itc_enabled) return true
          return false
        })
        setData(filteredData)
        setLastUpdate(new Date())
      } else {
        toast.error("Failed to fetch real-time data")
      }
    } catch (error) {
      toast.error(`Unable to load real-time data: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setDataLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Real-Time API Data</h1>
          <p className="text-muted-foreground mt-2">Live trade data from connected APIs</p>
        </div>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Error Loading Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Error details: {error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!allAPIsConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Real-Time API Data</h1>
          <p className="text-muted-foreground mt-2">Live trade data from connected APIs</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect All APIs to View Real-Time Data</h3>
            <p className="text-muted-foreground mb-4">
              All three APIs (CBP, WTO, and ITC) must be connected to access real-time trade data
            </p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Badge variant={settings.api_cbp_enabled ? "default" : "secondary"}>CBP</Badge>
              <Badge variant={settings.api_wto_enabled ? "default" : "secondary"}>WTO</Badge>
              <Badge variant={settings.api_itc_enabled ? "default" : "secondary"}>ITC</Badge>
            </div>
            <Button onClick={() => router.push("/dashboard/integrations")} className="gap-2">
              <Settings className="w-4 h-4" />
              Configure API Integrations
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Real-Time API Data</h1>
          <p className="text-muted-foreground mt-2">Live trade data from connected APIs with 30-second auto-refresh</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard/integrations")} className="gap-2">
          <Settings className="w-4 h-4" />
          API Settings
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Real-Time Trade Data
              </CardTitle>
              <CardDescription>Live data from CBP, WTO, and ITC APIs</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Updated {lastUpdate.toLocaleTimeString()}</span>
              {dataLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg border">
            <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Public data estimates, not legal advice. This information should not be used as the sole basis for
              compliance decisions.
            </p>
          </div>

          {dataLoading && data.length === 0 ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(9)].map((_, i) => (
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
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
                    <CardTitle className="text-sm mt-2">{item.category}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold">{item.value}</span>
                      <span
                        className={`text-xs ${
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
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
