/**
 * @fileoverview Workspace Execution Context for Agent Tools
 * @module lib/agent/workspace-execution-context
 *
 * Provides workspace and agent context for tool execution.
 * Bridges React components (with hooks) and non-React factory functions.
 *
 * @epic WB-8 - Cross-Workspace Event System
 * @story WB-8.3 - Agent Configuration Sync
 * @constitution P0 - Security & Workspace Boundaries
 *
 * December 2025 Patterns:
 * - Single responsibility (context retrieval only)
 * - Non-React access (uses Zustand stores directly)
 * - Graceful degradation (handles missing state)
 */

import { useWorkspaceStore } from '@/lib/state/workspace-store';
import { useAgentSelectionStore } from '@/infrastructure/persistence/stores/agents/agent-selection-store';
import type { Agent } from '@/core/entities/Agent';
import type { WorkspaceType } from '@/lib/state/workspace-types';

/**
 * Workspace execution context
 *
 * Retrieved from Zustand stores for tool execution permission checks.
 */
export interface WorkspaceExecutionContext {
  /** Current workspace type */
  workspaceType: WorkspaceType;
  /** Current project ID */
  projectId: string | null;
  /** Active agent configuration */
  agent: Agent | null;
  /** Whether agent is available in current workspace */
  agentAvailable: boolean;
}

/**
 * Get workspace execution context for tool permission checks
 *
 * This function is called from tool factory functions (non-React code).
 * It retrieves current state from Zustand stores directly.
 *
 * @returns Workspace execution context
 *
 * @example
 * ```typescript
 * const readFile = readFileDef.client(async (args: unknown) => {
 *   // Get workspace context
 *   const context = getWorkspaceExecutionContext();
 *
 *   // Check workspace permission
 *   const permissionCheck = workspacePermissionManager.checkWorkspacePermission(
 *     'read_file',
 *     context.agent?.tools || [],
 *     context.agent?.workspaceBindings || [],
 *     context.workspaceType
 *   );
 *
 *   if (!permissionCheck.canExecute) {
 *     return {
 *       success: false,
 *       error: `Tool not available in ${context.workspaceType} workspace`,
 *       blocked: true,
 *       code: 'WORKSPACE_PERMISSION_DENIED',
 *     };
 *   }
 *
 *   // Execute tool...
 * });
 * ```
 */
export function getWorkspaceExecutionContext(): WorkspaceExecutionContext {
  // Get current workspace from Zustand store
  const workspaceState = useWorkspaceStore.getState();

  // Get active agent from agent selection store
  const agentSelectionState = useAgentSelectionStore.getState();

  const agent = agentSelectionState.activeAgentId
    ? agentSelectionState.getActiveAgent() || null
    : null;

  const workspaceType: WorkspaceType = workspaceState.currentWorkspace;
  const projectId: string | null = workspaceState.currentProjectId;

  // Check if agent is available in current workspace
  let agentAvailable = false;

  if (agent) {
    const binding = agent.workspaceBindings.find(
      b => b.workspaceType === workspaceType
    );
    agentAvailable = binding?.isAvailable ?? false;
  }

  return {
    workspaceType,
    projectId,
    agent,
    agentAvailable,
  };
}

/**
 * Check if tool execution is allowed in current workspace
 *
 * Convenience function that combines context retrieval and permission checking.
 *
 * @param toolId - Tool identifier
 * @param permissionManager - Workspace permission manager instance
 * @returns Permission check result
 */
export function checkToolWorkspacePermission(
  toolId: string,
  permissionManager: import('./workspace-permission-manager').WorkspacePermissionManager
): import('./workspace-permission-manager').WorkspacePermissionCheckResult {
  // Get workspace context
  const context = getWorkspaceExecutionContext();

  // If no agent, tool is not available
  if (!context.agent) {
    return {
      needsApproval: false,
      canExecute: false,
      reason: 'block',
      toolName: toolId,
      toolId,
      workspace: context.workspaceType,
      workspaceType: context.workspaceType,
      enabledInWorkspace: false,
      agentAvailableInWorkspace: false,
    };
  }

  // Check workspace permission
  return permissionManager.checkWorkspacePermission(
    toolId,
    context.agent.tools,
    context.agent.workspaceBindings,
    context.workspaceType
  );
}

/**
 * Create workspace permission denied error response
 *
 * Standardized error response for tools blocked by workspace permissions.
 *
 * @param toolId - Tool identifier
 * @param workspaceType - Current workspace type
 * @param toolName - Display name of tool
 * @returns Error response object
 */
export function createWorkspaceDeniedResponse(
  toolId: string,
  workspaceType: WorkspaceType,
  toolName?: string
): {
  success: false;
  error: string;
  blocked: true;
  code: string;
  workspaceType: WorkspaceType;
} {
  return {
    success: false,
    error: `Tool "${toolName || toolId}" is not available in the "${workspaceType}" workspace. Contact your administrator to configure workspace permissions.`,
    blocked: true,
    code: 'WORKSPACE_PERMISSION_DENIED',
    workspaceType,
  };
}
