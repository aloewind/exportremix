"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Upload, Sparkles, Calculator, CheckCircle2, AlertTriangle, Download, RefreshCw, Loader2, Globe, FileText, Building2, Truck, Package, DollarSign, MapPin, Calendar, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Comprehensive manifest form data interface with ALL fields
interface ManifestFormData {
  // USPPI & Exporter Information
  usppiName: string
  usppiId: string
  exporterName: string
  exporterAddress: string
  
  // Consignee & Notify Party
  consigneeName: string
  consigneeAddress: string
  notifyPartyName: string
  notifyPartyAddress: string
  
  // Commodity Information
  description: string
  hsCode: string
  scheduleBNumber: string
  quantity: string
  uom: string
  weightGross: string
  weightNet: string
  
  // Value & Pricing
  valueFOB: string
  valueCIF: string
  
  // Origin & Destination
  origin: string
  destination: string
  incoterms: string
  
  // Shipping Information
  bolNumber: string
  carrierName: string
  scacCode: string
  vesselFlightNumber: string
  exportDate: string
  
  // Compliance & Control
  licensePermitInfo: string
  eccn: string
  hazardousMaterial: boolean
  
  // Packaging
  packagingType: string
  packagingNumber: string
  
  // Financial Details
  insuranceValue: string
  freightCharges: string
  dutiesTariffsEstimate: string
  
  // Additional
  signatureCertification: string
  notes: string
  
  // Legacy fields for backward compatibility
  value?: string
  weight?: string
}

interface ComplianceResult {
  score: number
  confidence?: number
  breakdown: {
    hsCode: boolean
    tariff: boolean
    value: boolean
    quantity: boolean
    origin: boolean
    destination: boolean
    [key: string]: boolean
  }
  errors: Array<{
    field: string
    message: string
    severity: "critical" | "high" | "medium" | "low"
  }>
  warnings?: string[]
  recommendations?: string[]
  details?: string
}

interface HSSuggestion {
  code: string
  confidence: number
  description?: string
}

export function BackOffice() {
  const { toast } = useToast()
  const [formData, setFormData] = useState<ManifestFormData>({
    usppiName: "",
    usppiId: "",
    exporterName: "",
    exporterAddress: "",
    consigneeName: "",
    consigneeAddress: "",
    notifyPartyName: "",
    notifyPartyAddress: "",
    description: "",
    hsCode: "",
    scheduleBNumber: "",
    quantity: "",
    uom: "",
    weightGross: "",
    weightNet: "",
    valueFOB: "",
    valueCIF: "",
    origin: "",
    destination: "",
    incoterms: "",
    bolNumber: "",
    carrierName: "",
    scacCode: "",
    vesselFlightNumber: "",
    exportDate: "",
    licensePermitInfo: "",
    eccn: "",
    hazardousMaterial: false,
    packagingType: "",
    packagingNumber: "",
    insuranceValue: "",
    freightCharges: "",
    dutiesTariffsEstimate: "",
    signatureCertification: "",
    notes: "",
  })
  
  const [loading, setLoading] = useState({
    extract: false,
    suggestHS: false,
    estimate: false,
    test: false,
    fix: false,
  })
  const [hsSuggestions, setHsSuggestions] = useState<HSSuggestion[]>([])
  const [tariffRate, setTariffRate] = useState<number | null>(null)
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null)
  const [fixedManifest, setFixedManifest] = useState<string | null>(null)
  const [gaps, setGaps] = useState<string[]>([])
  const [incoterms, setIncoterms] = useState<any>(null)
  const [countryAlerts, setCountryAlerts] = useState<any>(null)
  const [loadingIncoterms, setLoadingIncoterms] = useState(false)
  const [loadingAlerts, setLoadingAlerts] = useState(false)
  const [showEditableSection, setShowEditableSection] = useState(false)

  // Update form data helper
  const updateField = (field: keyof ManifestFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Highlight gaps in form
  useEffect(() => {
    const missing: string[] = []
    if (!formData.description) missing.push("Description")
    if (!formData.hsCode) missing.push("HS Code")
    if (!formData.quantity) missing.push("Quantity")
    if (!formData.valueFOB && !formData.value) missing.push("Value")
    if (!formData.origin) missing.push("Origin")
    if (!formData.destination) missing.push("Destination")
    setGaps(missing)
  }, [formData])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading((prev) => ({ ...prev, extract: true }))

    try {
      const text = await file.text()
      const response = await fetch("/api/extract-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xmlContent: text, fileName: file.name }),
      })

      const data = await response.json()

      if (response.ok && data.extracted) {
        // Map all extracted fields to form data
        setFormData((prev) => ({
          ...prev,
          ...data.extracted,
          // Legacy field mapping
          value: data.extracted.valueFOB || data.extracted.value || prev.value,
          weight: data.extracted.weightGross || data.extracted.weight || prev.weight,
        }))
        setShowEditableSection(true)
        toast({
          title: "Data extracted",
          description: "All manifest fields populated from XML file",
        })
      } else {
        toast({
          title: "Extraction failed",
          description: data.error || "Failed to extract data from file",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[BackOffice] File upload error:", error)
      toast({
        title: "Error",
        description: "Failed to process file",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, extract: false }))
    }
  }

  const handleSuggestHS = async () => {
    if (!formData.description) {
      toast({
        title: "Missing description",
        description: "Please enter a product description first",
        variant: "destructive",
      })
      return
    }

    setLoading((prev) => ({ ...prev, suggestHS: true }))
    setHsSuggestions([])

    try {
      const response = await fetch("/api/suggest-hs-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: formData.description,
          origin: formData.origin,
          destination: formData.destination,
        }),
      })

      const data = await response.json()

      if (response.ok && data.suggestions) {
        setHsSuggestions(data.suggestions)
        if (data.suggestions.length > 0) {
          updateField("hsCode", data.suggestions[0].code)
          toast({
            title: "HS Code suggested",
            description: `Top match: ${data.suggestions[0].code} (${data.suggestions[0].confidence}% confidence)`,
          })
        }
      } else {
        toast({
          title: "Suggestion failed",
          description: data.error || "Failed to suggest HS code",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[BackOffice] HS suggestion error:", error)
      toast({
        title: "Error",
        description: "Failed to get HS code suggestions",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, suggestHS: false }))
    }
  }

  const handleEstimateDuty = async () => {
    const value = formData.valueFOB || formData.value || "0"
    if (!formData.hsCode || !value || !formData.origin || !formData.destination) {
      toast({
        title: "Missing information",
        description: "Please fill in HS Code, Value, Origin, and Destination",
        variant: "destructive",
      })
      return
    }

    setLoading((prev) => ({ ...prev, estimate: true }))
    setTariffRate(null)

    try {
      const response = await fetch("/api/estimate-duty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hsCode: formData.hsCode,
          value: parseFloat(value),
          origin: formData.origin,
          destination: formData.destination,
        }),
      })

      const data = await response.json()

      if (response.ok && data.tariffRate !== undefined) {
        setTariffRate(data.tariffRate)
        const estimatedDuty = (parseFloat(value) * data.tariffRate) / 100
        updateField("dutiesTariffsEstimate", estimatedDuty.toFixed(2))
        toast({
          title: "Tariff estimated",
          description: `Estimated tariff rate: ${data.tariffRate}% (${data.source || "AI"})`,
        })
      } else {
        toast({
          title: "Estimation failed",
          description: data.error || "Failed to estimate tariff rate",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[BackOffice] Duty estimation error:", error)
      toast({
        title: "Error",
        description: "Failed to estimate duty",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, estimate: false }))
    }
  }

  const handleTestCompliance = async () => {
    setLoading((prev) => ({ ...prev, test: true }))
    setComplianceResult(null)

    try {
      const response = await fetch("/api/test-compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.score !== undefined) {
        setComplianceResult(data)
        toast({
          title: "Compliance test complete",
          description: `Score: ${data.score}/100${data.score === 100 ? " - Perfect!" : ""}`,
          variant: data.score === 100 ? "default" : "default",
        })
      } else {
        toast({
          title: "Test failed",
          description: data.error || "Failed to test compliance",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[BackOffice] Compliance test error:", error)
      toast({
        title: "Error",
        description: "Failed to test compliance",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, test: false }))
    }
  }

  const handleFixErrors = async () => {
    if (!complianceResult || complianceResult.score >= 100) {
      toast({
        title: "No fixes needed",
        description: "Compliance score is already 100/100",
      })
      return
    }

    setLoading((prev) => ({ ...prev, fix: true }))
    setFixedManifest(null)

    let currentFormData = { ...formData }
    let currentScore = complianceResult.score
    let attempts = 0
    const maxAttempts = 3

    // Auto-fix loop: fix → retest → repeat until 10/10 or max attempts
    while (attempts < maxAttempts && currentScore < 100) {
      attempts++
      console.log(`[BackOffice] Auto-fix attempt ${attempts}/${maxAttempts}, current score: ${currentScore}`)

      try {
        const response = await fetch("/api/fix-errors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formData: currentFormData,
            complianceResult: { ...complianceResult, score: currentScore },
          }),
        })

        const data = await response.json()

        if (response.ok && data.fixedData) {
          // Update form data with fixed values
          currentFormData = { ...currentFormData, ...data.fixedData }
          setFormData(currentFormData)

          // Update fixed manifest
          if (data.fixedManifest) {
            setFixedManifest(data.fixedManifest)
          }

          // Retest compliance automatically
          const retestResponse = await fetch("/api/test-compliance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(currentFormData),
          })
          
          if (retestResponse.ok) {
            const retestData = await retestResponse.json()
            setComplianceResult(retestData)
            currentScore = retestData.score
            console.log(`[BackOffice] Fix attempt ${attempts} completed, score: ${currentScore}/100`)

            if (currentScore >= 100) {
              toast({
                title: "Perfect score achieved!",
                description: `Fixed to 10/10 after ${attempts} attempt(s)`,
              })
              break
            } else if (attempts < maxAttempts) {
              toast({
                title: `Fix attempt ${attempts}`,
                description: `Score improved to ${currentScore}/100, retrying...`,
              })
            }
          }
        } else {
          toast({
            title: "Fix failed",
            description: data.error || "Failed to fix errors",
            variant: "destructive",
          })
          break
        }
      } catch (error) {
        console.error(`[BackOffice] Fix attempt ${attempts} error:`, error)
        if (attempts >= maxAttempts) {
          toast({
            title: "Error",
            description: "Failed to fix errors after multiple attempts",
            variant: "destructive",
          })
        }
      }
    }

    if (attempts >= maxAttempts && currentScore < 100) {
      toast({
        title: "Partial fix",
        description: `Score improved to ${currentScore}/100 after ${maxAttempts} attempts. Please review manually or try again.`,
        variant: "default",
      })
    }

    setLoading((prev) => ({ ...prev, fix: false }))
  }

  const handleRetest = async () => {
    setLoading((prev) => ({ ...prev, test: true }))
    
    try {
      const response = await fetch("/api/test-compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.score !== undefined) {
        setComplianceResult(data)
        toast({
          title: "Retest complete",
          description: `Score: ${data.score}/100${data.score === 100 ? " - Perfect!" : ""}`,
        })
      } else {
        toast({
          title: "Retest failed",
          description: data.error || "Failed to retest compliance",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[BackOffice] Retest error:", error)
      toast({
        title: "Error",
        description: "Failed to retest compliance",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, test: false }))
    }
  }

  const handleDownloadFixed = () => {
    if (!fixedManifest) {
      // Generate XML from current form data
      const xml = generateXMLFromFormData(formData)
      downloadXML(xml)
    } else {
      downloadXML(fixedManifest)
    }
  }

  const downloadXML = (xml: string) => {
    const blob = new Blob([xml], { type: "application/xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `manifest-${new Date().toISOString().split('T')[0]}.xml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Download started",
      description: "Manifest XML file is downloading",
    })
  }

  const generateXMLFromFormData = (data: ManifestFormData): string => {
    const fields: string[] = []
    
    // Add all non-empty fields as XML attributes
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "" && value !== false) {
        if (typeof value === "boolean") {
          if (value) fields.push(`${key}="true"`)
        } else {
          fields.push(`${key}="${String(value).replace(/"/g, "&quot;")}"`)
        }
      }
    })

    return `<manifest>
  <item ${fields.join("\n    ")} />
</manifest>`
  }

  const handleSuggestIncoterms = async () => {
    if (!formData.origin || !formData.destination) {
      toast({
        title: "Missing information",
        description: "Please fill in Origin and Destination",
        variant: "destructive",
      })
      return
    }

    setLoadingIncoterms(true)
    setIncoterms(null)

    try {
      const response = await fetch("/api/suggest-incoterms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: formData.origin,
          destination: formData.destination,
          value: formData.valueFOB || formData.value,
          hsCode: formData.hsCode,
          description: formData.description,
        }),
      })

      const data = await response.json()

      if (response.ok && data.recommended) {
        setIncoterms(data)
        updateField("incoterms", data.recommended)
        toast({
          title: "Incoterms suggested",
          description: `Recommended: ${data.recommended} (${data.confidence}% confidence)`,
        })
      } else {
        toast({
          title: "Suggestion failed",
          description: data.error || "Failed to suggest incoterms",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[BackOffice] Incoterms suggestion error:", error)
      toast({
        title: "Error",
        description: "Failed to get incoterms suggestions",
        variant: "destructive",
      })
    } finally {
      setLoadingIncoterms(false)
    }
  }

  const handleCheckCountryAlerts = async () => {
    if (!formData.origin || !formData.destination) {
      toast({
        title: "Missing information",
        description: "Please fill in Origin and Destination",
        variant: "destructive",
      })
      return
    }

    setLoadingAlerts(true)
    setCountryAlerts(null)

    try {
      const response = await fetch("/api/country-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: formData.origin,
          destination: formData.destination,
          hsCode: formData.hsCode,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setCountryAlerts(data)
        const alertCount = data.alerts?.length || 0
        if (alertCount > 0) {
          toast({
            title: "Country alerts found",
            description: `${alertCount} alert(s) detected`,
            variant: alertCount > 2 ? "destructive" : "default",
          })
        } else {
          toast({
            title: "No alerts",
            description: "No restrictions or special requirements found",
          })
        }
      } else {
        toast({
          title: "Check failed",
          description: data.error || "Failed to check country alerts",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[BackOffice] Country alerts error:", error)
      toast({
        title: "Error",
        description: "Failed to check country alerts",
        variant: "destructive",
      })
    } finally {
      setLoadingAlerts(false)
    }
  }

  const estimatedDuty = tariffRate && (formData.valueFOB || formData.value) 
    ? (parseFloat(formData.valueFOB || formData.value || "0") * tariffRate) / 100 
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Back Office - Manifest Entry</h1>
        <p className="text-muted-foreground mt-2">Enter or upload manifest data for compliance checking</p>
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload XML Manifest</CardTitle>
          <CardDescription>Upload an XML file to automatically extract and fill all manifest fields</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".xml"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={loading.extract}
            />
            <Button
              variant="default"
              className="bg-black text-white hover:bg-black/90"
              onClick={() => document.getElementById("file-upload")?.click()}
              disabled={loading.extract}
            >
              {loading.extract ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Browse Files
                </>
              )}
            </Button>
            {gaps.length > 0 && (
              <Alert className="flex-1">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Missing required fields: <strong>{gaps.join(", ")}</strong>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Editable Manifest Form */}
      {showEditableSection && (
        <Card>
          <CardHeader>
            <CardTitle>Manifest Details - All Fields</CardTitle>
            <CardDescription>Edit all manifest fields below. Changes are saved automatically.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full" defaultValue={["commodity", "parties"]}>
              {/* USPPI & Exporter Information */}
              <AccordionItem value="parties">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>USPPI, Exporter & Consignee Information</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="usppiName">USPPI Name *</Label>
                      <Input
                        id="usppiName"
                        value={formData.usppiName}
                        onChange={(e) => updateField("usppiName", e.target.value)}
                        placeholder="US Principal Party in Interest"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="usppiId">USPPI ID (EIN/Tax ID)</Label>
                      <Input
                        id="usppiId"
                        value={formData.usppiId}
                        onChange={(e) => updateField("usppiId", e.target.value)}
                        placeholder="EIN or Tax ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exporterName">Exporter Name</Label>
                      <Input
                        id="exporterName"
                        value={formData.exporterName}
                        onChange={(e) => updateField("exporterName", e.target.value)}
                        placeholder="Exporter name"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="exporterAddress">Exporter Address</Label>
                      <Textarea
                        id="exporterAddress"
                        value={formData.exporterAddress}
                        onChange={(e) => updateField("exporterAddress", e.target.value)}
                        placeholder="Full exporter address"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="consigneeName">Consignee Name *</Label>
                      <Input
                        id="consigneeName"
                        value={formData.consigneeName}
                        onChange={(e) => updateField("consigneeName", e.target.value)}
                        placeholder="Consignee name"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="consigneeAddress">Consignee Address</Label>
                      <Textarea
                        id="consigneeAddress"
                        value={formData.consigneeAddress}
                        onChange={(e) => updateField("consigneeAddress", e.target.value)}
                        placeholder="Full consignee address"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notifyPartyName">Notify Party Name</Label>
                      <Input
                        id="notifyPartyName"
                        value={formData.notifyPartyName}
                        onChange={(e) => updateField("notifyPartyName", e.target.value)}
                        placeholder="Notify party (if applicable)"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="notifyPartyAddress">Notify Party Address</Label>
                      <Textarea
                        id="notifyPartyAddress"
                        value={formData.notifyPartyAddress}
                        onChange={(e) => updateField("notifyPartyAddress", e.target.value)}
                        placeholder="Notify party address"
                        rows={2}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Commodity Information */}
              <AccordionItem value="commodity">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    <span>Commodity Information</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Commodity Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => updateField("description", e.target.value)}
                        placeholder="Detailed product/commodity description"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hsCode">HS Code *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="hsCode"
                          value={formData.hsCode}
                          onChange={(e) => updateField("hsCode", e.target.value)}
                          placeholder="6-10 digits"
                          className={formData.hsCode && !/^\d{6,10}$/.test(formData.hsCode.replace(/[\s.-]/g, "")) ? "border-red-500" : ""}
                        />
                        <Button onClick={handleSuggestHS} disabled={loading.suggestHS} variant="outline" size="icon">
                          {loading.suggestHS ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        </Button>
                      </div>
                      {hsSuggestions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {hsSuggestions.map((suggestion, idx) => (
                            <Badge
                              key={idx}
                              variant={idx === 0 ? "default" : "outline"}
                              className="mr-2 cursor-pointer"
                              onClick={() => updateField("hsCode", suggestion.code)}
                            >
                              {suggestion.code} ({suggestion.confidence}%)
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduleBNumber">Schedule B Number</Label>
                      <Input
                        id="scheduleBNumber"
                        value={formData.scheduleBNumber}
                        onChange={(e) => updateField("scheduleBNumber", e.target.value)}
                        placeholder="Schedule B code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => updateField("quantity", e.target.value)}
                        placeholder="Quantity"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="uom">Unit of Measure</Label>
                      <Input
                        id="uom"
                        value={formData.uom}
                        onChange={(e) => updateField("uom", e.target.value)}
                        placeholder="PCS, KG, LTR, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weightGross">Gross Weight (kg)</Label>
                      <Input
                        id="weightGross"
                        type="number"
                        value={formData.weightGross}
                        onChange={(e) => updateField("weightGross", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weightNet">Net Weight (kg)</Label>
                      <Input
                        id="weightNet"
                        type="number"
                        value={formData.weightNet}
                        onChange={(e) => updateField("weightNet", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Value & Pricing */}
              <AccordionItem value="value">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Value & Pricing</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="valueFOB">Value FOB (USD) *</Label>
                      <Input
                        id="valueFOB"
                        type="number"
                        value={formData.valueFOB}
                        onChange={(e) => updateField("valueFOB", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valueCIF">Value CIF (USD)</Label>
                      <Input
                        id="valueCIF"
                        type="number"
                        value={formData.valueCIF}
                        onChange={(e) => updateField("valueCIF", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="insuranceValue">Insurance Value (USD)</Label>
                      <Input
                        id="insuranceValue"
                        type="number"
                        value={formData.insuranceValue}
                        onChange={(e) => updateField("insuranceValue", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="freightCharges">Freight Charges (USD)</Label>
                      <Input
                        id="freightCharges"
                        type="number"
                        value={formData.freightCharges}
                        onChange={(e) => updateField("freightCharges", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dutiesTariffsEstimate">Duties/Tariffs Estimate (USD)</Label>
                      <Input
                        id="dutiesTariffsEstimate"
                        type="number"
                        value={formData.dutiesTariffsEstimate}
                        onChange={(e) => updateField("dutiesTariffsEstimate", e.target.value)}
                        placeholder="0.00"
                        readOnly={!!tariffRate}
                      />
                      {tariffRate && (
                        <p className="text-xs text-muted-foreground">Auto-calculated from tariff rate</p>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Origin & Destination */}
              <AccordionItem value="location">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Origin & Destination</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="origin">Country of Origin *</Label>
                      <Input
                        id="origin"
                        value={formData.origin}
                        onChange={(e) => updateField("origin", e.target.value)}
                        placeholder="Country code (e.g., US, CN)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destination">Ultimate Destination Country *</Label>
                      <Input
                        id="destination"
                        value={formData.destination}
                        onChange={(e) => updateField("destination", e.target.value)}
                        placeholder="Country code (e.g., EU, JP, CA)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="incoterms">Incoterms</Label>
                      <div className="flex gap-2">
                        <Input
                          id="incoterms"
                          value={formData.incoterms}
                          onChange={(e) => updateField("incoterms", e.target.value)}
                          placeholder="FOB, CIF, EXW, DDP, etc."
                        />
                        <Button onClick={handleSuggestIncoterms} disabled={loadingIncoterms} variant="outline" size="icon">
                          {loadingIncoterms ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Shipping Information */}
              <AccordionItem value="shipping">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <span>Shipping Information</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="bolNumber">Bill of Lading/Air Waybill Number</Label>
                      <Input
                        id="bolNumber"
                        value={formData.bolNumber}
                        onChange={(e) => updateField("bolNumber", e.target.value)}
                        placeholder="BOL/AWB number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="carrierName">Carrier Name</Label>
                      <Input
                        id="carrierName"
                        value={formData.carrierName}
                        onChange={(e) => updateField("carrierName", e.target.value)}
                        placeholder="Carrier name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scacCode">SCAC Code</Label>
                      <Input
                        id="scacCode"
                        value={formData.scacCode}
                        onChange={(e) => updateField("scacCode", e.target.value)}
                        placeholder="Standard Carrier Alpha Code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vesselFlightNumber">Vessel/Flight Number</Label>
                      <Input
                        id="vesselFlightNumber"
                        value={formData.vesselFlightNumber}
                        onChange={(e) => updateField("vesselFlightNumber", e.target.value)}
                        placeholder="Vessel or flight number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exportDate">Export Date</Label>
                      <Input
                        id="exportDate"
                        type="date"
                        value={formData.exportDate}
                        onChange={(e) => updateField("exportDate", e.target.value)}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Compliance & Control */}
              <AccordionItem value="compliance">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Compliance & Control</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="licensePermitInfo">License/Permit Info</Label>
                      <Input
                        id="licensePermitInfo"
                        value={formData.licensePermitInfo}
                        onChange={(e) => updateField("licensePermitInfo", e.target.value)}
                        placeholder="License/permit information (if controlled)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eccn">ECCN</Label>
                      <Input
                        id="eccn"
                        value={formData.eccn}
                        onChange={(e) => updateField("eccn", e.target.value)}
                        placeholder="Export Control Classification Number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hazardousMaterial">Hazardous Material</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="hazardousMaterial"
                          checked={formData.hazardousMaterial}
                          onChange={(e) => updateField("hazardousMaterial", e.target.checked)}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="hazardousMaterial" className="cursor-pointer">Mark as hazardous material</Label>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Packaging */}
              <AccordionItem value="packaging">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    <span>Packaging Details</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="packagingType">Packaging Type</Label>
                      <Input
                        id="packagingType"
                        value={formData.packagingType}
                        onChange={(e) => updateField("packagingType", e.target.value)}
                        placeholder="Box, Pallet, Container, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="packagingNumber">Packaging Number</Label>
                      <Input
                        id="packagingNumber"
                        type="number"
                        value={formData.packagingNumber}
                        onChange={(e) => updateField("packagingNumber", e.target.value)}
                        placeholder="Number of packages"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Additional Information */}
              <AccordionItem value="additional">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Additional Information</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 gap-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="signatureCertification">Signature/Certification</Label>
                      <Textarea
                        id="signatureCertification"
                        value={formData.signatureCertification}
                        onChange={(e) => updateField("signatureCertification", e.target.value)}
                        placeholder="Signature and certification details"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes/Declarations</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => updateField("notes", e.target.value)}
                        placeholder="Any additional notes or declarations"
                        rows={3}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Tariff Estimation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleEstimateDuty} disabled={loading.estimate} className="w-full">
              {loading.estimate ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Estimating...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  Estimate Duty
                </>
              )}
            </Button>
            {tariffRate !== null && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Tariff Rate:</span>
                  <Badge variant="secondary">{tariffRate}%</Badge>
                </div>
                {estimatedDuty !== null && (
                  <div className="flex justify-between">
                    <span className="text-sm">Estimated Duty:</span>
                    <span className="font-semibold">${estimatedDuty.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Compliance Testing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleTestCompliance} disabled={loading.test} className="w-full">
              {loading.test ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Test Compliance
                </>
              )}
            </Button>
            {complianceResult && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Compliance Score</span>
                  <Badge variant={complianceResult.score >= 90 ? "default" : complianceResult.score >= 70 ? "secondary" : "destructive"}>
                    {complianceResult.score}/100
                  </Badge>
                </div>
                <Progress value={complianceResult.score} className="h-2" />
                {complianceResult.score < 100 && (
                  <Button onClick={handleFixErrors} disabled={loading.fix} variant="outline" className="w-full mt-2">
                    {loading.fix ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Auto-Fixing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Fix Errors Automatically
                      </>
                    )}
                  </Button>
                )}
                <Button 
                  onClick={handleRetest} 
                  disabled={loading.test} 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                >
                  {loading.test ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retest Compliance
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Compliance Breakdown */}
      {complianceResult && (
        <Card>
          <CardHeader>
            <CardTitle>Compliance Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(complianceResult.breakdown).map(([field, valid]) => (
                <div key={field} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{field}</span>
                  {valid ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                </div>
              ))}
              {complianceResult.errors && complianceResult.errors.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold text-sm">Errors:</h4>
                  {complianceResult.errors.map((error, idx) => (
                    <Alert key={idx} variant={error.severity === "critical" ? "destructive" : "default"}>
                      <AlertDescription>
                        <strong>{error.field}:</strong> {error.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
              {complianceResult.warnings && complianceResult.warnings.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold text-sm">Warnings:</h4>
                  {complianceResult.warnings.map((warning, idx) => (
                    <Alert key={idx}>
                      <AlertDescription>{warning}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
              {complianceResult.details && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">{complianceResult.details}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incoterms Suggestion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Incoterms Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleSuggestIncoterms} disabled={loadingIncoterms} className="w-full">
            {loadingIncoterms ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Suggest Best Incoterm
              </>
            )}
          </Button>
          {incoterms && (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Recommended: {incoterms.recommended}</span>
                  <Badge variant="secondary">{incoterms.confidence}% confidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{incoterms.explanation}</p>
                <div className="flex gap-2">
                  <Badge variant={incoterms.risk === "low" ? "default" : incoterms.risk === "medium" ? "secondary" : "destructive"}>
                    Risk: {incoterms.risk}
                  </Badge>
                  <Badge variant="outline">Cost: {incoterms.cost}</Badge>
                </div>
              </div>
              {incoterms.alternatives && incoterms.alternatives.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Alternatives:</h4>
                  {incoterms.alternatives.map((alt: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{alt.term}</span>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">Risk: {alt.risk}</Badge>
                          <Badge variant="outline" className="text-xs">Cost: {alt.cost}</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{alt.whenToUse}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Country-Specific Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Country-Specific Regulations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleCheckCountryAlerts} disabled={loadingAlerts} variant="outline" className="w-full">
            {loadingAlerts ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Check Regulations
              </>
            )}
          </Button>
          {countryAlerts && (
            <div className="space-y-3">
              {countryAlerts.alerts && countryAlerts.alerts.length > 0 && (
                <div className="space-y-2">
                  {countryAlerts.alerts.map((alert: any, idx: number) => (
                    <Alert
                      key={idx}
                      variant={alert.severity === "critical" || alert.severity === "high" ? "destructive" : "default"}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-semibold mb-1">{alert.title}</div>
                        <div className="text-sm">{alert.message}</div>
                        {alert.action && (
                          <div className="mt-2 text-sm font-medium text-primary">{alert.action}</div>
                        )}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
              {countryAlerts.deMinimis && (
                <div className="p-3 rounded-lg border bg-card">
                  <div className="font-semibold text-sm mb-1">De Minimis Threshold</div>
                  <div className="text-sm text-muted-foreground">
                    {countryAlerts.deMinimis.value
                      ? `$${countryAlerts.deMinimis.value} ${countryAlerts.deMinimis.currency}`
                      : "Check destination country customs"}
                  </div>
                  {countryAlerts.deMinimis.note && (
                    <div className="text-xs text-muted-foreground mt-1">{countryAlerts.deMinimis.note}</div>
                  )}
                </div>
              )}
              {countryAlerts.licenses && countryAlerts.licenses.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">License Requirements:</h4>
                  {countryAlerts.licenses.map((license: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{license.type}</span>
                        <Badge variant={license.required ? "destructive" : "secondary"}>
                          {license.required ? "Required" : "Not Required"}
                        </Badge>
                      </div>
                      {license.description && (
                        <p className="text-xs text-muted-foreground mt-1">{license.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {(!countryAlerts.alerts || countryAlerts.alerts.length === 0) &&
                (!countryAlerts.licenses || countryAlerts.licenses.length === 0) && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>No restrictions or special requirements found for this route.</AlertDescription>
                  </Alert>
                )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fixed Manifest Actions */}
      {(fixedManifest || complianceResult?.score === 100) && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              Manifest Ready for Download
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                {complianceResult?.score === 100 
                  ? "Manifest is compliant and ready for download." 
                  : "Manifest has been fixed. Download or retest to verify compliance."}
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button onClick={handleDownloadFixed} variant="default" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download XML
              </Button>
              <Button onClick={handleRetest} variant="outline" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retest
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
