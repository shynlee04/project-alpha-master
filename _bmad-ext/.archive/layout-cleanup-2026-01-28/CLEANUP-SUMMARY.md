# Layout Cleanup Summary - 2026-01-28

**Timestamp**: 2026-01-28 16:49:35
**TypeScript Status**: 0 errors ✅

## Archived Files (26 files)

All files moved to: `_bmad-ext/.archive/layout-cleanup-2026-01-28/`

### Legacy Layout Components
| File | Original Location | Reason |
|------|-------------------|--------|
| `IDELayout/` | `src/presentation/components/layout/IDELayout/` | Entire folder - legacy resizable layouts |
| `IDELayoutMain.tsx` | `src/presentation/components/layout/` | Legacy react-resizable-panels |
| `IDEMobileLayout.tsx` | `src/presentation/components/ide/` | Not imported anywhere |
| `MobileIDELayout.tsx` | `src/presentation/components/layout/` | Not imported anywhere |
| `NotesMobileLayout.tsx` | `src/presentation/components/notes/` | Not imported anywhere |
| `NotesPage.tsx` | `src/presentation/components/notes/` | Not imported, depends on archived MainLayout |
| `MainLayout.tsx` | `src/presentation/components/layout/` | Not imported anywhere |
| `TabletPortraitLayout.tsx/css` | `src/presentation/components/layout/` | Not imported anywhere |
| `ResponsiveLayoutSwitcher.tsx` | `src/presentation/components/layout/` | Not imported anywhere |

### Legacy Layout Stores
| File | Original Location | Reason |
|------|-------------------|--------|
| `layout-presets-store.ts` | `src/infrastructure/persistence/stores/` | Not imported - replaced by workflow-presets |
| `layout-presets.ts` | `src/presentation/layouts/` | Not imported - replaced by workflow-presets |
| `layout-utils.ts` | `src/presentation/layouts/` | Not imported anywhere |
| `LayoutRenderers.tsx` | `src/presentation/layouts/` | Not imported anywhere |

### Legacy UI Components
| File | Original Location | Reason |
|------|-------------------|--------|
| `LayoutPresetPicker.tsx` | `src/presentation/components/ui/` | Not imported anywhere |
| `SavePresetDialog.tsx` | `src/presentation/components/ui/` | Not imported anywhere |
| `LayoutOnboarding.tsx` | `src/presentation/components/onboarding/` | Not imported anywhere |

### Legacy Plugin Layout Components
| File | Original Location | Reason |
|------|-------------------|--------|
| `PluginLayout.tsx` | `src/presentation/layouts/` | Not imported - replaced by WorkspaceLayout |
| `PluginPanel.tsx` | `src/presentation/layouts/` | Not imported anywhere |
| `MobilePluginNav.tsx` | `src/presentation/layouts/` | Not imported anywhere |
| `PluginToggles.tsx` | `src/presentation/components/layout/` | Not imported anywhere |
| `PluginToolbar.tsx` | `src/presentation/components/layout/` | Not imported anywhere |
| `PresetSelector.tsx` | `src/presentation/components/layout/` | Not imported anywhere |
| `SidebarQuickActions.tsx` | `src/presentation/components/layout/` | Not imported anywhere |
| `MobileBottomNav.tsx` | `src/presentation/components/layout/` | Not imported anywhere |

## Kept Files (Active Components)

### Core Layout (src/presentation/components/layout/)
- `GlobalHeader.tsx` - Top navigation bar ✅
- `MainSidebar.tsx` - Global navigation sidebar ✅
- `ProjectAwareLayout.tsx` - Route-based layout switching ✅
- `ActivityBar.tsx` - Plugin activity bar ✅
- `ActivityBarTop.tsx` - Top activity bar ✅
- `PluginDocker.tsx` - Plugin docker panel ✅
- `FloatingPluginDocker.tsx` - Floating docker ✅
- `MainContentRenderer.tsx` - Main content plugin renderer ✅
- `StatusBar.tsx` - Status bar ✅
- `Breadcrumbs.tsx` - Navigation breadcrumbs ✅
- `LiveRegion.tsx` - Screen reader announcements ✅
- `BottomSheet.tsx` - Mobile bottom sheet ✅
- `MobileTabBar.tsx` - Mobile tab bar ✅
- `SystemRail.tsx` - System rail ✅

### Layout Utilities (src/presentation/layouts/)
- `WorkspaceLayout.tsx` - 6-column CSS grid ✅
- `useBreakpoint.ts` - Responsive breakpoint hook ✅
- `workflow-presets.ts` - Workflow preset definitions ✅
- `PluginLayoutStore.ts` - Plugin layout state (RESTORED - still in use) ✅

### Core Stores (src/infrastructure/persistence/stores/)
- `layout-store.ts` - Global layout state (RESTORED - sidebar state) ✅
- `ide/ide-layout-slice.ts` - IDE-specific layout (RESTORED - panel layouts) ✅
- `project/project-layout-slice.ts` - Project layout (RESTORED - in-memory) ✅

## Index Files Updated

1. `src/presentation/components/layout/index.ts` - Removed dead exports
2. `src/presentation/layouts/index.ts` - Removed dead exports, restored PluginLayoutStore
3. `src/presentation/components/ui/index.ts` - Removed LayoutPresetPicker, SavePresetDialog
4. `src/presentation/components/ide/index.ts` - Removed IDEMobileLayout
5. `src/presentation/components/notes/index.ts` - Removed NotesMobileLayout, NotesPage
6. `src/presentation/components/panels/index.ts` - Commented out PluginPanel

## h-screen Analysis

### Files with h-screen (Acceptable)
These are fullscreen overlays/modals, not nested containers:
- `workspace-access-helper.tsx` - Loading/permission overlays
- `ErrorFallback.tsx` - Error boundary full screen
- `AppErrorBoundary.tsx` - Error boundary full screen
- `ProjectCreationWizard.tsx` - Wizard modal
- Test/debug routes - Not production

### Current Layout Chain (CLEAN)
```
__root.tsx
  → body (no h-screen)
    → ProjectAwareLayout (h-dvh ✅)
      → GlobalHeader (shrink-0)
      → MainContent (flex-1)
        → /$projectId route
          → WorkspaceLayout (height: 100% via CSS)
```

## Terminology (No Action Needed)
No instances of `screenSize`, `deviceType`, or `layoutMode` conflicts found.
The `useBreakpoint` hook provides the canonical breakpoint detection.

## Validation
```bash
pnpm tsc --noEmit  # 0 errors ✅
```
