/**
 * Common Components Barrel Export
 * @module components/common
 *
 * Exports all common components for easy importing.
 */

export { ErrorBoundary, WithErrorBoundary } from './ErrorBoundary'
export { WorkspaceSwitcher } from './WorkspaceSwitcher'
export type { WorkspaceSwitcherProps } from './WorkspaceSwitcher'
export { UnsavedChangesDialog } from './UnsavedChangesDialog'
export type { UnsavedChangesDialogProps } from './UnsavedChangesDialog'
export { useUnsavedChangesWarning } from './hooks/useUnsavedChangesWarning'
export type { UnsavedChangesConfig } from './hooks/useUnsavedChangesWarning'
