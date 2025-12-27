---
title: Via-gent Project Architecture Analysis
date: 2025-12-27
time: 12:20 UTC
phase: Research & Analysis
team: Team A (Antigravity)
agent_mode: project-research
version: 1.0.0
status: COMPLETE
tags: [architecture, analysis, documentation, via-gent, webcontainer, ai-agent]
---

# Via-gent Project Architecture Analysis

**Document ID**: `ARCH-ANALYSIS-2025-12-27-001`
**Created**: 2025-12-27T12:20:04Z
**Author**: Project Research Mode
**Version**: 1.0.0

## Executive Summary

This document provides a comprehensive analysis of the Via-gent project architecture—a browser-based IDE with WebContainers and AI agent capabilities. The analysis covers project type detection, architecture patterns, codebase structure mapping, and critical architectural decisions. Via-gent represents a sophisticated integration of modern web technologies including React 19, TypeScript, Vite, TanStack Router, WebContainers, and AI agent infrastructure using TanStack AI.

**Key Findings**:
- **Project Type**: Single-Page Application (SPA) with server-side rendering capability, deployed to Cloudflare Workers
- **Architecture Pattern**: Feature-based modular architecture with clear separation of concerns
- **State Management**: Zustand stores with Dexie.js persistence (6 stores total)
- **AI Integration**: Multi-provider AI system using TanStack AI with provider adapter pattern
- **File System**: File System Access API integration with WebContainer mirror pattern
- **Routing**: TanStack Router file-based routing with API endpoints

**Critical Architectural Decisions**:
1. Local File System as Source of Truth
2. Singleton WebContainer Pattern
3. Provider Adapter Pattern for AI Abstraction
4. IndexedDB for Persistent State, localStorage for Agent Configuration
5. No Reverse Sync from WebContainer to Local FS

---

## 1. Project Type Detection

### 1.1 Frontend Framework and Architecture

Via-gent is built on a modern JavaScript stack designed for browser-based development environments. The project utilizes **React 19** as the UI framework, providing the latest React features including concurrent rendering and improved type safety. The application is configured with **Vite 7.3** as the build tool and development server, offering fast HMR and optimized production builds.

The routing layer uses **TanStack Router** (v0.22+), a type-safe router for React applications that provides file-based route generation with automatic type inference. The project also integrates **TanStack Start** for server-side rendering capabilities, though the IDE route explicitly disables SSR (`ssr: false`) due to WebContainer compatibility requirements.

**Framework Stack**:
- **UI Framework**: React 19.0.0 with TypeScript
- **Build Tool**: Vite 7.3.1 with cross-origin isolation plugin
- **Routing**: TanStack Router with file-based route structure
- **Server Runtime**: Cloudflare Workers (via TanStack Start)
- **Package Manager**: pnpm with workspace support

### 1.2 State Management Patterns

The project has completed a comprehensive migration to **Zustand** for client-side state management, eliminating all legacy TanStack Store usage. The state architecture follows a layered approach with clear separation between persisted, ephemeral, and UI state:

**State Architecture Layers**:

```
┌─────────────────────────────────────────────────────────────┐
│                    UI State (React Context)                  │
│         WorkspaceContext, ThemeContext, ToastContext         │
├─────────────────────────────────────────────────────────────┤
│              Ephemeral State (Zustand - In-Memory)           │
│    useStatusBarStore, useFileSyncStatusStore (no persistence)│
├─────────────────────────────────────────────────────────────┤
│             Persisted State (Zustand + IndexedDB)            │
│           useIDEStore - openFiles, activeFile, panels        │
├─────────────────────────────────────────────────────────────┤
│            Agent State (Zustand + localStorage)              │
│        useAgentsStore, useAgentSelectionStore                │
├─────────────────────────────────────────────────────────────┤
│              Project State (Dexie.js IndexedDB)              │
│     ProjectStore, ConversationStore, FileMetadata            │
└─────────────────────────────────────────────────────────────┘
```

**Zustand Stores** (6 total):
1. [`useIDEStore`](src/lib/state/ide-store.ts) - IDE state (open files, active file, panels) - persisted to IndexedDB
2. [`useStatusBarStore`](src/lib/state/statusbar-store.ts) - StatusBar state (WC status, sync status, cursor) - ephemeral
3. [`useFileSyncStatusStore`](src/lib/state/file-sync-status-store.ts) - File sync progress - ephemeral
4. [`useAgentsStore`](src/stores/agents.ts) - Agent configuration - persisted to localStorage
5. [`useAgentSelectionStore`](src/stores/agent-selection.ts) - Selected agent state - persisted to localStorage
6. Additional stores for workspace and file operations

**Persistence Strategy**:
- **IndexedDB (via Dexie.js)**: IDE state, project metadata, conversations, file metadata
- **localStorage**: Agent configurations, API keys (via Credential Vault), selected agent
- **In-memory (Zustand)**: Status indicators, sync progress, terminal state

### 1.3 Key Architectural Patterns

#### WebContainer Integration Pattern
The project implements a **singleton WebContainer pattern** managed by [`WebContainerManager`](src/lib/webcontainer/manager.ts). This pattern ensures only one WebContainer instance exists per page, with lazy initialization and boot promise caching for optimal performance.

**WebContainer Lifecycle**:
```
Initial Request → Check Singleton → Return Existing OR Boot New → Mount Files → Ready
```

**Key Features**:
- `boot()` method with promise caching prevents duplicate boots
- `mount()` method syncs local files to WebContainer
- `spawn()` method for running commands in the container
- Event bus integration for lifecycle state management
- Server-ready callbacks for preview functionality

#### File System Sync Pattern
The file system follows a **Local FS as Source of Truth** pattern with unidirectional sync to WebContainer:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Local FS (FSA) │ ←→  │  LocalFSAdapter  │ ←→  │   SyncManager   │
│  (Source of     │     │  (File System    │     │  (Sync Logic)   │
│   Truth)        │     │   Access API)    │     │                 │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
        ↑                                                │
        │                                                ↓
┌─────────────────┐                              ┌─────────────────┐
│  IndexedDB      │                              │  WebContainer   │
│  (ProjectStore) │                              │  (Mirror)       │
└─────────────────┘                              └─────────────────┘
```

**Sync Exclusions**:
- `.git` directories
- `node_modules` (regenerated in WebContainer)
- `.DS_Store`, `Thumbs.db` (system files)
- Other patterns defined in sync configuration

#### AI Agent Provider Pattern
The AI agent system implements a **provider adapter pattern** that abstracts differences between AI providers:

```
┌─────────────────────────────────────────────────────────────────┐
│                     UI Layer (React Components)                  │
│         AgentChatPanel, AgentConfigDialog, useAgentChat          │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Hook Layer (TanStack AI)                      │
│              useAgentChatWithTools, createChatAdapter            │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Provider Adapter Factory                       │
│         providerAdapterFactory.createAdapter(providerId)         │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Provider Adapters                             │
│         OpenRouter, Anthropic, OpenAI (OpenAI-compatible)        │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Tool Execution Layer                         │
│         readFileDef, writeFileDef, listFilesDef, executeCommand  │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Facade Layer                                  │
│         AgentFileTools, AgentTerminalTools (WebContainer)        │
└─────────────────────────────────────────────────────────────────┘
```

### 1.4 Build Tooling Configuration

**Vite Configuration** ([`vite.config.ts`](vite.config.ts)):
The project requires critical cross-origin isolation headers for WebContainer compatibility:

```typescript
// Required headers for WebContainer SharedArrayBuffer support
res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
```

**Critical Requirements**:
- `crossOriginIsolationPlugin` must be FIRST in the plugins array
- Missing headers break WebContainer functionality entirely
- Headers required for both development and production builds

**TypeScript Configuration** ([`tsconfig.json`](tsconfig.json)):
- Path alias: `@/*` → `./src/*`
- Strict mode enabled with `noUnusedLocals` and `noUnusedParameters`
- `verbatimModuleSyntax: false` for ESM compatibility
- JSX transformation configured for React 19

---

## 2. Architecture Pattern Analysis

### 2.1 Component Organization Patterns

The project follows a **feature-based modular architecture** where components are organized by domain functionality rather than technical type. This approach provides clear separation of concerns and improves maintainability.

**Component Directory Structure**:
```
src/components/
├── agent/              # AI agent configuration and dialogs
│   ├── AgentConfigDialog.tsx
│   ├── index.ts
│   └── __tests__/
├── chat/               # Chat interface components
│   ├── ApprovalOverlay.tsx
│   ├── CodeBlock.tsx
│   ├── StreamingMessage.tsx
│   ├── ToolCallBadge.tsx
│   ├── DiffPreview.tsx
│   ├── index.ts
│   └── __tests__/
├── ide/                # IDE components
│   ├── Editor.tsx
│   ├── Terminal.tsx
│   ├── FileTree.tsx
│   ├── Preview.tsx
│   ├── AgentChatPanel.tsx
│   ├── index.ts
│   └── __tests__/
├── ui/                 # Reusable UI components
│   ├── Toast.tsx
│   ├── Dialog.tsx
│   ├── Button.tsx
│   ├── index.ts
│   └── __tests__/
├── layout/             # Layout components
│   ├── IDELayout.tsx
│   ├── IDEHeaderBar.tsx
│   ├── MainLayout.tsx
│   ├── hooks/
│   ├── index.ts
│   └── __tests__/
└── common/             # Shared components
    ├── ErrorBoundary.tsx
    ├── AppErrorBoundary.tsx
    └── index.ts
```

**Component Design Principles**:
1. **Barrel Exports**: Each directory has `index.ts` for clean imports
2. **TypeScript Interfaces**: Props defined as interfaces (not type aliases)
3. **Test Co-location**: Tests in adjacent `__tests__/` directory
4. **Feature Ownership**: Components belong to single feature domain

### 2.2 Library Module Organization

The `lib/` directory contains the core business logic and infrastructure:

```
src/lib/
├── agent/              # AI agent infrastructure
│   ├── facades/        # Agent tool facades
│   │   ├── AgentFileTools.ts
│   │   ├── AgentTerminalTools.ts
│   │   ├── FileLock.ts
│   │   └── index.ts
│   ├── providers/      # Provider adapters
│   │   ├── provider-adapter.ts
│   │   ├── model-registry.ts
│   │   ├── credential-vault.ts
│   │   └── index.ts
│   ├── tools/          # Agent tools
│   │   ├── read.ts
│   │   ├── write.ts
│   │   ├── list.ts
│   │   ├── execute.ts
│   │   ├── index.ts
│   │   └── __tests__/
│   ├── hooks/          # React hooks
│   │   ├── use-agent-chat.ts
│   │   └── index.ts
│   └── index.ts
├── filesystem/         # File system operations
│   ├── local-fs-adapter.ts
│   ├── sync-manager.ts
│   ├── sync-types.ts
│   ├── permission-lifecycle.ts
│   └── index.ts
├── webcontainer/       # WebContainer management
│   ├── manager.ts
│   ├── process-manager.ts
│   ├── terminal-adapter.ts
│   ├── types.ts
│   └── index.ts
├── workspace/          # Workspace state
│   ├── WorkspaceContext.tsx
│   ├── project-store.ts
│   ├── conversation-store.ts
│   ├── file-sync-status-store.ts
│   └── index.ts
├── editor/             # Monaco editor
│   ├── editor-config.ts
│   └── index.ts
├── events/             # Event system
│   ├── workspace-events.ts
│   ├── use-workspace-event.ts
│   └── index.ts
├── state/              # Zustand stores
│   ├── ide-store.ts
│   ├── statusbar-store.ts
│   └── index.ts
├── persistence/        # Persistence utilities
│   └── index.ts
└── monitoring/         # Observability
    └── sentry.ts
```

### 2.3 Routing Patterns

The project uses **TanStack Router** with file-based routing. Routes are defined in the `src/routes/` directory and auto-generated into `routeTree.gen.ts`.

**Route Structure**:
```
src/routes/
├── __root.tsx              # Root route with providers
├── index.tsx               # Home/landing page
├── ide.tsx                 # IDE workspace (SSR disabled)
├── workspace/
│   └── $projectId.tsx      # Dynamic workspace route
├── agents.tsx              # Agent management
├── settings.tsx            # Settings page
├── knowledge.tsx           # Knowledge base
├── hub.tsx                 # Hub/home interface
└── api/
    └── chat.ts             # AI chat API endpoint
```

**Key Route Characteristics**:
- `/ide` - Main IDE workspace with `ssr: false` (WebContainer requirement)
- `/workspace/$projectId` - Project-specific workspace
- `/api/chat` - Server-side AI chat endpoint with SSE streaming

**Route Generation**:
- `routeTree.gen.ts` is auto-generated (DO NOT EDIT MANUALLY)
- VS Code configured to mark as read-only
- Changes require route file modifications + regeneration

### 2.4 API Route Structure

The `/api/chat` endpoint ([`src/routes/api/chat.ts`](src/routes/api/chat.ts)) provides AI chat functionality with Server-Sent Events (SSE) streaming:

**Endpoint Specifications**:
- **Method**: POST (GET for health check)
- **Path**: `/api/chat`
- **Content-Type**: `text/event-stream` (SSE)
- **Authentication**: API key passed in request body (IndexedDB unavailable server-side)

**Request Schema**:
```typescript
interface ChatRequest {
    messages: Array<{ role: 'user' | 'assistant' | 'tool'; content: string }>;
    providerId?: string;      // Default: 'openrouter'
    modelId?: string;         // Default: 'mistralai/devstral-2512:free'
    apiKey: string;           // REQUIRED - from client-side credentialVault
    disableTools?: boolean;   // Debug flag
    customBaseURL?: string;   // OpenAI-compatible provider support
    customHeaders?: Record<string, string>;
}
```

**Provider Support**:
- OpenRouter (default)
- OpenAI
- Anthropic
- Custom OpenAI-compatible endpoints

**Tool Definitions**:
- `readFileDef` - Read file contents
- `writeFileDef` - Write file contents
- `listFilesDef` - List directory contents
- `executeCommandDef` - Execute terminal command

**Model Tool Support**:
- Some models do NOT support function calling (e.g., deepseek-chat)
- Blocklist maintained in code for known incompatible models
- Automatic detection based on model name patterns

---

## 3. Codebase Structure Mapping

### 3.1 Directory Structure Overview

```
via-gent/
├── .agent/                 # AI agent rules and prompts
├── .cursor/                # Cursor IDE configuration
├── .vscode/                # VS Code settings
├── agent-os/               # Agent operating standards
├── _bmad/                  # BMAD framework configuration
├── _bmad-output/           # BMAD output artifacts
│   ├── documentation/      # This document
│   ├── sprint-artifacts/
│   ├── course-corrections/
│   └── epics/
├── docs/                   # Technical documentation
├── netlify/                # Netlify deployment config
├── public/                 # Static assets
├── server/                 # Server middleware
├── src/                    # Source code
│   ├── components/         # React components
│   ├── data/               # Demo data
│   ├── hooks/              # Custom React hooks
│   ├── i18n/               # Internationalization
│   ├── lib/                # Core libraries
│   ├── routes/             # TanStack Router routes
│   └── types/              # TypeScript types
├── .eslintrc.mjs           # ESLint config
├── .gitignore
├── .prettierrc             # Prettier config
├── i18next-scanner.config.cjs  # i18n extraction
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
└── vite.config.ts          # Vite config
```

### 3.2 Key Modules and Responsibilities

| Module | Location | Responsibility |
|--------|----------|----------------|
| **Agent System** | `src/lib/agent/` | AI agent infrastructure, tools, providers |
| **File System** | `src/lib/filesystem/` | FSA integration, sync management |
| **WebContainer** | `src/lib/webcontainer/` | WebContainer lifecycle, process management |
| **Workspace** | `src/lib/workspace/` | Workspace context, project persistence |
| **State** | `src/lib/state/` | Zustand stores for IDE state |
| **Editor** | `src/lib/editor/` | Monaco editor integration |
| **Events** | `src/lib/events/` | Event bus, workspace events |
| **Components** | `src/components/` | UI components by feature |

### 3.3 Component Hierarchy

**Main Layout Hierarchy**:
```
App (entry)
└── TanStackRouter (routing)
    └── Route Components
        ├── IndexRoute (home)
        ├── IDE Route (/ide)
        │   └── WorkspaceProvider
        │       └── MainLayout
        │           ├── IDELayout
        │           │   ├── IDEHeaderBar
        │           │   ├── ResizablePanels
        │           │   │   ├── FileTree
        │           │   │   ├── EditorPanel
        │           │   │   │   └── MonacoEditor
        │           │   │   ├── PreviewPanel
        │           │   │   │   └── Preview
        │           │   │   └── TerminalPanel
        │           │   │       └── XTerminal
        │           │   └── AgentChatPanel
        │           └── ToastProvider
        └── API Routes (/api/chat)
            └── Server Handler
```

### 3.4 Service/Utility Layer Organization

**Utility Layers** (from high-level to low-level):

1. **React Components** (UI Layer)
   - Feature-specific components
   - Hook-based state access
   - Translation integration (i18next)

2. **Custom Hooks** (Integration Layer)
   - `useIDEState` - IDE state management
   - `useFileOperations` - File system operations
   - `useAgentChat` - AI chat functionality
   - `useWorkspace` - Workspace context

3. **Library Modules** (Business Logic Layer)
   - Agent system (tools, providers, facades)
   - File system (adapter, sync, permissions)
   - WebContainer (manager, processes, terminal)
   - Workspace (context, store, conversations)

4. **State Management** (Data Layer)
   - Zustand stores (6 stores)
   - Dexie.js IndexedDB
   - localStorage (agent config)

5. **Infrastructure** (System Layer)
   - Vite build system
   - TanStack Router
   - Cloudflare Workers
   - Event bus system

### 3.5 Test Organization Patterns

Tests follow the **co-location pattern** with tests adjacent to source files:

```
src/
├── lib/
│   └── agent/
│       ├── tools/
│       │   ├── read.ts
│       │   ├── __tests__/
│       │   │   └── read.test.ts
│       │   └── index.ts
│       └── providers/
│           ├── provider-adapter.ts
│           └── __tests__/
│               └── provider-adapter.test.ts
└── components/
    ├── chat/
    │   ├── ApprovalOverlay.tsx
    │   └── __tests__/
    │       └── ApprovalOverlay.test.tsx
    └── ide/
        └── __tests__/
```

**Test Configuration** ([`vitest.config.ts`](vitest.config.ts)):
- React components: `jsdom` environment
- Library tests: `node` environment
- File System Access API: Mocked with `vi.mock()`
- IndexedDB: Mocked with `fake-indexeddb`

---

## 4. Critical Architectural Decisions

### 4.1 Local File System as Source of Truth

**Decision**: The browser's File System Access API is the authoritative source for file content, with WebContainer acting as a mirror.

**Rationale**:
1. **Data Sovereignty**: Users own their files; the IDE is a tool, not a lock-in
2. **Persistence**: Local files persist across sessions; WebContainer is ephemeral
3. **Portability**: Files can be accessed outside the IDE
4. **Security**: No unexpected file modifications from WebContainer processes

**Implementation**:
- `LocalFSAdapter` wraps File System Access API
- `SyncManager` handles unidirectional sync to WebContainer
- File changes in local FS trigger sync events
- WebContainer changes do NOT sync back (e.g., `npm install`)

**Trade-offs**:
- ✗ WebContainer-only changes (npm install) require separate handling
- ✗ File permissions must be granted per session (unless persisted)
- ✓ User maintains full control over files
- ✓ No data lock-in

**Reference**: [`src/lib/filesystem/local-fs-adapter.ts`](src/lib/filesystem/local-fs-adapter.ts), [`src/lib/filesystem/sync-manager.ts`](src/lib/filesystem/sync-manager.ts)

### 4.2 Singleton WebContainer Pattern

**Decision**: Only one WebContainer instance exists per browser page, managed by a singleton pattern with lazy initialization.

**Rationale**:
1. **Resource Constraints**: WebContainers are resource-intensive
2. **Browser Limitations**: COOP/COEP headers limit cross-origin isolation
3. **State Management**: Single instance ensures consistent state
4. **Performance**: Boot caching prevents duplicate initialization

**Implementation**:
```typescript
// Singleton pattern with promise caching
class WebContainerManager {
    private static instance: WebContainerManager | null = null;
    private bootPromise: Promise<WebContainer> | null = null;
    
    static getInstance(): WebContainerManager {
        if (!instance) {
            instance = new WebContainerManager();
        }
        return instance;
    }
    
    async boot(): Promise<WebContainer> {
        if (!this.bootPromise) {
            this.bootPromise = WebContainer.boot();
        }
        return this.bootPromise;
    }
}
```

**Trade-offs**:
- ✓ Efficient resource usage
- ✓ Consistent state across components
- ✗ No multi-project WebContainer support (single project per tab)
- ✗ Boot time (~3-5 seconds) impacts initial load

**Reference**: [`src/lib/webcontainer/manager.ts`](src/lib/webcontainer/manager.ts)

### 4.3 File Sync Exclusions Strategy

**Decision**: Certain directories and file types are excluded from WebContainer sync.

**Excluded Patterns**:
- `.git` - Git metadata (large, not needed in container)
- `node_modules` - Dependencies (regenerated via npm install)
- `.DS_Store`, `Thumbs.db` - System files
- Custom patterns via configuration

**Rationale**:
1. **Performance**: Large directories slow sync
2. **Storage**: node_modules can be gigabytes
3. **Redundancy**: Dependencies regenerated in WebContainer
4. **Compatibility**: Git operations use local git, not WebContainer git

**Implementation**:
```typescript
const SYNC_EXCLUSIONS = [
    /^\.git/,
    /node_modules/,
    /^\.DS_Store/,
    /Thumbs\.db/,
    // Additional patterns...
];
```

**Trade-offs**:
- ✓ Faster sync times
- ✓ Reduced storage usage
- ✗ node_modules regeneration adds startup delay
- ✗ Git operations limited to local git

### 4.4 State Persistence Strategy

**Decision**: Multi-layer persistence strategy based on data characteristics.

**Persistence Layers**:

| Data Type | Storage | Rationale |
|-----------|---------|-----------|
| IDE State (open files, panels) | IndexedDB | Large, structured, needs persistence |
| Project Metadata | IndexedDB | Structured, queryable |
| Agent Configurations | localStorage | Small, simple, frequent access |
| API Keys (Credential Vault) | IndexedDB | Sensitive, structured |
| Status Indicators | In-memory | Ephemeral, high-frequency updates |
| File Content | Local FS | User-owned, large |

**Implementation**:
- Zustand with `persist` middleware for IndexedDB
- Direct localStorage for agent config
- Dexie.js for complex IndexedDB operations
- React Context for UI state

**Reference**: [`src/lib/state/ide-store.ts`](src/lib/state/ide-store.ts), [`src/lib/workspace/project-store.ts`](src/lib/workspace/project-store.ts)

### 4.5 AI Agent Provider Adapter Pattern

**Decision**: Abstract AI provider differences behind a unified adapter interface.

**Rationale**:
1. **Provider Flexibility**: Support multiple providers (OpenRouter, Anthropic, OpenAI)
2. **API Consistency**: Unified interface regardless of backend
3. **Testing**: Easy to mock providers during development
4. **Extensibility**: Add new providers without changing consumer code

**Implementation**:
```typescript
interface ProviderAdapter {
    createChat(modelId: string, apiKey: string, config: Config): ChatAdapter;
    testConnection(apiKey: string): Promise<boolean>;
    getModels(): Model[];
}

class OpenRouterAdapter implements ProviderAdapter { /* ... */ }
class AnthropicAdapter implements ProviderAdapter { /* ... */ }
class OpenAIAdapter implements ProviderAdapter { /* ... */ }
```

**Supported Providers**:
- OpenRouter (default, most flexible)
- OpenAI (GPT models)
- Anthropic (Claude models)
- Custom OpenAI-compatible endpoints

**Trade-offs**:
- ✓ Provider flexibility
- ✓ Consistent API
- ✗ Adapter maintenance for each provider
- ✗ Provider-specific quirks may leak through

**Reference**: [`src/lib/agent/providers/provider-adapter.ts`](src/lib/agent/providers/provider-adapter.ts), [`src/lib/agent/providers/model-registry.ts`](src/lib/agent/providers/model-registry.ts)

### 4.6 No Reverse Sync from WebContainer

**Decision**: Changes made within WebContainer (e.g., `npm install`, file writes by processes) do NOT sync back to the local file system.

**Rationale**:
1. **Complexity**: Bidirectional sync introduces conflict resolution challenges
2. **Performance**: Real-time reverse sync adds latency
3. **User Intent**: Local files are source of truth; WebContainer is execution environment
4. **Scope**: MVP scope limits to essential functionality

**Trade-offs**:
- ✗ WebContainer-only changes are lost on refresh
- ✗ `npm install` in terminal doesn't update local package.json
- ✓ Simpler architecture
- ✓ Clear data flow
- ✓ User maintains control

**Mitigation**:
- Users can manually sync if needed
- Terminal output shows command results
- Clear UX indication of WebContainer-only changes

---

## 5. Integration Points and Data Flow

### 5.1 File System Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        User Action                                   │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    File System Access API                            │
│              (showDirectoryPicker, FileSystemFileHandle)             │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    LocalFSAdapter                                    │
│    (readFile, writeFile, listFiles, watchChanges)                   │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
              ┌──────────────┴──────────────┐
              ↓                             ↓
┌─────────────────────────┐    ┌─────────────────────────────┐
│   IndexedDB (Project)   │    │     WebContainer Mount      │
│   (metadata, history)   │    │  (file content sync)        │
└─────────────────────────┘    └─────────────────────────────┘
```

### 5.2 AI Agent Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    User Message in Chat UI                           │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                 useAgentChatWithTools Hook                           │
│        (message history, streaming state, tool execution)            │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    Provider Adapter Factory                          │
│              (creates OpenAI/Anthropic/etc. adapter)                 │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    /api/chat Endpoint (SSE)                         │
│         (TanStack AI, streaming response, tool definitions)          │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    Tool Execution (Client-Side)                      │
│           (AgentFileTools, AgentTerminalTools)                       │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    WebContainer Operations                           │
│           (file read/write, terminal command execution)              │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.3 State Synchronization Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    User Interaction                                  │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    Zustand Store Update                              │
│              (immediate in-memory update)                            │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
              ┌──────────────┴──────────────┐
              ↓                             ↓
┌─────────────────────────┐    ┌─────────────────────────────┐
│   Persistence Layer     │    │      React Re-render        │
│   (Dexie IndexedDB)     │    │   (UI updates)              │
│   (async, debounced)    │    │   (immediate)               │
└─────────────────────────┘    └─────────────────────────────┘
```

---

## 6. Identified Architectural Inconsistencies

### 6.1 State Duplication in IDELayout (P0)

**Issue**: [`IDELayout.tsx`](src/components/layout/IDELayout.tsx) duplicates IDE state with local `useState` instead of using [`useIDEStore`](src/lib/state/ide-store.ts).

**Affected State**:
- `isChatVisible` - Should use `useIDEStore(s => s.chatVisible)`
- `terminalTab` - Should use `useIDEStore(s => s.terminalTab)`
- `openFiles` - Should use `useIDEStore` with local file content cache
- `activeFilePath` - Should use `useIDEStore(s => s.activeFile)`

**Impact**:
- State synchronization issues between components
- Potential data loss if state not properly synced
- Violates single source of truth principle

**Recommended Fix** (deferred to avoid MVP-3 interference):
1. Replace local `useState` with Zustand hooks
2. Add local `fileContentCache` Map for ephemeral content
3. Update `useIDEFileHandlers` to work with Zustand actions
4. Remove duplicate synchronization code (lines 142-148)

**Reference**: [`_bmad-output/state-management-audit-p1.10-2025-12-26.md`](_bmad-output/state-management-audit-p1.10-2025-12-26.md)

### 6.2 Missing Error Boundary Hierarchy

**Issue**: Error boundaries not consistently applied across component tree.

**Impact**:
- Single error can crash entire IDE
- Poor user experience on errors
- Difficult debugging

**Recommended Fix**:
1. Add error boundaries at feature boundaries
2. Implement graceful degradation
3. Add error reporting (Sentry integration exists but not fully utilized)

### 6.3 Inconsistent Import Order

**Issue**: Import order convention documented but not enforced.

**Convention**:
1. React imports
2. Third-party libraries
3. Internal modules with `@/` alias
4. Relative imports

**Impact**:
- Code style inconsistency
- Harder code review
- Potential import conflicts

**Recommended Fix**:
1. Add ESLint import order rule
2. Run formatter on existing code
3. Document in `AGENTS.md`

---

## 7. Technical Debt Assessment

### 7.1 High Priority Technical Debt

| Item | Description | Impact | Effort |
|------|-------------|--------|--------|
| State Duplication | IDELayout duplicates IDE state | Medium | Medium |
| Agent Loop Limitation | maxIterations(3) temporary fix | Medium | High |
| Error Boundary Coverage | Missing boundaries | Medium | Low |

### 7.2 Medium Priority Technical Debt

| Item | Description | Impact | Effort |
|------|-------------|--------|--------|
| Import Order | Not enforced | Low | Low |
| Test Coverage | Limited coverage | Medium | High |
| Documentation | Some modules undocumented | Low | Medium |

### 7.3 Low Priority Technical Debt

| Item | Description | Impact | Effort |
|------|-------------|--------|--------|
| Component Naming | Some inconsistencies | Low | Low |
| Type Exports | Not all types exported | Low | Low |
| Comments | Some outdated comments | Low | Low |

---

## 8. Dependencies and References

### 8.1 Core Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| react | 19.0.0 | UI framework |
| @tanstack/react-router | 0.22.x | Routing |
| @tanstack/react-start | 1.x | SSR framework |
| @tanstack/ai | 1.x | AI integration |
| zustand | 5.x | State management |
| dexie | 4.x | IndexedDB |
| @webcontainer/api | 1.x | Browser Node.js |
| monaco-editor | 0.52.x | Code editor |
| @xterm/xterm | 0.15.x | Terminal |
| tailwindcss | 4.x | Styling |
| @radix-ui/react-* | 1.x | UI primitives |
| i18next | 24.x | i18n |

### 8.2 Documentation References

| Document | Path | Purpose |
|----------|------|---------|
| Architecture | `docs/2025-12-23/architecture.md` | High-level architecture |
| Tech Context | `docs/2025-12-23/tech-context.md` | Technology stack details |
| Flows & Workflows | `docs/2025-12-23/flows-and-workflows.md` | Data flow diagrams |
| State Management Audit | `_bmad-output/state-management-audit-2025-12-24.md` | State architecture |
| MVP Sprint Plan | `_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md` | Sprint planning |
| AGENTS.md | `AGENTS.md` | Development guidelines |

### 8.3 External Documentation

| Library | Documentation URL |
|---------|-------------------|
| TanStack Router | https://tanstack.com/router |
| TanStack AI | https://tanstack.com/ai |
| WebContainer API | https://developer.stackblitz.com/platform/api/webcontainer-api |
| Zustand | https://zustand.docs.pmnd.rs |
| Dexie.js | https://dexie.org |
| Radix UI | https://www.radix-ui.com/primitives |
| Monaco Editor | https://microsoft.github.io/monaco-editor/ |
| xterm.js | http://xtermjs.org |

---

## 9. Conclusion

The Via-gent project demonstrates a well-architected browser-based IDE with clear separation of concerns, modern technology choices, and thoughtful integration patterns. The architecture successfully combines:

1. **WebContainer Technology**: Enables full Node.js environment in browser
2. **AI Agent Integration**: Multi-provider support with tool execution
3. **File System Access**: Local-first approach with WebContainer sync
4. **Modern State Management**: Zustand with IndexedDB persistence
5. **Type-Safe Routing**: TanStack Router with file-based routes

**Key Strengths**:
- Clear architectural boundaries
- Feature-based component organization
- Provider adapter pattern for extensibility
- Comprehensive state management strategy
- Strong TypeScript typing

**Areas for Improvement**:
- State duplication in IDELayout (documented, deferred)
- Error boundary coverage
- Import order enforcement
- Test coverage expansion

The project is well-positioned for continued development with the MVP epic providing a focused vertical slice of functionality. The BMAD framework integration ensures structured development with proper artifact tracking and validation.

---

## 10. Appendices

### A. File Reference Index

| File Path | Description | Lines |
|-----------|-------------|-------|
| `src/lib/state/ide-store.ts` | IDE Zustand store | ~200 |
| `src/lib/webcontainer/manager.ts` | WebContainer singleton | ~250 |
| `src/lib/agent/providers/provider-adapter.ts` | Provider adapter factory | ~150 |
| `src/routes/api/chat.ts` | AI chat API endpoint | ~275 |
| `src/components/layout/IDELayout.tsx` | Main IDE layout | ~200 |
| `vite.config.ts` | Vite configuration | ~248 |

### B. Glossary

| Term | Definition |
|------|------------|
| WebContainer | Browser-based Node.js runtime by StackBlitz |
| FSA | File System Access API (browser API) |
| SSE | Server-Sent Events (streaming) |
| COOP/COEP | Cross-Origin-Opener-Policy / Cross-Origin-Embedder-Policy |
| Zustand | Lightweight state management library |
| Dexie.js | IndexedDB wrapper library |
| TanStack Router | Type-safe router for React |
| TanStack AI | AI integration library |

### C. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-27 | Project Research Mode | Initial analysis document |

---

**Document End**

*This document was created as part of the Via-gent project architecture analysis. For questions or updates, contact the development team or refer to the BMAD artifacts in `_bmad-output/`.*