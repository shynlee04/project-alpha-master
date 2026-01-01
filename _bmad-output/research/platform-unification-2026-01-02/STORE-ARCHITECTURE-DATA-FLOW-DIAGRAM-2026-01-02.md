# Store Architecture Data Flow Diagrams
## Platform Unification Migration Strategy

**Date**: 2026-01-02
**Related**: Complete Store Architecture Analysis
**Purpose**: Visual representation of current state vs. target state

---

## Diagram 1: Current Store Architecture (CRITICAL ISSUES)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CURRENT STATE (JAN 2026)                            │
│                    ⚠️ CRITICAL ISSUES - NEEDS FIXING                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│  STORE LOCATIONS: 3  │         │  DUPLICATION RATE:   │
│  ─────────────────── │         │  30% (17/51 stores)  │
│                      │         │                      │
│  • lib/state (25)    │         │  ⛔ CRITICAL:        │
│  • stores (8)        │         │  • 1,595-line dup    │
│  • infrastructure    │         │  • 1 circular dep    │
│    (38+)             │         │  • 16 god stores     │
└──────────────────────┘         └──────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEPRECATED LOCATION (❌ DELETE)                      │
│                              src/stores/                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ agents-store.ts (430 lines)                                         │   │
│  │ ─────────────────────────────────────────────────────────────────  │   │
│  │ ❌ CIRCULAR DEPENDENCY (with provider-store.ts)                     │   │
│  │ ❌ GOD STORE (3.6x 120-line standard)                               │   │
│  │ ❌ DEPRECATED (use infrastructure instead)                          │   │
│  │                                                                     │   │
│  │ Line 24: import { useProviderStore } from '@/lib/state/...'        │   │
│  │          ↓                                                         │   │
│  │   [INFINITE LOOP RISK]                                              │   │
│  │          ↑                                                         │   │
│  │ Line 118 (dynamic): const { agentsStore } = await import(...)      │   │
│  │                                                                     │   │
│  │ USED BY: 19 components                                             │   │
│  │ • AgentConfigDialog.tsx (circular dep risk!)                       │   │
│  │ • AgentsPanel.tsx                                                  │   │
│  │ • AgentChatPanel.tsx                                               │   │
│  │ • [16 more components]                                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ agent-selection-store.ts (668 lines)                                │   │
│  │ ─────────────────────────────────────────────────────────────────  │   │
│  │ ❌ BLOATED (5.6x 120-line standard)                                 │   │
│  │ ❌ DEPRECATED (use infrastructure instead)                          │   │
│  │                                                                     │   │
│  │ USED BY: 8 components (workspace selectors)                        │   │
│  │ • KnowledgePage.tsx                                                │   │
│  │ • NoteEditor.tsx                                                   │   │
│  │ • StudyPage.tsx                                                    │   │
│  │ • [5 more components]                                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ provider-store.ts (37 lines)                                        │   │
│  │ ─────────────────────────────────────────────────────────────────  │   │
│  │ ✅ FACADE (re-exports from lib/state)                              │   │
│  │                                                                     │   │
│  │ export { useProviderStore } from '@/lib/state/provider-store';     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [5 more deprecated stores...]                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         LEGACY LOCATION (⚠️ MIGRATE)                         │
│                           src/lib/state/                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ provider-store.ts (267 lines)                                        │   │
│  │ ─────────────────────────────────────────────────────────────────  │   │
│  │ ❌ CIRCULAR DEPENDENCY (with agents-store.ts)                        │   │
│  │ ⚠️ MEDIUM-LARGE (2.2x standard, but acceptable)                     │   │
│  │ ✅ PRIMARY DATA SOURCE (works well)                                 │   │
│  │                                                                     │   │
│  │ USED BY: 19 components                                             │   │
│  │ • AgentConfigDialog.tsx (circular dep risk!)                       │   │
│  │ • ProviderConfigDialog.tsx                                          │   │
│  │ • ProviderSettings.tsx                                              │   │
│  │ • [16 more components]                                             │   │
│  │                                                                     │   │
│  │ FEATURES:                                                           │   │
│  │ • Provider CRUD (add, update, delete)                              │   │
│  │ • API key management (setApiKey, getApiKey)                         │   │
│  │ • Model registry (fetchModels, getAvailableModels)                  │   │
│  │ • Cross-workspace events (MODELS_UPDATED)                          │   │
│  │ • CredentialVault integration (Dexie crypto)                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ rag-store.ts (1,595 lines)                                           │   │
│  │ ─────────────────────────────────────────────────────────────────  │   │
│  │ ⛔ DUPLICATE (same functionality in infrastructure)                  │   │
│  │ ❌ GOD STORE (13.3x 120-line standard)                              │   │
│  │ ⚠️ OUTDATED (infrastructure version is newer)                       │   │
│  │                                                                     │   │
│  │ USAGE: Unknown (deprecated)                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [22 more legacy stores...]                                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      MODERN LOCATION (✅ RECOMMENDED)                        │
│                 src/infrastructure/persistence/stores/                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ use-app-store.ts (281 lines)                                        │   │
│  │ ─────────────────────────────────────────────────────────────────  │   │
│  │ ✅ UNIFIED STORE (agent + provider + conversation)                  │   │
│  │ ✅ SLICE PATTERN (modular, testable)                               │   │
│  │ ✅ DEXIE PERSISTENCE (encrypted, reliable)                         │   │
│  │                                                                     │   │
│  │ ARCHITECTURE:                                                       │   │
│  │                                                                     │   │
│  │ export const useAppStore = create<AppState>()(                     │   │
│  │   persist(                                                          │   │
│  │     (...a) => ({                                                    │   │
│  │       // Agent Slices (5 slices)                                    │   │
│  │       ...createAgentCrudSlice(...a),              // ~70 lines      │   │
│  │       ...createAgentWorkspaceBindingsSlice(...a),  // ~85 lines      │   │
│  │       ...createAgentValidationSlice(...a),         // ~50 lines      │   │
│  │       ...createAgentEventsSlice(...a),            // ~45 lines      │   │
│  │       ...createAgentUtilsSlice(...a),            // ~30 lines      │   │
│  │                                                                     │   │
│  │       // Provider Slices (3 slices)                                 │   │
│  │       ...createProviderCrudSlice(...a),            // ~80 lines     │   │
│  │       ...createProviderModelsSlice(...a),          // ~90 lines     │   │
│  │       ...createProviderUtilsSlice(...a),           // ~40 lines     │   │
│  │                                                                     │   │
│  │       // [More slices...]                                          │   │
│  │     }),                                                             │   │
│  │     {                                                                │   │
│  │       name: 'app-state',                                            │   │
│  │       storage: createDexieStorage('appState'),                      │   │
│  │     }                                                                │   │
│  │   )                                                                  │   │
│  │ );                                                                   │   │
│  │                                                                     │   │
│  │ USED BY: 45+ components (modern path)                              │   │
│  │ • AgentManager.tsx (✅ NEW, Jan 2026)                               │   │
│  │ • UnifiedAgentSelector.tsx (✅ NEW, Jan 2026)                       │   │
│  │ • KnowledgePage.tsx (✅ FIXED fragmentation bug)                    │   │
│  │ • [42 more components]                                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ agents/                                                              │   │
│  │ ├── agents-store.ts (main orchestration)                            │   │
│  │ ├── slices/                                                          │   │
│  │ │   ├── agent-crud-slice.ts                   (~70 lines)           │   │
│  │ │   ├── agent-workspace-bindings-slice.ts     (~85 lines)           │   │
│  │ │   ├── agent-validation-slice.ts             (~50 lines)           │   │
│  │ │   ├── agent-events-slice.ts                 (~45 lines)           │   │
│  │ │   └── agent-utils-slice.ts                  (~30 lines)           │   │
│  │ └── agent-selection-store.ts                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ providers/                                                           │   │
│  │ ├── provider-store.ts (main orchestration)                          │   │
│  │ └── slices/                                                          │   │
│  │      ├── provider-crud-slice.ts                (~80 lines)           │   │
│  │      ├── provider-models-slice.ts              (~90 lines)           │   │
│  │      └── provider-utils-slice.ts               (~40 lines)           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ rag/                                                                 │   │
│  │ ├── rag-store.ts (810 lines) - ⚠️ LARGE                             │   │
│  │ └── slices/                                                          │   │
│  │     ├── rag-index-slice.ts                     (~100 lines)          │   │
│  │     ├── rag-search-slice.ts                    (~100 lines)          │   │
│  │     ├── rag-chunking-slice.ts                  (~100 lines)          │   │
│  │     ├── rag-voice-slice.ts                     (~100 lines)          │   │
│  │     └── rag-chat-slice.ts                      (~100 lines)          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [35+ more modern stores...]                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Diagram 2: Circular Dependency Flow (CRITICAL BUG)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CIRCULAR DEPENDENCY DETECTION                             │
│                    ════════════════════════════════                          │
│                    Risk Level: 🔴 HIGH (Confirmed)                           │
│                    Impact: Infinite loops, build warnings, crashes          │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐              ┌──────────────────────────────┐
│  agents-store.ts             │              │  provider-store.ts           │
│  (src/stores/)               │              │  (src/lib/state/)            │
├──────────────────────────────┤              ├──────────────────────────────┤
│                              │              │                              │
│  Line 24:                    │              │  Line 118:                   │
│  ┌─────────────────────┐     │    ┌─────────┴──────┐                      │
│  │ import {            │     │    │ const {        │                      │
│  │   useProviderStore  │─────┼────┤   agentsStore  │                      │
│  │ } from '@/lib/...  │     │    │ } = await      │                      │
│  │ }                   │     │    │   import('@/..  │                      │
│  └─────────────────────┘     │    │   stores/...') │                      │
│           │                  │    └────────────────┘                      │
│           │                  │           │                                │
│           ▼                  │           ▼                                │
│  ┌─────────────────────┐    │    ┌────────────────┐                      │
│  │ useProviderStore()  │    │    │ agentsStore()  │                      │
│  │ .getProviders()     │    │    │ .getAgents()   │                      │
│  └─────────────────────┘    │    └────────────────┘                      │
│           │                  │           │                                │
└───────────┼──────────────────┴───────────┼────────────────────────────────┘
            │                              │
            │                              │
            └──────────┬───────────────────┘
                       │
                       ▼
          ┌──────────────────────────┐
          │  ⛔ INFINITE LOOP RISK   │
          │  ─────────────────────   │
          │  Zustand v5 detects      │
          │  reference changes       │
          │  and triggers infinite   │
          │  re-renders              │
          └──────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          ROOT CAUSE ANALYSIS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. agents-store.ts needs provider data for:                               │
│     • Validating agent provider exists                                      │
│     • Fetching available models for provider                                │
│     • Displaying provider info in UI                                        │
│                                                                             │
│  2. provider-store.ts needs agent data for:                                │
│     • Updating agents when provider changes                                │
│     • Notifying agents of model updates                                    │
│     • Checking default agent per provider                                  │
│                                                                             │
│  3. Current Workaround:                                                    │
│     • Dynamic import at provider-store.ts:118                               │
│     • Breaks circular dependency detection                                 │
│     • ⚠️ Still creates runtime coupling                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         SOLUTION: EVENT-DRIVEN ARCH                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  STEP 1: Remove circular import                                            │
│  ──────────────────────────────                                            │
│  // agents-store.ts                                                         │
│  - import { useProviderStore } from '@/lib/state/provider-store';  ❌     │
│  + crossWorkspaceEventBus.emit('agent:provider-change', { providerId }); ✅│
│                                                                             │
│  // provider-store.ts                                                       │
│  - const { agentsStore } = await import('@/stores/agents-store');     ❌    │
│  + crossWorkspaceEventBus.on('agent:provider-change', ({ providerId }) => {│
│  +     // Handle provider change                                           │
│  +   });                                                                    │
│                                                                             │
│  STEP 2: Update all components (19 files)                                   │
│  ───────────────────────────────────────────                                │
│  // BEFORE (circular dep risk)                                              │
│  import { useAgentsStore } from '@/stores/agents-store';                    │
│  import { useProviderStore } from '@/lib/state/provider-store';             │
│                                                                             │
│  // AFTER (clean, modular)                                                 │
│  import { useAppStore } from '@/infrastructure/persistence/stores/...';     │
│                                                                             │
│  STEP 3: Delete deprecated stores                                           │
│  ──────────────────────────────────────                                     │
│  rm src/stores/agents-store.ts                                              │
│  rm src/lib/state/provider-store.ts  (optional - keep as facade)            │
│                                                                             │
│  RESULT: ✅ Zero circular dependencies                                       │
│          ✅ Clean data flow via events                                       │
│          ✅ Backward compatible (facades)                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Diagram 3: Provider → Agent → Chat Flow (CURRENT STATE)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROVIDER → AGENT → CHAT DATA FLOW                         │
│                    ═══════════════════════════════                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  USER ACTION LAYER                                                          │
│  ──────────────────                                                          │
│                                                                             │
│  [User Opens AgentConfigDialog]                                             │
│           │                                                                 │
│           ▼                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ AgentConfigDialog.tsx (1,089 lines - GOD COMPONENT)                 │   │
│  │ ─────────────────────────────────────────────────────────────────  │   │
│  │ ❌ Imports:                                                         │   │
│  │   import { useAgentsStore } from '@/stores/agents-store';          │   │
│  │   import { useProviderStore } from '@/lib/state/provider-store';   │   │
│  │                                                                     │   │
│  │ ⚠️ RISK: Both imports → circular dependency!                       │   │
│  │                                                                     │   │
│  │ Features:                                                           │   │
│  │ • Agent CRUD (add, edit, delete, duplicate)                         │   │
│  │ • Provider selection dropdown                                       │   │
│  │ • API key input (★★★★★ masked)                                      │   │
│  │ • Model selection (from provider registry)                          │   │
│  │ • Workspace permissions configuration                                │   │
│  │ • Tool trust level management                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│           │                                                                 │
│           ▼                                                                 │
┌─────────────────────────────────────────────────────────────────────────────┐
│  STORE ACCESS LAYER (⚠️ CURRENT - CIRCULAR DEP)                             │
│  ─────────────────────────────────────────                                 │
│                                                                             │
│  ┌─────────────────────────┐         ┌─────────────────────────┐           │
│  │ Agent Store             │         │ Provider Store           │           │
│  │ (src/stores/)            │         │ (src/lib/state/)         │           │
│  │                         │         │                          │           │
│  │ Line 24:                │◄────┐   │ Line 118:               │──┐        │
│  │ import useProviderStore  │     │   │ import agentsStore       │  │        │
│  │   from lib/state        │     │   │   (dynamic)              │  │        │
│  │         │               │     │   │         │                │  │        │
│  │         ▼               │     │   │         ▼                │  │        │
│  │ ┌─────────────────┐    │     │   │ ┌────────────┐           │  │        │
│  │ │ addAgent()      │    │     └──┤ │getApiKey() │           │  │        │
│  │ │ updateAgent()   │              │ │setApiKey() │           │  │        │
│  │ │ removeAgent()   │◄─────────────┤ │           │           │  │        │
│  │ │ getAgentsForW.. │              │ └────────────┘           │  │        │
│  │ └─────────────────┘              │                          │  │        │
│  └─────────────────────────┘         └─────────────────────────┘  │        │
│                                                          │         │        │
│                                                          └─────────┘        │
│                                                                     │         │
│                                                                     ▼         │
│                                                     ┌──────────────────────┐ │
│                                                     │ CIRCULAR DEP!        │ │
│                                                     │ ──────────────────   │ │
│                                                     │ agents-store.ts      │ │
│                                                     │      ↓              │ │
│                                                     │ provider-store.ts   │ │
│                                                     │      ↓              │ │
│                                                     │ agents-store.ts     │ │
│                                                     │    (loop!)          │ │
│                                                     └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PERSISTENCE LAYER                                                          │
│  ─────────────────                                                            │
│                                                                             │
│  ┌─────────────────────────┐         ┌─────────────────────────┐           │
│  │ Agent Store             │         │ Provider Store           │           │
│  │ (localStorage)           │         │ (Dexie IndexedDB)         │           │
│  │                         │         │                          │           │
│  │ • agents[]               │         │ • providers[]             │           │
│  │ • activeAgentId          │         │ • API keys (encrypted)    │           │
│  │ • workspaceBindings[]    │         │ • availableModels[]       │           │
│  │                         │         │ • activeProviderId        │           │
│  └─────────────────────────┘         │                          │           │
│                                       │ CredentialVault:         │           │
│                                       │ ┌──────────────────────┐ │           │
│                                       │ │ AES-256-GCM          │ │           │
│                                       │ │ PBKDF2 (100k iter)   │ │           │
│                                       │ └──────────────────────┘ │           │
│                                       └─────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  AGENT CHAT HOOK LAYER                                                       │
│  ─────────────────────                                                          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ useAgentChatWithTools()                                              │   │
│  │ ─────────────────────────────────────────────────────────────────  │   │
│  │ ❌ Imports from both stores (circular dep risk)                     │   │
│  │                                                                     │   │
│  │ 1. Load agent config (useAgentsStore)                              │   │
│  │    const agent = useAgentsStore(s => s.agents.find(a =>            │   │
│  │      a.id === activeAgentId));                                     │   │
│  │                                                                     │   │
│  │ 2. Load provider API key (useProviderStore)                        │   │
│  │    const apiKey = await useProviderStore.getState().getApiKey(     │   │
│  │      agent.providerId);                                            │   │
│  │                                                                     │   │
│  │ 3. Create ProviderAdapter                                          │   │
│  │    const adapter = providerAdapterFactory.createAdapter(            │   │
│  │      agent.providerId, { apiKey });                                │   │
│  │                                                                     │   │
│  │ 4. Stream chat responses                                            │   │
│  │    const stream = await adapter.chat(messages, {                   │   │
│  │      model: agent.modelId,                                          │   │
│  │      tools: enabledTools                                           │   │
│  │    });                                                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  UI LAYER                                                                   │
│  ────────                                                                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ AgentChatPanel.tsx                                                    │   │
│  │ ─────────────────────────────────────────────────────────────────  │   │
│  │ • Displays chat messages                                             │   │
│  │ • Manages conversation state                                         │   │
│  │ • Handles tool approvals                                             │   │
│  │ • Shows active agent info                                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Diagram 4: Target Architecture (AFTER MIGRATION)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TARGET STATE (AFTER EPIC AC-1)                          │
│                    ═══════════════════════════════                           │
│                    ✅ CLEAN ARCHITECTURE - ZERO ISSUES                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│  STORE LOCATIONS: 1  │         │  DUPLICATION RATE:   │
│  ─────────────────── │         │  0% (consolidated)   │
│                      │         │                      │
│  • infrastructure    │         │  ✅ EXCELLENT:       │
│    (38+ stores)      │         │  • 0 duplicates      │
│                      │         │  • 0 circular deps   │
│  [DELETED]           │         │  • 4 god stores      │
│  • lib/state         │         │  • (down from 16)    │
│  • stores            │         │                      │
└──────────────────────┘         └──────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      UNIFIED STORE LOCATION (✅ FINAL STATE)                 │
│                 src/infrastructure/persistence/stores/                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ use-app-store.ts (UNIFIED - 281 lines)                               │   │
│  │ ─────────────────────────────────────────────────────────────────  │   │
│  │ ✅ ZERO circular dependencies                                        │   │
│  │ ✅ Slice pattern (modular, testable)                                 │   │
│  │ ✅ Event-driven (cross-store communication)                          │   │
│  │ ✅ Dexie persistence (encrypted, reliable)                           │   │
│  │                                                                     │   │
│  │ ARCHITECTURE:                                                       │   │
│  │                                                                     │   │
│  │ export const useAppStore = create<AppState>()(                     │   │
│  │   persist(                                                          │   │
│  │     (...a) => ({                                                    │   │
│  │       // Agent Slices (5 slices, ~280 lines total)                  │   │
│  │       ...createAgentCrudSlice(...a),                                │   │
│  │       ...createAgentWorkspaceBindingsSlice(...a),                   │   │
│  │       ...createAgentValidationSlice(...a),                          │   │
│  │       ...createAgentEventsSlice(...a),                              │   │
│  │       ...createAgentUtilsSlice(...a),                               │   │
│  │                                                                     │   │
│  │       // Provider Slices (3 slices, ~210 lines total)               │   │
│  │       ...createProviderCrudSlice(...a),                             │   │
│  │       ...createProviderModelsSlice(...a),                           │   │
│  │       ...createProviderUtilsSlice(...a),                            │   │
│  │                                                                     │   │
│  │       // Conversation Slices (4 slices, ~250 lines)                 │   │
│  │       // RAG Slices (5 slices, ~500 lines)                          │   │
│  │       // Tool Permission Slices (2 slices, ~150 lines)              │   │
│  │       // [More slices...]                                          │   │
│  │     }),                                                             │   │
│  │     {                                                                │   │
│  │       name: 'app-state',                                            │   │
│  │       storage: createDexieStorage('appState'),                      │   │
│  │     }                                                                │   │
│  │   )                                                                  │   │
│  │ );                                                                   │   │
│  │                                                                     │   │
│  │ USED BY: ALL 85+ COMPONENTS (unified import path)                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ EVENT BUS (cross-workspace communication)                           │   │
│  │ ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                     │   │
│  │ crossWorkspaceEventBus:                                              │   │
│  │ • emit('MODELS_UPDATED', { models })                                │   │
│  │ • emit('PROVIDER_CHANGE', { providerId })                           │   │
│  │ • emit('AGENT_CHANGE', { agentId })                                 │   │
│  │ • emit('WORKSPACE_CHANGE', { workspaceType })                       │   │
│  │                                                                     │   │
│  │ Replaces direct store imports → eliminates circular deps            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [38+ modern stores with slice pattern...]                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    FACADE LAYER (BACKWARD COMPATIBILITY)                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ src/stores/agents-store.ts (NEW - 30 lines)                          │   │
│  │ ─────────────────────────────────────────────────────────────────  │   │
│  │ ✅ FACADE (re-exports from infrastructure)                          │   │
│  │                                                                     │   │
│  │ // Backward compatibility - old imports still work                 │   │
│  │ export { useAppStore as useAgentsStore }                           │   │
│  │   from '@/infrastructure/persistence/stores/use-app-store';         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ src/lib/state/provider-store.ts (NEW - 30 lines)                     │   │
│  │ ─────────────────────────────────────────────────────────────────  │   │
│  │ ✅ FACADE (re-exports from infrastructure)                          │   │
│  │                                                                     │   │
│  │ // Backward compatibility - old imports still work                 │   │
│  │ export { useProviderStore }                                          │   │
│  │   from '@/infrastructure/persistence/stores/providers/...';         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  RESULT: ✅ 100% backward compatibility (no breaking changes)                │
│          ✅ Zero circular dependencies                                      │
│          ✅ Clean migration path (incremental updates possible)              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Diagram 5: Provider → Agent → Chat Flow (TARGET STATE)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROVIDER → AGENT → CHAT DATA FLOW                         │
│                    ═══════════════════════════════                            │
│                    (AFTER EPIC AC-1 MIGRATION)                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  USER ACTION LAYER                                                          │
│  ──────────────────                                                          │
│                                                                             │
│  [User Opens AgentConfigDialog]                                             │
│           │                                                                 │
│           ▼                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ AgentConfigDialog.tsx (200 lines - after hook extraction)            │   │
│  │ ─────────────────────────────────────────────────────────────────  │   │
│  │ ✅ Imports:                                                         │   │
│  │   import { useAppStore } from '@/infrastructure/persistence/...';   │   │
│  │                                                                     │   │
│  │ ✅ CLEAN: Single import → no circular dependency!                   │   │
│  │                                                                     │   │
│  │ Features (same functionality, cleaner code):                        │   │
│  │ • Agent CRUD (add, edit, delete, duplicate)                         │   │
│  │ • Provider selection dropdown                                       │   │
│  │ • API key input (★★★★★ masked)                                      │   │
│  │ • Model selection (from provider registry)                          │   │
│  │ • Workspace permissions configuration                                │   │
│  │ • Tool trust level management                                       │   │
│  │                                                                     │   │
│  │ Custom Hooks Extracted:                                             │   │
│  │ • useAgentFormState() (80 lines)                                    │   │
│  │ • useProviderFormState() (60 lines)                                 │   │
│  │ • useWorkspacePermissions() (90 lines)                              │   │
│  │ • useToolTrustLevels() (70 lines)                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│           │                                                                 │
│           ▼                                                                 │
┌─────────────────────────────────────────────────────────────────────────────┐
│  STORE ACCESS LAYER (✅ CLEAN - EVENT-DRIVEN)                               │
│  ───────────────────────────────                                           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ useAppStore (unified store)                                          │   │
│  │ ─────────────────────────────────────────────────────────────────  │   │
│  │ ✅ NO circular dependencies                                          │   │
│  │ ✅ Event-driven communication                                       │   │
│  │                                                                     │   │
│  │ Agent Slices:                                                       │   │
│  │ • createAgentCrudSlice()                                            │   │
│  │   - addAgent()                                                      │   │
│  │   - updateAgent()                                                   │   │
│  │   - removeAgent()                                                   │   │
│  │   - duplicateAgent()                                                │   │
│  │                                                                     │   │
│  │ Provider Slices:                                                    │   │
│  │ • createProviderCrudSlice()                                         │   │
│  │   - addProvider()                                                   │   │
│  │   - updateProvider()                                                │   │
│  │   - removeProvider()                                                │   │
│  │   - setApiKey()                                                     │   │
│  │   - fetchModels()                                                   │   │
│  │                                                                     │   │
│  │ Event Emission (replaces direct imports):                          │   │
│  │ • emit('PROVIDER_CHANGE', { providerId })                          │   │
│  │ • emit('MODELS_UPDATED', { models })                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Event Bus (cross-store communication)                              │   │
│  │ ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                     │   │
│  │ Provider Store emits:                                               │   │
│  │ • MODELS_UPDATED → Agent Store listens (update model list)          │   │
│  │ • PROVIDER_CHANGE → Agent Store listens (update agents)             │   │
│  │                                                                     │   │
│  │ Agent Store emits:                                                  │   │
│  │ • AGENT_CHANGE → Provider Store listens (update default agent)      │   │
│  │ • WORKSPACE_CHANGE → All stores listen (sync state)                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ✅ RESULT: Zero circular dependencies                                    │
│           Clean event-driven architecture                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PERSISTENCE LAYER (unchanged - already good)                               │
│  ───────────────────────────────                                           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ useAppStore (Dexie IndexedDB)                                         │   │
│  │ ─────────────────────────────────────────────────────────────────  │   │
│  │ Unified persistence:                                                  │   │
│  │ • agents[] + agent config                                             │   │
│  │ • providers[] + API keys (encrypted)                                  │   │
│  │ • models[] (cached)                                                   │   │
│  │ • conversations[]                                                    │   │
│  │ • RAG indexes                                                         │   │
│  │ • [More data...]                                                      │   │
│  │                                                                     │   │
│  │ CredentialVault (AES-256-GCM + PBKDF2)                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  AGENT CHAT HOOK LAYER                                                       │
│  ─────────────────────                                                          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ useAgentChatWithTools()                                              │   │
│  │ ─────────────────────────────────────────────────────────────────  │   │
│  │ ✅ Single import from unified store                                  │   │
│  │                                                                     │   │
│  │ 1. Load agent config (useAppStore)                                  │   │
│  │    const agent = useAppStore(s => s.agents.find(a =>                 │   │
│  │      a.id === activeAgentId));                                      │   │
│  │                                                                     │   │
│  │ 2. Load provider API key (useAppStore)                              │   │
│  │    const apiKey = await useAppStore.getState().getApiKey(           │   │
│  │      agent.providerId);                                             │   │
│  │                                                                     │   │
│  │ 3. Create ProviderAdapter (same as before)                          │   │
│  │    const adapter = providerAdapterFactory.createAdapter(...);       │   │
│  │                                                                     │   │
│  │ 4. Stream chat responses (same as before)                            │   │
│  │    const stream = await adapter.chat(messages, { ... });            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  UI LAYER (unchanged)                                                        │
│  ────────                                                                   │
│                                                                             │
│  AgentChatPanel.tsx (same functionality)                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Diagram 6: Import Path Migration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    IMPORT PATH MIGRATION STRATEGY                            │
│                    ═══════════════════════════════                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  BEFORE (CURRENT - FRAGMENTED)                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  // Agent Store (3 different import paths - confusing!)                    │
│  import { useAgentsStore } from '@/stores/agents-store';           #1 (19) │
│  import { useAgentStore } from '@/stores/agents';                    #2 (2)  │
│  import { useAgentConfigStore } from '@/infrastructure/persistence/...';#3 (3)│
│                                                                             │
│  // Provider Store (2 different import paths)                              │
│  import { useProviderStore } from '@/lib/state/provider-store';    #1 (19) │
│  import { useProviderStore } from '@/stores/provider-store';        #2 (3)  │
│                                                                             │
│  ❌ ISSUES:                                                                │
│  • Confusing for developers (which path to use?)                           │
│  • Risk of circular dependencies (agents-store ↔ provider-store)          │
│  • Fragmented architecture (3 separate locations)                          │
│  • Maintenance burden (updates in 3 places)                                │
└─────────────────────────────────────────────────────────────────────────────┘

                                │
                                ▼

┌─────────────────────────────────────────────────────────────────────────────┐
│  AFTER (TARGET - UNIFIED)                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  // Agent Store (single import path)                                        │
│  import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';│
│                                                                             │
│  // Or use slice imports (granular)                                         │
│  import { useAgentsStore } from '@/infrastructure/persistence/stores/agents/agents-store';│
│                                                                             │
│  // Provider Store (single import path)                                    │
│  import { useProviderStore } from '@/infrastructure/persistence/stores/providers/provider-store';│
│                                                                             │
│  ✅ BENEFITS:                                                              │
│  • Clear import paths (one location)                                       │
│  • Zero circular dependencies (event-driven)                               │
│  • Unified architecture (infrastructure only)                              │
│  • Easy maintenance (updates in one place)                                │
│  • Backward compatible (facades for old imports)                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  MIGRATION PATHS (INCREMENTAL)                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  STEP 1: Update 20 priority components (Week 3)                            │
│  ────────────────────────────────────────────                              │
│  // 20 high-priority files (AgentConfigDialog + dependencies)              │
│  FROM: import { useAgentsStore } from '@/stores/agents-store';             │
│  TO:   import { useAppStore } from '@/infrastructure/persistence/...';     │
│                                                                             │
│  STEP 2: Update remaining 65 components (Week 4)                           │
│  ───────────────────────────────────────────────                            │
│  // Bulk migration via grep + sed                                          │
│  find src/ -name "*.ts*" -exec sed -i.bak \                                │
│    "s|from '@/stores/agents-store'|from '@/infrastructure/persistence/...'|g"│
│                                                                             │
│  STEP 3: Keep facades for backward compatibility (indefinite)              │
│  ────────────────────────────────────────────────────                       │
│  // Old imports still work (zero breaking changes)                         │
│  // src/stores/agents-store.ts (30 lines, facade)                         │
│  export { useAppStore as useAgentsStore } from '@/infrastructure/...';    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Diagram 7: Component Migration Timeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMPONENT MIGRATION TIMELINE                              │
│                    ═══════════════════════════════                            │
└─────────────────────────────────────────────────────────────────────────────┘

Week 1-2: Phase 0 - Foundation Stabilization
├─ P0 Fixes
│  ├─ Fix circular dependency (Epic AC-1.1, 6h)
│  ├─ Add IndexedDB quota handling (Epic DB-001, 20h)
│  └─ Extract AgentConfigDialog hooks (Epic UI-001, 20h)
│
Week 3-4: Phase 1 - Store Consolidation
├─ Priority 1 Components (20 files)
│  ├─ AgentConfigDialog.tsx
│  ├─ ProviderSettings.tsx
│  ├─ AgentsPanel.tsx
│  ├─ AgentChatPanel.tsx
│  ├─ KnowledgePage.tsx
│  ├─ NoteEditor.tsx
│  ├─ StudyPage.tsx
│  ├─ [13 more high-priority files]
│  └─ Estimated: 12-16 hours
│
Week 5-6: Phase 2 - Infrastructure Hardening
├─ Priority 2 Components (40 files)
│  ├─ All workspace components
│  ├─ All service layers
│  ├─ All hook layers
│  ├─ [Bulk migration via grep + sed]
│  └─ Estimated: 20-24 hours
│
Week 7-8: Phase 3 - Architecture Transformation
├─ Priority 3 Components (25 files)
│  ├─ Test files
│  ├─ Documentation updates
│  ├─ Route handlers
│  ├─ [Final cleanup]
│  └─ Estimated: 8-12 hours
│
Total Effort: 85-100 hours
Total Components: 85 files
Risk Level: MEDIUM (backward compatible via facades)
```

---

**END OF DIAGRAMS**

**Document Length**: 727 lines
**Related Documents**:
- Complete Store Architecture Analysis (1,248 lines)
- Platform Unification ADR-001
- Epic AC-1 (Agent Configuration Consolidation)
