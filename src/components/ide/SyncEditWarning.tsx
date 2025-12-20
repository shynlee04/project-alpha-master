/**
 * SyncEditWarning Component
 *
 * Story 13-3: Add Sync Progress Indicator
 *
 * Displays a dismissible warning toast when user attempts to edit
 * during an active sync operation.
 */

import React, { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

export interface SyncEditWarningProps {
    /** Whether to show the warning */
    isVisible: boolean
    /** Callback when warning is dismissed */
    onDismiss: () => void
    /** Auto-dismiss after this many milliseconds (default: 5000) */
    autoDismissMs?: number
}

// ============================================================================
// Component
// ============================================================================

/**
 * Warning toast shown when user edits during sync.
 * Auto-dismisses after 5 seconds or manual dismiss.
 */
export function SyncEditWarning({
    isVisible,
    onDismiss,
    autoDismissMs = 5000,
}: SyncEditWarningProps): React.JSX.Element | null {
    const [visible, setVisible] = useState(isVisible)

    // Sync visibility with prop
    useEffect(() => {
        setVisible(isVisible)
    }, [isVisible])

    // Auto-dismiss timer
    useEffect(() => {
        if (!visible || autoDismissMs <= 0) return

        const timer = setTimeout(() => {
            setVisible(false)
            onDismiss()
        }, autoDismissMs)

        return () => clearTimeout(timer)
    }, [visible, autoDismissMs, onDismiss])

    if (!visible) return null

    return (
        <div
            className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-950/90 px-4 py-3 text-sm text-amber-100 shadow-lg backdrop-blur-sm animate-in slide-in-from-bottom-2 fade-in"
            role="alert"
        >
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-400" />
            <span>Editing during sync may cause conflicts</span>
            <button
                onClick={() => {
                    setVisible(false)
                    onDismiss()
                }}
                className="ml-2 rounded-sm p-1 text-amber-400 hover:bg-amber-800/50 hover:text-amber-200 transition-colors"
                aria-label="Dismiss warning"
            >
                <X className="h-3 w-3" />
            </button>
        </div>
    )
}
