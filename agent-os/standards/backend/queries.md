# Query Standards (IndexedDB/Dexie)

> **Last Updated:** 2025-12-21  
> **Applies to:** Via-Gent (Project Alpha)

---

## Architecture Note

Via-Gent uses **Dexie.js** for IndexedDB queries. No SQL is used.

---

## Basic Queries

```typescript
import { db } from './db';

// Get by primary key
const project = await db.projects.get(projectId);

// Get all, sorted
const projects = await db.projects
  .orderBy('lastOpened')
  .reverse()
  .toArray();

// Filter with where
const recentProjects = await db.projects
  .where('lastOpened')
  .above(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  .toArray();
```

---

## Transactions

```typescript
// Use transactions for related operations
await db.transaction('rw', [db.projects, db.conversations], async () => {
  const project = await db.projects.get(projectId);
  if (!project) throw new Error('Project not found');
  
  await db.conversations.where('projectId').equals(projectId).delete();
  await db.projects.delete(projectId);
});
```

---

## Performance Patterns

| Pattern | Usage |
|---------|-------|
| **Use Indexes** | Query on indexed fields only |
| **Limit Results** | Use `.limit(n)` for large datasets |
| **Batch Operations** | Use `.bulkPut()` for multiple inserts |
| **Avoid Full Scans** | Never use `.filter()` without `.where()` first |

---

## Query Examples

### Search by Name

```typescript
const searchResults = await db.projects
  .where('name')
  .startsWithIgnoreCase(searchTerm)
  .toArray();
```

### Upsert Pattern

```typescript
await db.projects.put({
  id: projectId,
  ...projectData,
  updatedAt: new Date(),
});
```

### Delete with Cascade

```typescript
await db.transaction('rw', [db.projects, db.conversations], async () => {
  await db.conversations.where('projectId').equals(id).delete();
  await db.projects.delete(id);
});
```

---

## General Practices

- **Use Transactions**: For related operations
- **Index Queries**: Only query on indexed fields
- **Await tx.done**: Always wait for transaction completion
- **Handle Errors**: Wrap in try-catch
- **Avoid N+1**: Use compound queries, not loops
