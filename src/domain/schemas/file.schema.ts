/**
 * @fileoverview File Metadata Zod Schema - Domain Layer
 * @module domain/schemas/file.schema
 *
 * Canonical Zod schema for file metadata entities.
 * Types are derived from schemas using z.infer for single source of truth.
 *
 * Aligns with:
 * - FileMetadataRecord (infrastructure/persistence/dexie-db-session-types.ts)
 * - FileMetadata (domain/interfaces/storage-adapter.interface.ts)
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @phase 02 - Schema Definitions
 */

import { z } from 'zod';

// ============================================================================
// Shared Enum Schemas
// ============================================================================

/**
 * Sync status value schema.
 * Tracks the synchronization state of a file.
 */
export const SyncStatusValueSchema = z.enum([
  'pending',
  'syncing',
  'synced',
  'error',
  'conflict',
]);

/**
 * File sync state schema.
 * Used by StorageAdapter interface for change detection.
 */
export const FileSyncStateSchema = z.enum([
  'synced',
  'pending',
  'conflict',
  'error',
]);

// ============================================================================
// File Metadata Schema
// ============================================================================

/**
 * File Metadata Schema
 *
 * Canonical schema for file metadata cache (incremental sync).
 * Matches FileMetadataRecord from dexie-db-session-types.ts.
 *
 * Used for:
 * - Change detection during sync
 * - Incremental file sync on project re-entry
 * - File modification tracking
 */
export const FileMetadataSchema = z.object({
  /** Relative file path (primary key) */
  path: z.string().min(1),
  /** Project ID (foreign key) */
  projectId: z.string(),
  /** Unix timestamp of last modification */
  lastModified: z.number(),
  /** File size in bytes */
  size: z.number().nonnegative(),
  /** Optional SHA-256 hash for content verification */
  hash: z.string().optional(),
  /** Timestamp of last successful sync */
  syncedAt: z.number(),
  /** Record creation timestamp */
  createdAt: z.number(),
  /** Record update timestamp */
  updatedAt: z.number(),
});

// ============================================================================
// Storage Adapter File Metadata Schema
// ============================================================================

/**
 * Storage Adapter File Metadata Schema
 *
 * Schema for FileMetadata used by StorageAdapter interface.
 * Simpler structure for storage operations.
 */
export const StorageFileMetadataSchema = z.object({
  /** File path relative to project root */
  path: z.string(),
  /** File size in bytes */
  size: z.number(),
  /** Last modified timestamp (milliseconds since epoch) */
  lastModified: z.number(),
  /** Content MIME type (optional) */
  contentType: z.string().optional(),
  /** Checksum for content comparison (optional) */
  checksum: z.string().optional(),
  /** Sync state of this file */
  syncState: FileSyncStateSchema.optional(),
  /** Last sync timestamp */
  lastSyncedAt: z.number().optional(),
});

// ============================================================================
// File Sync Status Schema
// ============================================================================

/**
 * File Sync Status Schema
 *
 * Tracks detailed synchronization status per file.
 * Used for conflict resolution and retry logic.
 */
export const FileSyncStatusSchema = z.object({
  /** Unique ID for sync status record */
  id: z.string(),
  /** File path */
  path: z.string(),
  /** Current sync status */
  syncStatus: SyncStatusValueSchema,
  /** Local version number */
  localVersion: z.number().optional(),
  /** Remote version number */
  remoteVersion: z.number().optional(),
  /** Last successful sync timestamp */
  lastSyncedAt: z.number().optional(),
  /** Error message if status is 'error' */
  errorMessage: z.string().optional(),
  /** Retry count for failed syncs */
  retryCount: z.number().default(0),
  /** Record creation timestamp */
  createdAt: z.number(),
  /** Record update timestamp */
  updatedAt: z.number(),
});

// ============================================================================
// Derived Types
// ============================================================================

/** File metadata type (matches Dexie record) */
export type FileMetadata = z.infer<typeof FileMetadataSchema>;

/** File sync status type */
export type FileSyncStatus = z.infer<typeof FileSyncStatusSchema>;

/** Sync status value type */
export type SyncStatusValue = z.infer<typeof SyncStatusValueSchema>;

/** File sync state type (StorageAdapter) */
export type FileSyncState = z.infer<typeof FileSyncStateSchema>;

/** Storage adapter file metadata type */
export type StorageFileMetadata = z.infer<typeof StorageFileMetadataSchema>;
