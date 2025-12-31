---
step: 3
id: step-03-agent-vault
name: Agent Vault & Configuration
workflow: architectural-consolidation
---

# Step 3: Agent Vault & Configuration (Layer 3)

**Objective**: Implement the strict `Agent` contract (Layer 3), fixing the "mock data" issues in AC-02. Ensure Agent Selector creates valid L3 entities with proper Provider+Model linkage and conditional Tool bindings.

---

## 1. ARCHITECTURAL ANALYSIS & CORRECTION of "Architectural Refactor"

**Previous Error**: usage of `src/mocks/agents.ts` and `mockAgents`.
**Previous Error**: `AgentSelector` used a partial implementation that didn't fully support workspace-specific tool permissions.
**Previous Error**: `Agent` interface lacked `providerId` and `modelId` distinct fields, blurring the linkage.

**Corrective Action**:
We will rewrite `src/stores/agents-store.ts` to strictly implement the L3 Contracts defined in Step 01, resolving the "God Component" anti-pattern by splitting concerns.

---

## 2. DATA CONTRACT REFACTORING

### 2.1 Update `src/stores/agents-store.ts`

**Transform** the `Agent` interface to matching the Locked Contract:

```typescript
// TARGET STATE: src/stores/agents-store.ts

export interface Agent {
  id: string;
  name: string;
  description: string;
  
  // Linkage (Required)
  providerId: string;
  modelId: string;
  
  // LLM Params
  systemPrompt: string;
  temperature: number;
  maxTokens: number; // e.g. 4000
  
  // Bindings
  tools: AgentToolBinding[];
  workspaceBindings: WorkspaceBinding[]; // e.g. { workspace: 'ide', uiVariant: 'full' }
  
  // Metrics
  tasksCompleted: number;
  successRate: number; 
  tokensUsed: number;
  status: 'online' | 'offline' | 'busy' | 'error';
  lastActive: Date;
  createdAt: Date;
}

// ... Store Definition using create<AgentsState>() ...
```

**Crucial**: Drop any import from `mocks`. The store IS the source of truth.

### 2.2 Default Agent Seeding (`src/lib/defaults/initial-agents.ts`)

Create a dedicated file for the default "Via-Gent Coder".
- **Provider**: 'openrouter' (hardcoded ID)
- **Model**: 'mistralai/mistral-7b-instruct:free' (or similar robust free model)
- **Tools**: Enable 'basic-coding' for IDE.

This ensures the user has a *working* agent out of the box without hitting the API immediately if they haven't set keys (though it will fail gracefully).

---

## 3. COMPONENT REFACTORING (L3/L5 Boundary)

### 3.1 `AgentSelector.tsx` (The Consumer)

- **Responsibility**: pure selection.
- **Input**: `useAgentsStore()`.
- **Output**: `setActiveAgent(id)` + `emitStoreEvent(AGENT_SELECTED)`.
- **Display**: Show `agent.name`, `provider.name` (lookup via store), and `model.name`.

**Correction**: Ensure it reads `providerId` from the agent, then queries `useProviderModelsStore` to get the Provider Name properly. Don't store "OpenRouter" string in the agent. Store `providerId: 'openrouter'`.

### 3.2 `AgentConfigDialog.tsx` (The Editor)

- **Responsibility**: Create/Edit Agent Entity.
- **Inputs**:
    - `useProviderModelsStore` (to list available providers/models).
    - `useToolsStore` (to list available tools).
- **Validation**:
    - User selects Provider -> Dropdown updates to show ONLY models for that provider.
    - `modelId` MUST belong to `providerId`.
    - Tools must be compatible (e.g., no vision tools for text-only models).

---

## 4. WORKSPACE BINDING LOGIC

Implement the logic that restricts agents per workspace.

**In `AgentSelector`:**
```typescript
const { currentWorkspace } = useWorkspaceStore(); // or derived from props
const agents = useAgentsStore(s => s.agents);

// Filter: Only show agents bound to this workspace
const availableAgents = agents.filter(a => 
  a.workspaceBindings.some(b => b.workspaceType === currentWorkspace && b.isAvailable)
);
```

This enforces the L3 constraint: "Agents are configured per workspace".

---

## 5. VALIDATION CHECKLIST (AC-02)

- [ ] **Data Structure**: Inspect IndexedDB (Application tab). Are agents stored with `providerId` (string) and `tools` (array)?
- [ ] **Default Agent**: Does "Via-Gent Coder" appear on fresh load?
- [ ] **Linkage**:
    1.  Create new Agent "TestAgent".
    2.  Select Provider: "Anthropic".
    3.  Select Model: "claude-3-sonnet".
    4.  Save.
    5.  Check Store: `providerId` === 'anthropic', `modelId` === 'claude-...'?
- [ ] **Reactivity**: Select "TestAgent" in IDE. Go to Knowledge. Is "TestAgent" selected?

---

## 6. EXECUTION INSTRUCTIONS

1.  **CREATE** `src/lib/defaults/initial-agents.ts`.
2.  **REWRITE** `src/stores/agents-store.ts` with correct types.
3.  **UPDATE** `AgentSelector` to handle the new schema (fetching names via IDs).
4.  **CONNECT** `AgentConfigDialog` (Integration Step).

---

## 7. NEXT STEP

Once Agents are correctly structured (L3), we unify the Chat Interface (L4/L5) to use them.

**Menu:**
1.  **[CU] Proceed to Step 4 (Chat Unification)** - If Agent Vault is secure.
2.  **[RE] Retry Step 3** - If data integrity fails.
