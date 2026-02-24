/**
 * ARCHITECTURE ENFORCER PLUGIN v1.0
 * 
 * Self-governing architecture validation that integrates with OpenCode hooks.
 * 
 * HOOKS USED:
 * - tool.execute.before: Intercept file write/edit operations
 * - tool.execute.after: Analyze changes for architectural violations
 * 
 * INTEGRATION:
 * - Reads from context-first-starter.ts session context
 * - Writes escalation reports to _bmad-output/governance/escalations/
 * - Updates _bmad-output/governance/cycles.yaml state
 * 
 * @location .opencode/plugins/architecture-enforcer.ts
 * @version 1.0.0
 * @date 2026-01-30
 */

import type { Plugin } from '@opencode-ai/plugin'
import * as fs from 'fs'
import * as path from 'path'

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    PROJECT_ROOT: '/Users/apple/Documents/coding-projects/project-alpha-master',
    ESCALATION_DIR: '_bmad-output/governance/escalations',
    CYCLES_FILE: '_bmad-output/governance/cycles.yaml',
    DEBUG: process.env.OPENCODE_ARCH_DEBUG === 'true'
}

// ============================================================================
// CONFLICT SEVERITY
// ============================================================================

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

interface ConflictResult {
    conflict: boolean
    type?: string
    severity?: Severity
    message?: string
    architectureRef?: string
}

// ============================================================================
// CONFLICT DETECTION RULES
// From implementation_plan.md lines 114-146
// ============================================================================

interface ConflictRule {
    id: string
    description: string
    check: (file: string, content: string) => ConflictResult
}

const CONFLICT_RULES: ConflictRule[] = [
    {
        id: 'LAYER_BOUNDARY',
        description: 'Domain layer importing from infrastructure',
        check: (file: string, content: string): ConflictResult => {
            // Domain importing from infrastructure violates layer boundaries
            if (file.includes('/domain/') && /from ['"]@\/infrastructure/.test(content)) {
                return {
                    conflict: true,
                    type: 'LAYER_BOUNDARY',
                    severity: 'HIGH',
                    message: 'Domain layer should not import from infrastructure',
                    architectureRef: 'IDEAL-architecture-section-1: Layer Ownership'
                }
            }
            return { conflict: false }
        }
    },
    {
        id: 'ZUSTAND_PERSIST_DOMAIN',
        description: 'Zustand persist middleware used with domain data',
        check: (file: string, content: string): ConflictResult => {
            // Zustand persist with domain entities violates 4-layer architecture
            if (/persist\(/.test(content) && /(projects|threads|agents|notes|documents)/.test(content)) {
                return {
                    conflict: true,
                    type: 'ZUSTAND_PERSIST_DOMAIN',
                    severity: 'CRITICAL',
                    message: 'Domain data should NOT use Zustand persist - use Dexie instead',
                    architectureRef: 'IDEAL-architecture-section-1: Layer 3.1 Core Principle'
                }
            }
            return { conflict: false }
        }
    },
    {
        id: 'TYPE_DUPLICATION',
        description: 'New type definitions that might duplicate canonical types',
        check: (file: string, content: string): ConflictResult => {
            // Check for types that should come from canonical type system
            const canonicalTypes = [
                'WorkspaceType', 'SyncStatus', 'ProjectId', 'ThreadId',
                'NoteId', 'AgentId', 'PluginCapability'
            ]
            for (const typeName of canonicalTypes) {
                const pattern = new RegExp(`export (type|interface) ${typeName}\\b`)
                if (pattern.test(content)) {
                    // Allow if it's in the canonical types directory
                    if (file.includes('/types/') || file.includes('/domain/')) {
                        continue
                    }
                    return {
                        conflict: true,
                        type: 'TYPE_DUPLICATION',
                        severity: 'MEDIUM',
                        message: `Type '${typeName}' should be imported from canonical type system, not redefined`,
                        architectureRef: 'IDEAL-architecture-section-5: Canonical Type System'
                    }
                }
            }
            return { conflict: false }
        }
    },
    {
        id: 'LIB_IMPORT',
        description: 'Import from deprecated @/lib path',
        check: (file: string, content: string): ConflictResult => {
            if (/from ['"]@\/lib\//.test(content)) {
                return {
                    conflict: true,
                    type: 'LIB_IMPORT',
                    severity: 'HIGH',
                    message: 'Imports from @/lib/ are deprecated - use layered architecture paths',
                    architectureRef: 'IDEAL-architecture-section-1: Canonical Paths'
                }
            }
            return { conflict: false }
        }
    },
    {
        id: 'GOD_STORE',
        description: 'Store file exceeding size limit (>300 LOC suggests god store)',
        check: (file: string, content: string): ConflictResult => {
            if (file.includes('store') && file.endsWith('.ts')) {
                const lines = content.split('\n').length
                if (lines > 300) {
                    return {
                        conflict: true,
                        type: 'GOD_STORE',
                        severity: 'HIGH',
                        message: `Store has ${lines} lines (>300), likely needs splitting`,
                        architectureRef: 'Architecture Remediation: Single Responsibility'
                    }
                }
            }
            return { conflict: false }
        }
    },
    {
        id: 'PLUGIN_DIRECT_DB',
        description: 'Plugin accessing database directly instead of through gateway',
        check: (file: string, content: string): ConflictResult => {
            if (file.includes('/plugins/') && /import.*from.*dexie|import.*db|\.indexedDB/.test(content)) {
                return {
                    conflict: true,
                    type: 'PLUGIN_DIRECT_DB',
                    severity: 'MEDIUM',
                    message: 'Plugins should access storage through gateway, not directly',
                    architectureRef: 'IDEAL-architecture-section-2: Plugin Isolation'
                }
            }
            return { conflict: false }
        }
    }
]

// ============================================================================
// DEBUG LOGGING
// ============================================================================

function debugLog(message: string): void {
    if (CONFIG.DEBUG) {
        console.debug(`[architecture-enforcer] ${message}`)
    }
}

// ============================================================================
// ESCALATION REPORT GENERATOR
// ============================================================================

interface EscalationReport {
    reportId: string
    timestamp: string
    agent: string
    file: string
    conflictType: string
    severity: Severity
    message: string
    architectureRef: string
    contentSnippet: string
}

function generateEscalationReport(
    file: string,
    result: ConflictResult,
    contentSnippet: string
): EscalationReport {
    const timestamp = new Date().toISOString()
    const reportId = `CONFLICT-${Date.now()}`

    return {
        reportId,
        timestamp,
        agent: 'architecture-enforcer-plugin',
        file,
        conflictType: result.type || 'UNKNOWN',
        severity: result.severity || 'MEDIUM',
        message: result.message || 'Architectural conflict detected',
        architectureRef: result.architectureRef || 'Unknown',
        contentSnippet
    }
}

function writeEscalationReport(report: EscalationReport): void {
    const escalationDir = path.join(CONFIG.PROJECT_ROOT, CONFIG.ESCALATION_DIR)
    const filename = `${report.reportId}-${report.conflictType}.md`
    const filepath = path.join(escalationDir, filename)

    const content = `---
report_id: ${report.reportId}
timestamp: ${report.timestamp}
agent: ${report.agent}
file: ${report.file}
severity: ${report.severity}
---

# Architecture Conflict Report

## Conflict Summary
**Type**: ${report.conflictType}
**Severity**: ${report.severity}
**File**: \`${report.file}\`

## Message
${report.message}

## Architecture Reference
${report.architectureRef}

## Evidence
\`\`\`typescript
${report.contentSnippet}
\`\`\`

## Recommended Action
${report.severity === 'CRITICAL' ?
            'Escalate immediately to `/bmad-bmm-workflows-correct-course` for ADR review.' :
            report.severity === 'HIGH' ?
                'Review with architect before proceeding. May require epic re-planning.' :
                'Fix during story completion. Document pattern for future reference.'}
`

    try {
        // Ensure directory exists
        if (!fs.existsSync(escalationDir)) {
            fs.mkdirSync(escalationDir, { recursive: true })
        }
        fs.writeFileSync(filepath, content, 'utf-8')
        debugLog(`Wrote escalation report: ${filepath}`)
    } catch (error) {
        console.error(`[architecture-enforcer] Failed to write escalation report: ${error}`)
    }
}

// ============================================================================
// FILE CONTENT ANALYSIS
// ============================================================================

function analyzeContent(file: string, content: string): ConflictResult[] {
    const conflicts: ConflictResult[] = []

    for (const rule of CONFLICT_RULES) {
        const result = rule.check(file, content)
        if (result.conflict) {
            debugLog(`Detected ${rule.id} in ${file}`)
            conflicts.push(result)
        }
    }

    return conflicts
}

function extractSnippet(content: string, pattern: RegExp | string, contextLines: number = 3): string {
    const lines = content.split('\n')
    let startLine = 0

    if (typeof pattern === 'string') {
        startLine = lines.findIndex(line => line.includes(pattern))
    } else {
        startLine = lines.findIndex(line => pattern.test(line))
    }

    if (startLine === -1) {
        return lines.slice(0, 5).join('\n')
    }

    const start = Math.max(0, startLine - contextLines)
    const end = Math.min(lines.length, startLine + contextLines + 1)

    return lines.slice(start, end).join('\n')
}

// ============================================================================
// PLUGIN EXPORT
// ============================================================================

export const ArchitectureEnforcerPlugin: Plugin = async ({ client }) => {
    debugLog('Plugin initialized')

    return {
        /**
         * HOOK: tool.execute.after
         * 
         * Fires AFTER a tool executes, allowing us to analyze the result.
         * For write_file and edit_file tools, we can check the written content.
         */
        'tool.execute.after': async (
            input: { tool?: string; sessionID?: string; callID?: string },
            output: { result?: unknown; error?: unknown }
        ) => {
            const tool = input?.tool

            // Only interested in file modification tools
            if (!tool || !['write_file', 'edit_file', 'replace_file_content', 'multi_replace_file_content'].includes(tool)) {
                return
            }

            debugLog(`Analyzing after ${tool} execution`)

            // Extract file path and content from the tool result
            // Note: The actual structure depends on OpenCode's tool result format
            const result = output.result as Record<string, unknown> | undefined
            if (!result) {
                return
            }

            const filePath = result.file as string | undefined
            if (!filePath) {
                debugLog('No file path in result')
                return
            }

            // Only analyze TypeScript files in source directories
            if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
                return
            }

            // Read the actual file content to analyze
            try {
                const fullPath = filePath.startsWith('/') ? filePath : path.join(CONFIG.PROJECT_ROOT, filePath)

                if (!fs.existsSync(fullPath)) {
                    debugLog(`File does not exist: ${fullPath}`)
                    return
                }

                const content = fs.readFileSync(fullPath, 'utf-8')
                const conflicts = analyzeContent(filePath, content)

                for (const conflict of conflicts) {
                    // Generate and write escalation report
                    const snippet = extractSnippet(content, conflict.message || '', 3)
                    const report = generateEscalationReport(filePath, conflict, snippet)
                    writeEscalationReport(report)

                    // Log to console for immediate visibility
                    console.warn(`[architecture-enforcer] ${conflict.severity}: ${conflict.type} in ${filePath}`)
                    console.warn(`  → ${conflict.message}`)
                }

                if (conflicts.length > 0) {
                    debugLog(`Found ${conflicts.length} conflicts in ${filePath}`)
                }
            } catch (error) {
                debugLog(`Error analyzing file: ${error}`)
            }
        },

        /**
         * HOOK: tool.execute.before
         * 
         * Fires BEFORE a tool executes.
         * We can use this to inject warnings or modify behavior.
         */
        'tool.execute.before': async (
            input: { tool?: string; sessionID?: string; callID?: string },
            output: { args?: Record<string, unknown> }
        ) => {
            const tool = input?.tool

            // For task delegations, add architecture reminder
            if (tool === 'task') {
                const args = output.args
                if (args && typeof args.prompt === 'string') {
                    const architectureReminder = `
## 🏗️ ARCHITECTURE GOVERNANCE ACTIVE

The architecture-enforcer plugin is monitoring file changes.
If you create/modify TypeScript files, they will be checked against:
- Layer boundary rules
- Zustand persist restrictions
- Type duplication prevention
- Canonical path enforcement

Violations will generate escalation reports in \`_bmad-output/governance/escalations/\`.

---
`
                    args.prompt = `${architectureReminder}${args.prompt}`
                    debugLog('Injected architecture reminder into task delegation')
                }
            }
        }
    }
}

export default ArchitectureEnforcerPlugin
