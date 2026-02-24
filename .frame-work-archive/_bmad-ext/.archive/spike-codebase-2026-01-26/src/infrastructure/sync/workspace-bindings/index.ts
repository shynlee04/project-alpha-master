/**
 * @fileoverview Workspace Bindings Barrel Export
 * @module infrastructure/sync/workspace-bindings
 *
 * Exports all workspace-specific sync bindings.
 */

export { BaseWorkspaceBinding } from './base';
export type { WorkspaceBindingConfig } from './base';

export { IDEWorkspaceBinding, createIDEWorkspaceBinding } from './ide';
export { NotesWorkspaceBinding, createNotesWorkspaceBinding } from './notes';
export { KnowledgeWorkspaceBinding, createKnowledgeWorkspaceBinding } from './knowledge';
export { StudyWorkspaceBinding, createStudyWorkspaceBinding } from './study';
