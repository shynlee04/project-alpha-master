---
epic: 24
story: 3
title: "Conversation History Auto-Restore"
status: drafted
priority: high
team: B
created: 2025-12-29
updated: 2025-12-29
estimate_hours: 2-3

# User Story
As a user who leaves and returns to a conversation,
I want my chat history to be automatically restored when I re-open the project,
So that I can continue my work without losing context or having to scroll through old messages.

# Problem Statement
Currently, conversation history is persisted to Dexie but isn't automatically restored when loading a project. Users may lose their place in conversations or have to manually navigate to recent threads. This was flagged as CC-002 in the correct-course workflow.

# Acceptance Criteria

## AC-1: Auto-Restore on Project Load
- [ ] **AC-1.1**: On project load, automatically load the most recently updated conversation thread
- [ ] **AC-1.2**: Restore conversation messages, scroll position, and active thread state
- [ ] **AC-1.3**: Restore within 200ms of project load (no perceptible delay)
- [ ] **AC-1.4**: If no conversations exist, create a new empty conversation

## AC-2: Conversation State Restoration
- [ ] **AC-2.1**: Restore message history with complete tool call/result data
- [ ] **AC-2.2**: Restore scroll position to last known position
- [ ] **AC-2.3**: Restore pending tool approvals (if any) with status
- [ ] **AC-2.4**: Restore agent selection if thread used a specific agent

## AC-3: Multi-Thread Support
- [ ] **AC-3.1**: Support multiple conversation threads per project
- [ ] **AC-3.2**: Display thread list sorted by last updated (most recent first)
- [ ] **AC-3.3**: Allow users to switch between threads seamlessly
- [ ] **AC-3.4**: Preserve thread state (messages, scroll) when switching

## AC-4: Recovery from Edge Cases
- [ ] **AC-4.1**: Handle corrupted conversation data gracefully (log error, create new)
- [ ] **AC-4.2**: Handle missing thread references (clear invalid references)
- [ ] **AC-4.3**: Graceful degradation if IndexedDB is unavailable
- [ ] **AC-4.4**: Recovery from interrupted saves (use last known good state)

## AC-5: User Experience
- [ ] **AC-5.1**: Visual indicator when conversation is being restored
- [ ] **AC-5.2**: Smooth scroll to last position (not jarring jump)
- [ ] **AC-5.3**: Clear "New Conversation" option always available
- [ ] **AC-5.4**: Thread previews show first message of each thread

---

# Tasks

## Research & Planning
- [ ] T1: Review conversation-store.ts implementation
- [ ] T2: Review threads-store.ts for thread CRUD operations
- [ ] T3: Review useWorkspaceState.ts for project load hooks
- [ ] T4: Design auto-restore flow with state machine

## Implementation
- [ ] T5: Create `conversation-auto-restore.ts` module
- [ ] T6: Implement `getMostRecentThread()` query function
- [ ] T7: Implement `restoreConversationState()` to load and hydrate store
- [ ] T8: Implement `restoreThreadScrollPosition()` with animation
- [ ] T9: Add auto-restore hook to workspace initialization
- [ ] T10: Add loading state indicator for conversation restore
- [ ] T11: Implement error boundary for conversation restore failures
- [ ] T12: Add recovery logic for corrupted conversation data

## Testing
- [ ] T13: Write unit tests for `getMostRecentThread()` query
- [ ] T14: Write integration test for auto-restore flow
- [ ] T15: Test multi-thread switching behavior
- [ ] T16: Test scroll position restoration with animation
- [ ] T17: Test error handling for corrupted data
- [ ] T18: Test graceful degradation when IndexedDB unavailable

## Documentation
- [ ] T19: Update AGENTS.md with conversation auto-restore behavior
- [ ] T20: Add user-facing docs for conversation management

---

# Dev Notes

## Architecture Reference
- **Current State**: Conversations persist to Dexie, but no auto-restore on project load
- **Goal**: Seamless conversation restoration similar to IDE open files
- **Components**: conversation-store.ts, threads-store.ts, ChatPanel components

## Key Files
- `src/lib/state/conversation-store.ts` - Conversation state management
- `src/lib/workspace/threads-store.ts` - Thread persistence layer
- `src/components/chat/ChatPanel.tsx` - Chat UI panel
- `src/components/layout/hooks/useIDEStateRestoration.ts` - State restoration hooks

## Implementation Pattern
```typescript
// Pseudocode for conversation auto-restore
class ConversationAutoRestore {
  async restoreOnProjectLoad(projectId: string): Promise<void> {
    // 1. Get most recent thread
    const thread = await getMostRecentThread(projectId);

    if (!thread) {
      // No conversations, create new one
      useConversationStore.getState().createConversation(projectId);
      return;
    }

    // 2. Load thread into conversation store
    await useConversationStore.getState().loadConversation(thread.id);

    // 3. Restore scroll position with animation
    await this.restoreScrollPosition(thread.id, thread.scrollPosition);
  }

  async getMostRecentThread(projectId: string): Promise<ConversationThreadRecord | null> {
    const threads = await db.threads
      .where('projectId')
      .equals(projectId)
      .sortBy('updatedAt');

    return threads[threads.length - 1] || null;
  }
}
```

## Integration Points
1. **Workspace Initialization**: Call auto-restore after project is loaded
2. **IDE Store**: Ensure activeConversationId is properly set
3. **Chat Panel**: Subscribe to conversation store for auto-display
4. **Threads List**: Update to reflect restored conversation

## Edge Cases
1. Thread deleted while project closed → show empty state, create new
2. Corrupted thread data → log error, create new conversation
3. Multiple threads updated simultaneously → pick most recent
4. Scroll position stale → use stored value, animate to it

## Performance Considerations
- Conversation restore should not block project load
- Use requestAnimationFrame for smooth scroll animation
- Lazy-load conversation messages if thread is large (>100 messages)

---

# Dev Agent Record

**Agent:**
**Session:**

#### Task Progress:
- [ ] T1:
- [ ] T2:
- [ ] T3:
- [ ] T4:
- [ ] T5:
- [ ] T6:
- [ ] T7:
- [ ] T8:
- [ ] T9:
- [ ] T10:
- [ ] T11:
- [ ] T12:
- [ ] T13:
- [ ] T14:
- [ ] T15:
- [ ] T16:
- [ ] T17:
- [ ] T18:
- [ ] T19:
- [ ] T20:

#### Research Executed:

#### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| | | |

#### Tests Created:

#### Decisions Made:

---

# Code Review

**Reviewer:**
**Date:**

#### Checklist:
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable

#### Issues Found:

#### Sign-off:

---

# Status History

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-29 | drafted | Story created |
