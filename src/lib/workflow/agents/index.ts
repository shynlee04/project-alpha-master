/**
 * @fileoverview Workflow Agents Barrel Export
 * @module lib/workflow/agents
 */

// Sequential Expansion Agent (E4-2)
export {
    SequentialExpansionAgent,
    ExpansionError,
    createExpansionAgent,
    generateThreadExpansions,
} from './sequential-expansion-agent';

export type {
    ExpansionQuestion,
    ExpansionResult,
    ExpansionConfig,
    ExpansionContext,
} from './sequential-expansion-agent';

// Re-export errors
export { EXPANSION_ERRORS } from './sequential-expansion-agent';
