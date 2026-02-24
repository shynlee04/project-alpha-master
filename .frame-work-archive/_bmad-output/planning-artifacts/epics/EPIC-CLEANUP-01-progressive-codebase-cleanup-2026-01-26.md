# EPIC-CLEANUP-01: Progressive Codebase Cleanup & Migration

**Epic ID:** EPIC-CLEANUP-01
**Type:** Technical Debt / Architecture Remediation
**Created:** 2026-01-26
**Updated:** 2026-01-26
**Status:** READY_FOR_SPRINT_PLANNING
**Priority:** P0 CRITICAL
**Estimated Duration:** 24-40 hours (3-5 days)
**Target Completion:** 2026-01-31
**Teams:** Team A (Routing & Types), Team B (Storage & Cleanup)

---

## YAML Frontmatter

```yaml
epic_id: EPIC-CLEANUP-01
name: "Progressive Codebase Cleanup & Migration"
type: technical-debt
priority: P0
blocks: "Phase 1A (final cleanup)"
estimated_effort: "24-40 hours (3-5 days)"
target_completion: "2026-01-31"

source_diagnostics:
  - "_bmad-output/diagnostics/SAFE-TO-ARCHIVE-INVENTORY-2026-01-26.md"
  - "_bmad-output/diagnostics/WORKSPACE-CENTRIC-POLLUTION-2026-01-26.md"
  - "_bmad-output/diagnostics/INCONSISTENCY-CATALOG-2026-01-26.md"
  - "_bmad-output/diagnostics/COMPREHENSIVE-CHAOS-ANALYSIS-2026-01-26.md"

strategic_objectives:
  - "~93% file reduction (from 21,400 to ~1,500 files) via spike/ archival"
  - "Project-centric architecture alignment (remove workspaceId pollution)"
  - "Clean Architecture compliance (proper layer boundaries)"
  - "God file decomposition (47+ files requiring split)"

team_assignment:
  team_a:
    focus: "Routing, Types, i18n Migration"
    stories: ["CLEANUP-02", "CLEANUP-04", "CLEANUP-05", "CLEANUP-06", "CLEANUP-09", "CLEANUP-10", "CLEANUP-11", "CLEANUP-14", "CLEANUP-17", "CLEANUP-18"]
  team_b:
    focus: "Storage, Archival, God File Decomposition"
    stories: ["CLEANUP-01", "CLEANUP-03", "CLEANUP-07", "CLEANUP-08", "CLEANUP-12", "CLEANUP-13", "CLEANUP-15", "CLEANUP-16"]
```

---

## Executive Summary

This EPIC addresses the critical technical debt identified by the deep-scan diagnostic agents on 2026-01-26. The codebase has accumulated significant inconsistencies, duplications, and legacy patterns that must be systematically remediated.

### Key Metrics

| Metric | Current | Target | Reduction |
|--------|---------|--------|-----------|
| **Total Files** | ~21,400 | ~1,750 | **92%** |
| **spike/ Folder** | 19,662 files | 0 (archived) | **100%** |
| **God Files (>300 lines)** | 47+ | 0 (all split) | **100%** |
| **WorkspaceId Composite Keys** | 347 | 0 | **100%** |
| **Duplicate Service Implementations** | 15+ | 1 each | **93%** |
| **Naming Convention Violations** | 40 PascalCase | 0 | **100%** |

### Source Evidence

| Diagnostic Report | Key Findings |
|-------------------|--------------|
| **SAFE-TO-ARCHIVE-INVENTORY** | 8 files (1,471 lines) 100% safe for immediate deletion; 33 files (6,733 lines) blocked by 29 active imports |
| **WORKSPACE-CENTRIC-POLLUTION** | ~600 workspace-centric patterns; 347 Dexie composite key violations; 61 translation keys needing migration |
| **INCONSISTENCY-CATALOG** | spike/ folder (19,662 files) is 100% duplicate; 47+ god files; 15+ duplicate services |

---

## Problem Statement

### 1. Massive Duplication: spike/ Folder (CRITICAL)

The `spike/` folder contains **19,662 files** that are an **exact duplicate** of the main `src/` codebase.

```
spike/
├── src/domain/entities/         # DUPLICATE of src/domain/entities/
├── src/infrastructure/          # DUPLICATE of src/infrastructure/
├── src/presentation/            # DUPLICATE of src/presentation/
├── src/lib/                     # DUPLICATE of src/lib/
└── tests/                       # DUPLICATE of src/__tests__/
```

**Impact**: Massive file count, confusing grep results, wasted git storage.
**Solution**: Archive entire folder to `_bmad-ext/.archive/spike-codebase-2026-01-26/`.

### 2. Workspace-Centric Pollution (HIGH)

The codebase was originally designed around "workspaces" but architecture v3.0.0 requires a **project-centric model**.

| Pollution Type | Count | Severity |
|----------------|-------|----------|
| Dexie Composite Keys (`[projectId+workspaceId]`) | 347 | CRITICAL |
| `WorkspaceType` references in components | 40+ | HIGH |
| `ide.*` translation keys | 33 | MEDIUM |
| `workspace.*` translation keys | 28 | MEDIUM |
| `WorkspaceType` type definitions | 15+ files | HIGH |

**Impact**: Data isolation relies on outdated composite keys; type names don't match architecture.
**Solution**: Create Dexie migration to remove `workspaceId` from keys; rename `WorkspaceType` to `PluginType`.

### 3. God Files (>300 lines) (HIGH)

47+ files exceed the 300-line threshold for component/service size.

| Priority | File | Lines | Responsibilities |
|----------|------|-------|------------------|
| **P0** | `ProviderService.ts` | 1,943 | Provider CRUD, validation, testing, models, credentials |
| **P0** | `dexie-db-migrations.ts` | 1,746 | All DB migrations across all domains |
| **P0** | `AISlashCommand.tsx` | 1,674 | Slash command UI, logic, registry |
| **P1** | `template-registry.ts` | 1,321 | All templates in single file |
| **P1** | `PluginLayout.tsx` | 806 | Layout state, rendering, drag-drop |

**Impact**: Poor maintainability, hard to test, violates single-responsibility principle.
**Solution**: Split each god file into focused modules (<300 lines each).

### 4. Legacy lib/ Directory (MEDIUM)

The `src/lib/` directory contains 350+ files that should be in `domain/`, `infrastructure/`, or `application/` per Clean Architecture.

| Location | Status | Migration Target |
|----------|--------|------------------|
| `lib/workspace/` (33 files) | BLOCKED (29 imports) | `infrastructure/persistence/stores/` |
| `lib/filesystem/` (43 files) | Cross-deps | `infrastructure/filesystem/` |
| `lib/events/` (11 files) | Is canonical | Keep, re-export from infrastructure |

---

## Strategic Objectives

### DELIVERABLE 1: 100% Safe-to-Archive (Phase 1)
- Archive spike/ folder (19,662 files)
- Delete deprecated routes (6 files)
- Delete .bak files (2 files)
- **Total reduction: 19,670 files (~92% of total file count)**

### DELIVERABLE 2: lib/workspace/ Migration (Phase 2)
- Migrate lib/workspace/ imports (29 consumers)
- Create facade exports in infrastructure
- Update all import paths
- Archive empty lib/workspace/
- **Total: ~33 files affected**

### DELIVERABLE 3: Project-Centric Migration (Phase 3)
- Remove workspaceId from Dexie composite keys (347 occurrences)
- Rename WorkspaceType to PluginType (15+ files)
- Migrate translation keys (61 keys)
- Update 47 components with WorkspaceType references
- **Total: ~500 changes**

### DELIVERABLE 4: God File Decomposition (Phase 4)
- Split ProviderService.ts (1,943 lines) into 5 slices
- Split dexie-db-migrations.ts (1,746 lines) by domain
- Split AISlashCommand.tsx (1,674 lines) into components
- Split PluginLayout.tsx (806 lines) into hooks + components
- **Total: 47+ files split, ~140 new focused modules**

---

## Stories

### Phase 1: Immediate Safe Cleanup (2-3 hours)

| Story | Title | Priority | Team | Effort | Deps |
|-------|-------|----------|------|--------|------|
| **CLEANUP-01** | Archive spike/ folder to _bmad-ext/.archive/ | P0 | B | 1h | None |
| **CLEANUP-02** | Delete deprecated route files and regenerate routeTree | P0 | A | 0.5h | None |
| **CLEANUP-03** | Delete .bak files (project-context.tsx.bak, routeTree.gen.ts.backup) | P0 | B | 0.5h | None |
| **CLEANUP-04** | Run TypeScript check and validate build | P0 | A | 1h | CLEANUP-01,02,03 |

#### CLEANUP-01: Archive spike/ Folder

**Description**: Move the entire spike/ folder (19,662 files) to archive location.

**Acceptance Criteria**:
- [ ] spike/ folder moved to `_bmad-ext/.archive/spike-codebase-2026-01-26/`
- [ ] No imports reference spike/ folder
- [ ] Git status clean after archive

**Archive Command**:
```bash
mkdir -p _bmad-ext/.archive/spike-codebase-2026-01-26
mv spike/* _bmad-ext/.archive/spike-codebase-2026-01-26/
rmdir spike
```

#### CLEANUP-02: Delete Deprecated Routes

**Files to Delete**:
- `src/routes/ide.tsx` (25 lines) - redirects to /hub
- `src/routes/ide.$projectId.tsx` (113 lines) - redirects to /$projectId
- `src/routes/notes.lazy.tsx` (27 lines) - redirects to /hub
- `src/routes/notes.$projectId.tsx` (145 lines) - redirects to /$projectId
- `src/routes/workspace/$projectId.tsx` (32 lines) - redirects to /$projectId
- `src/routes/workspace/index.tsx` (35 lines) - legacy landing

**Acceptance Criteria**:
- [ ] All 6 deprecated route files deleted
- [ ] Run `pnpm tsr:routes` to regenerate routeTree.gen.ts
- [ ] Build passes with 0 errors

#### CLEANUP-03: Delete .bak Files

**Files to Delete**:
- `src/infrastructure/context/project-context.tsx.bak` (364 lines)
- `src/routeTree.gen.ts.backup` (730 lines)

**Acceptance Criteria**:
- [ ] Both .bak files deleted
- [ ] Total lines removed: 1,094

#### CLEANUP-04: Validate Build

**Acceptance Criteria**:
- [ ] `pnpm tsc --noEmit` passes with 0 errors
- [ ] `pnpm build` completes successfully
- [ ] No broken imports from archived files

---

### Phase 2: lib/workspace/ Migration (6-8 hours)

| Story | Title | Priority | Team | Effort | Deps |
|-------|-------|----------|------|--------|------|
| **CLEANUP-05** | Create facade exports in infrastructure for workspace types | P0 | A | 2h | Phase 1 |
| **CLEANUP-06** | Migrate fsa-persistence imports to infrastructure | P0 | A | 2h | CLEANUP-05 |
| **CLEANUP-07** | Migrate useFileSyncStatusStore to infrastructure | P1 | B | 2h | CLEANUP-05 |
| **CLEANUP-08** | Migrate browser-mode and temp-project to infrastructure | P1 | B | 2h | CLEANUP-05 |
| **CLEANUP-09** | Archive empty lib/workspace/ after all imports migrated | P2 | A | 0.5h | CLEANUP-06,07,08 |

#### CLEANUP-05: Create Infrastructure Facades

**Description**: Create re-export facades in infrastructure/ that point to current lib/workspace/ implementations, enabling gradual migration.

**Files to Create**:
- `src/infrastructure/persistence/stores/workspace-facade.ts`
- `src/infrastructure/filesystem/fsa-facade.ts`

**Acceptance Criteria**:
- [ ] Facades created with proper re-exports
- [ ] Import path `@/infrastructure/persistence/stores/` works
- [ ] No functionality changes

#### CLEANUP-06 through CLEANUP-09: Migration Stories

Each story migrates specific imports from `@/lib/workspace/` to `@/infrastructure/` locations.

**Key Files with Active Imports** (from SAFE-TO-ARCHIVE-INVENTORY):
- `src/infrastructure/persistence/stores/index.ts` -> file-sync-status-store
- `src/domain/services/project-creation-service.ts` -> fsa-persistence, browser-mode, temp-project
- `src/presentation/components/ide/FileTree/FileTree.tsx` -> useFileSyncStatusStore
- `src/presentation/components/hub/HubHomePage.tsx` -> fsa-persistence

---

### Phase 3: Workspace->Project-Centric Migration (8-12 hours)

| Story | Title | Priority | Team | Effort | Deps |
|-------|-------|----------|------|--------|------|
| **CLEANUP-10** | Create Dexie migration to remove workspaceId from composite keys | P0 | A | 4h | Phase 2 |
| **CLEANUP-11** | Rename WorkspaceType to PluginType across 15 files | P0 | A | 2h | CLEANUP-10 |
| **CLEANUP-12** | Migrate 33 ide.* translation keys to plugin.* namespace | P1 | B | 1.5h | None |
| **CLEANUP-13** | Migrate 28 workspace.* translation keys to project.*/plugin.* | P1 | B | 1.5h | None |
| **CLEANUP-14** | Update 47 components with WorkspaceType references | P1 | A | 3h | CLEANUP-11 |

#### CLEANUP-10: Dexie Schema Migration

**Description**: Create migration v98 (or next version) that removes workspaceId from all composite keys.

**Tables Affected** (347 occurrences):
- `ideState`: `[projectId+workspaceId]` -> `projectId`
- `conversations`: Remove workspaceId from index
- `threads`: Remove workspaceId from index
- `sources`: Remove workspaceId from index
- `collections`: Remove workspaceId from index
- `synthesisResults`: Remove workspaceId from index
- `oramaIndexes`: Remove workspaceId from index
- `notes`: Remove workspaceId from index
- `fsaHandles`: `[projectId+workspaceId]` -> `projectId`
- `fileMetadata`: `[projectId+workspaceId+path]` -> `[projectId+path]`
- `fileContentCache`: `[projectId+workspaceId+path]` -> `[projectId+path]`
- `fileSnapshots`: `[projectId+workspaceId+path]` -> `[projectId+path]`

**Acceptance Criteria**:
- [ ] Migration script created in dexie-db-migrations.ts
- [ ] Backup strategy documented
- [ ] Rollback procedure documented
- [ ] All queries updated to use new key structure
- [ ] Data isolation still works (project-based)

#### CLEANUP-11: Rename WorkspaceType to PluginType

**Files to Update**:
- `src/domain/entities/workspace.ts`
- `src/infrastructure/persistence/stores/workspace/workspace-types.ts`
- `src/presentation/components/agent/ToolAvailabilityIndicator.tsx`
- `src/presentation/components/agent/UnifiedAgentSelector.tsx`
- Plus 11 additional files with WorkspaceType imports

**Acceptance Criteria**:
- [ ] `WorkspaceType` renamed to `PluginType` across all 15 files
- [ ] `WorkspaceConfig` renamed to `PluginConfig`
- [ ] `WorkspaceState` renamed to `PluginState`
- [ ] WORKSPACES constant renamed to PLUGINS
- [ ] All imports updated

#### CLEANUP-12 & CLEANUP-13: Translation Key Migration

**IDE Keys to Migrate (33)**:
```
ide.noFolderSelected -> plugin.monaco.noFolderSelected
ide.loading -> plugin.common.loading
ide.terminal -> plugin.terminal.title
ide.preview -> plugin.preview.title
(etc. - full list in WORKSPACE-CENTRIC-POLLUTION report)
```

**Workspace Keys to Migrate (28)**:
```
workspace.switcher.* -> plugin.switcher.*
workspace.provider.* -> project.provider.*
workspaceSwitcher.* -> pluginSwitcher.*
(etc. - full list in WORKSPACE-CENTRIC-POLLUTION report)
```

**Acceptance Criteria**:
- [ ] All 61 keys migrated in `src/i18n/en.json`
- [ ] All 61 keys migrated in `src/i18n/vi.json`
- [ ] All component references updated to use new keys
- [ ] No raw translation keys visible in UI

---

### Phase 4: God File Decomposition (8-12 hours)

| Story | Title | Priority | Team | Effort | Deps |
|-------|-------|----------|------|--------|------|
| **CLEANUP-15** | Split ProviderService.ts (1943 lines) into 5 slices | P0 | B | 4h | None |
| **CLEANUP-16** | Split dexie-db-migrations.ts (1746 lines) by domain | P0 | B | 3h | CLEANUP-10 |
| **CLEANUP-17** | Split AISlashCommand.tsx (1674 lines) into components | P1 | A | 3h | None |
| **CLEANUP-18** | Split PluginLayout.tsx (806 lines) into hooks + components | P1 | A | 2h | None |

#### CLEANUP-15: Split ProviderService.ts

**Current**: 1,943 lines handling provider CRUD, validation, testing, models, credentials

**Target Split**:
- `provider-crud-slice.ts` (~350 lines) - CRUD operations
- `provider-validation-slice.ts` (~300 lines) - Validation logic
- `provider-test-slice.ts` (~400 lines) - Provider testing
- `model-registry-slice.ts` (~450 lines) - Model management
- `credential-manager-slice.ts` (~350 lines) - Credential handling
- `ProviderService.ts` (~100 lines) - Facade re-exporting all slices

**Acceptance Criteria**:
- [ ] Each slice <400 lines
- [ ] Facade maintains backward compatibility
- [ ] All existing imports continue working
- [ ] Tests updated to import from slices

#### CLEANUP-16: Split dexie-db-migrations.ts

**Current**: 1,746 lines containing ALL database migrations

**Target Split**:
- `migrations/project-migrations.ts` - Project table migrations
- `migrations/note-migrations.ts` - Note table migrations
- `migrations/chat-migrations.ts` - Conversation/thread migrations
- `migrations/file-migrations.ts` - File metadata migrations
- `migrations/agent-migrations.ts` - Agent/provider migrations
- `dexie-db-migrations.ts` - Orchestrator importing and running all

**Acceptance Criteria**:
- [ ] Each migration file <400 lines
- [ ] Migration order preserved
- [ ] Version numbering consistent
- [ ] All tests pass

#### CLEANUP-17: Split AISlashCommand.tsx

**Current**: 1,674 lines handling slash command UI, logic, and registry

**Target Split**:
- `SlashCommandRegistry.ts` (~400 lines) - Command registration
- `SlashCommandUI.tsx` (~500 lines) - UI components
- `SlashCommandExecutor.ts` (~400 lines) - Execution logic
- `AISlashCommand.tsx` (~300 lines) - Main orchestrator

**Acceptance Criteria**:
- [ ] Each file <500 lines
- [ ] Slash command functionality unchanged
- [ ] All hooks properly extracted

#### CLEANUP-18: Split PluginLayout.tsx

**Note**: This may be completed by CC-AR-08 in EPIC-CC-AR02AR03. Verify before starting.

**Current**: 806 lines handling layout state, rendering, drag-drop

**Target Split**:
- `usePluginLayoutState.ts` (~200 lines) - State management hook
- `PluginLayoutRenderer.tsx` (~300 lines) - Layout rendering
- `PluginPanel.tsx` (~200 lines) - Individual panel component
- `PluginLayout.tsx` (~150 lines) - Main orchestrator

---

## Acceptance Criteria (Epic Level)

### AC1: Codebase Reduction
- [ ] spike/ folder archived to _bmad-ext/.archive/spike-codebase-2026-01-26/
- [ ] Deprecated routes deleted (6 files)
- [ ] .bak files deleted (2 files)
- [ ] Total file count reduced from ~21,400 to ~1,750

### AC2: Project-Centric Architecture
- [ ] No workspaceId in Dexie composite keys (0 of 347 remaining)
- [ ] WorkspaceType renamed to PluginType (all 15 files)
- [ ] No workspace.* translation keys (0 of 28 remaining)
- [ ] No ide.* translation keys (0 of 33 remaining)

### AC3: Clean Architecture
- [ ] lib/workspace/ empty and archived
- [ ] All workspace utilities migrated to infrastructure/
- [ ] No cross-layer import violations

### AC4: Code Quality
- [ ] ProviderService.ts split to <400 lines each slice
- [ ] dexie-db-migrations.ts split to domain-specific files
- [ ] AISlashCommand.tsx split to <500 lines each file
- [ ] No new TypeScript errors (`pnpm tsc --noEmit`)
- [ ] Build passes (`pnpm build`)

---

## Dependencies

| Dependency Type | Description | Status |
|-----------------|-------------|--------|
| **Blocks** | Phase 1A final cleanup | Active |
| **Blocked By** | EPIC-CC-AR02AR03 (CC-AR-04 for CC-AR-08 overlap) | In Progress |
| **Parallel With** | EPIC-UX-GLOBAL-UI (no file conflicts) | Safe |
| **Can Start** | Phase 1 stories (CLEANUP-01,02,03) | Immediately |

---

## Team File Ownership

### Team A Files
- All files in `src/routes/` (deletion)
- All files with `WorkspaceType` references (rename)
- `src/domain/entities/workspace.ts` (type rename)
- `src/i18n/en.json`, `src/i18n/vi.json` (key migration)
- `src/infrastructure/persistence/dexie-db-migrations.ts` (Dexie migration)
- `src/presentation/components/notes/AISlashCommand.tsx` (split)
- `src/presentation/layouts/PluginLayout.tsx` (split - verify CC-AR-08)

### Team B Files
- `spike/` folder (archive)
- `.bak` files (deletion)
- `src/application/services/ProviderService.ts` (split)
- `src/lib/workspace/` (migration target)
- `src/infrastructure/persistence/stores/` (facade creation)

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Dexie migration causes data loss | CRITICAL | LOW | Create backup before migration; test on clone |
| Import path breaks cause build failure | HIGH | MEDIUM | Run TypeScript check after each story |
| Active imports missed during archival | HIGH | MEDIUM | Use grep to find all imports before archiving |
| God file split breaks existing functionality | MEDIUM | LOW | Create facade re-exports; test coverage |
| Translation key migration causes UI breaks | MEDIUM | LOW | Visual regression testing |

---

## Handoff Artifacts

### Input Artifacts (Source Diagnostics)
- `_bmad-output/diagnostics/SAFE-TO-ARCHIVE-INVENTORY-2026-01-26.md` (252 lines)
- `_bmad-output/diagnostics/WORKSPACE-CENTRIC-POLLUTION-2026-01-26.md` (291 lines)
- `_bmad-output/diagnostics/INCONSISTENCY-CATALOG-2026-01-26.md` (356 lines)
- `_bmad-output/diagnostics/COMPREHENSIVE-CHAOS-ANALYSIS-2026-01-26.md`

### Output Artifacts (To Be Created)
- Per-story dev reports in `_bmad-output/handoffs/2026-01-{DD}/`
- Archive documentation in `_bmad-ext/.archive/`
- Updated LOOP_STATE.yaml with epic progress

---

## Validation Commands

```bash
# Phase 1 validation
pnpm tsc --noEmit        # 0 errors expected
pnpm build               # Build passes

# Post-Phase 3 validation
grep -r "workspaceId" src/infrastructure/persistence/dexie-db*.ts  # 0 matches expected
grep -r "WorkspaceType" src/ --include="*.ts" --include="*.tsx"   # 0 matches expected

# Post-Phase 4 validation
wc -l src/application/services/ProviderService.ts   # <200 lines (facade)
wc -l src/infrastructure/persistence/dexie-db-migrations.ts  # <500 lines (orchestrator)
```

---

## Notes

### Relationship to EPIC-CC-AR02AR03

CLEANUP-18 (Split PluginLayout.tsx) may overlap with CC-AR-08 in EPIC-CC-AR02AR03. 
- **If CC-AR-08 completes first**: Skip CLEANUP-18, mark as SUPERSEDED.
- **If CLEANUP-18 starts first**: Coordinate with Team B to avoid conflicts.

### Dexie Migration Strategy

The Dexie composite key migration (CLEANUP-10) is the **highest-risk story** in this epic. Recommended approach:
1. Create Dexie v98 upgrade that migrates data
2. Test on development clone with real data
3. Create rollback script (v97 downgrade)
4. Execute during low-usage window

### Post-Epic State

After this epic completes:
- File count: ~1,750 (down from ~21,400)
- No workspace-centric patterns remaining
- All god files decomposed
- Clean Architecture fully enforced

---

**Epic Created By**: tech-writer-ext (delegated by bmad-master)
**Creation Date**: 2026-01-26
**Review Required**: architect-ext, dev-ext (for implementation feasibility)
