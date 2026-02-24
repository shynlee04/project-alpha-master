# Plan: Fix Dexie Persistence Layer - Workspace State

**Date**: 2026-01-06
**Status**: CRITICAL FOUNDATION FIX

---

## Problem

**Error**: `Failed to execute 'put' on 'IDBObjectStore': Evaluating the object store's key path did not yield a value.`

**Impact**:
- Folder selector keeps appearing after selecting folder
- State never persists across page reloads
- Affects BOTH IDE and Notes workspaces
- Complete breakage of workspace state persistence

**Root Cause**: Schema mismatch between `ideState` table definition and `createDexieStorage` adapter

---

## Technical Analysis

### Schema Definition (dexie-db-migrations.ts line 147)
```typescript
ideState: 'projectId, updatedAt',
```
This creates an IndexedDB object store with `projectId` as the **primary key**.

### Storage Adapter (dexie-storage.ts line 157)
```typescript
await table.put({
    id: name,        // ❌ 'id' property
    state: state,
    updatedAt: new Date()
});
```

### The Problem
1. `createDexieStorage('ideState')` tries to write `{ id, state, updatedAt }`
2. Table expects key path `projectId` but object has `id`
3. IndexedDB: "key path did not yield a value" → **SILENT FAILURE**
4. State never persists → folder selector reappears every time

### Why Generic Tables Work
Tables like `providerConfigs`, `agentConfigs`, `conversationState` use `'id, updatedAt'` schema → compatible with generic adapter.

---

## Step 1: Create Custom IDE State Storage Adapter

### File to Create
`src/infrastructure/persistence/stores/ide/ide-state-storage.ts`

### Implementation
Custom `StateStorage` adapter that:
1. Reads/writes `IDEStateRecord` structure (not generic `PersistedStateRecord`)
2. Uses `projectId` as key (not `id`)
3. Returns null when `projectId` is null (no state to persist)

### Code Template
```typescript
import type { StateStorage } from 'zustand/middleware';
import { db, type IDEStateRecord } from '@/infrastructure/persistence/dexie-db';

export function createIDEStateStorage(): StateStorage {
  return {
    getItem: async (name: string) => {
      // Get current projectId from store
      // If null, return null (no state to hydrate)
      // Otherwise, query ideState table by projectId
    },
    setItem: async (name: string, value: string) => {
      // Parse state, extract projectId
      // If null, do nothing (don't persist empty state)
      // Otherwise, write IDEStateRecord to ideState table
    },
    removeItem: async (name: string) => {
      // Delete current project's IDE state
    }
  };
}
```

---

## Step 2: Update useIDEStore.ts

### File to Modify
`src/infrastructure/persistence/stores/ide/useIDEStore.ts`

### Line to Change (Line 69)
```typescript
// BEFORE (BROKEN):
storage: createJSONStorage(() => createDexieStorage('ideState')),

// AFTER:
storage: createJSONStorage(() => createIDEStateStorage()),
```

### Import to Add (Line 25)
```typescript
import { createIDEStateStorage } from './ide-state-storage';
```

---

## Step 3: Same Fix for Notes Workspace

### Files to Modify
- `src/infrastructure/persistence/stores/notes/useNotesStore.ts` (if exists)
- Or create `notes-state-storage.ts` with same pattern

### Pattern
Same as IDE: custom adapter that uses proper table schema.

---

## Acceptance Criteria

- [ ] No IndexedDB errors in console
- [ ] Folder selection persists after page refresh
- [ ] Project ID remains set across sessions
- [ ] Open files, expanded paths persist
- [ ] Works in BOTH IDE and Notes workspaces

---

## Testing

1. Clear IndexedDB: DevTools → Application → IndexedDB → Delete database
2. Refresh page
3. Select folder in IDE
4. Refresh page again → folder should remain selected
5. Open files, expand folders
6. Refresh → state should be preserved

---

## STOP HERE

This is the foundation fix. After workspace state persistence works, we can address:
- Multi-project state isolation
- Empty state → project picker flow
- Workspace binding toggles
