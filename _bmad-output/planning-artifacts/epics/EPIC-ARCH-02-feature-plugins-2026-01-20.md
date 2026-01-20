# EPIC-ARCH-02: Feature Plugin Architecture

**Epic ID:** EPIC-ARCH-02
**Created:** 2026-01-20
**Status:** APPROVED
**Priority:** P0
**Estimated Duration:** 2-3 days (AI agent time)
**Team:** Both (Team A + Team B parallel)
**ADR Reference:** ADR-034
**Depends On:** EPIC-ARCH-01 ✅ COMPLETE

---

## Executive Summary

Transform workspace-centric architecture into project-centric with feature plugins. Each feature (FileTree, Monaco, Notes, Terminal, Chat) becomes a self-contained plugin that:
- Receives project context from a unified provider
- Renders into layout slots (configurable by user)
- Has no knowledge of "workspaces" - only knows about the project

---

## Problem Statement

### Current State (Workspace-Centric)

```
/ide/$projectId      → IDELayoutMain → FileTree + Monaco + Terminal + Chat
/notes/$projectId    → NotesPage     → FileTree + BlockNote + Chat
/knowledge/$projectId → (Deferred)
/study/$projectId     → (Deferred)
```

**Issues:**
1. FileTree component exists in 3 different implementations
2. Chat is duplicated per workspace
3. State management fragmented across workspace stores
4. Adding new features requires modifying multiple workspaces

### Target State (Project-Centric)

```
/$projectId → ProjectLayout → [Plugin1, Plugin2, Plugin3, ...]
                              ↓
                    User selects which plugins to load
                    (FileTree, Monaco, Notes, Terminal, Chat)
```

**Benefits:**
1. Single FileTree plugin used everywhere
2. Single Chat plugin used everywhere
3. Unified project state via ProjectContext
4. Adding new features = adding new plugin

---

## Architecture

### Core Abstraction: FeaturePlugin Interface

```typescript
// src/domain/interfaces/feature-plugin.interface.ts

export interface FeaturePlugin {
  // Identity
  id: PluginId;
  name: string;
  icon: React.ReactNode;
  description: string;
  
  // Requirements
  requirements: {
    storageType: 'fsa' | 'indexeddb' | 'any';
    deviceType: 'desktop' | 'mobile' | 'any';
    minWidth: number;      // Minimum panel width in pixels
    maxInstances: 1 | 2 | 'unlimited';
  };
  
  // Rendering
  MainComponent: React.FC<PluginMainProps>;
  SidebarComponent?: React.FC<PluginSidebarProps>;
  ToolbarComponent?: React.FC<PluginToolbarProps>;
  
  // Lifecycle
  onMount?: (context: ProjectContext) => Promise<void>;
  onUnmount?: () => Promise<void>;
  onProjectChange?: (newProjectId: string) => Promise<void>;
}

export type PluginId = 
  | 'filetree' 
  | 'monaco' 
  | 'notes' 
  | 'terminal' 
  | 'chat' 
  | 'agents';

export interface PluginMainProps {
  projectContext: ProjectContext;
  panelId: string;
  width: number;
  height: number;
}
```

### Plugin Registration

```typescript
// src/infrastructure/plugins/plugin-registry.ts

export const pluginRegistry = new Map<PluginId, FeaturePlugin>();

export function registerPlugin(plugin: FeaturePlugin): void {
  if (pluginRegistry.has(plugin.id)) {
    console.warn(`Plugin ${plugin.id} already registered, overwriting`);
  }
  pluginRegistry.set(plugin.id, plugin);
}

export function getPlugin(id: PluginId): FeaturePlugin | undefined {
  return pluginRegistry.get(id);
}

export function getAvailablePlugins(context: ProjectContext): FeaturePlugin[] {
  return Array.from(pluginRegistry.values()).filter(plugin => {
    const { storageType, deviceType } = plugin.requirements;
    
    // Check storage type compatibility
    if (storageType !== 'any' && storageType !== context.project.storageType) {
      return false;
    }
    
    // Check device type compatibility
    if (deviceType !== 'any' && deviceType !== context.platform.deviceType) {
      return false;
    }
    
    return true;
  });
}
```

### Project Context Provider

```typescript
// src/infrastructure/context/project-context.tsx

export interface ProjectContext {
  // Project Data
  project: Project;
  projectId: string;
  
  // Storage Access
  gateway: StorageGateway;
  
  // Platform Info
  platform: PlatformContract;
  
  // Shared Services
  fileTree: FileTreeState;
  chatService: ChatService;
  
  // Actions
  openFile: (path: string) => void;
  saveFile: (path: string, content: string) => Promise<void>;
  refreshFileTree: () => Promise<void>;
}

export const ProjectContextProvider: React.FC<{
  projectId: string;
  children: React.ReactNode;
}> = ({ projectId, children }) => {
  // Load project, gateway, platform, services
  // Provide unified context to all plugins
};
```

---

## Stories

### ARCH-02-01: Define FeaturePlugin Interface
**Priority:** P0 | **Effort:** 2 hours | **Team:** Team A

Create the core abstraction that all plugins will implement.

**Files to Create:**
```
src/domain/interfaces/feature-plugin.interface.ts
src/domain/types/plugin-types.ts
```

**Acceptance Criteria:**
- [ ] FeaturePlugin interface defined with all required properties
- [ ] PluginId union type covers all planned plugins
- [ ] PluginMainProps, PluginSidebarProps defined
- [ ] Requirements object includes storage/device/width constraints
- [ ] TypeScript: 0 errors

---

### ARCH-02-02: Create Plugin Registry
**Priority:** P0 | **Effort:** 2 hours | **Team:** Team A

Implement the registry that manages plugin registration and discovery.

**Files to Create:**
```
src/infrastructure/plugins/plugin-registry.ts
src/infrastructure/plugins/index.ts
```

**Acceptance Criteria:**
- [ ] registerPlugin() stores plugin in Map
- [ ] getPlugin() retrieves by PluginId
- [ ] getAvailablePlugins() filters by context requirements
- [ ] Singleton pattern for registry
- [ ] TypeScript: 0 errors

---

### ARCH-02-03: Create ProjectContext Provider
**Priority:** P0 | **Effort:** 4 hours | **Team:** Team B
**Depends On:** ARCH-02-01

Unified context provider that all plugins receive.

**Files to Create:**
```
src/infrastructure/context/project-context.tsx
src/infrastructure/context/use-project-context.ts
```

**Key Decisions:**
- **Single gateway instance** per project (not per plugin)
- **Shared file tree state** (one source of truth)
- **Shared chat service** (unified across plugins)

**Acceptance Criteria:**
- [ ] ProjectContext interface matches ADR-034 specification
- [ ] Provider loads project from Dexie
- [ ] Provider initializes gateway based on storageType
- [ ] Provider creates shared file tree state
- [ ] useProjectContext() hook for plugin consumption
- [ ] TypeScript: 0 errors

---

### ARCH-02-04: Convert FileTree to Plugin
**Priority:** P0 | **Effort:** 4 hours | **Team:** Team A
**Depends On:** ARCH-02-01, ARCH-02-02

Extract FileTree from IDE-specific implementation into standalone plugin.

**Files to Create:**
```
src/plugins/filetree/index.ts
src/plugins/filetree/FileTreePlugin.tsx
src/plugins/filetree/useFileTreePlugin.ts
```

**Migration Strategy:**
1. Copy existing FileTree component logic
2. Remove IDE-specific dependencies
3. Receive project context via props
4. Register in plugin-registry
5. Create facade in old location for backward compatibility

**Acceptance Criteria:**
- [ ] FileTreePlugin implements FeaturePlugin interface
- [ ] Receives ProjectContext, not workspace-specific state
- [ ] Works with both FSA and IndexedDB storage types
- [ ] Registered in plugin-registry on app startup
- [ ] Old FileTree component re-exports from plugin
- [ ] TypeScript: 0 errors

---

### ARCH-02-05: Convert Monaco to Plugin
**Priority:** P0 | **Effort:** 4 hours | **Team:** Team B
**Depends On:** ARCH-02-03, ARCH-02-04

Extract Monaco editor into standalone plugin.

**Files to Create:**
```
src/plugins/monaco/index.ts
src/plugins/monaco/MonacoPlugin.tsx
src/plugins/monaco/useMonacoPlugin.ts
```

**Key Considerations:**
- **File opening** via ProjectContext.openFile()
- **File saving** via ProjectContext.saveFile()
- **Dirty state** managed within plugin
- **External change detection** via gateway.watch()

**Acceptance Criteria:**
- [ ] MonacoPlugin implements FeaturePlugin interface
- [ ] Receives files to open via ProjectContext
- [ ] Saves via ProjectContext.saveFile()
- [ ] Handles dirty state and unsaved warnings
- [ ] Subscribes to file changes from gateway
- [ ] TypeScript: 0 errors

---

### ARCH-02-06: Convert Notes/BlockNote to Plugin
**Priority:** P0 | **Effort:** 4 hours | **Team:** Team A
**Depends On:** ARCH-02-03

Extract BlockNote editor into standalone plugin.

**Files to Create:**
```
src/plugins/notes/index.ts
src/plugins/notes/NotesPlugin.tsx
src/plugins/notes/useNotesPlugin.ts
```

**Special Handling:**
- **Markdown sync** for FSA projects (bidirectional)
- **IndexedDB storage** for mobile projects
- **Conflict resolution** when external changes detected

**Acceptance Criteria:**
- [ ] NotesPlugin implements FeaturePlugin interface
- [ ] Works with FSA (markdown files) and IndexedDB (virtual)
- [ ] Syncs with external editors (FSA mode)
- [ ] Conflict resolution UI integrated
- [ ] TypeScript: 0 errors

---

### ARCH-02-07: Convert Terminal to Plugin
**Priority:** P1 | **Effort:** 3 hours | **Team:** Team B
**Depends On:** ARCH-02-03

Extract Terminal into standalone plugin.

**Files to Create:**
```
src/plugins/terminal/index.ts
src/plugins/terminal/TerminalPlugin.tsx
src/plugins/terminal/useTerminalPlugin.ts
```

**Requirements:**
- `requirements.deviceType: 'desktop'` (not available on mobile)
- `requirements.storageType: 'fsa'` (needs file system access)

**Acceptance Criteria:**
- [ ] TerminalPlugin implements FeaturePlugin interface
- [ ] Only available for desktop FSA projects
- [ ] Connects to WebContainer or native terminal
- [ ] TypeScript: 0 errors

---

### ARCH-02-08: Convert Chat to Plugin
**Priority:** P1 | **Effort:** 4 hours | **Team:** Team A
**Depends On:** ARCH-02-03

Extract Chat into standalone plugin that works across all contexts.

**Files to Create:**
```
src/plugins/chat/index.ts
src/plugins/chat/ChatPlugin.tsx
src/plugins/chat/useChatPlugin.ts
```

**Integration Points:**
- **Tool execution** via ProjectContext
- **File operations** via ProjectContext.openFile/saveFile
- **Thread persistence** via existing unified-chat-store

**Acceptance Criteria:**
- [ ] ChatPlugin implements FeaturePlugin interface
- [ ] Available for all storage types and devices
- [ ] Persists threads per project
- [ ] Tool execution works with ProjectContext
- [ ] TypeScript: 0 errors

---

### ARCH-02-09: Create PluginLayout Container
**Priority:** P1 | **Effort:** 4 hours | **Team:** Team B
**Depends On:** ARCH-02-04 through ARCH-02-08

The container that renders selected plugins in configurable layout.

**Files to Create:**
```
src/presentation/layouts/PluginLayout.tsx
src/presentation/layouts/PluginPanel.tsx
src/presentation/layouts/PluginLayoutStore.ts
```

**Layout Options:**
```
1-column:  [  Plugin1  ]
2-column:  [ P1 | P2 ]
3-column:  [ P1 | P2 | P3 ]
2+1:       [ P1 | P2 ]
           [   P3    ]
```

**Acceptance Criteria:**
- [ ] PluginLayout renders 1-5 plugins
- [ ] Resizable panels (react-resizable-panels)
- [ ] Layout persisted per project
- [ ] Drag-drop plugin reordering
- [ ] Add/remove plugins UI
- [ ] TypeScript: 0 errors

---

### ARCH-02-10: Create Project Route
**Priority:** P1 | **Effort:** 3 hours | **Team:** Team A
**Depends On:** ARCH-02-09

New unified route that replaces workspace-specific routes.

**Files to Create:**
```
src/routes/$projectId.tsx (new unified route)
```

**Migration:**
- `/ide/$projectId` → Redirect to `/$projectId?layout=ide`
- `/notes/$projectId` → Redirect to `/$projectId?layout=notes`

**Acceptance Criteria:**
- [ ] `/$projectId` route loads ProjectContext
- [ ] Renders PluginLayout with user's selected plugins
- [ ] Layout preset from query param or project settings
- [ ] Old routes redirect with query param
- [ ] TypeScript: 0 errors

---

## Dependencies Graph

```
ARCH-02-01 (Interface)
    ↓
ARCH-02-02 (Registry) ← ARCH-02-01
    ↓
ARCH-02-03 (Context) ← ARCH-02-01
    ↓
    ├─ ARCH-02-04 (FileTree) ← 01, 02
    ├─ ARCH-02-05 (Monaco) ← 03, 04
    ├─ ARCH-02-06 (Notes) ← 03
    ├─ ARCH-02-07 (Terminal) ← 03
    └─ ARCH-02-08 (Chat) ← 03
           ↓
    ARCH-02-09 (Layout) ← 04-08
           ↓
    ARCH-02-10 (Route) ← 09
```

---

## Parallel Execution Plan

### Team A (Stories: 01, 02, 04, 06, 08, 10)
```
Day 1 AM: ARCH-02-01 (Interface) + ARCH-02-02 (Registry)
Day 1 PM: ARCH-02-04 (FileTree Plugin)
Day 2 AM: ARCH-02-06 (Notes Plugin)
Day 2 PM: ARCH-02-08 (Chat Plugin)
Day 3 AM: ARCH-02-10 (Project Route)
```

### Team B (Stories: 03, 05, 07, 09)
```
Day 1 AM: Wait for ARCH-02-01
Day 1 PM: ARCH-02-03 (ProjectContext)
Day 2 AM: ARCH-02-05 (Monaco Plugin)
Day 2 PM: ARCH-02-07 (Terminal Plugin)
Day 3 AM: ARCH-02-09 (PluginLayout)
```

---

## Success Criteria

| Metric | Before | After |
|--------|--------|-------|
| FileTree implementations | 3 | 1 |
| Chat implementations | 2 | 1 |
| Routes per workspace | 4 | 1 (+ redirects) |
| Plugin interface | None | FeaturePlugin |
| Layout flexibility | Fixed per workspace | User configurable |

---

## Rollback Strategy

If EPIC-ARCH-02 needs rollback:

1. **Facade pattern** ensures old imports still work
2. **Redirect routes** can be removed to restore old routes
3. **Plugin registry** can be bypassed (direct component use)
4. **ProjectContext** can be replaced with old workspace stores

Each story maintains backward compatibility via facades.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Plugin interface too rigid | Design for extension, allow plugin-specific props |
| Performance regression | Lazy load plugins, memoize ProjectContext |
| Complex state sharing | Single gateway, shared via context |
| Migration breaks old routes | Redirects preserve old URLs |

---

## Next Epic Preview

**EPIC-ARCH-03: Layout System & UX** will:
- Implement drag-drop plugin arrangement
- Add layout presets (IDE mode, Notes mode, etc.)
- Mobile-responsive plugin layouts
- Progressive disclosure for advanced features

---

## Approval Signatures

- [ ] User (Product Owner)
- [ ] Architect Agent
- [ ] Dev Team Lead

**Ready for execution upon approval.**
