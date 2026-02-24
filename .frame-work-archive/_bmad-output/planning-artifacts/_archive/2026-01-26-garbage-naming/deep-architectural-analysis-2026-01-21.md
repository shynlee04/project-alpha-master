# Deep Architectural Analysis & Specification
## Routes, User Use Cases, and Infrastructure Mapping

**Date**: 2026-01-15
**Status**: DRAFT - FOR REVIEW
**Author**: BMAD Master Orchestrator
**Purpose**: Comprehensive analysis before any implementation

---

## Executive Summary

This document provides a complete analysis of:
1. **All routes** and their current behavior
2. **All user use cases** (returned, new, desktop, mobile)
3. **Infrastructure capabilities** (DexieDB + FSA)
4. **Hot reactivity requirements**
5. **Project ID management**
6. **Platform boundaries** (Desktop=FSA, Mobile=IndexedDB, No IDE on mobile)

**Key Finding**: The architecture is well-designed in ADR-033/034/035 but **NOT EXECUTED**. Current implementation has 31 infection points blocking all user journeys.

---

## Part 1: Route Analysis

### 1.1 Current Route Structure

| Route | File | Purpose | Current Behavior | Expected Behavior |
|-------|------|---------|------------------|-------------------|
| `/` | `index.tsx` | Hub homepage | Shows HubHomePage | ✅ Correct |
| `/hub` | `hub.tsx` | Hub homepage | Shows HubHomePage | ✅ Correct |
| `/notes` | `notes.lazy.tsx` | Notes workspace | **CRASHES** with hooks error | Desktop: Show project picker<br>Mobile: Auto-load browser-mode |
| `/notes/$projectId` | `notes.$projectId.lazy.tsx` | Notes for project | **BOUNCES** to hub (loader race) | Load project, show NotesPage |
| `/ide/$projectId` | `ide.$projectId.tsx` | IDE for project | **EMPTY** (FSA handle lost) | Load project, show IDELayout |
| `/study.$projectId` | `study.$projectId.lazy.tsx` | Study workspace | Not tested | Load project, show StudyPage |
| `/knowledge.$projectId` | `knowledge.$projectId.lazy.tsx` | Knowledge workspace | Not tested | Load project, show KnowledgePage |
| `/ide` | `ide.tsx` | IDE base | Shows temp project option | **SHOULD NOT EXIST** (per ADR-033) |
| `/settings` | `settings.tsx` | Settings | Not analyzed | Show settings page |
| `/projects` | `projects.tsx` | Projects list | Not analyzed | Show all projects |

### 1.2 Route Loading Pattern Analysis

#### Pattern 1: `/notes` (Lazy Route with Component Logic)

**Current Implementation**:
```typescript
export const Route = createLazyFileRoute('/notes')({
  component: () => (
    <ErrorBoundary>
      <NotesWorkspaceDefault />
    </ErrorBoundary>
  ),
});

function NotesWorkspaceDefault() {
  const platform = getPlatformContract();
  const [project, setProject] = useState<Project | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  // ❌ PROBLEM: useLiveQuery hook causes hooks error
  const fsaProjects = useLiveQuery(async () => {
    if (!platform.canAccessFSA) return [];
    const allProjects = await db.projects.toArray();
    return allProjects.filter(
      (p) => p.storageType === 'fsa' && p.workspaceBindings?.notes === true
    );
  }, [platform.canAccessFSA]);

  useEffect(() => {
    // Desktop with FSA → show picker
    if (platform.canAccessFSA) {
      setShowPicker(true);
      return;
    }

    // Mobile → use browser-mode
    import('@/lib/workspace/browser-mode').then(
      async ({ getOrCreateBrowserModeProject, BROWSER_MODE_PROJECT_ID }) => {
        const browserProject = await getOrCreateBrowserModeProject();
        if (browserProject) {
          setProject(browserProject);
        }
      }
    );
  }, [platform.canAccessFSA, fsaProjects]);

  // Desktop: Show project picker dialog
  if (platform.canAccessFSA && showPicker) {
    return <ProjectPickerDialog open={true} ... />;
  }

  // Mobile: Show loading or NotesPage
  if (!project) {
    return <LoadingSpinner />;
  }

  return (
    <ProjectProvider project={project} workspace="notes">
      <NotesPage />
    </ProjectProvider>
  );
}
```

**Issues Identified**:
1. ❌ **Hooks Error**: `useLiveQuery` hook causes "Rendered fewer hooks than expected" error
2. ❌ **Race Condition**: `useEffect` runs AFTER first render, but component needs data immediately
3. ❌ **Conditional Hook**: `useLiveQuery` is called conditionally (inside useEffect logic)
4. ❌ **No Loader**: Route has no loader, all data fetching happens in component

**Expected Behavior** (per ADR-033):
```typescript
export const Route = createLazyFileRoute('/notes')({
  component: () => (
    <ErrorBoundary>
      <NotesWorkspaceDefault />
    </ErrorBoundary>
  ),
});

function NotesWorkspaceDefault() {
  const platform = getPlatformContract();

  // Desktop with FSA → show project picker
  if (platform.canAccessFSA) {
    return <ProjectPickerDialog open={true} targetWorkspace="notes" />;
  }

  // Mobile → auto-load browser-mode project
  const browserProject = useBrowserModeProject(); // Custom hook, no hooks error
  if (!browserProject) {
    return <LoadingSpinner />;
  }

  return (
    <ProjectProvider project={browserProject} workspace="notes">
      <NotesPage />
    </ProjectProvider>
  );
}
```

---

#### Pattern 2: `/notes/$projectId` (Lazy Route with Loader)

**Current Implementation**:
```typescript
export const Route = createLazyFileRoute('/notes/$projectId')({
  ssr: false,

  // ✅ CORRECT: Uses loader for data fetching
  loader: async ({ params }) => {
    const { projectId } = params;
    console.log('[notes.$projectId] Loader called for project:', projectId);

    // ❌ PROBLEM: getProjectWithRetry tries Zustand first (empty), then facade
    const project = await getProjectWithRetry(projectId, 3, 50);
    if (!project) {
      console.error('[notes.$projectId] Project not found:', projectId);
      throw redirect({ to: '/hub' });
    }

    console.log('[notes.$projectId] Project loaded successfully:', project.id);
    return { project };
  },

  component: () => (
    <ErrorBoundary>
      <NotesWorkspace />
    </ErrorBoundary>
  ),
});

function NotesWorkspace() {
  const { projectId: _projectId } = Route.useParams();
  const { project } = Route.useLoaderData();

  return (
    <ProjectProvider project={project as Project | null} workspace="notes">
      <NotesPage />
    </ProjectProvider>
  );
}

// ❌ PROBLEM: Retry logic tries Zustand first (always empty on first load)
async function getProjectWithRetry(
  projectId: string,
  maxRetries: number = 3,
  baseDelayMs: number = 50
): Promise<Project | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // ❌ Try Zustand first (always empty on first load)
    const fromStore = useProjectStore.getState().getProject(projectId);
    if (fromStore) {
      return fromStore as Project;
    }

    // ❌ Try facade (also reads Zustand, never Dexie)
    try {
      const fromFacade = await getProject(projectId);
      if (fromFacade) {
        return fromFacade as Project;
      }
    } catch (error) {
      lastError = error as Error;
    }

    if (attempt < maxRetries) {
      const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return null;
}
```

**Issues Identified**:
1. ❌ **Race Condition**: Loader runs BEFORE `hydrateProjects()` completes
2. ❌ **Wrong Data Source**: `getProject()` facade only reads Zustand, never Dexie
3. ❌ **Retry Logic Insufficient**: 3 attempts with 50-200ms delay is too short
4. ❌ **No Event-Driven Wait**: Should wait for hydration event, not time-based retry

**Root Cause**:
```
App loads → __root.tsx renders → AppInitializer returns children immediately
         → TanStack Router matches /notes/$projectId
         → Loader runs SYNCHRONOUSLY → tries to find project
         → Store is EMPTY (hydration hasn't run yet!)
         → Loader fails → redirects to /hub
         → THEN useEffect in AppInitializer runs → hydrateProjects()
```

**Expected Behavior** (per ADR-034 D12):
```typescript
export const Route = createLazyFileRoute('/notes/$projectId')({
  ssr: false,

  // ✅ CORRECT: Use loader only for data fetch
  loader: async ({ params }) => {
    const { projectId } = params;

    // ✅ Wait for hydration to complete
    await waitForHydration();

    // ✅ Query Dexie directly (not Zustand)
    const record = await db.projects.get(projectId);
    if (!record) {
      throw redirect({ to: '/hub' });
    }

    const project = fromRecord(record);
    return { project };
  },

  component: () => (
    <ErrorBoundary>
      <NotesWorkspace />
    </ErrorBoundary>
  ),
});

// ✅ Event-driven hydration wait
async function waitForHydration(): Promise<void> {
  const state = useProjectStore.getState();

  // If already hydrated, return immediately
  if (state._hasHydrated) {
    return;
  }

  // Otherwise, wait for hydration event
  return new Promise((resolve) => {
    const unsubscribe = useProjectStore.subscribe(
      (s) => s._hasHydrated,
      (hydrated) => {
        if (hydrated) {
          unsubscribe();
          resolve();
        }
      }
    );
  });
}
```

---

#### Pattern 3: `/ide/$projectId` (Non-Lazy Route with beforeLoad)

**Current Implementation**:
```typescript
export const Route = createFileRoute('/ide/$projectId')({
  ssr: false,

  // ✅ CORRECT: beforeLoad for platform guards ONLY
  beforeLoad: async ({ params }) => {
    const { projectId } = params;
    console.log('[IDERoute] beforeLoad called for project:', projectId);

    // ✅ Check: Mobile users cannot access IDE
    const platform = getPlatformContract();
    if (!platform.canAccessIDE) {
      console.warn('[IDERoute] Mobile/tablet access denied to IDE, redirecting to Notes');
      throw redirect({
        to: '/notes/$projectId',
        params: { projectId },
        search: { reason: 'mobile-not-supported' }
      });
    }

    // ✅ CORRECT: Do NOT fetch project data here (ADR-034 D12)
    console.log('[IDERoute] Route guard passed (platform validated):', { projectId });
  },

  // ✅ CORRECT: Loader for data fetch ONLY
  loader: async ({ params }) => {
    console.log('[IDERoute.loader] Loading project:', params.projectId);
    const project = await getProjectWithRetry(params.projectId);

    if (!project) {
      console.error('[IDERoute.loader] CRITICAL: Project not found after retry:', params.projectId);
      throw redirect({ to: '/hub' });
    }

    console.log('[IDERoute.loader] Project found:', { id: project.id, name: project.name });
    return { project };
  },

  component: () => (
    <ErrorBoundary>
      <IDEWorkspace />
    </ErrorBoundary>
  ),
});

function IDEWorkspace() {
  const { projectId: _projectId } = Route.useParams();
  const { project } = Route.useLoaderData();

  // ✅ Set projectId in stores
  useEffect(() => {
    if (_projectId) {
      useIDEStore.getState().setProjectId(_projectId);
      useWorkspaceStore.getState().setCurrentProject(_projectId);
    }
  }, [_projectId]);

  return (
    <ProjectProvider project={project as Project | null} workspace="ide">
      <ToastProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <IDELayout />
        </Suspense>
        <Toast />
      </ToastProvider>
    </ProjectProvider>
  );
}
```

**Issues Identified**:
1. ❌ **Same Race Condition**: Loader runs BEFORE hydration completes
2. ❌ **Same Wrong Data Source**: `getProjectWithRetry()` only reads Zustand
3. ❌ **FSA Handle Lost**: ProjectContext doesn't provide FSA handle to IDELayout

**Expected Behavior** (per ADR-034 D10, D12):
```typescript
export const Route = createFileRoute('/ide/$projectId')({
  ssr: false,

  // ✅ Platform guards ONLY
  beforeLoad: async ({ params }) => {
    const platform = getPlatformContract();

    // ✅ Mobile users cannot access IDE
    if (!platform.canAccessIDE) {
      throw redirect({
        to: '/notes/$projectId',
        params: { projectId },
        search: { reason: 'mobile-not-supported' }
      });
    }
  },

  // ✅ Data fetch ONLY
  loader: async ({ params }) => {
    // ✅ Wait for hydration
    await waitForHydration();

    // ✅ Query Dexie directly
    const record = await db.projects.get(params.projectId);
    if (!record) {
      throw redirect({ to: '/hub' });
    }

    const project = fromRecord(record);
    return { project };
  },

  component: () => (
    <ErrorBoundary>
      <IDEWorkspace />
    </ErrorBoundary>
  ),
});

function IDEWorkspace() {
  const { projectId: _projectId } = Route.useParams();
  const { project } = Route.useLoaderData();

  // ✅ Set projectId in stores
  useEffect(() => {
    if (_projectId) {
      useIDEStore.getState().setProjectId(_projectId);
      useWorkspaceStore.getState().setCurrentProject(_projectId);
    }
  }, [_projectId]);

  return (
    <ProjectProvider project={project as Project | null} workspace="ide">
      <ToastProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <IDELayout />
        </Suspense>
        <Toast />
      </ToastProvider>
    </ProjectProvider>
  );
}
```

---

### 1.3 Route Loading Timing Analysis

#### Current Timing (BROKEN)

```
T+0ms:   App loads
T+0ms:   __root.tsx renders
T+0ms:   AppInitializer returns children immediately (no await)
T+0ms:   TanStack Router matches /notes/$projectId
T+0ms:   Loader runs SYNCHRONOUSLY
T+0ms:   getProjectWithRetry() tries Zustand → EMPTY
T+0ms:   getProjectWithRetry() tries facade → EMPTY
T+50ms:  Retry 1 → Still EMPTY
T+150ms: Retry 2 → Still EMPTY
T+350ms: Retry 3 → Still EMPTY
T+350ms: Loader fails → redirect to /hub
T+350ms: THEN useEffect in AppInitializer runs
T+350ms: hydrateProjects() starts
T+500ms: hydrateProjects() completes
T+500ms: Projects now in Zustand store
T+500ms: BUT: User already redirected to /hub
```

#### Expected Timing (FIXED)

```
T+0ms:   App loads
T+0ms:   __root.tsx renders
T+0ms:   AppInitializer returns children immediately
T+0ms:   TanStack Router matches /notes/$projectId
T+0ms:   Loader runs SYNCHRONOUSLY
T+0ms:   waitForHydration() checks state._hasHydrated → false
T+0ms:   waitForHydration() subscribes to store
T+0ms:   useEffect in AppInitializer runs
T+0ms:   hydrateProjects() starts
T+150ms: hydrateProjects() completes
T+150ms: state._hasHydrated = true
T+150ms: waitForHydration() resolves
T+150ms: Loader queries Dexie directly
T+160ms: Project found
T+160ms: Loader returns { project }
T+160ms: Component renders with project data
```

---

## Part 2: User Use Case Analysis

### 2.1 User Types

| User Type | Platform | Storage Type | IDE Access | Notes Access |
|-----------|----------|--------------|------------|--------------|
| **Returned Desktop** | Desktop | FSA | ✅ Yes | ✅ Yes |
| **Returned Mobile** | Mobile | IndexedDB | ❌ No | ✅ Yes |
| **New Desktop** | Desktop | FSA | ✅ Yes | ✅ Yes |
| **New Mobile** | Mobile | IndexedDB | ❌ No | ✅ Yes |

### 2.2 Use Case #1: Returned Desktop User - Notes

**User Journey**:
1. User opens app
2. User clicks Notes icon in sidebar
3. **Expected**: Show project picker with existing FSA projects
4. **Expected**: User selects project → Navigate to `/notes/$projectId`
5. **Expected**: NotesPage loads with project data
6. **Expected**: User can create/edit notes

**Current Behavior**:
1. User opens app
2. User clicks Notes icon in sidebar
3. ❌ **CRASHES**: "Rendered fewer hooks than expected"
4. ❌ User cannot access Notes workspace

**Root Cause**:
- `useLiveQuery` hook in `NotesWorkspaceDefault` causes hooks error
- Conditional hook usage violates React rules

**Fix Required**:
- Remove `useLiveQuery` hook
- Use custom hook or direct Dexie query
- Ensure all hooks are called at top level

---

### 2.3 Use Case #2: Returned Desktop User - IDE

**User Journey**:
1. User opens app
2. User clicks IDE icon in sidebar
3. **Expected**: Show project picker with existing FSA projects
4. **Expected**: User selects project → Navigate to `/ide/$projectId`
5. **Expected**: IDELayout loads with file tree, Monaco editor, terminal
6. **Expected**: User can edit files, run terminal

**Current Behavior**:
1. User opens app
2. User clicks IDE icon in sidebar
3. ❌ **Shows "temp project" option** (should NOT exist per ADR-033)
4. ❌ User must select folder from drive (confusing - which folder is which?)
5. ❌ User selects random folder → Navigate to `/ide/$projectId`
6. ❌ **EMPTY IDE**: File tree empty, Monaco blank, terminal loading forever
7. ❌ No files load, no errors shown

**Root Causes**:
1. ❌ **Temp project option exists** (ADR-033 D5 violation)
2. ❌ **No project list** (ADR-034 ROUTE-002 violation)
3. ❌ **FSA handle lost** (ADR-034 FSA-008 violation)
4. ❌ **Terminal not booting** (WebContainer issue)
5. ❌ **No error feedback** (silent failure)

**Fix Required**:
1. Remove temp project option
2. Show project list with project names
3. Fix FSA handle persistence and restoration
4. Fix WebContainer terminal boot
5. Add error feedback

---

### 2.4 Use Case #3: Returned Desktop User - Project Creation

**User Journey**:
1. User opens app
2. User clicks "Create Project" button
3. **Expected**: Show project creation wizard
4. **Expected**: User enters project name
5. **Expected**: User selects folder (FSA showDirectoryPicker)
6. **Expected**: User selects workspaces (Notes, IDE, Study, Knowledge)
7. **Expected**: Project created with `storageType: 'fsa'`
8. **Expected**: Navigate to selected workspace

**Current Behavior**:
1. User opens app
2. User clicks "Create Project" button
3. ❌ **Shows "browser DB" option** (should NOT exist for desktop per ADR-033)
4. ❌ User can create IndexedDB project on desktop
5. ❌ Auto-lands to IDE (but IDE doesn't work with IndexedDB)
6. ❌ User cannot use IDE (FSA required)

**Root Causes**:
1. ❌ **Browser DB option shown** (ADR-033 D1 violation)
2. ❌ **No platform check** (ADR-034 PLAT-002 violation)
3. ❌ **Wrong storage type** (desktop should be FSA only)
4. ❌ **Auto-lands to IDE** (should land to Notes or selected workspace)

**Fix Required**:
1. Remove browser DB option for desktop
2. Add platform check in project creation
3. Enforce FSA for desktop
4. Land to Notes or selected workspace

---

### 2.5 Use Case #4: New Desktop User - First Visit

**User Journey**:
1. User opens app for first time
2. **Expected**: Show welcome screen
3. **Expected**: User clicks "Create Project"
4. **Expected**: Show project creation wizard
5. **Expected**: User enters project name
6. **Expected**: User selects folder (FSA showDirectoryPicker)
7. **Expected**: User selects workspaces
8. **Expected**: Project created with `storageType: 'fsa'`
9. **Expected**: Navigate to selected workspace

**Current Behavior**:
1. User opens app for first time
2. ❌ **Shows "temp project" option** (should NOT exist)
3. ❌ User must select folder from drive (confusing)
4. ❌ User selects random folder → Navigate to `/ide/$projectId`
5. ❌ **EMPTY IDE**: File tree empty, Monaco blank
6. ❌ User gives up

**Root Causes**:
1. ❌ **Temp project option exists** (ADR-033 D5 violation)
2. ❌ **No welcome screen**
3. ❌ **No project list**
4. ❌ **FSA handle lost**
5. ❌ **No guidance**

**Fix Required**:
1. Remove temp project option
2. Add welcome screen
3. Show project creation wizard
4. Fix FSA handle persistence
5. Add user guidance

---

### 2.6 Use Case #5: New Mobile User - First Visit

**User Journey**:
1. User opens app for first time on mobile
2. **Expected**: Auto-create browser-mode project
3. **Expected**: Navigate to `/notes`
4. **Expected**: Show NotesPage with welcome note
5. **Expected**: User can create/edit notes
6. **Expected**: IDE icon hidden (mobile cannot access IDE)

**Current Behavior**:
1. User opens app for first time on mobile
2. ❌ **Shows "temp project" option** (should NOT exist)
3. ❌ User must select folder (but mobile can't access FSA)
4. ❌ User selects folder → Bounces to hub
5. ❌ User cannot access Notes
6. ❌ User gives up

**Root Causes**:
1. ❌ **Temp project option exists** (ADR-033 D5 violation)
2. ❌ **No auto-create browser-mode project** (ADR-033 D5 violation)
3. ❌ **No mobile-specific flow**
4. ❌ **Platform detection not used**

**Fix Required**:
1. Remove temp project option
2. Auto-create browser-mode project for mobile
3. Navigate to `/notes` automatically
4. Hide IDE icon on mobile

---

### 2.7 Use Case #6: Returned Mobile User - Notes

**User Journey**:
1. User opens app on mobile
2. User clicks Notes icon in sidebar
3. **Expected**: Auto-load browser-mode project
4. **Expected**: Navigate to `/notes`
5. **Expected**: Show NotesPage with existing notes
6. **Expected**: User can create/edit notes

**Current Behavior**:
1. User opens app on mobile
2. User clicks Notes icon in sidebar
3. ❌ **CRASHES**: "Rendered fewer hooks than expected"
4. ❌ User cannot access Notes workspace

**Root Cause**:
- Same as Use Case #1: `useLiveQuery` hook error

**Fix Required**:
- Same as Use Case #1

---

### 2.8 Use Case #7: Returned Mobile User - IDE Access Attempt

**User Journey**:
1. User opens app on mobile
2. User clicks IDE icon in sidebar (if shown)
3. **Expected**: Show toast "IDE requires desktop"
4. **Expected**: Redirect to `/notes`
5. **Expected**: User understands why IDE is not available

**Current Behavior**:
1. User opens app on mobile
2. ❌ **IDE icon shown** (should be hidden)
3. ❌ User clicks IDE icon
4. ❌ **Shows temp project option**
5. ❌ User selects folder → Bounces to hub
6. ❌ User confused

**Root Causes**:
1. ❌ **IDE icon not hidden** (ADR-033 D1 violation)
2. ❌ **No platform guard** (ADR-034 ROUTE-001 violation)
3. ❌ **No user feedback**

**Fix Required**:
1. Hide IDE icon on mobile
2. Add platform guard in route
3. Show toast with explanation

---

## Part 3: Infrastructure Analysis

### 3.1 DexieDB (IndexedDB) Capabilities

#### Schema Overview

| Table | Purpose | Key | Indexed Fields |
|-------|---------|-----|----------------|
| `db.projects` | Project metadata | `id` | `lastOpened`, `workspaceId` |
| `db.notes` | Note content | `id` | `projectId` |
| `db.conversations` | Chat history | `id` | `projectId`, `workspaceId` |
| `db.fsaHandles` | FSA handle storage | `projectId` | `permissionStatus`, `lastAccessedAt` |
| `db.ideState` | IDE layout/tabs | `projectId` | - |
| `db.fileSnapshots` | File tree cache | `id` | `projectId` |
| `db.fileContentCache` | File content cache | `[projectId+path]` | `projectId` |
| `db.providerConfigs` | Zustand persist | `key` | - |
| `db.terminalState` | Terminal persist | `key` | - |
| `db.workspaceState` | Workspace persist | `key` | - |

#### Hot Reactivity

**Dexie React Hooks**:
```typescript
import { useLiveQuery } from 'dexie-react-hooks';

// ❌ PROBLEM: useLiveQuery causes hooks error when used conditionally
const fsaProjects = useLiveQuery(async () => {
  if (!platform.canAccessFSA) return [];
  const allProjects = await db.projects.toArray();
  return allProjects.filter(
    (p) => p.storageType === 'fsa' && p.workspaceBindings?.notes === true
  );
}, [platform.canAccessFSA]);
```

**Issues**:
1. ❌ **Hooks Error**: `useLiveQuery` cannot be called conditionally
2. ❌ **Race Condition**: Hook runs before platform detection completes
3. ❌ **No Error Handling**: No fallback if query fails

**Expected Pattern**:
```typescript
// ✅ Use custom hook with proper error handling
function useFSAProjects() {
  const platform = getPlatformContract();

  // ✅ Always call hook (no conditional)
  const allProjects = useLiveQuery(() => db.projects.toArray(), []);

  // ✅ Filter in render (not in hook)
  const fsaProjects = useMemo(() => {
    if (!platform.canAccessFSA) return [];
    return allProjects?.filter(
      (p) => p.storageType === 'fsa' && p.workspaceBindings?.notes === true
    ) ?? [];
  }, [allProjects, platform.canAccessFSA]);

  return fsaProjects;
}
```

---

### 3.2 FSA (File System Access API) Capabilities

#### Browser Support

| Browser | Version | FSA Support | Persistent Permissions | Structured Clone |
|---------|---------|-------------|----------------------|------------------|
| Chrome | 86+ | ✅ Yes | 122+ | 129+ |
| Edge | 86+ | ✅ Yes | 122+ | 129+ |
| Opera | 72+ | ✅ Yes | 122+ | 129+ |
| Safari | 15.2+ | ⚠️ Partial | ❌ No | ❌ No |
| Firefox | ❌ No | ❌ No | ❌ No | ❌ No |

#### FSA Handle Lifecycle

**Current Implementation** (BROKEN):
```typescript
// ❌ PROBLEM: Stores handle as null intentionally
async function persistHandle(projectId: string, handle: FileSystemDirectoryHandle) {
  await db.fsaHandles.put({
    projectId,
    handleData: null, // ❌ Stores null intentionally
    permissionStatus: 'granted',
    lastAccessedAt: Date.now(),
  });
}

// ❌ PROBLEM: Calls showDirectoryPicker() (prompts user)
async function restoreHandle(projectId: string): Promise<FileSystemDirectoryHandle | null> {
  const record = await db.fsaHandles.get(projectId);
  if (!record) {
    return null;
  }

  // ❌ Prompts user again (should be silent)
  const handle = await showDirectoryPicker();
  return handle;
}
```

**Expected Implementation** (per ADR-034 D10):
```typescript
// ✅ Store actual handle when supported (Chrome 129+)
async function persistHandle(projectId: string, handle: FileSystemDirectoryHandle) {
  const supportsStructuredClone = 'structuredClone' in window;

  await db.fsaHandles.put({
    projectId,
    handleData: supportsStructuredClone ? handle : null, // ✅ Store actual handle
    permissionStatus: 'granted',
    lastAccessedAt: Date.now(),
  });
}

// ✅ Silent restore from stored handle
async function restoreHandle(projectId: string): Promise<FileSystemDirectoryHandle | null> {
  const record = await db.fsaHandles.get(projectId);
  if (!record) {
    return null;
  }

  // ✅ Use stored handle (Chrome 129+)
  if (record.handleData) {
    return record.handleData as FileSystemDirectoryHandle;
  }

  // ✅ Fallback: Prompt user only if truly unavailable
  try {
    const handle = await showDirectoryPicker();
    return handle;
  } catch (error) {
    console.error('[FSA] Failed to restore handle:', error);
    return null;
  }
}
```

---

### 3.3 Platform Detection

#### Platform Contract

```typescript
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

#### Detection Logic

```typescript
function getPlatformContract(): PlatformContract {
  const deviceType = detectDeviceType();
  const canAccessFSA = detectFSASupport();
  const canRunTerminal = detectWebContainerSupport();
  const storageType = determineStorageType(deviceType, canAccessFSA);

  const canWatchFiles = canAccessFSA;
  const canDoAgenticCoding = canAccessFSA && canRunTerminal;
  const canAccessIDE = canDoAgenticCoding;

  return {
    deviceType,
    storageType,
    canAccessFSA,
    canWatchFiles,
    canRunTerminal,
    canDoAgenticCoding,
    canAccessIDE,
  };
}
```

#### Platform Matrix

| Device | storageType | canAccessIDE | canAccessFSA | Notes Storage |
|--------|-------------|--------------|--------------|---------------|
| Desktop | fsa | ✅ true | ✅ true | FSA folder |
| Mobile | indexeddb | ❌ false | ❌ false | IndexedDB |
| Tablet | indexeddb | ❌ false | ❌ false | IndexedDB |

---

### 3.4 Project ID Management

#### ID Format Standard (per ADR-035)

| Project Type | ID Format | Example | When Created |
|--------------|-----------|---------|--------------|
| FSA Project | `proj_{uuid}` | `proj_a1b2c3d4-e5f6-7890-abcd-ef1234567890` | User picks folder |
| IndexedDB Project | `proj_{uuid}` | `proj_x1y2z3w4-...` | User creates via wizard |
| Browser Default | `proj_browser-default` | `proj_browser-default` | Mobile auto-create |
| Temp IDE | `proj_temp_{uuid}` | `proj_temp_a1b2c3d4` | Quick start (deprecated) |

**Rules**:
- ✅ ALL project IDs start with `proj_`
- ✅ NO colons (`:`) in IDs (breaks URL parsing)
- ✅ UUID v4 for uniqueness
- ✅ `proj_browser-default` is the ONLY magic ID (for mobile)

---

### 3.5 Hot Reactivity Requirements

#### Dexie React Hooks

**Supported Hooks**:
- `useLiveQuery()` - Subscribe to Dexie query
- `useLiveQuery()` with deps - Re-run when deps change

**Limitations**:
- ❌ Cannot be called conditionally
- ❌ Cannot be called inside useEffect
- ❌ Must be called at top level of component

**Best Practices**:
```typescript
// ✅ CORRECT: Always call hook at top level
function MyComponent() {
  const projects = useLiveQuery(() => db.projects.toArray(), []);

  // ✅ Filter in render (not in hook)
  const fsaProjects = useMemo(() => {
    return projects?.filter(p => p.storageType === 'fsa') ?? [];
  }, [projects]);

  return <div>{fsaProjects.map(p => <ProjectCard key={p.id} project={p} />)}</div>;
}

// ❌ WRONG: Conditional hook call
function MyComponent() {
  const [show, setShow] = useState(false);

  // ❌ Hook called conditionally
  if (show) {
    const projects = useLiveQuery(() => db.projects.toArray(), []);
  }

  return <div>...</div>;
}
```

---

## Part 4: Gap Analysis

### 4.1 Current vs Expected Behavior

| Aspect | Current | Expected | Gap |
|--------|---------|----------|-----|
| **Notes Workspace** | ❌ Crashes with hooks error | ✅ Shows project picker/desktop, auto-loads/mobile | **CRITICAL** |
| **IDE Workspace** | ❌ Empty, FSA handle lost | ✅ Shows file tree, Monaco, terminal | **CRITICAL** |
| **Project List** | ❌ No list, must select folder | ✅ Shows list of projects with names | **CRITICAL** |
| **Temp Project** | ❌ Exists (should not) | ✅ Does not exist | **CRITICAL** |
| **Browser DB Option** | ❌ Shown on desktop | ✅ Hidden on desktop | **CRITICAL** |
| **Platform Guards** | ❌ Missing in some routes | ✅ All routes have guards | **HIGH** |
| **FSA Handle Persistence** | ❌ Stores null, prompts user | ✅ Stores actual handle, silent restore | **CRITICAL** |
| **State Scoping** | ❌ Global, not per project | ✅ Scoped by [projectId+workspaceId] | **CRITICAL** |
| **Route Loading** | ❌ Race condition with hydration | ✅ Event-driven wait for hydration | **CRITICAL** |
| **Mobile IDE Access** | ❌ Shows IDE icon | ✅ Hidden, redirects to Notes | **HIGH** |
| **Error Feedback** | ❌ Silent failures | ✅ Clear error messages | **MEDIUM** |

### 4.2 ADR Compliance Status

| ADR | Decision | Status | Violations |
|-----|----------|--------|------------|
| **ADR-033** | D1: Platform Detection | ❌ NOT EXECUTED | 6 violations |
| **ADR-033** | D2: FSA Handle Persistence | ❌ NOT EXECUTED | 10 violations |
| **ADR-033** | D3: Notes Storage | ❌ NOT EXECUTED | Not tested |
| **ADR-033** | D4: Project Structure | ❌ NOT EXECUTED | Not tested |
| **ADR-033** | D5: Mobile Project Model | ❌ NOT EXECUTED | 2 violations |
| **ADR-034** | D10: FSA Handle Storage | ❌ NOT EXECUTED | 10 violations |
| **ADR-034** | D11: State Scoping | ❌ NOT EXECUTED | 12 violations |
| **ADR-034** | D12: Route Loading | ❌ NOT EXECUTED | 13 violations |
| **ADR-034** | D13: Platform Guards | ❌ NOT EXECUTED | 6 violations |
| **ADR-035** | Entity Model | ❌ NOT EXECUTED | Not tested |
| **ADR-035** | Storage Boundaries | ❌ NOT EXECUTED | Not tested |
| **ADR-035** | Platform Matrix | ❌ NOT EXECUTED | Not tested |

**Total Violations**: 31 infection points (per ADR-034)

---

## Part 5: Progressive Implementation Plan

### 5.1 Phase 0: Diagnostic Lock-In (30 min)

**Purpose**: Ensure we don't lose context during remediation

| Task | Owner | Deliverable |
|------|-------|-------------|
| Create this analysis document | Done | This document |
| Update bmm-workflow-status.yaml | Agent | Current state locked |
| Create LOOP_STATE checkpoint | Agent | Session snapshot |

**Acceptance Criteria**:
- ✅ Analysis document created
- ✅ Workflow status updated
- ✅ LOOP_STATE checkpoint created

---

### 5.2 Phase 1: Fix Hooks Error (1 hour)

**Purpose**: Fix Notes workspace crash to unblock user journey

| Task | File | Changes | Acceptance |
|------|------|---------|------------|
| Remove useLiveQuery hook | `notes.lazy.tsx` | Remove conditional hook | No hooks error |
| Create custom hook | `notes.lazy.tsx` | Add `useFSAProjects()` hook | Proper hook usage |
| Test Notes workspace | Manual | Desktop + Mobile | Notes loads without crash |

**Acceptance Criteria**:
- ✅ Notes workspace loads without hooks error
- ✅ Desktop shows project picker
- ✅ Mobile auto-loads browser-mode project
- ✅ No console errors

**Verification Steps**:
1. Open app on desktop
2. Click Notes icon
3. ✅ Should see project picker (not crash)
4. Open app on mobile
5. Click Notes icon
6. ✅ Should see NotesPage with welcome note (not crash)

---

### 5.3 Phase 2: Fix Route Loading Race Condition (2 hours)

**Purpose**: Fix loader race condition with hydration

| Task | File | Changes | Acceptance |
|------|------|---------|------------|
| Create waitForHydration() | New file | Event-driven wait | Waits for hydration |
| Update notes.$projectId loader | `notes.$projectId.lazy.tsx` | Use waitForHydration() | No race condition |
| Update ide.$projectId loader | `ide.$projectId.tsx` | Use waitForHydration() | No race condition |
| Query Dexie directly | Both loaders | Remove getProjectWithRetry() | Direct Dexie query |
| Test route loading | Manual | Desktop + Mobile | Routes load correctly |

**Acceptance Criteria**:
- ✅ Routes wait for hydration before loading
- ✅ Routes query Dexie directly (not Zustand)
- ✅ No more redirects to hub
- ✅ Projects load correctly

**Verification Steps**:
1. Open app on desktop
2. Navigate to `/notes/$projectId`
3. ✅ Should load NotesPage (not redirect to hub)
4. Navigate to `/ide/$projectId`
5. ✅ Should load IDELayout (not redirect to hub)

---

### 5.4 Phase 3: Fix FSA Handle Persistence (3 hours)

**Purpose**: Fix FSA handle storage and restoration

| Task | File | Changes | Acceptance |
|------|------|---------|------------|
| Implement Chrome 129 detection | `handle-persistence.ts` | Feature flag | Detects structured clone |
| Store actual handle | `persistHandle()` | Store handle when supported | Handle in IndexedDB |
| Implement silent restore | `restoreHandle()` | No user prompt | Silent restoration |
| Add handle to ProjectContext | `ProjectContext.tsx` | Provide handle to children | Handle available |
| Update StorageGatewayFactory | `storage-gateway-factory.ts` | Get handle from context | Factory uses context |
| Test FSA handle | Manual | Create project, refresh | Files load without prompt |

**Acceptance Criteria**:
- ✅ FSA handle stored in IndexedDB
- ✅ Handle restored silently (no prompt)
- ✅ Handle available in ProjectContext
- ✅ IDE files load without prompt

**Verification Steps**:
1. Create FSA project on desktop
2. Navigate to IDE
3. ✅ Should see file tree (not empty)
4. Refresh page
5. ✅ Should see file tree (no prompt)

---

### 5.5 Phase 4: Fix State Scoping (2 hours)

**Purpose**: Fix state to be scoped by [projectId+workspaceId]

| Task | File | Changes | Acceptance |
|------|------|---------|------------|
| Add project scope to IDE store | `useIDEStore.ts` | Hydrate current project | Scoped by projectId |
| Add project scope to workspace store | `workspace-store.ts` | Use Dexie, not localStorage | Scoped by projectId |
| Add cleanup on workspace switch | All stores | Reset/scope-change | No cross-contamination |
| Test state scoping | Manual | Switch projects/workspaces | State isolated |

**Acceptance Criteria**:
- ✅ All stores scoped by [projectId+workspaceId]
- ✅ No cross-contamination between projects
- ✅ State resets on workspace switch

**Verification Steps**:
1. Create 2 projects
2. Open IDE for project 1
3. Open file in project 1
4. Switch to project 2
5. ✅ Should not see file from project 1

---

### 5.6 Phase 5: Fix Platform Guards (1 hour)

**Purpose**: Add platform guards to all routes

| Task | File | Changes | Acceptance |
|------|------|---------|------------|
| Add guard to /ide route | `ide.tsx` | Check canAccessIDE | Mobile blocked |
| Add guard to /ide/$projectId | `ide.$projectId.tsx` | Check canAccessIDE | Mobile blocked |
| Hide IDE icon on mobile | `MainSidebar.tsx` | Conditional rendering | IDE hidden on mobile |
| Add toast message | Routes | Show explanation | User understands why |
| Test platform guards | Manual | Desktop + Mobile | Correct behavior |

**Acceptance Criteria**:
- ✅ Mobile users cannot access IDE
- ✅ IDE icon hidden on mobile
- ✅ Toast message shown on redirect
- ✅ Desktop users can access IDE

**Verification Steps**:
1. Open app on mobile
2. ✅ Should not see IDE icon
3. Try to navigate to `/ide/$projectId`
4. ✅ Should redirect to `/notes/$projectId` with toast

---

### 5.7 Phase 6: Remove Temp Project (1 hour)

**Purpose**: Remove temp project option (ADR-033 D5 violation)

| Task | File | Changes | Acceptance |
|------|------|---------|------------|
| Remove temp project option | `ide.tsx` | Delete temp project logic | No temp project |
| Remove browser DB option | Project creation | Hide on desktop | FSA only on desktop |
| Add project list | `ProjectPickerDialog` | Show existing projects | User sees project names |
| Test project selection | Manual | Desktop + Mobile | Correct behavior |

**Acceptance Criteria**:
- ✅ No temp project option
- ✅ No browser DB option on desktop
- ✅ Project list shows project names
- ✅ User can select project by name

**Verification Steps**:
1. Open app on desktop
2. Click IDE icon
3. ✅ Should see project list (not temp project)
4. Select project
5. ✅ Should navigate to IDE

---

### 5.8 Phase 7: Fix Terminal Loading (2 hours)

**Purpose**: Fix WebContainer terminal boot

| Task | File | Changes | Acceptance |
|------|------|---------|------------|
| Investigate WebContainer boot | `IDELayout.tsx` | Check initialization | Terminal boots |
| Fix WebContainer config | `IDELayout.tsx` | Correct configuration | Terminal works |
| Add error feedback | `IDELayout.tsx` | Show error message | User sees error |
| Test terminal | Manual | Desktop | Terminal works |

**Acceptance Criteria**:
- ✅ Terminal boots without loading forever
- ✅ Terminal shows prompt
- ✅ User can run commands
- ✅ Error message shown if boot fails

**Verification Steps**:
1. Open IDE on desktop
2. ✅ Should see terminal with prompt
3. Run `ls` command
4. ✅ Should see file listing

---

### 5.9 Phase 8: End-to-End Testing (2 hours)

**Purpose**: Verify all user journeys work correctly

| Test Case | Platform | Expected Result |
|-----------|----------|-----------------|
| Returned Desktop - Notes | Desktop | Show project picker, select project, NotesPage loads |
| Returned Desktop - IDE | Desktop | Show project list, select project, IDELayout loads with files |
| Returned Desktop - Project Creation | Desktop | Create FSA project, navigate to workspace |
| New Desktop - First Visit | Desktop | Show welcome, create project, navigate to workspace |
| New Mobile - First Visit | Mobile | Auto-create browser-mode, navigate to Notes |
| Returned Mobile - Notes | Mobile | Auto-load browser-mode, NotesPage loads |
| Returned Mobile - IDE Access | Mobile | IDE icon hidden, redirect to Notes with toast |

**Acceptance Criteria**:
- ✅ All test cases pass
- ✅ No console errors
- ✅ No user confusion
- ✅ Clear error messages

---

## Part 6: Acceptance Criteria

### 6.1 Phase Acceptance Criteria

Each phase must meet these criteria before proceeding:

1. **Code Quality**:
   - ✅ No TypeScript errors
   - ✅ No console warnings
   - ✅ No ESLint errors

2. **Functionality**:
   - ✅ All acceptance criteria met
   - ✅ All verification steps pass
   - ✅ No regressions

3. **Documentation**:
   - ✅ Code comments added
   - ✅ Changes documented
   - ✅ Test cases documented

4. **User Experience**:
   - ✅ Clear error messages
   - ✅ No silent failures
   - ✅ Intuitive navigation

### 6.2 Story Acceptance Criteria

Each story must meet these criteria before being marked complete:

1. **Requirements**:
   - ✅ All requirements implemented
   - ✅ All edge cases handled
   - ✅ All error cases handled

2. **Testing**:
   - ✅ Unit tests pass
   - ✅ Integration tests pass
   - ✅ Manual testing passes

3. **Documentation**:
   - ✅ Story documented
   - ✅ Changes documented
   - ✅ Test cases documented

4. **Governance**:
   - ✅ ADR compliance verified
   - ✅ Code review passed
   - ✅ User acceptance verified

---

## Part 7: Risk Assessment

### 7.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Hooks error not fixed | Low | High | Use custom hook, test thoroughly |
| Race condition persists | Medium | High | Event-driven wait, not time-based |
| FSA handle not restorable | Medium | High | Chrome 129 detection, fallback |
| State scoping breaks existing | Medium | Medium | Incremental changes, test each |
| Platform guards too strict | Low | Medium | User feedback, adjust as needed |

### 7.2 User Experience Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| User confused by project picker | Medium | Medium | Clear labels, help text |
| User cannot find project | Low | Medium | Search, filters, sorting |
| Mobile user frustrated by IDE block | Low | Low | Clear toast message |
| User loses data during migration | Low | High | Backup before migration, test thoroughly |

---

## Part 8: Success Metrics

### 8.1 Technical Metrics

| Metric | Target | Current | Gap |
|--------|--------|---------|-----|
| TypeScript errors | 0 | 0 | ✅ |
| Console warnings | 0 | Unknown | ❌ |
| ESLint errors | 0 | Unknown | ❌ |
| Route loading time | < 500ms | Unknown | ❌ |
| FSA handle restoration time | < 100ms | Unknown | ❌ |

### 8.2 User Experience Metrics

| Metric | Target | Current | Gap |
|--------|--------|---------|-----|
| Notes workspace crash rate | 0% | 100% | ❌ |
| IDE workspace empty rate | 0% | 100% | ❌ |
| Project list availability | 100% | 0% | ❌ |
| Platform guard effectiveness | 100% | 0% | ❌ |
| User confusion rate | < 5% | Unknown | ❌ |

---

## Part 9: Next Steps

### 9.1 Immediate Actions

1. **Review this document** - User must approve before proceeding
2. **Create stories** - Break down phases into user stories
3. **Assign to teams** - Team A and Team B parallel work
4. **Start Phase 1** - Fix hooks error (highest priority)

### 9.2 Questions for User

1. **Do you approve this analysis?**
2. **Should we proceed with Phase 1 (Fix hooks error)?**
3. **Should we execute all phases sequentially or in parallel?**
4. **Are there any additional requirements or constraints?**
5. **Should we create user stories for each phase?**

---

## Appendix A: File References

### A.1 Route Files

| File | Purpose | Status |
|------|---------|--------|
| `src/routes/index.tsx` | Hub homepage | ✅ Working |
| `src/routes/hub.tsx` | Hub homepage | ✅ Working |
| `src/routes/notes.lazy.tsx` | Notes workspace | ❌ Broken (hooks error) |
| `src/routes/notes.$projectId.lazy.tsx` | Notes for project | ❌ Broken (race condition) |
| `src/routes/ide.$projectId.tsx` | IDE for project | ❌ Broken (FSA handle lost) |
| `src/routes/ide.tsx` | IDE base | ❌ Broken (temp project) |

### A.2 Infrastructure Files

| File | Purpose | Status |
|------|---------|--------|
| `src/infrastructure/persistence/dexie-db.ts` | Dexie database | ✅ Working |
| `src/infrastructure/filesystem/platform-detection.ts` | Platform detection | ✅ Working |
| `src/infrastructure/filesystem/platform-contract.ts` | Platform contract | ✅ Working |
| `src/infrastructure/filesystem/handle-persistence.ts` | FSA handle storage | ❌ Broken (stores null) |
| `src/infrastructure/persistence/stores/project/index.ts` | Project store | ✅ Working |
| `src/infrastructure/persistence/stores/project/project-utils-slice.ts` | Project utils | ✅ Working |

### A.3 Component Files

| File | Purpose | Status |
|------|---------|--------|
| `src/presentation/components/common/AppInitializer.tsx` | App initialization | ✅ Working |
| `src/presentation/components/hub/ProjectPickerDialog.tsx` | Project picker | ✅ Working |
| `src/presentation/components/hub/HubHomePage.tsx` | Hub homepage | ✅ Working |

---

## Appendix B: ADR References

### B.1 ADR-033 Decisions

| Decision | Choice | Status |
|----------|--------|--------|
| D1: Platform Detection | Auto-detect, no user choice | ❌ NOT EXECUTED |
| D2: FSA Handle Persistence | Store handle in IndexedDB | ❌ NOT EXECUTED |
| D3: Notes Storage | FSA folder for desktop | ❌ NOT EXECUTED |
| D4: Project Structure | .viagent/ folder | ❌ NOT EXECUTED |
| D5: Mobile Project Model | Single default project | ❌ NOT EXECUTED |

### B.2 ADR-034 Decisions

| Decision | Choice | Status |
|----------|--------|--------|
| D10: FSA Handle Storage | Single source: db.fsaHandles | ❌ NOT EXECUTED |
| D11: State Scoping | [projectId+workspaceId] composite key | ❌ NOT EXECUTED |
| D12: Route Loading | Use loader only, not beforeLoad | ❌ NOT EXECUTED |
| D13: Platform Guards | beforeLoad for platform checks | ❌ NOT EXECUTED |

### B.3 ADR-035 Decisions

| Decision | Choice | Status |
|----------|--------|--------|
| Entity Model | Project entity, Workspace view mode | ❌ NOT EXECUTED |
| Storage Boundaries | Dexie, Zustand, FSA layers | ❌ NOT EXECUTED |
| Platform Matrix | Desktop=FSA, Mobile=IndexedDB | ❌ NOT EXECUTED |

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| **FSA** | File System Access API - Browser API for file system access |
| **DexieDB** | IndexedDB wrapper library |
| **Zustand** | React state management library |
| **Project** | Domain entity representing a user project |
| **Workspace** | View mode (Notes, IDE, Study, Knowledge) |
| **Platform Contract** | Interface defining platform capabilities |
| **Hot Reactivity** | Real-time updates when data changes |
| **Hooks Error** | React error when hooks are called conditionally |
| **Race Condition** | Timing issue where code runs before data is ready |
| **Loader** | TanStack Router data fetching function |
| **beforeLoad** | TanStack Router guard function |

---

**END OF DOCUMENT**