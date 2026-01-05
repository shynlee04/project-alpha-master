/**
 * @fileoverview Tool Permission Types
 * @module infrastructure/persistence/stores/permissions/types
 */

import type { WorkspaceType } from '@/domain/value-objects/workspace-type';

/**
 * Trust level for a tool - determines when user approval is required
 */
export type ToolTrustLevel = 'auto' | 'prompt' | 'block';

/**
 * Tool category for grouping related tools
 * Used for category-level approval (ARCH-01.4)
 */
export type ToolCategory = 'files' | 'terminal' | 'knowledge' | 'vision' | 'search' | 'web';

/**
 * YOLO Mode state (You Only Live Once)
 * When enabled, all tool permissions are auto-approved without prompts
 * Auto-disables after expiry time for safety (default: 24 hours)
 */
export interface YOLOMode {
    /** Whether YOLO mode is currently enabled */
    enabled: boolean;
    /** Expiry timestamp (auto-disable after this time) */
    expiryTime: number | null;
    /** Optional duration in hours (default: 24) */
    durationHours: number;
}

/**
 * Category approval state
 * When a category is approved, all tools in that category are auto-approved
 */
export type CategoryApprovalState = Record<ToolCategory, boolean>;

/**
 * Tool permission state interface
 */
export interface ToolPermissionState {
    /**
     * Nested trust levels: toolId -> workspaceType -> trustLevel
     */
    trustLevels: Record<string, Record<WorkspaceType, ToolTrustLevel>>;

    /**
     * Default trust level for new tools/workspace combinations
     */
    defaultTrustLevel: ToolTrustLevel;

    /**
     * Session-based trust (cleared on reload, NOT persisted)
     * Format: toolId:workspaceType (e.g., "read_file:ide")
     */
    sessionTrust: string[];

    /**
     * YOLO Mode state (v3 - ARCH-01.4)
     */
    yoloMode: YOLOMode;

    /**
     * Category approval state (v3 - ARCH-01.4)
     * Workspace-specific: Record<workspaceType, CategoryApprovalState>
     */
    categoryApprovals: Record<WorkspaceType, CategoryApprovalState>;

    /**
     * Schema version for migration
     */
    version: number;

    /**
     * Whether the store has finished hydrating from persistence
     */
    _hasHydrated: boolean;

    /** Actions */
    setTrustLevel: (toolId: string, workspaceType: WorkspaceType, level: ToolTrustLevel) => void;
    getTrustLevel: (toolId: string, workspaceType: WorkspaceType) => ToolTrustLevel;
    addSessionTrust: (toolId: string, workspaceType: WorkspaceType) => void;
    removeSessionTrust: (toolId: string, workspaceType: WorkspaceType) => void;
    clearSessionTrust: () => void;
    resetToDefaults: () => void;
    setHasHydrated: (hydrated: boolean) => void;

    /** YOLO Mode actions (v3 - ARCH-01.4) */
    toggleYOLO: (durationHours?: number) => void;
    setYOLOExpiry: (expiryTime: number) => void;
    checkYOLOExpiry: () => void;
    isYOLOActive: () => boolean;

    /** Category approval actions (v3 - ARCH-01.4) */
    setCategoryApproval: (category: ToolCategory, workspaceType: WorkspaceType, approved: boolean) => void;
    getCategoryApproval: (category: ToolCategory, workspaceType: WorkspaceType) => boolean;
    isCategoryApproved: (toolId: string, workspaceType: WorkspaceType) => boolean;
}
