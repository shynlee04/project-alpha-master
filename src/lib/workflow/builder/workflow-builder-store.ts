/**
 * @fileoverview Workflow Builder Store
 * @module lib/workflow/builder/workflow-builder-store
 * @governance EPIC-E4-5, EPIC-E4-7
 * @created 2026-01-06
 * @updated 2026-01-06
 *
 * Zustand store for workflow builder state management.
 * Uses Dexie for persistence via workflow-persistence service.
 */

import { create } from 'zustand';
import type {
    Workflow,
    WorkflowStep,
    StepConnection,
    WorkflowTemplate,
    WorkflowBuilderState,
    PaletteItem,
} from './types';
import { StepType, STEP_PALETTE, WORKFLOW_TEMPLATES, STEP_VALIDATION_ERRORS } from './types';
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

// ============================================================================
// Helpers
// ============================================================================

function generateStepId(): string {
    return `step-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function generateWorkflowId(): string {
    return `workflow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function createEmptyWorkflow(): Workflow {
    const startStep: WorkflowStep = {
        id: generateStepId(),
        type: StepType.SEND_MESSAGE,
        name: 'Start',
        description: 'Start of workflow',
        config: { temperature: 0.7 },
        nextSteps: [],
    };

    const endStep: WorkflowStep = {
        id: generateStepId(),
        type: StepType.END,
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

// ============================================================================
// Store Interface
// ============================================================================

interface WorkflowBuilderStore extends WorkflowBuilderState {
    // Additional state for caching
    savedWorkflowsCache: Workflow[];
    setSavedWorkflowsCache: (workflows: Workflow[]) => void;

    // Actions
    createWorkflow: () => void;
    loadWorkflow: (workflow: Workflow) => void;
    loadTemplate: (template: WorkflowTemplate) => void;
    updateWorkflow: (updates: Partial<Workflow>) => void;
    addStep: (step: Omit<WorkflowStep, 'id'>, index?: number) => void;
    updateStep: (stepId: string, updates: Partial<WorkflowStep>) => void;
    removeStep: (stepId: string) => void;
    selectStep: (stepId: string | null) => void;
    connectSteps: (sourceId: string, targetId: string) => void;
    disconnectSteps: (sourceId: string, targetId: string) => void;
    moveStep: (stepId: string, newIndex: number) => void;
    setDragging: (isDragging: boolean, stepId?: string) => void;
    validateWorkflow: () => boolean;
    saveWorkflow: () => Promise<void>;
    loadSavedWorkflow: (workflowId: string) => Promise<void>;
    deleteSavedWorkflow: (workflowId: string) => Promise<void>;
    duplicateSavedWorkflow: (workflowId: string) => Promise<string | undefined>;
    exportWorkflowsToJson: (workflowIds?: string[]) => Promise<string>;
    importWorkflowsFromJson: (json: string, overwrite?: boolean) => Promise<{ imported: number; skipped: number; errors: string[] }>;
    searchWorkflows: (filters: { query?: string; tags?: string[]; limit?: number }) => Promise<Workflow[]>;
    refreshSavedWorkflows: () => Promise<void>;
    togglePreview: () => void;
    reset: () => void;

    // Getters
    getStep: (stepId: string) => WorkflowStep | undefined;
    getConnections: () => StepConnection[];
    getPalette: () => PaletteItem[];
    getTemplates: () => WorkflowTemplate[];
    getSavedWorkflows: () => Workflow[];
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

    // Actions
    createWorkflow: () => {
        const workflow = createEmptyWorkflow();
        set({ workflow, selectedStepId: null, errors: {} });
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

    updateWorkflow: (updates) => {
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
        });
        get().validateWorkflow();
    },

    removeStep: (stepId) => {
        const { workflow } = get();
        if (!workflow) return;

        // Don't allow removing if it's the start step
        if (stepId === workflow.startStepId) {
            set({ errors: { [stepId]: 'Cannot remove start step' } });
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
            selectedStepId: get().selectedStepId === stepId ? null : get().selectedStepId,
        });
        get().validateWorkflow();
    },

    selectStep: (stepId) => {
        set({ selectedStepId: stepId });
    },

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
        });
    },

    setDragging: (isDragging, stepId) => {
        set({ isDragging, draggedStepId: stepId ?? null });
    },

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

    saveWorkflow: () => {
        const { workflow } = get();
        if (!workflow) return;

        // Save to localStorage for persistence
        const saved = get().getSavedWorkflows();
        const existingIndex = saved.findIndex((w) => w.id === workflow.id);

        if (existingIndex >= 0) {
            saved[existingIndex] = workflow;
        } else {
            saved.push(workflow);
        }

        localStorage.setItem('workflows', JSON.stringify(saved));
    },

    loadSavedWorkflow: (workflowId) => {
        const saved = get().getSavedWorkflows();
        const workflow = saved.find((w) => w.id === workflowId);
        if (workflow) {
            get().loadWorkflow(workflow);
        }
    },

    deleteSavedWorkflow: (workflowId) => {
        const saved = get().getSavedWorkflows();
        const filtered = saved.filter((w) => w.id !== workflowId);
        localStorage.setItem('workflows', JSON.stringify(filtered));
    },

    togglePreview: () => {
        set((state) => ({ isPreview: !state.isPreview }));
    },

    reset: () => {
        set({
            workflow: null,
            selectedStepId: null,
            isDragging: false,
            draggedStepId: null,
            errors: {},
            isValid: false,
            isPreview: false,
            executingStepId: undefined,
        });
    },

    // Getters
    getStep: (stepId) => {
        return get().workflow?.steps.find((s) => s.id === stepId);
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

    getPalette: () => STEP_PALETTE,

    getTemplates: () => WORKFLOW_TEMPLATES,

    getSavedWorkflows: () => {
        if (typeof window === 'undefined') return [];
        const saved = localStorage.getItem('workflows');
        return saved ? JSON.parse(saved) : [];
    },
}));
