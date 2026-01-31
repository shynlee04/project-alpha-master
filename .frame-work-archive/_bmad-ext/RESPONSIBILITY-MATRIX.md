---
name: "RESPONSIBILITY-MATRIX"
description: "BMAD-EXT Module Responsibilities - Clear boundaries, no overlap, defined handoffs"
version: "1.0.0"
tier: "foundation"
phase: "0"
status: "active"
category: "governance"
entry_point: "/responsibility-matrix"
updated: "2026-01-15"

integration_points:
  reads_from: []
  writes_to: []
  invoked_by:
    - "master-orchestrator"
  hands_off_to: []

triggers:
  - "responsibility matrix"
  - "module boundaries"
  - "overlap check"
---

# BMAD-EXT Module Responsibility Matrix

## Overview

This document defines clear boundaries between BMAD-EXT modules to prevent overlap and ensure proper routing.

## Module Phase Map

| Phase | Module | Primary Responsibility |
|-------|--------|------------------------|
| **0** | `governance` | Self-governance, context validation, artifact lifecycle |
| **0** | `arc-v2` | Architecture remediation, domain scanning |
| **1** | `bmad-core` | Ideation and product definition |
| **2** | `sprint-planning-wrapper` | Sprint planning with cohesion validation |
| **4** | `implementation` | Story execution, bug fixes |

## Detailed Responsibilities

### 1. GOVERNANCE Module (Phase 0)

**Purpose**: Self-governance and context validation before any work

| Workflow | Responsibility | Output |
|----------|---------------|--------|
| `context-first` | Scan domains, validate code, transform prompt | Context package |
| `expert-analysis` | Define issue level, detect flaws in approach | Issue categorization |
| `research-trigger` | Internet-based research for tech choices | Research findings |
| `correct-course` | Categorize bug fixes and remediation | Remediation plan |

**Boundaries**:
- ✅ DO: Validate context, detect flaws, trigger research
- ❌ DON'T: Execute code fixes (that's implementation)
- ❌ DON'T: Create new features (that's bmad-core)
- ❌ DON'T: Plan sprints (that's sprint-planning-wrapper)

---

### 2. ARC-V2 Module (Phase 0)

**Purpose**: Architecture remediation and domain scanning

| Workflow/Agent | Responsibility | Output |
|----------------|---------------|--------|
| `diagnostic-first` | Always scan before remediation | Fresh evidence |
| `domain-scanner` | 6-domain targeted scanning | Scan results |
| `store-refactorer` | Zustand store splitting | Refactored stores |
| `component-splitter` | React component splitting | Split components |
| `workspace-architect` | File structure architecture | Architecture fixes |

**Boundaries**:
- ✅ DO: Scan and fix architecture issues
- ❌ DON'T: Create new features (that's implementation)
- ❌ DON'T: Plan product requirements (that's bmad-core)
- ❌ DON'T: Sprint planning (that's sprint-planning-wrapper)

---

### 3. BMAD-CORE Module (Phases 1-3)

**Purpose**: Ideation through architecture design

| Workflow | Phase | Responsibility | Output |
|----------|-------|---------------|--------|
| `brainstorming` | 1 | Creative ideation | Idea clusters |
| `party-mode` | 1 | Rapid ideation | Raw ideas |
| `create-product-brief` | 1 | Product definition | Product brief |
| `prd` | 2 | Requirements document | PRD |
| `create-architecture` | 3 | System design | Architecture + ADRs |

**Boundaries**:
- ✅ DO: Create new features from ideation to architecture
- ❌ DON'T: Execute implementation (that's implementation)
- ❌ DON'T: Fix bugs (that's governance/implementation)
- ❌ DON'T: Sprint planning (that's sprint-planning-wrapper)

---

### 4. SPRINT-PLANNING-WRAPPER Module (Phase 2)

**Purpose**: Enhanced sprint planning with cohesion validation

| Workflow | Responsibility | Output |
|----------|---------------|--------|
| `sprint-planning-enhanced` | Cohesion check, dependency map, reality validation | Sprint plan |

**Boundaries**:
- ✅ DO: Plan and validate sprints
- ❌ DON'T: Create new features (that's bmad-core)
- ❌ DON'T: Execute stories (that's implementation)
- ❌ DON'T: Architecture remediation (that's arc-v2)

---

### 5. IMPLEMENTATION Module (Phase 4)

**Purpose**: Execute development work

| Workflow | Responsibility | Output |
|----------|---------------|--------|
| `story-cycle` | Execute new features | Completed stories |
| `correct-course` | Fix bugs and remediation | Bug fixes |

**Boundaries**:
- ✅ DO: Execute features and fix bugs
- ❌ DON'T: Create product requirements (that's bmad-core)
- ❌ DON'T: Plan sprints (that's sprint-planning-wrapper)
- ❌ DON'T: Architecture scanning (that's arc-v2)

---

## Overlap Analysis

### ⚠️ Potential Overlaps (Resolved)

| Modules | Overlap | Resolution |
|---------|---------|------------|
| governance vs implementation | Both have `correct-course` | governance = categorization, implementation = execution |
| arc-v2 vs implementation | Both do remediation | arc-v2 = architecture scanning, implementation = code execution |

### ✅ No Overlaps

- Governance and bmad-core: Different phases (0 vs 1-3)
- bmad-core and implementation: Planning vs execution
- arc-v2 and governance: Architecture vs context validation
- sprint-planning-wrapper and all: Pure planning function

---

## Handoff Chains

### Feature Development Flow

```
governance (Phase 0)
    ↓ [context validated]
bmad-core (Phase 1-3)
    ├── brainstorming → party-mode → create-product-brief
    → prd → create-architecture
    ↓ [architecture complete]
sprint-planning-wrapper (Phase 2)
    ↓ [sprint planned]
implementation (Phase 4)
    └── story-cycle → DONE
```

### Bug Fix Flow

```
governance (Phase 0)
    └── expert-analysis → research-trigger → correct-course (categorize)
    ↓ [architectural issue]
arc-v2 (Phase 0)
    └── diagnostic-first → domain-scan → fix
    ↓ [simple fix]
implementation (Phase 4)
    └── correct-course → DONE
```

### Architecture Remediation Flow

```
governance (Phase 0)
    └── expert-analysis → correct-course (categorize as architectural)
    ↓ [architectural conflict]
arc-v2 (Phase 0)
    └── diagnostic-first → domain-scanner → store-refactorer/component-splitter
    ↓ [fix complete]
implementation (Phase 4)
    └── [may介入 for complex fixes]
```

---

## Decision Tree Summary

| User Input | Route To |
|------------|----------|
| "Brainstorm X" | bmad-core → brainstorming |
| "Rapid ideas on X" | bmad-core → party-mode |
| "Create product brief" | bmad-core → create-product-brief |
| "Write PRD for X" | bmad-core → prd |
| "Design architecture for X" | bmad-core → create-architecture |
| "Plan sprint" | sprint-planning-wrapper |
| "Fix bug in X" | governance → correct-course → implementation |
| "Refactor stores" | arc-v2 → store-refactorer |
| "Split component X" | arc-v2 → component-splitter |
| "Implement story X" | implementation → story-cycle |
| "Validate context" | governance → context-first |
| "Research tech choice" | governance → research-trigger |

---

## Module Entry Points

| Module | Entry Command |
|--------|---------------|
| governance | `/context-first`, `/expert-analysis`, `/research-trigger`, `/correct-course` |
| arc-v2 | `/diagnostic-first`, `/domain-scan`, `/store-refactor`, `/component-split` |
| bmad-core | `/brainstorming`, `/party-mode`, `/product-brief`, `/prd`, `/architecture` |
| sprint-planning-wrapper | `/sprint-planning` |
| implementation | `/story-cycle`, `/correct-course` |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-15 | Initial responsibility matrix |

---

**Version**: 1.0.0
**Last Updated**: 2026-01-15
**Schema Version**: 1.0.0 (Frontmatter applied)
