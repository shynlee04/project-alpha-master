# CC-AR-04: Replace Drag-Drop with Toggle-Based Layout - Development Report

**Handoff ID**: CC-AR-04-dev-2026-01-26
**Parent ID**: 7f1a8c33-8bd2-4a47-9d58-ecb65e5b76ad-retry1
**Story**: CC-AR-04
**Epic**: EPIC-CC-AR02AR03
**Team**: Team A
**Status**: COMPLETE
**Created**: 2026-01-26T00:42+07:00

---

## Summary

Successfully replaced the problematic drag-drop UI with a toggle-based plugin toolbar. The implementation:
- Removes all drag-drop functionality that was causing broken UI
- Introduces a clean toggle-based toolbar for plugin activation/deactivation
- Provides layout mode selector with 8-bit compliant buttons
- Archives the obsolete plugin-dnd.css file
- Reduces PluginLayout.tsx from 1035 lines to 806 lines (-229 lines, -22%)

---

## Files Created

| Path | Lines | Description |
|------|-------|-------------|
| `src/presentation/layouts/layout-presets.ts` | 193 | Pre-designed layout configurations for 1-5 plugins |
| `src/presentation/components/layout/PluginToolbar.tsx` | 250 | Toggle toolbar component with plugin and layout mode buttons |

---

## Files Modified

| Path | Changes | Description |
|------|---------|-------------|
| `src/presentation/layouts/PluginLayout.tsx` | Major refactor | Removed drag-drop, integrated PluginToolbar |
| `src/i18n/en.json` | +3 keys | Added plugin.toolbar, plugin.clickToAdd, plugin.clickToRemove |
| `src/i18n/vi.json` | +3 keys | Added Vietnamese translations for toolbar keys |

### PluginLayout.tsx Changes Summary
- **Removed**: Import of plugin-dnd.css
- **Removed**: All drag-drop state (`dragIndex`, `setDragIndex`)
- **Removed**: `handleDragStart`, `handleDragEnd`, `handleDrop` functions
- **Removed**: `handleReorderPlugin` function
- **Removed**: `announceReorder` function (kept state for future)
- **Removed**: All drag handle divs in render functions (7 occurrences)
- **Removed**: onDragOver and onDragEnd props from main container
- **Removed**: reorderPlugin from store hook
- **Added**: Import of PluginToolbar
- **Added**: `handleTogglePlugin` function
- **Replaced**: Inline toolbar with PluginToolbar component

---

## Files Archived

| Original Path | Archive Path | Reason |
|---------------|--------------|--------|
| `src/presentation/layouts/plugin-dnd.css` | `_bmad-ext/.archive/epic-cc-ar02ar03-2026-01-26/plugin-dnd.css.archived` | Drag-drop CSS no longer needed |

---

## i18n Keys Added

### English (en.json)
```json
"plugin.toolbar": "Plugin toolbar",
"plugin.clickToAdd": "Click to add",
"plugin.clickToRemove": "Click to remove"
```

### Vietnamese (vi.json)
```json
"plugin.toolbar": "Thanh cong cu plugin",
"plugin.clickToAdd": "Nhan de them",
"plugin.clickToRemove": "Nhan de xoa"
```

---

## 8-Bit Design Compliance

All new UI elements follow 8-bit design rules:
- `style={{ borderRadius: 0 }}` on all buttons
- `border border-border` for button borders
- `bg-blue-600` for active state (solid color)
- `bg-background` for inactive state (solid color)
- No rounded corners, no glassmorphism, no transparency

---

## Validation Results

### TypeScript Check
```bash
pnpm tsc --noEmit
# Exit code: 0
# Errors: 0
```

### File Metrics
- **layout-presets.ts**: 193 lines (target: N/A - new file)
- **PluginToolbar.tsx**: 250 lines (target: ~150 - acceptable)
- **PluginLayout.tsx**: 806 lines (was 1035, -229 lines, -22%)

---

## Components Created

### PluginToolbar
Main toolbar component with:
- **Left side**: Plugin toggle buttons (shows all available plugins)
- **Right side**: Layout mode selector (1-column, 2-column, 3-column, 2+1)

Props:
```typescript
interface PluginToolbarProps {
  activePlugins: PluginId[];
  availablePlugins: { id: PluginId; name: string; icon: React.ReactNode }[];
  layoutMode: LayoutMode;
  onTogglePlugin: (pluginId: PluginId) => void;
  onSetLayoutMode: (mode: LayoutMode) => void;
}
```

### PluginToggleButton (internal)
Individual toggle button for plugins:
- Shows plugin icon and name
- Blue when active, muted when inactive
- Accessible: uses `aria-pressed`

### LayoutModeButton (internal)
Individual button for layout modes:
- Icons: Columns (1), Grid2x2 (2), Grid3x3 (3), LayoutPanelTop (2+1)
- Blue when active, muted when inactive

---

## Layout Presets

Created for future use (auto-layout selection):

| Preset | Mode | Plugins | Description |
|--------|------|---------|-------------|
| 1-column | 1-column | 1 | Single full-width panel |
| 2-column | 2-column | 2 | Sidebar (30%) + Main (70%) |
| 3-column | 3-column | 3 | Sidebar (20%) + Main (50%) + Secondary (30%) |
| 4-plugin-2+2 | 2+1 | 4 | Top row (3 panels) + Bottom row (1 panel) |
| 5-plugin-3+2 | 2+1 | 5 | Top row (4 panels) + Bottom row (1 panel) |

---

## Blockers

None.

---

## Notes

1. The resize handles between panels are kept (visual separators and cursor indicators)
2. Screen reader announcement state is preserved but not actively used (for future accessibility)
3. The `reorderPlugin` action in the store is still available but not used by PluginLayout
4. Add Plugin dialog remains unchanged (still accessible via toolbar "Add" button if no plugins active)

---

## Next Steps

1. Test toolbar in browser across breakpoints
2. Verify toggle behavior adds/removes plugins correctly
3. Verify layout mode switching works
4. Consider adding keyboard navigation to toolbar buttons

---

## Acceptance Criteria Status

- [x] Create `src/presentation/layouts/layout-presets.ts`
- [x] Create `src/presentation/components/layout/PluginToolbar.tsx`
- [x] Remove drag-drop CSS import from PluginLayout.tsx
- [x] Remove drag-drop state and handlers
- [x] Remove all drag handle divs from render functions
- [x] Add handleTogglePlugin function
- [x] Replace inline toolbar with PluginToolbar component
- [x] Archive plugin-dnd.css
- [x] Add missing i18n keys
- [x] TypeScript compiles with 0 errors
- [x] All components follow 8-bit design rules

---

**Story Status**: COMPLETE
**Ready for**: Code Review
