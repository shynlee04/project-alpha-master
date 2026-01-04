/**
 * @fileoverview Sync Engine - Core Sync Orchestration
 * @module infrastructure/sync/core/sync-engine-core
 *
 * Main orchestrator for all sync operations. Brings together adapters,
 * strategies, and event emission to provide a unified sync interface.
 *
 * **Critical Integration:**
 * - Emits events for ALL sync state changes (no mock data in UI)
 * - Calls Zustand store methods for UI updates
 * - Coordinates between FSA, IndexedDB, and WebContainer adapters
 *
 * **Architecture:**
 * - Adapters: Storage backends (FSA, IDB, WebContainer)
 * - Strategies: Bidirectional sync, conflict resolution
 * - Event Bus: Emits events for UI consumption
 *
 * @example
 * ```ts
 * import { SyncEngine } from '@/infrastructure/sync/core/sync-engine-core';
 *
 * const engine = new SyncEngine({
 *   adapters: { fsa: fsaAdapter, idb: idbAdapter },
 *   defaults: { direction: 'bidirectional', conflictStrategy: 'last-write-wins' },
 * });
 *
 * const result = await engine.sync();
 * console.log(`Synced ${result.syncedFiles} files`);
 * ```
 */

import type {
  StorageAdapter,
  SyncOptions,
  SyncResult,
  ConflictStrategy,
  FileChangeCallback,
} from './sync-types';
import type { SyncEngineConfig, SyncEngineState } from './sync-engine-types';
import { syncEventBus } from './sync-events';
import { BidirectionalSync, createBidirectionalSync } from '../strategies/bidirectional-sync';
import { ConflictResolver, createConflictResolver } from '../strategies/conflict-resolution';

// ============================================================================
// Sync Engine Implementation
// ============================================================================

/**
 * Sync Engine - Core Orchestrator
 *
 * Coordinates sync between multiple storage adapters with:
 * - Configurable sync directions and conflict strategies
 * - Event emission for UI integration
 * - Progress tracking and error handling
 */
export class SyncEngine {
  private adapters: SyncEngineConfig['adapters'];
  private defaults: Partial<SyncOptions>;
  private debugMode: boolean;
  private state: SyncEngineState;
  private bidirectionalSync: BidirectionalSync;
  private conflictResolver: ConflictResolver;

  // Event subscription for cleanup
  private eventUnsubscribers: Array<() => void> = [];

  constructor(config: SyncEngineConfig) {
    this.adapters = config.adapters;
    this.defaults = config.defaults ?? {};
    this.debugMode = config.debug ?? false;

    // Initialize state
    this.state = {
      isSyncing: false,
      direction: null,
      current: 0,
      total: 0,
      currentFile: null,
      lastResult: null,
      lastError: null,
    };

    // Initialize strategies
    this.bidirectionalSync = createBidirectionalSync(
      this.adapters.fsa,
      this.adapters.idb,
      this.debugMode
    );
    this.conflictResolver = createConflictResolver();

    // Subscribe to event bus for state tracking
    this.subscribeToEvents();
  }

  /**
   * Get current engine state
   */
  getState(): Readonly<SyncEngineState> {
    return { ...this.state };
  }

  /**
   * Check if engine is ready for sync
   */
  isReady(): boolean {
    return (
      this.adapters.fsa.isAvailable?.() ??
      this.adapters.idb.isAvailable?.() ?? true
    );
  }

  /**
   * Execute sync operation
   * @param options - Sync options (overrides defaults)
   * @returns Sync result
   */
  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    // Merge with defaults
    const mergedOptions: SyncOptions = {
      direction: this.defaults.direction ?? 'bidirectional',
      conflictStrategy: this.defaults.conflictStrategy ?? 'last-write-wins',
      exclusions: this.defaults.exclusions ?? [],
      batchSize: this.defaults.batchSize ?? 50,
      debounceMs: this.defaults.debounceMs ?? 300,
      emitEvents: this.defaults.emitEvents ?? true,
      showProgress: this.defaults.showProgress ?? true,
      maxConcurrent: this.defaults.maxConcurrent ?? 5,
      ...options,
    };

    // Check if already syncing
    if (this.state.isSyncing) {
      throw new Error('Sync already in progress');
    }

    // Update state
    this.state.isSyncing = true;
    this.state.direction = mergedOptions.direction ?? null;
    this.state.lastError = null;

    try {
      this.debug(`Starting sync: ${mergedOptions.direction}`);

      // Execute sync via bidirectional strategy
      const result = await this.bidirectionalSync.sync(mergedOptions);

      // Update state with result
      this.state.lastResult = result;
      this.state.isSyncing = false;
      this.state.direction = null;

      this.debug(`Sync completed: ${result.syncedFiles} synced, ${result.failedFiles.length} failed`);

      return result;

    } catch (error) {
      this.state.isSyncing = false;
      this.state.lastError = error as Error;
      this.state.direction = null;

      this.debug('Sync failed:', error);
      throw error;
    }
  }

  /**
   * Resolve a specific file conflict
   * @param path - File path with conflict
   * @param strategy - Resolution strategy to apply
   */
  async resolveConflict(
    path: string,
    strategy: ConflictStrategy
  ): Promise<void> {
    this.debug(`Resolving conflict for ${path} using ${strategy}`);

    // Fetch both versions
    const localContent = await this.adapters.fsa.readFile(path);
    const remoteContent = await this.adapters.idb.readFile(path);

    // Create conflict object
    const conflict = {
      path,
      local: {
        content: localContent,
        metadata: localContent.metadata,
      },
      remote: {
        content: remoteContent,
        metadata: remoteContent.metadata,
      },
      detectedAt: Date.now(),
      strategy,
    };

    // Resolve using strategy
    const resolution = await this.conflictResolver.resolve(conflict, strategy);

    // Apply resolution to both adapters
    await this.adapters.fsa.writeFile(path, resolution.content.data);
    await this.adapters.idb.writeFile(path, resolution.content.data);

    this.debug(`Resolved ${path} using ${resolution.strategy}`);
  }

  /**
   * Watch for file changes and trigger sync
   * @param callback - Optional callback for file changes
   * @returns Unsubscribe function
   */
  watch(callback?: FileChangeCallback): () => void {
    const watchers: Array<() => void> = [];

    // Watch FSA adapter if supported
    if (this.adapters.fsa.watch) {
      const fsaWatcher = this.adapters.fsa.watch((event) => {
        this.debug(`FSA change detected: ${event.path} (${event.type})`);

        // Emit to event bus
        syncEventBus.emit('file:synced', {
          path: event.path,
          direction: 'uploaded',
        });

        // Call user callback if provided
        callback?.(event);
      });
      watchers.push(fsaWatcher);
    }

    // Return cleanup function
    return () => {
      for (const watcher of watchers) {
        watcher();
      }
    };
  }

  /**
   * Subscribe to sync events
   * @param event - Event type to listen for
   * @param handler - Event handler
   * @returns Unsubscribe function
   */
  on(
    event: 'sync:started' | 'sync:progress' | 'sync:completed' | 'sync:failed',
    handler: (data: any) => void
  ): () => void {
    return syncEventBus.on(event, handler);
  }

  /**
   * Check adapter availability
   * @param adapter - Adapter name ('fsa', 'idb', 'webcontainer')
   */
  isAdapterAvailable(adapter: 'fsa' | 'idb' | 'webcontainer'): boolean {
    const a = this.adapters[adapter];
    return a ? (a.isAvailable?.() ?? true) : false;
  }

  /**
   * Get adapter instance
   * @param adapter - Adapter name
   */
  getAdapter(adapter: 'fsa' | 'idb' | 'webcontainer'): StorageAdapter | undefined {
    return this.adapters[adapter];
  }

  /**
   * Enable or disable debug mode
   * @param enabled - Whether to enable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * Reset sync state
   */
  reset(): void {
    this.state = {
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
   * Cleanup and release resources
   */
  async dispose(): Promise<void> {
    this.debug('Disposing sync engine');

    // Unsubscribe from all events
    for (const unsubscribe of this.eventUnsubscribers) {
      unsubscribe();
    }
    this.eventUnsubscribers = [];

    // Reset state
    this.reset();
  }

  // ========== Private Methods ==========

  /**
   * Subscribe to event bus for internal state tracking
   */
  private subscribeToEvents(): void {
    // Track sync started
    this.eventUnsubscribers.push(
      syncEventBus.on('sync:started', (data: any) => {
        this.state.isSyncing = true;
        this.state.direction = data.direction;
        this.state.total = data.totalFiles;
        this.state.current = 0;
      })
    );

    // Track sync progress
    this.eventUnsubscribers.push(
      syncEventBus.on('sync:progress', (data: any) => {
        this.state.current = data.current;
        this.state.currentFile = data.currentFile ?? null;
      })
    );

    // Track sync completion
    this.eventUnsubscribers.push(
      syncEventBus.on('sync:completed', (data: any) => {
        this.state.isSyncing = false;
        this.state.current = data.totalFiles;
        this.state.lastError = null;
      })
    );

    // Track sync failure
    this.eventUnsubscribers.push(
      syncEventBus.on('sync:failed', (data: any) => {
        this.state.isSyncing = false;
        this.state.lastError = new Error(data.error);
      })
    );
  }

  /**
   * Log debug message
   */
  private debug(message: string, ...args: unknown[]): void {
    if (this.debugMode) {
      console.log(`[SyncEngine] ${message}`, ...args);
    }
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a new SyncEngine instance
 * @param config - Engine configuration
 * @returns SyncEngine instance
 */
export function createSyncEngine(config: SyncEngineConfig): SyncEngine {
  return new SyncEngine(config);
}
