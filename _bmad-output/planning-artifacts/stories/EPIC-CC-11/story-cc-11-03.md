---
# Story CC-11-03: Update Main Store (Compose)

## Metadata

```yaml
story_id: "CC-11-03"
epic_id: "EPIC-CC-11"
title: "Update Main Store (Compose)"
created_at: "2026-01-22T08:30:00+07:00"
status: "completed"
effort: "0.5h"
team: "B"
priority: "P2"
depends_on: ["CC-11-01", "CC-11-02"]
```

## Context

Update `unified-chat-store.ts` to compose store from 6 focused slices (5 existing + 1 new).

### Slice Composition

```typescript
// Existing slices (already composed)
1. createChatMetadataSlice      // Conversation CRUD
2. createThreadManagementSlice     // Thread hierarchy
3. createMessageCrudSlice          // Message operations
4. createToolExecutionSlice        // Tool call tracking
5. createContextWindowSlice        // Context window (MM-09)

// New slice (CC-11-01)
6. createChatPersistenceSlice       // Dexie persistence
```

## Acceptance Criteria

- [x] Main store imports all 6 slices
- [x] Store composed from slices (no inline persistence methods)
- [x] Target: ~200 lines total (down from 448 lines)
- [x] Keep `createDebouncedPersist()` removed (now in persistence slice)
- [x] No breaking changes to Team A's hooks fix
- [x] TypeScript errors: 0

## Implementation Results

### Files Modified

```yaml
modified:
  - path: "src/infrastructure/persistence/stores/chat/unified-chat-store.ts"
    reason: "CC-11-03: Compose store from 6 slices"
    lines_before: 448
    lines_after: 200
    reduction_percentage: 55%
```

### Changes Made

```yaml
imports_added:
  - import { createChatPersistenceSlice } from './slices/chat-persistence-slice';

imports_removed:
  - import type { ConversationState } from '@/domain/entities/chat';
  - import { getDb } from '@/infrastructure/persistence/dexie-db';

slice_composition_added:
  - ...createChatPersistenceSlice(...a),

inline_methods_removed:
  - createDebouncedPersist() function (30 lines)
  - persistConversation() method (7 lines)
  - getCurrentConversation() method (52 lines)
  - loadConversation() method (140 lines)
  - loadConversationByProject() method (28 lines)
  total_inline_removed: 257 lines
```

### Line Metrics

```yaml
file_metrics:
  original_lines: 448
  final_lines: 200
  lines_removed: 248
  reduction_percentage: 55%
  slice_imports: 6
  inline_methods: 0
```

## Testing

- [x] All 6 slices imported
- [x] Store composed correctly
- [x] TypeScript compilation successful
- [x] No breaking changes to exports
- [x] No breaking changes to Team A

## Dependencies

- CC-11-01: Must complete persistence slice creation first
- CC-11-02: Must verify context window slice exists

## Team A Compatibility Verification

```yaml
team_a_imports_check:
  grep_search: "from '@/infrastructure/persistence/stores/chat/unified-chat-store'"
  routes_search: "0 results"
  components_search: "0 results"
  lib_search: "0 results"
  conclusion: "✅ NO BREAKING CHANGES - Team A does not import this store"
```

## Notes

- Original createDebouncedPersist function moved to persistence slice
- All inline persistence methods removed from main file
- Main file now purely composes slices + convenience hooks
- Store interface unchanged (backward compatible)

## Governance Compliance

- [x] ADR-033: God Store pattern eliminated
- [x] ADR-014: Slice pattern implemented (S-014b)
- [x] ADR-035: Store in canonical infrastructure path
- [x] File Tree: Proper layer separation (infrastructure/persistence/stores/chat/slices/)
- [x] Clean Architecture: Main file composes, slices implement

## Story Status

**Status**: COMPLETED
**Completed At**: 2026-01-22T08:45:00+07:00
**Assignee**: Team B (dev-ext)

## Next Steps

- CC-11-04: Update Import Paths (if needed)
- Verify no consumers need path updates
- Update sprint status to mark EPIC-CC-11 complete
