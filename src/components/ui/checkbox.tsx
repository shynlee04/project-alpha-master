/**
 * Checkbox Component
 * 
 * EPIC_ID: Epic-23
 * STORY_ID: 23-1
 * CREATED_AT: 2025-12-25T17:16:00Z
 * 
 * Production-ready Checkbox component following 8-bit design system.
 * Implements all variants, sizes, states with accessibility and i18n support.
 */

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { Check, Minus } from 'lucide-react'

/**
 * Checkbox component props interface
 */
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visual variant of checkbox */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
  /** Size variant of checkbox */
  size?: 'sm' | 'md' | 'lg'
  /** Whether checkbox is checked */
  checked?: boolean
  /** Whether checkbox is indeterminate (partially checked) */
  indeterminate?: boolean
  /** Whether checkbox is disabled */
  disabled?: boolean
  /** Label text to display next to checkbox */
  label?: string
  /** Translation key for label text */
  labelKey?: string
  /** Translation namespace */
  namespace?: string
  /** Whether checkbox is required */
  required?: boolean
  /** Error message to display */
  error?: string
  /** Helper text to display */
  helperText?: string
}

/**
 * CVA variants for Checkbox component
 * Uses design tokens from 8-bit design system
 */
const checkboxVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-none border-2 transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2',
  {
    variants: {
      variant: {
        default: 'border-neutral-700 bg-neutral-900/80 text-neutral-100 focus-visible:border-primary-500 focus-visible:ring-primary-500/50',
        primary: 'border-primary-700 bg-primary-900/80 text-primary-100 focus-visible:border-primary-400 focus-visible:ring-primary-500/50',
        success: 'border-success-700 bg-success-900/80 text-success-100 focus-visible:border-success-400 focus-visible:ring-success-500/50',
        warning: 'border-warning-700 bg-warning-900/80 text-warning-100 focus-visible:border-warning-400 focus-visible:ring-warning-500/50',
        error: 'border-error-700 bg-error-900/80 text-error-100 focus-visible:border-error-400 focus-visible:ring-error-500/50',
      },
      size: {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

/**
 * Checkbox Component
 * 
 * A production-ready checkbox component following 8-bit design system.
 * Supports multiple variants, sizes, indeterminate state, and accessibility features.
 * 
 * @example
 * ```tsx
 * <Checkbox label="Accept terms" />
 * <Checkbox variant="primary" label="Primary option" />
 * <Checkbox size="lg" indeterminate />
 * <Checkbox label="Required field" required error="This field is required" />
 * <Checkbox labelKey="settings.autoSave" namespace="settings" />
 * ```
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      checked = false,
      indeterminate = false,
      disabled = false,
      label,
      labelKey,
      namespace,
      required = false,
      error,
      helperText,
      id: propId,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation(namespace || 'translation')

    const baseId = React.useId()
    const checkboxId = propId || baseId
    const errorId = `${checkboxId}-error`
    const helperTextId = `${checkboxId}-helper`

    // Handle indeterminate state
    const inputRef = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(ref, () => inputRef.current)

    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate
      }
    }, [indeterminate])

    // Get label content from translation or direct text
    const labelContent = labelKey ? t(labelKey) : label

    // Determine which icon to show
    const Icon = indeterminate ? Minus : Check
    const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              ref={inputRef}
              type="checkbox"
              id={checkboxId}
              checked={checked}
              disabled={disabled}
              className={cn(
                'sr-only', // Hide default checkbox, use custom styling
                className
              )}
              aria-invalid={!!error}
              aria-describedby={cn(
                error && errorId,
                helperText && helperTextId,
                error || helperText
              )}
              {...props}
            />
            {/* Custom checkbox visual */}
            <div
              className={cn(
                checkboxVariants({ variant, size }),
                checked && 'bg-opacity-100',
                !checked && !indeterminate && 'bg-opacity-0',
                error && 'border-error-500 ring-2 ring-error-500/50',
                'cursor-pointer',
                disabled && 'cursor-not-allowed'
              )}
              aria-hidden="true"
            >
              <Icon
                size={iconSize}
                className={cn(
                  'transition-transform duration-150',
                  checked && 'scale-100',
                  !checked && !indeterminate && 'scale-0',
                  indeterminate && 'scale-100'
                )}
              />
            </div>
          </div>

          {/* Label */}
          {labelContent && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'text-sm font-medium cursor-pointer select-none',
                disabled && 'cursor-not-allowed opacity-50',
                error ? 'text-error-400' : 'text-neutral-300'
              )}
            >
              {labelContent}
              {required && (
                <span className="text-error-500 ml-1" aria-hidden="true">
                  *
                </span>
              )}
            </label>
          )}
        </div>

        {/* Error message */}
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

        {/* Helper text */}
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

Checkbox.displayName = 'Checkbox'


