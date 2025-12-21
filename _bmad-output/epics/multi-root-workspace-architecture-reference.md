# Multi-Root Workspace Architecture Reference

### State Synchronization Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                     Persistence Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  WorkspaceStore (IndexedDB)                                     │
│  ├── workspaces: WorkspaceConfig[]                             │
│  ├── recentWorkspaces: { path, lastOpened }[]                  │
│  └── workspaceState: { openFiles, layout, activeRoot }         │
├─────────────────────────────────────────────────────────────────┤
│  ProjectStore (IndexedDB) - per folder root                     │
│  ├── fsaHandle: FileSystemDirectoryHandle                      │
│  ├── gitState: { branch, status, remote }                      │
│  └── folderSettings: { excludePatterns, formatOnSave }         │
├─────────────────────────────────────────────────────────────────┤
│  Local Storage (browser)                                        │
│  └── .via-gent-workspace.json files on user's disk             │
└─────────────────────────────────────────────────────────────────┘
```

### Git Integration Hierarchy

```
Workspace
├── Root 1: "frontend" → .git (main repo)
│   └── Status: main, 3 modified
├── Root 2: "backend" → .git (separate repo)
│   └── Status: develop, 1 staged
└── Root 3: "monorepo" → .git (main)
    ├── packages/shared → .git (submodule)
    │   └── Status: v1.2.0, clean
    └── packages/ui → .git (submodule)
        └── Status: v2.0.0, 2 modified
```

---
