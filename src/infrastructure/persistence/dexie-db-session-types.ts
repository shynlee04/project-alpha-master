/**
 * @fileoverview Session State Database Record Types
 * @module lib/state/dexie-db-session-types
 * @governance EPIC-27-1c
 *
 * Session state and persistence types for IndexedDB.
 * Extracted from dexie-db.ts for better code organization.
 *
 * Story 27-1: State Architecture Stabilization
 * Story 27-1c: Persistence Migration (idb → Dexie)
 */

import type { Table } from 'dexie';

// ============================================================================
// State Persistence (Epic 25 - AI Foundation)
// ============================================================================

/**
 * Generic record for Zustand persistence in Dexie
 * Used by createDexieStorage adapter
 *
 * @epic 25 - AI Foundation Sprint
 * @story 25-1 - Migrate provider config to Zustand
 */
export interface PersistedStateRecord {
    id: string;                 // Storage key (e.g., 'via-gent-providers')
    state: any;                 // JSON-serializable state
    updatedAt: Date;
}

// ============================================================================
// Sync Status Table (RC-005 - Sprint 27B)
// ============================================================================

/**
 * Sync status record for tracking file sync operations
 * Migrated from localStorage to Dexie for better query support
 */
export interface SyncStatusRecord {
    id: string;                 // Primary key (generated from path)
    path: string;               // File path (indexed)
    workspaceId: 'ide' | 'knowledge' | 'study' | 'notes'; // PERSIST-S002: Workspace isolation
    syncStatus: 'pending' | 'syncing' | 'synced' | 'error' | 'conflict'; // (indexed)
    localVersion?: number;
    remoteVersion?: number;
    lastSyncedAt?: number;      // (indexed for sorting)
    errorMessage?: string;
    retryCount: number;
    createdAt: number;
    updatedAt: number;
}

/**
 * Generate sync status ID from file path
 */
export function generateSyncStatusId(filePath: string): string {
    return `sync-${filePath.replace(/[^a-zA-Z0-9]/g, '_')}`;
}

// ============================================================================
// Epic 24: Performance & UX Optimization Tables
// ============================================================================

/**
 * File metadata cache for incremental sync (Story 24-1)
 * Stores file metadata to enable syncing only changed files on project re-entry.
 *
 * @epic Epic 24 - Performance & UX Optimization
 * @story 24-1 - Incremental Sync with Metadata Cache
 */
export interface FileMetadataRecord {
    path: string;               // Primary key - relative file path
    projectId: string;          // Foreign key to project
    workspaceId: 'ide' | 'knowledge' | 'study' | 'notes'; // PERSIST-S002: Workspace isolation
    lastModified: number;       // Unix timestamp of last modification
    size: number;               // File size in bytes
    hash?: string;              // Optional SHA-256 hash for content verification
    syncedAt: number;           // Timestamp of last successful sync
    createdAt: number;
    updatedAt: number;
}

/**
 * Generate file metadata ID from project and path
 */
export function generateFileMetadataId(projectId: string, filePath: string): string {
    return `${projectId}:${filePath}`;
}

/**
 * Tool execution log for context persistence (Story 24-4)
 * Records tool approvals and execution results for conversation restoration.
 *
 * @epic Epic 24 - Performance & UX Optimization
 * @story 24-4 - Tool Execution Context Persistence
 */
export interface ToolExecutionLogRecord {
    id: string;                 // Primary key (UUID)
    conversationId: string;     // Foreign key to conversation thread
    messageId: string;          // Foreign key to the message containing tool call
    workspaceId: 'ide' | 'knowledge' | 'study' | 'notes'; // PERSIST-S002: Workspace isolation
    projectId?: string;         // BYOK-04: Project identifier for audit trail
    toolName: string;           // e.g., 'readFile', 'writeFile', 'runCommand'
    args: unknown;              // Tool input parameters (JSON serialized)
    result?: {
        success: boolean;
        output?: string;
        error?: string;
        duration?: number;      // Execution duration in ms
    };
    approved: boolean;          // Whether user approved the execution
    status: 'pending' | 'approved' | 'denied' | 'executed' | 'error';
    timestamp: number;          // Execution timestamp
    createdAt: number;
}

/**
 * FSA handle persistence for instant permission restore (Story 24-2)
 * Stores serialized FileSystemDirectoryHandle for instant access on return visits.
 *
 * @epic Epic 24 - Performance & UX Optimization
 * @story 24-2 - FSA Handle Persistence & Instant Re-grant
 */
export interface FSAHandleRecord {
    projectId: string;          // Primary key - foreign key to project
    workspaceId: 'ide' | 'knowledge' | 'study' | 'notes'; // PERSIST-S002: Workspace isolation
    handleData: unknown;        // Serialized FileSystemDirectoryHandle
    directoryPath: string;      // Original directory path for display
    grantedAt: number;          // When permission was granted
    lastAccessedAt: number;     // Last successful access check
    permissionStatus: "unknown" | "restoring" | "granted" | "prompt" | "denied" | "dismissed";
    createdAt: number;
    updatedAt: number;
}

/**
 * Session state snapshot for complete restoration (Story 24-5)
 * Captures full IDE session state for seamless resumption.
 *
 * @epic Epic 24 - Performance & UX Optimization
 * @story 24-5 - Session State Snapshot System
 */
export interface SessionSnapshotRecord {
    id: string;                 // Primary key (projectId:timestamp)
    projectId: string;          // Foreign key to project
    workspaceId: 'ide' | 'knowledge' | 'study' | 'notes'; // PERSIST-S002: Workspace isolation
    snapshot: {
        openFiles: string[];    // List of open file paths
        activeFile: string | null;
        cursorPositions: Record<string, { line: number; column: number }>;
        scrollPositions: Record<string, number>;
        panelWidths: number[];
        terminalHistory: string[]; // Last N commands
        chatState: {
            activeConversationId: string | null;
            scrollPosition: number;
        };
    };
    createdAt: number;
    expiresAt: number;          // Auto-cleanup after 7 days
}

// ============================================================================
// Table Type Exports
// ============================================================================

export type PersistedStateTable = Table<PersistedStateRecord, string>;
export type SyncStatusTable = Table<SyncStatusRecord, string>;
export type FileMetadataTable = Table<FileMetadataRecord, string>;
export type ToolExecutionLogTable = Table<ToolExecutionLogRecord, string>;
export type FSAHandleTable = Table<FSAHandleRecord, string>;
export type SessionSnapshotTable = Table<SessionSnapshotRecord, string>;
