---
date: 2026-01-09
time: "20:56:00"
phase: Standards
team: Team-A
last_updated_by: governance-cycle-3
---

# Query Patterns - Project Alpha

> **Stack:** Dexie.js + Zustand | **No SQL Queries**

## Architecture Overview

Queries in Project Alpha use **Dexie.js** for IndexedDB access and **Zustand stores** for state management. No raw SQL or direct IndexedDB API.

---

## Query Locations

```
src/infrastructure/persistence/
├── stores/
│   ├── note-store.ts      # Zustand store with queries
│   ├── project-store.ts
│   └── file-store.ts
├── dexie-db.ts            # Dexie instance
└── dexie/
    └── queries/           # Reusable query functions
        ├── note-queries.ts
        ├── project-queries.ts
        └── index.ts
```

---

## Basic Query Patterns

### Get All

```typescript
// In store or service
const notes = await db.notes.toArray();
```

### Get by ID

```typescript
const note = await db.notes.get(id);
if (!note) {
  throw new NotFoundError(`Note ${id} not found`);
}
```

### Get by Index

```typescript
// Using indexed field
const projectNotes = await db.notes
  .where('projectId')
  .equals(projectId)
  .toArray();
```

### Get with Sorting

```typescript
// Order by indexed field
const recentNotes = await db.notes
  .orderBy('updatedAt')
  .reverse()  // Descending
  .toArray();
```

### Get with Limit

```typescript
// Pagination
const page = await db.notes
  .orderBy('createdAt')
  .reverse()
  .offset(pageIndex * pageSize)
  .limit(pageSize)
  .toArray();
```

---

## Compound Query Patterns

### Filter + Sort

```typescript
// Using compound index [projectId+updatedAt]
const notes = await db.notes
  .where('[projectId+updatedAt]')
  .between(
    [projectId, Dexie.minKey],
    [projectId, Dexie.maxKey]
  )
  .reverse()
  .toArray();
```

### Multiple Conditions

```typescript
// Chain filters (AND logic)
const activeNotes = await db.notes
  .where('projectId').equals(projectId)
  .and(note => note.status === 'active')
  .toArray();
```

### OR Queries

```typescript
// Union of queries
const notes = await db.notes
  .where('status').equals('draft')
  .or('status').equals('active')
  .toArray();
```

---

## Write Operations

### Insert

```typescript
// Single insert (returns auto-id)
const id = await db.notes.add({
  projectId,
  title: 'New Note',
  content: '',
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
```

### Bulk Insert

```typescript
await db.notes.bulkAdd(notes);
```

### Update

```typescript
// Update by ID
await db.notes.update(id, {
  title: 'Updated Title',
  updatedAt: new Date().toISOString(),
});

// Update with modification function
await db.notes
  .where('id').equals(id)
  .modify({ title: 'Updated' });
```

### Delete

```typescript
// Delete by ID
await db.notes.delete(id);

// Bulk delete
await db.notes.where('projectId').equals(projectId).delete();
```

---

## Transaction Patterns

### Simple Transaction

```typescript
await db.transaction('rw', db.notes, db.projects, async () => {
  // All operations in same transaction
  const note = await db.notes.get(noteId);
  await db.projects.update(note.projectId, {
    updatedAt: new Date().toISOString(),
  });
  await db.notes.update(noteId, { status: 'archived' });
});
```

### Error Handling in Transaction

```typescript
try {
  await db.transaction('rw', db.notes, async () => {
    await db.notes.add(note1);
    await db.notes.add(note2); // If this fails, note1 is rolled back
  });
} catch (error) {
  if (error instanceof Dexie.ConstraintError) {
    // Handle duplicate key
  }
  throw error;
}
```

---

## Zustand Store Query Pattern

### Store with Queries

```typescript
// src/infrastructure/persistence/stores/note-store.ts
import { create } from 'zustand';
import { db } from '../dexie-db';
import type { Note } from '@/domain/types/note';

interface NoteState {
  notes: Note[];
  loading: boolean;
  error: Error | null;
  
  // Queries
  loadNotes: (projectId: string) => Promise<void>;
  getNoteById: (id: string) => Note | undefined;
  
  // Mutations
  createNote: (input: CreateNoteInput) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  loading: false,
  error: null,
  
  loadNotes: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const notes = await db.notes
        .where('projectId')
        .equals(projectId)
        .toArray();
      set({ notes: notes.map(toNoteEntity), loading: false });
    } catch (error) {
      set({ error: error as Error, loading: false });
    }
  },
  
  getNoteById: (id) => {
    return get().notes.find((n) => n.id === id);
  },
  
  createNote: async (input) => {
    const record = {
      ...input,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.notes.add(record);
    const note = toNoteEntity({ ...record, id });
    set((state) => ({ notes: [...state.notes, note] }));
    return note;
  },
  
  // ... other mutations
}));
```

### Using Store Queries

```typescript
// In component
import { useNoteStore } from '@/infrastructure/persistence/stores/note-store';
import { useShallow } from 'zustand/react/shallow';

function NoteList({ projectId }: { projectId: string }) {
  const { notes, loading, loadNotes } = useNoteStore(
    useShallow((s) => ({
      notes: s.notes,
      loading: s.loading,
      loadNotes: s.loadNotes,
    }))
  );
  
  useEffect(() => {
    loadNotes(projectId);
  }, [projectId, loadNotes]);
  
  if (loading) return <Spinner />;
  return <NoteGrid notes={notes} />;
}
```

---

## Performance Guidelines

### Index Usage

```typescript
// ✅ GOOD: Uses index
db.notes.where('projectId').equals(id)

// ❌ BAD: Full table scan
db.notes.filter(n => n.projectId === id)
```

### Avoid Large Results

```typescript
// ✅ GOOD: Paginated
db.notes.limit(50).toArray()

// ❌ BAD: Loading everything
db.notes.toArray() // Don't do this for large tables
```

### Use Compound Indexes

```typescript
// ✅ GOOD: Single index hit
db.notes.where('[projectId+status]').equals([id, 'active'])

// ❌ BAD: Two separate queries
const all = await db.notes.where('projectId').equals(id).toArray();
const filtered = all.filter(n => n.status === 'active');
```

---

## Anti-Patterns

```typescript
// ❌ WRONG: Direct Dexie in component
function NoteList() {
  const [notes, setNotes] = useState([]);
  useEffect(() => {
    db.notes.toArray().then(setNotes); // Use store instead!
  }, []);
}

// ❌ WRONG: N+1 queries
for (const project of projects) {
  const notes = await db.notes.where('projectId').equals(project.id).toArray();
}

// ✅ RIGHT: Batch query
const noteCounts = await Promise.all(
  projects.map(p => db.notes.where('projectId').equals(p.id).count())
);
```

---

## Related Standards

- **Models:** `agent-os/standards/backend/models.md`
- **Migrations:** `agent-os/standards/backend/migrations.md`
- **Validation:** `agent-os/standards/global/validation.md`
