/**
 * ============================================================================
 * MASTER ORCHESTRATOR PLUGIN v2.0.0 (DEEP INTEGRATION)
 * ============================================================================
 * 
 * The SINGLE source of truth for all OpenCode plugin functionality.
 * All other plugins are DEPRECATED - this consolidates everything.
 * 
 * INTEGRATED MODULES:
 * 1. State Management (LOOP_STATE, ARTIFACT_REGISTRY)
 * 2. Context-First Injection (from context-first-starter.ts)
 * 3. Architecture Enforcement (from architecture-enforcer.ts)
 * 4. Brownfield Guard (from pre-execution/brownfield-guard.ts)
 * 5. God Artifact Guard (from post-execution/god-artifact-guard.ts)
 * 6. Governance Script Integration (pnpm governance, typecheck, test)
 * 7. Event Emission for Agent Coordination
 * 8. Skill Chain Orchestration (from beast-mode-orchestrator.ts)
 * 
 * HOOK USAGE (from OpenCode Official Docs):
 * - tool.execute.before: Pre-validate file operations
 * - tool.execute.after: Post-validate and run governance
 * - experimental.chat.messages.transform: Inject context
 * - experimental.chat.system.transform: Inject system instructions
 * - experimental.session.compacting: Preserve state during compaction
 * - session.created, session.updated, session.idle: Lifecycle events
 * 
 * @location .opencode/plugins/master-orchestrator.ts
 * @version 2.0.0
 * @date 2026-01-30
 * @deprecates context-first-starter.ts, architecture-enforcer.ts, 
 *             pre-execution/*, post-execution/*, lifecycle/*
 * ============================================================================
 */

import type { Plugin } from "@opencode-ai/plugin";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { z } from "zod";

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    PROJECT_ROOT: process.cwd(),

    // State files
    STATE_DIR: ".opencode/state",
    LOOP_STATE_FILE: ".opencode/state/LOOP_STATE.yaml",
    ARTIFACT_REGISTRY_FILE: ".opencode/state/ARTIFACT_REGISTRY.yaml",

    // Governance
    ESCALATION_DIR: "_bmad-output/governance/escalations",
    CYCLES_FILE: "_bmad-output/governance/cycles.yaml",

    // Context files
    DELEGATION_REMINDER: ".opencode/prompt/delegation-reminder.md",
    PRD_FILE: "_bmad-output/planning-artifacts/prd.md",
    ARCHITECTURE_FILE: "_bmad-output/planning-artifacts/architecture.md",

    // Debug
    DEBUG: process.env.OPENCODE_MASTER_DEBUG === "true",
    LOG_FILE: ".opencode/logs/master-orchestrator.log",

    // Governance commands (from package.json)
    GOVERNANCE_COMMANDS: {
        typecheck: "pnpm typecheck:fast",
        test: "pnpm test:fast",
        governance: "pnpm governance",
        imports: "pnpm governance:imports",
        sizes: "pnpm governance:size",
        circular: "pnpm deps:circular",
        contracts: "pnpm contracts:check",
    },

    // Timeout for governance commands (ms)
    COMMAND_TIMEOUT: 60000,
};

// ============================================================================
// LOGGING MODULE
// ============================================================================

function log(message: string, level: "INFO" | "WARN" | "ERROR" = "INFO"): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] [MASTER-ORCHESTRATOR] ${message}\n`;

    if (CONFIG.DEBUG) {
        console.log(logMessage.trim());
    }

    try {
        const logDir = path.dirname(path.join(CONFIG.PROJECT_ROOT, CONFIG.LOG_FILE));
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        fs.appendFileSync(path.join(CONFIG.PROJECT_ROOT, CONFIG.LOG_FILE), logMessage);
    } catch (e) {
        // Silent fail for logging
    }
}

// ============================================================================
// MODULE 1: STATE MANAGEMENT
// ============================================================================

interface LoopState {
    version: string;
    last_updated: string;
    active_agent: string | null;
    active_workflow: string | null;
    current_phase: string;
    delegations: {
        active: {
            parent_agent: string;
            child_agent: string;
            handoff_artifact: string;
            started_at: string;
        } | null;
        history: Array<{
            parent_agent: string;
            child_agent: string;
            completed_at: string;
            status: string;
        }>;
    };
    events: {
        last_event: string | null;
        queue: string[];
    };
}

const StateSyncModule = {
    state: null as LoopState | null,

    async initialize(): Promise<void> {
        try {
            const stateDir = path.join(CONFIG.PROJECT_ROOT, CONFIG.STATE_DIR);
            const stateFile = path.join(CONFIG.PROJECT_ROOT, CONFIG.LOOP_STATE_FILE);

            if (!fs.existsSync(stateDir)) {
                fs.mkdirSync(stateDir, { recursive: true });
                log("Created state directory");
            }

            if (fs.existsSync(stateFile)) {
                const content = fs.readFileSync(stateFile, "utf-8");
                this.state = this.parseYaml(content);
                log("Loaded existing LOOP_STATE");
            } else {
                this.state = this.createInitialState();
                this.save();
                log("Created new LOOP_STATE");
            }
        } catch (e) {
            log(`State initialization error: ${e}`, "ERROR");
            this.state = this.createInitialState();
        }
    },

    createInitialState(): LoopState {
        return {
            version: "2.0.0",
            last_updated: new Date().toISOString(),
            active_agent: null,
            active_workflow: null,
            current_phase: "unknown",
            delegations: {
                active: null,
                history: [],
            },
            events: {
                last_event: null,
                queue: [],
            },
        };
    },

    parseYaml(content: string): LoopState {
        try {
            const lines = content.split("\n");
            const state: LoopState = this.createInitialState();

            for (const line of lines) {
                if (line.includes("active_agent:")) {
                    const value = line.split(":")[1]?.trim();
                    state.active_agent = value === "null" ? null : value?.replace(/['"]/g, "");
                }
                if (line.includes("active_workflow:")) {
                    const value = line.split(":")[1]?.trim();
                    state.active_workflow = value === "null" ? null : value?.replace(/['"]/g, "");
                }
                if (line.includes("current_phase:")) {
                    const value = line.split(":")[1]?.trim();
                    state.current_phase = value?.replace(/['"]/g, "") || "unknown";
                }
                if (line.includes("last_updated:")) {
                    const value = line.split(":").slice(1).join(":").trim();
                    state.last_updated = value?.replace(/['"]/g, "") || new Date().toISOString();
                }
            }

            return state;
        } catch (e) {
            return this.createInitialState();
        }
    },

    toYaml(): string {
        const s = this.state!;
        return `# LOOP_STATE.yaml - Managed by Master Orchestrator v2.0
# DO NOT EDIT MANUALLY

version: "${s.version}"
last_updated: "${s.last_updated}"
active_agent: ${s.active_agent ? `"${s.active_agent}"` : "null"}
active_workflow: ${s.active_workflow ? `"${s.active_workflow}"` : "null"}
current_phase: "${s.current_phase}"

delegations:
  active: ${s.delegations.active ? `
    parent_agent: "${s.delegations.active.parent_agent}"
    child_agent: "${s.delegations.active.child_agent}"
    handoff_artifact: "${s.delegations.active.handoff_artifact}"
    started_at: "${s.delegations.active.started_at}"` : "null"}
  history_count: ${s.delegations.history.length}

events:
  last_event: ${s.events.last_event ? `"${s.events.last_event}"` : "null"}
  queue_length: ${s.events.queue.length}
`;
    },

    save(): void {
        if (this.state) {
            this.state.last_updated = new Date().toISOString();
            try {
                fs.writeFileSync(
                    path.join(CONFIG.PROJECT_ROOT, CONFIG.LOOP_STATE_FILE),
                    this.toYaml()
                );
            } catch (e) {
                log(`Failed to save state: ${e}`, "ERROR");
            }
        }
    },

    setActiveAgent(agent: string): void {
        if (this.state) {
            this.state.active_agent = agent;
            this.save();
            log(`Active agent set to: ${agent}`);
        }
    },

    setActiveWorkflow(workflow: string): void {
        if (this.state) {
            this.state.active_workflow = workflow;
            this.save();
            log(`Active workflow set to: ${workflow}`);
        }
    },

    emitEvent(event: string, _data?: Record<string, unknown>): void {
        if (this.state) {
            this.state.events.last_event = event;
            this.state.events.queue.push(event);
            // Keep queue manageable
            if (this.state.events.queue.length > 50) {
                this.state.events.queue = this.state.events.queue.slice(-50);
            }
            this.save();
            log(`Event emitted: ${event}`);
        }
    },
};

// ============================================================================
// MODULE 2: CONTEXT-FIRST INJECTION
// ============================================================================

const ContextFirstModule = {
    delegationReminder: "",

    async loadReminder(): Promise<void> {
        try {
            const reminderPath = path.join(CONFIG.PROJECT_ROOT, CONFIG.DELEGATION_REMINDER);
            if (fs.existsSync(reminderPath)) {
                this.delegationReminder = fs.readFileSync(reminderPath, "utf-8");
                log("Loaded delegation reminder");
            }
        } catch (e) {
            log(`Failed to load delegation reminder: ${e}`, "ERROR");
        }
    },

    async injectIntoTask(input: any, output: any): Promise<void> {
        if (input?.tool !== "task") return;

        if (!this.delegationReminder) {
            await this.loadReminder();
        }

        const targetAgent = input?.params?.agent || input?.params?.subagent_type || "unknown";
        const description = input?.params?.description || "";

        // Detect workflow type from description
        const workflow = WorkflowRouter.detectWorkflow(description);
        const state = StateSyncModule.state;
        const sessionCtx = (state as any)?.sessionContext;

        // Build AGENT-ROLE-SPECIFIC context
        const agentRoleContext = this.getAgentRoleContext(targetAgent);

        // Build WORKFLOW-SPECIFIC context
        const workflowContext = this.getWorkflowContext(workflow);

        if (input.params?.description) {
            const contextBlock = `
---
## 🔥 DELEGATION HANDOFF (Auto-injected by Master Orchestrator)

### PARENT CONTEXT
${sessionCtx?.firstUserMessage ? `**Original User Intent:** ${sessionCtx.firstUserMessage.slice(0, 200)}...` : ""}
- **Active Workflow**: ${state?.active_workflow || "Not set"}
- **Source Phase**: ${state?.current_phase || "Unknown"}
${sessionCtx?.filePaths?.length > 0 ? `**Files in Context**: ${sessionCtx.filePaths.slice(0, 3).join(", ")}` : ""}

### YOUR ROLE: ${targetAgent.toUpperCase()}
${agentRoleContext}

### WORKFLOW: ${workflow || "GENERAL"}
${workflowContext}

### MANDATORY BEFORE RESPONDING:
1. ⚠️ Use \`grep_search\`, \`codebase_search\`, \`list_dir\` to verify context
2. ⚠️ Read \`AGENTS.md\` for project governance  
3. ⚠️ Run commands, show output, THEN make claims
4. ⚠️ Stay in scope - do ONLY what was delegated

### VERIFICATION COMMANDS
\`\`\`bash
pnpm typecheck:fast    # Type check - MUST pass
pnpm test:fast         # Tests - MUST pass
pnpm governance        # Size + imports - MUST pass
\`\`\`

---
`;
            input.params.description = contextBlock + input.params.description;
            log(`Injected delegation context for ${targetAgent} (workflow: ${workflow || "general"})`);
        }
    },

    /**
     * Get agent-role-specific context based on agent name
     */
    getAgentRoleContext(agentName: string): string {
        const contexts: Record<string, string> = {
            "architect": `
- Focus: Architecture decisions, layer boundaries, ADRs
- Validate against: \`_bmad-output/planning-artifacts/architecture.md\`
- Escalate: Any layer violations, god stores, circular dependencies
- Tools: Prefer \`codebase_search\` for pattern analysis`,

            "dev": `
- Focus: Implementation following TDD (Red-Green-Refactor)
- Validate against: Tech specs, existing patterns in codebase
- MANDATORY: Write tests FIRST, then implementation
- Use: \`.opencode/skills/tdd-red/\` skill chain`,

            "analyst": `
- Focus: Requirements analysis, research, gap identification
- Use MCP tools: Tavily, Exa, Context7 for research
- Output: Structured findings with citations
- Integration: Link findings to PRD/Architecture`,

            "supreme-coordinator": `
- Focus: Orchestration, delegation, do NOT implement directly
- Validate: Scope vs. active agents and workflows
- State: Update LOOP_STATE.yaml after major delegations
- Exit Criteria: All delegated tasks complete with evidence`,

            "product-management": `
- Focus: PRD, prioritization (RICE framework), stakeholder alignment
- Validate against: \`_bmad-output/planning-artifacts/prd.md\`
- Output: Prioritized backlog items, clear acceptance criteria
- Integration: Connect to architecture and epics`,

            "sprint-manager": `
- Focus: Sprint tracking, story status, blockers
- Update: \`_bmad-output/sprint-artifacts/sprint-status.yaml\`
- Monitor: Story readiness, velocity, dependencies
- Escalate: Blocked stories, scope creep`,
        };

        // Find matching context by partial key match
        const matchedKey = Object.keys(contexts).find(k =>
            agentName.toLowerCase().includes(k.toLowerCase())
        );

        return matchedKey ? contexts[matchedKey] : `
- Role: ${agentName}
- Check your agent profile in \`.opencode/agents/\`
- Follow AGENTS.md governance rules`;
    },

    /**
     * Get workflow-specific context based on detected workflow
     */
    getWorkflowContext(workflow: string | null): string {
        const contexts: Record<string, string> = {
            "dev-story": `
**Story Development Workflow**
1. Read story file in \`sprint-artifacts/stories/\`
2. Create/validate story context
3. TDD: Write failing tests FIRST
4. Implement minimum to pass tests  
5. Request code review when done`,

            "create-architecture": `
**Architecture Creation Workflow**
1. Read PRD requirements first
2. Research with MCP tools
3. Define layers & boundaries
4. Create ADRs for decisions
5. Validate no layer violations`,

            "code-review": `
**Code Review Workflow**
1. Analyze changed files
2. Check architecture compliance
3. Validate test coverage
4. Check for god stores/components
5. Provide actionable feedback`,

            "research": `
**Research Workflow**
1. Define research questions
2. Use MCP tools (Tavily, Exa, Context7)
3. Cross-validate sources
4. Document findings with citations
5. Link to impacted artifacts`,

            "quick-dev": `
**Quick Dev Workflow**
1. Verify fix scope is narrow
2. Write regression test first
3. Implement minimal fix
4. Validate no side effects
5. Document the fix`,
        };

        // Find matching context by partial key match
        if (!workflow) return "No specific workflow detected. Use standard development practices.";

        const matchedKey = Object.keys(contexts).find(k =>
            workflow.toLowerCase().includes(k.toLowerCase())
        );

        return matchedKey ? contexts[matchedKey] : `Workflow: ${workflow} - Follow standard BMAD practices.`;
    },

    generateSystemReminder(): string {
        const state = StateSyncModule.state;
        return `
## 🎯 CONTEXT-FIRST REMINDER (Auto-injected)

**Current State:**
- Active Agent: ${state?.active_agent || "Not Set"}
- Active Workflow: ${state?.active_workflow || "Not Set"}
- Phase: ${state?.current_phase || "Unknown"}

**Verification Required:**
- Run \`pnpm typecheck:fast\` before claiming type safety
- Run \`pnpm test:fast\` before claiming tests pass
- Run \`pnpm governance\` for size/import checks

**Canonical Paths (MANDATORY):**
- \`src/infrastructure/\` - Persistence, APIs, external
- \`src/domain/\` - Business logic, entities
- \`src/presentation/\` - React UI components
- \`src/routes/\` - TanStack Router
`;
    },
};

// ============================================================================
// MODULE 3: ARCHITECTURE ENFORCEMENT
// ============================================================================

type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

interface ConflictRule {
    id: string;
    severity: Severity;
    pattern: RegExp;
    message: string;
    architectureRef: string;
}

const ArchitectureModule = {
    rules: [
        {
            id: "LAYER_BOUNDARY",
            severity: "HIGH" as const,
            pattern: /from\s+['"]@\/infrastructure/,
            message: "Domain layer should not import from infrastructure",
            architectureRef: "Clean Architecture: Layer boundaries",
        },
        {
            id: "ZUSTAND_PERSIST_DOMAIN",
            severity: "CRITICAL" as const,
            pattern: /persist\([\s\S]*?(projects|threads|agents|notes|documents)/,
            message: "Domain data should NOT use Zustand persist - use Dexie",
            architectureRef: "Architecture: Layer 3.1 Core Principle",
        },
        {
            id: "LIB_IMPORT",
            severity: "HIGH" as const,
            pattern: /from\s+['"]@\/lib\//,
            message: "Imports from @/lib/ are deprecated - use layered architecture",
            architectureRef: "AGENTS.md: Canonical Paths",
        },
        {
            id: "GOD_STORE",
            severity: "HIGH" as const,
            pattern: /.{9000,}/, // Content > ~300 lines
            message: "File exceeds recommended size limit (potential god object)",
            architectureRef: "AGENTS.md: File Size Limits",
        },
    ] as ConflictRule[],

    checkContent(file: string, content: string): ConflictRule[] {
        // Only check relevant files
        if (!file.endsWith(".ts") && !file.endsWith(".tsx")) {
            return [];
        }

        const violations: ConflictRule[] = [];

        for (const rule of this.rules) {
            // Special handling for god store detection
            if (rule.id === "GOD_STORE") {
                const lineCount = content.split("\n").length;
                const isStore = file.includes("store") || file.includes("Store");
                const isComponent = file.endsWith(".tsx");

                const limit = isStore ? 300 : isComponent ? 400 : 500;
                if (lineCount > limit) {
                    violations.push(rule);
                }
                continue;
            }

            // Standard pattern matching
            if (rule.pattern.test(content)) {
                // Layer boundary only applies to domain files
                if (rule.id === "LAYER_BOUNDARY" && !file.includes("/domain/")) {
                    continue;
                }
                violations.push(rule);
            }
        }

        return violations;
    },

    async createEscalation(file: string, violations: ConflictRule[]): Promise<void> {
        try {
            const escalationDir = path.join(CONFIG.PROJECT_ROOT, CONFIG.ESCALATION_DIR);
            if (!fs.existsSync(escalationDir)) {
                fs.mkdirSync(escalationDir, { recursive: true });
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const escalationPath = path.join(escalationDir, `escalation-${timestamp}.md`);

            const content = `---
generated: ${new Date().toISOString()}
file: ${file}
severity: ${violations[0]?.severity || "MEDIUM"}
---

# Architecture Escalation

**File**: \`${file}\`

## Violations

${violations.map(v => `### ${v.id} (${v.severity})
**Message**: ${v.message}
**Reference**: ${v.architectureRef}
`).join("\n")}

## Quick Fix Commands
\`\`\`bash
# Check current state
pnpm governance

# If imports issue
pnpm governance:imports

# If size issue
pnpm governance:size
\`\`\`

---
*Generated by Master Orchestrator v2.0*
`;

            fs.writeFileSync(escalationPath, content);
            log(`Created escalation: ${escalationPath}`);
            StateSyncModule.emitEvent(`architecture.violation.${violations[0]?.id}`);
        } catch (e) {
            log(`Escalation creation error: ${e}`, "ERROR");
        }
    },
};

// ============================================================================
// MODULE 4: BROWNFIELD GUARD (From pre-execution/brownfield-guard.ts)
// ============================================================================

const BrownfieldModule = {
    deprecatedPaths: {
        "src/lib": {
            replacement: "src/infrastructure",
            reason: "Legacy pattern replaced by Clean Architecture",
        },
        "src/stores": {
            replacement: "src/infrastructure/persistence/stores",
            reason: "Stores belong in infrastructure layer",
        },
    } as Record<string, { replacement: string; reason: string }>,

    canonicalPaths: [
        "src/infrastructure/",
        "src/domain/",
        "src/presentation/",
        "src/routes/",
    ],

    findDeprecated(filePath: string): { pattern: string; replacement: string; reason: string } | null {
        for (const [pattern, info] of Object.entries(this.deprecatedPaths)) {
            if (filePath.includes(pattern)) {
                return { pattern, ...info };
            }
        }
        return null;
    },

    isCanonical(filePath: string): boolean {
        if (!filePath.includes("/src/")) return true;
        return this.canonicalPaths.some(cp => filePath.includes(cp));
    },

    validate(filePath: string): { valid: boolean; error?: string } {
        const deprecated = this.findDeprecated(filePath);
        if (deprecated) {
            return {
                valid: false,
                error: `BLOCKED: Deprecated path "${deprecated.pattern}". Use "${deprecated.replacement}" instead. Reason: ${deprecated.reason}`,
            };
        }

        if (filePath.includes("/src/") && !this.isCanonical(filePath)) {
            return {
                valid: false,
                error: `BLOCKED: Non-canonical path. Use: src/infrastructure/, src/domain/, src/presentation/, or src/routes/`,
            };
        }

        return { valid: true };
    },
};

// ============================================================================
// MODULE 5: GOD ARTIFACT GUARD (From post-execution/god-artifact-guard.ts)
// ============================================================================

const GodArtifactModule = {
    limits: {
        store: { maxLines: 300, patterns: ["store", "Store", "/stores/"] },
        component: { maxLines: 400, patterns: [".tsx"] },
        service: { maxLines: 500, patterns: ["Service", "service"] },
    } as Record<string, { maxLines: number; patterns: string[] }>,

    detectType(filePath: string): string | null {
        for (const [type, config] of Object.entries(this.limits)) {
            if (config.patterns.some(p => filePath.includes(p))) {
                return type;
            }
        }
        return null;
    },

    check(filePath: string, content: string): { valid: boolean; warning?: string; limit?: number } {
        const fileType = this.detectType(filePath);
        if (!fileType) return { valid: true };

        const lineCount = content.split("\n").length;
        const config = this.limits[fileType];

        if (lineCount > config.maxLines) {
            return {
                valid: false,
                warning: `GOD ${fileType.toUpperCase()}: ${filePath} has ${lineCount} lines (limit: ${config.maxLines})`,
                limit: config.maxLines,
            };
        }

        // Warn at 80% threshold
        if (lineCount > config.maxLines * 0.8) {
            return {
                valid: true,
                warning: `WARNING: ${filePath} approaching limit (${lineCount}/${config.maxLines} lines)`,
                limit: config.maxLines,
            };
        }

        return { valid: true };
    },
};

// ============================================================================
// MODULE 6: GOVERNANCE SCRIPT INTEGRATION
// ============================================================================

interface GovernanceResult {
    command: string;
    success: boolean;
    output: string;
    duration: number;
}

const GovernanceModule = {
    lastResults: {} as Record<string, GovernanceResult>,

    async runCommand(cmd: string, timeout: number = CONFIG.COMMAND_TIMEOUT): Promise<GovernanceResult> {
        const start = Date.now();
        try {
            const output = execSync(cmd, {
                cwd: CONFIG.PROJECT_ROOT,
                timeout,
                encoding: "utf-8",
                stdio: ["pipe", "pipe", "pipe"],
            });

            const result = {
                command: cmd,
                success: true,
                output: output.slice(0, 2000), // Truncate large outputs
                duration: Date.now() - start,
            };

            log(`Governance: ${cmd} PASSED (${result.duration}ms)`);
            return result;
        } catch (e: any) {
            const result = {
                command: cmd,
                success: false,
                output: e.message?.slice(0, 2000) || "Unknown error",
                duration: Date.now() - start,
            };

            log(`Governance: ${cmd} FAILED (${result.duration}ms)`, "WARN");
            return result;
        }
    },

    async runQuickCheck(): Promise<{ passed: boolean; results: GovernanceResult[] }> {
        const results: GovernanceResult[] = [];

        // Run typecheck (fastest)
        const typecheck = await this.runCommand(CONFIG.GOVERNANCE_COMMANDS.typecheck, 30000);
        results.push(typecheck);
        this.lastResults.typecheck = typecheck;

        // Run governance (size + imports)
        const governance = await this.runCommand(CONFIG.GOVERNANCE_COMMANDS.governance, 15000);
        results.push(governance);
        this.lastResults.governance = governance;

        const passed = results.every(r => r.success);
        if (passed) {
            StateSyncModule.emitEvent("governance.quickcheck.passed");
        } else {
            StateSyncModule.emitEvent("governance.quickcheck.failed");
        }

        return { passed, results };
    },

    async runFullCheck(): Promise<{ passed: boolean; results: GovernanceResult[] }> {
        const results: GovernanceResult[] = [];

        // Run all governance commands
        for (const [name, cmd] of Object.entries(CONFIG.GOVERNANCE_COMMANDS)) {
            if (name === "contracts") continue; // Skip slow contract check
            const result = await this.runCommand(cmd);
            results.push(result);
            this.lastResults[name] = result;
        }

        const passed = results.every(r => r.success);
        if (passed) {
            StateSyncModule.emitEvent("governance.fullcheck.passed");
        } else {
            StateSyncModule.emitEvent("governance.fullcheck.failed");
        }

        return { passed, results };
    },

    getLastResults(): Record<string, GovernanceResult> {
        return this.lastResults;
    },
};

// ============================================================================
// MODULE 7: SKILL CHAIN ORCHESTRATION (From beast-mode-orchestrator.ts)
// ============================================================================

const SkillChainModule = {
    chains: {
        "feature-development": [
            "brainstorming",
            "context-first",
            "writing-plans",
            "tdd-red",
            "executing-plans",
            "verification-before-completion",
        ],
        "story-cycle": [
            "01-create-story",
            "02-validate-story",
            "03-create-context",
            "04-dev-story",
            "05-code-review",
            "06-story-done",
        ],
        "bug-fix": [
            "systematic-debugging",
            "tdd-red",
            "executing-plans",
            "verification-before-completion",
        ],
        "code-review": [
            "architecture-review",
            "code-quality",
            "security-scan",
            "performance-check",
        ],
    } as Record<string, string[]>,

    currentChain: null as string | null,
    currentStep: 0,

    startChain(chainName: string): boolean {
        if (this.chains[chainName]) {
            this.currentChain = chainName;
            this.currentStep = 0;
            StateSyncModule.setActiveWorkflow(chainName);
            StateSyncModule.emitEvent(`skillchain.started.${chainName}`);
            log(`Started skill chain: ${chainName}`);
            return true;
        }
        return false;
    },

    getCurrentSkill(): string | null {
        if (!this.currentChain) return null;
        const chain = this.chains[this.currentChain];
        if (this.currentStep < chain.length) {
            return chain[this.currentStep];
        }
        return null;
    },

    advanceChain(): string | null {
        if (!this.currentChain) return null;
        this.currentStep++;
        const skill = this.getCurrentSkill();
        if (skill) {
            StateSyncModule.emitEvent(`skillchain.step.${skill}`);
            return skill;
        }
        // Chain complete
        StateSyncModule.emitEvent(`skillchain.completed.${this.currentChain}`);
        this.currentChain = null;
        this.currentStep = 0;
        return null;
    },
};

// ============================================================================
// MODULE 8: WORKFLOW ROUTING (Task Type Detection)
// ============================================================================

const WorkflowRouter = {
    patterns: {
        "implementation|develop|feature": "_bmad/bmm/workflows/4-implementation/dev-story",
        "bugfix|fix|debug": "_bmad/bmm/workflows/4-implementation/quick-dev",
        "prd|product requirements": "_bmad/bmm/workflows/2-plan-workflows/prd",
        "architecture|design": "_bmad/bmm/workflows/3-solutioning/create-architecture",
        "research|analyze": "_bmad/bmm/workflows/1-analysis/research",
        "test|testing": ".opencode/skills/tdd-red",
        "code.?review": "_bmad/bmm/workflows/code-review",
        "sprint|planning": "_bmad/bmm/workflows/sprint-planning",
    } as Record<string, string>,

    detectWorkflow(taskDescription: string): string | null {
        const lowerDesc = taskDescription.toLowerCase();

        for (const [pattern, workflow] of Object.entries(this.patterns)) {
            const regex = new RegExp(pattern, "i");
            if (regex.test(lowerDesc)) {
                log(`Detected workflow: ${workflow} for pattern: ${pattern}`);
                return workflow;
            }
        }

        return null;
    },
};

// ============================================================================
// FEATURE FLAGS: Enable/disable new governance features (ADDITIVE)
// ============================================================================

const FEATURE_FLAGS = {
    CASCADE_ENABLED: true,      // Toggle cascade triggers
    SIGNOFF_ENABLED: true,      // Toggle multi-agent signoffs
    ENFORCEMENT_ENABLED: true,  // Toggle contract generation
    AUTO_APPROVE_THRESHOLD: 0.95, // 95% pass rate for auto-approval
};

// ============================================================================
// MODULE 8.5: SSOT SAFEGUARDS (Safe YAML Operations)
// ============================================================================

const SSOTSafeguards = {
    AUDIT_LOG_PATH: ".opencode/governance/audit-log.yaml",

    validateYaml(content: string, fields: string[]): boolean {
        return fields.every(f => content.includes(`${f}:`));
    },

    createBackup(filePath: string): void {
        const full = path.join(CONFIG.PROJECT_ROOT, filePath);
        if (fs.existsSync(full)) fs.copyFileSync(full, `${full}.backup`);
    },

    atomicWrite(filePath: string, content: string): boolean {
        const full = path.join(CONFIG.PROJECT_ROOT, filePath);
        const temp = `${full}.tmp`;
        try {
            const dir = path.dirname(full);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(temp, content);
            fs.renameSync(temp, full);
            return true;
        } catch (e) {
            if (fs.existsSync(temp)) fs.unlinkSync(temp);
            return false;
        }
    },

    audit(action: string, target: string): void {
        const auditPath = path.join(CONFIG.PROJECT_ROOT, this.AUDIT_LOG_PATH);
        const dir = path.dirname(auditPath);
        try {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.appendFileSync(auditPath, `- time: "${new Date().toISOString()}" action: "${action}" target: "${target}"\n`);
        } catch (_) { /* silent */ }
    },

    safeWrite(file: string, content: string, fields: string[] = []): boolean {
        if (fields.length && !this.validateYaml(content, fields)) return false;
        this.createBackup(file);
        const ok = this.atomicWrite(file, content);
        if (ok) this.audit("write", file);
        return ok;
    },
};

// ============================================================================
// MODULE 9: CASCADE TRIGGER (Auto-Orchestrated Workflow Chains)
// ADDITIVE: Does not modify any existing modules
// ============================================================================

interface CascadeDefinition {
    id: string;
    trigger_patterns: RegExp[];
    chain: string[];
    description: string;
}

interface ChainStepDef {
    id: string;
    name: string;
    agent: string;
    workflow: string;
    inputs: string[];
    outputs: string[];
    validation_criteria: string[];
}

interface ActiveCascade {
    id: string;
    cascadeId: string;
    step: number;
    state: Record<string, unknown>;
    validationScores: number[];
    startedAt: string;
}

const CascadeTriggerModule = {
    cascades: new Map<string, CascadeDefinition>(),
    chains: new Map<string, ChainStepDef[]>(),
    activeChain: null as ActiveCascade | null,

    initialize(): void {
        // Define cascade definitions
        this.cascades.set("align-prd-architecture", {
            id: "GOV-CASCADE-001",
            trigger_patterns: [
                /align.*prd.*architecture/i,
                /integrate.*prd.*architecture/i,
                /validate.*prd.*against.*architecture/i,
                /make.*documents.*aligned/i,
            ],
            chain: ["prd-validation", "stale-detection", "architecture-validation",
                "cross-validation", "multi-agent-signoff", "enforcement-sync"],
            description: "Align PRD with Architecture - Full governance chain",
        });

        this.cascades.set("prd-review", {
            id: "GOV-CASCADE-002",
            trigger_patterns: [/review.*prd/i, /analyze.*prd/i, /validate.*prd/i],
            chain: ["prd-validation", "stale-detection"],
            description: "PRD review and validation",
        });

        this.cascades.set("architecture-review", {
            id: "GOV-CASCADE-003",
            trigger_patterns: [/review.*architecture/i, /validate.*architecture/i],
            chain: ["architecture-validation", "cross-validation"],
            description: "Architecture review against PRD",
        });

        // Define chain steps
        this.chains.set("prd-validation", [{
            id: "prd-val-1",
            name: "PRD Gap Analysis",
            agent: "analyst-ext",
            workflow: "_bmad/bmm/workflows/2-plan-workflows/prd/steps-v/step-v-01-discovery.md",
            inputs: ["_bmad-output/planning-artifacts/prd.md"],
            outputs: ["_bmad-output/validation-reports/prd-validation-{date}.md"],
            validation_criteria: ["All FRs extracted", "All NFRs extracted", "Gap analysis complete"],
        }]);

        this.chains.set("architecture-validation", [{
            id: "arch-val-1",
            name: "Architecture Analysis",
            agent: "architect-ext",
            workflow: "_bmad/bmm/workflows/3-solutioning/check-implementation-readiness/step-02-prd-analysis.md",
            inputs: ["_bmad-output/planning-artifacts/IDEAL-architecture-*.md"],
            outputs: ["_bmad-output/validation-reports/architecture-validation-{date}.md"],
            validation_criteria: ["Layer boundaries verified", "ADRs validated", "No circular deps"],
        }]);

        this.chains.set("cross-validation", [{
            id: "cross-val-1",
            name: "PRD ↔ Architecture Cross-Validation",
            agent: "supreme-coordinator",
            workflow: "_bmad/bmm/workflows/3-solutioning/check-implementation-readiness/workflow.md",
            inputs: ["prd.md", "architecture.md"],
            outputs: ["_bmad-output/validation-reports/cross-validation-matrix-{date}.md"],
            validation_criteria: ["All PRD requirements mapped", "Gaps identified", "Drift flagged"],
        }]);

        log("CascadeTriggerModule initialized with " + this.cascades.size + " cascades");
    },

    detectCascade(userMessage: string): CascadeDefinition | null {
        if (!FEATURE_FLAGS.CASCADE_ENABLED) return null;

        for (const [_key, cascade] of this.cascades) {
            for (const pattern of cascade.trigger_patterns) {
                if (pattern.test(userMessage)) {
                    log(`Cascade detected: ${cascade.id} - ${cascade.description}`);
                    return cascade;
                }
            }
        }
        return null;
    },

    async startChain(cascadeId: string): Promise<string> {
        const cascade = this.cascades.get(cascadeId);
        if (!cascade) return `Unknown cascade: ${cascadeId}`;

        this.activeChain = {
            id: `cascade-${Date.now()}`,
            cascadeId,
            step: 0,
            state: {},
            validationScores: [],
            startedAt: new Date().toISOString(),
        };

        StateSyncModule.emitEvent("cascade.started", { cascadeId, chainLength: cascade.chain.length });
        log(`Started cascade: ${cascade.description}`);
        return `Started: ${cascade.description}`;
    },

    async advanceChain(validationScore: number): Promise<{ proceed: boolean; step: ChainStepDef | null; reason: string }> {
        if (!this.activeChain) {
            return { proceed: false, step: null, reason: "No active cascade" };
        }

        this.activeChain.validationScores.push(validationScore);

        // Check if validation passes threshold (95%)
        if (validationScore < FEATURE_FLAGS.AUTO_APPROVE_THRESHOLD) {
            StateSyncModule.emitEvent("cascade.paused", {
                reason: "Validation below threshold",
                score: validationScore,
                threshold: FEATURE_FLAGS.AUTO_APPROVE_THRESHOLD,
            });
            return {
                proceed: false,
                step: null,
                reason: `Validation score ${(validationScore * 100).toFixed(1)}% < 95% threshold. Pausing for analysis.`
            };
        }

        const cascade = this.cascades.get(this.activeChain.cascadeId);
        if (!cascade) {
            return { proceed: false, step: null, reason: "Cascade definition not found" };
        }

        this.activeChain.step++;
        if (this.activeChain.step >= cascade.chain.length) {
            // Chain complete
            StateSyncModule.emitEvent("cascade.completed", {
                cascadeId: this.activeChain.cascadeId,
                avgScore: this.activeChain.validationScores.reduce((a, b) => a + b, 0) / this.activeChain.validationScores.length,
            });
            this.activeChain = null;
            return { proceed: false, step: null, reason: "Cascade complete!" };
        }

        const chainId = cascade.chain[this.activeChain.step];
        const steps = this.chains.get(chainId);

        if (steps && steps.length > 0) {
            StateSyncModule.emitEvent("cascade.step", { chainId, step: steps[0].name });
            return { proceed: true, step: steps[0], reason: `Proceeding to: ${steps[0].name}` };
        }

        return { proceed: false, step: null, reason: `Chain step not defined: ${chainId}` };
    },

    getStatus(): Record<string, unknown> {
        if (!this.activeChain) return { active: false };
        const cascade = this.cascades.get(this.activeChain.cascadeId);
        return {
            active: true,
            cascadeId: this.activeChain.cascadeId,
            currentStep: this.activeChain.step,
            totalSteps: cascade?.chain.length || 0,
            avgScore: this.activeChain.validationScores.length > 0
                ? this.activeChain.validationScores.reduce((a, b) => a + b, 0) / this.activeChain.validationScores.length
                : 0,
        };
    },
};

// ============================================================================
// MODULE 10: MULTI-AGENT SIGN-OFF (Consensus Framework)
// ADDITIVE: Does not modify any existing modules
// ============================================================================

interface SignoffRecord {
    agent: string;
    timestamp: string;
    verdict: "APPROVED" | "REJECTED" | "CONCERNS" | "PENDING";
    rationale: string;
    evidence: string[];
    score: number; // 0-100
}

interface SignoffSession {
    id: string;
    document: string;
    documentType: string;
    required_agents: string[];
    collected_signoffs: SignoffRecord[];
    status: "IN_PROGRESS" | "CONSENSUS" | "BLOCKED" | "DEBATING";
    debateRounds: number;
}

const SignoffModule = {
    sessions: new Map<string, SignoffSession>(),

    REQUIRED_AGENTS: {
        "prd": ["analyst-ext", "product-management-ext"],
        "architecture": ["architect-ext", "supreme-coordinator"],
        "cross-validation": ["analyst-ext", "architect-ext", "product-management-ext", "supreme-coordinator"],
    } as Record<string, string[]>,

    MAX_DEBATE_ROUNDS: 3,

    async initiateSignoff(documentType: string, documentPath: string): Promise<string> {
        if (!FEATURE_FLAGS.SIGNOFF_ENABLED) return "Signoff disabled";

        const sessionId = `signoff-${Date.now()}`;
        const requiredAgents = this.REQUIRED_AGENTS[documentType] || ["supreme-coordinator"];

        this.sessions.set(sessionId, {
            id: sessionId,
            document: documentPath,
            documentType,
            required_agents: requiredAgents,
            collected_signoffs: [],
            status: "IN_PROGRESS",
            debateRounds: 0,
        });

        StateSyncModule.emitEvent("signoff.initiated", { sessionId, documentType, requiredAgents });
        log(`Sign-off initiated: ${sessionId} for ${documentType} (${requiredAgents.length} agents required)`);
        return sessionId;
    },

    async collectSignoff(sessionId: string, signoff: SignoffRecord): Promise<{ status: string; nextAction: string }> {
        const session = this.sessions.get(sessionId);
        if (!session) return { status: "error", nextAction: "Session not found" };

        // Remove previous signoff from same agent if exists
        session.collected_signoffs = session.collected_signoffs.filter(s => s.agent !== signoff.agent);
        session.collected_signoffs.push(signoff);

        log(`Signoff collected: ${signoff.agent} - ${signoff.verdict} (${signoff.score}%)`);

        // Check consensus
        return this.checkConsensus(sessionId);
    },

    checkConsensus(sessionId: string): { status: string; nextAction: string } {
        const session = this.sessions.get(sessionId);
        if (!session) return { status: "error", nextAction: "Session not found" };

        const signoffs = session.collected_signoffs;
        const required = session.required_agents;

        // Check if all agents have signed off
        const signedAgents = signoffs.map(s => s.agent);
        const missingAgents = required.filter(a => !signedAgents.includes(a));

        if (missingAgents.length > 0) {
            return {
                status: "waiting",
                nextAction: `Waiting for: ${missingAgents.join(", ")}`
            };
        }

        // All agents have signed - check for consensus
        const approvals = signoffs.filter(s => s.verdict === "APPROVED");
        const rejections = signoffs.filter(s => s.verdict === "REJECTED");
        const concerns = signoffs.filter(s => s.verdict === "CONCERNS");

        // ALL must approve (user requirement)
        if (approvals.length === signoffs.length) {
            session.status = "CONSENSUS";
            StateSyncModule.emitEvent("signoff.consensus", { sessionId });
            return { status: "consensus", nextAction: "All agents approved - proceed" };
        }

        // If any rejection, need debate
        if (rejections.length > 0 || concerns.length > 0) {
            if (session.debateRounds >= this.MAX_DEBATE_ROUNDS) {
                session.status = "BLOCKED";
                StateSyncModule.emitEvent("signoff.blocked", { sessionId, rounds: session.debateRounds });
                return { status: "blocked", nextAction: "Max debate rounds reached - manual resolution required" };
            }

            session.status = "DEBATING";
            session.debateRounds++;

            return this.initiateDebate(session);
        }

        return { status: "unknown", nextAction: "Unexpected state" };
    },

    initiateDebate(session: SignoffSession): { status: string; nextAction: string } {
        const rejectors = session.collected_signoffs.filter(s => s.verdict === "REJECTED" || s.verdict === "CONCERNS");
        const approvers = session.collected_signoffs.filter(s => s.verdict === "APPROVED");

        StateSyncModule.emitEvent("signoff.debate", {
            sessionId: session.id,
            round: session.debateRounds,
            rejectors: rejectors.map(r => r.agent),
            approvers: approvers.map(a => a.agent),
        });

        const debatePrompt = `
## 🔴 DEBATE REQUIRED (Round ${session.debateRounds}/${this.MAX_DEBATE_ROUNDS})

**Document**: ${session.document}

### DISAGREEMENT DETECTED
${rejectors.map(r => `- **${r.agent}** (${r.verdict}): ${r.rationale}`).join("\n")}

### APPROVALS
${approvers.map(a => `- **${a.agent}**: ${a.rationale}`).join("\n")}

### RESOLUTION REQUIRED
Agents must validate against each other and reach consensus.
Each agent must respond with revised verdict after reviewing other positions.
`;

        return {
            status: "debating",
            nextAction: debatePrompt
        };
    },

    generateSignoffPrompt(agent: string, documentPath: string, documentType: string): string {
        return `
## 🔏 SIGN-OFF REQUEST (Multi-Agent Governance)

**Document**: ${documentPath}
**Type**: ${documentType}
**Your Role**: ${agent}

### REVIEW CRITERIA (Corporate-Level Expert)
As an **extreme skeptic and ruthless validator**, assess:

1. **Completeness** (0-25): Are all requirements present?
2. **Accuracy** (0-25): Are claims evidence-backed?
3. **Alignment** (0-25): Does this align with other governance docs?
4. **Feasibility** (0-25): Is this implementable as specified?

### YOUR VERDICT
Reply with ONE of:
- **APPROVED** + score (0-100): All criteria met
- **CONCERNS** + score (0-100): Minor issues (list them)
- **REJECTED** + score (0-100): Critical gaps (list blockers)

### EVIDENCE REQUIRED
Cite specific sections, line numbers, or missing elements.
`;
    },

    getSessionStatus(sessionId: string): SignoffSession | null {
        return this.sessions.get(sessionId) || null;
    },
};

// ============================================================================
// MODULE 11: ENFORCEMENT SYNC (Codebase Contracts - SSOT)
// ADDITIVE: Does not modify any existing modules
// ============================================================================

const ENFORCEMENT_PATH = ".opencode/governance";

const EnforcementModule = {
    contractsPath: path.join(ENFORCEMENT_PATH, "contracts"),
    registryPath: path.join(ENFORCEMENT_PATH, "cascade-registry.yaml"),
    signoffLogPath: path.join(ENFORCEMENT_PATH, "signoff-log.yaml"),
    impactGraphPath: path.join(ENFORCEMENT_PATH, "impact-graph.yaml"),

    TEMPLATES: {
        architecture: `# Architecture Contract (Auto-Generated)
## Generated: {date}
## Source: {source}

## Layers
- **Presentation**: React UI, route handlers
- **Domain**: Business logic, entities  
- **Infrastructure**: Persistence, external APIs

## Data Flow
1. User action triggers route
2. Route calls domain service
3. Service uses infrastructure
4. Response returned

## Key Abstractions
- **Stores**: Zustand slices per domain
- **Services**: Business logic containers
- **Repositories**: Data access layer
`,
        conventions: `# Conventions Contract (Auto-Generated)
## Generated: {date}

## Naming Patterns
- Files: kebab-case.ts
- Components: PascalCase.tsx
- Tests: *.test.ts

## Code Style
- Quotes: double
- Semicolons: required
- Line length: 100

## Import Organization
1. External packages
2. Internal @/ aliases
3. Relative imports
`,
        structure: `# Structure Contract (Auto-Generated)
## Generated: {date}

## Directory Layout
src/
├── domain/           # Business logic
├── infrastructure/   # External services
├── presentation/     # React components
├── routes/           # TanStack Router
└── types/            # Shared types

## Where to Add New Code
- Feature code: src/domain/{feature}/
- UI: src/presentation/components/
- APIs: src/infrastructure/api/
`,
    } as Record<string, string>,

    async ensureDirectories(): Promise<void> {
        const dirs = [
            ENFORCEMENT_PATH,
            this.contractsPath,
        ];

        for (const dir of dirs) {
            const fullPath = path.join(CONFIG.PROJECT_ROOT, dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
                log(`Created directory: ${dir}`);
            }
        }
    },

    async syncFromValidatedDocs(prdPath: string, architecturePath: string): Promise<string[]> {
        if (!FEATURE_FLAGS.ENFORCEMENT_ENABLED) return [];

        await this.ensureDirectories();
        const generated: string[] = [];
        const date = new Date().toISOString();

        // Generate contracts
        for (const [name, template] of Object.entries(this.TEMPLATES)) {
            const content = template
                .replace("{date}", date)
                .replace("{source}", `${prdPath}, ${architecturePath}`);

            const outputPath = path.join(CONFIG.PROJECT_ROOT, this.contractsPath, `${name}.md`);
            fs.writeFileSync(outputPath, content);
            generated.push(`${this.contractsPath}/${name}.md`);
            log(`Generated contract: ${name}.md`);
        }

        // Update impact graph
        await this.updateImpactGraph(prdPath, architecturePath);

        StateSyncModule.emitEvent("enforcement.synced", { generated });
        return generated;
    },

    async updateImpactGraph(prdPath: string, architecturePath: string): Promise<void> {
        const impactGraph = {
            lastUpdated: new Date().toISOString(),
            sources: [prdPath, architecturePath],
            dependencies: {
                "contracts/architecture.md": [architecturePath],
                "contracts/conventions.md": [prdPath, architecturePath],
                "contracts/structure.md": [architecturePath],
            },
            cascadeRules: {
                "prd-change": ["contracts/conventions.md", "contracts/structure.md"],
                "architecture-change": ["contracts/architecture.md", "contracts/structure.md"],
            },
        };

        const outputPath = path.join(CONFIG.PROJECT_ROOT, this.impactGraphPath);
        fs.writeFileSync(outputPath, JSON.stringify(impactGraph, null, 2));
        log("Updated impact graph");
    },

    async logSignoff(session: SignoffSession): Promise<void> {
        const outputPath = path.join(CONFIG.PROJECT_ROOT, this.signoffLogPath);
        let log: { sessions: SignoffSession[] } = { sessions: [] };

        if (fs.existsSync(outputPath)) {
            try {
                log = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
            } catch {
                log = { sessions: [] };
            }
        }

        log.sessions.push(session);
        fs.writeFileSync(outputPath, JSON.stringify(log, null, 2));
    },
};

// ============================================================================
// MODULE 12: VALIDATION GATE (Upstream Validator Enforcement)
// Enforces Supreme Coordinator validation protocol on delegation returns
// ============================================================================

interface ValidationSession {
    sessionID: string;
    toolsUsed: string[];
    artifactsChecked: string[];
    delegations: Array<{
        agent: string;
        startedAt: string;
        completedAt?: string;
    }>;
    lastEnforcementAt?: string;
}

const ValidationGateModule = {
    sessions: new Map<string, ValidationSession>(),

    // Tools considered "validation activity"
    VALIDATION_TOOLS: ["grep_search", "codebase_search", "list_dir", "view_file", "glob"],

    // Paths that indicate artifact checking
    ARTIFACT_PATHS: ["_bmad-output", "sprint-artifacts", "signoff", "tracking"],

    getOrCreateSession(sessionID: string): ValidationSession {
        if (!this.sessions.has(sessionID)) {
            this.sessions.set(sessionID, {
                sessionID,
                toolsUsed: [],
                artifactsChecked: [],
                delegations: [],
            });
        }
        return this.sessions.get(sessionID)!;
    },

    recordToolUse(sessionID: string, tool: string, params: any): void {
        const session = this.getOrCreateSession(sessionID);
        session.toolsUsed.push(tool);

        // Track artifact path checks
        if (this.VALIDATION_TOOLS.includes(tool)) {
            const searchPath = params?.path || params?.SearchPath || params?.Query || "";
            const pathStr = String(searchPath);
            if (this.ARTIFACT_PATHS.some(ap => pathStr.includes(ap))) {
                session.artifactsChecked.push(pathStr);
                log(`ValidationGate: Artifact check recorded - ${pathStr}`);
            }
        }
    },

    recordDelegationStart(sessionID: string, agent: string): void {
        const session = this.getOrCreateSession(sessionID);
        session.delegations.push({
            agent,
            startedAt: new Date().toISOString(),
        });
        // Clear tool tracking for fresh validation
        session.toolsUsed = [];
        session.artifactsChecked = [];
        log(`ValidationGate: Delegation to ${agent} started`);
    },

    recordDelegationComplete(sessionID: string, agent: string): void {
        const session = this.getOrCreateSession(sessionID);
        const delegation = session.delegations.find(d =>
            d.agent === agent && !d.completedAt
        );
        if (delegation) {
            delegation.completedAt = new Date().toISOString();
            log(`ValidationGate: Delegation from ${agent} completed`);
        }
    },

    checkDelegationReturn(sessionID: string): {
        hadValidation: boolean;
        toolsUsed: string[];
        artifactsChecked: string[];
        enforcementNeeded: boolean;
        reason?: string;
    } {
        const session = this.sessions.get(sessionID);
        if (!session) {
            return { hadValidation: true, toolsUsed: [], artifactsChecked: [], enforcementNeeded: false };
        }

        // Check if any validation tools were used
        const validationToolsUsed = session.toolsUsed.filter(t =>
            this.VALIDATION_TOOLS.includes(t)
        );

        const hadValidation = validationToolsUsed.length > 0;
        const hadArtifactCheck = session.artifactsChecked.length > 0;

        // Enforcement needed if NO validation tools used OR no artifact paths checked
        const enforcementNeeded = !hadValidation || !hadArtifactCheck;

        let reason: string | undefined;
        if (!hadValidation) {
            reason = "No validation tools (grep, list_dir, view_file) used after delegation";
        } else if (!hadArtifactCheck) {
            reason = "No artifact paths checked (_bmad-output, sprint-artifacts, etc.)";
        }

        return {
            hadValidation,
            toolsUsed: validationToolsUsed,
            artifactsChecked: session.artifactsChecked,
            enforcementNeeded,
            reason,
        };
    },

    generateEnforcementPrompt(agent?: string): string {
        return `
## ⚠️ VALIDATION GATE TRIGGERED (Auto-Enforced by Master Orchestrator)

A delegated task from **${agent || "unknown agent"}** just returned.

**YOU ARE THE SUPREME COORDINATOR (L0 Upstream Validator)**

The system detected NO validation activity. Before accepting completion:

### MANDATORY VERIFICATION COMMANDS (Run NOW):
\`\`\`bash
# 1. Check sign-off artifacts
grep -r "signoff" _bmad-output/sprint-artifacts/

# 2. Verify code files exist
ls src/domain/ src/infrastructure/ src/presentation/

# 3. Run test evidence
pnpm test:fast

# 4. Run type check
pnpm typecheck:fast

# 5. Check dev notes
ls _bmad-output/tracking/
\`\`\`

### VALIDATION HIERARCHY (Early Failure = Fast Rejection):
| Level | Check | If Missing |
|-------|-------|------------|
| 1 | Sign-off artifact | Delegate to @reviewer |
| 2 | Code references | Request from @dev-ext |
| 3 | Dev notes | Require creation |
| 4 | Test evidence | Run tests first |

### ⛔ DO NOT:
- Accept verbal claims without evidence
- Report completion to user without ALL checks passing
- Skip loading skill: \`upstream-validator\`

**Load skill NOW:** upstream-validator

---
`;
    },

    markEnforcementPromptSent(sessionID: string): void {
        const session = this.sessions.get(sessionID);
        if (session) {
            session.lastEnforcementAt = new Date().toISOString();
        }
    },

    shouldSendEnforcement(sessionID: string): boolean {
        const session = this.sessions.get(sessionID);
        if (!session?.lastEnforcementAt) return true;

        // Rate limit: only send enforcement once per 30 seconds
        const lastSent = new Date(session.lastEnforcementAt).getTime();
        const now = Date.now();
        return (now - lastSent) > 30000;
    },

    getCompactionReminder(): string {
        return `
## 🔐 SUPREME COORDINATOR VALIDATION GATE (Preserved)

**YOUR ROLE**: L0 Upstream Validator - NEVER accept completion at face value

**BEFORE MARKING ANYTHING COMPLETE**:
1. Verify sign-off artifacts exist (grep _bmad-output/sprint-artifacts/)
2. Verify code files referenced in artifacts
3. Verify test evidence (0 failures required)
4. Verify dev notes exist

**IF DELEGATION RETURNS**:
- First grep for validation evidence
- If missing → auto-delegate remediation
- Loop until ALL levels pass

**Load skill:** upstream-validator
`;
    },
};

// ============================================================================
// MAIN PLUGIN EXPORT
// ============================================================================


const MasterOrchestratorPlugin: Plugin = async ({ client, project, directory }) => {
    log("Master Orchestrator v2.1 initializing...");

    // Initialize state on load
    await StateSyncModule.initialize();
    await ContextFirstModule.loadReminder();

    // Initialize new governance modules (v2.1)
    CascadeTriggerModule.initialize();
    log("CascadeTriggerModule initialized");

    log(`Project: ${(project as any)?.name || "unknown"}`);
    log(`Directory: ${directory}`);

    // Override PROJECT_ROOT with actual directory
    if (directory) {
        (CONFIG as any).PROJECT_ROOT = directory;
    }

    return {
        name: "master-orchestrator",

        hooks: {
            // ====================================================================
            // LIFECYCLE HOOKS
            // ====================================================================

            "session.created": async (input, output) => {
                log("Session created");
                await StateSyncModule.initialize();
                StateSyncModule.emitEvent("session.created");
            },

            "session.idle": async (input, output) => {
                log("Session idle - saving state");
                StateSyncModule.save();
                StateSyncModule.emitEvent("session.idle");
            },

            // ====================================================================
            // PRE-EXECUTION HOOKS
            // ====================================================================

            "tool.execute.before": async (input, output) => {
                const tool = input?.tool;
                const sessionID = (StateSyncModule.state as any)?.sessionContext?.sessionID || "default";

                // VALIDATION GATE: Record tool usage
                ValidationGateModule.recordToolUse(sessionID, tool, input?.params);

                // 1. CONTEXT-FIRST: Inject into task delegations
                if (tool === "task") {
                    await ContextFirstModule.injectIntoTask(input, output);

                    // Detect workflow from task description
                    const desc = input?.params?.description || "";
                    const workflow = WorkflowRouter.detectWorkflow(desc);
                    if (workflow) {
                        StateSyncModule.setActiveWorkflow(workflow);
                    }

                    // Track agent activation
                    if (input?.params?.agent) {
                        StateSyncModule.setActiveAgent(input.params.agent);
                        // VALIDATION GATE: Record delegation start
                        ValidationGateModule.recordDelegationStart(sessionID, input.params.agent);
                    }
                }

                // 2. BROWNFIELD GUARD: Validate file paths
                if (["write_file", "edit_file", "write_to_file", "replace_file_content"].includes(tool)) {
                    const filePath = input?.params?.path || input?.params?.TargetFile || "";
                    const validation = BrownfieldModule.validate(filePath);

                    if (!validation.valid) {
                        log(`BLOCKED by Brownfield Guard: ${validation.error}`, "WARN");
                        StateSyncModule.emitEvent("brownfield.blocked");
                        // Note: OpenCode plugins can't actually block - we just log warnings
                        console.warn(`[BROWNFIELD] ${validation.error}`);
                    }
                }

                // 3. GOD ARTIFACT GUARD: Pre-check content size
                if (["write_file", "write_to_file"].includes(tool)) {
                    const filePath = input?.params?.path || input?.params?.TargetFile || "";
                    const content = input?.params?.content || input?.params?.CodeContent || "";

                    const check = GodArtifactModule.check(filePath, content);
                    if (!check.valid) {
                        log(`GOD ARTIFACT: ${check.warning}`, "WARN");
                        StateSyncModule.emitEvent("godartifact.detected");
                        console.warn(`[GOD ARTIFACT] ${check.warning}`);
                    } else if (check.warning) {
                        log(`Size warning: ${check.warning}`, "WARN");
                    }
                }
            },

            // ====================================================================
            // POST-EXECUTION HOOKS
            // ====================================================================

            "tool.execute.after": async (input, output) => {
                const tool = input?.tool;
                const sessionID = (StateSyncModule.state as any)?.sessionContext?.sessionID || "default";

                // VALIDATION GATE: Check for missing validation on task returns
                if (tool === "task") {
                    const returningAgent = input?.params?.agent || "unknown";
                    ValidationGateModule.recordDelegationComplete(sessionID, returningAgent);

                    const check = ValidationGateModule.checkDelegationReturn(sessionID);

                    if (check.enforcementNeeded && ValidationGateModule.shouldSendEnforcement(sessionID)) {
                        log(`VALIDATION GATE TRIGGERED: Task from ${returningAgent} returned without validation`, "WARN");
                        log(`Reason: ${check.reason}`, "WARN");

                        StateSyncModule.emitEvent("validation.gate.triggered", {
                            agent: returningAgent,
                            reason: check.reason,
                            toolsUsed: check.toolsUsed,
                        });

                        // Store enforcement prompt for system.transform to inject
                        (StateSyncModule.state as any).pendingEnforcement = {
                            type: "validation_gate",
                            prompt: ValidationGateModule.generateEnforcementPrompt(returningAgent),
                            triggeredAt: new Date().toISOString(),
                            agent: returningAgent,
                        };

                        ValidationGateModule.markEnforcementPromptSent(sessionID);

                        console.warn(`[VALIDATION GATE] Enforcement triggered for ${returningAgent}`);
                    }
                }

                // ARCHITECTURE ENFORCEMENT: Check written files
                if (["write_file", "edit_file", "write_to_file", "replace_file_content"].includes(tool)) {
                    const filePath = input?.params?.path || input?.params?.TargetFile || "";

                    // Read actual file content for analysis
                    try {
                        const fullPath = filePath.startsWith("/")
                            ? filePath
                            : path.join(CONFIG.PROJECT_ROOT, filePath);

                        if (fs.existsSync(fullPath) && (filePath.endsWith(".ts") || filePath.endsWith(".tsx"))) {
                            const content = fs.readFileSync(fullPath, "utf-8");
                            const violations = ArchitectureModule.checkContent(filePath, content);

                            if (violations.length > 0) {
                                await ArchitectureModule.createEscalation(filePath, violations);

                                for (const v of violations) {
                                    console.warn(`[ARCHITECTURE] ${v.severity}: ${v.id} - ${v.message}`);
                                }
                            }
                        }
                    } catch (e) {
                        log(`Post-execution analysis error: ${e}`, "ERROR");
                    }
                }

                // Periodic state save
                StateSyncModule.save();
            },

            // ====================================================================
            // MESSAGE TRANSFORMATION (CRITICAL FOR CONTEXT ANCHORING)
            // ====================================================================

            /**
             * experimental.chat.messages.transform
             * 
             * Fires on EVERY message exchange. Used to:
             * 1. Track session context (first user intent, message count)
             * 2. Detect work type from file paths
             * 3. Flag post-compaction state
             * 
             * This DOES NOT inject into messages, but COLLECTS context
             * for later injection via system.transform
             */
            "experimental.chat.messages.transform": async (
                _input: Record<string, unknown>,
                output: { messages?: Array<{ info?: { sessionID?: string; role?: string }; role?: string; parts?: Array<{ type?: string; text?: string }> }> }
            ) => {
                if (!output.messages || output.messages.length === 0) {
                    return;
                }

                // Extract sessionID
                let sessionID: string | undefined;
                for (const msg of output.messages) {
                    if (msg.info?.sessionID) {
                        sessionID = msg.info.sessionID;
                        break;
                    }
                }

                if (!sessionID) return;

                // Build context from messages
                let firstUserMessage = "";
                let messageCount = 0;
                const filePaths: string[] = [];

                for (const msg of output.messages) {
                    messageCount++;
                    const role = msg.info?.role ?? msg.role;

                    // Extract first user message
                    if (role === "user" && !firstUserMessage) {
                        const text = msg.parts?.filter(p => p.type === "text").map(p => p.text).join("") || "";
                        if (text.length > 10) {
                            firstUserMessage = text.slice(0, 300);
                        }
                    }

                    // Extract file paths mentioned
                    const allText = msg.parts?.filter(p => p.type === "text").map(p => p.text).join("") || "";
                    const pathMatches = allText.match(/(?:src\/|\.opencode\/|_bmad-output\/)[^\s\)\]\"\'\`]+/g);
                    if (pathMatches) {
                        filePaths.push(...pathMatches);
                    }
                }

                // Store in state for system.transform to use
                if (StateSyncModule.state) {
                    (StateSyncModule.state as any).sessionContext = {
                        sessionID,
                        firstUserMessage,
                        messageCount,
                        filePaths: [...new Set(filePaths)].slice(0, 10),
                        capturedAt: new Date().toISOString(),
                    };
                }

                log(`Messages transform: ${messageCount} messages, ${filePaths.length} paths`);
            },

            /**
             * experimental.chat.system.transform
             * 
             * Fires when building system prompt. Used to:
             * 1. Inject context-first reminder
             * 2. Add MANDATORY context tool usage requirement
             * 3. Include agent-role awareness
             */
            "experimental.chat.system.transform": async (
                input: { sessionID?: string; model?: unknown },
                output: { system: string[] }
            ) => {
                try {
                    if (!output.system) {
                        output.system = [];
                    }

                    const state = StateSyncModule.state;
                    const sessionCtx = (state as any)?.sessionContext;

                    // Safely extract values with fallbacks
                    const activeAgent = state?.active_agent || "Not set";
                    const activeWorkflow = state?.active_workflow || "Not set";
                    const currentPhase = state?.current_phase || "Unknown";
                    const firstUserMsg = sessionCtx?.firstUserMessage || "";
                    const filePaths = sessionCtx?.filePaths || [];

                    // CRITICAL: Context anchoring reminder
                    let contextReminder = `
## 🔥 MASTER ORCHESTRATOR CONTEXT-FIRST (Auto-Injected)

### CONTEXT VERIFICATION MANDATORY
⚠️ **BEFORE responding to any implementation request:**
1. Use \`list_dir\` to verify file structure
2. Use \`grep_search\` or \`codebase_search\` for existing patterns
3. Use \`view_file\` to read relevant files
4. Check \`task.md\` or \`todo.md\` for current status
5. **ONLY THEN** propose changes

> Evidence before assertions. Run commands, show output, THEN claim.

### SESSION STATE
- **Active Agent**: ${activeAgent}
- **Active Workflow**: ${activeWorkflow}
- **Phase**: ${currentPhase}
`;

                    // Conditionally add user intent if available
                    if (firstUserMsg && firstUserMsg.length > 0) {
                        const truncatedMsg = firstUserMsg.slice(0, 200);
                        const ellipsis = firstUserMsg.length > 200 ? "..." : "";
                        contextReminder += `
### ORIGINAL USER INTENT (Anchor)
> ${truncatedMsg}${ellipsis}
`;
                    }

                    // Conditionally add file paths if available
                    if (filePaths && Array.isArray(filePaths) && filePaths.length > 0) {
                        const pathList = filePaths.slice(0, 5).map((p: string) => `- ${p}`).join("\n");
                        contextReminder += `
### FILES IN CONTEXT
${pathList}
`;
                    }

                    contextReminder += `
### CANONICAL PATHS (MANDATORY)
- \`src/infrastructure/\` - Persistence, APIs, external
- \`src/domain/\` - Business logic, entities
- \`src/presentation/\` - React UI components
- \`src/routes/\` - TanStack Router

### GOVERNANCE CHECK
\`\`\`bash
pnpm typecheck:fast && pnpm test:fast && pnpm governance
\`\`\`
---
`;
                    output.system.push(contextReminder);
                    log("Injected context-first + mandatory tool usage reminder");

                    // VALIDATION GATE: Inject pending enforcement if triggered
                    const pendingEnforcement = (state as any)?.pendingEnforcement;
                    if (pendingEnforcement?.prompt) {
                        output.system.push(pendingEnforcement.prompt);
                        log("Injected validation gate enforcement prompt");
                        // Clear pending enforcement after injection
                        (StateSyncModule.state as any).pendingEnforcement = null;
                    }
                } catch (e: any) {
                    // Log error but don't crash - graceful degradation
                    log(`ERROR in system.transform: ${e.message}`, "ERROR");
                }
            },

            // ====================================================================
            // COMPACTION HOOKS
            // ====================================================================

            "experimental.session.compacting": async (input, output) => {
                // Preserve critical state during compaction
                const state = StateSyncModule.state;

                if (output.context && Array.isArray(output.context)) {
                    output.context.push(`
## 🔄 STATE PRESERVED ACROSS COMPACTION

**Active Agent**: ${state?.active_agent || "None"}
**Active Workflow**: ${state?.active_workflow || "None"}
**Phase**: ${state?.current_phase || "Unknown"}
**Last Event**: ${state?.events?.last_event || "None"}

**Governance Last Results**:
${Object.entries(GovernanceModule.getLastResults())
                            .map(([k, v]) => `- ${k}: ${v.success ? "✅" : "❌"}`)
                            .join("\n")}

**MANDATORY BEFORE COMPLETION**:
\`\`\`bash
pnpm typecheck:fast && pnpm test:fast && pnpm governance
\`\`\`
`);
                    // VALIDATION GATE: Add validation reminder for Supreme Coordinator
                    output.context.push(ValidationGateModule.getCompactionReminder());

                    log("Injected compaction context + validation gate reminder");
                }
            },
        },

        // ====================================================================
        // CUSTOM TOOLS (Exposed to OpenCode)
        // ====================================================================

        tool: {
            // Quick governance check tool
            "governance-quick": {
                description: "Run quick governance check (typecheck + governance scripts)",
                args: {},
                async execute(args: any, context: any) {
                    const results = await GovernanceModule.runQuickCheck();
                    return JSON.stringify(results, null, 2);
                },
            },

            // Full governance check tool
            "governance-full": {
                description: "Run full governance check (all scripts)",
                args: {},
                async execute(args: any, context: any) {
                    const results = await GovernanceModule.runFullCheck();
                    return JSON.stringify(results, null, 2);
                },
            },

            // Start skill chain tool
            "skill-chain-start": {
                description: "Start a skill chain (feature-development, story-cycle, bug-fix, code-review)",
                args: {
                    chain: z.string().describe("Chain name to start"),
                },
                async execute(args: Record<string, unknown>, context: any) {
                    const chainName = args.chain as string;
                    const success = SkillChainModule.startChain(chainName);
                    if (success) {
                        const firstSkill = SkillChainModule.getCurrentSkill();
                        return `Started chain: ${chainName}. First skill: ${firstSkill}`;
                    }
                    return `Unknown chain: ${chainName}. Available: ${Object.keys(SkillChainModule.chains).join(", ")}`;
                },
            },

            // Get current state tool
            "state-get": {
                description: "Get current orchestration state",
                args: {},
                async execute(args: any, context: any) {
                    return StateSyncModule.toYaml();
                },
            },

            // ================================================================
            // NEW: CASCADE TRIGGER TOOLS (Module 9)
            // ================================================================

            // Start a governance cascade
            "cascade-trigger": {
                description: "Trigger a governance cascade chain (align-prd-architecture, prd-review, architecture-review)",
                args: {},
                async execute(args: any, context: any) {
                    const cascades = Array.from(CascadeTriggerModule.cascades.entries());
                    const list = cascades.map(([id, c]) => `- ${id}: ${c.description}`).join("\n");
                    return `Available cascades:\n${list}\n\nUse cascade-start to start a specific cascade.`;
                },
            },

            // Start specific cascade
            "cascade-start": {
                description: "Start a specific governance cascade",
                args: {},
                async execute(args: any, context: any) {
                    // Default to align-prd-architecture
                    const cascadeId = "align-prd-architecture";
                    const result = await CascadeTriggerModule.startChain(cascadeId);
                    return result;
                },
            },

            // Advance cascade with validation score
            "cascade-advance": {
                description: "Advance current cascade with validation score (0-1)",
                args: {},
                async execute(args: any, context: any) {
                    // Default to full pass
                    const result = await CascadeTriggerModule.advanceChain(1.0);
                    return JSON.stringify(result, null, 2);
                },
            },

            // Get cascade status
            "cascade-status": {
                description: "Get current cascade chain status",
                args: {},
                async execute(args: any, context: any) {
                    return JSON.stringify(CascadeTriggerModule.getStatus(), null, 2);
                },
            },

            // ================================================================
            // NEW: SIGNOFF TOOLS (Module 10)
            // ================================================================

            // Initiate signoff session
            "signoff-initiate": {
                description: "Initiate a multi-agent sign-off session for a document",
                args: {},
                async execute(args: any, context: any) {
                    // Default to cross-validation type
                    const sessionId = await SignoffModule.initiateSignoff(
                        "cross-validation",
                        "_bmad-output/planning-artifacts/prd.md"
                    );
                    return `Sign-off session initiated: ${sessionId}\nRequired agents: ${SignoffModule.REQUIRED_AGENTS["cross-validation"].join(", ")}`;
                },
            },

            // Collect signoff
            "signoff-collect": {
                description: "Collect a sign-off verdict for a session",
                args: {},
                async execute(args: any, context: any) {
                    // This would normally receive sessionId, verdict, rationale from args
                    const sessions = Array.from(SignoffModule.sessions.entries());
                    if (sessions.length === 0) {
                        return "No active sign-off sessions. Use signoff-initiate first.";
                    }
                    const [sessionId] = sessions[sessions.length - 1];
                    const session = SignoffModule.getSessionStatus(sessionId);
                    return JSON.stringify(session, null, 2);
                },
            },

            // Get signoff prompt
            "signoff-prompt": {
                description: "Generate sign-off prompt for an agent",
                args: {},
                async execute(args: any, context: any) {
                    const agent = StateSyncModule.state?.active_agent || "supreme-coordinator";
                    return SignoffModule.generateSignoffPrompt(
                        agent,
                        "_bmad-output/planning-artifacts/prd.md",
                        "cross-validation"
                    );
                },
            },

            // ================================================================
            // NEW: ENFORCEMENT TOOLS (Module 11)
            // ================================================================

            // Sync enforcement contracts
            "enforcement-sync": {
                description: "Generate codebase contracts from validated governance documents",
                args: {},
                async execute(args: any, context: any) {
                    const generated = await EnforcementModule.syncFromValidatedDocs(
                        "_bmad-output/planning-artifacts/prd.md",
                        "_bmad-output/planning-artifacts/IDEAL-architecture-2026-01-30.md"
                    );
                    return `Generated contracts:\n${generated.map(g => `- ${g}`).join("\n")}`;
                },
            },

            // Get feature flags
            "governance-flags": {
                description: "Get current governance feature flags",
                args: {},
                async execute(args: any, context: any) {
                    return JSON.stringify(FEATURE_FLAGS, null, 2);
                },
            },

            // ================================================================
            // NEW: VALIDATION GATE TOOLS (Module 12)
            // ================================================================

            // Check validation gate status
            "validation-gate-status": {
                description: "Get current validation gate status for the session - shows tool usage, artifact checks, and enforcement history",
                args: {},
                async execute(args: any, context: any) {
                    const sessionID = (StateSyncModule.state as any)?.sessionContext?.sessionID || "default";
                    const session = ValidationGateModule.sessions.get(sessionID);

                    if (!session) {
                        return "No validation session found. Delegations will be tracked once a task starts.";
                    }

                    const check = ValidationGateModule.checkDelegationReturn(sessionID);

                    return JSON.stringify({
                        sessionID,
                        toolsUsed: session.toolsUsed,
                        artifactsChecked: session.artifactsChecked,
                        delegations: session.delegations,
                        lastEnforcementAt: session.lastEnforcementAt,
                        currentCheck: {
                            hadValidation: check.hadValidation,
                            enforcementNeeded: check.enforcementNeeded,
                            reason: check.reason,
                        },
                    }, null, 2);
                },
            },

            // Manually trigger validation gate enforcement
            "validation-gate-trigger": {
                description: "Manually trigger validation gate enforcement prompt - use when you need to remind about validation requirements",
                args: {},
                async execute(args: any, context: any) {
                    const prompt = ValidationGateModule.generateEnforcementPrompt("manual-trigger");

                    // Store for injection
                    (StateSyncModule.state as any).pendingEnforcement = {
                        type: "validation_gate",
                        prompt,
                        triggeredAt: new Date().toISOString(),
                        agent: "manual-trigger",
                    };

                    StateSyncModule.emitEvent("validation.gate.triggered.manual");

                    return "Validation gate enforcement queued. The prompt will be injected in the next system message.";
                },
            },
        },
    };
};

export default MasterOrchestratorPlugin;
