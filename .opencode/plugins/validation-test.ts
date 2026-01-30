/**
 * PRIORITY #0 VALIDATION PLUGIN
 * 
 * Purpose: Verify that OpenCode plugin hooks actually fire
 * 
 * @location .opencode/plugins/validation-test.ts
 * @version 1.0.0
 * @date 2026-01-30
 */

import type { Plugin } from '@opencode-ai/plugin'
import * as fs from 'fs'
import * as path from 'path'

// ============================================================================
// VALIDATION LOGGER - Writes to file to prove hooks fired
// ============================================================================

const LOG_FILE = '.opencode/validation-test-log.txt'

function logValidation(hookName: string, data: unknown): void {
    const timestamp = new Date().toISOString()
    const entry = `[${timestamp}] HOOK FIRED: ${hookName}\n  Data: ${JSON.stringify(data, null, 2).slice(0, 500)}\n\n`

    try {
        const logPath = path.resolve(process.cwd(), LOG_FILE)
        fs.appendFileSync(logPath, entry)
        console.log(`✅ [validation-test] ${hookName} FIRED - logged to ${LOG_FILE}`)
    } catch (err) {
        console.error(`❌ [validation-test] Failed to write log: ${err}`)
    }
}

// ============================================================================
// PLUGIN EXPORT
// ============================================================================

export const ValidationTestPlugin: Plugin = async ({ directory, worktree }) => {
    console.log('🔥 [validation-test] Plugin initialized!')
    console.log(`  Directory: ${directory}`)
    console.log(`  Worktree: ${worktree}`)

    // Create log file on startup
    try {
        const logPath = path.resolve(process.cwd(), LOG_FILE)
        fs.writeFileSync(logPath, `=== VALIDATION TEST LOG ===\nStarted: ${new Date().toISOString()}\nDirectory: ${directory}\nWorktree: ${worktree}\n\n`)
        console.log(`✅ [validation-test] Created log file: ${logPath}`)
    } catch (err) {
        console.error(`❌ [validation-test] Failed to create log file: ${err}`)
    }

    return {
        /**
         * HOOK 1: experimental.chat.messages.transform
         */
        'experimental.chat.messages.transform': async (_input, output) => {
            logValidation('experimental.chat.messages.transform', {
                messagesCount: output?.messages?.length ?? 0,
                input: _input
            })
        },

        /**
         * HOOK 2: experimental.chat.system.transform
         */
        'experimental.chat.system.transform': async (input, output) => {
            logValidation('experimental.chat.system.transform', {
                sessionID: input?.sessionID,
                model: input?.model,
                systemArrayLength: output?.system?.length ?? 0
            })

            // Inject visible marker to prove hook fired
            if (output?.system) {
                output.system.push(`
## 🔥 VALIDATION TEST: HOOK FIRED!
This message proves that \`experimental.chat.system.transform\` hook is working.
Timestamp: ${new Date().toISOString()}
Session: ${input?.sessionID ?? 'unknown'}
`)
            }
        },

        /**
         * HOOK 3: tool.execute.before
         */
        'tool.execute.before': async (input, output) => {
            logValidation('tool.execute.before', {
                tool: input?.tool,
                sessionID: input?.sessionID,
                callID: input?.callID,
                argsKeys: output?.args ? Object.keys(output.args) : []
            })
        },

        /**
         * HOOK 4: tool.execute.after
         */
        'tool.execute.after': async (input, output) => {
            logValidation('tool.execute.after', {
                tool: input?.tool,
                sessionID: input?.sessionID,
                resultType: typeof output?.result
            })
        },

        /**
         * EVENT HANDLER: session.compacted
         */
        event: async ({ event }) => {
            logValidation(`event:${event.type}`, event.properties)
        }
    }
}

export default ValidationTestPlugin
