---
name: wire-chat-to-rag
description: "Wire Unified ChatPanel to RAG Retrieval (GAP-002)"
agent: linkage-discoverer
estimated_effort: "8 hours"
---

# Wire Chat Interface to RAG Retrieval

**Purpose:** Create a unified ChatPanel with mode toggle that can route queries 
through the RAG system for knowledge-enhanced responses with citations.

**Gap Reference:** GAP-002, GAP-005 in `data/integration-gaps.yaml`

---

## Prerequisites

- [ ] Verify `pnpm build` passes before starting
- [ ] GAP-001 (Source→RAG) should be complete
- [ ] Review existing implementation:
  - `src/presentation/components/chat/ChatPanel.tsx`
  - `src/hooks/useAgentChat.ts`
  - `src/lib/rag/hybrid-retriever.ts`
  - `src/presentation/components/rag/RAGChatPanel.tsx`
  - `src/presentation/components/rag/CitationSidebar.tsx`

---

## Step 1: Define Chat Mode Types

**Task:** Create types for chat modes and RAG-enhanced messages

**Output File:** `src/lib/agent/chat-mode-types.ts`

```typescript
// Chat Mode Types for unified ChatPanel

export type ChatMode = 'agent' | 'rag' | 'hybrid';

export interface ChatModeConfig {
  mode: ChatMode;
  description: string;
  icon: string;
  features: string[];
}

export const CHAT_MODES: Record<ChatMode, ChatModeConfig> = {
  agent: {
    mode: 'agent',
    description: 'Direct AI agent chat with tool access',
    icon: 'Bot',
    features: ['tool_execution', 'code_writing', 'file_operations'],
  },
  rag: {
    mode: 'rag',
    description: 'Knowledge base search and retrieval',
    icon: 'Search',
    features: ['semantic_search', 'citations', 'source_preview'],
  },
  hybrid: {
    mode: 'hybrid',
    description: 'AI agent enhanced with knowledge context',
    icon: 'Sparkles',
    features: ['tool_execution', 'knowledge_context', 'citations'],
  },
};

export interface RAGCitation {
  id: string;
  sourceId: string;
  sourceTitle: string;
  excerpt: string;
  relevanceScore: number;
  pageNumber?: number;
}

export interface RAGEnhancedMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: RAGCitation[];
  ragContext?: {
    query: string;
    retrievedChunks: number;
    searchTime: number;
  };
}
```

---

## Step 2: Create Chat Mode Toggle Component

**Task:** Create a mode toggle UI component

**Output File:** `src/presentation/components/chat/ChatModeToggle.tsx`

```tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CHAT_MODES, type ChatMode } from '@/lib/agent/chat-mode-types';

interface ChatModeToggleProps {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  disabled?: boolean;
}

export function ChatModeToggle({ mode, onModeChange, disabled }: ChatModeToggleProps) {
  const { t } = useTranslation();

  const icons = {
    agent: Bot,
    rag: Search,
    hybrid: Sparkles,
  };

  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg">
      {Object.entries(CHAT_MODES).map(([key, config]) => {
        const Icon = icons[key as ChatMode];
        const isActive = mode === key;
        
        return (
          <Button
            key={key}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onModeChange(key as ChatMode)}
            disabled={disabled}
            title={config.description}
          >
            <Icon className="w-4 h-4 mr-1" />
            {t(`chat.mode.${key}`)}
          </Button>
        );
      })}
    </div>
  );
}
```

---

## Step 3: Create useRAGChat Hook

**Task:** Create a hook that wraps useAgentChat with RAG retrieval

**Output File:** `src/hooks/useRAGChat.ts`

```typescript
import { useState, useCallback } from 'react';
import { useAgentChat } from './useAgentChat';
import { hybridRetriever } from '@/lib/rag/hybrid-retriever';
import type { ChatMode, RAGCitation, RAGEnhancedMessage } from '@/lib/agent/chat-mode-types';

interface UseRAGChatOptions {
  mode: ChatMode;
  projectId?: string;
  agentId?: string;
}

export function useRAGChat(options: UseRAGChatOptions) {
  const { mode, projectId, agentId } = options;
  const [citations, setCitations] = useState<RAGCitation[]>([]);
  const [isRetrieving, setIsRetrieving] = useState(false);

  const baseChat = useAgentChat({
    projectId,
    agentId,
    // Inject RAG context in hybrid mode
    systemPromptEnhancer: mode === 'hybrid' ? enhanceWithRAGContext : undefined,
  });

  const sendMessage = useCallback(async (content: string) => {
    if (mode === 'rag') {
      // Pure RAG mode: retrieve and format response
      setIsRetrieving(true);
      try {
        const results = await hybridRetriever.search(content, {
          limit: 5,
          includeMetadata: true,
        });
        
        const newCitations = results.hits.map((hit, index) => ({
          id: `cite-${index}`,
          sourceId: hit.document.sourceId,
          sourceTitle: hit.document.title,
          excerpt: hit.document.content.slice(0, 200),
          relevanceScore: hit.score,
        }));
        
        setCitations(newCitations);
        
        // Format as assistant message with citations
        return formatRAGResponse(content, results);
      } finally {
        setIsRetrieving(false);
      }
    } else if (mode === 'hybrid') {
      // Hybrid mode: retrieve context, then send to agent
      setIsRetrieving(true);
      try {
        const context = await retrieveContext(content);
        setCitations(context.citations);
        return baseChat.sendMessage(content, { ragContext: context });
      } finally {
        setIsRetrieving(false);
      }
    } else {
      // Agent mode: direct to agent
      return baseChat.sendMessage(content);
    }
  }, [mode, baseChat]);

  return {
    ...baseChat,
    sendMessage,
    citations,
    isRetrieving,
    mode,
  };
}

async function retrieveContext(query: string) {
  const results = await hybridRetriever.search(query, { limit: 3 });
  
  return {
    contextText: results.hits.map(h => h.document.content).join('\n\n---\n\n'),
    citations: results.hits.map((hit, i) => ({
      id: `cite-${i}`,
      sourceId: hit.document.sourceId,
      sourceTitle: hit.document.title,
      excerpt: hit.document.content.slice(0, 200),
      relevanceScore: hit.score,
    })),
  };
}
```

---

## Step 4: Update ChatPanel with Mode Support

**Task:** Modify ChatPanel to support mode toggle and citation display

**Target File:** `src/presentation/components/chat/ChatPanel.tsx`

**Changes:**
1. Add mode state (persisted in localStorage)
2. Add ChatModeToggle component
3. Use useRAGChat hook
4. Add CitationSidebar (collapsible)

**Key Code:**
```tsx
import { useState } from 'react';
import { ChatModeToggle } from './ChatModeToggle';
import { CitationSidebar } from '@/presentation/components/rag/CitationSidebar';
import { useRAGChat } from '@/hooks/useRAGChat';
import type { ChatMode } from '@/lib/agent/chat-mode-types';

export function ChatPanel({ projectId }: ChatPanelProps) {
  const [mode, setMode] = useState<ChatMode>(() => {
    return (localStorage.getItem('chat-mode') as ChatMode) || 'hybrid';
  });
  
  const [showCitations, setShowCitations] = useState(true);

  const chat = useRAGChat({ mode, projectId });

  const handleModeChange = (newMode: ChatMode) => {
    setMode(newMode);
    localStorage.setItem('chat-mode', newMode);
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        {/* Header with mode toggle */}
        <div className="flex items-center justify-between p-2 border-b">
          <ChatModeToggle 
            mode={mode} 
            onModeChange={handleModeChange}
          />
          {mode !== 'agent' && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowCitations(!showCitations)}
            >
              {showCitations ? 'Hide Citations' : 'Show Citations'}
            </Button>
          )}
        </div>

        {/* Chat messages */}
        <ChatConversation 
          messages={chat.messages}
          citations={chat.citations}
          onCitationClick={(citation) => {/* Navigate to source */}}
        />

        {/* Input */}
        <ChatInput 
          onSend={chat.sendMessage}
          isLoading={chat.isLoading || chat.isRetrieving}
        />
      </div>

      {/* Citation sidebar */}
      {mode !== 'agent' && showCitations && (
        <CitationSidebar 
          citations={chat.citations}
          onSourceClick={(sourceId) => {/* Open source preview */}}
        />
      )}
    </div>
  );
}
```

---

## Step 5: Wire CitationSidebar to Messages

**Task:** Update CitationSidebar to receive and display citations from chat

**Target File:** `src/presentation/components/rag/CitationSidebar.tsx`

**Changes:**
1. Accept citations as prop
2. Group by source
3. Add click-to-source navigation
4. Show relevance scores

---

## Step 6: Add Intent Classification (Optional Enhancement)

**Task:** Add query intent classification for smarter routing

**Output File:** `src/lib/agent/intent-classifier.ts`

```typescript
// Simple regex-based intent classification
// Can be enhanced with Gemini API later

export type QueryIntent = 
  | 'factual_lookup'
  | 'synthesis_request'
  | 'exploration'
  | 'action_request';

export function classifyIntent(query: string): QueryIntent {
  const lowerQuery = query.toLowerCase();
  
  // Action requests
  if (/^(create|write|edit|delete|generate|make|build)/i.test(query)) {
    return 'action_request';
  }
  
  // Synthesis requests
  if (/compare|contrast|summarize|synthesize|combine|analyze.*across/i.test(query)) {
    return 'synthesis_request';
  }
  
  // Factual lookups
  if (/^(what|who|when|where|how|why|define|explain)/i.test(query)) {
    return 'factual_lookup';
  }
  
  // Default to exploration
  return 'exploration';
}
```

---

## Step 7: Add i18n Strings

**Target Files:** `src/i18n/en.json`, `src/i18n/vi.json`

```json
{
  "chat": {
    "mode": {
      "agent": "Agent",
      "rag": "Knowledge",
      "hybrid": "Hybrid",
      "tooltip": {
        "agent": "Direct AI agent with file and terminal tools",
        "rag": "Search your knowledge base",
        "hybrid": "AI agent enhanced with your knowledge"
      }
    },
    "citations": {
      "title": "Sources",
      "relevance": "Relevance",
      "viewSource": "View source",
      "noCitations": "No sources found"
    }
  }
}
```

---

## Step 8: Final Validation

```bash
# 1. Build passes
pnpm build

# 2. Manual test:
# - Open chat panel
# - Toggle between modes
# - In RAG mode: query returns citations
# - In Hybrid mode: agent response includes knowledge context
# - Click citation → source preview opens
# - Mode persists on refresh
```

**Acceptance Criteria:**
- [ ] Mode toggle visible and functional
- [ ] RAG mode returns results with citations
- [ ] Hybrid mode injects knowledge context
- [ ] CitationSidebar displays source references
- [ ] Click citation navigates to source
- [ ] Mode persists across sessions
- [ ] Build passes

---

## Update LOOP_STATE.yaml

```yaml
phase_3:
  tasks:
    - id: "create-unified-chatpanel-modes"
      status: "DONE"
      completed_at: "{{timestamp}}"
    - id: "wire-useagentchat-to-retriever"
      status: "DONE"
      completed_at: "{{timestamp}}"
    - id: "wire-citation-sidebar"
      status: "DONE"
      completed_at: "{{timestamp}}"
```
