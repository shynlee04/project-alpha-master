/**
 * Auto-Approve Settings Store
 * 
 * Manages user preferences for auto-approving different tool categories.
 * Uses Zustand with persistence for settings to survive page reloads.
 * 
 * @story MVP-3 - Tool Execution File Operations
 * @story MVP-4 - Tool Execution Terminal Commands
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Tool categories that can be individually auto-approved
 */
export type ToolCategory =
    | 'read'      // Read file, list files
    | 'write'     // Write file, create directory
    | 'delete'    // Delete file, delete directory
    | 'execute'   // Execute command, run script
    | 'browser'   // Browser automation (reserved for future)
    | 'mcp'       // MCP server tools (reserved for future)
    | 'mode'      // Mode switching (reserved for future)
    | 'subtasks'  // Subtask management (reserved for future);

/**
 * Maps tool names to their category
 */
export const TOOL_CATEGORY_MAP: Record<string, ToolCategory> = {
    // Read operations
    'read_file': 'read',
    'list_files': 'read',
    'list_directory': 'read',
    'view_file': 'read',

    // Write operations
    'write_file': 'write',
    'create_file': 'write',
    'create_directory': 'write',
    'mkdir': 'write',

    // Delete operations
    'delete_file': 'delete',
    'delete_directory': 'delete',
    'rm': 'delete',

    // Execute operations
    'execute_command': 'execute',
    'run_script': 'execute',
    'run_terminal': 'execute',
};

export interface AutoApproveState {
    /** Whether auto-approve is globally enabled */
    enabled: boolean;

    /** Individual category settings */
    categories: Record<ToolCategory, boolean>;

    /** Toggle global auto-approve */
    toggleEnabled: () => void;

    /** Toggle a specific category */
    toggleCategory: (category: ToolCategory) => void;

    /** Set a specific category */
    setCategory: (category: ToolCategory, value: boolean) => void;

    /** Set all categories at once */
    setAllCategories: (value: boolean) => void;

    /** Check if a tool should be auto-approved */
    shouldAutoApprove: (toolName: string) => boolean;

    /** Reset to defaults */
    reset: () => void;
}

const DEFAULT_CATEGORIES: Record<ToolCategory, boolean> = {
    read: false,
    write: false,
    delete: false,
    execute: false,
    browser: false,
    mcp: false,
    mode: false,
    subtasks: false,
};

export const useAutoApproveStore = create<AutoApproveState>()(
    persist(
        (set, get) => ({
            enabled: false,
            categories: { ...DEFAULT_CATEGORIES },

            toggleEnabled: () => {
                set((state) => ({ enabled: !state.enabled }));
            },

            toggleCategory: (category) => {
                set((state) => ({
                    categories: {
                        ...state.categories,
                        [category]: !state.categories[category],
                    },
                }));
            },

            setCategory: (category, value) => {
                set((state) => ({
                    categories: {
                        ...state.categories,
                        [category]: value,
                    },
                }));
            },

            setAllCategories: (value) => {
                set({
                    categories: Object.keys(DEFAULT_CATEGORIES).reduce((acc, key) => {
                        acc[key as ToolCategory] = value;
                        return acc;
                    }, {} as Record<ToolCategory, boolean>),
                });
            },

            shouldAutoApprove: (toolName) => {
                const state = get();
                if (!state.enabled) return false;

                const category = TOOL_CATEGORY_MAP[toolName];
                if (!category) return false;

                return state.categories[category] ?? false;
            },

            reset: () => {
                set({
                    enabled: false,
                    categories: { ...DEFAULT_CATEGORIES },
                });
            },
        }),
        {
            name: 'via-gent-auto-approve',
            version: 1,
        }
    )
);

export default useAutoApproveStore;
