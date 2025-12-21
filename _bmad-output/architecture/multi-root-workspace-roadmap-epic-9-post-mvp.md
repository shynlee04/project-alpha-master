# Multi-Root Workspace Roadmap (Epic 9 - POST-MVP)

**Added:** 2025-12-12  
**Status:** Scoped for Post-MVP  
**Prerequisites:** Epic 5 (Persistence), Epic 7 (Git Integration)  
**Stories:** See `docs/epics.md` - Epic 9

### User Requirements Addressed

| Requirement | Epic 9 Story | Priority |
|-------------|--------------|----------|
| Save/load workspace file | 9.1 | P0 |
| Multiple folder roots in FileTree | 9.2 | P0 |
| Each root syncs independently | 9.3 | P0 |
| Multiple git repositories | 9.4 | P0 |
| Git submodules / nested git | 9.5 | P1 |
| Workspace state synchronization | 9.6 | P1 |
| Agent tools with multi-root context | 9.7 | P2 |

### Architectural Layers for Multi-Root

```
┌─────────────────────────────────────────────────────────────────┐
│                     Via-Gent IDE                                │
├─────────────────────────────────────────────────────────────────┤
│  Route: /workspace/$workspaceId OR /workspace/$projectId       │
│  └── WorkspaceProvider                                         │
│       ├── Single Root Mode (current Epic 3 hotfix)             │
│       │   └── projectId → single ProjectMetadata              │
│       └── Multi-Root Mode (Epic 9)                             │
│           └── workspaceId → WorkspaceConfig with N roots      │
├─────────────────────────────────────────────────────────────────┤
│  WorkspaceStore (IndexedDB) - NEW in Epic 9                    │
│  ├── WorkspaceConfig: { id, name, folders[], settings }       │
│  ├── folders[]: { name, relativePath, fsaHandle }             │
│  └── recentWorkspaces: { id, lastOpened, folderCount }        │
├─────────────────────────────────────────────────────────────────┤
│  ProjectStore (IndexedDB) - Enhanced for multi-root           │
│  ├── Per-root: { id, workspaceId?, name, fsaHandle }          │
│  └── gitState: { repoPath, branch, status, isSubmodule }      │
├─────────────────────────────────────────────────────────────────┤
│  Multi-Root SyncManager (Epic 9.3)                             │
│  ├── rootSyncStates: Map<rootId, SyncStatus>                  │
│  ├── syncRoot(rootId): independent sync per folder            │
│  └── mountRoot(rootId, mountPath): WebContainer mount         │
├─────────────────────────────────────────────────────────────────┤
│  Multi-Git Integration (Epic 9.4, 9.5)                         │
│  ├── GitRepoRegistry: Map<repoPath, GitContext>               │
│  ├── detectGitRoots(folder): find all .git directories        │
│  ├── detectSubmodules(repo): parse .gitmodules                │
│  └── getRepoForPath(filePath): resolve which repo owns file   │
└─────────────────────────────────────────────────────────────────┘
```

### Workspace File Format (`.via-gent-workspace.json`)

```json
{
  "version": 1,
  "folders": [
    {
      "name": "ROOT",
      "path": "./"
    },
    {
      "name": "packages/app1",
      "path": "./packages/app1"
    },
    {
      "name": "external-dependency",
      "path": "/Users/alice/other-project"
    }
  ],
  "settings": {
    "excludePatterns": [".git", "node_modules", "dist"],
    "git.autoDetectSubmodules": true,
    "sync.mode": "auto"
  }
}
```

### FSA Handle Strategy for Multi-Root

Each folder root requires its own FSA handle because:
1. User may select folders from different locations (not nested)
2. Each folder may have independent permissions (granted vs prompt)
3. Workspace file stores relative paths, but handles stored in IndexedDB

```typescript
// Multi-root handle storage in IndexedDB
interface WorkspaceHandleStore {
  workspaceId: string;
  roots: Array<{
    rootId: string;           // UUID
    name: string;             // Display name
    fsaHandle: FileSystemDirectoryHandle;
    permissionState: FsaPermissionState;
  }>;
}

// Restoring workspace with mixed permission states
async function restoreWorkspace(workspaceId: string): Promise<WorkspaceRestoreResult> {
  const handles = await getWorkspaceHandles(workspaceId);
  const results: RootRestoreResult[] = [];
  
  for (const root of handles.roots) {
    const state = await getPermissionState(root.fsaHandle, 'readwrite');
    results.push({
      rootId: root.rootId,
      name: root.name,
      permissionState: state,
      needsReauthorization: state === 'prompt',
    });
  }
  
  return {
    fullAccess: results.every(r => r.permissionState === 'granted'),
    partialAccess: results.some(r => r.permissionState === 'granted'),
    roots: results,
  };
}
```

### Git Multi-Repo Detection Algorithm

```typescript
interface GitRepoInfo {
  path: string;               // Path to .git directory
  rootPath: string;           // Folder containing .git
  isSubmodule: boolean;       // Detected via parent's .gitmodules
  parentRepo?: string;        // Parent repo path if submodule
  depth: number;              // 0 = top-level, 1+ = nested
}

async function detectGitRepositories(
  rootHandle: FileSystemDirectoryHandle,
  maxDepth = 3
): Promise<GitRepoInfo[]> {
  const repos: GitRepoInfo[] = [];
  
  // 1. Check if root is a git repo
  if (await hasGitDir(rootHandle)) {
    repos.push({ path: '.git', rootPath: '.', isSubmodule: false, depth: 0 });
    
    // 2. Parse .gitmodules for declared submodules
    const submodules = await parseGitModules(rootHandle);
    for (const sub of submodules) {
      repos.push({
        path: `${sub.path}/.git`,
        rootPath: sub.path,
        isSubmodule: true,
        parentRepo: '.',
        depth: 1,
      });
    }
  }
  
  // 3. Recursively scan for nested repos (untracked git dirs)
  await scanForNestedGitDirs(rootHandle, repos, maxDepth);
  
  return repos;
}
```

### Phased Implementation Strategy

| Phase | Stories | Effort | Outcome |
|-------|---------|--------|---------|
| **MVP** | 3-7, 3-8, 3-5, 3-6 | ~10h | Single root switching, sync visibility |
| **Post-MVP Phase 1** | 9.1, 9.2, 9.3 | ~15h | Multi-root FileTree, workspace files |
| **Post-MVP Phase 2** | 9.4, 9.5 | ~10h | Multi-git repos, submodules |
| **Post-MVP Phase 3** | 9.6, 9.7 | ~8h | State sync, agent awareness |

### Compatibility Notes

- **VS Code Workspace Files:** Via-Gent workspace format is inspired by `.code-workspace` but uses `.via-gent-workspace.json` to avoid conflicts
- **Backward Compatibility:** Single-root projects (Epic 3 hotfix) continue to work without workspace file
- **Mixed Mode:** Can open single folder OR workspace file; dashboard shows both types

### Error Classification

| Error Class | Code | User Message |
|-------------|------|--------------|
| `FileSystemError` | `INVALID_PATH` | "Path must be a relative path" |
| `FileSystemError` | `PATH_TRAVERSAL` | "Path traversal (../) is not allowed" |
| `FileSystemError` | `NO_DIRECTORY_ACCESS` | "Call requestDirectoryAccess() first" |
| `PermissionDeniedError` | `PERMISSION_DENIED` | "Permission was denied. Please try again." |
| `SyncError` | `SYNC_FAILED` | "Sync failed: [details]" |

---
