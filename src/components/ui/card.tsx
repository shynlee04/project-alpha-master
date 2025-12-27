/**
 * Card Component
 *
 * EPIC_ID: Epic-23
 * STORY_ID: 23-1
 * CREATED_AT: 2025-12-25T18:13:00Z
 *
 * Production-ready Card component following 8-bit design system.
 * Implements size variants, state variants with accessibility and i18n support.
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
 * Uses design tokens from 8-bit design system
 */
const cardVariants = cva(
  // Base styles with 8-bit focus indicators
  "flex flex-col gap-6 rounded-none border outline-none focus-visible:ring-2 transition-all",
  {
    variants: {
      size: {
        sm: "py-4 px-4",
        md: "py-6 px-6",
        lg: "py-8 px-8",
      },
      variant: {
        default: "bg-neutral-900 text-neutral-100 border-neutral-700 focus-visible:ring-primary-500/50 shadow-base",
        error: "bg-error-500/10 text-error-500 border-error-500 focus-visible:ring-error-500/50 shadow-error",
        success: "bg-success-500/10 text-success-500 border-success-500 focus-visible:ring-success-500/50 shadow-success",
        warning: "bg-warning-500/10 text-warning-500 border-warning-500 focus-visible:ring-warning-500/50 shadow-warning",
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
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
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
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
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
