// @vitest-environment jsdom

import "@testing-library/jest-dom"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"

import { ThemeProvider } from "../ui/ThemeProvider"
import { ThemeToggle } from "../ui/ThemeToggle"

beforeEach(() => {
  // next-themes inspects matchMedia when enableSystem is true; we disable system below,
  // but mock defensively to avoid jsdom gaps.
  if (!window.matchMedia) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.matchMedia = () => ({
      matches: false,
      media: "",
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })
  }
})

describe("ThemeToggle", () => {
  it("renders after mount and toggles theme state", async () => {
    render(
      <ThemeProvider defaultTheme="light" enableSystem={false}>
        <ThemeToggle />
      </ThemeProvider>,
    )

    const button = await waitFor(() => screen.getByTestId("theme-toggle"))
    expect(button).toHaveAttribute("aria-pressed", "false")

    fireEvent.click(button)
    expect(button).toHaveAttribute("aria-pressed", "true")

    fireEvent.click(button)
    expect(button).toHaveAttribute("aria-pressed", "false")
  })
})
