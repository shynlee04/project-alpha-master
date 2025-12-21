import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * VIA-GENT Brand Logo Component
 * 
 * A reusable logo component with the 8-bit pixel aesthetic.
 * Features:
 * - Pixel "V" square with orange background
 * - VIA-GENT text with orange hyphen
 * - Size variants (sm, md, lg)
 * - Pixel shadow effect
 */

const logoVariants = cva(
    'flex items-center',
    {
        variants: {
            size: {
                sm: 'gap-1.5',
                md: 'gap-2.5',
                lg: 'gap-3',
            },
        },
        defaultVariants: {
            size: 'md',
        },
    }
)

const iconVariants = cva(
    'flex items-center justify-center text-white font-pixel shadow-[2px_2px_0px_0px_rgba(194,65,12,1)]',
    {
        variants: {
            size: {
                sm: 'w-6 h-6 text-lg',
                md: 'w-8 h-8 text-2xl',
                lg: 'w-10 h-10 text-3xl',
            },
        },
        defaultVariants: {
            size: 'md',
        },
    }
)

const textVariants = cva(
    'font-pixel text-foreground tracking-tight',
    {
        variants: {
            size: {
                sm: 'text-lg',
                md: 'text-2xl',
                lg: 'text-3xl',
            },
        },
        defaultVariants: {
            size: 'md',
        },
    }
)

interface BrandLogoProps extends VariantProps<typeof logoVariants> {
    className?: string
    showIcon?: boolean
    showText?: boolean
}

export function BrandLogo({
    size = 'md',
    className,
    showIcon = true,
    showText = true,
}: BrandLogoProps) {
    return (
        <div className={cn(logoVariants({ size }), className)}>
            {showIcon && (
                <div className={cn(iconVariants({ size }), 'bg-primary')}>
                    <span>V</span>
                </div>
            )}
            {showText && (
                <span className={textVariants({ size })}>
                    VIA<span className="text-primary">-</span>GENT
                </span>
            )}
        </div>
    )
}
