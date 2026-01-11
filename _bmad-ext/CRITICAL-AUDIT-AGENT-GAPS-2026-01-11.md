# CRITICAL AUDIT: Agent System Gaps & Conflicts

**Created**: 2026-01-11
**Status**: URGENT - Multiple P0 gaps identified
**Scope**: `_bmad-ext/modules/` governance and remediation agents

---

## Executive Summary

Your concerns are **validated**. The current agent architecture has significant gaps:

1. **AI/Agent/RAG/Multimodality ecosystem** - Completely unregulated
2. **Governance deep-scan** - Missing domain-specific scanners
3. **Artifact-to-code validation** - No stale document detection via code comparison
4. **Feature-level gatekeeping** - No "unlocking by stage" system
5. **Remediation misconception** - Treated as one-time, not continuous workflow integration

---

## Part 1: What EXISTS (Current State)

### Governance Module (HAS: The 3 Workflows)

```
governance/
├── workflows/
│   ├── context-first/      ✅ Scan domains → Contextualize → Transform prompt
│   ├── expert-analysis/    ✅ Bug/error level, codebase comparison
│   └── research-trigger/   ✅ Internet-based tech validation
└── artifacts/
    ├── file-monitor.md     ✅ Track folder/file changes
    ├── naming-convention.md ✅ Naming rules
    ├── archiving-policy.md ✅ TTL system (4 tiers)
    └── date-stamping-policy.md ✅ Date stamping
```

**What the 3 workflows ACTUALLY do**:

| Workflow | Input | Output | Triggers |
|----------|-------|--------|----------|
| context-first | Human prompt | Transformed prompt + context slices | Before any work |
| expert-analysis | Transformed prompt | Issue level (quick_patch / feature_fix / architectural) + flaws detected | After context-first |
| research-trigger | Flaws detected | Tech choice validation, trade-offs | After expert-analysis if needed |

**The workflows exist but they are NOT INTEGRATED into the remediation agents**.

### ARC-V2 Remediation Module (HAS: 3 Agents)

```
arc-v2/agents/
├── store-refactorer.md     ✅ Zustand store splitting
├── component-splitter.md   ✅ React component splitting
└── workspace-architect.md  ✅ File structure architecture
```

**What these agents do**:

| Agent | Trigger | Scope | Coordination |
|-------|---------|-------|--------------|
| store-refactorer | store > 120 lines, Epic CC-1/CP-1 | STATE domain only | None defined |
| component-splitter | component > 300 lines | UX domain only | None defined |
| workspace-architect | wrong layer, cross-workspace dupes | ROUTING domain only | None defined |

---

## Part 2: What's MISSING (The Gaps You Identified)

### GAP 1: AI/Agent/RAG/Multimodality Ecosystem - P0 CRITICAL

**Current State**: **ZERO governance** for:
- Agent tool CRUD operations (23 tools in [tool-catalog.ts](src/infrastructure/tools/tool-catalog.ts))
- Provider management (OpenAI, Anthropic, Gemini, Universal)
- RAG indexing and context management
- Multimodal input/output (text, image, PDF, voice, URL processing)
- Agent conversation thread management across workspaces

**Codebase Evidence**:

```typescript
// 23 tools with CRUD operations - NO governance
export const TOOL_CATALOG = [
  // File Tools (3)
  { definition: readFileDef, riskLevel: 'low' },
  { definition: writeFileDef, riskLevel: 'high' },     // Write = high risk
  { definition: listFilesDef, riskLevel: 'low' },

  // Terminal (1)
  { definition: executeCommandDef, riskLevel: 'high' }, // Command = high risk

  // Multimodal (4)
  { definition: synthesizeDef },      // Voice synthesis
  { definition: processPDFDef },      // PDF processing
  { definition: processImageDef },    // Image processing
  { definition: processURLDef },      // URL fetching

  // Composite (4) - Multi-step agentic workflows
  { definition: researchDef },        // Research workflow
  { definition: storyboardDef },      // Storyboard generation
  { definition: analyzeDef },         // Code analysis
  { definition: planDef },            // Planning

  // Provider (3) - LLM provider operations
  { definition: listProvidersDef },
  { definition: executeProviderDef }, // Execute with costs
  { definition: testProviderDef },
];
```

**Missing Governance**:
- No scanner for tool permission boundaries
- No validation of agent tool usage patterns
- No detection of overlapping tool capabilities
- No cost monitoring for `executeProviderDef` (per-request costs)
- No RAG context freshness validation

**Impact**: Agents can misuse tools, create circular dependencies, and generate uncontrolled costs.

---

### GAP 2: Governance Deep-Scan Extensions - P0

**Current State**: `domain-scanner.md` only covers 6 domains:

| Domain | Scanner Status | Missing Sub-domains |
|--------|----------------|---------------------|
| **PERSISTENCE** | Partial | No schema drift detection |
| **SYNC** | Partial | No conflict state analysis |
| **STATE** | Partial | No action flow analysis |
| **ROUTING** | Basic | No cross-workspace call graph |
| **AGENTS** | **MISSING** | **No tool/permission scanning** |
| **UX** | Partial | No journey mapping |

**Missing Deep-Scan Capabilities**:

```yaml
# NOT COVERED by current scanners:
documents_and_artifacts:
  - "Stale PRD vs actual implementation"
  - "Architecture docs vs code structure"
  - "UX spec vs component reality"
  - "API contracts vs actual endpoints"

domain_specific:
  api_models_contracts:
    - "OpenAPI spec validation"
    - "TypeScript interfaces vs actual API responses"
    - "Breaking change detection"

data_schema:
  - "Dexie schema vs actual IndexedDB"
  - "Store type definitions vs runtime usage"
  - "Migration drift detection"

file_structures:
  - "Layer violations detection"
  - "Circular import analysis"
  - "Barrel export completeness"

features:
  - "Feature flag coverage"
  - "Cross-feature dependency graph"
  - "Deprecated feature usage"

mutual_relational:
  - "Store-to-component coupling"
  - "Agent-to-workspace bindings"
  - "Tool permission cascades"

journey_ux_ui:
  - "User journey step coverage"
  - "Error boundary placement"
  - "Loading state consistency"

states_persistence:
  - "State mutation flow analysis"
  - "Persistence sync verification"
  - "Rollback capability validation"
```

---

### GAP 3: Artifact-to-Code Validation - P0

**Current State**: `file-monitor.md` tracks file changes but **does NOT compare**:

```yaml
# file-monitor.md does NOT:
compare_artifacts_to_code:
  - "PRD features vs actual implemented features"
  - "Architecture decisions vs code patterns"
  - "UX wireframes vs component structure"
  - "API specs vs route handlers"
  - "Data model vs actual store/interface"

stale_detection_mechanism:
  current: "Timestamp-based TTL"
  needed: "Code diff-based validation"

  governance_remediation_bridge:
  current: "Not defined"
  needed: "Governance calls remediation when artifact drift detected"
```

**What's Needed**:

```yaml
stale_document_scanner:
  trigger: "Artifact TTL OR code change detected"

  scan_protocol:
    1. "Load artifact (PRD, architecture, UX spec)"
    2. "Parse key claims and commitments"
    3. "Scan actual codebase for evidence"
    4. "Compare: Claim vs Reality"
    5. "Generate drift report"

  output:
    drift_report:
      artifact_path: "{artifact}"
      last_validated: "{timestamp}"
      claims_found: [list]
      evidence_found: [list]
      drift_detected:
        - "Claim: X exists in code → Actual: Missing"
        - "Claim: API follows pattern → Actual: Violation"

    if_drift_detected:
      action: "Trigger remediation workflow"
      priority: "Based on drift severity"
```

---

### GAP 4: Unlocking by Stage (Gatekeeping) - P0

**Current State**: **NO gatekeeping**. Feature-rich requests immediately trigger sprint planning/epic generation.

**Problem**:

```yaml
# Current behavior (WRONG):
user_request: "I want comprehensive AI agents with tools"

# System immediately:
  - Generates epic
  - Creates stories
  - Starts sprint planning

# What SHOULD happen:
  - Analyze request complexity
  - Identify dependencies
  - Show phased roadmap
  - Gate each phase
```

**Missing Gatekeeping System**:

```yaml
unlocking_by_stage:
  phase_1_foundation:
    gates:
      - "Basic agent CRUD working"
      - "Tool permissions defined"
      - "Provider auth tested"
    unblocks:
      - "Phase 2: Single-tool workflows"

  phase_2_single_tools:
    gates:
      - "read/write/list tools tested"
      - "Error handling verified"
    unblocks:
      - "Phase 3: Multi-tool orchestration"

  phase_3_orchestration:
    gates:
      - "Tool chaining working"
      - "State management validated"
    unblocks:
      - "Phase 4: Advanced features (RAG, multimodality)"

  phase_4_advanced:
    gates:
      - "Context window management"
      - "Cost controls"
    unblocks:
      - "Production rollout"
```

**Agent Behavior**:

```yaml
# Instead of immediately creating epics:
when: "Feature-rich request detected"

agent_should:
  - "Identify all dependencies"
  - "Map prerequisite capabilities"
  - "Show phased roadmap"
  - "Gate: Phase 1 must complete before Phase 2"

block_actions:
  - "Do NOT generate epic"
  - "Do NOT create stories"
  - "Do NOT start sprint planning"

show_user:
  - "Here's the roadmap to your goal"
  - "Phase 1: Foundation → Phase 2: Core → Phase 3: Advanced"
  - "We need to complete Phase 1 first"
```

---

### GAP 5: Remediation Misconception - P0

**Current State**: Remediation agents are treated as **one-time fixes**, not continuous workflow integration.

**Your Point (Validated)**:

```yaml
remediation_is_NOT:
  - "One-time architecture cleanup"
  - "Static fix list"
  - "Completed after Epic EPIC-FS"

remediation_IS:
  - "Continuous: Called by ANY correct-course workflow"
  - "Context-aware: Different for quick_patch vs architectural"
  - "Integrated with: All 3 governance workflows"
```

**Missing Integration**:

```yaml
# How remediation SHOULD integrate:

when_any_workflow_starts:
  1. "context-first: Gather context slices"
  2. "expert-analysis: Classify issue level"
  3. "IF issue_level == architectural:"
        - "Trigger remediation workflow"
        - "Load arc-v2/agents/ based on domain"
     "ELSE IF issue_level == feature_fix:"
        - "May call specific remediation agent"
     "ELSE IF issue_level == quick_patch:"
        - "Direct fix, no remediation needed"
  4. "IF remediation triggered:"
        - "Run domain-scanner first"
        - "Generate fresh evidence"
        - "Apply targeted fix"
        - "Validate with rollback plan"
```

**Current ARC-V2 agents don't reference this workflow**:

```yaml
# store-refactorer.md:
  - No mention of governance workflow trigger
  - No check for issue_level
  - No coordination with context-first

# component-splitter.md:
  - Same gaps

# workspace-architect.md:
  - Same gaps
```

---

## Part 3: Conflicts & Overlaps

### Conflict 1: Store Refactoring

| Agent | Claims Scope | Overlap | Conflict |
|-------|--------------|---------|----------|
| `store-refactorer.md` | Zustand stores | None defined | May duplicate work |
| `domain-scanner.md` | STATE domain scanning | Stores | No coordination |

**Resolution Needed**: `store-refactorer` should check `domain-scanner` output first.

### Conflict 2: Component Splitting

| Agent | Claims Scope | Overlap | Conflict |
|-------|--------------|---------|----------|
| `component-splitter.md` | God components | None defined | May split wrong components |
| `domain-scanner.md` | UX domain scanning | Components | No coordination |

**Resolution Needed**: `component-splitter` should validate against `domain-scanner` findings.

### Conflict 3: Workspace Architecture

| Agent | Claims Scope | Overlap | Conflict |
|-------|--------------|---------|----------|
| `workspace-architect.md` | File structure | None defined | May move files breaking imports |
| `domain-scanner.md` | ROUTING domain | Routes, cross-workspace | No coordination |

**Resolution Needed**: `workspace-architect` should analyze import graph first.

---

## Part 4: The Remediation Module Design (Corrected)

### What ARC-V2 SHOULD Be

```yaml
remediation_module:
  NOT: "One-time architecture fix"
  IS: "Continuous workflow integration"

  triggered_by:
    - "Any correct-course workflow"
    - "Governance workflows (context-first → expert-analysis)"
    - "Manual user request"

  classification_first:
    quick_patch:
      examples:
        - "Wrong component wiring"
        - "Simple bug fix"
        - "Typos, imports"
      approach: "Direct fix, no scanner needed"
      duration: "5-30 minutes"

    feature_fix:
      examples:
        - "Independent feature work"
        - "Single domain change"
      approach: "Targeted scanner + focused fix"
      duration: "1-3 hours"

    architectural:
      examples:
        - "Cross-domain impact"
        - "Breaking changes"
        - "Store refactoring"
      approach: "Full diagnostic-first workflow"
      duration: "3-15 hours"

  coordination_matrix:
    store_refactorer:
      requires:
        - "domain-scanner (STATE)"
        - "context-validator (Epic context)"
      coordinates_with:
        - "component-splitter (if store has embedded components)"
      triggered_by:
        - "architectural classification"
        - "Epic CC-1/CP-1 activation"

    component_splitter:
      requires:
        - "domain-scanner (UX)"
        - "Import dependency analysis"
      coordinates_with:
        - "store-refactorer (if component contains stores)"
      triggered_by:
        - "architectural classification"

    workspace_architect:
      requires:
        - "domain-scanner (ROUTING)"
        - "Import graph analysis"
      coordinates_with:
        - "store-refactorer (if moving stores)"
        - "component-splitter (if moving components)"
      triggered_by:
        - "architectural classification"
```

---

## Part 5: Recommended Actions (Priority Order)

### P0 - URGENT

1. **Create AI/Agent/RAG Governance Scanner** (`_bmad-ext/modules/governance/scanners/ai-ecosystem-scan.md`)
   - Scan tool permissions
   - Validate provider configurations
   - Check RAG context freshness
   - Monitor agent tool usage patterns

2. **Create Artifact-to-Code Validation Scanner** (`_bmad-ext/modules/governance/scanners/stale-artifact-scan.md`)
   - Compare PRD vs implementation
   - Validate architecture docs vs code
   - Detect UX spec vs component drift

3. **Create Gatekeeping System** (`_bmad-ext/modules/governance/policies/unlocking-by-stage.md`)
   - Define phase gates
   - Block premature sprint planning
   - Show roadmap to users

4. **Integrate Remediation with Governance Workflows**
   - Update arc-v2 agents to check governance output
   - Add workflow trigger logic
   - Create coordination matrix

### P1 - HIGH

5. **Extend domain-scanner.md** with:
   - Feature-level scanning
   - Mutual relational analysis
   - Journey mapping

6. **Create deep-scan extensions**:
   - API contract validation
   - Data schema drift detection
   - File structure analysis

### P2 - MEDIUM

7. **Create artifact management dashboard**:
   - Centralized artifact registry
   - Health scores per artifact
   - Drift visualization

---

## Part 6: File Structure for Missing Components

```
_bmad-ext/modules/
├── governance/
│   ├── scanners/
│   │   ├── artifact-scanner.md         ✅ EXISTS
│   │   ├── context-scanner.md          ✅ EXISTS
│   │   ├── ai-ecosystem-scan.md        ❌ CREATE
│   │   ├── stale-artifact-scan.md      ❌ CREATE
│   │   ├── api-contract-scan.md        ❌ CREATE
│   │   └── feature-dependency-scan.md  ❌ CREATE
│   ├── policies/
│   │   ├── artifact-lifecycle.md       ✅ EXISTS
│   │   ├── context-strategy.md         ✅ EXISTS
│   │   ├── gating-policy.md            ✅ EXISTS
│   │   └── unlocking-by-stage.md       ❌ CREATE
│   └── workflows/
│       ├── remediation-integration.md  ❌ CREATE
│       └── diagnostic-cycle.md         ❌ CREATE
└── arc-v2/
    ├── agents/
    │   ├── context-validator.md        ❌ CREATE (from MODULE.md claim)
    │   ├── domain-scanner.md           ✅ EXISTS (needs extension)
    │   ├── store-refactorer.md         ✅ EXISTS (needs integration)
    │   ├── component-splitter.md       ✅ EXISTS (needs integration)
    │   ├── workspace-architect.md      ✅ EXISTS (needs integration)
    │   └── remediation-coordinator.md  ❌ CREATE
    └── workflows/
        ├── diagnostic-first.md         ✅ EXISTS (claimed)
        ├── domain-remediation.md       ✅ EXISTS (claimed)
        └── journey-repair.md           ✅ EXISTS (claimed)
```

---

**Audit Version**: 1.0.0
**Audited By**: Critical Code Review
**Next Action**: Create P0 scanners and integration workflows

---

`★ Insight ─────────────────────────────────────`
1. **The 3 governance workflows exist but are isolated** - They must be wired into remediation agents
2. **AI/Agent/RAG ecosystem is completely unregulated** - 23 tools with CRUD operations, zero governance
3. **Remediation is treated as one-time, not continuous** - This is the fundamental misconception
`─────────────────────────────────────────────────`
