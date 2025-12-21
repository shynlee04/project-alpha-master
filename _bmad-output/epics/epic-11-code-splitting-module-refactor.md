# Epic 11: Code Splitting & Module Refactor

**Goal:** Reduce file complexity to meet quality standards (≤250 lines, focused responsibilities).

**Prerequisites:** Epic 10 complete (event bus needed for some refactors)  
**Status:** PROPOSED (Course Correction v3)  
**Priority:** P2

### Story 11.1: Extract PathGuard Module

As a **developer**,
I want **path validation logic extracted from local-fs-adapter**,
So that **validation is reusable and testable independently**.

**Acceptance Criteria:**

- **AC-11-1-1:** `path-guard.ts` module with `validatePath()`, `isTraversalAttempt()`
- **AC-11-1-2:** All path validation in local-fs-adapter uses PathGuard
- **AC-11-1-3:** PathGuard has dedicated unit tests
- **AC-11-1-4:** Module ≤100 lines

---

### Story 11.2: Extract DirectoryWalker Module

As a **developer**,
I want **directory traversal logic extracted from local-fs-adapter**,
So that **walking directories is a focused, testable module**.

**Acceptance Criteria:**

- **AC-11-2-1:** `directory-walker.ts` with `walkDirectory()`, `walkDirectorySegments()`
- **AC-11-2-2:** Async iterator pattern for memory efficiency
- **AC-11-2-3:** DirectoryWalker used by local-fs-adapter and SyncManager
- **AC-11-2-4:** Module ≤150 lines

---

### Story 11.3: Extract SyncPlanner Module

As a **developer**,
I want **sync planning logic separated from execution**,
So that **planning is a pure, testable function**.

**Acceptance Criteria:**

- **AC-11-3-1:** `sync-planner.ts` with `planSync()` returning SyncPlan
- **AC-11-3-2:** SyncPlan includes files to add, modify, delete
- **AC-11-3-3:** No side effects in planner (pure function)
- **AC-11-3-4:** Module ≤150 lines

---

### Story 11.4: Extract SyncExecutor Module

As a **developer**,
I want **sync execution logic separated from planning**,
So that **execution handles side effects with clear boundaries**.

**Acceptance Criteria:**

- **AC-11-4-1:** `sync-executor.ts` with `executeSyncPlan()`
- **AC-11-4-2:** Executor emits events via event bus
- **AC-11-4-3:** Executor handles WebContainer mount/write operations
- **AC-11-4-4:** Module ≤200 lines

---

### Story 11.5: Create LayoutShell Component

As a **developer**,
I want **a thin layout shell extracted from IDELayout**,
So that **layout concerns are separate from workspace orchestration**.

**Acceptance Criteria:**

- **AC-11-5-1:** `LayoutShell.tsx` handles only panel structure and resizing
- **AC-11-5-2:** Receives children components as props
- **AC-11-5-3:** No workspace state or side effects
- **AC-11-5-4:** IDELayout becomes thin orchestrator using LayoutShell
- **AC-11-5-5:** LayoutShell ≤150 lines

---

### Story 11.6: Extract useXTerminal Hook

As a **developer**,
I want **terminal lifecycle logic in a custom hook**,
So that **XTerminal component is purely presentational**.

**Acceptance Criteria:**

- **AC-11-6-1:** `useXTerminal()` hook manages terminal instance lifecycle
- **AC-11-6-2:** Hook handles resize, cleanup, boot coordination
- **AC-11-6-3:** XTerminal.tsx becomes thin view component
- **AC-11-6-4:** Hook ≤100 lines, component ≤80 lines

---

### Story 11.7: Extract FileTreeDataSource

As a **developer**,
I want **file tree data fetching separated from UI**,
So that **data source is testable and reusable**.

**Acceptance Criteria:**

- **AC-11-7-1:** `FileTreeDataSource.ts` handles LocalFSAdapter interaction
- **AC-11-7-2:** Returns normalized TreeNode[] for rendering
- **AC-11-7-3:** `useFileTreeData()` hook wraps data source with React state
- **AC-11-7-4:** FileTree.tsx becomes pure view component
- **AC-11-7-5:** Data source ≤150 lines

---
