"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface PricingButtonProps {
  plan: "free" | "pro" | "enterprise"
  priceId?: string
  variant?: "default" | "outline"
  children: React.ReactNode
}

export function PricingButton({ plan, priceId, variant = "default", children }: PricingButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  const handleClick = async () => {
    setIsLoading(true)

    try {
      // Check if user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (plan === "free") {
        if (user) {
          // Already logged in, go to dashboard
          router.push("/dashboard")
        } else {
          // Not logged in, go to signup
          router.push("/signup")
        }
        return
      }

      if (!user) {
        // Not logged in, redirect to signup with plan parameter
        router.push(`/signup?plan=${plan}`)
        return
      }

      if (!priceId) {
        toast({
          title: "Configuration Error",
          description: "Stripe Price ID not configured. Please contact support.",
          variant: "destructive",
        })
        return
      }

      console.log("[v0] Starting checkout for plan:", plan, "priceId:", priceId)

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          plan,
        }),
      })

      const data = await response.json()

      console.log("[v0] Checkout API response:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      if (!data.url || typeof data.url !== "string") {
        console.error("[v0] Invalid checkout URL received:", data)
        throw new Error("Invalid checkout URL received from Stripe. Please check your Stripe Price IDs.")
      }

      // Redirect to Stripe checkout
      console.log("[v0] Redirecting to Stripe checkout:", data.url)
      window.location.href = data.url
    } catch (error) {
      console.error("[v0] Pricing button error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start checkout",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button className="w-full" variant={variant} onClick={handleClick} disabled={isLoading}>
      {isLoading ? "Loading..." : children}
    </Button>
  )
}
