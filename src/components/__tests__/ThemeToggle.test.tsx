// @vitest-environment jsdom

import "@testing-library/jest-dom"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"

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
      addListener: () => { },
      removeListener: () => { },
      addEventListener: () => { },
      removeEventListener: () => { },
      dispatchEvent: () => false,
    })
  }
})

describe("ThemeToggle", () => {
  it("cycles through themes (light -> dark -> system)", async () => {
    // Enable system to allow system state
    render(
      <ThemeProvider defaultTheme="light" enableSystem={true}>
        <ThemeToggle />
      </ThemeProvider>,
    )

    const button = await waitFor(() => screen.getByTestId("theme-toggle"))
    // Initial state: light
    expect(button).toHaveAttribute("title", "Current theme: light")

    // Click 1: light -> dark
    fireEvent.click(button)
    expect(button).toHaveAttribute("title", "Current theme: dark")

    // Click 2: dark -> system
    fireEvent.click(button)
    expect(button).toHaveAttribute("title", "Current theme: system")

    // Click 3: system -> light
    fireEvent.click(button)
    expect(button).toHaveAttribute("title", "Current theme: light")
  })
})
