# Handoff Artifact: Hooks Error Investigation & Fix

**Artifact ID**: hnd_20260121_183000_abcdef
**Date**: 2026-01-15
**Type**: EMERGENCY_FIX
**Priority**: P0

---

## Parent Information

**Parent Agent**: BMAD Master Orchestrator
**Parent Session**: EMERGENCY-FIX-2026-01-15
**Handoff Date**: 2026-01-21T18:30:00+07:00

---

## Context Summary

**Critical Issue**: React Hooks Error in Notes Workspace
**Error Message**: "Rendered fewer hooks than expected"
**Location**: `src/routes/notes.lazy.tsx` line 28 (NotesWorkspaceDefault component render)
**Severity**: P0 - BLOCKING 100% OF USERS (returned + new)

**Impact**: Users cannot access Notes workspace, complete user journey failure

---

## Root Cause Analysis

### Investigation Summary

**File**: `src/routes/notes.lazy.tsx`
**Component**: `NotesWorkspaceDefault`
**Last Change**: Commit 4501cdc5 (Jan 14) - Welcome note duplication fix
**Next Change**: CC-V2-A01 (Jan 21) - FSA picker logic

### Hook Structure Analysis

**Current Hooks Called** (in order):
1. `useNavigate()` - line 39
2. `useState<Project | null>(null)` - line 40
3. `useState(false)` - line 41
4. `useRef(false)` - line 42
5. `useLiveQuery(...)` - line 45-51
6. `useEffect(...)` - line 53-116 (browser-mode/FSA logic)
7. `useEffect(...)` - line 142-163 (ProjectRegistry)
8. `useEffect(...)` - line 166-170 (IDE store)

**Total**: 8 hooks called consistently in every render

### Potential Issues Identified

#### Issue #1: HMR State Corruption (HIGH PROBABILITY)

**Scenario**:
1. Component code changed between commits (4501cdc5 → CC-V2-A01)
2. Development mode with Hot Module Replacement (HMR)
3. Component hot-reloads with different hook structure
4. React detects hook count mismatch between versions
5. Error: "Rendered fewer hooks than expected"

**Evidence**:
- Old version: 5 hooks (only browser-mode useEffect)
- New version: 8 hooks (+ProjectRegistry + IDE store useEffects)
- HMR triggers: Component remounts with old/new state

**Mitigation**:
- Hard refresh browser: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows/Linux)
- Restart dev server

#### Issue #2: Inconsistent Render Flow (MEDIUM PROBABILITY)

**Scenario**:
1. Component renders with `project = null`, `showPicker = false`
2. First useEffect runs (line 53)
3. If `platform.canAccessFSA = true`:
   - Sets `showPicker = true`
   - Early returns (line 64)
   - Component re-renders
4. Second render: `showPicker = true`
5. Early return triggers (line 119-139)
6. useEffects at line 142 and 166 **NOT executed**
7. Next render: Hooks called in **SAME ORDER** as previous render
8. Issue might be in subsequent state changes

**Root Cause**: When `showPicker` changes and component re-renders, the early return path might interact with React's reconciliation.

#### Issue #3: Async State Update Race (MEDIUM PROBABILITY)

**Scenario**:
```typescript
// useEffect at line 67-114
import('@/lib/workspace/browser-mode').then(
  async ({ getOrCreateBrowserModeProject, BROWSER_MODE_PROJECT_ID }) => {
    const browserProject = await getOrCreateBrowserModeProject();
    if (browserProject) {
      setProject(browserProject);  // ← ASYNC STATE UPDATE
    }
  }
);
```

**Issue**:
1. `setProject(browserProject)` is called **inside** Promise.then() callback
2. This happens **AFTER** useEffect completes
3. It's in a microtask, **OUTSIDE** of React's render cycle
4. Component needs to re-render, but timing is unpredictable

**Mitigation**: Ensure state updates are properly sequenced and don't create race conditions.

---

## Handoff Data

### Task Definition

**Title**: Investigate and fix React hooks error in Notes workspace
**Priority**: P0 - BLOCKING USER JOURNEY
**Estimated Duration**: 30-60 minutes (investigation) + 30-45 minutes (implementation)

### Acceptance Criteria

**Must Have**:
- [ ] Identify root cause of "Rendered fewer hooks than expected" error
- [ ] Implement fix that ensures consistent hook order
- [ ] Fix resolves issue for returned desktop users
- [ ] Fix resolves issue for new desktop users
- [ ] Fix resolves issue for mobile users
- [ ] No console errors after fix

**Nice to Have**:
- [ ] Verify fix works with HMR (Hot Module Replacement)
- [ ] Ensure no race conditions in state updates
- [ ] Test on desktop (FSA) and mobile (IndexedDB)

### Technical Constraints

**Rules**:
- Must follow BMAD governance rules (AGENTS.md)
- Must ensure 8-bit design compliance
- Must handle both English and Vietnamese strings
- No God components (>400 lines)
- TypeScript must be 0 errors after fix
- Must be mobile-responsive (portrait phone support)

**Dependencies**:
- React 19 hooks rules (must be called in same order every render)
- TanStack Router patterns
- Zustand store patterns
- Dexie database operations

### Validation Commands

```bash
# After fix, run TypeScript check
pnpm tsc --noEmit

# Test Notes workspace
pnpm dev
# Navigate to http://localhost:5173/notes
# Check console for hooks error

# Test on different platforms
# Desktop: Check FSA picker, project creation
# Mobile: Check browser-mode, no IDE access
```

---

## Implementation Guidance

### Recommended Fix Strategy

**Option A: Loading State Pattern (RECOMMENDED)**

Add explicit loading state to prevent race conditions:

```typescript
function NotesWorkspaceDefault() {
  const navigate = useNavigate();
  const platform = getPlatformContract();
  const [project, setProject] = useState<Project | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);  // ← NEW: Explicit loading state
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
            // ... welcome note logic
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

  // Rest of component (same as current)
  if (platform.canAccessFSA && showPicker) {
    return <ProjectPickerDialog ... />;
  }

  // ProjectRegistry, IDE store, NotesPage...
}
```

**Benefits**:
- Explicit control over when component is "ready"
- Prevents race conditions between state updates
- Ensures hooks are called consistently
- Clear separation of loading vs. ready state

### Alternative Fix: Hard Refresh (IF HMR ISSUE)

If error is HMR-related:
1. Clear browser cache and hard refresh
2. Restart dev server
3. Verify error persists

If error persists after hard refresh → implement Loading State Pattern (Option A).

---

## Escalation Path

### If Issue Not Resolved

**Step 1**: Investigate NotesPage component
- File: `src/presentation/components/notes/NotesPage.tsx`
- Check if NotesPage has hooks violations
- Fix any issues in NotesPage

**Step 2**: Check useLiveQuery implementation
- File: `src/routes/notes.lazy.tsx` line 45-51
- Verify dexie-react-hooks usage
- Check if query dependency causes issues

**Step 3**: Create new story for comprehensive fix
- If loading state pattern doesn't work
- Break down into smaller, testable stories
- Execute via standard story workflow

**Step 4**: Deeper architecture scan
- Run deep-scan-architecture-scanner
- Run deep-scan-state-scanner
- Identify any hidden issues

---

## Completion Reporting

### On Success

**Update LOOP_STATE.yaml**:
- Set `current.step` to "EF-A02_COMPLETE"
- Update `teams.team_a.stories.EF-A02.status` to "COMPLETED"
- Add completion timestamp
- Move to next step: "EF-A03: Test hooks fix"

**Create completion report**:
- File: `_bmad-output/handoffs/completion/hooks-error-fix-completion-2026-01-15.md`
- Include:
  - Root cause identified
  - Fix implemented
  - Test results
  - Screenshot of working Notes workspace
  - TypeScript validation: 0 errors

### On Partial Completion

**Report progress**:
- Which phase succeeded
- Which phase failed
- Remaining issues
- Next action required

### On Failure

**Document failure**:
- Root cause not found
- Fix attempts and results
- All attempted solutions
- Reason for failure

**Escalate to**:
- BMAD Master Orchestrator
- Architect-ext agent
- Deep-scan-orchestrator (for comprehensive scan)

---

## Files to Modify

### Primary Target

**File**: `src/routes/notes.lazy.tsx`
**Action**: Modify (NOT DELETE/RECREATE)
**Reason**: Hooks violation fix

### Secondary Targets (if needed)

**File**: `src/presentation/components/notes/NotesPage.tsx`
**Action**: Investigate
**Reason**: Error might be in NotesPage, not NotesWorkspaceDefault

---

## Dependencies

### Current ADRs

- **ADR-033**: Architectural Blueprint (APPROVED)
- **ADR-034**: Infection Remediation (APPROVED, NOT EXECUTED)
- **ADR-035**: Status unknown

### Related Files

- `src/infrastructure/filesystem/platform-contract.ts` - Platform detection
- `src/presentation/components/hub/ProjectPickerDialog.tsx` - FSA picker
- `src/lib/workspace/browser-mode.ts` - Browser mode utilities

---

## Timeline

- **T+0h**: Handoff created, delegation started
- **T+0.5h**: Investigation complete (expected)
- **T+1h**: Fix implementation complete (expected)
- **T+1.5h**: Testing complete (expected)
- **T+2h**: All acceptance criteria met (expected)

**Total Duration**: 2 hours max

---

## Additional Context

### User Journey Failures (Current State)

**Returned Desktop User**:
1. Notes workspace → CRASH (hooks error)
2. IDE workspace → Empty (FSA handle lost)
3. Project creation → Wrong type (browserdb instead of FSA)

**New Desktop User**:
1. Notes workspace → CRASH (hooks error)
2. IDE workspace → Empty (FSA handle lost)
3. Project creation → Wrong type (browserdb instead of FSA)

**Mobile User**:
- Expected to work (browser-mode), but not tested

### ADR-034 Status (From ADR)

**Phase 1 (FSA Handle)**: NOT EXECUTED
- Chrome 129 detection: NOT DONE
- Actual handle storage: NOT DONE
- Silent restore: NOT DONE

**Phase 2 (State Scoping)**: NOT EXECUTED
- Project-scoped hydration: NOT DONE
- Composite keys: NOT DONE
- Workspace isolation: NOT DONE

**Phase 3 (Route Standardization)**: NOT EXECUTED
- Platform guards: NOT DONE
- Remove double-fetch: NOT DONE
- Consistent loader: NOT DONE

**Phase 4 (Platform Contract)**: NOT EXECUTED
- Remove temp project: NOT DONE
- Project picker: PARTIALLY DONE (CC-V2-A01)
- Hide IDE on mobile: NOT DONE

**Infection Count**: 31 infections still active

---

**Handoff Artifact Created**: 2026-01-21T18:30:00+07:00
**Status**: READY FOR EXECUTION
**Target Agent**: @dev-ext (or appropriate development agent)
