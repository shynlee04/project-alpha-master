# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-041
**Title: AI Chat History - Persistent Conversations with Threading**
**Date**: 2026-01-06T14:00:00+07:00
**Priority**: P2 - MEDIUM

## From
- **Agent**: bmad-core-bmad-master (coordinator)
- **Module**: asgl

## To
- **Agent**: bmad-bmm-dev
- **Module**: bmm
- **Path**: _bmad/modules/bmm/agents/dev.md

## Task
Add AI chat history with persistent conversations, message threading, and context awareness.

## Context
No AI chat history exists. Conversations are lost on refresh. Need persistent chat with threading.

## Root Cause
```typescript
// No chat history persistence
// No conversation threading
// Missing context management
// No message search
```

## Files to Create/Modify
- **Create**: `src/infrastructure/persistence/stores/chat-history-store.ts` - Chat history state
- **Create**: `src/lib/chat/conversation-manager.ts` - Conversation CRUD operations
- **Create**: `src/lib/chat/message-threading.ts` - Thread management
- **Create**: `src/lib/chat/context-manager.ts` - Context window management
- **Create**: `src/presentation/components/chat/ChatHistory.tsx` - Chat history sidebar
- **Create**: `src/presentation/components/chat/ConversationCard.tsx` - Conversation preview card
- **Create**: `src/presentation/components/chat/MessageSearch.tsx` - Search messages across conversations
- **Create**: `src/hooks/useChatHistory.ts` - Chat history hook
- **Modify**: `src/presentation/components/ai/ChatInterface.tsx` - Integrate history

## AI Chat History Features

### Conversation Management
- **Create Conversation**: Start new conversation with auto-generated title
- **Delete Conversation**: Remove conversation with confirmation
- **Rename Conversation**: Edit conversation title
- **Archive Conversations**: Archive old conversations
- **Favorite Conversations**: Mark important conversations
- **Export Conversation**: Export conversation as Markdown/JSON

### Message Threading
- **Thread Grouping**: Group messages by topic/response
- **Thread Collapse**: Collapse long threads
- **Thread Navigation**: Jump between threads
- **Thread Summaries**: Auto-generate thread summaries
- **Branching**: Create branches from messages (what-if scenarios)

### Context Management
- **Context Window**: Manage token limits for context
- **Message Pruning**: Auto-prune old messages when context full
- **Priority Messages**: Keep important messages in context
- **Context Preview**: Show current context usage
- **Sliding Window**: Use sliding window for long conversations

### Message Search
- **Full-Text Search**: Search across all conversations
- **Filter by Date**: Search within date range
- **Filter by Agent**: Search messages from specific AI agent
- **Highlight Matches**: Highlight search terms in messages
- **Search Results**: Show matching messages with context

### Conversation Metadata
- **Created At**: Conversation creation timestamp
- **Updated At**: Last message timestamp
- **Message Count**: Total messages in conversation
- **Token Usage**: Total tokens used
- **Agent Used**: Which AI agent was used
- **Model Used**: Which AI model was used
- **Tags**: User-defined tags for organization

### UI Components

#### Chat History Sidebar
- **Conversation List**: Show all conversations sorted by recent
- **Conversation Cards**: Show conversation title, preview, timestamp
- **New Conversation Button**: Start new chat
- **Search Bar**: Search conversations
- **Filter Tags**: Filter by tags/favorites

#### Conversation Card
- **Title**: Conversation title (editable)
- **Preview**: Last message preview (100 chars)
- **Timestamp**: Relative time (e.g., "2 hours ago")
- **Message Count**: Badge showing total messages
- **Actions**: Delete, rename, archive, favorite

#### Message Search
- **Search Input**: Full-text search across all messages
- **Filters**: Date range, agent, tags
- **Results**: Show matching messages with conversation context
- **Actions**: Jump to message, copy text, delete message

## Constraints
- Persistent chat history (IndexedDB)
- Message threading with summaries
- Context window management (token limits)
- Full-text message search
- Conversation metadata (tags, favorites, archive)
- Mobile: Collapsible sidebar with swipe gesture
- i18n strings via t() function
- 8-bit gaming style (no blur)

## Acceptance Criteria
- [ ] Chat history persistence (IndexedDB)
- [ ] Conversation CRUD (create, delete, rename, archive)
- [ ] Message threading with collapse/expand
- [ ] Context window management (auto-prune, priority messages)
- [ ] Full-text message search with filters
- [ ] Conversation metadata (tags, favorites, timestamps)
- [ ] Chat history sidebar (conversation cards, search, filters)
- [ ] Mobile: Collapsible sidebar
- [ ] i18n strings via t() function
- [ ] 8-bit gaming style maintained

## Skills to Invoke
- `frontend-components` - Build chat history UI
- `brainstorming` - Design threading system
- `global-coding-style` - Chat patterns
- `global-validation` - Message validation

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Verify chat history components
ls -la src/presentation/components/chat/ChatHistory.tsx

# Verify chat history store
ls -la src/infrastructure/persistence/stores/chat-history-store.ts
```

## Related Issues
- AI conversation continuity
- Context management
- Message searchability

## Next Action
Create AI chat history system with persistent conversations, threading, context management, and search.

---
**Handoff ID**: S-041-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: development-essentials:code
