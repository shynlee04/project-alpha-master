/**
 * @fileoverview Unit tests for Prompt History Store
 * @module lib/notes/__tests__/prompt-history-store.test
 * @story 43-08: Integration Tests for Prompt Engineering Hub
 * @created 2026-01-13
 *
 * Tests for history tracking, favorites, analytics, and integration helpers.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
    usePromptHistoryStore,
    startPromptTracking,
    completePromptTracking,
    type PromptHistoryEntry,
} from '../prompt-history-store';

describe('Story 43-08: Prompt History Store (43-06)', () => {
    beforeEach(() => {
        // Reset store
        usePromptHistoryStore.setState({
            history: [],
            maxHistorySize: 500,
        });
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('Recording Prompts', () => {
        it('records a new prompt entry', () => {
            const store = usePromptHistoryStore.getState();

            const id = store.recordPrompt({
                commandId: 'cmd-1',
                commandName: 'Summarize',
                prompt: 'Summarize the following text...',
                category: 'writing',
                status: 'success',
                executionTimeMs: 1500,
                contextLength: 500,
            });

            expect(id).toBeDefined();
            expect(id).toMatch(/^ph-\d+-[a-z0-9]+$/);

            const history = usePromptHistoryStore.getState().history;
            expect(history.length).toBe(1);
            expect(history[0].commandName).toBe('Summarize');
            expect(history[0].isFavorite).toBe(false);
        });

        it('generates preview from prompt', () => {
            const store = usePromptHistoryStore.getState();
            const longPrompt = 'A'.repeat(200);

            store.recordPrompt({
                commandId: null,
                commandName: 'Custom',
                prompt: longPrompt,
                status: 'success',
                executionTimeMs: 100,
                contextLength: 200,
            });

            const history = usePromptHistoryStore.getState().history;
            expect(history[0].promptPreview.length).toBeLessThanOrEqual(100);
            expect(history[0].promptPreview.endsWith('...')).toBe(true);
        });

        it('adds timestamp to entries', () => {
            const store = usePromptHistoryStore.getState();
            const beforeTime = Date.now();

            store.recordPrompt({
                commandId: null,
                commandName: 'Test',
                prompt: 'Test prompt',
                status: 'success',
                executionTimeMs: 100,
                contextLength: 10,
            });

            const history = usePromptHistoryStore.getState().history;
            expect(history[0].timestamp).toBeGreaterThanOrEqual(beforeTime);
        });

        it('prepends new entries to history', () => {
            const store = usePromptHistoryStore.getState();

            store.recordPrompt({
                commandId: null,
                commandName: 'First',
                prompt: 'First',
                status: 'success',
                executionTimeMs: 100,
                contextLength: 5,
            });

            vi.advanceTimersByTime(100);

            store.recordPrompt({
                commandId: null,
                commandName: 'Second',
                prompt: 'Second',
                status: 'success',
                executionTimeMs: 100,
                contextLength: 6,
            });

            const history = usePromptHistoryStore.getState().history;
            expect(history[0].commandName).toBe('Second');
            expect(history[1].commandName).toBe('First');
        });

        it('trims history when exceeding max size but keeps favorites', () => {
            usePromptHistoryStore.setState({ maxHistorySize: 5 });
            const store = usePromptHistoryStore.getState();

            // Add 3 entries and favorite the first one
            store.recordPrompt({
                commandId: null,
                commandName: 'Favorite',
                prompt: 'Fav',
                status: 'success',
                executionTimeMs: 100,
                contextLength: 3,
            });
            const favoriteId = usePromptHistoryStore.getState().history[0].id;
            store.toggleFavorite(favoriteId);

            // Add 5 more entries
            for (let i = 0; i < 5; i++) {
                vi.advanceTimersByTime(100);
                store.recordPrompt({
                    commandId: null,
                    commandName: `Entry ${i}`,
                    prompt: `Prompt ${i}`,
                    status: 'success',
                    executionTimeMs: 100,
                    contextLength: 5,
                });
            }

            const history = usePromptHistoryStore.getState().history;
            expect(history.length).toBeLessThanOrEqual(5);
            expect(history.some(h => h.id === favoriteId)).toBe(true);
        });
    });

    describe('Updating Entries', () => {
        it('updates prompt status', () => {
            const store = usePromptHistoryStore.getState();

            const id = store.recordPrompt({
                commandId: null,
                commandName: 'Test',
                prompt: 'Test',
                status: 'success',
                executionTimeMs: 0,
                contextLength: 4,
            });

            store.updatePromptStatus(id, 'error', 'API connection failed');

            const entry = usePromptHistoryStore.getState().history.find(h => h.id === id);
            expect(entry?.status).toBe('error');
            expect(entry?.errorMessage).toBe('API connection failed');
        });

        it('updates output metrics', () => {
            const store = usePromptHistoryStore.getState();

            const id = store.recordPrompt({
                commandId: null,
                commandName: 'Test',
                prompt: 'Test',
                status: 'success',
                executionTimeMs: 0,
                contextLength: 4,
            });

            store.updatePromptOutput(id, 1500, 250);

            const entry = usePromptHistoryStore.getState().history.find(h => h.id === id);
            expect(entry?.outputLength).toBe(1500);
            expect(entry?.tokenCount).toBe(250);
        });

        it('toggles favorite status', () => {
            const store = usePromptHistoryStore.getState();

            const id = store.recordPrompt({
                commandId: null,
                commandName: 'Test',
                prompt: 'Test',
                status: 'success',
                executionTimeMs: 100,
                contextLength: 4,
            });

            expect(usePromptHistoryStore.getState().history[0].isFavorite).toBe(false);

            store.toggleFavorite(id);
            expect(usePromptHistoryStore.getState().history[0].isFavorite).toBe(true);

            store.toggleFavorite(id);
            expect(usePromptHistoryStore.getState().history[0].isFavorite).toBe(false);
        });
    });

    describe('Deleting Entries', () => {
        it('deletes single entry', () => {
            const store = usePromptHistoryStore.getState();

            const id = store.recordPrompt({
                commandId: null,
                commandName: 'Test',
                prompt: 'Test',
                status: 'success',
                executionTimeMs: 100,
                contextLength: 4,
            });

            expect(usePromptHistoryStore.getState().history.length).toBe(1);

            store.deleteEntry(id);

            expect(usePromptHistoryStore.getState().history.length).toBe(0);
        });

        it('clears all history', () => {
            const store = usePromptHistoryStore.getState();

            // Add multiple entries
            for (let i = 0; i < 5; i++) {
                store.recordPrompt({
                    commandId: null,
                    commandName: `Entry ${i}`,
                    prompt: `Prompt ${i}`,
                    status: 'success',
                    executionTimeMs: 100,
                    contextLength: 5,
                });
            }

            expect(usePromptHistoryStore.getState().history.length).toBe(5);

            store.clearHistory();

            expect(usePromptHistoryStore.getState().history.length).toBe(0);
        });
    });

    describe('Selectors', () => {
        beforeEach(() => {
            const store = usePromptHistoryStore.getState();

            // Add diverse entries
            store.recordPrompt({
                commandId: 'cmd-1',
                commandName: 'Summarize',
                prompt: 'Summarize text',
                category: 'writing',
                status: 'success',
                executionTimeMs: 1000,
                contextLength: 100,
            });
            store.toggleFavorite(usePromptHistoryStore.getState().history[0].id);

            vi.advanceTimersByTime(100);

            store.recordPrompt({
                commandId: 'cmd-2',
                commandName: 'Analyze',
                prompt: 'Analyze data',
                category: 'analysis',
                status: 'success',
                executionTimeMs: 2000,
                contextLength: 200,
            });

            vi.advanceTimersByTime(100);

            store.recordPrompt({
                commandId: 'cmd-1',
                commandName: 'Summarize',
                prompt: 'Summarize more text',
                category: 'writing',
                status: 'error',
                executionTimeMs: 500,
                contextLength: 150,
            });
        });

        it('getRecentHistory returns limited entries', () => {
            const store = usePromptHistoryStore.getState();
            const recent = store.getRecentHistory(2);

            expect(recent.length).toBe(2);
        });

        it('getFavorites returns only favorites', () => {
            const store = usePromptHistoryStore.getState();
            const favorites = store.getFavorites();

            expect(favorites.length).toBe(1);
            expect(favorites.every(f => f.isFavorite)).toBe(true);
        });

        it('getHistoryByCategory filters by category', () => {
            const store = usePromptHistoryStore.getState();
            
            const writing = store.getHistoryByCategory('writing');
            expect(writing.every(h => h.category === 'writing')).toBe(true);
            expect(writing.length).toBe(2);

            const analysis = store.getHistoryByCategory('analysis');
            expect(analysis.length).toBe(1);
        });

        it('getHistoryByCommand filters by command name', () => {
            const store = usePromptHistoryStore.getState();
            
            const summarize = store.getHistoryByCommand('Summarize');
            expect(summarize.every(h => h.commandName === 'Summarize')).toBe(true);
            expect(summarize.length).toBe(2);
        });

        it('getCommandStats returns usage statistics', () => {
            const store = usePromptHistoryStore.getState();
            const stats = store.getCommandStats('Summarize');

            expect(stats.usageCount).toBe(2);
            expect(stats.successRate).toBe(50); // 1 success, 1 error
            expect(stats.avgTime).toBe(750); // (1000 + 500) / 2
        });

        it('getCommandStats returns zeros for unknown command', () => {
            const store = usePromptHistoryStore.getState();
            const stats = store.getCommandStats('NonExistent');

            expect(stats.usageCount).toBe(0);
            expect(stats.successRate).toBe(0);
            expect(stats.avgTime).toBe(0);
        });
    });

    describe('Analytics', () => {
        beforeEach(() => {
            const store = usePromptHistoryStore.getState();
            const now = Date.now();

            // Add entries across different days and categories
            const entries: Omit<PromptHistoryEntry, 'id' | 'timestamp' | 'promptPreview' | 'isFavorite'>[] = [
                { commandId: '1', commandName: 'Cmd1', prompt: 'p', category: 'writing', status: 'success', executionTimeMs: 1000, contextLength: 100, tokenCount: 50 },
                { commandId: '1', commandName: 'Cmd1', prompt: 'p', category: 'writing', status: 'success', executionTimeMs: 2000, contextLength: 100, tokenCount: 75 },
                { commandId: '2', commandName: 'Cmd2', prompt: 'p', category: 'analysis', status: 'error', executionTimeMs: 500, contextLength: 50 },
                { commandId: '3', commandName: 'Cmd3', prompt: 'p', category: 'technical', status: 'success', executionTimeMs: 1500, contextLength: 200, tokenCount: 100 },
            ];

            entries.forEach(entry => {
                vi.advanceTimersByTime(100);
                store.recordPrompt(entry);
            });
        });

        it('calculates total prompts', () => {
            const analytics = usePromptHistoryStore.getState().getAnalytics();
            expect(analytics.totalPrompts).toBe(4);
        });

        it('calculates success rate', () => {
            const analytics = usePromptHistoryStore.getState().getAnalytics();
            expect(analytics.successRate).toBe(75); // 3/4
        });

        it('calculates average execution time', () => {
            const analytics = usePromptHistoryStore.getState().getAnalytics();
            expect(analytics.averageExecutionTime).toBe(1250); // (1000+2000+500+1500)/4
        });

        it('counts prompts by category', () => {
            const analytics = usePromptHistoryStore.getState().getAnalytics();
            
            expect(analytics.promptsByCategory.writing).toBe(2);
            expect(analytics.promptsByCategory.analysis).toBe(1);
            expect(analytics.promptsByCategory.technical).toBe(1);
            expect(analytics.promptsByCategory.productivity).toBe(0);
        });

        it('identifies top commands', () => {
            const analytics = usePromptHistoryStore.getState().getAnalytics();
            
            expect(analytics.topCommands.length).toBeGreaterThan(0);
            expect(analytics.topCommands[0].commandName).toBe('Cmd1'); // Most used
            expect(analytics.topCommands[0].count).toBe(2);
            expect(analytics.topCommands[0].successRate).toBe(100);
        });

        it('calculates total tokens used', () => {
            const analytics = usePromptHistoryStore.getState().getAnalytics();
            expect(analytics.totalTokensUsed).toBe(225); // 50+75+0+100
        });
    });

    describe('Integration Helpers', () => {
        it('startPromptTracking creates entry and returns tracking info', () => {
            const { historyId, startTime } = startPromptTracking(
                'TestCommand',
                'Test prompt content',
                {
                    commandId: 'cmd-test',
                    category: 'writing',
                    contextLength: 100,
                }
            );

            expect(historyId).toBeDefined();
            expect(historyId).toMatch(/^ph-/);
            expect(startTime).toBeDefined();
            expect(typeof startTime).toBe('number');

            const history = usePromptHistoryStore.getState().history;
            expect(history[0].commandName).toBe('TestCommand');
            expect(history[0].category).toBe('writing');
        });

        it('completePromptTracking updates status and execution time', () => {
            const { historyId, startTime } = startPromptTracking('TestCommand', 'Test');
            
            vi.advanceTimersByTime(1500);

            completePromptTracking(historyId, startTime, 'success', {
                outputLength: 500,
                tokenCount: 100,
            });

            const entry = usePromptHistoryStore.getState().history.find(h => h.id === historyId);
            expect(entry?.status).toBe('success');
            expect(entry?.executionTimeMs).toBe(1500);
            expect(entry?.outputLength).toBe(500);
            expect(entry?.tokenCount).toBe(100);
        });

        it('completePromptTracking handles errors', () => {
            const { historyId, startTime } = startPromptTracking('TestCommand', 'Test');
            
            vi.advanceTimersByTime(500);

            completePromptTracking(historyId, startTime, 'error', {
                errorMessage: 'API rate limit exceeded',
            });

            const entry = usePromptHistoryStore.getState().history.find(h => h.id === historyId);
            expect(entry?.status).toBe('error');
            expect(entry?.errorMessage).toBe('API rate limit exceeded');
        });
    });
});
