"use client"

/**
 * Switch Component
 *
 * EPIC_ID: Epic-23
 * STORY_ID: LT-2.12 (Light Theme Migration)
 * CREATED_AT: [Original Date]
 * UPDATED_AT: 2026-01-04T00:00:00Z
 *
 * Production-ready Switch component following 8-bit design system.
 * Implements toggle/switch functionality with light/dark theme support.
 * Uses CSS custom properties for theme-aware styling.
 */

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cva, type VariantProps } from "class-variance-authority"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"

const switchVariants = cva(
  // Base styles with theme-aware colors
  "peer inline-flex shrink-0 cursor-pointer items-center border-2 border-transparent transition-[background-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded-[4px]",
  {
    variants: {
      size: {
        sm: "h-5 w-9",
        md: "h-6 w-11",
        lg: "h-7 w-14",
      },
      state: {
        default: "data-[state=checked]:bg-[var(--primary)] data-[state=unchecked]:bg-[var(--muted)] focus-visible:ring-[var(--primary)]",
        error: "data-[state=checked]:bg-[var(--destructive)] data-[state=unchecked]:bg-[var(--muted)] focus-visible:ring-[var(--destructive)]",
        success: "data-[state=checked]:bg-[var(--success)] data-[state=unchecked]:bg-[var(--muted)] focus-visible:ring-[var(--success)]",
        warning: "data-[state=checked]:bg-[var(--warning)] data-[state=unchecked]:bg-[var(--muted)] focus-visible:ring-[var(--warning)]",
      },
    },
    defaultVariants: {
      size: "md",
      state: "default",
    },
  }
)

const switchThumbVariants = cva(
  "pointer-events-none block bg-white ring-0 transition-[transform] duration-200 ease-out rounded-[4px] data-[state=unchecked]:translate-x-0 shadow-sm",
  {
    variants: {
      size: {
        sm: "h-4 w-4 data-[state=checked]:translate-x-4",
        md: "h-5 w-5 data-[state=checked]:translate-x-5",
        lg: "h-6 w-6 data-[state=checked]:translate-x-7",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
  VariantProps<typeof switchVariants> { }

function Switch({ className, size, state, ...props }: SwitchProps) {
  const { t } = useTranslation()
  return (
    <SwitchPrimitive.Root
      className={cn(switchVariants({ size, state }), className)}
      aria-label={props["aria-label"] || t("common.toggle", "Toggle")}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(switchThumbVariants({ size }))}
      />
    </SwitchPrimitive.Root>
  )
}
Switch.displayName = SwitchPrimitive.Root.displayName

export { Switch }

