/**
 * Project Store - Unified persistence for project metadata.
 *
 * Story 3-7: Implement Project Metadata Persistence
 * Story 5-1: Set Up IndexedDB Schema (unified DB)
 * Story 27-1c: Migrated to Dexie.js
 *
 * This module provides CRUD operations for storing and retrieving project
 * metadata including FSA directory handles for permission restoration.
 *
 * @governance EPIC-27-1c
 */

import {
    getPersistenceDB,
    _resetPersistenceDBForTesting,
} from '../persistence';
import { getPermissionState, type FsaPermissionState } from '../filesystem/permission-lifecycle';

// ============================================================================
// Types
// ============================================================================

/**
 * Layout configuration stored per project.
 * Optional - used for restoring IDE state.
 */
export interface LayoutConfig {
    panelSizes?: number[];
    openFiles?: string[];
    activeFile?: string | null;
}

/**
 * Core project metadata stored in IndexedDB.
 */
export interface ProjectMetadata {
    /** UUID v4 or generated ID */
    id: string;
    /** Display name (typically folder name) */
    name: string;
    /** Display path for UI (not actual path due to FSA security) */
    folderPath: string;
    /** FSA handle for directory access restoration */
    fsaHandle: FileSystemDirectoryHandle;
    /** Last time project was opened */
    lastOpened: Date;
    autoSync?: boolean;
    /** Optional layout state for IDE restoration */
    layoutState?: LayoutConfig;
    /** Custom exclusion patterns for sync (glob syntax) */
    exclusionPatterns?: string[];
    /** Story 13-5: Last known permission state for faster dashboard load */
    lastKnownPermissionState?: FsaPermissionState;
}

/**
 * Project with permission state for dashboard display.
 */
export interface ProjectWithPermission extends ProjectMetadata {
    permissionState: FsaPermissionState;
}

// ============================================================================
// Legacy Migration (Story 5-1)
// ============================================================================

const LEGACY_DB_NAME = 'via-gent-projects';
const STORE_NAME = 'projects' as const;

let legacyMigrationAttempted = false;

/**
 * Migrate from legacy 'via-gent-projects' DB to unified DB.
 * Uses native IndexedDB API since we no longer have idb dependency.
 */
async function migrateLegacyProjectsIfNeeded(): Promise<void> {
    if (legacyMigrationAttempted) return;
    legacyMigrationAttempted = true;

    const db = await getPersistenceDB();
    if (!db) return;

    try {
        // Check if we have any projects in new DB
        const existingCount = await db.count(STORE_NAME);
        if (existingCount > 0) return;

        // Try to open legacy database using native IndexedDB
        const legacyProjects = await new Promise<ProjectMetadata[]>((resolve) => {
            const request = indexedDB.open(LEGACY_DB_NAME);

            request.onerror = () => resolve([]);
            request.onsuccess = () => {
                const legacyDb = request.result;

                if (!legacyDb.objectStoreNames.contains('projects')) {
                    legacyDb.close();
                    resolve([]);
                    return;
                }

                const tx = legacyDb.transaction('projects', 'readonly');
                const store = tx.objectStore('projects');
                const getAllRequest = store.getAll();

                getAllRequest.onsuccess = () => {
                    legacyDb.close();
                    resolve(getAllRequest.result as ProjectMetadata[]);
                };
                getAllRequest.onerror = () => {
                    legacyDb.close();
                    resolve([]);
                };
            };
        });

        if (legacyProjects.length === 0) return;

        // Migrate each project
        for (const project of legacyProjects) {
            await db.put(STORE_NAME, {
                ...project,
                lastOpened: new Date(project.lastOpened),
                autoSync: project.autoSync ?? true,
            });
        }

        console.log('[ProjectStore] Migrated legacy projects:', legacyProjects.length);
    } catch (error) {
        console.warn('[ProjectStore] Legacy migration failed:', error);
    }
}

// ============================================================================
// Database Connection
// ============================================================================

async function getDB() {
    const db = await getPersistenceDB();
    if (!db) return null;

    await migrateLegacyProjectsIfNeeded();
    return db;
}

/**
 * Reset the database connection.
 * For testing purposes only - closes existing connection and clears cache.
 * @internal
 */
export async function _resetDBForTesting(): Promise<void> {
    await _resetPersistenceDBForTesting();

    if (typeof indexedDB !== 'undefined') {
        await new Promise<void>((resolve) => {
            const request = indexedDB.deleteDatabase(LEGACY_DB_NAME);
            request.onsuccess = () => resolve();
            request.onerror = () => resolve();
            request.onblocked = () => resolve();
        });
    }

    legacyMigrationAttempted = false;
}

// ============================================================================
// ID Generation
// ============================================================================

/**
 * Generate a unique project ID.
 * Uses crypto.randomUUID() with fallback for older browsers.
 */
export function generateProjectId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback: timestamp + random
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Save or update project metadata in IndexedDB.
 *
 * @param project - Project metadata to save
 * @returns true if saved successfully, false otherwise
 */
export async function saveProject(project: ProjectMetadata): Promise<boolean> {
    const db = await getDB();
    if (!db) return false;

    try {
        const projectToSave = {
            ...project,
            lastOpened: new Date(project.lastOpened),
            autoSync: project.autoSync ?? true,
        };
        await db.put(STORE_NAME, projectToSave);
        console.log('[ProjectStore] Project saved:', project.id, project.name);
        return true;
    } catch (error) {
        console.error('[ProjectStore] Failed to save project:', error);
        return false;
    }
}

/**
 * Get project by ID.
 *
 * @param id - Project ID
 * @returns ProjectMetadata or null if not found
 */
export async function getProject(id: string): Promise<ProjectMetadata | null> {
    const db = await getDB();
    if (!db) return null;

    try {
        const project = await db.get<ProjectMetadata>(STORE_NAME, id);
        return project ?? null;
    } catch (error) {
        console.error('[ProjectStore] Failed to get project:', id, error);
        return null;
    }
}

/**
 * List all projects sorted by lastOpened descending.
 *
 * @returns Array of ProjectMetadata
 */
export async function listProjects(): Promise<ProjectMetadata[]> {
    const db = await getDB();
    if (!db) return [];

    try {
        const projects = await db.getAll<ProjectMetadata>(STORE_NAME);
        return projects.sort(
            (a, b) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime()
        );
    } catch (error) {
        console.error('[ProjectStore] Failed to list projects:', error);
        return [];
    }
}

/**
 * List all projects with their current permission state.
 * Useful for dashboard display.
 *
 * @returns Array of ProjectWithPermission
 */
export async function listProjectsWithPermission(): Promise<ProjectWithPermission[]> {
    const projects = await listProjects();

    const projectsWithPermission = await Promise.all(
        projects.map(async (project) => {
            try {
                const permissionState = await getPermissionState(project.fsaHandle, 'readwrite');
                return { ...project, permissionState };
            } catch {
                return { ...project, permissionState: 'denied' as FsaPermissionState };
            }
        })
    );

    return projectsWithPermission;
}

/**
 * Delete project by ID.
 *
 * @param id - Project ID
 * @returns true if deleted successfully, false otherwise
 */
export async function deleteProject(id: string): Promise<boolean> {
    const db = await getDB();
    if (!db) return false;

    try {
        await db.delete(STORE_NAME, id);
        console.log('[ProjectStore] Project deleted:', id);
        return true;
    } catch (error) {
        console.error('[ProjectStore] Failed to delete project:', id, error);
        return false;
    }
}

/**
 * Update only the lastOpened timestamp for a project.
 * More efficient than full project save for frequent updates.
 *
 * @param id - Project ID
 * @returns true if updated successfully, false otherwise
 */
export async function updateProjectLastOpened(id: string): Promise<boolean> {
    const db = await getDB();
    if (!db) return false;

    try {
        const project = await db.get<ProjectMetadata>(STORE_NAME, id);
        if (!project) {
            console.warn('[ProjectStore] Project not found for update:', id);
            return false;
        }

        project.lastOpened = new Date();
        await db.put(STORE_NAME, project);
        return true;
    } catch (error) {
        console.error('[ProjectStore] Failed to update lastOpened:', id, error);
        return false;
    }
}

/**
 * Check permission state for a stored project's handle.
 *
 * @param id - Project ID
 * @returns FsaPermissionState or 'denied' if project not found
 */
export async function checkProjectPermission(id: string): Promise<FsaPermissionState> {
    const project = await getProject(id);
    if (!project || !project.fsaHandle) {
        return 'denied';
    }

    return getPermissionState(project.fsaHandle, 'readwrite');
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Clear all projects from IndexedDB.
 * Useful for testing and reset functionality.
 *
 * @returns true if cleared successfully
 */
export async function clearAllProjects(): Promise<boolean> {
    const db = await getDB();
    if (!db) return false;

    try {
        await db.clear(STORE_NAME);
        console.log('[ProjectStore] All projects cleared');
        return true;
    } catch (error) {
        console.error('[ProjectStore] Failed to clear projects:', error);
        return false;
    }
}

/**
 * Get project count.
 *
 * @returns Number of stored projects
 */
export async function getProjectCount(): Promise<number> {
    const db = await getDB();
    if (!db) return 0;

    try {
        return await db.count(STORE_NAME);
    } catch (error) {
        console.error('[ProjectStore] Failed to count projects:', error);
        return 0;
    }
}
