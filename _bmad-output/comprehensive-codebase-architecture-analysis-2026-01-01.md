# Comprehensive Codebase Architecture Analysis
**Date:** 2026-01-01
**Analysis Type:** Very Thorough - Complete Architecture Review
**Agent:** @bmad-core-bmad-master

---

## Executive Summary

This analysis examines the Project Alpha (Via-gent v2.0) codebase focusing on 5 critical architectural domains:
1. LLM Provider Configuration
2. Agent Configuration System
3. Chat Flow Management
4. File System Integration
5. Technical Debt & God Classes

**Key Findings:**
- **Total Files:** 1,698 TypeScript/TSX files (169,855 lines of code)
- **Files >300 lines:** 40 files identified (largest: 1,272 lines)
- **Provider Architecture:** Recently refactored into 3 modules (good separation of concerns)
- **Agent System:** Well-structured with proper facade pattern
- **State Management:** Mixed patterns (Zustand stores + Context API)
- **Technical Debt:** Several god classes and duplicate implementations detected

---

## 1. LLM Provider Configuration

### 1.1 File Inventory & Line Counts

| File Path | Lines | Purpose | Status |
|-----------|-------|---------|--------|
| `/src/lib/agent/providers/credential-vault.ts` | 467 | Public API facade for credential storage | ✅ Recently refactored |
| `/src/lib/agent/providers/credential-storage.ts` | 190 | IndexedDB operations for credentials | ✅ Recently extracted |
| `/src/lib/agent/providers/credential-encryption.ts` | 300 | AES-256-GCM encryption utilities | ✅ Recently extracted |
| `/src/lib/agent/providers/model-registry.ts` | 365 | AI model catalog and configuration | ⚠️ Large, needs splitting |
| `/src/lib/agent/providers/provider-adapter.ts` | 254 | Provider adapter factory pattern | ✅ Well-structured |
| `/src/lib/agent/providers/agent-validation-service.ts` | 486 | Agent configuration validation | ⚠️ God class candidate |
| `/src/lib/agent/providers/types.ts` | 245 | Shared type definitions | ✅ Appropriate size |
| `/src/stores/provider-config-store.ts` | 332 | Zustand store for provider config | ⚠️ Medium-large |
| `/src/stores/provider-models-store.ts` | 515 | Zustand store for model registry | ⚠️ Large store |
| `/src/presentation/components/agent/ProviderConfigDialog.tsx` | 270 | Provider configuration UI | ✅ Reasonable |
| `/src/presentation/components/agent/ProviderSettings.tsx` | 128 | Provider settings panel | ✅ Small & focused |

**Total Provider System:** ~3,607 lines across 11 core files

### 1.2 Architecture Patterns

#### Current Design (Post-Refactor)

```
┌─────────────────────────────────────────────────────────────┐
│                    UI Layer                                 │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │ ProviderConfig   │        │ AgentConfig      │          │
│  │ Dialog.tsx       │        │ Dialog.tsx       │          │
│  └────────┬─────────┘        └────────┬─────────┘          │
└───────────┼──────────────────────────┼──────────────────────┘
            │                          │
            ▼                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    State Layer                              │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │provider-config-  │        │provider-models-  │          │
│  │ store.ts         │        │ store.ts         │          │
│  └────────┬─────────┘        └────────┬─────────┘          │
└───────────┼──────────────────────────┼──────────────────────┘
            │                          │
            ▼                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 Business Logic Layer                        │
│  ┌──────────────────────────────────────────────────┐      │
│  │         credential-vault.ts (Facade)              │      │
│  │  ┌─────────────────────────────────────────┐     │      │
│  │  │  + initialize()                          │     │      │
│  │  │  + storeCredentials()                   │     │      │
│  │  │  + getCredentials()                     │     │      │
│  │  │  + deleteCredentials()                  │     │      │
│  │  │  + hasCredentials()                     │     │      │
│  │  │  + clear()                              │     │      │
│  │  └─────────────────────────────────────────┘     │      │
│  └───────────┬───────────────────────────┬───────────┘      │
│              │                           │                    │
│  ┌───────────▼──────────┐    ┌─────────▼──────────────────┐ │
│  │ credential-storage.ts│    │ credential-encryption.ts   │ │
│  │ (IndexedDB ops)      │    │ (Web Crypto API)           │ │
│  └──────────────────────┘    └────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│              Provider Adapter Layer                         │
│  ┌──────────────────────────────────────────────────┐      │
│  │         provider-adapter.ts                      │      │
│  │  ┌─────────────────────────────────────────┐     │      │
│  │  │  ProviderAdapterFactory.createAdapter()  │     │      │
│  │  └─────────────────────────────────────────┘     │      │
│  └───────────┬───────────────────────────┬───────────┘      │
│              │                           │                    │
│  ┌───────────▼──────────┐    ┌─────────▼──────────────────┐ │
│  │ model-registry.ts    │    │ agent-validation-service.ts│ │
│  │ (Model catalog)      │    │ (Config validation)        │ │
│  └──────────────────────┘    └────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Dependencies Between Files

```
ProviderConfigDialog.tsx
  ├─→ useAgentConfigProvider.ts
  │     ├─→ provider-config-store.ts
  │     │     ├─→ credential-vault.ts
  │     │     │     ├─→ credential-storage.ts
  │     │     │     │     └─→ [Dexie IndexedDB]
  │     │     │     └─→ credential-encryption.ts
  │     │     │           └─→ [Web Crypto API]
  │     │     ├─→ provider-adapter.ts
  │     │     │     ├─→ model-registry.ts
  │     │     │     └─→ agent-validation-service.ts
  │     │     └─→ [localStorage for vault keys]
  │     └─→ [Zustand state]
  └─→ [React hooks]
```

### 1.4 Duplicate Implementations

#### ✅ Resolved Duplications (Post-Refactor)
1. **Credential encryption logic** - Consolidated into `credential-encryption.ts`
2. **IndexedDB operations** - Consolidated into `credential-storage.ts`
3. **Vault initialization** - Unified in `credential-vault.ts` facade

#### ⚠️ Remaining Duplications
1. **Provider validation** exists in multiple places:
   - `agent-validation-service.ts` (486 lines)
   - `AgentValidation.tsx` (component-level validation)
   - `agent-config-types.ts` (type-level validation)

2. **Model registry data** duplicated across:
   - `model-registry.ts` (source of truth)
   - `provider-models-store.ts` (Zustand cache)
   - `agent-config-types.ts` (type definitions)

### 1.5 Integration Points

| Integration Point | File | Consumer | Purpose |
|-------------------|------|----------|---------|
| `/api/chat` endpoint | `/src/routes/api/chat.ts` | Frontend chat UI | Stream LLM responses |
| `useAgentChat` hook | `/src/lib/agent/hooks/use-agent-chat-with-tools.ts` | Chat components | Provider-agnostic chat |
| `AgentConfigDialog` | `/src/presentation/components/agent/AgentConfigDialog.tsx` | IDE settings UI | Configure providers |
| `CredentialVault` singleton | `/src/lib/agent/providers/credential-vault.ts` | All agent tools | Access encrypted API keys |
| `ProviderAdapterFactory` | `/src/lib/agent/providers/provider-adapter.ts` | Agent factory | Create provider adapters |

### 1.6 Issues & Recommendations

#### Critical Issues
1. **God Class: `agent-validation-service.ts` (486 lines)**
   - Contains validation for agents, tools, permissions, and providers
   - Should split into focused validators:
     - `agent-validator.ts`
     - `tool-validator.ts`
     - `permission-validator.ts`
     - `provider-validator.ts`

2. **Large Store: `provider-models-store.ts` (515 lines)**
   - Duplicates much of `model-registry.ts` logic
   - Recommendation: Use Zustand's `devtools` and `persist` middleware instead of custom caching

3. **Hot Reload Bug (Story WB-PR-1)**
   - Provider configuration changes not visible without page refresh
   - Root cause: Zustand store not subscribing to `credential-vault` updates
   - Status: Hot fix in progress (see `_bmad-output/sprint-artifacts/WB-PR-1-*`)

#### Recommended Refactorings
1. **Split `model-registry.ts` (365 lines) into:**
   - `model-catalog.ts` - Static model definitions
   - `model-discovery.ts` - Dynamic model loading
   - `model-compatibility.ts` - Provider/model compatibility matrix

2. **Consolidate validation logic:**
   - Create `/src/lib/agent/validators/` directory
   - Move all validation from `agent-validation-service.ts`
   - Use Zod schemas for runtime validation

3. **Improve provider adapter pattern:**
   - Extract common adapter logic to `base-provider-adapter.ts`
   - Reduce code duplication across OpenAI, Anthropic, OpenRouter adapters

---

## 2. Agent Configuration System

### 2.1 File Inventory & Line Counts

| File Path | Lines | Purpose | Status |
|-----------|-------|---------|--------|
| `/src/lib/agent/factory.ts` | 612 | Agent instance factory | ⚠️ God class candidate |
| `/src/lib/agent/prompt-composer.ts` | 467 | Build agent prompts from config | ⚠️ Large, complex |
| `/src/lib/agent/hooks/use-agent-chat-with-tools.ts` | 517 | Main agent chat hook | ⚠️ Large, complex |
| `/src/lib/agent/preferences/preference-tracker.ts` | 513 | User preference tracking | ⚠️ Medium-large |
| `/src/lib/agent/suggestions/suggestion-tracker.ts` | 480 | Agent suggestion tracking | ⚠️ Medium-large |
| `/src/lib/agent/facades/file-tools-impl.ts` | 578 | File tool implementation | ⚠️ Large implementation |
| `/src/lib/agent/tools/retry-queue.ts` | 547 | Tool retry logic | ⚠️ Medium-large |
| `/src/lib/agent/tools/tool-error.ts` | 517 | Error handling for tools | ⚠️ Large error class |
| `/src/lib/agent/tool-permission-manager.ts` | 338 | Workspace tool permissions | ✅ Reasonable |
| `/src/lib/agent/suggestions/suggestion-engine.ts` | 336 | Generate agent suggestions | ✅ Reasonable |
| `/src/lib/agent/memory/memory-index.ts` | 365 | Vector index for memory | ✅ Appropriate |
| `/src/lib/agent/memory/conversation-memory.ts` | 352 | Conversation memory | ✅ Appropriate |
| `/src/lib/agent/preferences/user-profile.ts` | 383 | User profile management | ✅ Reasonable |
| `/src/stores/agents-store.ts` | 324 | Zustand store for agents | ✅ Good size |
| `/src/presentation/components/agent/AgentConfigDialog.tsx` | 1171 | Main agent config UI | 🔥 GOD CLASS |
| `/src/presentation/components/agent/AgentConfigForm/` | ~800 | Agent config form components | ✅ Split into sub-components |

**Total Agent System:** ~23,741 lines across 50+ files

### 2.2 Architecture Patterns

#### Agent Configuration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    UI Layer                                 │
│  ┌──────────────────────────────────────────────────┐      │
│  │         AgentConfigDialog.tsx (1,171 lines)      │      │
│  │  ┌────────────────────────────────────────────┐  │      │
│  │  │  - AgentBasicInfoTab.tsx                   │  │      │
│  │  │  - AgentAdvancedSettingsTab.tsx            │  │      │
│  │  │  - AgentModelSelector.tsx                  │  │      │
│  │  │  - AgentProviderSelector.tsx               │  │      │
│  │  │  - ToolPermissionsConfig.tsx               │  │      │
│  │  │  - ApiKeyInput.tsx                         │  │      │
│  │  └────────────────────────────────────────────┘  │      │
│  └───────────────────────┬──────────────────────────┘      │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    State Layer                              │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │ agents-store.ts  │        │ agent-selection- │          │
│  │ (Zustand)        │        │ store.ts         │          │
│  └────────┬─────────┘        └────────┬─────────┘          │
└───────────┼──────────────────────────┼──────────────────────┘
            │                          │
            ▼                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 Business Logic Layer                        │
│  ┌──────────────────────────────────────────────────┐      │
│  │         agent/factory.ts (612 lines)              │      │
│  │  ┌─────────────────────────────────────────┐     │      │
│  │  │  + createAgent(config)                  │     │      │
│  │  │  + createAdapter(provider)              │     │      │
│  │  │  + composeTools(permissions)            │     │      │
│  │  │  + buildSystemPrompt(config)            │     │      │
│  │  └─────────────────────────────────────────┘     │      │
│  └───────────┬───────────────────────────┬───────────┘      │
│              │                           │                    │
│  ┌───────────▼──────────┐    ┌─────────▼──────────────────┐ │
│  │ prompt-composer.ts   │    │ use-agent-chat-with-tools.ts│ │
│  │ (467 lines)          │    │ (517 lines)                │ │
│  └──────────────────────┘    └────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Tool Layer                               │
│  ┌──────────────────────────────────────────────────┐      │
│  │         facades/file-tools-impl.ts (578 lines)   │      │
│  │  ┌─────────────────────────────────────────┐     │      │
│  │  │  + readFile()                            │     │      │
│  │  │  + writeFile()                           │     │      │
│  │  │  + listDirectory()                       │     │      │
│  │  │  + executeCommand()                      │     │      │
│  │  └─────────────────────────────────────────┘     │      │
│  └───────────┬───────────────────────────┬───────────┘      │
│              │                           │                    │
│  ┌───────────▼──────────┐    ┌─────────▼──────────────────┐ │
│  │ tools/retry-queue.ts │    │ tool-permission-manager.ts  │ │
│  │ (547 lines)          │    │ (338 lines)                │ │
│  └──────────────────────┘    └────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Dependencies Between Files

```
AgentConfigDialog.tsx
  ├─→ useAgentConfigForm.ts
  │     ├─→ agents-store.ts
  │     │     └─→ [Dexie IndexedDB]
  │     ├─→ agent-selection-store.ts
  │     └─→ agent-config-types.ts
  ├─→ AgentProviderSelector.tsx
  │     └─→ useAgentConfigProvider.ts
  │           └─→ provider-config-store.ts
  ├─→ AgentModelSelector.tsx
  │     └─→ model-registry.ts
  ├─→ ToolPermissionsConfig.tsx
  │     └─→ tool-permission-manager.ts
  ├─→ ApiKeyInput.tsx
  │     └─→ credential-vault.ts
  └─→ AgentValidation.tsx
        └─→ agent-validation-service.ts
```

### 2.4 Duplicate Implementations

#### ⚠️ Critical Duplications
1. **Agent configuration types** duplicated in:
   - `/src/lib/agent/providers/types.ts`
   - `/src/presentation/components/agent/agent-config-types.ts`
   - `/src/stores/agents-store.ts` (nested types)
   - **Impact:** Type definition mismatches, maintenance burden

2. **Tool permission checks** duplicated in:
   - `/src/lib/agent/tool-permission-manager.ts` (business logic)
   - `/src/presentation/components/agent/ToolPermissionsConfig.tsx` (UI logic)
   - **Recommendation:** Move all permission logic to business layer, UI should only display

3. **Prompt building logic** scattered across:
   - `/src/lib/agent/prompt-composer.ts` (main composer)
   - `/src/lib/agent/factory.ts` (factory-level prompts)
   - `/src/lib/agent/hooks/use-agent-chat-with-tools.ts` (hook-level prompts)
   - **Impact:** Inconsistent prompts, hard to test

### 2.5 Integration Points

| Integration Point | File | Consumer | Purpose |
|-------------------|------|----------|---------|
| `/api/chat` endpoint | `/src/routes/api/chat.ts` | Frontend chat UI | Agent chat streaming |
| `useAgentChatWithTools` | `/src/lib/agent/hooks/use-agent-chat-with-tools.ts` | Chat components | Main agent chat interface |
| `AgentFactory` | `/src/lib/agent/factory.ts` | Agent creation | Create configured agent instances |
| `AgentConfigDialog` | `/src/presentation/components/agent/AgentConfigDialog.tsx` | IDE settings | Configure agents |
| `agents-store` | `/src/stores/agents-store.ts` | All agent components | Zustand state persistence |

### 2.6 Issues & Recommendations

#### 🔥 Critical Issues

1. **GOD CLASS: `AgentConfigDialog.tsx` (1,171 lines)**
   - **Problem:** Massive component handling all agent configuration UI
   - **Symptoms:**
     - Hard to test
     - Hard to maintain
     - Violates Single Responsibility Principle
     - Contains validation, form state, API calls, and rendering
   - **Recommended Split:**
     ```
     AgentConfigDialog.tsx (orchestrator, ~150 lines)
     └─ AgentConfigDialog/
        ├─ AgentBasicInfoTab.tsx (~150 lines)
        ├─ AgentAdvancedSettingsTab.tsx (~200 lines)
        ├─ AgentModelSelector.tsx (~150 lines) [already exists]
        ├─ AgentProviderSelector.tsx (~150 lines) [already exists]
        ├─ ToolPermissionsConfig.tsx (~200 lines) [already exists]
        ├─ AgentApiKeySection.tsx (~100 lines) [already exists]
        └─ useAgentConfigForm.ts (~200 lines) [already exists]
     ```

2. **God Class Candidate: `agent/factory.ts` (612 lines)**
   - **Problem:** Handles agent creation, adapter creation, tool composition, prompt building
   - **Recommended Split:**
     ```
     agent/
     ├─ factory/
     │  ├─ agent-factory.ts (~150 lines) - Create agent instances
     │  ├─ adapter-factory.ts (~100 lines) - Create provider adapters
     │  ├─ tool-composer.ts (~150 lines) - Compose tool permissions
     │  └─ index.ts (~50 lines) - Re-export everything
     └─ prompt-composer.ts (keep separate)
     ```

3. **God Class Candidate: `use-agent-chat-with-tools.ts` (517 lines)**
   - **Problem:** Hook handles too many concerns:
     - Chat streaming
     - Tool execution
     - Approval UI
     - Error handling
     - Artifacts
   - **Recommended Split:**
     ```
     hooks/
     ├─ use-agent-chat-with-tools.ts (~200 lines) - Core chat logic
     ├─ use-agent-tool-executor.ts (~150 lines) - Tool execution
     ├─ use-agent-approvals.ts (~100 lines) - Approval UI
     └─ use-agent-artifacts.ts (~100 lines) - Artifact management
     ```

#### ⚠️ Medium Priority Issues

4. **Large Store: `agents-store.ts` (324 lines)**
   - **Problem:** Mix of state, selectors, and actions
   - **Recommendation:** Use Zustand slices pattern:
     ```typescript
     // agents-store.ts
     export const useAgentsStore = create(
       persist(
         (...args) => ({
           ...createAgentsSlice(...args),
           ...createAgentSelectionSlice(...args),
         }),
         { name: 'agents-storage' }
       )
     );
     ```

5. **Duplicate Configuration Types**
   - **Solution:** Create single source of truth in `/src/lib/agent/config-types.ts`
   - Export types from there, import everywhere else

---

## 3. Chat Flow Management

### 3.1 File Inventory & Line Counts

| File Path | Lines | Purpose | Status |
|-----------|-------|---------|--------|
| `/src/lib/state/conversation-store.ts` | 626 | Conversation state management | ⚠️ Large store |
| `/src/presentation/components/chat/ChatConversation.tsx` | 516 | Main chat UI component | ⚠️ Large component |
| `/src/lib/agent/routes/__tests__/sse-streaming.test.ts` | 524 | SSE streaming tests | ✅ Comprehensive |
| `/src/__tests__/chat.test.ts` | 622 | Chat integration tests | ✅ Comprehensive |
| `/src/lib/agent/hooks/use-agent-chat-with-tools.ts` | 517 | Chat hook with tools | ⚠️ Large hook |
| `/src/lib/agent/routes/sse-streaming.ts` | ~300 | SSE streaming utilities | ✅ Reasonable |

**Total Chat System:** ~2,500 lines across 15+ files

### 3.2 Architecture Patterns

#### Chat Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    UI Layer                                 │
│  ┌──────────────────────────────────────────────────┐      │
│  │         ChatConversation.tsx (516 lines)          │      │
│  │  ┌────────────────────────────────────────────┐  │      │
│  │  │  - Message rendering                       │  │      │
│  │  │  - Streaming response handling              │  │      │
│  │  │  - Artifact display                        │  │      │
│  │  │  - Approval UI                             │  │      │
│  │  └────────────────────────────────────────────┘  │      │
│  └───────────────────────┬──────────────────────────┘      │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Hook Layer                               │
│  ┌──────────────────────────────────────────────────┐      │
│  │     useAgentChatWithTools.ts (517 lines)          │      │
│  │  ┌────────────────────────────────────────────┐  │      │
│  │  │  - Chat state management                   │  │      │
│  │  │  - Tool execution orchestration            │  │      │
│  │  │  - Approval flow management                │  │      │
│  │  │  - SSE streaming handling                  │  │      │
│  │  └────────────────────────────────────────────┘  │      │
│  └───────────────────────┬──────────────────────────┘      │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer                                │
│  ┌──────────────────────────────────────────────────┐      │
│  │         /src/routes/api/chat.ts                   │      │
│  │  ┌────────────────────────────────────────────┐  │      │
│  │  │  - POST /api/chat endpoint                 │  │      │
│  │  │  - TanStack AI streaming                   │  │      │
│  │  │  - Tool call management                    │  │      │
│  │  │  - SSE response streaming                  │  │      │
│  │  └────────────────────────────────────────────┘  │      │
│  └───────────────────────┬──────────────────────────┘      │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  State Layer                                │
│  ┌──────────────────────────────────────────────────┐      │
│  │     conversation-store.ts (626 lines)             │      │
│  │  ┌────────────────────────────────────────────┐  │      │
│  │  │  - Thread management                       │  │      │
│  │  │  - Message storage                         │  │      │
│  │  │  - Conversation persistence (Dexie)        │  │      │
│  │  │  - Thread selectors                        │  │      │
│  │  └────────────────────────────────────────────┘  │      │
│  └───────────────────────┬──────────────────────────┘      │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                Provider Layer                               │
│  ┌──────────────────────────────────────────────────┐      │
│  │         Provider Adapters                        │      │
│  │  ┌────────────────────────────────────────────┐  │      │
│  │  │  - OpenRouterAdapter                       │  │      │
│  │  │  - AnthropicAdapter                        │  │      │
│  │  │  - OpenAIAdapter                           │  │      │
│  │  │  - GoogleAdapter                           │  │      │
│  │  └────────────────────────────────────────────┘  │      │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Dependencies Between Files

```
ChatConversation.tsx
  ├─→ useAgentChatWithTools.ts
  │     ├─→ Provider Adapters
  │     │     └─→ credential-vault.ts
  │     ├─→ Tool Facades
  │     │     ├─→ FileTools
  │     │     └─→ TerminalTools
  │     ├─→ conversation-store.ts
  │     │     └─→ [Dexie IndexedDB]
  │     └─→ agents-store.ts
  ├─→ AgentChatApprovals.tsx (approval UI)
  ├─→ AgentChatArtifacts.tsx (artifact display)
  └─→ Message components
```

### 3.4 Duplicate Implementations

#### ⚠️ Thread Management Duplicated In:
1. `conversation-store.ts` - Main thread CRUD
2. `useAgentChatWithTools.ts` - Hook-level thread creation
3. `/api/chat.ts` - API-level thread management

**Recommendation:** Centralize thread logic in `conversation-store.ts`, make other layers pure consumers

#### ⚠️ Message Rendering Scattered Across:
1. `ChatConversation.tsx` - Main message list
2. `AgentChatPanel.tsx` - Panel-level messages
3. `ThreadCard.tsx` - Thread preview

**Recommendation:** Extract shared message rendering to `MessageRenderer.tsx`

### 3.5 Integration Points

| Integration Point | File | Consumer | Purpose |
|-------------------|------|----------|---------|
| `/api/chat` endpoint | `/src/routes/api/chat.ts` | Chat components | Stream LLM responses |
| `conversation-store` | `/src/lib/state/conversation-store.ts` | All chat components | Thread & message persistence |
| `useAgentChatWithTools` | `/src/lib/agent/hooks/use-agent-chat-with-tools.ts` | Chat UI | Main chat interface |
| SSE streaming | `/src/lib/agent/routes/sse-streaming.ts` | Chat hook | Real-time response streaming |
| Tool facades | `/src/lib/agent/facades/` | Chat hook | Agent tool access to WebContainer/FS |

### 3.6 Issues & Recommendations

#### ⚠️ Medium Priority Issues

1. **Large Store: `conversation-store.ts` (626 lines)**
   - **Problem:** Mixes state, selectors, and persistence logic
   - **Recommendation:** Split into:
     - `conversation-store.ts` - Core state (200 lines)
     - `conversation-selectors.ts` - Selectors (200 lines)
     - `conversation-persistence.ts` - Dexie operations (200 lines)

2. **Large Component: `ChatConversation.tsx` (516 lines)**
   - **Problem:** Handles rendering, streaming, approvals, and artifacts
   - **Recommendation:** Split into:
     - `ChatConversation.tsx` - Orchestrator (150 lines)
     - `MessageList.tsx` - Message rendering (200 lines)
     - `StreamingResponse.tsx` - Streaming UI (100 lines)
     - `ChatApprovals.tsx` - Approval UI (already exists)

3. **Chat Hook Too Large: `useAgentChatWithTools.ts` (517 lines)**
   - See section 2.6 for detailed split recommendation

---

## 4. File System Integration

### 4.1 File Inventory & Line Counts

| File Path | Lines | Purpose | Status |
|-----------|-------|---------|--------|
| `/src/lib/sync/reverse-sync-service.ts` | 562 | Reverse sync from WC to local | ⚠️ Large service |
| `/src/lib/filesystem/file-snapshot-store.ts` | 509 | File state snapshots | ⚠️ Large store |
| `/src/lib/filesystem/__tests__/local-fs-adapter.test.ts` | 422 | FS adapter tests | ✅ Comprehensive |
| `/src/lib/sync/sync-event-bus.ts` | 347 | Sync event system | ✅ Good size |
| `/src/lib/webcontainer/process-manager.ts` | 337 | WC process management | ✅ Reasonable |
| `/src/lib/filesystem/project-context-provider.ts` | 335 | Project context for FS | ✅ Reasonable |
| `/src/lib/webcontainer/terminal-adapter.ts` | 327 | Terminal integration | ✅ Good size |
| `/src/lib/filesystem/sync-manager/sync-file-ops.ts` | 312 | File operation batching | ✅ Reasonable |
| `/src/lib/webcontainer/manager.ts` | 292 | WebContainer singleton | ✅ Core manager |
| `/src/lib/webcontainer/crash-recovery.ts` | 274 | WC crash handling | ✅ Specialized |
| `/src/lib/filesystem/sync-manager/sync-batch-sync.ts` | 270 | Batch sync operations | ✅ Reasonable |
| `/src/lib/filesystem/sync-manager/sync-manager.ts` | 209 | Core sync manager | ✅ Good size |
| `/src/lib/filesystem/sync-types.ts` | 222 | Sync type definitions | ✅ Good size |
| `/src/lib/filesystem/permission-lifecycle.ts` | 236 | FS permission management | ✅ Specialized |
| `/src/lib/filesystem/validation.ts` | 197 | Path validation | ✅ Focused |
| `/src/lib/sync/event-types.ts` | 209 | Sync event types | ✅ Good size |

**Total File System System:** ~13,051 lines across 71 files

### 4.2 Architecture Patterns

#### File System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    UI Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ FileTreePanel│  │ EditorPanel  │  │ TerminalPanel│      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                 Facade Layer                                │
│  ┌──────────────────────────────────────────────────┐      │
│  │         LocalFSAdapter (facade)                  │      │
│  │  ┌────────────────────────────────────────────┐  │      │
│  │  │  + readFile(path)                          │  │      │
│  │  │  + writeFile(path, content)                │  │      │
│  │  │  + listDirectory(path)                     │  │      │
│  │  │  + deleteFile(path)                        │  │      │
│  │  │  + watchChanges(callback)                  │  │      │
│  │  └────────────────────────────────────────────┘  │      │
│  └───────────────────────┬──────────────────────────┘      │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                File System Access API Layer                 │
│  ┌──────────────────────────────────────────────────┐      │
│  │         Browser File System Access API           │      │
│  │  ┌────────────────────────────────────────────┐  │      │
│  │  │  - window.showDirectoryPicker()            │  │      │
│  │  │  - FileSystemFileHandle                     │  │      │
│  │  │  - FileSystemDirectoryHandle                │  │      │
│  │  └────────────────────────────────────────────┘  │      │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Sync Layer                               │
│  ┌──────────────────────────────────────────────────┐      │
│  │         SyncManager                              │      │
│  │  ┌────────────────────────────────────────────┐  │      │
│  │  │  + syncFile(localPath, wcPath)             │  │      │
│  │  │  + batchSync(fileOps[])                    │  │      │
│  │  │  + watchAndSync()                          │  │      │
│  │  └────────────────────────────────────────────┘  │      │
│  └───────────────────────┬──────────────────────────┘      │
│                           │                                  │
│  ┌──────────────────────────────────────────────────┐      │
│  │         SyncEventBus                             │      │
│  │  ┌────────────────────────────────────────────┐  │      │
│  │  │  - emit('file:change', event)              │  │      │
│  │  │  - on('file:change', handler)              │  │      │
│  │  │  - emit('sync:complete', event)            │  │      │
│  │  └────────────────────────────────────────────┘  │      │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               WebContainer Layer                            │
│  ┌──────────────────────────────────────────────────┐      │
│  │         WebContainerManager (Singleton)           │      │
│  │  ┌────────────────────────────────────────────┐  │      │
│  │  │  + boot()                                  │  │      │
│  │  │  + fs.writeFile(path, content)             │  │      │
│  │  │  + spawnShell(cwd)                         │  │      │
│  │  │  + executeCommand(cmd)                     │  │      │
│  │  └────────────────────────────────────────────┘  │      │
│  └───────────────────────┬──────────────────────────┘      │
│                          │                                  │
│  ┌──────────────────────────────────────────────────┐      │
│  │         ProcessManager                           │      │
│  │  ┌────────────────────────────────────────────┐  │      │
│  │  │  + startProcess(command, args)             │  │      │
│  │  │  + stopProcess(pid)                        │  │      │
│  │  │  + listProcesses()                         │  │      │
│  │  └────────────────────────────────────────────┘  │      │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                Persistence Layer                            │
│  ┌──────────────────────────────────────────────────┐      │
│  │         FileSnapshotStore (Dexie)                │      │
│  │  ┌────────────────────────────────────────────┐  │      │
│  │  │  - Projects table                          │  │      │
│  │  │  - Files table                             │  │      │
│  │  │  - Snapshots table                         │  │      │
│  │  └────────────────────────────────────────────┘  │      │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Dependencies Between Files

```
FileTreePanel.tsx
  ├─→ LocalFSAdapter
  │     ├─→ [Browser File System Access API]
  │     ├─→ SyncManager
  │     │     ├─→ SyncEventBus
  │     │     │     └─→ [EventEmitter3]
  │     │     ├─→ sync-file-ops.ts
  │     │     │     └─→ [Batch operations]
  │     │     └─→ sync-batch-sync.ts
  │     │           └─→ WebContainerManager
  │     └─→ ProjectContextProvider
  │           └─→ [Workspace context]
  ├─→ FileSnapshotStore
  │     └─→ [Dexie IndexedDB]
  └─→ PermissionLifecycle
        └─→ [Browser permission APIs]

TerminalPanel.tsx
  ├─→ WebContainerManager
  │     ├─→ [@stackblitz/webcontainer-api]
  │     ├─→ ProcessManager
  │     │     └─→ Process tracking
  │     └─→ CrashRecovery
  │           └─→ Auto-restart logic
  └─→ TerminalAdapter
        ├─→ [xterm.js]
        └─→ [xterm-addon-fit]
```

### 4.4 Duplicate Implementations

#### ⚠️ Path Validation Duplicated In:
1. `/src/lib/filesystem/validation.ts` - Core validation logic
2. `/src/lib/agent/facades/file-tools-impl.ts` - Tool-level validation
3. `/src/lib/webcontainer/manager.ts` - WC-level validation

**Recommendation:** Use single validator from `validation.ts` everywhere

#### ⚠️ File Watching Scattered Across:
1. `/src/lib/filesystem/sync-manager/` - FS change watchers
2. `/src/lib/webcontainer/manager.ts` - WC change listeners
3. `/src/lib/sync/sync-event-bus.ts` - Event propagation

**Recommendation:** Consolidate all file watching into `SyncEventBus` pattern

### 4.5 Integration Points

| Integration Point | File | Consumer | Purpose |
|-------------------|------|----------|---------|
| `LocalFSAdapter` | `/src/lib/filesystem/local-fs-adapter.ts` | All file operations | Browser FS API abstraction |
| `SyncManager` | `/src/lib/filesystem/sync-manager/sync-manager.ts` | File operations | Bidirectional sync |
| `WebContainerManager` | `/src/lib/webcontainer/manager.ts` | Terminal, tool exec | WC singleton lifecycle |
| `FileSnapshotStore` | `/src/lib/filesystem/file-snapshot-store.ts` | File operations | IndexedDB persistence |
| `ProcessManager` | `/src/lib/webcontainer/process-manager.ts` | Terminal | WC process tracking |

### 4.6 Issues & Recommendations

#### ⚠️ Medium Priority Issues

1. **Large Service: `reverse-sync-service.ts` (562 lines)**
   - **Problem:** Handles reverse sync, rollback, and conflict resolution
   - **Recommendation:** Split into:
     - `reverse-sync-service.ts` - Core reverse sync (200 lines)
     - `conflict-resolver.ts` - Conflict resolution (200 lines)
     - `rollback-manager.ts` - Rollback logic (150 lines)

2. **Large Store: `file-snapshot-store.ts` (509 lines)**
   - **Problem:** Mixes snapshot logic with file tracking
   - **Recommendation:** Split into:
     - `file-snapshot-store.ts` - Snapshot CRUD (250 lines)
     - `file-metadata-cache.ts` - Metadata caching (already exists at 260 lines)

3. **Test Coverage Warning:**
   - Large test files are good, but ensure they're fast
   - `reverse-sync-service.test.ts` is 799 lines - consider splitting by scenario

#### ✅ Architectural Strengths

1. **Well-designed facade pattern:**
   - `LocalFSAdapter` provides clean abstraction over File System Access API
   - Hides complexity from components

2. **Proper separation of concerns:**
   - UI layer doesn't touch File System Access API directly
   - Sync logic separated from file operations

3. **Good use of events:**
   - `SyncEventBus` provides decoupled communication
   - Easy to add new listeners without modifying existing code

---

## 5. Technical Debt & God Classes

### 5.1 Files >300 Lines (Ranked by Size)

| Rank | File | Lines | Category | Debt Level |
|------|------|-------|----------|------------|
| 1 | `/src/lib/state/dexie-db.ts` | 1,272 | Database | 🔥 Critical |
| 2 | `/src/presentation/components/agent/AgentConfigDialog.tsx` | 1,171 | UI Component | 🔥 Critical |
| 3 | `/src/infrastructure/persistence/dexie-db.ts` | 1,063 | Database | 🔥 Critical |
| 4 | `/src/lib/state/__tests__/knowledge-store.test.ts` | 1,024 | Test | ⚠️ Acceptable |
| 5 | `/src/lib/state/rag-store.ts` | 877 | State Store | 🔴 High |
| 6 | `/src/infrastructure/persistence/stores/rag-store.ts` | 810 | State Store | 🔴 High |
| 7 | `/src/lib/sync/__tests__/reverse-sync-service.test.ts` | 799 | Test | ⚠️ Acceptable |
| 8 | `/src/lib/state/knowledge-store.ts` | 718 | State Store | 🔴 High |
| 9 | `/src/stores/agents-store.test.ts` | 697 | Test | ⚠️ Acceptable |
| 10 | `/src/lib/state/dexie-db-migrations.ts` | 691 | Migration | ⚠️ Acceptable |
| 11 | `/src/lib/agent/tools/__tests__/retry-queue.test.ts` | 671 | Test | ⚠️ Acceptable |
| 12 | `/src/lib/agent/factory.ts` | 612 | Factory | 🔴 High |
| 13 | `/src/lib/state/quiz-store.ts` | 629 | State Store | 🔴 High |
| 14 | `/src/lib/state/conversation-store.ts` | 626 | State Store | 🔴 High |
| 15 | `/src/__tests__/chat.test.ts` | 622 | Test | ⚠️ Acceptable |
| 16 | `/src/infrastructure/persistence/stores/canvas-store.ts` | 621 | State Store | 🔴 High |
| 17 | `/src/lib/state/canvas-store.ts` | 616 | State Store | 🔴 High |
| 18 | `/src/lib/notes/markdown-converter.ts` | 578 | Converter | ⚠️ Medium |
| 19 | `/src/lib/agent/facades/file-tools-impl.ts` | 578 | Facade | 🔴 High |
| 20 | `/src/lib/utils/error-classification.ts` | 563 | Utils | ⚠️ Medium |

**Total files >300 lines:** 40 files
**Total lines in debt:** ~30,000 lines (~17.6% of codebase)

### 5.2 God Class Analysis

#### 🔥 Critical God Classes (Must Refactor)

1. **`dexie-db.ts` (1,272 lines) - DUPLICATE DATABASE SCHEMA**
   - **Problem:** Duplicate database definitions in:
     - `/src/lib/state/dexie-db.ts` (old location)
     - `/src/infrastructure/persistence/dexie-db.ts` (new location)
   - **Impact:** Maintenance nightmare, schema drift risk
   - **Solution:** See Epic 13 - Dexie Migration
   - **Status:** Migration in progress (see `bmm-workflow-status.yaml`)

2. **`AgentConfigDialog.tsx` (1,171 lines)**
   - **Problem:** Massive component handling all agent config UI
   - **Solution:** See Section 2.6 for detailed split recommendation
   - **Epic:** Epic 23 - UX/UI Modernization

#### 🔴 High Priority Refactors Needed

3. **`rag-store.ts` (877 lines in old, 810 in new)**
   - **Problem:** Large store with mixed concerns
   - **Solution:** Use Zustand slices pattern
   - **Split into:**
     - `rag-core.ts` - Core RAG state (200 lines)
     - `rag-index.ts` - Vector index management (250 lines)
     - `rag-search.ts` - Search operations (250 lines)
     - `rag-persistence.ts` - Dexie operations (200 lines)

4. **`agent/factory.ts` (612 lines)**
   - **Problem:** God factory handling too much
   - **Solution:** See Section 2.6 for detailed split recommendation

5. **`file-tools-impl.ts` (578 lines)**
   - **Problem:** Large facade with complex logic
   - **Solution:** Split into focused facades:
     - `file-reader-facade.ts` (~150 lines)
     - `file-writer-facade.ts` (~150 lines)
     - `file-lister-facade.ts` (~150 lines)
     - `command-executor-facade.ts` (~150 lines)

#### ⚠️ Medium Priority Refactors

6. **`markdown-converter.ts` (578 lines)**
   - **Problem:** Large converter with mixed format support
   - **Solution:** Split by format:
     - `markdown-to-html-converter.ts`
     - `html-to-markdown-converter.ts`
     - `markdown-sanitizer.ts`

7. **`error-classification.ts` (563 lines)**
   - **Problem:** Large error classifier
   - **Solution:** Use strategy pattern:
     - `error-classifier.ts` - Core classifier (200 lines)
     - `fs-error-classifier.ts` - FS errors (100 lines)
     - `network-error-classifier.ts` - Network errors (100 lines)
     - `agent-error-classifier.ts` - Agent errors (100 lines)

### 5.3 Duplicate Implementations Detected

#### 🔴 Critical Duplications

1. **Database Schema (CRITICAL)**
   - `/src/lib/state/dexie-db.ts` (1,272 lines)
   - `/src/infrastructure/persistence/dexie-db.ts` (1,063 lines)
   - **Impact:** Schema drift, migration chaos
   - **Status:** Epic 13 migration in progress

2. **State Stores (HIGH)**
   - `/src/lib/state/rag-store.ts` (877 lines)
   - `/src/infrastructure/persistence/stores/rag-store.ts` (810 lines)
   - **Impact:** Confusing import paths, state desync
   - **Solution:** Consolidate to single location

3. **Agent Configuration Types (MEDIUM)**
   - `/src/lib/agent/providers/types.ts`
   - `/src/presentation/components/agent/agent-config-types.ts`
   - **Solution:** Create `/src/lib/agent/config-types.ts` as single source of truth

#### ⚠️ Medium Priority Duplications

4. **RAG Store Logic**
   - `/src/lib/state/rag-store.ts`
   - `/src/infrastructure/persistence/stores/rag-store.ts`
   - `/src/lib/state/rag-store-helpers.ts`

5. **Canvas Store Logic**
   - `/src/lib/state/canvas-store.ts` (616 lines)
   - `/src/infrastructure/persistence/stores/canvas-store.ts` (621 lines)

6. **Knowledge Store Logic**
   - `/src/lib/state/knowledge-store.ts` (718 lines)
   - `/src/infrastructure/persistence/stores/knowledge-store.ts` (598 lines)
   - **Recommendation:** Consolidate all stores to `/src/lib/state/`

### 5.4 Complex Components (>500 lines, excluding tests)

| Component | Lines | Complexity | Recommendation |
|-----------|-------|------------|----------------|
| `AgentConfigDialog.tsx` | 1,171 | 🔥 Critical | Split into 6 sub-components (see Section 2.6) |
| `ChatConversation.tsx` | 516 | 🔴 High | Extract message rendering, streaming UI |
| `file-tools-impl.ts` | 578 | 🔴 High | Split into 4 focused facades |
| `markdown-converter.ts` | 578 | ⚠️ Medium | Split by format support |
| `retry-queue.test.ts` | 671 | ⚠️ Acceptable | Split by test scenario |
| `knowledge-store.test.ts` | 1,024 | ⚠️ Acceptable | Split by test scenario |
| `chat.test.ts` | 622 | ⚠️ Acceptable | Split by test scenario |

### 5.5 Technical Debt by Category

#### Architecture Debt
- **Duplicate database schemas** (CRITICAL)
- **Duplicate state stores** (HIGH)
- **God classes in agent factory** (HIGH)
- **Mixed patterns in stores** (MEDIUM)

#### Code Organization Debt
- **Large components** (HIGH)
- **Deeply nested directories** (MEDIUM)
- **Inconsistent import paths** (MEDIUM)

#### Testing Debt
- **Large test files** (low priority - tests are good)
- **Integration test coverage gaps** (MEDIUM)
- **E2E test coverage missing** (MEDIUM)

#### Documentation Debt
- **JSDoc coverage incomplete** (MEDIUM)
- **Architecture diagrams outdated** (MEDIUM)
- **API documentation missing** (MEDIUM)

---

## 6. Cross-Cutting Concerns

### 6.1 State Management Patterns

**Current State:**
- **Zustand** stores: 8 stores (`agents-store.ts`, `provider-config-store.ts`, etc.)
- **Dexie.js** persistence: 15+ stores in IndexedDB
- **React Context:** Workspace context, theme context
- **localStorage:** Agent state, ephemeral UI state

**Issues:**
1. **Mixed patterns:** Some state in Zustand, some in Context
2. **Duplicate stores:** Old locations vs new locations (see Section 5.3)
3. **Inconsistent persistence:** Some stores persist, some don't

**Recommendation:**
- Standardize on Zustand for all state
- Use Zustand slices for large stores
- Consistent persistence middleware configuration

### 6.2 Error Handling Patterns

**Current State:**
- `/src/lib/utils/error-handling.ts` - Error utilities
- `/src/lib/utils/error-classification.ts` (563 lines) - Error classification
- Custom error classes in `/src/lib/filesystem/sync-types.ts`

**Issues:**
1. **Error classification too large** (563 lines)
2. **Inconsistent error logging** (some use console, some use Sentry)
3. **Error recovery scattered** across components

**Recommendation:**
- Split error-classification by domain (FS, network, agent)
- Centralize error logging with consistent formatter
- Create error recovery strategy patterns

### 6.3 Testing Patterns

**Current State:**
- **Vitest** for unit/integration tests
- **jsdom** for React component tests
- **Test files co-located** with source (`__tests__/` directories)
- **Large test files:** Many tests >500 lines

**Strengths:**
- Good coverage of critical paths
- Comprehensive integration tests (chat, reverse-sync, retry-queue)
- Proper mocking of external dependencies

**Issues:**
- **Large test files** hard to navigate
- **Some E2E gaps** (no Playwright/Cypress tests yet)
- **Test data factories** not standardized

**Recommendation:**
- Split large test files by scenario (already acceptable, but could improve)
- Add E2E tests for critical user flows
- Standardize test data factories (see `AGENTS.md` reference to `data-factories.md`)

---

## 7. Recommendations by Priority

### 🔥 P0 - Critical (Do Immediately)

1. **Complete Dexie Migration (Epic 13)**
   - Eliminate duplicate `dexie-db.ts` files
   - Consolidate all database logic to `/src/infrastructure/persistence/`
   - **Status:** In progress (see `bmm-workflow-status.yaml`)
   - **ETA:** Story 13-1 through 13-8

2. **Split `AgentConfigDialog.tsx` (1,171 lines)**
   - See Section 2.6 for detailed split plan
   - Create sub-components in `AgentConfigForm/` directory
   - **Impact:** Improved maintainability, testability

3. **Fix Hot Reload Bug (WB-PR-1)**
   - Provider config changes not visible without refresh
   - Root cause: Store not subscribing to vault updates
   - **Status:** Hot fix in progress
   - **ETA:** Story WB-PR-1.2

### 🔴 P1 - High (Do This Sprint)

4. **Split Agent Factory (612 lines)**
   - Extract adapter factory to separate module
   - Extract tool composer to separate module
   - Keep core agent factory focused

5. **Consolidate State Stores**
   - Move all stores to `/src/lib/state/`
   - Remove duplicates in `/src/infrastructure/persistence/stores/`
   - Use Zustand slices for large stores

6. **Split Large RAG Store (877 lines)**
   - Use Zustand slices pattern
   - Separate concerns: core, index, search, persistence

### ⚠️ P2 - Medium (Do Next Sprint)

7. **Split File Tools Implementation (578 lines)**
   - Create focused facades for read, write, list, execute
   - Improve testability

8. **Refactor Error Classification (563 lines)**
   - Split by domain: FS, network, agent
   - Use strategy pattern

9. **Standardize Testing Patterns**
   - Split large test files by scenario
   - Add test data factories
   - Consider E2E test framework

### 📋 P3 - Low (Backlog)

10. **Consolidate Agent Configuration Types**
    - Create single source of truth
    - Eliminate duplicate type definitions

11. **Improve Documentation**
    - Add JSDoc to public APIs
    - Update architecture diagrams
    - Document integration points

12. **Standardize Import Paths**
    - Resolve deep directory nesting
    - Create consistent barrel exports

---

## 8. Metrics Summary

### Codebase Metrics

| Metric | Value | Status |
|--------|-------|--------|
| Total TypeScript/TSX files | 1,698 | ✅ |
| Total lines of code | 169,855 | ✅ |
| Files >300 lines | 40 | ⚠️ |
| Files >500 lines | 20 | 🔴 |
| Files >1000 lines | 3 | 🔥 Critical |
| God classes detected | 5 | 🔴 High |
| Duplicate implementations | 6 | 🔴 High |

### Domain Metrics

| Domain | Files | Lines | Debt |
|--------|-------|-------|------|
| LLM Provider Config | 11 | 3,607 | ⚠️ Medium |
| Agent Configuration | 50+ | 23,741 | 🔴 High |
| Chat Flow Management | 15+ | 2,500 | ⚠️ Medium |
| File System Integration | 71 | 13,051 | ⚠️ Medium |
| State Management | 25+ | 15,000+ | 🔴 High |

### Test Coverage

| Domain | Test Files | Lines | Coverage |
|--------|------------|-------|----------|
| Agent system | 20+ | 8,000+ | ✅ Good |
| File system | 15+ | 5,000+ | ✅ Good |
| Chat flow | 5+ | 2,000+ | ✅ Good |
| Provider config | 5+ | 1,500+ | ✅ Good |
| **Total** | 50+ | 18,000+ | **~10% of codebase** |

---

## 9. Architecture Strengths

Despite the technical debt identified, this codebase has significant architectural strengths:

1. **✅ Well-structured provider system**
   - Clean facade pattern
   - Proper separation of storage and encryption
   - Good test coverage

2. **✅ Comprehensive file system abstraction**
   - Proper use of facade pattern
   - Good sync event bus design
   - WebContainer integration well-isolated

3. **✅ Strong testing culture**
   - Integration tests for critical flows
   - Good test organization (co-located)
   - Proper mocking strategies

4. **✅ Modular agent system**
   - Tool facades provide clean abstraction
   - Provider adapter factory extensible
   - Permission management well-designed

5. **✅ Modern tech stack**
   - TanStack Router, AI, Store
   - WebContainer for code execution
   - Dexie.js for persistence
   - Zustand for state management

---

## 10. Next Steps

### Immediate Actions (This Week)

1. **Complete Epic 13 Stories 13-1 through 13-8**
   - Finish Dexie migration
   - Eliminate duplicate database schemas
   - Update all import paths

2. **Fix Hot Reload Bug (WB-PR-1)**
   - Implement store subscription to vault updates
   - Test provider config changes without refresh
   - Document hot reload behavior

3. **Start AgentConfigDialog Refactor**
   - Create sub-component directory structure
   - Extract tabs to separate components
   - Maintain feature parity

### Short-term Actions (Next 2 Weeks)

4. **Refactor Agent Factory**
   - Extract adapter factory
   - Extract tool composer
   - Update all call sites

5. **Consolidate State Stores**
   - Move all stores to `/src/lib/state/`
   - Remove duplicate stores
   - Update import paths

6. **Split RAG Store**
   - Implement Zustand slices
   - Test state consistency
   - Update consumers

### Long-term Actions (Next Month)

7. **Standardize Code Organization**
   - Resolve deep directory nesting
   - Create consistent barrel exports
   - Document architecture decisions

8. **Improve Testing**
   - Add E2E tests for critical flows
   - Standardize test data factories
   - Improve test performance

9. **Documentation**
   - Update JSDoc coverage
   - Create architecture diagrams
   - Document integration points

---

## Appendix A: File Inventory by Domain

### LLM Provider Configuration (11 files)
- `/src/lib/agent/providers/credential-vault.ts` (467 lines)
- `/src/lib/agent/providers/credential-storage.ts` (190 lines)
- `/src/lib/agent/providers/credential-encryption.ts` (300 lines)
- `/src/lib/agent/providers/model-registry.ts` (365 lines)
- `/src/lib/agent/providers/provider-adapter.ts` (254 lines)
- `/src/lib/agent/providers/agent-validation-service.ts` (486 lines)
- `/src/lib/agent/providers/types.ts` (245 lines)
- `/src/stores/provider-config-store.ts` (332 lines)
- `/src/stores/provider-models-store.ts` (515 lines)
- `/src/presentation/components/agent/ProviderConfigDialog.tsx` (270 lines)
- `/src/presentation/components/agent/ProviderSettings.tsx` (128 lines)

### Agent Configuration System (50+ files, 23,741 lines)
- `/src/lib/agent/factory.ts` (612 lines)
- `/src/lib/agent/prompt-composer.ts` (467 lines)
- `/src/lib/agent/hooks/use-agent-chat-with-tools.ts` (517 lines)
- `/src/lib/agent/preferences/preference-tracker.ts` (513 lines)
- `/src/lib/agent/suggestions/suggestion-tracker.ts` (480 lines)
- `/src/lib/agent/facades/file-tools-impl.ts` (578 lines)
- `/src/lib/agent/tools/retry-queue.ts` (547 lines)
- `/src/lib/agent/tools/tool-error.ts` (517 lines)
- `/src/lib/agent/tool-permission-manager.ts` (338 lines)
- `/src/lib/agent/suggestions/suggestion-engine.ts` (336 lines)
- `/src/lib/agent/memory/memory-index.ts` (365 lines)
- `/src/lib/agent/memory/conversation-memory.ts` (352 lines)
- `/src/lib/agent/preferences/user-profile.ts` (383 lines)
- `/src/stores/agents-store.ts` (324 lines)
- `/src/presentation/components/agent/AgentConfigDialog.tsx` (1,171 lines)

### Chat Flow Management (15+ files, ~2,500 lines)
- `/src/lib/state/conversation-store.ts` (626 lines)
- `/src/presentation/components/chat/ChatConversation.tsx` (516 lines)
- `/src/lib/agent/routes/__tests__/sse-streaming.test.ts` (524 lines)
- `/src/__tests__/chat.test.ts` (622 lines)
- `/src/lib/agent/hooks/use-agent-chat-with-tools.ts` (517 lines)
- `/src/lib/agent/routes/sse-streaming.ts` (~300 lines)

### File System Integration (71 files, 13,051 lines)
- `/src/lib/sync/reverse-sync-service.ts` (562 lines)
- `/src/lib/filesystem/file-snapshot-store.ts` (509 lines)
- `/src/lib/filesystem/__tests__/local-fs-adapter.test.ts` (422 lines)
- `/src/lib/sync/sync-event-bus.ts` (347 lines)
- `/src/lib/webcontainer/process-manager.ts` (337 lines)
- `/src/lib/filesystem/project-context-provider.ts` (335 lines)
- `/src/lib/webcontainer/terminal-adapter.ts` (327 lines)
- `/src/lib/filesystem/sync-manager/sync-file-ops.ts` (312 lines)
- `/src/lib/webcontainer/manager.ts` (292 lines)
- `/src/lib/webcontainer/crash-recovery.ts` (274 lines)
- `/src/lib/filesystem/sync-manager/sync-batch-sync.ts` (270 lines)
- `/src/lib/filesystem/sync-manager/sync-manager.ts` (209 lines)
- `/src/lib/filesystem/sync-types.ts` (222 lines)
- `/src/lib/filesystem/permission-lifecycle.ts` (236 lines)
- `/src/lib/filesystem/validation.ts` (197 lines)
- `/src/lib/sync/event-types.ts` (209 lines)

---

## Appendix B: Dependency Graph (Simplified)

```
┌─────────────────────────────────────────────────────────────┐
│                         UI Layer                            │
│  AgentConfigDialog, ChatConversation, FileTreePanel, etc.   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Hook Layer                               │
│  useAgentChatWithTools, useAgentConfigForm, etc.            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                      │
│  AgentFactory, CredentialVault, SyncManager, etc.           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    State Layer                              │
│  Zustand Stores (agents, providers, conversations, etc.)     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                Persistence Layer                            │
│  Dexie.js (IndexedDB), localStorage, sessionStorage         │
└─────────────────────────────────────────────────────────────┘
```

---

## Appendix C: Recommended Reading Order

For developers new to this codebase:

1. **Start with architecture documents:**
   - `_bmad-output/project-planning-artifacts/architecture.md`
   - `CLAUDE.md` (this file)
   - `AGENTS.md`

2. **Understand the domain:**
   - Agent system: `/src/lib/agent/README.md` (if exists)
   - Provider config: `/src/lib/agent/providers/`
   - File system: `/src/lib/filesystem/`

3. **Follow a user flow:**
   - Configure provider → Create agent → Start chat → Execute tool
   - Trace code through UI → Hook → Business Logic → State → Persistence

4. **Review test files:**
   - Tests demonstrate intended usage
   - Good integration tests show full flows

---

**Document Status:** ✅ Complete
**Next Review:** After Epic 13 completion (Dexie migration)
**Maintained By:** @bmad-core-bmad-master
**Last Updated:** 2026-01-01
