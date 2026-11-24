import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { FileUploadZone } from "@/components/hms/FileUploadZone"

function makeFile(name: string, type: string, sizeBytes: number): File {
  const content = new Uint8Array(sizeBytes)
  return new File([content], name, { type })
}

describe("FileUploadZone", () => {
  it("renders upload prompt by default", () => {
    render(<FileUploadZone onFileSelect={vi.fn()} />)
    expect(screen.getByText(/Drag & drop/i)).toBeInTheDocument()
    expect(screen.getByText(/PDF only, max 10 MB/i)).toBeInTheDocument()
  })

  it("calls onFileSelect and shows file name when valid PDF selected", () => {
    const onFileSelect = vi.fn()
    render(<FileUploadZone onFileSelect={onFileSelect} />)

    const file = makeFile("report.pdf", "application/pdf", 1024)
    const input = screen.getByLabelText("Upload file")
    fireEvent.change(input, { target: { files: [file] } })

    expect(onFileSelect).toHaveBeenCalledWith(file)
    expect(screen.getByText("report.pdf")).toBeInTheDocument()
  })

  it("shows error when file exceeds 10 MB", () => {
    render(<FileUploadZone onFileSelect={vi.fn()} />)

    const bigFile = makeFile("huge.pdf", "application/pdf", 11 * 1024 * 1024)
    const input = screen.getByLabelText("Upload file")
    fireEvent.change(input, { target: { files: [bigFile] } })

    expect(screen.getByText(/10 MB limit/i)).toBeInTheDocument()
  })

  it("shows error for invalid MIME type", () => {
    render(<FileUploadZone onFileSelect={vi.fn()} />)

    const imgFile = makeFile("photo.png", "image/png", 1024)
    const input = screen.getByLabelText("Upload file")
    fireEvent.change(input, { target: { files: [imgFile] } })

    expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument()
  })

  it("clear button removes selected file", () => {
    const onClear = vi.fn()
    render(<FileUploadZone onFileSelect={vi.fn()} onClear={onClear} />)

    const file = makeFile("doc.pdf", "application/pdf", 512)
    const input = screen.getByLabelText("Upload file")
    fireEvent.change(input, { target: { files: [file] } })

    // File shown — click remove
    fireEvent.click(screen.getByLabelText("Remove file"))
    expect(screen.getByText(/Drag & drop/i)).toBeInTheDocument()
    expect(onClear).toHaveBeenCalledOnce()
  })

  it("respects disabled prop on input", () => {
    render(<FileUploadZone onFileSelect={vi.fn()} disabled={true} />)
    const input = screen.getByLabelText("Upload file") as HTMLInputElement
    expect(input.disabled).toBe(true)
  })

  it("accepts custom accept type", () => {
    render(<FileUploadZone onFileSelect={vi.fn()} accept="image/png" />)
    const input = screen.getByLabelText("Upload file") as HTMLInputElement
    expect(input.accept).toBe("image/png")
  })
})
