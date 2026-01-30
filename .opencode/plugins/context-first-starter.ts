/**
 * BEAST-MODE CONTEXT STARTER PLUGIN v2.0
 * 
 * Automatically injects context-first reminders before EVERY message goes to the API.
 * 
 * RESEARCHED FROM: packages/opencode/src/session/prompt.ts (lines 1310-1350, 3475-3510)
 * 
 * HOOKS USED:
 * - experimental.chat.messages.transform: input={}, output={messages[]}
 * - experimental.chat.system.transform: input={sessionID, model}, output={system: string[]}
 * 
 * CRITICAL: output.system is an ARRAY of strings, not a single string!
 * 
 * @location .opencode/plugins/context-first-starter.ts
 * @version 2.0.0
 * @date 2026-01-30
 */

import type { Plugin } from '@opencode-ai/plugin'

// ============================================================================
// SESSION CONTEXT STORAGE
// ============================================================================

interface SessionContext {
    messageCount: number
    firstUserMessage: string | null
    lastFourTurns: Array<{ role: string; content: string }>
    filePaths: string[]
    workType: 'meta-framework' | 'project' | 'unknown'
    isPostCompact: boolean
}

const sessionContextMap = new Map<string, SessionContext>()

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    META_FRAMEWORK_PATHS: [
        '.opencode/',
        '.agent/',
        '_bmad/',
        '_bmad-output/',
        '.claude/'
    ],
    PROJECT_PATHS: [
        'src/',
        'app/',
        'packages/',
        'lib/'
    ],
    DEBUG: process.env.OPENCODE_CONTEXT_DEBUG === 'true'
}

// ============================================================================
// DEBUG LOGGING
// ============================================================================

function debugLog(message: string): void {
    if (CONFIG.DEBUG) {
        console.debug(`[context-first-starter] ${message}`)
    }
}

// ============================================================================
// MESSAGE TYPES (from OpenCode source)
// ============================================================================

interface MessagePart {
    type?: string
    text?: string
    id?: string
    messageID?: string
    synthetic?: boolean
}

interface MessageInfo {
    id?: string
    role?: string
    sessionID?: string
}

interface MessageWithParts {
    info?: MessageInfo
    parts?: MessagePart[]
    // Legacy format support
    role?: string
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function extractMessageText(message: MessageWithParts): string {
    if (!message.parts) return ''

    const texts: string[] = []
    for (const part of message.parts) {
        if (part.synthetic) continue
        if (part.type === 'text' && part.text) {
            texts.push(part.text)
        } else if (typeof part.text === 'string' && !part.type) {
            texts.push(part.text)
        }
    }
    return texts.join(' ')
}

function extractFilePaths(messages: MessageWithParts[]): string[] {
    const paths = new Set<string>()

    for (const message of messages) {
        const text = extractMessageText(message)

        const pathPatterns = [
            /file:\/\/\/([^\s)>\]]+)/g,
            /`([^`]+\.(ts|tsx|js|jsx|md|yaml|json))`/g,
            /\.opencode\/[^\s)>\]]+/g,
            /_bmad-output\/[^\s)>\]]+/g,
            /src\/[^\s)>\]]+/g
        ]

        for (const pattern of pathPatterns) {
            let match
            while ((match = pattern.exec(text)) !== null) {
                paths.add(match[1] || match[0])
            }
        }
    }

    return Array.from(paths)
}

function detectWorkType(filePaths: string[]): 'meta-framework' | 'project' | 'unknown' {
    const hasMetaFramework = filePaths.some(p =>
        CONFIG.META_FRAMEWORK_PATHS.some(mp => p.includes(mp))
    )
    const hasProject = filePaths.some(p =>
        CONFIG.PROJECT_PATHS.some(pp => p.includes(pp))
    )

    if (hasMetaFramework && !hasProject) return 'meta-framework'
    if (hasProject && !hasMetaFramework) return 'project'
    return 'unknown'
}

function detectPostCompact(messages: MessageWithParts[]): boolean {
    const text = messages.map(m => extractMessageText(m)).join(' ')
    return text.includes('compact_chain:') ||
        text.includes('state_injection:') ||
        text.includes('continuation prompt')
}

// ============================================================================
// CONTEXT-FIRST REMINDER GENERATOR
// ============================================================================

function generateContextFirstReminder(ctx: SessionContext): string {
    return `
## 🔥 BEAST-MODE CONTEXT-FIRST REMINDER (Auto-Injected)

### 1. ROLE AWARENESS
- Check your role profile in \`.opencode/agents/\`
- Act within-scope, fully participate with absolute coverage
- Coordinators DELEGATE, never execute directly

### 2. CONTEXT ANCHORING
${ctx.firstUserMessage ? `
**Original Intent (Turn 1):**
> ${ctx.firstUserMessage.slice(0, 200)}${ctx.firstUserMessage.length > 200 ? '...' : ''}
` : '- First user message not captured yet'}

**Message Count:** ${ctx.messageCount}

### 3. WORK TYPE: ${ctx.workType.toUpperCase()}
${ctx.workType === 'meta-framework' ? `
→ Working on: .opencode/, .agent/, _bmad/
→ DO NOT modify project source code
` : ctx.workType === 'project' ? `
→ Working on: src/, app/, packages/
→ Update workflow-status.yaml after completing work
` : '→ Could not determine work type'}

### 4. FILE PATHS IN CONTEXT
${ctx.filePaths.length > 0 ? ctx.filePaths.slice(0, 5).map(p => `- ${p}`).join('\n') : '- No file paths detected'}

### 5. POST-COMPACT: ${ctx.isPostCompact ? 'YES (read YAML summary at start)' : 'NO'}

### 6. GOVERNANCE
- Check AGENTS.md for constitution
- Evidence before assertions → Run commands, THEN claim success
- Use skills from \`.opencode/skills/\` for specialized work

---
`
}

// ============================================================================
// PLUGIN EXPORT
// ============================================================================

export const ContextFirstStarterPlugin: Plugin = async ({ client }) => {
    debugLog('Plugin initialized')

    return {
        /**
         * HOOK: experimental.chat.messages.transform
         * 
         * FROM SOURCE (line 3488):
         *   await Plugin.trigger("experimental.chat.messages.transform", {}, { messages: sessionMessages })
         * 
         * Input: {} (empty object)
         * Output: { messages: MessageWithParts[] }
         */
        'experimental.chat.messages.transform': async (
            _input: Record<string, never>,
            output: { messages: MessageWithParts[] }
        ) => {
            if (!output.messages || output.messages.length === 0) {
                debugLog('No messages in output')
                return
            }

            // Extract sessionID from first message that has it
            let sessionID: string | undefined
            for (const message of output.messages) {
                if (message.info?.sessionID) {
                    sessionID = message.info.sessionID
                    break
                }
            }

            if (!sessionID) {
                debugLog('No sessionID found in messages')
                return
            }

            // Get or create session context
            let ctx = sessionContextMap.get(sessionID)
            if (!ctx) {
                ctx = {
                    messageCount: 0,
                    firstUserMessage: null,
                    lastFourTurns: [],
                    filePaths: [],
                    workType: 'unknown',
                    isPostCompact: false
                }
            }

            // Find first user message
            if (!ctx.firstUserMessage) {
                for (const msg of output.messages) {
                    const role = msg.info?.role ?? msg.role
                    if (role === 'user') {
                        const text = extractMessageText(msg)
                        if (text && text.length > 10) {
                            ctx.firstUserMessage = text
                            break
                        }
                    }
                }
            }

            ctx.messageCount = output.messages.length
            ctx.filePaths = extractFilePaths(output.messages)
            ctx.workType = detectWorkType(ctx.filePaths)
            ctx.isPostCompact = detectPostCompact(output.messages)

            sessionContextMap.set(sessionID, ctx)

            debugLog(`Session ${sessionID}: ${ctx.messageCount} messages, workType=${ctx.workType}`)
        },

        /**
         * HOOK: experimental.chat.system.transform
         * 
         * FROM SOURCE (lines 1321-1327):
         *   await Plugin.trigger(
         *     "experimental.chat.system.transform",
         *     { sessionID: input.sessionID, model: input.model },
         *     { system },
         *   )
         * 
         * Input: { sessionID: string, model: ModelInfo }
         * Output: { system: string[] }  <-- ARRAY of strings!
         * 
         * CRITICAL: Push to system array, don't replace!
         */
        'experimental.chat.system.transform': async (
            input: { sessionID?: string; model?: unknown },
            output: { system: string[] }
        ) => {
            const sessionID = input?.sessionID
            if (!sessionID) {
                debugLog('No sessionID in input')
                return
            }

            const ctx = sessionContextMap.get(sessionID)
            if (!ctx) {
                debugLog(`No context for session ${sessionID}`)
                return
            }

            // Generate reminder
            const reminder = generateContextFirstReminder(ctx)

            // CRITICAL: Push to the existing system array
            if (!output.system) {
                output.system = []
            }
            output.system.push(reminder)

            debugLog(`Injected context-first reminder for session ${sessionID}`)
        },

        /**
         * HOOK: tool.execute.before
         * 
         * FROM SOURCE (lines 3267-3273):
         *   await Plugin.trigger(
         *     "tool.execute.before",
         *     { tool: "task", sessionID, callID: part.id },
         *     { args: taskArgs },
         *   )
         * 
         * This fires BEFORE a tool executes, including the "task" tool
         * which is used for agent-to-agent delegation!
         * 
         * Input: { tool: string, sessionID: string, callID: string }
         * Output: { args: { prompt, description, subagent_type, command? } }
         * 
         * We CAN MODIFY args.prompt to inject context for the subagent!
         */
        'tool.execute.before': async (
            input: { tool?: string; sessionID?: string; callID?: string },
            output: { args?: Record<string, unknown> }
        ) => {
            // Only intercept the "task" tool (agent delegation)
            if (input?.tool !== 'task') {
                return
            }

            const sessionID = input.sessionID
            if (!sessionID) {
                debugLog('No sessionID for task tool')
                return
            }

            const args = output.args
            if (!args) {
                debugLog('No args for task tool')
                return
            }

            debugLog(`Intercepted task delegation to: ${args.subagent_type}`)

            const ctx = sessionContextMap.get(sessionID)

            // Build delegation context injection
            const delegationReminder = `
## 🔥 CONTEXT-FIRST: DELEGATION HANDOFF

### From Parent Session
- **Session ID**: ${sessionID}
- **Delegating to**: ${args.subagent_type}
${ctx ? `
- **Parent Work Type**: ${ctx.workType}
- **Parent Message Count**: ${ctx.messageCount}
${ctx.firstUserMessage ? `- **Original Intent**: ${ctx.firstUserMessage.slice(0, 150)}...` : ''}
` : ''}

### ⚠️ SUBAGENT REQUIREMENTS
1. **Load your role** from \`.opencode/agents/\` FIRST
2. **Read AGENTS.md** for project governance
3. **Evidence before assertions** - run commands, show output
4. **Stay in scope** - do ONLY what was delegated
5. **Report back** with completion status and any handoff notes

### Task Assigned
${args.description || 'No description provided'}

---
`

            // Inject context at the start of the prompt
            if (typeof args.prompt === 'string') {
                args.prompt = `${delegationReminder}\n${args.prompt}`
                debugLog(`Injected context into delegation prompt for ${args.subagent_type}`)
            } else {
                debugLog('args.prompt is not a string, cannot inject')
            }
        }
    }
}

export default ContextFirstStarterPlugin
