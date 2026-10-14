"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useLogin } from "@/hooks/use-auth"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Role } from "@/types"

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

type LoginForm = z.infer<typeof loginSchema>

const ROLE_HOME: Record<Role, string> = {
  [Role.ADMIN]: "/admin",
  [Role.CLERK]: "/clerk",
  [Role.DOCTOR]: "/doctor",
  [Role.LAB]: "/lab",
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token, role } = useAuthStore()
  const loginMutation = useLogin()

  const reason = searchParams.get("reason")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (token && role) {
      router.replace(ROLE_HOME[role])
    }
  }, [token, role, router])

  useEffect(() => {
    if (reason === "session_expired") {
      toast.error("Your session has expired. Please log in again.")
    }
  }, [reason])

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data)
  }

  return (
    <div className="w-full max-w-sm">
      {/* Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 bg-primary-600" />

        <div className="p-8">
          {/* Logo / Title */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🏥</div>
            <h1 className="text-xl font-bold text-neutral-900">
              Hospital Management
            </h1>
            <p className="text-sm text-neutral-600 mt-1">System</p>
          </div>

          {/* Error from mutation */}
          {loginMutation.isError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Invalid username or password. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                autoFocus
                {...register("username")}
                aria-describedby={errors.username ? "username-error" : undefined}
                aria-invalid={!!errors.username}
              />
              {errors.username && (
                <p id="username-error" className="text-xs text-danger-500">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                aria-describedby={errors.password ? "password-error" : undefined}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p id="password-error" className="text-xs text-danger-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="accent"
              className="w-full mt-2"
              disabled={loginMutation.isPending}
              aria-busy={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-5">
            New staff member?{" "}
            <Link href="/signup" className="text-primary-600 hover:underline font-medium">
              Create an account
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="h-1.5 bg-primary-600" />
            <div className="p-8 flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
