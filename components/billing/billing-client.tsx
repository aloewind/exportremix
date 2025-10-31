"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { SUBSCRIPTION_TIERS } from "@/lib/subscription-tiers"
import { startCheckoutSession, createPortalSession } from "@/app/actions/stripe"
import { CancelSubscriptionDialog } from "./cancel-subscription-dialog"
import {
  Check,
  Sparkles,
  Zap,
  Users,
  CreditCard,
  Download,
  ExternalLink,
  Calendar,
  DollarSign,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "@/hooks/use-translations"

interface BillingClientProps {
  subscription: any
  usage: any[]
}

interface Invoice {
  id: string
  amount: number
  currency: string
  status: string
  created: number
  invoice_pdf: string | null
  hosted_invoice_url: string | null
}

interface PaymentMethod {
  id: string
  brand: string
  last4: string
  exp_month: number
  exp_year: number
}

export function BillingClient({ subscription, usage }: BillingClientProps) {
  const [loading, setLoading] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const t = useTranslations()
  const currentTier = SUBSCRIPTION_TIERS.find((tier) => tier.id === subscription?.tier) || {
    name: "free",
    priceInCents: 0,
    description: "",
    features: [],
    limits: {
      requestsPerMonth: 100,
      maxFileSize: 10,
      maxFilesPerMonth: 50,
    },
  }

  useEffect(() => {
    console.log("[v0] Billing - Subscription data:", subscription)
    console.log("[v0] Billing - Current tier:", subscription?.tier)
    console.log("[v0] Billing - Status:", subscription?.status)

    const fetchBillingData = async () => {
      if (!subscription?.tier || subscription?.tier === "free") {
        setLoadingData(false)
        return
      }

      try {
        const [invoicesRes, paymentMethodsRes] = await Promise.all([
          fetch("/api/billing/history"),
          fetch("/api/billing/payment-methods"),
        ])

        if (invoicesRes.ok) {
          const data = await invoicesRes.json()
          setInvoices(data.invoices || [])
        }

        if (paymentMethodsRes.ok) {
          const data = await paymentMethodsRes.json()
          setPaymentMethods(data.paymentMethods || [])
        }
      } catch (error) {
        console.error("[v0] Error fetching billing data:", error)
      } finally {
        setLoadingData(false)
      }
    }

    fetchBillingData()
  }, [subscription])

  const handleUpgrade = async (tierId: string) => {
    try {
      setLoading(true)
      await startCheckoutSession(tierId)
    } catch (error) {
      toast.error("Failed to start checkout")
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      setLoading(true)
      await createPortalSession()
    } catch (error) {
      toast.error("Failed to open billing portal")
      setLoading(false)
    }
  }

  const handleCancelSuccess = () => {
    window.location.reload()
  }

  // Calculate total usage for the month
  const totalUsage = usage.reduce((sum, u) => sum + u.count, 0)
  const limit =
    "limits" in currentTier &&
    currentTier.limits &&
    typeof currentTier.limits === "object" &&
    "requestsPerMonth" in currentTier.limits
      ? (currentTier.limits as { requestsPerMonth: number }).requestsPerMonth
      : "unlimited"
  const usagePercent = limit === "unlimited" ? 0 : (totalUsage / (limit as number)) * 100

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">{t.billing.title}</h1>
          <p className="text-muted-foreground mt-2">{t.billing.description}</p>
        </div>

        {subscription?.cancel_at_period_end && subscription?.current_period_end && (
          <Card className="border-destructive/50 bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">{t.billing.subscriptionCancelled}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {(() => {
                    const key = "subscriptionCancelledDesc" as keyof typeof t.billing
                    const desc =
                      key in t.billing && typeof t.billing[key] === "string" ? (t.billing[key] as string) : null
                    return desc
                      ? desc.replace("{date}", new Date(subscription.current_period_end).toLocaleDateString())
                      : `Your subscription will remain active until ${new Date(subscription.current_period_end).toLocaleDateString()}`
                  })()}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Current Plan */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold">
                  {t.billing[currentTier.name]} {t.billing.plan}
                </h2>
                <Badge
                  variant={
                    subscription?.tier === "pro" || subscription?.tier === "enterprise" ? "default" : "secondary"
                  }
                  className="text-sm"
                >
                  {subscription?.cancel_at_period_end
                    ? t.billing.cancelling
                    : subscription?.tier === "pro" || subscription?.tier === "enterprise"
                      ? t.billing.active
                      : t.billing.freeTier}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-2">{currentTier.description}</p>
              {subscription?.tier === "pro" || subscription?.tier === "enterprise" ? (
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {subscription?.cancel_at_period_end ? t.billing.activeUntil : t.billing.renewsOn}{" "}
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              ) : null}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">${(currentTier.priceInCents / 100).toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">{t.billing.perMonth}</div>
            </div>
          </div>

          {subscription?.tier === "free" && (
            <div className="flex gap-3 mt-6">
              <Button onClick={() => handleUpgrade("pro")} disabled={loading} className="flex-1 gap-2">
                <Sparkles className="w-4 h-4" />
                {t.billing.upgradeToPro}
              </Button>
              <Button
                onClick={() => handleUpgrade("enterprise")}
                disabled={loading}
                variant="secondary"
                className="flex-1 gap-2"
              >
                <Users className="w-4 h-4" />
                {t.billing.goEnterprise}
              </Button>
            </div>
          )}

          {subscription?.tier === "pro" || subscription?.tier === "enterprise" ? (
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleManageSubscription}
                disabled={loading}
                variant="outline"
                className="flex-1 bg-transparent"
              >
                {t.billing.manageSubscription}
              </Button>
              {!subscription?.cancel_at_period_end && (
                <Button
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={loading}
                  variant="outline"
                  className="flex-1 text-destructive hover:text-destructive"
                >
                  {t.billing.cancelSubscription}
                </Button>
              )}
            </div>
          ) : null}
        </Card>

        {subscription?.tier === "pro" || subscription?.tier === "enterprise" ? (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                <h3 className="text-xl font-semibold">{t.billing.paymentMethods}</h3>
              </div>
              <Button variant="outline" size="sm" onClick={handleManageSubscription} disabled={loading}>
                <ExternalLink className="w-4 h-4 mr-2" />
                {t.billing.manage}
              </Button>
            </div>

            {loadingData ? (
              <div className="text-sm text-muted-foreground">{t.billing.loadingPaymentMethods}</div>
            ) : paymentMethods.length > 0 ? (
              <div className="space-y-3">
                {paymentMethods.map((pm) => (
                  <div key={pm.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium capitalize">
                          {pm.brand} •••• {pm.last4}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t.billing.expires} {pm.exp_month}/{pm.exp_year}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{t.billing.default}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t.billing.noPaymentMethods}</p>
            )}
          </Card>
        ) : null}

        {subscription?.tier === "pro" || subscription?.tier === "enterprise" ? (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5" />
              <h3 className="text-xl font-semibold">{t.billing.billingHistory}</h3>
            </div>

            {loadingData ? (
              <div className="text-sm text-muted-foreground">{t.billing.loadingBillingHistory}</div>
            ) : invoices.length > 0 ? (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Download className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">
                          ${(invoice.amount / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(invoice.created * 1000).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={invoice.status === "paid" ? "default" : "secondary"} className="capitalize">
                        {invoice.status === "paid" ? t.billing.paid : invoice.status}
                      </Badge>
                      {invoice.invoice_pdf && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t.billing.noBillingHistory}</p>
            )}
          </Card>
        ) : null}

        {/* Usage This Month */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">{t.billing.usageThisMonth}</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t.billing.totalRequests}</span>
                <span className="text-sm text-muted-foreground">
                  {totalUsage} / {limit === "unlimited" ? t.billing.unlimited : limit}
                </span>
              </div>
              {limit !== "unlimited" && <Progress value={Math.min(usagePercent, 100)} className="h-2" />}
            </div>

            {usage.map((u) => (
              <div key={u.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground capitalize">{u.action_type.replace("_", " ")}</span>
                <span className="font-medium">{u.count}</span>
              </div>
            ))}

            {subscription?.tier === "free" && usagePercent > 80 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mt-4">
                <p className="text-sm font-medium text-destructive">{t.billing.approachingLimit}</p>
                <p className="text-sm text-muted-foreground mt-1">{t.billing.approachingLimitDesc}</p>
              </div>
            )}
          </div>
        </Card>

        <Separator />

        <div>
          <h3 className="text-2xl font-semibold mb-6">{t.billing.allPlans}</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {SUBSCRIPTION_TIERS.map((tier) => (
              <Card
                key={tier.id}
                className={`p-6 ${tier.id === subscription?.tier ? "border-primary" : ""} ${tier.id === "pro" ? "border-primary/50" : ""}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-semibold">{tier.name}</h4>
                  {tier.id === "pro" && <Zap className="w-5 h-5 text-primary" />}
                  {tier.id === "enterprise" && <Users className="w-5 h-5 text-secondary" />}
                </div>
                <div className="text-3xl font-bold mb-2">${(tier.priceInCents / 100).toFixed(0)}</div>
                <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {tier.id !== subscription?.tier && (
                  <Button
                    onClick={() => handleUpgrade(tier.id)}
                    disabled={loading}
                    className="w-full"
                    variant={tier.id === "enterprise" ? "secondary" : "default"}
                  >
                    {tier.id === "free" ? t.billing.downgrade : `${t.billing.upgradeTo} ${tier.name}`}
                  </Button>
                )}
                {tier.id === subscription?.tier && (
                  <Badge variant="outline" className="w-full justify-center py-2">
                    {t.billing.currentPlanBadge}
                  </Badge>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>

      <CancelSubscriptionDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onSuccess={handleCancelSuccess}
        currentPeriodEnd={subscription?.current_period_end}
      />
    </DashboardLayout>
  )
}
