/**
 * @fileoverview Workflow CRUD Slice
 * @module lib/workflow/builder/slices/workflow-crud-slice
 * @governance EPIC-E4-5
 * @created 2026-01-07
 *
 * Core workflow CRUD operations (create, load, update, reset).
 */

import type { Workflow, WorkflowTemplate } from '../types';
import { createEmptyWorkflow, generateWorkflowId } from './workflow-utilities-slice';

export interface WorkflowCrudState {
    workflow: Workflow | null;
    selectedStepId: string | null;
    isPreview: boolean;
    executingStepId: string | undefined;
}

export interface WorkflowCrudActions {
    createWorkflow: () => void;
    loadWorkflow: (workflow: Workflow) => void;
    loadTemplate: (template: WorkflowTemplate) => void;
    updateWorkflow: (updates: Partial<Workflow>) => void;
    reset: () => void;
}

export const createWorkflowCrudSlice = (
    set: (partial: Partial<WorkflowCrudState>) => void,
    get: () => WorkflowCrudState & { validateWorkflow: () => void }
): WorkflowCrudActions => ({
    createWorkflow: () => {
        const workflow = createEmptyWorkflow();
        set({ workflow, selectedStepId: null });
        get().validateWorkflow();
    },

    loadWorkflow: (workflow: Workflow) => {
        set({ workflow, selectedStepId: null });
        get().validateWorkflow();
    },

    loadTemplate: (template: WorkflowTemplate) => {
        const workflow: Workflow = {
            ...template.workflow,
            id: generateWorkflowId(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        set({ workflow, selectedStepId: null });
        get().validateWorkflow();
    },

    updateWorkflow: (updates: Partial<Workflow>) => {
        const { workflow } = get();
        if (!workflow) return;

        set({
            workflow: {
                ...workflow,
                ...updates,
                updatedAt: Date.now(),
            },
        });
        get().validateWorkflow();
    },

    reset: () => {
        set({
            workflow: null,
            selectedStepId: null,
            isPreview: false,
            executingStepId: undefined,
        });
    },
});
