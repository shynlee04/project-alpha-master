/**
 * @fileoverview IDE Keyboard Shortcuts Hook
 * @module components/layout/hooks/useIDEKeyboardShortcuts
 *
 * Handles global keyboard shortcuts for IDE.
 * Extracted from IDELayout.tsx for code organization.
 *
 * @story UXUI-03-16
 */

import { useEffect, useCallback } from 'react';

interface UseIDEKeyboardShortcutsOptions {
    /** Callback to show/focus chat panel */
    onChatToggle: () => void;
    /** Callback to open command palette */
    onCommandPaletteOpen?: () => void;
    /** Callback to toggle right panel visibility */
    onToggleRightPanel?: () => void;
    /** Callback to switch to plugin by index (0-based) */
    onSwitchPlugin?: (index: number) => void;
}

/**
 * Hook to manage IDE keyboard shortcuts.
 *
 * Currently handles:
 * - Ctrl+K / Cmd+K: Focus chat panel
 * - Ctrl+P / Cmd+P: Open command palette
 * - Ctrl+J / Cmd+J: Toggle right panel
 * - Ctrl+1-6 / Cmd+1-6: Switch to plugin 1-6
 *
 * @story UXUI-03-16 Keyboard Shortcuts (Cmd+1-6, Cmd+J)
 */
export function useIDEKeyboardShortcuts({
    onChatToggle,
    onCommandPaletteOpen,
    onToggleRightPanel,
    onSwitchPlugin,
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

            // Ctrl+J / Cmd+J: Toggle right panel (chat panel)
            if (key === 'j' && onToggleRightPanel) {
                event.preventDefault();
                onToggleRightPanel();
            }

            // Ctrl+1-6 / Cmd+1-6: Switch to plugin by index
            if (onSwitchPlugin) {
                const pluginIndex = parseInt(key, 10);
                if (!isNaN(pluginIndex) && pluginIndex >= 1 && pluginIndex <= 6) {
                    event.preventDefault();
                    onSwitchPlugin(pluginIndex - 1); // Convert to 0-based index
                }
            }
        },
        [onChatToggle, onCommandPaletteOpen, onToggleRightPanel, onSwitchPlugin],
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}
