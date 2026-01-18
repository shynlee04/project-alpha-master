# Feature Group: Workspace-Specific Features - Knowledge & Study

**Shard ID**: ARCH-SHARD-03-07
**Parent**: ARCH-REMEDIATION-INDEX-2026-01-14
**Focus**: Workspace-Specific Features #3 - Knowledge & Study (RAG, Collections, Flashcards, Quiz, SRS)
**Status**: COMPLETE - DEEP ANALYSIS

---

## 1. Architecture → Knowledge & Study Mapping

### 1.1 Architecture Groups Involved

| Architecture Group | Files | Issue Severity | Impact on Knowledge/Study |
|--------------------|-------|----------------|----------------------------|
| **F: Layers & Boundaries** | `lib/knowledge/*` (46 files) | P0 | GOD MODULE |
| **F: Layers & Boundaries** | `lib/rag/*` (30 files) | P0 | GOD MODULE |
| **A: State & Stores** | `knowledge-store.ts` | ✅ GOOD | 6 slices |
| **A: State & Stores** | `study-store-refactored.ts` | ✅ GOOD | Well-structured |
| **A: State & Stores** | `flashcard-store.ts` | ✅ GOOD | 5 slices |
| **C: Persistence** | `knowledge-db.ts`, `flashcard-db.ts` | P0 | Separate DBs |

### 1.2 Knowledge Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 KNOWLEDGE & STUDY WORKSPACE ARCHITECTURE               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   KNOWLEDGE STORE LAYER                        │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │         knowledge-store.ts (6 slices)                  │   │   │
│  │  │                                                          │   │   │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │   │   │
│  │  │  │Collection│ │ Metadata│ │ Source  │ │Synthesis│ │   │   │
│  │  │  │  slice   │ │  slice  │ │  CRUD   │ │  slice  │ │   │   │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │   │   │
│  │  │                                                          │   │   │
│  │  │  ✅ Well-structured slice pattern                       │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                   │                                    │
│                                   ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   KNOWLEDGE GOD MODULE                         │   │
│  │   lib/knowledge/* (46 files!)                                 │   │
│  │   ⚠️ NEEDS REFACTORING INTO SUB-MODULES                     │   │
│  │                                                                  │   │
│  │   ┌───────────────────────────────────────────────────────┐      │   │
│  │   │           SUB-MODULES NEEDED (proposed)           │      │   │
│  │   ├───────────────────────────────────────────────────────┤      │   │
│  │   │  lib/knowledge/synthesis/     (8 files)             │      │   │
│  │   │  lib/knowledge/import/       (6 files)             │      │   │
│  │   │  lib/knowledge/graph/       (5 files)             │      │   │
│  │   │  lib/knowledge/pdf/         (4 files)             │      │   │
│  │   │  lib/knowledge/url/         (3 files)             │      │   │
│  │   │  lib/knowledge/flashcard/   (4 files)             │      │   │
│  │   └───────────────────────────────────────────────────────┘      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                   │                                    │
│                                   ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   RAG PIPELINE                                 │   │
│  │   lib/rag/* (30 files!)                                       │   │
│  │   ⚠️ NEEDS REFACTORING INTO SUB-MODULES                     │   │
│  │                                                                  │   │
│  │   ┌───────────────────────────────────────────────────────┐      │   │
│  │   │           SUB-MODULES NEEDED (proposed)           │      │   │
│  │   ├───────────────────────────────────────────────────────┤      │   │
│  │   │  lib/rag/chunking/       (5 files)                 │      │   │
│  │   │  lib/rag/embedding/     (4 files)                 │      │   │
│  │   │  lib/rag/indexing/      (4 files)                 │      │   │
│  │   │  lib/rag/retrieval/    (5 files)                 │      │   │
│  │   │  lib/rag/query/        (4 files)                 │      │   │
│  │   └───────────────────────────────────────────────────────┘      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   STUDY STORE LAYER                            │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │         study-store-refactored.ts (4 slices)          │   │   │
│  │  │                                                          │   │   │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │   │   │
│  │  │  │ Session │ │ Session │ │ Cards   │ │  SRS    │ │   │   │
│  │  │  │  CRUD   │ │ Progress│ │  CRUD   │ │ Engine  │ │   │   │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │   │   │
│  │  │                                                          │   │   │
│  │  │  ✅ Well-structured slice pattern                       │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Issues Found (Knowledge/Study Specific)

| Issue | Location | Severity | Root Cause |
|-------|----------|----------|------------|
| **Knowledge god module** | `lib/knowledge/*` (46 files) | P0 | 6 concerns in one directory |
| **RAG god module** | `lib/rag/*` (30 files) | P0 | 5 concerns in one directory |
| **Separate Dexie DBs** | `knowledge-db.ts`, `flashcard-db.ts` | P0 | Fragmented persistence |
| **KnowledgePage god component** | `KnowledgePage.tsx:749` | P1 | Mixed concerns |
| **SRS algorithm implementation** | `flashcard-*.ts` | ⚠️ | Need verification |

---

## 2. User Stories - Knowledge (DETAILED)

### Story KNOW-01: Knowledge Source Import & Indexing

```
As a user
I want to import knowledge from various sources (PDF, URL, text)
So that I can build a searchable knowledge base

Priority: P0
Estimation: 2 days (refactoring)

Acceptance Criteria:
- [ ] AC1: Import from PDF file
- [ ] AC2: Import from URL (webpage)
- [ ] AC3: Import from text/markdown
- [ ] AC4: Automatic chunking and indexing
- [ ] AC5: Import progress visible
- [ ] AC6: Duplicate detection

Technical Requirements:
- [ ] TR1: `SourceImportService` facade
- [ ] TR2: `PDFProcessor` with chunking
- [ ] TR3: `URLProcessor` with content extraction
- [ ] TR4: `TextProcessor` for plain content
- [ ] TR5: `DuplicateDetector` for source dedup

Import Pipeline:
```
Source (PDF/URL/Text)
     ↓
Content Extractor
     ↓
Text Normalizer
     ↓
Chunk Generator (semantic/recursive)
     ↓
Embedding Generator
     ↓
Index Storage (Orama + vector)
     ↓
Source Metadata Storage
```

Edge Cases:
- [ ] EC1: PDF with images only → OCR or error
- [ ] EC2: URL requires auth → Prompt or skip
- [ ] EC3: Large PDF (>50MB) → Chunk during import
- [ ] EC4: Duplicate content → Merge or ignore
- [ ] EC5: Import interrupted → Resume capability

Combined Uses:
- [ ] CU1: Upload PDF research paper → Indexed for search
- [ ] CU2: Import URL article → Chunked and indexed
- [ ] CU3: Paste lecture notes → Immediately searchable

Non-Functional Requirements:
- [ ] NFR1: PDF import < 30s for 10-page doc
- [ ] NFR2: URL import < 5s
- [ ] NFR3: Chunk quality (coherence score > 0.8)
- [ ] NFR4: Import survives page refresh

Tests Required:
- [ ] Unit: PDF text extraction
- [ ] Unit: Chunking algorithms
- [ ] Integration: Full import pipeline
- [ ] E2E: User imports and searches
```

### Story KNOW-02: RAG-Powered Search

```
As a user
I want to search my knowledge base with AI-powered relevance
So that I find relevant information quickly

Priority: P0
Estimation: 3 days (refactoring)

Acceptance Criteria:
- [ ] AC1: Full-text search across all sources
- [ ] AC2: Semantic search using embeddings
- [ ] AC3: Hybrid search (text + semantic)
- [ ] AC4: Source citations in results
- [ ] AC5: Filter by source/date/type
- [ ] AC6: Search within result context

Technical Requirements:
- [ ] TR1: `RagService` orchestrator
- [ ] TR2: `HybridRetriever` (text + semantic)
- [ ] TR3: `QueryProcessor` with expansion
- [ ] TR4: `ResultFormatter` with citations
- [ ] TR5: `SearchHistory` for suggestions

Search Pipeline:
```
User Query
     ↓
Query Processor (expand, rewrite)
     ↓
┌───────────┴───────────┐
Text Search       Embedding
(Orama)          (cloud/local)
     ↓               ↓
     └───────┬───────┘
             ↓
     Hybrid Fusion (RRF)
             ↓
     Result Formatter
             ↓
     Citations + Highlights
```

Edge Cases:
- [ ] EC1: No results → Suggest related topics
- [ ] EC2: Too many results → Pagination + relevance sort
- [ ] EC3: Low relevance results → Query refinement
- [ ] EC4: Index empty → Prompt to import
- [ ] EC5: Query too short → Query expansion

Combined Uses:
- [ ] CU1: Search "API authentication" → Find relevant docs
- [ ] CU2: Search with filters → Narrow results
- [ ] CU3: Click result → Jump to source context

Non-Functional Requirements:
- [ ] NFR1: Search < 500ms (up to 1000 chunks)
- [ ] NFR2: Relevance quality > 0.7
- [ ] NFR3: Index size < 2x original text
- [ ] NFR4: Works offline (local embedding)

Tests Required:
- [ ] Unit: Query processing
- [ ] Unit: Retrieval algorithms
- [ ] Integration: Full RAG pipeline
- [ ] E2E: User search workflow
```

### Story KNOW-03: Knowledge Collections & Synthesis

```
As a user
I want to organize sources into collections and synthesize summaries
So that I can build organized knowledge structures

Priority: P1
Estimation: 2 days (refactoring)

Acceptance Criteria:
- [ ] AC1: Create named collections
- [ ] AC2: Add/remove sources from collection
- [ ] AC3: Generate collection summary (AI)
- [ ] AC4: Export collection as document
- [ ] AC5: Share collection link
- [ ] AC6: Version history for collections

Technical Requirements:
- [ ] TR1: `CollectionService` for CRUD
- [ ] TR2: `CollectionMembershipSlice`
- [ ] TR3: `SynthesisService` for AI summaries
- [ ] TR4: `CollectionExportService`

Edge Cases:
- [ ] EC1: Collection empty → Prompt or skip
- [ ] EC2: Source already in collection → Prevent duplicate
- [ ] EC3: Synthesis fails → Fallback to list
- [ ] EC4: Too many sources (>100) → Pagination

Combined Uses:
- [ ] CU1: Create "Project Ideas" collection → Add sources
- [ ] CU2: Generate summary → AI synthesizes
- [ ] CU3: Export as markdown → Share with team

Non-Functional Requirements:
- [ ] NFR1: Collection load < 200ms
- [ ] NFR2: Synthesis < 10s
- [ ] NFR3: Export < 5s

Tests Required:
- [ ] Unit: Collection CRUD
- [ ] Unit: Synthesis API
- [ ] Integration: Collection + synthesis
- [ ] E2E: Full collection workflow
```

---

## 3. User Stories - Study (DETAILED)

### Story STUDY-01: Flashcard Management

```
As a user
I want to create and manage flashcards for learning
So that I can review material effectively

Priority: P0
Estimation: 1 day (verify)

Acceptance Criteria:
- [ ] AC1: Create flashcards (front/back)
- [ ] AC2: Organize into decks
- [ ] AC3: Add images to cards
- [ ] AC4: Tag cards for filtering
- [ ] AC5: Import/export decks
- [ ] AC6: Bulk create from notes

Technical Requirements:
- [ ] TR1: `FlashcardCrudSlice`
- [ ] TR2: `FlashcardFilterSlice`
- [ ] TR3: `FlashcardOperationsSlice`
- [ ] TR4: `FlashcardPersistenceSlice`

Edge Cases:
- [ ] EC1: Empty card → Validation error
- [ ] EC2: Duplicate card → Merge or warn
- [ ] EC3: Large deck (>1000 cards) → Virtualization
- [ ] EC4: Image too large → Compress or reject

Combined Uses:
- [ ] CU1: Create deck, add 20 cards
- [ ] CU2: Filter by tag → Study subset
- [ ] CU3: Export deck → Share with study group

Non-Functional Requirements:
- [ ] NFR1: CRUD < 100ms
- [ ] NFR2: Deck load < 200ms
- [ ] NFR3: Image storage < 10MB per deck

Tests Required:
- [ ] Unit: CRUD operations
- [ ] Integration: Filtering + CRUD
- [ ] E2E: Full flashcard workflow
```

### Story STUDY-02: Quiz Generation

```
As a user
I want to generate quizzes from my notes and collections
So that I can test my knowledge

Priority: P1
Estimation: 2 days

Acceptance Criteria:
- [ ] AC1: Generate quiz from selected sources
- [ ] AC2: Multiple choice questions
- [ ] AC3: Fill-in-blank questions
- [ ] AC4: Difficulty levels
- [ ] AC5: Quiz timer with auto-submit
- [ ] AC6: Score tracking

Technical Requirements:
- [ ] TR1: `QuizGeneratorService`
- [ ] TR2: `QuestionGenerator` interface
- [ ] TR3: `QuizSessionSlice`
- [ ] TR4: `QuizUISlice`

Quiz Generation:
```
Selected Sources
     ↓
Content Chunking
     ↓
Question Generator (AI)
     ↓
Question Types:
- Multiple Choice (4 options)
- True/False
- Fill-in-blank
- Short Answer
     ↓
Quiz Session
```

Edge Cases:
- [ ] EC1: Not enough content → Prompt more sources
- [ ] EC2: AI generates poor questions → Regenerate option
- [ ] EC3: Time expires → Auto-submit
- [ ] EC4: All questions answered → Immediate score

Combined Uses:
- [ ] CU1: Select 3 notes → Generate 10-question quiz
- [ ] CU2: Take quiz, see score, review answers
- [ ] CU3: Save quiz for later review

Non-Functional Requirements:
- [ ] NFR1: Quiz generation < 30s
- [ ] NFR2: Question quality score > 0.7
- [ ] NFR3: Timer accurate to second

Tests Required:
- [ ] Unit: Question generation
- [ ] Integration: Quiz session flow
- [ ] E2E: Full quiz workflow
```

### Story STUDY-03: Spaced Repetition System (SRS)

```
As a user
I want to review flashcards with spaced repetition
So that I remember information long-term

Priority: P1
Estimation: 2 days (verify + implement)

Acceptance Criteria:
- [ ] AC1: SM-2 or FSRS algorithm
- [ ] AC2: Daily review queue
- [ ] AC3: Ease factor adjustment
- [ ] AC4: Streak tracking
- [ ] AC5: Mastery levels
- [ ] AC6: Comprehensive statistics

Technical Requirements:
- [ ] TR1: `SRSEngine` with algorithm
- [ ] TR2: `ReviewScheduler` for daily queue
- [ ] TR3: `StreakTracker`
- [ ] TR4: `StatisticsService`

SRS Algorithm (SM-2 variant):
```
Input: card, quality (0-5)
Output: next_review_date, ease_factor, interval

Formula:
- quality >= 3: Correct, increase interval
- quality < 3: Incorrect, reset interval
- ease_factor: adjusted based on quality
```

Edge Cases:
- [ ] EC1: Missed review → Reschedule or penalty
- [ ] EC2: All cards mastered → New content needed
- [ ] EC3: Large queue (>100) → Prioritize
- [ ] EC4: Algorithm drift → Recalibration

Combined Uses:
- [ ] CU1: Daily review → 20 cards due
- [ ] CU2: Card rated "easy" → Interval increases
- [ ] CU3: 30-day streak → Achievement unlocked

Non-Functional Requirements:
- [ ] NFR1: Next card < 100ms
- [ ] NFR2: Algorithm accurate (Ebbinghaus)
- [ ] NFR3: Statistics compute < 500ms

Tests Required:
- [ ] Unit: SRS algorithm
- [ ] Unit: Scheduling logic
- [ ] Integration: Review flow
- [ ] E2E: Full SRS workflow

---

## 4. Knowledge/Study → Architecture Conflict Matrix

| Knowledge/Study Story | Architecture Issue | Conflict Severity | Fix Required |
|----------------------|-------------------|-------------------|--------------|
| KNOW-01 | Knowledge god module (46 files) | BLOCKING | Split into 6 subdirs |
| KNOW-01 | Separate knowledge DB | BLOCKING | Consolidate to ViaGent |
| KNOW-02 | RAG god module (30 files) | BLOCKING | Split into 5 subdirs |
| KNOW-03 | KnowledgePage god component | MEDIUM | Extract components |
| STUDY-01 | Flashcard store works (✅) | - | - |
| STUDY-02 | Quiz generation needs service | MEDIUM | Create QuizGeneratorService |
| STUDY-03 | SRS algorithm verification | LOW | Verify and document |

---

## 5. File Change Manifest - Knowledge/Study

### 5.1 Files to CREATE

| File | description | Lines | Story |
|------|---------|-------|-------|
| `lib/knowledge/synthesis/synthesis-service.ts` | Synthesis orchestration | 100 | KNOW-03 |
| `lib/knowledge/import/import-service.ts` | Import orchestration | 80 | KNOW-01 |
| `lib/knowledge/graph/graph-service.ts` | Knowledge graph | 80 | KNOW-03 |
| `lib/knowledge/pdf/pdf-processor.ts` | PDF import | 80 | KNOW-01 |
| `lib/knowledge/url/url-processor.ts` | URL import | 60 | KNOW-01 |
| `lib/rag/chunking/chunking-service.ts` | Chunking orchestration | 80 | KNOW-02 |
| `lib/rag/embedding/embedding-service.ts` | Embedding orchestration | 80 | KNOW-02 |
| `lib/rag/indexing/indexing-service.ts` | Indexing orchestration | 80 | KNOW-02 |
| `lib/rag/retrieval/retrieval-service.ts` | Retrieval orchestration | 100 | KNOW-02 |
| `lib/rag/query/query-service.ts` | Query orchestration | 80 | KNOW-02 |
| `lib/study/services/quiz-generator.ts` | Quiz generation | 120 | STUDY-02 |
| `lib/study/services/srs-engine.ts` | SRS algorithm | 100 | STUDY-03 |

### 5.2 Files to MODIFY

| File | Change | Lines | Story |
|------|--------|-------|-------|
| `KnowledgePage.tsx` | Extract components | -200 | KNOW-01, KNOW-02 |
| `KnowledgePage.tsx` | Remove knowledge services | -300 | KNOW-01, KNOW-02 |
| `knowledge-db.ts` | Migrate to ViaGent | +50 | KNOW-01 |
| `flashcard-db.ts` | Migrate to ViaGent | +50 | STUDY-01 |

### 5.3 Files to DELETE (After Verification)

| File | Reason | Story |
|------|--------|-------|
| `lib/knowledge/*` (old) | Replaced by subdirs | KNOW-01, KNOW-02 |
| `lib/rag/*` (old) | Replaced by subdirs | KNOW-02 |
| `knowledge-db.ts` | Consolidated | KNOW-01 |
| `flashcard-db.ts` | Consolidated | STUDY-01 |

---

## 6. Knowledge/Study Must-Pass Checklist

### Pre-Refactor Verification

- [ ] Knowledge module files listed
- [ ] RAG module files listed
- [ ] Flashcard store verified working
- [ ] Study store verified working

### During Refactor

- [ ] lib/knowledge/synthesis/ created (8 files)
- [ ] lib/knowledge/import/ created (6 files)
- [ ] lib/knowledge/graph/ created (5 files)
- [ ] lib/rag/chunking/ created (5 files)
- [ ] lib/rag/retrieval/ created (5 files)
- [ ] KnowledgePage refactored
- [ ] QuizGeneratorService created
- [ ] SRSEngine created/verified

### Post-Refactor Verification

- [ ] lib/knowledge/ has 6 subdirectories (<15 files each)
- [ ] lib/rag/ has 5 subdirectories (<15 files each)
- [ ] Single ViaGentDatabase
- [ ] All imports work
- [ ] No console errors
- [ ] TypeScript compiles

---

## 7. Dependencies & Risks

### Dependencies

| Dependency | Status | Impact |
|------------|--------|--------|
| Orama (search) | ✅ Ready | Core |
| PDF.js | ✅ Ready | PDF import |
| Dexie | ✅ Ready | Persistence |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Knowledge split breaks RAG** | Medium | High | Test each sub-module |
| **DB migration loses data** | Low | Critical | Backup before migration |
| **SRS algorithm incorrect** | Low | Medium | Validate against SM-2 |

---

*Back to [ARCH-INDEX.md](./ARCH-INDEX.md)*
*Next: [shard-03-08 - Cross-Workspace Features](./shard-03-08-cross-workspace.md)*
