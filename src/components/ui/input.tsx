import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// EPIC_ID: 23
// STORY_ID: 23-1
// CREATED_AT: 2025-12-25T16:38:00Z

// ============================================================================
// CVA Variants
// ============================================================================

const sizeVariants = cva('', {
  variants: {
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-5 text-lg',
    },
  },
})

const variantStyles = cva('', {
  variants: {
    variant: {
      default: 'border-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50',
      error: 'border-error-500 focus:border-error-500 focus:ring-2 focus:ring-error-500/50',
      success: 'border-success-500 focus:border-success-500 focus:ring-2 focus:ring-success-500/50',
    },
    disabled: {
      true: 'border-neutral-800 bg-neutral-900 cursor-not-allowed opacity-50',
      false: '',
    },
  },
})

const baseStyles = cva(
  'w-full flex items-center border transition-all duration-150 ease-in-out outline-none',
  {
    variants: {
      theme: {
        dark: 'bg-neutral-950 text-neutral-100 placeholder:text-neutral-500',
        light: 'bg-white text-neutral-900 placeholder:text-neutral-400',
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        base: 'rounded-base',
        md: 'rounded-md',
      },
    },
    defaultVariants: {
      theme: 'dark',
      radius: 'base',
    },
  }
)

// ============================================================================
// TypeScript Interface
// ============================================================================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input variant for visual state */
  variant?: 'default' | 'error' | 'success'
  
  /** Input size for responsive scaling */
  size?: 'sm' | 'md' | 'lg'
  
  /** Full width container */
  fullWidth?: boolean
  
  /** Icon on left side of input */
  leftIcon?: React.ReactNode
  
  /** Icon on right side of input */
  rightIcon?: React.ReactNode
  
  /** Error message (triggers error variant) */
  error?: string
  
  /** Helper text below input */
  helperText?: string
  
  /** Label above input */
  label?: string
  
  /** Required field indicator */
  required?: boolean
  
  /** asChild for composition */
  asChild?: boolean
}

// ============================================================================
// Input Component
// ============================================================================

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    variant = 'default',
    size = 'md',
    fullWidth = true,
    leftIcon,
    rightIcon,
    error,
    helperText,
    label,
    required,
    asChild = false,
    className,
    ...props 
  }, ref) => {
    const inputId = React.useId()
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`
    const hasError = !!error || variant === 'error'

    const Component = asChild ? Slot : 'input'

    return (
      <div className={cn('flex flex-col gap-1', fullWidth && 'w-full')}>
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium text-neutral-300"
          >
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-neutral-500 pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <Component
            ref={ref}
            id={inputId}
            className={cn(
              baseStyles({ theme: 'dark', radius: 'base' }),
              sizeVariants({ size }),
              variantStyles({ variant, disabled: props.disabled }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            aria-invalid={hasError}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            aria-required={required}
            {...(asChild ? {} : props)}
          />
          
          {rightIcon && (
            <div className="absolute right-3 text-neutral-500 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p 
            id={errorId} 
            className="text-xs text-error-500" 
            role="alert" 
            aria-live="polite"
          >
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={helperId} className="text-xs text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input, type InputProps }
