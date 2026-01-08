# Hub Feature Diagnostic Report

**Generated**: 2026-01-09
**Scope**: Hub feature at `/Users/apple/Documents/coding-projects/project-alpha-master`
**Analyst**: Deep-scan module

---

## 1. Entry Points

| Route | File | Component | Entry Type | Notes |
|-------|------|-----------|------------|-------|
| `/` (root) | `src/routes/index.tsx` | `HubHomePage` | Primary landing page | Renders HubHomePage via TanStack Router |
| `/hub` | `src/routes/hub.tsx` | `HubHomePage` | Alternative route | Same component wrapped with ErrorBoundary |
| Route params | `HubHomePage.tsx:45-49` | `workspace`, `action`, `message` | Query params | Triggers project picker or wizard based on params |

### Landing Flow
```
User visits app → TanStack Router matches `/` → HubHomePage renders
├── BootSequence (8-bit boot animation)
├── HubHero (welcome message)
├── SummaryCardsGrid (metrics dashboard)
├── ChartsGrid (activity/workspace charts)
├── BentoGrid (workspace navigation cards)
└── RecentProjectsSection (project list)
```

### Route Query Param Handling
```typescript
// HubHomePage.tsx:80-95
useEffect(() => {
  if (workspace) {
    // User clicked workspace without project → show picker
    setProjectPickerWorkspace(workspace);
    setProjectPickerOpen(true);
  } else if (action === 'create-project') {
    // Create button clicked → open wizard directly
    setProjectCreationWizardOpen(true);
  }
}, [workspace, action, message]);
```

---

## 2. Component Tree

```
HubHomePage (439 lines)
│
├── BootSequence
│   └── 8-bit BIOS-style boot animation
│
├── HubHero
│   └── Typing effect welcome message
│
├── AdvancedSearchDialog (from @/presentation/components/search)
│
├── SummaryCardsGrid
│   ├── ProjectCountCard
│   │   ├── Total projects count
│   │   ├── Active projects count
│   │   └── Deleted projects count
│   ├── StorageUsageCard
│   │   └── Progress bar with quota limit
│   └── ActivityCard
│       ├── Projects opened today
│       └── Projects opened this week
│
├── ChartsGrid
│   ├── ActivityLineChart (placeholder - unimplemented)
│   └── WorkspacePieChart
│       └── IDE/Knowledge/Notes/Study distribution
│
├── BentoGrid (from @/presentation/components/ide/BentoGrid)
│   ├── NEW_PROJECT (Create Project wizard trigger)
│   ├── NOTES (ProjectPickerDialog trigger)
│   ├── AGENTS (ProjectPickerDialog trigger)
│   ├── KNOWLEDGE (ProjectPickerDialog trigger)
│   ├── STUDY (ProjectPickerDialog trigger)
│   ├── TERMINAL (toast - restricted access)
│   ├── SETTINGS (navigate to /settings)
│   └── ABOUT (navigate to /about)
│
├── RecentProjectsSection
│   └── ProjectCard (× N, sorted by lastOpened desc)
│       ├── WorkspaceBadge (× M, one per binding)
│       │   └── Click → Direct navigation
│       └── Quick-open buttons (hover only)
│
├── WorkspaceBindingDialog
│   ├── WorkspaceBindingHeader
│   ├── WorkspaceBindingToggle
│   ├── WorkspaceCheckboxList
│   │   └── WorkspaceCheckboxItem (× 4)
│   └── WorkspaceBindingFooter
│
├── ProjectPickerDialog
│   └── Filtered project list by workspace
│       └── Empty state with "Create Project" CTA
│
└── ProjectCreationWizard (from @/presentation/components/project)
    ├── ProjectDetailsStep
    ├── WorkspaceSetupStep
    ├── AgentSelectionStep
    ├── FileSetupStep
    └── ReviewStep
```

---

## 3. State Sources

| Store | Location | Purpose | Hub Usage |
|-------|----------|---------|-----------|
| **Dexie DB** | `src/infrastructure/persistence/dexie-db.ts` | Single source of truth for projects | `useLiveQuery(() => db.projects.toArray())` |
| **useProjectStore** | `src/infrastructure/persistence/stores/project/useProjectStore.ts` | Zustand store (in-memory cache, NOT persisted) | `useProjectStore.getState().createProject()`, `updateLastOpened()` |
| **useDashboardMetrics** | `src/presentation/components/hub/useDashboardMetrics.ts` | Computed metrics hook | Aggregates counts, storage, activity from projects array |
| **Local state** | `HubHomePage.tsx:54-61` | UI state (dialogs, booting, selected project) | `booting`, `dialogOpen`, `projectPickerOpen`, `selectedProject` |
| **Route state** | `HubHomePage.tsx:44-51` | Query params | `workspace`, `action`, `message` from `useRouterState()` |

### Data Flow for Dashboard Metrics

```
db.projects.toArray()
    ↓
useLiveQuery() → projects array
    ↓
useDashboardMetrics({ projects })
    ↓
Memoized aggregation (useMemo):
├── totalProjects = projects.length (excl. deleted)
├── activeProjects = projects.length (excl. deleted)
├── deletedProjects = projects.filter(p => p.deletedAt).length
├── estimatedStorageKB = sum(JSON.stringify(p).length / 1024)
├── projectsOpenedToday = count(lastOpened >= startOfToday)
├── projectsOpenedThisWeek = count(lastOpened >= startOfWeek)
├── ideWorkspaceCount = count(bindings.ide === true)
├── knowledgeWorkspaceCount = count(bindings.knowledge === true)
├── notesWorkspaceCount = count(bindings.notes === true)
└── studyWorkspaceCount = count(bindings.study === true)
    ↓
SummaryCardsGrid, ChartsGrid
```

### Critical: Dual State Issue (FIXED 2026-01-06)

```typescript
// FIX-2026-01-06: Hub now reads from Dexie, NOT from Zustand store
// The useProjectStore is now a transient in-memory cache
// Dexie is the SINGLE SOURCE OF TRUTH for projects

// HubHomePage.tsx:64
const projects = useLiveQuery(() => db.projects.toArray());

// ProjectPickerDialog.tsx:127
const allProjectsFromDexie = useLiveQuery(() => db.projects.toArray(), []);
```

---

## 4. Dashboard Operations

| Operation | Source | Complexity | Performance Impact |
|-----------|--------|------------|-------------------|
| **Project count aggregation** | `useDashboardMetrics` | O(n) per project | Low - memoized on projects array |
| **Storage estimation** | `useDashboardMetrics:99-106` | O(n) × JSON.stringify | Medium - stringification per project |
| **Activity tracking (today/week)** | `useDashboardMetrics:108-120` | O(n) with date parsing | Medium - date object creation per project |
| **Workspace distribution** | `useDashboardMetrics:122-128` | O(n) object iteration | Low |
| **Recent projects sorting** | `HubHomePage.tsx:70-78` | O(n log n) sort + slice(0,5) | Low - only top 5 |
| **Project filtering (picker)** | `ProjectPickerDialog.tsx:130-137` | O(n) filter per targetWorkspace | Low - filtered by binding check |
| **Bento card rendering** | `HubHomePage.tsx:267-340` | Static config, memoized | Negligible |
| **Workspace navigation** | `HubHomePage.tsx:104-123` | O(1) check for single project | Low |

### Performance Concerns

1. **JSON.stringify per project for storage estimation** (`useDashboardMetrics.ts:99-106`)
   ```typescript
   // Runs on every project, every metrics recalculation
   const jsonSize = JSON.stringify(project).length;
   estimatedStorage += jsonSize;
   ```
   - **Issue**: Expensive for large project metadata
   - **Mitigation**: Already memoized, but could be cached in DB

2. **Multiple date parsing operations** (`useDashboardMetrics.ts:69-70`)
   ```typescript
   const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
   const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
   ```
   - **Issue**: Creates multiple Date objects
   - **Mitigation**: Minor impact, could pre-compute

3. **No pagination for recent projects**
   - Current: `slice(0, 5)` after full array sort
   - Could use Dexie `.limit(5).reverse().sortBy('lastOpened')` instead

---

## 5. Database Operations

| Table | Operation | Query | Frequency | Hub Usage |
|-------|-----------|-------|-----------|-----------|
| **projects** | READ | `db.projects.toArray()` | On mount + reactive | Main project list, metrics |
| **projects** | READ | `db.projects.orderBy('lastOpened').reverse().limit(5)` | Not used (sort in JS) | Could optimize recent projects |
| **projects** | WRITE | `db.projects.put()` | On project create/update | Workspace binding changes |
| **projects** | WRITE | `db.projects.put()` | On project open | Updates lastOpened timestamp |
| **syncStatus** | READ | `db.syncStatus.toArray()` + filter | Via `getSyncStatusStats()` | Not directly used in Hub |
| **fsaHandles** | READ | `db.fsaHandles.where('permissionStatus').equals('granted')` | Via `getAllValidFSAHandles()` | Not directly used in Hub |

### Query Pattern Analysis

```typescript
// HubHomePage.tsx:64 - Single reactive query
const projects = useLiveQuery(() => db.projects.toArray());

// ProjectPickerDialog.tsx:127 - Separate reactive query
const allProjectsFromDexie = useLiveQuery(() => db.projects.toArray(), []);

// Both subscribe to same Dexie table - potential duplicate queries
```

### Optimization Opportunities

1. **Consolidate Dexie queries**: Both Hub and ProjectPicker read `db.projects.toArray()` independently
   - Could share via context or hoist to common ancestor

2. **Use Dexie indexes for sorting**:
   ```typescript
   // Current (in-memory sort):
   recentProjects.sort((a, b) => timeB - timeA).slice(0, 5)

   // Optimized (DB-level sort):
   db.projects.orderBy('lastOpened').reverse().limit(5).toArray()
   ```

3. **Count queries instead of full array**:
   ```typescript
   // For metrics only (could be separate):
   db.projects.count()  // Instead of toArray().length
   db.projects.where('deletedAt').notEqual(undefined).count()
   ```

---

## 6. Internal Issues Found

| Issue | Location | Severity | Description |
|-------|----------|----------|-------------|
| **Duplicate Dexie queries** | `HubHomePage.tsx:64` + `ProjectPickerDialog.tsx:127` | Low | Both subscribe to `db.projects.toArray()` independently |
| **JSON.stringify for storage** | `useDashboardMetrics.ts:99-106` | Medium | Expensive operation runs on every project, every render |
| **In-memory sort instead of DB** | `HubHomePage.tsx:70-78` | Low | Sorts 100% of projects when only 5 needed |
| **ActivityLineChart placeholder** | `ChartsGrid.tsx:78` | Low | Component exists but shows "Coming Soon" |
| **Console.log in production** | `ProjectCard.tsx:97, 105, 119, 123` | Low | Debug logging should be removed or wrapped in dev check |
| **Event bus listener on every ProjectCard** | `ProjectCard.tsx:94-126` | Medium | Each card registers/unregisters listeners on mount/unmount - potential memory leak if many projects |
| **Hardcoded quota limit** | `SummaryCardsGrid.tsx:380` | Low | `quotaLimitMB={50}` should be configurable |

### Console Log Issues (ProjectCard.tsx)

```typescript
// Lines 97, 105, 119, 123 - Debug logging in production code
console.log('[ProjectCard] Setting up event bus listeners for project:', project.id);
console.log('[ProjectCard] WORKSPACE_PROJECT_UPDATED event received:', ...);
console.log('[ProjectCard] Event bus listeners registered');
console.log('[ProjectCard] Cleaning up event bus listeners');
```

### Event Bus Memory Concern

```typescript
// ProjectCard.tsx:116-125
const unsubscribeProjectUpdated = eventBus.on(DomainEventType.FILE_SAVED, handleProjectUpdated);
// ...
return () => {
  unsubscribeProjectUpdated();  // Cleanup on unmount
};
```

Each ProjectCard creates an event listener. With 100 projects, 100 listeners. While cleanup exists, rapid mount/unmount could cause issues.

---

## 7. Dependencies on Other Features

| Dependency | Type | Direction | Hub Usage |
|------------|------|-----------|-----------|
| **TanStack Router** | External | Consumer | Route definitions, navigation |
| **Dexie IndexedDB** | External | Consumer | Project persistence |
| **Zustand** | External | Consumer | Project store (create/update) |
| **react-i18next** | External | Consumer | Localization (t() function) |
| **lucide-react** | External | Consumer | Icons (Folder, Clock, etc.) |
| **date-fns** | External | Consumer | `formatDistanceToNow()` for display |
| **sonner** | External | Consumer | Toast notifications |
| **@radix-ui/react-dialog** | External | Consumer | Dialog primitives |
| **Event Bus** | Internal | Consumer | FILE_SAVED events |
| **BentoGrid** | Internal | Consumer | Workspace navigation cards |
| **ProjectCreationWizard** | Internal | Consumer | Multi-step project creation |
| **AdvancedSearchDialog** | Internal | Consumer | Search functionality |
| **Workspace routes** | Internal | Consumer | Navigation targets (`/ide/$projectId`, etc.) |

### External Feature Dependencies

| Feature | Dependency Type | Description |
|---------|----------------|-------------|
| **Workspace Components** | Navigation target | Hub navigates to `/ide/$projectId`, `/notes/$projectId`, etc. |
| **File System Access API** | Browser API | `window.showDirectoryPicker()` for FSA project creation |
| **Project Store** | State provider | `useProjectStore.getState().createProject()`, `updateLastOpened()` |
| **Event Bus** | Cross-component | `eventBus.on(DomainEventType.FILE_SAVED)` in ProjectCard |

### Integration Points

```typescript
// Project creation → navigate to workspace
handleNewProject() {
  const newProjectId = useProjectStore.getState().createProject(projectInput);
  navigate({ to: '/ide/$projectId', params: { projectId: newProjectId } });
}

// Workspace binding update → save to Dexie
handleWorkspaceBindingConfirm() {
  const project = await db.projects.get(selectedProject.id);
  await db.projects.put({ ...project, bindings: bindings });
}

// Project picker → update lastOpened
handleProjectSelect() {
  useProjectStore.getState().updateLastOpened(project.id);
  window.location.href = `${routeMap[targetWorkspace]}/${project.id}`;
}
```

---

## 8. Summary

### Strengths
- Clean separation: Dexie is single source of truth
- Memoized metrics calculation prevents unnecessary recomputation
- Reactive queries via `useLiveQuery` ensure UI stays in sync
- Modular component structure with focused responsibilities
- Good i18n integration throughout

### Areas for Improvement
1. Consolidate duplicate Dexie queries between Hub and ProjectPicker
2. Optimize recent projects query to use Dexie ordering/limits
3. Add debouncing or caching for storage estimation
4. Remove debug console.log statements from production code
5. Consider context sharing to avoid duplicate subscriptions
6. Make quota limit configurable (currently hardcoded to 50MB)

### Architecture Compliance
- ✅ Single source of truth (Dexie)
- ✅ Zustand store as transient cache (not persisted)
- ✅ React hooks for reactive data
- ✅ TanStack Router for navigation
- ✅ Proper error boundary wrapper on `/hub` route

---

*Report generated by Deep-scan module*
*Next action: Review findings with Architecture Remediation team*
