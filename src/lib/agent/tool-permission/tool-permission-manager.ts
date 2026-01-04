/**
 * Tool Permission Manager - Facade Class
 * Manages workspace-scoped tool execution trust levels for AI agents
 *
 * Trust Levels:
 * - 'auto': Execute immediately without user approval
 * - 'prompt': Require user approval before execution
 * - 'block': Never execute
 *
 * Uses Zustand store with Dexie persistence
 */

import { useToolPermissionStore } from '@/infrastructure/persistence/stores/permissions/tool-permission-store';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { ToolTrustLevel, ToolCategory, YOLOMode, PermissionCheckResult } from './types';
import { getToolCategory } from './constants';
import { getToolDisplayName } from './helpers';

export class ToolPermissionManager {
  private static instance: ToolPermissionManager | null = null;
  private eventBus: ((event: string, ...args: unknown[]) => void) | null = null;

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

    if (initialPermissions) {
      const store = useToolPermissionStore.getState();
      const firstToolId = Object.keys(initialPermissions)[0];
      const isWorkspaceScoped = firstToolId && typeof initialPermissions[firstToolId] === 'object';

      if (isWorkspaceScoped) {
        Object.entries(initialPermissions).forEach(([toolId, workspaceLevels]) => {
          Object.entries(workspaceLevels as Record<WorkspaceType, ToolTrustLevel>).forEach(([workspace, level]) => {
            store.setTrustLevel(toolId, workspace as WorkspaceType, level);
          });
        });
      } else {
        Object.entries(initialPermissions).forEach(([toolId, level]) => {
          for (const workspace of ['ide', 'knowledge', 'notes', 'study'] as WorkspaceType[]) {
            store.setTrustLevel(toolId, workspace, level);
          }
        });
      }
    }

    return instance;
  }

  private constructor() {}

  public setEventBus(eventBus: (event: string, ...args: unknown[]) => void): void {
    this.eventBus = eventBus;
  }

  public getTrustLevel(toolId: string, workspaceType?: WorkspaceType): ToolTrustLevel {
    const workspace = workspaceType ?? 'ide';
    return useToolPermissionStore.getState().getTrustLevel(toolId, workspace);
  }

  public setTrustLevel(toolId: string, workspaceOrLevel: WorkspaceType | ToolTrustLevel, level?: ToolTrustLevel): void {
    let workspace: WorkspaceType;
    let trustLevel: ToolTrustLevel;

    if (level === undefined) {
      workspace = 'ide';
      trustLevel = workspaceOrLevel as ToolTrustLevel;
    } else {
      workspace = workspaceOrLevel as WorkspaceType;
      trustLevel = level;
    }

    const previousLevel = this.getTrustLevel(toolId, workspace);
    useToolPermissionStore.getState().setTrustLevel(toolId, workspace, trustLevel);

    if (previousLevel !== trustLevel && this.eventBus) {
      this.eventBus('permission:changed', toolId, trustLevel);
    }
  }

  public setTrustLevelLegacy(toolId: string, level: ToolTrustLevel): void {
    this.setTrustLevel(toolId, 'ide', level);
  }

  public hasSessionTrust(toolId: string, workspaceType?: WorkspaceType): boolean {
    const workspace = workspaceType ?? 'ide';
    const state = useToolPermissionStore.getState();
    const sessionKey = `${toolId}:${workspace}`;
    return state.sessionTrust.includes(sessionKey);
  }

  public addSessionTrust(toolId: string, workspaceType?: WorkspaceType): void {
    const workspace = workspaceType ?? 'ide';
    const store = useToolPermissionStore.getState();
    const sessionKey = `${toolId}:${workspace}`;

    if (!store.sessionTrust.includes(sessionKey)) {
      store.addSessionTrust(toolId, workspace);
      this.eventBus?.('session:trust:added', toolId);
    }
  }

  public addSessionTrustLegacy(toolId: string): void {
    this.addSessionTrust(toolId, 'ide');
  }

  public removeSessionTrust(toolId: string, workspaceType?: WorkspaceType): void {
    const workspace = workspaceType ?? 'ide';
    const store = useToolPermissionStore.getState();
    const sessionKey = `${toolId}:${workspace}`;

    if (store.sessionTrust.includes(sessionKey)) {
      store.removeSessionTrust(toolId, workspace);
      this.eventBus?.('session:trust:removed', toolId);
    }
  }

  public removeSessionTrustLegacy(toolId: string): void {
    this.removeSessionTrust(toolId, 'ide');
  }

  public clearSessionTrust(): void {
    useToolPermissionStore.getState().clearSessionTrust();
    this.eventBus?.('session:trust:cleared');
  }

  public checkPermission(toolId: string, workspaceType?: WorkspaceType): PermissionCheckResult {
    const workspace = workspaceType ?? 'ide';
    const state = useToolPermissionStore.getState();
    const trustLevel = state.trustLevels[toolId]?.[workspace] ?? state.defaultTrustLevel;
    const sessionKey = `${toolId}:${workspace}`;
    const hasSession = state.sessionTrust.includes(sessionKey);
    const category = getToolCategory(toolId);

    if (state.isYOLOActive()) {
      return this.createResult(toolId, workspace, category, false, true, 'yolo');
    }

    if (state.isCategoryApproved(toolId, workspace)) {
      return this.createResult(toolId, workspace, category, false, true, 'category');
    }

    if (trustLevel === 'block') {
      return this.createResult(toolId, workspace, category, false, false, 'block');
    }

    if (hasSession) {
      return this.createResult(toolId, workspace, category, false, true, 'session');
    }

    if (trustLevel === 'auto') {
      return this.createResult(toolId, workspace, category, false, true, 'auto');
    }

    return this.createResult(toolId, workspace, category, true, true, 'prompt');
  }

  public checkPermissionLegacy(toolId: string): Omit<PermissionCheckResult, 'workspace'> {
    const result = this.checkPermission(toolId, 'ide');
    const { workspace, ...legacyResult } = result;
    return legacyResult;
  }

  private createResult(
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

  public getAllTrustLevels(workspaceType?: WorkspaceType): Record<string, ToolTrustLevel> {
    const workspace = workspaceType ?? 'ide';
    const state = useToolPermissionStore.getState();
    const workspaceLevels: Record<string, ToolTrustLevel> = {};

    for (const [toolId, workspaceMap] of Object.entries(state.trustLevels)) {
      workspaceLevels[toolId] = workspaceMap[workspace] ?? state.defaultTrustLevel;
    }

    return workspaceLevels;
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

  public getToolsByLevelLegacy(level: ToolTrustLevel): string[] {
    return this.getToolsByLevel('ide', level);
  }

  public hasPromptTools(workspaceType?: WorkspaceType): boolean {
    const workspace = workspaceType ?? 'ide';
    return this.getToolsByLevel(workspace, 'prompt').length > 0;
  }

  public hasBlockedTools(workspaceType?: WorkspaceType): boolean {
    const workspace = workspaceType ?? 'ide';
    return this.getToolsByLevel(workspace, 'block').length > 0;
  }

  public isYOLOActive(): boolean {
    return useToolPermissionStore.getState().isYOLOActive();
  }

  public getYOLOMode(): YOLOMode {
    return useToolPermissionStore.getState().yoloMode;
  }

  public toggleYOLO(durationHours?: number): YOLOMode {
    const store = useToolPermissionStore.getState();
    store.toggleYOLO(durationHours);
    const newState = store.yoloMode;
    this.eventBus?.('yolo:mode:toggled', newState.enabled, newState.expiryTime);
    return newState;
  }

  public enableYOLO(durationHours: number = 24): YOLOMode {
    const store = useToolPermissionStore.getState();

    if (!store.yoloMode.enabled) {
      store.toggleYOLO(durationHours);
      const newState = store.yoloMode;
      this.eventBus?.('yolo:mode:toggled', true, newState.expiryTime);
      return newState;
    }

    const now = Date.now();
    const expiryTime = now + durationHours * 60 * 60 * 1000;
    store.setYOLOExpiry(expiryTime);
    this.eventBus?.('yolo:mode:toggled', true, expiryTime);
    return store.yoloMode;
  }

  public disableYOLO(): void {
    const store = useToolPermissionStore.getState();
    if (store.yoloMode.enabled) {
      store.toggleYOLO();
      this.eventBus?.('yolo:mode:toggled', false, null);
    }
  }

  public checkYOLOExpiry(): void {
    const store = useToolPermissionStore.getState();
    const wasActive = store.yoloMode.enabled;
    store.checkYOLOExpiry();
    if (wasActive && !store.yoloMode.enabled) {
      this.eventBus?.('yolo:mode:expired');
    }
  }

  public setYOLOExpiry(expiryTime: number): void {
    useToolPermissionStore.getState().setYOLOExpiry(expiryTime);
  }

  public getCategoryApproval(category: ToolCategory, workspaceType?: WorkspaceType): boolean {
    const workspace = workspaceType ?? 'ide';
    return useToolPermissionStore.getState().getCategoryApproval(category, workspace);
  }

  public setCategoryApproval(category: ToolCategory, workspaceType: WorkspaceType, approved: boolean): void {
    const store = useToolPermissionStore.getState();
    const previousValue = store.getCategoryApproval(category, workspaceType);

    if (previousValue !== approved) {
      store.setCategoryApproval(category, workspaceType, approved);
      this.eventBus?.('category:approval:changed', category, workspaceType, approved);
    }
  }

  public isCategoryApproved(toolId: string, workspaceType?: WorkspaceType): boolean {
    const workspace = workspaceType ?? 'ide';
    return useToolPermissionStore.getState().isCategoryApproved(toolId, workspace);
  }

  public setCategoryApprovalIde(category: ToolCategory, approved: boolean): void {
    this.setCategoryApproval(category, 'ide', approved);
  }

  public getAllCategoryApprovals(workspaceType?: WorkspaceType): Record<string, boolean> {
    const workspace = workspaceType ?? 'ide';
    return useToolPermissionStore.getState().categoryApprovals[workspace] ?? {};
  }

  public resetCategoryApprovals(workspaceType?: WorkspaceType): void {
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

  public getToolCategory(toolId: string): ToolCategory {
    return getToolCategory(toolId);
  }
}
