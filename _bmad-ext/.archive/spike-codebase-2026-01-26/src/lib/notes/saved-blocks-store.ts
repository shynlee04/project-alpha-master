/**
 * @fileoverview Saved Blocks Store and Management
 * @module lib/notes/saved-blocks-store
 * @governance UX-13
 * @created 2026-01-16
 *
 * Allows users to save blocks for reuse across notes.
 * Persists to Dexie with favorites and usage tracking.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
    SavedBlockRecord,
    SavedBlockTemplate,
    SavedBlockType,
} from '@/infrastructure/persistence/dexie-db';
import { db } from '@/infrastructure/persistence/dexie-db';

// ============================================================================
// Types
// ============================================================================

export interface SavedBlocksStoreState {
    // Data
    savedBlocks: SavedBlockRecord[];

    // UI State
    selectedCategory: string | 'all';
    selectedTags: string[];
    selectedBlockType: SavedBlockType | 'all';
    showFavoritesOnly: boolean;
    showTemplatesOnly: boolean; // UX-14: Filter templates only
    searchQuery: string;

    // Loading state
    isLoading: boolean;
    lastSyncAt: number;

    // Actions
    loadSavedBlocks: () => Promise<void>;
    saveBlock: (template: SavedBlockTemplate) => Promise<string>;
    saveAsTemplate: (template: SavedBlockTemplate, options?: TemplateOptions) => Promise<string>; // UX-14
    updateBlock: (id: string, updates: Partial<SavedBlockRecord>) => Promise<void>;
    deleteBlock: (id: string) => Promise<void>;
    toggleFavorite: (id: string) => Promise<void>;
    recordUsage: (id: string) => Promise<void>;

    // UI Actions
    setSelectedCategory: (category: string | 'all') => void;
    setSelectedTags: (tags: string[]) => void;
    toggleTag: (tag: string) => Promise<void>;
    setSelectedBlockType: (blockType: SavedBlockType | 'all') => void;
    setShowFavoritesOnly: (show: boolean) => void;
    setShowTemplatesOnly: (show: boolean) => void; // UX-14
    setSearchQuery: (query: string) => void;

    // Selectors (computed values)
    getFilteredBlocks: () => SavedBlockRecord[];
    getRecentBlocks: (limit?: number) => SavedBlockRecord[];
    getFavoriteBlocks: () => SavedBlockRecord[];
    getTemplates: () => SavedBlockRecord[]; // UX-14: Get only templates
    getBlocksByType: (blockType: SavedBlockType) => SavedBlockRecord[];
    getAllTags: () => string[];
    getAllCategories: () => string[];
}

// ============================================================================
// UX-14: Template Options
// ============================================================================

/**
 * Options for saving a block as a template
 */
export interface TemplateOptions {
    /** Icon name for template gallery */
    icon?: string;
    /** Color theme for visual distinction */
    color?: string;
}

// ============================================================================
// Default Tags and Categories
// ============================================================================

export const DEFAULT_BLOCK_CATEGORIES = [
    { id: 'writing', label: 'Writing', icon: 'PenTool' },
    { id: 'productivity', label: 'Productivity', icon: 'ListTodo' },
    { id: 'documentation', label: 'Documentation', icon: 'FileText' },
    { id: 'technical', label: 'Technical', icon: 'Code' },
    { id: 'creative', label: 'Creative', icon: 'Palette' },
] as const;

export const DEFAULT_BLOCK_TAGS = [
    'template', 'favorite', 'frequently-used', 'custom',
    'callout', 'column', 'reference', 'synced',
];

// ============================================================================
// Store
// ============================================================================

export const useSavedBlocksStore = create<SavedBlocksStoreState>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                savedBlocks: [],
                selectedCategory: 'all',
                selectedTags: [],
                selectedBlockType: 'all',
                showFavoritesOnly: false,
                showTemplatesOnly: false, // UX-14
                searchQuery: '',
                isLoading: false,
                lastSyncAt: 0,

                // Load all saved blocks from database
                loadSavedBlocks: async () => {
                    set({ isLoading: true });
                    try {
                        if (!db.savedBlocks) {
                            set({ savedBlocks: [], isLoading: false, lastSyncAt: Date.now() });
                            return;
                        }

                        const blocks = await db.savedBlocks
                            .orderBy('updatedAt')
                            .reverse()
                            .toArray();

                        set({
                            savedBlocks: blocks,
                            isLoading: false,
                            lastSyncAt: Date.now(),
                        });
                    } catch (error) {
                        console.error('[SavedBlocks] Failed to load blocks:', error);
                        set({ savedBlocks: [], isLoading: false, lastSyncAt: Date.now() });
                    }
                },

                // Save a new block
                saveBlock: async (template) => {
                    try {
                        const now = Date.now();
                        const id = crypto.randomUUID();

                        const newBlock: SavedBlockRecord = {
                            id,
                            workspaceId: 'notes', // Default to notes workspace
                            name: template.name,
                            description: template.description,
                            blockType: template.blockType,
                            blockData: template.blockData,
                            tags: template.tags || [],
                            category: template.category,
                            isFavorite: false,
                            useCount: 0,
                            lastUsedAt: undefined,
                            createdAt: now,
                            updatedAt: now,
                            isBuiltIn: false,
                            // UX-14: Template fields (defaults for regular saved blocks)
                            isTemplate: false,
                            templateIcon: undefined,
                            templateColor: undefined,
                        };

                        await db.savedBlocks.add(newBlock);

                        set((state) => ({
                            savedBlocks: [newBlock, ...state.savedBlocks],
                        }));

                        return id;
                    } catch (error) {
                        console.error('[SavedBlocks] Failed to save block:', error);
                        throw error;
                    }
                },

                // UX-14: Save a block as a template
                saveAsTemplate: async (template, options) => {
                    try {
                        const now = Date.now();
                        const id = crypto.randomUUID();

                        const newBlock: SavedBlockRecord = {
                            id,
                            workspaceId: 'notes',
                            name: template.name,
                            description: template.description,
                            blockType: template.blockType,
                            blockData: template.blockData,
                            tags: [...(template.tags || []), 'template'], // Auto-add template tag
                            category: template.category,
                            isFavorite: false,
                            useCount: 0,
                            lastUsedAt: undefined,
                            createdAt: now,
                            updatedAt: now,
                            isBuiltIn: false,
                            // UX-14: Template-specific fields
                            isTemplate: true,
                            templateIcon: options?.icon,
                            templateColor: options?.color,
                        };

                        await db.savedBlocks.add(newBlock);

                        set((state) => ({
                            savedBlocks: [newBlock, ...state.savedBlocks],
                        }));

                        return id;
                    } catch (error) {
                        console.error('[SavedBlocks] Failed to save template:', error);
                        throw error;
                    }
                },

                // Update an existing block
                updateBlock: async (id, updates) => {
                    try {
                        const updatedBlock: Partial<SavedBlockRecord> = {
                            ...updates,
                            updatedAt: Date.now(),
                        };

                        await db.savedBlocks.update(id, updatedBlock);

                        set((state) => ({
                            savedBlocks: state.savedBlocks.map((block) =>
                                block.id === id
                                    ? { ...block, ...updatedBlock }
                                    : block
                            ),
                        }));
                    } catch (error) {
                        console.error('[SavedBlocks] Failed to update block:', error);
                        throw error;
                    }
                },

                // Delete a block
                deleteBlock: async (id) => {
                    try {
                        await db.savedBlocks.delete(id);

                        set((state) => ({
                            savedBlocks: state.savedBlocks.filter((block) => block.id !== id),
                        }));
                    } catch (error) {
                        console.error('[SavedBlocks] Failed to delete block:', error);
                        throw error;
                    }
                },

                // Toggle favorite status
                toggleFavorite: async (id) => {
                    try {
                        const block = get().savedBlocks.find((b) => b.id === id);
                        if (!block) return;

                        const newFavoriteStatus = !block.isFavorite;

                        await db.savedBlocks.update(id, {
                            isFavorite: newFavoriteStatus,
                            updatedAt: Date.now(),
                        });

                        set((state) => ({
                            savedBlocks: state.savedBlocks.map((b) =>
                                b.id === id
                                    ? { ...b, isFavorite: newFavoriteStatus, updatedAt: Date.now() }
                                    : b
                            ),
                        }));
                    } catch (error) {
                        console.error('[SavedBlocks] Failed to toggle favorite:', error);
                        throw error;
                    }
                },

                // Record usage when a block is inserted
                recordUsage: async (id) => {
                    try {
                        const block = get().savedBlocks.find((b) => b.id === id);
                        if (!block) return;

                        const updates = {
                            useCount: (block.useCount || 0) + 1,
                            lastUsedAt: Date.now(),
                            updatedAt: Date.now(),
                        };

                        await db.savedBlocks.update(id, updates);

                        set((state) => ({
                            savedBlocks: state.savedBlocks.map((b) =>
                                b.id === id
                                    ? { ...b, ...updates }
                                    : b
                            ),
                        }));
                    } catch (error) {
                        console.error('[SavedBlocks] Failed to record usage:', error);
                    }
                },

                // UI Actions
                setSelectedCategory: (category) => set({ selectedCategory: category }),
                setSelectedTags: (tags) => set({ selectedTags: tags }),
                setSelectedBlockType: (blockType) => set({ selectedBlockType: blockType }),
                setShowFavoritesOnly: (show) => set({ showFavoritesOnly: show }),
                setShowTemplatesOnly: (show) => set({ showTemplatesOnly: show }), // UX-14
                setSearchQuery: (query) => set({ searchQuery: query }),

                toggleTag: async (tag) => {
                    set((state) => ({
                        selectedTags: state.selectedTags.includes(tag)
                            ? state.selectedTags.filter((t) => t !== tag)
                            : [...state.selectedTags, tag],
                    }));
                },

                // Selectors (computed values)
                getFilteredBlocks: () => {
                    const state = get();
                    let filtered = [...state.savedBlocks];

                    // Filter by category
                    if (state.selectedCategory !== 'all') {
                        filtered = filtered.filter((b) => b.category === state.selectedCategory);
                    }

                    // Filter by block type
                    if (state.selectedBlockType !== 'all') {
                        filtered = filtered.filter((b) => b.blockType === state.selectedBlockType);
                    }

                    // Filter by tags
                    if (state.selectedTags.length > 0) {
                        filtered = filtered.filter((b) =>
                            state.selectedTags.every((tag) => b.tags.includes(tag))
                        );
                    }

                    // Filter by favorites
                    if (state.showFavoritesOnly) {
                        filtered = filtered.filter((b) => b.isFavorite);
                    }

                    // UX-14: Filter by templates
                    if (state.showTemplatesOnly) {
                        filtered = filtered.filter((b) => b.isTemplate === true);
                    }

                    // Filter by search query
                    if (state.searchQuery.trim()) {
                        const query = state.searchQuery.toLowerCase();
                        filtered = filtered.filter((b) =>
                            b.name.toLowerCase().includes(query) ||
                            b.description?.toLowerCase().includes(query) ||
                            b.tags.some((t) => t.toLowerCase().includes(query))
                        );
                    }

                    return filtered;
                },

                getRecentBlocks: (limit = 10) => {
                    return get()
                        .savedBlocks
                        .filter((b) => b.lastUsedAt)
                        .sort((a, b) => (b.lastUsedAt || 0) - (a.lastUsedAt || 0))
                        .slice(0, limit);
                },

                getFavoriteBlocks: () => {
                    return get().savedBlocks.filter((b) => b.isFavorite);
                },

                // UX-14: Get only templates
                getTemplates: () => {
                    return get().savedBlocks.filter((b) => b.isTemplate === true);
                },

                getBlocksByType: (blockType) => {
                    return get().savedBlocks.filter((b) => b.blockType === blockType);
                },

                getAllTags: () => {
                    const allTags = get().savedBlocks.flatMap((b) => b.tags);
                    return Array.from(new Set(allTags)).sort();
                },

                getAllCategories: () => {
                    const allCategories = get().savedBlocks
                        .map((b) => b.category)
                        .filter((c): c is string => !!c);
                    return Array.from(new Set(allCategories)).sort();
                },
            }),
            {
                name: 'via-gent-saved-blocks',
                partialize: (state) => ({
                    // Only persist UI state, not the actual blocks (those come from Dexie)
                    selectedCategory: state.selectedCategory,
                    selectedTags: state.selectedTags,
                    selectedBlockType: state.selectedBlockType,
                    showFavoritesOnly: state.showFavoritesOnly,
                    showTemplatesOnly: state.showTemplatesOnly, // UX-14
                    searchQuery: state.searchQuery,
                }),
            }
        ),
        { name: 'SavedBlocksStore' }
    )
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get block type label for display
 */
export function getBlockTypeLabel(blockType: SavedBlockType): string {
    const labels: Record<SavedBlockType, string> = {
        text: 'Text Block',
        callout: 'Callout',
        toggle: 'Toggle List',
        reference: 'Block Reference',
        column: 'Column Layout',
        synced: 'Synced Block',
        aiImage: 'AI Image',
        aiVision: 'AI Vision',
        chart: 'Chart/Diagram',
    };
    return labels[blockType] || blockType;
}

/**
 * Get block type icon name
 */
export function getBlockTypeIcon(blockType: SavedBlockType): string {
    const icons: Record<SavedBlockType, string> = {
        text: 'FileText',
        callout: 'Info',
        toggle: 'ChevronRight',
        reference: 'Link',
        column: 'Columns',
        synced: 'Link2',
        aiImage: 'ImagePlus',
        aiVision: 'Eye',
        chart: 'BarChart3',
    };
    return icons[blockType] || 'Box';
}

/**
 * Extract block type from BlockNote block
 */
export function extractBlockType(block: unknown): SavedBlockType {
    if (typeof block !== 'object' || block === null) {
        return 'text';
    }

    const b = block as Record<string, unknown>;
    const type = b.type as string;

    switch (type) {
        case 'callout':
            return 'callout';
        case 'toggleListItem':
            return 'toggle';
        case 'reference':
            return 'reference';
        case 'column':
            return 'column';
        case 'synced':
            return 'synced';
        case 'aiImage':
            return 'aiImage';
        case 'aiVision':
            return 'aiVision';
        case 'chartDiagram':
            return 'chart';
        default:
            return 'text';
    }
}

/**
 * Create a template from a BlockNote block
 */
export function createTemplateFromBlock(
    block: unknown,
    name: string,
    description?: string,
    tags?: string[],
    category?: string
): SavedBlockTemplate {
    return {
        name,
        description,
        blockType: extractBlockType(block),
        blockData: block,
        tags: tags || [],
        category,
    };
}
