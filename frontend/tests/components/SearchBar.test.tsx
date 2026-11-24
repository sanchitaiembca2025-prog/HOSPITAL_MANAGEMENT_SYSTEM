import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SearchBar } from "@/components/hms/SearchBar"

describe("SearchBar", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("renders with default placeholder", () => {
    render(<SearchBar onSearch={vi.fn()} />)
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument()
  })

  it("renders with custom placeholder", () => {
    render(<SearchBar onSearch={vi.fn()} placeholder="Find patient..." />)
    expect(screen.getByPlaceholderText("Find patient...")).toBeInTheDocument()
  })

  it("debounces onSearch call by 300ms", async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)
    const input = screen.getByRole("textbox")

    fireEvent.change(input, { target: { value: "Alice" } })
    expect(onSearch).not.toHaveBeenCalled()

    vi.advanceTimersByTime(299)
    expect(onSearch).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(onSearch).toHaveBeenCalledWith("Alice")
  })

  it("only calls onSearch once for rapid typing (debounce resets)", () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)
    const input = screen.getByRole("textbox")

    fireEvent.change(input, { target: { value: "A" } })
    vi.advanceTimersByTime(100)
    fireEvent.change(input, { target: { value: "Al" } })
    vi.advanceTimersByTime(100)
    fireEvent.change(input, { target: { value: "Ali" } })
    vi.advanceTimersByTime(300)

    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onSearch).toHaveBeenCalledWith("Ali")
  })

  it("renders defaultValue in input", () => {
    render(<SearchBar onSearch={vi.fn()} defaultValue="John" />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input.defaultValue).toBe("John")
  })

  it("applies className to wrapper div", () => {
    const { container } = render(<SearchBar onSearch={vi.fn()} className="w-full" />)
    expect(container.firstChild).toHaveClass("w-full")
  })

  it("renders a search icon SVG inside the bar", () => {
    const { container } = render(<SearchBar onSearch={vi.fn()} />)
    expect(container.querySelector("svg")).toBeInTheDocument()
  })
})
