/**
 * @fileoverview IDE Keyboard Shortcuts Hook
 * @module components/layout/hooks/useIDEKeyboardShortcuts
 *
 * Handles global keyboard shortcuts for the IDE.
 * Extracted from IDELayout.tsx for code organization.
 */

import { useEffect, useCallback } from 'react';

interface UseIDEKeyboardShortcutsOptions {
    /** Callback to show/focus the chat panel */
    onChatToggle: () => void;
}

/**
 * Hook to manage IDE keyboard shortcuts.
 *
 * Currently handles:
 * - Ctrl+K / Cmd+K: Focus chat panel
 */
export function useIDEKeyboardShortcuts({
    onChatToggle,
}: UseIDEKeyboardShortcutsOptions): void {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            const isModifierPressed = event.metaKey || event.ctrlKey;
            if (!isModifierPressed || event.key.toLowerCase() !== 'k') return;

            const target = event.target;
            if (target instanceof HTMLElement) {
                const tagName = target.tagName?.toLowerCase();
                const isEditable =
                    tagName === 'input' ||
                    tagName === 'textarea' ||
                    target.isContentEditable ||
                    Boolean(target.closest('.monaco-editor'));

                if (isEditable) return;
            }

            event.preventDefault();
            onChatToggle();
            window.dispatchEvent(new CustomEvent('ide.chat.focus'));
        },
        [onChatToggle],
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}
