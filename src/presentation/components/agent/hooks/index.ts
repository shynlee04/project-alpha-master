/**
 * Agent Configuration Hooks Barrel Export
 *
 * Exports all custom hooks for agent configuration dialog.
 *
 * @module agent/hooks
 */

export { useAgentFormState } from './useAgentFormState'
export { useAgentFormSubmission } from './useAgentFormSubmission'
export { useAgentFormActions } from './useAgentFormActions'
export { useAgentFormValidation } from './useAgentFormValidation'
export { useUnsavedChangesWarning } from './useUnsavedChangesWarning'

export type { AgentFormState, UseAgentFormStateProps } from './useAgentFormState'
export type { UseAgentFormSubmissionProps } from './useAgentFormSubmission'
export type { UseAgentFormActionsProps } from './useAgentFormActions'
export type { UseUnsavedChangesWarningProps } from './useUnsavedChangesWarning'
