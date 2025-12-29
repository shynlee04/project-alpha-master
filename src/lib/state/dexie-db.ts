/**
 * @fileoverview Dexie.js Database Schema
 * @module lib/state/dexie-db
 * @governance EPIC-27-1c
 * @ai-observable true
 * 
 * Unified IndexedDB persistence using Dexie.js.
 * Replaces the previous idb-based implementation.
 * 
 * Story 27-1: State Architecture Stabilization
 * Story 27-1c: Persistence Migration (idb → Dexie)
 * 
 * @ai-contracts
 * - TaskContext table for AI agent task tracking (Epic 25)
 * - ToolExecution table for AI tool audit trail (Epic 25)
 * 
 * @example
 * ```tsx
 * import { db } from '@/lib/state';
 * 
 * // Get all projects
 * const projects = await db.projects.toArray();
 * 
 * // Live query (auto-updates UI)
 * const projects = useLiveQuery(() => db.projects.toArray());
 * ```
 */

import Dexie, { type Table } from 'dexie';

// ============================================================================
// Record Types
// ============================================================================

/**
 * Project metadata stored in IndexedDB
 */
export interface ProjectRecord {
    id: string;
    name: string;
    path: string;
    lastOpened: Date;
    createdAt: Date;
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

// ============================================================================
// AI Foundation Types (Epic 25 Prep)
// ============================================================================

/**
 * Status of an AI task
 * @ai-observable
 */
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * TaskContext for AI agent orchestration
 * Stores context about what an AI agent is working on.
 * 
 * @ai-observable
 * @epic Epic 25 - AI Foundation Sprint
 */
export interface TaskContextRecord {
    id: string;
    projectId: string;
    agentId: string;           // Which agent is executing
    status: TaskStatus;
    description: string;       // Human-readable task description
    targetFiles: string[];     // Files the agent is working on
    checkpoint?: unknown;      // LangGraph checkpoint data
    createdAt: Date;
    updatedAt: Date;
}

/**
 * ToolExecution audit trail
 * Records every tool call made by AI agents for observability.
 * 
 * @ai-observable
 * @epic Epic 25 - AI Foundation Sprint
 */
export interface ToolExecutionRecord {
    id: string;
    taskId: string;            // Reference to TaskContext
    toolName: string;          // e.g., 'file_read', 'execute_command'
    input: unknown;            // Tool input parameters
    output?: unknown;          // Tool output (null if pending)
    status: 'pending' | 'success' | 'error';
    duration?: number;         // Execution time in ms
    createdAt: Date;
}

/**
 * CredentialRecord for encrypted API key storage
 * Used by CredentialVault for secure provider credentials.
 * 
 * @epic Epic 25 - AI Foundation Sprint
 * @story 25-0 - ProviderAdapterFactory
 */
export interface CredentialRecord {
    providerId: string;         // Primary key (e.g., 'openrouter', 'openai')
    encrypted: string;          // Base64-encoded encrypted API key
    iv: string;                 // Base64-encoded initialization vector
    createdAt: Date;
}

// ============================================================================
// Conversation Threads (MVP-2 Chat Interface)
// ============================================================================

/**
 * Tool call record within a thread message
 * @epic MVP
 * @story MVP-2 - Chat Interface with Rich Streaming
 */
export interface ThreadToolCallRecord {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'success' | 'error';
    input?: unknown;
    output?: unknown;
    duration?: number;
}

/**
 * Message within a conversation thread
 * @epic MVP
 * @story MVP-2 - Chat Interface with Rich Streaming
 */
export interface ThreadMessageRecord {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    agentId?: string;
    agentName?: string;
    agentModel?: string;
    timestamp: number;
    toolCalls?: ThreadToolCallRecord[];
}

/**
 * Conversation thread record for Dexie persistence
 * Enables full-text indexing for search.
 * 
 * @epic MVP
 * @story MVP-2 - Chat Interface with Rich Streaming
 */
export interface ConversationThreadRecord {
    id: string;                 // Primary key
    projectId: string;          // Index for project-scoped queries
    title: string;
    preview: string;            // First 100 chars of last message
    messages: ThreadMessageRecord[];
    agentsUsed: string[];       // Agent IDs used in this thread
    messageCount: number;
    createdAt: number;
    updatedAt: number;          // Index for sorting
}

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
    handleData: unknown;        // Serialized FileSystemDirectoryHandle
    directoryPath: string;      // Original directory path for display
    grantedAt: number;          // When permission was granted
    lastAccessedAt: number;     // Last successful access check
    permissionStatus: 'granted' | 'prompt' | 'denied' | 'unknown';
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

/**
 * Convert SyncQueueItem to SyncStatusRecord
 */
export function queueItemToSyncStatus(item: {
    id: string;
    type: 'read' | 'write' | 'delete';
    path: string;
    status: 'pending' | 'active' | 'completed' | 'failed';
    error?: string;
    createdAt: Date;
}): SyncStatusRecord {
    const statusMap: SyncStatusRecord['syncStatus'] = {
        pending: 'pending',
        active: 'syncing',
        completed: 'synced',
        failed: 'error',
    };

    return {
        id: item.id,
        path: item.path,
        syncStatus: statusMap[item.status],
        errorMessage: item.error,
        retryCount: item.status === 'failed' ? 1 : 0,
        createdAt: item.createdAt.getTime(),
        updatedAt: Date.now(),
    };
}

// ============================================================================
// Migration Logging (RC-011)
// ============================================================================

/**
 * Log a Dexie migration event for audit trail
 */
function logDexieMigration(
    version: number,
    operation: string,
    status: 'started' | 'completed' | 'failed',
    details?: { tableName?: string; itemsCount?: number; error?: string }
): void {
    const entry = {
        timestamp: Date.now(),
        type: 'dexie-migration',
        version,
        operation,
        status,
        ...details,
    };

    if (status === 'failed') {
        console.error('[Dexie Migration]', JSON.stringify(entry, null, 2));
    } else {
        console.log('[Dexie Migration]', JSON.stringify(entry, null, 2));
    }
}

/**
 * Check if a migration has already been applied
 */
function isMigrationApplied(version: number): boolean {
    if (typeof localStorage === 'undefined') return false;

    try {
        const appliedKey = `dexie-migration-v${version}-applied`;
        return localStorage.getItem(appliedKey) === 'true';
    } catch {
        return false;
    }
}

/**
 * Mark a migration as applied
 */
function markMigrationApplied(version: number): void {
    if (typeof localStorage === 'undefined') return;

    try {
        const appliedKey = `dexie-migration-v${version}-applied`;
        localStorage.setItem(appliedKey, 'true');
    } catch {
        // Ignore storage errors
    }
}

// ============================================================================
// Database Class
// ============================================================================

/**
 * Via-Gent Dexie Database
 * 
 * Provides type-safe access to IndexedDB tables with automatic
 * schema versioning and migration support.
 * 
 * @ai-observable Database supports AI agent task tracking
 * @governance EPIC-27-1c
 */
class ViaGentDatabase extends Dexie {
    // Declare typed tables
    projects!: Table<ProjectRecord, string>;
    ideState!: Table<IDEStateRecord, string>;
    conversations!: Table<ConversationRecord, string>;

    // AI Foundation tables (Epic 25 prep)
    taskContexts!: Table<TaskContextRecord, string>;
    toolExecutions!: Table<ToolExecutionRecord, string>;

    // Provider credentials (Story 25-0)
    credentials!: Table<CredentialRecord, string>;

    // Conversation threads (MVP-2)
    threads!: Table<ConversationThreadRecord, string>;

    // State persistence (Epic 25)
    providerConfigs!: Table<PersistedStateRecord, string>;

    // Agent configuration persistence (Story 2.1)
    agentConfigs!: Table<PersistedStateRecord, string>;

    // Conversation state persistence (Story 2.1)
    conversationState!: Table<PersistedStateRecord, string>;

    // Sync status persistence (RC-005 - Sprint 27B)
    syncStatus!: Table<SyncStatusRecord, string>;

    // Epic 24: Performance & UX Optimization tables
    fileMetadata!: Table<FileMetadataRecord, string>;
    toolExecutionLogs!: Table<ToolExecutionLogRecord, string>;
    fsaHandles!: Table<FSAHandleRecord, string>;
    sessionSnapshots!: Table<SessionSnapshotRecord, string>;

    constructor() {
        // DB name matches legacy 'via-gent-persistence' for data continuity
        super('via-gent-persistence');

        // Schema version 1: Initial schema (legacy compatibility)
        this.version(1).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
        });

        // Schema version 2: No schema change, just standardization
        this.version(2).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
        }).upgrade(async () => {
            console.log('[Dexie] Running migration to v2 (standardization)');
        });

        // Schema version 3: Add AI Foundation tables (Epic 25 prep)
        // Added in Story 27-1c for forward compatibility
        this.version(3).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
            // AI agent task tracking
            taskContexts: 'id, projectId, agentId, status, [projectId+status]',
            // AI tool execution audit trail
            toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
        }).upgrade(async () => {
            console.log('[Dexie] Running migration to v3 (AI Foundation tables)');
        });

        // Schema version 4: Add credentials table (Story 25-0)
        // For encrypted API key storage in CredentialVault
        this.version(4).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
            taskContexts: 'id, projectId, agentId, status, [projectId+status]',
            toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
            // Encrypted API credentials for AI providers
            credentials: 'providerId, createdAt',
        }).upgrade(async () => {
            console.log('[Dexie] Running migration to v4 (credentials table)');
        });

        // Schema version 5: Add conversation threads table (MVP-2)
        // For persistent thread storage with indexing support
        this.version(5).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
            taskContexts: 'id, projectId, agentId, status, [projectId+status]',
            toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
            credentials: 'providerId, createdAt',
            // Conversation threads for chat interface
            threads: 'id, projectId, updatedAt, [projectId+updatedAt]',
        }).upgrade(async () => {
            console.log('[Dexie] Running migration to v5 (conversation threads)');
        });

        // Schema version 6: Add providerConfigs table (Epic 25)
        // For Zustand store persistence
        this.version(6).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
            taskContexts: 'id, projectId, agentId, status, [projectId+status]',
            toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
            credentials: 'providerId, createdAt',
            threads: 'id, projectId, updatedAt, [projectId+updatedAt]',
            // Generic state persistence
            providerConfigs: 'id, updatedAt',
        }).upgrade(async () => {
            console.log('[Dexie] Running migration to v6 (provider configs)');
        });

        // Schema version 7: Add agentConfigs + conversationState tables (Story 2.1)
        // For unified state management with Zustand + Dexie
        this.version(7).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
            taskContexts: 'id, projectId, agentId, status, [projectId+status]',
            toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
            credentials: 'providerId, createdAt',
            threads: 'id, projectId, updatedAt, [projectId+updatedAt]',
            providerConfigs: 'id, updatedAt',
            // Agent configuration persistence (Story 2.1)
            agentConfigs: 'id, updatedAt',
            // Conversation state persistence (Story 2.1)
            conversationState: 'id, updatedAt',
        }).upgrade(async () => {
            console.log('[Dexie] Running migration to v7 (agent configs + conversation state)');
        });

        // Schema version 8: Add syncStatus table (RC-005 - Sprint 27B)
        // Migrates SyncStatusStore from localStorage to Dexie
        this.version(8).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
            taskContexts: 'id, projectId, agentId, status, [projectId+status]',
            toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
            credentials: 'providerId, createdAt',
            threads: 'id, projectId, updatedAt, [projectId+updatedAt]',
            providerConfigs: 'id, updatedAt',
            agentConfigs: 'id, updatedAt',
            conversationState: 'id, updatedAt',
            // Sync status table with indexes for efficient queries
            syncStatus: 'id, path, syncStatus, lastSyncedAt, [path+syncStatus]',
        }).upgrade(async (tx) => {
            logDexieMigration(8, 'sync-status-migration', 'started');

            // Check if already applied (idempotency)
            if (isMigrationApplied(8)) {
                logDexieMigration(8, 'sync-status-migration', 'completed', {
                    details: 'Already applied, skipping'
                });
                return;
            }

            // Migrate data from localStorage if exists
            let itemsMigrated = 0;
            try {
                const localStorageData = localStorage.getItem('sync-status-store');
                if (localStorageData) {
                    const parsed = JSON.parse(localStorageData);
                    const state = parsed.state || parsed;
                    const queue = state.queue || [];

                    if (Array.isArray(queue) && queue.length > 0) {
                        const syncStatusTable = tx.table('syncStatus');
                        const now = Date.now();

                        for (const item of queue) {
                            if (item.status !== 'completed') {
                                await syncStatusTable.put({
                                    id: item.id || `sync-${item.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
                                    path: item.path,
                                    syncStatus: item.status === 'pending' ? 'pending' :
                                        item.status === 'active' ? 'syncing' :
                                            item.status === 'failed' ? 'error' : 'synced',
                                    errorMessage: item.error,
                                    retryCount: item.status === 'failed' ? 1 : 0,
                                    createdAt: item.createdAt ? new Date(item.createdAt).getTime() : now,
                                    updatedAt: now,
                                });
                                itemsMigrated++;
                            }
                        }
                    }
                }

                // Mark migration as applied
                markMigrationApplied(8);

                logDexieMigration(8, 'sync-status-migration', 'completed', {
                    tableName: 'syncStatus',
                    itemsCount: itemsMigrated
                });
            } catch (error) {
                logDexieMigration(8, 'sync-status-migration', 'failed', {
                    tableName: 'syncStatus',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        // Schema version 9: Epic 24 - Performance & UX Optimization
        // Adds tables for incremental sync, tool context, FSA handles, and session snapshots
        this.version(9).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
            taskContexts: 'id, projectId, agentId, status, [projectId+status]',
            toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
            credentials: 'providerId, createdAt',
            threads: 'id, projectId, updatedAt, [projectId+updatedAt]',
            providerConfigs: 'id, updatedAt',
            agentConfigs: 'id, updatedAt',
            conversationState: 'id, updatedAt',
            syncStatus: 'id, path, syncStatus, lastSyncedAt, [path+syncStatus]',
            // NEW: Epic 24 tables
            // Story 24-1: File metadata cache for incremental sync
            fileMetadata: '[projectId+path], projectId, lastModified, syncedAt',
            // Story 24-4: Tool execution logs for context persistence
            toolExecutionLogs: 'id, conversationId, messageId, toolName, timestamp, [conversationId+timestamp]',
            // Story 24-2: FSA handle persistence for instant re-grant
            fsaHandles: 'projectId, lastAccessedAt',
            // Story 24-5: Session snapshots for complete restoration
            sessionSnapshots: 'id, projectId, createdAt, expiresAt, [projectId+createdAt]',
        }).upgrade(async () => {
            logDexieMigration(9, 'epic-24-schema', 'started');

            // Check if already applied (idempotency)
            if (isMigrationApplied(9)) {
                logDexieMigration(9, 'epic-24-schema', 'completed', {
                    details: 'Already applied, skipping'
                });
                return;
            }

            // No data migration needed - tables are new
            // Mark migration as applied
            markMigrationApplied(9);

            logDexieMigration(9, 'epic-24-schema', 'completed', {
                tableName: 'fileMetadata, toolExecutionLogs, fsaHandles, sessionSnapshots',
                itemsCount: 0
            });
        });
    }
}

// ============================================================================
// Database Instance
// ============================================================================

/**
 * Singleton database instance
 * 
 * @example
 * ```tsx
 * import { db } from '@/lib/state';
 * 
 * // CRUD operations
 * await db.projects.add({ id: '1', name: 'My Project', ... });
 * const project = await db.projects.get('1');
 * ```
 */
export const db = new ViaGentDatabase();

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get IDE state for a project, or create default if not exists
 */
export async function getIDEState(projectId: string): Promise<IDEStateRecord | undefined> {
    return db.ideState.get(projectId);
}

/**
 * Save IDE state for a project
 */
export async function saveIDEState(state: IDEStateRecord): Promise<void> {
    await db.ideState.put({
        ...state,
        updatedAt: new Date(),
    });
}

/**
 * Delete old IDE state (cleanup)
 */
export async function deleteIDEState(projectId: string): Promise<void> {
    await db.ideState.delete(projectId);
}

/**
 * Get all projects, sorted by last opened
 */
export async function getRecentProjects(limit = 10): Promise<ProjectRecord[]> {
    return db.projects
        .orderBy('lastOpened')
        .reverse()
        .limit(limit)
        .toArray();
}

/**
 * Reset database for testing
 */
export async function resetDatabaseForTesting(): Promise<void> {
    if (typeof indexedDB === 'undefined') return;
    await db.delete();
    await db.open();
}

// ============================================================================
// Sync Status Helpers (RC-005 - Sprint 27B)
// ============================================================================

/**
 * Get sync status for a specific file path
 */
export async function getSyncStatus(filePath: string): Promise<SyncStatusRecord | undefined> {
    const id = `sync-${filePath.replace(/[^a-zA-Z0-9]/g, '_')}`;
    return db.syncStatus.get(id);
}

/**
 * Set sync status for a file
 */
export async function setSyncStatus(record: Omit<SyncStatusRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const id = `sync-${record.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
    await db.syncStatus.put({
        ...record,
        id,
        createdAt: record.createdAt || Date.now(),
        updatedAt: Date.now(),
    });
}

/**
 * Update sync status by file path
 */
export async function updateSyncStatus(
    filePath: string,
    updates: Partial<Omit<SyncStatusRecord, 'id' | 'path'>>
): Promise<void> {
    const existing = await getSyncStatus(filePath);
    if (existing) {
        const id = `sync-${filePath.replace(/[^a-zA-Z0-9]/g, '_')}`;
        await db.syncStatus.update(id, { ...updates, updatedAt: Date.now() });
    }
}

/**
 * Delete sync status for a file
 */
export async function deleteSyncStatus(filePath: string): Promise<void> {
    const id = `sync-${filePath.replace(/[^a-zA-Z0-9]/g, '_')}`;
    await db.syncStatus.delete(id);
}

/**
 * Get all sync status items by status
 */
export async function getSyncStatusByStatus(status: SyncStatusRecord['syncStatus']): Promise<SyncStatusRecord[]> {
    return db.syncStatus.where('syncStatus').equals(status).toArray();
}

/**
 * Get all pending sync status items
 */
export async function getPendingSyncStatus(): Promise<SyncStatusRecord[]> {
    return db.syncStatus.where('syncStatus').equals('pending').toArray();
}

/**
 * Get all error sync status items
 */
export async function getErrorSyncStatus(): Promise<SyncStatusRecord[]> {
    return db.syncStatus.where('syncStatus').equals('error').toArray();
}

/**
 * Clear old sync status entries (older than 7 days)
 */
export async function clearOldSyncStatus(maxAgeMs = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    const cutoff = Date.now() - maxAgeMs;
    const oldEntries = await db.syncStatus
        .where('updatedAt')
        .below(cutoff)
        .toArray();

    for (const entry of oldEntries) {
        await db.syncStatus.delete(entry.id);
    }

    return oldEntries.length;
}

/**
 * Get sync status statistics
 */
export async function getSyncStatusStats(): Promise<{
    total: number;
    pending: number;
    syncing: number;
    synced: number;
    error: number;
    conflict: number;
}> {
    const all = await db.syncStatus.toArray();
    return {
        total: all.length,
        pending: all.filter((s) => s.syncStatus === 'pending').length,
        syncing: all.filter((s) => s.syncStatus === 'syncing').length,
        synced: all.filter((s) => s.syncStatus === 'synced').length,
        error: all.filter((s) => s.syncStatus === 'error').length,
        conflict: all.filter((s) => s.syncStatus === 'conflict').length,
    };
}

// ============================================================================
// Epic 24: File Metadata Helpers (Story 24-1)
// ============================================================================

/**
 * Get file metadata for a specific file in a project
 */
export async function getFileMetadata(
    projectId: string,
    filePath: string
): Promise<FileMetadataRecord | undefined> {
    return db.fileMetadata
        .where('[projectId+path]')
        .equals([projectId, filePath])
        .first();
}

/**
 * Get all file metadata for a project
 */
export async function getAllFileMetadata(
    projectId: string
): Promise<FileMetadataRecord[]> {
    return db.fileMetadata.where('projectId').equals(projectId).toArray();
}

/**
 * Upsert file metadata (insert or update)
 */
export async function upsertFileMetadata(
    record: Omit<FileMetadataRecord, 'createdAt' | 'updatedAt'>
): Promise<void> {
    const now = Date.now();
    const existing = await getFileMetadata(record.projectId, record.path);

    await db.fileMetadata.put({
        ...record,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
    });
}

/**
 * Bulk upsert file metadata for efficient syncing
 */
export async function bulkUpsertFileMetadata(
    records: Omit<FileMetadataRecord, 'createdAt' | 'updatedAt'>[]
): Promise<void> {
    const now = Date.now();
    const enrichedRecords = records.map((record) => ({
        ...record,
        createdAt: now,
        updatedAt: now,
    }));

    await db.fileMetadata.bulkPut(enrichedRecords);
}

/**
 * Delete file metadata
 */
export async function deleteFileMetadata(
    projectId: string,
    filePath: string
): Promise<void> {
    await db.fileMetadata
        .where('[projectId+path]')
        .equals([projectId, filePath])
        .delete();
}

/**
 * Clear all file metadata for a project
 */
export async function clearProjectFileMetadata(projectId: string): Promise<number> {
    return db.fileMetadata.where('projectId').equals(projectId).delete();
}

/**
 * Get files that need syncing (lastModified > syncedAt)
 */
export async function getFilesNeedingSync(projectId: string): Promise<FileMetadataRecord[]> {
    const allFiles = await getAllFileMetadata(projectId);
    return allFiles.filter((f) => f.lastModified > f.syncedAt);
}

// ============================================================================
// Epic 24: Tool Execution Log Helpers (Story 24-4)
// ============================================================================

/**
 * Add a tool execution log entry
 */
export async function addToolExecutionLog(
    record: Omit<ToolExecutionLogRecord, 'createdAt'>
): Promise<string> {
    const enrichedRecord: ToolExecutionLogRecord = {
        ...record,
        createdAt: Date.now(),
    };

    await db.toolExecutionLogs.put(enrichedRecord);
    return record.id;
}

/**
 * Get all tool execution logs for a conversation
 */
export async function getToolExecutionLogs(
    conversationId: string
): Promise<ToolExecutionLogRecord[]> {
    return db.toolExecutionLogs
        .where('conversationId')
        .equals(conversationId)
        .sortBy('timestamp');
}

/**
 * Get tool execution log by ID
 */
export async function getToolExecutionLog(
    id: string
): Promise<ToolExecutionLogRecord | undefined> {
    return db.toolExecutionLogs.get(id);
}

/**
 * Update tool execution log (e.g., after execution completes)
 */
export async function updateToolExecutionLog(
    id: string,
    updates: Partial<Omit<ToolExecutionLogRecord, 'id' | 'createdAt'>>
): Promise<void> {
    await db.toolExecutionLogs.update(id, updates);
}

/**
 * Get approved tools from a conversation (for session trust)
 */
export async function getApprovedTools(
    conversationId: string
): Promise<string[]> {
    const logs = await db.toolExecutionLogs
        .where('conversationId')
        .equals(conversationId)
        .filter((log) => log.approved && log.status === 'executed')
        .toArray();

    return [...new Set(logs.map((log) => log.toolName))];
}

/**
 * Clear old tool execution logs (older than 30 days)
 */
export async function clearOldToolExecutionLogs(
    maxAgeMs = 30 * 24 * 60 * 60 * 1000
): Promise<number> {
    const cutoff = Date.now() - maxAgeMs;
    return db.toolExecutionLogs.where('timestamp').below(cutoff).delete();
}

// ============================================================================
// Epic 24: FSA Handle Helpers (Story 24-2)
// ============================================================================

/**
 * Store FSA handle for a project
 */
export async function storeFSAHandle(
    record: Omit<FSAHandleRecord, 'createdAt' | 'updatedAt'>
): Promise<void> {
    const now = Date.now();
    const existing = await db.fsaHandles.get(record.projectId);

    await db.fsaHandles.put({
        ...record,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
    });
}

/**
 * Get FSA handle for a project
 */
export async function getFSAHandle(
    projectId: string
): Promise<FSAHandleRecord | undefined> {
    return db.fsaHandles.get(projectId);
}

/**
 * Update FSA handle permission status
 */
export async function updateFSAHandleStatus(
    projectId: string,
    status: FSAHandleRecord['permissionStatus']
): Promise<void> {
    await db.fsaHandles.update(projectId, {
        permissionStatus: status,
        lastAccessedAt: Date.now(),
        updatedAt: Date.now(),
    });
}

/**
 * Delete FSA handle (e.g., when revoked)
 */
export async function deleteFSAHandle(projectId: string): Promise<void> {
    await db.fsaHandles.delete(projectId);
}

/**
 * Get all valid FSA handles (for dashboard display)
 */
export async function getAllValidFSAHandles(): Promise<FSAHandleRecord[]> {
    return db.fsaHandles
        .where('permissionStatus')
        .equals('granted')
        .toArray();
}

// ============================================================================
// Epic 24: Session Snapshot Helpers (Story 24-5)
// ============================================================================

/**
 * Save session snapshot
 */
export async function saveSessionSnapshot(
    record: Omit<SessionSnapshotRecord, 'createdAt' | 'expiresAt'>
): Promise<void> {
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    await db.sessionSnapshots.put({
        ...record,
        createdAt: now,
        expiresAt: now + sevenDays,
    });
}

/**
 * Get latest session snapshot for a project
 */
export async function getLatestSessionSnapshot(
    projectId: string
): Promise<SessionSnapshotRecord | undefined> {
    const now = Date.now();
    const snapshots = await db.sessionSnapshots
        .where('[projectId+createdAt]')
        .between([projectId, 0], [projectId, now])
        .reverse()
        .limit(1)
        .toArray();

    // Return only if not expired
    const snapshot = snapshots[0];
    if (snapshot && snapshot.expiresAt > now) {
        return snapshot;
    }
    return undefined;
}

/**
 * Delete session snapshot
 */
export async function deleteSessionSnapshot(id: string): Promise<void> {
    await db.sessionSnapshots.delete(id);
}

/**
 * Clear expired session snapshots
 */
export async function clearExpiredSessionSnapshots(): Promise<number> {
    const now = Date.now();
    return db.sessionSnapshots.where('expiresAt').below(now).delete();
}

/**
 * Clear all session snapshots for a project
 */
export async function clearProjectSessionSnapshots(projectId: string): Promise<number> {
    return db.sessionSnapshots.where('projectId').equals(projectId).delete();
}
