# Event Bus Architecture (Epic 10)

**Status:** Proposed in Course Correction v3  
**Research Sources:** EventEmitter3 (Context7), TypeScript typed events best practices (Web)

### Design Rationale

Current sync/status callbacks are embedded in SyncManager, making AI agent observation impossible. An event bus with typed events enables:
- AI agents to observe and react to file/sync/process events
- Decoupled components that don't need direct references
- Observable patterns for UI status indicators
- Future multi-root workspace support

### Event Map Interface (Typed Events)

```typescript
// src/lib/events/workspace-events.ts
import EventEmitter from 'eventemitter3';

/**
 * Central event map - single source of truth for all workspace events.
 * Uses TypeScript's mapped types for full type safety.
 */
interface WorkspaceEvents {
  // File System Events
  'file:created': { path: string; source: 'local' | 'editor' | 'agent' };
  'file:modified': { path: string; source: 'local' | 'editor' | 'agent'; content?: string };
  'file:deleted': { path: string; source: 'local' | 'editor' | 'agent' };
  'directory:created': { path: string };
  'directory:deleted': { path: string };
  
  // Sync Events
  'sync:started': { fileCount: number; direction: 'to-wc' | 'to-local' | 'bidirectional' };
  'sync:progress': { current: number; total: number; currentFile: string };
  'sync:completed': { success: boolean; timestamp: Date; filesProcessed: number };
  'sync:error': { error: Error; file?: string };
  'sync:paused': { reason: 'user' | 'error' | 'permission' };
  'sync:resumed': void;
  
  // WebContainer Events
  'container:booted': { bootTime: number };
  'container:mounted': { fileCount: number };
  'container:error': { error: Error };
  
  // Terminal/Process Events
  'process:started': { pid: string; command: string; args: string[] };
  'process:output': { pid: string; data: string; type: 'stdout' | 'stderr' };
  'process:exited': { pid: string; exitCode: number };
  'terminal:input': { data: string };
  
  // Permission Events
  'permission:requested': { handle: FileSystemDirectoryHandle };
  'permission:granted': { handle: FileSystemDirectoryHandle; projectId: string };
  'permission:denied': { handle: FileSystemDirectoryHandle; reason: string };
  'permission:expired': { projectId: string };
  
  // Project Events
  'project:opened': { projectId: string; name: string };
  'project:closed': { projectId: string };
  'project:switched': { fromId: string | null; toId: string };
}

// Typed EventEmitter using eventemitter3
export type WorkspaceEventEmitter = EventEmitter<WorkspaceEvents>;

export const createWorkspaceEventBus = (): WorkspaceEventEmitter => {
  return new EventEmitter<WorkspaceEvents>();
};
```

### Event Bus Usage Patterns

```typescript
// src/lib/events/use-workspace-events.ts
import { useEffect } from 'react';
import type { WorkspaceEvents, WorkspaceEventEmitter } from './workspace-events';

/**
 * React hook for subscribing to workspace events.
 * Automatically cleans up listeners on unmount.
 */
export function useWorkspaceEvent<K extends keyof WorkspaceEvents>(
  eventBus: WorkspaceEventEmitter,
  event: K,
  handler: (payload: WorkspaceEvents[K]) => void
) {
  useEffect(() => {
    eventBus.on(event, handler);
    return () => { eventBus.off(event, handler); };
  }, [eventBus, event, handler]);
}

// Example usage in SyncStatusIndicator
function SyncStatusIndicator() {
  const { eventBus } = useWorkspace();
  const [status, setStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  
  useWorkspaceEvent(eventBus, 'sync:started', () => setStatus('syncing'));
  useWorkspaceEvent(eventBus, 'sync:completed', () => setStatus('idle'));
  useWorkspaceEvent(eventBus, 'sync:error', () => setStatus('error'));
  
  return <StatusBadge status={status} />;
}
```

### Integration with SyncManager (Epic 10-2)

```typescript
// Modified sync-manager.ts to emit events
class SyncManager {
  constructor(
    private eventBus: WorkspaceEventEmitter,
    // ... other deps
  ) {}
  
  async syncToWebContainer(handle: FileSystemDirectoryHandle) {
    const files = await this.scanDirectory(handle);
    
    this.eventBus.emit('sync:started', {
      fileCount: files.length,
      direction: 'to-wc'
    });
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await this.syncFile(file);
      
      this.eventBus.emit('sync:progress', {
        current: i + 1,
        total: files.length,
        currentFile: file.path
      });
    }
    
    this.eventBus.emit('sync:completed', {
      success: true,
      timestamp: new Date(),
      filesProcessed: files.length
    });
  }
}
```

---
