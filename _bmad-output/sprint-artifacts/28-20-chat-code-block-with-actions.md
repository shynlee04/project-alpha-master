# Story 28.20: Chat Code Block with Actions

**Status:** drafted
**Created:** 2025-12-22T22:45:00+07:00
**Epic:** 28 - UX Brand Identity & Design System
**Phase:** 6 - AI Foundation Integration Readiness
**Tier:** 1 - Chat + Tool Visibility (Critical)
**Priority:** P0
**Points:** 5
**Platform:** Platform B

---

## Story

As a **developer receiving AI-generated code in chat**,
I want **to see code blocks with syntax highlighting and Accept/Reject action buttons**,
so that **I can easily review, copy, or apply AI-generated code to my project**.

---

## Context & Business Value

This story creates the **CodeBlock** component which displays AI-generated code in chat messages with:

1. **Syntax Highlighting** - Language-aware code highlighting for readability
2. **Copy to Clipboard** - One-click code copying
3. **Accept/Reject Actions** - Buttons to approve or dismiss code suggestions
4. **Language Detection** - Automatic or explicit language identification

This is critical for Epic 25 (AI Foundation) where AI agents will stream code suggestions.

### Cross-Epic Integration Points

| Epic | Story | Integration |
|------|-------|-------------|
| Epic 6 | 6-X | AI agent generates code → displayed in CodeBlock |
| Epic 25 | 25-5 | TanStack AI streaming code content |
| Story 28-19 | ToolCallBadge | Shows inline tool calls before code blocks |
| Story 28-21 | DiffPreview | CodeBlock can link to diff preview |
| Story 28-22 | ApprovalOverlay | Accept action triggers approval flow |

---

## Acceptance Criteria

### AC-1: Code Block Renders with Syntax Highlighting
**Given** AI returns code with language identifier (e.g., ```typescript)  
**When** CodeBlock renders  
**Then** displays code with appropriate syntax highlighting

### AC-2: Copy to Clipboard
**Given** a rendered CodeBlock  
**When** user clicks Copy button  
**Then** code is copied to clipboard AND success toast is shown

### AC-3: Accept Button Action
**Given** CodeBlock has onAccept callback  
**When** user clicks Accept button  
**Then** onAccept is called with code content

### AC-4: Reject Button Action
**Given** CodeBlock has onReject callback  
**When** user clicks Reject button  
**Then** onReject is called AND block visually dismisses

### AC-5: Language Badge Display
**Given** code block has identified language  
**When** CodeBlock renders  
**Then** language badge is shown in header (e.g., "TypeScript")

### AC-6: Pixel Aesthetic Styling
**Given** Epic 28 design requirements  
**When** CodeBlock renders  
**Then** uses 8-bit pixel aesthetic with squared corners, monospace font, and shadow

### AC-7: i18n Localization
**Given** user language is Vietnamese  
**When** CodeBlock renders  
**Then** buttons and tooltips display in Vietnamese

---

## Tasks / Subtasks

### Task 1: Create CodeBlock Component (AC: 1, 5, 6)
- [ ] 1.1: Create `src/components/chat/CodeBlock.tsx`
- [ ] 1.2: Define CodeBlockProps interface
- [ ] 1.3: Implement syntax highlighting with CSS classes
- [ ] 1.4: Add language badge header
- [ ] 1.5: Use 8-bit pixel aesthetic styling
- [ ] 1.6: Add line numbers (optional prop)

### Task 2: Copy to Clipboard (AC: 2)
- [ ] 2.1: Create copy button with ClipboardCopy icon
- [ ] 2.2: Implement navigator.clipboard.writeText
- [ ] 2.3: Show success/error toast via sonner
- [ ] 2.4: Add visual feedback on copy

### Task 3: Accept/Reject Actions (AC: 3, 4)
- [ ] 3.1: Create action buttons with Check/X icons
- [ ] 3.2: Implement onAccept callback prop
- [ ] 3.3: Implement onReject callback prop
- [ ] 3.4: Add dismiss animation for rejected blocks
- [ ] 3.5: Add success highlight for accepted blocks

### Task 4: Add i18n Keys (AC: 7)
- [ ] 4.1: Add English keys to src/i18n/en.json under `chat.codeBlock.*`
- [ ] 4.2: Add Vietnamese keys to src/i18n/vi.json
- [ ] 4.3: Verify all strings use t() function

### Task 5: Write Unit Tests
- [ ] 5.1: Create `src/components/chat/__tests__/CodeBlock.test.tsx`
- [ ] 5.2: Test code renders with syntax highlighting
- [ ] 5.3: Test copy button triggers clipboard API
- [ ] 5.4: Test Accept/Reject callbacks are invoked
- [ ] 5.5: Test language badge displays correctly
- [ ] 5.6: Run: `pnpm test src/components/chat/__tests__/CodeBlock.test.tsx`

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
      CodeBlock.tsx              # NEW - Code block with actions
      index.ts                   # Update - Add CodeBlock export
      __tests__/
        CodeBlock.test.tsx       # NEW - Tests
```

### Component Design

```tsx
/**
 * CodeBlock - AI code block with syntax highlighting and actions
 * 
 * @epic Epic-28 Story 28-20
 * @integrates Epic-25 Story 25-5 - TanStack AI streaming content
 * @integrates Epic-6 Story 6-X - AI agent code generation
 * @integrates Story 28-19 - ToolCallBadge for tool context
 * @integrates Story 28-22 - ApprovalOverlay for accept flow
 * 
 * @props
 * - code: Code content string
 * - language: Language identifier (e.g., "typescript")
 * - showLineNumbers: Boolean (default: false)
 * - onCopy: Callback when code is copied
 * - onAccept: Callback when Accept button clicked
 * - onReject: Callback when Reject button clicked
 * 
 * @example
 * <CodeBlock
 *   code="const x = 1;"
 *   language="typescript"
 *   onAccept={(code) => applyToEditor(code)}
 *   onReject={() => dismissBlock()}
 * />
 */
```

### Syntax Highlighting Approach

Using CSS classes for syntax highlighting (no external lib to minimize bundle):

```typescript
const TOKEN_CLASSES: Record<string, string> = {
  keyword: 'text-purple-400',
  string: 'text-green-400',
  comment: 'text-gray-500',
  function: 'text-blue-400',
  number: 'text-orange-400',
};
```

For Phase 6, we keep highlighting simple. Epic 27+ can integrate Monaco or Shiki.

### i18n Keys

**English (en.json):**
```json
{
  "chat": {
    "codeBlock": {
      "copy": "Copy",
      "copied": "Copied!",
      "accept": "Accept",
      "reject": "Reject",
      "language": "{{language}}",
      "lines": "{{count}} lines"
    }
  }
}
```

**Vietnamese (vi.json):**
```json
{
  "chat": {
    "codeBlock": {
      "copy": "Sao chép",
      "copied": "Đã sao chép!",
      "accept": "Chấp nhận",
      "reject": "Từ chối",
      "language": "{{language}}",
      "lines": "{{count}} dòng"
    }
  }
}
```

### Connection to Story 28-19

The ToolCallBadge from 28-19 should appear above or inline with CodeBlocks when the code is generated by a tool call (e.g., write_file, execute_command).

---

## References

- [Source: _bmad-output/analysis/epic-28-holistic-integration-analysis.md] - Phase 6 scope
- [Source: src/components/chat/ToolCallBadge.tsx] - 28-19 ToolCallBadge
- [Source: _bmad-output/epics/epic-28-ux-brand-identity-design-system.md] - Epic context
- [Source: Context7 TanStack AI] - Streaming content patterns

---

## Dev Agent Record

*To be filled during development*

### Agent Model Used
TBD

### Completion Notes List
TBD

### File List
**To Create:**
- `src/components/chat/CodeBlock.tsx`
- `src/components/chat/__tests__/CodeBlock.test.tsx`

**To Modify:**
- `src/components/chat/index.ts`
- `src/i18n/en.json`
- `src/i18n/vi.json`

---

## Status History

| Status | Date | Agent | Notes |
|--------|------|-------|-------|
| drafted | 2025-12-22T22:45 | BMad Master | Story file created |
