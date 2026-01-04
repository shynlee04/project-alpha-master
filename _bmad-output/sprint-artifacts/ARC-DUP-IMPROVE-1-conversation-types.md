# Story: ARC-DUP-IMPROVE-1

## Story Header

**Epic:** ARC-DUP (Eliminate Dexie Duplication)
**Story:** ARC-DUP-IMPROVE-1
**Title:** "Fix conversation store type mismatches"
**Priority:** P0
**Estimated Hours:** 4
**Assigned Agent:** @bmad-bmm-dev
**Status:** in_progress
**Created:** 2026-01-04

## User Story

**As a** Developer,
**I want** to fix all 67 conversation store type mismatches,
**So that** TypeScript compiles without errors and the conversation consolidation epic can proceed.

## Acceptance Criteria

### AC-1: All 67 conversation store type errors resolved
**Given** 67 TypeScript errors in conversation store slices,
**When** I fix the type mismatches,
**Then** all conversation store files should compile with zero errors.

### AC-2: Type definitions match actual usage patterns
**Given** missing properties like `status`, `projectId`, `threadId`,
**When** I update the type definitions,
**Then** all properties used in code should exist in types.

### AC-3: Zero breaking changes to consumers
**Given** 68 files import conversation store types,
**When** I fix the type mismatches,
**Then** all consumers should continue to work without changes.

### AC-4: Test coverage added for affected code paths
**Given** conversation CRUD operations need testing,
**When** I write tests,
**Then** coverage should be ≥80% for modified files.

## Task Breakdown

- [ ] **T1:** Read conversation store types and identify missing properties
- [ ] **T2:** Update ConversationMetadataWithId type to include missing properties
- [ ] **T3:** Update ThreadWithId type to include missing properties
- [ ] **T4:** Update MessageWithId type to include missing properties
- [ ] **T5:** Fix type mismatches in conversation-validation-slice.ts (25 errors)
- [ ] **T6:** Fix type mismatches in conversation-metadata-slice.ts (10 errors)
- [ ] **T7:** Fix type mismatches in conversation-utils-slice.ts (8 errors)
- [ ] **T8:** Fix type mismatches in message-crud-slice.ts (4 errors)
- [ ] **T9:** Fix type mismatches in useConversationStore.ts (12 errors)
- [ ] **T10:** Write 10 unit tests for conversation CRUD operations
- [ ] **T11:** Run TypeScript validation (target: 0 errors in conversation store)

## Dev Notes

### Root Cause Analysis

**Type Definition File:** `src/infrastructure/persistence/stores/conversation/types.ts`

**Missing Properties:**
- `ConversationMetadataWithId`: Missing `status`, `projectId`, `updatedAt`
- `ThreadWithId`: Missing `status`, `conversationId`, `parentThreadId`, `childThreadIds`, `isRoot`
- `MessageWithId`: Missing `threadId`

**Error Distribution:**
- conversation-validation-slice.ts: 25 errors (uses `status`, `parentThreadId`, `childThreadIds`, `threadId`)
- conversation-metadata-slice.ts: 10 errors (uses `projectId`, `status`, `workspaceType`)
- conversation-utils-slice.ts: 8 errors (uses `updatedAt`, `isRoot`)
- message-crud-slice.ts: 4 errors (uses `threadId`)
- useConversationStore.ts: 12 errors (type compatibility)

### Implementation Strategy

1. **Read types.ts** to understand current type definitions
2. **Add missing properties** to interfaces (with proper types)
3. **Fix slice files** to match updated types
4. **Write tests** for CRUD operations
5. **Validate** with TypeScript compiler

## Research Requirements

**MANDATORY:** Before fixing types, research Zustand v5 store typing patterns.

**MCP Tools Required:**
- Context7: Query Zustand v5 documentation for slice typing patterns
- DeepWiki: Check TanStack store best practices if needed

**Research Commands:**
```bash
# Context7 research
mcp__context7__resolve-library-id: zustand
mcp__context7__query-docs: "How to type Zustand slices with proper interfaces"
```

## References

### Planning Documents
- `_bmad-output/sprint-artifacts/ARC-DUP-VALIDATION-1-verification-report.md` - Error categorization
- `_bmad-output/architecture/source-of-truth/platform-architecture-definitive-2026-01-04.md` - Architecture

### Related Files
- `src/infrastructure/persistence/stores/conversation/types.ts` - Type definitions
- `src/infrastructure/persistence/stores/conversation/conversation-metadata-slice.ts`
- `src/infrastructure/persistence/stores/conversation/conversation-validation-slice.ts`
- `src/infrastructure/persistence/stores/conversation/conversation-utils-slice.ts`
- `src/infrastructure/persistence/stores/conversation/message-crud-slice.ts`
- `src/infrastructure/persistence/stores/conversation/useConversationStore.ts`

## Dev Agent Record

### Files Modified
*To be populated during implementation*

### Files Created
*To be populated during implementation*

### Decisions Made
*To be populated during implementation*

### Tests Written
*To be populated during implementation*

### Issues Encountered
*To be populated during implementation*

## Status History

| Timestamp | Phase | Status | Agent | Notes |
|-----------|-------|--------|-------|-------|
| 2026-01-04T01:30+07:00 | create-story | in_progress | @bmad-bmm-sm | Story created, ready for dev |
