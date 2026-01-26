# BMAD Master Plan: Platform Consolidation & Migration
**Date**: 2026-01-14
**Status**: DRAFT - Awaiting Approval
**Version**: 1.0

---

## Executive Summary

This master plan addresses critical issues discovered through comprehensive audit of the BMAD framework:

| Issue | Severity | Impact | Timeline |
|-------|----------|--------|----------|
| Duplicate Agent-RAG scanners | 🔴 CRITICAL | Naming conflicts cause execution errors | Phase 1 (Day 1) |
| Conflicting routing systems | 🔴 CRITICAL | Workflows route to wrong agents | Phase 1 (Day 1) |
| Orphaned artifacts | 🟡 MEDIUM | Context poisoning, stale references | Phase 1 (Day 1) |
| Platform integration gaps | 🟡 MEDIUM | Reduced automation coverage | Phase 2 (Day 2-3) |
| Team coordination gaps | 🟢 LOW | Manual overhead, risk of delays | Phase 3 (Day 4+) |

---

## Part 1: Current State Assessment

### 1.1 Module Structure Overview

```
_BMAD FRAMEWORK (106 MD files)
├── _bmad/modules/              (25 files) - Legacy, partially migrated
│   ├── sprint-execution/       - Team A focused
│   ├── integration-testing/    - Cross-team
│   ├── quality/                - Scanners (9 types)
│   └── asgl/                   - Autonomous loops
│
└── _bmad-ext/modules/          (81 files) - Active, growing
    ├── governance/             (30) - Self-governance
    ├── implementation/         (27) - Story execution
    ├── sprint-planning-wrapper/ (13) - Sprint gating
    ├── arc-v2/                 (7)  - Architecture remediation
    └── SYSTEM-FILES/            (4)  - Audit reports, hierarchy

PLATFORM INTEGRATION LAYERS
├── .claude/                    - Claude Code platform
│   ├── skills/ (60+)           - Primary integration
│   ├── commands/ (70+)         - Workflow triggers
│   ├── agents/ (17)            - Agent definitions
│   └── hooks/ (9)              - Session automation
│
└── .opencode/                  - OpenCode platform
    ├── skill/ (55)             - Modular capabilities
    ├── scripts/                - Governance automation
    ├── agent/                  - Enhanced agents
    └── hooks/                  - File monitoring
```

### 1.2 Critical Conflicts Identified

#### Conflict #1: Agent-RAG Scanner Duplication
```
_bmad/modules/quality/scanners/agent-rag-scanner.md
└── Focus: Tool permissions, RAG pipeline, model registry

_bmad-ext/modules/governance/scanners/agent-rag-scanner.md
└── Focus: Clustering prevention, multimodality, staging
```
**Resolution**: Rename to distinguish purposes.

#### Conflict #2: Routing System Chaos
```
_bmad/modules/MODULE-ROUTING.yaml (old, obsolete)
_bmad-ext/orchestrator/master-orchestrator.md (current)
```
**Resolution**: Delete obsolete file, consolidate into master-orchestrator.

#### Conflict #3: Empty Artifact Registry
```
_bmad-output/state/ARTIFACT_REGISTRY.yaml → EMPTY (0 entries)
_bmad-ext/state/ARTIFACT_REGISTRY.yaml → Active
```
**Resolution**: Make `_bmad-output/` the canonical location.

### 1.3 Team A/Team B Coordination

| Aspect | Team A (Identity & Routing) | Team B (Storage Contract) |
|--------|----------------------------|---------------------------|
| **Current Focus** | EPIC-CC-ARC Phase C (State) | EPIC-CC-ARC Phase D/E (Entity) |
| **Completion** | ~85% | 18/28 stories (64%) |
| **Dependencies** | Platform contract → enables Team B | FSA/IDB adapters → enables features |
| **Handoff Method** | UUID-based artifacts | Same, but siloed |
| **Coordination Gap** | No cross-team standing sync | Limited visibility |

---

## Part 2: Consolidation Plan (What to Keep, Merge, Delete)

### 2.1 Phase 1: Critical Cleanup (Day 1 - 2 hours)

#### Actions to Execute

| # | Action | Command/Files | Impact |
|---|--------|---------------|--------|
| C1 | Rename Agent-RAG scanners | `mv _bmad-ext/.../agent-rag-scanner.md agent-permissions-scanner.md` | Eliminates name conflict |
| C2 | Delete obsolete routing | `rm _bmad/modules/MODULE-ROUTING.yaml` | Removes confusion |
| C3 | Delete orphaned files | `rm kilo_code_task_*.md` and 3 empty dirs | Cleans ~100KB |
| C4 | Merge registries | Copy `_bmad-ext/state/` → `_bmad-output/state/` | Single source of truth |
| C5 | Archive stale research | Move `research/2026-01-07/` through `01-11/` to archive | Removes clutter |

#### Validation
After Phase 1, verify:
- [ ] No duplicate filenames exist between `_bmad/` and `_bmad-ext/`
- [ ] `_bmad-output/state/ARTIFACT_REGISTRY.yaml` has entries
- [ ] Grep for "agent-rag" returns only distinct files

### 2.2 Phase 2: Module Consolidation (Day 2-3 - 6 hours)

#### Merge Decisions

| From | To | Reason |
|------|-----|--------|
| `_bmad/modules/quality/scanners/` | `_bmad-ext/modules/governance/scanners/` | Consolidate all scanners |
| `_bmad/modules/governance/` | `_bmad-ext/modules/governance/` | Already migrated, delete old |
| `_bmad/commands/bmad/` | `.claude/commands/bmad-ext/` | Platform-specific routing |
| `_bmad-ext/modules/CONSOLIDATED-BMAD-MODULE-*.md` | Convert to active workflows | Make plan executable |

#### Delete Decisions

| File/Directory | Reason |
|----------------|--------|
| `_bmad/modules/MODULE-ROUTING.yaml` | Obsolete, replaced by master-orchestrator |
| `_bmad-output/documentation/bmad-ext/` | Empty duplicate |
| `_bmad-output/handoffs/bmad-ext-session/` | Empty duplicate |
| `.opencode/node_modules/` | Unnecessary dependency (zod) |
| `.claude/skills/.archive/` (14 skills) | Replaced by BMAD-v2 patterns |

#### Keep Decisions (No Changes)

| Module | Reason |
|--------|--------|
| `_bmad-ext/modules/governance/` | Core governance, actively maintained |
| `_bmad-ext/modules/implementation/` | Story execution, Team B workflow |
| `_bmad-ext/modules/arc-v2/` | Architecture remediation, unique purpose |
| `_bmad-ext/modules/sprint-planning-wrapper/` | Sprint gating, cross-team coordination |

### 2.3 Phase 3: Naming Standardization

Apply consistent naming across all modules:

| Pattern | Old | New |
|---------|-----|-----|
| Scanners | `*-scanner.md` | Keep, but prefix with domain: `domain-*-scanner.md` |
| Workflows | `workflow.md` inside `steps/` | Flatten: `workflow-name-steps/*.md` |
| Agents | `*-ext.md` | Standardize to `agent-domain-name.md` |
| Policies | `*.md` in `policies/` | Add date stamps to all |

---

## Part 3: Platform Integration Strategy

### 3.1 Claude Code (.claude/) Integration

#### Current State
```
.claude/
├── skills/bmad-ext-bridge/    ✅ MASTER BRIDGE (working)
├── hooks/session-start.yaml    ✅ Active (loads BMAD config)
├── commands/bmad-ext/          ⚠️ YAML exists, not wired
└── agents/                     ⚠️ Some orphaned
```

#### Integration Plan

**Priority 1: Wire up existing commands**
1. Create command handlers in `.claude/commands/` for:
   - `/audit:ui` → Runs UI violation scan
   - `/audit:dead` → Runs Knip dead code check
   - `/bmad:status` → Shows workflow status
   - `/bmad:delegate` → Delegates to enhanced agents

2. Map each command to its corresponding skill:
   ```yaml
   commands:
     audit:ui:
       skill: ui-layout-contract
       action: scan
     audit:dead:
       shell: npx knip --no-exit-code
   ```

**Priority 2: Hook Enhancement**
1. `session-start.yaml`: Already loads BMAD config ✅
2. Add `pre-work.yaml`: Validates story state before work
3. Add `post-work.yaml`: Updates LOOP_STATE after completion

**Priority 3: Agent Integration**
1. Clean up orphaned agents in `.claude/agents/`
2. Ensure each agent has a corresponding BMAD module
3. Implement activation pattern: `LOAD → READ → EXECUTE → FOLLOW`

#### Claude Code Platform Mechanics
- **Skills** = Primary integration layer
- **Commands** = User-facing triggers
- **Hooks** = Automated governance
- **Agents** = Specialized personas

### 3.2 OpenCode (.opencode/) Integration

#### Current State
```
.opencode/
├── skill/bmad-core-integration/  ⚠️ Partial
├── scripts/governance-*.sh        ✅ Active
├── instructions/bmad-ext-*.md     ✅ Documentation exists
└── config/integrations.json       ⚠️ Needs updates
```

#### Integration Plan

**Priority 1: Complete bmad-core-integration skill**
1. Map all `_bmad-ext/modules/` to skill invocations
2. Implement hop-reading for performance
3. Add reference patterns (80% token reduction)

**Priority 2: Script Enhancement**
1. Extend `governance-check.sh` to include:
   - Module validation
   - Agent availability check
   - Registry synchronization
2. Add `team-coordination-check.sh` for Team A/B handoffs

**Priority 3: Config Updates**
1. Update `config/integrations.json` with:
   - All module routes
   - Team assignments
   - Escalation paths

#### OpenCode Platform Mechanics
- **Skills** = Modular capabilities
- **Scripts** = Automation layer
- **Config** = Routing and integration
- **Hooks** = File monitoring

### 3.3 Cross-Platform Synchronization

#### Shared State Management

Both platforms must share:
1. `_bmad-output/state/ARTIFACT_REGISTRY.yaml` (canonical)
2. `_bmad-ext/state/LOOP_STATE.yaml` (session state)
3. `CLAUDE.md` (governance rules)

#### Synchronization Mechanism

```yaml
sync_strategy:
  source_of_truth: _bmad-output/state/
  consumers:
    - .claude/
    - .opencode/
  method: read-only reference
  conflict_resolution: platform_overwrites_local
```

---

## Part 4: Team A/Team B Coordination Enhancement

### 4.1 Current Coordination Flow

```
Master Orchestrator
    ↓
Sprint-Planning Wrapper (cohesion check, dependency map)
    ↓
Enhanced Agent Selection (Team A or Team B)
    ↓
Handoff Artifact (UUID, context summary, acceptance criteria)
    ↓
Work Execution
    ↓
Callback (validation results, governance updates)
```

### 4.2 Coordination Gaps Identified

| Gap | Impact | Solution |
|-----|--------|----------|
| No cross-team standing sync | Hidden dependencies | Weekly coordination artifact |
| Limited cross-team visibility | Duplicate work | Shared status dashboard |
| No peer review between teams | Quality variance | Cross-team code review gate |
| Single orchestrator bottleneck | No failover | Backup orchestrator definition |

### 4.3 Enhanced Coordination Protocol

#### New Workflow: Cross-Team Coordination

```
┌─────────────────────────────────────────────────────────────┐
│                    SPRINT PLANNING                          │
│  1. Generate sprint status (both teams)                   │
│  2. Cross-team dependency mapping                          │
│  3. Identify critical path                                 │
│  4. Create handoff artifacts for each dependency           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              TEAM A EXECUTION (Identity & Routing)          │
│  1. Receive stories from Sprint Planner                   │
│  2. Execute Platform Contract work                        │
│  3. Create handoff artifact for Team B                     │
│  4. Update governance docs                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              TEAM B EXECUTION (Storage Contract)             │
│  1. Receive handoff from Team A                            │
│  2. Execute FSA/IDB adapter work                           │
│  3. Validate storage integration                           │
│  4. Update governance docs                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    INTEGRATION TESTING                       │
│  1. Cross-team E2E validation                              │
│  2. Performance benchmarks                                 │
│  3. User acceptance testing                                 │
│  4. Retro → Governance updates                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Platform-Specific Team Workflows

#### Claude Code: Team A (Identity & Routing)
```yaml
team_a_workflow:
  platform: claude-code
  skills:
    - frontend-accessibility
    - frontend-responsive
    - global-validation
  triggers:
    - story starts with "UX-" or "ROUTE-"
  gates:
    - UX Gate (user journey validation)
    - Mobile responsive check
```

#### OpenCode: Team B (Storage Contract)
```yaml
team_b_workflow:
  platform: opencode
  skills:
    - backend-api
    - backend-models
    - backend-queries
  triggers:
    - story starts with "FS-" or "STORAGE-"
  gates:
    - Brain Gate (agent tool spec)
    - Visual Gate (reality check)
```

---

## Part 5: Governance Loops & Cycles

### 5.1 Cycle Hierarchy (Cycles Within Cycles)

```
┌────────────────────────────────────────────────────────────┐
│                    EPIC LEVEL (Top)                         │
│  Sprint Planning Cycle → Generates story backlog           │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                    STORY LEVEL (Middle)                     │
│  Story Development Cycle (8 steps with internal loops)    │
│  ├─ Step Validation Loops (↺ on failure)                │
│  ├─ Audit Checkpoints (steps 2,4,7,8)                    │
│  └─ Course Correction Handler (if stuck)                  │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                    SYSTEM LEVEL (Bottom)                    │
│  ASGL Main Loop (orchestrates all stories)                │
│  ├─ Story Routing                                         │
│  ├─ Module Execution                                      │
│  └─ Governance Updates (every 3-5 stories)                │
└────────────────────────────────────────────────────────────┘
```

### 5.2 Feedback Loops

| Loop | Source | Target | Frequency |
|------|--------|--------|-----------|
| Story → Sprint | Story completion | Sprint status | Per story |
| Quality → Dev | Audit findings | Remediation | Per checkpoint |
| Governance → Workflow | Constitution update | All workflows | Per change |
| Module → ASGL | Completion report | State update | Per module |

### 5.3 Gatekeeping Points

```
ENTRY GATES                    EXIT GATES
┌────────────────┐            ┌────────────────┐
│ Platform Check │ ───────────→ │  Type Check    │
│ Project Exists │             │  Lint Check    │
└────────────────┘            └────────────────┘
        ↓                              ↓
┌────────────────┐            ┌────────────────┐
│ Story Validate │ ───────────→ │  Code Review   │
│ Context Fresh │             │  Test Pass     │
└────────────────┘            └────────────────┘
```

---

## Part 6: Execution Plan

### Phase 1: Critical Cleanup (Day 1)
- [ ] C1: Rename Agent-RAG scanners
- [ ] C2: Delete obsolete routing files
- [ ] C3: Delete orphaned files
- [ ] C4: Merge artifact registries
- [ ] C5: Archive stale research

### Phase 2: Module Consolidation (Day 2-3)
- [ ] M1: Merge quality scanners into governance
- [ ] M2: Migrate commands to platform-specific locations
- [ ] M3: Consolidate CONSOLIDATED-BMAD-MODULE into workflows
- [ ] M4: Standardize naming conventions

### Phase 3: Platform Integration (Day 4-5)
- [ ] P1: Wire up Claude Code commands
- [ ] P2: Enhance OpenCode scripts
- [ ] P3: Implement cross-platform state sync
- [ ] P4: Create team coordination skills

### Phase 4: Validation & Testing (Day 6)
- [ ] V1: Test all command triggers
- [ ] V2: Validate handoff protocol
- [ ] V3: Run end-to-end story cycle
- [ ] V4: Document and finalize

---

## Part 7: Success Criteria

| Criterion | Measure | Target |
|-----------|----------|--------|
| No duplicate filenames | Grep scan results | 0 duplicates |
| Artifact registry populated | Entry count | >50 entries |
| Commands functional | Test run success | 100% pass |
| Team handoffs working | Handoff artifacts created | 100% of dependencies |
| Platform sync working | State file matches | Exact match |

---

## Part 8: Rollback Plan

If any phase fails:
1. Stop immediately
2. Document failure in `_bmad-output/rollback/`
3. Restore from git stash
4. Analyze failure root cause
5. Revise plan before retry

---

## Appendix A: File Change Inventory

### Files to Rename (3)
- `_bmad-ext/modules/governance/scanners/agent-rag-scanner.md` → `agent-cluster-governance-scanner.md`
- `_bmad/modules/quality/scanners/agent-rag-scanner.md` → `agent-permissions-scanner.md`

### Files to Delete (8)
- `_bmad/modules/MODULE-ROUTING.yaml`
- `kilo_code_task_jan-14-2026_5-43-43-pm.md`
- `_bmad-output/documentation/bmad-ext/` (directory)
- `_bmad-output/handoffs/bmad-ext-session/` (directory)
- `_bmad-output/testing/e2e-test-plan-notes-blocks-2026-01-14.md`
- `.opencode/node_modules/` (directory)
- `.claude/skills/.archive/` (directory)
- All research files from 2026-01-07 through 2026-01-11

### Files to Modify (15)
- `_bmad-output/state/ARTIFACT_REGISTRY.yaml` (merge from _bmad-ext)
- `.claude/hooks/session-start.yaml` (enhance)
- `.claude/commands/bmad-ext/*.yaml` (wire up)
- `.opencode/config/integrations.json` (update)
- All module MODULE.md files (standardize naming)
- CLAUDE.md (update with new structure)
- AGENTS.md (update with new agents)

### Files to Create (10)
- `.claude/commands/audit.yaml`
- `.claude/commands/bmad-status.yaml`
- `.claude/hooks/pre-work.yaml`
- `.claude/hooks/post-work.yaml`
- `.opencode/scripts/team-coordination-check.sh`
- `.opencode/skills/team-a-workflow/`
- `.opencode/skills/team-b-workflow/`
- `_bmad-ext/modules/platform-integration/MODULE.md`
- `_bmad-output/state/PLATFORM-SYNC.yaml`
- Team coordination dashboard template

---

**End of Master Plan**

Next Step: Await approval, then execute Phase 1.
