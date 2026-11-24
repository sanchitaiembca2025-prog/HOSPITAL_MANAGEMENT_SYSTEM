import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { z } from "zod"
import { Gender, PatientType } from "@/types"

// ── Zod schemas (extracted / duplicated here from page files) ─────────────────

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName:  z.string().min(1, "Last name is required"),
  phone:     z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  address:   z.string().optional(),
  gender:    z.nativeEnum(Gender),
  age:       z.coerce.number().int().min(0).max(150),
})

const visitSchema = z
  .object({
    issue:          z.string().min(3, "Issue must be at least 3 characters"),
    patientType:    z.nativeEnum(PatientType),
    doctorId:       z.number().min(1),
    wardCategoryId: z.number().optional(),
  })
  .refine(
    (d) => !(d.patientType === PatientType.INPATIENT && !d.wardCategoryId),
    { message: "Select a ward for inpatient", path: ["wardCategoryId"] }
  )

const baseSignupSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    username: z.string().min(3, "Min 3 characters").max(50),
    password: z.string().min(6, "Min 6 characters"),
    confirm:  z.string(),
    phone:    z.string().regex(/^\d{10}$/, "Must be 10 digits").optional().or(z.literal("")),
    email:    z.string().email("Invalid email").optional().or(z.literal("")),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  })

// ── Login schema ─────────────────────────────────────────────────────────────

describe("loginSchema", () => {
  it("passes with valid credentials", () => {
    expect(loginSchema.safeParse({ username: "admin", password: "secret" }).success).toBe(true)
  })

  it("fails when username is empty", () => {
    const result = loginSchema.safeParse({ username: "", password: "pass" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe("Username is required")
  })

  it("fails when password is empty", () => {
    const result = loginSchema.safeParse({ username: "admin", password: "" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe("Password is required")
  })

  it("fails when both fields are missing", () => {
    const result = loginSchema.safeParse({})
    expect(result.success).toBe(false)
    expect(result.error?.issues.length).toBeGreaterThanOrEqual(2)
  })
})

// ── Patient registration schema ───────────────────────────────────────────────

describe("patientSchema", () => {
  const valid = {
    firstName: "Alice",
    lastName:  "Brown",
    phone:     "9876543210",
    address:   "123 Main St",
    gender:    Gender.FEMALE,
    age:       28,
  }

  it("passes with all valid fields", () => {
    expect(patientSchema.safeParse(valid).success).toBe(true)
  })

  it("fails with 9-digit phone number", () => {
    const result = patientSchema.safeParse({ ...valid, phone: "123456789" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain("10 digits")
  })

  it("fails with 11-digit phone number", () => {
    const result = patientSchema.safeParse({ ...valid, phone: "12345678901" })
    expect(result.success).toBe(false)
  })

  it("fails with negative age", () => {
    const result = patientSchema.safeParse({ ...valid, age: -1 })
    expect(result.success).toBe(false)
  })

  it("fails with age over 150", () => {
    const result = patientSchema.safeParse({ ...valid, age: 151 })
    expect(result.success).toBe(false)
  })

  it("fails with invalid gender value", () => {
    const result = patientSchema.safeParse({ ...valid, gender: "ALIEN" })
    expect(result.success).toBe(false)
  })

  it("accepts address as optional", () => {
    const { address: _, ...noAddress } = valid
    expect(patientSchema.safeParse(noAddress).success).toBe(true)
  })

  it("passes with age 0 (newborn)", () => {
    expect(patientSchema.safeParse({ ...valid, age: 0 }).success).toBe(true)
  })

  it("passes with age 150 (boundary)", () => {
    expect(patientSchema.safeParse({ ...valid, age: 150 }).success).toBe(true)
  })
})

// ── Visit creation schema ─────────────────────────────────────────────────────

describe("visitSchema", () => {
  it("passes for outpatient without wardCategoryId", () => {
    const result = visitSchema.safeParse({
      issue: "Severe headache",
      patientType: PatientType.OUTPATIENT,
      doctorId: 1,
    })
    expect(result.success).toBe(true)
  })

  it("passes for inpatient with wardCategoryId", () => {
    const result = visitSchema.safeParse({
      issue: "Post-surgery recovery",
      patientType: PatientType.INPATIENT,
      doctorId: 1,
      wardCategoryId: 2,
    })
    expect(result.success).toBe(true)
  })

  it("fails for inpatient without wardCategoryId", () => {
    const result = visitSchema.safeParse({
      issue: "Surgery needed",
      patientType: PatientType.INPATIENT,
      doctorId: 1,
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain("ward")
  })

  it("fails when issue is too short", () => {
    const result = visitSchema.safeParse({
      issue: "Ab",
      patientType: PatientType.OUTPATIENT,
      doctorId: 1,
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain("3 characters")
  })

  it("fails with missing doctorId", () => {
    const result = visitSchema.safeParse({
      issue: "Fever and chills",
      patientType: PatientType.OUTPATIENT,
    })
    expect(result.success).toBe(false)
  })
})

// ── Signup schema ─────────────────────────────────────────────────────────────

describe("baseSignupSchema", () => {
  const valid = {
    fullName: "Dr. Alice",
    username: "alice123",
    password: "securepass",
    confirm:  "securepass",
    phone:    "9876543210",
    email:    "alice@hms.com",
  }

  it("passes with all valid fields", () => {
    expect(baseSignupSchema.safeParse(valid).success).toBe(true)
  })

  it("fails when passwords do not match", () => {
    const result = baseSignupSchema.safeParse({ ...valid, confirm: "different" })
    expect(result.success).toBe(false)
    const confirmError = result.error?.issues.find((i) => i.path.includes("confirm"))
    expect(confirmError?.message).toBe("Passwords do not match")
  })

  it("fails when username is too short (< 3 chars)", () => {
    const result = baseSignupSchema.safeParse({ ...valid, username: "ab" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain("3 characters")
  })

  it("fails when password is too short (< 6 chars)", () => {
    const result = baseSignupSchema.safeParse({ ...valid, password: "12345", confirm: "12345" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain("6 characters")
  })

  it("fails with invalid email", () => {
    const result = baseSignupSchema.safeParse({ ...valid, email: "not-an-email" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain("Invalid email")
  })

  it("passes when optional phone/email are omitted", () => {
    const { phone: _p, email: _e, ...noContact } = valid
    expect(baseSignupSchema.safeParse(noContact).success).toBe(true)
  })

  it("passes with empty phone string (literal empty allowed)", () => {
    expect(baseSignupSchema.safeParse({ ...valid, phone: "" }).success).toBe(true)
  })

  it("fails with 9-digit phone", () => {
    const result = baseSignupSchema.safeParse({ ...valid, phone: "987654321" })
    expect(result.success).toBe(false)
  })

  it("fails with fullName shorter than 2 chars", () => {
    const result = baseSignupSchema.safeParse({ ...valid, fullName: "A" })
    expect(result.success).toBe(false)
  })
})
