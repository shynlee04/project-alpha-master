/**
 * Tool Permission Manager Types
 * Types must match infrastructure/persistence/stores/permissions/tool-permission-store.ts
 */

import type { WorkspaceType } from '@/domain/value-objects/workspace-type';

export type ToolTrustLevel = 'auto' | 'prompt' | 'block';

export type ToolCategory = 'files' | 'terminal' | 'knowledge' | 'vision' | 'search' | 'web';

export interface YOLOMode {
  enabled: boolean;
  expiryTime: number | null;
  durationHours: number;
}

export const DEFAULT_YOLO_DURATION_HOURS = 24;

export interface PermissionCheckResult {
  needsApproval: boolean;
  canExecute: boolean;
  reason: 'auto' | 'prompt' | 'block' | 'session' | 'yolo' | 'category';
  workspace: WorkspaceType;
  toolName: string;
  toolId: string;
  category?: ToolCategory;
}
