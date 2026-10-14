// ─── Enums ────────────────────────────────────────────────────────────────────

export enum Role {
  ADMIN = "ADMIN",
  CLERK = "CLERK",
  DOCTOR = "DOCTOR",
  LAB = "LAB",
}

export enum VisitStatus {
  ADMITTED = "ADMITTED",
  TREATMENT_IN_PROGRESS = "TREATMENT_IN_PROGRESS",
  DISCHARGED = "DISCHARGED",
  DECEASED = "DECEASED",
}

export enum PatientType {
  INPATIENT = "INPATIENT",
  OUTPATIENT = "OUTPATIENT",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

// Keep InvoiceStatus as alias for PaymentStatus (UI uses this name)
export const InvoiceStatus = PaymentStatus
export type InvoiceStatus = PaymentStatus

// ─── API Response Types (matching backend DTOs exactly) ──────────────────────

export interface LoginResponse {
  token: string
  role: string
  userId: number
  name: string
}

export interface VisitSummary {
  visitId: number
  issue: string
  doctorName: string
  entryTime: string
  dischargeTime: string | null
  status: string
  invoiceId: number | null
  amountPaid: number | null
}

export interface PatientResponse {
  patientId: number
  firstName: string
  lastName: string
  phone: string
  address: string | null
  gender: Gender
  age: number
  registeredAt: string
  visits: VisitSummary[]
}

export interface VisitResponse {
  visitId: number
  patientId: number
  patientName: string
  issue: string
  doctorName: string
  patientType: PatientType
  wardCategory: string | null
  status: VisitStatus
  entryTime: string
  dischargeTime: string | null
  prescriptionReady: boolean
  prescriptionUploadedAt: string | null
}

export interface InvoiceResponse {
  invoiceId: number
  doctorFee: number
  testCost: number
  equipmentCost: number
  resourceCost: number
  totalAmount: number
  paymentStatus: PaymentStatus
}

export interface DoctorProfileResponse {
  userId: number
  fullName: string
  username: string
  phone: string | null
  email: string | null
  consultationFee: number
  sectionName: string | null
}

export interface PersonnelResponse {
  userId: number
  fullName: string
  username: string
  role: string
  phone: string | null
  email: string | null
  isActive: boolean
  consultationFee: number | null
  sectionName: string | null
}

export interface LabPatientResponse {
  patientId: number
  name: string
  age: number
  assignedDoctor: string
  visitId: number
  prescriptionReady: boolean
  canProceed: boolean
  gateMessage: string
}

export interface WardResponse {
  categoryId: number
  categoryName: string
  totalBeds: number
  availableBeds: number
}

export interface MedicalSectionResponse {
  sectionId: number
  sectionName: string
}

export interface CatalogueTestResponse {
  testId: number
  testName: string
  cost: number
  isAvailable: boolean
}

export interface CatalogueEquipmentResponse {
  equipmentId: number
  equipmentName: string
  cost: number
  isActive: boolean
}

export interface CatalogueResourceResponse {
  resourceId: number
  resourceName: string
  costPerUnit: number
  isActive: boolean
}

export interface SeminarResponse {
  seminarId: number
  seminarName: string
  seminarDate: string
  durationHours: number
  hallNumber: string
}

// ─── API Request Types ────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterPatientRequest {
  firstName: string
  lastName: string
  phone: string
  address: string
  gender: Gender
  age: number
}

export interface CreateVisitRequest {
  issue: string
  doctorId: number
  patientType: PatientType
  wardCategoryId?: number
}

export interface UpdateDoctorProfileRequest {
  phone?: string
  email?: string
  consultationFee?: number
}

export interface UpdatePersonnelRequest {
  fullName?: string
  phone?: string
  email?: string
  consultationFee?: number
}

export interface SaveLabCostsRequest {
  tests: { testId: number; quantity: number }[]
  equipment: { equipmentId: number; quantity: number }[]
  resources: { resourceId: number; quantityUsed: number }[]
}

export interface CatalogueTestRequest {
  testName: string
  cost: number
  isAvailable?: boolean
}

export interface CatalogueEquipmentRequest {
  equipmentName: string
  cost: number
  isActive?: boolean
}

export interface CatalogueResourceRequest {
  resourceName: string
  costPerUnit: number
  isActive?: boolean
}

export interface UpdateWardRequest {
  totalBeds: number
}

export interface CreateUserRequest {
  fullName: string
  username: string
  password: string
  role: Role
  phone?: string
  email?: string
  consultationFee?: number
  sectionId?: number
}

export interface SeminarRequest {
  seminarName: string
  seminarDate: string
  durationHours: number
  hallNumber: string
}

// ─── Convenience aliases used in UI components ────────────────────────────────

// The UI components reference Patient/Visit/Invoice/Doctor — map to response types
export type Patient = PatientResponse
export type Visit = VisitResponse
export type Invoice = InvoiceResponse
export type Doctor = DoctorProfileResponse
export type WardCategory = WardResponse
export type MedicalSection = MedicalSectionResponse
