/**
 * Unsaved Changes Warning Hook
 *
 * Warns users when they try to navigate away with unsaved changes.
 * Provides confirmation dialog before closing.
 *
 * @module agent/hooks/useUnsavedChangesWarning
 * @story AC-1.5 - Extract hooks from AgentConfigDialog (496 → ~200 lines)
 */

import { useCallback, useEffect } from 'react'

export interface UseUnsavedChangesWarningProps {
    /** Whether there are unsaved changes */
    hasUnsavedChanges: boolean
    /** Warning message to display */
    message: string
    /** Callback when user tries to close with unsaved changes */
    onBeforeUnload?: (event: BeforeUnloadEvent) => void
}

/**
 * Hook for managing unsaved changes warnings
 *
 * Features:
 * - Browser beforeunload event handling
 * - Custom confirmation callback
 * - Prevents accidental data loss
 */
export function useUnsavedChangesWarning({
    hasUnsavedChanges,
    message,
    onBeforeUnload,
}: UseUnsavedChangesWarningProps) {
    /**
     * Handle browser beforeunload event
     */
    const handleBeforeUnload = useCallback(
        (event: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                // Trigger custom callback if provided
                if (onBeforeUnload) {
                    onBeforeUnload(event)
                }

                // Standard browser warning (required by spec)
                event.preventDefault()
                event.returnValue = message // Chrome requires returnValue to be set
                return message
            }
        },
        [hasUnsavedChanges, message, onBeforeUnload]
    )

    // Set up beforeunload event listener
    useEffect(() => {
        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [handleBeforeUnload])

    /**
     * Confirm navigation programmatically
     *
     * Use this when you need to check unsaved changes before navigation
     * (e.g., when user clicks a close button)
     */
    const confirmNavigation = useCallback((): boolean => {
        if (hasUnsavedChanges) {
            return window.confirm(message)
        }
        return true
    }, [hasUnsavedChanges, message])

    return { confirmNavigation }
}
