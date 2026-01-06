# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: UJ-003
**Title**: Notes Save to Filesystem (Bidirectional)
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
Implement bidirectional sync: Notes edits persist to .md files on filesystem.

## Context
NoteFolderBridge has import only, no export. Note edits are lost on workspace switch. No auto-save to .md file.

## Root Cause
```typescript
// note-folder-bridge.ts has importDirectory() only
// No saveNoteToFile() or exportNote() methods
```

## Files to Modify
- `src/infrastructure/sync/workspace-services/notes/note-folder-bridge.ts`
- `src/lib/notes/note-store.ts`
- `src/presentation/components/notes/NotesPage.tsx` (add save UI)

## Constraints
- Performance: Auto-save with 2s debounce
- Data safety: Prevent data loss on race conditions
- UX: Dirty indicator shows unsaved changes
- Mobile: Manual save button ≥44px touch target

## Acceptance Criteria
- [ ] NoteFolderBridge.saveNoteToFile() method created
- [ ] Note edits persist to .md file
- [ ] Auto-save with 2s debounce
- [ ] Dirty indicator shows unsaved changes
- [ ] Manual save button available
- [ ] No data loss on rapid edits

## Skills to Invoke
- `systematic-debugging` - Understand current note-save flow
- `brainstorming` - Design bidirectional sync architecture
- `backend-queries` - File I/O operations
- `global-error-handling` - Handle write failures gracefully
- `test-driven-development` - Write tests for file persistence

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Check for file write operations
grep -r 'writeFile\|saveNote' src/infrastructure/sync/workspace-services/notes/

# Test coverage
npm test -- note-folder-bridge
```

## Related Issues
- UJ-003: Notes Don't Save to Filesystem
- UJ-004: Cross-Workspace Reactivity (depends on this)

## Next Action
Create saveNoteToFile() in NoteFolderBridge, wire to note-store changes, add auto-save + manual save UI.

---
**Handoff ID**: UJ-003-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: 3 parallel agents
