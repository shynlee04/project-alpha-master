# Fresh Session Handoff Package

**Generated**: 2026-01-27T15:30:00+07:00
**Purpose**: Complete context for new coordinator session
**Project**: Via-Gent (Project Alpha)
**Generator**: analyst-ext
**Version**: 1.0.0

---

## SECTION 1: PROJECT OVERVIEW

### 1.1 Core Vision

Via-Gent is a browser-based AI-powered development workspace that enables solo developers, learners, and distributed teams to eliminate setup friction and ship applications faster. The platform provides a zero-server, privacy-first IDE with intelligent agents that can execute code changes, running 100% client-side via WebContainers with local filesystem integration.

**Platform Positioning**: Project-Centric Development Environment with Platform-Aware Plugin System.

### 1.2 Current Phase Reality Check

| Metric | Previous Claim | Actual Status |
|--------|----------------|---------------|
| **Phase 1A Completion** | 60% | **~30%** |
| **Health Score** | 95% | **45%** |
| **Root Cause** | - | 19 plugin coordination gaps |
| **P0 Blocker** | - | EPIC-0.6 Plugin Coordination |

### 1.3 Architecture Summary

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript 5.9 |
| Routing | TanStack Router (@tanstack/react-router) |
| State | Zustand v5 + Dexie.js |
| Styling | Tailwind CSS + Radix UI |
| Build | Vite + TanStack Start |
| Testing | Vitest + Playwright |
| AI | Google Gemini (@tanstack/ai-gemini) |
| Sandbox | WebContainer API (StackBlitz) |
| Storage | FSA (File System Access API) + IndexedDB |

### 1.4 Key File Statistics

| Category | Count |
|----------|-------|
| **Total TS/TSX files** | 1,746 |
| **src/lib/ files** | 507 |
| **src/infrastructure/ files** | 398 |
| **src/presentation/ files** | 650 |
| **src/domain/ files** | 65 |
| **src/routes/ files** | 24 |
| **Target** | ~1,000 files or fewer |
| **Reduction Needed** | ~700 files |

---

## SECTION 2: ACTIVE EPICS STATUS

| Epic | Status | Completion | Priority | Blocker |
|------|--------|------------|----------|---------|
| **EPIC-0** | COMPLETE | 100% | - | - |
| **EPIC-0.5** | ARCHIVED | PARTIAL (19 gaps) | - | Superseded by EPIC-0.6 |
| **EPIC-0.6** | NOT STARTED | 0% | **P0 BLOCKER** | None |
| **EPIC-ARCH-01** | IN_PROGRESS | 60% | P1 | - |
| **EPIC-ARCH-02** | IN_PROGRESS | 70% | P1 | - |
| **EPIC-ARCH-03** | IN_PROGRESS | 45% | P1 | - |
| **EPIC-ARCH-04-CC** | IN_PROGRESS | 95% | P0 | CC-04 E2E pending |
| **EPIC-CONSOLIDATION** | READY | 0% | P1 | - |

### EPIC-0.6 (P0 BLOCKER) - 12 Stories

| Story | Title | Priority | Effort |
|-------|-------|----------|--------|
| 0.6-01 | Create PluginCoordinationContext | P0 | 3-4h |
| 0.6-02 | Implement ActiveDocument Shared State | P0 | 2-3h |
| 0.6-03 | Add write-lock mechanism | P0 | 2-3h |
| 0.6-04 | Create PluginCapability interface | P0 | 2-3h |
| 0.6-05 | Boot WebContainer on Terminal mount | P0 | 3-4h |
| 0.6-06 | Wire Terminal ↔ Preview URL events | P0 | 2-3h |
| 0.6-07 | Notes dynamic noteId from coordination | P1 | 2h |
| 0.6-08 | Monaco ↔ Notes bidirectional mirroring | P1 | 3-4h |
| 0.6-09 | Process registry for Terminal | P1 | 2-3h |
| 0.6-10 | Plugin state preservation across toggle | P1 | 2h |
| 0.6-11 | Device-type capability enforcement | P1 | 2h |
| 0.6-12 | Plugin coordination E2E tests | P2 | 3-4h |

**Total Effort**: 20-30 hours

---

## SECTION 3: THE 19 COORDINATION GAPS

### Category 1: Shared State (5 gaps)

| Gap | Description | Impact | Status |
|-----|-------------|--------|--------|
| 1 | No shared ActiveDocument state | Monaco/Notes cannot coordinate | NOT STARTED |
| 2 | No "who has this file open" tracking | Multiple plugins can conflict | NOT STARTED |
| 3 | No write-lock mechanism | Race condition on save | NOT STARTED |
| 4 | No deferred capability queue | Plugins cannot request actions | NOT STARTED |
| 5 | Monaco has active file but not shared | Others cannot query | NOT STARTED |

### Category 2: Plugin Lifecycle (4 gaps)

| Gap | Description | Impact | Status |
|-----|-------------|--------|--------|
| 6 | No process registry | Terminal processes untracked | NOT STARTED |
| 7 | No capability declarations | Plugins cannot advertise | NOT STARTED |
| 8 | No dependency declarations | Plugins cannot express requirements | NOT STARTED |
| 9 | No onEnable/onDisable hooks | Plugin toggle has no lifecycle | NOT STARTED |

### Category 3: State Preservation (3 gaps)

| Gap | Description | Impact | Status |
|-----|-------------|--------|--------|
| 10 | No state preservation across toggle | Toggling plugin off loses state | NOT STARTED |
| 11 | No lazy resource booting | All plugins load at mount | NOT STARTED |
| 12 | No dependency checker | Plugins cannot verify prerequisites | NOT STARTED |

### Category 4: Event Contracts (5 gaps)

| Gap | Description | Impact | Status |
|-----|-------------|--------|--------|
| 13 | No Terminal → Preview URL events | Preview has no source | NOT STARTED |
| 14 | No Notes → Monaco mirroring | Same file not synced | NOT STARTED |
| 15 | No FileTree selection coordination | Selection state fragmented | NOT STARTED |
| 16 | No "file changed" priority | No writer priority system | NOT STARTED |
| 17 | Event bus exists but no contracts | Usage is inconsistent | NOT STARTED |

### Category 5: Platform Constraints (2 gaps)

| Gap | Description | Impact | Status |
|-----|-------------|--------|--------|
| 18 | No device-type capability declarations | No enforcement | NOT STARTED |
| 19 | No graceful degradation for mobile | Shows "not found" | NOT STARTED |

---

## SECTION 4: DELIVERABLE 1 - 100% SAFE FOR ARCHIVAL

### Deferred/Post-MVP Workspaces (Safe to Archive)

| Directory | File Count | Reason | Dependencies | Safe |
|-----------|------------|--------|--------------|------|
| `src/lib/study/` | 3 files | @deprecated - Post-MVP | None active | YES |
| `src/lib/pdf/` | 4 files | @deprecated - Package not installed | None active | YES |
| `src/lib/knowledge/` | 3 files | @deprecated - Post-MVP | Facade only | YES |

**Files**:
- `src/lib/study/quiz-types.ts` - @deprecated Study workspace deferred
- `src/lib/study/quiz-session.ts` - @deprecated Study workspace deferred
- `src/lib/study/quiz-generator.ts` - @deprecated Study workspace deferred
- `src/lib/pdf/pdf-vision-manager.ts` - @deprecated Package not installed
- `src/lib/pdf/pdf-vision-capture.ts` - @deprecated Package not installed
- `src/lib/pdf/pdf-vision-hook.ts` - @deprecated Package not installed
- `src/lib/pdf/pdf-vision-types.ts` - @deprecated Package not installed
- `src/lib/knowledge/synthesis-service.ts` - @deprecated Post-MVP
- `src/lib/knowledge/synthesis-types.ts` - @deprecated Post-MVP
- `src/lib/knowledge/types.ts` - @deprecated Post-MVP

**Total Safe for Archival**: 10 files

### Already Archived Content

| Archive Directory | Items | Date |
|-------------------|-------|------|
| `_bmad-ext/.archive/spike-codebase-2026-01-26/` | Spike code | 2026-01-26 |
| `_bmad-ext/.archive/legacy-routes-2026-01-26/` | 13 legacy routes | 2026-01-26 |
| `_bmad-ext/.archive/duplicate-epics-2026-01-26/` | 6 duplicate epics | 2026-01-26 |
| `_bmad-ext/.archive/workspace-terminology-2026-01-26/` | 14 files | 2026-01-26 |
| `_bmad-ext/.archive/contaminated-2026-01-18/` | 40 items | 2026-01-18 |
| `_bmad-ext/.archive/dead-bak-files-2026-01-19/` | 23 files | 2026-01-19 |

---

## SECTION 5: DELIVERABLE 2 - PARTIALLY LEGACY (TRACKING)

### Files with @deprecated Annotations

| File | Legacy % | Transition Epic | Status |
|------|----------|-----------------|--------|
| `src/lib/workspace/temp-project.ts` | 80% | EPIC-0 | Deprecated Phase 4 |
| `src/lib/workspace/workspace-access-helper.tsx` | 70% | EPIC-0 | Deprecated Phase 4 |
| `src/lib/agent/tool-permission-manager.ts` | 100% | ARCH-01 | Use tool-permission/ instead |
| `src/lib/agent/system-prompt.ts` | 60% | ARCH-01 | Multiple @deprecated methods |
| `src/lib/agent/providers/types.ts` | 100% | ARCH-01 | Re-export from domain |
| `src/lib/snippets/snippet-store.ts` | 90% | ARCH-02 | Major refactoring |
| `src/lib/filesystem/file-snapshot-store.ts` | 100% | ARCH-02 | Use refactored version |
| `src/lib/filesystem/sync-manager.ts` | 80% | ARCH-02 | Major refactoring |
| `src/lib/workspace/threads-store.ts` | 100% | ARCH-02 | Not a Zustand store |
| `src/lib/workspace/file-sync-status-store/*` | 50% | ARCH-02 | Use consolidated store |

**Total Files with @deprecated**: 37 files in src/lib

### Transition Tracking

| Source File | Target Location | Migration Epic | Status |
|-------------|-----------------|----------------|--------|
| `src/lib/agent/tool-permission-manager.ts` | `src/lib/agent/tool-permission/` | ARCH-01 | IN_PROGRESS |
| `src/lib/agent/providers/types.ts` | `src/domain/types/llm` | ARCH-01 | COMPLETE (facade) |
| `src/lib/filesystem/*` | `src/infrastructure/filesystem/` | ARCH-02 | PARTIAL |
| `src/lib/workspace/*` | `src/infrastructure/persistence/stores/` | ARCH-02 | PARTIAL |

---

## SECTION 6: DELIVERABLE 3 - INCONSISTENCY CATALOG

### Type Inconsistencies (Duplicate Definitions)

| Type Name | Occurrences | Locations | Canonical Location | Action |
|-----------|-------------|-----------|-------------------|--------|
| `WorkspaceType` | 11 | Multiple | `src/domain/types/workspace.ts` | Consolidate |
| `ValidationResult` | 9 | Multiple | `src/domain/types/validation.ts` | Consolidate |
| `FileMetadata` | 6 | Multiple | `src/domain/types/file.ts` | Consolidate |
| `FileEntry` | 6 | Multiple | `src/domain/types/file.ts` | Consolidate |
| `FileChangeEvent` | 6 | Multiple | `src/domain/types/events.ts` | Consolidate |
| `SyncStatus` | 5 | Multiple | `src/domain/types/sync.ts` | Consolidate |
| `MigrationResult` | 5 | Multiple | `src/infrastructure/persistence/` | Consolidate |
| `ConflictResolution` | 5 | Multiple | `src/domain/types/sync.ts` | Consolidate |
| `ToolCategory` | 4 | Multiple | `src/domain/types/agent.ts` | Consolidate |
| `StorageType` | 4 | Multiple | `src/domain/types/storage.ts` | Consolidate |

### Type Suppressions

| Category | Count |
|----------|-------|
| `as any` + `@ts-ignore` + `@ts-expect-error` | **765** |
| **Target** | < 50 |
| **Reduction Needed** | 715 |

### God Files (>500 lines)

| File | Lines | Category | Action |
|------|-------|----------|--------|
| `ProviderService.ts` | 1,943 | God Class | Split by provider |
| `dexie-db-migrations.ts` | 1,746 | Migration | OK - incremental |
| `AISlashCommand.tsx` | 1,674 | God Component | Split by command |
| `template-registry.ts` | 1,321 | Data | OK - registry |
| `dexie-db.ts` | 1,213 | Schema | OK - schema |
| `NoteEditor.tsx` | 1,134 | God Component | Split by feature |
| `NotesPage.tsx` | 1,102 | God Component | Split |
| `event-bus.ts` | 888 | God Class | Extract slices |
| `file-tree-scanner.ts` | 833 | Complex | OK - algorithm |
| `fsa-gateway.ts` | 816 | Complex | OK - gateway |

### Duplicate File Names (Same basename in multiple locations)

| Filename | Occurrences | Locations Summary |
|----------|-------------|-------------------|
| `index.ts` | Many | OK - module exports |
| `types.ts` | Many | Needs consolidation |
| `constants.ts` | Many | Needs consolidation |
| `hooks.ts` | Many | Needs consolidation |
| `utils.ts` | Many | Needs consolidation |
| `sync-manager.ts` | 2 | lib/filesystem + infrastructure |
| `platform-detection.ts` | 2 | Multiple |
| `file-sync-service.ts` | Multiple | Per workspace |

---

## SECTION 7: FILE CONSOLIDATION TARGETS

### Current vs Target Distribution

| Layer | Current | Target | Reduction |
|-------|---------|--------|-----------|
| `src/lib/` | 507 | ~200 | -307 |
| `src/infrastructure/` | 398 | ~300 | -98 |
| `src/presentation/` | 650 | ~400 | -250 |
| `src/domain/` | 65 | ~100 | +35 |
| `src/routes/` | 24 | ~20 | -4 |
| **Total** | **1,746** | **~1,000** | **-746** |

### src/lib Consolidation Priority

| Subdirectory | Files | Strategy |
|--------------|-------|----------|
| `agent/` | 140 | Keep - well organized |
| `filesystem/` | 59 | Move to infrastructure |
| `notes/` | 57 | Keep - presentation domain |
| `rag/` | 41 | Keep - domain logic |
| `workspace/` | 33 | Move to infrastructure |
| `workflow/` | 20 | Keep - domain logic |
| `filesync/` | 15 | Move to infrastructure |
| `events/` | 11 | Move to infrastructure |
| `webcontainer/` | 10 | Move to infrastructure |
| `study/` | 3 | Archive (deferred) |
| `knowledge/` | 3 | Archive (deferred) |
| `pdf/` | 4 | Archive (deferred) |

---

## SECTION 8: PROGRESSIVE REFACTORING ROADMAP

### Phase 1: Coordination Layer (EPIC-0.6) - IMMEDIATE

**Effort**: 20-30 hours
**Priority**: P0 BLOCKER

1. **0.6-01**: Create `PluginCoordinationContext` (3-4h)
2. **0.6-02**: Implement `ActiveDocument` shared state (2-3h)
3. **0.6-04**: Create `PluginCapability` interface (2-3h)
4. **0.6-05**: Boot WebContainer on Terminal mount (3-4h)
5. **0.6-06**: Wire Terminal → Preview URL events (2-3h)

### Phase 2: Terminal + Preview Integration

**Stories**: 0.6-05 to 0.6-09
**Effort**: 10-15 hours

- WebContainer boot on mount
- FSA → WebContainer mount
- Process registry
- URL detection and routing

### Phase 3: Legacy Cleanup (Post EPIC-0.6)

**Based on Deliverable 1 & 2**

| Action | Files | Effort |
|--------|-------|--------|
| Archive deferred modules | 10 files | 1h |
| Migrate lib/filesystem → infrastructure | 59 files | 8h |
| Migrate lib/workspace → infrastructure | 33 files | 6h |
| Remove deprecated facades | 37 files | 4h |

### Phase 4: Type Consolidation

**Based on Deliverable 3**

| Action | Items | Effort |
|--------|-------|--------|
| Consolidate duplicate types | 30+ types | 8h |
| Reduce type suppressions | 765 → 50 | 16h |
| Split god components | 5 components | 12h |

---

## SECTION 9: KEY FILE REFERENCES

### Governance Documents

| Document | Path | Purpose |
|----------|------|---------|
| **AGENTS.md** | `/AGENTS.md` | Master governance |
| **LOOP_STATE** | `/_bmad-ext/state/LOOP_STATE.yaml` | Session state |
| **Workflow Status** | `/bmm-workflow-status.yaml` | Workflow tracking |
| **Sprint Status** | `/_bmad-output/sprint-artifacts/sprint-status.yaml` | Active sprint |

### Planning Artifacts

| Document | Path |
|----------|------|
| **Architecture** | `/_bmad-output/planning-artifacts/architecture.md` |
| **Epics** | `/_bmad-output/planning-artifacts/epics.md` |
| **PRD** | `/_bmad-output/planning-artifacts/prd.md` |
| **UX Spec** | `/_bmad-output/project-planning-artifacts/ux-design-specification.md` |

### Analysis Documents

| Document | Path |
|----------|------|
| **Phase 1A Problems** | `/docs/analysis/phase-1a-plugin-coordination-problems-2026-01-27.md` |
| **Bento Grid Spec** | `/_bmad-output/analysis/BENTO-GRID-LAYOUT-SPEC-2026-01-27.md` |
| **Layout Architecture** | `/_bmad-output/analysis/LAYOUT-ARCHITECTURE-SPEC-2026-01-27.md` |

### Retrospectives

| Document | Path |
|----------|------|
| **EPIC-0** | `/_bmad-output/retrospectives/EPIC-0-RETROSPECTIVE-2026-01-26.md` |
| **EPIC-0.5** | `/_bmad-output/retrospectives/EPIC-0.5-RETROSPECTIVE-2026-01-27.md` |

---

## SECTION 10: IMMEDIATE NEXT ACTIONS

### Priority 1 (Today)

1. **Start EPIC-0.6-01**: Create `PluginCoordinationContext`
2. **Validate**: Run `pnpm tsc --noEmit` before any changes
3. **Read**: EPIC-0.5 Retrospective for full gap analysis

### Priority 2 (This Sprint)

4. Execute EPIC-0.6-02: `ActiveDocument` shared state
5. Execute EPIC-0.6-04: `PluginCapability` interface
6. Execute EPIC-0.6-05: WebContainer boot

### Priority 3 (Parallel)

7. Deep scan for legacy file archival
8. Track dependent file modifications
9. Integration tests after each story

---

## SECTION 11: COORDINATOR INSTRUCTIONS

### Your Role

You are the **Master Coordinator**. You DO NOT execute code directly.

**You delegate to**:
- `dev-ext` (Team A) - Primary implementation
- `dev-ext-team-b` (Team B) - Parallel implementation
- `analyst-ext` - Research and analysis
- `architect-ext` - Architecture decisions
- `ux-designer-ext` - UX specifications

### Key Constraints

1. **Always read AGENTS.md first** - Master governance rules
2. **Check bmm-workflow-status.yaml** - Current state and guidance
3. **Never claim completion without evidence** - Screenshots, test output, code review
4. **Update TODO list continuously** - Track progress
5. **Delegate with full context** - Include story ID, acceptance criteria, constraints

### Progressive Refactoring Rules

1. **Never create without registering** - All new files in registry
2. **Never delete without archiving** - Move to `_bmad-ext/.archive/`
3. **Track all dependencies before removal** - Grep for imports
4. **Forecast transition timelines** - Estimate effort per migration
5. **Catalog all inconsistencies** - Update Deliverable 3

### Tool Permission Matrix

| Agent | write | edit | bash | task |
|-------|-------|------|------|------|
| `dev-ext` | true | true | true (limited) | true |
| `analyst-ext` | true | false | true (scan) | false |
| `architect-ext` | true | false | false | true |
| `ux-designer-ext` | true | false | false | true |

---

## SECTION 12: SUMMARY STATISTICS

### Codebase Health

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **Total Files** | 1,746 | 1,000 | OVER |
| **God Files (>500 lines)** | 40+ | 0 | CRITICAL |
| **Type Suppressions** | 765 | 50 | CRITICAL |
| **Duplicate Types** | 30+ | 0 | HIGH |
| **@deprecated Files** | 37 | 0 | HIGH |
| **Deep Imports (../../..)** | 10 | 0 | OK |
| **TypeScript Errors** | 0 | 0 | OK |

### Epic Health

| Epic | Stories | Complete | Blocked | Health |
|------|---------|----------|---------|--------|
| EPIC-0.6 | 12 | 0 | 0 | 0% |
| EPIC-ARCH-01 | 8 | 5 | 0 | 60% |
| EPIC-ARCH-02 | 10 | 7 | 0 | 70% |
| EPIC-ARCH-03 | 8 | 4 | 0 | 45% |
| EPIC-ARCH-04-CC | 4 | 3 | 1 | 95% |

### Archive Summary

| Category | Count |
|----------|-------|
| **Safe for Archival (Deliverable 1)** | 10 files |
| **Tracking for Transition (Deliverable 2)** | 37 files |
| **Type Inconsistencies (Deliverable 3)** | 30+ types |
| **Already Archived** | 100+ items |

---

## SECTION 13: CONTEXT LOADING QUICK START

```bash
# 1. Validate TypeScript (always first)
pnpm tsc --noEmit

# 2. Read current workflow state
cat bmm-workflow-status.yaml | head -100

# 3. Load EPIC-0.6 details
grep -A 50 "EPIC-0.6" _bmad-output/planning-artifacts/epics.md

# 4. Check active sprint
cat _bmad-output/sprint-artifacts/sprint-status.yaml | head -50

# 5. Load retrospective learnings
cat _bmad-output/retrospectives/EPIC-0.5-RETROSPECTIVE-2026-01-27.md | head -100
```

---

**END OF HANDOFF PACKAGE**

---

*Document Generated: 2026-01-27T15:30:00+07:00*
*Generator: analyst-ext*
*Total Sections: 13*
*Total Lines: ~600*
