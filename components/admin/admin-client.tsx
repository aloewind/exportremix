"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Activity,
  TrendingUp,
  Shield,
  RefreshCw,
  TestTube,
  BarChart3,
  Settings,
  Info,
  Zap,
  UserCog,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { RoleManagement } from "@/components/admin/role-management"

interface User {
  id: string
  email: string
  full_name: string
  role: string
  tier: string
  status: string
  totalRequests: number
  createdAt: string
  onboardingCompleted: boolean
}

interface UsageStats {
  totalUsers: number
  tierCounts: { free: number; pro: number }
  totalRequests: number
  actionBreakdown: Record<string, number>
}

export function AdminClient({ userId, userRole }: { userId: string; userRole: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [testMode, setTestMode] = useState(false)
  const { toast } = useToast()

  const isAdmin = userRole === "admin"
  const isManager = userRole === "manager" || userRole === "admin"

  useEffect(() => {
    console.log("[v0] AdminClient loaded - User ID:", userId)
    console.log("[v0] User Role:", userRole)
    console.log("[v0] Is Admin:", isAdmin)
    console.log("[v0] Is Manager:", isManager)
  }, [userId, userRole, isAdmin, isManager])

  const fetchData = async () => {
    setLoading(true)
    try {
      console.log("[v0] Fetching admin data...")
      const [usersRes, statsRes] = await Promise.all([fetch("/api/admin/users"), fetch("/api/admin/usage-stats")])

      if (!usersRes.ok || !statsRes.ok) {
        throw new Error("Failed to fetch admin data")
      }

      const usersData = await usersRes.json()
      const statsData = await statsRes.json()

      console.log("[v0] Fetched users:", usersData.users?.length || 0)
      console.log("[v0] Fetched stats:", statsData)

      setUsers(usersData.users || [])
      setStats(statsData)
    } catch (error) {
      console.error("[v0] Error fetching admin data:", error)
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleTestModeToggle = (checked: boolean) => {
    setTestMode(checked)
    localStorage.setItem("testMode", checked.toString())
    toast({
      title: checked ? "Test Mode Enabled" : "Test Mode Disabled",
      description: checked ? "Using mock data for API calls (19% surge simulation)" : "Using real API calls",
    })
  }

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
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Shield className="w-10 h-10 text-primary" />
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  {isAdmin ? "Admin Control Panel" : "Manager Dashboard"}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs">
                    {userRole.toUpperCase()} ROLE
                  </Badge>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    {isAdmin ? "Full system access" : "API & usage management"}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl leading-relaxed">
              {isAdmin
                ? "Comprehensive control center for monitoring users, analyzing usage patterns, managing system health, and configuring platform settings."
                : "Manage API integrations, monitor team usage statistics, and configure operational settings for your organization."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button asChild variant="outline" size="sm">
                <a href="/dashboard/analytics" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </a>
              </Button>
            )}
            {isManager && (
              <Button asChild variant="outline" size="sm">
                <a href="/dashboard/integrations" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  API Settings
                </a>
              </Button>
            )}
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {isAdmin && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Admin Features</h2>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Admin Capabilities Overview</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>As an administrator, you have access to powerful tools for managing the ExportRemix platform:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                  <li>
                    <strong>User Management:</strong> View all users, their roles (admin, manager, user), subscription
                    tiers, and activity levels
                  </li>
                  <li>
                    <strong>Usage Analytics:</strong> Monitor API request volumes, track action types, and identify
                    usage patterns across the platform
                  </li>
                  <li>
                    <strong>System Health:</strong> Access real-time statistics on user growth, subscription
                    distribution, and system performance
                  </li>
                  <li>
                    <strong>Test Mode:</strong> Enable mock data for testing without affecting production metrics or
                    consuming API credits
                  </li>
                  <li>
                    <strong>Role Management:</strong> Assign and manage user access levels
                  </li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <UserCog className="w-5 h-5 text-primary" />
                    <CardTitle>User Role Management</CardTitle>
                  </div>
                  <CardDescription>Assign and manage user access levels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-semibold mb-1">How to Use:</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        Access the dedicated role management interface to assign Admin, Manager, or User roles to team
                        members. Search for users by name or email, filter by current role, and update permissions
                        individually or in batches.
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-1">Key Features:</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                        <li>
                          <strong>Search & Filter:</strong> Quickly find users by name, email, or role
                        </li>
                        <li>
                          <strong>Individual Updates:</strong> Change roles one user at a time with confirmation
                        </li>
                        <li>
                          <strong>Batch Operations:</strong> Update multiple users simultaneously
                        </li>
                        <li>
                          <strong>Real-time Sync:</strong> Changes reflect immediately in the database
                        </li>
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-1">Example:</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        To promote a user to Manager: Search for their email, click "Edit Role", select "Manager" from
                        the dropdown, and confirm. They'll immediately gain access to API integration management.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <CardTitle>User Management</CardTitle>
                  </div>
                  <CardDescription>Monitor and manage all platform users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-semibold mb-1">How to Use:</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        Navigate to the "Users" tab to view a comprehensive list of all registered users. Each entry
                        displays the user's name, email, role, subscription tier, and activity metrics.
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-1">Key Information:</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                        <li>
                          <strong>Role Badges:</strong> Admin (blue), Manager (gray), User (outline)
                        </li>
                        <li>
                          <strong>Tier Badges:</strong> Pro (blue), Free (gray), Enterprise (purple)
                        </li>
                        <li>
                          <strong>Status Indicators:</strong> Active users show a green badge
                        </li>
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-1">Example:</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        A user with "Admin" role and "Pro" tier who has made 150 requests will display all three badges,
                        showing their elevated access level and active usage.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <CardTitle>Usage Analytics</CardTitle>
                  </div>
                  <CardDescription>Track API usage and system metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-semibold mb-1">How to Use:</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        View the "Usage Breakdown" tab to see detailed API request statistics by action type. The
                        dashboard cards at the top provide quick insights into total users, pro subscriptions, and
                        request volumes.
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-1">Metrics Explained:</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                        <li>
                          <strong>Total Requests:</strong> All API calls made this month
                        </li>
                        <li>
                          <strong>Avg per User:</strong> Average requests divided by total users
                        </li>
                        <li>
                          <strong>Action Breakdown:</strong> Requests grouped by type (analyze, remix, etc.)
                        </li>
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-1">Example:</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        If you see 500 total requests with 50 users, the average is 10 requests per user. The breakdown
                        might show 300 "analyze" and 200 "remix" actions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TestTube className="w-5 h-5 text-primary" />
                    <CardTitle>Test Mode</CardTitle>
                  </div>
                  <CardDescription>Simulate API responses without real calls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-semibold mb-1">How to Use:</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        Toggle the "Test Mode" switch in the top-right corner to enable mock data responses. This allows
                        you to test features without consuming API credits or affecting production metrics.
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-1">When to Use:</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                        <li>Testing new features before production deployment</li>
                        <li>Demonstrating platform capabilities to stakeholders</li>
                        <li>Training new team members without real data impact</li>
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-1">Example:</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        Enable Test Mode to simulate a 19% tariff surge prediction without making actual API calls to
                        external trade data sources.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <TestTube className="w-5 h-5 text-muted-foreground" />
                      <Label htmlFor="test-mode-inline">Test Mode</Label>
                      <Switch id="test-mode-inline" checked={testMode} onCheckedChange={handleTestModeToggle} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    <CardTitle>System Configuration</CardTitle>
                  </div>
                  <CardDescription>Access advanced settings and integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-semibold mb-1">How to Use:</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        Click the "Analytics" button to access detailed platform analytics, or navigate to API Settings
                        to configure external integrations and data sources.
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-1">Available Settings:</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                        <li>
                          <strong>Analytics Dashboard:</strong> Deep-dive into user behavior and trends
                        </li>
                        <li>
                          <strong>API Integrations:</strong> Configure CBP, WTO, ITC data sources
                        </li>
                        <li>
                          <strong>Email Preferences:</strong> Manage notification settings
                        </li>
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-1">Example:</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        Access the Analytics page to view conversion funnels, retention rates, and feature adoption
                        metrics across different user segments.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {isManager && !isAdmin && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Manager Features</h2>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Manager Capabilities Overview</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>As a manager, you can configure operational settings and monitor team performance:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                  <li>
                    <strong>API Configuration:</strong> Enable/disable external data integrations (CBP, WTO, ITC)
                  </li>
                  <li>
                    <strong>Usage Monitoring:</strong> Track your team's API consumption and identify optimization
                    opportunities
                  </li>
                  <li>
                    <strong>Custom Integrations:</strong> Add and manage custom API endpoints for specialized data
                    sources
                  </li>
                </ul>
              </AlertDescription>
            </Alert>

            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  <CardTitle>API Integration Management</CardTitle>
                </div>
                <CardDescription>Configure external data sources and custom endpoints</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-semibold mb-1">How to Use:</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Navigate to the API Settings page to enable or disable real-time data integrations. Toggle
                      switches control whether the platform uses live data from CBP (Customs and Border Protection), WTO
                      (World Trade Organization), and ITC (International Trade Commission).
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-1">Making Modifications:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                      <li>Click "API Settings" button in the top-right corner</li>
                      <li>Toggle the switch for the desired integration (CBP, WTO, or ITC)</li>
                      <li>Changes are saved automatically and take effect immediately</li>
                      <li>When disabled, the system falls back to cached or mock data</li>
                    </ol>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-1">Example:</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      If you're experiencing slow response times, disable the WTO integration temporarily. The AI will
                      use cached trade data while you investigate the API performance issue.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {isAdmin && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Platform Statistics
            </h3>
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">All registered accounts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pro Users</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.tierCounts?.pro || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stats?.tierCounts?.free || 0} free users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalRequests || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">API calls this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg per User</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.totalUsers ? Math.round((stats?.totalRequests || 0) / stats.totalUsers) : 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Requests per user</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <Tabs defaultValue={isManager && !isAdmin ? "usage" : "roles"} className="space-y-4">
          <TabsList>
            {isAdmin && <TabsTrigger value="roles">Role Management</TabsTrigger>}
            {isAdmin && <TabsTrigger value="users">User Directory</TabsTrigger>}
            <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          </TabsList>

          {isAdmin && (
            <TabsContent value="roles" className="space-y-4">
              <RoleManagement />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Directory</CardTitle>
                  <CardDescription>
                    Complete list of all platform users with their roles, subscription tiers, and activity metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{user.full_name || user.email}</p>
                            <Badge
                              variant={
                                user.role === "admin" ? "default" : user.role === "manager" ? "secondary" : "outline"
                              }
                            >
                              {user.role}
                            </Badge>
                            <Badge variant={user.tier === "pro" ? "default" : "secondary"}>{user.tier}</Badge>
                            {user.status === "active" && (
                              <Badge variant="outline" className="text-green-500 border-green-500">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.totalRequests} requests • Joined {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="usage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Usage Breakdown</CardTitle>
                <CardDescription>
                  {isAdmin
                    ? "Detailed breakdown of all API requests by action type for the current month"
                    : "Your team's API usage patterns and request distribution by action type"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.actionBreakdown &&
                    Object.entries(stats.actionBreakdown).map(([action, count]) => (
                      <div key={action} className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-primary" />
                          <span className="font-medium capitalize">{action.replace("_", " ")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{count} requests</span>
                          <Badge variant="outline">
                            {stats.totalRequests > 0 ? `${Math.round((count / stats.totalRequests) * 100)}%` : "0%"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
