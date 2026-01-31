---
step: 1
id: step-01-init
name: Initialization & Contract Validation
workflow: architectural-consolidation
---

# Step 1: Initialization & Contract Validation

**Objective**: Initialize the Architectural Consolidation (ARC) workflow, validate against the **Comprehensive Architecture Refinement Plan**, and lock in the immutable data contracts.

**Persona**: Wendy (Workflow Architecture Specialist) has validated this plan against BMB Standards.

---

## 1. STRATEGIC ALIGNMENT

We are executing the **Comprehensive Architecture Refinement Plan (2025-12-31)**.
This workflow maps the plan's requirements to specific execution steps.

| Plan Requirement | Workflow Step | Status |
|------------------|---------------|--------|
| **2.1 Layer Architecture** | `step-01-init` (This file) | ✅ DEFINED |
| **3.1 LLM Providers** | `step-02-provider-foundation` | ⏳ PENDING |
| **3.2 Agent Configuration** | `step-03-agent-vault` | ⏳ PENDING |
| **4.1 Unified Chat** | `step-04-chat-unification` | ⏳ PENDING |
| **6. Database & State** | `step-05-store-reorg` | ⏳ PENDING |
| **5. Brownfield Int.** | `step-06-brownfield-integration` | ⏳ PENDING |
| **7. Clean Code** | `step-07-hygiene-sweep` | ⏳ PENDING |

---

## 2. IMMUTABLE DATA CONTRACTS (LOCKED)

The following interfaces are **LOCKED**. Any deviation violations the "Single Source of Truth" principle.

### 2.1 Provider Entity (Layer 2)

```typescript
// src/lib/agent/providers/types.ts
export interface LLMProvider {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'gemini' | 'openai-compatible';
  baseUrl: string; // Read-only for standard providers
  isHardcoded: boolean;
  hasApiKey: boolean;
  isEnabled: boolean;
  capabilities: {
    streaming: boolean;
    functionCalling: boolean;
    vision: boolean;
    embeddings: boolean;
  };
}
```

### 2.2 Agent Entity (Layer 3)

```typescript
// src/stores/agents-store.ts
export interface Agent {
  id: string;
  name: string;
  description: string;
  
  // Linkage
  providerId: string;
  modelId: string;
  
  // Configuration
  systemPrompt: string;
  tools: AgentToolBinding[];
  workspaceBindings: WorkspaceBinding[];
  
  // State
  tasksCompleted: number;
  tokensUsed: number;
  updatedAt: Date;
}

export interface AgentToolBinding {
  toolId: string;
  isEnabled: boolean;
  workspacePermissions: {
    ide: boolean;
    knowledge: boolean;
    study: boolean;
    notes: boolean;
  };
}
```

### 2.3 Store Architecture (State Management)

We adhere to the **3-Tier State Principles**:
1.  **Global Stores**: `useProviderStore`, `useAgentStore`, `useConfigStore`.
2.  **Workspace Stores**: `useIDEStore`, `useKnowledgeStore`.
3.  **Cross-Cutting**: Event Bus (`store-events.ts`) for synchronization.

---

## 3. ANTI-PATTERNS & PRE-FLIGHT CHECKS

### ⛔ Violations to Detect (Hygiene)
-   **God Classes**: Components > 200 lines must be split (e.g. `AgentSelector` was split).
-   **Leaky Logic**: Business logic in UI components (e.g. `ProviderConfigDialog` fetch logic moved to store).
-   **Mock Data**: Usage of `src/mocks/*` is FORBIDDEN.

### ✅ Validation Checklist
- [x] **Plan Ingested**: `comprehensive-architecture-refinement-plan-2025-12-31.md` created.
- [ ] **Wrongdoings Addressed**:
    -   *Refactor Provider Store*: Fixed in Step 02 via strict types.
    -   *Architectural Refactor*: Fixed in Step 03 via strict Agent entity.
- [ ] **Brownfield Plan**: Scheduled for Step 06 (FileTree/Project sync).

---

## 4. EXECUTION INSTRUCTIONS

**IMMEDIATE OPERATION:**
The user has mandated we address the "Rest" and "Wrong Doings".
This requires executing **Step 2 (Provider Foundation)** and **Step 3 (Agent Vault)** immediately to fix the core rot.

**Command Sequence:**
1.  Establish Provider Foundation (Fix L2).
2.  Establish Agent Vault (Fix L3).
3.  Unify Chat (L4).

---

## 5. NEXT STEP MENU

Select the next component to refactor:

1.  **[PF] Provider Foundation (Step 2)** - FIX `provider-models-store` & types.
2.  **[AV] Agent Vault (Step 3)** - FIX `agents-store` & schema.
3.  **[DA] Dismiss** - Pause workflow.
