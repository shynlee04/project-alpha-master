/**
 * @fileoverview Workflow Executor Barrel Export
 * @module lib/workflow/executor
 * @governance EPIC-E4-9
 * @created 2026-01-06
 */

export {
    WorkflowExecutor,
    WorkflowExecutionError,
    ExecutionState as WorkflowExecutionState,
    EXECUTION_ERRORS,
    type ExecutionState,
    type ExecutionConfig,
    type ExecutionEvent,
    type ExecutionListener,
    type StepResult,
} from './workflow-executor';
