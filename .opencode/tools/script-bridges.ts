/**
 * BEAST-MODE SCRIPT BRIDGES v3.0.0
 * 
 * Custom tools that wrap package.json scripts for governance enforcement.
 * These are invoked by the beast-mode-orchestrator plugin after file edits.
 * 
 * @location .opencode/tools/script-bridges.ts
 * @version 3.0.0
 * @date 2026-01-29
 */

import { tool } from "@opencode-ai/plugin"
import { z } from "zod"

// ============================================================================
// GOVERNANCE TOOLS
// ============================================================================

/**
 * Run full governance check (size limits + import paths)
 */
export const runGovernance = tool({
    name: "run-governance",
    description: "Run project governance checks (file size limits + import path violations). Auto-triggered after file edits.",
    args: {},
    async execute(_args, ctx) {
        const result = await ctx.shell.run("pnpm governance")

        return {
            passed: result.exitCode === 0,
            exitCode: result.exitCode,
            violations: result.exitCode !== 0 ? parseViolations(result.stderr || result.stdout) : [],
            stdout: result.stdout?.slice(0, 1000),
            suggestion: result.exitCode !== 0
                ? "Load skill: brownfield-guard to fix violations"
                : "All governance checks passed"
        }
    }
})

/**
 * Run size limit governance only
 */
export const runGovernanceSize = tool({
    name: "run-governance-size",
    description: "Check file size limits only (max 300 LOC for components/stores)",
    args: {},
    async execute(_args, ctx) {
        const result = await ctx.shell.run("pnpm governance:size")

        return {
            passed: result.exitCode === 0,
            exitCode: result.exitCode,
            oversizedFiles: result.exitCode !== 0 ? parseOversizedFiles(result.stdout) : [],
            suggestion: result.exitCode !== 0
                ? "Load skill: component-splitter to break up large files"
                : "All files within size limits"
        }
    }
})

/**
 * Run import path governance only
 */
export const runGovernanceImports = tool({
    name: "run-governance-imports",
    description: "Check import path violations (forbidden paths per architecture conventions)",
    args: {},
    async execute(_args, ctx) {
        const result = await ctx.shell.run("pnpm governance:imports")

        return {
            passed: result.exitCode === 0,
            exitCode: result.exitCode,
            violations: result.exitCode !== 0 ? parseImportViolations(result.stdout) : [],
            suggestion: result.exitCode !== 0
                ? "Fix imports to use canonical paths (src/domain/, src/infrastructure/)"
                : "All imports use canonical paths"
        }
    }
})

// ============================================================================
// TYPECHECK TOOLS
// ============================================================================

/**
 * Run fast TypeScript check
 */
export const runTypecheck = tool({
    name: "run-typecheck",
    description: "Run fast TypeScript validation using tsgo. Auto-triggered after .ts/.tsx edits.",
    args: {},
    async execute(_args, ctx) {
        const result = await ctx.shell.run("pnpm typecheck:fast")

        return {
            passed: result.exitCode === 0,
            exitCode: result.exitCode,
            errorCount: result.exitCode !== 0 ? countTypeErrors(result.stdout) : 0,
            errors: result.exitCode !== 0 ? parseTypeErrors(result.stdout)?.slice(0, 10) : [],
            suggestion: result.exitCode !== 0
                ? "Fix TypeScript errors before proceeding"
                : "TypeScript check passed"
        }
    }
})

// ============================================================================
// TEST TOOLS
// ============================================================================

/**
 * Run fast unit tests
 */
export const runTests = tool({
    name: "run-tests",
    description: "Run fast unit tests (vitest with threads pool)",
    args: {
        filter: z.string().optional().describe("Test file filter pattern")
    },
    async execute({ filter }, ctx) {
        const cmd = filter
            ? `pnpm test:fast -- ${filter}`
            : "pnpm test:fast"

        const result = await ctx.shell.run(cmd)

        return {
            passed: result.exitCode === 0,
            exitCode: result.exitCode,
            summary: extractTestSummary(result.stdout),
            failures: result.exitCode !== 0 ? extractFailures(result.stdout)?.slice(0, 5) : [],
            suggestion: result.exitCode !== 0
                ? "Load skill: systematic-debugging to fix test failures"
                : "All tests passed"
        }
    }
})

/**
 * Run E2E test suite
 */
export const runE2ESuite = tool({
    name: "run-e2e-suite",
    description: "Run E2E tests for a specific workspace. Auto-triggered on completion claims.",
    args: {
        workspace: z.enum(["ide", "notes", "knowledge", "study", "cross-workspace"]).optional()
            .describe("Specific workspace to test, or all if not specified")
    },
    async execute({ workspace }, ctx) {
        const cmd = workspace
            ? `pnpm test:e2e:${workspace}`
            : "pnpm test:e2e"

        const result = await ctx.shell.run(cmd)

        return {
            passed: result.exitCode === 0,
            exitCode: result.exitCode,
            workspace: workspace || "all",
            summary: extractE2ESummary(result.stdout),
            suggestion: result.exitCode !== 0
                ? "Load skill: verification-before-completion - E2E evidence required"
                : "E2E tests passed - completion verified"
        }
    }
})

// ============================================================================
// ARCHITECTURE TOOLS
// ============================================================================

/**
 * Check for circular dependencies
 */
export const checkCircularDeps = tool({
    name: "check-circular-deps",
    description: "Check for circular dependencies in the codebase using madge",
    args: {},
    async execute(_args, ctx) {
        const result = await ctx.shell.run("pnpm deps:circular")

        const hasCircular = result.exitCode !== 0 || result.stdout?.includes("Circular")

        return {
            passed: !hasCircular,
            exitCode: result.exitCode,
            cycles: hasCircular ? parseCircularDeps(result.stdout) : [],
            suggestion: hasCircular
                ? "Load skill: architecture-remediation to break cycles"
                : "No circular dependencies detected"
        }
    }
})

/**
 * Run lint with auto-fix
 */
export const runLintFix = tool({
    name: "run-lint-fix",
    description: "Run ESLint with automatic fixes",
    args: {},
    async execute(_args, ctx) {
        const result = await ctx.shell.run("pnpm lint:fix")

        return {
            passed: result.exitCode === 0,
            exitCode: result.exitCode,
            fixed: extractFixedCount(result.stdout),
            remaining: extractRemainingErrors(result.stdout),
            suggestion: result.exitCode !== 0
                ? "Some lint errors require manual fix"
                : "All lint issues resolved"
        }
    }
})

// ============================================================================
// HELPER PARSERS
// ============================================================================

function parseViolations(output: string): string[] {
    if (!output) return []
    return output.split("\n").filter(line =>
        line.includes("violation") ||
        line.includes("error") ||
        line.includes("FAIL")
    )
}

function parseOversizedFiles(output: string): Array<{ file: string, loc: number }> {
    if (!output) return []
    const matches = output.matchAll(/(.+?\.tsx?)\s+(\d+)\s+LOC/g)
    return Array.from(matches).map(m => ({
        file: m[1],
        loc: parseInt(m[2])
    }))
}

function parseImportViolations(output: string): string[] {
    if (!output) return []
    return output.split("\n").filter(line =>
        line.includes("src/lib") ||
        line.includes("forbidden") ||
        line.includes("invalid import")
    )
}

function countTypeErrors(output: string): number {
    if (!output) return 0
    const match = output.match(/(\d+)\s+error/)
    return match ? parseInt(match[1]) : 0
}

function parseTypeErrors(output: string): string[] {
    if (!output) return []
    return output.split("\n").filter(line =>
        line.includes("error TS") ||
        line.includes(": error")
    )
}

function extractTestSummary(output: string): string {
    if (!output) return "No output"
    const match = output.match(/Tests:\s+.+/i) || output.match(/\d+ passed/)
    return match ? match[0] : "See full output"
}

function extractFailures(output: string): string[] {
    if (!output) return []
    return output.split("\n").filter(line =>
        line.includes("FAIL") ||
        line.includes("✗") ||
        line.includes("Error:")
    )
}

function extractE2ESummary(output: string): string {
    if (!output) return "No output"
    const lines = output.split("\n").filter(line =>
        line.includes("passed") ||
        line.includes("failed") ||
        line.includes("skipped")
    )
    return lines.join("; ") || "See full output"
}

function parseCircularDeps(output: string): string[] {
    if (!output) return []
    return output.split("\n").filter(line =>
        line.includes("->") ||
        line.includes("circular")
    )
}

function extractFixedCount(output: string): number {
    if (!output) return 0
    const match = output.match(/(\d+)\s+(problems?|errors?)\s+fixed/i)
    return match ? parseInt(match[1]) : 0
}

function extractRemainingErrors(output: string): number {
    if (!output) return 0
    const match = output.match(/(\d+)\s+(problems?|errors?)$/)
    return match ? parseInt(match[1]) : 0
}

// ============================================================================
// EXPORTS
// ============================================================================

export default [
    runGovernance,
    runGovernanceSize,
    runGovernanceImports,
    runTypecheck,
    runTests,
    runE2ESuite,
    checkCircularDeps,
    runLintFix
]
