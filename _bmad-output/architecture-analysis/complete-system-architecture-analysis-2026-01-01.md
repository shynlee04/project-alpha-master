# Via-Gent (Project Alpha v2.0) - Complete System Architecture Analysis
**Analysis Date:** 2026-01-01
**Total Source Lines:** 172,582
**Total Files:** 4,094
**God Classes (>300 lines):** 135 files identified
**Repository Path:** /Users/apple/Documents/coding-projects/project-alpha-master

---

## Executive Summary

Via-Gent is a browser-based IDE that runs code locally using WebContainers with integrated AI agent capabilities. The project is evolving toward a **Knowledge Synthesis Station** — a local-first platform that merges Google NotebookLM-style AI synthesis with Notion-like knowledge organization.

### Current Development Phase
**Phase 1 Priority: Core Stabilization**
- Chat Cascade System fixes
- LLM Provider Configuration hot-reload visibility bugs
- State Management unification (Zustand + Dexie)
- Mobile Support with responsive layouts
- Database Persistence schema refinement

### Technical Debt Criticality
- **135 God Classes** (files >300 lines)
- **State Management Duplication** - 25+ stores across 3 locations
- **Cross-Interface Inconsistency** - Multiple state sync mechanisms
- **Architecture Migration In Progress** - Infrastructure layer being introduced

---

## 1. Complete File Tree Structure

### Root Architecture
```
project-alpha-master/
├── _bmad/                          # BMAD method governance and workflows
│   ├── _config/                    # Agent configurations, IDE settings
│   ├── _memory/                    # Storyteller sidecar memory
│   ├── bmb/                        # Builder module agents & workflows
│   ├── bmm/                        # Implementation agents & workflows
│   └── cis/                        # Creative/Innovation strategy agents
│
├── src/
│   ├── __tests__/                  # Root-level test files
│   ├── about/                      # Deprecated (moved to presentation)
│   ├── application/                # Application services (migrating out)
│   ├── components/                 # Legacy React components (DEPRECATED)
│   ├── core/                       # Domain entities (NEW architecture layer)
│   ├── domain/                     # Value objects (NEW architecture layer)
│   ├── hooks/                      # Custom React hooks
│   ├── infrastructure/             # NEW: Infrastructure layer
│   ├── i18n/                       # Internationalization (en, vi)
│   ├── lib/                        # Core business logic (legacy)
│   ├── mocks/                      # Mock data for testing
│   ├── presentation/               # NEW: UI components layer
│   ├── routes/                     # TanStack Router file-based routes
│   ├── stores/                     # Legacy Zustand stores (DEPRECATED)
│   ├── styles/                     # Global CSS, design tokens
│   └── utils/                      # Utility functions
│
├── _bmad-output/                   # BMAD artifacts and sprint tracking
├── docs/                           # Technical documentation
├── public/                         # Static assets
├── .cursor/                        # Cursor IDE configurations
├── .windsurf/                      # Windsurf workflows
└── _kilocode/                      # Kilocode task history
```

### Key Directories by Line Count

#### **High-Impact God Classes (>500 lines)**
```
src/lib/state/dexie-db.ts                          (1267 lines) - CRITICAL
src/infrastructure/persistence/dexie-db.ts         (1061 lines) - CRITICAL
src/lib/state/__tests__/knowledge-store.test.ts   (1024 lines)
src/lib/state/rag-store.ts                         (877 lines)
src/infrastructure/persistence/stores/rag-store.ts (810 lines)
src/lib/sync/__tests__/reverse-sync-service.test.ts (798 lines)
src/stores/conversation-threads-store.ts           (726 lines)
src/lib/state/knowledge-store.ts                   (718 lines)
src/stores/agents-store.test.ts                    (697 lines)
src/lib/state/dexie-db-migrations.ts               (691 lines)
src/lib/workspace/__tests__/session-snapshot.test.ts (677 lines)
src/lib/agent/tools/__tests__/retry-queue.test.ts  (670 lines)
src/lib/state/quiz-store.ts                        (629 lines)
src/lib/state/conversation-store.ts                (626 lines)
src/__tests__/chat.test.ts                         (621 lines)
src/infrastructure/persistence/stores/canvas-store.ts (619 lines)
src/lib/state/canvas-store.ts                      (613 lines)
src/lib/agent/factory.ts                           (612 lines)
src/infrastructure/persistence/stores/knowledge-store.ts (598 lines)
src/lib/agent/providers/__tests__/credential-vault.test.ts (584 lines)
src/lib/workspace/__tests__/project-metadata.test.ts (580 lines)
src/lib/notes/markdown-converter.ts                 (578 lines)
src/lib/agent/facades/file-tools-impl.ts            (578 lines)
src/lib/notes/note-store.ts                        (566 lines)
src/lib/utils/error-classification.ts               (563 lines)
src/lib/sync/reverse-sync-service.ts                (561 lines)
src/lib/rag/orama-index.ts                         (550 lines)
src/lib/agent/tools/retry-queue.ts                  (547 lines)
src/infrastructure/persistence/dexie-db-migrations.ts (541 lines)
```

---

## 2. LLM Provider System Analysis

### 2.1 Credential Vault (Refactored - Dec 30, 2025)

**Location:** `/src/lib/agent/providers/credential-vault.ts` (467 lines)

**Architecture:** 3-Module Facade Pattern
```
credential-vault.ts (Public API Facade)
├── credential-storage.ts (IndexedDB operations)
└── credential-encryption.ts (AES-256-GCM encryption)
```

**Security Features:**
- **AES-256-GCM** encryption via Web Crypto API
- **PBKDF2-SHA256** key derivation (100,000 iterations)
- **Salt + IV + Authentication Tag** for cryptographic security
- **Obfuscated localStorage keys** (`vg_ek_v3`, `vg_salt_v3`, `vg_kv_v3`, `vg_vp_v3`)
- **IndexedDB persistence** for encrypted credentials
- **Vault status API** for debugging initialization issues

**Key Methods:**
```typescript
class CredentialVault {
  async getStatus(): Promise<VaultStatus>
  async initialize(password: string): Promise<void>
  async setCredential(providerId: string, apiKey: string): Promise<void>
  async getCredential(providerId: string): Promise<string | null>
  async removeCredential(providerId: string): Promise<void>
  async clear(): Promise<void>
  async verifyEncryptionCompliance(): Promise<boolean>
}
```

**Cross-Interface Reactivity:**
- **localStorage events** for credential changes
- **crossWorkspaceEventBus** emits `ProviderConfigChangeEvent`
- **Hot-reload visibility bug** (BF-01) - FIXED via Zustand persistence

**Integration Points:**
1. **AgentConfigDialog** (`src/presentation/components/agent/AgentConfigDialog.tsx`)
2. **useAgentsStore** (`src/stores/agents-store.ts`) - Main agent config store
3. **ProviderAdapter** (`src/lib/agent/providers/provider-adapter.ts`) - Runtime credential access
4. **AgentFactory** (`src/lib/agent/factory.ts`) - Agent creation with credentials

### 2.2 Provider Configuration System

**Location:** `/src/lib/state/provider-store.ts` (152 lines)

**Architecture:**
```typescript
interface ProviderState {
  providers: Provider[]
  activeProviderId: string | null
  _hasHydrated: boolean

  // CRUD operations
  addProvider(provider: Omit<Provider, 'id'>): Provider
  removeProvider(id: string): void
  updateProvider(id: string, updates: Partial<Provider>): void
  getProvider(id: string): Provider | undefined
  setActiveProvider(id: string | null): void
}
```

**Provider Registry:**
- **Location:** `/src/lib/agent/providers/model-registry.ts` (365 lines)
- **Providers Supported:** OpenRouter, Anthropic, OpenAI, Google Gemini, DeepSeek
- **Models:** 50+ models across providers with pricing/tier metadata

**Provider Adapter Factory:**
```typescript
// src/lib/agent/providers/provider-adapter.ts
class ProviderAdapterFactory {
  static createAdapter(providerId: string, config: ProviderConfig): ProviderAdapter
}
```

**Supported Adapters:**
- `OpenRouterAdapter` - Multi-provider routing via OpenRouter API
- `AnthropicAdapter` - Claude models (native API)
- `OpenAIAdapter` - GPT-4, GPT-3.5 (native API)
- `GoogleAdapter` - Gemini models (via @google/genai SDK)
- `DeepSeekAdapter` - DeepSeek-V3 models
- `OpenAICompatibleAdapter` - Custom endpoints (Together, Groq, etc.)

**Hot-Reload Visibility Bug (BF-01) - RESOLVED:**
- **Problem:** Store hydration from Dexie delayed, causing stale provider lists
- **Solution:** Zustand persist middleware with Dexie storage adapter
- **Code:** `src/lib/state/dexie-storage.ts` (createDexieStorage utility)

---

## 3. Agent Configuration System

### 3.1 Centralized Agent Store

**Location:** `/src/stores/agents-store.ts` (429 lines)

**Schema:**
```typescript
interface Agent {
  // Identity
  id: string                    // Unique ID (agt_*)
  name: string                  // Display name
  description: string           // What this agent does

  // Provider + Model references (foreign keys)
  providerId: string            // 'openrouter', 'anthropic', etc.
  modelId: string               // 'mistralai/devstral-2512:free', etc.

  // LLM Parameters
  systemPrompt: string
  temperature: number
  maxTokens: number
  topP: number

  // Configuration
  tools: Tool[]                 // Available tools
  workspaceBindings: WorkspaceBinding[]  // Where agent is available

  // Metadata
  status: 'online' | 'offline' | 'busy'
  tasksCompleted: number
  successRate: number
  tokensUsed: number
  lastActive: string            // ISO timestamp
  createdAt: string             // ISO timestamp
}
```

**Workspace Binding System:**
```typescript
interface WorkspaceBinding {
  workspaceType: WorkspaceType   // 'ide' | 'notes' | 'knowledge' | 'study'
  isAvailable: boolean           // Whether agent can be used in workspace
  enabledTools: Tool[]           // Tools available in this workspace
}

// Example: Agent available in IDE and Knowledge, but NOT in Notes
{
  workspaceType: 'ide',
  isAvailable: true,
  enabledTools: ['read_file', 'write_file', 'execute_command']
}
```

**Key Methods:**
```typescript
interface AgentsState {
  // Workspace-aware methods (Ralph Loop Gap Resolution)
  getAgentsForWorkspace(workspaceType: WorkspaceType): Agent[]
  updateWorkspaceBinding(agentId: string, workspaceType: WorkspaceType, isAvailable: boolean): void
  updateAgentWorkspaceBinding(agentId: string, workspaceType: WorkspaceType, binding: Partial<WorkspaceBinding>): void
  getAgentWorkspaceBinding(agentId: string, workspaceType: WorkspaceType): WorkspaceBinding | undefined
  isAgentAvailableInWorkspace(agentId: string, workspaceType: WorkspaceType): boolean
}
```

### 3.2 Hot-Loading Agent Configuration

**Persistence Layer:**
- **Zustand Store:** `useAgentsStore` (main agent config store)
- **Dexie Storage:** `createDexieStorage` adapter (IndexedDB backend)
- **Hydration:** `_hasHydrated` flag tracks restoration from storage
- **Cross-Workspace Events:** Emits `AgentConfigChangeEvent` on updates

**Hot-Reload Flow:**
```typescript
// 1. User updates agent in AgentConfigDialog
const { updateAgent } = useAgentsStore()
updateAgent(agentId, { temperature: 0.8 })

// 2. Store persists to IndexedDB via Dexie storage adapter
// 3. crossWorkspaceEventBus emits AgentConfigChangeEvent
// 4. All workspaces reactively update agent lists
crossWorkspaceEventBus.onAgentConfig((event) => {
  console.log('Agent config changed:', event)
  // Refresh agent selectors, tool permissions, etc.
})
```

**Bug:** Hot-reload visibility in other workspaces requires manual refresh
**Fix:** WB-8.3 Cross-Workspace Event System implementation

### 3.3 Workspace-Specific Tool Management

**Tool Permission Manager:**
- **Location:** `/src/lib/agent/tool-permission-manager.ts` (344 lines)
- **Architecture:** Singleton in-memory permission registry
- **Methods:**
  - `getPermissionLevel(toolName: string): 'auto-approve' | 'require-approval' | 'blocked'`
  - `setPermissionLevel(toolName: string, level: PermissionLevel): void`
  - `getToolsForWorkspace(workspaceType: WorkspaceType): Tool[]`

**Workspace Filter:**
- **Location:** `/src/lib/agent/workspace-tool-filter.ts`
- **Purpose:** Filters agent tools based on workspace context
- **Logic:**
  - IDE workspace: All file operations + terminal tools
  - Notes workspace: Read-only file access + note-specific tools
  - Knowledge workspace: RAG tools + embedding operations
  - Study workspace: Quiz generation + flashcard tools

**UI Integration:**
- **AgentConfigDialog** (`src/presentation/components/agent/AgentConfigDialog.tsx`) - Agent CRUD
- **WorkspacePermissionEditor** (`src/presentation/components/agent/WorkspacePermissionEditor.tsx`) - 370 lines
- **WorkspaceToolPermissionsConfig** (`src/presentation/components/agent/WorkspaceToolPermissionsConfig.tsx`) - 317 lines
- **ToolAvailabilityIndicator** (`src/presentation/components/agent/ToolAvailabilityIndicator.tsx`) - 340 lines

---

## 4. Chat Flow & Thread Management

### 4.1 Chat Hook Architecture

**Location:** `/src/lib/agent/hooks/use-agent-chat-with-tools.ts` (517 lines)

**Core Hook:**
```typescript
export function useAgentChatWithTools(options: UseAgentChatWithToolsOptions): UseAgentChatWithToolsReturn
```

**Options:**
```typescript
interface UseAgentChatWithToolsOptions {
  providerId?: string           // 'openrouter' (default)
  modelId?: string              // 'mistralai/devstral-2512:free'
  apiKey?: string               // From credentialVault
  endpoint?: string             // '/api/chat' (default)
  systemMessage?: string        // Custom system prompt

  // Tool facades
  fileTools?: AgentFileTools | null
  terminalTools?: AgentTerminalTools | null

  // Event bus for tool events
  eventBus?: WorkspaceEventEmitter | null

  // OpenAI-compatible provider support
  customBaseURL?: string
  customHeaders?: Record<string, string>
  enableTools?: boolean         // true (default)
}
```

**Return Value:**
```typescript
interface UseAgentChatWithToolsReturn {
  messages: Array<{ role: 'user' | 'assistant' | 'system' | 'tool'; content: string }>
  rawMessages: unknown[]         // TanStack AI messages with parts
  sendMessage: (content: string) => void
  isLoading: boolean
  error: Error | null
  providerId: string
  modelId: string
  toolCalls: ToolCallInfo[]      // Active tool calls
  toolsAvailable: boolean
  pendingApprovals: PendingApprovalInfo[]  // Story 25-5
  approveToolCall: (approvalId: string, toolCallId?: string) => void
  rejectToolCall: (approvalId: string, reason?: string, toolCallId?: string) => void
}
```

### 4.2 Tool Execution Flow

**Tool Factory:**
- **Location:** `/src/lib/agent/factory.ts` (612 lines)
- **Purpose:** Creates client-side tools with proper type safety
- **Integration:** `createAgentClientTools()` from TanStack AI

**Tool Facades:**
```typescript
// File Tools (578 lines)
interface AgentFileTools {
  readFile(filePath: string): Promise<string>
  writeFile(filePath: string, content: string): Promise<void>
  listFiles(dirPath: string): Promise<string[]>
  deleteFile(filePath: string): Promise<void>
  searchFiles(query: string, path: string): Promise<SearchResult[]>
}

// Terminal Tools (306 lines)
interface AgentTerminalTools {
  executeCommand(command: string, projectPath: string): Promise<CommandResult>
  startShell(projectPath: string): Promise<void>
  killShell(): Promise<void>
}
```

**Approval Flow (Story 25-5):**
```typescript
interface PendingApprovalInfo {
  approvalId: string             // Unique ID for this approval
  toolCallId: string             // Tool call ID from LLM
  toolName: string               // 'write_file', 'execute_command', etc.
  toolArgs: Record<string, unknown>
  riskLevel: 'low' | 'medium' | 'high'
  description: string            // What the tool will do
  proposedContent?: string       // For write_file: new content
}
```

**UI Integration:**
- **ApprovalOverlay** (`src/presentation/components/ui/ApprovalOverlay.tsx`) - 443 lines
- **ChatPanel** (`src/presentation/components/chat/ChatPanel.tsx`) - Main chat interface
- **AgentChatPanel** (`src/presentation/components/ide/AgentChatPanel.tsx`) - 316 lines

### 4.3 Conversation Thread Management

**Location:** `/src/stores/conversation-threads-store.ts` (726 lines)

**Schema:**
```typescript
interface ConversationThread {
  id: string                     // Unique thread ID
  agentId: string                // Which agent created this thread
  workspaceId: WorkspaceId       // 'ide' | 'notes' | 'knowledge' | 'study'
  projectPath?: string           // Optional: project-specific thread
  title: string                  // Auto-generated from first message
  messages: ConversationMessage[]
  createdAt: string              // ISO timestamp
  updatedAt: string              // ISO timestamp
  metadata: {
    tokenCount: number
    toolCalls: number
    approvalRate: number
  }
}

interface ConversationMessage {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  timestamp: string
  toolCalls?: ToolCallInfo[]
}
```

**Key Methods:**
```typescript
interface ConversationThreadsState {
  threads: ConversationThread[]
  activeThreadId: string | null

  createThread(agentId: string, workspaceId: WorkspaceId): ConversationThread
  deleteThread(threadId: string): void
  addMessage(threadId: string, message: ConversationMessage): void
  setActiveThread(threadId: string | null): void
  getThread(id: string): ConversationThread | undefined
  getThreadsForWorkspace(workspaceId: WorkspaceId): ConversationThread[]
}
```

**Thread Manager UI:**
- **Location:** `/src/presentation/components/chat/ThreadManager.tsx` (337 lines)
- **Features:**
  - Thread list with search/filter
  - Thread deletion with confirmation
  - Workspace-specific thread filtering
  - Auto-title generation from first message

### 4.4 Cascade Flow Architecture

**System Prompt Composer:**
- **Location:** `/src/lib/agent/prompt-composer.ts` (466 lines)
- **Purpose:** Compose layered system prompts with context
- **Layers:**
  1. **Base Layer:** Agent's system prompt
  2. **Tool Layer:** Available tools and descriptions
  3. **Context Layer:** File tree, project metadata, workspace context
  4. **Memory Layer:** Conversation history + agent memory (RAG)

**Composed Prompt Example:**
```markdown
# Base
You are an expert AI coding assistant...

# Tools
- read_file: Read file contents from the project
- write_file: Write or modify files
- execute_command: Execute terminal commands

# Context
Project: Via-Gent (Project Alpha v2.0)
Workspace: IDE
Open Files: src/App.tsx, src/lib/agent/factory.ts
Recent Files: src/stores/agents-store.ts

# Memory
Previous conversation about refactoring credential vault...
User prefers concise code examples...
```

**Multi-Modal Support:**
- **Image Input:** Via `gemini-image-processor.ts` (305 lines)
- **Audio Input:** Via `live-api-websocket.ts` (386 lines)
- **PDF Parsing:** Via `gemini-pdf-processor.ts` (482 lines)
- **URL Scraping:** Via `gemini-url-processor.ts` (408 lines)

---

## 5. Project Management & File System

### 5.1 Workspace Binding System

**Workspace Context:**
- **Location:** `/src/lib/workspace/WorkspaceContext.tsx`
- **Architecture:** React Context + Provider pattern
- **State:**
  - `workspaceId: WorkspaceId` - Current workspace ('ide' | 'notes' | 'knowledge' | 'study')
  - `projectHandle: FileSystemDirectoryHandle | null` - Local FS handle
  - `projectPath: string | null` - Project directory path
  - `syncManager: SyncManager | null` - Sync manager instance

**Workspace Types:**
```typescript
// src/domain/value-objects/workspace-type.ts
export type WorkspaceType = 'ide' | 'notes' | 'knowledge' | 'study';
```

**Workspace Switcher:**
- **Location:** `/src/presentation/components/workspace/WorkspaceEnhancedSwitcher.tsx` (395 lines)
- **Features:**
  - Workspace tabs with icons
  - Keyboard shortcuts (Ctrl+1, Ctrl+2, etc.)
  - Project context preservation across switches
  - Workspace-specific loading states

**Workspace Binding Dialog:**
- **Location:** `/src/presentation/components/hub/WorkspaceBindingDialog.tsx` (312 lines)
- **Purpose:** Configure project workspace associations
- **Features:**
  - Select workspace type for project
  - Configure workspace-specific settings
  - Persist to IndexedDB via `ProjectStore`

### 5.2 File System Sync Architecture

**Sync Manager (Refactored - Dec 31, 2025):**
- **Location:** `/src/lib/filesystem/sync-manager/`
- **Architecture:** Split into focused modules

```
sync-manager/
├── index.ts                    (Re-export facade)
├── sync-manager-factory.ts    (Factory pattern)
├── sync-manager-types.ts      (Type definitions)
├── sync-manager.ts            (Main orchestrator)
├── sync-batch-sync.ts         (Batch synchronization)
└── sync-file-ops.ts           (File operations)
```

**Main Sync Manager:**
```typescript
class SyncManager {
  // Local FS → WebContainer sync
  syncFileToWebContainer(filePath: string, content: string): Promise<void>
  syncDirectoryToWebContainer(dirPath: string): Promise<void>

  // Batch sync (debounced)
  batchSync(files: FileOperation[]): Promise<SyncResult>

  // Reverse sync (WebContainer → Local FS)
  syncFromWebContainerToLocal(sourcePath: string, destPath: string): Promise<void>

  // Sync status
  getSyncStatus(): SyncStatus
  onSyncStatusChange(callback: (status: SyncStatus) => void): void
}
```

**Local FS Adapter:**
- **Location:** `/src/lib/filesystem/local-fs-adapter.ts`
- **Purpose:** Abstraction over File System Access API
- **Key Methods:**
  - `readFile(path: string): Promise<string>`
  - `writeFile(path: string, content: string): Promise<void>`
  - `listDirectory(path: string): Promise<string[]>`
  - `watchFile(path: string): Observable<FileChangeEvent>`

**Sync Exclusions:**
```typescript
const SYNC_EXCLUSIONS = [
  '.git',
  'node_modules',
  '.DS_Store',
  'Thumbs.db',
  'dist',
  'build',
  '.next',
  '.cache'
];
```

**Sync Event Bus:**
- **Location:** `/src/lib/sync/sync-event-bus.ts` (347 lines)
- **Events:**
  - `file:synced` - File synced to WebContainer
  - `sync:error` - Sync operation failed
  - `sync:complete` - Batch sync completed
  - `file:conflict` - Merge conflict detected

### 5.3 Cross-Workspace File Operations

**Cross-Workspace Event Bus:**
- **Location:** `/src/lib/events/cross-workspace-event-bus.ts` (445 lines)
- **Purpose:** Broadcast events across workspace boundaries
- **Events:**

```typescript
// File changes
interface FileChangeEvent {
  workspaceId: WorkspaceId
  projectPath: string
  filePath: string
  changeType: 'created' | 'modified' | 'deleted'
  timestamp: Date
}

// Agent configuration changes
interface AgentConfigChangeEvent {
  workspaceId: WorkspaceId
  agentId: string
  changeType: 'created' | 'updated' | 'deleted'
  timestamp: Date
}

// Sync status
interface SyncStatusEvent {
  workspaceId: WorkspaceId
  projectPath: string
  status: 'syncing' | 'synced' | 'error'
  error?: string
  timestamp: Date
}

// Project state changes
interface ProjectStateChangeEvent {
  workspaceId: WorkspaceId
  projectId: string
  changeType: 'opened' | 'closed' | 'bindings-changed'
  timestamp: Date
}

// Workspace switches
interface WorkspaceChangeEvent {
  from: WorkspaceId
  to: WorkspaceId
  timestamp: string
}

// Provider configuration changes
interface ProviderConfigChangeEvent {
  providerId: string
  changeType: 'created' | 'updated' | 'deleted'
  timestamp: Date
}
```

**Usage Example:**
```typescript
// Emit file change event
crossWorkspaceEventBus.emitFileChange({
  workspaceId: 'ide',
  projectPath: '/Users/.../project-alpha',
  filePath: 'src/App.tsx',
  changeType: 'modified'
})

// Listen to file changes
crossWorkspaceEventBus.onFileChange((event) => {
  console.log('File changed in another workspace:', event)
  // Trigger file refresh, invalidate cache, etc.
})
```

**Hook Integration:**
- **Location:** `/src/lib/events/use-cross-workspace-events.ts`
- **Purpose:** React hook for subscribing to cross-workspace events
- **Usage:**
  ```typescript
  useCrossWorkspaceEvents({
    onFileChange: (event) => { /* handle file change */ },
    onAgentConfigChange: (event) => { /* handle agent config change */ },
    onWorkspaceChange: (event) => { /* handle workspace switch */ }
  })
  ```

### 5.4 Desktop Sync Patterns

**Desktop Sync Service:**
- **Location:** `/src/lib/sync/reverse-sync-service.ts` (561 lines)
- **Purpose:** Sync WebContainer changes back to local FS
- **Use Cases:**
  - `npm install` → Sync `node_modules` to local FS
  - `git clone` → Sync cloned repo to local FS
  - File creation in WebContainer → Sync to local FS

**Reverse Sync Flow:**
```typescript
class ReverseSyncService {
  // 1. Detect file creation in WebContainer
  onFileCreatedInWebContainer(filePath: string, content: string): void

  // 2. Confirm with user before syncing back
  async confirmSync(filePath: string): Promise<boolean>

  // 3. Write to local FS via LocalFSAdapter
  async syncToLocalFS(filePath: string, content: string): Promise<void>

  // 4. Update file metadata cache
  async updateFileMetadata(filePath: string): Promise<void>
}
```

**Reverse Sync Exclusions:**
- Auto-generated files (`.next`, `dist`, `build`)
- Lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`)
- Cache directories (`.cache`, `node_modules/.cache`)

---

## 6. State Management Patterns

### 6.1 Zustand Stores (Current Architecture)

**Three-Store Architecture (DEPRECATED - Migrating to Infrastructure Layer):**

```
src/stores/                    (Legacy - 6 stores)
├── agents-store.ts           (429 lines) - Agent configs
├── agent-selection.ts        - Selected agent state
└── conversation-threads-store.ts (726 lines) - Chat threads

src/lib/state/                 (Active - 19 stores)
├── ide-store.ts              (339 lines) - IDE layout, panels, open files
├── canvas-store.ts           (613 lines) - Canvas blocks, connections
├── knowledge-store.ts        (718 lines) - Knowledge sources, embeddings
├── rag-store.ts              (877 lines) - RAG queries, results
├── conversation-store.ts     (626 lines) - Conversations, messages
├── quiz-store.ts             (629 lines) - Quiz data, sessions
├── flashcard-store.ts        (516 lines) - Flashcard decks
├── provider-store.ts         (152 lines) - LLM providers
├── layout-store.ts           (4,186 lines) - Layout state
├── navigation-store.ts       (3,815 lines) - Navigation state
├── statusbar-store.ts        (6,952 lines) - Status bar state
├── dexie-db.ts               (1267 lines) - IndexedDB schema
├── dexie-db-migrations.ts    (691 lines) - DB migrations
├── dexie-storage.ts          (3,087 lines) - Zustand-Dexie adapter
├── hydration-manager.ts      (5,483 lines) - Store hydration
├── conversation-auto-restore.ts (4,806 lines) - Auto-restore conversations
└── session-snapshot-manager.ts (315 lines) - Session snapshots

src/infrastructure/persistence/stores/  (NEW - 25+ stores, DUPLICATE)
├── agents-store.test.ts       (5,015 lines)
├── agents/                    - Agent-specific stores
│   └── agent-selection-store.ts (416 lines)
├── canvas-store.ts           (619 lines)
├── knowledge-store.ts        (598 lines)
├── rag-store.ts              (810 lines)
├── conversation/             - Conversation stores
│   └── conversation-store.ts (456 lines)
├── quiz/                     - Quiz stores
│   └── quiz-store.ts         (305 lines)
└── rag/                      - RAG stores
    └── ...
```

### 6.2 God Classes Analysis

**Critical God Classes (>600 lines):**

1. **dexie-db.ts (1267 lines)** - CRITICAL
   - **Issue:** Monolithic database schema definition
   - **Impact:** Any schema change requires touching this massive file
   - **Refactor Target:** Split into domain-specific schema modules

2. **infrastructure/persistence/dexie-db.ts (1061 lines)** - DUPLICATE
   - **Issue:** Duplicate of lib/state/dexie-db.ts
   - **Impact:** Confusion about which is source of truth
   - **Refactor Target:** Consolidate into single location

3. **rag-store.ts (877 lines)** - CRITICAL
   - **Issue:** Complex RAG queries + caching + pagination logic
   - **Impact:** Difficult to test, modify, or extend RAG functionality
   - **Refactor Target:** Split into query-engine, cache-manager, pagination

4. **conversation-threads-store.ts (726 lines)** - HIGH PRIORITY
   - **Issue:** Thread management + message persistence + metadata
   - **Impact:** Slow load times, hard to optimize queries
   - **Refactor Target:** Separate thread-store, message-store, metadata-store

5. **knowledge-store.ts (718 lines)** - HIGH PRIORITY
   - **Issue:** Source CRUD + embeddings + graph operations
   - **Impact:** Knowledge graph operations are tangled with source management
   - **Refactor Target:** source-store.ts, embedding-store.ts, graph-store.ts

**Moderate God Classes (400-600 lines) - 35 files:**
- Most UI components (AgentConfigDialog, ChatConversation, etc.)
- Complex utilities (markdown-converter, error-classification)
- Service implementations (reverse-sync-service, orama-index)

### 6.3 State Management Technical Debt

**Key Issues:**

1. **Store Duplication (P0):**
   - `src/stores/` vs `src/lib/state/` vs `src/infrastructure/persistence/stores/`
   - **Impact:** 25+ duplicated stores, unclear ownership
   - **Migration Status:** IN PROGRESS (Infrastructure layer being introduced)

2. **Mixed Persistence Patterns (P1):**
   - Some stores use Zustand + Dexie (agents-store, provider-store)
   - Some stores use localStorage (deprecated)
   - Some stores use React Context (workspace, theme)
   - **Impact:** Inconsistent hydration, race conditions

3. **Context + Store Mixing (P1):**
   - WorkspaceContext (React Context) + workspace-store (Zustand)
   - ThemeContext (React Context) + theme-store (Zustand)
   - **Impact:** Double state management, sync issues

4. **No Clear State Boundaries (P2):**
   - IDE layout state mixed with file system state
   - Agent config mixed with tool permissions
   - **Impact:** Spaghetti dependencies, hard to refactor

5. **Hydration Race Conditions (P0):**
   - Multiple stores hydrating simultaneously
   - UI renders before stores are ready
   - **Impact:** Flash of missing data, incorrect initial state

**Migration Plan (December 2025 Patterns):**

```
Current Architecture:
├── src/stores/                    (Legacy Zustand)
├── src/lib/state/                 (Active Zustand)
├── src/infrastructure/persistence/stores/  (NEW - consolidating)

Target Architecture:
├── src/infrastructure/database/           (Dexie schema + migrations)
│   ├── schema/                    (Domain-specific schemas)
│   ├── migrations/                (Versioned migrations)
│   └── seed-data/                 (Default data)
│
├── src/infrastructure/persistence/stores/  (Zustand + Dexie)
│   ├── agents/                    (Agent-specific stores)
│   ├── conversations/             (Conversation stores)
│   ├── knowledge/                 (Knowledge stores)
│   ├── rag/                       (RAG stores)
│   └── workspace/                 (Workspace stores)
│
├── src/lib/state/                 (Ephemeral in-memory state)
│   ├── ide-store.ts              (IDE layout, panels)
│   ├── navigation-store.ts       (Navigation state)
│   └── statusbar-store.ts        (Status bar state)
│
└── DELETE src/stores/             (Legacy stores)
```

---

## 7. Integration Points

### 7.1 Agent-Tool Integration

**Tool Registry:**
- **Location:** `/src/lib/agent/tools/index.ts`
- **Tools:**
  - `read_file` - Read file contents (needsApproval: true)
  - `write_file` - Write/modify files (needsApproval: true)
  - `list_files` - List directory contents (needsApproval: false)
  - `execute_command` - Run terminal commands (needsApproval: true)
  - `search_knowledge` - RAG search (needsApproval: false)
  - `create_flashcard` - Generate flashcards (needsApproval: false)

**Tool Permission Levels:**
```typescript
enum PermissionLevel {
  AUTO_APPROVE = 'auto-approve',     // Low-risk operations (list_files)
  REQUIRE_APPROVAL = 'require-approval',  // Medium-risk (read_file, search_knowledge)
  BLOCKED = 'blocked'                // High-risk (execute_command, write_file)
}
```

**Tool Execution Flow:**
```
1. User sends message to agent
2. Agent decides to use tool (via LLM)
3. Tool call intercepted by approval middleware
4. Risk level assessed (low/medium/high)
5. If medium/high → Show approval UI
6. User approves/rejects
7. If approved → Execute tool via facade
8. Return result to LLM
9. LLM generates final response
```

**Tool Facades:**
```typescript
// src/lib/agent/facades/file-tools-impl.ts (578 lines)
class AgentFileToolsImpl implements AgentFileTools {
  constructor(
    private localFS: LocalFSAdapter,
    private syncManager: SyncManager,
    private eventBus: WorkspaceEventEmitter
  ) {}

  async readFile(filePath: string): Promise<string> {
    // 1. Check file permissions
    // 2. Read from local FS
    // 3. Emit file read event
    // 4. Return content
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    // 1. Validate file path
    // 2. Check write permissions
    // 3. Write to local FS
    // 4. Sync to WebContainer
    // 5. Emit file write event
  }
}
```

### 7.2 UX/UI Coverage

**Component Architecture (Migrating to presentation/):**

```
Legacy: src/components/
├── agent/                       → src/presentation/components/agent/
├── chat/                        → src/presentation/components/chat/
├── ide/                         → src/presentation/components/ide/
├── knowledge/                   → src/presentation/components/knowledge/
├── rag/                         → src/presentation/components/rag/
├── canvas/                      → src/presentation/components/canvas/
├── study/                       → src/presentation/components/study/
├── ui/                          → src/presentation/components/ui/
└── layout/                      → src/presentation/components/layout/
```

**Cross-Interface Consistency Issues:**

1. **Agent Selector Inconsistency:**
   - IDE workspace: Dropdown in AgentChatPanel
   - Notes workspace: Sidebar panel
   - Knowledge workspace: Top bar selector
   - **Gap:** No unified agent selection component

2. **Chat UI Inconsistency:**
   - IDE workspace: Full chat panel with tool approval
   - Notes workspace: Inline chat with slash commands
   - Knowledge workspace: RAG-focused chat with citations
   - **Gap:** Different chat components across workspaces

3. **Tool Permission UI Inconsistency:**
   - AgentConfigDialog: Tool permissions editor
   - WorkspacePermissionEditor: Workspace-specific permissions
   - WorkspaceToolPermissionsConfig: Granular tool config
   - **Gap:** 3 different UIs for similar functionality

**Design Tokens:**
- **Location:** `/src/styles/design-tokens.css` & `design-tokens.ts` (450 lines)
- **Tokens:**
  - Layout tokens (panel sizes, sidebar dimensions)
  - Color tokens (8-bit dark theme palette)
  - Typography tokens
  - Spacing and sizing tokens
  - Animation tokens

### 7.3 Cross-Interface Consistency

**Cross-Workspace Event Bus:**
- **Implementation:** EventEmitter3 singleton
- **Events:** File changes, agent config changes, sync status, workspace switches
- **Subscribers:**
  - Agent stores (refresh agent lists on config change)
  - File tree (refresh on file change)
  - Sync manager (sync on file modification)
  - Workspace switcher (update active workspace UI)

**Gap Analysis:**

1. **No Centralized State Orchestrator:**
   - Each workspace manages its own state independently
   - Cross-workspace events are fire-and-forget (no request-response)
   - **Impact:** Race conditions, stale state

2. **No Unified Error Handling:**
   - Each component has its own error handling
   - No global error boundary for agent operations
   - **Impact:** Inconsistent error UI, poor user experience

3. **No Centralized Loading States:**
   - Each workspace has its own loading indicators
   - No global loading overlay for critical operations
   - **Impact:** Confusing UX during long-running operations

---

## 8. December 2025 Patterns Assessment

### 8.1 Current Implementation vs Best Practices

**State Management:**
- **Current:** Mixed Zustand + Context + localStorage
- **Best Practice:** Zustand + Dexie for persistent state, React Context for ephemeral UI state
- **Gap:** 25+ duplicated stores, unclear ownership
- **Migration Status:** IN PROGRESS (Infrastructure layer being introduced)

**Component Architecture:**
- **Current:** Mixed src/components/ + src/presentation/components/
- **Best Practice:** Single src/presentation/components/ directory
- **Gap:** Duplicate components, unclear which to use
- **Migration Status:** IN PROGRESS (src/components/ deprecated)

**Database Layer:**
- **Current:** Monolithic dexie-db.ts (1267 lines)
- **Best Practice:** Domain-specific schema modules
- **Gap:** Any schema change requires touching massive file
- **Migration Status:** NOT STARTED

**API Layer:**
- **Current:** TanStack Router file-based routes (/src/routes/api/chat.ts)
- **Best Practice:** Service layer + API routes
- **Gap:** No service abstraction, business logic in route handlers
- **Migration Status:** NOT STARTED

**Testing:**
- **Current:** Vitest with jsdom, tests co-located in __tests__/
- **Best Practice:** ✅ FOLLOWING BEST PRACTICE
- **Gap:** None
- **Migration Status:** COMPLETE

### 8.2 Readiness for Migration

**High Readiness (Can Migrate Immediately):**
- ✅ **Testing Infrastructure** - Vitest + jsdom working well
- ✅ **Design Tokens** - Comprehensive token system in place
- ✅ **i18n** - English + Vietnamese translations complete
- ✅ **Error Handling** - error-classification.ts, error-handling.ts utilities
- ✅ **Component Library** - Radix UI + Tailwind standardized

**Medium Readiness (Needs Refactoring):**
- ⚠️ **State Management** - Infrastructure layer introduced, but 25+ duplicated stores remain
- ⚠️ **Component Architecture** - presentation/ layer created, but legacy components/ still exists
- ⚠️ **Database Schema** - Monolithic dexie-db.ts needs splitting
- ⚠️ **API Layer** - No service abstraction, business logic in routes

**Low Readiness (Major Refactoring Required):**
- ❌ **God Classes** - 135 files >300 lines, 40 files >500 lines
- ❌ **Spaghetti Code** - Mixed concerns in single files
- ❌ **State Synchronization** - Race conditions, hydration issues
- ❌ **Cross-Workspace Events** - Fire-and-forget, no request-response pattern

### 8.3 Recommended Migration Path

**Phase 1: Infrastructure Consolidation (Week 1-2)**
1. Complete migration to `src/infrastructure/persistence/stores/`
2. Delete legacy `src/stores/` directory
3. Consolidate duplicate stores
4. Implement centralized state orchestrator

**Phase 2: Database Refactoring (Week 3-4)**
1. Split `dexie-db.ts` into domain-specific schemas
2. Create migration scripts for each schema module
3. Implement versioned migrations
4. Add database seeding utilities

**Phase 3: Component Migration (Week 5-6)**
1. Complete migration to `src/presentation/components/`
2. Delete legacy `src/components/` directory
3. Standardize component APIs
4. Implement unified agent selector, chat UI, tool permission UI

**Phase 4: God Class Refactoring (Week 7-10)**
1. Prioritize god classes >600 lines
2. Split into focused modules
3. Write comprehensive tests
4. Update integration points

**Phase 5: Service Layer Introduction (Week 11-12)**
1. Create service layer for business logic
2. Move logic from route handlers to services
3. Implement service interfaces
4. Add service tests

---

## 9. Technical Debt Summary

### 9.1 Critical Debt (P0)

1. **State Management Duplication**
   - **Files:** 25+ duplicated stores across 3 locations
   - **Impact:** Confusion, sync issues, maintenance burden
   - **Effort:** 2-3 weeks
   - **Priority:** CRITICAL

2. **Monolithic Database Schema**
   - **Files:** dexie-db.ts (1267 lines), infrastructure/persistence/dexie-db.ts (1061 lines)
   - **Impact:** Any schema change touches massive files
   - **Effort:** 1-2 weeks
   - **Priority:** CRITICAL

3. **God Classes >600 lines**
   - **Files:** 23 critical god classes
   - **Impact:** Difficult to test, modify, extend
   - **Effort:** 4-6 weeks
   - **Priority:** HIGH

### 9.2 High Priority Debt (P1)

4. **Hydration Race Conditions**
   - **Files:** Multiple Zustand stores hydrating simultaneously
   - **Impact:** Flash of missing data, incorrect initial state
   - **Effort:** 1 week
   - **Priority:** HIGH

5. **Cross-Workspace Event System**
   - **Files:** cross-workspace-event-bus.ts (445 lines)
   - **Impact:** Fire-and-forget events, no request-response
   - **Effort:** 1-2 weeks
   - **Priority:** HIGH

6. **No Service Layer**
   - **Files:** All route handlers (/src/routes/api/)
   - **Impact:** Business logic in routes, hard to test
   - **Effort:** 2-3 weeks
   - **Priority:** MEDIUM

### 9.3 Medium Priority Debt (P2)

7. **Component Architecture Duplication**
   - **Files:** src/components/ + src/presentation/components/
   - **Impact:** Unclear which components to use
   - **Effort:** 1 week
   - **Priority:** MEDIUM

8. **Inconsistent Error Handling**
   - **Files:** Multiple error handling patterns
   - **Impact:** Inconsistent error UI
   - **Effort:** 1 week
   - **Priority:** MEDIUM

---

## 10. Recommendations

### 10.1 Immediate Actions (This Week)

1. **Complete State Consolidation**
   - Finish migration to `src/infrastructure/persistence/stores/`
   - Delete legacy `src/stores/` directory
   - Update all imports

2. **Fix Hydration Race Conditions**
   - Implement centralized hydration manager
   - Add loading overlays for stores
   - Prevent UI render until stores are hydrated

3. **Standardize Cross-Workspace Events**
   - Implement request-response pattern for critical events
   - Add event replay mechanism for missed events
   - Create event debugging tools

### 10.2 Short-Term Actions (Next 2-4 Weeks)

4. **Refactor Critical God Classes**
   - Split dexie-db.ts into domain-specific schemas
   - Split rag-store.ts into query-engine, cache-manager, pagination
   - Split conversation-threads-store.ts into thread-store, message-store, metadata-store

5. **Introduce Service Layer**
   - Create service interfaces for business logic
   - Move logic from route handlers to services
   - Add service tests

6. **Complete Component Migration**
   - Finish migration to `src/presentation/components/`
   - Delete legacy `src/components/` directory
   - Standardize component APIs

### 10.3 Long-Term Actions (Next 1-3 Months)

7. **Implement Domain-Driven Design**
   - Create domain entities in `src/core/entities/`
   - Create value objects in `src/domain/value-objects/`
   - Migrate business logic to domain layer

8. **Implement Event Sourcing**
   - Create event store for critical events
   - Implement event replay mechanism
   - Add event debugging tools

9. **Implement CQRS**
   - Separate command and query responsibilities
   - Create read models for optimized queries
   - Add command validation

---

## 11. Conclusion

Via-Gent (Project Alpha v2.0) is a complex, feature-rich browser-based IDE with integrated AI agent capabilities. The codebase shows signs of rapid evolution, with significant technical debt accumulated during the transition from MVP to production-ready system.

### Key Strengths
- ✅ Comprehensive testing infrastructure (Vitest + jsdom)
- ✅ Design tokens and i18n systems in place
- ✅ Modern React stack (TanStack Router, Zustand, Dexie)
- ✅ Credential vault with proper encryption
- ✅ Cross-workspace event system (in progress)

### Key Weaknesses
- ❌ 135 god classes (>300 lines)
- ❌ 25+ duplicated stores
- ❌ Monolithic database schema (1267 lines)
- ❌ Mixed state management patterns
- ❌ No service layer
- ❌ Hydration race conditions

### Readiness for December 2025 Patterns
- **High Readiness:** Testing, Design Tokens, i18n, Error Handling, Component Library
- **Medium Readiness:** State Management, Component Architecture, Database Schema, API Layer
- **Low Readiness:** God Classes, Spaghetti Code, State Synchronization, Cross-Workspace Events

### Recommended Focus
**Phase 1 (Week 1-4):** Infrastructure consolidation + database refactoring
**Phase 2 (Week 5-8):** God class refactoring + component migration
**Phase 3 (Week 9-12):** Service layer + domain-driven design

---

**Analysis Complete.**

**Generated:** 2026-01-01
**Analyst:** Claude Code (BMAD v6 Framework)
**Repository:** Via-Gent (Project Alpha v2.0)
**Total Lines Analyzed:** 172,582
**Total Files Analyzed:** 4,094
