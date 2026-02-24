# ARCH-01-02 Design: Unified Project Creation Service

**Story ID**: ARCH-01-02
**Phase**: 2 - Design (30 min)
**Date**: 2026-01-20
**Status**: COMPLETE

---

## Executive Summary

Design unified `ProjectCreationService` that consolidates 7 entry points into 2 platform-specific paths:
- **FSA-based creation** for desktop
- **IndexedDB-based creation** for mobile/tablet

Uses existing `getPlatformContract()` for platform detection and routes to appropriate implementation.

---

## Architecture Design

### Service Layer Pattern (Clean Architecture)

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ProjectCreationService                        │
│                  (Orchestrates Creation)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐        ┌──────────────────┐       │
│  │ FSACreationStrategy│        │IDBCreationStrategy│       │
│  │   (Desktop)      │        │  (Mobile/Tablet) │       │
│  └──────────────────┘        └──────────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
```

### Platform Routing

Uses existing `getPlatformContract()` from `src/infrastructure/filesystem/platform-detection.ts`:

```typescript
import { getPlatformContract } from '@/infrastructure/filesystem/platform-detection';

interface PlatformContract {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  storageType: 'fsa' | 'indexeddb';
  canAccessFSA: boolean;
  canWatchFiles: boolean;
  canRunTerminal: boolean;
  canDoAgenticCoding: boolean;
  canAccessIDE: boolean;
}
```

### Strategy Pattern

**Abstract Base**:
```typescript
abstract class ProjectCreationStrategy {
  abstract async createProject(input: CreateProjectInput): Promise<string>;
  abstract async createFromFolder(
    handle: FileSystemDirectoryHandle,
    folderName: string,
    options?: CreateFromFolderOptions
  ): Promise<string>;
}
```

**FSA Strategy** (Desktop):
```typescript
class FSACreationStrategy extends ProjectCreationStrategy {
  async createProject(input: CreateProjectInput): Promise<string> {
    // Call existing createProjectFromFolder logic
  }

  async createFromFolder(
    handle: FileSystemDirectoryHandle,
    folderName: string,
    options?: CreateFromFolderOptions
  ): Promise<string> {
    // Existing logic from fsa-persistence.ts
  }
}
```

**IndexedDB Strategy** (Mobile/Tablet):
```typescript
class IDBCreationStrategy extends ProjectCreationStrategy {
  async createProject(input: CreateProjectInput): Promise<string> {
    // Call existing browser-mode project creation logic
  }

  async createFromFolder(
    handle: FileSystemDirectoryHandle,
    folderName: string,
    options?: CreateFromFolderOptions
  ): Promise<string> {
    throw new Error('IndexedDB projects do not support folder handles');
  }
}
```

---

## Service Interface

### ProjectCreationService

```typescript
/**
 * Unified Project Creation Service
 *
 * Consolidates 7 entry points into 2 unified paths:
 * - FSA-based creation (desktop)
 * - IndexedDB-based creation (mobile/tablet)
 *
 * Uses getPlatformContract() for platform detection.
 */
export class ProjectCreationService {
  private strategy: ProjectCreationStrategy;

  constructor() {
    const platform = getPlatformContract();

    // Route to appropriate strategy based on platform
    if (platform.storageType === 'fsa') {
      this.strategy = new FSACreationStrategy();
    } else {
      this.strategy = new IDBCreationStrategy();
    }
  }

  /**
   * Create project from wizard/form input
   *
   * Automatically routes to FSA or IndexedDB implementation
   * based on platform detection.
   */
  async createProject(input: CreateProjectInput): Promise<string> {
    return this.strategy.createProject(input);
  }

  /**
   * Create project from FSA folder handle
   *
   * Desktop only - requires FSA support
   * Mobile/tablet throws error
   */
  async createFromFolder(
    handle: FileSystemDirectoryHandle,
    folderName: string,
    options?: CreateFromFolderOptions
  ): Promise<string> {
    return this.strategy.createFromFolder(handle, folderName, options);
  }

  /**
   * Get or create browser mode project
   *
   * Mobile/tablet only - uses IndexedDB storage
   * Desktop throws error (use FSA folder creation instead)
   */
  async getOrCreateBrowserModeProject(): Promise<string> {
    const platform = getPlatformContract();

    if (platform.storageType === 'fsa') {
      throw new Error(
        'Browser mode not available on desktop. Use createFromFolder() instead.'
      );
    }

    return this.strategy.createProject({
      name: 'Browser Mode',
      folderPath: 'Notes',
      storageType: 'indexeddb',
      workspaceBindings: {
        notes: true,
        knowledge: true,
        ide: false,
        study: false,
      },
    });
  }

  /**
   * Get or create temp project
   *
   * DEPRECATED: Will be removed in Phase 4
   * Projects should be explicitly created by users via hub
   */
  async getOrCreateTempProject(): Promise<string> {
    console.warn(
      '[ProjectCreationService] getOrCreateTempProject is deprecated. ' +
      'Use createProject() or getOrCreateBrowserModeProject() instead.'
    );

    const platform = getPlatformContract();

    if (platform.storageType === 'fsa') {
      // Desktop temp project (WebContainer fallback)
      return this.strategy.createProject({
        name: 'Temp Project',
        folderPath: 'temp',
        storageType: 'indexeddb',
        workspaceBindings: { notes: true, knowledge: true },
      });
    } else {
      // Mobile/tablet - reuse browser mode project
      return this.getOrCreateBrowserModeProject();
    }
  }
}
```

---

## FSA Creation Flow (Desktop)

### Step-by-Step Logic

```typescript
// 1. Check for duplicate projects by folder path
const folderPath = handle.name;
const existingProjectId = await checkForDuplicateProject(folderPath);
if (existingProjectId) {
  console.warn(`Project already exists for folder: ${folderPath}`);
  useProjectStore.getState().updateLastOpened?.(existingProjectId);
  return existingProjectId;
}

// 2. Verify handle is accessible
const hasAccess = await verifyHandleAccess(handle);
if (!hasAccess) {
  throw new Error(`Cannot access folder "${folderName}". Check permissions.`);
}

// 3. Create project with 'fsa' storage type
const defaultBindings = {
  ide: true,
  knowledge: false,
  notes: true,
  study: false,
};

const projectInput: CreateProjectInput = {
  name: folderName,
  folderPath: handle.name,
  storageMetadata: serializeHandle(handle, 'ide'),
  storageType: 'fsa',
  autoSync: true,
  bindings: options?.workspaceBindings ?? defaultBindings,
  tags: options?.tags ?? [],
};

// 4. Persist to project store and Dexie
const projectId = await useProjectStore.getState().createProject(projectInput);

// 5. Persist FSA handle for instant re-grant
await handlePersistenceService.persistHandle(projectId, handle, 'ide');

// 6. Initialize .viagent/ folder structure
await initializeViagentFolder(gateway, {
  projectId,
  projectName: folderName,
  storageType: 'fsa',
  workspaceBindings: requiredBindings,
});

// 7. Create /notes folder for Note storage
try {
  const gateway = new FSAGateway(handle);
  await gateway.createDirectory('/notes');
  console.log('[FSA-Persistence] Created /notes folder for project:', projectId);
} catch (error) {
  console.warn('[FSA-Persistence] Failed to create /notes folder:', error);
}

return projectId;
```

### FSA Project Structure

```
/MyProject/                          ← FSA Project Root
├── .viagent/                        ← ViaGent metadata folder
│   ├── project.json                 ← Project config (ID, name, bindings)
│   ├── notes-index.json             ← Note metadata (titles, order, favorites)
│   ├── file-tree-snapshot.json      ← Cached file tree for fast load
│   └── rag-index/                   ← Local RAG vectors (optional)
│
├── notes/                           ← Notes workspace content
│   ├── welcome.md                   ← Markdown file
│   └── assets/                      ← Embedded assets
│       └── image-abc123.png
│
└── [your code files...]               ← IDE workspace
```

---

## IndexedDB Creation Flow (Mobile/Tablet)

### Step-by-Step Logic

```typescript
// 1. Check for existing browser mode project
const existingRecord = await db.projects.get(BROWSER_MODE_PROJECT_ID);
if (existingRecord) {
  // Update lastOpened timestamp
  await db.projects.update(BROWSER_MODE_PROJECT_ID, { lastOpened: new Date() });

  // Convert to Project type and update Zustand store
  const project: Project = {
    id: existingRecord.id,
    name: existingRecord.name,
    folderPath: existingRecord.folderPath || 'Notes',
    storageType: 'indexeddb',
    lastOpened: new Date(),
    createdAt: new Date(existingRecord.createdAt),
    autoSync: false,
    workspaceBindings: {
      notes: true,
      knowledge: true,
      ide: false,
      study: false,
    },
    tags: [],
    isBrowserMode: true,
    isTemp: true,
    autoCreated: true,
  };

  useProjectStore.setState((state) => ({
    projects: { ...state.projects, [project.id]: project },
  }));

  return project.id;
}

// 2. Create browser mode project if not exists
const now = new Date();
const browserProjectData: Project = {
  id: BROWSER_MODE_PROJECT_ID,
  name: BROWSER_MODE_DISPLAY_NAME,
  folderPath: 'Notes',
  storageType: 'indexeddb',
  createdAt: now,
  lastOpened: now,
  autoSync: false,
  workspaceBindings: { notes: true, knowledge: true },
  tags: [],
  isBrowserMode: true,
  isTemp: true,
  autoCreated: true,
};

// 3. Persist to Dexie
await db.projects.add(browserProjectData);

// 4. Update Zustand store for reactive UI
useProjectStore.setState((state) => ({
  projects: { ...state.projects, [browserProjectData.id]: browserProjectData },
}));

return browserProjectData.id;
```

### IndexedDB Project Structure

```
Dexie IndexedDB:
└── projects (table)
    └── proj_browser-default (single record)
        ├── id: "proj_browser-default"
        ├── name: "Browser Mode"
        ├── folderPath: "Notes"
        ├── storageType: "indexeddb"
        ├── lastOpened: Date
        ├── createdAt: Date
        ├── workspaceBindings: { notes: true, knowledge: true }
        ├── isBrowserMode: true
        ├── isTemp: true
        └── autoCreated: true
```

---

## Platform Detection Integration

### Routing Logic

```typescript
import { getPlatformContract } from '@/infrastructure/filesystem/platform-detection';

const platform = getPlatformContract();

// Desktop with FSA
if (platform.storageType === 'fsa') {
  // Use FSACreationStrategy
  service = new ProjectCreationService(); // Auto-detects and routes
}

// Mobile/Tablet
if (platform.storageType === 'indexeddb') {
  // Use IDBCreationStrategy
  service = new ProjectCreationService(); // Auto-detects and routes
}
```

### Platform Contract Reference

From ADR-033 Decision D1:

| Device | Storage | IDE Access | Notes Access |
|---------|----------|------------|--------------|
| Desktop | FSA | ✅ Yes | ✅ Yes (real .md files) |
| Mobile | IndexedDB | ❌ Blocked | ✅ Yes (virtual files) |
| Tablet | IndexedDB | ❌ Blocked | ✅ Yes (virtual files) |

---

## Migration Path

### Phase 4: Entry Point Consolidation

**Deprecate Old Entry Points**:
1. `createProjectFromFolder` from `fsa-persistence.ts` → Use `service.createFromFolder()`
2. `getOrCreateTempProject` from `temp-project.ts` → Use `service.getOrCreateBrowserModeProject()`
3. `getOrCreateBrowserModeProject` from `browser-mode.ts` → Use `service.getOrCreateBrowserModeProject()`
4. `ProjectCreationWizard` → Import `ProjectCreationService` instead
5. `FolderPickerDialog` → Import `ProjectCreationService` instead
6. `HubHomePage` project creation → Import `ProjectCreationService` instead
7. `project-crud-slice.ts` `createProject` → Keep, wrap via service

**Update Imports Across Codebase**:

Files to update:
- `src/presentation/components/hub/HubHomePage.tsx`
- `src/presentation/components/project/ProjectCreationWizard.tsx`
- `src/presentation/components/workspace/FolderPickerDialog.tsx`
- `src/routes/ide.$projectId.tsx`
- `src/routes/notes.$projectId.tsx`
- `src/routes/workspace/$projectId.tsx`

**Migration Pattern**:
```typescript
// OLD:
import { createProjectFromFolder } from '@/lib/workspace/fsa-persistence';
const projectId = await createProjectFromFolder(handle, folderName);

// NEW:
import { ProjectCreationService } from '@/domain/services/project-creation-service';
const service = new ProjectCreationService();
const projectId = await service.createFromFolder(handle, folderName);
```

---

## File Locations

### New Files to Create

```
src/domain/services/
└── project-creation-service.ts       (NEW - Unified service)

src/domain/services/strategies/
├── project-creation-strategy.interface.ts  (NEW - Abstract base)
├── fsa-creation-strategy.ts          (NEW - Desktop FSA)
└── idb-creation-strategy.ts           (NEW - Mobile/Tablet IndexedDB)
```

### Existing Files to Modify

```
src/presentation/components/hub/HubHomePage.tsx
src/presentation/components/project/ProjectCreationWizard.tsx
src/presentation/components/workspace/FolderPickerDialog.tsx
src/routes/ide.$projectId.tsx
src/routes/notes.$projectId.tsx
src/routes/workspace/$projectId.tsx
```

### Existing Files to Keep (No Changes)

```
src/infrastructure/persistence/stores/project/project-crud-slice.ts
src/infrastructure/filesystem/platform-detection.ts (ALREADY EXISTS)
src/infrastructure/filesystem/handle-persistence.ts (ALREADY EXISTS)
src/infrastructure/filesystem/viagent-service.ts (ALREADY EXISTS)
src/infrastructure/filesystem/fsa-gateway.ts (ALREADY EXISTS)
```

---

## Dependencies

### Existing Dependencies (Reuse)

- `@/infrastructure/filesystem/platform-detection.ts` - `getPlatformContract()`
- `@/infrastructure/filesystem/handle-persistence.ts` - `handlePersistenceService`
- `@/infrastructure/filesystem/viagent-service.ts` - `initializeViagentFolder()`
- `@/infrastructure/persistence/stores/project` - `useProjectStore`, `CreateProjectInput`
- `@/domain/entities/project` - `Project` types
- `@/infrastructure/filesystem/fsa-gateway.ts` - `FSAGateway` for folder creation

### No New Dependencies Required

All dependencies already exist in codebase (ADR-033 infrastructure).

---

## Validation Plan

### Phase 5: Validation (30 min)

```bash
# TypeScript compilation
pnpm tsc --noEmit  # Must have 0 errors

# Build test
pnpm build  # Must succeed

# Test FSA creation (desktop)
pnpm vitest run src/domain/services/__tests__/fsa-creation.spec.ts

# Test IndexedDB creation (mobile)
pnpm vitest run src/domain/services/__tests__/idb-creation.spec.ts

# Test platform routing
pnpm vitest run src/domain/services/__tests__/project-creation-service.spec.ts
```

### Success Criteria

1. ✅ 7 entry points identified and documented (Phase 1)
2. ✅ 2 unified paths designed (FSA + IndexedDB)
3. ✅ `ProjectCreationService` interface designed
4. ✅ `FSACreationStrategy` implementation designed
5. ✅ `IDBCreationStrategy` implementation designed
6. ✅ Platform detection integrated using `getPlatformContract()`
7. ✅ Migration path documented
8. ✅ Dependencies identified (all existing)

---

**Design Duration**: 30 minutes
**Unified Service**: Designed
**Platform Routing**: Integrated with getPlatformContract()
**Status**: Ready for Phase 3 - Implementation
