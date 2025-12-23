/**
 * @fileoverview Read File Tool Tests
 * @module lib/agent/tools/__tests__/read-file-tool.test
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-2 - Implement File Tools
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock TanStack AI - capture the server handler
let capturedHandler: ((args: unknown) => Promise<any>) | null = null;
vi.mock('@tanstack/ai', () => ({
    toolDefinition: vi.fn(() => ({
        name: 'read_file',
        description: 'Read file',
        server: vi.fn((handler: (args: unknown) => Promise<any>) => {
            capturedHandler = handler;
            return handler; // Return handler as callable
        }),
    })),
}));

import { readFileDef, createReadFileTool } from '../read-file-tool';
import type { AgentFileTools } from '../../facades';

describe('readFileDef', () => {
    it('should have correct tool name', () => {
        expect(readFileDef.name).toBe('read_file');
    });

    it('should have description', () => {
        expect(readFileDef.description).toBeDefined();
    });
});

describe('createReadFileTool', () => {
    let mockTools: AgentFileTools;
    let readFile: ReturnType<typeof createReadFileTool>;

    beforeEach(() => {
        mockTools = {
            readFile: vi.fn(),
            writeFile: vi.fn(),
            listDirectory: vi.fn(),
            createFile: vi.fn(),
            deleteFile: vi.fn(),
            searchFiles: vi.fn(),
        };
        readFile = createReadFileTool(() => mockTools);
    });

    it('should read file content successfully', async () => {
        vi.mocked(mockTools.readFile).mockResolvedValue('file content');

        const result = await (readFile as any)({ path: 'test.txt' });

        expect(result.success).toBe(true);
        expect(result.data?.content).toBe('file content');
        expect(result.data?.encoding).toBe('utf-8');
    });

    it('should return error for non-existent file', async () => {
        vi.mocked(mockTools.readFile).mockResolvedValue(null);

        const result = await (readFile as any)({ path: 'nonexistent.txt' });

        expect(result.success).toBe(false);
        expect(result.error).toContain('not found');
    });

    it('should return file size', async () => {
        vi.mocked(mockTools.readFile).mockResolvedValue('12345');

        const result = await (readFile as any)({ path: 'test.txt' });

        expect(result.data?.size).toBe(5);
    });

    it('should handle read errors', async () => {
        vi.mocked(mockTools.readFile).mockRejectedValue(new Error('Permission denied'));

        const result = await (readFile as any)({ path: 'protected.txt' });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Permission denied');
    });
});
