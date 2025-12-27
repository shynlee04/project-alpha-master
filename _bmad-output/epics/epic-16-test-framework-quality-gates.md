# Epic 16: Test Framework & Quality Gates

**Goal:** Establish comprehensive testing infrastructure with unit, integration, and E2E coverage.

**Priority:** P2  
**Status:** Backlog  
**Added By:** Course Correction v6 (2025-12-20) - Transformed from legacy Epic 14  
**Prerequisites:** Epic 5 (Persistence testable)

### Story 16-1: Formalize Vitest Unit Test Patterns

As a **developer**,  
I want **consistent unit test patterns established**,  
So that **tests are maintainable and reliable**.

**Story Points:** 2

**Acceptance Criteria:**

- **AC-16-1-1:** `vitest.config.ts` configured with coverage thresholds
- **AC-16-1-2:** Test file naming convention: `*.test.ts` next to source
- **AC-16-1-3:** Mock patterns documented for IndexedDB, FSA, WebContainer
- **AC-16-1-4:** 80% line coverage minimum for new code
- **AC-16-1-5:** Tests run in <30s locally

---

### Story 16-2: Create LocalFSAdapter Mock

As a **developer**,  
I want **a mock for LocalFSAdapter**,  
So that **sync tests don't require real FSA access**.

**Story Points:** 3

**Acceptance Criteria:**

- **AC-16-2-1:** `createMockFSAdapter()` factory function
- **AC-16-2-2:** Mock supports read, write, list, delete operations
- **AC-16-2-3:** In-memory file tree for test isolation
- **AC-16-2-4:** Permission state simulation (granted/denied/prompt)
- **AC-16-2-5:** Integration tests using mock achieve 90% coverage

---

### Story 16-3: Implement Playwright E2E for Validation Sequence

As a **developer**,  
I want **automated E2E tests for the 14-step validation**,  
So that **regressions are caught before merge**.

**Story Points:** 5

**Acceptance Criteria:**

- **AC-16-3-1:** Playwright configured for Chrome-only (WebContainers requirement)
- **AC-16-3-2:** Tests cover steps 1-6 (Dashboard → Terminal)
- **AC-16-3-3:** WebContainer boot simulated with fixture
- **AC-16-3-4:** Tests run in CI with 5-minute timeout
- **AC-16-3-5:** Video recordings saved for failed tests

---

### Story 16-4: Create WebContainer Boot Benchmark

As a **developer**,  
I want **boot time tracked across releases**,  
So that **performance regressions are detected early**.

**Story Points:** 2

**Acceptance Criteria:**

- **AC-16-4-1:** Benchmark script measures boot to shell-ready time
- **AC-16-4-2:** Results stored in JSON for trend analysis
- **AC-16-4-3:** CI job fails if boot time exceeds 8s baseline
- **AC-16-4-4:** Benchmark runs on synthetic project (50 files)
- **AC-16-4-5:** Results graphed in PR comments

---

### Story 16-5: Add Lighthouse CI for Accessibility

As a **developer**,  
I want **automated accessibility audits**,  
So that **WCAG compliance is verified continuously**.

**Story Points:** 2

**Acceptance Criteria:**

- **AC-16-5-1:** Lighthouse CI configured for dashboard and workspace routes
- **AC-16-5-2:** Accessibility score threshold: 90
- **AC-16-5-3:** CI fails on score drops >5 points
- **AC-16-5-4:** Report artifacts uploaded for review
- **AC-16-5-5:** Specific issues linked to fix recommendations

---
