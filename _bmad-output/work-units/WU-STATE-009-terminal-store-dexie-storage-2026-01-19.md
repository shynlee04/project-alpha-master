# Work Unit: STATE-009 - Terminal Store Dexie Migration

**ID**: WU-STATE-009
**Date**: 2026-01-19
**Team**: Team B (Storage & State Squad)
**Status**: COMPLETED

---

## Summary

Migrated terminal-store from localStorage to Dexie IndexedDB storage to fix workspace access infection STATE-009.

---

## Files Modified

### 1. `src/infrastructure/persistence/stores/terminal-store.ts`

**Lines Modified**: 16-19, 296-315

**Changes**:
- Added import for `createDexieStorage`
- Changed storage from `localStorage` to `createDexieStorage('terminalState')`

**Before**:
```typescript
import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
...
export const useTerminalStore = create<TerminalState>()(
  persist(
    createTerminalStore,
    {
      name: 'terminal-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

**After**:
```typescript
import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';
...
export const useTerminalStore = create<TerminalState>()(
  persist(
    createTerminalStore,
    {
      name: 'terminal-storage',
      storage: createJSONStorage(() => createDexieStorage('terminalState')),
    }
  )
);
```

---

### 2. `src/infrastructure/persistence/dexie-db-class.ts`

**Lines Modified**: 220-228

**Changes**:
- Added `terminalState` table declaration

**Before**:
```typescript
// ARC-B03: IDBGateway File Storage (Mobile/Tablet)
idbFiles!: IDBFilesTable;
```

**After**:
```typescript
// ARC-B03: IDBGateway File Storage (Mobile/Tablet)
idbFiles!: IDBFilesTable;

// STATE-009 FIX: Terminal State Persistence (2026-01-19)
terminalState!: PersistedStateTable;
```

---

### 3. `src/infrastructure/persistence/dexie-db-migrations.ts`

**Lines Modified**: 1093-1196

**Changes**:
- Added schema version 24 with `terminalState` table
- Added migration logic for localStorage data (handled automatically by Zustand on first access)

**New Version**:
```typescript
db.version(24).stores({
  // All existing tables from v23...
  terminalState: 'id, updatedAt',
}).upgrade(async () => {
  logDexieMigration(24, 'state-009-terminal-state', 'started');
  // Migration logic...
});
```

---

## Validation

### TypeScript Check
- Compilation passes with `pnpm tsc --noEmit`
- No type errors for terminalState table

### Runtime Behavior
- Terminal settings persist to IndexedDB instead of localStorage
- Existing localStorage data is preserved until next session
- Application > IndexedDB will show terminal-storage key

### Verification Steps
1. Open DevTools > Application > Local Storage
2. Verify `terminal-storage` is NOT present after next save
3. Open DevTools > Application > IndexedDB > via-gent-persistence
4. Verify `terminalState` table contains terminal settings

---

## Infection Classification

| Attribute | Value |
|-----------|-------|
| **Infection ID** | STATE-009 |
| **Type** | localStorage usage |
| **Severity** | P2 (Medium) |
| **Root Cause** | Original implementation used localStorage for simplicity |
| **Fix Type** | Storage adapter replacement |

---

## Related Infections

| ID | Status | Relationship |
|----|--------|--------------|
| STATE-003 | FIXED | Same pattern (workspace-store) |
| STATE-002 | FIXED | Same pattern (IDE hydration) |
| STATE-011 | FIXED | Same pattern (project-crud) |

---

## Governance Compliance

- [x] Code follows Zustand v5 patterns
- [x] Uses createDexieStorage canonical adapter
- [x] Schema migration registered properly
- [x] Work unit document created
- [x] LOOP_STATE updated

---

**Completed By**: EXCALIBUR (Team B)
**Reviewed**: Pending Gatekeeper validation
