/**
 * @fileoverview Tool Permission Integration
 * @module lib/agent/tools/permission-check
 *
 * Integration utilities for checking tool permissions
 * before execution in the agent workflow.
 *
 * @story 4-3 - Tool Permissions & Trust Levels
 */

import type { ToolPermissionManager, PermissionCheckResult } from '../tool-permission-manager';

/**
 * Check if a tool needs user approval before execution
 *
 * @param permissionManager - The permission manager instance
 * @param toolName - Name of the tool to check
 * @returns Object with permission check result and execution status
 */
export function checkToolPermission(
  permissionManager: ToolPermissionManager,
  toolName: string
): {
  canExecute: boolean;
  needsApproval: boolean;
  blocked: boolean;
  result: PermissionCheckResult;
} {
  const result = permissionManager.checkPermission(toolName);

  return {
    canExecute: result.canExecute,
    needsApproval: result.needsApproval,
    blocked: result.reason === 'block',
    result,
  };
}

/**
 * Get the appropriate risk level for UI display based on trust level
 *
 * @param permissionManager - The permission manager instance
 * @param toolName - Name of the tool
 * @returns Risk level for UI: 'low', 'medium', or 'high'
 */
export function getToolRiskLevel(
  permissionManager: ToolPermissionManager,
  toolName: string
): 'low' | 'medium' | 'high' {
  const trustLevel = permissionManager.getTrustLevel(toolName);

  // Map trust levels to risk levels for UI
  switch (trustLevel) {
    case 'block':
      return 'high';
    case 'prompt':
      // Check if it's a naturally high-risk operation
      if (toolName === 'execute_command' || toolName === 'delete_file') {
        return 'high';
      }
      return 'medium';
    case 'auto':
      return 'low';
    default:
      return 'medium';
  }
}

/**
 * Create a blocked tool result for tools that are blocked by permission policy
 *
 * @param toolName - Name of the blocked tool
 * @returns Error result indicating the tool is blocked
 */
export function createBlockedToolResult(toolName: string): {
  success: false;
  error: string;
  code: string;
  blocked: boolean;
  toolName: string;
} {
  return {
    success: false,
    error: `⛔ ${getToolDisplayName(toolName)} is blocked. Enable it in agent settings to use.`,
    code: 'TOOL_BLOCKED',
    blocked: true,
    toolName,
  };
}

/**
 * Get display name for a tool
 */
function getToolDisplayName(toolName: string): string {
  const displayNames: Record<string, string> = {
    read_file: 'Read File',
    write_file: 'Write File',
    list_files: 'List Files',
    delete_file: 'Delete File',
    execute_command: 'Execute Command',
    create_directory: 'Create Directory',
    read_directory: 'Read Directory',
  };
  return displayNames[toolName] ?? toolName.replace(/_/g, ' ');
}

/**
 * Filter tools based on permission status
 * Returns lists of allowed, blocked, and approval-required tools
 */
export function categorizeTools(
  permissionManager: ToolPermissionManager,
  toolNames: string[]
): {
  allowed: string[];
  blocked: string[];
  approvalRequired: string[];
} {
  const allowed: string[] = [];
  const blocked: string[] = [];
  const approvalRequired: string[] = [];

  for (const toolName of toolNames) {
    const check = checkToolPermission(permissionManager, toolName);

    if (check.blocked) {
      blocked.push(toolName);
    } else if (check.needsApproval) {
      approvalRequired.push(toolName);
    } else {
      allowed.push(toolName);
    }
  }

  return { allowed, blocked, approvalRequired };
}
