import { describe, it, expect } from "vitest"
import { cn, formatCurrency, formatDate, formatDateTime, getInitials } from "@/lib/utils"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-2")).toBe("px-2 py-2")
  })

  it("resolves tailwind conflicts — last wins", () => {
    expect(cn("p-2", "p-4")).toBe("p-4")
  })

  it("handles falsy values", () => {
    expect(cn("base", false && "skip", undefined, null as any, "end")).toBe("base end")
  })

  it("handles conditional object syntax", () => {
    expect(cn({ "text-red-500": true, "text-blue-500": false })).toBe("text-red-500")
  })
})

describe("formatCurrency", () => {
  it("formats zero as ₹0", () => {
    expect(formatCurrency(0)).toContain("0")
  })

  it("formats 1000 in INR format", () => {
    const result = formatCurrency(1000)
    expect(result).toContain("1,000")
    expect(result).toMatch(/₹|INR/)
  })

  it("formats large amounts with commas", () => {
    const result = formatCurrency(100000)
    expect(result).toContain("1,00,000")
  })

  it("omits decimals (maximumFractionDigits=0)", () => {
    expect(formatCurrency(500.75)).not.toContain(".")
  })
})

describe("formatDate", () => {
  it("formats ISO string to dd MMM yyyy", () => {
    expect(formatDate("2026-11-24T10:30:00")).toBe("24 Nov 2026")
  })

  it("formats a Date object", () => {
    expect(formatDate(new Date(2026, 0, 1))).toBe("01 Jan 2026")
  })

  it("handles different months", () => {
    expect(formatDate("2026-06-15T00:00:00")).toBe("15 Jun 2026")
  })
})

describe("formatDateTime", () => {
  it("includes date and time", () => {
    const result = formatDateTime("2026-11-24T14:30:00")
    expect(result).toContain("24 Nov 2026")
    expect(result).toMatch(/2:30/)
  })

  it("formats a Date object", () => {
    const d = new Date(2026, 0, 5, 9, 5)
    const result = formatDateTime(d)
    expect(result).toContain("05 Jan 2026")
    expect(result).toContain("9:05")
  })
})

describe("getInitials", () => {
  it("extracts two initials from a full name", () => {
    expect(getInitials("Alice Brown")).toBe("AB")
  })

  it("uppercases initials", () => {
    expect(getInitials("john doe")).toBe("JD")
  })

  it("handles single name", () => {
    // Single word — only 1 initial available
    const result = getInitials("Admin")
    expect(result).toBe("A")
  })

  it("caps at 2 characters for multi-word names", () => {
    expect(getInitials("Dr. Alice Mary Brown")).toBe("DA")
  })

  it("handles names with extra spaces", () => {
    const result = getInitials("Bob  Smith")
    expect(result.length).toBeGreaterThan(0)
  })
})
