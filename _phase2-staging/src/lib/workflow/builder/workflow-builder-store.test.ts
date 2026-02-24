/**
 * @fileoverview Workflow Builder Store Tests
 * @module lib/workflow/builder/workflow-builder-store.test
 * @governance EPIC-E4-10
 * @created 2026-01-06
 *
 * Tests for WorkflowBuilderStore Zustand store including:
 * - State management
 * - CRUD operations
 * - Workflow validation
 * - Persistence integration
 * - Template loading
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWorkflowBuilderStore } from './workflow-builder-store';
import type { Workflow, WorkflowStep, WorkflowTemplate } from './types';
import { StepType } from './types';

// ============================================================================
// Test Utilities
// ============================================================================

function createMockWorkflow(overrides?: Partial<Workflow>): Workflow {
    return {
        id: `workflow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: 'Test Workflow',
        version: '1.0.0',
        steps: [
            {
                id: 'step-start',
                type: StepType.SEND_MESSAGE,
                name: 'Start',
                config: {},
                nextSteps: ['step-end'],
            },
            {
                id: 'step-end',
                type: StepType.END,
                name: 'End',
                config: {},
                nextSteps: [],
            },
        ],
        startStepId: 'step-start',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: [],
        ...overrides,
    };
}

function createMockTemplate(overrides?: Partial<WorkflowTemplate>): WorkflowTemplate {
    return {
        id: 'template-test',
        name: 'Test Template',
        description: 'A test template',
        category: 'test',
        workflow: createMockWorkflow(),
        icon: '🧪',
        ...overrides,
    };
}

// ============================================================================
// Test Suites
// ============================================================================

describe('useWorkflowBuilderStore', () => {
    beforeEach(() => {
        // Reset store state before each test
        useWorkflowBuilderStore.getState().reset();
        vi.clearAllMocks();
    });

    describe('Initial State', () => {
        it('should initialize with null workflow', () => {
            const state = useWorkflowBuilderStore.getState();

            expect(state.workflow).toBeNull();
            expect(state.selectedStepId).toBeNull();
            expect(state.isDragging).toBe(false);
            expect(state.errors).toEqual({});
            expect(state.isValid).toBe(false);
        });

        it('should have empty saved workflows cache initially', () => {
            const state = useWorkflowBuilderStore.getState();

            expect(state.savedWorkflowsCache).toEqual([]);
        });
    });

    describe('createWorkflow', () => {
        it('should create a new empty workflow', () => {
            useWorkflowBuilderStore.getState().createWorkflow();

            const state = useWorkflowBuilderStore.getState();

            expect(state.workflow).toBeDefined();
            expect(state.workflow?.name).toBe('New Workflow');
            expect(state.workflow?.steps).toHaveLength(2); // Start + End
            expect(state.workflow?.startStepId).toBeDefined();
        });

        it('should create workflow with valid structure', () => {
            useWorkflowBuilderStore.getState().createWorkflow();

            const workflow = useWorkflowBuilderStore.getState().workflow;

            expect(workflow?.id).toMatch(/^workflow-/);
            expect(workflow?.version).toBe('1.0.0');
            expect(workflow?.tags).toEqual([]);
        });

        it('should reset validation errors', () => {
            useWorkflowBuilderStore.getState().createWorkflow();

            const errors = useWorkflowBuilderStore.getState().errors;

            expect(errors).toEqual({});
        });
    });

    describe('loadWorkflow', () => {
        it('should load an existing workflow', () => {
            const workflow = createMockWorkflow();
            useWorkflowBuilderStore.getState().loadWorkflow(workflow);

            const state = useWorkflowBuilderStore.getState();

            expect(state.workflow).toEqual(workflow);
            expect(state.selectedStepId).toBeNull();
        });

        it('should validate loaded workflow', () => {
            const workflow = createMockWorkflow();
            useWorkflowBuilderStore.getState().loadWorkflow(workflow);

            const isValid = useWorkflowBuilderStore.getState().isValid;

            expect(isValid).toBe(true);
        });

        it('should clear selected step on load', () => {
            useWorkflowBuilderStore.getState().createWorkflow();
            useWorkflowBuilderStore.getState().selectStep('step-start');

            const workflow = createMockWorkflow();
            useWorkflowBuilderStore.getState().loadWorkflow(workflow);

            expect(useWorkflowBuilderStore.getState().selectedStepId).toBeNull();
        });
    });

    describe('loadTemplate', () => {
        it('should load workflow from template', () => {
            const template = createMockTemplate({
                workflow: createMockWorkflow({ name: 'Template Workflow' }),
            });

            useWorkflowBuilderStore.getState().loadTemplate(template);

            const state = useWorkflowBuilderStore.getState();

            expect(state.workflow).toBeDefined();
            expect(state.workflow?.name).toBe('Template Workflow');
        });

        it('should generate new ID for template workflow', () => {
            const template = createMockTemplate();
            const templateWorkflowId = template.workflow.id;

            useWorkflowBuilderStore.getState().loadTemplate(template);

            const newId = useWorkflowBuilderStore.getState().workflow?.id;

            expect(newId).toBeDefined();
            expect(newId).not.toBe(templateWorkflowId);
        });

        it('should set creation timestamp', () => {
            const template = createMockTemplate();
            const before = Date.now();

            useWorkflowBuilderStore.getState().loadTemplate(template);

            const workflow = useWorkflowBuilderStore.getState().workflow;

            expect(workflow?.createdAt).toBeGreaterThanOrEqual(before);
            expect(workflow?.updatedAt).toBeGreaterThanOrEqual(before);
        });
    });

    describe('updateWorkflow', () => {
        it('should update workflow properties', () => {
            useWorkflowBuilderStore.getState().createWorkflow();

            useWorkflowBuilderStore.getState().updateWorkflow({
                name: 'Updated Name',
                description: 'Updated description',
            });

            const workflow = useWorkflowBuilderStore.getState().workflow;

            expect(workflow?.name).toBe('Updated Name');
            expect(workflow?.description).toBe('Updated description');
        });

        it('should update timestamp on modification', () => {
            useWorkflowBuilderStore.getState().createWorkflow();
            const originalTime = useWorkflowBuilderStore.getState().workflow?.updatedAt || 0;

            // Wait to ensure timestamp difference
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    useWorkflowBuilderStore.getState().updateWorkflow({ name: 'Updated' });

                    const newTime = useWorkflowBuilderStore.getState().workflow?.updatedAt || 0;

                    expect(newTime).toBeGreaterThan(originalTime);
                    resolve();
                }, 10);
            });
        });

        it('should not update when workflow is null', () => {
            const initialWorkflow = useWorkflowBuilderStore.getState().workflow;

            useWorkflowBuilderStore.getState().updateWorkflow({ name: 'Should not crash' });

            expect(useWorkflowBuilderStore.getState().workflow).toEqual(initialWorkflow);
        });
    });

    describe('Step Management', () => {
        beforeEach(() => {
            useWorkflowBuilderStore.getState().createWorkflow();
        });

        describe('addStep', () => {
            it('should add a new step to workflow', () => {
                const stepCountBefore = useWorkflowBuilderStore.getState().workflow?.steps.length || 0;

                useWorkflowBuilderStore.getState().addStep({
                    type: StepType.SEND_MESSAGE,
                    name: 'New Step',
                    description: 'A new step',
                    config: {},
                    nextSteps: [],
                });

                const stepCountAfter = useWorkflowBuilderStore.getState().workflow?.steps.length || 0;

                expect(stepCountAfter).toBe(stepCountBefore + 1);
            });

            it('should generate unique step ID', () => {
                useWorkflowBuilderStore.getState().addStep({
                    type: StepType.SEND_MESSAGE,
                    name: 'Step 1',
                    config: {},
                    nextSteps: [],
                });

                useWorkflowBuilderStore.getState().addStep({
                    type: StepType.SEND_MESSAGE,
                    name: 'Step 2',
                    config: {},
                    nextSteps: [],
                });

                const steps = useWorkflowBuilderStore.getState().workflow?.steps || [];
                const ids = steps.map(s => s.id);

                expect(new Set(ids).size).toBe(ids.length); // All unique
            });

            it('should insert step at specified index', () => {
                useWorkflowBuilderStore.getState().addStep({
                    type: StepType.SEND_MESSAGE,
                    name: 'First',
                    config: {},
                    nextSteps: [],
                }, 0);

                const steps = useWorkflowBuilderStore.getState().workflow?.steps || [];

                expect(steps[0].name).toBe('First');
            });
        });

        describe('updateStep', () => {
            it('should update existing step', () => {
                const stepId = useWorkflowBuilderStore.getState().workflow?.steps[0]?.id;
                if (!stepId) throw new Error('No step ID');

                useWorkflowBuilderStore.getState().updateStep(stepId, {
                    name: 'Updated Step Name',
                    config: { new: 'value' },
                });

                const step = useWorkflowBuilderStore.getState().getStep(stepId);

                expect(step?.name).toBe('Updated Step Name');
                expect(step?.config).toEqual({ new: 'value' });
            });

            it('should update timestamp on step change', () => {
                const stepId = useWorkflowBuilderStore.getState().workflow?.steps[0]?.id;
                if (!stepId) throw new Error('No step ID');

                const before = useWorkflowBuilderStore.getState().workflow?.updatedAt || 0;

                return new Promise<void>((resolve) => {
                    setTimeout(() => {
                        useWorkflowBuilderStore.getState().updateStep(stepId, { name: 'Changed' });

                        const after = useWorkflowBuilderStore.getState().workflow?.updatedAt || 0;

                        expect(after).toBeGreaterThan(before);
                        resolve();
                    }, 10);
                });
            });
        });

        describe('removeStep', () => {
            it('should remove step from workflow', () => {
                const workflow = useWorkflowBuilderStore.getState().workflow;
                if (!workflow) throw new Error('No workflow');

                const stepCountBefore = workflow.steps.length;
                const stepToRemove = workflow.steps[workflow.steps.length - 1]; // End step

                useWorkflowBuilderStore.getState().removeStep(stepToRemove.id);

                const stepCountAfter = useWorkflowBuilderStore.getState().workflow?.steps.length || 0;

                expect(stepCountAfter).toBe(stepCountBefore - 1);
            });

            it('should not allow removing start step', () => {
                const workflow = useWorkflowBuilderStore.getState().workflow;
                if (!workflow) throw new Error('No workflow');

                useWorkflowBuilderStore.getState().removeStep(workflow.startStepId);

                const errors = useWorkflowBuilderStore.getState().errors;

                expect(errors[workflow.startStepId]).toBe('Cannot remove start step');
            });

            it('should remove connections to removed step', () => {
                const workflow = useWorkflowBuilderStore.getState().workflow;
                if (!workflow) throw new Error('No workflow');

                const startStep = workflow.steps.find(s => s.id === workflow.startStepId);
                if (!startStep) throw new Error('No start step');

                const endStepId = startStep.nextSteps[0];

                useWorkflowBuilderStore.getState().removeStep(endStepId);

                const updatedStart = useWorkflowBuilderStore.getState().getStep(workflow.startStepId);

                expect(updatedStart?.nextSteps).not.toContain(endStepId);
            });

            it('should deselect step when removed', () => {
                const workflow = useWorkflowBuilderStore.getState().workflow;
                if (!workflow) throw new Error('No workflow');

                const stepToRemove = workflow.steps[workflow.steps.length - 1];

                useWorkflowBuilderStore.getState().selectStep(stepToRemove.id);
                useWorkflowBuilderStore.getState().removeStep(stepToRemove.id);

                expect(useWorkflowBuilderStore.getState().selectedStepId).toBeNull();
            });
        });

        describe('selectStep', () => {
            it('should set selected step ID', () => {
                const workflow = useWorkflowBuilderStore.getState().workflow;
                if (!workflow) throw new Error('No workflow');

                useWorkflowBuilderStore.getState().selectStep(workflow.steps[0].id);

                expect(useWorkflowBuilderStore.getState().selectedStepId).toBe(workflow.steps[0].id);
            });

            it('should allow deselecting with null', () => {
                const workflow = useWorkflowBuilderStore.getState().workflow;
                if (!workflow) throw new Error('No workflow');

                useWorkflowBuilderStore.getState().selectStep(workflow.steps[0].id);
                useWorkflowBuilderStore.getState().selectStep(null);

                expect(useWorkflowBuilderStore.getState().selectedStepId).toBeNull();
            });
        });
    });

    describe('Connection Management', () => {
        beforeEach(() => {
            useWorkflowBuilderStore.getState().createWorkflow();
        });

        describe('connectSteps', () => {
            it('should add connection between steps', () => {
                const workflow = useWorkflowBuilderStore.getState().workflow;
                if (!workflow) throw new Error('No workflow');

                const fromId = workflow.steps[0].id;
                const toId = workflow.steps[1].id;

                useWorkflowBuilderStore.getState().disconnectSteps(fromId, toId);
                useWorkflowBuilderStore.getState().connectSteps(fromId, toId);

                const fromStep = useWorkflowBuilderStore.getState().getStep(fromId);

                expect(fromStep?.nextSteps).toContain(toId);
            });

            it('should not duplicate existing connections', () => {
                const workflow = useWorkflowBuilderStore.getState().workflow;
                if (!workflow) throw new Error('No workflow');

                const fromId = workflow.steps[0].id;
                const toId = workflow.steps[1].id;

                useWorkflowBuilderStore.getState().connectSteps(fromId, toId);
                useWorkflowBuilderStore.getState().connectSteps(fromId, toId);

                const fromStep = useWorkflowBuilderStore.getState().getStep(fromId);

                expect(fromStep?.nextSteps.filter(id => id === toId).length).toBe(1);
            });
        });

        describe('disconnectSteps', () => {
            it('should remove connection between steps', () => {
                const workflow = useWorkflowBuilderStore.getState().workflow;
                if (!workflow) throw new Error('No workflow');

                const fromId = workflow.steps[0].id;
                const toId = workflow.steps[1].id;

                useWorkflowBuilderStore.getState().disconnectSteps(fromId, toId);

                const fromStep = useWorkflowBuilderStore.getState().getStep(fromId);

                expect(fromStep?.nextSteps).not.toContain(toId);
            });
        });
    });

    describe('Validation', () => {
        it('should validate complete workflow', () => {
            useWorkflowBuilderStore.getState().createWorkflow();

            const isValid = useWorkflowBuilderStore.getState().isValid;

            expect(isValid).toBe(true);
            expect(useWorkflowBuilderStore.getState().errors).toEqual({});
        });

        it('should detect missing start step', () => {
            const workflow = createMockWorkflow();
            workflow.startStepId = 'non-existent';

            useWorkflowBuilderStore.getState().loadWorkflow(workflow);

            const errors = useWorkflowBuilderStore.getState().errors;

            expect(errors.start).toBeDefined();
        });

        it('should detect missing end step', () => {
            const workflow: Workflow = {
                ...createMockWorkflow(),
                steps: [
                    {
                        id: 'only',
                        type: StepType.SEND_MESSAGE,
                        name: 'Only',
                        config: {},
                        nextSteps: [],
                    },
                ],
                startStepId: 'only',
            };

            useWorkflowBuilderStore.getState().loadWorkflow(workflow);

            const errors = useWorkflowBuilderStore.getState().errors;

            expect(errors.end).toBeDefined();
        });

        it('should detect circular references', () => {
            const step1: WorkflowStep = {
                id: 'step-1',
                type: StepType.SEND_MESSAGE,
                name: 'Step 1',
                config: {},
                nextSteps: ['step-2'],
            };
            const step2: WorkflowStep = {
                id: 'step-2',
                type: StepType.SEND_MESSAGE,
                name: 'Step 2',
                config: {},
                nextSteps: ['step-1'], // Back to step-1
            };

            const workflow: Workflow = {
                ...createMockWorkflow(),
                steps: [step1, step2],
                startStepId: 'step-1',
            };

            useWorkflowBuilderStore.getState().loadWorkflow(workflow);

            const errors = useWorkflowBuilderStore.getState().errors;

            expect(errors.circular).toBeDefined();
        });

        it('should detect invalid connections', () => {
            const step1: WorkflowStep = {
                id: 'step-1',
                type: StepType.SEND_MESSAGE,
                name: 'Step 1',
                config: {},
                nextSteps: ['non-existent'], // Invalid target
            };
            const step2: WorkflowStep = {
                id: 'step-2',
                type: StepType.END,
                name: 'End',
                config: {},
                nextSteps: [],
            };

            const workflow: Workflow = {
                ...createMockWorkflow(),
                steps: [step1, step2],
                startStepId: 'step-1',
            };

            useWorkflowBuilderStore.getState().loadWorkflow(workflow);

            const errors = useWorkflowBuilderStore.getState().errors;

            expect(errors['step-1']).toBeDefined();
        });
    });

    describe('Getters', () => {
        beforeEach(() => {
            useWorkflowBuilderStore.getState().createWorkflow();
        });

        describe('getStep', () => {
            it('should return step by ID', () => {
                const workflow = useWorkflowBuilderStore.getState().workflow;
                if (!workflow) throw new Error('No workflow');

                const step = useWorkflowBuilderStore.getState().getStep(workflow.steps[0].id);

                expect(step).toBeDefined();
                expect(step?.id).toBe(workflow.steps[0].id);
            });

            it('should return undefined for non-existent step', () => {
                const step = useWorkflowBuilderStore.getState().getStep('non-existent');

                expect(step).toBeUndefined();
            });
        });

        describe('getConnections', () => {
            it('should return all connections', () => {
                const connections = useWorkflowBuilderStore.getState().getConnections();

                expect(Array.isArray(connections)).toBe(true);
                expect(connections.length).toBeGreaterThan(0);
            });

            it('should include source and target in connection', () => {
                const connections = useWorkflowBuilderStore.getState().getConnections();
                const connection = connections[0];

                expect(connection).toHaveProperty('id');
                expect(connection).toHaveProperty('sourceId');
                expect(connection).toHaveProperty('targetId');
            });
        });

        describe('getPalette', () => {
            it('should return palette items', () => {
                const palette = useWorkflowBuilderStore.getState().getPalette();

                expect(Array.isArray(palette)).toBe(true);
                expect(palette.length).toBeGreaterThan(0);
            });

            it('should include required step types', () => {
                const palette = useWorkflowBuilderStore.getState().getPalette();
                const types = palette.map(p => p.type);

                expect(types).toContain(StepType.SEND_MESSAGE);
                expect(types).toContain(StepType.ROUTE);
                expect(types).toContain(StepType.BRANCH);
                expect(types).toContain(StepType.DEBATE);
                expect(types).toContain(StepType.EXPANSION);
                expect(types).toContain(StepType.INPUT);
                expect(types).toContain(StepType.END);
            });
        });

        describe('getTemplates', () => {
            it('should return workflow templates', () => {
                const templates = useWorkflowBuilderStore.getState().getTemplates();

                expect(Array.isArray(templates)).toBe(true);
                expect(templates.length).toBeGreaterThan(0);
            });

            it('should include template metadata', () => {
                const templates = useWorkflowBuilderStore.getState().getTemplates();
                const template = templates[0];

                expect(template).toHaveProperty('id');
                expect(template).toHaveProperty('name');
                expect(template).toHaveProperty('description');
                expect(template).toHaveProperty('category');
                expect(template).toHaveProperty('workflow');
            });
        });

        describe('getSavedWorkflows', () => {
            it('should return cached workflows', () => {
                const cached = useWorkflowBuilderStore.getState().getSavedWorkflows();

                expect(Array.isArray(cached)).toBe(true);
            });
        });
    });

    describe('UI State', () => {
        beforeEach(() => {
            useWorkflowBuilderStore.getState().createWorkflow();
        });

        describe('setDragging', () => {
            it('should set dragging state', () => {
                useWorkflowBuilderStore.getState().setDragging(true, 'step-1');

                const state = useWorkflowBuilderStore.getState();

                expect(state.isDragging).toBe(true);
                expect(state.draggedStepId).toBe('step-1');
            });

            it('should clear dragging state', () => {
                useWorkflowBuilderStore.getState().setDragging(true, 'step-1');
                useWorkflowBuilderStore.getState().setDragging(false);

                expect(useWorkflowBuilderStore.getState().isDragging).toBe(false);
                expect(useWorkflowBuilderStore.getState().draggedStepId).toBeNull();
            });
        });

        describe('togglePreview', () => {
            it('should toggle preview mode', () => {
                const before = useWorkflowBuilderStore.getState().isPreview;

                useWorkflowBuilderStore.getState().togglePreview();

                const after = useWorkflowBuilderStore.getState().isPreview;

                expect(after).toBe(!before);
            });
        });

        describe('reset', () => {
            it('should reset all state to initial values', () => {
                useWorkflowBuilderStore.getState().selectStep('step-1');
                useWorkflowBuilderStore.getState().setDragging(true);
                useWorkflowBuilderStore.getState().togglePreview();

                useWorkflowBuilderStore.getState().reset();

                const state = useWorkflowBuilderStore.getState();

                expect(state.workflow).toBeNull();
                expect(state.selectedStepId).toBeNull();
                expect(state.isDragging).toBe(false);
                expect(state.draggedStepId).toBeNull();
                expect(state.errors).toEqual({});
                expect(state.isValid).toBe(false);
                expect(state.isPreview).toBe(false);
            });
        });
    });

    describe('moveStep', () => {
        it('should move step to new index', () => {
            useWorkflowBuilderStore.getState().createWorkflow();

            // Add a middle step
            useWorkflowBuilderStore.getState().addStep({
                type: StepType.SEND_MESSAGE,
                name: 'Middle',
                config: {},
                nextSteps: [],
            });

            const workflow = useWorkflowBuilderStore.getState().workflow;
            if (!workflow) throw new Error('No workflow');

            const middleStep = workflow.steps[1];
            const lastStep = workflow.steps[2];

            useWorkflowBuilderStore.getState().moveStep(lastStep.id, 1);

            const updated = useWorkflowBuilderStore.getState().workflow;
            expect(updated?.steps[1].id).toBe(lastStep.id);
            expect(updated?.steps[2].id).toBe(middleStep.id);
        });

        it('should do nothing if step not found', () => {
            useWorkflowBuilderStore.getState().createWorkflow();

            const before = useWorkflowBuilderStore.getState().workflow;

            useWorkflowBuilderStore.getState().moveStep('non-existent', 0);

            const after = useWorkflowBuilderStore.getState().workflow;

            expect(after).toEqual(before);
        });
    });

    describe('Cache Management', () => {
        it('should set saved workflows cache', () => {
            const mockWorkflows = [createMockWorkflow(), createMockWorkflow()];

            useWorkflowBuilderStore.getState().setSavedWorkflowsCache(mockWorkflows);

            expect(useWorkflowBuilderStore.getState().savedWorkflowsCache).toEqual(mockWorkflows);
        });

        it('should update cache on save', async () => {
            useWorkflowBuilderStore.getState().createWorkflow();

            await useWorkflowBuilderStore.getState().saveWorkflow();

            const cache = useWorkflowBuilderStore.getState().savedWorkflowsCache;
            expect(cache.length).toBeGreaterThan(0);
        });
    });
});
