# Project Creation Investigation Report

**Date**: 2026-01-16
**Agent**: Agent 3
**Investigation Scope**: Project creation flow and Phase 1 integration requirements

---

## Executive Summary

This report analyzes the current project creation flow across 4 key files and identifies what needs to be updated for Phase 1. The investigation reveals:

1. **Three distinct project creation paths** exist:
   - Direct folder picker (HubHomePage → FSA only)
   - Multi-step wizard (ProjectCreationWizard → user-selected storage)
   - Temp project auto-creation (temp-project.ts → IndexedDB only)

2. **Platform contract integration is incomplete**:
   - `getPlatformContract()` is used only for post-creation redirect
   - `platform.storageType` is NOT used to determine storage type
   - Storage type is determined by user choice or defaults

3. **Temp projects are isolated**:
   - Created via separate `saveProject()` function
   - Use `storageType: 'indexeddb'` hardcoded
   - Have empty `workspaceBindings`
   - Marked with `isTemp: true`

4. **Phase 1 changes needed**:
   - Integrate `platform.storageType` into creation flows
   - Update temp project creation to use platform contract
   - Ensure workspace bindings align with storage type
   - Add temp project detection in creation flows

---

## File 1: HubHomePage.tsx

### Location
`src/presentation/components/hub/HubHomePage.tsx` (486 lines)

### Project Creation Methods

#### Method 1: `handleNewProject()` (Lines 186-244)
**Purpose**: Direct folder picker for FSA projects

**Flow**:
```typescript
1. Check if FSA is supported (showDirectoryPicker in window)
2. If not supported → Show toast, return
3. Open directory picker with mode: 'readwrite'
4. Create project input:
   - name: handle.name
   - folderPath: handle.name
   - storageMetadata: serializeHandle(handle, 'ide')
   - autoSync: true
   - bindings: { ide, knowledge, notes, study } (all true)
5. Call useProjectStore.getState().createProject(projectInput)
6. Navigate to /ide/$projectId
```

**Key Findings**:
- ❌ Does NOT use `platform.storageType`
- ❌ Does NOT use `getPlatformContract()` for storage decision
- ✅ Uses `serializeHandle()` for FSA handle persistence
- ✅ Sets all workspace bindings to true
- ❌ Does NOT create temp projects
- ❌ Fails silently on mobile (no FSA support)

#### Method 2: `handleProjectCreated()` (Lines 156-184)
**Purpose**: Post-creation redirect based on platform

**Flow**:
```typescript
1. Get project from store using projectId
2. Get platform contract: const platform = getPlatformContract()
3. Log platform info and project storage type
4. If platform.canAccessIDE → Navigate to /ide/$projectId
5. Else → Navigate to /notes/$projectId
```

**Key Findings**:
- ✅ Uses `getPlatformContract()` for redirect decision
- ✅ Uses `platform.canAccessIDE` (implies desktop + FSA)
- ❌ Does NOT use `platform.storageType`
- ✅ Logs project.storageType for debugging
- ✅ Follows ADR-033: Desktop FSA → IDE, Mobile → Notes

### Integration with Temp Projects
- ❌ No temp project creation in HubHomePage
- ❌ No temp project detection
- ❌ No temp project banner display

---

## File 2: ProjectCreationWizard.tsx

### Location
`src/presentation/components/project/ProjectCreationWizard.tsx` (536 lines)

### Project Creation Flow

#### Wizard Structure
- **Step 1**: ProjectDetailsStep (required)
  - Project name, description, type, icon
  - **storageType** selection (indexeddb or fsa)
  - **fsaHandle** picker (if storageType is fsa)

- **Step 2**: WorkspaceSetupStep (optional)
  - Workspace name, type, template

- **Step 3**: AgentSelectionStep (optional)
  - Agent selection, permissions

- **Step 4**: FileSetupStep (optional)
  - README, .gitignore creation

- **Step 5**: ReviewStep (required)
  - Summary and validation

#### `handleCreate()` Method (Lines 275-316)
**Flow**:
```typescript
1. Validate step 5
2. Force ide binding to false if storageType is indexeddb:
   const finalBindings = {
     ...formData.workspaceBindings,
     ide: formData.storageType === 'fsa' && formData.workspaceBindings.ide === true
   }
3. Create project input:
   - name: formData.projectName
   - folderPath: slugified name
   - storageType: formData.storageType (user-selected)
   - storageMetadata: serializeHandle(fsaHandle, 'ide') if FSA
   - description: formData.projectDescription
   - tags: [formData.projectType]
   - bindings: finalBindings
4. Call createProject(projectInput)
5. Close wizard
6. Call onProjectCreated(projectId) callback
```

**Key Findings**:
- ❌ Does NOT use `platform.storageType`
- ❌ Does NOT use `getPlatformContract()` for storage decision
- ✅ User explicitly selects storage type
- ✅ Forces ide binding to false for IndexedDB
- ✅ Uses `serializeHandle()` for FSA handle
- ❌ Does NOT create temp projects
- ✅ Validates FSA handle is selected if storageType is fsa

### Integration with Temp Projects
- ❌ No temp project creation in wizard
- ❌ No temp project detection
- ❌ No temp project banner display

---

## File 3: project-crud-slice.ts

### Location
`src/infrastructure/persistence/stores/project/project-crud-slice.ts` (302 lines)

### `createProject()` Method (Lines 116-170)
**Flow**:
```typescript
1. Generate project ID: proj_{timestamp}_{random}
2. Set storageType: input.storageType ?? 'fsa' (defaults to FSA)
3. Create Project object:
   - id: projectId
   - name: input.name
   - folderPath: input.folderPath
   - storageType: storageType
   - storageMetadata: input.storageMetadata ?? null
   - lastOpened: now
   - createdAt: now
   - autoSync: input.autoSync ?? true
   - workspaceBindings: input.workspaceBindings ?? input.bindings ?? { all true }
   - description: input.description
   - tags: input.tags ?? []
4. Update Zustand store
5. Persist to Dexie (async, non-blocking)
6. Return projectId
```

**Key Findings**:
- ❌ Does NOT use `platform.storageType`
- ❌ Does NOT use `getPlatformContract()`
- ✅ Accepts storageType as input parameter
- ⚠️ Defaults to 'fsa' if not provided (may be wrong for mobile)
- ✅ Stores storageType in project metadata
- ✅ Stores storageMetadata for FSA handles
- ❌ Does NOT create temp projects
- ✅ Persists to both Zustand and Dexie

### Integration with Temp Projects
- ❌ No temp project creation logic
- ❌ No temp project detection
- ❌ No temp project special handling

---

## File 4: project-utils-slice.ts

### Location
`src/infrastructure/persistence/stores/project/project-utils-slice.ts` (187 lines)

### Utility Functions

| Function | Purpose | Temp Project Support |
|----------|---------|---------------------|
| `updateLastOpened()` | Update timestamp | ❌ No |
| `hydrateProjects()` | Load from Dexie | ❌ No |
| `getRecentProjects()` | Get recent projects | ❌ No |
| `searchProjects()` | Search projects | ❌ No |
| `getProjectsByWorkspace()` | Filter by workspace | ❌ No |
| `getDefaultProjectForWorkspace()` | Get default for workspace | ❌ No |
| `getProjectStats()` | Get statistics | ❌ No |

**Key Findings**:
- ❌ No project creation logic
- ❌ No temp project detection
- ❌ No temp project filtering
- ✅ Uses workspaceBindings for filtering

---

## File 5: temp-project.ts

### Location
`src/lib/workspace/temp-project.ts` (201 lines)

### Temp Project Creation Flow

#### `getOrCreateTempProject()` (Lines 81-101)
**Flow**:
```typescript
1. Check for existing temp project ID in localStorage
2. If exists, load from project store and return
3. If not exists, call createTempProject()
4. Return temp project
```

**Key Findings**:
- ⚠️ Marked as DEPRECATED (will be removed in Phase 4)
- ✅ Reuses existing temp project if found
- ✅ Stores ID in localStorage for session persistence
- ⚠️ Uses `saveProject()` instead of `createProject()`

#### `createTempProject()` (Lines 106-138)
**Flow**:
```typescript
1. Generate temp project ID: alpha-temp-{timestamp}-{random}
2. Detect platform: isDesktopPlatform() ? 'desktop' : 'mobile'
3. Create temp project:
   - id: tempProjectId
   - name: "Temp Project ({timestamp})"
   - folderPath: /virtual/{projectId}
   - storageType: 'indexeddb' (HARDCODED)
   - lastOpened: now
   - createdAt: now
   - autoSync: false
   - fileSnapshotEnabled: false
   - workspaceBindings: {} (EMPTY)
   - tags: []
   - isTemp: true
   - autoCreated: true
4. Save to project store via saveProject()
5. Store ID in localStorage
6. Return temp project
```

**Key Findings**:
- ❌ Does NOT use `platform.storageType`
- ❌ Does NOT use `getPlatformContract()`
- ❌ Hardcodes `storageType: 'indexeddb'`
- ❌ Sets empty `workspaceBindings` (no workspaces enabled)
- ✅ Marks with `isTemp: true`
- ✅ Marks with `autoCreated: true`
- ✅ Uses `saveProject()` (different from `createProject()`)

#### `shouldUseTempProject()` (Lines 192-200)
**Flow**:
```typescript
1. If not desktop platform → return true (mobile always uses temp)
2. If desktop and no FSA handle → return true
3. Otherwise → return false
```

**Key Findings**:
- ✅ Uses `isDesktopPlatform()` for platform detection
- ❌ Does NOT use `getPlatformContract()`
- ❌ Does NOT use `platform.storageType`
- ✅ Mobile always gets temp project
- ✅ Desktop gets temp project if no FSA handle

---

## Project Creation Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Action                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌──────────────────┐                    ┌──────────────────┐
│ "Create Project" │                    │ "New Project"    │
│   (Wizard)       │                    │  (Folder Picker) │
└──────────────────┘                    └──────────────────┘
        │                                           │
        ▼                                           ▼
┌──────────────────┐                    ┌──────────────────┐
│ ProjectCreation  │                    │  HubHomePage     │
│    Wizard        │                    │ handleNewProject │
└──────────────────┘                    └──────────────────┘
        │                                           │
        ▼                                           ▼
┌──────────────────┐                    ┌──────────────────┐
│ User selects     │                    │ Check FSA support│
│ storageType      │                    │ (showDirectory   │
│ (indexeddb/fsa)  │                    │  Picker)         │
└──────────────────┘                    └──────────────────┘
        │                                           │
        ▼                                           ▼
┌──────────────────┐                    ┌──────────────────┐
│ If FSA: Pick     │                    │ Create project   │
│ folder handle    │                    │ with FSA handle  │
└──────────────────┘                    └──────────────────┘
        │                                           │
        └─────────────────────┬─────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ createProject()  │
                    │ (project-crud-   │
                    │  slice.ts)       │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ storageType:     │
                    │ input.storageType│
                    │ ?? 'fsa'         │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Persist to       │
                    │ Zustand + Dexie  │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ handleProject    │
                    │ Created()        │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ getPlatform      │
                    │ Contract()       │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ canAccessIDE?    │
                    └──────────────────┘
                     │              │
              Yes   │              │ No
                     ▼              ▼
            ┌──────────┐    ┌──────────┐
            │ Navigate │    │ Navigate │
            │ to /ide  │    │ to /notes│
            └──────────┘    └──────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Temp Project Flow (Separate)                  │
└─────────────────────────────────────────────────────────────────┘

        ┌──────────────────┐
        │ shouldUseTemp    │
        │ Project()        │
        └──────────────────┘
              │
              ▼
        ┌──────────────────┐
        │ Mobile?          │
        └──────────────────┘
         │              │
    Yes  │              │ No
         ▼              ▼
  ┌──────────┐    ┌──────────────────┐
  │ Return   │    │ Has FSA handle?  │
  │ true     │    └──────────────────┘
  └──────────┘       │              │
                Yes  │              │ No
                     ▼              ▼
              ┌──────────┐    ┌──────────┐
              │ Return   │    │ Return   │
              │ false    │    │ true     │
              └──────────┘    └──────────┘

        ┌──────────────────┐
        │ getOrCreateTemp  │
        │ Project()        │
        └──────────────────┘
              │
              ▼
        ┌──────────────────┐
        │ Check localStorage│
        │ for existing ID  │
        └──────────────────┘
              │
              ▼
        ┌──────────────────┐
        │ If exists: Load  │
        │ If not: Create   │
        └──────────────────┘
              │
              ▼
        ┌──────────────────┐
        │ createTemp       │
        │ Project()        │
        └──────────────────┘
              │
              ▼
        ┌──────────────────┐
        │ storageType:     │
        │ 'indexeddb'      │
        │ (HARDCODED)      │
        └──────────────────┘
              │
              ▼
        ┌──────────────────┐
        │ workspaceBindings│
        │: {} (EMPTY)      │
        └──────────────────┘
              │
              ▼
        ┌──────────────────┐
        │ saveProject()    │
        │ (NOT create      │
        │  Project())      │
        └──────────────────┘
```

---

## Phase 1 Changes Needed

### Change 1: Integrate Platform Contract in HubHomePage.handleNewProject()

**File**: `src/presentation/components/hub/HubHomePage.tsx`
**Lines**: 186-244

**Current Code**:
```typescript
const handleNewProject = async () => {
  try {
    // Check if File System Access API is supported
    const isFSASupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

    if (!isFSASupported) {
      // Graceful degradation for mobile and unsupported browsers
      toast.info(t('hub.fsaNotSupported.title', 'Folder Mounting Not Available'), {
        description: t(
          'hub.fsaNotSupported.description',
          'Folder mounting requires a desktop browser (Chrome, Edge, or Opera). Notes and Study workspaces work without mounting - your data is saved locally.'
        ),
        duration: 8000,
      });
      // Offer to navigate to Notes which doesn't require FSA
      return;
    }

    // 1. Open Directory Picker
    const handle = await window.showDirectoryPicker({
      mode: 'readwrite',
    });

    // 2. Create Project via Zustand Store
    const projectInput: CreateProjectInput = {
      name: handle.name,
      folderPath: handle.name,
      storageMetadata: serializeHandle(handle, 'ide'),
      autoSync: true,
      bindings: {
        ide: true,
        knowledge: true,
        notes: true,
        study: true,
      },
      tags: [],
    };

    const newProjectId = useProjectStore.getState().createProject(projectInput);
    console.log('[HubHomePage] Created project:', newProjectId);

    // 3. Navigate to IDE Workspace
    await navigate({
      to: '/ide/$projectId',
      params: { projectId: newProjectId }
    });
  } catch (error) {
    // Error handling
  }
};
```

**Required Changes**:
```typescript
const handleNewProject = async () => {
  try {
    // Phase 1: Use platform contract for storage decision
    const platform = getPlatformContract();

    // Check if FSA is available (desktop + supported browser)
    if (!platform.canAccessFSA) {
      // Phase 1: Offer temp project or wizard for mobile/desktop without FSA
      toast.info(t('hub.fsaNotAvailable.title', 'Folder Mounting Not Available'), {
        description: t(
          'hub.fsaNotAvailable.description',
          'Folder mounting requires a desktop browser. Would you like to create a project with local storage instead?'
        ),
        action: {
          label: t('hub.createLocalProject', 'Create Local Project'),
          onClick: () => setProjectCreationWizardOpen(true),
        },
        duration: 8000,
      });
      return;
    }

    // 1. Open Directory Picker
    const handle = await window.showDirectoryPicker({
      mode: 'readwrite',
    });

    // 2. Create Project via Zustand Store
    const projectInput: CreateProjectInput = {
      name: handle.name,
      folderPath: handle.name,
      storageType: 'fsa', // Phase 1: Explicitly set storageType
      storageMetadata: serializeHandle(handle, 'ide'),
      autoSync: true,
      bindings: {
        ide: true,
        knowledge: true,
        notes: true,
        study: true,
      },
      tags: [],
    };

    const newProjectId = useProjectStore.getState().createProject(projectInput);
    console.log('[HubHomePage] Created project:', newProjectId);

    // 3. Navigate to IDE Workspace
    await navigate({
      to: '/ide/$projectId',
      params: { projectId: newProjectId }
    });
  } catch (error) {
    // Error handling
  }
};
```

**Changes Summary**:
1. ✅ Add `getPlatformContract()` call
2. ✅ Use `platform.canAccessFSA` instead of checking `showDirectoryPicker`
3. ✅ Add action button to open wizard for local storage
4. ✅ Explicitly set `storageType: 'fsa'` in project input
5. ✅ Update toast message to offer alternative

---

### Change 2: Integrate Platform Contract in ProjectCreationWizard

**File**: `src/presentation/components/project/ProjectCreationWizard.tsx`
**Lines**: 81-118 (INITIAL_FORM_DATA)

**Current Code**:
```typescript
const INITIAL_FORM_DATA: WizardFormData = {
  projectName: '',
  projectDescription: '',
  projectType: 'app',
  projectIcon: '📁',
  template: '',

  storageType: 'indexeddb', // Default to IndexedDB
  fsaHandle: undefined,
  workspaceBindings: {
    knowledge: true,
    notes: true,
    study: true,
    ide: false, // IDE disabled by default
  },

  // ... other fields
};
```

**Required Changes**:
```typescript
// Phase 1: Initialize form data based on platform contract
const getInitialFormData = (): WizardFormData => {
  const platform = getPlatformContract();

  return {
    projectName: '',
    projectDescription: '',
    projectType: 'app',
    projectIcon: '📁',
    template: '',

    // Phase 1: Auto-select storage type based on platform
    storageType: platform.canAccessFSA ? 'fsa' : 'indexeddb',
    fsaHandle: undefined,

    // Phase 1: Auto-configure workspace bindings based on storage type
    workspaceBindings: {
      knowledge: true,
      notes: true,
      study: true,
      ide: platform.canAccessFSA, // IDE only available with FSA
    },

    // ... other fields
  };
};

const INITIAL_FORM_DATA = getInitialFormData();
```

**Additional Changes in `handleCreate()`**:
```typescript
// Phase 1: Validate storage type matches platform capabilities
const handleCreate = useCallback(async () => {
  if (!validateStep(5)) return;

  setIsCreating(true);

  try {
    const platform = getPlatformContract();

    // Phase 1: Validate FSA storage is only used on supported platforms
    if (formData.storageType === 'fsa' && !platform.canAccessFSA) {
      setStepErrors({
        5: t('wizard.validation.fsaNotSupported', 'FSA storage is not available on this platform')
      });
      setIsCreating(false);
      return;
    }

    // Phase 1: Validate FSA handle is provided for FSA storage
    if (formData.storageType === 'fsa' && !formData.fsaHandle) {
      setStepErrors({
        5: t('wizard.validation.fsaHandleRequired', 'Please select a folder for FSA storage')
      });
      setIsCreating(false);
      return;
    }

    // IDE workspace requires FSA storage type - force ide to false for indexeddb
    const finalBindings: WorkspaceBindings = {
      ...formData.workspaceBindings,
      ide: formData.storageType === 'fsa' && formData.workspaceBindings.ide === true,
    };

    // Create project input from wizard data
    const projectInput: CreateProjectInput = {
      name: formData.projectName,
      folderPath: formData.projectName.toLowerCase().replace(/\s+/g, '-'),
      storageType: formData.storageType,
      storageMetadata: formData.storageType === 'fsa' && formData.fsaHandle
        ? serializeHandle(formData.fsaHandle, 'ide')
        : undefined,
      description: formData.projectDescription || undefined,
      tags: [formData.projectType],
      bindings: finalBindings,
    };

    // Create project
    const projectId = createProject(projectInput);

    // Close wizard
    onOpenChange(false);

    // Call success callback
    if (onProjectCreated) {
      onProjectCreated(projectId);
    }
  } catch (error) {
    console.error('[ProjectCreationWizard] Failed to create project:', error);
    setStepErrors({ 5: t('wizard.error.createFailed') });
  } finally {
    setIsCreating(false);
  }
}, [formData, createProject, onOpenChange, onProjectCreated, validateStep, t]);
```

**Changes Summary**:
1. ✅ Add `getPlatformContract()` call in `getInitialFormData()`
2. ✅ Auto-select `storageType` based on `platform.canAccessFSA`
3. ✅ Auto-configure `ide` binding based on platform
4. ✅ Add validation for FSA storage on unsupported platforms
5. ✅ Add validation for FSA handle requirement

---

### Change 3: Update Temp Project Creation to Use Platform Contract

**File**: `src/lib/workspace/temp-project.ts`
**Lines**: 106-138 (createTempProject)

**Current Code**:
```typescript
async function createTempProject(): Promise<Project> {
  const projectId = generateTempProjectId();
  const now = new Date();
  const platform = isDesktopPlatform() ? 'desktop' : 'mobile';

  const tempProject: Project = {
    id: projectId,
    name: `Temp Project (${formatTimestamp(now)})`,
    folderPath: `/virtual/${projectId}`,
    storageType: 'indexeddb', // Virtual storage = IndexedDB only
    lastOpened: now,
    createdAt: now,
    autoSync: false, // No sync for temp projects
    fileSnapshotEnabled: false,
    workspaceBindings: {}, // Empty workspaceBindings for temp project (ARC-D03)
    tags: [], // No tags for temp project
    isTemp: true, // Mark as temp project
    autoCreated: true, // Mark as auto-created
  };

  // Save to project store
  await saveProject(tempProject);

  // Store ID in localStorage for session persistence
  try {
    localStorage.setItem(TEMP_PROJECT_STORAGE_KEY, projectId);
  } catch (e) {
    console.warn('[TempProject] Failed to store ID in localStorage:', e);
  }

  console.log('[TempProject] Created temp project:', projectId, 'platform:', platform);
  return tempProject;
}
```

**Required Changes**:
```typescript
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';

async function createTempProject(): Promise<Project> {
  const projectId = generateTempProjectId();
  const now = new Date();

  // Phase 1: Use platform contract for platform detection
  const platform = getPlatformContract();

  // Phase 1: Configure workspace bindings based on platform
  // Temp projects should enable available workspaces
  const tempWorkspaceBindings: WorkspaceBindings = {
    knowledge: true,
    notes: true,
    study: true,
    ide: platform.canAccessFSA, // IDE only if FSA is available
  };

  const tempProject: Project = {
    id: projectId,
    name: `Temp Project (${formatTimestamp(now)})`,
    folderPath: `/virtual/${projectId}`,
    storageType: platform.storageType, // Phase 1: Use platform's storage type
    lastOpened: now,
    createdAt: now,
    autoSync: false, // No sync for temp projects
    fileSnapshotEnabled: false,
    workspaceBindings: tempWorkspaceBindings, // Phase 1: Enable available workspaces
    tags: [], // No tags for temp project
    isTemp: true, // Mark as temp project
    autoCreated: true, // Mark as auto-created
  };

  // Save to project store
  await saveProject(tempProject);

  // Store ID in localStorage for session persistence
  try {
    localStorage.setItem(TEMP_PROJECT_STORAGE_KEY, projectId);
  } catch (e) {
    console.warn('[TempProject] Failed to store ID in localStorage:', e);
  }

  console.log('[TempProject] Created temp project:', projectId, 'platform:', platform.deviceType);
  return tempProject;
}
```

**Additional Changes in `shouldUseTempProject()`**:
```typescript
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';

/**
 * Check if user should see temp project flow
 *
 * Phase 1: Mobile users always get temp project
 * Desktop users get temp project if no FSA handle available
 */
export function shouldUseTempProject(hasFsaHandle: boolean = false): boolean {
  // Phase 1: Use platform contract for platform detection
  const platform = getPlatformContract();

  // Mobile: Always use temp project
  if (platform.deviceType === 'mobile') {
    return true;
  }

  // Desktop: Use temp project if no FSA handle
  return !hasFsaHandle;
}
```

**Changes Summary**:
1. ✅ Import `getPlatformContract()`
2. ✅ Use `platform.storageType` instead of hardcoded 'indexeddb'
3. ✅ Configure `workspaceBindings` based on `platform.canAccessFSA`
4. ✅ Enable IDE binding only if FSA is available
5. ✅ Use `platform.deviceType` for platform detection
6. ✅ Update logging to use platform.deviceType

---

### Change 4: Update project-crud-slice.ts to Validate Storage Type

**File**: `src/infrastructure/persistence/stores/project/project-crud-slice.ts`
**Lines**: 116-170 (createProject)

**Current Code**:
```typescript
createProject: (input: CreateProjectInput) => {
  const workspaceType: WorkspaceType = input.workspaceType ?? 'ide';
  const projectId = generateProjectId();
  const now = new Date();
  const storageType = input.storageType ?? 'fsa'; // Default to 'fsa' for backward compatibility

  const project: Project = {
    id: projectId,
    name: input.name,
    folderPath: input.folderPath,
    storageType,
    storageMetadata: input.storageMetadata ?? null,
    lastOpened: now,
    createdAt: now,
    autoSync: input.autoSync ?? true,
    workspaceBindings: input.workspaceBindings ?? input.bindings ?? {
      ide: true,
      knowledge: true,
      notes: true,
      study: true,
    },
    description: input.description,
    tags: input.tags ?? [],
  };

  console.log('[ProjectStore] Creating project:', projectId, 'workspace:', workspaceType, 'storageType:', storageType);

  // Update Zustand store
  set((state) => ({
    projects: { ...state.projects, [projectId]: project },
    activeProjectId: projectId,
  }));

  // Persist to Dexie (async, non-blocking)
  db.projects.put(toRecord(project, workspaceType)).catch((error: unknown) => {
    const err = error as Error;
    console.error('[ProjectStore] Failed to persist project to Dexie:', err.message);
  });

  return projectId;
},
```

**Required Changes**:
```typescript
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';

createProject: (input: CreateProjectInput) => {
  const workspaceType: WorkspaceType = input.workspaceType ?? 'ide';
  const projectId = generateProjectId();
  const now = new Date();

  // Phase 1: Use platform contract to determine default storage type
  const platform = getPlatformContract();
  const storageType = input.storageType ?? platform.storageType;

  // Phase 1: Validate storage type matches platform capabilities
  if (storageType === 'fsa' && !platform.canAccessFSA) {
    console.warn('[ProjectStore] FSA storage requested but not available on this platform');
    throw new Error('FSA storage is not available on this platform');
  }

  // Phase 1: Validate FSA handle is provided for FSA storage
  if (storageType === 'fsa' && !input.storageMetadata) {
    console.warn('[ProjectStore] FSA storage requested but no handle metadata provided');
    throw new Error('FSA handle metadata is required for FSA storage');
  }

  // Phase 1: Validate IDE binding matches storage type
  const ideBinding = input.workspaceBindings?.ide ?? input.bindings?.ide ?? true;
  if (ideBinding && storageType !== 'fsa') {
    console.warn('[ProjectStore] IDE binding requested but storage type is not FSA');
    // Auto-disable IDE binding for non-FSA storage
    if (input.workspaceBindings) {
      input.workspaceBindings.ide = false;
    } else if (input.bindings) {
      input.bindings.ide = false;
    }
  }

  const project: Project = {
    id: projectId,
    name: input.name,
    folderPath: input.folderPath,
    storageType,
    storageMetadata: input.storageMetadata ?? null,
    lastOpened: now,
    createdAt: now,
    autoSync: input.autoSync ?? true,
    workspaceBindings: input.workspaceBindings ?? input.bindings ?? {
      ide: storageType === 'fsa', // Phase 1: IDE only enabled for FSA
      knowledge: true,
      notes: true,
      study: true,
    },
    description: input.description,
    tags: input.tags ?? [],
  };

  console.log('[ProjectStore] Creating project:', projectId, 'workspace:', workspaceType, 'storageType:', storageType, 'platform:', platform.deviceType);

  // Update Zustand store
  set((state) => ({
    projects: { ...state.projects, [projectId]: project },
    activeProjectId: projectId,
  }));

  // Persist to Dexie (async, non-blocking)
  db.projects.put(toRecord(project, workspaceType)).catch((error: unknown) => {
    const err = error as Error;
    console.error('[ProjectStore] Failed to persist project to Dexie:', err.message);
  });

  return projectId;
},
```

**Changes Summary**:
1. ✅ Import `getPlatformContract()`
2. ✅ Use `platform.storageType` as default instead of hardcoded 'fsa'
3. ✅ Add validation for FSA storage on unsupported platforms
4. ✅ Add validation for FSA handle requirement
5. ✅ Add validation for IDE binding matching storage type
6. ✅ Auto-disable IDE binding for non-FSA storage
7. ✅ Update default workspace bindings to match storage type
8. ✅ Add platform info to logging

---

### Change 5: Add Temp Project Detection in HubHomePage

**File**: `src/presentation/components/hub/HubHomePage.tsx`
**Lines**: 39-62 (state initialization)

**Current Code**:
```typescript
export const HubHomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Access route search params for project picker triggering
  const routerState = useRouterState();
  const searchParams = routerState.location.search as {
    workspace?: 'ide' | 'notes' | 'knowledge' | 'study';
    action?: string;
    message?: string;
  };

  const { workspace, action, message } = searchParams;

  // State management
  const [booting, setBooting] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const [projectCreationWizardOpen, setProjectCreationWizardOpen] = useState(false);
  const [projectPickerWorkspace, setProjectPickerWorkspace] = useState<'ide' | 'notes' | 'knowledge' | 'study'>('ide');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);

  // Data fetching
  const projects = useLiveQuery(() => db.projects.toArray());
  const isLoading = projects === undefined;
```

**Required Changes**:
```typescript
import { isTempProject, getTempProjectBannerProps } from '@/lib/workspace/temp-project';

export const HubHomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Access route search params for project picker triggering
  const routerState = useRouterState();
  const searchParams = routerState.location.search as {
    workspace?: 'ide' | 'notes' | 'knowledge' | 'study';
    action?: string;
    message?: string;
  };

  const { workspace, action, message } = searchParams;

  // State management
  const [booting, setBooting] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const [projectCreationWizardOpen, setProjectCreationWizardOpen] = useState(false);
  const [projectPickerWorkspace, setProjectPickerWorkspace] = useState<'ide' | 'notes' | 'knowledge' | 'study'>('ide');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [showTempProjectBanner, setShowTempProjectBanner] = useState(false); // Phase 1: Temp project banner state

  // Data fetching
  const projects = useLiveQuery(() => db.projects.toArray());
  const isLoading = projects === undefined;

  // Phase 1: Detect temp projects and show banner
  useEffect(() => {
    if (!projects || projects.length === 0) return;

    const tempProjects = projects.filter(p => isTempProject(p.id));
    if (tempProjects.length > 0) {
      console.log('[HubHomePage] Detected temp projects:', tempProjects.length);
      setShowTempProjectBanner(true);
    }
  }, [projects]);
```

**Additional Changes in JSX**:
```typescript
{/* Phase 1: Temp Project Banner */}
{showTempProjectBanner && (
  <div className="mb-4 p-4 border-2 border-yellow-500 bg-yellow-500/10 rounded-[4px]">
    <div className="flex items-start gap-3">
      <div className="text-2xl">⚠️</div>
      <div className="flex-1">
        <h3 className="font-semibold text-foreground mb-1">
          {t('hub.tempProjectBanner.title', 'Temporary Project Detected')}
        </h3>
        <p className="text-sm text-muted-foreground mb-2">
          {t('hub.tempProjectBanner.description', 'You are using a temporary project. Your data is stored locally and may not persist across sessions. Create a permanent project to save your work.')}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleOpenProjectCreationWizard}
            className="min-h-[36px]"
          >
            {t('hub.tempProjectBanner.createProject', 'Create Permanent Project')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowTempProjectBanner(false)}
            className="min-h-[36px]"
          >
            {t('hub.tempProjectBanner.dismiss', 'Dismiss')}
          </Button>
        </div>
      </div>
    </div>
  </div>
)}
```

**Changes Summary**:
1. ✅ Import `isTempProject` and `getTempProjectBannerProps`
2. ✅ Add `showTempProjectBanner` state
3. ✅ Add useEffect to detect temp projects
4. ✅ Add temp project banner UI
5. ✅ Add action buttons to create permanent project or dismiss

---

## Integration with Temp Project Systems

### Current State

| Aspect | Status | Notes |
|--------|--------|-------|
| Temp project creation | ✅ Implemented | In `temp-project.ts` |
| Temp project detection | ❌ Not implemented | No detection in HubHomePage |
| Temp project banner | ❌ Not implemented | No banner UI |
| Platform contract integration | ❌ Not implemented | Uses hardcoded values |
| Workspace bindings | ❌ Incorrect | Empty bindings for temp projects |
| Storage type | ❌ Incorrect | Hardcoded 'indexeddb' |

### Phase 1 Integration Plan

1. **Temp Project Creation**:
   - ✅ Update `createTempProject()` to use `platform.storageType`
   - ✅ Configure `workspaceBindings` based on platform capabilities
   - ✅ Enable IDE binding only if `platform.canAccessFSA`

2. **Temp Project Detection**:
   - ✅ Add detection in HubHomePage
   - ✅ Filter projects by `isTempProject()` check
   - ✅ Show banner when temp projects detected

3. **Temp Project Banner**:
   - ✅ Create banner UI component
   - ✅ Add action buttons (create permanent project, dismiss)
   - ✅ Add i18n strings for banner text

4. **Platform Contract Integration**:
   - ✅ Replace `isDesktopPlatform()` with `getPlatformContract()`
   - ✅ Use `platform.storageType` for storage decisions
   - ✅ Use `platform.canAccessFSA` for IDE binding decisions

5. **Workspace Bindings**:
   - ✅ Configure bindings based on platform capabilities
   - ✅ Enable all available workspaces for temp projects
   - ✅ Disable IDE for non-FSA platforms

### Temp Project Flow After Phase 1

```
┌─────────────────────────────────────────────────────────────────┐
│                    App Startup / No Project Selected             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ shouldUseTemp    │
                    │ Project()        │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ getPlatform      │
                    │ Contract()       │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ platform.device  │
                    │ Type?            │
                    └──────────────────┘
                     │              │
              Mobile │              │ Desktop
                     ▼              ▼
              ┌──────────┐    ┌──────────────────┐
              │ Return   │    │ Has FSA handle?  │
              │ true     │    └──────────────────┘
              └──────────┘       │              │
                            Yes  │              │ No
                                 ▼              ▼
                          ┌──────────┐    ┌──────────┐
                          │ Return   │    │ Return   │
                          │ false    │    │ true     │
                          └──────────┘    └──────────┘

                    ┌──────────────────┐
                    │ getOrCreateTemp  │
                    │ Project()        │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Check localStorage│
                    │ for existing ID  │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ If exists: Load  │
                    │ If not: Create   │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ createTemp       │
                    │ Project()        │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ getPlatform      │
                    │ Contract()       │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ storageType:     │
                    │ platform.storage │
                    │ Type             │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ workspaceBindings│
                    │: {               │
                    │   knowledge: true│
                    │   notes: true    │
                    │   study: true    │
                    │   ide: platform  │
                    │     .canAccessFSA│
                    │ }                │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ saveProject()    │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Navigate to      │
                    │ workspace        │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Show temp project│
                    │ banner in Hub    │
                    └──────────────────┘
```

---

## Summary of Required Changes

### Files to Modify

| File | Lines | Changes | Priority |
|------|-------|---------|----------|
| `HubHomePage.tsx` | 186-244 | Integrate platform contract in handleNewProject | P0 |
| `HubHomePage.tsx` | 39-62 | Add temp project detection and banner | P0 |
| `ProjectCreationWizard.tsx` | 81-118 | Auto-select storage type based on platform | P0 |
| `ProjectCreationWizard.tsx` | 275-316 | Add platform validation in handleCreate | P0 |
| `project-crud-slice.ts` | 116-170 | Add platform validation in createProject | P0 |
| `temp-project.ts` | 106-138 | Use platform contract for temp project creation | P0 |
| `temp-project.ts` | 192-200 | Use platform contract in shouldUseTempProject | P0 |

### Total Changes

- **7 code changes** across 4 files
- **2 new UI components** (temp project banner)
- **3 validation additions** (FSA storage, FSA handle, IDE binding)
- **4 platform contract integrations**

### Testing Requirements

1. **Desktop with FSA**:
   - ✅ Create project via folder picker
   - ✅ Create project via wizard (FSA storage)
   - ✅ IDE binding enabled
   - ✅ Navigate to IDE after creation

2. **Desktop without FSA**:
   - ✅ Show toast with action button
   - ✅ Create project via wizard (IndexedDB storage)
   - ✅ IDE binding disabled
   - ✅ Navigate to Notes after creation

3. **Mobile**:
   - ✅ Auto-create temp project
   - ✅ Show temp project banner
   - ✅ Create permanent project via wizard
   - ✅ Navigate to Notes after creation

4. **Temp Projects**:
   - ✅ Temp project created with correct storage type
   - ✅ Temp project has correct workspace bindings
   - ✅ Temp project banner displayed
   - ✅ Banner actions work correctly

---

## Conclusion

The investigation reveals that the current project creation flow has three distinct paths that are not integrated with the platform contract system. Phase 1 requires:

1. **Integrate platform contract** into all creation flows
2. **Auto-select storage type** based on platform capabilities
3. **Validate storage type** matches platform capabilities
4. **Configure workspace bindings** based on storage type
5. **Update temp project creation** to use platform contract
6. **Add temp project detection** and banner UI

These changes will ensure that project creation is platform-aware and follows ADR-033 decisions for storage type and workspace access.

---

**Report End**