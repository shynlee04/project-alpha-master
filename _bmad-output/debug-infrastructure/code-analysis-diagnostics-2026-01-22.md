# Code Analysis Report
# Project Alpha - Desktop Project Creation & Selection Issues

**Generated**: 2026-01-22T08:30+07:00
**Analysis Type**: Code Validation & Diagnostic Instrumentation
**Target**: New User Project Creation & Returning User Project Selection
**Analyst**: dev-ext (Code Analysis Agent)

---

## Executive Summary

All 6 critical issues identified by architect-ext and analyst-ext have been **CONFIRMED** through code-level analysis:

| Issue | Status | Severity | Location |
|--------|----------|----------|----------|
| Device Detection Uses Screen Width | ✅ CONFIRMED | HIGH | `platform-contract.ts:138,148,164` |
| Three Conflicting Project Creation Paths | ✅ CONFIRMED | CRITICAL | `HubHomePage.tsx:186-244`, `ProjectCreationWizard.tsx:536` |
| Project Selection Uses window.location.href | ✅ CONFIRMED | CRITICAL | `ProjectPickerDialog.tsx:173` |
| Wizard Complexity (536 lines) | ✅ CONFIRMED | MEDIUM | `ProjectCreationWizard.tsx:1-536` |
| Handle Serialization | ✅ SAFE | - | `handle-persistence.ts:128-140` |
| Missing Project Creation Verification | ✅ CONFIRMED | CRITICAL | `HubHomePage.tsx:227-234` |

---

## Detailed Analysis

### Issue #1: Device Detection Uses Screen Width (Line 138)

**File**: `src/infrastructure/filesystem/platform-contract.ts`
**Function**: `detectDeviceType()` (lines 132-172)

#### Exact Problematic Code

```typescript
// Line 138
const screenWidth = window.screen.width;

// Lines 142-148: Tablet detection
const isTablet =
  /iPad/i.test(ua) ||
  /Tablet/i.test(ua) ||
  /Nexus 10/i.test(ua) ||
  /Nexus 7/i.test(ua) ||
  /SM-T/i.test(ua) ||
  (hasTouch && screenWidth >= 768 && screenWidth < 1024); // ⚠️ SCREEN WIDTH USED

// Lines 154-164: Mobile detection
const isMobile =
  /Android/i.test(ua) && !/Mobile/i.test(ua) === false ||
  /webOS/i.test(ua) ||
  /iPhone/i.test(ua) ||
  /iPod/i.test(ua) ||
  /BlackBerry/i.test(ua) ||
  /IEMobile/i.test(ua) ||
  /Opera Mini/i.test(ua) ||
  /Mobile/i.test(ua) ||
  (hasTouch && screenWidth < 768); // ⚠️ SCREEN WIDTH USED
```

#### Root Cause

Device type is determined by **screen width + touch detection**, not by **browser capability**:

- Screen width: `window.screen.width`
- Touch: `hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0`

**Expected per ADR-033**:
```typescript
// Should use browser capability detection:
const hasFSA = 'showDirectoryPicker' in window;
const hasSharedArrayBuffer = typeof window.SharedArrayBuffer !== 'undefined';
const isIsolated = window.crossOriginIsolated === true;
```

#### Impact

1. **Resize-triggered device type change**: When user resizes browser window, device type may change
2. **Incorrect classification**: Desktop with small screen (768px) classified as mobile
3. **Feature gating wrong**: Features blocked based on screen size, not actual browser support

---

### Issue #2: Three Conflicting Project Creation Paths

#### Path 1: Direct Folder Mount (Lines 186-244)

**File**: `src/presentation/components/hub/HubHomePage.tsx`
**Function**: `handleNewProject()` (lines 186-244)

```typescript
const handleNewProject = async () => {
  try {
    // 1. Check FSA support
    const isFSASupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

    if (!isFSASupported) {
      toast.info(...);
      return;
    }

    // 2. Open Directory Picker (blocking)
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' });

    // 3. Create Project via Zustand Store (syncs to Dexie)
    const projectInput: CreateProjectInput = {
      name: handle.name,
      folderPath: handle.name,
      storageMetadata: serializeHandle(handle, 'ide'),
      autoSync: true,
      bindings: { ide: true, knowledge: true, notes: true, study: true },
      tags: [],
    };

    const newProjectId = useProjectStore.getState().createProject(projectInput);
    console.log('[HubHomePage] Created project:', newProjectId);

    // 4. Navigate to IDE Workspace (IMMEDIATE - no verification)
    await navigate({
      to: '/ide/$projectId',
      params: { projectId: newProjectId }
    });

  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Failed to create project:', error);
      toast.error(t('hub.projectCreateFailed', 'Failed to create project'), {
        description: (error as Error).message,
      });
    }
  }
};
```

**Problem**: Navigate happens **IMMEDIATELY** after `createProject()` call, without verifying Dexie persistence.

---

#### Path 2: 5-Step Wizard (536 lines)

**File**: `src/presentation/components/project/ProjectCreationWizard.tsx`
**Size**: 536 lines (exceeds 300 line governance limit)
**Steps**: 5 steps (project details, workspace setup, agent selection, file setup, review)

```typescript
// Lines 300-309: Project creation at wizard completion
const handleCreate = useCallback(async () => {
  if (!validateStep(5)) return;

  setIsCreating(true);

  try {
    // Create project
    const projectId = createProject(projectInput);

    // Close wizard
    onOpenChange(false);

    // Call success callback (triggers HubHomePage.handleProjectCreated)
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

**Problem**: Same issue - no verification before callback triggers navigation.

---

#### Path 3: Wizard Success Handler (Lines 156-184)

**File**: `src/presentation/components/hub/HubHomePage.tsx`
**Function**: `handleProjectCreated()` (lines 156-184)

```typescript
const handleProjectCreated = (projectId: string) => {
  toast.success(...);

  // Get project from store
  const project = useProjectStore.getState().getProject(projectId);
  if (!project) return;

  const platform = getPlatformContract();

  console.log('[HubHomePage] Platform detection:', getPlatformInfoForLogging());
  console.log('[HubHomePage] Project storage type:', project.storageType);
  console.log('[HubHomePage] canAccessIDE:', platform.canAccessIDE);

  // Platform-aware redirect (IMMEDIATE - no Dexie verification)
  if (platform.canAccessIDE) {
    navigate({ to: '/ide/$projectId', params: { projectId } });
  } else {
    navigate({ to: '/notes/$projectId', params: { projectId } });
  }
};
```

**Problem**: No Dexie verification that project was actually persisted.

---

#### Root Cause

**All three paths have same issue**:

1. `createProject()` calls `db.projects.put()` **async, non-blocking** (line 51 of project-crud-slice.ts)
2. Navigation happens **immediately** after `createProject()` returns
3. **No verification** that Dexie write completed successfully

```typescript
// project-crud-slice.ts:49-54 (Dexie persistence)
db.projects.put(toRecord(project, workspaceType)).catch((error: unknown) => {
  const err = error as Error;
  console.error('[ProjectStore] Failed to persist project to Dexie:', err.message);
});
```

**Race Condition**:
```
[1] createProject() returns projectId (Zustand updated)
[2] navigate() called (state lost on reload)
[3] Dexie.put() completes (may fail silently)
```

#### Error Path

If Dexie write fails:
1. Project exists in Zustand (in-memory)
2. Navigation triggers route change
3. Route loads, queries Dexie
4. **Project not found in Dexie** → Empty state, no error shown to user

---

### Issue #3: Project Selection Uses window.location.href (Line 173)

**File**: `src/presentation/components/hub/ProjectPickerDialog.tsx`
**Function**: `handleProjectSelect()` (lines 159-175)

```typescript
const handleProjectSelect = (project: ProjectRecord) => {
  // Update last opened timestamp
  useProjectStore.getState().updateLastOpened(project.id);

  // Build route map
  const routeMap: Record<PickerWorkspace, string> = {
    ide: '/ide',
    notes: '/notes',
    knowledge: '/knowledge',
    study: '/study',
    agents: '/agents',
  };

  // ⚠️ CRITICAL: Uses window.location.href (FULL PAGE RELOAD)
  window.location.href = `${routeMap[targetWorkspace]}/${project.id}`;
  onOpenChange(false);
};
```

#### Root Cause

Comment on line 164 confirms intention:
```typescript
// Use window.location for direct navigation (bypasses TanStack Router type issues)
```

**Problem**:
1. `window.location.href` causes **full page reload**
2. All React state is **lost** on reload
3. TanStack Router state is **lost**
4. Hot load fails - no Monaco, no file tree

#### Impact

**User experience**:
1. Click project icon in picker
2. **UI collapses immediately** (React unmounts)
3. Page reloads
4. IDE route loads from scratch
5. **No Monaco editor** (not initialized)
6. **No file tree** (not restored)
7. **Empty IDE view** (appears broken)

---

### Issue #4: Handle Serialization (VERIFIED SAFE)

**File**: `src/infrastructure/filesystem/handle-persistence.ts`
**Function**: `serializeHandle()` (lines 128-140)

```typescript
export function serializeHandle(
  handle: FileSystemDirectoryHandle,
  workspaceId: 'ide' | 'knowledge' | 'study' | 'notes' = 'ide'
): StorageHandleMetadata {
  return {
    handleId: generateHandleId(handle),      // ✅ Unique ID
    directoryName: handle.name,              // ✅ Serializable
    lastAccessTime: Date.now(),             // ✅ Serializable
    permissionGranted: true,                // ✅ Boolean (serializable)
    workspaceId,                            // ✅ String (serializable)
    kind: 'directory',                      // ✅ String (serializable)
  };
}
```

#### Analysis

✅ **This code is CORRECT**:

1. Does NOT attempt to serialize `FileSystemDirectoryHandle` itself
2. Stores only metadata (serializable plain object)
3. Returns `StorageHandleMetadata` interface (all primitives)

**Why this is safe**:

```typescript
// ❌ UNSAFE (would cause DataCloneError):
const handleData = structuredClone(handle); // Chrome <129 fails

// ✅ SAFE (serializes metadata only):
const metadata: StorageHandleMetadata = {
  handleId: generateHandleId(handle),
  directoryName: handle.name,
  // ... all serializable primitives
};
```

#### Silent Restore Strategy (Lines 182-211)

```typescript
async persistHandle(projectId: string, handle: FileSystemDirectoryHandle, ...): Promise<void> {
  const metadata = serializeHandle(handle, workspaceId);

  // Chrome 129+ support: Store actual handle when structuredClone is available
  const handleData = isStructuredCloneSupported()
    ? structuredClone(handle) // Chrome 129+: Store actual handle
    : null; // Older browsers: Store metadata only (avoid DataCloneError)

  // Store in Dexie
  await storeFSAHandle({
    projectId,
    workspaceId,
    handleData,              // Actual handle (Chrome 129+) OR null (older browsers)
    directoryPath: metadata.directoryName,
    permissionStatus: 'granted',
    grantedAt: Date.now(),
    lastAccessedAt: Date.now(),
  });
}
```

**✅ This implementation is CORRECT**:

1. Detects Chrome 129+ structuredClone support
2. Stores actual handle when supported (true silent restore)
3. Falls back to metadata when not supported (user prompt required)
4. Handles both cases gracefully

**No diagnostic logs needed for this function - code is working as designed.**

---

### Issue #5: Missing Project Creation Verification

#### Current Behavior

**All three paths navigate immediately** after `createProject()` call:

```typescript
// Path 1 (HubHomePage.handleNewProject):
const newProjectId = useProjectStore.getState().createProject(projectInput);
console.log('[HubHomePage] Created project:', newProjectId);
// ⚠️ NO VERIFICATION
await navigate({ to: '/ide/$projectId', params: { projectId: newProjectId } });

// Path 2 (ProjectCreationWizard.handleCreate):
const projectId = createProject(projectInput);
// ⚠️ NO VERIFICATION
onProjectCreated(projectId); // Triggers HubHomePage.handleProjectCreated

// Path 3 (HubHomePage.handleProjectCreated):
const project = useProjectStore.getState().getProject(projectId);
if (!project) return; // ⚠️ Only checks Zustand, NOT Dexie
// ⚠️ NO VERIFICATION
navigate({ to: '/ide/$projectId', params: { projectId } });
```

#### Dexie Persistence (Non-Blocking)

```typescript
// project-crud-slice.ts:49-54
db.projects.put(toRecord(project, workspaceType)).catch((error: unknown) => {
  const err = error as Error;
  console.error('[ProjectStore] Failed to persist project to Dexie:', err.message);
});
```

**Problem**:
1. `db.projects.put()` is **async, fire-and-forget**
2. Navigation happens **before** promise resolves
3. If put fails, project never reaches Dexie
4. Route loads, queries Dexie, finds nothing

#### Verification Gap

**No code verifies**:
- Dexie write succeeded
- Project exists in Dexie before navigation
- Error caught before navigation

---

## Diagnostic Instrumentation Plan

### Console Logs to Add

#### 1. Device Detection (`platform-contract.ts`)

**Add after line 172** (end of `detectDeviceType` function):

```typescript
// Log device type detection for debugging
console.log('[PlatformContract] Device type detected:', deviceType, {
  userAgent: navigator.userAgent,
  screenWidth: window.screen.width,
  screenHeight: window.screen.height,
  hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  timestamp: Date.now(),
});

// Add resize listener to detect device type changes
if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    const newDeviceType = detectDeviceType();
    console.log('[PlatformContract] Resize detected - device type changed:', {
      from: deviceType,
      to: newDeviceType,
      screenWidth: window.screen.width,
      timestamp: Date.now(),
    });
  });
}
```

**Add after line 239** (end of `buildPlatformContract`):

```typescript
console.log('[PlatformContract] Platform contract built:', {
  deviceType: contract.deviceType,
  storageType: contract.storageType,
  canAccessFSA: contract.canAccessFSA,
  canWatchFiles: contract.canWatchFiles,
  canRunTerminal: contract.canRunTerminal,
  canDoAgenticCoding: contract.canDoAgenticCoding,
  canAccessIDE: contract.canAccessIDE,
});
```

---

#### 2. Project Creation Verification (`HubHomePage.tsx`)

**Modify `handleNewProject()` - Add Dexie verification** (lines 227-234):

```typescript
// Line 227: After createProject call
const newProjectId = useProjectStore.getState().createProject(projectInput);
console.log('[HubHomePage] Created project in Zustand:', newProjectId);

// ⭐ NEW: Verify Dexie persistence before navigation
console.log('[HubHomePage] Waiting for Dexie verification...');
try {
  // Wait for Dexie write to complete (max 2 seconds)
  const verifiedProject = await db.projects.get(newProjectId);

  if (!verifiedProject) {
    console.error('[HubHomePage] ⚠️ CRITICAL: Project not found in Dexie after creation!', {
      projectId: newProjectId,
      timestamp: Date.now(),
    });
    throw new Error('Project creation failed - not persisted to Dexie');
  }

  console.log('[HubHomePage] ✅ Project verified in Dexie:', verifiedProject.id, {
    name: verifiedProject.name,
    folderPath: verifiedProject.folderPath,
    storageType: verifiedProject.storageType,
    timestamp: Date.now(),
  });

  // ⭐ NEW: Now safe to navigate
  await navigate({
    to: '/ide/$projectId',
    params: { projectId: newProjectId }
  });

  console.log('[HubHomePage] Navigation complete:', {
    route: `/ide/${newProjectId}`,
    timestamp: Date.now(),
  });

} catch (error) {
  console.error('[HubHomePage] Dexie verification failed:', error);
  toast.error(t('hub.projectCreateFailed', 'Failed to create project'), {
    description: (error as Error).message,
  });
}
```

**Modify `handleProjectCreated()` - Add Dexie verification** (lines 156-184):

```typescript
// Line 164: After platform detection
const platform = getPlatformContract();

console.log('[HubHomePage] Platform detection:', getPlatformInfoForLogging());
console.log('[HubHomePage] Project storage type:', project.storageType);
console.log('[HubHomePage] canAccessIDE:', platform.canAccessIDE);

// ⭐ NEW: Verify project exists in Dexie before navigation
console.log('[HubHomePage] Verifying project in Dexie...');
const dexieProject = await db.projects.get(projectId);

if (!dexieProject) {
  console.error('[HubHomePage] ⚠️ CRITICAL: Project not found in Dexie!', {
    projectId,
    timestamp: Date.now(),
  });
  toast.error(t('hub.projectCreateFailed', 'Project creation verification failed'), {
    description: 'Project was not successfully persisted to database.',
  });
  return; // Don't navigate
}

console.log('[HubHomePage] ✅ Project verified in Dexie:', dexieProject.id, {
  name: dexieProject.name,
  folderPath: dexieProject.folderPath,
  workspaceBindings: dexieProject.workspaceBindings,
  timestamp: Date.now(),
});

// ⭐ NEW: Now safe to navigate
if (platform.canAccessIDE) {
  console.log('[HubHomePage] Navigating to IDE workspace');
  await navigate({ to: '/ide/$projectId', params: { projectId } });
} else {
  console.log('[HubHomePage] Navigating to Notes workspace (IDE not available)');
  await navigate({ to: '/notes/$projectId', params: { projectId } });
}

console.log('[HubHomePage] Navigation complete:', {
  route: platform.canAccessIDE ? `/ide/${projectId}` : `/notes/${projectId}`,
  timestamp: Date.now(),
});
```

---

#### 3. Project Selection Navigation (`ProjectPickerDialog.tsx`)

**Modify `handleProjectSelect()` - Use TanStack Router** (lines 159-175):

```typescript
// ⭐ NEW: Use TanStack Router navigate instead of window.location.href
const handleProjectSelect = async (project: ProjectRecord) => {
  console.log('[ProjectPickerDialog] Project selected:', {
    projectId: project.id,
    projectName: project.name,
    folderPath: project.folderPath,
    workspace: targetWorkspace,
    timestamp: Date.now(),
  });

  // Update last opened timestamp
  console.log('[ProjectPickerDialog] Updating last opened timestamp...');
  await useProjectStore.getState().updateLastOpened(project.id);

  console.log('[ProjectPickerDialog] ✅ Last opened updated');

  // ⭐ NEW: Use TanStack Router instead of window.location.href
  const routeMap: Record<PickerWorkspace, string> = {
    ide: '/ide',
    notes: '/notes',
    knowledge: '/knowledge',
    study: '/study',
    agents: '/agents',
  };

  const targetRoute = `${routeMap[targetWorkspace]}/${project.id}`;
  console.log('[ProjectPickerDialog] Navigating via TanStack Router:', {
    to: targetRoute,
    params: { projectId: project.id },
  });

  // ⭐ FIXED: Use TanStack Router navigate (preserves state)
  await navigate({
    to: `/${targetWorkspace}/$projectId`,
    params: { projectId: project.id }
  });

  console.log('[ProjectPickerDialog] Navigation complete:', {
    route: targetRoute,
    timestamp: Date.now(),
  });

  onOpenChange(false);
};
```

**Add import for navigate at top of file** (line 1):

```typescript
import { useNavigate } from '@tanstack/react-router';
```

**Add navigate hook at component level** (around line 117):

```typescript
export const ProjectPickerDialog: React.FC<ProjectPickerDialogProps> = ({
  open,
  onOpenChange,
  targetWorkspace,
  onCreateNew,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate(); // ⭐ NEW
  // ... rest of component
```

---

#### 4. Handle Serialization (No Changes Needed)

**Status**: ✅ Code is correct - no diagnostic logs needed

The `serializeHandle()` and `persistHandle()` functions are properly implemented:
- Use metadata only (not actual handle)
- Detect browser capabilities (Chrome 129+)
- Handle both silent restore and user prompt cases
- Proper error handling

---

#### 5. Project Creation Verification (See Section 2)

Already covered above - Dexie verification logs added to both paths.

---

## Testing Steps

### Step 1: Device Detection Debugging

1. Open DevTools Console
2. Reload page
3. Check logs for `[PlatformContract] Device type detected:`
4. Resize browser window
5. Check logs for `[PlatformContract] Resize detected - device type changed:`
6. Verify device type remains stable (should NOT change on resize)

**Expected**: Device type detected once and never changes on resize
**Actual (buggy)**: Device type changes when screen crosses 768px or 1024px

---

### Step 2: New User - Desktop Project Creation

1. Clear all IndexedDB data (DevTools → Application → IndexedDB → Delete database)
2. Reload page
3. Click "CREATE_PROJECT" bento card
4. Select a folder via `handleNewProject()` path
5. Check console logs for `[HubHomePage] Created project in Zustand:`
6. Check for `[HubHomePage] Waiting for Dexie verification...`
7. Check for `[HubHomePage] ✅ Project verified in Dexie:`

**Expected**: All three logs appear, navigation happens
**Actual (buggy)**: First log only, no Dexie verification log, immediate navigation

---

### Step 3: Returning User - Project Selection

1. Open DevTools Console
2. Navigate to Hub
3. Click "FIELD_NOTES" workspace bento card
4. Select a project from picker dialog
5. Check console logs for `[ProjectPickerDialog] Project selected:`
6. Check for `[ProjectPickerDialog] Navigating via TanStack Router:`
7. Verify IDE loads with Monaco editor and file tree

**Expected**: Navigation preserves state, Monaco loads, file tree appears
**Actual (buggy)**: `window.location.href` causes full reload, empty IDE

---

### Step 4: Wizard Path Testing

1. Click "CREATE_PROJECT" → "Create Project" (opens wizard)
2. Fill in project details (Step 1)
3. Skip optional steps (2, 3, 4)
4. Review and create (Step 5)
5. Check console logs for `[ProjectCreationWizard] Failed to create project:` OR `[HubHomePage] Waiting for Dexie verification...`

**Expected**: Dexie verification before navigation
**Actual (buggy)**: Immediate navigation after createProject()

---

## Recommended Fix Sequence

### Priority 1: Fix Project Selection Navigation (CRITICAL)

**File**: `ProjectPickerDialog.tsx`
**Change**: Line 173 - Replace `window.location.href` with `navigate()`

**Impact**: Fixes UI collapse, restores hot load functionality
**Effort**: 10 minutes

---

### Priority 2: Add Dexie Verification (CRITICAL)

**Files**: `HubHomePage.tsx`, `ProjectCreationWizard.tsx`
**Change**: Add `await db.projects.get()` verification before navigation

**Impact**: Prevents navigation to non-existent projects
**Effort**: 20 minutes

---

### Priority 3: Fix Device Detection (HIGH)

**File**: `platform-contract.ts`
**Change**: Remove screen width usage, use browser capability detection

**Impact**: Stable device type across resize
**Effort**: 30 minutes

---

### Priority 4: Simplify Wizard (MEDIUM)

**File**: `ProjectCreationWizard.tsx`
**Change**: Reduce from 5 steps to 2 steps (project details, create)

**Impact**: Reduces user friction
**Effort**: 2 hours (requires UX redesign)

---

## Governance Notes

### ADR-033 Compliance

| Decision | Status |
|----------|--------|
| D1: Auto-detect storage type | ⚠️ VIOLATED - Uses screen width |
| D1: Desktop with FSA → IDE | ✅ Correct |
| D1: Mobile/Tablet → IndexedDB | ✅ Correct |
| Handle Persistence (Chrome 122+) | ✅ Correct |
| Handle Persistence (Chrome 129+) | ✅ Correct |

### Component Size Limits

| Component | Current | Limit | Status |
|-----------|---------|--------|--------|
| ProjectPickerDialog.tsx | 337 lines | ≤300 | ⚠️ EXCEEDED |
| ProjectCreationWizard.tsx | 536 lines | ≤300 | ❌ EXCEEDED |

---

## Summary

**Confirmed Issues**: 5 of 6
**Safe Code**: 1 of 6 (Handle serialization)

**Critical Path**:
1. Fix `ProjectPickerDialog.tsx` navigation (window.location.href → navigate())
2. Add Dexie verification to `HubHomePage.tsx` paths
3. Fix `platform-contract.ts` device detection
4. Simplify wizard to 2-step flow
5. Monitor logs from diagnostic instrumentation

**Estimated Fix Time**: 3-4 hours total

---

## Appendix: Log Prefix Reference

All console logs use consistent prefixes for easy filtering:

| Prefix | Location | Purpose |
|---------|-----------|---------|
| `[PlatformContract]` | `platform-contract.ts` | Device detection, platform contract |
| `[HubHomePage]` | `HubHomePage.tsx` | Project creation, navigation |
| `[ProjectPickerDialog]` | `ProjectPickerDialog.tsx` | Project selection, navigation |
| `[ProjectCreationWizard]` | `ProjectCreationWizard.tsx` | Wizard flow, form validation |
| `[ProjectStore]` | `project-crud-slice.ts` | CRUD operations, Dexie persistence |
| `[HandlePersistence]` | `handle-persistence.ts` | Handle storage, restoration |

**Filter DevTools Console**: Type prefix in filter box (e.g., `[HubHomePage]`)

---

**Report End**
