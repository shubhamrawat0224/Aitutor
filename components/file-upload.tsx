"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X, FileText, FileIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

interface FileUploadProps {
  onFileProcessed: (fileContent: string, fileName: string) => void
}

export function FileUpload({ onFileProcessed }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]

    if (!selectedFile) return

    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, Word document, or text file.",
        variant: "destructive",
      })
      return
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
  }

  const uploadFile = async () => {
    if (!file) return

    setUploading(true)
    setProgress(0)

    const formData = new FormData()
    formData.append("file", file)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 10
          if (newProgress >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return newProgress
        })
      }, 300)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || "Failed to upload file")
      }

      setProgress(100)

      const data = await response.json()
      onFileProcessed(data.content, file.name)

      toast({
        title: "File uploaded successfully",
        description: "Your document has been processed and is ready for analysis.",
      })

      // Reset after successful upload
      setTimeout(() => {
        setFile(null)
        setProgress(0)
      }, 1000)
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
      setProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const cancelUpload = () => {
    setFile(null)
    setProgress(0)
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Upload Document</h3>
          <span className="text-xs text-muted-foreground">PDF, Word, or Text (Max 10MB)</span>
        </div>

        {!file ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 space-y-2">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
            <label htmlFor="file-upload">
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Select File
              </Button>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
              />
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileIcon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={cancelUpload} disabled={uploading}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {progress > 0 && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-right text-muted-foreground">
                  {progress === 100 ? "Complete" : "Processing..."}
                </p>
              </div>
            )}

            {progress === 0 && (
              <Button onClick={uploadFile} disabled={uploading} className="w-full">
                {uploading ? "Processing..." : "Upload and Analyze"}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

