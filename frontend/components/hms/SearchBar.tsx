"use client"

import { useRef, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  placeholder?: string
  onSearch: (value: string) => void
  defaultValue?: string
  className?: string
  autoFocus?: boolean
}

export function SearchBar({
  placeholder = "Search...",
  onSearch,
  defaultValue = "",
  className,
  autoFocus = false,
}: SearchBarProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onSearch(val), 300)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
      <Input
        className="pl-9"
        placeholder={placeholder}
        defaultValue={defaultValue}
        onChange={handleChange}
        autoFocus={autoFocus}
      />
    </div>
  )
}
