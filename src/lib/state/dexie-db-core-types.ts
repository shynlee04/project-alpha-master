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

// ============================================================================
// Core Record Types
// ============================================================================

/**
 * Workspace binding configuration for project association
 */
export interface WorkspaceBindings {
    ide?: boolean;
    notes?: boolean;
    knowledge?: boolean;
    study?: boolean;
}

/**
 * Project metadata stored in IndexedDB
 */
export interface ProjectRecord {
    id: string;
    name: string;
    path: string;
    lastOpened: Date;
    createdAt: Date;
    /** Story WB-1: Workspace binding configuration */
    workspaceBindings?: WorkspaceBindings;
    /** Story WB-1: File snapshot feature flag */
    fileSnapshotEnabled?: boolean;
}

/**
 * IDE state per project (panel layouts, open files, etc.)
 */
export interface IDEStateRecord {
    projectId: string;
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
 */
export interface ConversationRecord {
    id: string;
    projectId: string;
    messages: unknown[];
    toolResults?: unknown[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * File snapshot metadata (lightweight, for fast file tree loads)
 * Story WB-2: File Snapshot Store
 */
export interface FileSnapshotRecord {
    id?: number; // Auto-increment primary key
    projectId: string;
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
 */
export interface FileContentCacheRecord {
    projectId: string;
    path: string; // File path relative to project root
    content: string; // Full file content (potentially large)
}

// ============================================================================
// Table Type Exports
// ============================================================================

export type ProjectsTable = Table<ProjectRecord, string>;
export type IDEStateTable = Table<IDEStateRecord, string>;
export type ConversationsTable = Table<ConversationRecord, string>;
export type FileSnapshotsTable = Table<FileSnapshotRecord, number>;
export type FileContentCacheTable = Table<FileContentCacheRecord, string>;
