/**
 * @fileoverview List Files Tool Tests
 * @module lib/agent/tools/__tests__/list-files-tool.test
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-2 - Implement File Tools
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
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
            { name: 'file1.ts', kind: 'file' },
            { name: 'folder1', kind: 'directory' },
        ] as any);

        const result = await (listFiles as any)({ path: 'src' });

        expect(result.success).toBe(true);
        expect(result.data?.entries).toHaveLength(2);
    });

    it('should sort directories before files', async () => {
        vi.mocked(mockTools.listDirectory).mockResolvedValue([
            { name: 'z-file.ts', kind: 'file' },
            { name: 'a-dir', kind: 'directory' },
            { name: 'a-file.ts', kind: 'file' },
        ] as any);

        const result = await (listFiles as any)({ path: 'src' });

        expect(result.data?.entries[0].name).toBe('a-dir');
        expect(result.data?.entries[0].type).toBe('directory');
        expect(result.data?.entries[1].name).toBe('a-file.ts');
    });

    it('should include correct paths in entries', async () => {
        vi.mocked(mockTools.listDirectory).mockResolvedValue([
            { name: 'test.ts', kind: 'file' },
        ] as any);

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
