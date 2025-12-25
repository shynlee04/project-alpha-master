"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

export interface LabelProps
  extends React.ComponentProps<typeof LabelPrimitive.Root> {
  /** Size variant */
  size?: "sm" | "md" | "lg"
  /** State variant */
  variant?: "default" | "error" | "success"
  /** Required indicator */
  required?: boolean
  /** Translation key for label text */
  labelKey?: string
  /** Translation namespace */
  namespace?: string
}

const labelVariants = {
  size: {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  },
  variant: {
    default: "text-neutral-600",
    error: "text-error-500",
    success: "text-success-500",
  },
}

const Label = React.forwardRef<
  HTMLLabelElement,
  LabelProps
>(({ className, size = "md", variant = "default", required, labelKey, namespace, ...props }, ref) => {
  const { t } = useTranslation(namespace || "translation")

  const labelContent = labelKey ? t(labelKey) : props.children

  return (
    <LabelPrimitive.Root
      ref={ref}
      data-slot="label"
      className={cn(
        "leading-none font-medium select-none",
        labelVariants.size[size],
        labelVariants.variant[variant],
        "group-data-[disabled=true]:pointer-events-none",
        "group-data-[disabled=true]:opacity-50",
        "peer-disabled:cursor-not-allowed",
        "peer-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {labelContent}
      {required && (
        <span className="text-error-500 ml-1" aria-hidden="true">
          *
        </span>
      )}
    </LabelPrimitive.Root>
  )
})
Label.displayName = "Label"

export { Label }
