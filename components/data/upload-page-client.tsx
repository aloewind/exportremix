"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { FileUpload } from "@/components/data/file-upload"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Sparkles, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function UploadPageClient() {
  const { toast } = useToast()
  const router = useRouter()
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    router.push("/dashboard/files")
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Upload Data</h1>
              <p className="text-muted-foreground mt-1">Upload your manifest files for AI-powered analysis</p>
            </div>
          </div>
          <Button size="lg" className="gap-2" onClick={handleAnalyze} disabled={isAnalyzing}>
            <Sparkles className="w-4 h-4" />
            Analyze with AI
          </Button>
        </div>

        <FileUpload onFilesProcessed={setUploadedFiles} />

        <Card className="p-6 bg-muted/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold mb-3">Supported File Formats</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• CSV files with manifest data (shipment ID, origin, destination, HS codes, values)</li>
                <li>• JSON files with structured logistics data</li>
                <li>• Maximum file size: 50MB per file</li>
                <li>• Multiple files can be uploaded simultaneously</li>
                <li>• AI will automatically detect tariff surges, delays, and optimization opportunities</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
