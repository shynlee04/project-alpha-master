---
date: 2026-01-09
time: "20:56:00"
phase: Standards
team: Team-A
last_updated_by: governance-cycle-3
---

# Domain Models - Project Alpha

> **Pattern:** Clean Architecture Domain Entities | **Persistence:** Dexie.js

## Architecture Overview

Domain models represent business entities and are **persistence-agnostic**. They live in `src/domain/types/` and are transformed to/from Dexie records.

---

## Directory Structure

```
src/domain/
├── types/
│   ├── note.ts          # Note entity
│   ├── project.ts       # Project entity
│   ├── file.ts          # File entity
│   ├── settings.ts      # Settings types
│   └── index.ts         # Barrel export
└── services/
    ├── note-service.ts
    ├── project-service.ts
    └── file-service.ts
```

---

## Entity Pattern

### Basic Entity

```typescript
// src/domain/types/note.ts

/**
 * Note entity - domain representation
 * Persistence-agnostic (no Dexie-specific fields)
 */
export interface Note {
  /** Unique identifier */
  id: string;
  
  /** Parent project */
  projectId: string;
  
  /** Display title */
  title: string;
  
  /** Markdown content */
  content: string;
  
  /** Note status */
  status: NoteStatus;
  
  /** Creation timestamp (ISO 8601) */
  createdAt: string;
  
  /** Last update timestamp (ISO 8601) */
  updatedAt: string;
  
  /** Optional metadata */
  metadata?: NoteMetadata;
}

export type NoteStatus = 'draft' | 'active' | 'archived';

export interface NoteMetadata {
  wordCount?: number;
  readingTime?: number;
  tags?: string[];
}
```

### Entity with Relationships

```typescript
// src/domain/types/project.ts

/**
 * Project entity with storage configuration
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  
  /** Storage type determines adapter */
  storageType: StorageType;
  
  /** FSA handle for native folder access */
  fsaHandle?: FileSystemDirectoryHandle;
  
  /** Project settings */
  settings: ProjectSettings;
  
  createdAt: string;
  updatedAt: string;
}

export type StorageType = 'fsa' | 'indexeddb';

export interface ProjectSettings {
  defaultNoteType: 'markdown' | 'blocknote';
  autoSave: boolean;
  autoSaveInterval: number; // ms
}

/**
 * Project with loaded notes (for viewer)
 */
export interface ProjectWithNotes extends Project {
  notes: Note[];
  noteCount: number;
}
```

---

## Dexie Record Types

### Record vs Entity

```typescript
// Domain Entity (clean, business-focused)
export interface Note {
  id: string;
  projectId: string;
  title: string;
  content: string;
  status: NoteStatus;
  createdAt: string;
  updatedAt: string;
}

// Dexie Record (persistence-focused)
export interface NoteRecord {
  id?: number;          // Auto-increment
  projectId: string;
  title: string;
  content: string;
  status: NoteStatus;
  createdAt: string;
  updatedAt: string;
}

// Transformer functions
export function toNoteEntity(record: NoteRecord): Note {
  return {
    id: String(record.id),
    projectId: record.projectId,
    title: record.title,
    content: record.content,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function toNoteRecord(entity: Omit<Note, 'id'>): Omit<NoteRecord, 'id'> {
  return {
    projectId: entity.projectId,
    title: entity.title,
    content: entity.content,
    status: entity.status,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
```

---

## Validation Schemas

### Zod Schema per Entity

```typescript
// src/domain/types/note.ts
import { z } from 'zod';

export const noteSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  title: z.string().min(1).max(255),
  content: z.string().max(1000000),
  status: z.enum(['draft', 'active', 'archived']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.object({
    wordCount: z.number().optional(),
    readingTime: z.number().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
});

export const createNoteSchema = noteSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const updateNoteSchema = noteSchema.partial().required({ id: true });

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
```

---

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Entity | PascalCase singular | `Note`, `Project` |
| Input type | `Create{Entity}Input` | `CreateNoteInput` |
| Update type | `Update{Entity}Input` | `UpdateNoteInput` |
| Record | `{Entity}Record` | `NoteRecord` |
| Schema | `{entity}Schema` | `noteSchema` |
| Status enum | `{Entity}Status` | `NoteStatus` |
| With relation | `{Entity}With{Relation}` | `ProjectWithNotes` |

---

## Required Fields

Every entity MUST have:

```typescript
interface BaseEntity {
  /** Unique identifier */
  id: string;
  
  /** ISO 8601 creation timestamp */
  createdAt: string;
  
  /** ISO 8601 last update timestamp */
  updatedAt: string;
}
```

---

## Optional vs Required

```typescript
// ✅ GOOD: Explicit about optionality
interface Note {
  id: string;              // Required
  title: string;           // Required
  description?: string;    // Optional
  metadata?: NoteMetadata; // Optional
}

// ❌ BAD: Using null
interface Note {
  description: string | null;  // Confusing
}
```

---

## Immutability Pattern

```typescript
// ✅ GOOD: Create new object for updates
function updateNote(note: Note, updates: Partial<Note>): Note {
  return {
    ...note,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
}

// ❌ BAD: Mutating existing object
function updateNote(note: Note, updates: Partial<Note>): Note {
  note.title = updates.title!;  // Mutation!
  return note;
}
```

---

## Documentation Requirements

Every entity must be documented with:

1. **JSDoc comment** explaining purpose
2. **Field descriptions** for all properties
3. **@example** for complex types
4. **Related types** and services

```typescript
/**
 * Represents a user project containing notes and files.
 * 
 * @example
 * const project: Project = {
 *   id: 'proj_123',
 *   name: 'My Notes',
 *   storageType: 'indexeddb',
 *   settings: { defaultNoteType: 'markdown', autoSave: true, autoSaveInterval: 5000 },
 *   createdAt: '2026-01-09T10:00:00Z',
 *   updatedAt: '2026-01-09T10:00:00Z',
 * };
 * 
 * @see ProjectService for CRUD operations
 * @see ProjectSettings for configuration options
 */
export interface Project {
  // ...
}
```

---

## Related Standards

- **API:** `agent-os/standards/backend/api.md`
- **Migrations:** `agent-os/standards/backend/migrations.md`
- **Queries:** `agent-os/standards/backend/queries.md`
- **Validation:** `agent-os/standards/global/validation.md`
