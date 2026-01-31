/**
 * @fileoverview AlertDialog - Generic confirmation dialog component
 * @module presentation/components/ui/alert-dialog
 *
 * A reusable 8-bit styled confirmation dialog for destructive operations.
 * Replaces window.confirm() with proper UI component.
 *
 * @example
 * ```tsx
 * <AlertDialog
 *   open={isOpen}
 *   title="Delete Thread?"
 *   message="This action cannot be undone."
 *   confirmLabel="Delete"
 *   cancelLabel="Cancel"
 *   variant="error"
 *   onConfirm={handleDelete}
 *   onClose={handleClose}
 * />
 * ```
 */

import * as React from "react"
import { useTranslation } from "react-i18next"
import { AlertTriangle, Info, CheckCircle, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/ui/dialog"
import { Button } from "@/presentation/components/ui/button"
import { cn } from "@/lib/utils"

export interface AlertDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Dialog title */
  title: string
  /** Dialog description/message */
  message: string
  /** Confirm button label */
  confirmLabel?: string
  /** Cancel button label */
  cancelLabel?: string
  /** Dialog variant for visual styling */
  variant?: "default" | "error" | "warning" | "success"
  /** Size variant */
  size?: "sm" | "md" | "lg"
  /** Callback when confirmed */
  onConfirm: () => void | Promise<void>
  /** Callback when closed/cancelled */
  onClose: () => void
  /** Optional className */
  className?: string
  /** Whether confirm action is in progress */
  isConfirming?: boolean
}

/**
 * AlertDialog - Generic confirmation dialog with 8-bit styling
 */
export function AlertDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = "error",
  size = "sm",
  onConfirm,
  onClose,
  className,
  isConfirming = false,
}: AlertDialogProps): React.JSX.Element | null {
  const { t } = useTranslation()

  // Handle keyboard shortcuts
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !isConfirming) {
        e.preventDefault()
        onConfirm()
      } else if (e.key === "Escape" && !isConfirming) {
        e.preventDefault()
        onClose()
      }
    },
    [onConfirm, onClose, isConfirming]
  )

  // Handle confirm with loading state
  const handleConfirm = React.useCallback(async () => {
    await onConfirm()
  }, [onConfirm])

  // Icon based on variant
  const Icon = React.useMemo(() => {
    switch (variant) {
      case "error":
        return AlertTriangle
      case "warning":
        return AlertCircle
      case "success":
        return CheckCircle
      default:
        return Info
    }
  }, [variant])

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !isConfirming && onClose()}>
      <DialogContent
        size={size}
        variant={variant}
        className={className}
        onPointerDownOutside={(e) => isConfirming && e.preventDefault()}
        onInteractOutside={(e) => isConfirming && e.preventDefault()}
        onKeyDown={handleKeyDown}
        showCloseButton={!isConfirming}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Icon className={cn(
              "text-destructive",
              variant === "warning" && "text-warning",
              variant === "success" && "text-success"
            )} size={20} />
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-4">
          <DialogDescription className="text-base">
            {message}
          </DialogDescription>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isConfirming}
            className="rounded-none border-2 border-border"
          >
            {cancelLabel ?? t("common.cancel", "Cancel")}
          </Button>
          <Button
            type="button"
            variant={variant === "error" ? "destructive" : "primary"}
            onClick={handleConfirm}
            disabled={isConfirming}
            className="rounded-none"
          >
            {isConfirming ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {t("common.loading", "Loading...")}
              </span>
            ) : (
              confirmLabel ?? t("common.confirm", "Confirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Hook for managing alert dialog state
 */
export interface UseAlertDialogReturn {
  isOpen: boolean
  isConfirming: boolean
  open: () => void
  close: () => void
  confirm: () => Promise<void>
}

export function useAlertDialog(
  onConfirm: () => Promise<void>
): UseAlertDialogReturn {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isConfirming, setIsConfirming] = React.useState(false)

  const open = React.useCallback(() => setIsOpen(true), [])
  const close = React.useCallback(() => setIsOpen(false), [])

  const confirm = React.useCallback(async () => {
    setIsConfirming(true)
    try {
      await onConfirm()
      setIsOpen(false)
    } finally {
      setIsConfirming(false)
    }
  }, [onConfirm])

  return { isOpen, isConfirming, open, close, confirm }
}
