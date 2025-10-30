"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Shield,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Download,
  Share2,
  Check,
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { AlertDetailsDialog } from "@/components/ai/alert-details-dialog"

interface PolicyAlert {
  id: string
  alert_type: string
  severity: string
  title: string
  description: string
  source: string
  impact: string
  recommendation: string
  confidence: number
  data: {
    affectedRegions: string[]
    estimatedImpact: string
  }
  is_read: boolean
  created_at: string
}

const severityColors = {
  high: "text-red-500 bg-red-500/10 border-red-500/20",
  medium: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  low: "text-blue-500 bg-blue-500/10 border-blue-500/20",
}

const typeIcons = {
  tariff_surge: TrendingUp,
  policy_change: AlertTriangle,
  compliance_update: CheckCircle2,
  trade_restriction: Shield,
}

export function PolicySentinelUpdater({ autoRun = false }: { autoRun?: boolean }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(false)
  const [alerts, setAlerts] = useState<PolicyAlert[]>([])
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [sharedAlerts, setSharedAlerts] = useState<Record<string, string>>({})
  const [sharingAlert, setSharingAlert] = useState<string | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<PolicyAlert | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/policy-sentinel/alerts")
      if (!response.ok) throw new Error("Failed to fetch alerts")
      const data = await response.json()
      setAlerts(data.alerts || [])
    } catch (error) {
      console.error("Error fetching alerts:", error)
    }
  }

  const runPolicySentinel = async () => {
    setIsChecking(true)
    try {
      const response = await fetch("/api/policy-sentinel/check", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Usage Limit Reached", {
            description: data.message || "Upgrade to Pro for unlimited policy checks.",
            action: {
              label: "Upgrade",
              onClick: () => router.push("/dashboard/billing"),
            },
          })
          return
        }
        throw new Error(data.error || "Failed to check policy updates")
      }

      setLastChecked(new Date())

      // Fetch updated alerts
      await fetchAlerts()

      if (data.alertsCreated > 0) {
        // Check if any high-severity alerts were created
        const highSeverityAlerts = alerts.filter((a) => a.severity === "high")
        if (highSeverityAlerts.length > 0) {
          const surgeAlert = highSeverityAlerts.find((a) => a.title.includes("19%") || a.title.includes("Surge"))
          if (surgeAlert) {
            toast.error("🚨 Critical Surge Alert", {
              description: surgeAlert.title,
              duration: 10000,
              action: {
                label: "View Details",
                onClick: () => {
                  // Scroll to alerts section
                  document.getElementById("policy-alerts")?.scrollIntoView({ behavior: "smooth" })
                },
              },
            })
          }
        }
      }

      toast.success(`Policy Sentinel Complete`, {
        description: `Found ${data.alertsCreated} new threat(s) from policy feeds (${data.source})`,
      })
    } catch (error) {
      console.error("Policy Sentinel error:", error)
      toast.error("Policy Sentinel Failed", {
        description: error instanceof Error ? error.message : "Failed to check policy updates",
      })
    } finally {
      setIsChecking(false)
    }
  }

  const handleExportAlerts = () => {
    try {
      const csvContent = [
        [
          "Type",
          "Severity",
          "Title",
          "Description",
          "Source",
          "Impact",
          "Recommendation",
          "Confidence",
          "Regions",
          "Estimated Impact",
        ],
        ...alerts.map((alert) => [
          alert.alert_type,
          alert.severity,
          alert.title,
          alert.description,
          alert.source,
          alert.impact,
          alert.recommendation,
          `${alert.confidence}%`,
          alert.data?.affectedRegions?.join("; ") || "",
          alert.data?.estimatedImpact || "",
        ]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `policy-alerts-${Date.now()}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success("Export Complete", {
        description: `Exported ${alerts.length} policy alert(s) to CSV`,
      })
    } catch (error) {
      toast.error("Export Failed", {
        description: "Failed to export alerts",
      })
    }
  }

  const createAlertShareLink = async (alert: PolicyAlert) => {
    setSharingAlert(alert.id)
    try {
      const response = await fetch("/api/shareable/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkType: "policy_alert",
          data: {
            alert_type: alert.alert_type,
            severity: alert.severity,
            title: alert.title,
            description: alert.description,
            source: alert.source,
            impact: alert.impact,
            recommendation: alert.recommendation,
            confidence: alert.confidence,
          },
        }),
      })

      if (!response.ok) throw new Error("Failed to create shareable link")

      const { shareUrl } = await response.json()
      setSharedAlerts((prev) => ({ ...prev, [alert.id]: shareUrl }))

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl)

      toast.success("Shareable Link Created", {
        description: "Link copied to clipboard. Share this alert with anyone!",
      })
    } catch (error) {
      toast.error("Failed to Create Link", {
        description: "Could not create shareable link",
      })
    } finally {
      setSharingAlert(null)
    }
  }

  const copyAlertLink = async (alertId: string) => {
    const link = sharedAlerts[alertId]
    if (link) {
      await navigator.clipboard.writeText(link)
      toast.success("Link Copied", {
        description: "Shareable link copied to clipboard",
      })
    }
  }

  const handleTakeAction = (alert: PolicyAlert) => {
    console.log("[v0] Take Action clicked for policy alert:", alert.alert_type)

    // Navigate to appropriate page based on alert type
    switch (alert.alert_type) {
      case "tariff_surge":
        toast.info("Navigating to Remix page to optimize your manifest")
        router.push("/dashboard/remix")
        break
      case "policy_change":
      case "compliance_update":
        toast.info("Navigating to Upload page to update documentation")
        router.push("/dashboard/upload")
        break
      case "trade_restriction":
        toast.info("Navigating to API Integrations to review restrictions")
        router.push("/dashboard/integrations")
        break
      default:
        toast.info("Navigating to dashboard overview")
        router.push("/dashboard")
    }
  }

  const handleViewDetails = (alert: PolicyAlert) => {
    console.log("[v0] View Details clicked for policy alert:", alert.id)
    setSelectedAlert(alert)
    setDetailsOpen(true)
  }

  useEffect(() => {
    // Fetch existing alerts on mount
    fetchAlerts()

    // Auto-run on mount if enabled
    if (autoRun) {
      runPolicySentinel()
    }

    // Auto-refresh alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [autoRun])

  return (
    <>
      <div className="space-y-6">
        {/* Policy Sentinel Control Card */}
        <Card className="p-4 md:p-6 bg-gradient-to-br from-background to-muted/20 border-primary/20">
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg md:text-xl font-semibold">Policy Sentinel Updater</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Auto-detecting hidden threats from WTO, CBP, USITC, and EU trade policy feeds
                </p>
                {lastChecked && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last checked: {lastChecked.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              {alerts.length > 0 && (
                <Button
                  onClick={handleExportAlerts}
                  variant="outline"
                  size="sm"
                  className="gap-2 flex-1 md:flex-none bg-transparent"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              )}
              <Button onClick={runPolicySentinel} disabled={isChecking} className="gap-2 flex-1 md:flex-none" size="sm">
                <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
                {isChecking ? "Scanning..." : "Run Check"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Policy Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-4" id="policy-alerts">
            <h3 className="text-base md:text-lg font-semibold">Recent Policy Threats</h3>
            {alerts.map((alert) => {
              const Icon = typeIcons[alert.alert_type as keyof typeof typeIcons] || AlertTriangle
              const colorClass = severityColors[alert.severity as keyof typeof severityColors]
              const isShared = sharedAlerts[alert.id]
              const isSharing = sharingAlert === alert.id

              return (
                <Card key={alert.id} className={`p-4 md:p-6 border-l-4 ${colorClass}`}>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
                      <div
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
                      >
                        <Icon className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <div className="flex-1 space-y-2 w-full">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                          <div className="w-full">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-semibold text-base md:text-lg">{alert.title}</h4>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium uppercase ${colorClass}`}>
                                {alert.severity}
                              </span>
                              <span className="text-xs px-2 py-1 rounded-full bg-muted">
                                {alert.confidence}% confidence
                              </span>
                            </div>
                            <p className="text-xs md:text-sm text-muted-foreground mt-1">Source: {alert.source}</p>
                          </div>
                        </div>
                        <p className="text-sm md:text-base text-muted-foreground">{alert.description}</p>

                        <div className="grid sm:grid-cols-2 gap-4 pt-2">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Impact</p>
                            <p className="text-xs md:text-sm text-muted-foreground">{alert.impact}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Estimated: {alert.data?.estimatedImpact}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Recommendation</p>
                            <p className="text-xs md:text-sm text-muted-foreground">{alert.recommendation}</p>
                            {alert.data?.affectedRegions && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Regions: {alert.data.affectedRegions.join(", ")}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                          <Button size="sm" className="w-full sm:w-auto" onClick={() => handleTakeAction(alert)}>
                            Take Action
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full sm:w-auto bg-transparent"
                            onClick={() => handleViewDetails(alert)}
                          >
                            View Details
                          </Button>
                          {!isShared ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full sm:w-auto bg-transparent gap-2"
                              onClick={() => createAlertShareLink(alert)}
                              disabled={isSharing}
                            >
                              <Share2 className="w-4 h-4" />
                              {isSharing ? "Creating..." : "Share"}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full sm:w-auto bg-transparent gap-2"
                              onClick={() => copyAlertLink(alert.id)}
                            >
                              <Check className="w-4 h-4" />
                              Copy Link
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Alert Details Dialog */}
      {selectedAlert && <AlertDetailsDialog open={detailsOpen} onOpenChange={setDetailsOpen} alert={selectedAlert} />}
    </>
  )
}
