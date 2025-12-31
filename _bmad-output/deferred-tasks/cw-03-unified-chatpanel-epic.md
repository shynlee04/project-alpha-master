# CW-03: Unified ChatPanel - Epic Specification

**Status**: DEFERRED to dedicated UI refactoring sprint
**Estimated Effort**: 5-7 development days
**Priority**: P1 (High - UX consistency across workspaces)
**Created**: 2025-12-31
**Epic ID**: cw-03-unified-chatpanel

## Problem Statement

The codebase currently has three separate chat panel implementations with different data models, UI patterns, and functionality:

| Component | LOC | Workspace | Purpose |
|-----------|-----|-----------|---------|
| ChatPanel.tsx | 271 | IDE | Thread-based conversations with agent selection |
| RAGChatPanel.tsx | 281 | Knowledge | Simple message list with citation support |
| AgentChatPanel.tsx | 316 | IDE | Tool-enabled agent chat with approval workflow |

Additionally:
- **Study workspace**: Has AgentSelector but NO chat panel
- **Notes workspace**: Has AgentSelector but NO chat panel

## Current Implementation Analysis

### ChatPanel.tsx (IDE Workspace)
**Features:**
- Thread management via conversation-threads-store
- Agent selection with agents-store
- SSE streaming from /api/chat
- Demo mode seeding for mobile
- ThreadsList and ChatConversation subcomponents

**Data Model:**
```typescript
interface ChatPanelProps {
  projectId: string;
  className?: string;
}
```

**State Management:**
- useThreadsStore for thread CRUD
- useAgentSelection for agent choice
- Local streaming state

### RAGChatPanel.tsx (Knowledge Workspace)
**Features:**
- Simple message array (no threads)
- Citation support with clickable markers
- RAG-specific UI (citation sidebar integration)
- Streaming support
- Clear chat functionality

**Data Model:**
```typescript
interface RAGChatPanelProps {
  messages: ChatMessage[];
  activeCitation: Citation | null;
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
  onCitationClick: (citation: Citation) => void;
  onCloseCitation: () => void;
  loading: boolean;
  error: string | null;
}
```

**State Management:**
- Pure presentational component (parent manages state)

### AgentChatPanel.tsx (IDE Workspace)
**Features:**
- Tool execution (file operations, terminal commands)
- Tool approval workflow
- API key management
- useAgentChatWithTools hook (TanStack AI)
- Facade pattern for workspace tools
- Auto-approve settings
- Prompt enhancement

**Data Model:**
```typescript
interface AgentChatPanelProps {
  projectId: string | null;
  projectName?: string;
}
```

**State Management:**
- useAgentChatWithTools hook
- useConversationStore
- useAutoApproveStore
- Workspace context (tools)

## Incompatibility Analysis

The three implementations cannot be trivially unified because:

### 1. Data Model Differences
- **ChatPanel**: Thread-based (collections of messages)
- **RAGChatPanel**: Flat message array
- **AgentChatPanel**: Flat message array with tool calls

### 2. State Management Differences
- **ChatPanel**: Threads store + agents store
- **RAGChatPanel**: Parent-managed state
- **AgentChatPanel**: Complex hook chain (useAgentChatWithTools, stores, workspace)

### 3. Feature Differences
- **ChatPanel**: Thread management, demo mode
- **RAGChatPanel**: Citations, source preview
- **AgentChatPanel**: Tool approvals, API key UI, prompt enhancement

### 4. Streaming Implementation Differences
- **ChatPanel**: Manual SSE parsing from /api/chat
- **RAGChatPanel**: Parent-controlled streaming
- **AgentChatPanel**: TanStack AI SDK streaming

## Proposed Unified Architecture

### Phase 1: Type Unification (Day 1-2)

Create unified type system supporting all modes:

```typescript
// chat-panel-types.ts
export type ChatMode = 'threaded' | 'simple' | 'agent';

export interface BaseMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ThreadedMessage extends BaseMessage {
  threadId: string;
  agentId?: string;
  agentName?: string;
  agentModel?: string;
}

export interface SimpleMessage extends BaseMessage {
  citations?: Citation[];
  streaming?: boolean;
}

export interface AgentMessage extends BaseMessage {
  toolCalls?: ToolCall[];
  agentId?: string;
}

export type UnifiedMessage = ThreadedMessage | SimpleMessage | AgentMessage;

export interface UnifiedChatPanelProps {
  mode: ChatMode;
  projectId: string;
  workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
  // Mode-specific props
  threaded?: {
    threads: Thread[];
    activeThreadId: string | null;
    onNewThread: () => void;
    onSelectThread: (id: string) => void;
    onDeleteThread: (id: string) => void;
  };
  simple?: {
    messages: SimpleMessage[];
    onSendMessage: (msg: string) => void;
    onClearChat?: () => void;
  };
  agent?: {
    messages: AgentMessage[];
    toolApprovals: PendingApprovalInfo[];
    onApproveTool: (id: string) => void;
    onRejectTool: (id: string) => void;
  };
  // Common props
  loading?: boolean;
  error?: string | null;
  className?: string;
}
```

### Phase 2: Component Refactoring (Day 3-4)

Extract common UI components:

1. **ChatMessageList** - Reusable message renderer
2. **ChatInput** - Unified input component
3. **ChatHeader** - Consistent header with actions
4. **StreamingIndicator** - Reusable loading state

### Phase 3: Implementation (Day 5-6)

Create UnifiedChatPanel as orchestrator:

```typescript
// UnifiedChatPanel.tsx
export function UnifiedChatPanel(props: UnifiedChatPanelProps) {
  // Mode-specific rendering
  switch (props.mode) {
    case 'threaded':
      return <ThreadedChatPanel {...props.threaded} />;
    case 'simple':
      return <SimpleChatPanel {...props.simple} />;
    case 'agent':
      return <AgentChatPanel {...props.agent} />;
  }
}
```

### Phase 4: Migration (Day 7)

Update workspace pages:
1. IDE layout: AgentChatPanel → UnifiedChatPanel (mode='agent')
2. Knowledge page: RAGChatPanel → UnifiedChatPanel (mode='simple')
3. Study page: Add UnifiedChatPanel (mode='simple')
4. Notes page: Add UnifiedChatPanel (mode='simple')

## Implementation Strategy

### Option A: Complete Unification (Recommended)
Create a single UnifiedChatPanel component with mode-based rendering.

**Pros:**
- Single source of truth
- Consistent UX across all workspaces
- Easier maintenance long-term

**Cons:**
- High initial effort (5-7 days)
- Risk of introducing bugs during migration
- Complex mode-switching logic

### Option B: Shared Components
Extract common components but keep three separate panels.

**Pros:**
- Lower risk (incremental changes)
- Can ship improvements independently
- Easier to test

**Cons:**
- Still three codebases to maintain
- UX inconsistencies may remain
- Doesn't fully solve the problem

### Option C: Adapter Pattern
Create adapter components that wrap existing implementations.

**Pros:**
- Fastest to implement
- Zero risk to existing functionality
- Can be done incrementally

**Cons:**
- Adds abstraction layer
- Doesn't reduce code duplication
- Technical debt remains

## Recommended Approach

**Option A with phased rollout:**

1. **Week 1: Foundation**
   - Create unified types
   - Extract common UI components
   - Set up testing infrastructure

2. **Week 2: Implementation**
   - Implement UnifiedChatPanel with mode switching
   - Migrate one workspace (start with Study - simplest)
   - Test and validate

3. **Week 3: Rollout**
   - Migrate remaining workspaces
   - Remove old implementations
   - Final testing and polish

## Acceptance Criteria

- [ ] Single UnifiedChatPanel component exists
- [ ] Works in all 4 workspaces (IDE, Knowledge, Study, Notes)
- [ ] Threaded mode works (IDE)
- [ ] Simple mode works (Knowledge, Study, Notes)
- [ ] Agent mode works (IDE with tools)
- [ ] Tool approval consistent across workspaces
- [ ] Build passes
- [ ] No functionality lost
- [ ] All tests pass

## Dependencies

- None blocking
- Can be executed independently
- Recommend completing after AgentConfigDialog refactoring (similar scope)

## Success Metrics

- Reduced code duplication: ~900 LOC → ~600 LOC (unified components)
- Consistent UX: All workspaces use same chat patterns
- Maintainability: Single component to update vs three separate

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|-------|-----------|
| Breaking existing functionality | Medium | High | Comprehensive test suite, gradual migration |
| Performance regression | Low | Medium | Benchmark before/after, optimize hot paths |
| UX inconsistency during migration | High | Low | Feature flags, gradual rollout |
| Mode-switching complexity | Medium | Medium | Clear type guards, exhaustive testing |

## Handoff

**Assigned To**: UI/UX Refactoring Team
**Sprint**: TBD (Future sprint)
**Epic Link**: `_bmad-output/deferred-tasks/cw-03-unified-chatpanel-epic.md`
**Status**: Ready for sprint planning

---

**Document Version**: 1.0
**Last Updated**: 2025-12-31
**Author**: ARC Module Ralph Loop
**Reviewers**: TBD
