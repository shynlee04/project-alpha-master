# Via-Gent Architecture Document

**Version:** 3.1.0
**Date:** 2026-01-26
**Status:** ACTIVE - Aligned with new-fundamental-truths.md v2.0.0 + EPIC-0 Learnings
**Last Updated:** 2026-01-26

## Authoritative Sources

This document is **aligned 100%** with new-fundamental-truths.md v2.0.0 and reflects the project-centric architecture.

| ADR | Title | Status | Key Decisions |
|-----|-------|--------|---------------|
| **ADR-039** | Unified Architecture Fundamentals (v2.0.0 Alignment) | PROPOSED | Project-centric architecture, plugin system, orchestrator pattern, TanStack AI SDK, BYOK vault, chat cascade |

**Reference:** `new-fundamental-truths.md` (v2.0.0, 2026-01-25)
**Reference:** `ADR-039-unified-architecture-fundamentals-2026-01-26.md` (pending creation)

**Related Documents:**
- Epics: `_bmad-output/planning-artifacts/epics.md`
- Architecture Analysis: `_bmad-output/analysis/ARCHITECTURE-ANALYSIS-REPORT-2026-01-26.md`
- ADR Audit: `_bmad-output/analysis/ADR-AUDIT-REPORT-2026-01-26.md`

---

## ⚡ Quick Reference

### Architecture Metrics

| Component | Status | Notes |
|-----------|--------|-------|
| **Architecture Health** | 70% | Improving from 35% alignment |
| **Plugin System** | 0% | Missing - requires implementation |
| **Agent System** | 40% | Orchestrator pattern partially implemented |
| **TanStack AI SDK** | 0% | Missing - requires migration from direct provider calls |
| **Chat Cascade & Thread Management** | 30% | Partial - requires completion |
| **BYOK Vault** | 50% | Partial - needs SDK integration |
| **Project-Centric Architecture** | 30% | Still has workspace-centric remnants |
| **Clean Architecture Compliance** | ~50% | Layer violations exist |
| **God Components** | 8 | Requires decomposition |
| **God Stores** | 8 | Requires decomposition |
| **Layer Violations** | 130+ | Must be fixed |

### Key Architectural Principles (from new-fundamental-truths.md v2.0.0)

| Principle | Description | Status |
|-----------|-------------|--------|
| **Project-Centric** | Single route `/$projectId`, project ID is anchor | 30% aligned - needs route consolidation |
| **Plugin-Based** | Plugins replace workspaces, platform determines defaults | 0% aligned - missing plugin system |
| **Platform-First** | Device type (desktop/mobile/tablet) determines capabilities | 90% aligned - PlatformContract exists |
| **BYOK with TanStack AI** | All LLM calls through SDK, no direct provider calls | 0% aligned - requires SDK migration |
| **Orchestrator Pattern** | Coordinator agent with read-only tools, delegates to domain agents | 40% aligned - needs implementation |
| **Thread Management** | Project-scoped threads, 150K token limit, 90% compaction | 30% aligned - needs completion |
| **State Boundaries** | Zustand v5 for client, Dexie for persistent, clear separation | 70% aligned - needs workspaceId removal |

---

## Section 1: Executive Summary

Via-Gent is a browser-based, project-centric AI development workspace. The platform operates at approximately **30-40% feature completeness** with local-first architecture using WebContainers, IndexedDB, and File System Access API (FSA).

**⚠️ CRITICAL ARCHITECTURAL SHIFT (v2.0.0 → v3.0.0)**

The architecture has fundamentally shifted from **workspace-centric** to **project-centric** model. This shift requires:

1. **Route Consolidation** - From 5+ workspace routes to 2 routes (`/hub`, `/$projectId`)
2. **Plugin System Implementation** - Complete plugin architecture with platform-aware defaults
3. **Agent System Overhaul** - Replace ModeClassifier with orchestrator pattern
4. **TanStack AI SDK Migration** - All LLM calls must route through SDK
5. **Composite Key Pattern Change** - From `[projectId+workspaceId]` to single `projectId`
6. **BYOK Vault Integration** - Secure API key distribution via SDK
7. **Chat Cascade & Thread Management** - Complete thread architecture with compaction

### Architecture Reality (Current)

| Metric | Target Status | Current Status | Gap |
|--------|--------------|----------------|------|
| Feature Completeness | 30-40% | 30-40% | - |
| Project-Centric Architecture | 100% | 30% | **70%** |
| Plugin System | 100% | 0% | **100%** |
| Orchestrator Pattern | 100% | 40% | **60%** |
| TanStack AI SDK Integration | 100% | 0% | **100%** |
| Chat Cascade & Thread Management | 100% | 30% | **70%** |
| BYOK Vault | 100% | 50% | **50%** |
| Clean Architecture Compliance | 75% | ~50% | 25% |

### Phase 1A/1B Blocking Issues

| Issue | Description | Priority | Impact |
|-------|-------------|-----------|--------|
| **Plugin System Missing** | No plugin architecture defined or implemented | P0 | Blocks Phase 1A Non-AI Core |
| **Route Structure Outdated** | Still has workspace-specific routes | P0 | Breaks project-centric model |
| **TanStack AI SDK Not Used** | Direct provider package calls exist | P0 | Blocks BYOK integration |
| **Orchestrator Pattern Not Implemented** | ModeClassifier exists but not orchestrator | P0 | Breaks agent system |
| **Composite Key Pattern Conflict** | `[projectId+workspaceId]` vs single `projectId` | P0 | Breaks state management |
| **Thread Management Incomplete** | No thread architecture, compaction logic | P0 | Breaks chat cascade |

---

## Section 2: System Overview

### 2.1 Architecture Layers

Via-Gent implements a **five-layer Clean Architecture** with unidirectional dependency flow, aligned with project-centric model.

#### Layer Distribution

| Layer | Location | Files | Compliance | Status |
|-------|----------|-------|------------|--------|
| **Core** | `src/core/entities/` | 4 | ~25% | UNDERPOPULATED |
| **Domain** | `src/domain/services/` | 7 | ~50% | PARTIAL - needs plugin integration |
| **Infrastructure** | `src/infrastructure/` | 250+ | ~60% | OVERGROWN + VIOLATING - needs plugin layer |
| **Lib** | `src/lib/` | 220+ | N/A | CONFUSION ZONE - contains plugin stubs |
| **Presentation** | `src/presentation/` | 474 | ~70% | DOMINANT - needs plugin integration |

#### Plugin Layer Addition (NEW - v3.0.0)

**New Layer:** `src/plugins/` - Plugin system architecture (currently missing)

```
src/plugins/
├── core/
│   ├── FeaturePlugin.interface.ts      # Plugin interface definition
│   ├── PluginRegistry.ts              # Plugin registration
│   └── PluginLifecycle.ts            # Load/unload hooks
├── filetree/
│   ├── FileTreePlugin.ts
│   ├── components/
│   └── store/
├── monaco/
│   ├── MonacoPlugin.ts
│   ├── components/
│   └── store/
├── notes/
│   ├── NotesPlugin.ts
│   ├── components/
│   └── store/
├── terminal/
│   ├── TerminalPlugin.ts
│   ├── components/
│   └── store/
└── chat/
    ├── ChatCascadePlugin.ts
    ├── components/
    └── store/
```

#### Known Layer Violations (Must Fix)

```
❌ INFRASTRUCTURE → DOMAIN (wrong direction):
   src/infrastructure/persistence/stores/index.ts:190-195
   exports domain services from infrastructure

❌ DOMAIN → INFRASTRUCTURE (leaky abstraction):
   src/domain/services/universal-adapter-factory.ts:313
   imports credential-vault directly

❌ CIRCULAR DEPENDENCIES:
   src/domain/services/agent-orchestration-service.ts:11
   src/domain/services/workspace-transition-service.ts:11
```

### 2.2 Project-Centric Architecture (NEW - v3.0.0)

#### Fundamental Shift

```
BEFORE (Workspace-Centric - DEPRECATED):
  Route → Workspace → Project → Features
  /ide/$projectId → IDEWorkspace → project.ide → Monaco + Terminal
  /notes/$projectId → NotesWorkspace → project.notes → NotesEditor

AFTER (Project-Centric - CURRENT):
  Route → Project → Feature Plugins
  /$projectId → ProjectContext → [FileTree, Monaco, Notes, Terminal, Chat]
```

#### Key Principles

| Principle | Description | Implementation Status |
|-----------|-------------|---------------------|
| **Single Route** | Only `/$projectId` for loaded projects | 30% - workspace routes still exist |
| **Project ID Anchoring** | Project ID is anchor for threads, RAG, settings | 30% - composite keys have workspaceId |
| **Platform-First Plugins** | Device determines available plugins, not user selection | 0% - plugin system missing |
| **No Workspace Concept** | Workspaces replaced by plugins | 0% - workspace state still exists |

### 2.3 Platform Contract Interface

**Location:** `src/infrastructure/platform/platform-detection.ts`

```typescript
interface PlatformContract {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  storageType: 'fsa' | 'indexeddb';
  canAccessFSA: boolean;
  canWatchFiles: boolean;
  canRunTerminal: boolean;
  canDoAgenticCoding: boolean;
  canAccessIDE: boolean;
}
```

**Implementation:** `getPlatformContract()` function (Story ARC-A01 - COMPLETE)

**Usage Pattern:**
```typescript
const platform = getPlatformContract();
// Use platform.storageType to determine storage strategy
// Use platform.canAccessIDE to guard IDE routes
// Use platform.deviceType to determine plugin defaults
```

### 2.4 FSA Handle Lifecycle (ADR-039 Reference)

**CRITICAL**: `FileSystemDirectoryHandle` is NOT serializable through router state.

**Source:** EPIC-0 Learnings (2026-01-26)

#### Handle Persistence Flow

```
1. Project Creation:
   - User selects folder → FSA handle acquired
   - handlePersistenceService.persist(projectId, handle)
   - Handle stored in IndexedDB `fsaHandles` table
   
2. Project Access:
   - Route loads project from Dexie
   - handlePersistenceService.restoreHandle(projectId)
   - If silent restore fails → PermissionOverlay
   - User grants permission → handle valid
   
3. Handle Validation:
   - Before any FSA operation, verify handle.queryPermission()
   - If 'denied' → show PermissionOverlay
   - If 'granted' → proceed with operation
```

#### Anti-Patterns (from EPIC-0 learnings)

| Pattern | Status | Reason |
|---------|--------|--------|
| Pass handle through `navigate({ state: { handle } })` | ❌ NEVER | Not serializable |
| Assume handle survives page reload | ❌ NEVER | Handle is lost |
| Restore handle from IndexedDB on route mount | ✅ ALWAYS | Only reliable method |
| Check permission before FSA operations | ✅ ALWAYS | May be revoked |

#### Implementation Reference

```typescript
// ✅ CORRECT - Restore handle from persistence
const handle = await handlePersistenceService.restoreHandle(projectId);
if (!handle) {
  // Show PermissionOverlay for re-grant
  return;
}

// ❌ WRONG - Never pass through router state
navigate({ to: `/${projectId}`, state: { handle } }); // FORBIDDEN
```

**Status:** ✅ Implemented in EPIC-0

---

### 2.5 Storage Gateway Abstraction

**Location:** `src/infrastructure/filesystem/`

```typescript
interface StorageGateway {
  read(path: string): Promise<Uint8Array>;
  write(path: string, data: Uint8Array): Promise<void>;
  delete(path: string): Promise<void>;
  list(path: string): Promise<FileEntry[]>;
  exists(path: string): Promise<boolean>;
  watch(callback: FileChangeCallback): () => void;
}

// Factory pattern
const gateway = StorageGatewayFactory.create({
  storageType: platform.storageType,
  projectId: projectId,
  handle: handle  // FSA only
});
```

**Implementations:**
| Gateway | Storage Type | Location | Status |
|---------|--------------|----------|--------|
| **FSAGateway** | 'fsa' | `src/infrastructure/filesystem/fsa-storage-adapter.ts` | ✅ COMPLETE |
| **IDBGateway** | 'indexeddb' | `src/infrastructure/filesystem/idb-storage-adapter.ts` | ✅ COMPLETE |

### 2.6 Storage Gateway Pattern Normalization (EPIC-0 Fix)

**Source:** EPIC-0 Learnings (2026-01-26)

**Problem Solved:** `gateway.list('.')` pattern returned empty results

#### Pattern Normalization

```typescript
list: async (path) => {
  // Normalize common patterns to recursive glob
  const pattern = (path === '.' || path === '') ? '**/*' : path;
  const files = await storageAdapter.listFiles(pattern);
  // ...
}
```

#### Supported Patterns

| Input | Normalized | Result |
|-------|-----------|--------|
| `'.'` | `'**/*'` | All files recursively |
| `''` | `'**/*'` | All files recursively |
| `'src'` | `'src/**/*'` | All files in src recursively |
| `'*.ts'` | `'*.ts'` | TypeScript files in root |

#### Implementation Location

**File:** `src/infrastructure/filesystem/fsa-storage-adapter.ts`

```typescript
// Gateway list method with normalization
async list(path: string): Promise<FileEntry[]> {
  const normalizedPath = this.normalizePath(path);
  // ...
}

private normalizePath(path: string): string {
  if (path === '.' || path === '') return '**/*';
  if (!path.includes('*')) return `${path}/**/*`;
  return path;
}
```

**Status:** ✅ Implemented in EPIC-0

### 2.7 Route Structure (UPDATED - v3.0.0)

**Current State (OUTDATED):**
```
❌ DEPRECATED ROUTES (must be removed):
   /ide/$projectId       → Redirects to /$projectId
   /knowledge/$projectId  → Redirects to /$projectId
   /notes/$projectId     → Redirects to /$projectId
   /study/$projectId     → Redirects to /$projectId
   /workspace/$projectId → Redirects to /$projectId
```

**New Route Structure (TARGET):**
```
✅ PROJECT-CENTRIC ROUTES:
   /hub                    # Project management, no project loaded
   /$projectId             # Project loaded with feature plugins

REDIRECT STRATEGY:
   - Old routes redirect to /$projectId
   - Console warning: "Workspace routes deprecated, redirecting to /$projectId"
   - URL parameter `?layout=ide` or `?layout=notes` FORBIDDEN
```

**Route Loading Pattern:**
```typescript
// route.ts
export const route = createRoute({
  getParentRoute: () => rootRoute,
  path: '$projectId',
  component: ProjectWorkspace,
  beforeLoad: ({ params }) => {
    // Platform guard ONLY - redirect if needed
    const platform = getPlatformContract();
    // Platform determines plugins, not user selection
    if (!platform.canAccessIDE) {
      throw redirect({ to: '/hub', replace: true });
    }
  },
  loader: ({ params }) => {
    // Data fetch - project, FSA handle, state
    return fetchProjectAndHydrate(params.projectId);
  },
});
```

**Key Rules:**
- NO `beforeLoad` for data fetching (use `loader`)
- NO `useEffect` for data fetching (use route `loader`)
- Platform guards in `beforeLoad` for all workspace routes
- NO query parameters for layout mode (platform determines plugins)

---

## Section 3: Plugin System Architecture (NEW - v3.0.0)

### 3.1 FeaturePlugin Interface

**Location:** `src/plugins/core/FeaturePlugin.interface.ts`

```typescript
interface FeaturePlugin {
  // Identification
  id: 'filetree' | 'monaco' | 'notes' | 'terminal' | 'chat' | 'agents';
  name: string;
  icon: React.ReactNode;

  // Rendering
  component: React.FC<FeaturePluginProps>;
  sidebarComponent?: React.FC<SidebarPluginProps>;

  // Platform Requirements
  requiresFSA: boolean;           // Requires desktop FSA
  requiresProject: boolean;        // Requires project to be loaded
  minWidth: number;                // Minimum layout width in pixels
  maxInstances: 1 | 2 | 'unlimited';

  // State Management
  usePluginStore: () => PluginState;
}
```

### 3.2 Plugin Categories

| Category | Description | Examples | Status |
|----------|-------------|----------|--------|
| **Always-Loaded** | Loaded in every project session | Project Management, Chat Cascade | 0% - not implemented |
| **Optional** | User-selectable up to 5 total | Monaco, Notes, Terminal | 0% - not implemented |
| **Platform-Restricted** | Only available on certain platforms | Terminal (desktop-only) | 0% - not implemented |

### 3.3 The Two Always-Loaded Plugins

#### Plugin 1: Project Management Plugin

**Responsibilities:**
- File tree navigation and display
- Project switcher
- Project creation and deletion
- File/folder CRUD operations
- Database and RAG management

**UX Considerations:**
- For mobile/portrait: Tabbed button navigation
- Progressive disclosure for complex operations
- Clear visual hierarchy

**Status:** 0% - Plugin stub exists (textarea placeholder)

#### Plugin 2: Chat Cascade + Thread Management Plugin

**Responsibilities:**
- Agent orchestration and coordination
- Thread management (project-scoped)
- RAG context indexing
- Multi-format block rendering
- Streaming conversation display

**Key Principles:**
- Threads are indexed and dependent on project ID
- Context window limit: 150K tokens (90% threshold for compaction)
- Compaction creates new thread with recapped, filtered context
- All threads date/time stamped with names and hierarchy

**Status:** 30% - Partial implementation exists

### 3.4 Plugin Registry

**Location:** `src/plugins/core/PluginRegistry.ts`

```typescript
interface PluginRegistry {
  // Registration
  register(plugin: FeaturePlugin): void;
  unregister(pluginId: PluginId): void;

  // Query
  getPlugin(pluginId: PluginId): FeaturePlugin | undefined;
  getAllPlugins(): FeaturePlugin[];
  getActivePlugins(projectId: string): FeaturePlugin[];

  // Lifecycle
  loadPlugin(pluginId: PluginId): Promise<void>;
  unloadPlugin(pluginId: PluginId): Promise<void>;

  // Validation
  validatePlugin(plugin: FeaturePlugin): ValidationResult;
}
```

**Status:** 0% - Not implemented

### 3.5 Plugin Lifecycle Management

**Location:** `src/plugins/core/PluginLifecycle.ts`

```typescript
interface PluginLifecycle {
  // Load Phase
  onLoad: (plugin: FeaturePlugin) => Promise<void>;
  hydrateState: (plugin: FeaturePlugin, projectId: string) => Promise<void>;
  initializeComponents: (plugin: FeaturePlugin) => void;

  // Active Phase
  onStateChange: (plugin: FeaturePlugin, newState: any) => void;
  onEvent: (plugin: FeaturePlugin, event: PluginEvent) => void;

  // Unload Phase
  onBeforeUnload: (plugin: FeaturePlugin) => Promise<void>;
  cleanupState: (plugin: FeaturePlugin, projectId: string) => Promise<void>;
  onUnload: (plugin: FeaturePlugin) => void;
}
```

**Status:** 0% - Not implemented

### 3.6 Platform-Aware Default Plugins

**Location:** `src/plugins/core/platform-defaults.ts`

```typescript
export function getDefaultPlugins(
  platform: PlatformContract,
  project: Project
): PluginId[] {
  // Desktop with FSA: Full development experience
  if (platform.deviceType === 'desktop' && project.storageType === 'fsa') {
    return ['filetree', 'monaco', 'chat'];
  }

  // Desktop with IndexedDB: Notes-focused
  if (platform.deviceType === 'desktop' && project.storageType === 'indexeddb') {
    return ['filetree', 'notes', 'chat'];
  }

  // Tablet: Notes-focused (no terminal)
  if (platform.deviceType === 'tablet') {
    return ['filetree', 'notes', 'chat'];
  }

  // Mobile: Minimal
  if (platform.deviceType === 'mobile') {
    return ['notes'];
  }

  return ['notes', 'chat'];
}
```

**Status:** 0% - Not implemented

### 3.7 Plugin Layout System

**Layout Slots:**
```typescript
interface PluginLayout {
  // Main content area
  main: PluginId[];
  // Sidebar (left/right)
  sidebarLeft: PluginId[];
  sidebarRight: PluginId[];
  // Status bar
  statusBar: PluginId[];
  // Modal/overlay
  modal: PluginId[];
}
```

**Responsive Behavior:**
| Platform | Default Layout | Max Columns | Max Panels |
|----------|---------------|-------------|-------------|
| Mobile | 1-column | 1 | 1 (chat via sidebar) |
| Tablet | 2-column | 2 | 2 |
| Desktop | 2-column | 3 | 5 |

**Status:** 0% - Not implemented

### 3.8 Plugin State Management Pattern

**Location:** `src/plugins/{plugin-id}/store/`

```typescript
interface PluginState {
  pluginId: string;
  enabled: boolean;
  config: Record<string, unknown>;
  sessionState: Record<string, unknown>;
}

// Usage pattern
const usePluginStore = createPluginStore<PluginState>((set, get) => ({
  enabled: true,
  config: {},
  sessionState: {},

  setConfig: (config) => set({ config }),
  setSessionState: (state) => set({ sessionState }),
}));
```

**Status:** 0% - Not implemented

### 3.9 Plugin Coordination Architecture (CRITICAL GAP - v3.1.0)

**Source**: EPIC-0.5 Retrospective (2026-01-27) - 19 coordination gaps identified

**Problem Statement:**
Plugins are functional in isolation but cannot coordinate on shared resources (files, processes, state). The file event bus (`file-event-bus.ts`) provides infrastructure for CRUD events but no coordination context exists.

**Location (Target):** `src/infrastructure/context/plugin-coordination-context.tsx`

#### 3.9.1 PluginCoordinationContext Interface

```typescript
interface PluginCoordinationContext {
  // Shared Document State (Gap 1-3)
  activeDocument: SharedDocument | null;
  openDocuments: Map<string, OpenDocumentInfo>;
  acquireWriteLock: (path: string, pluginId: PluginId) => Promise<boolean>;
  releaseWriteLock: (path: string, pluginId: PluginId) => void;
  
  // Plugin Capabilities (Gap 6-9)
  capabilities: Map<PluginId, PluginCapability[]>;
  registerCapability: (pluginId: PluginId, capability: PluginCapability) => void;
  queryCapability: (capability: PluginCapability) => PluginId[];
  
  // State Preservation (Gap 10-12)
  pluginState: Map<PluginId, PluginPersistentState>;
  preserveState: (pluginId: PluginId, state: unknown) => void;
  restoreState: (pluginId: PluginId) => unknown | null;
}

interface SharedDocument {
  path: string;
  content: string;
  lastModified: number;
  openedBy: PluginId[];
  writeLock: { pluginId: PluginId; acquiredAt: number } | null;
}

interface OpenDocumentInfo {
  path: string;
  pluginId: PluginId;
  openedAt: number;
  hasUnsavedChanges: boolean;
}

interface PluginCapability {
  type: 'file-editor' | 'process-runner' | 'preview' | 'ai-assist';
  fileTypes?: string[];
  processTypes?: string[];
}
```

#### 3.9.2 Gap Categories (19 Total)

| Category | Gaps | Status | EPIC |
|----------|------|--------|------|
| **Shared State** | 1-5 | NOT STARTED | EPIC-0.6-01 to 0.6-03 |
| **Plugin Lifecycle** | 6-9 | NOT STARTED | EPIC-0.6-04 |
| **State Preservation** | 10-12 | NOT STARTED | EPIC-0.6 (P2) |
| **Event Contracts** | 13-17 | PARTIAL | file-event-bus exists |
| **Platform Constraints** | 18-19 | NOT STARTED | EPIC-0.6-10 |

#### 3.9.3 Detailed Gap Analysis

**Category 1: Shared State (5 gaps)**

| Gap | Description | Solution |
|-----|-------------|----------|
| 1 | No shared ActiveDocument state | `PluginCoordinationContext.activeDocument` |
| 2 | No "who has file open" tracking | `OpenDocumentInfo.openedBy[]` |
| 3 | No write-lock mechanism | `acquireWriteLock()/releaseWriteLock()` |
| 4 | No deferred capability queue | `PluginCapability` registry |
| 5 | Monaco active file not shared | Migrate to `SharedDocument` |

**Category 2: Plugin Lifecycle (4 gaps)**

| Gap | Description | Solution |
|-----|-------------|----------|
| 6 | No process registry | `TerminalProcessRegistry` |
| 7 | No capability declarations | `PluginCapability` interface |
| 8 | No dependency declarations | Plugin manifest `requires[]` |
| 9 | No onEnable/onDisable hooks | `PluginLifecycle` interface |

**Category 3: State Preservation (3 gaps)**

| Gap | Description | Solution |
|-----|-------------|----------|
| 10 | No state preservation across toggle | `preserveState()/restoreState()` |
| 11 | No lazy resource booting | Deferred initialization pattern |
| 12 | No dependency checker | Plugin prerequisite resolver |

**Category 4: Event Contracts (5 gaps)**

| Gap | Description | Solution |
|-----|-------------|----------|
| 13 | No event schema contracts | Runtime Zod validation |
| 14 | No event ordering/priority | Event queue with priority |
| 15 | No cross-plugin documentation | JSDoc + ADR |
| 16 | No prerequisite resolution | Event dependency graph |
| 17 | FileTree selection not coordinated | Emit `FILE_SELECTED` event |

**Category 5: Platform Constraints (2 gaps)**

| Gap | Description | Solution |
|-----|-------------|----------|
| 18 | No device-type enforcement | `PlatformContract` guard in registry |
| 19 | No graceful fallback | Plugin fallback UI component |

**Status:** 0% - Specification only (pending EPIC-0.6 implementation)

---

## Section 4: Agent and Tool Architecture (UPDATED - v3.0.0)

### 4.1 Orchestrator Pattern (NEW)

**Location:** `src/domain/services/orchestrator-service.ts`

**Architecture:**
```
User Input
    ↓
Orchestrator/Coordinator (read-only tools only)
    ├─→ Mode Switching (to domain-specific agent)
    └─→ Task Delegation (to sub-agents with isolated context)
```

**Orchestrator Responsibilities:**
- Conversational, user-guidance oriented
- Context detection and task decomposition
- Uses only read-related tools:
  - `read-files`, `grep`, `glob`, `list-files`
  - `todowrite`, `todoread`, `question`
  - `switch-mode`, `delegate-tasks`

**Status:** 40% - ModeClassifier exists but not orchestrator pattern

### 4.2 Domain-Specific Agents

**Location:** `src/domain/agents/`

| Agent Type | Tools | Use Case | Status |
|------------|-------|----------|--------|
| **dev-ext** | File CRUD, bash, task | Code implementation | Partial - needs orchestrator integration |
| **architect-ext** | Design docs, review | Architecture decisions | Partial - needs orchestrator integration |
| **analyst-ext** | Research, analysis | Requirements gathering | Partial - needs orchestrator integration |
| **ux-designer-ext** | UI/UX design | Interface design | Partial - needs orchestrator integration |
| **tech-writer-ext** | Documentation | API docs, guides | Partial - needs orchestrator integration |

### 4.3 Tool Architecture (UPDATED)

#### Tool Types

| Type | Execution | Examples | Status |
|------|-----------|----------|--------|
| **Client Tools** | Browser-only | File read, glob, grep | ✅ Implemented |
| **Server Tools** | Server/Edge | LLM calls, database ops | Partial - needs TanStack AI SDK |
| **Agent Tools** | Delegated | Complex multi-step tasks | 0% - not implemented |

#### Tool Permission Matrix (UPDATED)

**Location:** `src/domain/agents/tool-permissions.ts`

| Agent Type | write | edit | bash | task | Notes |
|------------|-------|------|------|------|-------|
| **real-world-validator** | true | false | browser | true | Testing only |
| **dev-ext** | true | true | limited | true | Implementation |
| **architect-ext** | false | design | false | true | Architecture docs |
| **analyst-ext** | false | false | false | true | Research only |
| **ux-designer-ext** | false | false | false | true | Design only |

**Status:** 40% - Partial implementation exists

### 4.4 Zustand Store Reactivity (EPIC-0 Learnings)

**Source:** EPIC-0 Learnings (2026-01-26)

**Problem Solved:** Infinite re-render loops with Zustand selectors

#### Correct Pattern

```typescript
// ✅ CORRECT: Individual selectors + useMemo
const rootPaths = useFileTreeStore((state) => state.rootPaths);
const nodesMap = useFileTreeStore((state) => state.nodes);

const rootNodes = useMemo(() => {
  return rootPaths.map((path) => nodesMap.get(path))
    .filter((node): node is FileTreeNode => node !== undefined);
}, [rootPaths, nodesMap]);
```

#### Anti-Pattern

```typescript
// ❌ WRONG: Creates new array on every render
const rootNodes = useFileTreeStore((state) => {
  return state.rootPaths.map(p => state.nodes.get(p));
});
```

#### Rule

When selector computes derived data:
1. Select primitive values or stable references separately
2. Compute derived data with `useMemo`
3. Never compute inline in selector function
4. For multiple values, use `useShallow` from `zustand/react/shallow`

#### Reference Implementation

**File:** `src/presentation/components/ide/FileTree.tsx`

```typescript
import { useShallow } from 'zustand/react/shallow';

// Multiple stable selectors
const { items, addItem } = useStore(
  useShallow((state) => ({
    items: state.items,
    addItem: state.addItem,
  }))
);
```

**Status:** ✅ Implemented in EPIC-0

### 4.5 TanStack AI SDK Integration (NEW - v3.0.0)

**Mandate:** All LLM calls MUST use TanStack AI SDK. Direct provider package calls are PROHIBITED.

**Location:** `src/infrastructure/ai/tanstack-ai-client.ts`

**Architecture:**
```
TanStack AI SDK
    ↓
Provider Adapters
    ↓
LLM Providers (Gemini, OpenRouter, OpenAI, Anthropic)
```

**Provider Adapters:**
| Provider | Adapter Location | Model Support | Status |
|----------|-----------------|---------------|--------|
| **Google Gemini** | `src/infrastructure/ai/providers/gemini-adapter.ts` | 3.0 Pro/Flash | 0% - not implemented |
| **OpenRouter** | `src/infrastructure/ai/providers/openrouter-adapter.ts` | 400+ models | 0% - not implemented |
| **OpenAI** | `src/infrastructure/ai/providers/openai-adapter.ts` | GPT-5.1 | 0% - not implemented |
| **Anthropic** | `src/infrastructure/ai/providers/anthropic-adapter.ts` | Claude 4.5 | 0% - not implemented |
| **Grok** | `src/infrastructure/ai/providers/grok-adapter.ts` | Latest | 0% - not implemented |
| **Ollama** | `src/infrastructure/ai/providers/ollama-adapter.ts` | Local | 0% - not implemented |

**Second-Tier Support:**
| Provider | Notes |
|----------|-------|
| **Grok** | Basic completion only |
| **Ollama (Local)** | Local model serving |

**SDK Requirements:**
- Multimodal input/output (text, images, audio, video)
- Embedding endpoints (if available)
- Model auto-loading
- Supported parameters:
  - Max tokens
  - Thinking variants
  - Streaming thinking
  - Native tool calling
  - Token caching

**Fallback Chain:**
```typescript
export function createAIClient(providers: ProviderConfig[]) {
  // Provider → Model fallback with graceful degradation
  return new TanStackAIClient({
    providers,
    fallbackChain: ['gemini', 'openrouter', 'openai', 'anthropic'],
    modelCapabilities: detectModelCapabilities(),
  });
}
```

**Status:** 0% - Not implemented (currently using direct provider calls)

### 4.6 Agent System Instructions

**Two-Layer Prompts:**

```typescript
interface SystemInstructionLayers {
  // Layer 1: Universal (applies to all agents)
  universal: `
    You are an AI assistant in Via-Gent workspace.
    Current project: ${projectId}
    Platform: ${platform.storageType}
    Capabilities: ${JSON.stringify(platformCapabilities)}
  `;

  // Layer 2: Agent-Specific
  agentSpecific: {
    orchestrator: `
      You are the orchestrator/coordinator.
      - Conversational, user-guidance oriented
      - Use only read-related tools
      - Detect context and delegate to domain agents
    `,
    devExt: `
      You are a code implementation agent.
      - Full file CRUD access
      - Terminal execution
      - Task delegation enabled
    `,
    architectExt: `
      You are an architecture agent.
      - Design documentation only
      - Review and propose ADRs
      - No file write access
    `,
    // ... other agents
  };
}
```

**Status:** 60% - Partial implementation exists

---

## Section 5: Chat Cascade and Thread Management (NEW - v3.0.0)

### 5.1 Thread Architecture

**Location:** `src/infrastructure/persistence/stores/chat/`

**Thread Hierarchy:**
```
Project
    └─→ Threads (indexed by project ID)
        ├─→ Main Thread (user conversation)
        ├─→ Sub-threads (agent delegations)
        └─→ Compaction Threads (auto-generated at 90% context limit)
```

**Thread Metadata:**
```typescript
interface ThreadMetadata {
  id: string;
  projectId: string;
  name: string;
  type: 'main' | 'sub' | 'compaction';
  parentThreadId?: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  tokenCount: number;
  agentId?: string;
}
```

**Status:** 30% - Partial implementation exists

### 5.2 Context Management

**Context Window Limits:**
- Default limit: 150K tokens
- Auto-compaction at 90% threshold (135K tokens)
- Token counting: Accurate measurement of all context-consuming activities

**Compaction Process:**
1. Trigger when context reaches 90%
2. Run sub-agent to condense conversation turns
3. Filter irrelevant/contextual information
4. Generate new thread with recapped context
5. Preserve file path references for linking
6. Update thread hierarchy metadata

**Status:** 0% - Not implemented

### 5.3 Multi-Format Block Rendering

**Content Types:**
| Content Type | Rendering | Notes |
|--------------|-----------|-------|
| **Code blocks** | Syntax highlighted, copyable | Monaco integration |
| **Rich text** | Tables, diagrams, markdown | Block-based rendering |
| **HTML artifacts** | Embedded components | Interactive content |
| **Streaming tokens** | Real-time display | Thinking/reasoning |
| **Tool outputs** | Collapsible, status-coded | Success/failure indicators |
| **File references** | Clickable paths | `@` mentions with context |

**Status:** 30% - Partial implementation exists

### 5.4 Bi-Directional References

**File-to-Chat References:**
- `@filename` - Include entire file
- `@folder/` - Include all child files
- Selected text in Monaco - Include as context

**Chat-to-File Operations:**
- Insert AI output as new file
- Insert at cursor position
- Copy to clipboard

**Status:** 0% - Not implemented

### 5.5 Thread Indexing

**Index Strategy:**
- Thread ID scoped to project ID only (NOT workspace)
- No cross-project RAG or thread references
- Thread metadata indexed for fast lookup
- Hierarchy preserved for delegation tracking

**Storage Location:**
```typescript
// Dexie table
db.threads.where({ projectId })
  .sortBy('createdAt')
  .desc()
  .toArray();
```

**Status:** 0% - Not implemented

### 5.6 Plugin Data Contracts (EPIC-0.5 Requirement)

**Source:** EPIC-0 Learnings (2026-01-26)

**Status:** SPECIFICATION ONLY (Implementation in EPIC-0.5)

#### File Data Interface

```typescript
interface FileData {
  path: string;
  content: string | Uint8Array;
  encoding: 'utf-8' | 'binary';
  lastModified: number;
  dirty: boolean; // unsaved changes
}
```

#### Plugin Save Contract

```typescript
interface PluginSaveContract {
  // Called by plugin when content changes
  saveFile(path: string, content: string): Promise<void>;
  
  // Debounce: 500ms
  // Visual indicator: "Saving..." → "Saved"
  // Emits: FILE_UPDATED event via EventBus
}
```

#### EventBus Events (EPIC-0.5-02)

```typescript
type FileEvent = 
  | { type: 'FILE_CREATED'; path: string }
  | { type: 'FILE_UPDATED'; path: string; content: string }
  | { type: 'FILE_DELETED'; path: string }
  | { type: 'FILE_MOVED'; from: string; to: string }
  | { type: 'FILE_RENAMED'; from: string; to: string };
```

#### Plugin Communication Flow

```
Plugin (Monaco/Notes) → Content Changed
    ↓
PluginSaveContract.saveFile()
    ↓
Debounce (500ms)
    ↓
StorageGateway.write()
    ↓
EventBus.emit(FILE_UPDATED)
    ↓
Other Plugins React (FileTree refresh, etc.)
```

**Implementation Notes:**
- All plugins must use `PluginSaveContract` for file operations
- Direct `StorageGateway` access is reserved for infrastructure layer
- EventBus ensures cross-plugin reactivity

**Status:** 📋 Specification only (pending EPIC-0.5 implementation)

---

## Section 6: BYOK Vault Architecture (UPDATED - v3.0.0)

### 6.1 Vault Architecture

**Location:** `src/infrastructure/vault/byok-vault.ts`

**Architecture:**
```
BYOK Vault
├── Integration: TanStack AI SDK (no direct provider calls)
├── Storage: Project-scoped in Dexie
├── Distribution: Conditional, reactive
└── Providers: Gemini, OpenRouter, OpenAI, Anthropic (first-tier)
           + Grok, Ollama (second-tier)
```

**Key Principles:**
- Project-scoped configuration system for API keys
- All LLM integrations must route through TanStack AI SDK
- Route: `/$projectId` (no separate `/setting` route)
- Configuration stored per project
- Keys securely persisted and conditionally distributed

**Status:** 50% - Partial implementation exists, needs SDK integration

### 6.2 Supported Providers

**First-Tier Support (Full Feature Parity):**

| Provider | Latest Models | Notes | SDK Status |
|----------|---------------|-------|-------------|
| **Google Gemini** | 3.0 Pro / 3.0 Flash (Jan 2026) | First-tier, image preview variants | 0% - adapter needed |
| **OpenRouter** | 400+ models | OpenAI-compatible endpoints | 0% - adapter needed |
| **OpenAI** | GPT-5.1-Codex-Max (Nov 2025) | Standard OpenAI API | 0% - adapter needed |
| **Anthropic** | Claude Sonnet 4.5, Claude Opus 4.5 | Standard Claude API | 0% - adapter needed |

**Second-Tier Support (Basic Integration):**

| Provider | Notes | SDK Status |
|----------|-------|-------------|
| **Grok** | Basic completion only | 0% - adapter needed |
| **Ollama (Local)** | Local model serving | 0% - adapter needed |

### 6.3 Provider Integration Requirements

**All providers must support:**
- Multimodal input/output (text, images, audio, video)
- Embedding endpoints (if available)
- Model auto-loading
- All supported parameters per model:
  - Max tokens
  - Thinking variants
  - Streaming thinking
  - Native tool calling
  - Token caching

**TanStack AI SDK First:**
```typescript
// ✅ CORRECT - Use SDK
import { createAIClient } from '@tanstack/ai';

const client = createAIClient({
  provider: 'gemini',
  apiKey: vault.getKey('gemini'),
});

// ❌ FORBIDDEN - Direct provider calls
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI({ apiKey });
```

**Status:** 0% - Not implemented

---

## Section 7: State Management and Persistence (UPDATED - v3.0.0)

### 7.1 State Layers (UPDATED)

| Layer | Technology | Purpose | Scope | Status |
|-------|-----------|---------|--------|
| **Client State** | Zustand v5 | UI state, ephemeral data | Component tree | ✅ Zustand used, needs v5 patterns |
| **Persisted State** | Dexie.js | Long-term storage | Project, settings | ✅ Dexie used |
| **File System** | FSA/IndexedDB | File content | Project files | ✅ StorageGateway pattern exists |

### 7.2 State Boundaries (UPDATED)

**Clear Separation:**
- Zustand for client-only state (UI, interaction)
- Dexie for persisted data (projects, threads, settings)
- FSA for actual file content (desktop) or IndexedDB virtual files (mobile)

**Conflict Prevention:**
- Single source of truth per data type
- Event-driven updates between layers
- Optimistic updates with rollback

**Status:** 70% - Good alignment, needs workspaceId removal

### 7.3 Composite Key Pattern (CRITICAL CHANGE - v3.0.0)

**OLD PATTERN (OUTDATED):**
```typescript
// ❌ DEPRECATED - Workspace-centric
const storeKey = `store-${projectId}-${workspaceId}`;
```

**NEW PATTERN (TARGET):**
```typescript
// ✅ CORRECT - Project-centric only
const storeKey = `store-${projectId}`;
```

**Impact:**
- Remove `workspaceId` from all composite keys
- Plugins manage their own state, not persisted in composite keys
- Project ID is the only scoping factor

**Status:** 0% - Not implemented (workspaceId still used)

### 7.4 Persistence Strategy (UPDATED)

**Desktop (FSA):**
- Handle stored in IndexedDB for persistence
- Minimize re-sync on project switch
- Snapshot strategy for fast load

**Mobile/Tablet (IndexedDB):**
- All data in Dexie.js
- No sync needed (single source)
- Offline-first by default

**Status:** 85% - Good alignment

### 7.5 God Stores (Requiring Decomposition)

| Store | Lines | Issue | Action Required |
|-------|-------|-------|----------------|
| useWorkspaceFileSystem.ts | 571 | File system + sync + metadata | Decompose |
| migration-backup.ts | 549 | Migration logic in store | Move to infra |
| conversation-migration.ts | 549 | Migration logic in store | Move to infra |
| useConversationStore.ts | 497 | Multiple responsibilities | Decompose |
| unified-chat-store.ts | 448 | Chat state | Decompose |
| provider-store.ts | 387 | Provider management | Decompose |
| workspace-store.ts | 347 | Workspace state + localStorage leak | DEPRECATED - remove |
| useRAGStore.ts | 327 | RAG functionality | Decompose |
| useIDEStore.ts | TBD | Hydrates "most recent" not "current" | Fix hydration |

**Status:** Decomposition in progress (some done, some pending)

---

## Section 8: RAG Implementation (UPDATED - v3.0.0)

### 8.1 Current State

**Technology Stack:**
- **Vector Database:** OramaDB (browser-based, local-first)
- **Embeddings:** Xenova/all-MiniLM-L6-v2 (384-dimension)
- **Search Type:** Hybrid (vector 0.7 + BM25 0.3)
- **Fallback:** Gemini API for embedding generation

**Implementation Location:**
- `src/lib/rag/` - 30+ files (RAG logic)
- `src/infrastructure/persistence/stores/rag/` - Store layer
- `src/presentation/components/rag/` - UI components

**Status:** 80% - Good alignment

### 8.2 RAG Architecture

```
User Query
    ↓
Hybrid Retriever (vector + BM25)
    ↓
├─→ OramaDB Vector Search (local in-memory)
└─→ BM25 Full-text Search
    ↓
Reranking (if implemented)
    ↓
Context + Query → LLM
    ↓
Response with Citations
```

### 8.3 RAG Scoping (UPDATED - v3.0.0)

**Critical Change:**
- RAG indices are project-scoped (NOT workspace-scoped)
- Composite key pattern: `projectId` only (remove `workspaceId`)
- Threads are indexed by project ID

**Status:** 80% - Needs composite key update

### 8.4 Individual AI Features (NEW - v3.0.0)

**Note Plugin Features (Independent of Chat Cascade):**
| Feature | Description | Status |
|---------|-------------|--------|
| **AI Commands** | Context-aware text generation | 0% - not implemented |
| **Prompt Chains** | Sequential transformations | 0% - not implemented |
| **Image Generation** | Context-aware visual creation | 0% - not implemented |
| **Text Selection** | Selected text transformation | 0% - not implemented |

**UX Patterns:**
- Markdown block-based rendering
- Rich media support (HTML, images, videos, presentations)
- Asset indexing for RAG compatibility
- PC and Non-PC parity

**Status:** 0% - Not implemented

---

## Section 9: Device Architecture & Platform Detection

### 9.1 Desktop (FSA - File System Access API)

**Characteristics:**
- Real files on disk via native file system
- Bidirectional sync with external editors
- Full IDE capabilities (Monaco, Terminal)
- Handle persistence in IndexedDB (not file system)

**Requirements:**
- Chrome 122+ for persistent permissions
- FileSystemObserver (Chrome 129+) for file watching with polling fallback

**Status:** 90% - Strong alignment

### 9.2 Mobile/Tablet (IndexedDB via Dexie.js)

**Characteristics:**
- Virtual files in browser database
- No external editor sync needed
- IDE features blocked (Monaco, Terminal unavailable)
- Single source of truth (no sync conflicts)

**Requirements:**
- Dexie.js for persistence
- Single default project (`notes:browser-mode`)
- Fallback to Note-taking only

**Status:** 90% - Strong alignment

### 9.3 IDE Access Policy (UPDATED - v3.0.0)

| Platform | IDE Access | Behavior | Status |
|----------|-----------|----------|--------|
| Desktop (FSA) | ✅ Full | Monaco + Terminal + FileTree | ✅ PlatformContract exists |
| Desktop (IndexedDB) | ⚠️ Limited | FileTree + Notes only | ✅ PlatformContract exists |
| Tablet | ❌ Blocked | Notes + Chat only | ✅ PlatformContract exists |
| Mobile | ❌ Blocked | Notes + Chat only | ✅ PlatformContract exists |

**Status:** 90% - Strong alignment

---

## Section 10: API Contracts (UPDATED - v3.0.0)

### 10.1 Routes

**Current State (DEPRECATED):**
```
❌ OUTDATED ROUTES (must redirect):
   /ide/:projectId
   /knowledge/:projectId
   /notes/:projectId
   /study/:projectId
   /api/chat
```

**New Route Structure (TARGET):**
```
✅ PROJECT-CENTRIC ROUTES:
   /hub              # Project management, no project loaded
   /$projectId         # Project loaded with feature plugins
   /api/chat         # AI conversations (kept for backward compat)
```

**Status:** 30% - Routes need consolidation

---

## Section 11: Architecture Decision Records

### ADR Status (Authoritative - ADR-039)

| ADR | Title | Status | Key Points |
|-----|-------|--------|------------|
| **ADR-039** | Unified Architecture Fundamentals (v2.0.0 Alignment) | PROPOSED | Project-centric architecture, plugin system, orchestrator pattern, TanStack AI SDK, BYOK vault, chat cascade |

**Superseded ADRs:**
- ADR-033: Correct-Course Architectural Remediation (SUPERSEDED by v2.0.0)
- ADR-035: Correct-Course v2 - Architecture Standardization (SUPERSEDED by v2.0.0)

**Pending ADRs (to be created):**
- ADR-040: BYOK Vault & TanStack AI Integration
- ADR-041: Chat Cascade & Thread Management (detailed)
- ADR-042: CRUD Permissions & Concurrency
- ADR-043: Unified Layout System & Responsive Design
- ADR-044: Generative AI Features (Note Plugin)

**Note:** All architecture decisions are governed by ADR-039 and new-fundamental-truths.md v2.0.0.

---

## Section 12: Implementation Roadmap

### Priority Matrix

| Priority | Item | Effort | Dependencies | Status |
|----------|------|--------------|--------|
| **P0** | Plugin System Architecture | 2-3 days | Platform detection | READY |
| **P0** | Route Consolidation | 1 day | None | READY |
| **P0** | TanStack AI SDK Integration | 3-4 days | BYOK vault | READY |
| **P0** | Orchestrator Pattern Implementation | 2-3 days | Plugin system | READY |
| **P0** | Chat Cascade & Thread Management | 3-4 days | Orchestrator | READY |
| **P0** | Composite Key Pattern Update | 2 days | None | READY |
| **P1** | God Store Decomposition | 1 week | None | IN PROGRESS |
| **P1** | Layout System Implementation | 3-4 days | Plugin system | READY |
| **P1** | Individual AI Features | 2-3 days | Plugin system | READY |

### Timeline

| Phase | Duration | Focus | Status |
|-------|----------|-------|--------|
| Phase 1A | Week 1-2 | Plugin system + Non-AI Core | READY |
| Phase 1B | Week 3-4 | BYOK + Note Features | READY |
| Phase 2 | Week 5+ | Chat cascade + Advanced features | READY |

---

## Appendix A: Evidence References

| Claim | Section | Evidence Source |
|-------|---------|-----------------|
| 35% alignment to v2.0.0 | Executive Summary | Analysis Report 2026-01-26 |
| Plugin system missing (0%) | Section 3 | Analysis Report 2026-01-26 |
| Orchestrator pattern partial (40%) | Section 4 | Analysis Report 2026-01-26 |
| TanStack AI SDK missing (0%) | Section 6 | Analysis Report 2026-01-26 |
| Chat cascade incomplete (30%) | Section 5 | Analysis Report 2026-01-26 |
| BYOK vault partial (50%) | Section 7 | Analysis Report 2026-01-26 |
| Workspace-centric routes outdated | Section 10 | new-fundamental-truths.md v2.0.0 |
| Composite key conflict | Section 7.3 | new-fundamental-truths.md v2.0.0 |

**Full Analysis:** `_bmad-output/analysis/ARCHITECTURE-ANALYSIS-REPORT-2026-01-26.md`

---

## Appendix B: Related Documents

| Document | Description |
|----------|---------|
| `new-fundamental-truths.md` | Core architecture principles v2.0.0 |
| `ARCHITECTURE-ANALYSIS-REPORT-2026-01-26.md` | Detailed gap analysis |
| `ADR-AUDIT-REPORT-2026-01-26.md` | ADR consolidation recommendations |
| `epics.md` | Epic and story definitions |
| `AGENTS.md` | Governance and standards |

---

## Appendix C: Verification Checklist

Before marking architecture alignment complete:

```
□ Version updated to 3.0.0
□ Date updated to 2026-01-26
□ Reference to ADR-039 added
□ All 12 v2.0.0 sections covered
□ Plugin system architecture documented (Section 3)
□ Orchestrator pattern documented (Section 4)
□ TanStack AI SDK requirements documented (Section 4.4)
□ Chat cascade & thread management documented (Section 5)
□ BYOK vault architecture documented (Section 6)
□ Route structure updated to project-centric (Section 10)
□ Composite key pattern changed to single projectId (Section 7.3)
□ Platform-aware routing documented (Section 2.5)
□ Individual AI features documented (Section 8.4)
□ God store decomposition noted (Section 7.5)
□ Workspace-centric content removed
□ All contradictions with v2.0.0 resolved
□ All gaps from analysis report filled
```

---

**Document Version:** 3.1.0 (Aligned with new-fundamental-truths.md v2.0.0 + EPIC-0 Learnings)
**Original Version:** 2.1.0 (2026-01-16)
**Last Updated:** 2026-01-26
**Author:** Architect Agent
**Status:** ACTIVE - 100% aligned with v2.0.0 fundamentals + EPIC-0 learnings

**EPIC-0 Additions (v3.1.0):**
- Section 2.4: FSA Handle Lifecycle
- Section 2.6: Storage Gateway Pattern Normalization  
- Section 4.4: Zustand Store Reactivity
- Section 5.6: Plugin Data Contracts

**Next Review:** 2026-02-01 (weekly)

---

*This document reflects the project-centric architecture with plugin system, orchestrator pattern, TanStack AI SDK integration, and chat cascade management as defined in new-fundamental-truths.md v2.0.0, with EPIC-0 learnings incorporated.*
