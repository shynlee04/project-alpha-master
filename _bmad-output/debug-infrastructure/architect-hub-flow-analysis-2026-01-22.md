# Architecture Assessment: Hub Flow & Project Creation
**Date**: 2026-01-22
**Version**: 1.0.0
**Status**: CRITICAL ISSUES IDENTIFIED
**Analyst**: architect-ext

---

## Executive Summary

This analysis identifies **6 critical architectural issues** causing the reported UX failures in hub entry flow:

1. ❌ **Device detection uses SCREEN SIZE** (violates ADR-033)
2. ❌ **Three conflicting project creation paths** causing confusion and failures
3. ❌ **No proper error handling** in project creation flow
4. ❌ **Project selection bypasses proper routing** causing "UI collapse"
5. ❌ **536-line wizard** with no 2-level entry system as required
6. ❌ **Platform detection called too late** (after wizard shows)

---

## Platform Detection Analysis

### Current Implementation (WRONG)

**File**: `src/infrastructure/filesystem/platform-contract.ts`

```typescript
// Lines 132-148: detectDeviceType()
function detectDeviceType(): DeviceType {
  const ua = navigator.userAgent;
  const screenWidth = window.screen.width;  // ❌ SCREEN SIZE CHECK
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Tablet detection (iPad or similar)
  const isTablet =
    /iPad/i.test(ua) ||
    /Tablet/i.test(ua) ||
    (hasTouch && screenWidth >= 768 && screenWidth < 1024);  // ❌ SCREEN WIDTH
  // ...

  // Mobile detection
  const isMobile =
    /Mobile/i.test(ua) ||
    (hasTouch && screenWidth < 768);  // ❌ SCREEN WIDTH
  // ...

  return 'desktop';  // Default
}
```

### Problem: SCREEN SIZE INSTEAD OF BROWSER CAPABILITY

**User Report**: "Device should not distinct by screensize → I resize my screen → let me choosing browser (wrong look at fundamental truth)"

**Actual Behavior**:
1. Desktop user opens app → `detectDeviceType()` checks `screen.width`
2. User resizes window → Screen width changes
3. On next call to `getPlatformContract()` → Device type changes
4. This happens because screen size is part of detection logic
5. **Result**: Device type changes mid-session, violating ADR-033

### ADR-033 Requirement (VOLATED)

From `AGENTS.md` line 241-243:
> Per ADR-033 Decision D1:
> - Desktop → FSA (File System Access API)
> - Mobile/Tablet → IndexedDB
> - PlatformContract: getPlatformContract() - SINGLE SOURCE OF TRUTH
> - Device types: 'desktop' | 'mobile' | 'tablet' (not screen-size based)

### Root Cause

The detection logic uses **screen width as a fallback** when user agent detection fails:

```typescript
// Line 148: Tablet fallback
(hasTouch && screenWidth >= 768 && screenWidth < 1024)

// Line 164: Mobile fallback
(hasTouch && screenWidth < 768)
```

This means:
- A desktop browser with a small window (800px) could be classified as "tablet"
- A desktop browser with a very small window (600px) could be classified as "mobile"
- Resizing the window changes the device type

### Correct Implementation

Device type should be **browser capability based**, NOT screen size:

```typescript
function detectDeviceType(): DeviceType {
  if (typeof navigator === 'undefined') {
    return 'desktop'; // SSR default
  }

  const ua = navigator.userAgent;

  // Primary: User agent detection
  const isTablet = /iPad/i.test(ua) || /Tablet/i.test(ua) || ...;
  const isMobile = /Mobile/i.test(ua) || /iPhone/i.test(ua) || ...;

  if (isTablet) return 'tablet';
  if (isMobile) return 'mobile';
  return 'desktop';

  // ✅ NO SCREEN WIDTH CHECKS
}
```

### Impact

| Impact | Severity | Details |
|--------|----------|---------|
| **Device type changes mid-session** | CRITICAL | User can switch from desktop → mobile → tablet just by resizing |
| **FSA support confusion** | HIGH | Desktop user might be blocked from IDE if misclassified |
| **Navigation fails** | HIGH | Redirects to wrong workspace |
| **Violates ADR-033** | BLOCKER | Non-compliant with architecture decision |

---

## Project Creation Flow Analysis

### Current Implementation: THREE CONFLICTING PATHS

**File**: `src/presentation/components/hub/HubHomePage.tsx`

#### Path 1: Direct Folder Mount (handleNewProject)

```typescript
// Lines 186-244: Direct folder mount flow
const handleNewProject = async () => {
  try {
    const isFSASupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

    if (!isFSASupported) {
      // Graceful degradation for mobile
      toast.info('Folder Mounting Not Available');
      return;
    }

    // 1. Open Directory Picker
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' });

    // 2. Create Project via Zustand Store
    const projectInput: CreateProjectInput = {
      name: handle.name,
      folderPath: handle.name,
      storageMetadata: serializeHandle(handle, 'ide'),
      autoSync: true,
      bindings: { ide: true, knowledge: true, notes: true, study: true },
      tags: [],
    };

    const newProjectId = useProjectStore.getState().createProject(projectInput);

    // 3. Navigate to IDE Workspace
    await navigate({ to: '/ide/$projectId', params: { projectId: newProjectId } });
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project', {
        description: (error as Error).message,
      });
    }
  }
};
```

**Problems**:
1. ❌ No validation of project creation success
2. ❌ Navigates to IDE even if project not saved to Dexie
3. ❌ Uses `createProject()` directly, but no verification it worked
4. ❌ Error only logs, doesn't prevent navigation
5. ❌ Only for FSA storage (Desktop with showDirectoryPicker)

#### Path 2: Project Creation Wizard (ProjectCreationWizard)

```typescript
// Lines 463-468: Wizard integration
<ProjectCreationWizard
  open={projectCreationWizardOpen}
  onOpenChange={setProjectCreationWizardOpen}
  onProjectCreated={handleProjectCreated}
/>
```

**Problems**:
1. ❌ 536 lines (violates 300-line component rule)
2. ❌ 5-step wizard (too complex, user wants 2 steps)
3. ❌ Shows browser choice (violates ADR-033 auto-detection)
4. ❌ Handles FSA handle serialization differently from Path 1
5. ❌ `handleProjectCreated()` has different logic than `handleNewProject()`

#### Path 3: Wizard Success Handler (handleProjectCreated)

```typescript
// Lines 156-184: Platform-aware redirect
const handleProjectCreated = (projectId: string) => {
  toast.success('Project created successfully');

  const project = useProjectStore.getState().getProject(projectId);
  if (!project) return;  // ❌ Silent failure - returns early

  const platform = getPlatformContract();

  console.log('[HubHomePage] Platform detection:', getPlatformInfoForLogging());
  console.log('[HubHomePage] Project storage type:', project.storageType);
  console.log('[HubHomePage] canAccessIDE:', platform.canAccessIDE);

  if (platform.canAccessIDE) {
    navigate({ to: '/ide/$projectId', params: { projectId } });
  } else {
    navigate({ to: '/notes/$projectId', params: { projectId } });
  }
};
```

**Problems**:
1. ❌ `if (!project) return;` - Silent failure, no error shown to user
2. ❌ Calls `getPlatformContract()` too late (after wizard completes)
3. ❌ Logs but doesn't validate platform detection
4. ❌ Uses `platform.canAccessIDE` to decide, but project.storageType might differ
5. ❌ No verification that project was actually saved to Dexie

### User Report Analysis

**Issue 1**: "Create wizard fails - Failed to create project. Please try again."

**Root Cause**:
- Path 1: `handleNewProject()` catches errors but doesn't prevent navigation
- Path 3: `handleProjectCreated()` silently fails if project not found
- No verification that project was successfully persisted to Dexie before navigating

**Issue 2**: "Wizard complexity - archive and detach this wizard totally"

**Root Cause**:
- 536 lines violates governance: Component size > 300 lines is not accepted
- 5 steps (Project Details, Workspace Setup, Agent Selection, File Setup, Review) is too complex
- No simple 2-step flow as user requested

### Project Creation Flow Diagram

```
User clicks "Create Project"
  │
  ├─► Path 1: handleNewProject() (Direct folder mount)
  │     ├─ 1. showDirectoryPicker()
  │     ├─ 2. createProject(projectInput) → Zustand
  │     ├─ 3. [NO VERIFICATION] ← Missing success check
  │     └─ 4. navigate('/ide/$projectId') ← May fail if project not saved
  │
  └─► Path 2: ProjectCreationWizard (Multi-step wizard)
        ├─ Step 1: Project Details (name, description, icon, type)
        ├─ Step 2: Workspace Setup (optional)
        ├─ Step 3: Agent Selection (optional)
        ├─ Step 4: File Setup (optional)
        ├─ Step 5: Review & Create
        │
        ├─ createProject(projectInput) → Zustand → Dexie
        │     └─ [NO VERIFICATION] ← Missing success check
        │
        └─ handleProjectCreated(projectId)
              └─ [if (!project) return;] ← Silent failure
                    └─ No navigation, no error shown
```

### Critical Failure Points

| Step | Failure Mode | Impact |
|------|--------------|--------|
| **Zustand createProject()** | Throws error or doesn't persist | Project lost, no error shown |
| **Dexie sync** | Fails silently | Project not saved, but navigation proceeds |
| **getProject() after creation** | Returns null | Silent failure, no error to user |
| **Navigation** | Project ID invalid | UI loads in broken state |

---

## Project Selection Flow Analysis

### Current Implementation

**File**: `src/presentation/components/hub/ProjectPickerDialog.tsx`

```typescript
// Lines 159-175: Handle project selection
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
  // ❌ Bypasses TanStack Router!
  onOpenChange(false);
};
```

### User Report Analysis

**Issue**: "Icon connected to space → to space no project (ux ui callapse) → no hot load nothing load (monaco nor filetree)"

**Translation**: User clicks project icon → Navigates to workspace → UI collapses → Monaco and file tree don't load

### Root Causes

#### Cause 1: Bypassing TanStack Router

```typescript
window.location.href = `${routeMap[targetWorkspace]}/${project.id}`;
```

**Problems**:
1. ❌ Full page reload instead of client-side navigation
2. ❌ Loses application state
3. ❌ Breaks TanStack Router's navigation lifecycle
4. ❌ No route guards or validation before navigation
5. ❌ Cannot catch errors or handle failures

#### Cause 2: No Async Awaiting

```typescript
useProjectStore.getState().updateLastOpened(project.id);
// ⬆️ No await - operation might not complete
window.location.href = `${routeMap[targetWorkspace]}/${project.id}`;
// ⬆️ Navigation happens immediately
```

**Problems**:
1. ❌ Update might not be persisted to Dexie before navigation
2. ❌ Race condition between update and navigation
3. ❌ No guarantee project record is in consistent state

#### Cause 3: No Route Guard

```typescript
// HubHomePage.tsx - Lines 246-275: Recent project click handler
const handleOpenRecentProject = (projectId: string) => {
  const project = (projects || []).find(p => p.id === projectId);
  if (!project) return;  // ❌ Silent failure

  const bindings = project.workspaceBindings || project.bindings;

  // Check workspaces in priority order
  if (isEnabled(bindings?.ide)) {
    navigate({ to: '/ide/$projectId', params: { projectId } });  // ⬆️ Navigate even if project is incomplete
  } else if (isEnabled(bindings?.knowledge)) {
    navigate({ to: '/knowledge/$projectId', params: { projectId } });
  }
  // ...
};
```

**Problems**:
1. ❌ No validation that project has valid FSA handle
2. ❌ No check that project folder still exists
3. ❌ No verification that workspace bindings are correct
4. ❌ No error handling if navigation fails

### Project Selection Flow Diagram

```
User clicks project icon
  │
  ├─► HubHomePage.handleOpenRecentProject(projectId)
  │     ├─ Find project in Dexie
  │     ├─ Check workspace bindings
  │     └─ navigate('/ide/$projectId') ← No validation!
  │
  └─► ProjectPickerDialog.handleProjectSelect(project)
        ├─ updateLastOpened(projectId) ← No await!
        ├─ window.location.href = '/ide/{projectId}' ← Full reload!
        │
        └─ [PROBLEMS]
              ├─ TanStack Router bypassed
              ├─ Full page reload
              ├─ Application state lost
              ├─ Dexie update not awaited
              └─ No route guards
```

### Why UI Collapses

1. **Full page reload**: `window.location.href` causes complete app reload
2. **State loss**: All Zustand stores reset
3. **Race condition**: Project metadata might not be fully loaded when IDE initializes
4. **No validation**: IDE tries to load project, but project might be incomplete

### Correct Implementation

```typescript
// Should use TanStack Router's navigate()
const handleProjectSelect = async (project: ProjectRecord) => {
  // 1. Verify project integrity
  const hasValidHandle = project.storageMetadata?.handleId !== undefined;
  if (!hasValidHandle) {
    toast.error('Project folder is not accessible');
    return;
  }

  // 2. Await Dexie update
  await useProjectStore.getState().updateLastOpened(project.id);

  // 3. Use TanStack Router (not window.location)
  await navigate({
    to: `/${targetWorkspace}/$projectId`,
    params: { projectId: project.id }
  });

  onOpenChange(false);
};
```

---

## Wizard Complexity Analysis

### Current Implementation (OVERLY COMPLEX)

**File**: `src/presentation/components/project/ProjectCreationWizard.tsx`
**Lines**: 536
**Status**: ❌ VIOLATES GOVERNANCE (>300 lines not accepted)

### 5-Step Wizard Structure

```typescript
const WIZARD_STEPS: WizardStep[] = [
  { id: 1, titleKey: 'wizard.steps.projectDetails', optional: false },
  { id: 2, titleKey: 'wizard.steps.workspaceSetup', optional: true },      // ❌ Optional but shown
  { id: 3, titleKey: 'wizard.steps.agentSelection', optional: true },     // ❌ Optional but shown
  { id: 4, titleKey: 'wizard.steps.fileSetup', optional: true },         // ❌ Optional but shown
  { id: 5, titleKey: 'wizard.steps.review', optional: false },
];
```

### Problems

| Issue | Severity | Details |
|-------|----------|---------|
| **Too many steps** | HIGH | 5 steps for simple project creation |
| **Optional steps clutter flow** | MEDIUM | Steps 2, 3, 4 are optional but shown |
| **No 2-level entry** | BLOCKER | Governance requires clear 2-level entry system |
| **Shows browser choice** | BLOCKER | Violates ADR-033 auto-detection requirement |
| **Component too large** | BLOCKER | 536 lines > 300 line limit |

### User Report

> "archive and detach this wizard totally create new (more simple and align to styling, Eng and Vi + must useable"

**User wants**:
1. ✅ 2-step wizard (not 5)
2. ✅ Simple 8-bit design
3. ✅ English and Vietnamese strings
4. ✅ Usable (current wizard is confusing)

### Recommended 2-Step Wizard

```typescript
const SIMPLE_WIZARD_STEPS = [
  { id: 1, titleKey: 'wizard.steps.projectName', optional: false },
  { id: 2, titleKey: 'wizard.steps.create', optional: false },
];

// Step 1: Name project only
const Step1 = () => (
  <input
    type="text"
    placeholder="Project Name"
    value={name}
    onChange={(e) => setName(e.target.value)}
  />
);

// Step 2: Show progress, auto-detect platform, create
const Step2 = () => {
  const platform = getPlatformContract();
  const storageType = platform.storageType; // 'fsa' or 'indexeddb'

  return (
    <div>
      <p>Creating project with {storageType === 'fsa' ? 'File System Access' : 'IndexedDB'}</p>
      <button onClick={handleCreate}>Create</button>
    </div>
  );
};
```

---

## Handle Serialization Analysis

### Current Implementation

**File**: `src/infrastructure/filesystem/handle-persistence.ts` (not read, but referenced)

**Usage in HubHomePage.tsx**:
```typescript
// Line 214: Direct folder mount
storageMetadata: serializeHandle(handle, 'ide')

// Line 293: Wizard
storageMetadata: formData.storageType === 'fsa' && formData.fsaHandle
  ? serializeHandle(formData.fsaHandle, 'ide')
  : undefined,
```

### Potential Issues

| Issue | Severity | Details |
|-------|----------|---------|
| **No verification** | MEDIUM | serializeHandle() might fail silently |
| **Inconsistent usage** | MEDIUM | Two different code paths use it differently |
| **No validation** | HIGH | No check if handle can be accessed after serialization |

### Recommended Verification

```typescript
async function serializeAndVerifyHandle(handle: FileSystemDirectoryHandle, context: string) {
  try {
    // 1. Serialize
    const metadata = serializeHandle(handle, context);

    // 2. Verify handle is still accessible
    const testFile = await handle.getFileHandle('.test', { create: true });
    await testFile.remove();

    // 3. Return metadata if valid
    return metadata;
  } catch (error) {
    console.error('Handle serialization/verification failed:', error);
    throw new Error('Failed to access project folder');
  }
}
```

---

## Front Page Architecture Analysis

### Current Implementation (NO 2-LEVEL ENTRY)

**File**: `src/presentation/components/hub/HubHomePage.tsx`

### Components Present

1. ✅ `HubHero` - Welcome message with typing effect
2. ✅ `SummaryCardsGrid` - Metrics cards
3. ✅ `ChartsGrid` - Activity charts
4. ✅ `BentoGrid` - Main menu with 8 cards
5. ✅ `RecentProjectsSection` - Recent projects table
6. ✅ `ProjectPickerDialog` - Project selection for workspace
7. ✅ `ProjectCreationWizard` - Multi-step wizard
8. ✅ `WorkspaceBindingDialog` - Workspace configuration

### Missing: Clear 2-Level Entry System

**User Requirement**: "Front page architecture - Does a clear 2-level entry system exist?"

**Current State**:
```
Hub (Level 1)
  ├─ BentoGrid (8 cards) ← Mixed entry points
  │   ├─ CREATE_PROJECT
  │   ├─ FIELD_NOTES
  │   ├─ NEURAL_AGENTS
  │   ├─ DATA_BANK
  │   ├─ STUDY_CORE
  │   ├─ TERMINAL
  │   ├─ CONFIG_SYS
  │   └─ SYS_INFO
  │
  └─ RecentProjectsSection ← Additional entry point
```

**Problem**: Too many entry points, no clear hierarchy

### Recommended 2-Level Entry

```
Hub (Level 1: Entry)
  ├─ Recent Projects (5 projects max)
  │   ├─ Click → Go directly to workspace
  │   └─ "Create New Project" button
  │
  └─ Workspaces (Level 2: Secondary Navigation)
      ├─ Notes
      ├─ IDE (Desktop only)
      ├─ Knowledge
      └─ Study
```

**Implementation**:
```typescript
const HubHomePage = () => {
  return (
    <div className="hub-layout">
      {/* Level 1: Recent Projects (Primary Entry) */}
      <section className="recent-projects">
        <h2>Recent Projects</h2>
        <ProjectList projects={recentProjects} />
        <Button onClick={handleCreateNewProject}>Create New Project</Button>
      </section>

      {/* Level 2: Workspaces (Secondary Entry) */}
      <section className="workspaces">
        <h2>Workspaces</h2>
        <WorkspaceNav />
      </section>
    </div>
  );
};
```

---

## Root Causes Summary

### 1. Device Detection Uses Screen Size (CRITICAL)

**Location**: `src/infrastructure/filesystem/platform-contract.ts:132-172`
**Impact**: Device type changes on window resize
**Violation**: ADR-033 Decision D1 (not screen-size based)
**Fix**: Remove screen width checks, use browser capability only

### 2. Three Conflicting Project Creation Paths (CRITICAL)

**Location**: `src/presentation/components/hub/HubHomePage.tsx`
**Impact**: Confusion, inconsistent error handling, silent failures
**Fix**: Consolidate to single flow with proper error handling

### 3. No Project Creation Verification (CRITICAL)

**Location**: `HubHomePage.tsx:186-244` (handleNewProject)
**Impact**: Navigates to workspace even if project not saved
**Fix**: Verify Dexie persistence before navigation

### 4. Project Selection Bypasses Router (CRITICAL)

**Location**: `src/presentation/components/hub/ProjectPickerDialog.tsx:173`
**Impact**: Full page reload, state loss, UI collapse
**Fix**: Use TanStack Router's navigate(), await Dexie updates

### 5. Wizard Too Complex (BLOCKER)

**Location**: `src/presentation/components/project/ProjectCreationWizard.tsx`
**Impact**: 536 lines > 300 limit, 5 steps > user requirement
**Fix**: Simplify to 2-step wizard, archive current version

### 6. No 2-Level Entry System (BLOCKER)

**Location**: `src/presentation/components/hub/HubHomePage.tsx`
**Impact**: Too many entry points, confusing UX
**Fix**: Restructure hub to Recent Projects (Level 1) + Workspaces (Level 2)

---

## Recommendations

### Immediate Actions (P0)

#### 1. Fix Device Detection (ARC-Fix-01)
**File**: `src/infrastructure/filesystem/platform-contract.ts`
**Changes**:
- Remove screen width checks from `detectDeviceType()`
- Use browser capability detection only
- Ensure device type remains stable during session

**Impact**: Fixes platform detection, prevents mid-session device type changes

#### 2. Consolidate Project Creation (ARC-Fix-02)
**File**: `src/presentation/components/hub/HubHomePage.tsx`
**Changes**:
- Remove `handleNewProject()` (Path 1)
- Remove `ProjectCreationWizard` (Path 2)
- Create single `handleCreateProject()` with:
  - Platform-aware storage type detection
  - FSA handle selection (if desktop)
  - IndexedDB project creation (if mobile)
  - Proper error handling
  - Verification of Dexie persistence

**Impact**: Eliminates confusion, ensures consistent flow

#### 3. Fix Project Selection Navigation (ARC-Fix-03)
**File**: `src/presentation/components/hub/ProjectPickerDialog.tsx`
**Changes**:
- Replace `window.location.href` with `await navigate()`
- Add `await` to Dexie update
- Add project integrity validation before navigation
- Add route guard to IDE route

**Impact**: Prevents UI collapse, ensures project loads correctly

### Medium-Term Actions (P1)

#### 4. Simplify Wizard (ARC-Fix-04)
**File**: `src/presentation/components/project/ProjectCreationWizard.tsx`
**Changes**:
- Archive current 536-line wizard
- Create new 2-step wizard:
  1. Project name input
  2. Platform detection + auto-creation
- Ensure ≤300 lines per component

**Impact**: Meets user requirement, complies with governance

#### 5. Implement 2-Level Entry System (ARC-Fix-05)
**File**: `src/presentation/components/hub/HubHomePage.tsx`
**Changes**:
- Level 1: Recent Projects (5 max)
- Level 2: Workspaces (Notes, IDE, Knowledge, Study)
- Remove BentoGrid complexity
- Simplify hub navigation

**Impact**: Clear UX, meets governance requirements

### Long-Term Actions (P2)

#### 6. Add Handle Verification (ARC-Fix-06)
**File**: `src/infrastructure/filesystem/handle-persistence.ts`
**Changes**:
- Add verification after serialization
- Test handle accessibility before project creation
- Provide clear error messages on failure

**Impact**: Prevents project creation with inaccessible handles

#### 7. Add Route Guards (ARC-Fix-07)
**File**: `src/routes/ide.$projectId.tsx`
**Changes**:
- Add loader to verify project integrity
- Check FSA handle validity
- Show error if project is incomplete
- Prevent UI collapse

**Impact**: Prevents broken IDE loads

---

## Testing Recommendations

### Test Cases to Verify Fixes

#### Platform Detection
```typescript
// Test: Device type stable on resize
1. Open app on desktop (1920px)
2. Verify: deviceType === 'desktop'
3. Resize to 800px
4. Verify: deviceType === 'desktop' (NOT 'tablet')
5. Resize to 600px
6. Verify: deviceType === 'desktop' (NOT 'mobile')
```

#### Project Creation
```typescript
// Test: Project creation with verification
1. Click "Create Project"
2. Enter name
3. Click "Create"
4. Verify: Project saved to Dexie
5. Verify: Project ID is valid
6. Verify: Navigate to workspace
7. Verify: Workspace loads with project data
```

#### Project Selection
```typescript
// Test: Project selection with proper navigation
1. Click recent project
2. Verify: Last opened timestamp updated
3. Verify: Navigate to workspace (no full reload)
4. Verify: Project data loads
5. Verify: File tree loads
6. Verify: Monaco editor loads
```

#### Error Handling
```typescript
// Test: Error handling in project creation
1. Open folder picker
2. Cancel picker (abort)
3. Verify: No error shown to user (silent abort)
4. Verify: No navigation happens
5. Click "Create Project" again
6. Enter invalid name (empty)
7. Verify: Validation error shown
8. Verify: Cannot proceed
```

---

## Architecture Diagrams

### Current Flow (BROKEN)

```
┌─────────────────────────────────────────────────────────────┐
│                    HubHomePage                            │
├─────────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Project Creation (3 Paths)              │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ Path 1: handleNewProject()                     │    │
│  │   - showDirectoryPicker()                        │    │
│  │   - createProject() (no verification)           │    │
│  │   - navigate() (no validation) ❌               │    │
│  │                                                 │    │
│  │ Path 2: ProjectCreationWizard (536 lines)       │    │
│  │   - 5-step wizard (too complex)                 │    │
│  │   - createProject() (no verification)           │    │
│  │   - handleProjectCreated() (silent fail) ❌        │    │
│  │                                                 │    │
│  │ Path 3: Random folder load                        │    │
│  │   - Load folder without registration ❌             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Project Selection (Broken)                │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ ProjectPickerDialog.handleProjectSelect()           │    │
│  │   - updateLastOpened() (no await) ❌            │    │
│  │   - window.location.href (full reload) ❌          │    │
│  │   - Bypasses TanStack Router ❌                  │    │
│  │   - No route guards ❌                             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Device Detection (Broken)                 │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ detectDeviceType()                                │    │
│  │   - Uses screen.width ❌                           │    │
│  │   - Changes on resize ❌                           │    │
│  │   - Violates ADR-033 ❌                           │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Recommended Flow (FIXED)

```
┌─────────────────────────────────────────────────────────────┐
│                    HubHomePage (Fixed)                     │
├─────────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Level 1: Recent Projects              │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ - Show max 5 recent projects                     │    │
│  │ - Click → navigate to workspace                   │    │
│  │ - "Create New Project" button                    │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Level 2: Workspaces                 │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ - Notes (all platforms)                          │    │
│  │ - IDE (desktop with FSA only)                    │    │
│  │ - Knowledge (all platforms)                      │    │
│  │ - Study (all platforms)                          │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Project Creation (Single Flow)           │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ 1. Call getPlatformContract() (single source)    │    │
│  │ 2. If canAccessFSA: showDirectoryPicker()       │    │
│  │ 3. Else: Create IndexedDB project               │    │
│  │ 4. Verify Dexie persistence                     │    │
│  │ 5. Navigate to workspace                       │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Project Selection (Fixed)                │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ 1. Verify project integrity                      │    │
│  │ 2. Await Dexie update                          │    │
│  │ 3. Use TanStack Router navigate()               │    │
│  │ 4. Route guard validates project                │    │
│  │ 5. Load workspace with project data              │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Conclusion

### Summary

The hub flow has **6 critical architectural issues** causing the reported UX failures:

1. **Device detection uses screen size** → Changes on window resize
2. **Three conflicting project creation paths** → Confusion and silent failures
3. **No project creation verification** → Navigates to broken workspace
4. **Project selection bypasses router** → Full page reload, UI collapse
5. **Wizard too complex** → 536 lines, 5 steps, violates governance
6. **No 2-level entry system** → Too many entry points, confusing UX

### Impact

All issues prevent users from successfully creating and opening projects. The most critical are:

- **Platform detection**: Violates ADR-033, causes mid-session device type changes
- **Project selection**: Bypasses router, causes UI collapse and broken loads
- **Project creation**: No verification, silent failures, three conflicting paths

### Next Steps

1. **Immediate**: Fix device detection (remove screen width)
2. **Immediate**: Consolidate project creation paths
3. **Immediate**: Fix project selection navigation
4. **Short-term**: Simplify wizard to 2 steps
5. **Short-term**: Implement 2-level entry system

### Files to Modify

| Priority | File | Changes |
|----------|-------|---------|
| P0 | `src/infrastructure/filesystem/platform-contract.ts` | Remove screen width detection |
| P0 | `src/presentation/components/hub/HubHomePage.tsx` | Consolidate project creation |
| P0 | `src/presentation/components/hub/ProjectPickerDialog.tsx` | Fix navigation |
| P1 | `src/presentation/components/project/ProjectCreationWizard.tsx` | Simplify to 2 steps |
| P1 | `src/presentation/components/hub/HubHomePage.tsx` | Implement 2-level entry |
| P2 | `src/infrastructure/filesystem/handle-persistence.ts` | Add verification |
| P2 | `src/routes/ide.$projectId.tsx` | Add route guard |

---

**End of Assessment**
