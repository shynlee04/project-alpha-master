/**
 * @fileoverview Agent Tool Factory Tests
 * @module lib/agent/__tests__/factory.test
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-4 - Wire Tool Execution to UI
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAgentClientTools, createClientFileTools, createClientTerminalTools, isToolsAvailable, type ToolFactoryOptions } from '../factory';
import type { AgentFileTools, AgentTerminalTools } from '../facades';
import type { WorkspaceEventEmitter } from '../../events/workspace-events';

// Mock the tool definitions
vi.mock('../tools/read-file-tool', () => ({
    readFileDef: {
        client: vi.fn((handler: (args: unknown) => unknown) => ({
            name: 'read_file',
            handler,
        })),
    },
}));

vi.mock('../tools/write-file-tool', () => ({
    writeFileDef: {
        client: vi.fn((handler: (args: unknown) => unknown) => ({
            name: 'write_file',
            handler,
        })),
    },
}));

vi.mock('../tools/list-files-tool', () => ({
    listFilesDef: {
        client: vi.fn((handler: (args: unknown) => unknown) => ({
            name: 'list_files',
            handler,
        })),
    },
}));

vi.mock('../tools/execute-command-tool', () => ({
    executeCommandDef: {
        client: vi.fn((handler: (args: unknown) => unknown) => ({
            name: 'execute_command',
            handler,
        })),
    },
}));

vi.mock('@tanstack/ai-client', () => ({
    clientTools: vi.fn((...tools: unknown[]) => tools),
}));

describe('Agent Tool Factory', () => {
    let mockFileTools: AgentFileTools;
    let mockTerminalTools: AgentTerminalTools;
    let mockEventBus: WorkspaceEventEmitter;
    let factoryOptions: ToolFactoryOptions;

    beforeEach(() => {
        vi.clearAllMocks();

        mockFileTools = {
            readFile: vi.fn().mockResolvedValue('file content'),
            writeFile: vi.fn().mockResolvedValue(undefined),
            createFile: vi.fn().mockResolvedValue(undefined),
            deleteFile: vi.fn().mockResolvedValue(undefined),
            listDirectory: vi.fn().mockResolvedValue([
                { name: 'file.ts', kind: 'file' },
                { name: 'folder', kind: 'directory' },
            ]),
            searchFiles: vi.fn().mockResolvedValue([]),
        };

        mockTerminalTools = {
            executeCommand: vi.fn().mockResolvedValue({
                stdout: 'command output',
                exitCode: 0,
                pid: 'pid-123',
            }),
            startShell: vi.fn(),
            killProcess: vi.fn(),
            isRunning: vi.fn().mockReturnValue(false),
        };

        mockEventBus = {
            emit: vi.fn(),
            on: vi.fn(),
            off: vi.fn(),
        } as unknown as WorkspaceEventEmitter;

        factoryOptions = {
            getFileTools: () => mockFileTools,
            getTerminalTools: () => mockTerminalTools,
            getEventBus: () => mockEventBus,
        };
    });

    describe('createAgentClientTools', () => {
        it('should create all four tools', () => {
            const tools = createAgentClientTools(factoryOptions);

            expect(tools.fileTools.readFile).toBeDefined();
            expect(tools.fileTools.writeFile).toBeDefined();
            expect(tools.fileTools.listFiles).toBeDefined();
            expect(tools.terminalTools.executeCommand).toBeDefined();
        });

        it('should return all tools in all array', () => {
            const tools = createAgentClientTools(factoryOptions);

            expect(tools.all).toHaveLength(4);
        });

        it('should wrap tools with clientTools helper', () => {
            const tools = createAgentClientTools(factoryOptions);
            const wrapped = tools.getClientTools();

            // clientTools is mocked to return the tools array
            expect(wrapped).toHaveLength(4);
        });
    });

    describe('createClientFileTools', () => {
        it('should create read, write, and list tools', () => {
            const fileTools = createClientFileTools(factoryOptions);

            expect(fileTools.readFile).toBeDefined();
            expect(fileTools.writeFile).toBeDefined();
            expect(fileTools.listFiles).toBeDefined();
        });
    });

    describe('createClientTerminalTools', () => {
        it('should create execute command tool', () => {
            const terminalTools = createClientTerminalTools(factoryOptions);

            expect(terminalTools.executeCommand).toBeDefined();
        });
    });

    describe('isToolsAvailable', () => {
        it('should return true when all tools available', () => {
            expect(isToolsAvailable(factoryOptions)).toBe(true);
        });

        it('should return false when file tools null', () => {
            const nullOptions: ToolFactoryOptions = {
                getFileTools: () => null,
                getTerminalTools: () => mockTerminalTools,
                getEventBus: () => mockEventBus,
            };

            expect(isToolsAvailable(nullOptions)).toBe(false);
        });

        it('should return false when terminal tools null', () => {
            const nullOptions: ToolFactoryOptions = {
                getFileTools: () => mockFileTools,
                getTerminalTools: () => null,
                getEventBus: () => mockEventBus,
            };

            expect(isToolsAvailable(nullOptions)).toBe(false);
        });

        it('should return false when both null', () => {
            const nullOptions: ToolFactoryOptions = {
                getFileTools: () => null,
                getTerminalTools: () => null,
                getEventBus: () => null,
            };

            expect(isToolsAvailable(nullOptions)).toBe(false);
        });
    });
});
