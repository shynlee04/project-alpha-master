/**
 * @fileoverview Keyboard Shortcuts Definitions
 * @module lib/keyboard/shortcuts
 *
 * Central registry of all keyboard shortcuts available in the application.
 * Shortcuts are organized by category and include internationalization support.
 *
 * @story S-021 Implement Keyboard Shortcuts System
 */

import type { KeyboardShortcut } from './KeyboardShortcutManager';
import { KeyboardShortcutManager } from './KeyboardShortcutManager';

/**
 * Global shortcut IDs
 * Use these constants to reference shortcuts throughout the app
 */
export const SHORTCUT_IDS = {
  // Global
  COMMAND_PALETTE: 'command-palette',
  TOGGLE_SIDEBAR: 'toggle-sidebar',
  SHORTCUTS_HELP: 'shortcuts-help',
  CLOSE_MODAL: 'close-modal',

  // Navigation
  NEW_CONVERSATION: 'new-conversation',
  FOCUS_CHAT_INPUT: 'focus-chat-input',
  NAVIGATE_UP: 'navigate-up',
  NAVIGATE_DOWN: 'navigate-down',

  // Editing
  SAVE: 'save',
  UNDO: 'undo',
  REDO: 'redo',

  // View
  TOGGLE_TERMINAL: 'toggle-terminal',
  TOGGLE_SETTINGS: 'toggle-settings',
  TOGGLE_THEME: 'toggle-theme',

  // Tools
  SEARCH_FILES: 'search-files',
  OPEN_FILE: 'open-file',
} as const;

/**
 * Shortcut definitions factory
 *
 * These factory functions create shortcut configurations that can be
 * registered with the KeyboardShortcutManager.
 */
export const ShortcutDefinitions = {
  /**
   * Command Palette: Cmd/Ctrl+K
   * Opens the command palette for quick actions
   */
  commandPalette: (handler: (event: KeyboardEvent) => void): KeyboardShortcut => ({
    id: SHORTCUT_IDS.COMMAND_PALETTE,
    description: 'keyboardShortcuts.commandPalette',
    key: 'k',
    metaKey: true,
    handler,
    priority: 100,
    category: 'global',
  }),

  /**
   * Toggle Sidebar: Cmd/Ctrl+B
   * Shows/hides the main sidebar
   */
  toggleSidebar: (handler: (event: KeyboardEvent) => void): KeyboardShortcut => ({
    id: SHORTCUT_IDS.TOGGLE_SIDEBAR,
    description: 'keyboardShortcuts.toggleSidebar',
    key: 'b',
    metaKey: true,
    handler,
    priority: 90,
    category: 'view',
  }),

  /**
   * Keyboard Shortcuts Help: Cmd/Ctrl+/
   * Opens the keyboard shortcuts help modal
   */
  shortcutsHelp: (handler: (event: KeyboardEvent) => void): KeyboardShortcut => ({
    id: SHORTCUT_IDS.SHORTCUTS_HELP,
    description: 'keyboardShortcuts.shortcutsHelp',
    key: '/',
    metaKey: true,
    handler,
    priority: 80,
    category: 'help',
  }),

  /**
   * Close Modal: Escape
   * Closes the currently open modal or dropdown
   */
  closeModal: (handler: (event: KeyboardEvent) => void): KeyboardShortcut => ({
    id: SHORTCUT_IDS.CLOSE_MODAL,
    description: 'keyboardShortcuts.closeModal',
    key: 'Escape',
    handler,
    priority: 1000, // Highest priority for Escape
    preventDefault: false, // Don't prevent browser's Escape behavior
    category: 'global',
  }),

  /**
   * New Conversation: Cmd/Ctrl+N
   * Creates a new conversation/chat
   */
  newConversation: (handler: (event: KeyboardEvent) => void): KeyboardShortcut => ({
    id: SHORTCUT_IDS.NEW_CONVERSATION,
    description: 'keyboardShortcuts.newConversation',
    key: 'n',
    metaKey: true,
    handler,
    priority: 85,
    category: 'navigation',
  }),

  /**
   * Focus Chat Input: Cmd/Ctrl+I
   * Focuses the chat input field
   */
  focusChatInput: (handler: (event: KeyboardEvent) => void): KeyboardShortcut => ({
    id: SHORTCUT_IDS.FOCUS_CHAT_INPUT,
    description: 'keyboardShortcuts.focusChatInput',
    key: 'i',
    metaKey: true,
    handler,
    priority: 75,
    condition: () => {
      // Only active when not already in an input
      const activeElement = document.activeElement;
      return activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA';
    },
    category: 'navigation',
  }),

  /**
   * Navigate Up: Arrow Up
   * Navigate to previous conversation/item
   */
  navigateUp: (handler: (event: KeyboardEvent) => void): KeyboardShortcut => ({
    id: SHORTCUT_IDS.NAVIGATE_UP,
    description: 'keyboardShortcuts.navigateUp',
    key: 'ArrowUp',
    handler,
    priority: 60,
    condition: () => {
      // Only active when not in an input
      const activeElement = document.activeElement;
      return activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA';
    },
    category: 'navigation',
  }),

  /**
   * Navigate Down: Arrow Down
   * Navigate to next conversation/item
   */
  navigateDown: (handler: (event: KeyboardEvent) => void): KeyboardShortcut => ({
    id: SHORTCUT_IDS.NAVIGATE_DOWN,
    description: 'keyboardShortcuts.navigateDown',
    key: 'ArrowDown',
    handler,
    priority: 60,
    condition: () => {
      // Only active when not in an input
      const activeElement = document.activeElement;
      return activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA';
    },
    category: 'navigation',
  }),

  /**
   * Save: Cmd/Ctrl+S
   * Save current work (prevent default browser save)
   */
  save: (handler: (event: KeyboardEvent) => void): KeyboardShortcut => ({
    id: SHORTCUT_IDS.SAVE,
    description: 'keyboardShortcuts.save',
    key: 's',
    metaKey: true,
    handler,
    priority: 95,
    category: 'editing',
  }),

  /**
   * Undo: Cmd/Ctrl+Z
   * Undo last action
   */
  undo: (handler: (event: KeyboardEvent) => void): KeyboardShortcut => ({
    id: SHORTCUT_IDS.UNDO,
    description: 'keyboardShortcuts.undo',
    key: 'z',
    metaKey: true,
    handler,
    priority: 70,
    category: 'editing',
  }),

  /**
   * Redo: Cmd/Ctrl+Shift+Z
   * Redo last undone action
   */
  redo: (handler: (event: KeyboardEvent) => void): KeyboardShortcut => ({
    id: SHORTCUT_IDS.REDO,
    description: 'keyboardShortcuts.redo',
    key: 'z',
    metaKey: true,
    shiftKey: true,
    handler,
    priority: 70,
    category: 'editing',
  }),

  /**
   * Toggle Terminal: Cmd/Ctrl+`
   * Shows/hides the terminal panel
   */
  toggleTerminal: (handler: (event: KeyboardEvent) => void): KeyboardShortcut => ({
    id: SHORTCUT_IDS.TOGGLE_TERMINAL,
    description: 'keyboardShortcuts.toggleTerminal',
    key: '`',
    metaKey: true,
    handler,
    priority: 65,
    category: 'view',
  }),

  /**
   * Toggle Settings: Cmd/Ctrl+,
   * Opens settings panel
   */
  toggleSettings: (handler: (event: KeyboardEvent) => void): KeyboardShortcut => ({
    id: SHORTCUT_IDS.TOGGLE_SETTINGS,
    description: 'keyboardShortcuts.toggleSettings',
    key: ',',
    metaKey: true,
    handler,
    priority: 65,
    category: 'tools',
  }),

  /**
   * Toggle Theme: Cmd/Ctrl+Shift+T
   * Switch between light/dark theme
   */
  toggleTheme: (handler: (event: KeyboardEvent) => void): KeyboardShortcut => ({
    id: SHORTCUT_IDS.TOGGLE_THEME,
    description: 'keyboardShortcuts.toggleTheme',
    key: 't',
    metaKey: true,
    shiftKey: true,
    handler,
    priority: 55,
    category: 'view',
  }),

  /**
   * Search Files: Cmd/Ctrl+Shift+F
   * Open file search dialog
   */
  searchFiles: (handler: (event: KeyboardEvent) => void): KeyboardShortcut => ({
    id: SHORTCUT_IDS.SEARCH_FILES,
    description: 'keyboardShortcuts.searchFiles',
    key: 'f',
    metaKey: true,
    shiftKey: true,
    handler,
    priority: 60,
    category: 'tools',
  }),

  /**
   * Open File: Cmd/Ctrl+O
   * Open file dialog
   */
  openFile: (handler: (event: KeyboardEvent) => void): KeyboardShortcut => ({
    id: SHORTCUT_IDS.OPEN_FILE,
    description: 'keyboardShortcuts.openFile',
    key: 'o',
    metaKey: true,
    handler,
    priority: 60,
    category: 'tools',
  }),
};

/**
 * Register a batch of shortcuts at once
 *
 * @param shortcuts - Array of shortcut configurations
 * @returns Cleanup function to unregister all shortcuts
 */
export function registerShortcuts(shortcuts: KeyboardShortcut[]): () => void {
  const cleanupFunctions: Array<() => void> = [];

  for (const shortcut of shortcuts) {
    const cleanup = KeyboardShortcutManager.register(shortcut);
    cleanupFunctions.push(cleanup);
  }

  // Return combined cleanup function
  return () => {
    for (const cleanup of cleanupFunctions) {
      cleanup();
    }
  };
}

/**
 * Get all default shortcut definitions as an array
 * Useful for documentation and testing
 */
export function getDefaultShortcutDefinitions(): Array<{
  id: string;
  key: string;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}> {
  return [
    { id: SHORTCUT_IDS.COMMAND_PALETTE, key: 'k', metaKey: true },
    { id: SHORTCUT_IDS.TOGGLE_SIDEBAR, key: 'b', metaKey: true },
    { id: SHORTCUT_IDS.SHORTCUTS_HELP, key: '/', metaKey: true },
    { id: SHORTCUT_IDS.CLOSE_MODAL, key: 'Escape' },
    { id: SHORTCUT_IDS.NEW_CONVERSATION, key: 'n', metaKey: true },
    { id: SHORTCUT_IDS.FOCUS_CHAT_INPUT, key: 'i', metaKey: true },
    { id: SHORTCUT_IDS.NAVIGATE_UP, key: 'ArrowUp' },
    { id: SHORTCUT_IDS.NAVIGATE_DOWN, key: 'ArrowDown' },
    { id: SHORTCUT_IDS.SAVE, key: 's', metaKey: true },
    { id: SHORTCUT_IDS.UNDO, key: 'z', metaKey: true },
    { id: SHORTCUT_IDS.REDO, key: 'z', metaKey: true, shiftKey: true },
    { id: SHORTCUT_IDS.TOGGLE_TERMINAL, key: '`', metaKey: true },
    { id: SHORTCUT_IDS.TOGGLE_SETTINGS, key: ',', metaKey: true },
    { id: SHORTCUT_IDS.TOGGLE_THEME, key: 't', metaKey: true, shiftKey: true },
    { id: SHORTCUT_IDS.SEARCH_FILES, key: 'f', metaKey: true, shiftKey: true },
    { id: SHORTCUT_IDS.OPEN_FILE, key: 'o', metaKey: true },
  ];
}
