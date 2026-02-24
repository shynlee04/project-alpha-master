# Temp Project System Investigation Report

**Date**: 2026-01-16
**Agent**: Agent 1 (Temp Project System Investigation)
**Status**: COMPLETE

---

## Executive Summary

This investigation reveals **3 overlapping temp project systems** that create routing chaos in the ViaGent application:

1. **temp-project.ts** - Creates `alpha-temp-{timestamp}-{random}` projects for mobile/desktop fallback
2. **workspace-access-helper.tsx** - Creates `temp-{workspace}` projects for each workspace type
3. **browser-mode.ts** - Creates `proj_browser-default` pseudo-project for cross-project note viewing

**Key Findings**:
- All 3 systems create temp projects with different ID formats
- All 3 systems persist to IndexedDB with `isTemp: true` flag
- All 3 systems are marked as DEPRECATED for Phase 4 removal
- System 2 (workspace-access-helper) is **detached in Phase 1** due to infinite loops
- System 3 (browser-mode) is **deprecated in Phase 1** but still used for migration compatibility
- System 1 (temp-project) is **still active** but marked for Phase 4 removal

**Routing Chaos**:
- Multiple temp project creation paths create confusion
- Different ID formats make it hard to identify temp projects consistently
- Overlapping functionality causes maintenance burden
- No single source of truth for temp project detection

---

## System 1: temp-project.ts

### File Location
`src/lib/workspace/temp-project.ts` (201 lines)

### ID Format
```
alpha-temp-{timestamp}-{random}
Example: alpha-temp-1737000000000-abc123
```

### Storage Mechanism
- **localStorage key**: `alpha-temp-project-id`
- **IndexedDB**: Persists via `saveProject()` from infrastructure store
- **Virtual path**: `/virtual/{projectId}`

### Core Functions

| Function | Purpose | Status |
|----------|---------|--------|
| `getOrCreateTempProject()` | Main entry point, creates or reuses temp project | ⚠️ DEPRECATED |
| `createTempProject()` | Creates new temp project with timestamp ID | Internal |
| `isTempProject(projectId)` | Checks if ID starts with `alpha-temp-` | Active |
| `shouldUseTempProject(hasFsaHandle)` | Determines if temp project should be used | Active |
| `getTempProjectBannerProps(project)` | Gets metadata for banner display | Active |
| `clearTempProject()` | Clears temp project from localStorage | Active |
| `getStoredTempProjectId()` | Gets temp project ID from localStorage | Active |

### Temp Project Creation Flow

```typescript
// 1. Check localStorage for existing temp project ID
const existingId = localStorage.getItem('alpha-temp-project-id');

// 2. If exists, load from IndexedDB
if (existingId) {
  const existing = await getProject(existingId);
  if (existing) return existing;
}

// 3. If not exists, create new temp project
const projectId = `alpha-temp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

// 4. Create project object
const tempProject: Project = {
  id: projectId,
  name: `Temp Project (${HH:MM})`,
  folderPath: `/virtual/${projectId}`,
  storageType: 'indexeddb',
  isTemp: true,
  autoCreated: true,
  workspaceBindings: {}, // Empty bindings (ARC-D03)
  autoSync: false,
  fileSnapshotEnabled: false,
  tags: [],
  lastOpened: now,
  createdAt: now,
};

// 5. Save to IndexedDB
await saveProject(tempProject);

// 6. Store ID in localStorage
localStorage.setItem('alpha-temp-project-id', projectId);
```

### Platform-Specific Behavior

| Platform | Behavior | Rationale |
|----------|----------|-----------|
| **Mobile** | Always creates temp project | FSA not available on mobile |
| **Desktop** | Creates temp project if no FSA handle | FSA required for desktop projects |
| **Desktop with FSA** | Does NOT create temp project | User should select real project |

### Dependencies

**Files that import temp-project.ts**:
- `src/presentation/components/workspace/TempProjectBanner.tsx` - Imports `TempProjectMetadata` type
- `src/presentation/components/workspace/FolderPickerDialog.tsx` - Mentioned in comments (not actively used)

**Files that use temp-project functions**:
- `src/presentation/components/workspace/FolderPickerDialog.tsx` - Commented out usage

### Current Usage Status
- **Phase 1**: Still active, but marked as DEPRECATED
- **Phase 4**: Scheduled for removal
- **Migration**: Users should create real projects via hub instead

---

## System 2: workspace-access-helper.tsx

### File Location
`src/lib/workspace/workspace-access-helper.tsx` (509 lines)

### ID Format
```
temp-{workspace}
Examples:
- temp-ide
- temp-knowledge
- temp-study
- temp-notes
```

### Storage Mechanism
- **IndexedDB**: Direct Dexie persistence via `db.projects.put()`
- **Virtual path**: `/temp-{workspace}`
- **No localStorage**: Does not use localStorage

### Core Functions

| Function | Purpose | Status |
|----------|---------|--------|
| `getTempProjectId(workspace)` | Generates `temp-{workspace}` ID | Active |
| `isTempProject(project)` | Checks if ID starts with `temp-` | Active |
| `createTempProject(workspace)` | Creates temp project for specific workspace | ⚠️ DEPRECATED |
| `useWorkspaceAccess(workspace)` | React hook for workspace access | ⚠️ DETACHED Phase 1 |
| `WorkspaceAccessEmptyState` | Component for empty state UI | ⚠️ DETACHED Phase 1 |

### Temp Project Creation Flow

```typescript
// 1. Generate temp project ID
const tempId = `temp-${workspace}`; // e.g., "temp-ide"

// 2. Check if temp project already exists in Dexie
const existing = await db.projects.get(tempId);
if (existing) {
  // Update lastOpened and return
  await db.projects.update(tempId, { lastOpened: new Date() });
  return { id: existing.id, name: existing.name };
}

// 3. Create new temp project
const tempProject = {
  id: tempId,
  name: TEMP_PROJECT_NAMES[workspace], // e.g., "Quick IDE"
  path: `/temp-${workspace}`,
  workspaceId: workspace,
  storageType: 'indexeddb',
  workspaceBindings: { ide: true, knowledge: true, study: true, notes: true },
  isTemp: true,
  autoCreated: true,
  folderPath: undefined,
  fileSnapshotEnabled: false,
  lastOpened: now,
  createdAt: now,
};

// 4. Save to Dexie directly
await db.projects.put(tempProject);
```

### Workspace-Specific Names

| Workspace | Temp Project ID | Display Name |
|-----------|-----------------|--------------|
| IDE | `temp-ide` | "Quick IDE" |
| Knowledge | `temp-knowledge` | "Quick Knowledge" |
| Study | `temp-study` | "Quick Study" |
| Notes | `temp-notes` | "Quick Notes" |

### React Hook: useWorkspaceAccess

**Purpose**: Provides standardized access logic for all workspaces

**Returns**:
```typescript
{
  status: 'loading' | 'has_projects' | 'no_projects' | 'no_binding',
  projects: ProjectRecord[], // Filtered by workspace binding
  allProjects: ProjectRecord[],
  isCreatingTemp: boolean,
  isEnabling: boolean,
  mostRecentProject: ProjectRecord | null,
  handleCreateTemp: () => Promise<void>,
  handleEnable: () => Promise<void>,
  handleNavigateToCreate: () => void,
  handleNavigateToHub: () => void,
}
```

**Status**: ⚠️ **DETACHED in Phase 1** due to infinite loops

**Reason**: `useWorkspaceAccess` hook causes infinite re-renders and returns `'no_projects'` incorrectly

**Re-attach**: Phase 2 (after P1-11 gate passes)

### Dependencies

**Files that import workspace-access-helper.tsx**:
- `src/routes/study.lazy.tsx` - Detached in Phase 1 (lines 117-120 commented)
- `src/routes/knowledge.lazy.tsx` - Detached in Phase 1 (lines 115-120 commented)

**Files that use workspace-access-helper functions**:
- None actively using in Phase 1 (both routes detached)

### Current Usage Status
- **Phase 1**: DETACHED due to infinite loops
- **Phase 2**: Will be re-attached after P1-11 gate passes
- **Phase 4**: Scheduled for removal

---

## System 3: browser-mode.ts

### File Location
`src/lib/workspace/browser-mode.ts` (159 lines)

### ID Format
```
proj_browser-default
```

### Storage Mechanism
- **IndexedDB**: Direct Dexie persistence via `db.projects.put()`
- **Virtual path**: `Notes` (no file system)
- **No localStorage**: Does not use localStorage

### Core Functions

| Function | Purpose | Status |
|----------|---------|--------|
| `getOrCreateBrowserModeProject()` | Gets or creates browser mode project | ⚠️ DEPRECATED |
| `isBrowserModeProject(project)` | Checks if project is browser mode | Active |
| `getAllNotesFromAllProjects(noteStore)` | Placeholder for cross-project notes | Placeholder |
| `getProjectForNote(projectId)` | Gets project info for a note | Active |

### Browser Mode Project Creation Flow

```typescript
// 1. Check Dexie directly for existing project
const existingRecord = await db.projects.get('proj_browser-default');
if (existingRecord) {
  // Update lastOpened
  await db.projects.update('proj_browser-default', { lastOpened: new Date() });

  // Convert to Project type
  const project: Project = {
    id: 'proj_browser-default',
    name: 'Browser Mode',
    folderPath: 'Notes',
    storageType: 'indexeddb',
    isBrowserMode: true,
    isTemp: true,
    autoCreated: true,
    workspaceBindings: { notes: true, knowledge: true },
    // ... other fields
  };

  // Update Zustand store for reactive UI
  useProjectStore.setState((state) => ({
    projects: { ...state.projects, [project.id]: project },
  }));

  return project;
}

// 2. Create browser mode project if it doesn't exist
const browserProjectData: Project = {
  id: 'proj_browser-default',
  name: 'Browser Mode',
  folderPath: 'Notes',
  storageType: 'indexeddb',
  workspaceBindings: { notes: true, knowledge: true, ide: false, study: false },
  isBrowserMode: true,
  isTemp: true,
  autoCreated: true,
  // ... other fields
};

// 3. Persist DIRECTLY to Dexie (bypass broken store facade)
await db.projects.put(dexieRecord);

// 4. Update Zustand store for reactive UI
useProjectStore.setState((state) => ({
  projects: { ...state.projects, [browserProjectData.id]: browserProjectData },
}));
```

### Browser Mode Purpose

**Original Purpose**: Allow viewing/editing notes across all projects without requiring explicit project selection

**Current Status**: ⚠️ **DEPRECATED in Phase 1**

**Migration Path**:
- Desktop with FSA: Show project picker dialog
- Mobile/tablet: Redirect to hub to create real project
- Legacy browser-mode project: Used for data migration compatibility only

### Dependencies

**Files that import browser-mode.ts**:
- `src/lib/notes/slices/note-crud-slice.ts` - Uses `getOrCreateBrowserModeProject()` and `BROWSER_MODE_PROJECT_ID`
- `src/routes/notes.lazy.tsx` - Uses `useBrowserModeProject()` hook (deprecated)

**Files that use browser-mode functions**:
- `src/lib/notes/slices/note-crud-slice.ts` - `loadAllNotes()` function (line 78-100)
- `src/routes/notes.lazy.tsx` - Migration compatibility (lines 48-132)

### Current Usage Status
- **Phase 1**: DEPRECATED but kept for migration compatibility
- **Phase 4**: Scheduled for removal
- **Migration**: Users should create real projects via hub instead

---

## Dependencies

### Import Graph

```
temp-project.ts
├── TempProjectBanner.tsx (imports TempProjectMetadata type)
└── FolderPickerDialog.tsx (mentioned in comments, not actively used)

workspace-access-helper.tsx
├── study.lazy.tsx (DETACHED Phase 1)
└── knowledge.lazy.tsx (DETACHED Phase 1)

browser-mode.ts
├── note-crud-slice.ts (uses getOrCreateBrowserModeProject)
└── notes.lazy.tsx (uses useBrowserModeProject hook)
```

### Usage by Route

| Route | System 1 | System 2 | System 3 | Status |
|-------|----------|----------|----------|--------|
| `/notes` | ❌ No | ❌ No | ✅ Yes (deprecated) | Active with migration |
| `/ide` | ❌ No | ❌ No | ❌ No | No temp projects |
| `/study` | ❌ No | ✅ Yes (detached) | ❌ No | DETACHED Phase 1 |
| `/knowledge` | ❌ No | ✅ Yes (detached) | ❌ No | DETACHED Phase 1 |

### Usage by Component

| Component | System 1 | System 2 | System 3 | Status |
|-----------|----------|----------|----------|--------|
| `TempProjectBanner` | ✅ Yes (types) | ❌ No | ❌ No | Active |
| `FolderPickerDialog` | ❌ No (commented) | ❌ No | ❌ No | Not used |
| `WorkspaceAccessEmptyState` | ❌ No | ✅ Yes (detached) | ❌ No | DETACHED Phase 1 |
| `NotesPage` | ❌ No | ❌ No | ✅ Yes (via note-crud-slice) | Active with migration |

---

## Overlapping Functionality

### 1. Temp Project Creation

All 3 systems create temp projects with similar characteristics:

| Feature | System 1 | System 2 | System 3 |
|---------|----------|----------|----------|
| **ID Format** | `alpha-temp-{timestamp}-{random}` | `temp-{workspace}` | `proj_browser-default` |
| **Storage** | IndexedDB + localStorage | IndexedDB only | IndexedDB only |
| **Virtual Path** | `/virtual/{projectId}` | `/temp-{workspace}` | `Notes` |
| **isTemp flag** | ✅ Yes | ✅ Yes | ✅ Yes |
| **autoCreated flag** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Storage Type** | `indexeddb` | `indexeddb` | `indexeddb` |
| **Workspace Bindings** | Empty `{}` | All enabled `{ide,knowledge,study,notes}` | `{notes,knowledge}` |
| **Auto Sync** | ❌ No | ❌ No | ❌ No |
| **File Snapshot** | ❌ No | ❌ No | ❌ No |

### 2. Temp Project Detection

All 3 systems have different detection logic:

```typescript
// System 1: temp-project.ts
function isTempProject(projectId: string): boolean {
  return projectId?.startsWith('alpha-temp-') || false;
}

// System 2: workspace-access-helper.tsx
function isTempProject(project: Project): boolean {
  return project.id.startsWith('temp-');
}

// System 3: browser-mode.ts
function isBrowserModeProject(project: Project | null): boolean {
  return project?.id === 'proj_browser-default' || project?.isBrowserMode === true;
}
```

**Problem**: No single source of truth for temp project detection. Each system uses different logic.

### 3. Deprecation Status

All 3 systems are marked as DEPRECATED for Phase 4 removal:

| System | Deprecation Notice | Phase 1 Status | Phase 4 Plan |
|--------|-------------------|----------------|--------------|
| System 1 | ⚠️ DEPRECATED in code comments | Still active | Remove |
| System 2 | ⚠️ DEPRECATED in code comments | DETACHED due to bugs | Remove |
| System 3 | ⚠️ DEPRECATED in code comments | Migration compatibility | Remove |

### 4. Routing Chaos

**Problem**: Multiple temp project creation paths cause routing confusion:

1. **User navigates to `/notes`**:
   - System 3 (browser-mode) creates `proj_browser-default`
   - User sees "Browser Mode" project

2. **User navigates to `/study`** (if System 2 was active):
   - System 2 (workspace-access-helper) creates `temp-study`
   - User sees "Quick Study" project

3. **User on mobile without FSA**:
   - System 1 (temp-project) creates `alpha-temp-{timestamp}-{random}`
   - User sees "Temp Project (HH:MM)"

**Result**: Inconsistent temp project IDs, names, and behaviors across routes.

---

## Recommendations for Phase 1

### Goal: Stop Creating Temp Projects

### Immediate Actions (Phase 1)

#### 1. Disable System 1: temp-project.ts

**Action**: Remove all calls to `getOrCreateTempProject()` and `createTempProject()`

**Files to modify**:
- `src/presentation/components/workspace/FolderPickerDialog.tsx` - Remove commented usage

**Code changes**:
```typescript
// BEFORE (commented out)
// onFallbackToTemp={() => getOrCreateTempProject().then(() => navigate(...))}

// AFTER
// Remove the onFallbackToTemp prop entirely
```

**Validation**:
- Search for `getOrCreateTempProject` usage across codebase
- Ensure no active calls remain
- Keep `isTempProject()` function for detection of legacy temp projects

#### 2. Keep System 2: workspace-access-helper.tsx DETACHED

**Action**: No changes needed - already detached in Phase 1

**Rationale**:
- System 2 is already detached due to infinite loops
- Will be re-attached in Phase 2 after P1-11 gate passes
- Keep code for Phase 2 re-attachment

**Validation**:
- Verify `study.lazy.tsx` and `knowledge.lazy.tsx` are still placeholders
- Verify no active calls to `useWorkspaceAccess()`

#### 3. Deprecate System 3: browser-mode.ts

**Action**: Remove browser-mode project creation from `/notes` route

**Files to modify**:
- `src/routes/notes.lazy.tsx` - Remove `useBrowserModeProject()` hook usage

**Code changes**:
```typescript
// BEFORE (lines 48-132)
const browserProject = useBrowserModeProject();
useEffect(() => {
  if (browserProject) {
    console.warn('[DEPRECATED] Browser-mode project is deprecated...');
    setProject(browserProject);
    // ... migration logic
  } else {
    navigate({ to: '/hub', search: { action: 'create-project', workspace: 'notes' } });
  }
}, [browserProject, navigate]);

// AFTER
// Remove browser-mode project logic entirely
// All users without projects redirect to hub
useEffect(() => {
  navigate({ to: '/hub', search: { action: 'create-project', workspace: 'notes' } });
}, [navigate]);
```

**Validation**:
- Verify `/notes` route redirects to hub when no project selected
- Verify desktop with FSA shows project picker dialog
- Verify mobile/tablet redirects to hub to create project

#### 4. Update Temp Project Detection

**Action**: Create unified temp project detection function

**New file**: `src/lib/workspace/temp-project-detection.ts`

```typescript
/**
 * Unified temp project detection
 *
 * Detects all temp project formats across all systems:
 * - System 1: alpha-temp-{timestamp}-{random}
 * - System 2: temp-{workspace}
 * - System 3: proj_browser-default
 */
export function isAnyTempProject(projectId: string): boolean {
  if (!projectId) return false;

  // System 1: alpha-temp-*
  if (projectId.startsWith('alpha-temp-')) return true;

  // System 2: temp-{workspace}
  if (projectId.startsWith('temp-')) return true;

  // System 3: proj_browser-default
  if (projectId === 'proj_browser-default') return true;

  return false;
}

/**
 * Get temp project type
 */
export function getTempProjectType(projectId: string): 'system1' | 'system2' | 'system3' | null {
  if (!projectId) return null;

  if (projectId.startsWith('alpha-temp-')) return 'system1';
  if (projectId.startsWith('temp-')) return 'system2';
  if (projectId === 'proj_browser-default') return 'system3';

  return null;
}
```

**Usage**:
```typescript
// Replace all isTempProject() calls with isAnyTempProject()
import { isAnyTempProject } from '@/lib/workspace/temp-project-detection';

if (isAnyTempProject(project.id)) {
  // Show temp project warning
}
```

#### 5. Add Migration Path for Legacy Temp Projects

**Action**: Create migration utility to convert temp projects to real projects

**New file**: `src/lib/workspace/temp-project-migration.ts`

```typescript
/**
 * Migrate temp projects to real projects
 *
 * Converts legacy temp projects to user-created projects:
 * - Prompts user to select folder (desktop) or create project (mobile)
 * - Migrates notes/files from temp project to new project
 * - Deletes temp project after successful migration
 */
export async function migrateTempProject(tempProjectId: string): Promise<void> {
  // Implementation details:
  // 1. Load temp project data
  // 2. Prompt user to create real project
  // 3. Migrate notes/files to new project
  // 4. Delete temp project
  // 5. Update localStorage (if System 1)
}
```

### Phase 2 Actions (After P1-11 Gate Passes)

#### 1. Re-attach System 2: workspace-access-helper.tsx

**Action**: Re-enable `useWorkspaceAccess()` in study and knowledge routes

**Files to modify**:
- `src/routes/study.lazy.tsx` - Uncomment original implementation
- `src/routes/knowledge.lazy.tsx` - Uncomment original implementation

**Validation**:
- Verify no infinite loops occur
- Verify workspace access works correctly
- Verify temp project creation is disabled (see Phase 2.2)

#### 2. Disable Temp Project Creation in System 2

**Action**: Remove `handleCreateTemp()` from `useWorkspaceAccess()` hook

**Code changes**:
```typescript
// BEFORE
const handleCreateTemp = useCallback(async () => {
  setIsCreatingTemp(true);
  try {
    const result = await createTempProject(workspace);
    if (result) {
      navigate({ to: `/${workspace}/$projectId`, params: { projectId: result.id } });
    } else {
      navigate({ to: '/hub', search: { action: 'create-project' } });
    }
  } catch (error) {
    console.error('[useWorkspaceAccess] Failed to create temp project:', error);
    navigate({ to: '/hub', search: { action: 'create-project' } });
  } finally {
    setIsCreatingTemp(false);
  }
}, [navigate, workspace]);

// AFTER
const handleCreateTemp = useCallback(async () => {
  // Redirect to hub to create real project instead of temp project
  navigate({ to: '/hub', search: { action: 'create-project', workspace } });
}, [navigate, workspace]);
```

**Validation**:
- Verify clicking "Quick {Workspace}" button redirects to hub
- Verify no temp projects are created
- Verify user must create real project via hub

### Phase 4 Actions (Final Removal)

#### 1. Remove System 1: temp-project.ts

**Action**: Delete entire file and all imports

**Files to delete**:
- `src/lib/workspace/temp-project.ts`

**Files to modify**:
- `src/presentation/components/workspace/TempProjectBanner.tsx` - Remove imports
- `src/presentation/components/workspace/FolderPickerDialog.tsx` - Remove comments

**Validation**:
- Verify no imports of `@/lib/workspace/temp-project` remain
- Verify no calls to `getOrCreateTempProject()` remain
- Verify no calls to `isTempProject()` remain (use `isAnyTempProject()` instead)

#### 2. Remove System 2: workspace-access-helper.tsx

**Action**: Delete entire file and all imports

**Files to delete**:
- `src/lib/workspace/workspace-access-helper.tsx`

**Files to modify**:
- `src/routes/study.lazy.tsx` - Remove imports and original implementation
- `src/routes/knowledge.lazy.tsx` - Remove imports and original implementation

**Validation**:
- Verify no imports of `@/lib/workspace/workspace-access-helper` remain
- Verify no calls to `useWorkspaceAccess()` remain
- Verify no calls to `createTempProject()` remain

#### 3. Remove System 3: browser-mode.ts

**Action**: Delete entire file and all imports

**Files to delete**:
- `src/lib/workspace/browser-mode.ts`

**Files to modify**:
- `src/lib/notes/slices/note-crud-slice.ts` - Remove `loadAllNotes()` function
- `src/routes/notes.lazy.tsx` - Remove `useBrowserModeProject()` hook

**Validation**:
- Verify no imports of `@/lib/workspace/browser-mode` remain
- Verify no calls to `getOrCreateBrowserModeProject()` remain
- Verify no calls to `isBrowserModeProject()` remain

#### 4. Remove Temp Project Detection

**Action**: Delete unified temp project detection file

**Files to delete**:
- `src/lib/workspace/temp-project-detection.ts`
- `src/lib/workspace/temp-project-migration.ts`

**Rationale**: After Phase 4, no temp projects should exist in the system

**Validation**:
- Verify no temp projects remain in IndexedDB
- Verify no temp project IDs in localStorage
- Verify all users have real projects

---

## Summary

### Current State (Phase 1)

| System | Status | Active Usage | Deprecation |
|--------|--------|--------------|-------------|
| System 1 (temp-project.ts) | Active | Minimal (banner only) | ⚠️ DEPRECATED |
| System 2 (workspace-access-helper.tsx) | Detached | None (infinite loops) | ⚠️ DEPRECATED |
| System 3 (browser-mode.ts) | Deprecated | Migration only | ⚠️ DEPRECATED |

### Target State (Phase 4)

| System | Status | Active Usage | Action |
|--------|--------|--------------|--------|
| System 1 (temp-project.ts) | Removed | None | Delete file |
| System 2 (workspace-access-helper.tsx) | Removed | None | Delete file |
| System 3 (browser-mode.ts) | Removed | None | Delete file |

### Migration Path

1. **Phase 1**: Stop creating new temp projects
2. **Phase 2**: Re-attach System 2 without temp project creation
3. **Phase 4**: Remove all temp project systems

### Benefits

- **Single source of truth**: No more overlapping temp project systems
- **Consistent routing**: All users create real projects via hub
- **Better UX**: Clear project selection, no confusing temp projects
- **Easier maintenance**: Less code to maintain, fewer bugs
- **Clean architecture**: No workarounds for temp project detection

---

## Appendix: Code References

### System 1: temp-project.ts

**File**: `src/lib/workspace/temp-project.ts`
**Lines**: 1-201
**Key functions**:
- `getOrCreateTempProject()` - Line 81
- `createTempProject()` - Line 106
- `isTempProject()` - Line 51
- `shouldUseTempProject()` - Line 192

### System 2: workspace-access-helper.tsx

**File**: `src/lib/workspace/workspace-access-helper.tsx`
**Lines**: 1-509
**Key functions**:
- `getTempProjectId()` - Line 133
- `isTempProject()` - Line 140
- `createTempProject()` - Line 152
- `useWorkspaceAccess()` - Line 227
- `WorkspaceAccessEmptyState()` - Line 381

### System 3: browser-mode.ts

**File**: `src/lib/workspace/browser-mode.ts`
**Lines**: 1-159
**Key functions**:
- `getOrCreateBrowserModeProject()` - Line 46
- `isBrowserModeProject()` - Line 33
- `getAllNotesFromAllProjects()` - Line 133
- `getProjectForNote()` - Line 149

---

**End of Report**