# Story 28-23: Streaming Message Container

**Epic:** 28 - UX Brand Identity & Design System/Holistic Integration
**Sprint:** Phase 6 - AI Foundation Integration Readiness
**Status:** drafted
**Priority:** P0
**Points:** 3

## User Story

**As a** User
**I want** to see AI responses appear immediately as they are generated (token-by-token)
**So that** the interaction feels responsive and alive, rather than waiting for full completion.

## Acceptance Criteria

### AC-1: Streaming Rendering
- **Given** an AI response is being generated
- **When** new tokens arrive
- **Then** the message content should update in real-time without flickering
- **And** the auto-scroll should keep the latest content in view

### AC-2: Markdown Support
- **Given** the AI generates markdown content
- **When** the message streams in
- **Then** text formatting (bold, italic, lists) should render correctly
- **And** Code Blocks (```) should render using the `CodeBlock` component from Story 28-20

### AC-3: Tool Call Integration
- **Given** the AI executes a tool
- **When** the tool call event is received
- **Then** it should render using the `ToolCallBadge` component from Story 28-19
- **And** it should be properly interleaved with text content

### AC-4: Styling & Aesthetic
- **Given** the message container is displayed
- **When** rendering content
- **Then** it should follow the 8-bit pixel aesthetic (ShadcnUI + Tailwind)
- **And** support dark mode fully

### AC-5: Localization
- **Given** the interface is in Vietnamese
- **When** displaying system messages or attributes
- **Then** they should be localized (e.g., "Thinking...", "Typing...")

## Tasks

- [ ] **Research:** Identify best React markdown library for streaming (e.g., `react-markdown` vs `markdown-to-jsx`) preventing layout shift. <!-- id: 1 -->
- [ ] **Research:** Define exact props interface matching `EnhancedChatInterface`. <!-- id: 2 -->
- [ ] **Dev:** Create `StreamingMessage.tsx` skeleton. <!-- id: 3 -->
- [ ] **Dev:** Implement markdown parsing with custom components (`CodeBlock`, `ToolCallBadge`). <!-- id: 4 -->
- [ ] **Dev:** Implement smooth streaming logic (maybe a custom hook `useTypewriter`?). <!-- id: 5 -->
- [ ] **Test:** Create unit tests for token updates and markdown rendering. <!-- id: 6 -->
- [ ] **Verify:** Integrate into `EnhancedChatInterface` and verify with mock streaming data. <!-- id: 7 -->

## Dev Notes

- **Architecture Pattern:** Use a "smart" container that takes a `stream` or `content` prop and handles the efficient DOM updates.
- **Integration:** This replaces the simple `MessageContent` component currently inside `EnhancedChatInterface`.
- **Performance:** Avoid re-parsing the entire markdown tree on every character. Use memoization.
- **Accessibility:** Ensure `aria-live` regions for screen readers during streaming.

## Research Requirements

- [ ] Check `react-markdown` compatibility with streaming (does it close tags automatically?).
- [ ] Check how to inject `CodeBlock` into the markdown parser.

## Dev Agent Record

**Agent:** Gemini 2.5 Pro (Platform B)
**Session:** 2025-12-23T02:05-02:10 UTC+7

### Task Progress:
- [x] T1: Create story file - Done
- [x] T2: Create context XML - Done
- [x] T3: Implement StreamingMessage.tsx - Done with TDD (12 tests)
- [x] T4: Wire CodeBlock integration - Done via parseContent()
- [x] T5: Unit tests - 12/12 passing

### Research Executed:
- Context7: React memo patterns for performance
- DeepWiki: react-markdown streaming compatibility (alternative approach used)

### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| src/components/ide/StreamingMessage.tsx | Created | 172 |
| src/components/ide/__tests__/StreamingMessage.test.tsx | Created | 155 |

### Tests Created:
- StreamingMessage.test.tsx: 12 tests covering rendering, streaming, markdown, code blocks

### Decisions Made:
- **Custom markdown parser** instead of react-markdown for better streaming compatibility
- **parseContent()** function splits content into text/code parts
- **instant** prop for immediate rendering (useful for tests and loaded messages)
- **Blinking cursor** while streaming for visual feedback

## Status History

| Date | Status | Agent | Notes |
|------|--------|-------|-------|
| 2025-12-23 | drafted | @/sm | Initial creation |
| 2025-12-23 | ready-for-dev | @/sm | Context XML created |
| 2025-12-23 | in-progress | @/dev | TDD implementation |
| 2025-12-23 | done | @/dev | 12/12 tests pass |
