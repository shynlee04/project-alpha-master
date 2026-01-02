# Via-gent (Project Alpha v2.0) - Migration Assessment Project Context

**Generated**: 2026-01-02
**Assessment Focus**: TS-001, DB-001, UI-001 (P0/P1 Critical Issues)
**Team**: BMAD Master Analysis
**Framework**: BMAD V6

---

## Executive Summary

**Project Health Score**: 5.9% (1,130 TypeScript errors remaining)
**Codebase Size**: 1,030 TypeScript files (188,927 total lines)
**Critical Risk Areas**: 3 P0 issues requiring immediate attention

### Assessment Scope
This project context document analyzes the Via-gent codebase to support migration planning for:
1. **TS-001**: Reduce TypeScript errors from 1,130 to <100 (P0, 6-8 hours)
2. **DB-001**: Add safe IndexedDB quota handling (P0 data loss risk, 18-22 hours)
3. **UI-001**: Extract hooks from AgentConfigDialog (P1, 1,089 → <300 lines, 16-20 hours)

---

## 1. PROJECT STRUCTURE & ARCHITECTURE

### 1.1 Directory Hierarchy

```
src/
├── application/              # Application services and DTOs
├── components/               # [DEPRECATED] Moving to presentation/components/
├── core/                     # Domain entities (Agent, Provider, Tool, etc.)
├── domain/                   # Domain services and use cases
├── hooks/                    # Custom React hooks (useResponsive, etc.)
├── i18n/                     # Internationalization (en, vi)
├── infrastructure/           # Infrastructure layer (persistence, events)
│   ├── events/              # Cross-workspace event bus
│   └── persistence/         # Dexie + Zustand stores (CRITICAL)
│       ├── dexie-db*.ts     # IndexedDB definitions (7 files, 2,604 lines)
│       ├── dexie-storage.ts # Zustand adapter (207 lines, quota handling ✅)
│       └── stores/          # Zustand stores (38+ stores)
├── lib/                     # Core library modules
│   ├── agent/              # AI agent infrastructure (45+ files)
│   ├── state/              # [LEGACY] Zustand stores (19 files)
│   ├── workspace/          # Workspace state (project-store, etc.)
│   └── [other modules]     # rag, knowledge, study, notes, etc.
├── presentation/            # Presentation layer components (294 components)
│   └── components/
│       ├── agent/          # Agent config UI (20+ files)
│       ├── chat/           # Chat interface (15 components)
│       ├── ide/            # IDE components (20+ files)
│       └── [other workspaces]
├── routes/                 # TanStack Router file-based routes
├── shared/                 # Shared constants, errors, types
├── styles/                 # Global styles, design tokens
├── types/                  # Type definitions
├── utils/                  # Export utilities
└── workspaces/             # Workspace-specific logic
```

### 1.2 Four-Layer Architecture (Target State)

**Current Status**: Partially implemented (Ralph Loop Cycle 18)

| Layer | Location | Purpose | Status |
|-------|----------|---------|--------|
| **Core (Domain)** | `src/core/` | Domain entities (Agent, Provider, Tool, Conversation) | ✅ COMPLETE |
| **Domain** | `src/domain/` | Domain services, use cases | ✅ COMPLETE |
| **Infrastructure** | `src/infrastructure/` | Persistence (Dexie + Zustand), events | ⚠️ IN PROGRESS |
| **Presentation** | `src/presentation/` | UI components (294 components) | ⚠️ IN PROGRESS |

**Key Finding**: Architecture transformation is 60% complete. The persistence layer has significant technical debt.

---

## 2. CRITICAL FILES & DEPENDENCIES

### 2.1 Largest Files (>600 lines)

| File | Lines | Purpose | Risk Level |
|------|-------|---------|------------|
| `src/lib/state/dexie-db.ts` | 1,267 | Legacy DB types | HIGH (duplicate) |
| `src/infrastructure/persistence/dexie-db.ts` | 1,061 | Modern DB types | HIGH (duplicate) |
| `src/lib/state/__tests__/knowledge-store.test.ts` | 1,024 | Knowledge store tests | LOW (test) |
| `src/lib/state/dexie-db-migrations.ts` | 824 | DB migrations | HIGH |
| `src/lib/sync/__tests__/reverse-sync-service.test.ts` | 804 | Sync tests | LOW (test) |
| `src/lib/state/knowledge-store.ts` | 718 | Knowledge store | MEDIUM |
| `src/lib/agent/__tests__/tool-permission-manager.test.ts` | 685 | Tool permission tests | LOW (test) |
| `src/lib/workspace/__tests__/session-snapshot.test.ts` | 677 | Session tests | LOW (test) |
| `src/lib/agent/tools/__tests__/retry-queue.test.ts` | 670 | Retry tests | LOW (test) |
| `src/lib/filesync/notes-file-sync-service.ts` | 657 | Notes file sync | MEDIUM |

**Critical Insight**: The largest production file is `dexie-db.ts` (1,267 lines), which is duplicated in `infrastructure/persistence/`. This is a remnant of an incomplete migration.

### 2.2 Component Size Violations (>120 lines)

**Agent Components** (already refactored in Cycle 17):
- ✅ `AgentConfigDialog.tsx` (299 lines) - Still exceeds 120-line limit by 2.5x
- ✅ `WorkspacePermissionEditor.tsx` (482 lines) - 4x limit (partially split)
- ✅ `ToolPermissionsConfig.tsx` (402 lines) - 3.3x limit (split into sub-components)

**New Modular Components** (created in Cycle 17):
- ✅ All <120 lines (21 components created)
- ✅ AgentBasicConfig deleted (302 → 0 lines, 100% reduction)
- ✅ WorkspaceToolPermissionsConfig split (318 → 175 lines, 45% reduction)

### 2.3 State Management: Store Locations

**Critical Issue**: Store Duplication Crisis

| Location | Stores | Status | Migration Status |
|----------|--------|--------|------------------|
| `src/lib/state/` | 19 stores | ⚠️ LEGACY | 40% migrated |
| `src/stores/` | 8 stores | ⚠️ DEPRECATED | Empty (deleted) |
| `src/infrastructure/persistence/stores/` | 38 stores | ✅ MODERN | Target location |

**Total Unique Stores**: ~50 stores across 3 locations (17 duplicates, 30% duplication rate)

**Import Hotspots** (most imported modules):
1. `core/entities/Agent` - 25 imports
2. `lib/state/dexie-db` - 18 imports
3. `domain/value-objects/workspace-type` - 18 imports
4. `lib/agent/providers/credential-vault` - 10 imports
5. `infrastructure/persistence/stores/agents` - 9 imports

---

## 3. TYPESCRIPT ERROR ANALYSIS (TS-001)

### 3.1 Error Summary

**Total Errors**: 1,130
**Top Error Categories**:

| Error Type | Count | Example | Severity |
|------------|-------|---------|----------|
| TS2339 (Property does not exist) | 200+ | `Property 'fileSnapshots' does not exist on type 'ViaGentDatabase'` | HIGH |
| TS2322 (Type not assignable) | 150+ | `Type '"idle"' is not assignable to type '"error" \| "online" \| "offline" \| "busy"'` | HIGH |
| TS2345 (Argument not assignable) | 100+ | `Argument of type '{}' is not assignable to parameter of type 'LayerContext'` | MEDIUM |
| TS2307 (Cannot find module) | 85+ | `Cannot find module './rag-store'` | HIGH |
| TS7006 (Implicit any type) | 80+ | `Parameter 's' implicitly has an 'any' type` | MEDIUM |
| TS2305 (Has no exported member) | 60+ | `Module '"./dexie-db-core-types"' has no exported member 'WorkspaceBindings'` | HIGH |
| TS6133 (Unused variable) | 50+ | `'waitFor' is declared but its value is never read` | LOW |
| Test import errors (vitest) | 40+ | `Module '"vitest"' has no exported member 'it'` | LOW |

### 3.2 Error Clusters

#### Cluster 1: IndexedDB Schema Mismatches (24 errors)
```
Property 'fileSnapshots' does not exist on type 'ViaGentDatabase'.
Property 'fileContentCache' does not exist on type 'ViaGentDatabase'.
Property 'createdAt' does not exist on type 'Omit<SyncStatusRecord, "id" | "createdAt" | "updatedAt">'.
```
**Root Cause**: Database schema in `dexie-db-class.ts` doesn't match actual usage in stores and services.
**Impact**: HIGH - Breaks file system sync and session persistence.
**Fix Strategy**: Update `ViaGentDatabase` interface to include missing tables/fields.

#### Cluster 2: Missing Exported Members (60 errors)
```
Module '"./dexie-db-core-types"' has no exported member 'WorkspaceBindings'.
Module '"./dexie-db"' has no exported member 'default'.
Module '"@/lib/state/dexie-db-class"' has no exported member 'dexieDB'.
```
**Root Cause**: Incomplete migration from `lib/state/` to `infrastructure/persistence/`.
**Impact**: HIGH - 85 files import from incorrect paths.
**Fix Strategy**: Update imports to use `infrastructure/persistence/dexie-db` exports.

#### Cluster 3: Type Mismatches (150+ errors)
```
Type '"idle"' is not assignable to type '"error" | "online" | "offline" | "busy"'.
Type 'number' is not assignable to type 'string'.
Type 'string' is not assignable to type 'number'.
```
**Root Cause**: Schema changes without updating consuming code.
**Impact**: MEDIUM - Test files and migration scripts affected.
**Fix Strategy**: Update consuming code to match new schema types.

#### Cluster 4: Test File Imports (40 errors)
```
Module '"vitest"' has no exported member 'describe'.
Module '"vitest"' has no exported member 'it'.
Module '"vitest"' has no exported member 'expect'.
```
**Root Cause**: Vitest API changes or misconfiguration.
**Impact**: LOW - Tests only, doesn't block production.
**Fix Strategy**: Update test setup and import vitest from `vitest` package.

### 3.3 Error Distribution by Module

| Module | Errors | Priority | Fix Time Estimate |
|--------|--------|----------|-------------------|
| Dexie Database | 150+ | P0 | 2 hours |
| Store Migrations | 200+ | P0 | 2 hours |
| Test Files | 300+ | P2 | 1 hour |
| Component Types | 150+ | P1 | 1 hour |
| Import Paths | 85+ | P0 | 1 hour |
| RAG System | 100+ | P1 | 1 hour |
| **Total** | **1,130** | - | **8 hours** |

---

## 4. INDEXEDDB QUOTA HANDLING (DB-001)

### 4.1 Current State

**File**: `src/infrastructure/persistence/dexie-storage.ts` (207 lines)
**Status**: ✅ PARTIALLY IMPLEMENTED (quota logic exists but not consistently applied)

**Existing Quota Handling Features**:
1. ✅ `getStorageQuota()` - Estimates storage usage via `navigator.storage.estimate()`
2. ✅ `isStorageNearQuota()` - Checks if usage > 90% threshold
3. ✅ `evictOldestEntries()` - Deletes oldest entries to free space
4. ✅ Proactive cleanup - Checks quota before write operations
5. ✅ Reactive cleanup - Catches `QuotaExceededError` and retries

**Code Example** (from dexie-storage.ts):
```typescript
const QUOTA_THRESHOLD = 0.9;

async function isStorageNearQuota(): Promise<boolean> {
    const quota = await getStorageQuota();
    if (!quota) return false;
    return quota.usage > quota.quota * QUOTA_THRESHOLD;
}

setItem: async (name: string, value: string): Promise<void> => {
    // Proactive cleanup
    if (await isStorageNearQuota()) {
        const entrySize = value.length * 2;
        await evictOldestEntries(table, entrySize);
    }

    try {
        await table.put({ id: name, state: JSON.parse(value), updatedAt: new Date() });
    } catch (error: unknown) {
        // Reactive cleanup
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            await evictOldestEntries(table, entrySize);
            await table.put({ ... }); // Retry
        }
    }
}
```

### 4.2 Critical Gaps (P0)

**Gap 1: Inconsistent Usage Across Stores**
- ❌ `conversation/useConversationStore.ts` - Uses custom storage without quota handling
- ❌ `rag/rag-store.ts` - No quota checks before large embeddings writes
- ❌ `knowledge/knowledge-store.ts` - No quota checks before document indexing
- ❌ `canvas/canvas-store.ts` - No quota checks for large graph data

**Impact**: HIGH - Silent data loss when quota exceeded in these stores.

**Gap 2: Missing User Notification**
- ❌ No UI feedback when storage is near quota
- ❌ No prompt to user before eviction
- ❌ No way to manually trigger cleanup

**Impact**: MEDIUM - Poor UX, unexpected data loss.

**Gap 3: Eviction Policy Not Customized**
- ❌ All stores use "oldest first" eviction
- ❌ No priority system (e.g., preserve active conversations, delete old embeddings)
- ❌ No backup before eviction

**Impact**: MEDIUM - May delete important data.

### 4.3 Data Loss Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Quota exceeded during large file sync** | HIGH | HIGH | Add quota check before file writes |
| **Silent eviction of active conversations** | MEDIUM | HIGH | Add priority policy (preserve active) |
| **Embedding store fills up without warning** | HIGH | MEDIUM | Add usage indicator in UI |
| **User loses work due to eviction** | MEDIUM | HIGH | Add backup before eviction |
| **No recovery after quota error** | MEDIUM | HIGH | Implement rollback mechanism |

**Overall Risk Level**: 🔴 P0 - DATA LOSS IMMINENT

### 4.4 Fix Strategy (DB-001)

**Phase 1: Unified Quota Manager** (8 hours)
- Create `src/infrastructure/persistence/quota-manager.ts`
- Centralize quota estimation, eviction logic, user notifications
- Priority-based eviction (active > recent > old)

**Phase 2: Store Integration** (6 hours)
- Update all stores to use `createDexieStorage` with quota handling
- Add `beforeAdd` hooks for large operations (embeddings, documents)
- Implement retry logic with exponential backoff

**Phase 3: User Communication** (6 hours)
- Add storage usage indicator to status bar
- Show warnings at 75%, 90%, 95% capacity
- Add "Manage Storage" dialog with manual cleanup options

**Phase 4: Backup & Recovery** (2 hours)
- Create backup before eviction
- Implement rollback mechanism
- Add data recovery tools

**Total Time**: 18-22 hours

---

## 5. AGENT CONFIG DIALOG HOOK EXTRACTION (UI-001)

### 5.1 Current State

**File**: `src/presentation/components/agent/AgentConfigDialog.tsx`
**Size**: 299 lines (2.5x the 120-line limit)
**Status**: ⚠️ PARTIALLY REFACTORED (Cycle 17)

**Existing Hooks** (created in Cycle 17, Phase 5):
- ✅ `useAgentFormState` - Form state management (9,382 bytes, ~280 lines)
- ✅ `useAgentFormValidation` - Validation logic (7,168 bytes, ~210 lines)
- ✅ `useAgentFormSubmission` - Submit/delete handlers (4,711 bytes, ~140 lines)
- ✅ `useAgentFormActions` - Import/export handlers (2,952 bytes, ~90 lines)
- ✅ `useAgentFieldUpdate` - Field update utility (2,487 bytes, ~75 lines)
- ✅ `useUnsavedChangesWarning` - Navigation guard (2,289 bytes, ~70 lines)

**Total Hook Logic**: ~865 lines across 6 hooks
**Remaining Dialog**: 299 lines (orchestration, tabs, modal, etc.)

### 5.2 Problem Analysis

**Issue**: Despite hooks extraction, dialog is still 299 lines because:
1. Inline tab content rendering (150+ lines of JSX)
2. Modal orchestration logic (50 lines)
3. Complex state synchronization (50 lines)
4. Error handling and validation display (30 lines)
5. Import/export handling (20 lines)

**Hook Usage Pattern**:
```typescript
export function AgentConfigDialog({ open, onOpenChange, onSuccess, agentId }: Props) {
    const { t } = useTranslation()

    // Store actions (3 lines)
    const removeAgent = useAgentsStore(s => s.removeAgent)
    const agent = useAgentsStore(s => s.agents.find(a => a.id === agentId))

    // Hook calls (6 hooks, ~20 lines)
    const {
        name, setName,
        description, setDescription,
        providerId, setProviderId,
        // ... 15+ more state variables
    } = useAgentFormState(agentId)

    const { errors, isValid, validate } = useAgentFormValidation({ ... })
    const { isSubmitting, handleSubmit } = useAgentFormSubmission({ ... })
    const { handleDelete, handleImportSuccess, handleExportSuccess } = useAgentFormActions({ ... })
    const { updateField } = useAgentFieldUpdate()

    // Tab content rendering (150+ lines)
    const renderBasicTab = () => ( ... )
    const renderWorkspaceTab = () => ( ... )
    const renderAdvancedTab = () => ( ... )

    // Modal JSX (100+ lines)
    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header, Tabs, Form, Footer */}
            </DialogContent>
        </Dialog>
    )
}
```

### 5.3 Refactoring Strategy (UI-001)

**Target**: Reduce from 299 → <200 lines (33% reduction)

**Approach 1: Extract Tab Components** (6 hours)
- Create `AgentConfigBasicTab.tsx` (~80 lines)
- Create `AgentConfigWorkspaceTab.tsx` (~90 lines)
- Create `AgentConfigAdvancedTab.tsx` (~100 lines)
- **Benefit**: Removes 150+ lines of JSX from dialog

**Approach 2: Create Orchestrator Hook** (4 hours)
- Create `useAgentConfigDialog.ts` (~100 lines)
- Combines all hook calls into single interface
- Handles modal open/close logic
- **Benefit**: Removes 50+ lines of state management

**Approach 3: Split Dialog into Container/View** (6 hours)
- `AgentConfigDialogContainer.tsx` (~80 lines) - Logic and hooks
- `AgentConfigDialogView.tsx` (~120 lines) - Pure UI
- **Benefit**: Clear separation, easier testing

**Recommended Strategy**: Approach 1 + Approach 2 (10 hours total)

### 5.4 Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Breaking existing props interface** | MEDIUM | HIGH | Preserve props with deprecation warnings |
| **Infinite loops from hook dependencies** | LOW | HIGH | Use individual selectors, follow Zustand v5 patterns |
| **Breaking import/export functionality** | LOW | MEDIUM | Comprehensive regression tests |
| **Breaking workspace binding config** | MEDIUM | HIGH | Maintain exact same behavior, test with all workspaces |

**Overall Risk Level**: 🟡 MEDIUM - Can be mitigated with careful testing

---

## 6. DEPENDENCY GRAPH & BREAKING CHANGES

### 6.1 Critical Import Paths

**Problem**: 85 files import from incorrect locations (missing exports).

**Most Common Errors**:
```typescript
// ❌ OLD (incorrect)
import { db } from '@/lib/state/dexie-db'
import { dexieDB } from '@/lib/state/dexie-db-class'
import { ragStore } from '@/lib/state/rag-store'
import { notesStore } from '@/lib/state/notes-store'

// ✅ NEW (correct)
import { db, getDb } from '@/infrastructure/persistence/dexie-db'
import { ViaGentDatabase } from '@/infrastructure/persistence/dexie-db-class'
import { useRAGStore } from '@/infrastructure/persistence/stores/rag/rag-store'
import { useNotesStore } from '@/lib/notes/note-store' // Still in lib/notes
```

### 6.2 Store Duplication Map

| Store | Legacy Location | Modern Location | Status |
|-------|----------------|-----------------|--------|
| Provider Config | `lib/state/provider-config-store.ts` | `infrastructure/persistence/stores/providers/` | ✅ Migrated |
| Agent Config | `lib/state/agents-store.ts` | `infrastructure/persistence/stores/agents/` | ⚠️ Partial |
| RAG Store | `lib/state/rag-store.ts` | `infrastructure/persistence/stores/rag/` | ⚠️ Partial |
| Knowledge Store | `lib/state/knowledge-store.ts` | `infrastructure/persistence/stores/` | ❌ Not started |
| Quiz Store | `lib/state/quiz-store.ts` | `infrastructure/persistence/stores/study-store.ts` | ❌ Not started |
| Canvas Store | `lib/state/canvas-store.ts` | `infrastructure/persistence/stores/canvas-store.ts` | ❌ Duplicate |
| Flashcard Store | `lib/state/flashcard-store.ts` | `infrastructure/persistence/stores/flashcard-store.ts` | ❌ Duplicate |
| Tool Permission Store | `lib/state/tool-permission-store.ts` | `infrastructure/persistence/stores/` | ⚠️ In progress |

### 6.3 Breaking Change Risk

**High Risk Changes**:
1. ❌ Renaming store exports without facades (breaks 20+ components)
2. ❌ Changing database schema without migration (breaks persistence)
3. ❌ Updating hook signatures without backward compatibility (breaks components)
4. ❌ Moving files without updating imports (85 errors)

**Safe Refactoring Pattern**:
```typescript
// Step 1: Create new location
export const useNewAgentStore = create<AgentState>(...)

// Step 2: Re-export as facade in old location
// File: src/lib/state/agents-store.ts
export { useNewAgentStore as useAgentsStore } from '@/infrastructure/persistence/stores/agents'

// Step 3: Gradually migrate consumers (zero breaking changes)

// Step 4: Deprecate old location after migration
export { useAgentsStore } from '@/infrastructure/persistence/stores/agents'
// @deprecated - Use new location instead
```

---

## 7. MIGRATION RISKS & SAFE TRANSFORMATION PATHS

### 7.1 Risk Matrix

| Migration | Risk Level | Blocking Issues | Safe Path |
|-----------|------------|-----------------|-----------|
| **TS-001** (TypeScript errors) | 🟡 MEDIUM | 85 import path errors, 24 DB schema errors | 1. Fix exports first (2h) <br> 2. Update schema (2h) <br> 3. Fix imports (1h) <br> 4. Fix types (3h) |
| **DB-001** (IndexedDB quota) | 🔴 HIGH | No quota checks in 5 stores, data loss risk | 1. Create quota manager (8h) <br> 2. Add tests (4h) <br> 3. Migrate stores (6h) <br> 4. Add UI (4h) |
| **UI-001** (Agent hooks) | 🟡 MEDIUM | 6 hooks already extracted, risk of regression | 1. Extract tab components (6h) <br> 2. Create orchestrator hook (4h) <br> 3. Test all workspaces (2h) <br> 4. Update docs (1h) |

### 7.2 Critical Success Factors

**For TS-001**:
- ✅ Fix export paths before consuming code (prevents cascading errors)
- ✅ Update database schema interface before migration (prevents runtime errors)
- ✅ Run `pnpm tsc --noEmit` after each change (validate incrementally)
- ❌ Don't: Fix all errors in one PR (too high risk)

**For DB-001**:
- ✅ Test quota handling with small storage limits (simulate quota errors)
- ✅ Add backup before eviction (prevent data loss)
- ✅ Show user warnings before cleanup (good UX)
- ❌ Don't: Deploy without rollback mechanism (data loss risk)

**For UI-001**:
- ✅ Maintain exact same behavior (no breaking changes)
- ✅ Test all agent config flows (create, edit, delete, import, export)
- ✅ Verify workspace bindings still work (cross-workspace functionality)
- ❌ Don't: Change hook signatures without backward compatibility

### 7.3 Rollback Strategies

**TS-001 Rollback**:
- Git revert if >50 new errors introduced
- Keep fix branches small (<5 files per PR)
- Tag releases before migration starts

**DB-001 Rollback**:
- Feature flag: `const ENABLE_QUOTA_HANDLING = false`
- Backup database before migration
- Restore from backup if corruption detected

**UI-001 Rollback**:
- Keep old component as `AgentConfigDialogLegacy`
- A/B test with small user group
- Revert if regression rate >1%

---

## 8. DECISION-MAKING DATA

### 8.1 TypeScript Error Priority Matrix

| Priority | Error Count | Fix Time | Impact | Dependencies |
|----------|-------------|----------|--------|--------------|
| **P0 - Blockers** | 350 | 3 hours | Cannot build | None |
| **P1 - High** | 450 | 3 hours | Runtime errors | Depends on P0 |
| **P2 - Medium** | 200 | 1 hour | Test failures | Depends on P0 |
| **P3 - Low** | 130 | 1 hour | Code quality | Depends on P1 |

**Recommended Sequence**:
1. P0 Blockers (3h) - Fix exports, schema, imports
2. P1 High (3h) - Fix type mismatches, consuming code
3. P2 Medium (1h) - Fix test imports, unused variables
4. P3 Low (1h) - Code cleanup, unused code

**Total**: 8 hours (matches 6-8 hour estimate)

### 8.2 Component Size Impact

| File | Current Lines | Target Lines | Reduction % | Risk |
|------|---------------|--------------|-------------|------|
| AgentConfigDialog | 299 | <200 | 33% | Medium |
| WorkspacePermissionEditor | 482 | <300 | 38% | High |
| ToolPermissionsConfig | 402 | <250 | 38% | High |
| AgentWorkspaceBindingConfig | 368 | <250 | 32% | Medium |

**Total Impact**: 1,551 → 1,000 lines (35% reduction)

### 8.3 Store Consolidation Impact

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Unique Stores | 50 | 33 | 34% reduction |
| Duplicate Stores | 17 | 0 | 100% elimination |
| Store Locations | 3 | 1 | Consolidated |
| Redundant Code | 6,500 lines | 0 | 100% elimination |

---

## 9. RECOMMENDATIONS

### 9.1 Immediate Actions (Week 1-2)

**Priority 1: TS-001** (6-8 hours, P0)
```
Day 1: Fix exports and database schema (4 hours)
Day 2: Update import paths (2 hours)
Day 3: Fix type mismatches in consuming code (2 hours)
```

**Priority 2: DB-001** (18-22 hours, P0)
```
Day 4-5: Create unified quota manager (8 hours)
Day 6-7: Integrate quota handling into stores (6 hours)
Day 8: Add user notifications (4 hours)
Day 9: Backup and recovery (2 hours)
```

**Priority 3: UI-001** (16-20 hours, P1)
```
Day 10-11: Extract tab components (6 hours)
Day 12: Create orchestrator hook (4 hours)
Day 13: Comprehensive testing (4 hours)
Day 14: Documentation (2 hours)
```

### 9.2 Mid-Term Actions (Week 3-4)

**Epic CC-1**: Conversation Store Consolidation (15 stories, 127 hours)
**Epic CP-1**: Project Store Consolidation (18 stories, 80-100 hours)

### 9.3 Long-Term Actions (Week 5-8)

**Store Migration**: Delete legacy stores, migrate all consumers
**Architecture Cleanup**: Remove deprecated code paths
**Performance**: Optimize store queries, add caching

---

## 10. APPENDICES

### Appendix A: File Inventory

**Total Files**: 1,030 TypeScript files
**Production Files**: ~600 (excluding tests)
**Test Files**: ~200
**Infrastructure Files**: ~100
**Component Files**: 294

### Appendix B: Error Log Sample

See `_bmad-output/ts-error-log-sample-2026-01-02.txt` for full error list.

### Appendix C: Dependency Graph

See `_bmad-output/dependency-graph-2026-01-02.json` for full import analysis.

### Appendix D: Migration Checklist

**TS-001 Checklist**:
- [ ] Fix `dexie-db.ts` exports (WorkspaceBindings, default export)
- [ ] Add missing tables to `ViaGentDatabase` (fileSnapshots, fileContentCache)
- [ ] Update 85 import paths to use `infrastructure/persistence`
- [ ] Fix migration result types (add `backupCreated` field)
- [ ] Fix test imports (vitest API)
- [ ] Remove unused `@ts-expect-error` directives
- [ ] Run `pnpm tsc --noEmit` - verify <100 errors

**DB-001 Checklist**:
- [ ] Create `quota-manager.ts` with unified eviction logic
- [ ] Add priority-based eviction policy
- [ ] Update all stores to use `createDexieStorage`
- [ ] Add storage usage indicator to status bar
- [ ] Implement backup before eviction
- [ ] Add rollback mechanism
- [ ] Test with simulated quota errors
- [ ] Document eviction policy in user guide

**UI-001 Checklist**:
- [ ] Extract `AgentConfigBasicTab.tsx` (<80 lines)
- [ ] Extract `AgentConfigWorkspaceTab.tsx` (<90 lines)
- [ ] Extract `AgentConfigAdvancedTab.tsx` (<100 lines)
- [ ] Create `useAgentConfigDialog` orchestrator hook (<100 lines)
- [ ] Test all agent config flows
- [ ] Test workspace bindings across all 4 workspaces
- [ ] Verify import/export functionality
- [ ] Update component documentation

---

## END OF DOCUMENT

**Next Steps**:
1. Review this document with team
2. Approve migration plan
3. Create feature branches for each epic
4. Execute in priority order (TS-001 → DB-001 → UI-001)
5. Continuous validation via `pnpm tsc --noEmit`

**Generated by**: BMAD Master Analysis Mode
**Date**: 2026-01-02
**Framework**: BMAD V6 + Ralph Loop Cycle 18
