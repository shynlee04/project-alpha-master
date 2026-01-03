---
date: 2026-01-03
time: 14:30:00+07:00
phase: Implementation
team: Team A
agent_mode: bmad-core-bmad-master
iteration: 1091
type: critical-fix-handoff
---

# P0-4 Handoff: Fix Conversation Auto-Persist

## Handoff To: @bmad-bmm-dev (general-purpose)

## Issue Context

**Priority**: P0 - Critical (Blocks Core Functionality)
**Estimate**: 3 hours
**Location**: `src/infrastructure/persistence/stores/conversation/message-crud-slice.ts:30-38`

## Problem Statement

Conversations are **NOT being automatically persisted** to IndexedDB. When users switch workspaces or refresh the page, their chat conversations are lost.

**Root Cause**:
The `addMessage()` method in message-crud-slice.ts only updates Zustand state and emits events, but **doesn't call the persist function** to save to Dexie (IndexedDB).

**Current Broken Code** (message-crud-slice.ts:30-38):
```typescript
addMessage: (threadId, message) => {
    const id = generateId();
    const timestamp = Date.now();
    const newMessage: MessageWithId = { ...message, id, threadId, timestamp };
    console.log('[MessageSlice] Adding:', id, 'to thread:', threadId);
    set((state) => ({ messages: { ...state.messages, [id]: newMessage } }));
    get().emitMessageAdded(id, newMessage); // ❌ Only emits event, doesn't persist!
    return id;
},
```

## Existing Infrastructure ✅

The persist helper **already exists** in conversation-helpers.ts:

**File**: `src/infrastructure/persistence/stores/conversation/conversation-helpers.ts`
- ✅ `persistToDexie()` - Saves conversation state to IndexedDB (lines 72-114)
- ✅ `createDebouncedPersist(waitMs)` - Debounced wrapper to avoid excessive writes (lines 118-125)
- ✅ Proper error handling with toast notifications

**The Problem**: These helpers exist but **are never called** from the store!

## Implementation Plan

### Step 1: Add Debounced Persist to Store State (30 minutes)

**Update**: `src/infrastructure/persistence/stores/conversation/useConversationStore.ts`

**Add to store state interface**:
```typescript
interface ConversationStoreState {
  // ... existing state

  // Auto-persist function (debounced)
  persistConversation: () => Promise<void>;
}
```

**Create debounced persist function on store initialization**:
```typescript
import { createDebouncedPersist } from './conversation-helpers';

// Inside store creation:
const debouncedPersist = createDebouncedPersist(500); // 500ms debounce

export const useConversationStore = create<ConversationStoreState>()(
  persist(
    (set, get) => ({
      // ... existing slices

      persistConversation: async () => {
        const conversation = get().getCurrentConversation();
        if (conversation) {
          await debouncedPersist(conversation);
        }
      },
    }),
    // ... existing persist middleware
  )
);
```

### Step 2: Call Persist After Message Added (30 minutes)

**Update**: `src/infrastructure/persistence/stores/conversation/message-crud-slice.ts`

**Modify `addMessage()` method** (lines 30-38):
```typescript
addMessage: (threadId, message) => {
    const id = generateId();
    const timestamp = Date.now();
    const newMessage: MessageWithId = { ...message, id, threadId, timestamp };
    console.log('[MessageSlice] Adding:', id, 'to thread:', threadId);

    set((state) => ({ messages: { ...state.messages, [id]: newMessage } }));
    get().emitMessageAdded(id, newMessage);

    // ✅ NEW: Trigger auto-persist
    get().persistConversation();

    return id;
},
```

**Also update**:
- `updateMessage()` (line 40-48) - Call persist after update
- `deleteMessage()` (line 50-58) - Call persist after delete

### Step 3: Add Persist Helper Method (30 minutes)

**Add to**: `src/infrastructure/persistence/stores/conversation/conversation-utils-slice.ts`

**Add helper method** to get current conversation state:
```typescript
getCurrentConversation: () => ConversationState | null => {
    const { activeConversationId, conversations, threads, messages } = get();

    if (!activeConversationId) {
        return null;
    }

    const conversation = conversations[activeConversationId];
    if (!conversation) {
        return null;
    }

    const conversationThreads = Object.values(threads)
        .filter(t => t.conversationId === activeConversationId && t.status !== 'deleted');

    const conversationMessages = Object.values(messages)
        .filter(m => conversationThreads.some(t => t.id === m.threadId));

    return {
        metadata: conversation,
        threads: conversationThreads,
        messages: conversationMessages,
    };
},
```

### Step 4: Add Persist on Thread Creation (30 minutes)

**Update**: `src/infrastructure/persistence/stores/conversation/thread-management-slice.ts`

**Find `createThread()` method** and add persist call:
```typescript
createThread: (conversationId, params) => {
    // ... existing logic

    set((state) => ({
        threads: { ...state.threads, [id]: newThread }
    }));

    get().emitThreadCreated(id, newThread);

    // ✅ NEW: Trigger auto-persist
    get().persistConversation();

    return id;
},
```

**Do the same for**:
- `updateThread()`
- `deleteThread()`

### Step 5: Update Metadata Slice (30 minutes)

**Update**: `src/infrastructure/persistence/stores/conversation/conversation-metadata-slice.ts`

**Add persist calls to**:
- `createConversation()`
- `updateConversationMetadata()`
- `deleteConversation()`

Example:
```typescript
createConversation: (workspaceType, projectId, agentId) => {
    // ... existing logic

    set((state) => ({
        conversations: { ...state.conversations, [id]: newConversation },
        activeConversationId: id,
    }));

    // ✅ NEW: Trigger auto-persist
    get().persistConversation();

    return id;
},
```

### Step 6: Manual Testing (30 minutes)

**Test Cases**:

1. **Send Message - Verify Persist**:
   ```bash
   pnpm dev
   ```
   - Open IDE workspace
   - Open browser DevTools → Application → IndexedDB → threads table
   - Send a chat message: "Test message"
   - Check IndexedDB immediately - record should NOT appear yet (debouncing)
   - Wait 1 second
   - Refresh page - conversation should still be there ✅

2. **Switch Workspace - Verify Conversation Preserved**:
   - Send 3 messages in IDE workspace
   - Switch to Knowledge workspace
   - Switch back to IDE workspace
   - All 3 messages should still be present ✅

3. **Create Thread - Verify Persist**:
   - Create a new conversation thread
   - Switch workspaces
   - Return - thread should still exist ✅

**Expected Console Output**:
```
[MessageSlice] Adding: msg_1234567890_abc123 to thread: thread_456
[ConversationHelpers] Debounced persist scheduled...
[ConversationHelpers] Persisting conversation to Dexie...
[ConversationHelpers] Persisted 1 messages, 1 threads
```

### Step 7: Code Validation (30 minutes)

```bash
# TypeScript check
pnpm tsc --noEmit 2>&1 | grep -v "test\|spec" | grep "error" | wc -l
# Expected: 0 production errors

# Check circular dependencies
pnpm madge --circular src/infrastructure/persistence/stores/conversation/
# Expected: No circular dependencies

# Run conversation tests
pnpm test src/infrastructure/persistence/stores/conversation/__tests__/
# Expected: All tests passing

# Manual verification
# 1. Open DevTools → Application → IndexedDB → threads
# 2. Send chat message
# 3. Wait 1 second
# 4. Verify record appears in threads table
```

## Constraints & Safeguards

### DO NOT:
- ❌ Persist on every keystroke (use debouncing)
- ❌ Block UI while persisting (make it async)
- ❌ Break existing event emissions (keep them)
- ❌ Change Dexie schema (use existing threads table)

### MUST:
- ✅ Use 500ms debounce (already configured in createDebouncedPersist)
- ✅ Persist asynchronously (non-blocking)
- ✅ Handle errors gracefully with toast notifications
- ✅ Call persist after ALL state mutations (add, update, delete)
- ✅ Add JSDoc comments
- ✅ Test with IndexedDB DevTools

### Validation Checklist:
- [ ] persistConversation() added to store interface
- [ ] Debounced persist function created in useConversationStore
- [ ] addMessage() calls persistConversation()
- [ ] updateMessage() calls persistConversation()
- [ ] deleteMessage() calls persistConversation()
- [ ] createThread() calls persistConversation()
- [ ] updateThread() calls persistConversation()
- [ ] deleteThread() calls persistConversation()
- [ ] createConversation() calls persistConversation()
- [ ] updateConversationMetadata() calls persistConversation()
- [ ] deleteConversation() calls persistConversation()
- [ ] getCurrentConversation() helper implemented
- [ ] Zero TypeScript errors
- [ ] Manual test: Message persists after page refresh
- [ ] Manual test: Conversation preserved across workspace switch
- [ ] IndexedDB DevTools shows records in threads table
- [ ] Console shows persist logs
- [ ] JSDoc comments added

## MCP Research Required (minimum 2 tool uses):

### Context7:
- Query Zustand persist middleware best practices
- Query IndexedDB batch operations for performance

### Deepwiki:
- Search Dexie.js repo for transaction patterns
- Search Zustand repo for persist middleware examples

## Output Location

Report completion to:
```
_bmad-output/p0-4-conversation-persist-completion-2026-01-03.md
```

Include:
- Code diff showing changes made
- Files modified count
- TypeScript error count (before: 0, after: 0 expected)
- Manual test results (screenshots of IndexedDB records)
- Console output showing persist logs
- Any blockers or recommendations

## Report Back To

**@bmad-core-bmad-master** with:
1. P0-4 completion status (SUCCESS/BLOCKED)
2. Files modified
3. Verification results (manual test: messages persist)
4. Screenshot of IndexedDB threads table with records
5. Next action recommendation (update iteration count or proceed)

---

**Handoff Created**: 2026-01-03T14:30:00+07:00
**BMAD Master**: @bmad-core-bmad-master
**Iteration**: 1091
**Team**: Team A
**Priority**: P0 CRITICAL - Conversations Lost on Workspace Switch
