"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, ExternalLink, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"

interface APISettings {
  api_cbp_enabled: boolean
  api_wto_enabled: boolean
  api_itc_enabled: boolean
}

interface APIIntegration {
  id: string
  name: string
  url: string
  description: string
  key: keyof APISettings
  is_enabled: boolean
}

const PUBLIC_APIS = [
  {
    id: "cbp",
    name: "CBP (Customs & Border Protection)",
    url: "https://data.cbp.gov",
    description: "US customs delays, port clearance times, and inspection rates",
    key: "api_cbp_enabled" as keyof APISettings,
    is_enabled: false,
  },
  {
    id: "wto",
    name: "WTO (World Trade Organization)",
    url: "https://apiportal.wto.org/apis",
    description: "Global trade volumes, policy changes, and trade agreements",
    key: "api_wto_enabled" as keyof APISettings,
    is_enabled: false,
  },
  {
    id: "itc",
    name: "ITC (International Trade Commission)",
    url: "https://dataweb.usitc.gov/api",
    description: "Tariff rates, HS codes, trade remedies, and duty exemptions",
    key: "api_itc_enabled" as keyof APISettings,
    is_enabled: false,
  },
]

export function APIIntegrationsPage({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const [settings, setSettings] = useState<APISettings>({
    api_cbp_enabled: false,
    api_wto_enabled: false,
    api_itc_enabled: false,
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [integrations, setIntegrations] = useState<APIIntegration[]>([])

  const allAPIsConnected = settings.api_cbp_enabled && settings.api_wto_enabled && settings.api_itc_enabled

  useEffect(() => {
    if (!userId) {
      setError("Invalid user session. Please log in again.")
      setLoading(false)
      return
    }

    loadSettings()

    try {
      const channel = supabase
        .channel("user_settings_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "user_settings",
            filter: `user_id=eq.${userId}`,
          },
          (status: "SUBSCRIBED" | "TIMED_OUT" | "CLOSED" | "CHANNEL_ERROR") => {
            loadSettings()
          },
        )
        .subscribe((status: "SUBSCRIBED" | "TIMED_OUT" | "CLOSED" | "CHANNEL_ERROR") => {
          if (status === "CHANNEL_ERROR") {
            toast.error("Real-time updates unavailable. Data will refresh manually.")
          }
        })

      return () => {
        supabase.removeChannel(channel)
      }
    } catch (realtimeError) {
      toast.error("Real-time updates unavailable. Data will refresh manually.")
    }
  }, [userId])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("api_cbp_enabled, api_wto_enabled, api_itc_enabled")
        .eq("user_id", userId)
        .eq("is_enabled", true)

      if (error) throw error

      setIntegrations(data || [])

      // Fetch data for each connected API
      if (data && data.length > 0) {
        data.forEach((integration: APIIntegration) => {
          fetchAPIData(integration)
        })
      }
    } catch (error) {
      console.error("[v0] Error loading integrations:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAPIData = async (integration: APIIntegration) => {
    // Implementation for fetching API data
  }

  const toggleAPI = async (apiKey: keyof APISettings) => {
    setUpdating(apiKey)
    const newValue = !settings[apiKey]

    try {
      const { error } = await supabase
        .from("user_settings")
        .update({ [apiKey]: newValue })
        .eq("user_id", userId)

      if (error) {
        throw error
      }

      setSettings((prev) => ({ ...prev, [apiKey]: newValue }))
      toast.success(`API ${newValue ? "connected" : "disconnected"}`)
    } catch (error) {
      toast.error("Failed to update API connection. Please try again.")
    } finally {
      setUpdating(null)
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Integrations</h1>
          <p className="text-muted-foreground mt-2">Connect to public trade APIs</p>
        </div>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Error Loading Data
            </CardTitle>
            <CardDescription>We encountered an issue loading your API settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Error details: {error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Integrations</h1>
        <p className="text-muted-foreground mt-2">Connect to public trade APIs for real-time data</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Public Trade APIs</CardTitle>
          <CardDescription>Connect to official government and international trade data sources</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {PUBLIC_APIS.map((api) => (
            <div
              key={api.id}
              className="flex items-start justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{api.name}</h3>
                  <Badge variant={settings[api.key] ? "default" : "secondary"}>
                    {settings[api.key] ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{api.description}</p>
                <a
                  href={api.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  {api.url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Switch
                  checked={settings[api.key]}
                  onCheckedChange={() => toggleAPI(api.key)}
                  disabled={updating === api.key}
                />
                <Button
                  size="sm"
                  variant={settings[api.key] ? "outline" : "default"}
                  onClick={() => toggleAPI(api.key)}
                  disabled={updating === api.key}
                >
                  {updating === api.key ? "Updating..." : settings[api.key] ? "Disconnect" : "Connect"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {allAPIsConnected && (
        <Card className="border-primary">
          <CardContent className="py-8 text-center">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">All APIs Connected!</h3>
                <p className="text-muted-foreground">View real-time trade data from all connected sources</p>
              </div>
              <Button onClick={() => router.push("/dashboard/api-data")} size="lg" className="gap-2">
                View Real-Time Data
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!allAPIsConnected && (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Connect All APIs</h3>
                <p className="text-muted-foreground">
                  All three APIs (CBP, WTO, and ITC) must be connected to access real-time trade data
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge variant={settings.api_cbp_enabled ? "default" : "secondary"}>CBP</Badge>
                <Badge variant={settings.api_wto_enabled ? "default" : "secondary"}>WTO</Badge>
                <Badge variant={settings.api_itc_enabled ? "default" : "secondary"}>ITC</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
