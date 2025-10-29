"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Mic, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RemixPromptProps {
  onSubmit: (prompt: string) => void
  isProcessing: boolean
}

export function RemixPrompt({ onSubmit, isProcessing }: RemixPromptProps) {
  const { toast } = useToast()
  const [prompt, setPrompt] = useState("")
  const [isListening, setIsListening] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim() && !isProcessing) {
      onSubmit(prompt)
      setPrompt("") // Clear prompt after submission
    }
  }

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support voice input. Please type your prompt instead.",
        variant: "destructive",
      })
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setIsListening(true)
      toast({
        title: "Listening...",
        description: "Speak your prompt now",
      })
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setPrompt(transcript)
      setIsListening(false)
      toast({
        title: "Voice captured",
        description: "Your prompt has been transcribed",
      })
    }

    recognition.onerror = (event: any) => {
      setIsListening(false)
      toast({
        title: "Voice input error",
        description: "Failed to capture voice. Please try again.",
        variant: "destructive",
      })
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Enter your prompt</label>
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., 'Balance my shipments as Nordic calm' or 'Show me cost optimization opportunities'"
              className="min-h-32 pr-12 resize-none"
              disabled={isProcessing}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`absolute bottom-3 right-3 ${isListening ? "text-primary animate-pulse" : ""}`}
              onClick={handleVoiceInput}
              disabled={isProcessing}
            >
              <Mic className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Use natural language to describe what you want to see</p>
          <Button type="submit" disabled={!prompt.trim() || isProcessing} className="gap-2">
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Remix
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}
