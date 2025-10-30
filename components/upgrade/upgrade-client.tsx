"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SUBSCRIPTION_TIERS } from "@/lib/subscription-tiers"
import { startPublicCheckoutSession } from "@/app/actions/stripe"
import { Check, Sparkles, Users } from "lucide-react"
import { toast } from "sonner"

interface UpgradeClientProps {
  currentTier?: string
  isAuthenticated: boolean
}

export function UpgradeClient({ currentTier = "free", isAuthenticated }: UpgradeClientProps) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async (tierId: string) => {
    if (tierId === "free") {
      toast.info("You're already on the free plan")
      return
    }

    try {
      setLoading(true)
      console.log("[v0] Starting checkout for tier:", tierId)
      await startPublicCheckoutSession(tierId)
    } catch (error) {
      console.error("[v0] Checkout error:", error)
      toast.error("Failed to start checkout. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Upgrade Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your export compliance needs
        </p>
        {!isAuthenticated && (
          <p className="text-sm text-muted-foreground mt-4">Sign up to get started with your selected plan</p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {SUBSCRIPTION_TIERS.map((tier) => (
          <Card
            key={tier.id}
            className={`p-6 flex flex-col ${tier.id === currentTier ? "border-primary" : ""} ${tier.id === "pro" ? "border-primary/50 shadow-lg scale-105" : ""}`}
          >
            {tier.id === "pro" && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="px-4 py-1">Most Popular</Badge>
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold">{tier.name}</h3>
              {tier.id === "pro" && <Sparkles className="w-6 h-6 text-primary" />}
              {tier.id === "enterprise" && <Users className="w-6 h-6 text-secondary" />}
            </div>
            <div className="mb-4">
              <div className="text-4xl font-bold">${(tier.priceInCents / 100).toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>
            <ul className="space-y-3 mb-6 flex-1">
              {tier.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {tier.id === currentTier && isAuthenticated ? (
              <Badge variant="outline" className="w-full justify-center py-2">
                Current Plan
              </Badge>
            ) : (
              <Button
                onClick={() => handleUpgrade(tier.id)}
                disabled={loading}
                className="w-full"
                variant={tier.id === "pro" ? "default" : tier.id === "enterprise" ? "secondary" : "outline"}
              >
                {tier.id === "free"
                  ? "Get Started"
                  : isAuthenticated
                    ? `Upgrade to ${tier.name}`
                    : `Start with ${tier.name}`}
              </Button>
            )}
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>All plans include a 14-day money-back guarantee</p>
        <p className="mt-2">Need help choosing? Contact our sales team</p>
      </div>
    </div>
  )
}
