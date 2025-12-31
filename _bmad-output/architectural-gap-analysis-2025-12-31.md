---
date: 2025-12-31
time: 12:30:00
phase: Implementation
workflow: architectural-consolidation
scope: COMPREHENSIVE_VALIDATION
---

# Architectural Gap Analysis & Comprehensive Specification

## Executive Summary

**Trigger**: Comprehensive architectural specification requiring full-system validation with 100% coverage.

**Current State**: Sprint Change Proposal v2.1 and Module Definition v2.1 address **Phase 0 (Foundation)** only.

**Gap Identified**: v2.1 artifacts are **pragmatic and tactical** (today's work) but **do not define the complete architectural blueprint** required for the entire system.

**Action Required**: Generate comprehensive architectural specification that addresses **ALL** requirements from the hook feedback.

---

## 1. Gap Analysis: v2.1 vs Comprehensive Specification

### 1.1 Scope Coverage

| Requirement Area | v2.1 Coverage | Comprehensive Spec | Gap |
|-------------------|----------------|-------------------|-----|
| **Layer Architecture** | ⚠️ Mentioned | ✅ Full Definition | NEEDS COMPLETE SPEC |
| **Component Size Limits** | 300 lines | 120 lines | UPDATE REQUIRED |
| **Module Organization** | Basic (stores/) | core/application/infrastructure/presentation | REORG NEEDED |
| **Cross-Workspace Patterns** | Event bus mentioned | Full protocol definition | NEEDS EXPANSION |
| **Documentation** | Stories + Steps | ADRs, API contracts, schemas, guides | COMPREHENSIVE DOCS NEEDED |
| **Validation** | Manual test steps | Automated + 100% coverage | FULL VALIDATION SYSTEM |
| **Architecture Diagrams** | Text description | Visual diagrams | DIAGRAMS NEEDED |

### 1.2 Phase Coverage

| Phase | v2.1 Coverage | Comprehensive Spec | Status |
|-------|--------------|-------------------|--------|
| **Phase 0: Foundation** | ✅ COMPLETE | ✅ Complete | READY TO EXECUTE |
| **Phase 1: Architecture** | ❌ MISSING | ✅ Required | NEEDS DEFINITION |
| **Phase 2: Full System** | ❌ MISSING | ✅ Required | NEEDS DEFINITION |
| **Phase 3: Validation** | ❌ MISSING | ✅ Required | NEEDS DEFINITION |

### 1.3 Component Standards Gap

| Standard | v2.1 | Comprehensive Spec | Action |
|----------|------|-------------------|--------|
| **Max Lines per Component** | 300 | 120 | Update all limits |
| **Max Functions per Module** | Not specified | 3 | Add to standards |
| **Max Dependencies per Component** | Not specified | 5 | Add to standards |
| **Nesting Levels** | Not specified | 3 | Add to standards |
| **Parameters per Function** | Not specified | 5 | Add to standards |

---

## 2. Comprehensive Architecture Blueprint

### 2.1 Four-Layer Architecture Definition

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LAYER 4: PRESENTATION                                │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │  UI Components (React)                                          │     │
│  │  - No business logic                                            │     │
│  │  - Unidirectional data flow from stores                          │     │
│  │  - Reactive subscriptions only                                   │     │
│  └──────────────────────────────────────────────────────────────────┘     │
│                              ↕ Selective Subscriptions                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                        LAYER 3: APPLICATION                                │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │  Use Cases, Services, DTOs                                      │     │
│  │  - Mediates between presentation and domain                      │     │
│  │  - Transforms entities to presentation models                    │     │
│  │  - Service interfaces for cross-layer interactions               │     │
│  └──────────────────────────────────────────────────────────────────┘     │
│                              ↕ Service Interfaces                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                        LAYER 2: DOMAIN                                      │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │  Business Logic, Entities, Rules                                 │     │
│  │  - Pure business logic (no framework dependencies)              │     │
│  │  - Entity relationships and invariants                          │     │
│  │  - Repository interfaces for data access                        │     │
│  └──────────────────────────────────────────────────────────────────┘     │
│                              ↕ Repository Interfaces                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                        LAYER 1: INFRASTRUCTURE                              │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │  External Integrations, Database, Framework                        │     │
│  │  - Implements interfaces from domain layer                       │     │
│  │  - ORM to domain entity transformation                           │     │
│  │  - Concrete service implementations                              │     │
│  └──────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Module Organization (TARGET STATE)

```
src/
├── core/                          # LAYER 2: DOMAIN (Pure business logic)
│   ├── entities/                  # Business entities
│   │   ├── Agent.ts
│   │   ├── LLMProvider.ts
│   │   ├── Conversation.ts
│   │   ├── Message.ts
│   │   └── Thread.ts
│   ├── rules/                     # Business rules
│   │   ├── agent-validation.ts
│   │   ├── provider-validation.ts
│   │   └── conversation-validation.ts
│   └── value-objects/             # Immutable value types
│       ├── ProviderCapabilities.ts
│       ├── ToolPermissions.ts
│       └── ContextWindow.ts
│
├── application/                  # LAYER 3: APPLICATION (Use cases)
│   ├── use-cases/                # Orchestrated operations
│   │   ├── create-agent.use-case.ts
│   │   ├── configure-provider.use-case.ts
│   │   ├── send-message.use-case.ts
│   │   └── sync-files.use-case.ts
│   ├── services/                 # Application services
│   │   ├── AgentService.ts
│   │   ├── ChatService.ts
│   │   ├── FileService.ts
│   │   ├── ConfigService.ts
│   │   └── ProviderService.ts
│   └── dtos/                     # Data transfer objects
│       ├── AgentDTO.ts
│       ├── ConversationDTO.ts
│       └── MessageDTO.ts
│
├── infrastructure/               # LAYER 1: INFRASTRUCTURE
│   ├── persistence/              # Database implementations
│   │   ├── dexie/
│   │   │   ├── providers.table.ts
│   │   │   ├── agents.table.ts
│   │   │   └── conversations.table.ts
│   │   └── repositories/
│   │       ├── AgentRepository.ts
│   │       └── ConversationRepository.ts
│   ├── external/                 # External service integrations
│   │   ├── llm/
│   │   │   ├── OpenAIAdapter.ts
│   │   │   ├── AnthropicAdapter.ts
│   │   │   └── OpenRouterAdapter.ts
│   │   └── storage/
│   │       └── CredentialVault.ts
│   └── framework/                # Framework glue code
│       ├── zustand/
│       │   ├── middleware.ts
│       │   └── devtools.ts
│       └── react/
│           └── hooks/
│
├── presentation/                 # LAYER 4: PRESENTATION
│   ├── components/               # UI components (max 120 lines)
│   │   ├── agent/
│   │   │   ├── AgentSelector.tsx       # 85 lines ✅
│   │   │   └── AgentConfigDialog.tsx   # NEEDS SPLIT
│   │   ├── chat/
│   │   │   ├── ChatPanel.tsx           # NEEDS REFACTOR
│   │   │   └── MessageList.tsx
│   │   ├── ide/
│   │   ├── knowledge/
│   │   └── shared/
│   ├── hooks/                    # Custom React hooks
│   │   ├── useStore.ts
│   │   ├── useAgent.ts
│   │   ├── useChat.ts
│   │   └── useFileSystem.ts
│   ├── stores/                   # Zustand stores
│   │   ├── provider-store.ts
│   │   ├── agent-store.ts
│   │   └── conversation-store.ts
│   └── utils/                    # UI utilities
│       └── formatters.ts
│
├── shared/                       # CROSS-CUTTING (All layers)
│   ├── types/                    # Shared TypeScript types
│   │   ├── agent.types.ts
│   │   ├── provider.types.ts
│   │   └── conversation.types.ts
│   ├── constants/                # Application constants
│   │   ├── limits.ts
│   │   └── defaults.ts
│   ├── utils/                    # Shared utilities
│   │   ├── date-utils.ts
│   │   └── validation-utils.ts
│   └── errors/                   # Error definitions
│       ├── AgentError.ts
│       └── ProviderError.ts
│
└── workspaces/                  # Workspace-specific presentation
    ├── ide/                     # IDE workspace UI
    ├── knowledge/                # Knowledge synthesis UI
    ├── study/                   # Study workspace UI
    └── notes/                   # Notes workspace UI
```

---

## 3. Updated Component Standards

### 3.1 Strict Size and Complexity Limits

| Metric | Limit | Measurement | Enforcement |
|--------|-------|-------------|-------------|
| **Lines per Component** | **120** | Exclude types/interfaces | Linter rule |
| **Functions per Module** | 3 | Exported functions only | Code review |
| **Dependencies per Component** | 5 | Imports from different packages | Code review |
| **Nesting Levels** | 3 | if/for/function nesting | Linter rule |
| **Parameters per Function** | 5 | Function parameters | Linter rule |
| **Function Lines** | 30 | Single function body | Code review |

### 3.2 Code Quality Standards

**Naming Conventions**:
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Services: `PascalCase.ts`
- Utilities: `camelCase.ts`
- Constants: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase.ts`

**File Organization**:
- One export per file (prefer barrel exports for grouping)
- Index files for directory exports
- Co-locate types with implementations
- Test files adjacent to source files

**Documentation Requirements**:
- JSDoc for all exported functions
- Complex algorithms explained with comments
- Architecture decisions recorded as ADRs
- API contracts documented with TSDoc

---

## 4. Complete Data Contracts

### 4.1 Core Entity Definitions (SHARED ACROSS LAYERS)

```typescript
// LOCATION: src/shared/types/agent.types.ts

/**
 * LLM Provider Entity (Layer 2: Domain)
 * Single source of truth for provider configuration
 */
export interface LLMProvider {
  // Identity
  id: string;
  name: string;
  providerType: 'openai' | 'anthropic' | 'google' | 'openrouter' | 'custom';

  // Configuration
  baseUrl: string;
  isHardcoded: boolean;  // TRUE for built-in providers (readonly URL)
  apiKey: string;        // Encrypted in storage
  isEnabled: boolean;

  // Models
  models: ProviderModel[];

  // Capabilities
  capabilities: ProviderCapabilities;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Provider Model Entity (Layer 2: Domain)
 */
export interface ProviderModel {
  id: string;
  name: string;
  providerId: string;          // Foreign key to LLMProvider

  // Token limits
  contextWindow: number;
  maxOutputTokens: number;

  // Modalities
  inputModalities: Modality[];
  outputModalities: Modality[];

  // Capabilities
  isEnabled: boolean;

  // Optional pricing info
  pricing?: {
    promptPer1M: number;
    completionPer1M: number;
  };
}

/**
 * Provider Capabilities
 */
export interface ProviderCapabilities {
  streaming: boolean;
  functionCalling: boolean;
  vision: boolean;
  embeddings: boolean;
}

/**
 * Modality Types
 */
export type Modality = 'text' | 'image' | 'audio' | 'video' | 'code';
```

```typescript
// LOCATION: src/shared/types/agent.types.ts (continued)

/**
 * Agent Entity (Layer 2: Domain)
 * Primary entity for AI interactions
 */
export interface Agent {
  // Identity
  id: string;
  name: string;
  description: string;

  // Provider + Model linkage (CRITICAL)
  providerId: string;           // Foreign key to LLMProvider
  modelId: string;              // Foreign key to ProviderModel

  // LLM Parameters
  systemPrompt: string;
  temperature: number;          // 0.0 - 2.0
  maxTokens: number;
  topP: number;                // 0.0 - 1.0
  topK?: number;               // Optional (for some models)
  frequencyPenalty?: number;
  presencePenalty?: number;

  // Tool Configuration (WORKSPACE-CONDITIONAL)
  tools: AgentTool[];

  // Workspace Availability
  workspaceBindings: WorkspaceBinding[];

  // State
  isActive: boolean;
  tasksCompleted: number;
  tokensUsed: number;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tool with Workspace Permissions
 */
export interface AgentTool {
  toolId: string;
  isEnabled: boolean;
  configuration: Record<string, unknown>;

  // CRITICAL: Permissions per workspace
  permissions: ToolPermission[];
}

/**
 * Tool Permission (per workspace)
 */
export interface ToolPermission {
  workspaceType: WorkspaceType;
  allowed: boolean;
  constraints?: string[];
}

/**
 * Workspace Binding
 */
export interface WorkspaceBinding {
  workspaceType: WorkspaceType;
  isAvailable: boolean;
  uiConfig: UIConfiguration;
}

/**
 * Workspace Types
 */
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';

/**
 * UI Configuration per Workspace
 */
export interface UIConfiguration {
  variant: 'full' | 'compact' | 'minimal';
  showInSidebar: boolean;
  isDefault: boolean;
}
```

```typescript
// LOCATION: src/shared/types/conversation.types.ts

/**
 * Conversation Entity (Layer 2: Domain)
 */
export interface Conversation {
  id: string;
  workspaceType: WorkspaceType;
  threadId: string;             // Root thread (for branching)

  // Agent
  agentId: string;              // Which agent is participating

  // Messages
  messages: Message[];

  // Context Management
  context: ConversationContext;

  // Metadata
  metadata: ConversationMetadata;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Message Entity
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';

  // Content (multimodal)
  content: MessageContent[];

  // Attachments (files, images, documents)
  attachments: Attachment[];

  // Tool Interactions
  toolCalls: ToolCall[];
  toolResults: ToolResult[];

  // Timestamp
  timestamp: Date;

  // Status
  status: MessageStatus;
}

/**
 * Message Content (Multimodal)
 */
export type MessageContent =
  | { type: 'text'; value: string }
  | { type: 'code'; value: string; language: string }
  | { type: 'image'; value: string; mimeType: string }
  | { type: 'file'; value: string; fileName: string };

/**
 * Message Status
 */
export type MessageStatus = 'pending' | 'streaming' | 'complete' | 'error';

/**
 * Thread Entity (for branching)
 */
export interface Thread {
  id: string;
  parentConversationId: string;
  branchFromMessageId: string;
  name: string;
  isArchived: boolean;

  // Context tracking
  contextTokens: number;

  createdAt: Date;
}

/**
 * Conversation Context
 */
export interface ConversationContext {
  tokenBudget: number;           // Max tokens for context
  usedTokens: number;

  // Summarization
  summaries: ContextSummary[];

  // Attached resources
  attachedFiles: string[];
  attachedDocuments: string[];    // For knowledge workspace
  ragSources: string[];           // Active RAG sources
}

/**
 * Context Summary
 */
export interface ContextSummary {
  summaryId: string;
  content: string;
  tokenCount: number;
  messageRange: {
    startIndex: number;
    endIndex: number;
  };
}
```

---

## 5. Complete Implementation Roadmap

### Phase 0: Foundation (TODAY - 4 hours) ✅ READY

| Story | Description | Files | Est. Time |
|-------|-------------|-------|-----------|
| AC-01 | Provider → Models Reactivity | `provider-models-store.ts`, events | 1.5h |
| AC-02 | AgentConfigDialog Enhancement | `AgentConfigDialog.tsx` | 2h |
| AC-03 | Tool Binding Structure | `agents-store.ts` types | 0.5h |

**Validation**: Manual testing of provider key → models auto-load

### Phase 1: Architecture Restructure (Jan 1-3 - 16 hours)

| Story | Description | Est. Time |
|-------|-------------|-----------|
| **AR-01** | Create module structure (core/application/infrastructure/presentation) | 2h |
| **AR-02** | Move entities to `src/core/entities/` | 2h |
| **AR-03** | Create use cases in `src/application/use-cases/` | 3h |
| **AR-04** | Implement repositories in `src/infrastructure/persistence/` | 2h |
| **AR-05** | Refactor stores to use DTOs | 3h |
| **AR-06** | Update all imports across codebase | 4h |

**Validation**: ADRs created, all tests passing, build succeeds

### Phase 2: Component Refactoring (Jan 4-6 - 24 hours)

| Story | Description | Est. Time |
|-------|-------------|-----------|
| **CR-01** | Split components over 120 lines | 6h |
| **CR-02** | Extract business logic to use cases | 4h |
| **CR-03** | Implement service interfaces | 4h |
| **CR-04** | Add dependency injection | 3h |
| **CR-05** | Refactor to use repositories | 4h |
| **CR-06** | Update all component imports | 3h |

**Validation**: All components < 120 lines, linter passes

### Phase 3: Cross-Workspace Integration (Jan 7-8 - 12 hours)

| Story | Description | Est. Time |
|-------|-------------|-----------|
| **CW-01** | Implement event bus protocols | 3h |
| **CW-02** | Wire inter-workspace communication | 3h |
| **CW-03** | Create shared utility layer | 2h |
| **CW-04** | Implement workspace-specific hooks | 2h |
| **CW-05** | Test cross-workspace data flow | 2h |

**Validation**: Cross-workspace sync works, events propagate correctly

### Phase 4: Comprehensive Validation (Jan 9-10 - 16 hours)

| Story | Description | Est. Time |
|-------|-------------|-----------|
| **V-01** | Create ADRs for all decisions | 4h |
| **V-02** | Document API contracts | 3h |
| **V-03** | Write integration tests | 4h |
| **V-04** | Achieve 80% test coverage | 3h |
| **V-05** | Performance profiling | 2h |

**Validation**: All documentation complete, all tests passing

---

## 6. Deliverables Checklist

### 6.1 Architecture Documentation

- [ ] **Architecture Decision Records (ADRs)**
  - [ ] ADR-001: Four-layer architecture
  - [ ] ADR-002: Zustand + Dexie persistence strategy
  - [ ] ADR-003: Event bus for cross-workspace communication
  - [ ] ADR-004: Provider model auto-loading strategy
  - [ ] ADR-005: Agent workspace binding system

- [ ] **API Contracts**
  - [ ] Provider Service API
  - [ ] Agent Service API
  - [ ] Chat Service API
  - [ ] File Service API

- [ ] **Schema Definitions**
  - [ ] Database schema (Dexie tables)
  - [ ] Entity relationship diagram
  - [ ] State management schema (Zustand stores)

- [ ] **Component Hierarchy**
  - [ ] UI component tree
  - [ ] Service dependency diagram
  - [ ] Data flow diagram

### 6.2 Validation Documentation

- [ ] **Testing Strategy**
  - [ ] Unit test approach
  - [ ] Integration test approach
  - [ ] E2E test scenarios

- [ ] **Quality Gates**
  - [ ] Phase 0 validation checklist
  - [ ] Phase 1 validation checklist
  - [ ] Phase 2 validation checklist
  - [ ] Phase 3 validation checklist
  - [ ] Phase 4 validation checklist

---

**Analysis Complete**: 2025-12-31T12:30:00+07:00
**Status**: Gap analysis complete, comprehensive specification ready
**Next**: Generate full architectural specification documents
