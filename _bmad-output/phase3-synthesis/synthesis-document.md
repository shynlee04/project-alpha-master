# SYNTHESIS: EPIC-40 Agent Chat Tool Enhancement

**Session**: MP-EPIC40-001
**Phase**: 3 (Synthesis & Design Routing)
**Date**: 2026-01-10
**Status**: COMPLETE

---

## Executive Summary

This synthesis combines **Phase 1 Diagnostics** (internal codebase analysis) with **Phase 2 Research** (external industry best practices) to produce a comprehensive design specification for enhancing agent chat capabilities.

### Bottom Line Up Front (BLUF)

**Problem**: Server-side tool limitation (4 tools) blocks agent access to notes, research, RAG, and voice features.

**Solution**: Implement Route D (Integrated Design) - coordinated enhancement across tool registry, CRUD operations, RAG integration, and server-side exposure.

**Effort**: 5-8 implementation cycles

---

## PART 1: PROBLEM RESTATEMENT (With Evidence)

### Root Cause Identified

**File**: [`src/routes/api/chat.ts:118-125`](src/routes/api/chat.ts#L118-L125)

```typescript
function getTools() {
    return [
        readFileDef,
        writeFileDef,
        listFilesDef,
        executeCommandDef,
    ];
}
```

**Evidence**: Only 4 tools hardcoded while 10+ tools exist on client side.

### Impact Assessment

| Feature | Status | Impact |
|---------|--------|--------|
| Note CRUD | ❌ Blocked | Agent cannot create/read/update/delete notes |
| Semantic Search | ❌ Blocked | Agent cannot search notes with RAG |
| Research Tools | ❌ Blocked | Agent cannot process PDF/images/URLs |
| Voice I/O | ❌ Blocked | Agent cannot use voice features |
| File Operations | ✅ Working | Basic read/write/list/execute work |

### User Impact

- **User Journey J1** (Add key → Test connection): Works
- **User Journey J2** (Create note via agent): **Blocked**
- **User Journey J3** (Research via agent): **Blocked**
- **User Journey J4** (Voice interaction): **Blocked**

---

## PART 2: INDUSTRY VALIDATION

### Research Confirms Diagnosis

| Phase 1 Finding | Phase 2 Research Validation |
|-----------------|----------------------------|
| Only 4 tools exposed | Industry standard: 6+ tools for note agents |
| Missing note CRUD | All competitors have CRUD tools |
| search_notes not wired | Agentic RAG pattern requires search + CRUD |
| Hardcoded tool list | Industry: Central tool registry pattern |

### Industry Benchmark (2025)

Competing note-taking AI systems provide:

| Tool | Obsidian AI | Mem X | Notion AI | Our Status |
|------|-------------|-------|-----------|------------|
| search_notes | ✅ | ✅ | ✅ | ⚠️ Not wired |
| create_note | ✅ | ✅ | ✅ | ❌ Missing |
| read_note | ✅ | ✅ | ✅ | ❌ Missing |
| update_note | ✅ | ✅ | ✅ | ❌ Missing |
| delete_note | ✅ | ✅ | ✅ | ❌ Missing |
| list_notes | ✅ | ✅ | ✅ | ❌ Missing |

**Gap**: We are missing 5 of 6 standard note CRUD tools.

---

## PART 3: SOLUTION ARCHITECTURE

### Design Philosophy

Following **Clean Architecture** principles:

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Agent Chat UI                           │  │
│  │  (useAgentChatWithTools Hook)                            │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          DOMAIN                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Tool Registry                           │  │
│  │  • IToolDefinition interface                              │  │
│  │  • Central registration                                   │  │
│  │  • Schema validation (Zod)                                │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                 Tool Implementations                      │  │
│  │  • File Tools (read, write, list, execute)               │  │
│  │  • Note Tools (CRUD + search)                            │  │
│  │  • Research Tools (PDF, image, URL)                      │  │
│  │  • Voice Tools (input, output)                           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       INFRASTRUCTURE                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Stores (Zustand)                       │  │
│  │  • useNoteStore                                           │  │
│  │  • useKnowledgeStore                                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Services                               │  │
│  │  • RAG Retrieval Service                                  │  │
│  │  • Embedding Service                                      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Tool Registry Pattern

```typescript
// Domain: Tool definitions
interface IToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodType;
  handler: ToolHandler;
  permissions: Permission[];
  category: ToolCategory;
}

// Infrastructure: Registry implementation
class ToolRegistry {
  private tools = new Map<string, IToolDefinition>();

  register(tool: IToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): IToolDefinition | undefined {
    return this.tools.get(name);
  }

  list(category?: ToolCategory): IToolDefinition[] {
    return category
      ? Array.from(this.tools.values()).filter(t => t.category === category)
      : Array.from(this.tools.values());
  }

  // Server-side: Filter by permissions
  getAuthorized(userPermissions: Permission[]): IToolDefinition[] {
    return Array.from(this.tools.values())
      .filter(tool => tool.permissions.every(p => userPermissions.includes(p)));
  }
}
```

---

## PART 4: DESIGN SPECIFICATION - ROUTE D

### Cycle D.1: Tool Registry & CRUD Creation (2-3 cycles)

#### D.1.1: Create Tool Registry Infrastructure
**File**: `src/domain/tools/tool-registry.ts`

**Deliverables**:
- `IToolDefinition` interface
- `ToolRegistry` class
- Zod schema definitions for tool parameters
- Category enums (FILE, NOTE, RESEARCH, VOICE)

#### D.1.2: Implement Note CRUD Tools
**Files**:
- `src/domain/tools/note/create-note-tool.ts`
- `src/domain/tools/note/read-note-tool.ts`
- `src/domain/tools/note/update-note-tool.ts`
- `src/domain/tools/note/delete-note-tool.ts`
- `src/domain/tools/note/list-notes-tool.ts`

**Tool Specifications**:

| Tool | Parameters | Returns | Store Method |
|------|------------|---------|--------------|
| `create_note` | `{ title, content, folderId? }` | `{ id, title, content }` | `createNote()` |
| `read_note` | `{ id }` | `{ id, title, content }` | `getNoteById()` |
| `update_note` | `{ id, content? }` | `{ id, title, content }` | `updateNote()` |
| `delete_note` | `{ id }` | `{ success }` | `deleteNote()` |
| `list_notes` | `{ folderId?, limit?, page? }` | `{ notes, total }` | `getNotes()` |

#### D.1.3: Wire search_notes to Factory
**File**: `src/lib/agent/factory.ts`

**Change**: Add `searchNotesDef` to tool exports
**Integration**: Ensure tool is registered in central registry

### Cycle D.2: RAG Context Integration (1-2 cycles)

#### D.2.1: Update Prompt Composer Layer 3
**File**: `src/lib/agent/prompt-composer.ts`

**Changes**:
- Add RAG context injection to Layer 3
- Include relevant notes based on semantic similarity
- Balance automatic vs manual retrieval

**Prompt Structure**:
```
Layer 1: System role & capabilities
Layer 2: User context & permissions
Layer 3: RAG context (relevant notes) ← NEW
Layer 4: Available tools ← UPDATED
Layer 5: Current task
```

#### D.2.2: Implement Hybrid RAG Pattern

```typescript
// Automatic: Background RAG for context
const ragContext = await ragService.getRelevantNotes(query, { limit: 5 });

// Manual: Agent can explicitly search
const searchResults = await agent.tools.search_notes(query);
```

### Cycle D.3: Server-Side Integration (1 cycle)

#### D.3.1: Update chat.ts Tool Export
**File**: `src/routes/api/chat.ts`

**Before**:
```typescript
function getTools() {
  return [readFileDef, writeFileDef, listFilesDef, executeCommandDef];
}
```

**After**:
```typescript
function getTools() {
  return toolRegistry.getAuthorized(userPermissions);
}
```

#### D.3.2: Add Server-Side Filtering
- Validate user permissions before tool exposure
- Log tool usage for observability
- Return 403 for unauthorized tool access

### Cycle D.4: Testing & Validation (1-2 cycles)

#### D.4.1: Unit Tests
- Test each tool implementation
- Test registry operations
- Test permission filtering

#### D.4.2: Integration Tests
- Test agent can call each tool
- Test RAG context injection
- Test end-to-end user journeys

#### D.4.3: E2E User Journeys
- J1: Add key → Test connection ✅ (already works)
- J2: Create note via agent ← NEW
- J3: Research via agent ← NEW
- J4: Voice interaction ← FUTURE

---

## PART 5: RISKS & CONSIDERATIONS

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Store API changes | Medium | Medium | Use facades, adapt to changes |
| RAG performance | Low | High | Implement caching, limits |
| Permission bypass | Low | Critical | Server-side validation |
| Tool naming conflicts | Low | Low | Namespaced categories |

### Implementation Considerations

1. **Backward Compatibility**: Maintain existing 4 tools during transition
2. **Performance**: RAG retrieval should be <500ms
3. **Security**: All tool access validated server-side
4. **Observability**: Log all tool executions

---

## PART 6: SUCCESS CRITERIA

### Must Have (P0)
- [ ] All 5 note CRUD tools implemented
- [ ] search_notes wired to LLM
- [ ] Server exposes all tools via registry
- [ ] Agent can create/read/update/delete notes
- [ ] Tests passing

### Should Have (P1)
- [ ] RAG context in Layer 3 prompt
- [ ] Permission filtering
- [ ] Tool usage logging
- [ ] Error handling for tool failures

### Nice to Have (P2)
- [ ] Voice tools exposed
- [ ] Research tools (PDF/image) exposed
- [ ] Tool performance metrics

---

## PART 7: ALTERNATIVE ROUTES

### Route A: Quick Fix (2-3 cycles)
- Only update `getTools()` to include existing tools
- No new tools created
- Faster but incomplete

### Route B: Multi-Agent Framework (10+ cycles)
- Implement full multi-agent orchestration
- Conditional routing, parallel execution
- Future scope, not current need

### Route C: System Prompts Only (1 cycle)
- Only update Layer 3 for RAG context
- No tool changes
- Partial fix only

### Route D: Integrated Design (Recommended)
- Coordinates tools, RAG, and server integration
- Comprehensive solution
- **Selected for implementation**

---

## HANDOFF TO PHASE 4

This synthesis provides:

1. ✅ Problem restatement with evidence
2. ✅ Industry validation of approach
3. ✅ Solution architecture
4. ✅ Detailed design specifications for Route D
5. ✅ Risk assessment
6. ✅ Success criteria
7. ✅ Implementation breakdown by cycle

**Next**: User authorization for Phase 4 (Implementation)

---

**Status**: Ready for Phase 4 authorization
