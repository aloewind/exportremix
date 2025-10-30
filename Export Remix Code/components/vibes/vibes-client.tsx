"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Check, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const VIBE_PRESETS = [
  {
    id: "balanced",
    name: "Balanced",
    description: "Default harmonious blend of all elements",
    icon: "⚖️",
    color: "from-gray-500 to-gray-700",
    features: [
      "Comprehensive analysis with equal focus",
      "Neutral tone for all predictions",
      "Balanced risk assessment",
      "Standard alert formatting",
    ],
    benefits: "Best for: General use, teams with diverse preferences, balanced decision-making",
  },
  {
    id: "nordic_calm",
    name: "Nordic Calm",
    description: "Minimalist serenity with cool tones and clarity",
    icon: "❄️",
    color: "from-blue-400 to-cyan-600",
    features: [
      "Concise, essential insights only",
      "Calm, precise language",
      "Minimalist alert design",
      "Focus on clarity over detail",
    ],
    benefits: "Best for: Quick decisions, reducing information overload, stress-free analysis",
  },
  {
    id: "zen_harmony",
    name: "Zen Harmony",
    description: "Peaceful balance with natural flow",
    icon: "🧘",
    color: "from-green-400 to-teal-600",
    features: [
      "Flowing, natural language",
      "Emphasis on patterns and harmony",
      "Peaceful alert presentation",
      "Holistic insights",
    ],
    benefits: "Best for: Long-term planning, sustainable strategies, mindful decision-making",
  },
  {
    id: "dynamic_flow",
    name: "Dynamic Flow",
    description: "Energetic movement with bold contrasts",
    icon: "⚡",
    color: "from-orange-500 to-red-600",
    features: [
      "Action-oriented language",
      "Urgent opportunity highlights",
      "Bold, attention-grabbing alerts",
      "Fast-paced insights",
    ],
    benefits: "Best for: Time-sensitive decisions, competitive markets, rapid response needs",
  },
  {
    id: "minimalist_clarity",
    name: "Minimalist Clarity",
    description: "Clean simplicity with focused precision",
    icon: "◻️",
    color: "from-slate-400 to-slate-600",
    features: [
      "Extremely concise output",
      "Only critical insights",
      "No embellishment",
      "Laser-focused recommendations",
    ],
    benefits: "Best for: Executive summaries, high-level overviews, time-constrained users",
  },
  {
    id: "bold_energy",
    name: "Bold Energy",
    description: "Vibrant intensity with powerful presence",
    icon: "🔥",
    color: "from-purple-500 to-pink-600",
    features: [
      "Powerful, impactful language",
      "High-priority action emphasis",
      "Transformative opportunities",
      "Confident predictions",
    ],
    benefits: "Best for: Growth-focused teams, aggressive strategies, high-stakes decisions",
  },
]

interface VibesClientProps {
  profile: any
}

export function VibesClient({ profile }: VibesClientProps) {
  const [selectedVibe, setSelectedVibe] = useState("balanced")
  const [currentVibe, setCurrentVibe] = useState("balanced")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchVibe = async () => {
      try {
        const response = await fetch("/api/user-settings/vibe")
        const data = await response.json()
        if (data.success) {
          setCurrentVibe(data.vibePreference)
          setSelectedVibe(data.vibePreference)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch vibe preference:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVibe()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/user-settings/vibe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibePreference: selectedVibe }),
      })

      const data = await response.json()

      if (data.success) {
        setCurrentVibe(selectedVibe)
        toast({
          title: "Vibe Saved!",
          description: `Your ${VIBE_PRESETS.find((v) => v.id === selectedVibe)?.name} vibe is now active. All AI outputs will use this style.`,
        })
        setTimeout(() => router.refresh(), 1000)
      } else {
        toast({
          title: "Save Failed",
          description: data.error || "Failed to save vibe preference",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to save vibe:", error)
      toast({
        title: "Save Failed",
        description: "An error occurred while saving your vibe preference",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const currentVibeData = VIBE_PRESETS.find((v) => v.id === currentVibe)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-balance">Vibe Customization</h1>
            <p className="text-muted-foreground text-pretty">
              Personalize how AI presents predictions, alerts, and insights
            </p>
          </div>
        </div>
      </div>

      {/* Current Vibe */}
      <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Active Vibe</p>
            <p className="text-2xl font-bold">{currentVibeData?.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{currentVibeData?.description}</p>
          </div>
          <Badge variant="secondary" className="text-3xl px-4 py-2">
            {currentVibeData?.icon}
          </Badge>
        </div>
      </Card>

      {/* Vibe Presets */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Choose Your Vibe</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {VIBE_PRESETS.map((vibe) => (
            <Card
              key={vibe.id}
              className={`p-6 cursor-pointer transition-all hover:scale-105 ${
                selectedVibe === vibe.id ? "ring-2 ring-primary shadow-lg" : "hover:border-primary/50"
              }`}
              onClick={() => setSelectedVibe(vibe.id)}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${vibe.color} flex items-center justify-center text-3xl`}
                  >
                    {vibe.icon}
                  </div>
                  {selectedVibe === vibe.id && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-5 h-5 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{vibe.name}</h3>
                  <p className="text-sm text-muted-foreground text-pretty mb-3">{vibe.description}</p>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">Features:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {vibe.features.map((feature, idx) => (
                        <li key={idx}>• {feature}</li>
                      ))}
                    </ul>
                    <p className="text-xs text-primary mt-2 italic">{vibe.benefits}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <Card className="p-6 bg-muted/50">
        <h3 className="text-lg font-bold mb-4">How Vibes Work</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Predictions:</strong> Your selected vibe influences how AI analyzes and
            presents tariff surge predictions, adjusting the tone, detail level, and focus areas.
          </p>
          <p>
            <strong className="text-foreground">Remixing:</strong> When you remix manifests, your vibe preference shapes
            the output style, from minimalist clarity to bold energy.
          </p>
          <p>
            <strong className="text-foreground">Alerts:</strong> Policy Sentinel alerts are formatted according to your
            vibe, ensuring consistency across all AI-generated content.
          </p>
          <p className="text-xs italic mt-4 pt-4 border-t">
            <strong>Example:</strong> With "Nordic Calm" selected, a 19% tariff surge might be presented as "Gentle
            disruption detected: 19% steel tariff increase approaching" instead of "ALERT: Major 19% surge incoming!"
          </p>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
        <Button onClick={handleSave} disabled={saving || selectedVibe === currentVibe} className="gap-2">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {selectedVibe === currentVibe ? "Current Vibe" : "Save Vibe"}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
