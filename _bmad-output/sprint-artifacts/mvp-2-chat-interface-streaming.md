# Story MVP-2: AI Chat Platform with Rich Streaming

**Story ID**: MVP-2
**Epic**: MVP - AI Coding Agent Vertical Slice
**Sprint**: Sprint MVP
**Status**: 🔄 IN_PROGRESS (Planning)
**Points**: 30 (upgraded from 5)
**Priority**: P0
**Depends On**: MVP-1 (DONE)

---

## User Story

**As a** developer using Via-gent IDE,
**I want** a full-featured AI chat platform with conversation threads, agent selection, and rich text rendering,
**So that** I can have organized conversations with different AI agents, view formatted explanations with diagrams, and access my chat history.

---

## Core Requirements

> [!IMPORTANT]
> **This is NOT a simple chat interface - it's a full AI chat PLATFORM**
>
> Must include:
> 1. **Conversation Threads**: Create, switch, delete threads
> 2. **Agent Selection**: Dropdown to select/switch agents
> 3. **Rich Text Rendering**: Markdown, code blocks, mermaid diagrams
> 4. **Persistent History**: Threads survive browser refresh
> 5. **Real-time Streaming**: SSE with incomplete markdown handling

---

## Acceptance Criteria

### Thread Management

#### AC-1: Create New Conversation Thread
**Given** I have at least one configured agent
**When** I click "New Chat" button
**Then** A new conversation thread is created for the selected agent
**And** The thread appears in the sidebar
**And** The chat area clears for new conversation

#### AC-2: Switch Between Threads
**Given** I have multiple conversation threads
**When** I click on a thread in the sidebar
**Then** The chat area loads that thread's messages
**And** The active thread is highlighted

#### AC-3: Delete Conversation Thread
**Given** I have a conversation thread
**When** I click delete on a thread
**Then** A confirmation dialog appears
**And** Upon confirm, the thread and its messages are deleted

#### AC-4: Thread Title Auto-Generation
**Given** I start a new conversation
**When** I send my first message
**Then** The thread title is set from the first few words of my message

### Agent Selection

#### AC-5: Agent Selector Dropdown
**Given** I have multiple configured agents
**When** I click the agent selector in chat header
**Then** I see all agents with their status (online/offline/busy)
**And** I see the provider and model for each agent

#### AC-6: Switch Agent Mid-Session
**Given** I am in a conversation
**When** I select a different agent from dropdown
**Then** I am prompted to start new thread or continue
**And** The API calls use the new agent's configuration

### Rich Text Rendering

#### AC-7: Markdown Rendering
**Given** The AI responds with markdown
**When** The response is displayed
**Then** I see formatted headers, lists, tables, bold, italic, links

#### AC-8: Code Block Syntax Highlighting
**Given** The AI responds with code blocks
**When** The response is displayed
**Then** I see syntax highlighted code with copy button

#### AC-9: Mermaid Diagram Rendering
**Given** The AI responds with mermaid code blocks
**When** The response is displayed
**Then** I see rendered diagrams (flowcharts, sequence, class diagrams)
**And** I can view fullscreen, download, copy the diagram

#### AC-10: Streaming Safety
**Given** The AI is streaming a response with incomplete markdown
**When** The response is mid-stream
**Then** The partial content renders gracefully without errors

### Persistence

#### AC-11: Thread Persistence
**Given** I have active conversation threads
**When** I refresh the browser
**Then** All threads are restored with their messages

#### AC-12: Message Persistence
**Given** I send/receive messages in a thread
**When** The messages are saved
**Then** They persist to Dexie.js database

### Streaming & API

#### AC-13: SSE Streaming Works
**Given** I send a message
**When** The AI responds
**Then** Tokens appear progressively in real-time

#### AC-14: Error Handling
**Given** A network error or API error occurs
**When** The request fails
**Then** I see a clear error message with retry option

---

## UI Component Specification

### Chat Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [Agent ▼]  │ Thread Title         │ [⚙] [+ New Chat]       │
├──────────────┬──────────────────────────────────────────────┤
│              │  Messages Area (Streamdown)                  │
│  SIDEBAR     │                                              │
│  ─────────   │  [User]: Message...                         │
│  Today       │  [Agent]: Response with **markdown**        │
│  ⊙ Thread 1  │          ```mermaid                         │
│    Thread 2  │          flowchart LR                       │
│  ──────────  │              A-->B                          │
│  Yesterday   │          ```                                │
│    Thread 3  │                                              │
│              │  ────────────────────────────────────────    │
│              │  Tool Logs (collapsible)                     │
│              │  ────────────────────────────────────────    │
├──────────────┴──────────────────────────────────────────────┤
│ [Type a message...                              ] [Send ▷]  │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy
```
ChatLayout
├── ChatHeader
│   ├── AgentSelector (dropdown)
│   ├── ThreadTitle (editable)
│   └── Actions (settings, new chat)
├── ConversationSidebar
│   ├── NewChatButton
│   ├── ThreadGroup (Today)
│   │   └── ThreadItem (title, preview, delete)
│   └── ThreadGroup (Yesterday)
│       └── ...
├── ChatMain
│   ├── MessageList
│   │   └── Message
│   │       ├── UserMessage (plain text)
│   │       └── AssistantMessage (StreamdownRenderer)
│   └── ToolExecutionLog (collapsible)
└── ChatInput
    ├── TextArea
    └── SendButton
```

---

## Tasks

### Research (Complete)
- [x] T0-R1: Query react-markdown/streamdown patterns ✅
- [x] T0-R2: Query mermaid integration ✅

### Module 1: Thread Management Store (8 points)
- [x] T1.1: Create `ConversationThread` type definition ✅
- [x] T1.2: Create `conversation-threads-store.ts` with Zustand persist ✅
- [ ] T1.3: Extend `conversation-store.ts` for thread-based storage
- [ ] T1.4: Write unit tests for thread store

### Module 2: Agent Selection (5 points)
- [x] T2.1: Create `AgentSelector.tsx` component ✅
- [x] T2.2: Add agent status indicators (online/offline/busy) ✅
- [x] T2.3: Wire to `agent-selection-store.ts` ✅
- [ ] T2.4: Write component tests

### Module 3: Rich Text Rendering (5 points)
- [x] T3.1: Install react-markdown + mermaid ✅
- [x] T3.2: Create `StreamdownRenderer.tsx` with fallback ✅
- [x] T3.3: Update `EnhancedChatInterface.tsx` to use Streamdown ✅
- [ ] T3.4: Add CSS for prose styling

### Module 4: Conversation UI (8 points)
- [x] T4.1: Create `ThreadCard.tsx` and `ThreadsList.tsx` (box-card layout) ✅
- [x] T4.2: Create `ChatPanel.tsx` and `ChatConversation.tsx` ✅
- [x] T4.3: Update `ChatPanelWrapper.tsx` to wire components ✅
- [x] T4.4: Add i18n keys for English/Vietnamese (13 keys each) ✅

### Module 5: Integration & Testing (4 points)
- [x] T5.1: Wire all stores together in ChatPanelWrapper ✅
- [ ] T5.2: Add integration tests
- [ ] T5.3: Browser E2E verification with screenshots
- [ ] T5.4: Capture mermaid rendering evidence

---

## Key Files

### New Files
| File | Purpose | Status |
|------|---------|--------|
| `src/stores/conversation-threads-store.ts` | Thread state management with Zustand persist | ✅ Created |
| `src/components/chat/ThreadCard.tsx` | Individual thread card (8-bit styled) | ✅ Created |
| `src/components/chat/ThreadsList.tsx` | Paginated thread grid | ✅ Created |
| `src/components/chat/AgentSelector.tsx` | Agent dropdown with status | ✅ Created |
| `src/components/chat/ChatConversation.tsx` | Active conversation view | ✅ Created |
| `src/components/chat/ChatPanel.tsx` | View orchestrator | ✅ Created |
| `src/components/chat/StreamdownRenderer.tsx` | react-markdown + mermaid | ✅ Created |

### Modified Files
| File | Changes | Status |
|------|---------|--------|
| `src/components/layout/ChatPanelWrapper.tsx` | Wires ThreadsList → AgentChatPanel | ✅ Done |
| `src/components/ide/EnhancedChatInterface.tsx` | Uses StreamdownRenderer | ✅ Done |
| `src/i18n/en.json` | +13 chat keys | ✅ Done |
| `src/i18n/vi.json` | +13 chat keys | ✅ Done |

### Packages Added
| Package | Version | Purpose |
|---------|---------|---------|
| `react-markdown` | Latest | Markdown rendering |
| `remark-gfm` | Latest | GitHub Flavored Markdown |
| `mermaid` | ^11.x | Diagram rendering |


---

## Traceability

- **Traces to**: Epic 25-1 (Chat streaming), Epic 25-4 (AgentChatPanel)
- **Depends on**: MVP-1 (Agent Configuration) - DONE
- **Blocks**: MVP-3 (File Operations require chat context)

---

## Dev Agent Record

### Session 1: 2025-12-25T10:40:00+07:00
**Agent**: claude-3-5-sonnet (Antigravity)
**Mode**: PLANNING (story-dev-cycle)

#### Initial Research
- Discovered `streamdown` from Vercel - AI streaming optimized markdown
- Built-in Mermaid diagram support with theming
- Installed `streamdown@1.6.10`
- Created `StreamdownRenderer.tsx`

#### User Feedback (10:47)
> "This story lacks many important factors to really make a chat platform for AI agent - where is persistent thread of discussion, create, remove, etc check the sensible valid props too to select agents from dropdowns and states etc, make 10 times effort please"

#### Revised Scope
- Upgraded from 5 points to 30 points (6x effort)
- Added conversation thread management
- Added agent selection in chat
- Added conversation sidebar UI
- Created comprehensive implementation plan

### Session 2: 2025-12-25T11:00:00+07:00
**Agent**: gemini-2.5-pro (Antigravity)
**Mode**: EXECUTION → VERIFICATION (story-dev-cycle)

#### Files Created
```
src/
├── stores/
│   └── conversation-threads-store.ts  # Thread management Zustand store
├── components/
│   └── chat/
│       ├── ThreadCard.tsx              # Individual thread card (8-bit styled)
│       ├── ThreadsList.tsx             # Paginated thread grid
│       ├── AgentSelector.tsx           # Agent dropdown with status
│       ├── ChatConversation.tsx        # Active conversation view
│       ├── ChatPanel.tsx               # View orchestrator
│       └── StreamdownRenderer.tsx      # react-markdown + mermaid
```

#### Files Modified
```
src/
├── components/
│   ├── layout/
│   │   └── ChatPanelWrapper.tsx        # Wires ThreadsList → AgentChatPanel flow
│   └── ide/
│       └── EnhancedChatInterface.tsx   # Uses StreamdownRenderer for assistant messages
├── i18n/
│   ├── en.json                         # +13 chat keys
│   └── vi.json                         # +13 chat keys
```

#### Key Decisions
1. Used `react-markdown` + `mermaid` instead of `streamdown` (type export issues)
2. Box-card layout for threads instead of sidebar (user preference)
3. Preserved existing `AgentChatPanel` - new components wire TO it, not replace it
4. Consistent 8-bit pixel aesthetic across all new components

#### Blockers Resolved
- Initial attempt replaced working chat → immediately reverted
- Proper integration: ThreadsList → existing AgentChatPanel

---

## Status History

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-25 10:40 | IN_PROGRESS | Initial story created |
| 2025-12-25 10:47 | IN_PROGRESS | Scope expanded per user feedback |
| 2025-12-25 11:48 | IN_PROGRESS | 14/20 tasks complete, pending E2E verification |

---

**Document Version**: 3.0
**Last Updated**: 2025-12-25T11:48:00+07:00
