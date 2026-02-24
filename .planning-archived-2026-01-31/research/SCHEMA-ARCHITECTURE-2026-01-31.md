# Schema Architecture: Unified Types for Plugin Extensibility

**Researched:** 2026-01-31
**Confidence:** HIGH (DDD + TypeScript patterns verified)
**Purpose:** Define unified base types that ALL plugins extend, ensuring schema relationships and extensibility

---

## Executive Summary

The problem: "Every plugin has all sort of different schema interfaces and not engineering toward schema relationships."

The solution: A **unified schema layer** where:
1. All entities extend from **base types** with common fields
2. Plugins **extend** base types, never duplicate
3. Relationships are **typed contracts** enforced at compile time
4. Schema versioning enables **backward-compatible evolution**

---

## Core Principles

```
1. Single source of truth: Each entity type defined ONCE in @/domain/schemas/
2. Base types first: Common fields (id, timestamps, projectId) defined in base
3. Plugins extend, not duplicate: Plugin-specific fields via type extension
4. Zod for runtime: TypeScript types derived from Zod schemas
5. Relationships are explicit: Foreign keys and cardinality defined in schema
```

---

## The Schema Hierarchy

### Level 1: Foundation Types

These are the absolute base types everything builds on:

```typescript
// @/domain/schemas/foundation.schema.ts
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// FOUNDATION: Every entity in the system shares these fields
// ═══════════════════════════════════════════════════════════════

export const EntityIdSchema = z.string().uuid();
export type EntityId = z.infer<typeof EntityIdSchema>;

export const TimestampsSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Timestamps = z.infer<typeof TimestampsSchema>;

export const BaseEntitySchema = z.object({
  id: EntityIdSchema,
}).merge(TimestampsSchema);
export type BaseEntity = z.infer<typeof BaseEntitySchema>;

// All project-owned entities have this
export const ProjectOwnedSchema = BaseEntitySchema.extend({
  projectId: EntityIdSchema,
});
export type ProjectOwned = z.infer<typeof ProjectOwnedSchema>;
```

### Level 2: Domain Entities

Each core entity extends from foundation:

```typescript
// @/domain/schemas/project.schema.ts
import { z } from 'zod';
import { BaseEntitySchema, EntityIdSchema } from './foundation.schema';

// ═══════════════════════════════════════════════════════════════
// PROJECT: Root entity - owns all other entities
// ═══════════════════════════════════════════════════════════════

export const StorageTypeSchema = z.enum(['fsa', 'indexeddb']);
export type StorageType = z.infer<typeof StorageTypeSchema>;

export const PluginTypeSchema = z.enum([
  'file-tree',
  'chat', 
  'monaco',
  'notes',
  'terminal',
  'preview',
]);
export type PluginType = z.infer<typeof PluginTypeSchema>;

export const ProjectSettingsSchema = z.object({
  defaultPlugin: PluginTypeSchema,
  enabledPlugins: z.array(PluginTypeSchema),
  theme: z.enum(['light', 'dark']).optional(),
});
export type ProjectSettings = z.infer<typeof ProjectSettingsSchema>;

export const ProjectSchema = BaseEntitySchema.extend({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  storageType: StorageTypeSchema,
  settings: ProjectSettingsSchema,
});
export type Project = z.infer<typeof ProjectSchema>;
```

```typescript
// @/domain/schemas/file.schema.ts
import { z } from 'zod';
import { ProjectOwnedSchema } from './foundation.schema';

// ═══════════════════════════════════════════════════════════════
// FILE: Project-owned entity for file system entries
// ═══════════════════════════════════════════════════════════════

export const SyncStatusSchema = z.enum(['synced', 'pending', 'conflict', 'error']);
export type SyncStatus = z.infer<typeof SyncStatusSchema>;

export const FileMetadataSchema = ProjectOwnedSchema.extend({
  relativePath: z.string(),
  name: z.string(),
  isDirectory: z.boolean(),
  size: z.number().optional(),
  mimeType: z.string().optional(),
  syncStatus: SyncStatusSchema,
});
export type FileMetadata = z.infer<typeof FileMetadataSchema>;

// Content stored separately (not in Dexie for large files)
export const FileContentSchema = z.object({
  id: z.string(),  // Same as FileMetadata.id
  content: z.union([z.string(), z.instanceof(Uint8Array)]),
});
export type FileContent = z.infer<typeof FileContentSchema>;
```

```typescript
// @/domain/schemas/thread.schema.ts
import { z } from 'zod';
import { ProjectOwnedSchema, EntityIdSchema } from './foundation.schema';

// ═══════════════════════════════════════════════════════════════
// THREAD: Project-owned entity for AI conversations
// ═══════════════════════════════════════════════════════════════

export const MessageRoleSchema = z.enum(['user', 'assistant', 'system', 'tool']);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

export const ThreadMessageSchema = z.object({
  id: EntityIdSchema,
  role: MessageRoleSchema,
  content: z.string(),
  toolCalls: z.array(z.unknown()).optional(),
  toolResults: z.array(z.unknown()).optional(),
  createdAt: z.date(),
});
export type ThreadMessage = z.infer<typeof ThreadMessageSchema>;

export const ThreadMetadataSchema = z.object({
  tokenCount: z.number(),
  contextFiles: z.array(z.string()).optional(),
  ragEnabled: z.boolean(),
});
export type ThreadMetadata = z.infer<typeof ThreadMetadataSchema>;

export const ThreadSchema = ProjectOwnedSchema.extend({
  title: z.string(),
  model: z.string(),
  provider: z.string(),
  messages: z.array(ThreadMessageSchema),
  metadata: ThreadMetadataSchema,
});
export type Thread = z.infer<typeof ThreadSchema>;
```

```typescript
// @/domain/schemas/note.schema.ts
import { z } from 'zod';
import { ProjectOwnedSchema } from './foundation.schema';

// ═══════════════════════════════════════════════════════════════
// NOTE: Project-owned entity for BlockNote documents
// ═══════════════════════════════════════════════════════════════

// BlockNote's native block type - kept as unknown for flexibility
export const BlockNoteContentSchema = z.array(z.unknown());
export type BlockNoteContent = z.infer<typeof BlockNoteContentSchema>;

export const NoteSchema = ProjectOwnedSchema.extend({
  title: z.string(),
  filePath: z.string().optional(),  // If synced to file system
  content: BlockNoteContentSchema,
  tags: z.array(z.string()).optional(),
  linkedFiles: z.array(z.string()).optional(),
});
export type Note = z.infer<typeof NoteSchema>;
```

### Level 3: Plugin-Specific Extensions

Plugins extend base schemas with their specific fields:

```typescript
// @/domain/schemas/plugin-extensions/monaco.schema.ts
import { z } from 'zod';
import { FileMetadataSchema } from '../file.schema';

// ═══════════════════════════════════════════════════════════════
// MONACO EXTENSIONS: Editor-specific metadata
// ═══════════════════════════════════════════════════════════════

// Extends FileMetadata with Monaco-specific fields
export const MonacoFileMetadataSchema = FileMetadataSchema.extend({
  language: z.string().optional(),  // Detected language
  encoding: z.string().default('utf-8'),
  lineEnding: z.enum(['lf', 'crlf']).default('lf'),
  cursorPosition: z.object({
    line: z.number(),
    column: z.number(),
  }).optional(),
});
export type MonacoFileMetadata = z.infer<typeof MonacoFileMetadataSchema>;
```

```typescript
// @/domain/schemas/plugin-extensions/notes.schema.ts
import { z } from 'zod';
import { NoteSchema } from '../note.schema';

// ═══════════════════════════════════════════════════════════════
// NOTES EXTENSIONS: BlockNote-specific metadata
// ═══════════════════════════════════════════════════════════════

export const NotesPluginMetadataSchema = NoteSchema.extend({
  lastViewPosition: z.object({
    blockId: z.string(),
    offset: z.number(),
  }).optional(),
  aiSuggestionsEnabled: z.boolean().default(true),
  exportFormat: z.enum(['markdown', 'html', 'json']).optional(),
});
export type NotesPluginMetadata = z.infer<typeof NotesPluginMetadataSchema>;
```

```typescript
// @/domain/schemas/plugin-extensions/chat.schema.ts
import { z } from 'zod';
import { ThreadSchema } from '../thread.schema';

// ═══════════════════════════════════════════════════════════════
// CHAT EXTENSIONS: AI-specific metadata
// ═══════════════════════════════════════════════════════════════

export const ChatToolDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.unknown()),
  permissions: z.array(z.enum(['read', 'write', 'execute'])),
});
export type ChatToolDefinition = z.infer<typeof ChatToolDefinitionSchema>;

export const ChatPluginThreadSchema = ThreadSchema.extend({
  availableTools: z.array(ChatToolDefinitionSchema),
  systemPromptVersion: z.string().optional(),
  cascadeId: z.string().optional(),  // For multi-turn conversations
});
export type ChatPluginThread = z.infer<typeof ChatPluginThreadSchema>;
```

---

## Schema Relationships

### Explicit Foreign Keys

```typescript
// @/domain/schemas/relationships.ts

// ═══════════════════════════════════════════════════════════════
// RELATIONSHIP DEFINITIONS: Cardinality and constraints
// ═══════════════════════════════════════════════════════════════

export const ENTITY_RELATIONSHIPS = {
  Project: {
    hasMany: ['FileMetadata', 'Thread', 'Note'],
    ownedBy: null,  // Root entity
  },
  FileMetadata: {
    hasMany: [],
    ownedBy: 'Project',
    foreignKey: 'projectId',
  },
  Thread: {
    hasMany: ['ThreadMessage'],  // Embedded, not separate table
    ownedBy: 'Project',
    foreignKey: 'projectId',
  },
  Note: {
    hasMany: [],
    ownedBy: 'Project',
    foreignKey: 'projectId',
  },
} as const;

// Type-safe relationship helper
export type EntityRelationship<T extends keyof typeof ENTITY_RELATIONSHIPS> = 
  typeof ENTITY_RELATIONSHIPS[T];
```

### Cross-Entity References

```typescript
// @/domain/schemas/references.ts
import { z } from 'zod';
import { EntityIdSchema } from './foundation.schema';

// ═══════════════════════════════════════════════════════════════
// CROSS-ENTITY REFERENCES: Typed links between entities
// ═══════════════════════════════════════════════════════════════

// When a Note references Files
export const FileReferenceSchema = z.object({
  fileId: EntityIdSchema,
  referenceType: z.enum(['embed', 'link', 'context']),
  createdAt: z.date(),
});
export type FileReference = z.infer<typeof FileReferenceSchema>;

// When a Thread uses Files as context
export const ThreadContextFileSchema = z.object({
  fileId: EntityIdSchema,
  includedAt: z.date(),
  tokenCount: z.number().optional(),
});
export type ThreadContextFile = z.infer<typeof ThreadContextFileSchema>;
```

---

## Service Contracts

### The Service Interface Pattern

All services follow the same contract pattern:

```typescript
// @/domain/interfaces/service.interface.ts
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// SERVICE INTERFACE: Standard CRUD + query contract
// ═══════════════════════════════════════════════════════════════

export interface EntityService<
  TSchema extends z.ZodType,
  TCreate extends z.ZodType,
  TUpdate extends z.ZodType,
> {
  // Schema access (for runtime validation)
  readonly schema: TSchema;
  readonly createSchema: TCreate;
  readonly updateSchema: TUpdate;
  
  // CRUD operations
  create(data: z.infer<TCreate>): Promise<z.infer<TSchema>>;
  getById(id: string): Promise<z.infer<TSchema> | null>;
  update(id: string, data: z.infer<TUpdate>): Promise<z.infer<TSchema>>;
  delete(id: string): Promise<void>;
  
  // Query operations
  findByProject(projectId: string): Promise<z.infer<TSchema>[]>;
  
  // Validation
  validate(data: unknown): z.SafeParseReturnType<z.infer<TSchema>, z.infer<TSchema>>;
}
```

### Implementation Example

```typescript
// @/domain/services/file.service.ts
import { FileMetadataSchema, FileMetadata } from '../schemas/file.schema';
import { EntityService } from '../interfaces/service.interface';

// ═══════════════════════════════════════════════════════════════
// FILE SERVICE: Implements EntityService contract
// ═══════════════════════════════════════════════════════════════

export const CreateFileSchema = FileMetadataSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  syncStatus: true,
});

export const UpdateFileSchema = FileMetadataSchema.partial().omit({
  id: true,
  projectId: true,
  createdAt: true,
});

export class FileService implements EntityService<
  typeof FileMetadataSchema,
  typeof CreateFileSchema,
  typeof UpdateFileSchema
> {
  readonly schema = FileMetadataSchema;
  readonly createSchema = CreateFileSchema;
  readonly updateSchema = UpdateFileSchema;
  
  async create(data: z.infer<typeof CreateFileSchema>): Promise<FileMetadata> {
    // Validate at boundary
    const validated = this.createSchema.parse(data);
    
    // Create with generated fields
    const file: FileMetadata = {
      ...validated,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'pending',
    };
    
    // Persist via Dexie
    await db.files.add(file);
    
    // Emit event for plugin coordination
    eventBus.emit('file:created', { projectId: file.projectId, filePath: file.relativePath });
    
    return file;
  }
  
  validate(data: unknown) {
    return this.schema.safeParse(data);
  }
  
  // ... other methods
}
```

---

## Plugin Schema Registration

### The Plugin Schema Contract

Each plugin must register its schema extensions:

```typescript
// @/domain/schemas/plugin-registry.ts
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// PLUGIN SCHEMA REGISTRY: Typed extension registration
// ═══════════════════════════════════════════════════════════════

type PluginSchemaRegistration = {
  pluginType: PluginType;
  extends: {
    entity: string;  // 'FileMetadata' | 'Thread' | 'Note' | etc.
    schema: z.ZodType;
  }[];
  // Plugin-specific schemas (not extending base entities)
  own: Record<string, z.ZodType>;
};

const PLUGIN_SCHEMAS: Record<PluginType, PluginSchemaRegistration> = {
  'file-tree': {
    pluginType: 'file-tree',
    extends: [],  // Uses base FileMetadata as-is
    own: {},
  },
  'chat': {
    pluginType: 'chat',
    extends: [
      { entity: 'Thread', schema: ChatPluginThreadSchema },
    ],
    own: {
      'ToolDefinition': ChatToolDefinitionSchema,
    },
  },
  'monaco': {
    pluginType: 'monaco',
    extends: [
      { entity: 'FileMetadata', schema: MonacoFileMetadataSchema },
    ],
    own: {},
  },
  'notes': {
    pluginType: 'notes',
    extends: [
      { entity: 'Note', schema: NotesPluginMetadataSchema },
    ],
    own: {},
  },
  'terminal': {
    pluginType: 'terminal',
    extends: [],
    own: {
      'TerminalSession': TerminalSessionSchema,
    },
  },
  'preview': {
    pluginType: 'preview',
    extends: [],
    own: {},
  },
};

// Type-safe access to plugin schemas
export function getPluginSchema<T extends PluginType>(
  pluginType: T,
  schemaName: string
): z.ZodType | undefined {
  const registration = PLUGIN_SCHEMAS[pluginType];
  
  // Check extensions first
  const extension = registration.extends.find(e => e.entity === schemaName);
  if (extension) return extension.schema;
  
  // Check own schemas
  return registration.own[schemaName];
}
```

---

## Schema Versioning

For backward-compatible evolution:

```typescript
// @/domain/schemas/versioning.ts
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// SCHEMA VERSIONING: Backward-compatible evolution
// ═══════════════════════════════════════════════════════════════

export const SCHEMA_VERSION = '1.0.0';

// Version wrapper for persisted data
export const VersionedDataSchema = <T extends z.ZodType>(schema: T) => 
  z.object({
    _version: z.string(),
    _migratedAt: z.date().optional(),
    data: schema,
  });

// Migration registry
type Migration = {
  from: string;
  to: string;
  migrate: (data: unknown) => unknown;
};

const MIGRATIONS: Migration[] = [
  // Example: v0.9.0 to v1.0.0 migration
  {
    from: '0.9.0',
    to: '1.0.0',
    migrate: (data: any) => ({
      ...data,
      // Add new required field with default
      syncStatus: data.syncStatus ?? 'synced',
    }),
  },
];

export function migrateToLatest<T>(data: unknown, currentVersion: string): T {
  let result = data;
  let version = currentVersion;
  
  while (version !== SCHEMA_VERSION) {
    const migration = MIGRATIONS.find(m => m.from === version);
    if (!migration) {
      throw new Error(`No migration path from ${version} to ${SCHEMA_VERSION}`);
    }
    result = migration.migrate(result);
    version = migration.to;
  }
  
  return result as T;
}
```

---

## Directory Structure

```
src/domain/schemas/
├── foundation.schema.ts      # Base types (EntityId, Timestamps, ProjectOwned)
├── project.schema.ts         # Project entity
├── file.schema.ts            # FileMetadata, FileContent
├── thread.schema.ts          # Thread, ThreadMessage
├── note.schema.ts            # Note, BlockNoteContent
├── relationships.ts          # Entity relationship definitions
├── references.ts             # Cross-entity reference types
├── plugin-registry.ts        # Plugin schema registration
├── versioning.ts             # Schema versioning and migrations
├── index.ts                  # Barrel export
└── plugin-extensions/
    ├── monaco.schema.ts      # Monaco-specific extensions
    ├── notes.schema.ts       # Notes-specific extensions
    ├── chat.schema.ts        # Chat-specific extensions
    └── terminal.schema.ts    # Terminal-specific types
```

---

## What This Enables

| Problem | Solution |
|---------|----------|
| 6 different FileMetadata definitions | One schema, plugins extend it |
| Plugin schema spaghetti | Centralized registry with typed extensions |
| No runtime validation | Zod schemas at service boundaries |
| Breaking changes break everything | Versioned schemas with migrations |
| Unclear relationships | Explicit foreign keys and cardinality |
| New plugins create new mess | Plugin schema contract enforces structure |

---

## Integration with Existing Research

| Document | Integration |
|----------|-------------|
| **DOMAIN-MODEL** | Base entities implemented as Zod schemas |
| **PLUGIN-CONTRACTS** | Plugin extensions use schema registry |
| **PLUGIN-GOVERNANCE** | Governance types defined in schemas |
| **ARCHITECTURE** | 4-layer state model uses these schemas |

---

## Enforcement

### Compile-Time

```typescript
// TypeScript enforces schema usage
const file: FileMetadata = {
  id: '123',
  projectId: 'abc',
  // TypeScript error: missing required fields
};
```

### Runtime

```typescript
// Zod validates at service boundaries
function createFile(data: unknown): FileMetadata {
  // Throws ZodError if invalid
  return FileMetadataSchema.parse(data);
}
```

### Lint Rules

```javascript
// .eslintrc - Custom rule to enforce schema imports
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": [
        {
          "group": ["**/entities/*"],
          "message": "Import from @/domain/schemas instead"
        }
      ]
    }]
  }
}
```

---

## Sources

- WebSearch: Clean Architecture + Domain-Driven Design 2025
- WebSearch: TypeScript schema-driven architectures 2025
- Context7: Zod validation patterns
- Context7: Zustand slices for modular stores
- Tavily: Parse don't validate principle

**Confidence:** HIGH - Patterns verified with DDD and TypeScript best practices

