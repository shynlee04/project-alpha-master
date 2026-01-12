# Notes Workspace Routing Mapping

**Document ID**: `NOTES-ROUTING-MAPPING-2026-01-15`  
**Created**: 2026-01-15  
**Purpose**: Test routing scenarios for notes workspace entry points

---

## Overview

This document maps the three primary entry scenarios for entering the Notes workspace:

| Scenario | URL Pattern | Route File | Behavior |
|----------|-------------|------------|----------|
| **A: Without Project** | `/notes` | `notes.lazy.tsx` | Browser-mode, shows all notes |
| **B: With Project** | `/notes/:projectId` | `notes.$projectId.lazy.tsx` | Project-specific notes |
| **C: Project Creation** | `/projects` → Create → Navigate | `ProjectsPage.tsx` → `ProjectCreationWizard.tsx` | Creates project, redirects to notes |

---

## Scenario A: Without Project (Browser Mode)

### URL Pattern
```
/notes
```

### Route Handler
**File**: `src/routes/notes.lazy.tsx`  
**Component**: `NotesWorkspaceDefault()` (171 lines)

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCENARIO A: /notes                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   User navigates to /notes                                      │
│           │                                                     │
│           ▼                                                     │
│   ┌─────────────────────────┐                                   │
│   │ Route: notes.lazy.tsx  │                                   │
│   │ createLazyFileRoute    │                                   │
│   │ ('/notes')             │                                   │
│   └─────────────────────────┘                                   │
│           │                                                     │
│           ▼                                                     │
│   ┌─────────────────────────────────────────┐                  │
│   │ NotesWorkspaceDefault() Component       │                  │
│   │ • Hardcoded ID: 'notes:browser-mode'    │                  │
│   │ • Uses IndexedDB storage                │                  │
│   │ • Special flags: isTemp=true,           │                  │
│   │   isBrowserMode=true, autoCreated=true  │                  │
│   └─────────────────────────────────────────┘                  │
│           │                                                     │
│           ▼                                                     │
│   ┌─────────────────────────────────────────┐                  │
│   │ getProject('notes:browser-mode')        │                  │
│   │ • Async check via project-store.ts      │                  │
│   │ • Returns project or null               │                  │
│   └─────────────────────────────────────────┘                  │
│           │                                                     │
│           ├─────────────────────────────┐                      │
│           │                             │                      │
│           ▼                             ▼                      │
│   ┌─────────────────┐         ┌─────────────────────────┐      │
│   │ Project EXISTS  │         │ Project DOESN'T EXIST   │      │
│   │ (Load it)       │         │ (Create browser-mode)   │      │
│   └─────────────────┘         └─────────────────────────┘      │
│           │                             │                      │
│           ▼                             ▼                      │
│   ┌─────────────────────────────────────────┐                  │
│   │ ProjectRegistry.register()              │                  │
│   │ • Registers: notes:browser-mode         │                  │
│   │ • Workspace type: 'notes'               │                  │
│   │ • Conflict detection enabled            │                  │
│   └─────────────────────────────────────────┘                  │
│           │                                                     │
│           ▼                                                     │
│   ┌─────────────────────────────────────────┐                  │
│   │ ProjectProvider wraps NotesPage         │                  │
│   │ • project={project}                     │                  │
│   │ • workspace="notes"                     │                  │
│   └─────────────────────────────────────────┘                  │
│           │                                                     │
│           ▼                                                     │
│   ┌─────────────────────────────────────────┐                  │
│   │ NotesPage (877 lines)                   │                  │
│   │ • Loads all notes (loadAllNotes)        │                  │
│   │ • Shows note sidebar with search        │                  │
│   │ • Default note: 'Welcome to Notes'      │                  │
│   │ • IndexedDB storage (no FSA)            │                  │
│   │ • File sync: disabled (autoSync=false)  │                  │
│   └─────────────────────────────────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Data Structures

```typescript
// Browser-mode project configuration
const browserModeProjectId = 'notes:browser-mode';

const browserModeProject = {
  id: 'notes:browser-mode',
  name: 'Browser Mode',
  folderPath: 'Notes',
  storageType: 'indexeddb',  // Always IndexedDB for browser mode
  createdAt: new Date(),
  lastOpened: new Date(),
  autoSync: false,           // No file sync in browser mode
  bindings: { notes: true, knowledge: true },
  tags: [],
  isTemp: true,              // Temporary project
  isBrowserMode: true,       // Special browser mode flag
  autoCreated: true,         // Auto-created on first visit
};
```

### State Changes

| Store | Key | Value |
|-------|-----|-------|
| `useIDEStore` | `projectId` | `notes:browser-mode` |
| `ProjectRegistry` | `browserModeProjectId` | Registered with workspace='notes' |
| `useNoteStore` | `notes` | All notes from all projects loaded |
| `useNoteStore` | `currentProjectId` | `null` (browser mode) |

### Component Tree

```
NotesWorkspaceDefault
├── useState<Project | null>
├── useEffect (getProject)
│   ├── getProject('notes:browser-mode')
│   └── ProjectRegistry.register()
├── useEffect (IDE store)
│   └── useIDEStore.setProjectId()
└── ProjectProvider (project={browserModeProject})
    └── NotesPage
        ├── MainLayout
        │   └── ResizablePanelGroup
        │       ├── NoteSidebar (projectSelector hidden in browser mode)
        │       ├── NoteEditor (BlockNote)
        │       └── UnifiedChatPanel
        └── SyncStatusPanel
```

### Critical Code Paths

| File | Line | Function |
|------|------|----------|
| `notes.lazy.tsx` | 44 | `browserModeProjectId = 'notes:browser-mode'` |
| `notes.lazy.tsx` | 53 | `getProject(browserModeProjectId)` |
| `notes.lazy.tsx` | 59-72 | Browser-mode project creation |
| `notes.lazy.tsx` | 77-118 | Auto-create "Welcome to Notes" default note |
| `notes.lazy.tsx` | 128-145 | ProjectRegistry registration |
| `notes.lazy.tsx` | 148-152 | IDE store projectId set |
| `NotesPage.tsx` | 228-235 | Browser mode detection → `loadAllNotes()` |

---

## Scenario B: With Specific Project

### URL Pattern
```
/notes/:projectId
```

### Route Handler
**File**: `src/routes/notes.$projectId.lazy.tsx`  
**Component**: `NotesWorkspace()` (89 lines)

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                 SCENARIO B: /notes/:projectId                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   User navigates to /notes/my-project-123                       │
│           │                                                     │
│           ▼                                                     │
│   ┌─────────────────────────────┐                               │
│   │ Route: notes.$projectId.tsx │                               │
│   │ createLazyFileRoute         │                               │
│   │ ('/notes/$projectId')       │                               │
│   └─────────────────────────────┘                               │
│           │                                                     │
│           ▼                                                     │
│   ┌─────────────────────────────────────────┐                  │
│   │ NotesWorkspace() Component               │                  │
│   │ • Extracts projectId from URL params     │                  │
│   │ • Async loads project via getProject()   │                  │
│   │ • Shows loading state                    │                  │
│   │ • Shows error if project not found       │                  │
│   └─────────────────────────────────────────┘                  │
│           │                                                     │
│           ▼                                                     │
│   ┌─────────────────────────────────────────┐                  │
│   │ useEffect: getProject(_projectId)       │                  │
│   │ • Async fetch from project-store.ts     │                  │
│   │ • Sets isLoading=false after fetch      │                  │
│   └─────────────────────────────────────────┘                  │
│           │                                                     │
│           ├─────────────────────────────┐                      │
│           │                             │                      │
│           ▼                             ▼                      │
│   ┌─────────────────┐         ┌─────────────────────────┐      │
│   │ Project FOUND   │         │ Project NOT FOUND       │      │
│   │ (Continue)      │         │ (Show error)            │      │
│   └─────────────────┘         └─────────────────────────┘      │
│           │                             │                      │
│           ▼                             ▼                      │
│   ┌─────────────────────────────────────────┐                  │
│   │ useEffect: setProjectId in IDE store    │                  │
│   │ useIDEStore.setProjectId(_projectId)    │                  │
│   └─────────────────────────────────────────┘                  │
│           │                                                     │
│           ▼                                                     │
│   ┌─────────────────────────────────────────┐                  │
│   │ ProjectProvider wraps NotesPage         │                  │
│   │ • project={project}                     │                  │
│   │ • workspace="notes"                     │                  │
│   └─────────────────────────────────────────┘                  │
│           │                                                     │
│           ▼                                                     │
│   ┌─────────────────────────────────────────┐                  │
│   │ NotesPage (877 lines)                   │                  │
│   │ • Loads project-specific notes          │                  │
│   │ • File sync enabled based on storage    │                  │
│   │ • Project selector shows active project │                  │
│   └─────────────────────────────────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Data Structures

```typescript
// URL parameter extraction
const { projectId: _projectId } = Route.useParams();

// Project loading state
const [project, setProject] = useState<Project | null>(null);
const [isLoading, setIsLoading] = useState(true);
```

### State Changes

| Store | Key | Value |
|-------|-----|-------|
| `useIDEStore` | `projectId` | `_projectId` (from URL) |
| `useNoteStore` | `currentProjectId` | `_projectId` |
| `useNoteStore` | `notes` | Project-specific notes via `loadNotes(projectId)` |

### Component Tree

```
NotesWorkspace
├── useState<Project | null>
├── useState<boolean>(isLoading)
├── useEffect (getProject)
│   └── getProject(_projectId)
│       └── setProject(p)
├── useEffect (IDE store)
│   └── useIDEStore.setProjectId(_projectId)
└── Conditional Rendering
    ├── Loading State (isLoading)
    ├── Error State (!project)
    └── ProjectProvider (project={project})
        └── NotesPage
            ├── ProjectSelector (visible, shows active project)
            ├── NoteSidebar (filtered by project)
            ├── NoteEditor
            └── UnifiedChatPanel
```

### Critical Code Paths

| File | Line | Function |
|------|------|----------|
| `notes.$projectId.lazy.tsx` | 39 | `Route.useParams()` extraction |
| `notes.$projectId.lazy.tsx` | 45 | `getProject(_projectId)` |
| `notes.$projectId.lazy.tsx` | 54 | `useIDEStore.setProjectId(_projectId)` |
| `NotesPage.tsx` | 231-234 | `loadNotes(projectId)` for project mode |
| `NotesPage.tsx` | 110-116 | Project selector → `navigate({ to: /notes/${newProjectId} })` |

---

## Scenario C: With Project Creation

### URL Pattern
```
/projects → Create Project → /notes/:projectId
```

### Route Handler
**Files**: 
- `src/routes/projects.tsx` → `ProjectsPage`
- `src/presentation/components/project/ProjectCreationWizard.tsx`

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│              SCENARIO C: Project Creation Flow                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   User navigates to /projects                                   │
│           │                                                     │
│           ▼                                                     │
│   ┌─────────────────────────┐                                   │
│   │ Route: projects.tsx    │                                   │
│   │ createFileRoute        │                                   │
│   │ ('/projects')          │                                   │
│   └─────────────────────────┘                                   │
│           │                                                     │
│           ▼                                                     │
│   ┌─────────────────────────────────────────┐                  │
│   │ ProjectsPage Component                   │                  │
│   │ • Lists all projects                     │                  │
│   │ • Shows "Create Project" button          │                  │
│   │ • Opens ProjectCreationWizard on click   │                  │
│   └─────────────────────────────────────────┘                  │
│           │                                                     │
│           ▼                                                     │
│   ┌─────────────────────────────────────────┐                  │
│   │ ProjectCreationWizard (Dialog/Modal)    │                  │
│   │ Steps:                                   │                  │
│   │ 1. Project Name & Description            │                  │
│   │ 2. Storage Type (FSA vs IndexedDB)       │                  │
│   │ 3. Workspace Bindings                    │                  │
│   │ 4. Review & Confirm                      │                  │
│   └─────────────────────────────────────────┘                  │
│           │                                                     │
│           ▼                                                     │
│   ┌─────────────────────────────────────────┐                  │
│   │ handleCreate()                           │                  │
│   │ • Validates form data                    │                  │
│   │ • Calls createProject() from store       │                  │
│   │ • Returns projectId                      │                  │
│   └─────────────────────────────────────────┘                  │
│           │                                                     │
│           ▼                                                     │
│   ┌─────────────────────────────────────────┐                  │
│   │ onProjectCreated Callback                │                  │
│   │ • navigate({ to: /notes/$projectId })    │                  │
│   │ • Opens notes workspace with new project │                  │
│   └─────────────────────────────────────────┘                  │
│           │                                                     │
│           ▼                                                     │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ REDIRECT: /notes/new-project-id                           │  │
│   │ (Triggers Scenario B flow)                                │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Data Structures

```typescript
// ProjectCreationWizard form state
interface ProjectInput {
  name: string;
  description?: string;
  storageType: 'fsa' | 'indexeddb';
  folderPath?: string;  // For FSA
  bindings: {
    notes: boolean;
    knowledge: boolean;
    study: boolean;
    ide: boolean;
  };
}

// createProject from Zustand store
const createProject = useProjectStore((s) => s.createProject);

// handleCreate callback
const handleCreate = useCallback(async () => {
  const projectId = createProject({
    name: formData.name,
    storageType: formData.storageType,
    folderPath: formData.storageType === 'fsa' ? formData.folderPath : undefined,
    bindings: formData.bindings,
  });
  onProjectCreated?.(projectId);
  navigate({ to: `/notes/${projectId}` });
}, [formData, createProject, navigate]);
```

### State Changes During Creation

| Phase | Store | Change |
|-------|-------|--------|
| Form Submit | `useProjectStore` | `createProject(input)` called |
| Creation | Dexie DB | Project saved to `via-gent-projects` table |
| Redirect | React Router | Navigate to `/notes/:projectId` |
| Notes Load | `NotesPage` | Triggers Scenario B flow |

### Project Configuration After Creation

```typescript
// Typical project created via wizard
const newProject = {
  id: generateProjectId(),  // UUID
  name: formData.name,
  folderPath: formData.folderPath || formData.name,
  storageType: formData.storageType,  // 'fsa' or 'indexeddb'
  createdAt: new Date(),
  lastOpened: new Date(),
  autoSync: true,           // File sync enabled for FSA projects
  bindings: formData.bindings,
  tags: [],
  isTemp: false,
  isBrowserMode: false,
  autoCreated: false,
};
```

### Critical Code Paths

| File | Line | Function |
|------|------|----------|
| `ProjectsPage.tsx` | 143 | `handleCreateProject()` opens wizard |
| `ProjectCreationWizard.tsx` | 155 | `createProject` from store |
| `ProjectCreationWizard.tsx` | 274 | `handleCreate()` callback |
| `ProjectCreationWizard.tsx` | 298 | `createProject(projectInput)` |
| `ProjectCreationWizard.tsx` | 313 | `navigate({ to: /notes/${projectId} })` |

---

## Routing Decision Matrix

### Entry Condition → Route → Behavior

| User Action | Current URL | Next URL | Route Matched | Result |
|-------------|-------------|----------|---------------|--------|
| Click "Notes" nav | Any | `/notes` | `notes.lazy.tsx` | Browser mode |
| Click "Notes" from project | `/projects` | `/notes/my-proj` | `notes.$projectId.lazy.tsx` | Project mode |
| Open direct URL | - | `/notes/my-proj` | `notes.$projectId.lazy.tsx` | Project mode |
| Create project then click | `/projects` → Create | `/notes/new-proj` | `notes.$projectId.lazy.tsx` | Project mode |

### TanStack Router Priority

```yaml
# Routes are matched by specificity
routes:
  - pattern: "/notes/:projectId"  # More specific, matches first
    file: "notes.$projectId.lazy.tsx"
    
  - pattern: "/notes"              # Less specific, fallback
    file: "notes.lazy.tsx"
```

---

## State Synchronization Across Routes

### IDE Store (`useIDEStore`)

```typescript
// Single source of truth for projectId across workspaces
interface IDEState {
  projectId: string | null;
  setProjectId: (id: string) => void;
}

// Updated by:
useIDEStore.getState().setProjectId(projectId);

// Read by:
useIDEStore((s) => s.projectId);
```

### Cross-Workspace Reactivity

```typescript
// When IDE store projectId changes, NotesPage reacts
const ideProjectId = useIDEStore((s) => s.projectId);

useEffect(() => {
  if (ideProjectId && ideProjectId !== projectId) {
    // Navigate to same project in notes workspace
    navigate({ to: `/notes/${ideProjectId}` });
  }
}, [ideProjectId, projectId, navigate]);
```

---

## Storage Type Determination

### By Route/Scenario

| Scenario | Storage Type | Reason |
|----------|--------------|--------|
| `/notes` (Browser mode) | `indexeddb` | No file system access in browser-only mode |
| `/notes/:projectId` | Project-defined | Can be `fsa` (desktop) or `indexeddb` (browser) |
| Project creation | User-selected | User chooses via ProjectCreationWizard |

### Storage Type Logic

```typescript
// In NotesPage.tsx
const storageType = project?.storageType ?? 'indexeddb';

// In ProjectCreationWizard.tsx
const storageType = formData.storageType;  // User selection
```

---

## Known Issues & Edge Cases

### Issue 1: Project Not Found
**Scenario**: User navigates to `/notes/non-existent-project`  
**Current Behavior**: Shows "Project not found: non-existent-project"  
**Expected**: Should redirect to `/notes` or show create option

### Issue 2: Browser Mode vs Project Mode Confusion
**Scenario**: User in browser mode (`/notes`) clicks project selector  
**Current Behavior**: Navigates to `/notes/:projectId`  
**Expected**: Clear visual distinction between modes

### Issue 3: Cross-Workspace Sync Delays
**Scenario**: Project changes in IDE, Notes doesn't immediately follow  
**Current Behavior**: Uses `useEffect` with navigate  
**Expected**: Could use more immediate state sync

---

## Test Checklist

### Scenario A: Browser Mode
- [ ] Navigate to `/notes`
- [ ] Browser-mode project `notes:browser-mode` auto-creates
- [ ] "Welcome to Notes" default note appears
- [ ] All notes from all projects visible
- [ ] Project selector hidden or shows "Browser Mode"
- [ ] File sync disabled
- [ ] ProjectRegistry registers the browser-mode project

### Scenario B: Project Mode
- [ ] Navigate to `/notes/:projectId`
- [ ] Loading state shows
- [ ] Project loads from Dexie
- [ ] Project-specific notes load
- [ ] IDE store projectId updates
- [ ] Project selector shows active project
- [ ] File sync enabled based on storage type

### Scenario C: Project Creation
- [ ] Navigate to `/projects`
- [ ] Click "Create Project"
- [ ] Fill wizard form
- [ ] Submit creates project
- [ ] Auto-redirect to `/notes/:newProjectId`
- [ ] New project loads correctly
- [ ] File sync works based on storage selection

---

## Related Files

| File | Purpose |
|------|---------|
| `src/routes/notes.lazy.tsx` | Browser mode route |
| `src/routes/notes.$projectId.lazy.tsx` | Project-specific route |
| `src/routes/projects.tsx` | Project list/creation |
| `src/presentation/components/project/ProjectCreationWizard.tsx` | Project creation wizard |
| `src/presentation/components/notes/NotesPage.tsx` | Main notes page |
| `src/lib/workspace/project-store.ts` | Project CRUD facade |
| `src/lib/workspace/project-store/project-store-refactored.ts` | Zustand store |
| `src/infrastructure/persistence/stores/ide/index.ts` | IDE store |
| `src/domain/services/ProjectRegistry.ts` | Project conflict detection |

---

*Document generated for routing verification and testing*
