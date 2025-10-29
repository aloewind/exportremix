"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, AlertTriangle, Lightbulb, CheckCircle2, Download, RefreshCw, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FileAnalysisDialogProps {
  file: {
    id: string
    file_name: string
    file_type: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FileAnalysisDialog({ file, open, onOpenChange }: FileAnalysisDialogProps) {
  const { toast } = useToast()
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [generatingCorrected, setGeneratingCorrected] = useState(false)
  const [correctedFile, setCorrectedFile] = useState<any>(null)
  const [retesting, setRetesting] = useState(false)
  const [workflowStatus, setWorkflowStatus] = useState<string[]>([])

  const addWorkflowStatus = (message: string) => {
    setWorkflowStatus((prev) => [...prev, message])
  }

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true)
      setWorkflowStatus([])
      addWorkflowStatus("📤 Uploading file to AI analyzer...")

      const response = await fetch("/api/files/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: file.id }),
      })

      const data = await response.json()

      if (response.ok) {
        setAnalysis(data.analysis)
        const errorCount = data.analysis.errors?.length || 0
        const score = Number.parseInt(data.analysis.feedback?.overall_quality || "0")

        addWorkflowStatus(`✅ File uploaded: ${file.file_name}`)
        addWorkflowStatus(`📊 Found ${errorCount} issues • Quality: ${score}/10`)

        toast({
          title: "Analysis complete",
          description: `Found ${errorCount} issues with quality score ${score}/10`,
        })
      } else {
        addWorkflowStatus("❌ Analysis failed")
        toast({
          title: "Analysis failed",
          description: data.error || "Failed to analyze file",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error analyzing file:", error)
      addWorkflowStatus("❌ Error during analysis")
      toast({
        title: "Error",
        description: "Failed to analyze file",
        variant: "destructive",
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const handleGenerateCorrected = async () => {
    try {
      setGeneratingCorrected(true)
      addWorkflowStatus("🔧 Generating corrected manifest...")

      const response = await fetch("/api/files/generate-corrected", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: file.id,
          issues: analysis.errors,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setCorrectedFile(data)
        addWorkflowStatus(`✅ Fixed ${data.issuesFixed} issues • Removed ${data.duplicatesRemoved} duplicates`)
        toast({
          title: "✅ Corrected manifest generated",
          description: `Fixed ${data.issuesFixed} issues and removed ${data.duplicatesRemoved} duplicates. Download or retest now.`,
        })
      } else {
        addWorkflowStatus("❌ Correction generation failed")
        toast({
          title: "Generation failed",
          description: data.error || "Failed to generate corrected file",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error generating corrected file:", error)
      addWorkflowStatus("❌ Error generating corrected file")
      toast({
        title: "Error",
        description: "Failed to generate corrected file",
        variant: "destructive",
      })
    } finally {
      setGeneratingCorrected(false)
    }
  }

  const handleDownloadCorrected = () => {
    if (!correctedFile) return

    const blob = new Blob([correctedFile.content], { type: correctedFile.mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = correctedFile.fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    addWorkflowStatus(`💾 Downloaded: ${correctedFile.fileName}`)
    toast({
      title: "Download started",
      description: "Corrected manifest file is downloading",
    })
  }

  const handleRetest = async () => {
    try {
      setRetesting(true)
      addWorkflowStatus("🔄 Re-analyzing corrected file...")

      if (!correctedFile) {
        toast({
          title: "Error",
          description: "No corrected file available to retest",
          variant: "destructive",
        })
        return
      }

      // Parse the corrected content back to JSON
      let correctedData
      try {
        if (correctedFile.mimeType === "text/csv") {
          // Parse CSV to JSON
          const lines = correctedFile.content.split("\n")
          const headers = lines[0].split(",").map((h: string) => h.replace(/"/g, "").trim())
          correctedData = lines
            .slice(1)
            .filter((line: string) => line.trim())
            .map((line: string) => {
              const values = line.split(",").map((v: string) => v.replace(/"/g, "").trim())
              const row: any = {}
              headers.forEach((header: string, index: number) => {
                row[header] = values[index] || ""
              })
              return row
            })
        } else if (correctedFile.mimeType === "application/json") {
          correctedData = JSON.parse(correctedFile.content)
        } else if (correctedFile.mimeType === "application/xml") {
          // For XML, we'll upload as-is and let the analyzer parse it
          correctedData = { raw_content: correctedFile.content, format: "xml" }
        } else if (correctedFile.mimeType === "application/edi") {
          correctedData = { raw_content: correctedFile.content, format: "edi" }
        } else {
          correctedData = correctedFile.content
        }
      } catch (e) {
        console.error("[v0] Error parsing corrected file:", e)
        correctedData = correctedFile.content
      }

      const uploadResponse = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_name: correctedFile.fileName,
          file_type: correctedFile.mimeType,
          data: correctedData,
        }),
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        addWorkflowStatus("❌ Upload failed")
        toast({
          title: "Upload failed",
          description: errorData.error || "Failed to upload corrected file for retest",
          variant: "destructive",
        })
        return
      }

      const { file: uploadedFile } = await uploadResponse.json()
      const newFileId = uploadedFile.id

      addWorkflowStatus(`✅ Uploaded corrected file: ${correctedFile.fileName}`)
      addWorkflowStatus("📊 Running AI analysis on corrected file...")

      // Now analyze the corrected file
      const response = await fetch("/api/files/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: newFileId }),
      })

      const data = await response.json()

      if (response.ok) {
        const oldScore = Number.parseInt(analysis.feedback?.overall_quality || "0")
        const newScore = Number.parseInt(data.analysis.feedback?.overall_quality || "0")
        const remainingIssues = data.analysis.errors?.length || 0

        setAnalysis(data.analysis)

        if (newScore >= 9) {
          addWorkflowStatus(`✅ Quality improved: ${oldScore}/10 → ${newScore}/10`)
          addWorkflowStatus("🎉 Fully Compliant - No major errors!")
          toast({
            title: "✅ Fully Compliant",
            description: "No major errors - Fully compliant with WCO/HTS standards",
          })
        } else {
          addWorkflowStatus(`📈 Quality improved: ${oldScore}/10 → ${newScore}/10`)
          addWorkflowStatus(`⚠️ ${remainingIssues} issues remaining`)
          toast({
            title: "Retest complete",
            description: `Quality score: ${newScore}/10. ${remainingIssues} issues remaining.`,
          })
        }
      } else {
        addWorkflowStatus("❌ Retest analysis failed")
        toast({
          title: "Retest failed",
          description: data.error || "Failed to retest file",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error retesting file:", error)
      addWorkflowStatus("❌ Error during retest")
      toast({
        title: "Error",
        description: "Failed to retest file",
        variant: "destructive",
      })
    } finally {
      setRetesting(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      case "low":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case "medium":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case "low":
        return <AlertTriangle className="w-4 h-4 text-blue-600" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-6 h-6 text-primary" />
            AI File Analysis
          </DialogTitle>
          <DialogDescription className="text-base">
            Analyzing: <span className="font-medium text-foreground">{file.file_name}</span>
          </DialogDescription>
        </DialogHeader>

        {workflowStatus.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Workflow Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {workflowStatus.map((status, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary font-semibold text-xs flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="flex-1 leading-relaxed">{status}</span>
                  </div>
                ))}
                {(analyzing || generatingCorrected || retesting) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {!analysis ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Ready to analyze</h3>
              <p className="text-muted-foreground mb-4">
                Click the button below to start AI-powered analysis of your file
              </p>
            </div>
            <Button onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Analysis
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            {analysis.feedback && (
              <Card
                className={`border-2 ${Number.parseInt(analysis.feedback.overall_quality) >= 9 ? "border-green-500 bg-green-500/5" : "border-primary/20 bg-primary/5"}`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {Number.parseInt(analysis.feedback.overall_quality) >= 9 ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="text-green-600">Fully Compliant</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        Overall Assessment
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
                    <span className="font-medium">Quality Score</span>
                    <Badge
                      className={`text-base px-3 py-1 ${Number.parseInt(analysis.feedback.overall_quality) >= 9 ? "bg-green-600 text-white" : "bg-primary text-primary-foreground"}`}
                    >
                      {analysis.feedback.overall_quality}/10
                    </Badge>
                  </div>
                  {Number.parseInt(analysis.feedback.overall_quality) >= 9 && (
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-sm font-medium text-green-700">
                        ✅ No major errors - Fully compliant with WCO/HTS standards
                      </p>
                    </div>
                  )}
                  {analysis.feedback.summary && (
                    <div className="p-4 rounded-lg bg-background border">
                      <p className="text-sm leading-relaxed">{analysis.feedback.summary}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {analysis.errors && analysis.errors.length > 0 && (
              <Card className="border-red-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Issues & Inconsistencies
                    <Badge variant="outline" className="ml-auto bg-red-500/10 text-red-600 border-red-500/20">
                      {analysis.errors.length} found
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.errors.map((error: any, index: number) => (
                    <div key={index} className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{getSeverityIcon(error.severity)}</div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-base">{error.type}</span>
                            <Badge variant="outline" className={getSeverityColor(error.severity)}>
                              {error.severity} priority
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{error.description}</p>
                          {error.location && (
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Location:</span> {error.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {analysis.suggestions && analysis.suggestions.length > 0 && (
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Recommendations
                    <Badge variant="outline" className="ml-auto bg-primary/10 text-primary border-primary/20">
                      {analysis.suggestions.length} suggestions
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.suggestions.map((suggestion: any, index: number) => (
                    <div key={index} className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                              {suggestion.category}
                            </Badge>
                          </div>
                          <p className="font-medium text-base leading-relaxed">{suggestion.recommendation}</p>
                          <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                            <span className="font-medium text-foreground">Impact:</span>
                            <span className="flex-1">{suggestion.impact}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {analysis.feedback?.next_steps && analysis.feedback.next_steps.length > 0 && (
              <Card className="border-green-500/20 bg-green-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {analysis.feedback.next_steps.map((step: string, index: number) => (
                      <li key={index} className="flex items-start gap-3 text-sm">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground font-semibold text-xs flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="flex-1 pt-0.5 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}

            {analysis.errors && analysis.errors.length > 0 && !correctedFile && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Auto-Correction Available
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Generate a corrected version of your manifest with automatic fixes for detected issues.
                  </p>
                  <Button onClick={handleGenerateCorrected} disabled={generatingCorrected} className="w-full">
                    {generatingCorrected ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Generating Corrected File...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Corrected Manifest
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {correctedFile && (
              <Card className="border-green-500/20 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Corrected Manifest Ready
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-background border space-y-2">
                    <p className="text-sm font-medium">✅ Fixed {correctedFile.issuesFixed} issues</p>
                    <p className="text-sm font-medium">✅ Removed {correctedFile.duplicatesRemoved} duplicates</p>
                    <p className="text-sm text-muted-foreground">File: {correctedFile.fileName}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleDownloadCorrected} className="flex-1" variant="default">
                      <Download className="w-4 h-4 mr-2" />
                      Download Corrected File
                    </Button>
                    <Button
                      onClick={handleRetest}
                      disabled={retesting}
                      className="flex-1 bg-transparent"
                      variant="outline"
                    >
                      {retesting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Retesting...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Retest File
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAnalysis(null)
                  setCorrectedFile(null)
                  setWorkflowStatus([])
                }}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Analyze Again
              </Button>
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
