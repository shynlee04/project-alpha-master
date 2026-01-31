# PS-02 Implementation Plan: Create StorageAdapter Domain Interface

**Epic**: EPIC-CC-01 (Project Space Foundation)  
**Story**: PS-02  
**Created**: 2026-01-14T23:00:00+07:00  
**Status**: PLANNED  
**Confidence Level**: 95%+

---

## 📊 Width Analysis: Detectable Issues

### Current State (What Exists)

| Layer | File | Status |
|-------|------|--------|
| **Domain** | `/src/domain/interfaces/storage-adapter.interface.ts` | EXISTS ✅ |
| **Infrastructure** | `/src/infrastructure/sync/adapters/base-adapter.ts` | EXISTS ✅ |
| **Infrastructure** | `/src/infrastructure/sync/adapters/fsa-adapter-core.ts` | EXISTS ✅ |
| **Infrastructure** | `/src/infrastructure/sync/adapters/idb-adapter-core.ts` | EXISTS ✅ |
| **Facade** | `/src/lib/filesystem/unified-storage-adapter.ts` | EXISTS ⚠️ |

### Issues Identified

| Issue | Severity | Evidence |
|-------|----------|----------|
| **Interface Duplication** | HIGH | `StorageAdapter` defined in both domain AND infrastructure |
| **Facade Extends, Doesn't Implement** | HIGH | `UnifiedStorageAdapter extends LocalFSAdapter` instead of `implements StorageAdapter` |
| **Domain→Infrastructure Import** | CRITICAL | `unified-file-crud.ts:31` imports from infrastructure |
| **Type Duplication** | MEDIUM | `FileMetadata`, `FileContent` in both layers |

### Files Requiring Changes (80+ files identified)

| Category | Count | Impact |
|----------|-------|--------|
| Domain Interfaces | 3 | Low |
| Infrastructure Adapters | 15 | Medium |
| Sync Services | 12 | Medium |
| Agent Tools | 8 | Medium |
| Presentation Components | 12 | High |
| Tests | 7 | Low |

---

## 🔬 Depth Analysis: Framework Beyond

### Collateral Damage Assessment

#### 1. Cross-Workspace Impact (HIGH RISK)

| Workspace | Files Affected | Risk Level |
|-----------|----------------|------------|
| IDE | `useFileTreeActions.ts`, `IDEFileHandlers.ts` | Medium |
| Notes | `ProjectFilesPanel.tsx`, `note-file-sync.ts` | Medium |
| Knowledge | `knowledge-sync-service-core.ts` | Medium |
| Study | `study-sync-service-core.ts` | Medium |

**Risk**: Changing adapter interface signature could break all workspace file operations.

**Mitigation**: Ensure new interface is backward-compatible with existing FSA/IDB implementations.

#### 2. Agent Tool Impact (MEDIUM RISK)

| Tool | Method | Impact |
|------|--------|--------|
| Read Tool | `readFile` | Medium |
| Write Tool | `writeFile` | Medium |
| Delete Tool | `deleteFile` | Medium |
| List Tool | `listFiles` | Medium |

**Risk**: Agent tools use `context.fileAdapter` - changing interface breaks all agent file operations.

**Mitigation**: Add adapter methods to maintain API compatibility.

#### 3. Sync Manager Impact (HIGH RISK)

| Component | Methods | Impact |
|-----------|---------|--------|
| `SyncManager` | `writeFile`, `deleteFile` | High |
| `SyncExecutor` | `writeFile` | High |
| `ReverseSyncService` | Multiple | High |

**Risk**: Sync operations depend on current adapter structure.

**Mitigation**: Wrap existing adapters, don't break existing API.

#### 4. Store Slice Impact (MEDIUM RISK)

| Slice | Methods | Impact |
|-------|---------|--------|
| `use-storage-adapter-slice.ts` | Directory handle management | Medium |
| `use-file-ops-slice.ts` | File operations | Medium |
| `use-file-loader-slice.ts` | Project loading | Medium |

**Risk**: Store slices manage adapter state - changes affect workspace loading.

**Mitigation**: Keep state management separate from adapter operations.

---

## 🎯 Solution Design (95%+ Confidence)

### Approach: **Consolidation + Facade Pattern**

Based on 2026 research (Flystorage pattern, TanStack patterns), the solution is:

1. **Domain interface is the source of truth** - infrastructure re-exports from domain
2. **UnifiedStorageAdapter implements StorageAdapter** - doesn't extend LocalFSAdapter
3. **Factory creates typed adapters** - no direct instantiation in consumers
4. **Zero breaking changes** - maintain backward compatibility

### Architecture After Fix

```
┌─────────────────────────────────────────────────────────────┐
│                    DOMAIN LAYER                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ storage-adapter.interface.ts                        │    │ ← SOURCE OF TRUTH
│  │ - StorageAdapter (core interface)                   │    │
│  │ - FileMetadata, FileContent, FileChangeEvent        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ↓ (re-export)
┌─────────────────────────────────────────────────────────────┐
│                INFRASTRUCTURE LAYER                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ adapters/index.ts                                   │    │
│  │ export { StorageAdapter } from '@/domain/interfaces'│    │ ← RE-EXPORT
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ adapters/fsa-adapter-core.ts                        │    │ ← NO CHANGE NEEDED
│  │ - implements StorageAdapter                         │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ adapters/idb-adapter-core.ts                        │    │ ← NO CHANGE NEEDED
│  │ - implements StorageAdapter                         │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ↓ (implements)
┌─────────────────────────────────────────────────────────────┐
│                    FACADE LAYER                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ unified-storage-adapter.ts                          │    │ ← REFACTOR
│  │ - class UnifiedStorageAdapter implements StorageAdapter│  │
│  │ - Delegates to FSAAdapter or IDBAdapter             │    │
│  │ - No longer extends LocalFSAdapter                  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Implementation Steps

### Step 1: Verify Domain Interface (Day 1 - 1 hour)

**Action**: Read and validate existing domain interface

**Files**:
- `/src/domain/interfaces/storage-adapter.interface.ts`

**Validation Criteria**:
- [ ] Interface includes: `readFile`, `writeFile`, `deleteFile`, `listFiles`, `getMetadata`, `exists`
- [ ] Types are exportable
- [ ] No infrastructure imports

**Artifacts**:
- Confirm interface is complete or note modifications needed

---

### Step 2: Consolidate Interface (Day 1 - 2 hours)

**Action**: Remove duplicate interface from infrastructure

**Files to Modify**:
- `/src/infrastructure/sync/core/sync-result-types.ts`
- `/src/infrastructure/sync/adapters/base-adapter.ts`

**Changes**:
```typescript
// BEFORE (infrastructure/sync/core/sync-result-types.ts)
export interface StorageAdapter { ... }  // DUPLICATE

// AFTER
export type { StorageAdapter, FileMetadata, FileContent } from '@/domain/interfaces/storage-adapter.interface';
```

**Validation Criteria**:
- [ ] No TypeScript errors from duplicate type removal
- [ ] All infrastructure files import from domain

---

### Step 3: Refactor UnifiedStorageAdapter (Day 1 - 3 hours)

**Action**: Make UnifiedStorageAdapter implement StorageAdapter

**File**: `/src/lib/filesystem/unified-storage-adapter.ts`

**Current**:
```typescript
export class UnifiedStorageAdapter extends LocalFSAdapter {
  private storageType: StorageType;
  // ...
}
```

**After**:
```typescript
export class UnifiedStorageAdapter implements StorageAdapter {
  readonly name = 'unified';
  private adapter: StorageAdapter;  // Delegate to FSA or IDB
  
  async readFile(path: string): Promise<FileContent> {
    return this.adapter.readFile(path);
  }
  // ... delegate all StorageAdapter methods
}
```

**Validation Criteria**:
- [ ] `UnifiedStorageAdapter` implements `StorageAdapter`
- [ ] All methods delegate to underlying adapter
- [ ] No breaking changes to consumers

---

### Step 4: Fix Domain→Infrastructure Import (Day 2 - 2 hours)

**Action**: Remove infrastructure import from domain service

**File**: `/src/domain/services/file-crud/unified-file-crud.ts`

**Current** (line ~31):
```typescript
import { FSAAdapter } from '@/infrastructure/sync/adapters/fsa-adapter-core';
```

**After**:
```typescript
import type { StorageAdapter } from '@/domain/interfaces/storage-adapter.interface';
// Adapter injected via constructor or context
```

**Validation Criteria**:
- [ ] Domain layer has zero infrastructure imports
- [ ] Service accepts `StorageAdapter` interface type
- [ ] Factory provides adapter instance

---

### Step 5: Update Factory Pattern (Day 2 - 2 hours)

**Action**: Ensure factory creates properly-typed adapters

**File**: `/src/infrastructure/sync/adapters/adapter-factory.ts`

**Changes**:
- Return `StorageAdapter` type from factory functions
- Ensure FSA/IDB adapters are typed as `StorageAdapter`

**Validation Criteria**:
- [ ] Factory returns `StorageAdapter` type
- [ ] Consumers can use `StorageAdapter` without knowing concrete type

---

### Step 6: Update Store Slices (Day 2 - 2 hours)

**Action**: Update workspace slices to use new adapter pattern

**Files**:
- `/src/infrastructure/persistence/stores/workspace/slices/use-storage-adapter-slice.ts`

**Changes**:
- Import `StorageAdapter` from domain
- Type adapter instances as `StorageAdapter`
- Maintain state management separate from adapter operations

**Validation Criteria**:
- [ ] Store slices use `StorageAdapter` type
- [ ] No regression in workspace loading

---

### Step 7: Run Validation (Day 2 - 1 hour)

**Automated Checks**:
```bash
pnpm exec tsc --noEmit  # Expected: 0 errors from adapter changes
pnpm build              # Expected: Build succeeds
```

**Manual Checks**:
- [ ] IDE workspace loads project
- [ ] Notes workspace creates/edits files
- [ ] Knowledge workspace imports sources
- [ ] Study workspace creates flashcards
- [ ] Agent tools read/write files correctly

---

## 🧪 Testing Strategy

### Unit Tests

| Test | File | Coverage |
|------|------|----------|
| Interface compliance | `adapters/__tests__/storage-adapter.test.ts` | FSAAdapter, IDBAdapter |
| Factory pattern | `adapters/__tests__/factory.test.ts` | Adapter creation |
| Unified adapter delegation | `unified-storage-adapter.test.ts` | All methods |

### Integration Tests

| Test | File | Coverage |
|------|------|----------|
| Workspace file operations | `workspace-services/__tests__/file-ops.test.ts` | IDE, Notes, Knowledge |
| Agent tool file operations | `agent/facades/__tests__/file-tools.test.ts` | Read, Write, Delete, List |

### E2E Tests

| Test | Coverage |
|------|----------|
| Full workspace workflow | Create project → Load → Edit → Sync |

---

## 🔍 Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking changes in consumer code | Medium | High | Test all 80+ files; backward-compatible API |
| Adapter initialization timing | Low | Medium | Ensure adapter ready before use |
| Permission handling regression | Low | High | Test FSA permission flow |
| Quota management in IDB | Low | Critical | Verify IDBAdapter.quota handling |

---

## 📦 Files to Create

| File | description | Lines |
|------|---------|-------|
| `adapters/__tests__/storage-adapter.test.ts` | Interface compliance tests | 100 |
| `adapters/__tests__/factory.test.ts` | Factory pattern tests | 80 |

---

## 📝 Files to Modify

| File | Change | Lines |
|------|--------|-------|
| `infrastructure/sync/core/sync-result-types.ts` | Re-export from domain | -50 |
| `infrastructure/sync/adapters/base-adapter.ts` | Import from domain | -20 |
| `lib/filesystem/unified-storage-adapter.ts` | Implement interface | +100 |
| `domain/services/file-crud/unified-file-crud.ts` | Remove infra import | -10 |
| `infrastructure/sync/adapters/adapter-factory.ts` | Return typed adapter | +20 |
| `persistence/stores/workspace/slices/use-storage-adapter-slice.ts` | Use StorageAdapter type | +10 |

---

## 📊 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Domain→Infrastructure imports | 0 | Code review |
| TypeScript errors from adapter | 0 | `pnpm tsc --noEmit` |
| Adapter interface compliance | 100% | Unit tests |
| Workspace file operations | 100% | Manual testing |
| Agent tool file operations | 100% | Manual testing |

---

## 🔗 Related Stories

| Story | Dependency | Impact |
|-------|------------|--------|
| PS-01 (Split god store) | COMPLETE ✅ | Provides slices |
| **PS-03 (Consolidate DB)** | BLOCKED BY | Needs StorageAdapter |
| **PS-04 (Fix Import)** | BLOCKED BY | Needs StorageAdapter |
| BYOK-01 (Split credentials) | COMPLETE ✅ | Pattern reference |

---

## 📚 References

- **Epic File**: `_bmad-output/sprint-artifacts/epic-cc-01-project-space-foundation-2026-01-14.yaml`
- **Research**: Context7, Exa web search for 2026 patterns
- **Architecture**: Clean Architecture by Robert Martin
- **Pattern**: Flystorage adapter pattern (2025-2026 standard)

---

*Plan generated with 95%+ confidence based on:*
- *Sub-agent investigation of 80+ files*
- *2026 storage adapter patterns research*
- *Existing domain interface analysis*
