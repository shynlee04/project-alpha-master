/**
 * @fileoverview Workflow Data Structures
 * @module lib/workflow/types
 * @governance EPIC-E4-1
 * @created 2026-01-06
 *
 * Core data structures for agentic workflow engine.
 * Supports workflow definition, execution tracking, and versioning.
 *
 * Story E4-1: Workflow Data Structures
 */

import { z } from 'zod';

// ============================================================================
// Workflow Step Types
// ============================================================================

/**
 * Supported workflow step types
 */
export enum StepType {
    /** Single agent execution */
    AGENT = 'agent',
    /** Parallel execution of multiple steps */
    PARALLEL = 'parallel',
    /** Sequential execution of steps */
    SEQUENTIAL = 'sequential',
    /** Conditional branching */
    CONDITIONAL = 'conditional',
    /** Loop/iteration */
    LOOP = 'loop',
    /** Data transformation */
    TRANSFORM = 'transform',
    /** Human input/approval */
    APPROVAL = 'approval',
}

/**
 * Step execution status
 */
export enum StepStatus {
    /** Step is pending execution */
    PENDING = 'pending',
    /** Step is currently running */
    RUNNING = 'running',
    /** Step completed successfully */
    COMPLETED = 'completed',
    /** Step failed */
    FAILED = 'failed',
    /** Step was skipped */
    SKIPPED = 'skipped',
}

/**
 * Workflow execution status
 */
export enum WorkflowStatus {
    /** Workflow is being created */
    DRAFT = 'draft',
    /** Workflow is ready to execute */
    READY = 'ready',
    /** Workflow is currently running */
    RUNNING = 'running',
    /** Workflow completed successfully */
    COMPLETED = 'completed',
    /** Workflow failed */
    FAILED = 'failed',
    /** Workflow was cancelled */
    CANCELLED = 'cancelled',
}

// ============================================================================
// Core Interfaces
// ============================================================================

/**
 * Configuration for an agent execution step
 */
export interface AgentStepConfig {
    /** Agent ID to execute */
    agentId: string;
    /** Prompt template for the agent */
    prompt: string;
    /** Input variables for prompt template */
    variables?: Record<string, unknown>;
    /** Timeout in milliseconds (default: 60000) */
    timeout?: number;
    /** Retry count on failure (default: 0) */
    retries?: number;
}

/**
 * Configuration for a parallel execution step
 */
export interface ParallelStepConfig {
    /** Steps to execute in parallel */
    steps: WorkflowStep[];
    /** Continue on error (default: false) */
    continueOnError?: boolean;
}

/**
 * Configuration for a conditional step
 */
export interface ConditionalStepConfig {
    /** Condition expression to evaluate */
    condition: string;
    /** Steps to execute if condition is true */
    thenSteps: WorkflowStep[];
    /** Steps to execute if condition is false */
    elseSteps?: WorkflowStep[];
}

/**
 * Configuration for a loop step
 */
export interface LoopStepConfig {
    /** Steps to execute in each iteration */
    steps: WorkflowStep[];
    /** Maximum iterations (default: 10) */
    maxIterations?: number;
    /** Loop break condition */
    breakCondition?: string;
    /** Loop variable name */
    variableName?: string;
}

/**
 * Configuration for a transform step
 */
export interface TransformStepConfig {
    /** Transform type (e.g., 'extract', 'format', 'parse') */
    transform: string;
    /** Input data path */
    inputPath: string;
    /** Output data path */
    outputPath: string;
    /** Transform options */
    options?: Record<string, unknown>;
}

/**
 * Configuration for an approval step
 */
export interface ApprovalStepConfig {
    /** Approval message */
    message: string;
    /** Required approvers (empty = any user) */
    requiredApprovers?: string[];
    /** Timeout in milliseconds (default: 3600000 = 1 hour) */
    timeout?: number;
    /** Auto-reject on timeout (default: true) */
    autoRejectOnTimeout?: boolean;
}

/**
 * Single workflow step definition
 */
export interface WorkflowStep {
    /** Unique step identifier */
    id: string;
    /** Step type */
    type: StepType;
    /** Step name (human-readable) */
    name: string;
    /** Step description */
    description?: string;
    /** Step configuration based on type */
    config?: AgentStepConfig | ParallelStepConfig | ConditionalStepConfig | LoopStepConfig | TransformStepConfig | ApprovalStepConfig;
    /** Step dependencies (must complete before this step) */
    dependsOn?: string[];
    /** Retry count on failure */
    retries?: number;
    /** Timeout in milliseconds */
    timeout?: number;
}

/**
 * Workflow definition
 */
export interface Workflow {
    /** Unique workflow identifier */
    id: string;
    /** Workflow version (semantic versioning) */
    version: string;
    /** Workflow name */
    name: string;
    /** Workflow description */
    description?: string;
    /** Workflow steps in execution order */
    steps: WorkflowStep[];
    /** Global workflow configuration */
    config?: {
        /** Maximum execution time (milliseconds) */
        timeout?: number;
        /** Enable step-level retries */
        enableRetries?: boolean;
        /** Continue on error */
        continueOnError?: boolean;
        /** Input schema (Zod) */
        inputSchema?: Record<string, unknown>;
        /** Output schema (Zod) */
        outputSchema?: Record<string, unknown>;
    };
    /** Workflow metadata */
    metadata?: {
        /** Author/creator */
        author?: string;
        /** Creation timestamp */
        createdAt?: string;
        /** Last modified timestamp */
        updatedAt?: string;
        /** Tags for categorization */
        tags?: string[];
        /** Workflow category */
        category?: string;
    };
}

/**
 * Step execution result
 */
export interface StepResult {
    /** Step ID */
    stepId: string;
    /** Execution status */
    status: StepStatus;
    /** Execution start timestamp */
    startedAt: string;
    /** Execution end timestamp */
    completedAt?: string;
    /** Error message if failed */
    error?: string;
    /** Output data */
    output?: unknown;
    /** Execution logs */
    logs?: string[];
}

/**
 * Workflow execution state
 */
export interface WorkflowExecution {
    /** Unique execution ID */
    id: string;
    /** Workflow ID being executed */
    workflowId: string;
    /** Workflow version */
    workflowVersion: string;
    /** Execution status */
    status: WorkflowStatus;
    /** Input data */
    input?: Record<string, unknown>;
    /** Output data */
    output?: Record<string, unknown>;
    /** Step execution results */
    stepResults: StepResult[];
    /** Current step index */
    currentStepIndex?: number;
    /** Execution start timestamp */
    startedAt: string;
    /** Execution end timestamp */
    completedAt?: string;
    /** Error message if failed */
    error?: string;
    /** Execution metadata */
    metadata?: {
        /** User who triggered execution */
        userId?: string;
        /** Workspace type */
        workspaceType?: string;
        /** Project ID */
        projectId?: string;
        /** Parent execution ID (for sub-workflows) */
        parentExecutionId?: string;
    };
}

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Agent step config schema
 */
const AgentStepConfigSchema = z.object({
    agentId: z.string(),
    prompt: z.string(),
    variables: z.record(z.string(), z.any()).optional(),
    timeout: z.number().positive().optional(),
    retries: z.number().int().nonnegative().optional(),
});

/**
 * Parallel step config schema
 */
const ParallelStepConfigSchema = z.object({
    steps: z.array(z.lazy(() => WorkflowStepSchema)),
    continueOnError: z.boolean().optional(),
});

/**
 * Conditional step config schema
 */
const ConditionalStepConfigSchema = z.object({
    condition: z.string(),
    thenSteps: z.array(z.lazy(() => WorkflowStepSchema)),
    elseSteps: z.array(z.lazy(() => WorkflowStepSchema)).optional(),
});

/**
 * Loop step config schema
 */
const LoopStepConfigSchema = z.object({
    steps: z.array(z.lazy(() => WorkflowStepSchema)),
    maxIterations: z.number().int().positive().optional(),
    breakCondition: z.string().optional(),
    variableName: z.string().optional(),
});

/**
 * Transform step config schema
 */
const TransformStepConfigSchema = z.object({
    transform: z.string(),
    inputPath: z.string(),
    outputPath: z.string(),
    options: z.record(z.string(), z.any()).optional(),
});

/**
 * Approval step config schema
 */
const ApprovalStepConfigSchema = z.object({
    message: z.string(),
    requiredApprovers: z.array(z.string()).optional(),
    timeout: z.number().positive().optional(),
    autoRejectOnTimeout: z.boolean().optional(),
});

/**
 * Workflow step schema
 */
export const WorkflowStepSchema: z.ZodType<WorkflowStep> = z.object({
    id: z.string().uuid(),
    type: z.nativeEnum(StepType),
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    config: z.union([
        AgentStepConfigSchema,
        ParallelStepConfigSchema,
        ConditionalStepConfigSchema,
        LoopStepConfigSchema,
        TransformStepConfigSchema,
        ApprovalStepConfigSchema,
    ]).optional(),
    dependsOn: z.array(z.string()).optional(),
    retries: z.number().int().nonnegative().optional(),
    timeout: z.number().positive().optional(),
});

/**
 * Workflow schema
 */
export const WorkflowSchema: z.ZodType<Workflow> = z.object({
    id: z.string().uuid(),
    version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Semantic version (e.g., 1.0.0)'),
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    steps: z.array(WorkflowStepSchema).min(1),
    config: z.object({
        timeout: z.number().positive().optional(),
        enableRetries: z.boolean().optional(),
        continueOnError: z.boolean().optional(),
        inputSchema: z.record(z.string(), z.any()).optional(),
        outputSchema: z.record(z.string(), z.any()).optional(),
    }).optional(),
    metadata: z.object({
        author: z.string().optional(),
        createdAt: z.string().datetime().optional(),
        updatedAt: z.string().datetime().optional(),
        tags: z.array(z.string()).optional(),
        category: z.string().optional(),
    }).optional(),
});

/**
 * Step result schema
 */
export const StepResultSchema: z.ZodType<StepResult> = z.object({
    stepId: z.string(),
    status: z.nativeEnum(StepStatus),
    startedAt: z.string().datetime(),
    completedAt: z.string().datetime().optional(),
    error: z.string().optional(),
    output: z.unknown().optional(),
    logs: z.array(z.string()).optional(),
});

/**
 * Workflow execution schema
 */
export const WorkflowExecutionSchema: z.ZodType<WorkflowExecution> = z.object({
    id: z.string().uuid(),
    workflowId: z.string().uuid(),
    workflowVersion: z.string(),
    status: z.nativeEnum(WorkflowStatus),
    input: z.record(z.string(), z.any()).optional(),
    output: z.record(z.string(), z.any()).optional(),
    stepResults: z.array(StepResultSchema),
    currentStepIndex: z.number().int().nonnegative().optional(),
    startedAt: z.string().datetime(),
    completedAt: z.string().datetime().optional(),
    error: z.string().optional(),
    metadata: z.object({
        userId: z.string().optional(),
        workspaceType: z.string().optional(),
        projectId: z.string().optional(),
        parentExecutionId: z.string().optional(),
    }).optional(),
});

// ============================================================================
// Serialization Utilities
// ============================================================================

/**
 * Serialize workflow to JSON
 * @param workflow - Workflow to serialize
 * @returns JSON string
 */
export function serializeWorkflow(workflow: Workflow): string {
    return JSON.stringify(workflow, null, 2);
}

/**
 * Deserialize workflow from JSON
 * @param json - JSON string to parse
 * @returns Workflow object
 * @throws {Error} if JSON is invalid or fails validation
 */
export function deserializeWorkflow(json: string): Workflow {
    const parsed = JSON.parse(json);
    return WorkflowSchema.parse(parsed);
}

/**
 * Validate workflow
 * @param workflow - Workflow to validate
 * @returns Validation result with success flag and errors
 */
export function validateWorkflow(workflow: unknown): { success: boolean; errors?: string[] } {
    const result = WorkflowSchema.safeParse(workflow);
    if (result.success) {
        return { success: true };
    }
    return {
        success: false,
        errors: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
    };
}

/**
 * Validate workflow execution
 * @param execution - Workflow execution to validate
 * @returns Validation result with success flag and errors
 */
export function validateWorkflowExecution(execution: unknown): { success: boolean; errors?: string[] } {
    const result = WorkflowExecutionSchema.safeParse(execution);
    if (result.success) {
        return { success: true };
    }
    return {
        success: false,
        errors: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
    };
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a value is a Workflow
 */
export function isWorkflow(value: unknown): value is Workflow {
    const result = WorkflowSchema.safeParse(value);
    return result.success;
}

/**
 * Check if a value is a WorkflowExecution
 */
export function isWorkflowExecution(value: unknown): value is WorkflowExecution {
    const result = WorkflowExecutionSchema.safeParse(value);
    return result.success;
}

/**
 * Check if step result indicates a failure
 */
export function isStepFailed(result: StepResult): boolean {
    return result.status === StepStatus.FAILED;
}

/**
 * Check if workflow execution is active
 */
export function isExecutionActive(execution: WorkflowExecution): boolean {
    return execution.status === WorkflowStatus.RUNNING || execution.status === WorkflowStatus.READY;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default workflow configuration
 */
export const DEFAULT_WORKFLOW_CONFIG = {
    timeout: 300000, // 5 minutes
    enableRetries: true,
    continueOnError: false,
} as const;

/**
 * Default step configuration
 */
export const DEFAULT_STEP_CONFIG = {
    retries: 0,
    timeout: 60000, // 1 minute
} as const;

/**
 * Create empty workflow execution
 */
export function createEmptyExecution(workflowId: string, workflowVersion: string): WorkflowExecution {
    return {
        id: globalThis.crypto.randomUUID(),
        workflowId,
        workflowVersion,
        status: WorkflowStatus.DRAFT,
        stepResults: [],
        startedAt: new Date().toISOString(),
    };
}

/**
 * Create step result
 */
export function createStepResult(stepId: string, status: StepStatus = StepStatus.PENDING): StepResult {
    return {
        stepId,
        status,
        startedAt: new Date().toISOString(),
        logs: [],
    };
}
