/**
 * SyncEditWarning Component
 *
 * Story: LT-4.19 (Light Theme Migration)
 * UPDATED_AT: 2026-01-04T10:30:00Z
 *
 * Displays a dismissible warning toast when user attempts to edit
 * during an active sync operation.
 * Uses CSS custom properties for light/dark theme support.
 */

import React, { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useResponsive } from '@/hooks/useResponsive'

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
    const { t } = useTranslation()
    const { isMobile } = useResponsive()
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
            className={`fixed z-50 flex items-center gap-3 rounded-lg border border-[var(--warning)]/30 bg-[var(--warning-950)] px-4 py-3 text-sm text-[var(--warning-100)] shadow-lg animate-in slide-in-from-bottom-2 fade-in ${isMobile ? 'top-20 left-4 right-4' : 'bottom-4 right-4'
                }`}
            role="alert"
        >
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-[var(--warning)]" />
            <span>{t('editor.input.syncWarning')}</span>
            <button
                onClick={() => {
                    setVisible(false)
                    onDismiss()
                }}
                className="ml-2 rounded-sm p-1 text-[var(--warning)] hover:bg-[var(--warning-800)]/50 hover:text-[var(--warning-200)] transition-colors"
                aria-label={t('common.dismiss')}
            >
                <X className="h-3 w-3" />
            </button>
        </div>
    )
}
