/**
 * @fileoverview Tool Permission Store - Actions Slice
 * @module infrastructure/persistence/stores/permissions/slices/permission-actions-slice
 */


import type { ToolPermissionState, ToolTrustLevel, ToolCategory } from '../types';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import {
    DEFAULT_YOLO_DURATION_HOURS,
    getToolCategory,
    createDefaultTrustLevels,
    createDefaultCategoryApprovals,
    DEFAULT_YOLO_MODE
} from '../constants';

type PermissionActions = Pick<ToolPermissionState,
    | 'setTrustLevel'
    | 'addSessionTrust'
    | 'removeSessionTrust'
    | 'clearSessionTrust'
    | 'resetToDefaults'
    | 'setHasHydrated'
    | 'toggleYOLO'
    | 'setYOLOExpiry'
    | 'checkYOLOExpiry'
    | 'isYOLOActive'
    | 'setCategoryApproval'
    | 'getCategoryApproval'
    | 'isCategoryApproved'
    | 'getTrustLevel'
>;

// Helper for initial state if needed, but actions usually mutate state
// We need access to Set and Get
export const createPermissionActionsSlice = (
    set: (partial: Partial<ToolPermissionState> | ((state: ToolPermissionState) => Partial<ToolPermissionState>)) => void,
    get: () => ToolPermissionState
): PermissionActions => ({

    setTrustLevel: (toolId: string, workspaceType: WorkspaceType, level: ToolTrustLevel) => {
        set((state) => ({
            trustLevels: {
                ...state.trustLevels,
                [toolId]: {
                    ...state.trustLevels[toolId],
                    [workspaceType]: level,
                },
            },
        }));
    },

    addSessionTrust: (toolId: string, workspaceType: WorkspaceType) => {
        const sessionKey = `${toolId}:${workspaceType}`;
        set((state) => {
            // Avoid duplicates
            if (state.sessionTrust.includes(sessionKey)) {
                return state;
            }
            return {
                sessionTrust: [...state.sessionTrust, sessionKey],
            };
        });
    },

    removeSessionTrust: (toolId: string, workspaceType: WorkspaceType) => {
        const sessionKey = `${toolId}:${workspaceType}`;
        set((state) => ({
            sessionTrust: state.sessionTrust.filter((key) => key !== sessionKey),
        }));
    },

    clearSessionTrust: () => {
        set({ sessionTrust: [] });
    },

    setHasHydrated: (hydrated: boolean) => {
        set({ _hasHydrated: hydrated } as Partial<ToolPermissionState>);
    },

    // YOLO Mode Actions

    toggleYOLO: (durationHours?: number) => {
        const state = get();
        const now = Date.now();

        if (state.yoloMode.enabled) {
            set({
                yoloMode: { ...state.yoloMode, enabled: false, expiryTime: null },
            });
        } else {
            const duration = durationHours ?? DEFAULT_YOLO_DURATION_HOURS;
            const expiryTime = now + duration * 60 * 60 * 1000;
            set({
                yoloMode: {
                    enabled: true,
                    expiryTime,
                    durationHours: duration,
                },
            });
            console.log(`[ToolPermissionStore] YOLO mode enabled for ${duration} hours`);
        }
    },

    setYOLOExpiry: (expiryTime: number) => {
        const state = get();
        set({
            yoloMode: { ...state.yoloMode, expiryTime },
        });
    },

    checkYOLOExpiry: () => {
        const state = get();
        if (state.yoloMode.enabled && state.yoloMode.expiryTime) {
            const now = Date.now();
            if (now > state.yoloMode.expiryTime) {
                set({
                    yoloMode: { ...state.yoloMode, enabled: false, expiryTime: null },
                });
                console.log('[ToolPermissionStore] YOLO mode expired and disabled');
            }
        }
    },

    isYOLOActive: () => {
        const state = get();
        if (!state.yoloMode.enabled || !state.yoloMode.expiryTime) {
            return false;
        }
        const now = Date.now();
        return now <= state.yoloMode.expiryTime;
    },

    // Category Actions

    setCategoryApproval: (category: ToolCategory, workspaceType: WorkspaceType, approved: boolean) => {
        set((state) => ({
            categoryApprovals: {
                ...state.categoryApprovals,
                [workspaceType]: {
                    ...state.categoryApprovals[workspaceType],
                    [category]: approved,
                },
            },
        }));
    },

    getCategoryApproval: (category: ToolCategory, workspaceType: WorkspaceType) => {
        const state = get();
        return state.categoryApprovals[workspaceType]?.[category] ?? false;
    },

    isCategoryApproved: (toolId: string, workspaceType: WorkspaceType) => {
        const category = getToolCategory(toolId);
        const state = get();
        return state.categoryApprovals[workspaceType]?.[category] ?? false;
    },

    // Reset Actions - Moved logic here but `resetToDefaults` uses constants which we need to import
    // But wait, resetToDefaults also resets sessionTrust and states. 
    // It relies on constants `createDefaultTrustLevels` etc.

    resetToDefaults: () => {
        set({
            trustLevels: createDefaultTrustLevels(),
            sessionTrust: [],
            // ARCH-01.4: Reset YOLO mode to default (disabled)
            yoloMode: DEFAULT_YOLO_MODE,
            // ARCH-01.4: Reset all category approvals
            categoryApprovals: createDefaultCategoryApprovals(),
        });
    },

    getTrustLevel: (toolId: string, workspaceType: WorkspaceType) => {
        const state = get();
        return state.trustLevels[toolId]?.[workspaceType] ?? state.defaultTrustLevel;
    },
});
