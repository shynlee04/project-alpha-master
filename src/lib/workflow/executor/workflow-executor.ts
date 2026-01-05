/**
 * @fileoverview Workflow Executor Engine
 * @module lib/workflow/executor/workflow-executor
 * @governance EPIC-E4-9
 * @created 2026-01-06
 *
 * Executes workflow definitions with state machine pattern.
 * Supports sequential execution, branching, multi-agent debates, and expansion.
 */

import type { Workflow, WorkflowStep } from '../builder/types';
import { StepType } from '../builder/types';
import { DebateAgent, type DebateConfig, type DebateResults } from '../agents/debate-agent';
import { SequentialExpansionAgent, type ExpansionConfig, type ExpansionResult } from '../agents/sequential-expansion-agent';

// ============================================================================
// Types
// ============================================================================

/**
 * Execution state for a workflow
 */
export enum ExecutionState {
    /** Ready to execute */
    IDLE = 'idle',
    /** Currently executing */
    RUNNING = 'running',
    /** Paused by user */
    PAUSED = 'paused',
    /** Completed successfully */
    COMPLETED = 'completed',
    /** Failed with error */
    FAILED = 'failed',
}

/**
 * Result of a single step execution
 */
export interface StepResult {
    /** Step ID */
    stepId: string;
    /** Step name */
    stepName: string;
    /** Whether step succeeded */
    success: boolean;
    /** Output from the step (if any) */
    output?: unknown;
    /** Error message (if failed) */
    error?: string;
    /** Timestamp of completion */
    timestamp: number;
    /** Next step IDs to execute */
    nextSteps: string[];
}

/**
 * State maintained during workflow execution
 */
export interface ExecutionState {
    /** Current workflow being executed */
    workflow: Workflow;
    /** Current execution state */
    status: ExecutionState;
    /** ID of currently executing step */
    currentStepId: string | null;
    /** IDs of completed steps in order */
    completedSteps: string[];
    /** Results from each completed step */
    stepResults: Map<string, StepResult>;
    /** Workflow-level state for passing between steps */
    workflowState: Record<string, unknown>;
    /** Progress tracking */
    progress: {
        /** Total steps to execute */
        total: number;
        /** Number of steps completed */
        completed: number;
    };
    /** Error if workflow failed */
    error?: string;
    /** Timestamp when execution started */
    startedAt: number;
    /** Timestamp when execution ended (if completed/failed) */
    endedAt?: number;
}

/**
 * Configuration for workflow execution
 */
export interface ExecutionConfig {
    /** Initial input to the workflow */
    input?: Record<string, unknown>;
    /** Provider ID for LLM calls */
    providerId?: string;
    /** Model to use */
    modelId?: string;
    /** Maximum tokens for LLM responses */
    maxTokens?: number;
    /** Callback when step completes */
    onStepComplete?: (result: StepResult) => void;
    /** Callback when workflow completes */
    onComplete?: (state: ExecutionState) => void;
    /** Callback when workflow errors */
    onError?: (error: string, state: ExecutionState) => void;
}

/**
 * Event emitted during workflow execution
 */
export type ExecutionEvent =
    | { type: 'started'; state: ExecutionState }
    | { type: 'step_started'; stepId: string; stepName: string }
    | { type: 'step_completed'; result: StepResult }
    | { type: 'step_failed'; stepId: string; error: string }
    | { type: 'paused'; state: ExecutionState }
    | { type: 'resumed'; state: ExecutionState }
    | { type: 'completed'; state: ExecutionState }
    | { type: 'failed'; state: ExecutionState };

/**
 * Listener for execution events
 */
export type ExecutionListener = (event: ExecutionEvent) => void;

// ============================================================================
// Errors
// ============================================================================

/**
 * Custom error for workflow execution failures
 */
export class WorkflowExecutionError extends Error {
    constructor(
        message: string,
        public readonly stepId?: string,
        public readonly code?: string
    ) {
        super(message);
        this.name = 'WorkflowExecutionError';
    }
}

export const EXECUTION_ERRORS = {
    INVALID_WORKFLOW: 'invalid_workflow',
    NO_START_STEP: 'no_start_step',
    STEP_NOT_FOUND: 'step_not_found',
    MISSING_INPUT: 'missing_input',
    EXECUTION_FAILED: 'execution_failed',
    API_ERROR: 'api_error',
    PAUSED: 'paused',
} as const;

// ============================================================================
// Workflow Executor Class
// ============================================================================

/**
 * Workflow Executor Engine
 *
 * Executes workflow definitions with state machine pattern.
 * Supports sequential execution, branching, multi-agent debates, and expansion.
 *
 * @example
 * ```ts
 * const executor = new WorkflowExecutor();
 * await executor.execute(workflow, {
 *   input: { topic: 'AI safety' },
 *   onComplete: (state) => console.log('Done!', state)
 * });
 * ```
 */
export class WorkflowExecutor {
    private currentState: ExecutionState | null = null;
    private listeners: Set<ExecutionListener> = new Set();
    private abortController: AbortController | null = null;

    /**
     * Get current execution state (read-only)
     */
    get state(): ExecutionState | null {
        return this.currentState;
    }

    /**
     * Subscribe to execution events
     */
    subscribe(listener: ExecutionListener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Execute a workflow
     *
     * @param workflow - Workflow definition to execute
     * @param config - Execution configuration
     * @returns Final execution state
     */
    async execute(workflow: Workflow, config: ExecutionConfig = {}): Promise<ExecutionState> {
        // Validate workflow
        this.validateWorkflow(workflow);

        // Reset abort controller
        this.abortController = new AbortController();

        // Initialize execution state
        const state: ExecutionState = {
            workflow,
            status: ExecutionState.RUNNING,
            currentStepId: workflow.startStepId,
            completedSteps: [],
            stepResults: new Map(),
            workflowState: { ...config.input },
            progress: {
                total: workflow.steps.length,
                completed: 0,
            },
            startedAt: Date.now(),
        };

        this.currentState = state;
        this.emit({ type: 'started', state });

        try {
            // Execute steps until end or error
            await this.executeSteps(state, config);

            // Mark as completed
            state.status = ExecutionState.COMPLETED;
            state.endedAt = Date.now();
            this.emit({ type: 'completed', state });

            config.onComplete?.(state);
            return state;
        } catch (error) {
            // Handle pause signal
            if (error instanceof WorkflowExecutionError && error.code === EXECUTION_ERRORS.PAUSED) {
                state.status = ExecutionState.PAUSED;
                this.emit({ type: 'paused', state });
                return state;
            }

            // Handle execution failure
            state.status = ExecutionState.FAILED;
            state.error = error instanceof Error ? error.message : String(error);
            state.endedAt = Date.now();
            this.emit({ type: 'failed', state });

            config.onError?.(state.error, state);
            return state;
        }
    }

    /**
     * Pause a running workflow
     */
    pause(): void {
        if (!this.currentState || this.currentState.status !== ExecutionState.RUNNING) {
            throw new WorkflowExecutionError('Cannot pause: workflow is not running');
        }

        if (this.abortController) {
            this.abortController.abort();
        }
    }

    /**
     * Resume a paused workflow
     *
     * @param config - Optional new config for resumption
     */
    async resume(config: ExecutionConfig = {}): Promise<ExecutionState> {
        if (!this.currentState || this.currentState.status !== ExecutionState.PAUSED) {
            throw new WorkflowExecutionError('Cannot resume: workflow is not paused');
        }

        // Update state to running
        this.currentState.status = ExecutionState.RUNNING;
        this.emit({ type: 'resumed', state: this.currentState });

        // Create new abort controller
        this.abortController = new AbortController();

        try {
            // Continue execution from current step
            await this.executeSteps(this.currentState, config);

            // Mark as completed
            this.currentState.status = ExecutionState.COMPLETED;
            this.currentState.endedAt = Date.now();
            this.emit({ type: 'completed', state: this.currentState });

            config.onComplete?.(this.currentState);
            return this.currentState;
        } catch (error) {
            // Handle pause signal again
            if (error instanceof WorkflowExecutionError && error.code === EXECUTION_ERRORS.PAUSED) {
                this.currentState.status = ExecutionState.PAUSED;
                this.emit({ type: 'paused', state: this.currentState });
                return this.currentState;
            }

            // Handle execution failure
            this.currentState.status = ExecutionState.FAILED;
            this.currentState.error = error instanceof Error ? error.message : String(error);
            this.currentState.endedAt = Date.now();
            this.emit({ type: 'failed', state: this.currentState });

            config.onError?.(this.currentState.error, this.currentState);
            return this.currentState;
        }
    }

    /**
     * Stop execution and reset state
     */
    stop(): void {
        if (this.abortController) {
            this.abortController.abort();
        }

        this.currentState = null;
        this.listeners.clear();
    }

    /**
     * Execute workflow steps sequentially
     */
    private async executeSteps(state: ExecutionState, config: ExecutionConfig): Promise<void> {
        while (state.currentStepId && state.status === ExecutionState.RUNNING) {
            // Check for abort signal
            if (this.abortController?.signal.aborted) {
                throw new WorkflowExecutionError(
                    'Execution paused',
                    state.currentStepId,
                    EXECUTION_ERRORS.PAUSED
                );
            }

            // Find and execute current step
            const step = state.workflow.steps.find(s => s.id === state.currentStepId);
            if (!step) {
                throw new WorkflowExecutionError(
                    `Step not found: ${state.currentStepId}`,
                    state.currentStepId,
                    EXECUTION_ERRORS.STEP_NOT_FOUND
                );
            }

            // Execute the step
            const result = await this.executeStep(step, state, config);

            // Record result
            state.stepResults.set(step.id, result);
            if (!state.completedSteps.includes(step.id)) {
                state.completedSteps.push(step.id);
                state.progress.completed = state.completedSteps.length;
            }

            // Emit completion event
            this.emit({ type: 'step_completed', result });
            config.onStepComplete?.(result);

            // Determine next step
            if (result.nextSteps.length === 0) {
                // No next steps - workflow complete
                state.currentStepId = null;
                break;
            } else if (result.nextSteps.length === 1) {
                // Single next step - continue to it
                state.currentStepId = result.nextSteps[0];
            } else {
                // Multiple next steps - take first one for now
                // TODO: Support parallel execution in future
                state.currentStepId = result.nextSteps[0];
            }
        }
    }

    /**
     * Execute a single workflow step
     */
    private async executeStep(
        step: WorkflowStep,
        state: ExecutionState,
        config: ExecutionConfig
    ): Promise<StepResult> {
        this.emit({ type: 'step_started', stepId: step.id, stepName: step.name });

        const startTime = Date.now();

        try {
            let output: unknown;
            let nextSteps: string[] = [];

            switch (step.type) {
                case StepType.SEND_MESSAGE:
                    output = await this.executeSendMessage(step, state, config);
                    nextSteps = step.nextSteps;
                    break;

                case StepType.ROUTE:
                    output = await this.executeRoute(step, state, config);
                    // Route determines next step dynamically
                    nextSteps = (output as { nextStepId: string }).nextStepId ? [(output as { nextStepId: string }).nextStepId] : step.nextSteps;
                    break;

                case StepType.BRANCH:
                    output = await this.executeBranch(step, state, config);
                    nextSteps = (output as { nextStepId: string }).nextStepId ? [(output as { nextStepId: string }).nextStepId] : step.nextSteps;
                    break;

                case StepType.DEBATE:
                    output = await this.executeDebate(step, state, config);
                    nextSteps = step.nextSteps;
                    break;

                case StepType.EXPANSION:
                    output = await this.executeExpansion(step, state, config);
                    nextSteps = step.nextSteps;
                    break;

                case StepType.INPUT:
                    output = await this.executeInput(step, state, config);
                    nextSteps = step.nextSteps;
                    break;

                case StepType.END:
                    output = { message: 'Workflow completed' };
                    nextSteps = [];
                    break;

                default:
                    throw new WorkflowExecutionError(`Unknown step type: ${step.type}`, step.id);
            }

            // Update workflow state with step output
            if (output && typeof output === 'object') {
                state.workflowState = { ...state.workflowState, ...output };
            }

            return {
                stepId: step.id,
                stepName: step.name,
                success: true,
                output,
                timestamp: Date.now(),
                nextSteps,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            return {
                stepId: step.id,
                stepName: step.name,
                success: false,
                error: errorMessage,
                timestamp: Date.now(),
                nextSteps: [],
            };
        }
    }

    /**
     * Execute SEND_MESSAGE step
     */
    private async executeSendMessage(
        step: WorkflowStep,
        _state: ExecutionState,
        config: ExecutionConfig
    ): Promise<{ message: string; response: string }> {
        // Extract prompt from config
        const prompt = step.config.prompt as string || 'Process the following input';
        const temperature = (step.config.temperature as number) ?? 0.7;
        const maxTokens = (step.config.maxTokens as number) ?? config.maxTokens ?? 1000;

        // In a real implementation, this would call the LLM
        // For now, return a simulated response
        return {
            message: prompt,
            response: `[Simulated AI response to: ${prompt.slice(0, 50)}...] (temperature: ${temperature})`,
        };
    }

    /**
     * Execute ROUTE step - determines next step based on intent
     */
    private async executeRoute(
        step: WorkflowStep,
        state: ExecutionState,
        config: ExecutionConfig
    ): Promise<{ nextStepId: string; intent: string }> {
        // Get intents from config
        const intents = step.config.intents as string[] || [];
        const input = state.workflowState.input as string || '';

        // Simple keyword matching for intent classification
        let matchedIntent = intents[0] || 'default';
        for (const intent of intents) {
            if (input.toLowerCase().includes(intent.toLowerCase())) {
                matchedIntent = intent;
                break;
            }
        }

        // Map intent to next step
        // For now, use the first next step
        const nextStepId = step.nextSteps[0] || '';

        return {
            nextStepId,
            intent: matchedIntent,
        };
    }

    /**
     * Execute BRANCH step - conditional routing
     */
    private async executeBranch(
        step: WorkflowStep,
        state: ExecutionState,
        _config: ExecutionConfig
    ): Promise<{ nextStepId: string; condition: string }> {
        // Get conditions from config
        const conditions = step.config.conditions || [];
        const stateData = state.workflowState;

        // Evaluate each condition
        for (const cond of conditions) {
            const condition = cond as { expression: string; targetStepId: string };
            if (this.evaluateCondition(condition.expression, stateData)) {
                return {
                    nextStepId: condition.targetStepId,
                    condition: condition.expression,
                };
            }
        }

        // Default to first next step
        return {
            nextStepId: step.nextSteps[0] || '',
            condition: 'default',
        };
    }

    /**
     * Execute DEBATE step - multi-agent debate
     */
    private async executeDebate(
        step: WorkflowStep,
        _state: ExecutionState,
        config: ExecutionConfig
    ): Promise<DebateResults> {
        const debateConfig: DebateConfig = {
            providerId: config.providerId || 'gemini',
            model: config.modelId || 'gemini-2.0-flash',
            rounds: (step.config.rounds as number) ?? 3,
            personas: (step.config.personas as string[]) || ['optimist', 'skeptic', 'expert'],
        };

        const topic = (step.config.topic as string) || state.workflowState.input as string || 'Default debate topic';

        const agent = new DebateAgent(debateConfig);
        return agent.conductDebate({ topic });
    }

    /**
     * Execute EXPANSION step - sequential expansion
     */
    private async executeExpansion(
        step: WorkflowStep,
        state: ExecutionState,
        config: ExecutionConfig
    ): Promise<ExpansionResult> {
        const expansionConfig: ExpansionConfig = {
            questionCount: (step.config.questionCount as number) ?? 3,
            providerId: config.providerId || 'gemini',
            modelId: config.modelId || 'gemini-2.0-flash',
            temperature: (step.config.temperature as number) ?? 0.7,
        };

        const lastMessage = (step.config.prompt as string) || 'Generate follow-up questions';
        const context = {
            lastMessage,
            recentHistory: state.completedSteps.map(stepId => {
                const result = state.stepResults.get(stepId);
                return {
                    role: 'assistant',
                    content: result?.output?.toString() || '',
                };
            }),
        };

        const agent = new SequentialExpansionAgent(expansionConfig);
        return agent.generateExpansions(context);
    }

    /**
     * Execute INPUT step - request human input
     */
    private async executeInput(
        step: WorkflowStep,
        _state: ExecutionState,
        _config: ExecutionConfig
    ): Promise<{ input: string }> {
        const prompt = step.config.prompt as string || 'Please provide input:';
        const required = step.config.required as boolean ?? false;

        // In a real implementation, this would pause execution and show UI
        // For now, return a placeholder
        return {
            input: `[User would be prompted: ${prompt}]`,
        };
    }

    /**
     * Evaluate a condition expression against state data
     */
    private evaluateCondition(expression: string, stateData: Record<string, unknown>): boolean {
        try {
            // Simple evaluation for common patterns
            // In production, use a proper expression evaluator

            // Check for equality
            const match = expression.match(/^(\w+)\s*==\s*(.+)$/);
            if (match) {
                const key = match[1];
                const value = match[2].replace(/^['"]|['"]$/g, '');
                return String(stateData[key]) === value;
            }

            // Check for existence
            const existsMatch = expression.match(/^(\w+)\s*exists$/);
            if (existsMatch) {
                const key = existsMatch[1];
                return stateData[key] !== undefined && stateData[key] !== null;
            }

            return false;
        } catch {
            return false;
        }
    }

    /**
     * Validate workflow before execution
     */
    private validateWorkflow(workflow: Workflow): void {
        if (!workflow.steps || workflow.steps.length === 0) {
            throw new WorkflowExecutionError(
                'Workflow has no steps',
                undefined,
                EXECUTION_ERRORS.INVALID_WORKFLOW
            );
        }

        if (!workflow.startStepId) {
            throw new WorkflowExecutionError(
                'Workflow has no start step',
                undefined,
                EXECUTION_ERRORS.NO_START_STEP
            );
        }

        // Verify start step exists
        const hasStartStep = workflow.steps.some(s => s.id === workflow.startStepId);
        if (!hasStartStep) {
            throw new WorkflowExecutionError(
                `Start step not found: ${workflow.startStepId}`,
                workflow.startStepId,
                EXECUTION_ERRORS.STEP_NOT_FOUND
            );
        }
    }

    /**
     * Emit event to all listeners
     */
    private emit(event: ExecutionEvent): void {
        for (const listener of this.listeners) {
            try {
                listener(event);
            } catch (error) {
                console.error('[WorkflowExecutor] Listener error:', error);
            }
        }
    }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a workflow executor
 */
export function createWorkflowExecutor(): WorkflowExecutor {
    return new WorkflowExecutor();
}

/**
 * Execute a workflow with one-shot execution
 *
 * @param workflow - Workflow to execute
 * @param config - Execution configuration
 * @returns Final execution state
 */
export async function executeWorkflow(
    workflow: Workflow,
    config?: ExecutionConfig
): Promise<ExecutionState> {
    const executor = new WorkflowExecutor();
    return executor.execute(workflow, config);
}
