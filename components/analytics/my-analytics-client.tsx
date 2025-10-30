"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Sparkles, Download, Share2, AlertTriangle, Activity } from "lucide-react"

interface MyAnalyticsClientProps {
  stats: {
    totalEvents: number
    remixes: number
    predictions: number
    exports: number
    shares: number
    surgesDetected: number
  }
  events: Array<{
    id: string
    event_type: string
    event_data: any
    created_at: string
  }>
}

export function MyAnalyticsClient({ stats, events }: MyAnalyticsClientProps) {
  const statCards = [
    {
      label: "Total Actions",
      value: stats.totalEvents,
      icon: Activity,
      color: "text-blue-500",
    },
    {
      label: "Remixes Created",
      value: stats.remixes,
      icon: Sparkles,
      color: "text-purple-500",
    },
    {
      label: "Predictions Run",
      value: stats.predictions,
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      label: "Surges Detected",
      value: stats.surgesDetected,
      icon: AlertTriangle,
      color: "text-primary",
      description: "76% disruption rate simulated",
    },
    {
      label: "Exports Generated",
      value: stats.exports,
      icon: Download,
      color: "text-yellow-500",
    },
    {
      label: "Shares Created",
      value: stats.shares,
      icon: Share2,
      color: "text-cyan-500",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">My Analytics</h1>
          <p className="text-muted-foreground mt-2">Track your personal usage and activity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.label} className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  {stat.description && <p className="text-xs text-muted-foreground">{stat.description}</p>}
                </div>
                <div className={`p-3 rounded-lg bg-background ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {events.slice(0, 10).map((event) => (
              <div key={event.id} className="flex items-center justify-between py-2 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{event.event_type}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(event.created_at).toLocaleDateString()} at{" "}
                    {new Date(event.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No activity yet. Start using the app!</p>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
