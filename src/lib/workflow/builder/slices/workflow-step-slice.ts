/**
 * @fileoverview Workflow Step Slice
 * @module lib/workflow/builder/slices/workflow-step-slice
 * @governance EPIC-E4-5
 * @created 2026-01-07
 *
 * Step management operations (add, update, remove, move, select).
 */

import type { WorkflowStep, Workflow } from '../types';
import { generateStepId } from './workflow-utilities-slice';

export interface StepManagementState {
    isDragging: boolean;
    draggedStepId: string | null;
}

export interface StepManagementActions {
    addStep: (step: Omit<WorkflowStep, 'id'>, index?: number) => void;
    updateStep: (stepId: string, updates: Partial<WorkflowStep>) => void;
    removeStep: (stepId: string) => void;
    selectStep: (stepId: string | null) => void;
    moveStep: (stepId: string, newIndex: number) => void;
    setDragging: (isDragging: boolean, stepId?: string) => void;
}

export const createStepManagementSlice = (
    set: (partial: Partial<StepManagementState & { workflow?: Workflow; selectedStepId?: string | null; errors?: Record<string, string> }>) => void,
    get: () => { workflow: Workflow | null; selectedStepId: string | null } & { validateWorkflow: () => void }
): StepManagementActions => ({
    addStep: (step, index) => {
        const { workflow } = get();
        if (!workflow) return;

        const newStep: WorkflowStep = {
            ...step,
            id: generateStepId(),
        };

        const steps = [...workflow.steps];
        if (index !== undefined) {
            steps.splice(index, 0, newStep);
        } else {
            steps.push(newStep);
        }

        set({
            workflow: {
                ...workflow,
                steps,
                updatedAt: Date.now(),
            },
        });
        get().validateWorkflow();
    },

    updateStep: (stepId, updates) => {
        const { workflow } = get();
        if (!workflow) return;

        const steps = workflow.steps.map((step) =>
            step.id === stepId ? { ...step, ...updates } : step
        );

        set({
            workflow: {
                ...workflow,
                steps,
                updatedAt: Date.now(),
            },
        } as unknown as Partial<StepManagementState>);
        get().validateWorkflow();
    },

    removeStep: (stepId) => {
        const { workflow, selectedStepId } = get();
        if (!workflow) return;

        // Don't allow removing if it's the start step
        if (stepId === workflow.startStepId) {
            set({ errors: { [stepId]: 'Cannot remove start step' } } as unknown as Partial<StepManagementState>);
            return;
        }

        // Remove step and its connections
        const steps = workflow.steps.filter((s) => s.id !== stepId);
        const updatedSteps = steps.map((step) => ({
            ...step,
            nextSteps: step.nextSteps.filter((id) => id !== stepId),
        }));

        set({
            workflow: {
                ...workflow,
                steps: updatedSteps,
                updatedAt: Date.now(),
            },
            selectedStepId: selectedStepId === stepId ? null : selectedStepId,
        } as unknown as Partial<StepManagementState>);
        get().validateWorkflow();
    },

    selectStep: (stepId) => {
        set({ selectedStepId: stepId } as unknown as Partial<StepManagementState>);
    },

    moveStep: (stepId, newIndex) => {
        const { workflow } = get();
        if (!workflow) return;

        const steps = [...workflow.steps];
        const oldIndex = steps.findIndex((s) => s.id === stepId);
        if (oldIndex === -1) return;

        const [step] = steps.splice(oldIndex, 1);
        steps.splice(newIndex, 0, step);

        set({
            workflow: {
                ...workflow,
                steps,
                updatedAt: Date.now(),
            },
        } as unknown as Partial<StepManagementState>);
    },

    setDragging: (isDragging, stepId) => {
        set({ isDragging, draggedStepId: stepId ?? null });
    },
});
