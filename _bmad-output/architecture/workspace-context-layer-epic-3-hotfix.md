# Workspace Context Layer (Epic 3 Hotfix)

**Added:** 2025-12-12  
**Status:** Ready for Implementation  
**Change Proposal:** [sprint-change-proposal-2025-12-12.md](docs/sprint-artifacts/sprint-change-proposal-2025-12-12.md)

### Architecture Rationale

The original Epic 3 implementation scattered IDE state across `IDELayout` local state. This caused:
- No folder switching (old handle reused)
- No sync status visibility (status not exposed)
- No dashboard integration (mock data only)

**Solution:** Centralized `WorkspaceContext` with `ProjectStore` persistence.

### WorkspaceContext Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Via-Gent IDE                                │
├─────────────────────────────────────────────────────────────────┤
│  Route: /workspace/$projectId                                   │
│  └── WorkspaceProvider (NEW)                                   │
│       ├── WorkspaceState (centralized)                         │
│       └── WorkspaceActions (openFolder, switchFolder, syncNow) │
├─────────────────────────────────────────────────────────────────┤
│  UI Components (consume context via useWorkspace hook)          │
│  ├── IDELayout → uses context for handle, sync status          │
│  ├── FileTree → uses context.directoryHandle                   │
│  ├── SyncStatusIndicator → uses context.syncStatus             │
│  └── Header → uses context for actions                         │
├─────────────────────────────────────────────────────────────────┤
│  Persistence Layer                                              │
│  └── ProjectStore (IndexedDB)                                  │
│       ├── saveProject(metadata)                                │
│       ├── listProjects() → Dashboard                           │
│       └── getProject(id) → Route loader                        │
└─────────────────────────────────────────────────────────────────┘
```

### WorkspaceContext Interface

```typescript
// src/lib/workspace/WorkspaceContext.tsx

interface WorkspaceState {
  projectId: string | null;
  projectMetadata: ProjectMetadata | null;
  directoryHandle: FileSystemDirectoryHandle | null;
  permissionState: FsaPermissionState;
  syncStatus: 'idle' | 'syncing' | 'error';
  syncProgress: SyncProgress | null;
  lastSyncTime: Date | null;
  syncError: string | null;
}

interface WorkspaceActions {
  openFolder(): Promise<void>;      // Show picker, save to ProjectStore
  switchFolder(): Promise<void>;    // Always show picker, replace handle
  syncNow(): Promise<void>;         // Trigger manual sync
  closeProject(): void;             // Clear state, navigate to dashboard
}

// Hook for component access
function useWorkspace(): WorkspaceState & WorkspaceActions;
```

### ProjectStore Schema

```typescript
// src/lib/workspace/project-store.ts

const DB_NAME = 'via-gent-projects';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

interface ProjectMetadata {
  id: string;                              // UUID or slug from folder name
  name: string;                            // Display name (folder name)
  folderPath: string;                      // Display path (for UI only)
  fsaHandle: FileSystemDirectoryHandle;   // Serializable in IndexedDB
  lastOpened: Date;
  layoutState?: {
    panelSizes: number[];
    openFiles: string[];
    activeFile: string | null;
  };
}

// CRUD operations
async function saveProject(project: ProjectMetadata): Promise<void>;
async function getProject(id: string): Promise<ProjectMetadata | null>;
async function listProjects(): Promise<ProjectMetadata[]>;
async function deleteProject(id: string): Promise<void>;
async function checkProjectPermission(id: string): Promise<FsaPermissionState>;
```

### Route Loader Pattern

```typescript
// src/routes/workspace/$projectId.tsx

export const Route = createFileRoute('/workspace/$projectId')({
  ssr: false,
  loader: async ({ params }) => {
    const project = await getProject(params.projectId);
    if (!project) {
      throw redirect({ to: '/' });
    }
    return { project };
  },
  component: WorkspaceRoute,
});

function WorkspaceRoute() {
  const { project } = Route.useLoaderData();
  return (
    <WorkspaceProvider initialProject={project}>
      <IDELayout />
    </WorkspaceProvider>
  );
}
```

### Multi-Root Workspace (Future - Epic 5+)

Based on VS Code research, future multi-root support would extend:

```typescript
interface WorkspaceConfig {
  folders: Array<{
    name: string;           // Display name
    path: string;           // Relative path within workspace
    handle: FileSystemDirectoryHandle;
  }>;
  settings: Record<string, unknown>;
}

// .via-gent-workspace.json file in user's folder
{
  "folders": [
    { "name": "ROOT", "path": "./" },
    { "name": "packages/app1", "path": "./packages/app1" }
  ]
}
```

**Note:** Multi-root is out of scope for current hotfix. Current implementation supports single root switching.

---
