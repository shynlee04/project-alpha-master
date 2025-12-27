Perfect! Now I have the context. Let me create a comprehensive anti-fragmentation architecture for via-gent. This will be a substantial document.

---

# **🏗️ Via-Gent High-Level Architecture: Anti-Fragmentation Design**

**Version:** 1.0.0  
**Date:** December 7, 2025  
**Repository:** [shynlee04/via-gent](https://github.com/shynlee04/via-gent)  
**Purpose:** Prevent spec-driven development fragmentation in multi-agent IDE platform

---

## **📋 Executive Summary**

### **The Fragmentation Problem**

When developing with AI agents using spec-driven methodology, **phased implementation creates architectural silos**:

```
❌ FRAGMENTED APPROACH (Current Risk):
Phase 1: IDE Shell → Isolated file tree, Monaco, terminals
Phase 2: Gemini Integration → Separate LLM provider layer
Phase 3: Agent Tools → Disconnected tool implementations
Phase 4: Bootstrap Logic → Independent project scaffolding

Result: Components that "work" individually but don't integrate
```

### **The Solution**

**Central Integration Layer (CIL)** + **Domain-Driven Architecture** + **Contract-First Development**

```
✅ INTEGRATED APPROACH (This Architecture):
┌─────────────────────────────────────────────────────┐
│         Central Integration Layer (EventBus)        │
│  Shared state • Type contracts • Cross-domain APIs  │
└─────────────────────────────────────────────────────┘
         ↓                    ↓                    ↓
   [IDE Domain]      [Agent Domain]       [Project Domain]
   (file tree,       (LLM, tools,         (bootstrap,
    Monaco,          coordination)         templates)
    terminals)
```

---

## **🎯 Architecture Principles**

### **1. Domain-Driven Design (DDD)**

```typescript
// Domains are bounded contexts with clear responsibilities
interface Domain {
  name: string
  responsibility: string
  publicAPI: Record<string, Function>
  privateImplementation: any
  events: DomainEvent[]
}
```

### **2. Contract-First Development**

```typescript
// All cross-domain communication via typed contracts
interface Contract<TInput, TOutput> {
  version: string
  input: z.ZodSchema<TInput>
  output: z.ZodSchema<TOutput>
  errorCodes: string[]
}
```

### **3. Event-Driven Integration**

```typescript
// Domains communicate through event bus, not direct calls
eventBus.emit('file.opened', { path: 'src/App.tsx' })
eventBus.on('file.opened', (event) => {
  // Other domains react independently
})
```

### **4. Dependency Injection**

```typescript
// No hardcoded dependencies - all injected via DI container
class FileTreeComponent {
  constructor(
    private fileSystem: IFileSystem, // Interface, not concrete
    private eventBus: IEventBus,
    private stateManager: IStateManager,
  ) {}
}
```

---

## **🏛️ System Architecture Overview**

### **Layer 1: Foundation Layer**

```
┌──────────────────────────────────────────────────────┐
│                  FOUNDATION LAYER                    │
├──────────────────────────────────────────────────────┤
│ • Type System (Zod schemas)                          │
│ • Event Bus (EventEmitter3)                          │
│ • DI Container (Awilix / TSyringe)                   │
│ • State Manager (TanStack Store + sync layer)        │
│ • Logger (Pino with structured logging)              │
└──────────────────────────────────────────────────────┘
```

**Location:** `src/core/`

```
src/core/
├── events/
│   ├── EventBus.ts          # Central event bus
│   ├── DomainEvents.ts      # Event type definitions
│   └── EventSubscriptions.ts # Typed subscriptions
├── di/
│   ├── Container.ts         # DI container setup
│   ├── ServiceRegistry.ts   # Service registration
│   └── Lifetime.ts          # Singleton/Transient/Scoped
├── state/
│   ├── StateManager.ts      # Global state coordination
│   ├── StateSyncMiddleware.ts # PGlite sync
│   └── StateSlices.ts       # Domain-specific slices
├── types/
│   ├── Contracts.ts         # Inter-domain contracts
│   ├── DomainTypes.ts       # Domain-specific types
│   └── SharedTypes.ts       # Cross-cutting types
└── logger/
    ├── Logger.ts            # Structured logging
    └── LoggerConfig.ts      # Log levels, transports
```

---

### **Layer 2: Domain Layer**

```
┌──────────────────────────────────────────────────────┐
│                    DOMAIN LAYER                      │
├──────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │   IDE    │  │  Agent   │  │ Project  │          │
│  │  Domain  │  │  Domain  │  │  Domain  │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │   LLM    │  │  Memory  │  │   Git    │          │
│  │  Domain  │  │  Domain  │  │  Domain  │          │
│  └──────────┘  └──────────┘  └──────────┘          │
└──────────────────────────────────────────────────────┘
```

**Domain Structure Pattern:**

```
src/domains/<domain-name>/
├── api/
│   ├── <Domain>API.ts       # Public interface
│   ├── Contracts.ts          # Input/output schemas
│   └── Events.ts             # Domain events
├── core/
│   ├── <Domain>Service.ts    # Business logic
│   ├── <Domain>Store.ts      # Domain state
│   └── <Domain>Repository.ts # Data access
├── infrastructure/
│   ├── adapters/             # External integrations
│   └── providers/            # Service implementations
└── index.ts                  # Exports public API only
```

---

### **Layer 3: Application Layer**

```
┌──────────────────────────────────────────────────────┐
│                APPLICATION LAYER                     │
├──────────────────────────────────────────────────────┤
│ • Use Cases (orchestration across domains)           │
│ • Workflows (multi-step processes)                   │
│ • UI Controllers (React components + hooks)          │
└──────────────────────────────────────────────────────┘
```

**Location:** `src/app/`

```
src/app/
├── use-cases/
│   ├── CreateProject.ts     # Orchestrates Project + IDE
│   ├── OpenFile.ts          # Orchestrates IDE + Agent
│   └── RunDevServer.ts      # Orchestrates Project + IDE
├── workflows/
│   ├── OnboardingFlow.ts    # LLM + Project setup
│   └── BootstrapFlow.ts     # Project + IDE initialization
└── controllers/
    ├── IDEController.tsx    # IDE UI orchestration
    └── AgentController.tsx  # Agent UI orchestration
```

---

## **🔍 Detailed Domain Specifications**

### **Domain 1: IDE Domain**

**Responsibility:** File tree, Monaco editor, terminals, preview panel

```typescript
// src/domains/ide/api/IDEAPI.ts
export interface IDEAPI {
  // File Tree
  fileTree: {
    refresh(): Promise<void>
    openFile(path: string): Promise<void>
    createFile(path: string, content: string): Promise<void>
    deleteFile(path: string): Promise<void>
    expandFolder(path: string): void
    collapseFolder(path: string): void
  }

  // Editor
  editor: {
    openTab(path: string): Promise<void>
    closeTab(path: string): void
    saveFile(path: string, content: string): Promise<void>
    getContent(path: string): Promise<string>
    setActiveTab(path: string): void
  }

  // Terminals
  terminals: {
    execute(terminal: TerminalType, command: string): Promise<ProcessResult>
    clear(terminal: TerminalType): void
    restart(terminal: TerminalType): Promise<void>
    setActive(terminal: TerminalType): void
  }

  // Preview
  preview: {
    show(): void
    hide(): void
    refresh(): void
    getStatus(): PreviewStatus
  }
}

// Events emitted by IDE Domain
export const IDEDomainEvents = {
  FILE_OPENED: 'ide.file.opened',
  FILE_SAVED: 'ide.file.saved',
  FILE_CREATED: 'ide.file.created',
  FILE_DELETED: 'ide.file.deleted',
  TAB_CHANGED: 'ide.tab.changed',
  TERMINAL_OUTPUT: 'ide.terminal.output',
  TERMINAL_ERROR: 'ide.terminal.error',
  PREVIEW_READY: 'ide.preview.ready',
} as const
```

**State Schema:**

```typescript
// src/domains/ide/core/IDEStore.ts
export interface IDEState {
  fileTree: {
    root: string
    expanded: Set<string>
    selected: string | null
    loading: boolean
  }

  editor: {
    openTabs: string[]
    activeTab: string | null
    dirtyTabs: Set<string>
    content: Map<string, string>
  }

  terminals: {
    dev: TerminalState
    test: TerminalState
    terminal: TerminalState
    activeTerminal: TerminalType
  }

  preview: {
    visible: boolean
    url: string | null
    status: 'idle' | 'loading' | 'ready' | 'error'
  }

  panels: {
    fileTreeWidth: number
    terminalHeight: number
    previewWidth: number | null
  }
}
```

**Integration Points:**

```typescript
// How other domains interact with IDE
import { container } from '@/core/di'
import type { IDEAPI } from '@/domains/ide'

// Agent Domain opens a file
const ideAPI = container.resolve<IDEAPI>('IDEAPI')
await ideAPI.fileTree.openFile('src/App.tsx')

// OR via events (preferred for loose coupling)
import { eventBus } from '@/core/events'
eventBus.emit('agent.requestFileOpen', { path: 'src/App.tsx' })
```

---

### **Domain 2: Agent Domain**

**Responsibility:** LLM providers, agent orchestration, tool execution

```typescript
// src/domains/agent/api/AgentAPI.ts
export interface AgentAPI {
  // LLM Provider Management
  providers: {
    register(provider: LLMProvider): void
    setActive(providerId: string): void
    getActive(): LLMProvider
    testConnection(provider: LLMProvider): Promise<boolean>
  }

  // Agent Execution
  agents: {
    create(config: AgentConfig): Agent
    execute(agentId: string, input: string): Promise<AgentResponse>
    stream(agentId: string, input: string): AsyncIterator<AgentChunk>
    stop(agentId: string): void
  }

  // Tool Management
  tools: {
    register(tool: AgentTool): void
    unregister(toolId: string): void
    list(): AgentTool[]
    invoke(toolId: string, params: any): Promise<any>
  }

  // Coordination
  coordinator: {
    startSession(config: CoordinatorConfig): Promise<Session>
    sendMessage(sessionId: string, message: string): Promise<Response>
    endSession(sessionId: string): void
  }
}

// Events
export const AgentDomainEvents = {
  TOOL_INVOKED: 'agent.tool.invoked',
  TOOL_RESULT: 'agent.tool.result',
  AGENT_RESPONSE: 'agent.response',
  AGENT_ERROR: 'agent.error',
  COORDINATOR_QUESTION: 'agent.coordinator.question',
  COORDINATOR_COMPLETE: 'agent.coordinator.complete',
} as const
```

**Tool Contracts:**

```typescript
// src/domains/agent/api/Contracts.ts
import { z } from 'zod'

export const FileOperationContract = {
  readFile: {
    input: z.object({ path: z.string() }),
    output: z.object({ content: z.string() }),
    version: '1.0.0',
  },

  writeFile: {
    input: z.object({
      path: z.string(),
      content: z.string(),
    }),
    output: z.object({ success: z.boolean() }),
    version: '1.0.0',
  },

  createFile: {
    input: z.object({
      path: z.string(),
      content: z.string(),
    }),
    output: z.object({ success: z.boolean() }),
    version: '1.0.0',
  },
}
```

**State Schema:**

```typescript
export interface AgentState {
  providers: {
    registered: LLMProvider[]
    active: string | null
  }

  agents: {
    instances: Map<string, Agent>
    running: Set<string>
  }

  tools: {
    registered: Map<string, AgentTool>
    executionHistory: ToolExecution[]
  }

  coordinator: {
    activeSessions: Map<string, CoordinatorSession>
    currentQuestion: number
    answers: Record<string, any>
  }
}
```

---

### **Domain 3: Project Domain**

**Responsibility:** Project configuration, templates, bootstrapping

```typescript
// src/domains/project/api/ProjectAPI.ts
export interface ProjectAPI {
  // Project Lifecycle
  create(config: ProjectConfig): Promise<Project>
  open(projectId: string): Promise<Project>
  close(projectId: string): Promise<void>
  delete(projectId: string): Promise<void>

  // Templates
  templates: {
    list(): Template[]
    get(templateId: string): Template
    bootstrap(template: Template, config: any): Promise<BootstrapResult>
  }

  // Configuration
  config: {
    get(projectId: string): ProjectConfig
    update(projectId: string, updates: Partial<ProjectConfig>): Promise<void>
    validate(config: ProjectConfig): ValidationResult
  }

  // Dev Server
  devServer: {
    start(projectId: string): Promise<void>
    stop(projectId: string): Promise<void>
    getStatus(projectId: string): DevServerStatus
  }
}

// Events
export const ProjectDomainEvents = {
  PROJECT_CREATED: 'project.created',
  PROJECT_OPENED: 'project.opened',
  PROJECT_CLOSED: 'project.closed',
  BOOTSTRAP_STARTED: 'project.bootstrap.started',
  BOOTSTRAP_PROGRESS: 'project.bootstrap.progress',
  BOOTSTRAP_COMPLETE: 'project.bootstrap.complete',
  BOOTSTRAP_ERROR: 'project.bootstrap.error',
  DEV_SERVER_STARTED: 'project.devServer.started',
  DEV_SERVER_READY: 'project.devServer.ready',
  DEV_SERVER_ERROR: 'project.devServer.error',
} as const
```

**State Schema:**

```typescript
export interface ProjectState {
  current: {
    id: string | null
    name: string
    framework: string
    config: ProjectConfig | null
  }

  bootstrap: {
    status: 'idle' | 'running' | 'complete' | 'error'
    progress: number
    currentStep: string
    logs: string[]
  }

  devServer: {
    status: 'idle' | 'starting' | 'running' | 'error'
    port: number | null
    url: string | null
  }

  templates: {
    available: Template[]
    selected: string | null
  }
}
```

---

### **Domain 4: LLM Domain**

**Responsibility:** LLM provider abstraction, API key management, model configuration

```typescript
// src/domains/llm/api/LLMAPI.ts
export interface LLMAPI {
  // Provider Management
  addProvider(provider: LLMProviderConfig): Promise<void>
  removeProvider(providerId: string): Promise<void>
  listProviders(): LLMProvider[]
  setActive(providerId: string): void
  getActive(): LLMProvider | null

  // API Key Management
  keys: {
    save(providerId: string, key: string): Promise<void>
    validate(providerId: string, key: string): Promise<boolean>
    delete(providerId: string): Promise<void>
  }

  // Model Configuration
  models: {
    list(providerId: string): Model[]
    select(providerId: string, modelId: string): void
    getConfig(modelId: string): ModelConfig
  }

  // Generation
  generate(prompt: string, options?: GenerateOptions): Promise<string>
  stream(prompt: string, options?: StreamOptions): AsyncIterator<string>
}

// Events
export const LLMDomainEvents = {
  PROVIDER_ADDED: 'llm.provider.added',
  PROVIDER_ACTIVE: 'llm.provider.active',
  KEY_VALIDATED: 'llm.key.validated',
  MODEL_SELECTED: 'llm.model.selected',
  GENERATION_START: 'llm.generation.start',
  GENERATION_COMPLETE: 'llm.generation.complete',
  GENERATION_ERROR: 'llm.generation.error',
} as const
```

---

### **Domain 5: Memory Domain**

**Responsibility:** Conversation history, context management, persistence

```typescript
// src/domains/memory/api/MemoryAPI.ts
export interface MemoryAPI {
  // Session Memory
  session: {
    create(sessionId: string): Promise<void>
    add(sessionId: string, message: Message): Promise<void>
    get(sessionId: string): Promise<Message[]>
    clear(sessionId: string): Promise<void>
  }

  // Long-term Memory (PGlite)
  longTerm: {
    save(key: string, value: any): Promise<void>
    load(key: string): Promise<any>
    delete(key: string): Promise<void>
    query(filter: MemoryFilter): Promise<any[]>
  }

  // Context Management
  context: {
    build(sessionId: string, maxTokens: number): Promise<string>
    summarize(messages: Message[]): Promise<string>
    prune(sessionId: string, strategy: PruneStrategy): Promise<void>
  }
}

// Events
export const MemoryDomainEvents = {
  MESSAGE_ADDED: 'memory.message.added',
  CONTEXT_BUILT: 'memory.context.built',
  PERSISTED: 'memory.persisted',
} as const
```

---

### **Domain 6: Git Domain** _(Future)_

**Responsibility:** Version control, commits, branches

_(Placeholder - not in Vertical Slice 0)_

---

## **🔗 Cross-Domain Data Flow**

### **Example: User Opens a File**

```
┌─────────────────────────────────────────────────────────┐
│ User clicks file in tree                                │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ UI Component: FileTreeItem.onClick()                    │
│ → calls IDEController.openFile(path)                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Application Layer: IDEController                        │
│ → useCase = container.resolve('OpenFileUseCase')        │
│ → useCase.execute(path)                                 │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Use Case: OpenFileUseCase                               │
│ 1. Get IDE API: ideAPI = container.resolve('IDEAPI')    │
│ 2. Read file: content = await ideAPI.editor.getContent()│
│ 3. Open tab: await ideAPI.editor.openTab(path)          │
│ 4. Emit event: eventBus.emit('ide.file.opened', ...)    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ IDE Domain: IDEService                                  │
│ → Updates IDEStore (TanStack Store)                     │
│ → Triggers Monaco to load content                       │
│ → Persists to PGlite via StateSyncMiddleware            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Event Bus: 'ide.file.opened' event                      │
└─────────────────────────────────────────────────────────┘
        ↓                             ↓
┌───────────────────┐        ┌───────────────────┐
│ Memory Domain     │        │ Agent Domain      │
│ → Logs file open  │        │ → Updates context │
└───────────────────┘        └───────────────────┘
```

---

### **Example: Agent Modifies a File**

```
┌─────────────────────────────────────────────────────────┐
│ User: "Add a button to HomePage.tsx"                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Agent Domain: CoordinatorAgent                          │
│ → Generates plan using LLM                              │
│ → Decides to use 'writeFile' tool                       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Agent Domain: ToolRegistry                              │
│ → Resolves 'writeFile' tool                             │
│ → Validates input against FileOperationContract         │
│ → Calls tool.execute({ path, content })                 │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Tool Implementation: WriteFileTool                      │
│ → Gets IDE API via DI: ideAPI = container.resolve()     │
│ → Calls: await ideAPI.editor.saveFile(path, content)    │
│ → Emits: eventBus.emit('agent.tool.invoked', ...)       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ IDE Domain: IDEService                                  │
│ → Writes to WebContainers FS                            │
│ → Updates editor content (if tab is open)               │
│ → Marks tab as dirty                                    │
│ → Emits: eventBus.emit('ide.file.saved', ...)           │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Event Bus: Multiple listeners react                     │
│ • UI: Shows toast "Agent updated HomePage.tsx"          │
│ • Memory: Logs modification to history                  │
│ • Project: Triggers HMR via dev server                  │
└─────────────────────────────────────────────────────────┘
```

---

## **🛠️ Implementation Guides**

### **Phase 0: Foundation Setup (Week 1)**

**Goal:** Establish core infrastructure before any domain work

```bash
# 1. Install dependencies
pnpm add eventemitter3 awilix zod pino
pnpm add -D @types/node

# 2. Create core structure
mkdir -p src/core/{events,di,state,types,logger}

# 3. Implement EventBus
touch src/core/events/EventBus.ts
touch src/core/events/DomainEvents.ts

# 4. Implement DI Container
touch src/core/di/Container.ts
touch src/core/di/ServiceRegistry.ts

# 5. Implement State Manager
touch src/core/state/StateManager.ts
touch src/core/state/StateSyncMiddleware.ts
```

**Deliverables:**

- ✅ Event bus operational
- ✅ DI container can register/resolve services
- ✅ State manager syncs to PGlite
- ✅ Logger outputs structured logs

---

### **Phase 1: Core IDE Domain (Week 2-3)**

**Goal:** Implement IDE domain using foundation layer

```bash
# 1. Create domain structure
mkdir -p src/domains/ide/{api,core,infrastructure}

# 2. Define API contracts
touch src/domains/ide/api/IDEAPI.ts
touch src/domains/ide/api/Contracts.ts
touch src/domains/ide/api/Events.ts

# 3. Implement core services
touch src/domains/ide/core/IDEService.ts
touch src/domains/ide/core/IDEStore.ts

# 4. Build infrastructure
touch src/domains/ide/infrastructure/WebContainersAdapter.ts
touch src/domains/ide/infrastructure/MonacoAdapter.ts
touch src/domains/ide/infrastructure/XtermAdapter.ts

# 5. Register with DI
# Add to src/core/di/ServiceRegistry.ts
container.register({
  IDEAPI: asClass(IDEService).singleton(),
  WebContainersAdapter: asClass(WebContainersAdapter).singleton(),
  // ...
})
```

**Integration Test:**

```typescript
// src/domains/ide/__tests__/integration.test.ts
describe('IDE Domain Integration', () => {
  test('opening file updates state and emits event', async () => {
    const ideAPI = container.resolve<IDEAPI>('IDEAPI')
    const eventSpy = vi.fn()

    eventBus.on('ide.file.opened', eventSpy)

    await ideAPI.fileTree.openFile('src/App.tsx')

    expect(eventSpy).toHaveBeenCalledWith({
      type: 'ide.file.opened',
      payload: { path: 'src/App.tsx' },
    })

    const state = ideStore.state
    expect(state.editor.activeTab).toBe('src/App.tsx')
  })
})
```

---

### **Phase 2: LLM + Agent Domains (Week 3-4)**

**Goal:** Build agent infrastructure without touching IDE

```bash
# 1. Implement LLM Domain first (dependency for Agent)
mkdir -p src/domains/llm/{api,core,infrastructure}
touch src/domains/llm/api/LLMAPI.ts
touch src/domains/llm/core/LLMService.ts
touch src/domains/llm/infrastructure/GeminiProvider.ts

# 2. Implement Agent Domain
mkdir -p src/domains/agent/{api,core,infrastructure}
touch src/domains/agent/api/AgentAPI.ts
touch src/domains/agent/core/AgentService.ts
touch src/domains/agent/core/ToolRegistry.ts
touch src/domains/agent/infrastructure/tools/ReadFileTool.ts
touch src/domains/agent/infrastructure/tools/WriteFileTool.ts

# 3. Register services
container.register({
  LLMAPI: asClass(LLMService).singleton(),
  AgentAPI: asClass(AgentService).singleton(),
  ToolRegistry: asClass(ToolRegistry).singleton()
})
```

**Tool Implementation Pattern:**

```typescript
// src/domains/agent/infrastructure/tools/WriteFileTool.ts
import { injectable, inject } from 'awilix'
import type { IDEAPI } from '@/domains/ide'
import { FileOperationContract } from '../api/Contracts'

@injectable()
export class WriteFileTool implements AgentTool {
  constructor(
    @inject('IDEAPI') private ideAPI: IDEAPI,
    @inject('EventBus') private eventBus: IEventBus,
    @inject('Logger') private logger: ILogger,
  ) {}

  async execute(params: unknown) {
    // Validate input
    const input = FileOperationContract.writeFile.input.parse(params)

    // Execute via IDE API (cross-domain call)
    await this.ideAPI.editor.saveFile(input.path, input.content)

    // Emit event
    this.eventBus.emit('agent.tool.invoked', {
      tool: 'writeFile',
      params: input,
    })

    // Log
    this.logger.info('Tool executed', { tool: 'writeFile', path: input.path })

    return { success: true }
  }
}
```

---

### **Phase 3: Project Domain + Bootstrap (Week 4-5)**

```bash
# 1. Create domain
mkdir -p src/domains/project/{api,core,infrastructure}
touch src/domains/project/api/ProjectAPI.ts
touch src/domains/project/core/ProjectService.ts
touch src/domains/project/core/BootstrapOrchestrator.ts

# 2. Implement templates
mkdir -p src/domains/project/infrastructure/templates
touch src/domains/project/infrastructure/templates/TanStackStartTemplate.ts

# 3. Bootstrap orchestrator coordinates IDE + Project domains
```

**Bootstrap Orchestrator Pattern:**

```typescript
// src/domains/project/core/BootstrapOrchestrator.ts
export class BootstrapOrchestrator {
  constructor(
    private projectAPI: ProjectAPI,
    private ideAPI: IDEAPI,
    private eventBus: IEventBus,
  ) {}

  async execute(config: ProjectConfig): Promise<void> {
    // Step 1: Create project
    this.eventBus.emit('project.bootstrap.started', config)

    // Step 2: Run template bootstrap (in terminal)
    const template = this.getTemplate(config.framework)
    const result = await this.ideAPI.terminals.execute(
      'terminal',
      template.getBootstrapCommand(config),
    )

    // Step 3: Wait for completion
    await this.waitForBootstrap(result)

    // Step 4: Open initial files (cross-domain)
    for (const path of template.initialFiles) {
      await this.ideAPI.fileTree.openFile(path)
    }

    // Step 5: Start dev server
    await this.ideAPI.terminals.execute('dev', 'pnpm dev')

    // Step 6: Wait for dev server ready
    await this.waitForDevServer()

    // Step 7: Show preview
    this.ideAPI.preview.show()

    this.eventBus.emit('project.bootstrap.complete', config)
  }
}
```

---

### **Phase 4: Use Cases + Workflows (Week 5-6)**

**Goal:** Orchestrate domains into user-facing features

```bash
mkdir -p src/app/{use-cases,workflows,controllers}
touch src/app/use-cases/CreateProject.ts
touch src/app/workflows/OnboardingFlow.ts
touch src/app/controllers/IDEController.tsx
```

**Use Case Pattern:**

```typescript
// src/app/use-cases/CreateProject.ts
export class CreateProjectUseCase {
  constructor(
    private llmAPI: LLMAPI,
    private agentAPI: AgentAPI,
    private projectAPI: ProjectAPI,
    private ideAPI: IDEAPI,
    private eventBus: IEventBus,
  ) {}

  async execute(userInput: string): Promise<Project> {
    // 1. Coordinator asks questions (Agent Domain)
    const coordinator = await this.agentAPI.coordinator.startSession({
      systemPrompt: COORDINATOR_PROMPT,
    })

    const answers = await this.runInterviewFlow(coordinator)

    // 2. Generate project config (Agent Domain)
    const projectConfig = this.buildProjectConfig(answers)

    // 3. Bootstrap project (Project Domain)
    const project = await this.projectAPI.create(projectConfig)

    // 4. Open IDE (IDE Domain)
    await this.ideAPI.fileTree.refresh()

    // 5. Start dev server (cross-domain orchestration)
    const bootstrapOrchestrator = container.resolve('BootstrapOrchestrator')
    await bootstrapOrchestrator.execute(projectConfig)

    return project
  }
}
```

---

## **📐 Key Interfaces & Contracts**

### **IEventBus**

```typescript
// src/core/events/IEventBus.ts
export interface IEventBus {
  emit<T = any>(event: string, payload: T): void
  on<T = any>(
    event: string,
    handler: (payload: T) => void | Promise<void>,
  ): () => void
  once<T = any>(
    event: string,
    handler: (payload: T) => void | Promise<void>,
  ): void
  off(event: string, handler?: Function): void
}
```

### **IStateManager**

```typescript
// src/core/state/IStateManager.ts
export interface IStateManager {
  getSlice<T>(domain: string): Store<T>
  subscribe<T>(domain: string, callback: (state: T) => void): () => void
  persist(domain: string, state: any): Promise<void>
  restore(domain: string): Promise<any>
}
```

### **IDependencyContainer**

```typescript
// src/core/di/IDependencyContainer.ts
export interface IDependencyContainer {
  register<T>(
    name: string,
    factory: ServiceFactory<T>,
    lifetime?: Lifetime,
  ): void
  resolve<T>(name: string): T
  createScope(): IDependencyContainer
}
```

---

## **🧪 Testing Strategy**

### **Unit Tests (Per Domain)**

```typescript
// Test domain logic in isolation with mocked dependencies
describe('IDEService', () => {
  let ideService: IDEService
  let mockFS: jest.Mocked<IFileSystem>
  let mockEventBus: jest.Mocked<IEventBus>

  beforeEach(() => {
    mockFS = createMockFileSystem()
    mockEventBus = createMockEventBus()
    ideService = new IDEService(mockFS, mockEventBus)
  })

  test('openFile reads from FS and emits event', async () => {
    mockFS.readFile.mockResolvedValue('file content')

    await ideService.openFile('src/App.tsx')

    expect(mockFS.readFile).toHaveBeenCalledWith('src/App.tsx')
    expect(mockEventBus.emit).toHaveBeenCalledWith('ide.file.opened', ...)
  })
})
```

### **Integration Tests (Cross-Domain)**

```typescript
// Test communication between domains via event bus
describe('Agent writes file', () => {
  test('writeFile tool updates IDE', async () => {
    const agentAPI = container.resolve<AgentAPI>('AgentAPI')
    const ideAPI = container.resolve<IDEAPI>('IDEAPI')

    await agentAPI.tools.invoke('writeFile', {
      path: 'src/test.txt',
      content: 'Hello',
    })

    const content = await ideAPI.editor.getContent('src/test.txt')
    expect(content).toBe('Hello')
  })
})
```

### **E2E Tests (Full Workflows)**

```typescript
// Test complete user journeys
describe('Create Project E2E', () => {
  test('User creates project from scratch', async () => {
    // 1. Onboard LLM provider
    await onboardGemini(process.env.GEMINI_API_KEY)

    // 2. Start coordinator
    const useCase = container.resolve('CreateProjectUseCase')
    const project = await useCase.execute('Build a landing page')

    // 3. Verify IDE state
    expect(ideStore.state.editor.openTabs).toContain('src/routes/index.tsx')

    // 4. Verify dev server
    expect(projectStore.state.devServer.status).toBe('running')

    // 5. Verify preview
    expect(ideStore.state.preview.visible).toBe(true)
  })
})
```

---

## **📊 Architecture Governance**

### **Dependency Rules (Enforced by ESLint)**

```typescript
// .eslintrc.js
module.exports = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['*/domains/*/core/*'],
            message:
              'Cannot import domain internals. Use public API from /api/index.ts',
          },
          {
            group: ['*/domains/ide/*'],
            message: 'IDE domain can only be accessed via IDEAPI interface',
          },
        ],
      },
    ],
  },
}
```

### **Architecture Decision Records (ADRs)**

```
docs/architecture/decisions/
├── 001-event-driven-architecture.md
├── 002-domain-driven-design.md
├── 003-dependency-injection-pattern.md
├── 004-contract-first-apis.md
└── 005-state-management-strategy.md
```

### **API Versioning**

```typescript
// All contracts include version
export const FileOperationContract = {
  readFile: {
    version: '1.0.0', // Semantic versioning
    input: z.object({ path: z.string() }),
    output: z.object({ content: z.string() }),
  },
}

// Breaking changes require new version
export const FileOperationContractV2 = {
  readFile: {
    version: '2.0.0',
    input: z.object({
      path: z.string(),
      encoding: z.string().optional(), // New optional field = minor version
    }),
    output: z.object({
      content: z.string(),
      metadata: z.object({ size: z.number() }), // New required field = major version
    }),
  },
}
```

---

## **🚀 Migration Path**

### **Refactoring Existing Code**

```typescript
// BEFORE (fragmented)
// src/components/FileTree.tsx - directly calls WebContainers
import { webcontainers } from '@/lib/webcontainers'

function FileTree() {
  const openFile = async (path: string) => {
    const content = await webcontainers.fs.readFile(path, 'utf-8')
    setEditorContent(content)
  }
}

// AFTER (domain-driven)
// src/components/FileTree.tsx - uses IDE API
import { useIDEAPI } from '@/domains/ide'

function FileTree() {
  const ideAPI = useIDEAPI()

  const openFile = async (path: string) => {
    await ideAPI.fileTree.openFile(path) // Domain handles everything
  }
}
```

---

## **📚 Developer Onboarding**

### **Quick Start Guide**

```bash
# 1. Clone and install
git clone https://github.com/shynlee04/via-gent
cd via-gent
pnpm install

# 2. Understand architecture
cat docs/architecture/OVERVIEW.md

# 3. Find your domain
ls src/domains/  # Pick one: ide, agent, project, llm, memory

# 4. Read domain README
cat src/domains/ide/README.md

# 5. Start development
pnpm dev

# 6. Run tests
pnpm test src/domains/ide
```

### **New Feature Checklist**

- [ ] Which domain does this belong to?
- [ ] Does it need a new domain? (rarely yes)
- [ ] Define API contract (input/output schemas)
- [ ] Define events (what notifications does it emit?)
- [ ] Implement service logic
- [ ] Register with DI container
- [ ] Write unit tests (mock dependencies)
- [ ] Write integration tests (real event bus)
- [ ] Update domain README
- [ ] Create ADR if architectural decision made

---

## **🎯 Success Metrics**

| Metric               | Target                          | How to Measure    |
| -------------------- | ------------------------------- | ----------------- |
| **Coupling**         | < 10% cross-domain imports      | ESLint violations |
| **Cohesion**         | > 80% domain-internal calls     | Static analysis   |
| **Test Coverage**    | > 85% per domain                | Jest coverage     |
| **Integration Time** | < 1 hour to add domain          | Developer survey  |
| **Onboarding Time**  | < 4 hours to first contribution | New dev tracking  |

---

## **📖 Summary**

This architecture prevents fragmentation by:

1. **Clear Boundaries**: Each domain is a bounded context with public API
2. **Contract-First**: All cross-domain communication via typed contracts
3. **Event-Driven**: Loose coupling through event bus
4. **DI-Based**: No hardcoded dependencies
5. **State Isolation**: Each domain owns its state slice
6. **Testability**: Mocking at domain boundaries is trivial

**Result:** Spec-driven phases can be implemented independently without breaking integration, because contracts are defined upfront and enforced at runtime.

---

**Next Steps:**

1. Review and approve this architecture
2. Implement Phase 0 (Foundation) in Week 1
3. Create boilerplate generators for domains
4. Train team on DDD + Event-Driven patterns
5. Start Core IDE Domain implementation

Ready to build an **integral, anti-fragmented** via-gent platform! 🚀
