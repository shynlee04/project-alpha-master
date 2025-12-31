/**
 * @fileoverview Agent Tool Factory
 * @module lib/agent/factory
 * 
 * Factory for creating AI agent tools with dependency injection.
 * Uses TanStack AI toolDefinition.client() pattern for browser-local operations.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-4 - Wire Tool Execution to UI
 */

import { clientTools } from '@tanstack/ai-client';
import type { AgentFileTools, AgentTerminalTools, AgentKnowledgeTools } from './facades';
import { readFileDef } from './tools/read-file-tool';
import { writeFileDef } from './tools/write-file-tool';
import { listFilesDef } from './tools/list-files-tool';
import { executeCommandDef } from './tools/execute-command-tool';
import { synthesizeDef, type SynthesizeInput } from './tools/synthesize-tool';
import { processPDFDef, type ProcessPDFInput } from './tools/process-pdf-tool';
import { processImageDef, type ProcessImageInput } from './tools/process-image-tool';
import { processURLDef, type ProcessURLInput } from './tools/process-url-tool';
import type { WorkspaceEventEmitter } from '../events/workspace-events';
import type {
    ReadFileInput,
    WriteFileInput,
    ListFilesInput,
    ExecuteCommandInput,
} from './tools/types';

/**
 * Options for creating the agent tool factory
 */
export interface ToolFactoryOptions {
    /** Get the file tools facade (lazy initialization) */
    getFileTools: () => AgentFileTools | null;
    /** Get the terminal tools facade (lazy initialization) */
    getTerminalTools: () => AgentTerminalTools | null;
    /** Get the knowledge tools facade (lazy initialization) - EPIC-38 */
    getKnowledgeTools?: () => AgentKnowledgeTools | null;
    /** Get the workspace event emitter */
    getEventBus: () => WorkspaceEventEmitter | null;
    /** Model ID for agent configuration (optional - uses agent's default if not provided) */
    modelId?: string;
}

/**
 * Tool call information for UI rendering
 */
export interface ToolCallInfo {
    id: string;
    name: string;
    input: Record<string, unknown>;
    /** Alias for input - for compatibility */
    args?: Record<string, unknown>;
    status: 'pending' | 'executing' | 'completed' | 'error';
    result?: unknown;
    error?: string;
    startedAt: Date;
    completedAt?: Date;
}

/**
 * Create client-side file tools
 * Uses TanStack AI toolDefinition.client() pattern per official docs
 */
export function createClientFileTools(options: ToolFactoryOptions) {
    const { getFileTools, getEventBus } = options;

    // read_file - client implementation
    // Note: .client() expects (args: unknown) => any, we cast inside the handler
    const readFile = readFileDef.client(async (args: unknown) => {
        const input = args as ReadFileInput;
        const tools = getFileTools();
        if (!tools) {
            return {
                success: false,
                error: 'No project folder opened. Please open a folder using the "Open Folder" button before I can access files.',
                code: 'WORKSPACE_NOT_READY'
            };
        }

        try {
            const content = await tools.readFile(input.path);
            if (content === null) {
                return { success: false, error: `File not found: ${input.path}` };
            }
            return { success: true, data: { content, encoding: 'utf-8', size: content.length } };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Read failed' };
        }
    });

    // write_file - client implementation (approval handled by Story 25-5)
    const writeFile = writeFileDef.client(async (args: unknown) => {
        const input = args as WriteFileInput;
        const tools = getFileTools();
        if (!tools) {
            return {
                success: false,
                error: 'No project folder opened. Please open a folder using the "Open Folder" button before I can modify files.',
                code: 'WORKSPACE_NOT_READY'
            };
        }

        try {
            await tools.writeFile(input.path, input.content);

            // Emit event for UI update
            const eventBus = getEventBus();
            eventBus?.emit('file:modified', {
                path: input.path,
                source: 'agent',
                content: input.content,
            });

            return { success: true, data: { path: input.path, bytesWritten: input.content.length } };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Write failed' };
        }
    });

    // list_files - client implementation
    const listFiles = listFilesDef.client(async (args: unknown) => {
        const input = args as ListFilesInput;
        const tools = getFileTools();
        if (!tools) {
            return {
                success: false,
                error: 'No project folder opened. Please open a folder using the "Open Folder" button before I can list files.',
                code: 'WORKSPACE_NOT_READY'
            };
        }

        try {
            const files = await tools.listDirectory(input.path, input.recursive);
            return { success: true, data: { files, count: files.length } };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'List failed' };
        }
    });

    return { readFile, writeFile, listFiles };
}

/**
 * Create client-side terminal tools
 */
export function createClientTerminalTools(options: ToolFactoryOptions) {
    const { getTerminalTools, getEventBus } = options;

    // execute_command - client implementation
    const executeCommand = executeCommandDef.client(async (args: unknown) => {
        const input = args as ExecuteCommandInput;
        const tools = getTerminalTools();
        if (!tools) {
            return { success: false, error: 'Terminal tools not available' };
        }

        try {
            const eventBus = getEventBus();

            // Emit start event
            eventBus?.emit('process:started', {
                pid: '0', // Will be updated by actual command
                command: input.command,
                args: input.args || [],
            });

            const result = await tools.executeCommand(
                input.command,
                input.args || [],
                {
                    cwd: input.cwd,
                    timeout: input.timeout || 120000, // 2-minute timeout
                }
            );

            // Emit exit event
            eventBus?.emit('process:exited', {
                pid: result.pid,
                exitCode: result.exitCode,
            });

            return {
                success: result.exitCode === 0,
                data: {
                    stdout: result.stdout,
                    exitCode: result.exitCode,
                    pid: result.pid,
                },
            };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Command failed' };
        }
    });

    return { executeCommand };
}

/**
 * Create client-side knowledge tools
 * EPIC-38 - KSI Module
 */
export function createClientKnowledgeTools(options: ToolFactoryOptions) {
    const { getKnowledgeTools } = options;

    if (!getKnowledgeTools) {
        return {
            synthesize: null,
            processPDF: null,
            processImage: null,
            processURL: null,
        };
    }

    // synthesize_knowledge - client implementation
    const synthesize = synthesizeDef.client(async (args: unknown) => {
        const input = args as SynthesizeInput;
        const tools = getKnowledgeTools();
        if (!tools) {
            return {
                success: false,
                error: 'Knowledge tools not available. Please ensure your agent is configured with knowledge synthesis capabilities.',
                code: 'KNOWLEDGE_TOOLS_NOT_READY'
            };
        }

        try {
            const result = await tools.synthesize(input);
            return {
                success: true,
                data: {
                    synthesisId: result.id,
                    sourceId: result.sourceId,
                    frontmatter: result.frontmatter,
                    timestamp: result.timestamp,
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Synthesis failed'
            };
        }
    });

    // process_pdf - client implementation
    const processPDF = processPDFDef.client(async (args: unknown) => {
        const input = args as ProcessPDFInput;
        const tools = getKnowledgeTools();
        if (!tools) {
            return {
                success: false,
                error: 'Knowledge tools not available',
                code: 'KNOWLEDGE_TOOLS_NOT_READY'
            };
        }

        try {
            const result = await tools.processPDF(input.file, input.base64Content, input.options);
            return { success: true, data: result };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'PDF processing failed'
            };
        }
    });

    // process_image - client implementation
    const processImage = processImageDef.client(async (args: unknown) => {
        const input = args as ProcessImageInput;
        const tools = getKnowledgeTools();
        if (!tools) {
            return {
                success: false,
                error: 'Knowledge tools not available',
                code: 'KNOWLEDGE_TOOLS_NOT_READY'
            };
        }

        try {
            const result = await tools.processImage(input.file, input.base64Content, input.options);
            return { success: true, data: result };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Image processing failed'
            };
        }
    });

    // process_url - client implementation
    const processURL = processURLDef.client(async (args: unknown) => {
        const input = args as ProcessURLInput;
        const tools = getKnowledgeTools();
        if (!tools) {
            return {
                success: false,
                error: 'Knowledge tools not available',
                code: 'KNOWLEDGE_TOOLS_NOT_READY'
            };
        }

        try {
            const result = await tools.processURL(input.url, input.htmlContent, input.options);
            return { success: true, data: result };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'URL processing failed'
            };
        }
    });

    return {
        synthesize,
        processPDF,
        processImage,
        processURL,
    };
}

/**
 * Create all client tools for useChat integration
 * Uses TanStack AI clientTools() helper for type-safe tool arrays
 * 
 * @example
 * ```tsx
 * const agentTools = createAgentClientTools({
 *     getFileTools: () => fileToolsFacade,
 *     getTerminalTools: () => terminalToolsFacade,
 *     getEventBus: () => eventBus,
 * });
 * 
 * const chatOptions = createChatClientOptions({
 *     connection: fetchServerSentEvents('/api/chat'),
 *     tools: agentTools.getClientTools(),
 * });
 * 
 * const { messages } = useChat(chatOptions);
 * ```
 */
export function createAgentClientTools(options: ToolFactoryOptions) {
    const fileTools = createClientFileTools(options);
    const terminalTools = createClientTerminalTools(options);
    const knowledgeTools = createClientKnowledgeTools(options);

    return {
        fileTools,
        terminalTools,
        knowledgeTools,
        /** All tools as array for useChat */
        all: [
            fileTools.readFile,
            fileTools.writeFile,
            fileTools.listFiles,
            terminalTools.executeCommand,
            ...(knowledgeTools.synthesize ? [knowledgeTools.synthesize] : []),
            ...(knowledgeTools.processPDF ? [knowledgeTools.processPDF] : []),
            ...(knowledgeTools.processImage ? [knowledgeTools.processImage] : []),
            ...(knowledgeTools.processURL ? [knowledgeTools.processURL] : []),
        ],
        /** Get clientTools() wrapped array for createChatClientOptions */
        getClientTools() {
            const tools = clientTools(
                fileTools.readFile,
                fileTools.writeFile,
                fileTools.listFiles,
                terminalTools.executeCommand
            );

            // Add knowledge tools if available
            if (knowledgeTools.synthesize) {
                tools.push(knowledgeTools.synthesize);
            }
            if (knowledgeTools.processPDF) {
                tools.push(knowledgeTools.processPDF);
            }
            if (knowledgeTools.processImage) {
                tools.push(knowledgeTools.processImage);
            }
            if (knowledgeTools.processURL) {
                tools.push(knowledgeTools.processURL);
            }

            return tools;
        },
    };
}

/**
 * Check if tools are available (workspace loaded)
 */
export function isToolsAvailable(options: ToolFactoryOptions): boolean {
    const hasFileTools = options.getFileTools() !== null;
    const hasTerminalTools = options.getTerminalTools() !== null;
    const hasKnowledgeTools = options.getKnowledgeTools ? options.getKnowledgeTools() !== null : true; // Optional

    return hasFileTools && hasTerminalTools && hasKnowledgeTools;
}

// Re-export for convenience
export { clientTools };
export type { ToolFactoryOptions as ToolFactoryConfig };
