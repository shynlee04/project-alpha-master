# Debug Handoff: Hub Flow & Project Creation Issues

**Date**: 2026-01-22
**Version**: 1.0.0
**Status**: READY FOR IMPLEMENTATION
**Type**: DEBUG SESSION HANDOFF

---

## Executive Summary

**User-Reported Issues** (2 turns):

### Turn 1: New User - Desktop Project Creation
1. Device detection uses screen size (violates fundamental truth)
2. "Failed to create project. Please try again."
3. Wizard too complex (needs 2-step simple flow, 8-bit styling, Eng+Vi support)

### Turn 2: Returning User - Project Selection
1. Click project icon → UI collapse, no hot load (no Monaco, no file tree)
2. "Allow open folder" loads random folder → doesn't register to project, no hot load

**Root Cause**: 4 critical issues + 2 medium issues identified

---

## Investigation Summary

### Phase 0: Context Collection ✅
**Files Analyzed**:
- `/src/presentation/components/hub/HubHomePage.tsx` - Main hub entry point
- `/src/presentation/components/hub/ProjectPickerDialog.tsx` - Project selection dialog
- `/src/presentation/components/project/ProjectCreationWizard.tsx` - Multi-step wizard (536 lines)
- `/src/infrastructure/filesystem/platform-contract.ts` - Platform detection logic
- `/src/infrastructure/filesystem/handle-persistence.ts` - FSA handle persistence
- `/src/infrastructure/persistence/stores/project/project-crud-slice.ts` - CRUD operations

### Phase 1: Architecture Assessment ✅
**Analyst**: architect-ext
**Report**: `_bmad-output/debug-infrastructure/architect-hub-flow-analysis-2026-01-22.md`
**Issues Identified**: 6 (2 critical, 2 high, 2 medium)

### Phase 2: UX Research ✅
**Analyst**: analyst-ext
**Report**: `_bmad-output/debug-infrastructure/ux-patterns-research-2026-01-22.md`
**Findings**:
- 8-bit design patterns (8bitcn/ui as reference)
- Simplified 2-step wizard UX (beats 5-step flows)
- Bento grid layouts for dashboards
- i18next for English + Vietnamese support

### Phase 3: Code Analysis ✅
**Analyst**: dev-ext
**Report**: `_bmad-output/debug-infrastructure/code-analysis-diagnostics-2026-01-22.md`
**Status**: All 6 issues confirmed through code-level analysis

### Phase 4: Testing Strategy ⏭️
**Status**: SKIPPED per user request
**Reason**: User wants fundamental truth verification first, not testing yet

### Phase 5: Synthesis ✅
**Report**: `_bmad-output/debug-infrastructure/synthesis-fundamental-truth-verification-2026-01-22.md`
**Findings**: 8 of 12 fundamental truths violated (67% compliance)

---

## Fundamental Truth Verification

### Checklist Results

| # | Fundamental Truth | Status | Gap/Violation |
|---|------------------|--------|---------------|
| 1 | Client-side only (server for LLMs/APIs) | ✅ PASS | None |
| 2 | BYOK with Tanstack AI SDK | ✅ PASS | None |
| 3 | Project-centric with unique IDs | ⚠️ PARTIAL | Race condition in creation |
| 4 | Device parity (Desktop=FSA, Mobile=IDB) | ❌ FAIL | Device detection uses screen width |
| 5 | Thread management (Project+Workspace tied) | ⚠️ PARTIAL | Not validated before navigation |
| 6 | Consistent UX (state/persistence/hotload) | ❌ FAIL | UI collapse, no hot load |
| 7 | Agent permissions via tools | ✅ PASS | Not in scope |
| 8 | Rendering support | ✅ PASS | Not in scope |
| 9 | State management boundaries (Zustand vs Dexie) | ❌ FAIL | No verification before navigation |
| 10 | Technical hygiene (hooks, hydration, ID routing) | ❌ FAIL | `window.location.href`, race conditions |
| 11 | Dexie+FSA research | ✅ PASS | Implementation correct |
| 12 | Edge cases (agent CRUD during edits) | ⚠️ PARTIAL | Not validated |

**Compliance Rate**: 67% (8/12 truths passing)

---

## Critical Issues Summary

### 🔴 Blocker Issues (Must Fix First)

| Issue | Impact | Root Cause | Fix Priority |
|-------|--------|-------------|--------------|
| **Issue #3**: Project selection uses `window.location.href` | CRITICAL | Full page reload, state loss | P0 (30 min) |
| **Issue #2**: No Dexie verification before navigation | CRITICAL | Race condition, project may not exist | P0 (20 min) |
| **Issue #4**: Device detection uses screen width | HIGH | Violates ADR-033, device type changes on resize | P1 (1 hour) |

### 🟡 Non-Blocker Issues

| Issue | Impact | Fix Priority |
|-------|--------|--------------|
| **Issue #1**: Three conflicting project creation paths | MEDIUM | Confusion, inconsistent error handling | P2 (2 hours) |
| **Issue #5**: No 2-level entry system | MEDIUM | Too many entry points, confusing UX | P2 (2 hours) |
| **Issue #6**: Missing project validation | LOW | Wizard too complex (536 lines) | P3 (next sprint) |

---

## Fix Strategy

### Phase 1: Critical Path (1-2 hours)

#### Fix #3: Project Selection Navigation (P0 - 30 min)
**File**: `src/presentation/components/hub/ProjectPickerDialog.tsx`
**Line**: 173
**Change**: Replace `window.location.href` with `await navigate()`
**Impact**: Fixes UI collapse, restores hot load
**Diagnostic Logs**:
```typescript
console.log('[ProjectPickerDialog] Project selected:', { projectId, projectName, folderPath, targetWorkspace });
console.log('[ProjectPickerDialog] Updating last opened timestamp...');
await useProjectStore.getState().updateLastOpened(project.id);
console.log('[ProjectPickerDialog] ✅ Last opened updated');
console.log('[ProjectPickerDialog] Navigating via TanStack Router:', { targetRoute, projectId });
await navigate({ to: `/${targetWorkspace}/$projectId`, params: { projectId: project.id } });
console.log('[ProjectPickerDialog] Navigation complete:', { route, timestamp: Date.now() });
```

#### Fix #2: Add Dexie Verification (P0 - 20 min)
**File**: `src/presentation/components/hub/HubHomePage.tsx`
**Lines**: 227-234, 156-184
**Change**: Add `await db.projects.get(newProjectId)` before navigation
**Impact**: Prevents navigation to non-existent projects
**Diagnostic Logs**:
```typescript
console.log('[HubHomePage] Created project in Zustand:', newProjectId);
console.log('[HubHomePage] Waiting for Dexie verification...');
const verifiedProject = await db.projects.get(newProjectId);
if (!verifiedProject) {
  console.error('[HubHomePage] ⚠️ CRITICAL: Project not found in Dexie!', { projectId, timestamp: Date.now() });
  toast.error(t('hub.projectCreateFailed'), { description: 'Project was not saved to database.' });
  return;
}
console.log('[HubHomePage] ✅ Project verified in Dexie:', verifiedProject.id, { name, folderPath, timestamp: Date.now() });
```

---

### Phase 2: Device Detection (P1 - 1 hour)

#### Fix #4: Device Detection (P1 - 1 hour)
**File**: `src/infrastructure/filesystem/platform-contract.ts`
**Lines**: 132-172
**Change**: Remove screen width from `detectDeviceType()`
**Impact**: Fixes platform detection stability, prevents mid-session changes
**Diagnostic Logs**:
```typescript
console.log('[PlatformContract] Device type detected:', deviceType, {
  userAgent: navigator.userAgent,
  screenWidth: window.screen.width,
  hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  timestamp: Date.now()
});

// Add resize listener
window.addEventListener('resize', () => {
  const newDeviceType = detectDeviceType();
  if (newDeviceType !== deviceType) {
    console.error('[PlatformContract] ⚠️ Device type changed on resize:', {
      from: deviceType,
      to: newDeviceType,
      screenWidth: window.screen.width,
      timestamp: Date.now()
    });
  }
});
```

---

### Phase 3: Wizard Simplification (P2 - 2 hours)

#### Fix #1: Archive Current Wizard (P2 - 15 min)
**File**: `src/presentation/components/project/ProjectCreationWizard.tsx`
**Action**: Move to `_bmad-ext/.archive/complex-wizard-2026-01-22/`

#### Fix #2: Create 2-Step Wizard (P2 - 1h 45min)
**File**: `src/presentation/components/project/SimpleProjectWizard.tsx` (NEW)
**Structure**:
```typescript
const SIMPLE_WIZARD_STEPS = [
  { id: 1, titleKey: 'wizard.steps.projectName', optional: false },
  { id: 2, titleKey: 'wizard.steps.create', optional: false },
];

// Step 1: Project identity (name, description, type, icon)
// Step 2: Show platform detection + create button
// Size target: ≤300 lines
```
**Features**:
- 2-step wizard (user requirement met)
- 8-bit design (no glassmorphism, sharp corners)
- English + Vietnamese support via i18next
- Platform-aware (shows FSA/IndexedDB per `getPlatformContract()`)
- Size: ≤300 lines

---

### Phase 4: 2-Level Entry System (P2 - 2 hours)

#### Fix #5: Restructure Hub (P2 - 2 hours)
**File**: `src/presentation/components/hub/HubHomePage.tsx`
**Change**: Simplify to clear 2-level hierarchy
**Structure**:
```typescript
// Level 1: Recent Projects (Primary Entry)
<section className="recent-projects">
  <h2>Recent Projects</h2>
  <ProjectList projects={recentProjects} />
  <Button onClick={handleCreateNewProject}>Create New Project</Button>
</section>

// Level 2: Workspaces (Secondary Navigation)
<section className="workspaces">
  <h2>Workspaces</h2>
  <WorkspaceNav /> {/* Notes, IDE, Knowledge, Study */}
</section>
```
**Impact**: Clear UX, meets governance requirements

---

### Phase 5: Route Guards (P3 - next sprint)

#### Fix #6: Add IDE Route Guard (P3 - 2 hours)
**File**: `src/routes/ide.$projectId.tsx`
**Change**: Add `beforeLoad` route guard to verify project integrity
**Structure**:
```typescript
export const Route = createFileRoute('/ide/$projectId', {
  beforeLoad: async ({ params }) => {
    const { projectId } = params;
    const project = await db.projects.get(projectId);
    
    if (!project) {
      throw redirect({ to: '/hub', search: { error: 'project-not-found' } });
    }
    
    // Check if project has valid FSA handle
    if (project.storageType === 'fsa') {
      const hasValidHandle = project.storageMetadata?.handleId !== undefined;
      if (!hasValidHandle) {
        throw redirect({ to: '/hub', search: { error: 'handle-not-valid' } });
      }
    }
  },
  component: IDEWorkspace,
});
```
**Impact**: Prevents broken IDE loads, shows clear errors

---

## Migration Plan

### Step 1: Pre-Implementation Backup
```bash
# Create backup branch
git checkout -b debug-backup-before-fixes
git push origin debug-backup-before-fixes
```

### Step 2: Create Feature Branches
```bash
# For each fix phase
git checkout -b fix/project-selection-navigation
git checkout -b fix/dexie-verification
git checkout -b fix/device-detection
git checkout -b fix/simple-wizard
git checkout -b fix/hub-restructure
```

### Step 3: Implementation Order
1. **Critical Path** (must complete together):
   - Fix #3: Project selection navigation (30 min)
   - Fix #2: Dexie verification (20 min)
   - Test both fixes together (10 min)

2. **Device Detection**:
   - Fix #4: Device detection (1 hour)
   - Test on various screen sizes (15 min)

3. **Wizard Simplification**:
   - Archive current wizard (15 min)
   - Create new 2-step wizard (1h 45min)
   - Test wizard flow (15 min)

4. **Hub Restructure**:
   - Fix #5: 2-level entry (2 hours)
   - Test hub flow (15 min)

5. **Route Guards** (next sprint):
   - Fix #6: IDE route guard (2 hours)
   - Test route guard (15 min)

### Step 4: Validation
```bash
# After each phase
pnpm tsc --noEmit
pnpm vitest run
```

---

## Files to Modify (Summary)

| Priority | File | Change Type | Lines Changed | Est. Time |
|----------|------|-------------|---------------|------------|
| P0 | `ProjectPickerDialog.tsx` | Fix navigation | 1 line + 10 logs | 30 min |
| P0 | `HubHomePage.tsx` | Add verification | 20 lines + 20 logs | 20 min |
| P1 | `platform-contract.ts` | Fix device detection | -10 lines + 10 logs | 1 hour |
| P2 | `ProjectCreationWizard.tsx` | Archive | Delete (archived elsewhere) | 15 min |
| P2 | `SimpleProjectWizard.tsx` | Create new | ~300 lines | 1h 45min |
| P2 | `HubHomePage.tsx` | 2-level entry | -100 lines (simplify) | 2 hours |
| P3 | `ide.$projectId.tsx` | Add route guard | +50 lines | 2 hours |

**Total Estimated Time**: 8 hours 30 minutes

---

## Success Criteria

### Each Fix Phase Complete When:
1. ✅ TypeScript compiles without errors
2. ✅ Console logs show expected behavior (no errors)
3. ✅ User can complete workflow without errors
4. ✅ Fix tested on desktop and mobile (if applicable)
5. ✅ DevTools Console shows clean logs (no red errors)

### Overall Session Complete When:
1. ✅ All P0 fixes implemented and validated
2. ✅ Device detection fixed and stable
3. ✅ Wizard simplified to 2-step flow
4. ✅ Hub restructured with clear 2-level entry
5. ✅ Console logs cleaned up (remove debug logs after validation)
6. ✅ All tests passing
7. ✅ Build completes successfully

---

## Risk Assessment

### Low Risk
- Wizard simplification (creates new file, old file archived)
- Hub restructure (simplifies existing code)

### Medium Risk
- Device detection fix (changes core logic)
- Dexie verification (adds async step, potential timing issues)

### High Risk
- Project selection navigation fix (changes critical path)
  - **Mitigation**: Test thoroughly on desktop before merging
  - **Rollback**: Revert to backup branch if hot load breaks

---

## References

### Investigation Reports
- `_bmad-output/debug-infrastructure/architect-hub-flow-analysis-2026-01-22.md`
- `_bmad-output/debug-infrastructure/ux-patterns-research-2026-01-22.md`
- `_bmad-output/debug-infrastructure/code-analysis-diagnostics-2026-01-22.md`
- `_bmad-output/debug-infrastructure/synthesis-fundamental-truth-verification-2026-01-22.md`

### Fundamental Truth Document
- `/check-list-for-fundamental-truth.md`

### ADR Documents
- `_bmad-output/planning-artifacts/adr/ADR-033-correct-course-architectural-remediation-2026-01-16.md`

---

## Next Steps for Implementation Agent

### Immediate Actions (P0 - Today)
1. Create backup branch: `debug-backup-before-fixes`
2. Fix #3: Project selection navigation (30 min)
3. Fix #2: Dexie verification (20 min)
4. Test both fixes together (10 min)
5. Verify hot load works correctly

### Today/Tomorrow (P1)
6. Fix #4: Device detection (1 hour)
7. Test on various screen sizes (15 min)
8. Archive complex wizard (15 min)
9. Create new 2-step wizard structure (1h 45min)

### This Week (P2)
10. Implement 2-step wizard (remaining work)
11. Restructure hub with 2-level entry (2 hours)
12. Test all flows end-to-end

### Next Sprint (P3)
13. Add IDE route guard (2 hours)

---

## Approval Required

Before proceeding with implementation, please confirm:

1. ✅ **Fix order approved?** Critical path first (Fix #3, #2), then device detection
2. ✅ **Wizard approach approved?** Archive old, create new 2-step wizard
3. ✅ **Hub restructure approved?** Simplify to 2-level entry system
4. ✅ **Rollback strategy understood?** Use backup branch if issues arise
5. ✅ **Console logging approach approved?** Add specific logs as shown in handoff

**Response**: "Approve to proceed" or "Modify plan"

---

**Handoff Status**: READY FOR IMPLEMENTATION

**Created By**: ext-master-enhanced
**Date**: 2026-01-22
**Session**: ses_4376c7275ffeJ2QyzylcfvQnhA
