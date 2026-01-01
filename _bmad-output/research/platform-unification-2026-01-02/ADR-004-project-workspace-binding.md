---
title: ADR-004: Project Workspace Binding
status: Proposed
date: 2026-01-02
iteration: 9
cornerstone: 4
priority: P2 (Maintainability)
---

# ADR-004: Project Workspace Binding

**Status:** Proposed
**Date:** 2026-01-02
**Iteration:** 9
**Cornerstone:** 4 - Project & File System
**Priority:** P2 (Maintainability - Optional Enhancement)
**Estimated Effort:** 5 hours (2 hours store split + 3 hours search utilities)

---

## Context

### Current State (EXCELLENT - 90% Health)

**Strengths:**
- ✅ Single unified project store (no fragmentation)
- ✅ Excellent facade pattern (AgentFileTools interface)
- ✅ Event-driven architecture (WorkspaceEventEmitter)
- ✅ Proper dual-write strategy (Local FS + WebContainer)
- ✅ Workspace-aware project scoping
- ✅ Clean separation: Domain → Infrastructure → Presentation

**Architecture Highlights:**

```typescript
// src/lib/workspace/project-store.ts (451 lines - 13% over 300-line best practice)

export interface ProjectMetadata {
  id: string;
  name: string;
  path: string;
  description?: string;

  // Workspace bindings
  workspaceBindings: WorkspaceBindings; // { ide?, notes?, knowledge?, study? }

  // File system state
  fileCount: number;
  lastSyncedAt: number;
  createdAt: number;
  updatedAt: number;
}

export interface WorkspaceBindings {
  ide?: boolean;
  notes?: boolean;
  knowledge?: boolean;
  study?: boolean;
}
```

**Facade Pattern (EXCELLENT):**

```typescript
// src/lib/agent/facades/file-tools.ts (217 lines)

export interface AgentFileTools {
  // Basic operations
  readFile(path: string): Promise<string | null>;
  writeFile(path: string, content: string): Promise<void>;
  listDirectory(path: string, recursive?: boolean): Promise<FileEntry[]>;

  // Advanced operations with rollback
  readMultiple(paths: string[], signal?: AbortSignal): Promise<FileReadResult[]>;
  writeMultiple(files: Array<{path, content}>, onProgress?, signal?): Promise<void>;
  globFiles(pattern: string, basePath?: string): Promise<FileEntry[]>;
}

// Implementation hides WebContainer vs Local FS complexity
export function createFileToolsFacade(
  localAdapter: LocalFSAdapter,
  syncManager: SyncManager,
  eventBus: WorkspaceEventEmitter
): AgentFileTools {
  return {
    async readFile(path: string) {
      // 1. Read from Local FS (source of truth)
      const result = await localAdapter.readFile(path);

      // 2. Emit event (observability)
      eventBus.emit('file:read', { path, result });

      return result.content;
    },

    async writeFile(path: string, content: string) {
      // 1. Write to Local FS (source of truth)
      await localAdapter.writeFile(path, content);

      // 2. Emit event (observability)
      eventBus.emit('file:modified', { path, source: 'agent' });

      // 3. Write to WebContainer (mirror)
      await syncManager.writeFileToWebContainer(path, content);
    },

    // ... more methods
  };
}
```

**Event-Driven Architecture (EXCELLENT):**

```typescript
// src/lib/events/workspace-event-bus.ts

export class WorkspaceEventEmitter {
  private emitter = new EventEmitter();

  emit(event: WorkspaceEvent, payload: any): void {
    this.emitter.emit(event, payload);
  }

  on(event: WorkspaceEvent, handler: Function): void {
    this.emitter.on(event, handler);
  }
}

// Events: file:read, file:modified, file:deleted, sync:completed, etc.
```

**Gap Analysis:** From `cornerstone-4-project-analysis.md`
- Project health score: **90%** (excellent architecture)
- God stores: 0 ✅
- Store locations: 1 unified ✅
- Max file size: 451 lines ⚠️ (13% over 300-line "best practice")
- Facade pattern: Excellent ✅
- Event-driven: Excellent ✅
- **MINOR:** Store slightly over limit (optional refactoring)

### Current Architecture

```
┌─────────────────────────────────────────────┐
│ PROJECT STORE (project-store.ts - 451 lines)│
│                                             │
│ - Project CRUD (save, get, list, update)   │
│ - Workspace bindings management             │
│ - Project search utilities                  │
│                                             │
│ ⚠️ 13% over 300-line best practice        │
└─────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│ WORKSPACE STATE (WorkspaceContext)          │
│                                             │
│ - projectId: string | null                 │
│ - projectMetadata: ProjectMetadata | null  │
│ - directoryHandle: FileSystemDirectoryHandle│
│ - permissionState: FsaPermissionState       │
│ - syncStatus: SyncStatus                    │
│ - autoSync: boolean                         │
│ - isOpeningFolder: boolean                  │
│ - exclusionPatterns: string[]               │
│ - isWebContainerBooted: boolean             │
│ - initialSyncCompleted: boolean             │
└─────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│ FILE SYSTEM ADAPTER (LocalFSAdapter)        │
│                                             │
│ - requestDirectoryAccess()                  │
│ - readFile(path, options)                   │
│ - writeFile(path, content)                  │
│ - listDirectory(path)                       │
│ - deleteFile(path)                          │
└─────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│ SYNC MANAGER (Dual-Write Strategy)          │
│                                             │
│ writeFile(path, content):                  │
│   1. Write to Local FS (source of truth)    │
│   2. Emit event (observability)             │
│   3. Write to WebContainer (mirror)         │
└─────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│ FACADE PATTERN (AgentFileTools)             │
│                                             │
│ Stable API contract for:                   │
│ - Agent tool execution                      │
│ - File operations (read, write, list)       │
│ - Multi-file operations (batch)             │
│ - Glob patterns                             │
└─────────────────────────────────────────────┘
```

---

## Decision

**Maintain current project architecture with optional minor enhancements.**

**Key Principle:** The project & file system architecture is already excellent (90% health). Only implement optional refactoring for consistency with best practices.

### Optional Enhancements

1. **Split Project Store** (P2 - 2 hours)
   - Refactor into 3 focused modules
   - `project-crud.ts` (save, get, list, delete)
   - `project-bindings.ts` (workspace bindings management)
   - `project-search.ts` (search utilities)
   - All modules <150 lines

2. **Add Project Search Utilities** (P2 - 3 hours)
   - Search by name/path
   - Filter by workspace binding
   - Recent projects query
   - Full-text search (optional)

**Note:** These enhancements are OPTIONAL and low priority. The current architecture is production-ready.

---

## Consequences

### Benefits (Current Architecture)

1. **Single Source of Truth** ✅
   - 1 unified project store
   - No fragmentation
   - Clear ownership

2. **Facade Pattern** ✅
   - Stable API contract (AgentFileTools interface)
   - Easy to mock for testing
   - Swappable implementations

3. **Event-Driven Architecture** ✅
   - WorkspaceEventEmitter for observability
   - Loose coupling
   - Cross-component communication

4. **Dual-Write Strategy** ✅
   - Local FS as source of truth
   - WebContainer as mirror
   - Sync manager orchestrates

5. **Workspace-Aware** ✅
   - Projects bound to workspaces
   - Per-workspace filtering
   - Clean scoping

### Benefits (Proposed Enhancements)

1. **Code Organization** ✅
   - Split 451-line store into 3 focused modules
   - Each module <150 lines
   - Easier to maintain

2. **Search Capabilities** ✅
   - Find projects by name/path
   - Filter by workspace binding
   - Recent projects query
   - Improved UX

### Drawbacks

1. **Minimal Drawbacks** ✅
   - Current architecture is already excellent
   - Enhancements are optional
   - Low risk

2. **Refactoring Overhead** ⚠️
   - 2 hours for store split
   - Update imports across codebase
   - Testing overhead

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Store split breaks imports** | Low | Medium | - Barrel exports maintain compatibility<br>- Update imports systematically<br>- Run test suite after changes |
| **Search utilities slow** | Low | Low | - Index projects in memory<br>- Debounce search queries<br>- Lazy loading |
| **Workspace binding inconsistency** | Low | Medium | - Add validation<br>- Check bindings on project load<br>- User prompts for confirmation |

---

## Implementation Plan

### Phase 1: Split Project Store (2 hours) - OPTIONAL

**Step 1.1:** Create project-crud module
```typescript
// src/lib/workspace/project-crud.ts

import { db } from '../filesystem/sync-manager/dexie-db';

export interface ProjectMetadata {
  id: string;
  name: string;
  path: string;
  description?: string;
  workspaceBindings: WorkspaceBindings;
  fileCount: number;
  lastSyncedAt: number;
  createdAt: number;
  updatedAt: number;
}

export async function saveProject(project: ProjectMetadata): Promise<void> {
  await db.open();
  await db.projects.put(toRecord(project));
}

export async function getProject(id: string): Promise<ProjectMetadata | null> {
  await db.open();
  const record = await db.projects.get(id);
  return record ? fromRecord(record) : null;
}

export async function listProjects(): Promise<ProjectMetadata[]> {
  await db.open();
  const records = await db.projects.toArray();
  return records.map(fromRecord);
}

export async function deleteProject(id: string): Promise<void> {
  await db.open();
  await db.projects.delete(id);
}
```

**Step 1.2:** Create project-bindings module
```typescript
// src/lib/workspace/project-bindings.ts

export interface WorkspaceBindings {
  ide?: boolean;
  notes?: boolean;
  knowledge?: boolean;
  study?: boolean;
}

export async function updateWorkspaceBindings(
  projectId: string,
  bindings: WorkspaceBindings
): Promise<void> {
  const project = await getProject(projectId);
  if (!project) return;

  project.workspaceBindings = bindings;
  await saveProject(project);
}

export async function getProjectsForWorkspace(
  workspaceType: WorkspaceType
): Promise<ProjectMetadata[]> {
  const projects = await listProjects();
  return projects.filter(p => p.workspaceBindings[workspaceType]);
}

export async function isProjectInWorkspace(
  projectId: string,
  workspaceType: WorkspaceType
): Promise<boolean> {
  const project = await getProject(projectId);
  return project?.workspaceBindings[workspaceType] || false;
}
```

**Step 1.3:** Create project-search module
```typescript
// src/lib/workspace/project-search.ts

export async function searchProjectsByName(query: string): Promise<ProjectMetadata[]> {
  const projects = await listProjects();
  const lowerQuery = query.toLowerCase();

  return projects.filter(p =>
    p.name.toLowerCase().includes(lowerQuery)
  );
}

export async function searchProjectsByPath(query: string): Promise<ProjectMetadata[]> {
  const projects = await listProjects();
  const lowerQuery = query.toLowerCase();

  return projects.filter(p =>
    p.path.toLowerCase().includes(lowerQuery)
  );
}

export async function getRecentProjects(limit: number = 10): Promise<ProjectMetadata[]> {
  const projects = await listProjects();
  return projects
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);
}

export async function getProjectsByWorkspaceBinding(
  workspaceType: WorkspaceType
): Promise<ProjectMetadata[]> {
  const projects = await listProjects();
  return projects.filter(p => p.workspaceBindings[workspaceType]);
}
```

**Step 1.4:** Update imports across codebase
- [ ] Update `project-store.ts` to use new modules
- [ ] Update imports in components
- [ ] Update imports in services
- [ ] Run `pnpm tsc --noEmit` to verify

### Phase 2: Add Search UI (3 hours) - OPTIONAL

**Step 2.1:** Create ProjectSearch component
```typescript
// src/presentation/components/workspace/ProjectSearch.tsx

export function ProjectSearch({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProjectMetadata[]>([]);

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (query.length === 0) {
        setResults([]);
        return;
      }

      const projects = await searchProjectsByName(query);
      setResults(projects);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  return (
    <div className="project-search">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search projects..."
      />

      <ul className="search-results">
        {results.map(project => (
          <li key={project.id}>
            <button onClick={() => onSelect(project)}>
              {project.name}
              <span className="path">{project.path}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Step 2.2:** Add RecentProjects component
```typescript
// src/presentation/components/workspace/RecentProjects.tsx

export function RecentProjects({ limit = 5 }: Props) {
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);

  useEffect(() => {
    getRecentProjects(limit).then(setProjects);
  }, [limit]);

  return (
    <div className="recent-projects">
      <h3>Recent Projects</h3>

      <ul>
        {projects.map(project => (
          <li key={project.id}>
            <Link to={`/ide/${project.id}`}>
              {project.name}
              <span className="timestamp">
                {formatTimestamp(project.updatedAt)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Step 2.3:** Integrate into workspace switcher
- [ ] Add search to WorkspaceSwitcher
- [ ] Add recent projects to home screen
- [ ] Add filter by workspace binding

---

## Migration Strategy

### No Migration Required ✅

The project architecture is already excellent. Optional refactoring only.

### Deployment Strategy

1. **Feature Flags** (optional)
   - Enable new search UI behind feature flag
   - Roll out gradually

2. **Backward Compatibility**
   - Keep barrel exports for old imports
   - Gradual migration to new modules

3. **Testing**
   - Verify all project operations work
   - Test search performance
   - Validate workspace bindings

---

## Testing Strategy

### Unit Tests

```typescript
// src/lib/workspace/__tests__/project-crud.test.ts

describe('Project CRUD', () => {
  it('should save and retrieve project', async () => {
    const project = createMockProject();
    await saveProject(project);

    const retrieved = await getProject(project.id);
    expect(retrieved).toEqual(project);
  });

  it('should list all projects', async () => {
    const projects = [createMockProject(), createMockProject()];
    await Promise.all(projects.map(saveProject));

    const listed = await listProjects();
    expect(listed).toHaveLength(2);
  });
});
```

### Integration Tests

```typescript
// src/lib/workspace/__tests__/project-bindings.test.ts

describe('Project Bindings', () => {
  it('should filter projects by workspace', async () => {
    const project1 = createMockProject({ workspaceBindings: { ide: true } });
    const project2 = createMockProject({ workspaceBindings: { knowledge: true } });

    await saveProject(project1);
    await saveProject(project2);

    const ideProjects = await getProjectsForWorkspace('ide');
    expect(ideProjects).toEqual([project1]);
  });
});
```

### Manual Testing Checklist

- [ ] Create project in IDE workspace
- [ ] Verify project available in IDE workspace
- [ ] Verify project NOT available in other workspaces
- [ ] Update workspace bindings
- [ ] Verify project available in new workspace
- [ ] Test search by name
- [ ] Test search by path
- [ ] Test recent projects query

---

## Rollback Strategy

### If Store Split Fails

**Step 1:** Revert module changes
- Git revert `project-crud.ts`
- Git revert `project-bindings.ts`
- Git revert `project-search.ts`
- Restore `project-store.ts`

**Step 2:** Verify rollback
- [ ] Run `pnpm tsc --noEmit` (should pass)
- [ ] Run `pnpm test` (should pass)
- [ ] Manual test: Project operations work

---

## Success Criteria

### Completion Checklist

**Cornerstone 4 Complete When:**
- [ ] Single unified project store maintained (1 location)
- [ ] Facade pattern preserved (AgentFileTools interface)
- [ ] Event-driven architecture maintained (WorkspaceEventEmitter)
- [ ] Dual-write strategy working (Local FS + WebContainer)
- [ ] Workspace bindings functional
- [ ] (OPTIONAL) Project store split into 3 modules (<150 lines each)
- [ ] (OPTIONAL) Search utilities implemented
- [ ] Zero TypeScript errors: `pnpm tsc --noEmit`
- [ ] All tests passing: `pnpm test`
- [ ] Manual test: Create project → Bind to workspace → Access from workspace

**Current Status:** ✅ **ALREADY COMPLETE** (90% health)
**Enhancement Status:** ⏸️ **OPTIONAL** (P2 priority - can defer)

---

## Related ADRs

- **ADR-001:** Provider Store Consolidation (independent)
- **ADR-002:** Agent Vault Architecture (independent)
- **ADR-003:** Conversation Thread Schema (independent - but conversations scoped to projects)
- **ADR-005:** RAG Pipeline Design (independent)
- **ADR-006:** Workspace State Sharing (related - event patterns)

---

## References

- **Phase 1 Analysis:** `cornerstone-4-project-analysis.md`
- **Project Store:** `src/lib/workspace/project-store.ts`
- **Facade:** `src/lib/agent/facades/file-tools.ts`
- **Event Bus:** `src/lib/events/workspace-event-bus.ts`
- **Sync Manager:** `src/lib/filesystem/sync-manager/sync-manager.ts`

---

## Open Questions

1. **Should we split the project store now or defer?**
   - **Decision:** DEFER to Phase 3 (P2 priority)
   - **Reasoning:** Current 451-line store is still manageable, not blocking

2. **Should we add full-text search for projects?**
   - **Decision:** DEFER to Phase 3 (P2 priority)
   - **Reasoning:** Nice-to-have, name/path search sufficient for now

3. **Should we implement project templates?**
   - **Decision:** DEFER to Phase 3 (P2 priority)
   - **Reasoning:** Enhancement, not blocking for MVP

---

**Status:** Proposed (Optional Enhancement)
**Next Step:** Implementation Phase 1 (Split Project Store) - OPTIONAL
**Estimated Completion:** Iterations 61-65 (Sprint 2 - P1-P2 Refinement)
**Risk Level:** LOW (current architecture is excellent)

---

**Generated:** 2026-01-02
**Author:** Ralph Wiggum Loop (Phase 2 - ADR Creation)
**Review Status:** Pending stakeholder approval
**NOTE:** This ADR is OPTIONAL. Current architecture is production-ready (90% health). Implement enhancements only if needed.
