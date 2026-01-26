/**
 * @fileoverview WebContainer FSA Adapter
 * @module infrastructure/webcontainer/fsa-adapter
 *
 * **CC-IDE-05**: WebContainer File Binding
 *
 * Bridges FSA file system with WebContainer virtual file system.
 * Provides bidirectional sync between FSA and WebContainer.
 *
 * Features:
 * - Mount FSA files to WebContainer at /project
 * - Bidirectional sync (FSA ↔ WebContainer)
 * - Watch FSA changes and sync to WebContainer
 * - Watch WebContainer changes and sync to FSA
 * - Conflict resolution for concurrent edits
 * - HMR event forwarding to Monaco Editor
 *
 * @epic EPIC-CC-IDE-FSA
 * @story CC-IDE-05
 * @author TEAM_B
 * @created 2026-01-18
 */

import type { WebContainer } from '@webcontainer/api';
import type { FileSystemTree } from '@webcontainer/api';
import type { StorageGateway } from '@/domain/interfaces/storage-gateway.interface';
import type { FileChangeEvent } from '@/domain/interfaces/storage-gateway.interface';
import type { WorkspaceEventEmitter } from '@/lib/events/workspace-events';

/**
 * File change direction for bidirectional sync
 */
type FileChangeDirection = 'fsa-to-wc' | 'wc-to-fsa';

/**
 * Configuration for FSA adapter
 */
interface WebContainerFSAAdapterOptions {
  /** FSA file gateway for reading/writing project files */
  fsaGateway: StorageGateway;
  /** WebContainer instance */
  container: WebContainer;
  /** Event bus for emitting sync events */
  eventBus?: WorkspaceEventEmitter;
  /** Mount point in WebContainer (default: /project) */
  mountPoint?: string;
  /** Conflict resolution strategy */
  conflictResolution?: 'fsa-wins' | 'wc-wins' | 'manual';
}

/**
 * Conflict detection result
 */
interface ConflictResult {
  hasConflict: boolean;
  fsaTimestamp?: number;
  wcTimestamp?: number;
  resolution?: 'fsa' | 'wc' | 'manual';
}

/**
 * WebContainer watcher wrapper
 */
interface WebContainerWatcher {
  close(): void;
}

/**
 * WebContainer FSA Adapter
 *
 * Bridges FSA file system with WebContainer virtual file system.
 * Provides bidirectional sync with conflict resolution.
 */
export class WebContainerFSAAdapter {
  private fsaGateway: StorageGateway;
  private container: WebContainer;
  private eventBus?: WorkspaceEventEmitter;
  private mountPoint: string;
  private conflictResolution: 'fsa-wins' | 'wc-wins' | 'manual';

  // Watch handles
  private fsaWatchHandle?: ReturnType<StorageGateway['watch']>;
  private wcWatchHandle?: WebContainerWatcher;

  // Sync state
  private lastSyncTimes: Map<string, number> = new Map();

  // Event callbacks
  private onHMR?: (path: string) => void;

  /**
   * Create WebContainer FSA adapter
   *
   * @param options - Adapter configuration
   */
  constructor(options: WebContainerFSAAdapterOptions) {
    this.fsaGateway = options.fsaGateway;
    this.container = options.container;
    this.eventBus = options.eventBus;
    this.mountPoint = options.mountPoint ?? '/project';
    this.conflictResolution = options.conflictResolution ?? 'fsa-wins';

    console.log('[FSAAdapter] Created with mount point:', this.mountPoint);
  }

  /**
   * Mount FSA folder to WebContainer
   *
   * Reads all files from FSA gateway and mounts to WebContainer
   * at configured mount point.
   *
   * @throws {Error} If mount fails
   */
  async mountToContainer(): Promise<void> {
    console.log('[FSAAdapter] Mounting FSA to WebContainer...');

    try {
      // 1. Read all files from FSA
      const fsaTree = await this.readFSATree('/');
      console.log('[FSAAdapter] FSA tree read, file count:', this.countFiles(fsaTree));

      // 2. Mount to WebContainer
      const mountOptions: { mountPoint?: string } = { mountPoint: this.mountPoint };
      await this.container.mount(fsaTree, mountOptions);
      console.log('[FSAAdapter] Files mounted to WebContainer at:', this.mountPoint);

      // 3. Emit mounted event
      this.eventBus?.emit('container:mounted', {
        fileCount: this.countFiles(fsaTree),
      });

      // 4. Start bidirectional sync
      await this.startBidirectionalSync();

      console.log('[FSAAdapter] Mount complete, sync started');
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Unknown error';
      console.error('[FSAAdapter] Mount failed:', err);

      const errorObj = error instanceof Error ? error : new Error(err);
      this.eventBus?.emit('container:error', {
        error: errorObj,
      });

      throw new Error(`Failed to mount FSA to WebContainer: ${err}`);
    }
  }

  /**
   * Start bidirectional sync between FSA and WebContainer
   *
   * - FSA → WebContainer: Watch FSA changes, write to WebContainer
   * - WebContainer → FSA: Watch WebContainer writes, write to FSA
   */
  async startBidirectionalSync(): Promise<void> {
    console.log('[FSAAdapter] Starting bidirectional sync...');

    // Start FSA → WebContainer sync
    this.startFSAToWebContainerSync();

    // Start WebContainer → FSA sync
    this.startWebContainerToFSASync();

    console.log('[FSAAdapter] Bidirectional sync started');
  }

  /**
   * Stop bidirectional sync
   */
  stopSync(): void {
    console.log('[FSAAdapter] Stopping bidirectional sync...');

    // Stop FSA → WebContainer sync
    if (this.fsaWatchHandle) {
      this.fsaWatchHandle.dispose();
      this.fsaWatchHandle = undefined;
    }

    // Stop WebContainer → FSA sync
    if (this.wcWatchHandle) {
      this.wcWatchHandle.close();
      this.wcWatchHandle = undefined;
    }

    console.log('[FSAAdapter] Bidirectional sync stopped');
  }

  /**
   * Set HMR event callback
   *
   * Called when WebContainer detects HMR event.
   * Forwards to Monaco Editor to update without full reload.
   *
   * @param callback - HMR event handler
   */
  onHMREvent(callback: (path: string) => void): void {
    this.onHMR = callback;
  }

  /**
   * Read FSA tree as WebContainer FileSystemTree
   *
   * Recursively reads FSA files and converts to WebContainer format.
   *
   * @param path - Root path to read (default: /)
   * @returns FileSystemTree for WebContainer
   */
  private async readFSATree(path: string = '/'): Promise<FileSystemTree> {
    const tree: FileSystemTree = {};

    try {
      // List all entries in directory
      const entries = await this.fsaGateway.list(path);

      for (const entry of entries) {
        const fullPath = (path as string).replace(/\/$/, '') === '' ? entry.path : `${path}/${entry.path}`.replace(/\/\//g, '/');

        if (entry.kind === 'directory') {
          // Recursively read directory
          tree[entry.path] = {
            directory: await this.readFSATree(fullPath),
          };
        } else {
          // Read file content
          const data = await this.fsaGateway.read(fullPath);
          const content = new TextDecoder().decode(data);
          tree[entry.path] = {
            file: {
              contents: content,
            },
          };

          // Track last sync time
          this.lastSyncTimes.set(fullPath, Date.now());
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Unknown error';
      console.error('[FSAAdapter] Failed to read FSA tree:', err);

      const errorObj = error instanceof Error ? error : new Error(err);
      this.eventBus?.emit('container:error', {
        error: errorObj,
      });
    }

    return tree;
  }

  /**
   * Start FSA → WebContainer sync
   *
   * Watches FSA changes and syncs to WebContainer.
   */
  private startFSAToWebContainerSync(): void {
    console.log('[FSAAdapter] Starting FSA → WebContainer sync...');

    try {
      // Watch FSA changes
      this.fsaWatchHandle = this.fsaGateway.watch((change: FileChangeEvent) => {
        this.handleFSAChange(change);
      });

      console.log('[FSAAdapter] FSA → WebContainer sync started');
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Unknown error';
      console.error('[FSAAdapter] Failed to start FSA → WebContainer sync:', err);

      const errorObj = error instanceof Error ? error : new Error(err);
      this.eventBus?.emit('container:error', {
        error: errorObj,
      });
    }
  }

  /**
   * Start WebContainer → FSA sync
   *
   * Monitors WebContainer file writes and syncs to FSA.
   */
  private startWebContainerToFSASync(): void {
    console.log('[FSAAdapter] Starting WebContainer → FSA sync...');

    try {
      // Watch all files in WebContainer for changes
      this.wcWatchHandle = this.container.fs.watch(
        this.mountPoint,
        { recursive: true },
        (event, filename) => {
          const filenameStr = typeof filename === 'string' ? filename : new TextDecoder().decode(filename);
          this.handleWebContainerChange(event, filenameStr);
        }
      );

      console.log('[FSAAdapter] WebContainer → FSA sync started');
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Unknown error';
      console.error('[FSAAdapter] Failed to start WebContainer → FSA sync:', err);

      const errorObj = error instanceof Error ? error : new Error(err);
      this.eventBus?.emit('container:error', {
        error: errorObj,
      });
    }
  }

  /**
   * Handle FSA file change
   *
   * Detects conflicts and syncs to WebContainer.
   *
   * @param change - File change event from FSA gateway
   */
  private async handleFSAChange(change: FileChangeEvent): Promise<void> {
    const { path, kind } = change;

    // Detect conflict
    const conflict = this.detectConflict(path, 'fsa-to-wc');

    if (conflict.hasConflict) {
      console.warn('[FSAAdapter] Conflict detected for:', path, conflict);

      // Resolve conflict based on strategy
      await this.resolveConflict(path, conflict);

      // Emit conflict event
      this.eventBus?.emit('sync:warning', {
        message: `Conflict detected for ${path}`,
        file: path,
      });

      return;
    }

    // Sync to WebContainer
    try {
      const wcPath = `${this.mountPoint}${path}`.replace(/\/\//g, '/');

      if (kind === 'deleted') {
        await this.container.fs.rm(wcPath);
        console.log('[FSAAdapter] FSA → WebContainer: delete', path);
      } else {
        // Read file from FSA
        const data = await this.fsaGateway.read(path);
        const content = new TextDecoder().decode(data);

        // Write to WebContainer
        await this.container.fs.writeFile(wcPath, content);
        console.log('[FSAAdapter] FSA → WebContainer:', kind, path);

        // Trigger HMR if enabled
        if (this.onHMR) {
          this.onHMR(path);
        }
      }

      // Update last sync time
      this.lastSyncTimes.set(path, Date.now());

      // Emit sync event
      this.eventBus?.emit('file:modified', {
        path,
        source: 'local',
      });
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Unknown error';
      console.error('[FSAAdapter] Failed to sync WebContainer → FSA:', err);

      const errorObj = error instanceof Error ? error : new Error(err);
      this.eventBus?.emit('sync:error', {
        error: errorObj,
        file: path,
      });
    }
  }

  /**
   * Handle WebContainer file change
   *
   * Reads changed file from WebContainer and syncs to FSA.
   *
   * @param _event - File system event type (unused in current implementation)
   * @param filename - Filename that changed
   */
  private async handleWebContainerChange(
    _event: string,
    filename: string
  ): Promise<void> {
    const fsaPath = this.mountPoint ? `${this.mountPoint}/${filename}` : filename;

    try {
      // Detect conflict
      const conflict = this.detectConflict(fsaPath, 'wc-to-fsa');

      if (conflict.hasConflict) {
        console.warn('[FSAAdapter] Conflict detected for:', fsaPath, conflict);

        // Resolve conflict based on strategy
        await this.resolveConflict(fsaPath, conflict);

        // Emit conflict event
        this.eventBus?.emit('sync:warning', {
          message: `Conflict detected for ${fsaPath}`,
          file: fsaPath,
        });

        return;
      }

      // Read from WebContainer (returns string | Uint8Array)
      const wcContent = await this.container.fs.readFile(fsaPath);
      const content = typeof wcContent === 'string' ? wcContent : new TextDecoder().decode(wcContent);
      const data = new TextEncoder().encode(content);

      // Write to FSA via gateway
      await this.fsaGateway.write(fsaPath, data);

      console.log('[FSAAdapter] WebContainer → FSA:', filename);

      // Update last sync time
      this.lastSyncTimes.set(fsaPath, Date.now());

      // Emit file modified event
      this.eventBus?.emit('file:modified', {
        path: fsaPath,
        source: 'agent',
      });
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Unknown error';
      console.error('[FSAAdapter] Failed to sync WebContainer → FSA:', err);

      const errorObj = error instanceof Error ? error : new Error(err);
      this.eventBus?.emit('sync:error', {
        error: errorObj,
        file: fsaPath,
      });
    }
  }

  /**
   * Detect conflict for a file
   *
   * Checks if file was modified in both FSA and WebContainer
   * within a short time window.
   *
   * @param path - File path
   * @param direction - Sync direction
   * @returns Conflict detection result
   */
  private detectConflict(
    path: string,
    _direction: FileChangeDirection
  ): ConflictResult {
    const now = Date.now();
    const lastSync = this.lastSyncTimes.get(path);

    if (!lastSync) {
      return { hasConflict: false };
    }

    // Conflict if modified within 1 second in opposite direction
    const timeDiff = Math.abs(now - lastSync);

    if (timeDiff < 1000) {
      // Conflict detected
      const result: ConflictResult = {
        hasConflict: true,
        fsaTimestamp: lastSync,
        wcTimestamp: now,
      };

      // Auto-resolve based on strategy
      if (this.conflictResolution === 'fsa-wins') {
        result.resolution = 'fsa';
      } else if (this.conflictResolution === 'wc-wins') {
        result.resolution = 'wc';
      } else {
        result.resolution = 'manual';
      }

      return result;
    }

    return { hasConflict: false };
  }

  /**
   * Resolve conflict for a file
   *
   * @param path - File path
   * @param conflict - Conflict detection result
   */
  private async resolveConflict(
    path: string,
    conflict: ConflictResult
  ): Promise<void> {
    const { resolution } = conflict;

    console.log('[FSAAdapter] Resolving conflict for:', path, 'strategy:', resolution);

    if (resolution === 'fsa') {
      // FSA wins - nothing to do, FSA change already applied
      console.log('[FSAAdapter] Conflict resolved: FSA wins');
    } else if (resolution === 'wc') {
      // WebContainer wins - need to re-apply WebContainer change
      // This will be handled by sync cycle
      console.log('[FSAAdapter] Conflict resolved: WebContainer wins');
    } else {
      // Manual - notify user
      console.log('[FSAAdapter] Conflict resolved: Manual (user intervention required)');
    }

    // Update last sync time to prevent re-detection
    this.lastSyncTimes.set(path, Date.now());
  }

  /**
   * Count files in FileSystemTree
   *
   * @param tree - FileSystemTree to count
   * @returns Number of files
   */
  private countFiles(tree: FileSystemTree): number {
    let count = 0;

    for (const key of Object.keys(tree)) {
      const node = tree[key];

      if ('file' in node) {
        count++;
      } else if ('directory' in node) {
        count += this.countFiles(node.directory);
      }
    }

    return count;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    console.log('[FSAAdapter] Disposing...');

    // Stop sync
    this.stopSync();

    // Clear caches
    this.lastSyncTimes.clear();

    console.log('[FSAAdapter] Disposed');
  }
}

/**
 * Create WebContainer FSA adapter factory
 *
 * @param options - Adapter configuration
 * @returns WebContainerFSAAdapter instance
 */
export function createWebContainerFSAAdapter(
  options: WebContainerFSAAdapterOptions
): WebContainerFSAAdapter {
  return new WebContainerFSAAdapter(options);
}

// ============================================================================
// Types Re-exports
// ============================================================================

export type {
  FileChangeDirection,
  WebContainerFSAAdapterOptions,
  ConflictResult,
};
