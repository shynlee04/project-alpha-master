/**
 * Tool Permission Manager - Facade Class
 *
 * This file is a backwards-compatible facade that imports from modular slices.
 * The original god class (378 lines) has been split into:
 * - tool-permission-singleton.ts: Singleton & factory methods
 * - tool-permission-trust.ts: Trust level CRUD, session trust, permission checking
 * - tool-permission-queries.ts: Query methods, YOLO mode, category approvals
 *
 * All existing API calls continue to work without any code changes.
 *
 * Trust Levels:
 * - 'auto': Execute immediately without user approval
 * - 'prompt': Require user approval before execution
 * - 'block': Never execute
 */

import type { ToolTrustLevel, ToolCategory, YOLOMode, PermissionCheckResult } from './types';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import {
  createPermissionInstance,
  setPermissionEventBus,
  type PermissionManagerContext
} from './tool-permission-singleton';
import {
  getTrustLevel,
  setTrustLevel as setTrustLevelInternal,
  hasSessionTrust,
  addSessionTrust as addSessionTrustInternal,
  removeSessionTrust as removeSessionTrustInternal,
  clearSessionTrust as clearSessionTrustInternal,
  checkPermission,
  checkPermissionLegacy
} from './tool-permission-trust';
import {
  getAllTrustLevels,
  getToolsByLevel,
  hasPromptTools,
  hasBlockedTools,
  isYOLOActive,
  getYOLOMode,
  toggleYOLO as toggleYOLOInternal,
  enableYOLO as enableYOLOInternal,
  disableYOLO as disableYOLOInternal,
  checkYOLOExpiry as checkYOLOExpiryInternal,
  setYOLOExpiry,
  getCategoryApproval,
  setCategoryApproval as setCategoryApprovalInternal,
  isCategoryApproved,
  getAllCategoryApprovals,
  resetCategoryApprovals,
  getToolCategory
} from './tool-permission-queries';
import { useToolPermissionStore } from '@/infrastructure/persistence/stores/permissions/tool-permission-store';

/**
 * ToolPermissionManager - Singleton facade class
 *
 * Maintains 100% backwards compatibility with existing code.
 * Delegates to modular slice functions internally.
 */
export class ToolPermissionManager {
  private static instance: ToolPermissionManager | null = null;
  private readonly context: PermissionManagerContext = { eventBus: null };

  public static getInstance(): ToolPermissionManager {
    if (!ToolPermissionManager.instance) {
      ToolPermissionManager.instance = new ToolPermissionManager();
    }
    return ToolPermissionManager.instance;
  }

  public static createInstance(
    initialPermissions?: Record<string, ToolTrustLevel> | Record<string, Record<WorkspaceType, ToolTrustLevel>>
  ): ToolPermissionManager {
    const instance = new ToolPermissionManager();
    createPermissionInstance(initialPermissions, instance.context);
    return instance;
  }

  private constructor() {}

  public setEventBus(eventBus: (event: string, ...args: unknown[]) => void): void {
    setPermissionEventBus(this.context, eventBus);
  }

  // Trust Level Methods (from tool-permission-trust.ts)

  public getTrustLevel(toolId: string, workspaceType?: WorkspaceType): ToolTrustLevel {
    return getTrustLevel(toolId, workspaceType);
  }

  public setTrustLevel(toolId: string, workspaceOrLevel: WorkspaceType | ToolTrustLevel, level?: ToolTrustLevel): void {
    setTrustLevelInternal(toolId, workspaceOrLevel, level, this.context);
  }

  public setTrustLevelLegacy(toolId: string, level: ToolTrustLevel): void {
    this.setTrustLevel(toolId, 'ide', level);
  }

  // Session Trust Methods (from tool-permission-trust.ts)

  public hasSessionTrust(toolId: string, workspaceType?: WorkspaceType): boolean {
    return hasSessionTrust(toolId, workspaceType);
  }

  public addSessionTrust(toolId: string, workspaceType?: WorkspaceType): void {
    addSessionTrustInternal(toolId, workspaceType, this.context);
  }

  public addSessionTrustLegacy(toolId: string): void {
    this.addSessionTrust(toolId, 'ide');
  }

  public removeSessionTrust(toolId: string, workspaceType?: WorkspaceType): void {
    removeSessionTrustInternal(toolId, workspaceType, this.context);
  }

  public removeSessionTrustLegacy(toolId: string): void {
    this.removeSessionTrust(toolId, 'ide');
  }

  public clearSessionTrust(): void {
    clearSessionTrustInternal(this.context);
  }

  // Permission Check Methods (from tool-permission-trust.ts)

  public checkPermission(toolId: string, workspaceType?: WorkspaceType): PermissionCheckResult {
    return checkPermission(toolId, workspaceType);
  }

  public checkPermissionLegacy(toolId: string): Omit<PermissionCheckResult, 'workspace'> {
    return checkPermissionLegacy(toolId);
  }

  // Query Methods (from tool-permission-queries.ts)

  public getAllTrustLevels(workspaceType?: WorkspaceType): Record<string, ToolTrustLevel> {
    return getAllTrustLevels(workspaceType);
  }

  public getAllTrustLevelsLegacy(): Record<string, ToolTrustLevel> {
    return this.getAllTrustLevels('ide');
  }

  public getDefaultTrustLevels(workspaceType?: WorkspaceType): Record<string, ToolTrustLevel> {
    return this.getAllTrustLevels(workspaceType);
  }

  public getDefaultTrustLevelsLegacy(): Record<string, ToolTrustLevel> {
    return this.getDefaultTrustLevels('ide');
  }

  public resetToDefaults(): void {
    useToolPermissionStore.getState().resetToDefaults();
  }

  public toJSON(): string {
    const state = useToolPermissionStore.getState();
    return JSON.stringify({ permissions: state.trustLevels });
  }

  public static fromJSON(json: string): ToolPermissionManager {
    const data = JSON.parse(json);
    if (data.permissions) {
      Object.entries(data.permissions).forEach(([toolId, level]) => {
        useToolPermissionStore.getState().setTrustLevel(toolId, 'ide', level as ToolTrustLevel);
      });
    }
    return ToolPermissionManager.getInstance();
  }

  public getToolIds(): string[] {
    return Object.keys(useToolPermissionStore.getState().trustLevels);
  }

  public getToolsByLevel(workspaceType: WorkspaceType | ToolTrustLevel, level?: ToolTrustLevel): string[] {
    return getToolsByLevel(workspaceType, level);
  }

  public getToolsByLevelLegacy(level: ToolTrustLevel): string[] {
    return this.getToolsByLevel('ide', level);
  }

  public hasPromptTools(workspaceType?: WorkspaceType): boolean {
    return hasPromptTools(workspaceType);
  }

  public hasBlockedTools(workspaceType?: WorkspaceType): boolean {
    return hasBlockedTools(workspaceType);
  }

  // YOLO Mode Methods (from tool-permission-queries.ts)

  public isYOLOActive(): boolean {
    return isYOLOActive();
  }

  public getYOLOMode(): YOLOMode {
    return getYOLOMode();
  }

  public toggleYOLO(durationHours?: number): YOLOMode {
    return toggleYOLOInternal(durationHours, this.context);
  }

  public enableYOLO(durationHours: number = 24): YOLOMode {
    return enableYOLOInternal(durationHours, this.context);
  }

  public disableYOLO(): void {
    disableYOLOInternal(this.context);
  }

  public checkYOLOExpiry(): void {
    checkYOLOExpiryInternal(this.context);
  }

  public setYOLOExpiry(expiryTime: number): void {
    setYOLOExpiry(expiryTime);
  }

  // Category Approval Methods (from tool-permission-queries.ts)

  public getCategoryApproval(category: ToolCategory, workspaceType?: WorkspaceType): boolean {
    return getCategoryApproval(category, workspaceType);
  }

  public setCategoryApproval(category: ToolCategory, workspaceType: WorkspaceType, approved: boolean): void {
    setCategoryApprovalInternal(category, workspaceType, approved, this.context);
  }

  public isCategoryApproved(toolId: string, workspaceType?: WorkspaceType): boolean {
    return isCategoryApproved(toolId, workspaceType);
  }

  public setCategoryApprovalIde(category: ToolCategory, approved: boolean): void {
    this.setCategoryApproval(category, 'ide', approved);
  }

  public getAllCategoryApprovals(workspaceType?: WorkspaceType): Record<string, boolean> {
    return getAllCategoryApprovals(workspaceType);
  }

  public resetCategoryApprovals(workspaceType?: WorkspaceType): void {
    resetCategoryApprovals(workspaceType);
  }

  public getToolCategory(toolId: string): ToolCategory {
    return getToolCategory(toolId);
  }
}
