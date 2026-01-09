# Story UX-2: Fix Rounded Corners

**Epic:** EPIC-UX: System-Wide UX Remediation
**Status:** drafted
**Priority:** P1 - High
**Points:** 6
**Estimated:** 3 hours
**Created:** 2026-01-09
**Source:** `_bmad-output/ux-scan-results.md`

---

## User Story

As a user,
I want consistently squared corners throughout the application,
So that the 8-bit aesthetic is maintained and matches the design specification.

---

## Problem Statement

The codebase contains **52 rounded corners violations** using `rounded-lg`, `rounded-md`, `rounded-xl` on containers and interactive elements. The design specification requires `--radius: 0rem` (squared corners) for the 8-bit aesthetic.

---

## Context

- **Reference:** `_bmad-output/ux-scan-results.md` (Section 2)
- **Design Tokens:** `src/styles/design-tokens.css`
- **Requirement:** `--radius: 0rem` (squared corners)
- **Files Affected:** 18 files across presentation components

---

## Acceptance Criteria

### AC-1: Replace Large Rounded Corners ✅
- [ ] `src/components/rag/CitationSidebar.tsx` - Replace `rounded-lg` with `rounded-none`
- [ ] `src/presentation/components/ide/AgentChatPanel/AgentChatEnhancingUI.tsx` - Replace `rounded-lg`
- [ ] `src/presentation/components/ide/FeatureSearch.tsx` - Replace `rounded-lg`, `rounded-md`
- [ ] `src/presentation/components/ide/CommandPalette.tsx` - Replace `rounded-lg`, `rounded-md`
- [ ] `src/presentation/components/ide/PreviewPanel/PreviewPanel.tsx` - Replace `rounded-lg`

### AC-2: Replace Medium Rounded Corners ✅
- [ ] `src/presentation/components/ide/SyncEditWarning.tsx` - Replace `rounded-lg`
- [ ] `src/presentation/components/ide/QuickActionsMenu.tsx` - Replace `rounded-md`, `rounded-sm`
- [ ] `src/presentation/components/ide/SyncStatusPanel.tsx` - Replace `rounded-lg`
- [ ] `src/presentation/components/snippets/SnippetManager.tsx` - Replace `rounded-md`, `rounded-sm`
- [ ] `src/presentation/components/ui/slider.tsx` - Replace `rounded-lg`

### AC-3: Replace Badge/Tag Rounded Corners ✅
- [ ] `src/components/rag/CitationCountBadge.tsx` - Replace `rounded-full` (keep for badges only)
- [ ] `src/components/rag/CitationSidebar.tsx` - Replace `rounded-full` (keep for badges only)
- [ ] `src/presentation/components/ide/MonacoEditor/EditorTabBar.tsx` - Replace `rounded-full` (keep for indicators)
- [ ] `src/presentation/components/ide/EnhancedChatInterface.tsx` - Replace `rounded-full` (keep for avatars only)
- [ ] `src/presentation/components/ide/SyncStatusPanel.tsx` - Replace `rounded-full` (keep for progress)

### AC-4: UI Component Updates ✅
- [ ] `src/presentation/components/ui/tabs.tsx` - Replace `rounded-[4px]` (acceptable - keep)
- [ ] `src/presentation/components/ui/card.tsx` - Replace `rounded-[4px]` (acceptable - keep)
- [ ] `src/lib/workspace/workspace-access-helper.tsx` - Replace `rounded-full` (keep for spinners)

### AC-5: Design Token Verification ✅
- [ ] Verify `--radius: 0rem` is set in design-tokens.css
- [ ] Verify `--radius-sm` or `--radius-[4px]` available for acceptable cases
- [ ] Document exceptions (spinners, badges, status indicators)

### AC-6: Validation ✅
- [ ] Build passes without errors
- [ ] No prohibited rounded classes remain (rounded-lg, rounded-md, rounded-xl)
- [ ] All containers and interactive elements have squared corners
- [ ] Spinners, badges, and status indicators keep `rounded-full` (acceptable)

---

## Tasks

### Task 1: Audit Design Tokens (15 min)
- [ ] Verify `--radius: 0rem` in design-tokens.css
- [ ] Identify acceptable exceptions (spinners, badges, indicators)
- [ ] Document in comments

### Task 2: Replace Large Rounded Corners (45 min)
- [ ] Update CitationSidebar.tsx
- [ ] Update AgentChatEnhancingUI.tsx
- [ ] Update FeatureSearch.tsx
- [ ] Update CommandPalette.tsx
- [ ] Update PreviewPanel.tsx

### Task 3: Replace Medium Rounded Corners (45 min)
- [ ] Update SyncEditWarning.tsx
- [ ] Update QuickActionsMenu.tsx
- [ ] Update SyncStatusPanel.tsx
- [ ] Update SnippetManager.tsx
- [ ] Update slider.tsx

### Task 4: Replace Badge/Tag Corners (30 min)
- [ ] Update CitationCountBadge.tsx (keep rounded-full for badges)
- [ ] Update CitationSidebar.tsx badges (keep rounded-full)
- [ ] Update EditorTabBar.tsx (keep rounded-full for indicators)
- [ ] Update EnhancedChatInterface.tsx avatars (keep rounded-full)
- [ ] Update SyncStatusPanel.tsx progress (keep rounded-full)

### Task 5: Validation (45 min)
- [ ] Run `pnpm build` to verify no errors
- [ ] Search for remaining prohibited rounded patterns
- [ ] Verify visual consistency

---

## Technical Notes

### Replacement Pattern
```tsx
// BEFORE (rounded)
<div className="rounded-lg border ...">

// AFTER (squared)
<div className="rounded-none border ...">
// or use design token
<div className="border border-border ...">
```

### Acceptable Exceptions (Keep `rounded-full`)
- Spinner loaders (animation requires smooth rotation)
- Avatar images (circular is standard)
- Status indicators (dots, badges)
- Progress bars (pill shape)

### Unacceptable (Must Replace)
- Container cards
- Buttons
- Inputs
- Dialogs/modals
- Sidebar items
- Menu items

---

## Dev Notes

**Reference:** `_bmad-output/project-planning-artifacts/architecture.md`

### Architecture Patterns
- Follow the **8-bit aesthetic** patterns (squared corners, no rounded-lg/md)
- Use `--radius: 0rem` as base radius
- Keep `rounded-full` only for spinners, badges, and circular indicators

### Component Patterns
- Replace `rounded-lg`, `rounded-md` with `rounded-none`
- Use `rounded-[4px]` as acceptable compromise for some components
- Ensure visual hierarchy is maintained after radius changes

---

## Research Requirements

- [ ] Review design-tokens.css for radius configuration
- Check shadcn/ui card/button radius implementations

---

## Dependencies

- None - can be done independently

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Visual regression | Medium | Take before/after screenshots |
| Inconsistent radius | Low | Use design tokens consistently |

---

## Definition of Done

- [ ] All prohibited rounded classes replaced (rounded-lg, rounded-md, rounded-xl)
- [ ] Acceptable exceptions documented (spinners, badges, indicators)
- [ ] Build passes without errors
- [ ] Visual testing confirms squared aesthetic
- [ ] Story file updated with completion timestamp

---

## Files Modified

- 18 component files - Replace rounded classes with squared

---

## Notes

- `rounded-[4px]` is acceptable as a compromise (near-squared)
- `rounded-sm` is acceptable for very small elements
- Always keep `rounded-full` for spinners and circular elements

---

**Created:** 2026-01-09  
**Last Updated:** 2026-01-09
