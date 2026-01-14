/**
 * @fileoverview File Tree Scanner - Snapshot caching for fast project load
 * @module infrastructure/filesystem/file-tree-scanner
 *
 * **ARC-B06**: File tree scanning service with snapshot caching
 *
 * Per ADR-033 Decision D8:
 * - Cache file tree in .viagent/file-tree-snapshot.json
 * - Load snapshot instantly (<500ms), refresh in background
 * - Show stale indicator during background refresh
 *
 * This service provides fast project loading by:
 * 1. Loading cached snapshot from .viagent/
 * 2. Showing stale indicator if cache is old
 * 3. Scanning in background and updating cache
 * 4. Incremental diff updates (only changed paths)
 *
 * @epic EPIC-CC-ARC
 * @story ARC-B06
 * @author Team B
 * @created 2026-01-18
 */

import type { StorageGateway, FileEntry } from '@/domain/interfaces/storage-gateway.interface';
import type {
  ViagentFileTreeSnapshot,
  ViagentFileTreeEntry,
} from '@/domain/types/viagent-metadata';
import {
  VIAGENT_FOLDER_NAME,
  VIAGENT_FILES,
} from '@/domain/types/viagent-metadata';

// ============================================================================
// Types
// ============================================================================

/**
 * Scan options for file tree scanner
 */
export interface FileTreeScanOptions {
  /** Maximum scan depth (default: 20, max: 50) */
  maxDepth?: number;
  /** Exclude patterns (default: node_modules, .git, etc.) */
  excludePatterns?: string[];
  /** Whether to include file hashes (expensive) */
  includeHashes?: boolean;
  /** Progress callback for large scans */
  onProgress?: (progress: FileTreeScanProgress) => void;
}

/**
 * Scan progress information
 */
export interface FileTreeScanProgress {
  /** Current depth being scanned */
  currentDepth: number;
  /** Files scanned so far */
  filesScanned: number;
  /** Directories scanned so far */
  directoriesScanned: number;
  /** Estimated progress (0-1) */
  progress: number;
}

/**
 * Scan result with timing
 */
export interface FileTreeScanResult {
  /** The file tree snapshot */
  snapshot: ViagentFileTreeSnapshot;
  /** Whether the scan was from cache or fresh */
  cached: boolean;
  /** Time taken in milliseconds */
  durationMs: number;
}

/**
 * Diff result for incremental updates
 */
export interface FileTreeDiff {
  /** Paths added since last snapshot */
  added: string[];
  /** Paths removed since last snapshot */
  removed: string[];
  /** Paths modified since last snapshot */
  modified: string[];
}

// ============================================================================
// Default Configuration
// ============================================================================

/**
 * Default exclusion patterns for file tree scan
 */
const DEFAULT_EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  '.cache',
  '.turbo',
  'out',
  '.viagent',
];

/**
 * Maximum scan depth (prevent infinite loops)
 */
const MAX_SCAN_DEPTH = 50;

/**
 * Warning depth threshold (warn when approaching limit)
 */
const WARNING_DEPTH = 15;

/**
 * Maximum file count (prevent memory issues)
 *
 * @remarks
 * This is a safety limit. If reached, the scan will stop
 * and log a warning. Projects exceeding this should use
 * more targeted scanning strategies.
 *
 * @todo Implement file count limiting in scanDirectory
 */
// @ts-expect-error - Intentionally unused for future safety limit
const MAX_FILE_COUNT = 50000;

// ============================================================================
// File Tree Scanner Implementation
// ============================================================================

/**
 * File Tree Scanner Service
 *
 * @remarks
 * Provides fast file tree loading with snapshot caching.
 * Implements the "load first, refresh later" pattern for UX.
 *
 * **Usage Pattern:**
 * 1. Call `loadOrScan()` - returns cached snapshot instantly if available
 * 2. Check `result.cached` - if true, snapshot is stale
 * 3. UI shows stale indicator during background refresh
 * 4. Call `refreshInBackground()` to update cache
 *
 * @example
 * ```ts
 * const scanner = new FileTreeScanner(gateway, 'proj_123');
 *
 * // Load instantly (may be stale)
 * const result = await scanner.loadOrScan();
 * if (result.cached) {
 *   // Show stale indicator, refresh in background
 *   scanner.refreshInBackground();
 * }
 *
 * // Get current snapshot (always fast)
 * const current = await scanner.getSnapshot();
 * ```
 */
export class FileTreeScanner {
  private readonly gateway: StorageGateway;
  private readonly projectId: string;
  private currentSnapshot: ViagentFileTreeSnapshot | null = null;
  private isRefreshing = false;
  private refreshAbortController: AbortController | null = null;

  // Exclusion patterns
  private excludePatterns: string[];
  private maxDepth: number;

  /**
   * Create file tree scanner
   *
   * @param gateway - Storage gateway for file operations
   * @param projectId - Project ID
   * @param options - Scanner options
   */
  constructor(
    gateway: StorageGateway,
    projectId: string,
    options?: FileTreeScanOptions
  ) {
    this.gateway = gateway;
    this.projectId = projectId;
    this.excludePatterns = options?.excludePatterns ?? [...DEFAULT_EXCLUDE_PATTERNS];
    this.maxDepth = Math.min(options?.maxDepth ?? 20, MAX_SCAN_DEPTH);
  }

  // ========================================================================
  // Public API: Load and Scan
  // ========================================================================

  /**
   * Load snapshot from cache or scan fresh
   *
   * @param forceFresh - Force a fresh scan (bypass cache)
   * @returns Scan result with timing
   *
   * @remarks
   * This is the primary entry point. Tries to load from cache first,
   * returning instantly if available (<500ms target). Then triggers
   * background refresh if cache is stale.
   */
  async loadOrScan(forceFresh = false): Promise<FileTreeScanResult> {
    const startTime = Date.now();

    // Try to load from cache unless forcing fresh
    if (!forceFresh) {
      const cached = await this.loadCachedSnapshot();
      if (cached) {
        this.currentSnapshot = cached;

        // Trigger background refresh if stale
        if (cached.isStale) {
          this.refreshInBackground().catch(console.error);
        }

        return {
          snapshot: cached,
          cached: true,
          durationMs: Date.now() - startTime,
        };
      }
    }

    // Perform fresh scan
    const snapshot = await this.scanFullPath();

    // Cache the result
    await this.saveSnapshot(snapshot);

    this.currentSnapshot = snapshot;

    return {
      snapshot,
      cached: false,
      durationMs: Date.now() - startTime,
    };
  }

  /**
   * Refresh snapshot in background
   *
   * @returns Promise that resolves when refresh completes
   *
   * @remarks
   * Performs a full scan and updates the cache. Can be aborted
   * by calling `abortRefresh()`.
   */
  async refreshInBackground(): Promise<ViagentFileTreeSnapshot> {
    if (this.isRefreshing) {
      // Already refreshing, return existing promise
      return this.currentSnapshot!;
    }

    this.isRefreshing = true;
    this.refreshAbortController = new AbortController();

    const signal = this.refreshAbortController.signal;

    try {
      // Mark as stale during refresh
      if (this.currentSnapshot) {
        await this.markSnapshotStale();
      }

      // Perform fresh scan
      const snapshot = await this.scanFullPath(signal);

      // Save to cache
      await this.saveSnapshot(snapshot);

      this.currentSnapshot = snapshot;
      this.isRefreshing = false;

      console.log(`[FileTreeScanner] Background refresh complete: ${snapshot.fileCount} files`);

      return snapshot;
    } catch (error) {
      this.isRefreshing = false;

      if ((error as Error).name === 'AbortError') {
        console.log('[FileTreeScanner] Background refresh aborted');
        throw error;
      }

      console.error('[FileTreeScanner] Background refresh failed:', error);
      throw error;
    } finally {
      this.refreshAbortController = null;
    }
  }

  /**
   * Abort background refresh
   */
  abortRefresh(): void {
    if (this.refreshAbortController) {
      this.refreshAbortController.abort();
      this.refreshAbortController = null;
      this.isRefreshing = false;
    }
  }

  /**
   * Get current snapshot (if loaded)
   *
   * @returns Current snapshot or null
   */
  getSnapshot(): ViagentFileTreeSnapshot | null {
    return this.currentSnapshot;
  }

  /**
   * Check if snapshot is currently refreshing
   */
  getIsRefreshing(): boolean {
    return this.isRefreshing;
  }

  // ========================================================================
  // Public API: Diff and Incremental Updates
  // ========================================================================

  /**
   * Compute diff between two snapshots
   *
   * @param oldSnapshot - Previous snapshot
   * @param newSnapshot - Current snapshot
   * @returns Diff result
   */
  computeDiff(
    oldSnapshot: ViagentFileTreeSnapshot,
    newSnapshot: ViagentFileTreeSnapshot
  ): FileTreeDiff {
    const oldPaths = new Set(this.collectPaths(oldSnapshot.root));
    const newPaths = new Set(this.collectPaths(newSnapshot.root));

    const added: string[] = [];
    const removed: string[] = [];
    const modified: string[] = [];

    // Find added paths
    for (const path of newPaths) {
      if (!oldPaths.has(path)) {
        added.push(path);
      }
    }

    // Find removed paths
    for (const path of oldPaths) {
      if (!newPaths.has(path)) {
        removed.push(path);
      }
    }

    // Find modified paths (both exist but different)
    for (const newPath of newPaths) {
      if (oldPaths.has(newPath)) {
        const oldEntry = this.findEntry(oldSnapshot.root, newPath);
        const newEntry = this.findEntry(newSnapshot.root, newPath);

        if (oldEntry && newEntry && this.isEntryModified(oldEntry, newEntry)) {
          modified.push(newPath);
        }
      }
    }

    return { added, removed, modified };
  }

  // ========================================================================
  // Private: Scanning
  // ========================================================================

  /**
   * Perform full file tree scan
   *
   * @param signal - AbortSignal for cancellation
   * @returns Fresh file tree snapshot
   */
  private async scanFullPath(signal?: AbortSignal): Promise<ViagentFileTreeSnapshot> {
    const startTime = Date.now();

    // Build root entry recursively
    const root = await this.scanDirectory('.', 0, signal);

    // Collect statistics
    const stats = this.collectStats(root);

    // Check for depth warning
    if (stats.maxDepth >= WARNING_DEPTH) {
      console.warn(`[FileTreeScanner] Scan depth ${stats.maxDepth} approaching limit of ${this.maxDepth}`);
    }

    const scanDurationMs = Date.now() - startTime;

    return {
      version: '1.0.0',
      projectId: this.projectId,
      root,
      fileCount: stats.fileCount,
      directoryCount: stats.directoryCount,
      maxDepth: stats.maxDepth,
      exclusionPatterns: [...this.excludePatterns],
      createdAt: new Date().toISOString(),
      isStale: false,
      scanDurationMs,
    };
  }

  /**
   * Recursively scan a directory
   *
   * @param path - Directory path
   * @param currentDepth - Current depth
   * @param signal - AbortSignal for cancellation
   * @returns Directory entry with children
   */
  private async scanDirectory(
    path: string,
    currentDepth: number,
    signal?: AbortSignal
  ): Promise<ViagentFileTreeEntry> {
    // Check for abort
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    // Check depth limit
    if (currentDepth >= this.maxDepth) {
      console.warn(`[FileTreeScanner] Max depth ${this.maxDepth} reached at ${path}`);
      return {
        path,
        kind: 'directory',
        size: 0,
        lastModified: Date.now(),
        isExcluded: false,
        children: [],
      };
    }

    // Check if directory is excluded
    if (this.isPathExcluded(path)) {
      return {
        path,
        kind: 'directory',
        size: 0,
        lastModified: Date.now(),
        isExcluded: true,
        children: [],
      };
    }

    // List directory contents
    let entries: FileEntry[];
    try {
      entries = await this.gateway.list(path);
    } catch {
      // Directory doesn't exist or can't be read
      return {
        path,
        kind: 'directory',
        size: 0,
        lastModified: Date.now(),
        isExcluded: false,
        children: [],
      };
    }

    // Process each entry
    const children: ViagentFileTreeEntry[] = [];

    for (const entry of entries) {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      // Skip excluded paths
      if (this.isPathExcluded(entry.path)) {
        continue;
      }

      if (entry.kind === 'directory') {
        // Recursively scan subdirectory
        const dirEntry = await this.scanDirectory(entry.path, currentDepth + 1, signal);
        children.push(dirEntry);
      } else {
        // File entry
        children.push({
          path: entry.path,
          kind: 'file',
          size: entry.size,
          lastModified: entry.lastModified,
          isExcluded: false,
        });
      }
    }

    // Sort children: directories first, then alphabetically
    children.sort((a, b) => {
      if (a.kind !== b.kind) {
        return a.kind === 'directory' ? -1 : 1;
      }
      return a.path.localeCompare(b.path);
    });

    return {
      path,
      kind: 'directory',
      size: 0,
      lastModified: Date.now(),
      isExcluded: false,
      children,
    };
  }

  // ========================================================================
  // Private: Cache Operations
  // ========================================================================

  /**
   * Load snapshot from cache
   *
   * @returns Cached snapshot or null
   */
  private async loadCachedSnapshot(): Promise<ViagentFileTreeSnapshot | null> {
    try {
      const snapshotPath = this.getSnapshotPath();
      const data = await this.gateway.read(snapshotPath);
      const text = new TextDecoder().decode(data);
      const snapshot = JSON.parse(text) as ViagentFileTreeSnapshot;

      // Validate project ID
      if (snapshot.projectId !== this.projectId) {
        console.warn('[FileTreeScanner] Cached snapshot has wrong project ID');
        return null;
      }

      console.log(`[FileTreeScanner] Loaded cached snapshot: ${snapshot.fileCount} files`);
      return snapshot;
    } catch (error) {
      // Cache doesn't exist or is invalid
      return null;
    }
  }

  /**
   * Save snapshot to cache
   *
   * @param snapshot - Snapshot to cache
   */
  private async saveSnapshot(snapshot: ViagentFileTreeSnapshot): Promise<void> {
    try {
      const snapshotPath = this.getSnapshotPath();
      const text = JSON.stringify(snapshot, null, 2);
      const data = new TextEncoder().encode(text);

      await this.gateway.write(snapshotPath, data);
      console.log(`[FileTreeScanner] Saved snapshot: ${snapshot.fileCount} files`);
    } catch (error) {
      console.error('[FileTreeScanner] Failed to save snapshot:', error);
    }
  }

  /**
   * Mark current snapshot as stale
   */
  private async markSnapshotStale(): Promise<void> {
    if (this.currentSnapshot) {
      this.currentSnapshot.isStale = true;
      await this.saveSnapshot(this.currentSnapshot);
    }
  }

  /**
   * Get snapshot file path
   */
  private getSnapshotPath(): string {
    return `${VIAGENT_FOLDER_NAME}/${VIAGENT_FILES.FILE_TREE_SNAPSHOT}`;
  }

  // ========================================================================
  // Private: Utilities
  // ========================================================================

  /**
   * Check if path should be excluded
   *
   * @param path - File path to check
   * @returns true if excluded
   */
  private isPathExcluded(path: string): boolean {
    const segments = path.split('/');

    // Check each segment against exclusion patterns
    for (const segment of segments) {
      if (this.excludePatterns.includes(segment)) {
        return true;
      }
    }

    // Check if any parent directory is excluded
    for (const pattern of this.excludePatterns) {
      if (path.includes(`/${pattern}/`) || path.startsWith(`${pattern}/`)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Collect all paths from a tree entry (flat)
   *
   * @param entry - Root entry
   * @param paths - Accumulated paths (internal)
   * @returns Set of all paths
   */
  private collectPaths(
    entry: ViagentFileTreeEntry,
    paths: Set<string> = new Set()
  ): Set<string> {
    paths.add(entry.path);

    if (entry.children) {
      for (const child of entry.children) {
        this.collectPaths(child, paths);
      }
    }

    return paths;
  }

  /**
   * Find entry by path in tree
   *
   * @param root - Root entry
   * @param targetPath - Path to find
   * @returns Entry or null if not found
   */
  private findEntry(
    root: ViagentFileTreeEntry,
    targetPath: string
  ): ViagentFileTreeEntry | null {
    if (root.path === targetPath) {
      return root;
    }

    if (root.children) {
      for (const child of root.children) {
        // Check if targetPath could be under this child
        if (targetPath.startsWith(child.path + '/')) {
          const found = this.findEntry(child, targetPath);
          if (found) return found;
        }
      }
    }

    return null;
  }

  /**
   * Check if entry was modified
   *
   * @param oldEntry - Previous entry
   * @param newEntry - Current entry
   * @returns true if modified
   */
  private isEntryModified(
    oldEntry: ViagentFileTreeEntry,
    newEntry: ViagentFileTreeEntry
  ): boolean {
    return (
      oldEntry.lastModified !== newEntry.lastModified ||
      oldEntry.size !== newEntry.size ||
      oldEntry.kind !== newEntry.kind
    );
  }

  /**
   * Collect statistics from tree
   *
   * @param root - Root entry
   * @returns Statistics
   */
  private collectStats(root: ViagentFileTreeEntry): {
    fileCount: number;
    directoryCount: number;
    maxDepth: number;
  } {
    let fileCount = 0;
    let directoryCount = 0;
    let maxDepth = 0;

    const traverse = (entry: ViagentFileTreeEntry, depth: number): void => {
      if (entry.kind === 'file') {
        fileCount++;
      } else {
        directoryCount++;
      }

      maxDepth = Math.max(maxDepth, depth);

      if (entry.children) {
        for (const child of entry.children) {
          if (!child.isExcluded) {
            traverse(child, depth + 1);
          }
        }
      }
    };

    traverse(root, 0);

    return { fileCount, directoryCount, maxDepth };
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Create file tree scanner for a project
 *
 * @param gateway - Storage gateway
 * @param projectId - Project ID
 * @param options - Scanner options
 * @returns FileTreeScanner instance
 */
export function createFileTreeScanner(
  gateway: StorageGateway,
  projectId: string,
  options?: FileTreeScanOptions
): FileTreeScanner {
  return new FileTreeScanner(gateway, projectId, options);
}

/**
 * Quick load: Get snapshot instantly (cached) or throw
 *
 * @param gateway - Storage gateway
 * @param projectId - Project ID
 * @returns Cached snapshot or null
 *
 * @remarks
 * This is a convenience function for components that need
 * instant access and can handle null by showing loading state.
 */
export async function loadSnapshotFast(
  gateway: StorageGateway,
  projectId: string
): Promise<ViagentFileTreeSnapshot | null> {
  const scanner = new FileTreeScanner(gateway, projectId);
  const result = await scanner.loadOrScan();

  if (result.cached) {
    return result.snapshot;
  }

  // Fresh scan completed, return it
  return result.snapshot;
}

/**
 * Load or scan with auto-refresh
 *
 * @param gateway - Storage gateway
 * @param projectId - Project ID
 * @param onRefresh - Callback when refresh completes
 * @returns Snapshot (may be stale initially)
 *
 * @remarks
 * Loads instantly (may be stale), triggers background refresh,
 * and calls onRefresh when complete.
 */
export async function loadWithAutoRefresh(
  gateway: StorageGateway,
  projectId: string,
  onRefresh?: (snapshot: ViagentFileTreeSnapshot) => void
): Promise<ViagentFileTreeSnapshot> {
  const scanner = new FileTreeScanner(gateway, projectId);
  const result = await scanner.loadOrScan();

  if (result.cached) {
    // Trigger background refresh
    scanner.refreshInBackground().then((fresh) => {
      onRefresh?.(fresh);
    }).catch(console.error);
  }

  return result.snapshot;
}
