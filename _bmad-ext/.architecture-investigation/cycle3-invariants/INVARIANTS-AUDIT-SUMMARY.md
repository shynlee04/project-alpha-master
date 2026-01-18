# Cycle 3: Invariants Auditor - Evidence Synthesis

**Generated**: 2026-01-18T14:30:00+07:00  
**Phase**: Invariants Auditor - Evidence Synthesis

---

## Executive Summary

This audit synthesizes findings from Cycles 1 & 2 to extract invariants, identify race conditions, non-idempotent writes, and missing rollback paths across three critical workflows:

1. **Workspace Switch** - 12-step transition workflow
2. **Sync Notes** - 11-step note synchronization workflow  
3. **Run Tool** - 20-step agent tool execution workflow

### Key Metrics

| Category | Count |
|----------|-------|
| Invariants Identified | 17 |
| Race Conditions | 6 |
| Non-Idempotent Writes | 4 |
| Missing Rollback Paths | 6 |
| Proposed Tests | 8 |

---

## Critical Findings

### 🔴 Critical: Event Listener Error Isolation

**Location**: `src/lib/events/cross-workspace-event-bus.ts`

Event listener errors are **not caught** - one throwing listener can crash the entire event bus, affecting all workspace transitions.

```typescript
// Current: No error handling
emitWorkspaceChanged(event: WorkspaceChangeEvent): void {
  console.log('[CrossWorkspaceEventBus] Workspace changed:', event);
  this.emit(CrossWorkspaceEventBus.EVENTS.WORKSPACE_CHANGED, event); // ← No try-catch
}
```

**Impact**: High - A single misbehaving listener can break all cross-workspace communication.

---

### 🔴 Critical: Dual Write Not Atomic

**Location**: `src/lib/filesystem/sync-manager/sync-manager.ts`

Dual write to Local FS and WebContainer is **not atomic** - partial failure leaves inconsistent state.

```typescript
// Current: No rollback on partial failure
async writeFile(path: string, content: string): Promise<void> {
  await this.localAdapter.writeFile(path, content);  // ← Succeeds
  await this.webcontainer.mount(tree);               // ← May fail
}
```

**Impact**: High - File exists in Local FS but not in WebContainer.

---

### 🟠 High: Workspace Transition Partial Failure

**Location**: `src/lib/workspace/workspace-transition-manager.ts`

If agent re-selection fails mid-transition, there's **no rollback path**.

```typescript
// Current: No rollback if agent re-selection fails
workspaceStore.setCurrentWorkspace(workspace);  // ← Updates state
const newAgent = this.findAvailableAgent(...);  // ← May return null
agentSelectionStore.setActiveAgent(...);        // ← May throw
```

**Impact**: High - Workspace updated but agent not selected.

---

### 🟠 High: Batch Operation Rollback Incomplete

**Location**: `src/lib/agent/facades/file-tools-impl.ts`

Rollback only deletes files - **doesn't restore original content** if files existed before.

```typescript
// Current: Only deletes, doesn't restore
for (const filePath of writtenFiles) {
  await this.syncManager.deleteFile(filePath);  // ← Creates empty file
}
```

**Impact**: High - Pre-existing files are lost, replaced with empty files.

---

## Race Conditions

| # | Location | Description | Likelihood | Impact | Fix |
|---|----------|-------------|------------|--------|-----|
| 1 | `workspace-transition-manager.ts` | Concurrent switches can corrupt state | Medium | High | Add mutex/Promise queue |
| 2 | `cross-workspace-event-bus.ts` | Throwing listener crashes event bus | Medium | High | Try-catch per listener |
| 3 | `sync-manager.ts` | Dual write not atomic | Medium | High | Two-phase commit |
| 4 | `workspace-store.ts` | setTimeout not cancelable | Low | Medium | clearTimeout in startTransition |
| 5 | `note-sync-slice.ts` | Debounce timers not cleaned on unload | Low | Low | Add unload listener |
| 6 | `file-tools-impl.ts` | Concurrent batch operations can interleave | Low | Medium | Global mutex for batches |

---

## Non-Idempotent Writes

| # | Location | Function | Issue | Fix |
|---|----------|----------|-------|-----|
| 1 | `workspace-store.ts` | `setCurrentWorkspace` | Multiple calls with same value still emit events | Early return if unchanged |
| 2 | `note-sync-slice.ts` | `triggerAutoSave` | Rapid keystrokes create multiple saves | Track pending state |
| 3 | `cross-workspace-event-bus.ts` | `emitWorkspaceChanged` | Duplicate events for same transition | Deduplicate within window |
| 4 | `sync-engine-core.ts` | `sync` | Concurrent calls throw error | Queue subsequent requests |

---

## Missing Rollback Paths

| # | Location | Operation | Missing Compensation |
|---|----------|-----------|---------------------|
| 1 | `workspace-transition-manager.ts` | Partial transition failure | Revert workspaceStore to previous value |
| 2 | `sync-manager.ts` | Local FS succeeds, WebContainer fails | Delete Local FS file or mark inconsistent |
| 3 | `sync-manager.ts` | Local FS delete succeeds, WebContainer fails | Re-create file in WebContainer |
| 4 | `file-tools-impl.ts` | writeMultiple rollback | Restore pre-existing files, not just delete |
| 5 | `file-tools-impl.ts` | deleteMultiple rollback | Restore original content, not create empty |
| 6 | `workspace-store.ts` | Event listener failure after state update | Catch and log listener errors |

---

## Proposed Tests

| # | Test Name | Description | Would Fail Today |
|---|-----------|-------------|------------------|
| 1 | `test_workspace_switch_concurrent` | Simultaneous switches serialized | ✅ Yes |
| 2 | `test_workspace_switch_partial_failure` | Revert on mid-transition failure | ✅ Yes |
| 3 | `test_event_listener_error_isolation` | Throwing listener doesn't crash bus | ✅ Yes |
| 4 | `test_dual_write_rollback` | Rollback Local FS on WebContainer failure | ✅ Yes |
| 5 | `test_batch_write_rollback_comprehensive` | Restore pre-existing files on rollback | ✅ Yes |
| 6 | `test_sync_idempotency` | Multiple sync calls don't throw | ✅ Yes |
| 7 | `test_transition_timeout_cleanup` | Rapid switches don't leave stale timeouts | ✅ Yes |
| 8 | `test_note_idempotent_save` | Multiple saves work correctly | ❌ No |

---

## Recommendations (Priority Order)

1. **Priority 1**: Wrap event listener calls in try-catch for error isolation
2. **Priority 2**: Implement two-phase dual-write pattern with rollback
3. **Priority 3**: Add transaction-like semantics to workspace transitions
4. **Priority 4**: Enhance batch operation rollback to preserve pre-existing state
5. **Priority 5**: Add global mutex for concurrent batch operations

---

## Invariant Summary by Workflow

### Workspace Switch (8 invariants)

**Pre-conditions**:
- ✅ Project must be loaded
- ✅ Target workspace must be enabled
- ✅ At least one agent available
- ✅ No concurrent transitions
- ✅ Store hydration complete
- ✅ Dexie DB open

**Invariants**:
- ✅ isTransitioning flag cleared after completion
- ✅ currentWorkspace matches target

### Sync Notes (4 invariants)

**Pre-conditions**:
- ✅ Note ID constant throughout lifecycle
- ✅ Dexie operations atomic per record
- ✅ FSA sync is optional/non-blocking

**Invariants**:
- ✅ IndexedDB always has most recent data

### Run Tool (5 invariants)

**Pre-conditions**:
- ✅ ToolPermissionManager singleton initialized
- ✅ WebContainer booted for terminal tools
- ✅ File locks released even on error

**Invariants**:
- ✅ Permission checks before execution
- ✅ Execution logged to IndexedDB

---

## Files Analyzed

| File | Key Findings |
|------|--------------|
| `src/lib/workspace/workspace-transition-manager.ts` | Race condition, missing rollback |
| `src/infrastructure/persistence/stores/workspace/workspace-store.ts` | Non-idempotent, missing rollback |
| `src/lib/notes/slices/note-sync-slice.ts` | Non-idempotent, debounce cleanup |
| `src/lib/agent/facades/file-tools-impl.ts` | Incomplete rollback |
| `src/lib/events/cross-workspace-event-bus.ts` | No error isolation |
| `src/infrastructure/sync/core/sync-engine-core.ts` | Non-idempotent sync |
| `src/lib/filesystem/sync-manager/sync-manager.ts` | Non-atomic dual write |

---

*Generated by Cycle 3: Invariants Auditor*
*Input: Cycles 1 & 2 artifacts*
*Output: `_bmad-ext/.architecture-investigation/cycle3-invariants/`*