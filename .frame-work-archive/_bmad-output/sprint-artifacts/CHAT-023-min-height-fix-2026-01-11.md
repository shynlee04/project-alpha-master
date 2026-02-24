# CHAT-023: Apply min-h-0 Layout Fix to EnhancedChatInterface

**Epic:** EPIC-CHAT-REMAKE
**Story:** CHAT-023
**Title:** Apply min-h-0 Layout Fix to EnhancedChatInterface
**Status:** DONE
**Created:** 2026-01-11
**Completed:** 2026-01-11
**Effort:** 1h
**Priority:** P0-CRITICAL
**Phase:** 1

## Context

**Correct-Course Workflow:** Quick Patch

CHAT-001 introduced the `min-h-0` layout pattern for flex-safe containers in resizable panes. This fix was applied to `ChatConversation.tsx` (unused) but was missing from `EnhancedChatInterface.tsx` (the actual production component).

**Note:** This fix was completed as part of CHAT-018, but is tracked separately for clarity on the CHAT-001 remediation.

## User Story

**As a** developer working with resizable chat panels
**I want** the chat input area to use the flex-safe pattern
**So that** the textarea doesn't cover messages during resize

## The Fix

**File:** `src/presentation/components/ide/EnhancedChatInterface.tsx`
**Line:** 402

```tsx
// BEFORE (broken on resize)
className="flex-1 min-h-[40px] max-h-[150px] ..."

// AFTER (flex-safe)
className="flex-1 min-h-0 min-h-[40px] max-h-[150px] ..."
```

## Why This Matters

In flexbox layouts, `flex-1` children have an implicit `min-height: auto`. This prevents them from shrinking below their content size. The `min-h-0` override allows the flex child to shrink when the container is resized.

## Acceptance Criteria

- [x] `min-h-0` added to textarea container
- [x] Layout remains stable during panel resize
- [x] Input area never covers messages
- [x] TypeScript compiles without errors

## Related Stories

- **CHAT-001:** Original layout fix story (applied to wrong component)
- **CHAT-018:** Applied 8-bit fixes + this layout fix

## Notes

**Pattern Source:** From investigation report:
> IDEChatPanel.tsx:53 - `<CardContent className="p-0 flex-1 min-h-0">`
> MainLayout.tsx:77 - `<main className="flex-1 flex flex-col min-w-0 min-h-0 ...">`
> ChatPanelWrapper.tsx:141 - `<div className="flex-1 min-h-0">`

This is an established pattern across the codebase that was missing from the production chat component.
