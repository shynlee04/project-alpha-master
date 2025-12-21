# Story 28-2: Configure 8-Bit Typography System

## Story Header
- **Epic:** 28 (UX Brand Identity & Design System)
- **Story:** 28-2
- **Title:** Configure 8-Bit Typography System
- **Priority:** 🔴 P0
- **Points:** 3
- **Status:** in-progress
- **Created:** 2025-12-22
- **Platform:** Platform B

## User Story
As a **developer and user**,
I want **pixel fonts integrated into the design system**,
So that **the IDE has an authentic 8-bit gaming aesthetic for headings and brand elements**.

## Font Stack

| Purpose | Font | Fallback | Usage |
|---------|------|----------|-------|
| Brand/Headings | VT323 | monospace | Logo, panel titles, badges |
| Heavy Emphasis | Press Start 2P | VT323, monospace | Special callouts, error states |
| Body | Inter | system-ui, sans-serif | All body text |
| Code | JetBrains Mono | monospace | Monaco editor, terminal |

## Acceptance Criteria

### AC-28-2-1: Google Fonts Integration
**Given** the VIA-GENT 8-bit aesthetic requirements
**When** I load the application
**Then** VT323 and Press Start 2P fonts are loaded from Google Fonts

### AC-28-2-2: Tailwind Font Utilities
**Given** the font stack is configured
**When** I use `font-pixel` or `font-pixel-heavy` classes
**Then** the correct pixel fonts are applied

### AC-28-2-3: No FOUT (Flash of Unstyled Text)
**Given** fonts are loaded asynchronously
**When** the page renders
**Then** there is no visible flash of fallback fonts

## Tasks

### T1: Add Google Fonts Link
**File:** `src/routes/__root.tsx`

Add Google Fonts preconnect and stylesheet links in the `<head>` section.

### T2: Update CSS with Font Variables
**File:** `src/styles.css`

Add font-family CSS variables and Tailwind utilities.

### T3: Create Typography Utility Classes
Add `.font-pixel`, `.font-pixel-heavy`, `.text-pixel-*` classes.

### T4: Update Brand Components
Apply pixel fonts to logo and headings where appropriate.

## Dev Agent Record

**Agent:** Platform B
**Session:** 2025-12-22

### Task Progress:
- [x] T1: Add Google Fonts Link
- [x] T2: Update CSS with Font Variables  
- [x] T3: Create Typography Utility Classes
- [ ] T4: Update Brand Components

### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| src/routes/__root.tsx | Modified | +10 |
| src/styles.css | Modified | +25 |

## Status History
| Date | Status | Notes |
|------|--------|-------|
| 2025-12-22 | in-progress | Story created, implementation started |
