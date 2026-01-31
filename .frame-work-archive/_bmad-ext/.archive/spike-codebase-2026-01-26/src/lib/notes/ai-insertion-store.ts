import { create } from 'zustand';
import type { BlockNoteEditor, Block } from '@blocknote/core';

/**
 * Insertion mode for AI-generated content
 * @story EPIC-42-04 - Smart content insertion (replace/append)
 */
export type InsertionMode = 'append' | 'replace' | 'before' | 'cancel';

/**
 * Pending AI content that needs user decision on insertion
 */
export interface PendingAIContent {
    /** Unique ID for this pending content */
    id: string;
    /** The raw markdown content from AI */
    rawContent: string;
    /** Parsed blocks ready for insertion */
    blocks: Block[];
    /** The block ID where content will be inserted relative to */
    targetBlockId: string;
    /** Command name that generated this content */
    commandName: string;
    /** Timestamp when content was generated */
    generatedAt: number;
    /** The editor instance */
    editor: BlockNoteEditor;
}

interface AIInsertionState {
    /** Currently pending content waiting for user decision */
    pendingContent: PendingAIContent | null;
    /** Whether the insertion dialog is open */
    isDialogOpen: boolean;
    /** Default insertion mode (user preference) */
    defaultMode: InsertionMode;
    /** Auto-insert mode (skip dialog if enabled) */
    autoInsert: boolean;
    
    /** Set pending content and open dialog */
    setPendingContent: (content: PendingAIContent) => void;
    /** Clear pending content and close dialog */
    clearPendingContent: () => void;
    /** Execute insertion with given mode */
    executeInsertion: (mode: InsertionMode) => void;
    /** Set default insertion mode */
    setDefaultMode: (mode: InsertionMode) => void;
    /** Toggle auto-insert mode */
    setAutoInsert: (auto: boolean) => void;
}

export const useAIInsertionStore = create<AIInsertionState>((set, get) => ({
    pendingContent: null,
    isDialogOpen: false,
    defaultMode: 'append',
    autoInsert: true, // Default: auto-insert without dialog for faster UX

    setPendingContent: (content) => {
        const { autoInsert, defaultMode } = get();
        
        if (autoInsert) {
            // Auto-insert: immediately insert and don't show dialog
            get().executeInsertion(defaultMode);
            return;
        }
        
        // Show dialog for user decision
        set({ pendingContent: content, isDialogOpen: true });
    },

    clearPendingContent: () => {
        set({ pendingContent: null, isDialogOpen: false });
    },

    executeInsertion: (mode) => {
        const { pendingContent } = get();
        if (!pendingContent || mode === 'cancel') {
            set({ pendingContent: null, isDialogOpen: false });
            return;
        }

        const { editor, blocks, targetBlockId } = pendingContent;
        
        try {
            switch (mode) {
                case 'append':
                    // Insert after target block
                    editor.insertBlocks(blocks, { id: targetBlockId }, 'after');
                    break;
                    
                case 'replace':
                    // Replace the target block
                    editor.replaceBlocks([{ id: targetBlockId }], blocks);
                    break;
                    
                case 'before':
                    // Insert before target block
                    editor.insertBlocks(blocks, { id: targetBlockId }, 'before');
                    break;
            }
            
            // Move cursor to end of inserted content
            const lastBlock = blocks[blocks.length - 1];
            if (lastBlock?.id) {
                editor.setTextCursorPosition(lastBlock.id, 'end');
            }
        } catch (error) {
            console.error('[AIInsertionStore] Failed to execute insertion:', error);
        }

        set({ pendingContent: null, isDialogOpen: false });
    },

    setDefaultMode: (mode) => {
        set({ defaultMode: mode });
    },

    setAutoInsert: (auto) => {
        set({ autoInsert: auto });
    },
}));

/**
 * Generate a unique ID for pending content
 */
export function generatePendingContentId(): string {
    return `pending-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
