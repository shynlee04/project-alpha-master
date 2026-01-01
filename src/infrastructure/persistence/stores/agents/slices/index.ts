/**
 * Agent Store Slices - Barrel Export
 *
 * Exports all 5 slice creators for composition.
 *
 * @module agents/slices
 * @story AC-1.3 - Split agents-store.ts god store into 5 slices
 */

export { createAgentCrudSlice, DEFAULT_AGENT } from './agent-crud-slice';
export { createAgentWorkspaceBindingsSlice } from './agent-workspace-bindings-slice';
export { createAgentValidationSlice } from './agent-validation-slice';
export { createAgentEventsSlice } from './agent-events-slice';
export { createAgentUtilsSlice } from './agent-utils-slice';
export type { CombinedAgentsState } from '../types';
