import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { VisitSummaryCard } from "@/components/hms/VisitSummaryCard"
import { VisitStatus, PatientType, type Visit } from "@/types"

const visit: Visit = {
  visitId: 3,
  patientId: 10,
  patientName: "Alice Wonder",
  issue: "Persistent cough",
  doctorName: "Dr. Smith",
  patientType: PatientType.OUTPATIENT,
  wardCategory: null,
  status: VisitStatus.TREATMENT_IN_PROGRESS,
  entryTime: "2026-11-20T09:00:00",
  dischargeTime: null,
  prescriptionReady: false,
  prescriptionUploadedAt: null,
}

describe("VisitSummaryCard", () => {
  it("renders visit ID", () => {
    render(<VisitSummaryCard visit={visit} />)
    expect(screen.getByText("V-3")).toBeInTheDocument()
  })

  it("renders doctor name", () => {
    render(<VisitSummaryCard visit={visit} />)
    expect(screen.getByText("Dr. Smith")).toBeInTheDocument()
  })

  it("renders formatted entry time", () => {
    render(<VisitSummaryCard visit={visit} />)
    expect(screen.getByText(/20 Nov 2026/)).toBeInTheDocument()
  })

  it("renders issue text", () => {
    render(<VisitSummaryCard visit={visit} />)
    expect(screen.getByText("Persistent cough")).toBeInTheDocument()
  })

  it("does NOT show ward section when wardCategory is null", () => {
    render(<VisitSummaryCard visit={visit} />)
    expect(screen.queryByText(/ward/i)).not.toBeInTheDocument()
  })

  it("renders wardCategory when provided", () => {
    render(<VisitSummaryCard visit={{ ...visit, wardCategory: "General Ward" }} />)
    expect(screen.getByText("General Ward")).toBeInTheDocument()
  })

  it("renders status badge (VisitStatusBadge integration)", () => {
    render(<VisitSummaryCard visit={visit} />)
    // VisitStatusBadge for TREATMENT_IN_PROGRESS renders "In Treatment"
    expect(screen.getByText("In Treatment")).toBeInTheDocument()
  })

  it("renders actions slot", () => {
    render(<VisitSummaryCard visit={visit} actions={<button>Details</button>} />)
    expect(screen.getByRole("button", { name: "Details" })).toBeInTheDocument()
  })
})
