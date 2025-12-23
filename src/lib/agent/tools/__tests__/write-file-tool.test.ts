/**
 * @fileoverview Write File Tool Tests
 * @module lib/agent/tools/__tests__/write-file-tool.test
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-2 - Implement File Tools
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { writeFileDef, writeFileToolConfig, createWriteFileTool } from '../write-file-tool';
import type { AgentFileTools } from '../../facades';

describe('writeFileDef', () => {
    it('should have correct tool name', () => {
        expect(writeFileDef.name).toBe('write_file');
    });

    it('should have description mentioning approval', () => {
        expect(writeFileDef.description).toContain('approval');
    });
});

describe('writeFileToolConfig', () => {
    it('should require approval', () => {
        expect(writeFileToolConfig.needsApproval).toBe(true);
    });

    it('should have timeout configured', () => {
        expect(writeFileToolConfig.timeout).toBe(30000);
    });
});

describe('createWriteFileTool', () => {
    let mockTools: AgentFileTools;
    let writeFile: ReturnType<typeof createWriteFileTool>;

    beforeEach(() => {
        mockTools = {
            readFile: vi.fn(),
            writeFile: vi.fn(),
            listDirectory: vi.fn(),
            createFile: vi.fn(),
            deleteFile: vi.fn(),
            searchFiles: vi.fn(),
        };
        writeFile = createWriteFileTool(() => mockTools);
    });

    it('should write file content successfully', async () => {
        vi.mocked(mockTools.writeFile).mockResolvedValue(undefined);

        const result = await (writeFile as any)({
            path: 'test.txt',
            content: 'new content',
        });

        expect(result.success).toBe(true);
        expect(result.data?.path).toBe('test.txt');
        expect(result.data?.bytesWritten).toBe(11);
    });

    it('should handle write errors', async () => {
        vi.mocked(mockTools.writeFile).mockRejectedValue(new Error('Permission denied'));

        const result = await (writeFile as any)({
            path: 'protected.txt',
            content: 'content',
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Permission denied');
    });

    it('should call facade with correct arguments', async () => {
        vi.mocked(mockTools.writeFile).mockResolvedValue(undefined);

        await (writeFile as any)({
            path: 'src/new-file.ts',
            content: 'export const foo = 1;',
        });

        expect(mockTools.writeFile).toHaveBeenCalledWith(
            'src/new-file.ts',
            'export const foo = 1;'
        );
    });
});
