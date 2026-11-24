import { describe, it, expect } from "vitest"
import { queryClient } from "@/lib/query-client"

describe("queryClient", () => {
  it("exports a QueryClient instance", () => {
    expect(queryClient).toBeDefined()
    expect(typeof queryClient.getDefaultOptions).toBe("function")
  })

  it("has staleTime of 30 seconds", () => {
    expect(queryClient.getDefaultOptions().queries?.staleTime).toBe(30 * 1000)
  })

  it("has retry set to 1", () => {
    expect(queryClient.getDefaultOptions().queries?.retry).toBe(1)
  })

  it("has refetchOnWindowFocus disabled", () => {
    expect(queryClient.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false)
  })
})
