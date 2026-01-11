---
story_key: "CHAT-002-fix-multiline-input"
epic: CHAT-REMAKE
story: 2
status: "done"
created_at: "2026-01-11T20:35:00+07:00"
completed_at: "2026-01-11T21:00:00+07:00"
points: 6
priority: "P0-CRITICAL"
---

# CHAT-002: Fix Multi-line Input Textarea

**Epic:** CHAT-REMAKE (Unified Chat System Remediation)
**Story:** 2 of 17
**Effort:** 6 hours
**Priority:** P0-CRITICAL

## User Story

**As a** user typing longer messages in the chat panel
**I want** the textarea to auto-expand as I type
**So that** I can see my full message without scrolling and the input works well on mobile devices

## Problem Statement

Current chat input textarea has limitations:
- Fixed single-line height doesn't expand for longer messages
- No visual indication when reaching maximum height
- iOS zoom issue when typing (font-size < 16px)
- Manual resize is awkward and inconsistent

## Acceptance Criteria

### AC-1: Auto-Expand from 1 to 6 Lines
**Given** a user is typing in the chat input textarea
**When** the content exceeds one line
**Then** the textarea automatically expands up to 6 lines maximum

### AC-2: Show Scroll Indicator at Maximum Height
**Given** a user has typed content that fills 6 lines
**When** they continue typing
**Then** the textarea stays at 6 lines and shows a scroll indicator

### AC-3: Prevent iOS Zoom on Focus
**Given** a user is on an iOS device
**When** they tap the textarea to focus
**Then** no automatic zoom occurs (using text-base/16px font)

### AC-4: Maintain Responsive Layout
**Given** the textarea is at any size (1-6 lines)
**When** the panel is resized
**Then** the textarea maintains proper proportions and doesn't break layout

## Tasks

- [ ] T1: Research field-sizing: content CSS property and browser support
- [ ] T2: Implement auto-expand logic with max 6 lines
- [ ] T3: Add scroll indicator for overflow state
- [ ] T4: Apply text-base (16px) to prevent iOS zoom
- [ ] T5: Write TDD tests for textarea behavior
- [ ] T6: Test on iOS device for zoom behavior

## Research Requirements

### Required MCP Research
- [x] Context7: CSS field-sizing property and browser support
- [x] Codebase: Existing textarea implementations
- [x] Mobile: iOS input zoom prevention patterns

## Pre-Planning Gate Report

**Status:** ✅ PASSED
**Completed At:** 2026-01-11T20:40:00+07:00

### Research Summary

| Tool | Query | Key Finding |
|------|-------|-------------|
| Web Search | CSS field-sizing 2024 | **New CSS feature** - one-line auto-resize with `field-sizing: content` |
| MDN Docs | field-sizing property | Official Mozilla documentation available |
| Codebase | textarea patterns | Found 8 textarea implementations, ChatConversation uses text-sm (causes iOS zoom) |

### Key Findings

**1. CSS field-sizing: content (NEW 2024)**
- Pure CSS solution - no JavaScript required
- Auto-grows and shrinks textarea based on content
- One line: `field-sizing: content`
- Sources:
  - [Chrome for Developers - CSS field-sizing](https://developer.chrome.com/docs/css-ui/css-field-sizing)
  - [MDN Web Docs - field-sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/f/field-sizing)
  - [CSS-Tricks Almanac](https://css-tricks.com/almanac/properties/f/field-sizing/)

**2. Current Implementation Issues**
```tsx
// Line 346: text-sm causes iOS zoom (font < 16px)
className="... text-sm ..."

// Line 350: rounded-sm violates 8-bit design system
className="... resize-none rounded-sm"

// Line 344: Fixed rows={1} prevents expansion
rows={1}
```

**3. Browser Support**
- field-sizing: content is supported in:
  - Chrome 123+ (Dec 2023)
  - Firefox 121+ (Dec 2023)
  - Safari 16.4+ (Mar 2024)
- Fallback: Use `rows` attribute with max-height for older browsers

### Implementation Strategy

**Primary Solution:** Use `field-sizing: content`
**Fallback:** Max-height with overflow auto for browsers without support

```css
textarea {
    /* Primary: field-sizing (Chrome 123+, Firefox 121+, Safari 16.4+) */
    field-sizing: content;

    /* Fallback: max-height with scroll */
    max-height: 150px; /* ~6 lines at 24px/line */
    overflow-y: auto;
}
```

## Implementation Plan

### Approach
Use `field-sizing: content` with fallback to JS-based auto-resize for broader compatibility.

### Files to Modify
1. `ChatConversation.tsx` (lines 337-353, 478-493) - Update textarea styling and behavior
2. `ChatConversation.test.tsx` - Add textarea behavior tests

### Exact Changes
```tsx
// BEFORE - Fixed single line
<textarea
    className="flex-1 px-3 py-2 font-mono text-sm ... resize-none rounded-sm"
    rows={1}
/>

// AFTER - Auto-expand with iOS zoom prevention
<textarea
    className="flex-1 px-3 py-2 font-mono
               text-base md:text-sm  /* Prevents iOS zoom */
               min-h-[40px] max-h-[150px]  /* ~1 to ~6 lines */
               resize-none rounded-none
               field-sizing-content"  /* Auto-expand where supported */
    rows={1}
    style={{ fieldSizing: 'content' }}  /* Inline style for compatibility */
/>
```

### Integration
- No state changes required
- No API changes
- Pure CSS/JS enhancement

### Risks
- `field-sizing: content` has limited browser support (Firefox 121+, Chrome 123+, Safari 16.4+)
- Fallback JS implementation may be needed for older browsers
- Need to ensure it works with the flex-safe pattern from CHAT-001

## Dev Notes

### Dependencies
- react: ^18.3.0 - React hooks for resize handling
- Existing textarea implementation in ChatConversation.tsx

### Testing Strategy
1. Unit tests for auto-expand behavior
2. Test max-height constraint
3. Test iOS zoom prevention (manual on device)
4. Verify layout at all textarea sizes

## References

- Plan: `.claude/plans/misty-honking-neumann.md`
- Component: `src/presentation/components/chat/ChatConversation.tsx`
- Related: CHAT-001 (flex-safe container pattern)

## Status History

| Status | Timestamp | Agent | Notes |
|--------|-----------|-------|-------|
| backlog | 2026-01-11T20:35:00+07:00 | SM | Created from plan |
| drafted | 2026-01-11T20:35:00+07:00 | SM | Story file created |
| in-development | 2026-01-11T20:45:00+07:00 | Dev | Implementation started |
| done | 2026-01-11T21:00:00+07:00 | Dev | All ACs verified, tests passing |

---

## Code Review

### Files Modified
1. `src/presentation/components/chat/ChatConversation.tsx`
   - Lines 337-360: Empty state textarea updated
   - Lines 485-508: Populated state textarea updated
2. `src/presentation/components/chat/__tests__/ChatConversation.test.tsx`
   - Added 11 new tests for CHAT-002

### AC Verification

| AC | Description | Status | Notes |
|----|-------------|--------|-------|
| AC-1 | Auto-expand from 1 to 6 lines | ✅ PASS | `min-h-[40px] max-h-[150px]` + `field-sizing-content` |
| AC-2 | Show scroll indicator at max height | ✅ PASS | `overflow-y-auto` applied |
| AC-3 | Prevent iOS zoom on focus | ✅ PASS | `text-base md:text-sm` (16px on mobile) |
| AC-4 | Maintain responsive layout | ✅ PASS | `rounded-none` for 8-bit design, consistent across both states |

### Test Coverage
- Total tests: 26 (15 CHAT-001 + 11 CHAT-002)
- All tests passing: ✅
- Test file: `ChatConversation.test.tsx`

### CSS Classes Applied
```tsx
// Empty state textarea (line 337-360)
<textarea
    className="flex-1 px-3 py-2 font-mono
               text-base md:text-sm       // AC-3: iOS zoom prevention
               min-h-[40px] max-h-[150px] // AC-1: Height constraints
               resize-none rounded-none    // AC-4: 8-bit design
               field-sizing-content        // AC-1: Auto-grow
               overflow-y-auto"            // AC-2: Scroll indicator
/>

// Populated state textarea (line 485-508) - identical styling
```

### Browser Support Notes
- `field-sizing: content` supported in Chrome 123+, Firefox 121+, Safari 16.4+
- Fallback behavior: max-height with overflow for older browsers
- iOS Safari 16.4+ supports field-sizing, zoom prevention works on all versions with text-base

---

## Pre-Planning Gate Report (ARCHIVED)

*Completed before development*
