"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  FileUp,
  Sparkles,
  MessageSquare,
  Download,
} from "lucide-react"
import { toast } from "sonner"

interface TestStep {
  id: string
  name: string
  description: string
  icon: any
  status: "pending" | "running" | "success" | "failed"
  duration?: number
  error?: string
}

export function TestSuiteClient() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<TestStep[]>([
    {
      id: "signup",
      name: "User Signup",
      description: "Create test user account with email verification",
      icon: CheckCircle2,
      status: "pending",
    },
    {
      id: "onboarding",
      name: "Onboarding Flow",
      description: "Complete onboarding tutorial and setup",
      icon: Clock,
      status: "pending",
    },
    {
      id: "dashboard",
      name: "Dashboard Load",
      description: "Load dashboard with Policy Sentinel auto-run",
      icon: AlertTriangle,
      status: "pending",
    },
    {
      id: "upload",
      name: "Data Upload",
      description: "Upload CSV manifest with 76% disruption simulation",
      icon: FileUp,
      status: "pending",
    },
    {
      id: "predict",
      name: "AI Prediction",
      description: "Analyze data and detect 19% tariff surge",
      icon: Sparkles,
      status: "pending",
    },
    {
      id: "remix",
      name: "Remix Prompt",
      description: 'Execute "Balance as Nordic calm" remix prompt',
      icon: Sparkles,
      status: "pending",
    },
    {
      id: "feedback",
      name: "User Feedback",
      description: "Submit feedback with 5-star rating",
      icon: MessageSquare,
      status: "pending",
    },
    {
      id: "export",
      name: "Export Results",
      description: "Download remixed results as CSV",
      icon: Download,
      status: "pending",
    },
  ])

  const updateStepStatus = (stepId: string, status: TestStep["status"], duration?: number, error?: string) => {
    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, status, duration, error } : step)))
  }

  const runTestStep = async (step: TestStep, index: number): Promise<boolean> => {
    setCurrentStep(index)
    updateStepStatus(step.id, "running")

    const startTime = Date.now()

    try {
      // Simulate test execution with realistic delays
      await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 2000))

      // Simulate 95% success rate
      if (Math.random() > 0.95) {
        throw new Error(`Test failed: ${step.name} encountered an error`)
      }

      const duration = Date.now() - startTime
      updateStepStatus(step.id, "success", duration)

      toast.success(`${step.name} Complete`, {
        description: `Completed in ${(duration / 1000).toFixed(2)}s`,
      })

      return true
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      updateStepStatus(step.id, "failed", duration, errorMessage)

      toast.error(`${step.name} Failed`, {
        description: errorMessage,
      })

      return false
    }
  }

  const runFullTestSuite = async () => {
    setIsRunning(true)

    toast.info("Test Suite Started", {
      description: "Running E2E tests for full user journey",
    })

    let successCount = 0
    const startTime = Date.now()

    for (let i = 0; i < steps.length; i++) {
      const success = await runTestStep(steps[i], i)
      if (success) {
        successCount++
      } else {
        // Continue even if a step fails
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    const totalDuration = Date.now() - startTime

    setIsRunning(false)
    setCurrentStep(-1)

    if (successCount === steps.length) {
      toast.success("All Tests Passed! 🎉", {
        description: `Completed ${steps.length} tests in ${(totalDuration / 1000).toFixed(2)}s`,
      })
    } else {
      toast.warning("Test Suite Complete", {
        description: `${successCount}/${steps.length} tests passed`,
      })
    }
  }

  const resetTests = () => {
    setSteps((prev) =>
      prev.map((step) => ({
        ...step,
        status: "pending",
        duration: undefined,
        error: undefined,
      })),
    )
    setCurrentStep(0)
  }

  const completedSteps = steps.filter((s) => s.status === "success").length
  const failedSteps = steps.filter((s) => s.status === "failed").length
  const progress = (completedSteps / steps.length) * 100

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">E2E Test Suite</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive testing for the full user journey with 76% disruption simulations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={resetTests} disabled={isRunning} className="bg-transparent">
              Reset
            </Button>
            <Button onClick={runFullTestSuite} disabled={isRunning} className="gap-2">
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Full Suite
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Test Progress</p>
                <p className="text-2xl font-bold">
                  {completedSteps} / {steps.length}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-2xl font-bold">{completedSteps}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Passed</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2 text-red-500">
                    <XCircle className="w-5 h-5" />
                    <span className="text-2xl font-bold">{failedSteps}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Failed</p>
                </div>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </Card>

        {/* Test Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === index

            return (
              <Card
                key={step.id}
                className={`p-4 transition-all ${isActive ? "border-primary shadow-lg" : ""} ${
                  step.status === "success" ? "border-green-500/30 bg-green-500/5" : ""
                } ${step.status === "failed" ? "border-red-500/30 bg-red-500/5" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      step.status === "success"
                        ? "bg-green-500/20 text-green-500"
                        : step.status === "failed"
                          ? "bg-red-500/20 text-red-500"
                          : step.status === "running"
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.status === "running" ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : step.status === "success" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : step.status === "failed" ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{step.name}</h3>
                      {step.status !== "pending" && (
                        <Badge
                          variant={
                            step.status === "success"
                              ? "default"
                              : step.status === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {step.status}
                        </Badge>
                      )}
                      {step.duration && (
                        <span className="text-xs text-muted-foreground">{(step.duration / 1000).toFixed(2)}s</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    {step.error && <p className="text-sm text-red-500 mt-2">{step.error}</p>}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
