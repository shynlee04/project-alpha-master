# COMPREHENSIVE UX & ARCHITECTURAL AUDIT REPORT
**Skeptical Product Manager • Harsh Architect • Perfectionist Developer Perspectives**

**Audit Date:** 2026-01-15
**Auditors:** 6 Parallel Deep-Scan Agents
**Scope:** New/Returned User Journeys • Platform Enforcement • Routing • Persistence • Feedback
**Status:** 🔴 **CRITICAL ISSUES FOUND**

---

## EXECUTIVE SUMMARY

**Overall Grade:** 🔴 **D- (35%)** - Critical User Experience Failures

This audit reveals **FUNDAMENTAL ARCHITECTURAL VIOLATIONS** that directly contradict the stated requirements:

| Requirement | Status | Severity |
|-------------|--------|----------|
| Desktop users → File System for IDE | ❌ FAIL | 🔴 CRITICAL |
| Mobile users → NO File System option | ❌ FAIL | 🔴 CRITICAL |
| Phone users → Browser DB only | ❌ FAIL | 🔴 CRITICAL |
| One browser DB per workspace | ❌ FAIL | 🔴 CRITICAL |
| Users cannot create multiple DBs | ❌ FAIL | 🟠 HIGH |
| Clear user feedback at all steps | ❌ FAIL | 🟠 HIGH |

**Key Finding:** The system relies on "hints" and "badges" rather than **enforced platform detection**. Users can create projects with inappropriate storage types, access wrong workspaces, and experience data leakage between workspaces.

---

## PART 1: NEW USER EXPERIENCE AUDIT

### Scenario 1: Desktop User Creating First Project

**Expected Flow:**
1. Lands on Hub → Sees "Create Project"
2. Opens wizard → Storage defaults to **File System Access**
3. Selects folder → Creates project
4. Navigates to `/ide/$projectId` with file system access

**Actual Flow (BROKEN):**
```
Hub → Click "Create Project"
  ↓
Wizard opens → Storage defaults to 'indexeddb' ❌ (Line 88 of ProjectCreationWizard.tsx)
  ↓
Desktop user sees TWO options:
  - "Browser Storage" ✅ Mobile + Desktop  (SELECTED BY DEFAULT)
  - "File System Access" 💻 Desktop only
  ↓
User can proceed with 'indexeddb' selected ❌ NO VALIDATION
  ↓
Creates project WITHOUT IDE workspace access ❌
  ↓
Routed to Notes/Knowledge instead of IDE ❌
```

**Critical Issues:**

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | Default storage is 'indexeddb' for ALL users | `ProjectCreationWizard.tsx:88` | Desktop users must manually switch to FSA |
| 2 | No platform detection in wizard | `ProjectCreationWizard.tsx` | No auto-selection based on device |
| 3 | Desktop can create project without IDE access | `ProjectCreationWizard.tsx:281-285` | User expects IDE, gets Notes workspace |
| 4 | No warning when wrong storage chosen | `ProjectDetailsStep.tsx:254-300` | Silent failure of expectations |
| 5 | IDE workspace disabled but still visible | `WorkspaceSetupStep.tsx:238-299` | Confusing UX - shows unavailable option |

### Scenario 2: Mobile User Creating First Project

**Expected Flow:**
1. Lands on Hub → Sees "Create Project"
2. Opens wizard → Only "Browser Storage" shown
3. No folder selection required
4. Creates project → Navigates to Notes workspace

**Actual Flow (BROKEN):**
```
Hub → Click "Create Project"
  ↓
Wizard opens → Shows BOTH storage options ❌
  ↓
Mobile user sees "Desktop only" File System option ❌
  ↓
User CAN click "File System Access" button ❌
  ↓
Then clicks "Select folder..." → Gets error toast ❌
  ↓
Confusing error - no guidance to choose Browser Storage ❌
```

**Critical Issues:**

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | FSA option NOT hidden on mobile | `ProjectDetailsStep.tsx:254-300` | Violates "NO file system option" requirement |
| 2 | Error shown AFTER choice made | `ProjectDetailsStep.tsx:94-99` | User frustration - wasted clicks |
| 3 | No mobile-specific messaging | Entire wizard | Mobile users see desktop UI |
| 4 | Validation happens too late | `ProjectCreationWizard.tsx:210-212` | Should prevent, not error after |

---

## PART 2: RETURNED USER EXPERIENCE AUDIT

### Scenario 1: Desktop User Loading Existing File System Project

**Expected Flow:**
1. Lands on Hub → Sees recent projects
2. Clicks project card → Automatic permission restoration
3. "Access restored" confirmation
4. IDE loads with file access

**Actual Flow (BROKEN):**
```
Hub → Click project card
  ↓
Navigate to /ide/$projectId
  ↓
❌ CRITICAL BUG: Restoration condition NEVER executes
  (Line 74: checks `!restoredProject.storageMetadata` - ALWAYS FALSE)
  ↓
Permission state set to 'prompt' immediately ❌
  ↓
User sees "Permission Required" overlay ❌
  ↓
Must MANUALLY click "Restore Access" every visit ❌
  ↓
NO feedback during restoration process ❌
```

**Critical Issues:**

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | Broken restoration condition | `ide.$projectId.tsx:74` | Handle restoration NEVER runs |
| 2 | No automatic restoration attempt | `use-file-loader-slice.ts:121` | Permission overlay shown immediately |
| 3 | No permission state on project cards | `ProjectCard.tsx:176-181` | Can't identify projects needing access |
| 4 | No feedback during restoration | Entire flow | Users confused about what's happening |
| 5 | Silent failures | `handle-persistence.ts` | No error messages when restoration fails |

### Scenario 2: Desktop User Loading Browser DB Project (Notes)

**Status:** ✅ **WORKS CORRECTLY**
- Browser DB projects auto-grant permission
- No permission prompt needed
- Loading state shown during fetch

---

## PART 3: PLATFORM ENFORCEMENT AUDIT

### Critical Violations

**🔴 VIOLATION #1: Mobile Users Can Access IDE Route**

```typescript
// src/routes/ide.$projectId.tsx - NO PLATFORM CHECK
export const Route = createFileRoute('/ide/$projectId')({
  ssr: false,
  loader: async ({ params }) => {
    const project = await getProject(params.projectId);  // ❌ No storage check
    return { project };
  },
  component: () => <IDEWorkspace />,
});
```

**Impact:** Mobile users can navigate directly to `/ide/$projectId` URL and see broken IDE interface.

**🔴 VIOLATION #2: No Storage Type Enforcement**

```typescript
// HubHomePage.tsx:226-254 - handleOpenRecentProject
const handleOpenRecentProject = (projectId: string) => {
  const project = (projects || []).find(p => p.id === projectId);
  if (isEnabled(bindings?.ide)) {
    navigate({ to: '/ide/$projectId', params: { projectId } });  // ❌ No storage check
  }
};
```

**Impact:** Routes to IDE for ANY project with `ide: true` binding, even if storage is 'indexeddb'.

**🔴 VIOLATION #3: WorkspaceSwitcher Shows Invalid Options**

```typescript
// WorkspaceSwitcher.tsx:204-238
const enabledWorkspaces = ['hub', 'ide', 'notes', 'knowledge', 'study'];  // ❌ Static list
// Renders ALL options regardless of platform/storage type
```

**Impact:** Mobile users see IDE option; IndexDB project users see IDE option.

### Platform Detection Utilities (EXIST BUT UNUSED)

| Function | Location | Used in Routes? |
|----------|----------|-----------------|
| `isDesktopPlatform()` | `platform-detection.ts` | ❌ NO |
| `useCapabilityDetection()` | `useCapabilityDetection.ts` | ❌ NO |
| `showMobileWorkspaceRedirect()` | `mobile-error-handling.ts` | ⚠️ Manual only |

**Root Cause:** Platform detection utilities exist but are **NOT used in routing logic**.

---

## PART 4: BROWSER DATABASE ISOLATION AUDIT

### Critical Security Violations

**🔴 CRITICAL: Single Database for ALL Workspaces**

```typescript
// dexie-db-class.ts:204
export class ViaGentDatabase extends Dexie {
  constructor() {
    super('via-gent-persistence');  // ❌ ONE database for ALL workspaces
  }
}
```

**Impact:**
- IDE data MIXED with Notes data
- Knowledge workspace can READ IDE data
- Study workspace can MODIFY Notes data
- **No physical isolation between workspaces**

**🔴 CRITICAL: No Workspace Filtering in Queries**

```typescript
// Pattern found throughout dexie-db.ts
export async function getAllFileMetadata(projectId: string): Promise<FileMetadataRecord[]> {
  return db.fileMetadata.where('projectId').equals(projectId).toArray();
  // ❌ MISSING: where('workspaceId').equals(currentWorkspace)
}
```

**Searched for:** `where('workspaceId')` queries → **ZERO instances found**

**🔴 CRITICAL: 9 Separate Independent Databases**

| Database | DB Name | Has workspaceId? |
|----------|---------|-----------------|
| FlashcardDatabase | `FlashcardDB` | ❌ NO |
| QuizDatabase | `ProjectAlphaQuizDB` | ⚠️ Has but unused |
| StudyDatabase | `StudyDB` | ❌ NO |
| ConversationDatabase | `ViaGentConversationDB` | ❌ NO |
| ... | ... | ... |

**Impact:** Flashcards created in IDE appear in Study workspace. Quizzes from Knowledge appear in Notes workspace. **Complete data mixing.**

---

## PART 5: USER FEEDBACK AUDIT

### Critical Gaps

**Overall Grade:** ⚠️ **C+ (70%)**

**40+ console-only errors** - users left uninformed.

| Operation | Current | Expected | Severity |
|-----------|---------|----------|----------|
| Project Loading | Silent spinner | "Loading..." → "Loaded" | 🔴 CRITICAL |
| Workspace Switching | Silent (console only) | "Switching to [Workspace]..." | 🔴 CRITICAL |
| Sync Start | Silent | "Syncing files..." | 🟠 HIGH |
| Sync Complete | Silent | "All files synced" | 🟠 HIGH |
| Sync Failed | Console error only | Toast: "Sync failed: [reason]" | 🔴 CRITICAL |
| Permission Expired | Technical error | "Folder access expired - please re-select" | 🔴 CRITICAL |

**Example of Missing Feedback:**

```typescript
// WorkspaceSwitcher.tsx:130 - Current (WRONG)
const handleWorkspaceSwitch = async (workspace: WorkspaceType) => {
  console.log('[WorkspaceSwitcher] Switching to workspace:', workspace)  // ❌
  try {
    await workspaceTransitionManager.transitionTo(workspace)
    switchWorkspace(workspace)
  } catch (error) {
    console.error('[WorkspaceSwitcher] Failed:', error)  // ❌ NO USER TOAST
  }
}

// Should be:
const handleWorkspaceSwitch = async (workspace: WorkspaceType) => {
  toast.loading(`Switching to ${workspace}...`, { id: 'workspace-switch' })
  try {
    await workspaceTransitionManager.transitionTo(workspace)
    switchWorkspace(workspace)
    toast.success(`Switched to ${workspace}`, { id: 'workspace-switch' })
  } catch (error) {
    toast.error('Failed to switch workspace', {
      description: error.message,
      id: 'workspace-switch'
    })
  }
}
```

---

## PART 6: CRITICAL ISSUES SUMMARY

### By Severity

**🔴 P0 - CRITICAL (Security/Data Integrity)**

| # | Issue | Files | Effort |
|---|-------|-------|--------|
| 1 | Mobile users can access IDE route | `ide.$projectId.tsx` | 2h |
| 2 | No storage type validation in routes | Multiple routes | 3h |
| 3 | Single database for all workspaces | `dexie-db-class.ts` | 3-5 days |
| 4 | No workspace filtering in queries | `dexie-db.ts` (50+ files) | 1-2 weeks |
| 5 | 9 separate databases with no isolation | Multiple files | 1 week |
| 6 | Broken FSA handle restoration | `ide.$projectId.tsx:74` | 1h |

**🟠 P1 - HIGH (User Experience)**

| # | Issue | Files | Effort |
|---|-------|-------|--------|
| 1 | FSA option not hidden on mobile | `ProjectDetailsStep.tsx` | 2h |
| 2 | Default storage wrong for desktop | `ProjectCreationWizard.tsx:88` | 1h |
| 3 | Hub doesn't filter by storage type | `HubHomePage.tsx:226` | 2h |
| 4 | WorkspaceSwitcher shows invalid options | `WorkspaceSwitcher.tsx` | 2h |
| 5 | No permission state on project cards | `ProjectCard.tsx` | 2h |
| 6 | No feedback during restoration | Multiple files | 3h |
| 7 | Silent workspace switching | `WorkspaceSwitcher.tsx` | 1h |
| 8 | No project loading feedback | Route loaders | 2h |

**🟡 P2 - MEDIUM (Polish)**

| # | Issue | Files | Effort |
|---|-------|-------|--------|
| 1 | Missing success toasts | Multiple | 4h |
| 2 | Technical jargon in errors | Multiple | 3h |
| 3 | No loading states | Multiple | 2h |

---

## PART 7: RECOMMENDED FIXES

### Immediate (This Week)

**Fix 1: Add Route Guards**
```typescript
// ide.$projectId.tsx
beforeLoad: async ({ params }) => {
  const isMobile = isMobileDevice()
  if (isMobile) {
    throw redirect({ to: '/notes' })
  }
  const project = await getProject(params.projectId)
  if (project?.storageType !== 'fsa') {
    throw redirect({ to: '/notes/$projectId', params: { projectId: params.projectId } })
  }
}
```

**Fix 2: Platform Detection in Wizard**
```typescript
// ProjectCreationWizard.tsx
const { isMobile } = useDeviceType()
const initialStorageType = isMobile ? 'indexeddb' : 'fsa'
```

**Fix 3: Hide FSA on Mobile**
```typescript
// ProjectDetailsStep.tsx
const availableTypes = isMobile
  ? STORAGE_TYPES.filter(t => t.value === 'indexeddb')
  : STORAGE_TYPES
```

**Fix 4: Fix Restoration Logic**
```typescript
// ide.$projectId.tsx:74 - REMOVE the broken condition
// BEFORE:
if (restoredProject?.storageType === 'fsa' && !restoredProject.storageMetadata)

// AFTER:
if (restoredProject?.storageType === 'fsa')
```

### Short-term (Next Sprint)

**Fix 5: Filter WorkspaceSwitcher**
```typescript
// WorkspaceSwitcher.tsx
const enabledWorkspaces = allWorkspaces.filter(ws => {
  if (ws === 'ide') {
    return !isMobile && project?.storageType === 'fsa'
  }
  return true
})
```

**Fix 6: Add Toast Feedback**
- Workspace switching
- Project loading
- Restoration status
- Sync operations

### Long-term (Major Refactoring)

**Fix 7: Database Per Workspace**
```typescript
export function createWorkspaceDb(workspaceId: WorkspaceType): ViaGentDatabase {
  return new ViaGentDatabase(`via-gent-persistence-${workspaceId}`)
}
```

**Fix 8: Query Layer Update**
- Add `workspaceId` parameter to ALL queries
- Use compound indexes `[projectId+workspaceId]`
- Update 50-100 files

**Fix 9: Consolidate Separate DBs**
- Migrate data with workspace context
- Delete legacy databases
- Update all imports

---

## PART 8: TESTING CHECKLIST

Before any fixes are considered complete:

- [ ] Mobile user cannot see FSA option in wizard
- [ ] Mobile user cannot navigate to `/ide/` route (auto-redirect)
- [ ] Desktop user defaults to FSA storage
- [ ] Desktop user creating IndexDB project gets warning
- [ ] Hub routes IndexDB projects to Notes, not IDE
- [ ] WorkspaceSwitcher filters options by platform/storage
- [ ] Project cards show permission state
- [ ] Restoration attempt happens automatically
- [ ] Toasts shown for all critical operations
- [ ] Each workspace has separate IndexedDB
- [ ] Queries filter by workspaceId
- [ ] No cross-workspace data leakage

---

## PART 9: EFFORT ESTIMATE

| Priority | Effort | Duration |
|----------|--------|----------|
| P0 - Route guards & wizard | 8-12 hours | 1-2 days |
| P1 - UX improvements | 12-16 hours | 2-3 days |
| P2 - Polish | 8-10 hours | 1-2 days |
| Database isolation | 80-120 hours | 3-4 weeks |
| **TOTAL (without DB refactor)** | **28-38 hours** | **4-5 days** |
| **TOTAL (with DB refactor)** | **108-158 hours** | **4-5 weeks** |

---

## PART 10: CONCLUSION

**Current State:** The application has **FUNDAMENTAL UX VIOLATIONS** that directly contradict stated requirements:

1. ❌ Desktop users can create projects WITHOUT IDE access
2. ❌ Mobile users CAN see File System option
3. ❌ Routes don't validate platform or storage type
4. ❌ Browser databases are NOT isolated per workspace
5. ❌ Users are left without feedback during critical operations

**Risk Level:** HIGH
- User frustration and confusion
- Data leakage between workspaces
- Support burden from broken flows
- Potential compliance violations (GDPR/SOC2)

**Recommendation:** Implement P0 fixes immediately (1-2 days) to address the most critical user-facing issues. Plan database isolation refactoring as a separate architectural epic.

---

**Audit Complete.**

**Agent IDs for Reference:**
- New User Journey: `ac39d2c`
- Returned User Journey: `a2bbfad`
- Platform Enforcement: `a558e61`
- Routing: `ab8a746`
- Database Isolation: `a1064c0`
- User Feedback: `ae4b3a3`

**Generated:** 2026-01-15
**Status:** Awaiting user review and prioritization
