/**
 * @fileoverview Workflow Builder Types
 * @module lib/workflow/builder/types
 * @governance EPIC-E4-5
 * @created 2026-01-06
 *
 * Type definitions for visual workflow builder.
 */

/**
 * Available workflow step types
 */
export enum StepType {
    /** Send a message to AI agent */
    SEND_MESSAGE = 'send_message',
    /** Route based on intent classification */
    ROUTE = 'route',
    /** Branch based on conditions */
    BRANCH = 'branch',
    /** Multi-agent debate */
    DEBATE = 'debate',
    /** Sequential expansion */
    EXPANSION = 'expansion',
    /** Human input/approval */
    INPUT = 'input',
    /** End workflow */
    END = 'end',
}

/**
 * Step configuration interface
 */
export interface WorkflowStep {
    /** Unique step ID */
    id: string;
    /** Step type */
    type: StepType;
    /** Display name */
    name: string;
    /** Description of what this step does */
    description?: string;
    /** Step-specific configuration */
    config: Record<string, unknown>;
    /** IDs of steps that can follow this one */
    nextSteps: string[];
    /** Position in canvas (for visualization) */
    position?: { x: number; y: number };
    /** Whether step is currently selected */
    selected?: boolean;
}

/**
 * Branch condition for routing
 */
export interface BranchCondition {
    /** Unique condition ID */
    id: string;
    /** Condition name */
    name: string;
    /** Condition expression (simple DSL) */
    expression: string;
    /** Target step ID if condition matches */
    targetStepId: string;
}

/**
 * Workflow definition
 */
export interface Workflow {
    /** Unique workflow ID */
    id: string;
    /** Workflow name */
    name: string;
    /** Workflow description */
    description?: string;
    /** Workflow version */
    version: string;
    /** Ordered list of steps */
    steps: WorkflowStep[];
    /** Starting step ID */
    startStepId: string;
    /** Created timestamp */
    createdAt: number;
    /** Updated timestamp */
    updatedAt: number;
    /** Tags for organization */
    tags?: string[];
    /** Author */
    author?: string;
}

/**
 * Workflow template (preset)
 */
export interface WorkflowTemplate {
    /** Template ID */
    id: string;
    /** Template name */
    name: string;
    /** Template description */
    description: string;
    /** Category (research, coding, writing, etc.) */
    category: string;
    /** Workflow definition (can be customized) */
    workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>;
    /** Icon for template display */
    icon?: string;
}

/**
 * Workflow builder state
 */
export interface WorkflowBuilderState {
    /** Current workflow being edited */
    workflow: Workflow | null;
    /** Selected step ID */
    selectedStepId: string | null;
    /** Is dragging */
    isDragging: boolean;
    /** Dragged step ID */
    draggedStepId: string | null;
    /** Validation errors */
    errors: Record<string, string>;
    /** Is workflow valid */
    isValid: boolean;
    /** Is in preview mode */
    isPreview: boolean;
    /** Currently executing step ID (for preview) */
    executingStepId?: string;
}

/**
 * Step palette item (draggable from toolbar)
 */
export interface PaletteItem {
    /** Step type */
    type: StepType;
    /** Display name */
    name: string;
    /** Description */
    description: string;
    /** Icon */
    icon: string;
    /** Default configuration */
    defaultConfig: Record<string, unknown>;
    /** Color for UI */
    color: string;
}

/**
 * Connection between steps
 */
export interface StepConnection {
    /** Connection ID */
    id: string;
    /** Source step ID */
    sourceId: string;
    /** Target step ID */
    targetId: string;
    /** Optional condition label */
    label?: string;
}

// ============================================================================
// Step Palette Definitions
// ============================================================================

/**
 * Available palette items for drag-and-drop
 */
export const STEP_PALETTE: PaletteItem[] = [
    {
        type: StepType.SEND_MESSAGE,
        name: 'Send Message',
        description: 'Send a message to the AI agent',
        icon: '💬',
        defaultConfig: { temperature: 0.7, maxTokens: 1000 },
        color: 'bg-blue-500',
    },
    {
        type: StepType.ROUTE,
        name: 'Route',
        description: 'Route to different agents based on intent',
        icon: '🔀',
        defaultConfig: { intents: ['coding', 'research', 'writing'] },
        color: 'bg-purple-500',
    },
    {
        type: StepType.BRANCH,
        name: 'Branch',
        description: 'Branch workflow based on conditions',
        icon: '🔀',
        defaultConfig: { conditions: [] },
        color: 'bg-orange-500',
    },
    {
        type: StepType.DEBATE,
        name: 'Debate',
        description: 'Multi-agent debate on a topic',
        icon: '🗣️',
        defaultConfig: { rounds: 3, personas: ['optimist', 'skeptic', 'expert'] },
        color: 'bg-green-500',
    },
    {
        type: StepType.EXPANSION,
        name: 'Expansion',
        description: 'Sequential expansion with follow-up questions',
        icon: '📋',
        defaultConfig: { questionCount: 3 },
        color: 'bg-cyan-500',
    },
    {
        type: StepType.INPUT,
        name: 'Input',
        description: 'Request human input or approval',
        icon: '✋',
        defaultConfig: { required: true },
        color: 'bg-yellow-500',
    },
    {
        type: StepType.END,
        name: 'End',
        description: 'End the workflow',
        icon: '⏹️',
        defaultConfig: {},
        color: 'bg-gray-500',
    },
];

/**
 * Preset workflow templates
 */
export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
    {
        id: 'quick-research',
        name: 'Quick Research',
        description: 'Research a topic and summarize findings',
        category: 'research',
        icon: '🔍',
        workflow: {
            name: 'Quick Research',
            version: '1.0.0',
            steps: [
                {
                    id: 'step-1',
                    type: StepType.SEND_MESSAGE,
                    name: 'Research Query',
                    description: 'Ask the agent to research a topic',
                    config: { temperature: 0.3, maxTokens: 2000 },
                    nextSteps: ['step-2'],
                },
                {
                    id: 'step-2',
                    type: StepType.ROUTE,
                    name: 'Route by Intent',
                    description: 'Route to appropriate research agent',
                    config: { intents: ['web_search', 'knowledge_base'] },
                    nextSteps: ['step-3'],
                },
                {
                    id: 'step-3',
                    type: StepType.END,
                    name: 'Complete',
                    description: 'Present research summary',
                    config: {},
                    nextSteps: [],
                },
            ],
            startStepId: 'step-1',
        },
    },
    {
        id: 'code-review',
        name: 'Code Review',
        description: 'Review code with multiple perspectives',
        category: 'coding',
        icon: '👁️',
        workflow: {
            name: 'Code Review',
            version: '1.0.0',
            steps: [
                {
                    id: 'step-1',
                    type: StepType.DEBATE,
                    name: 'Debate Code Quality',
                    description: 'Debate pros and cons of the code',
                    config: { rounds: 2, personas: ['expert', 'skeptic'] },
                    nextSteps: ['step-2'],
                },
                {
                    id: 'step-2',
                    type: StepType.SEND_MESSAGE,
                    name: 'Generate Summary',
                    description: 'Combine debate into actionable feedback',
                    config: { temperature: 0.5 },
                    nextSteps: ['step-3'],
                },
                {
                    id: 'step-3',
                    type: StepType.END,
                    name: 'End',
                    description: 'Present final review',
                    config: {},
                    nextSteps: [],
                },
            ],
            startStepId: 'step-1',
        },
    },
    {
        id: 'note-summarize',
        name: 'Note Summarization',
        description: 'Summarize and connect notes',
        category: 'writing',
        icon: '📝',
        workflow: {
            name: 'Note Summarization',
            version: '1.0.0',
            steps: [
                {
                    id: 'step-1',
                    type: StepType.EXPANSION,
                    name: 'Generate Follow-ups',
                    description: 'Create questions for deeper exploration',
                    config: { questionCount: 3 },
                    nextSteps: ['step-2'],
                },
                {
                    id: 'step-2',
                    type: StepType.SEND_MESSAGE,
                    name: 'Summarize',
                    description: 'Create comprehensive summary',
                    config: { temperature: 0.6 },
                    nextSteps: ['step-3'],
                },
                {
                    id: 'step-3',
                    type: StepType.END,
                    name: 'Complete',
                    description: 'Save summary',
                    config: {},
                    nextSteps: [],
                },
            ],
            startStepId: 'step-1',
        },
    },
    {
        id: 'debate-topic',
        name: 'Debate Topic',
        description: 'Structured debate on any topic',
        category: 'discussion',
        icon: '🗣️',
        workflow: {
            name: 'Debate Topic',
            version: '1.0.0',
            steps: [
                {
                    id: 'step-1',
                    type: StepType.DEBATE,
                    name: 'Debate',
                    description: 'Multi-perspective debate',
                    config: { rounds: 3, personas: ['optimist', 'skeptic', 'expert'] },
                    nextSteps: ['step-2'],
                },
                {
                    id: 'step-2',
                    type: StepType.END,
                    name: 'Present Result',
                    description: 'Show synthesis',
                    config: {},
                    nextSteps: [],
                },
            ],
            startStepId: 'step-1',
        },
    },
    {
        id: 'brainstorm',
        name: 'Brainstorming',
        description: 'Generate and expand on ideas',
        category: 'creative',
        icon: '💡',
        workflow: {
            name: 'Brainstorming',
            version: '1.0.0',
            steps: [
                {
                    id: 'step-1',
                    type: StepType.SEND_MESSAGE,
                    name: 'Generate Ideas',
                    description: 'Initial idea generation',
                    config: { temperature: 0.9, maxTokens: 1500 },
                    nextSteps: ['step-2', 'step-3'],
                },
                {
                    id: 'step-2',
                    type: StepType.EXPANSION,
                    name: 'Expand Best Idea',
                    description: 'Deep dive into top idea',
                    config: { questionCount: 5 },
                    nextSteps: ['step-4'],
                },
                {
                    id: 'step-3',
                    type: StepType.DEBATE,
                    name: 'Critique Ideas',
                    description: 'Critical review of ideas',
                    config: { rounds: 2, personas: ['skeptic', 'expert'] },
                    nextSteps: ['step-4'],
                },
                {
                    id: 'step-4',
                    type: StepType.END,
                    name: 'Present Results',
                    description: 'Show final brainstorming results',
                    config: {},
                    nextSteps: [],
                },
            ],
            startStepId: 'step-1',
        },
    },
];

/**
 * Validation errors for workflow steps
 */
export const STEP_VALIDATION_ERRORS = {
    NO_NAME: 'Step must have a name',
    NO_TYPE: 'Step must have a type',
    INVALID_CONNECTIONS: 'Step has invalid connections',
    CIRCULAR_REFERENCE: 'Circular reference detected',
    NO_END: 'Workflow must have an END step',
    INVALID_START: 'Start step ID is invalid',
} as const;
