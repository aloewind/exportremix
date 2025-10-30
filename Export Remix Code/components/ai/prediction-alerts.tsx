"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, Navigation, CheckCircle2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { PredictionAlert } from "@/lib/data-processor"
import { AlertDetailsDialog } from "./alert-details-dialog"

const severityColors = {
  high: "text-red-500 bg-red-500/10 border-red-500/20",
  medium: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  low: "text-blue-500 bg-blue-500/10 border-blue-500/20",
}

const typeIcons = {
  surge: AlertTriangle,
  delay: Clock,
  reroute: Navigation,
  compliance: CheckCircle2,
}

export function PredictionAlerts({ alerts }: { alerts: PredictionAlert[] }) {
  const router = useRouter()
  const [selectedAlert, setSelectedAlert] = useState<PredictionAlert | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const handleTakeAction = (alert: PredictionAlert) => {
    console.log("[v0] Take Action clicked for alert:", alert.type)

    // Navigate to appropriate page based on alert type
    switch (alert.type) {
      case "surge":
        toast.info("Navigating to Remix page to optimize your manifest")
        router.push("/dashboard/remix")
        break
      case "delay":
        toast.info("Navigating to Real-Time Data to monitor shipment status")
        router.push("/dashboard/api-data")
        break
      case "reroute":
        toast.info("Navigating to API Integrations to update routing")
        router.push("/dashboard/integrations")
        break
      case "compliance":
        toast.info("Navigating to Upload page to update documentation")
        router.push("/dashboard/upload")
        break
      default:
        toast.info("Navigating to dashboard overview")
        router.push("/dashboard")
    }
  }

  const handleViewDetails = (alert: PredictionAlert) => {
    console.log("[v0] View Details clicked for alert:", alert.id)
    setSelectedAlert(alert)
    setDetailsOpen(true)
  }

  return (
    <>
      <div className="space-y-4">
        {alerts.map((alert) => {
          const Icon = typeIcons[alert.type]
          const colorClass = severityColors[alert.severity]

          return (
            <Card key={alert.id} className={`p-6 border-l-4 ${colorClass}`}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">{alert.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium uppercase ${colorClass}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{alert.description}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pl-16">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Impact</p>
                    <p className="text-sm text-muted-foreground">{alert.impact}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Recommendation</p>
                    <p className="text-sm text-muted-foreground">{alert.recommendation}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-16">
                  <Button size="sm" onClick={() => handleTakeAction(alert)}>
                    Take Action
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleViewDetails(alert)}>
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {selectedAlert && <AlertDetailsDialog open={detailsOpen} onOpenChange={setDetailsOpen} alert={selectedAlert} />}
    </>
  )
}
