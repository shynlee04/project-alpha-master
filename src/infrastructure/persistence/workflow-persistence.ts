/**
 * @fileoverview Workflow Persistence Service
 * @module infrastructure/persistence/workflow-persistence
 * @governance EPIC-E4-7
 * @created 2026-01-06
 *
 * Dexie-based persistence for workflows with versioning, import/export, and search.
 */

import { getDb } from './dexie-db';
import type { WorkflowRecord, Workflow } from '@/lib/workflow/builder/types';

// ============================================================================
// Types
// ============================================================================

/**
 * Workflow export format for JSON import/export
 */
export interface WorkflowExport {
    version: '1.0.0';
    exportedAt: number;
    workflows: Workflow[];
}

/**
 * Search filters for workflow queries
 */
export interface WorkflowSearchFilters {
    query?: string;
    tags?: string[];
    startDate?: number;
    endDate?: number;
    limit?: number;
}

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Save a workflow (insert or update)
 *
 * @param workflow - The workflow to save
 * @returns The workflow ID
 */
export async function saveWorkflow(workflow: Workflow): Promise<string> {
    const db = getDb();
    if (!db) throw new Error('[WorkflowPersistence] Database not available');

    const record: WorkflowRecord = {
        ...workflow,
        updatedAt: Date.now(),
    };

    await db.workflows.put(record);
    return workflow.id;
}

/**
 * Get a workflow by ID
 *
 * @param workflowId - The workflow ID
 * @returns The workflow or undefined if not found
 */
export async function getWorkflow(workflowId: string): Promise<Workflow | undefined> {
    const db = getDb();
    if (!db) return undefined;

    return db.workflows.get(workflowId);
}

/**
 * Get all workflows, sorted by most recently updated
 *
 * @param limit - Optional maximum number of workflows to return
 * @returns Array of workflows
 */
export async function getAllWorkflows(limit?: number): Promise<Workflow[]> {
    const db = getDb();
    if (!db) return [];

    let query = db.workflows.orderBy('updatedAt').reverse();
    if (limit) {
        query = query.limit(limit);
    }

    return query.toArray();
}

/**
 * Search workflows by filters
 *
 * @param filters - Search filters
 * @returns Array of matching workflows
 */
export async function searchWorkflows(filters: WorkflowSearchFilters): Promise<Workflow[]> {
    const db = getDb();
    if (!db) return [];

    let query = db.workflows.orderBy('updatedAt').reverse();

    // Filter by tags if provided
    if (filters.tags && filters.tags.length > 0) {
        const allWorkflows = await query.toArray();
        return allWorkflows.filter(workflow =>
            filters.tags!.some(tag => workflow.tags.includes(tag))
        );
    }

    // Filter by date range if provided
    if (filters.startDate || filters.endDate) {
        const allWorkflows = await query.toArray();
        return allWorkflows.filter(workflow => {
            if (filters.startDate && workflow.createdAt < filters.startDate) return false;
            if (filters.endDate && workflow.createdAt > filters.endDate) return false;
            return true;
        });
    }

    // Apply text search if query provided
    if (filters.query) {
        const lowerQuery = filters.query.toLowerCase();
        const allWorkflows = await query.toArray();
        return allWorkflows.filter(workflow =>
            workflow.name.toLowerCase().includes(lowerQuery) ||
            workflow.description?.toLowerCase().includes(lowerQuery) ||
            workflow.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    // Apply limit if provided
    if (filters.limit) {
        query = query.limit(filters.limit);
    }

    return query.toArray();
}

/**
 * Get workflows by tag
 *
 * @param tag - The tag to filter by
 * @returns Array of workflows with the specified tag
 */
export async function getWorkflowsByTag(tag: string): Promise<Workflow[]> {
    return searchWorkflows({ tags: [tag] });
}

/**
 * Delete a workflow
 *
 * @param workflowId - The workflow ID to delete
 * @returns True if deleted, false if not found
 */
export async function deleteWorkflow(workflowId: string): Promise<boolean> {
    const db = getDb();
    if (!db) return false;

    return db.workflows.delete(workflowId);
}

/**
 * Duplicate a workflow (creates a copy with new ID)
 *
 * @param workflowId - The workflow ID to duplicate
 * @returns The new workflow ID
 */
export async function duplicateWorkflow(workflowId: string): Promise<string | undefined> {
    const workflow = await getWorkflow(workflowId);
    if (!workflow) return undefined;

    const duplicate: Workflow = {
        ...workflow,
        id: `workflow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: `${workflow.name} (Copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    return saveWorkflow(duplicate);
}

// ============================================================================
// Import/Export
// ============================================================================

/**
 * Export workflows as JSON
 *
 * @param workflowIds - Optional array of workflow IDs to export (exports all if not provided)
 * @returns JSON string of exported workflows
 */
export async function exportWorkflows(workflowIds?: string[]): Promise<string> {
    let workflows: Workflow[];

    if (workflowIds && workflowIds.length > 0) {
        const db = getDb();
        if (!db) return JSON.stringify(createEmptyExport());
        workflows = await db.workflows.bulkGet(workflowIds) as Workflow[];
    } else {
        workflows = await getAllWorkflows();
    }

    const exportData: WorkflowExport = {
        version: '1.0.0',
        exportedAt: Date.now(),
        workflows: workflows.filter((w): w is Workflow => w !== undefined),
    };

    return JSON.stringify(exportData, null, 2);
}

/**
 * Import workflows from JSON
 *
 * @param json - JSON string or object of workflow export
 * @param options - Import options
 * @returns Object with import results
 */
export async function importWorkflows(
    json: string | WorkflowExport,
    options: {
        overwrite?: boolean;
        preserveIds?: boolean;
    } = {}
): Promise<{
    imported: number;
    skipped: number;
    errors: string[];
}> {
    const db = getDb();
    if (!db) {
        return { imported: 0, skipped: 0, errors: ['Database not available'] };
    }

    let exportData: WorkflowExport;

    try {
        exportData = typeof json === 'string'
            ? JSON.parse(json) as WorkflowExport
            : json;

        // Validate export format
        if (!exportData.version || !Array.isArray(exportData.workflows)) {
            return { imported: 0, skipped: 0, errors: ['Invalid export format'] };
        }
    } catch (error) {
        return { imported: 0, skipped: 0, errors: [`Parse error: ${error}`] };
    }

    const results = { imported: 0, skipped: 0, errors: [] as string[] };

    for (const workflow of exportData.workflows) {
        try {
            // Check if workflow already exists
            const existing = await db.workflows.get(workflow.id);

            if (existing && !options.overwrite) {
                results.skipped++;
                continue;
            }

            // Generate new ID if not preserving IDs
            const workflowToSave: Workflow = options.preserveIds
                ? { ...workflow, updatedAt: Date.now() }
                : {
                      ...workflow,
                      id: `workflow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                  };

            await db.workflows.put(workflowToSave);
            results.imported++;
        } catch (error) {
            results.errors.push(`Failed to import workflow "${workflow.name}": ${error}`);
        }
    }

    return results;
}

/**
 * Create a new workflow from template
 *
 * @param template - The template workflow
 * @param name - Optional custom name for the new workflow
 * @returns The new workflow ID
 */
export async function createFromTemplate(
    template: Workflow,
    name?: string
): Promise<string> {
    const newWorkflow: Workflow = {
        ...template,
        id: `workflow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: name || template.name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    return saveWorkflow(newWorkflow);
}

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Delete multiple workflows
 *
 * @param workflowIds - Array of workflow IDs to delete
 * @returns Number of workflows deleted
 */
export async function bulkDeleteWorkflows(workflowIds: string[]): Promise<number> {
    const db = getDb();
    if (!db) return 0;

    return db.workflows.bulkDelete(workflowIds);
}

/**
 * Update tags for multiple workflows
 *
 * @param workflowIds - Array of workflow IDs
 * @param tags - Tags to set (replaces existing tags)
 * @returns Number of workflows updated
 */
export async function bulkUpdateTags(
    workflowIds: string[],
    tags: string[]
): Promise<number> {
    const db = getDb();
    if (!db) return 0;

    let updated = 0;
    for (const id of workflowIds) {
        const modified = await db.workflows.update(id, { tags, updatedAt: Date.now() });
        if (modified) updated++;
    }

    return updated;
}

/**
 * Add a tag to multiple workflows
 *
 * @param workflowIds - Array of workflow IDs
 * @param tag - Tag to add
 * @returns Number of workflows updated
 */
export async function bulkAddTag(workflowIds: string[], tag: string): Promise<number> {
    const db = getDb();
    if (!db) return 0;

    let updated = 0;
    for (const id of workflowIds) {
        const workflow = await db.workflows.get(id);
        if (workflow && !workflow.tags.includes(tag)) {
            const modified = await db.workflows.update(id, {
                tags: [...workflow.tags, tag],
                updatedAt: Date.now(),
            });
            if (modified) updated++;
        }
    }

    return updated;
}

/**
 * Remove a tag from multiple workflows
 *
 * @param workflowIds - Array of workflow IDs
 * @param tag - Tag to remove
 * @returns Number of workflows updated
 */
export async function bulkRemoveTag(workflowIds: string[], tag: string): Promise<number> {
    const db = getDb();
    if (!db) return 0;

    let updated = 0;
    for (const id of workflowIds) {
        const workflow = await db.workflows.get(id);
        if (workflow && workflow.tags.includes(tag)) {
            const modified = await db.workflows.update(id, {
                tags: workflow.tags.filter(t => t !== tag),
                updatedAt: Date.now(),
            });
            if (modified) updated++;
        }
    }

    return updated;
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Get workflow statistics
 *
 * @returns Object with workflow counts and metadata
 */
export async function getWorkflowStats(): Promise<{
    total: number;
    byTag: Record<string, number>;
    recentlyCreated: number; // Last 7 days
    recentlyUpdated: number; // Last 7 days
}> {
    const db = getDb();
    if (!db) {
        return { total: 0, byTag: {}, recentlyCreated: 0, recentlyUpdated: 0 };
    }

    const allWorkflows = await db.workflows.toArray();
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const byTag: Record<string, number> = {};
    let recentlyCreated = 0;
    let recentlyUpdated = 0;

    for (const workflow of allWorkflows) {
        for (const tag of workflow.tags) {
            byTag[tag] = (byTag[tag] || 0) + 1;
        }
        if (workflow.createdAt > sevenDaysAgo) recentlyCreated++;
        if (workflow.updatedAt > sevenDaysAgo) recentlyUpdated++;
    }

    return {
        total: allWorkflows.length,
        byTag,
        recentlyCreated,
        recentlyUpdated,
    };
}

/**
 * Get all unique tags across all workflows
 *
 * @returns Array of unique tags sorted by frequency
 */
export async function getAllTags(): Promise<Array<{ tag: string; count: number }>> {
    const stats = await getWorkflowStats();
    return Object.entries(stats.byTag)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Clear all workflows (use with caution)
 *
 * @returns Number of workflows deleted
 */
export async function clearAllWorkflows(): Promise<number> {
    const db = getDb();
    if (!db) return 0;

    const count = await db.workflows.count();
    await db.workflows.clear();
    return count;
}

// ============================================================================
// Migration Helper
// ============================================================================

/**
 * Migrate workflows from localStorage to Dexie
 *
 * @param localStorageKey - Key used in localStorage (default: 'workflows')
 * @returns Number of workflows migrated
 */
export async function migrateFromLocalStorage(localStorageKey = 'workflows'): Promise<number> {
    const db = getDb();
    if (!db) return 0;

    if (typeof window === 'undefined') return 0;

    const stored = localStorage.getItem(localStorageKey);
    if (!stored) return 0;

    try {
        const workflows = JSON.parse(stored) as Workflow[];
        let migrated = 0;

        for (const workflow of workflows) {
            try {
                await db.workflows.put({
                    ...workflow,
                    updatedAt: Date.now(),
                });
                migrated++;
            } catch {
                // Skip invalid workflows
            }
        }

        // Clear localStorage after successful migration
        if (migrated > 0) {
            localStorage.removeItem(localStorageKey);
        }

        return migrated;
    } catch {
        return 0;
    }
}

// ============================================================================
// Helpers
// ============================================================================

function createEmptyExport(): WorkflowExport {
    return {
        version: '1.0.0',
        exportedAt: Date.now(),
        workflows: [],
    };
}
