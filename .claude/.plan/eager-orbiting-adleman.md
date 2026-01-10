# BMAD Master Plan: Root Cause Remediation & Framework Consolidation

**Session**: BMAD-MASTER-20250106
**Status**: GOVERNANCE FOUNDATION REQUIRED | Deep-scan blocked until governance in place | Ralph Loop: COMPLETE ✅
**Version**: 3.0 (CORRECTED - Root Cause Focus)
**Last Updated**: 2026-01-06 (GOVERNANCE-FIRST APPROACH)

---

## Executive Summary

**CORRECTION**: Previous plan versions contained context poisoning - describing "creation" of workflows that already exist. This corrected plan is based on actual exploration of:

1. **Tier 1 Standards** (`agent-os/standards/global/`) - All 7 files exist with frontmatter, last updated Dec 31, 2025. Need updates for React 19 concurrent features, RSC patterns, testing, accessibility, AI security.

2. **Tier 2 Governance** (AGENTS.md, PRD, Architecture, UX-specs) - **CRITICAL GAP**: No frontmatter, outdated content (last update 2026-01-04), no ownership tracking, no update triggers.

3. **_bmad Modules** - 5 active modules (asgl + orchestration are DUPLICATES), comprehensive agent/workflow coverage already exists.

**Real Work Required**: Update governance documents, not create new workflows.

---

## Part 1: Root Cause Analysis

### Critical Failure Point #1: Synchronization & Persistence

**Root Cause**: The event-driven cross-workspace architecture exists but is incomplete.
- **Finding**: `crossWorkspaceEventBus.ts` exists but has unidirectional gaps
- **Evidence**: State preservation during workspace switches is partial (lines 84-85 save snapshot, but not all state is restored)
- **Architectural Debt**: 69 god stores still exist despite slice pattern adoption

### Critical Failure Point #2: LLM Key Management

**Root Cause**: No centralized key orchestration across the client-side architecture.
- **Finding**: Provider configs stored in IndexedDB but no unified access layer
- **Evidence**: `providerConfigs` table exists in ViaGentDatabase but scattered access patterns
- **Security vs Convenience Trade-off**: Current implementation prioritizes neither

### Critical Failure Point #3: Agent Configuration

**Root Cause**: Agent profiles are workspace-scoped but lack unified bring-over logic.
- **Finding**: `getAgentsForWorkspace(workspaceType)` filtering exists (line 97-98 of transition-manager)
- **Evidence**: Agent reselection logic exists but doesn't preserve configuration similarity
- **Missing**: No "agent config template" system for cross-workspace consistency

### Critical Failure Point #4: Error Handling Without Fallback

**Root Cause**: Error boundaries exist but operate as "fail-fast" rather than "fail-safe."
- **Finding**: ErrorBoundary components exist but limited rollback strategies
- **Evidence**: SyncManager has transaction-based sync but WebContainer failures have limited recovery
- **Mobile Gap**: No mobile-specific error handling (File System Access API limited on mobile)

### Critical Failure Point #5: User Feedback & Control

**Root Cause**: Progress tracking exists but is not exposed to users.
- **Finding**: Sync status tracked internally (syncStatus, lastSyncTimestamp)
- **Evidence**: No pause/stop/cancel UI for long-running operations
- **Missing**: Badge/status component architecture

### Critical Failure Point #6: Localization & Responsiveness

**Root Cause**: i18n infrastructure exists (react-i18next) but implementation is incomplete.
- **Finding**: `t()` function available but hardcoded strings throughout
- **Evidence**: Mobile portrait layouts broken (nested components, stacked panes)
- **Missing**: Responsive breakpoint enforcement in component standards

---

## Part 2: The Three Arts - Governance Strategy

### Art 1: Document & Artifact Governance

**Current State**: 720+ timestamped artifacts, 37 YAML status files, no cleanup
**Target State**: Four-tier artifact lifecycle with automated archiving

#### Tier 1: The Unchangeable (Standards)
```
agent-os/standards/global/
├── coding-style.md          # Lock on read - notify human if outdated
├── commenting.md
├── conventions.md
├── error-handling.md        # TO BE UPDATED - add fallback patterns
├── mcp-research.md
├── tech-stack.md
└── validation.md
```
**Action**: Update error-handling.md to mandate "fail-safe" patterns

#### Tier 2: Strictly Controlled (SSOT)
```
AGENTS.md (root)                     # Single source of truth
_bmad/AGENTS.md                      # Module-specific
agent-os/product/                    # PRD, mission, roadmap
agent-os/standards/                  # Architecture decisions
```
**Update Protocol**: Line-based replacement with frontmatter, never file replacement

#### Tier 3: Archiving (Medium-live)
```
_bmad-output/sprint-artifacts/
├── 2026-01/                         # Monthly folders
│   ├── sprint-status-2026-01-05.yaml
│   └── course-correction-2026-01-03.md
└── archive/                         # Previous months
```
**Retention**: 90 days active, then archive

#### Tier 4: Short-live (Artifacts)
```
_bmad-output/handoffs/
├── 2026-01-06/                      # Daily folders
│   ├── E4-handoff.md                # Reference parent story
│   └── validation-report.md
└── _archive/                        # Auto-archive after 7 days
```
**Naming**: `{story-id}-{artifact-type}-{YYYY-MM-DD}.md`
**Metadata**: Frontmatter with parent_id, sequence_number, expires_at

### Art 2: Tooling & Capabilities

**Current State**: Tools used but no fallback enforcement
**Target State**: Resilient tool usage with circuit-breaker pattern

#### Skill-Enhanced Frontmatter
```yaml
---
skill: "architecture-remediation"
trigger:
  - god_store_detected > 300 lines
  - typescript_errors > threshold
steps:
  - if: research_finds_patterns >= 2
    then: proceed
    else: restart_workflow
fallback:
  - notify_human
  - create_incident_report
---
```

#### Tool Usage with Fallbacks
```yaml
tool: grep
fallback:
  - attempt: ripgrep
  - attempt: git grep
  - attempt: full_file_scan
  - on_all_fail: notify_and_stop
```

### Art 3: Workflow & Module Control

**Current State**: 7 modules, 3 actively used, 4 redundant
**Target State**: 4 consolidated modules governed by epics

#### Module Consolidation Plan

**RETAIN** (Core Modules):
1. **architecture-remediation** → Extend with god-store elimination complete workflow
2. **asgl** → Fix to be template-only (read-only reference)
3. **deep-scan** → Integrate into asgl as diagnostic sub-module

**RETIRE** (Redundant):
4. **light-theme-sprint** → Move content to Epic stories, delete module
5. **cross-workspace-chat** → Move E2 epic to main epics, delete module
6. **gemini-multimodal** → Empty, delete immediately

**CREATE** (Missing):
7. **governance** → New module for artifact lifecycle, status synchronization

---

## Part 3: Execution Plan (Multi-Round Cycles)

### Cycle 1: Foundation - Governance Reset

**Objective**: Eliminate context poisoning, establish single sources of truth

**Commands to Execute**:
```
/bmad-bmb-agents-module-builder
  → Create _bmad/modules/governance/
  → Define artifact lifecycle policies
  → Create status synchronization workflow

/bmad-bmb-agents-workflow-builder
  → Create artifact-cleanup-cycle
  → Create status-sync-validator

/bmad-bmb-workflows-edit-workflow
  → Update asgl/main-loop.md to enforce template-read-only
  → Add governance gates to all workflows

/bmad-bmb-workflows-edit-agent
  → Update all agents to check artifact expiry before reading
  → Add naming convention validation
```

**Deliverables**:
- Single bmm-workflow-status.yaml at project root
- Artifact retention policy (30-day active, 90-day archive)
- Daily artifact folders with auto-archive
- Template lock enforcement

### Cycle 2: Module Consolidation

**Objective**: Reduce from 7 to 4 modules, eliminate redundancy

**Commands to Execute**:
```
/bmad-bmb-agents-module-builder
  → Create migration plan for light-theme-sprint → Epic
  → Create migration plan for cross-workspace-chat → Epic
  → Delete gemini-multimodal (empty)
  → Merge deep-scan into asgl as diagnostic submodule

/bmad-bmb-workflows-edit-workflow
  → Update module-import paths across all agents
  → Create module-deprecation-template
```

**Deliverables**:
- 4 functional modules (architecture-remediation, asgl, governance, workspace)
- Module registry with usage tracking
- Deprecation notices for retired workflows

### Cycle 3: Root Cause Fixes - Synchronization

**Objective**: Complete the cross-workspace event system, add fallbacks

**Commands to Execute**:
```
/bmad-core-agents-bmad-master
  → Execute workspace-file-system-e2e workflow
  → Implement bidirectional event emission
  → Add pause/resume/cancel UI components

/bmad-bmb-workflows-edit-agent
  → Create sync-recovery-agent
  → Implement circuit-breaker pattern for WebContainer
  → Add mobile-specific fallbacks
```

**Deliverables**:
- Complete cross-workspace state synchronization
- Pause/resume/cancel UI for long operations
- Mobile-aware error handling

### Cycle 4: Root Cause Fixes - State & Key Management

**Objective**: Centralize key management, complete god store elimination

**Commands to Execute**:
```
/bmad-core-agents-bmad-master
  → Execute state-consolidation-cycle for remaining 69 god stores
  → Create unified key orchestration layer
  → Implement agent config template system

/bmad-bmb-agents-workflow-builder
  → Create key-migration workflow
  → Create agent-config-synchronization workflow
```

**Deliverables**:
- 0 god stores (complete elimination)
- Centralized key orchestration
- Cross-workspace agent config templates

### Cycle 5: Root Cause Fixes - UX & Localization

**Objective**: Fix mobile layouts, complete i18n implementation

**Commands to Execute**:
```
/bmad-core-agents-bmad-master
  → Execute responsive-audit workflow
  → Create mobile-first component standards
  → Implement i18n enforcement in all components

/bmad-bmb-workflows-edit-agent
  → Create i18n-validator-agent
  → Create responsive-test-agent
```

**Deliverables**:
- All components support VI/EN languages
- Mobile portrait layouts functional
- i18n validation gate in build process

---

## Part 4: Success Criteria

### Governance Metrics
- [ ] Single bmm-workflow-status.yaml (no duplicates)
- [ ] <50 active artifacts (auto-archive older)
- [ ] 4 modules (retired 3, created 1)
- [ ] All agents check artifact expiry before use

### Technical Metrics
- [ ] 0 god stores (current: 69)
- [ ] 0 god components (current: 45)
- [ ] 100% cross-workspace state sync
- [ ] Pause/resume/cancel on all long operations

### UX Metrics
- [ ] 100% i18n coverage (no hardcoded strings)
- [ ] Mobile portrait functional
- [ ] Fallback on all error paths
- [ ] Progress indicators on all async operations

---

## Part 5: User Authorization - DECISIONS RECORDED

### Module Consolidation
✅ **APPROVED**: Retire light-theme-sprint, cross-workspace-chat, gemini-multimodal
- Content migrated to Epic stories
- Consolidate to 4 core modules

### Artifact Retention Policy
✅ **APPROVED**: 5-day active retention (user works daily)
- Artifacts older than 5 days → auto-archive to monthly folders
- Daily archive cycle runs at midnight

### Status File Architecture
✅ **APPROVED**: Parent-child hierarchy with weighted consolidation
- Keep module-specific status files where needed
- Consolidate to root when necessary (weighted by activity)
- Remove stale status files automatically

### Execution Strategy
✅ **APPROVED**: Full autonomous with conditional parallel execution
- Sequential OR parallel isolated context (condition-based)
- Cross-checking between cycles
- Gatekeeping validation at each phase
- Context grasping for robustness and accuracy

---

## Part 6: Revised Execution Plan (User-Approved)

### Cycle 1: Governance Foundation (SEENTIAL - Must Complete First)
**Rationale**: Must eliminate context poisoning before other cycles can operate reliably

**Parallel Sub-Workflows** (isolated context):
- Sub-cycle 1A: Artifact cleanup (5-day retention enforcement)
- Sub-cycle 1B: Status file consolidation (weighted approach)
- Sub-cycle 1C: Template lock enforcement (read-only governance)

**Cross-Check Validation**: All three must complete before gatekeeping pass

### Cycle 2: Module Consolidation (SEQUENTIAL after Cycle 1)
**Rationale**: Depends on clean governance state

**Parallel Sub-Workflows** (isolated context):
- Sub-cycle 2A: Retire light-theme-sprint → Epic migration
- Sub-cycle 2B: Retire cross-workspace-chat → Epic migration
- Sub-cycle 2C: Delete gemini-multimodal
- Sub-cycle 2D: Merge deep-scan → asgl submodule

**Cross-Check Validation**: Verify no broken imports, update all references

### Cycle 3: Synchronization Root Fixes (CAN RUN IN PARALLEL with Cycle 4)
**Rationale**: Independent domain from state management

**Sub-cycles**:
- 3A: Bidirectional event system completion
- 3B: Pause/resume/cancel UI components
- 3C: Mobile-aware error handling

### Cycle 4: State & Key Management (CAN RUN IN PARALLEL with Cycle 3)
**Rationale**: Independent domain from synchronization

**Sub-cycles**:
- 4A: God store elimination (remaining 69)
- 4B: Centralized key orchestration
- 4C: Agent config template system

### Cycle 5: UX & Localization (SEQUENTIAL - Final Polish)
**Rationale**: Depends on stable architecture from Cycles 1-4

**Sub-cycles**:
- 5A: i18n completion (100% coverage)
- 5B: Mobile portrait fixes
- 5C: Responsive breakpoint enforcement

---

## Part 7: Gatekeeping & Validation Strategy

### Inter-Cycle Cross-Checking
Each cycle validates against outputs of others:
- Cycle 3 checks state schema from Cycle 4
- Cycle 4 checks event types from Cycle 3
- Cycle 5 checks component sizes from Cycle 2

### Context Grasping Protocol
Before each cycle execution:
1. Read ALL governance files (AGENTS.md, sprint-status, module manifests)
2. Verify no context conflicts (timestamp validation)
3. Check artifact freshness (reject if >5 days old without re-verification)
4. Validate module import paths

### Rollback Strategy
If any cycle fails gatekeeping:
1. Partial rollback to last stable state
2. Generate incident report with root cause
3. Pause for human decision on continuation

---

## Part 8: Ralph Loop Coordination Design (CRITICAL)

### Problem Analysis

The **Ralph Wiggum hook** (enabled in `.claude/settings.json` line 79) reads `.claude/ralph-loop.local.md` on every Stop hook. This file is **BROKEN**:

**Current State** (`ralph-loop.local.md` iteration 16):
- References archived `_bmad/modules/cross-workspace-chat/` ❌
- References old deep-scan paths from 2026-01-05 ❌
- Module "architecture-remediation" (old structure) ❌
- Phase "implementation" (no context of what) ❌
- **NO auto-update mechanism** - file is static ❌

**Impact**: Each Ralph Loop iteration consumes STALE CONTEXT, causing:
- Context poisoning (archived paths, old references)
- Wasted token budget on irrelevant information
- No coordination between completed cycles and loop state

### Solution: Loop State Canonical File

**`.claude/ralph-loop.local.md`** becomes the **LOOP STATE CANONICAL FILE**

Auto-coordinated by:
1. **BMAD Master** - Updates after each cycle completion
2. **Governance Module** - Validates before cycle start
3. **Domain Router** - Updates on phase transitions
4. **Ralph Hook Script** - Reads and executes

#### New Ralph Loop Structure (Auto-Generated)

```yaml
---
# ============================================================
# RALPH LOOP STATE - AUTO-GENERATED BY BMAD MASTER
# ============================================================
# WARNING: Manual edits will be overwritten on next cycle update
# For modifications, update via: /bmad-core-agents-bmad-master

# ------------------------------------------------------------
# CYCLE TRACKING (updated by BMAD Master)
# ------------------------------------------------------------
cycle_sequence: [1, 2, 3, 4, 5]
current_cycle: 3                    # Active cycle number
current_subcycle: 3A               # Active sub-cycle
current_iteration: 1                # Loop iteration
max_iterations: 100

# ------------------------------------------------------------
# PHASE STATUS (updated by Domain Router)
# ------------------------------------------------------------
phase: "synchronization"           # Current phase name
team: "Team-A"
started_at: "2026-01-06T01:00:00+07:00"
last_completed: "2026-01-06T00:55:00+07:00"
last_completed_cycle: 2            # Last fully completed cycle
last_completed_subcycle: "2D"

# ------------------------------------------------------------
# MODULE REFERENCES (updated by Domain Router)
# ------------------------------------------------------------
active_modules:
  governance: "_bmad/modules/governance/"
  implementation: "_bmad/modules/implementation/"
  orchestration: "_bmad/modules/orchestration/"
  quality: "_bmad/modules/quality/"

archived_modules:
  - cross-workspace-chat
  - gemini-multimodal
  - light-theme-sprint

# ------------------------------------------------------------
# ARTIFACT REFERENCES (date-stamped for freshness)
# ------------------------------------------------------------
latest_artifacts:
  cycle_1: "_bmad-output/artifacts/2026-01-06/cycle-1-governance-foundation-completion.md"
  cycle_2: "_bmad-output/artifacts/2026-01-06/cycle-2-module-consolidation-completion.md"
  cycle_3: "pending"  # Updated when cycle 3 completes
  sprint_status: "bmm-workflow-status.yaml"
  deep_scan: "_bmad-output/deep-scan/reports/MASTER-RISK-REGISTER.md"
  master_plan: ".claude/plans/eager-orbiting-adleman.md"

# ------------------------------------------------------------
# NEXT ACTIONS (auto-populated by BMAD Master)
# ------------------------------------------------------------
next_actions:
  - execute_cycle_3_sync_fixes
  - execute_cycle_4_state_management
  - validate_gates_before_proceed

# ------------------------------------------------------------
# VALIDATION STATE (updated by Governance Module)
# ------------------------------------------------------------
validation:
  last_check: "2026-01-06T00:55:00+07:00"
  status: "PASS"
  gates_passed: 3
  gates_failed: 0
  artifact_freshness: "verified"
  module_integrity: "verified"

# ------------------------------------------------------------
# ERROR HANDLING (updated by any agent on error)
# ------------------------------------------------------------
errors_encountered: []
rollback_points: []
fallback_strategies: []

# ------------------------------------------------------------
# MCP SERVER REQUIREMENTS (for Research-First)
# ------------------------------------------------------------
required_mcp_servers:
  - context7      # Official documentation
  - deepwiki     # Tech stack semantics
  - tavily        # Web search for current patterns
  - repomix       # Codebase analysis

# ============================================================
# END OF LOOP STATE
# ============================================================

# --------------------------------------------------------
# INSTRUCTIONS FOR AGENTS (read this, don't edit file above)
# --------------------------------------------------------

The BMAD Master agent automatically updates the YAML section above
after each cycle/sub-cycle completion. For changes to structure or
logic, update via: /bmad/modules/governance/workflows/ralph-loop-coordination.md

# To manually trigger a cycle update, use:
# /bmad-core-agents-bmad-master action:update-ralph-loop

# For cycle status, see: _bmad-output/artifacts/YYYY-MM-DD/cycle-{n}-completion.md
# For module structure, see: _bmad/modules/{module-name}/MANIFEST.yaml
```

### Auto-Update Coordination Matrix

| Event | Updater | Trigger | Fields Updated |
|-------|---------|---------|----------------|
| **Cycle completes** | BMAD Master | `last_completed_cycle`, `current_cycle`, `next_actions` |
| **Sub-cycle completes** | Domain Router | `current_subcycle`, `phase` |
| **Validation runs** | Governance | `validation`, `gates_passed` |
| **Error occurs** | Any agent | `errors_encountered`, `rollback_points` |
| **New artifact created** | BMAD Master | `latest_artifacts.{cycle_n}` |

### Hook Integration Scripts

**`.claude/hooks/ralph-loop.sh`** (Stop hook handler):
```bash
#!/bin/bash
# Ralph Wiggum Stop Hook - Loads latest loop state
RALPH_FILE=".claude/ralph-loop.local.md"

# Extract current cycle context
CURRENT_CYCLE=$(grep "^current_cycle:" "$RALPH_FILE" | cut -d: -f2 | xargs)
CURRENT_SUBCYCLE=$(grep "^current_subcycle:" "$RALPH_FILE" | cut -d: -f2 | xargs)
LAST_COMPLETED=$(grep "^last_completed_cycle:" "$RALPH_FILE" | cut -d: -f2 | xargs)

# Load latest completion report for context
LATEST_ARTIFACT=$(grep "cycle_${CURRENT_CYCLE}:" "$RALPH_FILE" | cut -d: -f2 | xargs)
if [ -f "$LATEST_ARTIFACT" ]; then
  echo "=== Loading context from: $LATEST_ARTIFACT ==="
  head -50 "$LATEST_ARTIFACT"
fi

# Increment iteration
ITERATION=$(grep "^current_iteration:" "$RALPH_FILE" | cut -d: -f2 | xargs)
NEW_ITERATION=$((ITERATION + 1))
sed -i.bak "s/^current_iteration: $ITERATION/current_iteration: $NEW_ITERATION/" "$RALPH_FILE"

echo "=== Ralph Loop Iteration $NEW_ITERATION - Cycle $CURRENT_CYCLE ==="
```

### Implementation Steps

**Step 1**: Create new `ralph-loop.local.md` with above structure
**Step 2**: Add auto-update logic to BMAD Master agent (`bmad-master.md`)
**Step 3**: Add validation logic to Governance Module
**Step 4**: Create `.claude/hooks/ralph-loop.sh` script
**Step 5**: Add Ralph Loop Coordination workflow to governance module

### Files to Create/Modify

1. `.claude/ralph-loop.local.md` - NEW structure
2. `.claude/hooks/ralph-loop.sh` - NEW hook script
3. `_bmad/modules/governance/workflows/ralph-loop-coordination.md` - NEW workflow
4. `_bmad/core/agents/bmad-master.md` - UPDATE with auto-update logic
5. `_bmad/modules/implementation/agents/domain-router.md` - UPDATE with phase tracking

---

**Next Action**: Execute Cycles 3 & 4 (Parallel)
**Entry Point**: `/bmad-core-agents-bmad-master` with cycle-3-4-parallel flag
**Dependencies**: Cycles 1-2 COMPLETE ✅ | Ralph Loop Coordination COMPLETE ✅

---

## Part 9: Updated Metrics (Double-Check Verification - 2026-01-06)

### Corrected God Store Count
**Previous Estimate**: 69 god stores
**Actual Count**: 12 god stores > 300 lines

**Largest Stores**:
| Store | Lines | Priority |
|-------|-------|----------|
| `quiz-store.ts` | 658 | P0 |
| `canvas-store.ts` | 623 | P0 |
| `flashcard-store.ts` | 531 | P0 |
| `migration-backup.ts` | 549 | P1 |
| `local-storage-migrator.ts` | 509 | P1 |

### Cycle 3-4 Execution Checklist

**Cycle 3A: Bidirectional Events**
- [ ] Examine `/src/lib/events/cross-workspace-event-bus.ts`
- [ ] Implement bidirectional emission/reception
- [ ] Fix state preservation during workspace switches
- [ ] Complete state restoration (lines 84-85)

**Cycle 3B: Pause/Resume/Cancel UI**
- [ ] Examine `/src/lib/workflow/executor/workflow-executor.ts`
- [ ] Create UI controls for pause/resume/cancel
- [ ] Add progress indicators for long operations
- [ ] Connect workflow executor to UI components

**Cycle 3C: Mobile-Aware Error Handling**
- [ ] Add mobile-specific fallbacks (FSA API limitations)
- [ ] Implement circuit-breaker pattern for WebContainer
- [ ] Create sync-recovery agent

**Cycle 4A: God Store Elimination**
- [ ] Split 12 remaining god stores into ≤120 line slices
- [ ] Create unified store facades
- [ ] Validate all imports still work

**Cycle 4B: Centralized Key Orchestration**
- [ ] Create unified key orchestration layer
- [ ] Implement security vs convenience balance
- [ ] Create key migration workflow

**Cycle 4C: Agent Config Templates**
- [ ] Create agent config templates
- [ ] Implement bring-over logic for workspace switches
- [ ] Create agent config synchronization workflow

---

## Part 10: Standards & Governance Update Plan (Research-Based)

### Global Standards Update Required

**Research Date**: 2026-01-06
**Research Artifact**: `_bmad-output/research-artifacts/global-standards-analysis-2025-01-06.md`

| Standard | Priority | Updates Needed | Est. Time |
|----------|----------|----------------|-----------|
| `error-handling.md` | **P0** | Add Result type pattern, functional error handling | 2h |
| `coding-style.md` | **P0** | Add React 19 concurrent features (useTransition, useDeferredValue, useOptimistic) | 2h |
| `security-validation.md` | **P0** | **CREATE NEW** - XSS prevention, URL allowlisting, content security | 3h |
| `tech-stack.md` | **P0** | Update all dependency versions to current | 1h |
| `ai-code-standards.md` | **P1** | **CREATE NEW** - AI-generated code documentation standards | 2h |
| `conventions.md` | **P1** | Add TanStack Start SSR patterns | 1h |
| `validation.md` | **P2** | Add rate limiting validation, async error boundaries | 1h |
| `mcp-research.md` | **P2** | Add fallback MCP sources | 1h |

### Governance Documents Update Required

**Research Artifact**: `_bmad-output/research/governance-documents-analysis-2026-01-06.md`

| Document | Priority | Action Required |
|----------|----------|-----------------|
| `AGENTS.md` | **P0** | 6 completed stories since last update - UPDATE REQUIRED |
| All `agent-os/` docs | **P1** | Add YAML frontmatter, define update frequency |
| `agent-os/product/` | **P1** | Connect to AGENTS.md as single-source-of-truth |

### Frontmatter Standard (to be applied)

```yaml
---
document_type: "standard" | "governance" | "prd" | "architecture" | "ux_spec"
last_updated: "YYYY-MM-DD"
update_frequency: "immediate" | "per-story" | "per-epic" | "quarterly"
stakeholder: "team-a"
related_docs:
  - path/to/related/doc.md
---
```

---

## Part 11: Cycle 3 & 4 Workflow Specifications

### Execution Strategy: Parallel-Ready Independent Workflows

Each sub-cycle is designed as an **independent workflow** that can:
1. Execute in a new thread/conversation
2. Complete without dependencies on other sub-cycles
3. Produce its own completion artifact
4. Update Ralph Loop state on finish

---

### Cycle 3A: Bidirectional Event System

**Workflow File**: `_bmad/workflows/cycle-3a-bidirectional-events.md`

**Objective**: Complete state preservation/restoration during workspace switches

**Files to Examine/Modify**:
- `/src/lib/events/cross-workspace-event-bus.ts` - Core event bus
- `/src/lib/events/session-snapshot.ts` - State snapshot manager

**Requirements**:
1. Implement bidirectional event emission between workspaces
2. Complete state snapshot mechanism (lines 84-85 incomplete)
3. Add event replay capability for missed events
4. Ensure state restoration after workspace switch

**Acceptance Criteria**:
- [ ] State fully preserved during workspace switches
- [ ] Events propagate bidirectionally between workspaces
- [ ] Event replay handles missed events during switch
- [ ] No data loss on workspace transition

**Validation Commands**:
```bash
# Test event propagation
pnpm test src/lib/events/cross-workspace-event-bus.test.ts

# Check state restoration
pnpm test src/lib/events/session-snapshot.test.ts
```

**Dependencies**: None (can start immediately)

---

### Cycle 3B: Pause/Resume/Cancel UI

**Workflow File**: `_bmad/workflows/cycle-3b-pause-resume-ui.md`

**Objective**: User-facing controls for workflow management

**Files to Create**:
- `/src/presentation/components/ui/workflow-control-bar.tsx` - Control buttons
- `/src/presentation/components/ui/workflow-progress-modal.tsx` - Progress display

**Requirements**:
1. Create pause/resume/cancel buttons
2. Add progress indicators for long operations
3. Connect to workflow executor states (IDLE, RUNNING, PAUSED, COMPLETED, FAILED)
4. Mobile-responsive design

**Acceptance Criteria**:
- [ ] Pause button available during RUNNING state
- [ ] Resume button available during PAUSED state
- [ ] Cancel button with confirmation dialog
- [ ] Progress percentage visible
- [ ] Touch targets ≥44px for mobile

**Dependencies**: 3A (needs workspace sync for progress tracking)

---

### Cycle 3C: Mobile-Aware Error Handling

**Workflow File**: `_bmad/workflows/cycle-3c-mobile-errors.md`

**Objective**: Fallback mechanisms for mobile limitations

**Files to Create**:
- `/src/infrastructure/sync/mobile-fallback-handler.ts` - Fallback logic
- `/src/infrastructure/sync/sync-recovery-agent.ts` - Recovery patterns

**Requirements**:
1. Detect File System Access API limitations on mobile
2. Implement circuit-breaker pattern for WebContainer
3. Create sync-recovery mechanism
4. Add mobile-specific error messages

**Acceptance Criteria**:
- [ ] Mobile devices use IndexedDB fallback
- [ ] Circuit breaker trips after 3 consecutive failures
- [ ] Sync recovery resumes from last checkpoint
- [ ] User-friendly mobile error messages

**Dependencies**: None

---

### Cycle 4A: God Store Elimination (Corrected)

**Workflow File**: `_bmad/workflows/cycle-4a-god-stores.md`

**Objective**: Split 12 remaining god stores into ≤120 line slices

**God Stores to Split**:
| Store | Lines | Target Slices |
|-------|-------|---------------|
| `quiz-store.ts` | 658 | 6 slices |
| `canvas-store.ts` | 623 | 6 slices |
| `flashcard-store.ts` | 531 | 5 slices |
| `migration-backup.ts` | 549 | 5 slices |
| `local-storage-migrator.ts` | 509 | 5 slices |
| ... (6 more) | ... | ... |

**Requirements**:
1. Split each god store into slices ≤120 lines
2. Create unified store facade for backward compatibility
3. Use Zustand v5 individual selectors
4. Maintain all import paths

**Acceptance Criteria**:
- [ ] All slices ≤120 lines
- [ ] All imports still work (facade pattern)
- [ ] Zero TypeScript errors in production code
- [ ] Tests pass for refactored stores

**Dependencies**: None

---

### Cycle 4B: Centralized Key Orchestration

**Workflow File**: `_bmad/workflows/cycle-4b-key-orchestration.md`

**Objective**: Unified LLM provider key management

**Files to Create**:
- `/src/infrastructure/persistence/providers/key-orchestration-service.ts` - Key management
- `/src/infrastructure/persistence/providers/key-migration-workflow.ts` - Migration logic

**Requirements**:
1. Create unified access layer for provider configs
2. Implement key validation
3. Enable cross-workspace key sync
4. Balance security (IndexedDB) vs convenience

**Acceptance Criteria**:
- [ ] Single `getKeyProvider()` function
- [ ] Keys validated before use
- [ ] Keys sync across workspaces
- [ ] Secure storage in IndexedDB

**Dependencies**: None

---

### Cycle 4C: Agent Config Template System

**Workflow File**: `_bmad/workflows/cycle-4c-agent-templates.md`

**Objective**: Cross-workspace agent configuration consistency

**Files to Create**:
- `/src/lib/agent/agent-config-template-service.ts` - Template management
- `/src/lib/agent/agent-config-sync-workflow.ts` - Sync logic

**Requirements**:
1. Create agent config templates
2. Implement similarity matching for workspace transitions
3. Auto-select similar configs on workspace switch
4. Enable manual override

**Acceptance Criteria**:
- [ ] Templates defined for all agent types
- [ ] Similarity score ≥80% for auto-select
- [ ] Manual override always available
- [ ] Config preserved during workspace switch

**Dependencies**: None

---

## Part 12: Parallel Execution Strategy

### Thread Allocation (Recommended)

```
Thread 1 (Sync Focus): 3A → 3B
Thread 2 (Error Focus): 3C
Thread 3 (State Focus): 4A
Thread 4 (Key Focus): 4B
Thread 5 (Agent Focus): 4C
```

### Cross-Check Validation

After all threads complete:
- Cycle 3 checks state schema from Cycle 4
- Cycle 4 checks event types from Cycle 3
- All generate completion artifacts
- Ralph Loop state updated with all completions

---

## Part 13: IMMEDIATE EXECUTION - Governance Foundation (2026-01-06)

### CRITICAL INSIGHT: Deep-Scan Was Wrong Starting Point

**Root Cause Discovery**: Running deep-scan NOW would produce MORE ungoverned artifacts, adding to context poisoning. The deep-scan module itself is part of the problem:

| Issue | Evidence |
|-------|----------|
| Artifacts have no naming convention | Mixed snake_case/kebab-case, no standardized IDs |
| Missing frontmatter metadata | Only 30% of artifacts have required metadata |
| No artifact lifecycle | 68 orphan files archived but untracked |
| Skills not integrated | 22/42 skills defined but not used |
| Status file chaos | 5+ duplicate versions, no single source of truth |

### Why Governance Must Come First

The BMAD framework vision cannot work without:
1. **Predictable artifact structure** → AI agents can trust artifact freshness
2. **Single source of truth** → No conflicting status files
3. **Module consolidation** → Clear which workflow to use
4. **Skills integration** → Frontmatter-based routing works

### Governance Foundation Plan

#### Step 1: Create Four-Tier Artifact Governance System

```yaml
# Tier 1: The Unchangeable (Standards)
location: agent-os/standards/global/
files: [coding-style.md, commenting.md, conventions.md, error-handling.md, mcp-research.md, tech-stack.md, validation.md]
access: read-only (notify human if outdated)
retention: permanent

# Tier 2: Strictly Controlled (SSOT)
location: [AGENTS.md, agent-os/product/, agent-os/standards/]
access: line-based replacement only, never file replacement
retention: permanent with frontmatter versioning
update_frequency: [immediate, per-story, per-epic, quarterly]

# Tier 3: Medium-live Artifacts
location: _bmad-output/sprint-artifacts/YYYY-MM/
naming: {artifact-type}-{YYYY-MM-DD}.{ext}
retention: 90 days active, then archive/

# Tier 4: Short-live Artifacts
location: _bmad-output/handoffs/YYYY-MM-DD/
naming: {story-id}-{artifact-type}-{seq}.{ext}
retention: 5 days active, then auto-archive/
metadata:
  required_fields: [parent_id, sequence_number, created_at, expires_at, status]
```

#### Step 2: Module Consolidation (7 → 4 modules)

| Action | Module | Reason |
|--------|--------|--------|
| **RETAIN** | architecture-remediation | Active store/component refactoring |
| **RETAIN** | asgl | Central orchestrator (fix to read-only templates) |
| **RETAIN** | deep-scan | Diagnostics (add governance enforcement) |
| **RETAIN** | governance | NEW - Artifact lifecycle management |
| **MERGE** | implementation → architecture-remediation | Duplicate workflows |
| **MERGE** | orchestration → asgl | Duplicate coordination |
| **MIGRATE** | cross-workspace-chat → epics/ | Epic content, not module |
| **DELETE** | gemini-multimodal | Empty |
| **MIGRATE** | light-theme-sprint → epics/ | Sprint content, not module |

#### Step 3: Status File Single Source of Truth

```
KEEP: bmm-workflow-status.yaml (root level)
ARCHIVE: _bmad-output/sprint-artifacts/sprint-status.yaml
ARCHIVE: .archive/sprint-status-original-backup.yaml
DELETE: All other duplicate versions

Reference pattern:
  All agents read: bmm-workflow-status.yaml
  Sprint artifacts reference: ../bmm-workflow-status.yaml
```

#### Step 4: Naming Convention Standard

```yaml
# Artifact IDs
pattern: "{prefix}-{domain}-{sequence}"
example: "ARC-STORE-001", "E2-MODAL-003"

# Date Format
format: "YYYY-MM-DD"
example: "2026-01-06"

# File Names
short_live: "{story-id}-{type}-{seq}.md"
medium_live: "{type}-{YYYY-MM-DD}.md"
standards: "{name}.md" (no date)

# Frontmatter Template
---
artifact_id: "{prefix}-{domain}-{seq}"
artifact_type: "handoff" | "report" | "validation" | "research"
parent_id: "{epic-or-story-id}"
sequence_number: {int}
created_at: "YYYY-MM-DDTHH:mm:ssZ"
expires_at: "YYYY-MM-DDTHH:mm:ssZ"
status: "DRAFT" | "ACTIVE" | "SUPERSEDED" | "ARCHIVED"
related_artifacts: []
tags: []
---
```

#### Step 5: Short-Live Artifact Validation (CRITICAL)

**Rule**: If artifact is >24 hours old OR numbering/ID/metadata is disconnected during handoff:

```yaml
validation_workflow:
  on_agent_handoff:
    1. Check artifact timestamp
    2. Validate metadata completeness
    3. Verify numbering sequence is intact

  if_artifact_stale_or_broken:
    action: IMMEDIATE_CONTEXT_RECOVERY
    steps:
      - grep search for artifact_id across all _bmad-output/
      - grep search for parent_id to trace lineage
      - Read last 3 related artifacts to understand context gap
      - Synthesize missing context before asking user
      - Present: "Artifact {id} is {hours}h old. Context recovered: {summary}"

  then:
    ask_user_approval: true
    context: "Full context recovered, ready for execution"
```

**Example Scenario**:
```yaml
# Agent receives handoff with artifact: ARC-STORE-001
artifact:
  id: "ARC-STORE-001"
  created_at: "2026-01-05T10:00:00Z"
  current_time: "2026-01-06T14:00:00Z"  # 28 hours old!

# Agent BEFORE asking user:
agent_action:
  - grep "ARC-STORE-001" _bmad-output/ --recursive
  - grep "ARC-STORE-002" _bmad-output/ --recursive  # Check next in sequence
  - Read: _bmad-output/handoffs/2026-01-05/ARC-STORE-001-handoff.md
  - Read: _bmad-output/handoffs/2026-01-05/ARC-STORE-001-validation.md
  - Synthesize: "Story ARC-STORE-001 started 28h ago for quiz-store.ts split.
                   Status: 3/6 slices created. Remaining: ui, sync, validation."
  - Present to user with full context
```

**Frontmatter for Validation**:
```yaml
---
artifact_id: "{prefix}-{domain}-{seq}"
artifact_type: "handoff" | "report" | "validation"
parent_id: "{epic-or-story-id}"
sequence_number: {int}
created_at: "YYYY-MM-DDTHH:mm:ssZ"
expires_at: "YYYY-MM-DDTHH:mm:ssZ"  # 24h for short-live
status: "DRAFT" | "ACTIVE" | "SUPERSEDED" | "ARCHIVED"
related_artifacts: ["prev-artifact-id", "next-artifact-id"]
tags: []
last_validated: "YYYY-MM-DDTHH:mm:ssZ"
---
```

#### Step 6: Skills Integration

```yaml
# Update .skills-index.yaml
consolidate:
  existing: 20 skills indexed
  pending: 22 skills to add
  total: 42 skills

# Skills must link to workflows
each_skill:
  frontmatter: required
  triggers: [conditions for auto-activation]
  related_workflow: path/to/workflow.md
  related_module: module-name
```

### Execution Order

```
1. Create governance module structure
   → _bmad/modules/governance/
   → MANIFEST.yaml
   → workflows/artifact-lifecycle.md
   → workflows/naming-enforcement.md
   → workflows/archive-cycle.md
   → workflows/stale-artifact-validation.md

2. Create artifact registry
   → _bmad/modules/governance/scratchpad/artifact-registry.yaml
   → Tracks all artifacts with metadata
   → Orphan detection mechanism
   → Timestamp validation

3. Consolidate modules
   → Merge implementation → architecture-remediation
   → Merge orchestration → asgl
   → Migrate cross-workspace-chat → epics/
   → Migrate light-theme-sprint → epics/
   → DELETE gemini-multimodal

4. Establish SSOT for status files
   → Archive all but bmm-workflow-status.yaml
   → Update all agents to reference root file

5. Define and enforce naming convention
   → Create naming-enforcement workflow
   → Update all agents to validate before write

6. Implement stale artifact validation
   → All agents check timestamp on handoff
   → Auto-recover context via grep if >24h old
   → Present full context before asking user

7. Integrate skills
   → Add 22 pending skills to .skills-index.yaml
   → Link skills to workflows/modules

8. THEN run deep-scan
   → With governance in place
   → Artifacts follow naming convention
   → Metadata tracked in registry
   → Auto-archive after expiry
   → Stale context auto-recovered
```

### Success Criteria

- [ ] Governance module created with artifact lifecycle policies
- [ ] Module count: 4 (down from 7)
- [ ] Single status file: bmm-workflow-status.yaml
- [ ] Naming convention defined and enforced
- [ ] Artifact registry tracking all artifacts
- [ ] Skills: 42/42 integrated in .skills-index.yaml
- [ ] Stale artifact validation: agents auto-recover >24h context
- [ ] All agents follow governance before artifact creation

### After Governance Foundation: Deep-Scan Execution

Once governance is in place, deep-scan will run with:

1. **Artifact tracking**: Every output registered in artifact-registry.yaml
2. **Naming enforced**: All outputs follow {prefix}-{domain}-{seq} pattern
3. **Metadata required**: Frontmatter with parent_id, expires_at, status
4. **Auto-archive**: Artifacts older than 5 days moved to archive/
5. **Orphan detection**: Registry alerts on unreferenced artifacts

**Deep-scan outputs will be**:
```
_bmad-output/deep-scan/reports/
├── DEEP-SCAN-STATE-{YYYY-MM-DD}.md        # State findings
├── DEEP-SCAN-ARCH-{YYYY-MM-DD}.md         # Architecture findings
├── DEEP-SCAN-SEC-{YYYY-MM-DD}.md          # Security findings
├── DEEP-SCAN-PERF-{YYYY-MM-DD}.md         # Performance findings
├── MASTER-RISK-REGISTER-{YYYY-MM-DD}.md   # Prioritized synthesis
└── REMEDIATION-BACKLOG-{YYYY-MM-DD}.yaml  # Actionable stories
```

Each with proper frontmatter:
```yaml
---
artifact_id: "DS-SCAN-001"
artifact_type: "diagnostic_report"
parent_id: "governance-foundation-001"
created_at: "2026-01-06T10:00:00Z"
expires_at: "2026-01-11T10:00:00Z"
status: "ACTIVE"
related_artifacts: ["governance-foundation-001"]
tags: ["deep-scan", "state", "architecture", "security"]
scanner_version: "3.0"
governance_version: "1.0"
---
```

---

*Plan verified and updated - 2026-01-06*
*Governance Foundation: READY TO EXECUTE | Deep-Scan: BLOCKED until governance complete*
*Version 3.0 - Root Cause Focus: Governance First, Then Diagnostics*
