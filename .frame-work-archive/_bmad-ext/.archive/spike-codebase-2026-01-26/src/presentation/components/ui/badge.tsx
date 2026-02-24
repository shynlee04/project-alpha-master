/**
 * Badge Component
 *
 * Simple badge component for status indicators and labels.
 * Follows the 8-bit design system with rounded-[4px] styling.
 * Uses CSS custom properties for light/dark theme support.
 *
 * @component ui/badge
 * @story LT-3.14 (Light Theme Migration)
 */

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * CVA variants for Badge component
 * Uses CSS custom properties for light/dark theme support
 */
const badgeVariants = cva(
    // Base styles with 8-bit aesthetic and theme-aware colors
    'inline-flex items-center justify-center rounded-[4px] border px-2.5 py-0.5 text-xs font-semibold transition-[background-color,color] duration-150 ease-out outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
    {
        variants: {
            variant: {
                // Primary variant: solid primary color background
                default:
                    'border-transparent bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-[var(--primary-600)]',
                // Secondary variant: subtle background
                secondary:
                    'border-transparent bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--neutral-200)]',
                // Destructive variant: red background for error states
                destructive:
                    'border-transparent bg-[var(--destructive)] text-[var(--destructive-foreground)] shadow-[0_2px_4px_rgba(239,68,68,0.2)] hover:bg-[var(--destructive-600)]',
                // Outline variant: transparent with colored text
                outline: 'border-[var(--border)] text-[var(--foreground)]',
                // Success variant: green background for success states
                success:
                    'border-transparent bg-[var(--success)] text-white hover:bg-[var(--success-600)]',
                // Warning variant: yellow/orange background for warnings
                warning:
                    'border-transparent bg-[var(--warning)] text-black hover:bg-[var(--warning-600)]',
                // Info variant: blue background for informational badges
                info:
                    'border-transparent bg-[var(--info)] text-white hover:bg-[var(--info-600)]',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

/**
 * Badge Component
 *
 * A simple badge component for status indicators and labels.
 * Supports multiple variants: default, secondary, destructive, outline, success, warning, info.
 * Fully theme-aware with CSS custom properties for light/dark mode support.
 *
 * @example
 * ```tsx
 * <Badge variant="default">Default</Badge>
 * <Badge variant="success">Success</Badge>
 * <Badge variant="warning">Warning</Badge>
 * <Badge variant="destructive">Error</Badge>
 * <Badge variant="info">Info</Badge>
 * ```
 */
function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
