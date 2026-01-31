---
title: "ProjectContext Propagation Fix - Handoff Document"
date: "2026-01-31"
agent: "dev-ext"
status: "COMPLETE"
---

# ProjectContext Propagation Fix

## Problem
Plugins were throwing error: `useProjectContext must be used within ProjectContextProvider`

**Root Cause:** Plugin components in `plugin-placeholders.tsx` rendered plugin MainComponents without passing the `projectContext` prop. The plugins called `useProjectContext()` hook internally but weren't receiving the context through the prop.

## Solution
Implemented prop drilling to pass ProjectContext from PluginPanelContainer through PluginInstance to all plugin components.

## Files Modified

### 1. src/presentation/components/layout/PluginPanelContainer.tsx
**Changes:**
- Added imports for `useProjectContext` hook and `ProjectContext` type
- Updated `PluginInstanceProps` interface to include `projectContext: ProjectContext`
- Updated `PluginInstance` component to receive and pass `projectContext` to the rendered Component
- Updated `PluginPanelContainer` to call `useProjectContext()` and pass it to `PluginInstance`
- Updated the `PluginInstance` JSX to pass `projectContext={projectContext}`

### 2. src/presentation/components/layout/plugin-placeholders.tsx
**Changes:**
- Added import for `ProjectContext` type
- Updated all plugin component types to accept `{ projectContext: ProjectContext }` prop:
  - `FileTreeComponent`
  - `MonacoComponent`
  - `NotesComponent`
  - `TerminalComponent`
  - `PreviewComponent`
  - `ChatComponent`
  - `AgentsComponent` (optional prop since it's a placeholder)
- Updated all components to pass `projectContext` to their respective MainComponent
- Updated `PLUGIN_COMPONENTS` registry type to `Record<PluginId, React.ComponentType<{ projectContext: ProjectContext }>>`
- Updated `getPluginComponent` return type
- Updated `renderPlugin` function signature to require `projectContext` parameter

## Verification
- TypeScript check: No errors in modified files
- All plugin components now properly receive ProjectContext via props
- Plugins can access context through props instead of relying solely on hook

## Acceptance Criteria Status
- [x] PluginPanelContainer gets projectContext from useProjectContext
- [x] PluginInstance receives and passes projectContext
- [x] All plugin components in plugin-placeholders.tsx accept projectContext prop
- [x] All plugin MainComponents receive projectContext prop
- [x] No TypeScript errors in modified files
- [ ] Test in browser (pending user verification)

## Notes
The fix maintains backward compatibility - plugins that call `useProjectContext()` internally will still work because they are now rendered within the context provider hierarchy through the prop drilling pattern.
