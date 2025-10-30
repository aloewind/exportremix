"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Rocket, RotateCcw, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface TestEnterpriseButtonProps {
  userEmail: string
  currentTier: string
}

export function TestEnterpriseButton({ userEmail, currentTier }: TestEnterpriseButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isReverting, setIsReverting] = useState(false)

  // Only show for owner email
  const isOwner = userEmail === "aloewind@yahoo.com"
  if (!isOwner) return null

  const isEnterprise = currentTier === "enterprise"

  const handleEnableEnterprise = async () => {
    console.log("Button clicked")
    setIsLoading(true)

    try {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const response = await fetch("/api/test-enterprise-access", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        console.log("Success")
        toast.success("Test Enterprise Enabled!", {
          description: "You now have unlimited access to all features for testing.",
          duration: 5000,
        })
        setTimeout(() => {
          router.refresh()
        }, 2000)
      } else {
        toast.error("Failed to Enable Enterprise", {
          description: data.error || "Please try again or check the console for details.",
          duration: 8000,
        })
      }
    } catch (error) {
      toast.error("Connection Error", {
        description: "Could not connect to the server. Please try again.",
        duration: 8000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevertToFree = async () => {
    setIsReverting(true)

    try {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const response = await fetch("/api/revert-to-free", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Reverted to Free Tier", {
          description: "Your account has been downgraded to free tier.",
          duration: 5000,
        })
        setTimeout(() => {
          router.refresh()
        }, 2000)
      } else {
        toast.error("Failed to Revert", {
          description: data.error || "Please try again.",
          duration: 8000,
        })
      }
    } catch (error) {
      toast.error("Connection Error", {
        description: "Could not connect to the server. Please try again.",
        duration: 8000,
      })
    } finally {
      setIsReverting(false)
    }
  }

  return (
    <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold">Owner Test Mode</p>
              <Badge variant="outline" className="text-xs">
                Dev Only
              </Badge>
              {isEnterprise && (
                <Badge variant="secondary" className="text-xs">
                  Enterprise
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {isEnterprise
                ? "Enterprise mode active. Click to revert to free tier."
                : "Simulate enterprise access to unlock all features for unlimited testing."}
            </p>
          </div>
        </div>
        {isEnterprise ? (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRevertToFree}
            disabled={isReverting}
            className="flex-shrink-0 bg-transparent"
          >
            {isReverting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Reverting...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Revert to Free
              </>
            )}
          </Button>
        ) : (
          <Button size="sm" onClick={handleEnableEnterprise} disabled={isLoading} className="flex-shrink-0">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enabling...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                Test Enterprise
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  )
}
