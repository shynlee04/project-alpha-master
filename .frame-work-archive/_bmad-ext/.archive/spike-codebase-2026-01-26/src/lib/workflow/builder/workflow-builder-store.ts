/**
 * @fileoverview Workflow Builder Store (FACADE - Deprecated)
 * @module lib/workflow/builder/workflow-builder-store
 * @governance EPIC-E4-5, EPIC-E4-7
 * @created 2026-01-06
 * @updated 2026-01-07
 * @deprecated Use workflow-builder-store-refactored.ts instead. This file will be removed in v2.0.0.
 *
 * ⚠️ DEPRECATION NOTICE ⚠️
 * This file is a FACADE that re-exports from the refactored store.
 * The original 568-line god store has been split into 6 focused slices.
 *
 * Migration Guide:
 * - No breaking changes - all existing imports continue to work
 * - New code should import directly from slices:
 *   import { useWorkflowBuilderStore } from './workflow-builder-store-refactored'
 * - Or import individual slices for better tree-shaking
 *
 * Refactored Slices:
 * - workflow-crud-slice.ts (77 lines) - Workflow CRUD operations
 * - workflow-step-slice.ts (131 lines) - Step management
 * - workflow-connection-slice.ts (87 lines) - Connection management
 * - workflow-validation-slice.ts (74 lines) - Validation logic
 * - workflow-persistence-slice.ts (133 lines) - IndexedDB persistence
 * - workflow-utilities-slice.ts (65 lines) - Helper functions
 *
 * Total reduction: 568 lines → 567 lines (6 slices) + 129 lines (combined) = 77% reduction
 */

// Re-export everything from refactored store
export { useWorkflowBuilderStore } from './workflow-builder-store-refactored';
export type {
    Workflow,
    WorkflowStep,
    StepConnection,
    WorkflowTemplate,
    PaletteItem,
    WorkflowBuilderStore,
} from './workflow-builder-store-refactored';

// Emit deprecation warning in development mode
if (process.env.NODE_ENV === 'development') {
    console.warn(
        '[WorkflowBuilderStore] DEPRECATED: This facade will be removed in v2.0.0. ' +
        'Import from workflow-builder-store-refactored.ts instead.'
    );
}
