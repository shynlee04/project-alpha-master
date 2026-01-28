/**
 * BMAD Beast Mode v2.0.0 - Brownfield Guard Plugin
 * 
 * Prevents access to deprecated paths (src/lib, src/stores).
 * Enforces canonical path requirements based on project architecture.
 * 
 * @location .opencode/plugins/pre-execution/brownfield-guard.ts
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
 * Deprecated paths - BLOCKED entirely
 */
const DEPRECATED_PATHS = {
    "src/lib": {
        replacement: "src/infrastructure",
        reason: "Legacy pattern replaced by Clean Architecture"
    },
    "src/stores": {
        replacement: "src/infrastructure/persistence/stores",
        reason: "Stores belong in infrastructure layer per architecture"
    },
    "src/lib/workspace": {
        replacement: "src/infrastructure/persistence/stores",
        reason: "Workspace logic moved to Zustand stores"
    },
    "src/lib/filesystem": {
        replacement: "src/infrastructure/filesystem",
        reason: "Filesystem abstraction moved to infrastructure"
    },
    "src/lib/state": {
        replacement: "src/infrastructure/persistence/stores",
        reason: "State management consolidated to stores"
    },
    "src/lib/sync": {
        replacement: "src/infrastructure/sync",
        reason: "Sync logic moved to infrastructure"
    }
}

/**
 * Canonical paths - Expected structure
 */
const CANONICAL_PATHS = [
    "src/infrastructure/",
    "src/domain/",
    "src/presentation/",
    "src/routes/"
]

/**
 * Tools that modify files
 */
const WRITE_TOOLS = [
    "write",
    "write_file",
    "edit",
    "edit_file",
    "create_file",
    "patch"
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract file path from tool args
 */
function getFilePath(args: Record<string, any>): string | null {
    return args.filePath || args.path || args.file || args.target || null
}

/**
 * Check if path matches deprecated patterns
 */
function findDeprecatedPath(filePath: string): { pattern: string; info: typeof DEPRECATED_PATHS[keyof typeof DEPRECATED_PATHS] } | null {
    for (const [pattern, info] of Object.entries(DEPRECATED_PATHS)) {
        if (filePath.includes(pattern)) {
            return { pattern, info }
        }
    }
    return null
}

/**
 * Check if path is canonical
 */
function isCanonicalPath(filePath: string): boolean {
    // Skip non-src paths (they're fine)
    if (!filePath.includes("/src/")) {
        return true
    }

    // Check if path starts with any canonical path
    return CANONICAL_PATHS.some(cp => filePath.includes(cp))
}

// ============================================================================
// PLUGIN IMPLEMENTATION
// ============================================================================

export const BrownfieldGuard: Plugin = {
    name: "brownfield-guard",
    version: "1.0.0",

    hooks: {
        /**
         * Before tool execution hook
         * Blocks writes to deprecated paths and warns about non-canonical paths
         */
        "tool.execute.before": async (input: ToolInput): Promise<HookResult> => {
            const filePath = getFilePath(input.args)
            if (!filePath) {
                return { proceed: true }
            }

            // Check for deprecated paths
            const deprecated = findDeprecatedPath(filePath)

            if (deprecated) {
                // BLOCK write operations to deprecated paths
                if (WRITE_TOOLS.some(t => input.tool.toLowerCase().includes(t))) {
                    return {
                        proceed: false,
                        error: `ARCHITECTURAL VIOLATION: Deprecated Path Detected

**Attempted Path**: ${filePath}
**Deprecated Pattern**: ${deprecated.pattern}
**Reason**: ${deprecated.info.reason}

**Correct Action**: Use "${deprecated.info.replacement}" instead.

**Architecture Canonical Paths**:
- \`src/infrastructure/\` - Persistence, APIs, external services
- \`src/domain/\` - Business logic, entities, value objects
- \`src/presentation/\` - React components, views
- \`src/routes/\` - TanStack Router definitions

**How to proceed**:
1. Identify the correct canonical path from the list above
2. Create/modify files in the canonical location
3. If migrating, create the new file first, then update imports

This enforcement protects:
- Clean Architecture compliance
- Consistent codebase structure
- Future maintainability`
                    }
                }

                // WARN on read operations (don't block, might be analyzing)
                if (input.tool.toLowerCase().includes("read")) {
                    console.warn(
                        `[BrownfieldGuard] Reading deprecated path: ${filePath}. ` +
                        `Consider using ${deprecated.info.replacement} instead.`
                    )
                }
            }

            // Check for non-canonical src paths on writes
            if (WRITE_TOOLS.some(t => input.tool.toLowerCase().includes(t))) {
                if (filePath.includes("/src/") && !isCanonicalPath(filePath)) {
                    return {
                        proceed: false,
                        error: `ARCHITECTURAL VIOLATION: Non-Canonical Path

**Attempted Path**: ${filePath}

This path does not follow the canonical structure.

**Canonical Paths**:
- \`src/infrastructure/\` - Persistence, APIs, external
- \`src/domain/\` - Business logic, entities
- \`src/presentation/\` - React components
- \`src/routes/\` - Router definitions

**Action Required**: 
Choose the appropriate canonical location based on the file's responsibility.`
                    }
                }
            }

            return { proceed: true }
        }
    }
}

// Export as default for plugin loading
export default BrownfieldGuard
