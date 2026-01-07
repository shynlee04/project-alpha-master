# 🔄 COURSE CORRECTION: Storage Type Architecture Gap
**Generated**: 2026-01-07T10:30:00+07:00
**Trigger**: Deep Scan - Storage Type Architecture
**Severity**: P0-CRITICAL
**Impact**: Mobile users blocked, IndexedDB projects non-functional

---

## Executive Summary

**Problem**: `project.storageType` field exists but is **completely ignored** by file sync services. All workspace file sync is hardcoded to `LocalFSAdapter` (FSA-only), blocking mobile users and rendering IndexedDB projects non-functional.

**User Impact**:
- 📱 Mobile users: **BLOCKED** (File System Access API not supported)
- 💾 IndexedDB projects: **NON-FUNCTIONAL** (created but cannot sync files)
- 🔄 Storage type selection: **NO EFFECT** (UI feature exists but does nothing)

---

## Architecture Gap Analysis

### What Exists (Built but Not Wired)

| Asset | Location | Status | Wired |
|-------|----------|--------|-------|
| `StorageAdapter` interface | `sync-result-types.ts` | ✅ Complete | ❌ Unused |
| `BaseStorageAdapter` abstract | `base-adapter.ts` | ✅ Complete | ❌ Unused |
| `IDBAdapter` class | `idb-adapter-core.ts` | ✅ Complete (282 lines) | ❌ Unused |
| `FSAAdapter` class | `fsa-adapter-core.ts` | ✅ Complete (292 lines) | ❌ Unused |
| `createIDBAdapter()` factory | `idb-adapter-factory.ts` | ✅ Exists | ❌ Unused |
| `project.storageType` field | `project-types.ts` | ✅ Defined | ❌ Ignored |

### What's Broken (FSA-Only Hardcoding)

| Component | Issue | Impact |
|-----------|-------|--------|
| `use-file-sync-service.ts` | Hardcoded to `LocalFSAdapter` | ❌ FSA-only |
| `NotesFileSyncService` | Requires `LocalFSAdapter` type | ❌ FSA-only |
| `StudyFileSyncService` | Requires `LocalFSAdapter` type | ❌ FSA-only |
| `KnowledgeFileSyncService` | Requires `LocalFSAdapter` type | ❌ FSA-only |
| `IDEFileSyncService` | Requires `LocalFSAdapter` type | ❌ FSA-only |

### Root Cause: Two Incompatible Adapter Interfaces

```
┌─────────────────────────────────────────────────────────────────────┐
│  StorageAdapter (unified, unused)                                  │
├─────────────────────────────────────────────────────────────────────┤
│  readFile(path): Promise<FileContent>                              │
│  writeFile(path, content: Uint8Array): Promise<void>              │
│  listFiles(pattern): Promise<string[]>                             │
│  getMetadata(path): Promise<FileMetadata>                          │
│  exists(path): Promise<boolean>                                    │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Implements
                              │
┌─────────────────────────────────────────────────────────────────────┐
│  BaseStorageAdapter (abstract)                                     │
├─────────────────────────────────────────────────────────────────────┤
│  ├── IDBAdapter ✅                                                 │
│  └── FSAAdapter ✅                                                 │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  LocalFSAdapter (DIFFERENT interface, used by sync services)      │
├─────────────────────────────────────────────────────────────────────┤
│  readFile(path): Promise<string>  ← Different return type!        │
│  writeFile(path, content: string)  ← Different param type!         │
│  ❌ No listFiles()                                                 │
│  ❌ No getMetadata()                                               │
│  ❌ No exists()                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Gap Matrix

| Gap ID | Description | Severity | Affected Components |
|--------|-------------|----------|---------------------|
| **G1** | `LocalFSAdapter` ≠ `StorageAdapter` | CRITICAL | All file sync services |
| **G2** | `useFileSyncService` ignores `storageType` | CRITICAL | Notes, Study, Knowledge |
| **G3** | Services require `LocalFSAdapter` type | CRITICAL | 5 workspace services |
| **G4** | Two incompatible adapter interfaces | HIGH | Code duplication |
| **G5** | No adapter factory for `storageType` | HIGH | Manual wiring required |
| **G6** | Mobile users blocked by FSA requirement | **P0-CRITICAL** | Mobile browsers |

---

## Data Flow Gap

### Current (Broken) Flow
```
User selects storageType = 'indexeddb'
           │
           ▼
Project stored with storageType ✅
           │
           ▼
Workspace page loads
           │
           ▼
useFileSyncService({ projectId })
           │
           ❌ IGNORES project.storageType
           │
           ▼
Checks: 'showDirectoryPicker' in window
           │
           ▼
❌ Mobile users BLOCKED (no FSA API)
```

### Required (Fixed) Flow
```
User selects storageType = 'indexeddb'
           │
           ▼
Project stored with storageType ✅
           │
           ▼
Workspace page loads
           │
           ▼
getProject(projectId) → read storageType
           │
           ▼
if (storageType === 'indexeddb')
    adapter = new IDBAdapter({ projectId })
else if (storageType === 'fsa')
    adapter = new FSAAdapter()
           │
           ▼
FileSyncService.setAdapter(adapter) ✅
```

---

## Stories Required

### Phase CC-PHASE-STORAGE: Storage Adapter Unification

| Story | Title | Type | Priority | Est. Hours |
|-------|-------|------|----------|------------|
| **S-001** | Create Adapter Factory for storageType | FEATURE | P0 | 2-3 |
| **S-002** | Update useFileSyncService to use StorageAdapter | REFACTOR | P0 | 3-4 |
| **S-003** | Refactor workspace sync services to use unified adapter | REFACTOR | P0 | 4-5 |
| **S-004** | Add mobile support (IndexedDB-only path) | FEATURE | P0 | 3-4 |
| **S-005** | E2E tests for storage type switching | TEST | P1 | 2-3 |

**Total**: 5 stories, ~14-19 hours

---

## Implementation Strategy

### Step 1: Create Adapter Factory (S-001)

```typescript
// src/infrastructure/sync/adapters/adapter-factory.ts

import { IDBAdapter, createIDBAdapter } from './idb-adapter-core';
import { FSAAdapter } from './fsa-adapter-core';
import type { StorageAdapter } from '../core/sync-result-types';
import type { Project } from '@/core/entities/Project';

export function createStorageAdapter(project: Project): StorageAdapter {
  switch (project.storageType) {
    case 'indexeddb':
      return createIDBAdapter({ projectId: project.id });
    case 'fsa':
      return new FSAAdapter();
    default:
      // Backward compatibility: default to FSA
      return new FSAAdapter();
  }
}
```

### Step 2: Update useFileSyncService (S-002)

```typescript
// src/infrastructure/sync/workspace-services/hooks/use-file-sync-service.ts

import { createStorageAdapter } from '../../adapters/adapter-factory';
import type { StorageAdapter } from '../../core/sync-result-types';

export function useFileSyncService(params: {
  projectId: string;
  workspaceType: 'notes' | 'study' | 'knowledge';
  noteStore?: NoteSyncStore;
}) {
  // ✅ READ project.storageType
  const project = useProjectStore(state => state.getProject(params.projectId));

  // ✅ Create adapter based on storageType
  const adapter = useMemo(() => {
    if (!project) return null;
    return createStorageAdapter(project);
  }, [project]);

  // ✅ Check if supported (for mobile + IndexedDB)
  const isSupported = useMemo(() => {
    if (project?.storageType === 'indexeddb') {
      return true; // IndexedDB works everywhere
    }
    return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
  }, [project]);
}
```

### Step 3: Refactor Workspace Services (S-003)

Change all workspace file sync services from:
```typescript
// ❌ BEFORE
import type { LocalFSAdapter } from '@/lib/filesystem/local-fs-adapter';

interface NotesFileSyncConfig {
  localAdapter: LocalFSAdapter;
  // ...
}

class NotesFileSyncService {
  private localAdapter: LocalFSAdapter;
  // ...
}
```

To:
```typescript
// ✅ AFTER
import type { StorageAdapter } from '../core/sync-result-types';

interface NotesFileSyncConfig {
  storageAdapter: StorageAdapter;
  // ...
}

class NotesFileSyncService {
  private storageAdapter: StorageAdapter;
  // ...
}
```

---

## Success Criteria

- [ ] Mobile users can create IndexedDB projects and sync files
- [ ] Desktop users can switch between FSA and IndexedDB storage
- [ ] `project.storageType` is respected in all workspace pages
- [ ] No breaking changes to existing FSA-based projects
- [ ] E2E tests cover both storage types
- [ ] TypeScript errors: 0 (production code only)

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking existing FSA projects | Medium | HIGH | Backward compatibility check |
| Performance regression with IDB | Low | MEDIUM | Benchmark before/after |
| Mobile IndexedDB quota issues | Medium | MEDIUM | Quota detection + user prompt |

---

## Handoff

**To**: @bmad:bmm:agents:architect
**Task**: Design adapter factory and service refactoring
**Deliverable**: Technical specification with implementation steps

**To**: @bmad:bmm:agents:dev
**Task**: Implement S-001 through S-005
**Deliverable**: Working storage type switching with tests

---

_Course Correction ID: CC-STORAGE-2026-01-07_
_Status: PENDING APPROVAL_
_Parent: CC-2026-01-06_
