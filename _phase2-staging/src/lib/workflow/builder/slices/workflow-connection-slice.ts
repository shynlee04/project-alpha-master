/**
 * @fileoverview Workflow Connection Slice
 * @module lib/workflow/builder/slices/workflow-connection-slice
 * @governance EPIC-E4-5
 * @created 2026-01-07
 *
 * Step connection management (connect, disconnect, get connections).
 */

import type { StepConnection } from '../types';

export interface ConnectionManagementActions {
    connectSteps: (sourceId: string, targetId: string) => void;
    disconnectSteps: (sourceId: string, targetId: string) => void;
    getConnections: () => StepConnection[];
}

export const createConnectionManagementSlice = (
    set: (partial: unknown) => void,
    get: () => { workflow: { steps: Array<{ id: string; nextSteps: string[] }> } | null } & { validateWorkflow: () => void }
): ConnectionManagementActions => ({
    connectSteps: (sourceId, targetId) => {
        const { workflow } = get();
        if (!workflow) return;

        const steps = workflow.steps.map((step) => {
            if (step.id === sourceId) {
                const nextSteps = step.nextSteps.includes(targetId)
                    ? step.nextSteps
                    : [...step.nextSteps, targetId];
                return { ...step, nextSteps };
            }
            return step;
        });

        set({
            workflow: {
                ...workflow,
                steps,
                updatedAt: Date.now(),
            },
        });
        get().validateWorkflow();
    },

    disconnectSteps: (sourceId, targetId) => {
        const { workflow } = get();
        if (!workflow) return;

        const steps = workflow.steps.map((step) => {
            if (step.id === sourceId) {
                return {
                    ...step,
                    nextSteps: step.nextSteps.filter((id) => id !== targetId),
                };
            }
            return step;
        });

        set({
            workflow: {
                ...workflow,
                steps,
                updatedAt: Date.now(),
            },
        });
        get().validateWorkflow();
    },

    getConnections: () => {
        const { workflow } = get();
        if (!workflow) return [];

        const connections: StepConnection[] = [];
        for (const step of workflow.steps) {
            for (const nextId of step.nextSteps) {
                connections.push({
                    id: `${step.id}-${nextId}`,
                    sourceId: step.id,
                    targetId: nextId,
                });
            }
        }
        return connections;
    },
});
