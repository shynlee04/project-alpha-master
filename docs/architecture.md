# Architecture Documentation

Comprehensive architectural overview of the Via-gent project.

## Executive Summary

Via-gent is a browser-based IDE built with React, TypeScript, and Vite. It uses WebContainer API to run Node.js entirely in the browser, enabling local development without a backend server. The architecture follows a **local-first** approach with IndexedDB persistence.

## Architecture Patterns

### Client-Side SPA with SSR
- **Framework**: TanStack Start (React Router + SSR)
- **Rendering**: Client-side with server-side hydration
- **Deployment**: Cloudflare Workers or Vercel

### Component-Based UI
- **Pattern**: Feature-based component organization
- **Styling**: TailwindCSS 4 with design tokens
- **State**: Zustand + Dexie (IndexedDB)

### Local-First Data Layer
- **Source of Truth**: Local File System Access API
- **Caching**: IndexedDB via Dexie.js
- **Sync**: Bi-directional WebContainer ↔ Local FS

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser                                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    React Application                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │  │
│  │  │   Routes    │  │  Components │  │    Stores       │    │  │
│  │  │(TanStack)   │  │   (100+)    │  │  (Zustand)      │    │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                          │                                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      Libraries                             │  │
│  │  ┌───────────┐  ┌───────────┐  ┌─────────────────────┐   │  │
│  │  │  Agent    │  │FileSystem │  │     WebContainer    │   │  │
│  │  │  System   │  │   (FSA)   │  │     Manager         │   │  │
│  │  └───────────┘  └───────────┘  └─────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                          │                                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Browser APIs                             │  │
│  │  ┌───────────────┐  ┌─────────────────────────────────┐  │  │
│  │  │FileSystem     │  │   WebContainer                  │  │  │
│  │  │Access API     │  │   (Node.js in browser)          │  │  │
│  │  └───────────────┘  └─────────────────────────────────┘  │  │
│  │  ┌───────────────┐  ┌─────────────────────────────────┐  │  │
│  │  │IndexedDB      │  │   AI API                        │  │  │
│  │  │(Dexie)        │  │   (OpenRouter, OpenAI, etc.)    │  │  │
│  │  └───────────────┘  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Core Modules

### AI Agent System (`src/lib/agent/`)

**Architecture**:
```
┌──────────────────────────────────────────────────────────────┐
│                      AI Agent Layer                          │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐  │
│  │                   useAgentChatWithTools                │  │
│  │                   (React Hook)                         │  │
│  └────────────────────────────────────────────────────────┘  │
│                            │                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                   AgentFactory                         │  │
│  │                   (Creates Adapters)                   │  │
│  └────────────────────────────────────────────────────────┘  │
│                            │                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              ProviderAdapter Interface                 │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │  │OpenRouter│  │  OpenAI  │  │Anthropic │            │  │
│  │  │Adapter   │  │ Adapter  │  │ Adapter  │            │  │
│  │  └──────────┘  └──────────┘  └──────────┘            │  │
│  └────────────────────────────────────────────────────────┘  │
│                            │                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Tool Facades (Workspace-aware)            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │  │FileTools │  │Terminal  │  │   +      │            │  │
│  │  │          │  │Tools     │  │  More    │            │  │
│  │  └──────────┘  └──────────┘  └──────────┘            │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Key Components**:
- `factory.ts` - Creates provider adapters
- `provider-adapter.ts` - Provider interface
- `model-registry.ts` - Available models
- `credential-vault.ts` - Encrypted API keys
- `facades/` - Tool abstractions
- `tools/` - Individual tool implementations

### File System Layer (`src/lib/filesystem/`)

**Sync Architecture**:
```
┌─────────────────────────────────────────────────────────────────┐
│                      File System Sync                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Local FS (Browser)                                    ┌──────┐│
│       │                                              │   │      │
│       │ read/write                              sync │   │ WC   │
│       │                                              │   │      │
│  ┌────▼─────┐                                       │   └──────┘
│  │ LocalFS  │◄──────────────────────────────────────│     │
│  │ Adapter  │                                        │     │
│  └────┬─────┘                                        │     │
│       │                                              │     │
│       │                                              │     │
│  ┌────▼─────┐    ┌──────────┐    ┌─────────────┐   │     │
│  │ SyncManager│──►│Operations│──►│  WebContainer│───┘     │
│  │           │    │  Queue   │    │  File System│         │
│  └───────────┘    └──────────┘    └─────────────┘         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              IndexedDB (Dexie)                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────────┐   │   │
│  │  │Project   │  │ IDEState │  │ FileMetadataCache  │   │   │
│  │  │Configs   │  │          │  │                    │   │   │
│  │  └──────────┘  └──────────┘  └────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### State Management

**Architecture**:
```
┌─────────────────────────────────────────────────────────────────┐
│                      State Architecture                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              Persisted State (IndexedDB)                   │ │
│  │  - Projects, Conversations                                 │ │
│  │  - IDE State (open files, panel layouts)                  │ │
│  │  - Agent/Provider Configs                                  │ │
│  │  - File Metadata Cache                                     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                            │                                    │
│                            │ read/write                         │
│                            ▼                                    │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              Zustand Stores (In-Memory)                    │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐    │ │
│  │  │useIDE    │  │useAgents │  │useFileSyncStatus     │    │ │
│  │  │Store     │  │Store     │  │                      │    │ │
│  │  └──────────┘  └──────────┘  └──────────────────────┘    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                            │                                    │
│                            │ subscribe                          │
│                            ▼                                    │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              React Components                              │ │
│  │  - UI updates via selectors                               │ │
│  │  - useShallow for performance                             │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Chat Request Flow
```
User Input
    │
    ▼
ChatPanel → useAgentChatWithTools
    │
    ▼
AgentFactory.createAdapter()
    │
    ▼
ProviderAdapter.chat() → /api/chat (SSE)
    │
    ▼
LLM Response Stream
    │
    ▼
Tool Call Detection
    │
    ├──► Approval Required → User Approval
    │
    └──► Auto-approved → Execute via Facade
         │
         ├──► FileTools → LocalFSAdapter → Local FS / WebContainer
         └──► TerminalTools → ProcessManager → Shell
```

### File Sync Flow
```
Local File Change (FSA)
    │
    ▼
LocalFSAdapter.onChange()
    │
    ▼
SyncManager.queueOperation()
    │
    ▼
SyncPlanner.planSync()
    │
    ▼
SyncExecutor.execute()
    │
    ├──► WebContainer.fs.writeFile()
    └──► IndexedDB.updateFileMetadata()
```

## Key Design Decisions

### 1. Local FS as Source of Truth
- WebContainer mirrors local files
- No reverse sync from WebContainer to Local FS
- Reason: Browser security limitations

### 2. Zustand + Dexie Pattern
- Zustand for reactive UI updates
- Dexie for IndexedDB persistence
- Dexie storage adapter for auto-persistence

### 3. Tool Facade Pattern
- Abstracts WebContainer/LocalFS operations
- Provides consistent interface for agents
- Handles path resolution and security

### 4. TanStack AI for Chat
- Streaming responses via SSE
- Provider-agnostic adapter pattern
- Tool definition support

## Security Considerations

### File System Access
- Path validation via `path-guard.ts`
- Exclusions for `.git`, `node_modules`
- Permission persistence with revocation

### API Key Storage
- Encrypted via `credential-vault.ts`
- Client-side encryption only
- Keys never sent to server (except during chat)

### Tool Execution
- Approval workflow for destructive operations
- Command sanitization
- Timeout enforcement

---

*Generated: 2025-12-31*
