# Architecture Evaluation Report: Spike Phase 3

**Generated:** 2026-01-16
**Purpose:** Evaluate architecture plan against actual main app implementation

---

## Executive Summary

This evaluation compares the **architecture plan from ADR-033** against the **actual main app implementation** for Notes and IDE workspaces.

**Key Finding:** The main app has **severe architectural violations** that contradict ADR-033 decisions. However, for spike mirroring purposes, we will **copy the code AS-IS** and document all issues via `@spike-copy` comments.

**ADR-033 Compliance Score:** 6/10 (Partial)

---

## ADR-033 Decisions vs Actual Implementation

### Decision D1: Platform Detection & Routing

| Decision | Expected | Actual | Status |
|----------|----------|---------|--------|
| **Use getPlatformContract()** | Components call `getPlatformContract()` to detect platform | Components use direct feature detection (`'showDirectoryPicker' in window`) | ❌ **NOT FOLLOWED** |
| **Auto-detect storage type** | No user choice - auto-detect FSA vs IndexedDB | Auto-detection implemented in `StorageAdapterFactory` | ✅ **FOLLOWED** |
| **Desktop with FSA → IDE** | Desktop users with FSA can access IDE | Platform guard implemented, but uses direct detection | ⚠️ **PARTIAL** |

**Evidence:**
- `NotesFilePicker.tsx:74` - `const isFSASupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;`
- Should be: `const platform = getPlatformContract(); platform.canAccessFSA;`

---

### Decision D2: FSA Handle Persistence

| Decision | Expected | Actual | Status |
|----------|----------|---------|--------|
| **Store handles in IndexedDB** | `FSAHandleRecord` table stores handles | FSA handle storage implemented | ✅ **FOLLOWED** |
| **Chrome 122+ "Allow on every visit"** | Permission persistence strategy | Handle persistence via IndexedDB | ✅ **FOLLOWED** |

**Evidence:**
- `dexie-db.ts` has `storeFSAHandle()` and `getFSAHandle()` functions
- Handles stored in `fsaHandles` table in IndexedDB

---

### Decision D3: Notes Storage

| Decision | Expected | Actual | Status |
|----------|----------|---------|--------|
| **FSA folder (/project/notes/\*.md)** | Notes stored in FSA project folder | Notes stored in project folder via FSA | ✅ **FOLLOWED** |
| **Bidirectional sync** | BlockNote ↔ Markdown sync | `MarkdownSyncService` implemented | ✅ **FOLLOWED** |

---

### Decision D6: Dexie Schema Keys

| Decision | Expected | Actual | Status |
|----------|----------|---------|--------|
| **Composite keys [projectId+workspaceId]** | All tables use composite keys | Composite keys properly defined | ✅ **FOLLOWED** |

**Evidence:**
- All tables use `workspaceId: 'ide' | 'knowledge' | 'study' | 'notes'`
- Primary keys: `[projectId+workspaceId+path]`, `[projectId+workspaceId]`, etc.

---

## Critical Architecture Violations (Block Spike Without Remediation)

### P0: Direct Dexie Access in Presentation Layer

**Issue:** Components bypass Zustand stores and query Dexie directly

**Files Affected:**
1. `ProjectsPage.tsx:15, 91, 184, 191` - `useLiveQuery(() => db.projects.toArray())`
2. `HubHomePage.tsx:4, 65, 285, 292` - Same pattern
3. `ProjectPickerDialog.tsx:21, 127` - Same pattern
4. `AISlashCommand.tsx:49` - Direct DB access for SavedBlockRecord
5. `NoteSidebar.tsx:24` - Type import from dexie-db
6. `NoteTree.tsx:14` - Type import from dexie-db
7. `NoteContextMenu.tsx:31` - Type import from dexie-db

**Impact:**
- Breaks layer separation (should be: Component → Zustand Store → Service/Repository → Dexie)
- Makes testing difficult
- Creates state sync issues (Zustand + useLiveQuery used simultaneously)

**ADR-033 Violation:** Yes - Presentation layer not using abstraction layer

---

### P0: Direct FSA API Calls

**Issue:** Components call `window.showDirectoryPicker()` and use `FileSystemFileHandle` directly

**Files Affected:**
1. `NotesFilePicker.tsx:74-84` - `const handle = await window.showDirectoryPicker();`
2. `ProjectFilesPanel.tsx` - Accepts `FileSystemFileHandle` as prop
3. `FileTree/FileTree.tsx` - Same pattern
4. `FileTree/hooks/useFileTreeActions.ts` - Same pattern
5. `FileTree/hooks/useFileTreeState.ts` - Same pattern
6. `IDEMobileLayout.tsx` - Same pattern

**Impact:**
- Bypasses StorageGateway abstraction
- Duplicates platform detection logic
- Tight coupling to FSA API

**ADR-033 Violation:** Yes - StorageGateway exists but not used

---

### P1: localStorage/sessionStorage Usage

**Issue:** State stored outside Zustand/Dexie architecture

**Files Affected:**
1. `VideoBlock.tsx:156, 211` - `sessionStorage.setItem/getItem` for video caching
2. `IDEMobileLayout.tsx:56, 65` - `localStorage.getItem/setItem` for panel state
3. `IconSidebar.tsx:63-75` - `localStorage.getItem/setItem` for sidebar state

**Impact:**
- State not persisted properly (sessionStorage lost on refresh)
- Duplicate state sources (localStorage + Zustand)
- Sync issues

**ADR-033 Violation:** Yes - Should use Zustand stores with Dexie persistence

---

### P1: Missing PlatformContract Usage

**Issue:** Components use direct feature detection instead of `getPlatformContract()`

**Files Affected:**
1. All components checking platform capabilities
2. Same as "Direct FSA API Calls" above

**Impact:**
- Duplicates platform detection logic
- Inconsistent platform checks
- Maintenance burden

**ADR-033 Violation:** Yes - `platform-detection.ts` exists but not used by presentation layer

---

## Architecture Plan Gaps & Contradictions

### Gap 1: Plan Assumes Clean Architecture, Reality Has Violations

**Plan Expectation:** Presentation layer uses Stores → Services → Repositories → Dexie
**Reality:** Presentation layer directly accesses Dexie in 8+ components

**Contradiction:** Plan describes clean separation, but implementation bypasses layers

---

### Gap 2: Plan Assumes StorageGateway Usage, Reality Has Direct FSA Calls

**Plan Expectation:** Components use `StorageGateway` abstraction
**Reality:** Components call `window.showDirectoryPicker()` directly

**Contradiction:** StorageGateway exists (`storage-gateway-factory.ts`) but presentation layer bypasses it

---

### Gap 3: Plan Assumes PlatformContract, Reality Has Direct Detection

**Plan Expectation:** Components call `getPlatformContract()` for platform info
**Reality:** Components check `'showDirectoryPicker' in window` directly

**Contradiction:** Platform detection infrastructure exists but not used by presentation layer

---

## State Management Issues

### Issue 1: Reactive State Duplication

**Pattern:** Some components use `useLiveQuery` (direct Dexie), others use Zustand stores

**Impact:**
- State can get out of sync between Dexie and Zustand
- Race conditions when both sources update
- Inconsistent UX across components

**Examples:**
- `ProjectsPage` uses `useLiveQuery(() => db.projects.toArray())`
- `NotesPage` uses `useWorkspaceProjects()` (Zustand)

---

### Issue 2: Cross-Workspace State Coupling

**Pattern:** `NotesPage.tsx` watches `useIDEStore((s) => s.projectId)` for project changes

**Impact:**
- Tight coupling between workspaces
- IDE store as "single source of truth"
- Questionable architecture

**Evidence:** `NotesPage.tsx:99-107`
```typescript
const ideProjectId = useIDEStore((s) => s.projectId);
useEffect(() => {
  if (ideProjectId && ideProjectId !== projectId) {
    console.log('[NotesPage] Project changed in IDE store, navigating:', ideProjectId);
    navigate({ to: `/notes/${ideProjectId}` });
  }
}, [ideProjectId, projectId, navigate]);
```

---

## For Spike Mirroring (Phase 3)

### Copy As-Is Strategy

**Decision:** Copy main app code AS-IS, including all violations

**Rationale:**
- Spike should mirror main app behavior for accurate testing
- Documenting violations helps understand remediation priorities
- Spike is isolated environment, safe to include issues

**Action:** Add `@spike-copy` comments to document:
- P0 issues (direct Dexie access)
- P1 issues (localStorage usage)
- Missing PlatformContract usage
- Dead codes/orphanage included
- Overlaps documented

**Comment Pattern:**
```typescript
// @spike-copy-source: src/routes/notes.$projectId.lazy.tsx (main app)
// Notes:
// - Desktop users: Use FSA handle storage (NOT localStorage)
// - State is hotload and reactive
// - No bouncing back between workspaces
// - Project ID format: proj_{uuid}
// Remediation: Handle missing fileTreeSnapshot prop, add snapshot sync
//
// @spike-copy-notes
// This code copied from main app to provide isolated testing environment
// Contains platform guards, state management, file system operations
// Current issues (to be documented):
//   1. Direct Dexie access in presentation layer (P0)
//   2. PlatformContract not used by components (P1)
// REMEDIATION PRIORITY: P0 (address after routing works)
```

---

## Remediation Priority

### P0 (Critical - Must Fix After Spike)
1. **R1:** Eliminate Direct Dexie Access in Presentation Layer (8 hours)
2. **R2:** Eliminate Direct FSA API Calls (12 hours)
3. **R3:** Implement PlatformContract Usage (6 hours)
4. **R4:** Eliminate localStorage/sessionStorage Bypass (4 hours)

**Total Effort:** 30 hours

### P1 (High - Fix After P0)
5. **R5:** Eliminate Reactive State Duplication (6 hours)
6. **R6:** Refactor State Storage to Use Services (8 hours)
7. **R7:** Decouple Cross-Workspace State (4 hours)

**Total Effort:** 18 hours

### P2 (Medium - Technical Debt)
8. **R8:** Document sessionStorage Hydration Workaround (2 hours)

**Total Effort:** 2 hours

---

## Recommendations

### For Phase 3 Spike Mirroring

1. **Copy code AS-IS** including all architectural violations
2. **Document all violations** with `@spike-copy` comments
3. **Update routing paths** to `/spike/*` pattern
4. **Implement platform guards** using `getPlatformContract()` (even if main app doesn't)
5. **Test all user journeys** from `check-list-for-fundamental-truth.md`

### For Phase 4+ Remediation

1. **Apply P0 fixes first** (30 hours total)
2. **Then apply P1 fixes** (18 hours total)
3. **Finally address P2 issues** (2 hours total)
4. **Update ADR-033** with new decisions if needed
5. **Re-run architecture scan** to verify compliance

---

## Conclusion

The main app has **severe architectural violations** that contradict ADR-033 decisions. However, for Phase 3 spike mirroring, we will:

1. **Copy the code AS-IS** to create accurate mirror of main app
2. **Document all violations** with `@spike-copy` comments
3. **Follow routing best practices** from TanStack Router (platform guards, loaders)
4. **Implement entry matrix** correctly (desktop/mobile guards)
5. **Defer remediation** to Phase 4+ (30+ hours of work)

This approach allows spike to serve as isolated testing environment that accurately reflects current main app behavior while providing clear documentation of all issues that need remediation.

---

**Report Generated:** 2026-01-16
**Generated By:** dev-ext agent
**Time:** 30 min timebox respected
