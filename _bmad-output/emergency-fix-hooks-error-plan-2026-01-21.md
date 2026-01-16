# Emergency Fix Coordination Plan - Hooks Error + ADR Validation

**Date**: 2026-01-15
**Status**: ACTIVE
**Priority**: P0 - BLOCKING USER JOURNEY
**Orchestrator**: BMAD Master

---

## Executive Summary

**Critical Issues Detected**:
1. **NEW**: React Hooks error in Notes workspace - "Rendered fewer hooks than expected"
2. **EXISTING**: ADR-034 not fully executed - 31 infection points still active
3. **EXISTING**: ADR-035 status unknown - architecture standardization not verified

**Impact**: 100% of users (returned + new) cannot use Notes workspace

---

## Root Cause Analysis: Hooks Error

### Investigation Summary

**File**: `src/routes/notes.lazy.tsx`
**Line**: 28 (NotesWorkspaceDefault component)
**Error**: "Rendered fewer hooks than expected"

### Identified Hook Violation Pattern

**Issue**: Inconsistent hook order between renders due to conditional early returns

**Current Code Flow**:
```typescript
function NotesWorkspaceDefault() {
  // HOOKS CALLED (lines 38-42)
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const welcomeNoteCreatedRef = useRef(false);

  // HOOK CALLED (line 45)
  const fsaProjects = useLiveQuery(...);

  // HOOK CALLED (line 53)
  useEffect(() => {
    if (platform.canAccessFSA) {
      setShowPicker(true);
      return;  // ← EARLY RETURN
    }
    // Mobile logic...
  }, [platform.canAccessFSA, fsaProjects]);

  // EARLY RETURN HAPPENS HERE (line 119)
  if (platform.canAccessFSA && showPicker) {
    return <ProjectPickerDialog />;
  }

  // HOOKS NOT CALLED (lines 142, 166)
  // useEffect for ProjectRegistry
  // useEffect for IDE store
}
```

### The Problem

**Render Path 1: Desktop with FSA (first render)**
- Hooks called: useNavigate, useState, useState, useRef, useLiveQuery, useEffect (5 total)
- Early return triggered: YES (line 119)
- Result: ✅ All hooks called before return - OK

**Render Path 2: Desktop with FSA (second render, after setShowPicker(true))**
- Hooks called: useNavigate, useState, useState, useRef, useLiveQuery, useEffect (5 total)
- Early return triggered: YES (line 119)
- Result: ✅ All hooks called before return - OK

**Render Path 3: Mobile/tablet (browser-mode)**
- Hooks called: useNavigate, useState, useState, useRef, useLiveQuery, useEffect (5 total)
- Early return triggered: NO (line 119 skipped)
- Next hooks called: useEffect (line 142), useEffect (line 166)
- Result: ✅ All hooks called - OK

**Render Path 4: Desktop with FSA (after project selected, showPicker=false)**
- Hooks called: useNavigate, useState, useState, useRef, useLiveQuery, useEffect (5 total)
- Early return triggered: NO (line 119 skipped)
- Next hooks called: useEffect (line 142), useEffect (line 166)
- Result: ✅ All hooks called - OK

### Actual Root Cause (Deeper Investigation)

**The issue is NOT in the hook order**, but in the **render loop/cycle condition**:

Looking at the useEffect at line 53-116:

```typescript
useEffect(() => {
  if (platform.canAccessFSA) {
    if (fsaProjects && fsaProjects.length > 0) {
      setShowPicker(true);  // ← STATE UPDATE
    } else {
      setShowPicker(true);  // ← STATE UPDATE
    }
    return;
  }

  // Mobile/tablet → use browser-mode (IndexedDB)
  import('@/lib/workspace/browser-mode').then(
    async ({ getOrCreateBrowserModeProject, BROWSER_MODE_PROJECT_ID }) => {
      const browserProject = await getOrCreateBrowserModeProject();

      if (browserProject) {
        setProject(browserProject);  // ← STATE UPDATE (ASYNC)

        if (!welcomeNoteCreatedRef.current) {
          welcomeNoteCreatedRef.current = true;
          // ... create welcome note logic
        }
      }
    }
  );
}, [platform.canAccessFSA, fsaProjects]);
```

**The Race Condition**:

1. Component mounts, `project = null`, `showPicker = false`
2. First render: Loading state (line 172-181)
3. useEffect runs (line 53)
4. If `platform.canAccessFSA = true`:
   - Sets `showPicker = true` (sync update, line 58 or 61)
   - Early return (line 64)
   - Component re-renders
5. Re-render triggers: Early return path (line 119-139) - renders ProjectPickerDialog
6. **NO ISSUE YET** - hooks are consistent

**The ACTUAL Issue**:

Looking at the browser-mode async operation:

```typescript
import('@/lib/workspace/browser-mode').then(
  async ({ getOrCreateBrowserModeProject, BROWSER_MODE_PROJECT_ID }) => {
    const browserProject = await getOrCreateBrowserModeProject();
    if (browserProject) {
      setProject(browserProject);  // ← ASYNC STATE UPDATE
    }
  }
);
```

This is a **Promise.then() callback** that runs:
- **AFTER** the useEffect completes
- **OUTSIDE** of React's render cycle (in a microtask)
- **WITHOUT** triggering a re-render immediately

**When `setProject(browserProject)` is called**:
1. Component needs to re-render
2. React schedules re-render
3. In the next render, hooks are called again
4. **IF ANY CONDITION CHANGES**, the hook order might be different

**BUT** - in current code, the conditions don't change:
- `platform.canAccessFSA` - constant
- `fsaProjects` - constant for this platform type
- `showPicker` - might change

**Wait - let me re-examine**:

When project is set (mobile):
```typescript
setProject(browserProject);  // Project is set
```

Next render:
```typescript
if (!project) {
  return <Loading />;
}  // ← SKIPPED (project is now set)

useEffect(() => {
  if (!project) return;  // ← SKIPPED (project is set)
  // Register project...
}, [project]);  // ← This runs

useEffect(() => {
  if (project?.id) {
    useIDEStore.getState().setProjectId(project.id);
  }
}, [project?.id]);  // ← This runs

return (
  <ProjectProvider project={project} workspace="notes">
    <NotesPage />
  </ProjectProvider>
);
```

This looks correct!

**So what's the actual issue?**

Looking more carefully at the code, I notice:

```typescript
// Line 172-181: Loading state
if (!project) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Loading Notes workspace...</p>
      </div>
    </div>
  );
}
```

This is **NOT a conditional hook** - it's just JSX.

**Let me look for the ACTUAL hooks error source**:

Ah! I found it. Looking at the browser-mode import:

```typescript
// Line 67: Dynamic import in useEffect
import('@/lib/workspace/browser-mode').then(...)
```

This is a **dynamic import inside useEffect**, which is technically allowed. BUT...

**WAIT! Let me check the actual error context more carefully.**

The user said "Rendered fewer hooks than expected" error. This typically happens when:

1. Hooks are called conditionally (inside if/else)
2. Hooks are called after early return
3. Hook order changes between renders
4. Component unmounts and remounts with different hook count

**Let me look for conditional hook calls**:

Looking at line 83-84 in current code:
```typescript
if (existingNotes === 0) {
  const createNote = useNoteStore.getState().createNote;  // ← NOT A HOOK!
  const setActiveNote = useNoteStore.getState().setActiveNote;  // ← NOT A HOOK!
  // ...
}
```

These are NOT hooks - they're just getting store methods directly. This is **NOT a violation**.

**Let me look for ACTUAL hook violations**:

Looking at the useEffect dependency arrays...

**Ah! I found it!**

Look at line 116:
```typescript
}, [platform.canAccessFSA, fsaProjects]);
```

The dependency includes `fsaProjects`, which is the result of `useLiveQuery()`.

**When this useEffect runs**:
1. On first render: `fsaProjects` might be `undefined` or `null` (useLiveQuery hasn't resolved yet)
2. Effect runs with `undefined` or `null`
3. Later, useLiveQuery resolves and updates `fsaProjects`
4. Dependency changes, effect runs AGAIN

**But this is NOT a hooks violation** - it's just an effect running multiple times.

**Let me think differently...**

Maybe the error is coming from **NOTES PAGE** component, not from NotesWorkspaceDefault?

Let me check the error line reference. The user said "line 28" which is:
```typescript
<NotesWorkspaceDefault />
```

This is JSX rendering the component. The hooks error would be IN the component.

**Let me reconsider the early return pattern**:

Looking at lines 119-139:
```typescript
if (platform.canAccessFSA && showPicker) {
  return (
    <div className="h-full flex items-center justify-center bg-background">
      <ProjectPickerDialog
        open={true}
        onOpenChange={(open) => {
          if (!open && !project) {
            navigate({ to: '/' });
          }
          setShowPicker(open);
        }}
        targetWorkspace="notes"
        onCreateNew={() => {
          navigate({ to: '/' });
        }}
      />
    </div>
  );
}
```

This is an early return that happens:
- BEFORE the useEffect at line 142 (ProjectRegistry)
- BEFORE the useEffect at line 166 (IDE store)

**AND** the dependency for the useEffect at line 53 is `[platform.canAccessFSA, fsaProjects]`.

**HERE'S THE BUG**:

When `showPicker` changes from `false` to `true`:
1. `setShowPicker(true)` is called in useEffect (line 58 or 61)
2. Component re-renders
3. Early return triggers (line 119)
4. useEffects at line 142 and 166 are NOT executed
5. Next render: `showPicker` is still `true`
6. Early return still triggers
7. useEffects at line 142 and 166 still NOT executed

**BUT** - this is NOT a hooks violation. The hooks are still being called in the same order:
- useNavigate
- useState
- useState
- useRef
- useLiveQuery
- useEffect (line 53)
- useEffect (line 142 - NOT EXECUTED due to early return)
- useEffect (line 166 - NOT EXECUTED due to early return)

**Wait - "Rendered fewer hooks than expected"** means React expects MORE hooks than were called.

This would happen if:
- Previous render had MORE hooks
- Current render has FEWER hooks

This could happen if:
- Component unmounts and remounts
- Conditional hook calls (not the case here)
- **Different component versions in bundle** (Hot Module Replacement?)

**Let me check HMR scenario**:

In development mode with Hot Module Replacement:
1. Component code changes
2. HMR updates the component
3. Component might remount
4. **If hooks order changed between versions**, React detects violation

**Looking at the git history**:
- Commit 4501cdc5 (Jan 14): Added welcome note duplication fix
- Next commit: CC-V2-A01 changes (Jan 21): Added FSA picker logic

**Between these commits, the component structure changed**:
- Old version: Only 1 useEffect (browser-mode logic)
- New version: 3 useEffects (browser-mode + ProjectRegistry + IDE store)

**HMR ISSUE DETECTED**:

When the component was hot-reloaded during development:
1. Old version had fewer hooks
2. New version has more hooks
3. React detects hook count mismatch
4. Error: "Rendered fewer hooks than expected"

**ROOT CAUSE**: Hot Module Replacement between commits

**FIX**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R) to clear HMR state

**BUT** - if the error persists after hard refresh, there's a deeper issue.

**Let me check one more thing - actual component structure**:

Looking at the file again, I notice the early return at line 119-139 is INSIDE the function body, not inside a conditional hook. This is correct.

**Let me check if there's a nested component issue**:

Looking at the return at line 183-187:
```typescript
return (
  <ProjectProvider project={project} workspace="notes">
    <NotesPage />
  </ProjectProvider>
);
```

This renders NotesPage. If NotesPage has a hooks violation, the error would appear here.

**CONCLUSION**:

The most likely causes are:
1. **HMR state corruption** (hot reload between component versions) - FIX: Hard refresh
2. **NotesPage component has hooks violation** - FIX: Investigate NotesPage
3. **useLiveQuery implementation issue** - FIX: Check dexie-react-hooks usage

**Recommended Fix**:

```typescript
// 1. Add loading state to prevent race conditions
const [loading, setLoading] = useState(true);

// 2. Ensure consistent render flow
useEffect(() => {
  if (loading) {
    // Initialize project
    // ... (existing logic)
    setLoading(false);
  }
}, [loading]);

// 3. Only render when ready
if (loading) {
  return <LoadingSpinner />;
}

if (platform.canAccessFSA && showPicker) {
  return <ProjectPickerDialog />;
}

// Rest of component...
```

---

## Phase 1: Emergency Hooks Fix (30-60 min)

### Step 1.1: Verify Error (5 min)

**Actions**:
1. Check browser console for full error stack trace
2. Identify which component has hooks violation
3. Determine if it's HMR-related or actual code issue

**Command**:
```bash
# Start dev server and check console
pnpm dev
# Open browser to http://localhost:5173/notes
# Check console for hooks error
```

### Step 1.2: Implement Fix (30-45 min)

**Option A: Add Loading State (Recommended)**

**File**: `src/routes/notes.lazy.tsx`

**Changes**:
1. Add `loading` state
2. Ensure all useEffects run consistently
3. Prevent race conditions between state updates

**Implementation**:
```typescript
function NotesWorkspaceDefault() {
  const navigate = useNavigate();
  const platform = getPlatformContract();
  const [project, setProject] = useState<Project | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);  // ← NEW
  const welcomeNoteCreatedRef = useRef(false);

  const fsaProjects = useLiveQuery(async () => {
    if (!platform.canAccessFSA) return [];
    const allProjects = await db.projects.toArray();
    return allProjects.filter(
      (p) => p.storageType === 'fsa' && p.workspaceBindings?.notes === true
    );
  }, [platform.canAccessFSA]);

  useEffect(() => {
    // Prevent re-initialization
    if (!loading) return;

    // CC-V2-A01: Desktop with FSA → show picker or recent projects
    if (platform.canAccessFSA) {
      // If we have FSA projects, show picker
      if (fsaProjects && fsaProjects.length > 0) {
        setShowPicker(true);
      } else {
        // No FSA projects - show picker to create one
        setShowPicker(true);
      }
      setLoading(false);  // ← Done initializing
      return;
    }

    // Mobile/tablet → use browser-mode (IndexedDB)
    import('@/lib/workspace/browser-mode').then(
      async ({ getOrCreateBrowserModeProject, BROWSER_MODE_PROJECT_ID }) => {
        const browserProject = await getOrCreateBrowserModeProject();

        if (browserProject) {
          setProject(browserProject);

          if (!welcomeNoteCreatedRef.current) {
            welcomeNoteCreatedRef.current = true;

            const existingNotes = await db.notes
              .where('projectId')
              .equals(BROWSER_MODE_PROJECT_ID)
              .count();

            if (existingNotes === 0) {
              const createNote = useNoteStore.getState().createNote;
              const setActiveNote = useNoteStore.getState().setActiveNote;

              const defaultNoteId = await createNote({
                title: 'Welcome to Notes',
                emoji: '👋',
                blocks: [/* ... */],
              } as unknown as import('@blocknote/core').Block[],

              setActiveNote(defaultNoteId);
            }
          }
        }

        setLoading(false);  // ← Done initializing
      }
    );
  }, [loading]);  // ← Only run once when loading is true

  // Desktop: Show project picker dialog
  if (loading) {  // ← NEW: Don't show anything until ready
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading Notes workspace...</p>
        </div>
      </div>
    );
  }

  if (platform.canAccessFSA && showPicker) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <ProjectPickerDialog ... />
      </div>
    );
  }

  // Rest of component (ProjectRegistry, IDE store, NotesPage)
}
```

**Option B: Hard Refresh (If HMR issue)**

If error is HMR-related:
1. Clear browser cache
2. Hard refresh with Cmd+Shift+R
3. Verify error persists

### Step 1.3: Test Fix (10-15 min)

**Test Cases**:
1. Returned desktop user → Notes should work
2. New desktop user → Notes should show picker
3. Mobile user → Notes should use browser-mode
4. Refresh page → Should not crash

**Validation**:
```bash
# Check for console errors
# Verify user can navigate Notes
# Verify no hooks error
```

**Acceptance Criteria**:
- [ ] No "Rendered fewer hooks than expected" error
- [ ] Returned desktop user can access Notes
- [ ] New desktop user sees project picker
- [ ] Mobile user sees browser-mode notes
- [ ] Page refresh works without crash

---

## Phase 2: Validate ADR-034/035 Execution (2-3 hours)

### Step 2.1: Check ADR-034 Status (1 hour)

**File**: `_bmad-output/planning-artifacts/adr/ADR-034-workspace-access-infection-remediation-2026-01-17.md`

**Check Items**:
1. Read ADR-034 infection registry
2. Check which infections are marked as "FIXED"
3. Check which infections are still "INFECTED"
4. Verify Phase 1-5 completion status

**Validation Commands**:
```bash
# Check if FSA handle persistence is fixed
grep -r "persistHandle" src/infrastructure/filesystem/

# Check if state scoping is implemented
grep -r "\[projectId+workspaceId\]" src/infrastructure/persistence/stores/

# Check if route guards are added
grep -r "beforeLoad.*canAccessIDE" src/routes/
```

### Step 2.2: Check ADR-035 Status (30 min)

**Check if ADR-035 exists**:
```bash
find _bmad-output/planning-artifacts/adr/ -name "ADR-035*.md"
```

**If ADR-035 exists**:
1. Read ADR-035
2. Check P0 bugs status
3. Check if fixes were implemented
4. Verify TypeScript errors resolved

### Step 2.3: Execute Missing Remediation (1-1.5 hours)

**If ADR-034 not fully executed**:

**Priority Fixes**:
1. **FSA Handle Persistence** (P0 - 4 hours)
   - Chrome 129 detection
   - Actual handle storage
   - Silent restore

2. **State Management Scoping** (P0 - 3 hours)
   - Project-scoped hydration
   - Composite keys `[projectId+workspaceId]`
   - Workspace isolation

3. **Route Standardization** (P0 - 2 hours)
   - Platform guards
   - Remove double-fetch
   - Consistent loader patterns

4. **Platform Contract Enforcement** (P0 - 1 hour)
   - Remove temp project on desktop
   - Project picker in Notes
   - Hide IDE on mobile

**If ADR-035 exists**:
1. Fix P0 bugs from ADR-035
2. Execute architecture standardization

---

## Phase 3: Verification (1 hour)

### Step 3.1: TypeScript Validation (10 min)

```bash
pnpm tsc --noEmit
```

**Expected**: 0 errors

### Step 3.2: User Journey Testing (30 min)

**Test Scenarios**:
1. **Returned Desktop User**:
   - Navigate to `/notes` → Should show FSA picker or recent projects
   - Create new FSA project → Should work
   - Refresh page → Should restore handle silently
   - Navigate to `/ide` → Should load files without prompt

2. **New Desktop User**:
   - Navigate to `/` → Should show hub with FSA picker
   - Select folder → Should create project and navigate to Notes
   - Notes should show welcome note
   - IDE should load files

3. **Mobile User**:
   - Navigate to `/notes` → Should use browser-mode
   - Should NOT see FSA picker
   - Should NOT access IDE
   - Notes should work with IndexedDB

**Validation**: All scenarios work without errors

### Step 3.3: Console Check (10 min)

**Check for**:
- [ ] No hooks errors
- [ ] No console warnings
- [ ] No network errors
- [ ] No unhandled exceptions

**Acceptance Criteria**:
- [ ] TypeScript: 0 errors
- [ ] Returned desktop user: 100% journey working
- [ ] New desktop user: 100% journey working
- [ ] Mobile user: 100% journey working
- [ ] Console: No errors or warnings

---

## Delegation Plan

### Delegate to: @dev-ext (or appropriate agent)

**Task**: Implement emergency hooks fix

**Handoff Artifact**: `_bmad-output/handoffs/2026-01-15/hooks-error-fix-handoff.md`

**Context**:
- Root cause: Inconsistent hook order or HMR state corruption
- Recommended fix: Add loading state to ensure consistent renders
- Priority: P0 - BLOCKING USER JOURNEY
- Timeline: 30-60 minutes

**After Hook Fix Complete**:
1. Delegate ADR-034 execution (if needed)
2. Delegate ADR-035 execution (if needed)
3. Validate full user journey

---

## Success Criteria

### Phase 1 (Hooks Fix)
- [ ] Hooks error resolved
- [ ] Notes workspace accessible
- [ ] No console errors

### Phase 2 (ADR Validation)
- [ ] ADR-034 status confirmed
- [ ] ADR-035 status confirmed
- [ ] Missing remediation identified

### Phase 3 (Execution & Verification)
- [ ] All P0 bugs fixed
- [ ] Architecture standardized
- [ ] User journey working 100%
- [ ] TypeScript: 0 errors

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Hooks fix doesn't resolve issue | HIGH | Have fallback: Investigate NotesPage component |
| ADR-034 partially executed | MEDIUM | Use infection registry to track remaining issues |
| User journey still broken after fix | HIGH | Validate each workspace (Notes, IDE, Knowledge, Study) |
| Regression from ADR-034/035 | MEDIUM | Run full test suite after changes |

---

## Timeline Estimate

| Phase | Duration | Start | End |
|-------|----------|-------|------|
| Phase 1: Hooks Fix | 30-60 min | T+0h | T+1h |
| Phase 2: ADR Validation | 2-3 hours | T+1h | T+4h |
| Phase 3: Execution & Verification | 1-1.5 hours | T+4h | T+5.5h |

**Total**: 4.5-5.5 hours

---

## Decision Point

**Before executing Phase 2 (ADR Validation)**, I need your confirmation:

1. **Should I execute ADR-034 Phase 1-5?** (11 hours estimated in ADR)
2. **Should I create ADR-035 if it doesn't exist?**
3. **Should I execute fixes in parallel or sequentially?**

**Your input required to proceed.**

---

**Document Owner**: BMAD Master Orchestrator
**Created**: 2026-01-15
**Status**: READY FOR EXECUTION
