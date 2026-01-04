---
date: 2026-01-04
time: 08:55:00+07:00
phase: Phase 4 - Implementation (Mid-Sprint Course Correction)
team: Team A (Orchestrator)
agent_mode: bmad-core-bmad-master + bmad-bmm-sm
version: 1.0
status: PROPOSED
proposal_id: SCP-2026-01-04-STATE-CONSOLIDATION
related_adr: ADR-024
epic_id: EPIC-024
priority: P1-HIGH
---

# Sprint Change Proposal: State Management Consolidation

## Tracking Section

### Document Status
- **Status:** PROPOSED
- **Version:** 1.0
- **Last Updated:** 2026-01-04T08:55:00+07:00
- **Proposal ID:** SCP-2026-01-04-STATE-CONSOLIDATION

### Phase Control
- **Current Phase:** Phase 4 - Implementation (Mid-Sprint Course Correction)
- **Next Phase:** Story Development upon approval
- **Trigger:** ARC-DUP epic validation revealing duplicate state locations

### Agent/Mode Handoff Sequence
1. **Created by:** bmad-core-bmad-master (2026-01-04)
2. **Validated by:** Architecture analysis (Option A vs Option B)
3. **Next Handoff:** bmad-bmm-dev (upon approval)

### Change Log
- 2026-01-04: Initial Sprint Change Proposal creation

### References
- **Architecture Decision Record:** `adr-state-consolidation-2026-01-04.md`
- **Preceding Conversation:** "Validate ARC-DUP Agent Work" (75a1cf99-d82a-430c-9bdc-7214c8c77fc7)
- **Current Architecture:** `_bmad-output/project-planning-artifacts/architecture.md` (Section 4.2.1)
- **Current lib/ Structure:** `src/lib/codetree-2026-01-04.md`
- **Current infra Structure:** `src/infrastructure/persistence/codetree-2026-01-04.md`

---

## Section 1: Issue Summary

### 1.1 Problem Statement

The Via-Gent platform has evolved with **fragmented state management** resulting in:

1. **Duplicate Dexie Database Files:**
   - `src/lib/state/dexie-db.ts` (Legacy)
   - `src/infrastructure/persistence/dexie-db.ts` (Canonical)
   
2. **Duplicate Knowledge Store:**
   - `src/lib/state/knowledge/` (6 slices)
   - `src/infrastructure/persistence/stores/knowledge/` (8 files)
   
3. **Scattered Zustand Stores:**
   - `lib/state/` contains: `ide-store.ts`, `quiz-store.ts`, `tool-permission-store.ts`, `workspace-store.ts`
   - `infrastructure/persistence/stores/` contains organized domain stores
   
4. **Scattered Dexie Helpers:**
   - `src/lib/state/dexie-db-helpers/` (15 helper files)
   - Should be co-located with database in infrastructure

### 1.2 Discovery Context

- **Discovered During:** ARC-DUP (Architecture Remediation - Duplication Consolidation) epic validation
- **Validated By:** Codebase analysis comparing lib/ and infrastructure/ trees
- **Evidence:** 
  - Two `dexie-db.ts` files with different export signatures
  - Two knowledge store implementations with divergent slices
  - Import confusion documented in developer feedback

### 1.3 Impact Assessment

| Dimension | Impact Level | Description |
|-----------|--------------|-------------|
| **Developer Experience** | HIGH | Confusion about which location is canonical |
| **Maintainability** | HIGH | Changes must be duplicated or risk divergence |
| **Performance** | MEDIUM | Potential for multiple store instantiations |
| **Production Risk** | MEDIUM | Possible data inconsistency between stores |
| **Technical Debt** | HIGH | Accumulated duplication must be resolved |

---

## Section 2: Impact Analysis

### 2.1 Epic Impact

| Epic | Status | Impact | Required Action |
|------|--------|--------|-----------------|
| **Epic 24 (NEW)** | PROPOSED | PRIMARY | Create new epic for consolidation |
| **Epic 22 (Production Hardening)** | IN_PROGRESS | DEPENDENT | May benefit from consolidation |
| **Epic 23 (UX/UI Modernization)** | IN_PROGRESS | DEPENDENT | Store imports may need updates |
| **Epic 13 (Brownfield Stabilization)** | DONE | SUPERSEDED | Original architecture decisions updated |

### 2.2 Story Impact

This change creates a **new epic** (Epic 24) with 8 stories detailed in Section 4.

### 2.3 Artifact Conflicts

| Artifact | Conflict Type | Resolution |
|----------|---------------|------------|
| **architecture.md** | Section 4.2.1 needs update | Add ADR-024 reference |
| **project-context.md** | Import path guidance | Update canonical paths |
| **AGENTS.md** | State management section | Update patterns |

### 2.4 Technical Impact

| Component | Files Affected | Effort |
|-----------|----------------|--------|
| **lib/state/** | 25+ files (move/delete) | 4-6 hours |
| **infrastructure/persistence/** | 15+ files (merge/update) | 3-4 hours |
| **Import statements** | 200+ files | 2-3 hours |
| **Test files** | 30+ test files | 2 hours |
| **Documentation** | 5 files | 1 hour |

---

## Section 3: Recommended Approach

### 3.1 Selected Path: Direct Adjustment (Option 1)

**Approach:** Create new Epic 24 with targeted stories, implement incrementally with zero breaking changes using facade pattern.

**Rationale:**
1. ✅ Follows Zustand best practices (single store, slices)
2. ✅ Aligns with existing infrastructure/persistence pattern
3. ✅ Zero breaking changes via facades
4. ✅ Can be executed in parallel with other epics
5. ✅ Clear acceptance criteria per story

### 3.2 Implementation Strategy

**Principle:** Facade Pattern for Zero Breaking Changes

```typescript
// After migration, lib/state/index.ts becomes a facade:
// Re-exports from canonical location
export { getDb } from '@/infrastructure/persistence/dexie-db';
export { useIDEStore } from '@/infrastructure/persistence/stores/ide';
// ... etc

// Deprecation warning in development
if (process.env.NODE_ENV === 'development') {
  console.warn('[DEPRECATED] Import from @/infrastructure/persistence/stores');
}
```

### 3.3 Effort Estimate

| Phase | Stories | Effort | Complexity |
|-------|---------|--------|------------|
| Phase 1: Dexie Consolidation | S24-1, S24-2 | 4-5 hours | Medium |
| Phase 2: Store Consolidation | S24-3, S24-4, S24-5 | 6-8 hours | Medium-High |
| Phase 3: Cleanup & Docs | S24-6, S24-7, S24-8 | 4-5 hours | Low-Medium |
| **Total** | **8 stories** | **14-18 hours** | **Medium** |

### 3.4 Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Import path breaks | LOW | HIGH | Facade pattern, grep validation |
| Test failures | MEDIUM | MEDIUM | Run tests after each story |
| Store behavior change | LOW | HIGH | Preserve exact same exports |
| Bundle size regression | LOW | LOW | Tree-shaking via re-exports |

### 3.5 Timeline Impact

- **Duration:** 2-3 days focused work OR 4-5 days distributed
- **Sprint Impact:** Can complete within current sprint
- **Dependencies:** None - can start immediately

---

## Section 4: Detailed Stories

### 📁 Epic 24: State Management Consolidation

**Epic Summary:** Consolidate all Zustand stores and Dexie helpers into `infrastructure/persistence/` following Clean Architecture principles, purifying `lib/` to contain only pure utilities.

**Epic Goal:** Single source of truth for all state management, zero breaking changes.

---

### Story 24-1: Consolidate Dexie Database Files

**Priority:** P0-CRITICAL  
**Effort:** 2 hours  
**Dependencies:** None

#### Description
Eliminate duplicate `dexie-db.ts` by making `infrastructure/persistence/dexie-db.ts` the single canonical source and creating a re-export facade in `lib/state/`.

#### Acceptance Criteria
- [ ] `lib/state/dexie-db.ts` becomes a facade re-exporting from infrastructure
- [ ] All imports from `@/lib/state/dexie-db` continue to work
- [ ] Deprecation warning added for development mode
- [ ] TypeScript compiles without errors
- [ ] No duplicate database class definitions

#### Technical Tasks
```
24-1.1: Create facade in lib/state/dexie-db.ts
24-1.2: Verify identical exports between old and new
24-1.3: Add deprecation console.warn in development
24-1.4: Run grep to find all imports, verify working
24-1.5: Run TypeScript validation
```

#### Validation Commands
```bash
# Verify no TypeScript errors
pnpm exec tsc --noEmit

# Count remaining direct imports (should work via facade)
rg "from '@/lib/state/dexie-db'" src/ --files-with-matches
```

---

### Story 24-2: Move Dexie Helpers to Infrastructure

**Priority:** P0-CRITICAL  
**Effort:** 2-3 hours  
**Dependencies:** Story 24-1

#### Description
Move `lib/state/dexie-db-helpers/` directory to `infrastructure/persistence/dexie-db-helpers/` and create re-export facade.

#### Acceptance Criteria
- [ ] All 15 helper files moved to `infrastructure/persistence/dexie-db-helpers/`
- [ ] Facade created at `lib/state/dexie-db-helpers/index.ts`
- [ ] All existing imports continue to work
- [ ] Helper tests pass in new location
- [ ] TypeScript compiles without errors

#### Technical Tasks
```
24-2.1: Create infrastructure/persistence/dexie-db-helpers/ if not exists
24-2.2: Move all 15 helper files
24-2.3: Update internal imports within helper files
24-2.4: Create facade index.ts in lib/state/dexie-db-helpers/
24-2.5: Run tests for helpers
24-2.6: Run TypeScript validation
```

#### Files Affected
```
lib/state/dexie-db-helpers/
├── additional-file-metadata-helpers.ts
├── collection-helpers-basic.ts
├── collection-helpers-sources.ts
├── conversation-thread-helpers.ts
├── file-metadata-helpers.ts
├── fsa-handle-helpers.ts
├── ide-state-helpers.ts
├── session-snapshot-helpers.ts
├── source-helpers-basic.ts
├── source-helpers-search.ts
├── sync-status-helpers-basic.ts
├── sync-status-helpers-query.ts
├── synthesis-result-helpers-create.ts
├── synthesis-result-helpers-crud.ts
└── tool-execution-log-helpers.ts
```

---

### Story 24-3: Merge Knowledge Store Implementations

**Priority:** P1-HIGH  
**Effort:** 3-4 hours  
**Dependencies:** Story 24-2

#### Description
Merge the two knowledge store implementations:
- `lib/state/knowledge/` (6 slices)
- `infrastructure/persistence/stores/knowledge/` (8 files)

Create unified store in infrastructure with facade in lib.

#### Acceptance Criteria
- [ ] Single canonical knowledge store in `infrastructure/persistence/stores/knowledge/`
- [ ] All slices from both locations merged (deduplicated)
- [ ] Facade at `lib/state/knowledge/index.ts`
- [ ] All knowledge-related tests pass
- [ ] No functionality regression

#### Technical Tasks
```
24-3.1: Inventory slices in both locations
24-3.2: Identify unique vs duplicate functionality
24-3.3: Merge unique slices into infrastructure version
24-3.4: Update imports within merged store
24-3.5: Create comprehensive facade in lib/state/knowledge/
24-3.6: Update all consuming components if needed
24-3.7: Run knowledge store tests
24-3.8: Manual smoke test Knowledge workspace
```

#### Slice Inventory
| lib/state/knowledge/ | infrastructure/stores/knowledge/ | Action |
|----------------------|----------------------------------|--------|
| knowledge-collection-slice.ts | knowledge-collections-slice.ts | MERGE |
| knowledge-metadata-slice.ts | knowledge-metadata-slice.ts | DEDUPE |
| knowledge-preview-slice.ts | (missing) | MIGRATE |
| knowledge-source-crud-slice.ts | knowledge-sources-slice.ts | MERGE |
| knowledge-synthesis-slice.ts | knowledge-synthesis-slice.ts | DEDUPE |
| knowledge-undo-slice.ts | (missing) | MIGRATE |
| (missing) | knowledge-ui-slice.ts | KEEP |
| (missing) | useKnowledgeStore.ts | KEEP |

---

### Story 24-4: Migrate IDE Store

**Priority:** P1-HIGH  
**Effort:** 1-2 hours  
**Dependencies:** Story 24-2

#### Description
Migrate `lib/state/ide-store.ts` to merge with existing `infrastructure/persistence/stores/ide/` and create facade.

#### Acceptance Criteria
- [ ] `lib/state/ide-store.ts` functionality merged into infrastructure
- [ ] Facade created for backwards compatibility
- [ ] All IDE workspace tests pass
- [ ] No functionality regression in IDE page

#### Technical Tasks
```
24-4.1: Compare lib/state/ide-store.ts with infrastructure/stores/ide/
24-4.2: Identify any unique functionality in lib version
24-4.3: Merge unique parts into infrastructure
24-4.4: Create facade at lib/state/ide-store.ts
24-4.5: Run IDE-related tests
24-4.6: Manual smoke test IDE workspace
```

---

### Story 24-5: Migrate Quiz and Permission Stores

**Priority:** P1-HIGH  
**Effort:** 2 hours  
**Dependencies:** Story 24-2

#### Description
Migrate remaining stores from lib/state to infrastructure:
- `quiz-store.ts` → `infrastructure/persistence/stores/study/`
- `tool-permission-store.ts` → `infrastructure/persistence/stores/permissions/`
- `workspace-store.ts` → merge with `infrastructure/persistence/stores/workspace/`

#### Acceptance Criteria
- [ ] `quiz-store.ts` moved to `stores/study/quiz-store.ts`
- [ ] `tool-permission-store.ts` moved to `stores/permissions/`
- [ ] `workspace-store.ts` merged with existing workspace store
- [ ] All facades created in lib/state/
- [ ] All related tests pass

#### Technical Tasks
```
24-5.1: Create stores/study/ directory
24-5.2: Move quiz-store.ts, update internal imports
24-5.3: Create stores/permissions/ directory  
24-5.4: Move tool-permission-store.ts, update imports
24-5.5: Merge workspace-store.ts with stores/workspace/
24-5.6: Create all three facades in lib/state/
24-5.7: Run related tests
```

#### New Directory Structure
```
infrastructure/persistence/stores/
├── study/
│   ├── index.ts         # NEW
│   ├── quiz-store.ts    # MOVED from lib/state
│   └── types.ts         # NEW
├── permissions/
│   ├── index.ts         # NEW
│   └── tool-permission-store.ts  # MOVED from lib/state
└── workspace/
    ├── index.ts         # EXISTS
    ├── workspace-context.ts  # EXISTS
    ├── workspace-provider.tsx # EXISTS
    └── workspace-store.ts    # MERGED from lib/state
```

---

### Story 24-6: Move dexie-storage.ts to Infrastructure

**Priority:** P2-MEDIUM  
**Effort:** 1 hour  
**Dependencies:** Story 24-2

#### Description
Move `lib/state/dexie-storage.ts` (Zustand-Dexie adapter) to `infrastructure/persistence/` and create facade.

#### Acceptance Criteria
- [ ] `dexie-storage.ts` moved to `infrastructure/persistence/`
- [ ] Facade created at `lib/state/dexie-storage.ts`
- [ ] All stores using `createDexieStorage` continue to work
- [ ] TypeScript compiles without errors

#### Technical Tasks
```
24-6.1: Move dexie-storage.ts to infrastructure/persistence/
24-6.2: Update internal imports (dexie-db reference)
24-6.3: Create facade in lib/state/dexie-storage.ts
24-6.4: Verify all store persist() calls work
24-6.5: Run TypeScript validation
```

---

### Story 24-7: Update All Import Paths

**Priority:** P2-MEDIUM  
**Effort:** 2-3 hours  
**Dependencies:** Stories 24-1 through 24-6

#### Description
Update all import statements across the codebase to use canonical infrastructure paths, removing dependency on facades.

#### Acceptance Criteria
- [ ] All production code uses `@/infrastructure/persistence/stores/` imports
- [ ] Facades remain for backwards compatibility but unused
- [ ] No circular dependency warnings
- [ ] TypeScript compiles without errors
- [ ] All tests pass

#### Technical Tasks
```
24-7.1: Run grep to find all @/lib/state imports
24-7.2: Create migration script or manual update list
24-7.3: Update imports in presentation/ components
24-7.4: Update imports in other lib/ modules
24-7.5: Update imports in infrastructure/ (if any)
24-7.6: Run TypeScript validation
24-7.7: Run full test suite
```

#### Commands
```bash
# Find all lib/state imports to update
rg "from '@/lib/state" src/ --files-with-matches

# After updates, verify none remain in production code
rg "from '@/lib/state" src/ --files-with-matches --glob '!src/lib/state/*'
# Should return 0 files
```

---

### Story 24-8: Documentation and Cleanup

**Priority:** P2-MEDIUM  
**Effort:** 2 hours  
**Dependencies:** Story 24-7

#### Description
Update documentation, remove legacy files (keeping only facades), update AGENTS.md and architecture documents.

#### Acceptance Criteria
- [ ] `AGENTS.md` updated with new state management guidance
- [ ] `architecture.md` updated with ADR-024 reference
- [ ] `project-context.md` updated with canonical import paths
- [ ] Legacy backup files removed (only facades remain in lib/state/)
- [ ] README or CONTRIBUTING docs updated if applicable

#### Technical Tasks
```
24-8.1: Update AGENTS.md state management section
24-8.2: Add ADR-024 reference to architecture.md
24-8.3: Update project-context.md import patterns
24-8.4: Remove any .backup files in lib/state/
24-8.5: Verify lib/state/ only contains facades
24-8.6: Create codetree snapshot of final structure
```

#### Documentation Updates

**AGENTS.md - Add Section:**
```markdown
## State Management Architecture

### Canonical Locations
- **All Zustand stores:** `src/infrastructure/persistence/stores/`
- **Dexie database:** `src/infrastructure/persistence/dexie-db.ts`
- **Dexie helpers:** `src/infrastructure/persistence/dexie-db-helpers/`

### Import Patterns
```typescript
// ✅ CORRECT - Use infrastructure paths
import { useAgentsStore } from '@/infrastructure/persistence/stores/agents';
import { useConversationStore } from '@/infrastructure/persistence/stores/conversation';

// ❌ DEPRECATED - lib/state is facades only
import { useIDEStore } from '@/lib/state/ide-store';
```

### Directory Purpose
- `lib/` = Pure utilities, no state management
- `infrastructure/persistence/` = All state and persistence
```

---

## Section 5: Implementation Handoff

### 5.1 Change Scope Classification

**Scope:** MODERATE

**Rationale:** 
- 8 well-defined stories
- Clear technical tasks per story
- Zero breaking changes via facade pattern
- Can be executed by development team with periodic validation

### 5.2 Handoff Recipients

| Role | Responsibility |
|------|----------------|
| **Development Team** | Execute Stories 24-1 through 24-7 |
| **Scrum Master (bmad-bmm-sm)** | Track sprint status, update sprint-status.yaml |
| **Tech Writer (bmad-bmm-tech-writer)** | Execute Story 24-8 documentation |
| **Code Reviewer** | Review each story completion |

### 5.3 Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| **All Stories Complete** | Sprint status tracking | 8/8 DONE |
| **Zero TypeScript Errors** | `pnpm exec tsc --noEmit` | 0 errors |
| **All Tests Pass** | `pnpm test` | 100% pass |
| **No lib/state Imports** | grep search | 0 in production code |
| **Documentation Updated** | Manual review | AGENTS.md + architecture.md |

### 5.4 Rollback Plan

If issues arise:
1. **Git Revert:** Each story should be a single commit, revertable
2. **Facade Removal:** If needed, facades can be converted back to full implementations
3. **Import Restoration:** Grep/sed can restore original import paths

---

## Section 6: Approval

### 6.1 Proposal Details

| Attribute | Value |
|-----------|-------|
| **Proposal ID** | SCP-2026-01-04-STATE-CONSOLIDATION |
| **Related ADR** | ADR-024 |
| **Epic ID** | EPIC-024 |
| **Priority** | P1-HIGH |
| **Effort** | 14-18 hours (8 stories) |
| **Sprint Impact** | 2-3 days focused work |
| **Breaking Changes** | None (facade pattern) |

### 6.2 Approval Status

**Awaiting User Approval**

- [ ] **User Approval:** Pending
- [ ] **Architecture Review:** ADR-024 created
- [ ] **Sprint Planning Updated:** Pending approval

---

## Appendix A: Story Dependency Graph

```
Story 24-1: Dexie Database Facade
    │
    └──► Story 24-2: Move Dexie Helpers
              │
              ├──► Story 24-3: Merge Knowledge Store
              │
              ├──► Story 24-4: Migrate IDE Store
              │
              ├──► Story 24-5: Migrate Quiz/Permission Stores
              │
              └──► Story 24-6: Move dexie-storage.ts
                        │
                        └──► Story 24-7: Update All Imports
                                  │
                                  └──► Story 24-8: Documentation & Cleanup
```

## Appendix B: Quick Reference Commands

```bash
# Validate TypeScript
pnpm exec tsc --noEmit

# Find lib/state imports
rg "from '@/lib/state" src/ --files-with-matches

# Find remaining duplicates
diff -q src/lib/state/dexie-db.ts src/infrastructure/persistence/dexie-db.ts

# Run tests
pnpm test

# Build validation
pnpm build
```

---

**Document End**

*Generated by BMAD Master v2.0 - Autonomous Orchestrator*
*Workflow: correct-course (Step 4: Generate Sprint Change Proposal)*
*Timestamp: 2026-01-04T08:55:00+07:00*

---

## User Action Required

**Please review this Sprint Change Proposal and respond with:**

- **[a] Approve** - Proceed with implementation
- **[e] Edit** - Request modifications to specific sections
- **[r] Reject** - Decline this proposal

Upon approval, I will:
1. Add Epic 24 to the epics document
2. Update sprint-status.yaml
3. Create first story (24-1) for immediate development
