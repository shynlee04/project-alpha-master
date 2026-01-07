# Story 38-05d: Create domain/entities/study.ts

**Status**: PENDING
**Story Points**: 3
**Assignee**: Team B
**Epic**: EPIC-38 (Domain Layer Implementation)

## Description
Implement the Study domain entities following the Clean Architecture pattern established in `Project.ts`. This involves creating pure TypeScript interfaces for flashcards, quizzes, and study sessions, ensuring they are decoupled from infrastructure concerns (like specific spaced repetition algorithms or database schemas).

## Acceptance Criteria
- [ ] Create `src/core/entities/study.ts`
- [ ] Define `Flashcard` interface (id, deckId, front, back, metadata, status, nextReview, interval, easeFactor)
- [ ] Define `Quiz` interface (id, title, questions, metadata, created, updated)
- [ ] Define `StudySession` interface (id, type, startTime, endTime, itemsReviewed, score, metadata)
- [ ] Pure TypeScript with NO framework imports (no React, Zustand, Dexie)
- [ ] 100% testable without mocking (no async operations, no browser APIs)
- [ ] Follow `Project.ts` pattern
- [ ] Include `CreateParams` and `UpdateParams` types for each entity
- [ ] Document business rules in JSDoc comments
- [ ] Zero TypeScript errors in production code

## Technical Notes
- Use `src/core/entities/Project.ts` as the reference implementation.
- `Flashcard` status: `'new' | 'learning' | 'review' | 'relearning'`.
- `StudySession` type: `'flashcard' | 'quiz'`.
- Ensure strict typing for metadata (Record<string, unknown>).

## Tasks
1. Create `src/core/entities/study.ts`
2. Create `src/core/entities/__tests__/study.test.ts`
3. Implement interfaces and types
4. Write unit tests
5. Verify coverage and types
