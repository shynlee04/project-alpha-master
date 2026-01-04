/**
 * Tabs Component
 *
 * @story LT-3.18 (Light Theme Migration)
 * @story LT-FIX-1 (Bug Fix - Hardcoded Theme)
 *
 * Uses CSS custom properties for light/dark theme support.
 * Fixed hardcoded theme: 'dark' to use resolvedTheme from next-themes.
 */

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva } from "class-variance-authority"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

/**
 * Base tabs container
 */
const tabsVariants = cva(
  "flex flex-col gap-2",
  {
    variants: {
      orientation: {
        horizontal: "",
        vertical: "flex-row",
      },
    },
  }
)

/**
 * CVA variants for TabsList component
 * Uses CSS custom properties for light/dark theme support
 */
const tabsListVariants = cva(
  // Base styles with 8-bit aesthetic and theme-aware colors
  "inline-flex items-center justify-center p-1 border rounded-[4px] transition-[background-color,border-color] duration-150",
  {
    variants: {
      orientation: {
        horizontal: "w-fit h-9",
        vertical: "h-fit w-12",
      },
      theme: {
        dark: "bg-[var(--neutral-900)] border-[var(--neutral-700)]",
        light: "bg-[var(--neutral-100)] border-[var(--neutral-300)]",
      },
    },
  }
)

/**
 * CVA variants for TabsTrigger component
 * Uses CSS custom properties for light/dark theme support
 */
const tabsTriggerVariants = cva(
  // Base styles with theme-aware colors
  "inline-flex items-center justify-center gap-1.5 border border-transparent font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow] duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
  {
    variants: {
      orientation: {
        horizontal: "flex-1 h-[calc(100%-4px)] px-3 py-1.5",
        vertical: "w-full h-10 px-2 py-2",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
      state: {
        // Default state: muted text
        default: "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]",
        // Active state: primary background
        active: "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_2px_4px_rgba(0,0,0,0.1)]",
        // Disabled state
        disabled: "text-[var(--muted-foreground)] cursor-not-allowed opacity-50",
      },
    },
  }
)

const tabsContentVariants = cva("flex-1 outline-none transition-[color] duration-150")

interface TabsProps extends React.ComponentProps<typeof TabsPrimitive.Root> {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

interface TabsListProps extends React.ComponentProps<typeof TabsPrimitive.List> {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

interface TabsTriggerProps extends React.ComponentProps<typeof TabsPrimitive.Trigger> {
  size?: 'sm' | 'md' | 'lg'
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

interface TabsContentProps extends React.ComponentProps<typeof TabsPrimitive.Content> {
  className?: string
}

function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: TabsProps) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn(tabsVariants({ orientation }), className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  orientation = 'horizontal',
  ...props
}: TabsListProps) {
  const { resolvedTheme } = useTheme()
  const theme = resolvedTheme === 'dark' ? 'dark' : 'light'

  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(tabsListVariants({ orientation, theme }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  size = 'md',
  orientation = 'horizontal',
  ...props
}: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        tabsTriggerVariants({ size, state: 'default', orientation }),
        "data-[state=active]:" + tabsTriggerVariants({ size, state: 'active', orientation }),
        "data-[disabled]:" + tabsTriggerVariants({ size, state: 'disabled', orientation }),
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: TabsContentProps) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(tabsContentVariants(), className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
