# Schema Migration Standards (IndexedDB)

> **Last Updated:** 2025-12-21  
> **Applies to:** Via-Gent (Project Alpha)

---

## Architecture Note

Via-Gent uses **IndexedDB via Dexie.js** for client-side persistence. No traditional database migrations exist, but schema versioning is required.

---

## Dexie Schema Versioning

```typescript
// src/lib/persistence/db.ts
import Dexie from 'dexie';

class ViaGentDB extends Dexie {
  projects!: Table<ProjectMetadata>;
  conversations!: Table<ConversationState>;
  
  constructor() {
    super('via-gent-db');
    
    // Version 1: Initial schema
    this.version(1).stores({
      projects: 'id, name, lastOpened',
      conversations: 'id, projectId, updatedAt',
    });
    
    // Version 2: Add layout state
    this.version(2).stores({
      projects: 'id, name, lastOpened',
      conversations: 'id, projectId, updatedAt',
    }).upgrade(async tx => {
      // Migrate existing data
      await tx.table('projects').toCollection().modify(project => {
        project.layoutState = null;
      });
    });
  }
}

export const db = new ViaGentDB();
```

---

## Migration Best Practices

| Practice | Description |
|----------|-------------|
| **Increment Version** | Always increment version number for schema changes |
| **Upgrade Function** | Use `.upgrade()` to transform existing data |
| **No Down Migrations** | IndexedDB doesn't support rollback - test carefully |
| **Backwards Compatible** | Add optional fields, don't remove/rename existing |

---

## Testing Migrations

```typescript
import 'fake-indexeddb/auto';
import { db } from './db';

describe('Database migrations', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });
  
  it('should migrate v1 projects to v2', async () => {
    // Insert v1 data, verify v2 schema applied
  });
});
```

---

## General Practices

- **Version Numbers**: Sequential, never modify existing versions
- **Optional Fields**: New fields should be optional or have defaults
- **Test Migrations**: Use fake-indexeddb for migration testing
- **Document Changes**: Comment each version with what changed
