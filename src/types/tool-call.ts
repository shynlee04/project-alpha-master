/**
 * Tool Call Type Definitions
 *
 * @epic Epic-28 Story 28-19
 * @integrates Epic-25 Story 25-1 - TanStack AI ToolCallStreamChunk structure
 * @integrates Epic-6 Story 6-X - Tool execution events
 * @integrates Epic-12 Story 12-X - Tool registry definitions
 *
 * @description
 * Type definitions for tool calls in the Via-Gent IDE chat interface.
 * These types are designed to match TanStack AI's streaming protocol
 * while supporting the pixel aesthetic UI requirements.
 *
 * @roadmap
 * - Epic 25: Will wire to actual TanStack AI ToolCallStreamChunk events
 * - Epic 26: Will integrate with LangGraph.js multi-agent orchestration
 */

/**
 * Status of a tool call execution
 */
export type ToolCallStatus = 'pending' | 'running' | 'success' | 'error';

/**
 * Tool call representation for UI display
 *
 * @remarks
 * Structure mirrors TanStack AI's ToolCallStreamChunk.toolCall but
 * with parsed arguments and added status tracking for UI feedback.
 */
export interface ToolCall {
    /** Unique identifier for the tool call (matches TanStack AI toolCall.id) */
    id: string;

    /** Tool function name (e.g., "read_file", "write_file", "execute_command") */
    name: string;

    /** Parsed arguments passed to the tool */
    arguments?: Record<string, unknown>;

    /** Current execution status for UI feedback */
    status: ToolCallStatus;

    /** Index for parallel tool calls (matches TanStack AI index) */
    index?: number;

    /** Execution duration in milliseconds (available after completion) */
    duration?: number;

    /** Error message if status is 'error' */
    error?: string;
}

/**
 * Props for ToolCallBadge component
 */
export interface ToolCallBadgeProps {
    /** Tool function name (e.g., "read_file") */
    name: string;

    /** Current execution status */
    status: ToolCallStatus;

    /** Parsed arguments for tooltip display */
    arguments?: Record<string, unknown>;

    /** Execution duration in milliseconds */
    duration?: number;

    /** Whether to show expanded arguments */
    expanded?: boolean;

    /** Callback when badge is clicked */
    onClick?: () => void;

    /** Additional CSS classes */
    className?: string;
}

/**
 * Tool category for icon mapping
 */
export type ToolCategory =
    | 'read'      // read_file, list_files, search_files
    | 'write'     // write_file, create_file
    | 'execute'   // execute_command, run_script
    | 'search'    // search_files, find_files
    | 'default';  // unknown tools

/**
 * Get tool category from tool name
 *
 * @param name - Tool function name
 * @returns Tool category for icon mapping
 */
export function getToolCategory(name: string): ToolCategory {
    const lowerName = name.toLowerCase();

    if (lowerName.includes('read') || lowerName.includes('list')) {
        return 'read';
    }
    if (lowerName.includes('write') || lowerName.includes('create')) {
        return 'write';
    }
    if (lowerName.includes('execute') || lowerName.includes('run') || lowerName.includes('command')) {
        return 'execute';
    }
    if (lowerName.includes('search') || lowerName.includes('find')) {
        return 'search';
    }

    return 'default';
}
