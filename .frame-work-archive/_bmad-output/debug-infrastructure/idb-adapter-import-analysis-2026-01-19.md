# IDBAdapter Import Path Analysis Report

**Date:** 2026-01-19  
**Author:** analyst-ext  
**Status:** COMPLETE

---

## 1. Executive Summary

### ⚠️ CRITICAL FINDING: INCORRECT IMPORT

The `StorageAdapterFactory` is importing `IDBAdapter` from the **WRONG** location:

```typescript
// WRONG - Using legacy sync adapter
import { IDBAdapter } from '@/infrastructure/sync/adapters/idb-adapter-core';
```

**This is a significant architectural issue that causes:**

1. **Data Fragmentation**: Two separate IndexedDB databases storing the same files
2. **CPU Drain**: Duplicate storage systems compete for resources
3. **State Corruption**: Files written through one system not visible to the other
4. **Memory Leaks**: Both databases remain open, consuming memory

### Root Cause

The `StorageAdapterFactory` (`src/infrastructure/filesystem/StorageAdapterFactory.ts`) was likely created during the ARC-B01 effort but incorrectly imports from the **legacy sync adapters** instead of using the **new storage gateway architecture**.

---

## 2. Import Path Analysis

### Current Import (INCORRECT)

| Property | Value |
|----------|-------|
| **File** | `src/infrastructure/filesystem/StorageAdapterFactory.ts` |
| **Line** | 31 |
| **Import** | `import { IDBAdapter } from '@/infrastructure/sync/adapters/idb-adapter-core';` |

### Two Parallel IndexedDB Implementations Found

#### System A: Legacy Sync Adapters (WRONG for filesystem)

| Property | Value |
|----------|-------|
| **Location** | `@/infrastructure/sync/adapters/idb-adapter-core.ts` |
| **Class** | `IDBAdapter` |
| **Factory** | `@/infrastructure/sync/adapters/adapter-factory.ts` |
| **Database** | `via-gent-persistence` |
| **Table** | `syncFileContent` |
| **Storage Format** | Base64 encoded strings |
| **Purpose** | Legacy sync system |

#### System B: Storage Gateway Architecture (CORRECT)

| Property | Value |
|----------|-------|
| **Location** | `@/infrastructure/filesystem/idb-gateway.ts` |
| **Class** | `IDBGateway` |
| **Factory** | `@/infrastructure/filesystem/storage-gateway-factory.ts` |
| **Database** | `via-gent` (Dexie) |
| **Table** | `idbFiles` |
| **Storage Format** | Binary `Uint8Array` |
| **Purpose** | Modern storage gateway (ARC-B01) |

---

## 3. Adapter Purpose Analysis

### IDBAdapter (from sync/adapters)

```typescript
export class IDBAdapter extends BaseStorageAdapter {
  readonly name = 'idb';
  
  // Implements StorageAdapter interface (old)
  // Used by: StorageAdapterFactory (filesystem)
  // But: Has its own database!
}
```

**Key Characteristics:**
- Extends `BaseStorageAdapter` (from sync/adapters)
- Uses `via-gent-persistence` database (separate from Dexie)
- Stores files as base64 strings
- Has quota management and eviction (over-engineered for this purpose)
- Database: `via-gent-persistence`, Table: `syncFileContent`

### IDBGateway (from filesystem)

```typescript
export class IDBGateway implements StorageGateway {
  // Implements StorageGateway interface (new)
  // Used by: storageGatewayFactory (filesystem)
  // Uses: Dexie database (via-gent)
}
```

**Key Characteristics:**
- Implements `StorageGateway` interface (from domain)
- Uses Dexie database (`getDb()`) - the main app database
- Stores files as binary `Uint8Array` directly
- Polling-based file watching for changes
- Database: `via-gent`, Table: `idbFiles`

---

## 4. Root Cause

### Architecture Evolution History

The codebase has undergone a migration from the **Legacy Storage Architecture** to a **New Storage Gateway Architecture**:

| Version | Location | Purpose |
|---------|----------|---------|
| **Legacy** | `@/infrastructure/sync/adapters/` | Original sync-based storage |
| **New** | `@/infrastructure/filesystem/` | ARC-B01 storage gateway |

### What Went Wrong

1. **StorageAdapterFactory created incorrectly**: The `StorageAdapterFactory` in `src/infrastructure/filesystem/` was set up to use legacy adapters instead of the new gateway architecture.

2. **Two databases created**: Both `via-gent-persistence` (legacy) and `via-gent` (Dexie) exist, causing data duplication.

3. **Competing systems**: Both the legacy `IDBAdapter` and new `IDBGateway` try to manage the same files, causing:
   - CPU spikes from duplicate operations
   - Memory usage from both databases open
   - State inconsistency when files written through one system aren't visible through the other

---

## 5. Why This Matters for CPU Drain and State Issues

### CPU Drain Mechanism

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Writes File                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│  StorageAdapterFactory  │   │  storageGatewayFactory  │
│   (using IDBAdapter)    │   │   (using IDBGateway)    │
│                         │   │                         │
│  Opens:                 │   │  Opens:                 │
│  - via-gent-persistence │   │  - via-gent (Dexie)     │
│  - syncFileContent      │   │  - idbFiles             │
└─────────────────────────┘   └─────────────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              │
                              ▼
              ┌───────────────────────────────────┐
              │     BOTH DATABASES ACTIVE         │
              │     - More memory usage           │
              │     - Duplicate writes            │
              │     - Competing I/O operations    │
              └───────────────────────────────────┘
```

### State Issues

| Scenario | Expected | Actual |
|----------|----------|--------|
| Write via FSA | File in Dexie | File in `via-gent-persistence` AND Dexie |
| Read via IDBGateway | File found | File NOT found (different database) |
| Write via IDBAdapter | File in Dexie | File in `via-gent-persistence` |
| Sync operations | Single source | Conflicting data sources |

---

## 6. Recommendation

### Option A: Fix StorageAdapterFactory (RECOMMENDED)

**Change the import to use the correct gateway system:**

```typescript
// BEFORE (WRONG)
import { IDBAdapter } from '@/infrastructure/sync/adapters/idb-adapter-core';

// AFTER (CORRECT) - Use IDBGateway instead
import { IDBGateway } from './idb-gateway';
```

**However**, this requires refactoring `StorageAdapterFactory` to return `StorageGateway` instead of `StorageAdapter`, which is a breaking change.

### Option B: Create IDBStorageAdapter (ALTERNATIVE)

Create a new `IDBStorageAdapter` in `src/infrastructure/filesystem/` that:
- Implements `StorageAdapter` interface
- Delegates to `IDBGateway` internally
- Uses the Dexie database

```typescript
// src/infrastructure/filesystem/idb-storage-adapter.ts
export class IDBStorageAdapter implements StorageAdapter {
  private gateway: IDBGateway;
  
  async readFile(path: string): Promise<FileContent> {
    const data = await this.gateway.read(path);
    return {
      path,
      data,
      metadata: { path, size: data.length, lastModified: Date.now() }
    };
  }
  
  // ... implement other StorageAdapter methods
}
```

### Option C: Deprecate StorageAdapterFactory (CLEANEST)

Remove `StorageAdapterFactory` entirely and standardize on `storageGatewayFactory`:

```typescript
// Replace all uses of StorageAdapterFactory with:
import { storageGatewayFactory } from '@/infrastructure/filesystem/storage-gateway-factory';

const gateway = storageGatewayFactory.createFromPlatform(platform, {
  projectId,
  directoryHandle,
});
```

---

## 7. Correct Fix

### Immediate Action Required

**Step 1: Verify which system is actually being used**

Check all imports of `StorageAdapterFactory`:

```bash
grep -r "StorageAdapterFactory" src/ --include="*.ts"
```

**Step 2: Choose the correct adapter**

| If Used For | Use This |
|-------------|----------|
| Legacy sync operations | Keep using `IDBAdapter` from sync/adapters |
| New storage operations | Use `IDBGateway` from filesystem |

**Step 3: Consolidate to single database**

Either:
1. Migrate all `IDBAdapter` usage to `IDBGateway`, then delete `IDBAdapter`
2. Or migrate all `IDBGateway` usage to `IDBAdapter`, then delete `IDBGateway`

**Recommendation**: Migrate to `IDBGateway` (it's newer, uses Dexie, and is the intended architecture per ARC-B01).

### Files Affected

| File | Action |
|------|--------|
| `src/infrastructure/filesystem/StorageAdapterFactory.ts` | Refactor to use IDBGateway or deprecate |
| `src/infrastructure/sync/adapters/idb-adapter-core.ts` | Consider deprecation if no longer needed |
| `src/infrastructure/filesystem/idb-gateway.ts` | May need to implement StorageAdapter interface |
| `src/domain/interfaces/storage-adapter.interface.ts` | May need migration path |

---

## 8. Verification Steps

To verify the fix is correct:

1. **Check database usage**: Ensure only one IndexedDB database is used
   ```javascript
   // In browser console
   const dbs = await indexedDB.databases();
   console.log(dbs.map(d => d.name));
   ```

2. **Check file visibility**: Files written through one system should be readable through the other
   ```typescript
   // Write via gateway, read via adapter
   await gateway.write('test.md', data);
   const adapter = createStorageAdapter({ storageType: 'indexeddb', projectId });
   const content = await adapter.readFile('test.md'); // Should succeed
   ```

3. **Check memory usage**: Only one database connection should be open

---

## 9. Evidence

### File Evidence

| File | Evidence Type |
|------|---------------|
| `src/infrastructure/filesystem/StorageAdapterFactory.ts:31` | Direct import of wrong IDBAdapter |
| `src/infrastructure/sync/adapters/idb-adapter-core.ts:58` | IDBAdapter uses `via-gent-persistence` DB |
| `src/infrastructure/filesystem/idb-gateway.ts:87` | IDBGateway uses Dexie `idbFiles` table |
| `src/infrastructure/persistence/dexie-db-idb-file-types.ts:53` | IDBFileRecord definition for Dexie |

### Date Evidence

| File | Created | Purpose |
|------|---------|---------|
| `unified-storage-adapter.ts` | Oldest | Legacy adapter pattern |
| `adapter-factory.ts` (sync) | Older | Legacy factory |
| `storage-gateway-factory.ts` | Newer (ARC-B01) | New architecture |
| `StorageAdapterFactory.ts` | Newest | Should use new architecture |

---

## Appendix: Code References

### IDBAdapter (Legacy - WRONG)

```typescript
// src/infrastructure/sync/adapters/idb-adapter-core.ts
export class IDBAdapter extends BaseStorageAdapter {
  readonly name = 'idb';
  private db: IDBDatabase | null = null;
  private dbName: string = 'via-gent-persistence';  // <-- Separate DB!
  private storeName: string = 'syncFileContent';   // <-- Separate table!
}
```

### IDBGateway (Correct - NEW)

```typescript
// src/infrastructure/filesystem/idb-gateway.ts
export class IDBGateway implements StorageGateway {
  async read(path: string): Promise<Uint8Array> {
    const db = getDb();  // <-- Dexie database!
    const record = await db.idbFiles.get([this.projectId, path]);  // <-- idbFiles table!
  }
}
```

---

**Report Generated:** 2026-01-19  
**Next Action:** Share with dev-ext for implementation of recommended fix
