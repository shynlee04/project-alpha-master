---
id: P2-5
name: "Wire File Sync Services"
epic: Ralph Loop Cycle 18
priority: P0 (Critical)
status: in-progress
created: 2026-01-03
team: Team A
agent: bmad-core-bmad-master
estimated_hours: 8
---

# Story P2-5: Wire File Sync Services

## User Story

**As** a student using the BMAD platform,
**I want** the Study and Notes workspaces to actually import and manage files,
**So that** I can add course materials to my study vault and notes.

## Problem Statement

Current code has BROKEN file pickers that do nothing:
- `StudyPage.tsx` passes `fileSyncService={null}` to StudyFilePicker
- `NotesPage.tsx` passes `syncService={undefined}` and `fileSyncService={null}`
- These null/undefined values cause all file operations to silently fail

**Impact**: 13 out of 18 use cases are blocked (72% of platform functionality broken)

## Acceptance Criteria

### AC-1: Study File Picker Receives Real Service
- **Given**: User opens Study workspace
- **When**: Component mounts
- **Then**: StudyFilePicker receives a real fileSyncService instance (not null)
- **And**: Service is properly initialized with workspace context

### AC-2: Notes Sync Service Is Connected
- **Given**: User opens Notes workspace
- **When**: Component mounts
- **Then**: NotesPage receives real syncService instance (not undefined)
- **And**: fileSyncService is a real instance (not null)

### AC-3: File Mount Operation Works
- **Given**: User clicks "Mount Files" button in Study workspace
- **When**: File picker dialog opens
- **Then**: User can select a local folder
- **And**: Folder is actually mounted to the workspace
- **And**: File list displays mounted files

### AC-4: File Scan Operation Works
- **Given**: User has mounted files
- **When**: User clicks "Scan" button
- **Then**: System scans files for supported types (PDF, MD, images, audio)
- **And**: Scan results display file metadata
- **And**: Progress indicator shows scan completion

### AC-5: File Import Operation Works
- **Given**: User has scanned files
- **When**: User clicks "Import" button
- **Then**: Selected files are imported to workspace storage
- **And**: Success notification appears
- **And**: Files appear in workspace file list

### AC-6: Error Handling Works
- **Given**: User tries to mount files
- **When**: File system access is denied or unavailable
- **Then**: User-friendly error message displays
- **And**: Error is logged to console
- **And**: Application does not crash

### AC-7: TypeScript Compilation Passes
- **Given**: Code changes are complete
- **When**: TypeScript compiler runs
- **Then**: Zero errors in production files
- **And**: Build completes successfully

## Technical Implementation

### Files to Modify

1. **src/presentation/components/study/StudyPage.tsx**
   - Remove: `fileSyncService={null}`
   - Add: Import and initialize real StudyFileSyncService
   - Pass service instance to StudyFilePicker

2. **src/presentation/components/notes/NotesPage.tsx**
   - Remove: `syncService={undefined}` and `fileSyncService={null}`
   - Add: Import and initialize real NotesFileSyncService
   - Pass service instances to child components

3. **src/lib/filesync/study-file-sync-service.ts** (create if needed)
   - Extend base FileSyncService
   - Add Study-specific file type handlers
   - Implement workspace-scoped file operations

4. **src/lib/filesync/notes-file-sync-service.ts** (create if needed)
   - Extend base FileSyncService
   - Add Notes-specific file type handlers
   - Implement workspace-scoped file operations

### Service Architecture

```
FileSyncService (base class)
├── StudyFileSyncService
│   ├── Supported types: PDF, MD, images, audio, video
│   ├── Storage: IndexedDB (StudyDB)
│   └── Workspace scope: 'study'
└── NotesFileSyncService
    ├── Supported types: PDF, MD, images, DOCX
    ├── Storage: IndexedDB (NotesDB)
    └── Workspace scope: 'notes'
```

### Reference Implementation

Check IDE workspace for working file sync pattern:
- `src/presentation/components/ide/ExplorerPanel.tsx`
- `src/lib/filesync/sync-manager.ts`
- `src/lib/workspace/project-store.ts`

## Dev Notes

### Architecture Patterns
- Follow existing IDE file sync pattern (already working)
- Use Dexie.js for IndexedDB persistence
- Implement proper error boundaries
- Add loading states for async operations

### File System Constraints
- File System Access API is desktop-only (not available on mobile)
- Must handle mobile gracefully (show message or alternative)
- Permissions are ephemeral (single session by default)
- Must implement permission lifecycle management

### Store Integration
- Use `useIDEStore` pattern for file metadata
- Persist file lists to IndexedDB
- Emit sync events for UI updates
- Integrate with cross-workspace event bus

### Dependencies
- `dexie` - IndexedDB wrapper
- `@/lib/filesync/sync-manager` - File sync orchestration
- `@/infrastructure/events/cross-workspace-event-bus` - Event emission
- `@/lib/workspace/project-store` - Project metadata

## Testing Strategy

### Manual Testing
1. Open Study workspace, verify StudyFilePicker loads without errors
2. Click "Mount Files", select a folder with PDFs
3. Verify folder mounts and files display
4. Click "Scan", verify scan completes
5. Click "Import", verify files import successfully
6. Repeat for Notes workspace

### Type Checking
```bash
pnpm tsc --noEmit 2>&1 | grep -v "test\|spec" | grep "error"
# Expected: 0 errors
```

### Build Validation
```bash
pnpm build
# Expected: Build completes successfully
```

## References

- Ralph Loop local: `.claude/ralph-loop.local.md`
- UX/UI Assessment: `_bmad-output/ux-ui-workspace-integration-assessment-2026-01-03.md`
- Domain Assessment: `_bmad-output/domain-assessment-4-critical-areas-2026-01-03.md`
- Platform Assessment: `_bmad-output/platform-unification-assessment-2026-01-03.md`

## Use Cases Unblocked

Completing this story unblocks:
- UC-01: Exam Sprint Mixed Media
- UC-03: Citation Grade Literature Map
- UC-04: Field Capture Offline
- UC-10: Learning Path Spaced Repetition
- UC-14: Mobile Photo to IDE
- UC-16: Mobile Study Flashcards
- UC-17: Mobile PDF Annotation

**Total**: 7 use cases move from "Not Feasible" → "Partially Feasible"

## Dev Agent Record

**Agent**: bmad-core-bmad-master
**Session**: 2026-01-03

### Tasks Completed:
- [x] Created story file
- [ ] Implement StudyFileSyncService
- [ ] Implement NotesFileSyncService
- [ ] Wire services to StudyPage
- [ ] Wire services to NotesPage
- [ ] Manual testing
- [ ] TypeScript validation

### Files Changed:
*TBD*

### Research Executed:
- [x] Read UX/UI assessment
- [x] Read domain assessment
- [x] Check IDE file sync pattern
- [ ] Study existing file sync services

### Decisions Made:
- P0 priority - blocks 13 use cases
- Desktop-only initially (mobile fallback later)
- Follow IDE pattern (proven working)

## Status

**Current**: in-progress
**Last Updated**: 2026-01-03T15:30:00+07:00
**Next Action**: Research existing file sync services, implement Study and Notes services
