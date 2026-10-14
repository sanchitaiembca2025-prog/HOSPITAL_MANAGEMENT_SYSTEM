"use client"

import { useCallback, useState } from "react"
import { Upload, FileText, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void
  onClear?: () => void
  accept?: string
  disabled?: boolean
  className?: string
}

export function FileUploadZone({
  onFileSelect,
  onClear,
  accept = "application/pdf",
  disabled = false,
  className,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(
    (file: File) => {
      setError(null)
      if (file.size > MAX_FILE_SIZE) {
        setError("File exceeds 10 MB limit. Please select a smaller file.")
        return
      }
      // Check MIME type: accept may be "application/pdf" or a comma-separated list.
      // Also handle the case where the browser reports an empty type (some OS/browser combos)
      // by falling back to checking the file extension.
      const acceptedTypes = accept.split(",").map((s) => s.trim())
      const typeOk =
        !file.type ||
        acceptedTypes.some((t) => {
          if (t.endsWith("/*")) return file.type.startsWith(t.slice(0, -1))
          return file.type === t
        })
      if (!typeOk) {
        setError("Invalid file type. Please upload a PDF.")
        return
      }
      setSelectedFile(file)
      onFileSelect(file)
    },
    [accept, onFileSelect]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleClear = () => {
    setSelectedFile(null)
    setError(null)
    onClear?.()
  }

  return (
    <div className={className}>
      {selectedFile ? (
        <div className="flex items-center gap-3 p-4 border border-success-500 bg-success-50 rounded-lg">
          <FileText className="h-5 w-5 text-success-700 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-800 truncate">{selectedFile.name}</p>
            <p className="text-xs text-neutral-600">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded hover:bg-success-100 text-neutral-600 hover:text-danger-500 transition-colors"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-lg transition-colors cursor-pointer",
            isDragging
              ? "border-primary-600 bg-primary-50"
              : "border-neutral-300 bg-neutral-100 hover:border-primary-600 hover:bg-primary-50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleChange}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Upload file"
          />
          <Upload className="h-8 w-8 text-neutral-400" />
          <div className="text-center">
            <p className="text-sm font-medium text-neutral-800">
              Drag & drop or{" "}
              <span className="text-primary-600 underline">browse</span>
            </p>
            <p className="text-xs text-neutral-600 mt-1">PDF only, max 10 MB</p>
          </div>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 mt-2 text-sm text-danger-500">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
