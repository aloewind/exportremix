"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Database, CheckCircle2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface APIConnection {
  id: string
  name: string
  status: "connected" | "disconnected" | "connecting"
  lastSync?: string
}

const mockAPIs = [
  { id: "cbp", name: "U.S. Customs and Border Protection", description: "Real-time customs data" },
  { id: "wto", name: "World Trade Organization", description: "Global trade statistics" },
  { id: "usitc", name: "U.S. International Trade Commission", description: "Tariff and trade data" },
]

export function APIConnector() {
  const { toast } = useToast()
  const [connections, setConnections] = useState<APIConnection[]>([])
  const [apiKey, setApiKey] = useState("")

  const connectAPI = (apiId: string, apiName: string) => {
    setConnections((prev) => [...prev, { id: apiId, name: apiName, status: "connecting" }])

    // Simulate API connection
    setTimeout(() => {
      setConnections((prev) =>
        prev.map((conn) =>
          conn.id === apiId
            ? {
                ...conn,
                status: "connected",
                lastSync: new Date().toLocaleString(),
              }
            : conn,
        ),
      )

      toast({
        title: "API Connected",
        description: `Successfully connected to ${apiName}`,
      })
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available APIs</h3>
        <div className="grid gap-4">
          {mockAPIs.map((api) => {
            const connection = connections.find((c) => c.id === api.id)
            const isConnected = connection?.status === "connected"
            const isConnecting = connection?.status === "connecting"

            return (
              <Card key={api.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Database className="w-6 h-6 text-secondary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold">{api.name}</h4>
                      <p className="text-sm text-muted-foreground">{api.description}</p>
                      {isConnected && connection.lastSync && (
                        <p className="text-xs text-muted-foreground">Last synced: {connection.lastSync}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isConnected ? (
                      <div className="flex items-center gap-2 text-green-500">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-medium">Connected</span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => connectAPI(api.id, api.name)}
                        disabled={isConnecting}
                        variant="outline"
                        size="sm"
                      >
                        {isConnecting ? "Connecting..." : "Connect"}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
          <div className="space-y-2 flex-1">
            <h4 className="font-semibold">Custom API Connection</h4>
            <p className="text-sm text-muted-foreground">
              Connect your own data sources by providing an API key or endpoint
            </p>
            <div className="space-y-3 pt-2">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <Button size="sm" disabled={!apiKey}>
                Connect Custom API
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
