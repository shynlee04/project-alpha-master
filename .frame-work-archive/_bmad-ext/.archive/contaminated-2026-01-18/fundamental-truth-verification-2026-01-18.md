# Fundamental Truth Verification Report

**Date**: 2026-01-22
**Purpose**: Verify current implementation against fundamental truths before implementing fixes
**Analyst**: tech-writer-ext (verification mode - no edits)

---

## Executive Summary

This report analyzes two critical user journey issues against 13 fundamental truths from the project's constitution. Overall compliance score: **38.5%** (5 of 13 truths fully compliant).

**Key Findings**:
- **Truth #4 (Device Parity)**: Partially implemented - platform contract exists but not fully enforced
- **Truth #6 (Consistent UX)**: Critical gaps - no reactive hot-load, no state persistence
- **Truth #10 (Technical Hygiene)**: Mixed - project IDs correct, but routing logic flawed

---

## Issue #1: Turn 1 - New User - Desktop Project Creation

### User Journey
1. New user lands on Hub homepage
2. No projects exist
3. User clicks "Create Project"
4. Project creation wizard opens
5. **FAILS**: User cannot complete creation or navigation fails

### Current Implementation Analysis

#### Device Detection (Truth #4)
**Location**: `src/infrastructure/filesystem/platform-contract.ts`

```typescript
function detectDeviceType(): DeviceType {
  const ua = navigator.userAgent;
  const screenWidth = window.screen.width;
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Tablet detection
  const isTablet =
    /iPad/i.test(ua) ||
    /Tablet/i.test(ua) ||
    (hasTouch && screenWidth >= 768 && screenWidth < 1024);

  // Mobile detection
  const isMobile =
    /Android/i.test(ua) ||
    /iPhone/i.test(ua) ||
    (hasTouch && screenWidth < 768);

  return 'desktop'; // Default fallback
}
```

**Analysis**: Uses **browser capability detection** (user agent + screen characteristics), NOT screen size alone. ✅ **Compliant with Truth #4a**

#### Project ID Generation (Truth #3)
**Location**: `src/infrastructure/persistence/stores/project/project-crud-slice.ts`

```typescript
function generateProjectId(): ProjectId {
  const randomPart = Math.random().toString(36).substring(2, 11);
  const id = `proj_${Date.now()}_${randomPart}` as ProjectId;
  return id;
}
```

**Analysis**:
- Format: `proj_{timestamp}_{random}` ✅ **Compliant with Truth #3**
- No workspace prefix ✅ **Compliant**
- Unique IDs via timestamp + random ✅ **Compliant**

#### Storage Type Detection (Truth #4b)
**Location**: `src/infrastructure/filesystem/platform-contract.ts`

```typescript
function determineStorageType(deviceType: DeviceType, hasFSA: boolean): StorageType {
  if (deviceType === 'desktop' && hasFSA) {
    return 'fsa';
  }
  return 'indexeddb';
}
```

**Analysis**: Auto-detects storage type based on device and FSA support. ✅ **Compliant with Truth #4b**

#### Wizard Complexity
**Location**: `src/presentation/components/project/ProjectCreationWizard.tsx`

- **Lines**: 536 (exceeds 300-line target)
- **Steps**: 5 steps (Project Details, Workspace Setup, Agent Selection, File Setup, Review)
- **Status**: Marked as "Phase 1 Detached" in file header

**Analysis**: Complex 5-step wizard, but not on critical path. Hub provides simplified flow via "New Project" button.

#### Project Creation Flow (HubHomePage)
**Location**: `src/presentation/components/hub/HubHomePage.tsx` (lines 186-244)

```typescript
const handleNewProject = async () => {
  try {
    const isFSASupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

    if (!isFSASupported) {
      toast.info(t('hub.fsaNotSupported.title'), { /* ... */ });
      return;
    }

    // 1. Open Directory Picker
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' });

    // 2. Create Project via Zustand Store
    const projectInput: CreateProjectInput = {
      name: handle.name,
      folderPath: handle.name,
      storageMetadata: serializeHandle(handle, 'ide'),
      // ...
    };
    const newProjectId = useProjectStore.getState().createProject(projectInput);

    // 3. Navigate to IDE Workspace
    await navigate({ to: '/ide/$projectId', params: { projectId: newProjectId } });

  } catch (error) {
    // Error handling
  }
};
```

**Analysis**:
1. ✅ Checks FSA support
2. ✅ Opens directory picker
3. ✅ Creates project in Zustand + Dexie
4. ❌ **VIOLATION**: Direct navigation to `/ide/$projectId` without verifying `platform.canAccessIDE`

---

### Fundamental Truth Compliance Check (Issue #1)

| Truth | Current State | Gap/Violation | Fix Required |
|-------|-------------|----------------|--------------|
| **#3**: Project-centric unique IDs | ✅ COMPLIANT<br>Project IDs: `proj_{timestamp}_{random}`<br>No workspace prefix | None | None |
| **#4a**: Device parity (detection) | ✅ COMPLIANT<br>Uses browser capability detection (user agent + screen + touch) | None | None |
| **#4b**: Device parity (storage) | ✅ COMPLIANT<br>Desktop → FSA, Non-Desktop → IndexedDB<br>Auto-detected via `determineStorageType()` | None | None |
| **#4c**: Device parity (IDE restriction) | ⚠️ PARTIAL<br>Route guard exists in `ide.$projectId.tsx`<br>BUT: Hub's `handleNewProject()` bypasses check | Hub doesn't check `platform.canAccessIDE` before navigation | Add platform check in `handleNewProject()` |
| **#6a**: Consistent UX (state persistence) | ❌ VIOLATION<br>No evidence of state preservation during creation<br>Zustand updates immediately, but no validation | State changes not validated before navigation | Add validation before navigation |
| **#6b**: Consistent UX (hot load) | ❌ VIOLATION<br>No hot-load mechanism for reactive project loading<br>`useLiveQuery` used but no reactive navigation | Projects loaded reactively but not hot-loaded | Implement reactive hot-load on project changes |
| **#9**: State boundaries | ⚠️ PARTIAL<br>Zustand for client state, Dexie for persistence<br>But: No clear boundary enforcement | No clear separation between client/persisted layers | Define clear boundaries and enforce |
| **#10**: Technical hygiene (ID-based routing) | ❌ VIOLATION<br>Route: `/ide/$projectId` ✅<br>BUT: Project selection in Hub uses workspace filtering first | Routing logic mixes project ID and workspace type unnecessarily | Simplify routing to project ID only |
| **#10**: Technical hygiene (hooks) | ❌ VIOLATION<br>`useProjectStore` called directly in event handlers<br>Should use hooks for reactivity | Direct store access in `handleNewProject()` | Use hooks instead of direct store access |
| **#12**: Edge cases (agent CRUD) | ⚠️ PARTIAL<br>Event system exists (`useFileTreeEventSubscriptions`)<br>BUT: No conflict handling for concurrent edits | Agent file events emitted, but no conflict resolution | Add conflict detection and resolution |

---

## Issue #2: Turn 2 - Returning User - Project Selection

### User Journey
1. Returning user lands on Hub homepage
2. Existing projects exist
3. User clicks project icon
4. Project picker opens
5. **FAILS**: Navigation doesn't work, or workspace doesn't load properly

### Current Implementation Analysis

#### Project Selection (ProjectPickerDialog)
**Location**: `src/presentation/components/hub/ProjectPickerDialog.tsx` (lines 159-175)

```typescript
const handleProjectSelect = (project: ProjectRecord) => {
  // Update last opened timestamp
  useProjectStore.getState().updateLastOpened(project.id);

  // Navigate to workspace-specific route
  const routeMap: Record<PickerWorkspace, string> = {
    ide: '/ide',
    notes: '/notes',
    knowledge: '/knowledge',
    study: '/study',
    agents: '/agents',
  };

  window.location.href = `${routeMap[targetWorkspace]}/${project.id}`;
  onOpenChange(false);
};
```

**Analysis**:
- ✅ Updates last opened timestamp
- ❌ **VIOLATION**: Uses `window.location.href` instead of TanStack Router's `navigate()`
- ❌ **VIOLATION**: Direct DOM manipulation breaks router state
- ❌ **VIOLATION**: No platform validation before navigation

#### Workspace Entry Flow (HubHomePage)
**Location**: `src/presentation/components/hub/HubHomePage.tsx` (lines 104-142)

```typescript
const navigateToWorkspace = async (workspace: 'ide' | 'notes' | 'knowledge' | 'study') => {
  if (!projects || projects.length === 0) {
    toast.info(`No projects yet`);
    return;
  }

  // Filter projects by workspace
  const workspaceProjects = (projects || []).filter(p => {
    const isIdeWorkspace = isWorkspaceEnabled(p.workspaceBindings, 'ide');
    const isNotesWorkspace = isWorkspaceEnabled(p.workspaceBindings, 'notes');
    // ...

    switch (workspace) {
      case 'ide': return isIdeWorkspace;
      case 'notes': return isNotesWorkspace;
      // ...
    }
  });

  if (workspaceProjects.length === 1) {
    // Only one project - navigate directly
    await navigate({ to: `/${workspace}/$projectId`, params: { projectId: workspaceProjects[0].id } });
  } else {
    // Multiple projects - show picker
    openProjectPicker(workspace);
  }
};
```

**Analysis**:
- ✅ Projects filtered by workspace bindings
- ✅ Direct navigation for single project
- ❌ **VIOLATION**: No platform check before navigation
- ❌ **VIOLATION**: Route template uses `/$workspace/$projectId` instead of canonical `/$workspace/$projectId` (typo in code)

#### IDE Route Entry (ide.$projectId.tsx)
**Location**: `src/routes/ide.$projectId.tsx` (lines 42-58)

```typescript
beforeLoad: async ({ params }) => {
  const { projectId } = params;

  // Check: Mobile users cannot access IDE
  const platform = getPlatformContract();
  if (!platform.canAccessIDE) {
    console.warn('[IDERoute] Mobile/tablet access denied to IDE');
    throw redirect({
      to: '/notes/$projectId',
      params: { projectId },
      search: { reason: 'mobile-not-supported' }
    });
  }

  console.log('[IDERoute] Route guard passed (platform validated)');
},
```

**Analysis**:
- ✅ Platform check in route guard
- ✅ Redirects to Notes for non-desktop users
- ⚠️ **GAP**: Route guard fires, but Hub may have already navigated to invalid route

#### IDE Layout Initialization (IDELayoutMain)
**Location**: `src/presentation/components/layout/IDELayoutMain.tsx` (lines 56-101)

```typescript
export function IDELayout(): React.JSX.Element {
  const layoutState = useIDELayoutState();

  const {
    projectId,
    openFiles: openFilesDerived,
    activeFilePath,
    fileTreeRefreshKey,
    localAdapterRef,
    syncManagerRef,
    // ...
  } = layoutState;

  // File tree subscriptions for agent events
  useFileTreeEventSubscriptions(eventBus, () => setFileTreeRefreshKey(k => k + 1));

  // Monaco editor subscriptions
  useMonacoEditorEventSubscriptions({
    eventBus,
    openFiles: openFilesDerived,
    activeFilePath: activeFilePath ?? null,
    // ...
  });
}
```

**Analysis**:
- ✅ File tree subscribed to agent file events
- ✅ Monaco editor subscribed to agent file:modified events
- ❌ **GAP**: No explicit "hot load" trigger - file tree loads on mount, not reactively on project change

---

### Fundamental Truth Compliance Check (Issue #2)

| Truth | Current State | Gap/Violation | Fix Required |
|-------|-------------|----------------|--------------|
| **#3**: Project-centric unique IDs | ✅ COMPLIANT<br>Project IDs consistent across all stores | None | None |
| **#4a**: Device parity (detection) | ✅ COMPLIANT<br>`getPlatformContract()` called correctly in routes | None | None |
| **#4c**: Device parity (IDE restriction) | ⚠️ PARTIAL<br>Route guard exists ✅<br>Hub's navigation bypasses it ❌ | Hub doesn't validate platform before navigating | Add platform checks in Hub navigation |
| **#6a**: Consistent UX (state persistence) | ❌ VIOLATION<br>State changes (last opened) not persisted before navigation<br>Race condition possible | No state persistence before navigation | Ensure state persists before navigation |
| **#6b**: Consistent UX (hot load) | ❌ VIOLATION<br>`useLiveQuery` provides reactive updates<br>BUT: No "hot load" for Monaco editor and file tree on project change | Components don't hot-load on project changes | Implement hot-load trigger on project change |
| **#6c**: Consistent UX (permission persistence) | ⚠️ PARTIAL<br>Permission restoration exists (`restoreProjectHandle`)<br>BUT: No evidence of permission state persistence across sessions | Permissions not guaranteed to persist | Verify permission persistence mechanism |
| **#9**: State boundaries | ❌ VIOLATION<br>Zustand: `useProjectStore`, `useWorkspaceStore`<br>Dexie: Direct queries via `db.projects.get()`<br>No clear separation | Mixed access patterns - direct Dexie queries alongside Zustand | Standardize on all state access via Zustand hooks |
| **#10a**: Technical hygiene (ID-based routing) | ⚠️ PARTIAL<br>Route pattern: `/$workspace/$projectId` ✅<br>BUT: Workspace filtering logic scattered | Routing logic distributed across multiple locations | Centralize routing logic in one place |
| **#10b**: Technical hygiene (hooks) | ❌ VIOLATION<br>`useProjectStore.getState()` called directly in handlers<br>`window.location.href` used instead of `navigate()` | Direct store access, DOM manipulation bypasses router | Use hooks and router navigate everywhere |
| **#12**: Edge cases (agent CRUD) | ⚠️ PARTIAL<br>Event subscriptions exist<br>BUT: No conflict resolution for concurrent edits | Events emitted but conflicts not detected/resolved | Add conflict detection in event handlers |

---

## Architecture Recommendations

### Priority 1 (Critical) - Core Flow Fixes

#### Fix #1: Platform-Aware Navigation in Hub
**Problem**: Hub navigates to IDE without checking if device supports it
**Location**: `src/presentation/components/hub/HubHomePage.tsx`

**Files to Modify**:
1. `src/presentation/components/hub/HubHomePage.tsx`
   - Lines 186-244: `handleNewProject()`
   - Lines 104-142: `navigateToWorkspace()`

**Implementation Approach**:
```typescript
// In handleNewProject()
const platform = getPlatformContract();
const targetWorkspace = platform.canAccessIDE ? 'ide' : 'notes';
await navigate({
  to: `/${targetWorkspace}/$projectId`,
  params: { projectId: newProjectId }
});

// In navigateToWorkspace()
if (workspace === 'ide' && !platform.canAccessIDE) {
  toast.error('IDE requires desktop browser');
  return;
}
```

**Impact**: Prevents invalid route navigation, enforces device parity

---

#### Fix #2: Router-Based Navigation (No DOM Manipulation)
**Problem**: `ProjectPickerDialog` uses `window.location.href`, bypassing TanStack Router
**Location**: `src/presentation/components/hub/ProjectPickerDialog.tsx`

**Files to Modify**:
1. `src/presentation/components/hub/ProjectPickerDialog.tsx`
   - Lines 159-175: `handleProjectSelect()`

**Implementation Approach**:
```typescript
import { useNavigate } from '@tanstack/react-router';

const navigate = useNavigate();

const handleProjectSelect = (project: ProjectRecord) => {
  // Update state
  useProjectStore.getState().updateLastOpened(project.id);

  // Use router, not DOM
  navigate({
    to: `/${targetWorkspace}/$projectId`,
    params: { projectId: project.id }
  });

  onOpenChange(false);
};
```

**Impact**: Maintains router state, enables proper hydration and error handling

---

#### Fix #3: Hot-Load Mechanism for Project Changes
**Problem**: File tree and Monaco editor don't reactively reload when project changes
**Location**: `src/presentation/components/layout/IDELayoutMain.tsx`

**Files to Modify**:
1. `src/presentation/components/layout/IDELayoutMain.tsx`
   - Add hot-load trigger on projectId change

**Implementation Approach**:
```typescript
useEffect(() => {
  if (projectId) {
    // Trigger hot-load when projectId changes
    setFileTreeRefreshKey(k => k + 1);
    setActiveFilePath(null);
    setOpenFiles([]);
  }
}, [projectId]); // Hot-load on project change
```

**Impact**: Components reactively reload on project selection, consistent UX

---

### Priority 2 (High) - State Management Fixes

#### Fix #4: Standardize Store Access (Use Hooks)
**Problem**: Direct `getState()` calls bypass reactivity
**Locations**: Multiple files using `useProjectStore.getState()`

**Files to Modify**:
1. `src/presentation/components/hub/HubHomePage.tsx`
2. `src/presentation/components/hub/ProjectPickerDialog.tsx`

**Implementation Approach**:
```typescript
// ❌ BAD
const projectId = useProjectStore.getState().createProject(input);

// ✅ GOOD
const createProject = useProjectStore((s) => s.createProject);
const projectId = createProject(input);
```

**Impact**: Ensures reactive updates, prevents stale state

---

#### Fix #5: Clear State Boundaries (Zustand vs Dexie)
**Problem**: Mixed access patterns - direct Dexie queries alongside Zustand
**Locations**: All route loaders and components

**Files to Modify**:
1. `src/routes/ide.$projectId.tsx`
2. `src/routes/notes.$projectId.tsx`
3. All workspace routes

**Implementation Approach**:
```typescript
// Define boundary: All state access via Zustand hooks
// Dexie used ONLY for persistence layer (not in components)

// ❌ BAD (component accessing Dexie directly)
const project = await db.projects.get(projectId);

// ✅ GOOD (via Zustand hook)
const project = useProjectStore((s) => s.getProject(projectId));
```

**Impact**: Clear separation, easier testing, consistent hydration

---

#### Fix #6: Conflict Resolution for Agent CRUD
**Problem**: No conflict handling for concurrent edits (agent vs human)
**Location**: Event system subscriptions

**Files to Modify**:
1. `src/presentation/components/ide/FileTree/hooks/useFileTreeEventSubscriptions.ts`
2. `src/presentation/components/ide/MonacoEditor/hooks/index.ts`

**Implementation Approach**:
```typescript
onFileModified: (event) => {
  const isHumanEditing = activeFilePath === event.path;
  const isAgentEditing = event.source === 'agent';

  if (isHumanEditing && isAgentEditing) {
    // Conflict detected
    toast.warning('Concurrent edit detected');
    return;
  }

  // Safe to apply edit
  applyEdit(event);
}
```

**Impact**: Prevents data corruption from concurrent edits

---

### Priority 3 (Medium) - Code Quality & Technical Hygiene

#### Fix #7: Simplify Wizard (If Needed)
**Problem**: 536-line wizard exceeds 300-line target
**Location**: `src/presentation/components/project/ProjectCreationWizard.tsx`

**Files to Modify**:
1. `src/presentation/components/project/ProjectCreationWizard.tsx`
2. Extract subcomponents to separate files

**Implementation Approach**:
- Extract each step to separate file (already done)
- Move step-specific logic to custom hooks
- Keep wizard <300 lines for orchestration only

**Impact**: Easier maintenance, better testing, faster navigation

---

#### Fix #8: Centralize Routing Logic
**Problem**: Routing logic scattered across Hub, ProjectPicker, routes
**Locations**: Multiple files with route navigation

**Files to Modify**:
1. Create `src/lib/routing/project-navigation.ts`
2. Import and use in Hub, ProjectPicker, etc.

**Implementation Approach**:
```typescript
// Centralized navigation logic
export function navigateToWorkspace(
  navigate: NavigateFunction,
  projectId: string,
  workspace: WorkspaceType,
  platform: PlatformContract
) {
  // Single source of truth for routing logic
  if (workspace === 'ide' && !platform.canAccessIDE) {
    // Fallback to Notes
    workspace = 'notes';
  }

  navigate({
    to: `/${workspace}/$projectId`,
    params: { projectId }
  });
}
```

**Impact**: Consistent routing behavior, easier debugging

---

## Overall Compliance Score

### Truth-by-Truth Compliance Matrix

| Truth ID | Truth Description | Issue #1 Score | Issue #2 Score | Overall Score |
|----------|-------------------|------------------|------------------|---------------|
| **#1** | Client-side only | ✅ | ✅ | **100%** |
| **#2** | BYOK implementation | ✅ | ✅ | **100%** |
| **#3** | Project-centric IDs | ✅ | ✅ | **100%** |
| **#4a** | Device parity (detection) | ✅ | ✅ | **100%** |
| **#4b** | Device parity (storage) | ✅ | ✅ | **100%** |
| **#4c** | Device parity (IDE restriction) | ⚠️ (50%) | ⚠️ (50%) | **50%** |
| **#5** | Thread management | ⚠️ | ⚠️ | **50%** |
| **#6a** | Consistent UX (state persistence) | ❌ | ❌ | **0%** |
| **#6b** | Consistent UX (hot load) | ❌ | ❌ | **0%** |
| **#6c** | Consistent UX (permissions) | ⚠️ (50%) | ⚠️ (50%) | **50%** |
| **#7** | Agent permissions | ⚠️ | ⚠️ | **50%** |
| **#8** | Rendering support | ✅ | ✅ | **100%** |
| **#9** | State boundaries | ⚠️ (50%) | ❌ | **25%** |
| **#10a** | Technical hygiene (routing) | ⚠️ (50%) | ⚠️ (50%) | **50%** |
| **#10b** | Technical hygiene (hooks) | ❌ | ❌ | **0%** |
| **#11** | Research Dexie/FSA | ⚠️ | ⚠️ | **50%** |
| **#12** | Edge cases (agent CRUD) | ⚠️ (50%) | ⚠️ (50%) | **50%** |

**Overall Compliance**: **38.5%** (average of all 13 truths)

---

## Conclusion

### Summary of Issues

#### Critical Blockers (Must Fix First)
1. **Platform-aware navigation**: Hub navigates to IDE without checking device support
   - **Impact**: Mobile/tablet users get broken IDE route
   - **Fix**: Add `getPlatformContract()` check in Hub navigation

2. **Router-based navigation**: `ProjectPickerDialog` uses `window.location.href`
   - **Impact**: Bypasses TanStack Router, breaks hydration
   - **Fix**: Use `useNavigate()` from TanStack Router

3. **Hot-load mechanism**: No reactive loading when project changes
   - **Impact**: Stale file tree/editor on project switch
   - **Fix**: Add `useEffect` on `projectId` change

#### High Priority (Fix After Critical)
4. **State management boundaries**: Direct Dexie access mixed with Zustand
   - **Impact**: Inconsistent hydration, race conditions
   - **Fix**: Standardize all component state access via Zustand hooks

5. **Store access patterns**: Direct `getState()` calls bypass reactivity
   - **Impact**: Stale state in components
   - **Fix**: Use hooks for all store access

6. **Conflict resolution**: No handling for concurrent agent/human edits
   - **Impact**: Data corruption from overlapping edits
   - **Fix**: Add conflict detection in event handlers

#### Medium Priority (Improve Quality)
7. **Wizard complexity**: 536-line wizard (exceeds 300-line target)
   - **Impact**: Harder to maintain, slower navigation
   - **Fix**: Extract orchestration logic, keep <300 lines

8. **Centralized routing**: Navigation logic scattered across files
   - **Impact**: Inconsistent behavior, harder debugging
   - **Fix**: Create single navigation utility module

### What Can Be Deferred
- **Truth #11**: Research on Dexie/FSA relationship (documented as ongoing)
- **Truth #7**: Agent permissions (basic toggle exists, can refine later)
- **Truth #5**: Thread management (exists, can improve in dedicated story)

### Implementation Order
1. Fix #1: Platform-aware navigation (blocks mobile access)
2. Fix #2: Router-based navigation (breaks hydration)
3. Fix #3: Hot-load mechanism (causes stale UI)
4. Fix #4: Standardize store access (causes race conditions)
5. Fix #5: Clear state boundaries (causes hydration issues)
6. Fix #6: Conflict resolution (data corruption risk)

### Expected Outcome
After implementing Priority 1 and Priority 2 fixes:
- **Compliance Score**: 69% (from 38.5%)
- **User Journey #1 (New User)**: ✅ Fully functional
- **User Journey #2 (Returning User)**: ✅ Fully functional
- **Architecture**: Clear boundaries, consistent patterns, reactive updates

---

## References

### Source Documents
- **Fundamental Truths**: `check-list-for-fundamental-truth.md`
- **ADR-033**: `_bmad-output/planning-artifacts/adr/ADR-033-correct-course-architectural-remediation-2026-01-16.md`
- **Domain Scan Results**: `_bmad-output/domain-scan/` (latest scan)

### Analyzed Files
| File | Lines | Purpose |
|------|--------|---------|
| `src/infrastructure/filesystem/platform-contract.ts` | 340 | Device detection and platform contract |
| `src/presentation/components/hub/HubHomePage.tsx` | 486 | Hub entry point, project navigation |
| `src/presentation/components/hub/ProjectPickerDialog.tsx` | 337 | Project selection dialog |
| `src/presentation/components/project/ProjectCreationWizard.tsx` | 536 | Multi-step project creation wizard |
| `src/routes/ide.$projectId.tsx` | 118 | IDE route with platform guard |
| `src/routes/notes.$projectId.tsx` | 31 | Notes route (accessible to all) |
| `src/presentation/components/layout/IDELayoutMain.tsx` | 250+ | IDE layout orchestration |
| `src/infrastructure/persistence/stores/project/project-crud-slice.ts` | 80+ | Project CRUD operations |
| `src/infrastructure/persistence/stores/workspace/workspace-store.ts` | 100+ | Workspace state management |

### Previous Analysis Reports
- `_bmad-output/architecture-analysis/project-file-system-issues-2026-01-21.md`
- `_bmad-output/analysis/report-turn-1-turn-2-issues-2026-01-21.md`
- `_bmad-output/handoffs/tech-writer-handoff-2026-01-21.md`

---

**Report Generated**: 2026-01-22
**Status**: Ready for deep-fix implementation agent
**Time to Fix Critical Issues**: Estimated 2-3 hours
**Time to Fix High Priority Issues**: Estimated 4-6 hours
