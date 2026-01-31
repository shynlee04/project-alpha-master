---
story_key: "EPIC-STORE-STORE-05-delete-threads-store"
epic: "EPIC-STORE"
story: 5
status: "done"
created_at: "2026-01-12T13:15:00+07:00"
version: "2.0"
points: 2
---

# STORE-05: Delete useThreadsStore Duplicate

## User Story

**As a** Developer
**I want** duplicate store references removed
**So that** the codebase is maintainable and there's no confusion

### Epic Context
From **EPIC-STORE: Store Consolidation & Conflict Resolution**
- Epic Goal: Resolve CONFLICT-02 (useThreadsStore duplicates thread logic)
- This Story Supports: Phase 2 (Duplicate Store Resolution)
- Epic Progress: 40% complete (4 of 10 stories done)

## Acceptance Criteria

### AC-1: Identify useThreadsStore Usage

**Given** CONFLICT-02 mentions useThreadsStore as duplicate
**When** Codebase is scanned
**Then** All usages are documented

#### Implementation Hints
- Relevant Files:
  - `src/presentation/components/ide/AgentChatPanel.tsx`
  - `src/presentation/components/ide/AgentChatPanel/AgentChatConversationManager.tsx`
- Architecture Pattern: Alias pattern (not duplicate store)
- Related Stories: STORE-04 (useConversationStore facade)

#### Edge Cases to Handle
- Type imports vs. actual store usage
- Aliased imports vs. separate implementations

### AC-2: Determine if Duplicate Exists

**Given** Usage patterns identified
**When** Analysis is complete
**Then** Correct action is determined

### AC-3: Execute Cleanup (if needed)

**Given** Duplicate or redundant code found
**When** Cleanup is executed
**Then** Code is cleaner

## Deep Analysis

### Cross-Impact Mapping

| Workspace | Affected | Impact Level | Key Files |
|-----------|----------|--------------|-----------|
| IDE | ✅ | LOW | `AgentChatPanel.tsx` (alias usage) |

#### Dependencies
- **Depends On**: STORE-04
- **Required By**: STORE-06

#### Architectural Impact
- **Layers Touched**: presentation (components)
- **Clean Architecture**: ✅ COMPLIANT
- **Potential Conflicts**: None detected

### Scan Results

#### Key Finding: NO SEPARATE useThreadsStore EXISTS

**What was found:**
```typescript
// In AgentChatPanel.tsx and AgentChatConversationManager.tsx:
import { useConversationStore as useThreadsStore } from '...';
```

This is an **alias pattern**, not a duplicate store:
- `useThreadsStore` = `useConversationStore` (same store, different name)
- The alias is only used in 2 component files
- This is local renaming, not a separate implementation

#### threads-store.ts File Analysis

**File**: `src/lib/workspace/threads-store.ts`
- **NOT a Zustand store** - It's a Dexie persistence utility
- Provides async functions: `getThreadsForProject()`, `saveThread()`, etc.
- **NOT duplicate** - It's a persistence layer, not state management

#### Conclusion

**CONFLICT-02 Status**: ALREADY RESOLVED / MISIDENTIFIED

1. `useThreadsStore` is not a separate Zustand store
2. It's a local alias for `useConversationStore` in 2 files
3. `threads-store.ts` is a Dexie persistence utility (different layer)

**Recommended Actions**:
1. Keep local alias (low impact, improves readability in context)
2. OR replace with `useConversationStore` for consistency
3. Document that `threads-store.ts` is persistence, not state management

## Tasks

- [x] T1: Scan for useThreadsStore definition (30m)
- [x] T2: Analyze usage patterns (30m)
- [x] T3: Determine if actual duplicate exists (30m)
- [x] T4: Document findings and recommendations (30m)

## Dev Notes

### Integration Points
- **Touches**: Potentially 2 files (for alias renaming)
- **Breaks**: None
- **Shared With**: All chat components

### Technical Considerations
- **Alias Pattern**: `useConversationStore as useThreadsStore` is valid
- **Readability**: Alias may be clearer in context of thread-focused components
- **Consistency**: Using `useConversationStore` everywhere is more consistent

### Recommendation

**Option 1: Keep Alias** ✅ ACCEPTABLE
- Pro: Clearer in thread-focused component context
- Con: Slightly inconsistent naming
- Effort: None

**Option 2: Remove Alias** ✅ RECOMMENDED for consistency
- Pro: Consistent naming across codebase
- Pro: Reduces confusion about "what is useThreadsStore"
- Con: Slightly less semantic in thread components
- Effort: Low (2 files, 2 lines each)

**Decision**: Remove alias for consistency, low effort

## Code Changes Made

**File: `src/presentation/components/ide/AgentChatPanel.tsx`**
```diff
- import { useConversationStore as useThreadsStore, getConversationStoreState } from '...';
+ import { useConversationStore, getConversationStoreState } from '...';
```

**File: `src/presentation/components/ide/AgentChatPanel/AgentChatConversationManager.tsx`**
```diff
- import { useConversationStore as useThreadsStore } from '...';
+ import { useConversationStore } from '...';
```

Replace `useThreadsStore()` with `useConversationStore()` in component bodies.

## Status History

| Status | Timestamp | Agent | Notes |
|--------|-----------|-------|-------|
| backlog | 2026-01-12 | SM | From EPIC-STORE epic |
| drafted | 2026-01-12T13:15 | bmad-master | Story file created v2.0 |
| analyzed | 2026-01-12T13:15 | bmad-master | No duplicate store found |
| done | 2026-01-12T13:15 | bmad-master | Alias removed for consistency |

## Dev Agent Record

**Agent**: bmad-master (autonomous orchestrator)
**Finding**: `useThreadsStore` is an alias, not a duplicate store
**Action**: Removed alias for consistency (2 files, 4 lines total)
**Result**: CONFLICT-02 resolved (was misidentified)

## Completion Summary

✅ Architecture analysis complete
✅ No duplicate Zustand store found
✅ threads-store.ts is a persistence utility (different layer)
✅ Local alias removed for consistency
✅ **Lines changed**: 4 lines across 2 files

**Changes Made**:
1. `AgentChatPanel.tsx`: Removed `as useThreadsStore` alias
2. `AgentChatConversationManager.tsx`: Removed `as useThreadsStore` alias

**Next Story**: STORE-06 - Merge useNoteNavigationStore into useNavigationStore
