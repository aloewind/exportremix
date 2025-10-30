"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Settings, Bell, CreditCard, Crown, TrendingUp, Check, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { LanguageSelector } from "@/components/settings/language-selector"
import type { User } from "@supabase/supabase-js"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { useTranslations } from "@/hooks/use-translations"

interface SettingsClientProps {
  user: User
  subscription: {
    tier: string
    status: string
    stripe_subscription_id?: string
  } | null
  usage: Array<{
    action_type: string
    count: number
  }>
  locale: string
}

export function SettingsClient({ user, subscription, usage, locale }: SettingsClientProps) {
  const t = useTranslations()
  const { toast } = useToast()
  const router = useRouter()
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [emailPreferences, setEmailPreferences] = useState({
    policyAlerts: true,
    weeklyDigest: true,
    systemUpdates: false,
  })

  const totalUsage = usage.reduce((sum, u) => sum + u.count, 0)
  const tier = subscription?.tier || "free"
  const isPro = tier === "pro"
  const usageLimit = isPro ? "unlimited" : 100
  const usagePercentage = isPro ? 0 : Math.min((totalUsage / 100) * 100, 100)

  const handleConfigureEmail = () => {
    setEmailDialogOpen(true)
  }

  const handleSaveEmailPreferences = async () => {
    try {
      const response = await fetch("/api/user/email-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPreferences),
      })

      if (!response.ok) throw new Error("Failed to save preferences")

      toast({
        title: "Email Preferences Saved",
        description: "Your notification preferences have been updated successfully.",
      })
      setEmailDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save email preferences. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEnablePush = async () => {
    try {
      console.log("[v0] Enabling push notifications...")

      const emailResponse = await fetch("/api/user/email-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policyAlerts: true,
          weeklyDigest: true,
          systemUpdates: true,
        }),
      })

      console.log("[v0] Email preferences response status:", emailResponse.status)

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json()
        console.log("[v0] Email preferences error:", errorData)
        throw new Error("Failed to enable email notifications")
      }

      console.log("[v0] Email notifications enabled successfully")

      if (!("Notification" in window)) {
        console.log("[v0] Push notifications not supported in browser")
        toast({
          title: "Not Supported",
          description: "Push notifications are not supported in your browser.",
          variant: "destructive",
        })
        return
      }

      console.log("[v0] Requesting notification permission...")
      const permission = await Notification.requestPermission()
      console.log("[v0] Notification permission result:", permission)

      if (permission === "granted") {
        setPushEnabled(true)
        setEmailPreferences({
          policyAlerts: true,
          weeklyDigest: true,
          systemUpdates: true,
        })
        console.log("[v0] Push notifications enabled successfully")
        toast({
          title: "Notifications Enabled",
          description: "You will now receive both email and push notifications for alerts.",
        })
      } else {
        console.log("[v0] Notification permission denied")
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Push notification error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to enable notifications. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{t.settings.title}</h1>
              <p className="text-muted-foreground mt-1">{t.settings.description}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="notifications">{t.settings.notifications}</TabsTrigger>
            <TabsTrigger value="language">{t.settings.language}</TabsTrigger>
            <TabsTrigger value="account">{t.settings.account}</TabsTrigger>
            <TabsTrigger value="billing">{t.settings.billing}</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-semibold">{t.settings.notificationPreferences}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{t.settings.notificationPreferencesDesc}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="space-y-1">
                    <p className="font-medium">{t.settings.emailNotifications}</p>
                    <p className="text-sm text-muted-foreground">{t.settings.emailNotificationsDesc}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleConfigureEmail}>
                    {t.settings.configure}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="space-y-1">
                    <p className="font-medium">{t.settings.pushNotifications}</p>
                    <p className="text-sm text-muted-foreground">{t.settings.pushNotificationsDesc}</p>
                  </div>
                  <Button
                    variant={pushEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={handleEnablePush}
                    disabled={pushEnabled}
                  >
                    {pushEnabled ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        {t.settings.enabled}
                      </>
                    ) : (
                      t.settings.enable
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t.settings.usageThisMonth}</h3>
                <Badge variant={isPro ? "default" : "secondary"} className="gap-1">
                  {isPro && <Crown className="w-3 h-3" />}
                  {isPro ? t.settings.proPlan : t.settings.freePlan}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t.settings.totalRequests}</span>
                    <span className="font-semibold">
                      {totalUsage} / {usageLimit === "unlimited" ? "∞" : usageLimit}
                    </span>
                  </div>
                  {!isPro && <Progress value={usagePercentage} className="h-2" />}
                </div>

                {usage.map((u) => (
                  <div key={u.action_type} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{u.action_type.replace("_", " ")}</span>
                    <span className="font-medium">{u.count}</span>
                  </div>
                ))}
              </div>

              {!isPro && totalUsage >= 80 && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{t.settings.approachingUsageLimit}</p>
                      <p className="text-sm text-muted-foreground">
                        {t.settings.approachingUsageLimitDesc
                          .replace("{used}", totalUsage.toString())
                          .replace("{limit}", usageLimit.toString())}
                      </p>
                      <Button size="sm" onClick={() => router.push("/dashboard/billing")}>
                        {t.settings.upgradeNow}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="language" className="space-y-6">
            <Card className="p-6">
              <LanguageSelector currentLocale={locale} />
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card className="p-6 space-y-6">
              <h3 className="text-xl font-semibold">{t.settings.accountInformation}</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t.settings.email}</Label>
                  <Input id="email" type="email" defaultValue={user.email || ""} disabled />
                </div>

                <Button>{t.settings.saveChanges}</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-semibold">{t.settings.subscriptionPlan}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{t.settings.subscriptionPlanDesc}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className={`p-6 space-y-4 border-2 ${!isPro ? "border-primary" : ""}`}>
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold">Free</h4>
                    <p className="text-3xl font-bold">$0</p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li>• 100 requests/month</li>
                    <li>• Basic predictions</li>
                    <li>• Email support</li>
                    <li>• Standard features</li>
                  </ul>
                  {!isPro && <Badge variant="secondary">Current Plan</Badge>}
                </Card>

                <Card className={`p-6 space-y-4 border-2 ${isPro ? "border-primary" : ""}`}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-semibold">Pro</h4>
                      <Crown className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-3xl font-bold">$99</p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li>• Unlimited requests</li>
                    <li>• Advanced AI agents</li>
                    <li>• Priority support</li>
                    <li>• Custom integrations</li>
                    <li>• Export & sharing</li>
                  </ul>
                  {isPro ? (
                    <Badge variant="default" className="gap-1">
                      <Crown className="w-3 h-3" />
                      Current Plan
                    </Badge>
                  ) : (
                    <Button className="w-full" onClick={() => router.push("/dashboard/billing")}>
                      Upgrade to Pro
                    </Button>
                  )}
                </Card>
              </div>

              <div className="flex items-center justify-center">
                <Button variant="outline" onClick={() => router.push("/dashboard/billing")}>
                  {t.settings.viewFullBillingDetails}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              {t.settings.emailNotificationSettings}
            </DialogTitle>
            <DialogDescription>{t.settings.emailNotificationSettingsDesc}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">{t.settings.policyAlerts}</p>
                <p className="text-sm text-muted-foreground">{t.settings.policyAlertsDesc}</p>
              </div>
              <Switch
                checked={emailPreferences.policyAlerts}
                onCheckedChange={(checked) => setEmailPreferences({ ...emailPreferences, policyAlerts: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">{t.settings.weeklyDigest}</p>
                <p className="text-sm text-muted-foreground">{t.settings.weeklyDigestDesc}</p>
              </div>
              <Switch
                checked={emailPreferences.weeklyDigest}
                onCheckedChange={(checked) => setEmailPreferences({ ...emailPreferences, weeklyDigest: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">{t.settings.systemUpdates}</p>
                <p className="text-sm text-muted-foreground">{t.settings.systemUpdatesDesc}</p>
              </div>
              <Switch
                checked={emailPreferences.systemUpdates}
                onCheckedChange={(checked) => setEmailPreferences({ ...emailPreferences, systemUpdates: checked })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              {t.settings.cancel}
            </Button>
            <Button onClick={handleSaveEmailPreferences}>{t.settings.savePreferences}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
