/**
 * Checkbox Component
 * 
 * EPIC_ID: Epic-23
 * STORY_ID: 23-1
 * STORY: LT-2.11 (Light Theme Migration)
 * CREATED_AT: 2025-12-25T17:16:00Z
 * UPDATED_AT: 2026-01-04T00:00:00Z
 * 
 * Production-ready Checkbox component following 8-bit design system.
 * Implements all variants, sizes, states with accessibility, i18n, and light/dark theme support.
 * Uses CSS custom properties for theme-aware styling.
 */

import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/spike/lib/utils'
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
 * Uses CSS custom properties for light/dark theme support
 */
const checkboxVariants = cva(
  // Base styles with theme-aware colors
  'inline-flex items-center justify-center rounded-[4px] border border-[var(--border)] transition-[background-color,border-color] duration-150 ease-out outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
  {
    variants: {
      variant: {
        default: 'bg-[var(--background)] text-[var(--foreground)] focus-visible:border-[var(--primary)]',
        primary: 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]',
        success: 'bg-[var(--success)] text-white border-[var(--success)]',
        warning: 'bg-[var(--warning)] text-white border-[var(--warning)]',
        error: 'bg-[var(--destructive)] text-white border-[var(--destructive)]',
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
    React.useImperativeHandle(ref, () => inputRef.current!)

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
                error && 'border-[var(--destructive)] ring-2 ring-[var(--destructive)]/50',
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
                error ? 'text-[var(--destructive)]' : 'text-[var(--foreground)]'
              )}
            >
              {labelContent}
              {required && (
                <span className="text-[var(--destructive)] ml-1" aria-hidden="true">
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
            className="text-sm text-[var(--destructive)] mt-1 flex items-center gap-1"
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
            className="text-sm text-[var(--muted-foreground)] mt-1"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'


