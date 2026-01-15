/**
 * @fileoverview Slash Commands Store (Infrastructure Layer)
 * @module infrastructure/persistence/stores/notes/slash-commands
 * @governance EPIC-CC-09 Track 1
 * @created 2026-01-21
 * @migration Migrated from src/lib/notes/slash-command-store.ts
 *
 * CANONICAL LOCATION for slash commands Zustand store with Dexie persistence.
 * This is the authoritative location for slash command state management.
 *
 * Backward Compatibility:
 * - Legacy imports from '@/lib/notes' redirect here via facade
 * - Dual-store migration in progress (see store-facades.ts)
 * - Delete old location after Team A updates all imports
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';

// ============================================================================
// Types (Re-exported from legacy location during migration)
// ============================================================================

/**
 * Command categories (43-02: Category system)
 */
export const COMMAND_CATEGORIES = {
    writing: {
        id: 'writing',
        label: 'Writing',
        labelVi: 'Viết',
        icon: 'PenTool',
        description: 'Writing assistance and content creation',
    },
    productivity: {
        id: 'productivity',
        label: 'Productivity',
        labelVi: 'Năng suất',
        icon: 'ListTodo',
        description: 'Task management and organization',
    },
    analysis: {
        id: 'analysis',
        label: 'Analysis',
        labelVi: 'Phân tích',
        icon: 'Brain',
        description: 'Research, analysis, and insights',
    },
    communication: {
        id: 'communication',
        label: 'Communication',
        labelVi: 'Giao tiếp',
        icon: 'MessageSquare',
        description: 'Emails, meetings, and collaboration',
    },
    technical: {
        id: 'technical',
        label: 'Technical',
        labelVi: 'Kỹ thuật',
        icon: 'Code',
        description: 'Code, documentation, and technical tasks',
    },
    creative: {
        id: 'creative',
        label: 'Creative',
        labelVi: 'Sáng tạo',
        icon: 'Palette',
        description: 'Creative projects and brainstorming',
    },
    custom: {
        id: 'custom',
        label: 'Custom',
        labelVi: 'Tùy chỉnh',
        icon: 'Settings',
        description: 'User-defined commands',
    },
} as const;

export type CommandCategory = keyof typeof COMMAND_CATEGORIES;

/**
 * Prompt variable definition for 2-step refinement workflow
 * @story 43-03: 2-step prompt refinement workflow
 */
export interface PromptVariable {
    name: string; // Variable name (used in {{name}} placeholder)
    label: string; // Display label (EN)
    labelVi?: string; // Display label (VI)
    type: 'text' | 'textarea' | 'select'; // Input type
    options?: string[]; // For select type
    placeholder?: string; // Input placeholder
    defaultValue?: string; // Default value
    required?: boolean; // Whether variable is required
}

export interface CustomSlashCommand {
    id: string;
    title: string;
    titleVi?: string;
    description: string;
    descriptionVi?: string;
    prompt: string;
    icon: string; // Icon name from lucide-react
    aliases: string[];
    category?: CommandCategory; // 43-02: Category field
    tags?: string[]; // 43-02: Tags field
    variables?: PromptVariable[]; // 43-03: Prompt variables for refinement
    enableRefinement?: boolean; // 43-03: Enable 2-step refinement UI
    isEnabled: boolean;
    isFavorite?: boolean; // UX-13: User can mark commands as favorites
    useCount?: number; // UX-13: Track how many times command was used
    lastUsedAt?: number; // UX-13: Track when command was last used
    createdAt: number;
    updatedAt: number;
}

export interface SlashCommandStoreState {
    customCommands: CustomSlashCommand[];
    selectedCategory: CommandCategory | 'all'; // 43-02: Category filter state
    selectedTags: string[]; // 43-02: Tag filter state
    showFavoritesOnly: boolean; // UX-13: Filter to show only favorites

    // Actions
    addCommand: (command: Omit<CustomSlashCommand, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateCommand: (id: string, updates: Partial<CustomSlashCommand>) => void;
    deleteCommand: (id: string) => void;
    toggleCommand: (id: string) => void;
    reorderCommands: (fromIndex: number, toIndex: number) => void;
    importCommands: (commands: CustomSlashCommand[]) => void;
    exportCommands: () => CustomSlashCommand[];
    resetToDefaults: () => void;
    selectCategory: (category: CommandCategory | 'all') => void; // 43-02: Category selector
    toggleTag: (tag: string) => void; // 43-02: Tag toggle
    clearTagFilters: () => void; // 43-02: Clear tag filters

    // UX-13: Command History and Favorites
    recordUsage: (id: string) => void; // Track when command is used
    toggleFavorite: (id: string) => void; // Mark command as favorite
    setShowFavoritesOnly: (show: boolean) => void; // Filter favorites

    // Selectors
    getCommandsByCategory: (category: CommandCategory | 'all') => CustomSlashCommand[]; // 43-02
    getAllTags: () => string[]; // 43-02
    getRecentCommands: (limit?: number) => CustomSlashCommand[]; // UX-13: Recently used
    getFavoriteCommands: () => CustomSlashCommand[]; // UX-13: Favorites
}

// ============================================================================
// Default Commands
// ============================================================================

const DEFAULT_COMMANDS: CustomSlashCommand[] = [
    {
        id: 'custom-brainstorm',
        title: 'Brainstorm Ideas',
        titleVi: 'Brainstorm Ý tưởng',
        description: 'Generate creative ideas about any topic',
        descriptionVi: 'Tạo các ý tưởng sáng tạo về bất kỳ chủ đề nào',
        prompt: 'Based on current note context, brainstorm 5-10 creative and diverse ideas about {{topic}}. The tone should be {{tone}}. Format as a numbered list with brief explanations for each idea.',
        icon: 'Lightbulb',
        aliases: ['brainstorm', 'ideas', 'ytuong'],
        category: 'creative',
        tags: ['brainstorming', 'ideas', 'creative'],
        enableRefinement: true,
        variables: [
            {
                name: 'topic',
                label: 'Topic',
                labelVi: 'Chủ đề',
                type: 'text',
                placeholder: 'e.g., startup ideas, marketing strategies',
                required: true,
            },
            {
                name: 'tone',
                label: 'Tone',
                labelVi: 'Giọng điệu',
                type: 'select',
                options: ['creative', 'professional', 'casual', 'innovative', 'practical'],
                defaultValue: 'creative',
            },
        ],
        isEnabled: true,
        isFavorite: false, // UX-13
        useCount: 0, // UX-13
        lastUsedAt: undefined, // UX-13
        createdAt: Date.now(),
        updatedAt: Date.now(),
    },
    {
        id: 'custom-todo',
        title: 'Create Todo List',
        titleVi: 'Tạo Danh sách Todo',
        description: 'Convert content into actionable todos',
        descriptionVi: 'Chuyển đổi nội dung thành danh sách công việc',
        prompt: 'Based on current note, create a structured todo list with actionable items. Use checkbox format: - [ ] Task description',
        icon: 'ListTodo',
        aliases: ['todo', 'tasks', 'congviec'],
        category: 'productivity',
        tags: ['productivity', 'tasks', 'organization'],
        isEnabled: true,
        isFavorite: false, // UX-13
        useCount: 0, // UX-13
        lastUsedAt: undefined, // UX-13
        createdAt: Date.now(),
        updatedAt: Date.now(),
    },
    {
        id: 'custom-proofread',
        title: 'Proofread & Fix',
        titleVi: 'Kiểm tra & Sửa lỗi',
        description: 'Fix grammar, spelling, and punctuation',
        descriptionVi: 'Sửa ngữ pháp, chính tả và dấu câu',
        prompt: 'Proofread following content and fix all grammar, spelling, and punctuation errors. Keep original meaning and tone. Output corrected version.',
        icon: 'SpellCheck',
        aliases: ['proofread', 'fix', 'grammar', 'sualooi'],
        category: 'writing',
        tags: ['writing', 'grammar', 'proofreading'],
        isEnabled: true,
        isFavorite: false, // UX-13
        useCount: 0, // UX-13
        lastUsedAt: undefined, // UX-13
        createdAt: Date.now(),
        updatedAt: Date.now(),
    },
    {
        id: 'custom-meeting-notes',
        title: 'Format Meeting Notes',
        titleVi: 'Định dạng Ghi chú Họp',
        description: 'Structure content as meeting notes',
        descriptionVi: 'Cấu trúc nội dung như ghi chú cuộc họp',
        prompt: 'Format following content as professional meeting notes with: ## Attendees, ## Discussion Points, ## Action Items, ## Next Steps',
        icon: 'Users',
        aliases: ['meeting', 'hop', 'notes'],
        category: 'communication',
        tags: ['communication', 'meetings', 'notes'],
        isEnabled: true,
        isFavorite: false, // UX-13
        useCount: 0, // UX-13
        lastUsedAt: undefined, // UX-13
        createdAt: Date.now(),
        updatedAt: Date.now(),
    },
    // 43-03: New command with variables showcase
    {
        id: 'custom-write-email',
        title: 'Write Email',
        titleVi: 'Viết Email',
        description: 'Generate a professional email',
        descriptionVi: 'Tạo email chuyên nghiệp',
        prompt: 'Write a {{tone}} email to {{recipient}} about {{subject}}. The email should be {{length}} and include a clear call to action.',
        icon: 'MessageSquare',
        aliases: ['email', 'mail', 'thu'],
        category: 'communication',
        tags: ['communication', 'email', 'writing'],
        enableRefinement: true,
        isFavorite: false, // UX-13
        useCount: 0, // UX-13
        lastUsedAt: undefined, // UX-13
        variables: [
            {
                name: 'recipient',
                label: 'Recipient',
                labelVi: 'Người nhận',
                type: 'text',
                placeholder: 'e.g., my manager, a client, team',
                required: true,
            },
            {
                name: 'subject',
                label: 'Subject',
                labelVi: 'Chủ đề',
                type: 'textarea',
                placeholder: 'What is email about?',
                required: true,
            },
            {
                name: 'tone',
                label: 'Tone',
                labelVi: 'Giọng điệu',
                type: 'select',
                options: ['professional', 'friendly', 'formal', 'casual', 'urgent'],
                defaultValue: 'professional',
            },
            {
                name: 'length',
                label: 'Length',
                labelVi: 'Độ dài',
                type: 'select',
                options: ['brief (2-3 sentences)', 'medium (1 paragraph)', 'detailed (multiple paragraphs)'],
                defaultValue: 'medium (1 paragraph)',
            },
        ],
        isEnabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    },
];

// ============================================================================
// Available Icons
// ============================================================================

export const AVAILABLE_ICONS = [
    'Sparkles', 'Lightbulb', 'ListTodo', 'SpellCheck', 'Users',
    'BookOpen', 'FileText', 'MessageSquare', 'Wand2', 'Zap',
    'Brain', 'Code', 'FileCode', 'Globe', 'Heart',
    'PenTool', 'Search', 'Star', 'Target', 'Rocket',
    'Coffee', 'Palette', 'Music', 'Camera', 'Mic',
] as const;

export type AvailableIcon = typeof AVAILABLE_ICONS[number];

// ============================================================================
// Store with Dexie Persistence
// ============================================================================

/**
 * Slash Commands Store - CANONICAL LOCATION
 *
 * Migrated from localStorage to Dexie storage for:
 * - Better performance with IndexedDB
 * - Quota management and automatic cleanup
 * - Consistency with other app stores
 *
 * Storage: Uses PersistedStateTable via createDexieStorage()
 * Migration: Dual-store transition - facade at lib/notes/store-facades.ts
 */
export const useSlashCommandStore = create<SlashCommandStoreState>()(
    persist(
        (set, get) => ({
            customCommands: DEFAULT_COMMANDS,
            selectedCategory: 'all',
            selectedTags: [],
            showFavoritesOnly: false, // UX-13

            addCommand: (command) => {
                const newCommand: CustomSlashCommand = {
                    ...command,
                    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    isFavorite: false,
                    useCount: 0,
                };
                set((state) => ({
                    customCommands: [...state.customCommands, newCommand],
                }));
            },

            updateCommand: (id, updates) => {
                set((state) => ({
                    customCommands: state.customCommands.map((cmd) =>
                        cmd.id === id
                            ? { ...cmd, ...updates, updatedAt: Date.now() }
                            : cmd
                    ),
                }));
            },

            deleteCommand: (id) => {
                set((state) => ({
                    customCommands: state.customCommands.filter((cmd) => cmd.id !== id),
                }));
            },

            toggleCommand: (id) => {
                set((state) => ({
                    customCommands: state.customCommands.map((cmd) =>
                        cmd.id === id
                            ? { ...cmd, isEnabled: !cmd.isEnabled, updatedAt: Date.now() }
                            : cmd
                    ),
                }));
            },

            reorderCommands: (fromIndex, toIndex) => {
                set((state) => {
                    const newCommands = [...state.customCommands];
                    const [removed] = newCommands.splice(fromIndex, 1);
                    newCommands.splice(toIndex, 0, removed);
                    return { customCommands: newCommands };
                });
            },

            importCommands: (commands) => {
                set((state) => ({
                    customCommands: [
                        ...state.customCommands,
                        ...commands.map((cmd) => ({
                            ...cmd,
                            id: `imported-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
                            createdAt: Date.now(),
                            updatedAt: Date.now(),
                        })),
                    ],
                }));
            },

            exportCommands: () => {
                return get().customCommands;
            },

            resetToDefaults: () => {
                set({ customCommands: DEFAULT_COMMANDS });
            },

            // 43-02: Category and tag filtering
            selectCategory: (category) => {
                set({ selectedCategory: category });
            },

            toggleTag: (tag) => {
                set((state) => ({
                    selectedTags: state.selectedTags.includes(tag)
                        ? state.selectedTags.filter((t) => t !== tag)
                        : [...state.selectedTags, tag],
                }));
            },

            clearTagFilters: () => {
                set({ selectedTags: [] });
            },

            getCommandsByCategory: (category) => {
                return get().customCommands.filter(
                    (cmd) => category === 'all' || cmd.category === category
                );
            },

            getAllTags: () => {
                const allTags = get().customCommands
                    .flatMap((cmd) => cmd.tags || []);
                return Array.from(new Set(allTags)).sort();
            },

            // UX-13: Command History and Favorites
            recordUsage: (id) => {
                set((state) => ({
                    customCommands: state.customCommands.map((cmd) =>
                        cmd.id === id
                            ? {
                                ...cmd,
                                useCount: (cmd.useCount || 0) + 1,
                                lastUsedAt: Date.now(),
                                updatedAt: Date.now(),
                            }
                            : cmd
                    ),
                }));
            },

            toggleFavorite: (id) => {
                set((state) => ({
                    customCommands: state.customCommands.map((cmd) =>
                        cmd.id === id
                            ? { ...cmd, isFavorite: !cmd.isFavorite, updatedAt: Date.now() }
                            : cmd
                    ),
                }));
            },

            setShowFavoritesOnly: (show) => {
                set({ showFavoritesOnly: show });
            },

            getRecentCommands: (limit = 10) => {
                return get().customCommands
                    .filter((cmd) => cmd.lastUsedAt)
                    .sort((a, b) => (b.lastUsedAt || 0) - (a.lastUsedAt || 0))
                    .slice(0, limit);
            },

            getFavoriteCommands: () => {
                return get().customCommands.filter((cmd) => cmd.isFavorite);
            },
        }),
        {
            name: 'via-gent-slash-commands',
            // DEXIE STORAGE MIGRATION (Track 1)
            // Changed from default localStorage to Dexie persist storage
            storage: createDexieStorage('workspaceState') as any, // Type assertion for Zustand compatibility
        }
    )
);

// ============================================================================
// Helper: Get Localized Command
// ============================================================================

export function getLocalizedCommand(command: CustomSlashCommand, locale: string = 'en'): {
    title: string;
    description: string;
} {
    const isVietnamese = locale.toLowerCase().startsWith('vi');
    return {
        title: isVietnamese && command.titleVi ? command.titleVi : command.title,
        description: isVietnamese && command.descriptionVi ? command.descriptionVi : command.description,
    };
}

// ============================================================================
// 43-03: Variable Extraction and Substitution Helpers
// ============================================================================

/**
 * Extract variable names from a prompt template
 * Matches {{variableName}} patterns
 * @story 43-03: 2-step prompt refinement workflow
 */
export function extractVariablesFromPrompt(prompt: string): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(prompt)) !== null) {
        if (!matches.includes(match[1])) {
            matches.push(match[1]);
        }
    }
    return matches;
}

/**
 * Substitute variables in a prompt template with their values
 * @story 43-03: 2-step prompt refinement workflow
 */
export function substituteVariables(
    prompt: string,
    values: Record<string, string>
): string {
    let result = prompt;
    for (const [key, value] of Object.entries(values)) {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return result;
}

/**
 * Check if a prompt contains variables that need refinement
 * @story 43-03: 2-step prompt refinement workflow
 */
export function promptNeedsRefinement(command: CustomSlashCommand): boolean {
    // Explicit refinement flag takes precedence
    if (command.enableRefinement === true) return true;
    if (command.enableRefinement === false) return false;
    
    // Auto-detect variables in prompt
    const variables = extractVariablesFromPrompt(command.prompt);
    return variables.length > 0;
}

/**
 * Get localized variable label
 * @story 43-03: 2-step prompt refinement workflow
 */
export function getLocalizedVariableLabel(
    variable: PromptVariable,
    locale: string = 'en'
): string {
    const isVietnamese = locale.toLowerCase().startsWith('vi');
    return isVietnamese && variable.labelVi ? variable.labelVi : variable.label;
}
