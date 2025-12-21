# Data Model Standards (Client-Side)

> **Last Updated:** 2025-12-21  
> **Applies to:** Via-Gent (Project Alpha)

---

## Architecture Note

Via-Gent stores data in **IndexedDB**. Models are defined as TypeScript interfaces with Zod schemas for validation.

---

## Core Data Models

### Project Metadata

```typescript
// src/types/project.ts
export interface ProjectMetadata {
  id: string;                              // UUID
  name: string;                            // User-provided name
  folderPath: string;                      // FSA folder path
  fsaHandle: FileSystemDirectoryHandle | null;
  openFiles: string[];                     // Currently open file paths
  layoutState: LayoutConfig | null;        // Panel sizes, active tab
  lastOpened: Date;                        // For sorting
  createdAt: Date;
}

export const ProjectMetadataSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  folderPath: z.string(),
  openFiles: z.array(z.string()),
  lastOpened: z.coerce.date(),
  createdAt: z.coerce.date(),
});
```

### Conversation State

```typescript
export interface ConversationState {
  id: string;
  projectId: string;
  messages: Message[];
  toolResults: ToolResult[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Model Design Principles

| Principle | Application |
|-----------|-------------|
| **Timestamps** | All models have `createdAt`, `updatedAt` |
| **UUIDs** | Use `crypto.randomUUID()` for IDs |
| **Optional Fields** | Mark nullable fields explicitly |
| **Zod + TypeScript** | Schema and type in sync |

---

## IndexedDB Indexes

```typescript
// Define indexes for query patterns
this.version(1).stores({
  projects: 'id, name, lastOpened',  // id=primary, name+lastOpened=secondary
  conversations: 'id, projectId, updatedAt',
});
```

---

## General Practices

- **Clear Naming**: Singular for types (`Project`), plural for tables (`projects`)
- **Timestamps**: Always include for debugging
- **Type Safety**: Infer types from Zod with `z.infer<T>`
- **Indexes**: Add for frequently queried fields
- **Validation**: Validate before storing, not just on read
