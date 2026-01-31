# Project Selector Components Analysis

**Date**: 2026-01-08
**Author**: Claude Code (File Search Specialist)
**Scope**: All project selector components and their data sources

---

## 1. Summary of Findings

### Critical Issues Identified

| Issue | Severity | Description |
|-------|----------|-------------|
| **Duplicate Data Sources** | CRITICAL | Hub uses `useLiveQuery` (Dexie) while workspace pages use `useProjectStore` (Zustand) |
| **Race Condition Risk** | HIGH | Store hydration may not complete before component renders |
| **Selector vs Store Write Conflict** | HIGH | `ProjectSelector` reads from store but also triggers navigation |
| **Auto-Select Logic Conflict** | MEDIUM | Multiple selectors may attempt auto-selection, causing unpredictable behavior |

### Data Flow Overview

```
Dexie IndexedDB (Source of Truth)
         │
         ├──────────────────────────────────────────────┐
         │                                              │
         ▼                                              ▼
   useLiveQuery                                    useProjectStore
   (HubHomePage,                                    (Workspace Pages)
    ProjectPickerDialog,                            useWorkspaceProjects
    ProjectsPage)
         │                                              │
         └──────────────────────────────────────────────┘
                              │
                              ▼
                    Potential Data Inconsistency
```

---

## 2. Component Table

### 2.1 Project Selector Components

| Component | Location | Data Source | On Select Action | Auto-Select Logic |
|-----------|----------|-------------|------------------|-------------------|
| **ProjectSelector** | `src/presentation/components/project/ProjectSelector.tsx` | Props (`projects[]`, `activeProject`) | `onSelect(projectId)` callback | None (controlled component) |
| **MobileProjectSelector** | `src/presentation/components/hub/MobileProjectSelector.tsx` | Hardcoded `DEMO_TEMPLATES` | `navigate({ to: '/ide', search: { demo: template.id } })` | None (demo mode only) |
| **ProjectPickerDialog** | `src/presentation/components/hub/ProjectPickerDialog.tsx` | `useLiveQuery(() => db.projects.toArray())` | `window.location.href = /${workspace}/${project.id}` + `updateLastOpened()` | None |
| **WorkspaceBindingDialog** | `src/presentation/components/hub/WorkspaceBindingDialog.tsx` | Props (`project`) | `onConfirm(bindings, initialWorkspace)` callback | None |

### 2.2 Components Using Project Selector

| Component | Location | Selector Used | Data Source for Selector | Selection Handler |
|-----------|----------|---------------|--------------------------|-------------------|
| **KnowledgePage** | `src/presentation/components/knowledge/KnowledgePage.tsx` | `ProjectSelector` | `useWorkspaceProjects({ workspaceType: 'knowledge' })` | `navigate({ to: '/knowledge/${newProjectId}' })` |
| **NotesPage** | `src/presentation/components/notes/NotesPage.tsx` | `ProjectSelector` | `useWorkspaceProjects({ workspaceType: 'notes' })` | `navigate({ to: '/notes/${newProjectId}' })` |
| **StudyPage** | `src/presentation/components/study/StudyPage.tsx` | `ProjectSelector` | `useWorkspaceProjects({ workspaceType: 'study' })` | `navigate({ to: '/study/${newProjectId}' })` |

### 2.3 Hub Components with Project Selection

| Component | Location | Data Source | On Select Action |
|-----------|----------|-------------|------------------|
| **HubHomePage** | `src/presentation/components/hub/HubHomePage.tsx` | `useLiveQuery(() => db.projects.toArray())` | `navigate({ to: '/${workspace}/$projectId' })` |
| **RecentProjectsSection** | `src/presentation/components/hub/RecentProjectsSection.tsx` | Props (`recentProjects[]`) | `onOpenProject(projectId)` callback |
| **ProjectsPage** | `src/presentation/components/project/ProjectsPage.tsx` | `useLiveQuery(() => db.projects.toArray())` | `navigate({ to: '/${initialWorkspace}/$projectId' })` |

---

## 3. Data Source Mapping

### 3.1 Data Sources in Use

| Source | Technology | Components Using | Persistence |
|--------|------------|------------------|-------------|
| **Dexie IndexedDB** | `useLiveQuery` | `HubHomePage`, `ProjectPickerDialog`, `ProjectsPage` | Yes (direct) |
| **Zustand Store** | `useProjectStore` | `useWorkspaceProjects`, workspace pages | In-memory cache only |
| **Props** | React Props | `ProjectSelector`, `WorkspaceBindingDialog` | Parent-controlled |

### 3.2 Data Flow Diagram

```
Dexie IndexedDB (db.projects table)
         │
         │  useLiveQuery (real-time reactive)
         ▼
┌─────────────────────┐
│   HubHomePage       │  ← Line 64: const projects = useLiveQuery(...)
│   ProjectPickerDialog│ ← Line 127: const allProjectsFromDexie = useLiveQuery(...)
│   ProjectsPage      │  ← Line 89: const projects = useLiveQuery(...)
└─────────────────────┘
         │
         │  Manual sync (inconsistent)
         ▼
┌─────────────────────┐
│  useProjectStore    │  ← In-memory Zustand store
│  (NOT persisted!)   │  ← See FIX-2026-01-06 comment at line 49-52
└─────────────────────┘
         │
         │  useWorkspaceProjects hook
         ▼
┌─────────────────────┐
│  KnowledgePage      │  ← Line 67: useWorkspaceProjects({ workspaceType: 'knowledge' })
│  NotesPage          │  ← Line 68: useWorkspaceProjects({ workspaceType: 'notes' })
│  StudyPage          │  ← Line 48: useWorkspaceProjects({ workspaceType: 'study' })
└─────────────────────┘
         │
         │  Props passed to ProjectSelector
         ▼
┌─────────────────────┐
│  ProjectSelector    │  ← Line 67-68: projects, activeProject from useWorkspaceProjects
└─────────────────────┘
```

### 3.3 Persistence Flow

```
Project Creation (HubHomePage)
    │
    ├──► useProjectStore.createProject() → Zustand state
    │                                    ↓
    │                            db.projects.put() → Dexie (async)
    │
    └──► useProjectStore.updateLastOpened() → Zustand state
                                           ↓
                                   db.projects.put() → Dexie (async)

Project Read (Workspace Pages)
    │
    ├──► useWorkspaceProjects()
    │         │
    │         ├──► useProjectStore() → In-memory Zustand
    │         │         │
    │         │         └──► May be empty if hydration not complete!
    │         │
    │         └──► Filter by workspace binding
    │
    └──► ProjectSelector receives filtered projects as props
```

---

## 4. Risk Assessment

### 4.1 Critical Risks

| Risk ID | Description | Likelihood | Impact | Mitigation |
|---------|-------------|------------|--------|------------|
| **CRIT-001** | Data inconsistency between Hub and workspace pages | HIGH | HIGH | Hub reads from Dexie directly; workspaces read from Zustand cache that may be stale or empty |
| **CRIT-002** | Store not hydrated before component render | MEDIUM | HIGH | `_hasHydrated` flag exists but may not prevent initial empty state |
| **CRIT-003** | Race condition between Dexie and Zustand writes | MEDIUM | HIGH | Both write to Dexie asynchronously; no coordination mechanism |

### 4.2 Data Source Conflict Matrix

| Component | Reads From | Writes To | Conflict? |
|-----------|------------|-----------|-----------|
| `HubHomePage` | Dexie (useLiveQuery) | N/A | No |
| `ProjectPickerDialog` | Dexie (useLiveQuery) | N/A | No |
| `ProjectsPage` | Dexie (useLiveQuery) | Dexie (direct) | No |
| `useProjectStore` | N/A | Dexie (via CRUD slice) | No |
| `useWorkspaceProjects` | Zustand store | N/A | **YES** - May read stale data |
| `KnowledgePage`/`NotesPage`/`StudyPage` | Props from useWorkspaceProjects | N/A | **YES** - Indirect read from stale store |

### 4.3 Auto-Select Logic Analysis

| Component | Auto-Select Logic | Conflict Potential |
|-----------|-------------------|-------------------|
| `HubHomePage.navigateToWorkspace()` | Single project → navigate directly | LOW - Only triggers on single project |
| `ProjectPickerDialog` | None | None |
| `useWorkspaceProjects` | Filters to active project | None - Read-only filtering |
| `ProjectSelector` | Sort active project first (line 54-57) | LOW - Visual only |

---

## 5. Recommendations

### 5.1 Immediate Fixes

| Priority | Recommendation | Effort | Files to Modify |
|----------|----------------|--------|-----------------|
| P0 | Standardize all project reads to use `useLiveQuery` (Dexie) | 2h | `useWorkspaceProjects.ts`, workspace pages |
| P0 | Remove or properly implement Zustand persistence | 1h | `useProjectStore.ts` |
| P1 | Add hydration guard to prevent empty state | 30m | Workspace pages |
| P1 | Create unified project data hook | 2h | New: `useProjects.ts` |

### 5.2 Architecture Recommendations

```
Recommended Pattern:
┌─────────────────────────────────────────┐
│  Dexie IndexedDB (Source of Truth)      │
└────────────────┬────────────────────────┘
                 │
                 │ useLiveQuery (reactive)
                 ▼
┌─────────────────────────────────────────┐
│  Custom Hook: useProjects()             │
│  - Returns all projects                 │
│  - Real-time reactive                   │
│  - Memoized filtering                   │
└────────────────┬────────────────────────┘
                 │
                 ├──────────────────────────────────────┐
                 │                                      │
                 ▼                                      ▼
┌─────────────────────────────┐  ┌─────────────────────────────┐
│  ProjectSelector (props)    │  │  ProjectList (props)        │
│  - Controlled component     │  │  - List view                │
│  - Handles selection        │  │  - Handles clicks           │
└─────────────────────────────┘  └─────────────────────────────┘
```

### 5.3 Data Flow Improvements

1. **Single Source of Truth**: Use `useLiveQuery` everywhere for real-time consistency
2. **Remove Zustand Persistence**: The comment at `useProjectStore.ts:49-52` indicates this was intentional - Zustand is now a cache only
3. **Add Sync Layer**: Implement proper sync between Dexie reads and Zustand writes
4. **Guard Against Empty State**: Check `_hasHydrated` before rendering selectors

### 5.4 Code Changes Required

#### 5.4.1 Refactor `useWorkspaceProjects.ts`

```typescript
// BEFORE (uses Zustand store)
const allProjects = useProjectStore((state) =>
  state.projects ? Object.values(state.projects) : []
);

// AFTER (use Dexie directly)
const allProjects = useLiveQuery(() => db.projects.toArray(), []);
```

#### 5.4.2 Add Hydration Guard to Workspace Pages

```typescript
// In KnowledgePage, NotesPage, StudyPage
const isLoading = !hasHydrated || projects === undefined;

if (isLoading) {
  return <LoadingSkeleton />;
}
```

#### 5.4.3 Create Unified Project Hook

```typescript
// New file: src/hooks/useProjects.ts
export function useProjects() {
  return useLiveQuery(() => db.projects.toArray(), []);
}

export function useProjectsByWorkspace(workspaceType: keyof WorkspaceBindings) {
  const projects = useProjects();
  return useMemo(() => {
    if (!projects) return [];
    return projects.filter(p => 
      p.bindings?.[workspaceType] === true || String(p.bindings?.[workspaceType]) === 'true'
    );
  }, [projects, workspaceType]);
}
```

---

## 6. Files Referenced

| File | description |
|------|---------|
| `src/presentation/components/project/ProjectSelector.tsx` | Main project selector dropdown |
| `src/presentation/components/hub/MobileProjectSelector.tsx` | Mobile demo selector |
| `src/presentation/components/hub/ProjectPickerDialog.tsx` | Dialog for project selection |
| `src/presentation/components/hub/WorkspaceBindingDialog.tsx` | Workspace binding configuration |
| `src/presentation/components/hub/HubHomePage.tsx` | Hub home page with project lists |
| `src/presentation/components/hub/RecentProjectsSection.tsx` | Recent projects list |
| `src/presentation/components/project/ProjectsPage.tsx` | Full projects management page |
| `src/presentation/components/knowledge/KnowledgePage.tsx` | Knowledge workspace with selector |
| `src/presentation/components/notes/NotesPage.tsx` | Notes workspace with selector |
| `src/presentation/components/study/StudyPage.tsx` | Study workspace with selector |
| `src/infrastructure/persistence/stores/project/useProjectStore.ts` | Zustand project store |
| `src/infrastructure/persistence/stores/project/useWorkspaceProjects.ts` | Workspace-filtered project hook |
| `src/infrastructure/persistence/stores/project/project-crud-slice.ts` | Project CRUD operations |
| `src/infrastructure/persistence/dexie-db.ts` | Dexie database configuration |

---

## 7. Conclusion

The project selector system has **significant architectural issues** stemming from duplicate data sources:

1. **Hub and related dialogs** use `useLiveQuery` (Dexie) directly - correct approach
2. **Workspace pages** use `useWorkspaceProjects` which reads from Zustand store - problematic
3. **Zustand store is not persisted** - it's only an in-memory cache that may be empty

**Primary Risk**: Users may see empty project selectors or inconsistent data between Hub and workspace pages.

**Recommended Solution**: Refactor all project reads to use `useLiveQuery` (Dexie) for real-time consistency, and ensure proper hydration guards are in place.

---

**Report Generated**: 2026-01-08
**Next Action**: Implement P0 fixes as outlined in Section 5.1
