# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-007
**Title**: Create Note-Folder Bridge
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
Create NoteFolderBridge to convert markdown files to Notes.

## Context
Notes workspace doesn't load project files. No file-to-note conversion exists. FSA reads files but Notes Dexie not populated.

## Root Cause
```typescript
// No note-folder-bridge.ts exists
// note-file-sync.ts not wired to workspace init
// FSA reads files but doesn't populate Notes Dexie
```

## Files to Create/Modify
- **Create**: `src/infrastructure/sync/workspace-services/notes/note-folder-bridge.ts`
- **Modify**: `src/lib/notes/note-file-sync.ts`
- **Modify**: `src/presentation/components/notes/NotesPage.tsx`

## Constraints
- Performance: Load 1000 files in <3s
- Memory: Efficient chunking for large projects
- Mobile: Works on touch devices
- UX: Show loading progress for large folders

## Acceptance Criteria
- [ ] note-folder-bridge.ts created
- [ ] Markdown files converted to Notes
- [ ] Bidirectional sync works (import + export)
- [ ] Notes Dexie populated on folder mount
- [ ] File metadata preserved (created, modified)
- [ ] Handles large folders efficiently

## Skills to Invoke
- `systematic-debugging` - Understand file system architecture
- `brainstorming` - Design bridge architecture
- `backend-queries` - Efficient file reading patterns
- `global-error-handling` - Handle file system errors
- `test-driven-development` - Write bridge tests

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Test file conversion
npm test -- note-folder-bridge

# Performance check
# Time loading of 1000 files
```

## Related Issues
- CRIT-002: Notes Workspace Not Loading Project Files
- S-008: Wire Bridge to Workspace Init (depends on this)

## Next Action
Create NoteFolderBridge with importDirectory() method, wire to Dexie, add folder mount UI.

---
**Handoff ID**: S-007-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: 3 parallel agents
