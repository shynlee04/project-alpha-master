# Codebase Diagnostic Report

**Date**: 2026-01-28 11:58:30
**Purpose**: Reality scan for governance alignment
**Vision Document**: `new-fundamental-truths.md` v2.0.0

---

## Executive Summary

1. **Route Structure**: PARTIALLY IMPLEMENTED - `/$projectId` exists but legacy routes (`/settings`, `/agents`, `/projects`, `/debug`) also exist and are NOT redirecting
2. **Plugin Architecture**: MOSTLY IMPLEMENTED - `FeaturePlugin` interface exists with 6 plugins registered (filetree, monaco, notes, terminal, chat, preview), but `agents` plugin is missing
3. **Platform Detection**: FULLY IMPLEMENTED - Comprehensive detection for desktop/mobile/tablet with FSA support checks
4. **State Management**: PARTIAL GOD STORES - 3 stores exceed 500 lines (file-tree-store: 536, slash-command-store: 541, saved-blocks-store: 514)
5. **Agent System**: PARTIAL IMPLEMENTATION - useAgentChat hooks exist, tool catalog with modes, but NO hierarchical orchestrator pattern implemented
6. **File System**: FULLY IMPLEMENTED - FSA gateway + IndexedDB gateway with proper factory pattern

---

## 1. Route Structure

### Claimed (Vision)
> "The application has exactly **two routes**: `/hub` and `/$projectId`"
> "All deprecated routes redirect to `/$projectId`"
> "No query parameters for 'layout mode'"

### Actual (Code)

**Routes Found** (14 total):
```
src/routes/__root.tsx              - Root layout
src/routes/index.tsx               - / (Hub)
src/routes/$projectId.tsx          - /$projectId (Project Route) 
src/routes/$projectId.test.tsx     - /$projectId/test (Test route)
src/routes/settings.tsx            - /settings (LEGACY - NOT redirecting)
src/routes/agents.tsx              - /agents (LEGACY - NOT redirecting)
src/routes/projects.tsx            - /projects (LEGACY - NOT redirecting)
src/routes/debug.tsx               - /debug (Debug route)
src/routes/about.tsx               - /about
src/routes/about.lazy.tsx          - /about (lazy)
src/routes/test-error-boundary.tsx - /test-error-boundary
src/routes/test-fs-adapter.tsx     - /test-fs-adapter
src/routes/webcontainer.$.tsx      - /webcontainer/$
src/routes/$__debug__.provider-playground.tsx - /__debug__/provider-playground
```

**Critical Finding**: Legacy routes `/settings`, `/agents`, `/projects` exist as standalone routes with their own components - they are NOT redirecting to `/$projectId` as the vision claims.

### Gap Analysis: PARTIAL

| Claim | Reality | Status |
|-------|---------|--------|
| Two routes only (hub, $projectId) | 14 routes exist | MISSING |
| Deprecated routes redirect | No redirects implemented | MISSING |
| No layout mode params | Correct - no params | IMPLEMENTED |
| /$projectId route exists | Yes, with full implementation | IMPLEMENTED |

---

## 2. Plugin Architecture

### Claimed (Vision)
> `FeaturePlugin` interface with id, name, icon, requirements, components
> Plugins: filetree, monaco, notes, terminal, chat, agents
> Plugin registry filters by platform capabilities

### Actual (Code)

**FeaturePlugin Interface** - IMPLEMENTED (`src/domain/interfaces/feature-plugin.interface.ts`):
```typescript
interface FeaturePlugin {
  id: PluginId;
  name: string;
  icon: React.ReactNode;
  description: string;
  requirements: PluginRequirements;  // storageType, deviceType, minWidth, maxInstances
  MainComponent: React.FC<PluginMainProps>;
  SidebarComponent?: React.FC<PluginSidebarProps>;
  ToolbarComponent?: React.FC<PluginToolbarProps>;
  onMount?: (context: ProjectContext) => Promise<void>;
  onUnmount?: () => Promise<void>;
  onProjectChange?: (newProjectId: string) => Promise<void>;
  capabilities?: PluginCapability[];
  dependsOn?: PluginId[];
}
```

**Plugin Registry** - IMPLEMENTED (`src/infrastructure/plugins/plugin-registry.ts`):
- Singleton Map-based registry
- `registerPlugin()`, `getPlugin()`, `getAvailablePlugins()`, `getAllPlugins()`
- Filters by storageType and deviceType

**PluginId Type** (`src/domain/types/plugin-types.ts`):
```typescript
type PluginId = 'filetree' | 'monaco' | 'notes' | 'terminal' | 'chat' | 'agents' | 'preview';
```

**Plugins Implemented** (6 of 7 - agents missing):

| Plugin | index.ts | MainComponent | usePlugin Hook | Status |
|--------|----------|---------------|----------------|--------|
| filetree | Yes | FileTreePlugin.tsx | useFileTreePlugin.ts | IMPLEMENTED |
| monaco | Yes | MonacoPlugin.tsx | useMonacoPlugin.ts | IMPLEMENTED |
| notes | Yes | NotesPlugin.tsx | useNotesPlugin.ts | IMPLEMENTED |
| terminal | Yes | TerminalPlugin.tsx | useTerminalPlugin.ts | IMPLEMENTED |
| chat | Yes | ChatPlugin.tsx | useChatPlugin.ts | IMPLEMENTED |
| preview | Yes | PreviewPlugin.tsx | - | IMPLEMENTED |
| agents | MISSING | MISSING | MISSING | NOT IMPLEMENTED |

### Gap Analysis: MOSTLY IMPLEMENTED

| Claim | Reality | Status |
|-------|---------|--------|
| FeaturePlugin interface | Fully defined with all properties | IMPLEMENTED |
| Plugin registry | Module-level singleton with filtering | IMPLEMENTED |
| 6 plugin types defined | 7 defined (agents, preview added) | IMPLEMENTED |
| All plugins implemented | 6/7 - agents plugin missing | PARTIAL |
| Platform-aware filtering | getAvailablePlugins() filters by context | IMPLEMENTED |

---

## 3. Platform Detection

### Claimed (Vision)
> Platform = Device type (desktop, tablet, mobile)
> Platform determines available plugins
> Desktop (FSA) vs Desktop (IndexedDB) vs Tablet vs Mobile

### Actual (Code)

**Platform Detection** - FULLY IMPLEMENTED (`src/infrastructure/filesystem/platform-detection.ts`):
```typescript
- isFSASupported(): boolean  // Check showDirectoryPicker
- isWebContainerSupported(): boolean
- isMobileDevice(): boolean  // User agent patterns
- isTabletDevice(): boolean
- isDesktopDevice(): boolean
- getDeviceType(): 'desktop' | 'mobile' | 'tablet'
- getOptimalStorageType(): 'fsa' | 'indexeddb'
- detectPlatform(): PlatformInfo
- detectCapabilities(): StorageCapabilities
```

**Platform Contract** (`src/infrastructure/filesystem/platform-contract.ts`):
- `getPlatformContract()` - returns typed platform info
- Used throughout codebase for routing decisions

**Device Type Hook** (`src/presentation/hooks/useBreakpointEnhanced.ts`):
- `isMobile`, `isTablet`, `isDesktop` helpers
- Breakpoint-based responsive detection

**Platform Defaults** (`src/infrastructure/plugins/platform-defaults.ts`):
- `getDefaultPluginsForPlatform(platform, project)` - returns PluginId[]
- Desktop+FSA: ['filetree', 'monaco', 'chat']
- Desktop+IndexedDB: ['filetree', 'notes', 'chat']
- Tablet: ['filetree', 'notes', 'chat']
- Mobile: ['notes']

### Gap Analysis: IMPLEMENTED

| Claim | Reality | Status |
|-------|---------|--------|
| Platform detection | Full implementation with caching | IMPLEMENTED |
| FSA support check | showDirectoryPicker detection | IMPLEMENTED |
| Device type routing | desktop/mobile/tablet | IMPLEMENTED |
| Platform-aware defaults | getDefaultPluginsForPlatform() | IMPLEMENTED |

---

## 4. State Management

### Claimed (Vision)
> Zustand v5 for client state (UI, ephemeral)
> Dexie.js for persisted state (projects, threads, settings)
> Clear boundaries between layers
> No state duplication

### Actual (Code)

**Zustand Stores Found** (68+ store files):

**Largest Stores (Line Counts)**:
```
536 lines - file-tree-store.ts           GOD STORE
541 lines - slash-command-store.ts       GOD STORE  
514 lines - saved-blocks-store.ts        GOD STORE
471 lines - plugin-coordination-store.ts (approaching limit)
457 lines - note-file-sync.ts
422 lines - prompt-sharing-service.ts
378 lines - layout-presets-store.ts
377 lines - use-app-store.ts
370 lines - unified-workspace-context.ts
369 lines - prompt-history-store.ts
```

**Dexie Tables** (`src/infrastructure/persistence/dexie-db-class.ts` - 44 tables):
```typescript
// Core
projects, ideState, conversations

// AI Foundation
taskContexts, toolExecutions, credentials, threads

// State Persistence
providerConfigs, agentConfigs, conversationState, ragState, workspaceState

// Sync
syncStatus, fileSyncStatus

// Performance
fileMetadata, toolExecutionLogs, fsaHandles, sessionSnapshots, diagnosticTraces
fileSnapshots, fileContentCache

// Knowledge
sources, collections, synthesisResults, oramaIndexes, embedding_models, notes

// Features
workflows, codeSnippets, savedBlocks, plugins, pluginSettings, pluginMarketplace, pluginStorage

// Study
flashcards, flashcardSets, studySessions, studyCards, quizzes, quizQuestions

// File Storage
idbFiles, terminalState
```

**Boundaries Assessment**:
- Zustand persisted to Dexie via `createDexieStorage()` adapter
- Some stores have both Zustand state AND Dexie persistence (dual state)
- `workspace-store.ts` (226 lines) - well-factored with slices

### Gap Analysis: PARTIAL

| Claim | Reality | Status |
|-------|---------|--------|
| Zustand for client state | 68+ stores, most <300 lines | IMPLEMENTED |
| Dexie for persistence | 44 tables, comprehensive | IMPLEMENTED |
| Clear boundaries | Some dual-state patterns exist | PARTIAL |
| No god stores (>300 lines) | 3 god stores identified | PARTIAL |
| No state duplication | Evidence of some overlap | PARTIAL |

---

## 5. Agent System

### Claimed (Vision)
> Hierarchical orchestrator pattern
> Orchestrator with read-only tools → switch-mode or delegate-tasks
> Domain-specific agents (dev-ext, architect-ext, analyst-ext, etc.)
> Tool permission matrix per agent

### Actual (Code)

**Agent Hooks Found**:
- `useAgentChat` - Basic agent chat hook
- `useAgentChatWithTools` - Extended with client-side tools (725 lines)
- `useAgentsStore` - Agent configuration store

**Tool Catalog** (`src/infrastructure/tools/tool-catalog.ts`):
```typescript
// Mode assignments for tools
files: ['coding', 'orchestrator'],
terminal: ['coding', 'orchestrator'],
knowledge: ['knowledge', 'orchestrator'],
search: ['knowledge', 'coding', 'orchestrator'],
unified: ['coding', 'knowledge', 'orchestrator'],
```

**Tool Permission Store** (`src/infrastructure/persistence/stores/permissions/tool-permission-store.ts`):
- ToolTrustLevel: 'allow' | 'prompt' | 'deny'
- YOLO mode with expiry
- Category approvals
- Workspace-scoped permissions

**State Orchestrator** (`src/infrastructure/persistence/state-orchestrator.ts`):
- Exists but is a STATE orchestrator, not an AGENT orchestrator
- Registers stores and manages cross-store coordination

**Missing Components**:
- NO hierarchical agent orchestrator
- NO mode-switching logic
- NO task delegation system
- NO sub-agent spawning
- NO isolated context threads

### Gap Analysis: PARTIAL

| Claim | Reality | Status |
|-------|---------|--------|
| Orchestrator pattern | State orchestrator only, not agent | MISSING |
| Mode switching | Tool catalog has modes, no switching | PARTIAL |
| Task delegation | Not implemented | MISSING |
| Tool permission matrix | Full implementation | IMPLEMENTED |
| Domain-specific agents | Not implemented in code | MISSING |
| Read-only orchestrator tools | Not separated | MISSING |

---

## 6. File System

### Claimed (Vision)
> FSA for desktop (File System Access API)
> IndexedDB for mobile/tablet
> Handle persistence for re-permission
> Bidirectional sync

### Actual (Code)

**FSA Implementation** (`src/infrastructure/filesystem/`):
- `fsa-gateway.ts` - Full FSAGateway class with CRUD operations
- `fsa-storage-adapter.ts` - Adapter wrapping FSA
- `handle-persistence.ts` - FSA handle storage in Dexie with re-permission
- `showDirectoryPicker()` usage confirmed

**IndexedDB Implementation**:
- `idb-gateway.ts` - IDBGateway for virtual file storage
- `idbFiles` table in Dexie for file content
- Compound key: [projectId, path]

**Storage Gateway Factory** (`src/infrastructure/filesystem/storage-gateway-factory.ts`):
```typescript
create(type: 'fsa' | 'indexeddb', options)
createFSAGateway(directoryHandle)
createIDBGateway(projectId)
```

**Sync Implementation** (`src/infrastructure/sync/`):
- `pointer-sync-service.ts` - Zustand ↔ Dexie sync
- `note-sync-layer.ts` - DexieDB ↔ FSA sync
- `cache-sync.ts` - Bidirectional cache sync

### Gap Analysis: IMPLEMENTED

| Claim | Reality | Status |
|-------|---------|--------|
| FSA for desktop | Full FSAGateway implementation | IMPLEMENTED |
| IndexedDB fallback | IDBGateway with Dexie | IMPLEMENTED |
| Handle persistence | fsaHandles table + re-permission | IMPLEMENTED |
| Bidirectional sync | Multiple sync services | IMPLEMENTED |
| Storage factory | Unified factory pattern | IMPLEMENTED |

---

## Critical Gaps Summary

| Area | Vision Claim | Reality | Status |
|------|--------------|---------|--------|
| **Route Structure** | 2 routes only | 14 routes exist | PARTIAL |
| **Legacy Redirects** | All redirect to /$projectId | No redirects implemented | MISSING |
| **Plugin: agents** | Agents plugin | Not implemented | MISSING |
| **Agent Orchestrator** | Hierarchical pattern | State orchestrator only | MISSING |
| **Mode Switching** | switch-mode tool | Not implemented | MISSING |
| **Task Delegation** | delegate-tasks tool | Not implemented | MISSING |
| **God Stores** | <300 lines each | 3 stores exceed 500 lines | PARTIAL |
| **Settings Route** | Integrated in /$projectId | Separate /settings route | PARTIAL |
| **BYOK Vault Route** | Via project settings | Via /settings route | PARTIAL |

---

## Recommendations

### P0 - Critical Alignment (Needed for Vision Compliance)

1. **Route Consolidation EPIC** (EPIC-ROUTE-CLEANUP)
   - Create redirects from /settings, /agents, /projects → /$projectId
   - Or deprecate vision claim and update architecture docs
   - Estimated: 2-4 hours

2. **Agent Orchestrator EPIC** (EPIC-AGENT-ORCH)
   - Implement hierarchical orchestrator pattern
   - Create switch-mode and delegate-tasks tools
   - Isolate orchestrator to read-only tools
   - Estimated: 8-16 hours

3. **God Store Elimination** (EPIC-STORE-REFACTOR)
   - Split file-tree-store.ts (536 lines) into slices
   - Split slash-command-store.ts (541 lines) into slices
   - Split saved-blocks-store.ts (514 lines) into slices
   - Estimated: 4-6 hours

### P1 - Important Alignment

4. **Agents Plugin Implementation** (STORY)
   - Create src/plugins/agents/ directory
   - Implement AgentsPlugin.tsx with FeaturePlugin interface
   - Wire to plugin registry
   - Estimated: 2-4 hours

5. **Vision Document Update** (STORY)
   - If routes will NOT be consolidated, update new-fundamental-truths.md
   - Mark route claims as "DEFERRED" or "REVISED"
   - Estimated: 1 hour

### P2 - Future Consideration

6. **Thread Management**
   - Project-scoped threads partially exist in Dexie
   - Context compaction not implemented
   - 90% threshold auto-compaction missing

7. **RAG Integration**
   - Tables exist (oramaIndexes, embedding_models)
   - Full RAG pipeline not verified in this scan

---

## Appendix: File Locations

### Core Plugin Architecture
- Interface: `src/domain/interfaces/feature-plugin.interface.ts`
- Registry: `src/infrastructure/plugins/plugin-registry.ts`
- Types: `src/domain/types/plugin-types.ts`
- Defaults: `src/infrastructure/plugins/platform-defaults.ts`

### Platform Detection
- Detection: `src/infrastructure/filesystem/platform-detection.ts`
- Contract: `src/infrastructure/filesystem/platform-contract.ts`

### File System
- FSA Gateway: `src/infrastructure/filesystem/fsa-gateway.ts`
- IDB Gateway: `src/infrastructure/filesystem/idb-gateway.ts`
- Factory: `src/infrastructure/filesystem/storage-gateway-factory.ts`

### State Management
- Dexie DB: `src/infrastructure/persistence/dexie-db-class.ts`
- Tool Permissions: `src/infrastructure/persistence/stores/permissions/tool-permission-store.ts`
- Workspace: `src/infrastructure/persistence/stores/workspace/`

### Agent System
- Chat Hook: `src/lib/agent/hooks/use-agent-chat-with-tools.ts`
- Tool Catalog: `src/infrastructure/tools/tool-catalog.ts`
- Agents Store: `src/stores/agents-store.ts`

---

**Report Generated**: 2026-01-28 11:58:30
**Investigator**: architect-ext
**Timebox**: 30 minutes
**Status**: COMPLETE
