/**
 * @fileoverview File Watcher Module
 * @module lib/watcher
 *
 * Exports file watcher functionality.
 */

export { getFileWatcher, disposeFileWatcher } from './file-watcher';
export type { FileWatcherEngine, FileWatcherOptions, FileChangeEvent, WatchedFile } from './file-watcher';

export { getChangeDetector, disposeChangeDetector } from './change-detector';
export type { FileChangeDetector, FileMetadata, ChangeDetails, ConflictInfo } from './change-detector';

export { computeContentHash, detectEncoding, isBinaryContent, getFileMetadata, compareMetadata, detectConflict, classifyChange, shouldNotify } from './change-detector';
