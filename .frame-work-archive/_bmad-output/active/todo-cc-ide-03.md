# TODO List: CC-IDE-03 Monaco Editor File Operations

**Story**: CC-IDE-03: Monaco Editor File Operations
**Started**: 2026-01-18T16:30:00+07:00
**Timebox**: 4 hours

## Tasks

### Task 1: Update MonacoEditor to use gateway for read/write
- [ ] Subtask 1.1: Replace direct file-system calls with gateway
  - Created useIdeFileGateway hook
  - Need to modify useIDEFileHandlers to use gateway
- [ ] Subtask 1.2: Handle Uint8Array conversion
  - String content → new TextEncoder().encode(content) → Uint8Array
  - Uint8Array → new TextDecoder().decode(data) → String

### Task 2: Implement auto-save with debounce
- [x] Subtask 2.1: Add 500ms debounce timer
  - Changed AUTO_SAVE_DELAY_MS from 2000 to 500 (line 43 in MonacoEditor.tsx)

### Task 3: Add unsaved changes indicator
- [x] Subtask 3.1: Show dot/asterisk on tab
   - Already implemented in EditorTabBar.tsx (line 72-74)
- [ ] Subtask 3.2: Warn on close
   - Add confirmation dialog before closing unsaved file in handleTabClose

### Task 4: Implement external change detection
- [ ] Subtask 4.1: Integrate FileSystemObserver
  - Create hook to watch file changes via StorageGateway.watch()
  - Detect external changes when file is open in editor
- [ ] Subtask 4.2: Show reload/merge dialog
  - Prompt user when external change detected
  - Show merge options if local dirty + external change

## Status
**Progress**: 0/4 tasks complete
**Blocked**: None
**Next Action**: Modify MonacoEditor.tsx to use gateway

## Notes
- MonacoEditor already has dirty state tracking via OpenFile interface
- EditorTabBar already shows dirty indicator (dot)
- Main work: gateway integration and external change detection
