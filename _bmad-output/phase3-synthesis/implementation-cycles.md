# Implementation Cycle Breakdown - Route D

**Session**: MP-EPIC40-001
**Route**: D (Integrated Design)
**Estimated Cycles**: 5-8
**Date**: 2026-01-10

---

## CYCLE D.1: Tool Registry Infrastructure

**Duration**: 1 cycle
**Agent**: architecture-remediation → code

### Deliverables

1. **Domain Interface** (`src/domain/tools/tool-registry.ts`)
   - `IToolDefinition` interface
   - `ToolCategory` enum
   - `Permission` type

2. **Registry Implementation** (`src/infrastructure/tools/tool-registry-impl.ts`)
   - `ToolRegistry` class
   - Register/get/list methods
   - Authorization filtering

3. **Zod Schemas** (`src/domain/tools/schemas/`)
   - Common parameter schemas
   - Tool response schemas

### Code Template

```typescript
// src/domain/tools/tool-registry.ts
import { z } from 'zod';

export enum ToolCategory {
  FILE = 'file',
  NOTE = 'note',
  RESEARCH = 'research',
  VOICE = 'voice',
}

export enum Permission {
  READ_FILES = 'read_files',
  WRITE_FILES = 'write_files',
  MANAGE_NOTES = 'manage_notes',
  EXECUTE_COMMANDS = 'execute_commands',
}

export interface IToolDefinition {
  name: string;
  description: string;
  category: ToolCategory;
  parameters: z.ZodType;
  handler: (params: unknown) => Promise<unknown>;
  permissions: Permission[];
}

export interface IToolRegistry {
  register(tool: IToolDefinition): void;
  get(name: string): IToolDefinition | undefined;
  list(category?: ToolCategory): IToolDefinition[];
  getAuthorized(permissions: Permission[]): IToolDefinition[];
}
```

### Acceptance Criteria
- [ ] Registry compiles without errors
- [ ] Can register and retrieve tools
- [ ] Permission filtering works
- [ ] Unit tests pass

---

## CYCLE D.2: Note CRUD Tools Implementation

**Duration**: 1-2 cycles
**Agent**: feature-dev

### Deliverables

1. **create_note Tool** (`src/domain/tools/note/create-note-tool.ts`)
2. **read_note Tool** (`src/domain/tools/note/read-note-tool.ts`)
3. **update_note Tool** (`src/domain/tools/note/update-note-tool.ts`)
4. **delete_note Tool** (`src/domain/tools/note/delete-note-tool.ts`)
5. **list_notes Tool** (`src/domain/tools/note/list-notes-tool.ts`)

### Code Template

```typescript
// src/domain/tools/note/create-note-tool.ts
import { z } from 'zod';
import { useNoteStore } from '@/infrastructure/persistence/stores/note-store';
import type { IToolDefinition } from '../tool-registry';

export const createNoteTool: IToolDefinition = {
  name: 'create_note',
  description: 'Create a new note with a title and content',
  category: ToolCategory.NOTE,
  permissions: [Permission.MANAGE_NOTES],

  parameters: z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1),
    folderId: z.string().optional(),
  }),

  handler: async (params) => {
    const { createNote } = useNoteStore.getState();
    const note = await createNote({
      title: params.title,
      content: params.content,
      folderId: params.folderId,
    });
    return { id: note.id, title: note.title, content: note.content };
  },
};
```

### Acceptance Criteria
- [ ] All 5 tools implemented
- [ ] Each tool uses appropriate store method
- [ ] Error handling for invalid inputs
- [ ] TypeScript compilation passes
- [ ] Tools registered in registry

---

## CYCLE D.3: Wire search_notes & Factory Integration

**Duration**: 1 cycle
**Agent**: feature-dev

### Deliverables

1. **search_notes Tool Integration** (`src/lib/agent/factory.ts`)
2. **Registry Integration** (Connect factory to registry)

### Changes Required

```typescript
// src/lib/agent/factory.ts
import { toolRegistry } from '@/infrastructure/tools/tool-registry-impl';
import { searchNotesTool } from '@/domain/tools/note/search-notes-tool';

// Register search_notes tool
toolRegistry.register(searchNotesTool);

// Export for client compatibility
export const searchNotesDef = {
  name: 'search_notes',
  description: searchNotesTool.description,
  parameters: searchNotesTool.parameters,
};
```

### Acceptance Criteria
- [ ] search_notes tool registered
- [ ] Factory exports tool definition
- [ ] Client can import and use tool
- [ ] TypeScript compilation passes

---

## CYCLE D.4: Server-Side Integration

**Duration**: 1 cycle
**Agent**: backend-development

### Deliverables

1. **Update chat.ts** (`src/routes/api/chat.ts`)
2. **Add tool authorization middleware**

### Changes Required

```typescript
// src/routes/api/chat.ts
import { toolRegistry } from '@/infrastructure/tools/tool-registry-impl';
import { getUserPermissions } from '../lib/auth/permissions';

function getTools(req: Request) {
  const userPermissions = getUserPermissions(req);
  return toolRegistry.getAuthorized(userPermissions);
}

// Update the chat route
export const POST = async (req: Request) => {
  const tools = getTools(req);
  // ... rest of implementation
};
```

### Acceptance Criteria
- [ ] getTools() uses registry
- [ ] Permission filtering implemented
- [ ] All authorized tools exposed to LLM
- [ ] Server starts without errors
- [ ] Tools accessible via /api/chat

---

## CYCLE D.5: RAG Context Integration

**Duration**: 1 cycle
**Agent**: feature-dev

### Deliverables

1. **Update prompt-composer.ts** (Add Layer 3 RAG context)
2. **RAG retrieval service integration**

### Changes Required

```typescript
// src/lib/agent/prompt-composer.ts
import { ragService } from '@/infrastructure/rag/rag-service';

export async function composePrompt(
  context: AgentContext
): Promise<string> {
  const layers = [
    Layer1_SystemRole(context),
    Layer2_UserContext(context),
    Layer3_RAGContext(context), // NEW
    Layer4_AvailableTools(context), // UPDATED
    Layer5_CurrentTask(context),
  ];

  return layers.join('\n\n');
}

async function Layer3_RAGContext(context: AgentContext): Promise<string> {
  if (!context.query) return '';

  const relevantNotes = await ragService.getRelevantNotes(context.query, {
    limit: 5,
    threshold: 0.7,
  });

  if (relevantNotes.length === 0) return '';

  return `RELEVANT NOTES:\n${relevantNotes.map(n =>
    `- ${n.title}: ${n.snippet}`
  ).join('\n')}`;
}
```

### Acceptance Criteria
- [ ] Layer 3 adds RAG context to prompt
- [ ] RAG retrieval performs <500ms
- [ ] Context limited to prevent overflow
- [ ] Agent can reference relevant notes

---

## CYCLE D.6: Testing & Validation

**Duration**: 1-2 cycles
**Agent**: test-automator

### Deliverables

1. **Unit Tests** (`src/__tests__/tools/`)
2. **Integration Tests** (`src/__tests__/integration/tool-integration.test.ts`)
3. **E2E User Journey Tests** (`src/__tests__/e2e/agent-journeys.test.ts`)

### Test Coverage

| Test Type | Coverage Goal | Key Scenarios |
|-----------|---------------|---------------|
| Unit | 80%+ | Each tool handler, registry operations |
| Integration | Key paths | Tool → Store → Response |
| E2E | User journeys | J2: Create note via agent |

### Test Template

```typescript
// src/__tests__/tools/create-note-tool.test.ts
import { describe, it, expect } from 'vitest';
import { createNoteTool } from '@/domain/tools/note/create-note-tool';

describe('create_note tool', () => {
  it('should create a note with valid parameters', async () => {
    const result = await createNoteTool.handler({
      title: 'Test Note',
      content: 'Test content',
    });

    expect(result).toHaveProperty('id');
    expect(result.title).toBe('Test Note');
  });

  it('should reject invalid parameters', async () => {
    await expect(createNoteTool.handler({
      title: '', // Invalid: empty title
      content: 'Test',
    })).rejects.toThrow();
  });
});
```

### Acceptance Criteria
- [ ] All tests passing
- [ ] Coverage ≥80%
- [ ] E2E user journeys pass
- [ ] No TypeScript errors

---

## IMPLEMENTATION ORDER

```
D.1: Tool Registry ─────┐
                        ├──▶ D.4: Server Integration
D.2: Note CRUD ─────────┤          │
                        │          ▼
D.3: search_notes ──────┴─────▶ D.5: RAG Integration
                                             │
                                             ▼
                                      D.6: Testing
```

**Critical Path**: D.1 → D.4 → D.5 → D.6
**Parallel Work**: D.2 and D.3 can run concurrently after D.1

---

## RISK MITIGATION

| Risk | Mitigation |
|------|------------|
| Store API changes | Use store facades, wrap in try-catch |
| RAG performance | Implement caching, set limits |
| Permission bypass | Server-side validation only |
| Tool naming conflicts | Use namespaced prefixes |

---

## EXIT CRITERIA

Route D is complete when:

- [ ] All 5 note CRUD tools implemented and working
- [ ] search_notes wired and accessible
- [ ] Tool registry operational
- [ ] Server exposes all authorized tools
- [ ] RAG context in prompts
- [ ] Tests passing (≥80% coverage)
- [ ] E2E user journey J2 passes

---

**Ready for Phase 4 Implementation**
