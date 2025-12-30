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
// Table Type Exports
// ============================================================================

export type ProjectsTable = Table<ProjectRecord, string>;
export type IDEStateTable = Table<IDEStateRecord, string>;
export type ConversationsTable = Table<ConversationRecord, string>;
