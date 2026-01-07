/**
 * Re-export of Agent entity from domain layer
 * Provides backwards compatibility for @/core/entities/Agent imports
 */
export * from '../../domain/entities/agent';
export * from '../../domain/value-objects/workspace-binding';
export * from '../../domain/value-objects/tool-permission';

// Re-export types commonly used throughout the codebase
export type { AgentProps, Agent } from '../../domain/entities/agent';
export type { WorkspaceBinding } from '../../domain/value-objects/workspace-binding';
export type { AgentToolBinding } from '../../domain/value-objects/tool-permission';
export type { WorkspaceType } from '../../domain/value-objects/workspace-type';

// Additional types for backward compatibility
export interface AgentCreateParams extends Omit<AgentProps, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
}

export interface AgentUpdateParams {
  name?: string;
  providerId?: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  workspaceBindings?: WorkspaceBinding[];
  tools?: AgentToolBinding[];
}
