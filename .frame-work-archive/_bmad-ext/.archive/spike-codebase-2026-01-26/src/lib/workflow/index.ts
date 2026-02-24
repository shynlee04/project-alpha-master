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

// Agents (E4-2: Sequential Expansion Agent, E4-3: Content-Based Routing Agent)
export {
    SequentialExpansionAgent,
    ExpansionError,
    createExpansionAgent,
    generateThreadExpansions,
    EXPANSION_ERRORS,
    ContentRoutingAgent,
    RoutingError,
    createRoutingAgent,
    classifyQuery,
    classifyQueryWithContext,
    ROUTING_ERRORS,
} from './agents';

export type {
    ExpansionQuestion,
    ExpansionResult,
    ExpansionConfig,
    ExpansionContext,
    IntentType,
    RoutingDecision,
    RoutingConfig,
    RoutingContext,
    RoutingFeedback,
} from './agents';

// Multi-Agent Debating System (E4-4)
export {
    DebateAgent,
    DebateError,
    createDebateAgent,
    debateTopic,
    debateTopicWithContext,
    DEBATE_ERRORS,
} from './agents/debate-agent';

export type {
    DebatePersona,
    DebateArgument,
    AgreementMatrix,
    DebateSynthesis,
    DebateResults,
    DebateConfig,
    DebateContext,
} from './agents/debate-agent';

// Workflow Builder (E4-5)
export {
    useWorkflowBuilderStore,
} from './builder';

export type {
    Workflow as BuilderWorkflow,
    WorkflowStep as BuilderWorkflowStep,
    WorkflowTemplate,
    WorkflowBuilderState,
    PaletteItem,
    StepConnection,
} from './builder';

export {
    StepType as BuilderStepType,
    STEP_PALETTE,
    WORKFLOW_TEMPLATES,
    STEP_VALIDATION_ERRORS,
} from './builder';
