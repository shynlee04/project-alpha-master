/**
 * Button Component
 * 
 * EPIC_ID: Epic-23
 * STORY_ID: 23-1
 * STORY: LT-2.8 (Light Theme Migration), UXUI-01-05 (8-bit Effects)
 * CREATED_AT: 2025-12-25T16:27:00Z
 * UPDATED_AT: 2026-01-28T00:00:00Z
 * 
 * Production-ready Button component following 8-bit design system.
 * Implements all variants, sizes, states with accessibility, i18n, and light/dark theme support.
 * Uses CSS custom properties for theme-aware styling.
 * 
 * UXUI-01-05 Updates:
 * - Step-based timing (removed ease-out)
 * - 8-bit pixel shadows (2px/4px offsets)
 * - Hover lift effect (translateY -2px)
 * - Active state removes shadow
 * - Solid focus outline (no ring blur)
 * - 44px minimum touch targets
 */

import * as React from 'react'
// TEMPORARY: Slot import disabled due to React 19 compatibility issue
// import { Slot } from '@radix-ui/react-slot'
import { Loader2 } from 'lucide-react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

/**
 * Button component props interface
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive'
  /** Size variant of the button */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Icon-only mode (no text content) */
  iconOnly?: boolean
  /** Loading state with spinner */
  loading?: boolean
  /** Icon to display on the left side */
  leftIcon?: React.ReactNode
  /** Icon to display on the right side */
  rightIcon?: React.ReactNode
  /** Render as child element (for Link, etc.) */
  asChild?: boolean
}

/**
 * CVA variants for Button component
 * Uses CSS custom properties for light/dark theme support
 * Migrated to follow December 2025 Zustand patterns and light theme design tokens
 */
const buttonVariants = cva(
  // Base styles with 8-bit aesthetic - UX-02: strict rounded-none
  // Updated: UXUI-01-05 - 8-bit effects (step-based timing, pixel shadows, solid focus outline)
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none font-medium transition-[background-color,transform,box-shadow] duration-100 outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[hsl(var(--primary))] focus-visible:outline-offset-2 hover:translate-y-[-2px] active:translate-y-0',
  {
    variants: {
      variant: {
        // Primary variant: solid primary color background
        // UXUI-01-05: 8-bit pixel shadow on default, enhanced on hover, none on active
        primary: `
          bg-[var(--primary)] text-[var(--primary-foreground)]
          hover:bg-[var(--primary-600)]
          active:bg-[var(--primary-700)]
          shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]
          hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]
          active:shadow-none
        `,
        // Secondary variant: subtle background with border
        // UXUI-01-05: 8-bit pixel shadow on hover, none on active
        secondary: `
          bg-[var(--secondary)] text-[var(--secondary-foreground)]
          border border-[var(--border)]
          hover:bg-[var(--neutral-200)]
          active:bg-[var(--neutral-300)]
          hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]
          active:shadow-none
        `,
        // Ghost variant: transparent background, text color
        // UXUI-01-05: No shadows for ghost - keep minimal
        ghost: `
          text-[var(--foreground)]
          hover:bg-[var(--neutral-100)]
          active:bg-[var(--neutral-200)]
        `,
        // Outline variant: transparent background, colored border
        // UXUI-01-05: 8-bit pixel shadow on hover, none on active
        outline: `
          border border-[var(--primary)]
          text-[var(--primary)]
          bg-transparent
          hover:bg-[var(--primary-50)]
          active:bg-[var(--primary-100)]
          hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]
          active:shadow-none
        `,
        // Destructive variant: red background for delete/danger actions
        // UXUI-01-05: 8-bit pixel shadow on default, enhanced on hover, none on active
        destructive: `
          bg-[var(--destructive)] text-white
          hover:bg-[var(--destructive-600)]
          active:bg-[var(--destructive-700)]
          shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]
          hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]
          active:shadow-none
        `,
      },
      size: {
        // UXUI-01-05: Updated for 44px minimum touch targets (WCAG compliance)
        sm: 'h-11 px-3 text-sm min-h-[44px]',
        md: 'h-11 px-4 text-base min-h-[44px]',
        lg: 'h-12 px-6 text-lg min-h-[48px]',
        xl: 'h-14 px-8 text-xl min-h-[56px]',
      },
      iconOnly: {
        // UXUI-01-05: 44px minimum for touch targets (WCAG compliance)
        true: 'w-11 h-11 min-w-[44px] min-h-[44px]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      iconOnly: false,
    },
  }
)

/**
 * Button Component
 * 
 * A production-ready button component following 8-bit design system.
 * Supports multiple variants, sizes, loading states, and icon positions.
 * Fully theme-aware with CSS custom properties for light/dark mode support.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md">Click me</Button>
 * <Button variant="secondary" size="lg" leftIcon={<Icon />}>With Icon</Button>
 * <Button loading>Loading...</Button>
 * <Button iconOnly aria-label="Close"><X /></Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      iconOnly = false,
      loading = false,
      leftIcon,
      rightIcon,
      asChild = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation()

    // Loading spinner animation
    const Spinner = loading ? (
      <Loader2
        className="animate-spin"
        size={size === 'sm' ? 'var(--icon-size-sm)' : size === 'md' ? 'var(--icon-size-md)' : size === 'lg' ? 'var(--icon-size-lg)' : 'var(--icon-size-xl)'}
        style={{ color: 'var(--foreground)' }}
        aria-hidden="true"
      />
    ) : null

    // Determine if button should be disabled (loading or explicitly disabled)
    const isDisabled = disabled || loading

    // Render content based on loading state
    const buttonContent = loading ? (
      <span className="flex items-center gap-2">
        {Spinner}
        <span>{t('button.loading', { defaultValue: 'Loading...' })}</span>
      </span>
    ) : (
      <span className="flex items-center gap-2">
        {leftIcon}
        {children}
        {rightIcon}
      </span>
    )

    // ARIA attributes for icon-only buttons
    const ariaProps = iconOnly && !loading
      ? {
        'aria-label': typeof children === 'string' ? children : 'Button',
        role: 'button',
      }
      : {}

    // TEMPORARY FIX: Disable asChild due to React 19 + Radix UI compatibility issue
    // This prevents infinite loops in setRef function
    // TODO: Re-enable once Radix UI releases React 19 compatible version
    const Comp = 'button' // asChild ? Slot : 'button'

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, iconOnly }), className)}
        ref={ref}
        disabled={isDisabled}
        {...ariaProps}
        {...props}
      >
        {buttonContent}
      </Comp>
    )
  }
)

Button.displayName = 'Button'
