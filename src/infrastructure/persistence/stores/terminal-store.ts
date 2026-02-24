/**
 * @fileoverview Terminal Store
 * @module infrastructure/persistence/stores/terminal-store
 *
 * Zustand store for terminal state management:
 * - Multiple terminal tabs
 * - Terminal visibility
 * - Terminal settings (font size, theme)
 * - Command history persistence
 * - Working directory tracking
 *
 * @story S-036 Terminal/Console Integration
 * @governance ADR-024 Clean Architecture
 */

import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';

/**
 * Terminal tab state
 */
export interface TerminalTab {
  /** Unique tab ID */
  id: string;
  /** Tab name (default: Terminal 1, 2, etc.) */
  name: string;
  /** Current working directory */
  cwd: string;
  /** Whether shell has started */
  isShellStarted: boolean;
  /** Whether tab is active/focused */
  isActive: boolean;
  /** Command history for this tab */
  history: string[];
  /** Creation timestamp */
  createdAt: number;
}

/**
 * Terminal settings
 */
export interface TerminalSettings {
  /** Font size in pixels */
  fontSize: number;
  /** Terminal theme */
  theme: 'light' | 'dark';
  /** Scrollback buffer size */
  scrollback: number;
  /** Enable web links */
  enableWebLinks: boolean;
  /** Enable bell sound */
  enableBell: boolean;
  /** Default shell */
  defaultShell: 'jsh' | 'bash' | 'zsh';
}

/**
 * Terminal store state
 */
export interface TerminalState {
  // ==========================================================================
  // Terminal Tabs
  // ==========================================================================

  /** All terminal tabs */
  tabs: TerminalTab[];
  /** Active tab ID */
  activeTabId: string | null;
  /** Next tab number for naming */
  nextTabNumber: number;

  // ==========================================================================
  // Terminal Panel
  // ==========================================================================

  /** Whether terminal panel is visible */
  isVisible: boolean;
  /** Terminal panel height in pixels */
  panelHeight: number;
  /** Whether terminal is maximized */
  isMaximized: boolean;

  // ==========================================================================
  // Settings
  // ==========================================================================

  /** Terminal settings */
  settings: TerminalSettings;

  // ==========================================================================
  // Actions - Tab Management
  // ==========================================================================

  /** Create a new terminal tab */
  createTab: (cwd?: string) => string;
  /** Close a terminal tab */
  closeTab: (tabId: string) => void;
  /** Set active tab */
  setActiveTab: (tabId: string) => void;
  /** Rename a tab */
  renameTab: (tabId: string, name: string) => void;
  /** Update tab working directory */
  updateTabCwd: (tabId: string, cwd: string) => void;
  /** Set shell started status */
  setShellStarted: (tabId: string, started: boolean) => void;
  /** Add command to tab history */
  addCommandToHistory: (tabId: string, command: string) => void;

  // ==========================================================================
  // Actions - Panel Management
  // ==========================================================================

  /** Toggle terminal panel visibility */
  toggleTerminal: () => void;
  /** Show terminal panel */
  showTerminal: () => void;
  /** Hide terminal panel */
  hideTerminal: () => void;
  /** Set panel height */
  setPanelHeight: (height: number) => void;
  /** Toggle terminal maximized state */
  toggleMaximize: () => void;

  // ==========================================================================
  // Actions - Settings
  // ==========================================================================

  /** Update terminal settings */
  updateSettings: (settings: Partial<TerminalSettings>) => void;
  /** Reset settings to defaults */
  resetSettings: () => void;
}

/**
 * Default terminal settings
 */
const DEFAULT_SETTINGS: TerminalSettings = {
  fontSize: 14,
  theme: 'dark',
  scrollback: 1000,
  enableWebLinks: true,
  enableBell: false,
  defaultShell: 'jsh',
};

/**
 * Create terminal store slice
 */
export const createTerminalStore: StateCreator<TerminalState, [], []> = (set, get) => ({
  // ==========================================================================
  // Initial State
  // ==========================================================================

  tabs: [],
  activeTabId: null,
  nextTabNumber: 1,
  isVisible: false,
  panelHeight: 300,
  isMaximized: false,
  settings: DEFAULT_SETTINGS,

  // ==========================================================================
  // Actions - Tab Management
  // ==========================================================================

  createTab: (cwd = '/') => {
    const tabId = `terminal-${Date.now()}`;
    const tabNumber = get().nextTabNumber;
    const tab: TerminalTab = {
      id: tabId,
      name: `Terminal ${tabNumber}`,
      cwd,
      isShellStarted: false,
      isActive: true,
      history: [],
      createdAt: Date.now(),
    };

    set((state) => ({
      tabs: [...state.tabs, tab],
      activeTabId: tabId,
      nextTabNumber: tabNumber + 1,
    }));

    return tabId;
  },

  closeTab: (tabId: string) => {
    set((state) => {
      const tabs = state.tabs.filter((tab) => tab.id !== tabId);

      // If closing active tab, switch to another
      let newActiveTabId = state.activeTabId;
      if (state.activeTabId === tabId) {
        newActiveTabId = tabs.length > 0 ? tabs[tabs.length - 1].id : null;
      }

      return {
        tabs,
        activeTabId: newActiveTabId,
      };
    });
  },

  setActiveTab: (tabId: string) => {
    set((state) => ({
      activeTabId: tabId,
      tabs: state.tabs.map((tab) => ({
        ...tab,
        isActive: tab.id === tabId,
      })),
    }));
  },

  renameTab: (tabId: string, name: string) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, name } : tab
      ),
    }));
  },

  updateTabCwd: (tabId: string, cwd: string) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, cwd } : tab
      ),
    }));
  },

  setShellStarted: (tabId: string, started: boolean) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, isShellStarted: started } : tab
      ),
    }));
  },

  addCommandToHistory: (tabId: string, command: string) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId
          ? { ...tab, history: [...tab.history, command].slice(-1000) }
          : tab
      ),
    }));
  },

  // ==========================================================================
  // Actions - Panel Management
  // ==========================================================================

  toggleTerminal: () => {
    set((state) => ({
      isVisible: !state.isVisible,
    }));
  },

  showTerminal: () => {
    set({ isVisible: true });
  },

  hideTerminal: () => {
    set({ isVisible: false });
  },

  setPanelHeight: (height: number) => {
    set({ panelHeight: Math.max(100, Math.min(800, height)) });
  },

  toggleMaximize: () => {
    set((state) => ({
      isMaximized: !state.isMaximized,
    }));
  },

  // ==========================================================================
  // Actions - Settings
  // ==========================================================================

  updateSettings: (newSettings: Partial<TerminalSettings>) => {
    set((state) => ({
      settings: {
        ...state.settings,
        ...newSettings,
      },
    }));
  },

  resetSettings: () => {
    set({ settings: DEFAULT_SETTINGS });
  },
});

/**
 * Terminal store with persistence
 */
/**
 * Terminal store with persistence
 * 
 * STATE-009 FIX (2026-01-19): Migrated from localStorage to Dexie storage
 * - localStorage was causing workspace access infection
 * - Dexie provides consistent persistence across all stores
 * - Uses 'terminalState' table in ViaGentDatabase
 */
export const useTerminalStore = create<TerminalState>()(
  persist(
    createTerminalStore,
    {
      name: 'terminal-storage',
      storage: createJSONStorage(() => createDexieStorage('terminalState')),
    }
  )
);
