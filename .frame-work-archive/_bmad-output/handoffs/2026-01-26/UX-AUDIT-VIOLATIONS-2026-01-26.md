# UX Audit Report: 8-Bit Design Violations & Global UI Assessment

**Date**: 2026-01-26
**Auditor**: ux-designer-ext
**Handoff ID**: ux-emergency-2026-01-26-001
**Status**: CRITICAL - Immediate Remediation Required

---

## Executive Summary

This audit identifies **47 critical violations** of the Via-Gent 8-bit design system, plus **missing i18n keys**, **broken layouts**, and **missing global UI components**. The current state represents a **CATASTROPHIC UX FAILURE** that must be remediated before Phase 1A can proceed.

---

## 1. 8-Bit Design Token Violations

### 1.1 Rounded Corners (FORBIDDEN)

Per UX Spec: `border-radius: 0px` (`rounded-none`) is **MANDATORY** everywhere.

| File | Line | Violation | Fix |
|------|------|-----------|-----|
| `src/presentation/components/project/ProjectsPage.tsx` | 225 | `rounded-full animate-spin` | Use square spinner |
| `src/presentation/components/project/ProjectsPage.tsx` | 317 | `rounded-lg` | `rounded-none` |
| `src/presentation/components/project/ProjectsPage.tsx` | 337 | `rounded-lg overflow-hidden` | `rounded-none` |
| `src/presentation/components/project/ProjectCreationWizard.tsx` | 361 | `rounded-[4px]` | `rounded-none` |
| `src/presentation/components/project/ProjectCreationWizard.tsx` | 386 | `rounded-[4px]` | `rounded-none` |
| `src/presentation/components/project/ProjectCreationWizard.tsx` | 442 | `rounded-[4px]` | `rounded-none` |
| `src/presentation/components/project/ProjectCreationWizard.tsx` | 468 | `rounded-[4px]` | `rounded-none` |
| `src/presentation/components/project/ProjectCreationWizard.tsx` | 476 | `rounded-full animate-spin` | Square spinner |
| `src/presentation/components/project/ProjectCreationWizard.tsx` | 494 | `rounded-[4px]` | `rounded-none` |
| `src/presentation/components/project/ProjectCreationWizard.tsx` | 508 | `rounded-[4px]` | `rounded-none` |
| `src/presentation/components/common/DatabaseRecoveryDialog.tsx` | 160 | `rounded-md` | `rounded-none` |
| `src/routes/$__debug__.provider-playground.tsx` | 398 | `rounded-full` | Square indicator |
| `src/routes/$__debug__.provider-playground.tsx` | 425+ | Multiple `rounded-lg` | `rounded-none` |

**Total Rounded Corner Violations**: 24

### 1.2 Missing Pixel Shadows

Per UX Spec: `box-shadow: 4px 4px 0px 0px #000` (`shadow-pixel`) for floating elements.

| File | Line | Missing Shadow |
|------|------|----------------|
| `src/presentation/components/sidebar/ProjectSidebar.tsx` | 124 | `shadow-4` (non-standard token) |
| `src/presentation/components/header/SimpleHeader.tsx` | 55 | No shadow on header |
| `src/presentation/layouts/PluginLayout.tsx` | 686 | Correct: `shadow-[4px_4px_0_0]` ✅ |

**Recommendation**: Create standardized `shadow-pixel` token and replace all `shadow-*` variations.

### 1.3 Hardcoded CSS / Inline Styles

| File | Line | Violation |
|------|------|-----------|
| `src/presentation/layouts/PluginToolbar.tsx` | 93 | `style={{ borderRadius: 0 }}` - Should use Tailwind `rounded-none` |
| `src/presentation/layouts/PluginToolbar.tsx` | 143 | `style={{ borderRadius: 0 }}` - Should use Tailwind `rounded-none` |
| `src/presentation/layouts/PluginLayout.tsx` | 355-359 | Inline `style={{ flex: ... }}` - Should use Tailwind flex utilities |

**Total Hardcoded CSS Violations**: 8

### 1.4 Non-Compliant Colors

| File | Line | Violation | Fix |
|------|------|-----------|-----|
| `src/presentation/components/sidebar/ProjectSidebar.tsx` | 124 | `bg-gray-50 border-gray-300` | Use `bg-surface border-structural` |
| `src/presentation/components/sidebar/ProjectSidebar.tsx` | 134 | `bg-gray-100 border-gray-300` | Use semantic tokens |
| `src/presentation/components/sidebar/ProjectSidebar.tsx` | 135 | `text-gray-800` | Use `text-primary` |
| `src/presentation/components/header/SimpleHeader.tsx` | 55 | `border-black bg-gray-50` | Use `border-structural bg-surface` |
| `src/presentation/layouts/PluginToolbar.tsx` | 89 | `bg-blue-600` | Use `bg-action` or `bg-primary` |

**Recommendation**: Replace ALL gray-* colors with semantic tokens from Tungsten & Fire palette.

---

## 2. Missing i18n Translation Keys

### 2.1 Plugin System Keys (CRITICAL - UI Shows Raw Keys)

These keys are used in `PluginLayout.tsx` and `PluginToolbar.tsx` but **NOT FOUND** in `en.json`:

| Key | Component | Required Translation |
|-----|-----------|---------------------|
| `plugin.noPluginsTitle` | PluginLayout | "No Plugins Active" |
| `plugin.noPluginsDescription` | PluginLayout | "Add plugins to customize your workspace layout" |
| `plugin.addPlugin` | PluginLayout | "Add Plugin" |
| `plugin.allPluginsActive` | PluginLayout | "All available plugins are already active" |
| `plugin.clickToRemove` | PluginToolbar | "Click to remove plugin" |
| `plugin.clickToAdd` | PluginToolbar | "Click to add plugin" |
| `plugin.toolbar` | PluginToolbar | "Plugin Toolbar" |
| `plugin.layoutMode` | PluginToolbar | "Layout" |
| `plugin.layout1Column` | PluginToolbar | "1 Column" |
| `plugin.layout2Column` | PluginToolbar | "2 Columns" |
| `plugin.layout3Column` | PluginToolbar | "3 Columns" |
| `plugin.layout2Plus1` | PluginToolbar | "2+1 Layout" |
| `plugin.notFound` | PluginPanel | "Plugin not found" |
| `plugin.closePanel` | PluginPanel | "Close {{pluginName}}" |

**Total Missing i18n Keys**: 14

### 2.2 Header/Sidebar Keys

| Key | Component | Required Translation |
|-----|-----------|---------------------|
| `header.toggleSidebar` | SimpleHeader | "Toggle sidebar" |
| `sidebar.projectsHeader` | ProjectSidebar | "Projects" |
| `sidebar.chatThreads` | ChatThreadList | "Chat Threads" |
| `sidebar.agentTools` | AgentToolsPanel | "Agent Tools" |
| `sidebar.resize` | ProjectSidebar | "Resize sidebar" |
| `sidebar.closeSidebar` | ProjectSidebar | "Close sidebar" |

**Total Additional Missing Keys**: 6

---

## 3. Layout & Structure Violations

### 3.1 Missing Global UI Components

Per UX Spec, the application MUST have:

| Component | Spec Location | Current Status |
|-----------|---------------|----------------|
| **System Rail** | UX Spec Lines 54-57 | ❌ NOT IMPLEMENTED |
| **Global Header** | UX Spec Lines 501-502 | ⚠️ PARTIAL (SimpleHeader exists but incomplete) |
| **Collapsible Sidebar** | UX Spec Lines 508-513 | ⚠️ PARTIAL (ProjectSidebar exists but ugly) |
| **Breadcrumbs** | UX Spec Line 385 | ❌ NOT IMPLEMENTED |
| **Command Palette** | UX Spec Lines 479-485 | ✅ IMPLEMENTED |
| **Ghost Plan** | UX Spec Lines 456-466 | ❌ NOT IMPLEMENTED |

### 3.2 PluginLayout Issues (GOD COMPONENT)

**Current**: 807 lines (src/presentation/layouts/PluginLayout.tsx)
**Threshold**: 400 lines max

**Issues**:
1. Empty black void when no plugins selected
2. Text labels overlap in toolbar
3. No proper grid system for plugin layout
4. Drag-drop removed but toggle UI is cramped

### 3.3 Root Layout Issues

**File**: `src/routes/__root.tsx`

**Issues**:
1. Sidebar only shows when `projectId` exists
2. Header only shows when `projectId` exists
3. No persistent global navigation
4. No system rail at bottom

---

## 4. Typography Violations

### 4.1 Font Usage

Per UX Spec:
- **UI/Code**: JetBrains Mono (`font-mono`)
- **Prose**: Geist Sans (`font-sans`)

| File | Line | Violation |
|------|------|-----------|
| `src/presentation/components/sidebar/ProjectSidebar.tsx` | 135 | Uses default font, not `font-mono` |
| `src/presentation/components/header/SimpleHeader.tsx` | 83 | Uses default font for "Via-gent" |

---

## 5. Responsive Design Violations

### 5.1 Touch Target Sizes

Per UX Spec: Minimum 44x44px for all interactive elements.

| File | Line | Violation |
|------|------|-----------|
| `src/presentation/layouts/PluginToolbar.tsx` | 83-102 | Toggle buttons lack `min-h-[44px]` |
| `src/presentation/layouts/PluginToolbar.tsx` | 134-149 | Layout mode buttons too small |

### 5.2 Mobile Layout

**Issues**:
1. Plugin toolbar not responsive
2. No mobile bottom navigation for plugins
3. Sidebar doesn't collapse on mobile properly

---

## 6. Accessibility Violations

### 6.1 Missing ARIA Labels

| File | Line | Missing |
|------|------|---------|
| `src/presentation/components/sidebar/ProjectSidebar.tsx` | 136-143 | Close button missing `aria-label` |
| `src/presentation/layouts/PluginLayout.tsx` | Various | Plugin panels missing proper ARIA |

### 6.2 Focus Management

- No visible focus rings in plugin toolbar
- Missing focus trap in add plugin dialog

---

## 7. Component God-Class Issues

### 7.1 Files Exceeding 400 Lines

| File | Lines | Recommended Split |
|------|-------|-------------------|
| `PluginLayout.tsx` | 807 | Split: PluginLayout, PluginGrid, PluginEmptyState, PluginAddDialog |
| `HubHomePage.tsx` | 530 | Already has subcomponents - OK |

---

## 8. Remediation Priority Matrix

| Priority | Issue | Stories Required | Effort |
|----------|-------|------------------|--------|
| P0 | Missing i18n keys | UX-01 | 2h |
| P0 | System Rail missing | UX-05 | 4-6h |
| P0 | Plugin content not rendering | UX-06 | 4-6h |
| P1 | Rounded corners everywhere | UX-08 (audit) | 2h |
| P1 | Global Header incomplete | UX-03 | 3h |
| P1 | Sidebar design ugly | UX-02 | 3h |
| P1 | Breadcrumbs missing | UX-04 | 2h |
| P2 | Hub page improvements | UX-07 | 3h |
| P2 | Typography audit | UX-09 | 2h |
| P2 | Mobile responsive fixes | UX-10 | 4h |

---

## 9. Recommendations

### Immediate Actions (P0)

1. **Add all missing i18n keys** - UI is displaying raw translation keys
2. **Implement System Rail** - Core UX pattern per spec
3. **Fix PluginLayout** - Content not rendering, black void state

### Short-term Actions (P1)

4. **Create GlobalLayout component** - Wrap all routes
5. **Redesign Sidebar** - Professional, 8-bit compliant
6. **Add Breadcrumbs** - Navigation context

### Medium-term Actions (P2)

7. **Color audit** - Replace all gray-* with semantic tokens
8. **Typography audit** - Ensure JetBrains Mono/Geist Sans compliance
9. **Mobile audit** - Fix responsive issues

---

## 10. Evidence References

- UX Spec: `_bmad-output/project-planning-artifacts/ux-design-specification.md`
- ADR-033: `_bmad-output/planning-artifacts/adr/ADR-033-correct-course-architectural-remediation-2026-01-16.md`
- Screenshot Evidence: User-provided (blue rounded buttons, empty void, cramped toolbar)

---

**Auditor**: ux-designer-ext
**Reviewed By**: Pending bmad-master review
**Next Action**: Create EPIC-UX-GLOBAL-UI with 10 stories
