"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AIInsights } from "@/components/ai/ai-insights"
import { PredictionAlerts } from "@/components/ai/prediction-alerts"
import { ManifestTable } from "@/components/dashboard/manifest-table"
import { FeaturesGrid } from "@/components/dashboard/features-grid"
import { BusinessPromptBar } from "@/components/dashboard/business-prompt-bar"
import { CustomAPIIntegrations } from "@/components/dashboard/custom-api-integrations"
import { RealTimeDataPage } from "@/components/dashboard/real-time-data-page"
import { TestEnterpriseButton } from "@/components/dashboard/test-enterprise-button"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AllAlertsDialog } from "@/components/dashboard/all-alerts-dialog"
import {
  Upload,
  Database,
  Sparkles,
  Download,
  Crown,
  TrendingUp,
  ArrowRight,
  Users,
  HelpCircle,
  UserCog,
} from "lucide-react"
import { generateMockManifestData, generatePredictionAlerts } from "@/lib/data-processor"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { PWAInstallPrompt } from "@/components/pwa/pwa-install-prompt"
import { OfflineDetector } from "@/components/pwa/offline-detector"
import { toast } from "sonner"
import { getMissingRequiredVars, getMissingOptionalVars } from "@/lib/env-check"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useTranslations } from "@/hooks/use-translations"

interface DashboardClientProps {
  user: User
  profile: {
    full_name?: string
    email: string
    onboarding_completed?: boolean
  } | null
  subscription?: {
    tier: string
    status: string
  }
  usage?: Array<{
    action_type: string
    count: number
  }>
}

export function DashboardClient({ user, profile, subscription, usage = [] }: DashboardClientProps) {
  const router = useRouter()
  const [manifestData, setManifestData] = useState(generateMockManifestData(15))
  const [alerts, setAlerts] = useState(generatePredictionAlerts())
  const [hasIntegrations, setHasIntegrations] = useState(false)
  const [showAllAlerts, setShowAllAlerts] = useState(false)
  const t = useTranslations()

  useEffect(() => {
    const missingRequired = getMissingRequiredVars()
    const missingOptional = getMissingOptionalVars()

    if (missingRequired.length > 0) {
      toast.error("Missing Required Variables", {
        description: `Add ${missingRequired.map((v) => v.key).join(", ")} in Vercel settings`,
        duration: 10000,
      })
    } else if (missingOptional.length > 0) {
      toast.info("Keyless Mode Active", {
        description: "Some features using fallbacks. Check env status for details.",
        duration: 5000,
      })
    }
  }, [])

  useEffect(() => {
    const verifyConnection = async () => {
      try {
        const response = await fetch("/api/openai/verify")
        const data = await response.json()

        if (data.success) {
          toast.success("AI Connected", {
            description: "Using OpenAI for predictions - full AI features available",
          })
        } else {
          toast.info("Keyless Mode Active", {
            description: "Using public APIs and mock data - no API keys required!",
          })
        }
      } catch (error) {
        console.error("[v0] Failed to verify connection:", error)
        toast.info("Keyless Mode Active", {
          description: "Running with public APIs and realistic mock data",
        })
      }
    }

    verifyConnection()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts(generatePredictionAlerts())
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const checkIntegrations = async () => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from("user_api_integrations")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_enabled", true)
        .limit(1)

      if (!error && data && data.length > 0) {
        setHasIntegrations(true)
      }
    }

    checkIntegrations()
  }, [user.id])

  const userName = profile?.full_name || user.email?.split("@")[0] || "User"
  const isPro = subscription?.tier === "pro"
  const isEnterprise = subscription?.tier === "enterprise"
  const isFree = !isPro && !isEnterprise

  const totalUsage = usage.reduce((sum, u) => sum + u.count, 0)
  const usageLimit = isPro || isEnterprise ? "unlimited" : 100
  const usagePercentage = isPro || isEnterprise ? 0 : Math.min((totalUsage / 100) * 100, 100)
  const isNearLimit = isFree && totalUsage >= 80

  const userTier = isEnterprise ? "enterprise" : isPro ? "pro" : "free"

  return (
    <>
      <PWAInstallPrompt />
      <OfflineDetector />

      <DashboardLayout>
        <div className="space-y-4 sm:space-y-6 w-full max-w-full">
          <TooltipProvider>
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold truncate">
                      {t.dashboard.welcome}, <span className="text-primary">{userName}</span>
                    </h1>
                    {isEnterprise ? (
                      <Badge variant="secondary" className="gap-1 flex-shrink-0">
                        <Users className="w-3 h-3" />
                        Enterprise
                      </Badge>
                    ) : isPro ? (
                      <Badge variant="default" className="gap-1 flex-shrink-0">
                        <Crown className="w-3 h-3" />
                        Pro
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 h-7 text-xs bg-transparent flex-shrink-0"
                        onClick={() => router.push("/dashboard/billing")}
                      >
                        Free
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                    Your central hub for AI-powered export intelligence
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent flex-1 sm:flex-initial"
                    onClick={() => router.push("/dashboard/upload")}
                  >
                    <Upload className="w-4 h-4" />
                    <span>{t.common.upload}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent flex-1 sm:flex-initial"
                    onClick={() => router.push("/dashboard/connect")}
                  >
                    <Database className="w-4 h-4" />
                    <span>{t.nav.connect}</span>
                  </Button>
                  <Button
                    size="sm"
                    className="gap-2 flex-1 sm:flex-initial"
                    onClick={() => router.push("/dashboard/remix")}
                  >
                    <Sparkles className="w-4 h-4" />
                    {t.nav.remix}
                  </Button>
                </div>
              </div>
            </div>
          </TooltipProvider>

          <TestEnterpriseButton userEmail={user.email || ""} currentTier={subscription?.tier || "free"} />

          {isEnterprise && (
            <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <UserCog className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm sm:text-base">User Roles Management</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Control team access with Admin, Manager, and User roles. Manage permissions, view analytics, and
                      assign responsibilities across your organization.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    console.log("[v0] Navigating to admin panel for role management")
                    router.push("/dashboard/admin")
                  }}
                  className="w-full sm:w-auto flex-shrink-0 text-xs sm:text-sm gap-2"
                >
                  <UserCog className="w-4 h-4" />
                  Manage Roles
                </Button>
              </div>
            </Card>
          )}

          {!isEnterprise && (
            <Card className="p-3 sm:p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="space-y-1 flex-1 w-full min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Monthly Usage</p>
                    {isNearLimit && <TrendingUp className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={usagePercentage} className="h-2 flex-1" />
                    <span className="text-sm font-semibold whitespace-nowrap">
                      {totalUsage} / {usageLimit}
                    </span>
                  </div>
                </div>
                {isNearLimit && (
                  <Button size="sm" onClick={() => router.push("/dashboard/billing")} className="w-full sm:w-auto">
                    Upgrade to Pro
                  </Button>
                )}
              </div>
            </Card>
          )}

          {isFree && (
            <Card className={`p-3 sm:p-4 ${isNearLimit ? "border-primary/50 bg-primary/5" : ""}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="space-y-1 flex-1 w-full min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Monthly Usage</p>
                    {isNearLimit && <TrendingUp className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={usagePercentage} className="h-2 flex-1" />
                    <span className="text-sm font-semibold whitespace-nowrap">
                      {totalUsage} / {usageLimit}
                    </span>
                  </div>
                </div>
                {isNearLimit && (
                  <Button size="sm" onClick={() => router.push("/dashboard/billing")} className="w-full sm:w-auto">
                    Upgrade to Pro
                  </Button>
                )}
              </div>
            </Card>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <BusinessPromptBar />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <p className="font-semibold mb-1">Prompt Bar Guide:</p>
                <p className="text-sm">
                  Use this prompt for shipping and export queries only. Enter business-specific requests like tariff
                  predictions, manifest remixing, or compliance checks. This is not a general chatbot - it's focused on
                  export harmony.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <CustomAPIIntegrations userId={user.id} />

          <RealTimeDataPage userId={user.id} hasIntegrations={hasIntegrations} />

          <TooltipProvider>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold">Your Features</h2>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="text-sm">
                      Hover over each feature card to see detailed information about capabilities, limits, and tier
                      requirements. Green checkmarks indicate features available in your current plan.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <FeaturesGrid userTier={userTier} />
            </div>
          </TooltipProvider>

          <TooltipProvider>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold">Real-Time Intelligence</h2>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="text-sm">
                      Alerts auto-refresh every 30 seconds. These are real-time AI suggestions for disruptions, surges,
                      and cost-saving opportunities. Hover over each alert for detailed recommendations.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <AIInsights />
            </div>
          </TooltipProvider>

          <Tabs defaultValue="alerts" className="space-y-6">
            <TabsList>
              <TabsTrigger value="alerts">Prediction Alerts</TabsTrigger>
              <TabsTrigger value="manifests">Active Manifests</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="alerts" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">{t.dashboard.activeAlerts}</h2>
                <Button variant="outline" size="sm" onClick={() => setShowAllAlerts(true)}>
                  {t.dashboard.viewAll}
                </Button>
              </div>
              <PredictionAlerts alerts={alerts} />
            </TabsContent>

            <TabsContent value="manifests" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Active Manifests</h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={() => {
                    const headers = ["Manifest ID", "Origin", "Destination", "Status", "Items", "Value", "Risk Level"]
                    const csvContent = [
                      headers.join(","),
                      ...manifestData.map((row) =>
                        [
                          row.id,
                          row.origin,
                          row.destination,
                          row.status?.toUpperCase() || "PENDING",
                          row.items || 0,
                          `$${row.value}`,
                          row.riskLevel?.toUpperCase() || "LOW",
                        ].join(","),
                      ),
                    ].join("\n")

                    const blob = new Blob([csvContent], { type: "text/csv" })
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = `manifests-${new Date().toISOString().split("T")[0]}.csv`
                    a.click()
                    window.URL.revokeObjectURL(url)
                  }}
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>
              <ManifestTable data={manifestData} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Tariff Trends</h3>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Chart visualization coming soon
                  </div>
                </Card>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Cost Optimization</h3>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Chart visualization coming soon
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <AllAlertsDialog
          open={showAllAlerts}
          onOpenChange={setShowAllAlerts}
          alerts={alerts.map((alert) => ({
            ...alert,
            type:
              alert.type === "delay" || alert.type === "reroute" || alert.type === "compliance"
                ? ("disruption" as const)
                : (alert.type as "surge" | "disruption" | "savings"),
          }))}
        />
      </DashboardLayout>
    </>
  )
}
