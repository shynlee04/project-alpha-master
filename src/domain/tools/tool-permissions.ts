/**
 * PHASE 2 ARCHIVED
 * Original: _phase2-archive/domain/tools/tool-permissions.ts
 * 
 * This module is disabled during Phase 1A. Tool permissions functionality
 * will be restored in Phase 2 when agent features are re-enabled.
 */

console.log('[Phase 2] Tool permissions disabled during Phase 1A');

export type ToolRiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Alias for compatibility
export type ToolTrustLevel = ToolRiskLevel;

export type ToolCategory = 'file' | 'terminal' | 'note' | 'web' | 'system';

export interface ToolPermission {
  toolName: string;
  allowed: boolean;
  riskLevel: ToolRiskLevel;
  requiresApproval: boolean;
  category?: ToolCategory;
}

export interface ToolPermissionsConfig {
  defaultRiskLevel: ToolRiskLevel;
  permissions: Record<string, ToolPermission>;
}

export function getDefaultToolPermissions(): ToolPermissionsConfig {
  console.log('[Phase 2] getDefaultToolPermissions disabled during Phase 1A');
  return {
    defaultRiskLevel: 'medium',
    permissions: {},
  };
}

export function checkToolPermission(
  toolName: string,
  _config: ToolPermissionsConfig
): ToolPermission {
  console.log('[Phase 2] checkToolPermission disabled during Phase 1A');
  return {
    toolName,
    allowed: false,
    riskLevel: 'high',
    requiresApproval: true,
  };
}

export function validateToolCall(
  _toolName: string,
  _args: Record<string, unknown>,
  _config: ToolPermissionsConfig
): { allowed: boolean; reason?: string } {
  console.log('[Phase 2] validateToolCall disabled during Phase 1A');
  return {
    allowed: false,
    reason: 'Tool execution is disabled during Phase 1A',
  };
}