/**
 * @fileoverview Knowledge Store Tests
 * @module lib/state/__tests__/knowledge-store.test
 * @governance EPIC-6-2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKnowledgeStore } from '../knowledge-store';
import { db } from '@/lib/state/dexie-db';

// Mock Dexie database
vi.mock('@/lib/state/dexie-db', () => ({
    db: {
        sources: {
            where: vi.fn(() => ({
                equals: vi.fn(() => ({
                    toArray: vi.fn(),
                })),
            })),
            delete: vi.fn(),
        },
    },
}));

// Mock DexieStorage
vi.mock('../dexie-storage', () => ({
    createDexieStorage: vi.fn(() => ({
        getItem: vi.fn(() => Promise.resolve(null)),
        setItem: vi.fn(() => Promise.resolve()),
        removeItem: vi.fn(() => Promise.resolve()),
    })),
}));

describe('KnowledgeStore', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        vi.clearAllMocks();

        // Reset store before each test
        const { result } = renderHook(() => useKnowledgeStore());
        act(() => {
            result.current.reset();
        });
    });

    describe('Initial State', () => {
        it('should have empty sources array', () => {
            const { result } = renderHook(() => useKnowledgeStore());
            expect(result.current.sources).toEqual([]);
        });

        it('should have no selected source', () => {
            const { result } = renderHook(() => useKnowledgeStore());
            expect(result.current.selectedSource).toBeNull();
        });

        it('should have preview closed', () => {
            const { result } = renderHook(() => useKnowledgeStore());
            expect(result.current.isPreviewOpen).toBe(false);
        });

        it('should have hydrated flag', () => {
            const { result } = renderHook(() => useKnowledgeStore());
            expect(typeof result.current._hasHydrated).toBe('boolean');
        });
    });

    describe('loadSources', () => {
        it('should load sources for project', async () => {
            const mockSources = [
                {
                    id: 'source-1',
                    projectId: 'project-1',
                    type: 'pdf' as const,
                    title: 'Test PDF',
                    content: 'Test content',
                    wordCount: 100,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
                {
                    id: 'source-2',
                    projectId: 'project-1',
                    type: 'url' as const,
                    title: 'Test URL',
                    content: 'URL content',
                    url: 'https://example.com',
                    wordCount: 200,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            ];

            const toArrayMock = vi.fn().mockResolvedValue(mockSources);
            vi.mocked(db.sources.where).mockReturnValue({
                equals: vi.fn().mockReturnValue({ toArray: toArrayMock }),
            } as any);

            const { result } = renderHook(() => useKnowledgeStore());

            await act(async () => {
                await result.current.loadSources('project-1');
            });

            expect(result.current.sources).toEqual(mockSources);
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBeNull();
        });

        it('should set loading state during fetch', async () => {
            const toArrayMock = vi.fn(() => new Promise(resolve => setTimeout(() => resolve([]), 100)));
            vi.mocked(db.sources.where).mockReturnValue({
                equals: vi.fn().mockReturnValue({ toArray: toArrayMock }),
            } as any);

            const { result } = renderHook(() => useKnowledgeStore());

            const loadPromise = act(() => {
                result.current.loadSources('project-1');
            });

            // Should be loading immediately after call
            expect(result.current.loading).toBe(true);

            await loadPromise;
        });

        it('should handle load errors', async () => {
            const error = new Error('Database error');
            const toArrayMock = vi.fn().mockRejectedValue(error);
            vi.mocked(db.sources.where).mockReturnValue({
                equals: vi.fn().mockReturnValue({ toArray: toArrayMock }),
            } as any);

            const { result } = renderHook(() => useKnowledgeStore());

            await act(async () => {
                await result.current.loadSources('project-1');
            });

            expect(result.current.error).toBe('Database error');
            expect(result.current.loading).toBe(false);
        });
    });

    describe('selectSource', () => {
        it('should select a source', () => {
            const mockSource = {
                id: 'source-1',
                projectId: 'project-1',
                type: 'pdf' as const,
                title: 'Test PDF',
                content: 'Test content',
                wordCount: 100,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            const { result } = renderHook(() => useKnowledgeStore());

            act(() => {
                result.current.selectSource(mockSource);
            });

            expect(result.current.selectedSource).toEqual(mockSource);
        });

        it('should allow deselecting by passing null', () => {
            const mockSource = {
                id: 'source-1',
                projectId: 'project-1',
                type: 'pdf' as const,
                title: 'Test PDF',
                content: 'Test content',
                wordCount: 100,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            const { result } = renderHook(() => useKnowledgeStore());

            act(() => {
                result.current.selectSource(mockSource);
            });

            expect(result.current.selectedSource).toEqual(mockSource);

            act(() => {
                result.current.selectSource(null);
            });

            expect(result.current.selectedSource).toBeNull();
        });
    });

    describe('openPreview', () => {
        it('should open preview with source', () => {
            const mockSource = {
                id: 'source-1',
                projectId: 'project-1',
                type: 'pdf' as const,
                title: 'Test PDF',
                content: 'Test content',
                wordCount: 100,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            const { result } = renderHook(() => useKnowledgeStore());

            act(() => {
                result.current.openPreview(mockSource);
            });

            expect(result.current.isPreviewOpen).toBe(true);
            expect(result.current.selectedSource).toEqual(mockSource);
        });
    });

    describe('closePreview', () => {
        it('should close preview and clear selected source', () => {
            const mockSource = {
                id: 'source-1',
                projectId: 'project-1',
                type: 'pdf' as const,
                title: 'Test PDF',
                content: 'Test content',
                wordCount: 100,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            const { result } = renderHook(() => useKnowledgeStore());

            act(() => {
                result.current.openPreview(mockSource);
            });

            expect(result.current.isPreviewOpen).toBe(true);
            expect(result.current.selectedSource).toEqual(mockSource);

            act(() => {
                result.current.closePreview();
            });

            expect(result.current.isPreviewOpen).toBe(false);
            expect(result.current.selectedSource).toBeNull();
        });
    });

    describe('deleteSource', () => {
        it('should delete source from database and store', async () => {
            const mockSources = [
                {
                    id: 'source-1',
                    projectId: 'project-1',
                    type: 'pdf' as const,
                    title: 'Test PDF',
                    content: 'Test content',
                    wordCount: 100,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
                {
                    id: 'source-2',
                    projectId: 'project-1',
                    type: 'url' as const,
                    title: 'Test URL',
                    content: 'URL content',
                    url: 'https://example.com',
                    wordCount: 200,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            ];

            const toArrayMock = vi.fn().mockResolvedValue(mockSources);
            vi.mocked(db.sources.where).mockReturnValue({
                equals: vi.fn().mockReturnValue({ toArray: toArrayMock }),
            } as any);
            vi.mocked(db.sources.delete).mockResolvedValue(undefined);

            const { result } = renderHook(() => useKnowledgeStore());

            // Load sources first
            await act(async () => {
                await result.current.loadSources('project-1');
            });

            expect(result.current.sources).toHaveLength(2);

            // Delete one source
            await act(async () => {
                await result.current.deleteSource('source-1');
            });

            expect(db.sources.delete).toHaveBeenCalledWith('source-1');
            expect(result.current.sources).toHaveLength(1);
            expect(result.current.sources[0].id).toBe('source-2');
        });

        it('should handle delete errors', async () => {
            const error = new Error('Delete failed');
            vi.mocked(db.sources.delete).mockRejectedValue(error);

            const { result } = renderHook(() => useKnowledgeStore());

            await act(async () => {
                await result.current.deleteSource('source-1');
            });

            expect(result.current.error).toBe('Delete failed');
        });

        it('should clear selected source if it was deleted', async () => {
            const mockSources = [
                {
                    id: 'source-1',
                    projectId: 'project-1',
                    type: 'pdf' as const,
                    title: 'Test PDF',
                    content: 'Test content',
                    wordCount: 100,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            ];

            const toArrayMock = vi.fn().mockResolvedValue(mockSources);
            vi.mocked(db.sources.where).mockReturnValue({
                equals: vi.fn().mockReturnValue({ toArray: toArrayMock }),
            } as any);
            vi.mocked(db.sources.delete).mockResolvedValue(undefined);

            const { result } = renderHook(() => useKnowledgeStore());

            // Load and select source
            await act(async () => {
                await result.current.loadSources('project-1');
            });

            act(() => {
                result.current.openPreview(mockSources[0]);
            });

            expect(result.current.selectedSource).toEqual(mockSources[0]);
            expect(result.current.isPreviewOpen).toBe(true);

            // Delete the selected source
            await act(async () => {
                await result.current.deleteSource('source-1');
            });

            expect(result.current.selectedSource).toBeNull();
            expect(result.current.isPreviewOpen).toBe(false);
        });
    });

    describe('reset', () => {
        it('should reset store to initial state', () => {
            const mockSource = {
                id: 'source-1',
                projectId: 'project-1',
                type: 'pdf' as const,
                title: 'Test PDF',
                content: 'Test content',
                wordCount: 100,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            const { result } = renderHook(() => useKnowledgeStore());

            act(() => {
                result.current.openPreview(mockSource);
            });

            expect(result.current.isPreviewOpen).toBe(true);
            expect(result.current.selectedSource).toEqual(mockSource);

            act(() => {
                result.current.reset();
            });

            expect(result.current.sources).toEqual([]);
            expect(result.current.selectedSource).toBeNull();
            expect(result.current.isPreviewOpen).toBe(false);
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBeNull();
        });
    });

    describe('setHasHydrated', () => {
        it('should set hydration flag', () => {
            const { result } = renderHook(() => useKnowledgeStore());

            act(() => {
                result.current.setHasHydrated(true);
            });

            expect(result.current._hasHydrated).toBe(true);
        });
    });
});
