/**
 * @fileoverview Plugin Coordination Store - Cross-plugin state management
 * @module infrastructure/persistence/stores/plugin-coordination-store
 *
 * **EPIC-0.6-01**: Plugin Coordination Context Foundation
 * **EPIC-0.6-03**: Write-Lock Mechanism
 *
 * Zustand store for coordinating state across plugins:
 * - Active document tracking (shared across Monaco, Notes, FileTree)
 * - Write locks (prevent concurrent edits)
 * - Deferred capabilities (queue events for offline plugins)
 *
 * @epic EPIC-0.6
 * @story 0.6-01, 0.6-03
 * @team Team A
 * @created 2026-01-27
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PluginId } from '@/domain/types/plugin-types';
import type {
  PluginCoordinationStore,
  SharedDocument,
  OpenDocumentInfo,
  DeferredCapabilities,
} from '@/domain/types/plugin-coordination.types';
import {
  DEFAULT_WRITE_LOCK_TIMEOUT,
  MAX_DEFERRED_URLS,
  MAX_OPEN_DOCUMENTS,
} from '@/domain/types/plugin-coordination.types';

// ============================================================================
// Initial State
// ============================================================================

const initialDeferredCapabilities: DeferredCapabilities = {
  previewUrls: [],
  terminalSessions: [],
};

// ============================================================================
// Store Implementation
// ============================================================================

/**
 * Plugin Coordination Store
 *
 * @remarks
 * Central store for cross-plugin coordination.
 * Uses persist middleware to maintain state across page refreshes.
 *
 * Key responsibilities:
 * 1. Track active document (single source of truth)
 * 2. Track which plugins have which files open
 * 3. Manage write locks to prevent conflicts
 * 4. Queue deferred events for offline plugins
 */
export const usePluginCoordinationStore = create<PluginCoordinationStore>()(
  persist(
    (set, get) => ({
      // ========================================================================
      // Initial State
      // ========================================================================

      activeDocument: null,
      openDocuments: new Map(),
      processes: new Map(),
      devServers: new Map(),
      deferredCapabilities: initialDeferredCapabilities,

      // ========================================================================
      // Document Actions
      // ========================================================================

      openDocument: (path: string, pluginId: PluginId) => {
        console.log('[PluginCoordination] openDocument:', { path, pluginId });

        set((state) => {
          const openDocuments = new Map(state.openDocuments);
          const existing = openDocuments.get(path) || [];

          // Check if this plugin already has the document open
          if (existing.some((doc) => doc.pluginId === pluginId)) {
            console.log('[PluginCoordination] Plugin already has document open:', pluginId);
            return state;
          }

          // Enforce max open documents limit
          if (openDocuments.size >= MAX_OPEN_DOCUMENTS) {
            // Remove oldest document
            const oldest = Array.from(openDocuments.entries())
              .sort((a, b) => {
                const aTime = Math.min(...a[1].map((d) => d.openedAt));
                const bTime = Math.min(...b[1].map((d) => d.openedAt));
                return aTime - bTime;
              })[0];
            if (oldest) {
              openDocuments.delete(oldest[0]);
              console.log('[PluginCoordination] Evicted oldest document:', oldest[0]);
            }
          }

          // Add new entry
          const newEntry: OpenDocumentInfo = {
            path,
            pluginId,
            openedAt: Date.now(),
            hasUnsavedChanges: false,
          };

          openDocuments.set(path, [...existing, newEntry]);

          // Also update activeDocument.openedBy if this is the active document
          let activeDocument = state.activeDocument;
          if (activeDocument && activeDocument.path === path) {
            activeDocument = {
              ...activeDocument,
              openedBy: [...activeDocument.openedBy, pluginId],
            };
          }

          return { openDocuments, activeDocument };
        });
      },

      closeDocument: (path: string, pluginId: PluginId) => {
        console.log('[PluginCoordination] closeDocument:', { path, pluginId });

        set((state) => {
          const openDocuments = new Map(state.openDocuments);
          const existing = openDocuments.get(path);

          if (!existing) {
            return state;
          }

          // Remove this plugin from the list
          const filtered = existing.filter((doc) => doc.pluginId !== pluginId);

          if (filtered.length === 0) {
            // No more plugins have this document open
            openDocuments.delete(path);
          } else {
            openDocuments.set(path, filtered);
          }

          // Update activeDocument.openedBy if this is the active document
          let activeDocument = state.activeDocument;
          if (activeDocument && activeDocument.path === path) {
            activeDocument = {
              ...activeDocument,
              openedBy: activeDocument.openedBy.filter((id) => id !== pluginId),
            };
          }

          return { openDocuments, activeDocument };
        });
      },

      setActiveDocument: (path: string, content: string) => {
        console.log('[PluginCoordination] setActiveDocument:', path);

        set((state) => {
          const existingEditors = state.openDocuments.get(path);
          const openedBy: PluginId[] = existingEditors
            ? existingEditors.map((e) => e.pluginId)
            : [];

          const activeDocument: SharedDocument = {
            path,
            content,
            lastModified: Date.now(),
            openedBy,
            writeLock: null,
          };

          return { activeDocument };
        });
      },

      updateActiveDocumentContent: (content: string) => {
        set((state) => {
          if (!state.activeDocument) {
            return state;
          }

          return {
            activeDocument: {
              ...state.activeDocument,
              content,
              lastModified: Date.now(),
            },
          };
        });
      },

      clearActiveDocument: () => {
        console.log('[PluginCoordination] clearActiveDocument');
        set({ activeDocument: null });
      },

      // ========================================================================
      // Write Lock Actions (EPIC-0.6-03)
      // ========================================================================

      acquireWriteLock: (path: string, pluginId: PluginId): boolean => {
        const state = get();
        const { activeDocument } = state;

        console.log('[PluginCoordination] acquireWriteLock:', { path, pluginId });

        // Can only lock the active document
        if (!activeDocument || activeDocument.path !== path) {
          console.log('[PluginCoordination] Cannot lock - not active document');
          return false;
        }

        // If no lock exists, grant it
        if (!activeDocument.writeLock) {
          set({
            activeDocument: {
              ...activeDocument,
              writeLock: {
                path,
                holder: pluginId,
                acquiredAt: Date.now(),
                timeout: DEFAULT_WRITE_LOCK_TIMEOUT,
              },
            },
          });
          console.log('[PluginCoordination] Lock acquired by:', pluginId);
          return true;
        }

        // If this plugin already has the lock, return true
        if (activeDocument.writeLock.holder === pluginId) {
          console.log('[PluginCoordination] Plugin already holds lock:', pluginId);
          return true;
        }

        // Check if lock is stale (exceeded timeout)
        const lockAge = Date.now() - activeDocument.writeLock.acquiredAt;
        if (lockAge > activeDocument.writeLock.timeout) {
          // Lock is stale, force release and grant to new plugin
          console.log('[PluginCoordination] Stale lock detected, forcing release');
          set({
            activeDocument: {
              ...activeDocument,
              writeLock: {
                path,
                holder: pluginId,
                acquiredAt: Date.now(),
                timeout: DEFAULT_WRITE_LOCK_TIMEOUT,
              },
            },
          });
          return true;
        }

        // Lock is held by another plugin
        console.log('[PluginCoordination] Lock held by:', activeDocument.writeLock.holder);
        return false;
      },

      releaseWriteLock: (path: string, pluginId: PluginId) => {
        console.log('[PluginCoordination] releaseWriteLock:', { path, pluginId });

        set((state) => {
          const { activeDocument } = state;

          if (!activeDocument || activeDocument.path !== path) {
            return state;
          }

          // Only release if this plugin holds the lock
          if (activeDocument.writeLock?.holder !== pluginId) {
            console.log('[PluginCoordination] Cannot release - not lock holder');
            return state;
          }

          return {
            activeDocument: {
              ...activeDocument,
              writeLock: null,
            },
          };
        });
      },

      forceReleaseWriteLock: (path: string) => {
        console.log('[PluginCoordination] forceReleaseWriteLock:', path);

        set((state) => {
          const { activeDocument } = state;

          if (!activeDocument || activeDocument.path !== path) {
            return state;
          }

          return {
            activeDocument: {
              ...activeDocument,
              writeLock: null,
            },
          };
        });
      },

      hasWriteLock: (path: string, pluginId: PluginId): boolean => {
        const { activeDocument } = get();

        if (!activeDocument || activeDocument.path !== path) {
          return false;
        }

        return activeDocument.writeLock?.holder === pluginId;
      },

      // ========================================================================
      // Deferred Capabilities Actions (EPIC-0.6-09)
      // ========================================================================

      queuePreviewUrl: (url: string) => {
        console.log('[PluginCoordination] queuePreviewUrl:', url);

        set((state) => {
          const previewUrls = [...state.deferredCapabilities.previewUrls, url];

          // Enforce max queue size
          if (previewUrls.length > MAX_DEFERRED_URLS) {
            previewUrls.shift(); // Remove oldest
          }

          return {
            deferredCapabilities: {
              ...state.deferredCapabilities,
              previewUrls,
            },
          };
        });
      },

      consumePreviewUrl: (): string | null => {
        const state = get();
        const { previewUrls } = state.deferredCapabilities;

        if (previewUrls.length === 0) {
          return null;
        }

        const url = previewUrls[0];

        set({
          deferredCapabilities: {
            ...state.deferredCapabilities,
            previewUrls: previewUrls.slice(1),
          },
        });

        console.log('[PluginCoordination] consumePreviewUrl:', url);
        return url;
      },

      // ========================================================================
      // Query Actions
      // ========================================================================

      getEditorsForPath: (path: string): PluginId[] => {
        const { openDocuments } = get();
        const entries = openDocuments.get(path);
        return entries ? entries.map((e) => e.pluginId) : [];
      },

      isPathOpen: (path: string): boolean => {
        const { openDocuments } = get();
        return openDocuments.has(path);
      },

      getWriteLockHolder: (path: string): PluginId | null => {
        const { activeDocument } = get();

        if (!activeDocument || activeDocument.path !== path) {
          return null;
        }

        return activeDocument.writeLock?.holder ?? null;
      },
    }),
    {
      name: 'plugin-coordination-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persist only these fields (not transient state)
        activeDocument: state.activeDocument,
        deferredCapabilities: state.deferredCapabilities,
        // Note: openDocuments is a Map, needs custom serialization
        // For now, don't persist it - will be rebuilt on plugin mount
      }),
      // Custom serialization for Map types
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Ensure Map types are properly initialized after rehydration
          if (!(state.openDocuments instanceof Map)) {
            state.openDocuments = new Map();
          }
          if (!(state.processes instanceof Map)) {
            state.processes = new Map();
          }
          if (!(state.devServers instanceof Map)) {
            state.devServers = new Map();
          }
        }
      },
    }
  )
);

// ============================================================================
// Individual Selectors (Optimized Re-renders)
// ============================================================================

/** Get active document */
export const useActiveDocument = () =>
  usePluginCoordinationStore((s) => s.activeDocument);

/** Get active document path */
export const useActiveDocumentPath = () =>
  usePluginCoordinationStore((s) => s.activeDocument?.path ?? null);

/** Get write lock holder for active document */
export const useActiveWriteLockHolder = () =>
  usePluginCoordinationStore((s) => s.activeDocument?.writeLock?.holder ?? null);

/** Check if active document has unsaved changes */
export const useHasUnsavedChanges = () =>
  usePluginCoordinationStore((s) => {
    const activeDoc = s.activeDocument;
    if (!activeDoc) return false;
    const entries = s.openDocuments.get(activeDoc.path);
    return entries?.some((e) => e.hasUnsavedChanges) ?? false;
  });

// ============================================================================
// Action Selectors
// ============================================================================

export const useOpenDocument = () =>
  usePluginCoordinationStore((s) => s.openDocument);

export const useCloseDocument = () =>
  usePluginCoordinationStore((s) => s.closeDocument);

export const useSetActiveDocument = () =>
  usePluginCoordinationStore((s) => s.setActiveDocument);

export const useAcquireWriteLock = () =>
  usePluginCoordinationStore((s) => s.acquireWriteLock);

export const useReleaseWriteLock = () =>
  usePluginCoordinationStore((s) => s.releaseWriteLock);

export const useGetEditorsForPath = () =>
  usePluginCoordinationStore((s) => s.getEditorsForPath);

export const useQueuePreviewUrl = () =>
  usePluginCoordinationStore((s) => s.queuePreviewUrl);

export const useConsumePreviewUrl = () =>
  usePluginCoordinationStore((s) => s.consumePreviewUrl);
