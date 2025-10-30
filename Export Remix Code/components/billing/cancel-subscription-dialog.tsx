"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface CancelSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  currentPeriodEnd?: string
}

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  onSuccess,
  currentPeriodEnd,
}: CancelSubscriptionDialogProps) {
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const handleCancel = async () => {
    if (!confirmed) {
      toast.error("Please confirm you understand the cancellation terms")
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/billing/cancel", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to cancel subscription")
      }

      toast.success("Subscription cancelled successfully")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Error canceling subscription:", error)
      toast.error("Failed to cancel subscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>Cancel Subscription</DialogTitle>
          </div>
          <DialogDescription className="pt-4">
            Are you sure you want to cancel your subscription? This action will:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-destructive">•</span>
              <span>Remove access to all premium features</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive">•</span>
              <span>Limit your account to free tier features</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive">•</span>
              <span>Take effect at the end of your current billing period</span>
            </li>
          </ul>

          {currentPeriodEnd && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium">Your subscription will remain active until:</p>
              <p className="text-lg font-semibold mt-1">
                {new Date(currentPeriodEnd).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}

          <div className="flex items-start gap-3 rounded-lg border border-border p-4">
            <Checkbox id="confirm" checked={confirmed} onCheckedChange={(checked) => setConfirmed(checked === true)} />
            <Label htmlFor="confirm" className="text-sm font-normal cursor-pointer leading-relaxed">
              I understand that my subscription will be cancelled at the end of the current billing period and I will
              lose access to premium features.
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Keep Subscription
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={loading || !confirmed}>
            {loading ? "Cancelling..." : "Cancel Subscription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
