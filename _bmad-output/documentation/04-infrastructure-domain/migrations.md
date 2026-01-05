# Infrastructure Data Migrations

## Overview

The migration system handles schema evolution for the IndexedDB database. All migrations are registered in `registerMigrations()` and executed automatically when the database version changes.

---

## Migration Architecture

### Key Components

```
src/infrastructure/persistence/
├── dexie-db-migrations.ts    # Migration registration & functions
├── dexie-db.ts              # Database instance & helpers
└── dexie-db-class.ts        # ViaGentDatabase class
```

### Migration Flow

```
1. Browser opens page
2. Dexie detects version mismatch
3. registerMigrations() called
4. Migrations execute in order (v1 → v2 → ... → v15)
5. Migration applied flag stored in localStorage
6. Database ready for use
```

---

## Migration Functions

### logDexieMigration()

```typescript
import { logDexieMigration } from '@/infrastructure/persistence/dexie-db-migrations';

logDexieMigration(
  version: number,
  operation: string,
  status: 'started' | 'completed' | 'failed',
  details?: { tableName?: string; itemsCount?: number; error?: string } | string
): void
```

Logs migration events for audit trail.

### isMigrationApplied()

```typescript
import { isMigrationApplied } from '@/infrastructure/persistence/dexie-db-migrations';

// Check if migration was already applied
if (isMigrationApplied(9)) {
  console.log('Migration v9 already applied, skipping');
}
```

Checks if a specific migration version has been applied (stored in localStorage).

### markMigrationApplied()

```typescript
import { markMigrationApplied } from '@/infrastructure/persistence/dexie-db-migrations';

// Mark migration as applied
markMigrationApplied(9);
```

Marks a migration as applied to prevent re-execution.

---

## Migration History (v1-v15)

### Version 1: Initial Schema

```typescript
db.version(1).stores({
  projects: 'id, lastOpened, name',
  ideState: 'projectId, updatedAt',
  conversations: 'id, projectId, updatedAt',
});
```

### Version 3: AI Foundation Tables

```typescript
db.version(3).stores({
  // ... previous tables
  taskContexts: 'id, projectId, agentId, status, [projectId+status]',
  toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
});
```

### Version 4: Credentials Table

```typescript
db.version(4).stores({
  // ... previous tables
  credentials: 'providerId, createdAt',
});
```

### Version 5: Conversation Threads

```typescript
db.version(5).stores({
  // ... previous tables
  threads: 'id, projectId, updatedAt, [projectId+updatedAt]',
});
```

### Version 8: Sync Status (localStorage Migration)

```typescript
db.version(8).stores({
  // ... previous tables
  syncStatus: 'id, path, syncStatus, lastSyncedAt, [path+syncStatus]',
}).upgrade(async (tx) => {
  logDexieMigration(8, 'sync-status-migration', 'started');
  
  if (isMigrationApplied(8)) {
    logDexieMigration(8, 'sync-status-migration', 'completed', 'Already applied');
    return;
  }
  
  // Migrate from localStorage
  const localStorageData = localStorage.getItem('sync-status-store');
  if (localStorageData) {
    const parsed = JSON.parse(localStorageData);
    const queue = parsed.state?.queue || [];
    
    const syncStatusTable = tx.table('syncStatus');
    const now = Date.now();
    
    for (const item of queue) {
      if (item.status !== 'completed') {
        await syncStatusTable.put({
          id: item.id || `sync-${item.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
          path: item.path,
          syncStatus: mapStatus(item.status),
          errorMessage: item.error,
          retryCount: item.status === 'failed' ? 1 : 0,
          createdAt: item.createdAt ? new Date(item.createdAt).getTime() : now,
          updatedAt: now,
        });
      }
    }
  }
  
  markMigrationApplied(8);
  logDexieMigration(8, 'sync-status-migration', 'completed', { itemsCount });
});
```

### Version 9: Epic 24 Tables

```typescript
db.version(9).stores({
  // ... previous tables
  fileMetadata: '[projectId+path], projectId, lastModified, syncedAt',
  toolExecutionLogs: 'id, conversationId, [conversationId+timestamp]',
  fsaHandles: 'projectId, lastAccessedAt',
  sessionSnapshots: 'id, projectId, createdAt, expiresAt, [projectId+createdAt]',
}).upgrade(async () => {
  logDexieMigration(9, 'epic-24-schema', 'started');
  
  if (isMigrationApplied(9)) {
    return;
  }
  
  // No data migration needed - tables are new
  markMigrationApplied(9);
});
```

### Version 15: Notes Table

```typescript
db.version(15).stores({
  // ... previous tables
  notes: 'id, projectId, parentId, isFavorite, order, createdAt, updatedAt, [projectId+parentId], [projectId+isFavorite], [projectId+createdAt]',
}).upgrade(async () => {
  logDexieMigration(15, 'epic-26-notes', 'started');
  
  if (isMigrationApplied(15)) {
    return;
  }
  
  markMigrationApplied(15);
});
```

---

## Migration Best Practices

### 1. Idempotency

All migrations must be idempotent - safe to run multiple times:

```typescript
.upgrade(async () => {
  if (isMigrationApplied(version)) {
    logDexieMigration(version, 'migration', 'completed', 'Already applied');
    return;
  }
  // ... migration logic
  markMigrationApplied(version);
});
```

### 2. Data Preservation

Never delete data in migrations unless explicitly required:

```typescript
// ❌ Bad: Deleting data
.upgrade(async (tx) => {
  await tx.table('oldTable').clear();
});

// ✅ Good: Preserving data
.upgrade(async (tx) => {
  // Copy to new table if needed
  const oldData = await tx.table('oldTable').toArray();
  await tx.table('newTable').bulkPut(oldData);
});
```

### 3. Logging

Log all migration operations:

```typescript
.upgrade(async (tx) => {
  logDexieMigration(version, 'migration-name', 'started');
  try {
    // ... migration logic
    logDexieMigration(version, 'migration-name', 'completed', { itemsCount });
  } catch (error) {
    logDexieMigration(version, 'migration-name', 'failed', { error: error.message });
    throw error;
  }
});
```

### 4. Backward Compatibility

Handle missing data gracefully:

```typescript
.upgrade(async (tx) => {
  const existingData = await tx.table('table').get('key');
  if (!existingData) {
    // Provide default values
    await tx.table('table').put({ id: 'key', newField: 'default' });
  }
});
```

---

## Debugging Migrations

### Enable Migration Logging

```typescript
// Check browser console for migration logs
// Format: [Dexie Migration] { "timestamp": ..., "version": 8, "operation": "sync-status-migration", "status": "completed" }
```

### Check Applied Migrations

```typescript
// Check localStorage
console.log(localStorage.getItem('dexie-migration-v9-applied')); // "true" or null
```

### Reset Migrations (Development Only)

```typescript
// Remove migration flags
for (let i = 1; i <= 15; i++) {
  localStorage.removeItem(`dexie-migration-v${i}-applied`);
}

// Delete and re-create database
const db = getDb();
await db.delete();
await db.open();
```

---

## Migration Checklist

When adding a new schema version:

- [ ] Define TypeScript interface for new/changed tables
- [ ] Add table to `ViaGentDatabase` class
- [ ] Create Dexie schema in `registerMigrations()`
- [ ] Implement `upgrade()` function with idempotency check
- [ ] Add logging with `logDexieMigration()`
- [ ] Mark migration as applied with `markMigrationApplied()`
- [ ] Write helper functions in `dexie-db.ts` if needed
- [ ] Test migration from previous version
- [ ] Verify data integrity after migration
- [ ] Document migration in this file

---

## Rollback Strategy

### Rollback Considerations

1. **No Native Rollback**: Dexie doesn't support automatic rollback
2. **Manual Backup**: Data should be backed up before major migrations
3. **Version Compatibility**: Older code may not understand new schema

### Recovery Steps

```typescript
// If migration fails:
// 1. Delete database
const db = getDb();
await db.delete();

// 2. Clear migration flags
for (let i = 1; i <= 15; i++) {
  localStorage.removeItem(`dexie-migration-v${i}-applied`);
}

// 3. Refresh page - database will be recreated at v1
```

---

## Performance Considerations

### Large Data Migrations

```typescript
.upgrade(async (tx) => {
  // Process in batches to avoid blocking
  const BATCH_SIZE = 1000;
  let skip = 0;
  
  while (true) {
    const batch = await tx.table('oldTable')
      .offset(skip)
      .limit(BATCH_SIZE)
      .toArray();
    
    if (batch.length === 0) break;
    
    await tx.table('newTable').bulkPut(batch.map(transform));
    skip += BATCH_SIZE;
  }
});
```

### Async Operations

All migrations should be async to avoid blocking the main thread:

```typescript
// ✅ Good: Async migration
.upgrade(async (tx) => {
  const data = await tx.table('table').toArray();
  await tx.table('newTable').bulkPut(data);
});

// ❌ Bad: Sync migration
.upgrade((tx) => {
  const data = tx.table('table').toArray(); // Promise ignored!
});
```
