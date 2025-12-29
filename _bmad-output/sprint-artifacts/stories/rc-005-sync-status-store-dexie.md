# Story: RC-005 - SyncStatusStore Dexie Migration

**Story ID:** rc-005-sync-status-store-dexie
**Sprint:** 27B
**Priority:** HIGH (HIGH-001)
**Status:** ready-for-dev
**Estimated Points:** 5
**Owner:** Team A

## Issue Description

Current `useSyncStatusStore` in `src/lib/state/sync-status-store.ts` uses localStorage for persistence, which:
- Does not persist large sync status objects reliably
- Has 5MB storage limit that can be exceeded
- Does not support complex queries needed for sync queue visualization
- Cannot participate in the unified Zustand + Dexie architecture

## Root Cause

The store was implemented during Epic 2 before Dexie persistence was standardized. It uses `localStorage` directly via Zustand's `persist` middleware without the encrypted credentials table and without integration with the project's Dexie schema.

## Acceptance Criteria

1. [ ] SyncStatusStore migrated to use Dexie backend via `dexie-db.ts`
2. [ ] Dexie schema includes `syncStatus` table with indexes for:
   - `id` (primary key)
   - `filePath` (indexed for lookups)
   - `syncStatus` (indexed for filtering)
   - `lastSyncedAt` (indexed for sorting)
3. [ ] Store implements `useFileSyncStatusStore` interface for backward compatibility
4. [ ] Migration function handles existing localStorage data conversion
5. [ ] Write operations are debounced (300ms) to prevent excessive DB writes
6. [ ] Read operations use efficient Dexie queries with live subscriptions
7. [ ] Error handling covers storage quota exceeded scenarios
8. [ ] Tests cover: migration, CRUD operations, queries, error scenarios (15+ tests)

## Technical Approach

```typescript
// Proposed Dexie Schema
interface SyncStatusRecord {
  id: string;
  filePath: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error' | 'conflict';
  localVersion?: number;
  remoteVersion?: number;
  lastSyncedAt?: number;
  errorMessage?: string;
  retryCount: number;
  createdAt: number;
  updatedAt: number;
}

// Store Implementation Pattern
class SyncStatusDexieStore {
  private db: DexieInstance;

  async setStatus(filePath: string, status: Partial<SyncStatusRecord>): Promise<void> {
    await this.db.syncStatus.put({
      ...status,
      id: generateId(filePath),
      filePath,
      updatedAt: Date.now(),
    });
  }

  async getStatus(filePath: string): Promise<SyncStatusRecord | undefined> {
    return this.db.syncStatus.get(generateId(filePath));
  }

  async getByStatus(status: SyncStatusRecord['syncStatus']): Promise<SyncStatusRecord[]> {
    return this.db.syncStatus.where('syncStatus').equals(status).toArray();
  }
}
```

## Dependencies

- `src/lib/state/dexie-db.ts` - Dexie database instance
- `src/lib/state/sync-status-store.ts` - Current implementation (migration source)
- RC-011 (Dexie migration logic) - Related migration infrastructure

## Files to Modify

- `src/lib/state/sync-status-store.ts` - Migrate to Dexie backend
- `src/lib/state/dexie-db.ts` - Add syncStatus table to schema
- `src/lib/state/__tests__/sync-status-store.test.ts` - Add migration and store tests

## Files to Create

- None (modifying existing)

## Test Strategy

1. **Migration Tests**: Verify localStorage data converts correctly
2. **CRUD Tests**: Set, get, update, delete operations
3. **Query Tests**: Filter by status, sort by timestamp
4. **Error Tests**: Storage quota exceeded handling
5. **Integration Tests**: Works with SyncManager for dual-write sync

## Definition of Done

- [ ] All AC satisfied
- [ ] 15+ tests passing (100%)
- [ ] Code reviewed
- [ ] Integration validated with SyncManager
- [ ] sprint-status.yaml updated

## Notes

The store should maintain the same public interface (`useFileSyncStatusStore`) to avoid breaking changes in components that consume it.

---

**Created:** 2025-12-29
**Last Updated:** 2025-12-29
