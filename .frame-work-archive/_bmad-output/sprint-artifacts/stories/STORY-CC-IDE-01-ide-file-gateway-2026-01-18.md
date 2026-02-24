# Story: CC-IDE-01
# IDE File Gateway Implementation

**Title**: IDE File Gateway Implementation
**Epic**: CC-IDE-FSA
**Points**: 4 hours
**Status**: ready-for-dev
**Team**: TEAM_B
**Created**: 2026-01-18T15:30:00+07:00

---

## Acceptance Criteria

1. [ ] **`ide-file-gateway.ts` created with StorageGateway interface**
   - Implements `read()`, `write()`, `delete()`, `list()` methods
   - Supports `.viagent/` metadata folder exclusion
   - Uses FSAGateway for desktop, IDBGateway for mobile

2. [ ] **Platform-aware gateway selection**
   - `createIdeFileGateway()` factory function
   - Returns FSAGateway when `platform.canAccessIDE === true`
   - Returns IDBGateway when mobile/tablet

3. [ ] **File exclusion patterns applied**
   - `.viagent/` folder excluded from operations
   - Node modules and other defaults excluded
   - Configurable exclusion list

4. [ ] **Unit tests pass with ≥80% coverage**
   - Test gateway factory
   - Test file exclusion logic
   - Test read/write/delete/list operations

---

## Agentic & UX Context (REQUIRED)

### The User Journey

**Answer these 6 questions to define the user flow:**

1. **User starts at**: IDE workspace file tree component
   - Where is the user when they begin?
   - User has selected a project and opened the IDE workspace

2. **User performs**: Opens, saves, deletes, or lists files in the IDE
   - What does the user click/type/ask?
   - User clicks file in tree, or creates new file, or saves from Monaco editor

3. **System shows**: Loading spinner for file operations
   - What does the user see RIGHT AFTER the action?
   - Spinner appears on file icon or save button during I/O

4. **Result appears**: File content loaded or saved to file system
   - Where does the final result appear?
   - Monaco editor loads file content, or file list updates in tree

5. **User then**: Continues editing or navigates to another file
   - What can the user do next?
   - Can edit content in Monaco, open another file, or create new files

6. **If it fails**: Error toast with retry option
   - What happens if something goes wrong?
   - Toast message shows "Failed to load file: [error]" with retry button

---

### Agent Tool Spec (if applicable)

**Does this story involve AI/LLM tool usage?**
- [x] Yes - Fill out this section
- [ ] No - Skip to Dependencies

If Yes, specify:

#### Tool Definition

**Tool Name**: `ide_file_gateway_read`

**Description** (one sentence for LLM):
```
Read file content from IDE workspace using StorageGateway abstraction. This tool should be used when the AI needs to inspect, analyze, or understand IDE file contents.
```

**Trigger** (When user asks/hints):
```
User: "Show me the contents of src/index.ts"
→ Agent uses: ide_file_gateway_read with path="src/index.ts"

User: "What's in the package.json file?"
→ Agent uses: ide_file_gateway_read with path="package.json"
```

**NOT Trigger** (When NOT to use):
```
User: "List all files in the project"
→ Agent does: Use ide_file_gateway_list to get file tree, then ide_file_gateway_read selectively

User: "Create a new file"
→ Agent does: Use ide_file_gateway_write instead
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| path | string | yes | Relative path from project root (e.g., "src/index.ts") |
| projectId | string | yes | Project ID to identify which project's IDE workspace |

**Permission Level**: user_confirm
**Reason**: File reading may contain sensitive code or configuration

**UI Context**:
- **While Thinking**: "Reading file: {path}..." toast
- **On Success**: File content displayed in agent response or analyzed
- **On Error**: "Failed to read file: {error}" toast with retry button

#### Tool Definition

**Tool Name**: `ide_file_gateway_write`

**Description** (one sentence for LLM):
```
Write or update file content in IDE workspace using StorageGateway abstraction. Use this to create new files or modify existing ones.
```

**Trigger** (When user asks/hints):
```
User: "Create a utils file with helper functions"
→ Agent uses: ide_file_gateway_write with path="src/utils.ts" and content="..."

User: "Fix the bug in index.ts"
→ Agent uses: ide_file_gateway_write with path="src/index.ts" and updated content
```

**NOT Trigger** (When NOT to use):
```
User: "Save the note"
→ Agent does: Use note-specific save tools, not IDE tools
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| path | string | yes | Relative path from project root |
| content | string | yes | File content to write |
| projectId | string | yes | Project ID |

**Permission Level**: user_confirm
**Reason**: File writing modifies user's codebase and can break functionality

**UI Context**:
- **While Thinking**: "Writing file: {path}..." toast
- **On Success**: "File saved: {path}" toast
- **On Error**: "Failed to write file: {error}" toast with retry button

#### Tool Definition

**Tool Name**: `ide_file_gateway_delete`

**Description** (one sentence for LLM):
```
Delete file from IDE workspace using StorageGateway abstraction. Use carefully as this operation cannot be undone without external backup.
```

**Trigger** (When user asks/hints):
```
User: "Delete this outdated file"
→ Agent uses: ide_file_gateway_delete with path="src/old-file.ts"

User: "Remove all test files"
→ Agent does: Ask for confirmation, then delete with user_confirm
```

**NOT Trigger** (When NOT to use):
```
User: "Archive this file"
→ Agent does: Move to different location instead, don't delete
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| path | string | yes | Relative path of file to delete |
| projectId | string | yes | Project ID |

**Permission Level**: user_confirm
**Reason**: File deletion is destructive and can cause build failures

**UI Context**:
- **While Thinking**: "Deleting file: {path}..." confirmation dialog
- **On Success**: "File deleted: {path}" toast
- **On Error**: "Failed to delete file: {error}" toast

---

## Tasks/Subtasks

### Development Tasks

- [ ] **Task 1**: Create `ide-file-gateway.ts` in infrastructure layer
  - [ ] Subtask 1.1: Define IdeFileGateway interface
  - [ ] Subtask 1.2: Implement read/write/delete/list methods
  - [ ] Subtask 1.3: Add file exclusion logic for `.viagent/`

- [ ] **Task 2**: Create factory function `createIdeFileGateway()`
  - [ ] Subtask 2.1: Detect platform using PlatformContract
  - [ ] Subtask 2.2: Return FSAGateway for desktop
  - [ ] Subtask 2.3: Return IDBGateway for mobile/tablet

### UX/Design Tasks

- [ ] **Design Review**: Verify journey flow matches expectations
  - [ ] Entry point is clear (file tree component)
  - [ ] Action is discoverable (click file, save button)
  - [ ] Result location is obvious (Monaco editor updates)
  - [ ] Loading state exists (spinner on I/O)
  - [ ] Error state exists (toast with retry)

### Agent/AI Tasks (if applicable)

- [ ] **Tool Spec**: Define JSON Schema for LLM tools
  - [ ] Tool names: ide_file_gateway_read, ide_file_gateway_write, ide_file_gateway_delete
  - [ ] Parameters specified with types and required fields
  - [ ] Permission levels set to user_confirm
  - [ ] UI context documented (thinking, success, error)

### Testing Tasks

- [ ] **Unit Tests**:
  - [ ] Test factory function returns correct gateway type
  - [ ] Test file exclusion logic filters `.viagent/`
  - [ ] Test read returns file content as Uint8Array
  - [ ] Test write saves content to correct path
  - [ ] Test delete removes file
  - [ ] Test list returns file tree with exclusions applied
- [ ] **Integration Tests**:
  - [ ] Test gateway connects to FSA on desktop
  - [ ] Test gateway connects to DexieDB on mobile
- [ ] **E2E Tests**: None for this story
- [ ] **State Coverage**: Test loading/empty/error states

---

## Dependencies

### Blocking Stories
- CC-DF-02: DexieDB → FSA Sync Layer (for sync pattern reference)

### Technical Dependencies
- CC-SG-01: StorageGateway abstraction (must be complete)
- CC-SG-02: Platform routing (must have PlatformContract)
- CC-DF-02: Sync layer patterns (file watching, conflict resolution)

---

## Dev Notes

### Architecture Requirements
- Create file at `src/infrastructure/filesystem/ide-file-gateway.ts`
- Use StorageGateway interface from CC-SG-01
- Follow Clean Architecture: infrastructure layer only, no domain or presentation logic
- Reuse FSAGateway and IDBGateway implementations from CC-SG-02

### Previous Learnings
- From CC-DESKTOP-FSA: Notes workspace gateway pattern is established
- File exclusion patterns already defined in ADR-033
- Platform contract detection already implemented in CC-SG-02
- Sync layer from CC-DF-02 provides file watching patterns

### Technical Specifications
```typescript
// Interface (from StorageGateway)
interface StorageGateway {
  read(path: string): Promise<Uint8Array>;
  write(path: string, data: Uint8Array): Promise<void>;
  delete(path: string): Promise<void>;
  list(path: string): Promise<FileEntry[]>;
  exists(path: string): Promise<boolean>;
  watch(path: string, callback: FileChangeCallback): () => void;
}

// Factory function
function createIdeFileGateway(projectId: string): StorageGateway {
  const platform = getPlatformContract();

  if (platform.canAccessIDE && platform.storageType === 'fsa') {
    // Desktop: Use FSAGateway with project handle
    const project = await getProjectHandle(projectId);
    return new FSAGateway(project.handle, {
      exclude: ['.viagent/', 'node_modules/', '.git/']
    });
  } else {
    // Mobile/Tablet: Use IDBGateway (blocked from IDE but gateway exists)
    return new IDBGateway(projectId, 'ide');
  }
}
```

---

## Dev Agent Record

### Implementation Plan
{Filled during implementation}

### Debug Log
{Filled during implementation}

### Completion Notes
{Filled when story is done}

---

## File List
- Created:
  - src/infrastructure/filesystem/ide-file-gateway.ts
  - src/infrastructure/filesystem/__tests__/ide-file-gateway.test.ts

---

## Change Log
{Summary of changes made}

---

## Status
ready-for-dev

---

## Validation Checklist (Story-Cycle Steps)

### Step 1a: User Journey Simulation (The Movie Script Test)
- [x] 30-second demo script generated (above)
- [x] Journey map created (above)
- [x] Cohesion score >= 3 (focused on file operations)
- [x] No critical anti-patterns detected (no island features)

### Step 2: Validate
- [x] Prerequisites verified (CC-SG-01, CC-SG-02, CC-DF-02 complete)
- [ ] Dependencies complete (CC-DF-02 still in progress - block until done)
- [x] Sprint capacity confirmed (TEAM_A has 3 stories in this epic)

### Step 3a: Agent Tool Spec (The Brain Check)
- [x] Tool definitions created (ide_file_gateway_read/write/delete)
- [x] Permission levels appropriate (user_confirm for all)
- [x] UI context documented (thinking, success, error states)
- [x] No critical anti-patterns detected (tools have clear triggers and non-triggers)

### Step 3: Implement
- [ ] All acceptance criteria implemented
- [ ] Code follows standards (Clean Architecture, 8-bit design)
- [ ] Tests written

### Step 4: Test
- [ ] All tests passing
- [ ] Coverage >= 80%
- [ ] No regressions

### Step 5: Review
- [ ] Code review approved
- [ ] Quality checks passed

### Step 6: Done
- [ ] All tasks complete
- [ ] sprint-status.yaml updated

### Step 6a: Reality Check (The Demo)
- [ ] End-to-end flow works
- [ ] All states verified
- [ ] No visual breaks
- [ ] Reality score >= 4

---

## Quality Gates Summary

| Gate | Status | Notes |
|------|--------|-------|
| Story Start Gate | PASS | Step 2 complete, dependencies clear |
| Product Reality Gate | PASS | Step 1a complete, user journey defined |
| Agent Brain Gate | PASS | Step 3a complete, tools specified |
| Test Gate | PENDING | Implementation not started |
| Done Gate | PENDING | Implementation not started |
| Visual Reality Gate | PENDING | Implementation not started |

---

## Cross-Impact Mapping

### Affected Components
- File tree component (will use gateway for list operations)
- Monaco editor (will use gateway for read/write)

### Affected Stores
- IDE store (will integrate with gateway)
- Project store (will provide handles)

### Architectural Boundaries
- Infrastructure layer only
- No domain logic (business rules elsewhere)
- No presentation logic (UI elsewhere)

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Gateway factory returns wrong type | Low | High | Unit tests verify platform detection |
| File exclusion not working | Low | Medium | Integration tests check `.viagent/` excluded |
| Mobile IDE gateway used incorrectly | Low | Medium | Route guard in CC-IDE-06 will block access |

---

## References

### Document References
- Clean Context: `_bmad-ext/.correct-course/CLEAN-CONTEXT-2026-01-18.md`
- ADR-033: `_bmad-output/planning-artifacts/adr/ADR-033-correct-course-architectural-remediation-2026-01-16.md`
- UX Spec: `_bmad-output/planning-artifacts/ux-specification.md`
- Next Epic Analysis: `_bmad-ext/.correct-course/next-epic-analysis-2026-01-18.md`

### Story Dependencies
- CC-SG-01: Storage Gateway Foundation (complete)
- CC-SG-02: Platform Routing Implementation (complete)
- CC-DF-02: DexieDB → FSA Sync Layer (complete)
- CC-DF-03: Agent Tool Integration (complete)

### Implementation References
- Notes File Gateway Pattern: CC-DF-01 implementation
- FSAGateway: src/infrastructure/filesystem/fsa-storage-adapter.ts
- IDBGateway: src/infrastructure/filesystem/indexeddb-storage-adapter.ts

---

**Story Version**: 1.0.0
**Created**: 2026-01-18T12:30:00+07:00
**Last Updated**: 2026-01-18T12:30:00+07:00
