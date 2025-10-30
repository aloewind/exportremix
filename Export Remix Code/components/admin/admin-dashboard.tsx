"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Activity, DollarSign, TrendingUp } from "lucide-react"

interface AdminDashboardProps {
  users: any[]
  subscriptions: any[]
  usageStats: any[]
}

export function AdminDashboard({ users, subscriptions, usageStats }: AdminDashboardProps) {
  const totalUsers = users.length
  const activeSubscriptions = subscriptions.filter((s) => s.status === "active").length
  const totalRevenue = subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => {
      if (s.tier === "pro") return sum + 199
      if (s.tier === "enterprise") return sum + 499
      return sum
    }, 0)

  const totalUsage = usageStats.reduce((sum, stat) => sum + (stat.count || 0), 0)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="destructive">Admin Only</Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="user-stats">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{totalUsers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Activity className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Active Subscriptions</p>
              <p className="text-2xl font-bold">{activeSubscriptions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <DollarSign className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="text-2xl font-bold">${totalRevenue}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total API Calls</p>
              <p className="text-2xl font-bold">{totalUsage}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Users */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
        <div className="space-y-4">
          {users.slice(0, 10).map((user) => (
            <div key={user.id} className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-muted-foreground">{user.full_name || "No name"}</p>
              </div>
              <div className="flex items-center gap-2">
                {user.is_admin && <Badge variant="destructive">Admin</Badge>}
                <p className="text-sm text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Usage Statistics */}
      <Card className="p-6" data-testid="usage-stats">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-2" data-testid="recent-activity">
          {usageStats.slice(0, 20).map((stat) => (
            <div key={stat.id} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{stat.action_type}</span>
              <div className="flex items-center gap-4">
                <span className="font-medium">{stat.count} calls</span>
                <span className="text-muted-foreground">{stat.month}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
