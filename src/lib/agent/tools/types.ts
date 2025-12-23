/**
 * @fileoverview AI Tool Type Definitions
 * @module lib/agent/tools/types
 * 
 * Types for TanStack AI tool definitions.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-2 - Implement File Tools
 */

import { z } from 'zod';

/**
 * Tool execution result
 */
export interface ToolResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Tool configuration options
 */
export interface ToolConfig {
    /** Tool requires user approval before execution */
    needsApproval?: boolean;
    /** Tool timeout in milliseconds */
    timeout?: number;
    /** Tool description for LLM context */
    description?: string;
}

/**
 * Context passed to tool execution
 */
export interface ToolExecutionContext {
    /** Current project path */
    projectPath: string;
    /** User's preferred language */
    language?: 'en' | 'vi';
}

// ============================================================================
// File Tool Schemas (Zod)
// ============================================================================

/**
 * Schema for read_file tool input
 */
export const ReadFileInputSchema = z.object({
    path: z.string().describe('Relative file path to read'),
});
export type ReadFileInput = z.infer<typeof ReadFileInputSchema>;

/**
 * Schema for write_file tool input
 */
export const WriteFileInputSchema = z.object({
    path: z.string().describe('Relative file path to write'),
    content: z.string().describe('Content to write to the file'),
});
export type WriteFileInput = z.infer<typeof WriteFileInputSchema>;

/**
 * Schema for list_files tool input
 */
export const ListFilesInputSchema = z.object({
    path: z.string().describe('Directory path to list (relative)'),
    recursive: z.boolean().optional().describe('Whether to list recursively'),
});
export type ListFilesInput = z.infer<typeof ListFilesInputSchema>;

// ============================================================================
// File Tool Output Types
// ============================================================================

/**
 * Output for read_file tool
 */
export interface ReadFileOutput {
    content: string;
    encoding: 'utf-8' | 'base64';
    size: number;
}

/**
 * Output for write_file tool
 */
export interface WriteFileOutput {
    path: string;
    bytesWritten: number;
}

/**
 * Entry in directory listing
 */
export interface FileEntry {
    name: string;
    path: string;
    type: 'file' | 'directory';
    size?: number;
}

/**
 * Output for list_files tool
 */
export interface ListFilesOutput {
    path: string;
    entries: FileEntry[];
}

// ============================================================================
// Terminal Tool Schemas (Zod) - Story 25-3
// ============================================================================

/**
 * Schema for execute_command tool input
 */
export const ExecuteCommandInputSchema = z.object({
    command: z.string().describe('Command to run (e.g., npm, node, cat)'),
    args: z.array(z.string()).optional().describe('Command arguments'),
    timeout: z.number().optional().describe('Timeout in milliseconds (default: 120000)'),
    cwd: z.string().optional().describe('Working directory'),
});
export type ExecuteCommandInput = z.infer<typeof ExecuteCommandInputSchema>;

// ============================================================================
// Terminal Tool Output Types - Story 25-3
// ============================================================================

/**
 * Output for execute_command tool
 */
export interface ExecuteCommandOutput {
    stdout: string;
    exitCode: number;
    pid: string;
}
