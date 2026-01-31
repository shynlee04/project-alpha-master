---
story_key: "40-04-create-note-crud-tools"
epic: 40
story: 4
status: "drafted"
created_at: "2026-01-10T12:53:00+07:00"
points: 2
---

# Story 40-04: Create Note CRUD Tool Definitions

## User Story

**As a** system architect
**I want** Note CRUD tools defined using TanStack AI toolDefinition pattern
**So that** the agent can create, read, update, delete, and list notes via tool calls

## Acceptance Criteria

### AC-1: create_note Tool Definition
**Given** the TanStack AI toolDefinition pattern
**When** I define create_note tool
**Then** it should accept title, content, and optional folderId parameters

### AC-2: read_note Tool Definition
**Given** an existing note
**When** I define read_note tool
**Then** it should accept noteId and return note content

### AC-3: update_note Tool Definition
**Given** an existing note
**When** I define update_note tool
**Then** it should accept noteId and content parameters

### AC-4: delete_note Tool Definition
**Given** an existing note
**When** I define delete_note tool
**Then** it should accept noteId and delete the note

### AC-5: list_notes Tool Definition
**Given** multiple notes exist
**When** I define list_notes tool
**Then** it should accept pagination parameters (limit, offset)

### AC-6: All Tools Tagged with KNOWLEDGE Mode
**Given** the centralized tool registry
**When** I register all note tools
**Then** they should be tagged with 'knowledge' mode in allowedModes

## Tasks

- [ ] T1: Define create_note tool with title, content, folderId schema
- [ ] T2: Define read_note tool with noteId schema
- [ ] T3: Define update_note tool with noteId, content schema
- [ ] T4: Define delete_note tool with noteId schema
- [ ] T5: Define list_notes tool with pagination schema
- [ ] T6: Tag all tools with KNOWLEDGE mode
- [ ] T7: Write unit tests for tool definitions
- [ ] T8: Verify TypeScript compilation

## Dev Notes

### Dependencies
- Story 40-01 (Tool Registry) - DONE ✅
- TanStack AI toolDefinition pattern
- Existing note store at src/infrastructure/persistence/stores/note-store.ts

### Integration Points
- Touches: src/domain/tools/note/ (new directory for note tools)
- Touches: src/lib/agent/tools/ (existing tools)
- Touches: src/infrastructure/tools/tool-catalog.ts (register note tools)
- Breaks: None (additive change)

### Files to Create
- src/domain/tools/note/create-note-tool.ts (~60 lines) - Tool definition
- src/domain/tools/note/read-note-tool.ts (~50 lines) - Tool definition
- src/domain/tools/note/update-note-tool.ts (~60 lines) - Tool definition
- src/domain/tools/note/delete-note-tool.ts (~50 lines) - Tool definition
- src/domain/tools/note/list-notes-tool.ts (~60 lines) - Tool definition
- src/domain/tools/note/index.ts (~20 lines) - Barrel export
- src/domain/tools/note/__tests__/note-tools.test.ts (~200 lines) - Unit tests

### Tool Definition Pattern (TanStack AI)

```typescript
import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';

// 1. Define schema
const createNoteDef = toolDefinition({
  name: 'create_note',
  description: 'Create a new note with title and content',
  inputSchema: z.object({
    title: z.string().min(1).describe('Note title'),
    content: z.string().describe('Note content (markdown supported)'),
    folderId: z.string().optional().describe('Optional folder ID'),
  }),
  outputSchema: z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    createdAt: z.string(),
  }),
});

// 2. Export definition for registration
export { createNoteDef };
```

### Tool Registration Pattern

```typescript
// In tool-catalog.ts
import { createNoteDef } from '@/domain/tools/note/create-note-tool';

export const TOOL_CATALOG = [
  // ... existing tools
  {
    definition: createNoteDef,
    metadata: createToolMetadata(
      'create_note',
      'knowledge',
      ['knowledge'], // allowedModes
      ['notes', 'knowledge'], // allowedWorkspaces
      { serverExposed: true, executionSide: 'both' }
    ),
  },
  // ... other note tools
];
```

### References

- Epic: `_bmad-output/sprint-artifacts/epic-40-agent-chat-remediation-sprint-2026-01-10.md`
- Story 40-01: Tool Registry (DONE)
- TanStack AI: /tanstack/ai (docs via Context7)
- Related Stories: 40-05 (search_notes), 40-06 (Server Integration)

## Status History

| Status | Timestamp | Agent | Notes |
|--------|-----------|-------|-------|
| backlog | 2026-01-10T10:00:00+07:00 | SM | Created from EPIC-40 remediation |
| drafted | 2026-01-10T12:53:00+07:00 | SM | Story file created |
