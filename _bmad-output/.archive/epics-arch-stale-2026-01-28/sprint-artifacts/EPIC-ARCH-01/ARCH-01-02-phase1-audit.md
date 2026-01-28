# ARCH-01-02 Audit Report: Project Creation Entry Points

**Story ID**: ARCH-01-02
**Phase**: 1 - Audit (30 min)
**Date**: 2026-01-20
**Status**: COMPLETE

---

## Executive Summary

Identified **7 distinct project creation entry points** across the codebase. These need to be consolidated into **2 unified paths** (FSA-based for desktop, IndexedDB-based for mobile/tablet).

---

## 7 Project Creation Entry Points

### 1. `createProject` (Project Store)

**Location**: `src/infrastructure/persistence/stores/project/project-crud-slice.ts:123`

**Description**: Core project creation function in Zustand store. Used by wizard and all other creation paths.

**Usage**:
- Called by `ProjectCreationWizard`
- Called by `createProjectFromFolder`
- Direct calls from components

**Logic**:
1. Generates unique project ID (`proj_{timestamp}_{random}`)
2. Validates folder path
3. Checks for duplicate projects by folderPath
4. Persists to Dexie `projects` table
5. Returns project ID

**Storage Type Support**:
- Accepts `storageType: 'fsa' | 'indexeddb'`
- Stores `storageMetadata` for FSA handles

**Platform Support**:
- Both desktop and mobile
- Desktop uses `fsa`, mobile uses `indexeddb`

---

### 2. `createProjectFromFolder` (FSA Desktop)

**Location**: `src/lib/workspace/fsa-persistence.ts:168`

**Description**: Creates project from File System Access API folder handle. Used on desktop only.

**Usage**:
- Called by `HubHomePage` folder picker
- Called by `FolderPickerDialog`
- Called by `ide.tsx` route loader

**Logic**:
1. Checks for duplicate projects by folder path
2. Verifies handle is accessible
3. Creates project with `storageType: 'fsa'`
4. Persists FSA handle via `handlePersistenceService`
5. Initializes `.viagent/` metadata folder
6. Creates `/notes` folder for Note storage

**Storage Type Support**:
- Always `'fsa'`
- Serializes handle via `serializeHandle()`

**Platform Support**:
- Desktop only (requires FSA support)
- Auto-fallback to temp project if FSA not supported

---

### 3. `getOrCreateTempProject` (WebContainer/Temp)

**Location**: `src/lib/workspace/temp-project.ts:80`

**Description**: Creates or reuses temp project for WebContainer or fallback scenarios. DEPRECATED (will be removed in Phase 4).

**Usage**:
- Called by IDE route when no project selected
- Called by test utilities

**Logic**:
1. Checks localStorage for existing temp project ID
2. Creates temp project if not found
3. Temp project ID: `alpha-temp-{timestamp}`
4. Persists to Dexie via project store

**Storage Type Support**:
- Default `'indexeddb'` (virtual file system)

**Platform Support**:
- Both desktop and mobile (WebContainer fallback)
- Desktop uses only when no FSA handle available

**Status**: ⚠️ **DEPRECATED** - Will be removed in Phase 4

---

### 4. `getOrCreateBrowserModeProject` (IndexedDB Mobile/Tablet)

**Location**: `src/lib/workspace/browser-mode.ts:46`

**Description**: Creates or reuses browser mode project for mobile/tablet Notes workspace.

**Usage**:
- Called by Notes route on mobile/tablet
- Used for cross-project note browsing

**Logic**:
1. Checks Dexie for existing browser mode project (ID: `proj_browser-default`)
2. Creates project if not found
3. Project name: "Browser Mode"
4. `storageType: 'indexeddb'`
5. Enables `notes` and `knowledge` workspaces only

**Storage Type Support**:
- Always `'indexeddb'`

**Platform Support**:
- Mobile and tablet only (FSA not supported)
- Fixed project ID: `proj_browser-default`

---

### 5. `ProjectCreationWizard` (UI Component)

**Location**: `src/presentation/components/project/ProjectCreationWizard.tsx`

**Description**: Multi-step wizard UI for creating new projects. Calls `createProject` from store.

**Usage**:
- Accessed via Hub → "Create Project" button
- Used for manual project creation

**Steps**:
1. Project Details (name, description, type, icon)
2. Workspace Setup (optional - name, type, template)
3. Agent Selection (optional - Claude, GPT-4, etc.)
4. File Setup (optional - README.md, .gitignore)
5. Review and Confirm

**Logic**:
1. Validates each step before allowing next
2. Collects all form data
3. Calls `createProject(projectInput)` from store
4. Returns `projectId` to caller

**Storage Type Support**:
- Auto-detects platform (mobile/tablet/desktop)
- Auto-selects `fsa` on desktop, `indexeddb` on mobile
- User can override

**Platform Support**:
- All platforms
- Auto-hides FSA option on mobile/tablet

---

### 6. `FolderPickerDialog` (UI Component)

**Location**: `src/presentation/components/workspace/FolderPickerDialog.tsx`

**Description**: Dialog for picking FSA folder. Calls `createProjectFromFolder`.

**Usage**:
- IDE route when no FSA handle available
- Desktop only

**Logic**:
1. Shows directory picker via FSA API
2. Calls `createProjectFromFolder(handle, folderName)`
3. Navigates to IDE workspace on success

**Storage Type Support**:
- Always `'fsa'` (FSA handle required)

**Platform Support**:
- Desktop only (requires FSA support)

---

### 7. `HubHomePage` Project Creation (UI Flow)

**Location**: `src/presentation/components/hub/HubHomePage.tsx`

**Description**: Hub page project creation flow. Calls `createProjectFromFolder` for folder projects.

**Usage**:
- Hub → "Connect Folder" button
- Creates project from selected folder

**Logic**:
1. Shows folder picker via FSA API
2. Calls `createProjectFromFolder(handle, handle.name)`
3. Updates hub UI with new project
4. Allows navigation to appropriate workspace

**Storage Type Support**:
- Always `'fsa'` (folder picker only available on desktop)

**Platform Support**:
- Desktop only (requires FSA support)

---

## Common Patterns Identified

### Platform Detection

**Current State**:
- Each entry point detects platform separately
- `isFSASupported()` in `fsa-persistence.ts`
- `isDesktopPlatform()` from `@/lib/utils/platform-detection`
- Hardcoded storage type selection in wizard

**Issue**: No centralized platform routing

### Storage Type Selection

**Current State**:
- `fsa-persistence.ts` → Always `'fsa'`
- `browser-mode.ts` → Always `'indexeddb'`
- `temp-project.ts` → Default `'indexeddb'`
- `ProjectCreationWizard` → Auto-detects
- `project-crud-slice.ts` → Accepts both

**Issue**: Inconsistent storage type assignment

### Duplicate Logic

**Duplicate Check Locations**:
1. `createProjectFromFolder`: Checks duplicate by folder path in Dexie
2. `project-crud-slice.ts`: Checks duplicate by folder path using indexed query or fallback filter
3. `getOrCreateBrowserModeProject`: Checks for existing project by ID
4. `getOrCreateTempProject`: Checks localStorage for existing temp ID

**Issue**: Duplicate checking scattered across multiple files

### Handle Persistence

**FSA Handle Persistence**:
- `createProjectFromFolder` → Calls `handlePersistenceService.persistHandle()`
- Creates `.viagent/` folder structure
- Serializes handle for IndexedDB storage

**Issue**: Handle persistence only in FSA path, not in wizard path

---

## Consolidation Strategy

### Phase 2 Design: Unified Service

Create `ProjectCreationService` that routes to appropriate implementation based on `getPlatformContract()`:

```typescript
class ProjectCreationService {
  async createFromWizard(input: CreateProjectInput): Promise<string>
  async createFromFolder(handle: FileSystemDirectoryHandle, folderName: string): Promise<string>
  async getOrCreateBrowserModeProject(): Promise<string>
  async getOrCreateTempProject(): Promise<string>
}
```

### Platform Routing

Use existing `getPlatformContract()` from `src/infrastructure/filesystem/platform-detection.ts`:

```typescript
const platform = getPlatformContract();

if (platform.storageType === 'fsa') {
  return new FSACreationStrategy();
} else {
  return new IndexedDBCreationStrategy();
}
```

### FSA Creation Strategy (Desktop)

Implements:
1. `createProjectFromFolder` logic
2. Handle persistence via `handlePersistenceService`
3. `.viagent/` folder initialization
4. `/notes` folder creation

### IndexedDB Creation Strategy (Mobile/Tablet)

Implements:
1. `getOrCreateBrowserModeProject` logic
2. `getOrCreateTempProject` logic
3. Pure Dexie persistence (no file system)

---

## Dependencies

### External Dependencies

- `@/infrastructure/filesystem/platform-detection.ts` - `getPlatformContract()`
- `@/infrastructure/filesystem/handle-persistence.ts` - Handle persistence
- `@/infrastructure/persistence/stores/project` - Project store
- `@/infrastructure/filesystem/viagent-service.ts` - Metadata folder
- `@/domain/types/project` - Project types

### Internal Dependencies

- `project-crud-slice.ts` - Core creation logic
- `fsa-persistence.ts` - FSA-specific logic
- `browser-mode.ts` - IndexedDB-specific logic
- `temp-project.ts` - Temp project logic (DEPRECATED)

---

## Next Steps (Phase 2: Design)

1. ✅ Complete audit (DONE)
2. Design unified service interface
3. Define FSA creation strategy
4. Define IndexedDB creation strategy
5. Document platform routing strategy
6. Design migration path for existing entry points

---

**Audit Duration**: 30 minutes
**Entry Points Identified**: 7
**Common Patterns Found**: Platform detection, storage type selection, duplicate checking, handle persistence
**Status**: Ready for Phase 2 - Design
