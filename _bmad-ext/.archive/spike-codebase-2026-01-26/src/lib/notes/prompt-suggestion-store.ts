/**
 * @fileoverview AI Prompt Suggestion Store
 * @module lib/notes/prompt-suggestion-store
 * @created 2026-01-13
 * @story 43-04: AI prompt suggestion based on context
 *
 * Manages AI-suggested prompts based on current note content.
 * Provides suggestions to help users find relevant AI commands.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================================
// Types
// ============================================================================

/**
 * AI-suggested prompt based on note content analysis
 */
export interface PromptSuggestion {
    id: string;
    title: string;
    titleVi?: string;
    description: string;
    descriptionVi?: string;
    suggestedPrompt: string;  // The actual prompt to use
    category: 'analysis' | 'writing' | 'productivity' | 'improvement' | 'question';
    confidence: number;  // 0-100, how confident AI is about this suggestion
    matchedKeywords: string[];  // Keywords that triggered this suggestion
    createdAt: number;
}

/**
 * Store state for prompt suggestions
 */
export interface PromptSuggestionStoreState {
    // State
    suggestions: PromptSuggestion[];
    isLoading: boolean;
    lastAnalyzedAt: number | null;
    isEnabled: boolean;
    lastNoteContent: string;  // Cache of last analyzed content

    // Actions
    setSuggestions: (suggestions: PromptSuggestion[]) => void;
    setLoading: (loading: boolean) => void;
    clearSuggestions: () => void;
    updateLastAnalyzed: (timestamp: number) => void;
    setEnabled: (enabled: boolean) => void;
    setLastNoteContent: (content: string) => void;

    // Selectors
    getSuggestionsByCategory: (category: PromptSuggestion['category']) => PromptSuggestion[];
    getTopSuggestions: (limit?: number) => PromptSuggestion[];
    hasFreshSuggestions: (content: string, maxAgeMs?: number) => boolean;
}

// ============================================================================
// Store
// ============================================================================

export const usePromptSuggestionStore = create<PromptSuggestionStoreState>()(
    persist(
        (set, get) => ({
            suggestions: [],
            isLoading: false,
            lastAnalyzedAt: null,
            isEnabled: true,
            lastNoteContent: '',

            setSuggestions: (suggestions) => {
                set({ suggestions, lastAnalyzedAt: Date.now() });
            },

            setLoading: (isLoading) => {
                set({ isLoading });
            },

            clearSuggestions: () => {
                set({ suggestions: [], lastAnalyzedAt: null });
            },

            updateLastAnalyzed: (timestamp) => {
                set({ lastAnalyzedAt: timestamp });
            },

            setEnabled: (enabled) => {
                set({ isEnabled: enabled });
            },

            setLastNoteContent: (content) => {
                set({ lastNoteContent: content });
            },

            // Selectors
            getSuggestionsByCategory: (category) => {
                return get().suggestions.filter((s) => s.category === category);
            },

            getTopSuggestions: (limit = 5) => {
                return get().suggestions
                    .sort((a, b) => b.confidence - a.confidence)
                    .slice(0, limit);
            },

            hasFreshSuggestions: (content, maxAgeMs = 5 * 60 * 1000) => {
                const { lastAnalyzedAt, suggestions, lastNoteContent } = get();
                
                if (!lastAnalyzedAt || suggestions.length === 0) {
                    return false;
                }

                const isRecent = Date.now() - lastAnalyzedAt < maxAgeMs;
                const isSameContent = content === lastNoteContent;

                return isRecent && isSameContent;
            },
        }),
        {
            name: 'via-gent-prompt-suggestions',
            partialize: (state) => ({
                isEnabled: state.isEnabled,
            }),
        }
    )
);