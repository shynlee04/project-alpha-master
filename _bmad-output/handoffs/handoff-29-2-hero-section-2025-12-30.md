# Handback Document: Story 29-2 Hero Section Implementation

**Date:** 2025-12-30
**Time:** 15:00:00 UTC+7
**From Agent:** BMAD Master Orchestrator (@bmad-core-bmad-master)
**To Agent:** UX Designer (@bmad-bmm-ux-designer)
**Epic:** Epic 29 (About Me Redesign)
**Story:** Story 29-2 (Implement Hero Section)

---

## Context Summary

### Epic Overview
Epic 29 aims to redesign the existing About Me page component located at `@/src/components/about` to transform it into a strategic recruitment asset that impresses technical recruiters. The page must demonstrate engineering capabilities and align with Vietnam job market positioning.

### Career Context Reference
The redesign must align with career positioning outlined in `@/_bmad-output/career/vietnam-job-market-analysis-2025-12-30.md`, targeting:
- Senior technical positions in Vietnam market
- AI-first companies and enterprise technology companies
- International companies hiring remote Vietnamese talent

### Design Foundation Established
The Story Context & Validation document (`_bmad-output/sprint-artifacts/story-29-1-about-me-context-validation.md`) establishes:
- 7-section page architecture: Hero, Stats Bar, Journey, Skills Matrix, Project Showcase, Achievement Timeline, Contact
- 8-bit Gaming Style design system with MistralAI-inspired orange accents (#FF6B35)
- User journey mapping: 6-second scan (Hero + stats) → 30-second scan (skills overview) → 2-5 minute exploration → action phase

### Dependencies
- Story 29-1 (Context & Validation): COMPLETED
- Story 29-2 (Hero Section): IN PROGRESS ← Current Task
- Subsequent stories depend on Hero Section for layout foundation

---

## Task Specification

### Story 29-2: Implement Hero Section

**Story Points:** 5
**Priority:** P0 (Hero is first visual impression)

### Scope
Design and implement the Hero section of the About Me page with the following requirements:

**Content Requirements:**
1. **Identity Statement:** "Education Leader → AI Agent Architect" transformation narrative
2. **Name/Title:** Professional identity with senior technical positioning
3. **Tagline:** Compelling value proposition for recruiters
4. **Subtitle:** Brief professional summary (2-3 lines max)

**Visual Requirements:**
1. **Particle Background Effect:** Animated particles using the 8-bit gaming style
2. **Orange Accent (#FF6B35):** Strategic use for CTAs and key elements
3. **Dark Theme:** Consistent with overall system design language
4. **Typography:** Professional typography hierarchy (H1, H2, body)
5. **Spacing:** Generous whitespace for visual breathing room

**Interactive Requirements:**
1. **Scroll Indicator:** Subtle animation prompting continued exploration
2. **Quick CTA:** Primary action (e.g., "View Projects" or "Contact Me")
3. **Secondary CTA:** Secondary action (e.g., "Download Resume")
4. **Hover Effects:** Micro-interactions on CTAs

**Responsive Requirements:**
1. **Mobile (<768px):** Stacked layout, reduced font sizes, simplified particle effects
2. **Tablet (768-1024px):** Two-column layout option
3. **Desktop (1024-1440px):** Full-width hero with centered content
4. **Large Desktop (>1440px):** Maximum width constraints, optimal reading line length

### Acceptance Criteria

**Functional Acceptance Criteria:**
- [ ] Hero section renders correctly on all viewport sizes
- [ ] Particle background animation performs smoothly (60fps target)
- [ ] Scroll indicator appears on load and animates
- [ ] CTAs are clickable and navigate to appropriate sections
- [ ] No layout shift on page load (CLS < 0.1)
- [ ] LCP < 2.5 seconds

**Visual Acceptance Criteria:**
- [ ] 8-bit gaming aesthetic applied consistently
- [ ] Orange accent (#FF6B35) used appropriately for CTAs
- [ ] Dark theme matches system design tokens
- [ ] Typography hierarchy clear and professional
- [ ] Spacing consistent with design tokens
- [ ] Pixel-perfect implementation matching design specs

**Accessibility Acceptance Criteria:**
- [ ] Color contrast meets WCAG 2.1 AA standards (4.5:1 for text)
- [ ] Keyboard navigation supported (Tab, Enter)
- [ ] Focus states visible on all interactive elements
- [ ] Screen reader accessible (proper ARIA labels)
- [ ] Reduced motion preference respected

**Code Quality Acceptance Criteria:**
- [ ] Component follows existing patterns in codebase
- [ ] Design tokens used for all styling (no hardcoded values)
- [ ] i18n keys used for all text strings (support EN + VI)
- [ ] Props interface defined (not type aliases)
- [ ] Component exported in barrel file
- [ ] No console errors or warnings

### Constraints
1. **Design System:** Must use existing design tokens from `src/styles/design-tokens.css`
2. **Styling:** Tailwind CSS with design token integration
3. **Icons:** Use existing icon components from `src/components/ui/icons/`
4. **Animation:** CSS animations from `src/styles/animations.css` preferred over JS animations
5. **Internationalization:** All text via i18next (`t()` hook)
6. **Routing:** TanStack Router for navigation
7. **Testing:** Unit tests in adjacent `__tests__/` directory
8. **Code Review:** Required before merge

---

## Current Workflow Status

**Epic 29 Status:** IN_PROGRESS
**Story 29-1 Status:** DONE (Context & Validation)
**Story 29-2 Status:** IN_PROGRESS (Current Task)
**Story 29-3 Status:** PENDING (Stats Bar - depends on Hero layout)
**Story 29-4 Status:** PENDING (Journey Section - depends on Hero styling)
**Story 29-5 through 29-11:** PENDING

**Active Epics (from bmm-workflow-status.yaml):**
- Epic 13: DONE
- Epic 21: IN_PROGRESS
- Epic 22: IN_PROGRESS (Production Hardening)
- Epic 23: IN_PROGRESS (UX/UI Modernization)
- Epic 29: IN_PROGRESS (About Me Redesign) ← Current Focus

---

## References

### Design System Documentation
- Design Tokens: `src/styles/design-tokens.css` & `src/styles/design-tokens.ts`
- Animation System: `src/styles/animations.css`
- Component Standards: `AGENTS.md` section on "Component Structure"
- Icon Components: `src/components/ui/icons/`

### Technical Documentation
- TanStack Router: `@tanstack/react-router` documentation
- Tailwind CSS: `tailwindcss.com/docs`
- i18next: `i18next.com` documentation
- Accessibility: WCAG 2.1 AA standards

### Related Artifacts
- Story Context & Validation: `_bmad-output/sprint-artifacts/story-29-1-about-me-context-validation.md`
- Design Epic: `_bmad-output/epics/epic-29-about-me-redesign.md`
- Career Positioning: `_bmad-output/career/vietnam-job-market-analysis-2025-12-30.md`

### Codebase Patterns
- Component structure patterns: See existing components in `src/components/ide/`
- Design token usage: See `src/components/layout/IDELayout.tsx`
- i18n usage: See `src/i18n/en.json` and `src/i18n/vi.json`
- Testing patterns: See `src/components/ide/__tests__/`

---

## Next Agent Assignment

**Agent Mode:** @bmad-bmm-ux-designer

**Deliverable:** Detailed design specifications for Story 29-2 Hero Section including:
1. Visual design mockup (Figma or similar)
2. Component architecture specification
3. Props interface definition
4. CSS/Animation specifications
5. Accessibility considerations
6. Responsive breakpoint specifications

**Output Location:** `_bmad-output/sprint-artifacts/story-29-2-hero-section-design.md`

**After Design Completion:** Switch to @bmad-bmm-dev for implementation

---

## Quality Gates

1. **Design Review:** Design specs must be reviewed before implementation
2. **Pattern Compliance:** Must follow existing codebase patterns
3. **Token Usage:** All styling via design tokens
4. **i18n Readiness:** All strings prepared for internationalization
5. **Accessibility First:** WCAG 2.1 AA compliance verified

---

## Handoff Checklist

- [x] Context Summary provided
- [x] Task Specification with acceptance criteria
- [x] Current workflow status documented
- [x] References to design system and codebase patterns
- [x] Next agent assignment specified
- [x] Quality gates defined

**Handoff Complete:** 2025-12-30 15:00:00 UTC+7
