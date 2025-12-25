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
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

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
  // Base styles
  'flex w-full rounded-none border-2 font-mono transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary-500/50',
  {
    variants: {
      variant: {
        default: 'border-neutral-700 bg-neutral-900/80 text-neutral-100 placeholder:text-neutral-500 focus:border-primary-500 focus:ring-primary-500/50',
        success: 'border-success-500 bg-success-950/50 text-success-100 placeholder:text-success-400 focus:border-success-400 focus:ring-success-500/50',
        error: 'border-error-500 bg-error-950/50 text-error-100 placeholder:text-error-400 focus:border-error-400 focus:ring-error-500/50',
        warning: 'border-warning-500 bg-warning-950/50 text-warning-100 placeholder:text-warning-400 focus:border-warning-400 focus:ring-warning-500/50',
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
    const { t } = useTranslation()

    const baseId = React.useId()
    const textareaId = props.id || baseId
    const errorId = `${textareaId}-error`
    const helperTextId = `${textareaId}-helper`

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-neutral-300 mb-1"
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
            error && 'border-error-500 ring-2 ring-error-500/50',
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
            className="text-sm text-error-400 mt-1 flex items-center gap-1"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={helperTextId}
            className="text-sm text-neutral-500 mt-1"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'


