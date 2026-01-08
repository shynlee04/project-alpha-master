/**
 * @fileoverview Custom Slash Commands Store and Management
 * @module lib/notes/slash-command-store
 * @created 2026-01-08
 * 
 * Allows users to create, edit, and manage custom AI slash commands.
 * Persists to localStorage with i18n support (EN/VI).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================================
// Types
// ============================================================================

export interface CustomSlashCommand {
    id: string;
    title: string;
    titleVi?: string;
    description: string;
    descriptionVi?: string;
    prompt: string;
    icon: string; // Icon name from lucide-react
    aliases: string[];
    isEnabled: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface SlashCommandStoreState {
    customCommands: CustomSlashCommand[];

    // Actions
    addCommand: (command: Omit<CustomSlashCommand, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateCommand: (id: string, updates: Partial<CustomSlashCommand>) => void;
    deleteCommand: (id: string) => void;
    toggleCommand: (id: string) => void;
    reorderCommands: (fromIndex: number, toIndex: number) => void;
    importCommands: (commands: CustomSlashCommand[]) => void;
    exportCommands: () => CustomSlashCommand[];
    resetToDefaults: () => void;
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
        prompt: 'Based on the current note context, brainstorm 5-10 creative and diverse ideas. Format as a numbered list with brief explanations for each idea.',
        icon: 'Lightbulb',
        aliases: ['brainstorm', 'ideas', 'ytuong'],
        isEnabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    },
    {
        id: 'custom-todo',
        title: 'Create Todo List',
        titleVi: 'Tạo Danh sách Todo',
        description: 'Convert content into actionable todos',
        descriptionVi: 'Chuyển đổi nội dung thành danh sách công việc',
        prompt: 'Based on the current note, create a structured todo list with actionable items. Use checkbox format: - [ ] Task description',
        icon: 'ListTodo',
        aliases: ['todo', 'tasks', 'congviec'],
        isEnabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    },
    {
        id: 'custom-proofread',
        title: 'Proofread & Fix',
        titleVi: 'Kiểm tra & Sửa lỗi',
        description: 'Fix grammar, spelling, and punctuation',
        descriptionVi: 'Sửa ngữ pháp, chính tả và dấu câu',
        prompt: 'Proofread the following content and fix all grammar, spelling, and punctuation errors. Keep the original meaning and tone. Output the corrected version.',
        icon: 'SpellCheck',
        aliases: ['proofread', 'fix', 'grammar', 'sualooi'],
        isEnabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    },
    {
        id: 'custom-meeting-notes',
        title: 'Format Meeting Notes',
        titleVi: 'Định dạng Ghi chú Họp',
        description: 'Structure content as meeting notes',
        descriptionVi: 'Cấu trúc nội dung như ghi chú cuộc họp',
        prompt: 'Format the following content as professional meeting notes with: ## Attendees, ## Discussion Points, ## Action Items, ## Next Steps',
        icon: 'Users',
        aliases: ['meeting', 'hop', 'notes'],
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
// Store
// ============================================================================

export const useSlashCommandStore = create<SlashCommandStoreState>()(
    persist(
        (set, get) => ({
            customCommands: DEFAULT_COMMANDS,

            addCommand: (command) => {
                const newCommand: CustomSlashCommand = {
                    ...command,
                    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
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
                            id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
        }),
        {
            name: 'via-gent-custom-slash-commands',
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
