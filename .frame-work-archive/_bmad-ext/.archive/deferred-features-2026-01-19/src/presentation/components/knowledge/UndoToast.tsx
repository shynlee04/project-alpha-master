/**
 * @fileoverview Undo Toast Component
 * @module components/knowledge/UndoToast
 * @governance EPIC-6-3
 *
 * Toast notification for delete confirmation with undo capability.
 * Shows countdown timer and auto-dismisses after expiration.
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export interface UndoToastProps {
    /** Title of the deleted source */
    sourceTitle: string;

    /** Callback when undo is clicked */
    onUndo: () => void;

    /** Callback when toast is dismissed (timer expires) */
    onDismiss?: () => void;

    /** Countdown duration in seconds (default: 5) */
    countdown?: number;

    /** Whether toast is visible */
    visible?: boolean;
}

/**
 * UndoToast Component
 *
 * Displays a toast notification after source deletion with:
 * - Message confirming deletion
 * - Countdown timer (default 5 seconds)
 * - Undo button
 * - Auto-dismiss on timer expiration
 *
 * Positioned at bottom-right with fixed positioning.
 * Uses 8-bit design styling.
 */
export function UndoToast({
    sourceTitle,
    onUndo,
    onDismiss,
    countdown = 5,
    visible = true,
}: UndoToastProps) {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = useState(countdown);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!visible) return;

        // Countdown timer
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    // Timer expired
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                    }
                    onDismiss?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Cleanup on unmount or visibility change
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [visible, onDismiss]);

    // Reset timer when countdown prop changes
    useEffect(() => {
        setTimeLeft(countdown);
    }, [countdown]);

    if (!visible) {
        return null;
    }

    const handleUndo = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        onUndo();
    };

    return (
        <div
            className={cn(
                'fixed bottom-4 right-4 z-50',
                'bg-surface-dark border border-border-dark shadow-pixel',
                'px-4 py-3 rounded-none',
                'flex items-center gap-3',
                'max-w-md'
            )}
            role="alert"
            aria-live="polite"
        >
            {/* Message */}
            <div className="flex-1">
                <p className="text-sm text-foreground">
                    <span className="font-medium">"{sourceTitle}"</span> {t('knowledge.deleted')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    {t('knowledge.undo.availableIn')} <span className="font-mono">{timeLeft}s</span>
                </p>
            </div>

            {/* Undo button */}
            <button
                type="button"
                onClick={handleUndo}
                className={cn(
                    'px-3 py-1.5 text-sm font-medium',
                    'bg-primary text-background',
                    'hover:bg-primary/90',
                    'rounded-none',
                    'transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary'
                )}
            >
                {t('knowledge.undo.undo')}
            </button>
        </div>
    );
}
