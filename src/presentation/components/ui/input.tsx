/**
 * Input Component
 *
 * EPIC_ID: Epic-23
 * STORY_ID: P1.2
 * STORY: LT-2.9 (Light Theme Migration)
 * CREATED_AT: 2025-12-25T20:55:00Z
 * UPDATED_AT: 2026-01-04T00:00:00Z
 *
 * Production-ready Input component following 8-bit design system.
 * Implements all variants, sizes, states with accessibility and light/dark theme support.
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Input component props interface
 */
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
  VariantProps<typeof inputVariants> {
  /** Left icon to display */
  leftIcon?: React.ReactNode
  /** Right icon to display */
  rightIcon?: React.ReactNode
}

/**
 * CVA variants for Input component
 * Uses CSS custom properties for light/dark theme support
 * Migrated to follow December 2025 Zustand patterns
 */
const inputVariants = cva(
  // Base styles with 8-bit aesthetic and theme-aware colors - UX-02: strict rounded-none
  "flex h-10 w-full items-center gap-2 rounded-none border-2 bg-[var(--background)] text-[var(--foreground)] px-3 py-2 text-sm font-mono transition-[border-color] duration-150 outline-none placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:border-[hsl(var(--primary))] focus-visible:shadow-[var(--shadow-pixel)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium",
  {
    variants: {
      size: {
        sm: "h-8 px-2.5 text-xs min-h-[32px]",
        md: "h-10 px-3 text-sm min-h-[40px]",
        lg: "h-12 px-4 text-base min-h-[48px]",
      },
      state: {
        default: "border-[var(--input)] hover:border-[var(--border)] focus-visible:border-[hsl(var(--primary))]",
        error: "border-[var(--destructive)] hover:border-[var(--destructive)] focus-visible:border-[hsl(var(--destructive))] focus-visible:shadow-[2px_2px_0_0_hsl(var(--destructive))]",
        success: "border-[var(--success)] hover:border-[var(--success)] focus-visible:border-[hsl(var(--success))]",
        disabled: "border-[var(--neutral-200)] bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed",
      },
    },
    defaultVariants: {
      size: "md",
      state: "default",
    },
  }
)

/**
 * Input Component
 *
 * Production-ready input component following 8-bit design system.
 * Supports size variants (sm, md, lg) and state variants (default, error, success, disabled).
 * Fully theme-aware with CSS custom properties for light/dark mode support.
 *
 * @example
 * ```tsx
 * <Input size="md" state="default" placeholder="Enter text" />
 * <Input size="lg" state="error" placeholder="Error state" />
 * <Input size="sm" state="success" placeholder="Success state" />
 * <Input leftIcon={<SearchIcon />} placeholder="With icon" />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, state, leftIcon, rightIcon, type = "text", ...props }, ref) => {

    return (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3 z-10 flex items-center justify-center text-[var(--muted-foreground)] pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            inputVariants({ size, state }),
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            className
          )}
          ref={ref}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
        {rightIcon && (
          <div className="absolute right-3 z-10 flex items-center justify-center text-[var(--muted-foreground)] pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
