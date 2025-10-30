"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Eye, EyeOff, AlertCircle, Info } from "lucide-react"
import { toast } from "sonner"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface APIIntegration {
  id: string
  api_name: string
  api_endpoint: string
  api_key: string
  is_enabled: boolean
  created_at: string
}

export function CustomAPIIntegrations({ userId }: { userId: string }) {
  const [integrations, setIntegrations] = useState<APIIntegration[]>([])
  const [loading, setLoading] = useState(true)
  const [tableExists, setTableExists] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})

  const [newName, setNewName] = useState("")
  const [newEndpoint, setNewEndpoint] = useState("")
  const [newKey, setNewKey] = useState("")

  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    loadIntegrations()

    if (!tableExists) return

    const channel = supabase
      .channel("user_api_integrations_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_api_integrations",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadIntegrations()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, tableExists])

  const loadIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from("user_api_integrations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        if (error.message?.includes("relation") && error.message?.includes("does not exist")) {
          setTableExists(false)
          setIntegrations([])
          setLoading(false)
          return
        }
        throw error
      }
      setIntegrations(data || [])
      setTableExists(true)
    } catch (error) {
      console.error("[v0] Error loading integrations:", error)
      if (tableExists) {
        toast.error("Failed to load API integrations")
      }
    } finally {
      setLoading(false)
    }
  }

  const addIntegration = async () => {
    if (!newName || !newEndpoint || !newKey) {
      toast.error("Please fill in all fields")
      return
    }

    if (!tableExists) {
      toast.error("Database table not set up. Please contact support.")
      return
    }

    try {
      const { error } = await supabase.from("user_api_integrations").insert({
        user_id: userId,
        api_name: newName,
        api_endpoint: newEndpoint,
        api_key: newKey,
        is_enabled: true,
      })

      if (error) throw error

      toast.success("API integration added successfully")
      setNewName("")
      setNewEndpoint("")
      setNewKey("")
      setShowNewForm(false)
      loadIntegrations()
    } catch (error: any) {
      console.error("[v0] Error adding integration:", error)
      toast.error(error.message || "Failed to add API integration")
    }
  }

  const toggleIntegration = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase.from("user_api_integrations").update({ is_enabled: !currentState }).eq("id", id)

      if (error) throw error

      toast.success(`API ${!currentState ? "enabled" : "disabled"}`)
      loadIntegrations()
    } catch (error) {
      console.error("[v0] Error toggling integration:", error)
      toast.error("Failed to update API integration")
    }
  }

  const deleteIntegration = async (id: string) => {
    try {
      const { error } = await supabase.from("user_api_integrations").delete().eq("id", id)

      if (error) throw error

      toast.success("API integration deleted")
      loadIntegrations()
    } catch (error) {
      console.error("[v0] Error deleting integration:", error)
      toast.error("Failed to delete API integration")
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custom API Integrations</CardTitle>
          <CardDescription>Loading your API connections...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!tableExists) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custom API Integrations</CardTitle>
          <CardDescription>Connect your own external APIs to enhance predictions and data remixing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Database Setup Required</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                The custom API integrations feature requires a database table to be set up. Please run the SQL script
                located at{" "}
                <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900 rounded text-xs">
                  scripts/006_create_user_api_integrations.sql
                </code>{" "}
                in your Supabase dashboard.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle>Custom API Integrations</CardTitle>
            <CardDescription className="max-w-2xl">
              Connect your own external APIs to enhance predictions and data remixing. Integrate with trade data
              providers like CBP, WTO, ITC, or any custom endpoint to get real-time tariff rates, compliance updates,
              and market insights directly in your dashboard.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowNewForm(!showNewForm)} variant={showNewForm ? "outline" : "default"}>
            <Plus className="w-4 h-4 mr-2" />
            {showNewForm ? "Cancel" : "Add API"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">How Custom API Integrations Work</p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Add your API endpoints to fetch live trade data, tariff rates, or compliance information. Your API keys
              are encrypted and stored securely. Data from custom APIs is used for estimates and predictions only.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            <strong>Security:</strong> Never share your API keys with anyone. We encrypt all keys at rest and in
            transit. You can disable or delete integrations at any time.
          </p>
        </div>

        {showNewForm && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <div className="space-y-2">
              <Label htmlFor="api-name">API Name</Label>
              <Input
                id="api-name"
                placeholder="e.g., CBP Trade Data API, WTO Tariff Database, Custom Trade API"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Give your API a descriptive name so you can easily identify it later
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-endpoint">API Endpoint URL</Label>
              <Input
                id="api-endpoint"
                type="url"
                placeholder="https://api.example.com/v1/trade-data"
                value={newEndpoint}
                onChange={(e) => setNewEndpoint(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The full URL where your API can be accessed (must start with https://)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key / Authentication Token</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your API key or bearer token"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Your API key will be encrypted and stored securely</p>
            </div>
            <Button onClick={addIntegration} className="w-full">
              Add Integration
            </Button>
          </div>
        )}

        {integrations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground space-y-3">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8" />
            </div>
            <div>
              <p className="font-medium text-foreground">No custom API integrations yet</p>
              <p className="text-sm mt-1">Connect your first API to start enhancing your trade data predictions</p>
            </div>
            <Button onClick={() => setShowNewForm(true)} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First API
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{integration.api_name}</p>
                    <Badge variant={integration.is_enabled ? "default" : "secondary"} className="shrink-0">
                      {integration.is_enabled ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{integration.api_endpoint}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground font-mono">
                      {showKeys[integration.id] ? integration.api_key : "•".repeat(32)}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() =>
                        setShowKeys((prev) => ({
                          ...prev,
                          [integration.id]: !prev[integration.id],
                        }))
                      }
                    >
                      {showKeys[integration.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Added {new Date(integration.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Switch
                    checked={integration.is_enabled}
                    onCheckedChange={() => toggleIntegration(integration.id, integration.is_enabled)}
                  />
                  <Button size="sm" variant="ghost" onClick={() => deleteIntegration(integration.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
