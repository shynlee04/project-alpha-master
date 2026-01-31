# Plugin Coordination Contracts

**Researched:** 2026-01-31
**Updated:** 2026-01-31 (corrected plugin categories)
**Confidence:** HIGH

---

## Core Principle

```
Project OWNS all data (files, threads, notes).
Plugins REQUEST write operations via Services.
Services enforce single-writer principle.
Core plugins (FileTree, Chat) are ALWAYS loaded and have WRITE access.
One plugin's action triggers reactions in others via EVENTS.
```

### Critical: Plugin Categories

| Category | Examples | Permission | Always Loaded | canWriteEntities |
|----------|----------|------------|---------------|------------------|
| **CORE OPERATORS** | FileTree, Chat | `core` | ✅ Yes | Files, Threads |
| **ACTIVE EDITORS** | Notes, Monaco, Terminal | `write` | ❌ Optional | Files, Notes |
| **PASSIVE VIEWERS** | Preview | `read-only` | ❌ Optional | None |

**Why FileTree and Chat are always loaded:**
- FileTree provides file CRUD that users expect at all times
- Chat provides thread management + AI tooling that can create/modify files
- Both are essential for core app function regardless of "workspace mode"

---

## The Plugin Registry

### Plugin Definitions

```typescript
type PluginPermission = 'core' | 'write' | 'read-only';
type EntityType = 'file' | 'thread' | 'note';

interface PluginDefinition {
  type: PluginType;
  displayName: string;
  icon: string;
  permission: PluginPermission;
  alwaysLoaded: boolean;
  canWriteEntities: EntityType[];
  platforms: Platform[];
  capabilities: PluginCapability[];
  dependencies: PluginType[];
}

const PLUGIN_REGISTRY: Record<PluginType, PluginDefinition> = {
  // ═══════════════════════════════════════════════════════════
  // CORE OPERATORS - Always loaded, essential for app function
  // ═══════════════════════════════════════════════════════════
  'file-tree': {
    type: 'file-tree',
    displayName: 'Files',
    icon: 'folder',
    permission: 'core',
    alwaysLoaded: true,  // Cannot disable - essential for CRUD
    canWriteEntities: ['file'],
    platforms: ['desktop', 'tablet', 'mobile'],
    capabilities: ['browse', 'create', 'rename', 'delete'],
    dependencies: [],
  },
  'chat': {
    type: 'chat',
    displayName: 'AI Chat',
    icon: 'message-square',
    permission: 'core',
    alwaysLoaded: true,  // Cannot disable - AI tools need always available
    canWriteEntities: ['thread', 'file'],  // Threads + AI tool file writes
    platforms: ['desktop', 'tablet', 'mobile'],
    capabilities: ['ai-conversation', 'tool-calling', 'rag', 'file-operations'],
    dependencies: [],
  },
  
  // ═══════════════════════════════════════════════════════════
  // ACTIVE EDITORS - Can modify entities via Services
  // ═══════════════════════════════════════════════════════════
  'monaco': {
    type: 'monaco',
    displayName: 'Editor',
    icon: 'code',
    permission: 'write',
    alwaysLoaded: false,
    canWriteEntities: ['file'],
    platforms: ['desktop'],  // PC only - too heavy for mobile
    capabilities: ['edit-code', 'syntax-highlight', 'intellisense'],
    dependencies: ['file-tree'],
  },
  'notes': {
    type: 'notes',
    displayName: 'Notes',
    icon: 'file-text',
    permission: 'write',
    alwaysLoaded: false,
    canWriteEntities: ['note', 'file'],  // Notes + optional .md sync
    platforms: ['desktop', 'tablet', 'mobile'],
    capabilities: ['edit-richtext', 'ai-assist', 'embed-media', 'file-sync'],
    dependencies: ['file-tree'],
  },
  'terminal': {
    type: 'terminal',
    displayName: 'Terminal',
    icon: 'terminal',
    permission: 'write',
    alwaysLoaded: false,
    canWriteEntities: ['file'],  // Commands can create/modify files
    platforms: ['desktop'],  // Requires WebContainer or native
    capabilities: ['execute-commands', 'npm-scripts'],
    dependencies: [],
  },
  
  // ═══════════════════════════════════════════════════════════
  // PASSIVE VIEWERS - Read-only, true "lenses"
  // ═══════════════════════════════════════════════════════════
  'preview': {
    type: 'preview',
    displayName: 'Preview',
    icon: 'globe',
    permission: 'read-only',
    alwaysLoaded: false,
    canWriteEntities: [],  // True lens - only reads
    platforms: ['desktop'],  // iframe preview for dev server
    capabilities: ['render-html', 'dev-server'],
    dependencies: ['terminal'],  // Needs terminal to start dev server
  },
};
```

### Permission Enforcement

```typescript
// Services check plugin permission before allowing writes
class FileService {
  async writeFile(
    projectId: string, 
    path: string, 
    content: string,
    requestingPlugin: PluginType
  ): Promise<void> {
    const pluginDef = PLUGIN_REGISTRY[requestingPlugin];
    
    // Check permission level
    if (pluginDef.permission === 'read-only') {
      throw new Error(`Plugin ${requestingPlugin} has read-only permission`);
    }
    
    // Check entity permission
    if (!pluginDef.canWriteEntities.includes('file')) {
      throw new Error(`Plugin ${requestingPlugin} cannot write files`);
    }
    
    // Proceed with write
    await this.internalWriteFile(projectId, path, content);
  }
}
```

---

## Shared State: The Coordination Layer

### ActiveDocument (Shared Across Plugins)

```typescript
interface ActiveDocument {
  projectId: string;
  filePath: string | null;       // Currently active file
  content: string | null;        // Current content (for editors)
  isDirty: boolean;              // Unsaved changes exist
  lastModifiedBy: PluginType;    // Who made the last change
  cursorPosition?: CursorPosition;
  selections?: Selection[];
}

// Zustand store - NO PERSIST (this is session state)
interface PluginCoordinationState {
  activeDocument: ActiveDocument | null;
  openDocuments: Map<string, DocumentState>;  // Tab management
  
  // Actions
  setActiveDocument: (doc: ActiveDocument) => void;
  updateContent: (content: string, source: PluginType) => void;
  closeDocument: (filePath: string) => void;
}
```

### Why Zustand (Not Dexie) for Coordination

| Aspect | Zustand | Dexie |
|--------|---------|-------|
| Persistence | Session only | Long-term |
| Reactivity | Built-in subscriptions | Requires useLiveQuery |
| Speed | In-memory, instant | IndexedDB, async |
| Use case | UI coordination | Data storage |

**Decision:** Plugin coordination uses Zustand (session state). Data persistence uses Dexie.

---

## Event Contracts

### File Selection Flow

```typescript
// 1. User clicks file in FileTree
fileTreePlugin.onFileClick(filePath) {
  // Emit event (don't directly call other plugins)
  eventBus.emit('file:selected', { projectId, filePath });
}

// 2. Monaco subscribes and reacts
monacoPlugin.init() {
  eventBus.on('file:selected', async ({ projectId, filePath }) => {
    if (this.canHandle(filePath)) {  // e.g., not binary
      const content = await fileService.readFile(projectId, filePath);
      this.openFile(filePath, content);
      coordinationStore.setActiveDocument({ projectId, filePath, content });
    }
  });
}

// 3. Notes subscribes and reacts
notesPlugin.init() {
  eventBus.on('file:selected', async ({ projectId, filePath }) => {
    if (filePath.endsWith('.md') || filePath.endsWith('.mdx')) {
      const content = await fileService.readFile(projectId, filePath);
      this.openNote(filePath, content);
    }
  });
}
```

### Live Sync Protocol (Monaco ↔ Notes)

```typescript
// Monaco types a character
monacoEditor.onDidChangeModelContent((e) => {
  const content = editor.getValue();
  
  // Update shared state with source attribution
  coordinationStore.updateContent(content, 'monaco');
});

// Notes receives update
notesPlugin.init() {
  coordinationStore.subscribe(
    state => state.activeDocument?.content,
    (content, prevContent) => {
      const source = coordinationStore.getState().activeDocument?.lastModifiedBy;
      
      // Only update if change came from different plugin
      if (source !== 'notes' && content !== this.getContent()) {
        this.applyDiff(prevContent, content);  // Preserve cursor
      }
    }
  );
}
```

### Dev Server Detection (Terminal → Preview)

```typescript
// Terminal output parser
terminalPlugin.onOutput(line: string) {
  const devServerPattern = /Local:\s+(https?:\/\/localhost:\d+)/;
  const match = line.match(devServerPattern);
  
  if (match) {
    const url = match[1];
    eventBus.emit('devserver:started', { url });
  }
}

// Preview subscribes
previewPlugin.init() {
  eventBus.on('devserver:started', ({ url }) => {
    this.setIframeSrc(url);
    this.showPreview();
  });
  
  // Show placeholder until dev server starts
  this.showPlaceholder('Start a dev server in Terminal to see preview');
}
```

---

## Capability Gating

### Platform Detection

```typescript
interface PlatformCapabilities {
  platform: 'desktop' | 'tablet' | 'mobile';
  hasFileSystemAccess: boolean;   // FSA API available
  hasWebContainer: boolean;       // StackBlitz WebContainer support
  screenWidth: number;
  touchEnabled: boolean;
}

function detectCapabilities(): PlatformCapabilities {
  const hasFileSystemAccess = 'showDirectoryPicker' in window;
  const hasWebContainer = typeof WebContainer !== 'undefined';
  const screenWidth = window.innerWidth;
  const touchEnabled = 'ontouchstart' in window;
  
  let platform: Platform;
  if (screenWidth >= 1024 && !touchEnabled) {
    platform = 'desktop';
  } else if (screenWidth >= 768) {
    platform = 'tablet';
  } else {
    platform = 'mobile';
  }
  
  return { platform, hasFileSystemAccess, hasWebContainer, screenWidth, touchEnabled };
}
```

### Plugin Availability

```typescript
function getAvailablePlugins(
  capabilities: PlatformCapabilities,
  projectSettings: ProjectSettings
): PluginType[] {
  return Object.values(PLUGIN_REGISTRY)
    .filter(plugin => {
      // Platform check
      if (!plugin.platforms.includes(capabilities.platform)) {
        return false;
      }
      
      // Capability check
      if (plugin.type === 'terminal' && !capabilities.hasWebContainer) {
        return false;
      }
      
      // Core plugins are ALWAYS loaded - cannot be disabled
      if (plugin.alwaysLoaded) {
        return true;  // FileTree and Chat always pass
      }
      
      // Optional plugins respect user preference
      if (!projectSettings.enabledPlugins.includes(plugin.type)) {
        return false;
      }
      
      return true;
    })
    .map(p => p.type);
}

// Always-loaded plugins are guaranteed present
function getCorePlugins(): PluginType[] {
  return Object.values(PLUGIN_REGISTRY)
    .filter(p => p.alwaysLoaded)
    .map(p => p.type);
  // Returns: ['file-tree', 'chat']
}
```

---

## Write Lock Protocol

### Problem: Race Conditions

When Monaco and Notes both have the same file open, concurrent edits can cause:
- Data loss (one overwrites the other)
- Infinite loops (A updates → B reacts → A reacts → ...)
- Stale reads (reading old content while write in progress)

### Solution: Debounced Write with Lock

```typescript
class FileWriteCoordinator {
  private locks = new Map<string, { holder: PluginType; timestamp: number }>();
  private pendingWrites = new Map<string, NodeJS.Timeout>();
  
  async requestWrite(
    filePath: string, 
    content: string, 
    source: PluginType
  ): Promise<boolean> {
    const lock = this.locks.get(filePath);
    
    // Check if another plugin holds the lock
    if (lock && lock.holder !== source) {
      const age = Date.now() - lock.timestamp;
      if (age < 1000) {  // Lock is fresh, reject
        return false;
      }
      // Lock is stale, take it
    }
    
    // Acquire lock
    this.locks.set(filePath, { holder: source, timestamp: Date.now() });
    
    // Debounce write (500ms)
    const existing = this.pendingWrites.get(filePath);
    if (existing) clearTimeout(existing);
    
    this.pendingWrites.set(filePath, setTimeout(async () => {
      await fileService.writeFile(filePath, content);
      this.locks.delete(filePath);
      this.pendingWrites.delete(filePath);
    }, 500));
    
    return true;
  }
}
```

---

## Event Bus Contract

### Event Types

```typescript
type PluginEvent =
  // File events
  | { type: 'file:selected'; payload: { projectId: string; filePath: string } }
  | { type: 'file:created'; payload: { projectId: string; filePath: string } }
  | { type: 'file:deleted'; payload: { projectId: string; filePath: string } }
  | { type: 'file:renamed'; payload: { projectId: string; oldPath: string; newPath: string } }
  | { type: 'file:saved'; payload: { projectId: string; filePath: string } }
  
  // Editor events
  | { type: 'editor:content-changed'; payload: { filePath: string; content: string; source: PluginType } }
  | { type: 'editor:cursor-moved'; payload: { filePath: string; position: CursorPosition } }
  
  // Terminal events
  | { type: 'devserver:started'; payload: { url: string } }
  | { type: 'devserver:stopped'; payload: {} }
  | { type: 'terminal:command-executed'; payload: { command: string; exitCode: number } }
  
  // AI events
  | { type: 'ai:tool-call-requested'; payload: { tool: string; args: unknown } }
  | { type: 'ai:tool-call-completed'; payload: { tool: string; result: unknown } };
```

### Event Bus Implementation

```typescript
// Use eventemitter3 (already in package.json)
import EventEmitter from 'eventemitter3';

const eventBus = new EventEmitter();

// Type-safe emit
function emit<T extends PluginEvent['type']>(
  type: T,
  payload: Extract<PluginEvent, { type: T }>['payload']
) {
  eventBus.emit(type, payload);
}

// Type-safe subscribe
function on<T extends PluginEvent['type']>(
  type: T,
  handler: (payload: Extract<PluginEvent, { type: T }>['payload']) => void
) {
  eventBus.on(type, handler);
  return () => eventBus.off(type, handler);  // Return unsubscribe
}
```

---

## What This Replaces

| Old Pattern | Problem | New Pattern |
|-------------|---------|-------------|
| Direct plugin-to-plugin calls | Tight coupling | Event bus |
| Each plugin owns its data | Duplicate state | Shared coordination store + Services |
| WorkspaceBindings determining plugins | Conflates data with display | Platform capabilities + user settings |
| Multiple event buses | Overlapping responsibilities | Single typed event bus |
| No write coordination | Race conditions | Write lock protocol |
| All plugins treated equally | Core plugins could be disabled | `alwaysLoaded` for FileTree + Chat |
| "Plugins are lenses" oversimplification | Ignores that some plugins WRITE | Permission levels (core/write/read-only) |

---

## The Write Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         PROJECT                                  │
│              (owns all data, authoritative)                      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
    ┌───────────┐     ┌───────────┐     ┌───────────┐
    │FileService│     │ThreadSvc  │     │NotesService│
    │(gatekeeper)│    │(gatekeeper)│    │(gatekeeper)│
    └─────┬─────┘     └─────┬─────┘     └─────┬─────┘
          │                 │                 │
    ┌─────┴─────┐     ┌─────┴─────┐     ┌─────┴─────┐
    │ Writers:  │     │ Writers:  │     │ Writers:  │
    │ - FileTree│     │ - Chat    │     │ - Notes   │
    │ - Chat    │     │           │     │           │
    │ - Terminal│     │           │     │           │
    │ - Monaco  │     │           │     │           │
    │ - Notes   │     │           │     │           │
    └───────────┘     └───────────┘     └───────────┘
```

**Key:** Plugins don't write DIRECTLY to storage. They call Service methods.
Services are gatekeepers that:
1. Check plugin permission level
2. Check canWriteEntities
3. Enforce single-writer principle
4. Emit events for coordination

---

## Sources

- Context7: Zustand slices pattern for modular stores
- Context7: Dexie useLiveQuery for reactive queries
- WebSearch: Plugin architecture patterns React 2026
- WebSearch: Browser IDE Monaco coordination patterns

**Confidence:** HIGH
