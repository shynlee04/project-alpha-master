/**
 * @fileoverview Core Database Record Types
 * @module lib/state/dexie-db-core-types
 * @governance EPIC-27-1c
 *
 * Core record types for IndexedDB persistence.
 * Extracted from dexie-db.ts for better code organization.
 *
 * @mandate NO-WORKSPACE - See SOURCE-OF-TRUTH.md Part 6
 * Story 27-1: State Architecture Stabilization
 * Story 27-1c: Persistence Migration (idb → Dexie)
 */

import type { Table } from 'dexie';
import type { PluginType, ProjectPlugins } from '@/domain/entities/project';

// ============================================================================
// Shared Types
// ============================================================================

/**
 * Plugin type for database tables.
 * Files and state are isolated by projectId only (not by plugin).
 * Plugins are features, not data containers.
 * 
 * @deprecated Use PluginType from @/domain/entities/project instead.
 * This alias exists only for migration compatibility.
 */
export type DbPluginType = PluginType;

// ============================================================================
// Core Record Types
// ============================================================================

/**
 * Project metadata stored in IndexedDB
 *
 * @mandate NO-WORKSPACE - Projects use plugins field, not workspaceBindings.
 * 
 * MIGRATION: Old records may have workspaceBindings field - these are
 * migrated to plugins on read. New records use plugins only.
 */
export interface ProjectRecord {
    // Core identity
    id: string;
    name: string;
    path: string;
    folderPath?: string;

    // Storage configuration
    storageType?: 'indexeddb' | 'fsa';

    // Plugin configuration (replaces workspaceBindings)
    plugins?: ProjectPlugins;

    // Timestamps
    lastOpened: Date;
    createdAt: Date;

    // Configuration
    autoSync?: boolean;
    exclusionPatterns?: string[];
    layoutState?: {
      panelSizes?: number[];
      openFiles?: string[];
      activeFile?: string | null;
    };

    // Feature flags
    fileSnapshotEnabled?: boolean;

    // Metadata
    description?: string;
    tags?: string[];

    // Soft delete support
    deleted?: boolean;
    deletedAt?: Date;

    // DEPRECATED: Temp project support
    isTemp?: boolean;
    autoCreated?: boolean;
    isBrowserMode?: boolean;

    // Notes import tracking
    notesImportHash?: string;
    notesImportHashTimestamp?: Date;
}

/**
 * IDE state per project (panel layouts, open files, etc.)
 * State is per-project, not per-plugin.
 */
export interface IDEStateRecord {
  projectId: string;
  openFiles: string[];
  activeFile: string | null;
  expandedPaths: string[];
  focusedPath?: string;
  panelLayouts: Record<string, number[]>;
  terminalTab: "output" | "terminal" | "problems";
  chatVisible: boolean;
  activeFileScrollTop?: number | undefined;
  updatedAt: Date;
}

/**
 * Conversation record for AI chat history
 * Conversations are per-project.
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
 * Files belong to projects, not plugins.
 */
export interface FileSnapshotRecord {
    id?: number;
    projectId: string;
    path: string;
    hash: string;
    size: number;
    version: number;
    lastCachedAt: number;
    expiresAt: number;
    hasContent: boolean;
}

/**
 * File content cache (lazy-loaded, only when file is opened)
 * Files belong to projects, not plugins.
 */
export interface FileContentCacheRecord {
    projectId: string;
    path: string;
    content: string;
}

/**
 * Re-export plugin types from domain
 */
export type { PluginType, ProjectPlugins } from '@/domain/entities/project';

// ============================================================================
// Table Type Exports
// ============================================================================

export type ProjectsTable = Table<ProjectRecord, string>;
export type IDEStateTable = Table<IDEStateRecord, string>;
export type ConversationsTable = Table<ConversationRecord, string>;
export type FileSnapshotsTable = Table<FileSnapshotRecord, number>;
export type FileContentCacheTable = Table<FileContentCacheRecord, string>;
