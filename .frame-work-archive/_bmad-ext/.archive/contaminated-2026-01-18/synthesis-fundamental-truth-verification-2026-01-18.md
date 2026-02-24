# Synthesis: Fundamental Truth Verification & Fix Strategy

**Date**: 2026-01-22
**Version**: 1.0.0
**Status**: SYNTHESIS COMPLETE - READY FOR IMPLEMENTATION
**Coordinators**: ext-master-enhanced
**Analysts**: architect-ext, dev-ext, analyst-ext

---

## Executive Summary

**User Report**: "Turn 1: New User - Desktop Project Creation" + "Turn 2: Returning User - Project Selection"

**Issues Identified**: 6 CRITICAL + 2 MEDIUM issues

**Fundamental Truth Status** (from `check-list-for-fundamental-truth.md`):

| # | Fundamental Truth | Status | Gap |
|---|------------------|--------|------|
| 1 | Client-side only (server for LLMs/APIs) | ✅ PASS | None |
| 2 | BYOK with Tanstack AI SDK | ✅ PASS | None |
| 3 | Project-centric with unique IDs | ⚠️ PARTIAL | Race condition in creation |
| 4 | Device parity (Desktop=FSA, Non-Desktop=IndexedDB) | ❌ FAIL | Device detection uses screen size |
| 5 | Thread management (Project+Workspace tied) | ⚠️ PARTIAL | Not validated |
| 6 | Consistent UX (state/persistence/hotload) | ❌ FAIL | UI collapse, no hot load |
| 7 | Agent permissions via tools | ✅ PASS | Not in scope |
| 8 | Rendering support | ✅ PASS | Not in scope |
| 9 | State management boundaries (Zustand vs Dexie) | ❌ FAIL | No verification before navigation |
| 10 | Technical hygiene (hooks, hydration, ID routing) | ❌ FAIL | window.location.href, race conditions |
| 11 | Research: Dexie+FSA integration | ⚠️ PARTIAL | Dexie async not awaited |
| 12 | Edge cases (agent CRUD during edits) | ⚠️ PARTIAL | Not validated |

**Critical Failures**: 4 of 12 fundamental truths (33% violation rate)

---

## Issue #1: Device Detection Violates Fundamental Truth #4

**Fundamental Truth #4**: Desktop = FSA; Non-Desktop = IndexedDB. **NO IDE on Non-Desktop.**

**Current State** (from architect-ext):
```typescript
// platform-contract.ts:138, 148, 164
const screenWidth = window.screen.width;  // ❌ SCREEN WIDTH CHECK
const isTablet = (hasTouch && screenWidth >= 768 && screenWidth < 1024);
const isMobile = (hasTouch && screenWidth < 768);
```

**User Report**: "Device should not distinct by screensize → I resize my screen → let me choosing browser (wrong look at fundamental truth)"

**Root Cause**: 
- Device detection uses `window.screen.width` as fallback
- User resizes browser → Screen width changes
- Next call to `getPlatformContract()` → Device type changes mid-session
- This violates ADR-033 Decision D1: Device types should be 'desktop' | 'mobile' | 'tablet' (not screen-size based)

**Impact**: 
- Desktop user with small window (800px) classified as "tablet"
- Desktop user resizes → Device type may change multiple times
- Wrong storage type selected → Wrong workspace navigation
- IDE access blocked incorrectly

**Verification Needed**:
```typescript
// Add console logs to platform-contract.ts
console.log('[PlatformContract] Device type detected:', deviceType, {
  userAgent: navigator.userAgent,
  screenWidth: window.screen.width,
  hasFSA: 'showDirectoryPicker' in window,
  timestamp: Date.now()
});

// Add resize listener to detect when device type changes
window.addEventListener('resize', () => {
  const newType = detectDeviceType();
  if (newType !== deviceType) {
    console.error('[PlatformContract] ⚠️ Device type changed on resize:', {
      from: deviceType,
      to: newType,
      timestamp: Date.now()
    });
  }
});
```

**Fix Required**:
```typescript
// Remove screen width from detection logic
function detectDeviceType(): DeviceType {
  if (typeof navigator === 'undefined') {
    return 'desktop'; // SSR default
  }

  const ua = navigator.userAgent;

  // Primary: User agent detection ONLY
  const isTablet = /iPad/i.test(ua) || /Tablet/i.test(ua) || ...;
  const isMobile = /Mobile/i.test(ua) || /iPhone/i.test(ua) || ...;
  
  if (isTablet) return 'tablet';
  if (isMobile) return 'mobile';
  return 'desktop'; // Default
}
```

---

## Issue #2: Three Conflicting Project Creation Paths Violate Fundamental Truths #3, #9, #10

**Fundamental Truth #3**: Project-centric: Multiple projects across workspaces with unique IDs
**Fundamental Truth #9**: State management boundaries: Clearly define and connect Zustand (client state) and Dexie (persisted data) usage
**Fundamental Truth #10**: Technical hygiene: Robust hooks, hydration, ID-based routing

**Current State** (from architect-ext & dev-ext):

Three paths for project creation:
1. `HubHomePage.handleNewProject()` - Direct folder mount (lines 186-244)
2. `ProjectCreationWizard` - 5-step wizard (536 lines)
3. `HubHomePage.handleProjectCreated()` - Wizard success handler (lines 156-184)

**User Report**: "Failed to create project. Please try again."

**Root Cause** (from dev-ext analysis):
```typescript
// HubHomePage.tsx:227-234 - handleNewProject()
const newProjectId = useProjectStore.getState().createProject(projectInput);
// ❌ NO VERIFICATION - Navigation happens immediately
await navigate({ to: '/ide/$projectId', params: { projectId: newProjectId } });
```

**Problem**:
- `db.projects.put()` is **async, fire-and-forget** (non-blocking)
- `createProject()` returns projectId immediately (Zustand updated)
- `navigate()` happens **before** Dexie write completes
- If Dexie write fails → Project never persisted → Navigation to broken workspace
- No verification that project exists in Dexie before navigation

**Violation of Fundamental Truth #9**:
- "Clearly define and connect Zustand and Dexie"
- Current: Zustand updated immediately, Dexie not verified → Gap in state management boundaries

**Verification Needed**:
```typescript
// HubHomePage.tsx - Modify handleNewProject
const handleNewProject = async () => {
  try {
    // ... existing code ...
    
    const newProjectId = useProjectStore.getState().createProject(projectInput);
    console.log('[HubHomePage] Created project in Zustand:', newProjectId);
    
    // ⭐ NEW: VERIFY Dexie persistence before navigation
    console.log('[HubHomePage] Verifying project in Dexie...');
    try {
      // Wait for Dexie write to complete (max 2 seconds)
      const verifiedProject = await db.projects.get(newProjectId);
      
      if (!verifiedProject) {
        console.error('[HubHomePage] ⚠️ CRITICAL: Project not found in Dexie!', {
          projectId: newProjectId,
          timestamp: Date.now()
        });
        toast.error(t('hub.projectCreateFailed', 'Failed to create project'), {
          description: 'Project was not saved to database.'
        });
        return; // Don't navigate
      }
      
      console.log('[HubHomePage] ✅ Project verified in Dexie:', verifiedProject.id, {
        name: verifiedProject.name,
        folderPath: verifiedProject.folderPath,
        timestamp: Date.now()
      });
      
      // ⭐ NEW: Safe to navigate now
      console.log('[HubHomePage] Navigating to IDE workspace...');
      await navigate({
        to: '/ide/$projectId',
        params: { projectId: newProjectId }
      });
      
      console.log('[HubHomePage] Navigation complete:', {
        route: `/ide/${newProjectId}`,
        timestamp: Date.now()
      });
      
    } catch (dexieError) {
      console.error('[HubHomePage] Dexie verification failed:', dexieError);
      toast.error(t('hub.projectCreateFailed', 'Failed to create project'), {
        description: (dexieError as Error).message
      });
    }
    
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('[HubHomePage] Failed to create project:', error);
      toast.error(t('hub.projectCreateFailed', 'Failed to create project'), {
        description: (error as Error).message,
      });
    }
  }
};
```

**Fix Required**:
1. Add `await db.projects.get(newProjectId)` before navigation
2. Catch and handle Dexie verification errors
3. Only navigate if project is verified in Dexie
4. Add console logs for debugging (as shown above)

---

## Issue #3: Project Selection Violates Fundamental Truth #6 & #10

**Fundamental Truth #6**: Consistent UX: Hot-load and react to project changes within any workspace
**Fundamental Truth #10**: Technical hygiene: ID-based routing

**User Report**: "Icon connected to space → to space no project (ux ui callapse) → no hot load nothing load (monaco nor filetree)"

**Current State** (from architect-ext & dev-ext):

```typescript
// ProjectPickerDialog.tsx:173 - handleProjectSelect()
window.location.href = `${routeMap[targetWorkspace]}/${project.id}`;
// ❌ BYPASSES TANSTACK ROUTER - CAUSES FULL PAGE RELOAD
```

**Root Cause**:
- `window.location.href` causes **full page reload**
- All React state is lost
- TanStack Router state is lost
- Dexie queries restart
- Monaco editor not initialized
- File tree not loaded
- UI appears "collapsed"

**Violation of Fundamental Truth #6**:
- "Hot-load and react to project changes" → Full reload breaks reactivity
- State is lost on every project selection

**Violation of Fundamental Truth #10**:
- "ID-based routing" → Should use TanStack Router's `navigate()`
- Current: Uses browser native navigation (bypasses router)

**Verification Needed**:
```typescript
// ProjectPickerDialog.tsx - Modify handleProjectSelect
const handleProjectSelect = async (project: ProjectRecord) => {
  console.log('[ProjectPickerDialog] Project selected:', {
    projectId: project.id,
    projectName: project.name,
    folderPath: project.folderPath,
    targetWorkspace,
    timestamp: Date.now()
  });
  
  // Update last opened timestamp
  console.log('[ProjectPickerDialog] Updating last opened timestamp...');
  await useProjectStore.getState().updateLastOpened(project.id);
  console.log('[ProjectPickerDialog] ✅ Last opened updated');
  
  // ⭐ NEW: Use TanStack Router (not window.location.href)
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
    timestamp: Date.now()
  });
  
  await navigate({
    to: `/${targetWorkspace}/$projectId`,
    params: { projectId: project.id }
  });
  
  console.log('[ProjectPickerDialog] Navigation complete:', {
    route: targetRoute,
    timestamp: Date.now()
  });
  
  onOpenChange(false);
};
```

**Fix Required**:
1. Replace `window.location.href` with `await navigate()` from TanStack Router
2. Add `await` before Dexie update (ensure write completes)
3. Add console logs for debugging
4. Import `useNavigate` from `@tanstack/react-router`

---

## Issue #4: Wizard Complexity Violates Governance & User Requirements

**Fundamental Truth**: Not directly violated, but user requirement is clear:
- "archive and detach this wizard totally create new (more simple and align to styling, Eng and Vi + must useable"

**Current State** (from architect-ext):
- `ProjectCreationWizard.tsx`: 536 lines
- 5 steps (Project Details, Workspace Setup, Agent Selection, File Setup, Review)
- Violates governance: Components > 300 lines not accepted
- User wants: 2-step simple wizard

**User Report**: "Wizard too complex - archive and detach, create new simple flow"

**Fix Required**:
1. Archive current `ProjectCreationWizard.tsx` to `_bmad-ext/.archive/`
2. Create new 2-step wizard (≤300 lines):
   - Step 1: Project identity (name, type, description)
   - Step 2: Workspace configuration (storage type, auto-sync)
3. Use 8-bit design (from analyst-ext research)
4. Add English + Vietnamese strings via i18next
5. Ensure device type is auto-detected (no user choice, per ADR-033)

---

## Issue #5: No 2-Level Entry System Violates Fundamental Truth #6

**Fundamental Truth #6**: Consistent UX with hot-load and project reactivity

**Current State** (from architect-ext):
- HubHomePage has too many entry points
- No clear hierarchy
- User reports confusion about where to start

**User Requirement** (implicit): Clear distinction between new user and returning user flows

**Fix Required**:
```
Hub (Level 1: Entry)
  ├─ Recent Projects (5 projects max)
  │   ├─ Click → Go directly to workspace
  │   └─ "Create New Project" button
  │
  └─ Workspaces (Level 2: Secondary Navigation)
      ├─ Notes (all platforms)
      ├─ IDE (Desktop only)
      ├─ Knowledge (all platforms)
      └─ Study (all platforms)
```

---

## Issue #6: Handle Serialization Violates Fundamental Truth #11

**Fundamental Truth #11**: Research: Determine if DexieDB should assist FSA for persistence or reactivity

**Current State** (from dev-ext):
- Status: ✅ SAFE - Code is correct
- Uses metadata-only serialization pattern
- Detects Chrome 129+ structuredClone support
- Handles both Chrome 129+ and older browsers

**Finding**: NO VIOLATION - Implementation is correct per ADR-033

**No Fix Required** - Code already handles this properly.

---

## Integration with Research Findings (from analyst-ext)

### 8-bit Design Compliance

**Current Issues**:
- Wizard is 536 lines (exceeds 300 line limit)
- Complex 5-step flow (user wants 2 steps)
- Need 8-bit styling (no glassmorphism, sharp corners, pixel shadows)

**Recommended 8-bit Tailwind Classes** (from analyst-ext):
```css
/* 8-bit Design System */
border-radius: 0;           /* Sharp corners - NO rounding */
border-radius: 2px;         /* Minimal rounding only */
box-shadow: 4px 4px 0 0;    /* Pixel shadows - hard-edge, no blur */
backdrop-filter: none;          /* NO glassmorphism */
opacity: 1;                   /* NO transparency */
```

**Implementation Required**:
1. Simplify wizard to 2 steps
2. Apply 8-bit Tailwind classes throughout
3. Remove rounded corners larger than 2px
4. Use solid borders and shadows (no blur effects)
5. Test mobile responsiveness (44x44px touch targets)

### Simplified Wizard UX (from analyst-ext)

**Recommended 2-Step Flow**:
```
Step 1: Project Identity
├─ Project Name (required, 2-50 chars)
├─ Description (optional, max 500 chars)
├─ Project Type (dropdown: app, library, experiment, learning)
└─ Project Icon (emoji picker)

Step 2: Workspace Configuration
├─ Show detected platform (Desktop with FSA / Mobile with IndexedDB)
├─ Display storage type (read-only, auto-detected)
├─ Auto-sync toggle (default: true)
└─ "Create Project" button

Total: 2 steps (user requirement met)
Size target: ≤300 lines (governance requirement met)
```

### Internationalization (English + Vietnamese)

**Current State**: Not fully implemented (wizard has English only)

**Required** (from analyst-ext):
1. Install `react-i18next` (if not already installed)
2. Add language switcher UI (🇺🇸 English | 🇻🇳 Tiếng Việt)
3. Create translation files:
   - `locales/en/hub.json` - English strings
   - `locales/vi/hub.json` - Vietnamese strings
4. Use `useTranslation()` hook in wizard
5. Translation key organization: Nest by feature (`hub.welcome`, `wizard.step1.title`)

---

## Priority Fix Plan

### P0 - CRITICAL (Fix Immediately)

#### Fix #1: Project Selection Navigation (30 min)
**File**: `src/presentation/components/hub/ProjectPickerDialog.tsx`
**Line**: 173
**Change**: Replace `window.location.href` with `await navigate()`
**Impact**: Fixes UI collapse, restores hot load, preserves state
**Files to Modify**:
- `ProjectPickerDialog.tsx`
- Add import: `import { useNavigate } from '@tanstack/react-router';`

**Steps**:
1. Add `const navigate = useNavigate();` at component level
2. Replace line 173 with proper TanStack Router navigation
3. Add `await` before Dexie update
4. Add console logs (see "Verification Needed" section above)

---

#### Fix #2: Add Dexie Verification (20 min)
**File**: `src/presentation/components/hub/HubHomePage.tsx`
**Lines**: 227-234, 156-184
**Change**: Add `await db.projects.get(newProjectId)` before navigation in both paths
**Impact**: Prevents navigation to non-existent projects
**Files to Modify**:
- `HubHomePage.tsx`

**Steps**:
1. Add verification to `handleNewProject()` (after line 227)
2. Add verification to `handleProjectCreated()` (after line 164)
3. Add console logs for debugging
4. Catch and handle verification errors
5. Only navigate if project is verified in Dexie

---

### P1 - HIGH (Fix Today)

#### Fix #3: Device Detection (1 hour)
**File**: `src/infrastructure/filesystem/platform-contract.ts`
**Lines**: 132-172
**Change**: Remove screen width checks from `detectDeviceType()`
**Impact**: Fixes platform detection stability, prevents mid-session device type changes
**Files to Modify**:
- `platform-contract.ts`

**Steps**:
1. Remove screen width from detection logic
2. Use browser capability detection only
3. Add console logs for debugging (see "Verification Needed" section above)
4. Add resize listener to detect device type changes
5. Test on desktop with various window sizes

---

### P2 - MEDIUM (Fix This Week)

#### Fix #4: Simplify Wizard (2 hours)
**File**: `src/presentation/components/project/ProjectCreationWizard.tsx`
**Action**: Archive current wizard, create new 2-step wizard
**Impact**: Meets user requirement, complies with governance (≤300 lines)
**Files to Modify**:
- Archive: `ProjectCreationWizard.tsx` → `_bmad-ext/.archive/complex-wizard-2026-01-22/`
- Create: `SimpleProjectWizard.tsx` (≤300 lines)

**Steps**:
1. Archive current wizard with proper documentation
2. Create new 2-step wizard component
3. Apply 8-bit design system
4. Add English + Vietnamese strings via i18next
5. Connect to HubHomePage properly

---

#### Fix #5: Implement 2-Level Entry System (2 hours)
**File**: `src/presentation/components/hub/HubHomePage.tsx`
**Action**: Restructure hub with clear Recent Projects (Level 1) + Workspaces (Level 2)
**Impact**: Clear UX hierarchy, reduces confusion
**Files to Modify**:
- `HubHomePage.tsx`

**Steps**:
1. Remove BentoGrid complexity
2. Simplify to Recent Projects + Workspaces sections
3. Add clear visual hierarchy
4. Ensure mobile responsiveness

---

### P3 - LOW (Fix Next Sprint)

#### Fix #6: Add Route Guards (2 hours)
**File**: `src/routes/ide.$projectId.tsx`
**Action**: Add beforeLoad route guard to verify project integrity
**Impact**: Prevents broken IDE loads, shows clear errors
**Files to Modify**:
- `ide.$projectId.tsx`

**Steps**:
1. Add loader to verify project in Dexie
2. Check FSA handle validity
3. Show error if project is incomplete
4. Prevent UI collapse with clear error message

---

## Testing Strategy

### Before Implementation

1. **Add console logs** to all modified files (as specified in each fix above)
2. **Open DevTools Console** with filter prefix (e.g., `[HubHomePage]`, `[PlatformContract]`)
3. **Clear IndexedDB** (DevTools → Application → IndexedDB → Delete database)
4. **Test device detection**:
   - Open on desktop (1920px)
   - Verify: `deviceType === 'desktop'`
   - Resize to 800px
   - Verify: `deviceType === 'desktop'` (should NOT change)
   - Resize to 600px
   - Verify: `deviceType === 'desktop'` (should NOT change)

### After Implementation

#### Test Case 1: New User - Desktop Project Creation
1. Clear IndexedDB data
2. Reload page
3. Click "Create New Project" (from hub or bento card)
4. Select folder via FSA picker
5. Enter project name
6. Click "Create"
7. **Expected**: Success toast, navigate to IDE workspace
8. **Verify logs**:
   - `[HubHomePage] Created project in Zustand:`
   - `[HubHomePage] Waiting for Dexie verification...`
   - `[HubHomePage] ✅ Project verified in Dexie:`
   - `[HubHomePage] Navigating to IDE workspace...`
   - `[HubHomePage] Navigation complete:`

#### Test Case 2: Returning User - Project Selection
1. Reload page (ensure projects exist in Dexie)
2. Click recent project icon
3. **Expected**: Navigate to IDE workspace
4. **Expected**: Monaco editor loads
5. **Expected**: File tree loads
6. **Expected**: NO full page reload
7. **Verify logs**:
   - `[ProjectPickerDialog] Project selected:`
   - `[ProjectPickerDialog] Updating last opened timestamp...`
   - `[ProjectPickerDialog] ✅ Last opened updated`
   - `[ProjectPickerDialog] Navigating via TanStack Router:`
   - `[ProjectPickerDialog] Navigation complete:`

#### Test Case 3: Device Detection Stability
1. Open DevTools Console
2. Resize browser window multiple times
3. **Expected**: Device type remains 'desktop' (no logs showing changes)
4. **Expected**: No console errors

---

## Handoff Summary

### Files to Modify (8 files total)

| Priority | File | Change Type | Lines | Time |
|----------|-------|--------------|-------|-------|
| P0 | `ProjectPickerDialog.tsx` | Fix navigation | 1 line | 30 min |
| P0 | `HubHomePage.tsx` | Add verification | +20 lines | 20 min |
| P1 | `platform-contract.ts` | Fix device detection | -10 lines | 1 hour |
| P2 | `ProjectCreationWizard.tsx` | Archive + recreate | 536 → 300 lines | 2 hours |
| P2 | `HubHomePage.tsx` | 2-level entry | -100 lines | 2 hours |
| P3 | `ide.$projectId.tsx` | Add route guard | +50 lines | 2 hours |

**Total Estimated Time**: 8 hours 30 minutes

### Order of Fixes

1. **Phase 1** (Critical Path - 1 hour):
   - Fix #1: Project selection navigation (30 min)
   - Fix #2: Add Dexie verification (20 min)
   - Test both fixes (10 min)

2. **Phase 2** (Device Detection - 1 hour):
   - Fix #3: Device detection (1 hour)
   - Test on various screen sizes (15 min)

3. **Phase 3** (Wizard Simplification - 2 hours):
   - Fix #4: Archive wizard + create 2-step (2 hours)
   - Test wizard flow (15 min)

4. **Phase 4** (Hub Restructure - 2 hours):
   - Fix #5: 2-level entry system (2 hours)
   - Test hub flow (15 min)

5. **Phase 5** (Route Guards - 2 hours):
   - Fix #6: Add route guards (2 hours)
   - Test IDE route with invalid project (15 min)

### Success Criteria

**Each fix is complete when**:
1. ✅ Code compiles without TypeScript errors
2. ✅ Console logs show expected behavior
3. ✅ User can complete the workflow without errors
4. ✅ DevTools Console shows no errors
5. ✅ Fix is tested on desktop and mobile (if applicable)

---

## Migration Plan

### Rollback Strategy

If any fix breaks functionality:
1. Revert to git commit before fix
2. Document what went wrong
3. Create issue tracker ticket
4. Proceed with next fix

### Version Control

**Recommended Git Workflow**:
```bash
# For each fix, create feature branch
git checkout -b fix/project-selection-navigation
# Make changes
git add .
git commit -m "Fix: Project selection uses TanStack Router instead of window.location"
# Push to remote
git push origin fix/project-selection-navigation
# Create PR for review
```

---

## Conclusion

### Fundamental Truths Status

| # | Truth | Compliance | Fix Priority |
|---|-------|------------|--------------|
| 1 | Client-side only | ✅ PASS | N/A |
| 2 | BYOK with Tanstack AI SDK | ✅ PASS | N/A |
| 3 | Project-centric unique IDs | ⚠️ PARTIAL | P0 |
| 4 | Device parity (Desktop=FSA, Mobile=IDB) | ❌ FAIL | P1 |
| 5 | Thread management | ⚠️ PARTIAL | P3 |
| 6 | Consistent UX (hot-load) | ❌ FAIL | P0 |
| 7 | Agent permissions | ✅ PASS | N/A |
| 8 | Rendering support | ✅ PASS | N/A |
| 9 | State boundaries (Zustand vs Dexie) | ❌ FAIL | P0 |
| 10 | Technical hygiene (ID routing) | ❌ FAIL | P0 |
| 11 | Dexie+FSA research | ✅ PASS | N/A |
| 12 | Edge cases | ⚠️ PARTIAL | P3 |

**Overall Compliance**: 8 of 12 fundamental truths (67%) have critical failures

### Critical Issues Summary

**Blocker Issues** (Must fix first):
1. Project selection uses `window.location.href` → Full page reload, UI collapse
2. No Dexie verification before navigation → Projects may not exist
3. Device detection uses screen width → Changes on resize, violates ADR-033

**Non-Blocker Issues** (Fix after blockers):
4. Wizard too complex (536 lines, 5 steps)
5. No 2-level entry system
6. No route guards for IDE

### Next Steps

1. **Review this synthesis report** with user
2. **Approve fix order and priorities**
3. **Delegate implementation to dev-ext** with tool constraints
4. **Monitor progress through console logs**
5. **Validate fixes after each phase**

---

**Report End**
