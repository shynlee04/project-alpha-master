# Via-Gent Epics and Stories (Working Copy)

**Version:** 2.2.0 (Phase 1 Updated - Team B Working Copy)
**Date:** 2026-01-22
**Status:** WORKING COPY - DO NOT MODIFY ORIGINAL
**Related Documents:**
- Original: `_bmad-output/planning-artifacts/epics.md`
- Audit: `_bmad-output/planning-artifacts/team-b-phase-1/phase-1-audit-report.md`
- ADR-033: `_bmad-output/planning-artifacts/adr/ADR-033-correct-course-architectural-remediation-2026-01-16.md`
- ADR-034: `_bmad-output/planning-artifacts/adr/ADR-034-workspace-access-infection-remediation-2026-01-17.md`

---

> **[UPDATED: 2026-01-22 - Team B Phase 1 Task 1.4]**
> This is a working copy of the epics document. Changes from the original are tracked in `epics-updates-summary.md`.

---

## ⚡ Quick Reference

| Epic | Name | Progress | Priority | Status |
|------|------|----------|----------|--------|
| **EPIC-CC-01** | Project Space Foundation | 40% | P0 | IN_PROGRESS |
| **EPIC-CC-02** | BYOK Cleanup | 100% | P0 | COMPLETE |
| **EPIC-CC-03** | Chat Flow Stabilization | 0% | P1 | BLOCKED |
| **EPIC-CC-04** | Notes Refactoring | 0% | P1 | BLOCKED |
| **EPIC-BYOK** | Complete BYOK Implementation | 0% | P0 | PROPOSED |
| **EPIC-PS** | Project Space Foundation | 0% | P0 | PROPOSED |
| **ARC Stories** | ADR-033 Remediation | See phases | P0 | IN_PROGRESS |

> **[NOTE: 2026-01-22]** EPIC-01 through EPIC-06 have been **REMOVED** from this working copy. They are superseded by EPIC-CC series and ARC stories. See original document for historical reference.

---

## EPIC-CC-01: Project Space Foundation

**Priority:** P0 (Critical)
**Status:** IN_PROGRESS
**Progress:** 40% (4/10 stories)
**Team:** Team B

### Stories

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| PS-01 | Split useWorkspaceFileSystem God Store | 4h | P0 | DONE |
| TS-CLEAN | TypeScript Zero Errors | 3h | P0 | DONE |
| FSA-ADAPTER | Create FSAStorageAdapter with watch() | 6h | P0 | DONE |
| PS-02-A | Platform Detection & Storage Routing | 4h | P0 | DONE |
| PS-02-B | Hot Reactive Sync Integration | 4h | P0 | IN_PROGRESS |
| AUDIT-P0-01 | Add Route Guards for Platform & Storage Type | 2h | P0 | DONE |
| AUDIT-P0-02 | Fix FSA Handle Restoration Condition | 1h | P0 | DONE |
| AUDIT-P1-01 | Platform Detection in Project Wizard | 2h | P1 | DONE |
| PS-04 | Handle Persistence Architecture | 6h | P0 | DONE |
| PS-05 | Virtual File System Tree Structure | 8h | P0 | DONE |
| PS-06 | RAG Index Infrastructure | 8h | P1 | DONE |

---

## EPIC-CC-02: BYOK Cleanup

**Priority:** P0
**Status:** COMPLETE
**Progress:** 100%
**Team:** Team A

| ID | Title | Status |
|----|-------|--------|
| BYOK-01 | Split Provider Credentials God Slice | DONE |
| BYOK-02 | Add Zod Validation Schemas | DONE |
| BYOK-03 | Archive Legacy Migration Code | DONE |
| BYOK-04 | Add projectId to Tool Execution Logs | DONE |

---

## EPIC-CC-03: Chat Flow Stabilization

**Priority:** P1
**Status:** BLOCKED
**Progress:** 0%
**Blocked By:** EPIC-CC-01

---

## EPIC-CC-04: Notes Refactoring

**Priority:** P1
**Status:** BLOCKED
**Progress:** 0%
**Blocked By:** EPIC-CC-01

---

## EPIC-BYOK: Complete BYOK Implementation

**Priority:** P0
**Status:** PROPOSED
**Progress:** 0%
**Source:** Phase 1 Document Audit

### Stories

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| BYOK-EXT-01 | Complete vault integration | 4h | P0 | TODO |
| BYOK-EXT-02 | Provider adapter updates | 2h | P0 | TODO |
| BYOK-EXT-03 | Permission enforcement | 2h | P0 | TODO |
| BYOK-EXT-04 | UI for key management | 4h | P1 | TODO |

---

## EPIC-PS: Project Space Foundation (Alternative Naming)

> **[NOTE: 2026-01-22]** This epic is an alternative name for EPIC-CC-01. See ADR-033 D1-D9 for canonical implementation.

### Stories (If Used Separately)

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| PS-01 | Platform detection implementation | 2h | P0 | TODO |
| PS-02 | Entry matrix implementation | 4h | P0 | TODO |
| PS-03 | Desktop-only IDE guard | 2h | P0 | TODO |
| PS-04 | Project selection hotload | 3h | P1 | TODO |
| PS-05 | Direct landing routes | 2h | P1 | TODO |

---

## ARC Stories: ADR-033 Architectural Remediation

> **[ADDED: 2026-01-22]** ADR-033 stories for Correct-Course Architectural Remediation

### Phase A: Identity & Routing (Team A)

| Story ID | Title | Effort | Priority | Status |
|----------|-------|--------|----------|--------|
| ARC-A01 | Create `getPlatformContract()` service | 4h | P0 | TODO |
| ARC-A02 | Implement route guards for all workspace routes | 6h | P0 | TODO |
| ARC-A04 | Mobile → Notes redirect for IDE routes | 2h | P0 | TODO |
| ARC-A05 | Hub card click data contract | 3h | P0 | TODO |
| ARC-A06 | Post-creation redirect logic | 3h | P0 | TODO |

### Phase B: Storage Contract (Team B)

| Story ID | Title | Effort | Priority | Status |
|----------|-------|--------|----------|--------|
| ARC-B01 | Create `StorageGateway` abstraction layer | 6h | P0 | TODO |
| ARC-B02 | Implement `FSAGateway` adapter with handle persistence | 6h | P0 | TODO |
| ARC-B03 | Implement `IDBGateway` adapter | 4h | P0 | TODO |
| ARC-B05 | Implement FileSystemObserver with polling fallback | 6h | P0 | TODO |
| ARC-B06 | Implement snapshot caching for fast load | 4h | P1 | TODO |
| ARC-B07 | Folder overlap detection and warning UI | 4h | P0 | TODO |
| ARC-B08 | File tree exclusion patterns configuration | 3h | P1 | TODO |
| ARC-B09 | Scan depth limits and warnings | 2h | P1 | TODO |
| ARC-B10 | `.viagent/` metadata folder structure | 4h | P0 | TODO |
| ARC-B11 | Notes ↔ Markdown bidirectional sync | 8h | P0 | TODO |
| ARC-B12 | External change conflict resolution UI | 4h | P1 | TODO |

### Phase C: State & Persistence (Team A)

| Story ID | Title | Effort | Priority | Status |
|----------|-------|--------|----------|--------|
| ARC-C01 | Consolidate Project Store to infrastructure | 6h | P0 | TODO |
| ARC-C02 | Create facade re-exports for old paths | 2h | P0 | TODO |
| ARC-C03 | Fix `saveProject` STUB implementation | 2h | P0 | TODO |
| ARC-C04 | Implement persist-first pattern for all stores | 4h | P1 | TODO |
| ARC-C06 | Audit all STUB implementations | 4h | P0 | TODO |
| ARC-C07 | Dependency graph analysis | 6h | P1 | TODO |
| ARC-C08 | Identify and fix race conditions | 6h | P0 | TODO |
| ARC-C09 | Permission model for human CRUD actions | 4h | P1 | TODO |
| ARC-C10 | Concurrent CRUD handling (optimistic locking) | 4h | P2 | TODO |

### Phase D: Entity Standardization (Team B)

| Story ID | Title | Effort | Priority | Status |
|----------|-------|--------|----------|--------|
| ARC-D01 | Enforce ProjectId template literal type | 3h | P1 | TODO |
| ARC-D02 | Fix `workspaceId || projectId` fallback bugs | 4h | P1 | TODO |
| ARC-D03 | Rename `bindings` → `workspaceBindings` | 2h | P2 | TODO |

### Phase E: File Tree Cleanup (Both Teams)

| Story ID | Title | Effort | Priority | Status |
|----------|-------|--------|----------|--------|
| ARC-E01 | Delete dead `.bak` files | 0.5h | P0 | TODO |
| ARC-E02 | Archive `src/lib/workspace/project-store/` | 1h | P1 | TODO |
| ARC-E03 | Archive `src/lib/filesystem/` duplicates | 1h | P1 | TODO |
| ARC-E04 | Update all imports to canonical paths | 4h | P2 | TODO |

---

## EPIC-CC-05: Fix Hooks Error (Phase 1 - Alternative)

**Priority:** P0
**Status:** READY_FOR_DEV
**Progress:** 0%

### Stories

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| CC-05-01 | Remove useLiveQuery hook | 30m | P0 | TODO |
| CC-05-02 | Create custom useFSAProjects() hook | 20m | P0 | TODO |
| CC-05-03 | Test Notes workspace (desktop + mobile) | 10m | P0 | TODO |

---

## EPIC-CC-06: Fix Route Loading Race Condition (Phase 2 - Alternative)

**Priority:** P0
**Status:** READY_FOR_DEV
**Progress:** 0%
**Blocker:** EPIC-CC-05

### Stories

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| CC-06-01 | Create waitForHydration() function | 30m | P0 | TODO |
| CC-06-02 | Update notes.$projectId loader | 20m | P0 | TODO |
| CC-06-03 | Update ide.$projectId loader | 20m | P0 | TODO |
| CC-06-04 | Query Dexie directly | 20m | P0 | TODO |

---

## EPIC-CC-07: Fix FSA Handle Persistence (Phase 3 - Alternative)

**Priority:** P0
**Status:** READY_FOR_DEV
**Progress:** 0%
**Blocker:** EPIC-CC-06

### Stories

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| CC-07-01 | Implement Chrome 129 detection | 20m | P0 | TODO |
| CC-07-02 | Store actual FSA handle | 40m | P0 | TODO |
| CC-07-03 | Implement silent restore | 30m | P0 | TODO |
| CC-07-04 | Add handle to ProjectContext | 20m | P0 | TODO |
| CC-07-05 | Update StorageGatewayFactory | 30m | P0 | TODO |

---

## EPIC-CC-08: Fix State Scoping (Phase 4 - Alternative)

**Priority:** P1
**Status:** READY_FOR_DEV
**Progress:** 0%
**Blocker:** EPIC-CC-07

### Stories

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| CC-08-01 | Add project scope to IDE store | 30m | P1 | TODO |
| CC-08-02 | Add project scope to workspace store | 30m | P1 | TODO |
| CC-08-03 | Use Dexie for workspace state | 30m | P1 | TODO |
| CC-08-04 | Add cleanup on workspace switch | 30m | P1 | TODO |

---

## EPIC-CC-09: Fix Platform Guards (Phase 5 - Alternative)

**Priority:** P1
**Status:** READY_FOR_DEV
**Progress:** 0%
**Blocker:** EPIC-CC-08

### Stories

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| CC-09-01 | Add guard to /ide route | 15m | P1 | TODO |
| CC-09-02 | Add guard to /ide/$projectId | 15m | P1 | TODO |
| CC-09-03 | Hide IDE icon on mobile | 15m | P1 | TODO |
| CC-09-04 | Add toast messages | 15m | P1 | TODO |

---

## EPIC-CC-10: Remove Temp Project (Phase 6 - Alternative)

**Priority:** P1
**Status:** READY_FOR_DEV
**Progress:** 0%
**Blocker:** EPIC-CC-09

### Stories

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| CC-10-01 | Remove temp project option | 20m | P1 | TODO |
| CC-10-02 | Remove browser DB option on desktop | 20m | P1 | TODO |
| CC-10-03 | Add project list | 20m | P1 | TODO |

---

## EPIC-CC-11: Fix Terminal Loading (Phase 7 - Alternative)

**Priority:** P2
**Status:** READY_FOR_DEV
**Progress:** 0%
**Blocker:** EPIC-CC-10

### Stories

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| CC-11-01 | Investigate WebContainer boot | 30m | P2 | TODO |
| CC-11-02 | Fix WebContainer config | 30m | P2 | TODO |
| CC-11-03 | Add error feedback | 20m | P2 | TODO |

---

## EPIC-CC-12: End-to-End Testing (Phase 8 - Alternative)

**Priority:** P2
**Status:** READY_FOR_DEV
**Progress:** 0%
**Blocker:** All previous epics

### Stories

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| CC-12-01 | Test desktop user journeys | 40m | P2 | TODO |
| CC-12-02 | Test mobile user journeys | 30m | P2 | TODO |
| CC-12-03 | Verify ADR compliance | 20m | P2 | TODO |

---

## ADR-034 Infection Registry

> **[ADDED: 2026-01-22]** 31 infection points identified in ADR-034

### Domain 1: FSA Handle Persistence (10 Issues)

| ID | File | Issue | Severity | Status |
|----|------|-------|----------|--------|
| FSA-001 | `fsa-handle-manager.ts:26-36` | Stores `handle as any` - throws DataCloneError | P0 | INFECTED |
| FSA-002 | `fsa-handle-manager.ts:45-70` | `restoreHandle()` calls `showDirectoryPicker()` | P0 | INFECTED |
| FSA-003 | `handle-persistence.ts:97-116` | Stores `handleData: null` intentionally | P0 | INFECTED |
| FSA-004 | `handle-persistence.ts:190-207` | `trySilentRestore()` prompts user | P0 | INFECTED |
| FSA-005 | `permission-lifecycle.ts:46-61` | `deserializeHandle()` always returns null | P1 | INFECTED |
| FSA-006 | `storage-gateway-factory.ts:117-141` | Requires handle not available at call time | P1 | INFECTED |
| FSA-007 | `ProjectContext.tsx` | No handle in context interface | P1 | INFECTED |
| FSA-008 | `ide.$projectId.tsx:148-157` | Claims `useFileLoaderSlice` restores - doesn't exist | P1 | INFECTED |
| FSA-009 | Multiple files | 3 different handle managers | P1 | INFECTED |
| FSA-010 | `project-types.ts:39-41` | `lastKnownPermissionState` duplicates | P2 | INFECTED |

### Domain 2: State Management (12 Issues)

| ID | File | Issue | Severity | Status |
|----|------|-------|----------|--------|
| STATE-001 | `useProjectStore.ts:50-53` | No persistence, memory-only | P0 | INFECTED |
| STATE-002 | `useIDEStore.ts:65-71` | Hydrates "most recent" not "current" | P0 | INFECTED |
| STATE-003 | `workspace-store.ts:174-179` | localStorage leak, no project scope | P0 | INFECTED |
| STATE-004 | `file-sync-status-store-refactored.ts:76-77` | Global persist, no project scope | P1 | INFECTED |
| STATE-005 | `agent-selection-store.ts:43-56` | `activeAgentId` global, not per-project | P1 | INFECTED |
| STATE-006 | `useConversationStore.ts:381-404` | Module-level subscription leak | P1 | INFECTED |
| STATE-007 | `unified-chat-store.ts:338` | Global storage key | P1 | INFECTED |
| STATE-008 | `rag-store.ts:56-60` | Global `indexMetadata` | P1 | INFECTED |
| STATE-009 | `terminal-store.ts:304` | Uses localStorage, not Dexie | P2 | INFECTED |
| STATE-010 | `hydration-manager.ts:46-61` | Empty hydrate functions | P1 | INFECTED |
| STATE-011 | `project-crud-slice.ts:153` | Calls `persistHandle(null)` | P0 | INFECTED |
| STATE-012 | Multiple stores | No cleanup on workspace switch | P1 | INFECTED |

### Domain 3: Routing (13 Issues)

| ID | File | Issue | Severity | Status |
|----|------|-------|----------|--------|
| ROUTE-001 | `ide.tsx:37-44` | No `beforeLoad` platform guard | P0 | INFECTED |
| ROUTE-002 | `ide.tsx:89-101` | Uses `window.location` not Outlet | P1 | INFECTED |
| ROUTE-003 | `ide.$projectId.tsx:86-131` | Double fetch (beforeLoad + loader) | P1 | INFECTED |
| ROUTE-004 | `notes.$projectId.lazy.tsx:116-132` | useEffect instead of loader | P1 | INFECTED |
| ROUTE-005 | `workspace/$projectId.tsx:75-93` | No platform guard | P1 | INFECTED |
| ROUTE-006 | `HubHomePage.tsx:143-151` | Double-checks FSA + canAccessIDE | P1 | INFECTED |
| ROUTE-007 | `WorkspaceSwitcher.tsx:119-133` | No platform validation for IDE | P1 | INFECTED |
| ROUTE-008 | `ProjectContext.tsx:247-270` | Auto-switch to IDE on mobile | P2 | INFECTED |
| ROUTE-009 | `ProjectContext.tsx:295-320` | `switchWorkspace` no platform check | P2 | INFECTED |
| ROUTE-010 | `index.tsx` + `hub.tsx` | Duplicate routes for HubHomePage | P2 | INFECTED |
| ROUTE-011 | `study.lazy.tsx`, `knowledge.lazy.tsx` | IDE buttons without platform check | P2 | INFECTED |
| ROUTE-012 | Missing files | `knowledge.$projectId.tsx`, `study.$projectId.tsx` | P2 | INFECTED |
| ROUTE-013 | `notes.lazy.tsx:50-127` | Dynamic import in useEffect | P2 | INFECTED |

### Domain 4: Platform Contract (6 Issues)

| ID | File | Issue | Severity | Status |
|----|------|-------|----------|--------|
| PLAT-001 | `ide.tsx` | Temp project shown on desktop | P0 | INFECTED |
| PLAT-002 | `notes.lazy.tsx:43-46` | Hardcoded `browser-mode` only | P0 | INFECTED |
| PLAT-003 | `MainSidebar.tsx:161-168` | Navigation bypasses platform checks | P1 | INFECTED |
| PLAT-004 | Multiple routes | `getPlatformContract()` not called | P1 | INFECTED |
| PLAT-005 | `temp-project.ts:180-188` | `shouldUseTempProject()` logic inverted | P1 | INFECTED |
| PLAT-006 | Multiple stores | No platform-aware hydration | P2 | INFECTED |

---

## Dependency Graph

```
EPIC-CC-01/PS (Project Space Foundation) [P0 - IN PROGRESS]
├── EPIC-CC-02 (BYOK Cleanup) [COMPLETE]
├── EPIC-CC-03 (Chat Flow) [BLOCKED - depends on CC-01]
├── EPIC-CC-04 (Notes Refactoring) [BLOCKED - depends on CC-01]
└── ARC Phases (ADR-033 Remediation) [BLOCKED - depends on CC-01]

ARC Phase A: Identity & Routing [BLOCKED - depends on ARC-A01 getPlatformContract]
├── ARC-A01: getPlatformContract() service [P0 - START HERE]
├── ARC-A02: Route guards [P0 - depends on A01]
├── ARC-A04: Mobile→Notes redirect [P0 - depends on A01]
├── ARC-A05: Hub card click data contract [P0 - depends on A01]
└── ARC-A06: Post-creation redirect [P0 - depends on A02]

ARC Phase B: Storage Contract [BLOCKED - depends on A01]
├── ARC-B01: StorageGateway abstraction [P0 - depends on A01]
├── ARC-B02: FSAGateway adapter [P0 - depends on B01]
├── ARC-B03: IDBGateway adapter [P0 - depends on B01]
├── ARC-B05: FileSystemObserver [P0 - depends on B02]
└── ARC-B07 through B12 [Various dependencies]

ARC Phase C: State & Persistence [BLOCKED - depends on B01]
├── ARC-C01: Consolidate Project Store [P0]
├── ARC-C04: Persist-first pattern [P1 - depends on C01]
└── ARC-C06 through C10 [Various dependencies]

ARC Phase D: Entity Standardization [BLOCKED - depends on C01]
├── ARC-D01: Enforce ProjectId type [P1 - depends on C01]
├── ARC-D02: Fix fallback bugs [P1 - depends on D01]
└── ARC-D03: Rename bindings [P2 - depends on D01]

ARC Phase E: File Tree Cleanup [BLOCKED - depends on C02, B01]
├── ARC-E01: Delete .bak files [P0]
├── ARC-E02: Archive project-store [P1 - depends on C02]
├── ARC-E03: Archive filesystem duplicates [P1 - depends on B01]
└── ARC-E04: Update imports [P2 - depends on E02, E03]

Chrome 129 Detection [Standalone - can start immediately]
└── CC-07-01: Implement Chrome 129 detection [P0 - Critical for FSA handle storage]
```

---

## Sprint Planning

### Week 1: Foundation & Platform Detection

| Day | Focus | Stories |
|-----|-------|---------|
| 1 | getPlatformContract() | ARC-A01 |
| 2 | Route guards | ARC-A02 |
| 3 | Chrome 129 detection | CC-07-01 |
| 4 | Platform guards | ARC-A04, ARC-A05 |
| 5 | Redirect logic | ARC-A06 |

### Week 2: Storage Contract

| Day | Focus | Stories |
|-----|-------|---------|
| 1-2 | StorageGateway | ARC-B01 |
| 3-4 | FSAGateway adapter | ARC-B02 |
| 5 | IDBGateway adapter | ARC-B03 |

### Week 3-4: State & Entity

| Week | Focus | Stories |
|------|-------|---------|
| 3 | Project Store consolidation | ARC-C01, C02, C03 |
| 3 | State scoping | CC-08-01 through CC-08-04 |
| 4 | Entity standardization | ARC-D01, D02, D03 |
| 4 | File tree cleanup | ARC-E01 through E04 |

---

## Platform Guard Stories

> **[ADDED: 2026-01-22]** Platform guards for all routes

| Story ID | Route | Guard Type | Status |
|----------|-------|------------|--------|
| PG-01 | `/ide` | beforeLoad: canAccessIDE check | TODO |
| PG-02 | `/ide/$projectId` | beforeLoad: mobile redirect | TODO |
| PG-03 | `/notes` | No guard needed | N/A |
| PG-04 | `/notes/$projectId` | No guard needed | N/A |
| PG-05 | `/knowledge` | No guard needed | N/A |
| PG-06 | `/knowledge/$projectId` | No guard needed | N/A |
| PG-07 | `/study` | No guard needed | N/A |
| PG-08 | `/study/$projectId` | No guard needed | N/A |

---

## Chrome 129 Detection Story

> **[ADDED: 2026-01-22]** Chrome 129 structured clone support

### CC-07-01: Implement Chrome 129 detection

**Purpose:** Detect Chrome 129+ support for storing actual FileSystemDirectoryHandle in IndexedDB

**Changes:**
- Add `supportsStructuredClone()` detection in `handle-persistence.ts`
- Feature flag for conditional logic:
  - Chrome 129+: Store actual handle (uses structuredClone)
  - Older Chrome: Store metadata only (permission status)

**Acceptance:**
- [ ] Detects Chrome 129+ support
- [ ] Falls back gracefully for older versions
- [ ] Feature flag available for conditional logic

---

## waitForHydration() Function Story

> **[ADDED: 2026-01-22]** Route loading hydration wait utility

### CC-06-01: Create waitForHydration() function

**Purpose:** Event-driven hydration wait to prevent race conditions

**Changes:**
- Create `src/infrastructure/persistence/hydration-utils.ts`
- Implement event-driven wait (not time-based)
- Subscribe to Zustand store hydration state

**Acceptance:**
- [ ] Event-driven (not time-based)
- [ ] Subscribes to Zustand store
- [ ] Returns immediately if already hydrated

---

## State Scoping by [projectId+workspaceId]

> **[ADDED: 2026-01-22]** State isolation per project and workspace

### CC-08 Stories: State Scoping

| Story ID | Title | Acceptance |
|----------|-------|------------|
| CC-08-01 | Add project scope to IDE store | State scoped by [projectId+workspaceId] |
| CC-08-02 | Add project scope to workspace store | Uses Dexie, not localStorage |
| CC-08-03 | Use Dexie for workspace state | Direct Dexie queries, hot reactivity |
| CC-08-04 | Add cleanup on workspace switch | State resets on switch, no stale data |

---

## Route Standardization (Loader Only Pattern)

> **[ADDED: 2026-01-22]** Consistent TanStack Router patterns

### Standard Pattern:

```
// ✅ CORRECT: Loader-only pattern
route('$projectId', 'workspace', {
  loader: async ({ params, context }) => {
    await waitForHydration();
    const project = await db.projects.get(params.projectId);
    return { project };
  },
  beforeLoad: () => {
    if (!platform.canAccessIDE) redirect('/notes');
  },
  component: Workspace,
});

// ❌ INCORRECT: Double-fetch pattern
beforeLoad: async () => { fetch project... }
loader: async () => { fetch project again... }
```

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| **Total Epics** | 12 |
| **Total Stories** | 80+ |
| **Completed Stories** | 14 |
| **In Progress Stories** | 2 |
| **TODO Stories** | 64+ |
| **Infection Points (ADR-034)** | 31 |
| **Resolved Infections** | 0 |
| **Remaining Infections** | 31 |

---

**Document Version:** 2.2.0 (Working Copy)
**Last Updated:** 2026-01-22
**Author:** Team B Phase 1 Analyst
**Status:** WORKING COPY - FOR REVIEW

**Next Review:** 2026-01-29 (Weekly)
