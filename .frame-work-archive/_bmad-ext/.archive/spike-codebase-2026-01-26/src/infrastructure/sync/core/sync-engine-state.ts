/**
 * @fileoverview Sync Engine State - State management for SyncEngine
 * @module infrastructure/sync/core/sync-engine-state
 *
 * Handles state tracking, event subscriptions, and accessor methods.
 */

import type { SyncEngineState } from './sync-engine-types';
import { syncEventBus } from './sync-events';
import type { StorageAdapter } from './sync-types';

// ============================================================================
// State Management
// ============================================================================

export interface StateManagerConfig {
  adapters: SyncEngineConfig['adapters'];
  debugMode: boolean;
}

export type StateUpdater = (update: Partial<SyncEngineState>) => void;

/**
 * Create initial sync engine state
 */
export function createInitialState(): SyncEngineState {
  return {
    isSyncing: false,
    direction: null,
    current: 0,
    total: 0,
    currentFile: null,
    lastResult: null,
    lastError: null,
  };
}

/**
 * Subscribe to event bus for internal state tracking
 * @param updateState - State update callback
 * @returns Array of unsubscribe functions
 */
export function subscribeToEvents(updateState: StateUpdater): Array<() => void> {
  const unsubscribers: Array<() => void> = [];

  // Track sync started
  unsubscribers.push(
    syncEventBus.on('sync:started', (data: any) => {
      updateState({
        isSyncing: true,
        direction: data.direction,
        total: data.totalFiles,
        current: 0,
      });
    })
  );

  // Track sync progress
  unsubscribers.push(
    syncEventBus.on('sync:progress', (data: any) => {
      updateState({
        current: data.current,
        currentFile: data.currentFile ?? null,
      });
    })
  );

  // Track sync completion
  unsubscribers.push(
    syncEventBus.on('sync:completed', (data: any) => {
      updateState({
        isSyncing: false,
        current: data.totalFiles,
        lastError: null,
      });
    })
  );

  // Track sync failure
  unsubscribers.push(
    syncEventBus.on('sync:failed', (data: any) => {
      updateState({
        isSyncing: false,
        lastError: new Error(data.error),
      });
    })
  );

  return unsubscribers;
}

// ============================================================================
// Adapter Accessors
// ============================================================================

/**
 * Check if engine is ready for sync
 */
export function isReady(adapters: SyncEngineConfig['adapters']): boolean {
  return (
    adapters.fsa.isAvailable?.() ??
    adapters.idb.isAvailable?.() ?? true
  );
}

/**
 * Check adapter availability
 */
export function isAdapterAvailable(
  adapters: SyncEngineConfig['adapters'],
  adapter: 'fsa' | 'idb' | 'webcontainer'
): boolean {
  const a = adapters[adapter];
  return a ? (a.isAvailable?.() ?? true) : false;
}

/**
 * Get adapter instance
 */
export function getAdapter(
  adapters: SyncEngineConfig['adapters'],
  adapter: 'fsa' | 'idb' | 'webcontainer'
): StorageAdapter | undefined {
  return adapters[adapter];
}

/**
 * Reset state to initial values
 */
export function resetState(): SyncEngineState {
  return {
    isSyncing: false,
    direction: null,
    current: 0,
    total: 0,
    currentFile: null,
    lastResult: null,
    lastError: null,
  };
}

// Type import for type correctness
type SyncEngineConfig = import('./sync-engine-types').SyncEngineConfig;
