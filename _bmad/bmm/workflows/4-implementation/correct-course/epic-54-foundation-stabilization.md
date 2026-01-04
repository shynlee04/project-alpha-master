# EPIC-54: Foundation Stabilization - Correct Course Workflow

**Workflow ID**: `/bmad:bmm:workflows:correct-course` (EPIC-54 Variant)
**Version**: 1.0.0
**Created**: 2026-01-04
**Trigger**: Deep scan revealed 68.5/100 health score with 3 P0 critical risks
**Module**: BMAD Architecture Remediation
**Reference**: `_bmad-output/deep-scan/2026-01-04/161700/`

---

## Purpose

Autonomous stabilization workflow that systematically eliminates P0/P1 risks using existing architecture-remediation agents. Executes as iterative cycle: analyze → dispatch agent → validate → next risk.

**CRITICAL**: This workflow harnesses EXISTING infrastructure. No new agents or tech stack changes.

---

## Executive Summary

**Current Health**: 68.5/100 (C+ grade)
**Target Health**: 90/100 (A grade)
**Estimated Duration**: 8-10 weeks (120-140 hours)
**Strategy**: P0-first, then P1, using existing agents

### P0 Critical Risks (Must Fix First)

| ID | Risk | Impact | Effort | Agent |
|----|------|--------|--------|-------|
| P0-1 | localStorage encryption keys in plaintext | Security breach | 12-16h | security-scanner |
| P0-2 | 86 hardcoded pixel values | UX inconsistency | 8-12h | ux-scanner |
| P0-3 | 23 tables without IndexedDB quota handling | Data loss | 18-22h | file-sync-specialist |

### P1 High Priority Risks

| ID | Risk | Impact | Effort | Agent |
|----|------|--------|--------|-------|
| P1-1 | 7 god files >5,000 lines | Maintainability | 40-60h | store-refactorer |
| P1-2 | Store duplication 30% | Confusion | 42-58h | store-refactorer |
| P1-3 | 4 circular dependencies | Build failures | 8-12h | typescript-fixer |
| P1-4 | 127 cross-workspace import violations | Architecture debt | 16-24h | workspace-architect |

---

## Architecture Remediation Module Integration

### Available Agents

```yaml
agents:
  store-refactorer:
    location: "_bmad/modules/architecture-remediation/agents/store-refactorer.md"
    specializes: God store elimination, slice extraction, facade patterns
    workflows: ["eliminate-god-stores", "state-consolidation-cycle"]

  component-splitter:
    location: "_bmad/modules/architecture-remediation/agents/component-splitter.md"
    specializes: Breaking god components into focused modules
    workflows: ["normalize-components"]

  typescript-fixer:
    location: "_bmad/modules/architecture-remediation/agents/typescript-fixer.md"
    specializes: Circular dependencies, type errors, import violations
    workflows: ["state-consolidation-cycle"]

  test-writer:
    location: "_bmad/modules/architecture-remediation/agents/test-writer.md"
    specializes: Test coverage, validation gates
    workflows: ["all"]

  workspace-architect:
    location: "_bmad/modules/architecture-remediation/agents/workspace-architect.md"
    specializes: File organization, import paths, layer compliance
    workflows: ["workspace-file-system-e2e"]

  file-sync-specialist:
    location: "_bmad/modules/architecture-remediation/agents/file-sync-specialist.md"
    specializes: IndexedDB operations, quota handling, sync safety
    workflows: ["notes-sync-strategy", "knowledge-sync-strategy", "workspace-file-system-e2e"]
```

### Available Workflows

```yaml
workflows:
  eliminate-god-stores:
    location: "_bmad/modules/architecture-remediation/workflows/eliminate-god-stores.md"
    purpose: Refactor god stores (>300 lines) into modular slices (≤120 lines)

  state-consolidation-cycle:
    location: "_bmad/modules/architecture-remediation/workflows/state-consolidation-cycle.md"
    purpose: Migrate duplicate stores to canonical location with facades

  normalize-components:
    location: "_bmad/modules/architecture-remediation/workflows/normalize-components.md"
    purpose: Split god components into focused modules

  workspace-file-system-e2e:
    location: "_bmad/modules/architecture-remediation/workflows/workspace-file-system-e2e.md"
    purpose: End-to-end file system sync with quota handling
```

---

## Workflow Cycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│  EPIC-54 FOUNDATION STABILIZATION CYCLE                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐    │
│  │  ANALYZE   │───▶│  DISPATCH  │───▶│  EXECUTE   │───▶│ VALIDATE   │    │
│  │    Risk    │    │   Agent    │    │  Workflow  │    │    Gate    │    │
│  └────────────┘    └────────────┘    └────────────┘    └────────────┘    │
│        │                 │                  │                  │           │
│        │                 │                  │                  │           │
│        ▼                 ▼                  ▼                  ▼           │
│   • Read        • Select       • Run           • TypeScript     │
│     risk         appropriate    workflow        check            │
│   • Map to       agent                            • Build check   │
│     agent                                        • Smoke test    │
│   • Estimate                                        • Coverage ≥   │
│     effort                                           80%          │
│                         ┌──────────────────────────────────────────┤
│                                                         ▼            │
│                                                   ┌────────────┐     │
│                                                   │   NEXT     │◀────│
│                                                   │   RISK     │     │
│                                                   │    LOOP    │     │
│                                                   └────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Execution

### Step 1: Initialize Loop State

```yaml
action: "Create or load LOOP_STATE.yaml"
file: "_bmad-output/epic-54-loop-state.yaml"

state_template:
  loop_id: "epic-54-foundation-stabilization"
  started_at: "{timestamp}"
  iteration_count: 0
  current_phase: "P0_REMEDIATION"

  risks_completed: []
  risks_remaining: []

  health_score:
    before: 68.5
    current: 68.5
    target: 90.0

  last_validation:
    status: "PENDING"
    timestamp: null
    errors: []
```

### Step 2: Load Risk Register

```yaml
action: "Read deep scan results"
source: "_bmad-output/deep-scan/2026-01-04/161700/synthesis/MASTER-RISK-REGISTER.md"

extract:
  - P0 risks (3 items)
  - P1 risks (24 items)
  - P2 risks (31 items)

priority_order:
  1. All P0 risks first (data loss, security)
  2. P1 risks by effort (low hanging fruit first)
  3. P2 risks only if P0/P1 complete
```

### Step 3: Risk → Agent Mapping

For each risk, dispatch to appropriate agent:

```yaml
risk_mappings:
  P0-1:  # localStorage encryption
    agent: "security-scanner"
    workflow: "custom"
    effort: "12-16 hours"
    acceptance_criteria:
      - "All localStorage keys encrypted"
      - "PBKDF2 key derivation implemented"
      - "Zero plaintext keys in codebase"

  P0-2:  # Hardcoded pixel values
    agent: "ux-scanner"
    workflow: "custom"
    effort: "8-12 hours"
    acceptance_criteria:
      - "All pixels moved to design tokens"
      - "Zero hardcoded pixel values"
      - "CSS custom properties used"

  P0-3:  # IndexedDB quota handling
    agent: "file-sync-specialist"
    workflow: "workspace-file-system-e2e"
    effort: "18-22 hours"
    acceptance_criteria:
      - "Quota check before all Dexie writes"
      - "User notification when quota low"
      - "Automatic cleanup strategy"
      - "Graceful degradation"

  P1-1:  # God stores >5,000 lines
    agent: "store-refactorer"
    workflow: "eliminate-god-stores"
    effort: "40-60 hours"
    stores:
      - "rag-store.ts" (1,595 lines)
      - "conversation-threads-store.ts" (726 lines)
      - "quiz-store.ts" (522 lines)
      - "canvas-store.ts" (500 lines)
      - "study-store.ts" (319 lines)

  P1-2:  # Store duplication
    agent: "store-refactorer"
    workflow: "state-consolidation-cycle"
    effort: "42-58 hours"
    epic_references:
      - "Epic CC-1: Conversation Consolidation"
      - "Epic CP-1: Project Consolidation"

  P1-3:  # Circular dependencies
    agent: "typescript-fixer"
    workflow: "state-consolidation-cycle"
    effort: "8-12 hours"
    acceptance_criteria:
      - "Zero circular import cycles"
      - "All imports follow four-layer architecture"

  P1-4:  # Cross-workspace import violations
    agent: "workspace-architect"
    workflow: "workspace-file-system-e2e"
    effort: "16-24 hours"
    acceptance_criteria:
      - "All imports use canonical paths"
      - "Zero cross-workspace violations"
```

### Step 4: Execute Workflow

For each risk, load and execute the appropriate workflow:

```bash
# Example: P0-3 - IndexedDB quota handling
# Load file-sync-specialist agent
agent load "_bmad/modules/architecture-remediation/agents/file-sync-specialist.md"

# Execute workspace-file-system-e2e workflow
agent execute "_bmad/modules/architecture-remediation/workflows/workspace-file-system-e2e.md" \
  --focus "indexeddb-quota-handling" \
  --output "_bmad-output/p0-3-quota-handling-{timestamp}.md"
```

### Step 5: Validation Gate

After each risk remediation, run validation:

```yaml
validation_steps:
  typescript_check:
    command: "pnpm typecheck"
    pass_criteria: "Zero new errors"

  lint_check:
    command: "pnpm lint"
    pass_criteria: "Zero new warnings"

  governance_check:
    command: "pnpm governance"
    pass_criteria: "Zero new violations"

  build_check:
    command: "pnpm build"
    pass_criteria: "Build succeeds"

  test_check:
    command: "pnpm test"
    pass_criteria: "100% pass rate"
```

### Step 6: Loop Continuation

If validation passes, proceed to next risk:

```yaml
auto_iteration:
  condition: "validation_passed AND risks_remaining > 0"
  action: "proceed_to_next_risk"

  completion_signal: "<promise>EPIC-54 COMPLETE</promise>"
  completion_criteria:
    - "All P0 risks resolved"
    - "All P1 risks resolved"
    - "Health score ≥ 90/100"
    - "Zero TypeScript errors in production code"
```

---

## Sprint Structure

### Week 1-2: P0 Elimination (38-50 hours)

```
Day 1-2:  P0-1 - localStorage encryption (12-16h)
Day 3-4:  P0-2 - Hardcoded pixels (8-12h)
Day 5-10: P0-3 - IndexedDB quota handling (18-22h)
```

### Week 3-4: P1 God Store Elimination (40-60 hours)

```
Execute eliminate-god-stores workflow for:
- rag-store.ts (1,595 → ~5 slices of 120 lines)
- conversation-threads-store.ts (726 → ~6 slices)
- quiz-store.ts (522 → ~5 slices)
- canvas-store.ts (500 → ~5 slices)
- study-store.ts (319 → ~3 slices)
```

### Week 5-6: P1 Store Consolidation (42-58 hours)

```
Execute state-consolidation-cycle workflow:
- Epic CC-1: Conversation Consolidation (6 stores → 1)
- Epic CP-1: Project Consolidation (3 stores → 1)
```

### Week 7-8: P1 Import & Architecture (24-36 hours)

```
- P1-3: Circular dependency resolution (8-12h)
- P1-4: Cross-workspace import violations (16-24h)
- Validation & documentation (8h)
```

---

## Output Artifacts

### Per Risk

```
_bmad-output/epic-54/{risk-id}/
├── analysis-{timestamp}.md
├── implementation-{timestamp}.md
├── validation-{timestamp}.md
└── handoff-{timestamp}.md
```

### Overall Progress

```
_bmad-output/epic-54/
├── LOOP_STATE.yaml
├── HEALTH_SCORE_TRACKING.md
├── COMPLETION_SUMMARY.md (when done)
└── HANDOFF_TO_NEXT_SPRINT.md (when done)
```

---

## Integration with Sprint Planning

This workflow feeds into:

1. **Sprint Status**: `_bmad-output/sprint-artifacts/sprint-status.yaml`
2. **Epic Tracking**: `_bmad/modules/architecture-remediation/artifacts/epic-tracking.md`
3. **Validation Gates**: `_bmad/modules/architecture-remediation/artifacts/validation-gates.md`

---

## Agent Handoff Protocol

When switching between agents:

```yaml
handoff_template:
  from_agent: "{current_agent}"
  to_agent: "{next_agent}"
  task: "{risk_description}"

  artifacts_created:
    - "{artifact_1_path}"
    - "{artifact_2_path}"

  validation_results:
    typescript: "✅ PASS / ❌ FAIL"
    build: "✅ PASS / ❌ FAIL"
    tests: "✅ PASS / ❌ FAIL"

  next_action: "{what_to_do_next}"
```

---

## Exit Conditions

### Successful Completion
- ✅ All P0 risks resolved
- ✅ All P1 risks resolved
- ✅ Health score ≥ 90/100
- ✅ Zero TypeScript errors (production code)
- ✅ All governance checks passing

### Failure Halt
- ❌ TypeScript errors increase by >10
- ❌ Breaking change detected
- ❌ Data loss risk identified
- ❌ Build fails for >2 consecutive iterations

---

## Quick Start Commands

```bash
# Start the workflow
/workflow correct-course epic-54

# Check progress
cat _bmad-output/epic-54-loop-state.yaml | grep -A 5 "iteration_count\|current_phase\|health_score"

# Cancel if needed
/workflow cancel epic-54
```

---

**Workflow Owner**: @bmad-core-bmad-master
**Module Owner**: @bmad/modules/architecture-remediation
**Reference**: Deep Scan 2026-01-04, ADR-024
