import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { PatientCard } from "@/components/hms/PatientCard"
import { Gender, type Patient } from "@/types"

const patient: Patient = {
  patientId: 7,
  firstName: "Alice",
  lastName: "Wonder",
  phone: "9876543210",
  address: "12 Elm Street",
  gender: Gender.FEMALE,
  age: 28,
  registeredAt: "2026-01-15T10:30:00",
  visits: [],
}

describe("PatientCard", () => {
  it("renders patient ID badge", () => {
    render(<PatientCard patient={patient} />)
    expect(screen.getByText("P-7")).toBeInTheDocument()
  })

  it("renders full name", () => {
    render(<PatientCard patient={patient} />)
    expect(screen.getByText("Alice Wonder")).toBeInTheDocument()
  })

  it("renders age and gender", () => {
    render(<PatientCard patient={patient} />)
    expect(screen.getByText(/28y/)).toBeInTheDocument()
    expect(screen.getByText(/Female/i)).toBeInTheDocument()
  })

  it("renders phone number", () => {
    render(<PatientCard patient={patient} />)
    expect(screen.getByText("9876543210")).toBeInTheDocument()
  })

  it("renders address", () => {
    render(<PatientCard patient={patient} />)
    expect(screen.getByText("12 Elm Street")).toBeInTheDocument()
  })

  it("renders formatted registration date", () => {
    render(<PatientCard patient={patient} />)
    expect(screen.getByText(/15 Jan 2026/)).toBeInTheDocument()
  })

  it("renders actions slot when provided", () => {
    render(<PatientCard patient={patient} actions={<button>View</button>} />)
    expect(screen.getByRole("button", { name: "View" })).toBeInTheDocument()
  })

  it("renders without actions slot", () => {
    const { container } = render(<PatientCard patient={patient} />)
    expect(container.querySelector("button")).toBeNull()
  })
})
