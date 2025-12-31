# **CRITICAL ARCHITECTURAL VIOLATION: God Class Epidemic**
**Date:** 2025-12-31T13:00:00+07:00
**Trigger:** Aggressive file size validation per stop hook directive
**Finding:** 101 files exceed 300-line limit (user requirement: MAX 300 lines)

---

## **Executive Summary**

**User Directive:**
> "File Size Limit: Maximum 300 lines per file; split immediately if exceeded"
> "Function Boundaries: Split files containing more than 3 functions or exhibiting 'God Class' behavior"

**Actual Reality:**
- **101 files** exceed 300-line limit
- **Worst offender:** 1,065 lines (AgentConfigDialog.tsx) - **3.5x the limit**
- **Total violation:** ~40,000 lines across 101 files need refactoring

**Conclusion:** **Systemic architectural failure** - entire codebase violates file size requirements.

---

## **Top 20 Violators (Worst Offenders)**

| Rank | File | Lines | Violation | Multiple of Limit |
|------|------|-------|-----------|-------------------|
| 1 | AgentConfigDialog.tsx | 1,065 | +765 lines | **3.55x** |
| 2 | dexie-db.ts | 1,038 | +738 lines | **3.46x** |
| 3 | knowledge-store.test.ts | 1,025 | +725 lines | **3.42x** |
| 4 | rag-store.ts | 810 | +510 lines | **2.70x** |
| 5 | AgentChatPanel.tsx | 767 | +467 lines | **2.56x** |
| 6 | session-snapshot.test.ts | 678 | +378 lines | **2.26x** |
| 7 | sync-transaction-log.ts | 678 | +378 lines | **2.26x** |
| 8 | retry-queue.test.ts | 672 | +372 lines | **2.24x** |
| 9 | sync-manager.ts | 667 | +367 lines | **2.22x** |
| 10 | prompt-composer.ts | 635 | +335 lines | **2.12x** |
| 11 | quiz-store.ts | 629 | +329 lines | **2.10x** |
| 12 | conversation-store.ts | 626 | +326 lines | **2.09x** |
| 13 | chunk-strategies.ts | 626 | +326 lines | **2.09x** |
| 14 | chat.test.ts | 623 | +323 lines | **2.08x** |
| 15 | IDELayout.tsx | 604 | +304 lines | **2.01x** |
| 16 | knowledge-store.ts | 598 | +298 lines | **1.99x** |
| 17 | credential-vault.test.ts | 580 | +280 lines | **1.93x** |
| 18 | file-tools-impl.ts | 578 | +278 lines | **1.93x** |
| 19 | error-classification.ts | 563 | +263 lines | **1.88x** |
| 20 | credential-vault.ts | 562 | +262 lines | **1.87x** |

**Note:** This is only the top 20. **81 more files** violate the limit.

---

## **Categorization of Violations**

### **1. God Classes (Top Tier - >500 lines)**
**Count:** 18 files

**Impact:** These are massive architectural violations that break single responsibility principle.

**Examples:**
- `AgentConfigDialog.tsx` (1,065 lines) - Should be 4 separate components
- `dexie-db.ts` (1,038 lines) - Should split by domain (sources, chunks, flashcards, etc.)
- `rag-store.ts` (810 lines) - Should split indexing, retrieval, chunking
- `knowledge-store.ts` (598 lines) - Should split sources, metadata, collections
- `quiz-store.ts` (629 lines) - Should split quizzes, sessions, generators

**Refactoring Required:**
- Extract sub-components
- Split by domain/functionality
- Create barrel exports
- Update all imports

### **2. Large State Stores (400-500 lines)**
**Count:** ~25 files

**Impact:** Zustand stores with too many responsibilities.

**Examples:**
- `conversation-store.ts` (626 lines)
- `canvas-store.ts` (540 lines)
- `flashcard-store.ts` (516 lines)
- `ide-store.ts` (339 lines)

**Refactoring Required:**
- Split actions/selectors into separate files
- Use composition pattern
- Extract related state to sub-stores

### **3. Complex UI Components (400-500 lines)**
**Count:** ~15 files

**Impact:** Monolithic components hard to maintain.

**Examples:**
- `AgentChatPanel.tsx` (767 lines)
- `IDELayout.tsx` (604 lines)
- `ChatConversation.tsx` (516 lines)
- `MainSidebar.tsx` (402 lines)

**Refactoring Required:**
- Extract sub-components
- Use compound component pattern
- Split by feature/responsibility

### **4. Infrastructure/Utility Files (300-400 lines)**
**Count:** ~43 files

**Impact:** Helper functions and utilities growing organically without boundaries.

**Examples:**
- `sync-manager.ts` (667 lines)
- `sync-transaction-log.ts` (678 lines)
- `embedding-service.ts` (482 lines)
- `error-handling.ts` (454 lines)

**Refactoring Required:**
- Split by concern
- Create focused modules
- Extract constants/types

---

## **Code Smells Detected**

### **1. God Class Anti-Pattern**
- **Symptom:** Files >500 lines with multiple responsibilities
- **Impact:** Hard to test, hard to maintain, high coupling
- **Fix:** Extract classes, split by responsibility

### **2. Mixed Responsibilities**
- **Symptom:** Files doing >3 distinct things
- **Example:** `dexie-db.ts` defines ALL tables, schemas, migrations
- **Fix:** Split by domain (knowledge-db.ts, rag-db.ts, study-db.ts)

### **3. Feature Envy**
- **Symptom:** Components accessing stores directly
- **Example:** UI components calling 5+ different stores
- **Fix:** Create custom hooks that aggregate concerns

### **4. Shotgun Surgery**
- **Symptom:** Simple changes require editing 10+ files
- **Example:** Adding a source field touches parser, store, UI, types
- **Fix:** Better abstraction layers, reduce coupling

---

## **Technical Debt**

### **Debt Level: CRITICAL**

**Estimated Refactoring Effort:**
- 101 files to split
- Average split: 1 file → 3-4 files
- **New file count:** ~350-400 files
- **Lines to move:** ~40,000 lines
- **Imports to update:** ~2,000+ imports

**Risk Assessment:**
- **HIGH:** Breaking changes during refactoring
- **HIGH:** Merge conflicts if parallel development continues
- **MEDIUM:** Test updates required
- **LOW:** Performance impact (should improve)

### **Priority Order**

**P0 (Immediate - Week 1):**
1. `AgentConfigDialog.tsx` (1,065 lines) - Blocks agent configuration UX
2. `dexie-db.ts` (1,038 lines) - Core database, touches everything
3. `rag-store.ts` (810 lines) - RAG infrastructure, critical for knowledge features

**P1 (Week 2):**
4. Top 10-20 violators (400-600 lines)

**P2 (Week 3+):**
5. Remaining 81 files (300-400 lines)

---

## **Refactoring Strategy**

### **Phase 1: Database Layer (P0)**
**File:** `dexie-db.ts` (1,038 lines)

**Split into:**
- `dexie-db-schema.ts` - Table definitions
- `dexie-db-migrations/` - Migration files (already exists)
- `dexie-db-queries/` - Query utilities by domain
  - `sources-queries.ts`
  - `chunks-queries.ts`
  - `flashcards-queries.ts`
  - `quizzes-queries.ts`
  - `conversations-queries.ts`

### **Phase 2: State Stores (P0-P1)**
**Files:** All `*-store.ts` files >400 lines

**Split Pattern:**
```
store/
├── [domain]-store.ts (main store, <300 lines)
├── actions/
│   ├── [action-category].ts
│   └── ...
├── selectors/
│   ├── [selector-category].ts
│   └── ...
└── types/
    └── [domain]-types.ts
```

### **Phase 3: UI Components (P1-P2)**
**Files:** All component files >300 lines

**Split Pattern:**
```
components/
├── [Component].tsx (main, <300 lines)
├── [Component]/
│   ├── [SubComponent1].tsx
│   ├── [SubComponent2].tsx
│   └── index.ts
└── hooks/
    └── use[Component].ts
```

### **Phase 4: Infrastructure (P2)**
**Files:** `sync-manager.ts`, `embedding-service.ts`, etc.

**Split Pattern:**
- Extract distinct responsibilities to separate modules
- Create focused utility files
- Use composition to wire together

---

## **Next Actions**

1. **STOP:** Do not add new features until file sizes are under control
2. **PLAN:** Create refactoring schedule for all 101 files
3. **EXECUTE:** Start with P0 files (AgentConfigDialog, dexie-db, rag-store)
4. **VALIDATE:** Ensure refactoring doesn't break tests
5. **UPDATE:** Governance docs to reflect refactoring progress

---

## **User Directive Reminder**

> "File Size Limit: Maximum 300 lines per file; split immediately if exceeded"
> "Function Boundaries: Split files containing more than 3 functions or exhibiting 'God Class' behavior"
> "Refactoring Protocol: Refactoring must not break the system; update all imports and exports globally across related components"

**Current Status:** **FAILED** - 101 files violate requirements
**Target:** **ZERO** files exceeding 300 lines
**Gap:** 101 files to refactor

---

**Validated By:** BMAD Master (aggressive validation per stop hook)
**Ralph Loop Iteration:** 178
**Severity:** CRITICAL - Blocks production readiness
