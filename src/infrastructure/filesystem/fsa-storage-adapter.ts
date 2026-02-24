/**
 * @fileoverview FSA Storage Adapter - Implements StorageAdapter interface for File System Access API
 * @module infrastructure/filesystem/fsa-storage-adapter
 *
 * Clean implementation of StorageAdapter interface for desktop File System Access API.
 * This is the PRIMARY storage adapter for desktop users.
 *
 * Features:
 * - Implements full StorageAdapter interface from domain layer
 * - Polling-based file watching for hot reactive updates
 * - Content hashing for external change detection
 * - Binary (Uint8Array) and text support
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story CC-SYNC-01 - Clean Storage Architecture
 */

import type {
  StorageAdapter,
  FileContent,
  FileMetadata,
  FileChangeCallback,
  FileChangeEvent,
} from '@/domain/interfaces/storage-adapter.interface';
import { FileSystemError, PermissionDeniedError } from './fs-errors';
import * as fileOps from './file-ops';
import {
  getFSAHandle,
  storeFSAHandle,
  updateFSAHandleStatus,
} from '@/infrastructure/persistence/dexie-db';

// ============================================================================
// Permission Status Type
// ============================================================================

/**
 * Permission status for FSA handle restoration
 */
export type FSAPermissionStatus = 'granted' | 'prompt' | 'denied' | 'unknown' | 'restoring' | 'dismissed';

// ============================================================================
// Types
// ============================================================================

interface WatchOptions {
  pollInterval?: number;
  debounceMs?: number;
}

interface FileHashEntry {
  path: string;
  hash: string;
  size: number;
  lastModified: number;
}

// ============================================================================
// FSA Storage Adapter
// ============================================================================

/**
 * FSA Storage Adapter
 *
 * Implements StorageAdapter interface using File System Access API.
 * This is the primary storage mechanism for desktop users.
 *
 * @example
 * ```typescript
 * const adapter = new FSAStorageAdapter();
 * await adapter.requestAccess();
 *
 * // Read file
 * const content = await adapter.readFile('src/index.ts');
 * console.log(content.text);
 *
 * // Watch for changes
 * const unwatch = adapter.watch((event) => {
 *   console.log('File changed:', event.path, event.type);
 * });
 * ```
 */
export class FSAStorageAdapter implements StorageAdapter {
  readonly name = 'fsa';

  private directoryHandle: FileSystemDirectoryHandle | null = null;
  private projectId: string | null = null;
  private watchInterval: ReturnType<typeof setInterval> | null = null;
  private fileHashes: Map<string, FileHashEntry> = new Map();
  private watchCallbacks: Set<FileChangeCallback> = new Set();
  private watchOptions: WatchOptions = {
    pollInterval: 2000,
    debounceMs: 300,
  };
  private debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  constructor(options?: { handle?: FileSystemDirectoryHandle | null; projectId?: string }) {
    if (options?.handle) {
      this.directoryHandle = options.handle;
    }
    if (options?.projectId) {
      this.projectId = options.projectId;
    }
  }

  // ============================================================================
  // Lifecycle
  // ============================================================================

  /**
   * Check if FSA is supported in this browser
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
  }

  /**
   * Request directory access from user
   */
  async requestAccess(): Promise<FileSystemDirectoryHandle> {
    if (!FSAStorageAdapter.isSupported()) {
      throw new FileSystemError(
        'File System Access API is not supported in this browser.',
        'API_NOT_SUPPORTED'
      );
    }

    try {
      const handle = await window.showDirectoryPicker();
      this.directoryHandle = handle;
      return handle;
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      if (err.name === 'AbortError') {
        throw new PermissionDeniedError('Directory selection was cancelled.');
      }
      if (err.name === 'NotAllowedError') {
        throw new PermissionDeniedError('Permission was denied.');
      }
      throw new FileSystemError(
        `Failed to access directory: ${err.message || 'Unknown error'}`,
        'DIRECTORY_ACCESS_FAILED',
        error
      );
    }
  }

  /**
   * Set directory handle directly (for restoring from persistence)
   */
  setDirectoryHandle(handle: FileSystemDirectoryHandle): void {
    this.directoryHandle = handle;
  }

  /**
   * Get current directory handle
   */
  getDirectoryHandle(): FileSystemDirectoryHandle | null {
    return this.directoryHandle;
  }

  // ============================================================================
  // Handle Restoration (Page Reload Support)
  // ============================================================================

  /**
   * Query permission status without prompting user
   * 
   * Uses queryPermission API to check if permission is already granted.
   * Returns 'granted' if permission is active, 'prompt' if user needs to re-authorize.
   * 
   * @returns Permission status
   */
  async queryPermission(): Promise<FSAPermissionStatus> {
    if (!this.directoryHandle) {
      return 'unknown';
    }

    try {
      // Use the queryPermission method to check without prompting
      // Type assertion needed as TS DOM lib doesn't fully type these methods
      const handle = this.directoryHandle as FileSystemDirectoryHandle & {
        queryPermission?: (options: { mode: string }) => Promise<string>;
      };
      if (!handle.queryPermission) {
        // API not supported in this browser
        return 'unknown';
      }
      const status = await handle.queryPermission({ mode: 'readwrite' });
      return status as FSAPermissionStatus;
    } catch (error) {
      console.warn('[FSAStorageAdapter] Failed to query permission:', error);
      return 'unknown';
    }
  }

  /**
   * Request permission with user prompt if needed
   * 
   * If permission was 'prompt', this will show the browser permission dialog.
   * Returns 'granted' if user allows, 'denied' if user denies.
   * 
   * @returns Permission status after request
   */
  async requestPermission(): Promise<FSAPermissionStatus> {
    if (!this.directoryHandle) {
      return 'unknown';
    }

    try {
      // Type assertion needed as TS DOM lib doesn't fully type these methods
      const handle = this.directoryHandle as FileSystemDirectoryHandle & {
        requestPermission?: (options: { mode: string }) => Promise<string>;
      };
      if (!handle.requestPermission) {
        // API not supported - try to use the handle directly (may prompt)
        return 'granted';
      }
      const status = await handle.requestPermission({ mode: 'readwrite' });
      return status as FSAPermissionStatus;
    } catch (error: unknown) {
      const err = error as { name?: string };
      if (err.name === 'AbortError') {
        return 'dismissed';
      }
      console.warn('[FSAStorageAdapter] Failed to request permission:', error);
      return 'denied';
    }
  }

  /**
   * Restore FSA handle from IndexedDB and verify permission
   * 
   * This method attempts to restore a previously stored handle.
   * It first queries permission (no user prompt), and if needed,
   * requests permission (with user prompt).
   * 
   * @param projectId - Project ID to restore handle for
   * @returns Object with success status, permission status, and optional handle
   */
  async restoreHandle(projectId: string): Promise<{
    success: boolean;
    status: FSAPermissionStatus;
    handle: FileSystemDirectoryHandle | null;
  }> {
    try {
      // Get stored handle from IndexedDB
      const storedHandle = await getFSAHandle(projectId);
      if (!storedHandle || !storedHandle.handleData) {
        return { success: false, status: 'unknown', handle: null };
      }

      // Set the handle (handleData is the serialized FileSystemDirectoryHandle)
      this.directoryHandle = storedHandle.handleData as FileSystemDirectoryHandle;
      this.projectId = projectId;

      // Update status to restoring
      await updateFSAHandleStatus(projectId, 'restoring');

      // Query permission without prompting
      const permissionStatus = await this.queryPermission();

      if (permissionStatus === 'granted') {
        // Permission already granted - good to go
        await updateFSAHandleStatus(projectId, 'granted');
        return { success: true, status: 'granted', handle: this.directoryHandle };
      }

      if (permissionStatus === 'prompt') {
        // Need to prompt user for permission
        const requestedStatus = await this.requestPermission();
        await updateFSAHandleStatus(projectId, requestedStatus);
        
        if (requestedStatus === 'granted') {
          return { success: true, status: 'granted', handle: this.directoryHandle };
        }
        
        // Permission denied or dismissed
        this.directoryHandle = null;
        return { success: false, status: requestedStatus, handle: null };
      }

      // Permission denied or unknown
      await updateFSAHandleStatus(projectId, permissionStatus);
      this.directoryHandle = null;
      return { success: false, status: permissionStatus, handle: null };

    } catch (error) {
      console.error('[FSAStorageAdapter] Failed to restore handle:', error);
      this.directoryHandle = null;
      return { success: false, status: 'unknown', handle: null };
    }
  }

  /**
   * Store the current handle for later restoration
   * 
   * @param projectId - Project ID to associate with this handle
   * @param workspaceId - Workspace ID (default: 'ide')
   */
  async persistHandle(projectId: string, workspaceId: 'ide' | 'knowledge' | 'study' | 'notes' = 'ide'): Promise<void> {
    if (!this.directoryHandle) {
      throw new FileSystemError('No handle to persist', 'NO_DIRECTORY_ACCESS');
    }

    await storeFSAHandle({
      projectId,
      workspaceId,
      handleData: this.directoryHandle,
      directoryPath: this.directoryHandle.name,
      grantedAt: Date.now(),
      permissionStatus: 'granted',
      lastAccessedAt: Date.now(),
    });

    this.projectId = projectId;
  }

  /**
   * Ensure directory access is granted
   */
  private ensureAccess(): FileSystemDirectoryHandle {
    if (!this.directoryHandle) {
      throw new FileSystemError(
        'No directory access granted. Call requestAccess() first.',
        'NO_DIRECTORY_ACCESS'
      );
    }
    return this.directoryHandle;
  }

  // ============================================================================
  // StorageAdapter Implementation
  // ============================================================================

  /**
   * Check if adapter is available
   */
  isAvailable(): boolean {
    return this.directoryHandle !== null;
  }

  /**
   * Read file content
   */
  async readFile(path: string): Promise<FileContent> {
    const root = this.ensureAccess();

    try {
      const result = await fileOps.readFile(root, path, { encoding: 'binary' });
      const arrayBuffer = (result as { data: ArrayBuffer }).data;
      const data = new Uint8Array(arrayBuffer);

      // Get metadata
      const metadata = await this.getMetadata(path);

      // Also get text representation for text files
      let text: string | undefined;
      if (this.isTextFile(path)) {
        const decoder = new TextDecoder('utf-8');
        text = decoder.decode(data);
      }

      return {
        path,
        data,
        text,
        metadata,
      };
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new FileSystemError(
        `Failed to read file: ${path} - ${err.message || 'Unknown error'}`,
        'READ_FAILED',
        error
      );
    }
  }

  /**
   * Write file content
   */
  async writeFile(path: string, content: Uint8Array): Promise<void> {
    const root = this.ensureAccess();

    try {
      // Convert Uint8Array to string for text files, or use blob for binary
      if (this.isTextFile(path)) {
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(content);
        await fileOps.writeFile(root, path, text);
      } else {
        // For binary files, we need to write as blob
        await this.writeBinaryFile(root, path, content);
      }

      // Update hash after write
      await this.updateFileHash(path);
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new FileSystemError(
        `Failed to write file: ${path} - ${err.message || 'Unknown error'}`,
        'WRITE_FAILED',
        error
      );
    }
  }

  /**
   * Write binary file content
   */
  private async writeBinaryFile(
    root: FileSystemDirectoryHandle,
    path: string,
    content: Uint8Array
  ): Promise<void> {
    const segments = path.split('/').filter(Boolean);
    const fileName = segments.pop()!;

    // Navigate to parent directory
    let dir = root;
    for (const segment of segments) {
      dir = await dir.getDirectoryHandle(segment, { create: true });
    }

    const fileHandle = await dir.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    // Write content - use type assertion to avoid TS buffer type issues
    await writable.write(content as unknown as ArrayBuffer);
    await writable.close();
  }

  /**
   * Delete file
   */
  async deleteFile(path: string): Promise<void> {
    const root = this.ensureAccess();

    try {
      await fileOps.deleteFile(root, path);
      this.fileHashes.delete(path);
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new FileSystemError(
        `Failed to delete file: ${path} - ${err.message || 'Unknown error'}`,
        'DELETE_FAILED',
        error
      );
    }
  }

  /**
   * List files matching pattern
   */
  async listFiles(pattern: string): Promise<string[]> {
    const root = this.ensureAccess();
    const allFiles = await this.getAllFiles(root, '');

    // Simple glob matching
    const regex = this.patternToRegex(pattern);
    return allFiles.filter((file) => regex.test(file));
  }

  /**
   * Recursively get all files
   */
  private async getAllFiles(
    dir: FileSystemDirectoryHandle,
    prefix: string
  ): Promise<string[]> {
    const files: string[] = [];

    // Use values() iterator which is more widely typed
    const entries = (dir as unknown as AsyncIterable<[string, FileSystemHandle]>);
    for await (const [name, handle] of entries) {
      const path = prefix ? `${prefix}/${name}` : name;

      if (handle.kind === 'file') {
        files.push(path);
      } else if (handle.kind === 'directory') {
        // Skip common excluded directories
        if (name === 'node_modules' || name === '.git' || name === 'dist') {
          continue;
        }
        const subFiles = await this.getAllFiles(handle as FileSystemDirectoryHandle, path);
        files.push(...subFiles);
      }
    }

    return files;
  }

  /**
   * Convert glob pattern to regex
   */
  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*\*/g, '{{DOUBLESTAR}}')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.')
      .replace(/{{DOUBLESTAR}}/g, '.*');
    return new RegExp(`^${escaped}$`);
  }

  /**
   * Get file metadata
   */
  async getMetadata(path: string): Promise<FileMetadata> {
    const root = this.ensureAccess();

    try {
      const segments = path.split('/').filter(Boolean);
      const fileName = segments.pop()!;

      let dir = root;
      for (const segment of segments) {
        dir = await dir.getDirectoryHandle(segment);
      }

      const fileHandle = await dir.getFileHandle(fileName);
      const file = await fileHandle.getFile();

      return {
        path,
        size: file.size,
        lastModified: file.lastModified,
        contentType: file.type || this.guessContentType(path),
        syncState: 'synced',
      };
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new FileSystemError(
        `Failed to get metadata: ${path} - ${err.message || 'Unknown error'}`,
        'METADATA_FAILED',
        error
      );
    }
  }

  /**
   * Check if file exists
   */
  async exists(path: string): Promise<boolean> {
    const root = this.ensureAccess();

    try {
      const segments = path.split('/').filter(Boolean);
      const fileName = segments.pop()!;

      let dir = root;
      for (const segment of segments) {
        dir = await dir.getDirectoryHandle(segment);
      }

      await dir.getFileHandle(fileName);
      return true;
    } catch {
      return false;
    }
  }

  // ============================================================================
  // File Watching (Polling-based)
  // ============================================================================

  /**
   * Watch for file changes
   * Uses polling since FSA doesn't have native file watching
   */
  watch(callback: FileChangeCallback): () => void {
    this.watchCallbacks.add(callback);

    // Start polling if not already running
    if (!this.watchInterval) {
      this.startPolling();
    }

    // Return unsubscribe function
    return () => {
      this.watchCallbacks.delete(callback);
      if (this.watchCallbacks.size === 0) {
        this.stopPolling();
      }
    };
  }

  /**
   * Start polling for file changes
   */
  private startPolling(): void {
    if (this.watchInterval) return;

    console.log('[FSAStorageAdapter] Starting file watch polling');

    this.watchInterval = setInterval(async () => {
      await this.checkForChanges();
    }, this.watchOptions.pollInterval);

    // Do initial hash scan
    this.scanAllFiles().catch(console.error);
  }

  /**
   * Stop polling for file changes
   */
  private stopPolling(): void {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
      console.log('[FSAStorageAdapter] Stopped file watch polling');
    }
  }

  /**
   * Scan all files and build hash map
   */
  private async scanAllFiles(): Promise<void> {
    if (!this.directoryHandle) return;

    try {
      const files = await this.getAllFiles(this.directoryHandle, '');

      for (const filePath of files) {
        if (this.shouldWatchFile(filePath)) {
          await this.updateFileHash(filePath);
        }
      }

      console.log(`[FSAStorageAdapter] Scanned ${this.fileHashes.size} files for watching`);
    } catch (error) {
      console.warn('[FSAStorageAdapter] Failed to scan files:', error);
    }
  }

  /**
   * Check for file changes since last poll
   */
  private async checkForChanges(): Promise<void> {
    if (!this.directoryHandle) return;

    try {
      const currentFiles = await this.getAllFiles(this.directoryHandle, '');
      const currentSet = new Set(currentFiles.filter(this.shouldWatchFile.bind(this)));

      // Check for modified and deleted files
      for (const [path, entry] of this.fileHashes) {
        if (!currentSet.has(path)) {
          // File was deleted
          this.emitChange({ type: 'deleted', path, timestamp: Date.now(), source: 'local' });
          this.fileHashes.delete(path);
        } else {
          // Check if modified
          const isModified = await this.isFileModified(path, entry);
          if (isModified) {
            this.emitChange({ type: 'modified', path, timestamp: Date.now(), source: 'local' });
            await this.updateFileHash(path);
          }
        }
      }

      // Check for new files
      for (const path of currentSet) {
        if (!this.fileHashes.has(path)) {
          this.emitChange({ type: 'created', path, timestamp: Date.now(), source: 'local' });
          await this.updateFileHash(path);
        }
      }
    } catch (error) {
      console.warn('[FSAStorageAdapter] Error checking for changes:', error);
    }
  }

  /**
   * Check if file was modified since last hash
   */
  private async isFileModified(path: string, entry: FileHashEntry): Promise<boolean> {
    try {
      const metadata = await this.getMetadata(path);

      // Quick check: size or lastModified changed
      if (metadata.size !== entry.size || metadata.lastModified !== entry.lastModified) {
        return true;
      }

      return false;
    } catch {
      return true; // Assume modified if we can't check
    }
  }

  /**
   * Update file hash in cache
   */
  private async updateFileHash(path: string): Promise<void> {
    try {
      const metadata = await this.getMetadata(path);
      const content = await this.readFile(path);

      // Simple hash based on content length and sample
      const hash = await this.computeHash(content.data);

      this.fileHashes.set(path, {
        path,
        hash,
        size: metadata.size,
        lastModified: metadata.lastModified,
      });
    } catch (error) {
      console.warn(`[FSAStorageAdapter] Failed to hash file: ${path}`, error);
    }
  }

  /**
   * Compute simple hash of content
   */
  private async computeHash(data: Uint8Array): Promise<string> {
    // Use SubtleCrypto if available, otherwise fallback to simple hash
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      // Create new ArrayBuffer copy to avoid SharedArrayBuffer type issues
      const buffer = new ArrayBuffer(data.byteLength);
      new Uint8Array(buffer).set(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    // Simple fallback hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash + data[i]) | 0;
    }
    return hash.toString(16);
  }

  /**
   * Emit change event to all callbacks (debounced)
   */
  private emitChange(event: FileChangeEvent): void {
    // Clear existing timer for this path
    const existingTimer = this.debounceTimers.get(event.path);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Debounce the emission
    const timer = setTimeout(() => {
      for (const callback of this.watchCallbacks) {
        try {
          callback(event);
        } catch (error) {
          console.error('[FSAStorageAdapter] Error in watch callback:', error);
        }
      }
      this.debounceTimers.delete(event.path);
    }, this.watchOptions.debounceMs);

    this.debounceTimers.set(event.path, timer);
  }

  /**
   * Check if file should be watched
   */
  private shouldWatchFile(path: string): boolean {
    // Skip binary files
    const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.woff', '.woff2'];
    const ext = path.substring(path.lastIndexOf('.')).toLowerCase();
    if (binaryExtensions.includes(ext)) return false;

    // Skip node_modules and .git (already filtered in getAllFiles, but double-check)
    if (path.includes('node_modules/') || path.includes('.git/')) return false;

    return true;
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Check if file is a text file based on extension
   */
  private isTextFile(path: string): boolean {
    const textExtensions = [
      '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
      '.json', '.md', '.txt', '.html', '.css', '.scss',
      '.yaml', '.yml', '.xml', '.svg', '.vue', '.svelte',
      '.py', '.rb', '.go', '.rs', '.java', '.c', '.cpp', '.h',
    ];
    const ext = path.substring(path.lastIndexOf('.')).toLowerCase();
    return textExtensions.includes(ext);
  }

  /**
   * Guess content type from file extension
   */
  private guessContentType(path: string): string {
    const ext = path.substring(path.lastIndexOf('.')).toLowerCase();
    const types: Record<string, string> = {
      '.ts': 'text/typescript',
      '.tsx': 'text/typescript',
      '.js': 'text/javascript',
      '.jsx': 'text/javascript',
      '.json': 'application/json',
      '.md': 'text/markdown',
      '.html': 'text/html',
      '.css': 'text/css',
      '.scss': 'text/scss',
    };
    return types[ext] || 'application/octet-stream';
  }

  /**
   * Dispose adapter and clean up resources
   */
  dispose(): void {
    this.stopPolling();
    this.watchCallbacks.clear();
    this.fileHashes.clear();
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();
    this.directoryHandle = null;
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create FSA Storage Adapter
 */
export function createFSAStorageAdapter(): FSAStorageAdapter {
  return new FSAStorageAdapter();
}

/**
 * Singleton instance for convenience
 */
let fsaStorageAdapterInstance: FSAStorageAdapter | null = null;

export function getFSAStorageAdapter(): FSAStorageAdapter {
  if (!fsaStorageAdapterInstance) {
    fsaStorageAdapterInstance = new FSAStorageAdapter();
  }
  return fsaStorageAdapterInstance;
}
