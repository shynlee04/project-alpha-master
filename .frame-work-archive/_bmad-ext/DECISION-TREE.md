---
name: "DECISION-TREE"
description: "BMAD-EXT Routing Decision Tree - Route user intent to correct module/workflow"
version: "1.0.0"
tier: "orchestrator"
phase: "0"
status: "active"
category: "routing"
entry_point: "/route"
updated: "2026-01-15"

integration_points:
  reads_from:
    - "_bmad-ext/RESPONSIBILITY-MATRIX.md"
  writes_to: []
  invoked_by:
    - "master-orchestrator"
  hands_off_to:
    - "governance"
    - "arc-v2"
    - "bmad-core"
    - "sprint-planning-wrapper"
    - "implementation"
---

# BMAD-EXT Routing Decision Tree

## Purpose

Route user intent to the correct BMAD-EXT module and workflow based on:
1. Task type (ideation, planning, implementation, remediation)
2. Phase (0-4)
3. Context requirements

## Decision Flow

```
USER INTENT ANALYSIS
        │
        ▼
┌───────────────────┐
│ Is this EXISTING  │
│ CODE work?        │
└───────────────────┘
        │
   ┌────┴────┐
   ▼         ▼
  YES        NO
   │         │
   ▼         ▼
┌────────┐  ┌───────────────────┐
│ Bug/   │  │ Is this NEW       │
│ Error? │  │ FEATURE work?     │
└────────┘  └───────────────────┘
   │              │
   ▼              ▼
┌────┴────┐  ┌────┴────┐
YES       NO YES       NO
   │         │   │         │
   ▼         ▼   ▼         ▼
┌──────┐ ┌──────┐ ┌──────┐ ┌────────────┐
│ Fix  │ │ Refactor │ │Plan  │ │ What type │
│ Bug  │ │ Arch │ │Sprint │ │ of work?   │
└──────┘ └──────┘ └──────┘ └────────────┘
   │         │              │
   ▼         ▼              ▼
┌──────┐ ┌──────┐  ┌─────────────────┐
│GOV-  │ │ARC-V2│  │ Phase 1: Ideation│
│ERNANCE│ │or    │  │ Phase 2: PRD    │
│→ cc  │ │GOV-  │  │ Phase 3: Arch   │
│      │ │ERNANCE│  │ Phase 4: Implement│
└──────┘ └──────┘  └─────────────────┘
```

## Keyword-Based Routing

### Keywords → Module Mapping

| Keyword Pattern | Module | Workflow | Phase |
|-----------------|--------|----------|-------|
| brainstorm, ideation, ideas | bmad-core | brainstorming | 1 |
| party mode, rapid ideas, no limits | bmad-core | party-mode | 1 |
| product brief, product definition | bmad-core | create-product-brief | 1 |
| prd, requirements, functional spec | bmad-core | prd | 2 |
| architecture, system design, adr | bmad-core | create-architecture | 3 |
| sprint planning, plan sprint, cohesion | sprint-planning-wrapper | sprint-planning-enhanced | 2 |
| bug, error, fix issue, broken | governance | correct-course | 0 |
| refactor, split component, refactor store | arc-v2 | domain-scanner + agents | 0 |
| implement story, write code, develop | implementation | story-cycle | 4 |
| validate context, check freshness | governance | context-first | 0 |
| expert analysis, review code | governance | expert-analysis | 0 |
| research, tech choice, compare options | governance | research-trigger | 0 |
| diagnostic, scan architecture, domain scan | arc-v2 | diagnostic-first | 0 |

## Routing Decision Matrix

### Task Type: EXISTING CODE

| Sub-Type | Category | Module | Workflow | Action |
|----------|----------|--------|----------|--------|
| Bug/Error | Quick patch | governance | correct-course | Categorize → implementation |
| Bug/Error | Feature fix | governance | correct-course | Categorize → implementation |
| Bug/Error | Architectural | governance | correct-course | Categorize → arc-v2 |
| Refactoring | Component >300 lines | arc-v2 | component-splitter | Scan → split |
| Refactoring | Store >120 lines | arc-v2 | store-refactorer | Scan → refactor |
| Refactoring | General architecture | arc-v2 | diagnostic-first | Scan → remediate |
| Code Review | Context validation | governance | context-first | Scan → validate |
| Code Review | Issue analysis | governance | expert-analysis | Analyze → categorize |
| Code Review | Tech validation | governance | research-trigger | Research → validate |

### Task Type: NEW FEATURE

| Phase | Category | Module | Workflow | Action |
|-------|----------|--------|----------|--------|
| Phase 1 | Ideation - Creative | bmad-core | brainstorming | Generate → cluster → prioritize |
| Phase 1 | Ideation - Rapid | bmad-core | party-mode | Capture → export |
| Phase 1 | Definition | bmad-core | create-product-brief | Define → validate |
| Phase 2 | Requirements | bmad-core | prd | Document → validate |
| Phase 3 | Architecture | bmad-core | create-architecture | Design → ADR |
| Phase 2 | Sprint Planning | sprint-planning-wrapper | sprint-planning-enhanced | Plan → validate cohesion |
| Phase 4 | Implementation | implementation | story-cycle | Execute → test → review |

### Task Type: PLANNING

| Category | Module | Workflow | Action |
|----------|--------|----------|--------|
| Sprint planning | sprint-planning-wrapper | sprint-planning-enhanced | Plan sprint |
| Requirements gathering | bmad-core | prd | Document PRD |
| Architecture design | bmad-core | create-architecture | Design system |
| Product definition | bmad-core | create-product-brief | Define product |

## Handoff Decision Points

### After GOVERNANCE (Phase 0)

| Decision | Route To |
|----------|----------|
| Quick patch | implementation → correct-course |
| Feature fix | implementation → correct-course |
| Architectural conflict | arc-v2 → diagnostic-first |
| New feature | bmad-core (appropriate phase) |
| Research needed | governance → research-trigger |

### After BMAD-CORE (Phases 1-3)

| Decision | Route To |
|----------|----------|
| Sprint ready | sprint-planning-wrapper |
| More planning needed | Continue in bmad-core |
| Architecture complete | sprint-planning-wrapper |
| Requirements complete | create-architecture or sprint-planning |

### After SPRINT-PLANNING-WRAPPER (Phase 2)

| Decision | Route To |
|----------|----------|
| Sprint planned | implementation → story-cycle |
| Cohesion issues | Return to bmad-core for refinement |
| Dependency conflicts | Return to governance → expert-analysis |

### After IMPLEMENTATION (Phase 4)

| Decision | Route To |
|----------|----------|
| Story complete | Sprint complete (update status) |
| Bug found | Return to governance → correct-course |
| Architecture issue | arc-v2 → diagnostic-first |

## Quick Reference

### I want to...

| Intent | Command | Module | Workflow |
|--------|---------|--------|----------|
| Brainstorm ideas | `/brainstorming` | bmad-core | brainstorming |
| Rapid ideation | `/party-mode` | bmad-core | party-mode |
| Create product brief | `/product-brief` | bmad-core | create-product-brief |
| Write PRD | `/prd` | bmad-core | prd |
| Design architecture | `/architecture` | bmad-core | create-architecture |
| Plan sprint | `/sprint-planning` | sprint-planning-wrapper | sprint-planning-enhanced |
| Fix a bug | `/correct-course` | governance | correct-course |
| Refactor component | `/component-split` | arc-v2 | component-splitter |
| Refactor store | `/store-refactor` | arc-v2 | store-refactorer |
| Implement story | `/story-cycle` | implementation | story-cycle |
| Validate context | `/context-first` | governance | context-first |
| Analyze issue | `/expert-analysis` | governance | expert-analysis |
| Research tech | `/research-trigger` | governance | research-trigger |
| Scan architecture | `/diagnostic-first` | arc-v2 | diagnostic-first |

---

**Version**: 1.0.0
**Last Updated**: 2026-01-15
**Schema Version**: 1.0.0 (Frontmatter applied)
