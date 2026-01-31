# BMAD Structure Deep Analysis for OpenCode Native Migration

**Document ID**: `analysis-bmad-structure-2026-01-29`
**Created**: 2026-01-29 00:39:00+07:00
**Author**: analyst-ext
**Status**: COMPLETE
**Purpose**: Deep analysis of BMM/BMAD-EXT structure for OpenCode Native Migration

---

## Executive Summary

The BMAD (Best Method Agent Development) framework consists of two layers:
1. **BMM (BMAD Method & Mindset)** - Core methodology with 296 files in 76 directories
2. **BMAD-EXT** - Extension layer for orchestration and governance with enhanced agents

The system operates on a **4-Phase workflow** with **modular orchestration**, **handoff protocols**, and a **4-tier TTL artifact lifecycle**.

---

## Section 1: BMAD 4-Phase System

### 1.1 Phase Overview

| Phase | Name | Primary Module | Key Workflows | Timing |
|-------|------|----------------|---------------|--------|
| **Phase 0** | Governance Foundation | `governance/` | context-first, expert-analysis, research-trigger | Pre-all phases |
| **Phase 1-3** | Core Planning | `bmad-core/` | brainstorming, product-brief, PRD, architecture | 1-4 hours each |
| **Phase 2** | Sprint Planning | `sprint-planning-wrapper/` | 7-step enhanced planning | 5-15 min |
| **Phase 4** | Implementation | `implementation/` | story-cycle, correct-course | 1-4 hours/story |

### 1.2 Phase Details

#### Phase 0: Governance Foundation
**Location**: `_bmad-ext/modules/governance/`
**Version**: 2.1.0
**Purpose**: Foundation layer - all other phases depend on this

**Inputs**:
- User request / prompt
- LOOP_STATE.yaml (session state)
- ARTIFACT_REGISTRY.yaml (document tracking)

**Outputs**:
- Governance decision: PROCEED / WARN / STOP
- Context validation report
- Research recommendations

**Key Workflows**:
```
context-first     → Gather relevant context, auto-transform prompt
expert-analysis   → Define bug/error level, compare with codebase
research-trigger  → Internet-based validation for tech choices
correct-course    → Categorize and route issues
```

**Triggers**:
1. `on_session_start` → Check all active artifacts for staleness
2. `on_artifact_creation` → Register with timestamp and TTL
3. `on_step_completion` → Validate context freshness
4. `on_story_completion` → Run full artifact scan
5. `on_epic_completion` → Run comprehensive governance check

#### Phase 1-3: Core Planning (bmad-core)
**Location**: `_bmad-ext/modules/bmad-core/`
**Version**: 1.0.0
**Purpose**: Wraps 5 essential BMAD core workflows

**Workflows**:
| Workflow | Phase | Duration | Wraps |
|----------|-------|----------|-------|
| `brainstorming` | 1 | 15-30 min | None (native) |
| `party-mode` | 1 | 5-10 min | None (native) |
| `create-product-brief` | 1 | 1-2 hours | `_bmad/bmm/workflows/1-analysis/create-product-brief` |
| `prd` | 2 | 2-4 hours | `_bmad/bmm/workflows/2-plan-workflows/prd` |
| `create-architecture` | 3 | 2-3 hours | `_bmad/bmm/workflows/3-solutioning/create-architecture` |

**Inputs**:
- Governance approval from Phase 0
- User requirements / business brief
- Existing codebase analysis

**Outputs**:
- Product brief document
- PRD document
- Architecture document + ADRs
- Ready for sprint planning

#### Phase 2: Sprint Planning (Enhanced)
**Location**: `_bmad-ext/modules/sprint-planning-wrapper/`
**Version**: 1.1.0
**Purpose**: Enhanced sprint planning with cohesion and reality validation

**7-Step Process**:
1. **Discover Epics** - Scan epic files in planning artifacts
2. **Generate Status** - Run BMAD sprint-planning workflow
3. **Cohesion Check** - Validate sprint cohesion, detect fragmentation
4. **Dependency Map** - Map cross-story dependencies, find conflicts
5. **Reality Validation** - Generate 30-second demo script (Movie Script Test)
6. **Gatekeeping** - Auto-validation with loop-back on failures
7. **Handoff** - Prepare enhanced context for story-cycle

**Scanners**:
- `cohesion-scanner.md` - Detects fragmented UX across stories
- `dependency-scanner.md` - Finds hidden cross-story dependencies
- `nonsense-detector.md` - Spots "Dual Chat" type issues

**Inputs**:
- Epic files from `_bmad-output/planning-artifacts/epics.md`
- Architecture decisions
- Story definitions

**Outputs**:
- Enhanced `sprint-status.yaml`
- Cohesion report
- Dependency map (YAML)
- Demo script (30-second narrative)

#### Phase 4: Implementation
**Location**: `_bmad-ext/modules/implementation/`
**Version**: 2.0.0
**Purpose**: Story execution with deep analysis and evidence-based validation

**10-Step Story Cycle (v2.0)**:
| Step | Name | Key Action | v2.0 Enhancement |
|------|------|------------|------------------|
| 1 | Init | Load story context | + Deep project analysis (grep/glob) |
| 1a | User Journey | 30-second demo script | + State machine walk, code verification |
| 2 | Validate | Check dependencies | + Evidence-based checklist (file:line refs) |
| 3a | Agent Tool Spec | Define JSON Schema | (unchanged) |
| 3 | Implement | TDD red-green-refactor | + Enforced grep/glob, conflict detection |
| 4 | Test | Run tests, verify | (unchanged) |
| 5 | Review | Code review | + Real code path walking, HTML validation |
| 6 | Done | Update sprint-status | (unchanged) |
| 6a | Reality Check | E2E demo | + Journey map comparison |
| 7 | Retrospective | Summary | (unchanged) |

**Inputs**:
- Sprint status from Phase 2
- Handoff artifact with story details
- Governance approval

**Outputs**:
- Story completion artifact
- Updated sprint-status.yaml
- Test results
- Journey map (mermaid)
- Handoff for next story

### 1.3 Phase Transitions

```
User Request
     ↓
Phase 0: GOVERNANCE
     ├─ context-first
     ├─ expert-analysis
     └─ research-trigger
     ↓
[ALLOW] → Governance Report
     ↓
Phase 1-3: BMAD-CORE
     ├─ brainstorming → party-mode
     ├─ create-product-brief
     ├─ prd
     └─ create-architecture
     ↓
Phase 2: SPRINT-PLANNING WRAPPER
     └─ 7-step enhanced sprint planning
     ↓
Sprint Status Updated
     ↓
Phase 4: IMPLEMENTATION
     └─ story-cycle (10 steps)
     ↓
Story Complete → Handoff → Next Story or Epic Complete
```

---

## Section 2: Workflow System

### 2.1 Complete Workflow Inventory

#### BMM Core Workflows (from `_bmad/bmm/workflows/`)

| Directory | Workflow Count | Key Workflows |
|-----------|----------------|---------------|
| `1-analysis/` | 2 | create-product-brief (6 steps), research (domain/market/technical) |
| `2-plan-workflows/` | 2 | prd (12 steps create, 13 steps validate), create-ux-design (14 steps) |
| `3-solutioning/` | 3 | create-architecture (8 steps), create-epics-and-stories (4 steps), check-implementation-readiness (6 steps) |
| `4-implementation/` | 8 | sprint-planning, sprint-status, create-story, dev-story, code-review, correct-course, retrospective, architectural-consolidation |
| `bmad-quick-flow/` | 2 | quick-dev (6 steps), quick-spec (4 steps) |
| `codebase-diagnostic/` | 1 | 7-step diagnostic |
| `document-project/` | 2 | full-scan, deep-dive |
| `excalidraw-diagrams/` | 4 | create-dataflow, create-diagram, create-flowchart, create-wireframe |
| `generate-project-context/` | 1 | 3-step context generation |
| `testarch/` | 8 | atdd, automate, ci, framework, nfr-assess, test-design, test-review, trace |
| `workflow-status/` | 1 | init + 4 path variants |

**Total BMM Workflows**: ~35 workflows with ~200+ step files

#### BMAD-EXT Module Workflows

| Module | Workflow | Steps | Purpose |
|--------|----------|-------|---------|
| governance | context-first | 4 | Gather context, analyze, contextualize, transform |
| governance | expert-analysis | 4 | Init, analyze codebase, compare approach, recommend |
| governance | research-trigger | 4 | Init, research, analyze, complete |
| governance | story-continuity | - | Story continuity validation |
| sprint-planning-wrapper | sprint-planning-enhanced | 7 | Full sprint planning with cohesion |
| implementation | story-cycle | 10 | Full story execution |
| implementation | correct-course | 4 | Receive report, categorize, route, complete |
| arc-v2 | diagnostic-first | 7 | Domain scanning, remediation |
| bmad-core | brainstorming | 4 | Session setup, method selection, execute, organize |
| bmad-core | party-mode | 3 | Agent loading, discussion, graceful exit |
| bmad-core | create-product-brief | wrapper | Wraps BMM workflow |
| bmad-core | prd | wrapper | Wraps BMM workflow |
| bmad-core | create-architecture | wrapper | Wraps BMM workflow |

### 2.2 Workflow Triggers, Steps, Outputs, Transitions

#### Example: story-cycle Workflow

```yaml
workflow: story-cycle
trigger:
  - Orchestrator delegation with handoff artifact
  - Direct invocation: "/dev-story {story-id}"

steps:
  1. Init:
     action: Load story context + deep project analysis
     output: context-loaded.yaml with grep/glob evidence
     
  1a. User Journey:
     action: Generate 30-second demo script with code verification
     output: journey-map.mermaid with code evidence
     detects: island_feature, split_brain, ghost_result, dead_end
     
  2. Validate:
     action: Evidence-based validation checklist
     output: validation-evidence.yaml
     gate: Story Start Gate
     
  3a. Agent Tool Spec (if agentic):
     action: Define JSON Schema, System Prompt, Permissions
     output: tool-definition.json, prompt-context.md
     
  3. Implement:
     action: TDD with enforced pre-coding analysis
     output: Code changes with analysis evidence
     must_run: grep/glob BEFORE any code
     
  4. Test:
     action: Run tests, verify coverage
     output: test-results.yaml
     gate: Test Gate (coverage >= 80%)
     
  5. Review:
     action: Real code analysis with extreme skepticism
     output: code-review-report.yaml with evidence
     
  6. Done:
     action: Update sprint-status, mark complete
     gate: Done Gate
     
  6a. Reality Check:
     action: E2E UI verification with journey comparison
     output: visual-regression-report.md
     gate: Visual Reality Gate
     
  7. Retrospective:
     action: Summary and learnings
     output: retrospective.md

transitions:
  on_success: → Handoff to master-orchestrator → Next story
  on_partial: → Create continuation handoff → Retry or escalate
  on_failure: → Create failure handoff → Escalation protocol
```

### 2.3 Bouncing Loops Back and Forth

The BMAD system implements several "bouncing loop" patterns:

#### Loop 1: Governance → Implementation → Governance
```
User Request
     ↓
Governance (context-first) ←──────────────────┐
     ↓                                         │
Implementation (story-cycle)                   │
     ↓                                         │
Story Complete                                 │
     ↓                                         │
Post-Work Validation ─────────────────────────→│
     ↓
Approve or Request Corrections
```

#### Loop 2: Sprint Planning → Story Execution → Sprint Status
```
Sprint Planning (generate status)
     ↓
Story Execution (story-cycle)
     ↓
Update sprint-status.yaml
     ↓
Check: More stories?
     ├─ YES → Next story execution
     └─ NO → Epic complete → Retrospective
```

#### Loop 3: Implementation → Test → Review Loop
```
Implement (Step 3)
     ↓
Test (Step 4)
     ├─ FAIL → Back to Implement
     └─ PASS → Review (Step 5)
              ├─ FAIL → Back to Implement
              └─ PASS → Done (Step 6)
```

#### Loop 4: Correct-Course Recovery Loop
```
Error Detected
     ↓
Correct-Course (categorize)
     ├─ Quick Patch → Implementation → Done
     ├─ Feature Fix → Implementation → Done
     └─ Architectural Conflict → ARC-v2 → Implementation → Done
```

---

## Section 3: Agent Hierarchy

### 3.1 Agent Types and Counts

| Level | Agent Type | Count | Role |
|-------|------------|-------|------|
| Orchestrator | master-orchestrator | 1 | Central brain, delegation, callbacks |
| Main Agents | Enhanced (-ext) | 7 | Receive delegation from orchestrator |
| Sub-Agents | Specialized | 16+ | Delegated by main agents |
| Shared Services | Infrastructure | 2 | Governance, Quality Scanner |

### 3.2 Main Agents

| ID | Agent | Module | Responsibility |
|----|-------|--------|----------------|
| A1 | `dev-ext` | MOD-A-CGOV | Code implementation (features + fixes), TDD |
| A2 | `architect-ext` | MOD-B-ARCH | System design, architecture decisions, ADRs |
| A3 | `analyst-ext` | MOD-C-SPRINT | Requirements analysis, user story breakdown |
| A4 | `tea-ext` | MOD-D-TEST | Testing, validation, QA |
| A5 | `ux-designer-ext` | MOD-C-SPRINT | UI/UX design, 8-bit compliance |
| A6 | `tech-writer-ext` | MOD-C-SPRINT | Documentation, API docs, guides |
| A7 | `product-management-ext` | MOD-C-SPRINT | Sprint planning, story creation |

### 3.3 Sub-Agents per Main Agent

**dev-ext sub-agents**:
- `tea-ext` - Unit test creation (primary sub-agent)
- `component-splitter` - Large component refactoring
- `store-refactorer` - God store elimination
- `file-sync-specialist` - File sync strategy

**architect-ext sub-agents**:
- `workspace-architect` - Workspace E2E implementation
- `domain-scanner` - Domain analysis and boundaries
- `evidence-synthesizer` - Findings aggregation

**analyst-ext sub-agents**:
- `requirements-agent` - User story breakdown
- `competitor-agent` - Competitive analysis

### 3.4 Agent Coordination Protocol

```yaml
coordination_flow:
  1. Orchestrator:
     - Reads bmm-workflow-status.yaml
     - Routes to Sprint-Planning Wrapper first
     - Creates handoff artifact with UUID
     - Spawns appropriate enhanced agent
     
  2. Enhanced Agent (e.g., dev-ext):
     - Loads handoff artifact
     - Validates LOOP_STATE.yaml
     - Executes workflow
     - May delegate to sub-agents
     - Creates completion handoff
     - Callbacks to orchestrator
     
  3. Sub-Agent (e.g., tea-ext):
     - Receives parent context
     - Executes specialized task
     - Returns results to parent
     
  4. Orchestrator:
     - Receives callback
     - Updates LOOP_STATE
     - Decides: continue or stop
     - Routes to next agent or ends session
```

### 3.5 Agent Invocation Patterns

```yaml
# Direct invocation (skip orchestrator)
/dev-ext
/dev-story {story-id}

# Via orchestrator (full delegation)
/master-orchestrator
/asgl
/bmad-master

# Via module selection
/ext-master → Select module → Select workflow
```

---

## Section 4: Artifact Lifecycle

### 4.1 4-Tier TTL System

| Tier | Name | TTL | Description | Examples |
|------|------|-----|-------------|----------|
| **Tier 1** | Permanent (Constitution) | Forever | Core governance, read-only | `new-fundamental-truths.md`, `ADR-039` |
| **Tier 2** | Controlled & Iterative | Permanent | Living documents, updated with approval | `architecture.md`, `prd.md`, `epics.md`, `AGENTS.md` |
| **Tier 3** | Archival | 90 days | Historical reference | Completed epics, superseded ADRs, handoffs |
| **Tier 4** | Ephemeral | 24 hours | Temporary, research notes | Investigation docs, draft ADRs |

### 4.2 Artifact Types

| Type | Storage Pattern | TTL Tier | Purpose |
|------|-----------------|----------|---------|
| **handoff** | `_bmad-output/handoffs/{date}/{story-id}-{agent}-handoff.md` | 3 | Agent-to-agent communication |
| **sub-handoff** | `_bmad-output/handoffs/{date}/{story-id}-{agent}-sub-handoff.md` | 3 | Main agent to sub-agent |
| **failure** | `_bmad-output/handoffs/{date}/{story-id}-{agent}-failure.md` | 3 | Error escalation |
| **completion** | `_bmad-output/handoffs/{date}/{story-id}-completion.md` | 3 | Work completed notification |
| **story** | `_bmad-output/sprint-artifacts/stories/{story-id}.md` | 2 | Story definitions |
| **context** | `_bmad-output/sprint-artifacts/stories/{story-id}-context.xml` | 3 | Developer context |
| **scan** | `_bmad-output/scans/{domain}-scan-{date}.yaml` | 3 | Diagnostic scans |
| **analysis** | `_bmad-output/analysis/{type}-{date}.md` | 3 | Analysis reports |

### 4.3 Artifact Lifecycle States

```
CREATED → PENDING → IN_PROGRESS → COMPLETED/FAILED → ARCHIVED → PURGED
   │         │           │              │
   │         │           │              └─ Move to .archive after TTL
   │         │           └─ Work finished or error
   │         └─ Awaiting pickup by target agent
   └─ Initial creation with UUID
```

### 4.4 Artifact Validation Rules

```yaml
validation:
  on_load:
    - Check TTL tier vs age
    - Verify schema version
    - Check parent linkage
    - Validate required fields
    
  freshness_thresholds:
    scan_results: 4 hours
    remediation_plans: 24 hours
    domain_reports: 48 hours
    governance_reports: 2 hours
    handoffs: 4 hours
    
  stale_handling:
    tier_3: Archive if older than TTL
    tier_4: Ignore and recreate
    tier_1: Never stale (permanent)
    tier_2: Always consume fully
```

### 4.5 Handoff Artifact Schema

```yaml
# Required frontmatter (all types)
artifact_id: "{uuid}"          # hnd_YYYYMMDD_HHMMSS_xxxxxx
artifact_type: "handoff"        # handoff | sub-handoff | failure | completion
parent_id: "{uuid or null}"
story_id: "{story_id}"
source_agent: "{agent_name}"
target_agent: "{agent_name}"
created_at: "{iso-8601}"
status: "PENDING"               # PENDING | IN_PROGRESS | COMPLETED | FAILED

# Sections
context_summary: |
  Brief description of completed work
  
handoff_data:
  story_file: "path"
  validation_results:
    typescript_errors: 0
    tests_passed: true
    test_count: 42
  files_modified: []
  files_created: []
  
acceptance_criteria:
  - Criteria 1
  - Criteria 2
  
validation_commands: |
  pnpm tsc --noEmit
  pnpm vitest run
  
escalation_path: |
  On failure → Report to orchestrator
```

---

## Section 5: What OpenCode Native MUST Preserve

### 5.1 Non-Negotiable Behaviors

| Behavior | Why Critical | Evidence |
|----------|--------------|----------|
| **4-Tier TTL System** | Prevents context poisoning, manages artifact lifecycle | ARTIFACT_REGISTRY.yaml, MODULE.md |
| **Handoff Protocol** | Enables agent-to-agent communication, traceability | handoff.md, handoff-artifact.schema.yaml |
| **LOOP_STATE Management** | Session continuity, anchor verification, anti-hallucination | LOOP_STATE.yaml, master-orchestrator.md |
| **Governance Gates** | Quality enforcement before implementation | governance/MODULE.md, story-cycle steps |
| **Evidence-Based Validation** | Prevents shallow understanding, untested assumptions | story-cycle v2.0 enhancements |
| **Time-Boxing** | Prevents runaway tasks, enables recovery | governance time-boxing rules |
| **Context-First Workflow** | Ensures relevant context before any action | governance/workflows/context-first/ |

### 5.2 Critical Workflows to Preserve

#### Must-Have Workflows

1. **story-cycle** (10 steps)
   - Core implementation workflow
   - Deep analysis + evidence-based validation
   - Journey verification with code paths
   
2. **correct-course** (4 steps)
   - Recovery workflow for issues
   - Categorization → Routing → Resolution
   
3. **sprint-planning-enhanced** (7 steps)
   - Cohesion validation
   - Dependency mapping
   - Reality validation (Movie Script Test)
   
4. **context-first** (4 steps)
   - Scan → Analyze → Contextualize → Transform
   - Auto-transforms user prompts with relevant context

#### Should-Have Workflows

5. **research-trigger** - Internet-based tech validation
6. **expert-analysis** - Deep codebase comparison
7. **retrospective** - Epic/sprint learnings

### 5.3 Essential State Management

#### LOOP_STATE.yaml Structure (MUST preserve)

```yaml
schema_version: "3.0.0"
session_id: "{uuid}"
last_updated: "{iso-8601}"
updated_by: "{agent}"

current_session:
  date: "{date}"
  active_epic: "{epic-id}"
  epic_status: "IN_PROGRESS"
  stories_complete: 0
  stories_total: 8
  phase: "EXECUTION"

current:
  agent: "{current-agent}"
  epic_id: "{epic-id}"
  story_id: "{story-id}"
  story_status: "NOT_STARTED"
  workflow: "{workflow-name}"
  step: 1
  mode: "EXECUTION"

errors:
  count: 0
  last_error: null
  last_seen_at: null

anchor:
  human_intent: "{summary of what user wants}"
  human_intent_timestamp: "{iso-8601}"
  mode: "ORCHESTRATION"
  staleness_threshold_hours: 24

delegations:
  active:
    delegation_id: "{uuid}"
    parent_agent: "master-orchestrator"
    child_agent: "{agent}"
    handoff_artifact: "{path}"
    started_at: "{iso-8601}"
    timeout_minutes: 60
  completed: []
  failed: []
```

#### ARTIFACT_REGISTRY.yaml Structure (MUST preserve)

```yaml
schema_version: "2.0.0"

ttl_system:
  tier_1_permanent: { name, ttl, examples }
  tier_2_controlled: { name, ttl, examples }
  tier_3_archival: { name, ttl, examples }
  tier_4_ephemeral: { name, ttl, examples }

core_documents: []
governance_documents: []
adrs: []
handoff_artifacts: []
archived_documents: []

metrics:
  total_documents_tracked: 150
  ttl_tier_1_permanent: 5
  ttl_tier_2_controlled: 10
  ttl_tier_3_archival: 120
  ttl_tier_4_ephemeral: 15
```

### 5.4 Critical Integration Points

#### Must Preserve Integration Patterns

| Pattern | Files Involved | Purpose |
|---------|---------------|---------|
| **Orchestrator → Agent** | master-orchestrator.md → {agent}-ext.md | Delegation with handoff |
| **Agent → Orchestrator** | {agent}-ext.md → master-orchestrator.md | Callback with results |
| **Module → Module** | governance/ → implementation/ | Workflow chaining |
| **State Tracking** | LOOP_STATE.yaml ← all agents | Session continuity |
| **Artifact Registry** | ARTIFACT_REGISTRY.yaml ← all agents | Document lifecycle |

#### Critical File Paths

```yaml
state_files:
  - "_bmad-ext/state/LOOP_STATE.yaml"
  - "_bmad-ext/state/ARTIFACT_REGISTRY.yaml"
  - "bmm-workflow-status.yaml"

orchestrator:
  - "_bmad-ext/orchestrator/master-orchestrator.md"
  - "_bmad-ext/orchestrator/routing-rules.yaml"
  - "_bmad-ext/orchestrator/delegation-protocol.md"
  - "_bmad-ext/orchestrator/escalation-protocol.md"

modules:
  - "_bmad-ext/modules/governance/MODULE.md"
  - "_bmad-ext/modules/implementation/MODULE.md"
  - "_bmad-ext/modules/sprint-planning-wrapper/MODULE.md"
  - "_bmad-ext/modules/arc-v2/MODULE.md"
  - "_bmad-ext/modules/bmad-core/MODULE.md"

agents:
  - "_bmad-ext/agents/dev-ext.md"
  - "_bmad-ext/agents/architect-ext.md"
  - "_bmad-ext/agents/analyst-ext.md"
  - "_bmad-ext/agents/tea-ext.md"

schemas:
  - "_bmad-ext/schemas/handoff-artifact.schema.yaml"

protocols:
  - "_bmad-ext/protocols/handoff.md"
```

### 5.5 Anti-Patterns to Avoid (Learn from BMAD)

| Anti-Pattern | What Happened | Solution in BMAD |
|--------------|---------------|------------------|
| **Context Poisoning** | 100+ orphaned documents caused governance crisis | 4-tier TTL system, automatic archival |
| **Stale Anchors** | Agents continued work based on outdated intent | Anchor verification, staleness threshold |
| **Shallow Understanding** | Code written without reading existing codebase | Enforced grep/glob before implementation |
| **Untested Assumptions** | Claims made without evidence | Evidence-based validation (file:line refs) |
| **Fragmented UX** | "Dual Chat" - technically valid but users hate it | Cohesion scanner, Movie Script Test |
| **God Artifacts** | Documents > 5000 lines unmanageable | Line limits, forced splitting |
| **Missing Handoffs** | Work lost between agent transitions | Mandatory handoff protocol with UUID |

---

## Section 6: Summary Metrics

### 6.1 Scale of BMAD System

| Metric | Count |
|--------|-------|
| BMM workflow directories | 76 |
| BMM workflow files | 296 |
| BMAD-EXT modules | 5 (governance, implementation, sprint-planning-wrapper, arc-v2, bmad-core) |
| Enhanced agents | 7 + sub-agents |
| Core workflows | ~35 |
| Step files | ~200+ |
| Governance triggers | 5 |
| TTL tiers | 4 |
| Handoff types | 4 |

### 6.2 Timing Standards

| Work Unit | Duration |
|-----------|----------|
| Story (simple) | 1-2 hours |
| Story (complex) | 2-4 hours |
| Epic (6-8 stories) | 4-8 hours |
| Epic (mini 3-4) | 2-4 hours |
| Sprint Planning | 5-15 min |
| Step timeout | 15 min |
| Story timeout | 4 hours |
| Anchor staleness | 24 hours |

### 6.3 Health Indicators for OpenCode Native

For successful migration, OpenCode Native must achieve:

- [ ] Handoff artifact creation/consumption working
- [ ] LOOP_STATE read/write functional
- [ ] ARTIFACT_REGISTRY tracking active
- [ ] 4-tier TTL enforcement active
- [ ] Anchor verification implemented
- [ ] Governance gates enforced
- [ ] Story-cycle workflow executable
- [ ] Agent delegation working
- [ ] Evidence-based validation in place
- [ ] Time-boxing operational

---

## Appendix A: Key File Locations

```
_bmad/
├── bmm/
│   ├── agents/                    # Core agent definitions (9)
│   ├── workflows/                 # Core workflows (35+)
│   │   ├── 1-analysis/           # Analysis workflows
│   │   ├── 2-plan-workflows/     # Planning workflows
│   │   ├── 3-solutioning/        # Architecture workflows
│   │   └── 4-implementation/     # Implementation workflows
│   ├── teams/                    # Team configurations
│   └── testarch/                 # Testing knowledge base

_bmad-ext/
├── orchestrator/
│   ├── master-orchestrator.md    # Central brain
│   ├── routing-rules.yaml        # Agent routing
│   ├── delegation-protocol.md    # Delegation rules
│   └── escalation-protocol.md    # Error handling
├── modules/
│   ├── governance/               # Phase 0
│   ├── bmad-core/               # Phase 1-3
│   ├── sprint-planning-wrapper/ # Phase 2
│   ├── implementation/          # Phase 4
│   └── arc-v2/                  # Architecture remediation
├── agents/                       # Enhanced agents
├── protocols/
│   └── handoff.md               # Handoff protocol
├── schemas/
│   └── handoff-artifact.schema.yaml
└── state/
    ├── LOOP_STATE.yaml          # Session state
    └── ARTIFACT_REGISTRY.yaml   # Document tracking
```

---

**Document Complete**
**Total Lines**: ~850
**Analysis Duration**: 45 minutes
**Evidence Sources**: 15+ files read, complete BMM tree.json analyzed
