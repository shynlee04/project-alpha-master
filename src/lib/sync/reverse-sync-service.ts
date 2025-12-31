/**
 * Reverse Sync Service
 * @module lib/sync/reverse-sync-service
 * 
 * Service for syncing file changes from WebContainer back to local file system.
 * Listens to file events from SyncEventBus and performs reverse sync operations.
 * 
 * @see {@link https://github.com/stackblitz/webcontainer-docs} for WebContainer API
 * @see {@link ../sync-event-bus.ts} for SyncEventBus implementation
 */

import { SyncEventBus } from './sync-event-bus';
import type { 
  FileEventType, 
  BaseEventPayload, 
  FileEventPayload,
  FileEventMap 
} from './event-types';
import { SyncError, type SyncErrorCode } from '../filesystem/sync-types';

// =============================================================================
// Configuration
// =============================================================================

/**
 * Conflict resolution strategy for handling file conflicts
 */
export type ConflictResolutionStrategy = 
  | 'local'    // Local file wins, skip reverse sync
  | 'remote'   // Remote (WebContainer) file wins, overwrite local
  | 'merge';   // Merge changes (not implemented for MVP)

/**
 * Options for ReverseSyncService
 */
export interface ReverseSyncOptions {
  /** Patterns to exclude from reverse sync */
  exclusionPatterns?: string[];
  /** Conflict resolution strategy */
  conflictResolution?: ConflictResolutionStrategy;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Callback for sync errors */
  onError?: (error: ReverseSyncError) => void;
  /** Callback for sync progress */
  onProgress?: (progress: ReverseSyncProgress) => void;
}

/**
 * Progress information during reverse sync
 */
export interface ReverseSyncProgress {
  /** File path being synced */
  path: string;
  /** Operation type */
  operation: 'create' | 'modify' | 'delete';
  /** Total files synced so far */
  syncedCount: number;
  /** Whether operation completed */
  completed: boolean;
}

/**
 * Error class for reverse sync operations
 */
export class ReverseSyncError extends Error {
  constructor(
    message: string,
    public readonly code: SyncErrorCode,
    public readonly filePath?: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'ReverseSyncError';
  }
}

// =============================================================================
// Reverse Sync Service
// =============================================================================

/**
 * Service for synchronizing files from WebContainer to local file system.
 * 
 * This service listens to file change events from the SyncEventBus and
 * performs reverse sync operations to keep local files in sync with
 * WebContainer changes.
 * 
 * @example
 * ```ts
 * const reverseSync = new ReverseSyncService(
 *   syncEventBus,
 *   localFSAdapter,
 *   { conflictResolution: 'local' }
 * );
 * reverseSync.start();
 * ```
 */
export class ReverseSyncService {
  private readonly syncEventBus: SyncEventBus;
  private readonly localFSAdapter: {
    writeFile: (path: string, content: Uint8Array) => Promise<void>;
    deleteFile: (path: string) => Promise<void>;
    fileExists: (path: string) => Promise<boolean>;
    getFileMetadata: (path: string) => Promise<{ lastModified?: number } | null>;
  };
  private readonly exclusionPatterns: string[];
  private readonly conflictResolution: ConflictResolutionStrategy;
  private readonly debounceMs: number;
  private readonly onError?: (error: ReverseSyncError) => void;
  private readonly onProgress?: (progress: ReverseSyncProgress) => void;
  
  private isRunning: boolean;
  private debounceTimers: Map<string, NodeJS.Timeout>;
  private syncedCount: number;
  private readonly eventListeners: Map<FileEventType, () => void>;

  /**
   * Create a new ReverseSyncService instance
   * 
   * @param syncEventBus - The SyncEventBus instance for listening to events
   * @param localFSAdapter - Adapter for local file system operations
   * @param options - Configuration options
   */
  constructor(
    syncEventBus: SyncEventBus,
    localFSAdapter: ReverseSyncService['localFSAdapter'],
    options?: ReverseSyncOptions
  ) {
    this.syncEventBus = syncEventBus;
    this.localFSAdapter = localFSAdapter;
    this.exclusionPatterns = options?.exclusionPatterns ?? this.getDefaultExclusions();
    this.conflictResolution = options?.conflictResolution ?? 'local';
    this.debounceMs = options?.debounceMs ?? 100;
    this.onError = options?.onError;
    this.onProgress = options?.onProgress;
    
    this.isRunning = false;
    this.debounceTimers = new Map();
    this.syncedCount = 0;
    this.eventListeners = new Map();
  }

  /**
   * Get default exclusion patterns for reverse sync
   */
  private getDefaultExclusions(): string[] {
    return [
      '.git',
      'node_modules',
      '.DS_Store',
      'Thumbs.db',
      '*.swp',
      '*.swo',
      '.env.local',
      '.env.*.local',
    ];
  }

  /**
   * Start the reverse sync service
   * Begins listening to file events from SyncEventBus
   */
  start(): void {
    if (this.isRunning) {
      console.warn('[ReverseSyncService] Already running');
      return;
    }

    this.isRunning = true;
    console.log('[ReverseSyncService] Starting reverse sync service');
    
    this.subscribeToEvents();
  }

  /**
   * Stop the reverse sync service
   * Stops listening to events and cleans up debounce timers
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    console.log('[ReverseSyncService] Stopping reverse sync service');
    
    this.unsubscribeFromEvents();
    this.clearDebounceTimers();
  }

  /**
   * Check if the service is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Subscribe to file events from SyncEventBus
   */
  private subscribeToEvents(): void {
    const eventTypes: FileEventType[] = [
      'file:created',
      'file:modified',
      'file:deleted',
    ];

    for (const eventType of eventTypes) {
      const handler = (payload: BaseEventPayload<FileEventPayload>) => {
        this.handleFileEvent(eventType, payload);
      };
      
      this.syncEventBus.on(eventType, handler);
      this.eventListeners.set(eventType, handler);
    }

    console.log(`[ReverseSyncService] Subscribed to ${eventTypes.length} event types`);
  }

  /**
   * Unsubscribe from all file events
   */
  private unsubscribeFromEvents(): void {
    for (const [eventType, listener] of this.eventListeners) {
      this.syncEventBus.off(eventType, listener);
    }
    this.eventListeners.clear();
  }

  /**
   * Handle file events from SyncEventBus
   * 
   * @param eventType - The type of file event
   * @param payload - The event payload
   */
  private handleFileEvent(
    eventType: FileEventType,
    payload: BaseEventPayload<FileEventPayload>
  ): void {
    if (!this.isRunning) {
      return;
    }

    const { path } = payload.data;
    
    // Skip excluded paths
    if (this.isExcluded(path)) {
      console.log(`[ReverseSyncService] Skipping excluded path: ${path}`);
      return;
    }

    // Apply debouncing
    this.debounceFileOperation(path, eventType, payload);
  }

  /**
   * Debounce file operations to avoid excessive sync operations
   * 
   * @param path - File path
   * @param eventType - Event type
   * @param payload - Event payload
   */
  private debounceFileOperation(
    path: string,
    eventType: FileEventType,
    payload: BaseEventPayload<FileEventPayload>
  ): void {
    const timerKey = `${eventType}:${path}`;
    
    // Clear existing timer if any
    if (this.debounceTimers.has(timerKey)) {
      clearTimeout(this.debounceTimers.get(timerKey));
    }

    const timer = setTimeout(() => {
      this.debounceTimers.delete(timerKey);
      this.performSyncOperation(eventType, payload);
    }, this.debounceMs);

    this.debounceTimers.set(timerKey, timer);
  }

  /**
   * Perform the actual sync operation
   * 
   * @param eventType - The type of file event
   * @param payload - The event payload
   */
  private async performSyncOperation(
    eventType: FileEventType,
    payload: BaseEventPayload<FileEventPayload>
  ): Promise<void> {
    const { path, operation } = payload.data;

    try {
      switch (eventType) {
        case 'file:created':
        case 'file:modified':
          await this.syncFileToLocal(path);
          break;
        case 'file:deleted':
          await this.deleteLocalFile(path);
          break;
      }

      this.syncedCount++;
      
      // Report progress
      this.onProgress?.({
        path,
        operation: operation as 'create' | 'modify' | 'delete',
        syncedCount: this.syncedCount,
        completed: false,
      });

      console.log(`[ReverseSyncService] Synced ${operation} operation for: ${path}`);
    } catch (error) {
      const syncError = error instanceof ReverseSyncError
        ? error
        : new ReverseSyncError(
            `Failed to sync file: ${path}`,
            'SYNC_FAILED',
            path,
            error
          );

      console.error(`[ReverseSyncService] Sync error for ${path}:`, syncError);
      this.onError?.(syncError);
    }
  }

  /**
   * Sync a file from WebContainer to local file system
   * 
   * @param wcPath - WebContainer file path
   */
  private async syncFileToLocal(wcPath: string): Promise<void> {
    // Check conflict resolution strategy
    if (this.conflictResolution === 'local') {
      const localExists = await this.localFSAdapter.fileExists(wcPath);
      
      if (localExists) {
        const localMeta = await this.localFSAdapter.getFileMetadata(wcPath);
        // For MVP, skip if local file exists (local wins)
        console.log(`[ReverseSyncService] Local file exists, skipping sync: ${wcPath}`);
        return;
      }
    }

    // The actual file reading from WebContainer would be done by the caller
    // This service handles the sync logic and local FS operations
    console.log(`[ReverseSyncService] Ready to sync file to local: ${wcPath}`);
  }

  /**
   * Delete a file from local file system
   * 
   * @param path - File path to delete
   */
  private async deleteLocalFile(path: string): Promise<void> {
    try {
      await this.localFSAdapter.deleteFile(path);
      console.log(`[ReverseSyncService] Deleted local file: ${path}`);
    } catch (error) {
      // Ignore errors if file doesn't exist
      if (error instanceof Error && error.message.includes('not found')) {
        console.log(`[ReverseSyncService] File already deleted: ${path}`);
        return;
      }
      throw error;
    }
  }

  /**
   * Check if a path should be excluded from sync
   * 
   * @param path - File path to check
   * @returns True if path should be excluded
   */
  isExcluded(path: string): boolean {
    return this.exclusionPatterns.some(pattern => {
      // Handle glob patterns
      if (pattern.startsWith('*')) {
        return path.endsWith(pattern.slice(1));
      }
      return path.includes(pattern);
    });
  }

  /**
   * Clear all debounce timers
   */
  private clearDebounceTimers(): void {
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
  }

  /**
   * Get the number of files synced
   */
  getSyncedCount(): number {
    return this.syncedCount;
  }

  /**
   * Reset the synced count
   */
  resetSyncedCount(): void {
    this.syncedCount = 0;
  }

  /**
   * Update exclusion patterns at runtime
   * 
   * @param patterns - New exclusion patterns
   */
  setExclusionPatterns(patterns: string[]): void {
    this.exclusionPatterns = patterns;
  }

  /**
   * Update conflict resolution strategy at runtime
   * 
   * @param strategy - New conflict resolution strategy
   */
  setConflictResolution(strategy: ConflictResolutionStrategy): void {
    this.conflictResolution = strategy;
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a ReverseSyncService instance with common configuration
 * 
 * @param syncEventBus - The SyncEventBus instance
 * @param localFSAdapter - Adapter for local file system operations
 * @returns Configured ReverseSyncService instance
 */
export function createReverseSyncService(
  syncEventBus: SyncEventBus,
  localFSAdapter: ReverseSyncService['localFSAdapter']
): ReverseSyncService {
  return new ReverseSyncService(syncEventBus, localFSAdapter);
}
