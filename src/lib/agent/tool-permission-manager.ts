/**
 * Tool Permission Manager - Facade (Deprecated)
 *
 * This file is a facade that re-exports from the refactored module.
 * The canonical location is now: lib/agent/tool-permission/
 *
 * @deprecated Use lib/agent/tool-permission/tool-permission-manager.ts instead
 */

export { ToolPermissionManager } from './tool-permission/tool-permission-manager';
export type { ToolTrustLevel, ToolCategory, YOLOMode, PermissionCheckResult } from './tool-permission/types';
