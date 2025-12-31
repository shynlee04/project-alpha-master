/**
 * @fileoverview Workspace-Aware Tool Filter
 * @module lib/agent/workspace-tool-filter
 *
 * Filters agent tools based on current workspace context.
 * Wraps TanStack AI tools with workspace permission checks.
 *
 * @epic WB-8 - Cross-Workspace Event System
 * @story WB-8.3 - Agent Configuration Sync
 * @constitution P0 - Security & Workspace Boundaries
 *
 * December 2025 Patterns:
 * - Declarative tool filtering
 * - Type-safe tool composition
 * - Minimal runtime overhead
 */

import type { AgentToolBinding, Agent } from '@/core/entities/Agent';
import type { WorkspacePermissionManager } from './workspace-permission-manager';
import type { Tool } from '@tanstack/ai';
import { createBlockedToolResult } from './tools/permission-check';

/**
 * Workspace context for tool execution
 */
export interface WorkspaceContext {
  /** Current workspace type */
  workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
  /** Current project path (for IDE workspace) */
  projectPath?: string;
  /** Whether workspace is ready (FS access granted) */
  workspaceReady: boolean;
}

/**
 * Tool filtering result
 */
export interface FilteredTools {
  /** Tools available in current workspace */
  available: Tool[];
  /** Tools blocked by workspace permissions */
  blocked: {
    toolId: string;
    reason: string;
  }[];
  /** Tools that require approval */
  needsApproval: string[];
}

/**
 * Create a workspace-aware tool filter
 *
 * Filters agent tools based on:
 * 1. Agent availability in workspace (workspaceBindings)
 * 2. Tool workspace permissions (workspacePermissions)
 * 3. Base permission manager (trust levels)
 *
 * @param agent - Agent configuration
 * @param currentWorkspace - Current workspace type
 * @param permissionManager - Workspace permission manager
 * @returns Filtered tools for current workspace
 */
export function filterToolsForWorkspace(
  agent: Agent,
  currentWorkspace: WorkspaceContext,
  permissionManager: WorkspacePermissionManager
): FilteredTools {
  const available: Tool[] = [];
  const blocked: { toolId: string; reason: string }[] = [];
  const needsApproval: string[] = [];

  // Check agent availability in workspace
  const agentAvailable = permissionManager.isAgentAvailableInWorkspace(
    agent.workspaceBindings,
    currentWorkspace.workspaceType
  );

  if (!agentAvailable) {
    // Agent not available - block all tools
    for (const tool of agent.tools) {
      blocked.push({
        toolId: tool.toolId,
        reason: `Agent "${agent.name}" is not available in ${currentWorkspace.workspaceType} workspace`,
      });
    }

    return { available, blocked, needsApproval };
  }

  // Filter tools by workspace permissions
  const { enabled } = permissionManager.categorizeToolsByWorkspace(
    agent.tools,
    currentWorkspace.workspaceType
  );

  for (const toolBinding of enabled) {
    // Check workspace permission
    const check = permissionManager.checkWorkspacePermission(
      toolBinding.toolId,
      agent.tools,
      agent.workspaceBindings,
      currentWorkspace.workspaceType
    );

    if (!check.canExecute) {
      blocked.push({
        toolId: toolBinding.toolId,
        reason: check.reason === 'block'
          ? `Tool "${toolBinding.toolName}" is blocked in ${currentWorkspace.workspaceType} workspace`
          : `Tool not available: ${check.reason}`,
      });
    } else if (check.needsApproval) {
      needsApproval.push(toolBinding.toolId);
    } else {
      // Tool is available - we'll return the tool ID
      // The actual tool object is created by the factory
      // This is just metadata for the UI
    }
  }

  return { available, blocked, needsApproval };
}

/**
 * Create a workspace-aware tool execution wrapper
 *
 * Wraps a tool execution function with workspace permission checks.
 * If tool is not available in workspace, returns blocked result immediately.
 *
 * @param toolId - Tool identifier
 * @param agent - Agent configuration
 * @param workspaceContext - Current workspace context
 * @param permissionManager - Workspace permission manager
 * @param executeTool - Original tool execution function
 * @returns Wrapped tool execution function
 */
export function createWorkspaceAwareToolExecutor<TInput = unknown, TResult = unknown>(
  toolId: string,
  agent: Agent,
  workspaceContext: WorkspaceContext,
  permissionManager: WorkspacePermissionManager,
  executeTool: (input: TInput) => Promise<TResult>
): (input: TInput) => Promise<TResult | ReturnType<typeof createBlockedToolResult>> {
  return async (input: TInput) => {
    // Check workspace permission before execution
    const check = permissionManager.checkWorkspacePermission(
      toolId,
      agent.tools,
      agent.workspaceBindings,
      workspaceContext.workspaceType
    );

    if (!check.canExecute) {
      return createBlockedToolResult(toolId) as TResult;
    }

    // Check workspace is ready (file system access, etc.)
    if (!workspaceContext.workspaceReady) {
      return {
        success: false,
        error: 'Workspace not ready. Please open a folder or grant required permissions.',
        code: 'WORKSPACE_NOT_READY',
        blocked: true,
        toolId,
      } as TResult;
    }

    // Execute tool
    return executeTool(input);
  };
}

/**
 * Validate agent has proper workspace configuration
 *
 * Ensures agent has:
 * - workspaceBindings array with all 4 workspace types
 * - Tools have workspacePermissions for all 4 workspace types
 *
 * @param agent - Agent to validate
 * @returns Validation result with errors
 */
export function validateAgentWorkspaceConfiguration(agent: Agent): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const requiredWorkspaces: Array<'ide' | 'knowledge' | 'study' | 'notes'> =
    ['ide', 'knowledge', 'study', 'notes'];

  // Check workspaceBindings completeness
  const missingWorkspaces = requiredWorkspaces.filter(ws =>
    !agent.workspaceBindings.some(binding => binding.workspaceType === ws)
  );

  if (missingWorkspaces.length > 0) {
    errors.push(
      `Agent "${agent.name}" missing workspace bindings for: ${missingWorkspaces.join(', ')}`
    );
  }

  // Check each tool has workspacePermissions
  for (const tool of agent.tools) {
    const missingPerms = requiredWorkspaces.filter(ws =>
      !(ws in tool.workspacePermissions)
    );

    if (missingPerms.length > 0) {
      warnings.push(
        `Tool "${tool.toolName}" missing workspace permissions for: ${missingPerms.join(', ')}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get default workspace bindings
 *
 * Returns workspace bindings with agent available in IDE workspace only.
 * This is the default for new agents.
 */
export function getDefaultWorkspaceBindings(): Agent['workspaceBindings'] {
  return [
    {
      workspaceType: 'ide',
      isAvailable: true,
      uiVariant: 'full',
      isDefault: true,
    },
    {
      workspaceType: 'knowledge',
      isAvailable: false,
      uiVariant: 'compact',
      isDefault: false,
    },
    {
      workspaceType: 'study',
      isAvailable: false,
      uiVariant: 'compact',
      isDefault: false,
    },
    {
      workspaceType: 'notes',
      isAvailable: false,
      uiVariant: 'compact',
      isDefault: false,
    },
  ];
}

/**
 * Get default workspace permissions for a tool
 *
 * Returns workspace permissions with tool enabled in IDE workspace only.
 * This is the default for new tools.
 */
export function getDefaultWorkspacePermissions(): AgentToolBinding['workspacePermissions'] {
  return {
    ide: true,
    knowledge: false,
    study: false,
    notes: false,
  };
}
