/**
 * Tool Permission Manager - Trust Level & Session Management
 *
 * Handles trust level CRUD operations, session trust management,
 * and permission checking logic.
 *
 * @module tool-permission-trust
 */

import { useToolPermissionStore } from '@/infrastructure/persistence/stores/permissions/tool-permission-store';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { ToolTrustLevel, ToolCategory, PermissionCheckResult } from './types';
import { getToolCategory } from './constants';
import { getToolDisplayName } from './helpers';
import type { PermissionManagerContext } from './tool-permission-singleton';
import { emitPermissionEvent } from './tool-permission-singleton';

/**
 * Get the trust level for a tool in a workspace
 *
 * @param toolId - Tool identifier
 * @param workspaceType - Workspace type (defaults to 'ide')
 * @returns Current trust level
 */
export function getTrustLevel(toolId: string, workspaceType?: WorkspaceType): ToolTrustLevel {
  const workspace = workspaceType ?? 'ide';
  return useToolPermissionStore.getState().getTrustLevel(toolId, workspace);
}

/**
 * Set the trust level for a tool in a workspace
 *
 * @param toolId - Tool identifier
 * @param workspaceOrLevel - Workspace type or trust level (if legacy API)
 * @param level - Trust level (required if workspace specified)
 * @param context - Manager context for event emission
 */
export function setTrustLevel(
  toolId: string,
  workspaceOrLevel: WorkspaceType | ToolTrustLevel,
  level?: ToolTrustLevel,
  context?: PermissionManagerContext
): void {
  let workspace: WorkspaceType;
  let trustLevel: ToolTrustLevel;

  if (level === undefined) {
    workspace = 'ide';
    trustLevel = workspaceOrLevel as ToolTrustLevel;
  } else {
    workspace = workspaceOrLevel as WorkspaceType;
    trustLevel = level;
  }

  const previousLevel = getTrustLevel(toolId, workspace);
  useToolPermissionStore.getState().setTrustLevel(toolId, workspace, trustLevel);

  if (previousLevel !== trustLevel && context) {
    emitPermissionEvent(context, 'permission:changed', toolId, trustLevel);
  }
}

/**
 * Check if a tool has session trust in a workspace
 *
 * @param toolId - Tool identifier
 * @param workspaceType - Workspace type (defaults to 'ide')
 * @returns True if session trust exists
 */
export function hasSessionTrust(toolId: string, workspaceType?: WorkspaceType): boolean {
  const workspace = workspaceType ?? 'ide';
  const state = useToolPermissionStore.getState();
  const sessionKey = `${toolId}:${workspace}`;
  return state.sessionTrust.includes(sessionKey);
}

/**
 * Add session trust for a tool in a workspace
 *
 * @param toolId - Tool identifier
 * @param workspaceType - Workspace type (defaults to 'ide')
 * @param context - Manager context for event emission
 */
export function addSessionTrust(toolId: string, workspaceType?: WorkspaceType, context?: PermissionManagerContext): void {
  const workspace = workspaceType ?? 'ide';
  const store = useToolPermissionStore.getState();
  const sessionKey = `${toolId}:${workspace}`;

  if (!store.sessionTrust.includes(sessionKey)) {
    store.addSessionTrust(toolId, workspace);
    if (context) {
      emitPermissionEvent(context, 'session:trust:added', toolId);
    }
  }
}

/**
 * Remove session trust for a tool in a workspace
 *
 * @param toolId - Tool identifier
 * @param workspaceType - Workspace type (defaults to 'ide')
 * @param context - Manager context for event emission
 */
export function removeSessionTrust(toolId: string, workspaceType?: WorkspaceType, context?: PermissionManagerContext): void {
  const workspace = workspaceType ?? 'ide';
  const store = useToolPermissionStore.getState();
  const sessionKey = `${toolId}:${workspace}`;

  if (store.sessionTrust.includes(sessionKey)) {
    store.removeSessionTrust(toolId, workspace);
    if (context) {
      emitPermissionEvent(context, 'session:trust:removed', toolId);
    }
  }
}

/**
 * Clear all session trust
 *
 * @param context - Manager context for event emission
 */
export function clearSessionTrust(context?: PermissionManagerContext): void {
  useToolPermissionStore.getState().clearSessionTrust();
  if (context) {
    emitPermissionEvent(context, 'session:trust:cleared');
  }
}

/**
 * Create a permission check result object
 */
function createResult(
  toolId: string,
  workspace: WorkspaceType,
  category: ToolCategory | undefined,
  needsApproval: boolean,
  canExecute: boolean,
  reason: 'auto' | 'prompt' | 'block' | 'session' | 'yolo' | 'category'
): PermissionCheckResult {
  return {
    needsApproval,
    canExecute,
    reason,
    workspace,
    toolName: getToolDisplayName(toolId),
    toolId,
    category,
  };
}

/**
 * Check if a tool has permission to execute
 *
 * Evaluates trust level, session trust, YOLO mode, and category approvals
 * to determine if a tool can execute without user approval.
 *
 * @param toolId - Tool identifier
 * @param workspaceType - Workspace type (defaults to 'ide')
 * @returns Permission check result
 */
export function checkPermission(toolId: string, workspaceType?: WorkspaceType): PermissionCheckResult {
  const workspace = workspaceType ?? 'ide';
  const state = useToolPermissionStore.getState();
  const trustLevel = state.trustLevels[toolId]?.[workspace] ?? state.defaultTrustLevel;
  const sessionKey = `${toolId}:${workspace}`;
  const hasSession = state.sessionTrust.includes(sessionKey);
  const category = getToolCategory(toolId);

  if (state.isYOLOActive()) {
    return createResult(toolId, workspace, category, false, true, 'yolo');
  }

  if (state.isCategoryApproved(toolId, workspace)) {
    return createResult(toolId, workspace, category, false, true, 'category');
  }

  if (trustLevel === 'block') {
    return createResult(toolId, workspace, category, false, false, 'block');
  }

  if (hasSession) {
    return createResult(toolId, workspace, category, false, true, 'session');
  }

  if (trustLevel === 'auto') {
    return createResult(toolId, workspace, category, false, true, 'auto');
  }

  return createResult(toolId, workspace, category, true, true, 'prompt');
}

/**
 * Legacy API: Check permission without workspace (defaults to 'ide')
 *
 * @param toolId - Tool identifier
 * @returns Permission check result (without workspace field)
 */
export function checkPermissionLegacy(toolId: string): Omit<PermissionCheckResult, 'workspace'> {
  const result = checkPermission(toolId, 'ide');
  const { workspace, ...legacyResult } = result;
  return legacyResult;
}
