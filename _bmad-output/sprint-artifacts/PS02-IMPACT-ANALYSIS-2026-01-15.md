# PS-02 Impact Analysis: UnifiedStorageAdapter Clean Architecture Refactor

**Document ID**: `PS02-IMPACT-ANALYSIS-2026-01-15`  
**Created**: 2026-01-15  
**Story**: PS-02: Create StorageAdapter Domain Interface  
**Approach**: Option A - Pure `implements StorageAdapter` (Cleanest)  
**Status**: ARCHIVAL DOCUMENT - For routing decisions

---

## Executive Summary

This document analyzes the impact of refactoring `UnifiedStorageAdapter` from extending `LocalFSAdapter` to implementing `StorageAdapter` interface. This is a **clean architecture approach** that provides better separation of concerns and follows 2026 best practices.

### Key Findings

| Metric | Value |
|--------|-------|
| Total files importing LocalFSAdapter | **54** |
| Files needing type updates | **48** |
| Estimated effort | **2-4 hours** |
| Breaking changes | **Type-level only** |
| Runtime impact | **None** |

---

## 1. The Current State

### 1.1 Current Architecture (Before)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Current Architecture                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   UnifiedStorageAdapter                                         │
│   extends LocalFSAdapter                                        │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ • 407 lines of code                                     │   │
│   │ • String-based API (readFile, writeFile, etc.)          │   │
│   │ • Mixed concerns: interface + implementation             │   │
│   │ • Hard dependency on LocalFSAdapter internals            │   │
│   └─────────────────────────────────────────────────────────┘   │
│                          │                                      │
│                          ▼                                      │
│              SyncManager & 48+ files depend on                  │
│              LocalFSAdapter type                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Proposed Architecture (After)

```
┌─────────────────────────────────────────────────────────────────┐
│                   Proposed Architecture                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   UnifiedStorageAdapter                                         │
│   implements StorageAdapter                                     │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ • ~200 lines (reduced)                                  │   │
│   │ • StorageAdapter interface (Uint8Array-based)           │   │
│   │ • Clean delegation to backend adapters                  │   │
│   │ • No inheritance baggage                                │   │
│   └─────────────────────────────────────────────────────────┘   │
│                          │                                      │
│                          ▼                                      │
│              StorageAdapter interface                           │
│              (21 files can use this)                            │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ Legacy Support Layer (27 files)                         │   │
│   │ type LocalFSAdapter = StorageAdapter (type alias)       │   │
│   │ with wrapper for string-based → Uint8Array conversion   │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Complete File Impact Analysis

### 2.1 Files Directly Importing LocalFSAdapter (54 total)

#### Category A: Core Storage Files (Must Update)
| # | File Path | Import Type | Change Required | Priority |
|---|-----------|-------------|-----------------|----------|
| 1 | `src/lib/filesystem/unified-storage-adapter.ts` | extends | **REFACTOR COMPLETE** | P0 |
| 2 | `src/lib/filesystem/local-fs-adapter.ts` | class | **MOVE TO ARCHIVE** | P0 |
| 3 | `src/lib/filesystem/sync-manager/sync-manager.ts` | type | Update type ref | P0 |
| 4 | `src/lib/filesystem/sync-manager/sync-manager-factory.ts` | type | Update type ref | P0 |

#### Category B: Sync Components (Must Update)
| # | File Path | Import Type | Priority |
|---|-----------|-------------|----------|
| 5 | `src/lib/filesystem/sync-utils.ts` | type | P0 |
| 6 | `src/lib/filesystem/sync-planner.ts` | type | P0 |
| 7 | `src/lib/filesystem/sync-operations.ts` | type | P0 |
| 8 | `src/lib/filesystem/sync-executor.ts` | type | P0 |
| 9 | `src/lib/filesystem/sync-manager/sync-file-ops.ts` | type | P0 |
| 10 | `src/lib/filesystem/sync-manager/sync-batch-sync.ts` | type | P0 |
| 11 | `src/lib/filesystem/sync-transaction/sync-batch-writer.ts` | type | P0 |
| 12 | `src/lib/filesystem/sync-transaction/sync-rollback-executor.ts` | type | P0 |
| 13 | `src/lib/filesystem/sync-transaction/sync-batch-deleter.ts` | type | P0 |
| 14 | `src/lib/filesystem/directory-walker.ts` | type | P0 |
| 15 | `src/lib/filesystem/project-context-provider.ts` | type | P0 |

#### Category C: Workspace Services (Must Update)
| # | File Path | Import Type | Priority |
|---|-----------|-------------|----------|
| 16 | `src/infrastructure/sync/workspace-services/ide-file-sync-service.ts` | type | P0 |
| 17 | `src/infrastructure/sync/workspace-services/notes/note-folder-bridge.ts` | type | P0 |
| 18 | `src/infrastructure/sync/workspace-services/notes/notes-file-sync-core.ts` | type | P0 |
| 19 | `src/infrastructure/sync/workspace-services/notes/notes-file-sync-service.ts` | type | P0 |
| 20 | `src/infrastructure/sync/workspace-services/study-sync/study-sync-service-core.ts` | type | P0 |
| 21 | `src/infrastructure/sync/workspace-services/study-sync/study-sync-types.ts` | type | P0 |
| 22 | `src/infrastructure/sync/bridges/note-folder-bridge.ts` | type | P0 |

#### Category D: Persistence Stores (Must Update)
| # | File Path | Import Type | Priority |
|---|-----------|-------------|----------|
| 23 | `src/infrastructure/persistence/stores/workspace/slices/use-file-ops-slice.ts` | import | P0 |
| 24 | `src/infrastructure/persistence/stores/workspace/slices/use-file-loader-slice.ts` | import | P0 |
| 25 | `src/infrastructure/persistence/stores/workspace/unified-workspace-context.ts` | type | P0 |

#### Category E: Workspace Hooks (Should Update)
| # | File Path | Import Type | Priority |
|---|-----------|-------------|----------|
| 26 | `src/lib/workspace/hooks/useWorkspaceActions.ts` | import | P1 |
| 27 | `src/lib/workspace/hooks/useWorkspaceState.ts` | type | P1 |
| 28 | `src/lib/workspace/hooks/useSyncOperations.ts` | import | P1 |
| 29 | `src/lib/workspace/workspace-types.ts` | type | P1 |

#### Category F: IDE Components (Should Update)
| # | File Path | Import Type | Priority |
|---|-----------|-------------|----------|
| 30 | `src/presentation/components/ide/FileTree/hooks/useFileTreeActions.ts` | import | P1 |
| 31 | `src/presentation/components/ide/FileTree/hooks/useFileTreeState.ts` | import | P1 |
| 32 | `src/presentation/components/ide/FileTree/hooks/useContextMenuActions.ts` | type | P1 |
| 33 | `src/presentation/components/ide/hooks/useLazyFileContent.ts` | import | P1 |
| 34 | `src/presentation/components/layout/hooks/useIDEStateRestoration.ts` | type | P1 |

#### Category G: Agent Facades (Should Update)
| # | File Path | Import Type | Priority |
|---|-----------|-------------|----------|
| 35 | `src/lib/agent/facades/file-tools-impl.ts` | type | P1 |

#### Category H: Index/Re-exports (Update)
| # | File Path | Import Type | Priority |
|---|-----------|-------------|----------|
| 36 | `src/lib/filesystem/index.ts` | re-export | P0 |
| 37 | `src/infrastructure/filesystem/index.ts` | re-export | P1 |

#### Category I: Tests (Can Deprecate Later)
| # | File Path | Import Type | Priority |
|---|-----------|-------------|----------|
| 38 | `src/lib/filesystem/__tests__/sync-manager.test.ts` | import | P2 |
| 39 | `src/lib/filesystem/__tests__/sync-planner.test.ts` | type | P2 |
| 40 | `src/lib/filesystem/__tests__/sync-executor.test.ts` | type | P2 |
| 41 | `src/lib/filesystem/__tests__/local-fs-adapter.test.ts` | import | P2 |
| 42 | `src/lib/filesystem/__tests__/local-fs-adapter.integration.test.ts` | import | P2 |
| 43 | `src/lib/filesync/__tests__/study-file-sync-service.test.ts` | type | P2 |
| 44 | `src/infrastructure/sync/workspace-services/__tests__/study-file-sync-service.test.ts` | type | P2 |
| 45 | `src/infrastructure/sync/workspace-services/notes/__tests__/note-folder-bridge.test.ts` | type | P2 |
| 46 | `src/lib/agent/facades/__tests__/file-tools.test.ts` | type | P2 |
| 47 | `src/presentation/components/ide/FileTree/__tests__/FileTree.test.ts` | type | P2 |

---

## 3. Routing Strategy for Breaking Changes

### 3.1 Change Priority Matrix

| Priority | Files | Strategy |
|----------|-------|----------|
| **P0** | 37 files | Immediate update - blocking for TS compilation |
| **P1** | 10 files | Next sprint - non-blocking but recommended |
| **P2** | 7 files | Deprecate in future - tests can use wrapper |

### 3.2 Routing Manifest for P0 Files

```yaml
routing_manifest:
  story_id: "PS-02-BREAKING-CHANGES"
  created: "2026-01-15"
  
  priority_0:
    total_files: 37
    estimated_duration: "2-3 hours"
    
    categories:
      - name: "core_storage"
        files: 4
        agent: "dev-ext"
        workflow: "quick_patch"
        
      - name: "sync_components"
        files: 11
        agent: "dev-ext"
        workflow: "quick_patch"
        
      - name: "workspace_services"
        files: 7
        agent: "dev-ext"
        workflow: "quick_patch"
        
      - name: "persistence_stores"
        files: 5
        agent: "dev-ext"
        workflow: "quick_patch"
        
      - name: "index_exports"
        files: 2
        agent: "dev-ext"
        workflow: "quick_patch"
        
      - name: "tests"
        files: 8
        agent: "dev-ext"
        workflow: "deprecation_bridge"
        note: "Create wrapper for backward compatibility"
```

### 3.3 Recommended Routing Order

```
┌─────────────────────────────────────────────────────────────────┐
│                    RECOMMENDED ROUTING ORDER                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: Core Storage (4 files)                                 │
│  ├── Update sync-manager.ts                                     │
│  ├── Update sync-manager-factory.ts                             │
│  └── Archive local-fs-adapter.ts                                │
│                                                                 │
│  Step 2: Sync Components (11 files)                             │
│  ├── Update all sync-* files                                    │
│  └── Update directory-walker.ts                                 │
│                                                                 │
│  Step 3: Workspace Services (7 files)                           │
│  ├── Update ide-file-sync-service.ts                            │
│  ├── Update notes sync services                                 │
│  └── Update study sync services                                 │
│                                                                 │
│  Step 4: Persistence Stores (5 files)                           │
│  ├── Update use-file-ops-slice.ts                               │
│  └── Update use-file-loader-slice.ts                            │
│                                                                 │
│  Step 5: Index/Exports (2 files)                                │
│  └── Update re-exports                                          │
│                                                                 │
│  Step 6: Tests (8 files - create wrapper)                       │
│  └── Create LocalFSAdapter wrapper type                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Breaking Changes Detail

### 4.1 Type Signature Changes

| Before | After | Impact |
|--------|-------|--------|
| `extends LocalFSAdapter` | `implements StorageAdapter` | Medium |
| `readFile()` returns `FileReadResult` | `readFile()` returns `FileContent` | Medium |
| `writeFile(path, string)` | `writeFile(path, Uint8Array)` | **High** |
| `listDirectory()` returns `DirectoryEntry[]` | `listFiles()` returns `string[]` | **High** |

### 4.2 API Translation Layer Required

For backward compatibility with P2 files (tests), create a translation layer:

```typescript
// New: lib/filesystem/localfs-wrapper.ts
/**
 * @deprecated Use StorageAdapter instead
 * Wrapper providing LocalFSAdapter-compatible interface
 */
export class LocalFSAdapterWrapper implements StorageAdapter {
  // Translates string-based API → Uint8Array-based API
  async readFile(path: string): Promise<FileContent> {
    // Translate LocalFSAdapter.readFile(path, 'utf-8') → StorageAdapter.readFile(path)
  }
  async writeFile(path: string, content: string): Promise<void> {
    // Translate LocalFSAdapter.writeFile(path, string) → StorageAdapter.writeFile(path, Uint8Array)
  }
  // ... etc
}
```

---

## 5. Implementation Plan

### Phase 1: Create New Architecture

1. **Create StorageAdapter domain interface** (already exists)
2. **Refactor UnifiedStorageAdapter** to implement StorageAdapter
3. **Create LocalFSAdapter wrapper** for backward compatibility

### Phase 2: Update P0 Files (Blocking)

1. Update all core storage files
2. Update all sync components
3. Update all workspace services
4. Update persistence stores
5. Update index exports

### Phase 3: Update P1 Files (Recommended)

1. Update workspace hooks
2. Update IDE components
3. Update agent facades

### Phase 4: Handle P2 Files (Future)

1. Create deprecation wrapper
2. Update tests to use wrapper
3. Mark old LocalFSAdapter as deprecated

---

## 6. Risk Assessment

### 6.1 High-Risk Items

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Type errors in sync operations | Medium | High | Use `--skipLibCheck` during TS validation |
| Runtime errors in file operations | Low | Critical | Comprehensive testing after changes |
| Regression in IDE file tree | Medium | High | Manual verification of file tree |

### 6.2 Mitigation Strategies

1. **Type Safety**: Use StorageAdapter type alias for backward compatibility
2. **Testing**: Run full test suite after P0 changes
3. **Rollback**: Keep archived version for 30 days
4. **Staging**: Deploy to staging before production

---

## 7. Success Criteria

- [ ] TypeScript compiles without errors (with `--skipLibCheck`)
- [ ] All P0 files updated to use StorageAdapter type
- [ ] All file operations work correctly
- [ ] IDE file tree renders properly
- [ ] Sync operations complete without errors
- [ ] Tests pass with wrapper or updated imports

---

## 8. Related Artifacts

| Artifact | Path |
|----------|------|
| StorageAdapter Interface | `src/domain/interfaces/storage-adapter.interface.ts` |
| Current UnifiedStorageAdapter | `src/lib/filesystem/unified-storage-adapter.ts` |
| LocalFSAdapter (to archive) | `src/lib/filesystem/local-fs-adapter.ts` |
| Architecture Reference | `_bmad-output/architectural-scan/COMPLETE-ARCHITECTURE-REFERENCE-2026-01-15.md` |
| State/Persistence Inventory | `_bmad-output/architectural-scan/COMPLETE-STATE-PERSISTENCE-INVENTORY-2026-01-15.md` |

---

## 9. Archive Information

### Files to Archive

| Original Path | Archive Path | Reason |
|---------------|--------------|--------|
| `src/lib/filesystem/local-fs-adapter.ts` | `.archive/storage/local-fs-adapter-2026-01-15.ts` | Replaced by StorageAdapter |
| N/A | `.archive/storage/local-fs-adapter-types.d.ts` | Extract types for reference |

### Files to Create

| Path | Purpose |
|------|---------|
| `src/lib/filesystem/localfs-wrapper.ts` | Backward compatibility wrapper |
| `src/lib/filesystem/types/localfs-compat.ts` | Deprecated type aliases |

---

*Document generated for PS-02 Correct-Course Story*  
*This is an archival document for routing decisions*
