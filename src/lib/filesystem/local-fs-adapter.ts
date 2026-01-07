/**
 * @fileoverview File System Access Adapter Facade
 * @module lib/filesystem/local-fs-adapter
 *
 * **FACADE PATTERN**: This file re-exports from infrastructure/filesystem
 * to maintain backward compatibility while complying with Clean Architecture.
 *
 * The actual implementation has been moved to:
 *   src/infrastructure/filesystem/local-fs-adapter.ts
 *
 * **Migration Guide**: Update imports from:
 *   import { LocalFSAdapter } from '@/lib/filesystem';
 * To:
 *   import { LocalFSAdapter } from '@/infrastructure/filesystem';
 */

// Re-export all exports from infrastructure
export {
  FileSystemError,
  PermissionDeniedError,
  LocalFSAdapter,
  localFS,
} from '@/infrastructure/filesystem';

// Re-export types for convenience
export type {
  DirectoryEntry,
  FileReadResult,
  FileReadBinaryResult,
} from '@/infrastructure/filesystem';
