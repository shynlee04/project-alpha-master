---
title: "EPIC-ARCH-01: Foundation Cleanup"
type: "duplicate-epic"
archived_by: "MASTERCORDINATION-SESSION-2026-01-26"
archived_date: "2026-01-26"
original_path: "/bmad-output/planning-artifacts/epics/EPIC-ARCH-01-foundation-cleanup-2026-01-20.md"
archive_path: "/bmad-ext/.archive/planning/epics/"
duplicate_of: "None"
superseded_by: "EPIC-CC-AR02AR03 (for overlapping stories), EPIC-CONSOLIDATION (for cleanup stories)"
reason: "Epic overlap with newer epics. Stories superseded by EPIC-CC-AR02AR03 and EPIC-CONSOLIDATION."
status: "SUPEDEDDED"
---
# EPIC-ARCH-01: Foundation Cleanup

**Epic ID:** EPIC-ARCH-01
**Created:** 2026-01-20
**Status:** PROPOSED
**Priority:** P0
**Estimated Duration:** 1-2 days (AI agent time)
**Team:** Both (Team A + Team B parallel)
**ADR Reference:** ADR-034

---

## Epic Summary

Clean up the foundation before architectural refactor. This epic removes dead ends, consolidates entry points, and creates the base for Project-Centric Architecture.

---

## Problem Statement

1. **11 instances of `window.location.href`** causing full page reloads (SPA state loss)
2. **7 project creation paths** causing duplicate projects, lost handles
3. **Knowledge/Study UI elements** showing but redirecting to Notes (confusing UX)
4. **Wizard with 23 options** where 48% are low-value
5. **2 project pointers out of sync** (projects + fsaHandles tables)

---

## Stories

### Story ARCH-01-01: Remove All window.location.href (P0)
**Effort:** 2 hours
**Team:** Team A

Replace all 11 instances of `window.location.href` with TanStack Router `navigate()`:

| File | Line | Current Use | Replacement |
|------|------|-------------|-------------|
| useFileTreeActions.ts | 140,150,160 | `/hub` redirect | `navigate({ to: '/hub' })` |
| mobile-error-handling.ts | 138,240 | `/` redirect | `navigate({ to: '/' })` |
| error-handling.ts | 117 | `/` redirect | `navigate({ to: '/' })` |
| notification-manager.ts | 260 | link navigation | `navigate({ to: notification.link })` |
| useCommandPalette.ts | 56 | path navigation | `navigate({ to: path })` |

**Acceptance Criteria:**
- [ ] 0 instances of `window.location.href` for navigation (grep returns 0)
- [ ] All navigation uses TanStack Router navigate()
- [ ] TypeScript: 0 new errors
- [ ] Build succeeds

---

### Story ARCH-01-02: Consolidate Project Creation Paths (P0)
**Effort:** 4 hours
**Team:** Team B

Reduce 7 creation paths to 2:

**KEEP (Canonical):**
1. `createProjectFromFolder()` - FSA projects (desktop)
2. `getOrCreateBrowserModeProject()` - IndexedDB projects (mobile)

**REMOVE/REDIRECT:**
3. ❌ `createTempProject()` → redirect to #2
4. ❌ `useFileOpsSlice.openFolder()` → redirect to #1
5. ❌ `ProjectCreationWizard.handleCreate()` → call #1 or #2 based on storage type
6. ❌ `useProjectStore.createProject()` → internal only, not entry point
7. ❌ Inline creation in HubHomePage → call #1

**Acceptance Criteria:**
- [ ] Only 2 public project creation functions exist
- [ ] All other paths redirect to canonical functions
- [ ] Deprecated functions have console.warn() pointing to canonical
- [ ] No duplicate project creation on folder open
- [ ] TypeScript: 0 new errors

---

### Story ARCH-01-03: Archive Knowledge/Study UI (P1)
**Effort:** 2 hours
**Team:** Team A

Remove confusing UI elements that redirect silently:

**Remove from Hub:**
- [ ] KNOWLEDGE bento card (or hide with feature flag)
- [ ] STUDY bento card (or hide with feature flag)
- [ ] navigateToWorkspace() cases for 'knowledge' and 'study'

**Remove from Sidebar:**
- [ ] Knowledge option in workspace selector
- [ ] Study option in workspace selector

**Keep Routes (for future):**
- `/knowledge.$projectId` → redirect to `/notes.$projectId` with toast
- `/study.$projectId` → redirect to `/notes.$projectId` with toast

**Acceptance Criteria:**
- [ ] No silent redirects - user sees toast explaining deferral
- [ ] Hub shows only functional workspaces (IDE, Notes)
- [ ] Sidebar shows only functional workspaces
- [ ] Routes exist but redirect with explanation
- [ ] TypeScript: 0 new errors

---

### Story ARCH-01-04: Simplify Project Wizard (P1)
**Effort:** 3 hours
**Team:** Team B

Reduce wizard complexity from 23 options to essential only:

**REMOVE (Low-Value Options):**
- [ ] Agent Selection Step (Phase 1 detached, no functionality)
- [ ] Project Type dropdown (no downstream effect)
- [ ] Workspace binding toggles for Knowledge/Study (deferred)

**KEEP (Essential Options):**
- Project name (auto-filled from folder)
- Storage type (auto-selected based on platform)
- IDE binding toggle (for desktop FSA only)
- Notes binding toggle (always enabled by default)

**SIMPLIFY:**
- Desktop flow: Folder picker → project created → navigate
- Mobile flow: Name input → IndexedDB project → navigate to Notes

**Acceptance Criteria:**
- [ ] Wizard has ≤10 options (down from 23)
- [ ] Agent Selection step removed
- [ ] Knowledge/Study binding toggles hidden
- [ ] Platform auto-detects storage type
- [ ] TypeScript: 0 new errors

---

### Story ARCH-01-05: Sync Project Pointers (P0)
**Effort:** 3 hours
**Team:** Team A

Ensure `projects` table and `fsaHandles` table stay in sync:

**Problem:**
- `projects.storageMetadata` = null (can't serialize handle)
- `fsaHandles.handleData` = actual handle
- These can get out of sync → permissions fail

**Solution:**
- Create `ProjectHandleService` that manages both tables atomically
- On project creation: insert into both tables in transaction
- On project deletion: delete from both tables in transaction
- On handle restoration: update both tables

**Acceptance Criteria:**
- [ ] All project operations use ProjectHandleService
- [ ] No direct writes to fsaHandles table outside service
- [ ] Transaction ensures atomic updates
- [ ] Handle restoration updates project.lastOpened
- [ ] TypeScript: 0 new errors

---

### Story ARCH-01-06: Fix TypeScript Errors (P0)
**Effort:** 1 hour
**Team:** Team B

Fix existing TypeScript errors detected:

1. **HubHomePage.tsx:238,248** - `fsaHandle` not in router state type
   - Either extend router state type OR pass handle differently

2. **dexie-db.ts:49,54** - `IDEStateRecord` not exported
   - Export from dexie-db-core-types.ts

**Acceptance Criteria:**
- [ ] `pnpm tsc --noEmit` returns 0 errors
- [ ] All route state types correctly defined
- [ ] All Dexie types exported properly

---

## Dependencies

```
ARCH-01-01 (window.location.href) - No dependencies
ARCH-01-02 (Creation paths) - No dependencies
ARCH-01-03 (Archive UI) - No dependencies
ARCH-01-04 (Wizard) - Depends on ARCH-01-02
ARCH-01-05 (Sync pointers) - Depends on ARCH-01-02
ARCH-01-06 (TS errors) - No dependencies
```

---

## Success Criteria for Epic

| Metric | Before | After |
|--------|--------|-------|
| window.location.href instances | 11 | 0 |
| Project creation paths | 7 | 2 |
| Wizard options | 23 | ≤10 |
| Silent redirects | 2 (Knowledge/Study) | 0 |
| TypeScript errors | 4 | 0 |
| Project/Handle sync issues | Yes | No (atomic) |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Breaking existing flows | Run test suite after each story |
| User confusion from removed UI | Toast messages explain deferrals |
| Handle sync race conditions | Use Dexie transactions |

---

## Next Epic

After ARCH-01 completion, proceed to **EPIC-ARCH-02: Feature Plugins** which converts workspace-specific components into reusable plugins.
