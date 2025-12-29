// Import fake-indexeddb BEFORE any code that uses IndexedDB/Dexie
// This provides a mock IndexedDB implementation for tests
import 'fake-indexeddb/auto';

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock react-i18next for all tests
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      // Simple mock that returns the key or a proper mock value
      const translations: Record<string, string> = {
        // IDE layout
        'ide.hideChat': 'Hide chat',
        'ide.showChat': 'Show chat',
        'ide.toggleChatShortcut': 'Toggle chat (Ctrl+B)',
        'ide.openFolder': 'Open folder',
        'ide.syncError': 'Sync error',
        'ide.syncFolder': 'Sync folder',
        'ide.autoSync': 'Auto-sync',
        'ide.syncNow': 'Sync now',
        'ide.switchFolder': 'Switch folder',
        'ide.minViewportWarning': 'Screen Too Small',
        'ide.minViewportMessage': 'This application requires a minimum viewport width of 320px to function properly.',
        // Panel headers
        'explorer.title': 'Explorer',
        'editor.title': 'Editor',
        'preview.title': 'Preview',
        'terminal.title': 'Terminal',
        'chat.title': 'Chat',
        // Status
        'status.syncing': 'Syncing',
        'status.syncingFile': 'Syncing: {{file}}',
        'status.error': 'Error',
        'status.notSynced': 'Not synced',
        'status.lastSynced': 'Last synced',
        'errors.syncRetry': 'Click to retry',
        'errors.sync.retry.description': 'Sync failed. Click to retry.',
        // Time
        'time.justNow': 'Just now',
        'time.agoSeconds': '{{count}}s ago',
        'time.agoMinutes': '{{count}}m ago',
        'time.agoHours': '{{count}}h ago',
        // Sidebar
        'sidebar.home': 'Home',
        'sidebar.explorer': 'Explorer',
        'sidebar.search': 'Search',
        'sidebar.agents': 'Agents',
        'sidebar.chat': 'Chat',
        'sidebar.settings': 'Settings',
        // Common
        'common.cancel': 'Cancel',
        'common.confirm': 'Confirm',
        'common.save': 'Save',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.close': 'Close',
        'common.loading': 'Loading...',
        'common.error': 'Error',
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

// Mock window.matchMedia (only in browser environment)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(),
}));

// Mock crypto.getRandomValues for Node.js environment
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
    randomUUID: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
  },
  writable: true,
  configurable: true,
});