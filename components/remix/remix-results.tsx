"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Share2, Sparkles, Check, Copy, MessageSquare, Lightbulb, Target, TrendingUp } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { FeedbackModal } from "@/components/feedback/feedback-modal"

interface RemixResultsProps {
  results: {
    type: string
    data: {
      title: string
      overview?: string
      description?: string
      insights?: string[]
      recommendations: string[]
    }
  }
}

export function RemixResults({ results }: RemixResultsProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [shareableLink, setShareableLink] = useState<string | null>(null)
  const [isCreatingLink, setIsCreatingLink] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  const handleExportCSV = () => {
    try {
      const csvContent = [
        ["Type", "Title", "Description"],
        [results.type, results.data.title, results.data.description],
        [""],
        ["Recommendations"],
        ...results.data.recommendations.map((rec, idx) => [`${idx + 1}`, rec]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `remix-results-${Date.now()}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success("Export Complete", {
        description: "Remix results exported to CSV",
      })

      setTimeout(() => setShowFeedback(true), 500)
    } catch (error) {
      toast.error("Export Failed", {
        description: "Failed to export results",
      })
    }
  }

  const createShareableLink = async () => {
    setIsCreatingLink(true)
    try {
      const response = await fetch("/api/shareable/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkType: "remix",
          data: {
            type: results.type,
            title: results.data.title,
            description: results.data.description,
            recommendations: results.data.recommendations,
          },
        }),
      })

      if (!response.ok) throw new Error("Failed to create shareable link")

      const { shareUrl } = await response.json()
      setShareableLink(shareUrl)

      await navigator.clipboard.writeText(shareUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)

      toast.success("Shareable Link Created", {
        description: "Link copied to clipboard. Share it with anyone!",
      })
    } catch (error) {
      toast.error("Failed to Create Link", {
        description: "Could not create shareable link",
      })
    } finally {
      setIsCreatingLink(false)
    }
  }

  const copyShareableLink = async () => {
    if (shareableLink) {
      await navigator.clipboard.writeText(shareableLink)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      toast.success("Link Copied", {
        description: "Shareable link copied to clipboard",
      })
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold">AI-Generated Insights</h2>
              <p className="text-xs md:text-sm text-muted-foreground">Professional logistics analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent flex-1 sm:flex-none"
              onClick={() => setShowFeedback(true)}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Feedback</span>
            </Button>
            {!shareableLink ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent flex-1 sm:flex-none"
                onClick={createShareableLink}
                disabled={isCreatingLink}
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">{isCreatingLink ? "Creating..." : "Share"}</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent flex-1 sm:flex-none"
                onClick={copyShareableLink}
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{isCopied ? "Copied" : "Copy Link"}</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent flex-1 sm:flex-none"
              onClick={handleExportCSV}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        <Card className="p-6 md:p-8 space-y-8">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-2 flex-1">
                <Badge variant="secondary" className="mb-1">
                  {results.type.replace(/_/g, " ").toUpperCase()}
                </Badge>
                <h3 className="text-2xl md:text-3xl font-bold text-balance">{results.data.title}</h3>
              </div>
            </div>

            <div className="pl-0 md:pl-15">
              <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                {results.data.overview || results.data.description}
              </p>
            </div>
          </div>

          {results.data.insights && results.data.insights.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-lg md:text-xl">Key Insights</h4>
              </div>
              <div className="grid gap-3">
                {results.data.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">{index + 1}</span>
                    </div>
                    <p className="text-sm md:text-base leading-relaxed text-pretty">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-lg md:text-xl">Actionable Recommendations</h4>
            </div>
            <div className="grid gap-4">
              {results.data.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="group relative p-5 rounded-lg bg-card border-2 border-border hover:border-primary/50 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-primary-foreground">{index + 1}</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm md:text-base leading-relaxed text-pretty font-medium">{rec}</p>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-1 h-full bg-primary/20 rounded-r-lg group-hover:bg-primary/50 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          <div className="border-l-4 border-amber-500/50 bg-amber-500/5 rounded-r-lg p-4">
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              <span className="font-semibold text-amber-600 dark:text-amber-400">Disclaimer:</span> This analysis uses
              AI-generated insights and estimates from public sources. It should not be considered legal, financial, or
              professional advice. Please consult with qualified logistics, legal, and financial professionals for
              specific business decisions.
            </p>
          </div>
        </Card>
      </div>

      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        feedbackType="remix"
        contextData={{
          type: results.type,
          title: results.data.title,
        }}
      />
    </>
  )
}
