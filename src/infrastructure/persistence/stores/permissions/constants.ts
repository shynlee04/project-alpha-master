/**
 * @fileoverview Tool Permission Constants
 * @module infrastructure/persistence/stores/permissions/constants
 */

import type { ToolCategory, ToolTrustLevel, CategoryApprovalState, YOLOMode, WorkspaceType } from './types';

/**
 * Tool to category mapping
 */
export const TOOL_CATEGORIES: Record<string, ToolCategory> = {
    // File operations
    read_file: 'files',
    list_files: 'files',
    read_directory: 'files',
    write_file: 'files',
    create_directory: 'files',
    delete_file: 'files',

    // Terminal operations
    execute_command: 'terminal',

    // Knowledge operations
    search_knowledge: 'knowledge',
    add_to_knowledge: 'knowledge',

    // Vision operations
    analyze_image: 'vision',
    capture_screen: 'vision',

    // Search operations
    web_search: 'search',
    search_files: 'search',

    // Web operations
    fetch_url: 'web',
    browse_web: 'web',

    // Note operations
    create_note: 'notes',
    read_note: 'notes',
    update_note: 'notes',
    delete_note: 'notes',
    list_notes: 'notes',

    // EPIC-TOOLS: Unified operations (cross-workspace)
    read: 'unified',
    write: 'unified',
    delete: 'unified',
    list: 'unified',

    // EPIC-TOOLS: Composite agentic workflows
    research: 'composite',
    storyboard: 'composite',
    analyze: 'composite',
    plan: 'composite',
};

/**
 * Default default trust level for new tools
 */
export const DEFAULT_TRUST_LEVEL: ToolTrustLevel = 'prompt';

/**
 * Default YOLO mode duration (24 hours)
 */
export const DEFAULT_YOLO_DURATION_HOURS = 24;

/**
 * Default category approvals (all disabled)
 */
export const DEFAULT_CATEGORY_APPROVALS: CategoryApprovalState = {
    file: false,
    files: false,
    terminal: false,
    note: false,
    notes: false,  // Added for story 40-05 (Note CRUD tools)
    knowledge: false,
    vision: false,
    search: false,
    web: false,
    system: false,
    unified: false,  // EPIC-TOOLS: Cross-workspace unified operations
    composite: false,  // EPIC-TOOLS: Multi-step agentic workflows
    provider: false,  // EPIC-PRV: LLM provider operations
};

/**
 * Default YOLO mode state (disabled)
 */
export const DEFAULT_YOLO_MODE: YOLOMode = {
    enabled: false,
    expiryTime: null,
    durationHours: DEFAULT_YOLO_DURATION_HOURS,
};

/**
 * Get the category for a tool
 * Returns 'files' as default for unknown tools
 */
export function getToolCategory(toolId: string): ToolCategory {
    return TOOL_CATEGORIES[toolId] || 'files';
}

/**
 * Create default category approvals for all workspaces
 */
export const createDefaultCategoryApprovals = (): Record<WorkspaceType, CategoryApprovalState> => ({
    ide: { ...DEFAULT_CATEGORY_APPROVALS },
    knowledge: { ...DEFAULT_CATEGORY_APPROVALS },
    notes: { ...DEFAULT_CATEGORY_APPROVALS },
    study: { ...DEFAULT_CATEGORY_APPROVALS },
});

/**
 * Default trust levels for all tools across all workspaces
 */
export const createDefaultTrustLevels = (): Record<string, Record<WorkspaceType, ToolTrustLevel>> => ({
    read_file: {
        ide: 'auto',
        knowledge: 'auto',
        notes: 'auto',
        study: 'auto',
    },
    list_files: {
        ide: 'auto',
        knowledge: 'auto',
        notes: 'auto',
        study: 'auto',
    },
    read_directory: {
        ide: 'auto',
        knowledge: 'auto',
        notes: 'auto',
        study: 'auto',
    },
    write_file: {
        ide: 'prompt',
        knowledge: 'block',
        notes: 'prompt',
        study: 'block',
    },
    create_directory: {
        ide: 'prompt',
        knowledge: 'block',
        notes: 'prompt',
        study: 'block',
    },
    delete_file: {
        ide: 'block',
        knowledge: 'block',
        notes: 'block',
        study: 'block',
    },
    execute_command: {
        ide: 'prompt',
        knowledge: 'block',
        notes: 'block',
        study: 'block',
    },
});

/**
 * All workspace types for iteration
 */
export const ALL_WORKSPACES: WorkspaceType[] = ['ide', 'knowledge', 'notes', 'study'];
