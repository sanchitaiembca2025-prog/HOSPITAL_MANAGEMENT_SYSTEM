import { VisitStatus } from "@/types"
import { cn } from "@/lib/utils"
import { CheckCircle2, Circle, XCircle } from "lucide-react"

const STEPS = [
  { status: VisitStatus.ADMITTED, label: "Admitted" },
  { status: VisitStatus.TREATMENT_IN_PROGRESS, label: "In Treatment" },
  { status: VisitStatus.DISCHARGED, label: "Discharged" },
]


interface VisitStatusStepperProps {
  currentStatus: VisitStatus
  className?: string
}

export function VisitStatusStepper({ currentStatus, className }: VisitStatusStepperProps) {
  const isDeceased = currentStatus === VisitStatus.DECEASED

  const getStepState = (status: VisitStatus) => {
    const order = [
      VisitStatus.ADMITTED,
      VisitStatus.TREATMENT_IN_PROGRESS,
      VisitStatus.DISCHARGED,
    ]
    const currentIndex = order.indexOf(currentStatus)
    const stepIndex = order.indexOf(status)

    if (isDeceased) {
      if (status === VisitStatus.ADMITTED || status === VisitStatus.TREATMENT_IN_PROGRESS)
        return "completed"
      return "current"
    }

    if (stepIndex < currentIndex) return "completed"
    if (stepIndex === currentIndex) return "current"
    return "pending"
  }

  return (
    <div className={cn("flex items-center gap-0", className)}>
      {STEPS.map((step, i) => {
        const state = getStepState(step.status)

        return (
          <div key={step.status} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-full border-2 transition-colors",
                  state === "completed"
                    ? "bg-success-700 border-success-700 text-white"
                    : state === "current" && isDeceased && step.status === VisitStatus.DISCHARGED
                    ? "bg-danger-500 border-danger-500 text-white"
                    : state === "current"
                    ? "bg-primary-600 border-primary-600 text-white"
                    : "bg-white border-neutral-300 text-neutral-400"
                )}
              >
                {state === "completed" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : isDeceased && step.status === VisitStatus.DISCHARGED ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs mt-1 font-medium whitespace-nowrap",
                  state === "completed"
                    ? "text-success-700"
                    : state === "current" && isDeceased && step.status === VisitStatus.DISCHARGED
                    ? "text-danger-500"
                    : state === "current"
                    ? "text-primary-600"
                    : "text-neutral-400"
                )}
              >
                {step.label}
                {isDeceased && step.status === VisitStatus.DISCHARGED ? " (Deceased)" : ""}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-16 mx-1 mb-4 transition-colors",
                  getStepState(STEPS[i + 1].status) === "completed" ||
                  getStepState(STEPS[i + 1].status) === "current"
                    ? "bg-success-700"
                    : "bg-neutral-200"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
