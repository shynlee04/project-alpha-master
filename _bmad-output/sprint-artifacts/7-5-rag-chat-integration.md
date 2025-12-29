---
title: "7-5 RAG Chat Integration (Grounded Responses with Citations)"
epic: "Epic 7: RAG Infrastructure (Orama WASM)"
story: "7-5-rag-chat-integration"
status: "ready-for-dev"
priority: "P0"
points: 8
created: "2025-12-30"
sprint: "SPRINT-7"
team: "Team B"
dependencies:
  - "7-4-hybrid-retrieval"
---

# Story: 7-5 RAG Chat Integration (Grounded Responses with Citations)

**As a** student studying,
**I want** to chat with my sources and get grounded answers,
**So that** I can learn from my materials conversationally.

---

## Story Context

### From Epic 7

Epic 7 delivers "RAG Infrastructure (Orama WASM)" with Orama WASM integration, document chunking, embedding service, hybrid retrieval, RAG chat integration, and deep think synthesis. Story 7.5 delivers the RAG Chat Integration that enables users to chat with their sources and receive grounded answers with inline citations.

### User Journey

1. User starts a knowledge chat session
2. User asks a question about their imported sources
3. System triggers hybrid retrieval (BM25 + vector search)
4. Relevant chunks are gathered with citations
5. AI generates response with inline citations [source_id]
6. User clicks citation → source panel slides over showing passage
7. User asks follow-up → conversation history preserved with citations

### Technical Context

**Existing Components (from Stories 7-1 through 7-4):**
- `orama-index.ts`: Orama index management
- `document-chunker.ts`: Document chunking strategies
- `embedding-service.ts`: Hybrid embedding service (local/cloud)
- `hybrid-retriever.ts`: Parallel BM25 + vector search with RRF fusion
- `search-highlighter.ts`: Text highlighting for matched passages
- `rag-store.ts`: Zustand store for RAG state

**New Components for Story 7.5:**
- `rag-chat.ts`: RAG chat service that orchestrates retrieval + generation
- `citation-formatter.ts`: Formats citations as inline references
- `source-panel.tsx`: UI component showing source passages
- `RAGChatPanel.tsx`: Main chat UI with citation support

**RAG Chat Requirements:**
- **Hybrid Retrieval**: Trigger BM25 + vector search for each user query
- **Context Assembly**: Gather top-k chunks with metadata
- **Prompt Engineering**: Structure prompt with retrieved context
- **Citation Generation**: AI generates inline citations [1], [2], [3]
- **Source Linking**: Citations link to exact passages
- **Conversation Memory**: Preserve history with citations across turns
- **Source Panel**: Slide-over panel showing cited passages

**State Management Extensions:**
- Extend `useRAGStore` with:
  - `chatMessages: ChatMessage[]`
  - `citations: Map<string, Citation>`
  - `activeCitation: Citation | null`
  - `sendRAGMessage(query)` action
  - `showCitation(citation)` action
  - `closeCitationPanel()` action

**Styling:**
- 8-bit gaming aesthetic (dark theme)
- Citation badges in chat messages
- Slide-over source panel (right side)
- Highlighted text in source preview
- Smooth panel transitions

### Previous Story Intelligence (Story 7-4)

**Key Learnings from Story 7.4:**
1. **Hybrid Retrieval**: Parallel BM25 + vector search with RRF fusion
2. **Text Highlighting**: Safe regex escaping for matched passages
3. **Search Modes**: Configurable keyword/semantic/hybrid modes
4. **State Management**: Extended rag-store with search state
5. **Inline Type Imports**: Avoid circular dependencies

**Code Patterns from Story 7.4:**
- Service pattern: `class Service { async method(input, options) }`
- Parallel execution: `Promise.all` for concurrent searches
- Result fusion: RRF algorithm for combining ranked lists
- Store actions: Update state → persist → notify UI

**Files from Story 7.4:**
- `src/lib/rag/rrf-fusion.ts` - RRF fusion algorithm
- `src/lib/rag/search-highlighter.ts` - Text highlighting
- `src/lib/rag/hybrid-retriever.ts` - Hybrid retrieval service
- `src/lib/rag/types.ts` - Retrieval types and interfaces
- `src/lib/state/rag-store.ts` - Extended with search state/actions

---

## Acceptance Criteria

### AC-1: Hybrid Retrieval Trigger

**Given** a user starts a knowledge chat,
**When** they ask a question,
**Then** the query triggers hybrid retrieval (BM25 + vector search)
**And** relevant chunks are gathered with citations

### AC-2: Inline Citations

**Given** AI generates a response,
**When** it includes claims,
**Then** each claim has inline citation `[source_id]`
**And** citations link to exact passages

### AC-3: Citation Navigation

**Given** user clicks a citation,
**When** it opens,
**Then** source panel slides over showing the passage
**And** matching text is highlighted

### AC-4: Conversation Memory

**Given** response is complete,
**When** user asks follow-up,
**Then** conversation history is preserved
**And** prior citations remain accessible

### AC-5: Source Panel Display

**Given** citation is clicked,
**When** source panel opens,
**Then** panel shows:
- Source title and metadata
- Highlighted passage text
- Link to full source
- Close button

### AC-6: Context Window Management

**Given** multiple retrieval rounds,
**When** context exceeds window,
**Then** system uses summarization or chunk selection
**And** most relevant chunks prioritized

### AC-7: Streaming Responses

**Given** RAG response is generated,
**When** streaming occurs,
**Then** citations appear inline during stream
**And** user can interrupt generation

---

## Tasks / Subtasks

### Task 1: Define RAG Chat Types
- [ ] Define RAG chat types in `src/lib/rag/types.ts`
  - [ ] `ChatMessage`: Message with role, content, citations
  - [ ] `Citation`: Source reference with passage info
  - [ ] `RAGContext`: Retrieved chunks for generation
  - [ ] `RAGChatOptions`: Configuration for RAG chat

### Task 2: Create Citation Formatter
- [ ] Create `src/lib/rag/citation-formatter.ts`
  - [ ] `formatCitations(results)` - Format as [1], [2], [3]
  - [ ] `buildContext(chunks)` - Build prompt context
  - [ ] `extractCitations(response)` - Parse AI citations
  - [ ] Add unit tests

### Task 3: Create RAG Chat Service
- [ ] Create `src/lib/rag/rag-chat.ts`
  - [ ] Implement `RAGChat` class
    - [ ] `constructor(hybridRetriever, llmService)`
    - [ ] `chat(query, history)` - RAG chat with context
    - [ ] `retrieveContext(query)` - Hybrid retrieval
    - [ ] `generateResponse(context, query)` - LLM generation
  - [ ] Add conversation memory
  - [ ] Add streaming support
  - [ ] Add unit tests

### Task 4: Create Source Panel Component
- [ ] Create `src/components/rag/SourcePanel.tsx`
  - [ ] Slide-over panel (right side)
  - [ ] Source title and metadata display
  - [ ] Highlighted passage text
  - [ ] Link to full source
  - [ ] Close button
  - [ ] Animation transitions
  - [ ] Add unit tests

### Task 5: Create RAG Chat Panel Component
- [ ] Create `src/components/rag/RAGChatPanel.tsx`
  - [ ] Chat input with send button
  - [ ] Message list with citation badges
  - [ ] Citation click handlers
  - [ ] Loading states
  - [ ] Error handling
  - [ ] Streaming response display
  - [ ] Add unit tests

### Task 6: Create Citation Badge Component
- [ ] Create `src/components/rag/CitationBadge.tsx`
  - [ ] Badge display [1], [2], [3]
  - [ ] Hover tooltip with source title
  - [ ] Click handler to open source panel
  - [ ] Active state styling
  - [ ] Add unit tests

### Task 7: Extend RAG Store with Chat Actions
- [ ] Extend `useRAGStore` in `src/lib/state/rag-store.ts`
  - [ ] Add `chatMessages: ChatMessage[]` state
  - [ ] Add `citations: Map<string, Citation>` state
  - [ ] Add `activeCitation: Citation | null` state
  - [ ] Add `sendRAGMessage(query)` action
  - [ ] Add `showCitation(citation)` action
  - [ ] Add `closeCitationPanel()` action
- [ ] Add unit tests

### Task 8: Add i18n Translation Keys
- [ ] Add RAG chat keys to `src/i18n/en.json`
  - [ ] `rag.chat.title`: "Knowledge Chat"
  - [ ] `rag.chat.placeholder`: "Ask your sources..."
  - [ ] `rag.chat.citation`: "Source {{id}}"
  - [ ] `rag.chat.panel.title`: "Source"
  - [ ] `rag.chat.panel.close`: "Close"
  - [ ] `rag.chat.error`: "Chat failed: {{error}}"
- [ ] Add Vietnamese translations to `src/i18n/vi.json`

### Task 9: Integrate with Existing Chat System
- [ ] Connect RAG chat to TanStack AI
- [ ] Add RAG mode toggle in chat UI
- [ ] Handle RAG vs regular chat mode switching
- [ ] Add integration tests

---

## Dev Notes

### Architecture Patterns

**RAG Chat Service Pattern:**
```typescript
class RAGChat {
    async chat(query: string, history: ChatMessage[]): Promise<ChatMessage> {
        // Step 1: Retrieve relevant context
        const context = await this.retrieveContext(query);

        // Step 2: Build prompt with context
        const prompt = this.buildPrompt(query, context, history);

        // Step 3: Generate response with streaming
        const response = await this.llmService.stream(prompt);

        // Step 4: Format citations
        const citations = this.formatCitations(context.chunks);

        return {
            role: 'assistant',
            content: response.text,
            citations,
        };
    }
}
```

**Citation Formatting:**
```typescript
function formatCitations(chunks: DocumentChunk[]): Citation[] {
    return chunks.map((chunk, index) => ({
        id: index + 1,
        sourceId: chunk.sourceId,
        title: chunk.metadata?.title,
        passage: chunk.content,
        position: chunk.position,
    }));
}
```

**Context Building:**
```typescript
function buildContext(chunks: DocumentChunk[]): string {
    return chunks.map((chunk, index) => `
[Source ${index + 1}]
Title: ${chunk.metadata?.title}
Content: ${chunk.content}
---
    `).join('\n');
}
```

### Component Structure

**RAGChatPanel Component:**
```typescript
interface RAGChatPanelProps {
    messages: ChatMessage[];
    onSendMessage: (query: string) => void;
    onCitationClick: (citation: Citation) => void;
}

function RAGChatPanel({ messages, onSendMessage, onCitationClick }: RAGChatPanelProps) {
    return (
        <div className="rag-chat-panel">
            <MessageList messages={messages} onCitationClick={onCitationClick} />
            <ChatInput onSend={onSendMessage} placeholder="Ask your sources..." />
        </div>
    );
}
```

**SourcePanel Component:**
```typescript
interface SourcePanelProps {
    citation: Citation | null;
    onClose: () => void;
}

function SourcePanel({ citation, onClose }: SourcePanelProps) {
    if (!citation) return null;

    return (
        <div className="source-panel slide-over">
            <div className="source-header">
                <h3>{citation.title}</h3>
                <button onClick={onClose}>Close</button>
            </div>
            <div className="source-content">
                {highlightText(citation.passage, [])}
            </div>
        </div>
    );
}
```

### Testing Standards

**Unit Tests:**
- Test RAG chat orchestration
- Test citation formatting
- Test context building
- Test conversation memory
- Test streaming responses
- Test error scenarios

**Integration Tests:**
- Test full RAG flow (retrieve → generate → cite)
- Test citation click navigation
- Test source panel display
- Test conversation history
- Test mode switching (RAG vs regular chat)

**Test Coverage:**
- Target: 80%+ coverage for RAG logic
- Target: 70%+ coverage for UI components
- All error paths must have tests

### File Structure

```
src/
├── lib/
│   └── rag/
│       ├── types.ts (modify) - Add RAG chat types
│       ├── citation-formatter.ts (new) - Citation formatting
│       ├── rag-chat.ts (new) - RAG chat service
│       └── __tests__/
│           ├── citation-formatter.test.ts (new)
│           └── rag-chat.test.ts (new)
├── lib/
│   └── state/
│       └── rag-store.ts (modify) - Add chat actions
├── components/
│   └── rag/
│       ├── RAGChatPanel.tsx (new) - Main chat UI
│       ├── SourcePanel.tsx (new) - Source slide-over
│       ├── CitationBadge.tsx (new) - Citation badge
│       └── __tests__/
│           ├── RAGChatPanel.test.tsx (new)
│           ├── SourcePanel.test.tsx (new)
│           └── CitationBadge.test.tsx (new)
└── i18n/
    ├── en.json (modify) - Add RAG chat keys
    └── vi.json (modify) - Add RAG chat keys (VI)
```

### Key Dependencies

- **@orama/orama**: ^2.0.0 (already installed)
- **@tanstack/ai**: For LLM integration (already installed)
- **zustand**: ^4.5.0 (state management)
- **dexie**: ^3.2.4 (IndexedDB)

---

## Definition of Done

- [ ] All acceptance criteria implemented (AC-1 through AC-7)
- [ ] Unit tests written (citation formatter, RAG chat, components)
- [ ] RAG chat service with retrieval + generation
- [ ] Source panel component with slide-over animation
- [ ] RAG chat panel with citation support
- [ ] Citation badge component
- [ ] RAG store extended with chat actions
- [ ] i18n keys added (EN + VI)
- [ ] Story file updated with Dev Agent Record
- [ ] `sprint-status.yaml` updated: `7-5-rag-chat-integration: review`

---

## References

- **Architecture:** `_bmad-output/project-planning-artifacts/architecture.md` - Section 9.5 (RAG Infrastructure)
- **PRD:** `_bmad-output/project-planning-artifacts/prd.md` - Section 7.3 (RAG Chat)
- **UX Design:** `_bmad-output/project-planning-artifacts/ux-design-specification.md` - Section 21 (RAG & Citation Interface)
- **Epic 7:** `_bmad-output/epics.md` - Story 7.5
- **Story 7.1:** `_bmad-output/sprint-artifacts/7-1-orama-index-management.md` - Orama index
- **Story 7.2:** `_bmad-output/sprint-artifacts/7-2-document-chunking.md` - Chunking
- **Story 7.3:** `_bmad-output/sprint-artifacts/7-3-embedding-service.md` - Embeddings
- **Story 7.4:** `_bmad-output/sprint-artifacts/7-4-hybrid-retrieval.md` - Hybrid retrieval

---

## Research Requirements

### MCP Research Tasks (MANDATORY before implementation)

1. **RAG Prompt Engineering**
   - Research effective prompt patterns for RAG systems
   - Study context window management strategies
   - Document citation formatting in prompts
   - Research conversation memory techniques

2. **TanStack AI RAG Integration**
   - Research TanStack AI's RAG capabilities
   - Study streaming with citations
   - Document context injection patterns
   - Research error handling for RAG failures

3. **Citation UI/UX Patterns**
   - Research citation display patterns in chat UIs
   - Study source panel animations
   - Document citation click interactions
   - Research mobile-friendly citation layouts

4. **Conversation Memory for RAG**
   - Research multi-turn RAG conversations
   - Study context summarization techniques
   - Document citation persistence across turns
   - Research memory management strategies

---

## Dev Agent Record

**Agent:** Claude Sonnet 4.5
**Session:** 2025-12-30T17:15:00+07:00

#### Task Progress:
- [ ] T1: Define RAG Chat Types
- [ ] T2: Create Citation Formatter
- [ ] T3: Create RAG Chat Service
- [ ] T4: Create Source Panel Component
- [ ] T5: Create RAG Chat Panel Component
- [ ] T6: Create Citation Badge Component
- [ ] T7: Extend RAG Store with Chat Actions
- [ ] T8: Add i18n Translation Keys
- [ ] T9: Integrate with Existing Chat System

#### Research Executed:
- [ ] RAG prompt engineering
- [ ] TanStack AI RAG integration
- [ ] Citation UI/UX patterns
- [ ] Conversation memory for RAG

#### Files Created:
*To be populated during implementation*

#### Files Modified:
*To be populated during implementation*

#### Tests Created:
*To be populated during implementation*

#### Test Results:
*To be populated during implementation*

#### Decisions Made:
*To be populated during implementation*

#### Known Issues:
*To be populated during implementation*

#### Code Review Findings:
*To be populated during implementation*

#### Acceptance Criteria Status:
- [ ] AC-1: Hybrid Retrieval Trigger
- [ ] AC-2: Inline Citations
- [ ] AC-3: Citation Navigation
- [ ] AC-4: Conversation Memory
- [ ] AC-5: Source Panel Display
- [ ] AC-6: Context Window Management
- [ ] AC-7: Streaming Responses
