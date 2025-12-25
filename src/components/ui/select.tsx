/**
 * Select Component
 *
 * EPIC_ID: Epic-23
 * STORY_ID: 23-1
 * CREATED_AT: 2025-12-25T17:44:00Z
 *
 * Production-ready Select component following 8-bit design system.
 * Implements all variants, sizes, states with accessibility and i18n support.
 */

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

/**
 * SelectTrigger component props interface
 */
export interface SelectTriggerProps extends React.ComponentProps<typeof SelectPrimitive.Trigger> {
  /** Size variant of select trigger */
  size?: "sm" | "md" | "lg"
  /** State variant of select trigger */
  state?: "default" | "error" | "success" | "warning"
}

/**
 * CVA variants for SelectTrigger component
 * Uses design tokens from 8-bit design system
 */
const selectTriggerVariants = cva(
  // Base styles
  'flex items-center justify-between gap-2 whitespace-nowrap rounded-none font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950',
  {
    variants: {
      size: {
        sm: 'h-8 px-3 text-sm min-h-[32px]',
        md: 'h-10 px-4 text-base min-h-[40px]',
        lg: 'h-12 px-6 text-lg min-h-[48px]',
      },
      state: {
        default: 'border-2 border-neutral-700 bg-neutral-950 text-neutral-100 hover:bg-neutral-900 focus:border-primary-500',
        error: 'border-2 border-error-500 bg-neutral-950 text-neutral-100 hover:bg-neutral-900 focus:border-error-500 focus:ring-error-500',
        success: 'border-2 border-success-500 bg-neutral-950 text-neutral-100 hover:bg-neutral-900 focus:border-success-500 focus:ring-success-500',
        warning: 'border-2 border-warning-500 bg-neutral-950 text-neutral-100 hover:bg-neutral-900 focus:border-warning-500 focus:ring-warning-500',
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'default',
    },
  }
)

function SelectTrigger({
  className,
  size = "md",
  state = "default",
  children,
  ...props
}: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      data-state={state}
      className={cn(selectTriggerVariants({ size, state }), className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

/**
 * CVA variants for SelectContent component
 * Uses design tokens from 8-bit design system
 */
const selectContentVariants = cva(
  // Base styles
  'bg-neutral-950 text-neutral-100 border-2 border-neutral-700 shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] relative z-50 max-h-[var(--radix-select-content-available-height)] min-w-[8rem] origin-[var(--radix-select-content-transform-origin)] overflow-x-hidden overflow-y-auto rounded-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  {
    variants: {
      position: {
        popper: 'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        "item-aligned": "",
      },
    },
  }
)

function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(selectContentVariants({ position }), className)}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

/**
 * CVA variants for SelectLabel component
 * Uses design tokens from 8-bit design system
 */
const selectLabelVariants = cva(
  'px-2 py-1.5 text-xs font-semibold',
  {
    variants: {
      theme: {
        dark: 'text-neutral-400',
        light: 'text-neutral-600',
      },
    },
    defaultVariants: {
      theme: 'dark',
    },
  }
)

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(selectLabelVariants(), className)}
      {...props}
    />
  )
}

/**
 * CVA variants for SelectItem component
 * Uses design tokens from 8-bit design system
 */
const selectItemVariants = cva(
  'relative flex w-full cursor-default items-center gap-2 rounded-none py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2',
  {
    variants: {
      theme: {
        dark: 'hover:bg-neutral-800 focus:bg-primary-500 focus:text-neutral-950',
        light: 'hover:bg-neutral-200 focus:bg-primary-500 focus:text-white',
      },
    },
    defaultVariants: {
      theme: 'dark',
    },
  }
)

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(selectItemVariants(), className)}
      {...props}
    >
      <span
        data-slot="select-item-indicator"
        className="absolute right-2 flex size-3.5 items-center justify-center"
      >
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

/**
 * CVA variants for SelectSeparator component
 * Uses design tokens from 8-bit design system
 */
const selectSeparatorVariants = cva(
  'pointer-events-none -mx-1 my-1 h-px',
  {
    variants: {
      theme: {
        dark: 'bg-neutral-700',
        light: 'bg-neutral-200',
      },
    },
    defaultVariants: {
      theme: 'dark',
    },
  }
)

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(selectSeparatorVariants(), className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  const { t } = useTranslation()
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      aria-label={t('common.scrollUp', 'Scroll Up')}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  const { t } = useTranslation()
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      aria-label={t('common.scrollDown', 'Scroll Down')}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
