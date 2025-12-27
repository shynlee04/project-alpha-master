# Epic 15: Performance & Optimization

**Goal:** Optimize bundle size, memory usage, and load times for a responsive IDE experience.

**Priority:** P3  
**Status:** Backlog  
**Added By:** Course Correction v6 (2025-12-20) - Transformed from legacy Epic 13  
**Prerequisites:** Epic 8 (Baseline performance established)

### Story 15-1: Lazy Load Monaco Editor

As a **user**,  
I want **the IDE to load quickly on initial page**,  
So that **I can start working immediately**.

**Story Points:** 3

**Acceptance Criteria:**

- **AC-15-1-1:** Monaco loaded via dynamic import on workspace route
- **AC-15-1-2:** Initial bundle reduced by ≥1.5MB
- **AC-15-1-3:** Loading indicator shown while Monaco initializes
- **AC-15-1-4:** Editor fully functional within 2s of route navigation
- **AC-15-1-5:** Prefetch hint added for faster subsequent loads

---

### Story 15-2: Implement Virtual Scrolling for File Tree

As a **user with large projects**,  
I want **the file tree to handle 10,000+ files smoothly**,  
So that **navigation doesn't freeze the browser**.

**Story Points:** 3

**Acceptance Criteria:**

- **AC-15-2-1:** Virtual list renders only visible tree nodes
- **AC-15-2-2:** Scroll performance maintains 60fps
- **AC-15-2-3:** Expand/collapse operations complete in <100ms
- **AC-15-2-4:** Search/filter works with virtual list
- **AC-15-2-5:** Memory usage stays below 100MB for 10k files

---

### Story 15-3: Add Service Worker for Asset Caching

As a **user**,  
I want **static assets cached locally**,  
So that **subsequent loads are instant**.

**Story Points:** 2

**Acceptance Criteria:**

- **AC-15-3-1:** Service worker registered in production build
- **AC-15-3-2:** JS/CSS bundles cached on first load
- **AC-15-3-3:** Cache invalidation on new version deployment
- **AC-15-3-4:** Offline fallback page shown when disconnected
- **AC-15-3-5:** WebContainer API excluded from caching

---

### Story 15-4: Implement Performance Metrics Dashboard

As a **developer**,  
I want **to monitor IDE performance in dev tools**,  
So that **I can identify and fix bottlenecks**.

**Story Points:** 2

**Acceptance Criteria:**

- **AC-15-4-1:** Performance panel in IDE settings (dev mode only)
- **AC-15-4-2:** Tracks: boot time, sync time, TTFT, FCP, LCP
- **AC-15-4-3:** Memory usage graph shows heap size over time
- **AC-15-4-4:** Export performance report as JSON
- **AC-15-4-5:** Warn when metrics exceed thresholds

---

### Story 15-5: WebContainer Memory Management

As a **user with long sessions**,  
I want **memory leaks prevented**,  
So that **the IDE stays responsive over hours of use**.

**Story Points:** 3

**Acceptance Criteria:**

- **AC-15-5-1:** File watchers cleaned up on project close
- **AC-15-5-2:** Terminal processes terminated on navigation
- **AC-15-5-3:** Monaco editor instances disposed correctly
- **AC-15-5-4:** Event bus listeners removed on unmount
- **AC-15-5-5:** Memory stable after 8-hour session simulation

---
