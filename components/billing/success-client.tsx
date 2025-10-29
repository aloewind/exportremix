"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Sparkles, Users, ArrowRight } from "lucide-react"
import { SUBSCRIPTION_TIERS } from "@/lib/subscription-tiers"
import confetti from "canvas-confetti"

interface SuccessClientProps {
  tier: string
}

export function SuccessClient({ tier }: SuccessClientProps) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)
  const tierInfo = SUBSCRIPTION_TIERS.find((t) => t.id === tier) || SUBSCRIPTION_TIERS[0]
  const isPro = tier === "pro"
  const isEnterprise = tier === "enterprise"

  useEffect(() => {
    // Trigger confetti celebration
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Countdown timer for auto-redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/dashboard")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleGoToDashboard = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="max-w-2xl w-full p-8 md:p-12 text-center space-y-8 shadow-2xl border-2">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <CheckCircle2 className="w-24 h-24 text-primary relative animate-bounce" />
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Payment Successful!
          </h1>
          <div className="flex items-center justify-center gap-3">
            <p className="text-xl text-muted-foreground">You've unlocked</p>
            <Badge variant="default" className="text-lg px-4 py-1 gap-2">
              {isPro && <Sparkles className="w-4 h-4" />}
              {isEnterprise && <Users className="w-4 h-4" />}
              {tierInfo.name}
            </Badge>
          </div>
        </div>

        {/* Celebration Message */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 space-y-3">
          <p className="text-lg font-medium">Enjoy unlimited remixing and full API harmony. 🎉</p>
          <p className="text-muted-foreground">
            Your account has been upgraded with all {tierInfo.name} features. Start saving $10K+ per shipment today!
          </p>
        </div>

        {/* Features Unlocked */}
        <div className="text-left space-y-3">
          <h3 className="text-lg font-semibold text-center mb-4">What You've Unlocked:</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {tierInfo.features.slice(0, 6).map((feature, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4 pt-4">
          <Button onClick={handleGoToDashboard} size="lg" className="w-full gap-2 text-lg">
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </Button>
          <p className="text-sm text-muted-foreground">Redirecting automatically in {countdown} seconds...</p>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-muted-foreground pt-4 border-t">
          <p>A confirmation email has been sent to your inbox.</p>
          <p className="mt-1">Need help? Contact our support team anytime.</p>
        </div>
      </Card>
    </div>
  )
}
