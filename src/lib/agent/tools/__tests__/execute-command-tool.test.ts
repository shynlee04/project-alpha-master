/**
 * @fileoverview Execute Command Tool Tests
 * @module lib/agent/tools/__tests__/execute-command-tool.test
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-3 - Implement Terminal Tools
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock TanStack AI - capture the server handler
let capturedHandler: ((args: unknown) => Promise<any>) | null = null;
vi.mock('@tanstack/ai', () => ({
    toolDefinition: vi.fn(() => ({
        name: 'execute_command',
        description: 'Execute a terminal command',
        server: vi.fn((handler: (args: unknown) => Promise<any>) => {
            capturedHandler = handler;
            return handler;
        }),
    })),
}));

import { executeCommandDef, executeCommandToolConfig, createExecuteCommandTool } from '../execute-command-tool';
import type { AgentTerminalTools } from '../../facades';

describe('executeCommandDef', () => {
    it('should have correct tool name', () => {
        expect(executeCommandDef.name).toBe('execute_command');
    });

    it('should have description', () => {
        expect(executeCommandDef.description).toContain('terminal');
    });
});

describe('executeCommandToolConfig', () => {
    it('should require approval (Story 25-5)', () => {
        expect(executeCommandToolConfig.needsApproval).toBe(true);
    });

    it('should have high risk level', () => {
        expect(executeCommandToolConfig.riskLevel).toBe('high');
    });

    it('should have 2-minute timeout', () => {
        expect(executeCommandToolConfig.timeout).toBe(120000);
    });
});

describe('createExecuteCommandTool', () => {
    let mockTools: AgentTerminalTools;
    let executeCommand: ReturnType<typeof createExecuteCommandTool>;

    beforeEach(() => {
        mockTools = {
            executeCommand: vi.fn(),
            startShell: vi.fn(),
            killProcess: vi.fn(),
            isRunning: vi.fn(),
        };
        executeCommand = createExecuteCommandTool(() => mockTools);
    });

    it('should execute command successfully', async () => {
        vi.mocked(mockTools.executeCommand).mockResolvedValue({
            stdout: 'Hello World',
            exitCode: 0,
            pid: 'test-pid-123',
        });

        const result = await (executeCommand as any)({
            command: 'echo',
            args: ['Hello', 'World'],
        });

        expect(result.success).toBe(true);
        expect(result.data?.stdout).toBe('Hello World');
        expect(result.data?.exitCode).toBe(0);
        expect(result.data?.pid).toBe('test-pid-123');
    });

    it('should return error for non-zero exit code', async () => {
        vi.mocked(mockTools.executeCommand).mockResolvedValue({
            stdout: 'Error: file not found',
            exitCode: 1,
            pid: 'test-pid-456',
        });

        const result = await (executeCommand as any)({
            command: 'cat',
            args: ['nonexistent.txt'],
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('exit');
        expect(result.data?.exitCode).toBe(1);
    });

    it('should pass timeout to facade', async () => {
        vi.mocked(mockTools.executeCommand).mockResolvedValue({
            stdout: '',
            exitCode: 0,
            pid: 'pid',
        });

        await (executeCommand as any)({
            command: 'npm',
            args: ['install'],
            timeout: 60000,
        });

        expect(mockTools.executeCommand).toHaveBeenCalledWith(
            'npm',
            ['install'],
            { timeout: 60000, cwd: undefined }
        );
    });

    it('should use default timeout if not specified', async () => {
        vi.mocked(mockTools.executeCommand).mockResolvedValue({
            stdout: '',
            exitCode: 0,
            pid: 'pid',
        });

        await (executeCommand as any)({
            command: 'ls',
        });

        expect(mockTools.executeCommand).toHaveBeenCalledWith(
            'ls',
            [],
            { timeout: 120000, cwd: undefined }
        );
    });

    it('should handle execution errors', async () => {
        vi.mocked(mockTools.executeCommand).mockRejectedValue(
            new Error('WebContainer not booted')
        );

        const result = await (executeCommand as any)({
            command: 'echo',
            args: ['test'],
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('WebContainer not booted');
    });

    it('should pass cwd to facade', async () => {
        vi.mocked(mockTools.executeCommand).mockResolvedValue({
            stdout: '',
            exitCode: 0,
            pid: 'pid',
        });

        await (executeCommand as any)({
            command: 'npm',
            args: ['run', 'build'],
            cwd: '/project/src',
        });

        expect(mockTools.executeCommand).toHaveBeenCalledWith(
            'npm',
            ['run', 'build'],
            { timeout: 120000, cwd: '/project/src' }
        );
    });
});
