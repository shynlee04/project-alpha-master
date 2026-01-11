# Story Index

**Last Updated:** 2026-01-12T16:30:00+07:00
**Updated By:** Team B - EPIC-FS COMPLETE + EPIC-PERF Started

---

## Quick Stats

| Status | Count |
|--------|-------|
| DONE | 24 |
| IN_PROGRESS | 6 |
| NOT_STARTED | 5 |
| BLOCKED | 0 |
| INTEGRATED (CHAT) | 5 |

---

## EPIC-PERF (Performance Optimization) 🚀 NEW

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
| FS-05 | FileLockService Implementation | DONE | EPIC-FS | phase-2 | 2026-01-12 |
| FS-06 | Unified CRUD Operations | DONE | EPIC-FS | phase-2 | 2026-01-12 |
| FS-07 | Mobile File Picker | NOT_STARTED | EPIC-FS | phase-2 | 2026-01-09 |
| 39-01 | 8-bit Design Audit | NOT_STARTED | EPIC-39 | phase-2 | 2026-01-09 |
| 39-02 | Mobile-Friendly Redesign | NOT_STARTED | EPIC-39 | phase-2 | 2026-01-09 |

---

## In Review Stories

| ID | Title | Status | Epic | Reviewer | Last Updated |
|----|-------|--------|------|----------|--------------|
| P1.5-04 | Notes Reactivity Fix | CODE_REVIEW | Phase-1.5 | Pending | 2026-01-09 |

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
| EPIC-FS | IN_PROGRESS | 14 | 4 | 28.6% |
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
