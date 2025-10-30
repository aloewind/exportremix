"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Navigation, CheckCircle2, TrendingUp, Shield } from "lucide-react"

interface AlertDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  alert: {
    id: string
    type?: string
    alert_type?: string
    severity: string
    title: string
    description: string
    impact: string
    recommendation: string
    confidence?: number
    source?: string
    data?: {
      affectedRegions?: string[]
      estimatedImpact?: string
    }
  }
}

const typeIcons = {
  surge: AlertTriangle,
  delay: Clock,
  reroute: Navigation,
  compliance: CheckCircle2,
  tariff_surge: TrendingUp,
  policy_change: AlertTriangle,
  compliance_update: CheckCircle2,
  trade_restriction: Shield,
}

const severityColors: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
}

export function AlertDetailsDialog({ open, onOpenChange, alert }: AlertDetailsDialogProps) {
  const alertType = alert.type || alert.alert_type || "surge"
  const Icon = typeIcons[alertType as keyof typeof typeIcons] || AlertTriangle

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{alert.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={
                    (severityColors[alert.severity] as "default" | "destructive" | "outline" | "secondary") ||
                    "secondary"
                  }
                >
                  {alert.severity.toUpperCase()}
                </Badge>
                {alert.confidence && <Badge variant="outline">{alert.confidence}% Confidence</Badge>}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{alert.description}</p>
          </div>

          {alert.source && (
            <div>
              <h4 className="font-semibold mb-2">Source</h4>
              <p className="text-sm text-muted-foreground">{alert.source}</p>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-2">Impact Analysis</h4>
            <p className="text-sm text-muted-foreground">{alert.impact}</p>
            {alert.data?.estimatedImpact && (
              <p className="text-sm text-muted-foreground mt-2">
                <span className="font-medium">Estimated Impact:</span> {alert.data.estimatedImpact}
              </p>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-2">Recommended Actions</h4>
            <p className="text-sm text-muted-foreground">{alert.recommendation}</p>
          </div>

          {alert.data?.affectedRegions && alert.data.affectedRegions.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Affected Regions</h4>
              <div className="flex flex-wrap gap-2">
                {alert.data.affectedRegions.map((region) => (
                  <Badge key={region} variant="outline">
                    {region}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">Alert ID: {alert.id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
