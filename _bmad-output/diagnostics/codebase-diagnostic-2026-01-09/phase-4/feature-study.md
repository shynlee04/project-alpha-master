# Study Feature Diagnostic Report

**Generated**: 2026-01-09
**Scope**: Flashcards, Quizzes, Study Sessions
**Status**: PHASE 1 PLACEHOLDER - Core infrastructure exists but UI is detached

---

## 1. Entry Points

| Route | File | Component | Status |
|-------|------|-----------|--------|
| `/study` | `src/routes/study.lazy.tsx` | `StudyWorkspacePhase1` | PLACEHOLDER - Shows "Coming in Phase 2" |
| `/study/$projectId` | `src/routes/study.$projectId.lazy.tsx` | `StudyWorkspace` | PLACEHOLDER - Renders `StudyPlaceholder` |
| `/study/$projectId/flashcards` | Not implemented | - | - |
| `/study/$projectId/quizzes` | Not implemented | - | - |

### Entry Point Details

**Primary Entry**: `/study` (Line 28-52 in `study.lazy.tsx`)
- Wrapped with `ErrorBoundary` for crash protection
- Shows placeholder UI until Phase 2
- Navigation options to IDE and Notes workspaces

**Project-Specific Entry**: `/study/$projectId` (Line 46-67 in `study.$projectId.lazy.tsx`)
- Extracts `projectId` from URL params
- Fetches project via `getProject(projectId)`
- Wraps content in `ProjectProvider`
- Renders `StudyPlaceholder` instead of `StudyPage`

---

## 2. Component Tree

```
StudyPage (src/presentation/components/study/StudyPage.tsx)
├── MainLayout
│   ├── ProjectSelector (STORAGE-3-3)
│   ├── Header
│   │   ├── BookOpen Icon
│   │   ├── Title ("Study Workspace")
│   │   ├── FolderOpen Button → StudyFilePicker Dialog
│   │   ├── AgentManager (AC-02)
│   │   └── CompactStudyStats
│   └── Tabs (flashcards | quizzes | stats)
│       ├── TabsContent "flashcards"
│       │   └── StudySession
│       │       ├── FlashcardView (flashcard.tsx)
│       │       │   ├── Front: question display
│       │       │   ├── Back: answer + rating buttons
│       │       │   └── Progress bar
│       │       ├── Navigation (prev/next/finish)
│       │       └── StudyStatsDisplay (study-stats.tsx)
│       ├── TabsContent "quizzes"
│       │   └── QuizContainer
│       │       ├── QuizStartScreen
│       │       ├── QuizQuestionView
│       │       ├── QuizResults
│       │       └── QuizReview
│       └── TabsContent "stats"
│           └── CompactStudyStats
│
└── StudyFilePicker Dialog (StudyFilePicker.tsx)
    ├── Mount Directory Section
    ├── Scan Files Button
    ├── Import All Button
    └── File List (PDF/Quiz/Markdown)
```

---

## 3. State Management

### Zustand Stores

| Store | Location | Purpose |
|-------|----------|---------|
| `useFlashcardStore` | `src/infrastructure/persistence/stores/flashcard-store.ts` | Flashcard CRUD |
| `useQuizStore` | `src/infrastructure/persistence/stores/study/quiz-store.ts` | Quiz CRUD |
| `useStudyStore` | `src/infrastructure/persistence/stores/study/study-store-refactored.ts` | Study session state |

### Study Store Slice Architecture

```
study-store-refactored.ts (Combined Store)
├── StudyDatabaseSlice
│   ├── cards: Flashcard[]
│   ├── getDueCards(): Flashcard[]
│   └── getCardSrsData(cardId): SRSData
│
├── StudySessionSlice
│   ├── currentSession: StudySession | null
│   ├── startSession(cards): StudySession
│   ├── rateCard(rating): void
│   ├── nextCard(): void
│   ├── previousCard(): void
│   ├── completeSession(): StudyStats
│   └── resetSession(): void
│
├── StudyNavigationSlice
│   ├── currentIndex: number
│   ├── totalCards: number
│   └── progress: number
│
└── StudyStatsSlice
    ├── totalCardsStudied: number
    ├── currentStreak: number
    └── updateStreakFromRatings(ratings): void
```

### Flashcard State Machine

```
IDLE
  ↓ startSession(cards)
IN_PROGRESS
  ├── flip → FLIPPED
  ├── rate(rating) → (auto-advance) → IN_PROGRESS or COMPLETED
  ├── next() → IN_PROGRESS (next card)
  └── previous() → IN_PROGRESS (prev card)
  ↓ completeSession()
COMPLETED
  └── resetSession() → IDLE
```

### Quiz Session State Machine

```
INTRO (no session)
  ↓ startSession()
IN_PROGRESS
  ├── selectAnswer(index) → ANSWER_SELECTED
  ├── next() → IN_PROGRESS (next question)
  └── previous() → IN_PROGRESS (prev question)
  ↓ completeSession()
COMPLETED
  ├── review() → REVIEW
  └── resetSession() → INTRO
REVIEW
  └── resetSession() → INTRO
```

---

## 4. Study Logic Operations

### SRS (Spaced Repetition System) Algorithm

**File**: `src/lib/study/srs-types.ts` (Lines 98-138)

```typescript
function calculateNextReview(rating: SRSRating, current?: SRSData): SRSData
```

**SM-2 Algorithm**:
- `SRSRating`: 'again' | 'hard' | 'good' | 'easy'
- Quality mapping: again=0, hard=2, good=4, easy=5
- Ease factor starts at 2.5, min 1.3
- Interval progression: 1 day → 6 days → interval × easeFactor

**Due Card Calculation**:
```typescript
function isCardDue(srsData: SRSData): boolean {
  return Date.now() >= srsData.nextReview;
}
```

### Quiz Generation

**File**: `src/lib/study/quiz-generator.ts` (Lines 33-207)

**QuizGenerator Class**:
- Uses `@google/genai` SDK with Gemini 2.0 Flash model
- `generateFromContent(content, sourceId, options)` - Single source
- `generateFromSources(sources, options)` - Multiple sources
- Returns `QuizGenerationResult` with Zod validation

**Mock Generator** (Lines 212-259):
- `generateMockQuiz(content, sourceId, questionCount)` - For testing
- Generates 5 mock questions by default
- Topic distribution: Topic 1, 2, 3

### Quiz Session Management

**File**: `src/lib/study/quiz-session.ts` (Lines 68-165)

| Function | Purpose |
|----------|---------|
| `createQuizSession(quiz)` | Initialize session |
| `selectAnswer(session, question, selectedIndex, timeSpent)` | Record answer |
| `nextQuestion(session, totalQuestions)` | Advance to next |
| `previousQuestion(session)` | Go back |
| `completeQuizSession(session, quiz, totalTimeSpent)` | Calculate results |
| `calculateGrade(percentage)` | A/B/C/D/F |

---

## 5. Database Operations

### Flashcard Database

**File**: `src/infrastructure/persistence/stores/flashcard/flashcard-db.ts`

**Dexie Database**: `FlashcardDB`

| Table | Indexes | Purpose |
|-------|---------|---------|
| `flashcards` | `id, topic, difficulty, createdAt, *sourceIds` | Individual cards |
| `flashcardSets` | `id, name, createdAt, updatedAt, *cardIds` | Card groupings |

**Record Schema**:

```typescript
interface FlashcardRecord {
  id: string;
  workspaceId: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  projectId: string;
  sourceIds: string[];
  createdAt: number;
}

interface FlashcardSetRecord {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  cardIds: string[];
  sourceIds: string[];
  createdAt: number;
  updatedAt: number;
}
```

### Quiz Database

**File**: `src/infrastructure/persistence/stores/study/quiz/quiz-db.ts`

**Dexie Database**: `ProjectAlphaQuizDB` (v2)

| Table | Indexes | Purpose |
|-------|---------|---------|
| `quizzes` | `id, workspaceId, title, createdAt, topic, *sourceIds` | Quiz metadata |
| `quizQuestions` | `id, workspaceId, quizId, difficulty, topic, *sourceIds` | Questions |

**Record Schema**:

```typescript
interface QuizRecord {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  questionIds: string[];
  sourceIds: string[];
  settings: QuizSettings;
  createdAt: number;
  updatedAt: number;
}

interface QuizQuestionRecord {
  id: string;
  workspaceId: string;
  quizId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  sourceIds: string[];
  createdAt: number;
}

interface QuizSettings {
  questionCount: number;
  includeExplanation: boolean;
  difficulty: 'mixed' | 'easy' | 'medium' | 'hard';
  questionTypes: QuizQuestionType[];
}
```

---

## 6. Internal Issues Found

### Critical Issues

| ID | Issue | Location | Severity |
|----|-------|----------|----------|
| STUDY-001 | Route placeholders show "Coming in Phase 2" | `study.lazy.tsx:59-106` | BLOCKER |
| STUDY-002 | useWorkspaceAccess causes infinite loops | Comment at line 111 | BLOCKER |
| STUDY-003 | Cross-workspace events disabled (line 86-88) | `StudyPage.tsx:84-88` | MINOR |
| STUDY-004 | Quiz from store not loaded (line 31) | `QuizContainer.tsx:31` | MAJOR |
| STUDY-005 | StudyFilePicker uses type casting (line 24, 134, 161) | `StudyFilePicker.tsx` | MINOR |

### Technical Debt

| ID | Issue | Impact |
|----|-------|--------|
| TD-001 | No flashcard generation from PDFs | Missing core feature |
| TD-002 | No quiz preview component | Incomplete flow |
| TD-003 | Study session loads empty cards | `study-session.tsx:367` |
| TD-004 | `useQuizSession` hook in separate file | Not analyzed |

### State Management Issues

1. **Duplicate Store Pattern**: Flashcards in `flashcard-store.ts` while study session uses `study-store-refactored.ts`
2. **Session State Persistence**: Study session state not persisted to IndexedDB (only stats)
3. **Rating Storage**: `ratings: Map<string, SRSRating>` - Map not directly serializable

---

## 7. Dependencies on Other Features

### External Dependencies

| Feature | Dependency Type | Details |
|---------|-----------------|---------|
| **Knowledge Workspace** | Data Source | Flashcards/quizzes generated from knowledge sources |
| **IDE Workspace** | Navigation | Switch between workspaces |
| **Project Context** | State | `ProjectProvider` wraps StudyPage |
| **File Sync Service** | File Access | `StudyFilePicker` uses `FileSyncService` |
| **Gemini API** | Quiz Generation | `QuizGenerator` uses Google GenAI SDK |
| **Agent Manager** | Agent Selection | Uses unified agent selector |

### Cross-Workspace Events (Disabled)

```typescript
// StudyPage.tsx:84-88 - DISABLED due to infinite loop
// useAllCrossWorkspaceEvents();
// useWorkspaceChangedEvents();
```

### Store Dependencies

| Store | Imports From | Purpose |
|-------|--------------|---------|
| `useFlashcardStore` | `@/infrastructure/persistence/stores/flashcard/*` | Flashcard CRUD |
| `useQuizStore` | `@/infrastructure/persistence/stores/study/quiz/*` | Quiz CRUD |
| `useStudyStore` | `@/infrastructure/persistence/stores/study/*` | Session state |
| `useProjectStore` | `@/infrastructure/persistence/stores/project` | Project selection |

---

## 8. File Inventory

### Core Routes

| File | Lines | Status |
|------|-------|--------|
| `src/routes/study.lazy.tsx` | 161 | PLACEHOLDER |
| `src/routes/study.$projectId.lazy.tsx` | 68 | PLACEHOLDER |

### Components

| File | Lines | Purpose |
|------|-------|---------|
| `src/presentation/components/study/StudyPage.tsx` | 390 | Main page |
| `src/presentation/components/study/flashcard.tsx` | 291 | Flashcard UI |
| `src/presentation/components/study/study-session.tsx` | 382 | Session controller |
| `src/presentation/components/study/study-stats.tsx` | 202 | Stats display |
| `src/presentation/components/study/QuizContainer.tsx` | 180 | Quiz flow |
| `src/presentation/components/study/QuizStartScreen.tsx` | 184 | Quiz intro |
| `src/presentation/components/study/QuizQuestionView.tsx` | 227 | Question UI |
| `src/presentation/components/study/QuizResults.tsx` | 182 | Results display |
| `src/presentation/components/study/QuizReview.tsx` | 243 | Review UI |
| `src/presentation/components/study/StudyFilePicker.tsx` | 353 | File import |

### Library Logic

| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/study/srs-types.ts` | 258 | SRS algorithm |
| `src/lib/study/quiz-types.ts` | 151 | Quiz type definitions |
| `src/lib/study/quiz-generator.ts` | 302 | AI quiz generation |
| `src/lib/study/quiz-session.ts` | 203 | Session management |
| `src/lib/study/index.ts` | 8 | Barrel export |

### Persistence

| File | Lines | Purpose |
|------|-------|---------|
| `src/infrastructure/persistence/stores/flashcard/flashcard-db.ts` | 78 | Flashcard DB |
| `src/infrastructure/persistence/stores/study/quiz/quiz-db.ts` | 90 | Quiz DB |
| `src/infrastructure/persistence/stores/study/study-store-refactored.ts` | 131 | Combined store |
| `src/infrastructure/persistence/stores/study/slices/*.ts` | ~50 each | Store slices |

---

## 9. Summary

### What Works

1. ✅ **SRS Algorithm** - Complete SM-2 implementation
2. ✅ **Quiz Session Logic** - State machine for quiz flow
3. ✅ **Flashcard UI** - 3D flip animation, keyboard shortcuts
4. ✅ **Quiz Generation** - Gemini API integration with mock fallback
5. ✅ **Persistence Layer** - Dexie databases for flashcards and quizzes
6. ✅ **Study Store** - Slice-based Zustand architecture

### What Doesn't Work

1. ❌ **Routes are placeholders** - Show "Coming in Phase 2"
2. ❌ **useWorkspaceAccess infinite loop** - Blocks Phase 1 reattachment
3. ❌ **Flashcards not loading** - Study session uses empty array
4. ❌ **Quiz not loading from store** - QuizContainer has TODO at line 31
5. ❌ **Cross-workspace events disabled** - Due to infinite loop

### Phase 1 Blockers

1. `useWorkspaceAccess` hook causes infinite loops (GATE-R1, GATE-R3)
2. Project selector integration with study workspace
3. Loading flashcards from IndexedDB into study session

### Recommendations

1. **Priority 1**: Fix `useWorkspaceAccess` hook to enable Phase 2
2. **Priority 2**: Connect `useStudySession` to actual flashcard store
3. **Priority 3**: Implement quiz list view to load quizzes from store
4. **Priority 4**: Re-enable cross-workspace events after infinite loop fix
5. **Priority 5**: Add PDF-to-flashcard generation pipeline
