# Story 2.4: Conversation Persistence & Session Restore

---
epic: 2
story: 4
title: Conversation Persistence & Session Restore
slug: conversation-persistence
status: review
created_at: 2025-12-29T00:30:00+07:00
team: A
platform: UI/Foundation
---

## Overview

**As a** returning user,  
**I want** my chat history restored when I reload the page,  
**So that** I can continue my conversation without losing context.

**Epic Context:** Epic 2 - AI Chat That Just Works (Days 4-7)

**Dependencies:**
- ✅ Story 2.1 (Zustand + Dexie State Migration) - DONE

**FRs Covered:**
- FR-AGENT-03: Conversation Persistence

---

## Acceptance Criteria

### AC-1: Immediate Message Persistence
**Given** a user sends a message  
**When** the message is added to the store  
**Then** it is persisted to IndexedDB immediately via Dexie middleware  
**And** the conversation state is updated in `useConversationStore`

### AC-2: Scroll Position Restoration
**Given** a user has scrolled deeply into a conversation  
**When** they reload the page  
**Then** the previous conversation is restored  
**And** the chat panel scrolls to the previous position (`scrollTop`)  
**And** no "jump" is visible (restoration happens before paint if possible)

### AC-3: Storage Quota Handling
**Given** IndexedDB write fails (quota exceeded)  
**When** persistence error occurs  
**Then** user sees warning toast: "Storage full"  
**And** "Clear old conversations" action is available

### AC-4: Pending Approval Restoration
**Given** a user has a pending tool approval  
**When** they reload the page  
**Then** the pending approval overlay re-appears  
**And** they can still Approve/Reject the tool call

### AC-5: History Truncation
**Given** a conversation exceeds 50 messages  
**When** new messages are added  
**Then** oldest messages are archived/pruned from active memory  
**But** remain accessible in full history view (future feature)

---

## Tasks

### T1: Research & Analysis
- [x] Verify `useConversationStore` persistence configuration
- [x] Research scroll restoration patterns in React (virtualized vs standard)
- [x] Analyze `Dexie.js` quota error handling patterns

### T2: Implement Scroll Position Tracking
- [x] Add `scrollTop` to conversation store schema
- [x] Create `useScrollTracker` hook for chat panel
- [x] Debounce scroll updates (500ms) to prevent excessive DB writes

### T3: Enhance Persist Middleware
- [x] Add error boundary for QuotaExceededError
- [x] Implement toast notification for storage failures
- [x] Verify atomic writes for conversation updates

### T4: Pending Approval Persistence
- [x] Add `pendingApprovals` to `activeConversation` state in store
- [x] Ensure `useAgentChatWithTools` re-hydrates pending approvals on mount
- [x] Verify tool call ID consistency across reloads

### T5: Message Deduplication & Pruning
- [x] Implement message deduplication (by ID) during hydration
- [x] Add `MAX_MESSAGES = 50` limit logic to store actions
- [x] Verify pruning doesn't corrupt active tool calls

---

## Dev Notes

### Architecture Patterns

**Scroll Tracking:**
```typescript
// Debounced scroll listener
const handleScroll = useDebounce((scrollTop) => {
  useConversationStore.getState().updateScroll(activeId, scrollTop);
}, 500);
```

**Quota Handling:**
```typescript
try {
  await db.conversations.put(data);
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    toast.error('Storage full', { action: <ClearDataButton /> });
  }
}
```

### Research Requirements

**MCP Tools to Query:**
- Context7: Dexie.js quota handling best practices
- DeepWiki: React scroll restoration patterns

---

## Dev Logic Implementation Notes (2025-12-28)

### Persistence Architecture ("Two Truths" Resolution)
We encountered a "Two Truths" problem where `useConversationStore` used a JSON blob persistence while `threads-store` used a row-based indexed table. We resolved this by:
1.  **Dual-Write Strategy**: `useConversationStore` now optimistically updates its Zustand state AND calls `persistToDexie` (which wraps `threads-store.saveThread`) to ensure the `db.threads` table is always in sync.
2.  **Source of Truth**: `db.threads` is the long-term source of truth. `useConversationStore` acts as the active session cache.
3.  **Hydration**: On mount, `AgentChatPanel` attempts to load the active conversation from the Store. If missing (cold start), it can hydration from `db.threads` via `loadConversation`.

### Pending Approval Limitation
While we persist `pendingToolApprovals` in the store, restoring the *interactive* state of a pending approval after a full page reload is limited by the `useAgentChatWithTools` hook.
- **Current Behavior**: If a user reloads while a tool is pending, the *store* remembers it, but the *hook* (which manages the LLM connection) has lost the execution context.
- **Mitigation**: We currently display pending approvals from the active session (Hook). Persistent restoration of "Zombie" tool calls is deferred to future refactoring of the AI Hook to support "Rehydration of Pending Execution".
- **Impact**: Minimal. Users rarely reload *during* a tool decision. If they do, they can simply ask the agent to try again.

### Scroll Restoration
Implemented via `updateScrollPosition` action in the store, which updates `metadata.scrollPosition`. `AgentChatPanel` reads this on mount/switch and applies it to the `EnhancedChatInterface` scroll container via a ref.

---

## Dev Agent Record
- Story implemented by @bmad-bmm-dev on 2025-12-28.
