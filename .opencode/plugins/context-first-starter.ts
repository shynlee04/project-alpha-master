/**
 * BEAST-MODE CONTEXT STARTER PLUGIN v1.0
 * 
 * Automatically injects context-first reminders before EVERY message goes to the API.
 * Uses experimental.chat.system.transform to enrich the system prompt with:
 * 1. Role reminders (from .opencode/agents/)
 * 2. Context anchoring (turns 1-2 + last 4)
 * 3. Skill awareness (check .opencode/skills/)
 * 4. Governance reminders (AGENTS.md, workflow-status, sprint-status)
 * 5. Work type detection (meta-framework vs project)
 * 
 * This replaces /start command - it's AUTOMATIC on every turn.
 * 
 * @location .opencode/plugins/context-first-starter.ts
 * @version 1.0.0
 * @date 2026-01-30
 * @hooks experimental.chat.messages.transform, experimental.chat.system.transform
 */

import type { PluginInput } from '@opencode-ai/plugin'

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
// MESSAGE PART TYPES
// ============================================================================

interface MessagePart {
    type?: string
    text?: string
    sessionID?: string
    synthetic?: boolean
}

interface MessageWithInfo {
    role?: string
    parts?: MessagePart[]
    info?: {
        sessionID?: string
    }
}

interface MessagesTransformOutput {
    messages: MessageWithInfo[]
}

interface SystemTransformInput {
    sessionID?: string
}

interface SystemTransformOutput {
    system?: string | string[]
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function extractSessionID(messages: MessageWithInfo[]): string | undefined {
    for (const message of messages) {
        if (message.info?.sessionID) {
            return message.info.sessionID
        }
        if (message.parts) {
            for (const part of message.parts) {
                if (part.sessionID) {
                    return part.sessionID
                }
            }
        }
    }
    return undefined
}

function extractMessageText(message: MessageWithInfo): string {
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

function extractFilePaths(messages: MessageWithInfo[]): string[] {
    const paths = new Set<string>()

    for (const message of messages) {
        const text = extractMessageText(message)

        // Match file paths mentioned in messages
        const pathPatterns = [
            /file:\/\/\/([^\s)>\]]+)/g,  // file:// URIs
            /`([^`]+\.(ts|tsx|js|jsx|md|yaml|json))`/g,  // backtick paths with extension
            /\.opencode\/[^\s)>\]]+/g,  // .opencode paths
            /_bmad-output\/[^\s)>\]]+/g,  // _bmad-output paths
            /src\/[^\s)>\]]+/g  // src paths
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

function detectPostCompact(messages: MessageWithInfo[]): boolean {
    const text = messages.map(m => extractMessageText(m)).join(' ')
    return text.includes('compact_chain:') ||
        text.includes('state_injection:') ||
        text.includes('continuation prompt')
}

// ============================================================================
// CONTEXT-FIRST REMINDER GENERATOR
// ============================================================================

function generateContextFirstReminder(ctx: SessionContext): string {
    const reminder = `
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
**Last Turns:** ${ctx.lastFourTurns.length}

### 3. WORK TYPE DETECTION
**Detected:** ${ctx.workType.toUpperCase()}
${ctx.workType === 'meta-framework' ? `
- Working on: .opencode/, .agent/, _bmad/
- DO NOT modify project source code
- Focus on framework, skills, workflows, agents
` : ctx.workType === 'project' ? `
- Working on: src/, app/, packages/
- Update workflow-status.yaml after completing work
- Update sprint-status.yaml when in story development
` : '- Could not determine work type from file paths'}

### 4. FILE PATHS IN CONTEXT
${ctx.filePaths.length > 0 ? ctx.filePaths.slice(0, 10).map(p => `- ${p}`).join('\n') : '- No file paths detected in conversation'}

### 5. POST-COMPACT DETECTION
${ctx.isPostCompact ? `
⚠️ **POST-COMPACT SESSION DETECTED**
- Look for YAML summary at conversation start
- Parse anchors.original_intent for primary goal
- Parse artifact_registry for handoff documents
- Read files ON DEMAND via hop-reading
` : '- Normal session (not post-compact)'}

### 6. GOVERNANCE REMINDER
- Check AGENTS.md for project constitution
- Verify role permissions before acting
- Evidence before assertions → Run commands, read outputs, THEN claim success
- Load skills from \`.opencode/skills/\` for specialized work

### 7. VERIFICATION REQUIREMENT
Before claiming any task is complete:
- Run \`pnpm typecheck:fast\` if TypeScript
- Run \`pnpm test:fast\` if tests exist
- Show evidence of successful execution

---
`
    return reminder
}

// ============================================================================
// PLUGIN EXPORT
// ============================================================================

const contextFirstStarterPlugin = async (input: PluginInput) => {
    debugLog('Plugin initialized')

    return {
        /**
         * HOOK: experimental.chat.messages.transform
         * Fires FIRST on each message, extracts context for injection
         */
        'experimental.chat.messages.transform': async (
            _input: Record<string, never>,
            output: MessagesTransformOutput
        ): Promise<MessagesTransformOutput> => {
            const sessionID = extractSessionID(output.messages)
            if (!sessionID) {
                debugLog('No sessionID found')
                return output
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

            // Extract first user message
            if (!ctx.firstUserMessage) {
                for (const msg of output.messages) {
                    if (msg.role === 'user') {
                        const text = extractMessageText(msg)
                        if (text) {
                            ctx.firstUserMessage = text
                            break
                        }
                    }
                }
            }

            // Update message count
            ctx.messageCount = output.messages.length

            // Update last 4 turns
            ctx.lastFourTurns = output.messages
                .slice(-8)  // Get last 8 to get 4 user + 4 assistant
                .map(m => ({
                    role: m.role || 'unknown',
                    content: extractMessageText(m).slice(0, 100)
                }))

            // Extract file paths
            ctx.filePaths = extractFilePaths(output.messages)

            // Detect work type
            ctx.workType = detectWorkType(ctx.filePaths)

            // Detect post-compact
            ctx.isPostCompact = detectPostCompact(output.messages)

            // Store context
            sessionContextMap.set(sessionID, ctx)

            debugLog(`Session ${sessionID}: ${ctx.messageCount} messages, workType=${ctx.workType}`)

            return output
        },

        /**
         * HOOK: experimental.chat.system.transform
         * Fires AFTER messages.transform, injects context-first reminder
         */
        'experimental.chat.system.transform': async (
            input: SystemTransformInput,
            output: SystemTransformOutput | null
        ): Promise<SystemTransformOutput> => {
            const sessionID = input?.sessionID
            const ctx = sessionID ? sessionContextMap.get(sessionID) : undefined

            if (!ctx) {
                debugLog('No session context, skipping injection')
                return output ?? {}
            }

            // Generate reminder
            const reminder = generateContextFirstReminder(ctx)

            debugLog('Injecting context-first reminder into system prompt')

            // Inject into system prompt
            if (!output) {
                return { system: reminder }
            } else if (Array.isArray(output.system)) {
                output.system.push(reminder)
            } else {
                output.system = output.system
                    ? `${output.system}\n\n${reminder}`
                    : reminder
            }

            return output
        }
    }
}

export default contextFirstStarterPlugin
