# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-039
**Title: File Watcher - Auto-Reload and Change Detection**
**Date**: 2026-01-06T12:00:00+07:00
**Priority**: P2 - MEDIUM

## From
- **Agent**: bmad-core-bmad-master (coordinator)
- **Module**: asgl

## To
- **Agent**: bmad-bmm-dev
- **Module**: bmm
- **Path**: _bmad/modules/bmm/agents/dev.md

## Task
Add file watcher with auto-reload, change detection, and external file modification alerts.

## Context
No file watching exists. Users must manually refresh to see external file changes. Need automatic detection.

## Root Cause
```typescript
// No file watcher exists
// No change detection system
// Missing external edit alerts
// No auto-reload on file change
```

## Files to Create/Modify
- **Create**: `src/lib/watcher/file-watcher.ts` - File watching engine
- **Create**: `src/lib/watcher/change-detector.ts` - Detect file modifications
- **Create**: `src/presentation/components/watcher/FileChangeDialog.tsx` - Change notification UI
- **Create**: `src/hooks/useFileWatcher.ts` - File watcher hook
- **Create**: `src/infrastructure/persistence/stores/file-watcher-store.ts` - Watcher state
- **Modify**: `src/presentation/components/editor/MonacoEditor.tsx` - Add watch integration

## File Watcher Features

### Watch Mechanisms
- **File System Events**: Listen for file changes (create, modify, delete)
- **Polling Fallback**: Poll files when events unavailable (every 2s)
- **Debouncing**: Debounce rapid changes (500ms default)
- **Ignored Files**: Skip node_modules, .git, dist, build
- **Watch Limits**: Max 100 files per workspace

### Change Detection
- **Content Hash**: SHA-256 hash of file content
- **Size Check**: Compare file size before hashing
- **Modification Time**: Check mtime for quick detection
- **Binary Files**: Skip binary files (images, fonts)
- **Encoding Detection**: UTF-8, UTF-16, ASCII auto-detection

### Change Types
- **Created**: New file added to workspace
- **Modified**: File content changed externally
- **Deleted**: File removed from workspace
- **Moved/Renamed**: File path changed

### User Notifications
- **Toast Notification**: "File changed externally"
- **Dialog Options**: "Reload", "Overwrite", "Ignore"
- **Conflict Resolution**: Handle local vs external changes
- **Auto-Reload**: Optional auto-reload on external change

### Editor Integration
- **Unsaved Changes Warning**: Alert if file has unsaved edits
- **Diff View**: Show changes between local and external
- **Auto-Save**: Auto-save before external reload
- **Cursor Position**: Preserve cursor position after reload

## Watch Configuration

### Workspace Settings
- **Enable Watch**: Toggle file watching per workspace
- **Watch Glob Patterns**: Specify which files to watch (e.g., "src/**/*.{ts,tsx}")
- **Exclude Patterns**: Ignore specific patterns (e.g., "*.log")
- **Auto-Reload**: Automatically reload on external change
- **Polling Interval**: Set polling frequency (1-10s)

### File Type Handlers
- **Code Files**: Reload content, preserve cursor
- **Config Files**: Re-parse config, restart services
- **Assets**: Clear cache, reload asset
- **Binary Files**: Notify change, no preview

## Constraints
- File system API integration
- Debouncing (500ms default)
- Watch limits (max 100 files)
- Conflict detection (local vs external)
- Unsaved changes warning
- Mobile: File change notifications
- i18n strings via t() function
- 8-bit gaming style (no blur)

## Acceptance Criteria
- [ ] File watcher engine (FS events + polling fallback)
- [ ] Change detection (content hash, size, mtime)
- [ ] Change types (created, modified, deleted, moved)
- [ ] User notifications (toast, dialog with options)
- [ ] Conflict resolution (reload, overwrite, ignore)
- [ ] Unsaved changes warning
- [ ] Auto-reload option
- [ ] Cursor position preservation
- [ ] Watch configuration (enable, patterns, auto-reload)
- [ ] File type handlers (code, config, assets)
- [ ] Mobile: Change notifications
- [ ] i18n strings via t() function
- [ ] 8-bit gaming style maintained

## Skills to Invoke
- `frontend-components` - Build watcher UI
- `brainstorming` - Design watch system
- `global-coding-style` - Watcher patterns
- `global-validation` - Change validation

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Verify watcher components
ls -la src/presentation/components/watcher/

# Verify file watcher
ls -la src/lib/watcher/file-watcher.ts
```

## Related Issues
- File synchronization
- External edit detection
- Ralph Loop Cycle 5D: Developer tools

## Next Action
Create file watcher with change detection, notifications, conflict resolution, and auto-reload.

---
**Handoff ID**: S-039-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: development-essentials:code
