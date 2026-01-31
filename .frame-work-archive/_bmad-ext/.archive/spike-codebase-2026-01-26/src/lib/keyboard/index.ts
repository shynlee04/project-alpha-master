/**
 * @fileoverview Keyboard Module Index
 * @module lib/keyboard
 *
 * Central exports for keyboard shortcuts system.
 */

export {
  KeyboardShortcutManager,
  formatShortcut,
  parseShortcutString,
} from './KeyboardShortcutManager';
export type { KeyboardShortcut } from './KeyboardShortcutManager';

export {
  ShortcutDefinitions,
  registerShortcuts,
  getDefaultShortcutDefinitions,
} from './shortcuts';
export { SHORTCUT_IDS } from './shortcuts';
