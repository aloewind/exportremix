"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { toast } from "sonner"

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  feedbackType: "remix" | "analysis" | "policy_alert" | "export"
  contextData?: any
}

export function FeedbackModal({ isOpen, onClose, feedbackType, contextData }: FeedbackModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/feedback/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedbackType,
          rating,
          comment,
          contextData,
        }),
      })

      if (!response.ok) throw new Error("Failed to submit feedback")

      toast.success("Thank You!", {
        description: "Your feedback helps us improve ExportRemix",
      })

      // Reset form
      setRating(0)
      setComment("")
      onClose()
    } catch (error) {
      toast.error("Failed to Submit", {
        description: "Could not submit feedback. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFeedbackTitle = () => {
    switch (feedbackType) {
      case "remix":
        return "How was your remix experience?"
      case "analysis":
        return "How helpful was the AI analysis?"
      case "policy_alert":
        return "How useful were the policy alerts?"
      case "export":
        return "How was the export process?"
      default:
        return "How was your experience?"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getFeedbackTitle()}</DialogTitle>
          <DialogDescription>Your feedback helps us improve the platform for everyone</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-primary text-primary"
                        : "fill-none text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Comments (Optional)</label>
            <Textarea
              placeholder="Tell us more about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Skip
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
