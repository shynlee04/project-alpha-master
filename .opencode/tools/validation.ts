/**
 * BMAD Beast Mode v2.0.0 - Artifact Validation Tool
 * 
 * Custom tool for validating artifacts against schemas with TTL/freshness checks.
 * Implements Phase 2.2 Methodology: "Accurately Specific with Concision"
 * 
 * @location .opencode/tools/validation.ts
 * @version 1.0.0
 * @date 2026-01-29
 */

import { z } from "zod"
import {
    StoryArtifactSchema,
    ContextArtifactSchema,
    SprintArtifactSchema,
    HandoffArtifactSchema,
    ArchitectureArtifactSchema,
    checkTTLStatus,
    generateChecksum
} from "../schemas/artifacts"

// ============================================================================
// VALIDATION TOOL TYPES
// ============================================================================

interface ValidationArgs {
    artifact_path: string
    expected_type: "story" | "context" | "sprint" | "handoff" | "architecture"
    strict_mode?: boolean
}

interface ValidationResult {
    valid: boolean
    artifact_id?: string
    artifact_type?: string
    artifact_path: string
    error?: string
    errors?: string[]
    violations?: string[]
    ttl_status?: {
        status: "valid" | "expired" | "expiring"
        hours_remaining: number
    }
    expected_checksum?: string
    actual_checksum?: string
}

// ============================================================================
// SCHEMA MAPPING
// ============================================================================

const schemaMap: Record<string, z.ZodSchema> = {
    story: StoryArtifactSchema,
    context: ContextArtifactSchema,
    sprint: SprintArtifactSchema,
    handoff: HandoffArtifactSchema,
    architecture: ArchitectureArtifactSchema
}

// ============================================================================
// CANONICAL PATHS (Project Alpha Brownfield)
// ============================================================================

const CANONICAL_PATHS = [
    'src/infrastructure/',
    'src/domain/',
    'src/presentation/',
    'src/routes/'
]

const DEPRECATED_PATHS = [
    'src/lib/workspace/',
    'src/lib/filesystem/',
    'src/lib/state/',
    'src/lib/sync/',
    'src/stores/'
]

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Parse YAML frontmatter from markdown file
 */
function parseFrontmatter(content: string): { frontmatter: any; error?: string } {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)

    if (!frontmatterMatch) {
        return { frontmatter: null, error: "No frontmatter found" }
    }

    try {
        // Simple YAML parsing (replace with proper yaml lib in production)
        const yaml = frontmatterMatch[1]
        const parsed: any = {}

        yaml.split('\n').forEach(line => {
            const colonIdx = line.indexOf(':')
            if (colonIdx > 0) {
                const key = line.substring(0, colonIdx).trim()
                const value = line.substring(colonIdx + 1).trim()

                // Handle quoted strings
                if (value.startsWith('"') && value.endsWith('"')) {
                    parsed[key] = value.slice(1, -1)
                } else if (value === 'true') {
                    parsed[key] = true
                } else if (value === 'false') {
                    parsed[key] = false
                } else if (!isNaN(Number(value))) {
                    parsed[key] = Number(value)
                } else {
                    parsed[key] = value
                }
            }
        })

        return { frontmatter: parsed }
    } catch (error) {
        return { frontmatter: null, error: "Invalid YAML frontmatter" }
    }
}

/**
 * Check Project Alpha specific constraints
 */
function checkProjectAlphaConstraints(frontmatter: any): string[] {
    const violations: string[] = []

    // Check no_src_lib_imports constraint
    if (frontmatter.constraints?.no_src_lib_imports) {
        const hasSrcLib = frontmatter.affected_files?.some((f: any) =>
            DEPRECATED_PATHS.some(dp => f.path.includes(dp))
        )
        if (hasSrcLib) {
            violations.push("Contains src/lib imports (deprecated per ADR-039)")
        }
    }

    // Check canonical_path_required constraint
    if (frontmatter.constraints?.canonical_path_required) {
        const nonCanonical = frontmatter.affected_files?.filter((f: any) =>
            !CANONICAL_PATHS.some(p => f.path.startsWith(p))
        )
        if (nonCanonical?.length > 0) {
            violations.push(`Non-canonical paths: ${nonCanonical.map((f: any) => f.path).join(', ')}`)
        }
    }

    // Check max lines constraints
    if (frontmatter.constraints?.max_component_lines > 400) {
        violations.push(`Component exceeds max lines (${frontmatter.constraints.max_component_lines} > 400)`)
    }

    if (frontmatter.constraints?.max_store_lines > 300) {
        violations.push(`Store exceeds max lines (${frontmatter.constraints.max_store_lines} > 300)`)
    }

    return violations
}

// ============================================================================
// MAIN VALIDATION TOOL
// ============================================================================

/**
 * Validate artifact against schema and check TTL/freshness
 * 
 * @param args - Validation arguments
 * @returns ValidationResult with pass/fail and details
 */
export async function validateArtifact(args: ValidationArgs): Promise<ValidationResult> {
    const fs = await import('fs')
    const path = await import('path')

    // 1. Check file exists
    if (!fs.existsSync(args.artifact_path)) {
        return {
            valid: false,
            error: "File not found",
            artifact_path: args.artifact_path
        }
    }

    // 2. Read and parse frontmatter
    const content = fs.readFileSync(args.artifact_path, 'utf-8')
    const { frontmatter, error } = parseFrontmatter(content)

    if (error) {
        return {
            valid: false,
            error,
            artifact_path: args.artifact_path
        }
    }

    // 3. Get and validate against schema
    const schema = schemaMap[args.expected_type]
    if (!schema) {
        return {
            valid: false,
            error: `Unsupported artifact type: ${args.expected_type}`,
            artifact_path: args.artifact_path
        }
    }

    const schemaResult = schema.safeParse(frontmatter)
    if (!schemaResult.success) {
        return {
            valid: false,
            error: "Schema validation failed",
            errors: schemaResult.error.errors.map(e =>
                `${e.path.join('.')}: ${e.message}`
            ),
            artifact_path: args.artifact_path
        }
    }

    // 4. Check TTL
    if (frontmatter.metadata) {
        const ttlStatus = checkTTLStatus(frontmatter.metadata)
        if (ttlStatus.status === "expired") {
            return {
                valid: false,
                error: "Artifact expired (TTL exceeded)",
                ttl_status: ttlStatus,
                artifact_path: args.artifact_path
            }
        }
    }

    // 5. Verify checksum
    if (frontmatter.metadata?.checksum) {
        const currentChecksum = await generateChecksum(args.artifact_path)
        if (currentChecksum !== frontmatter.metadata.checksum) {
            return {
                valid: false,
                error: "Checksum mismatch (file modified)",
                expected_checksum: frontmatter.metadata.checksum,
                actual_checksum: currentChecksum,
                artifact_path: args.artifact_path
            }
        }
    }

    // 6. Project Alpha specific validations
    const violations = checkProjectAlphaConstraints(frontmatter)

    if (violations.length > 0 && args.strict_mode) {
        return {
            valid: false,
            error: "Project Alpha constraint violations",
            violations,
            artifact_path: args.artifact_path
        }
    }

    // 7. Return success
    return {
        valid: true,
        artifact_id: frontmatter.metadata?.artifact_id,
        artifact_type: frontmatter.metadata?.artifact_type,
        ttl_status: frontmatter.metadata ? checkTTLStatus(frontmatter.metadata) : undefined,
        violations: violations.length > 0 ? violations : undefined,
        artifact_path: args.artifact_path
    }
}

/**
 * Batch validate multiple artifacts
 */
export async function validateMultipleArtifacts(
    artifacts: Array<{ path: string; type: ValidationArgs['expected_type'] }>,
    strict_mode: boolean = false
): Promise<{ results: ValidationResult[]; summary: { passed: number; failed: number } }> {
    const results: ValidationResult[] = []
    let passed = 0
    let failed = 0

    for (const artifact of artifacts) {
        const result = await validateArtifact({
            artifact_path: artifact.path,
            expected_type: artifact.type,
            strict_mode
        })
        results.push(result)

        if (result.valid) {
            passed++
        } else {
            failed++
        }
    }

    return {
        results,
        summary: { passed, failed }
    }
}
