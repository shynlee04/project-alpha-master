/**
 * @fileoverview File Watcher Store
 * @module infrastructure/persistence/stores/file-watcher-store
 *
 * Zustand store for file watcher state and configuration.
 * Manages watch settings, tracked files, and change events.
 *
 * @story S-039 - File Watcher with Auto-Reload and Change Detection
 * @architecture Zustand v5 with individual selectors
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FileChangeEvent, FileWatcherConfig } from '@/lib/watcher/file-watcher';

/**
 * Watched file state
 */
export interface WatchedFileState {
  path: string;
  isWatching: boolean;
  hasUnsavedChanges: boolean;
  lastDetectedChange: FileChangeEvent | null;
  contentType: 'code' | 'config' | 'asset' | 'binary';
}

/**
 * Pending change notification
 */
export interface PendingChange {
  path: string;
  changeType: 'created' | 'modified' | 'deleted' | 'moved';
  contentType: 'code' | 'config' | 'asset' | 'binary';
  timestamp: number;
  hasUnsavedChanges: boolean;
}

/**
 * File watcher store state
 */
export interface FileWatcherStore {
  // Configuration
  config: FileWatcherConfig;

  // Tracked files
  watchedFiles: Map<string, WatchedFileState>;

  // Pending changes (waiting for user action)
  pendingChanges: Map<string, PendingChange>;

  // UI state
  showChangeDialog: boolean;
  activeChangePath: string | null;

  // Actions
  setConfig: (config: Partial<FileWatcherConfig>) => void;
  setEnabled: (enabled: boolean) => void;
  setAutoReload: (autoReload: boolean) => void;

  // File tracking
  startWatching: (path: string, contentType: 'code' | 'config' | 'asset' | 'binary') => void;
  stopWatching: (path: string) => void;
  stopWatchingAll: () => void;
  updateWatchedFile: (path: string, updates: Partial<WatchedFileState>) => void;

  // Change handling
  addPendingChange: (change: PendingChange) => void;
  removePendingChange: (path: string) => void;
  clearPendingChanges: () => void;

  // Unsaved changes
  setUnsavedChanges: (path: string, hasUnsaved: boolean) => void;

  // Dialog state
  showChangeDialogFor: (path: string) => void;
  hideChangeDialog: () => void;

  // Computed getters
  getWatchedFile: (path: string) => WatchedFileState | undefined;
  getPendingChange: (path: string) => PendingChange | undefined;
  isWatchingFile: (path: string) => boolean;
}

/**
 * Create file watcher store with persistence
 */
export const useFileWatcherStore = create<FileWatcherStore>()(
  persist(
    (set, get) => ({
      // Initial configuration
      config: {
        enabled: true,
        autoReload: false,
        pollingInterval: 2000,
        includePatterns: ['src/**/*.{ts,tsx,js,jsx}', 'public/**/*.{json,html,css}', '*.{json,md,txt,yml,yaml}'],
        excludePatterns: ['node_modules/**', '.git/**', 'dist/**', 'build/**', '*.log', '.DS_Store']
      },

      // Tracked files
      watchedFiles: new Map(),
      pendingChanges: new Map(),

      // UI state
      showChangeDialog: false,
      activeChangePath: null,

      // Configuration actions
      setConfig: (configUpdate) => {
        set(state => ({
          config: { ...state.config, ...configUpdate }
        }));
      },

      setEnabled: (enabled) => {
        set(state => ({
          config: { ...state.config, enabled }
        }));
      },

      setAutoReload: (autoReload) => {
        set(state => ({
          config: { ...state.config, autoReload }
        }));
      },

      // File tracking actions
      startWatching: (path, contentType) => {
        set(state => {
          const newWatchedFiles = new Map(state.watchedFiles);
          newWatchedFiles.set(path, {
            path,
            isWatching: true,
            hasUnsavedChanges: false,
            lastDetectedChange: null,
            contentType
          });
          return { watchedFiles: newWatchedFiles };
        });
      },

      stopWatching: (path) => {
        set(state => {
          const newWatchedFiles = new Map(state.watchedFiles);
          newWatchedFiles.delete(path);
          return { watchedFiles: newWatchedFiles };
        });
      },

      stopWatchingAll: () => {
        set({ watchedFiles: new Map() });
      },

      updateWatchedFile: (path, updates) => {
        set(state => {
          const newWatchedFiles = new Map(state.watchedFiles);
          const existing = newWatchedFiles.get(path);
          if (existing) {
            newWatchedFiles.set(path, { ...existing, ...updates });
          }
          return { watchedFiles: newWatchedFiles };
        });
      },

      // Change handling
      addPendingChange: (change) => {
        set(state => {
          const newPendingChanges = new Map(state.pendingChanges);
          newPendingChanges.set(change.path, change);
          return { pendingChanges: newPendingChanges };
        });
      },

      removePendingChange: (path) => {
        set(state => {
          const newPendingChanges = new Map(state.pendingChanges);
          newPendingChanges.delete(path);
          return { pendingChanges: newPendingChanges };
        });
      },

      clearPendingChanges: () => {
        set({ pendingChanges: new Map() });
      },

      // Unsaved changes
      setUnsavedChanges: (path, hasUnsaved) => {
        set(state => {
          const newWatchedFiles = new Map(state.watchedFiles);
          const existing = newWatchedFiles.get(path);
          if (existing) {
            newWatchedFiles.set(path, { ...existing, hasUnsavedChanges: hasUnsaved });
          }
          return { watchedFiles: newWatchedFiles };
        });
      },

      // Dialog state
      showChangeDialogFor: (path) => {
        set({
          showChangeDialog: true,
          activeChangePath: path
        });
      },

      hideChangeDialog: () => {
        set({
          showChangeDialog: false,
          activeChangePath: null
        });
      },

      // Computed getters (used in hooks)
      getWatchedFile: (path) => {
        return get().watchedFiles.get(path);
      },

      getPendingChange: (path) => {
        return get().pendingChanges.get(path);
      },

      isWatchingFile: (path) => {
        return get().watchedFiles.has(path);
      }
    }),
    {
      name: 'file-watcher-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist config, not runtime state
      partialize: (state): Partial<FileWatcherStore> => ({
        config: state.config
      })
    }
  )
);

/**
 * Individual selectors for Zustand v5
 */
export const useFileWatcherConfig = () => useFileWatcherStore(s => s.config);
export const useFileWatcherEnabled = () => useFileWatcherStore(s => s.config.enabled);
export const useFileWatcherAutoReload = () => useFileWatcherStore(s => s.config.autoReload);
export const useWatchedFiles = () => useFileWatcherStore(s => s.watchedFiles);
export const usePendingChanges = () => useFileWatcherStore(s => s.pendingChanges);
export const useShowChangeDialog = () => useFileWatcherStore(s => s.showChangeDialog);
export const useActiveChangePath = () => useFileWatcherStore(s => s.activeChangePath);

/**
 * Action selectors
 */
export const useSetFileWatcherConfig = () => useFileWatcherStore(s => s.setConfig);
export const useSetFileWatcherEnabled = () => useFileWatcherStore(s => s.setEnabled);
export const useSetFileWatcherAutoReload = () => useFileWatcherStore(s => s.setAutoReload);
export const useStartWatching = () => useFileWatcherStore(s => s.startWatching);
export const useStopWatching = () => useFileWatcherStore(s => s.stopWatching);
export const useStopWatchingAll = () => useFileWatcherStore(s => s.stopWatchingAll);
export const useAddPendingChange = () => useFileWatcherStore(s => s.addPendingChange);
export const useRemovePendingChange = () => useFileWatcherStore(s => s.removePendingChange);
export const useSetUnsavedChanges = () => useFileWatcherStore(s => s.setUnsavedChanges);
export const useShowChangeDialogFor = () => useFileWatcherStore(s => s.showChangeDialogFor);
export const useHideChangeDialog = () => useFileWatcherStore(s => s.hideChangeDialog);

/**
 * Computed selectors
 */
export const useIsWatchingFile = (path: string) =>
  useFileWatcherStore(s => s.isWatchingFile(path));

export const useWatchedFileState = (path: string) =>
  useFileWatcherStore(s => s.getWatchedFile(path));

export const usePendingChangeFor = (path: string) =>
  useFileWatcherStore(s => s.getPendingChange(path));
