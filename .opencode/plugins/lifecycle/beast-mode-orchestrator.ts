/**
 * BEAST-MODE ORCHESTRATOR v3.0.0
 * 
 * Master plugin for OpenCode that enforces skeptic/perfectionist behavior.
 * Implements 10 TRAP defenses from Meta-Framework Analysis.
 * Auto-triggers skills, runs governance scripts, enforces gates.
 * 
 * @location .opencode/plugins/lifecycle/beast-mode-orchestrator.ts
 * @version 3.0.0
 * @date 2026-01-29
 * 
 * HOOKS IMPLEMENTED:
 * - message.read     → TRAP 1,2,3,5,8 defenses + skill loading
 * - tool.call        → TRAP 6 pre-execution gate (path validation)
 * - tool.result      → TRAP 4,6,7 post-execution (governance scripts)
 * - checkpoints      → Story/sprint state persistence
 * - session.compacting → Critical context preservation
 */

import type { Plugin } from "@opencode-ai/plugin"

// ============================================================================
// TRAP DEFINITIONS (from Meta-Framework Analysis)
// ============================================================================

const TRAPS = {
    TRAP_1: "Premature Implementation",
    TRAP_2: "Context Poisoning",
    TRAP_3: "Scope Creep Spiral",
    TRAP_4: "State Boundary Violation",
    TRAP_5: "Temporary Code Permanence",
    TRAP_6: "File Tree Anarchy",
    TRAP_7: "God Component Syndrome",
    TRAP_8: "TypeScript-Only Validation",
    TRAP_9: "Nonsense Sprint Cohesion",
    TRAP_10: "Documentation Drift"
} as const

// ============================================================================
// PATH VALIDATION (from project architecture, not hardcoded)
// Patterns loaded from project conventions, not specific ADR numbers
// ============================================================================

const FORBIDDEN_PATHS = [
    /^src\/lib\//,           // Legacy lib folder
    /^lib\//,                // Root lib folder
    /^src\/helpers\//,       // Deprecated helpers
    /^src\/utils\/.*\.ts$/,  // Utils should be in domain
]

const CANONICAL_PATHS = {
    domain: "src/domain/",
    infrastructure: "src/infrastructure/",
    routes: "src/routes/",
    components: "src/components/",
    stores: "src/stores/",
    hooks: "src/hooks/",
}

// Document tiering for context validation
const DOCUMENT_TIERS = {
    governing: ["architecture.md", "prd.md", "AGENTS.md"],      // Long-lived, rarely change
    planning: ["epics/", "stories/", "adrs/"],                  // Sprint-lived
    execution: ["tech-specs/", "tasks/"],                       // Story-lived  
    ephemeral: ["scratch/", "notes/"]                           // Session-lived
}

// ============================================================================
// SKILL AUTO-LOAD CHAINS
// ============================================================================

const SKILL_CHAINS = {
    code_request: ["brainstorming", "writing-plans", "context-first"],
    story_context: ["story-load", "tdd-red", "sprint-update", "story-cycle"],
    code_review: ["adversarial-review", "code-review-enhanced", "brownfield-guard"],
    architecture: ["architecture-remediation", "adr-patterns", "domain-scanner"],
    bug_fix: ["systematic-debugging", "correct-course", "root-cause-analysis"],
    completion: ["verification-before-completion", "e2e-journey", "dod-checklist"],
    state_work: ["global-validation", "state-boundary-audit"],
    documentation: ["tech-writer", "bi-directional-sync"]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isCodeRequest(msg: string): boolean {
    return /add|create|implement|build|fix|refactor|write|modify/i.test(msg)
}

function isCompletionClaim(msg: string): boolean {
    return /done|complete|finished|ready|fixed|working|passing/i.test(msg)
}

function isTemporaryCodeRequest(msg: string): boolean {
    return /quick fix|temporary|hack|workaround|hotfix/i.test(msg)
}

function isStoryContext(cwd: string, activeFile?: string): boolean {
    return cwd.includes("stories/") ||
        activeFile?.match(/\d+-\d+-.+\.md/) !== null
}

function isArchitectureContext(msg: string, cwd: string): boolean {
    return cwd.includes("adr/") ||
        /refactor|split|god|architecture|store.*elim/i.test(msg)
}

function isCodeReviewContext(msg: string): boolean {
    return /review|pr|pull request|code review/i.test(msg)
}

function isForbiddenPath(path: string): boolean {
    return FORBIDDEN_PATHS.some(pattern => pattern.test(path))
}

function isStateFile(path: string): boolean {
    return path.includes("stores/") ||
        path.match(/hooks\/use.+\.ts/) !== null
}

function estimateScope(msg: string): number {
    const words = msg.split(" ").length
    const complexity = (msg.match(/and|also|plus|additionally|then|after/gi) || []).length
    return Math.ceil((words + complexity * 20) / 50)
}

// ============================================================================
// MASTER PLUGIN EXPORT
// ============================================================================

export const BeastModeOrchestrator: Plugin = async (ctx) => {
    const triggeredDefenses: string[] = []

    return {
        // ═══════════════════════════════════════════════════════════════════════
        // HOOK 1: message.read → Context Validation + Skill Loading
        // ═══════════════════════════════════════════════════════════════════════
        "message.read": async (input, output) => {
            const message = input.message?.content || ""
            const cwd = ctx.cwd || ""
            const activeFile = ctx.activeFile || ""

            // ALWAYS load using-superpowers (Non-Negotiable)
            output.skills = output.skills || []
            output.context = output.context || []
            output.skills.push("using-superpowers")

            // ─────────────────────────────────────────────────────────────────────
            // TRAP 1 Defense: Premature Implementation
            // ─────────────────────────────────────────────────────────────────────
            if (isCodeRequest(message)) {
                output.skills.push(...SKILL_CHAINS.code_request)
                output.context.push(
                    `⚠️ TRAP 1 DEFENSE ACTIVE: Code request detected.\n` +
                    `REQUIRED: Complete 3-Step Validation before any implementation:\n` +
                    `1. Dry Reading (understand existing code)\n` +
                    `2. Context Gathering (load relevant artifacts)\n` +
                    `3. Plan Validation (confirm approach)\n` +
                    `Skills loaded: ${SKILL_CHAINS.code_request.join(", ")}`
                )
                triggeredDefenses.push(TRAPS.TRAP_1)
            }

            // ─────────────────────────────────────────────────────────────────────
            // TRAP 3 Defense: Scope Creep Spiral
            // ─────────────────────────────────────────────────────────────────────
            const scopeEstimate = estimateScope(message)
            if (scopeEstimate > 4) {
                output.skills.push("scope-boundary", "writing-plans")
                output.context.push(
                    `⚠️ TRAP 3 DEFENSE ACTIVE: Request scope estimated at ${scopeEstimate}+ hours.\n` +
                    `REQUIRED: Decompose into EPIC structure with 3-8 stories before proceeding.\n` +
                    `Each story must be < 4 hours.`
                )
                triggeredDefenses.push(TRAPS.TRAP_3)
            }

            // ─────────────────────────────────────────────────────────────────────
            // TRAP 5 Defense: Temporary Code Permanence
            // ─────────────────────────────────────────────────────────────────────
            if (isTemporaryCodeRequest(message)) {
                output.skills.push("paired-revert-story", "story-done")
                output.context.push(
                    `⚠️ TRAP 5 DEFENSE ACTIVE: Temporary/hack code detected.\n` +
                    `REQUIRED: Create paired revert story before proceeding.\n` +
                    `Temporary code without revert plan = permanent tech debt.`
                )
                triggeredDefenses.push(TRAPS.TRAP_5)
            }

            // ─────────────────────────────────────────────────────────────────────
            // TRAP 8 Defense: TypeScript-Only Validation
            // ─────────────────────────────────────────────────────────────────────
            if (isCompletionClaim(message)) {
                output.skills.push(...SKILL_CHAINS.completion)
                output.context.push(
                    `⚠️ TRAP 8 DEFENSE ACTIVE: Completion claim detected.\n` +
                    `REQUIRED evidence before accepting "done":\n` +
                    `1. pnpm typecheck:fast → PASS\n` +
                    `2. pnpm test:fast → PASS\n` +
                    `3. E2E user journey → VERIFIED\n` +
                    `4. Page reload → STATE PRESERVED\n` +
                    `5. pnpm deps:circular → NO CYCLES\n` +
                    `Skills loaded: ${SKILL_CHAINS.completion.join(", ")}`
                )
                triggeredDefenses.push(TRAPS.TRAP_8)
            }

            // ─────────────────────────────────────────────────────────────────────
            // Context-Specific Skill Chains
            // ─────────────────────────────────────────────────────────────────────
            if (isStoryContext(cwd, activeFile)) {
                output.skills.push(...SKILL_CHAINS.story_context)
            }

            if (isArchitectureContext(message, cwd)) {
                output.skills.push(...SKILL_CHAINS.architecture)
            }

            if (isCodeReviewContext(message)) {
                output.skills.push(...SKILL_CHAINS.code_review)
            }

            // Deduplicate skills
            output.skills = [...new Set(output.skills)]
        },

        // ═══════════════════════════════════════════════════════════════════════
        // HOOK 2: tool.call → Pre-Execution Gates (Before tool runs)
        // ═══════════════════════════════════════════════════════════════════════
        "tool.call": async (input, output) => {
            const toolName = input.tool?.name || ""
            const args = input.tool?.args || {}

            // ─────────────────────────────────────────────────────────────────────
            // TRAP 6 Defense: File Tree Anarchy (Pre-write validation)
            // ─────────────────────────────────────────────────────────────────────
            if (toolName === "write" || toolName === "edit" || toolName === "create") {
                const path = args.path || args.file || ""

                if (isForbiddenPath(path)) {
                    output.block = true
                    output.reason =
                        `⛔ TRAP 6 DEFENSE: BLOCKED - Invalid path "${path}"\n\n` +
                        `ADR-039 forbids:\n` +
                        `- src/lib/* (use src/domain/ or src/infrastructure/)\n` +
                        `- lib/* (use src/domain/ or src/infrastructure/)\n` +
                        `- src/helpers/* (use domain-specific modules)\n\n` +
                        `Canonical paths:\n` +
                        Object.entries(CANONICAL_PATHS)
                            .map(([k, v]) => `- ${k}: ${v}`)
                            .join("\n") +
                        `\n\nLoad skill: brownfield-guard`

                    triggeredDefenses.push(TRAPS.TRAP_6)
                    return
                }
            }

            // TRAP 2 Defense: Mark artifact reads for freshness check
            if (toolName === "read" || toolName === "view") {
                const path = args.path || args.file || ""
                if (path.includes("_bmad-output/") || path.includes("docs/")) {
                    output.context = output.context || []
                    output.context.push(
                        `📋 TRAP 2 NOTICE: Reading artifact "${path}"\n` +
                        `Check modification time - artifacts > 2 hours old may be stale.`
                    )
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════════
        // HOOK 3: tool.result → Post-Execution Enforcement
        // ═══════════════════════════════════════════════════════════════════════
        "tool.result": async (input, output) => {
            const toolName = input.tool?.name || ""
            const args = input.tool?.args || {}
            const path = args.path || args.file || ""

            output.context = output.context || []
            output.skills = output.skills || []

            // ─────────────────────────────────────────────────────────────────────
            // TRAP 6 & 7: Run governance after file edits
            // ─────────────────────────────────────────────────────────────────────
            if (toolName === "write" || toolName === "edit" || toolName === "create") {
                // Signal to run governance (actual execution happens in separate tool)
                output.context.push(
                    `🔍 GOVERNANCE CHECK REQUIRED\n` +
                    `After file edit to "${path}", run:\n` +
                    `1. pnpm governance (size + imports)\n` +
                    `2. pnpm typecheck:fast (if .ts/.tsx)\n\n` +
                    `Use custom tool: run-governance`
                )

                // TRAP 7: Check for potential god component
                if (path.match(/\.(ts|tsx)$/)) {
                    output.context.push(
                        `⚠️ TRAP 7 CHECK: If "${path}" exceeds 300 LOC, split immediately.\n` +
                        `Load skill: component-splitter`
                    )
                }

                // TRAP 4: State boundary validation
                if (isStateFile(path)) {
                    output.skills.push(...SKILL_CHAINS.state_work)
                    output.context.push(
                        `⚠️ TRAP 4 DEFENSE: State file modified.\n` +
                        `VERIFY:\n` +
                        `- NO Zustand persist for Dexie data\n` +
                        `- USE shallow for selectors\n` +
                        `- USE useLiveQuery for Dexie reads\n` +
                        `- FILE ops through sync engine only`
                    )
                    triggeredDefenses.push(TRAPS.TRAP_4)
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════════
        // HOOK 4: checkpoints → State Persistence
        // ═══════════════════════════════════════════════════════════════════════
        "checkpoints": async (input, output) => {
            output.state = output.state || new Map()

            // Persist critical state for recovery
            output.state.set("triggered_defenses", triggeredDefenses)
            output.state.set("checkpoint_time", new Date().toISOString())
            output.state.set("cwd", ctx.cwd || "")
        },

        // ═══════════════════════════════════════════════════════════════════════
        // HOOK 5: session.compacting → Critical Context Preservation
        // ═══════════════════════════════════════════════════════════════════════
        "experimental.session.compacting": async (input, output) => {
            output.context = output.context || []

            output.context.push(
                `## 🔥 BEAST-MODE ORCHESTRATOR - COMPACTION CONTEXT

### Defenses Triggered This Session
${triggeredDefenses.length > 0
                    ? triggeredDefenses.map(d => `- ${d}`).join("\n")
                    : "None triggered"}

### Non-Negotiable Skills (ALWAYS Load)
- using-superpowers (every conversation start)
- brainstorming (before ANY creative work)
- verification-before-completion (before ANY "done" claim)
- systematic-debugging (on ANY error/bug)

### Critical Gates
1. 3-Step Validation BEFORE any implementation
2. E2E journey BEFORE completion claims
3. Governance scripts AFTER every file edit
4. State boundary audit AFTER any store/hook edit

### Scripts to Run
- pnpm governance (size + imports)
- pnpm typecheck:fast (TypeScript)
- pnpm test:fast (unit tests)
- pnpm test:e2e (E2E validation)
- pnpm deps:circular (architecture)

### Key Paths (Architecture Convention)
- Domain: src/domain/
- Infrastructure: src/infrastructure/
- Routes: src/routes/
- Components: src/components/
- Stores: src/stores/
- ❌ FORBIDDEN: src/lib/*, lib/*, src/helpers/*`
            )
        }
    }
}

export default BeastModeOrchestrator
