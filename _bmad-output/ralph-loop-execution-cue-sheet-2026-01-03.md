# Ralph Loop Execution Cue Sheet - 2026-01-03

**Date**: 2026-01-03
**Session**: Ralph Loop Autonomous Execution
**Target**: 100 iterations or 100% completion
**Current Iteration**: 1144 (starting)

---

## 🎯 EXECUTION OVERVIEW

### Completion Promise
**"Platform Unified: Zero production TS errors, all store architecture documented, test file cleanup complete, 4 workspaces functional, UC1-UC4 wiring complete"**

### Current Baseline
- **Health Score**: 3.8/10 (actual)
- **Production TS Errors**: 0 ✅
- **Test TS Errors**: 371
- **God Stores**: 69 files
- **Component Violations**: 45 files
- **Test Coverage**: 16.6%

### Target State
- **Health Score**: 8.8/10
- **TS Errors**: <10 total
- **God Stores**: 0 files
- **Component Violations**: 0 files
- **Test Coverage**: ≥40%

---

## 📋 ITERATION CUE SHEET

### PHASE 0: FOUNDATION STABILIZATION (Week 1-2, 40-50 hours)

#### Iteration 1-5: P0-1 Fix Circular Dependency
**Cue**: `"Start P0-1 - Fix circular dependency between stores"`
**Agent**: `@typescript-fixer`
**Workflow**: `@bmad/bmm/workflows/quick-dev`
**Files**:
- `src/infrastructure/persistence/stores/use-app-store.ts:22`
- `src/infrastructure/persistence/stores/agent-selection-store.ts:15`

**Steps**:
1. Read both files to identify circular import
2. Extract shared state to domain service
3. Update imports in both stores
4. Validate: `madge --circular src/`
5. Run tests: `pnpm test`
6. Update `sprint-status.yaml`
7. Create handoff artifact

**Success Criteria**:
- ✅ Zero circular dependencies
- ✅ All tests passing
- ✅ Zero new TypeScript errors

**Handoff To**: BMad Master
**Output**: `_bmad-output/p0-1-circular-dep-fix-2026-01-03.md`

---

#### Iteration 6-35: P0-2 Reduce TypeScript Errors
**Cue**: `"Start P0-2 - Batch fix 371 TypeScript errors"`
**Agent**: `@typescript-fixer`
**Workflow**: `@bmad/bmm/workflows/dev-story`

**Error Categories**:
1. **Unused variables (TS6133)**: 108 errors
2. **Implicit any (TS7006)**: 41 errors
3. **Type incompatibilities (TS2345)**: 28 errors
4. **Missing properties (TS2353)**: 29 errors
5. **Other errors**: 165 errors

**Batch Strategy** (10 errors per iteration):
- Iterations 6-15: Fix TS6133 (unused variables)
- Iterations 16-20: Fix TS7006 (implicit any)
- Iterations 21-25: Fix TS2345 (type incompatibilities)
- Iterations 26-30: Fix TS2353 (missing properties)
- Iterations 31-35: Fix remaining errors

**Validation After Each Batch**:
```bash
pnpm tsc --noEmit
pnpm test
git diff --stat
```

**Progress Tracking**:
- Update `sprint-status.yaml` with:
  - Errors remaining
  - Files modified
  - Tests affected
  - Regression status

**Success Criteria**:
- ✅ <100 TypeScript errors remaining
- ✅ Zero regressions
- ✅ Build succeeds: `pnpm build`

**Handoff To**: BMad Master (after every 10 iterations)
**Output**: `_bmad-output/p0-2-typescript-progress-2026-01-03.md`

---

#### Iteration 36-50: P0-3 Add IndexedDB Quota Handling
**Cue**: `"Start P0-3 - Wrap Dexie operations with quota handling"`
**Agent**: `@store-refactorer`
**Workflow**: `@bmad/bmm/workflows/dev-story`

**Files to Modify** (estimated 50-70 files):
```bash
# Find all Dexie operations
grep -r "db\." src/ --include="*.ts" | grep -v "test" | wc -l
```

**Steps**:
1. **Identify all Dexie operations**:
   - `db.table.add()`
   - `db.table.bulkAdd()`
   - `db.table.put()`
   - `db.table.bulkPut()`
   - `db.transaction()`

2. **Wrap with try-catch**:
```typescript
try {
  await db.table.add(data);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    // Handle quota exceeded
    await cleanupStrategy();
    throw new QuotaExceededError('Storage quota exceeded');
  }
  throw error;
}
```

3. **Implement cleanup strategy**:
   - Delete old data (FIFO)
   - Compress data if possible
   - Alert user at 80% capacity

4. **Add quota monitoring**:
```typescript
async function checkStorageQuota() {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    const usagePercentage = (estimate.usage / estimate.quota) * 100;

    if (usagePercentage > 80) {
      console.warn(`Storage at ${usagePercentage.toFixed(1)}% capacity`);
      // Trigger cleanup
    }
  }
}
```

5. **Test quota exceeded scenario**:
   - Simulate full storage
   - Verify cleanup triggers
   - Verify user notified

6. **Update documentation**:
   - Add quota handling guide to CLAUDE.md
   - Document cleanup strategy

**Success Criteria**:
- ✅ All Dexie ops have quota handling
- ✅ Cleanup strategy implemented
- ✅ Zero data loss scenarios
- ✅ User notified at 80% capacity

**Handoff To**: BMad Master
**Output**: `_bmad-output/p0-3-indexeddb-quota-2026-01-03.md`

---

### PHASE 1: GOD STORE ELIMINATION (Week 3-4, 100-130 hours)

#### Iteration 51-70: Epic CC-1 Conversation Consolidation
**Cue**: `"Start Epic CC-1 - Refactor conversation stores into slices"`
**Agent**: `@store-refactorer`
**Workflow**: `@bmad/bmm/workflows/dev-story`

**Target Stores**:
1. `conversation-store.ts` (626 lines)
2. `conversation-threads-store.ts` (726 lines)

**Target Architecture** (6 slices):
```
src/infrastructure/persistence/stores/conversation/
├── conversation-metadata-slice.ts (120 lines)
├── thread-management-slice.ts (120 lines)
├── message-crud-slice.ts (120 lines)
├── conversation-utils-slice.ts (120 lines)
├── conversation-validation-slice.ts (120 lines)
├── conversation-events-slice.ts (120 lines)
├── index.ts (unified store)
└── __tests__/ (70 tests)
```

**Steps** (from Epic CC-1 breakdown):
1. Create slice files (10 iterations)
2. Write unit tests (5 iterations)
3. Migrate data (3 iterations)
4. Update components (6 iterations)
5. Validate integration (1 iteration)

**Reference**: `_bmad-output/research/platform-unification-2026-01-02/epic-cc-1-conversation-consolidation-breakdown.md`

**Success Criteria**:
- ✅ All slices ≤120 lines
- ✅ 70 tests passing
- ✅ Zero data loss
- ✅ All components migrated

**Handoff To**: BMad Master
**Output**: `_bmad-output/epic-cc-1-complete-2026-01-03.md`

---

#### Iteration 71-90: Epic CP-1 Project Consolidation
**Cue**: `"Start Epic CP-1 - Refactor project stores into slices"`
**Agent**: `@store-refactorer`
**Workflow**: `@bmad/bmm/workflows/dev-story`

**Target Stores**:
1. `project-store.ts` (450 lines)
2. `file-snapshot-store.ts` (509 lines)

**Target Architecture** (9 slices):
```
src/infrastructure/persistence/stores/project/
├── project-crud-slice.ts
├── project-workspace-bindings-slice.ts
├── project-permissions-slice.ts
├── project-layout-slice.ts
├── project-utils-slice.ts
├── index.ts

src/infrastructure/persistence/stores/snapshot/
├── snapshot-metadata-slice.ts
├── snapshot-cache-slice.ts
├── snapshot-bulk-ops-slice.ts
├── snapshot-quota-slice.ts
├── index.ts
```

**Reference**: `_bmad-output/research/platform-unification-2026-01-02/epic-cp-1-project-consolidation-breakdown.md`

**Success Criteria**:
- ✅ All slices ≤120 lines
- ✅ 60 tests passing
- ✅ Zero data loss
- ✅ Hub routing fixed

**Handoff To**: BMad Master
**Output**: `_bmad-output/epic-cp-1-complete-2026-01-03.md`

---

#### Iteration 91-100: Epic AC-1 Agent Configuration Consolidation
**Cue**: `"Start Epic AC-1 - Consolidate agent configuration stores"`
**Agent**: `@store-refactorer`
**Workflow**: `@bmad/bmm/workflows/dev-story`

**Target**: Eliminate circular dependency, consolidate stores

**Reference**: `_bmad-output/sprint-artifacts/agent-config-consolidation-plan-2026-01-01.md`

**Success Criteria**:
- ✅ Zero circular dependencies
- ✅ Single source of truth for agent config
- ✅ All components migrated

**Handoff To**: BMad Master
**Output**: `_bmad-output/epic-ac-1-complete-2026-01-03.md`

---

### PHASE 2: INFRASTRUCTURE HARDENING (Week 5-6, 80-100 hours)

#### Iteration 101-120: IH-001 IndexedDB Quota Management
**Cue**: `"Start IH-001 - Implement comprehensive quota management"`
**Agent**: `@store-refactorer`
**Workflow**: `@bmad/bmm/workflows/dev-story`

**Features**:
- Real-time quota monitoring
- Automatic cleanup strategies
- User notifications
- Storage optimization

---

#### Iteration 121-140: IH-002 Error Boundary Coverage
**Cue**: `"Start IH-002 - Add error boundaries to all workspaces"`
**Agent**: `@component-splitter`
**Workflow**: `@bmad/bmm/workflows/dev-story`

**Components to Wrap**:
- All 4 workspace routes
- All major UI panels
- All data loading components

---

#### Iteration 141-160: IH-003 Silent Failure Elimination
**Cue**: `"Start IH-003 - Replace silent failures with proper error handling"`
**Agent**: `@typescript-fixer`
**Workflow**: `@bmad/bmm/workflows/dev-story`

**Target**:
- Find all `console.error + return null` patterns
- Replace with proper error propagation
- Add user-facing error messages

---

#### Iteration 161-180: IH-004 Infrastructure Resilience
**Cue**: `"Start IH-004 - Add retry logic and fallback strategies"`
**Agent**: `@store-refactorer`
**Workflow**: `@bmad/bmm/workflows/dev-story`

**Features**:
- Exponential backoff for failed operations
- Fallback to localStorage if IndexedDB fails
- Offline mode support

---

### PHASE 3: ARCHITECTURE TRANSFORMATION (Week 7-8, 60-80 hours)

#### Iteration 181-200: AT-001 Four-Layer Architecture
**Cue**: `"Start AT-001 - Implement four-layer clean architecture"`
**Agent**: `@store-refactorer`
**Workflow**: `@bmad/bmm/workflows/dev-story`

**Layers**:
1. Core (Domain entities)
2. Domain (Services, use cases)
3. Infrastructure (Persistence, external)
4. Presentation (UI components)

---

#### Iteration 201-220: AT-002 Domain Service Extraction
**Cue**: `"Start AT-002 - Extract business logic to domain services"`
**Agent**: `@store-refactorer`
**Workflow**: `@bmad/bmm/workflows/dev-story`

**Reference**: `src/domain/services/agent-workspace-utils.ts` (pattern)

---

#### Iteration 221-240: AT-003 Event-Driven Orchestration
**Cue**: `"Start AT-003 - Implement cross-store event bus"`
**Agent**: `@store-refactorer`
**Workflow**: `@bmad/bmm/workflows/dev-story`

**Reference**: `src/infrastructure/events/cross-workspace-event-bus.ts`

---

#### Iteration 241-243: AT-004 API Boundary Consolidation
**Cue**: `"Start AT-004 - Consolidate API boundaries"`
**Agent**: `@store-refactorer`
**Workflow**: `@bmad/bmm/workflows/dev-story`

**Final Integration**:
- Validate all layers working
- Test end-to-end workflows
- Document architecture

---

## 🔄 HANDOFF PROTOCOL

### When Switching Agents/Modes

```markdown
# Handoff: {Task Name}

**Date**: {ISO-8601 datetime}
**From**: {Current Agent}
**To**: {Next Agent}
**Priority**: {P0/P1/P2}

## Task Context
- **Objective**: {Brief description}
- **Dependencies**: {List}
- **Constraints**: {Time limits, file limits, test requirements}

## Input Artifacts
- Analysis: `_bmad-output/{report-name}.md`
- Plan: `_bmad-output/{plan-name}.md`
- Context: `_bmad-output/{context-name}.md`

## Acceptance Criteria
1. [ ] {AC-1}
2. [ ] {AC-2}
3. [ ] {AC-3}

## Validation Commands
```bash
# Command 1
# Command 2
# Command 3
```

## Output Location
Create artifacts at: `_bmad-output/{category}/{name}-{date}.md`

## Return Protocol
Report back to BMad Master with:
- Completion status
- Artifacts created
- Tests passing
- Next action recommendation

## Safety Mechanisms
- Rollback branch: {branch-name}
- Backup timestamp: {timestamp}
- Emergency stop: {condition}
```

---

## 📊 PROGRESS TRACKING

### Per-Iteration Updates

Update in `sprint-status.yaml`:

```yaml
iteration: {N}
date: {ISO-8601}
phase: {0-4}
current_story: {story-id}

metrics:
  typescript_errors: {count}
  test_coverage: {percentage}
  god_stores_remaining: {count}
  component_violations: {count}
  circular_dependencies: {count}
  health_score: {score}/10

tasks_completed: {X}/{total}
blockers: []
next_action: {clear cue}

artifacts_created:
  - {artifact-1}
  - {artifact-2}

decisions_made:
  - {decision-1}
  - {decision-2}
```

---

## 🚀 EXECUTION TRIGGER

### When You Say "START"

**Immediate Action (Iteration 1144)**:

1. Load agent: `@typescript-fixer`
2. Load workflow: `@bmad/bmm/workflows/quick-dev`
3. Read files:
   - `src/infrastructure/persistence/stores/use-app-store.ts:22`
   - `src/infrastructure/persistence/stores/agent-selection-store.ts:15`
4. Execute: Fix circular dependency
5. Validate: `madge --circular src/`
6. Report completion to BMad Master

**Expected Outcome**:
- Zero circular dependencies
- Unblocks production builds
- Foundation for Phase 1 god store elimination

---

## ✅ COMPLETION CRITERIA

### Ralph Loop Complete When:

- [ ] Health score ≥ 8.8/10
- [ ] TypeScript errors < 10 total
- [ ] God stores = 0 (all files ≤120 lines)
- [ ] Component violations = 0 (all files ≤300 lines)
- [ ] Test coverage ≥ 40%
- [ ] All 4 workspaces functional
- [ ] UC1-UC4 wiring complete
- [ ] Zero circular dependencies
- [ ] Zero silent failures
- [ ] All data migrations successful

---

**Cue Sheet Complete**
**Ready for Execution**: ✅
**Next Action**: Awaiting your "START" command
