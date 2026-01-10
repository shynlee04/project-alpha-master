# Root Cause Analysis: IDE & Notes Workspace Persistence Failure

**Date**: 2026-01-06
**Severity**: P0 CRITICAL
**Status**: Root Cause Identified

---

## Executive Summary

The workspace state persistence for both IDE and Notes workspaces is completely broken. After the recent Dexie persistence fix, the folder selector continues to appear after selecting a folder, and state never persists.

**Root Cause**: The custom `ide-state-storage.ts` adapter has a **circular dependency and timing issue** that prevents it from reading/writing state correctly.

---

## 1. What is Actually Broken (Root Cause Analysis)

### 1.1 Circular Dependency in Custom Storage Adapter

**File**: `src/infrastructure/persistence/stores/ide/ide-state-storage.ts`

The custom storage adapter uses a module-level reference to access the current `projectId`:

```typescript
// Line 29-36
let getIDEStoreState: (() => CombinedIDEState) | null = null;

export function setIDEStoreRef(getState: () => CombinedIDEState): void {
  getIDEStoreState = getState;
}
```

**Problem**: This reference is set AFTER the store is created:

```typescript
// In useIDEStore.ts (line 148-150)
export const useIDEStore = create<CombinedIDEState>()(
  persist(...)  // ← Storage adapter is used HERE
);

setIDEStoreRef(() => useIDEStore.getState());  // ← Reference set AFTER
```

**Timing Issue**:
1. Zustand's `persist` middleware IMMEDIATELY calls `storage.getItem()` during store creation
2. At this point, `getIDEStoreState` is still `null`
3. The adapter logs: `[IDEStateStorage] Store reference not set yet`
4. Returns `null` - no hydration happens
5. The store reference is set AFTER hydration has already failed

### 1.2 Wrong Data Structure Being Written

**File**: `src/infrastructure/persistence/stores/ide/ide-state-storage.ts` (line 110-122)

The custom adapter writes:

```typescript
const record: IDEStateRecord = {
  projectId,
  openFiles: state.openFiles ?? [],
  activeFile: state.activeFile ?? null,
  expandedPaths: Array.isArray(state.expandedPaths)
    ? Array.from(state.expandedPaths)
    : [],
  panelLayouts: state.panelLayouts ?? {},
  terminalTab: state.terminalTab ?? 'terminal',
  chatVisible: state.chatVisible ?? false,
  activeFileScrollTop: state.activeFileScrollTop,
  updatedAt: new Date(),
};

await db.ideState.put(record);
```

**Problem**: The `ideState` table schema is:

```typescript
// From dexie-db-migrations.ts line 87
ideState: 'projectId, updatedAt'
```

This means `projectId` is the **PRIMARY KEY**. The custom adapter is correctly using it as the key (line 125: `await db.ideState.put(record)`), but the real issue is:

### 1.3 Notes Workspace Sharing the Same Store

**File**: `src/routes/notes.$projectId.lazy.tsx` (line 36)

```typescript
const setProjectId = useIDEStore((s) => s.setProjectId);
```

**Problem**: Notes workspace is calling `setProjectId` on the **IDE store**. This means:

1. Both IDE and Notes routes try to set `projectId` in the same store
2. The custom adapter reads from `getIDEStoreState()` which now has Notes' `projectId`
3. When navigating from IDE to Notes, the `projectId` changes
4. The storage adapter tries to read/write state for the wrong project

### 1.4 Generic createDexieStorage Incompatible with ideState

**File**: `src/infrastructure/persistence/dexie-storage.ts` (line 113-208)

The generic `createDexieStorage()` function writes:

```typescript
await table.put({
  id: name,  // ← 'name' is the persist middleware's store name
  state: state,
  updatedAt: new Date()
});
```

**Problem**: The `ideState` table doesn't have an `id` field - it has `projectId` as the primary key.

The fix attempted to create a custom adapter, but introduced the circular dependency issue above.

---

## 2. Why the Previous Fix Didn't Work

The previous fix (2026-01-06) tried to solve the schema mismatch by creating a custom storage adapter (`ide-state-storage.ts`). However:

### 2.1 Timing Problem Not Addressed

The fix didn't account for Zustand's initialization order:

```
Store Creation → persist() → getItem() → getIDEStoreState is NULL → Returns null
                                                          ↓
                                              Reference set here (too late!)
```

### 2.2 Notes Workspace Collision

The fix didn't address that Notes workspace was also calling `setProjectId` on the same store, causing:

- IDE sets `projectId = "project-1"` → State persists for project-1
- User navigates to Notes
- Notes sets `projectId = "project-1"` → Storage adapter tries to read for project-1
- But the state structure is different (Notes vs IDE)
- Hydration fails or merges incompatible state

### 2.3 No Validation of Actual IndexedDB Operations

The fix added logging but didn't verify:

1. Are records actually being written to IndexedDB?
2. What does the browser DevTools show for the `ideState` table?
3. Is the `projectId` in the URL matching the `projectId` in the store?

---

## 3. What the Correct Fix Should Be

### 3.1 Option A: Use Generic PersistedState (Recommended)

Don't use the custom `ideState` table at all. Use the generic `persistedState` table that all other stores use:

```typescript
// In useIDEStore.ts
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';

export const useIDEStore = create<CombinedIDEState>()(
  persist(
    (set, get, api) => ({ ... }),
    {
      name: 'ide-state',  // ← This becomes the 'id' in persistedState table
      storage: createDexieStorage('providerConfigs'),  // ← Generic table
      partialize: (state) => ({ ... }),
      merge: (persisted, current) => ({ ... }),
    }
  )
);
```

**Advantages**:
- No circular dependency (generic adapter doesn't need store reference)
- No timing issues (generic adapter works immediately)
- Consistent with other stores (agentConfigs, providerConfigs, conversationState)

**Disadvantages**:
- Need to update `ideState` table migration to deprecate it
- Existing data in `ideState` table needs migration

### 3.2 Option B: Fix Custom Adapter with Lazy Store Access

If keeping the custom `ideState` table, fix the circular dependency:

```typescript
// In ide-state-storage.ts
getItem: async (_name: string): Promise<string | null> => {
  try {
    // DON'T use getIDEStoreState during initialization
    // Instead, read from URL to get current projectId
    const urlParams = new URLSearchParams(window.location.search);
    const pathSegments = window.location.pathname.split('/');
    const projectIdFromUrl = pathSegments[2]; // /ide/$projectId

    if (!projectIdFromUrl) {
      return null;
    }

    const record = await db.ideState.get(projectIdFromUrl);
    return record ? JSON.stringify(record) : null;
  } catch (error) {
    console.error('[IDEStateStorage] Failed to read state:', error);
    return null;
  }
},
```

**Advantages**:
- Uses `projectId` as intended
- No circular dependency
- Works immediately on store initialization

**Disadvantages**:
- Requires URL parsing logic
- Fragile if routing changes

### 3.3 Option C: Separate Stores for IDE and Notes

Create separate stores for IDE and Notes workspaces:

```typescript
// useIDEWorkspaceStore.ts - for IDE only
// useNotesWorkspaceStore.ts - for Notes only
```

Each store uses generic persistence:

```typescript
// IDE workspace
persist(
  (set) => ({ ... }),
  {
    name: 'ide-workspace-state',
    storage: createDexieStorage('providerConfigs'),
  }
)

// Notes workspace
persist(
  (set) => ({ ... }),
  {
    name: 'notes-workspace-state',
    storage: createDexieStorage('providerConfigs'),
  }
)
```

**Advantages**:
- Clean separation of concerns
- No shared state collision
- Simple generic persistence

**Disadvantages**:
- Duplicated code if workspaces share similar state
- Need to migrate existing code to use correct store

---

## 4. Recommended Implementation Plan

### Phase 1: Immediate Fix (P0)

1. **Switch to Generic Persistence** (Option A)
   - Replace `createIDEStateStorage()` with `createDexieStorage('providerConfigs')`
   - Update `useIDEStore` to use generic adapter
   - Test IDE workspace persistence

2. **Separate Notes State**
   - Create `useNotesWorkspaceStore` if Notes has different state needs
   - Or verify Notes can share the same store structure
   - Test Notes workspace persistence

3. **Add IndexedDB Validation**
   - Create E2E test that writes to IDE store, refreshes page, verifies state restored
   - Add browser console logging to verify IndexedDB writes
   - Check `via-gent-persistence` database in DevTools after operations

### Phase 2: Data Migration (P1)

1. **Migrate Existing ideState Data**
   - Create migration to copy data from `ideState` table to `persistedState` table
   - Format: `{ id: 'ide-state', state: { projectId: "...", ... }, updatedAt: ... }`

2. **Deprecate ideState Table**
   - Add migration to mark `ideState` table as deprecated
   - Update documentation to reflect generic persistence pattern

### Phase 3: Testing & Validation (P2)

1. **E2E Tests**
   - Test folder selection → state persist → page refresh → state restored
   - Test IDE → Notes navigation → state maintained per workspace
   - Test multiple projects → correct state per project

2. **Browser Testing**
   - Verify IndexedDB operations in DevTools
   - Check for quota exceeded errors
   - Verify no circular dependency warnings

---

## 5. Verification Commands

```bash
# Check TypeScript errors
pnpm typecheck

# Check for IDE store usage
grep -r "useIDEStore" src --include='*.tsx' | grep -v test

# Check for Notes store usage
grep -r "setProjectId" src/routes --include='*.tsx'

# Find all persist configurations
grep -r "createJSONStorage\|createDexieStorage" src --include='*.ts'
```

---

## 6. Related Files

- `src/infrastructure/persistence/stores/ide/useIDEStore.ts` - Main store (broken)
- `src/infrastructure/persistence/stores/ide/ide-state-storage.ts` - Custom adapter (broken)
- `src/infrastructure/persistence/dexie-storage.ts` - Generic adapter (working)
- `src/infrastructure/persistence/dexie-db-migrations.ts` - Schema definitions
- `src/routes/ide.$projectId.tsx` - IDE route (sets projectId)
- `src/routes/notes.$projectId.lazy.tsx` - Notes route (sets projectId)

---

## 7. Next Steps

1. **Choose Fix Approach**: Recommend Option A (generic persistence)
2. **Implement Fix**: Replace custom adapter with generic
3. **Test Persistence**: Verify state survives page refresh
4. **Test Navigation**: Verify IDE ↔ Notes navigation works
5. **Migrate Data**: Move existing ideState data to persistedState
6. **Deprecate Old Table**: Mark ideState table as deprecated

---

## Appendix: Browser Console Validation Steps

To validate the fix in browser:

```javascript
// 1. Check database exists
const db = await new Promise((resolve) => {
  const request = indexedDB.open('via-gent-persistence');
  request.onsuccess = () => resolve(request.result);
});

// 2. Check ideState table
const tx = db.transaction('ideState', 'readonly');
const store = tx.objectStore('ideState');
const allRecords = await store.getAll();
console.log('ideState records:', allRecords);

// 3. Check persistedState table (after fix)
const tx2 = db.transaction('providerConfigs', 'readonly');
const store2 = tx2.objectStore('providerConfigs');
const ideStateRecord = await store2.get('ide-state');
console.log('ide-state from providerConfigs:', ideStateRecord);

// 4. Check current store state
import { getIDEStoreState } from '@/infrastructure/persistence/stores/ide';
const currentState = getIDEStoreState();
console.log('Current IDE store state:', currentState);
```
