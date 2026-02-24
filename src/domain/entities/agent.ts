/**
 * @fileoverview Agent Entity
 * @module domain/entities/agent
 * @governance Architectural Specification v3.0
 *
 * Agent entity with business logic for workspace bindings and tool permissions.
 * Implements business rules for agent availability and tool execution.
 */

import type { WorkspaceBinding, WorkspaceBindingProps } from '../value-objects/workspace-binding';
import { AgentToolBinding, AgentToolBindingProps } from '../value-objects/tool-permission';
import type { PluginType } from '@/domain/schemas/plugin.schema';

// Re-export for backward compatibility
export type { WorkspacePermissions } from '../value-objects/tool-permission';

/**
 * @deprecated Use PluginType from @/domain/schemas/plugin.schema
 */
export type WorkspaceType = PluginType;

// Re-export from workspace-binding for backward compatibility
export type { WorkspaceBinding, WorkspaceBindingProps };

/**
 * Agent status type
 */
export type AgentStatus = 'online' | 'offline' | 'busy' | 'error';

/**
 * Helper type for workspace bindings (can be class instance or plain object)
 */
export type WorkspaceBindingInput = WorkspaceBinding | WorkspaceBindingProps;

/**
 * Helper type for tool bindings (can be class instance or plain object)
 */
export type AgentToolBindingInput = AgentToolBinding | AgentToolBindingProps;

/**
 * Agent entity properties - accepts both class instances and plain objects
 * Extended with all properties used by the agent stores
 */
export interface AgentProps {
  // Core identity
  id: string;
  name: string;
  description?: string;
  providerId: string;
  model: string;
  modelId?: string; // Alias for model (used by stores)
  systemPrompt: string;
  topP?: number;
  topK?: number;
  temperature?: number;
  maxTokens?: number;

  // Workspace configuration
  workspaceBindings: WorkspaceBindingInput[];
  tools: AgentToolBindingInput[];

  // State tracking
  status?: AgentStatus;
  tasksCompleted?: number;
  successRate?: number;
  tokensUsed?: number;
  lastActive?: string;

  // Timestamps
  createdAt: number;
  updatedAt: number;
}

/**
 * Agent Entity
 *
 * Business Rules:
 * - Agent must have at least one workspace binding
 * - Agent must have at least one enabled tool
 * - Agent cannot be deleted if active in any conversation
 *
 * NOTE: This class accepts both class instances and plain objects for
 * workspaceBindings and tools. Plain objects are automatically converted
 * to class instances in the constructor.
 *
 * @example
 * ```ts
 * // With class instances
 * const agent = new Agent({
 *   id: 'agent-1',
 *   name: 'Code Assistant',
 *   providerId: 'anthropic',
 *   model: 'claude-sonnet-4-5',
 *   systemPrompt: 'You are a helpful coding assistant.',
 *   workspaceBindings: [
 *     new WorkspaceBinding({ workspaceType: 'ide', isAvailable: true, uiVariant: 'full', isDefault: true })
 *   ],
 *   tools: [
 *     new AgentToolBinding({ toolId: 'read_file', toolName: 'Read File', isEnabled: true, workspacePermissions: { ide: true } })
 *   ],
 *   createdAt: Date.now(),
 *   updatedAt: Date.now()
 * });
 *
 * // With plain objects (automatically converted to class instances)
 * const agent = new Agent({
 *   id: 'agent-1',
 *   name: 'Code Assistant',
 *   providerId: 'anthropic',
 *   model: 'claude-sonnet-4-5',
 *   systemPrompt: 'You are a helpful coding assistant.',
 *   workspaceBindings: [
 *     { workspaceType: 'ide', isAvailable: true, uiVariant: 'full', isDefault: true }
 *   ],
 *   tools: [
 *     { toolId: 'read_file', toolName: 'Read File', isEnabled: true, workspacePermissions: { ide: true } }
 *   ],
 *   createdAt: Date.now(),
 *   updatedAt: Date.now()
 * });
 * ```
 */
export class Agent {
  // Core identity
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly providerId: string;
  readonly model: string;
  readonly modelId?: string;
  readonly systemPrompt: string;
  readonly topP: number;
  readonly topK?: number;
  readonly temperature: number;
  readonly maxTokens: number;

  // Workspace configuration
  readonly workspaceBindings: WorkspaceBinding[];
  readonly tools: AgentToolBinding[];

  // State tracking
  readonly status?: AgentStatus;
  readonly tasksCompleted: number;
  readonly successRate: number;
  readonly tokensUsed: number;
  readonly lastActive?: string;

  // Timestamps
  readonly createdAt: number;
  readonly updatedAt: number;

  constructor(props: AgentProps) {
    // WorkspaceBinding is a plain object (type alias), no conversion needed
    // Just ensure we have an array
    const workspaceBindings = [...props.workspaceBindings] as WorkspaceBinding[];
    const tools = props.tools.map((tool) =>
      tool instanceof AgentToolBinding ? tool : new AgentToolBinding(tool)
    );

    // Create validated props with converted instances
    const validatedProps: AgentProps = {
      ...props,
      workspaceBindings,
      tools,
    };

    this.validateAgentProps(validatedProps);

    // Core identity
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.providerId = props.providerId;
    this.model = props.model;
    this.modelId = props.modelId ?? props.model;
    this.systemPrompt = props.systemPrompt;
    this.topP = props.topP ?? 1.0;
    this.topK = props.topK;
    this.temperature = props.temperature ?? 0.7;
    this.maxTokens = props.maxTokens ?? 4096;

    // Workspace configuration
    this.workspaceBindings = workspaceBindings;
    this.tools = tools;

    // State tracking
    this.status = props.status;
    this.tasksCompleted = props.tasksCompleted ?? 0;
    this.successRate = props.successRate ?? 0;
    this.tokensUsed = props.tokensUsed ?? 0;
    this.lastActive = props.lastActive;

    // Timestamps
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Validate agent properties against business rules
   */
  private validateAgentProps(props: AgentProps): void {
    // Business rule: Agent must have at least one workspace binding
    if (!props.workspaceBindings || props.workspaceBindings.length === 0) {
      throw new Error('Agent must have at least one workspace binding');
    }

    // Business rule: Agent must have at least one tool
    if (!props.tools || props.tools.length === 0) {
      throw new Error('Agent must have at least one tool');
    }

    // Business rule: Agent must have at least one enabled tool
    const hasEnabledTools = props.tools.some(t => t.isEnabled);
    if (!hasEnabledTools) {
      throw new Error('Agent must have at least one enabled tool');
    }

    // Business rule: At least one workspace must be available
    const hasAvailableWorkspace = props.workspaceBindings.some(b => b.isAvailable);
    if (!hasAvailableWorkspace) {
      throw new Error('Agent must be available in at least one workspace');
    }
  }

  /**
   * Check if agent is available in workspace
   *
   * @param workspaceType - Target workspace type (PluginType)
   * @returns True if agent is available in workspace
   */
  isAvailableIn(workspaceType: WorkspaceType): boolean {
    const binding = this.workspaceBindings.find(b => b.pluginType === workspaceType);
    return binding?.isAvailable ?? false;
  }

  /**
   * Get UI variant for workspace
   *
   * @param workspaceType - Target workspace type
   * @returns UI variant ('full' | 'compact' | 'minimal')
   * @deprecated uiVariant is no longer part of WorkspaceBinding - always returns 'full'
   */
  getUIVariant(_workspaceType: WorkspaceType): 'full' | 'compact' | 'minimal' {
    // uiVariant was removed from the schema, defaulting to 'full'
    return 'full';
  }

  /**
   * Check if agent is default for workspace
   *
   * @param workspaceType - Target workspace type
   * @returns True if agent is marked as default for workspace
   */
  isDefaultFor(workspaceType: WorkspaceType): boolean {
    const binding = this.workspaceBindings.find(b => b.pluginType === workspaceType);
    return binding?.isDefault ?? false;
  }

  /**
   * Check if tool is enabled and permitted in workspace
   *
   * @param toolId - Tool identifier
   * @param workspaceType - Target workspace type
   * @returns True if tool can be executed in workspace
   */
  canExecuteTool(toolId: string, workspaceType: WorkspaceType): boolean {
    const tool = this.tools.find(t => t.toolId === toolId);

    if (!tool || !tool.isEnabled) {
      return false;
    }

    return tool.workspacePermissions[workspaceType] ?? false;
  }

  /**
   * Get enabled tools for workspace
   *
   * @param workspaceType - Target workspace type
   * @returns List of tools available in workspace
   */
  getEnabledToolsFor(workspaceType: WorkspaceType): AgentToolBinding[] {
    return this.tools.filter(tool =>
      tool.isEnabled &&
      (tool.workspacePermissions[workspaceType] ?? false)
    );
  }

  /**
   * Update agent configuration
   *
   * @param updates - Partial agent properties to update
   * @returns New agent instance with updates applied
   */
  withUpdates(updates: Partial<AgentProps>): Agent {
    return new Agent({
      id: this.id,
      name: updates.name ?? this.name,
      description: updates.description ?? this.description,
      providerId: updates.providerId ?? this.providerId,
      model: updates.model ?? this.model,
      modelId: updates.modelId ?? this.modelId,
      systemPrompt: updates.systemPrompt ?? this.systemPrompt,
      topP: updates.topP ?? this.topP,
      topK: updates.topK ?? this.topK,
      temperature: updates.temperature ?? this.temperature,
      maxTokens: updates.maxTokens ?? this.maxTokens,
      workspaceBindings: updates.workspaceBindings ?? this.workspaceBindings,
      tools: updates.tools ?? this.tools,
      status: updates.status ?? this.status,
      tasksCompleted: updates.tasksCompleted ?? this.tasksCompleted,
      successRate: updates.successRate ?? this.successRate,
      tokensUsed: updates.tokensUsed ?? this.tokensUsed,
      lastActive: updates.lastActive ?? this.lastActive,
      createdAt: this.createdAt,
      updatedAt: Date.now()
    });
  }

  /**
   * Check if agent can be deleted
   *
   * @param activeConversationCount - Number of active conversations using this agent
   * @returns True if agent can be safely deleted
   */
  canBeDeleted(activeConversationCount: number): boolean {
    return activeConversationCount === 0;
  }
}
