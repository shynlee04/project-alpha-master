/**
 * @fileoverview Keyboard Shortcut Manager
 * @module lib/keyboard/KeyboardShortcutManager
 *
 * Centralized manager for handling keyboard shortcuts across the application.
 * Provides cross-platform modifier key detection (Cmd vs Ctrl) and prevents
 * interference with browser/native shortcuts.
 *
 * @story S-021 Implement Keyboard Shortcuts System
 */

export interface KeyboardShortcut {
  /** Unique identifier for the shortcut */
  id: string;

  /** Human-readable description for display in help */
  description: string;

  /** Keyboard key (e.g., 'k', 'b', '/', 'Escape') */
  key: string;

  /** Whether Command (Mac) or Ctrl (Windows/Linux) is required */
  metaKey?: boolean;

  /** Whether Shift key is required */
  shiftKey?: boolean;

  /** Whether Alt/Option key is required */
  altKey?: boolean;

  /** Callback function to execute when shortcut is triggered */
  handler: (event: KeyboardEvent) => void;

  /** Priority for conflict resolution (higher = more important) */
  priority?: number;

  /** Condition that must be true for shortcut to be active */
  condition?: () => boolean;

  /** Whether this shortcut should prevent default browser behavior */
  preventDefault?: boolean;

  /** Whether this shortcut should stop propagation */
  stopPropagation?: boolean;

  /** Category for grouping in help modal */
  category: 'global' | 'navigation' | 'editing' | 'view' | 'tools' | 'help';
}

interface ShortcutRegistration {
  shortcut: KeyboardShortcut;
  registeredAt: number;
}

/**
 * Keyboard Shortcut Manager Class
 *
 * Singleton pattern for centralized keyboard event handling.
 * Supports cross-platform modifier key detection and priority-based conflict resolution.
 */
class KeyboardShortcutManagerClass {
  private shortcuts: Map<string, ShortcutRegistration> = new Map();
  private isEnabled: boolean = true;
  private isTouchDevice: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.detectTouchDevice();
      this.attachGlobalListener();
    }
  }

  /**
   * Detect if current device is touch-enabled
   * Touch devices disable keyboard shortcuts by default
   */
  private detectTouchDevice(): void {
    this.isTouchDevice =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-expect-error - Legacy IE detection
      navigator.msMaxTouchPoints > 0;
  }

  /**
   * Attach global keyboard event listener
   */
  private attachGlobalListener(): void {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Check if keyboard shortcuts are enabled
   */
  get enabled(): boolean {
    return this.isEnabled && !this.isTouchDevice;
  }

  /**
   * Enable or disable keyboard shortcuts
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if current device is touch-enabled
   */
  get touchDevice(): boolean {
    return this.isTouchDevice;
  }

  /**
   * Check if event matches shortcut criteria
   */
  private eventMatchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
    // Check modifier keys
    if (shortcut.metaKey && !(event.metaKey || event.ctrlKey)) return false;
    if (shortcut.shiftKey && !event.shiftKey) return false;
    if (shortcut.altKey && !event.altKey) return false;

    // Check that extra modifiers aren't pressed
    if (!shortcut.metaKey && (event.metaKey || event.ctrlKey)) return false;
    if (!shortcut.shiftKey && event.shiftKey) return false;
    if (!shortcut.altKey && event.altKey) return false;

    // Check key match (case-insensitive)
    return event.key.toLowerCase() === shortcut.key.toLowerCase();
  }

  /**
   * Check if this is a browser-reserved shortcut
   * These shortcuts should be blocked to prevent interference
   */
  private isBrowserReservedShortcut(event: KeyboardEvent): boolean {
    const key = event.key.toLowerCase();
    const hasMeta = event.metaKey || event.ctrlKey;

    if (!hasMeta) return false;

    // Browser shortcuts that should not be overridden
    const reservedShortcuts = [
      'r', // Refresh (Cmd+R, Ctrl+R)
      'w', // Close tab (Cmd+W, Ctrl+W)
      't', // New tab (Cmd+T, Ctrl+T)
      'n', // New window (Cmd+N, Ctrl+N) - only in browsers
      'l', // Focus address bar (Cmd+L, Ctrl+L)
      'd', // Bookmark (Cmd+D, Ctrl+D)
      'p', // Print (Cmd+P, Ctrl+P)
      's', // Save (Cmd+S, Ctrl+S)
    ];

    // Allow these specific shortcuts with additional modifiers
    if (event.shiftKey || event.altKey) return false;

    return reservedShortcuts.includes(key);
  }

  /**
   * Handle global keyboard events
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    // Skip if shortcuts are disabled
    if (!this.enabled) return;

    // Skip if typing in input, textarea, or contenteditable
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable ||
      target.getAttribute('role') === 'textbox'
    ) {
      // Allow Escape to close modals/dropdowns even in inputs
      if (event.key !== 'Escape') return;
    }

    // Check for browser-reserved shortcuts
    if (this.isBrowserReservedShortcut(event)) return;

    // Find matching shortcuts
    const matchingShortcuts: Array<{ registration: ShortcutRegistration; priority: number }> = [];

    for (const registration of this.shortcuts.values()) {
      if (
        this.eventMatchesShortcut(event, registration.shortcut) &&
        (!registration.shortcut.condition || registration.shortcut.condition())
      ) {
        matchingShortcuts.push({
          registration,
          priority: registration.shortcut.priority || 0,
        });
      }
    }

    if (matchingShortcuts.length === 0) return;

    // Sort by priority (higher first)
    matchingShortcuts.sort((a, b) => b.priority - a.priority);

    // Execute highest priority shortcut
    const { registration } = matchingShortcuts[0];
    const { shortcut } = registration;

    if (shortcut.preventDefault !== false) {
      event.preventDefault();
    }

    if (shortcut.stopPropagation !== false) {
      event.stopPropagation();
    }

    shortcut.handler(event);
  };

  /**
   * Register a keyboard shortcut
   *
   * @param shortcut - Shortcut configuration
   * @returns Cleanup function to unregister the shortcut
   */
  register(shortcut: KeyboardShortcut): () => void {
    const registration: ShortcutRegistration = {
      shortcut,
      registeredAt: Date.now(),
    };

    this.shortcuts.set(shortcut.id, registration);

    // Return cleanup function
    return () => {
      this.unregister(shortcut.id);
    };
  }

  /**
   * Unregister a keyboard shortcut
   *
   * @param id - Shortcut identifier
   */
  unregister(id: string): void {
    this.shortcuts.delete(id);
  }

  /**
   * Get all registered shortcuts grouped by category
   */
  getAllShortcuts(): Map<KeyboardShortcut['category'], KeyboardShortcut[]> {
    const grouped = new Map<KeyboardShortcut['category'], KeyboardShortcut[]>();

    for (const registration of this.shortcuts.values()) {
      const { shortcut } = registration;
      const category = shortcut.category;

      if (!grouped.has(category)) {
        grouped.set(category, []);
      }

      grouped.get(category)!.push(shortcut);
    }

    return grouped;
  }

  /**
   * Get shortcut by ID
   */
  getShortcut(id: string): KeyboardShortcut | undefined {
    return this.shortcuts.get(id)?.shortcut;
  }

  /**
   * Clear all registered shortcuts
   */
  clear(): void {
    this.shortcuts.clear();
  }

  /**
   * Get count of registered shortcuts
   */
  get count(): number {
    return this.shortcuts.size;
  }
}

/**
 * Global singleton instance
 */
export const KeyboardShortcutManager = new KeyboardShortcutManagerClass();

/**
 * Format shortcut for display (e.g., "Cmd+K", "Ctrl+/")
 *
 * @param shortcut - Shortcut to format
 * @returns Formatted shortcut string
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  // Detect platform for correct modifier display
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modifierKey = isMac ? 'Cmd' : 'Ctrl';

  if (shortcut.metaKey) parts.push(modifierKey);
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.altKey) parts.push(isMac ? 'Option' : 'Alt');

  // Handle special keys
  const specialKeys: Record<string, string> = {
    ' ': 'Space',
    'escape': 'Esc',
    'arrowup': '↑',
    'arrowdown': '↓',
    'arrowleft': '←',
    'arrowright': '→',
  };

  const keyDisplay = specialKeys[shortcut.key.toLowerCase()] || shortcut.key.toUpperCase();
  parts.push(keyDisplay);

  return parts.join('+');
}

/**
 * Parse shortcut string (e.g., "Cmd+K", "Ctrl+/") into shortcut config
 *
 * @param shortcutString - Shortcut string to parse
 * @returns Partial shortcut configuration
 */
export function parseShortcutString(shortcutString: string): Partial<KeyboardShortcut> {
  const parts = shortcutString.toLowerCase().split('+');
  const config: Partial<KeyboardShortcut> = {};

  for (const part of parts) {
    switch (part) {
      case 'cmd':
      case 'ctrl':
        config.metaKey = true;
        break;
      case 'shift':
        config.shiftKey = true;
        break;
      case 'alt':
      case 'option':
        config.altKey = true;
        break;
      default:
        // The actual key
        config.key = part;
        break;
    }
  }

  return config;
}
