/**
 * @fileoverview Workflow Builder Store (Refactored)
 * @module lib/workflow/builder/workflow-builder-store-refactored
 * @governance EPIC-E4-5, EPIC-E4-7
 * @created 2026-01-07
 *
 * Zustand store for workflow builder state management.
 * Refactored into 6 focused slices following December 2025 Zustand patterns.
 */

import { create } from 'zustand';
import type {
    Workflow,
    WorkflowStep,
    StepConnection,
    WorkflowTemplate,
    PaletteItem,
} from './types';
import { STEP_PALETTE, WORKFLOW_TEMPLATES } from './types';
import { createWorkflowCrudSlice, WorkflowCrudState, WorkflowCrudActions } from './slices/workflow-crud-slice';
import { createStepManagementSlice, StepManagementState, StepManagementActions } from './slices/workflow-step-slice';
import { createConnectionManagementSlice } from './slices/workflow-connection-slice';
import { createValidationSlice, ValidationState, ValidationActions } from './slices/workflow-validation-slice';
import { createPersistenceSlice, PersistenceState, PersistenceActions } from './slices/workflow-persistence-slice';

// Export types for external use
export type { Workflow, WorkflowStep, StepConnection, WorkflowTemplate, PaletteItem };

// ============================================================================
// Combined Store Interface
// ============================================================================

interface WorkflowBuilderStore
    extends WorkflowCrudState,
        WorkflowCrudActions,
        StepManagementState,
        StepManagementActions,
        ValidationState,
        ValidationActions,
        PersistenceState,
        PersistenceActions {
    // Additional getters
    getStep: (stepId: string) => WorkflowStep | undefined;
    getPalette: () => PaletteItem[];
    getTemplates: () => WorkflowTemplate[];
    getSavedWorkflows: () => Workflow[];
    togglePreview: () => void;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useWorkflowBuilderStore = create<WorkflowBuilderStore>((set, get) => ({
    // Initial state
    workflow: null,
    selectedStepId: null,
    isDragging: false,
    draggedStepId: null,
    errors: {},
    isValid: false,
    isPreview: false,
    executingStepId: undefined,
    savedWorkflowsCache: [],

    // Workflow CRUD slice
    ...createWorkflowCrudSlice(set, get as never),

    // Step management slice
    ...createStepManagementSlice(set, get as never),

    // Connection management slice
    ...createConnectionManagementSlice(set, get as never),

    // Validation slice
    ...createValidationSlice(set, get as never),

    // Persistence slice
    ...createPersistenceSlice(set, get as never),

    // Additional getters
    getStep: (stepId) => {
        return get().workflow?.steps.find((s) => s.id === stepId);
    },

    getPalette: () => STEP_PALETTE,

    getTemplates: () => WORKFLOW_TEMPLATES,

    getSavedWorkflows: () => {
        return get().savedWorkflowsCache;
    },

    togglePreview: () => {
        set((state) => ({ isPreview: !state.isPreview }));
    },
}));

// ============================================================================
// Initialization - Load workflows on store creation
// ============================================================================

// Async initialization to load workflows from IndexedDB
if (typeof window !== 'undefined') {
    // Non-blocking async load
    Promise.resolve().then(async () => {
        try {
            const { getAllWorkflows, migrateFromLocalStorage } = await import('@/infrastructure/persistence/workflow-persistence');
            const workflows = await getAllWorkflows();
            useWorkflowBuilderStore.getState().setSavedWorkflowsCache(workflows);

            // Also run migration from localStorage if needed
            let migrationRun = false;
            if (!migrationRun) {
                migrationRun = true;
                const migrated = await migrateFromLocalStorage();
                if (migrated > 0) {
                    console.log(`[WorkflowBuilder] Migrated ${migrated} workflows from localStorage`);
                    // Reload after migration
                    const updated = await getAllWorkflows();
                    useWorkflowBuilderStore.getState().setSavedWorkflowsCache(updated);
                }
            }
        } catch {
            // Silently fail during initialization
        }
    });
}
