# Master Mapping Document: Prompt → Phase → Workflows → Agents → Governance

> **Version**: 1.0.0
> **Date**: 2026-01-29
> **Status**: SINGLE SOURCE OF TRUTH
> **Purpose**: Definitive logic map for OpenCode Native migration (Phase 2.1-2.3)

---

## Part 1: The 18 Prompt Types Matrix

Based on `META-FRAMEWORK-ANALYSIS` (1.1), mapping every request type to its execution path.

| ID | Prompt Type | Phase | Entry Workflow | Primary Agent | Sub-Agents | Governance Hook | State Update |
|----|-------------|-------|----------------|---------------|------------|-----------------|--------------|
| **A1** | Greenfield Feature | 1 | `brainstorming` | `product-management-ext` | `analyst-ext` | Context Gathering | `bmm-workflow-status.yaml` |
| **A2** | Feature Extension | 2 | `prd` (edit) | `product-management-ext` | `analyst-ext` | Architecture Review | `bmm-workflow-status.yaml` |
| **A3** | Cross-cutting Concern | 0 | `diagnostic-first` | `architect-ext` | `domain-scanner` | Full 3-Step | `LOOP_STATE.yaml` |
| **B1** | Quick Patch | 4 | `correct-course` | `dev-ext` | - | Dry Reading | `sprint-status.yaml` |
| **B2** | Feature Fix | 4 | `story-cycle` | `dev-ext` | `test-writer` | Contract Validation | `sprint-status.yaml` |
| **B3** | Architectural Conflict | 0 | `diagnostic-first` | `architect-ext` | `deep-scan-*` | ADR Review | `LOOP_STATE.yaml` |
| **C1** | Component Splitting | 4 | `normalize-components` | `dev-ext` | `component-splitter` | Size Analysis | `sprint-status.yaml` |
| **C2** | Store Elimination | 4 | `eliminate-god-stores` | `dev-ext` | `store-refactorer` | State Boundary Audit | `sprint-status.yaml` |
| **C3** | Migration/Consolidation | 3 | `create-architecture` | `architect-ext` | `deep-scan-orchestrator` | Full Governance | `ARTIFACT_REGISTRY.yaml` |
| **D1** | Architecture Decision | 3 | `create-architecture` | `architect-ext` | - | ADR Template | `ARTIFACT_REGISTRY.yaml` |
| **D2** | Technical Research | 0 | `research-trigger` | `analyst-ext` | - | MCP Usage | `ARTIFACT_REGISTRY.yaml` |
| **D3** | Sprint Planning | 2 | `sprint-planning-enhanced` | `bmad-sprint-manager` | `cohesion-scanner` | Cohesion Scanner | `sprint-status.yaml` |
| **E1** | API Documentation | 3 | `documentation-sync` | `tech-writer-ext` | - | Source Validation | `ARTIFACT_REGISTRY.yaml` |
| **E2** | User Guides | 3 | `documentation-sync` | `tech-writer-ext` | `ux-designer-ext` | Journey Validation | `ARTIFACT_REGISTRY.yaml` |
| **E3** | Architecture Docs | 3 | `create-architecture` | `architect-ext` | `tech-writer-ext` | ADR Alignment | `ARTIFACT_REGISTRY.yaml` |
| **F1** | Unclear Intent | 0 | `context-first` | `bmad-governance` | `analyst-ext` | Clarification Protocol | `LOOP_STATE.yaml` |
| **F2** | Multi-concern Request | 0 | `context-first` | `bmad-governance` | `analyst-ext` | Decomposition | `LOOP_STATE.yaml` |
| **F3** | Contradictory Request | 0 | `expert-analysis` | `bmad-governance` | `analyst-ext` | Counter-Proposal | `LOOP_STATE.yaml` |

---

## Part 2: Phase-by-Phase Execution Maps

### Phase 0: Governance Foundation (The Gatekeeper)
*Trigger*: Session start, Ambiguous Prompt (F1-F3), or Conflict (B3)

1.  **Entry Hook**: `tool.execute.before` (Session Init)
2.  **Step 1: Context Scan**
    *   Action: `grep/glob` project structure
    *   Check: `LOOP_STATE.yaml` freshness
3.  **Step 2: Expert Analysis**
    *   Action: Classify prompt (A-F taxonomy)
    *   Tool: `expert-analysis`
4.  **Step 3: Auto-Remediation (Optional)**
    *   Trigger: Stale artifacts found
    *   Action: `auto-rerun-stale`
5.  **Exit Decision**:
    *   PROCEED -> Route to Phase 1/2/3/4
    *   BLOCK -> Request clarification (F1)
    *   REDIRECT -> `correct-course` (B1)

### Phase 1: Ideation & Discovery
*Trigger*: New Feature (A1)

1.  **Entry Hook**: `tool.execute.before` (Check `product-brief` existence)
2.  **Step 1: Brainstorming**
    *   Agent: `product-management-ext`
    *   Artifact: `brainstorming-output-{date}.md`
3.  **Step 2: UX Concept**
    *   Agent: `ux-designer-ext`
    *   Artifact: User Journey Map
4.  **Auto-Governance**:
    *   Check: 10+ ideas generated
    *   Check: User personas defined
5.  **Exit**: Handoff to Phase 2

### Phase 2: Requirements & Planning
*Trigger*: Feature Ext (A2) or Sprint Planning (D3)

1.  **Entry Hook**: `tool.execute.before` (Check PRD)
2.  **Step 1: PRD Creation/Update**
    *   Agent: `product-management-ext`
    *   Validation: `PRDSchema`
3.  **Step 2: Sprint Planning**
    *   Agent: `bmad-sprint-manager`
    *   Tool: `cohesion-scanner`
4.  **Bouncing Loop**:
    *   If Cohesion < 0.7 -> Reorder/Split Stories -> Retry
5.  **Exit**: `sprint-status.yaml` updated

### Phase 3: Architecture & Design
*Trigger*: Architecture Decision (D1), Migration (C3), Doc Sync (E1-E3)

1.  **Entry Hook**: `tool.execute.before` (Check Architecture Alignment)
2.  **Step 1: System Design**
    *   Agent: `architect-ext`
    *   Artifact: `architecture.md`, ADRs
3.  **Step 2: Deep Scan**
    *   Agent: `deep-scan-orchestrator`
    *   Check: Layer violations, God components
4.  **Exit**: Architecture Handoff to `dev-ext`

### Phase 4: Implementation
*Trigger*: Fixes (B1, B2), Refactoring (C1, C2), Implementation

1.  **Entry Hook**: `tool.execute.before` (Pre-Story Gate)
2.  **Step 1: Story Cycle**
    *   Agent: `dev-ext`
    *   Workflow: `story-cycle` (10 steps)
3.  **Step 2: TDD Cycle**
    *   RED -> GREEN -> REFACTOR
4.  **Step 3: Verification**
    *   Agent: `tea-ext`
    *   Check: Coverage >= 80%, E2E pass
5.  **Bouncing Loop**:
    *   Test Fail -> `systematic-debugging` -> Retry
6.  **Exit**: Story Done Gate

---

## Part 3: Agent Cycle Maps

### Primary Agent: `dev-ext` (Implementation)

1.  **Entry**: Receives `story-cycle` command.
2.  **Pre-Planning (The Brain Check)**:
    *   Action: `grep` context, `glob` files.
    *   Output: `context-loaded.yaml`.
    *   **Governance Block**: If no evidence files read.
3.  **Journey Validation**:
    *   Action: `ui-layout-contract` check.
    *   Artifact: `journey-map.mermaid`.
4.  **Implementation Loop (Red/Green)**:
    *   Write Test -> Fail -> Write Code -> Pass.
    *   **Auto-Hook**: `tool.execute.before` (write) checks `useShallow`, `pnpm typecheck`.
5.  **Review (The Skeptic)**:
    *   Action: Path walking, HTML validation.
    *   **Governance Block**: If "TS passes" is only evidence.
6.  **Exit**: Updates `sprint-status.yaml` status: "DONE".

### Primary Agent: `architect-ext` (Design)

1.  **Entry**: Receives `create-architecture` or `diagnostic-first`.
2.  **Scan**:
    *   Action: `domain-scanner` maps boundaries.
    *   Output: `domain-scan-results.yaml`.
3.  **Design/Remediate**:
    *   Action: Create ADR or Remediation Plan.
    *   **Governance Block**: If contradicts `ADR-039`.
4.  **Exit**: Updates `architecture.md` or `ARTIFACT_REGISTRY.yaml`.

---

## Part 4: Governance Automation Points

Mapping manual rules from `AGENTS.md` to OpenCode hooks.

| Current Manual Rule | Target Auto Hook | Trigger | Action |
|---------------------|------------------|---------|--------|
| "Check stale artifacts > 2h" | `StaleArtifactGuard` | `tool.execute.before` (read) | Block read if mtime > 2h |
| "No god files > 500 lines" | `GodArtifactGuard` | `tool.execute.before` (read/write) | Warn/Block |
| "Tier 1 Docs Read-Only" | `Tier1ProtectionGuard` | `tool.execute.before` (write/edit) | Block edit to AGENTS.md/CLAUDE.md |
| "Use useShallow" | `SchemaValidationGuard` | `tool.execute.before` (write) | Regex check content |
| "Schema first" | `SchemaValidationGuard` | `tool.execute.before` (write) | Check if Zod schema exists |
| "Dry reading required" | `DryReadingGuard` | `tool.execute.before` (write) | Check `read` called before `write` |
| "Time-boxing" | `TimeBoxingEnforcer` | `tool.execute.after` | Log duration, Warn if > limit |
| "Update State" | `StateSyncPlugin` | `tool.execute.after` | Update `AGENT-STATE.yaml` |

---

## Part 5: State Update Matrix

Defining exactly *who* updates *what* and *when*.

| Action | State File | Field Updated | Who Updates | When |
|--------|------------|---------------|-------------|------|
| Session Start | `LOOP_STATE.yaml` | `session_id`, `start_time` | `bmad-governance` | `session.created` |
| Story Start | `sprint-status.yaml` | `stories[id].status`="IN_PROGRESS" | `dev-ext` | Command start |
| Story Done | `sprint-status.yaml` | `stories[id].status`="DONE" | `dev-ext` | `story-done` |
| Workflow Step | `AGENT-STATE.yaml` | `current_step` | `*` (All Agents) | `tool.execute.after` |
| Artifact Create | `ARTIFACT_REGISTRY.yaml` | `artifacts` list | `*` | `write` |
| Context Compact | `LOOP_STATE.yaml` | `restored_context` | `bmad-governance` | `session.compacting` |
| Epic Completion | `bmm-workflow-status.yaml` | `epic_status` | `bmad-sprint-manager` | `epic-done` |

---

## Part 6: Project Alpha Brownfield Context

Specific validations for the current messy state.

| Challenge | Validation Check | Governance Action |
|-----------|------------------|-------------------|
| `src/lib/` deprecated | `path.includes('src/lib')` | WARN on read, BLOCK on create |
| God Stores (>300 lines) | `line_count > 300` AND `type==store` | Trigger `store-refactorer` |
| Wrong File Locations | Canonical Path Regex | WARN "Move to src/infrastructure..." |
| Context Poisoning | Duplicate Artifact Check | Block loading if newer version exists |
| "Dual Chat" UI | `cohesion-scanner` | Fail Sprint Planning if detected |
| Legacy Bridges | `file.includes('bridge')` | Redirect to Native Tool |

---

## Part 7: The 10 Traps Prevention Matrix

| Trap | Prevention Hook | Plugin/Tool |
|------|-----------------|-------------|
| **1. Premature Implementation** | `ContextGatheringGate` | `DryReadingGuard` |
| **2. Context Poisoning** | `StaleArtifactGuard` | `ArtifactRegistry` |
| **3. Scope Creep** | `ScopeBoundaryGate` | `bmad-sprint-manager` |
| **4. State Boundary Violation** | `StateBoundaryValidation` | `SchemaValidationGuard` |
| **5. Temporary Code** | `StoryCompletionGate` | `TimeBoxingEnforcer` |
| **6. File Tree Anarchy** | `CanonicalPathCheck` | `Tier1ProtectionGuard` |
| **7. God Components** | `SizeMonitor` | `GodArtifactGuard` |
| **8. TS-Only Validation** | `EvidenceGate` | `real-world-validator` |
| **9. Nonsense Sprint** | `CohesionScanner` | `bmad-sprint-manager` |
| **10. Doc Drift** | `BiDirectionalSync` | `tech-writer-ext` |

---

## Part 8: Validation Checklist for Synthesis Documents

For Phase 2.1 (Less for More), 2.2 (Accurately Specific), 2.3 (Auto Gov).

### General Criteria
- [ ] **Single Source of Truth**: Does it reference `fw_20260129_103000_3methods`?
- [ ] **No Hallucination**: Are all tools/agents verified against Part 2/3 of this doc?
- [ ] **Token Budget**: Does it explicitly state token savings?

### Phase 2.1: Less for More
- [ ] **Skill count**: Must be ~16 (not 82).
- [ ] **Agent count**: Must be ~8 primary + subagents.
- [ ] **Loading**: Must use on-demand `skill` tool.

### Phase 2.2: Accurately Specific
- [ ] **Frontmatter**: Does every artifact have strict schema?
- [ ] **Commands**: Are workflows converted to slash commands?
- [ ] **@file refs**: Are section-based loads (`[frontmatter]`) used?

### Phase 2.3: Auto Governance
- [ ] **Hooks**: Are `before`/`after` hooks defined?
- [ ] **Plugins**: Is the `StaleArtifactGuard` logic present?
- [ ] **State**: Is `AGENT-STATE.yaml` structure defined?

---
