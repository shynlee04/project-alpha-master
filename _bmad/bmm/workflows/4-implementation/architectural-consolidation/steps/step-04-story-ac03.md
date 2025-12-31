# Step 4: Story AC-03 - Chat Panel Standardization

**Story Goal:** Create workspace-agnostic ChatPanel that can be embedded in any workspace with consistent behavior.

---

## 4.1 PRE-IMPLEMENTATION RESEARCH

### Required Research

#### Research R1: Current ChatPanel Implementation
```
Tool: Codebase search
Query: Find ChatPanel component and its dependencies
Files to examine:
  - src/components/chat/ChatPanel.tsx
  - src/components/chat/*.tsx
  - src/hooks/useChat*.ts
```

#### Research R2: TanStack AI Chat Pattern
```
Tool: Context7
Query: "TanStack AI useChat streaming React"
Purpose: Verify correct streaming pattern
```

**CHECKPOINT: Research Complete**
- [ ] ChatPanel current implementation understood
- [ ] Streaming pattern verified
- [ ] Dependencies mapped

---

## 4.2 IMPLEMENTATION TASKS

### Task T1: Create Chat Context Provider

**File:** `src/components/chat/ChatContext.tsx` (CREATE)

```typescript
/**
 * Chat Context Provider
 * 
 * Provides chat state and actions to any component tree.
 * Enables workspace-agnostic chat functionality.
 */

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAgentsStore } from '@/stores/agents-store';
import { useProviderModelsStore } from '@/stores/provider-models-store';
import { useConversationStore } from '@/lib/state/conversation-store';

interface ChatContextValue {
  // Agent state
  activeAgent: Agent | null;
  agents: Agent[];
  
  // Provider state
  activeProvider: Provider | null;
  activeModel: Model | null;
  
  // Conversation state
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  
  // Actions
  sendMessage: (content: string) => Promise<void>;
  stopGeneration: () => void;
  clearConversation: () => void;
  
  // Configuration
  workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
}

const ChatContext = createContext<ChatContextValue | null>(null);

interface ChatProviderProps {
  children: ReactNode;
  workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
  threadId?: string;
}

export function ChatProvider({ 
  children, 
  workspaceType,
  threadId 
}: ChatProviderProps) {
  // Get active agent
  const { agents, activeAgentId } = useAgentsStore();
  const activeAgent = useMemo(
    () => agents.find(a => a.id === activeAgentId) || null,
    [agents, activeAgentId]
  );
  
  // Get active provider/model
  const { selectedProviderId, selectedModelId, providers } = useProviderModelsStore();
  const activeProvider = providers[selectedProviderId] || null;
  const activeModel = activeProvider?.models?.find(m => m.id === selectedModelId) || null;
  
  // Get conversation state
  const conversationStore = useConversationStore();
  const currentThread = conversationStore.threads[threadId || 'default'] || {
    messages: [],
    isLoading: false,
    isStreaming: false,
  };
  
  // Actions
  const sendMessage = async (content: string) => {
    // Implementation using TanStack AI
  };
  
  const stopGeneration = () => {
    // Implementation
  };
  
  const clearConversation = () => {
    // Implementation
  };
  
  const value = useMemo(() => ({
    activeAgent,
    agents,
    activeProvider,
    activeModel,
    messages: currentThread.messages,
    isLoading: currentThread.isLoading,
    isStreaming: currentThread.isStreaming,
    sendMessage,
    stopGeneration,
    clearConversation,
    workspaceType,
  }), [activeAgent, agents, activeProvider, activeModel, currentThread, workspaceType]);
  
  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
```

**CHECKPOINT: Task T1 Complete**
- [ ] ChatContext created
- [ ] useChatContext hook exported
- [ ] TypeScript compiles

---

### Task T2: Create Workspace-Agnostic ChatPanel

**File:** `src/components/chat/ChatPanelUnified.tsx` (CREATE or MODIFY existing)

```typescript
/**
 * Unified Chat Panel
 * 
 * Workspace-agnostic chat component that works in any workspace.
 * Uses ChatContext for state management.
 */

import { useChatContext } from './ChatContext';
import { ChatInput } from './ChatInput';
import { ChatMessages } from './ChatMessages';
import { ChatHeader } from './ChatHeader';

interface ChatPanelUnifiedProps {
  className?: string;
  showHeader?: boolean;
  showAgent?: boolean;
}

export function ChatPanelUnified({
  className,
  showHeader = true,
  showAgent = true,
}: ChatPanelUnifiedProps) {
  const {
    messages,
    isLoading,
    isStreaming,
    activeAgent,
    sendMessage,
    stopGeneration,
    workspaceType,
  } = useChatContext();
  
  return (
    <div className={cn(
      'flex flex-col h-full bg-background border-l border-border',
      className
    )}>
      {showHeader && (
        <ChatHeader 
          agent={activeAgent}
          workspaceType={workspaceType}
        />
      )}
      
      <ChatMessages 
        messages={messages}
        isLoading={isLoading}
        isStreaming={isStreaming}
        className="flex-1 overflow-y-auto"
      />
      
      <ChatInput 
        onSend={sendMessage}
        onStop={stopGeneration}
        isLoading={isLoading}
        isStreaming={isStreaming}
        placeholder={`Ask ${activeAgent?.name || 'AI'}...`}
        className="border-t border-border"
      />
    </div>
  );
}
```

**CHECKPOINT: Task T2 Complete**
- [ ] ChatPanelUnified created
- [ ] Uses ChatContext
- [ ] Workspace-agnostic

---

### Task T3: Update Chat Barrel Export

**File:** `src/components/chat/index.ts` (MODIFY)

```typescript
// Existing exports
export { ChatPanel } from './ChatPanel';
export { ChatInput } from './ChatInput';
export { ChatMessages } from './ChatMessages';

// New unified exports
export { ChatProvider, useChatContext } from './ChatContext';
export { ChatPanelUnified } from './ChatPanelUnified';
```

**CHECKPOINT: Task T3 Complete**
- [ ] Barrel export updated
- [ ] All exports working

---

### Task T4: Integrate Chat in Knowledge Workspace

**File:** `src/components/knowledge/KnowledgePage.tsx` (MODIFY)

```typescript
import { ChatProvider, ChatPanelUnified } from '@/components/chat';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';

export function KnowledgePage() {
  return (
    <ChatProvider workspaceType="knowledge">
      <div className="knowledge-page flex flex-col h-full">
        {/* Header with AgentSelector */}
        <header className="...">
          <AgentSelector variant="compact" workspaceType="knowledge" />
        </header>
        
        {/* Main content with resizable chat */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={70} minSize={50}>
            {/* Knowledge content */}
            <main className="h-full overflow-hidden">
              {/* ... existing knowledge content ... */}
            </main>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={30} minSize={20}>
            <ChatPanelUnified showHeader={false} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </ChatProvider>
  );
}
```

**CHECKPOINT: Task T4 Complete**
- [ ] Chat integrated in Knowledge
- [ ] Resizable panel working
- [ ] Chat functional

---

## 4.3 ACCEPTANCE CRITERIA VALIDATION

| AC | Criteria | Test Method | Status |
|----|----------|-------------|--------|
| AC-03.1 | Chat works in Knowledge workspace | Send message → get response | [ ] |
| AC-03.2 | Streaming responses functional | Verify streaming tokens | [ ] |
| AC-03.3 | Tool execution badges visible | Trigger tool → verify badge | [ ] |
| AC-03.4 | Conversation persists across navigation | Chat → navigate → return | [ ] |

---

## 4.4 SWEEPING VALIDATION

Run these checks:

**Level 1 (State Integrity):**
- [ ] Conversation state in Zustand only (no useState duplication)
- [ ] Persist middleware working

**Level 5 (Integration Reality):**
- [ ] WebContainer ready guard for IDE tools
- [ ] API key validation before chat

**Level 6 (Architecture Compliance):**
- [ ] No direct db access in ChatPanel
- [ ] Agent context injection working

---

## NEXT STEP

When all acceptance criteria pass:
1. Update story status to DONE
2. Proceed to `step-05-phase0-validation.md` for Phase 0 gate

**HALT and WAIT for user to confirm story completion.**
