# EPIC-UX-01: Skeptic Audit Remediation - Critical UX Fixes

> **Version:** 1.0.0  
> **Created:** 2026-01-13  
> **Status:** PENDING_APPROVAL  
> **Health Impact:** CRITICAL - 11 P0 issues identified  
> **Source Audit:** `UX-AUDIT-COMPLETE-2026-01-13.md`

---

## EPIC OVERVIEW

This epic addresses the critical UX issues identified in the comprehensive skeptic audit conducted on 2026-01-13. The audit examined sidebar navigation, project creation flows, toast/notification system, and routing guards from multiple user perspectives (new/returned user x desktop/mobile).

### Epic Metrics

| Metric | Value |
|--------|-------|
| Total Issues | 47 |
| P0 Critical | 11 |
| P1 High | 19 |
| P2 Medium | 17 |
| Estimated Effort | 4 weeks |

---

## OBJECTIVES

### Primary Objectives

1. **Eliminate User Blocking:** Fix all P0 issues where users get stuck with no way forward
2. **Clear Navigation Paths:** Ensure every navigation leads to a clear destination
3. **Actionable Feedback:** All errors provide clear next steps
4. **Platform Detection Accuracy:** Correctly detect device type and capabilities

### Secondary Objectives

1. **Consistent Terminology:** Unify naming across sidebar and hub cards
2. **Proper Empty States:** Provide actionable options in all empty states
3. **Toast System Improvement:** Add descriptions and action buttons

---

## RELATED ARTIFACTS

| Artifact | Location | description |
|----------|----------|---------|
| Full Audit Report | `_bmad-output/audit/UX-AUDIT-COMPLETE-2026-01-13.md` | Complete findings |
| Toast Audit | `_bmad-output/audit/toast-system-audit-2026-01-13.md` | Toast findings |
| Routing Audit | `_bmad-output/audit/routing-guard-audit-2026-01-13.md` | Route guards |
| Sidebar Audit | `_bmad-output/audit/sidebar-navigation-audit-2026-01-13.md` | Navigation |
| Project Creation Audit | `_bmad-output/audit/project-creation-audit-2026-01-13.md` | Creation flows |

---

## STORIES BREAKDOWN

### Phase 1: Critical Fixes (Week 1)

| Story ID | Name | Effort | Priority |
|----------|------|--------|----------|
| UX-01-01 | Fix RecentProjectsSection Handler | 0.5h | P0 |
| UX-01-02 | Fix handleNewProject for Mobile | 0.5h | P0 |
| UX-01-03 | Add Wizard to IDE Empty State | 4h | P0 |
| UX-01-04 | Disable Knowledge/Study Sidebar Items | 1h | P0 |
| UX-01-05 | Add IndexDB Guard to IDE Route | 2h | P0 |
| UX-01-06 | Add Mobile+FSA Guard to Notes | 2h | P0 |
| UX-01-07 | Fix Platform Detection | 6h | P0 |

### Phase 2: High Priority (Week 2)

| Story ID | Name | Effort | Priority |
|----------|------|--------|----------|
| UX-01-08 | Fix/Redirect /workspace Route | 4h | P1 |
| UX-01-09 | Fix Terminal Card Behavior | 1h | P1 |
| UX-01-10 | Verify About Route | 0.5h | P1 |
| UX-01-11 | Create Toast Helper with Actions | 4h | P1 |
| UX-01-12 | Add Actions to Critical Toasts | 8h | P1 |

### Phase 3: Medium Priority (Week 3-4)

| Story ID | Name | Effort | Priority |
|----------|------|--------|----------|
| UX-01-13 | Add Descriptions to All Toasts | 12h | P2 |
| UX-01-14 | Consolidate Toast Systems | 8h | P2 |
| UX-01-15 | Add Storage Type Education | 2h | P2 |
| UX-01-16 | Add Project Settings Dialog | 8h | P2 |
| UX-01-17 | Add Workspace Binding Validation | 6h | P2 |

---

## PHASE 1: CRITICAL FIXES

### Story UX-01-01: Fix RecentProjectsSection Handler

**Story ID:** `UX-01-01`  
**Priority:** P0 (Critical)  
**Effort:** 0.5 hours  
**Status:** Pending

**Description:** The "New Project" button in RecentProjectsSection triggers FSA picker (`handleNewProject`) instead of the wizard (`handleOpenProjectCreationWizard`). This breaks mobile users who cannot use FSA.

**Files to Modify:**
- `src/presentation/components/hub/HubHomePage.tsx` (line 417)

**Change:**
```typescript
// FROM:
onNewProject={handleNewProject}
// TO:
onNewProject={handleOpenProjectCreationWizard}
```

**Acceptance Criteria:**
- [ ] Mobile user clicks "New Project" -> wizard opens
- [ ] Desktop user clicks "New Project" -> wizard opens
- [ ] FSA picker is only triggered by explicit "Mount Project" flow

---

### Story UX-01-02: Fix handleNewProject for Mobile

**Story ID:** `UX-01-02`  
**Priority:** P0 (Critical)  
**Effort:** 0.5 hours  
**Status:** Pending

**Description:** When `handleNewProject()` detects no FSA support (mobile), it shows a toast and returns early. No alternative is offered to mobile users.

**Files to Modify:**
- `src/presentation/components/hub/HubHomePage.tsx` (lines 171-181)

**Change:**
```typescript
// FROM:
if (!isFSASupported) {
  toast.info('Folder Mounting Not Available', { description: '...', duration: 8000 });
  return;  // User stuck!
// TO:
if (!isFSASupported) {
  toast.info('Creating a new project...', { description: 'Opening project wizard' });
  setProjectCreationWizardOpen(true);
  return;
}
```

**Acceptance Criteria:**
- [ ] Mobile user triggers handleNewProject -> wizard opens
- [ ] Toast message is clear and helpful
- [ ] No blocking behavior

---

### Story UX-01-03: Add Wizard to IDE Empty State

**Story ID:** `UX-01-03`  
**Priority:** P0 (Critical)  
**Effort:** 4 hours  
**Status:** Pending

**Description:** IDE empty state currently only offers "Start Coding" (temp project) and "Open Existing Project" (FSA picker). Missing option: "Custom Setup" with full wizard.

**Files to Modify:**
- `src/routes/ide.tsx`
- `src/presentation/components/ide/IDEEmptyState.tsx`

**Acceptance Criteria:**
- [ ] IDE empty state shows 3 options: "Start Coding", "Open Existing", "Custom Setup"
- [ ] "Custom Setup" opens ProjectCreationWizard
- [ ] Wizard defaults to FSA storage (required for IDE)

---

### Story UX-01-04: Disable Knowledge/Study Sidebar Items

**Story ID:** `UX-01-04`  
**Priority:** P0 (Critical)  
**Effort:** 1 hour  
**Status:** Pending

**Description:** Knowledge and Study sidebar items show "Coming in Phase 2" but are clickable. Should be visually disabled with tooltip.

**Files to Modify:**
- `src/presentation/components/layout/MainSidebar.tsx` (lines 164-166)

**Acceptance Criteria:**
- [ ] Knowledge/Study items appear grayed out
- [ ] Hover shows tooltip: "Coming in Phase 2"
- [ ] Click does nothing (or shows inline message)

---

### Story UX-01-05: Add IndexDB Guard to IDE Route

**Story ID:** `UX-01-05`  
**Priority:** P0 (Critical)  
**Effort:** 2 hours  
**Status:** Pending

**Description:** IDE route currently only checks for mobile. Should also check for storage type - IndexDB projects cannot work in IDE.

**Files to Modify:**
- `src/routes/ide.$projectId.tsx` (lines 40-66)

**Change:** Add storage type validation in beforeLoad:
```typescript
// Add after mobile check:
if (project.storageType === 'indexeddb') {
  throw redirect({
    to: '/notes/$projectId',
    params,
    search: { reason: 'storage-type-mismatch' }
  });
}
```

**Acceptance Criteria:**
- [ ] IndexDB project -> IDE route -> redirect to Notes with reason
- [ ] FSA project -> IDE route -> allowed
- [ ] Toast explains why redirected

---

### Story UX-01-06: Add Mobile+FSA Guard to Notes

**Story ID:** `UX-01-06`  
**Priority:** P0 (Critical)  
**Effort:** 2 hours  
**Status:** Pending

**Description:** When mobile user with FSA project is redirected from IDE to Notes, FSA storage doesn't work in Notes. Need guard to detect and handle this case.

**Files to Modify:**
- `src/routes/notes.$projectId.tsx`

**Acceptance Criteria:**
- [ ] Mobile user with FSA project -> Notes route
- [ ] Guard detects mobile+FSA
- [ ] Shows clear error: "FSA projects require IDE workspace"
- [ ] Option to create new IndexedDB project

---

### Story UX-01-07: Fix Platform Detection

**Story ID:** `UX-01-07`  
**Priority:** P0 (Critical)  
**Effort:** 6 hours  
**Status:** Pending

**Description:** Current platform detection uses only viewport width. Should combine viewport + user agent + touch capability for accurate detection.

**Files to Modify:**
- `src/hooks/useMediaQuery.ts`
- `src/infrastructure/filesystem/platform-detection.ts`

**Acceptance Criteria:**
- [ ] 11" laptop at 900px width -> classified as desktop
- [ ] Tablet in portrait mode -> classified as tablet
- [ ] Touch laptop -> detected as desktop with touch support
- [ ] FSA picker only shown when actually supported

---

## EPIC ACCEPTANCE CRITERIA

### All P0 Issues Resolved

- [ ] No users blocked with no way forward
- [ ] Mobile users can create projects
- [ ] IDE only accepts FSA projects
- [ ] All error toasts have action buttons

### Navigation Works Correctly

- [ ] No infinite loops
- [ ] Empty states have actionable options
- [ ] Disabled items are visually indicated
- [ ] Clear paths to all workspaces

### Platform Detection Accurate

- [ ] Desktop with narrow window -> desktop UI
- [ ] Mobile users -> mobile UI
- [ ] FSA only available when supported

---

## SUCCESS METRICS

| Metric | Target | Current |
|--------|--------|---------|
| P0 Issues Remaining | 0 | 11 |
| P1 Issues Remaining | <=5 | 19 |
| User Blocking Reports | 0 | Unknown |
| Navigation Loop Reports | 0 | Unknown |
| Toast Action Rate | 100% | ~2% |

---

## NOTES

### Dependencies

- Story UX-01-07 (Platform Detection) is prerequisite for UX-01-01, UX-01-02, UX-01-05, UX-01-06

### Risks

- Changing platform detection may affect existing users
- Toast changes require comprehensive testing
- Route guards may break existing workflows

### Mitigation

- Test on staging before production
- Add feature flags for gradual rollout
- Provide migration path for affected users

---

## CHANGELOG

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-13 | EXCALIBUR | Initial creation from audit |

---

**Document ID:** `epic-ux-01-2026-01-13.md`  
**Status:** PENDING_APPROVAL - Awaiting user authorization to proceed

---

## QUICK APPROVAL FORM

To approve this epic and proceed with Phase 1 (Critical Fixes), respond with:

```
APPROVE: EPIC-UX-01
```

To approve specific stories only, list them:

```
APPROVE: UX-01-01, UX-01-02, UX-01-04
```

To request changes:

```
REQUEST CHANGES: [explanation]
```

---

*End of Document*
