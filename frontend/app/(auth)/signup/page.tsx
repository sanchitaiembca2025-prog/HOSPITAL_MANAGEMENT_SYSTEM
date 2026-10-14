"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery } from "@tanstack/react-query"
import { Loader2, UserPlus, Stethoscope, ClipboardList, FlaskConical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRegister } from "@/hooks/use-auth"
import api from "@/lib/api"
import { MedicalSectionResponse } from "@/types"

// ── Role selector ─────────────────────────────────────────────────────────────

type SignupRole = "DOCTOR" | "CLERK" | "LAB"

const ROLES: { value: SignupRole; label: string; icon: React.ElementType; description: string }[] = [
  { value: "DOCTOR",  label: "Doctor",        icon: Stethoscope,   description: "Medical practitioner" },
  { value: "CLERK",   label: "Clerk",         icon: ClipboardList, description: "Front desk / registration" },
  { value: "LAB",     label: "Lab Personnel", icon: FlaskConical,  description: "Laboratory technician" },
]

// ── Zod schemas ───────────────────────────────────────────────────────────────

const baseSchema = z.object({
  fullName:  z.string().min(2, "Full name is required"),
  username:  z.string().min(3, "Min 3 characters").max(50),
  password:  z.string().min(6, "Min 6 characters"),
  confirm:   z.string(),
  phone:     z.string().regex(/^\d{10}$/, "Must be 10 digits").optional().or(z.literal("")),
  email:     z.string().email("Invalid email").optional().or(z.literal("")),
}).refine((d) => d.password === d.confirm, {
  message: "Passwords do not match",
  path: ["confirm"],
})

const doctorSchema = baseSchema.extend({
  consultationFee: z.coerce.number().positive("Must be a positive number").optional(),
  sectionId:       z.coerce.number().optional(),
})

type BaseForm   = z.infer<typeof baseSchema>
type DoctorForm = z.infer<typeof doctorSchema>
type AnyForm    = DoctorForm

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const [role, setRole] = useState<SignupRole | null>(null)
  const registerMutation = useRegister()

  const { data: sections = [] } = useQuery<MedicalSectionResponse[]>({
    queryKey: ["public", "sections"],
    queryFn: async () => {
      const res = await api.get<MedicalSectionResponse[]>("/medical-sections")
      return res.data
    },
    enabled: role === "DOCTOR",
    staleTime: 5 * 60 * 1000,
  })

  const schema = role === "DOCTOR" ? doctorSchema : baseSchema

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AnyForm>({ resolver: zodResolver(schema) })

  const handleRoleSelect = (r: SignupRole) => {
    setRole(r)
    reset()
  }

  const onSubmit = (data: AnyForm) => {
    registerMutation.mutate({
      fullName:        data.fullName,
      username:        data.username,
      password:        data.password,
      role,
      phone:           data.phone || undefined,
      email:           data.email || undefined,
      consultationFee: (data as DoctorForm).consultationFee || undefined,
      sectionId:       (data as DoctorForm).sectionId       || undefined,
    })
  }

  const RoleIcon = role ? ROLES.find((r) => r.value === role)!.icon : UserPlus

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 bg-primary-600" />

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🏥</div>
            <h1 className="text-xl font-bold text-neutral-900">Create Account</h1>
            <p className="text-sm text-neutral-500 mt-1">Hospital Management System</p>
          </div>

          {/* Role selector */}
          {!role ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-neutral-700 text-center mb-4">
                Select your role to get started
              </p>
              {ROLES.map((r) => {
                const Icon = r.icon
                return (
                  <button
                    key={r.value}
                    onClick={() => handleRoleSelect(r.value)}
                    className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-neutral-200 hover:border-primary-500 hover:bg-primary-50 transition-colors text-left group"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0 group-hover:bg-primary-200 transition-colors">
                      <Icon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-800">{r.label}</p>
                      <p className="text-xs text-neutral-500">{r.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Role badge + back */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <RoleIcon className="h-4 w-4 text-primary-600" />
                  <span className="text-sm font-semibold text-primary-700">
                    {ROLES.find((r) => r.value === role)!.label}
                  </span>
                </div>
                <button
                  onClick={() => setRole(null)}
                  className="text-xs text-neutral-400 hover:text-neutral-600 underline"
                >
                  Change role
                </button>
              </div>

              {registerMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {(registerMutation.error as any)?.response?.data?.message ??
                      "Username may already be taken. Try a different one."}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
                {/* Full Name */}
                <div className="space-y-1">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input id="fullName" {...register("fullName")} placeholder="Dr. John Smith" />
                  {errors.fullName && <p className="text-xs text-danger-500">{errors.fullName.message}</p>}
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <Label htmlFor="username">Username *</Label>
                  <Input id="username" {...register("username")} placeholder="john.smith" autoComplete="username" />
                  {errors.username && <p className="text-xs text-danger-500">{errors.username.message}</p>}
                </div>

                {/* Password row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="password">Password *</Label>
                    <Input id="password" type="password" {...register("password")} autoComplete="new-password" />
                    {errors.password && <p className="text-xs text-danger-500">{errors.password.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="confirm">Confirm *</Label>
                    <Input id="confirm" type="password" {...register("confirm")} autoComplete="new-password" />
                    {errors.confirm && <p className="text-xs text-danger-500">{errors.confirm.message}</p>}
                  </div>
                </div>

                {/* Phone + Email */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" {...register("phone")} placeholder="9876543210" />
                    {errors.phone && <p className="text-xs text-danger-500">{errors.phone.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register("email")} placeholder="you@hospital.in" />
                    {errors.email && <p className="text-xs text-danger-500">{errors.email.message}</p>}
                  </div>
                </div>

                {/* Doctor-only fields */}
                {role === "DOCTOR" && (
                  <>
                    <div className="border-t border-neutral-100 pt-3 space-y-3">
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                        Doctor Details
                      </p>

                      <div className="space-y-1">
                        <Label htmlFor="sectionId">Medical Section</Label>
                        <select
                          id="sectionId"
                          {...register("sectionId")}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">— Select section —</option>
                          {sections.map((s) => (
                            <option key={s.sectionId} value={s.sectionId}>
                              {s.sectionName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
                        <Input
                          id="consultationFee"
                          type="number"
                          min={0}
                          step={50}
                          {...register("consultationFee")}
                          placeholder="500"
                        />
                        {(errors as any).consultationFee && (
                          <p className="text-xs text-danger-500">{(errors as any).consultationFee.message}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  variant="accent"
                  className="w-full mt-2"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account…</>
                  ) : (
                    <><UserPlus className="mr-2 h-4 w-4" /> Create Account</>
                  )}
                </Button>
              </form>
            </div>
          )}

          <p className="text-center text-sm text-neutral-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-neutral-400 mt-6">
        HMS — Clinical Technology Platform
      </p>
    </div>
  )
}
