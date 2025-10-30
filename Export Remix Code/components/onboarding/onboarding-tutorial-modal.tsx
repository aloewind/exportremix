"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, Sparkles, Download, AlertTriangle, ChevronRight, ChevronLeft, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OnboardingTutorialModalProps {
  open: boolean
  onComplete: () => void
  userId: string
}

const tutorialSteps = [
  {
    title: "Welcome to ExportRemix",
    description: "Your AI-powered logistics intelligence platform that solves 76% of supply chain disruptions",
    icon: Sparkles,
    color: "text-primary",
    content: (
      <div className="space-y-4">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border border-border">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <Sparkles className="w-12 h-12 text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">
                Video: Upload manifests → AI predicts surges (19% tariffs) → Remix with prompts → Export & share!
              </p>
            </div>
          </div>
        </div>
        <p className="text-muted-foreground">
          ExportRemix uses advanced AI to predict tariff surges, detect policy shifts, and help you remix your logistics
          data for optimal outcomes.
        </p>
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="text-2xl font-bold text-primary">76%</div>
            <div className="text-sm text-muted-foreground">Disruptions Prevented</div>
          </div>
          <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
            <div className="text-2xl font-bold text-secondary">19%</div>
            <div className="text-sm text-muted-foreground">Avg. Tariff Surge Detected</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Upload Your Data",
    description: "Import CSV or JSON manifest files to start analyzing",
    icon: Upload,
    color: "text-blue-500",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Upload your customs manifests, shipping data, or tariff schedules in CSV or JSON format. Our AI will
          automatically process and analyze your data.
        </p>
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-start gap-3">
            <Upload className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="space-y-2 flex-1">
              <div className="font-medium">Supported Formats</div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">CSV</Badge>
                <Badge variant="secondary">JSON</Badge>
                <Badge variant="secondary">Excel</Badge>
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          You can also connect to live APIs like CBP, WTO, or USITC for real-time data feeds.
        </p>
      </div>
    ),
  },
  {
    title: "AI Predictions & Alerts",
    description: "Get real-time threat detection and policy shift warnings",
    icon: AlertTriangle,
    color: "text-primary",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Our Policy Sentinel continuously monitors global trade policies and analyzes your data to predict threats like
          tariff surges, delays, and compliance issues.
        </p>
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-primary mt-0.5" />
            <div className="space-y-1">
              <div className="font-medium">Example Alert</div>
              <div className="text-sm text-muted-foreground">
                "Tariff surge: 19% incoming for HS Code 8471.30 - Portable computers. Confidence: 87%"
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Alerts auto-refresh every 30 seconds to keep you informed of the latest threats.
        </p>
      </div>
    ),
  },
  {
    title: "Remix Your Data",
    description: "Use conversational AI to transform and optimize your logistics",
    icon: Sparkles,
    color: "text-secondary",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Use natural language prompts to remix your data. Ask questions like "Balance as Nordic calm" or "Optimize for
          cost reduction" and watch AI transform your manifests.
        </p>
        <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20 space-y-3">
          <div className="font-medium">Example Prompts</div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-secondary" />
              <span className="text-muted-foreground">"Balance as Nordic calm"</span>
            </div>
            <div className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-secondary" />
              <span className="text-muted-foreground">"Optimize routes for fastest delivery"</span>
            </div>
            <div className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-secondary" />
              <span className="text-muted-foreground">"Show me high-risk shipments"</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Voice input is also supported for hands-free operation.</p>
      </div>
    ),
  },
  {
    title: "Export & Share Results",
    description: "Download your optimized data and share insights with your team",
    icon: Download,
    color: "text-green-500",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Export your remixed manifests, prediction reports, and analytics as CSV files. Share insights with your team
          or integrate with your existing systems.
        </p>
        <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
          <div className="flex items-start gap-3">
            <Download className="w-5 h-5 text-green-500 mt-0.5" />
            <div className="space-y-2 flex-1">
              <div className="font-medium">Export Options</div>
              <div className="text-sm text-muted-foreground">
                Download manifests, alerts, predictions, and analytics in CSV format with shareable links.
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Free tier includes 100 requests per month. Upgrade to Pro for unlimited access.
        </p>
      </div>
    ),
  },
]

export function OnboardingTutorialModal({ open, onComplete, userId }: OnboardingTutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)
  const { toast } = useToast()

  const isLastStep = currentStep === tutorialSteps.length - 1
  const step = tutorialSteps[currentStep]
  const Icon = step.icon

  const handleNext = () => {
    if (isLastStep) {
      handleComplete()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }

  const handleComplete = async () => {
    setIsCompleting(true)
    try {
      toast({
        title: "Welcome aboard!",
        description: "You're all set to start using ExportRemix.",
      })

      onComplete()
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${step.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span>{step.title}</span>
            </DialogTitle>
            <Badge variant="secondary">
              {currentStep + 1} / {tutorialSteps.length}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-lg font-medium">{step.description}</p>
          {step.content}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 0} className="gap-2 bg-transparent">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex gap-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep ? "w-8 bg-primary" : index < currentStep ? "w-2 bg-primary/50" : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          <Button onClick={handleNext} disabled={isCompleting} className="gap-2">
            {isLastStep ? (
              <>
                {isCompleting ? "Completing..." : "Get Started"}
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
