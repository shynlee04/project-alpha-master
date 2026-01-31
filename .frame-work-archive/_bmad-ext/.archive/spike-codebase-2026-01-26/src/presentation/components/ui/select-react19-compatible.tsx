/**
 * @fileoverview Temporary Select Component (React 19 Compatible)
 * @module components/ui/select-react19-compatible
 * @created 2026-01-08
 * 
 * TEMPORARY FIX: This replaces the Radix UI Select component
 * to prevent infinite loops with React 19's ref handling.
 * 
 * The issue is in Radix UI's compose-refs utility which creates
 * infinite loops with React 19's new ref handling.
 * 
 * TODO: Remove this once Radix UI releases React 19 compatible version
 */

import * as React from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"


interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  children: React.ReactNode
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  size?: "sm" | "md" | "lg"
  state?: "default" | "error" | "success" | "warning"
}

interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

interface SelectValueProps {
  placeholder?: string
  value?: string
  children?: React.ReactNode
}

const selectTriggerVariants = cva(
  // UX-02: strict rounded-none for 8-bit
  'flex items-center justify-between gap-2 whitespace-nowrap rounded-none font-medium transition-[border-color,background-color] duration-150 ease-out outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
  {
    variants: {
      size: {
        sm: 'h-8 px-3 text-sm min-h-[32px]',
        md: 'h-10 px-4 text-base min-h-[40px]',
        lg: 'h-12 px-6 text-lg min-h-[48px]',
      },
      state: {
        default: 'border-2 border-[var(--input)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)] focus:border-[var(--primary)]',
        error: 'border-2 border-[var(--destructive)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)] focus:border-[var(--destructive)] focus:ring-[var(--destructive)]',
        success: 'border-2 border-[var(--success)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)] focus:border-[var(--success)] focus:ring-[var(--success)]',
        warning: 'border-2 border-[var(--warning)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)] focus:border-[var(--warning)] focus:ring-[var(--warning)]',
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'default',
    },
  }
)

const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => { },
})

export function Select({ value, onValueChange, disabled: _disabled, children }: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(value)

  // Handle external value changes
  React.useEffect(() => {
    setInternalValue(value)
  }, [value])

  const handleValueChange = React.useCallback((newValue: string) => {
    setInternalValue(newValue)
    onValueChange?.(newValue)
    setOpen(false)
  }, [onValueChange])

  return (
    <SelectContext.Provider value={{ value: internalValue, onValueChange: handleValueChange, open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ className, size = "md", state = "default", children, disabled, ...props }: SelectTriggerProps) {
  const { open, setOpen } = React.useContext(SelectContext)

  return (
    <button
      type="button"
      data-slot="select-trigger"
      data-size={size}
      data-state={state}
      className={cn(selectTriggerVariants({ size, state }), className)}
      disabled={disabled}
      onClick={() => setOpen(!open)}
      aria-expanded={open ? "true" : "false"}
      aria-haspopup="listbox"
      {...props}
    >
      {children}
      <ChevronDownIcon className="ml-auto size-4 text-[var(--muted-foreground)]" />
    </button>
  )
}

export function SelectContent({ children, className }: SelectContentProps) {
  const { open, setOpen } = React.useContext(SelectContext)
  const contentRef = React.useRef<HTMLDivElement>(null)

  // Close on click outside
  React.useEffect(() => {
    if (!open) return

    const handleClick = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={contentRef}
      data-slot="select-content"
      role="listbox"
      className={cn(
        // UX-02: strict rounded-none and border-2 for 8-bit
        'bg-[var(--background)] text-[var(--foreground)] border-2 border-[var(--border)] shadow-[var(--shadow-pixel)] relative z-50 max-h-[var(--radix-select-content-available-height)] min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 p-1',
        className
      )}
    >
      {children}
    </div>
  )
}

export function SelectItem({ value, children, className, onClick }: SelectItemProps) {
  const { value: currentValue, onValueChange } = React.useContext(SelectContext)
  const isSelected = currentValue === value

  const handleClick = () => {
    onValueChange?.(value)
    onClick?.()
  }

  return (
    <div
      data-slot="select-item"
      className={cn(
        // UX-02: strict rounded-none for 8-bit
        'relative flex w-full cursor-default items-center gap-2 rounded-none py-1.5 pr-8 pl-2 text-sm outline-hidden select-none transition-[background-color] duration-150 ease-out data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] focus:bg-[var(--primary)] focus:text-[var(--primary-foreground)] cursor-pointer',
        isSelected && 'bg-[var(--accent)] text-[var(--accent-foreground)]',
        className
      )}
      onClick={handleClick}
      role="option"
      aria-selected={isSelected ? "true" : "false"}
    >
      <span
        data-slot="select-item-indicator"
        className="absolute right-2 flex size-3.5 items-center justify-center"
      >
        {isSelected && <CheckIcon className="size-4 text-[var(--foreground)]" />}
      </span>
      <span>{children}</span>
    </div>
  )
}

export function SelectValue({ placeholder, value, children }: SelectValueProps) {
  const { value: contextValue } = React.useContext(SelectContext)
  const displayValue = value || contextValue

  // If children are provided, render them instead of the value
  if (children) {
    return (
      <span data-slot="select-value">
        {children}
      </span>
    )
  }

  return (
    <span data-slot="select-value">
      {displayValue || placeholder}
    </span>
  )
}

export function SelectGroup({ children }: { children: React.ReactNode }) {
  return <div data-slot="select-group">{children}</div>
}

export function SelectLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      data-slot="select-label"
      className={cn('px-2 py-1.5 text-xs font-semibold text-[var(--muted-foreground)]', className)}
    >
      {children}
    </div>
  )
}

export function SelectSeparator({ className }: { className?: string }) {
  return (
    <div
      data-slot="select-separator"
      className={cn('pointer-events-none -mx-1 my-1 h-px bg-[var(--border)]', className)}
    />
  )
}

// Compatibility exports
export const SelectScrollUpButton = () => null
export const SelectScrollDownButton = () => null
