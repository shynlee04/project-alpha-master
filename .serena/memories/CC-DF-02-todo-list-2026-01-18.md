# CC-DF-02 TODO List
**Story**: DexieDB → FSA Sync Layer
**Created**: 2026-01-18
**Status**: IN_PROGRESS

## Tasks

### Step 1: Research & Documentation ✅ COMPLETE
- [x] MCP Research: FileSystemObserver API (Chrome 129+)
- [x] MCP Research: File watching best practices
- [x] MCP Research: Conflict resolution patterns
- [x] Check dependencies: note-formatter, note-exporter, FSA adapter

### Step 2: Create FileWatcher
- [ ] Create `src/lib/notes/sync/file-watcher.ts`
  - [ ] Feature detection for FileSystemObserver
  - [ ] Native watcher implementation (Chrome 129+)
  - [ ] Polling fallback (Chrome < 129)
  - [ ] Debounce logic (500ms)
  - [ ] Recursive directory watching

### Step 3: Create CacheSync
- [ ] Create `src/lib/notes/sync/cache-sync.ts`
  - [ ] DexieDB read operations
  - [ ] FSA write operations (via adapter)
  - [ ] Timestamp comparison
  - [ ] Conflict detection
  - [ ] Sync statistics tracking

### Step 4: Create NoteSyncLayer
- [ ] Create `src/lib/notes/sync/note-sync-layer.ts`
  - [ ] Orchestrate FileWatcher + CacheSync
  - [ ] Handle external file changes
  - [ ] Handle DexieDB changes
  - [ ] Conflict resolution UI hooks

### Step 5: Create Exports
- [ ] Create `src/lib/notes/sync/index.ts`
  - [ ] Clean exports for all modules

### Step 6: Write Tests
- [ ] Create `src/lib/notes/__tests__/sync-layer.test.ts`
  - [ ] File watcher tests
  - [ ] Cache sync tests
  - [ ] Conflict detection tests
  - [ ] Integration tests

### Step 7: Validation
- [ ] TypeScript check: `pnpm tsc --noEmit`
- [ ] Run tests: `pnpm vitest run`
- [ ] Test coverage verification

### Step 8: Report
- [ ] Generate implementation report
- [ ] Update LOOP_STATE.yaml
- [ ] Register in ARTIFACT_REGISTRY

## Progress
- **Completed**: 1/8 steps (12.5%)
- **Estimate**: 6 hours total
- **Next**: FileWatcher implementation
