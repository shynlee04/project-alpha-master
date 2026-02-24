/**
 * File System Module - Barrel Export (FACADE)
 * @module lib/filesystem
 *
 * **@deprecated FACADE PATTERN**: This module re-exports from infrastructure/filesystem
 * to maintain backward compatibility while complying with Clean Architecture.
 *
 * **MIGRATION REQUIRED**: Update imports to use canonical paths:
 *   OLD: import { LocalFSAdapter } from '@/lib/filesystem';
 *   NEW: import { LocalFSAdapter } from '@/infrastructure/filesystem';
 *
 * The actual implementation has been moved to:
 *   src/infrastructure/filesystem/
 *
 * **Timeline**: This facade will be removed after 2 weeks (2026-01-22)
 * **Epic**: EPIC-38 Clean Architecture Compliance
 * **Story**: 38-03
 */

// ============================================================================
// Re-exports from infrastructure/filesystem (Main File System APIs)
// @deprecated Import from '@/infrastructure/filesystem' instead
// ============================================================================

// Error classes
/** @deprecated Use `import { FileSystemError } from '@/infrastructure/filesystem'` instead */
export { FileSystemError } from '@/infrastructure/filesystem';
/** @deprecated Use `import { PermissionDeniedError } from '@/infrastructure/filesystem'` instead */
export { PermissionDeniedError } from '@/infrastructure/filesystem';

// Type definitions
/** @deprecated Use `import type { DirectoryEntry } from '@/infrastructure/filesystem'` instead */
export type { DirectoryEntry } from '@/infrastructure/filesystem';
/** @deprecated Use `import type { FileReadResult } from '@/infrastructure/filesystem'` instead */
export type { FileReadResult } from '@/infrastructure/filesystem';
/** @deprecated Use `import type { FileReadBinaryResult } from '@/infrastructure/filesystem'` instead */
export type { FileReadBinaryResult } from '@/infrastructure/filesystem';

// Path utilities
/** @deprecated Use `import { validatePath } from '@/infrastructure/filesystem'` instead */
export { validatePath } from '@/infrastructure/filesystem';
/** @deprecated Use `import { isTraversalAttempt } from '@/infrastructure/filesystem'` instead */
export { isTraversalAttempt } from '@/infrastructure/filesystem';
/** @deprecated Use `import { parsePathSegments } from '@/infrastructure/filesystem'` instead */
export { parsePathSegments } from '@/infrastructure/filesystem';

// LocalFSAdapter exports
/** @deprecated Use `import { LocalFSAdapter } from '@/infrastructure/filesystem'` instead */
export { LocalFSAdapter } from '@/infrastructure/filesystem';
/** @deprecated Use `import { localFS } from '@/infrastructure/filesystem'` instead */
export { localFS } from '@/infrastructure/filesystem';

// ============================================================================
// Sync operations (sync types moved to infrastructure, manager remains in lib)
// @deprecated Sync types: Import from '@/infrastructure/sync/types' instead
// @deprecated Sync manager: Remains here for now (future epic)
// ============================================================================

/** @deprecated Sync types moved - use `import type { SyncConfig } from '@/infrastructure/sync/types'` instead */
export type { SyncConfig, SyncProgress, SyncResult, SyncStatus, SyncErrorCode } from '@/infrastructure/sync/types';

/** @deprecated Sync types moved - use `import { SyncError } from '@/infrastructure/sync/types'` instead */
export { SyncError, DEFAULT_SYNC_CONFIG, BINARY_EXTENSIONS } from '@/infrastructure/sync/types';

/** @deprecated Sync manager - remains in lib for now, will move to infrastructure in future epic */
export { SyncManager, createSyncManager } from './sync-manager';

/** @deprecated File walker utilities - will move to infrastructure in future epic */
export { isExcluded, isBinaryFile, readFileContent } from './sync-utils';

/** @deprecated File walker types - will move to infrastructure in future epic */
export type { WalkDirectoryEntry } from './directory-walker';

/** @deprecated File walker utilities - will move to infrastructure in future epic */
export { walkDirectory, walkDirectorySegments } from './directory-walker';

// ============================================================================
// File snapshot store (Story WB-2)
// @deprecated These remain in lib for now, will move to infrastructure in future epic
// ============================================================================

/** @deprecated File snapshot store - remains in lib for now */
export { FileSnapshotStore, fileSnapshotStore } from './file-snapshot-store';

/** @deprecated File snapshot store types - remains in lib for now */
export type { CacheLookupResult, SnapshotSaveResult } from './file-snapshot-store';

// ============================================================================
// Hash utilities (Story WB-3)
// @deprecated These remain in lib for now, will move to infrastructure in future epic
// ============================================================================

/** @deprecated Hash utilities - remains in lib for now */
export { computeSHA256, computeSHA256FromBuffer } from './hash-utils';

// ============================================================================
// Project context provider (Story WB-3)
// @deprecated These remain in lib for now, will move to infrastructure in future epic
// ============================================================================

/** @deprecated Project context provider - remains in lib for now */
export { ProjectContextProvider } from './project-context-provider';

/** @deprecated Project context provider types - remains in lib for now */
export type {
  CachedFileReadResult,
  CachedFileReadBinaryResult,
} from './project-context-provider';

// ============================================================================
// Exclusion configuration
// @deprecated These remain in lib for now, will move to infrastructure in future epic
// ============================================================================

/** @deprecated Exclusion configuration - remains in lib for now */
export {
  DEFAULT_EXCLUSION_PATTERNS,
  EXTENDED_DEFAULT_PATTERNS,
  isPathExcluded,
  mergeExclusionPatterns,
  validateExclusionPattern,
  parsePatternInput,
  formatPatternsForDisplay,
} from './exclusion-config';
