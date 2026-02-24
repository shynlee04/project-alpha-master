# Governance-Core Module

**Module ID**: `governance-core`
**Version**: 1.0.0
**Created**: 2026-01-10
**Status**: `ACTIVE`

**Replaces:**
- `_bmad/modules/architecture-remediation/` (legacy, stale context)
- `_bmad/modules/governance/` (scattered, excessive files)
- `_bmad/modules/core-governance/` (duplicate structure)

---

## description

**Adaptive Governance + Correct-Course**: An ongoing capability (not a one-time project) that:

1. **Auto-gates** before any work (with human override option)
2. **Activates** on `correct-course` workflow invocation
3. **Triggers** on critical conditions (P0 findings, health drop, validation failure)
4. **Performs** three enforcement checks before allowing work to proceed

---

## Core Philosophy

This is NOT a one-time remediation. It's an **ongoing adaptive governance system** that:

- Validates artifacts against actual code
- Detects staleness automatically
- Categorizes fixes by impact level
- Orchestrates research for tech decisions
- Stops humans before making mistakes

---

## The Three Enforcement Checks

### 1. Context First (Two-Step Hook)

**Step A: Gather Context**
- Scan targeted domains (not entire codebase)
- Slice by relevance
- Determine depth based on complexity

**Step B: Contextualize Prompt**
- Auto-transform human prompt with gathered context
- Add relevant inclusive coverage
- Output: Improved prompt ready for new session

### 2. Agent as Expert

**Capabilities:**
- Define bug/error severity levels
- Compare with ACTUAL codebase
- Detect user approach flaws
- Decide: proceed / warn / block / redirect

### 3. Research Required

**Triggers:**
- Technology selection
- Performance trade-offs
- Anti-pattern detection
- Framework comparison
- Breaking changes
- Security implications

---

## Module Structure

```
governance-core/
├── MODULE.md                    # This file
├── config/                      # Configuration files
│   ├── domains.yaml             # 13 domains with priorities
│   ├── artifact-manager.yaml    # Artifact lifecycle management
│   └── context-poisoning.yaml   # Staleness prevention
├── policies/                    # Governance policies
│   └── stage-gating.md          # 5-stage development roadmap
├── scanners/                    # Domain scanners
│   ├── agent-ai-rag-scanner.md  # P0 - Most heavy-weight
│   └── file-structure-scanner.md # P0 - File governance
├── workflows/                   # Enforcement workflows
│   ├── correct-course.yaml      # Main workflow configuration
│   ├── correct-course-instructions.md # Execution instructions
│   ├── context-first.md         # Check 1: Context gathering
│   ├── expert-analysis.md       # Check 2: Codebase comparison
│   ├── research-trigger.md      # Check 3: Auto-research
│   ├── auto-gate.md             # Final gate & report generation
│   └── stage-gate.md            # Stage enforcement
├── hooks/                       # Platform-specific hooks
│   ├── claude-code/
│   │   ├── session-start.yaml   # Initialize governance at session start
│   │   ├── user-prompt-submit.yaml # Pre-work governance check
│   │   └── post-workflow.yaml   # Post-work registration
│   └── generic/
│       └── pre-execution.yaml   # Platform-agnostic hook
└── state/                       # State tracking (created at runtime)
    └── stage-progress.yaml      # Current stage and exit criteria
```

### _ext Submodule Integration

The governance-core module integrates with BMAD core through the `_ext` pattern:

```
.agent/workflows/bmad/
└── bmad-bmb-workflows-correct-course.md  # _ext wrapper (points to governance-core)
```

**Key Point:** The `_ext` wrapper allows slash command activation (`/correct-course`) without modifying original BMAD files. The wrapper delegates to `_bmad-ext/modules/governance-core/workflows/correct-course.yaml`.

---

## Entry Point

### Via EXCALIBUR (Recommended)
```bash
# Activate via ext-master agent
/ext-master
# Then select: [GC] Governance-Core Module
```

### Direct Entry
```bash
# Load workflow directly
cat _bmad-ext/modules/governance-core/workflows/auto-gate.md
```

### Slash Command Activation (All Platforms)

```bash
# Activate governance enforcement
/correct-course

# This loads the _ext wrapper which delegates to:
# _bmad-ext/modules/governance-core/workflows/correct-course.yaml
```

### For Orchestrators

```yaml
# Auto-gate before any work
routing_rules:
  - rule_id: "GOV-001"
    name: "Governance Enforcement"
    if: "true"  # Always applies first
    workflow: "auto-gate"
    priority: "critical"
    timeout_minutes: 5

  # Other rules run AFTER governance allows
```

### Hook-Based Activation (Claude Code)

The `user-prompt-submit.yaml` hook automatically triggers governance checks when:
- User submits a work request (not pure questions)
- Prompt contains action verbs (create, fix, refactor)
- File modifications are detected

---

## Integration Points

### _ext Wrapper Path

```
.agent/workflows/bmad/bmad-bmb-workflows-correct-course.md
    └──> Delegates to ────┐
                          │
                         ▼
_bmad-ext/modules/governance-core/workflows/correct-course.yaml
```

### Connects To (_bmad-ext/)

| Component | Path | description |
|-----------|------|---------|
| Loop State | `state/LOOP_STATE.yaml` | Track governance decisions, staleness checking |
| Artifact Registry | `state/ARTIFACT_REGISTRY.yaml` | Validate artifact freshness |
| Routing Rules | `orchestrator/routing-rules.yaml` | Route to correct workflows |
| Technical Debt | `state/technical-debt.yaml` | Log override debt |

### Workflow Call Chain

```
user-prompt-submit (hook)
    │
    ├─> context-first.md (Check 1)
    │       ├─> domains.yaml
    │       └─> LOOP_STATE.yaml (staleness)
    │
    ├─> expert-analysis.md (Check 2)
    │       └─> ARTIFACT_REGISTRY.yaml
    │
    ├─> research-trigger.md (Check 3)
    │       └─> MCP tools (context7, tavily, deepwiki)
    │
    ├─> auto-gate.md (Final Gate)
    │       └─> Governance Report
    │
    └─> stage-gate.md (Stage Enforcement)
            └─> stage-progress.yaml
```

### Hook Chain

```
session-start.yaml (on session init)
    └─> Load governance config
    └─> Check LOOP_STATE staleness

user-prompt-submit.yaml (on prompt)
    └─> Trigger correct-course workflow
    └─> Handle ALLOW/WARN/BLOCK response

post-workflow.yaml (on workflow complete)
    └─> Detect file changes
    └─> Register artifacts
    └─> Validate naming conventions
```

---

## Error Categories

| Category | Criteria | Response |
|----------|----------|----------|
| Quick Patch | Single component, no cross-domain | Direct fix, no gate |
| Independent Feature | Isolated, clear boundaries | Isolated workflow |
| Architectural Conflict | Cross-domain, state boundaries | Full correct-course |

---

## Research Triggers

Auto-trigger research when:
- Technology selection (React vs Vue, etc.)
- Performance trade-offs
- Anti-pattern detection
- Framework comparison
- Breaking changes
- Security implications

---

## Governance Report Output

```yaml
status: BLOCK | WARN | ALLOW
checks:
  context_first: { status, domains, files, tokens }
  expert_analysis: { status, findings, recommendation }
  research: { status, sources, confidence }
recommendation: "..."
override_allowed: true
```

---

## Domain Coverage (13 Domains)

| Domain | Priority | Target | Scanner |
|--------|----------|--------|---------|
| agent_ai_rag_multimodality | P0 | Agent/AI/RAG/Multimodality ecosystem | ✅ Created |
| file_structure_governance | P0 | File change logging, naming conventions | ✅ Created |
| artifact | P0 | Artifacts vs actual code | ⏳ Pending |
| document | P0 | Governance docs validation | ⏳ Pending |
| state_persistence | P0 | God stores, duplicates | ⏳ Pending |
| sync | P0 | File synchronization | ⏳ Pending |
| ux_interaction | P0 | UX components, 8-bit system | ⏳ Pending |
| security | P0 | Security vulnerabilities | ⏳ Pending |
| domain | P1 | Cross-domain analysis | ⏳ Pending |
| workspace | P1 | Workspace-specific | ⏳ Pending |
| feature | P1 | Feature boundaries | ⏳ Pending |
| relational | P1 | Dependencies | ⏳ Pending |
| journey | P2 | User journeys | ⏳ Pending |

**Scanner Status:** 2/13 complete (15%)

---

## Stage-Gated Development

| Stage | Focus | Status | Exit Criteria |
|-------|-------|--------|---------------|
| 0 | Governance Foundation | 🟢 In Progress | All 6 P0 scanners operational |
| 1 | Basic Agent Tools | 🔒 Locked | Read-only + CRUD tools tested |
| 2 | RAG Context Management | 🔒 Locked | Context isolation verified |
| 3 | Multimodal I/O | 🔒 Locked | Multimodal routing tested |
| 4 | Advanced AI Features | 🔒 Locked | Multi-agent orchestration safe |

---

**Module Owner**: governance-core
**Integrates With**: `_bmad-ext/orchestrator/`
**Last Updated**: 2026-01-10
