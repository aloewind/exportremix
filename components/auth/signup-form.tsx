"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Mail } from "lucide-react"
import { completeUserSignup } from "@/app/actions/auth"

export function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const selectedPlan = searchParams.get("plan")

  const supabase = getSupabaseBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          },
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        let errorMessage = error.message

        if (error.message.includes("User already registered")) {
          errorMessage = "This email is already registered. Please sign in instead."
        } else if (error.message.includes("Invalid email")) {
          errorMessage = "Please enter a valid email address."
        } else if (error.message.includes("Password")) {
          errorMessage = "Password must be at least 6 characters long."
        }

        toast({
          title: "Signup Failed",
          description: errorMessage,
          variant: "destructive",
        })
        return
      }

      if (!data.user) {
        toast({
          title: "Signup Failed",
          description: "Failed to create user account. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Complete user setup (profile + subscription)
      const setupResult = await completeUserSignup(data.user.id, formData.email, formData.name)

      if (!setupResult.success) {
        toast({
          title: "Setup Error",
          description: setupResult.error || "Account created but setup incomplete. Please contact support.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Account created!",
        description: selectedPlan
          ? "Redirecting to checkout..."
          : "Welcome to ExportRemix. Redirecting to dashboard...",
      })

      setTimeout(() => {
        if (selectedPlan && (selectedPlan === "pro" || selectedPlan === "enterprise")) {
          router.push(`/pricing?checkout=${selectedPlan}`)
        } else {
          router.push("/dashboard")
        }
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("[ExportRemix] Signup error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[ExportRemix] Google signup error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {selectedPlan && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm font-medium">
            Selected Plan: <span className="capitalize font-bold">{selectedPlan}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">Create your account to continue to checkout</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full gap-2 bg-transparent"
        onClick={handleGoogleSignUp}
        disabled={isGoogleLoading}
      >
        <Mail className="w-4 h-4" />
        {isGoogleLoading ? "Connecting..." : "Sign up with Google"}
      </Button>
    </div>
  )
}
