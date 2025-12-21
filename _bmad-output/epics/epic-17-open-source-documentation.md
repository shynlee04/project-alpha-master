# Epic 17: Open-Source Documentation

**Goal:** Create comprehensive documentation for contributors and users of this open-source IDE.

**Priority:** P3  
**Status:** Backlog  
**Added By:** Course Correction v6 (2025-12-20) - Transformed from legacy Epic 15  
**Prerequisites:** Epic 8 (Stable API surface)

### Story 17-1: Create CONTRIBUTING.md

As a **potential contributor**,  
I want **clear contribution guidelines**,  
So that **I can submit quality PRs quickly**.

**Story Points:** 2

**Acceptance Criteria:**

- **AC-17-1-1:** CONTRIBUTING.md in repo root
- **AC-17-1-2:** Development setup instructions (pnpm install, dev server)
- **AC-17-1-3:** Code style guidelines (Prettier, ESLint config)
- **AC-17-1-4:** PR template with checklist
- **AC-17-1-5:** Issue templates for bugs and features

---

### Story 17-2: Generate TSDoc API Documentation

As a **developer extending the IDE**,  
I want **API reference documentation**,  
So that **I understand the public interfaces**.

**Story Points:** 3

**Acceptance Criteria:**

- **AC-17-2-1:** Typedoc configured for `src/lib/` exports
- **AC-17-2-2:** Generated docs hosted on GitHub Pages
- **AC-17-2-3:** Navigation includes modules for filesystem, webcontainer, workspace
- **AC-17-2-4:** Code examples included in TSDoc comments
- **AC-17-2-5:** Docs regenerated on main branch CI

---

### Story 17-3: Create Architecture Diagram in README

As a **new contributor**,  
I want **a visual architecture overview**,  
So that **I understand the codebase structure quickly**.

**Story Points:** 2

**Acceptance Criteria:**

- **AC-17-3-1:** Mermaid diagram in README.md
- **AC-17-3-2:** Shows: Routes → Components → Contexts → Lib
- **AC-17-3-3:** Data flow from FSA → Sync → WebContainer illustrated
- **AC-17-3-4:** Key dependencies labeled
- **AC-17-3-5:** Links to detailed architecture docs

---

### Story 17-4: Add Storybook for UI Components

As a **frontend developer**,  
I want **a component playground**,  
So that **I can develop UI in isolation**.

**Story Points:** 3

**Acceptance Criteria:**

- **AC-17-4-1:** Storybook configured with Vite builder
- **AC-17-4-2:** Stories for: Button, Panel, FileTree, SyncIndicator
- **AC-17-4-3:** Controls panel for interactive prop testing
- **AC-17-4-4:** Accessibility addon installed and passing
- **AC-17-4-5:** Storybook published to Chromatic or Vercel

---

### Story 17-5: Create Interactive Tutorial

As a **first-time user**,  
I want **an in-app tutorial**,  
So that **I learn the IDE features in 5 minutes**.

**Story Points:** 3

**Acceptance Criteria:**

- **AC-17-5-1:** Tutorial modal on first visit (dismissible)
- **AC-17-5-2:** Steps: Open folder → Edit file → Run command → View preview
- **AC-17-5-3:** Highlight elements with spotlight effect
- **AC-17-5-4:** Progress indicator (step X of 4)
- **AC-17-5-5:** Tutorial re-accessible from Help menu

---
