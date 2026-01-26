# Layout Architecture Specification

**Version:** 1.0.0
**Date:** 2026-01-27
**Author:** analyst-ext (BMAD Framework)
**Status:** ANALYSIS COMPLETE - Ready for Implementation Planning

---

## Executive Summary

### Current State (MISALIGNED)
The current implementation has **fundamental architectural conflicts** with the user's vision:
1. **Resizable/draggable panels** - Uses `react-resizable-panels` with user-adjustable sizes
2. **Chat + FileTree tabbed in sidebar** - Currently tabbed together (only one visible at a time)
3. **No predefined layout presets** - Dynamic sizes stored per-plugin, not fixed ratios
4. **Missing global header on project routes** - GlobalHeader exists but sidebar logic is inconsistent

### Required State (USER VISION)
1. **Predefined layout presets ONLY** - No user resizing, fixed ratios (3:2:5, 7:3, etc.)
2. **Chat and FileTree as side-by-side always-loaded panels** - Not tabbed, both visible
3. **Toggle system for adding plugins** - Header toggles for Monaco, Terminal, Preview
4. **Consistent global chrome** - Header, breadcrumb, system rail on ALL routes

### Gap Severity: **HIGH (Architectural Rework Required)**

---

## Current Architecture Issues

### Issue 1: Resizable Panels Throughout

**Location:** Multiple files with `react-resizable-panels` usage

| File | Line | Issue |
|------|------|-------|
| `src/presentation/layouts/PluginLayout.tsx` | 7, 87, 412-414, 477-479 | Renders resize handles: `cursor-col-resize` |
| `src/presentation/components/layout/IDELayout/IDEResizableLayout.tsx` | 72-148 | Full `ResizablePanelGroup` with `ResizableHandle` |
| `src/presentation/components/notes/NotesPage.tsx` | 934-1052 | ResizablePanelGroup for notes layout |
| `src/presentation/components/sidebar/PluginSidebar.tsx` | 156-181 | `handleResizeStart` with mouse drag handlers |
| `src/presentation/components/ui/resizable.tsx` | - | Core resizable component library |

**Impact:** Users can arbitrarily resize panels, breaking intended UX ratios.

---

### Issue 2: Chat and FileTree Tabbed (NOT Side-by-Side)

**Location:** `src/presentation/components/sidebar/PluginSidebar.tsx`

```typescript
// Lines 39, 119: Only ONE tab visible at a time
type SidebarTab = 'filetree' | 'chat';
const [activeTab, setActiveTab] = useState<SidebarTab>('filetree');

// Lines 249-262: Conditional rendering (one OR the other)
{activeTab === 'filetree' && (<fileTreePlugin.MainComponent ... />)}
{activeTab === 'chat' && (<chatPlugin.MainComponent ... />)}
```

**Impact:** FileTree and Chat are mutually exclusive - user cannot see both simultaneously.

---

### Issue 3: No Predefined Layout Presets

**Location:** `src/presentation/layouts/layout-presets.ts` and `PluginLayoutStore.ts`

Current presets are **plugin-count based**, not **use-case based**:
```typescript
// Lines 85-135: Presets by plugin count, not by workflow
'1-column': { mode: '1-column', pluginCount: 1, slots: [...] }
'2-column': { mode: '2-column', pluginCount: 2, slots: [...] }
'3-column': { mode: '3-column', pluginCount: 3, slots: [...] }
```

**Missing presets from user vision:**
- `Default` (Chat + FileTree + Note, ratio 3:2:5)
- `Focus` (Chat + Project, ratio 7:3)
- `Code` (FileTree + Monaco + Preview, ratio 2:5:3)
- `Full Editor` (Monaco only, ratio 10)

---

### Issue 4: Inconsistent Global Chrome

**Location:** `src/presentation/components/layout/ProjectAwareLayout.tsx`

```typescript
// Lines 71-86: Project routes have MINIMAL chrome
if (inProjectRoute) {
  return (
    <div className="h-screen flex flex-col bg-canvas">
      <GlobalHeader />
      <div className="flex-1 overflow-hidden">
        <Outlet />  // NO MainSidebar
      </div>
      <SystemRail />
    </div>
  );
}
```

**Issues:**
- No breadcrumb on project routes
- MainSidebar hidden on project routes (by design per new-fundamental-truths.md)
- But user vision requires a **DIFFERENT** sidebar behavior (always-loaded panels)

---

### Issue 5: PluginToolbar in Wrong Location

**Location:** `src/presentation/layouts/PluginLayout.tsx` (Lines 748-756)

```typescript
// Currently inside PluginLayout, NOT in GlobalHeader
{breakpoint !== 'mobile' && breakpoint !== 'mobileLg' && (
  <PluginToolbar
    activePlugins={activePlugins}
    availablePlugins={availablePlugins}
    layoutMode={layoutMode}
    onTogglePlugin={handleTogglePlugin}
    onSetLayoutMode={handleSetLayoutMode}
  />
)}
```

**User Vision:** Toggle controls should be in the **GlobalHeader**, not below it.

---

### Issue 6: Mobile Layout Missing Swipe Navigation

**Location:** `src/presentation/layouts/MobilePluginNav.tsx`

Current implementation uses **tap buttons** only:
```typescript
// Lines 116-131: Click handlers only
<button onClick={() => onSwitchPlugin(pluginId)}>
```

**Missing:** Swipe gesture handlers for intuitive mobile navigation.

---

## Required Architecture

### Predefined Layout Presets (Fixed Ratios)

| Preset ID | Display Name | Panels | Ratio | Use Case |
|-----------|--------------|--------|-------|----------|
| `default` | Default | Chat + FileTree + Note | 3:2:5 (30%:20%:50%) | General work |
| `focus` | Focus | Chat + Project | 7:3 (70%:30%) | Agent-focused |
| `code` | Code | FileTree + Monaco + Preview | 2:5:3 (20%:50%:30%) | Development |
| `full-editor` | Full Editor | Monaco only | 10 (100%) | Deep coding |
| `notes` | Notes | FileTree + Notes | 3:7 (30%:70%) | Writing |

**Key Constraints:**
- NO resizing allowed by user
- Ratios are **fixed** per preset
- User selects preset from dropdown, panels auto-arrange

---

### Component Structure (Correct Hierarchy)

```
┌─────────────────────────────────────────────────────────────────────┐
│ GlobalHeader                                                        │
│ [Logo] [Breadcrumb] [Preset Dropdown] [Plugin Toggles] [Settings]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────┬─────────────┬─────────────────────────────────┐   │
│   │ CHAT        │ FILETREE    │ MAIN CONTENT                    │   │
│   │ + Thread    │ + Project   │ (Note/Monaco/Terminal/Preview)  │   │
│   │             │ Manager     │                                 │   │
│   │   (30%)     │   (20%)     │        (50%)                    │   │
│   │             │             │                                 │   │
│   └─────────────┴─────────────┴─────────────────────────────────┘   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ SystemRail: Status | Line:Col | Problems | Agent State              │
└─────────────────────────────────────────────────────────────────────┘
```

**Component Tree:**
```
ProjectAwareLayout
├── GlobalHeader (FIXED HEIGHT: 48px)
│   ├── Logo
│   ├── Breadcrumb
│   ├── PresetSelector (dropdown for layout presets)
│   ├── PluginToggles (add/remove Monaco, Terminal, Preview)
│   └── SettingsButton
├── WorkspaceContainer (flex: 1)
│   ├── ChatPanel (always loaded, Group A)
│   │   └── ChatCascade + ThreadList
│   ├── FileTreePanel (always loaded, Group B)
│   │   └── FileTree + ProjectManager
│   └── MainContentPanel (toggleable, Group C)
│       └── Note | Monaco | Terminal | Preview
└── SystemRail (FIXED HEIGHT: 32px)
```

---

### Plugin Groupings

**Group A: Chat + Cascade + Thread (Always Together)**
- Components: `ChatCascade`, `ThreadList`, `AgentToolsPanel`
- Behavior: Always visible in leftmost panel
- Cannot be toggled off (core functionality)

**Group B: FileTree + ProjectManager (Always Together)**
- Components: `FileTree`, `ProjectList`, `SidebarSection`
- Behavior: Always visible in second panel
- Cannot be toggled off (project navigation)

**Group C: Main Content (Toggleable via Header)**
- Components: `NoteEditor`, `Monaco`, `Terminal`, `Preview`
- Behavior: User can add/remove up to 2 from this group
- Toggle controls in GlobalHeader
- Only ONE from Group C visible at a time (or split if 2)

---

### Toggle System (Header-Based)

**GlobalHeader Toggle Controls:**

```tsx
// PluginToggles component in GlobalHeader
<div className="flex gap-1">
  <PluginToggle plugin="notes" active={hasNotes} onToggle={toggleNotes} />
  <PluginToggle plugin="monaco" active={hasMonaco} onToggle={toggleMonaco} />
  <PluginToggle plugin="terminal" active={hasTerminal} onToggle={toggleTerminal} />
  <PluginToggle plugin="preview" active={hasPreview} onToggle={togglePreview} />
</div>
```

**Toggle Rules:**
1. Max 2 plugins from Group C simultaneously
2. If adding 3rd, prompt user to remove one
3. Layout preset auto-adjusts based on active plugins
4. Terminal is platform-restricted (desktop FSA only)

---

### Mobile Layout (2 Tabs with Swipe)

**Structure:**
```
┌──────────────────────────────────┐
│ GlobalHeader (compact)           │
├──────────────────────────────────┤
│                                  │
│   [SWIPEABLE CONTENT AREA]       │
│   - Tab 1: Chat + AI             │
│   - Tab 2: FileTree or Note      │
│                                  │
├──────────────────────────────────┤
│ [Tab Bar: 💬 | 📁 ]              │
└──────────────────────────────────┘
```

**Swipe Gesture:**
- Horizontal swipe left/right to switch tabs
- Visual indicators (dots or line) showing current tab
- Only 2 plugins visible at once on mobile

---

### Files to Modify

| File | Action | Description | Priority |
|------|--------|-------------|----------|
| `src/presentation/components/layout/ProjectAwareLayout.tsx` | **MODIFY** | Add consistent global chrome, remove MainSidebar fork | P0 |
| `src/presentation/components/layout/GlobalHeader.tsx` | **MODIFY** | Add preset selector and plugin toggles | P0 |
| `src/presentation/layouts/PluginLayout.tsx` | **MAJOR REWRITE** | Replace resizable panels with fixed-ratio grid | P0 |
| `src/presentation/layouts/layout-presets.ts` | **REPLACE** | New use-case-based presets with fixed ratios | P0 |
| `src/presentation/layouts/PluginLayoutStore.ts` | **MODIFY** | Remove panelSizes, add activePreset | P1 |
| `src/presentation/components/sidebar/PluginSidebar.tsx` | **DELETE or REPLACE** | No longer needed - Chat/FileTree are main panels | P0 |
| `src/presentation/layouts/MobilePluginNav.tsx` | **MODIFY** | Add swipe gesture handlers | P2 |
| `src/presentation/components/layout/PluginToolbar.tsx` | **MOVE** | Move into GlobalHeader | P1 |

---

### Files to Delete

| File | Reason |
|------|--------|
| `src/presentation/components/sidebar/PluginSidebar.tsx` | Tabbed sidebar replaced by side-by-side panels |
| `src/presentation/components/layout/IDELayout/IDEResizableLayout.tsx` | Resizable logic not needed |
| `src/presentation/components/layout/IDELayout/IDEEditorPreviewGroup.tsx` | Part of resizable system |
| `src/presentation/components/layout/IDELayout/IDETerminalPanel.tsx` | Replaced by plugin system |
| `src/presentation/components/layout/IDELayout/IDEChatPanel.tsx` | Replaced by plugin system |
| `src/infrastructure/persistence/stores/ide/ide-layout-slice.ts` | Panel sizes no longer persisted |

---

### Files to Create

| File | Description |
|------|-------------|
| `src/presentation/components/layout/PresetSelector.tsx` | Dropdown for layout preset selection |
| `src/presentation/components/layout/FixedGridLayout.tsx` | Non-resizable grid layout component |
| `src/presentation/components/layout/WorkspacePanel.tsx` | Container for Chat, FileTree, MainContent |
| `src/presentation/hooks/useSwipeNavigation.ts` | Touch gesture hook for mobile |
| `src/presentation/layouts/layout-presets-v2.ts` | New use-case-based presets |

---

## Implementation Phases

### Phase 1: Core Layout Restructure (P0, ~6-8 hours)

**Goal:** Replace resizable system with fixed-ratio grid

1. Create `FixedGridLayout.tsx` with CSS Grid (no resize handles)
2. Create `layout-presets-v2.ts` with use-case presets
3. Modify `PluginLayout.tsx` to use fixed ratios
4. Remove all `ResizableHandle` and resize mouse handlers
5. Update `ProjectAwareLayout.tsx` for consistent chrome

**Acceptance Criteria:**
- [ ] Panels have fixed ratios per preset
- [ ] No resize cursors visible
- [ ] Switching presets changes layout instantly

---

### Phase 2: Side-by-Side Chat + FileTree (P0, ~4-6 hours)

**Goal:** Chat and FileTree always visible simultaneously

1. Delete `PluginSidebar.tsx` (tabbed sidebar)
2. Create `ChatPanel.tsx` (always-loaded, leftmost)
3. Create `FileTreePanel.tsx` (always-loaded, second)
4. Wire both into `FixedGridLayout.tsx`
5. Ensure both receive correct width from preset ratios

**Acceptance Criteria:**
- [ ] Chat and FileTree visible side-by-side on desktop
- [ ] No tab switching needed
- [ ] Both panels load immediately on project open

---

### Phase 3: Header Toggle System (P1, ~4 hours)

**Goal:** Plugin toggles in GlobalHeader

1. Move `PluginToolbar.tsx` logic into `GlobalHeader.tsx`
2. Create `PresetSelector.tsx` dropdown
3. Wire toggle buttons to add/remove Group C plugins
4. Enforce max 2 Group C plugins rule
5. Update layout when toggles change

**Acceptance Criteria:**
- [ ] Plugin toggles visible in header
- [ ] Toggling adds/removes panel from layout
- [ ] Preset selector changes all panels at once

---

### Phase 4: Mobile Swipe Navigation (P2, ~3 hours)

**Goal:** Swipe gesture for mobile tab switching

1. Create `useSwipeNavigation.ts` hook with Hammer.js or native touch
2. Integrate into `MobilePluginNav.tsx`
3. Add visual tab indicators (dots)
4. Test on iOS Safari and Android Chrome

**Acceptance Criteria:**
- [ ] Horizontal swipe switches tabs
- [ ] Visual feedback during swipe
- [ ] Smooth 60fps animation

---

## Estimated Effort Summary

| Phase | Effort | Team | Priority |
|-------|--------|------|----------|
| Phase 1: Core Layout Restructure | 6-8 hours | Team A | P0 |
| Phase 2: Side-by-Side Panels | 4-6 hours | Team A | P0 |
| Phase 3: Header Toggle System | 4 hours | Team B | P1 |
| Phase 4: Mobile Swipe | 3 hours | Team B | P2 |
| **Total** | **17-21 hours** | Both | - |

---

## Critical Dependencies

1. **CSS Grid Knowledge** - Fixed ratios require CSS Grid (`grid-template-columns: 3fr 2fr 5fr`)
2. **Plugin Registry** - Existing plugin system can be reused, just different loading
3. **Zustand Store Update** - Remove `panelSizes`, add `activePresetId`
4. **Touch Gesture Library** - May need Hammer.js or react-use-gesture for swipe

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Breaking existing user layouts | HIGH | Migrate stored panelSizes to nearest preset |
| Performance regression | MEDIUM | Use CSS Grid instead of JS-based layout |
| Mobile gesture conflicts | LOW | Test against scroll, long-press, and zoom |
| State management complexity | MEDIUM | Clear store migration strategy |

---

## Appendix: Current vs Required Comparison

| Aspect | Current | Required |
|--------|---------|----------|
| **Panel sizing** | User-resizable with drag handles | Fixed ratios per preset |
| **Chat location** | Tabbed in sidebar | Always-visible leftmost panel |
| **FileTree location** | Tabbed in sidebar | Always-visible second panel |
| **Layout selection** | Plugin count auto-select | User picks preset from dropdown |
| **Toggle controls** | Inside PluginLayout | Inside GlobalHeader |
| **Mobile navigation** | Tap bottom nav | Swipe between tabs |
| **GlobalHeader** | Present but minimal | Full with toggles + breadcrumb |
| **Persist** | panelSizes object | activePresetId string |

---

**Document End**

*Generated by analyst-ext on 2026-01-27*
*Investigation Duration: 25 minutes*
*Files Analyzed: 32*
