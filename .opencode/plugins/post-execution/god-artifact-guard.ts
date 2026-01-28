/**
 * BMAD Beast Mode v2.0.0 - God Artifact Guard Plugin
 * 
 * Prevents Trap 9 (God Stores/Components): Creating files > size limits.
 * Checks line count on write operations for stores (>300) and components (>400).
 * 
 * @location .opencode/plugins/post-execution/god-artifact-guard.ts
 * @version 1.0.0
 * @date 2026-01-29
 */

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
 * Size limits by file type/path
 */
const SIZE_LIMITS = {
    store: {
        maxLines: 300,
        patterns: ["store.ts", "Store.ts", "/stores/"],
        remedy: "store-refactorer"
    },
    component: {
        maxLines: 400,
        patterns: [".tsx", "Component.ts"],
        remedy: "component-splitter"
    },
    story: {
        maxLines: 500,
        patterns: ["sprint-artifacts/stories/"],
        remedy: "story-split"
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Detect file type based on path
 */
function detectFileType(filePath: string): keyof typeof SIZE_LIMITS | null {
    for (const [type, config] of Object.entries(SIZE_LIMITS)) {
        if (config.patterns.some(p => filePath.includes(p))) {
            return type as keyof typeof SIZE_LIMITS
        }
    }
    return null
}

/**
 * Count lines in content
 */
function countLines(content: string): number {
    return content.split('\n').length
}

// ============================================================================
// PLUGIN IMPLEMENTATION
// ============================================================================

export const GodArtifactGuard: Plugin = {
    name: "god-artifact-guard",
    version: "1.0.0",

    hooks: {
        /**
         * Before tool execution hook
         * Checks content size for writes and blocks if exceeding limits
         */
        "tool.execute.before": async (input: ToolInput): Promise<HookResult> => {
            // Only check write operations
            if (!["write", "write_file", "edit", "edit_file", "create_file"].includes(input.tool.toLowerCase())) {
                return { proceed: true }
            }

            // Get file path and content
            const filePath = input.args.filePath || input.args.path || input.args.file
            const content = input.args.content || input.args.data || ""

            if (!filePath || !content) {
                return { proceed: true }
            }

            // Detect file type
            const fileType = detectFileType(filePath)
            if (!fileType) {
                return { proceed: true }
            }

            // Check line count
            const lineCount = countLines(content)
            const config = SIZE_LIMITS[fileType]

            if (lineCount > config.maxLines) {
                return {
                    proceed: false,
                    error: `GOVERNANCE BLOCK: God ${fileType.charAt(0).toUpperCase() + fileType.slice(1)} Detected

**File**: ${filePath}
**Lines**: ${lineCount}
**Limit**: ${config.maxLines} lines

This ${fileType} exceeds the maximum allowed size.

**Why this matters**:
- Large files are harder to maintain
- Increases cognitive load for developers
- Violates Single Responsibility Principle
- Makes testing and debugging difficult

**How to fix**:
Use the \`${config.remedy}\` skill to split this ${fileType}.

**For Stores (max 300 lines)**:
- Extract domain-specific slices
- Separate read/write concerns
- Create focused stores by feature

**For Components (max 400 lines)**:
- Extract sub-components
- Separate container/presentational
- Move logic to custom hooks

**Action Required**:
1. Load the \`${config.remedy}\` skill
2. Analyze the ${fileType} for split points
3. Create focused, smaller files
4. Update imports`
                }
            }

            // Warn if approaching limit (within 20%)
            const warningThreshold = config.maxLines * 0.8
            if (lineCount > warningThreshold) {
                return {
                    proceed: true,
                    warning: `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} "${filePath}" ` +
                        `has ${lineCount} lines (limit: ${config.maxLines}). ` +
                        `Consider splitting before it becomes a "god ${fileType}".`
                }
            }

            return { proceed: true }
        }
    }
}

// Export as default for plugin loading
export default GodArtifactGuard
