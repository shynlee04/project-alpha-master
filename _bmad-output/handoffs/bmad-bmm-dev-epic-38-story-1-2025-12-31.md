---
date: 2025-12-31
time: 13:05:00+07:00
phase: dev-story
team: Team-B
agent_mode: bmad-bmm-dev
---

# Hand-off: Story 38-1 Reverse Sync Infrastructure

## Context Summary

| Property | Value |
|----------|-------|
| **Epic** | EPIC-38: Project Management System Restoration |
| **Story** | 38-1: Reverse Sync Infrastructure |
| **Team** | Team B (Backend/Agent) |
| **Priority** | P0 |
| **Effort** | 3 days |
| **Status** | ready-for-dev |
| **Dependencies** | 38-11 (Sync Event Bus Implementation) ✅ DONE |

### Story Summary

**User Story:**
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

### Technical Notes from Architecture

- Use `webcontainerInstance.fs.readFile/writeFile` for WebContainer file operations
- Use `LocalFSAdapter` for local file operations
- Subscribe to SyncEventBus events for change detection
- Consider using `chokidar` or similar for file watching if needed

## Current Workflow Status

From `sprint-status.yaml`:
```yaml
epic-38: in_progress
38-11-sync-event-bus-implementation: done  # Completed
38-1-reverse-sync-infrastructure: ready-for-dev  # Current
38-6-sync-status-ui-components: ready-for-dev  # Depends on 38-1
```

## References

### Related Stories
- **38-11**: Sync Event Bus Implementation (dependency ✅ done)
- **38-6**: Sync Status UI Components (depends on this)
- **38-7**: File Tree Sync Integration (depends on 38-6)

### Architecture Documents
- `_bmad-output/tech-specs/epic-38-tech-spec-2025-12-31.md`
- `_bmad-output/project-planning-artifacts/architecture.md`
- `src/lib/sync/` directory structure

### Key Files to Reference
- `src/lib/sync/event-types.ts` - Event type definitions
- `src/lib/sync/sync-event-bus.ts` - SyncEventBus implementation
- `src/lib/filesystem/` - LocalFSAdapter for local file operations
- `src/lib/webcontainer/manager.ts` - WebContainer instance access

## Development Requirements

### Required Research (MCP Tools)

1. **Context7**: WebContainer API for file watching and FS operations
2. **DeepWiki**: stackblitz/webcontainer-core patterns for file sync
3. **Codebase**: Existing sync patterns in `src/lib/sync/`

### Testing Requirements

- Unit tests for ReverseSyncService
- Integration tests with SyncEventBus
- Mock WebContainer and LocalFS for testing
- Minimum 15 unit tests expected

### Code Standards

- Follow existing patterns in `src/lib/sync/`
- Use TypeScript interfaces for all data structures
- Add JSDoc comments for public API
- Include error handling with SyncError types
- All strings via i18n if user-facing

## Next Agent Assignment

**Agent Mode:** `@bmad-bmm-dev`

**Workflow:** `develop-story` (from `.agent/workflows/story-dev-cycle.md`)

**Tasks:**
1. Create story file: `_bmad-output/sprint-artifacts/38-1-reverse-sync-infrastructure.md`
2. Create context XML: `_bmad-output/sprint-artifacts/38-1-reverse-sync-infrastructure-context.xml`
3. Execute MCP research (Context7, DeepWiki, codebase)
4. Implement ReverseSyncService
5. write_to_file unit tests
6. Run tests: `pnpm test -- --run src/lib/sync/__tests__/reverse-sync.test.ts`
7. Document in Dev Agent Record
8. Submit for code review

**Output Location:** 
- Story file: `_bmad-output/sprint-artifacts/38-1-reverse-sync-infrastructure.md`
- Dev handoff: `_bmad-output/handoffs/bmad-bmm-dev-epic-38-story-1-2025-12-31.md`

**Return via:** Report to `@bmad-core-bmad-master` with completion summary
