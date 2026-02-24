# CHAT-024: Standardize workspaceId/workspaceType Naming

**Epic:** EPIC-CHAT-REMAKE
**Story:** CHAT-024
**Title:** Standardize workspaceId/workspaceType Naming in Domain Entities
**Status:** backlog
**Created:** 2026-01-11
**Effort:** 3h
**Priority:** P1-HIGH
**Phase:** 2

## Context

**Correct-Course Workflow:** Feature Fix

The governance validation report identified a naming inconsistency:
- `ChatThread.workspaceId?` (domain entity)
- `ChatConversation.workspaceType` (component prop)
- `ConversationState.metadata` (duplicate)

This creates confusion and potential bugs when data flows between layers.

## User Story

**As a** developer working with chat domain entities
**I want** consistent naming for workspace identifiers
**So that** the data flow is clear and bugs are prevented

## Current Problem

```tsx
// Domain entity (src/domain/entities/ChatThread.ts)
interface ChatThread {
    workspaceId?: string  // ❌ Inconsistent naming
}

// Component prop (src/presentation/components/ide/AgentChatPanel.tsx)
interface AgentChatPanelProps {
    workspaceType?: WorkspaceType  // ✅ Correct naming
}

// Event payload (src/lib/events)
interface WorkspaceChangeEvent {
    workspaceId: WorkspaceType  // ❌ Wrong type name
}
```

## Acceptance Criteria

- [ ] Consistent naming across all layers
- [ ] Type safety enforced (TypeScript)
- [ ] Domain entities use correct naming
- [ ] No breaking changes to public APIs

## Technical Implementation

### Decision: Use `workspaceType: WorkspaceType`

The term "Type" is more accurate because:
- Values are: `'ide' | 'notes' | 'knowledge' | 'study'`
- These are categories, not identifiers
- `projectId` already serves as the identifier

### Changes Required

| File | Change |
|------|--------|
| `src/domain/entities/ChatThread.ts` | `workspaceId?` → `workspaceType?` |
| `src/lib/events/event-bus.ts` | `workspaceId` → `workspaceType` in events |
| `src/lib/events/use-chat-event-bridge.ts` | Update prop names |
| `src/presentation/components/ide/AgentChatPanel.tsx` | ✅ Already correct |
| `src/infrastructure/persistence/stores/conversation/` | Update store schema |

### Migration Plan

```sql
-- IndexedDB schema migration for conversation store
-- Add new column
ALTER TABLE conversations ADD COLUMN workspaceType TEXT;
-- Migrate data
UPDATE conversations SET workspaceType = workspaceId WHERE workspaceId IN ('ide', 'notes', 'knowledge', 'study');
-- Drop old column (after verification)
-- ALTER TABLE conversations DROP COLUMN workspaceId;
```

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Data loss | Low | High | Backup before migration, verify |
| Breaking changes | Medium | Medium | Version API, deprecation period |
| Type errors | Low | Medium | TypeScript will catch errors |

## Related Stories

- **CHAT-005:** Thread Workspace Association (related domain work)

## Notes

This naming issue was identified in the original governance validation report. While not causing visible bugs, it creates confusion and makes the codebase harder to understand and maintain.

**Recommendation:** Complete during a dedicated data migration sprint to ensure proper testing and rollback capability.
