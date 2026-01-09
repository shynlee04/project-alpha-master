---
story_key: "40-05-register-note-tools"
epic: 40
story: 5
status: "in_progress"
created_at: "2026-01-10T13:15:00+07:00"
points: 1
---

# Story 40-05: Register Note Tools in Tool Catalog

## User Story

**As a** system architect
**I want** the Note CRUD tools registered in the centralized tool catalog
**So that** the agent can discover and use these tools during conversation

## Acceptance Criteria

### AC-1: Import All Note Tool Definitions
**Given** the note tool definitions created in story 40-04
**When** I update tool-catalog.ts
**Then** all 5 note tools should be imported

### AC-2: Register Tools in TOOL_CATALOG
**Given** the imported note tool definitions
**When** I add them to TOOL_CATALOG array
**Then** they should be registered with proper metadata (category, modes, workspaces)

### AC-3: Update Tool Counts
**Given** the new note tools registered
**When** I call getToolCountsByCategory()
**Then** it should include a 'notes' category with count of 5

### AC-4: Verify Registry Initialization
**Given** the tool catalog updates
**When** initializeToolRegistry() is called
**Then** all note tools should be available in the registry

## Tasks

- [x] T1: Import all 5 note tool definitions
- [x] T2: Add note tools to TOOL_CATALOG with proper metadata
- [x] T3: Update getToolCountsByCategory to include 'notes' category
- [x] T4: Write unit tests for registration
- [x] T5: Verify TypeScript compilation

## Dev Notes

### Dependencies
- Story 40-01 (Tool Registry) - DONE ✅
- Story 40-04 (Note CRUD Tools) - DONE ✅

### Integration Points
- Touches: src/infrastructure/tools/tool-catalog.ts
- Touches: src/infrastructure/tools/__tests__/tool-catalog.test.ts (new tests)
- Breaks: None (additive change)

### Tool Metadata Configuration

```typescript
// All note tools should be registered with:
{
  definition: <noteToolDef>,
  metadata: createToolMetadata(
    '<tool_name>',
    'notes',        // NEW category
    ['knowledge'],  // Allowed modes
    ['notes', 'knowledge'], // Allowed workspaces
    {
      defaultTrustLevel: 'auto',
      riskLevel: 'low',
      executionSide: 'both'
    }
  )
}
```

### Note Tools to Register
1. create_note - Create a new note
2. read_note - Read a note by ID
3. update_note - Update an existing note
4. delete_note - Delete a note
5. list_notes - List notes with pagination

### Files to Modify
- src/infrastructure/tools/tool-catalog.ts (add imports + catalog entries, ~50 lines)
- src/infrastructure/tools/__tests__/tool-catalog.test.ts (~100 lines)

### References

- Epic: `_bmad-output/sprint-artifacts/epic-40-agent-chat-remediation-sprint-2026-01-10.md`
- Story 40-01: Tool Registry (DONE)
- Story 40-04: Note CRUD Tools (DONE)

## Status History

| Status | Timestamp | Agent | Notes |
|--------|-----------|-------|-------|
| backlog | 2026-01-10T12:00:00+07:00 | SM | Created from EPIC-40 remediation |
| in_progress | 2026-01-10T13:15:00+07:00 | Dev | Story created, implementation started |
