# UX Specification Alignment Analysis
## Plugin-Based Architecture vs Current UX Spec

**Analysis Date:** 2026-01-26
**Analyzer:** analyst-ext (Business Analysis Agent)
**Context:** EPIC-CC-AR02AR03 - Plugin System Complete Rework for Phase 1A

---

## Executive Summary

The current `ux-specification.md` (v1.0.0, 2026-01-07) is **misaligned with the new plugin-based architecture**. The specification follows a **workspace-centric model**, while the new architecture implements a **dynamic plugin system** with platform-aware defaults.

### Key Findings

| Category | Alignment | Severity | Gaps Identified |
|----------|-----------|----------|-----------------|
| **Plugin System UX** | 10% | 🔴 CRITICAL | No plugin toggle patterns, no progressive disclosure |
| **Platform Responsiveness** | 40% | 🟠 HIGH | Missing plugin count limits, incomplete mobile layout |
| **8-bit Design Compliance** | 95% | 🟢 LOW | Minor inconsistencies in component patterns |
| **Layout System** | 0% | 🔴 CRITICAL | Drag-drop specified (to be removed), toggle-based missing |
| **Progressive Disclosure** | 20% | 🟠 HIGH | Concept mentioned, not applied to plugin system |

---

## 1. Component-by-Component Alignment

### 1.1 Navigation Patterns (Section 4.1)

#### Current Spec:
```
Primary Navigation (Activity Bar):
┌────────┐
│ 🏠     │ ← Home (Hub)
├────────┤
│ 💻     │ ← IDE workspace
├────────┤
│ 📚     │ ← Knowledge workspace
├────────┤
│ 📝     │ ← Notes workspace
├────────┤
│ 🎓     │ ← Study workspace
└────────┘
```

**Status:** ❌ **OUTDATED**

#### New Architecture Requirements:
```
Plugin-Based Navigation:
┌─────────────────────────────────────────────────────────┐
│ Via-gent | [=] | [D] [N] [T] [P] [C] [F] | Layout: [2] [3] [4] [5] |
└─────────────────────────────────────────────────────────┘
              |                              |
              +-- Plugin toggles             +-- Layout mode selector

Legend:
[D] = Monaco Editor (Code)
[N] = Notes (BlockNote)
[T] = Terminal
[P] = Preview
[C] = Chat
[F] = FileTree (always visible on desktop)
```

**Gaps:**
1. ❌ No plugin toggle toolbar component specified
2. ❌ No layout mode selector buttons
3. ❌ No plugin-specific activation/deactivation patterns
4. ❌ Activity bar navigation assumes fixed workspaces, not dynamic plugins
5. ❌ Missing platform-aware plugin count enforcement (desktop: 3 max, tablet: 2, mobile: 1)

**Impact:** User cannot manage plugins, layout is hardcoded, not adaptable to platform capabilities.

---

### 1.2 Layout Components (Section 2.3 - Resizable)

#### Current Spec:
```tsx
<ResizablePanelGroup direction="horizontal">
  <ResizablePanel defaultSize={70} minSize={30}>
    {/* Editor */}
  </ResizablePanel>
  <ResizableHandle />
  <ResizablePanel defaultSize={30} minSize={20}>
    {/* Preview */}
  </ResizablePanel>
</ResizablePanelGroup>
```

**Status:** ⚠️ **PARTIAL ALIGNMENT**

#### New Architecture Requirements:
**Toggle-based layout with pre-designed presets:**

```tsx
// Pre-designed layout presets (NOT drag-drop)
export const LAYOUT_PRESETS: Record<string, LayoutPreset> = {
  '2-column': {
    mode: '2-column',
    pluginCount: 2,
    slots: [
      { flex: 30, minWidth: 200 },   // FileTree
      { flex: 70, minWidth: 300 },   // Monaco
    ],
  },
  '3-column': {
    mode: '3-column',
    pluginCount: 3,
    slots: [
      { flex: 25, minWidth: 200 },   // FileTree
      { flex: 45, minWidth: 300 },   // Monaco
      { flex: 30, minWidth: 200 },   // Chat
    ],
  },
  '4-plugin-2+2': {
    mode: '2+1',
    pluginCount: 4,
    slots: [
      { flex: 25, minWidth: 200, row: 1 },  // FileTree
      { flex: 50, minWidth: 300, row: 1 },  // Monaco
      { flex: 25, minWidth: 200, row: 1 },  // Terminal
      { flex: 100, minWidth: 300, row: 2 }, // Chat (full width)
    ],
  },
};
```

**Gaps:**
1. ❌ No layout preset system specified
2. ❌ No toggle buttons for layout modes (2-col, 3-col, 2+1)
3. ❌ No constraint enforcement (max plugin counts per platform)
4. ⚠️ Resizable panels are acceptable, but should respect preset boundaries
5. ❌ Missing layout mode visualization (2-column vs 3-column icons)

**Impact:** Users cannot switch between optimized layouts, layout system is too flexible (causes broken states).

---

### 1.3 Mobile Layout (Section 6.2)

#### Current Spec:
| Component | Desktop | Mobile |
|-----------|---------|--------|
| Sidebar | Left, 280px | Bottom nav, 48px |
| Activity Bar | Left, 48px | Hidden (use bottom nav) |
| File Tree | Left panel, 200px | Drawer (swipe to open) |
| Terminal | Bottom panel, 30% | Modal (fullscreen) |
| Agent Chat | Right sidebar, 25% | Full screen overlay |
| Editor | Monaco, 70% width | Full width, hide preview |

**Status:** ⚠️ **INCOMPLETE**

#### New Architecture Requirements:
**Mobile Plugin Limit: 1 active plugin at a time**

```
Mobile Layout (Toggle Tabs):
+--------------------------------------+
| [Single Panel - Full Height]         |
| - Shows active plugin only            |
+--------------------------------------+
| [F] [N] [C]  <- Tab Bar (bottom)    |
+--------------------------------------+

Legend:
[F] = FileTree (access files)
[N] = Notes (BlockNote editor)
[C] = Chat (AI assistant)
- Terminal and Monaco NOT available on mobile (platform constraints)
```

**Gaps:**
1. ❌ **CRITICAL**: No specification for 1-plugin limit on mobile
2. ❌ No tab bar for plugin switching on mobile
3. ❌ Missing plugin availability indicators (terminal/monaco disabled on mobile)
4. ⚠️ Bottom navigation mentioned, but not tied to plugin system
5. ❌ No progressive disclosure for disabled features (e.g., "Terminal not available on mobile")

**Impact:** Mobile users see confusing UI with disabled features, no clear way to understand platform limitations.

---

### 1.4 Dialog/Modal Components (Section 2.2)

#### Current Spec:
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description goes here
      </DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      <Button onClick={onConfirm}>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Status:** ✅ **ALIGNED**

#### New Architecture Requirements:
**Plugin management dialog:**
```tsx
<PluginManagementDialog>
  <DialogHeader>
    <DialogTitle>{t('plugin.addPlugin')}</DialogTitle>
    <DialogDescription>
      {t('plugin.noPluginsDescription')}
    </DialogDescription>
  </DialogHeader>
  <AvailablePluginsList>
    {availablePlugins.map(plugin => (
      <PluginCard
        key={plugin.id}
        plugin={plugin}
        isCompatible={platform.canSupport(plugin)}
        onAdd={() => addPlugin(plugin.id)}
      />
    ))}
  </AvailablePluginsList>
  <DialogFooter>
    <Button onClick={onClose}>{t('common.close')}</Button>
  </DialogFooter>
</PluginManagementDialog>
```

**Alignment:** ✅ Dialog component structure is correct. Only need plugin-specific content.

**Gaps:**
1. ❌ No plugin management dialog pattern specified
2. ❌ No plugin compatibility indicator (e.g., "Terminal: Desktop only")
3. ❌ No plugin count warning (e.g., "Maximum 3 plugins reached")

**Impact:** Users cannot add/manage plugins effectively.

---

## 2. Missing UX Patterns for New Features

### 2.1 Plugin Toggle Toolbar

**Component:** `PluginToolbar.tsx`

**Required Pattern:**
```tsx
function PluginToolbar({ activePlugins, availablePlugins, layoutMode, ... }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 border-b border-border bg-card">
      {/* Plugin toggle buttons */}
      <div className="flex gap-1">
        {availablePlugins.map((pluginId) => (
          <PluginToggleButton
            key={pluginId}
            pluginId={pluginId}
            isActive={activePlugins.includes(pluginId)}
            isDisabled={!platform.canSupport(pluginId)}
            onToggle={() => onTogglePlugin(pluginId)}
          />
        ))}
      </div>

      {/* Layout mode selector */}
      <div className="flex gap-1 ml-auto">
        <LayoutModeButton mode="2-column" current={layoutMode} onClick={onSetLayoutMode} />
        <LayoutModeButton mode="3-column" current={layoutMode} onClick={onSetLayoutMode} />
        <LayoutModeButton mode="2+1" current={layoutMode} onClick={onSetLayoutMode} />
      </div>
    </div>
  );
}
```

**Status:** ❌ **NOT SPECIFIED**

**Gaps:**
1. ❌ No toggle button component (PluginToggleButton)
2. ❌ No layout mode selector component (LayoutModeButton)
3. ❌ No disabled state for platform-incompatible plugins
4. ❌ No maximum plugin count indicator (e.g., "3/3 active")
5. ❌ No clear visual distinction between active/inactive plugins

---

### 2.2 Progressive Disclosure for Plugin Features

**Required Pattern:**
- **Level 1 (Visible):** FileTree, Monaco, Chat (desktop default)
- **Level 2 (Click to reveal):** Terminal, Preview, Notes
- **Level 3 (Hidden by default):** Advanced plugins (Agents, Knowledge)

**Current Spec:** ⚠️ Mentions "progressive disclosure" in passing, but no specific patterns for plugin discovery.

**Gaps:**
1. ❌ No plugin categorization (Core vs Advanced)
2. ❌ No "Show more plugins" disclosure button
3. ❌ No plugin marketplace browse UX
4. ❌ No plugin recommendation system (e.g., "You might like Terminal for debugging")

---

### 2.3 Platform Capability Indicators

**Required Pattern:**
```tsx
function PluginCard({ plugin, isCompatible }) {
  return (
    <Card>
      <PluginIcon name={plugin.icon} />
      <PluginName>{plugin.name}</PluginName>
      <PluginDescription>{plugin.description}</PluginDescription>
      {!isCompatible && (
        <Badge variant="destructive">
          {t('plugin.desktopOnly')}
        </Badge>
      )}
    </Card>
  );
}
```

**Status:** ❌ **NOT SPECIFIED**

**Gaps:**
1. ❌ No platform requirement indicators (Desktop only, requires FSA, etc.)
2. ❌ No tooltip explaining why a plugin is unavailable
3. ❌ No visual feedback for disabled plugins

---

### 2.4 Empty State for Plugin System

**Current Spec:** ✅ EmptyPluginState exists in layout patterns

**Alignment:** ✅ Partially aligned, but needs plugin-specific messaging.

**Gaps:**
1. ❌ Empty state should be platform-specific (e.g., "No plugins active. Add FileTree to get started.")
2. ❌ Missing "Add your first plugin" CTA
3. ❌ No plugin count limit warning (e.g., "You have 0/3 plugins active")

---

## 3. Conflicts with 8-bit Design Requirements

### 3.1 Glassmorphism and Transparency

**Current Spec (Section 1.2):**
```css
/* ✅ CORRECT: Solid backgrounds */
--background: 240 6% 4%;             /* #0f0f11 - Deep black */
--foreground: 0 0% 95%;              /* Near white text */
--card: 240 4% 10%;                  /* #18181b - Panels/cards */

/* ❌ FORBIDDEN: Glassmorphism */
--shadow-pixel: 2px 2px 0px 0px rgba(0, 0, 0, 0.5);
```

**Status:** ✅ **COMPLIANT**

**Gaps:** None - 8-bit design requirements are well-documented and followed.

---

### 3.2 Border Radius and Shadows

**Current Spec (Section 1.4):**
```css
/* Minimal rounding for retro feel */
--radius: 0rem;          /* Default: Squared corners */
--radius-sm: 0.125rem;   /* 2px - Subtle rounding */
--radius-md: 0.25rem;    /* 4px - Small radius */
--radius-lg: 0.375rem;   /* 6px - Medium radius */

/* Hard drop shadows (8-bit style) */
--shadow-pixel: 2px 2px 0px 0px rgba(0, 0, 0, 0.5);
```

**Status:** ✅ **COMPLIANT**

**Gaps:** None - Border radius and shadows follow 8-bit aesthetic.

---

### 3.3 Typography and Spacing

**Current Spec (Section 1.1, 1.3):**
```css
/* Mobile Typography Rules */
- Base font size: 14px on mobile, 16px on desktop
- Minimum touch target: 44px height (iOS safe)

/* Component Sizes */
--size-xs: 32px;    /* Small buttons */
--size-sm: 40px;    /* Standard buttons */
--size-md: 48px;    /* Large buttons */
--size-lg: 56px;    /* Extra large */
```

**Status:** ✅ **COMPLIANT**

**Gaps:** None - Typography and spacing follow mobile-first accessibility standards.

---

### 3.4 Animation Principles

**Current Spec (Section 8.1):**
```css
/* 8-bit Animation Style: */
- Snappy: Short durations (150-300ms)
- Linear easing: No easing on hover state
- Descriptionful: Every transition communicates state change
```

**Status:** ✅ **COMPLIANT**

**Gaps:** None - Animation principles follow 8-bit aesthetic.

**Overall 8-bit Design Alignment:** ✅ **95% COMPLIANT**
- Typography: ✅
- Colors: ✅
- Border radius: ✅
- Shadows: ✅
- Animations: ✅
- Minor inconsistencies in some component examples (acceptable)

---

## 4. Platform Responsiveness Gaps

### 4.1 Plugin Count Limits

**New Architecture Requirements:**

| Platform | Max Plugins | Default Plugins |
|----------|-------------|-----------------|
| **Desktop** | 3 | FileTree, Monaco, Chat |
| **Tablet** | 2 | FileTree, Monaco |
| **Mobile** | 1 | Notes only |

**Current Spec:** ❌ **NOT SPECIFIED**

**Gaps:**
1. ❌ No maximum plugin count per platform
2. ❌ No UI indicator showing "3/3 plugins active"
3. ❌ No warning when attempting to add 4th plugin
4. ❌ No auto-disable of lowest-priority plugin when exceeding limit
5. ❌ No plugin priority system (which gets disabled first?)

---

### 4.2 Platform-Specific Availability

**Current Spec (Section 6.2):** Mentions some platform differences (sidebar location, etc.), but not plugin availability.

**New Architecture Requirements:**

| Plugin | Desktop | Tablet | Mobile |
|--------|---------|--------|--------|
| **Monaco** | ✅ | ✅ | ❌ (no IDE access) |
| **Terminal** | ✅ | ❌ (no FSA) | ❌ (no FSA) |
| **Preview** | ✅ | ❌ (no WebContainer) | ❌ (no WebContainer) |
| **FileTree** | ✅ | ✅ | ✅ |
| **Chat** | ✅ | ✅ | ✅ |
| **Notes** | ✅ | ✅ | ✅ |

**Status:** ❌ **NOT SPECIFIED**

**Gaps:**
1. ❌ No platform capability matrix for plugins
2. ❌ No disabled state styling for unavailable plugins
3. ❌ No tooltip/explanation for why a plugin is disabled
4. ❌ No "Platform limitations" education pattern

---

### 4.3 Orientation Handling

**Current Spec (Section 6.4):**
```
**Orientation Lock:**
- IDE: Lock to landscape (tablet only)
- Notes/Knowledge: Allow both
- Study: Lock to portrait (flashcards)
```

**Status:** ⚠️ **PARTIALLY ALIGNED**

**Gaps:**
1. ❌ Plugin-based system changes orientation rules (no longer workspace-centric)
2. ❌ Missing orientation rules for mobile plugin switching
3. ❌ No guidance for plugin layout on landscape vs portrait

---

## 5. User Journey Issues

### 5.1 First-Time User (Onboarding)

**Current Onboarding Gap:**
- User opens app on desktop
- Sees empty IDE workspace (if no project selected)
- ❌ No clear CTA to "Add plugins"
- ❌ No explanation of plugin system
- ❌ No default plugins loaded automatically

**Required Journey:**
1. User creates/selects project
2. Platform detection runs (desktop/tablet/mobile)
3. Default plugins auto-load based on platform
4. Plugin toolbar shows active plugins with toggle buttons
5. User can add more plugins (up to limit)
6. Layout mode selector shows available presets

**Gaps:**
1. ❌ No onboarding pattern for plugin system
2. ❌ No "Default plugins loaded for your platform" notification
3. ❌ No progressive plugin discovery

---

### 5.2 Mobile User Experience

**Current Mobile UX (Section 6.2):**
- Bottom navigation bar (48px height)
- Drawer for file tree
- Modal for terminal
- Overlay for chat

**New Mobile UX Requirements:**
- Single plugin visible at a time
- Tab bar for plugin switching
- Disabled plugins greyed out with tooltip

**Journey Issue:**
1. User opens app on mobile
2. Sees Notes plugin only (default)
3. ❌ No indication that Terminal/Monaco exist but are disabled
4. ❌ No "View all plugins" button (just tab bar)
5. ❌ No "Switch to desktop" CTA for advanced features

**Gaps:**
1. ❌ No platform feature comparison education
2. ❌ No "upgrade to desktop" marketing message
3. ❌ Missing context for why features are unavailable

---

### 5.3 Desktop Power User

**Current Desktop UX (Section 3.1):**
- Traditional IDE layout (file tree, editor, terminal, preview)
- Drag-drop panels for customization

**New Desktop UX Requirements:**
- Plugin toggle toolbar
- Layout mode selector (2-col, 3-col, 2+1)
- Progressive plugin discovery

**Journey Issue:**
1. Power user opens app
2. Wants to customize layout
3. ❌ No clear way to add new plugins (just toggle buttons)
4. ❌ No "Advanced layouts" disclosure (beyond presets)
5. ❌ No plugin marketplace access

**Gaps:**
1. ❌ Missing "Plugin Manager" entry point
2. ❌ No plugin settings/access control UI
3. ❌ No plugin marketplace browse/search

---

## 6. Outdated Workspace-Centric Patterns

### 6.1 Workspace Navigation (Section 4.1)

**Current Pattern:**
```
┌────────┐
│ 🏠     │ ← Home (Hub)
├────────┤
│ 💻     │ ← IDE workspace
├────────┤
│ 📚     │ ← Knowledge workspace
├────────┤
│ 📝     │ ← Notes workspace
├────────┤
│ 🎓     │ ← Study workspace
└────────┘
```

**Status:** ❌ **OUTDATED**

**New Pattern:**
```
┌─────────────────────────────────────────────────────────┐
│ Via-gent | [=] | [D] [N] [T] [P] [C] [F] | Layout: [2] [3] [4] [5] |
└─────────────────────────────────────────────────────────┘
```

**Issue:**
- Workspaces are now composed of plugins, not separate routes
- Navigation should show active project, not workspace icons

**Remediation Needed:**
1. Remove workspace-centric activity bar
2. Add project-centric header
3. Add plugin toggle toolbar
4. Add layout mode selector

---

### 6.2 Workspace Layouts (Section 3.1 - 3.4)

**Current Patterns:**
- IDE Workspace: File tree + Monaco + Terminal + Preview
- Knowledge Workspace: Sources + Canvas
- Notes Workspace: Note list + BlockNote editor
- Study Workspace: Deck selector + Card view

**Status:** ❌ **OUTDATED**

**New Pattern:**
- All workspaces are composed of plugins
- Plugins can be combined in any way (within platform limits)
- Layout presets optimize for common combinations

**Issue:**
- Hardcoded workspace layouts prevent flexibility
- Users cannot customize workspace composition

**Remediation Needed:**
1. Remove workspace-specific layout sections
2. Add plugin composition guidelines
3. Add layout preset system
4. Document common plugin combinations (e.g., "Debugging workflow: FileTree + Monaco + Terminal + Chat")

---

## 7. Recommended Updates to ux-specification.md

### 7.1 New Section: Plugin System UX (HIGH PRIORITY)

**Proposed Content:**
```markdown
## 3.5 Plugin System UX

### 3.5.1 Plugin Toggle Toolbar

Component: `PluginToolbar.tsx`

Features:
- Toggle buttons for each available plugin
- Visual indicator for active/inactive state
- Disabled state for platform-incompatible plugins
- Plugin count indicator (e.g., "3/3 active")

Layout:
- Desktop: Horizontal toolbar below header
- Tablet: Compact horizontal toolbar
- Mobile: Bottom tab bar (single plugin visible)

### 3.5.2 Platform-Aware Plugin Limits

| Platform | Max Plugins | Default Plugins |
|----------|-------------|-----------------|
| Desktop  | 3           | FileTree, Monaco, Chat |
| Tablet   | 2           | FileTree, Monaco |
| Mobile   | 1           | Notes |

UX Rules:
- Show warning when attempting to exceed limit
- Auto-disable lowest-priority plugin if limit exceeded
- Gray out disabled plugins with tooltip

### 3.5.3 Layout Mode Selector

Pre-designed layouts:
- 2-column: FileTree + Monaco
- 3-column: FileTree + Monaco + Chat
- 2+1: FileTree + Monaco + Terminal + Chat (2 rows)

UX Rules:
- Show only layouts compatible with active plugin count
- Active layout button has orange background
- Layout buttons use icons, not text (save space)

### 3.5.4 Plugin Management Dialog

Trigger: Click "Add Plugin" or [+]

Features:
- List available plugins
- Platform requirement indicators (Desktop only, requires FSA, etc.)
- Compatibility check per plugin
- Add/Remove buttons

UX Rules:
- Disabled plugins show "Not available on your platform"
- Plugin count warning: "You have 3/3 plugins active"
- CTA: "Add plugin" (disabled if at limit)

### 3.5.5 Progressive Disclosure

Level 1 (Visible): FileTree, Monaco, Chat
Level 2 (Click to reveal): Terminal, Preview, Notes
Level 3 (Hidden by default): Advanced plugins

UX Rules:
- "Show more plugins" button reveals Level 2
- "Advanced" tab reveals Level 3
- Save plugin visibility preference per project
```

---

### 7.2 Update Section 6.2: Mobile Adaptations

**Proposed Updates:**
```markdown
### 6.2 Mobile Adaptations

#### Plugin System on Mobile

**Plugin Limit:** 1 active plugin at a time

**Layout:**
```
+--------------------------------------+
| [Single Panel - Full Height]         |
| - Shows active plugin only            |
+--------------------------------------+
| [F] [N] [C]  <- Tab Bar (bottom)    |
+--------------------------------------+
```

**Plugin Availability:**
| Plugin | Available | Reason |
|--------|-----------|--------|
| FileTree | ✅ | Basic file access |
| Notes | ✅ | Document editing |
| Chat | ✅ | AI assistant |
| Monaco | ❌ | No IDE access (FSA required) |
| Terminal | ❌ | No terminal (FSA required) |
| Preview | ❌ | No WebContainer support |

**UX Rules:**
- Tab bar shows only available plugins
- Disabled plugins not shown in tab bar
- "View all plugins" button shows disabled plugins with explanation
- Tooltip: "Terminal requires desktop with FSA access"
```

---

### 7.3 Update Section 3.1: IDE Workspace

**Proposed Updates:**
```markdown
### 3.1 IDE Workspace (Plugin-Based)

**Default Composition:**
- FileTree (30%) + Monaco (70%) for single-file editing
- FileTree (25%) + Monaco (45%) + Chat (30%) for coding workflow
- FileTree (25%) + Monaco (50%) + Terminal (25%) + Chat (full width) for debugging

**Layout Structure:**

Layout Mode: 2-Column
```
┌─────────────────────────────────────────────────────┐
│ Header: Project Name | Plugin Toolbar | Layout: [2] [3] [4] │
├──────┬──────────────────────────────────────────────┤
│      │ Monaco Panel (70%)                          │
│ Icon │ ┌────────────────────────────────────────┐   │
│ Bar  │ │ File: Button.tsx                   │   │
│      │ │ ────────────────────────────────────│   │
│      │ │ import React from 'react';          │   │
│      │ │                                    │   │
│      │ │ export function Button() {          │   │
│      │ │   return <button>Click</button>;    │   │
│      │ │ }                                  │   │
│      │ └────────────────────────────────────────┘   │
├──────┴──────────────────────────────────────────────┤
│ Status Bar | Modified | TypeScript | Line 42        │
└─────────────────────────────────────────────────────┘
```

Layout Mode: 3-Column
```
┌─────────────────────────────────────────────────────┐
│ Header: Project Name | Plugin Toolbar | Layout: [2] [3] [4] │
├────────┬──────────────────┬────────────────────────┤
│ File   │ Monaco (45%)     │ Chat (30%)             │
│ Tree   │                  │                        │
│ (25%)  │                  │                        │
├────────┴──────────────────┴────────────────────────┤
│ Status Bar | Modified | TypeScript | Line 42        │
└─────────────────────────────────────────────────────┘
```

**Plugin Interactions:**
- Toggle plugins on/off via toolbar buttons
- Switch layout modes via layout selector
- Layout persists per-project
- Plugin state persists per-project
```

---

### 7.4 Add New Section: Platform Capability Matrix

**Proposed Content:**
```markdown
## 6.5 Platform Capability Matrix

### Plugin Availability by Platform

| Plugin | Desktop | Tablet | Mobile | Requirements |
|--------|---------|--------|--------|--------------|
| **Monaco** | ✅ | ✅ | ❌ | Requires FSA for file access |
| **Terminal** | ✅ | ❌ | ❌ | Requires FSA + Desktop |
| **Preview** | ✅ | ❌ | ❌ | Requires WebContainer |
| **FileTree** | ✅ | ✅ | ✅ | Basic file access |
| **Chat** | ✅ | ✅ | ✅ | No special requirements |
| **Notes** | ✅ | ✅ | ✅ | No special requirements |

### UX Indicators for Unavailable Plugins

**Desktop-only Plugins (Terminal, Preview):**
```tsx
<Badge variant="destructive" className="text-xs">
  Desktop only
</Badge>
<Tooltip>
  Requires desktop with FSA access
</Tooltip>
```

**FSA-required Plugins (Monaco, Terminal):**
```tsx
<Badge variant="warning" className="text-xs">
  Requires file system access
</Badge>
<Tooltip>
  Not available in browser-only mode
</Tooltip>
```

### Progressive Disclosure of Platform Limitations

**Level 1:** Show only available plugins
**Level 2:** Show disabled plugins with "Desktop only" badge
**Level 3:** Show detailed requirements (FSA, WebContainer, etc.)
```

---

## 8. Priority Recommendations

### Phase 1A (Immediate - Blocker for Plugin System)

| Priority | Update | Effort | Impact |
|----------|--------|--------|--------|
| 🔴 **P0** | Add Section 3.5: Plugin System UX | 4h | CRITICAL - No plugin patterns exist |
| 🔴 **P0** | Update Section 6.2: Mobile plugin limits | 2h | CRITICAL - Mobile UX broken |
| 🔴 **P0** | Add Section 6.5: Platform capability matrix | 2h | CRITICAL - No platform rules |
| 🟠 **P1** | Update Section 4.1: Navigation patterns | 1h | HIGH - Outdated navigation |
| 🟠 **P1** | Update Section 3.1: IDE workspace layouts | 2h | HIGH - Workspace-centric patterns |

**Total Effort:** 11 hours
**Timeline:** Before starting EPIC-CC-AR02AR03 implementation

---

### Phase 1B (Post-Plugin System)

| Priority | Update | Effort | Impact |
|----------|--------|--------|--------|
| 🟡 **P2** | Remove workspace-centric sections | 3h | MEDIUM - Clean up outdated content |
| 🟡 **P2** | Add plugin marketplace UX patterns | 4h | MEDIUM - Future enhancement |
| 🟢 **P3** | Add plugin analytics UX | 2h | LOW - Nice to have |

**Total Effort:** 9 hours
**Timeline:** After EPIC-CC-AR02AR03 completion

---

## 9. Conclusion

### Summary

The current `ux-specification.md` is **significantly misaligned** with the new plugin-based architecture. Key issues:

1. **Workspace-centric patterns** are outdated (plugins replace fixed workspaces)
2. **Plugin system UX patterns** are completely missing
3. **Platform-specific rules** (plugin counts, availability) are not specified
4. **Layout system** assumes drag-drop (being removed), not toggle-based presets
5. **Mobile UX** is incomplete (missing 1-plugin limit, disabled plugin indicators)

### Alignment Score

| Category | Current Alignment | Target Alignment | Gap |
|----------|------------------|-------------------|-----|
| **Plugin System UX** | 10% | 100% | 90% |
| **Platform Responsiveness** | 40% | 100% | 60% |
| **8-bit Design Compliance** | 95% | 100% | 5% |
| **Layout System** | 0% | 100% | 100% |
| **Progressive Disclosure** | 20% | 100% | 80% |

**Overall Alignment:** 33% (5 categories average)

### Critical Blockers

The following UX patterns **must** be documented before EPIC-CC-AR02AR03 implementation:

1. ✅ Plugin toggle toolbar component
2. ✅ Layout mode selector component
3. ✅ Platform capability indicators
4. ✅ Plugin management dialog
5. ✅ Mobile plugin limit (1 plugin)
6. ✅ Platform-specific plugin availability

Without these patterns, developers will lack UX guidance for plugin system implementation, risking inconsistent user experience.

### Next Steps

1. **Immediate:** Update `ux-specification.md` with Phase 1A recommendations (11 hours)
2. **Parallel:** Developers can start EPIC-CC-AR02AR03 implementation with updated UX spec
3. **Post-Completion:** Update remaining sections (Phase 1B recommendations, 9 hours)

---

**Analysis Completed:** 2026-01-26
**Timebox:** 30 minutes (used: 25 minutes)
**Evidence:** Component alignment table, UX gap identification, platform responsiveness analysis

---

**Related Documents:**
- EPIC-CC-AR02AR03: Plugin System Complete Rework for Phase 1A
- architecture.md: Via-Gent Architecture Document v2.0.0
- ux-specification.md: Current UX/UI Design Specification v1.0.0
