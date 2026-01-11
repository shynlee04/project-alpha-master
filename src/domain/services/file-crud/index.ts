/**
 * @fileoverview File CRUD Service Barrel Exports
 * @module domain/services/file-crud
 *
 * Unified file CRUD service for both user and agent operations.
 *
 * @epic EPIC-FS - File System & Workspace Architecture
 * @story FS-06 - Unified CRUD interface for users + agents
 */

// Types
export type {
  OperationSource,
  CrudErrorCode,
  CrudError,
  CrudResult,
  ContentType,
  FileMetadata,
  FileEntry,
  BaseCrudOptions,
  CreateOptions,
  ReadOptions,
  UpdateOptions,
  DeleteOptions,
  ListOptions,
  MoveOptions,
  CopyOptions,
} from './file-crud-types';

// Type utilities
export {
  OperationSourceSchema,
  CrudErrorCodeSchema,
  CrudErrorSchema,
  FileMetadataSchema,
  FileEntrySchema,
  success,
  failure,
  failureFrom,
  detectContentType,
  getMimeType,
  createFileMetadata,
} from './file-crud-types';

// Interface
export type { IFileCrudService } from './file-crud-service';
export {
  DEFAULT_USER_OPTIONS,
  DEFAULT_AGENT_OPTIONS,
} from './file-crud-service';

// Implementation
export type {
  FileOperationsAdapter,
  UnifiedFileCrudConfig,
} from './unified-file-crud';
export {
  UnifiedFileCrudService,
  createUnifiedFileCrudService,
} from './unified-file-crud';
