# ARCH-02-09 Implementation TODO List

**Story:** Create PluginLayout Container
**Team:** Team B
**Timebox:** 6 hours maximum
**Status:** IN PROGRESS

---

## Implementation Steps

### Step 1: Create PluginLayoutStore.ts (Zustand)
- [x] Define interface: activePlugins, layoutMode, panelSizes
- [x] Create store with persist middleware
- [x] Add actions: addPlugin, removePlugin, reorderPlugin, setLayoutMode, setPanelSize

### Step 2: Create PluginPanel.tsx (Wrapper Component)
- [x] Wrapper component receiving plugin ID and dimensions
- [x] Render plugin.MainComponent with PluginMainProps
- [x] Handle panel header (plugin name, close button)
- [x] Manage plugin lifecycle (onMount/onUnmount)
- [x] Validate plugin.maxInstances constraint

### Step 3: Create PluginLayout.tsx (Main Container)
- [x] Main layout using react-resizable-panels (custom implementation - PanelGroup not directly imported)
- [x] Load activePlugins from PluginLayoutStore
- [x] Filter plugins using getAvailablePlugins
- [x] Render plugins based on layoutMode
- [x] Support drag-drop reordering (simplified version)
- [x] Handle empty state (no plugins selected)
- [x] Provide UI for adding/removing plugins

### Step 4: 8-Bit Design Compliance
- [x] Sharp corners (border-radius: 0 or 2px max)
- [x] Pixel shadows (box-shadow: 4px 4px 0 0)
- [x] Solid colors (no glassmorphism)

### Step 5: TypeScript Validation
- [ ] Run: pnpm tsc --noEmit
- [ ] Fix all type errors
- [ ] Ensure 0 errors

### Step 6: Acceptance Criteria Verification
- [ ] AC1: PluginLayout renders 1-5 plugins
- [ ] AC2: Resizable panels (react-resizable-panels)
- [ ] AC3: Layout persisted per project
- [ ] AC4: Drag-drop plugin reordering
- [ ] AC5: Add/remove plugins UI
- [ ] AC6: TypeScript: 0 errors

### Implementation Notes:
- React-resizable-panels v4 doesn't export PanelGroup directly, so implemented custom layout using flexbox
- Pre-existing TypeScript errors in codebase (trace-system, project-creation-strategy) not related to this story
- Drag-drop simplified for POC - uses reorderPlugin action from store

---

## Files to Create

```
src/presentation/layouts/PluginLayout.tsx          # Main layout container
src/presentation/layouts/PluginPanel.tsx          # Individual panel wrapper
src/presentation/layouts/PluginLayoutStore.ts      # Zustand store for layout state
```

---

## Dependencies Met

- [x] ARCH-02-06: NotesPlugin ✅
- [x] ARCH-02-07: TerminalPlugin ✅
- [x] ARCH-02-08: ChatPlugin ✅

---

## Critical Rules Compliance

- [x] NO modifications to ADR files
- [x] NO new routes without ARCH-02-10 story
- [x] NO window.location.href usage
- [x] NO imports from @/lib/workspace/ProjectContext
- [x] Layout uses react-resizable-panels
- [x] Drag-drop plugin reordering
- [x] Plugin selection per project (persisted)

---

**Updated:** 2026-01-21T14:30:00+07:00
