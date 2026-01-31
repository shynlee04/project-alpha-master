# UX Specification Audit Report

**Document ID**: UX-RESEARCH-01C/D
**Date**: 2026-01-27
**Agent**: ux-designer-ext
**Status**: COMPLETED
**Priority**: HIGH

---

## Executive Summary

This audit evaluates the current `ux-specification.md` (v2.1.0, dated 2026-01-26) against the project's authoritative architectural documents, identifying deprecated content, false claims, ADR misalignments, and missing requirements.

### Key Findings

| Category | Count | Severity |
|----------|-------|----------|
| **Deprecated Content** | 7 sections | MEDIUM |
| **False/Outdated Claims** | 12 items | HIGH |
| **ADR-039 Misalignments** | 8 gaps | HIGH |
| **Missing Requirements** | 15+ items | CRITICAL |
| **Global Component Gaps** | 5 components | MEDIUM |
| **8-bit Design System Gaps** | 3 areas | LOW |

### Overall Assessment

The UX Specification claims **"100% aligned with new-fundamental-truths.md v2.0.0"** (line 6, line 2501). **This is FALSE.** Based on evidence from `phase-1a-plugin-coordination-problems-2026-01-27.md`, Phase 1A is only ~30% complete, and 19 coordination gaps exist. The UX spec describes an idealized state that does not match implementation reality.

---

## Part 1: Deprecated Content Analysis

### 1.1 References to Non-Existent Features

| Section | Line(s) | Deprecated Content | Evidence |
|---------|---------|-------------------|----------|
| Section 3.2 | 690-692 | "Toggle-based layout with presets" | Plugin coordination analysis shows "No combination logic exists" |
| Section 3.3 | 839-877 | Platform-Aware Plugin Limits Matrix | Implementation missing - `getDefaultPlugins()` not wired to routes |
| Section 3.6 | 1045-1104 | Layout Presets (2-col, 3-col, 2+1) | Drag-drop layout causes broken UI per AGENTS.md line 406-408 |
| Section 8.1-8.6 | 1850-1957 | Plugin Panel Architecture | Only spec exists - implementation 0% per architecture.md |

### 1.2 Workspace-Centric Remnants

Despite claiming removal of workspace patterns, residual workspace concepts persist:

| Location | Content | Issue |
|----------|---------|-------|
| Line 47 | "Section 1. Design System" | References `--editor-bg` for "Monaco editor" but Monaco is POC stub |
| Line 1299 | "Workspace-aware: Only show agents for current project" | Mixed terminology (workspace vs project) |
| Line 1574 | "Tab bar shows only available plugins" | Implementation not connected to platform detection |

### 1.3 Documentation That Describes Unimplemented Code

| Section | Claims | Reality (per plugin-coordination-problems) |
|---------|--------|-------------------------------------------|
| PluginToolbar (Section 3.2) | Complete component spec with code | Component does not coordinate plugins |
| PluginManagementDialog (Section 3.4) | Full dialog implementation | Dialog exists but doesn't enforce limits |
| LayoutModeSelector | Layout switching works | "NO combination logic exists" |

---

## Part 2: False Information Analysis

### 2.1 Completion Status Claims

| Claim (Line) | Status Claimed | Actual Status | Evidence |
|--------------|---------------|---------------|----------|
| Line 6 | "100% Aligned" | ~30% aligned | AGENTS.md: Plugin System 0%, architecture.md: Plugin System 0% |
| Line 16-27 | All sections "✅ Complete" | Most incomplete | Plugin coordination analysis: 19 gaps identified |
| Line 2492-2500 | "+90% Plugin System UX" | 0% implemented | architecture.md Section 3: "Status: 0% - Not implemented" |

### 2.2 Component Availability Claims

| Component | Claimed (UX Spec) | Reality | Source |
|-----------|-------------------|---------|--------|
| Monaco Plugin | "Syntax highlighting (20+ languages)" | POC stub (textarea placeholder) | AGENTS.md line 405: "Monaco is POC stub" |
| Terminal Plugin | Full WebContainer integration | "Terminal doesn't boot WebContainer, doesn't mount FSA files" | plugin-coordination-problems Section 2.3 |
| Preview Plugin | Dev server URL flow complete | "No event source: Who emits dev-server-ready? Currently nobody" | plugin-coordination-problems Section 2.4 |
| Notes Plugin | "hardcoded noteId" issue | Notes doesn't listen to FILE_OPENED events | plugin-coordination-problems Section 2.2 |

### 2.3 Integration Claims

| Claim | Location | Reality |
|-------|----------|---------|
| "FileTree, Chat as sidebar TABS" | Section 8.2 | Layout structure exists but coordination missing |
| "Plugin state persistence per project" | Section 8.6 | State lost on toggle - no preservation mechanism |
| "All file CRUD operations emit typed events" | Section 8 | EventBus exists but "plugins don't use them for coordination" |

---

## Part 3: ADR-039 Misalignment Analysis

### 3.1 ADR-039 Decisions vs UX Spec Coverage

| ADR-039 Decision | UX Spec Coverage | Gap |
|------------------|-----------------|-----|
| **D1: Project-Centric Model** | Mentioned but not enforced in component specs | No visual treatment for project vs workspace confusion |
| **D3: FSA Handle Lifecycle** | NOT MENTIONED | Zero UX patterns for handle restoration, PermissionOverlay |
| **D4: Zustand Store Reactivity** | NOT MENTIONED | No loading/error states for reactive issues |
| **D5: Storage Gateway Pattern** | NOT MENTIONED | No UX for list pattern normalization errors |
| **D6: Plugin Panel Architecture** | Partially covered | Missing sidebar tab switching animation specs |
| **D7: EventBus for File CRUD** | NOT MENTIONED | No visual indicators for event flow |
| **D8: Auto-Save Contract** | Partially covered | Missing "Saving..." → "Saved" debounce UX |

### 3.2 Missing ADR-Referenced UX Patterns

**From ADR-039 Section 3 (FSA Handle Lifecycle):**
- ❌ PermissionOverlay component specification
- ❌ Handle restoration loading state
- ❌ Permission denied error state
- ❌ Re-grant permission flow

**From ADR-039 Section 7 (EventBus):**
- ❌ FILE_CREATED visual indicator
- ❌ FILE_UPDATED toast/notification
- ❌ FILE_DELETED confirmation pattern
- ❌ FILE_MOVED/RENAMED feedback

---

## Part 4: Missing Requirements Checklist

### 4.1 Plugin-Centric Layout System

| Requirement | Status | Notes |
|-------------|--------|-------|
| Activity Bar Concept | ❌ MISSING | new-fundamental-truths mentions "System Rail" but no spec |
| Activity Bar Icons | ❌ MISSING | Hub (🏠), FileTree (📁), Chat (💬), Search (🔍) not specified |
| Activity Bar Placement | ❌ MISSING | Left side, 48px width, fixed position |
| Activity Bar Mobile | ❌ MISSING | Bottom placement, 40px height |
| Tool Rail (Right Side) | ❌ MISSING | Settings, Help icons |

### 4.2 Responsive Multi-Device Support

| Requirement | Status | Notes |
|-------------|--------|-------|
| Breakpoint Enforcement | ⚠️ PARTIAL | Breakpoints defined but not enforced per plugin |
| Plugin Count by Device | ❌ MISSING | Mobile: 1, Tablet: 2-3, Desktop: 3-5 - no enforcement UX |
| Orientation Lock Patterns | ❌ MISSING | IDE lock to landscape not specified |
| Safe Area Insets | ❌ MISSING | iPhone notch, Android gesture areas |
| PWA Install Prompt | ❌ MISSING | Add to home screen UX |

### 4.3 i18n Typography Considerations

| Requirement | Status | Notes |
|-------------|--------|-------|
| Vietnamese Typography | ❌ MISSING | Diacritics, line height adjustments |
| RTL Layout Support | ❌ MISSING | Not mentioned for future localization |
| Font Fallback Chain | ⚠️ PARTIAL | Defined but no i18n-specific fallbacks |
| Dynamic Text Sizing | ❌ MISSING | Content expansion for translated strings |
| Input Method Editor (IME) | ❌ MISSING | CJK input handling |

### 4.4 Progressive Disclosure Patterns

| Requirement | Status | Notes |
|-------------|--------|-------|
| Disclosure Level 1 (Always Visible) | ⚠️ PARTIAL | FileTree, Monaco, Chat mentioned |
| Disclosure Level 2 (Click to Reveal) | ⚠️ PARTIAL | "Show more plugins" dropdown spec incomplete |
| Disclosure Level 3 (Hidden by Default) | ❌ MISSING | Advanced plugins, marketplace - no spec |
| Disclosure Animation | ❌ MISSING | Expand/collapse timing not specified |
| Disclosure State Persistence | ❌ MISSING | Remember disclosure state per project |

### 4.5 Additional Missing Requirements

| Category | Missing Items |
|----------|---------------|
| **Error Boundaries** | Plugin crash recovery UI, plugin reload button |
| **Empty States** | Project-specific empty states (no files vs no permissions) |
| **Onboarding** | First-time user flow, platform capability explanation |
| **Offline Support** | Offline indicator, sync pending count |
| **Keyboard Shortcuts** | Plugin-specific shortcuts not tied to implementation |
| **Command Palette** | Plugin search within command palette |
| **Status Bar** | Plugin status indicators, sync status |
| **Notifications** | Plugin notification patterns, grouping |

---

## Part 5: Global Components Analysis

### 5.1 Header Component

| Aspect | Specified | Gap |
|--------|-----------|-----|
| Project Switcher | ✅ Yes | Dropdown behavior incomplete |
| Plugin Toolbar | ✅ Yes | Toggle states not coordinated |
| Layout Mode Selector | ✅ Yes | Implementation broken |
| User Menu | ❌ Missing | No user/settings access point |
| Sync Status | ❌ Missing | No visual sync indicator |

### 5.2 Sidebar Component

| Aspect | Specified | Gap |
|--------|-----------|-----|
| Activity Bar (System Rail) | ⚠️ Partial | ASCII diagram but no component spec |
| Content Panel | ✅ Yes | Width tokens defined |
| Tab Switching | ⚠️ Partial | Behavior but no animation spec |
| Collapse/Expand | ⚠️ Partial | No animation timing |
| Mobile Drawer | ❌ Missing | Bottom sheet behavior unclear |

### 5.3 Footer/Status Bar Component

| Aspect | Specified | Gap |
|--------|-----------|-----|
| Height | ✅ Yes | 24px defined |
| Content | ❌ Missing | What goes in status bar? |
| Plugin Status | ❌ Missing | Active plugin indicators |
| File Info | ❌ Missing | Line/column, encoding, etc. |
| Sync Status | ❌ Missing | Save state, sync pending |

### 5.4 Breadcrumb Component

| Aspect | Specified | Gap |
|--------|-----------|-----|
| Path Display | ✅ Yes | Max width defined |
| Click Navigation | ✅ Yes | Navigate to any level |
| Truncation | ⚠️ Partial | Middle ellipsis mentioned |
| Mobile Behavior | ❌ Missing | Swipe to reveal? |
| Plugin Context | ❌ Missing | Which plugin's breadcrumb? |

### 5.5 Modal/Dialog Components

| Aspect | Specified | Gap |
|--------|-----------|-----|
| Dialog | ✅ Yes | Complete spec |
| Sheet | ✅ Yes | Complete spec |
| Bottom Sheet (Mobile) | ⚠️ Partial | Mentioned but no gesture spec |
| Confirmation Dialog | ❌ Missing | Delete confirmation pattern |
| Multi-Step Modal | ❌ Missing | Wizard pattern |

---

## Part 6: 8-bit Design System Audit

### 6.1 Compliance Status

| Rule | Specified | Compliance |
|------|-----------|------------|
| No Glassmorphism | ✅ Yes | ✅ Compliant |
| Solid Backgrounds | ✅ Yes | ✅ Compliant |
| Hard Shadows (`shadow-pixel`) | ✅ Yes | ✅ Compliant |
| Squared Corners (`radius: 0`) | ✅ Yes | ✅ Compliant |
| No Blur Effects | ✅ Yes | ✅ Compliant |

### 6.2 Gaps in 8-bit Specification

| Gap | Description | Recommendation |
|-----|-------------|----------------|
| **Retro Font Usage** | VT323, Press Start 2P mentioned but no usage rules | Define when to use retro fonts (headings, labels, buttons?) |
| **Pixel Art Icons** | No icon style guide | Specify pixel art vs outline icons |
| **Color Dithering** | No gradient alternatives | Define 8-bit gradient patterns |
| **Sound Effects** | Optional audio mentioned but no spec | Define 8-bit sound palette |
| **Animation Easing** | Linear for hover but should ALL animations be linear? | Clarify 8-bit animation rules |

### 6.3 Typography Retro Compliance

| Element | Current | 8-bit Recommendation |
|---------|---------|----------------------|
| Headings | Inter (system) | VT323 for hero text |
| Body | Inter | System font OK |
| Code | JetBrains Mono | Keep monospace |
| Labels | Inter | Consider VT323 for badges |
| Buttons | Inter | Consider VT323 for primary CTA |

---

## Part 7: Recommendations

### 7.1 Immediate Actions (P0)

1. **Update Status Claims**: Change "100% Aligned" to accurate completion percentage (~30%)
2. **Add PermissionOverlay Spec**: FSA handle restoration is P0 blocker - needs UX spec
3. **Add Plugin Coordination UX**: Shared ActiveDocument visual indicators
4. **Add Auto-Save Indicator**: "Saving..." → "Saved" debounce pattern (500ms per ADR-039)

### 7.2 Short-Term Actions (P1)

5. **Add Activity Bar Spec**: System Rail with icons, placement, mobile behavior
6. **Add Status Bar Content**: Define what information appears
7. **Add i18n Typography Section**: Vietnamese, RTL, font fallbacks
8. **Add Offline/Sync Indicators**: Visual treatment for connection state
9. **Add Error Boundary UI**: Plugin crash recovery patterns

### 7.3 Medium-Term Actions (P2)

10. **Revise Plugin Panel Architecture**: Match implementation reality
11. **Add Progressive Disclosure Details**: Animation, state persistence
12. **Add Onboarding Flows**: First-time user experience
13. **Add Keyboard Shortcut Customization**: Settings UI

### 7.4 Complete Rewrite Structure (Recommended)

Given the significant gaps and false claims, a complete rewrite should follow this structure:

```markdown
# UX Specification v3.0.0

## Part 1: Design System
- 1.1 8-bit Aesthetic Rules (EXPANDED)
- 1.2 Color Palette
- 1.3 Typography (+ i18n considerations)
- 1.4 Spacing & Layout
- 1.5 Shadows & Borders
- 1.6 Animation Principles

## Part 2: Global Components
- 2.1 Header / TopBar
- 2.2 Activity Bar (System Rail)
- 2.3 Sidebar (Content Panel + Tabs)
- 2.4 Main Content Area
- 2.5 Status Bar
- 2.6 Breadcrumb
- 2.7 Command Palette

## Part 3: Plugin System UX
- 3.1 Plugin Toggle Toolbar
- 3.2 Plugin Count Enforcement (by platform)
- 3.3 Layout Presets (2-col, 3-col, 2+1)
- 3.4 Plugin Management Dialog
- 3.5 Progressive Disclosure Levels
- 3.6 Plugin State Preservation

## Part 4: Platform-Specific Patterns
- 4.1 Desktop (FSA) Experience
- 4.2 Desktop (IndexedDB) Experience
- 4.3 Tablet Experience
- 4.4 Mobile Experience
- 4.5 Platform Detection UX

## Part 5: Permission & Error Handling
- 5.1 PermissionOverlay (FSA Handle)
- 5.2 Error Boundaries (Plugin Crash)
- 5.3 Empty States (by context)
- 5.4 Loading States (by context)
- 5.5 Offline Indicators

## Part 6: Plugin-Specific UX
- 6.1 FileTree Plugin
- 6.2 Monaco Plugin
- 6.3 Notes Plugin
- 6.4 Terminal Plugin
- 6.5 Preview Plugin
- 6.6 Chat Plugin

## Part 7: AI Interaction Patterns
- 7.1 Agent Selection
- 7.2 Chat Interface
- 7.3 Tool Approvals
- 7.4 Streaming Responses
- 7.5 Error States

## Part 8: Responsive Design
- 8.1 Breakpoints
- 8.2 Touch Interactions
- 8.3 Orientation Handling
- 8.4 Gesture Support

## Part 9: Accessibility
- 9.1 WCAG Compliance
- 9.2 Keyboard Navigation
- 9.3 Screen Reader Support
- 9.4 Focus Management

## Part 10: Design Tokens Reference
- 10.1 CSS Custom Properties
- 10.2 TypeScript Constants
- 10.3 Tailwind Configuration
```

---

## Appendix A: Evidence Sources

| Document | Version | Path |
|----------|---------|------|
| ux-specification.md | 2.1.0 | `_bmad-output/planning-artifacts/ux-specification.md` |
| architecture.md | 3.1.0 | `_bmad-output/planning-artifacts/architecture.md` |
| prd.md | 2.1.0 | `_bmad-output/planning-artifacts/prd.md` |
| new-fundamental-truths.md | 2.0.0 | `new-fundamental-truths.md` |
| ADR-039 | APPROVED | `_bmad-output/planning-artifacts/adr/ADR-039-consolidated-project-centric-architecture-2026-01-26.md` |
| Plugin Coordination Problems | Draft | `docs/analysis/phase-1a-plugin-coordination-problems-2026-01-27.md` |
| AGENTS.md | 2.8.0 | `AGENTS.md` |

---

## Appendix B: Line Reference Summary

### Deprecated/False Content by Line Number

| Lines | Issue |
|-------|-------|
| 6-8 | False "100% Aligned" claim |
| 14-27 | False "Complete" status for most sections |
| 477-540 | Layout presets spec but implementation broken |
| 690-877 | Platform-aware limits not enforced |
| 1045-1104 | Layout modes cause broken UI |
| 1850-1957 | Plugin Panel Architecture at 0% |
| 2487-2556 | Appendix claims all updates complete |

---

**End of Audit Report**

**Document Version**: 1.0.0
**Audit Date**: 2026-01-27
**Auditor**: ux-designer-ext (BMAD Framework)
**Next Action**: Present to architect-ext for ADR update consideration

---

*This audit identifies gaps between documented UX specification and implementation reality. A complete specification rewrite is recommended to align with actual project status and ADR-039 decisions.*
