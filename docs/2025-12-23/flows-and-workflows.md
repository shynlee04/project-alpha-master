# Flows and Workflows

**Analysis Date:** 2025-12-23  
**Project:** Via-gent Browser-Based IDE  
**Purpose:** Sequence diagrams for key system workflows

---

## Table of Contents

1. [Application Initialization Flow](#application-initialization-flow)
2. [Project Open Flow](#project-open-flow)
3. [File Sync Flow](#file-sync-flow)
4. [Agent File Operation Flow](#agent-file-operation-flow)
5. [WebContainer Boot Flow](#webcontainer-boot-flow)
6. [Permission Restoration Flow](#permission-restoration-flow)
7. [Project Switch Flow](#project-switch-flow)

---

## Application Initialization Flow

**Location:** [`src/routes/__root.tsx`](../src/routes/__root.tsx)

```mermaid
sequenceDiagram
    participant Browser
    participant App as Root Route
    participant WC as WebContainer Manager
    participant EventBus as WorkspaceEventBus
    participant I18n as i18next

    Browser->>App: Load application
    App->>App: Initialize TanStack Router
    App->>I18n: Initialize i18next
    I18n-->>App: Ready
    App->>EventBus: Create event bus
    EventBus-->>App: Ready
    App->>WC: setEventBus(eventBus)
    App->>WC: boot()
    
    alt WebContainer not booted
        WC->>WC: WebContainer.boot()
        WC->>EventBus: emit('container:booted', { bootTime })
        WC-->>App: WebContainer instance
    else Already booted
        WC-->>App: Existing instance
    end
    
    App-->>Browser: Render application
```

**Key Points:**
- WebContainer boots only once (singleton pattern)
- Event bus is created before WebContainer boot
- Cross-origin isolation headers must be present for WebContainer to work
- Boot time is ~3-5 seconds

---

## Project Open Flow

**Location:** [`src/lib/workspace/hooks/useWorkspaceActions.ts`](../src/lib/workspace/hooks/useWorkspaceActions.ts:55)

```mermaid
sequenceDiagram
    participant User
    participant UI as Workspace UI
    participant Actions as useWorkspaceActions
    participant FSA as LocalFSAdapter
    participant Store as ProjectStore
    participant IndexedDB
    participant SyncOps as useSyncOperations
    participant Sync as SyncManager
    participant WC as WebContainer
    participant EventBus as WorkspaceEventBus

    User->>UI: Click "Open Folder"
    UI->>Actions: openFolder()
    
    Actions->>Actions: Check existing handle
    
    alt Existing handle
        Actions->>FSA: getPermissionState(handle)
        FSA-->>Actions: 'granted' | 'prompt' | 'denied'
        
        alt Permission granted
            Actions->>SyncOps: performSync(handle, { fullSync })
            SyncOps->>Sync: syncToWebContainer()
            Sync->>FSA: Read files from local FS
            FSA-->>Sync: File contents
            Sync->>WC: Write files to WebContainer
            WC-->>Sync: Write complete
            Sync->>EventBus: emit('sync:completed')
            SyncOps-->>Actions: Sync complete
        else Permission not granted
            Actions->>FSA: ensureReadWritePermission(handle)
            FSA->>User: Show permission dialog
            User->>FSA: Grant permission
            FSA-->>Actions: 'granted'
            Actions->>SyncOps: performSync(handle, { fullSync })
        end
    else No existing handle
        Actions->>UI: setIsOpeningFolder(true)
        Actions->>FSA: requestDirectoryAccess()
        FSA->>User: Show directory picker
        User->>FSA: Select folder
        FSA-->>Actions: FileSystemDirectoryHandle
        Actions->>Actions: setDirectoryHandle(handle)
        Actions->>Actions: setPermissionState('granted')
        
        Actions->>Store: saveDirectoryHandleReference(handle, projectId)
        Store->>IndexedDB: Store handle
        IndexedDB-->>Store: Stored
        
        Actions->>Store: saveProject(project)
        Store->>IndexedDB: Store project metadata
        IndexedDB-->>Store: Stored
        
        Actions->>SyncOps: performSync(handle, { fullSync: autoSync })
        SyncOps->>Sync: syncToWebContainer()
        Sync->>FSA: Read files from local FS
        FSA-->>Sync: File contents
        Sync->>WC: Write files to WebContainer
        WC-->>Sync: Write complete
        Sync->>EventBus: emit('sync:completed')
        SyncOps-->>Actions: Sync complete
        
        Actions->>UI: setIsOpeningFolder(false)
    end
    
    Actions-->>UI: Open complete
```

**Key Points:**
- Local FS is the source of truth
- WebContainer mirrors local files (no reverse sync)
- Permission state is checked before sync
- Handle is persisted to IndexedDB for restoration

---

## File Sync Flow

**Location:** [`src/lib/workspace/hooks/useSyncOperations.ts`](../src/lib/workspace/hooks/useSyncOperations.ts:28)

```mermaid
sequenceDiagram
    participant Actions as useWorkspaceActions
    participant SyncOps as useSyncOperations
    participant Sync as SyncManager
    participant FSA as LocalFSAdapter
    participant WC as WebContainer
    participant EventBus as WorkspaceEventBus
    participant State as Workspace State

    Actions->>SyncOps: performSync(handle, { fullSync: true })
    
    alt No SyncManager instance
        SyncOps->>SyncOps: Create LocalFSAdapter
        SyncOps->>SyncOps: Create SyncManager
        SyncOps->>Sync: new SyncManager(adapter, config, eventBus)
        Sync-->>SyncOps: SyncManager instance
    end
    
    SyncOps->>Sync: adapter.setDirectoryHandle(handle)
    SyncOps->>State: setSyncStatus('syncing')
    SyncOps->>State: setSyncError(null)
    
    Sync->>EventBus: emit('sync:started', { fileCount, direction: 'to-wc' })
    
    loop For each file/directory
        Sync->>FSA: listDirectory(path)
        FSA-->>Sync: DirectoryEntry[]
        
        alt File not excluded
            Sync->>FSA: readFile(path)
            FSA-->>Sync: FileReadResult
            Sync->>WC: fs.writeFile(path, content)
            WC-->>Sync: Write complete
            Sync->>EventBus: emit('sync:progress', { current, total, currentFile })
        else File excluded
            Note over Sync: Skip excluded file
        end
    end
    
    Sync->>EventBus: emit('sync:completed', { success, filesProcessed })
    SyncOps->>State: setLastSyncTime(new Date())
    SyncOps->>State: setSyncStatus('idle')
    SyncOps->>State: setSyncProgress(null)
    
    SyncOps-->>Actions: Sync complete
```

**Key Points:**
- Sync is one-way: Local FS → WebContainer
- Default exclusions: `.git`, `node_modules`, `.DS_Store`, `Thumbs.db`
- Progress events are emitted for UI updates
- Partial failures don't stop the entire sync

---

## Agent File Operation Flow

**Location:** [`src/lib/agent/facades/file-tools-impl.ts`](../src/lib/agent/facades/file-tools-impl.ts)

```mermaid
sequenceDiagram
    participant Agent as AI Agent
    participant Tools as AgentFileTools
    participant Validator as Path Validator
    participant FSA as LocalFSAdapter
    participant Sync as SyncManager
    participant WC as WebContainer
    participant EventBus as WorkspaceEventBus

    Agent->>Tools: writeFile(path, content)
    Tools->>Validator: validatePath(path)
    
    alt Invalid path
        Validator-->>Tools: PathValidationError
        Tools-->>Agent: Error
    else Valid path
        Validator-->>Tools: Valid
        
        Tools->>FSA: writeFile(path, content)
        FSA->>FSA: Write to local FS
        FSA-->>Tools: Write complete
        
        Tools->>Sync: writeFile(path, content)
        Sync->>WC: fs.writeFile(path, content)
        WC-->>Sync: Write complete
        Sync-->>Tools: Sync complete
        
        Tools->>EventBus: emit('file:modified', { path, source: 'agent' })
        EventBus-->>Tools: Emitted
        
        Tools-->>Agent: Success
    end
```

**Key Points:**
- Agent tools validate paths before operations
- File operations go to both Local FS and WebContainer
- Events are emitted with `source: 'agent'` for tracking
- Path validation prevents directory traversal attacks

---

## WebContainer Boot Flow

**Location:** [`src/lib/webcontainer/manager.ts`](../src/lib/webcontainer/manager.ts:65)

```mermaid
sequenceDiagram
    participant App as Application
    participant WC as WebContainer Manager
    participant WC_API as @webcontainer/api
    participant EventBus as WorkspaceEventBus

    App->>WC: boot(options)
    
    alt Already booted
        WC-->>App: Existing instance
    else Not booted
        alt Boot in progress
            WC-->>App: Boot promise
        else Start boot
            WC->>WC: Set bootPromise
            WC->>WC_API: WebContainer.boot({ coep, workdirName })
            
            alt Boot success
                WC_API-->>WC: WebContainer instance
                WC->>WC: Set instance
                WC->>EventBus: emit('container:booted', { bootTime })
                WC->>WC: Clear bootPromise
                WC-->>App: WebContainer instance
            else Boot failed
                WC_API-->>WC: Error
                WC->>WC: Clear bootPromise
                WC->>EventBus: emit('container:error', { error })
                WC-->>App: WebContainerError
            end
        end
    end
```

**Key Points:**
- Singleton pattern: only one WebContainer per page
- Boot promise prevents double-booting
- Boot time is ~3-5 seconds
- Events are emitted for boot success/failure

---

## Permission Restoration Flow

**Location:** [`src/lib/filesystem/permission-lifecycle.ts`](../src/lib/filesystem/permission-lifecycle.ts:192)

```mermaid
sequenceDiagram
    participant User
    participant UI as Workspace UI
    participant Actions as useWorkspaceActions
    participant Perm as Permission Lifecycle
    participant FSA as Browser FSA API
    participant Store as ProjectStore
    participant Sync as SyncManager

    User->>UI: Click "Restore Access" button
    UI->>Actions: restoreAccess()
    
    Actions->>Perm: restorePermission(directoryHandle)
    
    Perm->>FSA: queryPermission({ mode: 'readwrite' })
    
    alt Permission granted
        FSA-->>Perm: 'granted'
        Perm-->>Actions: 'granted'
        Actions->>Actions: setPermissionState('granted')
        Actions->>Store: saveProject({ lastKnownPermissionState: 'granted' })
        Store->>IndexedDB: Update project
        Actions->>Sync: syncToWebContainer()
        Sync-->>Actions: Sync complete
    else Permission not granted
        Perm->>FSA: requestPermission({ mode: 'readwrite' })
        FSA->>User: Show permission dialog
        
        alt User grants permission
            User->>FSA: Grant permission
            FSA-->>Perm: 'granted'
            Perm-->>Actions: 'granted'
            Actions->>Actions: setPermissionState('granted')
            Actions->>Store: saveProject({ lastKnownPermissionState: 'granted' })
            Store->>IndexedDB: Update project
            Actions->>Sync: syncToWebContainer()
            Sync-->>Actions: Sync complete
        else User denies permission
            User->>FSA: Deny permission
            FSA-->>Perm: 'denied'
            Perm-->>Actions: 'denied'
            Actions->>Actions: setPermissionState('denied')
            Actions->>Store: saveProject({ lastKnownPermissionState: 'denied' })
            Store->>IndexedDB: Update project
        end
    end
    
    Actions-->>UI: Restore complete
```

**Key Points:**
- Chrome 122+ supports persistent permissions ("Allow on every visit")
- User controls when permission dialog appears
- Permission state is persisted to IndexedDB
- Sync is triggered automatically after successful restoration

---

## Project Switch Flow

**Location:** [`src/lib/workspace/hooks/useWorkspaceActions.ts`](../src/lib/workspace/hooks/useWorkspaceActions.ts:115)

```mermaid
sequenceDiagram
    participant User
    participant UI as Workspace UI
    participant Actions as useWorkspaceActions
    participant Router as TanStack Router
    participant FSA as LocalFSAdapter
    participant Store as ProjectStore
    participant Sync as SyncManager
    participant WC as WebContainer
    participant IndexedDB
    participant EventBus as WorkspaceEventBus

    User->>UI: Click "Switch Folder"
    UI->>Actions: switchFolder()
    
    Actions->>UI: setIsOpeningFolder(true)
    Actions->>FSA: requestDirectoryAccess()
    FSA->>User: Show directory picker
    User->>FSA: Select new folder
    FSA-->>Actions: New handle
    
    Actions->>Actions: Clear adapter refs
    Actions->>Actions: setDirectoryHandle(newHandle)
    Actions->>Actions: setPermissionState('granted')
    
    Actions->>Actions: Generate new project ID
    Actions->>Actions: setAutoSyncState(true)
    
    Actions->>Store: saveDirectoryHandleReference(handle, newProjectId)
    Store->>IndexedDB: Store handle
    IndexedDB-->>Store: Stored
    
    Actions->>Store: saveProject(newProject)
    Store->>IndexedDB: Store project metadata
    IndexedDB-->>Store: Stored
    
    Actions->>Sync: syncToWebContainer({ fullSync: true })
    Sync->>FSA: Read files from new folder
    FSA-->>Sync: File contents
    Sync->>WC: Write files to WebContainer
    WC-->>Sync: Write complete
    Sync->>EventBus: emit('sync:completed')
    Sync-->>Actions: Sync complete
    
    Actions->>Router: navigate({ to: '/workspace/$projectId', params: { projectId: newProjectId } })
    Router-->>UI: Navigate to new workspace
    
    Actions->>UI: setIsOpeningFolder(false)
```

**Key Points:**
- Switching folder generates a new project ID
- Old adapter refs are cleared to prevent state leakage
- WebContainer is reused (singleton)
- Navigation happens after sync completes

---

## Error Handling Flow

**Location:** [`src/lib/filesystem/sync-types.ts`](../src/lib/filesystem/sync-types.ts:43)

```mermaid
sequenceDiagram
    participant Component
    participant Operation as File Operation
    participant Error as SyncError
    participant EventBus as WorkspaceEventBus
    participant UI as Error UI

    Component->>Operation: Execute operation
    
    alt Operation succeeds
        Operation-->>Component: Result
    else Operation fails
        Operation->>Error: new SyncError(message, code, filePath, cause)
        Error->>EventBus: emit('sync:error', { error, file })
        EventBus-->>UI: Display error
        
        alt Critical error
            Error-->>Component: Throw error
            Component->>UI: Show error message
        else Non-critical error
            Error-->>Operation: Continue
            Operation-->>Component: Partial result
        end
    end
```

**Error Codes:**
- `PERMISSION_DENIED`: File system access denied
- `FILE_NOT_FOUND`: File does not exist
- `FILE_READ_FAILED`: Failed to read file
- `FILE_WRITE_FAILED`: Failed to write file
- `WEBCONTAINER_ERROR`: WebContainer operation failed
- `WEBCONTAINER_NOT_BOOTED`: WebContainer not booted
- `ENCODING_ERROR`: File encoding error
- `SYNC_FAILED`: General sync failure
- `UNKNOWN`: Unknown error

---

## Event Flow Diagram

**Location:** [`src/lib/events/workspace-events.ts`](../src/lib/events/workspace-events.ts:3)

```mermaid
graph TD
    A[File System Events] --> A1[file:created]
    A --> A2[file:modified]
    A --> A3[file:deleted]
    A --> A4[directory:created]
    A --> A5[directory:deleted]
    
    B[Sync Events] --> B1[sync:started]
    B --> B2[sync:progress]
    B --> B3[sync:completed]
    B --> B4[sync:error]
    B --> B5[sync:paused]
    B --> B6[sync:resumed]
    
    C[WebContainer Events] --> C1[container:booted]
    C --> C2[container:mounted]
    C --> C3[container:error]
    
    D[Terminal/Process Events] --> D1[process:started]
    D --> D2[process:output]
    D --> D3[process:exited]
    D --> D4[terminal:input]
    
    E[Permission Events] --> E1[permission:requested]
    E --> E2[permission:granted]
    E --> E3[permission:denied]
    E --> E4[permission:expired]
    
    F[Project Events] --> F1[project:opened]
    F --> F2[project:closed]
    F --> F3[project:switched]
    
    A1 --> G[WorkspaceEventBus]
    A2 --> G
    A3 --> G
    A4 --> G
    A5 --> G
    B1 --> G
    B2 --> G
    B3 --> G
    B4 --> G
    B5 --> G
    B6 --> G
    C1 --> G
    C2 --> G
    C3 --> G
    D1 --> G
    D2 --> G
    D3 --> G
    D4 --> G
    E1 --> G
    E2 --> G
    E3 --> G
    E4 --> G
    F1 --> G
    F2 --> G
    F3 --> G
    
    G --> H[Event Listeners]
```

---

## State Management Flow

**Location:** [`src/lib/workspace/WorkspaceContext.tsx`](../src/lib/workspace/WorkspaceContext.tsx)

```mermaid
graph LR
    A[User Action] --> B[WorkspaceActions]
    B --> C[Workspace Setters]
    C --> D[Workspace State]
    D --> E[React Re-render]
    
    B --> F[Sync Operations]
    F --> G[SyncManager]
    G --> H[LocalFSAdapter]
    G --> I[WebContainer]
    
    F --> J[Event Bus]
    J --> K[Event Listeners]
    
    B --> L[Project Store]
    L --> M[IndexedDB]
    
    D --> N[Derived State]
    N --> E
```

---

## References

- **Workspace Actions:** [`src/lib/workspace/hooks/useWorkspaceActions.ts`](../src/lib/workspace/hooks/useWorkspaceActions.ts)
- **Sync Operations:** [`src/lib/workspace/hooks/useSyncOperations.ts`](../src/lib/workspace/hooks/useSyncOperations.ts)
- **WebContainer Manager:** [`src/lib/webcontainer/manager.ts`](../src/lib/webcontainer/manager.ts)
- **Permission Lifecycle:** [`src/lib/filesystem/permission-lifecycle.ts`](../src/lib/filesystem/permission-lifecycle.ts)
- **Event System:** [`src/lib/events/workspace-events.ts`](../src/lib/events/workspace-events.ts)
- **Agent Tools:** [`src/lib/agent/facades/file-tools.ts`](../src/lib/agent/facades/file-tools.ts)
- **Sync Manager:** [`src/lib/filesystem/sync-manager.ts`](../src/lib/filesystem/sync-manager.ts)