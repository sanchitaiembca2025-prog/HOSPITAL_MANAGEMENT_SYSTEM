import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string | Date): string {
  const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr
  return format(date, "dd MMM yyyy")
}

export function formatDateTime(dateStr: string | Date): string {
  const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr
  return format(date, "dd MMM yyyy, h:mm a")
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}
