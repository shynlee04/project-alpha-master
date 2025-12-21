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
