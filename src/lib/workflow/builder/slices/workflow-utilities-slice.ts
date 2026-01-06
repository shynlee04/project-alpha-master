/**
 * @fileoverview Workflow Utilities Slice
 * @module lib/workflow/builder/slices/workflow-utilities-slice
 * @governance EPIC-E4-5
 * @created 2026-01-07
 *
 * Helper functions and ID generators for workflow builder.
 */

/**
 * Generate unique step ID
 * @returns Unique step identifier
 */
export function generateStepId(): string {
    return `step-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate unique workflow ID
 * @returns Unique workflow identifier
 */
export function generateWorkflowId(): string {
    return `workflow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create empty workflow with start and end steps
 * @returns New workflow object
 */
export function createEmptyWorkflow() {
    const generateStepId = () => `step-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const generateWorkflowId = () => `workflow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const startStep = {
        id: generateStepId(),
        type: 'send_message' as const,
        name: 'Start',
        description: 'Start of workflow',
        config: { temperature: 0.7 },
        nextSteps: [],
    };

    const endStep = {
        id: generateStepId(),
        type: 'end' as const,
        name: 'End',
        description: 'End of workflow',
        config: {},
        nextSteps: [],
    };

    startStep.nextSteps = [endStep.id];

    return {
        id: generateWorkflowId(),
        name: 'New Workflow',
        version: '1.0.0',
        steps: [startStep, endStep],
        startStepId: startStep.id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: [],
    };
}
