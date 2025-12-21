# Epic 3 Validated Implementation Patterns

**Added:** 2025-12-11  
**Status:** Validated via 52 passing tests

### File System Access Layer (Validated)

#### LocalFSAdapter Patterns

```typescript
// Path validation - MANDATORY for all operations
private validatePath(path: string, operation: string): void {
  // 1. Check for empty/null path
  // 2. Block absolute paths (starts with '/' or 'C:\')
  // 3. Block path traversal ('..') 
  // 4. Normalize separators
}

// Multi-segment path support
async getFileHandle(path: string, create = false): Promise<FileSystemFileHandle> {
  const segments = path.split('/').filter(s => s.length > 0);
  // Walk directories for nested paths like 'src/components/Button.tsx'
  const parentDir = await this.walkDirectorySegments(segments.slice(0, -1), create);
  return parentDir.getFileHandle(segments.at(-1), { create });
}

// Binary file support with method overloads
async readFile(path: string): Promise<FileReadResult>;
async readFile(path: string, options: { encoding: 'binary' }): Promise<FileReadBinaryResult>;
```

#### SyncManager Patterns

```typescript
// Dual write pattern - Local FS is source of truth
async writeFile(path: string, content: string): Promise<void> {
  // 1. Write to local FS first (source of truth)
  await this.localAdapter.writeFile(path, content);
  
  // 2. Write to WebContainers if booted
  if (isBooted()) {
    const fs = getFileSystem();
    await fs.mkdir(parentPath, { recursive: true }); // Ensure parents
    await fs.writeFile(path, content);
  }
}

// Exclusion patterns with glob support
private isExcluded(path: string, name: string): boolean {
  return this.config.excludePatterns.some((pattern) => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(name) || regex.test(path);
    }
    return name === pattern || path.startsWith(`${pattern}/`);
  });
}
```

#### Permission Lifecycle Patterns

```typescript
// IndexedDB handle persistence
const DB_NAME = 'via-gent-fsa-spike';
const STORE_NAME = 'handles';

// Permission state types
type FsaPermissionState = 'unknown' | 'granted' | 'prompt' | 'denied';

// Check and restore on reload
async function restorePermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  const status = await handle.queryPermission({ mode: 'readwrite' });
  if (status === 'granted') return true;
  if (status === 'prompt') {
    // Show UI: "Click to restore access"
    return false;
  }
  return false; // denied
}
```

### UI State Integration Points

| Component | State Source | Update Trigger |
|-----------|--------------|----------------|
| FileTree | `directoryHandle` prop | `loadRootDirectory()` on handle change |
| IDELayout | `permissionState` | `getPermissionState()` on mount/restore |
| SyncManager | `_status: SyncStatus` | `syncToWebContainer()` completion |

---
