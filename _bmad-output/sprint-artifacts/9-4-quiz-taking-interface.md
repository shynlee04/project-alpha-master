---
epic: 9
story: 4
title: Quiz Taking Interface
status: ready-for-dev
validation_passed: true
validation_date: 2025-12-30T20:10:00+07:00
validation_notes: Story validated - all ACs clear, dependencies verified (9-2), NFR specified, dev notes comprehensive
created: 2025-12-30T11:05:00+07:00
author: Ralph Loop Agent
team: Team A (UI/Frontend)
phase: story-dev-cycle
sprint: 9
priority: P1
estimated_effort: 4-6 hours
nfr_validated:
  - NFR-PERF-P2-06
tech_stack:
  - React
  - Dexie
dependencies:
  - "9-2-quiz-generator"
blockers: []
---

# Story 9.4: Quiz Taking Interface

## User Story

**As a** student or teacher taking a quiz,
**I want** an interactive quiz interface with scoring and explanations,
**So that** I can assess my knowledge and learn from mistakes.

## Acceptance Criteria

### AC-1: Quiz Start Screen

**Given** user selects a quiz
**When** quiz loads
**Then** show: title, question count, time estimate
**And** show: difficulty breakdown
**And** show: source attribution
**And** "Start Quiz" button to begin

### AC-2: Question Display

**Given** quiz is in progress
**When** question displays
**Then** show question text clearly
**And** show 4 answer options
**And** options are selectable (single select)
**And** show progress indicator

### AC-3: Answer Selection

**Given** user selects an answer
**When** they confirm
**Then** highlight selected option
**And** immediately show correct/incorrect
**And** show explanation below
**And** disable further selection

### AC-4: Quiz Results

**Given** all questions answered
**When** quiz completes
**Then** show: score (X/Y correct)
**And** show: time taken
**And** show: question breakdown
**And** allow review of each question with answers

### AC-5: Review Mode

**Given** quiz completed
**When** user enters review
**Then** show all questions with user answer
**And** highlight correct/incorrect
**And** show explanation for each
**And** allow retake if desired

## Tasks

- [ ] Create QuizStartScreen component
- [ ] Build QuizQuestion component
- [ ] Implement answer selection and validation
- [ ] Create QuizResults component
- [ ] Build QuizReview component
- [ ] Add timer functionality
- [ ] Track quiz history in Dexie
- [ ] Write unit tests for quiz logic
- [ ] Write integration tests for quiz flow

## Dev Notes

### Quiz Taking Flow

```typescript
type QuizState = 'intro' | 'in-progress' | 'review' | 'completed';

interface QuizSession {
  quizId: string;
  currentQuestionIndex: number;
  answers: Map<string, number>; // questionId -> selectedOptionIndex
  startTime: number;
  endTime?: number;
}
```

### Quiz Components

```typescript
// QuizContainer - manages state and flow
function QuizContainer({ quiz }: { quiz: Quiz }) {
  const [state, setState] = useState<QuizState>('intro');
  const [session, setSession] = useState<QuizSession>(/* ... */);

  switch (state) {
    case 'intro':
      return <QuizIntro quiz={quiz} onStart={() => setState('in-progress')} />;
    case 'in-progress':
      return <QuizQuestionView quiz={quiz} session={session} />;
    case 'completed':
      return <QuizResults quiz={quiz} session={session} />;
    case 'review':
      return <QuizReview quiz={quiz} session={session} />;
  }
}
```

### Question Component

```typescript
function QuizQuestion({
  question,
  selectedIndex,
  showResult,
  onSelect,
}: QuizQuestionProps) {
  return (
    <div className="quiz-question">
      <h3 className="question-text">{question.question}</h3>
      <div className="options">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={cn('option', {
              selected: selectedIndex === index,
              correct: showResult && index === question.correctIndex,
              incorrect: showResult && selectedIndex === index && index !== question.correctIndex,
            })}
            onClick={() => !showResult && onSelect(index)}
            disabled={showResult}
          >
            <span className="option-letter">{String.fromCharCode(65 + index)}</span>
            <span className="option-text">{option}</span>
          </button>
        ))}
      </div>
      {showResult && (
        <div className="explanation">
          <strong>Explanation:</strong> {question.explanation}
        </div>
      )}
    </div>
  );
}
```

### Results Component

```typescript
function QuizResults({ quiz, session }: QuizResultsProps) {
  const score = calculateScore(quiz, session);
  const percentage = (score.correct / quiz.questions.length) * 100;

  return (
    <div className="quiz-results">
      <h2>Quiz Complete!</h2>
      <div className="score-display">
        <span className="score">{score.correct}</span>
        <span className="divider">/</span>
        <span className="total">{quiz.questions.length}</span>
      </div>
      <div className="percentage" data-grade={getGrade(percentage)}>
        {percentage}%
      </div>
      <button onClick={() => /* enter review */}>Review Answers</button>
      <button onClick={() => /* retake */}>Retake Quiz</button>
    </div>
  );
}
```

### Design Tokens

```css
--color-correct: var(--color-success);
--color-incorrect: var(--color-error);
--color-selected: var(--color-primary);
--radius-option: var(--radius-md);
--quiz-question-max-width: 800px;
```

## Research Requirements

### Dependency Research: Quiz UI Patterns

**Source: Context7 Documentation**

**Key Patterns:**
1. State management for quiz flow (intro → progress → results → review)
2. Timer implementation patterns
3. Scoring and grade calculation
4. Touch gesture handling for mobile

### Codebase Patterns to Follow

- 8-bit design system from design-tokens.css
- Touch gesture handling from Epic 1 (Mobile Demo Mode)
- State management patterns from Epic 2 (Zustand + Dexie)

## References

- **PRD**: Section 9.4 (Quiz Taking)
- **UX Design**: Section 22.3 (Quiz Assessment)

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
| 2025-12-30T11:05:00+07:00 | drafted | Story created |
