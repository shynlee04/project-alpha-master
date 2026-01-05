# Story E1-6: Conversation Persistence Context

**Document ID**: `E1-6-story-context-2026-01-05`
**Story**: E1-6 - Conversation Persistence Across Workspaces
**Points**: 8
**Created**: 2026-01-05
**Status**: `ACTIVE`

---

## 1. Executive Summary

Ensure conversations persist and restore across workspace switches (IDE ↔ Notes ↔ Knowledge ↔ Study). The conversation store already has auto-persist functionality (P0-4), but we need to ensure conversations are saved BEFORE workspace switches and properly restored when returning.

---

## 2. Current Architecture Analysis

### 2.1 Conversation Store (Already Well-Structured)

**File**: `src/infrastructure/persistence/stores/conversation/useConversationStore.ts`

**Key Methods**:
- `persistConversation()` - Auto-persists with 500ms debounce
- `getCurrentConversation()` - Aggregates metadata, threads, and messages
- `getConversationsByWorkspace()` - Filters conversations by workspace type
- `activeProjectConversationIds` - Maps project ID to conversation ID

**Persistence Configuration**:
```typescript
{
  name: 'conversation-store',
  storage: createDexieStorage('conversationState'),
  version: 2,
  partialize: (state) => ({
    conversations: state.conversations,
    activeConversationId: state.activeConversationId,
    activeProjectConversationIds: state.activeProjectConversationIds,
    threads: state.threads,
    activeThreadId: state.activeThreadId,
    messages: state.messages,
  }),
}
```

### 2.2 Workspace Switching Infrastructure

**File**: `src/infrastructure/persistence/stores/workspace/useWorkspaceSwitching.ts`

- `switchWorkspace()` - Handles workspace navigation
- `persistLastWorkspace()` - Saves last workspace per project
- Emits `WORKSPACE_CHANGED` event via `crossWorkspaceEventBus`

### 2.3 Cross-Workspace Event Bus

**File**: `src/lib/events/cross-workspace-event-bus.ts`

- `emitWorkspaceChanged()` - Emitted when switching workspaces
- `onWorkspaceChanged()` - Subscribe to workspace changes
- Event payload: `{ from: WorkspaceId, to: WorkspaceId, timestamp }`

---

## 3. Gap Analysis

### What's Missing

| Issue | Impact | Fix |
|-------|--------|-----|
| **No explicit save before workspace switch** | Active conversation state may be lost if debounce hasn't fired | Add explicit `persistConversation()` call in workspace switch handler |
| **No scroll position tracking** | User loses their place when returning to conversation | Add scroll position to conversation metadata |
| **No active conversation restoration** | When returning to workspace, starts with no active conversation | Store and restore `activeConversationId` per workspace |
| **Duplicate conversation entries** | Multiple conversations could be created for same workspace | Deduplication by `workspaceType + projectId` |

---

## 4. Implementation Plan

### 4.1 Add Scroll Position Tracking

**File**: `src/infrastructure/persistence/stores/conversation/conversation-metadata-slice.ts`

**Change**: Add `scrollPosition` to `ConversationMetadataWithId` interface:
```typescript
export interface ConversationMetadataWithId extends ConversationMetadata {
  // ... existing fields
  scrollPosition: number; // NEW: Scroll position in pixels
}
```

### 4.2 Create `useConversationPersistence` Hook

**File**: `src/lib/events/use-conversation-persistence.ts` (NEW)

**Purpose**: Bridge between workspace switching and conversation persistence

**API**:
```typescript
export interface UseConversationPersistenceOptions {
  workspaceId: WorkspaceId;
  projectId: string | null;
  onBeforeWorkspaceSwitch?: () => Promise<void>;
  onAfterWorkspaceSwitch?: (previousWorkspace: WorkspaceId) => void;
}

export function useConversationPersistence(
  options: UseConversationPersistenceOptions
): {
  saveConversation: () => Promise<void>;
  restoreConversation: () => void;
  isSaving: boolean;
}
```

### 4.3 Update Workspace Switch Handler

**File**: `src/infrastructure/persistence/stores/workspace/useWorkspaceSwitching.ts`

**Change**: Add pre-switch callback for conversation persistence:
```typescript
const switchWorkspace = useCallback(
  async (newWorkspace: ExtendedWorkspaceType, onBeforeSwitch?: () => Promise<void>) => {
    // Step 1: Call pre-switch callback (saves conversation)
    await onBeforeSwitch?.();

    // Step 2: Emit workspace changed event
    crossWorkspaceEventBus.emitWorkspaceChanged({
      from: currentWorkspace,
      to: newWorkspace,
      timestamp: new Date().toISOString(),
    });

    // Step 3: Navigate to new workspace
    // ...
  },
  [currentWorkspace, projectId]
);
```

### 4.4 Enhance Conversation Metadata Slice

**File**: `src/infrastructure/persistence/stores/conversation/conversation-metadata-slice.ts`

**Add**: `setScrollPosition()` method:
```typescript
setScrollPosition: (conversationId: string, scrollPosition: number) => {
  set((state) => ({
    conversations: {
      ...state.conversations,
      [conversationId]: {
        ...state.conversations[conversationId],
        scrollPosition,
        updatedAt: new Date().toISOString(),
      },
    },
  }));
},
```

---

## 5. Acceptance Criteria Validation

| Criterion | Verification Method |
|-----------|-------------------|
| Active conversation saves before workspace switch | Unit test: `persistConversation()` called before `switchWorkspace()` |
| Conversation restores when returning to workspace | E2E test: Navigate Notes → IDE → Notes, verify conversation restored |
| Scroll position preserved | E2E test: Scroll to middle, switch workspaces, return, verify position |
| No duplicate conversation entries | Unit test: `createConversation()` checks for existing by `workspaceType + projectId` |
| Works for IDE ↔ Notes ↔ Knowledge ↔ Study | Manual test: Test all workspace transitions |

---

## 6. Files to Modify

| File | Type | Changes |
|------|------|---------|
| `use-conversation-persistence.ts` | NEW | Hook for conversation persistence management |
| `conversation-metadata-slice.ts` | MODIFY | Add `scrollPosition` field and `setScrollPosition()` method |
| `useWorkspaceSwitching.ts` | MODIFY | Add `onBeforeSwitch` callback support |
| `use-chat-event-bridge.ts` | MODIFY | Integrate with conversation persistence |
| `AgentChatPanel.tsx` | MODIFY | Track and restore scroll position |

---

## 7. Test Strategy

### Unit Tests

1. **Conversation Metadata Slice**
   - Test `setScrollPosition()` updates conversation metadata
   - Test scroll position persists through store rehydration

2. **Conversation Persistence Hook**
   - Test `saveConversation()` calls `persistConversation()`
   - Test `restoreConversation()` sets active conversation

### Integration Tests

3. **Workspace Switch Integration**
   - Test conversation saved before workspace switch
   - Test conversation restored after workspace switch
   - Test scroll position preserved across switches

### E2E Tests

4. **Cross-Workspace Conversation Flow**
   - Start conversation in Notes
   - Switch to IDE
   - Switch back to Notes
   - Verify conversation restored with scroll position

---

## 8. Edge Cases

| Case | Handling |
|------|----------|
| **No active conversation** | Gracefully skip save/restore |
| **Conversation deleted while switched** | Handle gracefully, don't restore deleted conversation |
| **Multiple workspace switches rapidly** | Debounce/throttle saves to avoid excessive IndexedDB writes |
| **IndexedDB quota exceeded** | Handle quota error, notify user, fallback to memory-only persistence |

---

## 9. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Conversation save before switch** | 100% | All workspace switches trigger save |
| **Conversation restore on return** | 100% | Returning workspace shows previous conversation |
| **Scroll position accuracy** | ±50px | Restored scroll position within 50px of original |
| **No data loss** | 0 incidents | No lost messages during workspace switches |
| **Performance** | <500ms | Workspace switch completes within 500ms |

---

## 10. Dependencies

| Story | Dependency Type | Notes |
|-------|----------------|-------|
| E1-5 | Completed | Cross-Workspace Event Bus already wired up |
| E1-1 | Completed | UnifiedChatPanel integrated into NotesPage |
| E1-2 | Completed | Notes-specific Chat Context implemented |
| P0-4 (God Store Refactor) | Completed | Auto-persist functionality already added |

---

## 11. Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Planning | 30 min | Story context document |
| Implementation | 2-3 hours | Hook, slice updates, integration |
| Testing | 1 hour | Unit and integration tests |
| Validation | 30 min | Manual E2E testing, acceptance criteria check |
| **Total** | **~4 hours** | **Story E1-6 complete** |

---

*End of Story Context*
