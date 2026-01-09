---
date: 2026-01-09
time: "20:56:00"
phase: Standards
team: Team-A
last_updated_by: governance-cycle-3
---

# Database Migrations - Project Alpha

> **Stack:** Dexie.js (IndexedDB) | **No SQL Migrations**

## Architecture Overview

Project Alpha uses **Dexie.js** for client-side persistence. Unlike SQL databases, Dexie uses a **version-based schema upgrade** system.

---

## Schema Location

```
src/infrastructure/persistence/
├── dexie-db.ts              # Main DB instance
├── dexie-db-schema.ts       # Schema definitions
└── dexie/
    ├── migrations/          # Version upgrade functions
    │   ├── v1.ts
    │   ├── v2.ts
    │   └── index.ts
    └── types.ts             # Table types
```

---

## Schema Definition

```typescript
// src/infrastructure/persistence/dexie-db-schema.ts
import Dexie from 'dexie';

export interface DexieDBSchema {
  notes: NoteRecord;
  projects: ProjectRecord;
  settings: SettingRecord;
  files: FileRecord;
}

// Table definitions with indexes
export const DB_SCHEMA = {
  // Version 1
  v1: {
    notes: '++id, projectId, title, updatedAt',
    projects: '++id, name, createdAt, storageType',
    settings: 'key',
  },
  
  // Version 2 - Added files table
  v2: {
    notes: '++id, projectId, title, updatedAt, [projectId+title]',
    projects: '++id, name, createdAt, storageType, [storageType+createdAt]',
    settings: 'key',
    files: '++id, projectId, path, type, [projectId+path]',
  },
};
```

---

## Version Upgrade Pattern

### Creating a New Version

```typescript
// src/infrastructure/persistence/dexie/migrations/v3.ts
import type { DexieDBMigration } from '../types';

export const v3Migration: DexieDBMigration = {
  version: 3,
  
  // Schema changes (Dexie auto-handles)
  schema: {
    notes: '++id, projectId, title, updatedAt, [projectId+title], status',
    projects: '++id, name, createdAt, storageType, [storageType+createdAt]',
    settings: 'key',
    files: '++id, projectId, path, type, [projectId+path]',
    // New table
    tags: '++id, name, color',
  },
  
  // Data migration (runs when user opens app)
  upgrade: async (tx, db) => {
    // Migrate existing data
    await tx.table('notes').toCollection().modify((note) => {
      // Add default status to existing notes
      if (!note.status) {
        note.status = 'active';
      }
    });
    
    console.log('v3 migration complete');
  },
};
```

### Registering Migrations

```typescript
// src/infrastructure/persistence/dexie/migrations/index.ts
import { v1Migration } from './v1';
import { v2Migration } from './v2';
import { v3Migration } from './v3';

export const migrations = [v1Migration, v2Migration, v3Migration];

// Apply to Dexie instance
export function applyMigrations(db: Dexie) {
  migrations.forEach((migration) => {
    db.version(migration.version)
      .stores(migration.schema)
      .upgrade((tx) => migration.upgrade?.(tx, db));
  });
}
```

---

## Index Patterns

### Primary Key

```typescript
// Auto-increment primary key
'++id'           // ++id means auto-increment

// Manual primary key
'id'             // No ++ means you must provide id
```

### Secondary Indexes

```typescript
// Single field index
'projectId'      // Enables .where('projectId').equals(x)

// Compound index
'[projectId+title]'  // Enables .where('[projectId+title]').equals([x, y])

// Multi-entry index (for arrays)
'*tags'          // Enables .where('tags').equals('tag1')
```

### Index Selection Guidelines

| Query Pattern | Index Needed |
|--------------|--------------|
| Get by ID | Primary key (always exists) |
| Filter by field | Single index on field |
| Sort by field | Single index on field |
| Filter + Sort | Compound index `[filter+sort]` |
| Contains in array | Multi-entry `*field` |

---

## Data Migration Patterns

### Adding New Field with Default

```typescript
upgrade: async (tx) => {
  await tx.table('notes').toCollection().modify((note) => {
    note.newField = note.newField ?? 'default';
  });
}
```

### Renaming Field

```typescript
upgrade: async (tx) => {
  await tx.table('notes').toCollection().modify((note) => {
    note.newName = note.oldName;
    delete note.oldName;
  });
}
```

### Splitting Table

```typescript
upgrade: async (tx) => {
  const notes = await tx.table('notes').toArray();
  
  // Extract metadata to new table
  const metadata = notes.map((n) => ({
    noteId: n.id,
    wordCount: n.content?.split(' ').length ?? 0,
    lastAnalyzed: new Date().toISOString(),
  }));
  
  await tx.table('noteMetadata').bulkAdd(metadata);
}
```

---

## Testing Migrations

```typescript
// tests/migrations/v3.test.ts
import Dexie from 'dexie';
import { v3Migration } from '@/infrastructure/persistence/dexie/migrations/v3';

describe('v3 migration', () => {
  let db: Dexie;
  
  beforeEach(async () => {
    db = new Dexie('TestDB');
    // Set up v2 schema
    db.version(2).stores({ notes: '++id, projectId' });
    await db.open();
    
    // Add test data
    await db.table('notes').add({ projectId: '1', title: 'Test' });
  });
  
  afterEach(async () => {
    await db.delete();
  });
  
  it('adds status field to existing notes', async () => {
    // Apply v3 migration
    db.version(3).stores(v3Migration.schema).upgrade(v3Migration.upgrade!);
    
    const notes = await db.table('notes').toArray();
    expect(notes[0].status).toBe('active');
  });
});
```

---

## Critical Rules

### Never Remove Tables in Production

```typescript
// ❌ WRONG: Removing table loses data
v3: { notes: null }  // DON'T DO THIS

// ✅ RIGHT: Deprecate and migrate
v3: { 
  notes: null,
  notes_v2: '++id, ...',  // Create new table
}
// Then migrate data in upgrade function
```

### Always Handle Missing Fields

```typescript
// ✅ SAFE: Default for missing field
const status = note.status ?? 'active';

// ❌ UNSAFE: Assumes field exists
const status = note.status; // May be undefined!
```

### Version Numbers Must Be Sequential

```typescript
// ❌ WRONG: Gaps in versions
db.version(1).stores({...});
db.version(5).stores({...});  // Skipped 2,3,4!

// ✅ RIGHT: Sequential
db.version(1).stores({...});
db.version(2).stores({...});
db.version(3).stores({...});
```

---

## Related Standards

- **Models:** `agent-os/standards/backend/models.md`
- **Queries:** `agent-os/standards/backend/queries.md`
- **Error Handling:** `agent-os/standards/global/error-handling.md`
