# Story 28.21: Diff Preview Component

**Status:** drafted
**Created:** 2025-12-22T22:59:00+07:00
**Epic:** 28 - UX Brand Identity & Design System
**Phase:** 6 - AI Foundation Integration Readiness
**Tier:** 1 - Chat + Tool Visibility (Critical)
**Priority:** P0
**Points:** 5
**Platform:** Platform B

---

## Story

As a **developer reviewing AI-generated file changes**,
I want **to see a diff preview showing additions and deletions with syntax highlighting**,
so that **I can understand exactly what the AI agent is proposing to change before approving**.

---

## Context & Business Value

This story creates the **DiffPreview** component which displays file changes proposed by AI agents:

1. **Unified Diff View** - Single view showing +/- lines with colors
2. **Line Numbers** - Before/after line numbers for context
3. **Syntax Highlighting** - Language-aware coloring in diff view
4. **Integration with Approval** - Used with ApprovalOverlay (28-22)

This is critical for Epic 25 (AI Foundation) where AI agents propose file modifications.

### Cross-Epic Integration Points

| Epic | Story | Integration |
|------|-------|-------------|
| Epic 6 | 6-X | Coder agent proposes file changes |
| Epic 25 | 25-5 | Tool results include diff content |
| Story 28-20 | CodeBlock | Reuse syntax highlighting patterns |
| Story 28-22 | ApprovalOverlay | DiffPreview embedded in approval UI |

---

## Acceptance Criteria

### AC-1: Unified Diff Rendering
**Given** old code and new code content  
**When** DiffPreview renders  
**Then** displays unified diff with additions (+) and deletions (-)

### AC-2: Line-by-Line Coloring
**Given** diff content  
**When** DiffPreview renders  
**Then** additions are green, deletions are red, unchanged are neutral

### AC-3: Line Numbers
**Given** diff content  
**When** DiffPreview renders  
**Then** shows old and new line numbers for each line

### AC-4: File Path Header
**Given** DiffPreview has filePath prop  
**When** component renders  
**Then** displays file path in header with file icon

### AC-5: Collapsible Unchanged Regions
**Given** large unchanged context  
**When** unchanged lines > 3  
**Then** shows "... N lines hidden ..." collapse indicator

### AC-6: Pixel Aesthetic Styling
**Given** Epic 28 design requirements  
**When** DiffPreview renders  
**Then** uses 8-bit pixel aesthetic with squared corners, monospace font

### AC-7: i18n Localization
**Given** user language is Vietnamese  
**When** DiffPreview renders  
**Then** labels and tooltips display in Vietnamese

---

## Tasks / Subtasks

### Task 1: Create DiffPreview Component (AC: 1, 2, 3, 6)
- [ ] 1.1: Create `src/components/chat/DiffPreview.tsx`
- [ ] 1.2: Define DiffPreviewProps interface
- [ ] 1.3: Implement simple diff algorithm (no external lib)
- [ ] 1.4: Render unified diff lines with +/- prefix
- [ ] 1.5: Color code additions (green) and deletions (red)
- [ ] 1.6: Add line numbers (old/new columns)

### Task 2: File Header & Metadata (AC: 4)
- [ ] 2.1: Create file path header with icon
- [ ] 2.2: Show change statistics (+X/-Y lines)
- [ ] 2.3: Add language detection from file extension

### Task 3: Collapse Unchanged Regions (AC: 5)
- [ ] 3.1: Detect long unchanged sequences (> 3 lines)
- [ ] 3.2: Create expandable/collapsible regions
- [ ] 3.3: Show "... N lines hidden ..." indicator

### Task 4: Add i18n Keys (AC: 7)
- [ ] 4.1: Add English keys to src/i18n/en.json under `chat.diff.*`
- [ ] 4.2: Add Vietnamese keys to src/i18n/vi.json
- [ ] 4.3: Verify all strings use t() function

### Task 5: Write Unit Tests
- [ ] 5.1: Create `src/components/chat/__tests__/DiffPreview.test.tsx`
- [ ] 5.2: Test diff renders additions in green
- [ ] 5.3: Test diff renders deletions in red
- [ ] 5.4: Test line numbers display correctly
- [ ] 5.5: Test file path header renders
- [ ] 5.6: Run: `pnpm test src/components/chat/__tests__/DiffPreview.test.tsx`

### Task 6: TypeScript Verification
- [ ] 6.1: Run `pnpm exec tsc --noEmit`
- [ ] 6.2: Fix any type errors
- [ ] 6.3: Verify no lint warnings

---

## Dev Notes

### File Structure

```
src/
  components/
    chat/
      DiffPreview.tsx            # NEW - Diff view component
      index.ts                   # Update - Add DiffPreview export
      __tests__/
        DiffPreview.test.tsx     # NEW - Tests
```

### Simple Diff Algorithm

For Phase 6, implement a simple line-based diff (no external library):

```typescript
type DiffLine = {
  type: 'add' | 'remove' | 'unchanged';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
};

function computeDiff(oldText: string, newText: string): DiffLine[] {
  // Simple line-based comparison
  // Epic 27+ can integrate more sophisticated algorithms
}
```

### Styling Pattern

```tsx
const LINE_STYLES = {
  add: 'bg-green-500/10 text-green-400 border-l-2 border-green-500',
  remove: 'bg-red-500/10 text-red-400 border-l-2 border-red-500',
  unchanged: 'text-muted-foreground',
};
```

### i18n Keys

**English (en.json):**
```json
{
  "chat": {
    "diff": {
      "additions": "{{count}} additions",
      "deletions": "{{count}} deletions",
      "linesHidden": "{{count}} lines hidden",
      "expand": "Show hidden lines",
      "collapse": "Hide lines"
    }
  }
}
```

**Vietnamese (vi.json):**
```json
{
  "chat": {
    "diff": {
      "additions": "{{count}} thêm",
      "deletions": "{{count}} xóa",
      "linesHidden": "{{count}} dòng ẩn",
      "expand": "Hiện dòng ẩn",
      "collapse": "Ẩn dòng"
    }
  }
}
```

---

## References

- [Source: _bmad-output/analysis/epic-28-holistic-integration-analysis.md] - Coder agent diff preview
- [Source: src/components/chat/CodeBlock.tsx] - Syntax highlighting patterns
- [Source: Exa Research] - react-diff-viewer, react-diff-view patterns

---

## Dev Agent Record

*To be filled during development*

### Agent Model Used
TBD

### Completion Notes List
TBD

### File List
**To Create:**
- `src/components/chat/DiffPreview.tsx`
- `src/components/chat/__tests__/DiffPreview.test.tsx`

**To Modify:**
- `src/components/chat/index.ts`
- `src/i18n/en.json`
- `src/i18n/vi.json`

---

## Status History

| Status | Date | Agent | Notes |
|--------|------|-------|-------|
| drafted | 2025-12-22T22:59 | BMad Master | Story file created |
