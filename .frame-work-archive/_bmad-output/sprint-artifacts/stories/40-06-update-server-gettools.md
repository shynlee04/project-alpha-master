---
story_key: "40-06-update-server-gettools"
epic: 40
story: 6
status: "DONE"
created_at: "2026-01-10T09:20:00+07:00"
completed_at: "2026-01-10T09:31:00+07:00"
points: 2
---

# Story 40-06: Update Server-Side getTools() with Registry

## User Story

**As a** system architect
**I want** the server-side getTools() function to use the CentralizedToolRegistry
**So that** all authorized tools are exposed to the LLM based on mode, workspace, and permissions

## Acceptance Criteria

### AC-1: getTools() Uses CentralizedToolRegistry
**Given** the CentralizedToolRegistry is initialized
**When** I call getTools() in chat.ts
**Then** it should return tools from toolRegistry.getServerExposedTools()

### AC-2: All Server-Exposed Tools Available
**Given** the tool catalog contains all registered tools
**When** getTools() is called
**Then** all tools with serverExposed=true should be returned

### AC-3: Registry Initialization on First Call
**Given** the tool registry singleton
**When** getTools() is called for the first time
**Then** initializeToolRegistry() should be called to ensure tools are registered

### AC-4: Logging for Debugging
**Given** the getTools() function
**When** it returns tools
**Then** it should log total registered count, server-exposed count, and tool names

## Tasks

- [x] T1: Update chat.ts imports to include toolRegistry and initializeToolRegistry
- [x] T2: Replace hardcoded tool definitions with registry call
- [x] T3: Add logging for debugging tool exposure
- [x] T4: Write unit tests for getTools() function
- [x] T5: Verify TypeScript compilation

## Dev Notes

### Dependencies
- Story 40-01 (Tool Registry) - DONE ✅
- Story 40-04 (Note CRUD Tools) - DONE ✅
- Story 40-05 (Register Note Tools) - DONE ✅

### Integration Points
- Touches: src/routes/api/chat.ts (getTools function, lines 120-135)
- Touches: src/routes/api/__tests__/chat.test.ts (new tests)
- Breaks: None (refactoring existing pattern)

### Implementation Details

The getTools() function should:
1. Call `initializeToolRegistry()` to ensure tools are registered (singleton-safe)
2. Call `toolRegistry.getServerExposedTools()` to get all server-exposed tools
3. Map registered tools to their definitions (tool.definition)
4. Log tool counts for debugging

### Files to Modify
- src/routes/api/chat.ts (already modified, lines 25-27, 120-135)
- src/routes/api/__tests__/chat.test.ts (new tests)

### References

- Epic: `_bmad-output/sprint-artifacts/epic-40-agent-chat-remediation-sprint-2026-01-10.md`
- Story 40-01: Tool Registry (DONE)
- src/infrastructure/tools/centralized-tool-registry.ts
- src/infrastructure/tools/tool-catalog.ts

## Status History

| Status | Timestamp | Agent | Notes |
|--------|-----------|-------|-------|
| backlog | 2026-01-10T12:00:00+07:00 | SM | Created from EPIC-40 remediation |
| in_progress | 2026-01-10T09:20:00+07:00 | Opus | Implementation already done, adding tests |
| DONE | 2026-01-10T09:31:00+07:00 | Opus | All tests passing (9 new tests), implementation verified |

## Dev Agent Record

### Agent
- Model: claude-opus-4-5-20251101
- Session: 2026-01-10T09:20:00+07:00

### Task Progress
- [x] T1: Update chat.ts imports to include toolRegistry and initializeToolRegistry
- [x] T2: Replace hardcoded tool definitions with registry call
- [x] T3: Add logging for debugging tool exposure
- [x] T4: Write unit tests for getTools() function
- [x] T5: Verify TypeScript compilation

### Files Changed
| File | Action | Lines |
|------|--------|-------|
| src/routes/api/chat.ts | Modified | Lines 25-27 (imports), 120-135 (getTools function) - ALREADY DONE |
| src/routes/api/__tests__/chat.test.ts | Created | 80 lines (2 tests) |
| src/infrastructure/tools/__tests__/tool-catalog-contents.test.ts | Created | 56 lines (7 tests) |

### Tests Created
- src/routes/api/__tests__/chat.test.ts: 2 tests passing
- src/infrastructure/tools/__tests__/tool-catalog-contents.test.ts: 7 tests passing
- Total: 9 new tests for story 40-06

### TypeScript Check
✅ PASS - No new TypeScript errors (pre-existing errors in other files are out of scope)

### Test Results
✅ PASS - 9/9 new tests passing
✅ PASS - 75 total tool-related tests passing (36 registry + 8 catalog + 7 catalog contents + 24 note tools)

### Decisions Made
- Decision 1: Keep initializeToolRegistry() call inside getTools() for simplicity
- Decision 2: Use getServerExposedTools() to automatically filter tools
- Decision 3: Add logging for debugging tool count and names

## Code Review

**Reviewer:** claude-opus-4-5-20251101 (self-review)
**Date:** 2026-01-10T09:31:00+07:00

### Checklist
- [x] All ACs verified
- [x] All tests passing
- [x] Architecture patterns followed
- [x] No TypeScript errors (in production code for this story)
- [x] Code quality acceptable

### Issues Found
- **Issue 1**: Vitest mocking with dynamic imports doesn't work well
  - **Fix**: Split tests into separate files - one for mocked tests, one for actual catalog content
  - **Status**: FIXED ✅

- **Issue 2**: Path aliases don't resolve in newly created test files
  - **Fix**: Use relative imports instead of @/ aliases for test files
  - **Status**: FIXED ✅

### Sign-off
[x] APPROVED for merge
