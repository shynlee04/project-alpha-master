---
document_id: STD-BACKEND-MIGRATIONS-2025-12-27
title: Database Migration Standards
version: 1.0.0
last_updated: 2025-12-27T13:10:00Z
phase: Implementation
team: Team A (Antigravity)
agent_mode: bmad-bmm-tech-writer
status: NOT_APPLICABLE
---

# Database Migration Standards

## Overview

This document defines database migration standards for the Via-gent project.

**Project Context**: Via-gent is a browser-based IDE that uses **IndexedDB** for client-side data persistence. There is **no traditional backend database** (no PostgreSQL, MySQL, MongoDB, etc.). All data persistence happens in the browser using IndexedDB via Dexie.js.

**Status**: **NOT APPLICABLE** - This document is maintained for completeness but contains no active migration standards.

## Data Persistence Architecture

### Client-Side Only

Via-gent uses a client-side persistence strategy:

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Environment                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   IndexedDB     │    │   localStorage  │                │
│  │   (Dexie.js)    │    │                 │                │
│  │                 │    │                 │                │
│  │ • Projects      │    │ • Agent Config  │                │
│  │ • Conversations │    │ • API Keys      │                │
│  │ • File Metadata │    │ • Preferences   │                │
│  └─────────────────┘    └─────────────────┘                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### IndexedDB Schema Management

IndexedDB schema is managed through Dexie.js versioning:

```typescript
// src/lib/state/dexie-db.ts
import Dexie, { Table } from 'dexie';

export class ViaGentDB extends Dexie {
  projects!: Table<ProjectMetadata, string>;
  conversations!: Table<Conversation, string>;
  
  constructor() {
    super('via-gent-db');
    
    this.version(1).stores({
      projects: 'id, name, createdAt, updatedAt',
      conversations: 'id, projectId, createdAt, updatedAt'
    });
  }
}

export const db = new ViaGentDB();
```

Reference: [`src/lib/state/dexie-db.ts`](../../src/lib/state/dexie-db.ts)

## Schema Versioning Strategy

### Version Management

IndexedDB uses version numbers for schema changes:

```typescript
// Current version
this.version(1).stores({
  projects: 'id, name, createdAt, updatedAt',
  conversations: 'id, projectId, createdAt, updatedAt'
});

// Future version with schema changes
this.version(2).stores({
  projects: 'id, name, createdAt, updatedAt, [projectId+type]',
  conversations: 'id, projectId, createdAt, updatedAt, archived'
}).upgrade(tx => {
  // Migration logic
  return tx.table('projects').toCollection().modify(project => {
    project.archived = false;
  });
});
```

### Migration Patterns

When adding IndexedDB schema changes:

1. **Increment Version**: Always increment the version number
2. **Define New Schema**: Add new indexes or modify existing ones
3. **Add Upgrade Logic**: Migrate existing data if needed
4. **Test Migration**: Verify data integrity after migration

Example migration:

```typescript
this.version(2).stores({
  projects: 'id, name, createdAt, updatedAt, [projectId+type]'
}).upgrade(async tx => {
  // Migrate existing projects
  const projects = await tx.table('projects').toArray();
  await tx.table('projects').bulkPut(
    projects.map(p => ({ ...p, type: 'default' }))
  );
});
```

## Data Migration Best Practices

### IndexedDB Migration Guidelines

1. **Non-Breaking Changes**: Add new indexes without removing old ones
2. **Backward Compatibility**: Maintain old indexes during transition
3. **Data Validation**: Validate migrated data before committing
4. **Rollback Plan**: Document how to rollback if migration fails

### localStorage Migration

For localStorage changes:

```typescript
// Migration utility
function migrateLocalStorage() {
  const oldVersion = localStorage.getItem('version');
  const currentVersion = '2.0.0';
  
  if (oldVersion !== currentVersion) {
    // Perform migration
    migrateAgentConfig();
    
    // Update version
    localStorage.setItem('version', currentVersion);
  }
}
```

## Testing Migrations

### IndexedDB Migration Tests

```typescript
describe('IndexedDB Migration', () => {
  it('should migrate from v1 to v2', async () => {
    // Create v1 database
    const db1 = new ViaGentDB();
    await db1.version(1).stores({
      projects: 'id, name'
    });
    
    // Add test data
    await db1.projects.add({ id: '1', name: 'Test' });
    await db1.close();
    
    // Open v2 database (triggers migration)
    const db2 = new ViaGentDB();
    const project = await db2.projects.get('1');
    
    // Verify migration
    expect(project?.type).toBe('default');
    await db2.close();
  });
});
```

## References

### Internal Documentation

- [`project-architecture-analysis-2025-12-27.md`](../../_bmad-output/documentation/project-architecture-analysis-2025-12-27.md) - Architecture analysis
- [`state-management-audit-2025-12-24.md`](../../_bmad-output/state-management-audit-2025-12-24.md) - State management audit

### External Documentation

- **Dexie.js**: [https://dexie.org/](https://dexie.org/)
- **IndexedDB API**: [https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

### Implementation Files

- [`src/lib/state/dexie-db.ts`](../../src/lib/state/dexie-db.ts) - IndexedDB schema
- [`src/lib/state/dexie-storage.ts`](../../src/lib/state/dexie-storage.ts) - Storage adapter
- [`src/lib/workspace/project-store.ts`](../../src/lib/workspace/project-store.ts) - Project store

---

**Document Status**: Not Applicable (Frontend-Only Project)
**Last Updated**: 2025-12-27T13:10:00Z
**Next Review**: 2026-01-27