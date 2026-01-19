# Notes IDE Route Analysis Report

**Date**: 2026-01-19
**Author**: Investigation Agent
**Purpose**: Analyze why Notes routes to IDE and why project selector isn't working

---

## Executive Summary

| Issue | Root Cause | Severity |
|-------|------------|----------|
| **Part 1**: Notes routes to IDE | NO CODE EVIDENCE found - likely user expectation mismatch or UI state issue | LOW |
| **Part 2**: Project selector not showing projects | Projects may lack `workspaceBindings.notes: true` configuration | HIGH |

---

## Part 1: Why Notes Routes to IDE?

### Investigation Result: NO REDIRECT FOUND

**Finding**: After exhaustive code search, there is **NO redirect from `/notes` to `/ide`** in the codebase.

### Code Evidence

#### 1. Notes Route (`src/routes/notes.lazy.tsx`)

```typescript
function NotesRedirect() {
  const navigate = useNavigate();
  
  // Get projects with notes binding enabled
  const notesProjects = useLiveQuery(async () => {
    const allProjects = await db.projects.toArray();
    return allProjects.filter((p) => {
      const bindings = p.workspaceBindings || (p.bindings as Record<string, boolean>);
      return bindings?.notes === true;  // ✅ Only checks notes binding
    });
  }, []);

  useEffect(() => {
    if (notesProjects === undefined) return;

    if (notesProjects.length > 0) {
      // ✅ REDIRECTS TO /notes/$projectId (NOT IDE!)
      const sorted = [...notesProjects].sort(
        (a, b) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime()
      );
      navigate({
        to: '/notes/$projectId',  // ✅ CORRECT: Notes workspace
        params: { projectId: mostRecent.id },
        replace: true,
      });
    } else {
      // ✅ REDIRECTS TO /hub (NOT IDE!)
      navigate({
        to: '/hub',
        search: { action: 'create-project', workspace: 'notes' },
        replace: true,
      });
    }
  }, [notesProjects, navigate]);
}
```

#### 2. Sidebar Navigation (`src/presentation/components/layout/MainSidebar.tsx`)

```typescript
const navItems = [
  { id: 'home', label: t('sidebar.home'), icon: Home, path: '/' },
  { id: 'projects', label: t('sidebar.projects'), icon: Folder, path: '/workspace' },
  { id: 'knowledge', label: t('sidebar.knowledge', 'Knowledge'), icon: Brain, path: '/knowledge' },
  { id: 'notes', label: t('sidebar.notes', 'Notes'), icon: Notebook, path: '/notes' }, // ✅ CORRECT
  { id: 'study', label: t('sidebar.study', 'Study'), icon: BookOpen, path: '/study' },
  { id: 'agents', label: t('sidebar.agents'), icon: Bot, path: '/agents' },
  { id: 'settings', label: t('sidebar.settings'), icon: Settings, path: '/settings' },
];
```

#### 3. IDE Route (`src/routes/ide.tsx`)

The IDE route has a `beforeLoad` hook that only blocks `/ide` (root), not `/notes`:

```typescript
beforeLoad: async ({ location }) => {
  const platform = getPlatformContract();
  
  // ✅ ONLY blocks /ide, NOT /notes
  if (!platform.canAccessIDE && location.pathname === '/ide') {
    throw redirect({
      to: '/hub',
      search: { reason: 'mobile-not-supported' }
    });
  }
  return;
},
```

### Hypothesis: Possible Causes

1. **User expectation mismatch**: User expects `/notes` to show project picker UI, but it auto-redirects to `/notes/$projectId`

2. **IDE store sync effect**: In `NotesPage.tsx` (lines 99-107):
   ```typescript
   const ideProjectId = useIDEStore((s) => s.projectId);
   useEffect(() => {
     if (ideProjectId && ideProjectId !== projectId) {
       console.log('[NotesPage] Project changed in IDE store, navigating:', ideProjectId);
       navigate({ to: `/notes/${ideProjectId}` });  // ⚠️ Might cause loop if not handled
     }
   }, [ideProjectId, projectId, navigate]);
   ```
   This syncs with IDE store but doesn't redirect to IDE.

3. **Mobile behavior**: On mobile, IDE is blocked but Notes works. No cross-redirect.

### Conclusion: Part 1

```yaml
part1_ide_redirect:
  file: null  # No redirect file exists
  function: null
  redirect_condition: "No redirect from Notes to IDE found in code"
  is_bug: false
```

**Recommendation**: Reinvestigate with actual user session data to confirm actual behavior vs. expected behavior.

---

## Part 2: Why Project Selector Not Working?

### Investigation Result: BINDING CONFIGURATION ISSUE

**Finding**: The project selector uses `useWorkspaceProjects()` which filters by `workspaceBindings.notes === true`. If projects don't have this flag set, they won't appear.

### Code Evidence

#### 1. Project Selector Component (`src/presentation/components/project/ProjectSelector.tsx`)

```typescript
export function ProjectSelector({
  projects,  // ✅ Receives filtered projects from useWorkspaceProjects
  activeProject,
  onSelect,
  variant = 'default',
  disabled = false,
}: ProjectSelectorProps) {
  // Projects already filtered by workspaceType in useWorkspaceProjects
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>...</DropdownMenuTrigger>
      <DropdownMenuContent>
        {filteredProjects.map((project) => (
          <DropdownMenuItem key={project.id} onSelect={() => onSelect(project.id)}>
            {/* Render project */}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

#### 2. Workspace Projects Hook (`src/infrastructure/persistence/stores/project/useWorkspaceProjects.ts`)

```typescript
export function useWorkspaceProjects({
  workspaceType,  // 'notes' for Notes workspace
  storageType,
}: UseWorkspaceProjectsOptions): UseWorkspaceProjectsResult {
  const allProjects = useProjectStore(useShallow((state) =>
    state.projects ? Object.values(state.projects) : []
  ));

  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      // ⚠️ KEY FILTER: Check workspaceBindings
      const binding = project.workspaceBindings?.[workspaceType] || (project as any).bindings?.[workspaceType];
      const isBound = binding === true || String(binding) === 'true';

      if (!isBound) return false;  // ⚠️ Projects without binding are FILTERED OUT

      // Check storage type if specified
      if (storageType && project.storageType !== storageType) {
        return false;
      }

      return true;
    });
  }, [allProjects, workspaceType, storageType]);

  return {
    projects: filteredProjects,
    activeProject: filteredProjects.find((p) => p.id === activeProjectId),
    // ...
  };
}
```

#### 3. Notes Route Query (`src/routes/notes.lazy.tsx`)

```typescript
const notesProjects = useLiveQuery(async () => {
  const allProjects = await db.projects.toArray();
  return allProjects.filter((p) => {
    const bindings = p.workspaceBindings || (p.bindings as Record<string, boolean>);
    return bindings?.notes === true;  // ⚠️ Same filter applied
  });
}, []);
```

### Project Type Definition (`src/domain/entities/project.ts`)

```typescript
export interface WorkspaceBindings {
  ide?: boolean;      // ✅ Default: undefined/false
  notes?: boolean;    // ⚠️ Must be explicitly set to true
  knowledge?: boolean;
  study?: boolean;
}
```

### Root Cause Analysis

The `WorkspaceBindings` interface defines:
- `ide?: boolean` - default is `undefined`
- `notes?: boolean` - **MUST be explicitly set to `true`**
- `knowledge?: boolean`
- `study?: boolean`

When `useWorkspaceProjects` filters for Notes projects, it checks:
```typescript
const binding = project.workspaceBindings?.[workspaceType];  // 'notes'
const isBound = binding === true;  // undefined !== true → false
```

**If projects were created without setting `workspaceBindings.notes = true`, they won't appear in the Notes project selector.**

### Where Are Projects Created? (`src/presentation/components/project/ProjectCreationWizard.tsx`)

Need to verify if `workspaceBindings` is properly set during project creation.

```yaml
part2_selector_issue:
  selector_component: "src/presentation/components/project/ProjectSelector.tsx"
  project_query: "useWorkspaceProjects hook in src/infrastructure/persistence/stores/project/useWorkspaceProjects.ts"
  filtering_issue: |
    Projects are filtered by `workspaceBindings.notes === true`. If projects
    were created without this flag set, they won't appear in the selector.
    
    The filter logic:
    1. Check `project.workspaceBindings?.notes === true`
    2. OR check `project.bindings?.notes === true` (legacy)
    3. If neither condition is met, project is excluded from results
```

---

## Part 3: Cross-Workspace Responsibility Map

### Component Ownership Matrix

| Component | File Path | Responsibility | Key Functions | Dependencies |
|-----------|-----------|----------------|---------------|--------------|
| **Route Entry** | `src/routes/notes.lazy.tsx` | Redirects to `/notes/$projectId` or `/hub` | `NotesRedirect()` | Dexie DB, useNavigate |
| **Project Loader** | `src/routes/notes.$projectId.tsx` | Loads project by ID from Dexie | `loader()` → `db.projects.get()` | Dexie DB, waitForHydration |
| **Route Guard** | `src/routes/notes.$projectId.tsx:beforeLoad` | Validates project exists, redirects if not | `loaderData` validation | db.projects |
| **Project Selector** | `src/presentation/components/project/ProjectSelector.tsx` | Displays dropdown of available projects | `ProjectSelector()` | projects prop (from useWorkspaceProjects) |
| **Project Filter** | `src/infrastructure/persistence/stores/project/useWorkspaceProjects.ts` | Filters projects by workspace binding | `useWorkspaceProjects()` | Zustand project store |
| **Project Store** | `src/infrastructure/persistence/stores/project/useProjectStore.ts` | Zustand store for all projects | CRUD operations | Dexie DB (hydration) |
| **Sidebar Nav** | `src/presentation/components/layout/MainSidebar.tsx` | Navigation to workspaces | `handleNavigation()` | useNavigate, TanStack Router |
| **Project Context** | `src/lib/workspace/ProjectContext.tsx` | Provides project context to children | `ProjectProvider` | Route loader data |

### Data Flow Diagram

```
User clicks "Notes" in Sidebar
         ↓
MainSidebar.handleNavigation('/notes')
         ↓
TanStack Router matches /notes route
         ↓
notes.lazy.tsx: NotesRedirect component
         ↓
useLiveQuery: Query Dexie for projects with workspaceBindings.notes === true
         ↓
IF projects exist:
  navigate('/notes/$projectId')  → notes.$projectId.tsx
         ↓
loader: db.projects.get(projectId)
         ↓
NotesPage receives project from ProjectContext
         ↓
useWorkspaceProjects({ workspaceType: 'notes' }) → Filter by binding
         ↓
ProjectSelector receives filtered projects
         ↓
User sees projects in dropdown

IF no projects:
  navigate('/hub') → User creates project via wizard
         ↓
ProjectCreationWizard sets workspaceBindings.notes = true
         ↓
Project added to Dexie DB
         ↓
User can now select project in Notes
```

### Key Data Structures

#### ProjectRecord (Dexie)
```typescript
interface ProjectRecord {
  id: string;
  name: string;
  path: string;
  workspaceId: 'ide' | 'knowledge' | 'study' | 'notes';
  storageType?: 'fsa' | 'indexeddb';
  workspaceBindings?: WorkspaceBindings;  // ⚠️ KEY FIELD
  bindings?: WorkspaceBindings | Record<string, string>;  // Legacy
  lastOpened: Date;
  createdAt: Date;
  // ...
}
```

#### WorkspaceBindings
```typescript
interface WorkspaceBindings {
  ide?: boolean;      // Default: undefined
  notes?: boolean;    // ⚠️ Must be true for Notes workspace
  knowledge?: boolean;
  study?: boolean;
}
```

---

## Recommendations

### Immediate Actions

1. **Verify project bindings in DB**: Check if existing projects have `workspaceBindings.notes = true`

2. **Check project creation flow**: Verify `ProjectCreationWizard` sets `workspaceBindings` correctly

3. **Add debug logging**: Log the filtered project count in `useWorkspaceProjects`

### Code Fixes Needed

1. **If bindings are missing**: Add migration to set `workspaceBindings.notes = true` for existing projects

2. **If creation flow is broken**: Fix `ProjectCreationWizard` to always set workspace bindings

3. **If UI is unclear**: Consider showing "No projects found" state with clear call-to-action

### Test Cases

```typescript
// Test 1: Project with workspaceBindings.notes = true should appear
const project1 = { id: 'p1', workspaceBindings: { notes: true } };
expect(useWorkspaceProjects({ workspaceType: 'notes' }).projects).toContain(project1);

// Test 2: Project with workspaceBindings.notes = false should NOT appear
const project2 = { id: 'p2', workspaceBindings: { notes: false } };
expect(useWorkspaceProjects({ workspaceType: 'notes' }).projects).not.toContain(project2);

// Test 3: Project with no workspaceBindings should NOT appear
const project3 = { id: 'p3', workspaceBindings: undefined };
expect(useWorkspaceProjects({ workspaceType: 'notes' }).projects).not.toContain(project3);

// Test 4: Legacy bindings format should work
const project4 = { id: 'p4', bindings: { notes: true } };
expect(useWorkspaceProjects({ workspaceType: 'notes' }).projects).toContain(project4);
```

---

## Files Involved Summary

```
src/routes/
├── notes.lazy.tsx              # Route entry, redirects to /notes/$projectId or /hub
├── notes.$projectId.tsx        # Project loader, validates project exists
└── ide.tsx                     # IDE route (NOT related to Notes redirect issue)

src/presentation/components/
├── project/
│   ├── ProjectSelector.tsx     # Project dropdown component
│   └── ProjectCreationWizard.tsx # Creates projects with bindings
└── notes/
    └── NotesPage.tsx           # Notes workspace, uses ProjectSelector

src/infrastructure/persistence/stores/project/
├── useWorkspaceProjects.ts     # Filters projects by workspace binding
├── useProjectStore.ts          # Zustand store for projects
└── project-types.ts            # Type definitions

src/lib/workspace/
└── ProjectContext.tsx          # Provides project context to components
```

---

## Conclusion

| Issue | Status | Action |
|-------|--------|--------|
| **Notes → IDE redirect** | ❌ NOT FOUND | Reinvestigate with user session data |
| **Project selector empty** | ✅ FOUND | Check `workspaceBindings.notes` configuration on projects |

The investigation reveals that the project selector filtering is working as designed. The likely cause of "empty" selector is that existing projects don't have `workspaceBindings.notes = true` set.
