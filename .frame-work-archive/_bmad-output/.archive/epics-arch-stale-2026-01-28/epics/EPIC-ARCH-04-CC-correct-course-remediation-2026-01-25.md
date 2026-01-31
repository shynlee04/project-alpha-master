# EPIC-ARCH-04-CC: Correct-Course Remediation - FSA Handle Lifecycle

> **Epic ID**: EPIC-ARCH-04-CC
> **Parent**: EPIC-ARCH-04
> **Created**: 2026-01-25T22:45:00+07:00
> **Priority**: P0 (CRITICAL BLOCKER - Blocks All Phases)
> **Status**: READY_FOR_SPRINT
> **Estimated Effort**: 4-6 hours
> **Author**: bmad-master (Orchestrator)
> **Approved By**: User (Product Owner)
> **Target**: Fix architectural-level FSA handle lifecycle integration

---

## Document Governance

### Parent Documents

| Document | Path | Purpose |
|----------|------|---------|
| **ARCH-04 Correct-Course Report** | `_bmad-output/planning-artifacts/ARCH-04-CORRECT-COURSE-2026-01-25.md` | Root cause analysis |
| **ARCH-04-03 Classification** | `_bmad-output/handoffs/2026-01-25/ARCH-04-03-CLASSIFICATION-2026-01-25.md` | Flaw classification |
| **ARCH-04-03 Validation** | `_bmad-output/handoffs/2026-01-25/ARCH-04-03-VALIDATION-2026-01-25.md` | Validation failure evidence |
| **Architect Decision** | `_bmad-output/planning-artifacts/ARCH-DECISION-2026-01-25.md` | Decision to execute Option A |
| **ADR-034** | `_bmad-output/planning-artifacts/adr/ADR-034-project-centric-architecture-2026-01-20.md` | Architecture requirements |
| **EPIC-ARCH-04** | `_bmad-output/planning-artifacts/epics/EPIC-ARCH-04-complete-migration-2026-01-25.md` | Original epic (incomplete) |

### Child Documents (Created by This Epic)

| Document | Path | Purpose |
|----------|------|---------|
| **Sprint Handoff** | `_bmad-output/handoffs/2026-01-25/EPIC-ARCH-04-CC-SPRINT-HANDOFF-2026-01-25.md` | Execution guide |
| **Completion Evidence** | `_bmad-output/handoffs/2026-01-25/EPIC-ARCH-04-CC-EVIDENCE-2026-01-25.md` | Validation proof |

---

## Executive Summary

### The Problem

EPIC-ARCH-04 stories (ARCH-04-01, ARCH-04-02, ARCH-04-03) were marked "complete" but **validation revealed they were NOT actually integrated**. The ProjectContextProvider is missing critical FSA handle lifecycle wiring, making the app non-functional for all desktop FSA projects.

### Root Cause

```
CLAIMED (In Dev Reports):          ACTUAL (In Code):
─────────────────────────          ─────────────────
initialHandle prop added    →      ❌ NOT in Props interface
restoreHandle() called      →      ❌ NOT called in initializeProject()
handle passed to factory    →      ❌ factory receives undefined
overlay triggered           →      ❌ showPermissionOverlay never set true
```

### The Fix

This epic provides **exact code changes** with line numbers, verification commands, and evidence requirements. No ambiguity - dev-team executes precisely as specified.

---

## Gap Analysis (Code Evidence)

### Current State of `src/infrastructure/context/project-context.tsx`

| Line | Expected | Actual | Gap |
|------|----------|--------|-----|
| 148-151 | `interface Props { initialHandle?: FileSystemDirectoryHandle }` | `interface Props { projectId: string; children: ReactNode }` | **MISSING PROP** |
| ~200 | `await handlePersistenceService.restoreHandle(projectId)` | Not present | **MISSING CALL** |
| ~207 | `createAdapter({ handle: fsaHandle })` | `createAdapter({ projectId, storageType })` | **MISSING HANDLE** |
| ~170 | `setShowPermissionOverlay(true)` when needed | State exists but never set | **NEVER TRIGGERED** |
| ~54-61 | Persist handle in onPermissionGranted | Only hides overlay | **MISSING PERSIST** |

---

## Stories

### CC-01: Add initialHandle Prop and FSA Restore Logic

> **Priority**: P0 | **Effort**: 2 hours | **Dependencies**: None
> **Assigned To**: dev-ext | **Blocking**: CC-02, CC-03

#### Problem Statement

`ProjectContextProvider` at `src/infrastructure/context/project-context.tsx` does not:
1. Accept `initialHandle` prop from route
2. Call `handlePersistenceService.restoreHandle()` for FSA projects
3. Pass restored/initial handle to `StorageAdapterFactory`

#### Exact Code Changes Required

**File**: `src/infrastructure/context/project-context.tsx`

##### Change 1: Add Import (Top of File)

```typescript
// ADD after line ~37 (after other infrastructure imports)
import { handlePersistenceService } from '@/infrastructure/filesystem/handle-persistence';
import type { HandleRestoreResult } from '@/infrastructure/filesystem/handle-persistence';
```

##### Change 2: Update Props Interface

```typescript
// FIND (around line 148-151):
interface Props {
  projectId: string;
  children: ReactNode;
}

// REPLACE WITH:
interface Props {
  projectId: string;
  children: ReactNode;
  initialHandle?: FileSystemDirectoryHandle | null;
}
```

##### Change 3: Destructure initialHandle in Component

```typescript
// FIND (around line 155):
export function ProjectContextProvider({ projectId, children }: Props) {

// REPLACE WITH:
export function ProjectContextProvider({ projectId, children, initialHandle }: Props) {
```

##### Change 4: Add FSA Handle State

```typescript
// ADD after line ~168 (after other useState declarations):
const [fsaHandle, setFsaHandle] = useState<FileSystemDirectoryHandle | null>(
  initialHandle || null
);
```

##### Change 5: Add FSA Handle Restoration Logic in initializeProject()

```typescript
// FIND the initializeProject function (around line 177)
// FIND where loadedProject is checked for storageType (around line 195-200)
// ADD this block BEFORE the storageAdapterFactory.createAdapter call:

// === FSA HANDLE LIFECYCLE - START ===
let resolvedHandle: FileSystemDirectoryHandle | null = fsaHandle;

if (loadedProject.storageType === 'fsa') {
  // Use initialHandle if available (from wizard navigation)
  if (initialHandle) {
    console.log('[ProjectContext] Using initialHandle from navigation');
    resolvedHandle = initialHandle;
    setFsaHandle(initialHandle);
    // Persist for future visits
    try {
      await handlePersistenceService.persistHandle(projectId, initialHandle, 'ide');
      console.log('[ProjectContext] Handle persisted successfully');
    } catch (persistError) {
      console.warn('[ProjectContext] Failed to persist handle:', persistError);
    }
  } else {
    // Try to restore from IndexedDB
    console.log('[ProjectContext] Attempting FSA handle restoration');
    try {
      const restoreResult: HandleRestoreResult = await handlePersistenceService.restoreHandle(projectId);
      
      if (restoreResult.success && restoreResult.handle) {
        console.log('[ProjectContext] FSA handle restored successfully');
        resolvedHandle = restoreResult.handle;
        setFsaHandle(restoreResult.handle);
      } else if (restoreResult.requiresUserInteraction) {
        console.log('[ProjectContext] FSA handle requires user interaction - showing overlay');
        setShowPermissionOverlay(true);
        setLoading(false);
        return; // Wait for user to grant permission via overlay
      } else {
        console.error('[ProjectContext] FSA handle restoration failed:', restoreResult.error);
        setError(`Failed to restore file access: ${restoreResult.error || 'Unknown error'}`);
        setLoading(false);
        return;
      }
    } catch (restoreError) {
      console.error('[ProjectContext] FSA handle restoration error:', restoreError);
      setShowPermissionOverlay(true);
      setLoading(false);
      return;
    }
  }
}
// === FSA HANDLE LIFECYCLE - END ===
```

##### Change 6: Pass Handle to StorageAdapterFactory

```typescript
// FIND (around line 207-214):
const storageAdapter = storageAdapterFactory.createAdapter({
  projectId,
  storageType: loadedProject.storageType,
});

// REPLACE WITH:
const storageAdapter = storageAdapterFactory.createAdapter({
  projectId,
  storageType: loadedProject.storageType,
  handle: resolvedHandle,  // ← ADD THIS
});
```

#### Verification Commands

```bash
# 1. TypeScript check (MUST pass)
pnpm tsc --noEmit 2>&1 | tee /tmp/cc-01-tsc-output.txt
echo "TSC Exit Code: $?"

# 2. Verify import exists
grep -n "handlePersistenceService" src/infrastructure/context/project-context.tsx

# 3. Verify initialHandle prop exists
grep -n "initialHandle" src/infrastructure/context/project-context.tsx

# 4. Verify handle passed to factory
grep -n "handle:" src/infrastructure/context/project-context.tsx
```

#### Acceptance Criteria

| AC ID | Criterion | Verification Method | Required Output |
|-------|-----------|---------------------|-----------------|
| CC-01-1 | `initialHandle` prop in Props interface | `grep -n "initialHandle" project-context.tsx` | Line with `initialHandle?: FileSystemDirectoryHandle` |
| CC-01-2 | `handlePersistenceService` imported | `grep -n "handlePersistenceService" project-context.tsx` | Import line present |
| CC-01-3 | `restoreHandle()` called for FSA projects | Code inspection | Block with `handlePersistenceService.restoreHandle(projectId)` |
| CC-01-4 | `handle` passed to `createAdapter()` | `grep -n "handle:" project-context.tsx` | `handle: resolvedHandle` in createAdapter call |
| CC-01-5 | TypeScript compiles | `pnpm tsc --noEmit` | Exit code 0 |

#### Evidence Required

- [ ] Screenshot or text file of `pnpm tsc --noEmit` output showing 0 errors
- [ ] `grep` outputs for all 4 verification commands

---

### CC-02: Wire PermissionOverlay with Persist and Reinit

> **Priority**: P0 | **Effort**: 1.5 hours | **Dependencies**: CC-01
> **Assigned To**: dev-ext

#### Problem Statement

The `onPermissionGranted` callback in ProjectContextProvider only hides the overlay. It must:
1. Persist the granted handle for future visits
2. Reinitialize the project loading flow with the new handle

#### Exact Code Changes Required

**File**: `src/infrastructure/context/project-context.tsx`

##### Change 1: Update onPermissionGranted Handler

```typescript
// FIND the PermissionOverlay render block (around line 320-340)
// FIND the onPermissionGranted callback
// It likely looks like:
onPermissionGranted={(handle) => {
  setShowPermissionOverlay(false);
}}

// REPLACE WITH:
onPermissionGranted={async (handle: FileSystemDirectoryHandle) => {
  console.log('[ProjectContext] Permission granted, processing handle');
  
  // 1. Set the handle in state
  setFsaHandle(handle);
  
  // 2. Persist handle for future visits
  try {
    await handlePersistenceService.persistHandle(projectId, handle, 'ide');
    console.log('[ProjectContext] Handle persisted for future visits');
  } catch (persistError) {
    console.warn('[ProjectContext] Failed to persist handle:', persistError);
  }
  
  // 3. Hide overlay
  setShowPermissionOverlay(false);
  
  // 4. Trigger reinitialization by resetting loading state
  // The useEffect watching projectId will re-run initializeProject
  setLoading(true);
  setError(null);
  setProject(null);
  
  console.log('[ProjectContext] Reinitialization triggered');
}}
```

##### Change 2: Ensure useEffect Re-runs on Handle Change

```typescript
// FIND the useEffect that calls initializeProject (around line 260-275)
// It likely has dependency array: [projectId]
// ADD fsaHandle to dependencies to trigger reinit when handle changes:

// BEFORE:
useEffect(() => {
  initializeProject();
}, [projectId]);

// AFTER:
useEffect(() => {
  initializeProject();
}, [projectId, fsaHandle]);  // ← ADD fsaHandle
```

##### Change 3: Add Explicit Cancel Control (Optional Enhancement)

```typescript
// FIND the onCancel prop in PermissionOverlay render
// Ensure it navigates to hub:
onCancel={() => {
  console.log('[ProjectContext] User cancelled permission - returning to hub');
  navigate({ to: '/' });
}}
```

#### Verification Commands

```bash
# 1. TypeScript check
pnpm tsc --noEmit 2>&1 | tee /tmp/cc-02-tsc-output.txt

# 2. Verify onPermissionGranted has persistHandle call
grep -A 15 "onPermissionGranted" src/infrastructure/context/project-context.tsx | grep "persistHandle"

# 3. Verify useEffect has fsaHandle dependency
grep -A 3 "initializeProject" src/infrastructure/context/project-context.tsx | grep "fsaHandle"
```

#### Acceptance Criteria

| AC ID | Criterion | Verification Method | Required Output |
|-------|-----------|---------------------|-----------------|
| CC-02-1 | `onPermissionGranted` calls `persistHandle` | grep verification | persistHandle call in callback |
| CC-02-2 | `onPermissionGranted` triggers reinit | Code inspection | setLoading(true) in callback |
| CC-02-3 | useEffect depends on fsaHandle | grep verification | fsaHandle in dependency array |
| CC-02-4 | TypeScript compiles | `pnpm tsc --noEmit` | Exit code 0 |

#### Evidence Required

- [ ] Screenshot or text file of `pnpm tsc --noEmit` output showing 0 errors
- [ ] `grep` outputs for verification commands

---

### CC-03: Wire Route to Pass initialHandle

> **Priority**: P0 | **Effort**: 1 hour | **Dependencies**: CC-01
> **Assigned To**: dev-ext

#### Problem Statement

The `/$projectId` route must:
1. Extract `fsaHandle` from navigation state (passed by wizard)
2. Pass it to `ProjectContextProvider` as `initialHandle` prop

#### Exact Code Changes Required

**File**: `src/routes/$projectId.tsx`

##### Change 1: Import useLocation

```typescript
// ADD import if not present:
import { useLocation } from '@tanstack/react-router';
```

##### Change 2: Extract Handle from Navigation State

```typescript
// FIND the route component function (likely named ProjectRoute or similar)
// ADD after useParams:

const { projectId } = Route.useParams();
const location = useLocation();

// Extract FSA handle from navigation state (from wizard)
const initialHandle = React.useMemo(() => {
  const state = location.state as { fsaHandle?: FileSystemDirectoryHandle } | undefined;
  if (state?.fsaHandle) {
    console.log('[Route] Extracted FSA handle from navigation state');
    return state.fsaHandle;
  }
  return null;
}, [location.state]);
```

##### Change 3: Pass initialHandle to Provider

```typescript
// FIND the ProjectContextProvider usage
// ADD initialHandle prop:

return (
  <ProjectContextProvider 
    projectId={projectId}
    initialHandle={initialHandle}  // ← ADD THIS
  >
    {/* ... rest of children */}
  </ProjectContextProvider>
);
```

#### Verification Commands

```bash
# 1. TypeScript check
pnpm tsc --noEmit 2>&1 | tee /tmp/cc-03-tsc-output.txt

# 2. Verify initialHandle is passed
grep -n "initialHandle" src/routes/\$projectId.tsx
```

#### Acceptance Criteria

| AC ID | Criterion | Verification Method | Required Output |
|-------|-----------|---------------------|-----------------|
| CC-03-1 | useLocation imported | grep verification | Import line present |
| CC-03-2 | Handle extracted from location.state | Code inspection | useMemo block present |
| CC-03-3 | initialHandle passed to provider | grep verification | `initialHandle={...}` in JSX |
| CC-03-4 | TypeScript compiles | `pnpm tsc --noEmit` | Exit code 0 |

#### Evidence Required

- [ ] Screenshot or text file of `pnpm tsc --noEmit` output showing 0 errors
- [ ] `grep` output showing initialHandle usage

---

### CC-04: End-to-End Validation with Evidence Capture

> **Priority**: P0 | **Effort**: 1.5 hours | **Dependencies**: CC-01, CC-02, CC-03
> **Assigned To**: real-world-validator OR dev-ext

#### Test Scenarios

##### Scenario 1: New FSA Project Creation

```
STEPS:
1. Start dev server: pnpm dev
2. Open http://localhost:3000 (or configured port)
3. Click "Create Project"
4. Enter project name: "Test FSA Project"
5. Click "Pick Folder" button
6. Select a folder with some files
7. Click "Create"

EXPECTED:
✓ No permission overlay appears (handle from wizard)
✓ Project page loads immediately
✓ File tree shows folder contents
✓ Console shows: "[ProjectContext] Using initialHandle from navigation"
✓ Console shows: "[ProjectContext] Handle persisted successfully"

EVIDENCE REQUIRED:
□ Screenshot of file tree with files visible
□ Console log screenshot showing success messages
```

##### Scenario 2: FSA Project Reload (Silent Restore)

```
STEPS:
1. After Scenario 1, reload the browser page (F5)
2. Wait for project to load

EXPECTED:
✓ No permission overlay appears (Chrome 122+ silent restore)
✓ Project loads automatically
✓ File tree shows folder contents
✓ Console shows: "[ProjectContext] FSA handle restored successfully"

EVIDENCE REQUIRED:
□ Screenshot of file tree after reload
□ Console log screenshot showing restore success
```

##### Scenario 3: FSA Project Load (Permission Required)

```
STEPS:
1. Clear IndexedDB for the site (DevTools > Application > IndexedDB > Delete)
2. Navigate directly to project URL (http://localhost:3000/[projectId])
3. Observe permission overlay

EXPECTED:
✓ Permission overlay appears with 8-bit styling
✓ "Grant Access" button visible
✓ Click "Grant Access"
✓ Folder picker appears
✓ Select the correct folder
✓ Project loads with file tree
✓ Console shows: "[ProjectContext] Permission granted, processing handle"
✓ Console shows: "[ProjectContext] Handle persisted for future visits"
✓ Console shows: "[ProjectContext] Reinitialization triggered"

EVIDENCE REQUIRED:
□ Screenshot of permission overlay
□ Screenshot of file tree after granting permission
□ Console log screenshot showing permission flow
```

##### Scenario 4: IndexedDB Project (Control)

```
STEPS:
1. Create a new project with IndexedDB storage (mobile simulation or explicit selection)
2. Observe project creation

EXPECTED:
✓ No permission overlay (IndexedDB doesn't need FSA)
✓ Project loads normally
✓ No errors in console

EVIDENCE REQUIRED:
□ Screenshot of project page
□ Console showing no errors
```

#### TypeScript Final Verification

```bash
# Run and capture to file
pnpm tsc --noEmit 2>&1 | tee /tmp/cc-final-tsc-output.txt
echo "Final TSC Exit Code: $?" >> /tmp/cc-final-tsc-output.txt

# Build verification
pnpm build 2>&1 | tee /tmp/cc-final-build-output.txt
echo "Final Build Exit Code: $?" >> /tmp/cc-final-build-output.txt
```

#### Acceptance Criteria

| AC ID | Criterion | Verification Method |
|-------|-----------|---------------------|
| CC-04-1 | Scenario 1 passes | Manual test + screenshots |
| CC-04-2 | Scenario 2 passes | Manual test + screenshots |
| CC-04-3 | Scenario 3 passes | Manual test + screenshots |
| CC-04-4 | Scenario 4 passes | Manual test + screenshots |
| CC-04-5 | No console errors about "No directory access" | Console inspection |
| CC-04-6 | No "Invalid hook call" errors | Console inspection |
| CC-04-7 | TypeScript: 0 errors | tsc output file |
| CC-04-8 | Build succeeds | build output file |

#### Evidence Package Required

Create `_bmad-output/handoffs/2026-01-25/EPIC-ARCH-04-CC-EVIDENCE-2026-01-25.md` with:

```markdown
# EPIC-ARCH-04-CC Evidence Package

## TypeScript Verification
[Paste contents of /tmp/cc-final-tsc-output.txt]

## Build Verification
[Paste contents of /tmp/cc-final-build-output.txt]

## Scenario 1: New FSA Project
[Screenshot or description]
Console Logs:
[Paste relevant console logs]

## Scenario 2: FSA Reload
[Screenshot or description]
Console Logs:
[Paste relevant console logs]

## Scenario 3: Permission Flow
[Screenshot or description]
Console Logs:
[Paste relevant console logs]

## Scenario 4: IndexedDB Project
[Screenshot or description]
Console Logs:
[Paste relevant console logs]

## Attestation
- All scenarios passed: YES/NO
- All console logs captured: YES/NO
- TypeScript errors: 0
- Build status: SUCCESS/FAIL
- Completed by: [agent-name]
- Timestamp: [ISO timestamp]
```

---

## Implementation Order

```
CC-01 (FSA Handle Lifecycle)    ← START HERE - GATE
    │
    ├── CC-02 (Permission Persist/Reinit)
    │
    └── CC-03 (Route Handle Passing)
              │
              └── CC-04 (E2E Validation) ← GATE TO COMPLETION
```

---

## Success Metrics

| Metric | Before | After |
|--------|--------|-------|
| FSA project creation | ❌ Error | ✅ Works |
| FSA project reload | ❌ Error | ✅ Silent restore |
| Permission overlay | ❌ Never shown | ✅ Shows when needed |
| Handle persistence | ❌ Not called | ✅ Persists on grant |
| Handle restoration | ❌ Not called | ✅ Restores on load |
| TypeScript | ⏳ Timeout | ✅ 0 errors |
| Build | ⏳ Unknown | ✅ Success |

---

## Rollback Plan

If CC-01/02/03 fail and cannot be fixed:

1. Restore OLD ProjectContext from `_bmad-ext/.archive/ProjectContext-2026-01-25.tsx`
2. Update route imports to use OLD context
3. Accept temporary regression to previous (non-project-centric) architecture
4. Re-plan ARCH-04 with more detailed specifications

---

## Unblocks

Upon completion of this epic:

| Phase | Status Change |
|-------|---------------|
| Phase 1A: Non-AI Core | ⛔ BLOCKED → ✅ UNBLOCKED |
| Phase 1B: BYOK + Notes | Waiting → Ready to plan |
| Phase 2: Chat + Agents | Waiting |
| Phase 3: Advanced | Waiting |

---

## Handoff Signature

```yaml
artifact_id: "epic_arch_04_cc_20260125_v1"
artifact_type: "epic"
created_by: "bmad-master"
approved_by: "user"
created_at: "2026-01-25T22:45:00+07:00"
priority: "P0"
target_agents: ["sprint-manager", "dev-ext", "real-world-validator"]
estimated_hours: 4-6
stories: 4
blocking: true

dependencies:
  - "ARCH-04-CORRECT-COURSE-2026-01-25.md"
  - "ARCH-04-03-CLASSIFICATION-2026-01-25.md"
  - "ARCH-04-03-VALIDATION-2026-01-25.md"

unblocks:
  - "Phase-1A"
  - "Phase-1B"
  - "Phase-2"
  - "Phase-3"

evidence_required:
  - "TypeScript tsc output (0 errors)"
  - "Build output (success)"
  - "4 scenario screenshots/logs"
  - "Evidence package markdown"
```
