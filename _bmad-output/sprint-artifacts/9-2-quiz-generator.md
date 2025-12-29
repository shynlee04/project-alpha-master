---
epic: 9
story: 2
title: Quiz Generator
status: ready-for-dev
validation_passed: true
validation_date: 2025-12-30T17:20:00+07:00
validation_notes: Research completed via Context7 (TanStack AI) and web search (Gemini API). Zod schemas validated. Implementation pattern follows flashcard-generator.ts
created: 2025-12-30T10:55:00+07:00
author: Ralph Loop Agent
team: Team B (Backend/AI)
phase: story-dev-cycle
sprint: 9
priority: P1
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

# Story 9.2: Quiz Generator

## User Story

**As a** teacher creating assessments,
**I want** AI-generated quizzes from my materials,
**So that** I can quickly create engaging student assessments.

## Acceptance Criteria

### AC-1: Generate Quiz

**Given** a user selects sources and quiz settings
**When** they click "Generate Quiz"
**Then** AI creates multiple choice questions
**And** each question has 4 options (1 correct, 3 distractors)
**And** correct answer is marked
**And** explanation provided

### AC-2: Quiz Structure

**Given** quiz is generated
**When** stored
**Then** each question has:
  - id: unique identifier
  - question: question text
  - options: array of 4 answer choices
  - correctIndex: index of correct answer
  - explanation: why the answer is correct
  - sourceIds: cited sources
  - difficulty: 'easy' | 'medium' | 'hard'

### AC-3: Question Types

**Given** quiz generation
**When** user configures settings
**Then** support multiple choice (default)
**And** support true/false
**And** support multiple select

### AC-4: Quiz Metadata

**Given** quiz is saved
**When** displayed
**Then** show: title, question count, time estimate
**And** show: difficulty breakdown
**And** show: source attribution

### AC-5: Preview and Edit

**Given** quiz is generated
**When** preview shown
**Then** user can reorder questions
**And** user can edit question text
**And** user can adjust correct answer

## Tasks

- [ ] Define Quiz and QuizQuestion types
- [ ] Implement AI prompt for quiz generation
- [ ] Create distractor generation strategy
- [ ] Build quiz preview UI
- [ ] Add edit capability for questions
- [ ] Create mock quiz data
- [ ] Write unit tests for quiz types
- [ ] Write integration tests for generation

## Dev Notes

### Quiz Type

```typescript
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceIds: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  sourceIds: string[];
  settings: {
    questionCount: number;
    includeExplanation: boolean;
    difficulty: 'mixed' | 'easy' | 'medium' | 'hard';
  };
  createdAt: number;
}
```

### AI Prompt Strategy

```
Generate a {count}-question multiple choice quiz from the following content.

Requirements:
- Each question has 4 options (A, B, C, D)
- Exactly ONE option is correct
- Generate plausible distractors based on common misconceptions
- Include brief explanation for the correct answer
- Cite sources using [source_id] format

Output format: JSON object with questions array
```

### Mock Quiz Data

```typescript
const mockQuiz = {
  id: 'quiz-1',
  title: 'Machine Learning Basics Quiz',
  questions: [
    {
      id: 'q-1',
      question: 'What is supervised learning?',
      options: [
        'Learning from labeled data',
        'Learning without any data',
        'Learning from reinforcement',
        'Learning from unlabeled data',
      ],
      correctIndex: 0,
      explanation: 'Supervised learning uses labeled training data...',
      sourceIds: ['src-1'],
      difficulty: 'easy',
    },
  ],
};
```

## Research Requirements

### Dependency Research: AI Quiz Generation

**Source: Context7 Documentation**

**Key Patterns:**
1. TanStack AI prompt generation for structured outputs
2. JSON schema validation for AI responses
3. Distractor generation strategies (common misconceptions)
4. Explanation generation prompts

### Codebase Patterns to Follow

- AI integration patterns from Epic 4 (tool execution)
- Zod validation from existing schemas
- Error handling patterns from error-handling.ts

## References

- **PRD**: Section 9.2 (Quiz Generation)
- **UX Design**: Section 22.2 (Quiz Interface)

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
| 2025-12-30T10:55:00+07:00 | drafted | Story created |
