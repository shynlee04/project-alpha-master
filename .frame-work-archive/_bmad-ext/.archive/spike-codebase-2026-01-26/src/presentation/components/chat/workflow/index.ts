/**
 * @fileoverview Workflow Builder Components - Barrel Export
 * @module presentation/components/chat/workflow
 * @governance EPIC-E4-5
 * @created 2026-01-07
 *
 * Refactored WorkflowBuilder split into focused components.
 */

// Main components
export { WorkflowPalette } from './WorkflowPalette';
export { WorkflowCanvas } from './WorkflowCanvas';
export { WorkflowToolbar } from './WorkflowToolbar';
export { WorkflowStepEditor } from './WorkflowStepEditor';
export { WorkflowTemplates } from './WorkflowTemplates';

// Hooks
export { useWorkflowDragDrop } from './useWorkflowDragDrop';
