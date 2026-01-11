# File Inventory - Chat/Thread/Conversation Related Files
**Date:** 2026-01-11  
**Phase:** 1 - DISCOVERY  
**Classification:** Chat Architecture Investigation

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Total chat-related files | 149 |
| Store files (chat) | 12 |
| Store files (conversation) | 25 |
| Component files | 65 |
| Hook/utility files | 30 |
| Test files | 17 |

---

## 1. Store Layer - Chat (Unified Store - Source of Truth)

### 1.1 Core Store
| File | Purpose | Status |
|------|---------|--------|
| `unified-chat-store.ts` | Main store combining all slices | ACTIVE |
| `unified-chat-types.ts` | Type definitions | ACTIVE |
| `index.ts` | Public exports | ACTIVE |
| `chat-settings-store.ts` | Chat settings | ACTIVE |

### 1.2 Slices
| File | Purpose | Lines |
|------|---------|-------|
| `slices/chat-metadata-slice.ts` | Conversation CRUD | ~120 |
| `slices/thread-management-slice.ts` | Thread CRUD | ~150 |
| `slices/message-crud-slice.ts` | Message CRUD | ~130 |
| `slices/tool-execution-slice.ts` | Tool calls/approvals | ~200 |
| `slices/context-window-slice.ts` | Context management | ~100 |

### 1.3 Tests
| File | Coverage |
|------|----------|
| `__tests__/chat-metadata-slice.test.ts` | Metadata slice |
| `__tests__/thread-management-slice.test.ts` | Thread slice |
| `__tests__/message-crud-slice.test.ts` | Message slice |
| `__tests__/tool-execution-slice.test.ts` | Tool slice |

---

## 2. Store Layer - Conversation (Legacy Facade)

### 2.1 Core Facade
| File | Purpose | Status | Deprecation |
|------|---------|--------|-------------|
| `useConversationStore.ts` | Facade to UnifiedChatStore | ACTIVE | 2026-02-01 |
| `conversation-store.ts` | Re-exports facade | ACTIVE | Same as above |
| `index.ts` | Public exports | ACTIVE | - |

### 2.2 Slices (Legacy)
| File | Purpose | Status |
|------|---------|--------|
| `conversation-metadata-slice.ts` | Metadata (deprecated) | DELEGATES |
| `thread-management-slice.ts` | Threads (deprecated) | DELEGATES |
| `message-crud-slice.ts` | Messages (deprecated) | DELEGATES |
| `conversation-utils-slice.ts` | Utilities | ACTIVE |
| `conversation-validation-slice.ts` | Validation | ACTIVE |
| `conversation-events-slice.ts` | Events | ACTIVE |

### 2.3 Types & Migration
| File | Purpose |
|------|---------|
| `conversation-types.ts` | Legacy type definitions |
| `types.ts` | Extended types |
| `event-types.ts` | Event types |
| `migration/conversation-migration.ts` | Migration utilities |
| `conversation-helpers.ts` | Helper functions |

---

## 3. Presentation Components

### 3.1 Thread Management (CRITICAL - Integration Gap)
| File | Purpose | Integration | Notes |
|------|---------|-------------|-------|
| `ThreadManager.tsx` | Full CRUD UI | ❌ NOT USED | Built for UnifiedChatStore |
| `ThreadCard.tsx` | Simple list item | ✅ ACTIVE | Used by ChatPanelWrapper |
| `ThreadsList.tsx` | Thread list container | ✅ ACTIVE | Used in some views |
| `ThreadFolderTree.tsx` | Folder tree view | ❓ UNKNOWN | Needs investigation |

### 3.2 Chat Input & Display
| File | Integration |
|------|-------------|
| `ChatInputControls.tsx` | ✅ INTEGRATED |
| `ChatBubble.tsx` | ACTIVE |
| `ChatHistory.tsx` | ACTIVE |
| `CollapsibleSection.tsx` | ✅ INTEGRATED |
| `ArtifactPreviewModal.tsx` | ✅ INTEGRATED |
| `ExpandableChatPanel.tsx` | ACTIVE |

### 3.3 Tool Execution
| File | Status |
|------|--------|
| `ToolCallBadge.tsx` | ACTIVE |
| `ToolExecutionIndicator.tsx` | ACTIVE |
| `ToolProgressIndicator.tsx` | ACTIVE |
| `ApprovalOverlay.tsx` | ACTIVE |
| `BatchApprovalBar.tsx` | ACTIVE |
| `AutoApproveSettings.tsx` | ACTIVE |

### 3.4 Other Components
| File | Status |
|------|--------|
| `CodeBlock.tsx` | ACTIVE |
| `DiffPreview.tsx` | ACTIVE |
| `FileAttachmentInput.tsx` | ACTIVE |
| `MessageSearch.tsx` | ACTIVE |
| `UnifiedChatPanel.tsx` | ACTIVE |
| `NoteReferencePicker.tsx` | ACTIVE |
| `StreamdownRenderer.tsx` | ACTIVE |

---

## 4. Hooks

### 4.1 Thread Management Hooks
| File | Purpose | Usage |
|------|---------|-------|
| `useThreadManager.ts` | Thread CRUD hook | ❌ UNUSED - Only used by ThreadManager |
| `useAgentChatMessages.ts` | Message management | ACTIVE |
| `useAgentChatArtifacts.ts` | Artifact handling | ACTIVE |

### 4.2 Other Hooks
| File | Purpose |
|------|---------|
| `useChatHistory.ts` | Chat history |
| `useAgentChatApproval.ts` | Tool approvals |
| `useAgentChatApiKeys.ts` | API key management |

---

## 5. Library/Logic Layer

### 5.1 Chat Logic
| File | Purpose |
|------|---------|
| `lib/chat/context-window-manager.ts` | Context window |
| `lib/chat/title-generator.ts` | Title generation |
| `lib/chat/message-search.ts` | Message search |

### 5.2 Agent Integration
| File | Purpose |
|------|---------|
| `lib/agent/hooks/use-agent-chat-with-tools.ts` | Agent with tools |
| `lib/agent/memory/conversation-memory.ts` | Memory management |

### 5.3 Event/State Sync
| File | Purpose |
|------|---------|
| `lib/events/use-chat-event-bridge.ts` | Event bridge |
| `lib/events/use-chat-state-sync.ts` | State sync |
| `lib/events/use-conversation-persistence.ts` | Persistence |

---

## 6. Unused/Orphaned Files (Requires Verification)

| File | Reason for Suspicion |
|------|---------------------|
| `ThreadManager.tsx` | Exported but never imported |
| `useThreadManager.ts` | Only used by ThreadManager |
| `ThreadFolderTree.tsx` | May be unused |
| `WorkflowBuilder*.tsx` | Workflow components - check usage |
| `DebateTimeline.tsx` | Check if used |
| `RoutingDecision.tsx` | Check if used |

---

## 7. Test Files

| Category | Count | Status |
|----------|-------|--------|
| Unit tests | ~12 | Maintained |
| Integration tests | ~3 | Basic |
| E2E tests | ~2 | Cross-workspace |

---

## 8. Export Analysis

### 8.1 chat/index.ts exports
```typescript
export { ThreadManager } from './ThreadManager';  // ❌ Never used
export { ThreadCard } from './ThreadCard';        // ✅ ACTIVE
export { ThreadsList } from './ThreadsList';      // ✅ ACTIVE
export { ChatInputControls } from './ChatInputControls';  // ✅ ACTIVE
// ... other exports
```

### 8.2 hooks/index.ts exports
```typescript
export { useThreadManager } from '../presentation/hooks/useThreadManager';  // ❌ UNUSED
// ... other hooks
```

---

## 9. Action Items

| Priority | Action | File |
|----------|--------|------|
| P0 | Verify ThreadManager import chain | All components |
| P1 | Check ThreadFolderTree usage | grep |
| P2 | Check WorkflowBuilder usage | grep |
| P2 | Verify ThreadManager test coverage | `__tests__/ThreadManager.test.tsx` |

---

*Generated: 2026-01-11 | BMAD Investigation Phase 1*
