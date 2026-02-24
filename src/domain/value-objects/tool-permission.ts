/**
 * @fileoverview Tool Permission Value Object
 * @module domain/value-objects/tool-permission
 * @governance Architectural Specification v3.0
 *
 * Immutable value object representing agent tool configuration with workspace permissions.
 */

import type { PluginType } from '@/domain/schemas/plugin.schema';

/**
 * @deprecated Use PluginType from @/domain/schemas/plugin.schema
 */
export type WorkspaceType = PluginType;

/**
 * Workspace permissions mapping - uses PluginType as keys for indexing compatibility
 */
export type WorkspacePermissions = Partial<Record<PluginType, boolean>>;

/**
 * Agent tool binding properties
 */
export interface AgentToolBindingProps {
  toolId: string;
  toolName: string;
  isEnabled: boolean;
  workspacePermissions: WorkspacePermissions;
}

/**
 * Agent Tool Binding Value Object
 *
 * Represents agent tool configuration with workspace-specific permissions.
 * This value object is immutable - use `with*` methods to create updated instances.
 *
 * @example
 * ```ts
 * const toolBinding = new AgentToolBinding({
 *   toolId: 'read_file',
 *   toolName: 'Read File',
 *   isEnabled: true,
 *   workspacePermissions: {
 *     editor: true,
 *     knowledge: true,
 *     study: false,
 *     notes: false
 *   }
 * });
 *
 * // Update permissions for specific workspace
 * const updated = toolBinding.withWorkspacePermission('study', true);
 * ```
 */
export class AgentToolBinding {
  readonly toolId: string;
  readonly toolName: string;
  readonly isEnabled: boolean;
  readonly workspacePermissions: WorkspacePermissions;

  constructor(props: AgentToolBindingProps) {
    this.toolId = props.toolId;
    this.toolName = props.toolName;
    this.isEnabled = props.isEnabled;
    this.workspacePermissions = props.workspacePermissions;

    // Make instance immutable
    Object.freeze(this);
    Object.freeze(this.workspacePermissions);
  }

  /**
   * Check if tool is permitted in workspace
   *
   * @param workspaceType - Target workspace type
   * @returns True if tool has permission in workspace
   */
  isPermittedIn(workspaceType: PluginType): boolean {
    return this.workspacePermissions[workspaceType] ?? false;
  }

  /**
   * Create new binding with updated enabled status
   *
   * @param isEnabled - New enabled status
   * @returns New AgentToolBinding instance
   */
  withEnabled(isEnabled: boolean): AgentToolBinding {
    return new AgentToolBinding({
      ...this,
      isEnabled
    });
  }

  /**
   * Create new binding with updated workspace permission
   *
   * @param workspaceType - Target workspace type
   * @param permitted - New permission status
   * @returns New AgentToolBinding instance
   */
  withWorkspacePermission(
    workspaceType: PluginType,
    permitted: boolean
  ): AgentToolBinding {
    return new AgentToolBinding({
      ...this,
      workspacePermissions: {
        ...this.workspacePermissions,
        [workspaceType]: permitted
      }
    });
  }

  /**
   * Create new binding with all workspace permissions set
   *
   * @param permissions - New workspace permissions
   * @returns New AgentToolBinding instance
   */
  withWorkspacePermissions(permissions: WorkspacePermissions): AgentToolBinding {
    return new AgentToolBinding({
      ...this,
      workspacePermissions: { ...permissions }
    });
  }

  /**
   * Check equality with another tool binding
   *
   * @param other - Another tool binding
   * @returns True if bindings are equal
   */
  equals(other: AgentToolBinding): boolean {
    return (
      this.toolId === other.toolId &&
      this.isEnabled === other.isEnabled &&
      JSON.stringify(this.workspacePermissions) ===
      JSON.stringify(other.workspacePermissions)
    );
  }

  /**
   * Convert to plain object
   *
   * @returns Plain object representation
   */
  toJSON(): AgentToolBindingProps {
    return {
      toolId: this.toolId,
      toolName: this.toolName,
      isEnabled: this.isEnabled,
      workspacePermissions: { ...this.workspacePermissions }
    };
  }

  /**
   * Create from plain object
   *
   * @param props - Plain object properties
   * @returns New AgentToolBinding instance
   */
  static fromJSON(props: AgentToolBindingProps): AgentToolBinding {
    return new AgentToolBinding(props);
  }

  /**
   * Create default workspace permissions (all enabled)
   *
   * @returns Default workspace permissions
   */
  static defaultPermissions(): WorkspacePermissions {
    return {
      editor: true,
      notes: true,
      chat: true,
      terminal: true,
      preview: true,
      knowledge: true,
      study: true
    };
  }

  /**
   * Create disabled workspace permissions (all disabled)
   *
   * @returns Disabled workspace permissions
   */
  static disabledPermissions(): WorkspacePermissions {
    return {
      editor: false,
      notes: false,
      chat: false,
      terminal: false,
      preview: false,
      knowledge: false,
      study: false
    };
  }
}
