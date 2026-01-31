# BMAD 4-Phase System & Complete Agent Hierarchy

> **Version**: 1.0.0
> **Created**: 2026-01-29 00:52
> **Purpose**: Master reference for orchestrators and agents to understand the complete system

---

## Section 1: The 4-Phase System

The BMAD framework operates through 4 distinct phases, with Phase 0 acting as the governance foundation that gates all other phases.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BMAD 4-PHASE DEVELOPMENT LIFECYCLE                  │
└─────────────────────────────────────────────────────────────────────────────┘

     ┌───────────────────────────────────────────────────────────────┐
     │  PHASE 0: GOVERNANCE FOUNDATION                               │
     │  ─────────────────────────────────────────────────────────────│
     │  What Happens:                                                │
     │    - Context-first validation (scan, contextualize, transform)│
     │    - Expert analysis (classify issues, detect flaws)          │
     │    - Research trigger (internet-based tech validation)        │
     │    - Self-governance cycle (artifact lifecycle, TTL)          │
     │    - Architecture remediation (diagnostic-first scanning)     │
     │                                                               │
     │  Agents:                                                      │
     │    - governance module (context-first, expert-analysis)       │
     │    - arc-v2 module (domain-scanner, remediation-executor)     │
     │    - bmad-governance shared service                           │
     │                                                               │
     │  Artifacts Created:                                           │
     │    - Governance reports                                       │
     │    - Context validation results                               │
     │    - Research findings                                        │
     │    - Remediation plans                                        │
     │                                                               │
     │  Exit Criteria → Phase 1-3:                                   │
     │    ✓ governance.decision == "proceed"                         │
     │    ✓ Context freshness validated                              │
     │    ✓ No critical architectural conflicts                      │
     │    ✓ Research complete (if tech choice required)              │
     └───────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
     ┌───────────────────────────────────────────────────────────────┐
     │  PHASE 1: IDEATION & DISCOVERY                                │
     │  ─────────────────────────────────────────────────────────────│
     │  What Happens:                                                │
     │    - Brainstorming sessions (creative ideation)               │
     │    - Party mode (rapid, no-limits ideation)                   │
     │    - Product brief creation (product definition)              │
     │                                                               │
     │  Agents:                                                      │
     │    - analyst-ext (requirements gathering)                     │
     │    - ux-designer-ext (UX research, user journeys)             │
     │    - product-management-ext (product vision)                  │
     │                                                               │
     │  Artifacts Created:                                           │
     │    - Brainstorming results (clustered, prioritized)           │
     │    - Product briefs                                           │
     │    - User journey maps                                        │
     │                                                               │
     │  Module: bmad-core/                                           │
     │    - workflows/brainstorming/                                 │
     │    - workflows/party-mode/                                    │
     │    - workflows/create-product-brief/                          │
     │                                                               │
     │  Exit Criteria → Phase 2:                                     │
     │    ✓ Product brief approved                                   │
     │    ✓ User personas defined                                    │
     │    ✓ Core value proposition clear                             │
     └───────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
     ┌───────────────────────────────────────────────────────────────┐
     │  PHASE 2: REQUIREMENTS & PLANNING                             │
     │  ─────────────────────────────────────────────────────────────│
     │  What Happens:                                                │
     │    - PRD creation (Create/Validate/Edit modes)                │
     │    - Sprint planning (cohesion validation, dependency mapping)│
     │    - Reality validation (nonsense detection)                  │
     │    - Epic/story breakdown                                     │
     │                                                               │
     │  Agents:                                                      │
     │    - product-management-ext (PRD authoring)                   │
     │    - analyst-ext (requirements analysis)                      │
     │    - bmad-sprint-manager (sprint planning)                    │
     │                                                               │
     │  Artifacts Created:                                           │
     │    - PRD (Product Requirements Document)                      │
     │    - Sprint status files (sprint-status.yaml)                 │
     │    - Cohesion reports                                         │
     │    - Dependency maps                                          │
     │    - Epic backlog                                             │
     │                                                               │
     │  Module: bmad-core/ + sprint-planning-wrapper/                │
     │    - workflows/prd/                                           │
     │    - workflows/sprint-planning-enhanced/ (7 steps)            │
     │    - scanners/cohesion-scanner.md                             │
     │    - scanners/dependency-scanner.md                           │
     │    - scanners/nonsense-detector.md                            │
     │                                                               │
     │  Exit Criteria → Phase 3:                                     │
     │    ✓ PRD validated (BMAD standards)                           │
     │    ✓ Sprint planned with cohesion score >= 4                  │
     │    ✓ No temporal conflicts detected                           │
     │    ✓ Dependencies resolved                                    │
     └───────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
     ┌───────────────────────────────────────────────────────────────┐
     │  PHASE 3: ARCHITECTURE & DESIGN                               │
     │  ─────────────────────────────────────────────────────────────│
     │  What Happens:                                                │
     │    - Architecture creation (system design)                    │
     │    - ADR (Architecture Decision Records) creation             │
     │    - UX design specification                                  │
     │    - Technical specification                                  │
     │    - Implementation readiness check                           │
     │                                                               │
     │  Agents:                                                      │
     │    - architect-ext (system design, ADRs)                      │
     │    - ux-designer-ext (UI/UX specifications)                   │
     │    - tech-writer-ext (documentation)                          │
     │                                                               │
     │  Artifacts Created:                                           │
     │    - Architecture.md                                          │
     │    - ADR documents                                            │
     │    - Tech specs                                               │
     │    - UX specifications (sharded sections)                     │
     │    - Component diagrams (Mermaid)                             │
     │                                                               │
     │  Module: bmad-core/                                           │
     │    - workflows/create-architecture/                           │
     │    - workflows/check-implementation-readiness/                │
     │                                                               │
     │  Exit Criteria → Phase 4:                                     │
     │    ✓ Architecture document approved                           │
     │    ✓ ADRs for major decisions                                 │
     │    ✓ UX specs complete                                        │
     │    ✓ Implementation readiness check passed                    │
     └───────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
     ┌───────────────────────────────────────────────────────────────┐
     │  PHASE 4: IMPLEMENTATION                                      │
     │  ─────────────────────────────────────────────────────────────│
     │  What Happens:                                                │
     │    - Story execution (story-cycle workflow, 10 steps)         │
     │    - TDD development (red-green-refactor)                     │
     │    - Code review (path walking, HTML validation)              │
     │    - Testing (unit, integration, E2E)                         │
     │    - Correct-course (bug fixes, remediation)                  │
     │    - Reality checks (visual regression)                       │
     │                                                               │
     │  Agents:                                                      │
     │    - dev-ext (code implementation)                            │
     │    - tea-ext (test design, QA)                                │
     │    - real-world-validator (production API tests)              │
     │                                                               │
     │  Artifacts Created:                                           │
     │    - Code changes (TypeScript, React)                         │
     │    - Test files                                               │
     │    - Story completion artifacts                               │
     │    - Journey maps (Mermaid)                                   │
     │    - Tool definitions (for agentic features)                  │
     │    - Visual regression reports                                │
     │                                                               │
     │  Module: implementation/                                      │
     │    - workflows/story-cycle/ (10 enhanced steps)               │
     │    - workflows/correct-course/                                │
     │                                                               │
     │  Quality Gates (Code Compliance):                             │
     │    - Story Start Gate (prerequisites)                         │
     │    - Test Gate (coverage >= 80%)                              │
     │    - Done Gate (all ACs met)                                  │
     │                                                               │
     │  Product Reality Gates (v2.0):                                │
     │    - Deep Analysis Gate (grep/glob context)                   │
     │    - Journey Reality Gate (code-verified)                     │
     │    - Evidence Gate (file:line validation)                     │
     │    - Architectural Gate (conflict detection)                  │
     │    - Code Reality Gate (path walking + HTML)                  │
     │    - Visual Reality Gate (journey comparison)                 │
     │                                                               │
     │  Exit Criteria → Sprint Complete:                             │
     │    ✓ All story tasks completed                                │
     │    ✓ TypeScript: 0 errors                                     │
     │    ✓ All tests passing                                        │
     │    ✓ Code review approved                                     │
     │    ✓ Reality check passed                                     │
     └───────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
     ┌───────────────────────────────────────────────────────────────┐
     │  RETROSPECTIVE & GOVERNANCE UPDATE                            │
     │  ─────────────────────────────────────────────────────────────│
     │  What Happens:                                                │
     │    - Epic retrospective (lessons learned)                     │
     │    - Governance document updates (AGENTS.md)                  │
     │    - Sprint status finalization                               │
     │    - Artifact archival (TTL enforcement)                      │
     │                                                               │
     │  Loop Back To:                                                │
     │    - Phase 0 for next sprint/epic                             │
     │    - Phase 4 for more stories in same sprint                  │
     └───────────────────────────────────────────────────────────────┘
```

---

## Section 2: Agent Hierarchy

### Complete Hierarchy Diagram

```
LEVEL 0: MASTER ORCHESTRATOR
╔══════════════════════════════════════════════════════════════════════════════╗
║  MASTER-ORCHESTRATOR (ext-master / master-orchestrator.md)                   ║
║  ──────────────────────────────────────────────────────────────────────────  ║
║  Scope: Central brain for all autonomous BMAD development                    ║
║  Responsibilities:                                                           ║
║    • Read workflow status (bmm-workflow-status.yaml)                         ║
║    • Route to Sprint-Planning Wrapper first                                  ║
║    • Route stories to enhanced agents by type                                ║
║    • Create handoff artifacts with traceability (UUID)                       ║
║    • Spawn enhanced agents as sub-agents                                     ║
║    • Receive completion callbacks                                            ║
║    • Update governance documents (AGENTS.md, sprint-status.yaml)             ║
║    • Decide: continue or stop                                                ║
║  Can Delegate: YES (to all Level 1 agents)                                   ║
║  Must Escalate: Human intent stale, critical errors, max iterations          ║
║  Tools: Read, Write, Task, Bash (limited)                                    ║
╚══════════════════════════════════════════════════════════════════════════════╝
        │
        ├──────────────────────────────────────────────────────────────────────
        │
LEVEL 1: PRIMARY AGENTS (Domain Experts)
├───────────────────────────────────────────────────────────────────────────────
│
│  ┌───────────────────────────────────────────────────────────────────────────┐
│  │ A1: sprint-manager (bmad-sprint-manager)                                  │
│  │ ─────────────────────────────────────────────────────────────────────────│
│  │ Module: MOD-C-SPRINT                                                      │
│  │ Scope: Sprint planning and story assignment                               │
│  │ Can Delegate: story-creator, story-validator, context-builder             │
│  │ Must Escalate: Cohesion failures, dependency conflicts                    │
│  │ Tools: Read, Write, Task                                                  │
│  └───────────────────────────────────────────────────────────────────────────┘
│
│  ┌───────────────────────────────────────────────────────────────────────────┐
│  │ A2: dev-ext (Senior Software Engineer)                                    │
│  │ ─────────────────────────────────────────────────────────────────────────│
│  │ Module: MOD-A-CGOV                                                        │
│  │ Phase: 4 (Implementation)                                                 │
│  │ Scope: Code implementation (features, fixes, TDD)                         │
│  │ Wraps: _bmad/bmm/agents/dev.md                                            │
│  │ Can Delegate: test-writer, component-splitter, store-refactorer           │
│  │ Must Escalate: TypeScript errors persist, tests fail 3x, architecture     │
│  │ Tools: Read, Write, Edit, Bash (pnpm tsc, vitest), Task                   │
│  │ Validation Commands: pnpm tsc --noEmit, pnpm vitest run, pnpm lint        │
│  └───────────────────────────────────────────────────────────────────────────┘
│
│  ┌───────────────────────────────────────────────────────────────────────────┐
│  │ A3: architect-ext (Software Architect & System Designer)                  │
│  │ ─────────────────────────────────────────────────────────────────────────│
│  │ Module: MOD-B-ARCH                                                        │
│  │ Phase: 0/3 (Governance + Architecture)                                    │
│  │ Scope: System design, ADRs, technical specifications                      │
│  │ Wraps: _bmad/bmm/agents/architect.md                                      │
│  │ Can Delegate: workspace-architect, domain-scanner, evidence-synthesizer   │
│  │ Must Escalate: Major architecture changes, ADR conflicts                  │
│  │ Tools: Read, Write (design only), Task                                    │
│  └───────────────────────────────────────────────────────────────────────────┘
│
│  ┌───────────────────────────────────────────────────────────────────────────┐
│  │ A4: tea-ext (Test Engineer & QA Specialist)                               │
│  │ ─────────────────────────────────────────────────────────────────────────│
│  │ Module: MOD-D-TEST                                                        │
│  │ Phase: 4 (Implementation)                                                 │
│  │ Scope: Integration testing, test design, TDD coaching                     │
│  │ Wraps: _bmad/bmm/agents/tea.md                                            │
│  │ Can Delegate: real-world-validator, playwright-agent                      │
│  │ Must Escalate: Test infrastructure failures, coverage < 80%               │
│  │ Tools: Read, Write, Bash (test commands)                                  │
│  └───────────────────────────────────────────────────────────────────────────┘
│
│  ┌───────────────────────────────────────────────────────────────────────────┐
│  │ A5: ux-designer-ext (UX/UI Designer)                                      │
│  │ ─────────────────────────────────────────────────────────────────────────│
│  │ Module: MOD-C-SPRINT                                                      │
│  │ Phase: 1-3 (Ideation through Architecture)                                │
│  │ Scope: UI/UX design, 8-bit aesthetic, accessibility (WCAG)                │
│  │ Wraps: _bmad/bmm/agents/ux-designer.md                                    │
│  │ Can Delegate: layout-auditor, responsive-checker                          │
│  │ Must Escalate: Accessibility violations, major UX pivots                  │
│  │ Tools: Read, Write (design files)                                         │
│  └───────────────────────────────────────────────────────────────────────────┘
│
│  ┌───────────────────────────────────────────────────────────────────────────┐
│  │ A6: tech-writer-ext (Technical Writer)                                    │
│  │ ─────────────────────────────────────────────────────────────────────────│
│  │ Module: MOD-C-SPRINT                                                      │
│  │ Phase: 3-4 (Architecture + Implementation)                                │
│  │ Scope: API docs, user guides, architecture documentation                  │
│  │ Wraps: _bmad/bmm/agents/tech-writer.md                                    │
│  │ Can Delegate: api-docs-agent, user-guide-agent                            │
│  │ Must Escalate: Major doc restructuring                                    │
│  │ Tools: Read, Write                                                        │
│  └───────────────────────────────────────────────────────────────────────────┘
│
│  ┌───────────────────────────────────────────────────────────────────────────┐
│  │ A7: analyst-ext (Business Analyst)                                        │
│  │ ─────────────────────────────────────────────────────────────────────────│
│  │ Module: MOD-C-SPRINT                                                      │
│  │ Phase: 1-2 (Ideation + Requirements)                                      │
│  │ Scope: Requirements gathering, user story breakdown, competitive analysis │
│  │ Wraps: _bmad/bmm/agents/analyst.md                                        │
│  │ Can Delegate: requirements-agent, competitor-agent                        │
│  │ Must Escalate: Requirement conflicts, scope creep                         │
│  │ Tools: Read, Task, Google Search, Tavily                                  │
│  └───────────────────────────────────────────────────────────────────────────┘
│
│  ┌───────────────────────────────────────────────────────────────────────────┐
│  │ A8: product-management-ext (Product Manager)                              │
│  │ ─────────────────────────────────────────────────────────────────────────│
│  │ Module: MOD-C-SPRINT                                                      │
│  │ Phase: 1-3 (Ideation through Architecture)                                │
│  │ Scope: PRD creation, product vision, roadmap                              │
│  │ Wraps: _bmad/bmm/agents/pm.md                                             │
│  │ Can Delegate: None (strategic role)                                       │
│  │ Must Escalate: Major product pivots, stakeholder conflicts                │
│  │ Tools: Read, Write                                                        │
│  └───────────────────────────────────────────────────────────────────────────┘
│
├──────────────────────────────────────────────────────────────────────────────
│
LEVEL 2: SUB-AGENTS (Task Specialists)
├───────────────────────────────────────────────────────────────────────────────
│
│  Sprint-Manager Sub-Agents:
│  ┌─────────────────────────────────────────────────────────────────┐
│  │ S1.1: story-creator     - Story file creation from epic backlog │
│  │ S1.2: story-validator   - Story file validation                 │
│  │ S1.3: context-builder   - Developer context XML generation      │
│  │ S1.4: retrospective-agent - Sprint/epic retrospective           │
│  └─────────────────────────────────────────────────────────────────┘
│
│  Dev-Ext Sub-Agents:
│  ┌─────────────────────────────────────────────────────────────────┐
│  │ S2.1: test-writer       - Unit test creation                    │
│  │ S2.2: component-splitter - Large component refactoring (>300 ln)│
│  │ S2.3: store-refactorer  - God store elimination (>120 ln)       │
│  │ S2.4: file-sync-specialist - File sync strategy                 │
│  └─────────────────────────────────────────────────────────────────┘
│
│  Architect-Ext Sub-Agents:
│  ┌─────────────────────────────────────────────────────────────────┐
│  │ S3.1: workspace-architect - Workspace E2E implementation        │
│  │ S3.2: domain-scanner    - Domain analysis and boundaries        │
│  │ S3.3: evidence-synthesizer - Findings aggregation               │
│  └─────────────────────────────────────────────────────────────────┘
│
│  Tea-Ext Sub-Agents:
│  ┌─────────────────────────────────────────────────────────────────┐
│  │ S4.1: real-world-validator - Production API testing, browser    │
│  │ S4.2: playwright-agent  - E2E browser automation                │
│  └─────────────────────────────────────────────────────────────────┘
│
│  Deep-Scan Specialists (Invoked by architect-ext or governance):
│  ┌─────────────────────────────────────────────────────────────────┐
│  │ deep-scan-orchestrator  - Orchestrates all scanners             │
│  │ deep-scan-architecture-scanner - Layer violations, god patterns │
│  │ deep-scan-state-scanner - Zustand v5, circular deps             │
│  │ deep-scan-types-scanner - TypeScript diagnostics, any types     │
│  │ deep-scan-security-scanner - Secret leaks, XSS, unsafe ops      │
│  │ deep-scan-performance-scanner - Bundle bloat, memory leaks      │
│  │ deep-scan-persistence-scanner - IndexedDB, schema issues        │
│  │ deep-scan-ux-scanner    - i18n, accessibility, responsive       │
│  │ deep-scan-workspace-scanner - Cross-workspace leaks             │
│  │ deep-scan-agent-rag-scanner - Tool permissions, prompt injection│
│  │ deep-scan-evidence-synthesizer - Aggregates, prioritizes risks  │
│  └─────────────────────────────────────────────────────────────────┘
│
├──────────────────────────────────────────────────────────────────────────────
│
LEVEL 3: SHARED SERVICES
├───────────────────────────────────────────────────────────────────────────────
│
│  ┌───────────────────────────────────────────────────────────────────────────┐
│  │ S1: bmad-governance (Governance Enforcement)                              │
│  │ ─────────────────────────────────────────────────────────────────────────│
│  │ Scope: Compliance enforcement, artifact lifecycle, state management      │
│  │ Invoked By: All agents at session start, artifact creation, completion   │
│  │ Functions:                                                                │
│  │   • TTL enforcement (4-tier system)                                       │
│  │   • Artifact registry management                                          │
│  │   • Context freshness validation                                          │
│  │   • Stale document archival                                               │
│  │ Tools: Read, Write (governance files only)                                │
│  └───────────────────────────────────────────────────────────────────────────┘
│
│  ┌───────────────────────────────────────────────────────────────────────────┐
│  │ S2: quality-scanner (Quality Validation)                                  │
│  │ ─────────────────────────────────────────────────────────────────────────│
│  │ Scope: Cross-platform handoff, session management                         │
│  │ Invoked By: Orchestrator, enhanced agents                                 │
│  │ Functions:                                                                │
│  │   • TypeScript error scanning                                             │
│  │   • Test coverage validation                                              │
│  │   • Architecture pattern compliance                                       │
│  │   • 8-bit design system compliance                                        │
│  │ Tools: Read, Bash (limited: pnpm tsc, vitest)                             │
│  └───────────────────────────────────────────────────────────────────────────┘
│
│  ┌───────────────────────────────────────────────────────────────────────────┐
│  │ S3: platform-router (Platform Selection)                                  │
│  │ ─────────────────────────────────────────────────────────────────────────│
│  │ Scope: Optimal platform selection (Claude Code vs OpenCode)               │
│  │ Selection Matrix:                                                         │
│  │   • Code Generation → Claude Code (92% success)                           │
│  │   • Documentation → OpenCode (89% success)                                │
│  │   • Real-World Testing → Both (95% success)                               │
│  │   • Sprint Execution → Both (91% success)                                 │
│  │   • Architecture Remediation → Claude Code (94% success)                  │
│  │ Tools: Read only                                                          │
│  └───────────────────────────────────────────────────────────────────────────┘
│
└───────────────────────────────────────────────────────────────────────────────
```

### Agent Counts Summary

| Level | Type | Count | Purpose |
|-------|------|-------|---------|
| 0 | Orchestrator | 1 | Central brain, routing, handoffs |
| 1 | Primary Agents | 8 | Domain experts (≤8 limit) |
| 2 | Sub-Agents | 22 | Task specialists (≤4 per primary) |
| 3 | Shared Services | 3 | Infrastructure services |
| **Total** | | **34** | |

---

## Section 3: Bouncing Loops

### Loop 1: Governance ↔ Implementation

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GOVERNANCE ↔ IMPLEMENTATION LOOP                  │
└─────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐                              ┌──────────────┐
  │  GOVERNANCE  │                              │IMPLEMENTATION│
  │   (Phase 0)  │                              │   (Phase 4)  │
  └──────────────┘                              └──────────────┘
        │                                              │
        │  1. Context-first scan                       │
        │  2. Expert analysis                          │
        │  3. Research trigger                         │
        │                                              │
        ▼                                              │
  [ALLOW?]────────YES──────────────────────────────────▶
        │                                              │
        │                                     4. Story-cycle execution
        │                                     5. TDD development
        │                                     6. Testing
        │                                              │
        │                                              ▼
        │◀───────────────[COMPLETE?]──────────────────YES
        │                     │
        │                     NO (bug/error)
        │                     │
        │                     ▼
        │◀────────────── correct-course workflow
        │
        ▼
  7. Post-work validation
  8. Governance update
  9. Artifact archival
```

### Loop 2: Sprint ↔ Story ↔ Sprint

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SPRINT ↔ STORY ↔ SPRINT LOOP                      │
└─────────────────────────────────────────────────────────────────────┘

         ┌──────────────────┐
         │  SPRINT PLANNING │
         │  (7-step enhanced)│
         └──────────────────┘
                  │
                  │ 1. Discover epics
                  │ 2. Generate status
                  │ 3. Cohesion check
                  │ 4. Dependency map
                  │ 5. Reality validation
                  │ 6. Gatekeeping
                  │ 7. Handoff
                  │
                  ▼
    ┌──────────────────────────────────────────────┐
    │           STORY EXECUTION CYCLE               │
    │  ┌─────────────────────────────────────────┐ │
    │  │ STORY 1 → STORY 2 → STORY 3 → ...       │ │
    │  │    │                                     │ │
    │  │    ▼                                     │ │
    │  │ [story-cycle workflow: 10 steps]        │ │
    │  │    │                                     │ │
    │  │    ├── 1. Init (deep analysis)          │ │
    │  │    ├── 1a. User journey (code-verified) │ │
    │  │    ├── 2. Validate (evidence-based)     │ │
    │  │    ├── 3a. Agent tool spec              │ │
    │  │    ├── 3. Implement (TDD + conflict)    │ │
    │  │    ├── 4. Test                          │ │
    │  │    ├── 5. Review (path walking + HTML)  │ │
    │  │    ├── 6. Done                          │ │
    │  │    ├── 6a. Reality check                │ │
    │  │    └── 7. Retrospective                 │ │
    │  │                                          │ │
    │  │    [ALL STORIES DONE?]                   │ │
    │  │         │                                │ │
    │  │    NO───┘     YES───────────────────────┼─┼──▶
    │  └─────────────────────────────────────────┘ │
    └──────────────────────────────────────────────┘
                                                    │
                                                    ▼
         ┌──────────────────┐
         │     SPRINT       │
         │    COMPLETE      │
         └──────────────────┘
                  │
                  │ Update sprint-status.yaml
                  │ Retrospective
                  │ Governance update
                  │
                  ▼
         [MORE SPRINTS?]───YES──────▶ Back to Sprint Planning
                  │
                  NO
                  │
                  ▼
         EPIC COMPLETE
```

### Loop 3: Implement ↔ Test ↔ Review

```
┌─────────────────────────────────────────────────────────────────────┐
│                    IMPLEMENT ↔ TEST ↔ REVIEW LOOP                    │
└─────────────────────────────────────────────────────────────────────┘

                        ┌─────────────────┐
                        │   IMPLEMENT     │
                        │ (Step 3: TDD)   │
                        └─────────────────┘
                               │
                               │ RED: Write failing test
                               │ GREEN: Write minimum code
                               │ REFACTOR: Improve code
                               │
                               ▼
                        ┌─────────────────┐
                        │     TEST        │
                        │   (Step 4)      │
                        └─────────────────┘
                               │
                               │ pnpm vitest run
                               │ Coverage check (>= 80%)
                               │
                               ▼
                        [TESTS PASS?]
                               │
              ┌────────NO──────┴──────YES────────┐
              │                                   │
              ▼                                   ▼
    ┌─────────────────┐                 ┌─────────────────┐
    │    FIX TESTS    │                 │     REVIEW      │
    │   (max 3 retries)│                 │   (Step 5)      │
    └─────────────────┘                 └─────────────────┘
              │                                   │
              │ Debug                             │ Code path walking
              │ Fix                               │ HTML output validation
              │                                   │ AC mapping
              │                                   │
              └──────────────▶ Back to TEST       │
                                                  ▼
                                        [REVIEW PASS?]
                                                  │
                         ┌────────NO──────────────┴──────YES────────┐
                         │                                           │
                         ▼                                           ▼
              ┌─────────────────┐                         ┌─────────────────┐
              │ FIX ISSUES      │                         │     DONE        │
              │ (Step 5 feedback)│                         │   (Step 6)      │
              └─────────────────┘                         └─────────────────┘
                         │
                         └────────▶ Back to IMPLEMENT
```

### Loop 4: Plan ↔ Execute ↔ Validate

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PLAN ↔ EXECUTE ↔ VALIDATE LOOP                    │
└─────────────────────────────────────────────────────────────────────┘

            ┌─────────────────┐
            │      PLAN       │
            │  (Phase 1-3)    │
            └─────────────────┘
                    │
                    │ Product Brief
                    │ PRD
                    │ Architecture
                    │ Sprint Planning
                    │
                    ▼
            ┌─────────────────┐
            │    EXECUTE      │
            │   (Phase 4)     │
            └─────────────────┘
                    │
                    │ Story-cycle
                    │ TDD
                    │ Code review
                    │
                    ▼
            ┌─────────────────┐
            │    VALIDATE     │
            │  (Phase 0 + 4)  │
            └─────────────────┘
                    │
                    │ Quality gates
                    │ Reality checks
                    │ Governance update
                    │
                    ▼
            [VALIDATION PASS?]
                    │
    ┌────NO─────────┴──────YES────────┐
    │                                  │
    ▼                                  ▼
┌────────────┐                 ┌────────────┐
│  CORRECT   │                 │  COMPLETE  │
│  COURSE    │                 │            │
└────────────┘                 └────────────┘
    │                                  │
    │ Categorize issue                 │ Archive artifacts
    │ Route to fix                     │ Update AGENTS.md
    │                                  │ Retrospective
    │                                  │
    └────────▶ Back to PLAN/EXECUTE    │
                                       ▼
                              [MORE WORK?]
                                       │
                      YES──────────────┴──────NO
                        │                      │
                        ▼                      ▼
              Back to PLAN             SESSION COMPLETE
```

---

## Section 4: High-Level vs Low-Level Comparison

| Aspect | High-Level (Orchestrator) | Low-Level (Executor) |
|--------|---------------------------|----------------------|
| **Role** | Central brain, routing | Task execution |
| **Decision Type** | Strategic (what to do) | Tactical (how to do it) |
| **Scope** | Session, sprint, epic | Story, task, step |
| **State Managed** | LOOP_STATE.yaml, ARTIFACT_REGISTRY | Step progress, task tracker |
| **Artifacts Created** | Handoff artifacts, status updates | Code, tests, reports |
| **Tool Access** | Task (delegation), Read, Write (status) | Read, Write, Edit, Bash |
| **Handoff Direction** | Outbound to agents | Inbound from orchestrator |
| **Callback** | Receives from agents | Sends to orchestrator |
| **Time Horizon** | Hours (session length) | Minutes (step duration) |
| **Escalation** | To human | To orchestrator |
| **Context** | All stories, sprint status | Current story, AC |
| **Validation** | Session-level, governance | Code-level, tests |
| **Recovery** | Retry, escalate, pause | Retry, fix, report |

### Detailed Comparison: Orchestrator vs dev-ext

| Capability | master-orchestrator | dev-ext |
|------------|---------------------|---------|
| **Load Story** | ✅ From workflow status | ✅ From handoff artifact |
| **Route to Agent** | ✅ Primary function | ❌ N/A |
| **Create Handoff** | ✅ Orchestrator → Agent | ✅ Agent → Orchestrator |
| **Write Code** | ❌ Never | ✅ Primary function |
| **Run Tests** | ❌ Never | ✅ pnpm vitest run |
| **Update LOOP_STATE** | ✅ Session, delegation | ✅ Current step |
| **Await Callback** | ✅ From agents | ❌ Sends callback |
| **Governance Update** | ✅ AGENTS.md updates | ❌ Reports completion |
| **Continue Decision** | ✅ Continue/stop | ❌ Reports status |

---

## Section 5: Phase Transitions

### Transition Matrix

| From | To | Trigger | Validation Required | Handoff Artifact |
|------|-----|---------|---------------------|------------------|
| - | Phase 0 | Session start | None | None |
| Phase 0 | Phase 1 | New feature request | Governance check | governance-report.yaml |
| Phase 0 | Phase 4 | Bug fix request | Governance check | correct-course-handoff.md |
| Phase 1 | Phase 2 | Product brief approved | Product brief complete | product-brief.md |
| Phase 2 | Phase 3 | PRD approved | PRD validated | prd.md |
| Phase 3 | Phase 2 | Sprint planning | Architecture complete | architecture.md |
| Phase 2 | Phase 4 | Sprint planned | Cohesion >= 4 | sprint-status.yaml |
| Phase 4 | Phase 4 | Next story | Previous story done | story-handoff.md |
| Phase 4 | Phase 0 | Bug discovered | - | bug-report.md |
| Phase 4 | Phase 0 | Sprint complete | All stories done | sprint-complete.md |
| Phase 0 | - | Epic complete | All sprints done | retrospective.md |

### Transition Validation Details

#### Phase 0 → Phase 1-3 (Governance to Core Planning)

```yaml
transition: "governance_to_planning"
trigger: "New feature request OR ideation needed"

validation:
  - governance.decision == "proceed"
  - context_freshness < staleness_threshold
  - no_critical_blockers == true

handoff:
  artifact: "_bmad-output/handoffs/{date}/governance-to-planning.md"
  includes:
    - governance_report
    - context_summary
    - recommendations
    - approved_scope

next_module: "bmad-core (Phase 1, 2, or 3 based on progress)"
```

#### Phase 2 → Phase 4 (Sprint Planning to Implementation)

```yaml
transition: "sprint_to_implementation"
trigger: "Sprint planning complete"

validation:
  - cohesion_score >= 4
  - dependency_conflicts == 0
  - nonsense_detected == false
  - stories_assigned == true

handoff:
  artifact: "_bmad-output/handoffs/{date}/sprint-to-impl.md"
  includes:
    - sprint_status
    - story_list
    - cohesion_notes
    - dependency_map

next_module: "implementation (story-cycle)"
```

#### Phase 4 → Phase 0 (Implementation to Governance - Bug)

```yaml
transition: "implementation_to_governance"
trigger: "Bug discovered during implementation"

validation:
  - None (immediate escalation)

handoff:
  artifact: "_bmad-output/handoffs/{date}/bug-escalation.md"
  includes:
    - bug_description
    - affected_files
    - reproduction_steps
    - severity_level

next_module: "governance (correct-course)"
```

#### Phase 4 → Phase 0 (Sprint Complete)

```yaml
transition: "sprint_complete"
trigger: "All stories in sprint done"

validation:
  - all_stories.status == "DONE"
  - typescript_errors == 0
  - tests_passing == true
  - governance_check_passed == true

handoff:
  artifact: "_bmad-output/handoffs/{date}/sprint-complete.md"
  includes:
    - stories_completed
    - artifacts_created
    - test_results
    - lessons_learned

next_actions:
  - Update AGENTS.md
  - Create retrospective
  - Archive sprint artifacts
  - Route to next sprint OR epic complete
```

---

## Section 6: Key State Files

| File | Purpose | Updated By | Read By |
|------|---------|------------|---------|
| `_bmad-ext/state/LOOP_STATE.yaml` | Session state, anchor, delegations | Orchestrator, agents | All |
| `_bmad-ext/state/ARTIFACT_REGISTRY.yaml` | Artifact tracking, parent-child links | All agents | Orchestrator, governance |
| `_bmad-ext/state/DELEGATION_LOG.yaml` | Delegation history | Orchestrator | Debugging |
| `bmm-workflow-status.yaml` | Current story, phase, progress | Orchestrator | All agents |
| `sprint-status.yaml` | Sprint stories, status | Sprint manager | Implementation agents |
| `AGENTS.md` | Governance, quick reference | Orchestrator (auto) | All agents |

---

## Section 7: Module Responsibility Boundaries

| Module | Phase | Responsibility | Boundaries |
|--------|-------|----------------|------------|
| **governance** | 0 | Self-governance, context validation | Validates context, doesn't execute |
| **arc-v2** | 0 | Architecture scanning | Scans and plans, doesn't implement |
| **bmad-core** | 1-3 | Ideation through architecture | Creates specs, doesn't implement |
| **sprint-planning-wrapper** | 2 | Sprint planning | Plans sprints, doesn't implement |
| **implementation** | 4 | Story execution | Implements, doesn't plan |

### No Overlaps (Verified)

- `governance ≠ implementation`: Categorization vs execution
- `arc-v2 ≠ governance`: Architecture vs context validation
- `bmad-core ≠ implementation`: Planning vs execution
- `sprint-planning-wrapper ≠ all`: Pure planning function

---

## Section 8: Quick Reference Commands

### Entry Points by Module

| Module | Command | Agent |
|--------|---------|-------|
| governance | `/context-first`, `/expert-analysis`, `/research-trigger`, `/correct-course` | ext-master |
| bmad-core | `/brainstorming`, `/party-mode`, `/product-brief`, `/prd`, `/architecture` | ext-master |
| sprint-planning-wrapper | `/sprint-planning` | ext-master |
| implementation | `/story-cycle`, `/dev-story` | dev-ext |
| arc-v2 | `/diagnostic-first`, `/component-split`, `/store-refactor` | architect-ext |

### Routing Decision Tree (Quick)

```
User Intent
    │
    ├── "bug", "error", "fix" ────────▶ governance → correct-course
    ├── "brainstorm", "ideas" ────────▶ bmad-core → brainstorming
    ├── "prd", "requirements" ────────▶ bmad-core → prd
    ├── "architecture", "design" ─────▶ bmad-core → create-architecture
    ├── "sprint", "plan sprint" ──────▶ sprint-planning-wrapper
    ├── "implement", "story" ─────────▶ implementation → story-cycle
    ├── "refactor", "split" ──────────▶ arc-v2 → domain-scanner
    └── "test", "validate" ───────────▶ tea-ext → testing-cycle
```

---

**Document Version**: 1.0.0
**Created**: 2026-01-29 00:52
**Author**: architect-ext
**Status**: COMPLETE
