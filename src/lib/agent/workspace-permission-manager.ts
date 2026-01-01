/**
 * @fileoverview Workspace-Aware Permission Manager
 * @module lib/agent/workspace-permission-manager
 *
 * Extends ToolPermissionManager with workspace-specific permission checking.
 * Integrates with AgentToolBinding.workspacePermissions to enforce
 * per-workspace tool access control.
 *
 * @epic WB-8 - Cross-Workspace Event System
 * @story WB-8.3 - Agent Configuration Sync
 * @constitution P0 - Security & Workspace Boundaries
 *
 * December 2025 Patterns:
 * - Compose over inherit (extends ToolPermissionManager functionality)
 * - Single responsibility (workspace permission logic only)
 * - Type-safe workspace checking
 */

import type { AgentToolBinding, WorkspaceBinding } from '@/core/entities/Agent';
import type { ToolPermissionManager, PermissionCheckResult } from './tool-permission-manager';

/**
 * Supported workspace types
 */
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';

/**
 * Workspace permission check result
 */
export interface WorkspacePermissionCheckResult extends PermissionCheckResult {
  /** Workspace where check was performed */
  workspaceType: WorkspaceType;
  /** Whether tool is enabled for this workspace */
  enabledInWorkspace: boolean;
  /** Whether agent is available in this workspace */
  agentAvailableInWorkspace: boolean;
}

/**
 * Tool availability in a workspace
 */
export interface ToolAvailability {
  toolId: string;
  toolName: string;
  enabled: boolean;
  hasPermission: boolean;
  needsApproval: boolean;
}

/**
 * Workspace-Aware Permission Manager
 *
 * Adds workspace-specific permission checking on top of the base
 * ToolPermissionManager. Enforces AgentToolBinding.workspacePermissions
 * and Agent.workspaceBindings.
 *
 * Architecture:
 * - Composes ToolPermissionManager (not extends - composition over inheritance)
 * - Checks workspace permissions BEFORE trust level checks
 * - Provides filtered tool lists per workspace
 */
export class WorkspacePermissionManager {
  constructor(private readonly basePermissionManager: ToolPermissionManager) {}

  /**
   * Check if a tool can execute in the current workspace
   *
   * Checks in order:
   * 1. Agent is available in workspace (workspaceBindings)
   * 2. Tool is enabled for workspace (workspacePermissions)
   * 3. Tool has trust level permission (base permission manager)
   *
   * @param toolId - Tool identifier
   * @param agentTools - Agent's tool bindings configuration
   * @param agentBindings - Agent's workspace bindings
   * @param currentWorkspace - Current workspace type
   * @returns Workspace-aware permission check result
   */
  public checkWorkspacePermission(
    toolId: string,
    agentTools: AgentToolBinding[],
    agentBindings: WorkspaceBinding[],
    currentWorkspace: WorkspaceType
  ): WorkspacePermissionCheckResult {
    // Step 1: Check agent availability in workspace
    const agentBinding = agentBindings.find(
      binding => binding.workspaceType === currentWorkspace
    );

    const agentAvailable = agentBinding?.isAvailable ?? false;

    if (!agentAvailable) {
      return {
        needsApproval: false,
        canExecute: false,
        reason: 'block',
        toolName: this.getToolDisplayName(toolId),
        toolId,
        workspaceType: currentWorkspace,
        enabledInWorkspace: false,
        agentAvailableInWorkspace: false,
      };
    }

    // Step 2: Check tool workspace permissions
    const toolBinding = agentTools.find(tool => tool.toolId === toolId);

    if (!toolBinding) {
      // Tool not in agent's tool list
      return {
        needsApproval: false,
        canExecute: false,
        reason: 'block',
        toolName: this.getToolDisplayName(toolId),
        toolId,
        workspaceType: currentWorkspace,
        enabledInWorkspace: false,
        agentAvailableInWorkspace: true,
      };
    }

    const enabledInWorkspace = toolBinding.workspacePermissions[currentWorkspace] ?? false;

    if (!enabledInWorkspace || !toolBinding.isEnabled) {
      return {
        needsApproval: false,
        canExecute: false,
        reason: 'block',
        toolName: toolBinding.toolName,
        toolId,
        workspaceType: currentWorkspace,
        enabledInWorkspace: false,
        agentAvailableInWorkspace: true,
      };
    }

    // Step 3: Check base permission manager (trust levels)
    // Ralph Loop 51-3: Pass workspace context for workspace-scoped permission check
    const baseResult = this.basePermissionManager.checkPermission(toolId, currentWorkspace);

    return {
      ...baseResult,
      workspaceType: currentWorkspace,
      enabledInWorkspace: true,
      agentAvailableInWorkspace: true,
    };
  }

  /**
   * Get all tools available for a specific workspace
   *
   * Returns tools that are:
   * - Enabled for the workspace (workspacePermissions[workspace] = true)
   * - Agent is available in workspace (workspaceBindings.isAvailable = true)
   * - Pass base permission checks (not blocked by trust level)
   *
   * @param agentTools - Agent's tool bindings
   * @param agentBindings - Agent's workspace bindings
   * @param workspace - Target workspace type
   * @returns Array of available tools with metadata
   */
  public getToolsForWorkspace(
    agentTools: AgentToolBinding[],
    agentBindings: WorkspaceBinding[],
    workspace: WorkspaceType
  ): ToolAvailability[] {
    const available: ToolAvailability[] = [];

    // Check agent availability first (early exit if not available)
    const agentBinding = agentBindings.find(binding => binding.workspaceType === workspace);

    if (!agentBinding?.isAvailable) {
      // Agent not available in this workspace - return empty array
      return available;
    }

    for (const tool of agentTools) {
      // Skip if tool is globally disabled
      if (!tool.isEnabled) {
        continue;
      }

      // Check workspace permission
      const enabled = tool.workspacePermissions[workspace] ?? false;

      if (!enabled) {
        continue;
      }

      // Check base permission (not blocked)
      // Ralph Loop 51-3: Pass workspace context for workspace-scoped permission check
      const baseCheck = this.basePermissionManager.checkPermission(tool.toolId, workspace);

      if (!baseCheck.canExecute) {
        continue;
      }

      available.push({
        toolId: tool.toolId,
        toolName: tool.toolName,
        enabled: true,
        hasPermission: true,
        needsApproval: baseCheck.needsApproval,
      });
    }

    return available;
  }

  /**
   * Check if agent is available in a workspace
   */
  public isAgentAvailableInWorkspace(
    agentBindings: WorkspaceBinding[],
    workspace: WorkspaceType
  ): boolean {
    const binding = agentBindings.find(b => b.workspaceType === workspace);
    return binding?.isAvailable ?? false;
  }

  /**
   * Get workspace UI variant for agent
   */
  public getWorkspaceUIVariant(
    agentBindings: WorkspaceBinding[],
    workspace: WorkspaceType
  ): 'full' | 'compact' | 'minimal' {
    const binding = agentBindings.find(b => b.workspaceType === workspace);
    return binding?.uiVariant ?? 'compact';
  }

  /**
   * Filter tools by workspace for agent configuration
   *
   * Returns three categories:
   * - enabled: Tools enabled for this workspace
   * - disabled: Tools disabled for this workspace (but enabled in others)
   * - unavailable: Tools not available at all (agent doesn't have them)
   */
  public categorizeToolsByWorkspace(
    agentTools: AgentToolBinding[],
    workspace: WorkspaceType
  ): {
    enabled: AgentToolBinding[];
    disabled: AgentToolBinding[];
  } {
    const enabled: AgentToolBinding[] = [];
    const disabled: AgentToolBinding[] = [];

    for (const tool of agentTools) {
      const hasPermission = tool.workspacePermissions[workspace] ?? false;

      if (hasPermission && tool.isEnabled) {
        enabled.push(tool);
      } else {
        disabled.push(tool);
      }
    }

    return { enabled, disabled };
  }

  /**
   * Validate workspace permissions are properly configured
   *
   * Ensures all 4 workspace types are present in workspacePermissions
   */
  public validateWorkspacePermissions(
    toolBinding: AgentToolBinding
  ): {
    valid: boolean;
    missing: WorkspaceType[];
    errors: string[];
  } {
    const required: WorkspaceType[] = ['ide', 'knowledge', 'study', 'notes'];
    const missing: WorkspaceType[] = [];
    const errors: string[] = [];

    for (const workspace of required) {
      if (!(workspace in toolBinding.workspacePermissions)) {
        missing.push(workspace);
        errors.push(
          `Tool "${toolBinding.toolId}" missing workspace permission for "${workspace}"`
        );
      }
    }

    return {
      valid: missing.length === 0,
      missing,
      errors,
    };
  }

  /**
   * Get tool display name
   */
  private getToolDisplayName(toolId: string): string {
    const displayNames: Record<string, string> = {
      read_file: 'Read File',
      write_file: 'Write File',
      list_files: 'List Files',
      delete_file: 'Delete File',
      execute_command: 'Execute Command',
      create_directory: 'Create Directory',
      read_directory: 'Read Directory',
    };
    return displayNames[toolId] ?? toolId.replace(/_/g, ' ');
  }

  /**
   * Get underlying base permission manager
   */
  public getBaseManager(): ToolPermissionManager {
    return this.basePermissionManager;
  }
}
