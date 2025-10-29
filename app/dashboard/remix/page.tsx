"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { RemixPrompt } from "@/components/remix/remix-prompt"
import { RemixResults } from "@/components/remix/remix-results"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Crown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function RemixPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [results, setResults] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleRemix = async (prompt: string) => {
    setIsProcessing(true)
    setResults(null)

    try {
      const response = await fetch("/api/ai/remix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          context: {},
        }),
      })

      const data = await response.json()

      if (!data.success && response.status === 429) {
        toast({
          title: "Usage Limit Reached",
          description: data.message || "Upgrade to Pro for unlimited remixing.",
          variant: "destructive",
          action: (
            <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/billing")}>
              <Crown className="w-3 h-3 mr-1" />
              Upgrade
            </Button>
          ),
        })
        return
      }

      if (data.success) {
        setResults(data.result)
        toast({
          title: "Remix Complete",
          description: "Your data has been transformed successfully.",
        })
      } else {
        toast({
          title: "Remix Failed",
          description: data.error || "Failed to remix data. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Remix failed:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Remix Your Data</h1>
              <p className="text-muted-foreground mt-1">
                Use conversational AI to transform and analyze your logistics data
              </p>
            </div>
          </div>
        </div>

        {/* Example Prompts */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-3">Try these prompts:</h3>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            <button
              className="text-left p-3 rounded-lg bg-card hover:bg-primary/10 transition-colors border border-border"
              onClick={() => handleRemix("Balance my shipments as Nordic calm")}
              disabled={isProcessing}
            >
              "Balance my shipments as Nordic calm"
            </button>
            <button
              className="text-left p-3 rounded-lg bg-card hover:bg-primary/10 transition-colors border border-border"
              onClick={() => handleRemix("Show me cost optimization opportunities")}
              disabled={isProcessing}
            >
              "Show me cost optimization opportunities"
            </button>
            <button
              className="text-left p-3 rounded-lg bg-card hover:bg-primary/10 transition-colors border border-border"
              onClick={() => handleRemix("Predict tariff changes for next quarter")}
              disabled={isProcessing}
            >
              "Predict tariff changes for next quarter"
            </button>
            <button
              className="text-left p-3 rounded-lg bg-card hover:bg-primary/10 transition-colors border border-border"
              onClick={() => handleRemix("Reroute to save 35%")}
              disabled={isProcessing}
            >
              "Reroute to save 35%"
            </button>
          </div>
        </Card>

        {/* Remix Prompt */}
        <RemixPrompt onSubmit={handleRemix} isProcessing={isProcessing} />

        {/* Results */}
        {results && <RemixResults results={results} />}
      </div>
    </DashboardLayout>
  )
}
