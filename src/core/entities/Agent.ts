/**
 * Re-export of Agent entity from domain layer
 * Provides backwards compatibility for @/core/entities/Agent imports
 *
 * Exports both the domain classes AND plain types for Zustand stores.
 */

// Import everything first for internal use
import { Agent as AgentClass, type AgentProps, type AgentStatus } from '../../domain/entities/agent';
import type { WorkspaceBinding, WorkspaceBindingProps } from '../../domain/value-objects/workspace-binding';
import type { PluginType } from '@/domain/schemas/plugin.schema';
import { AgentToolBinding as AgentToolBindingClass, type AgentToolBindingProps, type WorkspacePermissions } from '../../domain/value-objects/tool-permission';

// Re-export for consumers
export { AgentClass as Agent };
export type { AgentProps, AgentStatus };
// WorkspaceBinding is a type alias, not a class - re-export as type
export type { WorkspaceBinding, WorkspaceBindingProps };
/** @deprecated Use PluginType from @/domain/schemas/plugin.schema */
export type WorkspaceType = PluginType;
export { AgentToolBindingClass as AgentToolBinding };
export type { AgentToolBindingProps, WorkspacePermissions };

// NOTE: AgentData type has been consolidated to
// src/infrastructure/persistence/stores/agents/types.ts
// Import from there for type-safe store operations
