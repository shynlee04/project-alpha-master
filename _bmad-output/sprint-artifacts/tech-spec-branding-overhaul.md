# Tech-Spec: Branding & UI Overhaul (Via-gent)

**Created:** 2025-12-20
**Status:** Ready for Review

## Overview

### Problem Statement
The current application retains branding from the template ("TanStack Start Starter") and lacks a distinct identity. It needs to be rebranded as **Via-gent**, an open-source AI-integrated IDE. The home page is functional but lacks an engaging introduction or onboarding for new users.

### Solution
1. **Rebrand**: Rename references to "Via-gent". Create a new logo and slogan.
2. **De-brand Dependencies**: Remove/Hide TanStack logos and DevTools from production view.
3. **Onboarding**: Create an interactive "Pitch/Onboarding" experience on the Dashboard to introduce the project, its mission, and the author (Linh Nguyen).
4. **Localization**: Ensure all new content is bilingual (En/Vi).

### Scope (In)
- App Title and Meta tags.
- Header Logo and Text.
- Dashboard Page (`index.tsx`).
- New Onboarding Components.
- I18n translation files.
- `logo.svg` replacement.

### Scope (Out)
- Deep functional changes to the IDE core (Focus is branding/frontend).
- Server-side infrastructure changes.

## Context for Development

### Codebase Patterns
- **Routing**: File-based routing in `src/routes`.
- **I18n**: `react-i18next` with JSON files in `src/i18n`.
- **Styling**: Tailwind CSS + Lucide Icons.
- **Images**: `public/` or `src/` for logos.

### Files to Reference
- `src/routes/__root.tsx` (Global head, title)
- `src/routes/index.tsx` (Dashboard/Home)
- `src/components/Header.tsx` (Navigation/Logo)
- `src/i18n/en.json` & `vi.json`

## Implementation Plan

### Tasks

- [x] **Task 1: Generate Assets**
    - Generate `logo.svg` or `logo.png` for "Via-gent".
    - Slogan: "Your Intelligent Local Dev Environment" (or similar).

- [x] **Task 2: Global Rebranding**
    - Update `<title>` in `src/routes/__root.tsx`.
    - Update Header logo/text in `src/components/Header.tsx`.
    - Remove TanStack DevTools (or ensure dev-only).

- [x] **Task 3: Localization Prep**
    - Add keys for Onboarding/Pitch to `src/i18n/en.json` and `vi.json`.
    - Include contact info keys.

- [x] **Task 4: Interactive Onboarding Component**
    - Create `src/components/dashboard/Onboarding.tsx`.
    - Features:
        - Nested/Stacked cards or interactive board.
        - "About Via-gent" section.
        - "Contact: Linh Nguyen" section.
        - Project links (Github).
    - Styling: Glassmorphism/Premium/Dark mode aesthetic.

- [x] **Task 5: Dashboard Integration**
    - Modify `src/routes/index.tsx` to include `Onboarding` component (conditionally show or always present above projects).

## Acceptance Criteria

- [ ] App title says "Via-gent".
- [ ] Header shows Via-gent logo/text.
- [ ] No visible TanStack branding in UI.
- [ ] Dashboard displays an interactive introduction/pitch.
- [ ] English and Vietnamese translations work for new content.
- [ ] Contact info (Linh Nguyen, Github, Phone) is visible and accurate.

## Notes
- "Via-gent" branding should be "Cyan/Slate" themed to match existing dark mode, or improved if requested. (User asked for "Interactive... Premium").

### Dev Agent Record

**Agent:** Amelia (Dev)
**Session:** 2025-12-20

#### Task Progress:
- [x] Task 1: Generate Assets - Created `via-gent-logo.svg`
- [x] Task 2: Global Rebranding - Updated `__root.tsx`, `Header.tsx`, hidden DevTools
- [x] Task 3: Localization Prep - Updated en/vi JSONs
- [x] Task 4: Interactive Onboarding Component - Created `Onboarding.tsx`
- [x] Task 5: Dashboard Integration - Added to `index.tsx`

#### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| public/via-gent-logo.svg | Created | 11 |
| src/routes/__root.tsx | Modified | +3/-3 |
| src/components/Header.tsx | Modified | +2/-2 |
| src/i18n/en.json | Modified |+18 |
| src/i18n/vi.json | Modified |+18 |
| src/components/dashboard/Onboarding.tsx | Created | 100+ |
| src/components/dashboard/__tests__/Onboarding.test.tsx | Created | 30 |
| src/routes/index.tsx | Modified | +3 |

#### Tests Created:
- Onboarding.test.tsx: 2 tests (Passed)

#### Decisions Made:
- Implemented Onboarding as a single component with internal layout for simplicity.
- Used SVG for logo to avoid binary dependency and allow easy styling/scaling.
- Hidden TanStack DevTools via process.env.NODE_ENV check.

