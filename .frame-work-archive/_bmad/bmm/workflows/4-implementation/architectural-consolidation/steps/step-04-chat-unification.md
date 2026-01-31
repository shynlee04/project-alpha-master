---
step: 4
id: step-04-chat-unification
name: Chat Panel Unification
workflow: architectural-consolidation
---

# Step 4: Chat Panel Unification & Services (Layer 4 & 5)

**Objective**: Unify the Chat Interface across all 4 workspaces (IDE, Knowledge, Study, Notes) using a shared `ChatPanel` component that leverages the L3 Agent Vault and L4 Cross-Workspace Services. This addresses AC-03.

---

## 1. ARCHITECTURAL ANALYSIS & CORRECTION of "Chat Fragmentation"

**Current State**:
- **IDE**: Uses `ChatPanel` with terminal/file capabilities.
- **Knowledge**: Uses `ResizablePanel` but often lacks a full chat interface or uses a different one.
- **Study/Notes**: Often have no chat or a placeholder.

**Corrective Action**:
We will implement the **Unified Chat Strategy**:
1.  **Core Component**: `src/components/chat/UnifiedChatPanel.tsx` (New).
2.  **Service Layer**: `src/lib/services/chat-service.ts` (Handles L4 logic: Message flows, Context injection).
3.  **Injector**: Place `UnifiedChatPanel` into the layouts of all 4 workspaces.

---

## 2. SERVICE LAYER IMPLEMENTATION (Layer 4)

### 2.1 `ChatService` (The Brain)
We need a service that acts as the conductor between the UI and the Agent/Provider.

```typescript
// src/lib/services/chat-service.ts

export class ChatService {
  /**
   * Sending a message involves:
   * 1. Creating the Message Entity (pending state).
   * 2. Retrieving the Active Agent (Layer 3).
   * 3. Retrieving the Provider Adapter (Layer 2).
   * 4. Injecting Context (Layer 4 Context Manager).
   * 5. Streaming the response.
   */
  async sendMessage(userId: string, content: string, workspaceType: WorkspaceType) {
    const agent = useAgentsStore.getState().getActiveAgent();
    const providerConfig = useProviderModelsStore.getState().getProviderConfig(agent.providerId);
    
    // Inject Workspace-Specific Context
    const context = await this.contextManager.gatherContext(workspaceType);
    
    // Delegate to Provider Adapter
    const stream = await ProviderAdapterFactory.get(agent.providerId)
      .streamChat(modelId, messages, context);
      
    return stream;
  }
}
```

### 2.2 `ConversationStore` (Layer 4 Persistence)
Ensure `useConversationStore` (if existing) or create it to persist messages with `conversationId`, `agentId`, and `workspaceType`. Messages must persist to Dexie.

---

## 3. UI/UX PRESENTATION (Layer 5)

### 3.1 `UnifiedChatPanel` Component

**Props Interface**:
```typescript
interface UnifiedChatPanelProps {
  workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
  panelId: string; // for layout persistence
  className?: string;
}
```

**Internal Composition**:
-   **Header**: `AgentSelector` (Compact variant if space < 300px).
-   **Body**: `MessageList` (Virtualized).
-   **Footer**: `ChatInput` (Auto-expanding).

**Behavior**:
-   On checking `workspaceType`, it adjusts capabilities (e.g., in IDE, allow "Add File" button. In Notes, allow "Cite Note" button).
-   It *subscribes* to `conversation-store` events to auto-scroll on new messages.

### 3.2 Workspace Injection

**IDE**: `src/app/routes/ide.tsx`
-   Replace existing `ChatPanel` with `UnifiedChatPanel workspaceType="ide"`.

**Knowledge**: `src/app/routes/knowledge.tsx`
-   Insert into the Left Sidebar (or Right). Use `UnifiedChatPanel workspaceType="knowledge"`.

**Study**: `src/app/routes/study/index.tsx`
-   Add as a collapsible drawer (Sheet).

**Notes**: `src/app/routes/notes.tsx`
-   Add to sidebar or floating action button.

---

## 4. VALIDATION CHECKLIST (AC-03)

- [ ] **IDE Chat**: Still writes code? Terminal access works?
- [ ] **Knowledge Chat**: Can "chat with library"? (Even if mock response for now, UI should be there).
- [ ] **Persistence**:
    1.  Type "Hello IDE" in IDE.
    2.  Switch to Knowledge.
    3.  Type "Hello Knowledge".
    4.  Switch back to IDE.
    5.  **Verify**: "Hello IDE" history is preserved in IDE context? "Hello Knowledge" preserved in Knowledge context? (Or unified if design calls for single stream - *Design says: Conversation per Workspace usually, or Global. Reference Sprint Proposal: Cascade Flow*).
    - *Correction*: Sprint Proposal implies distinct conversations. Verify separation.
- [ ] **Agent Sync**: Change Agent in IDE -> Switch to Knowledge -> Is same Agent active? (Yes, per AC-02).

---

## 5. EXECUTION INSTRUCTIONS

1.  **CREATE** `src/lib/services/chat-service.ts`.
2.  **CREATE** `src/components/chat/UnifiedChatPanel.tsx`.
3.  **INTEGRATE** into `ide.tsx`, `knowledge.tsx`, `study.tsx`, `notes.tsx`.

---

## 6. NEXT STEP

Phase 0 (Showcase Critical) is complete upon success here.
Proceed to Phase 1 (Foundation) for rigorous store cleanup and event bus hardening.

**Menu:**
1.  **[SR] Proceed to Step 5 (Store Reorganization/AC-04)** - Phase 1 Start.
2.  **[RE] Retry Step 4** - If UI unification fails.
