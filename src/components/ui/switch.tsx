"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cva, type VariantProps } from "class-variance-authority"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"

const switchVariants = cva(
  "peer inline-flex shrink-0 cursor-pointer items-center border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 rounded-none",
  {
    variants: {
      size: {
        sm: "h-5 w-9",
        md: "h-6 w-11",
        lg: "h-7 w-14",
      },
      state: {
        default: "data-[state=checked]:bg-primary-500 data-[state=unchecked]:bg-neutral-700 focus-visible:ring-primary-500",
        error: "data-[state=checked]:bg-error-500 data-[state=unchecked]:bg-neutral-700 focus-visible:ring-error-500",
        success: "data-[state=checked]:bg-success-500 data-[state=unchecked]:bg-neutral-700 focus-visible:ring-success-500",
        warning: "data-[state=checked]:bg-warning-500 data-[state=unchecked]:bg-neutral-700 focus-visible:ring-warning-500",
      },
    },
    defaultVariants: {
      size: "md",
      state: "default",
    },
  }
)

const switchThumbVariants = cva(
  "pointer-events-none block bg-neutral-100 ring-0 transition-transform rounded-none data-[state=unchecked]:translate-x-0 shadow-sm",
  {
    variants: {
      size: {
        sm: "h-4 w-4 data-[state=checked]:translate-x-4",
        md: "h-5 w-5 data-[state=checked]:translate-x-5",
        lg: "h-6 w-6 data-[state=checked]:translate-x-7",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
  VariantProps<typeof switchVariants> { }

function Switch({ className, size, state, ...props }: SwitchProps) {
  const { t } = useTranslation()
  return (
    <SwitchPrimitive.Root
      className={cn(switchVariants({ size, state }), className)}
      aria-label={props["aria-label"] || t("common.toggle", "Toggle")}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(switchThumbVariants({ size }))}
      />
    </SwitchPrimitive.Root>
  )
}
Switch.displayName = SwitchPrimitive.Root.displayName

export { Switch }

