# P1.3 Information Architecture Audit

**EPIC_ID**: Epic-23
**STORY_ID**: P1.3
**CREATED_AT**: 2025-12-25T21:02:00Z
**ARTIFACT_ID**: IA-AUDIT-2025-12-25-001

## Executive Summary

This document provides a comprehensive audit of the current information architecture in Via-gent IDE and identifies gaps in discoverability, navigation, and user guidance.

## Current Navigation Hierarchy

### Primary Navigation (IconSidebar)
**Location**: `src/components/ide/IconSidebar.tsx`

**Structure**:
```
Activity Bar (48px)
├── Explorer Panel
├── Agents Panel
├── Search Panel
├── Terminal Panel
├── Git Panel (placeholder)
└── Settings Panel (bottom)

Sidebar Content (280px, collapsible)
└── Dynamic content based on active panel
```

**Panel IDs**: `'explorer' | 'agents' | 'search' | 'terminal' | 'git' | 'settings'`

**Current Features**:
- ✅ Collapsible sidebar (Ctrl+B toggle)
- ✅ Active panel indicator (left border)
- ✅ LocalStorage persistence
- ✅ Keyboard navigation support
- ❌ No tooltips on icons
- ❌ No keyboard shortcuts visible
- ❌ No context-aware help

### Secondary Navigation (Breadcrumbs)
**Location**: `src/components/ui/breadcrumbs.tsx`

**Current Implementation**:
- Static items array passed as props
- No dynamic path generation
- No context-aware updates
- No integration with IDE state

**Issues**:
- ❌ Not connected to file tree state
- ❌ Not connected to active file
- ❌ No nested path support
- ❌ Not used in IDELayout

### Main Layout (IDELayout)
**Location**: `src/components/layout/IDELayout.tsx`

**Panel Structure**:
```
IDELayout
├── IDEHeaderBar (top)
├── ActivityBar + SidebarContent (left)
├── Main Content (center)
│   ├── Editor Panel
│   ├── Preview Panel
│   └── Terminal Panel
├── Chat Panel (right, toggleable)
└── StatusBar (bottom)
```

**Current State**:
- ✅ Resizable panels (react-resizable-panels)
- ✅ Collapsible sidebar
- ✅ Toggleable chat panel
- ❌ No breadcrumbs integration
- ❌ No tooltips on UI elements
- ❌ No keyboard shortcuts documentation
- ❌ No feature discovery guide

## Identified Issues

### 1. Poor Discoverability

**Problem**: Users cannot easily discover IDE features
- No tooltips on sidebar icons
- No keyboard shortcuts visible
- No feature discovery guide
- No help documentation accessible

**Impact**:
- New users struggle to find features
- Power users cannot discover keyboard shortcuts
- Hidden features remain unused

### 2. Static Breadcrumbs

**Problem**: Breadcrumbs component exists but is not integrated
- No dynamic path generation
- No connection to file tree state
- No connection to active file
- Not used in IDELayout

**Impact**:
- Users cannot see current file location
- No navigation history
- Poor context awareness

### 3. Lack of Context-Aware Help

**Problem**: No contextual help for UI elements
- No tooltips on sidebar icons
- No tooltips on status bar segments
- No tooltips on editor tabs
- No tooltips on panel headers

**Impact**:
- Users don't understand what icons do
- No guidance for complex features
- Increased learning curve

### 4. No Progressive Disclosure

**Problem**: Complex UI sections are always fully visible
- No collapsible sections in panels
- No expand/collapse for advanced options
- No density control

**Impact**:
- Information overload
- Cluttered interface
- Reduced focus

### 5. Missing Keyboard Shortcuts Documentation

**Problem**: Keyboard shortcuts exist but are not documented
- Ctrl+B toggles sidebar (hidden)
- Other shortcuts may exist (unknown)
- No overlay to view all shortcuts

**Impact**:
- Users cannot learn shortcuts
- Reduced efficiency
- Hidden productivity features

### 6. No Feature Discovery Guide

**Problem**: No onboarding or tour system
- No interactive tour
- No on-demand help
- No feature highlights

**Impact**:
- Long time to value
- Missed features
- Poor first-time experience

## Proposed Improvements

### 1. Dynamic Breadcrumbs
**Priority**: HIGH
**Implementation**:
- Connect to file tree state
- Show current file path
- Support nested navigation
- Add click-to-navigate

**Components**:
- Update `Breadcrumbs` component
- Integrate with `IDELayout`
- Add path state management

### 2. Context-Aware Tooltips
**Priority**: HIGH
**Implementation**:
- Add tooltips to sidebar icons
- Add tooltips to status bar segments
- Add tooltips to editor tabs
- Use Radix UI Tooltip component

**Components**:
- Create `ContextTooltip` component
- Update `IconSidebar`
- Update `StatusBar`
- Update `EditorTabBar`

### 3. Progressive Disclosure
**Priority**: MEDIUM
**Implementation**:
- Add collapsible sections to panels
- Add expand/collapse for advanced options
- Use CVA patterns from P1.2
- Maintain 8-bit aesthetic

**Components**:
- Create `CollapsibleSection` component
- Update `ExplorerPanel`
- Update `AgentsPanel`
- Update `SettingsPanel`

### 4. Keyboard Shortcuts Overlay
**Priority**: MEDIUM
**Implementation**:
- Create overlay component
- Display all keyboard shortcuts
- Add keyboard shortcut to open overlay
- Use design tokens and 8-bit styling

**Components**:
- Create `KeyboardShortcutsOverlay` component
- Add to `IDELayout`
- Add keyboard shortcut (Ctrl+K or Cmd+K)
- Add i18n support

### 5. Feature Discovery Guide
**Priority**: MEDIUM
**Implementation**:
- Create tour component
- Add interactive highlights
- Add on-demand help button
- Use design tokens and 8-bit styling

**Components**:
- Create `FeatureDiscoveryGuide` component
- Add to `IDELayout`
- Add help button to header
- Add i18n support

## Navigation Hierarchy Map

### Current State
```
Via-gent IDE
├── Header (IDEHeaderBar)
│   ├── Project selector
│   └── Chat toggle
├── Activity Bar (IconSidebar)
│   ├── Explorer
│   ├── Agents
│   ├── Search
│   ├── Terminal
│   ├── Git
│   └── Settings
├── Sidebar Content (280px, collapsible)
│   └── Dynamic panel content
├── Main Content
│   ├── Editor (MonacoEditor)
│   ├── Preview (PreviewPanel)
│   └── Terminal (XTerminal)
├── Chat Panel (toggleable)
│   └── AgentChatPanel
└── StatusBar
    ├── Sync Status
    ├── WebContainer Status
    ├── Cursor Position
    └── File Type
```

### Proposed State (After P1.3)
```
Via-gent IDE
├── Header (IDEHeaderBar)
│   ├── Project selector
│   ├── Chat toggle
│   └── Help button (NEW)
├── Activity Bar (IconSidebar)
│   ├── Explorer (with tooltips)
│   ├── Agents (with tooltips)
│   ├── Search (with tooltips)
│   ├── Terminal (with tooltips)
│   ├── Git (with tooltips)
│   └── Settings (with tooltips)
├── Sidebar Content (280px, collapsible)
│   ├── Breadcrumbs (NEW, dynamic)
│   └── Dynamic panel content
│       └── Collapsible sections (NEW)
├── Main Content
│   ├── Editor (MonacoEditor)
│   │   └── Tabs with tooltips (NEW)
│   ├── Preview (PreviewPanel)
│   └── Terminal (XTerminal)
├── Chat Panel (toggleable)
│   └── AgentChatPanel
├── StatusBar
│   ├── Sync Status (with tooltips, NEW)
│   ├── WebContainer Status (with tooltips, NEW)
│   ├── Cursor Position (with tooltips, NEW)
│   └── File Type (with tooltips, NEW)
└── Overlays (NEW)
    ├── Keyboard Shortcuts Overlay
    └── Feature Discovery Guide
```

## Component Dependencies

### Existing Components to Modify
1. `src/components/ui/breadcrumbs.tsx` - Make dynamic
2. `src/components/ide/IconSidebar.tsx` - Add tooltips
3. `src/components/ide/StatusBar.tsx` - Add tooltips
4. `src/components/layout/IDELayout.tsx` - Integrate new components

### New Components to Create
1. `src/components/ui/context-tooltip.tsx` - Context-aware tooltips
2. `src/components/ui/collapsible-section.tsx` - Progressive disclosure
3. `src/components/ui/keyboard-shortcuts-overlay.tsx` - Shortcuts documentation
4. `src/components/ui/feature-discovery-guide.tsx` - Feature tour

## Translation Keys Required

### New Keys to Add
```json
{
  "breadcrumbs": {
    "home": "Home",
    "currentFile": "Current File"
  },
  "tooltips": {
    "explorer": "File Explorer - Browse and manage project files",
    "agents": "AI Agents - Configure and interact with AI assistants",
    "search": "Search - Find files and content in your project",
    "terminal": "Terminal - Execute commands and scripts",
    "git": "Git - Version control and repository management",
    "settings": "Settings - Configure IDE preferences",
    "toggleSidebar": "Toggle Sidebar (Ctrl+B)",
    "toggleChat": "Toggle Chat Panel",
    "help": "Help & Shortcuts (Ctrl+K)"
  },
  "keyboardShortcuts": {
    "title": "Keyboard Shortcuts",
    "close": "Close (Esc)",
    "toggleSidebar": "Toggle Sidebar",
    "toggleChat": "Toggle Chat",
    "openShortcuts": "Open Keyboard Shortcuts",
    "saveFile": "Save File",
    "closeTab": "Close Tab",
    "focusEditor": "Focus Editor",
    "focusTerminal": "Focus Terminal"
  },
  "featureDiscovery": {
    "title": "Feature Discovery",
    "skip": "Skip Tour",
    "next": "Next",
    "previous": "Previous",
    "finish": "Finish",
    "explorer": "File Explorer allows you to browse and manage your project files",
    "agents": "AI Agents help you write, debug, and refactor code",
    "chat": "Chat with AI agents to get assistance with your code",
    "terminal": "Terminal lets you run commands and scripts in your project"
  },
  "collapsible": {
    "expand": "Expand",
    "collapse": "Collapse",
    "showAdvanced": "Show Advanced Options",
    "hideAdvanced": "Hide Advanced Options"
  }
}
```

## Implementation Priority

### Phase 1: Critical (Must Have)
1. ✅ Dynamic Breadcrumbs
2. ✅ Context-Aware Tooltips on Sidebar
3. ✅ Keyboard Shortcuts Overlay

### Phase 2: Important (Should Have)
4. ✅ Context-Aware Tooltips on StatusBar
5. ✅ Progressive Disclosure for Complex Sections

### Phase 3: Nice to Have (Could Have)
6. ✅ Feature Discovery Guide
7. ✅ Context-Aware Tooltips on Editor Tabs

## Success Criteria

### Metrics to Track
- **Discoverability**: Time to find features (target: < 30s for common features)
- **Navigation Efficiency**: Number of clicks to reach common actions (target: < 3)
- **Help Usage**: Number of times tooltips viewed (target: > 5 per session)
- **Shortcuts Adoption**: Percentage of users using keyboard shortcuts (target: > 30%)

### User Testing
- Conduct usability tests with 5 new users
- Measure time to complete common tasks
- Collect qualitative feedback on discoverability
- A/B test tooltips on/off

## Conclusion

The current information architecture has a solid foundation with the IconSidebar and panel system, but lacks critical discoverability features. Implementing the proposed improvements will significantly enhance the user experience by:

1. **Improving Navigation**: Dynamic breadcrumbs provide context
2. **Enhancing Discoverability**: Tooltips reveal hidden features
3. **Increasing Efficiency**: Keyboard shortcuts documentation accelerates workflows
4. **Reducing Learning Curve**: Feature discovery guides new users
5. **Managing Complexity**: Progressive disclosure reduces information overload

These improvements align with the 8-bit design system and will use design tokens and CVA patterns from P1.1 and P1.2.

## References

- Design System: `_bmad-output/design-system-8bit-2025-12-25.md`
- Design Tokens: `src/styles/design-tokens.css`
- UX Audit: `_bmad-output/ux-ui-audit-2025-12-25.md`
- Component Guidelines: `AGENTS.md`
- Existing Components: `src/components/ui/breadcrumbs.tsx`, `src/components/ide/IconSidebar.tsx`
