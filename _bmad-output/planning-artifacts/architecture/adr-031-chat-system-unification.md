# ADR-031: Chat System Unification

**Document ID**: ADR-031
**Version**: 1.0.0
**Status**: APPROVED
**Created**: 2026-01-09T23:50:00+07:00
**Updated**: 2026-01-09T23:50:00+07:00
**Author**: @bmad-core-bmad-master
**Approver**: Admin
**Implementation Epic**: EPIC-40

---

## Context

The current codebase has **two disjoint chat systems** that create UX confusion and technical debt:

### System A: Cross-Workspace Threaded Chat
- **Location**: `src/infrastructure/persistence/stores/conversation/`
- **Features**:
  - Hierarchical thread management
  - Cross-workspace sharing via event bus
  - IndexedDB persistence
  - Message history with timestamps
- **Limitations**:
  - ❌ No tool execution
  - ❌ No approval flow
  - ❌ Flat message structure (no tool results)

### System B: Agent-Centric Chat
- **Location**: `src/presentation/components/ide/AgentChatPanel.tsx`
- **Features**:
  - Full tool execution with approval
  - Workspace-specific tool filtering
  - Streaming responses
  - Tool result rendering
- **Limitations**:
  - ❌ Flat conversations (no threads/hierarchy)
  - ❌ No cross-workspace sharing
  - ❌ No dedicated persistence (ephemeral state)

### Evidence of Fragmentation

```typescript
// System A: Separate conversations per workspace (no tools)
const conversations = {
  ide: [{ id: '1', role: 'user', content: 'Help me code' }],
  notes: [],
  knowledge: [],
  study: [],
};

// System B: Agent chat with tools (no threads)
const { messages, sendMessage, pendingToolCall } = useAgentChatWithTools({
  agentId,
  workspaceContext,
  tools: [readFile, writeFile, executeCommand],
});
```

### Research Sources

1. **E2E Tests**: `src/e2e/__tests__/epic-e1-cross-workspace-chat.e2e.test.tsx` (675 lines)
2. **Chat Hook**: `src/lib/agent/hooks/use-agent-chat-with-tools.ts` (533 lines)
3. **Conversation Store**: `src/infrastructure/persistence/stores/conversation/`
4. **Team A Research**: `_bmad-output/research/2026-01-09/multimodality-chat-architecture/`
5. **Team B Research**: `_bmad-output/research/chat-systems-research-2026-01-09.md`

---

## Decision

### ADR Type: Unification Architecture

We will **unify both chat systems** into a single `UnifiedChatStore` that combines:

1. **Thread Hierarchy** from System A
2. **Tool Execution** from System B
3. **Cross-Workspace Events** from existing event bus
4. **Multimodal Content** from ADR-030

### Unification Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                      UnifiedChatStore (NEW)                          │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  Thread Management Layer (from System A)                        ││
│  │  - Hierarchical threads with parent/child relationships         ││
│  │  - Thread isolation per workspace                               ││
│  │  - Cross-workspace references via event bus                     ││
│  └─────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  Message Layer (Combined)                                        ││
│  │  - UserMessage, AssistantMessage, ToolCallMessage, ToolResult   ││
│  │  - Multimodal content (text, image, audio, document)            ││
│  │  - Streaming support with chunk assembly                        ││
│  └─────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  Tool Execution Layer (from System B)                           ││
│  │  - AgentToolBinding per workspace                               ││
│  │  - Pending approval flow                                        ││
│  │  - Tool result rendering                                        ││
│  └─────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  Persistence Layer (Dexie + IndexedDB)                          ││
│  │  - Automatic sync on message send                               ││
│  │  - Hydration on app load                                        ││
│  │  - Export/import for backup                                     ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Data Model

```typescript
// Unified Message Type
interface UnifiedMessage {
  id: string;
  threadId: string;
  parentMessageId: string | null;
  role: 'user' | 'assistant' | 'tool_call' | 'tool_result' | 'system';
  content: MultimodalContent[];
  metadata: {
    workspaceType: WorkspaceType;
    agentId: string | null;
    toolId: string | null;
    timestamp: number;
    tokenCount: number;
  };
}

// Thread Type
interface ChatThread {
  id: string;
  workspaceId: string;
  workspaceType: WorkspaceType;
  title: string;
  messages: UnifiedMessage[];
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}

// Store Interface
interface UnifiedChatStore {
  // Thread operations
  threads: Record<string, ChatThread>;
  activeThreadId: string | null;
  createThread: (workspaceType: WorkspaceType) => string;
  deleteThread: (threadId: string) => void;
  switchThread: (threadId: string) => void;

  // Message operations
  sendMessage: (content: MultimodalContent[]) => Promise<void>;
  editMessage: (messageId: string, content: MultimodalContent[]) => void;
  deleteMessage: (messageId: string) => void;

  // Tool operations
  executeTool: (toolId: string, args: unknown) => Promise<ToolResult>;
  approveTool: (callId: string) => void;
  rejectTool: (callId: string) => void;
  pendingToolCalls: PendingToolCall[];

  // Persistence
  hydrateFromDB: () => Promise<void>;
  persistToDB: () => Promise<void>;
}
```

### Migration Path

| Phase | Action | Rollback |
|-------|--------|----------|
| 1. Facade | Create UnifiedChatStore wrapping both systems | Remove facade |
| 2. Migrate System A | Move thread logic to unified store | Feature flag |
| 3. Migrate System B | Move tool logic to unified store | Feature flag |
| 4. Deprecate | Remove old stores, update imports | Restore old stores |
| 5. Cleanup | Delete deprecated code | N/A (final) |

---

## Consequences

### Positive Consequences

1. **Single Source of Truth** - One store for all chat state
2. **Consistent UX** - Same chat experience in all workspaces
3. **Full Feature Set** - Threads + Tools in one place
4. **Simplified Testing** - One store to mock/test
5. **Reduced Bundle Size** - Eliminate duplicate code

### Negative Consequences

1. **Migration Risk** - Data loss if migration fails
2. **Breaking Changes** - Imports must be updated
3. **Initial Complexity** - More code during transition
4. **Test Coverage** - Existing tests need updates

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Data Loss | Full backup before migration, rollback script |
| Breaking Changes | Facade pattern, deprecation warnings |
| Test Coverage | Parallel test suites during migration |
| Performance | Profile before/after, optimize hydration |

---

## Implementation

### Epic Reference
- **EPIC-40**: Multimodal Chat Unification
- **Stories**: MM-01 (Unified Store), MM-02 (Thread Mgmt), MM-03 (Tool Unification)

### Files Created
```
src/infrastructure/persistence/stores/chat/unified-chat-store.ts       # MM-01
src/infrastructure/persistence/stores/chat/chat-thread-slice.ts        # MM-02
src/infrastructure/persistence/stores/chat/chat-tool-slice.ts          # MM-03
src/infrastructure/persistence/stores/chat/chat-persistence-slice.ts   # Persistence
src/infrastructure/persistence/stores/chat/types.ts                    # Type definitions
```

### Files Modified
```
src/lib/agent/hooks/use-agent-chat-with-tools.ts                       # Delegate to unified
src/presentation/components/ide/AgentChatPanel.tsx                     # Use unified store
src/infrastructure/persistence/stores/conversation/useConversationStore.ts # Deprecate
```

### Files Deprecated
```
src/infrastructure/persistence/stores/conversation/  # Mark for removal in v2.1
```

### Dependencies
- Zustand v5
- Dexie (IndexedDB)
- immer (immutable updates)
- Cross-workspace event bus

---

## Comparison: Before vs After

### Before (Dual Systems)
```
User sends message in Notes
  ↓
System A (ConversationStore) saves message
  ↓
User wants to run AI tool (summarize)
  ↓
System B (AgentChatPanel) handles tool
  ↓
Tool result NOT saved to System A
  ↓
Thread history incomplete ❌
```

### After (Unified Store)
```
User sends message in Notes
  ↓
UnifiedChatStore saves message
  ↓
User wants to run AI tool (summarize)
  ↓
UnifiedChatStore.executeTool() handles tool
  ↓
Tool call + result saved to thread
  ↓
Thread history complete ✅
```

---

## Test Strategy

### Unit Tests
- Thread CRUD operations
- Message CRUD operations
- Tool execution flow
- Persistence hydration/sync

### Integration Tests
- Cross-workspace thread access
- Tool approval cascade
- Multimodal content handling

### E2E Tests
- Complete conversation flow with tools
- Thread switching
- Chat persistence across refresh

---

## Governance Acknowledgment

```yaml
governance:
  constitution: "_bmad/modules/governance/CONSTITUTION.md"
  version: "1.0.0"
  acknowledged_at: "2026-01-09"
  acknowledged_by: "@bmad-core-bmad-master"
  compliance:
    artifact_lifecycle: true
    naming_convention: true
    stale_artifact_protocol: true
    multi_team_coordination: true
    read_only_templates: true
  validation:
    before_execution: true
    after_completion: true
    on_error: true
```

---

## Related Documents

- **ADR-026**: AI Service Unification
- **ADR-030**: Multimodal Integration Architecture
- **EPIC-40**: Multimodal Chat Unification
- **Architecture.md**: Section 3.2 (Cross-Workspace Communication)

---

**Document Version**: 1.0.0
**Status**: APPROVED - Ready for Implementation
**Next Review**: 2026-02-09 (30 days)
