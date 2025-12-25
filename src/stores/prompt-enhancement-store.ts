/**
 * @fileoverview Prompt Enhancement Store
 * @module stores/prompt-enhancement-store
 * 
 * Manages the state for the User's Prompt Auto Enhancement feature.
 * Persists the user's preference for enabling/disabling the feature.
 * 
 * @epic MVP - AI Coding Agent Vertical Slice
 * @story Prompt Auto Enhancement
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PromptEnhancementState {
    isEnabled: boolean;
    toggle: () => void;
    setEnabled: (value: boolean) => void;
}

export const usePromptEnhancementStore = create<PromptEnhancementState>()(
    persist(
        (set) => ({
            isEnabled: false,
            toggle: () => set((state) => ({ isEnabled: !state.isEnabled })),
            setEnabled: (value) => set({ isEnabled: value }),
        }),
        {
            name: 'prompt-enhancement-storage',
        }
    )
);
