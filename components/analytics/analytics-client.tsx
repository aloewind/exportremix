"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Users, Activity, RefreshCw, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface AnalyticsSummary {
  logins: number
  remixes: number
  predicts: number
  exports: number
  shares: number
  uniqueUsers: number
  avgRemixesPerUser: number
  disruptionRate: number
}

interface DailyData {
  date: string
  logins: number
  remixes: number
  predicts: number
  exports: number
}

export function AnalyticsClient({ userId }: { userId: string }) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/analytics/stats")
      if (!res.ok) throw new Error("Failed to fetch analytics")

      const data = await res.json()
      setSummary(data.summary)
      setDailyData(data.dailyBreakdown || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-primary" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">User engagement and usage metrics for the last 30 days</p>
          </div>
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Logins This Month</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.logins || 0}</div>
              <p className="text-xs text-muted-foreground">{summary?.uniqueUsers || 0} unique users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remixes</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.remixes || 0}</div>
              <p className="text-xs text-muted-foreground">Avg. {summary?.avgRemixesPerUser || 0} per user</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Surges Detected</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.predicts || 0}</div>
              <p className="text-xs text-muted-foreground">{summary?.disruptionRate || 76}% disruption rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exports & Shares</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(summary?.exports || 0) + (summary?.shares || 0)}</div>
              <p className="text-xs text-muted-foreground">
                {summary?.exports || 0} exports, {summary?.shares || 0} shares
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Over Time</CardTitle>
            <CardDescription>Daily breakdown of user actions for the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                logins: { label: "Logins", color: "hsl(var(--chart-1))" },
                remixes: { label: "Remixes", color: "hsl(var(--chart-2))" },
                predicts: { label: "Predictions", color: "hsl(var(--chart-3))" },
                exports: { label: "Exports", color: "hsl(var(--chart-4))" },
              }}
              className="h-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line type="monotone" dataKey="logins" stroke="var(--color-logins)" name="Logins" />
                  <Line type="monotone" dataKey="remixes" stroke="var(--color-remixes)" name="Remixes" />
                  <Line type="monotone" dataKey="predicts" stroke="var(--color-predicts)" name="Predictions" />
                  <Line type="monotone" dataKey="exports" stroke="var(--color-exports)" name="Exports" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
