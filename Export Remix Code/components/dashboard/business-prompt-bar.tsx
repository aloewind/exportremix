"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Send, Mic, HelpCircle, Sparkles } from "lucide-react"
import { toast } from "sonner"

const BUSINESS_KEYWORDS = [
  "tariff",
  "manifest",
  "remix",
  "predict",
  "surge",
  "compliance",
  "hs code",
  "export",
  "import",
  "shipment",
  "customs",
  "duty",
  "trade",
  "route",
  "cost",
  "optimize",
  "risk",
  "policy",
]

const EXAMPLE_PROMPTS = [
  "Predict tariff surge for HS code 8471.30",
  "Remix manifest for 35% cost reduction",
  "Check compliance for EU export",
  "Optimize route for Shanghai to LA",
  "Analyze risk for electronics shipment",
]

interface BusinessPromptBarProps {
  onSubmit?: (prompt: string) => void
}

export function BusinessPromptBar({ onSubmit }: BusinessPromptBarProps) {
  const [prompt, setPrompt] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState<string | null>(null)

  const validatePrompt = (text: string): boolean => {
    const lowerText = text.toLowerCase()
    return BUSINESS_KEYWORDS.some((keyword) => lowerText.includes(keyword))
  }

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error("Empty Prompt", {
        description: "Please enter a business query related to exports, tariffs, or trade.",
        duration: 8000,
      })
      return
    }

    if (!validatePrompt(prompt)) {
      toast.error("Invalid Query - Export/Trade Topics Only", {
        description:
          "This prompt bar is for export and trade queries only. Please include keywords like: tariff, manifest, remix, predict, surge, compliance, HS code, export, import, shipment, customs, duty, trade, route, cost, optimize, risk, or policy. Try: 'Predict tariff for HS code 8471.30' or 'Remix manifest for cost savings'",
        duration: 10000,
      })
      return
    }

    setIsLoading(true)
    setAiResponse(null)

    toast.info("Processing Query", {
      description: "ChatGPT-4o is analyzing your export/trade request...",
      duration: 3000,
    })

    try {
      const response = await fetch("/api/business-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to process prompt")
      }

      console.log("[v0] AI response received:", data.response)
      setAiResponse(data.response)

      toast.success("Analysis Complete", {
        description: "ChatGPT-4o has analyzed your query. See response below.",
        duration: 5000,
      })

      if (onSubmit) {
        onSubmit(prompt)
      }
    } catch (error) {
      console.error("[v0] Business prompt error:", error)
      toast.error("Processing Failed", {
        description: error instanceof Error ? error.message : "Failed to process your query. Please try again.",
        duration: 8000,
      })
    } finally {
      setIsLoading(false)
    }

    setPrompt("")
  }

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Voice Input Not Supported", {
        description: "Voice input is not supported in your browser. Please type your query instead.",
        duration: 8000,
      })
      return
    }

    setIsListening(true)
    toast.info("Listening...", {
      description: "Speak your export/trade query now",
      duration: 3000,
    })

    setTimeout(() => {
      setIsListening(false)
      toast.info("Voice Input Coming Soon", {
        description: "Voice input feature is under development. Please type your query for now.",
        duration: 6000,
      })
    }, 2000)
  }

  return (
    <Card className="p-4 border-2 border-primary/20 bg-gradient-to-r from-background to-primary/5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">AI Business Prompt</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="font-semibold mb-2">How to use:</p>
                  <p className="text-sm mb-2">
                    Enter export/trade-related queries only. This is not a general chatbot - it's specialized for
                    shipping, tariffs, and trade compliance.
                  </p>
                  <p className="text-sm font-semibold mb-1">Valid keywords:</p>
                  <p className="text-xs mb-2">
                    tariff, manifest, remix, predict, surge, compliance, HS code, export, import, shipment, customs,
                    duty, trade, route, cost, optimize, risk, policy
                  </p>
                  <p className="text-sm font-semibold mb-1">Examples:</p>
                  <ul className="text-xs space-y-1">
                    {EXAMPLE_PROMPTS.map((example, i) => (
                      <li key={i}>• {example}</li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Type export query: 'Predict surge for HS code X' or 'Remix manifest for compliance'..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSubmit()}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleVoiceInput}
            disabled={isListening || isLoading}
            className="shrink-0 bg-transparent"
          >
            <Mic className={`w-4 h-4 ${isListening ? "text-red-500 animate-pulse" : ""}`} />
          </Button>
          <Button onClick={handleSubmit} className="shrink-0 gap-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.slice(0, 3).map((example, i) => (
            <button
              key={i}
              onClick={() => {
                setPrompt(example)
                setAiResponse(null)
              }}
              disabled={isLoading}
              className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {example}
            </button>
          ))}
        </div>

        {aiResponse && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="font-semibold text-sm">ChatGPT-4o Response:</p>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
            </div>
          </Card>
        )}
      </div>
    </Card>
  )
}
