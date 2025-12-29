# Refinement Sprint: Knowledge Hub Polish
## Sprint: 2025-12-30
## Goal: Polish and integrate Epic 6 & 8 with theme consistency, i18n, and responsive design

---

## Sprint Context

**Triggered By:** BMAD Master validation sweep  
**Date:** 2025-12-30T04:30:06+07:00  
**Teams:** Team A (UI/UX) + Team B (Integration)  
**Duration:** 1-2 days intensive  

### Current State
- Epic 6 (Source Ingestion): Stories 6-1, 6-2 DONE, 6-3 IN_PROGRESS (Tasks 1-3 done, 4-7 pending)
- Epic 8 (Knowledge Canvas): ALL STORIES DONE (5/5)
- Test coverage: 126 tests passing across both epics

### Issues Identified
1. Missing i18n translations (`__STRING_NOT_TRANSLATED__` markers)
2. Responsive design needs phone/tablet polish
3. Theme: Dark theme only (light theme tokens exist but unused)
4. Story 6-3 incomplete (remaining tasks)
5. Canvas ↔ Source integration not fully wired

---

## Task List

### Track 1: UI/UX Polish (Team A)

#### P-1: Fix Untranslated Strings
**Priority:** P0 (Critical)  
**Estimated:** 1 hour  
**Files:**
- `src/i18n/en.json`
- `src/i18n/vi.json`

**Tasks:**
- [ ] Replace `__STRING_NOT_TRANSLATED__` with proper English strings
- [ ] Add Vietnamese translations for all missing strings
- [ ] Verify all `knowledge.*` and `canvas.*` keys are translated

**Strings to fix:**
```json
"errors.fs.notSupported.mobileHint": "This feature requires a desktop browser",
"errors.sync.retry.description": "Retry synchronization to restore your changes",
"time.agoSeconds_0": "< 1 second ago",
"time.agoMinutes_0": "< 1 minute ago", 
"time.agoHours_0": "< 1 hour ago"
```

---

#### P-2: Mobile Knowledge Page Polish
**Priority:** P1  
**Estimated:** 2 hours  
**File:** `src/components/knowledge/KnowledgePage.tsx`

**Tasks:**
- [ ] Improve mobile layout spacing (p-4 → responsive padding)
- [ ] Add swipe gesture hint for Canvas preview
- [ ] Improve empty state messaging on mobile
- [ ] Add proper section dividers with visual separation

---

#### P-3: Responsive SourceCard
**Priority:** P1  
**Estimated:** 2 hours  
**File:** `src/components/knowledge/SourceCard.tsx`

**Tasks:**
- [ ] Ensure 44px minimum touch targets on mobile
- [ ] Use responsive text sizing (text-sm on mobile, text-base on desktop)
- [ ] Collapse action buttons into context menu on phone
- [ ] Add proper truncation with TruncatedText component

---

#### P-4: Dark Theme Audit
**Priority:** P0  
**Estimated:** 1 hour  
**Scope:** All knowledge/* and canvas/* components

**Tasks:**
- [ ] Audit all components for hardcoded colors
- [ ] Ensure all colors use CSS variables (--background, --foreground, etc.)
- [ ] Verify no components assume `.light` class
- [ ] Test all components render correctly in dark theme

---

#### P-5: Canvas Mobile UX
**Priority:** P1  
**Estimated:** 1.5 hours  
**File:** `src/components/canvas/Canvas.tsx`

**Tasks:**
- [ ] Improve ReadOnlyOverlay with better visual design
- [ ] Add touch gesture support for pan/zoom (pinch-to-zoom)
- [ ] Improve empty state with call-to-action for desktop
- [ ] Add loading skeleton while canvas initializes

---

### Track 2: Integration & Wiring (Team B)

#### I-1: Complete Story 6-3
**Priority:** P0 (Critical)  
**Estimated:** 4 hours  
**File:** `src/components/knowledge/SourceCard.tsx`, `src/lib/state/source-store.ts`

**Tasks (from Story 6-3):**
- [ ] Task 4: Rename source functionality
- [ ] Task 5: Collections support (move/add to collection)
- [ ] Task 6: Export source functionality
- [ ] Task 7: Integration tests

---

#### I-2: Canvas ↔ Source Integration
**Priority:** P1  
**Estimated:** 2 hours  
**Files:** 
- `src/hooks/useCanvasDrop.ts`
- `src/components/canvas/nodes/SourceNode.tsx`

**Tasks:**
- [ ] Verify drag data format from SourceCard matches Canvas expectations
- [ ] Add visual feedback during drag (ghost preview)
- [ ] Handle edge cases (duplicate source on canvas)
- [ ] Emit event on successful source drop

---

#### I-3: Synthesis Panel Placeholder
**Priority:** P2  
**Estimated:** 1 hour  
**File:** `src/components/knowledge/KnowledgePage.tsx`

**Tasks:**
- [ ] Improve placeholder visual design
- [ ] Add "Coming Soon" badge with Epic 9 reference
- [ ] Add feature teaser with bullet points
- [ ] Make animation more subtle (reduce pulse opacity)

---

#### I-4: Panel Persistence
**Priority:** P1  
**Estimated:** 1.5 hours  
**Files:**
- `src/components/knowledge/KnowledgePage.tsx`
- `src/lib/state/ide-store.ts`

**Tasks:**
- [ ] Store ResizablePanel sizes in Zustand
- [ ] Persist sizes to Dexie via middleware
- [ ] Restore sizes on component mount
- [ ] Handle first-visit default sizes

---

#### I-5: Integration Tests
**Priority:** P1  
**Estimated:** 2 hours  
**File:** `src/components/knowledge/__tests__/KnowledgePage.test.tsx`

**Tasks:**
- [ ] Test 3-column layout renders on desktop
- [ ] Test mobile layout renders correctly
- [ ] Test source card grid integration
- [ ] Test canvas renders in correct panel
- [ ] Test responsive breakpoint transitions

---

### Track 3: Validation & Mapping (Both Teams)

#### V-1: i18n String Audit
**Priority:** P0  
**Estimated:** 1 hour

**Tasks:**
- [ ] Run grep for `__STRING_NOT_TRANSLATED__`
- [ ] Verify all `t('...')` calls have matching keys
- [ ] Check for hardcoded strings in JSX
- [ ] Generate missing key report

---

#### V-2: FR Coverage Mapping
**Priority:** P1  
**Estimated:** 0.5 hours  
**File:** `_bmad-output/epics.md`

**Tasks:**
- [ ] Update Epic 6 FR-EDU-01 coverage status
- [ ] Mark remaining acceptance criteria
- [ ] Update story completion percentages

---

#### V-3: Visual Regression Testing
**Priority:** P1  
**Estimated:** 1 hour

**Viewports to test:**
- [ ] Phone: 375x667 (iPhone SE)
- [ ] Phone: 390x844 (iPhone 14)
- [ ] Tablet: 768x1024 (iPad)
- [ ] Desktop: 1920x1080

**Components to verify:**
- [ ] KnowledgePage full layout
- [ ] SourceCard in all states
- [ ] Canvas with nodes
- [ ] Canvas empty state

---

#### V-4: Accessibility Audit
**Priority:** P1  
**Estimated:** 1.5 hours

**Tasks:**
- [ ] Verify ARIA labels on all interactive elements
- [ ] Test keyboard navigation through SourceCards
- [ ] Test keyboard navigation on Canvas
- [ ] Verify focus indicators are visible
- [ ] Check color contrast ratios (4.5:1 minimum)

---

## Definition of Done

### Sprint Complete When:
1. [ ] Zero `__STRING_NOT_TRANSLATED__` markers in i18n files
2. [ ] All Knowledge Hub components render correctly in dark theme
3. [ ] Mobile viewport shows polished single-column layout
4. [ ] Desktop viewport shows full 3-column resizable layout  
5. [ ] Story 6-3 all tasks complete (including 4-7)
6. [ ] Canvas accepts source drops and creates SourceNode
7. [ ] Panel sizes persist between sessions
8. [ ] All new code has corresponding integration tests
9. [ ] Visual regression verified on 4 viewport sizes
10. [ ] Accessibility audit passes with no P0/P1 issues

---

## Status Tracking

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| P-1 | Team A | TODO | |
| P-2 | Team A | TODO | |
| P-3 | Team A | TODO | |
| P-4 | Team A | TODO | |
| P-5 | Team A | TODO | |
| I-1 | Team B | TODO | |
| I-2 | Team B | TODO | |
| I-3 | Team B | TODO | |
| I-4 | Team B | TODO | |
| I-5 | Team B | TODO | |
| V-1 | Both | TODO | |
| V-2 | Both | TODO | |
| V-3 | Both | TODO | |
| V-4 | Both | TODO | |

---

## Handoff Artifacts

Upon sprint completion, update:
1. `bmm-workflow-status.yaml` - Epic 6 status → DONE
2. `sprint-status.yaml` - Story 6-3 → done, refinement sprint complete
3. `_bmad-output/epic-retrospectives/epic-6-retrospective-2025-12-30.md` - Create retrospective
