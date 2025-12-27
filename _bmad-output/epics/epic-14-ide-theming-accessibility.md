# Epic 14: IDE Theming & Accessibility

**Goal:** Implement user-customizable theming with dark/light modes and comprehensive accessibility features for WCAG compliance.

**Priority:** P3  
**Status:** Backlog  
**Added By:** Course Correction v6 (2025-12-20) - Transformed from legacy Epic 12  
**Prerequisites:** Epic 8 (Core validation complete)

### Story 14-1: Implement Dark/Light Theme Toggle

As a **user**,  
I want **to switch between dark and light themes**,  
So that **I can work comfortably in different lighting conditions**.

**Story Points:** 2

**Acceptance Criteria:**

- **AC-14-1-1:** Toggle button in IDE header switches between dark/light themes
- **AC-14-1-2:** Theme preference persisted to IndexedDB
- **AC-14-1-3:** CSS variables updated via `.dark` class on root element
- **AC-14-1-4:** All shadcn/ui components respond to theme change
- **AC-14-1-5:** Monaco editor theme synced with IDE theme

---

### Story 14-2: Add High-Contrast Accessibility Theme

As a **user with visual impairment**,  
I want **a high-contrast theme option**,  
So that **I can distinguish UI elements clearly**.

**Story Points:** 3

**Acceptance Criteria:**

- **AC-14-2-1:** High-contrast theme defined with WCAG AAA color ratios (7:1)
- **AC-14-2-2:** Focus indicators have minimum 3px visible border
- **AC-14-2-3:** Theme selector includes "High Contrast" option
- **AC-14-2-4:** All interactive elements have visible focus states
- **AC-14-2-5:** Audit passes Lighthouse accessibility score ≥90

---

### Story 14-3: Implement Keyboard Navigation Map

As a **power user**,  
I want **comprehensive keyboard shortcuts**,  
So that **I can navigate the IDE without a mouse**.

**Story Points:** 3

**Acceptance Criteria:**

- **AC-14-3-1:** Cmd+K Cmd+S opens keyboard shortcuts panel
- **AC-14-3-2:** All major IDE actions have keyboard shortcuts
- **AC-14-3-3:** Shortcuts cheatsheet available in settings
- **AC-14-3-4:** Focus trap implemented for modal dialogs
- **AC-14-3-5:** Tab navigation follows logical order

---

### Story 14-4: Add Screen Reader Announcements

As a **user relying on screen reader**,  
I want **IDE actions announced via ARIA live regions**,  
So that **I know what's happening without seeing the screen**.

**Story Points:** 2

**Acceptance Criteria:**

- **AC-14-4-1:** Sync status changes announced via `aria-live="polite"`
- **AC-14-4-2:** File save confirmation announced
- **AC-14-4-3:** Terminal output key events announced
- **AC-14-4-4:** Error messages use `role="alert"`
- **AC-14-4-5:** Skip-to-content link available on page load

---

### Story 14-5: Implement Reduced Motion Mode

As a **user with motion sensitivity**,  
I want **animations to be disabled when I prefer reduced motion**,  
So that **the IDE doesn't cause discomfort**.

**Story Points:** 2

**Acceptance Criteria:**

- **AC-14-5-1:** `prefers-reduced-motion` media query respected
- **AC-14-5-2:** All CSS transitions disabled when preference is set
- **AC-14-5-3:** Loading spinners use static indicators instead
- **AC-14-5-4:** Panel resize animations simplified
- **AC-14-5-5:** Terminal cursor blink can be disabled

---
