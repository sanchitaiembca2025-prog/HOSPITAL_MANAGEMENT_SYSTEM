import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest, NextResponse } from "next/server"
import { middleware } from "@/middleware"

// Helper: build a minimal NextRequest-like object
function makeRequest(pathname: string, tokenCookieValue?: string): NextRequest {
  const url = `http://localhost${pathname}`
  const req = new NextRequest(url)
  if (tokenCookieValue !== undefined) {
    // NextRequest is immutable; we spy on cookies.get instead
    vi.spyOn(req.cookies, "get").mockImplementation((name: string) => {
      if (name === "hms_token") {
        return { name: "hms_token", value: tokenCookieValue } as ReturnType<typeof req.cookies.get>
      }
      return undefined
    })
  }
  return req
}

describe("middleware", () => {
  it("allows public path / without token", () => {
    const res = middleware(makeRequest("/"))
    expect(res).toBeInstanceOf(NextResponse)
    // Should not redirect
    expect(res.headers.get("location")).toBeNull()
  })

  it("allows /login without token", () => {
    const res = middleware(makeRequest("/login"))
    expect(res.headers.get("location")).toBeNull()
  })

  it("allows /signup without token", () => {
    const res = middleware(makeRequest("/signup"))
    expect(res.headers.get("location")).toBeNull()
  })

  it("redirects /admin to /login when no token cookie", () => {
    const req = new NextRequest("http://localhost/admin")
    // No cookie mock — cookies.get returns undefined
    const res = middleware(req)
    const location = res.headers.get("location")
    expect(location).toContain("/login")
    expect(location).toContain("unauthenticated")
  })

  it("redirects /clerk/patients to /login when no token", () => {
    const req = new NextRequest("http://localhost/clerk/patients")
    const res = middleware(req)
    expect(res.headers.get("location")).toContain("/login")
  })

  it("allows /admin when valid token cookie is present", () => {
    const res = middleware(makeRequest("/admin", "valid-jwt-token"))
    expect(res.headers.get("location")).toBeNull()
  })

  it("allows /doctor/profile when valid token cookie is present", () => {
    const res = middleware(makeRequest("/doctor/profile", "some-token"))
    expect(res.headers.get("location")).toBeNull()
  })

  it("allows /signup sub-paths as public", () => {
    const res = middleware(makeRequest("/signup/step2"))
    expect(res.headers.get("location")).toBeNull()
  })

  it("redirect url includes reason=unauthenticated query param", () => {
    const req = new NextRequest("http://localhost/lab/patients")
    const res = middleware(req)
    const location = res.headers.get("location") ?? ""
    expect(new URL(location).searchParams.get("reason")).toBe("unauthenticated")
  })
})
