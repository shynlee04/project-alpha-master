# Phase 1A Foundation Document

**Document ID**: PHASE-1A-FOUNDATION  
**Version**: 1.0.0  
**Date**: 2026-01-29  
**Status**: CONSTITUTIONAL FOUNDATION  
**Authority**: Tier 1 - Governs all Phase 1A work  

---

## Frontmatter

```yaml
document:
  type: "constitutional_foundation"
  phase: "1A"
  scope: "foundation_cleanup_and_governance"
  authority_level: 1
  
source:
  scan_report: "_bmad-output/governance/phase-1a-deep-scan-2026-01-29.md"
  scan_yaml: "_bmad-output/governance/phase-1a-deep-scan-2026-01-29.yaml"
  root_cause_fix: "_bmad-output/governance/ROOT-CAUSE-FIX-2026-01-20.md"
  
generated:
  date: "2026-01-29"
  by: "architect-ext (Software Architect Agent)"
  evidence_quality: "HIGH"
  confidence: "95%"

validation:
  last_verified: "2026-01-29T05:00:00+07:00"
  next_review: "2026-02-05"
  
governance:
  parent: "AGENTS.md"
  adr_authority: "ADR-039"
  architecture_spec: "architecture.md v3.0.0"
```

---

## 1. EXECUTIVE SUMMARY

### 1.1 Current State Assessment

| Metric | Value | Status |
|--------|-------|--------|
| **Total TS/TSX Files** | 1,707 | Active codebase |
| **Total Lines of Code** | 356,297 | Baseline |
| **Files >300 Lines (God Files)** | 47+ | Requires decomposition |
| **Files with TODO/FIXME** | 139 | Requires triage |
| **Deprecated Exports** | 173 | Requires cleanup |
| **Circular Dependencies** | 5 | Requires resolution |
| **Remaining window.location.href** | 9 | Requires migration |
| **Active lib/workspace Imports** | 36 | Requires migration |
| **Active lib/filesystem Imports** | 47 | Requires migration |
| **Deprecated useLayoutStore Imports** | 13 | Requires migration |

### 1.2 Phase 1A Scope and Boundaries

**IN SCOPE:**
- Archive 100% safe legacy files (8 files, 21,133 lines)
- Migrate partially legacy files with clear migration paths
- Consolidate scattered type definitions
- Decompose P0 god files (3 files: ProviderService, dexie-db-migrations, AISlashCommand)
- Establish canonical governance framework
- Stabilize core plugin system (filetree, monaco, terminal, preview)
- Fix layout system inconsistencies

**OUT OF SCOPE:**
- New feature development
- UI/UX redesign
- Performance optimization (Phase 2)
- Complete lib/ directory migration (Phase 1B)
- Test coverage improvement (Phase 2)

### 1.3 Success Criteria

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| Safe Files Archived | 100% | 8/8 files archived |
| P0 God Files Split | 100% | 3/3 files decomposed |
| Type Consolidation | 80% | 4/5 type categories consolidated |
| Circular Dependencies | 60% | 3/5 cycles resolved |
| lib/workspace Imports | 75% | 27/36 imports migrated |
| Layout System Stable | 100% | All layout tests pass |
| E2E Tests Passing | 100% | Critical paths verified |

### 1.4 Timeline Estimates

| Phase | Duration | Effort | Dependencies |
|-------|----------|--------|--------------|
| Epic 1: Foundation Cleanup | 2-3 days | 16 hours | None |
| Epic 2: Core Plugin Stabilization | 3-5 days | 24 hours | Epic 1 |
| Epic 3: Layout System Hardening | 2-3 days | 16 hours | Epic 1 |
| Epic 4: State Management Consolidation | 3-4 days | 20 hours | Epic 1, 3 |
| **Total Phase 1A** | **10-15 days** | **76 hours** | Sequential + Parallel |

---

## 2. SAFE-TO-ARCHIVE INVENTORY (100% Safe)

### 2.1 Immediate Archive Candidates

| # | File Path | Lines | Reason | Archive Confidence | Archive Command |
|---|-----------|-------|--------|-------------------|-----------------|
| 1 | `src/routes/ide.tsx` | 25 | Redirects to /hub, 0 imports outside routeTree | 100% | `mv src/routes/ide.tsx _bmad-output/.archive/2026-01-29/routes/` |
| 2 | `src/routes/ide.$projectId.tsx` | 113 | Redirects to /$projectId, 0 imports outside routeTree | 100% | `mv src/routes/ide.$projectId.tsx _bmad-output/.archive/2026-01-29/routes/` |
| 3 | `src/routes/notes.lazy.tsx` | 27 | Redirects to /hub, 0 imports outside routeTree | 100% | `mv src/routes/notes.lazy.tsx _bmad-output/.archive/2026-01-29/routes/` |
| 4 | `src/routes/notes.$projectId.tsx` | 145 | Redirects to /$projectId, 0 imports outside routeTree | 100% | `mv src/routes/notes.$projectId.tsx _bmad-output/.archive/2026-01-29/routes/` |
| 5 | `src/routes/workspace/$projectId.tsx` | 32 | Redirects to /$projectId, 0 imports outside routeTree | 100% | `mv src/routes/workspace/$projectId.tsx _bmad-output/.archive/2026-01-29/routes/` |
| 6 | `src/routes/workspace/index.tsx` | 35 | Legacy workspace landing, navigates to deprecated /ide | 100% | `mv src/routes/workspace/index.tsx _bmad-output/.archive/2026-01-29/routes/` |
| 7 | `src/infrastructure/context/project-context.tsx.bak` | 364 | Backup file of current implementation | 100% | `mv src/infrastructure/context/project-context.tsx.bak _bmad-output/.archive/2026-01-29/backups/` |
| 8 | `src/routeTree.gen.ts.backup` | 730 | Auto-generated backup, will regenerate | 100% | `mv src/routeTree.gen.ts.backup _bmad-output/.archive/2026-01-29/backups/` |
| 9 | `spike/` | ~19,662 | Complete duplicate of src/ codebase | 100% | `mv spike/ _bmad-output/.archive/2026-01-29/` |

**Total Lines to Archive**: 21,133 lines (~5.9% codebase reduction)  
**Estimated Time**: 1 hour  
**Risk Level**: ZERO - All files confirmed safe via import analysis

### 2.2 Archive Execution Checklist

```bash
# Pre-archive verification
grep -r "ide.tsx\|ide.\$projectId\|notes.lazy\|notes.\$projectId" src --include="*.ts" --include="*.tsx" | grep -v "routeTree" | wc -l
# Expected: 0

# Create archive directories
mkdir -p _bmad-output/.archive/2026-01-29/{routes,backups}

# Execute archive (run in order)
mv src/routes/ide.tsx _bmad-output/.archive/2026-01-29/routes/
mv src/routes/ide.$projectId.tsx _bmad-output/.archive/2026-01-29/routes/
mv src/routes/notes.lazy.tsx _bmad-output/.archive/2026-01-29/routes/
mv src/routes/notes.$projectId.tsx _bmad-output/.archive/2026-01-29/routes/
mv src/routes/workspace/$projectId.tsx _bmad-output/.archive/2026-01-29/routes/
mv src/routes/workspace/index.tsx _bmad-output/.archive/2026-01-29/routes/
mv src/infrastructure/context/project-context.tsx.bak _bmad-output/.archive/2026-01-29/backups/
mv src/routeTree.gen.ts.backup _bmad-output/.archive/2026-01-29/backups/
mv spike/ _bmad-output/.archive/2026-01-29/

# Post-archive regeneration
pnpm route:generate  # Regenerates routeTree.gen.ts

# Verification
git status  # Should show deletions only
```

---

## 3. PARTIALLY LEGACY TRACKING

### 3.1 Facade Files (Backward Compatibility)

| File | Lines | Current State | Migration Progress | Blocking Items | Target Completion |
|------|-------|---------------|-------------------|----------------|-------------------|
| `infrastructure/persistence/stores/layout-store.ts` | 109 | Facade re-exporting PluginLayoutStore | 90% | 13 imports still use deprecated `useLayoutStore` | Epic 4 |
| `lib/notes/store-facades.ts` | 73 | Facade for note stores | Pending | Team A dependency - TODO comment indicates pending updates | Epic 4 |
| `infrastructure/filesystem/index.ts` | 67 | Re-exports with deprecation warnings | 60% | Some exports point to lib/filesystem (deprecated) | Epic 1 |

### 3.2 Legacy Directory Migration Status

| Directory | Files | Lines | Active Imports | Migration % | Blocking Items | Target |
|-----------|-------|-------|----------------|-------------|----------------|--------|
| `lib/workspace/` | 16 | ~6,733 | 36 | 0% | Cross-dependencies with infrastructure/ | Epic 4 |
| `lib/filesystem/` | 24 | ~6,056 | 47 | 40% | UnifiedStorageAdapter migration incomplete | Epic 1 |
| `lib/notes/` | 12 | ~3,200 | Unknown | 30% | store-facades.ts pending Team A | Epic 4 |

### 3.3 Migration Priority Matrix

| Priority | Item | Effort | Impact | Dependencies |
|----------|------|--------|--------|--------------|
| P0 | layout-store.ts facade removal | 2h | High | Update 13 imports |
| P1 | lib/filesystem/ migration | 8h | High | UnifiedStorageAdapter |
| P1 | lib/workspace/ migration | 6h | Medium | 36 imports |
| P2 | store-facades.ts removal | 1h | Low | Wait Team A |

---

## 4. HIGHLY INCONSISTENT ITEMS REGISTRY

### 4.1 Type Definition Conflicts

| Type Name | Canonical Location | Conflicting Locations | Conflict Type | Resolution Strategy |
|-----------|-------------------|----------------------|---------------|---------------------|
| **PlatformContract** | `infrastructure/filesystem/platform-contract.ts` | `storage-types.ts` (re-export) | Duplicate definition | Remove re-export from storage-types.ts |
| **DeviceType** | `domain/types/platform-types.ts` (NEW) | `lib/filesystem/unified-storage-adapter.ts:26`, `hooks/useMediaQuery.ts` | Scattered definition | Create domain/types/platform-types.ts, migrate both usages |
| **Project** | `domain/entities/project.ts` | `spike/src/domain/entities/project.ts` | Spike duplicate | Archive spike/ folder |
| **StorageAdapter** | `domain/interfaces/storage-adapter.interface.ts` | `spike/src/domain/interfaces/storage-adapter.interface.ts` | Spike duplicate | Archive spike/ folder |
| **Sync Types** | `infrastructure/sync/types/index.ts` | `core/*` (8 files) | Fragmentation | Consolidate to infrastructure/sync/types/index.ts |
| **Chat Types** | `domain/types/chat-types.ts` (NEW) | `chat/unified-chat-types.ts`, `conversation/types.ts`, `conversation/event-types.ts` (4 files) | Fragmentation | Create domain/types/chat-types.ts, migrate all usages |
| **Plugin Types** | `domain/interfaces/feature-plugin.interface.ts` | `presentation/components/layout/plugin-types.ts` | Near-duplicate | Merge into canonical interface |

### 4.2 Schema Conflicts

| Schema | Locations | Issue | Resolution |
|--------|-----------|-------|------------|
| **IDE State** | `infrastructure/persistence/stores/ide/`, `lib/workspace/` | Dual persistence paths | Consolidate to infrastructure/ |
| **Workspace State** | `providerConfigs` table, `workspaceState` table (NEW) | Semantic confusion | Migration complete per ROOT-CAUSE-FIX |
| **File Sync** | `lib/filesystem/sync-manager/`, `infrastructure/sync/` | Duplicate implementations | Migrate to infrastructure/ |

### 4.3 State Management Fragmentation

| State Domain | Canonical Store | Legacy/Facade Locations | Resolution |
|--------------|-----------------|------------------------|------------|
| **Layout State** | `presentation/layouts/PluginLayoutStore.ts` | `infrastructure/persistence/stores/layout-store.ts` | Migrate imports, archive facade |
| **Navigation State** | `infrastructure/persistence/stores/navigation-store.ts` | `layout-store.ts` (re-export) | Direct imports to navigation-store |
| **File Sync State** | `infrastructure/sync/` | `lib/filesystem/sync-manager/` | Migrate services |
| **Workspace State** | `infrastructure/persistence/stores/workspace/` | `lib/workspace/` | Gradual migration |

### 4.4 Event Bus Overlaps

| Event Bus | Canonical Location | Issue | Resolution |
|-----------|-------------------|-------|------------|
| **Cross-Workspace Event Bus** | `lib/events/cross-workspace-event-bus.ts` (583 lines) | Infrastructure version re-exports from lib/ | Keep lib/ as canonical, update infrastructure to not re-export |
| **Event Bus Core** | `infrastructure/events/event-bus.ts` (888 lines) | God file - combines definitions + logic | Split into event-types.ts + event-bus-core.ts |

---

## 5. ARCHITECTURAL DEBT ROADMAP

### 5.1 God Files Decomposition Plan

#### P0 Priority (Critical - Must Fix in Phase 1A)

| File | Lines | Responsibilities | Decomposition Plan | Target Slices |
|------|-------|------------------|-------------------|---------------|
| `application/services/ProviderService.ts` | 1,943 | Provider CRUD, validation, testing, models, credentials | Split by responsibility domain | 5 slices: provider-crud.ts, provider-validation.ts, provider-test.ts, model-registry.ts, credential-manager.ts |
| `infrastructure/persistence/dexie-db-migrations.ts` | 1,746 | All database migrations | Split by domain | 3 slices: project-migrations.ts, note-migrations.ts, chat-migrations.ts |
| `presentation/components/notes/AISlashCommand.tsx` | 1,674 | Slash command UI, logic, registry | Split by concern | 3 components: SlashCommandRegistry.ts, SlashCommandUI.tsx, SlashCommandExecutor.ts |

#### P1 Priority (High - Fix in Phase 1A if time permits)

| File | Lines | Responsibilities | Decomposition Plan | Target Slices |
|------|-------|------------------|-------------------|---------------|
| `lib/templates/template-registry.ts` | 1,321 | All templates | Split by category | 3 slices: project-templates.ts, note-templates.ts, workflow-templates.ts |
| `infrastructure/persistence/dexie-db.ts` | 1,213 | Schema definition, helpers | Extract helpers | Keep schema, extract to dexie-db-helpers/ |
| `presentation/components/notes/NotesPage.tsx` | 1,102 | Note page layout, state, sync | Split by concern | 3 parts: NotesLayout.tsx, useNotesState.ts, NotesSyncManager.ts |
| `presentation/components/notes/NoteEditor.tsx` | 1,353 | Editor core, blocks, AI | Split by concern | 3 components: EditorCore.tsx, BlockRenderer.tsx, AIEnhancer.tsx |
| `infrastructure/events/event-bus.ts` | 888 | Event definitions, bus logic | Split by type | 2 files: event-types.ts, event-bus-core.ts |

#### P2 Priority (Medium - Phase 1B)

| File | Lines | Responsibilities | Decomposition Plan | Target Slices |
|------|-------|------------------|-------------------|---------------|
| `infrastructure/filesystem/file-tree-scanner.ts` | 833 | Scanning, filtering, caching | Split by concern | 3 slices: scanner-core.ts, filter-engine.ts, scan-cache.ts |
| `infrastructure/filesystem/fsa-gateway.ts` | 816 | FSA operations | Split by operation type | 3 slices: read-ops.ts, write-ops.ts, watch-ops.ts |

### 5.2 Decomposition Execution Order

```
Phase 1A:
  Week 1:
    1. ProviderService.ts → 5 slices
    2. dexie-db-migrations.ts → 3 slices
  Week 2:
    3. AISlashCommand.tsx → 3 components
    4. event-bus.ts → 2 files (if time permits)

Phase 1B:
  Week 3-4:
    5. template-registry.ts → 3 slices
    6. dexie-db.ts → helpers extracted
    7. NotesPage.tsx → 3 parts
    8. NoteEditor.tsx → 3 components
```

---

## 6. PHASE 1A EPIC STRUCTURE

### 6.1 Epic 1: Foundation Cleanup

**Epic ID**: EPIC-1A-01-FOUNDATION  
**Status**: READY_FOR_EXECUTION  
**Priority**: P0  
**Estimated Effort**: 16 hours (2-3 days)  

#### Scope Boundaries

**IN SCOPE:**
- Archive 9 safe files (21,133 lines)
- Migrate lib/filesystem/ to infrastructure/ (47 imports)
- Remove deprecated re-exports from infrastructure/filesystem/index.ts
- Fix 5 circular dependencies (3 in scope: provider tools)
- Consolidate type definitions (PlatformContract, DeviceType)

**OUT OF SCOPE:**
- lib/workspace/ migration (Epic 4)
- Component refactoring
- New features

#### Stories

| Story ID | Title | Effort | Acceptance Criteria |
|----------|-------|--------|---------------------|
| 1A-01-01 | Archive deprecated route files | 1h | 6 route files archived, routeTree regenerated |
| 1A-01-02 | Archive backup and spike files | 1h | 2 .bak files + spike/ folder archived |
| 1A-01-03 | Migrate lib/filesystem imports | 6h | 47 imports migrated to infrastructure/, tests pass |
| 1A-01-04 | Fix provider tool circular deps | 3h | 3 cycles resolved, tsc clean |
| 1A-01-05 | Consolidate Platform types | 2h | domain/types/platform-types.ts created, usages migrated |
| 1A-01-06 | Clean up storage type re-exports | 2h | storage-types.ts cleaned, no duplicates |
| 1A-01-07 | Update infrastructure/filesystem/index.ts | 1h | Deprecated re-exports removed, imports updated |

#### Dependencies
- None (can start immediately)

#### Zero-Gap User Journey
```
User Impact: NONE (all changes are cleanup/archival)
Verification: Application boots, routes work, file operations function
```

---

### 6.2 Epic 2: Core Plugin Stabilization

**Epic ID**: EPIC-1A-02-PLUGINS  
**Status**: BLOCKED (requires Epic 1)  
**Priority**: P0  
**Estimated Effort**: 24 hours (3-5 days)  

#### Scope Boundaries

**IN SCOPE:**
- FileTree plugin stability
- Monaco editor integration
- Terminal panel functionality
- Preview panel functionality
- Plugin state persistence
- Cross-plugin communication

**OUT OF SCOPE:**
- New plugin development
- Plugin marketplace
- Plugin configuration UI

#### Stories

| Story ID | Title | Effort | Acceptance Criteria |
|----------|-------|--------|---------------------|
| 1A-02-01 | Stabilize FileTree plugin | 6h | File tree loads, expands, selects; no "empty folder" bug |
| 1A-02-02 | Stabilize Monaco plugin | 6h | Files open in Monaco, edit, save; syntax highlighting works |
| 1A-02-03 | Stabilize Terminal plugin | 4h | Terminal displays output, accepts input, history persists |
| 1A-02-04 | Stabilize Preview plugin | 4h | Preview renders content, updates on file change |
| 1A-02-05 | Plugin state persistence | 4h | Plugin layouts persist across reloads |

#### Dependencies
- Epic 1: Foundation Cleanup (filesystem migration required)

#### Zero-Gap User Journey
```
1. User opens project
2. FileTree shows project files (not empty)
3. User clicks file → Monaco opens with content
4. User runs command → Terminal shows output
5. User previews → Preview renders
6. Refresh page → All plugins restore state
```

---

### 6.3 Epic 3: Layout System Hardening

**Epic ID**: EPIC-1A-03-LAYOUT  
**Status**: BLOCKED (requires Epic 1)  
**Priority**: P0  
**Estimated Effort**: 16 hours (2-3 days)  

#### Scope Boundaries

**IN SCOPE:**
- WorkspaceLayout stability
- PluginLayoutStore consolidation
- Layout persistence
- Responsive layout fixes
- Z-index standardization
- Overflow handling

**OUT OF SCOPE:**
- New layout features
- Mobile layout redesign
- Animation enhancements

#### Stories

| Story ID | Title | Effort | Acceptance Criteria |
|----------|-------|--------|---------------------|
| 1A-03-01 | Fix layout-store.ts facade | 4h | 13 imports migrated to usePluginLayoutStore, facade archived |
| 1A-03-02 | Standardize z-index usage | 2h | All z-index use design tokens, no conflicts |
| 1A-03-03 | Fix overflow handling | 3h | No nested scrollbars, single scroll context per panel |
| 1A-03-04 | Layout persistence hardening | 4h | Layouts persist and restore correctly across sessions |
| 1A-03-05 | Responsive layout fixes | 3h | Layout adapts to viewport, mobile usable |

#### Dependencies
- Epic 1: Foundation Cleanup
- Epic 4: State Management (for facade removal)

#### Zero-Gap User Journey
```
1. User loads workspace
2. Layout renders correctly (no overlapping panels)
3. User resizes panels → Layout responds
4. User rearranges plugins → Layout updates
5. Refresh → Layout restored exactly
6. Resize window → Layout adapts
```

---

### 6.4 Epic 4: State Management Consolidation

**Epic ID**: EPIC-1A-04-STATE  
**Status**: BLOCKED (requires Epic 1, 3)  
**Priority**: P1  
**Estimated Effort**: 20 hours (3-4 days)  

#### Scope Boundaries

**IN SCOPE:**
- layout-store.ts facade removal
- lib/workspace/ migration (36 imports)
- store-facades.ts removal (pending Team A)
- HydrationManager optimization
- State persistence standardization

**OUT OF SCOPE:**
- New state management patterns
- Redux migration
- State machine implementation

#### Stories

| Story ID | Title | Effort | Acceptance Criteria |
|----------|-------|--------|---------------------|
| 1A-04-01 | Migrate lib/workspace imports | 8h | 36 imports migrated, lib/workspace/ archived |
| 1A-04-02 | Remove layout-store.ts facade | 4h | All imports use usePluginLayoutStore, facade archived |
| 1A-04-03 | Coordinate store-facades.ts removal | 2h | Team A confirms, facade archived |
| 1A-04-04 | HydrationManager optimization | 4h | Hydration <100ms, no duplicate hydration |
| 1A-04-05 | State persistence audit | 2h | All stores use consistent persistence pattern |

#### Dependencies
- Epic 1: Foundation Cleanup
- Epic 3: Layout System Hardening
- External: Team A confirmation for store-facades.ts

#### Zero-Gap User Journey
```
1. User opens application
2. State hydrates from IndexedDB (<100ms)
3. User makes changes → State persists
4. Refresh → State restored correctly
5. No duplicate hydration calls
6. No cross-project contamination
```

---

### 6.5 Epic Dependency Map

```
Epic 1: Foundation Cleanup
    │
    ├──→ Epic 2: Core Plugin Stabilization
    │
    ├──→ Epic 3: Layout System Hardening
    │       │
    │       └──→ Epic 4: State Management Consolidation
    │
    └──→ Epic 4: State Management Consolidation (partial)
```

### 6.6 Epic Acceptance Criteria Summary

| Epic | Completion Criteria | Verification Method |
|------|---------------------|---------------------|
| Epic 1 | 9 files archived, 47 imports migrated, 3 cycles fixed, tsc clean | `git status`, `grep`, `pnpm tsc` |
| Epic 2 | All 4 plugins stable, E2E tests pass | Manual testing, Playwright |
| Epic 3 | Layout stable, 13 imports migrated, z-index standardized | Visual inspection, `grep` |
| Epic 4 | 36 imports migrated, facade removed, hydration <100ms | `grep`, performance metrics |

---

## 7. GOVERNANCE FRAMEWORK

### 7.1 File Naming Conventions

**MANDATORY: kebab-case for all files**

| Pattern | Status | Example |
|---------|--------|---------|
| kebab-case | ✅ CORRECT | `provider-service.ts`, `file-tree-scanner.ts` |
| PascalCase | ❌ FORBIDDEN | ~~`ProviderService.ts`~~ → `provider-service.ts` |
| camelCase | ⚠️ EXCEPTIONS ONLY | React hooks: `usePluginLayout.ts` |

**Files to Rename (P3 - Phase 2):**
- `core/entities/Project.ts` → `project.ts`
- `core/entities/Workspace.ts` → `workspace.ts`
- `core/entities/Agent.ts` → `agent.ts`
- `application/services/ProviderService.ts` → `provider-service.ts`
- `infrastructure/filesystem/StorageAdapterFactory.ts` → `storage-adapter-factory.ts`

### 7.2 Import Path Rules

**Canonical Paths Only:**

| Layer | Canonical Path | Forbidden Paths |
|-------|----------------|-----------------|
| Domain | `@/domain/*` | `@/lib/*` |
| Infrastructure | `@/infrastructure/*` | `@/lib/*` |
| Presentation | `@/presentation/*` | `@/lib/*`, `@/infrastructure/*` (except events) |
| Routes | `@/routes/*` | Relative imports outside routes |

**Import Violations to Fix:**
- 350+ files import from `@/lib/*` (deprecated)
- 4 files import Infrastructure → Presentation (event bus)

### 7.3 Store Size Limits

| Metric | Limit | Enforcement |
|--------|-------|-------------|
| Store files | 300 lines max | Governance scan |
| Store responsibilities | 1 domain only | Code review |
| Store imports | Infrastructure only | Import linting |

**God Stores to Split:**
- ProviderService.ts: 1,943 lines → 5 slices (≤150 lines each)
- dexie-db-migrations.ts: 1,746 lines → 3 slices (≤200 lines each)

### 7.4 Component Size Limits

| Metric | Limit | Enforcement |
|--------|-------|-------------|
| Component files | 400 lines max | Governance scan |
| Component responsibilities | 1 UI concern only | Code review |
| Hook extractions | At 200 lines | Refactoring trigger |

**God Components to Split:**
- AISlashCommand.tsx: 1,674 lines → 3 components (≤400 lines each)
- NotesPage.tsx: 1,102 lines → 3 parts (≤400 lines each)
- NoteEditor.tsx: 1,353 lines → 3 components (≤400 lines each)

### 7.5 Type Definition Centralization Rules

| Type Category | Canonical Location | Pattern |
|---------------|-------------------|---------|
| Domain entities | `domain/entities/*.ts` | Class or interface |
| Domain types | `domain/types/*.ts` | Type aliases, unions |
| Domain interfaces | `domain/interfaces/*.ts` | Service contracts |
| Infrastructure types | `infrastructure/*/types/*.ts` | Adapter types |
| Presentation types | `presentation/*/types/*.ts` | Component props |

**Type Consolidation Targets:**
- Platform types → `domain/types/platform-types.ts`
- Chat types → `domain/types/chat-types.ts`
- Sync types → `infrastructure/sync/types/index.ts`

### 7.6 Archive Process Workflow

```
1. IDENTIFY
   └── Scan for deprecated files (0 imports, redirect-only, backups)
   
2. VERIFY
   ├── Check all imports (grep -r "filename" src/)
   ├── Check routeTree references
   └── Confirm no runtime usage
   
3. BACKUP
   └── mv file _bmad-output/.archive/YYYY-MM-DD/
   
4. DOCUMENT
   └── Update this document (Section 2)
   
5. REGENERATE (if needed)
   └── pnpm route:generate
   
6. VERIFY
   ├── pnpm tsc --noEmit
   ├── pnpm build
   └── Manual smoke test
```

---

## 8. ACCEPTANCE CRITERIA FOR PHASE 1A

### 8.1 Mandatory Completion Criteria

| # | Criterion | Target | Verification |
|---|-----------|--------|--------------|
| 1 | All safe files archived | 100% (9/9) | `ls _bmad-output/.archive/2026-01-29/` |
| 2 | No duplicate logic remaining | 80% | `grep -r "@/lib/filesystem" src/ | wc -l` ≤ 10 |
| 3 | All types consolidated | 80% (4/5) | Type conflicts registry updated |
| 4 | God stores split | 100% (3/3 P0) | File size check: all ≤ 400 lines |
| 5 | Layout system stable | 100% | E2E tests pass, no console errors |
| 6 | E2E tests passing | 100% | `pnpm test:e2e` passes |
| 7 | TypeScript clean | 100% | `pnpm tsc --noEmit` = 0 errors |
| 8 | Circular deps resolved | 60% (3/5) | `npx madge --circular` shows ≤ 2 |

### 8.2 Quality Gates

| Gate | Criteria | Enforcement |
|------|----------|-------------|
| **Pre-Story** | Story file complete, context created | story-start-gate.yaml |
| **Pre-Implementation** | No TypeScript errors in target files | `pnpm tsc --noEmit` |
| **Post-Implementation** | All tests pass, no new circular deps | `pnpm test:fast`, `madge` |
| **Pre-Merge** | Code review, E2E pass | PR checklist |
| **Epic Complete** | All stories done, retrospective | epic-done-gate.yaml |

### 8.3 Success Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Total lines of code | 356,297 | ≤ 335,000 | `find src -name "*.ts" -o -name "*.tsx" | xargs wc -l` |
| God files (>300 lines) | 47 | ≤ 30 | Governance scan |
| TODO/FIXME comments | 139 | ≤ 100 | `grep -r "TODO\|FIXME" src/ | wc -l` |
| Deprecated exports | 173 | ≤ 100 | `grep -r "@deprecated" src/ | wc -l` |
| lib/ imports | 83 (36+47) | ≤ 20 | `grep -r "@/lib/" src/ | wc -l` |
| Circular dependencies | 5 | ≤ 2 | `madge --circular` |

### 8.4 Exit Criteria

Phase 1A is COMPLETE when:

1. ✅ All 4 epics marked DONE
2. ✅ All mandatory criteria met (8/8)
3. ✅ Quality gates passed for all stories
4. ✅ Success metrics targets achieved
5. ✅ Human approval: `APPROVED: PHASE-1A`
6. ✅ Retrospective completed
7. ✅ Phase 1B plan approved

---

## 9. APPENDICES

### Appendix A: Reference Documents

| Document | Location | Purpose |
|----------|----------|---------|
| Deep Scan Report | `_bmad-output/governance/phase-1a-deep-scan-2026-01-29.md` | Source data |
| Deep Scan YAML | `_bmad-output/governance/phase-1a-deep-scan-2026-01-29.yaml` | Structured data |
| Root Cause Fix | `_bmad-output/governance/ROOT-CAUSE-FIX-2026-01-20.md` | Prior fixes |
| Architecture Spec | `_bmad-output/planning-artifacts/architecture.md` | Technical architecture |
| ADR-039 | `_bmad-output/planning-artifacts/adr/ADR-039*.md` | Architecture decisions |
| AGENTS.md | `AGENTS.md` | Governance authority |

### Appendix B: Evidence Commands

```bash
# File counts
find src -name "*.ts" -o -name "*.tsx" | wc -l

# God files
find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | awk '$1 > 300 {print}'

# Circular dependencies
npx madge --circular src --extensions ts,tsx

# TODO/FIXME count
grep -r "TODO\|FIXME\|HACK\|XXX" src --include="*.ts" --include="*.tsx" | wc -l

# Deprecated exports
grep -r "@deprecated" src --include="*.ts" --include="*.tsx" | wc -l

# lib/ imports
grep -r "@/lib/" src --include="*.ts" --include="*.tsx" | wc -l

# window.location.href remaining
grep -r "window.location.href" src --include="*.ts" --include="*.tsx" | wc -l
```

### Appendix C: Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2026-01-29 | Initial creation | architect-ext |

---

**Document Status**: CONSTITUTIONAL FOUNDATION  
**Next Review**: 2026-02-05  
**Authority**: Tier 1 - All Phase 1A work must comply  

*End of Phase 1A Foundation Document*
