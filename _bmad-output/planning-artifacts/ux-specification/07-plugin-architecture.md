# Plugin Architecture UX

<- [Route & Navigation](./06-route-navigation.md) | [Index](./index.md) | [Activity Bar & Docker](./08-activity-bar-docker.md) ->

---

## 7.1 Plugin System Overview

Via-Gent uses a **plugin-centric architecture** where all functionality is delivered through composable feature plugins. This replaces the deprecated workspace model with a flexible, platform-aware system.

### Design Philosophy

```
+-------------------------------------------------------------+
|                   PROJECT-CENTRIC MODEL                     |
+------------------------------------------------------------|
|  Route: /$projectId                                         |
|      |                                                      |
|  Platform Detection (device + storage type)                 |
|      |                                                      |
|  Plugin Selection (platform-aware defaults)                 |
|      |                                                      |
|  Layout Composition (responsive grid slots)                 |
+-------------------------------------------------------------+
```

### Core Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Plugin Independence** | Each plugin is self-contained with its own state | Isolated Zustand stores per plugin |
| **Platform Awareness** | Plugins adapt to device capabilities | `PlatformContract` determines availability |
| **Lazy Loading** | Plugins load only when activated | Dynamic imports via `React.lazy()` |
| **State Isolation** | Plugin state scoped to plugin, project-persisted | `projectId` as state key prefix |
| **Cross-Communication** | Plugins communicate via EventBus | `file-event-bus.ts` for file events |

---

## 7.2 Plugin Types & Registry

### Plugin Registry

| Plugin ID | Name | Description | Always Loaded | Default Position |
|-----------|------|-------------|---------------|------------------|
| `file-tree-project-management` | Project Files | File explorer, project switcher, CRUD | **Yes** | Left panel |
| `notes` | Notes Editor | Markdown/BlockNote document editing | **Yes** | Main content |
| `agent-chat-cascade` | AI Chat | Thread management, agent orchestration | **Yes** | Right panel |
| `monaco-editor` | Code Editor | Full Monaco IDE experience | No | Main content |
| `preview` | Live Preview | WebContainer preview (POST-MVP) | No | Main content |
| `terminal` | Terminal | Command line interface (POST-MVP) | No | Bottom panel |

### TypeScript Plugin Interface

```typescript
// src/plugins/core/FeaturePlugin.interface.ts

interface FeaturePlugin {
  // === Identification ===
  id: PluginId;
  name: string;
  icon: React.ReactNode;
  description: string;

  // === Rendering ===
  component: React.LazyExoticComponent<React.FC<PluginProps>>;
  panelComponent?: React.FC<PanelPluginProps>;
  
  // === Platform Requirements ===
  requiresFSA: boolean;
  requiresProject: boolean;
  minWidth: number;           // Minimum panel width in pixels
  maxInstances: 1 | 2 | 'unlimited';
  
  // === Layout Constraints ===
  allowedPositions: ('left' | 'main' | 'right' | 'bottom')[];
  defaultPosition: 'left' | 'main' | 'right' | 'bottom';
  
  // === State Management ===
  createStore: () => PluginStore;
  
  // === Lifecycle Hooks ===
  onLoad?: (context: PluginContext) => Promise<void>;
  onUnload?: (context: PluginContext) => Promise<void>;
  onActivate?: (context: PluginContext) => void;
  onDeactivate?: (context: PluginContext) => void;
}

type PluginId = 
  | 'file-tree-project-management'
  | 'notes'
  | 'agent-chat-cascade'
  | 'monaco-editor'
  | 'preview'
  | 'terminal';

interface PluginContext {
  projectId: string;
  platform: PlatformContract;
  eventBus: EventBus;
  storageGateway: StorageGateway;
}
```

---

## 7.3 Always-Loaded Plugins (The Two Essential)

### Plugin 1: file-tree-project-management

**Always in left panel. Cannot be removed.**

```
+-----------------------------+
| [Search...]           [+]   |  36px header
+-----------------------------+
| PROJECT FILES               |  Section header
| |-- src/                    |
| |   |-- components/         |
| |   +-- pages/              |
| |-- public/                 |
| +-- package.json            |
+-----------------------------+
| DATABASES (0)               |  Collapsible section
+-----------------------------+
| RAG INDICES (1)             |  Collapsible section
|   +-- project-index         |
+-----------------------------+
```

**Responsibilities:**
- File tree navigation with expand/collapse
- File/folder CRUD operations
- Project switching
- Search within project files
- Database management (future)
- RAG index management

### Plugin 2: agent-chat-cascade

**Always in right panel. Cannot be removed.**

```
+-------------------------------------+
| [Chat] [Threads] [Agents] [Settings]|  32px tabs
+-------------------------------------+
|                                     |
|  +-----------------------------+    |
|  | User: Help me understand... |    |
|  +-----------------------------+    |
|                                     |
|  +-----------------------------+    |
|  | Agent: I'll analyze...      |    |
|  | [Code block]                |    |
|  | [Tool output: grep]         |    |
|  +-----------------------------+    |
|                                     |
+-------------------------------------+
| [Type a message...]        [Send]   |  Input area
+-------------------------------------+
```

**Responsibilities:**
- Agent orchestration and delegation
- Thread management (project-scoped)
- Context window management (150K limit)
- Multi-format block rendering
- Streaming conversation display

---

## 7.4 Plugin State Management

### State Isolation Pattern

```typescript
// Each plugin has isolated state scoped to projectId
interface PluginState<T> {
  projectId: string;
  pluginId: PluginId;
  enabled: boolean;
  config: T;
  sessionState: Record<string, unknown>;
}

// Factory for creating plugin stores
function createPluginStore<T>(
  pluginId: PluginId,
  initialConfig: T
): () => PluginState<T> {
  return create<PluginState<T>>()(
    persist(
      (set) => ({
        projectId: '',
        pluginId,
        enabled: true,
        config: initialConfig,
        sessionState: {},
        
        setProjectId: (projectId: string) => set({ projectId }),
        setConfig: (config: T) => set({ config }),
        setEnabled: (enabled: boolean) => set({ enabled }),
      }),
      {
        name: `plugin-${pluginId}`,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          config: state.config,
          enabled: state.enabled,
        }),
      }
    )
  );
}
```

---

## 7.5 Plugin Communication Patterns

### EventBus Integration

```typescript
// Plugin-to-plugin communication via EventBus

// File events (from FileTree)
type FileEvent =
  | { type: 'FILE_SELECTED'; path: string; pluginId: PluginId }
  | { type: 'FILE_CREATED'; path: string }
  | { type: 'FILE_UPDATED'; path: string; content: string }
  | { type: 'FILE_DELETED'; path: string }
  | { type: 'FILE_RENAMED'; from: string; to: string };

// Plugin lifecycle events
type PluginEvent =
  | { type: 'PLUGIN_ACTIVATED'; pluginId: PluginId }
  | { type: 'PLUGIN_DEACTIVATED'; pluginId: PluginId }
  | { type: 'PLUGIN_STATE_CHANGED'; pluginId: PluginId; state: unknown };

// Usage in plugin
const handleFileSelected = useCallback((event: FileEvent) => {
  if (event.type === 'FILE_SELECTED') {
    openFileInEditor(event.path);
  }
}, []);

useEffect(() => {
  return eventBus.subscribe('FILE_SELECTED', handleFileSelected);
}, [handleFileSelected]);
```

---

## 7.6 Plugin Lifecycle

```
+-------------------------------------------------------------+
|                    PLUGIN LIFECYCLE                          |
+-------------------------------------------------------------+
|                                                              |
|  REGISTERED                                                  |
|      |                                                       |
|  onLoad() -----> Load dependencies, initialize store         |
|      |                                                       |
|  LOADED                                                      |
|      |                                                       |
|  onActivate() -> Mount component, hydrate state              |
|      |                                                       |
|  ACTIVE <------> User interaction, state updates             |
|      |                                                       |
|  onDeactivate() -> Preserve state, unmount component         |
|      |                                                       |
|  INACTIVE (state preserved)                                  |
|      |                                                       |
|  onUnload() ---> Cleanup, release resources                  |
|      |                                                       |
|  UNLOADED                                                    |
|                                                              |
+-------------------------------------------------------------+
```

---

<- [Route & Navigation](./06-route-navigation.md) | [Index](./index.md) | [Activity Bar & Docker](./08-activity-bar-docker.md) ->
