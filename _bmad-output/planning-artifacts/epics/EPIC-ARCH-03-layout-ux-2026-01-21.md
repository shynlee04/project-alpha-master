# EPIC-ARCH-03: Layout System & UX

**Epic ID:** EPIC-ARCH-03
**Created:** 2026-01-21
**Updated:** 2026-01-21 (Amendment 001 integrated)
**Status:** APPROVED
**Priority:** P1
**Estimated Duration:** 2 days (AI agent time)
**Team:** Both (Team A + Team B parallel)
**ADR Reference:** ADR-034 Phase 3 + ADR-034-AMENDMENT-001
**Depends On:** EPIC-ARCH-02 ✅ COMPLETE (Verified 2026-01-21)

---

## 🚨 CRITICAL AMENDMENT: ADR-034-AMENDMENT-001

**READ FIRST:** `_bmad-output/planning-artifacts/adr/ADR-034-AMENDMENT-001-platform-first-2026-01-21.md`

### Summary of Amendment

The "IDE mode" vs "Notes mode" concept is **ELIMINATED**. Replace with:

| OLD (Wrong) | NEW (Correct) |
|-------------|---------------|
| `?layout=ide` / `?layout=notes` | No layout param - platform decides |
| Navigate to `/ide/$projectId` | Navigate to `/$projectId` |
| Navigate to `/notes/$projectId` | Navigate to `/$projectId` |
| User picks "workspace mode" | Platform determines available plugins |

### New Story Added: ARCH-03-00 (BLOCKING)

**ARCH-03-00 must complete before ARCH-03-01 navigation logic is finalized.**

---

## Executive Summary

Complete the project-centric architecture transformation by implementing the remaining layout and UX components from ADR-034 Phase 3. This epic focuses on:

1. **Platform-first defaults** - Eliminate IDE/Notes mode distinction (NEW - ARCH-03-00)
2. **ProjectSidebar** - The primary navigation component for project/chat switching
3. **Mobile-responsive layouts** - Ensure plugin layouts work on all devices
4. **Layout presets** - Save/load user-customized layouts (NOT workspace modes)
5. **Drag-drop polish** - Complete the plugin reordering UX
6. **Progressive disclosure** - Simplify first-time user experience

---

## Prerequisites Verification

Before starting this epic, verify:

```bash
# 1. TypeScript compiles with 0 errors (goal, may have legacy errors)
pnpm tsc --noEmit

# 2. Application starts without errors
pnpm dev

# 3. All 5 plugins load on /$projectId route
# Manual: Navigate to a project, verify FileTree, Monaco, Notes, Terminal, Chat render

# 4. OLD redirects work (will be deprecated in ARCH-03-00)
# Manual: /ide/$projectId redirects to /$projectId?layout=ide
# Manual: /notes/$projectId redirects to /$projectId?layout=notes
```

---

## Problem Statement

### Current State (After EPIC-ARCH-02)

```
✅ COMPLETE:
- 5 feature plugins (FileTree, Monaco, Notes, Terminal, Chat)
- PluginLayout with 4 modes (1-column, 2-column, 3-column, 2+1)
- /$projectId unified route
- ProjectContextProvider
- Plugin registry

⚠️ ARCHITECTURAL ISSUE (Per Amendment 001):
- Still has "layout=ide" vs "layout=notes" concept
- Still navigates to /ide/$projectId and /notes/$projectId
- This perpetuates workspace-centric thinking

❌ MISSING (ADR-034 Phase 3):
- Platform-first plugin defaults (Amendment 001)
- ProjectSidebar with project list and chat threads
- Mobile-responsive layouts (not tested)
- Layout presets (save/load, NOT workspace modes)
- Drag-drop visual polish
- Progressive disclosure for new users
```

### Target State

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER: Logo | Project Name | Layout Preset Picker | Settings          │
├──────────────┬──────────────────────────────────────────────────────────┤
│ PROJECT      │                                                          │
│ SIDEBAR      │  ┌─────────────┬─────────────┬─────────────┐            │
│              │  │             │             │             │            │
│ ▼ Projects   │  │  Plugin 1   │  Plugin 2   │  Plugin 3   │            │
│   📁 Proj A  │  │  (Monaco)   │  (Notes)    │  (Terminal) │            │
│   📁 Proj B  │  │             │             │             │            │
│              │  │   Drag ≡    │   Drag ≡    │   Drag ≡    │            │
│ ▼ Chat       │  └─────────────┴─────────────┴─────────────┘            │
│   💬 Thread1 │                                                          │
│   💬 Thread2 │  [+ Add Plugin]                                          │
│              │                                                          │
│ ▼ Agents     │  Layout: [1-col] [2-col] [3-col] [2+1]                  │
│   🤖 Agent1  │                                                          │
└──────────────┴──────────────────────────────────────────────────────────┘
```

**Mobile View (< 768px):**
```
┌────────────────────────┐
│ ≡ | Project Name | ⚙️  │
├────────────────────────┤
│                        │
│    Active Plugin       │
│    (Full Screen)       │
│                        │
├────────────────────────┤
│ [📁] [📝] [💬] [⌨️]   │  ← Plugin tabs (bottom nav)
└────────────────────────┘
```

---

## Architecture

### Component Hierarchy

```
src/routes/__root.tsx
└── AppLayout
    ├── Header
    │   ├── SidebarToggle (hamburger on mobile)
    │   ├── ProjectName
    │   ├── LayoutPresetPicker
    │   └── SettingsMenu
    │
    ├── ProjectSidebar (NEW - ARCH-03-01)
    │   ├── ProjectList
    │   ├── ChatThreadList
    │   └── AgentToolsPanel (collapsed)
    │
    └── MainContent
        └── PluginLayout (from ARCH-02-09)
            └── PluginPanel[] (with drag-drop - ARCH-03-04)
```

### State Management

```typescript
// src/infrastructure/persistence/stores/sidebar-store.ts
interface SidebarState {
  isOpen: boolean;
  activeSection: 'projects' | 'chat' | 'agents';
  width: number;
  
  // Actions
  toggle: () => void;
  setActiveSection: (section: string) => void;
  setWidth: (width: number) => void;
}

// src/infrastructure/persistence/stores/layout-presets-store.ts
interface LayoutPresetsState {
  presets: LayoutPreset[];
  activePresetId: string | null;
  
  // Actions
  savePreset: (name: string, plugins: PluginId[], mode: LayoutMode) => void;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
}

interface LayoutPreset {
  id: string;
  name: string;
  plugins: PluginId[];
  layoutMode: LayoutMode;
  panelSizes: Record<string, number>;
  isBuiltIn: boolean;
  projectId?: string; // null = global preset
}
```

### Built-in Presets

**UPDATED per Amendment 001:** Presets are now "saved layouts", NOT "workspace modes".

```typescript
// BEFORE (workspace-centric - WRONG)
const BUILT_IN_PRESETS = [
  { id: 'preset-ide', name: 'IDE Mode', ... },
  { id: 'preset-notes', name: 'Notes Mode', ... },
];

// AFTER (platform-first - CORRECT)
const BUILT_IN_PRESETS: LayoutPreset[] = [
  {
    id: 'preset-coding',
    name: 'Coding',  // NOT "IDE Mode"
    plugins: ['filetree', 'monaco', 'terminal', 'chat'],
    layoutMode: '2+1',
    panelSizes: { filetree: 20, monaco: 50, terminal: 30 },
    isBuiltIn: true,
    // NOTE: Only available on desktop-fsa (platform checks this)
  },
  {
    id: 'preset-writing',
    name: 'Writing',  // NOT "Notes Mode"
    plugins: ['filetree', 'notes', 'chat'],
    layoutMode: '2-column',
    panelSizes: { filetree: 25, notes: 75 },
    isBuiltIn: true,
    // Available on all platforms
  },
  {
    id: 'preset-focus',
    name: 'Focus',
    plugins: ['monaco'],  // or ['notes'] depending on available plugins
    layoutMode: '1-column',
    panelSizes: { monaco: 100 },
    isBuiltIn: true,
  },
];
```

---

## Stories

### 🚨 ARCH-03-00: Platform-First Plugin Defaults (BLOCKING)

**Priority:** P0 (BLOCKING) | **Effort:** 2 hours | **Team:** Team A
**Depends On:** None
**BLOCKS:** ARCH-03-01 navigation logic, ARCH-03-03 presets

**Reference:** `ADR-034-AMENDMENT-001-platform-first-2026-01-21.md`

Eliminate "IDE mode" vs "Notes mode" distinction. Platform determines available plugins.

**Files to Create:**
```
src/infrastructure/plugins/platform-defaults.ts    (getDefaultPlugins, getDefaultLayoutMode)
```

**Files to Modify:**
```
src/routes/$projectId.tsx                         (remove LayoutPreset, use platform defaults)
src/routes/ide.$projectId.tsx                     (add deprecation, redirect without layout param)
src/routes/notes.$projectId.tsx                   (add deprecation, redirect without layout param)
src/presentation/layouts/PluginLayout.tsx         (remove initialPlugins/initialLayoutMode props)
src/presentation/layouts/PluginLayoutStore.ts     (add initializeDefaults action)
```

**Implementation:**

1. Create `platform-defaults.ts`:
```typescript
export function getDefaultPlugins(
  platform: PlatformContract,
  project: Project
): PluginId[] {
  // Desktop FSA: Full development
  if (platform.deviceType === 'desktop' && project.storageType === 'fsa') {
    return ['filetree', 'monaco', 'chat'];
  }
  // Desktop IndexedDB: Notes-focused
  if (platform.deviceType === 'desktop' && project.storageType === 'indexeddb') {
    return ['filetree', 'notes', 'chat'];
  }
  // Tablet: Notes-focused
  if (platform.deviceType === 'tablet') {
    return ['filetree', 'notes', 'chat'];
  }
  // Mobile: Single plugin
  if (platform.deviceType === 'mobile') {
    return ['notes'];
  }
  return ['notes', 'chat'];
}

export function getDefaultLayoutMode(
  platform: PlatformContract
): LayoutMode {
  if (platform.deviceType === 'mobile') return '1-column';
  if (platform.deviceType === 'tablet') return '2-column';
  return '2-column';
}
```

2. Update `$projectId.tsx`:
```typescript
// REMOVE this:
type LayoutPreset = 'ide' | 'notes' | 'custom';
const PLUGIN_PRESETS = { ... };

// ADD this:
import { getDefaultPlugins, getDefaultLayoutMode } from '@/infrastructure/plugins/platform-defaults';

function UnifiedProjectRoute() {
  // Initialize with platform defaults if store is empty
  useEffect(() => {
    if (layoutStore.activePlugins.length === 0) {
      const defaults = getDefaultPlugins(platform, project);
      layoutStore.initializeDefaults(defaults, getDefaultLayoutMode(platform));
    }
  }, [project.id]);
  
  return (
    <ProjectContextProvider projectId={projectId}>
      <PluginLayout />  {/* NO PROPS */}
    </ProjectContextProvider>
  );
}
```

3. Update old routes:
```typescript
// ide.$projectId.tsx and notes.$projectId.tsx
beforeLoad: async ({ params }) => {
  console.warn('[DEPRECATED] Use /$projectId instead');
  throw redirect({ 
    to: '/$projectId', 
    params: { projectId: params.projectId },
    // NO search params
  });
},
```

**Acceptance Criteria:**
- [ ] `platform-defaults.ts` exists with both functions
- [ ] `$projectId.tsx` uses platform defaults, no LayoutPreset type
- [ ] Old routes log deprecation warning
- [ ] Old routes redirect to `/$projectId` without `?layout=` param
- [ ] `PluginLayout` has no props (reads from store)
- [ ] `PluginLayoutStore` has `initializeDefaults(plugins, mode)` action
- [ ] TypeScript: 0 new errors
- [ ] Manual test: Open project on desktop → sees default plugins
- [ ] Manual test: Old `/ide/$projectId` URL → redirects to `/$projectId`

---

### ARCH-03-01: Create ProjectSidebar Component

**Priority:** P0 | **Effort:** 4 hours | **Team:** Team A
**Depends On:** ARCH-03-00 (for navigation pattern)

**⚠️ AMENDMENT NOTE:** Navigation in ProjectSidebar MUST use `/$projectId` pattern (not `/ide/$projectId` or `/notes/$projectId`). See ARCH-03-00.

Create the collapsible sidebar that provides project switching and chat thread access.

**Files to Create:**
```
src/presentation/components/sidebar/ProjectSidebar.tsx       (main component)
src/presentation/components/sidebar/ProjectList.tsx          (project list)
src/presentation/components/sidebar/ChatThreadList.tsx       (chat threads)
src/presentation/components/sidebar/AgentToolsPanel.tsx      (collapsed agents)
src/presentation/components/sidebar/SidebarSection.tsx       (collapsible section)
src/presentation/components/sidebar/index.ts                 (exports)
src/infrastructure/persistence/stores/sidebar-store.ts       (state)
```

**Acceptance Criteria:**
- [ ] Collapsible sidebar with toggle button
- [ ] Project list with current project highlighted
- [ ] Search/filter projects by name
- [ ] Click project navigates to `/$projectId`
- [ ] Chat threads section showing threads for current project
- [ ] Click thread opens in Chat plugin
- [ ] Agent tools section (collapsed by default)
- [ ] Width resizable (drag edge)
- [ ] State persisted to localStorage
- [ ] 8-bit design: sharp corners, pixel shadows, solid colors
- [ ] TypeScript: 0 errors

**Component API:**
```typescript
interface ProjectSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentProjectId?: string;
}
```

**Design Specification:**
```css
/* 8-bit Sidebar Design */
.sidebar {
  width: 280px;
  min-width: 200px;
  max-width: 400px;
  border-right: 2px solid #000;
  background: #f0f0f0;
}

.sidebar-section-header {
  padding: 8px 12px;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 1px;
  border-bottom: 1px solid #ccc;
  cursor: pointer;
}

.sidebar-item {
  padding: 8px 12px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
}

.sidebar-item:hover {
  background: #e0e0e0;
}

.sidebar-item.active {
  background: #333;
  color: #fff;
}
```

---

### ARCH-03-02: Mobile-Responsive Plugin Layouts

**Priority:** P0 | **Effort:** 4 hours | **Team:** Team B
**Depends On:** ARCH-03-01 (sidebar needed for mobile testing context)

Ensure PluginLayout adapts correctly to mobile and tablet viewports.

**Files to Modify:**
```
src/presentation/layouts/PluginLayout.tsx     (add responsive logic)
src/presentation/layouts/PluginPanel.tsx      (touch-friendly resize)
src/presentation/layouts/PluginLayoutStore.ts (responsive state)
src/presentation/layouts/MobilePluginNav.tsx  (NEW - bottom navigation)
```

**Breakpoints:**
```typescript
const BREAKPOINTS = {
  mobile: 375,    // iPhone SE
  mobileLg: 414,  // iPhone Pro Max
  tablet: 768,    // iPad portrait
  desktop: 1024,  // iPad landscape / small laptop
  wide: 1440,     // Desktop
};

const LAYOUT_RULES = {
  mobile: {
    maxPlugins: 1,
    layoutMode: '1-column',
    sidebarMode: 'overlay',
    showBottomNav: true,
  },
  tablet: {
    maxPlugins: 2,
    layoutMode: '2-column',
    sidebarMode: 'collapsible',
    showBottomNav: false,
  },
  desktop: {
    maxPlugins: 5,
    layoutMode: 'user-selected',
    sidebarMode: 'persistent',
    showBottomNav: false,
  },
};
```

**Acceptance Criteria:**
- [ ] Mobile (< 768px): Single plugin fullscreen with bottom tab navigation
- [ ] Tablet (768-1024px): 2-column max, collapsible sidebar
- [ ] Desktop (> 1024px): Full layout options, persistent sidebar
- [ ] No horizontal scroll at any viewport
- [ ] Touch targets ≥ 44x44px on mobile
- [ ] Swipe left/right to switch plugins on mobile
- [ ] Bottom nav shows icons for active plugins
- [ ] Sidebar overlays content on mobile (not push)
- [ ] TypeScript: 0 errors

**MobilePluginNav Component:**
```typescript
interface MobilePluginNavProps {
  activePlugins: PluginId[];
  currentPlugin: PluginId;
  onSwitchPlugin: (pluginId: PluginId) => void;
}

// Renders fixed bottom bar with plugin icons
// Click icon switches active plugin
// Active icon highlighted
```

---

### ARCH-03-03: Layout Presets System

**Priority:** P1 | **Effort:** 3 hours | **Team:** Team A
**Depends On:** ARCH-03-01 (presets shown in header)

Allow users to save and quickly switch between layout configurations.

**Files to Create:**
```
src/infrastructure/persistence/stores/layout-presets-store.ts  (state)
src/presentation/components/ui/LayoutPresetPicker.tsx          (dropdown)
src/presentation/components/ui/SavePresetDialog.tsx            (save modal)
src/presentation/layouts/LayoutPresets.ts                      (built-ins)
```

**Acceptance Criteria:**
- [ ] 3 built-in presets: IDE Mode, Notes Mode, Focus Mode
- [ ] Preset picker dropdown in header
- [ ] "Save Current Layout" option in dropdown
- [ ] Save dialog with name input
- [ ] Custom presets stored per project (in localStorage)
- [ ] Delete custom preset (swipe or context menu)
- [ ] Keyboard shortcuts: Cmd+1 (IDE), Cmd+2 (Notes), Cmd+3 (Focus)
- [ ] Presets persist across sessions
- [ ] TypeScript: 0 errors

**Preset Picker API:**
```typescript
interface LayoutPresetPickerProps {
  currentPresetId: string | null;
  onSelectPreset: (presetId: string) => void;
  onSavePreset: () => void;
}
```

---

### ARCH-03-04: Drag-Drop Plugin Reordering

**Priority:** P1 | **Effort:** 3 hours | **Team:** Team B
**Depends On:** ARCH-03-02 (responsive layout must be stable first)

Polish the existing `reorderPlugin()` functionality with visual feedback.

**Files to Modify:**
```
src/presentation/layouts/PluginPanel.tsx       (add drag handle, visual feedback)
src/presentation/layouts/PluginLayout.tsx      (drop zone highlighting)
src/presentation/layouts/plugin-dnd.css        (NEW - drag-drop styles)
```

**Acceptance Criteria:**
- [ ] Drag handle (≡ icon) in each panel header
- [ ] Cursor changes to `grabbing` during drag
- [ ] Dragged panel has elevated shadow + slight opacity
- [ ] Drop zones highlight on hover
- [ ] Smooth animation (200ms) on drop
- [ ] Keyboard accessible: Focus panel, use arrow keys to reorder
- [ ] Screen reader announces reorder
- [ ] Works on touch devices (long press to initiate)
- [ ] TypeScript: 0 errors

**Visual States:**
```css
/* Drag handle */
.plugin-drag-handle {
  cursor: grab;
  padding: 4px 8px;
  color: #666;
}

.plugin-drag-handle:active {
  cursor: grabbing;
}

/* Dragging state */
.plugin-panel.dragging {
  opacity: 0.8;
  box-shadow: 8px 8px 0 0 rgba(0, 0, 0, 0.3);
  z-index: 100;
}

/* Drop zone */
.plugin-drop-zone {
  border: 2px dashed transparent;
  transition: border-color 150ms;
}

.plugin-drop-zone.active {
  border-color: #0066cc;
  background: rgba(0, 102, 204, 0.1);
}
```

---

### ARCH-03-05: Progressive Disclosure UI

**Priority:** P2 | **Effort:** 2 hours | **Team:** Team A
**Depends On:** ARCH-03-03 (presets needed for simplified defaults)

Hide advanced features by default to simplify first-time experience.

**Files to Create:**
```
src/presentation/components/onboarding/LayoutOnboarding.tsx    (first-time hints)
src/infrastructure/persistence/stores/user-preferences-store.ts (preferences)
```

**Files to Modify:**
```
src/presentation/layouts/PluginLayout.tsx  (conditional UI)
```

**Acceptance Criteria:**
- [ ] First-time users see 2-column layout (Notes Mode preset)
- [ ] "Add Plugin" button visible but not prominent
- [ ] Advanced options (3-column, 2+1) behind "More layouts" toggle
- [ ] Tooltip hints on first load (dismissible)
- [ ] "Show advanced features" toggle in Settings
- [ ] Preferences stored in localStorage
- [ ] TypeScript: 0 errors

**User Preferences:**
```typescript
interface UserPreferences {
  showAdvancedLayouts: boolean;
  hasSeenOnboarding: boolean;
  defaultPresetId: string;
  
  setPreference: (key: string, value: any) => void;
  markOnboardingComplete: () => void;
}
```

---

### ARCH-03-06: Integrate ProjectSidebar into Root Layout

**Priority:** P0 | **Effort:** 2 hours | **Team:** Team B
**Depends On:** ARCH-03-01 (sidebar component must exist)

Wire ProjectSidebar into the application's root layout.

**Files to Modify:**
```
src/routes/__root.tsx                              (add sidebar slot)
src/presentation/components/layout/AppLayout.tsx   (restructure for sidebar)
src/presentation/components/layout/Header.tsx      (add sidebar toggle)
```

**Acceptance Criteria:**
- [ ] Sidebar renders on all routes (when project loaded)
- [ ] Hidden on /hub (no project context)
- [ ] Toggle button in header (hamburger icon)
- [ ] Desktop: sidebar persistent, collapsible
- [ ] Mobile: sidebar overlay with backdrop
- [ ] Sidebar state persisted across sessions
- [ ] Sidebar doesn't break existing route transitions
- [ ] TypeScript: 0 errors

**Layout Structure:**
```tsx
// AppLayout.tsx
<div className="app-layout">
  <Header onToggleSidebar={toggleSidebar} />
  <div className="app-content">
    {projectId && (
      <ProjectSidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
        currentProjectId={projectId}
      />
    )}
    <main className="main-content">
      <Outlet />
    </main>
  </div>
</div>
```

---

## Dependencies Graph

```
ARCH-03-00 (Platform Defaults) ← BLOCKING - Do first!
    ↓
ARCH-03-01 (ProjectSidebar) ← Navigation must use /$projectId
    ↓
    ├── ARCH-03-02 (Mobile Responsive) ← needs sidebar for mobile context
    │       ↓
    │       └── ARCH-03-04 (Drag-Drop) ← responsive must be stable first
    │
    ├── ARCH-03-03 (Presets) ← No "IDE mode"/"Notes mode", just saved layouts
    │       ↓
    │       └── ARCH-03-05 (Progressive Disclosure) ← presets for defaults
    │
    └── ARCH-03-06 (Root Integration) ← sidebar component needed
```

**CRITICAL:** ARCH-03-00 must complete before navigation logic in any other story is finalized.

---

## Parallel Execution Plan

### Team A (Stories: 00, 01, 03, 05)

| Time | Story | Description |
|------|-------|-------------|
| Day 1 AM (2h) | **ARCH-03-00** | Platform-First Defaults (BLOCKING) |
| Day 1 AM (4h) | ARCH-03-01 | Create ProjectSidebar Component |
| Day 1 PM (3h) | ARCH-03-03 | Layout Presets System |
| Day 2 AM (2h) | ARCH-03-05 | Progressive Disclosure UI |
| Day 2 PM | Validation | Test all Team A stories |

### Team B (Stories: 02, 04, 06)

| Time | Story | Description |
|------|-------|-------------|
| Day 1 AM | *Wait* | Wait for ARCH-03-00 + ARCH-03-01 |
| Day 1 PM (4h) | ARCH-03-02 | Mobile-Responsive Layouts |
| Day 2 AM (2h) | ARCH-03-06 | Root Layout Integration |
| Day 2 AM (3h) | ARCH-03-04 | Drag-Drop Polish |
| Day 2 PM | Validation | Test all Team B stories |

### Critical Path

```
ARCH-03-00 (2h) → ARCH-03-01 (4h) → ARCH-03-02 (4h) → ARCH-03-04 (3h)
                                  → ARCH-03-06 (2h)
                
Total: 10-11 hours sequential
With parallelization: ~7 hours effective
```

---

## Validation Checklist

### Per-Story Validation

```bash
# After each story, run:
pnpm tsc --noEmit  # 0 errors
pnpm dev           # Application starts
```

### Epic Completion Validation

```bash
# 1. TypeScript
pnpm tsc --noEmit
# Expected: 0 errors

# 2. Application starts
pnpm dev
# Expected: No console errors

# 3. Desktop validation
# Manual: Open at 1440px width
# - [ ] Sidebar visible and collapsible
# - [ ] 3-column layout works
# - [ ] Drag-drop reorders plugins
# - [ ] Preset picker works
# - [ ] Save custom preset works

# 4. Tablet validation  
# Manual: Open at 768px width
# - [ ] 2-column max
# - [ ] Sidebar collapsible
# - [ ] Touch targets adequate

# 5. Mobile validation
# Manual: Open at 375px width
# - [ ] Single plugin fullscreen
# - [ ] Bottom nav visible
# - [ ] Swipe switches plugins
# - [ ] Sidebar overlays (hamburger)
# - [ ] No horizontal scroll

# 6. Keyboard navigation
# - [ ] Cmd+1/2/3 switches presets
# - [ ] Tab navigates sidebar
# - [ ] Arrow keys reorder panels (when focused)
```

---

## Success Metrics

| Metric | Before (ARCH-02 End) | After (ARCH-03 End) |
|--------|----------------------|---------------------|
| ProjectSidebar | ❌ None | ✅ With project list + chat threads |
| Mobile responsive | ❌ Not tested | ✅ Verified on 375px, 414px, 768px |
| Layout presets | 2 (query param only) | 5+ (3 built-in + custom) |
| Drag-drop polish | Basic (function only) | Full (visual feedback + a11y) |
| First-time UX | No guidance | Progressive disclosure + hints |
| Keyboard shortcuts | None | Cmd+1/2/3 for presets |

---

## Technical Debt Created

This epic intentionally defers:

1. **Agents panel** - Shows placeholder, full implementation in EPIC-AGENTS
2. **Chat thread management** - Basic list, full CRUD in EPIC-CHAT
3. **Project creation from sidebar** - Redirects to Hub, inline creation in EPIC-HUB
4. **Offline indicator** - Not in scope, add in EPIC-OFFLINE

---

## Rollback Strategy

If EPIC-ARCH-03 needs rollback:

1. **ProjectSidebar** - Can be hidden via feature flag
2. **Mobile layouts** - Fallback to single-column
3. **Presets** - Built-ins always available, custom presets ignored
4. **Drag-drop** - Disable via CSS (panels still work)
5. **Root integration** - Revert __root.tsx to pre-ARCH-03

Each story maintains backward compatibility.

---

## Sprint-Manager Handoff

### Before Starting

1. **Verify EPIC-ARCH-02 completion:**
   ```bash
   pnpm tsc --noEmit  # Must be 0 errors
   ```

2. **Load context files:**
   - ADR-034 (updated with Phase 2 complete)
   - This epic file (EPIC-ARCH-03)
   - `src/presentation/layouts/` (existing PluginLayout)

3. **Assign teams:**
   - Team A: **ARCH-03-00**, ARCH-03-01, ARCH-03-03, ARCH-03-05
   - Team B: ARCH-03-02, ARCH-03-04, ARCH-03-06

4. **🚨 READ THE AMENDMENT:**
   - `ADR-034-AMENDMENT-001-platform-first-2026-01-21.md`
   - All navigation must use `/$projectId` (not `/ide/$projectId`)

### During Execution

1. **ARCH-03-00 MUST complete before navigation logic in ARCH-03-01 is finalized**
2. **Check dependencies before starting each story**
3. **Run TypeScript after each story**
4. **Update story status in this file**

### After Completion

1. **Update ADR-034 Phase 3 to COMPLETE**
2. **Update sprint-status.yaml**
3. **Create EPIC-ARCH-03 completion report**
4. **Brief architect-ext for EPIC-ARCH-04 planning**

---

## Story Status Tracking

| Story | Status | Team | Started | Completed | Notes |
|-------|--------|------|---------|-----------|-------|
| **ARCH-03-00** | ⏳ PENDING | A | | | **BLOCKING** - Do first! |
| ARCH-03-01 | 🔄 IN PROGRESS | A | | | Blocked by 00 for navigation |
| ARCH-03-02 | ⏳ PENDING | B | | | Blocked by 00, 01 |
| ARCH-03-03 | ⏳ PENDING | A | | | Blocked by 00 |
| ARCH-03-04 | ⏳ PENDING | B | | | Blocked by 02 |
| ARCH-03-05 | ⏳ PENDING | A | | | Blocked by 03 |
| ARCH-03-06 | ⏳ PENDING | B | | | Blocked by 01 |

---

## Next Epic Preview

**EPIC-ARCH-04: Cleanup & Migration** will:
- Remove deprecated workspace routes (`/ide/$projectId`, `/notes/$projectId`)
- Clean up remaining `window.location.href` violations
- Implement Knowledge/Study as plugins (if needed)
- Final testing and documentation
- Migration scripts for existing users

---

## Approval Signatures

- [x] Architect Agent (architect-ext) - 2026-01-21
- [ ] User (Product Owner)
- [ ] Dev Team Lead

**Ready for sprint-manager handoff upon user approval.**
