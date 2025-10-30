"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Package } from "lucide-react"

interface InsightMetric {
  label: string
  value: string
  change: string
  trend: "up" | "down"
  icon: typeof TrendingUp
}

export function AIInsights() {
  const metrics: InsightMetric[] = [
    {
      label: "Predicted Savings",
      value: "$127,500",
      change: "+35% vs last month",
      trend: "up",
      icon: DollarSign,
    },
    {
      label: "Risk Score",
      value: "24/100",
      change: "-12 points",
      trend: "down",
      icon: TrendingDown,
    },
    {
      label: "Active Shipments",
      value: "156",
      change: "+8 this week",
      trend: "up",
      icon: Package,
    },
    {
      label: "Optimization Rate",
      value: "87%",
      change: "+5% improvement",
      trend: "up",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        const trendColor = metric.trend === "up" ? "text-green-500" : "text-red-500"

        return (
          <Card key={metric.label} className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold">{metric.value}</p>
              <p className={`text-sm ${trendColor}`}>{metric.change}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
