import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * StatusDot Component
 * 
 * Pulsing status indicator dot for showing online/offline/busy states.
 * Features:
 * - Pulse animation for active states
 * - Multiple status colors
 * - Size variants
 */

const dotVariants = cva(
    'rounded-full',
    {
        variants: {
            status: {
                online: 'bg-green-500',
                offline: 'bg-zinc-500',
                busy: 'bg-amber-500',
                error: 'bg-red-500',
                active: 'bg-primary',
            },
            size: {
                sm: 'w-2 h-2',
                md: 'w-2.5 h-2.5',
                lg: 'w-3 h-3',
            },
            pulse: {
                true: 'animate-pulse',
                false: '',
            },
        },
        defaultVariants: {
            status: 'online',
            size: 'md',
            pulse: false,
        },
    }
)

interface StatusDotProps
    extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof dotVariants> { }

export function StatusDot({
    className,
    status,
    size,
    pulse,
    ...props
}: StatusDotProps) {
    // Auto-enable pulse for online and active states
    const shouldPulse = pulse ?? (status === 'online' || status === 'active')

    return (
        <span
            className={cn(dotVariants({ status, size, pulse: shouldPulse }), className)}
            {...props}
        />
    )
}
