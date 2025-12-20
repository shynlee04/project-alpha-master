---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - docs/prd-via-gent-foundational-architectural-slice-2025-12-10.md
  - docs/analysis/research/technical-via-gent-foundational-architectural-slice-spike-research-2025-12-10.md
  - docs/analysis/product-brief-via-gent-2025-12-10-architectural-slice.md
  - docs/ux-design-specification.md
  - docs/ux-color-themes.html
  - docs/ux-design-directions.html
  - docs/bmm-workflow-status.yaml
workflowType: 'architecture'
lastStep: 8
status: 'complete'
project_name: 'via-gent'
user_name: 'Apple'
date: '2025-12-10'
completedAt: '2025-12-10T18:35:00+07:00'
---

# Architecture Decision Document
## Via-Gent: Foundational Architectural Slice (Project Alpha)

**Version:** 1.0  
**Author:** Apple  
**Date:** 2025-12-10  
**Status:** Complete ✅

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

The PRD defines **35+ functional requirements** across 7 domains:

| Domain | Count | Critical Items |
|--------|-------|----------------|
| IDE Shell (FR-IDE) | 6 | TanStack Start SPA, Monaco, xterm.js, resizable panels |
| WebContainers (FR-WC) | 6 | Boot, mount, spawn shell, npm commands, streaming |
| File System Access (FR-FS) | 6 | Directory picker, CRUD operations, permission persistence |
| Dual Sync (FR-SYNC) | 4 | Bidirectional sync, exclusion rules, debouncing |
| Git (FR-GIT) | 6 | FSA adapter, status, add, commit, push, pull |
| Persistence (FR-PERSIST) | 6 | Conversations, tool history, layout, FSA handles |
| AI Agent (FR-AGENT) | 7 | TanStack AI, client tools, file/terminal/git tools |

**Non-Functional Requirements:**

| Category | Key Targets |
|----------|-------------|
| Performance | WebContainer boot <5s, file mount <3s, dev server <30s |
| Reliability | 99%+ sync reliability, zero data corruption |
| Usability | Time to first project <2min, keyboard accessible |
| Security | Zero server transmission, BYOK API keys, FSA scoping |
| Compatibility | Chrome 86+, Edge 86+, Safari 15.2+ |

**Scale & Complexity:**

- Primary domain: **Full-stack client-side IDE**
- Complexity level: **High** (novel architecture, browser API integration)
- Estimated architectural components: **7 major layers**

### Technical Constraints & Dependencies

| Constraint | Description | Impact |
|------------|-------------|--------|
| **Browser-Only** | No backend services for core functionality | All state client-side |
| **WebContainers Required** | SharedArrayBuffer/WASM support | Limits browser compatibility |
| **FSA Required (Tier 2)** | Local file persistence needs FSA | Non-FSA browsers use IndexedDB only |
| **Single Session** | One active workspace per tab | No multi-window sync |

### Cross-Cutting Concerns Identified

1. **State Synchronization**: WebContainers FS ↔ Local Disk ↔ UI State
2. **Permission Lifecycle**: FSA handles require re-permission on reload
3. **Error Recovery**: Graceful handling of permission denial, sync failures, Git errors
4. **Session Restoration**: Full state restoration from IndexedDB + FSA handles
5. **Performance Boundaries**: Excluding `node_modules` from disk sync
6. **Localization (EN/VI)**: Client-only i18n with locale-aware routing, dynamic bundle loading, and `<html lang>` set per locale; avoid SSR/hydration coupling by lazy-loading translation resources and defaulting to `en` fallback.

---

## Starter Template Evaluation

### Primary Technology Domain

**Full-Stack Client-Side IDE** based on project requirements analysis.

### Selected Starter: TanStack Start (SPA Mode)

**Rationale for Selection:**

TanStack Start with SPA mode is the optimal choice because:

1. **Native TanStack AI integration** - Required for agent tools
2. **Selective SSR support** - `ssr: false` for WebContainers routes
3. **File-based routing** - Clean route structure for IDE/workspace
4. **React 19 compatible** - Modern React features
5. **Vite 7.x bundling** - Fast dev server and builds

**Initialization Command:**

```bash
npx -y create-tanstack-start@latest ./ --template default --package-manager pnpm
```

**Architectural Decisions Provided by Starter:**

| Category | Decision |
|----------|----------|
| **Language & Runtime** | TypeScript 5.x with strict mode |
| **Framework** | React 19 + TanStack Start |
| **Router** | TanStack Router (file-based) |
| **Styling** | CSS-in-CSS (Shadcn/ui compatible) |
| **Build Tooling** | Vite 7.x with TanStack Start plugin |
| **Testing** | Vitest 3.x |
| **Code Organization** | Feature-based with `src/routes`, `src/lib`, `src/components` |

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- WebContainers integration pattern
- File System Access API adapter design
- Bidirectional sync strategy
- isomorphic-git FSA adapter

**Important Decisions (Shape Architecture):**
- TanStack AI tool architecture
- State management pattern
- Persistence layer design
- Error recovery patterns

**Deferred Decisions (Post-MVP):**
- Multi-project workspace
- Collaborative features
- Complex project templates

### Data Architecture

| Decision | Choice | Version | Rationale |
|----------|--------|---------|-----------|
| **Primary Storage** | IndexedDB via `idb` | latest | Browser-native, structured data |
| **Schema Validation** | Zod | 4.x | Type-safe validation, TanStack integration |
| **File Storage** | File System Access API | Native | Real local files, Git compatibility |
| **Fallback Storage** | IndexedDB (virtual FS) | N/A | When FSA permission denied |

**Data Model:**

```typescript
// Core entities stored in IndexedDB
interface ProjectMetadata {
  id: string;
  name: string;
  folderPath: string;
  fsaHandle: FileSystemDirectoryHandle | null;
  openFiles: string[];
  layoutState: LayoutConfig;
  lastOpened: Date;
}

interface ConversationState {
  projectId: string;
  messages: Message[];
  toolResults: ToolResult[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Authentication & Security

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **LLM Auth** | BYOK (Bring Your Own Key) | User controls API keys |
| **GitHub Auth** | Personal Access Token (PAT) | Client-side Git operations |
| **Data Transmission** | Zero server transmission | Complete client-side privacy |
| **File Access** | Scoped to user-approved directories | FSA permission model |

### API & Communication Patterns

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **AI Communication** | Server-Sent Events (SSE) | TanStack AI streaming |
| **Endpoint Pattern** | `/api/chat` for AI, client tools for execution | Separation of concerns |
| **Tool Execution** | Client-side via `clientTools()` | Browser-only architecture |
| **Event Format** | TanStack AI standard | Framework compatibility |

### Frontend Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **State Management** | TanStack Store + TanStack Query | Unified state pattern |
| **Component Library** | Shadcn/ui | Customizable, accessible |
| **Editor** | Monaco Editor | Industry standard, TypeScript support |
| **Terminal** | xterm.js | WebContainers compatibility |
| **Layout** | Resizable panels | IDE-standard UX |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Hosting** | Static hosting (Vercel/Netlify) | No server requirements |
| **Build** | Vite SSG/SPA output | Optimal for static deployment |
| **Headers** | `Cross-Origin-Opener-Policy: same-origin` | WebContainers requirement |
| **Headers** | `Cross-Origin-Embedder-Policy: require-corp` | SharedArrayBuffer requirement |

---

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**12 critical conflict points** identified where AI agents could make different choices.

### Naming Patterns

**Database/Schema Naming:**
```typescript
// IndexedDB stores: camelCase
const stores = {
  projects: 'projects',
  conversations: 'conversations',
  toolResults: 'toolResults'
};

// Object keys: camelCase
interface Project {
  projectId: string;
  folderPath: string;
  lastOpened: Date;
}
```

**API Naming Conventions:**
```typescript
// API routes: kebab-case path, camelCase params
// /api/chat (POST)
// Search params: camelCase
// ?projectId=xxx&file=src/index.ts
```

**Code Naming Conventions:**
```typescript
// Components: PascalCase file and export
// MonacoEditor.tsx → export function MonacoEditor
// Hooks: camelCase with 'use' prefix
// useAgentChat.ts → export function useAgentChat
// Utilities: camelCase
// sync-manager.ts → export function syncToWebContainer
// Stores: camelCase with 'Store' suffix
// ideStore.ts → export const ideStore
```

### Structure Patterns

**Project Organization:**
```
src/
├── routes/              # TanStack Router file-based routes
├── components/
│   ├── ui/              # Shadcn/ui components
│   ├── ide/             # IDE-specific components
│   └── layout/          # Layout components
├── lib/
│   ├── webcontainer/    # WebContainers integration
│   ├── filesystem/      # FSA + sync logic
│   ├── git/             # isomorphic-git operations
│   ├── persistence/     # IndexedDB + idb
│   └── agent/           # TanStack AI tools
├── stores/              # TanStack Store definitions
└── types/               # Shared TypeScript types
```

**Test Organization:**
```
tests/
├── unit/                # Unit tests co-located or here
├── integration/         # Integration tests
└── e2e/                 # End-to-end tests
```

### Format Patterns

**API Response Formats:**
```typescript
// AI streaming uses TanStack AI format (SSE)
// Tool results:
interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
```

**Date Formats:**
```typescript
// Stored: ISO 8601 strings
// Display: Relative (via date-fns)
const stored = new Date().toISOString(); // "2025-12-10T18:00:00.000Z"
```

### Communication Patterns

**Event Naming:**
```typescript
// Domain events: past tense, descriptive
type IDEEvent = 
  | { type: 'file.opened'; path: string }
  | { type: 'file.saved'; path: string }
  | { type: 'command.executed'; command: string; exitCode: number }
  | { type: 'git.committed'; hash: string };
```

**State Updates:**
```typescript
// Immutable updates via TanStack Store
ideStore.setState((prev) => ({
  ...prev,
  openFiles: [...prev.openFiles, newFile]
}));
```

### Process Patterns

**Error Handling:**
```typescript
// All async operations wrapped in try-catch
// User-facing errors: toast notification
// Technical errors: console + optional error boundary
try {
  await syncToWebContainer(handle);
} catch (error) {
  if (error instanceof PermissionDeniedError) {
    toast.error('Permission required', { 
      description: 'Please grant folder access to continue.'
    });
  } else {
    console.error('Sync failed:', error);
    toast.error('Sync failed', { 
      description: 'Unable to sync files. Please try again.'
    });
  }
}
```

**Loading States:**
```typescript
// Consistent loading state naming
interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

// Use TanStack Query for async operations
const { data, isLoading, error } = useQuery({
  queryKey: ['project', projectId],
  queryFn: () => loadProject(projectId)
});
```

### Enforcement Guidelines

**All AI Agents MUST:**
- Follow the naming conventions exactly as documented
- Use the project structure defined in this architecture
- Implement error handling patterns consistently
- Use TanStack Store for state management, not local React state for cross-component data

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
via-gent-spike/
├── README.md
├── package.json
├── pnpm-lock.yaml
├── vite.config.ts
├── tsconfig.json
├── app.config.ts                    # TanStack Start config (ssr settings)
├── .env.local
├── .env.example
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   ├── client.tsx                   # TanStack Start client entry
│   ├── router.tsx                   # Router configuration
│   ├── routes/
│   │   ├── __root.tsx               # Root layout with providers
│   │   ├── index.tsx                # Dashboard/project list
│   │   ├── workspace/
│   │   │   └── $projectId.tsx       # IDE workspace (ssr: false)
│   │   └── api/
│   │       └── chat.ts              # TanStack AI streaming endpoint
│   ├── components/
│   │   ├── ui/                      # Shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   ├── ide/
│   │   │   ├── MonacoEditor.tsx     # Monaco with FS sync
│   │   │   ├── XTerminal.tsx        # XTerm with WebContainer
│   │   │   ├── FileTree.tsx         # File tree with FSA
│   │   │   ├── ChatPanel.tsx        # TanStack AI useChat
│   │   │   ├── PreviewPanel.tsx     # Dev server preview iframe
│   │   │   └── GitPanel.tsx         # Git status and operations
│   │   └── layout/
│   │       ├── IDELayout.tsx        # Resizable panels container
│   │       └── ProjectCard.tsx      # Dashboard project card
│   ├── lib/
│   │   ├── webcontainer/
│   │   │   ├── manager.ts           # WebContainer lifecycle
│   │   │   ├── terminal-adapter.ts  # XTerm ↔ WebContainer binding
│   │   │   └── types.ts
│   │   ├── filesystem/
│   │   │   ├── local-fs-adapter.ts  # File System Access API wrapper
│   │   │   ├── webcontainer-fs.ts   # WebContainer FS operations
│   │   │   ├── sync-manager.ts      # Bidirectional sync logic
│   │   │   └── types.ts
│   │   ├── git/
│   │   │   ├── git-service.ts       # isomorphic-git operations
│   │   │   ├── fsa-adapter.ts       # FSA fs.promises adapter
│   │   │   ├── github-auth.ts       # PAT handling
│   │   │   └── types.ts
│   │   ├── persistence/
│   │   │   ├── db.ts                # IndexedDB setup via idb
│   │   │   ├── project-store.ts     # Project metadata persistence
│   │   │   ├── conversation-store.ts # Message persistence
│   │   │   ├── handle-store.ts      # FSA handle persistence
│   │   │   └── types.ts
│   │   └── agent/
│   │       ├── tool-definitions.ts  # Tool registry
│   │       ├── file-tools.ts        # read/write/list/delete
│   │       ├── terminal-tools.ts    # run_command
│   │       ├── git-tools.ts         # git operations
│   │       └── types.ts
│   ├── stores/
│   │   ├── ide-store.ts             # IDE state (panels, active file)
│   │   ├── project-store.ts         # Current project state
│   │   └── conversation-store.ts    # Chat state
│   ├── hooks/
│   │   ├── useAgentChat.ts          # TanStack AI useChat wrapper
│   │   ├── useWebContainer.ts       # WebContainer lifecycle hook
│   │   ├── useFileSystem.ts         # FSA operations hook
│   │   └── useProject.ts            # Project operations hook
│   ├── types/
│   │   └── index.ts                 # Shared type definitions
│   └── styles/
│       └── globals.css              # Global styles + Shadcn/ui vars
├── tests/
│   ├── unit/
│   │   ├── filesystem/
│   │   │   └── sync-manager.test.ts
│   │   └── agent/
│   │       └── file-tools.test.ts
│   ├── integration/
│   │   ├── webcontainer.test.ts
│   │   └── git-operations.test.ts
│   └── e2e/
│       └── full-workflow.test.ts    # 14-step validation
└── public/
    └── assets/
```

### Architectural Boundaries

**API Boundaries:**
```
┌─────────────────────────────────────────────────────────────┐
│                        Browser Tab                          │
├─────────────────────────────────────────────────────────────┤
│  /api/chat (SSE)    → LLM Provider (Gemini)                │
│  FSA API            → User's Local File System             │
│  isomorphic-git     → GitHub API (via CORS proxy or PAT)   │
│  WebContainers      → Sandboxed Node.js Runtime            │
└─────────────────────────────────────────────────────────────┘
```

**Component Boundaries:**
```
UI Layer (React)
    ↓ props/events
Store Layer (TanStack Store)
    ↓ actions/selectors
Domain Layer (lib/*)
    ↓ async calls
Adapter Layer (FSA, WebContainers, isomorphic-git, IndexedDB)
    ↓ native APIs
Browser/System
```

### Requirements to Structure Mapping

| Requirement Domain | Directory Mapping |
|--------------------|-------------------|
| IDE Shell (FR-IDE) | `src/routes/workspace/$projectId.tsx`, `src/components/ide/*`, `src/components/layout/*` |
| WebContainers (FR-WC) | `src/lib/webcontainer/*`, `src/hooks/useWebContainer.ts` |
| File System (FR-FS) | `src/lib/filesystem/*`, `src/hooks/useFileSystem.ts` |
| Dual Sync (FR-SYNC) | `src/lib/filesystem/sync-manager.ts` |
| Git (FR-GIT) | `src/lib/git/*` |
| Persistence (FR-PERSIST) | `src/lib/persistence/*` |
| AI Agent (FR-AGENT) | `src/lib/agent/*`, `src/routes/api/chat.ts`, `src/hooks/useAgentChat.ts` |

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- All technology choices are compatible: TanStack Start + React 19 + Vite 7.x ✅
- TanStack AI integrates natively with TanStack Start ✅
- WebContainers runs in SPA mode routes ✅
- isomorphic-git accepts custom fs adapter ✅

**Pattern Consistency:**
- Naming conventions are consistent across all layers ✅
- File-based routing aligns with TanStack Router patterns ✅
- Tool definitions follow TanStack AI patterns ✅

**Structure Alignment:**
- Project structure supports all architectural decisions ✅
- Clear separation between UI, domain, and adapter layers ✅
- Test structure mirrors source organization ✅

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
- All 35+ FRs mapped to specific directories and modules ✅
- Cross-cutting concerns (sync, persistence) have dedicated modules ✅

**Non-Functional Requirements Coverage:**
- Performance: WebContainers async boot, lazy loading ✅
- Reliability: IndexedDB for persistence, error boundaries ✅
- Security: BYOK, no server data transmission ✅
- Compatibility: SPA mode for browser-only APIs ✅

### Implementation Readiness Validation ✅

**Decision Completeness:**
- All critical technology versions specified ✅
- Implementation patterns documented with examples ✅
- Consistency rules comprehensive and enforceable ✅

**Structure Completeness:**
- Full directory tree defined ✅
- All integration points specified ✅
- Component boundaries well-defined ✅

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION ✅

**Confidence Level:** HIGH based on validation results and prior spike evidence

**Key Strengths:**
- Proven spike implementations for WebContainers + TanStack AI
- Clear separation of concerns across layers
- Comprehensive tool architecture for AI agents
- Well-defined sync strategy (local FS as source of truth)

**Areas for Future Enhancement:**
- Multi-project workspace (deferred)
- Conflict resolution UI for concurrent edits
- Advanced caching strategies

---

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅  
**Total Steps Completed:** 8  
**Date Completed:** 2025-12-10  
**Document Location:** docs/architecture.md

### Final Architecture Deliverables

**📋 Complete Architecture Document**
- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**🏗️ Implementation Ready Foundation**
- **26** architectural decisions made
- **12** implementation pattern categories defined
- **7** architectural layers specified
- **35+** requirements fully supported

**📚 AI Agent Implementation Guide**
- Technology stack with verified versions
- Consistency rules that prevent implementation conflicts
- Project structure with clear boundaries
- Integration patterns and communication standards

### Implementation Handoff

**For AI Agents:**
This architecture document is your complete guide for implementing Via-gent Project Alpha. Follow all decisions, patterns, and structures exactly as documented.

**First Implementation Priority:**
```bash
# 1. Initialize TanStack Start project
npx -y create-tanstack-start@latest ./ --template default --package-manager pnpm

# 2. Add core dependencies
pnpm add @webcontainer/api monaco-editor @monaco-editor/react xterm xterm-addon-fit
pnpm add isomorphic-git idb zod @tanstack/store @tanstack/ai @tanstack/ai-react @tanstack/ai-gemini

# 3. Configure for WebContainers (add headers to vite.config.ts)
```

**Development Sequence:**
1. Initialize project using documented starter template
2. Set up development environment per architecture
3. Implement core architectural foundations (WebContainers, FSA)
4. Build sync layer and persistence
5. Implement AI tools following established patterns
6. Validate with 14-step acceptance sequence

---

## Epic 3 Validated Implementation Patterns

**Added:** 2025-12-11  
**Status:** Validated via 52 passing tests

### File System Access Layer (Validated)

#### LocalFSAdapter Patterns

```typescript
// Path validation - MANDATORY for all operations
private validatePath(path: string, operation: string): void {
  // 1. Check for empty/null path
  // 2. Block absolute paths (starts with '/' or 'C:\')
  // 3. Block path traversal ('..') 
  // 4. Normalize separators
}

// Multi-segment path support
async getFileHandle(path: string, create = false): Promise<FileSystemFileHandle> {
  const segments = path.split('/').filter(s => s.length > 0);
  // Walk directories for nested paths like 'src/components/Button.tsx'
  const parentDir = await this.walkDirectorySegments(segments.slice(0, -1), create);
  return parentDir.getFileHandle(segments.at(-1), { create });
}

// Binary file support with method overloads
async readFile(path: string): Promise<FileReadResult>;
async readFile(path: string, options: { encoding: 'binary' }): Promise<FileReadBinaryResult>;
```

#### SyncManager Patterns

```typescript
// Dual write pattern - Local FS is source of truth
async writeFile(path: string, content: string): Promise<void> {
  // 1. Write to local FS first (source of truth)
  await this.localAdapter.writeFile(path, content);
  
  // 2. Write to WebContainers if booted
  if (isBooted()) {
    const fs = getFileSystem();
    await fs.mkdir(parentPath, { recursive: true }); // Ensure parents
    await fs.writeFile(path, content);
  }
}

// Exclusion patterns with glob support
private isExcluded(path: string, name: string): boolean {
  return this.config.excludePatterns.some((pattern) => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(name) || regex.test(path);
    }
    return name === pattern || path.startsWith(`${pattern}/`);
  });
}
```

#### Permission Lifecycle Patterns

```typescript
// IndexedDB handle persistence
const DB_NAME = 'via-gent-fsa-spike';
const STORE_NAME = 'handles';

// Permission state types
type FsaPermissionState = 'unknown' | 'granted' | 'prompt' | 'denied';

// Check and restore on reload
async function restorePermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  const status = await handle.queryPermission({ mode: 'readwrite' });
  if (status === 'granted') return true;
  if (status === 'prompt') {
    // Show UI: "Click to restore access"
    return false;
  }
  return false; // denied
}
```

### UI State Integration Points

| Component | State Source | Update Trigger |
|-----------|--------------|----------------|
| FileTree | `directoryHandle` prop | `loadRootDirectory()` on handle change |
| IDELayout | `permissionState` | `getPermissionState()` on mount/restore |
| SyncManager | `_status: SyncStatus` | `syncToWebContainer()` completion |

---

## Workspace Context Layer (Epic 3 Hotfix)

**Added:** 2025-12-12  
**Status:** Ready for Implementation  
**Change Proposal:** [sprint-change-proposal-2025-12-12.md](docs/sprint-artifacts/sprint-change-proposal-2025-12-12.md)

### Architecture Rationale

The original Epic 3 implementation scattered IDE state across `IDELayout` local state. This caused:
- No folder switching (old handle reused)
- No sync status visibility (status not exposed)
- No dashboard integration (mock data only)

**Solution:** Centralized `WorkspaceContext` with `ProjectStore` persistence.

### WorkspaceContext Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Via-Gent IDE                                │
├─────────────────────────────────────────────────────────────────┤
│  Route: /workspace/$projectId                                   │
│  └── WorkspaceProvider (NEW)                                   │
│       ├── WorkspaceState (centralized)                         │
│       └── WorkspaceActions (openFolder, switchFolder, syncNow) │
├─────────────────────────────────────────────────────────────────┤
│  UI Components (consume context via useWorkspace hook)          │
│  ├── IDELayout → uses context for handle, sync status          │
│  ├── FileTree → uses context.directoryHandle                   │
│  ├── SyncStatusIndicator → uses context.syncStatus             │
│  └── Header → uses context for actions                         │
├─────────────────────────────────────────────────────────────────┤
│  Persistence Layer                                              │
│  └── ProjectStore (IndexedDB)                                  │
│       ├── saveProject(metadata)                                │
│       ├── listProjects() → Dashboard                           │
│       └── getProject(id) → Route loader                        │
└─────────────────────────────────────────────────────────────────┘
```

### WorkspaceContext Interface

```typescript
// src/lib/workspace/WorkspaceContext.tsx

interface WorkspaceState {
  projectId: string | null;
  projectMetadata: ProjectMetadata | null;
  directoryHandle: FileSystemDirectoryHandle | null;
  permissionState: FsaPermissionState;
  syncStatus: 'idle' | 'syncing' | 'error';
  syncProgress: SyncProgress | null;
  lastSyncTime: Date | null;
  syncError: string | null;
}

interface WorkspaceActions {
  openFolder(): Promise<void>;      // Show picker, save to ProjectStore
  switchFolder(): Promise<void>;    // Always show picker, replace handle
  syncNow(): Promise<void>;         // Trigger manual sync
  closeProject(): void;             // Clear state, navigate to dashboard
}

// Hook for component access
function useWorkspace(): WorkspaceState & WorkspaceActions;
```

### ProjectStore Schema

```typescript
// src/lib/workspace/project-store.ts

const DB_NAME = 'via-gent-projects';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

interface ProjectMetadata {
  id: string;                              // UUID or slug from folder name
  name: string;                            // Display name (folder name)
  folderPath: string;                      // Display path (for UI only)
  fsaHandle: FileSystemDirectoryHandle;   // Serializable in IndexedDB
  lastOpened: Date;
  layoutState?: {
    panelSizes: number[];
    openFiles: string[];
    activeFile: string | null;
  };
}

// CRUD operations
async function saveProject(project: ProjectMetadata): Promise<void>;
async function getProject(id: string): Promise<ProjectMetadata | null>;
async function listProjects(): Promise<ProjectMetadata[]>;
async function deleteProject(id: string): Promise<void>;
async function checkProjectPermission(id: string): Promise<FsaPermissionState>;
```

### Route Loader Pattern

```typescript
// src/routes/workspace/$projectId.tsx

export const Route = createFileRoute('/workspace/$projectId')({
  ssr: false,
  loader: async ({ params }) => {
    const project = await getProject(params.projectId);
    if (!project) {
      throw redirect({ to: '/' });
    }
    return { project };
  },
  component: WorkspaceRoute,
});

function WorkspaceRoute() {
  const { project } = Route.useLoaderData();
  return (
    <WorkspaceProvider initialProject={project}>
      <IDELayout />
    </WorkspaceProvider>
  );
}
```

### Multi-Root Workspace (Future - Epic 5+)

Based on VS Code research, future multi-root support would extend:

```typescript
interface WorkspaceConfig {
  folders: Array<{
    name: string;           // Display name
    path: string;           // Relative path within workspace
    handle: FileSystemDirectoryHandle;
  }>;
  settings: Record<string, unknown>;
}

// .via-gent-workspace.json file in user's folder
{
  "folders": [
    { "name": "ROOT", "path": "./" },
    { "name": "packages/app1", "path": "./packages/app1" }
  ]
}
```

**Note:** Multi-root is out of scope for current hotfix. Current implementation supports single root switching.

---

## Multi-Root Workspace Roadmap (Epic 9 - POST-MVP)

**Added:** 2025-12-12  
**Status:** Scoped for Post-MVP  
**Prerequisites:** Epic 5 (Persistence), Epic 7 (Git Integration)  
**Stories:** See `docs/epics.md` - Epic 9

### User Requirements Addressed

| Requirement | Epic 9 Story | Priority |
|-------------|--------------|----------|
| Save/load workspace file | 9.1 | P0 |
| Multiple folder roots in FileTree | 9.2 | P0 |
| Each root syncs independently | 9.3 | P0 |
| Multiple git repositories | 9.4 | P0 |
| Git submodules / nested git | 9.5 | P1 |
| Workspace state synchronization | 9.6 | P1 |
| Agent tools with multi-root context | 9.7 | P2 |

### Architectural Layers for Multi-Root

```
┌─────────────────────────────────────────────────────────────────┐
│                     Via-Gent IDE                                │
├─────────────────────────────────────────────────────────────────┤
│  Route: /workspace/$workspaceId OR /workspace/$projectId       │
│  └── WorkspaceProvider                                         │
│       ├── Single Root Mode (current Epic 3 hotfix)             │
│       │   └── projectId → single ProjectMetadata              │
│       └── Multi-Root Mode (Epic 9)                             │
│           └── workspaceId → WorkspaceConfig with N roots      │
├─────────────────────────────────────────────────────────────────┤
│  WorkspaceStore (IndexedDB) - NEW in Epic 9                    │
│  ├── WorkspaceConfig: { id, name, folders[], settings }       │
│  ├── folders[]: { name, relativePath, fsaHandle }             │
│  └── recentWorkspaces: { id, lastOpened, folderCount }        │
├─────────────────────────────────────────────────────────────────┤
│  ProjectStore (IndexedDB) - Enhanced for multi-root           │
│  ├── Per-root: { id, workspaceId?, name, fsaHandle }          │
│  └── gitState: { repoPath, branch, status, isSubmodule }      │
├─────────────────────────────────────────────────────────────────┤
│  Multi-Root SyncManager (Epic 9.3)                             │
│  ├── rootSyncStates: Map<rootId, SyncStatus>                  │
│  ├── syncRoot(rootId): independent sync per folder            │
│  └── mountRoot(rootId, mountPath): WebContainer mount         │
├─────────────────────────────────────────────────────────────────┤
│  Multi-Git Integration (Epic 9.4, 9.5)                         │
│  ├── GitRepoRegistry: Map<repoPath, GitContext>               │
│  ├── detectGitRoots(folder): find all .git directories        │
│  ├── detectSubmodules(repo): parse .gitmodules                │
│  └── getRepoForPath(filePath): resolve which repo owns file   │
└─────────────────────────────────────────────────────────────────┘
```

### Workspace File Format (`.via-gent-workspace.json`)

```json
{
  "version": 1,
  "folders": [
    {
      "name": "ROOT",
      "path": "./"
    },
    {
      "name": "packages/app1",
      "path": "./packages/app1"
    },
    {
      "name": "external-dependency",
      "path": "/Users/alice/other-project"
    }
  ],
  "settings": {
    "excludePatterns": [".git", "node_modules", "dist"],
    "git.autoDetectSubmodules": true,
    "sync.mode": "auto"
  }
}
```

### FSA Handle Strategy for Multi-Root

Each folder root requires its own FSA handle because:
1. User may select folders from different locations (not nested)
2. Each folder may have independent permissions (granted vs prompt)
3. Workspace file stores relative paths, but handles stored in IndexedDB

```typescript
// Multi-root handle storage in IndexedDB
interface WorkspaceHandleStore {
  workspaceId: string;
  roots: Array<{
    rootId: string;           // UUID
    name: string;             // Display name
    fsaHandle: FileSystemDirectoryHandle;
    permissionState: FsaPermissionState;
  }>;
}

// Restoring workspace with mixed permission states
async function restoreWorkspace(workspaceId: string): Promise<WorkspaceRestoreResult> {
  const handles = await getWorkspaceHandles(workspaceId);
  const results: RootRestoreResult[] = [];
  
  for (const root of handles.roots) {
    const state = await getPermissionState(root.fsaHandle, 'readwrite');
    results.push({
      rootId: root.rootId,
      name: root.name,
      permissionState: state,
      needsReauthorization: state === 'prompt',
    });
  }
  
  return {
    fullAccess: results.every(r => r.permissionState === 'granted'),
    partialAccess: results.some(r => r.permissionState === 'granted'),
    roots: results,
  };
}
```

### Git Multi-Repo Detection Algorithm

```typescript
interface GitRepoInfo {
  path: string;               // Path to .git directory
  rootPath: string;           // Folder containing .git
  isSubmodule: boolean;       // Detected via parent's .gitmodules
  parentRepo?: string;        // Parent repo path if submodule
  depth: number;              // 0 = top-level, 1+ = nested
}

async function detectGitRepositories(
  rootHandle: FileSystemDirectoryHandle,
  maxDepth = 3
): Promise<GitRepoInfo[]> {
  const repos: GitRepoInfo[] = [];
  
  // 1. Check if root is a git repo
  if (await hasGitDir(rootHandle)) {
    repos.push({ path: '.git', rootPath: '.', isSubmodule: false, depth: 0 });
    
    // 2. Parse .gitmodules for declared submodules
    const submodules = await parseGitModules(rootHandle);
    for (const sub of submodules) {
      repos.push({
        path: `${sub.path}/.git`,
        rootPath: sub.path,
        isSubmodule: true,
        parentRepo: '.',
        depth: 1,
      });
    }
  }
  
  // 3. Recursively scan for nested repos (untracked git dirs)
  await scanForNestedGitDirs(rootHandle, repos, maxDepth);
  
  return repos;
}
```

### Phased Implementation Strategy

| Phase | Stories | Effort | Outcome |
|-------|---------|--------|---------|
| **MVP** | 3-7, 3-8, 3-5, 3-6 | ~10h | Single root switching, sync visibility |
| **Post-MVP Phase 1** | 9.1, 9.2, 9.3 | ~15h | Multi-root FileTree, workspace files |
| **Post-MVP Phase 2** | 9.4, 9.5 | ~10h | Multi-git repos, submodules |
| **Post-MVP Phase 3** | 9.6, 9.7 | ~8h | State sync, agent awareness |

### Compatibility Notes

- **VS Code Workspace Files:** Via-Gent workspace format is inspired by `.code-workspace` but uses `.via-gent-workspace.json` to avoid conflicts
- **Backward Compatibility:** Single-root projects (Epic 3 hotfix) continue to work without workspace file
- **Mixed Mode:** Can open single folder OR workspace file; dashboard shows both types

### Error Classification

| Error Class | Code | User Message |
|-------------|------|--------------|
| `FileSystemError` | `INVALID_PATH` | "Path must be a relative path" |
| `FileSystemError` | `PATH_TRAVERSAL` | "Path traversal (../) is not allowed" |
| `FileSystemError` | `NO_DIRECTORY_ACCESS` | "Call requestDirectoryAccess() first" |
| `PermissionDeniedError` | `PERMISSION_DENIED` | "Permission was denied. Please try again." |
| `SyncError` | `SYNC_FAILED` | "Sync failed: [details]" |

---

## Project Fugu Enhancement Layer (Epic 4.5)

**Status:** Research Complete - Ready for Implementation  
**Prerequisite:** Epic 3 Complete ✅

### Architecture Enhancement Points

```
┌─────────────────────────────────────────────────────────────────┐
│                     Via-Gent IDE                                │
├─────────────────────────────────────────────────────────────────┤
│  UI Layer        │  + Badge │ + Font Picker │ + Share Button   │
├─────────────────────────────────────────────────────────────────┤
│  Fugu Layer (NEW)│  ClipboardManager │ BadgeManager │ FontMgr  │
├─────────────────────────────────────────────────────────────────┤
│  Sync Layer      │  SyncManager + FileWatcher (enhanced)       │
├─────────────────────────────────────────────────────────────────┤
│  FS Adapters     │  LocalFSAdapter (unchanged)                 │
├─────────────────────────────────────────────────────────────────┤
│  Permissions     │  PermissionManager (enhanced for persist)   │
└─────────────────────────────────────────────────────────────────┘
```

### Fugu API Integration Priority

| API | Browser Support | Priority | File Location |
|-----|-----------------|----------|---------------|
| FSA Permission Persistence | Chrome 122+ | P0 | `src/lib/fugu/permission-manager.ts` |
| File Watcher (Polling) | All FSA browsers | P0 | `src/lib/fugu/file-watcher.ts` |
| Async Clipboard | Wide support | P1 | `src/lib/fugu/clipboard-manager.ts` |
| Badging API | Chromium only | P2 | `src/lib/fugu/badge-manager.ts` |

### Feature Detection Pattern

```typescript
const fuguCapabilities = {
  persistentPermissions: 'queryPermission' in FileSystemHandle.prototype,
  clipboard: 'clipboard' in navigator && 'write' in navigator.clipboard,
  badging: 'setAppBadge' in navigator,
  localFonts: 'queryLocalFonts' in window,
};

// Progressive enhancement
if (fuguCapabilities.persistentPermissions) {
  // Use enhanced permission flow with three-way prompt
} else {
  // Fall back to session-only permissions
}
```

---

## Agent Tool Architecture (Epic 6 Prep)

**Source:** Roo Code patterns analysis  
**Status:** Architectural guidance for Epic 6 implementation

### BaseTool Abstract Pattern

```typescript
// src/lib/tools/base-tool.ts
export abstract class BaseTool<TName extends ToolName> {
  abstract readonly name: TName;
  abstract readonly description: string;
  abstract readonly parameters: z.ZodType;
  
  // Protocol-agnostic execution
  abstract execute(params: z.infer<typeof this.parameters>): Promise<ToolResult>;
  
  // Convert to TanStack AI tool definition
  toToolDefinition() {
    return toolDefinition({
      description: this.description,
      parameters: this.parameters,
    }).server(async ({ input }) => this.execute(input));
  }
}
```

### Mode-Based Tool Filtering

```typescript
// src/lib/tools/tool-registry.ts
const AGENT_TOOL_PERMISSIONS: Record<AgentType, ToolName[]> = {
  orchestrator: ['delegate_task', 'check_status', 'report_completion'],
  coder: ['read_file', 'write_file', 'list_files', 'execute_command', 'search_files'],
  planner: ['read_file', 'list_files', 'ask_question'],
  validator: ['read_file', 'run_tests', 'check_types'],
};

export class ToolRegistry {
  getToolsForAgent(agentType: AgentType): BaseTool<any>[] {
    const permissions = AGENT_TOOL_PERMISSIONS[agentType];
    return Array.from(this.tools.values()).filter(
      (tool) => permissions.includes(tool.name)
    );
  }
}
```

### Task Context Pattern

```typescript
// src/lib/agent/task-context.ts
export interface TaskContext {
  taskId: string;
  conversationId: string;
  projectPath: string;
  
  // Services
  syncManager: SyncManager;
  webContainer: WebContainer;
  terminal: TerminalAdapter;
  
  // Communication
  sendMessage(message: AgentMessage): void;
  requestApproval(action: string): Promise<boolean>;
}
```

### Tool Implementation Mapping

| Roo Code Tool | Via-Gent Equivalent | Integration Point |
|---------------|---------------------|-------------------|
| `ReadFileTool` | `read_file` | SyncManager.readFile() |
| `WriteToFileTool` | `write_file` | SyncManager.writeFile() |
| `ListFilesTool` | `list_files` | LocalFSAdapter.listDirectory() |
| `ExecuteCommandTool` | `execute_command` | WebContainer.spawn() |
| `AskFollowupQuestionTool` | `ask_question` | Chat panel UI |
| `AttemptCompletionTool` | `complete_task` | Task state update |

---

## Event Bus Architecture (Epic 10)

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

## Agent Tool Facade Layer (Epic 12)

**Status:** Proposed in Course Correction v3  
**Research Sources:** Roo Code patterns (local library), TanStack AI tool patterns (Context7)

### Design Rationale

AI agents need a stable, facade-based interface to interact with IDE subsystems. Direct access to SyncManager, LocalFSAdapter, etc. creates tight coupling. Facades provide:
- Stable contracts that don't change when implementations evolve
- Simplified interfaces for common agent operations
- Security constraints (e.g., path validation, rate limiting)
- Observable side effects via event bus

### Facade Contracts

```typescript
// src/lib/agent-tools/facades/file-tools.ts
import type { WorkspaceEventEmitter } from '@/lib/events/workspace-events';

export interface AgentFileTools {
  /**
   * Read file content. Returns null if file doesn't exist.
   * Emits: file:read (not in standard events, but can be added)
   */
  readFile(path: string): Promise<string | null>;
  
  /**
   * Write content to file. Creates file if doesn't exist.
   * Emits: file:created or file:modified
   */
  writeFile(path: string, content: string): Promise<void>;
  
  /**
   * List directory contents. Returns FileEntry array.
   */
  listDirectory(path: string, recursive?: boolean): Promise<FileEntry[]>;
  
  /**
   * Create new file with optional content.
   * Emits: file:created
   */
  createFile(path: string, content?: string): Promise<void>;
  
  /**
   * Delete file or directory.
   * Emits: file:deleted or directory:deleted
   */
  delete(path: string): Promise<void>;
  
  /**
   * Search for pattern in files. Uses grep-like semantics.
   */
  searchFiles(pattern: string, glob?: string): Promise<SearchResult[]>;
}

export interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
}

export interface SearchResult {
  path: string;
  line: number;
  content: string;
  match: string;
}
```

```typescript
// src/lib/agent-tools/facades/terminal-tools.ts
export interface AgentTerminalTools {
  /**
   * Run command in WebContainer shell.
   * Returns stdout and exit code.
   * Emits: process:started, process:output, process:exited
   */
  runCommand(command: string, args?: string[]): Promise<CommandResult>;
  
  /**
   * Stream command output via callback.
   * Returns abort function.
   */
  streamCommand(
    command: string,
    args: string[],
    onOutput: (data: string) => void
  ): Promise<{ abort: () => void; exitCode: Promise<number> }>;
  
  /**
   * Kill running process by PID.
   */
  killProcess(pid: string): Promise<void>;
  
  /**
   * List active processes.
   */
  listProcesses(): Promise<ProcessInfo[]>;
}

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
}

export interface ProcessInfo {
  pid: string;
  command: string;
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
}
```

```typescript
// src/lib/agent-tools/facades/sync-tools.ts
export interface AgentSyncTools {
  /**
   * Get current sync status.
   */
  getSyncStatus(): SyncStatus;
  
  /**
   * Trigger manual sync in specified direction.
   */
  triggerSync(direction?: 'to-wc' | 'to-local'): Promise<void>;
  
  /**
   * Toggle auto-sync on/off.
   */
  setAutoSync(enabled: boolean): void;
  
  /**
   * Get sync configuration (exclusion patterns, etc.).
   */
  getSyncConfig(): SyncConfig;
  
  /**
   * Update sync configuration.
   */
  updateSyncConfig(config: Partial<SyncConfig>): void;
}

export interface SyncStatus {
  state: 'idle' | 'syncing' | 'error' | 'paused';
  lastSyncTime: Date | null;
  pendingChanges: number;
  currentFile?: string;
  progress?: { current: number; total: number };
  error?: string;
}

export interface SyncConfig {
  autoSync: boolean;
  debounceMs: number;
  excludePatterns: string[];
}
```

### TanStack AI Tool Integration (Epic 12-5)

```typescript
// src/lib/agent-tools/tool-definitions.ts
import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
import type { AgentFileTools, AgentTerminalTools } from './facades';

export function createAgentTools(
  fileTools: AgentFileTools,
  terminalTools: AgentTerminalTools
) {
  return {
    read_file: toolDefinition({
      description: 'Read the content of a file at the specified path',
      parameters: z.object({
        path: z.string().describe('Relative path to the file'),
      }),
    }).client(async ({ input }) => {
      const content = await fileTools.readFile(input.path);
      if (content === null) {
        return { error: `File not found: ${input.path}` };
      }
      return { content };
    }),
    
    write_file: toolDefinition({
      description: 'Write content to a file, creating it if necessary',
      parameters: z.object({
        path: z.string().describe('Relative path to the file'),
        content: z.string().describe('Content to write'),
      }),
    }).client(async ({ input }) => {
      await fileTools.writeFile(input.path, input.content);
      return { success: true, path: input.path };
    }),
    
    run_command: toolDefinition({
      description: 'Execute a shell command in the WebContainer',
      parameters: z.object({
        command: z.string().describe('Command to execute'),
        args: z.array(z.string()).optional().describe('Command arguments'),
      }),
    }).client(async ({ input }) => {
      const result = await terminalTools.runCommand(
        input.command,
        input.args
      );
      return result;
    }),
    
    list_files: toolDefinition({
      description: 'List files and directories at the specified path',
      parameters: z.object({
        path: z.string().describe('Directory path to list'),
        recursive: z.boolean().optional().describe('Include subdirectories'),
      }),
    }).client(async ({ input }) => {
      const entries = await fileTools.listDirectory(input.path, input.recursive);
      return { entries };
    }),
  };
}
```

---

## WorkspaceOrchestrator Layer

**Status:** Future consolidation target  
**Depends On:** Epic 10 (Event Bus), Epic 11 (Code Splitting)

### Design Rationale

Current WorkspaceContext mixes state management with side effects. WorkspaceOrchestrator will:
- Coordinate all subsystems through a unified interface
- Manage lifecycle (boot, mount, sync, shutdown)
- Provide observable state via event bus
- Enable multi-root workspace support (Epic 9)

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        UI Layer                                 │
│  (IDELayout, FileTree, Terminal, Editor, Preview, Chat)        │
├─────────────────────────────────────────────────────────────────┤
│                    WorkspaceOrchestrator                        │
│  • boot() → WebContainer + FSA handle                          │
│  • sync() → LocalFS ↔ WebContainer                             │
│  • spawn() → Process management                                 │
│  • close() → Cleanup and persist                               │
├──────────┬──────────┬───────────┬──────────┬──────────────────┤
│  Local   │  Sync    │ Container │ Terminal │   Git Layer      │
│FSAdapter │ Engine   │  Manager  │  Adapter │  (isomorphic)    │
├──────────┴──────────┴───────────┴──────────┴──────────────────┤
│                       Event Bus                                 │
│              (WorkspaceEventEmitter)                           │
├─────────────────────────────────────────────────────────────────┤
│                    Persistence Layer                            │
│     (ProjectStore, ConversationStore, LayoutStore)             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Code Quality Standards (Course Correction v3)

**Status:** MANDATORY for all new code and refactoring  
**Enforcement:** Pre-commit hooks + Code review

### File Size Limits

| Standard | Limit | Rationale |
|----------|-------|-----------|
| **Lines per file** | ≤ 250 | Cognitive load, testability |
| **Public exports per module** | ≤ 2 | Single Responsibility |
| **Functions per file** | ≤ 5 | Focused modules |

### Zero Tolerance

- **No dead code** - Remove unused functions, variables, imports
- **No hardcoded values** - Use constants or configuration
- **No code smells** - Address complexity, duplication, coupling
- **No drift** - Follow established architectural patterns

### File Splitting Guidelines

When a file exceeds limits, split using these patterns:

```
Original: local-fs-adapter.ts (840 lines)

Split into:
├── local-fs-adapter.ts    # Main adapter, ≤200 lines
├── path-guard.ts          # Path validation, ≤100 lines
├── directory-walker.ts    # Directory traversal, ≤150 lines
├── file-io.ts             # Read/write operations, ≤150 lines
├── error-mapping.ts       # Error classification, ≤80 lines
└── index.ts               # Re-exports, ≤30 lines
```

### Current Violations (Tracked)

| File | Lines | Target | Epic |
|------|-------|--------|------|
| local-fs-adapter.ts | 840 | 200 | 11-1, 11-2 |
| sync-manager.ts | 530 | 200 | 11-3, 11-4 |
| IDELayout.tsx | 480 | 200 | 3-8, 11-5 |
| FileTree.tsx | 430 | 200 | 3-8, 11-7 |
| WorkspaceContext.tsx | 360 | 200 | 10-3 |
| project-store.ts | 355 | 200 | Keep (borderline) |

### Enforcement Tools

```bash
# ESLint rule for file length (planned)
"max-lines": ["error", { "max": 250, "skipBlankLines": true, "skipComments": true }]

# Pre-commit hook (planned)
#!/bin/bash
for file in $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$'); do
  lines=$(wc -l < "$file")
  if [ "$lines" -gt 250 ]; then
    echo "Error: $file has $lines lines (max 250)"
    exit 1
  fi
done
```

---

## Related Documents

- [PRD: Foundational Architectural Slice](docs/prd-via-gent-foundational-architectural-slice-2025-12-10.md)
- [Technical Research Report](docs/analysis/research/technical-via-gent-foundational-architectural-slice-spike-research-2025-12-10.md)
- [Product Brief](docs/analysis/product-brief-via-gent-2025-12-10-architectural-slice.md)
- [UX Design Specification](docs/ux-design-specification.md)
- [Sprint Change Proposal v3](docs/sprint-artifacts/sprint-change-proposal-v3-2025-12-12.md)
- [Sprint Change Proposal v5](../_bmad-output/sprint-change-proposal-v5-2025-12-20.md)

---

## Terminal Integration (Epic 13 - Course Correction v5)

**Known Issues Addressed:**

| ID | Issue | Root Cause | Fix |
|----|-------|------------|-----|
| BUG-01 | Terminal CWD Mismatch | Shell spawns before mount, no cwd passed | Use `SpawnOptions.cwd` |
| BUG-02 | Auto-Sync Not Triggering | Race condition with WebContainer readiness | Add ready gate |

### Terminal Working Directory

Terminal must spawn with the project path as the Current Working Directory:

```typescript
// src/lib/webcontainer/terminal-adapter.ts

interface TerminalAdapter {
  /**
   * Start an interactive shell with optional project path.
   * Shell spawns AFTER project mount completes.
   * 
   * @param projectPath - Absolute path within WebContainer (e.g., '/project')
   */
  startShell(projectPath?: string): Promise<void>;
}

// Implementation pattern
async startShell(projectPath?: string): Promise<void> {
  // Wait for WebContainer to be ready
  await this.container.ready;
  
  this.shellProcess = await this.container.spawn('jsh', {
    cwd: projectPath || '/',
    terminal: { 
      cols: this.cols, 
      rows: this.rows 
    }
  });
  
  // Pipe to xterm.js
  this.reader = this.shellProcess.output.getReader();
  this.pumpOutput();
}
```

### Sync Behavior

**Design Decisions:**

1. **No Reverse Sync**: WebContainer changes do NOT sync back to local FS (by design)
2. **Local FS is Source of Truth**: All edits happen on local FS, then sync to WebContainer
3. **One-Way Sync Flow**: `Local FS → WebContainer` only

**Sync Exclusions (Hardcoded):**

```typescript
const DEFAULT_EXCLUSIONS = [
  '.git',           // Git internals
  'node_modules',   // Dependencies (installed in WebContainer)
  '.DS_Store',      // macOS metadata
  'dist',           // Build outputs
  '.next',          // Next.js build cache
  '.turbo',         // Turbo build cache
];
```

### Terminal Integration Checklist

- [ ] `TerminalAdapter.startShell()` accepts `projectPath` parameter
- [ ] Project path passed from `WorkspaceContext` through component tree
- [ ] Shell spawn waits for mount completion
- [ ] `ls` command shows project files (not WebContainer root)
- [ ] `npm install` works from project directory

---

## Code Quality Standards (Mandatory - Course Correction v3)

### File Size Limits

| Metric | Limit | Enforcement |
|--------|-------|-------------|
| Lines per file | ≤250 | ESLint max-lines |
| Exports per file | ≤2 | Manual review |
| Cyclomatic complexity | ≤10 | ESLint complexity |

### Current Violations to Address

| File | Lines | Target | Epic |
|------|-------|--------|------|
| local-fs-adapter.ts | 840 | 200 | 11-1, 11-2 |
| sync-manager.ts | 530 | 200 | 11-3, 11-4 |
| IDELayout.tsx | 480 | 200 | 3-8, 11-5 |
| FileTree.tsx | 430 | 200 | 3-8, 11-7 |
| WorkspaceContext.tsx | 360 | 200 | 10-3 |
| project-store.ts | 355 | 200 | Keep (borderline) |

### Enforcement Tools

```bash
# ESLint rule for file length (planned)
"max-lines": ["error", { "max": 250, "skipBlankLines": true, "skipComments": true }]

# Pre-commit hook (planned)
#!/bin/bash
for file in $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$'); do
  lines=$(wc -l < "$file")
  if [ "$lines" -gt 250 ]; then
    echo "Error: $file has $lines lines (max 250)"
    exit 1
  fi
done
```

---

**Architecture Status:** UPDATED - Course Correction v5 Applied ✅

**Updates Applied:**

| Date | Course Correction | Changes |
|------|-------------------|---------|
| 2025-12-12 | v3 | Event Bus, AI Tool Facades, WorkspaceOrchestrator, Code Quality |
| 2025-12-20 | v5 | Terminal Integration, Sync Behavior, Known Issues (Epic 13) |

**Next Phase:** Execute Epic 13 (Terminal & Sync Stability) to unblock 14-step validation.

---

*Generated via BMAD Architecture Workflow*  
*Project: Via-Gent Foundational Architectural Slice (Project Alpha)*  
*Last Updated: 2025-12-20T02:40:00+07:00*


