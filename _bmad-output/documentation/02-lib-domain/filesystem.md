# File System Documentation

## Overview

The File System module (`src/lib/filesystem/`) provides the File System Access API wrapper and bidirectional synchronization between the local file system and WebContainers' in-memory file system. This is the foundation for all file operations in the IDE.

## Architecture

```
src/lib/filesystem/
├── index.ts                    # Barrel export
├── local-fs-adapter.ts         # File System Access API wrapper
├── file-ops.ts                 # File operations
├── dir-ops.ts                  # Directory operations
├── path-guard.ts               # Path traversal protection
├── path-utils.ts               # Path utilities
├── fs-errors.ts                # Error classes
├── fs-types.ts                 # Type definitions
├── fs-handle-utils.ts          # Handle utilities
├── fsa-handle-manager.ts       # FSA handle management
├── permission-lifecycle.ts     # Permission lifecycle
├── hash-utils.ts               # SHA-256 hashing
├── exclusion-config.ts         # Sync exclusion patterns
├── directory-walker.ts         # Recursive directory walking
├── validation.ts               # Validation utilities
├── constants.ts
├── file-snapshot-store.ts      # File snapshot caching
│
├── sync-manager/               # Sync orchestration
│   ├── index.ts
│   ├── sync-manager.ts         # Main sync manager
│   ├── sync-manager-factory.ts
│   ├── sync-manager-types.ts
│   ├── sync-batch-sync.ts      # Batch operations
│   └── sync-file-ops.ts        # File sync operations
│
├── sync-transaction/           # Transaction support
│   ├── index.ts
│   ├── sync-transaction-types.ts
│   ├── sync-batch-writer.ts
│   ├── sync-batch-deleter.ts
│   ├── sync-batch-error.ts
│   ├── sync-transaction-log.ts
│   └── sync-rollback-executor.ts
│
├── sync-operations.ts          # Sync operation definitions
├── sync-planner.ts             # Sync planning
├── sync-executor.ts            # Sync execution
├── sync-utils.ts               # Sync utilities
├── sync-types.ts               # Sync type definitions
└── __tests__/                  # Test files
```

## Core Components

### 1. LocalFSAdapter (`local-fs-adapter.ts`)

The main wrapper for the File System Access API:

```typescript
import { LocalFSAdapter, localFS } from '@/lib/filesystem';

const adapter = new LocalFSAdapter();

// Request directory access
const handle = await adapter.requestDirectoryAccess();

// Read file (text or binary)
const text = await adapter.readFile('src/App.tsx');
const binary = await adapter.readFile('image.png', { encoding: 'binary' });

// Write file
await adapter.writeFile('src/App.tsx', content);

// List directory
const entries = await adapter.listDirectory('src');

// Create/delete operations
await adapter.createDirectory('new-folder');
await adapter.deleteFile('old-file.txt');
```

**Key Methods:**
| Method | Description |
|--------|-------------|
| `requestDirectoryAccess()` | Opens file picker dialog |
| `readFile(path, options?)` | Read text or binary file |
| `writeFile(path, content)` | Write file |
| `createFile(path, content?)` | Create new file |
| `deleteFile(path)` | Delete file |
| `listDirectory(path?)` | List directory contents |
| `createDirectory(path)` | Create directory |
| `deleteDirectory(path)` | Delete directory |
| `rename(oldPath, newPath)` | Rename file/directory |

### 2. Path Guard (`path-guard.ts`)

Security utility preventing path traversal attacks:

```typescript
import { validatePath, isTraversalAttempt } from '@/lib/filesystem/path-guard';

// Check if path is valid (no traversal)
const result = validatePath('../../../etc/passwd');
// Returns: { valid: false, reason: 'path_traversal' }

// Check for traversal attempt
if (isTraversalAttempt(path)) {
    throw new Error('Invalid path');
}
```

**Validation Rules:**
- No `..` path components
- No absolute paths (must be relative to project root)
- No null bytes
- Must match project root prefix

### 3. Permission Lifecycle (`permission-lifecycle.ts`)

Manages File System Access API permissions:

```typescript
import { PermissionLifecycle, PermissionStatus } from '@/lib/filesystem/permission-lifecycle';

const lifecycle = new PermissionLifecycle();

// Check permission status
const status = await lifecycle.getStatus();
// { granted: true, persistable: true, expiresAt: Date }

// Request permission
await lifecycle.requestPermission();

// Revoke permission
await lifecycle.revokePermission();
```

### 4. Sync Manager (`sync-manager/`)

Orchestrates synchronization between local FS and WebContainer:

```typescript
import { createSyncManager, SyncManager } from '@/lib/filesystem/sync-manager';

const syncManager = createSyncManager(localAdapter, {
    onProgress: (progress) => console.log(progress),
    excludedPatterns: ['.git', 'node_modules'],
});

// Initial sync to WebContainer
await syncManager.syncToWebContainer();

// Incremental sync (detects changed files)
await syncManager.incrementalSync();

// Write file to both systems
await syncManager.writeFile('src/App.tsx', content);

// Delete file from both systems
await syncManager.deleteFile('src/old.ts');
```

**Sync Strategies:**
- **Initial Sync**: Full mount of local FS to WebContainer
- **Incremental Sync**: Only changed files (using file metadata cache)
- **Dual Write**: Write to both local FS and WebContainer simultaneously
- **Conflict Resolution**: Local FS is always the source of truth

### 5. File Snapshot Store (`file-snapshot-store.ts`)

Caches file metadata for incremental sync:

```typescript
import { fileSnapshotStore } from '@/lib/filesystem/file-snapshot-store';

// Save file snapshot
await fileSnapshotStore.saveSnapshot({
    path: 'src/App.tsx',
    content: '...',
    lastModified: new Date(),
    size: 1024,
    hash: 'sha256:...'
});

// Get cached file
const cached = await fileSnapshotStore.getSnapshot('src/App.tsx');

// Check if file changed
const needsSync = await fileSnapshotStore.needsSync('src/App.tsx');
```

### 6. Directory Walker (`directory-walker.ts`)

Recursively walks directories with exclusion support:

```typescript
import { walkDirectory, walkDirectorySegments } from '@/lib/filesystem/directory-walker';

// Walk directory
for await (const entry of walkDirectory(handle, {
    excludedPatterns: ['.git', 'node_modules'],
    maxDepth: 10
})) {
    console.log(entry.path, entry.type);
}

// Get segments for parallel processing
const segments = await walkDirectorySegments(handle, {
    segmentSize: 100,  // Files per segment
    excludedPatterns: EXCLUSION_PATTERNS
});
```

### 7. Exclusion Config (`exclusion-config.ts`)

Manages sync exclusion patterns:

```typescript
import { 
    DEFAULT_EXCLUSION_PATTERNS, 
    isPathExcluded,
    mergeExclusionPatterns 
} from '@/lib/filesystem/exclusion-config';

const patterns = mergeExclusionPatterns(
    DEFAULT_EXCLUSION_PATTERNS,
    ['.vscode', '.idea']
);

if (isPathExcluded('.git/config', patterns)) {
    // Skip this file
}
```

**Default Exclusions:**
- `.git/` - Git repository (regenerated)
- `node_modules/` - Dependencies (regenerated via npm install)
- `.DS_Store` - macOS metadata
- `Thumbs.db` - Windows thumbnails
- `*.log` - Log files

### 8. Hash Utilities (`hash-utils.ts`)

SHA-256 hashing for change detection:

```typescript
import { computeSHA256, computeSHA256FromBuffer } from '@/lib/filesystem/hash-utils';

// Hash string content
const hash = await computeSHA256('file content');

// Hash from buffer
const bufferHash = await computeSHA256FromBuffer(buffer);

// Use for cache validation
const cachedHash = await snapshotStore.getHash(path);
if (cachedHash !== currentHash) {
    await snapshotStore.updateSnapshot(path, currentHash);
}
```

### 9. Sync Transaction (`sync-transaction/`)

Transaction support for atomic sync operations:

```typescript
import { SyncTransaction } from '@/lib/filesystem/sync-transaction';

const transaction = await SyncTransaction.begin();

// Execute multiple operations atomically
await transaction.writeFile('src/a.ts', contentA);
await transaction.writeFile('src/b.ts', contentB);
await transaction.deleteFile('src/old.ts');

// Commit all at once
await transaction.commit();

// Or rollback on error
try {
    await transaction.commit();
} catch (error) {
    await transaction.rollback();
}
```

## Key Exports

### Main Module (`src/lib/filesystem/index.ts`)

```typescript
// Adapter and utilities
export { LocalFSAdapter, localFS } from './local-fs-adapter';
export { validatePath, isTraversalAttempt } from './path-guard';
export { parsePathSegments } from './path-utils';

// Error classes
export { FileSystemError, PermissionDeniedError } from './fs-errors';

// Types
export type { DirectoryEntry, FileReadResult, FileReadBinaryResult } from './fs-types';

// Sync
export { SyncManager, createSyncManager } from './sync-manager';
export type { SyncConfig, SyncProgress, SyncResult, SyncStatus } from './sync-manager';
export { SyncError, DEFAULT_SYNC_CONFIG } from './sync-types';

// File operations
export { walkDirectory, walkDirectorySegments } from './directory-walker';
export { isExcluded, isBinaryFile } from './sync-utils';

// Snapshots
export { fileSnapshotStore, FileSnapshotStore } from './file-snapshot-store';
export { computeSHA256, computeSHA256FromBuffer } from './hash-utils';

// Permissions
export { PermissionLifecycle, PermissionStatus } from './permission-lifecycle';

// Exclusions
export { 
    DEFAULT_EXCLUSION_PATTERNS, 
    isPathExcluded, 
    mergeExclusionPatterns 
} from './exclusion-config';
```

## Integration Points

### With Agent System

```typescript
import { createFileToolsFacade } from '@/lib/agent/facades/file-tools';
import { localFS } from '@/lib/filesystem';

const fileTools = createFileToolsFacade(localFS);
```

### With WebContainer

```typescript
import { mount, getInstance } from '@/lib/webcontainer';
import { createSyncManager } from '@/lib/filesystem/sync-manager';

const syncManager = createSyncManager(localFS, webContainerInstance);
await syncManager.syncToWebContainer();
```

### With Workspace

```typescript
import { useFileSyncStatusStore } from '@/lib/workspace/file-sync-status-store';

const syncStatus = useFileSyncStatusStore();
```

## Sync Flow

```
1. User Opens Folder
   ↓
2. LocalFSAdapter.requestDirectoryAccess()
   ↓
3. SyncManager.createSyncManager()
   ↓
4. Initial sync: walkDirectory() → mount() to WebContainer
   ↓
5. File snapshot store saves metadata
   ↓
6. User Edits File
   ↓
7. Dual write: writeFile() → both local FS + WebContainer
   ↓
8. Snapshot store updates metadata
   ↓
9. Event: sync:status emitted
```

## Security Considerations

1. **Path Traversal**: All paths validated with `validatePath()`
2. **Permission Lifecycle**: Permission state tracked and revocable
3. **Exclusion Patterns**: `.git`, `node_modules` excluded from sync
4. **Hash Verification**: SHA-256 for change detection

## Known Issues

1. **No Reverse Sync**: Changes in WebContainer (e.g., npm install) don't sync back to local
2. **Permission Persistence**: FSA permissions are session-scoped by default

## Developer Notes

- Always use `validatePath()` before file operations
- Use the sync manager for file operations (not direct adapter calls)
- Snapshots enable efficient incremental sync
- Transactions ensure atomic operations for batch changes
