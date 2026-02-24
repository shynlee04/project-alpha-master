/**
 * BEAST-MODE ORCHESTRATOR v5.0.0 - FULL SKILL SYSTEM
 * 
 * Master plugin integrating:
 * - Skill Chains (sequential execution)
 * - Skill Combos (parallel execution)
 * - Automation Cycles (loop execution)
 * - Hierarchy Orchestration (governance)
 * 
 * Uses verified OpenCode hooks:
 * - chat.message
 * - tool.execute.before
 * - tool.execute.after
 * - experimental.session.compacting
 * 
 * @location .opencode/plugins/lifecycle/beast-mode-orchestrator.ts
 * @version 5.0.0
 * @date 2026-01-29
 */

import type { Plugin } from "@opencode-ai/plugin"

// ============================================================================
// SKILL TIER DEFINITIONS (from hierarchy-orchestration)
// ============================================================================

const SKILL_TIERS = {
    TIER_0_META: [
        "hierarchy-orchestration",
        "min-max-strategy",
        "bouncing-loops"
    ],
    TIER_1_ORCHESTRATION: [
        "skill-chains",
        "skill-combos",
        "automation-cycles",
        "using-superpowers"
    ],
    TIER_2_PROCESS: [
        "brainstorming",
        "writing-plans",
        "context-first",
        "story-cycle",
        "executing-plans"
    ],
    TIER_2_DOMAIN: [
        "frontend-components",
        "frontend-css",
        "frontend-responsive",
        "frontend-accessibility",
        "backend-api",
        "backend-models",
        "backend-queries",
        "backend-migrations"
    ],
    TIER_2_QUALITY: [
        "tdd-red",
        "test-driven-development",
        "testing-test-writing",
        "systematic-debugging",
        "verification-before-completion",
        "brownfield-guard"
    ]
} as const

// ============================================================================
// SKILL CHAINS (from skill-chains skill)
// ============================================================================

const SKILL_CHAINS = {
    "feature-development": [
        "brainstorming",
        "context-first",
        "writing-plans",
        "tdd-red",
        "executing-plans",
        "test-driven-development",
        "requesting-code-review",
        "verification-before-completion"
    ],
    "story-cycle": [
        "01-create-story",
        "02-validate-story",
        "03-create-context",
        "04-validate-context",
        "05-pre-planning",
        "06-dev-story",
        "07-code-review",
        "08-story-done",
        "09-retrospective"
    ],
    "bug-fix": [
        "systematic-debugging",
        "tdd-red",
        "executing-plans",
        "test-driven-development",
        "verification-before-completion"
    ],
    "code-review": [
        "requesting-code-review",
        "receiving-code-review",
        "verification-before-completion"
    ]
} as const

// ============================================================================
// SKILL COMBOS (from skill-combos skill)
// ============================================================================

const SKILL_COMBOS = {
    "frontend-implementation": [
        "frontend-components",
        "frontend-css",
        "frontend-responsive",
        "frontend-accessibility",
        "ui-layout-contract"
    ],
    "backend-implementation": [
        "backend-api",
        "backend-models",
        "backend-queries",
        "backend-migrations",
        "global-error-handling"
    ],
    "quality-assurance": [
        "global-coding-style",
        "global-commenting",
        "global-conventions",
        "global-validation"
    ],
    "deep-debugging": [
        "systematic-debugging",
        "tdd-red",
        "verification-before-completion"
    ]
} as const

// ============================================================================
// MIN-MAX STRATEGY
// ============================================================================

const MIN_SKILLS = [
    "using-superpowers",
    "context-first",
    "brownfield-guard",
    "verification-before-completion"
]

// ============================================================================
// PATH VALIDATION
// ============================================================================

const FORBIDDEN_PATHS = [
    /^src\/lib\//,
    /^lib\//,
    /^src\/helpers\//,
]

const CANONICAL_PATHS = {
    domain: "src/domain/",
    infrastructure: "src/infrastructure/",
    routes: "src/routes/",
    components: "src/components/",
    stores: "src/stores/",
}

// ============================================================================
// DETECTION FUNCTIONS
// ============================================================================

function detectRequestType(msg: string): string[] {
    const types: string[] = []

    if (/add|create|implement|build/i.test(msg)) types.push("feature")
    if (/story|epic|sprint/i.test(msg)) types.push("story")
    if (/bug|error|failing|broken|fix/i.test(msg)) types.push("bugfix")
    if (/review|PR|pull request/i.test(msg)) types.push("review")
    if (/component|UI|interface|page/i.test(msg)) types.push("frontend")
    if (/API|endpoint|database|model/i.test(msg)) types.push("backend")
    if (/refactor|split|god store|oversized/i.test(msg)) types.push("architecture")
    if (/done|complete|finished|ready/i.test(msg)) types.push("completion")

    return types.length > 0 ? types : ["general"]
}

function selectChain(types: string[]): string | null {
    if (types.includes("story")) return "story-cycle"
    if (types.includes("bugfix")) return "bug-fix"
    if (types.includes("review")) return "code-review"
    if (types.includes("feature")) return "feature-development"
    return null
}

function selectCombo(types: string[]): string | null {
    if (types.includes("frontend")) return "frontend-implementation"
    if (types.includes("backend")) return "backend-implementation"
    return null
}

function isForbiddenPath(path: string): boolean {
    return FORBIDDEN_PATHS.some(pattern => pattern.test(path))
}

function createBounce(
    violation: string,
    skill: string,
    action: string,
    tier: string
): string {
    return `⛔ BOUNCE: ${tier}

**Violation**: ${violation}
**Load skill**: ${skill}

**Required Action**:
${action}

DO NOT PROCEED until resolved.`
}

// ============================================================================
// MASTER PLUGIN EXPORT
// ============================================================================

export const BeastModeOrchestrator: Plugin = async (ctx) => {
    const triggeredCycles: string[] = []
    let currentChain: string | null = null
    let chainStep = 0

    return {
        // ═══════════════════════════════════════════════════════════════════
        // HOOK: chat.message
        // Tier 0 (Meta) + Tier 1 (Orchestration) skill loading
        // ═══════════════════════════════════════════════════════════════════
        "chat.message": async (
            input: { message?: { content?: string } },
            output: { skills?: string[]; context?: string[] }
        ) => {
            const message = input.message?.content || ""

            output.skills = output.skills || []
            output.context = output.context || []

            // ─────────────────────────────────────────────────────────────────
            // TIER 0: Always load meta-skills first
            // ─────────────────────────────────────────────────────────────────
            output.skills.push(...SKILL_TIERS.TIER_0_META)

            // ─────────────────────────────────────────────────────────────────
            // MIN STRATEGY: Always load MIN skills
            // ─────────────────────────────────────────────────────────────────
            output.skills.push(...MIN_SKILLS)

            // ─────────────────────────────────────────────────────────────────
            // Detect request type and select orchestration pattern
            // ─────────────────────────────────────────────────────────────────
            const types = detectRequestType(message)

            // Select chain if applicable
            const chain = selectChain(types)
            if (chain) {
                currentChain = chain
                chainStep = 0
                output.skills.push("skill-chains")
                const chainSkills = SKILL_CHAINS[chain as keyof typeof SKILL_CHAINS]
                if (chainSkills) {
                    output.skills.push(chainSkills[0]) // Load first step
                }
                output.context.push(
                    `🔗 CHAIN ACTIVATED: ${chain}\n` +
                    `Steps: ${SKILL_CHAINS[chain as keyof typeof SKILL_CHAINS]?.length || 0}\n` +
                    `Current step: 1`
                )
                triggeredCycles.push(`chain:${chain}`)
            }

            // Select combo if applicable
            const combo = selectCombo(types)
            if (combo) {
                output.skills.push("skill-combos")
                const comboSkills = SKILL_COMBOS[combo as keyof typeof SKILL_COMBOS]
                if (comboSkills) {
                    output.skills.push(...comboSkills)
                }
                output.context.push(
                    `🎯 COMBO ACTIVATED: ${combo}\n` +
                    `Parallel skills: ${comboSkills?.join(", ")}`
                )
                triggeredCycles.push(`combo:${combo}`)
            }

            // Completion requires verification cycle
            if (types.includes("completion")) {
                output.skills.push("automation-cycles")
                output.context.push(
                    `🔄 CYCLE ACTIVATED: verification-cycle\n` +
                    `Required evidence before completion claim:\n` +
                    `• pnpm typecheck:fast → PASS\n` +
                    `• pnpm test:fast → PASS\n` +
                    `• E2E journey → VERIFIED`
                )
                triggeredCycles.push("cycle:verification")
            }

            // Architecture triggers remediation cycle
            if (types.includes("architecture")) {
                output.skills.push("architecture-remediation")
                output.context.push(
                    `🏗️ CYCLE ACTIVATED: arch-remediation\n` +
                    `Specialist skills available:\n` +
                    `• component-splitter\n` +
                    `• store-refactorer\n` +
                    `• typescript-fixer`
                )
                triggeredCycles.push("cycle:arch-remediation")
            }

            // ─────────────────────────────────────────────────────────────────
            // Context summary
            // ─────────────────────────────────────────────────────────────────
            output.context.push(
                `\n🔥 BEAST-MODE v5.0 ACTIVE\n` +
                `Request types: ${types.join(", ")}\n` +
                `Active patterns: ${triggeredCycles.join(", ") || "MIN only"}`
            )

            // Deduplicate skills
            output.skills = [...new Set(output.skills)]
        },

        // ═══════════════════════════════════════════════════════════════════
        // HOOK: tool.execute.before
        // Pre-execution gates and bouncing loops
        // ═══════════════════════════════════════════════════════════════════
        "tool.execute.before": async (
            input: { tool?: { name?: string; args?: Record<string, unknown> } },
            output: { block?: boolean; reason?: string }
        ) => {
            const toolName = input.tool?.name || ""
            const args = input.tool?.args || {}

            // Path validation for write operations
            if (["write", "edit", "create"].includes(toolName)) {
                const path = (args.path || args.file || "") as string

                if (isForbiddenPath(path)) {
                    output.block = true
                    output.reason = createBounce(
                        `Invalid path "${path}"`,
                        "brownfield-guard",
                        `1. Consult architecture documentation\n` +
                        `2. Use canonical paths:\n` +
                        Object.entries(CANONICAL_PATHS)
                            .map(([k, v]) => `   • ${k}: ${v}`)
                            .join("\n"),
                        "BROWNFIELD-GUARD"
                    )
                    triggeredCycles.push("bounce:path-violation")
                    return
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════
        // HOOK: tool.execute.after
        // Post-execution governance and chain advancement
        // ═══════════════════════════════════════════════════════════════════
        "tool.execute.after": async (
            input: { tool?: { name?: string; args?: Record<string, unknown> }; result?: unknown },
            output: { context?: string[]; skills?: string[] }
        ) => {
            const toolName = input.tool?.name || ""
            const args = input.tool?.args || {}
            const path = (args.path || args.file || "") as string

            output.context = output.context || []
            output.skills = output.skills || []

            // Governance cascade after file edits
            if (["write", "edit", "create"].includes(toolName)) {
                output.context.push(
                    `🔍 GOVERNANCE REQUIRED\n` +
                    `Run: pnpm governance\n` +
                    `If TypeScript: pnpm typecheck:fast`
                )

                // Check for architecture violations
                if (path.match(/\.(ts|tsx)$/)) {
                    output.context.push(
                        `⚠️ LOC CHECK: If file exceeds 300 LOC, invoke component-splitter`
                    )
                }

                if (path.includes("stores/")) {
                    output.context.push(
                        `⚠️ STATE CHECK: Verify state boundaries\n` +
                        `• NO Zustand persist for Dexie data\n` +
                        `• USE shallow for selectors`
                    )
                }
            }

            // Chain step advancement
            if (currentChain) {
                const chainSkills = SKILL_CHAINS[currentChain as keyof typeof SKILL_CHAINS]
                if (chainSkills && chainStep < chainSkills.length - 1) {
                    chainStep++
                    const nextSkill = chainSkills[chainStep]
                    output.skills.push(nextSkill)
                    output.context.push(
                        `🔗 CHAIN ADVANCE: ${currentChain}\n` +
                        `Step ${chainStep + 1}/${chainSkills.length}: ${nextSkill}`
                    )
                } else if (chainSkills && chainStep >= chainSkills.length - 1) {
                    output.context.push(
                        `✅ CHAIN COMPLETE: ${currentChain}\n` +
                        `All ${chainSkills.length} steps executed`
                    )
                    currentChain = null
                    chainStep = 0
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════
        // HOOK: experimental.session.compacting
        // Preserve critical context during compaction
        // ═══════════════════════════════════════════════════════════════════
        "experimental.session.compacting": async (
            input: unknown,
            output: { context?: string[] }
        ) => {
            output.context = output.context || []

            output.context.push(
                `## 🔥 BEAST-MODE v5.0 - COMPACTION CONTEXT

### Skill System Hierarchy
- **Tier 0 (Meta)**: hierarchy-orchestration, min-max-strategy, bouncing-loops
- **Tier 1 (Orchestration)**: skill-chains, skill-combos, automation-cycles
- **Tier 2 (Process/Domain)**: brainstorming, frontend-*, backend-*, tdd-*
- **Tier 3 (Specialist)**: component-splitter, store-refactorer, etc.

### Active Patterns
${triggeredCycles.length > 0 ? triggeredCycles.map(c => `- ${c}`).join("\n") : "- MIN skills only"}

### Current Chain
${currentChain ? `- Chain: ${currentChain}, Step: ${chainStep + 1}` : "- No active chain"}

### MIN Skills (Always Load)
${MIN_SKILLS.map(s => `- ${s}`).join("\n")}

### Governance Commands
- pnpm governance
- pnpm typecheck:fast
- pnpm test:fast`
            )
        }
    }
}

export default BeastModeOrchestrator
