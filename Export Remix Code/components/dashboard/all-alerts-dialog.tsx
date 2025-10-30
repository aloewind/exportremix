"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Search, AlertTriangle, TrendingUp, DollarSign, Filter, X } from "lucide-react"

interface Alert {
  id: string
  type: "disruption" | "surge" | "savings"
  title: string
  description: string
  severity: "high" | "medium" | "low"
  timestamp: string
  route?: string
  impact?: string
}

interface AllAlertsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  alerts: Alert[]
}

export function AllAlertsDialog({ open, onOpenChange, alerts }: AllAlertsDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterSeverity, setFilterSeverity] = useState<string>("all")

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || alert.type === filterType
    const matchesSeverity = filterSeverity === "all" || alert.severity === filterSeverity
    return matchesSearch && matchesType && matchesSeverity
  })

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "disruption":
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case "surge":
        return <TrendingUp className="w-5 h-5 text-blue-500" />
      case "savings":
        return <DollarSign className="w-5 h-5 text-green-500" />
      default:
        return <AlertTriangle className="w-5 h-5" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setFilterType("all")
    setFilterSeverity("all")
  }

  const hasActiveFilters = searchQuery !== "" || filterType !== "all" || filterSeverity !== "all"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">All Active Alerts</DialogTitle>
          <DialogDescription>
            View and manage all prediction alerts. Filter by type, severity, or search for specific alerts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="disruption">Disruption</SelectItem>
                <SelectItem value="surge">Surge</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear filters">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredAlerts.length} of {alerts.length} alerts
            </span>
            {hasActiveFilters && (
              <Button variant="link" size="sm" onClick={clearFilters} className="h-auto p-0">
                Clear all filters
              </Button>
            )}
          </div>

          {/* Alerts list */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {filteredAlerts.length === 0 ? (
              <Card className="p-8 text-center">
                <Filter className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-lg font-semibold mb-1">No alerts found</p>
                <p className="text-sm text-muted-foreground">
                  {hasActiveFilters ? "Try adjusting your filters or search query" : "No active alerts at this time"}
                </p>
              </Card>
            ) : (
              filteredAlerts.map((alert) => (
                <Card key={alert.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">{getAlertIcon(alert.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-base leading-tight">{alert.title}</h3>
                        <Badge variant={getSeverityColor(alert.severity)} className="flex-shrink-0">
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {alert.type}
                          </Badge>
                        </span>
                        {alert.route && <span>Route: {alert.route}</span>}
                        {alert.impact && <span>Impact: {alert.impact}</span>}
                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
