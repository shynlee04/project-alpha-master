import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSearchNotesClientTool } from '../search-notes-tool';
import { searchNotes } from '@/lib/notes/note-retriever';

// Mock note-retriever
vi.mock('@/lib/notes/note-retriever', () => ({
    searchNotes: vi.fn(),
}));

describe('search_notes tool', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should search notes and return formatted results', async () => {
        const mockResults = [
            { id: '1', title: 'React Notes', content: 'React is a library...', score: 0.9 },
        ];
        (searchNotes as any).mockResolvedValue(mockResults);

        const tool = createSearchNotesClientTool();
        // Use type assertion or access .implementation() if dependent on internals, 
        // but .client() usually returns an object with execute().
        // TanStack AI tool definition structure: .client() => { ... implementation ... } ?
        // Actually .client() defines the implementation used by the client runtime.
        // The return value of createSearchNotesClientTool() IS the tool implementation (function).
        // Wait, createSearchNotesClientTool returns: `searchNotesDef.client(...)`.
        // searchNotesDef.client returns a `ClientTool` object which usually has `type`, `execute`, etc?
        // Let's verify standard TanStack AI usage.
        // In `read-file-tool.ts`: return readFileDef.client(...)
        // Looking at usage in `useAgent.ts` (hypothetically), it's likely passed to the chat context.

        // For testing purposes, we assume the returned object is callable or has execute.
        // TanStack AI 0.2.0: tool.client(...) returns a tool definition compatible with the AI SDK.
        // Let's assume we can call the implementation function directly if we extract it, 
        // OR likely the object returned has `execute` method validation wrapper.
        // I'll assume standard tool signature: `execute(args)`.

        // If the returned value is just the definition, we might need to test the inner function.
        // But since it's an integration test of our wrapper, calling execute is best.

        // Adjusting for potential type:
        // The returned value from .client() is likely the tool instance.
        // Let's try calling execute.
        const result = await (tool as any).execute({ query: 'React', limit: 2 });

        expect(searchNotes).toHaveBeenCalledWith('React', 2);
        expect(result.success).toBe(true);
        expect(result.data).toContain('[Note: React Notes]');
        expect(result.data).toContain('(Score: 0.90)');
        expect(result.data).toContain('React is a library...');
    });

    it('should handle no results', async () => {
        (searchNotes as any).mockResolvedValue([]);

        const tool = createSearchNotesClientTool();
        const result = await (tool as any).execute({ query: 'Quantum Physics', limit: 5 });

        expect(result.success).toBe(true);
        expect(result.data).toContain('No matching notes found');
    });

    it('should handle errors', async () => {
        (searchNotes as any).mockRejectedValue(new Error('Search failed'));

        const tool = createSearchNotesClientTool();
        const result = await (tool as any).execute({ query: 'Error', limit: 1 });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Search failed');
    });
});
