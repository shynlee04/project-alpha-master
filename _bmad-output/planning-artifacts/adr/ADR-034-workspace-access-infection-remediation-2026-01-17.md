# ADR-034: Workspace Access Infection Remediation

**Date**: 2026-01-11
**Status**: APPROVED - IMMEDIATE EXECUTION REQUIRED
**Decision Makers**: User + BMAD Master Orchestrator
**Supersedes**: None (Extends ADR-033)
**Parent ADR**: ADR-033 (Correct-Course Architectural Remediation)
**Priority**: P0 - BLOCKING USER WORKFLOWS

---

## Executive Summary

Deep-scan investigation identified **31 infection points** across 4 domains that collectively prevent basic workspace access:
1. **FSA Handle Persistence**: 10 critical issues - handles not stored, restored, or passed correctly
2. **State Management**: 12 critical issues - stores leak data, lose state, race on hydration
3. **Routing**: 13 issues - guards reject valid navigation, inconsistent loader patterns
4. **Platform Contract**: 6 issues - missing checks allow invalid access paths

**This ADR defines a SINGLE MASTER PLAN** (not separate stories) to remediate all issues in coordinated phases. Each issue is tracked in the Infection Registry below.

---

## Context

### User-Reported Symptoms

1. Desktop shows "temp project" option (should NOT exist per ADR-033)
2. Select folder → bounces to Notes (wrong navigation)
3. Notes can't create new project (only browser-mode)
4. Desktop still shows "browser DB" choice (ADR-033 violation)
5. IDE files not loading, Monaco blank (FSA handle lost)
6. Terminal loading forever (WebContainer not booting)
7. Getting kicked out randomly (route guards)
8. Editing bounces to browser DB (storageType not respected)
9. No code syntax highlighting (BlockNote config)

### Root Cause Analysis

All symptoms trace to **3 foundational failures**:

1. **FSA Handle Lifecycle Broken**
   - Handles stored as `null` intentionally
   - "Restore" calls `showDirectoryPicker()` (prompts user)
   - No Chrome 129+ structured clone implementation
   - Multiple conflicting sources of truth

2. **State Not Project-Scoped**
   - Stores persist globally, not per `[projectId+workspaceId]`
   - IDE hydrates "most recent" project, ignoring URL params
   - Workspace state leaks via localStorage

3. **Route Guards Reject Valid Navigations**
   - Project not in store when guard runs (race condition)
   - Retry logic insufficient (3 attempts, 50-200ms)
   - Double-fetch in beforeLoad + loader

---

## Decisions (Extending ADR-033)

### D10: FSA Handle Storage Strategy

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Handle Storage Location** | Single source: `db.fsaHandles` via `HandlePersistenceService` | Eliminate multiple implementations |
| **Handle Serialization** | Store actual handle in Chrome 129+, metadata-only in older | Feature-detect structured clone support |
| **Restore Strategy** | Silent grant from stored handle, prompt ONLY if truly unavailable | Chrome 122+ persistent permission |
| **Handle Provider** | `ProjectContext` provides handle to all children | Single restoration point |

### D11: State Scoping Strategy

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Store Key Pattern** | All stores use `[projectId+workspaceId]` composite key | ADR-033 D6 compliance |
| **IDE State Hydration** | Hydrate for current `projectId` from URL, not "most recent" | Match route params |
| **Workspace Isolation** | Stores reset/scope-change on workspace switch | No cross-contamination |
| **Global State** | ONLY theme, locale, sidebar collapse - NOTHING workspace-specific | Minimal global state |

### D12: Route Loading Strategy

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Project Loading** | Use `loader` only, NOT `beforeLoad` for data fetch | TanStack Router pattern |
| **beforeLoad Purpose** | Platform guards ONLY (redirect mobile from IDE) | Separation of concerns |
| **Retry Strategy** | Event-driven: wait for store hydration, not time-based retry | Reliable, not racey |
| **Non-Lazy Routes** | ALL project routes have non-lazy file with loader | Consistent pattern |

### D13: Platform Guard Distribution

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Guard Location** | `beforeLoad` in route file | Router-level enforcement |
| **Fallback** | `WorkspaceSwitcher`, `ProjectContext` also check | Defense in depth |
| **UI Hiding** | Hide IDE buttons/options on mobile | UX consistency |
| **Error State** | Show message, not silent redirect | User understands why |

---

## Infection Registry

### Domain 1: FSA Handle Persistence (10 Issues)

| ID | File | Issue | Severity | ADR-033 Violation | Status |
|----|------|-------|----------|-------------------|--------|
| FSA-001 | `fsa-handle-manager.ts:26-36` | Stores `handle as any` - throws DataCloneError | P0 | D2 | INFECTED |
| FSA-002 | `fsa-handle-manager.ts:45-70` | `restoreHandle()` calls `showDirectoryPicker()` | P0 | D2, D3 | INFECTED |
| FSA-003 | `handle-persistence.ts:97-116` | Stores `handleData: null` intentionally | P0 | D2 | INFECTED |
| FSA-004 | `handle-persistence.ts:190-207` | `trySilentRestore()` prompts user | P0 | D3 | INFECTED |
| FSA-005 | `permission-lifecycle.ts:46-61` | `deserializeHandle()` always returns null | P1 | D2 | INFECTED |
| FSA-006 | `storage-gateway-factory.ts:117-141` | Requires handle not available at call time | P1 | - | INFECTED |
| FSA-007 | `ProjectContext.tsx` | No handle in context interface | P1 | - | INFECTED |
| FSA-008 | `ide.$projectId.tsx:148-157` | Claims `useFileLoaderSlice` restores - doesn't exist | P1 | - | INFECTED |
| FSA-009 | Multiple files | 3 different handle managers | P1 | - | INFECTED |
| FSA-010 | `project-types.ts:39-41` | `lastKnownPermissionState` duplicates `fsaHandles.permissionStatus` | P2 | - | INFECTED |

### Domain 2: State Management (12 Issues)

| ID | File | Issue | Severity | ADR-033 Violation | Status |
|----|------|-------|----------|-------------------|--------|
| STATE-001 | `useProjectStore.ts:50-53` | No persistence, memory-only | P0 | - | INFECTED |
| STATE-002 | `useIDEStore.ts:65-71` | Hydrates "most recent" not "current" | P0 | D6 | INFECTED |
| STATE-003 | `workspace-store.ts:174-179` | localStorage leak, no project scope | P0 | D6 | INFECTED |
| STATE-004 | `file-sync-status-store-refactored.ts:76-77` | Global persist, no project scope | P1 | D6 | INFECTED |
| STATE-005 | `agent-selection-store.ts:43-56` | `activeAgentId` global, not per-project | P1 | - | INFECTED |
| STATE-006 | `useConversationStore.ts:381-404` | Module-level subscription leak | P1 | - | INFECTED |
| STATE-007 | `unified-chat-store.ts:338` | Global storage key | P1 | D6 | INFECTED |
| STATE-008 | `rag-store.ts:56-60` | Global `indexMetadata` | P1 | D6 | INFECTED |
| STATE-009 | `terminal-store.ts:304` | Uses localStorage, not Dexie | P2 | - | INFECTED |
| STATE-010 | `hydration-manager.ts:46-61` | Empty hydrate functions | P1 | - | INFECTED |
| STATE-011 | `project-crud-slice.ts:153` | Calls `persistHandle(null)` | P0 | D2 | INFECTED |
| STATE-012 | Multiple stores | No cleanup on workspace switch | P1 | - | INFECTED |

### Domain 3: Routing (13 Issues)

| ID | File | Issue | Severity | ADR-033 Violation | Status |
|----|------|-------|----------|-------------------|--------|
| ROUTE-001 | `ide.tsx:37-44` | No `beforeLoad` platform guard | P0 | D1 | INFECTED |
| ROUTE-002 | `ide.tsx:89-101` | Uses `window.location` not Outlet | P1 | - | INFECTED |
| ROUTE-003 | `ide.$projectId.tsx:86-131` | Double fetch (beforeLoad + loader) | P1 | - | INFECTED |
| ROUTE-004 | `notes.$projectId.lazy.tsx:116-132` | useEffect instead of loader | P1 | - | INFECTED |
| ROUTE-005 | `workspace/$projectId.tsx:75-93` | No platform guard | P1 | D1 | INFECTED |
| ROUTE-006 | `HubHomePage.tsx:143-151` | Double-checks FSA + canAccessIDE | P1 | D1 | INFECTED |
| ROUTE-007 | `WorkspaceSwitcher.tsx:119-133` | No platform validation for IDE | P1 | D1 | INFECTED |
| ROUTE-008 | `ProjectContext.tsx:247-270` | Auto-switch to IDE on mobile | P2 | D1 | INFECTED |
| ROUTE-009 | `ProjectContext.tsx:295-320` | `switchWorkspace` no platform check | P2 | D1 | INFECTED |
| ROUTE-010 | `index.tsx` + `hub.tsx` | Duplicate routes for HubHomePage | P2 | - | INFECTED |
| ROUTE-011 | `study.lazy.tsx`, `knowledge.lazy.tsx` | IDE buttons without platform check | P2 | D1 | INFECTED |
| ROUTE-012 | Missing files | `knowledge.$projectId.tsx`, `study.$projectId.tsx` don't exist | P2 | - | INFECTED |
| ROUTE-013 | `notes.lazy.tsx:50-127` | Dynamic import in useEffect | P2 | - | INFECTED |

### Domain 4: Platform Contract (6 Issues)

| ID | File | Issue | Severity | ADR-033 Violation | Status |
|----|------|-------|----------|-------------------|--------|
| PLAT-001 | `ide.tsx` | Temp project shown on desktop | P0 | D1, D5 | INFECTED |
| PLAT-002 | `notes.lazy.tsx:43-46` | Hardcoded `browser-mode` only | P0 | D5 | INFECTED |
| PLAT-003 | `MainSidebar.tsx:161-168` | Navigation bypasses platform checks | P1 | D1 | INFECTED |
| PLAT-004 | Multiple routes | `getPlatformContract()` not called | P1 | D1 | INFECTED |
| PLAT-005 | `temp-project.ts:180-188` | `shouldUseTempProject()` logic inverted | P1 | D1 | INFECTED |
| PLAT-006 | Multiple stores | No platform-aware hydration | P2 | - | INFECTED |

---

## Master Remediation Plan

### Phase 0: Diagnostic Lock-In (30 min)

**Purpose**: Ensure we don't lose context during remediation

| Task | Owner | Deliverable |
|------|-------|-------------|
| Create this ADR | Done | ADR-034 |
| Update bmm-workflow-status.yaml | Agent | Current state locked |
| Create LOOP_STATE checkpoint | Agent | Session snapshot |

### Phase 1: FSA Handle Unification (4 hours)

**Purpose**: Single source of truth for FSA handles

| Task | ID | File Changes | Acceptance |
|------|----|--------------|------------|
| Delete `fsa-handle-manager.ts` | FSA-009 | Delete file | No duplicate managers |
| Delete FSA code from `permission-lifecycle.ts` | FSA-005 | Remove functions | Single source |
| Implement Chrome 129 detection | FSA-001 | `handle-persistence.ts` | Feature flag |
| Store actual handle when supported | FSA-003 | `persistHandle()` | Handle in IndexedDB |
| Implement true silent restore | FSA-002, FSA-004 | `restoreHandle()` | No user prompt |
| Add handle to `ProjectContext` | FSA-007 | `ProjectContext.tsx` | Handle available to children |
| Update `StorageGatewayFactory` | FSA-006 | Get handle from context | Factory uses context handle |

**Test**: Create project, refresh, navigate to IDE - files load without prompt

### Phase 2: State Scoping (3 hours)

**Purpose**: All state scoped by `[projectId+workspaceId]`

| Task | ID | File Changes | Acceptance |
|------|----|--------------|------------|
| Add project scope to IDE store hydration | STATE-002 | `useIDEStore.ts` | Hydrates current project |
| Add project scope to workspace store | STATE-003 | `workspace-store.ts` | Dexie, not localStorage |
| Add project scope to chat store | STATE-007 | `unified-chat-store.ts` | Per-project conversations |
| Add project scope to RAG store | STATE-008 | `rag-store.ts` | Per-project index |
| Add project scope to agent selection | STATE-005 | `agent-selection-store.ts` | Per-project agents |
| Add workspace cleanup on switch | STATE-012 | All stores | `onWorkspaceChange()` |
| Implement HydrationManager properly | STATE-010 | `hydration-manager.ts` | Coordinated hydration |

**Test**: Open project A, open project B in new tab, verify isolation

### Phase 3: Route Standardization (2 hours)

**Purpose**: Consistent TanStack Router patterns

| Task | ID | File Changes | Acceptance |
|------|----|--------------|------------|
| Add platform guard to `ide.tsx` | ROUTE-001 | beforeLoad | Mobile blocked |
| Remove double-fetch pattern | ROUTE-003 | `ide.$projectId.tsx` | Loader only |
| Create non-lazy route files | ROUTE-012 | `knowledge.$projectId.tsx`, `study.$projectId.tsx` | Consistent pattern |
| Convert useEffect to loader | ROUTE-004 | `notes.$projectId.lazy.tsx` | Use route data |
| Add platform guard to legacy routes | ROUTE-005 | `workspace/$projectId.tsx` | Consistent |
| Use Outlet pattern | ROUTE-002 | `ide.tsx` | TanStack Router compliant |

**Test**: Navigate between all workspaces on desktop and mobile

### Phase 4: Platform Contract Enforcement (1 hour)

**Purpose**: Platform checks everywhere

| Task | ID | File Changes | Acceptance |
|------|----|--------------|------------|
| Remove temp project from desktop | PLAT-001 | `ide.tsx` | FSA only |
| Add project picker to Notes | PLAT-002 | `notes.lazy.tsx` | Can create projects |
| Add platform check to sidebar | PLAT-003 | `MainSidebar.tsx` | IDE hidden on mobile |
| Add platform check to switcher | ROUTE-007 | `WorkspaceSwitcher.tsx` | IDE filtered on mobile |
| Fix Hub navigation | ROUTE-006 | `HubHomePage.tsx` | Check `canAccessIDE` only |
| Hide IDE buttons on mobile | ROUTE-011 | `study.lazy.tsx`, `knowledge.lazy.tsx` | Buttons hidden |

**Test**: Mobile cannot see or access IDE anywhere

### Phase 5: Verification (1 hour)

| Check | Command | Expected |
|-------|---------|----------|
| TypeScript | `pnpm tsc --noEmit` | 0 errors |
| Unit Tests | `pnpm vitest run` | All pass |
| Desktop IDE | Manual | Files load without prompt |
| Mobile Notes | Manual | Works, no IDE access |
| Project Switch | Manual | State isolated |
| Page Refresh | Manual | Handle restored silently |

---

## File Change Registry

### Files to CREATE

| Path | Reason |
|------|--------|
| `src/routes/knowledge.$projectId.tsx` | Non-lazy route with loader |
| `src/routes/study.$projectId.tsx` | Non-lazy route with loader |

### Files to DELETE

| Path | Reason | Archive To |
|------|--------|------------|
| `src/lib/filesystem/fsa-handle-manager.ts` | Duplicate | `_bmad-ext/.archive/` |

### Files to MODIFY (Major)

| Path | Changes |
|------|---------|
| `src/infrastructure/filesystem/handle-persistence.ts` | Chrome 129 detection, actual handle storage, silent restore |
| `src/lib/workspace/ProjectContext.tsx` | Add handle to context, platform checks |
| `src/routes/ide.tsx` | Add beforeLoad guard, remove temp project, use Outlet |
| `src/routes/ide.$projectId.tsx` | Remove double-fetch, use loader only |
| `src/routes/notes.lazy.tsx` | Add project picker for desktop |
| `src/infrastructure/persistence/stores/ide/useIDEStore.ts` | Project-scoped hydration |
| `src/infrastructure/persistence/stores/workspace/workspace-store.ts` | Dexie persistence, project scope |

### Files to MODIFY (Minor)

| Path | Changes |
|------|---------|
| `src/routes/workspace/$projectId.tsx` | Add platform guard |
| `src/routes/notes.$projectId.lazy.tsx` | Use loader data |
| `src/presentation/components/layout/MainSidebar.tsx` | Platform check |
| `src/presentation/components/common/WorkspaceSwitcher.tsx` | Platform check |
| `src/presentation/components/hub/HubHomePage.tsx` | Fix canAccessIDE check |
| `src/routes/study.lazy.tsx` | Hide IDE button on mobile |
| `src/routes/knowledge.lazy.tsx` | Hide IDE button on mobile |

---

## Traceability Matrix

### ADR-033 Stories Affected

| ADR-033 Story | ADR-034 Infection IDs | Status |
|---------------|----------------------|--------|
| ARC-A01 | PLAT-001, PLAT-004 | BLOCKED - Implementation gaps |
| ARC-A02 | ROUTE-001, ROUTE-005, ROUTE-007 | BLOCKED - Guards incomplete |
| ARC-A04 | ROUTE-001 | BLOCKED - No guard |
| ARC-B01 | FSA-006 | BLOCKED - Factory needs context |
| ARC-B02 | FSA-001, FSA-002, FSA-003, FSA-004 | BLOCKED - Handle not stored |
| ARC-C04 | STATE-001 thru STATE-012 | BLOCKED - Persist pattern broken |

### New Story Requirements

This ADR does NOT create new stories. It defines a **unified remediation phase** that unblocks ADR-033 stories.

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Breaking existing FSA projects | HIGH | Backup `db.fsaHandles` before changes |
| State migration failures | HIGH | Version check, migration script |
| Chrome version fragmentation | MEDIUM | Feature detection, graceful fallback |
| Route changes break bookmarks | LOW | Redirect from old routes |

---

## Success Criteria

- [ ] Desktop IDE: Create project → navigate away → navigate back → files load WITHOUT picker prompt
- [ ] Desktop Notes: Can create new project (not only browser-mode)
- [ ] Mobile: Cannot access IDE via any path (sidebar, switcher, direct URL)
- [ ] Project switch: State fully isolated, no data leakage
- [ ] Page refresh: Silently restores access (Chrome 122+)
- [ ] TypeScript: 0 errors
- [ ] All original user symptoms resolved

---

## Execution Authorization

**This ADR authorizes immediate execution of the Master Remediation Plan.**

Execution will proceed as a single coordinated operation, not as separate sprinted stories. Progress tracked in `_bmad-ext/state/LOOP_STATE.yaml`.

---

## Appendix: Chrome 129 Handle Storage

```typescript
// Feature detection for structured clone of FileSystemDirectoryHandle
async function canStoreHandleInIndexedDB(): Promise<boolean> {
  if (typeof indexedDB === 'undefined') return false;
  
  try {
    // Create test database
    const testDb = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open('__fsa_test__', 1);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
      req.onupgradeneeded = () => {
        req.result.createObjectStore('test');
      };
    });
    
    // Try to get a temp directory handle
    const handle = await navigator.storage.getDirectory();
    
    // Try to store it
    const tx = testDb.transaction('test', 'readwrite');
    const store = tx.objectStore('test');
    await new Promise<void>((resolve, reject) => {
      const req = store.put(handle, 'test');
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve();
    });
    
    // Cleanup
    testDb.close();
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('__fsa_test__');
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
    
    return true;
  } catch {
    return false;
  }
}
```

---

**Document Owner**: BMAD Master Orchestrator
**Created**: 2026-01-17T10:00:00+07:00
**Status**: APPROVED - IMMEDIATE EXECUTION
**Parent**: ADR-033
**Infection Count**: 31 (10 FSA + 12 State + 6 Route + 3 Platform)
