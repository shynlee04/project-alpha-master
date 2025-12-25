/**
 * Button Component
 * 
 * EPIC_ID: Epic-23
 * STORY_ID: 23-1
 * CREATED_AT: 2025-12-25T16:27:00Z
 * 
 * Production-ready Button component following 8-bit design system.
 * Implements all variants, sizes, states with accessibility and i18n support.
 */

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { Loader2 } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
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
 * Uses design tokens from 8-bit design system
 */
const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary-500/50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-neutral-950 hover:bg-primary-600 active:bg-primary-700 hover:scale-105 hover:transition-[150ms] active:scale-95 active:transition-[100ms]',
        secondary: 'bg-neutral-800 text-neutral-100 border border-neutral-700 hover:bg-neutral-700 active:bg-neutral-900 hover:scale-105 hover:transition-[150ms] active:scale-95 active:transition-[100ms]',
        ghost: 'text-neutral-100 hover:bg-neutral-800 active:bg-neutral-900 hover:scale-105 hover:transition-[150ms] active:scale-95 active:transition-[100ms]',
        outline: 'border-2 border-primary-500 text-primary-500 bg-transparent hover:bg-primary-500/10 active:bg-primary-500/20 hover:scale-105 hover:transition-[150ms] active:scale-95 active:transition-[100ms]',
        destructive: 'bg-error-500 text-white hover:bg-error-600 active:bg-error-700 hover:scale-105 hover:transition-[150ms] active:scale-95 active:transition-[100ms]',
      },
      size: {
        sm: 'h-8 px-3 text-sm min-h-[32px]',
        md: 'h-10 px-4 text-base min-h-[40px]',
        lg: 'h-12 px-6 text-lg min-h-[48px]',
        xl: 'h-14 px-8 text-xl min-h-[56px]',
      },
      iconOnly: {
        true: 'w-12 h-12 min-w-[48px] min-h-[48px]',
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

    // Get translation key for button text
    const buttonText = typeof children === 'string' 
      ? t(`button.${variant}`, { defaultValue: children as string })
      : children

    // Loading spinner animation
    const Spinner = loading ? (
      <Loader2 
        className="animate-spin" 
        size={size === 'sm' ? 16 : size === 'md' ? 20 : size === 'lg' ? 24 : 28}
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
        {buttonText}
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

    // Render as child element or button
    const Comp = asChild ? Slot : 'button'

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
