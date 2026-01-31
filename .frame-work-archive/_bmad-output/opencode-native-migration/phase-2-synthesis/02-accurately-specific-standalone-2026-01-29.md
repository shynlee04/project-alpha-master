---
id: "phase2_2_20260129_143000_accurately_specific"
title: "Phase 2.2: Accurately Specific with Concision - Standalone Methodology"
version: "1.0.0"
status: "ACTIVE"
date: "2026-01-29T14:30:00+07:00"
author: "analyst-ext"
category: "methodology"
tier: 2

purpose: |
  Definitive methodology for using metadata, frontmatter, custom tools, and
  overwritten commands to control context with precision. 100% standalone
  reference for OpenCode Native migration.

supersedes:
  - "Scattered frontmatter definitions"
  - "Manual artifact validation patterns"

related_documents:
  - "fw_20260129_103000_3methods" (Single Source of Truth)
  - "07-master-prompt-to-phase-mapping-2026-01-29.md"
  - "AGENTS.md"
  - "new-fundamental-truths.md"
---

# Phase 2.2: Accurately Specific with Concision

**Document ID**: phase2_2_20260129_143000_accurately_specific
**Version**: 1.0.0
**Status**: ACTIVE
**Date**: 2026-01-29
**Author**: analyst-ext

---

## Executive Summary

This methodology defines how to achieve **100% accuracy** with **97.5% token reduction** per artifact load by using:
- **Custom Tools** (TypeScript + Zod schemas) for validation
- **Frontmatter Standards** for metadata-driven control
- **@file Section References** for precision loading
- **Overwritten Commands** for context manipulation
- **Shell Output Injection** for real-time state

**The Transformation**: From loading 1,200-line artifacts (4,800 tokens) to loading 30-line sections (120 tokens) with schema validation.

---

## Section 1: The Core Principle

### 1.1 Definition

**"Accurately Specific with Concision"** = Use metadata, frontmatter, custom tools, and overwritten commands to control context with precision. Load only what's needed, validate everything, and maintain accuracy with minimal tokens.

### 1.2 The Four Pillars

| Pillar | OpenCode Primitive | Purpose | Token Impact |
|--------|-------------------|---------|--------------|
| **Custom Tools** | `.opencode/tools/*.ts` | Schema validation, TTL checks, budget tracking | 0 (runtime) |
| **Frontmatter** | YAML in `.md` files | Metadata-driven control, TTL, validation status | ~50 lines |
| **@file Refs** | `@file:path[section]` | Section-specific loading | -97.5% per artifact |
| **Shell Output** | `` !`command` `` | Real-time state injection | ~100 tokens |

### 1.3 How It Works

```typescript
// BEFORE: Full artifact load (4,800 tokens)
@file:_bmad-output/sprint-artifacts/stories/UXUI-03-01.md

// AFTER: Precision load with validation (120 tokens)
@file:_bmad-output/sprint-artifacts/stories/UXUI-03-01.md[frontmatter]
@file:_bmad-output/sprint-artifacts/stories/UXUI-03-01.md[acceptance_criteria]
!`git status --short`
!`pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l`

// Validation via custom tool
validate_artifact({
  artifact_path: "_bmad-output/sprint-artifacts/stories/UXUI-03-01.md",
  expected_type: "story"
})
```

### 1.4 Accuracy Guarantees

| Guarantee | Mechanism | Enforcement Point |
|-----------|-----------|-------------------|
| **No stale artifacts** | TTL validation | `validate_artifact` tool |
| **No invalid schemas** | Zod validation | Custom tools on load/save |
| **No prose waste** | @file sections | Command definitions |
| **No stale assumptions** | Shell output | Command execution |
| **No context poisoning** | Artifact registry | `validate_artifact` tool |

---

## Section 2: Brownfield Artifact Schemas (Zod)

### 2.1 Core Schema Definitions

**Location**: `.opencode/schemas/artifacts.ts`

```typescript
import { z } from "zod"

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Artifact metadata schema - required for ALL artifacts
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
 */
export function checkTTLStatus(
  artifact: z.infer<typeof ArtifactMetadataSchema>
): { status: "valid" | "expired" | "expiring"; hours_remaining: number } {
  const now = new Date()
  const updated = new Date(artifact.updated_at)
  const ageHours = (now.getTime() - updated.getTime()) / (1000 * 60 * 60)

  const ttlHours = {
    permanent: Infinity,
    controlled: 48,
    archival: 90 * 24,
    ephemeral: 24
  }[artifact.ttl]

  const hoursRemaining = ttlHours - ageHours

  if (hoursRemaining <= 0) {
    return { status: "expired", hours_remaining: 0 }
  } else if (hoursRemaining <= 2) {
    return { status: "expiring", hours_remaining }
  } else {
    return { status: "valid", hours_remaining }
  }
}

/**
 * Generate checksum
 */
export async function generateChecksum(filePath: string): Promise<string> {
  const crypto = require('crypto')
  const fs = require('fs')
  const content = fs.readFileSync(filePath, 'utf-8')
  return crypto.createHash('sha256').update(content).digest('hex')
}
```

### 2.2 Project Alpha Specific Constraints

**Embedded in schemas above**:

| Constraint | Schema Field | Validation |
|------------|--------------|------------|
| **No `src/lib` imports** | `StoryArtifactSchema.constraints.no_src_lib_imports` | Regex check |
| **Canonical paths** | `StoryArtifactSchema.constraints.canonical_path_required` | Path validation |
| **Component size limit** | `StoryArtifactSchema.constraints.max_component_lines` | Line count check |
| **Store size limit** | `StoryArtifactSchema.constraints.max_store_lines` | Line count check |
| **Test coverage** | `StoryArtifactSchema.constraints.test_coverage_required` | Coverage check |
| **useShallow usage** | `StoryArtifactSchema.constraints.use_shallow_required` | Regex check |

---

## Section 3: Frontmatter Standards

### 3.1 Agent Frontmatter

**Location**: `.opencode/agents/{agent-name}.md`

```yaml
---
description: "Senior developer agent for implementation tasks"
mode: subagent
model: anthropic/claude-sonnet-4-20250514
temperature: 0.3

# Tool Permissions
tools:
  write: true
  edit: true
  bash: true
  task: true

# Granular Permissions
permission:
  edit: "allow"
  bash:
    "*": "ask"
    "pnpm test *": "allow"
    "pnpm tsc *": "allow"
    "git status *": "allow"
  task:
    "*": "deny"
    "tea-ext": "allow"
    "real-world-validator": "allow"

# Capabilities
capabilities:
  - "TDD workflow (RED-GREEN-REFACTOR)"
  - "Clean architecture compliance"
  - "Type safety enforcement"
  - "Test coverage >= 80%"
  - "Code review with evidence"

# Skills (on-demand)
skills:
  - "story-cycle"
  - "test-driven-development"
  - "systematic-debugging"
  - "code-review-enhanced"

# Constraints
constraints:
  - "Never implement without context"
  - "Never skip dry reading"
  - "Never claim done without tests"
  - "Never use src/lib imports"
  - "Always use useShallow for Zustand"

# Timeboxing
timebox:
  step: 15  # minutes
  story: 240  # minutes (4 hours max)
---

You are a senior developer agent for Project Alpha.

## Your Role
Implement stories following TDD methodology with strict adherence to:
- Clean architecture (ADR-039)
- Type safety (TypeScript 5.9)
- Test coverage (>= 80%)
- 8-bit design system

## Before You Start
1. Load story context via @file[section] refs
2. Validate artifact freshness (TTL check)
3. Run dry reading (grep/glob) to understand codebase
4. Verify contracts and data flow

## Implementation Workflow
1. RED: Write failing test
2. GREEN: Write minimal code to pass
3. REFACTOR: Improve while keeping tests green
4. VERIFY: Run full test suite
5. REVIEW: Walk user journey, validate HTML output

## Governance Rules
- No src/lib imports (use src/infrastructure/*)
- Max 400 lines per component
- Max 300 lines per Zustand store
- Always use useShallow for selectors
- Test coverage >= 80% required

## On Completion
1. Update sprint status to "DONE"
2. Create handoff artifact
3. Register in ARTIFACT_REGISTRY.yaml
```

### 3.2 Workflow/Command Frontmatter

**Location**: `.opencode/commands/{command-name}.md`

```yaml
---
description: "Execute story development cycle with TDD"
agent: dev-ext
subtask: true
model: anthropic/claude-sonnet-4-20250514

# Context Loading
context:
  auto_load:
    - "$1[frontmatter]"
    - "$1[acceptance_criteria]"
    - "$1[affected_files]"
    - "_bmad-output/sprint-artifacts/sprint-status.yaml"

# Shell Commands
shell:
  - "git status --short"
  - "pnpm tsc --noEmit 2>&1 | grep 'error TS' | wc -l"

# Validation
validation:
  - "validate_artifact($1, 'story')"
  - "check_freshness($1)"

# Output
output:
  - "Update sprint status"
  - "Create handoff artifact"
  - "Register in ARTIFACT_REGISTRY"
---

Execute story cycle for story: $1

## Context Files (auto-loaded)
@file:$1[frontmatter]
@file:$1[acceptance_criteria]
@file:$1[affected_files]
@file:_bmad-output/sprint-artifacts/sprint-status.yaml

## Shell Status
!`git status --short`
!`pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l`

## Instructions
1. Load story-cycle skill
2. Execute TDD workflow (RED-GREEN-REFACTOR)
3. Validate acceptance criteria
4. Run test suite (coverage >= 80%)
5. Update sprint status on completion
```

### 3.3 Artifact Frontmatter

**Location**: `_bmad-output/sprint-artifacts/stories/{story-id}.md`

```yaml
---
artifact_id: "art_20260129_143000_abc123"
artifact_type: "story"
version: "1.0.0"
status: "ACTIVE"
created_at: "2026-01-29T14:30:00+07:00"
updated_at: "2026-01-29T14:30:00+07:00"
ttl: "ephemeral"
validation_status: "VALID"
checksum: "a1b2c3d4e5f6...64charsha256"

story_id: "UXUI-03-01"
epic_id: "EPIC-UXUI-03-PLUGIN-LAYOUT"
title: "Add GlobalSidebar to Project Routes"

effort:
  estimated_hours: 1
  complexity: "LOW"
  team: "B"

constraints:
  no_src_lib_imports: true
  canonical_path_required: true
  max_component_lines: 400
  max_store_lines: 300
  test_coverage_required: true
  use_shallow_required: true

dependencies: []
---

# UXUI-03-01: Add GlobalSidebar to Project Routes

## Description
Add GlobalSidebar component to all project routes (/notes, /ide, /settings)...

## Acceptance Criteria
- [ ] GlobalSidebar renders on all project routes
- [ ] Sidebar is collapsible
- [ ] State persists across route changes
- [ ] 8-bit design compliance

## Affected Files
- `src/routes/__root.tsx` (MODIFY)
- `src/presentation/components/layout/GlobalSidebar.tsx` (CREATE)
```

### 3.4 Frontmatter Validation Rules

| Rule | Schema | Enforcement |
|------|--------|-------------|
| **Date format** | ISO 8601 datetime | Zod validation |
| **Artifact ID format** | Regex pattern | Zod validation |
| **TTL values** | Enum | Zod validation |
| **Checksum** | SHA-256 (64 chars) | Zod validation |
| **Project Alpha constraints** | Boolean flags | Custom tool check |

---

## Section 4: Precision Context Tools

### 4.1 Tool: validate_artifact

**Location**: `.opencode/tools/validation.ts`

```typescript
import { tool } from "@opencode-ai/plugin"
import { z } from "zod"
import { StoryArtifactSchema, ContextArtifactSchema, checkTTLStatus, generateChecksum } from "../schemas/artifacts"

export const validateArtifact = tool({
  description: "Validate artifact against schema and check TTL/freshness",
  args: {
    artifact_path: z.string().describe("Path to artifact file"),
    expected_type: z.enum(["story", "context", "sprint", "handoff", "architecture"]).describe("Expected artifact type"),
    strict_mode: z.boolean().default(false).describe("Fail on any validation error")
  },
  async execute(args, context) {
    const fs = require('fs')

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
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)

    if (!frontmatterMatch) {
      return {
        valid: false,
        error: "No frontmatter found",
        artifact_path: args.artifact_path
      }
    }

    let frontmatter: any
    try {
      frontmatter = require('js-yaml').load(frontmatterMatch[1])
    } catch (error) {
      return {
        valid: false,
        error: "Invalid YAML frontmatter",
        artifact_path: args.artifact_path
      }
    }

    // 3. Validate against schema
    let schema: z.ZodSchema
    switch (args.expected_type) {
      case "story":
        schema = StoryArtifactSchema
        break
      case "context":
        schema = ContextArtifactSchema
        break
      default:
        return {
          valid: false,
          error: `Unsupported artifact type: ${args.expected_type}`,
          artifact_path: args.artifact_path
        }
    }

    const schemaResult = await schema.safeParseAsync(frontmatter)
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
    const ttlStatus = checkTTLStatus(frontmatter.metadata)
    if (ttlStatus.status === "expired") {
      return {
        valid: false,
        error: "Artifact expired (TTL exceeded)",
        ttl_status: ttlStatus,
        artifact_path: args.artifact_path
      }
    }

    // 5. Verify checksum
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

    // 6. Project Alpha specific validations
    const violations: string[] = []

    if (frontmatter.constraints?.no_src_lib_imports) {
      // Check if affected_files contain src/lib paths
      const hasSrcLib = frontmatter.affected_files?.some((f: any) =>
        f.path.includes('src/lib/')
      )
      if (hasSrcLib) {
        violations.push("Contains src/lib imports (deprecated)")
      }
    }

    if (frontmatter.constraints?.canonical_path_required) {
      // Check canonical path compliance
      const canonicalPaths = [
        'src/infrastructure/',
        'src/domain/',
        'src/presentation/',
        'src/routes/'
      ]
      const nonCanonical = frontmatter.affected_files?.filter((f: any) =>
        !canonicalPaths.some(p => f.path.startsWith(p))
      )
      if (nonCanonical?.length > 0) {
        violations.push(`Non-canonical paths: ${nonCanonical.map((f: any) => f.path).join(', ')}`)
      }
    }

    if (violations.length > 0 && args.strict_mode) {
      return {
        valid: false,
        error: "Project Alpha constraint violations",
        violations,
        artifact_path: args.artifact_path
      }
    }

    return {
      valid: true,
      artifact_id: frontmatter.metadata.artifact_id,
      artifact_type: frontmatter.metadata.artifact_type,
      ttl_status: ttlStatus,
      violations: violations.length > 0 ? violations : undefined,
      artifact_path: args.artifact_path
    }
  }
})
```

### 4.2 Tool: track_context_budget

**Location**: `.opencode/tools/context-budget.ts`

```typescript
import { tool } from "@opencode-ai/plugin"
import { z } from "zod"

export const trackContextBudget = tool({
  description: "Track and enforce context budget with alerts",
  args: {
    operation: z.enum(["check", "update", "reset"]).describe("Operation type"),
    tokens_used: z.number().optional().describe("Tokens used in operation"),
    threshold: z.number().default(0.8).describe("Alert threshold (0-1)")
  },
  async execute(args, context) {
    const fs = require('fs')
    const path = require('path')
    const statePath = path.join(context.directory, '_bmad-ext', 'state', 'CONTEXT_BUDGET.yaml')

    // Load or initialize budget state
    let budgetState: any = {
      total_budget: 400000, // 400K tokens
      used: 0,
      remaining: 400000,
      operations: [],
      alerts: []
    }

    if (fs.existsSync(statePath)) {
      const content = fs.readFileSync(statePath, 'utf-8')
      budgetState = require('js-yaml').load(content)
    }

    switch (args.operation) {
      case "check":
        const usageRatio = budgetState.used / budgetState.total_budget
        const alertLevel = usageRatio > args.threshold ? "WARNING" : "OK"

        return {
          budget: {
            total: budgetState.total_budget,
            used: budgetState.used,
            remaining: budgetState.remaining,
            usage_ratio: usageRatio.toFixed(2)
          },
          status: alertLevel,
          alert: usageRatio > args.threshold
            ? `Context budget at ${Math.round(usageRatio * 100)}% - consider compacting`
            : undefined
        }

      case "update":
        if (args.tokens_used === undefined) {
          return { error: "tokens_used required for update operation" }
        }

        budgetState.used += args.tokens_used
        budgetState.remaining = budgetState.total_budget - budgetState.used
        budgetState.operations.push({
          timestamp: new Date().toISOString(),
          tokens: args.tokens_used,
          agent: context.agent
        })

        // Check threshold
        const newUsageRatio = budgetState.used / budgetState.total_budget
        if (newUsageRatio > args.threshold) {
          budgetState.alerts.push({
            timestamp: new Date().toISOString(),
            level: "WARNING",
            message: `Context budget at ${Math.round(newUsageRatio * 100)}%`
          })
        }

        // Save state
        fs.writeFileSync(statePath, require('js-yaml').dump(budgetState))

        return {
          budget: {
            total: budgetState.total_budget,
            used: budgetState.used,
            remaining: budgetState.remaining,
            usage_ratio: newUsageRatio.toFixed(2)
          },
          alert: newUsageRatio > args.threshold
            ? `Context budget at ${Math.round(newUsageRatio * 100)}%`
            : undefined
        }

      case "reset":
        budgetState.used = 0
        budgetState.remaining = budgetState.total_budget
        budgetState.operations = []
        budgetState.alerts = []

        fs.writeFileSync(statePath, require('js-yaml').dump(budgetState))

        return {
          budget: {
            total: budgetState.total_budget,
            used: 0,
            remaining: budgetState.total_budget,
            usage_ratio: "0.00"
          },
          message: "Context budget reset"
        }

      default:
        return { error: `Unknown operation: ${args.operation}` }
    }
  }
})
```

### 4.3 Tool: load_minimal_context

**Location**: `.opencode/tools/context-loader.ts`

```typescript
import { tool } from "@opencode-ai/plugin"
import { z } from "zod"

export const loadMinimalContext = tool({
  description: "Load minimal context based on prompt matrix and @file refs",
  args: {
    prompt_type: z.enum([
      "A1", "A2", "A3",  // Ideation
      "B1", "B2", "B3",  // Fixes
      "C1", "C2", "C3",  // Refactoring
      "D1", "D2", "D3",  // Architecture
      "E1", "E2", "E3",  // Documentation
      "F1", "F2", "F3"   // Governance
    ]).describe("Prompt type from 18-type matrix"),
    story_id: z.string().optional().describe("Story ID if applicable"),
    sections: z.array(z.string()).optional().describe("Specific sections to load")
  },
  async execute(args, context) {
    const fs = require('fs')
    const path = require('path')

    // Prompt Matrix: Define what to load for each prompt type
    const promptMatrix: Record<string, string[]> = {
      // Ideation
      "A1": ["prd.md", "ux-specification/index.md"],
      "A2": ["prd.md", "architecture.md"],
      "A3": ["architecture.md", "ADR-039"],

      // Fixes
      "B1": ["sprint-status.yaml", "AGENTS.md"],
      "B2": ["$story_id[frontmatter,acceptance_criteria]", "sprint-status.yaml"],
      "B3": ["architecture.md", "ADR-039"],

      // Refactoring
      "C1": ["architecture.md", "new-fundamental-truths.md"],
      "C2": ["architecture.md", "AGENTS.md"],
      "C3": ["architecture.md", "ARTIFACT_REGISTRY.yaml"],

      // Architecture
      "D1": ["architecture.md", "ADR-039"],
      "D2": [],
      "D3": ["sprint-status.yaml", "epics.md"],

      // Documentation
      "E1": ["architecture.md"],
      "E2": ["ux-specification/index.md"],
      "E3": ["architecture.md", "ADR-039"],

      // Governance
      "F1": ["AGENTS.md", "LOOP_STATE.yaml"],
      "F2": ["AGENTS.md", "new-fundamental-truths.md"],
      "F3": ["AGENTS.md", "architecture.md"]
    }

    const loadList = promptMatrix[args.prompt_type] || []

    // Replace $story_id placeholder
    const resolvedLoadList = loadList.map(item =>
      item.replace('$story_id', args.story_id || '')
    )

    // Load each item
    const loadedContext: any[] = []

    for (const item of resolvedLoadList) {
      if (!item) continue

      // Parse @file[section] syntax
      const match = item.match(/^(.+?)\[(.+?)\]$/)
      if (match) {
        const filePath = match[1]
        const sections = match[2].split(',')

        if (!fs.existsSync(filePath)) {
          loadedContext.push({
            type: "error",
            path: filePath,
            message: "File not found"
          })
          continue
        }

        const content = fs.readFileSync(filePath, 'utf-8')

        // Extract sections (simplified - real implementation would use proper parser)
        for (const section of sections) {
          const sectionRegex = new RegExp(`^## ${section}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, 'm')
          const sectionMatch = content.match(sectionRegex)

          if (sectionMatch) {
            loadedContext.push({
              type: "section",
              path: filePath,
              section: section,
              content: sectionMatch[1].trim()
            })
          }
        }
      } else {
        // Load full file
        if (!fs.existsSync(item)) {
          loadedContext.push({
            type: "error",
            path: item,
            message: "File not found"
          })
          continue
        }

        const content = fs.readFileSync(item, 'utf-8')
        loadedContext.push({
          type: "file",
          path: item,
          content: content
        })
      }
    }

    return {
      prompt_type: args.prompt_type,
      loaded_count: loadedContext.length,
      context: loadedContext
    }
  }
})
```

---

## Section 5: Overwritten Commands Strategy

### 5.1 Compact Command Manipulation

**Concept**: Override the `compact` command behavior based on frontmatter metadata.

**Implementation**: `.opencode/commands/compact.md`

```yaml
---
description: "Smart compact based on artifact TTL and importance"
agent: plan
subtask: true
model: anthropic/claude-haiku-3.5-20241022

# Compact Strategy
strategy:
  ephemeral: "archive"      # Delete ephemeral artifacts
  archival: "summarize"     # Summarize archival artifacts
  controlled: "preserve"    # Keep controlled artifacts
  permanent: "never"        # Never compact permanent artifacts

# Priority Preservation
preserve_priority:
  - "AGENTS.md"
  - "architecture.md"
  - "ADR-039"
  - "new-fundamental-truths.md"
  - "AGENT-STATE.yaml"
  - "sprint-status.yaml"
---

Smart compact session context based on artifact metadata.

## Compact Rules

### TTL-Based Decisions
- **ephemeral** (24h): Archive to `_bmad-ext/.archive/ephemeral/`
- **archival** (90d): Summarize to 50 lines max
- **controlled** (48h): Keep full content
- **permanent**: Never compact

### Priority Preservation
These files are NEVER compacted:
- AGENTS.md (Tier 1)
- architecture.md (Tier 2)
- ADR-039 (Tier 1)
- new-fundamental-truths.md (Tier 1)
- AGENT-STATE.yaml (State)
- sprint-status.yaml (State)

## Execution

1. Load all artifacts with frontmatter
2. Check TTL and validation status
3. Apply compact strategy
4. Update AGENT-STATE.yaml with preserved context
5. Archive ephemeral artifacts

## Output
- Compaction summary
- Archived artifacts list
- Preserved artifacts list
```

### 5.2 Command: story-cycle (Overwritten)

**Location**: `.opencode/commands/story-cycle.md`

```yaml
---
description: "Execute story development cycle with TDD and validation"
agent: dev-ext
subtask: true
model: anthropic/claude-sonnet-4-20250514

# Context Loading
context:
  auto_load:
    - "$1[frontmatter]"
    - "$1[acceptance_criteria]"
    - "$1[affected_files]"
    - "$1[constraints]"
    - "_bmad-output/sprint-artifacts/sprint-status.yaml"

# Shell Commands
shell:
  - "git status --short"
  - "pnpm tsc --noEmit 2>&1 | grep 'error TS' | wc -l"
  - "pnpm vitest run --coverage 2>&1 | grep '% Files' | tail -1"

# Validation
validation:
  - "validate_artifact($1, 'story', strict_mode=true)"
  - "check_freshness($1)"

# Timeboxing
timebox:
  max_hours: 4
  check_interval: 15  # minutes

# Output
output:
  - "Update sprint status to DONE"
  - "Create handoff artifact"
  - "Register in ARTIFACT_REGISTRY.yaml"
  - "Update AGENT-STATE.yaml"
---

Execute story cycle for story: $1

## Context Files (auto-loaded)
@file:$1[frontmatter]
@file:$1[acceptance_criteria]
@file:$1[affected_files]
@file:$1[constraints]
@file:_bmad-output/sprint-artifacts/sprint-status.yaml

## Shell Status
!`git status --short`
!`pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l`
!`pnpm vitest run --coverage 2>&1 | grep '% Files' | tail -1`

## Instructions

### 1. Pre-Planning (MANDATORY)
- Load story context via @file refs above
- Validate artifact freshness (TTL check)
- Run dry reading: `grep -r "interface.*Props" src/`
- Run dry reading: `glob "src/**/*.ts"`
- Verify contracts and data flow

### 2. TDD Workflow
- **RED**: Write failing test
- **GREEN**: Write minimal code to pass
- **REFACTOR**: Improve while keeping tests green

### 3. Validation
- Test coverage >= 80%
- TypeScript errors = 0
- No src/lib imports
- Clean architecture compliance
- 8-bit design compliance

### 4. Code Review
- Walk user journey step-by-step
- Validate HTML output
- Check state persistence
- Verify cross-dependencies

### 5. Completion
- Update sprint status to "DONE"
- Create handoff artifact
- Register in ARTIFACT_REGISTRY.yaml
- Update AGENT-STATE.yaml

## Governance Rules
- Never implement without context
- Never skip dry reading
- Never claim done without tests
- Never use src/lib imports
- Always use useShallow for Zustand
- Max 400 lines per component
- Max 300 lines per store
```

### 5.3 Command: code-review (Overwritten)

**Location**: `.opencode/commands/code-review.md`

```yaml
---
description: "Adversarial code review with evidence requirements"
agent: plan
subtask: true
model: anthropic/claude-haiku-3.5-20241022

# Context Loading
context:
  auto_load:
    - "$1[frontmatter,acceptance_criteria]"
    - "_bmad-output/sprint-artifacts/sprint-status.yaml"

# Shell Commands
shell:
  - "git diff HEAD~1 --stat"
  - "pnpm tsc --noEmit 2>&1 | grep 'error TS' | wc -l"
  - "pnpm vitest run 2>&1 | tail -5"

# Evidence Requirements
evidence:
  required:
    - "User journey walkthrough"
    - "HTML output validation"
    - "State persistence check"
    - "Cross-dependency verification"

# Review Criteria
criteria:
  - "Clean architecture compliance"
  - "Type safety"
  - "Test coverage >= 80%"
  - "8-bit design compliance"
  - "No src/lib imports"
  - "useShallow usage"
---

Adversarial code review for story: $1

## Context Files (auto-loaded)
@file:$1[frontmatter,acceptance_criteria]
@file:_bmad-output/sprint-artifacts/sprint-status.yaml

## Shell Status
!`git diff HEAD~1 --stat`
!`pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l`
!`pnpm vitest run 2>&1 | tail -5`

## Review Process

### 1. Evidence Gathering (MANDATORY)
- Walk user journey step-by-step
- Validate HTML output (actual rendering)
- Check state persistence (reload test)
- Verify cross-dependencies (imports, circular deps)

### 2. Code Analysis
- Clean architecture compliance
- Type safety (no any, proper interfaces)
- Test coverage (>= 80%)
- 8-bit design (no rounded corners, pixel shadows)
- No src/lib imports
- useShallow for Zustand selectors

### 3. Skeptic Mode
- Challenge "TS passes" as only evidence
- Demand actual user journey validation
- Require HTML output screenshots
- Verify state persistence with reload

### 4. Output
- Pass/Fail decision
- Evidence list (with file paths)
- Issues found (with line numbers)
- Recommendations

## Governance Rules
- Never accept "TS passes" as only evidence
- Never skip user journey validation
- Never ignore state persistence issues
- Never approve without test coverage >= 80%
```

---

## Section 6: Integration with Methodology 1 & 3

### 6.1 Methodology 1 Integration (Less for More)

| Methodology 1 | Methodology 2 | Integration Point |
|---------------|---------------|-------------------|
| **Skills** (on-demand) | **Commands** (invoke skills) | Commands load skills via `skill` tool |
| **Agents** (permissions) | **Frontmatter** (agent config) | Agent frontmatter defines permissions |
| **Permissions** (granular) | **Custom Tools** (enforce) | Tools validate permissions before execution |

### 6.2 Methodology 3 Integration (Auto Governance)

| Methodology 2 | Methodology 3 | Integration Point |
|---------------|---------------|-------------------|
| **Custom Tools** (validation) | **Plugins** (hooks) | Plugins call tools on `tool.execute.before` |
| **Frontmatter** (metadata) | **Plugins** (TTL checks) | Plugins read frontmatter for TTL validation |
| **Commands** (context) | **Plugins** (compaction) | Compaction hook reads command context |

### 6.3 Unified Workflow Example

```typescript
// 1. User invokes command
/story-cycle UXUI-03-01.md

// 2. Methodology 2: Command loads context
@file:UXUI-03-01.md[frontmatter,acceptance_criteria]
!`git status --short`

// 3. Methodology 3: Plugin validates before execution
tool.execute.before:
  - validate_artifact("UXUI-03-01.md", "story")
  - checkTTL(frontmatter.metadata)

// 4. Methodology 1: Agent loads skill on-demand
skill("story-cycle")

// 5. Methodology 2: Tool tracks context budget
track_context_budget({ operation: "update", tokens_used: 1500 })

// 6. Methodology 3: Plugin updates state after execution
tool.execute.after:
  - updateAgentState({ story_id: "UXUI-03-01", status: "DONE" })
  - registerArtifact("UXUI-03-01.md")
```

---

## Section 7: Success Criteria

### 7.1 Quantitative Targets

| Metric | Current | Target | Validation Method |
|--------|---------|--------|-------------------|
| **Token reduction per artifact** | 0% | 97.5% | @file section vs full load comparison |
| **Artifact validation rate** | 0% | 100% | Schema validation logs |
| **TTL enforcement rate** | 0% | 100% | Stale artifact block logs |
| **Context budget tracking** | 0% | 100% | CONTEXT_BUDGET.yaml updates |
| **Frontmatter compliance** | ~30% | 100% | Schema validation on all artifacts |

### 7.2 Qualitative Targets

- [ ] All artifacts have valid frontmatter with TTL
- [ ] All artifacts validate against Zod schemas
- [ ] Stale artifacts blocked from loading (2h TTL)
- [ ] Context budget tracked and alerts at 80%
- [ ] Commands use @file[section] for precision loading
- [ ] Custom tools enforce Project Alpha constraints
- [ ] Compact command respects TTL and priority

### 7.3 Evidence Requirements

| Criterion | Evidence Type | Collection Method |
|-----------|---------------|-------------------|
| Token reduction | Token count log | Compare @file[section] vs full load |
| Artifact validation | Schema validation log | validate_artifact tool results |
| TTL enforcement | Block log | Stale artifact rejection logs |
| Context budget | CONTEXT_BUDGET.yaml | track_context_budget tool updates |
| Frontmatter compliance | Schema validation | Frontmatter schema check |

---

## Section 8: Quick Reference

### 8.1 OpenCode Primitives Used

| Primitive | Purpose | Location |
|-----------|---------|----------|
| **Custom Tools** | Validation, budget tracking | `.opencode/tools/*.ts` |
| **Commands** | Slash-invoked workflows | `.opencode/commands/*.md` |
| **@file refs** | Section-specific loading | Command definitions |
| **Shell output** | Real-time state | Command definitions |
| **Frontmatter** | Metadata-driven control | All .md files |
| **Zod schemas** | Type validation | `.opencode/schemas/*.ts` |

### 8.2 File Location Reference

| Purpose | Location |
|---------|----------|
| **Artifact schemas** | `.opencode/schemas/artifacts.ts` |
| **Validation tools** | `.opencode/tools/validation.ts` |
| **Context budget tool** | `.opencode/tools/context-budget.ts` |
| **Context loader tool** | `.opencode/tools/context-loader.ts` |
| **Story cycle command** | `.opencode/commands/story-cycle.md` |
| **Code review command** | `.opencode/commands/code-review.md` |
| **Compact command** | `.opencode/commands/compact.md` |
| **Agent definitions** | `.opencode/agents/*.md` |

### 8.3 Token Savings Summary

```
BEFORE (Full artifact load):
+----------------------------------------------------+
| ████████████████████████████████████████████████░ | 4,800 tokens
| |------------------ 1,200 lines -----------------| |
+----------------------------------------------------+

AFTER (Section-specific load):
+----------------------------------------------------+
| ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ | 120 tokens
| |--- 30 lines (frontmatter + acceptance criteria) -| |
+----------------------------------------------------+

Savings: 97.5% per artifact
```

---

## Appendix A: Project Alpha Brownfield Constraints

### A.1 Deprecated Paths

| Deprecated Path | Replacement | Validation |
|-----------------|-------------|------------|
| `src/lib/workspace/` | `src/infrastructure/persistence/stores/` | Regex check |
| `src/lib/filesystem/` | `src/infrastructure/filesystem/` | Regex check |
| `src/lib/state/` | `src/infrastructure/persistence/stores/` | Regex check |
| `src/lib/sync/` | `src/infrastructure/sync/` | Regex check |
| `src/stores/` | `src/infrastructure/persistence/stores/` | Regex check |

### A.2 Size Limits

| Artifact Type | Max Lines | Validation |
|---------------|-----------|------------|
| **Component** | 400 | Line count check |
| **Zustand Store** | 300 | Line count check |
| **Story File** | 500 | Line count check |
| **Context XML** | 1000 | Line count check |

### A.3 Required Patterns

| Pattern | Requirement | Validation |
|---------|-------------|------------|
| **useShallow** | Required for Zustand selectors | Regex check |
| **Test coverage** | >= 80% | Coverage check |
| **TypeScript errors** | 0 | TSC check |
| **8-bit design** | No rounded corners, pixel shadows | CSS check |
| **Canonical paths** | Use src/infrastructure/* | Path validation |

---

## Appendix B: Decision Tree for Context Loading

```
START: What do you need to load?
    │
    ├─ "Story context"
    │   └─ @file:story.md[frontmatter,acceptance_criteria,affected_files]
    │
    ├─ "Architecture"
    │   └─ @file:architecture.md[adr-039-alignment,layer-structure]
    │
    ├─ "Sprint status"
    │   └─ @file:sprint-status.yaml
    │
    ├─ "Governance rules"
    │   └─ @file:AGENTS.md[governance-rules,tool-constraints]
    │
    └─ "Real-time state"
        └─ !`git status --short`
        └─ !`pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l`
```

---

**Document End**

**Version**: 1.0.0
**Created**: 2026-01-29T14:30:00+07:00
**Author**: analyst-ext
**Status**: ACTIVE
**Lines**: ~1,200

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-29 | analyst-ext | Initial methodology creation |