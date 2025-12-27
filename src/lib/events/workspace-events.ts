import EventEmitter from 'eventemitter3'

export interface WorkspaceEvents {
  // File System Events
  // Lock timestamps (lockAcquired, lockReleased) added in Story 12-1B for agent concurrency tracking
  'file:created': [{ path: string; source: 'local' | 'editor' | 'agent'; lockAcquired?: number; lockReleased?: number }]
  'file:modified': [
    { path: string; source: 'local' | 'editor' | 'agent'; content?: string; lockAcquired?: number; lockReleased?: number },
  ]
  'file:deleted': [{ path: string; source: 'local' | 'editor' | 'agent'; lockAcquired?: number; lockReleased?: number }]
  'file:read': [{ path: string; source: 'agent' }] // Agent reading file
  'directory:created': [{ path: string }]
  'directory:deleted': [{ path: string }]

  // Sync Events
  'sync:started': [
    { fileCount: number; direction: 'to-wc' | 'to-local' | 'bidirectional' },
  ]
  'sync:progress': [{ current: number; total: number; currentFile: string }]
  'sync:completed': [{ success: boolean; timestamp: Date; filesProcessed: number }]
  'sync:error': [{ error: Error; file?: string }]
  'sync:paused': [{ reason: 'user' | 'error' | 'permission' }]
  'sync:resumed': []

  // WebContainer Events
  'container:booted': [{ bootTime: number }]
  'container:mounted': [{ fileCount: number }]
  'container:error': [{ error: Error }]

  // Terminal/Process Events
  'process:started': [{ pid: string; command: string; args: string[] }]
  'process:output': [{ pid: string; data: string; type: 'stdout' | 'stderr' }]
  'process:exited': [{ pid: string; exitCode: number }]
  'terminal:input': [{ data: string }]
  'agent:command:executed': [{ command: string; workingDir?: string; output?: string; exitCode?: number }] // Agent executed command

  // Permission Events
  'permission:requested': [{ handle: FileSystemDirectoryHandle }]
  'permission:granted': [{ handle: FileSystemDirectoryHandle; projectId: string }]
  'permission:denied': [{ handle: FileSystemDirectoryHandle; reason: string }]
  'permission:expired': [{ projectId: string }]

  // Project Events
  'project:opened': [{ projectId: string; name: string }]
  'project:closed': [{ projectId: string }]
  'project:switched': [{ fromId: string | null; toId: string }]

  // Agent Activity Events
  'agent:tool:started': [{ toolName: string; toolCallId: string; args: Record<string, unknown> }]
  'agent:tool:completed': [{ toolName: string; toolCallId: string; success: boolean; result?: unknown }]
  'agent:tool:failed': [{ toolName: string; toolCallId: string; error: string }]
  'agent:activity:changed': [{ status: 'idle' | 'thinking' | 'executing' | 'error' }]
}

export type WorkspaceEventEmitter = EventEmitter<WorkspaceEvents>

export function createWorkspaceEventBus(): WorkspaceEventEmitter {
  return new EventEmitter<WorkspaceEvents>()
}
