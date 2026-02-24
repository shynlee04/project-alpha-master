/**
 * BMAD Beast Mode v2.0.0 - Stale Artifact Guard Plugin
 * 
 * Prevents Trap 4 (Stale Context): Agent reads old artifacts (>2h) and hallucinates.
 * Checks file modification time on read operations for sprint artifacts.
 * 
 * @location .opencode/plugins/pre-execution/stale-artifact-guard.ts
 * @version 1.0.0
 * @date 2026-01-29
 */

import * as fs from 'fs'
import * as path from 'path'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ToolInput {
    tool: string
    args: Record<string, any>
}

interface HookResult {
    proceed: boolean
    error?: string
    warning?: string
}

interface Plugin {
    name: string
    version: string
    hooks: {
        "tool.execute.before"?: (input: ToolInput) => Promise<HookResult>
    }
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * TTL limits in milliseconds
 */
const TTL_CONFIG = {
    // Sprint artifacts: 2 hours
    sprint_artifacts: 2 * 60 * 60 * 1000,

    // Analysis artifacts: 24 hours
    analysis: 24 * 60 * 60 * 1000,

    // Stories: 48 hours
    stories: 48 * 60 * 60 * 1000,

    // Default: 24 hours
    default: 24 * 60 * 60 * 1000
}

/**
 * Paths that trigger TTL checks
 */
const MONITORED_PATHS = [
    "_bmad-output/sprint-artifacts/",
    "_bmad-output/analysis/",
    "_bmad-output/handoffs/"
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get TTL limit based on file path
 */
function getTTLLimit(filePath: string): number {
    if (filePath.includes("sprint-artifacts/sprint-status")) {
        return TTL_CONFIG.sprint_artifacts
    }
    if (filePath.includes("sprint-artifacts/stories")) {
        return TTL_CONFIG.stories
    }
    if (filePath.includes("/analysis/")) {
        return TTL_CONFIG.analysis
    }
    return TTL_CONFIG.default
}

/**
 * Check if path should be monitored for staleness
 */
function shouldMonitor(filePath: string): boolean {
    return MONITORED_PATHS.some(mp => filePath.includes(mp))
}

/**
 * Format age as human-readable string
 */
function formatAge(ageMs: number): string {
    const hours = Math.floor(ageMs / (60 * 60 * 1000))
    const minutes = Math.floor((ageMs % (60 * 60 * 1000)) / (60 * 1000))

    if (hours > 0) {
        return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
}

// ============================================================================
// PLUGIN IMPLEMENTATION
// ============================================================================

export const StaleArtifactGuard: Plugin = {
    name: "stale-artifact-guard",
    version: "1.0.0",

    hooks: {
        /**
         * Before tool execution hook
         * Checks file staleness for read operations on monitored paths
         */
        "tool.execute.before": async (input: ToolInput): Promise<HookResult> => {
            // Only check read operations
            if (!["read", "read_file", "view_file"].includes(input.tool.toLowerCase())) {
                return { proceed: true }
            }

            // Get file path from args
            const filePath = input.args.path || input.args.filePath || input.args.file
            if (!filePath) {
                return { proceed: true }
            }

            // Only monitor specific paths
            if (!shouldMonitor(filePath)) {
                return { proceed: true }
            }

            // Check if file exists
            try {
                if (!fs.existsSync(filePath)) {
                    return { proceed: true } // Let read tool handle missing file
                }

                // Get file stats
                const stats = fs.statSync(filePath)
                const ageMs = Date.now() - stats.mtimeMs
                const ttlLimit = getTTLLimit(filePath)

                // Check if stale
                if (ageMs > ttlLimit) {
                    const ageStr = formatAge(ageMs)
                    const ttlStr = formatAge(ttlLimit)

                    return {
                        proceed: false,
                        error: `GOVERNANCE BLOCK: Stale Artifact Detected

**File**: ${path.basename(filePath)}
**Age**: ${ageStr} old
**TTL Limit**: ${ttlStr}

This artifact has exceeded its Time-To-Live (TTL) and may contain outdated information.

**Why this matters**:
- Sprint status may have changed
- Story acceptance criteria may have been updated
- Analysis conclusions may be invalidated

**How to proceed**:
1. Run \`/stale-check\` to regenerate fresh artifacts
2. Or run \`/validate-context\` to refresh the artifact
3. Or manually update the artifact with current state

After refreshing, retry your read operation.`
                    }
                }

                // Warn if approaching staleness (within 30 minutes of TTL)
                const warningThreshold = ttlLimit - (30 * 60 * 1000)
                if (ageMs > warningThreshold) {
                    const ageStr = formatAge(ageMs)
                    const remainingMs = ttlLimit - ageMs
                    const remainingStr = formatAge(remainingMs)

                    return {
                        proceed: true,
                        warning: `Artifact "${path.basename(filePath)}" is ${ageStr} old. ` +
                            `It will become stale in ${remainingStr}. ` +
                            `Consider refreshing soon.`
                    }
                }

                return { proceed: true }

            } catch (error) {
                // Allow read to proceed if we can't check (let read tool handle errors)
                console.error("StaleArtifactGuard error:", error)
                return { proceed: true }
            }
        }
    }
}

// Export as default for plugin loading
export default StaleArtifactGuard
