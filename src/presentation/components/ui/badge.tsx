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
    // Base styles with 8-bit aesthetic (rounded-sm = 2px max, pixel shadow) and theme-aware colors
    'inline-flex items-center justify-center rounded-sm border-2 px-2.5 py-0.5 text-xs font-semibold transition-[background-color,color] duration-150 outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]',
    {
        variants: {
            variant: {
                // Primary variant: solid primary color background with 8-bit pixel shadow
                default:
                    'border-transparent bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-pixel-sm)] hover:bg-[hsl(var(--primary-600))]',
                // Secondary variant: subtle background
                secondary:
                    'border-transparent bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--neutral-200))]',
                // Destructive variant: red background for error states with pixel shadow
                destructive:
                    'border-transparent bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] shadow-[var(--shadow-pixel-sm)] hover:bg-[hsl(var(--destructive-600))]',
                // Outline variant: transparent with colored text and border
                outline: 'border-[hsl(var(--border))] text-[hsl(var(--foreground))]',
                // Success variant: green background for success states
                success:
                    'border-transparent bg-[hsl(var(--success))] text-white hover:bg-[hsl(var(--success-600))]',
                // Warning variant: yellow/orange background for warnings
                warning:
                    'border-transparent bg-[hsl(var(--warning))] text-black hover:bg-[hsl(var(--warning-600))]',
                // Info variant: blue background for informational badges
                info:
                    'border-transparent bg-[hsl(var(--info))] text-white hover:bg-[hsl(var(--info-600))]',
                // Pixel variant: 8-bit decorative style with VT323 font
                pixel:
                    'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] font-pixel shadow-[var(--shadow-pixel-sm)]',
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
