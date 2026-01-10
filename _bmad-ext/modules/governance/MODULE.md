---
name: "governance"
version: "2.0.0"
status: "active"
phase: "0"
created: "2026-01-11"
updated: "2026-01-11"
tier: "foundation"
description: "BMAD Extension Governance Module - Context-first enforcement, expert analysis, and research triggers"
---

# Governance Module

**Purpose**: Foundation layer for all BMAD extension workflows. Enforces three enforcement concepts before any development work can proceed.

## Phase Classification

**PHASE 0: Governance Foundation** - CRITICAL, must complete before any development work

```
User Request
    ↓
[PHASE 0] Governance Check
    ├── Context-First (scan, contextualize, transform)
    ├── Expert Analysis (bug/error level, codebase comparison)
    └── Research Trigger (internet-based validation)
    ↓
Governance Report → Stop / Warn / Proceed
    ↓ (if Proceed)
[PHASE 1] Governance Consolidation
    ↓
[PHASE 3] Orchestrator Update
    ↓
[PHASE 4] Implementation Workflows
    ├── Story-Cycle (new features, stories)
    └── Correct-Course (bug fixes, remediation)
    ↓
[PHASE 5] Enhanced Agent Wrappers
```

## Module Order

1. **Phase 0**: Governance (this module) ✅
2. **Phase 1**: Governance Consolidation
3. **Phase 3**: Orchestrator Update
4. **Phase 4**: Implementation (story-cycle, correct-course)
5. **Phase 5**: Enhanced Agent Wrappers

## Three Enforcement Concepts

### 1. Context-First (Two-Step Hook)

**Purpose**: Auto-transform human dev prompt with accurate, relevant context

**Steps**:
1. **Scan**: Which domains, how deep, what slices to include
2. **Contextualize**: Transform prompt with relevant context
3. **Output**: Improved prompt for new session with accurate context

**Workflow**: `workflows/context-first/`

### 2. Agent as Expert

**Purpose**: Define bug/error level and detect flaws in user approach

**Steps**:
1. **Analyze**: Bug/error level (quick patch vs architectural conflict)
2. **Compare**: Against actual codebase
3. **Detect**: Flaws in user approach (overlapping, conflict, overwhelming)
4. **Decide**: Proceed / Warn / Stop

**Workflow**: `workflows/expert-analysis/`

### 3. Research Trigger

**Purpose**: Internet-based research for tech choices and trade-offs

**Triggers**:
- Tech choice validation needed
- Performance trade-off analysis required
- Best-practice verification
- Preventing "not-the-best-practice" chaos

**Workflow**: `workflows/research-trigger/`

## Directory Structure

```
governance/
├── MODULE.md                    # This file
├── workflows/
│   ├── context-first/           # Context-First enforcement
│   ├── expert-analysis/         # Agent as Expert analysis
│   ├── research-trigger/        # Research Trigger workflow
│   └── stage-gate/              # Stage gating enforcement
├── scanners/                    # Deep scanning capabilities
│   ├── artifact-scanner.md
│   ├── domain-scanner.md
│   ├── workspace-scanner.md
│   ├── feature-scanner.md
│   ├── relationship-scanner.md
│   ├── journey-scanner.md
│   ├── ux-ui-scanner.md
│   ├── api-contract-scanner.md
│   ├── schema-scanner.md
│   ├── file-structure-scanner.md
│   └── agent-rag-scanner.md
├── agent-rag/                   # Agent/AI/RAG ecosystem governance
│   ├── tools-governance.md
│   ├── rag-context-governance.md
│   ├── conversation-threads.md
│   ├── multimodality-governance.md
│   └── staging-by-phase.md
├── artifacts/                   # Artifact management
│   ├── registry.yaml
│   ├── naming-convention.md
│   ├── date-stamping-policy.md
│   ├── archiving-policy.md
│   └── file-monitor.md
├── config/
│   ├── checklists.yaml
│   ├── domains.yaml
│   └── gates.yaml
└── policies/
    ├── context-strategy.md
    ├── artifact-lifecycle.md
    └── gating-policy.md
```

## Integration Points

### Input
- User dev prompts (via orchestrator)
- Bug/error reports
- Feature requests

### Output
- `governance_report.yaml` - Report with:
  - `issue_level`: quick_patch | feature_fix | architectural
  - `context_slices`: List of relevant files
  - `recommended_approach`: Expert recommendation
  - `research_findings`: Internet research results (if triggered)
  - `decision`: proceed | warn | stop

### Updates
- `workflow-status.yaml` - Track governance checks
- `ARTIFACT_REGISTRY.yaml` - Register generated artifacts

## Dependencies

- **Required by**: All development workflows (Phase 2-5)
- **Depends on**: None (foundation layer)
- **Integrates with**: Orchestrator (Phase 3)

## Handoff Protocol

When governance approves work, handoff to:
- **Phase 1**: Governance Consolidation (one-time setup)
- **Phase 3**: Orchestrator Update (after consolidation)
- **Phase 4**: Implementation Workflows
  - **Story-Cycle**: For new features, story execution
  - **Correct-Course**: For bug fixes, remediation
- **Phase 5**: Enhanced Agent Wrappers (final)

---

## History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-11 | 2.0.0 | Initial Phase 0 governance module creation |
