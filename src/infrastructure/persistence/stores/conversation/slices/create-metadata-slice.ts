/**
 * Thread Metadata Slice
 *
 * Handles thread metadata operations (folder paths, search filters).
 * Part of the December 2025 Zustand slices pattern.
 *
 * @module conversation/slices/metadata
 */

import { StateCreator } from 'zustand';
import type { ConversationThread } from '../conversation-threads-store';

/**
 * Thread Metadata State & Actions
 */
export interface MetadataSlice {
    /** Update folder path for thread */
    updateThreadFolder: (threadId: string, folderPath: string) => void;
}

/**
 * Thread Metadata Slice Implementation
 */
export const createMetadataSlice: StateCreator<
    MetadataSlice & {
        threads: Record<string, ConversationThread>;
    },
    [],
    [],
    MetadataSlice
> = (set) => ({
    updateThreadFolder: (threadId: string, folderPath: string) => {
        console.log('[MetadataSlice] Updating folder for thread:', threadId, 'to:', folderPath);
        set((state) => {
            const thread = state.threads[threadId];
            if (!thread) return state;

            return {
                threads: {
                    ...state.threads,
                    [threadId]: {
                        ...thread,
                        folderPath,
                        updatedAt: Date.now(),
                    },
                },
            };
        });
    },
});
