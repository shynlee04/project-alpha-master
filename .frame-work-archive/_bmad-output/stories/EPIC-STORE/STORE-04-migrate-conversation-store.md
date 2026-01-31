---
story_key: "EPIC-STORE-STORE-04-migrate-conversation-store"
epic: "EPIC-STORE"
story: 4
status: "done"
created_at: "2026-01-12T12:45:00+07:00"
version: "2.0"
points: 3
---

# STORE-04: Migrate useConversationStore to useUnifiedChatStore

## User Story

**As a** Developer
**I want** all consumers to use the unified chat store directly or through a proper facade
**So that** there's a single source of truth for chat state

### Epic Context
From **EPIC-STORE: Store Consolidation & Conflict Resolution**
- Epic Goal: Resolve CONFLICT-01 (useConversationStore facade to useUnifiedChatStore)
- This Story Supports: Phase 2 (Duplicate Store Resolution)
- Epic Progress: 30% complete (3 of 10 stories done)

## Acceptance Criteria

### AC-1: Analyze Current Architecture

**Given** The codebase has both useConversationStore and useUnifiedChatStore
**When** Architecture is analyzed
**Then** The relationship between stores is documented

#### Implementation Hints
- Relevant Files:
  - `src/infrastructure/persistence/stores/conversation/useConversationStore.ts`
  - `src/infrastructure/persistence/stores/chat/unified-chat-store.ts`
- Architecture Pattern: Facade pattern for backward compatibility
- Related Stories: STORE-05 (Delete useThreadsStore duplicate)

#### Edge Cases to Handle
- Type compatibility between legacy and unified formats
- Consumer code that expects legacy API
- Test files that mock the store

### AC-2: Determine Migration Strategy

**Given** The facade pattern is in place
**When** Impact analysis is complete
**Then** The best approach is chosen

### AC-3: Execute Migration (or document current state)

**Given** Strategy is determined
**When** Migration is executed or documented
**Then** System is in better state

## Deep Analysis

### Cross-Impact Mapping

| Workspace | Affected | Impact Level | Key Files |
|-----------|----------|--------------|-----------|
| IDE | ✅ | MEDIUM | `AgentChatPanel.tsx` |
| Chat | ✅ | HIGH | `ChatHistory.tsx`, `ChatPanelWrapper.tsx` |
| Shared UI | ✅ | LOW | Various chat components |

#### Dependencies
- **Depends On**: STORE-01, STORE-02, STORE-03
- **Required By**: STORE-05

#### Architectural Impact
- **Layers Touched**: infrastructure (stores), presentation (components), hooks
- **Clean Architecture**: ✅ COMPLIANT
- **Potential Conflicts**: Type compatibility

### Architecture Analysis Results

#### Current State: FACADE PATTERN ALREADY IMPLEMENTED

**File**: `src/infrastructure/persistence/stores/conversation/useConversationStore.ts`
- **Pattern**: Facade that delegates to `useUnifiedChatStore`
- **Lines**: ~400 (mapping functions + delegated methods)
- **Status**: ✅ WORKING - Provides backward compatibility

#### Key Finding
```
useConversationStore (FACADE)
         ↓ (delegates all calls)
useUnifiedChatStore (SINGLE SOURCE OF TRUTH)
```

The facade:
1. Maps types between legacy and unified formats
2. Provides legacy API for existing consumers
3. Delegates all CRUD operations to `useUnifiedChatStore`

#### Migration Analysis

**Option 1: Keep the Facade** ✅ RECOMMENDED
- **Effort**: Minimal (already in place)
- **Risk**: Low (facade is working)
- **Benefit**: Backward compatibility maintained

**Option 2: Remove Facade, Update Consumers**
- **Effort**: High (106 usages across 24 files)
- **Risk**: High (breaking changes)
- **Benefit**: Slightly less code

#### Recommendation
**Keep the facade** for now. Reasons:
1. Facade is well-implemented with proper type mapping
2. Single source of truth (`useUnifiedChatStore`) already established
3. No duplication of state management logic
4. Breaking change risk outweighs benefit

**Future Work** (EPIC-CHAT Phase 2):
- Consider gradual migration of consumers to `useUnifiedChatStore`
- Remove facade after all consumers migrated
- Target: 2026-02-01 (as noted in facade @deprecation_planned)

## Tasks

- [x] T1: Analyze useConversationStore architecture (1h)
- [x] T2: Identify all consumers and usage patterns (1h)
- [x] T3: Determine migration strategy (30m)
- [x] T4: Document findings and recommendation (30m)

## Dev Notes

### Integration Points
- **Touches**: 24 files currently use useConversationStore
- **Breaks**: None (facade already in place)
- **Shared With**: STORE-05, all chat components

### Technical Considerations
- **Facade Pattern**: Correctly implemented with proper delegation
- **Type Safety**: All types mapped correctly
- **Performance**: Minimal overhead (thin facade layer)
- **Maintainability**: Acceptable for transition period

### Consumer Files (106 usages)
**High Priority**:
- `src/hooks/useChatHistory.ts` - Main consumer hook
- `src/presentation/components/ide/AgentChatPanel.tsx`
- `src/presentation/components/chat/ChatHistory.tsx`

**Medium Priority**:
- `src/infrastructure/persistence/stores/conversation-auto-restore.ts`
- `src/lib/chat/context-window-manager.ts`
- `src/lib/events/use-conversation-persistence.ts`

**Low Priority**:
- Test files (8)
- Type-only imports (5)

## Status History

| Status | Timestamp | Agent | Notes |
|--------|-----------|-------|-------|
| backlog | 2026-01-12 | SM | From EPIC-STORE epic |
| drafted | 2026-01-12T12:45 | bmad-master | Story file created v2.0 |
| analyzed | 2026-01-12T12:45 | bmad-master | Architecture analysis complete |
| done | 2026-01-12T12:45 | bmad-master | Facade already in place, no migration needed |

## Dev Agent Record

**Agent**: bmad-master (autonomous orchestrator)
**Finding**: useConversationStore is already a facade to useUnifiedChatStore
**Decision**: Keep facade, document for future cleanup
**Result**: CONFLICT-01 already resolved by existing facade

## Completion Summary

✅ Architecture analysis complete
✅ Facade pattern verified
✅ Single source of truth confirmed (useUnifiedChatStore)
✅ **Migration Status**: ALREADY COMPLETE via facade

**Key Finding**:
The `useConversationStore` facade was created in EPIC-40 MM-01 (2026-01-10)
and already provides the migration path described in this story.

**Next Steps** (Future):
- Gradual migration of consumers to `useUnifiedChatStore` (low priority)
- Remove facade after EPIC-CHAT completion
- Target date: 2026-02-01 (per @deprecation_planned)

**Next Story**: STORE-05 - Delete useThreadsStore duplicate
