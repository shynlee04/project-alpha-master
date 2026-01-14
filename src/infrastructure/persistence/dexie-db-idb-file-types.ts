/**
 * @fileoverview IndexedDB File Storage Types
 * @module infrastructure/persistence/dexie-db-idb-file-types
 *
 * **ARC-B03**: IDBGateway file storage types
 *
 * Per ADR-033 Decision D2:
 * - Mobile/Tablet use IndexedDB for file storage
 * - IDBGateway implements StorageGateway interface
 * - Files stored as binary data (Uint8Array)
 *
 * @epic EPIC-CC-ARC
 * @story ARC-B03
 * @author Team B
 * @created 2026-01-17
 */

import type { Table } from 'dexie';

// ============================================================================
// Types
// ============================================================================

/**
 * File kinds supported by IDBGateway
 */
export type IDBFileKind = 'file' | 'directory';

/**
 * IndexedDB file storage record
 *
 * Stores file content and metadata for mobile/tablet projects.
 * Used by IDBGateway to implement StorageGateway interface.
 *
 * Table Schema:
 * - Primary key: composite [projectId + path]
 * - Content: stored as Uint8Array (binary)
 *
 * @example
 * ```ts
 * const record: IDBFileRecord = {
 *   projectId: 'proj_abc123',
 *   path: 'notes/welcome.md',
 *   content: new TextEncoder().encode('# Welcome'),
 *   kind: 'file',
 *   size: 9,
 *   lastModified: Date.now(),
 *   createdAt: Date.now(),
 *   updatedAt: Date.now(),
 * };
 * ```
 */
export interface IDBFileRecord {
  /** Composite key: projectId + path */
  projectId: string;
  /** Relative path from project root (used as secondary key part) */
  path: string;
  /** File content as binary data */
  content: Uint8Array;
  /** File kind (file or directory) */
  kind: IDBFileKind;
  /** File size in bytes */
  size: number;
  /** Last modified timestamp */
  lastModified: number;
  /** Creation timestamp */
  createdAt: number;
  /** Update timestamp */
  updatedAt: number;
}

// ============================================================================
// Table Type
// ============================================================================

/**
 * IndexedDB file storage table type
 *
 * Dexie Table type for IDBFileRecord with compound primary key.
 */
export type IDBFilesTable = Table<
  IDBFileRecord,
  [string, string]  // Compound primary key: [projectId, path]
>;

// ============================================================================
// ID Functions
// ============================================================================

/**
 * No ID generation needed - using compound key [projectId, path]
 */
