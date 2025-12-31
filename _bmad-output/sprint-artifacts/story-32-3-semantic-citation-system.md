---
date: 2025-12-31
time: "08:55:00"
phase: Story Creation
team: Team-A
agent_mode: bmad-bmm-sm
---

# Story 32-3: Semantic Citation System

**Epic:** EPIC-32 (RAG Infrastructure)  
**Story ID:** 32-3-semantic-citation-system  
**Status:** drafted  
**Created:** 2025-12-31T08:55:00+07:00  
**Priority:** HIGH  
**Dependencies:** 32-1 (Orama WASM Vector Store Enhancement)

---

## User Story

**As a** knowledge worker using the Knowledge Synthesis Station,  
**I want** to automatically generate semantic citations for AI-generated responses that link back to source documents,  
**So that** I can verify the accuracy of AI responses and trace information back to its original source.

---

## Acceptance Criteria

| AC ID | Description | Given | When | Then |
|-------|-------------|-------|------|------|
| AC1 | Citation auto-generation | User asks a question | AI generates response | Response includes inline citations `[source-1]`, `[source-2]` |
| AC2 | Source attribution metadata | Multiple sources indexed | AI references a source | Citation includes source title, relevance score, and excerpt |
| AC3 | Citation click-to-navigate | User hovers over citation | User clicks citation | Opens source preview panel with full context |
| AC4 | Citation count display | Response has multiple citations | Response rendered | Shows citation count badge in chat header |
| AC5 | Citation filtering | User wants specific sources | User applies filter | Only citations from selected sources shown |
| AC6 | Test coverage ≥33 tests | All ACs implemented | Tests written | 33+ unit tests pass |

---

## Tasks

- [ ] **T1:** Create Citation types and interfaces (`src/lib/rag/citation-types.ts`)
- [ ] **T2:** Implement CitationGenerator class (`src/lib/rag/citation-generator.ts`)
- [ ] **T3:** Create citation metadata extraction utilities (`src/lib/rag/citation-metadata.ts`)
- [ ] **T4:** Add citation generation to RAG pipeline (`src/lib/rag/rag-pipeline.ts`)
- [ ] **T5:** Create CitationSidebar component (`src/components/rag/CitationSidebar.tsx`)
- [ ] **T6:** Implement citation click-to-navigate handler (`src/components/rag/citation-click-handler.ts`)
- [ ] **T7:** Add citation count badge to RAGChatPanel (`src/components/rag/RAGChatPanel.tsx`)
- [ ] **T8:** Write unit tests for citation generation (`src/lib/rag/__tests__/citation-generator.test.ts`)
- [ ] **T9:** Add i18n translation keys for citations (`src/i18n/en.json`, `src/i18n/vi.json`)

---

## Research Requirements

**Mandatory Research Protocol (Per `.agent/workflows/story-dev-cycle.md`):**

1. **Load Local Agent Instructions:**
   - Read `docs/agent-instructions/dependency-libraries-usage.md` (if exists)
   - Read `.agent/rules/general-rules.md` for MCP research protocol

2. **MCP Tool Research:**
   - **Context7:** Query TanStack AI documentation for citation patterns
   - **DeepWiki:** Check TanStack/router for click navigation patterns
   - **Tavily/Exa:** Search for "semantic citation system best practices 2025"

3. **Codebase Analysis:**
   - Review `src/lib/rag/orama-index.ts` for source metadata structure
   - Review `src/lib/rag/rag-store.ts` for RAG pipeline integration
   - Review `src/components/rag/CitationSidebar.tsx` (existing component)

4. **Validation Criteria:**
   - Minimum 3 MCP tool calls required
   - Minimum 5 successful iterative executions

---

## Dev Notes

### Architecture Patterns

- **Citation Data Model:** Follow existing pattern in `src/lib/rag/orama-index.ts` for source metadata
- **Component Pattern:** Use existing `CitationSidebar.tsx` structure as template
- **State Management:** Use `useCitationStore` (to be created) following `useRAGStore` pattern
- **Navigation:** Use TanStack Router `useNavigate` for click-to-navigate

### Code Patterns (Pseudo-Guidelines Only)

```typescript
// Citation types - follow existing rag-types.ts pattern
interface Citation {
  id: string;
  sourceId: string;
  sourceTitle: string;
  relevanceScore: number;
  excerpt: string;
  position: { start: number; end: number };
}

// Citation generator - follow orama-index.ts pattern
class CitationGenerator {
  generateCitations(response: string, sources: Source[]): Citation[];
}

// Citation sidebar - follow existing component pattern
const CitationSidebar: React.FC<CitationSidebarProps> = ({ citations }) => {
  // Implementation with click handlers
}
```

**NOTE:** These are pseudo-patterns only. Actual implementation requires conditional research during development phase using MCP tools.

### Dependencies

- **Orama WASM:** Source metadata access (`src/lib/rag/orama-index.ts`)
- **RAG Store:** Pipeline integration (`src/lib/rag/rag-store.ts`)
- **TanStack Router:** Navigation (`@tanstack/react-router`)
- **i18n:** Translation keys (`src/i18n/`)

---

## References

| Ref | Document | Purpose |
|-----|----------|---------|
| R1 | `_bmad-output/knowledge-synthesis-platform/knowledge-synthesis-platform-tech-spec-2025-12-31.md` | Technical specification |
| R2 | `_bmad-output/research-artifacts/implementation-playbook-2025-12-31.md` | Implementation guidance |
| R3 | `src/lib/rag/orama-index.ts` | Orama WASM implementation reference |
| R4 | `src/lib/rag/rag-store.ts` | RAG store pattern reference |
| R5 | `src/components/rag/CitationSidebar.tsx` | Existing citation sidebar (reference) |

---

## Dev Agent Record

**Agent:** Pending assignment  
**Session:** Pending  

#### Task Progress:
- [ ] T1: Citation types and interfaces
- [ ] T2: CitationGenerator class
- [ ] T3: Citation metadata extraction
- [ ] T4: RAG pipeline integration
- [ ] T5: CitationSidebar component
- [ ] T6: Click-to-navigate handler
- [ ] T7: Citation count badge
- [ ] T8: Unit tests
- [ ] T9: i18n translation keys

#### Research Executed:
- [ ] Context7: TanStack AI citation patterns
- [ ] DeepWiki: Click navigation patterns
- [ ] Tavily/Exa: Semantic citation best practices

#### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| src/lib/rag/citation-types.ts | Created | ~50 |
| src/lib/rag/citation-generator.ts | Created | ~150 |
| src/lib/rag/citation-metadata.ts | Created | ~80 |
| src/lib/rag/rag-pipeline.ts | Modified | +20 |
| src/lib/rag/__tests__/citation-generator.test.ts | Created | ~200 |
| src/components/rag/CitationSidebar.tsx | Modified | +50 |
| src/components/rag/citation-click-handler.ts | Created | ~60 |
| src/components/rag/RAGChatPanel.tsx | Modified | +30 |
| src/i18n/en.json | Modified | +10 |
| src/i18n/vi.json | Modified | +10 |

#### Tests Created:
- `citation-generator.test.ts`: 33+ tests

#### Decisions Made:
- [ ] Decision 1: Citation format (inline vs. sidebar)
- [ ] Decision 2: Click handler implementation approach
- [ ] Decision 3: Citation count badge placement

---

## Code Review

**Reviewer:** Pending  
**Date:** Pending  
**Status:** Pending

#### Checklist:
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable

#### Issues Found:
- Issue 1: Pending

#### Sign-off:
✅ Pending review

---

## Status History

| Date | Time | Agent Mode | Action | Status |
|------|------|------------|--------|--------|
| 2025-12-31 | 08:55:00 | bmad-bmm-sm | Story file created | drafted |
| 2025-12-31 | TBD | bmad-bmm-dev | Context XML created | ready-for-dev |
| 2025-12-31 | TBD | bmad-bmm-dev | Implementation complete | review |
| 2025-12-31 | TBD | code-reviewer | Code review complete | done |

---

## Next Steps

1. **Create Context XML:** Generate context XML file for developer handoff
2. **Update Sprint Status:** Mark 32-3 as `ready-for-dev`
3. **Delegate Development:** Handoff to `@bmad-bmm-dev` for implementation
