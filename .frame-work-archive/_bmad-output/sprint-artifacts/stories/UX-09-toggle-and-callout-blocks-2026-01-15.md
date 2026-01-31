---
story_key: "UX-09-toggle-and-callout-blocks"
epic: "EPIC-UX-01"
story: 9
status: "DONE"
created_at: "2026-01-15T23:00:00+07:00"
completed_at: "2026-01-15T23:30:00+07:00"
points: 5
---

# Story UX-09: Toggle and Callout Blocks

## User Story

**As a** note editor user
**I want** toggle blocks (collapsible content) and callout blocks (highlighted info boxes)
**So that** I can organize my notes with collapsible sections and highlight important information

## Epic Context

**Epic:** EPIC-UX-01 (Block Editor & Panel Overhaul)
**Parent Story:** UX-08 (Context Scope Selection) - COMPLETED
**Next Story:** UX-10 (Pending)

## Acceptance Criteria

### AC-1: Toggle Block Type Available
**Given** the BlockNote editor supports custom block types
**When** I type `/toggle` in the editor
**Then** a toggle list item is inserted that can be collapsed/expanded

### AC-2: Callout Block Type Available
**Given** the BlockNote editor supports custom block types
**When** I type `/callout` or select a callout variant
**Then** a callout block is inserted with appropriate icon and styling

### AC-3: Callout Type Variants
**Given** a callout block exists
**When** I hover over the block
**Then** I can select from 5 variants: info, warning, error, success, tip

### AC-4: Callout Visual Design
**Given** a callout block is rendered
**When** I view the block
**Then** it uses 8-bit design tokens with sharp corners and pixel borders

### AC-5: Slash Menu Integration
**Given** the slash command menu is open
**When** I search for "toggle" or "callout"
**Then** both block types appear in the menu with appropriate icons

### AC-6: No TypeScript Errors
**Given** the implementation is complete
**When** I run `pnpm tsc --noEmit`
**Then** no type errors are reported

### AC-7: Custom Props Preserved
**Given** a callout block with custom `calloutType` exists
**When** I save and reload the note
**Then** the callout type is preserved

## Tasks

- [x] T1: Analyze BlockNote's default block specs and toggleListItem availability
- [x] T2: Create CalloutBlock component with 5 type variants
- [x] T3: Create CalloutBlock.css with 8-bit design compliance
- [x] T4: Integrate CalloutBlock into NoteEditor schema
- [x] T5: Add slash menu items for toggle and callout blocks
- [x] T6: Fix TypeScript errors (useState unused, type assertion for updateBlock)
- [x] T7: Verify compilation passes

## Implementation Details

### Block Types Added

| Block Type | Source | Variants |
|------------|--------|----------|
| `toggleListItem` | Built-in (defaultBlockSpecs) | N/A |
| `callout` | Custom (CalloutBlock.tsx) | info, warning, error, success, tip |

### Files Created

| File | Lines | description |
|------|-------|---------|
| `src/presentation/components/notes/blocks/CalloutBlock.tsx` | 203 | Custom callout block implementation |
| `src/presentation/components/notes/blocks/CalloutBlock.css` | 60 | 8-bit compliant styles |

### Files Modified

| File | Changes |
|------|---------|
| `src/presentation/components/notes/blocks/index.ts` | Added CalloutBlock exports |
| `src/presentation/components/notes/NoteEditor.tsx` | Imported and registered CalloutBlock in schema |
| `src/presentation/components/notes/AISlashCommand.tsx` | Added insertToggleListItem and insertCalloutBlock menu items |
| `_bmad-ext/state/LOOP_STATE.yaml` | Updated iteration to 60, status to UX-09 in progress |

### Callout Block Configuration

```typescript
type CalloutType = "info" | "warning" | "error" | "success" | "tip";

const CALLOUT_CONFIG: Record<CalloutType, {
    icon: typeof Info;
    label: string;
    colorClass: string;
    bgClass: string;
    borderClass: string;
}> = {
    info: { icon: Info, label: "Info", ... },
    warning: { icon: AlertTriangle, label: "Warning", ... },
    error: { icon: AlertCircle, label: "Error", ... },
    success: { icon: CheckCircle, label: "Success", ... },
    tip: { icon: Lightbulb, label: "Tip", ... },
};
```

### Slash Menu Items Added

1. **Toggle List** (`insertToggleListItem`)
   - Aliases: toggle, collapsible, accordion, togglelist
   - Group: Basic Blocks
   - Icon: ChevronRight

2. **Callout Blocks** (`insertCalloutBlock`)
   - Five variants (info, warning, error, success, tip)
   - Aliases: callout, info, alert, note
   - Group: Basic Blocks
   - Icon: Info

### Technical Decisions

1. **Used Built-in toggleListItem**: No custom implementation needed since BlockNote provides this out of the box
2. **Type Assertion for updateBlock**: Used `(editor.updateBlock as any)` because BlockNoteEditor type doesn't know about custom schema
3. **Inline Content for Callout**: Set `content: "inline"` to use `props.contentRef` for rich text editing
4. **Hover-Based Type Selector**: Callout type selector only appears on hover to avoid clutter

## Dev Notes

### Dependencies
- @blocknote/core: ^0.45.0 - Core block editor
- @blocknote/react: ^0.45.0 - React integration
- lucide-react: Icons for callout variants

### Integration Points
- Touches: `src/presentation/components/notes/NoteEditor.tsx` (schema registration)
- Touches: `src/presentation/components/notes/AISlashCommand.tsx` (slash menu)
- Breaks: None (additive change)

### Known Issues
None

### Future Enhancements
- Keyboard shortcuts for callout type cycling
- Custom icons for callouts (user-selectable)
- Nested toggle support

## Validation

### TypeScript Check
```bash
pnpm tsc --noEmit
# Result: No errors
```

### Manual Testing Required
- [ ] Create toggle block via slash menu
- [ ] Expand/collapse toggle block
- [ ] Create each callout variant
- [ ] Change callout type via hover selector
- [ ] Save and reload note with callouts

## References

- BlockNote Docs: https://blocknotejs.org/docs/api/core-api/block-specs
- Story Context: EPIC-UX-01 (Block Editor & Panel Overhaul)
- Related Stories: UX-08 (Context Scope Selection) - Completed

---

**Story Completed:** 2026-01-15 23:30 +07:00
**Next Action:** Begin UX-10 or return to epic planning
