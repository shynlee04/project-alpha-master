# Current Gap Analysis: useWorkspace() → useWorkspaceSync()
**Date:** 2026-01-19  
**Author:** analyst-ext  
**Status:** Complete Analysis

---

## 1. Comparison Table

| Aspect | Past (`useWorkspace`) | Current (`useWorkspaceSync`) | Gap |
|--------|----------------------|------------------------------|-----|
| **Context Type** | React Context + Hook | React Context + Hook | ✅ Consolidated |
| **Unified Provider** | 3 separate providers | 1 unified provider | ✅ Improved |
| **Cornerstone Stores** | 5 separate stores | 5 stores via `useCornerstoneStores` | ✅ Consolidated |
| **File Operations** | `LocalFSAdapter` | `UnifiedStorageAdapter` + `StorageGateway` | ⚠️ Hybrid state |
| **Sync Status** | `SyncStatus` enum | `SyncStatus` + `SyncProgress` | ✅ Enhanced |
| **Permission State** | `FsaPermissionState` | `FsaPermissionState` | ✅ Preserved |
| **Adapter Pattern** | Direct `LocalFSAdapter` | `StorageAdapterFactory` + `StorageGateway` | ⚠️ Incomplete migration |
| **State Persistence** | localStorage | Dexie (IndexedDB) via `createDexieStorage` | ✅ Migrated |
| **Event Bus** | Custom implementation | `WorkspaceEventEmitter` | ✅ Standardized |
| **Ref Exposure** | `localAdapterRef`, `syncManagerRef` | Same refs via `useWorkspaceSync()` | ✅ Preserved |

---

## 2. Missing Features Analysis

### 2.1 Past Features Missing in Current

| Feature | Past Location | Current Status | Impact |
|---------|--------------|----------------|--------|
| **Direct `LocalFSAdapter` usage** | `src/lib/filesystem/local-fs-adapter.ts` | Deprecated facade | ⚠️ FileTree still uses it |
| **File Tree specific hooks** | `useFileTreeState`, `useFileTreeActions` | Still use old patterns | 🔴 Broken |
| **Context Menu Actions** | `useContextMenuActions` | Uses old `LocalFSAdapter` | 🔴 Broken |
| **`UnifiedStorageAdapter`** | `src/lib/filesystem/unified-storage-adapter.ts` | Exists but not integrated | 🟡 Incomplete |
| **`StorageGateway` abstraction** | `src/domain/interfaces/storage-gateway.interface.ts` | Defined, not used by hooks | 🔴 Not integrated |
| **Dexie Adapter** | `src/infrastructure/filesystem/dexie-storage-adapter.ts` | Factory references old path | ⚠️ Broken import |

### 2.2 Current Features Not in Past

| Feature | Location | Purpose |
|---------|----------|---------|
| **`PlatformContract`** | `src/infrastructure/filesystem/platform-contract.ts` | Device-aware storage routing |
| **`FSAGateway`** | `src/infrastructure/filesystem/fsa-gateway.ts` | StorageGateway FSA impl |
| **`IDBGateway`** | `src/infrastructure/filesystem/idb-gateway.ts` | StorageGateway IndexedDB impl |
| **`FileTreeScanner`** | `src/infrastructure/filesystem/file-tree-scanner.ts` | Fast project loading |
| **`ViagentService`** | `src/infrastructure/filesystem/viagent-service.ts` | .viagent/ metadata |
| **`MarkdownSyncService`** | `src/infrastructure/filesystem/markdown-sync-service.ts` | Notes ↔ Markdown sync |

### 2.3 Features to Remove

| Feature | Reason |
|---------|--------|
| **`UnifiedStorageAdapter`** (in `lib/filesystem`) | Should be consumed via `StorageAdapterFactory` |
| **`LocalFSAdapter` facade** | Implementation moved to `infrastructure/filesystem` |
| **`createStorageAdapter` (old path)** | Replaced by `StorageAdapterFactory` |

---

## 3. Store Architecture Analysis

### 3.1 Zustand Patterns in Use

```typescript
// Current pattern (CORRECT)
export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({ ... }),
    {
      name: 'workspace-state',
      storage: createDexieStorage('providerConfigs'),
      partialize: (state) => ({ currentWorkspace: state.currentWorkspace }),
    }
  )
);

// Hook with useShallow (CORRECT - prevents re-renders)
export function useWorkspaceContext() {
  return useWorkspaceStore(useShallow((state) => ({
    currentWorkspace: state.currentWorkspace,
    currentProjectId: state.currentProjectId,
    isTransitioning: state.isTransitioning,
  })));
}
```

### 3.2 TanStack Store Patterns (NOT USED)

The codebase claims to use TanStack Store, but **no evidence found**:

- ❌ No `@tanstack/store` imports
- ❌ No TanStack Store usage in workspace stores
- ❌ All stores use Zustand v5

**Gap**: TanStack Store was intended but not implemented. All stores use Zustand.

### 3.3 Migration Recommendations

| Action | Priority | Complexity |
|--------|----------|------------|
| Standardize on Zustand v5 (current) | N/A | Low |
| Remove TanStack Store references from docs | 🟡 | Low |
| Document that TanStack Store was abandoned for Zustand | 🟡 | Low |

---

## 4. Dexie Schema Map

### 4.1 Current Tables

| Table | Type | Purpose | Used By |
|-------|------|---------|---------|
| `projects` | Core | Project metadata | Project store |
| `providerConfigs` | Session | LLM provider configs | Zustand persist |
| `agentConfigs` | Session | Agent configurations | Agent store |
| `workspaceState` | Session | Workspace persistence | Workspace store |
| `fsaHandles` | Session | FSA handle persistence | Permission lifecycle |
| `fileMetadata` | Session | File metadata cache | Sync manager |
| `fileSyncStatus` | Session | Sync status tracking | File sync store |
| `notes` | Core | Notes content | Notes workspace |
| `conversations` | Core | Chat conversations | Conversation store |
| `ragState` | Session | RAG indexing state | RAG store |

### 4.2 Recommendations

| Recommendation | Rationale |
|----------------|-----------|
| **Keep `providerConfigs` for Zustand** | Working pattern, quota handling |
| **Migrate `fileMetadata` to StorageGateway** | Should use `FileEntry` from gateway |
| **Consider `fileSyncStatus` consolidation** | Redundant with gateway state |

### 4.3 File Operation Storage Assignment

| Operation | Should Use | Currently Uses |
|-----------|------------|----------------|
| **IDE file reads** | `StorageGateway.read()` | `LocalFSAdapter` |
| **IDE file writes** | `StorageGateway.write()` | `LocalFSAdapter` |
| **Notes files** | Dexie `notes` table | `MarkdownSyncService` |
| **Project metadata** | Dexie `projects` table | ✅ Correct |
| **FSA handles** | Dexie `fsaHandles` table | ✅ Correct |

---

## 5. Broken Links Report

### 5.1 Import Issues

| File | Broken Import | Should Be |
|------|---------------|-----------|
| `StorageAdapterFactory.ts:50` | `@/lib/filesystem/unified-storage-adapter` | `@/infrastructure/filesystem/dexie-storage-adapter` |
| `useFileTreeState.ts:2` | `@/lib/filesystem/local-fs-adapter` | `@/infrastructure/filesystem` |
| `useFileTreeActions.ts:4-8` | `@/lib/filesystem/local-fs-adapter` | `@/infrastructure/filesystem` |
| `useContextMenuActions.ts:3` | `@/lib/filesystem/local-fs-adapter` | `@/infrastructure/filesystem` |
| `FileTree.tsx:53` | `@/lib/workspace` | Correct (re-exports) |
| `FileTree.tsx:54` | `@/infrastructure/persistence/stores/workspace` | ✅ Correct |

### 5.2 Missing Exports

| Expected Export | Location | Status |
|-----------------|----------|--------|
| `StorageGateway` factory | `src/infrastructure/filesystem/index.ts:111-117` | ✅ Exported |
| `DexieStorageAdapter` class | `src/infrastructure/filesystem/` | ❌ Not found |
| `createDexieStorage` (canonical) | `src/infrastructure/persistence/dexie-storage.ts` | ✅ Exists |
| `StorageAdapter` interface | `src/domain/interfaces/` | ✅ Split (adapter vs gateway) |

### 5.3 Circular Dependencies

| Cycle | Severity | Components |
|-------|----------|------------|
| `lib/filesystem` ↔ `infrastructure/filesystem` | 🟡 Medium | Facade pattern causing confusion |
| `useWorkspaceFileSystem` → `useCornerstoneStores` | 🟢 Low | Intentional composition |
| `FileTree` → `useWorkspaceSync` → `UnifiedWorkspaceProvider` | 🟢 Low | Correct dependency |

---

## 6. Gap Severity Classification

| Gap | Severity | Impact | Fix Complexity | Priority |
|-----|----------|--------|----------------|----------|
| **FileTree uses old LocalFSAdapter** | 🔴 Critical | IDE file operations broken on mobile | Medium | P0 |
| **StorageGateway not integrated in hooks** | 🔴 Critical | Dual adapter patterns coexist | High | P0 |
| **Dexie adapter import broken** | 🔴 Critical | Factory cannot create IDB adapter | Low | P0 |
| **Context menu uses deprecated API** | 🟠 High | File operations may fail | Medium | P1 |
| **TanStack Store documentation mismatch** | 🟡 Medium | Misleading for new developers | Low | P2 |
| **UnifiedStorageAdapter facade confusion** | 🟡 Medium | Migration path unclear | Low | P2 |
| **Missing error handling in gateway** | 🟡 Medium | Runtime errors possible | Medium | P2 |
| **Platform contract not used by FileTree** | 🟢 Low | Suboptimal routing | Low | P3 |

---

## 7. Key Findings Summary

### 7.1 What's Working ✅

1. **UnifiedWorkspaceContext** - Properly consolidates 3 previous providers
2. **useWorkspaceSync()** - Provides clean API for file system operations
3. **Dexie persistence** - Zustand + Dexie working correctly
4. **Platform detection** - `getPlatformContract()` implemented
5. **Event bus** - `WorkspaceEventEmitter` standardized

### 7.2 What's Broken 🔴

1. **FileTree hooks** - Still using deprecated `LocalFSAdapter`
2. **Context menu** - Uses old adapter patterns
3. **StorageGateway** - Defined but not consumed by UI hooks
4. **Dexie adapter path** - Factory imports from wrong location

### 7.3 Architecture Confusion

The codebase has **three parallel storage abstractions**:

| Abstraction | Location | Status |
|-------------|----------|--------|
| `LocalFSAdapter` | `lib/filesystem` | Deprecated facade |
| `StorageAdapter` | `domain/interfaces` | Interface only |
| `StorageGateway` | `domain/interfaces` | Interface + impls |
| `UnifiedStorageAdapter` | `lib/filesystem` | Bridge pattern |

**Recommendation**: Consolidate to single `StorageGateway` abstraction.

---

## 8. Remediation Plan

### Phase 1: Critical Fixes (P0)

1. **Fix Dexie adapter import** in `StorageAdapterFactory.ts`
2. **Migrate FileTree hooks** to use `useWorkspaceSync().localAdapterRef`
3. **Verify StorageGateway factory** creates correct adapter

### Phase 2: High Priority (P1)

1. **Migrate ContextMenu actions** to use `StorageGateway`
2. **Add gateway integration** to `useFileTreeState`
3. **Remove `UnifiedStorageAdapter`** facade

### Phase 3: Cleanup (P2)

1. **Update documentation** to reflect Zustand choice
2. **Remove deprecated exports** from `lib/filesystem`
3. **Consolidate storage interface** to single abstraction

---

## Appendix A: File Reference Map

```
src/infrastructure/persistence/stores/workspace/
├── unified-workspace-context.tsx     ✅ Working
├── unified-workspace-provider.tsx    ✅ Working
├── workspace-store.ts                ✅ Working
├── workspace-provider-slice.ts       ✅ Working
└── [missing hooks]

src/infrastructure/filesystem/
├── index.ts                          ✅ Exports all
├── StorageAdapterFactory.ts          ⚠️ Broken import
├── fsa-storage-adapter.ts            ✅ Working
├── fsa-gateway.ts                    ✅ Working
├── idb-gateway.ts                    ✅ Working
└── [missing dexie-storage-adapter]

src/presentation/components/ide/FileTree/
├── FileTree.tsx                      ⚠️ Uses localAdapterRef
├── hooks/
│   ├── useFileTreeState.ts           🔴 Uses LocalFSAdapter
│   ├── useFileTreeActions.ts         🔴 Uses LocalFSAdapter
│   └── useContextMenuActions.ts      🔴 Uses LocalFSAdapter
└── types.ts                          ✅ OK

src/lib/filesystem/
├── index.ts                          ✅ Facade (deprecated)
└── unified-storage-adapter.ts        🟡 Bridge pattern
```

---

## Appendix B: Recommendations for Next Steps

1. **Run TypeScript check** to identify compile errors
2. **Create test case** for StorageGateway integration
3. **Add integration tests** for FileTree with StorageGateway
4. **Update AGENTS.md** with new storage patterns
5. **Create ADR** documenting final storage architecture decision

---

*Generated by analyst-ext | Investigation Task 2*
*See also: `current-gap-analysis-2026-01-19.md`*
