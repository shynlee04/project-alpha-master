---
epic_id: EPIC-38
story_id: 38-1
title: Reverse Sync Infrastructure Implementation
team: Team B (Backend/Agent)
priority: P0
effort: 3 days
status: ready-for-dev
dependency: 38-11 (Sync Event Bus Implementation) ✅ DONE
created_at: 2025-12-31T13:07:00.000Z
agent_mode: bmad-bmm-dev
---

# Story 38-1: Reverse Sync Infrastructure Implementation

## Context Summary

**Epic:** EPIC-38: Project Management System Restoration  
**Story:** 38-1: Reverse Sync Infrastructure  
**Team:** Team B (Backend/Agent)  
**Priority:** P0  
**Effort:** 3 days  
**Status:** ready-for-dev  
**Dependency:** 38-11 (Sync Event Bus Implementation) ✅ DONE

## User Story

As a WebContainer user, I want file changes made inside the WebContainer (e.g., `npm install`, build outputs, generated files) to be synced back to my local file system, so that I can work with the complete project state locally.

## Task Specification

### Acceptance Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| AC-1 | Create `ReverseSyncService` class in `src/lib/sync/` | Pending |
| AC-2 | Implement file watcher to detect WebContainer changes | Pending |
| AC-3 | Add reverse sync logic to copy changed files back to local FS | Pending |
| AC-4 | Integrate with SyncEventBus (Story 38-11) for event listening | Pending |
| AC-5 | Add conflict resolution strategy (local wins, remote wins, or merge) | Pending |
| AC-6 | Implement exclusion patterns for reverse sync (node_modules, .git) | Pending |
| AC-7 | Write unit tests for reverse sync functionality | Pending |

### Implementation Constraints

1. **Sync Direction**: WebContainer → Local FS only (one-way)
2. **Performance**: Debounced batch operations to avoid excessive FS writes
3. **Conflict Resolution**: Prefer local changes (safer default)
4. **Exclusions**: `.git`, `node_modules`, `.DS_Store`, `Thumbs.db`
5. **Permissions**: Handle FileSystemAccessAPI permission errors gracefully

## Research References

### MCP Research Executed

1. **Context7 WebContainer API Documentation**
   - Library: `/websites/webcontainers_io_guides`
   - Key Methods: `fs.readFile(path, encoding)`, `fs.writeFile(path, data, options)`
   - Source: [WebContainer File System Guide](https://github.com/context7/webcontainers_io_guides/blob/main/working-with-the-file-system.md)

2. **DeepWiki WebContainer Core Patterns**
   - Repo: `stackblitz/webcontainer-core`
   - Confirmed file system API patterns

3. **Existing Codebase Analysis**
   - `src/lib/sync/sync-event-bus.ts` - Event bus implementation
   - `src/lib/sync/event-types.ts` - Event type definitions
   - `src/lib/sync/index.ts` - Module exports
   - `src/lib/filesystem/local-fs-adapter.ts` - Local FS operations
   - `src/lib/webcontainer/manager.ts` - WebContainer singleton
   - `src/lib/filesystem/sync-types.ts` - Sync error types

## Implementation Details

### Architecture

```
WebContainer FS Changes
        ↓
[SyncEventBus] (emits file events)
        ↓
[ReverseSyncService] (listens to events)
        ↓
[LocalFSAdapter] (writes to local FS)
```

### Key Components

#### ReverseSyncService Class

```typescript
// File: src/lib/sync/reverse-sync-service.ts

export class ReverseSyncService {
  private syncEventBus: SyncEventBus;
  private localFSAdapter: LocalFSAdapter;
  private exclusionPatterns: string[];
  private isRunning: boolean;
  private conflictResolution: 'local' | 'remote' | 'merge';
  private debounceTimers: Map<string, NodeJS.Timeout>;
  
  constructor(
    syncEventBus: SyncEventBus,
    localFSAdapter: LocalFSAdapter,
    options?: ReverseSyncOptions
  ) {
    this.syncEventBus = syncEventBus;
    this.localFSAdapter = localFSAdapter;
    this.exclusionPatterns = options?.exclusionPatterns ?? this.getDefaultExclusions();
    this.conflictResolution = options?.conflictResolution ?? 'local';
    this.isRunning = false;
    this.debounceTimers = new Map();
  }
  
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    // Subscribe to file events
    this.subscribeToEvents();
  }
  
  stop(): void {
    this.isRunning = false;
    this.unsubscribeFromEvents();
    // Clear debounce timers
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }
  
  private isExcluded(path: string): boolean {
    return this.exclusionPatterns.some(pattern => path.includes(pattern));
  }
  
  private async syncFile(wcPath: string): Promise<void> {
    if (this.isExcluded(wcPath)) return;
    // Read from WC and write to local FS
  }
  
  private handleFileChange(wcPath: string): void {
    // Debounce logic
    const timerKey = wcPath;
    if (this.debounceTimers.has(timerKey)) {
      clearTimeout(this.debounceTimers.get(timerKey));
    }
    const timer = setTimeout(() => {
      this.debounceTimers.delete(timerKey);
      this.syncFile(wcPath);
    }, 100); // 100ms debounce
    this.debounceTimers.set(timerKey, timer);
  }
}
```

### Conflict Resolution Strategy

- **Local Wins (Default)**: If local file exists and is newer than remote, skip sync
- **Remote Wins**: Always overwrite local file
- **Merge**: Not implemented for MVP (requires diff logic)

### Exclusion Patterns

Default patterns (aligned with existing sync implementation):
```typescript
const DEFAULT_EXCLUSIONS = [
  '.git',
  'node_modules',
  '.DS_Store',
  'Thumbs.db',
  '*.swp',
  '*.swo',
];
```

## Key Files to Reference

- `src/lib/sync/event-types.ts` - Event type definitions
- `src/lib/sync/sync-event-bus.ts` - SyncEventBus implementation
- `src/lib/filesystem/local-fs-adapter.ts` - LocalFSAdapter for writing files
- `src/lib/webcontainer/manager.ts` - WebContainer instance access via `getFileSystem()`
- `src/lib/filesystem/sync-types.ts` - SyncError types

## Implementation Tasks

1. **Create Story File:**
   - `_bmad-output/sprint-artifacts/38-1-reverse-sync-infrastructure.md` ✅
   
2. **Create Context XML:**
   - `_bmad-output/sprint-artifacts/38-1-reverse-sync-infrastructure-context.xml`

3. **Implement ReverseSyncService:**
   - `src/lib/sync/reverse-sync-service.ts`
   - Methods: `start()`, `stop()`, `syncFile()`, `isExcluded()`, `handleFileChange()`

4. **Integration with SyncEventBus:**
   - Listen to `sync:file:created`, `sync:file:modified`, `sync:file:deleted` events

5. **Update Barrel Exports:**
   - Add to `src/lib/sync/index.ts`

6. **Write Unit Tests:**
   - `src/lib/sync/__tests__/reverse-sync-service.test.ts`
   - Minimum 15 tests

7. **Run Tests:**
   ```bash
   pnpm test -- --run src/lib/sync/__tests__/reverse-sync-service.test.ts
   ```

## Testing Requirements

- Unit tests for ReverseSyncService
- Mock WebContainer fs and LocalFS for testing
- Test exclusion patterns
- Test conflict resolution
- Test debouncing behavior
- Minimum 15 unit tests

## Code Standards

- Follow existing patterns in `src/lib/sync/`
- Use TypeScript interfaces for all data structures
- Add JSDoc comments for public API
- Include error handling with SyncError types

## Output Location

**Story File:** `_bmad-output/sprint-artifacts/38-1-reverse-sync-infrastructure.md`  
**Dev Handoff:** `_bmad-output/handoffs/bmad-bmm-dev-epic-38-story-1-2025-12-31.md`

---

## Dev Agent Record

**Agent:** @bmad-bmm-dev (💻 Dev)  
**Started:** 2025-12-31T13:07:00.000Z  
**Research Completed:**
- ✅ Context7 WebContainer API documentation
- ✅ DeepWiki WebContainer patterns
- ✅ Existing sync codebase analysis

**Implementation Status:**
- [x] MCP Research
- [ ] Story File Creation
- [ ] Context XML Creation
- [ ] ReverseSyncService Implementation
- [ ] Unit Tests
- [ ] Test Execution
- [ ] Code Review Handoff

**Notes:**
- SyncEventBus already implemented (Story 38-11)
- ReverseSyncService is a listener to the event bus
- WebContainer changes flow: WC → SyncEventBus → ReverseSyncService → LocalFS
- Default conflict resolution: Local wins (safer)
- Debounce window: 100ms
