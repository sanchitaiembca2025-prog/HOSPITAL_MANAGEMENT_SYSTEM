import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { PageHeader } from "@/components/hms/PageHeader"

describe("PageHeader", () => {
  it("renders the title", () => {
    render(<PageHeader title="Patient List" />)
    expect(screen.getByRole("heading", { level: 1, name: "Patient List" })).toBeInTheDocument()
  })

  it("renders optional subtitle", () => {
    render(<PageHeader title="X" subtitle="All registered patients" />)
    expect(screen.getByText("All registered patients")).toBeInTheDocument()
  })

  it("does not render subtitle when omitted", () => {
    render(<PageHeader title="X" />)
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument()
  })

  it("renders breadcrumb links with correct href", () => {
    render(
      <PageHeader
        title="X"
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Personnel" },
        ]}
      />
    )
    const link = screen.getByRole("link", { name: "Dashboard" })
    expect(link).toHaveAttribute("href", "/admin")
  })

  it("renders plain text for breadcrumb items without href", () => {
    render(
      <PageHeader
        title="X"
        breadcrumb={[{ label: "Plain" }]}
      />
    )
    expect(screen.getByText("Plain")).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Plain" })).not.toBeInTheDocument()
  })

  it("renders separator between breadcrumb items", () => {
    render(
      <PageHeader
        title="X"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "List" },
        ]}
      />
    )
    expect(screen.getByText("/")).toBeInTheDocument()
  })

  it("renders actions slot", () => {
    render(<PageHeader title="X" actions={<button>Add New</button>} />)
    expect(screen.getByRole("button", { name: "Add New" })).toBeInTheDocument()
  })

  it("skips breadcrumb nav when breadcrumb is empty", () => {
    render(<PageHeader title="X" breadcrumb={[]} />)
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument()
  })

  it("applies custom className", () => {
    const { container } = render(<PageHeader title="X" className="custom-header" />)
    expect(container.firstChild).toHaveClass("custom-header")
  })
})
