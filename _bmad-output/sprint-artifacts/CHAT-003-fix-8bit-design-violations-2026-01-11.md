# CHAT-003: Fix 8-bit Design System Violations in Chat Components

**Epic:** EPIC-CHAT (Unified Chat System Remediation)
**Story ID:** CHAT-003
**Status:** ✅ Done
**Priority:** P1-HIGH
**Phase:** 1 (Critical UX Fixes)
**Effort Estimate:** 12 hours (actual: 8 hours)
**Created:** 2026-01-11
**Completed:** 2026-01-11

---

## User Story

**As a** developer maintaining the design system,
**I want** all chat components to follow the 8-bit design system standards,
**So that** the entire application has visual consistency and the retro gaming aesthetic is preserved.

---

## Problem Statement

The chat components contain **37 violations** of the 8-bit design system across 13 files. These violations include:

| Violation Type | Count | Severity |
|----------------|-------|----------|
| `rounded-lg` (8px radius) | 28 | P1 |
| `rounded-md` (6px radius) | 7 | P1 |
| `rounded-xl` (12px radius) | 2 | P1 |

### Files Affected

1. **DebateTimeline.tsx** - 2 violations
2. **ImagePreviewDialog.tsx** - 1 violation
3. **NoteReferencePicker.tsx** - 3 violations
4. **RoutingDecision.tsx** - 1 violation
5. **SequentialExpansionOptions.tsx** - 2 violations
6. **SuggestionChips.tsx** - 4 violations
7. **ThreadManager.tsx** - 4 violations (plus 7 `rounded` defaults to md)
8. **TimeoutWarning.tsx** - 1 violation
9. **ToolProgressIndicator.tsx** - 1 violation
10. **WorkflowBuilder.refactored.tsx** - 7 violations
11. **WorkflowBuilder.tsx** - 6 violations
12. **WorkflowVisualizer.tsx** - 4 violations
13. **ChatConversation.tsx** - Already compliant (reference)

---

## 8-bit Design System Reference

Per `agent-os/standards/frontend/css.md`:

```css
/* Border radius (8-bit: 0, 4px, 8px, 12px) */
--radius-none: 0;      /* PREFERRED - sharp corners */
--radius-sm: 4px;      /* ACCEPTABLE - minimal rounding */
--radius-md: 8px;      /* NOT RECOMMENDED */
--radius-lg: 12px;     /* NOT RECOMMENDED */
```

**Required Changes:**
- `rounded-lg` → `rounded-none` (preferred) or `rounded-sm`
- `rounded-md` → `rounded-none` (preferred) or `rounded-sm`
- `rounded-xl` → `rounded-none` (preferred) or `rounded-sm`
- `rounded` (default md) → `rounded-none`

---

## Acceptance Criteria

### Criterion 1: Radius Compliance ✅
- [x] All `rounded-lg` replaced with `rounded-none`
- [x] All `rounded-md` replaced with `rounded-none`
- [x] All `rounded-xl` replaced with `rounded-none`
- [x] No remaining `rounded` (default md) classes

### Criterion 2: Visual Validation ✅
- [x] All chat components have sharp corners or 4px max radius
- [x] Components match the 8-bit aesthetic of ChatConversation.tsx
- [x] No visual regression in component appearance

### Criterion 3: Test Coverage ✅
- [x] Unit tests updated for affected components
- [x] No new TypeScript errors
- [x] Existing tests continue to pass (36/36 tests passing)

### Criterion 4: Code Quality ✅
- [x] No linter errors
- [x] Code follows the project's coding style standards
- [x] Changes are minimal and focused on the design fix

---

## Technical Implementation

### Search Pattern for Violations

```bash
# Find all radius violations
grep -rn "rounded-lg\|rounded-md\|rounded-xl\|'rounded[^-]" src/presentation/components/chat/*.tsx
```

### Replacement Pattern

| Current | Replacement |
|---------|-------------|
| `rounded-lg` | `rounded-none` |
| `rounded-md` | `rounded-none` |
| `rounded-xl` | `rounded-none` |
| `rounded` | `rounded-none` |

### Component-by-Component Breakdown

#### 1. ThreadManager.tsx (Priority: HIGH)
- Lines 134, 156, 162, 171: `rounded-md` → `rounded-none`
- Lines 215, 236, 246, 259, 269, 281, 323: `rounded` → `rounded-none`

#### 2. SuggestionChips.tsx (Priority: HIGH)
- Lines 158, 190, 191, 228: `rounded-lg` → `rounded-none`

#### 3. WorkflowBuilder.tsx (Priority: MEDIUM)
- Lines 45, 90, 127, 227, 233, 240: `rounded-lg` → `rounded-none`

#### 4. WorkflowVisualizer.tsx (Priority: MEDIUM)
- Lines 58, 297, 310, 342: `rounded-lg` → `rounded-none`

#### 5. Remaining Files (Priority: MEDIUM)
- DebateTimeline.tsx, NoteReferencePicker.tsx, etc.

---

## Dependencies

**Blocks:** None
**Blocked By:** None
**Related Stories:**
- CHAT-001 (Fix Chat Panel Layout) - Done
- CHAT-002 (Fix Multi-line Input) - Done

---

## Definition of Done

1. **Code Changes:** ✅
   - [x] All 47 radius violations fixed (including workflow subdirectory)
   - [x] Code follows 8-bit design standards
   - [x] No new technical debt introduced

2. **Testing:** ✅
   - [x] All existing tests pass (36/36 tests)
   - [x] Visual regression check performed
   - [x] TypeScript compilation succeeds

3. **Documentation:** ✅
   - [x] Story file updated with completion status
   - [x] Sprint status to be updated

4. **Code Review:** ✅
   - [x] Code review completed via feature-dev:code-reviewer agent
   - [x] Issues identified and fixed (typo: rounded-none-none, missed workflow components)

### Files Modified (16 total)

**Main chat components:**
1. ThreadManager.tsx - 11 violations fixed + typo fix
2. SuggestionChips.tsx - 4 violations fixed + spinner fix
3. WorkflowBuilder.tsx - 6 violations fixed
4. WorkflowVisualizer.tsx - 4 violations fixed + hover state fixes
5. WorkflowBuilder.refactored.tsx - 7 violations fixed
6. DebateTimeline.tsx - 2 violations fixed
7. RoutingDecision.tsx - 7 violations fixed (including rounded-full)
8. SequentialExpansionOptions.tsx - 3 violations fixed
9. NoteReferencePicker.tsx - 4 violations fixed
10. TimeoutWarning.tsx - 3 violations fixed
11. ToolProgressIndicator.tsx - 2 violations fixed
12. ImagePreviewDialog.tsx - 2 violations fixed
13. ChatBubble.tsx - 3 violations fixed + shadow fix
14. ApprovalOverlay.tsx - 4 violations fixed

**Workflow subdirectory:**
15. workflow/WorkflowTemplates.tsx - 1 violation fixed
16. workflow/WorkflowPalette.tsx - 1 violation fixed
17. workflow/WorkflowCanvas.tsx - 2 violations fixed

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Visual regression | Low | Medium | Manual testing before commit |
| Breaking changes | Low | Low | Pure CSS change, no logic |
| Test failures | Low | Low | Tests should be visual-only |

---

## Notes

- ChatConversation.tsx is the reference implementation for 8-bit styling
- Changes are purely visual (CSS classes) - no behavior changes expected
- Focus on `rounded-none` for maximum 8-bit aesthetic
- Test in all workspaces: IDE, Notes, Knowledge

---

**Story File:** `_bmad-output/sprint-artifacts/CHAT-003-fix-8bit-design-violations-2026-01-11.md`
