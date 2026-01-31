---
phase: 02-schema-definitions
plan: 02
subsystem: domain
tags: [zod, typescript, thread, note, schema, project-centric]

# Dependency graph
requires:
  - phase: 02-01
    provides: Project and File schemas with project-centric model
provides:
  - Thread schema with ThreadMessage and ThreadToolCall
  - Note schema with NoteTreeNode for hierarchical display
  - Complete domain schema barrel with 4 entity types
affects: [03-state-stores, dexie-migration, ai-chat-plugin, notes-plugin]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Project-centric model: All entities use projectId only, no workspaceId"
    - "Recursive Zod schemas using z.lazy() for hierarchical data"

key-files:
  created:
    - src/domain/schemas/thread.schema.ts
    - src/domain/schemas/note.schema.ts
  modified:
    - src/domain/schemas/index.ts

key-decisions:
  - "Thread uses projectId only - no workspaceId field"
  - "Note uses projectId only - no workspaceId field"
  - "ThreadMessage embedded in Thread (not separate entity)"
  - "NoteTreeNode separate from Note for UI rendering optimization"

patterns-established:
  - "z.lazy() for recursive tree schemas (ThreadHierarchyNode, NoteTreeNode)"
  - "Param schemas derived via .omit() and .partial() for CRUD operations"

# Metrics
duration: 3min
completed: 2026-01-31
---

# Phase 02 Plan 02: Thread and Note Schemas Summary

**Thread and Note Zod schemas with project-centric model - NO workspaceId fields**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-31T04:09:17Z
- **Completed:** 2026-01-31T04:12:27Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Created canonical Thread schema with ThreadMessage and ThreadToolCall sub-schemas
- Created canonical Note schema with NoteTreeNode for hierarchical UI display
- Both schemas use projectId as ONLY anchor - NO workspaceId anywhere
- Updated barrel to export all 4 entity types (Project, File, Thread, Note)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Thread Schema** - `7fc92cb0` (feat)
2. **Task 2: Create Note Schema** - `0f14382a` (feat)
3. **Task 3: Update barrel exports** - `1d9dd1cc` (feat)

## Files Created/Modified

- `src/domain/schemas/thread.schema.ts` - Thread, ThreadMessage, ThreadToolCall, ThreadHierarchyNode schemas (171 lines)
- `src/domain/schemas/note.schema.ts` - Note, NoteTreeNode schemas (133 lines)
- `src/domain/schemas/index.ts` - Complete barrel with all 4 entity types (100 lines)

## Decisions Made

1. **ThreadMessage embedded in Thread** - Messages are part of Thread, not separate table. Simplifies queries and maintains data locality.
2. **NoteTreeNode separate from Note** - UI rendering uses lightweight tree node, not full Note data. Reduces data transfer for sidebar.
3. **Recursive schemas use z.lazy()** - Required for TypeScript to handle circular type references in hierarchical data.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed successfully.

## Next Phase Readiness

- Thread and Note schemas ready for Dexie table definitions
- Project-centric model consistently applied across all 4 entity types
- No blockers for Phase 03 (Store Definitions)

---
*Phase: 02-schema-definitions*
*Completed: 2026-01-31*
