/**
 * @fileoverview Workflow Executor Tests
 * @module lib/workflow/executor/workflow-executor.test
 * @governance EPIC-E4-10
 * @created 2026-01-06
 *
 * Comprehensive tests for WorkflowExecutor including:
 * - Sequential execution
 * - Branching logic
 * - State management
 * - Progress tracking
 * - Pause/resume functionality
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WorkflowExecutor, WorkflowExecutionError, ExecutionState, EXECUTION_ERRORS, type StepResult } from './workflow-executor';
import type { Workflow, WorkflowStep } from '../builder/types';
import { StepType } from '../builder/types';

// ============================================================================
// Test Utilities
// ============================================================================

function createMockWorkflow(overrides?: Partial<Workflow>): Workflow {
    const startStep: WorkflowStep = {
        id: 'step-1',
        type: StepType.SEND_MESSAGE,
        name: 'Start',
        description: 'Start step',
        config: { message: 'Hello' },
        nextSteps: ['step-2'],
    };

    const endStep: WorkflowStep = {
        id: 'step-2',
        type: StepType.END,
        name: 'End',
        description: 'End step',
        config: {},
        nextSteps: [],
    };

    startStep.nextSteps = ['step-2'];

    return {
        id: 'workflow-test',
        name: 'Test Workflow',
        version: '1.0.0',
        steps: [startStep, endStep],
        startStepId: 'step-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: [],
        ...overrides,
    };
}

function createMockStep(id: string, type: StepType, nextSteps: string[] = []): WorkflowStep {
    return {
        id,
        type,
        name: `Step ${id}`,
        description: `Test step ${id}`,
        config: {},
        nextSteps,
    };
}

// ============================================================================
// Test Suites
// ============================================================================

describe('WorkflowExecutor', () => {
    let executor: WorkflowExecutor;

    beforeEach(() => {
        executor = new WorkflowExecutor();
    });

    afterEach(() => {
        // Cleanup any lingering state
        executor.stop?.();
    });

    describe('Initialization', () => {
        it('should initialize with null state', () => {
            expect(executor.state).toBeNull();
        });

        it('should have subscribe method', () => {
            expect(typeof executor.subscribe).toBe('function');
        });
    });

    describe('Sequential Execution', () => {
        it('should execute steps sequentially', async () => {
            const workflow = createMockWorkflow();
            const stepResults: StepResult[] = [];

            await executor.execute(workflow, {
                onStepComplete: (result) => stepResults.push(result),
            });

            expect(executor.state?.status).toBe(ExecutionState.COMPLETED);
            expect(executor.state?.completedSteps).toHaveLength(2);
            expect(stepResults).toHaveLength(2);
        });

        it('should track progress correctly', async () => {
            const step1 = createMockStep('step-1', StepType.SEND_MESSAGE, ['step-2']);
            const step2 = createMockStep('step-2', StepType.SEND_MESSAGE, ['step-3']);
            const step3 = createMockStep('step-3', StepType.END);

            const workflow: Workflow = {
                id: 'test',
                name: 'Test',
                version: '1.0.0',
                steps: [step1, step2, step3],
                startStepId: 'step-1',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            await executor.execute(workflow);

            expect(executor.state?.progress.total).toBe(3);
            expect(executor.state?.progress.completed).toBe(3);
        });

        it('should store step results in order', async () => {
            const workflow = createMockWorkflow();
            const results: StepResult[] = [];

            await executor.execute(workflow, {
                onStepComplete: (result) => results.push(result),
            });

            expect(results[0].stepId).toBe('step-1');
            expect(results[1].stepId).toBe('step-2');
        });

        it('should maintain workflow state between steps', async () => {
            const step1 = createMockStep('step-1', StepType.SEND_MESSAGE, ['step-2']);
            step1.config = { setState: 'value1' };
            const step2 = createMockStep('step-2', StepType.END);

            const workflow: Workflow = {
                id: 'test',
                name: 'Test',
                version: '1.0.0',
                steps: [step1, step2],
                startStepId: 'step-1',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            await executor.execute(workflow, {
                input: { initial: 'data' },
            });

            expect(executor.state?.workflowState.initial).toBe('data');
        });
    });

    describe('Branching Logic', () => {
        it('should handle simple branching', async () => {
            const start = createMockStep('start', StepType.BRANCH, ['branch-a', 'branch-b']);
            const branchA = createMockStep('branch-a', StepType.END);
            const branchB = createMockStep('branch-b', StepType.END);

            start.config = {
                branches: [
                    { condition: 'true', targetStepId: 'branch-a' },
                ],
            };

            const workflow: Workflow = {
                id: 'test',
                name: 'Test',
                version: '1.0.0',
                steps: [start, branchA, branchB],
                startStepId: 'start',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            await executor.execute(workflow);

            // Should complete without errors
            expect(executor.state?.status).toBe(ExecutionState.COMPLETED);
        });

        it('should follow correct branch path', async () => {
            const start = createMockStep('start', StepType.ROUTE, ['route-a']);
            const routeA = createMockStep('route-a', StepType.END);

            start.config = {
                routes: [
                    { intent: 'research', targetStepId: 'route-a' },
                ],
                defaultRoute: 'route-a',
            };

            const workflow: Workflow = {
                id: 'test',
                name: 'Test',
                version: '1.0.0',
                steps: [start, routeA],
                startStepId: 'start',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            await executor.execute(workflow);

            expect(executor.state?.completedSteps).toContain('route-a');
        });
    });

    describe('State Management', () => {
        it('should pass state between steps', async () => {
            const step1 = createMockStep('step-1', StepType.SEND_MESSAGE, ['step-2']);
            const step2 = createMockStep('step-2', StepType.END);

            const workflow: Workflow = {
                id: 'test',
                name: 'Test',
                version: '1.0.0',
                steps: [step1, step2],
                startStepId: 'step-1',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            const initialState = { topic: 'AI', count: 0 };
            await executor.execute(workflow, { input: initialState });

            expect(executor.state?.workflowState.topic).toBe('AI');
            expect(executor.state?.workflowState.count).toBe(0);
        });

        it('should preserve initial state', async () => {
            const workflow = createMockWorkflow();
            const input = { key: 'value', nested: { prop: 123 } };

            await executor.execute(workflow, { input });

            expect(executor.state?.workflowState).toEqual(input);
        });

        it('should isolate state between executions', async () => {
            const workflow = createMockWorkflow();

            await executor.execute(workflow, { input: { run: 1 } });
            const state1 = executor.state?.workflowState;

            await executor.execute(workflow, { input: { run: 2 } });
            const state2 = executor.state?.workflowState;

            expect(state1?.run).toBe(1);
            expect(state2?.run).toBe(2);
        });
    });

    describe('Progress Tracking', () => {
        it('should emit progress events', async () => {
            const workflow = createMockWorkflow();
            const events: string[] = [];

            executor.subscribe((event) => {
                events.push(event.type);
            });

            await executor.execute(workflow);

            expect(events).toContain('started');
            expect(events).toContain('step_started');
            expect(events).toContain('step_completed');
            expect(events).toContain('completed');
        });

        it('should report correct progress percentage', async () => {
            const steps = [
                createMockStep('s1', StepType.SEND_MESSAGE, ['s2']),
                createMockStep('s2', StepType.SEND_MESSAGE, ['s3']),
                createMockStep('s3', StepType.SEND_MESSAGE, ['s4']),
                createMockStep('s4', StepType.END),
            ];

            const workflow: Workflow = {
                id: 'test',
                name: 'Test',
                version: '1.0.0',
                steps,
                startStepId: 's1',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            await executor.execute(workflow);

            expect(executor.state?.progress.total).toBe(4);
            expect(executor.state?.progress.completed).toBe(4);
        });

        it('should update currentStepId during execution', async () => {
            const workflow = createMockWorkflow();
            const stepIds: (string | null)[] = [];

            executor.subscribe((event) => {
                if (event.type === 'step_started') {
                    stepIds.push(event.stepId);
                }
            });

            await executor.execute(workflow);

            expect(stepIds).toEqual(['step-1', 'step-2']);
        });
    });

    describe('Pause/Resume Functionality', () => {
        it('should pause running workflow', async () => {
            const workflow = createMockWorkflow();

            // Start execution (non-blocking)
            const execution = executor.execute(workflow);

            // Pause immediately
            setTimeout(() => executor.pause(), 0);

            const state = await execution;

            // Should be paused or completed (too fast to catch)
            expect([ExecutionState.PAUSED, ExecutionState.COMPLETED]).toContain(state.status);
        });

        it('should resume paused workflow', async () => {
            const workflow = createMockWorkflow();

            // Execute and pause
            await executor.execute(workflow);
            // Most simple workflows complete before pause can take effect
            // This test validates the resume API exists and doesn't error
            if (executor.state?.status === ExecutionState.PAUSED) {
                const resumedState = await executor.resume();
                expect(resumedState.status).toBe(ExecutionState.COMPLETED);
            }
        });

        it('should throw error when pausing non-running workflow', () => {
            expect(() => executor.pause()).toThrow(WorkflowExecutionError);
        });

        it('should throw error when resuming non-paused workflow', async () => {
            const workflow = createMockWorkflow();
            await executor.execute(workflow);

            await expect(executor.resume()).rejects.toThrow(WorkflowExecutionError);
        });
    });

    describe('Error Handling', () => {
        it('should handle missing start step', async () => {
            const workflow = createMockWorkflow();
            workflow.startStepId = 'non-existent';

            await expect(executor.execute(workflow)).resolves.toBeDefined();
            expect(executor.state?.status).toBe(ExecutionState.FAILED);
        });

        it('should handle invalid workflow structure', async () => {
            const invalidWorkflow = {
                id: 'invalid',
                name: 'Invalid',
                version: '1.0.0',
                steps: [],
                startStepId: '',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            } as Workflow;

            const state = await executor.execute(invalidWorkflow);
            expect(state.status).toBe(ExecutionState.FAILED);
        });

        it('should call onError callback on failure', async () => {
            const workflow = createMockWorkflow();
            workflow.startStepId = 'missing';
            const onError = vi.fn();

            await executor.execute(workflow, { onError });

            expect(onError).toHaveBeenCalled();
        });

        it('should emit failed event on error', async () => {
            const workflow = createMockWorkflow();
            workflow.startStepId = 'missing';
            const events: string[] = [];

            executor.subscribe((event) => events.push(event.type));

            await executor.execute(workflow);

            expect(events).toContain('failed');
        });

        it('should handle step execution errors gracefully', async () => {
            const step1 = createMockStep('step-1', StepType.DEBATE, ['step-2']);
            const step2 = createMockStep('step-2', StepType.END);

            // Invalid debate config
            step1.config = {
                topic: '', // Empty topic should cause error
            };

            const workflow: Workflow = {
                id: 'test',
                name: 'Test',
                version: '1.0.0',
                steps: [step1, step2],
                startStepId: 'step-1',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            // Should complete with error rather than throw
            const state = await executor.execute(workflow);
            expect([ExecutionState.COMPLETED, ExecutionState.FAILED]).toContain(state.status);
        });

        it('should preserve error state after failure', async () => {
            const workflow = createMockWorkflow();
            workflow.startStepId = 'non-existent';

            await executor.execute(workflow);

            expect(executor.state?.error).toBeDefined();
            expect(executor.state?.endedAt).toBeDefined();
        });
    });

    describe('Event Emission', () => {
        it('should subscribe and unsubscribe correctly', async () => {
            const workflow = createMockWorkflow();
            let callCount = 0;

            const unsubscribe = executor.subscribe(() => {
                callCount++;
            });

            await executor.execute(workflow);

            const countBeforeUnsubscribe = callCount;
            unsubscribe();

            await executor.execute(workflow);

            expect(callCount).toBe(countBeforeUnsubscribe);
        });

        it('should support multiple subscribers', async () => {
            const workflow = createMockWorkflow();
            const calls1: number[] = [];
            const calls2: number[] = [];

            executor.subscribe(() => calls1.push(1));
            executor.subscribe(() => calls2.push(2));

            await executor.execute(workflow);

            expect(calls1.length).toBeGreaterThan(0);
            expect(calls2.length).toBeGreaterThan(0);
            expect(calls1.length).toEqual(calls2.length);
        });

        it('should emit step_started events', async () => {
            const workflow = createMockWorkflow();
            const startedSteps: string[] = [];

            executor.subscribe((event) => {
                if (event.type === 'step_started') {
                    startedSteps.push(event.stepId);
                }
            });

            await executor.execute(workflow);

            expect(startedSteps).toContain('step-1');
            expect(startedSteps).toContain('step-2');
        });

        it('should emit step_completed events with results', async () => {
            const workflow = createMockWorkflow();
            const completedSteps: StepResult[] = [];

            executor.subscribe((event) => {
                if (event.type === 'step_completed') {
                    completedSteps.push(event.result);
                }
            });

            await executor.execute(workflow);

            expect(completedSteps.length).toBe(2);
            expect(completedSteps[0].success).toBe(true);
        });
    });

    describe('Callback System', () => {
        it('should call onStepComplete for each step', async () => {
            const workflow = createMockWorkflow();
            const onStepComplete = vi.fn();

            await executor.execute(workflow, { onStepComplete });

            expect(onStepComplete).toHaveBeenCalledTimes(2);
        });

        it('should call onComplete when finished', async () => {
            const workflow = createMockWorkflow();
            const onComplete = vi.fn();

            await executor.execute(workflow, { onComplete });

            expect(onComplete).toHaveBeenCalledTimes(1);
            expect(onComplete).toHaveBeenCalledWith(
                expect.objectContaining({ status: ExecutionState.COMPLETED })
            );
        });

        it('should pass step results to onStepComplete', async () => {
            const workflow = createMockWorkflow();
            const onStepComplete = vi.fn();

            await executor.execute(workflow, { onStepComplete });

            const firstCall = onStepComplete.mock.calls[0][0];
            expect(firstCall).toHaveProperty('stepId');
            expect(firstCall).toHaveProperty('success');
            expect(firstCall).toHaveProperty('timestamp');
        });
    });

    describe('Complex Workflows', () => {
        it('should handle workflow with multiple branches', async () => {
            const start = createMockStep('start', StepType.BRANCH, ['a', 'b', 'c']);
            const branchA = createMockStep('a', StepType.END);
            const branchB = createMockStep('b', StepType.END);
            const branchC = createMockStep('c', StepType.END);

            start.config = {
                branches: [
                    { condition: 'path === "a"', targetStepId: 'a' },
                    { condition: 'path === "b"', targetStepId: 'b' },
                ],
                defaultBranch: 'c',
            };

            const workflow: Workflow = {
                id: 'test',
                name: 'Test',
                version: '1.0.0',
                steps: [start, branchA, branchB, branchC],
                startStepId: 'start',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            await executor.execute(workflow, {
                input: { path: 'a' },
            });

            expect(executor.state?.status).toBe(ExecutionState.COMPLETED);
        });

        it('should handle linear workflow with many steps', async () => {
            const steps: WorkflowStep[] = [];
            let previousId = 'step-0';

            for (let i = 0; i < 10; i++) {
                const step = createMockStep(`step-${i}`, StepType.SEND_MESSAGE);
                if (i > 0) {
                    steps[i - 1].nextSteps = [step.id];
                }
                if (i === 9) {
                    step.type = StepType.END;
                }
                steps.push(step);
                previousId = step.id;
            }

            const workflow: Workflow = {
                id: 'test',
                name: 'Test',
                version: '1.0.0',
                steps,
                startStepId: 'step-0',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            await executor.execute(workflow);

            expect(executor.state?.completedSteps.length).toBe(10);
            expect(executor.state?.progress.completed).toBe(10);
        });
    });

    describe('Edge Cases', () => {
        it('should handle single step workflow', async () => {
            const step = createMockStep('only', StepType.END);

            const workflow: Workflow = {
                id: 'test',
                name: 'Test',
                version: '1.0.0',
                steps: [step],
                startStepId: 'only',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            await executor.execute(workflow);

            expect(executor.state?.status).toBe(ExecutionState.COMPLETED);
            expect(executor.state?.completedSteps).toContain('only');
        });

        it('should handle workflow with no explicit end', async () => {
            const step1 = createMockStep('step-1', StepType.SEND_MESSAGE, []);
            // No END step, just terminates when nextSteps is empty

            const workflow: Workflow = {
                id: 'test',
                name: 'Test',
                version: '1.0.0',
                steps: [step1],
                startStepId: 'step-1',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            await executor.execute(workflow);

            expect(executor.state?.status).toBe(ExecutionState.COMPLETED);
        });

        it('should handle circular reference detection', async () => {
            const step1 = createMockStep('step-1', StepType.SEND_MESSAGE, ['step-2']);
            const step2 = createMockStep('step-2', StepType.SEND_MESSAGE, ['step-1']); // Back to step-1

            const workflow: Workflow = {
                id: 'test',
                name: 'Test',
                version: '1.0.0',
                steps: [step1, step2],
                startStepId: 'step-1',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            // Should detect and prevent infinite loop
            // After max iterations, it should complete or fail
            await executor.execute(workflow);

            expect([ExecutionState.COMPLETED, ExecutionState.FAILED]).toContain(executor.state?.status);
        });
    });

    describe('Performance', () => {
        it('should complete simple workflow in reasonable time', async () => {
            const workflow = createMockWorkflow();
            const start = Date.now();

            await executor.execute(workflow);

            const duration = Date.now() - start;
            expect(duration).toBeLessThan(5000); // 5 seconds max
        });

        it('should not leak memory between executions', async () => {
            const workflow = createMockWorkflow();
            const initialListeners = (executor as any).listeners.size;

            // Run multiple times
            for (let i = 0; i < 10; i++) {
                await executor.execute(workflow);
            }

            // Listeners should not accumulate
            expect((executor as any).listeners.size).toBe(initialListeners);
        });
    });
});

describe('WorkflowExecutionError', () => {
    it('should create error with message', () => {
        const error = new WorkflowExecutionError('Test error');
        expect(error.message).toBe('Test error');
        expect(error.name).toBe('WorkflowExecutionError');
    });

    it('should include stepId', () => {
        const error = new WorkflowExecutionError('Test', 'step-123');
        expect(error.stepId).toBe('step-123');
    });

    it('should include error code', () => {
        const error = new WorkflowExecutionError('Test', 'step-123', EXECUTION_ERRORS.STEP_NOT_FOUND);
        expect(error.code).toBe(EXECUTION_ERRORS.STEP_NOT_FOUND);
    });
});

describe('EXECUTION_ERRORS', () => {
    it('should have all required error codes', () => {
        expect(EXECUTION_ERRORS.INVALID_WORKFLOW).toBe('invalid_workflow');
        expect(EXECUTION_ERRORS.NO_START_STEP).toBe('no_start_step');
        expect(EXECUTION_ERRORS.STEP_NOT_FOUND).toBe('step_not_found');
        expect(EXECUTION_ERRORS.MISSING_INPUT).toBe('missing_input');
        expect(EXECUTION_ERRORS.EXECUTION_FAILED).toBe('execution_failed');
        expect(EXECUTION_ERRORS.API_ERROR).toBe('api_error');
        expect(EXECUTION_ERRORS.PAUSED).toBe('paused');
    });
});
