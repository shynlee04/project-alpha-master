---
title: "7-6 Deep Think Synthesis (Desktop Only)"
epic: "Epic 7: RAG Infrastructure (Orama WASM)"
story: "7-6-deep-think-synthesis"
status: "backlog"
priority: "P2"
points: 5
created: "2025-12-30"
sprint: "SPRINT-7"
team: "Team B"
dependencies:
  - "7-5-rag-chat-integration"
platform: "desktop"
---

# Story: 7-6 Deep Think Synthesis (Desktop Only)

**As a** researcher,
**I want** to use Gemini 3.0's reasoning capabilities,
**So that** I can get a synthesis of contradicting papers.

---

## Story Context

### From Epic 7

Epic 7 delivers "RAG Infrastructure (Orama WASM)" with Orama WASM integration, document chunking, embedding service, hybrid retrieval, RAG chat integration, and deep think synthesis. Story 7.6 delivers the Deep Think Synthesis feature that uses advanced Gemini 3.0 Pro reasoning for complex source analysis.

### Platform Note

**DESKTOP-ONLY FEATURE** - This feature requires high compute resources and is only available on desktop platforms.

### User Journey

1. User asks a complex question requiring deep analysis
2. User long-presses the "Generate" button
3. System switches from `gemini-3.0-flash` to `gemini-3.0-pro`
4. "Deep Thinking" UI state displays while model reasons
5. On completion, reasoning steps shown in expandable section
6. Final synthesis displayed with confidence scores and citations
7. User can cancel during reasoning if needed

### Technical Context

**Existing Components (from Stories 7-1 through 7-5):**
- `hybrid-retriever.ts`: Parallel BM25 + vector search
- `rag-chat.ts`: RAG chat orchestration
- `citation-formatter.ts`: Citation formatting and context building
- `rag-store.ts`: State management with chat actions

**New Components for Story 7.6:**
- Deep Think state management (reasoning progress, steps)
- Model switching logic (flash ↔ pro)
- Structured output parsing (Markdown tables)
- Expandable sections UI
- Long-press gesture handling

**Deep Think Requirements:**
- **Model Switching**: Conditional logic to use gemini-3.0-pro for deep analysis
- **Reasoning Display**: Show "Deep Thinking..." state with animation
- **Steps Expansion**: Expandable accordion for reasoning chain
- **Confidence Scores**: Numerical or visual confidence indicators
- **Cancellation**: Abort long-running requests

**State Management Extensions:**
- Extend `useRAGStore` with:
  - `deepThinkMode: boolean`
  - `reasoningSteps: ReasoningStep[]`
  - `deepThinkProgress: number`
  - `toggleDeepThinkMode()` action
  - `cancelDeepThink()` action

**Styling:**
- 8-bit gaming aesthetic (dark theme)
- Animated "Deep Thinking" state
- Expandable accordion sections
- Confidence score badges
- Long-press feedback

### Previous Story Intelligence (Story 7-5)

**Key Learnings from Story 7.5:**
1. **RAG Chat Integration**: Complete orchestration flow with retrieval + generation
2. **Citation Formatting**: Structured context building with source references
3. **Conversation Memory**: Chat history management with persistence
4. **Store Actions**: Async actions with loading/error states
5. **Map Serialization**: Pattern for persisting complex objects

**Code Patterns from Story 7.5:**
- Service orchestration: HybridRetriever → CitationFormatter → AI generation
- Async state updates with loading/error handling
- Store actions that integrate multiple services
- i18n for all UI strings (EN + VI)

---

## Acceptance Criteria

### AC-1: Long-Press Activation

**Given** a user wants deep analysis,
**When** they long-press the "Generate" button (> 2 seconds),
**Then** switch model from `gemini-3.0-flash` to `gemini-3.0-pro`
**And** display "Deep Thinking" UI state

### AC-2: Reasoning Display

**Given** deep think mode is active,
**When** the model is reasoning,
**Then** show animated "Deep Thinking..." indicator
**And** display progress if available

### AC-3: Reasoning Steps

**Given** reasoning completes,
**When** results are ready,
**Then** show reasoning steps in expandable accordion
**And** display step number, description, and confidence

### AC-4: Structured Output

**Given** deep think completes,
**When** synthesis is generated,
**Then** output structured Markdown comparison table
**And** include citations from sources
**And** display confidence scores

### AC-5: Cancellation

**Given** deep think is in progress,
**When** user clicks cancel,
**Then** request is terminated immediately
**And** model switches back to `gemini-3.0-flash`

### AC-6: Desktop Platform Detection

**Given** user is on mobile device,
**When** deep think feature is accessed,
**Then** show "Desktop Only" message
**And** hide long-press activation

### AC-7: Performance

**Given** deep think is activated,
**When** reasoning executes,
**Then** UI remains responsive (non-blocking)
**And** progress updates every 1 second

---

## Tasks / Subtasks

### Task 1: Define Deep Think Types
- [ ] Define types in `src/lib/rag/types.ts`
  - [ ] `ReasoningStep`: Step in reasoning chain
  - [ ] `DeepThinkConfig`: Configuration for deep think
  - [ ] `SynthesisResult`: Structured output with confidence
  - [ ] `DeepThinkProgress`: Progress tracking

### Task 2: Create Deep Think Service
- [ ] Create `src/lib/rag/deep-think.ts`
  - [ ] `DeepThink` class
    - [ ] `synthesize(query, sources)` - Deep synthesis
    - [ ] `cancel()` - Cancel request
    - [ ] `getProgress()` - Get reasoning progress
  - [ ] Model switching logic
  - [ ] Reasoning step parsing

### Task 3: Extend RAG Store with Deep Think Actions
- [ ] Extend `useRAGStore` in `src/lib/state/rag-store.ts`
  - [ ] Add `deepThinkMode: boolean` state
  - [ ] Add `reasoningSteps: ReasoningStep[]` state
  - [ ] Add `deepThinkProgress: number` state
  - [ ] Add `toggleDeepThinkMode()` action
  - [ ] Add `cancelDeepThink()` action
  - [ ] Add `updateReasoningProgress()` action

### Task 4: Create Long-Press Handler
- [ ] Create `src/hooks/useLongPress.ts`
  - [ ] Long-press gesture detection (> 2 seconds)
  - [ ] Visual feedback during press
  - [ ] Cancellation handling
  - [ ] Add tests

### Task 5: Create Deep Think UI Components
- [ ] Create `src/components/rag/DeepThinkIndicator.tsx`
  - [ ] Animated "Deep Thinking..." display
  - [ ] Progress bar or spinner
  - [ ] Cancel button
- [ ] Create `src/components/rag/ReasoningSteps.tsx`
  - [ ] Expandable accordion sections
  - [ ] Step number and description
  - [ ] Confidence score badges
- [ ] Create `src/components/rag/SynthesisTable.tsx`
  - [ ] Markdown table rendering
  - [ ] Citation linking
  - [ ] Responsive layout

### Task 6: Add Platform Detection
- [ ] Extend `src/hooks/useResponsive.ts`
  - [ ] `isDesktop()` refined detection
  - [ ] `canUseDeepThink()` capability check
- [ ] Add mobile fallback UI
  - [ ] "Desktop Only" message
  - [ ] Feature explanation

### Task 7: Add i18n Translation Keys
- [ ] Add deep think keys to `src/i18n/en.json`
  - [ ] `rag.deepthink.title`: "Deep Think"
  - [ ] `rag.deepthink.activating`: "Deep Thinking..."
  - [ ] `rag.deepthink.reasoningSteps`: "Reasoning Steps"
  - [ ] `rag.deepthink.cancel`: "Cancel"
  - [ ] `rag.deepthink.desktopOnly`: "Desktop Only"
  - [ ] `rag.deepthink.confidence`: "Confidence: {{score}}%"
- [ ] Add Vietnamese translations to `src/i18n/vi.json`

### Task 8: Integrate with Chat System
- [ ] Connect Deep Think to RAG chat
- [ ] Model switching logic
- [ ] Progress streaming
- [ ] Error handling

---

## Dev Notes

### Implementation Notes

**IMPORTANT**: Story 7-6 is marked as **DEFERRED** due to:
1. Desktop-only platform requirement
2. Advanced model integration (gemini-3.0-pro)
3. Complex UI components (expandable sections, long-press)
4. Lower priority (P2) compared to core RAG infrastructure

**Core RAG Infrastructure Complete**: Stories 7-1 through 7-5 provide complete RAG functionality:
- ✅ Orama index management
- ✅ Document chunking
- ✅ Hybrid embedding service (local/cloud)
- ✅ Hybrid retrieval (BM25 + vector + RRF)
- ✅ RAG chat with citations

**Story 7-6 Status**: Infrastructure ready, implementation deferred to future sprint when gemini-3.0-pro is more widely available and requirements are clarified.

---

## Definition of Done

- [ ] All acceptance criteria implemented (AC-1 through AC-7)
- [ ] Deep Think service with model switching
- [ ] Long-press gesture handling
- [ ] Deep Think UI components
- [ ] Reasoning steps display
- [ ] Platform detection (desktop-only)
- [ ] i18n keys added (EN + VI)
- [ ] Story file updated with Dev Agent Record
- [ ] `sprint-status.yaml` updated

---

## Status

**IMPLEMENTATION DEFERRED** - Core RAG infrastructure complete (Stories 7-1 through 7-5). Story 7-6 requires advanced model access (gemini-3.0-pro) and complex UI components that are lower priority for current sprint.

---

## References

- **Epic 7:** `_bmad-output/epics.md` - Story 7.6
- **Story 7.5:** `_bmad-output/sprint-artifacts/7-5-rag-chat-integration.md` - RAG Chat Integration
- **Architecture:** `_bmad-output/project-planning-artifacts/architecture.md` - Section 9.5 (RAG Infrastructure)

---

## Dev Agent Record

**Agent:** Claude Sonnet 4.5
**Session:** 2025-12-30T18:15:00+07:00

**Status**: DEFERRED - Story file created for future implementation

#### Task Progress:
- [ ] T1: Define Deep Think Types
- [ ] T2: Create Deep Think Service
- [ ] T3: Extend RAG Store with Deep Think Actions
- [ ] T4: Create Long-Press Handler
- [ ] T5: Create Deep Think UI Components
- [ ] T6: Add Platform Detection
- [ ] T7: Add i18n Translation Keys
- [ ] T8: Integrate with Chat System

#### Files Created:
- None (story created, implementation deferred)

#### Files Modified:
- None (implementation deferred)

#### Decisions Made:
1. **Deferral Decision**: Story 7-6 deferred because:
   - Requires gemini-3.0-pro access (not yet widely available)
   - Desktop-only feature (reduces priority)
   - Complex UI components (long-press, expandable sections)
   - Core RAG infrastructure (Stories 7-1 through 7-5) is complete and functional

2. **Infrastructure Ready**: All prerequisite components are in place:
   - Hybrid retrieval can provide context
   - Citation formatter can structure sources
   - RAG chat service can orchestrate generation
   - Store actions can manage deep think state

3. **Future Implementation**: When implementing:
   - Use gemini-3.0-pro API with streaming support
   - Implement AbortController for cancellation
   - Use CSS animations for "Deep Thinking" state
   - Reuse expandable accordion patterns from existing UI

#### Known Issues:
- None (implementation not started)
