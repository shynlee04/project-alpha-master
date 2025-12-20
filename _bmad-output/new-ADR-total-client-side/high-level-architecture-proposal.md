Now let me create the comprehensive high-level architecture document:

---

# **VIA-GENT HIGH-LEVEL ARCHITECTURE**

## **Single Source of Truth - Anti-Fragmentation Framework**

**Version:** 2.0.0  
**Date:** December 7, 2025  
**Repository:** [shynlee04/via-gent](https://github.com/shynlee04/via-gent)  
**Framework:** TanStack Start (React meta-framework)  
**Development Methodology:** Agent-OS (spec-driven) + BMAD v6 (quick-flow UX/UI)

---

## **📌 Document Purpose & Scope**

### **What This Document IS:**

✅ **Architectural Framework** - High-level structure, not implementation details  
✅ **Anti-Fragmentation Guide** - Prevents spec-driven phases from creating silos  
✅ **Cross-Dependency Map** - Shows how domains/layers communicate  
✅ **Contract Definitions** - Type-level interfaces between architectural slices  
✅ **MCP Research Pointer** - Directs to DeepWiki/Context7/Tavily for depth

### **What This Document IS NOT:**

❌ **Implementation Specification** - See `agent-os/specs/*/spec.md` for that  
❌ **Tech-Spec Details** - Use MCP servers to research TanStack Start/AI patterns  
❌ **Task Breakdown** - See `agent-os/specs/*/tasks.md` for granular steps  
❌ **Code Examples** - This is architecture, not tutorial

### **For AI Agents:**

> **CRITICAL:** This architecture is a **guideline framework**. For implementation-specific questions about TanStack Start routing, TanStack AI tool patterns, or cross-dependency wiring:
>
> 1. **Use MCP DeepWiki** - Research via-gent codebase patterns
> 2. **Use MCP Context7** - Look up TanStack Start/AI official docs
> 3. **Use MCP Tavily/Exa** - Find community best practices
>
> **Never assume** implementation details not explicitly in this doc. Always research advanced patterns through MCP servers.

---

## **🎯 Current State Analysis**

### **What's Implemented (From Repo Scan)**

```yaml
Implemented ✅:
  Infrastructure:
    - TanStack Start app (Vite 7.x, React 19)
    - TanStack Router (file-based routing)
    - TanStack Store (state management)
    - TanStack Query (server state)
    - tRPC (type-safe APIs)
    - Drizzle ORM + Neon DB (PostgreSQL)
    - Storybook (component dev)

  AI Stack:
    - @tanstack/ai (core AI SDK)
    - @tanstack/ai-gemini (Google Gemini provider)
    - @tanstack/ai-anthropic (Claude provider)
    - @tanstack/ai-openai (OpenAI provider)
    - @tanstack/ai-react (React hooks for AI)
    - @modelcontextprotocol/sdk (MCP integration)

  IDE Components (Core Browser IDE Shell spec):
    - WebContainers API (@webcontainer/api)
    - Monaco Editor (@monaco-editor/react)
    - xterm.js terminal (@xterm/xterm + addons)
    - File tree structure (planning exists)
    - 3-pane layout (spec exists, implementation in progress)

  Agent-OS Structure:
    - agent-os/product/ (mission, roadmap, tech-stack)
    - agent-os/specs/ (spec folders with tasks/orchestration)
    - agent-os/standards/ (coding style, conventions)
    - agent-os/commands/ (CLI tooling for spec workflow)

  Development Tooling:
    - Multiple AI agent configs (.agent, .agentvibes, .bmad, .claude, etc.)
    - MCP config (.mcp.json)
    - Storybook config (.storybook/)
    - ESLint + Prettier
```

### **Fragmented Slices Requiring Integration**

```yaml
Fragmented Areas ⚠️:
  1. IDE Shell Components:
     Problem: File tree, Monaco, terminals exist in spec but not wired together
     Impact: No unified IDE experience
     Fix: Central IDE domain with event-driven integration

  2. Agent Tools:
     Problem: @tanstack/ai tools not connected to WebContainers
     Impact: Agents can't modify files or run commands
     Fix: Tool registry with FS/terminal adapters

  3. State Management:
     Problem: Multiple TanStack Stores (demo-store, no IDE store)
     Impact: No shared state between IDE components
     Fix: Unified state layer with domain slices

  4. Database Layer:
     Problem: Neon DB configured but no project/agent persistence
     Impact: Projects lost on refresh
     Fix: Drizzle schema + PGlite for client-side persistence

  5. Routing:
     Problem: Routes exist but no IDE workspace route
     Impact: Can't access IDE shell
     Fix: /ide/* route with TanStack Router

  6. AI Providers:
     Problem: Multiple providers installed but no unified interface
     Impact: Can't switch providers, no key management
     Fix: LLM provider abstraction layer
```

---

## **🏗️ Unified Architecture**

### **Tier 2 Client-Side with Local FS Access**

```
┌─────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │  PRESENTATION LAYER (React + TanStack Start)      │  │
│  │  Routes • Components • Hooks                      │  │
│  └─────────────────┬─────────────────────────────────┘  │
│                    ↓                                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │  APPLICATION LAYER (Use Cases + Workflows)        │  │
│  │  Orchestrates domains, implements business logic  │  │
│  └─────────────────┬─────────────────────────────────┘  │
│                    ↓                                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │  DOMAIN LAYER (Bounded Contexts)                  │  │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐        │  │
│  │  │ IDE │ │Agent│ │Proj.│ │ LLM │ │Mem. │        │  │
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘        │  │
│  └─────────────────┬─────────────────────────────────┘  │
│                    ↓                                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │  INTEGRATION LAYER (Event Bus + State Sync)       │  │
│  │  Central event bus • TanStack Store sync          │  │
│  └─────────────────┬─────────────────────────────────┘  │
│                    ↓                                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │  INFRASTRUCTURE LAYER                             │  │
│  │  ┌─────────────┐     ┌─────────────┐             │  │
│  │  │WebContainers│ ←→  │File System  │             │  │
│  │  │  (Virtual)  │     │Access API   │             │  │
│  │  └─────────────┘     │  (Tier 2)   │             │  │
│  │  ┌─────────────┐     └─────────────┘             │  │
│  │  │  PGlite DB  │     ┌─────────────┐             │  │
│  │  │ (IndexedDB) │     │  TanStack   │             │  │
│  │  └─────────────┘     │     AI      │             │  │
│  └───────────────────────┴─────────────┴─────────────┘  │
└─────────────┬──────────────────────────┬────────────────┘
              ↓                          ↓
   ┌──────────────────┐     ┌──────────────────────┐
   │ Local File System│     │   External Services  │
   │ (via FS Access   │     │   (Gemini API, etc.) │
   │  API permission) │     └──────────────────────┘
   └──────────────────┘
```

---

## **📦 Domain Architecture**

### **Domain Catalog**

| Domain             | Responsibility                         | State          | External Deps                | Status         |
| ------------------ | -------------------------------------- | -------------- | ---------------------------- | -------------- |
| **IDE**            | File tree, Monaco, terminals, preview  | `IDEState`     | WebContainers, FS Access API | 🟡 In Progress |
| **Agent**          | Tool registry, execution, coordination | `AgentState`   | TanStack AI, LLM Domain      | 🔴 Planned     |
| **Project**        | Bootstrap, templates, dev server       | `ProjectState` | IDE Domain, WebContainers    | 🔴 Planned     |
| **LLM**            | Provider management, API keys, models  | `LLMState`     | External APIs (Gemini, etc.) | 🔴 Planned     |
| **Memory**         | Conversation history, context          | `MemoryState`  | PGlite                       | 🔴 Planned     |
| **Git** _(future)_ | Version control                        | `GitState`     | isomorphic-git               | 🔴 Future      |

### **Domain Structure Pattern**

```
src/domains/<domain-name>/
├── api/
│   ├── <Domain>API.ts       # Public interface (ONLY exports)
│   ├── contracts.ts          # Zod schemas for inputs/outputs
│   └── events.ts             # Domain event definitions
├── core/
│   ├── <Domain>Service.ts    # Business logic
│   ├── <Domain>Store.ts      # TanStack Store slice
│   └── <Domain>Repository.ts # Data persistence (optional)
├── adapters/
│   ├── WebContainers*.ts     # Infrastructure adapters
│   └── FileSystem*.ts
└── index.ts                  # Re-exports public API ONLY
```

**Critical Rule:** Other domains ONLY import from `@/domains/<name>` (index.ts), **NEVER** from `core/` or `adapters/`.

---

## **🔧 Tech Stack Deep Dive**

### **TanStack Start (React Meta-Framework)**

> **MCP Research Required:** Use **Context7** to look up TanStack Start docs for:
>
> - File-based routing patterns (`src/routes/`)
> - Server functions (createServerFn)
> - SSR vs client-only routes
> - Asset loading strategies

**Architecture Integration:**

```typescript
// TanStack Start file-based routing
src/routes/
├── __root.tsx                # Root layout (global providers)
├── index.tsx                 # Landing page
├── ide/
│   ├── index.tsx             # IDE workspace route
│   ├── $projectId.tsx        # Dynamic project route
│   └── _layout.tsx           # IDE-specific layout
└── onboarding/
    ├── index.tsx
    └── llm-provider.tsx

// How domains integrate with routes:
// routes/ide/index.tsx
import { useIDEAPI } from '@/domains/ide'

export default function IDERoute() {
  const ideAPI = useIDEAPI()  // Hook from IDE domain

  return <IDEWorkspace />
}
```

**Key TanStack Start Patterns:**

- **Server Functions:** Not used (100% client-side app)
- **Route Loaders:** Use for permission checks (File System API status)
- **Route Actions:** Not applicable (no form submissions to server)
- **Lazy Loading:** Critical for Monaco/xterm.js bundle size

---

### **TanStack AI (Multi-Provider AI SDK)**

> **MCP Research Required:** Use **Context7** for:
>
> - TanStack AI tool definition patterns
> - Streaming responses with React hooks
> - Provider switching strategies
> - Error handling best practices

**Architecture Integration:**

```typescript
// Tool definition (Agent Domain)
import { tool } from '@tanstack/ai'
import { z } from 'zod'

export const writeFileTool = tool({
  id: 'writeFile',
  description: 'Write content to a file',
  parameters: z.object({
    path: z.string(),
    content: z.string(),
  }),
  execute: async ({ path, content }, context) => {
    // Cross-domain call to IDE
    const ideAPI = context.getDependency('ideAPI')
    await ideAPI.fileOperations.writeFile(path, content)

    return { success: true }
  },
})

// Provider configuration (LLM Domain)
import { createGemini } from '@tanstack/ai-gemini'

export const geminiProvider = createGemini({
  apiKey: await llmStore.getAPIKey('gemini'),
  model: 'gemini-2.0-flash-exp',
})
```

**Critical Patterns:**

- **Tool Context:** Inject domain APIs via context, not global imports
- **Streaming:** Use `useChat` hook for real-time responses
- **Error Boundaries:** Wrap AI calls in React error boundaries
- **Cancellation:** Support AbortController for long-running tools

---

### **TanStack Store (State Management)**

> **MCP Research Required:** Use **Context7** for:
>
> - Store composition patterns
> - Middleware (logging, persistence)
> - Derived state selectors
> - React integration hooks

**Architecture Integration:**

```typescript
// Central state manager (Integration Layer)
import { Store } from '@tanstack/store'

// Domain slices
import { ideStore } from '@/domains/ide/core/IDEStore'
import { agentStore } from '@/domains/agent/core/AgentStore'
import { projectStore } from '@/domains/project/core/ProjectStore'

// Root store (combines all domains)
export const rootStore = new Store({
  ide: ideStore.state,
  agent: agentStore.state,
  project: projectStore.state,
})

// Sync to PGlite middleware
rootStore.subscribe((state) => {
  // Debounced persist to PGlite
  persistToPGlite(state)
})

// React hook
export function useRootStore() {
  return useStore(rootStore)
}
```

**State Persistence Strategy:**

- **Session State:** Keep in memory (terminal buffers)
- **UI State:** Persist to localStorage (panel sizes, theme)
- **Project Data:** Persist to PGlite (files, settings) AND local FS
- **Secrets:** Encrypt before localStorage (API keys)

---

### **WebContainers + File System Access API (Tier 2)**

> **MCP Research Required:** Use **Tavily/Exa** for:
>
> - WebContainers + FS Access API sync patterns
> - Performance optimization (debounced writes)
> - Conflict resolution (browser edit vs external edit)
> - Large file handling

**Architecture Integration:**

```typescript
// Dual File System (Infrastructure Layer)
export class DualFileSystem {
  constructor(
    private virtualFS: WebContainer, // In-memory
    private localFS: FileSystemDirectoryHandle | null, // Real disk
  ) {}

  async writeFile(path: string, content: string) {
    // 1. Write to WebContainers (immediate, for dev server)
    await this.virtualFS.fs.writeFile(path, content)

    // 2. Queue sync to local FS (debounced)
    if (this.localFS) {
      this.queueLocalSync(path, content)
    }

    // 3. Emit event for other domains
    eventBus.emit('fs.file.changed', { path, content })
  }

  private queueLocalSync(path: string, content: string) {
    // Debounce 500ms to avoid thrashing disk
    clearTimeout(this.syncTimer)
    this.syncTimer = setTimeout(() => {
      this.writeToDisk(path, content)
    }, 500)
  }
}
```

**Permission Flow:**

```typescript
// Onboarding: Request FS permission
const handle = await window.showDirectoryPicker({
  id: 'via-gent-projects',
  mode: 'readwrite',
  startIn: 'documents',
})

// Store handle in app state
permissionStore.setState({ projectDir: handle })

// Future sessions: Permission persists
// (user can revoke in browser settings)
```

---

## **🔗 Cross-Domain Communication**

### **Event-Driven Architecture**

```typescript
// Central Event Bus (Integration Layer)
import EventEmitter from 'eventemitter3'

export const eventBus = new EventEmitter()

// Domain event types
export type DomainEvent =
  | { type: 'ide.file.opened'; payload: { path: string } }
  | { type: 'agent.tool.invoked'; payload: { toolId: string; params: any } }
  | { type: 'project.bootstrap.complete'; payload: { projectId: string } }
// ... etc

// Type-safe emit/on
export function emitEvent<T extends DomainEvent>(event: T) {
  eventBus.emit(event.type, event.payload)
}

export function onEvent<T extends DomainEvent['type']>(
  eventType: T,
  handler: (payload: Extract<DomainEvent, { type: T }>['payload']) => void,
) {
  eventBus.on(eventType, handler)
}
```

**Event Flow Example:**

```
User clicks file in tree
  → IDE Domain: emitEvent({ type: 'ide.file.opened', ... })
    → Memory Domain: onEvent('ide.file.opened', addToContext)
    → Agent Domain: onEvent('ide.file.opened', updateFileKnowledge)
    → Analytics (future): onEvent('ide.file.opened', trackEvent)
```

---

### **Cross-Domain Contracts**

> **Critical:** All cross-domain calls MUST go through typed contracts validated with Zod

```typescript
// src/core/contracts/FileOperations.ts
import { z } from 'zod'

export const FileOperationContracts = {
  readFile: {
    version: '1.0.0',
    input: z.object({ path: z.string() }),
    output: z.object({ content: z.string(), encoding: z.string() }),
    errors: ['FILE_NOT_FOUND', 'PERMISSION_DENIED', 'READ_ERROR'] as const,
  },

  writeFile: {
    version: '1.0.0',
    input: z.object({
      path: z.string(),
      content: z.string(),
      createDirs: z.boolean().default(true),
    }),
    output: z.object({ success: z.boolean(), bytesWritten: z.number() }),
    errors: ['PERMISSION_DENIED', 'DISK_FULL', 'WRITE_ERROR'] as const,
  },
}

// Usage in Agent Domain tools
const result = await ideAPI.fileOperations.writeFile(
  FileOperationContracts.writeFile.input.parse({
    path: 'src/App.tsx',
    content: newCode,
  }),
)
```

---

## **📐 Layer Responsibilities**

### **1. Presentation Layer**

**Location:** `src/routes/`, `src/components/`

**Responsibilities:**

- React components (presentational only)
- TanStack Router route definitions
- UI state (form inputs, modals)
- Event handlers that delegate to Application Layer

**Rules:**

- ❌ NO business logic
- ❌ NO direct domain imports (use hooks from Application Layer)
- ✅ ONLY UI rendering and user interaction

---

### **2. Application Layer**

**Location:** `src/app/`

```
src/app/
├── hooks/
│   ├── useIDEWorkspace.ts   # Combines IDE + Project domains
│   ├── useAgentChat.ts      # Combines Agent + Memory domains
│   └── useProjectSetup.ts   # Coordinates onboarding flow
├── use-cases/
│   ├── CreateProject.ts     # Multi-domain orchestration
│   ├── OpenFile.ts
│   └── RunAgent.ts
└── workflows/
    ├── OnboardingFlow.ts
    └── BootstrapFlow.ts
```

**Responsibilities:**

- Orchestrate multiple domains for user workflows
- Translate UI actions into domain operations
- Error handling and user feedback
- Loading states and optimistic updates

**Example:**

```typescript
// src/app/hooks/useIDEWorkspace.ts
import { useIDEAPI } from '@/domains/ide'
import { useProjectAPI } from '@/domains/project'
import { useAgentAPI } from '@/domains/agent'

export function useIDEWorkspace() {
  const ide = useIDEAPI()
  const project = useProjectAPI()
  const agent = useAgentAPI()

  const openFileWithAgent = async (path: string) => {
    // 1. Open in IDE
    await ide.fileTree.openFile(path)

    // 2. Load into agent context
    const content = await ide.editor.getContent(path)
    await agent.context.addFile(path, content)

    // 3. Update project recent files
    project.addRecentFile(path)
  }

  return { openFileWithAgent, ...ide, ...project }
}
```

---

### **3. Domain Layer**

**Location:** `src/domains/<domain>/`

**Responsibilities:**

- Business logic for bounded context
- State management (TanStack Store slice)
- Expose typed public API
- Emit domain events

**Rules:**

- ❌ NO UI rendering
- ❌ NO direct calls to other domains' internals
- ✅ CAN listen to other domains' events
- ✅ CAN call other domains via their public API

---

### **4. Integration Layer**

**Location:** `src/core/`

```
src/core/
├── events/
│   ├── EventBus.ts          # Central pub/sub
│   └── DomainEvents.ts      # Type definitions
├── state/
│   ├── RootStore.ts         # Combines domain stores
│   └── PersistMiddleware.ts # Sync to PGlite
├── contracts/
│   └── FileOperations.ts    # Shared type contracts
└── types/
    └── SharedTypes.ts       # Cross-cutting types
```

**Responsibilities:**

- Event bus for domain communication
- Root store that combines all domain slices
- Persistence middleware
- Shared type definitions

---

### **5. Infrastructure Layer**

**Location:** `src/infrastructure/`

```
src/infrastructure/
├── file-systems/
│   ├── DualFileSystem.ts     # WebContainers + FS Access API
│   ├── VirtualFS.ts          # WebContainers wrapper
│   └── LocalFS.ts            # FS Access API wrapper
├── database/
│   ├── PGliteClient.ts       # PGlite connection
│   └── schema.ts             # Drizzle schema
├── ai/
│   ├── GeminiProvider.ts
│   └── TanStackAIClient.ts
└── permissions/
    └── FileSystemPermissions.ts
```

**Responsibilities:**

- External system integrations
- Browser API wrappers
- Database connections
- Third-party SDK adapters

---

## **🔄 Development Workflow Integration**

### **Agent-OS (Spec-Driven) Workflow**

```yaml
Agent-OS Process:
  1. Create spec in agent-os/specs/<date>-<feature>/
     - spec.md (requirements, user stories)
     - tasks.md (granular task breakdown)
     - orchestration.yml (agent assignments)

  2. Run agent orchestration:
     $ agent-os execute agent-os/specs/<spec>/orchestration.yml

  3. Agents implement tasks in parallel:
     - Each agent reads spec + tasks
     - Implements assigned task group
     - Marks tasks complete in tasks.md

  4. Integration phase:
     - Manual review of cross-domain boundaries
     - Run integration tests
     - Update this architecture doc if new domains added
```

**Anti-Fragmentation Measures:**

✅ **Before Starting Spec:**

1. Review this architecture doc
2. Identify which domain(s) the feature belongs to
3. Check for cross-domain dependencies
4. Define event contracts upfront

✅ **During Implementation:**

1. Follow domain structure pattern strictly
2. Use event bus for cross-domain communication
3. Validate inputs/outputs with Zod contracts
4. Write integration tests, not just unit tests

✅ **After Implementation:**

1. Update domain API exports
2. Document new events in DomainEvents.ts
3. Update architecture doc if layers changed
4. Run full integration test suite

---

### **BMAD v6 (Quick-Flow UX/UI) Workflow**

```yaml
BMAD v6 Process (for UX/UI rapid iteration): 1. Designer creates visual mockups
  2. Convert to Storybook stories first (isolated)
  3. Wire stories to domain hooks
  4. Test in isolation before integration
  5. Integrate into routes
```

**Integration with Agent-OS:**

```
BMAD for: Component design, styling, interaction states
Agent-OS for: Domain logic, API wiring, data flow

Example:
  BMAD creates FileTreeComponent.stories.tsx (visual only)
  Agent-OS wires to IDE Domain via useFileTree() hook
  Integration: FileTreeComponent gets data from hook
```

---

## **🚨 Anti-Fragmentation Checklist**

### **For Every New Feature**

- [ ] **Domain Identification:** Which domain(s) does this belong to?
- [ ] **Cross-Domain Map:** What events will it emit? What events will it listen to?
- [ ] **Contract Definition:** Define Zod schemas for all inputs/outputs
- [ ] **State Slice:** Add to appropriate domain store (don't create new root store)
- [ ] **Event Registration:** Register events in `DomainEvents.ts`
- [ ] **API Export:** Add to domain's `index.ts` public API
- [ ] **Integration Test:** Write test that spans multiple domains
- [ ] **Architecture Update:** Update this doc if new cross-dependency added

---

## **📚 MCP Research Directives**

### **When to Use Which MCP Server**

| Question Type                          | MCP Server     | Example Query                                          |
| -------------------------------------- | -------------- | ------------------------------------------------------ |
| "How does **via-gent** do X?"          | **DeepWiki**   | "How is TanStack Store currently used in via-gent?"    |
| "How does **TanStack Start/AI** do X?" | **Context7**   | "TanStack AI tool context injection pattern"           |
| "What's the best practice for X?"      | **Tavily/Exa** | "WebContainers + File System Access API sync strategy" |
| "Show me code from **via-gent** for X" | **DeepWiki**   | "Show existing Monaco editor integration code"         |

### **Required Research Areas**

```yaml
TanStack Start:
  - File-based routing edge cases
  - Code splitting strategies
  - Route loaders vs React Query
  - Asset optimization

TanStack AI:
  - Tool execution lifecycle
  - Stream cancellation
  - Provider fallback strategies
  - Multi-turn conversations

WebContainers:
  - Boot time optimization
  - Memory limits per browser
  - File system sync performance
  - Process management

File System Access API:
  - Permission persistence
  - Conflict resolution
  - Watch API integration
  - Cross-platform quirks (Chrome vs Safari)
```

---

## **✅ Success Criteria**

### **Architecture Is Working When:**

✅ New features can be added to one domain without breaking others  
✅ Spec-driven development doesn't create integration debt  
✅ Cross-domain communication is event-driven, not tightly coupled  
✅ State is centralized but domain-scoped  
✅ Tests span domains (not just unit tests)  
✅ Tier 2 local file system syncs reliably  
✅ AI agents can call tools without knowing IDE internals

### **Red Flags (Fragmentation Detected):**

🚨 Direct imports from another domain's `core/` folder  
🚨 Duplicated state (two stores tracking same data)  
🚨 Global functions instead of domain APIs  
🚨 Hardcoded file paths in multiple places  
🚨 Event handlers that don't use event bus  
🚨 Tests that mock entire domains instead of contracts

---

## **🎯 Next Steps**

1. **Immediate (Week 1):**
   - Implement Permission Manager for Tier 2
   - Create IDE Domain structure (`src/domains/ide/`)
   - Set up DualFileSystem (WebContainers + FS Access API)
   - Add event bus to Integration Layer

2. **Short-Term (Week 2-4):**
   - Complete IDE Domain implementation (per Core Browser IDE Shell spec)
   - Create Agent Domain with TanStack AI tools
   - Wire LLM Domain for provider management
   - Build onboarding flow with file system permissions

3. **Medium-Term (Month 2):**
   - Add Git integration (isomorphic-git)
   - Implement Memory Domain with context management
   - Build Project Domain for templates/bootstrap
   - Create advanced agent workflows

4. **Long-Term (Month 3+):**
   - Multi-project management
   - MCP Server bridge (Tier 3)
   - Collaborative features
   - Plugin system

---

## **📝 Document Maintenance**

**Update Triggers:**

- New domain added
- New cross-domain dependency
- Major tech stack change
- New tier/layer introduced
- Breaking contract change

**Review Cadence:**

- After each major spec completion
- Monthly architecture review
- Before starting large features

**Version History:**

- v1.0.0: Initial architecture (Tier 1 browser-only)
- v2.0.0: Updated for Tier 2 local FS access (this version)

---

**END OF ARCHITECTURE DOCUMENT**

---

This architecture serves as the **single source of truth** for via-gent's structure. For implementation details, always refer to:

- **Specs:** `agent-os/specs/*/spec.md`
- **Tasks:** `agent-os/specs/*/tasks.md`
- **MCP Research:** DeepWiki (codebase) + Context7 (TanStack docs) + Tavily/Exa (community)
