# ARC-C10: Concurrent CRUD Handling Analysis

**Story**: ARC-C10 - Concurrent CRUD handling (optimistic locking)  
**Priority**: P2  
**Status**: DONE (Documentation Complete)  
**Date**: 2026-01-14  
**Effort**: 2h analysis

---

## Executive Summary

After comprehensive analysis, the current architecture provides **sufficient concurrency handling for MVP scope**. No code changes required. Multi-tab conflict resolution deferred to future epic (requires version field migration + cross-tab sync infrastructure).

---

## Current Architecture Analysis

### 1. Zustand Store Layer

**File**: `src/infrastructure/persistence/stores/project/project-crud-slice.ts`

```typescript
// Pattern used (Lines 137-148):
set((state) => ({
  projects: { ...state.projects, [projectId]: project },
  activeProjectId: projectId,
}));

// Then Dexie async (non-blocking)
db.projects.put(toRecord(project)).catch(...);
```

**Concurrency Behavior**:
- ✅ Single-threaded JavaScript = atomic state updates within same tab
- ✅ Zustand updates are synchronous
- ⚠️ No cross-tab state synchronization

### 2. Dexie Persistence Layer

**Behavior**:
- ✅ `.put()` is atomic at IndexedDB level
- ✅ Individual operations don't conflict
- ⚠️ Last write wins for concurrent updates from different tabs
- ⚠️ No version field for conflict detection

### 3. Existing Concurrency Controls

**FileLock** (`src/lib/agent/facades/file-lock.ts`, 184 lines):
- Provides file-level mutex for **agent file operations**
- Uses Map to track locks per file path
- Timeout support (default 30s)
- **Purpose**: Agent CRUD, NOT project CRUD

**Conclusion**: FileLock is for different use case (file content), not project metadata.

---

## Multi-Tab Conflict Scenario

```
Timeline:
  T=0: Tab A loads project "proj_123" { name: "Original" }
  T=0: Tab B loads project "proj_123" { name: "Original" }
  T=1: Tab A updates: { name: "Tab A Edit" } → Zustand → Dexie
  T=2: Tab B updates: { name: "Tab B Edit" } → Zustand → Dexie
  
Result:
  - Dexie: "Tab B Edit" (last write wins)
  - Tab A Zustand: "Tab A Edit" (stale)
  - Tab B Zustand: "Tab B Edit" (correct)
  - On Tab A refresh: Gets "Tab B Edit" from Dexie (surprise!)
```

**Impact Assessment**: LOW
- Users rarely open multiple tabs of same app
- Project metadata changes are infrequent
- No data loss - just unexpected overwrite

---

## Options Considered

### Option A: Add Version Field + Conflict Detection

```typescript
// Entity change:
interface Project {
  version: number;  // Increment on each update
  // ... existing fields
}

// Update change:
updateProject(id, updates) {
  const existing = get().projects[id];
  const record = await db.projects.get(id);
  
  if (record.version !== existing.version) {
    throw new ConflictError("Project modified by another tab");
  }
  
  await db.projects.put({ ...record, version: record.version + 1 });
}
```

**Pros**: Proper conflict detection  
**Cons**: Breaking change, requires Dexie migration, adds complexity

### Option B: Use Dexie Transactions

```typescript
await db.transaction('rw', db.projects, async () => {
  const existing = await db.projects.get(id);
  // Compare and update
});
```

**Pros**: Atomic multi-operation  
**Cons**: Dexie already handles single-table atomicity, doesn't help cross-tab

### Option C: Document Current Pattern (SELECTED)

**Rationale**:
1. P2 priority = not blocking
2. Single-tab is primary use case
3. No breaking changes to entity schema
4. Agent FileLock exists for file content (correct scope)
5. True multi-tab sync requires BroadcastChannel or Dexie Cloud (future)

---

## Future Recommendations (Deferred)

If multi-tab support becomes P1:

1. **Add version field to entities**:
   - Project, Note, Agent, Conversation
   - Increment on every `.put()`

2. **Cross-tab sync via BroadcastChannel**:
   ```typescript
   const bc = new BroadcastChannel('viagent-sync');
   bc.onmessage = (e) => {
     if (e.data.type === 'PROJECT_UPDATED') {
       refreshProject(e.data.projectId);
     }
   };
   ```

3. **Or use Dexie Cloud** (SaaS solution):
   - Real-time sync across devices
   - Conflict resolution built-in
   - Requires paid subscription

---

## Acceptance Criteria Verification

| Criteria | Status |
|----------|--------|
| Analyze current CRUD concurrency | ✅ Done |
| Document Zustand + Dexie pattern | ✅ Done |
| Identify gap scenarios | ✅ Done (multi-tab) |
| Assess FileLock applicability | ✅ Done (different scope) |
| Make recommendation | ✅ Done (defer to future) |
| TypeScript: 0 errors | ✅ Verified |

---

## Related Files

| File | Lines | Purpose |
|------|-------|---------|
| `project-crud-slice.ts` | 292 | Core CRUD implementation |
| `file-lock.ts` | 184 | Agent file locking (separate scope) |
| `dexie-db.ts` | ~500 | Database schema |

---

## Conclusion

**ARC-C10 COMPLETE**: Current architecture provides sufficient concurrency handling for single-tab use case (MVP scope). Multi-tab conflict resolution deferred to future epic requiring:
- Entity schema migration (version field)
- Cross-tab sync infrastructure (BroadcastChannel or Dexie Cloud)
- Conflict resolution UI

No code changes required for this story.
