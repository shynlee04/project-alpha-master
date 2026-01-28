# Story Index

**Last Updated:** 2026-01-29T12:00:00+07:00
**Updated By:** dev-ext - EPIC-CC-UXSPEC-COMPLIANCE + EPIC-CC-AR02AR03 completed

---

## Quick Stats

| Status | Count |
|--------|-------|
| DONE | 47 |
| IN_PROGRESS | 1 |
| NOT_STARTED | 11 |
| BLOCKED | 0 |
| INTEGRATED (CHAT) | 5 |
| PENDING | 1 |

---

## EPIC-CC-UXSPEC-COMPLIANCE ✅ 100% COMPLETE

**Completed:** 2026-01-29 | **Priority:** P0-CRITICAL
**Focus:** UX Specification Compliance Fixes

| ID | Title | Status | Completed | Notes |
|----|-------|--------|-----------|-------|
| CC-UX-01 | Wire StatusBar to Route | ✅ DONE | 2026-01-29 | StatusBar now displays project name per route |
| CC-UX-02 | Fix Plugin Loading | ✅ DONE | 2026-01-29 | Plugin loading UX improved, proper states |
| CC-UX-03 | Replace Hardcoded Colors | ✅ DONE | 2026-01-29 | CSS tokens applied, hardcoded values removed |
| CC-UX-04 | Archive Duplicate Files | ✅ DONE | 2026-01-29 | Duplicate components archived to .archive |
| CC-UX-05 | Visual Validation | ✅ DONE | 2026-01-29 | 85% compliance, gaps documented for EPIC-LAYOUT-CONSOLIDATION |

---

## EPIC-CC-AR02AR03 (Consolidation AR-02/AR-03) - 62.5% COMPLETE

**Started:** 2026-01-29 | **Priority:** P1-HIGH
**Focus:** Architecture Remediation Items AR-02 and AR-03

| ID | Title | Status | Completed | Notes |
|----|-------|--------|-----------|-------|
| CC-AR-01 | Add Missing i18n Keys | ✅ DONE | 2026-01-29 | 50+ keys added (EN/VI) |
| CC-AR-02 | Wire platform-defaults.ts | ✅ DONE | 2026-01-29 | Platform-aware defaults working |
| CC-AR-03 | Store Hydration Fix | ✅ DONE | 2026-01-27 | Previously completed |
| CC-AR-05 | Real Monaco Editor | ✅ DONE | 2026-01-28 | Previously completed |
| CC-AR-06 | Preview Plugin | ✅ DONE | 2026-01-28 | Previously completed |
| CC-AR-08 | Split PluginLayout | ✅ DONE | 2026-01-29 | Archived to WorkspaceLayout |
| CC-AR-04 | Toggle-Based Layout | ⏳ PENDING | - | Deferred to EPIC-LAYOUT-CONSOLIDATION |
| CC-AR-07 | Archive Legacy Files | 🔄 IN_PROGRESS | - | Partially complete |

---

## EPIC-LAYOUT-CONSOLIDATION (NEW - APPROVED)

**Started:** 2026-01-29 | **Priority:** P1-HIGH
**Sprint File:** sprint-LAYOUT-CONSOLIDATION-2026-01-29.yaml
**Team:** B | **Estimated Effort:** 14-18h

| ID | Title | Status | Effort | Dependencies |
|----|-------|--------|--------|--------------|
| LC-01 | Archive legacy layout components | READY | 1.5h | None |
| LC-02 | Consolidate layout stores | READY | 2-3h | LC-01 |
| LC-03 | Implement z-index governance | READY | 1.5h | None |
| LC-04 | Implement overflow governance | READY | 1h | None |
| LC-05 | Remove SystemRail | READY | 0.5h | None |
| LC-06 | Fix MainSidebar single render | READY | 1h | LC-01 |
| LC-07 | Make preset selector route-conditional | READY | 1h | None |
| LC-08 | Audit and remove unused CSS | READY | 1.5h | LC-03, LC-04 |
| LC-09 | Migrate routes to WorkspaceLayout | READY | 3h | LC-01-08 |
| LC-10 | Update AGENTS.md governance | READY | 1h | LC-09 |

**Bugs Being Addressed:** BUG-01 through BUG-10 (see sprint file)

---

## EPIC-UXUI-03 (Plugin Layout) ✅ 100% COMPLETE

**Completed:** 2026-01-28 | **Priority:** P0-CRITICAL
**Stories:** 17/17 | **Teams:** A (7) + B (10)

| ID | Title | Status | Team | Completed |
|----|-------|--------|------|-----------|
| UXUI-03-01 | Add GlobalSidebar to Project Routes | ✅ DONE | B | 2026-01-28 |
| UXUI-03-02 | Add 'main' to PanelPosition Type | ✅ DONE | B | 2026-01-28 |
| UXUI-03-03 | Create Activity Bar TOP Component | ✅ DONE | A | 2026-01-28 |
| UXUI-03-04 | Implement Main Content Plugin Switching | ✅ DONE | A | 2026-01-28 |
| UXUI-03-05 | Create Floating Plugin Docker | ✅ DONE | A | 2026-01-28 |
| UXUI-03-06 | Add L/M/R Placement Badges | ✅ DONE | A | 2026-01-28 |
| UXUI-03-07 | Persist Plugin Placements | ✅ DONE | A | 2026-01-28 |
| UXUI-03-08 | Add ARIA Landmarks | ✅ DONE | B | 2026-01-28 |
| UXUI-03-09 | Implement Skip Link | ✅ DONE | B | 2026-01-28 |
| UXUI-03-10 | Focus Trap in Modals | ✅ DONE | B | 2026-01-28 |
| UXUI-03-11 | Add Live Regions (aria-live) | ✅ DONE | B | 2026-01-28 |
| UXUI-03-12 | Implement Mobile Bottom Nav | ✅ DONE | A | 2026-01-28 |
| UXUI-03-13 | Implement Tablet Portrait Layout | ✅ DONE | A | 2026-01-28 |
| UXUI-03-14 | Add Activity Bar Tooltips | ✅ DONE | B | 2026-01-28 |
| UXUI-03-15 | Add Toast Notifications | ✅ DONE | B | 2026-01-28 |
| UXUI-03-16 | Keyboard Shortcuts (Cmd+1-6, Cmd+J) | ✅ DONE | B | 2026-01-28 |
| UXUI-03-17 | prefers-reduced-motion Support | ✅ DONE | B | 2026-01-28 |

---

## EPIC-PERF (Performance Optimization) ✅ 100% COMPLETE

**Started:** 2026-01-12 | **Priority:** P0-CRITICAL

| ID | Title | Status | Notes |
|----|-------|--------|-------|
| PERF-01 | Add useShallow to AgentChatPanel | ✅ DONE | 4 selectors optimized |
| PERF-02 | Add useShallow to IDEMobileLayout | ✅ DONE | 3 selectors optimized |
| PERF-03 | Add useShallow to SyncStatusSegment | ✅ DONE | 3 selectors optimized |
| PERF-04 | Add useShallow to SnippetManager | ✅ DONE | 7 selectors optimized |
| PERF-05 | Add useShallow to SnippetEditor | ✅ DONE | 2 selectors optimized |
| PERF-06 | Add useShallow to statusbar components | ✅ DONE | AgentStatus + FileType |
| PERF-07 | Add React.memo to NotesPage | ✅ DONE | 781 lines memoized |
| PERF-08 | Add React.memo to MonacoEditor | ✅ DONE | 769 lines memoized |
| PERF-09 | Add React.memo to KnowledgePage | ✅ DONE | 734 lines memoized |
| PERF-10 | Memoize event handlers | DEFERRED | Lower priority |
| PERF-11 | Remove unused dependencies | DEFERRED | Needs build verification |
| PERF-12 | Final validation | ✅ DONE | No new TS errors |

---

## EPIC-FS (File System Foundation) ✅ 100% COMPLETE

**Completed:** 2026-01-12 | All 14 stories verified

| ID | Title | Status | Completed |
|----|-------|--------|-----------|
| FS-01 | Fix NoteEditor lazy import | ✅ DONE | 2026-01-09 |
| FS-02 | ProjectRegistry with conflict detection | ✅ DONE | 2026-01-09 |
| FS-03 | Project ID namespacing | ✅ DONE | 2026-01-09 |
| FS-04 | Fix UI overlay issues | ✅ DONE | 2026-01-09 |
| FS-05 | FileLockService | ✅ DONE | 2026-01-12 |
| FS-06 | Unified CRUD Interface | ✅ DONE | 2026-01-12 |
| FS-07 | Mobile File Picker | ✅ DONE | 2026-01-12 |
| FS-08 | File Format Handlers | ✅ DONE | 2026-01-12 |
| FS-09 | Notes Workspace Data Model | ✅ DONE | 2026-01-12 |
| FS-10 | Sync Status Visualization | ✅ DONE | 2026-01-12 |
| FS-11 | Cross-Workspace File Watching | ✅ DONE | 2026-01-12 |
| FS-12 | Project Wizard | ✅ DONE | 2026-01-12 |
| FS-13 | Project Listing Page | ✅ DONE | 2026-01-12 |
| FS-14 | Workspace Entry Routing | ✅ DONE | 2026-01-12 |

---

## EPIC-CHAT (Thread Management Integration) ✅ INTEGRATED 2026-01-11

**ADR CHANGE:** 2026-01-11 - ThreadManager now integrated with UnifiedChatStore (Dexie)
- Legacy ThreadCard/ThreadsList archived to `_bmad-output/.archive/legacy-thread-components-2026-01-11/`
- ChatPanelWrapper now uses ThreadManager instead of ThreadCard
- UnifiedChatStore (Dexie) enables RAG, vector indexing, cross-workspace

| ID | Title | Status | Integrated | Notes |
|----|-------|--------|------------|-------|
| CHAT-004 | ChatInputControls | ✅ INTEGRATED | 2026-01-11 | EnhancedChatInterface:357 |
| CHAT-005 | useThreadManager | ✅ INTEGRATED | 2026-01-11 | ThreadManager hook - Dexie |
| CHAT-006 | ThreadManager | ✅ INTEGRATED | 2026-01-11 | Now used in ChatPanelWrapper |
| CHAT-007 | CollapsibleSection | ✅ INTEGRATED | 2026-01-11 | EnhancedChatInterface:494 |
| CHAT-009 | ArtifactPreviewModal | ✅ INTEGRATED | 2026-01-11 | EnhancedChatInterface:378 |

---

## Active Stories (Current Sprint)

| ID | Title | Status | Epic | Sprint | Last Updated |
|----|-------|--------|------|--------|--------------|
| LC-01 | Archive legacy layout components | READY | EPIC-LAYOUT-CONSOLIDATION | layout-consol | 2026-01-29 |
| LC-02 | Consolidate layout stores | READY | EPIC-LAYOUT-CONSOLIDATION | layout-consol | 2026-01-29 |
| LC-03 | Implement z-index governance | READY | EPIC-LAYOUT-CONSOLIDATION | layout-consol | 2026-01-29 |
| CC-AR-07 | Archive Legacy Files | IN_PROGRESS | EPIC-CC-AR02AR03 | consolidation | 2026-01-29 |
| ARCH-04-01 | FSA Handle Lifecycle | NOT_STARTED | EPIC-ARCH-04 | arch-04 | 2026-01-25 |
| ARCH-04-02 | Handle from Wizard | NOT_STARTED | EPIC-ARCH-04 | arch-04 | 2026-01-25 |
| 39-01 | 8-bit Design Audit | NOT_STARTED | EPIC-39 | phase-2 | 2026-01-09 |
| 39-02 | Mobile-Friendly Redesign | NOT_STARTED | EPIC-39 | phase-2 | 2026-01-09 |

---

## EPIC-ARCH-04 (Complete Migration & FSA Integration)

**Started:** 2026-01-25 | **Priority:** P0-CRITICAL

| ID | Title | Status | File |
|----|-------|--------|------|
| ARCH-04-01 | Integrate FSA Handle Lifecycle into ProjectContextProvider | NOT_STARTED | ARCH-04-01-fsa-handle-lifecycle-2026-01-25.md |
| ARCH-04-02 | Pass FSA Handle from Wizard to Route | NOT_STARTED | ARCH-04-02-handle-pass-route-2026-01-25.md |
| ARCH-04-03 | Integrate PermissionOverlay for New Architecture | NOT_STARTED | ARCH-04-03-permission-overlay-2026-01-25.md |
| ARCH-04-05 | End-to-End Flow Validation | NOT_STARTED | ARCH-04-05-e2e-flow-validation-2026-01-25.md |
| ARCH-04-04 | Archive Legacy Files and Update Imports | NOT_STARTED | ARCH-04-04-archive-legacy-files-2026-01-25.md |
| ARCH-04-06 | Clean Up Deprecated Options in Wizard | NOT_STARTED | ARCH-04-06-wizard-cleanup-2026-01-25.md |

---

## In Review Stories

| ID | Title | Status | Epic | Reviewer | Last Updated |
|----|-------|--------|------|----------|--------------|
| CC-AR-04 | Toggle-Based Layout | PENDING | EPIC-CC-AR02AR03 | Deferred | 2026-01-29 |

---

## Completed Stories

### EPIC-38 (Architecture Remediation)

| ID | Title | Completed | File |
|----|-------|-----------|------|
| 38-01 | Error Boundaries | 2026-01-08 | [story-38-01.md](story-38-01.md) |
| 38-02 | Move FS Adapters | 2026-01-08 | [story-38-02.md](story-38-02.md) |
| 38-03 | Storage Type Consolidation | 2026-01-08 | [story-38-03.md](story-38-03.md) |
| 38-04 | Interface Standardization | 2026-01-08 | [story-38-04.md](story-38-04.md) |
| 38-05 | Adapter Registry | 2026-01-08 | [story-38-05.md](story-38-05.md) |
| 38-05b | Registry Enhancements | 2026-01-08 | [story-38-05b.md](story-38-05b.md) |
| 38-05c | Registry Testing | 2026-01-08 | [story-38-05c.md](story-38-05c.md) |
| 38-05d | Registry Documentation | 2026-01-08 | [story-38-05d.md](story-38-05d.md) |
| 38-06 | Migration Cleanup | 2026-01-08 | [story-38-06.md](story-38-06.md) |
| 38-08 | Final Validation | 2026-01-08 | [story-38-08.md](story-38-08.md) |

### EPIC-30 (Stability)

| ID | Title | Completed | File |
|----|-------|-----------|------|
| 30-01 | Error Boundaries | 2026-01-05 | [story-30-01.md](story-30-01.md) |

### EPIC-31 (State Management)

| ID | Title | Completed | File |
|----|-------|-----------|------|
| 31-01 | Store Consolidation | 2026-01-04 | [story-31-01.md](story-31-01.md) |

---

## Phase-1 Stories (Archived)

Located in: `stories/phase-1/`

| ID | Title | Status | File |
|----|-------|--------|------|
| P1-01 | Simplify Notes Routes | DONE | [phase-1/P1-01-simplify-notes-routes.md](phase-1/P1-01-simplify-notes-routes.md) |
| P1-02 | Simplify IDE Routes | DONE | [phase-1/P1-02-simplify-ide-routes.md](phase-1/P1-02-simplify-ide-routes.md) |
| P1-03 | Temp Project Auto Flow | DONE | [phase-1/P1-03-temp-project-auto-flow.md](phase-1/P1-03-temp-project-auto-flow.md) |
| P1-04 | Fix Gemini Hardcoding | DONE | [phase-1/P1-04-fix-gemini-hardcoding.md](phase-1/P1-04-fix-gemini-hardcoding.md) |
| P1-05 | Agent Config Per Workspace | PARTIAL | [phase-1/P1-05-agent-config-per-workspace.md](phase-1/P1-05-agent-config-per-workspace.md) |
| P1-06 | IDE Full CRUD | NOT_STARTED | [phase-1/P1-06-investigate-ide-full-crud.md](phase-1/P1-06-investigate-ide-full-crud.md) |
| P1-07 | Notes Full CRUD | NOT_STARTED | [phase-1/P1-07-investigate-notes-full-crud.md](phase-1/P1-07-investigate-notes-full-crud.md) |
| P1-08 | Vault AI Chain | NOT_STARTED | [phase-1/P1-08-trace-vault-ai-chain.md](phase-1/P1-08-trace-vault-ai-chain.md) |

---

## Epic Summary

| Epic | Status | Stories Total | Done | Progress |
|------|--------|---------------|------|----------|
| EPIC-CC-UXSPEC-COMPLIANCE | DONE | 5 | 5 | 100% |
| EPIC-CC-AR02AR03 | IN_PROGRESS | 8 | 6 | 62.5% |
| EPIC-LAYOUT-CONSOLIDATION | READY | 10 | 0 | 0% |
| EPIC-UXUI-03 | DONE | 17 | 17 | 100% |
| EPIC-PERF | DONE | 12 | 10 | 83% |
| EPIC-FS | DONE | 14 | 14 | 100% |
| EPIC-39 | NOT_STARTED | 5 | 0 | 0% |
| EPIC-38 | DONE | 10 | 10 | 100% |
| EPIC-30 | DONE | 1 | 1 | 100% |
| EPIC-31 | DONE | 1 | 1 | 100% |
| Phase-1 | PARTIAL | 8 | 4 | 50% |

---

## Deprecated Stories (Legacy - Archived 2026-01-11)

| ID | Title | Status | Reason | Archived |
|----|-------|--------|--------|----------|
| N/A | ThreadCard | ARCHIVED | Replaced by ThreadManager | 2026-01-11 |
| N/A | ThreadsList | ARCHIVED | Replaced by ThreadManager | 2026-01-11 |
| N/A | ThreadFolderTree | ARCHIVED | Never integrated | 2026-01-11 |

**Note:** These legacy components used ConversationStore (in-memory Zustand).
Replaced with ThreadManager using UnifiedChatStore (Dexie) for:
- RAG vector indexing
- Cross-workspace handoff
- Full conversation persistence

---

## Governance Rules

### Story Lifecycle States

```
NOT_STARTED → CONTEXT_CREATED → IN_PROGRESS → CODE_REVIEW → TESTING → DONE
```

### Naming Convention

- Standard: `story-{epic}-{nn}.md` (e.g., `story-38-01.md`)
- Phase-specific: `{phase}-{nn}-{slug}.md` (e.g., `P1-03-temp-project-auto-flow.md`)
- Epic-specific: `epic-{id}-story-{nn}-{slug}.md`

### Policies

| Policy | Rule |
|--------|------|
| Max active stories | 8 per epic |
| Story TTL | 48h if inactive, requires review |
| Code review required | Yes, before DONE |
| Context file required | Yes, before IN_PROGRESS |
