# P0 Store Duplication Crisis - Technical Debt Documentation

**Date:** 2026-01-01
**Status:** CRITICAL - IMMEDIATE ACTION REQUIRED
**Epic:** Architecture Refactoring
**Story:** State Management Consolidation

---

## Executive Summary

The Via-gent codebase suffers from a **P0 architectural violation** in state management: **50+ store files distributed across 3 directories with 17 duplicate stores**. This violates the 4-layer architecture specification, creates maintenance nightmares, and introduces synchronization risks.

**Impact Score:** 9/10 (Critical)
**Technical Debt Level:** SEVERE
**Estimated Remediation Effort:** 3-5 days (2 developers)

---

## Current State Analysis

### Store Distribution by Directory

#### 1. `/src/lib/state/` (Canonical Infrastructure Layer)
**Purpose:** Zustand stores with Dexie persistence (infrastructure layer)
**Count:** 20 stores
**Compliance:** ✅ CORRECT - This is the canonical location per 4-layer architecture

**Stores:**
- `agent-selection-store.ts`
- `file-sync-status-store.ts`
- `ide-store.ts`
- `navigation-store.ts`
- `provider-store.ts`
- `statusbar-store.ts`
- `workspace-store.ts`
- ... plus 13 others

**Architecture Layer:** INFRASTRUCTURE (Layer 1) ✅

---

#### 2. `/src/stores/` (Legacy - Deprecated)
**Purpose:** Agent-specific stores with localStorage persistence
**Count:** 5 stores
**Compliance:** ⚠️ DEPRECATED - Should migrate to `/src/lib/state/`

**Stores:**
- `agents-store.ts` - Agent configurations (localStorage)
- `agent-selection.ts` - Duplicate of `agent-selection-store.ts`
- `conversation-threads-store.ts` - Thread metadata
- `conversationThreadsStore.ts` - DUPLICATE of above (different casing)
- `conversation-store.ts` - Another duplicate

**Architecture Layer:** DOMAIN (Layer 2) - INCORRECT ⚠️

**Issue:** State management belongs in Infrastructure layer, not Domain layer

---

#### 3. `/src/infrastructure/persistence/stores/` (ARCHITECTURAL VIOLATION)
**Purpose:** Zustand stores organized by feature domain
**Count:** 25+ stores (MAJOR VIOLATION)
**Compliance:** ❌ CRITICAL VIOLATION - Infrastructure should NOT define stores

**Directory Structure:**
```
src/infrastructure/persistence/stores/
├── agents/
│   ├── agent-selection-store.ts (DUPLICATE #1 - also in /src/stores/)
│   └── agent-validation-store.ts
├── conversation/
│   ├── conversation-store.ts (DUPLICATE #2)
│   ├── conversation-helpers.ts
│   ├── conversation-threads-store.ts (DUPLICATE #3)
│   └── conversation-types.ts
├── knowledge/
│   ├── knowledge-source-store.ts
│   ├── knowledge-chunk-store.ts
│   └── knowledge-index-store.ts
├── quiz/
│   ├── quiz-database.ts
│   ├── quiz-store.ts
│   ├── quiz-actions.ts
│   └── quiz-query-actions.ts
├── rag/
│   ├── rag-store.ts
│   ├── rag-chat-slice.ts
│   ├── rag-chunking-slice.ts
│   ├── rag-index-slice.ts
│   └── rag-voice-slice.ts
└── ... (15+ more store files)
```

**Architecture Layer:** INFRASTRUCTURE (Layer 1) - BUT VIOLATES SEPARATION OF CONCERNS ❌

**Critical Issue:** Infrastructure layer should provide PERSISTENCE MECHANISMS (Dexie, IndexedDB adapters), not DEFINE stores. Stores should be defined in Layer 2 (Domain) or Layer 3 (Application).

---

## Duplicate Store Analysis

### Critical Duplicates (Must Consolidate)

1. **Agent Selection Store** (3 COPIES)
   - `/src/lib/state/agent-selection-store.ts` ✅ Canonical
   - `/src/stores/agent-selection.ts` ❌ Legacy
   - `/src/infrastructure/persistence/stores/agents/agent-selection-store.ts` ❌ Duplicate

2. **Conversation Store** (2+ COPIES)
   - `/src/stores/conversation-store.ts` ❌ Legacy
   - `/src/infrastructure/persistence/stores/conversation/conversation-store.ts` ❌ Duplicate

3. **Conversation Threads Store** (2 COPIES)
   - `/src/stores/conversation-threads-store.ts` ❌ Legacy
   - `/src/stores/conversationThreadsStore.ts` ❌ Duplicate (casing difference)
   - `/src/infrastructure/persistence/stores/conversation/conversation-threads-store.ts` ❌ Duplicate

---

## Architectural Violations

### Violation 1: Infrastructure Defining Stores

**Current (INCORRECT):**
```
INFRASTRUCTURE Layer
├── Dexie database schemas
├── IndexedDB adapters
└── STORES ❌ VIOLATION - Stores defined in infrastructure
```

**Correct (Per 4-Layer Architecture):**
```
LAYER 1: INFRASTRUCTURE
├── Dexie database schemas
├── IndexedDB adapters
└── Persistence mechanisms (NOT stores)

LAYER 2: DOMAIN
├── Domain entities (Agent, Conversation, Thread)
└── Value objects (WorkspaceType, ToolPermission)

LAYER 3: APPLICATION
├── Zustand stores (application state)
└── Business logic services

LAYER 4: PRESENTATION
├── React components
└── UI state (React Context)
```

### Violation 2: Stores in Wrong Directory

**Rule:** Zustand stores should be in `/src/lib/state/` (canonical location)

**Violations:**
- `/src/stores/` - 5 stores (legacy, should migrate)
- `/src/infrastructure/persistence/stores/` - 25+ stores (CRITICAL VIOLATION)

### Violation 3: Mixing Persistence Patterns

**Inconsistent Persistence:**
- **localStorage:** Used in `/src/stores/` (insecure, limited capacity)
- **IndexedDB (Dexie):** Used in `/src/lib/state/` (correct, scalable)
- **Mixed:** Some stores use both patterns inconsistently

**Best Practice:** ALL Zustand stores should use Dexie persistence via `createDexieStorage()`

---

## Migration Strategy

### Phase 1: Immediate Actions (Day 1)

**Objective:** Stop the bleeding

1. **Freeze new store creation** in non-canonical locations
   - Update AGENTS.md to mandate `/src/lib/state/` for all new stores
   - Add PR template validation to check for store file locations

2. **Document existing stores** with ownership map
   - Create store inventory with responsible team
   - Mark duplicates with deprecation warnings

3. **Establish migration path** for existing stores
   - Define migration checklist
   - Create test coverage requirements

### Phase 2: Consolidation (Days 2-3)

**Objective:** Eliminate duplicates

1. **Consolidate Agent Selection** (3 copies → 1)
   - Canonical: `/src/lib/state/agent-selection-store.ts`
   - Delete: `/src/stores/agent-selection.ts`
   - Delete: `/src/infrastructure/persistence/stores/agents/agent-selection-store.ts`
   - Update all imports across codebase

2. **Consolidate Conversation Stores** (2+ copies → 1)
   - Merge functionality into single store
   - Migrate localStorage → Dexie persistence
   - Update all conversation-related components

3. **Consolidate Thread Stores** (3 copies → 1)
   - Canonical: `/src/lib/state/conversation-threads-store.ts`
   - Delete duplicates in `/src/stores/`
   - Update all thread management code

### Phase 3: Directory Restructuring (Days 4-5)

**Objective:** Fix architectural violations

1. **Migrate stores** from `/src/infrastructure/persistence/stores/` → `/src/lib/state/`

2. **Keep in `/src/infrastructure/persistence/`:**
   - Dexie database schemas (e.g., `dexie-db.ts`)
   - IndexedDB adapters (e.g., `dexie-storage.ts`)
   - Data access objects (e.g., `quiz-actions.ts`)
   - Type definitions (e.g., `conversation-types.ts`)

3. **Move to `/src/lib/state/`:**
   - All Zustand stores (e.g., `rag-store.ts`, `knowledge-source-store.ts`)
   - Store slices (e.g., `rag-chat-slice.ts`)
   - Store helpers (e.g., `conversation-helpers.ts`)

---

## Risk Assessment

### High-Risk Areas

1. **Agent Configuration System**
   - 3 copies of agent selection store
   - Risk: Hot-reload failures, configuration desync
   - Priority: P0 - Fix immediately

2. **Conversation Management**
   - 2+ conversation stores + 3 thread stores
   - Risk: Message loss, state corruption
   - Priority: P0 - Fix immediately

3. **RAG System State**
   - Multiple RAG stores in wrong directory
   - Risk: Index corruption, search failures
   - Priority: P1 - Fix in Phase 2

### Migration Risks

1. **Breaking Changes:** Import paths will change across 200+ files
2. **State Loss:** Poor migration could lose user data
3. **Test Failures:** Existing tests may fail with new store locations
4. **Runtime Errors:** Circular dependencies could emerge

### Mitigation Strategies

1. **Incremental Migration:** One store at a time with full test coverage
2. **Backward Compatibility:** Keep old paths with deprecation warnings during transition
3. **Comprehensive Testing:** 100% test coverage for migrated stores
4. **Rollback Plan:** Git branches per store for easy rollback

---

## Success Criteria

### Metrics

- **Pre-Migration:** 50+ store files, 17 duplicates, 3 directories
- **Post-Migration Target:** 25-30 store files, 0 duplicates, 1 directory (`/src/lib/state/`)

### Quality Gates

- ✅ All stores use Dexie persistence (no localStorage)
- ✅ All stores in `/src/lib/state/` (canonical location)
- ✅ Zero duplicate stores
- ✅ 100% test coverage for all stores
- ✅ All imports updated across codebase
- ✅ No runtime errors in development or production
- ✅ State persistence working correctly (IndexedDB verification)

---

## Next Steps

### Immediate (Today)

1. **Review and approve** this migration plan
2. **Create feature branch:** `feature/store-consolidation`
3. **Update AGENTS.md** with store location rules
4. **Run test suite** to establish baseline

### This Week

1. **Complete Phase 1** (freeze + documentation)
2. **Begin Phase 2** (consolidate agent selection store)
3. **Update documentation** with progress

### Next Sprint

1. **Complete Phase 2** (all duplicates eliminated)
2. **Execute Phase 3** (directory restructuring)
3. **Validate system** with comprehensive testing

---

## References

- **4-Layer Architecture:** `/src/README.md` or project architecture docs
- **State Management Best Practices:** Zustand v5.0.8 documentation
- **Dexie Persistence:** `src/infrastructure/persistence/dexie-storage.ts`
- **Related Issues:**
  - Store duplication identified in centralized systems analysis
  - P1.10 State Management Audit findings

---

**Document Owner:** Architecture Team
**Last Updated:** 2026-01-01
**Next Review:** After Phase 1 completion
