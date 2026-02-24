# RAG, Tools, and Fail-Safe Architecture

**Researched:** 2026-01-31
**Confidence:** HIGH (Context7 Orama/TanStack AI verified)
**Purpose:** Complete the schema architecture with RAG embeddings, thread indexing, AI tools, and fail-safe mechanisms

---

## Executive Summary

Three schema areas were missing from our architecture:
1. **RAG Embeddings** - Where do indexed project assets live?
2. **Thread Indexing** - How do AI agents retrieve past conversations?
3. **AI Tools** - What's the schema for tool definitions and permissions?

This document closes these gaps and adds **fail-safe mechanisms** to catch architectural mistakes early.

---

## Part 1: RAG Embeddings Schema

### The Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PROJECT                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
    ┌───────────┐     ┌───────────┐     ┌───────────┐
    │   FILES   │     │  THREADS  │     │   NOTES   │
    └─────┬─────┘     └─────┬─────┘     └─────┬─────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                     USER TRIGGERS INDEXING
                            │
                            ▼
                    ┌───────────────┐
                    │  RAG INDEX    │  ← Orama (in-memory + persist to IndexedDB)
                    │  (per project) │
                    └───────────────┘
                            │
                    AI QUERIES RAG
                            │
                            ▼
                    ┌───────────────┐
                    │  CHAT PLUGIN  │  ← Displays results
                    └───────────────┘
```

### RAG Index Schema

The RAG index is **NOT a Dexie table**. It's an **Orama instance per project**, persisted to IndexedDB via `@orama/plugin-data-persistence`.

```typescript
// @/domain/schemas/rag.schema.ts
import { z } from 'zod';
import { EntityIdSchema, ProjectOwnedSchema } from './foundation.schema';

// ═══════════════════════════════════════════════════════════════
// RAG INDEX: Orama schema (NOT Dexie)
// ═══════════════════════════════════════════════════════════════

// What gets indexed (stored in Orama)
export const RAGDocumentSchema = z.object({
  id: EntityIdSchema,                    // Unique document ID
  projectId: EntityIdSchema,             // Owner project
  sourceType: z.enum(['file', 'thread', 'note']),  // What was indexed
  sourceId: EntityIdSchema,              // ID of source entity
  sourcePath: z.string().optional(),     // For files: relative path
  content: z.string(),                   // Text content (for full-text search)
  embedding: z.array(z.number()),        // Vector embedding (512 dimensions)
  metadata: z.object({
    title: z.string().optional(),
    mimeType: z.string().optional(),
    tokenCount: z.number().optional(),
    indexedAt: z.date(),
  }),
});
export type RAGDocument = z.infer<typeof RAGDocumentSchema>;

// Orama schema definition (matches our Zod schema)
export const ORAMA_RAG_SCHEMA = {
  id: 'string',
  projectId: 'string',
  sourceType: 'string',
  sourceId: 'string',
  sourcePath: 'string',
  content: 'string',
  embedding: 'vector[512]',  // TensorFlow.js generates 512-dim vectors
  'metadata.title': 'string',
  'metadata.mimeType': 'string',
  'metadata.tokenCount': 'number',
  'metadata.indexedAt': 'string',
} as const;
```

### RAG Index Metadata (stored in Dexie)

While the actual vectors live in Orama, we track **index metadata** in Dexie for relationship integrity:

```typescript
// @/domain/schemas/rag-metadata.schema.ts
import { z } from 'zod';
import { ProjectOwnedSchema, EntityIdSchema } from './foundation.schema';

// ═══════════════════════════════════════════════════════════════
// RAG INDEX METADATA: Stored in Dexie for relationship tracking
// ═══════════════════════════════════════════════════════════════

export const RAGIndexMetadataSchema = ProjectOwnedSchema.extend({
  // Index statistics
  documentCount: z.number(),
  lastIndexedAt: z.date(),
  indexSizeBytes: z.number(),
  
  // What's been indexed
  indexedFiles: z.array(EntityIdSchema),      // FileMetadata IDs
  indexedThreads: z.array(EntityIdSchema),    // Thread IDs
  indexedNotes: z.array(EntityIdSchema),      // Note IDs
  
  // Status
  status: z.enum(['empty', 'indexing', 'ready', 'error']),
  errorMessage: z.string().optional(),
});
export type RAGIndexMetadata = z.infer<typeof RAGIndexMetadataSchema>;
```

### Relationship Diagram

```
┌──────────────┐
│   Project    │
├──────────────┤
│ id           │────┐
│ ...          │    │
└──────────────┘    │
       │            │
       │ 1:1        │ 1:N
       ▼            │
┌──────────────┐    │
│RAGIndexMeta  │    │
├──────────────┤    │
│ projectId ◄──────┘
│ indexedFiles │────┐
│ indexedThreads│   │
│ indexedNotes │    │ references
└──────────────┘    │
       │            │
       │ owns       ▼
       ▼     ┌──────────────┐
┌──────────────┐  │ FileMetadata │
│ Orama Index  │  │ Thread       │
│ (in-memory)  │  │ Note         │
├──────────────┤  └──────────────┘
│ RAGDocument  │
│ RAGDocument  │
│ ...          │
└──────────────┘
```

---

## Part 2: Thread Indexing for RAG

### The Problem

AI agents need to retrieve past chat sessions for context. This means:
1. Thread messages must be indexable
2. AI can query: "What did we discuss about X?"
3. Results returned to current thread

### Thread Indexing Flow

```
Thread → Messages → Concatenate Content → Generate Embedding → Store in RAG Index
```

### Thread RAG Schema

Threads are indexed as RAG documents:

```typescript
// In rag.schema.ts - already covered by sourceType: 'thread'

// How thread content is prepared for indexing:
function prepareThreadForRAG(thread: Thread): RAGDocumentInput {
  // Concatenate all messages into searchable content
  const content = thread.messages
    .map(m => `${m.role}: ${m.content}`)
    .join('\n\n');
  
  return {
    sourceType: 'thread',
    sourceId: thread.id,
    projectId: thread.projectId,
    content,
    metadata: {
      title: thread.title,
      tokenCount: thread.metadata.tokenCount,
      indexedAt: new Date(),
    },
  };
}
```

### RAG Query from Thread

When AI needs context from past threads:

```typescript
// @/domain/services/rag.service.ts

async function queryRAG(
  projectId: string,
  query: string,
  options?: {
    sourceTypes?: ('file' | 'thread' | 'note')[];
    limit?: number;
    similarity?: number;
  }
): Promise<RAGResult[]> {
  const oramaIndex = await getProjectIndex(projectId);
  
  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);
  
  // Search with filters
  const results = await search(oramaIndex, {
    mode: 'hybrid',  // Full-text + vector
    term: query,
    vector: {
      value: queryEmbedding,
      property: 'embedding',
    },
    where: options?.sourceTypes 
      ? { sourceType: options.sourceTypes }
      : undefined,
    similarity: options?.similarity ?? 0.75,
    limit: options?.limit ?? 10,
  });
  
  return results.hits;
}
```

---

## Part 3: AI Tools Schema

### The Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     TOOL DEFINITIONS                             │
│           (static, defined in code, not persisted)               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                   GRANTED TO THREAD
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         THREAD                                   │
│              (has: availableTools[], toolPermissions)            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                   AI INVOKES TOOL
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      TOOL CALL                                   │
│              (stored in ThreadMessage)                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                   TOOL EXECUTES
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     TOOL RESULT                                  │
│              (stored in ThreadMessage, may create File)          │
└─────────────────────────────────────────────────────────────────┘
```

### Tool Definition Schema

Tool definitions are **code-defined, not persisted**. They use TanStack AI SDK patterns:

```typescript
// @/domain/schemas/tool.schema.ts
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// TOOL DEFINITIONS: Static definitions, not persisted
// ═══════════════════════════════════════════════════════════════

export const ToolPermissionLevelSchema = z.enum([
  'read',      // Can read files, query RAG
  'write',     // Can create/modify files
  'execute',   // Can run terminal commands
  'admin',     // Full access (dangerous)
]);
export type ToolPermissionLevel = z.infer<typeof ToolPermissionLevelSchema>;

export const ToolDefinitionSchema = z.object({
  name: z.string(),                        // Unique tool name
  description: z.string(),                 // For AI understanding
  category: z.enum(['file', 'rag', 'terminal', 'system']),
  requiredPermissions: z.array(ToolPermissionLevelSchema),
  inputSchema: z.unknown(),                // Zod schema (any type)
  outputSchema: z.unknown(),               // Zod schema (any type)
  needsApproval: z.boolean().default(false),  // Require user confirmation
});
export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;

// Tool registry (static, code-defined)
export const TOOL_REGISTRY: Record<string, ToolDefinition> = {
  // ═══════════════════════════════════════════════════════════
  // FILE TOOLS
  // ═══════════════════════════════════════════════════════════
  'read_file': {
    name: 'read_file',
    description: 'Read the contents of a file',
    category: 'file',
    requiredPermissions: ['read'],
    inputSchema: z.object({
      path: z.string().describe('Relative path to file'),
    }),
    outputSchema: z.object({
      content: z.string(),
      mimeType: z.string(),
    }),
    needsApproval: false,
  },
  'write_file': {
    name: 'write_file',
    description: 'Create or update a file',
    category: 'file',
    requiredPermissions: ['write'],
    inputSchema: z.object({
      path: z.string().describe('Relative path to file'),
      content: z.string().describe('File content'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      path: z.string(),
    }),
    needsApproval: true,  // User must approve writes
  },
  'delete_file': {
    name: 'delete_file',
    description: 'Delete a file',
    category: 'file',
    requiredPermissions: ['write'],
    inputSchema: z.object({
      path: z.string().describe('Relative path to file'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
    }),
    needsApproval: true,  // User must approve deletes
  },
  
  // ═══════════════════════════════════════════════════════════
  // RAG TOOLS
  // ═══════════════════════════════════════════════════════════
  'search_project': {
    name: 'search_project',
    description: 'Search project files, threads, and notes using RAG',
    category: 'rag',
    requiredPermissions: ['read'],
    inputSchema: z.object({
      query: z.string().describe('Search query'),
      sourceTypes: z.array(z.enum(['file', 'thread', 'note'])).optional(),
      limit: z.number().optional(),
    }),
    outputSchema: z.object({
      results: z.array(z.object({
        sourceType: z.string(),
        sourcePath: z.string().optional(),
        content: z.string(),
        similarity: z.number(),
      })),
    }),
    needsApproval: false,
  },
  
  // ═══════════════════════════════════════════════════════════
  // TERMINAL TOOLS
  // ═══════════════════════════════════════════════════════════
  'run_command': {
    name: 'run_command',
    description: 'Execute a terminal command',
    category: 'terminal',
    requiredPermissions: ['execute'],
    inputSchema: z.object({
      command: z.string().describe('Command to execute'),
      cwd: z.string().optional().describe('Working directory'),
    }),
    outputSchema: z.object({
      stdout: z.string(),
      stderr: z.string(),
      exitCode: z.number(),
    }),
    needsApproval: true,  // Always require approval for commands
  },
};
```

### Thread Tool Permissions

Per-thread tool permissions are stored in the Thread entity:

```typescript
// @/domain/schemas/thread-tools.schema.ts
import { z } from 'zod';
import { ToolPermissionLevelSchema } from './tool.schema';

// ═══════════════════════════════════════════════════════════════
// THREAD TOOL PERMISSIONS: Stored per-thread
// ═══════════════════════════════════════════════════════════════

export const ThreadToolPermissionsSchema = z.object({
  // Global permissions for this thread
  grantedPermissions: z.array(ToolPermissionLevelSchema),
  
  // Specific tool overrides
  toolOverrides: z.record(z.string(), z.object({
    enabled: z.boolean(),
    autoApprove: z.boolean().default(false),  // Skip approval for this tool
  })).optional(),
  
  // Audit log of tool usage
  toolUsageCount: z.record(z.string(), z.number()).optional(),
});
export type ThreadToolPermissions = z.infer<typeof ThreadToolPermissionsSchema>;

// Extended Thread schema (adds tool permissions)
export const ThreadWithToolsSchema = ThreadSchema.extend({
  toolPermissions: ThreadToolPermissionsSchema,
  availableTools: z.array(z.string()),  // Tool names from registry
});
export type ThreadWithTools = z.infer<typeof ThreadWithToolsSchema>;
```

### Tool Call and Result in Messages

Tool calls and results are embedded in ThreadMessage:

```typescript
// @/domain/schemas/tool-call.schema.ts
import { z } from 'zod';
import { EntityIdSchema } from './foundation.schema';

// ═══════════════════════════════════════════════════════════════
// TOOL CALL: Embedded in ThreadMessage
// ═══════════════════════════════════════════════════════════════

export const ToolCallSchema = z.object({
  id: EntityIdSchema,                    // Unique call ID
  toolName: z.string(),                  // From TOOL_REGISTRY
  args: z.unknown(),                     // Parsed arguments
  status: z.enum(['pending', 'approved', 'rejected', 'running', 'completed', 'failed']),
  requestedAt: z.date(),
  approvedAt: z.date().optional(),
  approvedBy: z.enum(['user', 'auto']).optional(),
});
export type ToolCall = z.infer<typeof ToolCallSchema>;

export const ToolResultSchema = z.object({
  callId: EntityIdSchema,                // Links to ToolCall.id
  output: z.unknown(),                   // Tool output (matches outputSchema)
  error: z.string().optional(),          // Error message if failed
  executedAt: z.date(),
  durationMs: z.number(),
  
  // Side effects tracking
  createdFiles: z.array(z.string()).optional(),    // Paths of files created
  modifiedFiles: z.array(z.string()).optional(),   // Paths of files modified
  deletedFiles: z.array(z.string()).optional(),    // Paths of files deleted
});
export type ToolResult = z.infer<typeof ToolResultSchema>;

// Updated ThreadMessage to include tool data
export const ThreadMessageWithToolsSchema = ThreadMessageSchema.extend({
  toolCalls: z.array(ToolCallSchema).optional(),
  toolResults: z.array(ToolResultSchema).optional(),
});
export type ThreadMessageWithTools = z.infer<typeof ThreadMessageWithToolsSchema>;
```

### Complete Relationship Diagram

```
┌──────────────┐
│   Project    │
└──────┬───────┘
       │ 1:N
       ▼
┌──────────────┐       ┌───────────────────┐
│   Thread     │──────▶│ ThreadToolPerms   │ (embedded)
├──────────────┤       ├───────────────────┤
│ id           │       │ grantedPermissions│
│ projectId    │       │ toolOverrides     │
│ messages[]   │       │ availableTools[]  │
│ toolPerms ◄──┼───────┴───────────────────┘
└──────┬───────┘
       │ 1:N (embedded)
       ▼
┌──────────────┐       ┌──────────────┐
│ThreadMessage │──────▶│  ToolCall    │ (embedded)
├──────────────┤       ├──────────────┤
│ id           │       │ id           │
│ role         │       │ toolName     │
│ content      │       │ args         │
│ toolCalls[] ◄├───────┤ status       │
│ toolResults[]│       └──────────────┘
└──────────────┘
       │
       ▼
┌──────────────┐       ┌──────────────┐
│  ToolResult  │──────▶│ Side Effects │
├──────────────┤       ├──────────────┤
│ callId       │       │ createdFiles │
│ output       │       │ modifiedFiles│
│ error        │       │ deletedFiles │
└──────────────┘       └──────────────┘
       │
       │ may create/modify
       ▼
┌──────────────┐
│ FileMetadata │
└──────────────┘


TOOL_REGISTRY (static, code-defined)
┌─────────────────────────────────────┐
│ read_file    │ write_file │ ...    │
├─────────────────────────────────────┤
│ Not persisted - defined in code    │
└─────────────────────────────────────┘
```

---

## Part 4: Fail-Safe Architecture

### The Problem

How do we catch architectural mistakes EARLY, not after "oops I did fuck up"?

### Multi-Layer Fail-Safe System

```
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 1: COMPILE-TIME (TypeScript)                              │
│ - Type errors caught immediately                                 │
│ - Schema mismatches fail build                                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 2: LINT-TIME (ESLint + Custom Rules)                      │
│ - Import path violations                                         │
│ - Schema duplication detection                                   │
│ - God file prevention (>300 lines)                               │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 3: TEST-TIME (Vitest)                                     │
│ - Schema relationship tests                                      │
│ - Invariant assertions                                           │
│ - Integration flow tests                                         │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 4: RUNTIME (Zod + Assertions)                             │
│ - Boundary validation (all external data)                        │
│ - Invariant checks (business rules)                              │
│ - Relationship integrity                                         │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 5: OBSERVABILITY (Monitoring)                             │
│ - Schema validation failure logs                                 │
│ - Relationship integrity alerts                                  │
│ - Performance anomaly detection                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Layer 1: Compile-Time Guards

```typescript
// @/domain/schemas/guards.ts

// 1. Enforce entity relationships at compile time
type ValidForeignKey<T extends { id: string }> = T['id'];

interface FileMetadata {
  id: string;
  projectId: ValidForeignKey<Project>;  // Compile error if Project changes
}

// 2. Prevent invalid plugin combinations at type level
type CorePlugin = 'file-tree' | 'chat';
type OptionalPlugin = 'monaco' | 'notes' | 'terminal' | 'preview';
type PluginType = CorePlugin | OptionalPlugin;

// Core plugins must always be in the array
type ValidPluginSet = [CorePlugin, CorePlugin, ...OptionalPlugin[]];
```

### Layer 2: Lint-Time Guards

```javascript
// .eslintrc.cjs

module.exports = {
  rules: {
    // Prevent importing from wrong locations
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['**/entities/*'],
          message: 'Import from @/domain/schemas instead',
        },
        {
          group: ['@/lib/*'],
          message: 'Use @/domain/* or @/infrastructure/*',
        },
      ],
    }],
  },
  
  // Custom plugin for schema governance
  plugins: ['schema-governance'],
  rules: {
    'schema-governance/no-duplicate-types': 'error',
    'schema-governance/require-zod-schema': 'error',
    'schema-governance/enforce-relationships': 'error',
  },
};
```

### Layer 3: Test-Time Guards

```typescript
// @/domain/schemas/__tests__/schema-integrity.test.ts

import { describe, it, expect } from 'vitest';
import * as schemas from '../index';

describe('Schema Integrity', () => {
  // 1. All entities must extend base
  it('all project-owned entities have projectId', () => {
    const projectOwned = [
      schemas.FileMetadataSchema,
      schemas.ThreadSchema,
      schemas.NoteSchema,
    ];
    
    for (const schema of projectOwned) {
      expect(schema.shape.projectId).toBeDefined();
    }
  });
  
  // 2. No circular dependencies
  it('entity relationships are acyclic', () => {
    const relationships = getEntityRelationships();
    expect(hasCycle(relationships)).toBe(false);
  });
  
  // 3. Foreign keys reference valid entities
  it('all foreign keys reference existing entities', () => {
    const foreignKeys = extractForeignKeys(schemas);
    for (const fk of foreignKeys) {
      expect(schemas[fk.references]).toBeDefined();
    }
  });
  
  // 4. Plugin schemas extend base schemas
  it('plugin extensions properly extend base schemas', () => {
    const baseFileSchema = schemas.FileMetadataSchema;
    const monacoFileSchema = schemas.MonacoFileMetadataSchema;
    
    // Monaco should have all base fields plus extensions
    for (const key of Object.keys(baseFileSchema.shape)) {
      expect(monacoFileSchema.shape[key]).toBeDefined();
    }
  });
});

describe('Tool Registry Integrity', () => {
  it('all tools have valid permission levels', () => {
    for (const tool of Object.values(schemas.TOOL_REGISTRY)) {
      for (const perm of tool.requiredPermissions) {
        expect(['read', 'write', 'execute', 'admin']).toContain(perm);
      }
    }
  });
  
  it('all tools have input and output schemas', () => {
    for (const tool of Object.values(schemas.TOOL_REGISTRY)) {
      expect(tool.inputSchema).toBeDefined();
      expect(tool.outputSchema).toBeDefined();
    }
  });
});
```

### Layer 4: Runtime Guards

```typescript
// @/domain/services/validation.service.ts

import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// RUNTIME VALIDATION: Fail fast at boundaries
// ═══════════════════════════════════════════════════════════════

export class ValidationService {
  // Validate ALL external data at boundaries
  validateAtBoundary<T extends z.ZodType>(
    schema: T,
    data: unknown,
    context: string
  ): z.infer<T> {
    const result = schema.safeParse(data);
    
    if (!result.success) {
      console.error(`[VALIDATION FAILED] ${context}:`, result.error.issues);
      
      // In development, throw to catch immediately
      if (import.meta.env.DEV) {
        throw new ValidationError(context, result.error);
      }
      
      // In production, log and return safe default or throw
      throw new ValidationError(context, result.error);
    }
    
    return result.data;
  }
  
  // Assert business invariants
  assertInvariant(condition: boolean, message: string): asserts condition {
    if (!condition) {
      console.error(`[INVARIANT VIOLATED] ${message}`);
      throw new InvariantError(message);
    }
  }
}

// Usage in services:
class FileService {
  async createFile(data: unknown): Promise<FileMetadata> {
    // 1. Validate at boundary
    const validated = validation.validateAtBoundary(
      CreateFileSchema,
      data,
      'FileService.createFile'
    );
    
    // 2. Assert business invariants
    validation.assertInvariant(
      validated.projectId !== undefined,
      'File must belong to a project'
    );
    
    // 3. Proceed with validated data
    return this.internalCreateFile(validated);
  }
}
```

### Layer 5: Relationship Integrity Checks

```typescript
// @/domain/services/integrity.service.ts

// ═══════════════════════════════════════════════════════════════
// RELATIONSHIP INTEGRITY: Catch orphans and broken references
// ═══════════════════════════════════════════════════════════════

export class IntegrityService {
  // Run periodically or on app start
  async checkIntegrity(): Promise<IntegrityReport> {
    const issues: IntegrityIssue[] = [];
    
    // 1. Check for orphaned files (no project)
    const orphanedFiles = await db.files
      .filter(f => !f.projectId)
      .toArray();
    if (orphanedFiles.length > 0) {
      issues.push({
        type: 'orphaned_entity',
        entity: 'FileMetadata',
        count: orphanedFiles.length,
        severity: 'high',
      });
    }
    
    // 2. Check for broken project references
    const allFiles = await db.files.toArray();
    const projectIds = new Set((await db.projects.toArray()).map(p => p.id));
    const brokenRefs = allFiles.filter(f => !projectIds.has(f.projectId));
    if (brokenRefs.length > 0) {
      issues.push({
        type: 'broken_reference',
        entity: 'FileMetadata',
        field: 'projectId',
        count: brokenRefs.length,
        severity: 'critical',
      });
    }
    
    // 3. Check RAG index consistency
    const ragMeta = await db.ragIndexMetadata.toArray();
    for (const meta of ragMeta) {
      const actualCount = await getOramaDocCount(meta.projectId);
      if (actualCount !== meta.documentCount) {
        issues.push({
          type: 'count_mismatch',
          entity: 'RAGIndex',
          expected: meta.documentCount,
          actual: actualCount,
          severity: 'medium',
        });
      }
    }
    
    return {
      checkedAt: new Date(),
      issueCount: issues.length,
      issues,
      healthy: issues.filter(i => i.severity === 'critical').length === 0,
    };
  }
}
```

### Early Warning Dashboard

```typescript
// @/presentation/components/dev/IntegrityDashboard.tsx

// Only in development mode
export function IntegrityDashboard() {
  const { data: report } = useQuery({
    queryKey: ['integrity'],
    queryFn: () => integrityService.checkIntegrity(),
    refetchInterval: 60_000,  // Check every minute in dev
  });
  
  if (!report || report.healthy) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-red-900 text-white p-4 rounded">
      <h3>⚠️ Integrity Issues ({report.issueCount})</h3>
      {report.issues.map(issue => (
        <div key={issue.type}>
          [{issue.severity}] {issue.entity}: {issue.type}
        </div>
      ))}
    </div>
  );
}
```

---

## Summary: Complete Schema Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                         PROJECT                                  │
│                    (root entity, owns all)                       │
└──────────────┬────────────────┬──────────────┬─────────────────┘
               │                │              │
         1:N   │          1:N   │        1:N   │           1:1
               ▼                ▼              ▼                ▼
        ┌──────────┐     ┌──────────┐   ┌──────────┐    ┌───────────┐
        │  Files   │     │ Threads  │   │  Notes   │    │RAGIndexMeta│
        └────┬─────┘     └────┬─────┘   └────┬─────┘    └─────┬─────┘
             │                │              │                │
     indexed │        indexed │      indexed │          owns  │
             │                │              │                │
             └────────────────┼──────────────┘                │
                              │                               │
                              ▼                               ▼
                    ┌──────────────────┐            ┌──────────────┐
                    │   RAG DOCUMENTS   │◄──────────│  Orama Index │
                    │ (in Orama, not Dexie)│        │  (per project)│
                    └──────────────────┘            └──────────────┘


        ┌──────────┐          ┌──────────────────┐
        │ Threads  │─────────▶│ThreadToolPerms   │
        │          │          │(embedded)        │
        └────┬─────┘          └──────────────────┘
             │
       1:N   │ (embedded)
             ▼
        ┌──────────────┐      ┌──────────────┐
        │ThreadMessage │─────▶│ ToolCall     │
        │              │      │ ToolResult   │
        │              │      │ (embedded)   │
        └──────────────┘      └──────┬───────┘
                                     │
                               may create/modify
                                     │
                                     ▼
                              ┌──────────────┐
                              │ FileMetadata │
                              └──────────────┘


STATIC REGISTRIES (code-defined, not persisted):
┌─────────────────────────────────────────────────────────────────┐
│ TOOL_REGISTRY          │ PLUGIN_REGISTRY                        │
├─────────────────────────┼───────────────────────────────────────┤
│ read_file              │ file-tree (core)                       │
│ write_file             │ chat (core)                            │
│ delete_file            │ monaco (write)                         │
│ search_project         │ notes (write)                          │
│ run_command            │ terminal (write)                       │
│                        │ preview (read-only)                    │
└─────────────────────────┴───────────────────────────────────────┘
```

---

## Sources

- Context7: Orama vector search, embeddings, schema
- Context7: TanStack AI SDK tool definitions
- Exa: AI agent tool calling patterns, permissions
- WebSearch: DDD relationship patterns
- Existing research documents

**Confidence:** HIGH

