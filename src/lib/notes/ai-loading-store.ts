import { create } from 'zustand';

/**
 * Loading state for AI generation at block level
 * @story EPIC-42-03 - Block-specific loading animation
 */
export interface BlockLoadingState {
    /** Block ID that is generating content */
    blockId: string;
    /** Command name being executed */
    commandName: string;
    /** Start timestamp */
    startedAt: number;
    /** Progress message (optional) */
    message?: string;
}

interface AILoadingState {
    /** Currently loading blocks - Map of blockId to loading state */
    loadingBlocks: Map<string, BlockLoadingState>;
    /** Global loading indicator (for backward compatibility with toast) */
    isGlobalLoading: boolean;
    /** Start loading for a specific block */
    startBlockLoading: (blockId: string, commandName: string, message?: string) => void;
    /** Stop loading for a specific block */
    stopBlockLoading: (blockId: string) => void;
    /** Update loading message for a block */
    updateLoadingMessage: (blockId: string, message: string) => void;
    /** Check if a block is loading */
    isBlockLoading: (blockId: string) => boolean;
    /** Get loading state for a block */
    getBlockLoadingState: (blockId: string) => BlockLoadingState | undefined;
    /** Clear all loading states */
    clearAll: () => void;
    /** Set global loading state */
    setGlobalLoading: (loading: boolean) => void;
}

export const useAILoadingStore = create<AILoadingState>((set, get) => ({
    loadingBlocks: new Map(),
    isGlobalLoading: false,

    startBlockLoading: (blockId, commandName, message) => {
        set((state) => {
            const newMap = new Map(state.loadingBlocks);
            newMap.set(blockId, {
                blockId,
                commandName,
                startedAt: Date.now(),
                message,
            });
            return { loadingBlocks: newMap, isGlobalLoading: true };
        });
    },

    stopBlockLoading: (blockId) => {
        set((state) => {
            const newMap = new Map(state.loadingBlocks);
            newMap.delete(blockId);
            return { 
                loadingBlocks: newMap, 
                isGlobalLoading: newMap.size > 0 
            };
        });
    },

    updateLoadingMessage: (blockId, message) => {
        set((state) => {
            const existing = state.loadingBlocks.get(blockId);
            if (!existing) return state;
            
            const newMap = new Map(state.loadingBlocks);
            newMap.set(blockId, { ...existing, message });
            return { loadingBlocks: newMap };
        });
    },

    isBlockLoading: (blockId) => {
        return get().loadingBlocks.has(blockId);
    },

    getBlockLoadingState: (blockId) => {
        return get().loadingBlocks.get(blockId);
    },

    clearAll: () => {
        set({ loadingBlocks: new Map(), isGlobalLoading: false });
    },

    setGlobalLoading: (loading) => {
        set({ isGlobalLoading: loading });
    },
}));

/**
 * Hook to get loading state for a specific block
 * @story EPIC-42-03 - Block-specific loading animation
 */
export function useBlockLoadingState(blockId: string) {
    return useAILoadingStore((state) => state.loadingBlocks.get(blockId));
}

/**
 * Hook to check if any AI generation is in progress
 */
export function useIsAnyAILoading() {
    return useAILoadingStore((state) => state.loadingBlocks.size > 0);
}
