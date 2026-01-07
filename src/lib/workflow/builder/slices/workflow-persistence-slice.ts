/**
 * @fileoverview Workflow Persistence Slice
 * @module lib/workflow/builder/slices/workflow-persistence-slice
 * @governance EPIC-E4-5
 * @created 2026-01-07
 *
 * IndexedDB persistence operations (save, load, delete, search, import/export).
 */

import type { Workflow } from '../types';
import {
    saveWorkflow as saveWorkflowToDb,
    getWorkflow,
    getAllWorkflows,
    deleteWorkflow as deleteWorkflowFromDb,
    duplicateWorkflow,
    exportWorkflows,
    importWorkflows,
    searchWorkflows,
    migrateFromLocalStorage,
} from '@/infrastructure/persistence/workflow-persistence';

// Migration flag - run once on store initialization
let migrationRun = false;

export interface PersistenceState {
    savedWorkflowsCache: Workflow[];
}

export interface PersistenceActions {
    setSavedWorkflowsCache: (workflows: Workflow[]) => void;
    saveWorkflow: () => Promise<void>;
    loadSavedWorkflow: (workflowId: string) => Promise<void>;
    deleteSavedWorkflow: (workflowId: string) => Promise<void>;
    duplicateSavedWorkflow: (workflowId: string) => Promise<string | undefined>;
    exportWorkflowsToJson: (workflowIds?: string[]) => Promise<string>;
    importWorkflowsFromJson: (json: string, overwrite?: boolean) => Promise<{ imported: number; skipped: number; errors: string[] }>;
    searchWorkflows: (filters: { query?: string; tags?: string[]; limit?: number }) => Promise<Workflow[]>;
    refreshSavedWorkflows: () => Promise<void>;
}

export const createPersistenceSlice = (
    set: (partial: Partial<PersistenceState>) => void,
    get: () => {
        workflow: Workflow | null;
        savedWorkflowsCache: Workflow[];
        loadWorkflow: (workflow: Workflow) => void;
        refreshSavedWorkflows: () => Promise<void>;
    }
): PersistenceActions => ({
    setSavedWorkflowsCache: (workflows) => {
        set({ savedWorkflowsCache: workflows });
    },

    saveWorkflow: async () => {
        const { workflow, savedWorkflowsCache } = get();
        if (!workflow) return;

        await saveWorkflowToDb(workflow);

        // Update cache
        const existingIndex = savedWorkflowsCache.findIndex((w) => w.id === workflow.id);
        const updatedCache = [...savedWorkflowsCache];
        if (existingIndex >= 0) {
            updatedCache[existingIndex] = workflow;
        } else {
            updatedCache.push(workflow);
        }
        set({ savedWorkflowsCache: updatedCache });
    },

    loadSavedWorkflow: async (workflowId) => {
        const workflow = await getWorkflow(workflowId);
        if (workflow) {
            get().loadWorkflow(workflow);
        }
    },

    deleteSavedWorkflow: async (workflowId) => {
        await deleteWorkflowFromDb(workflowId);

        // Update cache
        const { savedWorkflowsCache } = get();
        const filtered = savedWorkflowsCache.filter((w) => w.id !== workflowId);
        set({ savedWorkflowsCache: filtered });
    },

    duplicateSavedWorkflow: async (workflowId) => {
        const newId = await duplicateWorkflow(workflowId);
        if (newId) {
            // Refresh cache to include the duplicated workflow
            await get().refreshSavedWorkflows();
        }
        return newId;
    },

    exportWorkflowsToJson: async (workflowIds) => {
        return exportWorkflows(workflowIds);
    },

    importWorkflowsFromJson: async (json, overwrite = false) => {
        const result = await importWorkflows(json, { overwrite });

        // Refresh cache after import
        if (result.imported > 0) {
            await get().refreshSavedWorkflows();
        }

        return result;
    },

    searchWorkflows: async (filters) => {
        return searchWorkflows(filters);
    },

    refreshSavedWorkflows: async () => {
        // Run migration on first refresh
        if (!migrationRun && typeof window !== 'undefined') {
            migrationRun = true;
            try {
                const migrated = await migrateFromLocalStorage();
                if (migrated > 0) {
                    console.log(`[WorkflowBuilder] Migrated ${migrated} workflows from localStorage to IndexedDB`);
                }
            } catch {
                // Ignore migration errors
            }
        }

        const workflows = await getAllWorkflows();
        set({ savedWorkflowsCache: workflows });
    },
});
