/**
 * @fileoverview Prompt History Store - Track prompt usage and analytics
 * @module lib/notes/prompt-history-store
 * @story 43-06: Prompt History/Analytics
 * @created 2026-01-12
 * 
 * Tracks AI prompt usage, success/failure rates, and provides analytics.
 * Persists to localStorage with Zustand persist middleware.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CommandCategory } from './slash-command-store';

// ============================================================================
// Types
// ============================================================================

export type PromptStatus = 'success' | 'error' | 'cancelled';

export interface PromptHistoryEntry {
    id: string;
    commandId: string | null; // null for custom/one-off prompts
    commandName: string;
    prompt: string;
    promptPreview: string; // First 100 chars for display
    category?: CommandCategory;
    status: PromptStatus;
    errorMessage?: string;
    executionTimeMs: number;
    tokenCount?: number; // If available from API
    contextLength: number; // Character count of context
    outputLength?: number; // Character count of output
    timestamp: number;
    noteId?: string;
    isFavorite: boolean;
}

export interface PromptAnalytics {
    totalPrompts: number;
    successRate: number; // 0-100
    averageExecutionTime: number; // ms
    promptsByCategory: Record<CommandCategory | 'custom', number>;
    promptsByDay: { date: string; count: number }[]; // Last 30 days
    topCommands: { commandName: string; count: number; successRate: number }[];
    totalTokensUsed: number;
    recentTrend: 'up' | 'down' | 'stable'; // Compared to previous period
}

export interface PromptHistoryStoreState {
    history: PromptHistoryEntry[];
    maxHistorySize: number; // Limit to prevent excessive storage
    
    // Actions
    recordPrompt: (entry: Omit<PromptHistoryEntry, 'id' | 'timestamp' | 'promptPreview' | 'isFavorite'>) => string;
    updatePromptStatus: (id: string, status: PromptStatus, errorMessage?: string) => void;
    updatePromptOutput: (id: string, outputLength: number, tokenCount?: number) => void;
    toggleFavorite: (id: string) => void;
    clearHistory: () => void;
    deleteEntry: (id: string) => void;
    
    // Selectors
    getRecentHistory: (limit?: number) => PromptHistoryEntry[];
    getFavorites: () => PromptHistoryEntry[];
    getHistoryByCategory: (category: CommandCategory | 'custom') => PromptHistoryEntry[];
    getHistoryByCommand: (commandName: string) => PromptHistoryEntry[];
    getAnalytics: () => PromptAnalytics;
    getCommandStats: (commandName: string) => { usageCount: number; successRate: number; avgTime: number };
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateId(): string {
    return `ph-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function createPreview(prompt: string): string {
    const cleaned = prompt.replace(/\s+/g, ' ').trim();
    return cleaned.length > 100 ? cleaned.substring(0, 97) + '...' : cleaned;
}

function getDateKey(timestamp: number): string {
    return new Date(timestamp).toISOString().split('T')[0];
}

// ============================================================================
// Store
// ============================================================================

export const usePromptHistoryStore = create<PromptHistoryStoreState>()(
    persist(
        (set, get) => ({
            history: [],
            maxHistorySize: 500, // Keep last 500 prompts
            
            // Record a new prompt execution
            recordPrompt: (entry) => {
                const id = generateId();
                const newEntry: PromptHistoryEntry = {
                    ...entry,
                    id,
                    timestamp: Date.now(),
                    promptPreview: createPreview(entry.prompt),
                    isFavorite: false,
                };
                
                set((state) => {
                    const newHistory = [newEntry, ...state.history];
                    // Trim history if too large
                    if (newHistory.length > state.maxHistorySize) {
                        // Keep favorites even when trimming
                        const favorites = newHistory.filter(e => e.isFavorite);
                        const nonFavorites = newHistory.filter(e => !e.isFavorite);
                        const trimmedNonFavorites = nonFavorites.slice(0, state.maxHistorySize - favorites.length);
                        return { history: [...favorites, ...trimmedNonFavorites].sort((a, b) => b.timestamp - a.timestamp) };
                    }
                    return { history: newHistory };
                });
                
                return id;
            },
            
            // Update prompt status (success/error/cancelled)
            updatePromptStatus: (id, status, errorMessage) => {
                set((state) => ({
                    history: state.history.map((entry) =>
                        entry.id === id
                            ? { ...entry, status, errorMessage }
                            : entry
                    ),
                }));
            },
            
            // Update prompt output metrics
            updatePromptOutput: (id, outputLength, tokenCount) => {
                set((state) => ({
                    history: state.history.map((entry) =>
                        entry.id === id
                            ? { ...entry, outputLength, tokenCount }
                            : entry
                    ),
                }));
            },
            
            // Toggle favorite status
            toggleFavorite: (id) => {
                set((state) => ({
                    history: state.history.map((entry) =>
                        entry.id === id
                            ? { ...entry, isFavorite: !entry.isFavorite }
                            : entry
                    ),
                }));
            },
            
            // Clear all history
            clearHistory: () => {
                set({ history: [] });
            },
            
            // Delete single entry
            deleteEntry: (id) => {
                set((state) => ({
                    history: state.history.filter((entry) => entry.id !== id),
                }));
            },
            
            // Get recent history
            getRecentHistory: (limit = 50) => {
                return get().history.slice(0, limit);
            },
            
            // Get favorites
            getFavorites: () => {
                return get().history.filter((e) => e.isFavorite);
            },
            
            // Get history by category
            getHistoryByCategory: (category) => {
                return get().history.filter((e) => 
                    category === 'custom' 
                        ? !e.category || e.category === 'custom'
                        : e.category === category
                );
            },
            
            // Get history by command name
            getHistoryByCommand: (commandName) => {
                return get().history.filter((e) => e.commandName === commandName);
            },
            
            // Get command-specific stats
            getCommandStats: (commandName) => {
                const entries = get().history.filter((e) => e.commandName === commandName);
                if (entries.length === 0) {
                    return { usageCount: 0, successRate: 0, avgTime: 0 };
                }
                
                const successCount = entries.filter((e) => e.status === 'success').length;
                const totalTime = entries.reduce((sum, e) => sum + e.executionTimeMs, 0);
                
                return {
                    usageCount: entries.length,
                    successRate: Math.round((successCount / entries.length) * 100),
                    avgTime: Math.round(totalTime / entries.length),
                };
            },
            
            // Get comprehensive analytics
            getAnalytics: () => {
                const { history } = get();
                
                // Basic stats
                const totalPrompts = history.length;
                const successCount = history.filter((e) => e.status === 'success').length;
                const successRate = totalPrompts > 0 ? Math.round((successCount / totalPrompts) * 100) : 0;
                const avgTime = totalPrompts > 0
                    ? Math.round(history.reduce((sum, e) => sum + e.executionTimeMs, 0) / totalPrompts)
                    : 0;
                
                // Prompts by category
                const promptsByCategory: Record<string, number> = {
                    writing: 0,
                    analysis: 0,
                    productivity: 0,
                    communication: 0,
                    technical: 0,
                    creative: 0,
                    custom: 0,
                };
                history.forEach((e) => {
                    const cat = e.category || 'custom';
                    promptsByCategory[cat] = (promptsByCategory[cat] || 0) + 1;
                });
                
                // Prompts by day (last 30 days)
                const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                const recentHistory = history.filter((e) => e.timestamp > thirtyDaysAgo);
                const dailyCounts: Record<string, number> = {};
                recentHistory.forEach((e) => {
                    const dateKey = getDateKey(e.timestamp);
                    dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
                });
                const promptsByDay = Object.entries(dailyCounts)
                    .map(([date, count]) => ({ date, count }))
                    .sort((a, b) => a.date.localeCompare(b.date));
                
                // Top commands
                const commandCounts: Record<string, { count: number; success: number }> = {};
                history.forEach((e) => {
                    if (!commandCounts[e.commandName]) {
                        commandCounts[e.commandName] = { count: 0, success: 0 };
                    }
                    commandCounts[e.commandName].count++;
                    if (e.status === 'success') {
                        commandCounts[e.commandName].success++;
                    }
                });
                const topCommands = Object.entries(commandCounts)
                    .map(([commandName, { count, success }]) => ({
                        commandName,
                        count,
                        successRate: Math.round((success / count) * 100),
                    }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10);
                
                // Total tokens
                const totalTokensUsed = history.reduce((sum, e) => sum + (e.tokenCount || 0), 0);
                
                // Recent trend (compare last 7 days to previous 7 days)
                const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
                const fourteenDaysAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
                const last7Days = history.filter((e) => e.timestamp > sevenDaysAgo).length;
                const prev7Days = history.filter((e) => e.timestamp > fourteenDaysAgo && e.timestamp <= sevenDaysAgo).length;
                let recentTrend: 'up' | 'down' | 'stable' = 'stable';
                if (last7Days > prev7Days * 1.2) recentTrend = 'up';
                else if (last7Days < prev7Days * 0.8) recentTrend = 'down';
                
                return {
                    totalPrompts,
                    successRate,
                    averageExecutionTime: avgTime,
                    promptsByCategory: promptsByCategory as Record<CommandCategory | 'custom', number>,
                    promptsByDay,
                    topCommands,
                    totalTokensUsed,
                    recentTrend,
                };
            },
        }),
        {
            name: 'via-gent-prompt-history',
            // Only persist essential fields to save storage
            partialize: (state) => ({
                history: state.history,
                maxHistorySize: state.maxHistorySize,
            }),
        }
    )
);

// ============================================================================
// Integration Helper for executeAICommand
// ============================================================================

/**
 * Helper to track prompt execution in the history store.
 * Call at the start of executeAICommand and update status on completion.
 */
export function startPromptTracking(
    commandName: string,
    prompt: string,
    options?: {
        commandId?: string | null;
        category?: CommandCategory;
        contextLength?: number;
        noteId?: string;
    }
): { historyId: string; startTime: number } {
    const historyId = usePromptHistoryStore.getState().recordPrompt({
        commandId: options?.commandId ?? null,
        commandName,
        prompt,
        category: options?.category,
        status: 'success', // Will be updated on completion
        executionTimeMs: 0, // Will be updated on completion
        contextLength: options?.contextLength ?? 0,
        noteId: options?.noteId,
    });
    
    return { historyId, startTime: Date.now() };
}

/**
 * Complete prompt tracking with final status and metrics.
 */
export function completePromptTracking(
    historyId: string,
    startTime: number,
    status: PromptStatus,
    options?: {
        errorMessage?: string;
        outputLength?: number;
        tokenCount?: number;
    }
): void {
    const executionTimeMs = Date.now() - startTime;
    const { updatePromptStatus, updatePromptOutput } = usePromptHistoryStore.getState();
    
    // Update status
    updatePromptStatus(historyId, status, options?.errorMessage);
    
    // Update execution time (need to do it separately since updatePromptStatus doesn't include it)
    usePromptHistoryStore.setState((state) => ({
        history: state.history.map((entry) =>
            entry.id === historyId
                ? { ...entry, executionTimeMs }
                : entry
        ),
    }));
    
    // Update output metrics if available
    if (options?.outputLength !== undefined) {
        updatePromptOutput(historyId, options.outputLength, options.tokenCount);
    }
}
