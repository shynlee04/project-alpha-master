# Story 25-R1: Integrate useAgentChatWithTools into AgentChatPanel

**Epic:** 25 - AI Foundation Sprint  
**Priority:** P0 - Critical  
**Points:** 5  
**Incident:** INC-2025-12-24-001 - E2E Validation Failure  

---

## Context

This is a **REMEDIATION STORY** created as part of incident response. The `useAgentChatWithTools` hook exists and is fully implemented with 19 tests passing, but it is NOT wired into the `AgentChatPanel` component which currently uses mock `setTimeout` responses.

### Current State (Broken)

```typescript
// AgentChatPanel.tsx - Lines 81-94
// Simulating Agent Response
window.setTimeout(async () => {
    const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: t('agent.demo_response'),
        timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
}, 300);
```

### Target State (Working)

```typescript
// AgentChatPanel.tsx - Use real hook
import { useAgentChatWithTools } from '../../lib/agent/hooks';

const {
    messages,
    sendMessage,
    isLoading,
    error,
    toolCalls,
    toolsAvailable,
    pendingApprovals,
    approveToolCall,
    rejectToolCall
} = useAgentChatWithTools({
    fileTools,
    terminalTools,
    eventBus
});
```

---

## User Story

**As a** user of the AI-powered IDE  
**I want** to send messages and receive real AI responses with tool execution  
**So that** I can use the AI agent to help me with coding tasks

---

## Acceptance Criteria

### AC-25-R1-1: Replace Mock with Real Hook
**Given** the AgentChatPanel component  
**When** a user sends a message  
**Then** the message is sent via `useAgentChatWithTools.sendMessage()`  
**And** responses stream in via the hook instead of mock setTimeout  

### AC-25-R1-2: Tool Execution UI
**Given** the AI agent calls a tool (read_file, write_file, execute_command)  
**When** the tool call is received  
**Then** the ToolCallBadge component displays the tool call  
**And** the status updates (pending → running → success/error)  

### AC-25-R1-3: Approval Flow
**Given** a tool requires approval (write_file, execute_command)  
**When** the AI requests tool execution  
**Then** the ApprovalOverlay displays with correct tool details  
**And** clicking Approve calls `approveToolCall()`  
**And** clicking Reject calls `rejectToolCall()`  

### AC-25-R1-4: Loading State
**Given** a message is being processed  
**When** `isLoading` is true from the hook  
**Then** the typing indicator shows in EnhancedChatInterface  

### AC-25-R1-5: Error Handling
**Given** an error occurs (API key missing, network error)  
**When** `error` is set from the hook  
**Then** an error message displays to the user  

### AC-25-R1-6: Remove Mock Trigger Button
**Given** the component is wired to real functionality  
**When** component renders  
**Then** the mock "Wand2" trigger button is removed from the header  

---

## Tasks

- [ ] T1: Import `useAgentChatWithTools` and dependencies
- [ ] T2: Initialize file/terminal tools using existing facades  
- [ ] T3: Replace `handleSendMessage` with hook's `sendMessage`
- [ ] T4: Wire `messages` from hook to `EnhancedChatInterface`
- [ ] T5: Wire `isLoading` to `isTyping` prop
- [ ] T6: Wire `pendingApprovals` to `ApprovalOverlay`  
- [ ] T7: Wire `approveToolCall` and `rejectToolCall` to handlers
- [ ] T8: Add error display for API/connection errors
- [ ] T9: Remove mock trigger button and `triggerMockApproval` function
- [ ] T10: Update component tests
- [ ] T11: **MANUAL E2E VERIFICATION** (Integration Scenario 2)

---

## Technical Notes

### TanStack AI Client Tools Pattern (from official docs)

```typescript
import { useChat, fetchServerSentEvents } from "@tanstack/ai-react";
import { clientTools, createChatClientOptions } from "@tanstack/ai-client";

// Create typed tools array
const tools = clientTools(updateUI, saveToLocalStorage);

const chatOptions = createChatClientOptions({
    connection: fetchServerSentEvents("/api/chat"),
    tools,
});

const { messages, sendMessage, isLoading } = useChat(chatOptions);
```

### Existing Hook Interface (use-agent-chat-with-tools.ts)

```typescript
export interface UseAgentChatWithToolsReturn {
    messages: Array<{ role: string; content: string }>;
    sendMessage: (content: string, options?: { body?: any }) => void;
    isLoading: boolean;
    error: Error | null;
    clearMessages: () => void;
    providerId: string;
    modelId: string;
    toolCalls: ToolCallInfo[];
    toolsAvailable: boolean;
    pendingApprovals: PendingApprovalInfo[];
    approveToolCall: (toolCallId: string) => void;
    rejectToolCall: (toolCallId: string, reason?: string) => void;
}
```

### Files to Modify

1. `src/components/ide/AgentChatPanel.tsx` - Main integration
2. `src/components/ide/__tests__/AgentChatPanel.test.tsx` - Update tests

### Dependencies Required

- `useAgentChatWithTools` hook (exists)
- `FileToolsFacade` (exists via Epic 25-2)
- `TerminalToolsFacade` (exists via Epic 25-3)
- `WorkspaceEventEmitter` (exists via Epic 10)

---

## Integration Testing Scenario

### Scenario 2: Chat Message → Streaming Response

**Prerequisites:**
- Agent configured with valid API key (Scenario 1 passed)
- Dev server running

**Steps:**
1. Open IDE and project
2. Navigate to Chat panel
3. Type "Hello, how can you help me?" in the input
4. Press Enter or click Send
5. Observe response streaming in

**Expected Behavior:**
- [ ] Message appears in chat history immediately
- [ ] Loading/typing indicator shows
- [ ] Response streams in token-by-token (not all at once)
- [ ] Response completes and typing indicator disappears

**Failure Indicators:**
- Message not sent (input clears but nothing happens)
- Response appears all at once (not streaming)
- "Mock" or hardcoded response appears
- Error or crash

---

## Dev Agent Record

*To be filled during implementation*

---

## Status

| Status | Date | Notes |
|--------|------|-------|
| drafted | 2025-12-24T09:15:00+07:00 | Story created from incident INC-2025-12-24-001 |
