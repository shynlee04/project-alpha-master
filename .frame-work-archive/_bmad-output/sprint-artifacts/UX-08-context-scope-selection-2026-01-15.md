# UX-08: Context Scope Selection - Story Completion Artifact

**Epic**: EPIC-UX-01 - Block Editor & Panel Overhaul
**Story**: UX-08 - Context Scope Selection
**Status**: COMPLETE
**Date**: 2026-01-15
**Effort**: ~2 hours (estimated 4h)

---

## Summary

Added the missing "below cursor" context mode to the AI prompt system. The context scope selection UI (with visual preview and token count warnings) was already implemented in `AIPromptDialog.tsx` from previous work. This story completed the feature by adding support for selecting content below the cursor position.

---

## User Story Requirements

| Requirement | Description | Status |
|-------------|-------------|--------|
| Context scope selection: above cursor | Use content above cursor position | ✅ ALREADY EXISTS |
| Context scope selection: below cursor | Use content below cursor position | ✅ COMPLETE (NEW) |
| Context scope selection: all content | Use entire document | ✅ ALREADY EXISTS |
| Context scope selection: selection only | Use selected text only | ✅ ALREADY EXISTS |
| Visual preview of selected context | Show what content will be used | ✅ ALREADY EXISTS |
| Token count warning for large contexts | Warn when context is large | ✅ ALREADY EXISTS |

---

## Analysis

### Story Assessment

The epic specification for UX-08 targeted `AIInsertionDialog.tsx` for context scope selection. However, this was a **planning error** because:

1. `AIInsertionDialog` shows **after** AI generation (for choosing how to insert the result)
2. Context scope selection must happen **before** generation
3. `AIPromptDialog.tsx` is the correct component - it's the pre-generation dialog

Upon inspection, `AIPromptDialog.tsx` **already had** most of UX-08's features implemented:
- Context mode selector dropdown (above_cursor, all, selection, none)
- Visual preview of selected context with collapsible panel
- Token count estimation and warning thresholds
- Character/word/block count statistics

The **only missing feature** was the "below cursor" context mode.

### What Was Already Implemented (from previous work)

In `AIPromptDialog.tsx`:
- **Context mode dropdown** (lines 254-342): Full dropdown with all modes except `below_cursor`
- **Visual preview** (lines 346-399): Collapsible preview panel showing selected context
- **Token count warning** (lines 372-383): Warning thresholds at 2000 and 5000 characters
- **Statistics** (lines 349-369): Word count, character count, estimated tokens, block count
- **Icons for each mode** (lines 108-115): ArrowUp, FileText, TextSelect, Ban

---

## Files Modified

### 1. `src/presentation/components/notes/AISlashCommand.tsx`

**Changes**:
- Updated `ContextMode` type to include `'below_cursor'` (line 297)
- Added `getTextBelowCursor()` function (lines 296-325)
- Added `getBlocksBelowCursor()` function (lines 331-352)
- Updated `getContextByMode()` to handle `below_cursor` case (lines 376-380)

**Key Code**:
```typescript
export type ContextMode = 'above_cursor' | 'below_cursor' | 'all' | 'none' | 'selection';

function getTextBelowCursor(editor: BlockNoteEditor): string {
    // Get blocks from currentIndex+1 to end (content below cursor)
    const blocksBelow = allBlocks.slice(currentIndex + 1);
    return blocksBelow
        .map(block => extractBlockText(block))
        .filter(Boolean)
        .join('\n\n');
}

case 'below_cursor':
    return {
        text: getTextBelowCursor(editor),
        blocks: getBlocksBelowCursor(editor),
    };
```

### 2. `src/lib/notes/ai-prompt-store.ts`

**Changes**:
- Updated `ContextMode` type to include `'below_cursor'` (line 10)
- Added `CONTEXT_MODE_LABELS.below_cursor` with English/Vietnamese labels (lines 24-31)

**Key Code**:
```typescript
export type ContextMode = 'above_cursor' | 'below_cursor' | 'all' | 'none' | 'selection';

export const CONTEXT_MODE_LABELS: Record<ContextMode, ...> = {
    // ...
    below_cursor: {
        en: 'Content below cursor',
        vi: 'Nội dung phía dưới con trỏ',
        description: {
            en: 'Only include blocks below your cursor position',
            vi: 'Chỉ bao gồm các khối phía dưới vị trí con trỏ',
        },
    },
    // ...
};
```

### 3. `src/presentation/components/notes/AIPromptDialog.tsx`

**Changes**:
- Added `ArrowDown` import (line 3)
- Added `below_cursor` case to `getContextByMode()` (lines 73-94)
- Added `ArrowDown` icon to `getContextModeIcon()` (line 133)
- Added `below_cursor` menu item in dropdown (lines 306-314)

**Key Code**:
```typescript
import { ..., ArrowDown, ... } from 'lucide-react';

case 'below_cursor': {
    // Get blocks from currentIndex+1 to end
    const blocksBelow = allBlocks.slice(currentIndex + 1);
    const text = blocksBelow
        .map(block => extractBlockText(block))
        .filter(Boolean)
        .join('\n\n');
    return { text, blocks: blocksBelow };
}

// In dropdown:
<DropdownMenuRadioItem value="below_cursor" className="flex-col items-start gap-1">
    <div className="flex items-center gap-2">
        <ArrowDown className="w-4 h-4" />
        <span>{CONTEXT_MODE_LABELS.below_cursor[locale]}</span>
    </div>
    <span className="text-xs text-muted-foreground pl-6">
        {CONTEXT_MODE_LABELS.below_cursor.description[locale]}
    </span>
</DropdownMenuRadioItem>
```

### 4. `src/presentation/components/notes/InBlockAIPopup.tsx`

**Changes**:
- Updated `AIAction.contextMode` type to include `'below_cursor'` (line 45)

### 5. `src/presentation/components/notes/NoteEditor.tsx`

**Changes**:
- Updated `contextModeMap` type to include `'below_cursor'` (line 808)
- Changed mapping for `'below'` from `'above_cursor'` to `'below_cursor'` (line 810)
- Added UX-08 story reference comment (line 802)

**Key Code**:
```typescript
// UX-08: Updated to support below_cursor mode
const contextModeMap: Record<ContextScope['mode'], 'above_cursor' | 'below_cursor' | 'all' | 'none' | 'selection'> = {
    'above': 'above_cursor',
    'below': 'below_cursor', // Use content below cursor (UX-08)
    'all': 'all',
    'selection': 'selection',
};
```

---

## Context Modes Available

| Mode | Description | Use Case |
|------|-------------|----------|
| `above_cursor` | Content above cursor position | Building on previous content |
| `below_cursor` | Content below cursor position | Referencing upcoming content |
| `all` | Entire document | Summarization, full-note operations |
| `selection` | Currently selected text only | Refining specific selection |
| `none` | No context | Standalone generation |

---

## Visual Preview Features (Already Implemented)

### Context Preview Panel

The preview panel shows:
- **Statistics bar**: Words, characters, estimated tokens, blocks
- **Warning thresholds**:
  - Yellow warning at 2000+ characters ("Large context - may take longer")
  - Orange warning at 5000+ characters ("Very large context may increase cost and response time")
- **Collapsible preview**: Toggle with Eye/EyeOff icon
- **Truncated preview**: Shows max 500 chars with truncation indicator

### Token Estimation

Approximate token calculation: `Math.ceil(charCount / 4)`

---

## Z-Index Compliance (UX-01)

All components use the unified z-index token scale from UX-01:
- Dialog: Uses default dialog z-index from Radix UI
- Dropdown: Uses default dropdown z-index from Radix UI
- No arbitrary z-index values used

---

## TypeScript Validation

✅ **PASSED** - No TypeScript errors in UX-08 files

```bash
pnpm tsc --noEmit
```

---

## Localization

All context modes are fully localized:
- English (`en`) labels and descriptions
- Vietnamese (`vi`) labels and descriptions
- Uses `CONTEXT_MODE_LABELS` from `ai-prompt-store.ts`

---

## Integration Points

### Context Mode Flow

```
User selects "below cursor" mode
        ↓
AIPromptDialog.getContextByMode() extracts blocks below cursor
        ↓
Context preview shows extracted content with token count
        ↓
User confirms generation
        ↓
executeAICommand() called with contextMode: 'below_cursor'
        ↓
AISlashCommand.getContextByMode() gets blocks below cursor
        ↓
Context is appended to prompt before sending to AI
```

---

## Testing Notes

To verify the "below cursor" context mode:

1. Create a note with multiple blocks:
   ```
   Block 1 (above cursor)
   [cursor here]
   Block 3 (below cursor)
   Block 4 (below cursor)
   ```

2. Open AI Magic dialog (type `/ai` or click sparkle button)

3. Select "Content below cursor" from the Context dropdown

4. Expected: Preview shows only "Block 3" and "Block 4" content

---

## Next Story

**Phase 2: Block Editor (P0-P1)**

| Story | Description | Effort | Dependencies |
|-------|-------------|--------|--------------|
| UX-09 | Toggle and Callout Blocks | 1d | None |
| UX-10 | Block References (`^blockId`) | 2d | None |
| UX-11 | Column Layouts | 1d | None |
| UX-12 | Synced Blocks | 2d | None |

---

## Governance Updates

- **LOOP_STATE.yaml**: Will be updated with UX-08 completion
- **ralph-loop.local.md**: Will be updated iteration count and story status

---

**Story Completion**: UX-08 COMPLETE
**Ralph Loop Iteration**: 38 → 39
**Date**: 2026-01-15
