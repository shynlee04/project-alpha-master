/**
 * Agent Store Slices - Barrel Export
 *
 * Exports all slice creators for composition.
 *
 * @module agents/slices
 * @story AC-1.3 - Split agents-store.ts god store into slices
 * @story S-014 - Split agent-selection-store.ts into focused slices
 */

// Agent selection store slices
export { createAgentSelectionActions } from './agent-selection-actions';
export { createAgentSelectionQueries } from './agent-selection-queries';
export { createAgentSelectionEvents } from './agent-selection-events';
export { createAgentSelectionUtils } from './agent-selection-utils';
export type { AgentSelectionState } from './agent-selection-state';

// Legacy app store agent slices
export { createAgentCrudSlice, DEFAULT_AGENT } from './agent-crud-slice';
export { createAgentWorkspaceBindingsSlice } from './agent-workspace-bindings-slice';
export { createAgentValidationSlice } from './agent-validation-slice';
export { createAgentEventsSlice } from './agent-events-slice';
export { createAgentUtilsSlice } from './agent-utils-slice';
export type { CombinedAgentsState } from '../types';
