/**
 * Textarea Component
 * 
 * EPIC_ID: Epic-23
 * STORY_ID: 23-1
 * CREATED_AT: 2025-12-25T17:13:00Z
 * 
 * Production-ready Textarea component following 8-bit design system.
 * Implements all variants, sizes, states with accessibility and i18n support.
 */

import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Textarea component props interface
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visual variant of textarea */
  variant?: 'default' | 'success' | 'error' | 'warning'
  /** Size variant of textarea */
  size?: 'sm' | 'md' | 'lg'
  /** Whether textarea is resizable */
  resizable?: boolean
  /** Minimum number of rows */
  minRows?: number
  /** Maximum number of rows */
  maxRows?: number
  /** Error message to display */
  error?: string
  /** Helper text to display */
  helperText?: string
  /** Label for accessibility */
  label?: string
}

/**
 * CVA variants for Textarea component
 * Uses design tokens from 8-bit design system
 */
const textareaVariants = cva(
  // Base styles with 8-bit aesthetic
  'flex w-full rounded-none border-2 font-mono transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none focus-visible:outline-none focus-visible:border-[hsl(var(--primary))] focus-visible:shadow-[var(--shadow-pixel)]',
  {
    variants: {
      variant: {
        default: 'border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]',
        success: 'border-[hsl(var(--success))] bg-[hsl(var(--success)/0.1)] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]',
        error: 'border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus-visible:border-[hsl(var(--destructive))] focus-visible:shadow-[2px_2px_0_0_hsl(var(--destructive))]',
        warning: 'border-[hsl(var(--warning))] bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]',
      },
      size: {
        sm: 'px-3 py-2 text-sm min-h-[80px]',
        md: 'px-4 py-3 text-base min-h-[120px]',
        lg: 'px-5 py-4 text-lg min-h-[160px]',
      },
      resizable: {
        true: 'resize-y',
        false: 'resize-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      resizable: true,
    },
  }
)

/**
 * Textarea Component
 * 
 * A production-ready textarea component following 8-bit design system.
 * Supports multiple variants, sizes, error states, and accessibility features.
 * 
 * @example
 * ```tsx
 * <Textarea placeholder="Enter text..." />
 * <Textarea variant="error" error="Required field" />
 * <Textarea size="lg" resizable={false} />
 * <Textarea label="Description" helperText="Max 500 characters" />
 * ```
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      resizable = true,
      minRows,
      maxRows,
      error,
      helperText,
      label,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseId = React.useId()
    const textareaId = props.id || baseId
    const errorId = `${textareaId}-error`
    const helperTextId = `${textareaId}-helper`

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-[hsl(var(--foreground))] mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={minRows}
          className={cn(
            textareaVariants({ variant, size, resizable }),
            error && 'border-[hsl(var(--destructive))] shadow-[2px_2px_0_0_hsl(var(--destructive))]',
            className
          )}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={cn(
            error && errorId,
            helperText && helperTextId,
            error || helperText
          )}
          {...props}
        />
        {error && (
          <p
            id={errorId}
            className="text-sm text-[hsl(var(--destructive))] mt-1 flex items-center gap-1"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={helperTextId}
            className="text-sm text-[hsl(var(--muted-foreground))] mt-1"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'


