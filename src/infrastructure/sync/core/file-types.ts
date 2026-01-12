/**
 * @fileoverview File Type Definitions - Domain Re-exports
 * @module infrastructure/sync/core/file-types
 *
 * ⚠️ DEPRECATED: These types are now re-exported from the domain layer.
 * See: /src/domain/interfaces/storage-adapter.interface.ts
 *
 * This file exists for backward compatibility during migration.
 * Consumers should import directly from @domain/interfaces/storage-adapter.interface
 */

import type { FileSyncState } from './sync-core-types.js';

// Re-export from domain layer (Clean Architecture)
// See: /src/domain/interfaces/storage-adapter.interface.ts
export type {
  FileMetadata,
  FileContent,
  FileChangeEvent
} from '@/domain/interfaces/storage-adapter.interface';

/**
 * @deprecated - Use FileSyncState from domain layer
 */
export type { FileSyncState } from './sync-core-types.js';
