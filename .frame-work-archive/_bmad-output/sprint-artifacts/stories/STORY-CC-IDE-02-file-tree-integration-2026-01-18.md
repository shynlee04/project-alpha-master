# Story: CC-IDE-02
# File Tree Integration

**Title**: File Tree Integration
**Epic**: CC-IDE-FSA
**Points**: 12
**Status**: ready-for-dev
**Team**: TEAM_A

---

## Acceptance Criteria

1. [ ] **File tree reads from FSA via ide-file-gateway**
   - Replace direct store/file-system calls with gateway.list()
   - Show file tree structure with folders and files
   - File icons match file types (TS, JSON, MD, etc.)

2. [ ] **File tree updates reflect in FSA immediately**
   - New file creation updates tree
   - File deletion removes from tree
   - Folder creation/deletion updates tree structure

3. [ ] **File watching triggers tree refresh**
   - FileSystemObserver detects external changes
   - Tree refreshes on file system events
   - Polling fallback for browsers < Chrome 129

4. [ ] **Supports nested folder creation/deletion**
   - Create folder at any depth
   - Delete folder and all children
   - Validate folder overlap per ADR-033 D7

5. [ ] **Excludes node_modules, .git, .viagent/ per ADR-033**
   - Default exclusion list applied
   - Configurable via project settings
   - Performance optimization (scan stops at excluded folders)

6. [ ] **Integration tests verify gateway-tree interaction**
   - Test tree loads from gateway
   - Test tree updates on file operations
   - Test exclusion patterns work

---

## Agentic & UX Context (REQUIRED)

### The User Journey

1. **User starts at**: IDE workspace with file tree panel open
   - User sees folder/file structure in left sidebar

2. **User performs**: Clicks folder to expand, or creates new file/folder
   - User interacts with tree controls

3. **System shows**: Loading spinner or immediate tree update
   - Folder expands immediately if cached
   - Spinner shows for large folder scans

4. **Result appears**: Tree shows updated structure
   - New file/folder appears in tree
   - File icons indicate type

5. **User then**: Clicks file to open in Monaco editor
   - User can navigate tree and open files

6. **If it fails**: Error toast showing operation failed
   - Shows specific error (permission denied, etc.)

---

## Tasks/Subtasks

### Development Tasks

- [ ] **Task 1**: Replace direct store calls with gateway.list()
  - [ ] Subtask 1.1: Update FileTree component to use gateway
  - [ ] Subtask 1.2: Remove direct file-system imports

- [ ] **Task 2**: Implement file watching for tree refresh
  - [ ] Subtask 2.1: Integrate FileSystemObserver
  - [ ] Subtask 2.2: Add polling fallback

- [ ] **Task 3**: Add folder creation/deletion UI
  - [ ] Subtask 3.1: Context menu for new folder
  - [ ] Subtask 3.2: Overlap validation per ADR-033

- [ ] **Task 4**: Apply exclusion patterns
  - [ ] Subtask 4.1: Skip excluded folders during scan
  - [ ] Subtask 4.2: Optimize performance (don't descend into excluded)

### UX/Design Tasks

- [ ] **Design Review**: File tree UI follows 8-bit design
  - [ ] Tree icons crisp, no rounded corners > 2px
  - [ ] Hover states clear
  - [ ] Loading states visible

### Testing Tasks

- [ ] **Unit Tests**: Test gateway-tree interaction, exclusion logic
- [ ] **Integration Tests**: Test file watching triggers refresh
- [ ] **E2E Tests**: User creates folder, sees in tree, opens file
- [ ] **State Coverage**: Empty tree, large tree, error states

---

## Dependencies

### Blocking Stories
- CC-IDE-01: IDE File Gateway Implementation

### Technical Dependencies
- CC-DF-05: File tree patterns (reusable logic)
- CC-DF-02: Sync layer (file watching patterns)

---

## Dev Notes

### Architecture Requirements
- File at: src/presentation/components/ide/FileTree.tsx
- Use StorageGateway.list() from CC-IDE-01
- Apply exclusion patterns from ADR-033
- Follow Clean Architecture (presentation layer only)

### Previous Learnings
- CC-DF-02 implemented FileSystemObserver with polling fallback
- CC-DF-05 defined file tree exclusion patterns
- Performance: Don't scan node_modules (5000+ files)

---

## File List
- Modified: src/presentation/components/ide/FileTree.tsx
- Created: src/presentation/components/ide/__tests__/FileTree.test.tsx

---

## Status
ready-for-dev

---

**Created**: 2026-01-18T13:00:00+07:00
