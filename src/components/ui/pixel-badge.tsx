import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * PixelBadge Component
 * 
 * 8-bit styled status badge with pixel shadow and squared corners.
 * Use for: status indicators, labels, tags
 */

const badgeVariants = cva(
    'inline-flex items-center justify-center font-pixel text-xs uppercase tracking-wider px-2 py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.5)]',
    {
        variants: {
            variant: {
                default: 'bg-secondary text-secondary-foreground',
                primary: 'bg-primary text-primary-foreground shadow-[1px_1px_0px_0px_rgba(194,65,12,1)]',
                success: 'bg-green-600 text-white shadow-[1px_1px_0px_0px_rgba(22,101,52,1)]',
                warning: 'bg-amber-500 text-black shadow-[1px_1px_0px_0px_rgba(180,83,9,1)]',
                error: 'bg-red-600 text-white shadow-[1px_1px_0px_0px_rgba(127,29,29,1)]',
                info: 'bg-blue-600 text-white shadow-[1px_1px_0px_0px_rgba(30,64,175,1)]',
                muted: 'bg-muted text-muted-foreground',
            },
            size: {
                sm: 'text-[10px] px-1.5 py-0.5',
                md: 'text-xs px-2 py-0.5',
                lg: 'text-sm px-3 py-1',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
)

interface PixelBadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
    children: React.ReactNode
}

export function PixelBadge({
    className,
    variant,
    size,
    children,
    ...props
}: PixelBadgeProps) {
    return (
        <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
            {children}
        </span>
    )
}
