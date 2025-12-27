/**
 * @fileoverview IDE Keyboard Shortcuts Hook
 * @module components/layout/hooks/useIDEKeyboardShortcuts
 *
 * Handles global keyboard shortcuts for IDE.
 * Extracted from IDELayout.tsx for code organization.
 */

import { useEffect, useCallback } from 'react';

interface UseIDEKeyboardShortcutsOptions {
    /** Callback to show/focus chat panel */
    onChatToggle: () => void;
    /** Callback to open command palette */
    onCommandPaletteOpen?: () => void;
}

/**
 * Hook to manage IDE keyboard shortcuts.
 *
 * Currently handles:
 * - Ctrl+K / Cmd+K: Focus chat panel
 * - Ctrl+P / Cmd+P: Open command palette
 */
export function useIDEKeyboardShortcuts({
    onChatToggle,
    onCommandPaletteOpen,
}: UseIDEKeyboardShortcutsOptions): void {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            const isModifierPressed = event.metaKey || event.ctrlKey;
            if (!isModifierPressed) return;

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

            const key = event.key.toLowerCase();
            
            // Ctrl+K / Cmd+K: Focus chat panel
            if (key === 'k') {
                event.preventDefault();
                onChatToggle();
                window.dispatchEvent(new CustomEvent('ide.chat.focus'));
            }
            
            // Ctrl+P / Cmd+P: Open command palette
            if (key === 'p' && onCommandPaletteOpen) {
                event.preventDefault();
                onCommandPaletteOpen();
            }
        },
        [onChatToggle, onCommandPaletteOpen],
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}
