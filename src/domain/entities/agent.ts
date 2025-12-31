/**
 * @fileoverview Agent Entity
 * @module domain/entities/agent
 * @governance Architectural Specification v3.0
 *
 * Agent entity with business logic for workspace bindings and tool permissions.
 * Implements business rules for agent availability and tool execution.
 */

import { WorkspaceBinding } from '../value-objects/workspace-binding';
import { AgentToolBinding } from '../value-objects/tool-permission';
import { WorkspaceType } from '../value-objects/workspace-type';

/**
 * Agent entity properties
 */
export interface AgentProps {
  id: string;
  name: string;
  providerId: string;
  model: string;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
  workspaceBindings: WorkspaceBinding[];
  tools: AgentToolBinding[];
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
 * @example
 * ```ts
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
 * ```
 */
export class Agent {
  readonly id: string;
  readonly name: string;
  readonly providerId: string;
  readonly model: string;
  readonly systemPrompt: string;
  readonly temperature: number;
  readonly maxTokens: number;
  readonly workspaceBindings: WorkspaceBinding[];
  readonly tools: AgentToolBinding[];
  readonly createdAt: number;
  readonly updatedAt: number;

  constructor(props: AgentProps) {
    this.validateAgentProps(props);
    this.id = props.id;
    this.name = props.name;
    this.providerId = props.providerId;
    this.model = props.model;
    this.systemPrompt = props.systemPrompt;
    this.temperature = props.temperature ?? 0.7;
    this.maxTokens = props.maxTokens ?? 4096;
    this.workspaceBindings = props.workspaceBindings;
    this.tools = props.tools;
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
   * @param workspaceType - Target workspace type
   * @returns True if agent is available in workspace
   */
  isAvailableIn(workspaceType: WorkspaceType): boolean {
    const binding = this.workspaceBindings.find(b => b.workspaceType === workspaceType);
    return binding?.isAvailable ?? false;
  }

  /**
   * Get UI variant for workspace
   *
   * @param workspaceType - Target workspace type
   * @returns UI variant ('full' | 'compact' | 'minimal')
   */
  getUIVariant(workspaceType: WorkspaceType): 'full' | 'compact' | 'minimal' {
    const binding = this.workspaceBindings.find(b => b.workspaceType === workspaceType);
    return binding?.uiVariant ?? 'minimal';
  }

  /**
   * Check if agent is default for workspace
   *
   * @param workspaceType - Target workspace type
   * @returns True if agent is marked as default for workspace
   */
  isDefaultFor(workspaceType: WorkspaceType): boolean {
    const binding = this.workspaceBindings.find(b => b.workspaceType === workspaceType);
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
      providerId: updates.providerId ?? this.providerId,
      model: updates.model ?? this.model,
      systemPrompt: updates.systemPrompt ?? this.systemPrompt,
      temperature: updates.temperature ?? this.temperature,
      maxTokens: updates.maxTokens ?? this.maxTokens,
      workspaceBindings: updates.workspaceBindings ?? this.workspaceBindings,
      tools: updates.tools ?? this.tools,
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
