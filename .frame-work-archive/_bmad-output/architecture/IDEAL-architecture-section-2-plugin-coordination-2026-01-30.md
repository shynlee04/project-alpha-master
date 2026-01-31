---
document_id: IDEAL-ARCH-002
title: "IDEAL Architecture - Section 2: Plugin Coordination Layer"
version: "1.0.0"
status: "HYPOTHESIS - PENDING VALIDATION"
created: "2026-01-30T11:06:00+07:00"
author: "architect-ext"
parent_session: "ses_3f3a97f58ffeAQG0ztux1SZMCR"
synthesis_sources:
  - "VSCode Extension API (2025) - activation events, contributions"
  - "Obsidian Plugin API (2025) - workspace, events, state"
  - "Figma Plugin Architecture (2025) - sandboxed, message-based"
  - "Project Alpha codebase analysis - 19 identified gaps"
  - "Section 1: State Management Layer"
validation_status: "NOT VALIDATED"
gaps_addressed:
  - "No shared ActiveDocument state"
  - "No 'who has this file open' tracking"
  - "No write-lock mechanism"
  - "No deferred capability queue"
  - "No process registry"
  - "No plugin capability/dependency declarations"
  - "No event contracts"
  - "No state schema for toggle persistence"
---

# IDEAL Architecture - Section 2: Plugin Coordination Layer

> **HYPOTHESIS DOCUMENT**: This represents the TARGET plugin coordination architecture for Project Alpha. All patterns are prescriptive. Validation required before implementation.

---

## 1. Plugin System Overview

### 1.1 Core Constraints

```yaml
max_plugins: 7  # 5 toggleable + 2 always-loaded
always_loaded:
  - project-management  # FileTree, project switcher
  - chat-cascade        # AI conversations
toggleable:
  - monaco-editor       # Code editing
  - notes               # Note-taking (TipTap)
  - terminal            # WebContainer terminal
  - preview             # Live preview iframe
  - knowledge           # RAG/Knowledge base
toggle_behavior:
  - State preserved on disable
  - Resources released on disable
  - State restored on enable
  - Deferred actions queued
```

### 1.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PLUGIN COORDINATION LAYER                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      PLUGIN REGISTRY (Singleton)                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ plugins: Map<PluginId, PluginInstance>                          │  │  │
│  │  │ capabilities: Map<CapabilityId, PluginId[]>                     │  │  │
│  │  │ dependencies: Map<PluginId, PluginId[]>                         │  │  │
│  │  │ enabledState: Map<PluginId, boolean>                            │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│                                      ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        EVENT BUS (Typed)                               │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ • file:opened, file:modified, file:saved                       │  │  │
│  │  │ • document:active, document:focus, document:blur               │  │  │
│  │  │ • terminal:output, terminal:ready, terminal:exit               │  │  │
│  │  │ • preview:navigate, preview:refresh                            │  │  │
│  │  │ • plugin:enabled, plugin:disabled, plugin:error                │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│                                      ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     SHARED STATE CONTRACTS                             │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │ Active      │  │ Process     │  │ Write Lock  │  │ Deferred    │  │  │
│  │  │ Document    │  │ Registry    │  │ Manager     │  │ Queue       │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Plugin Contract Interface

### 2.1 FeaturePlugin Interface (Core Contract)

```typescript
// ============================================================================
// @/domain/interfaces/plugin.interface.ts
// ============================================================================

/**
 * Capability identifiers that plugins can provide or require.
 * Used for dependency resolution and feature discovery.
 */
export type PluginCapability =
  | 'file:read'           // Can read file contents
  | 'file:write'          // Can write file contents
  | 'file:watch'          // Can watch file changes
  | 'file:tree'           // Provides file tree navigation
  | 'editor:text'         // Can edit text files
  | 'editor:code'         // Full code editing (syntax, LSP)
  | 'editor:rich'         // Rich text editing (WYSIWYG)
  | 'terminal:execute'    // Can execute commands
  | 'terminal:stream'     // Can stream terminal output
  | 'preview:url'         // Can render URL preview
  | 'preview:html'        // Can render HTML preview
  | 'ai:chat'             // AI conversation capability
  | 'ai:context'          // AI context injection
  | 'knowledge:query'     // RAG knowledge queries
  | 'knowledge:index';    // RAG indexing capability

/**
 * Plugin lifecycle states.
 */
export type PluginState = 'unloaded' | 'loading' | 'ready' | 'error' | 'disabled';

/**
 * Plugin metadata declared at registration.
 */
export interface PluginManifest {
  id: PluginId;
  name: string;
  version: string;
  description: string;
  
  /** Capabilities this plugin provides when enabled */
  provides: PluginCapability[];
  
  /** Capabilities this plugin requires from other plugins */
  requires: PluginCapability[];
  
  /** Plugin IDs that MUST be enabled before this plugin */
  hardDependencies: PluginId[];
  
  /** Plugin IDs that enhance this plugin if available */
  softDependencies: PluginId[];
  
  /** Whether this plugin can be disabled by user */
  allowDisable: boolean;
  
  /** Events this plugin emits */
  emits: PluginEventType[];
  
  /** Events this plugin subscribes to */
  subscribes: PluginEventType[];
}

/**
 * Core plugin interface that all plugins must implement.
 */
export interface FeaturePlugin {
  readonly manifest: PluginManifest;
  readonly state: PluginState;
  
  /**
   * Called when plugin is enabled. Must be idempotent.
   * @param context - Shared plugin context
   * @returns Promise resolving when plugin is ready
   */
  onEnable(context: PluginContext): Promise<void>;
  
  /**
   * Called when plugin is disabled. MUST preserve state for restoration.
   * @param context - Shared plugin context
   * @returns Serializable state snapshot for restoration
   */
  onDisable(context: PluginContext): Promise<PluginStateSnapshot>;
  
  /**
   * Called when plugin is re-enabled. Restores previous state.
   * @param snapshot - Previously saved state snapshot
   * @param context - Shared plugin context
   */
  onRestore(snapshot: PluginStateSnapshot, context: PluginContext): Promise<void>;
  
  /**
   * Called on application shutdown. Cleanup resources.
   */
  onDestroy(): Promise<void>;
  
  /**
   * Health check for plugin monitoring.
   */
  healthCheck(): Promise<PluginHealthStatus>;
}

/**
 * Plugin identifier type (branded string).
 */
export type PluginId = 
  | 'project-management'
  | 'chat-cascade'
  | 'monaco-editor'
  | 'notes'
  | 'terminal'
  | 'preview'
  | 'knowledge';

/**
 * Serializable state snapshot for plugin restoration.
 */
export interface PluginStateSnapshot {
  pluginId: PluginId;
  version: string;
  savedAt: string;  // ISO timestamp
  data: Record<string, unknown>;
}

/**
 * Health status returned by plugin health checks.
 */
export interface PluginHealthStatus {
  healthy: boolean;
  message?: string;
  metrics?: {
    memoryUsage?: number;
    lastError?: string;
    uptime?: number;
  };
}
```

### 2.2 Plugin Context (Shared Resources)

```typescript
// ============================================================================
// @/domain/interfaces/plugin-context.interface.ts
// ============================================================================

/**
 * Shared context provided to all plugins.
 * Gives access to coordination primitives.
 */
export interface PluginContext {
  /** Current project ID */
  readonly projectId: string;
  
  /** Event bus for cross-plugin communication */
  readonly eventBus: PluginEventBus;
  
  /** Active document tracker */
  readonly activeDocument: ActiveDocumentTracker;
  
  /** Write lock manager for file access */
  readonly writeLocks: WriteLockManager;
  
  /** Process registry for background tasks */
  readonly processRegistry: ProcessRegistry;
  
  /** Deferred capability queue */
  readonly deferredQueue: DeferredCapabilityQueue;
  
  /** Plugin registry for capability discovery */
  readonly pluginRegistry: PluginRegistryReader;
  
  /** Logger scoped to this plugin */
  readonly logger: PluginLogger;
}

/**
 * Read-only view of plugin registry.
 */
export interface PluginRegistryReader {
  /** Check if a capability is currently available */
  hasCapability(cap: PluginCapability): boolean;
  
  /** Get plugins providing a capability */
  getProviders(cap: PluginCapability): PluginId[];
  
  /** Check if a plugin is enabled */
  isEnabled(pluginId: PluginId): boolean;
  
  /** Get all enabled plugins */
  getEnabledPlugins(): PluginId[];
}
```

---

## 3. Shared State Contracts

### 3.1 ActiveDocument Tracker (Gap: "No shared ActiveDocument state")

```typescript
// ============================================================================
// @/domain/interfaces/active-document.interface.ts
// ============================================================================

/**
 * Represents a document that can be opened/edited.
 */
export interface DocumentDescriptor {
  /** Unique document identifier (typically file path) */
  id: string;
  
  /** Document type for routing to appropriate editor */
  type: 'code' | 'note' | 'markdown' | 'image' | 'binary' | 'preview';
  
  /** Human-readable title */
  title: string;
  
  /** Full file path relative to project root */
  path: string;
  
  /** MIME type if known */
  mimeType?: string;
  
  /** Whether document has unsaved changes */
  isDirty: boolean;
  
  /** Plugin that currently owns this document */
  ownerId: PluginId;
}

/**
 * Tracks open documents and which plugins have them open.
 * Answers: "Who has this file open?"
 */
export interface ActiveDocumentTracker {
  /** Currently focused document (user is actively editing) */
  readonly activeDocument: DocumentDescriptor | null;
  
  /** All open documents across all plugins */
  readonly openDocuments: ReadonlyMap<string, DocumentDescriptor>;
  
  /** Which plugins have a specific document open */
  getOpeners(documentId: string): PluginId[];
  
  /** Register that a plugin has opened a document */
  registerOpen(document: DocumentDescriptor, pluginId: PluginId): void;
  
  /** Register that a plugin has closed a document */
  registerClose(documentId: string, pluginId: PluginId): void;
  
  /** Set the currently focused document */
  setActive(documentId: string | null): void;
  
  /** Mark document as dirty (has unsaved changes) */
  setDirty(documentId: string, isDirty: boolean): void;
  
  /** Subscribe to active document changes */
  onActiveChange(callback: (doc: DocumentDescriptor | null) => void): () => void;
}
```

### 3.2 Write Lock Manager (Gap: "No write-lock mechanism")

```typescript
// ============================================================================
// @/domain/interfaces/write-lock.interface.ts
// ============================================================================

/**
 * Write lock for exclusive file access.
 */
export interface WriteLock {
  lockId: string;
  filePath: string;
  holderId: PluginId;
  acquiredAt: string;  // ISO timestamp
  expiresAt: string;   // ISO timestamp (auto-release)
}

/**
 * Result of attempting to acquire a write lock.
 */
export type WriteLockResult = 
  | { success: true; lock: WriteLock }
  | { success: false; holder: PluginId; retryAfter: number };

/**
 * Manages exclusive write access to files.
 * Prevents concurrent modifications.
 */
export interface WriteLockManager {
  /**
   * Attempt to acquire exclusive write lock.
   * @param filePath - Path to lock
   * @param pluginId - Requesting plugin
   * @param timeoutMs - Lock auto-release timeout (default 30s)
   */
  acquire(filePath: string, pluginId: PluginId, timeoutMs?: number): Promise<WriteLockResult>;
  
  /**
   * Release a held write lock.
   * @param lockId - Lock to release
   * @param pluginId - Plugin releasing (must match holder)
   */
  release(lockId: string, pluginId: PluginId): Promise<boolean>;
  
  /**
   * Check if a file is currently locked.
   */
  isLocked(filePath: string): boolean;
  
  /**
   * Get current lock holder for a file.
   */
  getHolder(filePath: string): PluginId | null;
  
  /**
   * Extend lock timeout (keep-alive).
   */
  extend(lockId: string, pluginId: PluginId, additionalMs: number): Promise<boolean>;
  
  /**
   * Subscribe to lock state changes.
   */
  onLockChange(callback: (lock: WriteLock, event: 'acquired' | 'released') => void): () => void;
}
```

### 3.3 Process Registry (Gap: "No process registry")

```typescript
// ============================================================================
// @/domain/interfaces/process-registry.interface.ts
// ============================================================================

/**
 * Registered background process.
 */
export interface RegisteredProcess {
  processId: string;
  ownerId: PluginId;
  type: 'terminal' | 'build' | 'watcher' | 'indexer' | 'sync';
  name: string;
  pid?: number;        // OS process ID if applicable
  startedAt: string;   // ISO timestamp
  status: 'running' | 'paused' | 'stopped' | 'error';
  metadata?: Record<string, unknown>;
}

/**
 * Tracks background processes across plugins.
 * Answers: "What processes are running?"
 */
export interface ProcessRegistry {
  /** Register a new process */
  register(process: Omit<RegisteredProcess, 'processId' | 'startedAt'>): string;
  
  /** Update process status */
  updateStatus(processId: string, status: RegisteredProcess['status']): void;
  
  /** Unregister a process (stopped/exited) */
  unregister(processId: string): void;
  
  /** Get all running processes */
  getRunning(): RegisteredProcess[];
  
  /** Get processes by owner plugin */
  getByOwner(pluginId: PluginId): RegisteredProcess[];
  
  /** Get processes by type */
  getByType(type: RegisteredProcess['type']): RegisteredProcess[];
  
  /** Subscribe to process lifecycle events */
  onProcessChange(callback: (proc: RegisteredProcess, event: 'registered' | 'updated' | 'unregistered') => void): () => void;
}
```

### 3.4 Deferred Capability Queue (Gap: "No deferred capability queue")

```typescript
// ============================================================================
// @/domain/interfaces/deferred-queue.interface.ts
// ============================================================================

/**
 * A deferred action queued when required capability is unavailable.
 */
export interface DeferredAction {
  actionId: string;
  requiredCapability: PluginCapability;
  requiredPluginId?: PluginId;  // Specific plugin, or null for any provider
  action: {
    type: string;
    payload: unknown;
  };
  queuedAt: string;   // ISO timestamp
  expiresAt?: string; // Optional expiry
  priority: 'high' | 'normal' | 'low';
}

/**
 * Queues actions for disabled plugins, executes when they become available.
 */
export interface DeferredCapabilityQueue {
  /**
   * Queue an action that requires a capability.
   * Executes immediately if capability available, otherwise queues.
   */
  enqueue(
    capability: PluginCapability,
    action: DeferredAction['action'],
    options?: { pluginId?: PluginId; priority?: DeferredAction['priority']; expiresMs?: number }
  ): string;
  
  /**
   * Cancel a queued action.
   */
  cancel(actionId: string): boolean;
  
  /**
   * Get queued actions for a capability.
   */
  getQueued(capability: PluginCapability): DeferredAction[];
  
  /**
   * Get all queued actions.
   */
  getAllQueued(): DeferredAction[];
  
  /**
   * Called internally when a plugin is enabled - processes queued actions.
   * @internal
   */
  _processQueue(enabledPlugin: PluginId, capabilities: PluginCapability[]): Promise<void>;
}
```

---

## 4. Event Bus Coordination

### 4.1 Typed Event Bus (Gap: "No event contracts")

```typescript
// ============================================================================
// @/domain/interfaces/plugin-events.interface.ts
// ============================================================================

/**
 * All plugin event types with their payloads.
 * Type-safe event system.
 */
export interface PluginEventMap {
  // File events
  'file:opened': { path: string; pluginId: PluginId };
  'file:closed': { path: string; pluginId: PluginId };
  'file:modified': { path: string; pluginId: PluginId; isDirty: boolean };
  'file:saved': { path: string; pluginId: PluginId };
  'file:created': { path: string };
  'file:deleted': { path: string };
  'file:renamed': { oldPath: string; newPath: string };
  
  // Document focus events
  'document:active': { documentId: string; pluginId: PluginId };
  'document:blur': { documentId: string; pluginId: PluginId };
  
  // Terminal events
  'terminal:ready': { processId: string; shellType: string };
  'terminal:output': { processId: string; data: string; stream: 'stdout' | 'stderr' };
  'terminal:exit': { processId: string; exitCode: number };
  'terminal:command': { processId: string; command: string };
  
  // Preview events
  'preview:navigate': { url: string; triggeredBy: PluginId };
  'preview:refresh': { url: string };
  'preview:ready': { url: string };
  'preview:error': { url: string; error: string };
  
  // Plugin lifecycle events
  'plugin:enabling': { pluginId: PluginId };
  'plugin:enabled': { pluginId: PluginId };
  'plugin:disabling': { pluginId: PluginId };
  'plugin:disabled': { pluginId: PluginId };
  'plugin:error': { pluginId: PluginId; error: string };
  
  // Editor synchronization events
  'editor:cursor': { documentId: string; pluginId: PluginId; line: number; column: number };
  'editor:selection': { documentId: string; pluginId: PluginId; ranges: Array<{ start: number; end: number }> };
  'editor:scroll': { documentId: string; pluginId: PluginId; topLine: number };
  
  // AI/Chat events
  'ai:context-request': { requestId: string; sources: string[] };
  'ai:context-response': { requestId: string; context: unknown };
}

export type PluginEventType = keyof PluginEventMap;

/**
 * Event metadata attached to every event.
 */
export interface EventMeta {
  eventId: string;
  timestamp: string;    // ISO timestamp
  source: PluginId;     // Emitting plugin
  sequence: number;     // Monotonic sequence for ordering
}

/**
 * Full event envelope.
 */
export type PluginEvent<T extends PluginEventType> = {
  type: T;
  payload: PluginEventMap[T];
  meta: EventMeta;
};

/**
 * Typed event bus for cross-plugin communication.
 */
export interface PluginEventBus {
  /**
   * Emit an event to all subscribers.
   */
  emit<T extends PluginEventType>(type: T, payload: PluginEventMap[T]): void;
  
  /**
   * Subscribe to an event type.
   * @returns Unsubscribe function
   */
  on<T extends PluginEventType>(type: T, handler: (event: PluginEvent<T>) => void): () => void;
  
  /**
   * Subscribe to an event type, fire only once.
   */
  once<T extends PluginEventType>(type: T, handler: (event: PluginEvent<T>) => void): () => void;
  
  /**
   * Subscribe to multiple event types.
   */
  onMany<T extends PluginEventType>(types: T[], handler: (event: PluginEvent<T>) => void): () => void;
  
  /**
   * Get recent events (for debugging/replay).
   */
  getHistory(limit?: number): Array<PluginEvent<PluginEventType>>;
}
```

---

## 5. Dependency Resolution

### 5.1 Dependency Resolver

```typescript
// ============================================================================
// @/infrastructure/plugins/dependency-resolver.ts
// ============================================================================

/**
 * Result of dependency check.
 */
export type DependencyCheckResult = 
  | { canEnable: true }
  | { canEnable: false; missingDependencies: PluginId[]; missingCapabilities: PluginCapability[] };

/**
 * Resolves plugin dependencies before enabling.
 */
export interface DependencyResolver {
  /**
   * Check if a plugin can be enabled (all dependencies satisfied).
   */
  checkCanEnable(pluginId: PluginId): DependencyCheckResult;
  
  /**
   * Get the required enable order for a plugin.
   * Returns plugins that must be enabled first, in order.
   */
  getEnableOrder(pluginId: PluginId): PluginId[];
  
  /**
   * Check if a plugin can be disabled (no dependents need it).
   */
  checkCanDisable(pluginId: PluginId): { canDisable: true } | { canDisable: false; dependents: PluginId[] };
  
  /**
   * Get plugins that depend on this one.
   */
  getDependents(pluginId: PluginId): PluginId[];
  
  /**
   * Detect circular dependencies in manifest.
   */
  detectCycles(): Array<PluginId[]>;
}
```

### 5.2 Enable/Disable Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PLUGIN ENABLE FLOW                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  User clicks "Enable Plugin X"                                              │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────────┐                                                    │
│  │ DependencyResolver  │                                                    │
│  │ .checkCanEnable()   │                                                    │
│  └─────────┬───────────┘                                                    │
│            │                                                                 │
│     ┌──────┴──────┐                                                         │
│     │             │                                                          │
│     ▼             ▼                                                          │
│  canEnable      canEnable = false                                           │
│  = true         ┌────────────────────────┐                                  │
│     │           │ Show "Enable required  │                                  │
│     │           │ plugins first" dialog  │                                  │
│     │           └────────────────────────┘                                  │
│     ▼                                                                        │
│  ┌─────────────────────┐                                                    │
│  │ Emit 'plugin:       │                                                    │
│  │ enabling' event     │                                                    │
│  └─────────┬───────────┘                                                    │
│            │                                                                 │
│            ▼                                                                  │
│  ┌─────────────────────┐     ┌─────────────────────┐                        │
│  │ Check for saved     │ YES │ Call plugin         │                        │
│  │ state snapshot?     │────▶│ .onRestore(snap)    │                        │
│  └─────────┬───────────┘     └─────────┬───────────┘                        │
│            │ NO                        │                                     │
│            ▼                           │                                     │
│  ┌─────────────────────┐               │                                    │
│  │ Call plugin         │               │                                    │
│  │ .onEnable(context)  │               │                                    │
│  └─────────┬───────────┘               │                                    │
│            │                           │                                     │
│            └───────────┬───────────────┘                                    │
│                        ▼                                                     │
│  ┌─────────────────────────────────────────────┐                            │
│  │ Register capabilities in PluginRegistry    │                            │
│  └─────────────────────┬───────────────────────┘                            │
│                        ▼                                                     │
│  ┌─────────────────────────────────────────────┐                            │
│  │ Process DeferredQueue for new capabilities  │                            │
│  └─────────────────────┬───────────────────────┘                            │
│                        ▼                                                     │
│  ┌─────────────────────────────────────────────┐                            │
│  │ Emit 'plugin:enabled' event                 │                            │
│  └─────────────────────────────────────────────┘                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. State Preservation (Gap: "No state schema for toggle persistence")

### 6.1 State Schema Per Plugin

```typescript
// ============================================================================
// @/domain/types/plugin-state-schemas.ts
// ============================================================================

/**
 * Monaco Editor state snapshot.
 */
export interface MonacoStateSnapshot {
  pluginId: 'monaco-editor';
  version: string;
  savedAt: string;
  data: {
    openTabs: Array<{
      filePath: string;
      viewState: {
        scrollTop: number;
        scrollLeft: number;
        cursorPosition: { line: number; column: number };
        selections: Array<{ startLine: number; startCol: number; endLine: number; endCol: number }>;
      };
    }>;
    activeTabIndex: number;
    editorSettings: {
      fontSize: number;
      wordWrap: 'on' | 'off';
      minimap: boolean;
    };
  };
}

/**
 * Notes plugin state snapshot.
 */
export interface NotesStateSnapshot {
  pluginId: 'notes';
  version: string;
  savedAt: string;
  data: {
    openNotes: Array<{
      noteId: string;
      scrollPosition: number;
      cursorPosition: number;
    }>;
    activeNoteId: string | null;
    sidebarExpanded: boolean;
    sortOrder: 'title' | 'modified' | 'created';
  };
}

/**
 * Terminal plugin state snapshot.
 */
export interface TerminalStateSnapshot {
  pluginId: 'terminal';
  version: string;
  savedAt: string;
  data: {
    sessions: Array<{
      sessionId: string;
      name: string;
      shellType: string;
      cwd: string;
      historyLength: number;
      // Note: Actual terminal buffer NOT saved (too large, security)
    }>;
    activeSessionId: string | null;
    splitLayout: 'none' | 'horizontal' | 'vertical';
  };
}

/**
 * Preview plugin state snapshot.
 */
export interface PreviewStateSnapshot {
  pluginId: 'preview';
  version: string;
  savedAt: string;
  data: {
    lastUrl: string | null;
    responsive: {
      width: number;
      height: number;
      device: string;
    };
    autoRefresh: boolean;
    zoom: number;
  };
}

/**
 * Knowledge plugin state snapshot.
 */
export interface KnowledgeStateSnapshot {
  pluginId: 'knowledge';
  version: string;
  savedAt: string;
  data: {
    lastQuery: string;
    filters: {
      sources: string[];
      dateRange: { from: string; to: string } | null;
    };
    bookmarks: string[];
  };
}

/**
 * Union type of all plugin snapshots.
 */
export type AnyPluginSnapshot = 
  | MonacoStateSnapshot
  | NotesStateSnapshot
  | TerminalStateSnapshot
  | PreviewStateSnapshot
  | KnowledgeStateSnapshot;
```

### 6.2 State Persistence Service

```typescript
// ============================================================================
// @/infrastructure/plugins/plugin-state-persistence.ts
// ============================================================================

/**
 * Persists and restores plugin state snapshots.
 * Uses Dexie (IndexedDB) for storage.
 */
export interface PluginStatePersistence {
  /**
   * Save a plugin's state snapshot.
   */
  saveSnapshot(snapshot: AnyPluginSnapshot): Promise<void>;
  
  /**
   * Load a plugin's most recent state snapshot.
   */
  loadSnapshot<T extends PluginId>(pluginId: T): Promise<AnyPluginSnapshot | null>;
  
  /**
   * Clear saved state for a plugin.
   */
  clearSnapshot(pluginId: PluginId): Promise<void>;
  
  /**
   * Get all saved snapshots (for debugging).
   */
  getAllSnapshots(): Promise<AnyPluginSnapshot[]>;
}
```

---

## 7. Plugin-Specific Coordination Contracts

### 7.1 Terminal ↔ WebContainer Bridge

```typescript
// ============================================================================
// @/domain/interfaces/terminal-coordination.interface.ts
// ============================================================================

/**
 * Terminal-specific coordination for WebContainer integration.
 */
export interface TerminalCoordination {
  /** Get WebContainer process for terminal */
  getWebContainerProcess(sessionId: string): WebContainerProcess | null;
  
  /** Stream terminal output to Chat plugin for AI context */
  streamOutputToChat(sessionId: string, enable: boolean): void;
  
  /** Get last N lines of terminal output (for AI context) */
  getRecentOutput(sessionId: string, lines: number): string[];
  
  /** Inject command from AI suggestion */
  injectCommand(sessionId: string, command: string, execute: boolean): void;
}
```

### 7.2 Preview ↔ Dev Server Bridge

```typescript
// ============================================================================
// @/domain/interfaces/preview-coordination.interface.ts
// ============================================================================

/**
 * Preview-specific coordination for dev server URLs.
 */
export interface PreviewCoordination {
  /** Get current dev server URL from WebContainer */
  getDevServerUrl(): string | null;
  
  /** Register URL change listener */
  onUrlChange(callback: (url: string) => void): () => void;
  
  /** Navigate preview to URL */
  navigateTo(url: string): void;
  
  /** Trigger hot reload on file save */
  triggerHotReload(changedFile: string): void;
  
  /** Get preview console logs (for AI debugging) */
  getConsoleLogs(limit: number): Array<{ level: string; message: string; timestamp: string }>;
}
```

### 7.3 Monaco ↔ Notes Mirroring

```typescript
// ============================================================================
// @/domain/interfaces/editor-mirroring.interface.ts
// ============================================================================

/**
 * Coordinates file edits between Monaco and Notes.
 * Same markdown file can be open in both (code view + rich view).
 */
export interface EditorMirroringCoordination {
  /**
   * Notify that a file is open in an editor.
   * Other editors can subscribe to sync changes.
   */
  registerOpenFile(filePath: string, editorId: PluginId): void;
  
  /**
   * Unregister file from editor.
   */
  unregisterFile(filePath: string, editorId: PluginId): void;
  
  /**
   * Push content change from one editor.
   * Other editors receive via subscription.
   */
  pushChange(filePath: string, fromEditor: PluginId, change: ContentChange): void;
  
  /**
   * Subscribe to changes from other editors.
   */
  onExternalChange(filePath: string, callback: (change: ContentChange, from: PluginId) => void): () => void;
  
  /**
   * Check if file is open in multiple editors.
   */
  isSharedEdit(filePath: string): boolean;
  
  /**
   * Get all editors that have a file open.
   */
  getEditors(filePath: string): PluginId[];
}

/**
 * Content change for synchronization.
 */
export interface ContentChange {
  type: 'full' | 'incremental';
  content?: string;       // For 'full' type
  operations?: Array<{    // For 'incremental' type
    type: 'insert' | 'delete' | 'replace';
    range: { start: number; end: number };
    text?: string;
  }>;
  version: number;        // For conflict detection
  timestamp: string;
}
```

---

## 8. Implementation Priority

### 8.1 Phase 1: Core Infrastructure (Sprint 1-2)

| Component | Priority | Complexity | Dependencies |
|-----------|----------|------------|--------------|
| PluginEventBus | P0 | Medium | None |
| ActiveDocumentTracker | P0 | Low | EventBus |
| PluginRegistry | P0 | Medium | EventBus |
| FeaturePlugin interface | P0 | Low | None |

### 8.2 Phase 2: Coordination Primitives (Sprint 3-4)

| Component | Priority | Complexity | Dependencies |
|-----------|----------|------------|--------------|
| WriteLockManager | P1 | Medium | EventBus |
| ProcessRegistry | P1 | Low | EventBus |
| DeferredCapabilityQueue | P1 | High | Registry |
| DependencyResolver | P1 | High | Registry |

### 8.3 Phase 3: Plugin-Specific (Sprint 5-6)

| Component | Priority | Complexity | Dependencies |
|-----------|----------|------------|--------------|
| TerminalCoordination | P2 | High | ProcessRegistry, EventBus |
| PreviewCoordination | P2 | Medium | EventBus |
| EditorMirroringCoordination | P2 | High | ActiveDocument, WriteLock |
| PluginStatePersistence | P2 | Medium | Dexie |

---

## 9. Validation Checklist

Before this section is VALIDATED, the following must be true:

- [ ] All 8 identified gaps have corresponding interfaces
- [ ] Event types cover all cross-plugin communication needs
- [ ] Dependency resolution prevents invalid plugin states
- [ ] State snapshots are serializable to IndexedDB
- [ ] Write locks prevent concurrent file corruption
- [ ] Deferred queue handles disabled plugin scenarios
- [ ] Terminal/Preview/Notes coordination is complete
- [ ] No circular dependencies in interface definitions

---

**END OF SECTION 2: PLUGIN COORDINATION LAYER**

*Next: Section 3 - WebContainer Integration & Dev Server*
