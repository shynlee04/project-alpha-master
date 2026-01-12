/**
 * @fileoverview Note Navigation Store for Tree Structure
 * @module lib/notes/note-navigation-store
 * @governance EPIC-26-5, 45-05
 *
 * Manages tree state, expanded/collapsed nodes, search, drag-and-drop,
 * and scroll position for hierarchical note navigation.
 *
 * Story 26.5: Note Hierarchy & Sidebar Navigation
 * Story 45-05: Preserve scroll position per note
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Navigation state for note tree
 */
interface NavigationState {
    /** Set of expanded node IDs */
    expandedNodes: Set<string>;

    /** Toggle node expanded/collapsed */
    toggleExpanded: (id: string) => void;

    /** Expand a node */
    expandNode: (id: string) => void;

    /** Collapse a node */
    collapseNode: (id: string) => void;

    /** Collapse all nodes */
    collapseAll: () => void;

    /** Search query */
    searchQuery: string;

    /** Set search query */
    setSearchQuery: (query: string) => void;

    /** Show favorites only */
    showFavoritesOnly: boolean;

    /** Toggle favorites filter */
    toggleFavoritesFilter: () => void;

    /** Currently dragged node ID */
    draggedNodeId: string | null;

    /** Set dragged node */
    setDraggedNode: (id: string | null) => void;

    /** Currently focused node ID (keyboard navigation) */
    focusedNodeId: string | null;

    /** Set focused node */
    setFocusedNode: (id: string | null) => void;

    // 45-05: Scroll position preservation
    /** Map of note ID to scroll position (scrollTop) */
    noteScrollPositions: Record<string, number>;

    /** Set scroll position for a note */
    setNoteScrollPosition: (noteId: string, scrollTop: number) => void;

    /** Get scroll position for a note */
    getNoteScrollPosition: (noteId: string) => number;

    /** Clear scroll position for a note (called on delete) */
    clearNoteScrollPosition: (noteId: string) => void;
}

/**
 * Create note navigation store with persistence
 */
export const useNoteNavigationStore = create<NavigationState>()(
    persist(
        (set, get) => ({
            // Expanded nodes state
            expandedNodes: new Set<string>(),

            toggleExpanded: (id: string) =>
                set((state) => {
                    const newExpanded = new Set(state.expandedNodes);
                    if (newExpanded.has(id)) {
                        newExpanded.delete(id);
                    } else {
                        newExpanded.add(id);
                    }
                    return { expandedNodes: newExpanded };
                }),

            expandNode: (id: string) =>
                set((state) => {
                    const newExpanded = new Set(state.expandedNodes);
                    newExpanded.add(id);
                    return { expandedNodes: newExpanded };
                }),

            collapseNode: (id: string) =>
                set((state) => {
                    const newExpanded = new Set(state.expandedNodes);
                    newExpanded.delete(id);
                    return { expandedNodes: newExpanded };
                }),

            collapseAll: () =>
                set(() => ({
                    expandedNodes: new Set(),
                })),

            // Search state
            searchQuery: '',
            setSearchQuery: (query: string) => set({ searchQuery: query }),

            // Favorites filter
            showFavoritesOnly: false,
            toggleFavoritesFilter: () =>
                set((state) => ({
                    showFavoritesOnly: !state.showFavoritesOnly,
                })),

            // Drag-and-drop state
            draggedNodeId: null,
            setDraggedNode: (id: string | null) => set({ draggedNodeId: id }),

            // Keyboard navigation state
            focusedNodeId: null,
            setFocusedNode: (id: string | null) => set({ focusedNodeId: id }),

            // 45-05: Scroll position preservation
            noteScrollPositions: {},

            setNoteScrollPosition: (noteId: string, scrollTop: number) =>
                set((state) => ({
                    noteScrollPositions: {
                        ...state.noteScrollPositions,
                        [noteId]: scrollTop,
                    },
                })),

            getNoteScrollPosition: (noteId: string) => {
                const positions = get().noteScrollPositions;
                return positions[noteId] ?? 0;
            },

            clearNoteScrollPosition: (noteId: string) =>
                set((state) => {
                    const newPositions = { ...state.noteScrollPositions };
                    delete newPositions[noteId];
                    return { noteScrollPositions: newPositions };
                }),
        }),
        {
            name: 'note-navigation-storage',
            // Persist expanded nodes, favorites filter, and scroll positions
            partialize: (state) => ({
                expandedNodes: Array.from(state.expandedNodes), // Convert Set to Array for serialization
                showFavoritesOnly: state.showFavoritesOnly,
                noteScrollPositions: state.noteScrollPositions,
            }),
            // Rehydrate Set from Array
            onRehydrateStorage: () => (state) => {
                if (state && Array.isArray(state.expandedNodes)) {
                    state.expandedNodes = new Set(state.expandedNodes as unknown as string[]);
                }
            },
        }
    )
);

/**
 * Hook to get expanded state for a specific node
 */
export function useNodeExpanded(id: string): boolean {
    return useNoteNavigationStore((state) => state.expandedNodes.has(id));
}

/**
 * Hook to get search query
 */
export function useSearchQuery(): string {
    return useNoteNavigationStore((state) => state.searchQuery);
}

/**
 * Hook to get favorites filter
 */
export function useFavoritesFilter(): boolean {
    return useNoteNavigationStore((state) => state.showFavoritesOnly);
}

/**
 * 45-05: Hook to get scroll position methods
 */
export function useNoteScrollPosition() {
    return useNoteNavigationStore((state) => ({
        setNoteScrollPosition: state.setNoteScrollPosition,
        getNoteScrollPosition: state.getNoteScrollPosition,
        clearNoteScrollPosition: state.clearNoteScrollPosition,
    }));
}
