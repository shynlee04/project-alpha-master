# Story 2.4: Conversation Persistence & Session Restore

---
epic: 2
story: 4
title: Conversation Persistence & Session Restore
slug: conversation-persistence
status: drafted
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
- [ ] Verify `useConversationStore` persistence configuration
- [ ] Research scroll restoration patterns in React (virtualized vs standard)
- [ ] Analyze `Dexie.js` quota error handling patterns

### T2: Implement Scroll Position Tracking
- [ ] Add `scrollTop` to conversation store schema
- [ ] Create `useScrollTracker` hook for chat panel
- [ ] Debounce scroll updates (500ms) to prevent excessive DB writes

### T3: Enhance Persist Middleware
- [ ] Add error boundary for QuotaExceededError
- [ ] Implement toast notification for storage failures
- [ ] Verify atomic writes for conversation updates

### T4: Pending Approval Persistence
- [ ] Add `pendingApprovals` to `activeConversation` state in store
- [ ] Ensure `useAgentChatWithTools` re-hydrates pending approvals on mount
- [ ] Verify tool call ID consistency across reloads

### T5: Message Deduplication & Pruning
- [ ] Implement message deduplication (by ID) during hydration
- [ ] Add `MAX_MESSAGES = 50` limit logic to store actions
- [ ] Verify pruning doesn't corrupt active tool calls

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

## Dev Agent Record
