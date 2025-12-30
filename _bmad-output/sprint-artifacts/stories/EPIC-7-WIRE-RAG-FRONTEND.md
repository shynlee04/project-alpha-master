---
title: "Story 7-WIRE: Wire RAG Backend to Knowledge Page Frontend"
epic: "EPIC-7"
story_id: "7-WIRE"
status: "ready-for-dev"
priority: "P0"
type: "wire-integration"
governance: "EPIC-7"
created: "2025-12-30T00:35:00+07:00"
sprint: "Ralph-Loop-Iteration-4"
---

## Story Overview

Wire the complete RAG backend infrastructure (Epic 7 Stories 7-1 through 7-5) to the Knowledge Page frontend. Currently, the right panel of KnowledgePage is a placeholder showing "Synthesis & Chat" with no functionality. This story connects the existing rag-store and RAG services to a functional UI.

## Background Context

### What Exists (Backend - COMPLETE)
- `src/lib/rag/types.ts` - Complete type definitions
- `src/lib/rag/orama-index.ts` - Orama WASM index management
- `src/lib/rag/document-chunker.ts` - Document chunking with 3 strategies
- `src/lib/rag/embedding-service.ts` - Local/cloud embedding generation
- `src/lib/rag/hybrid-retriever.ts` - Keyword/semantic/hybrid search
- `src/lib/rag/rag-chat.ts` - RAG chat with citations
- `src/lib/state/rag-store.ts` - Zustand store with full state management

### What Exists (Frontend - PLACEHOLDER)
- `src/components/knowledge/KnowledgePage.tsx` - Right panel is placeholder (lines 119-136)
- i18n keys exist for: `knowledge.synthesis.title`, `knowledge.synthesis.placeholder.text`

### Gap Analysis
| Component | Backend | Frontend | Status |
|-----------|---------|----------|--------|
| Orama Index Management | ✅ Complete | ❌ Not connected | Wire needed |
| Document Chunking | ✅ Complete | ❌ Not connected | Wire needed |
| Embedding Service | ✅ Complete | ❌ Not connected | Wire needed |
| Hybrid Retrieval | ✅ Complete | ❌ Not connected | Wire needed |
| RAG Chat | ✅ Complete | ❌ Not connected | Wire needed |
| Citations | ✅ Complete | ❌ Not connected | Wire needed |

## User Story

**As a** knowledge worker
**I want to** search my sources and chat with AI about them
**So that** I can synthesize information and generate insights from my knowledge base

## Acceptance Criteria

### AC-1: RAG Search Panel Component
- [ ] Create `RAGSearchPanel` component in `src/components/rag/`
- [ ] Search input field with placeholder from i18n
- [ ] Search mode selector (keyword/semantic/hybrid)
- [ ] Search results display with title, excerpt, score
- [ ] Click on result opens source preview
- [ ] Proper 8-bit styling (rounded-none, border-2)

### AC-2: RAG Chat Panel Component
- [ ] Create `RAGChatPanel` component in `src/components/rag/`
- [ ] Chat message list with user/assistant roles
- [ ] Citation markers in assistant messages ([1], [2], etc.)
- [ ] Citation sidebar showing passage with highlighting
- [ ] Input field for questions
- [ ] Streaming response indicator
- [ ] Proper 8-bit styling

### AC-3: KnowledgePage Integration
- [ ] Replace placeholder in right panel with tabbed interface
- [ ] Tabs: "Search" and "Chat"
- [ ] Wire both panels to `useRAGStore`
- [ ] Handle empty state (no sources indexed)
- [ ] Handle loading state (index building)

### AC-4: Index Status Indicator
- [ ] Show index status in KnowledgePage header
- [ ] "Index Ready" badge when documents are indexed
- [ ] "Indexing..." progress when building
- [ ] Document count display

### AC-5: Source Selection Integration
- [ ] Allow selecting sources for focused search
- [ ] Filter search results by selected sources
- [ ] Pass selected sources to chat context

### AC-6: Proper Error Handling
- [ ] Show error messages from rag-store
- [ ] Handle missing index gracefully
- [ ] Retry mechanism for failed searches

### AC-7: i18n Completeness
- [ ] All UI strings use `t()` hook
- [ ] Vietnamese translations exist
- [ ] No hardcoded strings

### AC-8: 8-bit Styling Compliance
- [ ] All components use `rounded-none`
- [ ] Border-2 on interactive elements
- [ ] Proper 8-bit color palette
- [ ] Pixel shadows where applicable

## Technical Implementation

### Component Structure
```
src/components/rag/
├── index.ts                 # Barrel export
├── RAGSearchPanel.tsx       # Search component
├── RAGChatPanel.tsx         # Chat component
├── CitationSidebar.tsx      # Citation detail view
└── __tests__/
    ├── RAGSearchPanel.test.tsx
    └── RAGChatPanel.test.tsx
```

### rag-store Integration
```typescript
import { useRAGStore } from '@/lib/state/rag-store';

// Selectors for components
const searchQuery = useRAGStore(s => s.searchQuery);
const searchResults = useRAGStore(s => s.searchResults);
const searchMode = useRAGStore(s => s.searchMode);
const chatMessages = useRAGStore(s => s.chatMessages);
const citations = useRAGStore(s => s.citations);
const indexStatus = useRAGStore(s => s.indexStatus);
const documentCount = useRAGStore(s => s.documentCount);

// Actions
const setSearchQuery = useRAGStore(s => s.setSearchQuery);
const performSearch = useRAGStore(s => s.performSearch);
const sendMessage = useRAGStore(s => s.sendChatMessage);
const clearChat = useRAGStore(s => s.clearChat);
```

### KnowledgePage Changes
```typescript
// Current (placeholder)
<ResizablePanel defaultSize={30} minSize={20}>
  <div className="h-full flex flex-col bg-sidebar/30 border-l border-border">
    <div className="p-3 border-b border-border font-mono font-bold text-sm">
      <Sparkles size={14} className="text-secondary" />
      {t('knowledge.synthesis.title')}
    </div>
    {/* PLACEHOLDER - needs replacement */}
  </div>
</ResizablePanel>

// New (with RAG integration)
<ResizablePanel defaultSize={30} minSize={20}>
  <RAGPanelContainer
    projectId={projectId}
    indexStatus={indexStatus}
    documentCount={documentCount}
  />
</ResizablePanel>
```

## Dependencies

### Internal Dependencies
- `src/lib/state/rag-store.ts` - State management (exists)
- `src/lib/rag/hybrid-retriever.ts` - Search functionality (exists)
- `src/lib/rag/rag-chat.ts` - Chat functionality (exists)
- `src/lib/rag/citation-formatter.ts` - Citation formatting (exists)
- `src/components/knowledge/KnowledgePage.tsx` - Integration point (exists)

### External Dependencies
- `@orama/orama` - Vector search (installed)
- `lucide-react` - Icons (installed)
- `react-i18next` - i18n (installed)

## Testing Strategy

### Unit Tests
- RAGSearchPanel: Input handling, result display, mode switching
- RAGChatPanel: Message rendering, citation display, streaming
- CitationSidebar: Passage rendering, highlighting
- Integration: Store connection, state updates

### Integration Tests
- Search flow: Input → store update → search → results display
- Chat flow: Message → store update → API call → streaming response
- Tab switching: State preservation across tabs

### Test Coverage Target
- 80% minimum for new components
- 100% for critical paths (search, chat, citations)

## Definition of Done

- [ ] All ACs completed and verified
- [ ] TypeScript compilation passes (no errors)
- [ ] All tests passing
- [ ] i18n extraction runs clean
- [ ] 8-bit styling audit passes
- [ ] Code review approved
- [ ] Integration verified with rag-store
- [ ] No console errors in dev mode
- [ ] Production build succeeds

## Estimated Effort

- Component Creation: 4-6 hours
- Integration: 2-3 hours
- Testing: 2-3 hours
- Code Review & Polish: 2 hours
- **Total: 10-14 hours**

## Notes

### Deferred from Original Epic 7
This story addresses the UI components that were marked as "deferred" in the original Epic 7 stories:
- 7-3: "UI components (T7,T8) deferred"
- 7-4: "UI components (T8) deferred"
- 7-5: "UI components (T4-T6) deferred, TanStack AI integration (T9) deferred"

### Future Enhancements (Not in Scope)
- Voice chat integration (Story 10-1)
- Deep think synthesis (Story 7-6, deferred)
- Multimodal source vision (Story 10-2, deferred)
- Audio overview generator (Story 10-3, deferred)

## Related Artifacts

### Documents
- `_bmad-output/project-planning-artifacts/architecture.md` - RAG architecture
- `_bmad-output/project-planning-artifacts/ux-design-specification.md` - UI specs
- `src/lib/rag/types.ts` - Type definitions

### Previous Stories
- Story 7-1: Orama Index Management (backend complete)
- Story 7-2: Document Chunking (backend complete)
- Story 7-3: Embedding Service (backend complete)
- Story 7-4: Hybrid Retrieval (backend complete)
- Story 7-5: RAG Chat Integration (backend complete)

### Validation
- `_bmad-output/validation/sweeping-validation.md` - 12-level validation checklist
