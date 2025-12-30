---
id: "26-3"
title: "Ask My Notes RAG Tool"
status: "drafted"
created: "2025-01-02T20:10:00+07:00"
epic: 26
phase: "phase-2-extended"
priority: "P1"
story_points: 3
sprint: "2025-W01"
assigned_to: "dev"
---

# Story 26.3: Ask My Notes RAG Tool

## Story Header

**As a** user chatting with the AI,
**I want** the agent to be able to search and retrieve content from my notes,
**So that** I can use my personal knowledge base as context for answering questions.

---

## Acceptance Criteria

### AC-1: Tool Definition
**Given** the agent needs information from notes
**When** it calls `search_notes`
**Then** the tool accepts `query` (string) and optional `limit` (number)
**And** validates input using Zod schema

### AC-2: Search Execution
**Given** a valid `search_notes` call
**When** the tool executes
**Then** it searches the Orama index using `searchNoteIndex` or equivalent
**And** filters results to ensure relevance
**And** returns a JSON string of matching notes (title, content snippet, score)

### AC-3: Permission & Security
**Given** the tool is executed
**When** permissions are checked
**Then** it allows execution (read-only safe tool)
**And** logs execution to `ToolExecutionLogger`

### AC-4: Integration
**Given** a user asks a question about their notes (e.g., "What did I write about React?")
**When** the agent processes the prompt
**Then** it selects `search_notes` tool
**And** uses the returned content to answer the question

---

## Technical Tasks

### T1: Create Search Notes Tool
- [x] Create `src/lib/agent/tools/search-notes-tool.ts`
- [x] Define `searchNotesTool` with Zod schema
- [x] Implement execution logic calling `NoteRetriever` / `NoteRetriever`

### T2: Create Note Retriever Service
- [x] Create `src/lib/notes/note-retriever.ts`
- [x] Implement `searchNotes(query, limit)` function
- [x] Use `searchIndex` from `src/lib/rag/orama-index.ts`
- [x] Format results for LLM consumption (concise, relevant)

### T3: Request Tool Registration
- [x] Export tool from `src/lib/agent/tools/index.ts`
- [x] Register tool in `src/lib/agent/agent-config.ts` (via getClientTools)

### T4: Unit Tests
- [x] Create `src/lib/agent/tools/__tests__/search-notes-tool.test.ts`
- [x] Test schema validation
- [x] Test execution with mock retriever
- [x] Test empty results handling

---

## Research Requirements

| Tool | Query | Purpose |
|------|-------|---------|
| Context7 | TanStack AI tool definition | Verify tool schema syntax |
| DeepWiki | Orama search filters | How to filter by "type: note" if mixed index |

---

## Dev Notes

### Pattern: Tool Implementation
- Follow `read-file-tool.ts` pattern for structure.
- Use `ToolExecutionLogger` for observability.

### Pattern: Search
- We share the Orama index (`projectId`).
- Documents might be mixed (files + notes).
- In `note-retriever.ts`, consider filtering by `sourceId` or `metadata` if possible, otherwise return all relevant hits.
- Note `sourceId` is a UUID. Files are likely paths.

---

## Status History

| Date | Status | Notes |
|------|--------|-------|
| 2025-01-02 | drafted | Story created |
| 2025-01-02 | done | Implemented tool, retriever, and tests |
