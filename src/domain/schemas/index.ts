/**
 * @fileoverview Domain Schema Barrel Export
 * @module domain/schemas
 *
 * Canonical Zod schemas for all domain entities.
 * Types are derived from schemas using z.infer.
 *
 * Usage:
 * ```typescript
 * import { ProjectSchema, type Project } from '@/domain/schemas';
 *
 * // Validate data at runtime
 * const project = ProjectSchema.parse(rawData);
 *
 * // Use type for compile-time safety
 * function updateProject(project: Project) { ... }
 * ```
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @phase 02 - Schema Definitions
 */

// ============================================================================
// Project Schemas
// ============================================================================

export {
  // Schemas
  ProjectSchema,
  LayoutConfigSchema,
  StorageTypeSchema,
  DeviceTypeSchema,
  ProjectCreateParamsSchema,
  ProjectUpdateParamsSchema,
  // Types
  type Project,
  type LayoutConfig,
  type StorageType,
  type DeviceType,
  type ProjectCreateParams,
  type ProjectUpdateParams,
} from './project.schema';

// ============================================================================
// File Schemas
// ============================================================================

export {
  // Schemas
  FileMetadataSchema,
  FileSyncStatusSchema,
  SyncStatusValueSchema,
  FileSyncStateSchema,
  StorageFileMetadataSchema,
  // Types
  type FileMetadata,
  type FileSyncStatus,
  type SyncStatusValue,
  type FileSyncState,
  type StorageFileMetadata,
} from './file.schema';

// ============================================================================
// Thread Schemas
// ============================================================================

export {
  // Schemas
  ThreadSchema,
  ThreadMessageSchema,
  ThreadToolCallSchema,
  ThreadHierarchyNodeSchema,
  ThreadCreateParamsSchema,
  ThreadUpdateParamsSchema,
  // Types
  type Thread,
  type ThreadMessage,
  type ThreadToolCall,
  type ThreadHierarchyNode,
  type ThreadCreateParams,
  type ThreadUpdateParams,
} from './thread.schema';

// ============================================================================
// Note Schemas
// ============================================================================

export {
  // Schemas
  NoteSchema,
  NoteCreateParamsSchema,
  NoteUpdateParamsSchema,
  NoteTreeNodeSchema,
  // Types
  type Note,
  type NoteCreateParams,
  type NoteUpdateParams,
  type NoteTreeNode,
} from './note.schema';
