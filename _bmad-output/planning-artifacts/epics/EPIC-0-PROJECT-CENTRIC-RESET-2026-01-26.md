# EPIC-0: Project-Centric Foundation Reset
## Phase 1A Blocker Epic - Complete End-to-End Stabilization

---

## Metadata

```yaml
epic_id: "EPIC-0"
title: "Project-Centric Foundation Reset"
version: "3.0.0"
status: "DRAFT"
priority: "P0-BLOCKER"
phase: "1A"
author: "BMAD Master Agent"
created: "2026-01-26T19:30:00+07:00"
updated: "2026-01-26T19:30:00+07:00"

blocking:
  - "Phase 1A Feature Development"
  - "All subsequent epics"

remediates:
  - "Workspace-centric pollution"
  - "Device routing chaos"
  - "Chaotic routing structure"
  - "Legacy context conflicts"

parent_documents:
  - "new-fundamental-truths.md v2.0.0"
  - "docs/the-3-phase-approach.md"
  - "docs/architecture.md"
  - "ADR-034: Project-Centric Architecture"

sprint_status_ref: "_bmad-output/sprint-artifacts/sprint-status-2026-01-26.yaml"
```

---

## Executive Summary

This EPIC serves as the **BLOCKER** for Phase 1A. No feature development can proceed until this epic is complete and validated. The epic addresses three critical failures:

1. **Workspace-Centric Pollution**: Architecture uses "workspace" concepts that must be "project-centric"
2. **Device Routing Chaos**: Unclear guards/blocking between FSA (desktop) vs IndexedDB (mobile/tablet)
3. **Routing Structure Chaos**: Multiple conflicting routes instead of single `/$projectId`

### Success Criteria

| Criterion | Validation |
|-----------|------------|
| Route structure | ONLY `/hub` and `/$projectId` exist |
| Project creation | Works end-to-end with correct storage type |
| Project access | Loads correctly with proper gateway |
| Device detection | Platform determines plugins correctly |
| FileTree | Shows files for FSA projects |
| No legacy context | Zero "workspace" references in active code |

---

## Section 1: Files Inventory

### 1.1 Files Safe for Immediate Archival (100%)

These files have NO imports or usage in active code and can be safely archived.

| File | Reason | Import Check | Export Check |
|------|--------|--------------|--------------|
| `src/routes/ide.tsx` | Deprecated route, redirects only | ✅ No imports | ✅ No exports used |
| `src/routes/ide.$projectId.tsx` | Deprecated route, redirects only | ✅ No imports | ✅ No exports used |
| `src/routes/notes.lazy.tsx` | Deprecated route entry | ✅ No imports | ✅ No exports used |
| `src/routes/notes.$projectId.tsx` | Deprecated route | ✅ No imports | ✅ No exports used |
| `src/routes/workspace/` (directory) | Legacy workspace routes | ✅ Verify | ✅ Verify |
| `src/lib/workspace/` (33 files) | Legacy workspace lib | 🔍 SCAN REQUIRED | 🔍 SCAN REQUIRED |
| `src/presentation/components/workspace/` (10 files) | Legacy UI | 🔍 SCAN REQUIRED | 🔍 SCAN REQUIRED |
| `src/infrastructure/persistence/stores/workspace-store-facade.ts` | Legacy store | 🔍 SCAN REQUIRED | 🔍 SCAN REQUIRED |
| `src/infrastructure/persistence/stores/workspace-store-factory.ts` | Legacy store | 🔍 SCAN REQUIRED | 🔍 SCAN REQUIRED |

**Action Required:**
- Story EPIC-0-01 will perform deep import/export scanning
- Generate `safe-to-archive-2026-01-26.csv` with complete tracking

### 1.2 Partially Legacy Files (Cannot Archive Yet)

These files contain legacy code BUT are still imported/used.

| File | Legacy Portion | Active Portion | Tracking |
|------|----------------|----------------|----------|
| `src/infrastructure/persistence/stores/workspace/` (17 files) | Workspace-specific state | Project state logic | Track in EPIC-0-02 |
| `src/infrastructure/persistence/stores/project/useWorkspaceProjects.ts` | Name uses "Workspace" | Project filtering logic | Rename in EPIC-0-03 |
| `src/i18n/en.json` - `ide.*` keys (30) | IDE namespace | Active translations | Migrate in EPIC-0-04 |
| `src/i18n/en.json` - `workspace*` keys (121) | Workspace namespace | Active translations | Migrate in EPIC-0-04 |
| `src/plugins/filetree/FileTreePlugin.tsx` | Uses `ide.*` keys | Plugin logic correct | Migrate in EPIC-0-04 |

**Deprecation Roadmap:**

| File/Item | Current State | Target Epic | Status |
|-----------|---------------|-------------|--------|
| `workspace/` stores | Partially used | EPIC-0-02 | Merge to project stores |
| `useWorkspaceProjects` | Name pollution | EPIC-0-03 | Rename to `useProjectsByStorage` |
| `ide.*` translations | 30 keys | EPIC-0-04 | Namespace to `project.filetree.*` |
| `workspace*` translations | 121 keys | EPIC-0-04 | Namespace to `project.*` |

### 1.3 Highly Inconsistent Items

| Issue | Files Affected | Consolidation Target | Epic |
|-------|----------------|---------------------|------|
| Dual filesystem implementations | `lib/filesystem/` (59) + `infrastructure/filesystem/` (32) | Single `infrastructure/filesystem/` | EPIC-0-05 |
| Dual events implementations | `lib/events/` (11) + `infrastructure/events/` (3) | Single `infrastructure/events/` | EPIC-0-05 |
| Dual sync implementations | `lib/filesync/` (15) + `infrastructure/sync/` (81) | Single `infrastructure/sync/` | EPIC-0-05 |
| Store duplication | `ide/` stores, `workspace/` stores | Single `project/` stores | EPIC-0-06 |
| Translation namespace chaos | `ide.`, `notes.`, `workspace` | Project-centric namespaces | EPIC-0-04 |

---

## Section 2: End-to-End User Journey

### 2.1 Project Creation Flow

```
USER → Hub → "Create Project" button
    ↓
Platform Detection (detectPlatform())
    ├── Desktop + FSA available → Show folder picker
    │   ↓
    │   User selects folder → FSA handle acquired
    │   ↓
    │   Handle persisted (handlePersistenceService)
    │   ↓
    │   Project record created (Dexie) with storageType: 'fsa'
    │   ↓
    │   Navigate to /$projectId with initialHandle
    │
    └── Mobile/Tablet OR no FSA → Show name prompt
        ↓
        Project record created (Dexie) with storageType: 'indexeddb'
        ↓
        Navigate to /$projectId (no handle needed)
```

### 2.2 Project Access Flow

```
USER → Hub → Click existing project
    ↓
Check project.storageType
    ├── 'fsa' → Attempt handle restoration
    │   ├── Silent restore success → Navigate with handle
    │   └── Permission needed → Show PermissionOverlay → User grants → Navigate
    │
    └── 'indexeddb' → Navigate directly (no handle)
```

### 2.3 Route Load Flow

```
ROUTE: /$projectId
    ↓
LOADER:
├── waitForHydration() - Zustand stores ready
├── Query Dexie for project by ID
├── fromRecord() to create Project entity
└── Return { project }
    ↓
COMPONENT:
├── ProjectContextProvider
│   ├── Initialize platform contract
│   ├── Restore/acquire handles if FSA
│   ├── Create StorageGateway
│   └── Provide context when ALL ready
│       ↓
│       {contextReady ? children : <Loading />}
├── PluginLayout
│   ├── Get enabled plugins from PluginLayoutStore
│   └── Render each plugin panel
│       └── Plugin.MainComponent({ width, height })
└── FileTreePlugin
    ├── useProjectContext() → { gateway }
    ├── gateway.list('.') → entries
    └── Render tree with entries
```

---

## Section 3: Stories

### EPIC-0-01: Deep Import/Export Scanning

**Status:** READY  
**Team:** B  
**Effort:** 2-3h  
**Priority:** P0  

**Acceptance Criteria:**
1. Scan all files in `src/lib/workspace/`
2. Scan all files in `src/presentation/components/workspace/`
3. Scan all files in `src/infrastructure/persistence/stores/workspace/`
4. Generate `safe-to-archive-2026-01-26.csv` with columns:
   - file_path
   - imported_by (list of files that import this file)
   - exports (list of exported symbols)
   - exports_used_by (list of files using each export)
   - safe_to_archive (true/false)
   - notes
5. Generate `partially-legacy-2026-01-26.csv` with deprecation roadmap

**Files to Scan:**
- All `.ts` and `.tsx` files in directories listed above
- Use grep for import patterns
- Use grep for export patterns

**Tracking File:**
```
_bmad-output/migration/EPIC-0-01-import-export-scan-2026-01-26.md
```

---

### EPIC-0-02: Route Structure Cleanup

**Status:** READY  
**Team:** A  
**Effort:** 2-3h  
**Priority:** P0  
**Depends On:** None  

**Acceptance Criteria:**
1. Delete/archive deprecated routes:
   - `src/routes/ide.tsx`
   - `src/routes/ide.$projectId.tsx`
   - `src/routes/notes.lazy.tsx`
   - `src/routes/notes.$projectId.tsx`
   - `src/routes/workspace/` (directory)
2. Verify `src/routes/$projectId.tsx` is single project route
3. Verify `src/routes/hub.tsx` is single hub route
4. Verify `src/routes/index.tsx` redirects to `/hub`
5. No TypeScript errors after changes
6. routeTree.gen.ts regenerated and clean

**Files to Modify:**
| File | Action | Notes |
|------|--------|-------|
| `src/routes/ide.tsx` | DELETE | Archive to `_bmad-ext/.archive/` |
| `src/routes/ide.$projectId.tsx` | DELETE | Archive |
| `src/routes/notes.lazy.tsx` | DELETE | Archive |
| `src/routes/notes.$projectId.tsx` | DELETE | Archive |
| `src/routes/workspace/` | DELETE | Archive entire directory |
| `src/routes/$projectId.tsx` | VERIFY | Should be THE project route |

**Tracking File:**
```
_bmad-output/migration/EPIC-0-02-route-cleanup-2026-01-26.md
```

---

### EPIC-0-03: ProjectContext Race Condition Fix

**Status:** READY  
**Team:** A  
**Effort:** 3-4h  
**Priority:** P0  
**Depends On:** EPIC-0-02  

**Root Cause:** (From Chaos Analysis)
- Context provides `null` during async initialization
- Children render immediately with null context
- `useProjectContext()` throws or plugins receive null gateway

**Acceptance Criteria:**
1. ProjectContextProvider does NOT render children until context is ready
2. Loading state shown during initialization
3. Error state shown if initialization fails
4. All plugins use `useProjectContextSafe()` or receive guaranteed non-null context
5. FileTree shows files for FSA projects
6. FileTree shows virtual files for IndexedDB projects

**Files to Modify:**
| File | Changes |
|------|---------|
| `src/infrastructure/context/project-context.tsx` | Conditional children rendering |
| `src/plugins/filetree/FileTreePlugin.tsx` | Use safe context hook |
| `src/plugins/monaco/MonacoPlugin.tsx` | Use safe context hook |
| `src/plugins/notes/NotesPlugin.tsx` | Use safe context hook |
| `src/plugins/chat/ChatPlugin.tsx` | Use safe context hook |
| `src/plugins/terminal/TerminalPlugin.tsx` | Use safe context hook |
| `src/plugins/preview/PreviewPlugin.tsx` | Use safe context hook |

**Implementation:**
```tsx
// project-context.tsx - Line ~416
return (
  <ProjectContext.Provider value={contextValue}>
    {loading ? (
      <ProjectLoadingState />
    ) : error ? (
      <ProjectErrorState error={error} onRetry={retry} />
    ) : contextValue ? (
      children
    ) : (
      <ProjectLoadingState />
    )}
    {showPermissionOverlay && ...}
  </ProjectContext.Provider>
);
```

**Tracking File:**
```
_bmad-output/migration/EPIC-0-03-context-fix-2026-01-26.md
```

---

### EPIC-0-04: Translation Key Migration

**Status:** READY  
**Team:** B  
**Effort:** 2-3h  
**Priority:** P0  
**Depends On:** EPIC-0-03  

**Scope:**
- Migrate 30 `ide.*` keys to project-centric namespace
- Migrate 121 `workspace*` keys to project-centric namespace
- Update all components using these keys

**Translation Key Mapping:**

| Old Key | New Key | Usage |
|---------|---------|-------|
| `ide.noFolderSelected` | `project.filetree.noFolder` | FileTreePlugin |
| `ide.openFolderToView` | `project.filetree.openPrompt` | FileTreePlugin |
| `ide.loading` | `project.loading` | Multiple |
| `ide.fileExplorer` | `project.filetree.title` | Sidebar |
| `ide.noFileOpen` | `project.editor.noFile` | Monaco |
| ... | ... | ... |

**Acceptance Criteria:**
1. All `ide.*` keys renamed in `en.json` and `vi.json`
2. All `workspace*` keys renamed in `en.json` and `vi.json`
3. All component usages updated to new keys
4. No missing translation warnings in console
5. UI displays correctly in both English and Vietnamese

**Files to Modify:**
| File | Changes |
|------|---------|
| `src/i18n/en.json` | Rename keys |
| `src/i18n/vi.json` | Rename keys |
| `src/plugins/filetree/FileTreePlugin.tsx` | Update t() calls |
| `src/plugins/monaco/MonacoPlugin.tsx` | Update t() calls |
| All components with `t('ide.*')` calls | Update t() calls |

**Tracking File:**
```
_bmad-output/migration/EPIC-0-04-translation-migration-2026-01-26.md
```

---

### EPIC-0-05: Duplicate Implementation Consolidation

**Status:** BLOCKED  
**Team:** B  
**Effort:** 6-8h  
**Priority:** P1  
**Depends On:** EPIC-0-01, EPIC-0-03  
**Blocks:** Phase 1A feature work  

**Scope:**
Based on EPIC-0-01 scan results, consolidate:
1. `lib/filesystem/` (59 files) → `infrastructure/filesystem/` (32 files)
2. `lib/events/` (11 files) → `infrastructure/events/` (3 files)
3. `lib/filesync/` (15 files) → `infrastructure/sync/` (81 files)

**Acceptance Criteria:**
1. Single filesystem implementation in `infrastructure/filesystem/`
2. Single events implementation in `infrastructure/events/`
3. Single sync implementation in `infrastructure/sync/`
4. All imports updated to use infrastructure paths
5. Legacy lib directories archived
6. No TypeScript errors

**Tracking File:**
```
_bmad-output/migration/EPIC-0-05-consolidation-2026-01-26.md
```

---

### EPIC-0-06: Store Cleanup

**Status:** BLOCKED  
**Team:** A  
**Effort:** 4-6h  
**Priority:** P1  
**Depends On:** EPIC-0-01, EPIC-0-03  

**Scope:**
1. Migrate `workspace/` stores to `project/` stores
2. Remove `workspace-store-facade.ts`
3. Remove `workspace-store-factory.ts`
4. Rename `useWorkspaceProjects` to `useProjectsByStorage`

**Acceptance Criteria:**
1. No `workspace` named stores in active code
2. All project state in `project/` stores
3. Store hydration works correctly
4. No TypeScript errors

**Tracking File:**
```
_bmad-output/migration/EPIC-0-06-store-cleanup-2026-01-26.md
```

---

### EPIC-0-07: End-to-End Validation

**Status:** BLOCKED  
**Team:** A + B  
**Effort:** 2-3h  
**Priority:** P0  
**Depends On:** EPIC-0-02, EPIC-0-03, EPIC-0-04  

**Test Cases:**

| Test | Expected | Status |
|------|----------|--------|
| Create FSA project on desktop | Folder picker → handle → navigate | ⏳ |
| Create IndexedDB project on mobile | Name prompt → navigate | ⏳ |
| Access existing FSA project | Handle restore or permission overlay | ⏳ |
| Access existing IndexedDB project | Direct navigation | ⏳ |
| FileTree shows files for FSA | Files from disk visible | ⏳ |
| FileTree shows virtual files for IndexedDB | Virtual files visible | ⏳ |
| Monaco opens file from FileTree | Click file → editor opens | ⏳ |
| Platform detection correct | Desktop → FSA available | ⏳ |
| Platform detection correct | Mobile → FSA blocked | ⏳ |
| Route `/hub` works | Shows hub | ⏳ |
| Route `/$projectId` works | Shows project | ⏳ |
| Route `/ide/*` redirects | 404 or redirect to /$projectId | ⏳ |
| Route `/notes/*` redirects | 404 or redirect to /$projectId | ⏳ |

**Tracking File:**
```
_bmad-output/migration/EPIC-0-07-e2e-validation-2026-01-26.md
```

---

## Section 4: Story Dependency Graph

```
EPIC-0-01 (Scan)
    ↓
    ├──→ EPIC-0-05 (Consolidation) ──→ EPIC-0-07 (E2E)
    └──→ EPIC-0-06 (Store Cleanup) ─────────↗

EPIC-0-02 (Routes)
    ↓
EPIC-0-03 (Context Fix)
    ↓
EPIC-0-04 (Translations)
    ↓
EPIC-0-07 (E2E)
```

**Critical Path:**
```
EPIC-0-02 → EPIC-0-03 → EPIC-0-04 → EPIC-0-07 (E2E Validation)
```

---

## Section 5: Sprint Status Integration

**Update to `sprint-status-2026-01-26.yaml`:**

```yaml
# Add to p0_blockers section
- epic_id: "EPIC-0"
  title: "Project-Centric Foundation Reset"
  status: "READY"
  priority: "P0-BLOCKER"
  progress: "0%"
  effort_hours: 20-30
  blocking: "ALL_PHASES"
  
  stories:
    - id: "EPIC-0-01"
      title: "Deep Import/Export Scanning"
      status: "READY"
      team: "B"
      effort: "2-3h"
      
    - id: "EPIC-0-02"
      title: "Route Structure Cleanup"
      status: "READY"
      team: "A"
      effort: "2-3h"
      
    - id: "EPIC-0-03"
      title: "ProjectContext Race Condition Fix"
      status: "READY"
      team: "A"
      effort: "3-4h"
      depends_on: ["EPIC-0-02"]
      
    - id: "EPIC-0-04"
      title: "Translation Key Migration"
      status: "READY"
      team: "B"
      effort: "2-3h"
      depends_on: ["EPIC-0-03"]
      
    - id: "EPIC-0-05"
      title: "Duplicate Implementation Consolidation"
      status: "BLOCKED"
      team: "B"
      effort: "6-8h"
      depends_on: ["EPIC-0-01", "EPIC-0-03"]
      
    - id: "EPIC-0-06"
      title: "Store Cleanup"
      status: "BLOCKED"
      team: "A"
      effort: "4-6h"
      depends_on: ["EPIC-0-01", "EPIC-0-03"]
      
    - id: "EPIC-0-07"
      title: "End-to-End Validation"
      status: "BLOCKED"
      team: "A+B"
      effort: "2-3h"
      depends_on: ["EPIC-0-02", "EPIC-0-03", "EPIC-0-04"]
```

---

## Section 6: Handoff Checklist

### For Story Handoff

Before marking a story COMPLETE:

- [ ] All files listed in "Files to Modify" have been changed
- [ ] Tracking file created with complete change log
- [ ] TypeScript: `pnpm tsc --noEmit` passes
- [ ] Dev server starts without errors
- [ ] Console has no new errors/warnings
- [ ] Related tests pass (if any)
- [ ] Screenshots/evidence provided for UI changes

### For Epic Completion

Before marking EPIC-0 as COMPLETE:

- [ ] All 7 stories marked COMPLETE
- [ ] E2E validation (EPIC-0-07) all tests pass
- [ ] No `workspace` references in route paths
- [ ] FileTree displays files for FSA projects
- [ ] FileTree displays virtual files for IndexedDB projects
- [ ] Platform determines plugins correctly
- [ ] CREATE_PROJECT → ACCESS_PROJECT → EDIT_FILE flow works end-to-end
- [ ] Human (product owner) has manually tested

---

## Section 7: Governance Notes

### Epic ID Convention

- `EPIC-0` is reserved for Phase 1A blockers
- Subsequent epics: `EPIC-0A`, `EPIC-0B` if extensions needed
- Phase 1A feature epics start from `EPIC-1`

### Story Handoff Format

```markdown
## Story Handoff: EPIC-0-XX

**Status:** COMPLETE
**Team:** A/B
**Completed:** 2026-01-XX HH:MM

### Changes Made
| File | Change Type | Description |
|------|-------------|-------------|
| path | CREATE/MODIFY/DELETE | What was done |

### Evidence
- Screenshot/log attachments
- TypeScript check: PASS
- Dev server: RUNNING

### Notes
Any relevant notes for next story or retrospective
```

---

## Section 8: Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Hidden workspace references | Medium | High | EPIC-0-01 deep scan first |
| Breaking existing features | High | High | E2E validation as final gate |
| FSA handle race conditions | Medium | High | EPIC-0-03 fixes context |
| Translation key misses | Low | Medium | Runtime console checks |
| Store migration data loss | Low | High | Backup stores before migration |

---

*End of EPIC-0 Specification*
*Generated by BMAD Master Agent*
*Version 3.0.0*
