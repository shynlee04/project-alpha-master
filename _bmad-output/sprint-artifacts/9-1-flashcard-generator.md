---
epic: 9
story: 1
title: Flashcard Generator
status: drafted
created: 2025-12-30T10:50:00+07:00
author: Ralph Loop Agent
team: Team B (Backend/AI)
phase: story-dev-cycle
sprint: 9
priority: P0
estimated_effort: 4-6 hours
nfr_validated:
  - NFR-PERF-P2-06
tech_stack:
  - TanStack AI
  - Gemini API
  - Dexie
dependencies:
  - "6-1-source-import-pipeline"
blockers: ["Awaiting Epic 6 completion for real source data"]
---

# Story 9.1: Flashcard Generator

## User Story

**As a** student preparing for exams,
**I want** AI-generated flashcards from my sources,
**So that** I can study key concepts efficiently.

## Acceptance Criteria

### AC-1: Generate Flashcards

**Given** a user selects sources
**When** they click "Generate Flashcards"
**Then** AI extracts Q&A pairs from content
**And** each card has front (question) and back (answer)
**And** cards cite the source `[1]`, `[2]`, etc.

### AC-2: Card Structure

**Given** flashcards are generated
**When** stored
**Then** each card has:
  - id: unique identifier
  - front: question text
  - back: answer text
  - sourceIds: array of source IDs
  - difficulty: 'easy' | 'medium' | 'hard'
  - topic: string category
  - createdAt: timestamp

### AC-3: Preview Before Save

**Given** AI generates flashcards
**When** generation completes
**Then** preview shows first 5 cards
**And** user can approve or discard
**And** user can edit individual cards

### AC-4: Filter and Search

**Given** flashcards exist
**When** user filters
**Then** filter by source, topic, or difficulty
**And** search finds cards by content
**And** search is case-insensitive

### AC-5: Mock Data for Testing

**Given** Epic 6 not complete
**When** testing flashcard generation
**Then** use mock sources with rich content
**And** mock AI response structure matches real API

## Tasks

- [ ] Define Flashcard type and storage schema
- [ ] Implement AI prompt for flashcard generation
- [ ] Create flashcard generation API endpoint
- [ ] Build preview UI with edit capability
- [ ] Implement filter and search logic
- [ ] Create mock data for testing
- [ ] Write unit tests for flashcard types
- [ ] Write integration tests for generation

## Dev Notes

### Flashcard Type

```typescript
interface Flashcard {
  id: string;
  front: string;        // Question
  back: string;         // Answer
  sourceIds: string[];  // Citations
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  createdAt: number;
}

interface FlashcardSet {
  id: string;
  name: string;
  cards: Flashcard[];
  sourceIds: string[];
  createdAt: number;
}
```

### AI Prompt Strategy

```
You are an expert educator. Generate {count} flashcards from the following content.

Requirements:
- Each card has a question (front) and answer (back)
- Focus on key concepts, definitions, and important facts
- Include difficulty level for each card
- Cite sources using [source_id] format

Output format: JSON array of flashcard objects
```

### Mock Data Structure

```typescript
const mockSources = [
  {
    id: 'src-1',
    title: 'Introduction to Machine Learning',
    content: 'Machine learning is a subset of AI...',
    keyConcepts: ['supervised learning', 'neural networks'],
  },
];
```

## Research Requirements

1. **Context7**: TanStack AI prompt generation patterns
2. **Context7**: Gemini API flashcard/QA generation
3. **Codebase**: Existing AI integration patterns from Epic 4

## References

- **PRD**: Section 9.1 (Flashcard Generation)
- **UX Design**: Section 22.1 (Flashcard Interface)
- **Epic 4**: AI Tool patterns

## Dev Agent Record

### Task Progress:
- TBD

### Research Executed:
- TBD

### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| | | |

### Tests Created:
- TBD

### Decisions Made:
- TBD

## Code Review

**Reviewer:** TBD
**Date:** TBD

### Checklist:
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable
- [ ] i18n keys added (EN + VI)

### Issues Found:
- TBD

### Sign-off:
⌛ PENDING

## History

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-30T10:50:00+07:00 | drafted | Story created |
