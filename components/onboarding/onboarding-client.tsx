"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, Database, Zap } from "lucide-react"

export function OnboardingClient() {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const handleContinue = () => {
    if (selectedOption === "upload") {
      router.push("/dashboard/upload")
    } else if (selectedOption === "connect") {
      router.push("/dashboard/connect")
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen gradient-flow flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Let's get you set up</h1>
          <p className="text-muted-foreground text-lg">Choose how you'd like to start analyzing your logistics data</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card
            className={`p-8 cursor-pointer transition-all hover:border-primary ${
              selectedOption === "upload" ? "border-primary bg-primary/5" : ""
            }`}
            onClick={() => setSelectedOption("upload")}
          >
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold">Upload Files</h3>
              <p className="text-muted-foreground">
                Upload your CSV or JSON manifest files to get started with AI-powered analysis
              </p>
            </div>
          </Card>

          <Card
            className={`p-8 cursor-pointer transition-all hover:border-secondary ${
              selectedOption === "connect" ? "border-secondary bg-secondary/5" : ""
            }`}
            onClick={() => setSelectedOption("connect")}
          >
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Database className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-semibold">Connect APIs</h3>
              <p className="text-muted-foreground">
                Connect to CBP, WTO, or other logistics APIs for real-time data analysis
              </p>
            </div>
          </Card>
        </div>

        <div className="flex justify-center pt-4">
          <Button size="lg" onClick={handleContinue} disabled={!selectedOption} className="gap-2">
            Continue to Dashboard <Zap className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
