---
document_id: STD-BACKEND-QUERIES-2025-12-27
title: Query Patterns and Standards
version: 1.0.0
last_updated: 2025-12-27T13:20:00Z
phase: Implementation
team: Team A (Antigravity)
agent_mode: bmad-bmm-tech-writer
status: NOT_APPLICABLE
---

# Query Patterns and Standards

## Overview

This document defines query patterns and standards for the Via-gent project.

**Project Context**: Via-gent is a browser-based IDE that uses **Dexie.js** for IndexedDB queries and **TanStack Router** for API route handling. There is **no traditional backend query layer** (no SQL queries, ORM query builders, etc.). All data queries happen client-side via IndexedDB or through API calls.

**Status**: **NOT APPLICABLE** - This document describes client-side query patterns.

## Query Architecture

### IndexedDB Queries (Dexie.js)

```typescript
import { db } from './dexie-db';

// Simple query
const project = await db.projects.get('project-id');

// Query with filter
const recentProjects = await db.projects
  .where('createdAt')
  .above(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  .toArray();

// Query with index
const conversations = await db.conversations
  .where('projectId')
  .equals('project-id')
  .toArray();
```

Reference: [`src/lib/state/dexie-storage.ts`](../../src/lib/state/dexie-storage.ts)

### API Queries (TanStack Router)

```typescript
// src/routes/api/chat.ts
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/chat')({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const provider = url.searchParams.get('provider');
    
    // Query external API
    const response = await fetch(`https://api.example.com/chat?provider=${provider}`);
    return response.json();
  },
});
```

Reference: [`src/routes/api/chat.ts`](../../src/routes/api/chat.ts)

## IndexedDB Query Patterns

### Basic Queries

```typescript
// Get by primary key
const project = await db.projects.get('project-id');

// Get all
const allProjects = await db.projects.toArray();

// Count
const count = await db.projects.count();
```

### Indexed Queries

```typescript
// Query with where clause
const projects = await db.projects
  .where('name')
  .equals('My Project')
  .toArray();

// Range queries
const recentProjects = await db.projects
  .where('createdAt')
  .above(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  .toArray();

// Compound queries (using compound indexes)
const conversations = await db.conversations
  .where('[projectId+createdAt]')
  .between(['project-id', minDate], ['project-id', maxDate])
  .toArray();
```

### Complex Queries

```typescript
// Filter after query
const activeProjects = await db.projects
  .filter(project => !project.archived)
  .toArray();

// Sort
const sortedProjects = await db.projects
  .orderBy('createdAt')
  .reverse()
  .toArray();

// Limit and offset
const paginatedProjects = await db.projects
  .offset(0)
  .limit(10)
  .toArray();
```

### Transaction Queries

```typescript
// Read transaction
const [project, conversations] = await db.transaction('r', 
  db.projects, 
  db.conversations
).async(async () => {
  const project = await db.projects.get('project-id');
  const conversations = await db.conversations
    .where('projectId')
    .equals('project-id')
    .toArray();
  return [project, conversations];
});

// Write transaction
await db.transaction('rw', db.projects, db.conversations).async(async () => {
  await db.projects.put(newProject);
  await db.conversations.bulkAdd(newConversations);
});
```

## API Query Patterns

### GET Requests

```typescript
// Simple GET
export const Route = createFileRoute('/api/projects')({
  GET: async () => {
    const projects = await db.projects.toArray();
    return json(projects);
  },
});

// GET with query parameters
export const Route = createFileRoute('/api/projects')({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const archived = url.searchParams.get('archived') === 'true';
    
    const projects = await db.projects
      .filter(p => p.archived === archived)
      .toArray();
    
    return json(projects);
  },
});
```

### POST Requests

```typescript
export const Route = createFileRoute('/api/projects')({
  POST: async ({ request }) => {
    const body = await request.json();
    
    // Validate input
    const validated = ProjectSchema.parse(body);
    
    // Create project
    const project = await db.projects.add(validated);
    
    return json({ id: project }, { status: 201 });
  },
});
```

### PUT/PATCH Requests

```typescript
export const Route = createFileRoute('/api/projects/$id')({
  PUT: async ({ request, params }) => {
    const body = await request.json();
    const { id } = params;
    
    // Validate input
    const validated = ProjectSchema.parse(body);
    
    // Update project
    await db.projects.put({ ...validated, id });
    
    return json({ success: true });
  },
});
```

### DELETE Requests

```typescript
export const Route = createFileRoute('/api/projects/$id')({
  DELETE: async ({ params }) => {
    const { id } = params;
    
    // Delete project
    await db.projects.delete(id);
    
    return json({ success: true });
  },
});
```

## Query Performance Best Practices

### Use Indexes

Define indexes for frequently queried fields:

```typescript
this.version(1).stores({
  // Indexes: name, createdAt, updatedAt
  projects: 'id, name, createdAt, updatedAt',
  
  // Compound index for efficient queries
  conversations: 'id, projectId, createdAt, updatedAt, [projectId+createdAt]'
});
```

### Limit Results

Always limit results for large datasets:

```typescript
// ❌ Bad - could return thousands of records
const allMessages = await db.messages.toArray();

// ✅ Good - limit to recent messages
const recentMessages = await db.messages
  .orderBy('timestamp')
  .reverse()
  .limit(100)
  .toArray();
```

### Use Transactions

Group related queries in transactions:

```typescript
// ❌ Bad - multiple round trips
const project = await db.projects.get(id);
const conversations = await db.conversations.where('projectId').equals(id).toArray();
const files = await db.files.where('projectId').equals(id).toArray();

// ✅ Good - single transaction
const [project, conversations, files] = await db.transaction('r',
  db.projects,
  db.conversations,
  db.files
).async(async () => {
  const project = await db.projects.get(id);
  const conversations = await db.conversations.where('projectId').equals(id).toArray();
  const files = await db.files.where('projectId').equals(id).toArray();
  return [project, conversations, files];
});
```

### Cache Results

Cache frequently accessed data:

```typescript
const projectCache = new Map<string, ProjectMetadata>();

async function getProject(id: string): Promise<ProjectMetadata> {
  // Check cache
  if (projectCache.has(id)) {
    return projectCache.get(id)!;
  }
  
  // Query database
  const project = await db.projects.get(id);
  
  // Cache result
  if (project) {
    projectCache.set(id, project);
  }
  
  return project;
}
```

## Error Handling

### IndexedDB Errors

```typescript
import { Dexie } from 'dexie';

try {
  const project = await db.projects.get('project-id');
} catch (error) {
  if (error instanceof Dexie.NotFoundError) {
    console.error('Project not found');
  } else {
    console.error('Database error:', error);
  }
}
```

### API Errors

```typescript
export const Route = createFileRoute('/api/chat')({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const result = await processChat(body);
      return json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return json({ error: 'Invalid input', details: error.errors }, { status: 400 });
      }
      return json({ error: 'Internal server error' }, { status: 500 });
    }
  },
});
```

## Query Testing

### IndexedDB Query Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './dexie-db';

describe('Project Queries', () => {
  beforeEach(async () => {
    await db.projects.clear();
    await db.projects.bulkAdd([
      { id: '1', name: 'Project 1', createdAt: new Date('2024-01-01') },
      { id: '2', name: 'Project 2', createdAt: new Date('2024-01-02') },
    ]);
  });
  
  it('should get project by id', async () => {
    const project = await db.projects.get('1');
    expect(project?.name).toBe('Project 1');
  });
  
  it('should filter by date range', async () => {
    const projects = await db.projects
      .where('createdAt')
      .above(new Date('2024-01-01'))
      .toArray();
    expect(projects).toHaveLength(1);
  });
});
```

### API Query Tests

```typescript
import { describe, it, expect } from 'vitest';
import { fetch } from '@whatwg-node/fetch';

describe('API Queries', () => {
  it('should return projects', async () => {
    const response = await fetch('/api/projects');
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });
  
  it('should create project', async () => {
    const response = await fetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name: 'New Project' }),
    });
    const data = await response.json();
    expect(data.id).toBeDefined();
  });
});
```

## References

### Internal Documentation

- [`project-architecture-analysis-2025-12-27.md`](../../_bmad-output/documentation/project-architecture-analysis-2025-12-27.md) - Architecture analysis
- [`development-workflow-2025-12-27.md`](../../_bmad-output/documentation/development-workflow-2025-12-27.md) - Development workflow

### External Documentation

- **Dexie.js**: [https://dexie.org/](https://dexie.org/)
- **TanStack Router**: [https://tanstack.com/router](https://tanstack.com/router)
- **IndexedDB API**: [https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

### Implementation Files

- [`src/lib/state/dexie-db.ts`](../../src/lib/state/dexie-db.ts) - IndexedDB schema
- [`src/lib/state/dexie-storage.ts`](../../src/lib/state/dexie-storage.ts) - Storage adapter
- [`src/routes/api/chat.ts`](../../src/routes/api/chat.ts) - Chat API endpoint
- [`src/lib/workspace/project-store.ts`](../../src/lib/workspace/project-store.ts) - Project store

---

**Document Status**: Not Applicable (Frontend-Only Project)
**Last Updated**: 2025-12-27T13:20:00Z
**Next Review**: 2026-01-27