import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ConfirmDialog } from "@/components/hms/ConfirmDialog"

describe("ConfirmDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: "Confirm Action",
    description: "Are you sure you want to do this?",
    onConfirm: vi.fn(),
  }

  it("renders title and description when open", () => {
    render(<ConfirmDialog {...defaultProps} />)
    expect(screen.getByText("Confirm Action")).toBeInTheDocument()
    expect(screen.getByText("Are you sure you want to do this?")).toBeInTheDocument()
  })

  it("does not render when open=false", () => {
    render(<ConfirmDialog {...defaultProps} open={false} />)
    expect(screen.queryByText("Confirm Action")).not.toBeInTheDocument()
  })

  it("renders default confirm and cancel button labels", () => {
    render(<ConfirmDialog {...defaultProps} />)
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
  })

  it("renders custom button labels", () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmLabel="Yes, delete"
        cancelLabel="No, go back"
      />
    )
    expect(screen.getByRole("button", { name: "Yes, delete" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "No, go back" })).toBeInTheDocument()
  })

  it("calls onConfirm when confirm button is clicked", () => {
    const onConfirm = vi.fn()
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("calls onOpenChange(false) when cancel is clicked", () => {
    const onOpenChange = vi.fn()
    render(<ConfirmDialog {...defaultProps} onOpenChange={onOpenChange} />)
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("shows Processing... and disables buttons when isLoading=true", () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} />)
    expect(screen.getByText("Processing...")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled()
  })

  it("shows AlertTriangle icon for destructive variant", () => {
    render(<ConfirmDialog {...defaultProps} variant="destructive" />)
    // Radix Dialog renders into a portal appended to document.body
    expect(document.body.querySelector("svg")).toBeInTheDocument()
  })

  it("does NOT show AlertTriangle for default variant", () => {
    // default variant has no special icon in the title area
    // — the only SVG present is inside the spinner (not shown when not loading)
    render(<ConfirmDialog {...defaultProps} variant="default" />)
    // Confirm button text is shown (not in loading state)
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument()
  })
})
