---
id: "fw_20260129_110000_master_map"
title: "Master Prompt-to-Phase Mapping: Meta-Framework to OpenCode Native"
version: "1.0.0"
status: "SINGLE_SOURCE_OF_TRUTH"
date: "2026-01-29T11:00:00+07:00"
author: "architect-ext"
category: "framework"
tier: 1

purpose: |
  The DEFINITIVE BLUEPRINT for module-builder.
  Maps the 18 Prompt Types (Meta-Framework) to the 3 OpenCode Native Methodologies.
  Defines exactly which Skills, Tools, and Hooks trigger for every user request.

supersedes:
  - "07-master-prompt-to-phase-mapping-2026-01-29.md"

related_documents:
  - "06-three-methodologies-framework-2026-01-29.md"
  - "AGENTS.md"
---

# Master Prompt-to-Phase Mapping Document

**Document ID**: fw_20260129_110000_master_map
**Version**: 1.0.0
**Status**: SINGLE SOURCE OF TRUTH
**Date**: 2026-01-29
**Author**: architect-ext

---

## Executive Summary

This document translates the **Meta-Framework Analysis** (Traps, Failures, Protocols) into the **OpenCode Native Ecosystem** (Phases 2.1, 2.2, 2.3).

**The Equation**:
`User Prompt` (1 of 18) → `Phase` (0-4) → `Methodology 2.1` (Skills) + `Methodology 2.2` (Metadata) + `Methodology 2.3` (Governance Hooks)

---

## Section 1: The 18 Prompt Types → OpenCode Map

Mapping the "Meta-Framework Analysis" (A1-F3) to specific OpenCode Native primitives.

### Group A: New Features & Innovation (Phase 1/2)

| ID | Prompt Type | Phase | Workflow | Skills (Phase 2.1) | Metadata (Phase 2.2) | Governance Hooks (Phase 2.3) |
|----|-------------|-------|----------|-------------------|----------------------|------------------------------|
| **A1** | Greenfield Feature | 1 | `brainstorming` | `brainstorming`, `product-brief-writer` | `type: feature`<br>`risk: medium`<br>`phase: discovery` | `before:check-context-freshness`<br>`after:validate-schema(brief)` |
| **A2** | Feature Extension | 2 | `prd-update` | `requirements-analysis`, `story-splitting` | `type: enhancement`<br>`risk: low`<br>`phase: planning` | `before:validate-parent-epic`<br>`after:check-cohesion` |
| **A3** | Cross-cutting Concern | 0 | `diagnostic-first` | `domain-scanner`, `architecture-review` | `type: architecture`<br>`risk: high`<br>`scope: global` | `before:block-direct-write`<br>`after:update-adr-index` |

### Group B: Fixes & Maintenance (Phase 4)

| ID | Prompt Type | Phase | Workflow | Skills (Phase 2.1) | Metadata (Phase 2.2) | Governance Hooks (Phase 2.3) |
|----|-------------|-------|----------|-------------------|----------------------|------------------------------|
| **B1** | Quick Patch | 4 | `correct-course` | `systematic-debugging`, `patch-validation` | `type: fix`<br>`risk: low`<br>`bypass_gate: false` | `before:dry-reading-check`<br>`after:run-fast-tests` |
| **B2** | Feature Fix | 4 | `story-cycle` | `test-driven-development`, `code-review` | `type: fix`<br>`risk: medium`<br>`tdd: required` | `before:verify-repro-test`<br>`after:coverage-check(80%)` |
| **B3** | Architectural Conflict | 0 | `diagnostic-first` | `conflict-resolution`, `adr-consultation` | `type: conflict`<br>`risk: critical`<br>`escalation: true` | `before:freeze-affected-files`<br>`after:require-human-signoff` |

### Group C: Refactoring & Debt (Phase 4)

| ID | Prompt Type | Phase | Workflow | Skills (Phase 2.1) | Metadata (Phase 2.2) | Governance Hooks (Phase 2.3) |
|----|-------------|-------|----------|-------------------|----------------------|------------------------------|
| **C1** | Component Splitting | 4 | `normalize-components` | `component-splitter`, `react-refactoring` | `type: refactor`<br>`target: component`<br>`loc_limit: 300` | `before:verify-test-coverage`<br>`after:validate-component-size` |
| **C2** | Store Elimination | 4 | `eliminate-god-stores` | `store-refactorer`, `zustand-optimization` | `type: refactor`<br>`target: store`<br>`slices: required` | `before:map-store-deps`<br>`after:verify-state-persistence` |
| **C3** | Migration/Consolidation | 3 | `create-architecture` | `migration-strategy`, `legacy-bridge` | `type: migration`<br>`risk: high`<br>`mode: parallel` | `before:snapshot-state`<br>`after:validate-parity` |

### Group D: Decisions & Planning (Phase 2/3)

| ID | Prompt Type | Phase | Workflow | Skills (Phase 2.1) | Metadata (Phase 2.2) | Governance Hooks (Phase 2.3) |
|----|-------------|-------|----------|-------------------|----------------------|------------------------------|
| **D1** | Architecture Decision | 3 | `create-architecture` | `adr-writing`, `tradeoff-analysis` | `type: decision`<br>`status: proposed` | `before:check-conflicts(ADR)`<br>`after:notify-stakeholders` |
| **D2** | Technical Research | 0 | `research-trigger` | `mcp-research`, `tech-validation` | `type: research`<br>`output: report` | `before:check-knowledge-base`<br>`after:archive-findings` |
| **D3** | Sprint Planning | 2 | `sprint-planning-enhanced` | `sprint-planning`, `capacity-modeling` | `type: planning`<br>`cycle: sprint` | `before:validate-backlog`<br>`after:lock-sprint-file` |

### Group E: Documentation (Phase 3)

| ID | Prompt Type | Phase | Workflow | Skills (Phase 2.1) | Metadata (Phase 2.2) | Governance Hooks (Phase 2.3) |
|----|-------------|-------|----------|-------------------|----------------------|------------------------------|
| **E1** | API Documentation | 3 | `documentation-sync` | `api-contract-validation`, `doc-generation` | `type: docs`<br>`source: code` | `before:verify-types`<br>`after:validate-doc-links` |
| **E2** | User Guides | 3 | `documentation-sync` | `technical-writing`, `user-journey-map` | `type: docs`<br>`audience: user` | `before:verify-feature-complete`<br>`after:check-readability` |
| **E3** | Architecture Docs | 3 | `create-architecture` | `system-diagramming`, `c4-model` | `type: docs`<br>`level: system` | `before:scan-codebase`<br>`after:verify-diagram-syntax` |

### Group F: Ambiguity & Governance (Phase 0)

| ID | Prompt Type | Phase | Workflow | Skills (Phase 2.1) | Metadata (Phase 2.2) | Governance Hooks (Phase 2.3) |
|----|-------------|-------|----------|-------------------|----------------------|------------------------------|
| **F1** | Unclear Intent | 0 | `context-first` | `requirements-elicitation`, `clarification` | `type: triage`<br>`status: blocked` | `before:pause-execution`<br>`after:log-ambiguity` |
| **F2** | Multi-concern Request | 0 | `context-first` | `concern-separation`, `task-decomposition` | `type: triage`<br>`status: complex` | `before:block-monolith-plan`<br>`after:generate-subtasks` |
| **F3** | Contradictory Request | 0 | `expert-analysis` | `logical-reasoning`, `policy-check` | `type: conflict`<br>`status: rejected` | `before:check-policy`<br>`after:propose-alternative` |

---

## Section 2: Phase-by-Phase Execution & Agent Cycles

### Phase 0: Governance Foundation (The Gatekeeper)
* **Trigger**: Session Start, Ambiguous Prompt (Group F), Conflicts (B3)
* **Primary Agent**: `bmad-governance`
* **Sub-Agents**: `analyst-ext` (Analysis), `domain-scanner` (Context)
* **Inner Cycle (Triaging)**:
    1. Scan Context (Tools: `grep`, `glob`)
    2. Classify Request (Prompt Type A-F)
    3. Route to Phase 1-4
* **State Updates**: `LOOP_STATE.session_id`, `LOOP_STATE.current_phase`

### Phase 1: Ideation & Discovery
* **Trigger**: Greenfield Feature (A1)
* **Primary Agent**: `product-management-ext`
* **Sub-Agents**: `ux-designer-ext` (Visuals), `analyst-ext` (Feasibility)
* **Inner Cycle (Brainstorming)**:
    1. Generate Ideas (Skill: `brainstorming`)
    2. Validate vs Strategy (Skill: `strategic-alignment`)
    3. Select Best Option
* **State Updates**: `ARTIFACT_REGISTRY.brainstorming`, `LOOP_STATE.feature_context`

### Phase 2: Requirements & Planning
* **Trigger**: Feature Extension (A2), Sprint Planning (D3)
* **Primary Agent**: `bmad-sprint-manager`
* **Sub-Agents**: `tech-writer-ext` (Specs), `architect-ext` (Feasibility)
* **Inner Cycle (Definition)**:
    1. Draft Requirements (Skill: `requirements-analysis`)
    2. Map Dependencies (Skill: `dependency-mapping`)
    3. Validate Cohesion (Tool: `cohesion-scanner`)
* **State Updates**: `sprint-status.yaml`, `planning-artifacts/prd.md`

### Phase 3: Architecture & Design
* **Trigger**: Decisions (D1), Migration (C3), Docs (E1-E3)
* **Primary Agent**: `architect-ext`
* **Sub-Agents**: `deep-scan-orchestrator` (Validation), `tech-writer-ext` (ADRs)
* **Inner Cycle (Design)**:
    1. Draft Design/ADR (Skill: `adr-writing`)
    2. Validate Constraints (Skill: `architecture-review`)
    3. Finalize Spec
* **State Updates**: `architecture.md`, `ARTIFACT_REGISTRY.adrs`

### Phase 4: Implementation
* **Trigger**: Fixes (Group B), Refactoring (Group C)
* **Primary Agent**: `dev-ext`
* **Sub-Agents**: `tea-ext` (Testing), `real-world-validator` (QA)
* **Inner Cycle (TDD)**:
    1. Red: Write Fail Test (Skill: `test-driven-development`)
    2. Green: Implement Code
    3. Refactor: Clean Up (Skill: `clean-code`)
    4. Verify: Run Tests (Tool: `vitest`)
* **State Updates**: `sprint-status.yaml` (IN_PROGRESS -> DONE), `codebase`

---

## Section 3: Brownfield Specific Validation

Mapping Project Alpha's legacy issues to OpenCode enforcement.

| Brownfield Issue | Phase 2.2 Custom Tool (Detection) | Phase 2.3 Hook (Enforcement) |
|------------------|-----------------------------------|------------------------------|
| **`src/lib/` Usage** | `tool.validate-path({ pattern: 'src/lib' })` | `before:write` → BLOCK if path contains `src/lib` |
| **God Stores (>300 LOC)** | `tool.analyze-file-size({ limit: 300 })` | `after:write` → WARN if file > 300 lines |
| **Context Poisoning** | `tool.check-artifact-freshness({ ttl: '2h' })` | `before:read` → BLOCK if artifact > 2h old |
| **Legacy Bridges** | `tool.scan-imports({ pattern: 'bridge' })` | `before:write` → BLOCK imports from `_bmad-ext` bridges |
| **"Dual Chat" UI** | `tool.scan-ui-cohesion` | `before:sprint-planning` → BLOCK if UI is split |
| **Missing Schemas** | `tool.validate-zod-schema` | `before:write` → BLOCK if no Zod schema defined |
| **Implicit `any`** | `tool.check-types({ strict: true })` | `after:build` → FAIL if `noImplicitAny` violations |

---

## Section 4: The 10 Traps → OpenCode Solution

Mapping the "Meta-Framework Analysis" Traps to Native Solutions.

| Trap | Description | Phase 2.2 Solution (Metadata/Tools) | Phase 2.3 Solution (Hooks/Plugins) |
|------|-------------|-------------------------------------|------------------------------------|
| **1. Blind Charge** | Executing without context | `metadata.context_required: true` | `ContextGatheringGate` (Block if no read) |
| **2. Context Poisoning** | Using stale artifacts | `metadata.ttl: "2h"` | `StaleArtifactGuard` (Block read > TTL) |
| **3. Scope Creep** | Endless feature expansion | `metadata.scope_lock: true` | `ScopeBoundaryGate` (Block unrelated files) |
| **4. State Violation** | Breaking architecture | `metadata.layer: "domain"` | `CleanArchitectureGuard` (Block bad imports) |
| **5. Temporary Code** | "Just for now" fixes | `metadata.tech_debt: "forbidden"` | `TimeBoxingEnforcer` (Flag quick-fixes) |
| **6. File Tree Anarchy** | Random file placement | `metadata.canonical_path: true` | `CanonicalPathGuard` (Block non-std paths) |
| **7. God Components** | 500+ line files | `metadata.max_lines: 300` | `GodArtifactGuard` (Block save > limit) |
| **8. TS-Only Validation** | Trusting types blindly | `metadata.validation: "runtime"` | `EvidenceGate` (Require runtime proof) |
| **9. Nonsense Sprint** | Disconnected stories | `metadata.cohesion_score: 0.8` | `CohesionScanner` (Block planning < 0.8) |
| **10. Doc Drift** | Code != Docs | `metadata.sync_required: true` | `DocSyncPlugin` (Auto-flag outdated docs) |

---

## Section 5: Handoff Checklist for `module-builder`

Use this checklist to verify readiness before building `.opencode` folder.

### 1. Phase 2.1 Readiness (Less for More)
- [ ] Are all 16 Skills defined in `_bmad-output/opencode-native-migration/skills/`?
- [ ] Are all 8 Agents defined with `mode` and `permission`?
- [ ] Is the "Skill-on-Demand" pattern documented in `AGENT_BEHAVIOR.md`?

### 2. Phase 2.2 Readiness (Accurately Specific)
- [ ] Does `ARTIFACT_REGISTRY.yaml` have Zod schemas?
- [ ] Are the 10 Essential Commands defined as `.md` files?
- [ ] Do all file read operations support `@file[section]` syntax?
- [ ] Are Custom Tools defined for Brownfield detection (Part 3)?

### 3. Phase 2.3 Readiness (Auto Governance)
- [ ] Are the 4 Core Plugins (`StaleGuard`, `ArchGuard`, `TimeBox`, `StateSync`) specified?
- [ ] Is the Hook Registry defined (`tool.execute.before`, etc.)?
- [ ] Is `AGENT-STATE.yaml` schema finalized?

### 4. Migration Readiness
- [ ] Is the "Gap Analysis" complete?
- [ ] Are the "Three Methodologies" approved?
- [ ] Is this Master Map accepted as the Blueprint?
