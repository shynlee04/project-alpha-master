---
date: 2026-01-01
time: 07:00:00
phase: Implementation
workflow: ralph-loop-cycle-4
scope: PRIORITY_1_CONSOLIDATION
governance: EPIC-P0.5
---

# Ralph Loop Cycle 4: Priority 1 Consolidation Plan

## Executive Summary

**Trigger**: Architectural analysis reveals critical gaps in core store architecture
**Priority**: P0 - Foundation Stabilization
**Target**: Consolidate conflicting stores into unified architecture
**Timeline**: 1-2 iterations (complete by end of cycle)

---

## 1. Critical Gap Analysis

### 1.1 Store Duplication Crisis

| Store Type | Primary Location | Duplicate Locations | Impact |
|-------------|------------------|---------------------|--------|
| **Provider Config** | `src/lib/state/provider-store.ts` | `src/stores/provider-config-store.ts`, `src/infrastructure/persistence/stores/providers/` | 🔴 CRITICAL |
| **Agent Config** | `src/stores/agents-store.ts` | `src/stores/agent-config-store.ts` | 🟡 HIGH |
| **Agent Selection** | `src/stores/agents-store.ts` (activeAgentId) | `src/stores/agent-selection-store.ts` | 🟡 HIGH |
| **Conversation** | `src/lib/state/conversation-store.ts` | `src/lib/workspace/conversation-store.ts`, `src/stores/conversation-threads-store.ts` | 🟠 MEDIUM |

### 1.2 Hot-Reload Visibility Bug (BF-01)

**Root Cause**: Event emission inconsistencies across stores
- ✅ Working: `agents-store.ts` emits `AgentConfigChange` events
- ❌ Missing: `provider-store.ts` does NOT emit `ProviderConfigChange` events
- ❌ Missing: UI components don't subscribe to cross-workspace events

**User Impact**:
- User saves API key in AgentConfigDialog
- Change persists to IndexedDB
- Other workspaces don't see the update
- Requires page refresh to see new provider models

### 1.3 Workspace Detection Gaps

**Current Implementation**:
```typescript
// ❌ HARDCODED - breaks when workspaces change
crossWorkspaceEventBus.emitAgentConfigChange({
  workspaceId: 'ide', // TODO: Detect actual workspace
  agentId,
  changeType: 'updated',
});
```

**Required Implementation**:
```typescript
// ✅ DYNAMIC - adapts to current workspace
const currentWorkspace = detectWorkspace();
crossWorkspaceEventBus.emitAgentConfigChange({
  workspaceId: currentWorkspace,
  agentId,
  changeType: 'updated',
});
```

---

## 2. Priority 1 Consolidation Strategy

### 2.1 Provider Store Consolidation

**Objective**: Single source of truth for LLM provider configuration

**Actions**:

1. **Remove Duplicate Stores**:
   - Delete: `src/stores/provider-config-store.ts`
   - Delete: `src/stores/provider-models-store.ts`
   - Delete: `src/infrastructure/persistence/stores/providers/` (incomplete implementation)

2. **Enhance Primary Store** (`src/lib/state/provider-store.ts`):
   ```typescript
   interface ProviderStore {
     // Core configuration
     providers: ProviderConfig[];
     availableModels: Record<string, ModelInfo[]>;

     // ✨ NEW: Event emission for hot-reload
     emitProviderChange: (event: ProviderChangeEvent) => void;

     // ✨ NEW: Credential change callbacks
     onCredentialChange: (providerId: string, apiKey: string) => void;

     // Methods
     fetchModels: (providerId: string) => Promise<void>;
     updateProviderConfig: (providerId: string, config: Partial<ProviderConfig>) => void;
   }
   ```

3. **Integrate Event Emission**:
   - Emit `ProviderConfigChange` on API key save
   - Emit `ProviderConfigChange` on provider update
   - Emit `ModelsUpdated` after model fetch

4. **Update All Import Paths**:
   - Replace all imports from deleted stores
   - Update `AgentConfigDialog.tsx` to use unified store

### 2.2 Agent Selection Store Merge

**Objective**: Single source of truth for agent selection

**Actions**:

1. **Remove Duplicate Store**:
   - Delete: `src/stores/agent-selection-store.ts`

2. **Enhance Primary Store** (`src/stores/agents-store.ts`):
   ```typescript
   interface AgentsStore {
     // Already has activeAgentId - ✅ no change needed

     // ✨ NEW: Selection change event
     emitAgentSelectionChange: (agentId: string) => void;

     // ✨ NEW: Selection history
     selectionHistory: string[];
   }
   ```

3. **Migrate Selection Logic**:
   - Move any unique logic from `agent-selection-store.ts`
   - Update components to use `activeAgentId` from agents-store

### 2.3 Cross-Workspace Event Integration

**Objective**: All stores emit events on state changes

**Actions**:

1. **Provider Store Events**:
   ```typescript
   // In provider-store.ts

   // When API key is saved
   async storeCredentials(providerId: string, apiKey: string) {
     await credentialVault.storeCredentials(providerId, apiKey);

     // ✅ EMIT EVENT
     crossWorkspaceEventBus.emitProviderConfigChange({
       workspaceId: detectWorkspace(),
       providerId,
       changeType: 'credentials_updated',
     });

     // Auto-refresh models
     await this.fetchModels(providerId);
   }

   // When models are fetched
   async fetchModels(providerId: string) {
     const models = await modelRegistry.getModels(providerId);

     set((state) => ({
       availableModels: {
         ...state.availableModels,
         [providerId]: models
       }
     }));

     // ✅ EMIT EVENT
     crossWorkspaceEventBus.emitModelsUpdated({
       workspaceId: detectWorkspace(),
       providerId,
       models,
     });
   }
   ```

2. **Agent Store Events** (already implemented ✅):
   - `AgentConfigChange` emitted on add/update/remove
   - Workspace detection needs enhancement

3. **Workspace Detection Utility**:
   ```typescript
   // src/lib/workspace/workspace-detector.ts

   import { useWorkspaceStore } from '@/lib/state/workspace-store';

   export function detectWorkspace(): WorkspaceId {
     if (typeof window === 'undefined') return 'ide';

     // Check current route/path
     const path = window.location.pathname;

     if (path.includes('/knowledge')) return 'knowledge';
     if (path.includes('/study')) return 'study';
     if (path.includes('/notes')) return 'notes';

     return 'ide';
   }
   ```

---

## 3. Implementation Sequence

### Phase 1: Provider Store Enhancement (1-2 hours)

**Step 1.1**: Add event emission to provider-store.ts
- Import crossWorkspaceEventBus
- Add emit methods to interface
- Implement emit on credential save
- Implement emit on model fetch

**Step 1.2**: Remove duplicate stores
- Delete provider-config-store.ts
- Delete provider-models-store.ts
- Update import paths (3 files)

**Step 1.3**: Test hot-reload
- Open AgentConfigDialog in IDE workspace
- Save API key
- Switch to Knowledge workspace
- Verify models appear without refresh

### Phase 2: Agent Selection Merge (30 minutes)

**Step 2.1**: Remove agent-selection-store.ts
- Delete file
- Update import paths (2 files)

**Step 2.2**: Verify selection persistence
- Test agent selection across workspaces
- Verify activeAgentId persistence

### Phase 3: Workspace Detection (30 minutes)

**Step 3.1**: Create workspace-detector.ts
- Implement detectWorkspace() function
- Export utility

**Step 3.2**: Integrate detector
- Update agent-store.ts to use detector
- Update provider-store.ts to use detector
- Update event emissions

### Phase 4: UI Component Integration (1 hour)

**Step 4.1**: Subscribe to cross-workspace events
- AgentConfigDialog.tsx
- WorkspaceAwareAgentSelector.tsx
- ModelSelector components

**Step 4.2**: Reactive state updates
- Refresh models on ProviderConfigChange event
- Refresh agents on AgentConfigChange event
- Update UI without page reload

---

## 4. Validation Criteria

### 4.1 Functional Requirements

✅ **Hot-Reload Test**:
1. Save API key in AgentConfigDialog
2. Switch workspace
3. See new provider models immediately (no refresh)

✅ **State Consistency**:
1. Select agent in IDE workspace
2. Switch to Knowledge workspace
3. Same agent is selected

✅ **Event Propagation**:
1. Create agent in IDE workspace
2. Switch to Notes workspace
3. New agent appears in agent list

### 4.2 Code Quality Standards

✅ **Component Size Limits**:
- All components < 120 lines
- All functions < 5 parameters
- All modules < 3 functions

✅ **Architecture Compliance**:
- Four-layer architecture respected
- Domain entities in src/domain/
- Infrastructure in src/infrastructure/
- Presentation in src/presentation/

✅ **December 2025 Patterns**:
- Zustand v5.0.8 slice pattern
- Dexie persistence with versioning
- Cross-workspace event bus integration
- Workspace-aware state management

### 4.3 Sweeping Validation Checkpoints

**🔴 LEVEL 1: STATE INTEGRITY**
- ✅ No dual-source state leaks
- ✅ Single source of truth for providers
- ✅ Single source of truth for agents
- ✅ Event emission on all state changes

**🟡 LEVEL 3: NAMING CONSISTENCY**
- ✅ Consistent event naming: ProviderConfigChange, AgentConfigChange, ModelsUpdated
- ✅ Consistent store method naming
- ✅ Consistent prop naming across components

**🔵 LEVEL 5: INTEGRATION REALITY**
- ✅ Workspace detection works across all routes
- ✅ Event bus propagation succeeds
- ✅ IndexedDB persistence works
- ✅ API key validation succeeds

---

## 5. Risk Mitigation

### 5.1 Breaking Changes

**Risk**: Deleting stores may break existing imports

**Mitigation**:
- Use grep to find all import locations
- Update all imports before deletion
- Run TypeScript validation to verify

### 5.2 Data Migration

**Risk**: Users may have data in old stores

**Mitigation**:
- Implement migration script in provider-store.ts
- Migrate localStorage to IndexedDB
- Handle missing keys gracefully

### 5.3 Event Storm

**Risk**: Excessive event emissions may cause performance issues

**Mitigation**:
- Debounce event emissions (100ms)
- Batch related state changes
- Emit only on successful operations

---

## 6. Success Metrics

### Quantitative Metrics

- **Store Count**: Reduce from 8+ to 4 unified stores
- **TypeScript Errors**: Maintain 0 errors
- **Event Coverage**: 100% of stores emit cross-workspace events
- **Hot-Reload Success**: API key changes visible in < 1 second

### Qualitative Metrics

- **Code Maintainability**: Clear single source of truth
- **Developer Experience**: Intuitive state management patterns
- **User Experience**: Seamless workspace switching
- **Architecture Compliance**: Full adherence to 4-layer architecture

---

## 7. Next Steps

After Priority 1 consolidation:

1. **Priority 2**: Thread management unification
2. **Priority 3**: File system cross-workspace integration
3. **Priority 4**: UI component facelift
4. **Validation**: Complete sweeping-validation.md checklist

**Estimated Total Time**: 3-4 hours for Priority 1
**Risk Level**: MEDIUM (requires careful import path management)
**Impact**: HIGH (enables all future enhancements)

---

**Status**: 📝 PLANNED
**Next Action**: Begin Phase 1.1 - Add event emission to provider-store.ts
