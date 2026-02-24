# BMAD Module Consolidation Specification

**Version**: 1.0.0  
**Date**: 2026-01-10  
**Status**: DRAFT - AWAITING HUMAN APPROVAL  
**Author**: Module Builder Agent  

---

## Executive Summary

This specification addresses two critical problems:
1. **Overlapping modules** causing agent confusion on entry points
2. **Scattered artifacts** causing context poisoning and hallucination

**Scope**: Phase 0 (Immediate Triage) + Phase 1 (Unified Registry)

---

## Phase 0: Immediate Triage

**Goal**: Archive redundant modules, freeze problematic files, establish clean baseline

### 0.1 Archive Actions (Immediate)

| Target | Action | Reason |
|--------|--------|--------|
| `_bmad/modules/architecture-refactoring/` | ARCHIVE | Duplicate of `architecture-remediation`. Only 3 files, functionality migrated. |
| `_bmad/modules/asgl/LOOP_STATE-grandparent.yaml` | ARCHIVE | Creates 3-level hierarchy hallucination. Parent/child sufficient. |
| `_bmad/modules/asgl/LOOP_STATE-child.yaml` | ARCHIVE | Stale (2026-01-07). Replace with single `LOOP_STATE.yaml`. |
| `_bmad/modules/asgl/LOOP_STATE-parent.yaml` | ARCHIVE | Stale (2026-01-07). Replace with single `LOOP_STATE.yaml`. |

**Archive Location**: `_bmad-output/.archive/2026-01-10/phase-0-triage/`

### 0.2 Freeze Actions (Do Not Modify Until Phase 2)

| Target | Reason |
|--------|--------|
| `_bmad/modules/MODULE-ROUTING.yaml` | 316 lines, overly complex. Needs complete redesign in Phase 2. |
| `_bmad/modules/asgl/workflows/main-loop.md` | References archived files. Update after registry created. |

### 0.3 Keep Actions (Confirmed Working)

| Target | Reason |
|--------|--------|
| `_bmad/modules/governance/checklists/*.yaml` | 5 gates actively used in sprint workflow |
| `_bmad/modules/governance/MANIFEST.yaml` | Clean structure, good reference |
| `_bmad/modules/quality/scanners/*.md` | 10 scanners, actively invoked |
| `_bmad/bmm/agents/*.md` | 9 implementation agents, working |
| `bmm-workflow-status.yaml` | Current source of truth for sprint |

### 0.4 Phase 0 Validation Gate

Before proceeding to Phase 1, verify:

```bash
# 1. No references to archived files
grep -r "architecture-refactoring" _bmad/ --include="*.md" --include="*.yaml"
grep -r "LOOP_STATE-grandparent" _bmad/ --include="*.md" --include="*.yaml"
grep -r "LOOP_STATE-child" _bmad/ --include="*.md" --include="*.yaml"
grep -r "LOOP_STATE-parent" _bmad/ --include="*.md" --include="*.yaml"

# 2. Archive folder created
ls -la _bmad-output/.archive/2026-01-10/phase-0-triage/

# 3. TypeScript still compiles
pnpm tsc --noEmit
```

### 0.5 Phase 0 Rollback

If issues discovered:
```bash
# Restore from archive
mv _bmad-output/.archive/2026-01-10/phase-0-triage/* _bmad/modules/
```

---

## Phase 1: Unified Registry

**Goal**: Create single source of truth for all modules, agents, workflows

### 1.1 New File: `_bmad/BMAD-REGISTRY.yaml`

```yaml
# BMAD-REGISTRY.yaml
# Single source of truth for all BMAD components
# Version: 1.0.0
# Updated: 2026-01-10

schema_version: "1.0.0"
last_updated: "2026-01-10T00:00:00+07:00"
updated_by: "consolidation-phase-1"

# ═══════════════════════════════════════════════════════════════════════════
# MODULE DEFINITIONS (Max 4 Active)
# ═══════════════════════════════════════════════════════════════════════════

modules:
  # ─────────────────────────────────────────────────────────────────────────
  # MODULE A: Core Governance & Orchestration
  # ─────────────────────────────────────────────────────────────────────────
  core-orchestration:
    id: "MOD-A"
    name: "Core Governance & Orchestration"
    status: "ACTIVE"
    tier: 1
    paths:
      - "_bmad/core/"
      - "_bmad/modules/core-governance/"
      - "_bmad/modules/governance/"
      - "_bmad/modules/asgl/"
    
    agents:
      - id: "bmad-master"
        path: "_bmad/core/agents/bmad-master.md"
        role: "Central orchestrator - ONLY entry point"
      - id: "governance-agent"
        path: "_bmad/modules/governance/agents/governance-agent.md"
        role: "Artifact lifecycle management"
      - id: "platform-router"
        path: "_bmad/modules/core-governance/agents/platform-router.md"
        role: "Claude Code / OpenCode routing"
    
    workflows:
      - id: "main-loop"
        path: "_bmad/modules/asgl/workflows/main-loop.md"
        entry: true
      - id: "brainstorming"
        path: "_bmad/core/workflows/brainstorming/workflow.md"
      - id: "party-mode"
        path: "_bmad/core/workflows/party-mode/workflow.md"
      - id: "artifact-lifecycle"
        path: "_bmad/modules/governance/workflows/artifact-lifecycle.md"
      - id: "stale-artifact-validation"
        path: "_bmad/modules/governance/workflows/stale-artifact-validation.md"
    
    checklists:
      - "_bmad/modules/governance/checklists/story-start-gate.yaml"
      - "_bmad/modules/governance/checklists/story-done-gate.yaml"
      - "_bmad/modules/governance/checklists/epic-done-gate.yaml"
      - "_bmad/modules/governance/checklists/sprint-rotation-gate.yaml"
      - "_bmad/modules/governance/checklists/artifact-freshness-gate.yaml"

  # ─────────────────────────────────────────────────────────────────────────
  # MODULE B: Sprint & Feature Execution
  # ─────────────────────────────────────────────────────────────────────────
  sprint-execution:
    id: "MOD-B"
    name: "Sprint & Feature Execution"
    status: "ACTIVE"
    tier: 2
    paths:
      - "_bmad/bmm/"
      - "_bmad/bmb/"
    
    agents:
      - id: "analyst"
        path: "_bmad/bmm/agents/analyst.md"
        role: "Requirements analysis"
      - id: "architect"
        path: "_bmad/bmm/agents/architect.md"
        role: "System design, ADRs"
      - id: "dev"
        path: "_bmad/bmm/agents/dev.md"
        role: "Feature implementation"
      - id: "pm"
        path: "_bmad/bmm/agents/pm.md"
        role: "Backlog management"
      - id: "sm"
        path: "_bmad/bmm/agents/sm.md"
        role: "Story creation, sprint tracking"
      - id: "tea"
        path: "_bmad/bmm/agents/tea.md"
        role: "Test strategy, QA"
      - id: "tech-writer"
        path: "_bmad/bmm/agents/tech-writer.md"
        role: "Documentation"
      - id: "ux-designer"
        path: "_bmad/bmm/agents/ux-designer.md"
        role: "UI/UX design"
      - id: "quick-flow-solo-dev"
        path: "_bmad/bmm/agents/quick-flow-solo-dev.md"
        role: "Fast-track bug fixes"
    
    workflows:
      - id: "create-product-brief"
        path: "_bmad/bmm/workflows/1-analysis/create-product-brief/workflow.md"
      - id: "research"
        path: "_bmad/bmm/workflows/1-analysis/research/workflow.md"
      - id: "quick-dev"
        path: "_bmad/bmm/workflows/bmad-quick-flow/quick-dev/workflow.md"
      - id: "create-tech-spec"
        path: "_bmad/bmm/workflows/bmad-quick-flow/create-tech-spec/workflow.md"
      - id: "codebase-diagnostic"
        path: "_bmad/bmm/workflows/codebase-diagnostic/workflow.md"

  # ─────────────────────────────────────────────────────────────────────────
  # MODULE C: Quality & Architecture
  # ─────────────────────────────────────────────────────────────────────────
  quality-architecture:
    id: "MOD-C"
    name: "Quality & Architecture"
    status: "ACTIVE"
    tier: 2
    paths:
      - "_bmad/modules/quality/"
      - "_bmad/modules/architecture-remediation/"
      - "_bmad/modules/integration-testing/"
    
    agents:
      - id: "store-refactorer"
        path: "_bmad/modules/architecture-remediation/agents/store-refactorer.md"
        role: "God store elimination"
      - id: "component-splitter"
        path: "_bmad/modules/architecture-remediation/agents/component-splitter.md"
        role: "Component normalization"
      - id: "typescript-fixer"
        path: "_bmad/modules/architecture-remediation/agents/typescript-fixer.md"
        role: "TS error batch fixing"
      - id: "test-writer"
        path: "_bmad/modules/architecture-remediation/agents/test-writer.md"
        role: "Test coverage improvement"
      - id: "workspace-architect"
        path: "_bmad/modules/architecture-remediation/agents/workspace-architect.md"
        role: "Workspace E2E implementation"
      - id: "file-sync-specialist"
        path: "_bmad/modules/architecture-remediation/agents/file-sync-specialist.md"
        role: "Sync strategy consolidation"
      - id: "real-world-validator"
        path: "_bmad/modules/integration-testing/agents/real-world-validator.md"
        role: "Browser automation, E2E"
    
    scanners:
      - id: "state-scanner"
        path: "_bmad/modules/quality/scanners/state-scanner.md"
      - id: "architecture-scanner"
        path: "_bmad/modules/quality/scanners/architecture-scanner.md"
      - id: "security-scanner"
        path: "_bmad/modules/quality/scanners/security-scanner.md"
      - id: "performance-scanner"
        path: "_bmad/modules/quality/scanners/performance-scanner.md"
      - id: "types-scanner"
        path: "_bmad/modules/quality/scanners/types-scanner.md"
      - id: "ux-scanner"
        path: "_bmad/modules/quality/scanners/ux-scanner.md"
      - id: "workspace-scanner"
        path: "_bmad/modules/quality/scanners/workspace-scanner.md"
      - id: "persistence-scanner"
        path: "_bmad/modules/quality/scanners/persistence-scanner.md"
      - id: "agent-rag-scanner"
        path: "_bmad/modules/quality/scanners/agent-rag-scanner.md"
      - id: "evidence-synthesizer"
        path: "_bmad/modules/quality/scanners/evidence-synthesizer.md"
    
    workflows:
      - id: "eliminate-god-stores"
        path: "_bmad/modules/architecture-remediation/workflows/eliminate-god-stores.md"
      - id: "normalize-components"
        path: "_bmad/modules/architecture-remediation/workflows/normalize-components.md"
      - id: "workspace-file-system-e2e"
        path: "_bmad/modules/architecture-remediation/workflows/workspace-file-system-e2e.md"
      - id: "state-consolidation-cycle"
        path: "_bmad/modules/architecture-remediation/workflows/state-consolidation-cycle.md"

  # ─────────────────────────────────────────────────────────────────────────
  # MODULE D: Creative & Innovation
  # ─────────────────────────────────────────────────────────────────────────
  creative-innovation:
    id: "MOD-D"
    name: "Creative & Innovation"
    status: "ACTIVE"
    tier: 3
    paths:
      - "_bmad/cis/"
    
    agents:
      - id: "brainstorming-coach"
        path: "_bmad/cis/agents/brainstorming-coach.md"
        role: "Ideation facilitation"
      - id: "creative-problem-solver"
        path: "_bmad/cis/agents/creative-problem-solver.md"
        role: "Lateral thinking"
      - id: "design-thinking-coach"
        path: "_bmad/cis/agents/design-thinking-coach.md"
        role: "Human-centered design"
      - id: "innovation-strategist"
        path: "_bmad/cis/agents/innovation-strategist.md"
        role: "Innovation frameworks"

# ═══════════════════════════════════════════════════════════════════════════
# ROUTING RULES (Simplified)
# ═══════════════════════════════════════════════════════════════════════════

routing:
  # Entry point - ALWAYS start here
  entry_point: "core-orchestration.bmad-master"
  
  # Story type → Module routing
  story_routing:
    diagnostic: "quality-architecture"
    remediation: "quality-architecture"
    feature: "sprint-execution"
    bugfix: "sprint-execution"
    documentation: "sprint-execution"
    brainstorming: "creative-innovation"
    innovation: "creative-innovation"
  
  # Handoff protocol
  handoff:
    required_fields:
      - "parent_id"
      - "story_id"
      - "source_module"
      - "target_module"
      - "created_at"
    output_path: "_bmad-output/handoffs/{date}/{story_id}-handoff.md"

# ═══════════════════════════════════════════════════════════════════════════
# LOOP STATE (Unified - Replaces 3-Level Hierarchy)
# ═══════════════════════════════════════════════════════════════════════════

loop_state:
  file: "_bmad/modules/asgl/LOOP_STATE.yaml"
  schema:
    session_id: "string"
    started_at: "datetime"
    last_updated: "datetime"
    current_story: "string"
    current_module: "MOD-A | MOD-B | MOD-C | MOD-D"
    status: "RUNNING | PAUSED | COMPLETED | FAILED"
    human_intent_timestamp: "datetime"  # NEW: Anti-hallucination anchor
    staleness_threshold_hours: 4        # NEW: Auto-invalidate if older

# ═══════════════════════════════════════════════════════════════════════════
# ARCHIVED MODULES (For Reference Only)
# ═══════════════════════════════════════════════════════════════════════════

archived:
  - id: "architecture-refactoring"
    archived_at: "2026-01-10"
    reason: "Duplicate of architecture-remediation"
    archive_path: "_bmad-output/.archive/2026-01-10/phase-0-triage/"
```

### 1.2 New File: `_bmad/modules/asgl/LOOP_STATE.yaml` (Unified)

```yaml
# LOOP_STATE.yaml - Unified Loop State (Replaces 3-level hierarchy)
# Version: 2.0.0
# Updated: 2026-01-10

version: "2.0.0"
schema: "unified"

# ═══════════════════════════════════════════════════════════════════════════
# SESSION TRACKING
# ═══════════════════════════════════════════════════════════════════════════

session:
  id: null  # Set on loop start
  started_at: null
  last_updated: null
  status: "NOT_STARTED"  # NOT_STARTED | RUNNING | PAUSED | COMPLETED | FAILED

# ═══════════════════════════════════════════════════════════════════════════
# ANTI-HALLUCINATION ANCHOR
# ═══════════════════════════════════════════════════════════════════════════

anchor:
  human_intent_timestamp: null      # When human last provided explicit direction
  human_intent_summary: null        # What human asked for (max 100 chars)
  staleness_threshold_hours: 4      # If older than this, require re-confirmation
  auto_invalidate: true             # Automatically invalidate stale state

# ═══════════════════════════════════════════════════════════════════════════
# CURRENT WORK
# ═══════════════════════════════════════════════════════════════════════════

current:
  story_id: null
  story_title: null
  epic_id: null
  module: null           # MOD-A | MOD-B | MOD-C | MOD-D
  workflow: null
  agent: null
  step: null             # Current step in workflow
  
# ═══════════════════════════════════════════════════════════════════════════
# PROGRESS
# ═══════════════════════════════════════════════════════════════════════════

progress:
  stories_completed: 0
  stories_remaining: 0
  artifacts_created: []
  errors: []

# ═══════════════════════════════════════════════════════════════════════════
# CONTINUATION (For Resume)
# ═══════════════════════════════════════════════════════════════════════════

continuation:
  next_action: null
  blockers: []
  pending_handoffs: []
```

### 1.3 Phase 1 Validation Gate

Before proceeding to Phase 2, verify:

```bash
# 1. Registry file exists and is valid YAML
cat _bmad/BMAD-REGISTRY.yaml | python3 -c "import sys, yaml; yaml.safe_load(sys.stdin)"

# 2. Unified LOOP_STATE exists
cat _bmad/modules/asgl/LOOP_STATE.yaml | python3 -c "import sys, yaml; yaml.safe_load(sys.stdin)"

# 3. All agent paths in registry are valid
# (Script to validate all paths exist)

# 4. No duplicate agent IDs across modules
# (Script to check uniqueness)
```

### 1.4 Phase 1 Rollback

If issues discovered:
```bash
# Delete new files (they're new, not modified)
rm _bmad/BMAD-REGISTRY.yaml
rm _bmad/modules/asgl/LOOP_STATE.yaml

# Restore archived files if needed
mv _bmad-output/.archive/2026-01-10/phase-0-triage/* _bmad/modules/
```

---

## Implementation Checklist

### Phase 0 Checklist

- [ ] **0.1** Create archive folder: `_bmad-output/.archive/2026-01-10/phase-0-triage/`
- [ ] **0.2** Move `architecture-refactoring/` to archive
- [ ] **0.3** Move `LOOP_STATE-grandparent.yaml` to archive
- [ ] **0.4** Move `LOOP_STATE-child.yaml` to archive
- [ ] **0.5** Move `LOOP_STATE-parent.yaml` to archive
- [ ] **0.6** Run validation gate (grep for archived references)
- [ ] **0.7** Run `pnpm tsc --noEmit` to verify no TypeScript breaks
- [ ] **0.8** HUMAN APPROVAL checkpoint

### Phase 1 Checklist

- [ ] **1.1** Create `_bmad/BMAD-REGISTRY.yaml`
- [ ] **1.2** Create `_bmad/modules/asgl/LOOP_STATE.yaml` (unified)
- [ ] **1.3** Run validation gate (YAML syntax, path existence)
- [ ] **1.4** Update `_bmad/modules/asgl/workflows/main-loop.md` to reference new files
- [ ] **1.5** HUMAN APPROVAL checkpoint

---

## What This Specification Does NOT Cover (Future Phases)

| Phase | Scope | Dependency |
|-------|-------|------------|
| Phase 2 | Master Orchestrator v2 redesign | Phase 1 complete |
| Phase 3 | Artifact linking with `parent_id` | Phase 2 complete |
| Phase 4 | Cross-module routing protocol | Phase 3 complete |
| Phase 5 | Anti-hallucination resume protocol | Phase 4 complete |

---

## Approval Request

**To proceed with Phase 0 execution, please confirm:**

1. Archive targets are correct
2. Keep targets are correct  
3. Registry structure meets your needs

Reply with: `APPROVED: Phase 0` or request changes.
