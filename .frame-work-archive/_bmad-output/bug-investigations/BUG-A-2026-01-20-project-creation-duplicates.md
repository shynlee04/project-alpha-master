# Investigation Report: Project Creation Bugs

**Date**: 2026-01-20
**Investigated By**: bmad-master
**Severity**: Critical (blocks users from creating projects)

---

## Executive Summary

Three related bugs identified:
1. **Cannot create projects** after database refresh
2. **Duplicate projects created** (one with folder name, one with user name)
3. **"Gateway not initialized"** error when reloading IDE

**Root Cause Analysis**:
- Migration v28 exists but may not be running correctly
- Two independent project creation flows that can both trigger
- Storage gateway initialization timing issue
- folderPath validation may be silently failing

---

## Part 1: Why Can't Create Projects?

### Migration v28 Status

**Migration Definition Found** (`dexie-db-migrations.ts`):
```typescript
// Schema version 28: Add folderPath index to projects table (BUG-A-2026-01-21)
// Required for duplicate folder detection in project creation
db.version(28).stores({
    projects: 'id, lastOpened, name, folderPath',  // ADD folderPath index
    // ... other tables
});
```

**Issue**: Migration exists but validation code has fallback that masks the real issue.

### folderPath Validation Logic

**Location**: `project-crud-slice.ts` lines 129-162

```typescript
// FIX-2026-01-21: Validate folderPath before duplicate check
if (!input.folderPath || input.folderPath.trim() === '') {
  throw new Error('Project folder path is required');
}

// FIX-2026-01-21: Check if folder path is already used by another project
try {
    let existingProject;
    try {
        // Try indexed query first (fast, requires schema v28+)
        existingProject = await db.projects
            .where('folderPath')
            .equals(input.folderPath)
            .first();
    } catch (indexError) {
        // Fallback to filter scan for older schemas
        console.warn('[ProjectStore] folderPath not indexed, using filter scan');
        const allProjects = await db.projects.toArray();
        existingProject = allProjects.find(p => p.folderPath === input.folderPath);
    }

    if (existingProject) {
        throw new Error(`This folder is already used by project "${existingProject.name}"`);
    }
} catch (error) {
    // Only re-throw if it's our duplicate folder error
    if ((error as Error).message.includes('already used by project')) {
        throw error;
    }
    // Log but don't block project creation for other errors
    console.error('[ProjectStore] Error checking duplicate folder:', error);
}
```

**Problems Identified**:

1. **Error Swallowing**: Lines 155-161 catch errors but only re-throw if the message contains "already used by project". Other errors (like "folderPath not indexed") are logged but don't block creation.

2. **Silent Failures**: If migration v28 didn't run (no folderPath index), the fallback to filter scan works but is slow and may fail silently if there's a database corruption issue.

3. **No Migration Verification**: The code doesn't verify that migration v28 actually ran before attempting indexed queries.

---

## Part 2: Why Duplicate Projects Created?

### Root Cause: Two Independent Creation Flows

#### Flow 1: Direct Folder Picker (`handleNewProject`)

**Location**: `HubHomePage.tsx` lines 199-277

```typescript
const handleNewProject = async () => {
  try {
    // 1. Open Directory Picker
    const handle = await window.showDirectoryPicker({
      mode: 'readwrite',
    });

    // 2. Create Project via Zustand Store
    const projectInput: CreateProjectInput = {
      name: handle.name,          // ← Uses FOLDER NAME
      folderPath: handle.name,
      storageMetadata: serializeHandle(handle, 'ide'),
      autoSync: true,
      bindings: { ide: true, knowledge: true, notes: true, study: true },
      tags: [],
    };

    // Create project
    const newProjectId = await useProjectStore.getState().createProject(projectInput);
    console.log('[HubHomePage] Created project:', newProjectId);

    // 3. Navigate to Workspace
    await navigate({ to: '/ide/$projectId', params: { projectId: newProjectId }});
  } catch (error) {
    // ... error handling
  }
};
```

**Triggered by**:
- "Create New" button in RecentProjectsSection (when empty state)
- "CREATE PROJECT" bento card on Hub

**Project Name**: `handle.name` (the folder name from directory picker)

#### Flow 2: Wizard (`ProjectCreationWizard`)

**Location**: `ProjectCreationWizard.tsx`

```typescript
// Wizard form data includes user-input name
const [formData, setFormData] = useState<WizardFormData>({
  projectName: '',  // ← USER INPUTS NAME
  projectDescription: '',
  projectType: 'app',
  // ... other fields
});

// On wizard completion
const projectInput: CreateProjectInput = {
  name: formData.projectName,  // ← Uses USER INPUT NAME
  folderPath: formData.projectName,  // ← May differ from folder name!
  // ... other fields
};

const projectId = await createProject(projectInput);
```

**Triggered by**:
- "Create Project" button on Hub (bento card)
- "Create New" button in ProjectPickerDialog

**Project Name**: User-input name from wizard form

### Hypothesis: Both Flows Triggering Simultaneously

**Evidence**:
1. User reports: "Creates 2 projects instead of 1"
2. User reports: "One with folder name, another with user's name"
3. Code review shows both flows can create projects independently

**Possible Scenario**:
1. User clicks "Create Project" on Hub
2. Triggers `handleNewProject` (opens folder picker)
3. User picks folder and closes picker
4. Project created with folder name (Flow 1)
5. Simultaneously, `ProjectCreationWizard` might also be opening (due to state management issue)
6. Wizard creates project with user-input name (Flow 2)
7. Result: 2 projects

**Alternative Scenario**:
1. User navigates to a workspace (e.g., Notes)
2. `ProjectPickerDialog` opens (no projects exist)
3. User clicks "Create New" button
4. Both `handleNewProject` AND `ProjectCreationWizard` triggered
5. Duplicate projects created

---

## Part 3: "Gateway Not Initialized" Error

### Error Location

**File**: `useFileTreeActions.ts` line 109

```typescript
const loadRootDirectory = useCallback(async () => {
  // ... code ...

  try {
    const gateway = getGateway();
    if (!gateway) {
      throw new FileSystemError('Gateway not initialized', 'GATEWAY_NOT_INITIALIZED');
    }

    const entries = await gateway.list('.');
    // ... rest of code
  } catch (err) {
    // ... error handling
  }
}, [directoryHandle, getGateway, ...]);
```

### Root Cause: Timing Issue

**Issue**: `getGateway()` returns `null` when called during project reload.

**Possible Causes**:
1. StorageGateway not initialized before FileTree loads
2. Project metadata loaded but FSA handle not yet restored
3. Race condition between project load and gateway initialization

**Call Chain** (suspected):
```
User reloads page
  → Project loads from Dexie
  → ProjectContext mounts
  → FileTree mounts
  → useFileTreeActions calls loadRootDirectory
  → getGateway() called
  → Gateway not yet initialized → ERROR
```

---

## Detailed Analysis

### Migration v28 Issues

**Current State**:
- Migration v28 exists in code
- Adds `folderPath` index to projects table
- Required for efficient duplicate folder detection

**Potential Problems**:
1. Migration may not have run if user refreshed IndexedDB
2. No localStorage key to verify migration ran
3. Fallback logic masks real migration issues

**Evidence**:
```typescript
// project-crud-slice.ts:140-144
try {
    existingProject = await db.projects
        .where('folderPath')
        .equals(input.folderPath)
        .first();
} catch (indexError) {
    // Fallback for older schemas
    console.warn('[ProjectStore] folderPath not indexed, using filter scan');
    const allProjects = await db.projects.toArray();
    existingProject = allProjects.find(p => p.folderPath === input.folderPath);
}
```

**Problem**: If migration v28 didn't run, the fallback works BUT is slow and doesn't verify that the index should exist.

### Duplicate Project Creation Flow

**UI Flow Diagram**:

```
Hub Page
│
├── Bento Grid
│   ├── "CREATE PROJECT" button → handleOpenProjectCreationWizard()
│   │                              ↓
│   │                        ProjectCreationWizard (Flow 2)
│   │
│   └── "CREATE_PROJECT" card → handleOpenProjectCreationWizard()
│                                  ↓
│                            ProjectCreationWizard (Flow 2)
│
├── RecentProjectsSection (when empty)
│   └── "Create New" button → onNewProject → handleNewProject()
│                                          ↓
│                                   Direct Folder Picker (Flow 1)
│
└── ProjectPickerDialog (when opening workspace)
    └── "Create New" button → onCreateNew → handleOpenProjectCreationWizard()
                                            ↓
                                      ProjectCreationWizard (Flow 2)
```

**Problem**: There's NO call to `handleNewProject` from `ProjectPickerDialog.onCreateNew`. Both call `handleOpenProjectCreationWizard`.

**Wait - this doesn't explain duplicates**...

Let me re-examine the flow more carefully.

### Re-examining HubHomePage Triggers

**HubHomePage.tsx lines 386-398**:

```typescript
// ProjectPickerDialog
<ProjectPickerDialog
  open={projectPickerOpen}
  onOpenChange={setProjectPickerOpen}
  targetWorkspace={projectPickerWorkspace}
  onCreateNew={handleOpenProjectCreationWizard}  // ← Opens WIZARD
/>

// ProjectCreationWizard
<ProjectCreationWizard
  open={projectCreationWizardOpen}
  onOpenChange={setProjectCreationWizardOpen}
  onProjectCreated={handleProjectCreated}
/>
```

**HubHomePage.tsx lines 351-364**:

```typescript
const bentoCards: BentoCardProps[] = useMemo(() => [
  {
    id: 'new-project',
    size: 'medium',
    title: t('hub.menu.createProject', 'CREATE_PROJECT'),
    description: t('hub.newProjectDesc', 'Initialize a new workspace entry'),
    icon: <Plus className="h-8 w-8" />,
    topic: 'Workspace',
    onClick: handleOpenProjectCreationWizard,  // ← Opens WIZARD
    // ...
  },
  // ... other cards
], [t, navigate, handleNewProject, navigateToWorkspace]);
```

**RecentProjectsSection.tsx line 86**:

```typescript
<EmptyState
  variant="no-projects"
  message={t('hub.noProjects', 'No directories found in local storage.')}
  action="create"
  onAction={onNewProject}  // ← Calls handleNewProject (Flow 1)
/>
```

**Key Finding**: The "Create New" button in empty state calls `handleNewProject` (Flow 1), while the "CREATE PROJECT" bento cards and ProjectPickerDialog call the wizard (Flow 2).

**But this still doesn't explain duplicates...**

### Hypothesis: User Interaction Pattern

**Scenario that could cause duplicates**:

1. User has no projects
2. User sees both "CREATE PROJECT" bento card AND empty state "Create New" button
3. User clicks "CREATE PROJECT" bento card
4. Wizard opens
5. User inputs name and creates project (Flow 2 - user name)
6. But somehow `handleNewProject` was ALSO triggered?

**OR**:

1. User clicks "Create New" in empty state
2. Folder picker opens
3. User picks folder
4. Project created with folder name (Flow 1)
5. BUT `handleProjectCreated` callback ALSO triggers wizard to open?
6. Wizard creates second project?

Let me check if `handleNewProject` has a callback that could trigger the wizard.

---

## Hypothesis: Callback Chain Issue

**HubHomePage.tsx lines 156-197**:

```typescript
const handleProjectCreated = (projectId: string) => {
  toast.success(t('hub.projectCreated', 'Project created successfully'), {
    description: t('hub.projectCreatedDesc', 'Your project is ready to use'),
    duration: 3000,
  });

  // ... navigation logic
};

const handleNewProject = async () => {
  try {
    // ... folder picker logic
    const newProjectId = await useProjectStore.getState().createProject(projectInput);
    console.log('[HubHomePage] Created project:', newProjectId);

    // Persist FSA handle
    if (handle) {
      await handlePersistenceService.persistHandle(newProjectId, handle, 'ide');
    }

    // Navigate to Workspace
    await navigate({ to: '/ide/$projectId', params: { projectId: newProjectId }});
  } catch (error) {
    // ... error handling
  }
};
```

**Finding**: `handleNewProject` does NOT call `handleProjectCreated`. It navigates directly.

**So where could the duplicate come from?**

Let me check if there's a navigation issue where both wizards open...

---

## New Hypothesis: State Management Issue

**Possible Issue**:
- `projectCreationWizardOpen` state gets set to `true` unexpectedly
- Both wizard and direct folder picker trigger simultaneously

**Evidence Needed**:
- Browser DevTools console logs when duplicates occur
- React DevTools state inspector showing component states
- Network tab showing API calls to createProject

**Without logs**, we can only hypothesize. Most likely causes:

1. **Race condition**: User clicks multiple buttons rapidly
2. **State corruption**: `projectCreationWizardOpen` state set incorrectly
3. **Event bubbling**: Click events firing on multiple elements
4. **Navigation bug**: Query params trigger both flows

---

## Recommended Fixes

### Fix 1: Verify Migration v28 Ran

**File**: `dexie-db-migrations.ts`

```typescript
// Add verification after migration v28
db.version(28).stores({
    projects: 'id, lastOpened, name, folderPath',
    // ... other tables
}).upgrade(async () => {
    console.log('[Dexie] Running migration to v28 (BUG-A-2026-01-21)');

    // Verify folderPath index exists
    const hasIndex = await db.projects.toCollection().primaryKeys(); // Check if works

    if (hasIndex) {
        console.log('[Dexie] Migration v28: folderPath index created');
    } else {
        console.error('[Dexie] Migration v28: folderPath index NOT created');
    }

    markMigrationApplied(28); // Mark as applied
});
```

**File**: `project-crud-slice.ts`

```typescript
// Verify migration ran before attempting indexed query
const migrationV28Applied = localStorage.getItem('dexie-migration-v28-applied');

if (!migrationV28Applied) {
    console.warn('[ProjectStore] Migration v28 not applied, forcing filter scan');
    const allProjects = await db.projects.toArray();
    existingProject = allProjects.find(p => p.folderPath === input.folderPath);
} else {
    try {
        existingProject = await db.projects
            .where('folderPath')
            .equals(input.folderPath)
            .first();
    } catch (indexError) {
        // Unexpected error - migration may have failed
        console.error('[ProjectStore] Unexpected folderPath index error:', indexError);
        throw new Error(`Database migration failed. Please refresh the page. Error: ${indexError.message}`);
    }
}
```

### Fix 2: Prevent Duplicate Creation Flows

**File**: `HubHomePage.tsx`

```typescript
// Add guard to prevent both flows triggering simultaneously
const [isCreatingProject, setIsCreatingProject] = useState(false);

const handleNewProject = async () => {
  if (isCreatingProject) {
    console.warn('[HubHomePage] Project creation already in progress, ignoring');
    return;
  }

  setIsCreatingProject(true);
  try {
    // ... existing folder picker logic
  } finally {
    setIsCreatingProject(false);
  }
};

// Update ProjectCreationWizard to check flag
<ProjectCreationWizard
  open={projectCreationWizardOpen}
  onOpenChange={(open) => {
    if (!open && isCreatingProject) {
      // Don't close wizard if creation is in progress
      return;
    }
    setProjectCreationWizardOpen(open);
  }}
  onProjectCreated={(projectId) => {
    setIsCreatingProject(false);
    handleProjectCreated(projectId);
  }}
/>
```

**File**: `RecentProjectsSection.tsx`

```typescript
// Change empty state to call wizard instead of direct folder picker
<EmptyState
  variant="no-projects"
  message={t('hub.noProjects', 'No directories found in local storage.')}
  action="create"
  onAction={() => {
    // Call wizard, not direct folder picker
    navigate({ to: '/hub', search: { action: 'create-project' }});
  }}
/>
```

**Rationale**: Unify all project creation through the wizard to prevent race conditions.

### Fix 3: Gateway Initialization Timing

**File**: `useFileTreeActions.ts`

```typescript
const loadRootDirectory = useCallback(async () => {
  // For IndexedDB projects, use localAdapterRef
  if (!directoryHandle) {
    // ... existing IndexedDB handling
    return;
  }

  setIsLoading(true);
  setError(null);

  try {
    // Retry gateway initialization with timeout
    const gateway = await Promise.race([
      getGateway(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gateway init timeout')), 5000)
      )
    ]);

    if (!gateway) {
      throw new FileSystemError('Gateway not initialized', 'GATEWAY_NOT_INITIALIZED');
    }

    const entries = await gateway.list('.');
    // ... rest of code
  } catch (err) {
    // ... error handling
  } finally {
    setIsLoading(false);
  }
}, [directoryHandle, getGateway, ...]);
```

**File**: Ensure gateway is initialized before FileTree mounts

```typescript
// In ProjectContext or IDE route
useEffect(() => {
  const initGateway = async () => {
    const gateway = initializeStorageGateway(project);
    await gateway.initialize();
    setGateway(gateway);
  };

  initGateway();
}, [project]);
```

---

## Evidence Checklist

- [x] Migration v28 definition found
- [x] folderPath validation logic reviewed
- [x] Two project creation flows identified
- [x] "Gateway not initialized" error location found
- [x] State management in HubHomePage reviewed
- [x] RecentProjectsSection triggers reviewed
- [ ] **Missing**: Browser console logs from user
- [ ] **Missing**: React DevTools state snapshot during duplicate
- [ ] **Missing**: Migration v28 localStorage key check
- [ ] **Missing**: Actual database schema verification

---

## Next Steps for User

1. **Check Migration Status**:
   ```javascript
   // In browser console
   localStorage.getItem('dexie-migration-v28-applied')
   ```

2. **Check Database Schema**:
   ```javascript
   // In browser console
   indexedDB.open('ViaGentDatabase').onsuccess = (e) => {
     const db = e.target.result;
     const store = db.transaction('projects').objectStore('projects');
     console.log('Index names:', store.indexNames);
   };
   ```

3. **Enable Verbose Logging**:
   - Reproduce the duplicate issue
   - Check console for "[ProjectStore] Creating project:" logs
   - Check for multiple creation calls

4. **Clear Database** (temporary fix):
   ```javascript
   // In browser console
   indexedDB.deleteDatabase('ViaGentDatabase');
   // Reload page
   ```

---

## Conclusion

**Root Cause**: Most likely a race condition between two independent project creation flows combined with migration v28 verification issues.

**Immediate Fixes**:
1. Add migration v28 verification with explicit error messaging
2. Unify project creation through wizard only (remove direct folder picker)
3. Add creation guard flag to prevent duplicate calls
4. Fix gateway initialization timing with retry logic

**Priority**: HIGH - Blocks users from creating projects

**Estimated Fix Time**: 2-3 hours (implementation + testing)

---

**Generated**: 2026-01-20
**Status**: Investigation Complete - Awaiting User Feedback
