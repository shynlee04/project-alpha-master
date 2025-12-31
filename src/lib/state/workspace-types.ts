/**
 * @fileoverview Workspace Type Definitions
 * @module lib/state/workspace-types
 *
 * Centralized workspace type definitions for type safety.
 */

/**
 * Supported workspace types
 */
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';

/**
 * Workspace metadata
 */
export interface WorkspaceMetadata {
  type: WorkspaceType;
  label: string;
  icon: string;
  description: string;
  uiVariant: 'full' | 'compact' | 'minimal';
  color: string;
}

/**
 * Workspace definitions
 */
export const WORKSPACES: Record<WorkspaceType, WorkspaceMetadata> = {
  ide: {
    type: 'ide',
    label: 'IDE',
    icon: '💻',
    description: 'Integrated Development Environment',
    uiVariant: 'full',
    color: '#3b82f6',
  },
  knowledge: {
    type: 'knowledge',
    label: 'Knowledge',
    icon: '📚',
    description: 'Knowledge base and RAG',
    uiVariant: 'compact',
    color: '#8b5cf6',
  },
  study: {
    type: 'study',
    label: 'Study',
    icon: '📖',
    description: 'Study space and flashcards',
    uiVariant: 'compact',
    color: '#f59e0b',
  },
  notes: {
    type: 'notes',
    label: 'Notes',
    icon: '📝',
    description: 'Note-taking workspace',
    uiVariant: 'minimal',
    color: '#10b981',
  },
};

/**
 * Workspace transition event
 */
export interface WorkspaceTransitionEvent {
  from: WorkspaceType;
  to: WorkspaceType;
  timestamp: string;
  projectId: string | null;
}
