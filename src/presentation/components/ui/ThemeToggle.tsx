"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "./button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Cycle: light -> dark -> system -> light
  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const Icon = () => {
    if (theme === 'light') return <Sun className="h-[1.2rem] w-[1.2rem]" />
    if (theme === 'dark') return <Moon className="h-[1.2rem] w-[1.2rem]" />
    return <Monitor className="h-[1.2rem] w-[1.2rem]" />
  }

  return (
    <Button
      variant="ghost"
      iconOnly={true}
      onClick={cycleTheme}
      className="text-muted-foreground hover:text-foreground transition-colors"
      title={`Current theme: ${theme}`}
      aria-label="Toggle theme"
      data-testid="theme-toggle"
    >
      <Icon />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}