/**
 * Input Component
 *
 * EPIC_ID: Epic-23
 * STORY_ID: P1.2
 * CREATED_AT: 2025-12-25T20:55:00Z
 *
 * Production-ready Input component following 8-bit design system.
 * Implements all variants, sizes, states with accessibility and i18n support.
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
 * Uses design tokens from 8-bit design system
 */
const inputVariants = cva(
  // Base styles with 8-bit aesthetic
  "flex h-10 w-full items-center gap-2 rounded-none border-2 bg-neutral-950 text-neutral-100 px-3 py-2 text-sm transition-all outline-none placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium",
  {
    variants: {
      size: {
        sm: "h-8 px-2.5 text-xs min-h-[32px]",
        md: "h-10 px-3 text-sm min-h-[40px]",
        lg: "h-12 px-4 text-base min-h-[48px]",
      },
      state: {
        default: "border-neutral-700 focus-visible:border-primary-500 focus-visible:ring-primary-500/50 hover:border-neutral-600",
        error: "border-error-500 focus-visible:border-error-500 focus-visible:ring-error-500/50 hover:border-error-600",
        success: "border-success-500 focus-visible:border-success-500 focus-visible:ring-success-500/50 hover:border-success-600",
        disabled: "border-neutral-800 bg-neutral-900 text-neutral-600 cursor-not-allowed",
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
          <div className="absolute left-3 z-10 flex items-center justify-center text-neutral-500 pointer-events-none">
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
          <div className="absolute right-3 z-10 flex items-center justify-center text-neutral-500 pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
