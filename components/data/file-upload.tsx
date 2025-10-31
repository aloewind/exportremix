"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: "uploading" | "success" | "error"
  data?: any
}

export function FileUpload({ onFilesProcessed }: { onFilesProcessed?: (files: UploadedFile[]) => void }) {
  const { toast } = useToast()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const processFile = useCallback(
    (file: File) => {
      const newFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        status: "uploading",
      }

      setFiles((prev) => [...prev, newFile])

      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string
          let parsedData: any // Added explicit any type annotation

          if (file.name.endsWith(".json")) {
            parsedData = JSON.parse(content)
          } else if (file.name.endsWith(".csv")) {
            const lines = content.split("\n")
            const headers = lines[0].split(",")
            parsedData = lines.slice(1).map((line) => {
              const values = line.split(",")
              return headers.reduce((obj: any, header, index) => {
                obj[header.trim()] = values[index]?.trim()
                return obj
              }, {})
            })
          } else if (file.name.endsWith(".xml")) {
            // Store raw XML content - will be parsed by the analyzer
            parsedData = { raw_content: content, format: "xml" }
          } else if (file.name.endsWith(".edi")) {
            // Store raw EDI content - will be parsed by the analyzer
            parsedData = { raw_content: content, format: "edi" }
          } else if (file.name.endsWith(".pdf")) {
            // Store raw PDF content - will be parsed by the analyzer
            parsedData = { raw_content: content, format: "pdf" }
          } else {
            throw new Error("Unsupported file format")
          }

          const response = await fetch("/api/files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              file_name: file.name,
              file_type: file.type || "application/octet-stream",
              data: parsedData,
            }),
          })

          if (!response.ok) {
            throw new Error("Failed to save file")
          }

          setFiles((prev) =>
            prev.map((f) =>
              f.id === newFile.id
                ? {
                    ...f,
                    status: "success",
                    data: parsedData,
                  }
                : f,
            ),
          )

          toast({
            title: "File uploaded",
            description: `${file.name} uploaded successfully. Go to My Files to analyze it.`,
          })

          if (onFilesProcessed) {
            onFilesProcessed([{ ...newFile, status: "success", data: parsedData }])
          }
        } catch (error) {
          setFiles((prev) => prev.map((f) => (f.id === newFile.id ? { ...f, status: "error" } : f)))

          toast({
            title: "File processing failed",
            description: `Failed to process ${file.name}. Please check the file format.`,
            variant: "destructive",
          })
        }
      }

      reader.onerror = () => {
        setFiles((prev) => prev.map((f) => (f.id === newFile.id ? { ...f, status: "error" } : f)))

        toast({
          title: "File read error",
          description: `Failed to read ${file.name}. Please try again.`,
          variant: "destructive",
        })
      }

      reader.readAsText(file)
    },
    [toast, onFilesProcessed],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const droppedFiles = Array.from(e.dataTransfer.files)
      droppedFiles.forEach((file) => {
        const validExtensions = [".csv", ".json", ".xml", ".edi", ".pdf"]
        const isValid = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))

        if (isValid) {
          processFile(file)
        } else {
          toast({
            title: "Invalid file type",
            description: "Please upload CSV, JSON, XML, EDI, or PDF files only.",
            variant: "destructive",
          })
        }
      })
    },
    [processFile, toast],
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    selectedFiles.forEach((file) => {
      processFile(file)
    })
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border"
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Upload manifest files</h3>
            <p className="text-muted-foreground">
              Drag and drop your CSV, JSON, XML, EDI, or PDF files here, or click to browse
            </p>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2 text-left">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Recommended: Use XML format for best results
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Our AI analyzer detects more errors and inconsistencies in XML files compared to CSV. XML's
                    structured format allows for deeper validation of manifest data, including missing duties, invalid
                    HS codes, and duplicate entries.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".csv,.json,.xml,.edi,.pdf"
              multiple
              onChange={handleFileInput}
            />
            <label htmlFor="file-upload">
              <Button asChild>
                <span>Browse Files</span>
              </Button>
            </label>
          </div>
        </div>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          {files.map((file) => (
            <Card key={file.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {file.status === "uploading" && (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                  {file.status === "success" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {file.status === "error" && <X className="w-5 h-5 text-red-500" />}
                  <Button variant="ghost" size="icon" onClick={() => removeFile(file.id)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
