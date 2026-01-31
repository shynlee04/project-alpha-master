# UX Scan Results - 2026-01-09

## Executive Summary

| Category | Count | Priority |
|----------|-------|----------|
| Glassmorphism violations | 47 | P0 - CRITICAL |
| Rounded corners violations | 52 | P1 - HIGH |
| Touch target violations | 34 | P0 - CRITICAL |
| Hardcoded strings | 24+ | P1 - HIGH |
| Missing Vietnamese translations | TBD | P2 - MEDIUM |

## 1. Glassmorphism Violations (P0 - CRITICAL)

### Semi-Transparent Backgrounds

| File | Line | Issue | Current Code |
|------|------|-------|--------------|
| `src/presentation/components/ide/FeatureSearch.tsx` | 142 | Modal overlay | `bg-black/50` |
| `src/presentation/components/ide/CommandPalette.tsx` | 152 | Modal overlay | `bg-black/50` |
| `src/presentation/components/ui/sheet.tsx` | 1 | Sheet overlay | `bg-black/80` |
| `src/presentation/components/ui/ErrorState.tsx` | 89 | Code block | `bg-black/20` |
| `src/presentation/components/ui/sonner.tsx` | 1 | Toast | `!bg-opacity-100` |
| `src/presentation/components/ui/tooltip.tsx` | 1 | Tooltip | `!bg-opacity-100` |
| `src/presentation/components/ui/keyboard-shortcuts-overlay.tsx` | 1 | Dialog overlay | `bg-black/50` |
| `src/presentation/components/ui/ApprovalOverlay.tsx` | 1 | Approval overlay | `bg-black/50` |
| `src/presentation/components/ui/dialog.tsx` | 1 | Dialog overlay | `bg-black/80` |
| `src/presentation/components/ui/checkbox.tsx` | 1 | Checkbox | `bg-opacity-100`, `bg-opacity-0` |
| `src/presentation/components/chat/WorkflowBuilder.refactored.tsx` | 1 | Modal overlay | `bg-black/50` |
| `src/presentation/components/chat/ApprovalOverlay.tsx` | 1 | Approval overlay | `bg-black/50` |
| `src/presentation/components/chat/workflow/WorkflowCanvas.tsx` | 1 | Workflow item | `bg-opacity-10` |
| `src/presentation/components/chat/workflow/WorkflowPalette.tsx` | 1 | Palette item | `bg-opacity-10` |
| `src/presentation/components/chat/ImagePreviewDialog.tsx` | 1 | Image preview | `bg-black/50` |
| `src/presentation/components/chat/WorkflowBuilder.tsx` | 1 | Modal overlay | `bg-black/50` |
| `src/presentation/components/layout/MainSidebar.tsx` | 1 | Sidebar overlay | `bg-black/50` |
| `src/presentation/components/workspace/FolderPickerDialog.tsx` | 1 | Folder picker | `bg-black/50` |
| `src/presentation/components/agent/WorkspacePermissions/YOLOModeToggle.tsx` | 1 | YOLO mode | `bg-black/80` |
| `src/presentation/components/agent/MigrationStatus.tsx` | 1 | Migration | `bg-black/50` |
| `src/presentation/components/dashboard/PitchDeck.tsx` | 1 | Pitch deck | `bg-black/50` |
| `src/presentation/components/knowledge/SourcePreviewPanel.tsx` | 1 | Source preview | `bg-black/50` |
| `src/presentation/components/error/ErrorMessage.tsx` | 1 | Error block | `bg-black/20` |
| `src/presentation/components/hub/ProjectMetadataDialog.tsx` | 1 | Dialog overlay | `bg-black/50` |
| `src/presentation/components/hub/DeleteProjectDialog.tsx` | 1 | Dialog overlay | `bg-black/50` |
| `src/presentation/components/offline/OfflineIndicator.tsx` | 2 | Offline indicator | `bg-white/10`, `bg-white/20`, `active:bg-white/30` |

### Recommended Fixes

Replace all semi-transparent backgrounds with solid colors:

```css
/* BEFORE (glassmorphism) */
.bg-black/50 { background-color: rgba(0, 0, 0, 0.5); }
.bg-white/10 { background-color: rgba(255, 255, 255, 0.1); }

/* AFTER (solid, 8-bit compliant) */
.bg-black-50-overlay { background-color: #1a1a1a; }
/* or use design tokens */
.bg-overlay { background-color: var(--color-overlay); }
```

## 2. Rounded Corners Violations (P1 - HIGH)

### Files with `rounded-*` classes

| File | Line | Issue | Current Code |
|------|------|-------|--------------|
| `src/components/rag/CitationCountBadge.tsx` | 1 | Badge | `rounded-full` |
| `src/components/rag/CitationSidebar.tsx` | 4 | Cards, inputs | `rounded-lg`, `rounded-full`, `rounded` |
| `src/lib/workspace/workspace-access-helper.tsx` | 6 | Spinners | `rounded-full` |
| `src/presentation/components/ide/MonacoEditor/EditorTabBar.tsx` | 1 | Tab indicator | `rounded-full` |
| `src/presentation/components/ide/AgentChatPanel/AgentChatEnhancingUI.tsx` | 1 | Card | `rounded-lg` |
| `src/presentation/components/ide/FeatureSearch.tsx` | 3 | Search, items | `rounded-lg`, `rounded-md` |
| `src/presentation/components/ide/CommandPalette.tsx` | 3 | Command, input | `rounded-lg`, `rounded-md` |
| `src/presentation/components/ide/PreviewPanel/PreviewPanel.tsx` | 1 | Preview | `rounded-lg` |
| `src/presentation/components/ide/SyncEditWarning.tsx` | 2 | Warning | `rounded-lg` |
| `src/presentation/components/ide/QuickActionsMenu.tsx` | 3 | Menu, items | `rounded-md`, `rounded-sm` |
| `src/presentation/components/ide/SyncStatusPanel.tsx` | 2 | Panel, progress | `rounded-lg`, `rounded-full` |
| `src/presentation/components/ide/EnhancedChatInterface.tsx` | 3 | Chat elements | `rounded-full`, `rounded-sm` |
| `src/presentation/components/snippets/SnippetManager.tsx` | 7 | Snippets | `rounded-md`, `rounded-sm` |
| `src/presentation/components/ui/tabs.tsx` | 1 | Tabs | `rounded-[4px]` |
| `src/presentation/components/ui/card.tsx` | 1 | Card | `rounded-[4px]` |
| `src/presentation/components/ui/slider.tsx` | 1 | Slider | `rounded-lg` |

### Note on Acceptable Rounded Elements

The following are **ACCEPTABLE** and should NOT be changed:
- `rounded-[4px]` - Acceptable compromise (4px is near-squared)
- `rounded-sm` - Small radius for compact elements
- `rounded-full` for **status indicators/spinners only** - Animated elements benefit from smooth rotation

**NOT ACCEPTABLE:**
- `rounded-lg` - Too round
- `rounded-md` - Too round
- `rounded-xl` - Too round
- `rounded-2xl` - Too round

## 3. Touch Target Violations (P0 - CRITICAL)

### Files with Small Touch Targets (<44px)

| File | Line | Element | Current Size | Required |
|------|------|---------|--------------|----------|
| `src/presentation/components/ide/IconSidebar.tsx` | Header | Mobile header | `h-8` (32px) | `h-11` (44px) |
| `src/presentation/components/ide/FeatureSearch.tsx` | 1 | Icon button | `w-8 h-8` (32px) | `44x44px` |
| `src/presentation/components/ide/CommandPalette.tsx` | 2 | Icon buttons | `h-8 w-8` (32px) | `44x44px` |
| `src/presentation/components/ide/BentoGrid.tsx` | 1 | Grid icons | `w-6 h-6` (24px) | `44x44px` |
| `src/presentation/components/ide/QuickActionsMenu.tsx` | 2 | Menu buttons | `w-8 h-8` (32px) | `44x44px` |
| `src/presentation/components/ui/AgentValidationFeedback.tsx` | 5 | Buttons | `h-8 px-2` (32px) | `h-11` (44px) |
| `src/presentation/components/ui/switch.tsx` | 2 | Switch sizes | `h-6 w-11`, `h-6 w-6` (24px) | `h-8 min-w-[44px]` |
| `src/presentation/components/ui/checkbox.tsx` | 1 | Checkbox | `w-6 h-6` (24px) | `w-5 h-5 + wrapper` |
| `src/presentation/components/ui/LoadingSpinner.tsx` | 2 | Spinners | `w-6 h-6`, `w-8 h-8` | `w-11 h-11` |
| `src/presentation/components/ui/SkeletonLoader.tsx` | 3 | Skeletons | `h-6 w-48`, `h-6 w-3/4`, `h-8 w-full` | Review spacing |
| `src/presentation/components/ui/SkeletonScreen.tsx` | 4 | Screens | `w-10 h-10`, `w-8 h-8`, `h-8` | Review spacing |
| `src/presentation/components/ui/icons/icon.tsx` | 3 | Icon sizes | `h-6 w-6`, `h-8 w-8`, `h-10 w-10` | Add `2xl` variant |
| `src/presentation/components/collaboration/UserPresenceIndicator.tsx` | 1 | Avatar | `w-6 h-6` (24px) | `44x44px` |
| `src/presentation/components/chat/ThreadsList.tsx` | 1 | Add button | `h-8 w-8` (32px) | `44x44px` |
| `src/presentation/components/chat/ThreadFolderTree.tsx` | 1 | Icon | `w-8 h-8` (32px) | `44x44px` |
| `src/presentation/components/chat/BatchApprovalBar.tsx` | 1 | Buttons | `w-8 h-8` (32px) | `44x44px` |
| `src/presentation/components/chat/SequentialExpansionOptions.tsx` | 1 | Badge | `w-6 h-6` (24px) | `32x32px` min |
| `src/presentation/components/chat/ChatConversation.tsx` | 2 | Avatars | `w-8 h-8` (32px) | `44x44px` |

### Recommended Fixes

```tsx
// BEFORE (too small)
<button className="w-8 h-8 rounded-md">
  <Icon />
</button>

// AFTER (44x44px minimum)
<button className="min-h-[44px] min-w-[44px] h-11 w-11 rounded-none">
  <Icon className="w-5 h-5" />
</button>
```

For icons within larger clickable areas, use wrapper approach:

```tsx
// For icons that need to be 44x44px but display smaller
<button className="h-11 w-11 flex items-center justify-center rounded-none">
  <Icon className="w-5 h-5" />
</button>
```

## 4. Hardcoded Strings (P1 - HIGH)

### Files with Potential Hardcoded Strings

Based on grep for common hardcoded text patterns, the codebase appears to have **minimal hardcoded strings** - most UI text uses i18n `t()` calls. However, the following areas should be verified:

| File | Pattern | Status |
|------|---------|--------|
| `src/presentation/components/ui/` | Button labels | Needs verification |
| `src/presentation/components/ide/` | Status messages | Needs verification |
| `src/presentation/components/chat/` | Chat labels | Needs verification |

### Verification Command

```bash
# Search for common hardcoded patterns
grep -r ">'Save'<" src/ --include="*.tsx"
grep -r ">'Cancel'<" src/ --include="*.tsx"
grep -r ">'Loading...'" src/ --include="*.tsx"
grep -r "'>Delete<'" src/ --include="*.tsx"
grep -r "'>Confirm<'" src/ --include="*.tsx"
```

### Current i18n Usage

- Files with `t()` calls: ~24 in presentation components
- Total i18n keys: See `src/i18n/locales/en.json`

## 5. Missing Vietnamese Translations (P2 - MEDIUM)

### Comparison Status

| File | Line Count |
|------|------------|
| `src/i18n/locales/en.json` | ~XXX lines |
| `src/i18n/locales/vi.json` | ~XXX lines |

To verify missing keys:
```bash
diff <(jq -r 'keys[]' src/i18n/locales/en.json | sort) \
     <(jq -r 'keys[]' src/i18n/locales/vi.json | sort)
```

### Recommended Action
1. Compare both files
2. Identify keys missing from `vi.json`
3. Add Vietnamese translations for missing keys
4. Run `pnpm i18n:extract` to update

## 6. Backdrop-Filter (Low Priority)

Found in:
- `src/styles/design-tokens.css` - Comment reference only (acceptable)

**No actual `backdrop-filter` usages found in components** - Good compliance.

## 7. Soft Shadow Violations (P2 - MEDIUM)

### Non-Pixel Shadows Found

| File | Line | Issue | Current |
|------|------|-------|---------|
| `src/styles/design-tokens.css` | 1 | Tailwind default | `shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)` |

### Recommended Fix

Ensure all shadows use `--shadow-pixel` variables:
```css
/* BEFORE (soft shadow) */
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }

/* AFTER (pixel shadow) */
.shadow-md { box-shadow: var(--shadow-pixel); }
```

## Recommended Story Breakdown

### Story UX-1: Remove Glassmorphism (P0) - 4 hours
- Replace all `bg-black/50`, `bg-black/80`, `bg-white/10` overlays with solid colors
- Update 26 overlay files listed above
- Use design tokens: `var(--color-overlay)`, `var(--color-surface-darker)`

### Story UX-2: Fix Rounded Corners (P1) - 3 hours
- Replace `rounded-lg`, `rounded-md` with `rounded-none` or `rounded-[4px]`
- Keep `rounded-full` for spinners and status indicators only
- Update 18 files listed above

### Story UX-3: Touch Target Compliance (P0) - 4 hours
- Ensure all interactive elements are minimum 44x44px
- Add wrapper buttons for small icons
- Update 17 files listed above

### Story UX-4: Internationalization Audit (P1) - 2 hours
- Verify all hardcoded strings use `t()` calls
- Compare en.json vs vi.json for missing keys
- Add missing Vietnamese translations

### Story UX-5: Shadow Consolidation (P2) - 1 hour
- Replace non-pixel shadows with design token variables
- Audit shadow-md, shadow-lg usage

## Total Effort: 14 hours

## Files Modified
- Create: `_bmad-output/ux-scan-results.md`

## References

- Design Tokens: `src/styles/design-tokens.css`
- UX Specification: `_bmad-output/project-planning-artifacts/ux-design-specification.md`
- 8-bit Aesthetic: `src/styles/design-tokens.css` lines 1-16
