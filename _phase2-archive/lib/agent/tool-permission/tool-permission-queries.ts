/**
 * Tool Permission Manager - Query Methods & YOLO Mode
 *
 * Handles query methods for retrieving trust levels,
 * YOLO mode management, and category approvals.
 *
 * @module tool-permission-queries
 */

import { useToolPermissionStore } from '@/infrastructure/persistence/stores/permissions/tool-permission-store';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { ToolTrustLevel, ToolCategory, YOLOMode } from './types';
import { getToolCategory as getCategoryFromConstants } from './constants';
import type { PermissionManagerContext } from './tool-permission-singleton';
import { emitPermissionEvent } from './tool-permission-singleton';

/**
 * Get all trust levels for a workspace
 *
 * @param workspaceType - Workspace type (defaults to 'ide')
 * @returns Record mapping tool IDs to trust levels
 */
export function getAllTrustLevels(workspaceType?: WorkspaceType): Record<string, ToolTrustLevel> {
  const workspace = workspaceType ?? 'ide';
  const state = useToolPermissionStore.getState();
  const workspaceLevels: Record<string, ToolTrustLevel> = {};

  for (const [toolId, workspaceMap] of Object.entries(state.trustLevels)) {
    workspaceLevels[toolId] = workspaceMap[workspace] ?? state.defaultTrustLevel;
  }

  return workspaceLevels;
}

/**
 * Get all tools that have a specific trust level in a workspace
 *
 * @param workspaceType - Workspace type or trust level (if legacy API)
 * @param level - Trust level (required if workspace specified)
 * @returns Array of tool IDs
 */
export function getToolsByLevel(
  workspaceType: WorkspaceType | ToolTrustLevel,
  level?: ToolTrustLevel
): string[] {
  let workspace: WorkspaceType;
  let trustLevel: ToolTrustLevel;

  if (level === undefined) {
    workspace = 'ide';
    trustLevel = workspaceType as ToolTrustLevel;
  } else {
    workspace = workspaceType as WorkspaceType;
    trustLevel = level;
  }

  const state = useToolPermissionStore.getState();
  const tools: string[] = [];

  for (const [toolId, workspaceMap] of Object.entries(state.trustLevels)) {
    if (workspaceMap[workspace] === trustLevel) {
      tools.push(toolId);
    }
  }

  return tools;
}

/**
 * Check if any tools require prompting in a workspace
 *
 * @param workspaceType - Workspace type (defaults to 'ide')
 * @returns True if any tools have 'prompt' trust level
 */
export function hasPromptTools(workspaceType?: WorkspaceType): boolean {
  const workspace = workspaceType ?? 'ide';
  return getToolsByLevel(workspace, 'prompt').length > 0;
}

/**
 * Check if any tools are blocked in a workspace
 *
 * @param workspaceType - Workspace type (defaults to 'ide')
 * @returns True if any tools have 'block' trust level
 */
export function hasBlockedTools(workspaceType?: WorkspaceType): boolean {
  const workspace = workspaceType ?? 'ide';
  return getToolsByLevel(workspace, 'block').length > 0;
}

/**
 * Check if YOLO mode is currently active
 *
 * @returns True if YOLO mode is enabled
 */
export function isYOLOActive(): boolean {
  return useToolPermissionStore.getState().isYOLOActive();
}

/**
 * Get current YOLO mode state
 *
 * @returns YOLO mode object with enabled status and expiry time
 */
export function getYOLOMode(): YOLOMode {
  return useToolPermissionStore.getState().yoloMode;
}

/**
 * Toggle YOLO mode on/off
 *
 * @param durationHours - Duration in hours (only used when enabling)
 * @param context - Manager context for event emission
 * @returns New YOLO mode state
 */
export function toggleYOLO(durationHours?: number, context?: PermissionManagerContext): YOLOMode {
  const store = useToolPermissionStore.getState();
  store.toggleYOLO(durationHours);
  const newState = store.yoloMode;
  if (context) {
    emitPermissionEvent(context, 'yolo:mode:toggled', newState.enabled, newState.expiryTime);
  }
  return newState;
}

/**
 * Enable YOLO mode for a specified duration
 *
 * @param durationHours - Duration in hours (default 24)
 * @param context - Manager context for event emission
 * @returns New YOLO mode state
 */
export function enableYOLO(durationHours: number = 24, context?: PermissionManagerContext): YOLOMode {
  const store = useToolPermissionStore.getState();

  if (!store.yoloMode.enabled) {
    store.toggleYOLO(durationHours);
    const newState = store.yoloMode;
    if (context) {
      emitPermissionEvent(context, 'yolo:mode:toggled', true, newState.expiryTime);
    }
    return newState;
  }

  const now = Date.now();
  const expiryTime = now + durationHours * 60 * 60 * 1000;
  store.setYOLOExpiry(expiryTime);
  if (context) {
    emitPermissionEvent(context, 'yolo:mode:toggled', true, expiryTime);
  }
  return store.yoloMode;
}

/**
 * Disable YOLO mode
 *
 * @param context - Manager context for event emission
 */
export function disableYOLO(context?: PermissionManagerContext): void {
  const store = useToolPermissionStore.getState();
  if (store.yoloMode.enabled) {
    store.toggleYOLO();
    if (context) {
      emitPermissionEvent(context, 'yolo:mode:toggled', false, null);
    }
  }
}

/**
 * Check and expire YOLO mode if time has elapsed
 *
 * @param context - Manager context for event emission
 */
export function checkYOLOExpiry(context?: PermissionManagerContext): void {
  const store = useToolPermissionStore.getState();
  const wasActive = store.yoloMode.enabled;
  store.checkYOLOExpiry();
  if (wasActive && !store.yoloMode.enabled && context) {
    emitPermissionEvent(context, 'yolo:mode:expired');
  }
}

/**
 * Set YOLO mode expiry time
 *
 * @param expiryTime - Unix timestamp in milliseconds
 */
export function setYOLOExpiry(expiryTime: number): void {
  useToolPermissionStore.getState().setYOLOExpiry(expiryTime);
}

/**
 * Get category approval status for a workspace
 *
 * @param category - Tool category
 * @param workspaceType - Workspace type (defaults to 'ide')
 * @returns True if category is approved
 */
export function getCategoryApproval(category: ToolCategory, workspaceType?: WorkspaceType): boolean {
  const workspace = workspaceType ?? 'ide';
  return useToolPermissionStore.getState().getCategoryApproval(category, workspace);
}

/**
 * Set category approval status for a workspace
 *
 * @param category - Tool category
 * @param workspaceType - Workspace type
 * @param approved - Approval status
 * @param context - Manager context for event emission
 */
export function setCategoryApproval(
  category: ToolCategory,
  workspaceType: WorkspaceType,
  approved: boolean,
  context?: PermissionManagerContext
): void {
  const store = useToolPermissionStore.getState();
  const previousValue = store.getCategoryApproval(category, workspaceType);

  if (previousValue !== approved) {
    store.setCategoryApproval(category, workspaceType, approved);
    if (context) {
      emitPermissionEvent(context, 'category:approval:changed', category, workspaceType, approved);
    }
  }
}

/**
 * Check if a tool's category is approved in a workspace
 *
 * @param toolId - Tool identifier
 * @param workspaceType - Workspace type (defaults to 'ide')
 * @returns True if tool's category is approved
 */
export function isCategoryApproved(toolId: string, workspaceType?: WorkspaceType): boolean {
  const workspace = workspaceType ?? 'ide';
  return useToolPermissionStore.getState().isCategoryApproved(toolId, workspace);
}

/**
 * Get all category approvals for a workspace
 *
 * @param workspaceType - Workspace type (defaults to 'ide')
 * @returns Record mapping categories to approval status
 */
export function getAllCategoryApprovals(workspaceType?: WorkspaceType): Record<string, boolean> {
  const workspace = workspaceType ?? 'ide';
  return useToolPermissionStore.getState().categoryApprovals[workspace] ?? {};
}

/**
 * Reset all category approvals to false
 *
 * @param workspaceType - Workspace type (undefined = all workspaces)
 */
export function resetCategoryApprovals(workspaceType?: WorkspaceType): void {
  const store = useToolPermissionStore.getState();
  const categories: ToolCategory[] = ['files', 'terminal', 'knowledge', 'vision', 'search', 'web'];

  if (workspaceType) {
    categories.forEach(category => store.setCategoryApproval(category, workspaceType, false));
  } else {
    const workspaces: WorkspaceType[] = ['ide', 'knowledge', 'notes', 'study'];
    workspaces.forEach(workspace => {
      categories.forEach(category => store.setCategoryApproval(category, workspace, false));
    });
  }
}

/**
 * Get the category for a tool
 *
 * @param toolId - Tool identifier
 * @returns Tool category
 */
export function getToolCategory(toolId: string): ToolCategory {
  return getCategoryFromConstants(toolId);
}
