import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

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

const tabsListVariants = cva(
  "inline-flex items-center justify-center p-1 border",
  {
    variants: {
      orientation: {
        horizontal: "w-fit h-9 rounded-md",
        vertical: "h-fit w-12 rounded-md",
      },
      theme: {
        dark: "bg-neutral-900 border-neutral-700",
        light: "bg-neutral-100 border-neutral-300",
      },
    },
  }
)

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center gap-1.5 border border-transparent font-medium whitespace-nowrap transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50",
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
        default: "text-neutral-500 hover:text-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-500",
        active: "bg-primary-500 text-white border-primary-500 shadow-sm",
        disabled: "text-neutral-400 cursor-not-allowed dark:text-neutral-600",
      },
      theme: {
        dark: "focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:outline-2 focus-visible:outline-primary-500",
        light: "focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:outline-2 focus-visible:outline-primary-500",
      },
    },
  }
)

const tabsContentVariants = cva("flex-1 outline-none")

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
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(tabsListVariants({ orientation, theme: 'dark' }), className)}
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
        tabsTriggerVariants({ size, state: 'default', orientation, theme: 'dark' }),
        "data-[state=active]:" + tabsTriggerVariants({ size, state: 'active', orientation, theme: 'dark' }),
        "data-[state=disabled]:" + tabsTriggerVariants({ size, state: 'disabled', orientation, theme: 'dark' }),
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
