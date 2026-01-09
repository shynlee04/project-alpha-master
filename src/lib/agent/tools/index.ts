/**
 * @fileoverview AI Agent Tools - Public Exports
 * @module lib/agent/tools
 * 
 * Exports TanStack AI tool definitions for file and terminal operations.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-2 - Implement File Tools
 * @story 25-3 - Implement Terminal Tools
 * @story 25-4 - Wire Tool Execution to UI
 */

// Types
export * from './types';
import { createSearchNotesClientTool } from './search-notes-tool';

// Tool parser (Story 2-3)
export {
    createToolCallBuffer,
    parseToolCallChunks,
    type ToolCallBuffer,
    type ToolCallChunk,
    type BufferedToolCall,
    type PendingToolCallInfo,
    type ParseResult,
    type BufferStats,
    type ToolCallBufferOptions,
} from './tool-parser';

// File tool definitions (Story 25-2)
export { readFileDef, createReadFileTool, createReadFileClientTool } from './read-file-tool';
export { writeFileDef, writeFileToolConfig, createWriteFileTool, createWriteFileClientTool } from './write-file-tool';
export { listFilesDef, createListFilesTool, createListFilesClientTool } from './list-files-tool';

// Terminal tool definitions (Story 25-3)
export { executeCommandDef, executeCommandToolConfig, createExecuteCommandTool, createExecuteCommandClientTool } from './execute-command-tool';

// Note tool definitions (Story 26-3)
export { searchNotesDef, createSearchNotesClientTool } from './search-notes-tool';

// Knowledge synthesis tool definitions (EPIC-38)
export { synthesizeDef, createSynthesizeClientTool } from './synthesize-tool';
export { processPDFDef, createProcessPDFClientTool } from './process-pdf-tool';
export { processImageDef, createProcessImageClientTool } from './process-image-tool';
export { processURLDef, createProcessURLClientTool } from './process-url-tool';

// Voice I/O tool definitions (EPIC-40, MM-05, MM-06)
export {
    voiceInputDef,
    createVoiceInputClientTool,
    transcribeAudio,
    quickTranscribe,
    SUPPORTED_AUDIO_FORMATS,
    TRANSCRIPTION_PROVIDERS,
    SUPPORTED_LANGUAGES,
    type VoiceInputConfig,
    type VoiceInputInput,
    type VoiceInputOutput,
} from './voice-input-tool';
export {
    voiceOutputDef,
    createVoiceOutputClientTool,
    generateTextToSpeech,
    quickSpeak,
    playAudioFromBase64,
    TTS_PROVIDERS,
    OPENAI_VOICES,
    GEMINI_VOICES,
    TTS_FORMATS,
    type VoiceOutputConfig,
    type VoiceOutputInput,
    type VoiceOutputOutput,
} from './voice-output-tool';

// Re-export facades for convenience
export type { AgentFileTools, AgentTerminalTools, AgentKnowledgeTools } from '../facades';

/**
 * Create all file tools with a shared facade provider (server-side)
 */
export function createFileTools(getTools: () => import('../facades').AgentFileTools) {
    const { createReadFileTool } = require('./read-file-tool');
    const { createWriteFileTool } = require('./write-file-tool');
    const { createListFilesTool } = require('./list-files-tool');

    return {
        readFile: createReadFileTool(getTools),
        writeFile: createWriteFileTool(getTools),
        listFiles: createListFilesTool(getTools),
    };
}

/**
 * Create all terminal tools with a shared facade provider (server-side)
 */
export function createTerminalTools(getTools: () => import('../facades').AgentTerminalTools) {
    const { createExecuteCommandTool } = require('./execute-command-tool');

    return {
        executeCommand: createExecuteCommandTool(getTools),
    };
}

/**
 * Create all client-side file tools with a shared facade provider
 * Uses TanStack AI .client() pattern for browser execution
 * 
 * @param getTools - Function to get the file tools facade
 * @story 25-4 - Wire Tool Execution to UI
 */
export function createFileClientTools(getTools: () => import('../facades').AgentFileTools) {
    const { createReadFileClientTool } = require('./read-file-tool');
    const { createWriteFileClientTool } = require('./write-file-tool');
    const { createListFilesClientTool } = require('./list-files-tool');

    return {
        readFile: createReadFileClientTool(getTools),
        writeFile: createWriteFileClientTool(getTools),
        listFiles: createListFilesClientTool(getTools),
    };
}

/**
 * Create all client-side terminal tools with a shared facade provider
 * Uses TanStack AI .client() pattern for browser execution
 *
 * @param getTools - Function to get the terminal tools facade
 * @story 25-4 - Wire Tool Execution to UI
 */
export function createTerminalClientTools(getTools: () => import('../facades').AgentTerminalTools) {
    const { createExecuteCommandClientTool } = require('./execute-command-tool');

    return {
        executeCommand: createExecuteCommandClientTool(getTools),
    };
}

/**
 * Create all knowledge tools with a shared facade provider
 * Uses TanStack AI .client() pattern for browser execution
 *
 * @param getTools - Function to get the knowledge tools facade
 * @governance EPIC-38
 * @story KSI Agent Integration
 */
export function createKnowledgeClientTools(getTools: () => import('../facades').AgentKnowledgeTools) {
    const { createSynthesizeClientTool } = require('./synthesize-tool');
    const { createProcessPDFClientTool } = require('./process-pdf-tool');
    const { createProcessImageClientTool } = require('./process-image-tool');
    const { createProcessURLClientTool } = require('./process-url-tool');

    return {
        synthesize: createSynthesizeClientTool(getTools),
        processPDF: createProcessPDFClientTool(getTools),
        processImage: createProcessImageClientTool(getTools),
        processURL: createProcessURLClientTool(getTools),
    };
}

/**
 * Create all voice I/O tools
 * Uses TanStack AI .client() pattern for browser execution
 *
 * @governance EPIC-40
 * @story MM-05, MM-06 - Voice Input/Output Tools
 */
export function createVoiceClientTools() {
    const { createVoiceInputClientTool } = require('./voice-input-tool');
    const { createVoiceOutputClientTool } = require('./voice-output-tool');

    return {
        voiceInput: createVoiceInputClientTool(),
        voiceOutput: createVoiceOutputClientTool(),
    };
}

/**
 * Returns an array of all client-side tools for use with TanStack AI chat
 *
 * @param fileTools - Function to get file tools facade
 * @param terminalTools - Function to get terminal tools facade
 * @param knowledgeTools - Function to get knowledge tools facade (optional)
 * @param includeVoice - Whether to include voice I/O tools (optional, default: true)
 * @story 25-4 - Wire Tool Execution to UI
 * @governance EPIC-38, EPIC-40
 */
export function getClientTools(
    fileTools: () => import('../facades').AgentFileTools,
    terminalTools: () => import('../facades').AgentTerminalTools,
    knowledgeTools?: () => import('../facades').AgentKnowledgeTools,
    includeVoice: boolean = true
) {
    const ft = createFileClientTools(fileTools);
    const tt = createTerminalClientTools(terminalTools);

    const tools = [
        ft.readFile,
        ft.writeFile,
        ft.listFiles,
        tt.executeCommand,
        createSearchNotesClientTool(),
    ];

    // Add knowledge tools if provided
    if (knowledgeTools) {
        const kt = createKnowledgeClientTools(knowledgeTools);
        tools.push(
            kt.synthesize,
            kt.processPDF,
            kt.processImage,
            kt.processURL
        );
    }

    // Add voice tools if enabled
    if (includeVoice) {
        const vt = createVoiceClientTools();
        tools.push(
            vt.voiceInput,
            vt.voiceOutput
        );
    }

    return tools;
}

