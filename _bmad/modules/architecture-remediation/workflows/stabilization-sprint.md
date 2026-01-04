---
description: 'Foundation Stabilization Sprint - Autonomous iteration cycle for P0 risk elimination and production-ready stability (STAB-24 through STAB-27)'
---

# Stabilization Sprint - Foundation Lock-In Workflow

## Overview

This workflow orchestrates the **8-week Foundation Lock-In Sprint** for achieving production-ready stability. It implements autonomous iteration with validation gates, drift detection, and intelligent agent handoffs.

**Current Health Score**: 68.5/100 (C grade)
**Target Health Score**: 90/100 (A- grade)
**P0 Risks**: 3 → 0 (100% elimination)

---

## Prerequisites

Before starting this workflow:

1. ✅ Epic 53 State Consolidation framework in place
2. ✅ Architecture Remediation Module installed (`_bmad/modules/architecture-remediation/`)
3. ✅ Current `bmm-workflow-status.yaml` reflecting active state
4. ✅ Deep scan results available for validation

---

## Phase 1: Initialize Stabilization Context

### Step 1.1: Load Governance Documents (AUTO)
// turbo
```bash
# Verify all governance files exist
cat bmm-workflow-status.yaml | head -100
cat _bmad-output/sprint-artifacts/sprint-status.yaml | head -50 2>/dev/null || echo "Sprint status needs creation"
```

### Step 1.2: Load Architecture Remediation Module
```bash
# Review module configuration
cat _bmad/modules/architecture-remediation/config/priorities.yaml | head -100
cat _bmad/modules/architecture-remediation/config/thresholds.yaml | head -50
```

### Step 1.3: Create Stabilization Epic Tracking
Generate or update the stabilization epic tracking file at:
`_bmad-output/sprint-artifacts/stab-24-tracking.yaml`

---

## Phase 2: P0 Critical Risk Elimination (Week 1-2)

### Epic STAB-24: Foundation Stabilization

**Duration**: 5-7 days
**Priority**: P0 - CRITICAL
**Team Assignment**: Parallel execution (A + B)

#### Story STAB-24.1: Encrypt localStorage Keys (Team B - Backend)

**Risk**: P0-1 - API keys in plaintext localStorage
**Effort**: 12-16 hours
**Agent**: `@bmad-bmm-dev`

**Tasks**:
1. Audit current localStorage usage for sensitive keys
2. Create encrypted IndexedDB storage utility
3. Migrate `vge-kv3`, `vg-salt-v3`, `vg-vp-v3` from localStorage
4. Add deprecation warning for old storage path
5. Validate zero data loss during migration

**Validation Gate**:
```bash
# No sensitive keys in localStorage
grep -r "localStorage\.(set|get)Item.*key" src/ --include="*.ts" --include="*.tsx" | wc -l
# Expected: 0 matches for API key patterns
```

**Exit Criteria**:
- [ ] AC-1: All API keys stored in encrypted IndexedDB
- [ ] AC-2: Zero localStorage usage for sensitive data
- [ ] AC-3: Migration path tested (old → new)
- [ ] AC-4: Build passes with zero new errors

---

#### Story STAB-24.2: IndexedDB Quota Handling (Team B - Backend)

**Risk**: P0-3 - Silent data loss when quota exceeded
**Effort**: 18-22 hours
**Agent**: `@bmad-bmm-dev`

**Tasks**:
1. Audit all 23 Dexie tables for quota vulnerability
2. Create `QuotaExceededError` handler utility
3. Implement proactive quota monitoring
4. Add user notification for quota warnings
5. Create graceful degradation path
6. Test with simulated quota exhaustion

**Validation Gate**:
```bash
# Verify quota handling exists in Dexie operations
grep -r "QuotaExceededError\|quota" src/infrastructure/persistence/ --include="*.ts" | wc -l
# Expected: >5 matches (quota handling patterns)
```

**Exit Criteria**:
- [ ] AC-1: All Dexie write operations handle quota errors
- [ ] AC-2: User notification UI implemented
- [ ] AC-3: Graceful degradation works (read-only mode)
- [ ] AC-4: Zero data loss scenarios possible

---

#### Story STAB-24.3: Replace Hardcoded Pixels with Design Tokens (Team A - UI)

**Risk**: P0-2 - 86 violations breaking responsive design
**Effort**: 8-12 hours
**Agent**: `@bmad-bmm-dev` or `@bmad-bmm-ux-designer`

**Tasks**:
1. Audit hardcoded pixel values in CSS/Tailwind
2. Create design token system with CSS variables
3. Replace hardcoded values with tokens
4. Test responsive behavior on mobile/tablet/desktop
5. Update style guide documentation

**Validation Gate**:
```bash
# Count hardcoded pixel values (should decrease)
grep -rE "[0-9]+px" src/ --include="*.css" --include="*.tsx" | grep -v ".css.d.ts" | wc -l
# Expected: <20 remaining (intentional fixed sizes only)
```

**Exit Criteria**:
- [ ] AC-1: Design tokens defined in CSS variables
- [ ] AC-2: 86 violations reduced to <20
- [ ] AC-3: Mobile responsive test passes
- [ ] AC-4: Tablet responsive test passes

---

### Phase 2 Validation Gate

After completing all 3 STAB-24 stories:

```bash
# Health score check
echo "Expected: 75/100 minimum"

# P0 risk elimination verification
pnpm exec tsc --noEmit 2>&1 | grep "error TS" | head -10
# Build check
pnpm build

# Runtime smoke test
pnpm dev &
sleep 10
curl -s http://localhost:3000 | grep -q "<!DOCTYPE html>" && echo "✅ Dev server OK"
```

**Phase 2 Complete Criteria**:
- [ ] All 3 P0 risks resolved
- [ ] Health score ≥ 75/100
- [ ] Zero TypeScript errors on modified files
- [ ] All workspaces boot without crashes

---

## Phase 3: Store Consolidation (Week 3-4)

### Epic STAB-25: Store Consolidation & Circular Dependency Resolution

**Duration**: 7-10 days
**Priority**: P1 - HIGH
**Team Assignment**: Team B (State Architecture)

#### Story STAB-25.1: Execute Epic CC-1 (Conversation Consolidation)

**Reference**: `_bmad/modules/architecture-remediation/config/priorities.yaml` → CC-1
**Effort**: 40 hours (split over 2 weeks)
**Agent**: `@bmad-bmm-dev` with `store-refactorer` specialist

**Sub-Workflow**: Load and execute:
```
_bmad/modules/architecture-remediation/workflows/eliminate-god-stores.md
```

**Validation Gate**:
```bash
# Verify god store elimination
wc -l src/lib/state/conversation-store.ts 2>/dev/null || echo "Store consolidated"
# Expected: <120 lines or file moved
```

---

#### Story STAB-25.2: Execute Epic CP-1 (Project Consolidation)

**Reference**: `_bmad/modules/architecture-remediation/config/priorities.yaml` → CP-1
**Effort**: 38 hours
**Agent**: `@bmad-bmm-dev` with `store-refactorer` specialist

**Sub-Workflow**: Load and execute:
```
_bmad/modules/architecture-remediation/workflows/eliminate-god-stores.md
```

---

#### Story STAB-25.3: Break 4 Circular Dependencies

**Risk**: P1-7 - `agents-store.ts` ↔ `provider-store.ts` cycles
**Effort**: 12-16 hours
**Agent**: `@bmad-bmm-architect`

**Tasks**:
1. Map circular dependency graph
2. Introduce event-based decoupling
3. Extract shared types to neutral location
4. Validate import graph is acyclic
5. Update hot-reload validation

**Validation Gate**:
```bash
# Check for circular imports (madge or manual inspection)
grep -r "from.*agents-store" src/lib/state/provider-store.ts 2>/dev/null && echo "❌ Circular dep exists"
grep -r "from.*provider-store" src/lib/state/agents-store.ts 2>/dev/null && echo "❌ Circular dep exists"
# Expected: No output (no cross-imports)
```

---

#### Story STAB-25.4: Complete Epic 53 Facade Cleanup

**Risk**: P1-4 - 6 deprecated facade exports
**Effort**: 6-8 hours
**Agent**: `@bmad-bmm-dev`

**Reference**: ADR-024, State Consolidation Cycle workflow

**Tasks**:
1. Identify all remaining facade re-exports
2. Update consumers to use direct paths
3. Remove deprecated facades
4. Validate no runtime warnings

---

### Phase 3 Validation Gate

```bash
# Health score check
echo "Expected: 80/100 minimum"

# Store duplication check
find src -name "*-store.ts" -exec wc -l {} \; | awk '$1 > 300 {count++} END {print "God stores:", count}'
# Expected: 0 god stores

# Circular dependency check
pnpm build 2>&1 | grep -i "circular" || echo "✅ No circular dependencies"
```

**Phase 3 Complete Criteria**:
- [ ] Zero store duplication (6,500 lines removed)
- [ ] Zero circular dependencies
- [ ] Health score ≥ 80/100
- [ ] Hot-reload works reliably

---

## Phase 4: God File Splitting & Workspace Isolation (Week 5-6)

### Epic STAB-26: God File Elimination & Workspace Boundaries

**Duration**: 10-14 days
**Priority**: P1 - HIGH
**Team Assignment**: Both (A + B coordinated)

#### Story STAB-26.1: Split 7 God Files

**Risk**: P1-1 - Files up to 18,541 lines (154x standard)
**Effort**: 40-60 hours
**Agent**: `component-splitter` from architecture-remediation module

**Files to Split**:
1. `orama-index.ts` (18,541 → 12 files, ~1,500 lines each)
2. `query-optimizer.ts` (15,486 → 10 files)
3. `document-chunker.ts` (16,475 → 11 files)
4. `embedding-service.ts` (14,962 → 9 files)
5. `transformers-loader.ts` (9,961 → 7 files)
6. `workspace-execution-context.ts` (5,129 → 5 files)
7. `rag-store.ts` (1,595 → 3 files)

**Sub-Workflow**:
```
_bmad/modules/architecture-remediation/workflows/normalize-components.md
```

---

#### Story STAB-26.2: Migrate 31 Workspace Components

**Risk**: P1-3 - Workspace provider duplication
**Effort**: 6-8 hours
**Agent**: `workspace-architect` from architecture-remediation module

**Sub-Workflow**:
```
_bmad/modules/architecture-remediation/workflows/workspace-file-system-e2e.md
```

---

#### Story STAB-26.3: Fix 127 Cross-Workspace Import Violations

**Risk**: P1-4 - Breaking workspace boundaries
**Effort**: 16-20 hours
**Agent**: `typescript-fixer` from architecture-remediation module

**Tasks**:
1. Create ESLint rule for workspace boundaries
2. Identify all cross-workspace imports
3. Refactor to use workspace-agnostic patterns
4. Enable ESLint rule enforcement

---

#### Story STAB-26.4: Consolidate Dual Event Bus Architecture

**Risk**: P1-2 - Unused infrastructure causing confusion
**Effort**: 12-16 hours
**Agent**: `@bmad-bmm-architect`

**Tasks**:
1. Audit both event bus implementations
2. Identify active vs. legacy patterns
3. Migrate to single event bus
4. Remove legacy infrastructure
5. Update documentation

---

### Phase 4 Validation Gate

```bash
# File size check
find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | awk '$1 > 300 {print $0}' | wc -l
# Expected: 0 files over 300 lines

# Workspace isolation check
grep -r "from '@/presentation/components/ide'" src/presentation/components/knowledge/ 2>/dev/null | wc -l
# Expected: 0 cross-workspace imports
```

**Phase 4 Complete Criteria**:
- [ ] All files <300 lines
- [ ] Workspace isolation enforced (0 violations)
- [ ] Single event bus architecture
- [ ] Health score ≥ 85/100

---

## Phase 5: Performance & Polish (Week 7-8)

### Epic STAB-27: Performance & UX Polish

**Duration**: 7-10 days
**Priority**: P1-P2
**Team Assignment**: Team A (Performance Focus)

#### Story STAB-27.1: Add React.memo to List Components

**Effort**: 8-12 hours
**Impact**: Reduces re-renders by 70%

---

#### Story STAB-27.2: Fix WorkspaceContext Re-renders

**Effort**: 4-6 hours
**Impact**: Prevents unnecessary re-renders

---

#### Story STAB-27.3: Virtualize Long Lists

**Effort**: 12-16 hours
**Impact**: Smooth scrolling at scale (10,000+ items)

---

#### Story STAB-27.4: Replace console.log with safeLog

**Effort**: 1-2 hours
**Impact**: Production log safety

---

#### Story STAB-27.5: Accessibility Improvements

**Effort**: 9-11 hours
**Impact**: WCAG 2.1 AA compliance

---

### Final Validation Gate

```bash
# Full validation suite
pnpm tsc --noEmit
pnpm build
pnpm test

# Health score calculation
echo "Target: 90/100 (A- grade)"

# Performance check (optional)
# pnpm lighthouse --url=http://localhost:3000
```

**Sprint Complete Criteria**:
- [ ] 50+ components memoized
- [ ] Zero console.log in production
- [ ] WCAG 2.1 AA compliance >90%
- [ ] Virtualized lists handle 10,000+ items
- [ ] Health score reaches 90/100 (A- grade)

---

## Autonomous Iteration Protocol

This workflow supports autonomous iteration with the following patterns:

### Drift Detection
After each story completion, validate:
1. TypeScript error count unchanged or decreased
2. Build passes successfully
3. No new console warnings in development
4. Health score improved or maintained

### Error Recovery
If a story introduces regression:
1. Revert changes for the story
2. Analyze root cause
3. Create hotfix story
4. Resume from clean state

### Context Preservation
After each story:
1. Update `sprint-status.yaml` with completion
2. Update `bmm-workflow-status.yaml` with notes
3. Create story completion artifact
4. Handoff to next story or agent

---

## Agent Handoff Protocol

### Handoff to Specialist Agent

```yaml
handoff_template:
  from_agent: "@bmad-core-bmad-master"
  to_agent: "{specialist_agent}"
  task: "{story_id}: {story_title}"
  context_files:
    - "_bmad/modules/architecture-remediation/config/priorities.yaml"
    - "_bmad-output/sprint-artifacts/stab-24-tracking.yaml"
  acceptance_criteria: "{story_acs}"
  output_location: "_bmad-output/sprint-artifacts/{story_id}-completion.md"
  return_via: "Report to @bmad-core-bmad-master with completion summary"
```

### Completion Report Template

```yaml
completion_report:
  agent: "{agent_slug}"
  story_id: "{story_id}"
  status: "DONE|BLOCKED|NEEDS_REVIEW"
  artifacts_created:
    - "{artifact_path}"
  validation_results:
    typescript_errors: 0
    build_passed: true
    tests_passed: true
  next_action: "Continue to {next_story_id}"
```

---

## Module Dependencies

This workflow integrates with:

1. **Architecture Remediation Module**
   - `_bmad/modules/architecture-remediation/agents/`
   - `_bmad/modules/architecture-remediation/workflows/`

2. **Governance Documents**
   - `bmm-workflow-status.yaml`
   - `_bmad-output/sprint-artifacts/sprint-status.yaml`

3. **BMAD Core**
   - `_bmad/core/tasks/workflow.xml`
   - `_bmad/bmm/workflows/4-implementation/correct-course/`

---

**Workflow Owner**: @bmad-core-bmad-master
**Created**: 2026-01-04
**Status**: ACTIVE - READY FOR EXECUTION
