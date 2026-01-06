/**
 * @fileoverview Keyboard Shortcuts Hook
 * @module hooks/useKeyboardShortcuts
 *
 * React hook for registering and managing keyboard shortcuts in components.
 * Provides automatic cleanup on unmount and supports conditional registration.
 *
 * @story S-021 Implement Keyboard Shortcuts System
 */

import { useEffect, useRef } from 'react';
import type { KeyboardShortcut } from '@/lib/keyboard/KeyboardShortcutManager';
import { KeyboardShortcutManager } from '@/lib/keyboard/KeyboardShortcutManager';

export interface UseKeyboardShortcutsOptions {
  /**
   * Whether shortcuts should be registered
   * Useful for conditional registration based on component state
   */
  enabled?: boolean;

  /**
   * Dependencies that should trigger re-registration when changed
   * Shortcuts will be re-registered when these dependencies change
   */
  deps?: React.DependencyList;
}

/**
 * Hook for registering keyboard shortcuts in a component
 *
 * Automatically handles cleanup on unmount and re-registers shortcuts
 * when dependencies change.
 *
 * @param shortcuts - Array of shortcut configurations
 * @param options - Optional configuration
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts([
 *   {
 *     id: 'my-shortcut',
 *     key: 'k',
 *     metaKey: true,
 *     handler: () => console.log('Cmd+K pressed'),
 *     description: 'My shortcut',
 *     category: 'global',
 *   },
 * ]);
 * ```
 *
 * @example With options
 * ```tsx
 * useKeyboardShortcuts(
 *   [
 *     {
 *       id: 'conditional-shortcut',
 *       key: 's',
 *       metaKey: true,
 *       handler: handleSave,
 *       description: 'Save',
 *       category: 'editing',
 *     },
 *   ],
 *   {
 *     enabled: canSave, // Only register when canSave is true
 *     deps: [canSave], // Re-register when canSave changes
 *   }
 * );
 * ```
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
): void {
  const { enabled = true, deps = [] } = options;
  const cleanupFunctionsRef = useRef<Array<() => void>>([]);

  useEffect(() => {
    // Skip if shortcuts are disabled
    if (!enabled || !KeyboardShortcutManager.enabled) {
      return;
    }

    // Register all shortcuts
    const cleanupFunctions: Array<() => void> = [];

    for (const shortcut of shortcuts) {
      const cleanup = KeyboardShortcutManager.register(shortcut);
      cleanupFunctions.push(cleanup);
    }

    // Store cleanup functions
    cleanupFunctionsRef.current = cleanupFunctions;

    // Cleanup on unmount
    return () => {
      for (const cleanup of cleanupFunctions) {
        cleanup();
      }
      cleanupFunctionsRef.current = [];
    };
  }, [enabled, ...deps]);
}

/**
 * Hook for registering a single keyboard shortcut
 *
 * Simplified version of useKeyboardShortcuts for single shortcut registration.
 *
 * @param shortcut - Shortcut configuration
 * @param options - Optional configuration
 *
 * @example
 * ```tsx
 * useKeyboardShortcut({
 *   id: 'save',
 *   key: 's',
 *   metaKey: true,
 *   handler: handleSave,
 *   description: 'Save',
 *   category: 'editing',
 * });
 * ```
 */
export function useKeyboardShortcut(
  shortcut: KeyboardShortcut,
  options: Omit<UseKeyboardShortcutsOptions, 'deps'> = {}
): void {
  useKeyboardShortcuts([shortcut], options);
}

/**
 * Hook for getting shortcut display string
 *
 * Returns the formatted shortcut string for display in UI.
 * Automatically detects platform (Mac vs Windows/Linux) for correct modifier display.
 *
 * @param shortcut - Shortcut to format
 * @returns Formatted shortcut string (e.g., "Cmd+K", "Ctrl+/")
 *
 * @example
 * ```tsx
 * const shortcutLabel = useShortcutLabel({
 *   key: 'k',
 *   metaKey: true,
 * });
 * // Returns "Cmd+K" on Mac, "Ctrl+K" on Windows/Linux
 * ```
 */
export function useShortcutLabel(shortcut: Partial<KeyboardShortcut>): string {
  // Import formatShortcut dynamically to avoid circular dependency
  const { formatShortcut } = require('@/lib/keyboard/KeyboardShortcutManager');

  // Build complete shortcut for formatting
  const completeShortcut: KeyboardShortcut = {
    id: 'temp',
    description: '',
    category: 'global',
    ...shortcut,
  };

  return formatShortcut(completeShortcut);
}

/**
 * Hook for checking if keyboard shortcuts are available
 *
 * Returns false if running on a touch device or if shortcuts are disabled.
 *
 * @returns boolean indicating if shortcuts are available
 *
 * @example
 * ```tsx
 * const shortcutsAvailable = useShortcutsAvailable();
 *
 * if (!shortcutsAvailable) {
 *   return <TouchDeviceMessage />;
 * }
 * ```
 */
export function useShortcutsAvailable(): boolean {
  return KeyboardShortcutManager.enabled;
}

/**
 * Hook for getting all registered shortcuts
 *
 * Returns a map of shortcuts grouped by category. Useful for building
 * help modals or documentation.
 *
 * @returns Map of shortcuts grouped by category
 *
 * @example
 * ```tsx
 * const allShortcuts = useAllShortcuts();
 *
 * return (
 *   <div>
 *     {allShortcuts.get('global')?.map(shortcut => (
 *       <ShortcutItem key={shortcut.id} shortcut={shortcut} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useAllShortcuts(): Map<KeyboardShortcut['category'], KeyboardShortcut[]> {
  const [shortcuts, setShortcuts] = React.useState(
    KeyboardShortcutManager.getAllShortcuts()
  );

  // Re-fetch when shortcuts might change
  useEffect(() => {
    const interval = setInterval(() => {
      setShortcuts(KeyboardShortcutManager.getAllShortcuts());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return shortcuts;
}

// Import React for useState
import React from 'react';
