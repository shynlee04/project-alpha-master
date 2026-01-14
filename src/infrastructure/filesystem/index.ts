/**
 * @fileoverview File System Infrastructure Barrel Export
 * @module infrastructure/filesystem
 *
 * File System Access API wrapper for local file operations.
 * Moved from src/lib/filesystem to comply with Clean Architecture.
 *
 * **Architecture**: Infrastructure Layer
 * - Wraps browser File System Access API
 * - Provides LocalFSAdapter for directory/file operations
 * - Includes path utilities and error handling
 *
 * @example
 * ```ts
 * import { LocalFSAdapter, localFS } from '@/infrastructure/filesystem';
 *
 * const adapter = new LocalFSAdapter();
 * await adapter.requestDirectoryAccess();
 * const content = await adapter.readFile('README.md');
 * ```
 */

// ============================================================================
// Error Classes
// ============================================================================

export { FileSystemError, PermissionDeniedError } from './fs-errors';

// ============================================================================
// Type Definitions
// ============================================================================

export type { DirectoryEntry, FileReadResult, FileReadBinaryResult } from './fs-types';

// ============================================================================
// Path Utilities
// ============================================================================

export { validatePath, isTraversalAttempt } from './path-guard';
export { parsePathSegments } from './path-utils';

// ============================================================================
// File System Operations
// ============================================================================

export { readFile, writeFile, deleteFile } from './file-ops';
export { duplicateFile, downloadFile, copyPathToClipboard, revealInFileManager, validateFileName } from './file-ops';

// ============================================================================
// Directory Operations
// ============================================================================

export { listDirectory, createDirectory, deleteDirectory, rename } from './dir-ops';

// ============================================================================
// Handle Utilities
// ============================================================================

export { getFileHandleFromPath, getDirectoryHandleFromPath } from './handle-utils';
export { walkDirectorySegments } from './fs-handle-utils';

// ============================================================================
// Permission Lifecycle (FSA Handle Persistence)
// ============================================================================
// NOTE: Re-exported from lib/filesystem/permission-lifecycle
// These handle FSA permission state and handle persistence via Dexie
// TODO: Move permission-lifecycle.ts to infrastructure/filesystem

export type { FsaPermissionState } from '@/lib/filesystem/permission-lifecycle';
export {
  getPermissionState,
  ensureReadWritePermission,
  restorePermission,
  isPersistentPermissionSupported,
} from '@/lib/filesystem/permission-lifecycle';

// ============================================================================
// Main Adapter
// ============================================================================

export { LocalFSAdapter, localFS } from './local-fs-adapter';

// ============================================================================
// FSA Storage Adapter (Implements StorageAdapter interface)
// ============================================================================

export {
  FSAStorageAdapter,
  createFSAStorageAdapter,
  getFSAStorageAdapter,
} from './fsa-storage-adapter';

// ============================================================================
// Platform Contract (ARC-A01: getPlatformContract)
// ============================================================================

export {
  getPlatformContract,
  invalidatePlatformCache,
  meetsPlatformRequirements,
  getPlatformInfoForLogging,
  type PlatformContract,
  type DeviceType,
  type StorageType,
} from './platform-contract';

// ============================================================================
// Storage Gateway Factory (ARC-B01: StorageGateway abstraction)
// ============================================================================

export {
  storageGatewayFactory,
  createStorageGateway,
  createFSAGateway,
  createIDBGateway,
  StorageGatewayFactoryImpl,
} from './storage-gateway-factory';

export type {
  StorageGateway,
  StorageGatewayFactory as IStorageGatewayFactory,
} from '@/domain/interfaces/storage-gateway.interface';

// ============================================================================
// FSA Gateway (ARC-B02: FSAGateway implementation)
// ============================================================================

export { FSAGateway } from './fsa-gateway';

// ============================================================================
// IDB Gateway (ARC-B03: IDBGateway implementation)
// ============================================================================

export { IDBGateway } from './idb-gateway';

// ============================================================================
// .viagent/ Metadata Service (ARC-B10: Metadata folder structure)
// ============================================================================

export {
  ViagentService,
  createViagentService,
  initializeViagentFolder,
} from './viagent-service';

export type {
  ViagentInitOptions,
  MetadataResult,
} from './viagent-service';

// Re-export from domain/types
export {
  VIAGENT_FOLDER_NAME,
  VIAGENT_FILES,
  CURRENT_VERSION,
  createDefaultProjectMetadata,
  createEmptyNotesIndex,
  createInitialFileTreeSnapshot,
} from '@/domain/types/viagent-metadata';

export type {
  ViagentProjectMetadata,
  ViagentNotesIndex,
  ViagentNoteEntry,
  ViagentNoteFolder,
  ViagentFileTreeSnapshot,
  ViagentFileTreeEntry,
  ViagentVersion,
} from '@/domain/types/viagent-metadata';

// ============================================================================
// Markdown Sync Service (ARC-B11: Notes ↔ Markdown bidirectional sync)
// ============================================================================

export {
  MarkdownSyncService,
  createMarkdownSyncService,
  noteToMarkdownString,
  parseMarkdownFileContent,
} from './markdown-sync-service';

export type {
  MarkdownMetadata,
  ParsedMarkdownFile,
  SyncDirection,
  SyncConflictEvent,
  SyncStats,
  MarkdownSyncConfig,
} from './markdown-sync-service';

// ============================================================================
// File Tree Scanner (ARC-B06: Snapshot caching for fast project load)
// ============================================================================

export {
  FileTreeScanner,
  createFileTreeScanner,
  loadSnapshotFast,
  loadWithAutoRefresh,
} from './file-tree-scanner';

export type {
  FileTreeScanOptions,
  FileTreeScanProgress,
  FileTreeScanResult,
  FileTreeDiff,
} from './file-tree-scanner';
