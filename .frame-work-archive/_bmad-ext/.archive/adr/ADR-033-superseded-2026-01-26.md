---
title: "ADR-033: Correct-Course Architectural Remediation"
status: "SUPERSEDED"
archived_by: "ADR-039"
archived_date: "2026-01-26"
superseded_reason: "Consolidated into ADR-039: Unified Architecture Fundamentals (v2.0.0 Alignment)"
original_path: "_bmad-output/planning-artifacts/adr/ADR-033-correct-course-architectural-remediation-2026-01-16.md"
---

---
# ⚠️ SUPERSEDED DECISION RECORD
**Status:** SUPERSEDED
**Superseded By:** ADR-034-project-centric-architecture-2026-01-20.md
**Superseded Date:** 2026-01-25
**Reason:** Architectural consolidation - ADR-034 established project-centric architecture as primary authority
---

# ADR-033: Correct-Course Architectural Remediation

**Date**: 2026-01-16
**Status**: SUPERSEDED (was: APPROVED FOR SPRINT PLANNING)
**Decision Makers**: User + BMAD Master Orchestrator
**Supersedes**: ADR-032 (Clean Storage Architecture - now incorporated)
**Superseded By**: ADR-034

---

## Executive Summary

This ADR formalizes the architectural decisions for Project Alpha's foundation remediation. The codebase reached a critical state where Notes/IDE workspaces became non-functional due to unregulated boundaries between storage types, state management, and routing.

**This ADR is ready for sprint planning. No further decisions needed.**

---

## Context

### Problem Statement

1. **Routing**: Unclear entry points, broken hooks, toast/error chaos
2. **Storage**: FSA vs IndexedDB decided per call site, not centrally
3. **State**: 100+ store files, STUB implementations, race conditions
4. **Entity Naming**: `project` vs `workspace` confusion causing ID collisions
5. **File Tree**: Duplicate implementations in `lib/` and `infrastructure/`

### Trigger

Manual - Foundation collapse (Notes/IDE non-functional as of 2026-01-16)

---

## Decisions

### D1: Platform Detection & Routing

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Storage Type Selection** | Auto-detect, no user choice | Simplifies UX, no confusion |
| **Desktop Storage** | FSA (File System Access API) | Required for agentic coding |
| **Mobile/Tablet Storage** | IndexedDB (Dexie) | FSA not supported on mobile |
| **IDE Access** | Desktop only | FSA required for file CRUD |
| **Mobile IDE Behavior** | Block and redirect to Notes | Clear UX boundary |

### D2: FSA Handle Persistence

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Handle Storage** | Store `FileSystemDirectoryHandle` in IndexedDB | Chrome DevRel recommended |
| **Permission Persistence** | Use Chrome 122+ "Allow on every visit" | Research confirmed |
| **File Watching** | FileSystemObserver (129+), polling fallback | Native when available |
| **Fast Load Strategy** | Snapshot in Dexie, diff in background | No waiting on rescan |

### D3: Notes Storage for FSA Desktop

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Notes Location** | FSA folder (`/project/notes/*.md`) | Same tech as IDE, reactive |
| **Sync Direction** | Bidirectional (BlockNote ↔ Markdown) | External editor support |
| **Conflict Resolution** | Merge dialog if local dirty + external change | User decides |
| **Autosave Debounce** | 500ms | Balance between responsiveness and I/O |

### D4: Project Structure

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Metadata Folder** | `.viagent/` at project root | Hidden, consistent |
| **Notes Folder** | `/notes/` (configurable) | Separate from code |
| **Assets Folder** | `/notes/assets/` | Embedded media |
| **File IDs** | Path-based (relative from root) | FSA uses paths, debuggable |

### D5: Mobile Project Model

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Project Count** | Single default (`notes:browser-mode`) | Simpler for MVP |
| **Project Selection UI** | Not needed for MVP | Phase 2 |
| **Desktop Without Project** | Must create/select project first | Consistent with FSA model |

### D6: Dexie Schema Keys

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Composite Keys** | Keep `[projectId+workspaceId]` | Intentional isolation per workspace |
| **Meaning** | Same project = different data per workspace | Current design preserved |

### D7: Nested Folder Rules

| Scenario | Behavior |
|----------|----------|
| **Same path** | Block - cannot create duplicate |
| **Child of existing** | Warn - allow if user confirms |
| **Parent of existing** | Warn - allow if user confirms |
| **Sibling** | Allow - no overlap |
| **Completely separate** | Allow - no overlap |

### D8: File Discovery Limits

| Setting | Default | Rationale |
|---------|---------|-----------|
| **Max Depth** | 20 | Soft limit, most projects < 10 |
| **Warn At Depth** | 15 | Alert user before limit |
| **Max Files** | 50,000 | Performance boundary |
| **Max Total Size** | 500MB | Memory boundary |

### D9: Default Exclusions

```
node_modules, .git, .next, .nuxt, dist, build, out,
.cache, coverage, __pycache__, .venv, venv, .idea
```

---

## Architecture

### FSA Project Structure

```
/MyProject/                          ← FSA Project Root
├── .viagent/                        ← ViaGent metadata folder
│   ├── project.json                 ← Project config (ID, name, bindings)
│   ├── notes-index.json             ← Note metadata (titles, order, favorites)
│   ├── file-tree-snapshot.json      ← Cached file tree for fast load
│   └── rag-index/                   ← Local RAG vectors (optional)
│       ├── chunks.json
│       └── embeddings.bin
│
├── notes/                           ← Notes workspace content
│   ├── welcome.md                   ← Markdown file
│   └── assets/                      ← Embedded assets
│       └── image-abc123.png
│
├── src/                             ← Code (IDE workspace)
│   └── index.ts
│
└── docs/                            ← Viewable in Notes OR IDE
    └── api.md
```

### Platform Contract Interface

```typescript
interface PlatformContract {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  storageType: 'fsa' | 'indexeddb';
  canAccessFSA: boolean;
  canWatchFiles: boolean;
  canRunTerminal: boolean;
  canDoAgenticCoding: boolean;
  canAccessIDE: boolean;
}
```

### Agent Capabilities Interface

```typescript
interface AgentCapabilities {
  // Always available
  canSearchRAG: true;
  canReadChatHistory: true;
  canWriteNotes: true;
  canEmbedContent: true;
  
  // Platform-dependent
  canWriteRealFiles: boolean;
  canRunTerminal: boolean;
  canWatchFileChanges: boolean;
  canAccessExternalTools: boolean;
  
  // Derived
  canDoAgenticCoding: boolean;
  storageType: 'fsa' | 'indexeddb';
  deviceType: 'desktop' | 'mobile' | 'tablet';
}
```

### FSA Notes Sync Flow

```
BlockNote Editor
      │
      │ onChange (debounced 500ms)
      ▼
Convert to Markdown ─────► Write to FSA ─────► Update Snapshot
                                │
                                ▼
                          FileSystemObserver
                                │
                                │ External change detected
                                ▼
BlockNote Editor ◄────── Parse Markdown ◄────── Read from FSA

Conflict Resolution:
• Local dirty + external change → Show merge dialog
• Local clean + external change → Auto-reload
• Local dirty + no external → Just save
```

---

## Epic: EPIC-CC-ARC (Architectural Remediation Core)

| Field | Value |
|-------|-------|
| **Epic ID** | EPIC-CC-ARC |
| **Name** | Correct-Course Architectural Remediation |
| **Priority** | P0 - CRITICAL |
| **Estimated Effort** | 60-70 hours |
| **Duration** | 5-7 weeks |
| **Total Stories** | 28 |
| **Teams** | Team A + Team B (parallel) |

---

## Phase A: Identity & Routing (D1)

**Team Assignment**: Team A
**Duration**: Week 1

| Story ID | Title | Effort | Priority | Dependencies | Status |
|----------|-------|--------|----------|--------------|--------|
| ARC-A01 | Create `getPlatformContract()` service | 4h | P0 | None | TODO |
| ARC-A02 | Implement route guards for all workspace routes | 6h | P0 | ARC-A01 | TODO |
| ARC-A03 | Fix `useWorkspaceAccess` hook | 2h | P0 | None | ✅ DONE |
| ARC-A04 | Mobile → Notes redirect for IDE routes | 2h | P0 | ARC-A01 | TODO |
| ARC-A05 | Hub card click data contract (props passing) | 3h | P0 | ARC-A01 | TODO |
| ARC-A06 | Post-creation redirect logic (wizard → workspace) | 3h | P0 | ARC-A02 | TODO |

**Phase A Acceptance Criteria**:
- [ ] `getPlatformContract()` returns consistent values per session
- [ ] All workspace routes have `beforeLoad` guards
- [ ] Mobile users cannot access `/ide/*`
- [ ] Hub cards pass projectId correctly on click
- [ ] Wizard redirects to correct workspace after creation
- [ ] TypeScript: 0 errors

---

## Phase B: Storage Contract (D2, D3, D7, D8, D9)

**Team Assignment**: Team B
**Duration**: Week 1-2

| Story ID | Title | Effort | Priority | Dependencies | Status |
|----------|-------|--------|----------|--------------|--------|
| ARC-B01 | Create `StorageGateway` abstraction layer | 6h | P0 | ARC-A01 | TODO |
| ARC-B02 | Implement `FSAGateway` adapter with handle persistence | 6h | P0 | ARC-B01 | TODO |
| ARC-B03 | Implement `IDBGateway` adapter | 4h | P0 | ARC-B01 | TODO |
| ARC-B04 | Fix `browser-mode.ts` persistence | 2h | P0 | None | ✅ DONE |
| ARC-B05 | Implement FileSystemObserver with polling fallback | 6h | P0 | ARC-B02 | TODO |
| ARC-B06 | Implement snapshot caching for fast load | 4h | P1 | ARC-B05 | TODO |
| ARC-B07 | Folder overlap detection and warning UI | 4h | P0 | ARC-B01 | TODO |
| ARC-B08 | File tree exclusion patterns configuration | 3h | P1 | ARC-B05 | TODO |
| ARC-B09 | Scan depth limits and warnings | 2h | P1 | ARC-B08 | TODO |
| ARC-B10 | `.viagent/` metadata folder structure | 4h | P0 | ARC-B02 | TODO |
| ARC-B11 | Notes ↔ Markdown bidirectional sync | 8h | P0 | ARC-B10 | TODO |
| ARC-B12 | External change conflict resolution UI | 4h | P1 | ARC-B11 | TODO |

**Phase B Acceptance Criteria**:
- [ ] `StorageGateway` interface defined and used everywhere
- [ ] FSA handle persists across browser refresh
- [ ] File changes detected via observer or polling
- [ ] Snapshot loads in < 500ms (cached)
- [ ] Folder overlap shows warning dialog
- [ ] Notes save as `.md` files in FSA folder
- [ ] External edits auto-reload (if not dirty)
- [ ] TypeScript: 0 errors

---

## Phase C: State & Persistence (D3)

**Team Assignment**: Team A
**Duration**: Week 2-3

| Story ID | Title | Effort | Priority | Dependencies | Status |
|----------|-------|--------|----------|--------------|--------|
| ARC-C01 | Consolidate Project Store to infrastructure | 6h | P0 | None | TODO |
| ARC-C02 | Create facade re-exports for old paths | 2h | P0 | ARC-C01 | TODO |
| ARC-C03 | Fix `saveProject` STUB implementation | 2h | P0 | ARC-C01 | TODO |
| ARC-C04 | Implement persist-first pattern for all stores | 4h | P1 | ARC-C01 | TODO |
| ARC-C05 | Archive duplicate store files | 2h | P1 | ARC-C02 | TODO |
| ARC-C06 | Audit all STUB implementations | 4h | P0 | ARC-C01 | TODO |
| ARC-C07 | Dependency graph analysis (break circular deps) | 6h | P1 | ARC-C06 | TODO |
| ARC-C08 | Identify and fix race conditions | 6h | P0 | ARC-C07 | TODO |
| ARC-C09 | Permission model for human CRUD actions | 4h | P1 | ARC-B01 | TODO |
| ARC-C10 | Concurrent CRUD handling (optimistic locking) | 4h | P2 | ARC-C09 | TODO |

**Phase C Acceptance Criteria**:
- [ ] All stores in `infrastructure/persistence/stores/`
- [ ] Facade re-exports exist for old import paths
- [ ] `saveProject()` persists to DexieDB (not STUB)
- [ ] All STUB implementations identified and fixed
- [ ] No circular dependencies in store layer
- [ ] No race conditions in state updates
- [ ] TypeScript: 0 errors

---

## Phase D: Entity Standardization (D4)

**Team Assignment**: Team B
**Duration**: Week 3

| Story ID | Title | Effort | Priority | Dependencies | Status |
|----------|-------|--------|----------|--------------|--------|
| ARC-D01 | Enforce ProjectId template literal type | 3h | P1 | ARC-C01 | TODO |
| ARC-D02 | Fix `workspaceId \|\| projectId` fallback bugs | 4h | P1 | ARC-D01 | TODO |
| ARC-D03 | Rename `bindings` → `workspaceBindings` | 2h | P2 | ARC-D01 | TODO |

**Phase D Acceptance Criteria**:
- [ ] `ProjectId` is template literal type: `proj_${string}` or `notes:browser-mode`
- [ ] No `workspaceId || projectId` patterns in codebase
- [ ] `workspaceBindings` naming consistent throughout
- [ ] TypeScript: 0 errors

---

## Phase E: File Tree Cleanup (D6)

**Team Assignment**: Both Teams
**Duration**: Week 4

| Story ID | Title | Effort | Priority | Dependencies | Status |
|----------|-------|--------|----------|--------------|--------|
| ARC-E01 | Delete dead `.bak` files | 0.5h | P0 | None | TODO |
| ARC-E02 | Archive `src/lib/workspace/project-store/` | 1h | P1 | ARC-C02 | TODO |
| ARC-E03 | Archive `src/lib/filesystem/` duplicates | 1h | P1 | ARC-B01 | TODO |
| ARC-E04 | Update all imports to canonical paths | 4h | P2 | ARC-E02, ARC-E03 | TODO |

**Phase E Acceptance Criteria**:
- [ ] All `.bak` files deleted
- [ ] `src/lib/workspace/project-store/` archived to `_bmad-ext/.archive/`
- [ ] `src/lib/filesystem/` duplicates archived
- [ ] All imports use canonical paths (`@/infrastructure/...`)
- [ ] TypeScript: 0 errors

---

## Sprint Schedule

| Week | Phase | Team A Stories | Team B Stories |
|------|-------|----------------|----------------|
| 1 | A + B start | ARC-A01, A02, A04, A05, A06 | ARC-B01, B02, B07, B10 |
| 2 | B + C start | ARC-C01, C02, C03, C06 | ARC-B03, B05, B06, B11 |
| 3 | C + D | ARC-C04, C07, C08, C09 | ARC-B08, B09, B12, D01, D02 |
| 4 | E | ARC-E01, E02, C10 | ARC-E03, E04, D03 |

---

## Story Count Summary

| Phase | Stories | Effort | Team |
|-------|---------|--------|------|
| A | 6 | 20h | Team A |
| B | 12 | 53h | Team B |
| C | 10 | 40h | Team A |
| D | 3 | 9h | Team B |
| E | 4 | 6.5h | Both |
| **Total** | **28** (excl. 2 done) | **~65h** | |

---

## Already Completed (Phase 0)

| Story | File | Status |
|-------|------|--------|
| ARC-A03 | `workspace-access-helper.tsx` | ✅ DONE |
| ARC-B04 | `browser-mode.ts` | ✅ DONE |
| TypeScript fixes | `AITransformMenu.tsx`, `ReplacementPreviewDialog.tsx` | ✅ DONE |

---

## Deferred Epics (Feature Layer - Depends on Architecture)

| Epic | Description | Blocked Until |
|------|-------------|---------------|
| EPIC-AGENT-ORCH | Agent orchestrator layer | Phase C complete |
| EPIC-AGENT-PROMPTS | System instruction prompts | Phase C complete |
| EPIC-AGENT-MODES | Mode switching per workspace | Phase A complete |
| EPIC-AGENT-TOOLS | Tool focus groups | Phase B, C complete |
| EPIC-AGENT-AGENTIC | Multi-step agentic execution | All phases complete |
| EPIC-RAG | RAG infrastructure | Phase B complete |
| EPIC-MULTIMODAL | Multimodality I/O | Phase B complete |
| EPIC-CHAT-RAG | Chat thread RAG | Phase B, C complete |

---

## Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Breaking existing features | HIGH | Feature flags per phase |
| State migration failures | HIGH | Backup scripts, rollback plan |
| FSA browser compatibility | MEDIUM | Firefox fallback to IndexedDB |
| Performance regression | MEDIUM | Benchmarks before/after |
| Scope creep | MEDIUM | Strict adherence to stories |

---

## Success Criteria (Epic Complete)

- [ ] Notes workspace functional on desktop (FSA) and mobile (IndexedDB)
- [ ] IDE workspace functional on desktop only
- [ ] Projects persist across browser refresh
- [ ] External file changes detected and synced
- [ ] No STUB implementations remain
- [ ] No duplicate store files remain
- [ ] All imports use canonical paths
- [ ] TypeScript: 0 errors
- [ ] No race conditions in state updates
- [ ] Clear error handling (no random toasts)

---

## Appendix: Research Sources

| Topic | Source | Date |
|-------|--------|------|
| FSA Handle Persistence | developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api | Jan 2024 |
| FileSystemObserver API | developer.chrome.com/blog/file-system-observer | Aug 2024 |
| Chrome 129 Release Notes | developer.chrome.com/release-notes/129 | Sept 2024 |

---

## Related Documents

- Gap Analysis: `_bmad-output/planning-artifacts/correct-course-gap-analysis-2026-01-16.md`
- Main Plan: `_bmad-output/planning-artifacts/correct-course-architectural-remediation-2026-01-16.md`
- AGENTS.md: File tree governance rules
- CLAUDE.md: Architectural boundaries

---

**Document Owner**: BMAD Master Orchestrator
**Created**: 2026-01-16T20:00:00+07:00
**Status**: APPROVED FOR SPRINT PLANNING
**Next Step**: Update `sprint-status.yaml` with EPIC-CC-ARC stories
