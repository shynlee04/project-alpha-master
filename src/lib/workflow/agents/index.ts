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

// Content-Based Routing Agent (E4-3)
export {
    ContentRoutingAgent,
    RoutingError,
    createRoutingAgent,
    classifyQuery,
    classifyQueryWithContext,
    ROUTING_ERRORS,
} from './content-routing-agent';

export type {
    IntentType,
    RoutingDecision,
    RoutingConfig,
    RoutingContext,
    RoutingFeedback,
} from './content-routing-agent';
