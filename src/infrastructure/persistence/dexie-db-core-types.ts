/**
 * @fileoverview Core Database Record Types
 * @module lib/state/dexie-db-core-types
 * @governance EPIC-27-1c
 *
 * Core record types for IndexedDB persistence.
 * Extracted from dexie-db.ts for better code organization.
 *
 * Story 27-1: State Architecture Stabilization
 * Story 27-1c: Persistence Migration (idb → Dexie)
 */

import type { Table } from 'dexie';
import type { WorkspaceBindings } from '@/domain/entities/project';

// ============================================================================
// Shared Types
// ============================================================================

/**
 * Workspace identifier type
 * Used across the application for workspace-specific operations
 */
export type WorkspaceId = 'ide' | 'knowledge' | 'study' | 'notes';

// ============================================================================
// Core Record Types
// ============================================================================

/**
 * Project metadata stored in IndexedDB
 *
 * NOTE: ARC-D03: workspaceBindings is the new canonical field name.
 * bindings is kept for backward compatibility with existing IndexedDB data.
 * Runtime code handles both fields for backwards compatibility.
 *
 * PERSIST-S002: Added workspaceId for cross-workspace isolation
 */
export interface ProjectRecord {
    id: string;
    name: string;
    path: string;
    workspaceId: 'ide' | 'knowledge' | 'study' | 'notes'; // PERSIST-S002: Workspace isolation
    storageType?: 'indexeddb' | 'fsa'; // Storage backend type for project
    lastOpened: Date;
    createdAt: Date;
    // ARC-D03: New canonical field (preferred)
    workspaceBindings?: WorkspaceBindings;
    // Legacy field (kept for backward compatibility - migrated to workspaceBindings)
    bindings?: WorkspaceBindings | Record<string, string>;
    folderPath?: string;
    fileSnapshotEnabled?: boolean;
    // NS-2026-01-07: Temp project support for standalone Notes access
    isTemp?: boolean;
    autoCreated?: boolean;
}

/**
 * IDE state per project (panel layouts, open files, etc.)
 * PERSIST-S002: Added workspaceId for cross-workspace isolation
 */
export interface IDEStateRecord {
    projectId: string;
    workspaceId: 'ide' | 'knowledge' | 'study' | 'notes'; // PERSIST-S002: Workspace isolation
    openFiles: string[];
    activeFile: string | null;
    expandedPaths: string[];  // Stored as array, used as Set in app
    panelLayouts: Record<string, number[]>;
    terminalTab: 'terminal' | 'output' | 'problems';
    chatVisible: boolean;
    activeFileScrollTop?: number;
    updatedAt: Date;
}

/**
 * Conversation record for AI chat history
 * PERSIST-S002: Added workspaceId for cross-workspace isolation
 */
export interface ConversationRecord {
    id: string;
    projectId: string;
    workspaceId: 'ide' | 'knowledge' | 'study' | 'notes'; // PERSIST-S002: Workspace isolation
    messages: unknown[];
    toolResults?: unknown[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * File snapshot metadata (lightweight, for fast file tree loads)
 * Story WB-2: File Snapshot Store
 * PERSIST-S002: Added workspaceId for cross-workspace isolation
 */
export interface FileSnapshotRecord {
    id?: number; // Auto-increment primary key
    projectId: string;
    workspaceId: 'ide' | 'knowledge' | 'study' | 'notes'; // PERSIST-S002: Workspace isolation
    path: string; // File path relative to project root
    hash: string; // SHA-256 hash for change detection
    size: number; // File size in bytes
    version: number; // Snapshot format version
    lastCachedAt: number; // Timestamp when cached
    expiresAt: number; // Timestamp when cache expires
    hasContent: boolean; // Whether content exists in fileContentCache table
}

/**
 * File content cache (lazy-loaded, only when file is opened)
 * Story WB-2: File Snapshot Store
 * PERSIST-S002: Added workspaceId for cross-workspace isolation
 */
export interface FileContentCacheRecord {
    projectId: string;
    workspaceId: 'ide' | 'knowledge' | 'study' | 'notes'; // PERSIST-S002: Workspace isolation
    path: string; // File path relative to project root
    content: string; // Full file content (potentially large)
}

/**
 * Re-export WorkspaceBindings from domain entity
 */
export type { WorkspaceBindings } from '@/domain/entities/project';

// ============================================================================
// Table Type Exports
// ============================================================================

export type ProjectsTable = Table<ProjectRecord, string>;
export type IDEStateTable = Table<IDEStateRecord, string>;
export type ConversationsTable = Table<ConversationRecord, string>;
export type FileSnapshotsTable = Table<FileSnapshotRecord, number>;
export type FileContentCacheTable = Table<FileContentCacheRecord, string>;
