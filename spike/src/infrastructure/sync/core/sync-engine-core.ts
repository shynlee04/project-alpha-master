/**
 * @fileoverview Sync Engine - Core Sync Orchestration
 */

import type {
  StorageAdapter,
  SyncOptions,
  SyncResult,
  ConflictStrategy,
  FileChangeCallback,
} from './sync-types';
import type { SyncEngineConfig } from './sync-engine-types';
import { syncEventBus } from './sync-events';
import { BidirectionalSync, createBidirectionalSync } from '../strategies/bidirectional-sync';
import { ConflictResolver, createConflictResolver } from '../strategies/conflict-resolution';
import {
  createInitialState,
  subscribeToEvents,
  isReady,
  isAdapterAvailable,
  getAdapter,
  resetState as resetEngineState,
} from './sync-engine-state';

// ============================================================================
// Sync Engine Implementation
// ============================================================================

export class SyncEngine {
  private adapters: SyncEngineConfig['adapters'];
  private defaults: Partial<SyncOptions>;
  private debugMode: boolean;
  private state: import('./sync-engine-types').SyncEngineState;
  private bidirectionalSync: BidirectionalSync;
  private conflictResolver: ConflictResolver;
  private eventUnsubscribers: Array<() => void> = [];

  constructor(config: SyncEngineConfig) {
    this.adapters = config.adapters;
    this.defaults = config.defaults ?? {};
    this.debugMode = config.debug ?? false;
    this.state = createInitialState();

    this.bidirectionalSync = createBidirectionalSync(
      this.adapters.fsa,
      this.adapters.idb,
      this.debugMode
    );
    this.conflictResolver = createConflictResolver();

    this.subscribeToEvents();
  }

  /** Get current engine state */
  getState(): Readonly<import('./sync-engine-types').SyncEngineState> {
    return { ...this.state };
  }

  /** Check if engine is ready for sync */
  isReady(): boolean {
    return isReady(this.adapters);
  }

  /** Execute sync operation */
  async sync(options: SyncOptions = {}): Promise<SyncResult> {
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

    if (this.state.isSyncing) {
      throw new Error('Sync already in progress');
    }

    this.state.isSyncing = true;
    this.state.direction = mergedOptions.direction ?? null;
    this.state.lastError = null;

    try {
      this.debug(`Starting sync: ${mergedOptions.direction}`);
      const result = await this.bidirectionalSync.sync(mergedOptions);
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

  /** Resolve a specific file conflict */
  async resolveConflict(path: string, strategy: ConflictStrategy): Promise<void> {
    this.debug(`Resolving conflict for ${path} using ${strategy}`);

    const localContent = await this.adapters.fsa.readFile(path);
    const remoteContent = await this.adapters.idb.readFile(path);

    const conflict = {
      path,
      local: { content: localContent, metadata: localContent.metadata },
      remote: { content: remoteContent, metadata: remoteContent.metadata },
      detectedAt: Date.now(),
      strategy,
    };

    const resolution = await this.conflictResolver.resolve(conflict, strategy);

    await this.adapters.fsa.writeFile(path, resolution.content.data);
    await this.adapters.idb.writeFile(path, resolution.content.data);

    this.debug(`Resolved ${path} using ${resolution.strategy}`);
  }

  /** Watch for file changes and trigger sync */
  watch(callback?: FileChangeCallback): () => void {
    const watchers: Array<() => void> = [];

    if (this.adapters.fsa.watch) {
      const fsaWatcher = this.adapters.fsa.watch((event) => {
        this.debug(`FSA change detected: ${event.path} (${event.type})`);
        syncEventBus.emit('file:synced', { path: event.path, direction: 'uploaded' });
        callback?.(event);
      });
      watchers.push(fsaWatcher);
    }

    return () => {
      for (const watcher of watchers) {
        watcher();
      }
    };
  }

  /** Subscribe to sync events */
  on(
    event: 'sync:started' | 'sync:progress' | 'sync:completed' | 'sync:failed',
    handler: (data: any) => void
  ): () => void {
    return syncEventBus.on(event, handler);
  }

  /** Check adapter availability */
  isAdapterAvailable(adapter: 'fsa' | 'idb' | 'webcontainer'): boolean {
    return isAdapterAvailable(this.adapters, adapter);
  }

  /** Get adapter instance */
  getAdapter(adapter: 'fsa' | 'idb' | 'webcontainer'): StorageAdapter | undefined {
    return getAdapter(this.adapters, adapter);
  }

  /** Enable or disable debug mode */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /** Reset sync state */
  reset(): void {
    this.state = resetEngineState();
  }

  /** Cleanup and release resources */
  async dispose(): Promise<void> {
    this.debug('Disposing sync engine');
    for (const unsubscribe of this.eventUnsubscribers) {
      unsubscribe();
    }
    this.eventUnsubscribers = [];
    this.reset();
  }

  // ========== Private Methods ==========

  private subscribeToEvents(): void {
    const updateState = (update: Partial<import('./sync-engine-types').SyncEngineState>) => {
      this.state = { ...this.state, ...update };
    };

    this.eventUnsubscribers = subscribeToEvents(updateState);
  }

  private debug(message: string, ...args: unknown[]): void {
    if (this.debugMode) {
      console.log(`[SyncEngine] ${message}`, ...args);
    }
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createSyncEngine(config: SyncEngineConfig): SyncEngine {
  return new SyncEngine(config);
}
