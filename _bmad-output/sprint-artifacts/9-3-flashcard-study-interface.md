---
epic: 9
story: 3
title: Flashcard Study Interface
status: ready-for-dev
validation_passed: true
validation_date: 2025-12-30T18:00:00+07:00
validation_notes: Story file reviewed, research notes complete, dependencies verified (Dexie, React animations), flashcard types from 9-1 ready for use
created: 2025-12-30T11:00:00+07:00
author: Ralph Loop Agent
team: Team A (UI/Frontend)
phase: story-dev-cycle
sprint: 9
priority: P0
estimated_effort: 4-6 hours
nfr_validated:
  - NFR-PERF-P2-06
tech_stack:
  - React
  - CSS Animations
  - Dexie
dependencies:
  - "9-1-flashcard-generator"
blockers: []
---

# Story 9.3: Flashcard Study Interface

## User Story

**As a** student studying for exams,
**I want** an interactive flashcard interface with flip animations,
**So that** I can efficiently review and memorize key concepts.

## Acceptance Criteria

### AC-1: Card Flip Animation

**Given** a flashcard is displayed
**When** user clicks or taps the card
**Then** card flips with smooth 3D animation
**And** front shows question, back shows answer
**And** flip direction is from bottom edge

### AC-2: Navigation

**Given** flashcards in a study session
**When** user navigates
**Then** swipe left/right on mobile
**And** arrow keys on desktop
**And** show progress (card X of Y)

### AC-3: Spaced Repetition Controls

**Given** user reviews a card
**When** they indicate comprehension
**Then** rate as: Again, Hard, Good, Easy
**And** schedule next review based on rating
**And** algorithm considers card difficulty

### AC-4: Study Session Stats

**Given** study session in progress
**When** user completes session
**Then** show: cards studied, time spent, accuracy
**And** show: streak maintained/broken
**And** save progress to IndexedDB

### AC-5: Offline-First

**Given** no internet connection
**When** user accesses flashcards
**Then** all functionality works offline
**And** data loads from IndexedDB
**And** no network requests required

## Tasks

- [ ] Create Flashcard component with 3D flip
- [ ] Implement card navigation (swipe + keyboard)
- [ ] Build spaced repetition algorithm
- [ ] Create study session tracker
- [ ] Add statistics display
- [ ] Ensure offline-first via Dexie
- [ ] Write unit tests for flip animation
- [ ] Write integration tests for study flow

## Dev Notes

### Flashcard Component

```typescript
interface FlashcardViewProps {
  card: Flashcard;
  onFlip: () => void;
  onRate: (rating: SRSRating) => void;
}

function FlashcardView({ card, onFlip, onRate }: FlashcardViewProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flashcard-container">
      <div
        className={cn('flashcard', { flipped: isFlipped })}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="flashcard-front">
          <span className="card-content">{card.front}</span>
          <span className="tap-hint">Tap to flip</span>
        </div>
        <div className="flashcard-back">
          <span className="card-content">{card.back}</span>
          <div className="rating-buttons">
            <button onClick={() => onRate('again')}>Again</button>
            <button onClick={() => onRate('hard')}>Hard</button>
            <button onClick={() => onRate('good')}>Good</button>
            <button onClick={() => onRate('easy')}>Easy</button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3D Flip Animation (CSS)

```css
.flashcard {
  perspective: 1000px;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.flashcard.flipped {
  transform: rotateX(180deg);
}

.flashcard-front,
.flashcard-back {
  backface-visibility: hidden;
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.flashcard-back {
  transform: rotateX(180deg);
}
```

### SRS Algorithm (Simplified)

```typescript
interface SRSData {
  interval: number;      // Days until next review
  easeFactor: number;    // Difficulty multiplier
  repetitions: number;   // Times reviewed
  lastReview: number;}

function calculateNextReview(
  rating: SRSRating,
  current: SRSData
): SRSData {
  // Simplified SM-2 algorithm
  // ... implementation
}
```

### Design Tokens

```css
--flashcard-min-height: 300px;
--flashcard-max-width: 600px;
--flip-duration: 0.6s;
```

## Research Requirements

1. **Codebase**: CSS animation patterns from animations.css
2. **Codebase**: Touch gesture handling from Epic 1
3. **Context7**: React animation best practices

## References

- **PRD**: Section 9.3 (Flashcard Study)
- **UX Design**: Section 22.2 (Study Mode UI)

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
| 2025-12-30T11:00:00+07:00 | drafted | Story created |
