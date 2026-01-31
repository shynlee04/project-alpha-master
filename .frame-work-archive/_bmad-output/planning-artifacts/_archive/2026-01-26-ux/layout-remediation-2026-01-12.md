# Layout Remediation - Course Correction Plan

**Date**: 2026-01-12
**Epic**: Responsive Layout Fixes
**Story**: Resizable Panel Layout Remediation
**Confidence**: 95%

---

## Change Registry

All intended changes are registered here with traceability to Epics/Stories.

### Issue 1: Flex Truncation Bug

**Root Cause**: Flex children default to `min-width: auto`, preventing `truncate` class from working.

| File | Line | Component | Change | Governance |
|------|------|-----------|--------|------------|
| NoteSidebar.tsx | 141 | View Mode Tabs Container | Add `min-w-0 overflow-hidden` | EPIC-26-5 |
| NoteTreeItem.tsx | 91 | Tree Item Container | Add `min-w-0` to flex container | EPIC-26-5 |
| AgentChatHeader.tsx | 171 | Workspace Switcher | Add `min-w-0` to flex container | E1-11 |
| BatchApprovalBar.tsx | 83 | Summary Container | Already has `min-w-0` - verify | E2-3 |

### Issue 2: Action Button Wrapping

**Root Cause**: `flex-wrap` causes buttons to wrap to next row.

| File | Line | Component | Change | Governance |
|------|------|-----------|--------|------------|
| NoteSidebar.tsx | 285 | Actions Row | Change `flex-wrap` to `overflow-x-auto` | NR-06 |

### Issue 3: Project Badge Truncation

**Root Cause**: `whitespace-nowrap` prevents badge from truncating.

| File | Line | Component | Change | Governance |
|------|------|-----------|--------|------------|
| NoteTreeItem.tsx | 124 | Project Badge | Add `max-w-[60px] truncate` | 45-04 |

### Issue 4: Panel Pixel Minimums Not Enforced

**Root Cause**: `minPixelSize` prop exists but not enforced as DOM style.

| File | Line | Component | Change | Governance |
|------|------|-----------|--------|------------|
| resizable.tsx | ~180 | ResizablePanel div | Apply `style={{ minWidth }}` from config | Foundation |
| NotesPage.tsx | 693-807 | Panel configs | Verify minPixelSize values are correct | EPIC-26-5 |

---

## Implementation Order

1. **NoteTreeItem.tsx** - Core tree component, fixes truncation at source
2. **NoteSidebar.tsx** - Container layout fixes
3. **AgentChatHeader.tsx** - Chat panel header
4. **resizable.tsx** - Panel constraint enforcement
5. **Verification** - TypeScript check and visual verification

---

## Hypothesis & Testing

### Hypothesis 1: Adding `min-w-0` enables truncation
**Expected**: Text with `truncate` class will show ellipsis instead of wrapping.
**Test Case**: Create note with very long title, verify ellipsis appears.

### Hypothesis 2: Removing `flex-wrap` prevents wrapping
**Expected**: Action buttons will stay on one row and become scrollable.
**Test Case**: Shrink sidebar to minimum, verify buttons scroll horizontally.

### Hypothesis 3: Enforcing pixel minimums prevents squeezing
**Expected**: Panels cannot be resized below their pixel minimum.
**Test Case**: Try to resize chat panel below 280px, verify it stops.

---

## Collateral Impact Analysis

### Potentially Affected Components
- `IDELayoutMain.tsx` - Uses same resizable pattern
- `KnowledgePage.tsx` - May need same fixes
- `MobileLayout` - Should not be affected (separate components)

### Cross-Workspace Consistency
Same patterns should be applied to:
- IDE workspace chat panels
- Knowledge workspace panels
- Study workspace panels

---

## Scratchpad - Trials & Errors

| Attempt | Change | Result | Notes |
|---------|--------|--------|-------|
| 1 | NoteTreeItem min-w-0 | ✅ Success | Applied at line 92 |
| 2 | NoteTreeItem project badge | ✅ Success | Added max-w-[60px] truncate |
| 3 | NoteSidebar view tabs | ✅ Success | Added min-w-0 overflow-hidden |
| 4 | NoteSidebar actions row | ✅ Success | Changed flex-wrap to overflow-x-auto |
| 5 | AgentChatHeader | ✅ Success | Added min-w-0 to controls container |
| 6 | resizable.tsx panel minWidth | ✅ Success | Now uses minPixelSize prop |
| 7 | TypeScript check | ✅ Pass | No new errors introduced |

---

## Implementation Summary

### Completed Changes

1. **NoteTreeItem.tsx:92** - Added `min-w-0` to flex container
2. **NoteTreeItem.tsx:124** - Added `max-w-[60px] truncate` to project badge
3. **NoteSidebar.tsx:138** - Added `truncate` to view mode label
4. **NoteSidebar.tsx:141** - Added `min-w-0 overflow-hidden` to view tabs container
5. **NoteSidebar.tsx:285** - Changed `flex-wrap` to `overflow-x-auto` on actions row
6. **AgentChatHeader.tsx:169** - Added `min-w-0` to controls container
7. **resizable.tsx:593-594** - Changed `minWidth: 0` to `minWidth: (minPixelSize ?? 0)`

### TypeScript Verification
✅ No errors in modified files
⚠️ Pre-existing errors in API routes (unrelated to this work)

### Expected Outcomes
- Text will truncate with ellipsis instead of wrapping
- Panels cannot be resized below their pixel minimum (220px sidebar, 280px chat, 400px editor)
- Action buttons will scroll horizontally instead of wrapping
- Project badges will truncate instead of forcing expansion
- Workspace switcher will not overflow in narrow panels
