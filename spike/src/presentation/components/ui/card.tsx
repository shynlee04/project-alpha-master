/**
 * Card Component
 *
 * EPIC_ID: Epic-23
 * STORY_ID: 23-1
 * STORY: LT-3.15 (Light Theme Migration)
 * CREATED_AT: 2025-12-25T18:13:00Z
 * UPDATED_AT: 2026-01-04T06:35:00Z
 *
 * Production-ready Card component following 8-bit design system.
 * Implements size variants, state variants with accessibility, i18n, and light/dark theme support.
 * Uses CSS custom properties for theme-aware styling.
 */

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

/**
 * Card component props interface
 */
export interface CardProps extends React.ComponentProps<"div"> {
  /** Size variant of card */
  size?: "sm" | "md" | "lg"
  /** State variant of card */
  variant?: "default" | "error" | "success" | "warning"
}

/**
 * CVA variants for Card component
 * Uses CSS custom properties for light/dark theme support
 */
const cardVariants = cva(
  // Base styles with 8-bit aesthetic - UX-02: strict rounded-none, border-2
  "flex flex-col gap-6 rounded-none border-2 outline-none transition-[border-color,background-color,shadow] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
  {
    variants: {
      size: {
        sm: "py-4 px-4",
        md: "py-6 px-6",
        lg: "py-8 px-8",
      },
      variant: {
        // Default variant: neutral background with subtle border
        default: "bg-[var(--card)] text-[var(--card-foreground)] border-[var(--border)] focus-visible:ring-[var(--primary)] shadow-[0_2px_8px_rgba(0,0,0,0.08)]",
        // Error variant: red tint for error states
        error: "bg-[var(--destructive-50)] text-[var(--destructive)] border-[var(--destructive-200)] focus-visible:ring-[var(--destructive)] shadow-[0_2px_8px_rgba(239,68,68,0.1)]",
        // Success variant: green tint for success states
        success: "bg-[var(--success-50)] text-[var(--success)] border-[var(--success-200)] focus-visible:ring-[var(--success)] shadow-[0_2px_8px_rgba(34,197,94,0.1)]",
        // Warning variant: yellow tint for warning states
        warning: "bg-[var(--warning-50)] text-[var(--warning)] border-[var(--warning-200)] focus-visible:ring-[var(--warning)] shadow-[0_2px_8px_rgba(245,158,11,0.1)]",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
)

/**
 * Card Component
 *
 * Production-ready card component following 8-bit design system.
 * Supports size variants (sm, md, lg) and state variants (default, error, success, warning).
 * Fully theme-aware with CSS custom properties for light/dark mode support.
 *
 * @example
 * ```tsx
 * <Card size="md" variant="default">Default Card</Card>
 * <Card size="lg" variant="error">Error Card</Card>
 * <Card size="sm" variant="success">Success Card</Card>
 * ```
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, size = "md", variant = "default", children, role = "region", ...props }, ref
  ) => {
    const { t } = useTranslation()

    return (
      <div
        ref={ref}
        data-slot="card"
        role={role}
        aria-label={t(`card.variant.${variant}`, { defaultValue: variant })}
        className={cn(cardVariants({ size, variant }), className)}
        {...props}
      >
        {children}
      </div>
    )
  })
Card.displayName = "Card"

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold text-[var(--foreground)]", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-[var(--muted-foreground)]", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 text-[var(--foreground)]", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:border-[var(--border)] [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
