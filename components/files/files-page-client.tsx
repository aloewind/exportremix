"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Filter, Trash2, Sparkles, Calendar, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { FileAnalysisDialog } from "./file-analysis-dialog"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useTranslations } from "@/hooks/use-translations"

interface ManifestFile {
  id: string
  file_name: string
  file_type: string
  status: string
  created_at: string
  data: any
}

export function FilesPageClient() {
  const router = useRouter()
  const { toast } = useToast()
  const [files, setFiles] = useState<ManifestFile[]>([])
  const [filteredFiles, setFilteredFiles] = useState<ManifestFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date-desc")
  const [selectedFile, setSelectedFile] = useState<ManifestFile | null>(null)
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false)
  const t = useTranslations()

  // Fetch files on mount
  useEffect(() => {
    fetchFiles()
  }, [])

  // Apply filters whenever search, filter, or sort changes
  useEffect(() => {
    try {
      applyFilters()
    } catch (err) {
      console.error("[v0] Filter error:", err)
    }
  }, [files, searchQuery, filterType, sortBy])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/files")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.files) {
        setFiles(data.files)
      } else {
        setFiles([])
      }
    } catch (error) {
      console.error("[v0] Error fetching files:", error)
      setError(error instanceof Error ? error.message : "Failed to load files")
      setFiles([])
      toast({
        title: "Error",
        description: "Failed to load files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    try {
      let filtered = [...files]

      // Search filter
      if (searchQuery) {
        filtered = filtered.filter((file) => file.file_name?.toLowerCase().includes(searchQuery.toLowerCase()))
      }

      // Type filter
      if (filterType !== "all") {
        filtered = filtered.filter((file) => file.file_type === filterType)
      }

      // Sort
      filtered.sort((a, b) => {
        switch (sortBy) {
          case "date-desc":
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          case "date-asc":
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          case "name-asc":
            return a.file_name.localeCompare(b.file_name)
          case "name-desc":
            return b.file_name.localeCompare(a.file_name)
          default:
            return 0
        }
      })

      setFilteredFiles(filtered)
    } catch (err) {
      console.error("[v0] Error applying filters:", err)
      setFilteredFiles(files)
    }
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return

    try {
      const response = await fetch(`/api/files?id=${fileId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "File deleted",
          description: "File has been successfully deleted",
        })
        fetchFiles()
      } else {
        const data = await response.json()
        toast({
          title: "Error deleting file",
          description: data.error || "Failed to delete file",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error deleting file:", error)
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      })
    }
  }

  const handleAnalyze = (file: ManifestFile) => {
    setSelectedFile(file)
    setShowAnalysisDialog(true)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (err) {
      return dateString
    }
  }

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case "text/csv":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "application/json":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case "application/xml":
      case "text/xml":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "application/edi":
      case "text/edi":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "application/pdf":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  if (error && !loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Files</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchFiles}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">{t.files?.title || "My Files"}</h1>
            <p className="text-muted-foreground mt-1">Manage and analyze your uploaded manifest files</p>
          </div>
          <Button onClick={() => router.push("/dashboard/upload")}>
            <Upload className="w-4 h-4 mr-2" />
            {t.files?.uploadNew || "Upload New"}
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t.files?.search || "Search files..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t.files?.filterByType || "Filter by type"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.files?.allTypes || "All Types"}</SelectItem>
                  <SelectItem value="text/csv">CSV Files</SelectItem>
                  <SelectItem value="application/json">JSON Files</SelectItem>
                  <SelectItem value="application/xml">XML Files</SelectItem>
                  <SelectItem value="application/edi">EDI Files</SelectItem>
                  <SelectItem value="application/pdf">PDF Files</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t.files?.sortBy || "Sort by"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="name-asc">{t.files?.name || "Name"} (A-Z)</SelectItem>
                  <SelectItem value="name-desc">{t.files?.name || "Name"} (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Files List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground mt-4">{t.common?.loading || "Loading..."}</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No files found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterType !== "all"
                  ? "Try adjusting your filters"
                  : "Upload your first file to get started"}
              </p>
              <Button onClick={() => router.push("/dashboard/upload")}>
                <Upload className="w-4 h-4 mr-2" />
                {t.common?.upload || "Upload"} File
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredFiles.map((file) => (
              <Card key={file.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold truncate">{file.file_name}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className={getFileTypeColor(file.file_type)}>
                            {file.file_type === "text/csv"
                              ? "CSV"
                              : file.file_type === "application/json"
                                ? "JSON"
                                : file.file_type === "application/xml" || file.file_type === "text/xml"
                                  ? "XML"
                                  : file.file_type === "application/edi" || file.file_type === "text/edi"
                                    ? "EDI"
                                    : file.file_type === "application/pdf"
                                      ? "PDF"
                                      : "FILE"}
                          </Badge>
                          <Badge variant="outline">{file.status}</Badge>
                          <span className="text-sm text-muted-foreground">{formatDate(file.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleAnalyze(file)}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        {t.files?.analyze || "Analyze"}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(file.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Analysis Dialog */}
        {selectedFile && (
          <FileAnalysisDialog file={selectedFile} open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog} />
        )}
      </div>
    </DashboardLayout>
  )
}
