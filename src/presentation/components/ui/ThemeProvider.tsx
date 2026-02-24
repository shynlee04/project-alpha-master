"use client"

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps & { defaultTheme?: ThemeProviderProps["defaultTheme"] }) {
  return (
    <NextThemesProvider
      attribute="class"
      enableSystem
      defaultTheme={props.defaultTheme ?? "system"}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}