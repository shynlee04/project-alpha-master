/**
 * @fileoverview Workflow Module Barrel Export
 * @module lib/workflow
 * @governance EPIC-E4-1
 */

// Types
export {
    Workflow,
    WorkflowStep,
    WorkflowExecution,
    StepResult,
    AgentStepConfig,
    ParallelStepConfig,
    ConditionalStepConfig,
    LoopStepConfig,
    TransformStepConfig,
    ApprovalStepConfig,
} from './types';

// Enums
export {
    StepType,
    StepStatus,
    WorkflowStatus,
} from './types';

// Schemas
export {
    WorkflowSchema,
    WorkflowStepSchema,
    WorkflowExecutionSchema,
    StepResultSchema,
} from './types';

// Utilities
export {
    serializeWorkflow,
    deserializeWorkflow,
    validateWorkflow,
    validateWorkflowExecution,
    isWorkflow,
    isWorkflowExecution,
    isStepFailed,
    isExecutionActive,
} from './types';

// Defaults
export {
    DEFAULT_WORKFLOW_CONFIG,
    DEFAULT_STEP_CONFIG,
    createEmptyExecution,
    createStepResult,
} from './types';

// Type re-exports
export type {
    Workflow as WorkflowType,
    WorkflowStep as WorkflowStepType,
    WorkflowExecution as WorkflowExecutionType,
    StepResult as StepResultType,
} from './types';
