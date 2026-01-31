# UX/UI Implementation Roadmap

**Version**: 1.0.0
**Date**: 2026-01-27
**Author**: architect-ext (Team A)
**Task ID**: PH2-T2E
**Status**: APPROVED

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Total Phases** | 6 |
| **Estimated Total Effort** | 45-65 hours |
| **Team Assignment** | Team A (complex/coordination), Team B (simpler/parallel) |
| **Critical Blockers** | 8 DO NOT DISTURB files |
| **God Components** | 55 total (5 critical P0) |
| **UX Spec Version** | 3.0.0 (15 sections) |

### Phase Summary

| Phase | Name | Risk | Effort | Team | Status |
|-------|------|------|--------|------|--------|
| 1 | Foundation | 🟢 LOW | 4-6h | B | READY |
| 2 | UI Primitives | 🟢 LOW | 8-12h | B | READY |
| 3 | Common Components | 🟡 MEDIUM | 6-8h | B | READY |
| 4 | Feature Components | 🟡 MEDIUM | 10-15h | A+B | READY (after CC-04) |
| 5 | Global Components | 🔴 HIGH | 8-12h | A | BLOCKED (CC-AR-04) |
| 6 | God Component Splitting | 🔴 HIGH | 10-15h | A+B | POST-MVP |

---

## DO NOT DISTURB Summary (Quick Reference)

### 🔴 CRITICAL - NEVER TOUCH (Backend Active)

| File | Reason | Owner | ETA |
|------|--------|-------|-----|
| `src/infrastructure/context/project-context.tsx` | FSA Handle Lifecycle | Team A | CC-04 pending |
| `src/routes/$projectId.tsx` | Route FSA integration | Team A | CC-04 pending |
| `src/presentation/components/layout/PermissionOverlay.tsx` | Permission persistence | Team A | CC-04 pending |
| `src/infrastructure/context/plugin-coordination-context.tsx` | EPIC-0.6 Complete | Team A | STABLE |
| `src/infrastructure/events/file-event-bus.ts` | File event infrastructure | Team B | Stabilizing |
| `src/infrastructure/webcontainer/*.ts` | WebContainer integration | Team B | Active |

### 🟡 COORDINATE FIRST

| File | Reason | Contact |
|------|--------|---------|
| `src/presentation/layouts/PluginLayout.tsx` | CC-AR-08 blocked on CC-AR-04 | Team B |
| `src/presentation/layouts/PluginLayoutStore.ts` | Store hydration active | Team B |
| `src/plugins/monaco/MonacoPlugin.tsx` | Monaco integration | Team B |
| `src/lib/i18n/locales/*.json` | i18n keys being added | Team A |

---

## Phase 1: Foundation (No Code Risk)

**Status**: 🟢 READY
**Effort**: 4-6 hours
**Risk**: LOW
**Team**: B (independent work)
**Dependencies**: None

### Objective

Implement design tokens and CSS foundation from UX Specification v3.0.0. Pure CSS work with zero React component risk.

### Stories

| ID | Title | Files | Effort | Priority | Depends On |
|----|-------|-------|--------|----------|------------|
| UX-F01 | Implement Color Token Variables | `src/styles.css` | 1h | P0 | - |
| UX-F02 | Implement Typography Token Variables | `src/styles.css` | 0.5h | P0 | UX-F01 |
| UX-F03 | Implement Spacing Token Variables | `src/styles.css` | 0.5h | P0 | UX-F01 |
| UX-F04 | Implement Shadow Token Variables (8-bit) | `src/styles.css` | 0.5h | P0 | UX-F01 |
| UX-F05 | Implement Animation Token Variables | `src/styles.css` | 1h | P0 | UX-F01 |
| UX-F06 | Implement Z-Index Scale | `src/styles.css` | 0.5h | P1 | UX-F01 |
| UX-F07 | Light Theme Token Overrides | `src/styles/light-theme.css` | 1h | P1 | UX-F01 |

### Files to Create/Modify

```
src/styles.css                    # ADD: All token variables
src/styles/light-theme.css        # CREATE: Light theme overrides
tailwind.config.ts                # UPDATE: Reference new tokens
```

### Token Implementation Reference

From UX Spec Section 03:
- Colors: Primary orange (#f97316), Stone/Zinc neutrals
- Typography: JetBrains Mono (UI), VT323 (pixel), Inter (prose)
- Spacing: 4px grid system
- Shadows: `4px 4px 0 0` only (no blur)
- Animations: `steps(5, end)` timing
- Z-Index: 12-tier scale (0-100)

### Acceptance Criteria

- [ ] All CSS variables from `03-design-tokens.md` implemented
- [ ] Light theme CSS variables override dark defaults
- [ ] Tailwind config references CSS variables
- [ ] No TypeScript changes required
- [ ] No component changes required
- [ ] `pnpm build` passes (CSS only validation)

---

## Phase 2: UI Primitives (Low Risk)

**Status**: 🟢 READY
**Effort**: 8-12 hours
**Risk**: LOW
**Team**: B (parallel work)
**Dependencies**: Phase 1 complete

### Objective

Update ShadcnUI components in `src/presentation/components/ui/` to comply with 8-bit design system.

### Stories

| ID | Title | Files | Effort | Priority | Depends On |
|----|-------|-------|--------|----------|------------|
| UX-P01 | Update Button 8-bit Styling | `ui/button.tsx` | 1h | P0 | Phase 1 |
| UX-P02 | Update Card 8-bit Styling | `ui/card.tsx` | 0.5h | P0 | Phase 1 |
| UX-P03 | Update Dialog 8-bit Styling | `ui/dialog.tsx` | 1h | P0 | Phase 1 |
| UX-P04 | Update Input/Textarea 8-bit | `ui/input.tsx`, `ui/textarea.tsx` | 1h | P0 | Phase 1 |
| UX-P05 | Update Select 8-bit Styling | `ui/select.tsx` | 0.5h | P0 | Phase 1 |
| UX-P06 | Update Tabs 8-bit Styling | `ui/tabs.tsx` | 0.5h | P0 | Phase 1 |
| UX-P07 | Update Badge 8-bit Styling | `ui/badge.tsx` | 0.5h | P1 | Phase 1 |
| UX-P08 | Update Tooltip 8-bit Styling | `ui/tooltip.tsx` | 0.5h | P1 | Phase 1 |
| UX-P09 | Update Popover 8-bit Styling | `ui/popover.tsx` | 0.5h | P1 | Phase 1 |
| UX-P10 | Update Dropdown 8-bit Styling | `ui/dropdown-menu.tsx` | 1h | P1 | Phase 1 |
| UX-P11 | Update Toast 8-bit Styling | `ui/Toast/*.tsx` | 1h | P1 | Phase 1 |
| UX-P12 | Add Animation Utilities | `ui/animations.tsx` | 1.5h | P1 | UX-F05 |
| UX-P13 | Split resizable.tsx (763 lines) | `ui/resizable*.tsx` | 2h | P1 | - |

### 8-bit Style Checklist (per component)

```
[ ] border-radius: 0 or 2px max
[ ] box-shadow: 4px 4px 0 0 (pixel shadow)
[ ] No gradients, no blur
[ ] Colors from CSS variables
[ ] Animation: steps(N, end)
[ ] Focus ring: 2px solid var(--primary)
```

### Import Impact Analysis

| Component | Import Count | Change Risk |
|-----------|--------------|-------------|
| `button.tsx` | 160+ | 🟡 TEST THOROUGHLY |
| `dialog.tsx` | 100+ | 🟡 TEST THOROUGHLY |
| `select.tsx` | 80+ | 🟡 TEST THOROUGHLY |
| `tabs.tsx` | 70+ | 🟢 STANDARD |
| `card.tsx` | 65+ | 🟢 STANDARD |

### Acceptance Criteria

- [ ] All primitives pass VALIDATION-CHECKLIST.md
- [ ] No hardcoded colors (use CSS variables)
- [ ] No border-radius > 2px
- [ ] All animations use steps() timing
- [ ] resizable.tsx split into 3 focused files (< 300 lines each)
- [ ] Responsive at 320px, 768px, 1280px
- [ ] `pnpm tsc --noEmit && pnpm vitest run` passes

---

## Phase 3: Common Components (Medium Risk)

**Status**: 🟢 READY
**Effort**: 6-8 hours
**Risk**: MEDIUM
**Team**: B
**Dependencies**: Phase 2 complete

### Objective

Update shared components in `src/presentation/components/common/` with new design tokens and responsive improvements.

### Stories

| ID | Title | Files | Effort | Priority | Depends On |
|----|-------|-------|--------|----------|------------|
| UX-C01 | Update ErrorBoundary Styling | `common/ErrorBoundary.tsx`, `common/ErrorFallback.tsx` | 1h | P0 | Phase 2 |
| UX-C02 | Update AppErrorBoundary | `common/AppErrorBoundary.tsx` | 0.5h | P0 | UX-C01 |
| UX-C03 | Update PluginFallback 8-bit | `common/PluginFallback.tsx` | 0.5h | P1 | Phase 2 |
| UX-C04 | Update WorkspaceSwitcher | `common/WorkspaceSwitcher.tsx` | 1h | P1 | Phase 2 |
| UX-C05 | Update DatabaseRecoveryDialog | `common/DatabaseRecoveryDialog.tsx` | 1h | P1 | Phase 2 |
| UX-C06 | i18n Audit Common Components | All `common/*.tsx` | 1h | P0 | - |
| UX-C07 | Add Loading States (8-bit) | `common/LoadingStates.tsx` | 1.5h | P1 | UX-F05 |
| UX-C08 | Add Skeleton Variants | `ui/SkeletonScreen.tsx` (508 lines) | 1.5h | P1 | Phase 2 |

### Safe Zone Confirmation

All files in `src/presentation/components/common/` are:
- ✅ NOT under active backend development
- ✅ NOT in DO NOT DISTURB list
- ✅ Safe for parallel work

### Acceptance Criteria

- [ ] All common components pass VALIDATION-CHECKLIST.md
- [ ] No hardcoded text (all through t() function)
- [ ] Vietnamese strings tested (longer text handling)
- [ ] Touch targets >= 44px on mobile
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus states visible

---

## Phase 4: Feature Components (Higher Risk - Needs Coordination)

**Status**: 🟢 READY (after CC-04 complete)
**Effort**: 10-15 hours
**Risk**: MEDIUM
**Team**: A (notes), B (chat)
**Dependencies**: Phase 3, CC-04 E2E validation complete

### Objective

Update workspace-specific components while avoiding backend-active areas.

### 4A: Notes Workspace (Team A)

| ID | Title | Files | Effort | Priority | Risk |
|----|-------|-------|--------|----------|------|
| UX-N01 | Update NotesPage Layout | `notes/NotesPage.tsx` (1102 lines) | 2h | P0 | 🟡 GOD COMPONENT |
| UX-N02 | Update NoteEditor 8-bit | `notes/NoteEditor.tsx` (1353 lines) | 2h | P0 | 🟡 GOD COMPONENT |
| UX-N03 | Update Block Components | `notes/blocks/*.tsx` | 3h | P1 | 🟢 STANDARD |
| UX-N04 | Update AISlashCommand UI | `notes/AISlashCommand.tsx` (1674 lines) | 2h | P0 | 🔴 GOD COMPONENT |

### 4B: Chat Workspace (Team B)

| ID | Title | Files | Effort | Priority | Risk |
|----|-------|-------|--------|----------|------|
| UX-CH01 | Update UnifiedChatPanel | `chat/UnifiedChatPanel.tsx` | 1h | P0 | 🟢 STANDARD |
| UX-CH02 | Update ChatHistory 8-bit | `chat/ChatHistory.tsx` (454 lines) | 1h | P1 | 🟢 STANDARD |
| UX-CH03 | Update ChatBubble 8-bit | `chat/ChatBubble.tsx` | 0.5h | P1 | 🟢 STANDARD |
| UX-CH04 | Update CodeBlock 8-bit | `chat/CodeBlock.tsx` (465 lines) | 1h | P1 | 🟢 STANDARD |
| UX-CH05 | Update DiffPreview 8-bit | `chat/DiffPreview.tsx` (432 lines) | 1h | P1 | 🟢 STANDARD |

### 4C: Settings (Team B)

| ID | Title | Files | Effort | Priority | Risk |
|----|-------|-------|--------|----------|------|
| UX-S01 | Update Settings Page | `routes/settings.tsx` (532 lines) | 2h | P1 | 🟡 LARGE |

### ⚠️ SKIP - Plugin-Related (Backend Active)

| File | Reason |
|------|--------|
| `plugins/monaco/MonacoPlugin.tsx` | Team B active |
| `plugins/preview/PreviewPlugin.tsx` | Team B active |
| `plugins/terminal/TerminalPlugin.tsx` | WebContainer integration |
| Any file in `src/plugins/` | Plugin coordination active |

### Acceptance Criteria

- [ ] All feature components pass VALIDATION-CHECKLIST.md
- [ ] God components have TODO markers for Phase 6 split
- [ ] Mobile responsive at 320px (Notes collapses to single panel)
- [ ] i18n complete for all user-facing text
- [ ] No modifications to plugin-related files

---

## Phase 5: Global Components (Highest Risk - Sequential)

**Status**: 🔴 BLOCKED (waiting on CC-AR-04)
**Effort**: 8-12 hours
**Risk**: HIGH
**Team**: A (coordinate with Team B)
**Dependencies**: Phase 4, CC-AR-04 (Toggle Layout) complete

### Objective

Update global layout components with coordination to avoid conflicts with CC-AR-04.

### Stories

| ID | Title | Files | Effort | Priority | Blocked By |
|----|-------|-------|--------|----------|------------|
| UX-G01 | Update GlobalHeader | `layout/GlobalHeader.tsx` (331 lines) | 2h | P0 | CC-AR-04 |
| UX-G02 | Update MainSidebar | `layout/MainSidebar.tsx` (403 lines) | 2h | P0 | CC-AR-04 |
| UX-G03 | Update SystemRail | `layout/SystemRail.tsx` (265 lines) | 1.5h | P0 | - |
| UX-G04 | Update Breadcrumbs | `layout/Breadcrumbs.tsx` (237 lines) | 1h | P1 | - |
| UX-G05 | Update ProjectAwareLayout | `layout/ProjectAwareLayout.tsx` (116 lines) | 1h | P0 | CC-AR-04 |
| UX-G06 | Update MainLayout | `layout/MainLayout.tsx` (84 lines) | 0.5h | P0 | - |
| UX-G07 | Update MobileBottomNav | `layout/MobileBottomNav.tsx` (218 lines) | 1h | P1 | - |
| UX-G08 | Update MobileIDELayout | `layout/MobileIDELayout.tsx` (331 lines) | 1.5h | P1 | - |

### ❌ SKIP - PluginLayout (Backend Blocked)

| File | Reason | ETA |
|------|--------|-----|
| `layouts/PluginLayout.tsx` | CC-AR-08 blocked on CC-AR-04 | After CC-AR-04 |
| `layouts/PluginLayoutStore.ts` | Store hydration active | Stabilizing |
| `layouts/DraggableBentoCell.tsx` | Will be removed by CC-AR-04 | Deprecated |

### Coordination Points

| UX Task | Backend Task | Sync Required |
|---------|--------------|---------------|
| UX-G01 (GlobalHeader) | CC-AR-02 (platform-defaults) | ✅ Before UX work |
| UX-G05 (ProjectAwareLayout) | CC-AR-04 (Toggle Layout) | ✅ After CC-AR-04 |
| UX-G02 (MainSidebar) | CC-AR-04 (Toggle Layout) | ✅ After CC-AR-04 |

### Acceptance Criteria

- [ ] All global components pass VALIDATION-CHECKLIST.md
- [ ] Responsive behavior matches UX spec section 05
- [ ] Sidebar collapse/expand works at all breakpoints
- [ ] Mobile drawer overlay works correctly
- [ ] Keyboard shortcuts work (Cmd+B toggle, Escape close)

---

## Phase 6: God Component Splitting (Post-MVP)

**Status**: ⏳ POST-MVP
**Effort**: 10-15 hours
**Risk**: HIGH
**Team**: A+B (coordinated)
**Dependencies**: All previous phases complete

### Objective

Split components exceeding 300 lines into focused, maintainable modules.

### Priority Order (by line count)

| Priority | Component | Lines | Split Strategy | Team |
|----------|-----------|-------|----------------|------|
| P0 | `notes/AISlashCommand.tsx` | 1674 | Extract 5 sub-components | A |
| P0 | `notes/NoteEditor.tsx` | 1353 | Extract toolbar, blocks, hooks | A |
| P0 | `notes/NotesPage.tsx` | 1102 | Extract panels, modals, sidebars | A |
| P0 | `ide/MonacoEditor.tsx` | 772 | Extract handlers, decorations | B |
| P1 | `ui/resizable.tsx` | 763 | Extract Panel, Handle, Group | B |
| P1 | `notes/blocks/MultiStepGenerationBlock.tsx` | 700 | Extract step components | A |
| P1 | `ide/AgentChatPanel.tsx` | 691 | Already partial, complete it | B |
| P1 | `notes/blocks/ArtifactGalleryBlock.tsx` | 684 | Extract item, filters | A |

### Split Strategy Template

```
God Component (>500 lines)
├── /ComponentName/
│   ├── index.tsx           # Re-exports (facade)
│   ├── ComponentName.tsx   # Main component (<300 lines)
│   ├── useComponentHooks.ts # Extracted hooks
│   ├── ComponentPart1.tsx  # Sub-component 1
│   ├── ComponentPart2.tsx  # Sub-component 2
│   └── types.ts            # Shared types
```

### Acceptance Criteria

- [ ] All split files < 300 lines
- [ ] No breaking changes to public API
- [ ] All imports still work (facade pattern)
- [ ] Test coverage maintained
- [ ] `pnpm tsc --noEmit && pnpm vitest run` passes

---

## Coordination Matrix

### UX Task ↔ Backend Task Dependencies

| UX Task | Backend Task | Sync Type | Notes |
|---------|--------------|-----------|-------|
| Phase 1-3 | None | ✅ Independent | Safe parallel work |
| UX-N01/02/04 | CC-04 E2E | ⏳ Wait | Start after CC-04 passes |
| UX-G01 | CC-AR-02 | 🔄 Coordinate | Platform defaults must be wired |
| UX-G02/05 | CC-AR-04 | 🛑 Blocked | Toggle layout changes structure |
| Phase 6 | CC-AR-08 | 🛑 Blocked | PluginLayout must be split first |

### Team Assignment Summary

| Team | Phases | Focus Areas |
|------|--------|-------------|
| **Team B** | 1, 2, 3, 4B | Foundation, primitives, chat |
| **Team A** | 4A, 5, 6 | Notes, global layout, splitting |
| **Both** | 6 | God component splitting |

---

## Risk Matrix

| Risk | Probability | Impact | Mitigation | Owner |
|------|-------------|--------|------------|-------|
| CC-AR-04 delayed | Medium | High | Start with unblocked phases (1-3) | Team A |
| God component regressions | Medium | Medium | Comprehensive tests before split | Both |
| i18n string truncation | Low | Low | Test with Vietnamese strings | Team B |
| Mobile breakpoint issues | Medium | Medium | Test at 320px, 768px, 1280px | Both |
| Color contrast failures | Low | Medium | Use Chrome DevTools contrast checker | Both |
| Animation performance | Low | Low | Only animate transform/opacity | Both |
| Light theme contrast | Medium | Medium | Test all components in light mode | Both |

---

## Progress Tracking

### Weekly Milestones

| Week | Target | Effort | Status |
|------|--------|--------|--------|
| 1 | Phase 1 + Phase 2 (P0) | 10h | ⏳ |
| 2 | Phase 2 (P1) + Phase 3 | 10h | ⏳ |
| 3 | Phase 4 (if CC-04 done) | 12h | ⏳ |
| 4 | Phase 5 (if CC-AR-04 done) | 10h | ⏳ |
| 5+ | Phase 6 | 12h | ⏳ |

### Definition of Done (Per Phase)

- [ ] All stories in phase complete
- [ ] VALIDATION-CHECKLIST.md passes for all components
- [ ] `pnpm tsc --noEmit` = 0 errors
- [ ] `pnpm vitest run` = 0 failures
- [ ] Responsive tested at 3 breakpoints
- [ ] i18n tested with Vietnamese
- [ ] Accessibility audit passes

---

## Appendix: File Quick Reference

### Safe Zones (Green Light)

```
✅ src/styles.css
✅ src/styles/*.css
✅ src/presentation/components/ui/*.tsx
✅ src/presentation/components/common/*.tsx
✅ src/presentation/components/notes/*.tsx (except during CC-04)
✅ src/presentation/components/chat/*.tsx
✅ src/presentation/components/sidebar/*.tsx
✅ src/presentation/components/header/*.tsx
✅ src/presentation/hooks/*.ts
```

### Caution Zones (Yellow Light)

```
⚠️ src/presentation/layouts/PluginLayout.tsx (CC-AR-08 blocked)
⚠️ src/presentation/components/layout/*.tsx (coordinate first)
⚠️ src/lib/i18n/locales/*.json (Team A adding keys)
```

### No-Go Zones (Red Light)

```
❌ src/infrastructure/context/project-context.tsx
❌ src/routes/$projectId.tsx
❌ src/presentation/components/layout/PermissionOverlay.tsx
❌ src/infrastructure/context/plugin-coordination-context.tsx
❌ src/infrastructure/events/file-event-bus.ts
❌ src/infrastructure/webcontainer/*.ts
❌ src/plugins/monaco/MonacoPlugin.tsx
❌ src/plugins/preview/PreviewPlugin.tsx
```

---

## References

| Document | Path |
|----------|------|
| UX Specification Index | `_bmad-output/planning-artifacts/ux-specification/index.md` |
| Design Tokens | `_bmad-output/planning-artifacts/ux-specification/03-design-tokens.md` |
| Global Components | `_bmad-output/planning-artifacts/ux-specification/05-global-components.md` |
| Validation Checklist | `_bmad-output/planning-artifacts/ux-specification/VALIDATION-CHECKLIST.md` |
| Light Theming | `_bmad-output/planning-artifacts/ux-specification/14-light-theming.md` |
| Micro Animations | `_bmad-output/planning-artifacts/ux-specification/15-micro-animations.md` |
| Component Hierarchy | `_bmad-output/analysis/component-hierarchy-map-2026-01-27.md` |
| DO NOT DISTURB | `_bmad-output/analysis/do-not-disturb-zones-2026-01-27.md` |
| Workflow Analysis | `_bmad-output/analysis/workflow-sprint-analysis-2026-01-27.md` |
| EPIC Lineage | `_bmad-output/analysis/epic-lineage-analysis-2026-01-27.md` |

---

**Document Created**: 2026-01-27
**Author**: architect-ext (Team A)
**Validation**: Cross-referenced with 5 analysis reports + UX spec v3.0.0
**Lines**: ~550
