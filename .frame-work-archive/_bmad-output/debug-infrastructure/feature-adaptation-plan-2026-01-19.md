# Feature Adaptation Plan: Past Patterns to Zustand + Dexie Stack

**Document ID:** `feature-adaptation-plan-2026-01-19`
**Created:** 2026-01-19
**Author:** analyst-ext
**Status:** Complete
**Based On:**
- Task 1: `past-feature-audit-2026-01-19`
- Task 2: `current-gap-analysis-2026-01-19`

---

## 1. Executive Summary

This document synthesizes findings from the Past Feature Audit and Current Gap Analysis to create an actionable plan for adapting the working IDE implementation patterns (15-25 days ago) to the current Zustand + Dexie stack.

### Key Findings

The past implementation was built on **TanStack Store** + **idb library** with a sophisticated **WorkspaceContext + Hook Composition** pattern. The current stack has migrated to **Zustand v5** + **Dexie** with a **UnifiedWorkspaceContext** but maintains three parallel storage abstractions causing confusion:

| Aspect | Past | Current | Status |
|--------|------|---------|--------|
| **State Management** | TanStack Store + useState/useRef | Zustand v5 | ✅ Migrated |
| **Persistence** | idb library | Dexie | ✅ Migrated |
| **File Operations** | LocalFSAdapter | StorageGateway (not integrated) | 🔴 Broken |
| **Sync Strategy** | SyncManager dual-write | StorageGateway abstraction | ⚠️ Incomplete |
| **Event Bus** | EventEmitter3 | WorkspaceEventEmitter | ✅ Preserved |
| **Context Pattern** | 3 separate providers | UnifiedWorkspaceContext | ✅ Improved |

### Critical Issues Identified

1. **FileTree hooks** still use deprecated `LocalFSAdapter` imports
2. **StorageGateway** defined but not integrated into UI hooks
3. **Dexie adapter path** broken in `StorageAdapterFactory`
4. **Three parallel abstractions** causing architectural confusion

### Recommended Approach

Consolidate to single `StorageGateway` abstraction while preserving successful patterns:
- Hook composition from past → Zustand slices
- Ref-based adapter caching → Zustand refs + factory
- Event bus decoupling → Continue with WorkspaceEventEmitter
- State-based auto-sync → Zustand state flags

---

## 2. Feature Comparison Matrix

### 2.1 Past Features → Current Status Mapping

| Past Feature | Current Status | Adaptation Approach | Priority | Effort |
|--------------|----------------|---------------------|----------|--------|
| **WorkspaceContext Pattern** | UnifiedWorkspaceContext | Keep as-is, migrate hooks to Zustand | P0 | 2h |
| **useWorkspaceState** | useWorkspaceSync | Refactor to use Zustand slices | P0 | 3h |
| **LocalFSAdapter** | StorageGateway | Create bridge, then migrate | P0 | 4h |
| **SyncManager dual-write** | StorageGateway abstraction | Keep dual-write logic, refactor to gateway | P0 | 4h |
| **IndexedDB via idb** | Dexie persistence | Keep as-is (working) | P0 | 0h |
| **EventEmitter3** | WorkspaceEventEmitter | Keep as-is | P1 | 0h |
| **useWorkspaceActions** | useWorkspaceSync actions | Refactor to Zustand actions | P1 | 2h |
| **useSyncOperations** | useWorkspaceSync initialization | Refactor to factory pattern | P1 | 2h |
| **useInitialSync** | Need implementation | Add Zustand-based trigger | P1 | 3h |
| **useEventBusEffects** | Need implementation | Add Zustand integration | P1 | 2h |
| **File Tree Refresh Key** | Need implementation | Add Zustand state flag | P2 | 1h |
| **Permission Lifecycle** | Need refactoring | Integrate with PlatformContract | P2 | 2h |
| **IDE State Persistence** | Partially working | Refactor to Dexie + Zustand | P2 | 3h |
| **TanStack Store Derived** | Not used | Remove from docs | P3 | 0h |
| **Project Self-Registration** | Working via project-store | Keep as-is | P1 | 0h |
| **Sync Badges/Numbers** | Not implemented | Add via Zustand computed | P2 | 2h |
| **Reactive File Display** | Need implementation | Use StorageGateway + Zustand | P2 | 3h |

### 2.2 Feature Status Summary

| Status | Count | Description |
|--------|-------|-------------|
| ✅ **Working** | 4 | Project persistence, Dexie schema, WorkspaceContext consolidation, EventEmitter |
| ⚠️ **Partially Working** | 6 | StorageGateway defined, PlatformContract exists, FSA adapter working, IDB gateway working, Zustand stores exist, Dexie persistence works |
| 🔴 **Broken** | 8 | FileTree hooks (LocalFSAdapter), ContextMenu actions, StorageGateway integration, Dexie adapter import, Hook refactoring incomplete, Auto-sync trigger missing, EventBus effects missing, IDE state persistence partial |
| ❌ **Not Implemented** | 6 | FileTree refresh key, Sync badges, Reactive file display, Permission lifecycle refactor, Auto-save with tree sync, Hot reload from child folders |

### 2.3 Features to Remove

| Feature | Reason for Removal |
|---------|-------------------|
| `UnifiedStorageAdapter` (lib/filesystem) | Duplicate abstraction, should use StorageGateway |
| `LocalFSAdapter` facade (lib/filesystem) | Implementation moved to infrastructure |
| TanStack Store references | Never implemented, causes confusion |
| `createStorageAdapter` (old path) | Replaced by StorageAdapterFactory |

---

## 3. Pattern Translation Guide

### 3.1 TanStack Store → Zustand v5 Equivalents

| TanStack Pattern | Zustand v5 Equivalent | Implementation Notes |
|------------------|----------------------|---------------------|
| `new Store<T>(initialValue)` | `create<T>((set, get) => ({...}))` | Zustand creator pattern |
| `new Derived({ deps, fn })` | **Not available** | Use computed packages or manual selectors |
| `store.get()` | `get().property` | Access state outside components |
| `store.set({ ... })` | `set({ ... })` | Update state inside store |
| `useStore(store)` | `useStore hook` | Zustand has built-in hook |

### 3.2 Hook Composition → Zustand Slices

| Past Hook Pattern | Current Equivalent | Adaptation |
|-------------------|-------------------|------------|
| `useWorkspaceState()` | `useWorkspaceStore` + `useShallow` | Convert to Zustand slice |
| `useSyncOperations()` | `StorageAdapterFactory` | Factory creates adapters |
| `useWorkspaceActions()` | Zustand actions | Add to store, export via hook |
| `useInitialSync()` | Need implementation | Zustand state + useEffect |
| `useEventBusEffects()` | Need implementation | Zustand + useEffect |

### 3.3 Ref-Based Adapter Caching

**Past Pattern (LocalFSAdapter):**
```typescript
// Created once, cached in ref
const localAdapterRef = useRef<LocalFSAdapter | null>(null);
if (!localAdapterRef.current) {
    localAdapterRef.current = new LocalFSAdapter();
    localAdapterRef.current.setDirectoryHandle(handle);
}
```

**Current Equivalent (StorageGateway):**
```typescript
// Factory creates and caches
const gateway = StorageAdapterFactory.create(project.storageType);

// Or via Zustand store
const { storageGateway } = useWorkspaceStore(
    useShallow((state) => ({ storageGateway: state.storageGateway }))
);
```

### 3.4 Context Composition → Zustand + Hooks

**Past Pattern:**
```typescript
// WorkspaceContext.tsx composition
export function WorkspaceProvider({ children }) {
    const state = useWorkspaceState();
    const actions = useWorkspaceActions(state);
    const syncOps = useSyncOperations(state);
    const eventEffects = useEventBusEffects(state);
    
    return (
        <WorkspaceContext.Provider value={{ ...state, ...actions }}>
            {children}
        </WorkspaceContext.Provider>
    );
}
```

**Current Equivalent:**
```typescript
// unified-workspace-context.tsx (already implemented)
export function UnifiedWorkspaceProvider({ children }) {
    return (
        <UnifiedWorkspaceContext.Provider value={contextValue}>
            {children}
        </UnifiedWorkspaceContext.Provider>
    );
}
```

### 3.5 Event Bus Pattern

**Past Pattern (EventEmitter3):**
```typescript
// lib/events/workspace-events.ts
export function createWorkspaceEventBus() {
    return new EventEmitter<WorkspaceEvents>();
}

// Usage
eventBus.emit('file:modified', { path, source: 'editor' });
eventBus.on('sync:completed', handleComplete);
```

**Current Equivalent:**
```typescript
// Already implemented: WorkspaceEventEmitter
export const workspaceEventBus = new WorkspaceEventEmitter();

// Zustand integration
useEffect(() => {
    const handleComplete = (result) => {
        useFileSyncStore.getState().setSyncStatus('completed');
    };
    workspaceEventBus.on('sync:completed', handleComplete);
    return () => workspaceEventBus.off('sync:completed', handleComplete);
}, []);
```

### 3.6 Dual-Write Sync Strategy

**Past Pattern (SyncManager):**
```typescript
async writeFile(path, content) {
    // 1. Write to LocalFS first (source of truth)
    await localAdapter.writeFile(path, content);
    
    // 2. If WebContainer booted, write to WC
    if (isWebContainerBooted) {
        await fs.writeFile(path, content);
    }
}
```

**Current Equivalent (StorageGateway):**
```typescript
// FsAGateway implements dual-write
async writeFile(path, content) {
    await this.fsaAdapter.writeFile(path, content);
    
    if (this.webContainer?.booted) {
        await this.webContainer.fs.writeFile(path, content);
    }
}
```

---

## 4. Implementation Phases

### Phase 1: Foundation (State Management Alignment)

**Goal:** Align Zustand stores with past patterns, fix critical broken imports

| Task | Effort | Dependencies | Output |
|------|--------|--------------|--------|
| Fix Dexie adapter import in StorageAdapterFactory | 30m | None | Working factory |
| Remove TanStack Store references from docs | 15m | None | Clean docs |
| Consolidate storage abstractions | 2h | Factory fix | Single abstraction |
| Verify PlatformContract usage in FileTree | 1h | None | Correct routing |

**Deliverables:**
- ✅ Dexie adapter path corrected
- ✅ Documentation updated
- ✅ Single StorageGateway abstraction
- ✅ FileTree uses PlatformContract

**Validation:**
```bash
pnpm tsc --noEmit  # 0 errors
```

---

### Phase 2: Core Features (FileTree, Sync, Hot Reload)

**Goal:** Restore FileTree functionality, implement missing hooks, integrate StorageGateway

| Task | Effort | Dependencies | Output |
|------|--------|--------------|--------|
| Migrate useFileTreeState to StorageGateway | 2h | Phase 1 | Working file tree state |
| Migrate useFileTreeActions to StorageGateway | 2h | Phase 1 | Working file actions |
| Migrate useContextMenuActions to StorageGateway | 2h | Phase 1 | Working context menu |
| Implement useInitialSync with Zustand | 3h | FileTree hooks | Auto-sync trigger |
| Implement useEventBusEffects with Zustand | 2h | Event bus | Sync status tracking |
| Add FileTree refresh key pattern | 1h | FileTree hooks | Tree re-render on save |

**Deliverables:**
- ✅ FileTree hooks use StorageGateway
- ✅ Auto-sync triggers on WebContainer boot
- ✅ Sync status updates via EventBus
- ✅ FileTree refreshes on file save

**Validation:**
```bash
# Manual test: Open folder, save file, verify tree updates
```

---

### Phase 3: Workspace Expansion (Notes, Project Management)

**Goal:** Add Notes workspace support, improve project management

| Task | Effort | Dependencies | Output |
|------|--------|--------------|--------|
| Integrate Dexie notes table with StorageGateway | 3h | Phase 2 | Notes persistence |
| Implement SyncManager dual-write in FsAGateway | 3h | Phase 2 | Working file sync |
| Add permission lifecycle integration | 2h | PlatformContract | Permission restore |
| Implement project self-registration UI | 2h | Project store | Project creation flow |
| Add sync badges/numbers to UI | 2h | File sync store | Visual sync status |

**Deliverables:**
- ✅ Notes workspace functional
- ✅ File sync working
- ✅ Permission restoration working
- ✅ Visual sync indicators

**Validation:**
```bash
# Manual test: Create note, verify persistence, check sync badge
```

---

### Phase 4: Polish (UI, DX, Documentation)

**Goal:** Improve DX, add tests, complete documentation

| Task | Effort | Dependencies | Output |
|------|--------|--------------|--------|
| Add integration tests for StorageGateway | 4h | All phases | Test coverage |
| Complete IDE state persistence | 3h | Phase 2 | Layout restoration |
| Document final architecture | 2h | All phases | Architecture guide |
| Update AGENTS.md with new patterns | 1h | Documentation | Team docs |
| Create ADR for final storage decision | 2h | All phases | Architectural record |

**Deliverables:**
- ✅ 80% test coverage
- ✅ Layout persistence working
- ✅ Complete documentation
- ✅ ADR for final architecture

**Validation:**
```bash
pnpm vitest run  # All tests pass
```

---

## 5. Risk Matrix

### 5.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **StorageGateway integration breaks FileTree** | Medium | High | Test incrementally, create fallback |
| **Dexie schema incompatible with past data** | Low | High | Create migration script |
| **Zustand refs cause memory leaks** | Low | Medium | Use proper cleanup in useEffect |
| **EventBus circular dependencies** | Low | Medium | Audit dependencies before Phase 2 |
| **WebContainer sync race conditions** | Medium | Medium | Use isWebContainerBooted state flag |
| **FSA permission restore fails** | Medium | High | Fallback to manual folder selection |
| **Mobile Dexie quota exceeded** | Low | High | Implement cleanup策略 |

### 5.2 Process Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Scope creep during adaptation** | High | Medium | Strict phase gates |
| **Dependency conflicts with other epics** | Medium | Medium | Coordinate with EPIC-CC-ARC |
| **Documentation drift** | Medium | Low | Update docs with each phase |
| **Test coverage gaps** | Medium | Low | Add tests before marking complete |

### 5.3 Risk Mitigation Strategies

1. **Incremental Validation**
   - Each phase ends with TypeScript check
   - Manual testing before starting next phase
   - Automated tests for critical paths

2. **Fallback Mechanisms**
   - Keep LocalFSAdapter as fallback during migration
   - Feature flags for new patterns
   - Quick rollback via git stash

3. **Dependency Coordination**
   - Link to EPIC-CC-ARC stories
   - Block on ARC-B01 through ARC-B04 completion
   - Coordinate with dev-ext for implementation

---

## 6. Success Metrics

### 6.1 Quantitative Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **TypeScript Errors** | 0 | `pnpm tsc --noEmit` |
| **Test Coverage** | ≥80% | `pnpm vitest run --coverage` |
| **Build Success** | 100% | `pnpm build` |
| **Import Errors** | 0 | Manual audit of imports |
| **Broken Links** | 0 | grep for deprecated imports |

### 6.2 Qualitative Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **FileTree Functionality** | Full parity with past | Manual test checklist |
| **Auto-Sync Reliability** | Triggers on every WebContainer boot | 10/10 test cycles |
| **Permission Restore** | Works without re-selection | 5/5 test cycles |
| **Notes Persistence** | Survives page reload | Manual test |
| **Event Bus Decoupling** | No prop drilling | Code review |

### 6.3 Test Checklist

- [ ] **P0: Critical Path**
  - [ ] Open folder, verify FileTree displays
  - [ ] Save file in Monaco, verify tree updates
  - [ ] Reload page, verify state restored
  - [ ] Permission dialog, verify grant works

- [ ] **P1: Core Features**
  - [ ] Auto-sync triggers on WebContainer boot
  - [ ] Context menu operations work
  - [ ] File refresh key increments on save
  - [ ] Sync status badge displays correctly

- [ ] **P2: Enhanced Features**
  - [ ] Notes workspace creates/saves
  - [ ] Multiple projects work
  - [ ] Mobile fallback to Dexie works
  - [ ] Permission restore on reload

- [ ] **P3: Polish**
  - [ ] Layout restoration works
  - [ ] Performance acceptable (no jank)
  - [ ] Error handling graceful
  - [ ] Documentation complete

---

## 7. Rollback Plan

### 7.1 Rollback Triggers

| Trigger | Action |
|---------|--------|
| TypeScript errors > 10 | Rollback to last working commit |
| FileTree completely broken | Revert FileTree hooks to LocalFSAdapter |
| StorageGateway factory broken | Use direct FSA/IDB adapters |
| Data corruption detected | Restore from IndexedDB backup |

### 7.2 Rollback Procedures

**Full Rollback (Git):**
```bash
git stash
git checkout <last-working-commit>
git stash pop  # if needed
```

**Partial Rollback (Files):**
```bash
git checkout HEAD -- src/presentation/components/ide/FileTree/hooks/
```

**Data Rollback (IndexedDB):**
```typescript
// Via browser DevTools > Application > IndexedDB
// Delete viagent-database and reload
```

### 7.3 Emergency Contacts

| Issue | Contact |
|-------|---------|
| Architecture decision | architect-ext |
| State management | dev-ext |
| Persistence layer | dev-ext |
| File system access | dev-ext |

---

## 8. Dependencies on Other Work

### 8.1 EPIC-CC-ARC Dependencies

| Story | Dependency | Status | Impact |
|-------|------------|--------|--------|
| ARC-A01 | getPlatformContract() | ✅ Complete | PlatformContract exists |
| ARC-A02 | PlatformContract usage | ✅ Complete | PlatformContract imported |
| ARC-A03 | Store architecture | ✅ Complete | Stores exist |
| ARC-A04 | Store duplication removal | ✅ Complete | Duplicates removed |
| ARC-B01 | StorageGateway interface | ✅ Complete | Interface defined |
| ARC-B02 | FSA adapter | ✅ Complete | FSA adapter implemented |
| ARC-B03 | Dexie adapter | ✅ Complete | Dexie adapter implemented |
| ARC-B04 | StorageAdapterFactory | ⚠️ Broken | Import path broken |

### 8.2 External Dependencies

| Dependency | Purpose | Status |
|------------|---------|--------|
| @tanstack/store | TanStack Store (deprecated) | Not used |
| idb library | IndexedDB wrapper | Replaced by Dexie |
| eventemitter3 | Event bus | ✅ Preserved |
| @webcontainer/api | WebContainer mount | ✅ Existing |

### 8.3 Blockers

| Blocker | Resolution | Owner |
|---------|------------|-------|
| StorageAdapterFactory broken import | Fix in Phase 1 | dev-ext |
| FileTree hooks using deprecated API | Migrate in Phase 2 | dev-ext |
| TanStack Store documentation | Remove from AGENTS.md | analyst-ext |

---

## 9. Recommendations

### 9.1 Immediate Actions (Next Session)

1. **Fix StorageAdapterFactory import** (5 min)
   ```typescript
   // From:
   import { DexieStorageAdapter } from '@/lib/filesystem/unified-storage-adapter';
   // To:
   import { DexieStorageAdapter } from '@/infrastructure/filesystem/dexie-storage-adapter';
   ```

2. **Update AGENTS.md** (10 min)
   - Remove TanStack Store references
   - Document Zustand v5 as sole state management

3. **Verify TypeScript** (2 min)
   ```bash
   pnpm tsc --noEmit > errors.txt 2>&1
   ```

### 9.2 Short-Term (This Sprint)

1. Complete Phase 1: Foundation
2. Start Phase 2: Core Features
3. Coordinate with dev-ext for implementation

### 9.3 Long-Term (Next Sprint)

1. Complete all phases
2. Add comprehensive tests
3. Create final ADR documenting architecture

---

## Appendix A: File Reference Map

### A.1 Past Implementation (Reference Only)

```
_bmad-ext/.archive-past-src/
├── lib/workspace/
│   ├── WorkspaceContext.tsx          ← Hook composition pattern
│   ├── useWorkspaceState.ts          ← State + Refs pattern
│   ├── useWorkspaceActions.ts        ← Actions pattern
│   ├── useSyncOperations.ts          ← Adapter lifecycle
│   ├── useInitialSync.ts             ← Auto-sync trigger
│   └── useEventBusEffects.ts         ← Event handling
├── lib/filesystem/
│   ├── local-fs-adapter.ts           ← FSA wrapper
│   ├── sync-manager.ts               ← Dual-write sync
│   └── permission-lifecycle.ts       ← Permission handling
└── lib/persistence/
    └── db.ts                         ← IndexedDB schema
```

### A.2 Current Implementation (Work In Progress)

```
src/infrastructure/persistence/stores/workspace/
├── unified-workspace-context.tsx     ← ✅ Working (reference)
├── unified-workspace-provider.tsx    ← ✅ Working (reference)
├── workspace-store.ts                ← ✅ Working (reference)
└── workspace-provider-slice.ts       ← ✅ Working (reference)

src/infrastructure/filesystem/
├── index.ts                          ← ✅ Exports all
├── StorageAdapterFactory.ts          ← ⚠️ Broken import
├── fsa-storage-adapter.ts            ← ✅ Working
├── fsa-gateway.ts                    ← ✅ Working
├── idb-gateway.ts                    ← ✅ Working
└── dexie-storage-adapter.ts          ← ←← Broken path

src/presentation/components/ide/FileTree/
├── FileTree.tsx                      ← ⚠️ Uses localAdapterRef
├── hooks/
│   ├── useFileTreeState.ts           ← 🔴 Uses LocalFSAdapter
│   ├── useFileTreeActions.ts         ← 🔴 Uses LocalFSAdapter
│   └── useContextMenuActions.ts      ← 🔴 Uses LocalFSAdapter
└── types.ts                          ← ✅ OK

src/lib/filesystem/
├── index.ts                          ← ✅ Facade (deprecated)
└── unified-storage-adapter.ts        ← 🟡 Bridge (remove)
```

---

## Appendix B: TanStack Store → Zustand Migration Cheatsheet

### B.1 Store Creation

**TanStack Store:**
```typescript
import { Store } from '@tanstack/store';

export const fileSyncStatusStore = new Store<FileSyncStatusMap>(new Map());
```

**Zustand Equivalent:**
```typescript
import { create } from 'zustand';

interface FileSyncStatusMap { [path: string]: SyncStatus }

interface FileSyncStore {
    statusMap: FileSyncStatusMap;
    setStatus: (path: string, status: SyncStatus) => void;
}

export const useFileSyncStore = create<FileSyncStore>((set) => ({
    statusMap: {},
    setStatus: (path, status) => 
        set((state) => ({
            statusMap: { ...state.statusMap, [path]: status }
        })),
}));
```

### B.2 Derived State

**TanStack Store:**
```typescript
export const fileSyncCountsStore = new Derived<FileSyncCounts>({
    deps: [fileSyncStatusStore],
    fn: ({ currDepVals }) => {
        const map = currDepVals[0] as FileSyncStatusMap;
        // Count states...
        return { synced, pending, error, total };
    },
});
```

**Zustand Equivalent:**
```typescript
// Option 1: Manual selector (preferred)
const syncedCount = useFileSyncStore(
    (state) => Object.values(state.statusMap).filter(s => s === 'synced').length
);

// Option 2: Computed package
import { computed } from 'zustand/middleware';
export const useFileSyncCounts = create(
    computed(
        (set, get) => ({
            get counts() {
                const map = get().statusMap;
                return {
                    synced: Object.values(map).filter(s => s === 'synced').length,
                    pending: Object.values(map).filter(s => s === 'pending').length,
                    error: Object.values(map).filter(s => s === 'error').length,
                    total: Object.keys(map).length,
                };
            }
        })
    )
);
```

### B.3 Store Usage

**TanStack Store:**
```typescript
import { useStore } from '@tanstack/store';

// In component
const { synced, pending } = useStore(fileSyncCountsStore);
const statusMap = useStore(fileSyncStatusStore);
```

**Zustand Equivalent:**
```typescript
import { useFileSyncStore, useFileSyncCounts } from '@/stores/file-sync';

// In component
const synced = useFileSyncStore(
    (state) => Object.values(state.statusMap).filter(s => s === 'synced').length
);

// Or with useShallow for multiple values
const { statusMap, setStatus } = useFileSyncStore(
    useShallow((state) => ({
        statusMap: state.statusMap,
        setStatus: state.setStatus,
    }))
);
```

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| **StorageGateway** | Abstraction layer for file operations (FSA on desktop, IndexedDB on mobile) |
| **FsAGateway** | StorageGateway implementation for File System Access API |
| **IDBGateway** | StorageGateway implementation for IndexedDB (Dexie) |
| **UnifiedWorkspaceContext** | Consolidated context provider replacing 3 past providers |
| **Hook Composition** | Pattern where hooks encapsulate logic and are composed in context |
| **Dual-Write** | Strategy of writing to both local FS and WebContainer |
| **FileTree Refresh Key** | React state that forces FileTree re-render when incremented |
| **PlatformContract** | Interface detecting device type and capabilities |

---

*Generated by analyst-ext | Investigation Task 3*
*See also:*
- `past-feature-audit-2026-01-19.md`
- `current-gap-analysis-2026-01-19.md`
