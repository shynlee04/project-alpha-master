/**
 * BMAD Beast Mode v2.0.0 - Context Gathering Gate Plugin
 * 
 * Prevents Trap 1 (Blind Charge): Agent writes code without reading context.
 * Blocks `write` operations if no `read` operation has occurred first.
 * 
 * @location .opencode/plugins/pre-execution/context-gathering-gate.ts
 * @version 1.0.0
 * @date 2026-01-29
 */

// ============================================================================
// PLUGIN TYPE DEFINITION
// ============================================================================

interface PluginContext {
    session_id: string
    agent_id: string
    config: Record<string, any>
}

interface ToolInput {
    tool: string
    args: Record<string, any>
}

interface HookResult {
    proceed: boolean
    error?: string
}

type HookHandler = (input: ToolInput) => Promise<HookResult>

interface Plugin {
    name: string
    version: string
    hooks: {
        "tool.execute.before"?: HookHandler
    }
}

// ============================================================================
// SESSION STATE
// ============================================================================

/**
 * Track whether context has been read in current session
 * This is reset per session/conversation
 */
let sessionState = {
    hasReadContext: false,
    readOperations: [] as Array<{
        tool: string
        path?: string
        timestamp: string
    }>,
    lastReadTimestamp: null as string | null
}

// ============================================================================
// READ TOOLS THAT COUNT AS CONTEXT GATHERING
// ============================================================================

const READ_TOOLS = [
    "read",
    "read_file",
    "glob",
    "grep",
    "search",
    "list_dir",
    "view_file",
    "find"
]

// ============================================================================
// WRITE TOOLS THAT REQUIRE PRIOR CONTEXT
// ============================================================================

const WRITE_TOOLS = [
    "write",
    "write_file",
    "edit",
    "edit_file",
    "patch",
    "create_file"
]

// ============================================================================
// PLUGIN IMPLEMENTATION
// ============================================================================

export const ContextGatheringGate: Plugin = {
    name: "context-gathering-gate",
    version: "1.0.0",

    hooks: {
        /**
         * Before tool execution hook
         * Blocks write operations if no read has occurred
         */
        "tool.execute.before": async (input: ToolInput): Promise<HookResult> => {
            const toolName = input.tool.toLowerCase()

            // Track read operations
            if (READ_TOOLS.some(rt => toolName.includes(rt))) {
                sessionState.hasReadContext = true
                sessionState.lastReadTimestamp = new Date().toISOString()
                sessionState.readOperations.push({
                    tool: input.tool,
                    path: input.args.path || input.args.filePath || input.args.file,
                    timestamp: sessionState.lastReadTimestamp
                })

                return { proceed: true }
            }

            // Block write operations without prior read
            if (WRITE_TOOLS.some(wt => toolName.includes(wt))) {
                if (!sessionState.hasReadContext) {
                    return {
                        proceed: false,
                        error: `GOVERNANCE BLOCK: Blind Charge detected.

You attempted to write code without first reading context.

**Required Action**: Before writing any code, you MUST:
1. Use 'read' or 'glob' to understand the codebase structure
2. Use 'grep' to find related patterns
3. Load story context via @file refs

This governance rule prevents:
- Implementing features without understanding existing patterns
- Creating code that conflicts with established architecture
- Missing dependencies and cross-cutting concerns

**How to proceed**:
1. Run \`glob "src/**/*.ts"\` to see the structure
2. Run \`grep -r "interface.*Props" src/\` to understand patterns
3. Read the relevant story artifact
4. Then retry your write operation`
                    }
                }
            }

            // Allow all other operations
            return { proceed: true }
        }
    }
}

// ============================================================================
// SESSION UTILITIES
// ============================================================================

/**
 * Reset session state (called on new session)
 */
export function resetSession(): void {
    sessionState = {
        hasReadContext: false,
        readOperations: [],
        lastReadTimestamp: null
    }
}

/**
 * Get current session state for debugging
 */
export function getSessionState(): typeof sessionState {
    return { ...sessionState }
}

/**
 * Mark context as read (for manual override in testing)
 */
export function markContextRead(): void {
    sessionState.hasReadContext = true
    sessionState.lastReadTimestamp = new Date().toISOString()
}

// Export as default for plugin loading
export default ContextGatheringGate
