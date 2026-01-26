/**
 * @fileoverview File Change Detector
 * @module lib/watcher/change-detector
 *
 * Detects file modifications using content hash, size, and mtime comparison.
 * Provides detailed change information and conflict detection.
 *
 * @story S-039 - File Watcher with Auto-Reload and Change Detection
 */

import type { FileChangeEvent } from './file-watcher';

export interface FileMetadata {
  path: string;
  size: number;
  mtime: number;
  hash: string;
  encoding: 'utf-8' | 'utf-16' | 'ascii' | 'binary';
}

export interface ChangeDetails {
  hasChanged: boolean;
  changeType: 'content' | 'metadata' | 'deleted' | 'none';
  sizeChanged: boolean;
  contentChanged: boolean;
  mtimeChanged: boolean;
  oldSize?: number;
  newSize?: number;
  oldHash?: string;
  newHash?: string;
}

export interface ConflictInfo {
  hasConflict: boolean;
  reason: 'unsaved_changes' | 'concurrent_edit' | 'none';
  localContent?: string;
  externalContent?: string;
}

/**
 * Simple hash function for content comparison
 *
 * Note: This is a basic implementation. For production use,
 * consider using crypto.subtle.digest() for SHA-256 hashing.
 */
export async function computeContentHash(content: string): Promise<string> {
  // Simple hash for quick comparison
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

/**
 * Detect text encoding
 */
export function detectEncoding(content: Uint8Array): 'utf-8' | 'utf-16' | 'ascii' | 'binary' {
  // Check for UTF-16 BOM
  if (content.length >= 2) {
    if (content[0] === 0xFE && content[1] === 0xFF) return 'utf-16';
    if (content[0] === 0xFF && content[1] === 0xFE) return 'utf-16';
  }

  // Check for UTF-8 BOM
  if (content.length >= 3 && content[0] === 0xEF && content[1] === 0xBB && content[2] === 0xBF) {
    return 'utf-8';
  }

  // Check if content is ASCII (all bytes <= 127)
  let isAscii = true;
  for (let i = 0; i < Math.min(content.length, 1000); i++) {
    if (content[i] > 127) {
      isAscii = false;
      break;
    }
  }

  if (isAscii) return 'ascii';

  // Default to UTF-8
  return 'utf-8';
}

/**
 * Check if file is binary based on content
 */
export function isBinaryContent(content: Uint8Array): boolean {
  // Check for null bytes (common in binary files)
  for (let i = 0; i < Math.min(content.length, 1000); i++) {
    if (content[i] === 0) {
      return true;
    }
  }

  // Check for high ratio of non-printable characters
  let nonPrintable = 0;
  const sampleSize = Math.min(content.length, 1000);

  for (let i = 0; i < sampleSize; i++) {
    const byte = content[i];
    // ASCII printable range: 32-126
    if (byte < 32 || byte > 126) {
      nonPrintable++;
    }
  }

  // If more than 30% non-printable, likely binary
  return nonPrintable / sampleSize > 0.3;
}

/**
 * Get file metadata
 *
 * Note: In browser environment, this would use WebContainer API or similar.
 */
export async function getFileMetadata(path: string): Promise<FileMetadata | null> {
  try {
    // Placeholder - implement based on your platform
    // For WebContainer: const fs = await getWebContainer().fs;
    // For File System Access API: await fileHandle.getFile()

    console.warn('[ChangeDetector] getFileMetadata not implemented for this platform');
    return null;
  } catch (error) {
    console.error('[ChangeDetector] Failed to get file metadata:', path, error);
    return null;
  }
}

/**
 * Compare file metadata to detect changes
 */
export function compareMetadata(oldMeta: FileMetadata, newMeta: FileMetadata): ChangeDetails {
  const sizeChanged = oldMeta.size !== newMeta.size;
  const mtimeChanged = oldMeta.mtime !== newMeta.mtime;
  const contentChanged = oldMeta.hash !== newMeta.hash;

  let changeType: ChangeDetails['changeType'] = 'none';

  if (contentChanged) {
    changeType = 'content';
  } else if (mtimeChanged || sizeChanged) {
    changeType = 'metadata';
  }

  return {
    hasChanged: changeType !== 'none',
    changeType,
    sizeChanged,
    contentChanged,
    mtimeChanged,
    oldSize: oldMeta.size,
    newSize: newMeta.size,
    oldHash: oldMeta.hash,
    newHash: newMeta.hash
  };
}

/**
 * Detect conflict between local unsaved changes and external changes
 */
export function detectConflict(
  localContent: string,
  externalContent: string,
  localHash: string,
  externalHash: string
): ConflictInfo {
  // If hashes match, no conflict
  if (localHash === externalHash) {
    return { hasConflict: false, reason: 'none' };
  }

  // Content differs - check if local has unsaved changes
  const hasUnsavedChanges = localHash !== externalHash;

  if (hasUnsavedChanges) {
    return {
      hasConflict: true,
      reason: 'unsaved_changes',
      localContent,
      externalContent
    };
  }

  return {
    hasConflict: false,
    reason: 'none'
  };
}

/**
 * Classify change type from event
 */
export function classifyChange(event: FileChangeEvent): 'created' | 'modified' | 'deleted' | 'moved' {
  return event.type;
}

/**
 * Check if change should trigger notification
 */
export function shouldNotify(change: ChangeDetails, _contentType: string): boolean {
  // Don't notify for metadata-only changes
  if (change.changeType === 'metadata' && !change.contentChanged) {
    return false;
  }

  // Always notify for content changes
  return true;
}

/**
 * File Change Detector
 *
 * Tracks file metadata and detects changes using multiple strategies.
 */
export class FileChangeDetector {
  private metadataCache = new Map<string, FileMetadata>();
  private unsavedChanges = new Map<string, string>(); // path -> content
  private savedHashes = new Map<string, string>(); // path -> last saved hash

  /**
   * Register a file for change detection
   */
  async registerFile(path: string, content?: string): Promise<void> {
    const metadata = await getFileMetadata(path);
    if (metadata) {
      this.metadataCache.set(path, metadata);
    }

    if (content) {
      const hash = await computeContentHash(content);
      this.savedHashes.set(path, hash);
    }
  }

  /**
   * Unregister a file from change detection
   */
  unregisterFile(path: string): void {
    this.metadataCache.delete(path);
    this.unsavedChanges.delete(path);
    this.savedHashes.delete(path);
  }

  /**
   * Track unsaved changes for conflict detection
   */
  trackUnsavedChanges(path: string, content: string): void {
    this.unsavedChanges.set(path, content);
  }

  /**
   * Clear unsaved changes (e.g., after save or reload)
   */
  clearUnsavedChanges(path: string): void {
    this.unsavedChanges.delete(path);
  }

  /**
   * Check for changes in a file
   */
  async detectChanges(path: string): Promise<ChangeDetails | null> {
    const oldMetadata = this.metadataCache.get(path);
    if (!oldMetadata) {
      return null;
    }

    const newMetadata = await getFileMetadata(path);
    if (!newMetadata) {
      // File was deleted
      this.metadataCache.delete(path);
      return {
        hasChanged: true,
        changeType: 'deleted',
        sizeChanged: true,
        contentChanged: true,
        mtimeChanged: true
      };
    }

    const changes = compareMetadata(oldMetadata, newMetadata);

    // Update cache
    if (changes.hasChanged) {
      this.metadataCache.set(path, newMetadata);
    }

    return changes;
  }

  /**
   * Check for conflicts when external changes are detected
   */
  async checkForConflict(path: string, externalContent: string): Promise<ConflictInfo> {
    const unsavedContent = this.unsavedChanges.get(path);
    const savedHash = this.savedHashes.get(path);

    if (!unsavedContent || !savedHash) {
      return { hasConflict: false, reason: 'none' };
    }

    const externalHash = await computeContentHash(externalContent);
    const unsavedHash = await computeContentHash(unsavedContent);

    return detectConflict(unsavedContent, externalContent, unsavedHash, externalHash);
  }

  /**
   * Update saved hash after save/reload
   */
  async updateSavedHash(path: string, content: string): Promise<void> {
    const hash = await computeContentHash(content);
    this.savedHashes.set(path, hash);
    this.clearUnsavedChanges(path);
  }

  /**
   * Get cached metadata for a file
   */
  getMetadata(path: string): FileMetadata | undefined {
    return this.metadataCache.get(path);
  }

  /**
   * Check if file has unsaved changes
   */
  hasUnsavedChanges(path: string): boolean {
    return this.unsavedChanges.has(path);
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.metadataCache.clear();
    this.unsavedChanges.clear();
    this.savedHashes.clear();
  }

  /**
   * Get detector statistics
   */
  getStats() {
    return {
      trackedFiles: this.metadataCache.size,
      filesWithUnsavedChanges: this.unsavedChanges.size
    };
  }
}

/**
 * Global change detector instance
 */
let globalChangeDetector: FileChangeDetector | null = null;

/**
 * Get or create the global change detector instance
 */
export function getChangeDetector(): FileChangeDetector {
  if (!globalChangeDetector) {
    globalChangeDetector = new FileChangeDetector();
  }
  return globalChangeDetector;
}

/**
 * Dispose of the global change detector
 */
export function disposeChangeDetector(): void {
  if (globalChangeDetector) {
    globalChangeDetector.clear();
    globalChangeDetector = null;
  }
}
