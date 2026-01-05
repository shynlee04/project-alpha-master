# Workspace Navigation - CONTEXT FILE
**Date:** 2026-01-06  
**Status:** REVERTED - All changes rolled back, original state restored

## Summary

Attempted to fix user journey from Hub to workspaces. Introduced build errors. Everything has been reverted to original state.

## Original Problems (Still Exist)

1. `/ide` route - Auto-loads last project blindly, ignores multiple projects
2. `/notes` route - Has standalone mode with `project={null}`
3. No project picker when clicking workspace from sidebar
4. Notes dual storage - Local Dexie + Synced filesystem
5. HubHomePage.tsx has duplicate React imports (pre-existing bug, fixed)

## What Was Changed (Then Reverted)

- `/ide` route - Added redirect logic for project picker
- `/notes` route - Removed standalone mode  
- Created `ProjectPickerDialog.tsx` - Created then deleted
- HubHomePage.tsx - Added query param handling, then reverted
- NotesPage.tsx - Changed projectId source, then reverted

## Why It Failed

1. Build errors from duplicate imports
2. TypeScript errors from incorrect TanStack Router API usage
3. Unused imports in ProjectPickerDialog
4. File not found errors after git clean

## Pre-existing Issues Found

- `HubHomePage.tsx:1-2` - Duplicate React imports (fixed)
- `src/routes/ide.tsx` - Works but auto-loads last project
- `src/routes/notes.lazy.tsx` - Has standalone mode with `project={null}`

## Current State

```
✅ HubHomePage.tsx - Imports fixed (duplicate React imports removed)
✅ src/routes/ide.tsx - Original (auto-loads last project)
✅ src/routes/notes.lazy.tsx - Original (standalone mode)
✅ ProjectPickerDialog.tsx - Deleted
```

## For Next Attempt

The workspace navigation fix requires:

1. **Fix Route Architecture**
   - `/ide` and `/notes` routes must redirect to Hub with query params
   - Hub must show project picker dialog
   - Use `useLocation()` not `useSearch()` for query params

2. **Proper Project Picker Dialog**
   - Use `useLiveQuery` for reactive project list
   - Filter by workspace bindings
   - Handle empty state

3. **Build First**
   - Run `pnpm dev` before making changes
   - Check TypeScript: `pnpm typecheck`
   - Fix errors immediately

## Commands

```bash
# Restore clean state
cd /Users/apple/Documents/coding-projects/project-alpha-master
git checkout -- .
git clean -fd

# Start dev server
pnpm dev

# Check TypeScript
pnpm typecheck
```

## Related Files

- `src/routes/ide.tsx` - IDE route (needs redirect logic)
- `src/routes/notes.lazy.tsx` - Notes route (needs standalone mode removed)
- `src/presentation/components/hub/HubHomePage.tsx` - Hub (needs query param handling)
- `src/presentation/components/hub/ProjectPickerDialog.tsx` - New component needed
- `src/routes/ide.$projectId.tsx` - IDE with project ID
- `src/routes/notes.$projectId.lazy.tsx` - Notes with project ID
- `src/presentation/components/notes/NotesPage.tsx` - Notes page
