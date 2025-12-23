/**
 * @fileoverview List Files Tool Tests
 * @module lib/agent/tools/__tests__/list-files-tool.test
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-2 - Implement File Tools
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock TanStack AI - capture the server handler
let capturedHandler: ((args: unknown) => Promise<any>) | null = null;
vi.mock('@tanstack/ai', () => ({
    toolDefinition: vi.fn(() => ({
        name: 'list_files',
        description: 'List files',
        server: vi.fn((handler: (args: unknown) => Promise<any>) => {
            capturedHandler = handler;
            return handler;
        }),
    })),
}));

import { listFilesDef, createListFilesTool } from '../list-files-tool';
import type { AgentFileTools } from '../../facades';

describe('listFilesDef', () => {
    it('should have correct tool name', () => {
        expect(listFilesDef.name).toBe('list_files');
    });

    it('should have description', () => {
        expect(listFilesDef.description).toContain('List');
    });
});

describe('createListFilesTool', () => {
    let mockTools: AgentFileTools;
    let listFiles: ReturnType<typeof createListFilesTool>;

    beforeEach(() => {
        mockTools = {
            readFile: vi.fn(),
            writeFile: vi.fn(),
            listDirectory: vi.fn(),
            createFile: vi.fn(),
            deleteFile: vi.fn(),
            searchFiles: vi.fn(),
        };
        listFiles = createListFilesTool(() => mockTools);
    });

    it('should list directory contents successfully', async () => {
        vi.mocked(mockTools.listDirectory).mockResolvedValue([
            { name: 'file1.ts', path: 'src/file1.ts', type: 'file' },
            { name: 'folder1', path: 'src/folder1', type: 'directory' },
        ]);

        const result = await (listFiles as any)({ path: 'src' });

        expect(result.success).toBe(true);
        expect(result.data?.entries).toHaveLength(2);
    });

    it('should sort directories before files', async () => {
        vi.mocked(mockTools.listDirectory).mockResolvedValue([
            { name: 'z-file.ts', path: 'src/z-file.ts', type: 'file' },
            { name: 'a-dir', path: 'src/a-dir', type: 'directory' },
            { name: 'a-file.ts', path: 'src/a-file.ts', type: 'file' },
        ]);

        const result = await (listFiles as any)({ path: 'src' });

        expect(result.data?.entries[0].name).toBe('a-dir');
        expect(result.data?.entries[0].type).toBe('directory');
        expect(result.data?.entries[1].name).toBe('a-file.ts');
    });

    it('should include correct paths in entries', async () => {
        vi.mocked(mockTools.listDirectory).mockResolvedValue([
            { name: 'test.ts', path: 'src/lib/test.ts', type: 'file' },
        ]);

        const result = await (listFiles as any)({ path: 'src/lib' });

        expect(result.data?.entries[0].path).toBe('src/lib/test.ts');
    });

    it('should handle list errors', async () => {
        vi.mocked(mockTools.listDirectory).mockRejectedValue(new Error('Directory not found'));

        const result = await (listFiles as any)({ path: 'nonexistent' });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Directory not found');
    });

    it('should call facade with correct path', async () => {
        vi.mocked(mockTools.listDirectory).mockResolvedValue([]);

        await (listFiles as any)({ path: 'src/components' });

        expect(mockTools.listDirectory).toHaveBeenCalledWith('src/components', undefined);
    });
});
