// Import fake-indexeddb BEFORE any code that uses IndexedDB/Dexie
// This provides a mock IndexedDB implementation for tests
import 'fake-indexeddb/auto';

import React from 'react';
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
        'ide.reAuthorize': 'Re-authorize',
        'ide.fsDenied': 'File access denied',
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
        'sidebar.expand': 'Expand',
        'sidebar.collapse': 'Collapse',
        'sidebar.terminal': 'Terminal',
        'sidebar.git': 'Git',
        // Common
        'common.cancel': 'Cancel',
        'common.confirm': 'Confirm',
        'common.save': 'Save',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.close': 'Close',
        'common.loading': 'Loading...',
        'common.error': 'Error',
        // Mobile demo
        'mobileDemo.learnMore': 'Learn more',
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

// Mock @tanstack/react-router for all tests
vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(() => vi.fn()),
  useLocation: vi.fn(() => ({ pathname: '/' })),
  useSearch: vi.fn(() => ({})),
  useParams: vi.fn(() => ({})),
  RouterProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  createRouter: vi.fn(),
  Router: vi.fn(({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children)),
}));

// Mock useCapabilityDetection hook
vi.mock('@/hooks/useCapabilityDetection', () => ({
  useCapabilityDetection: vi.fn(() => ({
    supportsFSA: true,
    supportsWebContainer: true,
    isMobile: false,
  })),
}));

// Mock useWorkspace hook
vi.mock('../../lib/workspace', () => ({
  useWorkspace: vi.fn(() => ({
    directoryHandle: null,
    permissionState: 'granted',
    syncStatus: 'idle',
    syncError: null,
    autoSync: true,
    isOpeningFolder: false,
    openFolder: vi.fn(),
    switchFolder: vi.fn(),
    syncNow: vi.fn(),
    setAutoSync: vi.fn(),
    projectMetadata: null,
  })),
  WorkspaceProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

// Mock useIDEStore (Zustand store)
vi.mock('@/lib/state', () => ({
  useIDEStore: vi.fn((selector) => {
    const state = {
      projectId: 'test-project',
      openFiles: [],
      activeFile: null,
      expandedPaths: new Set<string>(),
      panelLayouts: {},
      terminalTab: 'terminal',
      chatVisible: true,
      activeFileScrollTop: 0,
      // Actions
      setProjectId: vi.fn(),
      addOpenFile: vi.fn(),
      removeOpenFile: vi.fn(),
      setActiveFile: vi.fn(),
      toggleExpanded: vi.fn(),
      setExpandedPaths: vi.fn(),
      setPanelLayout: vi.fn(),
      setTerminalTab: vi.fn(),
      toggleChatVisible: vi.fn(),
      setChatVisible: vi.fn(),
      setActiveFileScrollTop: vi.fn(),
      reset: vi.fn(),
    };
    if (typeof selector === 'function') {
      return selector(state);
    }
    return state;
  }),
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