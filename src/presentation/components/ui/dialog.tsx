"use client"

/**
 * 8-bit Dialog Component
 * 
 * Features:
 * - Rounded corners (rounded-[4px])
 * - Soft shadows (shadow-[4px_4px_0_0_rgba(0,0,0,0.1)])
 * - CSS custom properties for light/dark theme support
 * - Size and State variants
 * - i18n support
 */

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 transition-opacity duration-200",
        className
      )}
      {...props}
    />
  )
}

/**
 * CVA variants for DialogContent component
 * Uses CSS custom properties for light/dark theme support
 */
const dialogContentVariants = cva(
  // Base styles with 8-bit aesthetic and theme-aware colors
  "fixed left-[50%] top-[50%] z-50 grid w-[95vw] md:w-full translate-x-[-50%] translate-y-[-50%] gap-4 border-2 p-6 shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] duration-200 ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-[4px] outline-none max-h-[85vh] overflow-y-auto overflow-x-hidden focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
  {
    variants: {
      size: {
        sm: "max-w-sm",
        md: "max-w-lg",
        lg: "max-w-xl",
        xl: "max-w-2xl",
        full: "max-w-[calc(100vw-2rem)] h-[calc(100vh-2rem)]",
      },
      variant: {
        // Default variant: card-like appearance
        default: "bg-[var(--card)] text-[var(--card-foreground)] border-[var(--border)]",
        // Error variant: red tinted
        error: "bg-[var(--card)] text-[var(--destructive)] border-[var(--destructive)] shadow-[4px_4px_0_0_rgba(239,68,68,0.2)]",
        // Success variant: green tinted
        success: "bg-[var(--card)] text-[var(--success)] border-[var(--success)] shadow-[4px_4px_0_0_rgba(34,197,94,0.2)]",
        // Warning variant: yellow tinted
        warning: "bg-[var(--card)] text-[var(--warning)] border-[var(--warning)] shadow-[4px_4px_0_0_rgba(245,158,11,0.2)]",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
)

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
  VariantProps<typeof dialogContentVariants> {
  showCloseButton?: boolean
  hideOverlay?: boolean
}

function DialogContent({
  className,
  children,
  size,
  variant,
  showCloseButton = true,
  hideOverlay = false,
  ...props
}: DialogContentProps) {
  const { t } = useTranslation()

  return (
    <DialogPortal data-slot="dialog-portal">
      {!hideOverlay && <DialogOverlay />}
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(dialogContentVariants({ size, variant }), className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            className="absolute right-4 top-4 rounded-[4px] opacity-70 ring-offset-background transition-opacity duration-150 hover:opacity-100 hover:bg-[var(--muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-[var(--muted)] data-[state=open]:text-[var(--muted-foreground)] p-1"
            aria-label={t("common.close", { defaultValue: "Close" })}
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left text-[var(--foreground)]", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg font-semibold leading-tight tracking-tight text-[var(--foreground)]", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-[var(--muted-foreground)]", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
