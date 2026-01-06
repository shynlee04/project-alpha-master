# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-008
**Title**: Wire Bridge to Workspace Init
**Date**: 2026-01-06T06:00:00+07:00
**Priority**: P0 - CRITICAL

## From
- **Agent**: bmad-core-bmad-master (coordinator)
- **Module**: asgl

## To
- **Agent**: bmad-bmm-dev
- **Module**: bmm
- **Path**: _bmad/modules/bmm/agents/dev.md

## Task
Wire NoteFolderBridge to workspace initialization flow.

## Context
NoteFolderBridge exists but not wired. Opening folder doesn't populate Notes. Notes workspace sidebar doesn't show project files.

## Root Cause
```typescript
// NoteFolderBridge not called in workspace init
// No FSA → Notes bridge initialization
// NotesPage doesn't trigger file import
```

## Files to Modify
- `src/infrastructure/sync/workspace-services/notes/note-file-sync.ts`
- `src/presentation/components/notes/NotesPage.tsx`
- `src/lib/filesystem/sync-manager/sync-manager.ts`

## Constraints
- Trigger: Import happens when folder opened in workspace
- Performance: Don't block UI on large folders
- UX: Show progress indicator during import
- Mobile: Works on touch devices

## Acceptance Criteria
- [ ] Opening folder populates Notes
- [ ] Notes workspace sidebar shows project files
- [ ] Import happens automatically on workspace init
- [ ] Progress indicator shows during import
- [ ] Large folders handled efficiently (>1000 files)

## Skills to Invoke
- `systematic-debugging` - Understand workspace init flow
- `brainstorming` - Design wiring strategy
- `frontend-components` - Add UI for folder mounting
- `global-error-handling` - Handle import failures
- `test-driven-development` - Write integration tests

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Test workspace init
npm test -- workspace-init

# Manual test: Open folder, verify Notes populate
```

## Related Issues
- CRIT-002: Notes Workspace Not Loading Project Files
- S-007: Create Note-Folder Bridge (prerequisite)

## Next Action
Call NoteFolderBridge.importDirectory() in workspace init, wire to NotesPage, test folder open flow.

---
**Handoff ID**: S-008-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: 3 parallel agents
