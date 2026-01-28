/**
 * @fileoverview Workflow Validation Slice
 * @module lib/workflow/builder/slices/workflow-validation-slice
 * @governance EPIC-E4-5
 * @created 2026-01-07
 *
 * Workflow validation logic and error tracking.
 */

import { StepType, STEP_VALIDATION_ERRORS } from '../types';

export interface ValidationState {
    errors: Record<string, string>;
    isValid: boolean;
}

export interface ValidationActions {
    validateWorkflow: () => boolean;
}

export const createValidationSlice = (
    set: (partial: Partial<ValidationState>) => void,
    get: () => { workflow: { startStepId: string; steps: Array<{ id: string; type: string; nextSteps: string[] }> } | null }
): ValidationActions => ({
    validateWorkflow: () => {
        const { workflow } = get();
        if (!workflow) {
            set({ isValid: false, errors: {} });
            return false;
        }

        const errors: Record<string, string> = {};

        // Check for start step
        const hasStartStep = workflow.steps.some((s) => s.id === workflow.startStepId);
        if (!hasStartStep) {
            errors.start = STEP_VALIDATION_ERRORS.INVALID_START;
        }

        // Check for end step
        const hasEndStep = workflow.steps.some((s) => s.type === StepType.END);
        if (!hasEndStep) {
            errors.end = STEP_VALIDATION_ERRORS.NO_END;
        }

        // Check for circular references
        const visited = new Set<string>();
        const hasCircular = (stepId: string): boolean => {
            if (visited.has(stepId)) return true;
            visited.add(stepId);
            const step = workflow.steps.find((s) => s.id === stepId);
            return step?.nextSteps.some(hasCircular) ?? false;
        };

        if (hasCircular(workflow.startStepId)) {
            errors.circular = STEP_VALIDATION_ERRORS.CIRCULAR_REFERENCE;
        }

        // Check for invalid connections
        for (const step of workflow.steps) {
            for (const nextId of step.nextSteps) {
                const exists = workflow.steps.some((s) => s.id === nextId);
                if (!exists) {
                    errors[step.id] = STEP_VALIDATION_ERRORS.INVALID_CONNECTIONS;
                }
            }
        }

        const isValid = Object.keys(errors).length === 0;
        set({ isValid, errors });
        return isValid;
    },
});
