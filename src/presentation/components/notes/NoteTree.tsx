/**
 * @fileoverview Note Tree Component
 * @module components/notes/NoteTree
 * @governance EPIC-26-5
 *
 * Recursive tree component for hierarchical note navigation.
 *
 * Story 26.5: Note Hierarchy & Sidebar Navigation
 */

import { useMemo } from 'react';
import { useNoteNavigationStore } from '@/lib/notes/note-navigation-store';
import { buildTree, filterTreeBySearch, filterTreeByFavorites } from '@/lib/notes/note-tree-utils';
import type { NoteRecord } from '@/infrastructure/persistence/dexie-db';
import { NoteTreeItem } from './NoteTreeItem';

interface NoteTreeProps {
    notes: NoteRecord[];
    activeNoteId: string | null;
    onNoteSelect: (noteId: string) => void;
}

/**
 * Note tree component
 *
 * Features:
 * - Recursive tree rendering
 * - Search filtering
 * - Favorites filtering
 * - Keyboard navigation
 * - Active state highlighting
 */
export function NoteTree({ notes, activeNoteId, onNoteSelect }: NoteTreeProps) {
    const { searchQuery, showFavoritesOnly } = useNoteNavigationStore();

    // Build tree structure
    const tree = useMemo(() => {
        let tree = buildTree(notes);

        // Apply search filter
        if (searchQuery.trim()) {
            tree = filterTreeBySearch(tree, searchQuery);
        }

        // Apply favorites filter
        if (showFavoritesOnly) {
            tree = filterTreeByFavorites(tree);
        }

        return tree;
    }, [notes, searchQuery, showFavoritesOnly]);

    if (tree.length === 0) {
        return (
            <div className="p-4 text-center text-muted-foreground text-sm">
                {searchQuery.trim()
                    ? 'No notes found'
                    : showFavoritesOnly
                      ? 'No favorite notes yet'
                      : 'No notes yet'}
            </div>
        );
    }

    return (
        <div role="tree" aria-label="Notes tree">
            {tree.map((node) => (
                <NoteTreeItem
                    key={node.id}
                    node={node}
                    isActive={activeNoteId === node.id}
                    onNoteSelect={onNoteSelect}
                    level={0}
                />
            ))}
        </div>
    );
}
