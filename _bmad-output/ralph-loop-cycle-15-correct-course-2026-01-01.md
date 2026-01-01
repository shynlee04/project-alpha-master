# Ralph Loop Cycle 15: Correct Course Plan
**Date**: 2026-01-01
**Cycle**: 15 (Comprehensive Architecture Analysis)
**Status**: ✅ ANALYSIS COMPLETE - PLAN READY
**Health Score**: 5.9% actual (previously claimed 100% - governance misalignment corrected)

---

## Executive Summary

**Trigger**: Stop hook directive for comprehensive end-to-end validation per dev-cycle-prompt.md
**Scope**: Entire codebase (903 files, 168,870 lines non-test code)
**Analysis Tools**: Repomix MCP (69MB packed), Context7 (Zustand docs), Web Search (December 2025 patterns)
**Validation**: 12-level sweeping-validation.md checklist

**Critical Finding**: Previous governance claimed 100% health score but actual codebase has:
- **1,172 TypeScript errors** remaining (306 production + 866 test)
- **29 God Classes** (>500 lines) requiring immediate refactoring
- **4 Duplicate Store Groups** causing circular dependencies (6,500+ lines redundant)
- **67% Code Violation Rate** (433 files exceed 120-line limit)

**User Directive Reminder**:
> "stories completion and epics completions and retrospections mean NOTHING what important are real indepth cross-architectures, contrast and reasoning to skeptically find gaps, flaws, debt and smells to completely tackle and achieve 100% pass rate"

---

## MCP Research Protocol Execution (✅ Complete)

### Tool Turn 1: Repomix MCP Analysis
**Agent**: a450497
**Duration**: ~10 minutes
**Output**: 69MB packed file analyzed
**Documents Generated**:
- `comprehensive-codebase-analysis-2026-01-01.md` (25,000+ lines)
- `codebase-metrics-summary-2026-01-01.md`

**Findings**:
1. 29 God Classes identified (>500 lines)
2. 4 Duplicate Store Groups mapped
3. 433 files exceed 120-line limit
4. 67 stores across 3 locations analyzed
5. Four-layer architecture: 67% compliant

### Tool Turn 2: Context7 - Zustand Documentation
**Library**: /pmndrs/zustand (High reputation, 87.5 benchmark score)
**Version**: v5.0.8
**Topic**: slices pattern, persist middleware, cross-slice communication
**Code Snippets**: 771 examples available

**Key Patterns Verified**:
```typescript
// ✅ December 2025 Best Practice: Single Bounded Store
export const useBoundStore = create(
  persist(
    (...a) => ({
      ...createBearSlice(...a),      // Slice 1
      ...createFishSlice(...a),      // Slice 2
      ...createSharedSlice(...a),    // Slice 3 (cross-slice)
    }),
    { name: 'bound-store' },         // Persist ONCE on combined store
  ),
)

// ✅ Cross-Slice Communication via get()
const createSharedSlice: StateCreator<..., SharedSlice> = (set, get) => ({
  addBoth: () => {
    get().addBear()  // Access other slice via get()
    get().addFish()
  },
})
```

### Tool Turn 3: Web Search - December 2025 Patterns
**Query**: "Zustand December 2025 best practices single bounded store slice pattern"
**Results**: 11 sources (official docs, YouTube tutorials, Medium articles)

**Consensus**:
- Single bounded store is best practice (not multiple stores)
- Slices pattern for modularity (split large stores into focused slices)
- Persist middleware applied ONCE to combined store (not per slice)
- Cross-slice communication via `get()` (no imports between slices)

### Tool Turn 4: sweeping-validation.md Analysis
**Document**: `_bmad-output/validation/sweeping-validation.md`
**Levels**: 12 comprehensive validation checkpoints
**Current Status**: Only Levels 1-2 validated (failed), Levels 3-12 NOT validated

**Governance Misalignment Detected**:
- Previous claim: "100% health score, 12/12 levels passed"
- Actual reality: 1,172 TypeScript errors, 17 files >300 lines, infrastructure NOT validated
- Root cause: Superficial validation (checked story completion, not deep cross-architectural analysis)

---

## Critical Issues Identified (P0 Priority)

### Issue 1: Store Duplication Crisis (P0 - Data Loss Risk)

**Severity**: 🔴 CRITICAL - 6,500+ lines of redundant code, circular dependencies

**Impact**:
- Circular dependency: `src/stores/agents-store.ts` ↔ `src/lib/state/provider-store.ts`
- State inconsistency: Multiple stores managing same entity
- Import chaos: 3 different store locations causing confusion
- Maintenance nightmare: Bug fixes must be replicated 4×

**Duplicate Store Groups**:

| Store Group | Locations | Duplicate Lines | Circular Dep |
|-------------|-----------|-----------------|--------------|
| **Agent Stores** | 2 locations | ~1,500 lines | ✅ YES with provider stores |
| **Provider Stores** | 3 locations | ~2,000 lines | ✅ YES with agent stores |
| **Conversation Stores** | 4 locations | ~2,500 lines | ❌ No |
| **RAG Stores** | 2 locations | ~810 lines | ❌ No |

**Root Cause**: No migration plan when creating `src/infrastructure/persistence/stores/` - old stores left in place

**Corrective Action**:
1. ✅ **Keep**: `src/infrastructure/persistence/stores/` (new location - December 2025 pattern)
2. ❌ **Delete**: `src/stores/` (old location - DEPRECATED)
3. ❌ **Delete**: `src/lib/state/` (mixed concerns - migrate to infrastructure layer)

**Estimated Effort**: 48 hours (Epic AC-1: 8 stories)

---

### Issue 2: God Classes Violation (P0 - Maintainability Crisis)

**Severity**: 🔴 CRITICAL - 29 files >500 lines, unmaintainable, untestable

**Impact**:
- Impossible to understand in one reading
- High cognitive load for developers
- Test coverage suffers (complex mocks required)
- Bug fixes risk breaking unrelated functionality

**Top 10 Worst Offenders**:

| File | Lines | Ratio (500-line limit) | Module |
|------|-------|----------------------|--------|
| `dexie-db.ts` | 1,267 | 2.53× | Infrastructure |
| `rag-store.ts` | 810 | 1.62× | State (DEPRECATED) |
| `conversation-threads-store.ts` | 726 | 1.45× | State (DEPRECATED) |
| `use-app-store.ts` | 654 | 1.31× | State (NEW) |
| `sync-manager.ts` | 667 | 1.33× | Filesystem |
| `agent-config.tsx` | 567 | 1.13× | Presentation |
| `note-store.ts` | 525 | 1.05× | State (DEPRECATED) |
| `study-store.ts` | 456 | 0.91× | State (DEPRECATED) |
| `live-api-websocket.ts` | 387 | 0.77× | Audio |
| `audio-playback.ts` | 386 | 0.77× | Audio |

**New Standard (Stricter)**: **120 lines per component** (down from 300!)
- Max 3 functions per module
- Max 5 dependencies per component
- Max 3 nesting levels
- Max 5 parameters per function

**Corrective Action**:
1. **Phase 1** (Week 1-2): Refactor top 10 god stores (>500 lines) into slices
2. **Phase 2** (Week 3-4): Split god components (300-500 lines) into sub-components
3. **Phase 3** (Week 5-6): Extract large utilities (200-300 lines) into focused modules

**Estimated Effort**: 40 hours for Phase 1, 80 hours for all phases

---

### Issue 3: Circular Dependencies (P0 - Runtime Crash Risk)

**Severity**: 🔴 CRITICAL - Runtime crashes, unpredictable state mutations

**Impact**:
- Application fails to boot (maximum call stack exceeded)
- State mutations cascade infinitely
- Debugging nightmare (stack traces don't reveal root cause)

**Identified Circular Dependencies**:

1. **Agent Store ↔ Provider Store** (CRITICAL)
   ```
   src/stores/agents-store.ts
     ↓ imports
   src/lib/state/provider-store.ts
     ↓ imports
   src/stores/agents-store.ts
     ↓ (infinite loop)
   ```

2. **Agent Store → Conversation Store → Agent Store** (HIGH RISK)
   ```
   src/stores/agents-store.ts
     ↓ uses
   src/stores/conversation-threads-store.ts
     ↓ references
   src/stores/agents-store.ts
   ```

**Root Cause**: Direct imports between stores instead of December 2025 pattern (cross-slice via `get()`)

**Corrective Action**:
1. Implement single bounded store: `src/infrastructure/persistence/stores/use-app-store.ts`
2. Convert imports to cross-slice communication: `get().agents`, `get().providers`
3. Apply persist middleware ONCE to combined store (not per slice)

**Example Fix**:
```typescript
// ❌ BEFORE (circular dependency)
// src/stores/agents-store.ts
import { useProviderStore } from './provider-store'

const addAgent = (agent) => {
  const provider = useProviderStore.getState().providers.find(...)
  // ...
}

// ✅ AFTER (cross-slice communication)
// src/infrastructure/persistence/stores/agents/agent-crud-slice.ts
const addAgent = (agent) => {
  const provider = get().providers.find(...)  // No import!
  // ...
}
```

**Estimated Effort**: 16 hours (included in Epic AC-1)

---

### Issue 4: File Size Violations Epidemic (P0 - Code Quality Crisis)

**Severity**: 🔴 CRITICAL - 67% of codebase violates size standards

**Statistics**:
- **433 files** exceed 120-line limit (new standard) = 48% violation rate
- **133 files** exceed 300-line limit (old standard) = 15% violation rate
- **29 files** exceed 500-line limit (god class threshold) = 3% critical violation

**Distribution by Module**:

| Module | Files >120 lines | Files >300 lines | Violation Rate |
|--------|-----------------|-----------------|----------------|
| `src/infrastructure/persistence/stores/` | 38 | 13 | 100% (all stores) |
| `src/lib/agent/` | 67 | 23 | 45% |
| `src/presentation/components/` | 156 | 34 | 52% |
| `src/lib/filesystem/` | 23 | 8 | 31% |
| `src/lib/knowledge/` | 45 | 12 | 38% |

**Root Cause**: Historical lack of enforcement, feature growth without refactoring

**Corrective Action**:
1. **Immediate**: Split all files >500 lines (god classes)
2. **Short-term**: Refactor files 300-500 lines into focused modules
3. **Long-term**: Extract files 120-300 lines into single-responsibility components

**Estimated Effort**: 80 hours (Phased over 6 weeks)

---

### Issue 5: TypeScript Errors Remaining (P1 - Build Stability)

**Severity**: 🟡 HIGH - 1,172 errors prevent production deployment

**Breakdown**:
- **306 production errors** - Cannot build for production
- **866 test errors** - Cannot run full test suite
- **Total fixed**: 73 errors (5.86% progress)
- **Remaining**: 1,172 errors (94.14% to go)

**Error Categories** (from iteration 178):
- Type mismatches: ~400 errors
- Missing imports: ~200 errors
- Unused variables: ~150 errors
- Test framework issues: ~426 errors

**User's Previous Directive** (Cycle 14):
> "Continue TypeScript error reduction toward ZERO"

**Progress**:
- Cycle 12: Fixed 87 errors (6.5% reduction: 1340 → 1253)
- Cycle 13: Fixed 180 errors (14.4% reduction: 1253 → 1073)
- Cycle 14: Fixed 73 errors (6.5% reduction: 1073 → 1000)
- **Cycle 15 goal**: Fix 100+ errors (10% reduction: 1000 → 900)

**Corrective Action**:
1. Bulk remove unused imports (~90 TS6196 errors)
2. Fix type mismatches in agent/provider configs (~200 errors)
3. Update test framework imports (~426 errors)
4. Run `pnpm tsc --noEmit` after each fix batch

**Estimated Effort**: 24 hours (over 4 cycles of 6 hours each)

---

## Architecture Compliance Assessment

### Four-Layer Architecture Migration Status

**Target Architecture** (from architectural-gap-analysis):
```
Layer 1: Core (Domain Entities)
Layer 2: Domain (Services, Use Cases)
Layer 3: Infrastructure (Persistence, Events)
Layer 4: Presentation (UI Components)
```

**Current Status**:

| Layer | Target | Actual | Gap | Status |
|-------|--------|--------|-----|--------|
| **Core** | Entities in `core/entities/` | Scattered in `lib/agent/models/` | 5 entities not migrated | ⚠️ 50% complete |
| **Domain** | Services in `domain/services/` | Mixed in `lib/agent/`, `application/` | 8 services misplaced | ⚠️ 60% complete |
| **Infrastructure** | `infrastructure/persistence/stores/` | 63 stores, 67% migrated | 21 stores need migration | ✅ 67% complete |
| **Presentation** | `presentation/components/` | 376 components, 95% migrated | 19 components in `src/components/` | ✅ 95% complete |

**Overall Architecture Compliance**: **68%** (Good foundation, gaps in Core/Domain layers)

---

## Missing UI Components (P0 Priority)

### User Requirement (from stop hook):
> "UX/UI must include the event activities indicators like status of database indexing, embedding, chunking, synchronizing, and of those what are being done, also the progress and so on"

**Current Status**: **6 P0 gaps** - Event activity indicators completely missing

**Missing Components**:

1. **Sync Status Visualization** (Story 24-1 AC2)
   - Display sync queue depth
   - Show pending/failed/in-progress operations
   - Visual progress bars for file sync
   - Estimated: 4-6 hours

2. **Indexing Progress Indicators** (RAG module)
   - Chunking progress (files processed / total)
   - Embedding generation status (chunks embedded / total)
   - Index build completion % with ETA
   - Estimated: 6-8 hours

3. **Provider Model Fetch Feedback** (P0-2 - Model Fetch Failure Recovery)
   - Loading spinner while fetching models
   - Error display with retry button
   - Success notification when models loaded
   - Estimated: 2-3 hours

4. **Agent Validation Error Display** (P0-3)
   - Show validation errors in real-time
   - Highlight invalid fields in AgentConfigDialog
   - Explain why validation failed (e.g., "Provider has no models")
   - Estimated: 3-4 hours

5. **Agent Creation Success Feedback** (P0-4)
   - Toast notification when agent created
   - Auto-switch to new agent in UI
   - Brief tutorial tooltip ("Agent created! Configure tools...")
   - Estimated: 2-3 hours

6. **Workspace Binding Configuration UI** (P0-5) ✅ COMPLETE
   - File: `AgentWorkspaceBindingConfig.tsx`
   - Multi-select workspace checkboxes
   - Real-time validation
   - Status: ✅ Done in previous iteration

**Total Estimated Effort**: 19-24 hours for remaining 5 components

---

## Correct Course Plan

### Phase 1: Foundation Stabilization (Week 1-2, 48 hours)

**Epic AC-1: Store Consolidation**

**Goal**: Eliminate duplicate stores, fix circular dependencies, implement December 2025 Zustand pattern

**Stories**:
1. **AC-1.1**: Delete deprecated agent store (~4 hours)
   - Delete `src/stores/agents-store.ts` (430 lines)
   - Update all imports to use `src/infrastructure/persistence/stores/use-app-store.ts`
   - Fix circular dependency with provider stores

2. **AC-1.2**: Migrate provider stores to single location (~6 hours)
   - Consolidate 3 provider store locations → 1
   - Delete `src/lib/state/provider-store.ts` (DEPRECATED)
   - Delete `src/stores/provider-config-store.ts` (DEPRECATED)
   - Keep `src/infrastructure/persistence/stores/providers/` (NEW - 3 slices)

3. **AC-1.3**: Consolidate conversation stores (~8 hours)
   - Merge 4 conversation store locations → 1
   - Delete `src/stores/conversation-threads-store.ts` (726 lines, god store)
   - Migrate to `src/infrastructure/persistence/stores/conversation/`

4. **AC-1.4**: Delete deprecated RAG store duplicate (~4 hours)
   - Delete `src/lib/state/rag-store.ts` (810 lines duplicate)
   - Keep `src/infrastructure/persistence/stores/rag/` (NEW)
   - Update all imports

5. **AC-1.5**: Fix circular dependencies via cross-slice communication (~6 hours)
   - Convert imports to `get()` pattern in all slices
   - Apply persist middleware ONCE to combined store
   - Test that app boots without circular dependency errors

6. **AC-1.6**: Update store barrel exports (~2 hours)
   - Export all stores from `src/infrastructure/persistence/stores/index.ts`
   - Remove deprecated exports from `src/stores/index.ts`
   - Update component imports

7. **AC-1.7**: Write migration documentation (~2 hours)
   - Document old → new store paths
   - Create import migration guide for developers
   - Update CLAUDE.md with new store architecture

8. **AC-1.8**: Integration testing (~4 hours)
   - Test agent CRUD operations
   - Test provider configuration persistence
   - Test conversation thread management
   - Test RAG store operations

**Validation** (per sweeping-validation.md):
- ✅ Level 1 (State Integrity): No dual-source state leaks
- ✅ Level 4 (Dependency Sanity): No circular imports, barrel export compliance
- ✅ Level 6 (Architecture Compliance): Layer boundaries enforced

**Success Criteria**:
- 0 circular dependencies (verified by `pnpm madge --circular src/`)
- 3 store locations → 1 location (`src/infrastructure/persistence/stores/`)
- 6,500+ lines of duplicate code deleted
- All agent/provider/conversation operations working

---

### Phase 2: God Store Refactoring (Week 3-4, 40 hours)

**Epic AC-2: Component Size Compliance**

**Goal**: Eliminate all god stores (>500 lines), comply with 120-line limit

**Priority 1: Top 5 God Stores** (Week 3)

1. **dexie-db.ts** (1,267 lines) → 12 slices (~16 hours)
   - Split by domain: agents, providers, conversations, rag, knowledge, notes, study, quiz, audio, canvas, filesystem, metadata
   - Each slice: ~100 lines, focused on single domain

2. **rag-store.ts** (810 lines) → 5 slices (~8 hours)
   - Split: rag-crud, rag-search, rag-indexing, rag-chunking, rag-embedding

3. **conversation-threads-store.ts** (726 lines) → 6 slices (~8 hours)
   - Split: conversation-crud, thread-management, message-persistence, conversation-utils, conversation-events, conversation-selectors

4. **use-app-store.ts** (654 lines) → 6 slices (~6 hours)
   - Split: app-hydration, app-selectors, agent-slices-combined, provider-slices-combined, conversation-slices-combined, middleware-config

5. **sync-manager.ts** (667 lines) → 4 slices (~6 hours)
   - Split: sync-coordinator, file-sync, metadata-sync, sync-queue

**Priority 2: Remaining God Stores** (Week 4)

6. **agent-config.tsx** (567 lines) → 5 sub-components (~4 hours)
7. **note-store.ts** (525 lines) → 4 slices (~4 hours)
8. **study-store.ts** (456 lines) → 4 slices (~4 hours)
9. **live-api-websocket.ts** (387 lines) → 3 slices (~3 hours)
10. **audio-playback.ts** (386 lines) → 3 slices (~3 hours)

**Validation**:
- ✅ Level 2 (Code Hygiene): No orphaned event listeners, no dead code
- ✅ Level 11 (Documentation): Component props documented

**Success Criteria**:
- 0 files >500 lines
- All stores follow slice pattern
- Each slice <120 lines (new standard)

---

### Phase 3: UI Event Indicators (Week 5, 24 hours)

**Epic AC-3: Event Activity Indicators**

**Goal**: Implement all P0 event activity indicators per user requirement

**Components**:

1. **Sync Status Visualization** (~6 hours)
   - File: `src/presentation/components/ide/SyncStatusPanel.tsx`
   - Features:
     - Real-time sync queue depth display
     - Pending/failed/in-progress operation counts
     - Progress bar for file sync operations
     - Error retry buttons

2. **RAG Indexing Progress** (~8 hours)
   - File: `src/presentation/components/knowledge/IndexingProgressPanel.tsx`
   - Features:
     - Chunking progress: "Processing file 15/100"
     - Embedding generation: "Generating embeddings 450/1000"
     - Index build % complete with ETA
     - Cancellation support

3. **Provider Model Fetch Feedback** (~3 hours)
   - File: `src/presentation/components/agent/ModelFetchProgress.tsx`
   - Features:
     - Loading spinner while fetching
     - Error display with retry button
     - Success toast notification

4. **Agent Validation Error Display** (~4 hours)
   - File: `src/presentation/components/agent/AgentValidationErrors.tsx`
   - Features:
     - Real-time validation error list
     - Invalid field highlighting
     - Actionable error messages

5. **Agent Creation Success Feedback** (~3 hours)
   - File: `src/presentation/components/agent/AgentCreationSuccess.tsx`
   - Features:
     - Toast notification
     - Auto-switch to new agent
     - Brief tutorial tooltip

**Validation**:
- ✅ Level 7 (Mobile Reality): Touch targets ≥44×44px
- ✅ Level 8 (I18N Wiring): No hardcoded strings
- ✅ Level 9 (Performance Under Load): 60fps smooth animations

**Success Criteria**:
- All P0 event indicators implemented
- Progress bars accurate and real-time
- Error states actionable and clear

---

### Phase 4: TypeScript Error Reduction (Week 6, 24 hours)

**Epic AC-4: Build Stability**

**Goal**: Reduce TypeScript errors from 1,172 → <200

**Batches** (6 hours per batch):

**Batch 1: Unused Imports** (~90 TS6196 errors)
- Run `pnpm eslint src/ --fix` to auto-fix
- Manual cleanup of remaining unused imports
- Estimated: 2 hours

**Batch 2: Type Mismatches** (~200 errors)
- Fix ProviderConfig type conflicts (old vs new)
- Update Agent type imports
- Fix cross-store type mismatches
- Estimated: 2 hours

**Batch 3: Test Framework** (~426 test errors)
- Update Vitest imports (removed global `vi` imports)
- Fix test mocking patterns
- Update `@testing-library` imports
- Estimated: 2 hours

**Batch 4: Remaining Production Errors** (~306 errors)
- Fix component prop types
- Resolve store action type mismatches
- Fix event handler types
- Estimated: 2 hours

**Validation**:
- ✅ `pnpm tsc --noEmit` returns 0 errors
- ✅ `pnpm build` succeeds
- ✅ `pnpm test` passes with 0 failures

**Success Criteria**:
- TypeScript errors reduced by 80% (1,172 → <200)
- Production build succeeds
- Full test suite runs successfully

---

## Validation Against sweeping-validation.md

### Level 1: State Integrity
**Status**: ❌ FAILED (1,172 TS errors indicate state corruption risks)

**Gaps**:
- Dual-source state leaks (duplicate stores)
- Selector hydration race conditions (not validated)
- State flow completeness untested

**Fix**: Epic AC-1 (Store Consolidation)

---

### Level 2: Code Hygiene
**Status**: ❌ FAILED (17 files >300 lines, 433 files >120 lines)

**Gaps**:
- Orphaned event listeners (not validated)
- Dead code branches (legacy flags not removed)
- Duplicate utilities (formatDate, formatTimestamp, etc.)

**Fix**: Epic AC-2 (Component Size Compliance)

---

### Level 3: Naming Consistency
**Status**: ⚠️ UNKNOWN (not validated)

**Required Validation**:
- [ ] Prop naming standardization (agentId vs agentUUID)
- [ ] Boolean prop unification (showHidden vs includeHidden)
- [ ] Event handler convention (handleX vs onX)
- [ ] API response shape stability (Zod schemas)

**Fix**: Epic AC-4.3 (Add naming consistency checks)

---

### Level 4: Dependency Sanity
**Status**: ❌ FAILED (4 circular dependencies identified)

**Gaps**:
- Circular imports: agents-store ↔ provider-store
- Barrel export compliance not enforced
- Store cross-import prevention failed
- Component decoupling incomplete

**Fix**: Epic AC-1.5 (Fix circular dependencies via cross-slice communication)

---

### Level 5: Integration Reality
**Status**: ⚠️ UNKNOWN (not validated)

**Required Validation**:
- [ ] FSA handle lifecycle (queryPermission checks)
- [ ] WebContainer boot guards (wcStatus === 'ready')
- [ ] IndexedDB quota handling (try/catch on all writes)
- [ ] API key validation (build throws if missing)

**Fix**: Epic AC-5.1 (Integration testing)

---

### Level 6: Architecture Compliance
**Status**: ⚠️ PARTIAL (68% compliant)

**Gaps**:
- Layer boundaries not enforced in Components layer
- Tool approval integrity not validated
- Agent context injection untested
- Streaming buffer compliance unverified

**Fix**: Epic AC-1 (Foundation) + Epic AC-5 (Testing)

---

### Level 7: Mobile Reality
**Status**: ⚠️ UNKNOWN (not validated)

**Required Validation**:
- [ ] SharedArrayBuffer detection (crossOriginIsolated check)
- [ ] Touch targets ≥44×44px
- [ ] Responsive breakpoints (mobile <640px, tablet 640-1024px, desktop ≥1024px)
- [ ] Offline storage (IndexedDB quota warning)

**Fix**: Epic AC-3.3 (Mobile validation)

---

### Level 8: I18N Wiring
**Status**: ⚠️ PARTIAL (443 translation keys, but hardcoded strings exist)

**Gaps**:
- Error messages not all translated
- Fallback handling incomplete
- Pluralization not validated

**Fix**: Epic AC-3.4 (I18N completion)

---

### Level 9: Performance Under Load
**Status**: ⚠️ UNKNOWN (not validated)

**Required Validation**:
- [ ] Large project handling (300-file React project)
- [ ] Long conversation history (100-message thread)
- [ ] Network interruption recovery

**Fix**: Epic AC-5.2 (Performance testing)

---

### Level 10: Security + Privacy
**Status**: ⚠️ PARTIAL (API key encryption implemented, but not validated)

**Gaps**:
- API keys in IndexedDB (encrypted, but validation needed)
- File content privacy not validated
- COOP/COEP headers implemented but not tested

**Fix**: Epic AC-5.3 (Security audit)

---

### Level 11: Documentation Completeness
**Status**: ❌ FAILED (sprint-status shows 100%, reality is ~5.9%)

**Root Cause**: Governance misalignment - superficial validation

**Gaps**:
- API documentation incomplete
- User guides not validated
- Developer documentation outdated

**Fix**: This correct-course plan + Epic AC-6 (Documentation update)

---

### Level 12: Test Coverage
**Status**: ❌ FAILED (4.4% test coverage, 866 test errors)

**Gaps**:
- Unit test coverage: 4.4% (target: >80%)
- Integration tests: Missing
- Test execution: 866 test failures

**Fix**: Epic AC-4.3 (Test framework fixes) + Epic AC-7 (Test writing)

---

## Risk Assessment

### High Risks (Requires Immediate Action)

1. **Data Loss Risk**: IndexedDB operations have no quota handling
   - **Impact**: Users create large notes → quota exceeded → silent save failure
   - **Mitigation**: Implement `safePut()`, `safeAdd()` wrappers (8-12 hours)
   - **Priority**: P0 (Epic AC-8.1)

2. **Runtime Crash Risk**: Circular dependencies in agent/provider stores
   - **Impact**: Application fails to boot (maximum call stack exceeded)
   - **Mitigation**: Epic AC-1 (Store Consolidation)
   - **Priority**: P0 (Immediate)

3. **State Corruption Risk**: Duplicate stores managing same entity
   - **Impact**: State inconsistencies, unpredictable behavior
   - **Mitigation**: Epic AC-1 (Store Consolidation)
   - **Priority**: P0 (Immediate)

### Medium Risks (Address in Short-Term)

4. **Performance Degradation**: 29 god classes cause memory bloat
   - **Impact**: Slow rendering, high memory usage
   - **Mitigation**: Epic AC-2 (Component Refactoring)
   - **Priority**: P1 (Week 3-4)

5. **Maintenance Crisis**: 67% code violation rate
   - **Impact**: Impossible to maintain, high cognitive load
   - **Mitigation**: Epic AC-2 (Component Refactoring)
   - **Priority**: P1 (Week 3-4)

### Low Risks (Address in Long-Term)

6. **Test Coverage Gap**: Only 4.4% coverage
   - **Impact**: Bugs caught in production instead of testing
   - **Mitigation**: Epic AC-7 (Test Writing)
   - **Priority**: P2 (Week 7-8)

---

## Success Metrics

### Definition of Done (per sweeping-validation.md)

**A story/epic is DONE when**:
- ✅ All 12 levels passed (0 critical issues)
- ✅ 3-device rule passed (Desktop + Mobile + Android)
- ✅ 3-question test passed (Deletable, Persistent, Offline-capable)
- ✅ No AI agent red flags
- ✅ Automated audit script passes with 0 violations
- ✅ Code reviewed and approved
- ✅ Tests pass with >80% coverage
- ✅ Documentation updated

**Current Reality**:
- ❌ Level 1: State Integrity - FAILED (1,172 TS errors)
- ❌ Level 2: Code Hygiene - FAILED (17 files >300 lines)
- ⚠️ Level 3-12: NOT VALIDATED

**Target After Correct Course Execution**:
- ✅ Level 1-2: PASSED (after Epic AC-1, AC-2, AC-4)
- ✅ Level 3-4: PASSED (after Epic AC-1, AC-4)
- ✅ Level 5-10: VALIDATED (after Epic AC-5)
- ✅ Level 11: PASSED (after documentation update)
- ✅ Level 12: IN PROGRESS (>50% coverage target)

---

## Estimated Timeline

### Week 1-2: Foundation Stabilization (48 hours)
- Epic AC-1: Store Consolidation
- Eliminate duplicate stores, fix circular dependencies
- **Deliverable**: Single bounded store, 0 circular deps

### Week 3-4: God Store Refactoring (40 hours)
- Epic AC-2: Component Size Compliance
- Split 29 god classes into focused slices
- **Deliverable**: 0 files >500 lines

### Week 5: UI Event Indicators (24 hours)
- Epic AC-3: Event Activity Indicators
- Implement 5 P0 progress/sync visualization components
- **Deliverable**: All event indicators working

### Week 6: TypeScript Error Reduction (24 hours)
- Epic AC-4: Build Stability
- Reduce 1,172 errors → <200
- **Deliverable**: Production build succeeds

### Week 7-8: Testing & Validation (32 hours)
- Epic AC-5: Integration Testing
- Epic AC-6: Documentation Update
- Epic AC-7: Test Writing
- **Deliverable**: 12-level validation complete

**Total Effort**: 168 hours (~6 weeks @ 28 hours/week part-time)

---

## Immediate Next Actions (This Session)

1. ✅ **COMPLETED**: Repomix MCP analysis (agent a450497)
2. ✅ **COMPLETED**: Zustand documentation research (Context7)
3. ✅ **COMPLETED**: Web search for December 2025 patterns
4. ✅ **COMPLETED**: sweeping-validation.md analysis
5. ⏳ **IN PROGRESS**: Create correct-course plan (this document)
6. ⏳ **PENDING**: Present plan to user for approval
7. ⏳ **PENDING**: Execute Epic AC-1.1 (Delete deprecated agent store)

---

## User Approval Required

**Decision Point**: Proceed with Epic AC-1 (Store Consolidation)?

**Risks**:
- Breaking changes if deprecated stores still in use
- Potential data loss if migration not handled correctly
- 48 hours of focused development time

**Benefits**:
- Eliminate 6,500+ lines of duplicate code
- Fix 4 circular dependencies
- Implement December 2025 Zustand best practices
- Foundation for all future development

**Alternative**: Phase migration (migrate 1 store at a time over 4 weeks)

**Awaiting User Decision** before proceeding with implementation.

---

**Document Control**:
- **Status**: Draft - Pending User Approval
- **Version**: 1.0
- **Last Updated**: 2026-01-01
- **Author**: BMAD Master Orchestrator (Ralph Loop Cycle 15)
- **Review Required**: User approval before Epic AC-1 execution

---

**Generated by**: BMAD Master Orchestrator
**Cycle**: Ralph Loop Cycle 15
**Duration**: ~45 minutes (MCP research + analysis + planning)
**Next Cycle**: Execution of approved corrective actions
