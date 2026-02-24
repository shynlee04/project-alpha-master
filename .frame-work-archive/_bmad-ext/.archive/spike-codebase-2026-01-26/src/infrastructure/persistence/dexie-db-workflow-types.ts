/**
 * @fileoverview Workflow Table Types
 * @module infrastructure/persistence/dexie-db-workflow-types
 * @governance EPIC-E4-7
 * @created 2026-01-06
 *
 * Dexie table types for workflow persistence.
 */

import type { Table } from 'dexie';
import type { Workflow } from '@/lib/workflow/builder/types';

// ============================================================================
// Workflow Record
// ============================================================================

/**
 * Workflow record stored in IndexedDB
 *
 * Extends the base Workflow type with metadata for persistence.
 */
export interface WorkflowRecord extends Workflow {
    /** Primary key - unique identifier */
    id: string;
    /** PERSIST-S002: Workspace isolation */
    workspaceId: 'ide' | 'knowledge' | 'study' | 'notes';
    /** Timestamp when workflow was last modified */
    updatedAt: number;
}

// ============================================================================
// Workflow Table Definition
// ============================================================================

/**
 * Workflows table schema
 *
 * Provides full-text search on name and indexes for common queries.
 */
export interface WorkflowsTable extends Table<WorkflowRecord, string> {
    // Primary key
    id: string;

    // Indexes for querying
    name: string;
    createdAt: number;
    updatedAt: number;
    tags: string[];
}
