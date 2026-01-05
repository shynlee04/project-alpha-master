# Story Context: E1-5 - Wire Up Cross-Workspace Event Bus

**Document ID**: `e1-5-story-context-2026-01-05`
**Version**: 1.0.0
**Created**: 2026-01-05T13:45:00Z
**Story**: E1-5 - Wire Up Cross-Workspace Event Bus
**Epic**: E1 - Cross-Workspace Chat Integration
**Points**: 6

---

## 1. Story Validation

### Acceptance Criteria (from stories.md)
- [ ] Chat emits events on message send
- [ ] Chat listens for workspace changes
- [ ] Chat state syncs when switching workspaces
- [ ] No duplicate events or memory leaks
- [ ] Event types properly typed

**Validation Result**: ✅ All acceptance criteria clear and measurable.

---

## 2. Technical Context

### Existing Event Bus Infrastructure

| Component | Location | Status |
|-----------|----------|--------|
| `CrossWorkspaceEventBus` | `src/lib/events/cross-workspace-event-bus.ts` | ✅ Active |
| `WorkspaceChangeEvent` | Built-in to event bus | ✅ Emitted by workspace-store |
| Facade layer | `src/infrastructure/events/cross-workspace-event-bus.ts` | ✅ Re-exports from lib |

### Key Dependencies

```typescript
// Import event bus from canonical location
import { crossWorkspaceEventBus } from '@/lib/events/cross-workspace-event-bus';

// Import types
import type {
  WorkspaceChangeEvent,
  // ChatMessageEvent (TO BE ADDED)
} from '@/lib/events/cross-workspace-event-bus';
```

### Integration Points

**Emit Chat Messages**:
- Component: `AgentChatPanel.tsx`
- Method: `handleSendMessage` (line 189)
- Timing: After `sendMessage()` call

**Listen for Workspace Changes**:
- Event: `WORKSPACE_CHANGED`
- Action: Sync chat state when workspace changes

---

## 3. Implementation Plan

### Step 1: Extend Event Bus with Chat Events

**File**: `src/lib/events/cross-workspace-event-bus.ts`

Add chat message event type and methods:

```typescript
/**
 * Chat message sent event
 *
 * Emitted when user sends a message in any workspace.
 * Other workspaces can track activity, update unread counts, or sync state.
 */
export interface ChatMessageSentEvent {
    /** Workspace where message was sent */
    workspaceId: WorkspaceId;
    /** Project ID (if applicable) */
    projectId: string | null;
    /** Agent ID used for chat */
    agentId: string | null;
    /** Message content (truncated for logging) */
    messagePreview: string;
    /** Full message length */
    messageLength: number;
    /** Timestamp */
    timestamp: Date;
}

// Add to EVENTS constant
CHAT_MESSAGE_SENT: 'chat:message:sent',

// Add methods
emitChatMessageSent(event: Omit<ChatMessageSentEvent, 'timestamp'>): void
onChatMessageSent(listener: (event: ChatMessageSentEvent) => void): void
offChatMessageSent(listener: (event: ChatMessageSentEvent) => void): void
```

### Step 2: Create Chat Event Hook

**File**: `src/lib/events/use-chat-event-bridge.ts`

Custom hook to manage event subscriptions with cleanup:

```typescript
export interface UseChatEventBridgeOptions {
  workspaceId: WorkspaceId;
  projectId: string | null;
  agentId: string | null;
  onWorkspaceChange?: (event: WorkspaceChangeEvent) => void;
}

export function useChatEventBridge(options: UseChatEventBridgeOptions) {
  // Subscribe to workspace changes
  // Emit chat message events
  // Cleanup on unmount
}
```

### Step 3: Integrate into AgentChatPanel

**File**: `src/presentation/components/ide/AgentChatPanel.tsx`

1. Import and use `useChatEventBridge` hook
2. Emit `CHAT_MESSAGE_SENT` in `handleSendMessage`
3. Handle workspace changes if needed

---

## 4. Event Flow Diagram

```
User sends message
    ↓
AgentChatPanel.handleSendMessage()
    ↓
sendMessage() → TanStack AI
    ↓
crossWorkspaceEventBus.emitChatMessageSent()
    ↓
Other workspaces receive event
    ↓
Update unread counts / sync state

User switches workspace
    ↓
workspaceStore.setCurrentWorkspace()
    ↓
crossWorkspaceEventBus.emitWorkspaceChanged()
    ↓
AgentChatPanel receives event via useChatEventBridge
    ↓
Sync chat state (save conversation, update UI)
```

---

## 5. Edge Cases & Constraints

| Edge Case | Handling |
|-----------|----------|
| Memory leak | UseEffect cleanup removes listeners |
| Duplicate events | Event bus dedupes same listener |
| Missing projectId | Send null, handle gracefully |
| Rapid workspace switches | Debounce sync operations |

---

## 6. Dependencies

### Peer Dependencies
- React 18.2.0
- eventemitter3 (already in use)

### Internal Dependencies
- `@/lib/events/cross-workspace-event-bus`
- `@/infrastructure/persistence/stores/workspace/workspace-store`
- `@/presentation/components/ide/AgentChatPanel`

---

## 7. Test Strategy

### Unit Tests
- Event emission with correct payload
- Event subscription and cleanup
- No memory leaks (listeners removed)

### Integration Tests
- Chat message sent → other workspaces receive
- Workspace change → chat state syncs
- Multiple rapid events handled correctly

---

## 8. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| TypeScript compilation | ✅ Pass | `pnpm typecheck` |
| Event emission | 100% | All message sends emit event |
| Event cleanup | 100% | No listener leaks on unmount |
| Code size | ≤50 lines added | Minimal footprint |

---

*Context document created for Story E1-5 implementation*
