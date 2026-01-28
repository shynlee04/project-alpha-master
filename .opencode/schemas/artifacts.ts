/**
 * BMAD Beast Mode v2.0.0 - Artifact Schemas
 * 
 * Core Zod schemas for validating all Project Alpha artifacts.
 * Generated from Phase 2.2 Methodology: "Accurately Specific with Concision"
 * 
 * @location .opencode/schemas/artifacts.ts
 * @version 1.0.0
 * @date 2026-01-29
 */

import { z } from "zod"

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Artifact metadata schema - required for ALL artifacts
 * Enforces TTL, validation status, and checksum integrity
 */
export const ArtifactMetadataSchema = z.object({
    artifact_id: z.string().regex(/^art_\d{8}_\d{6}_[a-z0-9]{6}$/),
    artifact_type: z.enum([
        "story",
        "context",
        "sprint",
        "epic",
        "handoff",
        "analysis",
        "architecture",
        "documentation"
    ]),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    status: z.enum([
        "DRAFT",
        "ACTIVE",
        "PENDING",
        "COMPLETE",
        "ARCHIVED",
        "BLOCKED"
    ]),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    ttl: z.enum(["permanent", "controlled", "archival", "ephemeral"]),
    validation_status: z.enum(["VALID", "INVALID", "PENDING", "STALE"]),
    checksum: z.string().length(64), // SHA-256
})

/**
 * Story artifact schema - Project Alpha specific
 * Includes all constraints for brownfield compliance
 */
export const StoryArtifactSchema = z.object({
    metadata: ArtifactMetadataSchema,

    // Story identification
    story_id: z.string().regex(/^[A-Z]{4}-\d{2}-\d{2}$/),
    epic_id: z.string().regex(/^EPIC-[A-Z]{2,4}-\d{2}$/),
    title: z.string().min(10).max(200),

    // Story content
    description: z.string().min(50),
    acceptance_criteria: z.array(z.object({
        id: z.string(),
        criteria: z.string().min(20),
        priority: z.enum(["P0", "P1", "P2", "P3"]),
        status: z.enum(["PENDING", "IN_PROGRESS", "DONE", "BLOCKED"])
    })).min(1),

    // Technical details
    affected_files: z.array(z.object({
        path: z.string(),
        action: z.enum(["CREATE", "MODIFY", "DELETE", "MOVE"]),
        reason: z.string()
    })),

    // Project Alpha constraints
    constraints: z.object({
        no_src_lib_imports: z.boolean().default(true),
        canonical_path_required: z.boolean().default(true),
        max_component_lines: z.number().max(400),
        max_store_lines: z.number().max(300),
        test_coverage_required: z.boolean().default(true),
        use_shallow_required: z.boolean().default(true)
    }),

    // Dependencies
    dependencies: z.array(z.object({
        story_id: z.string(),
        type: z.enum(["BLOCKS", "REQUIRES", "RELATED"])
    })),

    // Effort estimation
    effort: z.object({
        estimated_hours: z.number().min(0.5).max(8),
        complexity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
        team: z.enum(["A", "B", "SHARED"])
    })
})

/**
 * Context artifact schema - Story context XML
 */
export const ContextArtifactSchema = z.object({
    metadata: ArtifactMetadataSchema,

    story_id: z.string().regex(/^[A-Z]{4}-\d{2}-\d{2}$/),
    context_type: z.enum(["pre-planning", "implementation", "review"]),

    // Context sections
    sections: z.object({
        requirements: z.string().optional(),
        architecture: z.string().optional(),
        contracts: z.string().optional(),
        data_flow: z.string().optional(),
        ui_layout: z.string().optional(),
        state_management: z.string().optional(),
        testing: z.string().optional()
    }),

    // References
    references: z.array(z.object({
        type: z.enum(["file", "url", "artifact"]),
        location: z.string(),
        section: z.string().optional()
    })),

    // Validation
    validation: z.object({
        schema_validated: z.boolean(),
        contracts_checked: z.boolean(),
        data_flow_mapped: z.boolean(),
        journey_validated: z.boolean()
    })
})

/**
 * Sprint artifact schema
 */
export const SprintArtifactSchema = z.object({
    metadata: ArtifactMetadataSchema,

    sprint_id: z.string().regex(/^SPRINT-\d{4}-\d{2}-\d{2}$/),
    start_date: z.string().datetime(),
    end_date: z.string().datetime(),

    // Stories
    stories: z.record(z.object({
        story_id: z.string(),
        title: z.string(),
        status: z.enum([
            "READY",
            "IN_PROGRESS",
            "DONE",
            "BLOCKED",
            "DEFERRED"
        ]),
        team: z.enum(["A", "B", "SHARED"]),
        assigned_agent: z.string().optional(),
        start_time: z.string().datetime().optional(),
        end_time: z.string().datetime().optional(),
        effort_actual: z.number().optional()
    })),

    // Metrics
    metrics: z.object({
        total_stories: z.number(),
        completed_stories: z.number(),
        blocked_stories: z.number(),
        completion_rate: z.number().min(0).max(1)
    })
})

/**
 * Handoff artifact schema - Agent communication
 */
export const HandoffArtifactSchema = z.object({
    metadata: ArtifactMetadataSchema,

    artifact_id: z.string().regex(/^hnd_\d{8}_\d{6}_[a-z0-9]{6}$/),
    parent_id: z.string(),
    story_id: z.string().optional(),
    source_agent: z.string(),
    target_agent: z.string(),

    // Handoff content
    context_summary: z.string().min(50),
    handoff_data: z.object({
        user_stories_created: z.array(z.string()).optional(),
        analysis_file: z.string().optional(),
        competitive_analysis: z.string().optional(),
        implementation_plan: z.string().optional(),
        test_results: z.string().optional(),
        code_review_feedback: z.string().optional()
    }),

    // Escalation path
    escalation_path: z.string().optional(),

    // Status tracking
    status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETE", "FAILED"]),
    received_at: z.string().datetime().optional(),
    completed_at: z.string().datetime().optional()
})

/**
 * Architecture artifact schema
 */
export const ArchitectureArtifactSchema = z.object({
    metadata: ArtifactMetadataSchema,

    artifact_type: z.enum(["adr", "design", "remediation"]),
    adr_number: z.string().regex(/^ADR-\d{3}$/).optional(),

    // Architecture content
    title: z.string().min(10),
    status: z.enum(["PROPOSED", "APPROVED", "REJECTED", "SUPERSEDED"]),
    decision: z.string().min(50),
    context: z.string().min(50),
    consequences: z.object({
        positive: z.array(z.string()),
        negative: z.array(z.string())
    }),

    // Alignment
    alignment: z.object({
        adr_039_compliant: z.boolean(),
        architecture_v3_compliant: z.boolean(),
        clean_architecture: z.boolean()
    })
})

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate artifact against schema
 */
export async function validateArtifact(
    artifact: unknown,
    schema: z.ZodSchema
): Promise<{ valid: boolean; errors: string[] }> {
    try {
        schema.parse(artifact)
        return { valid: true, errors: [] }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                valid: false,
                errors: error.errors.map(e =>
                    `${e.path.join('.')}: ${e.message}`
                )
            }
        }
        return {
            valid: false,
            errors: ["Unknown validation error"]
        }
    }
}

/**
 * Check TTL status
 * Returns current validity based on artifact's updated_at and ttl setting
 */
export function checkTTLStatus(
    artifact: z.infer<typeof ArtifactMetadataSchema>
): { status: "valid" | "expired" | "expiring"; hours_remaining: number } {
    const now = new Date()
    const updated = new Date(artifact.updated_at)
    const ageHours = (now.getTime() - updated.getTime()) / (1000 * 60 * 60)

    const ttlHours: Record<string, number> = {
        permanent: Infinity,
        controlled: 48,
        archival: 90 * 24,
        ephemeral: 24
    }

    const maxHours = ttlHours[artifact.ttl] ?? 24
    const hoursRemaining = maxHours - ageHours

    if (hoursRemaining <= 0) {
        return { status: "expired", hours_remaining: 0 }
    } else if (hoursRemaining <= 2) {
        return { status: "expiring", hours_remaining: hoursRemaining }
    } else {
        return { status: "valid", hours_remaining: hoursRemaining }
    }
}

/**
 * Generate checksum for file content
 */
export async function generateChecksum(filePath: string): Promise<string> {
    const crypto = await import('crypto')
    const fs = await import('fs')
    const content = fs.readFileSync(filePath, 'utf-8')
    return crypto.createHash('sha256').update(content).digest('hex')
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ArtifactMetadata = z.infer<typeof ArtifactMetadataSchema>
export type StoryArtifact = z.infer<typeof StoryArtifactSchema>
export type ContextArtifact = z.infer<typeof ContextArtifactSchema>
export type SprintArtifact = z.infer<typeof SprintArtifactSchema>
export type HandoffArtifact = z.infer<typeof HandoffArtifactSchema>
export type ArchitectureArtifact = z.infer<typeof ArchitectureArtifactSchema>
