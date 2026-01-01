# Via-gent Codebase - Visual Architecture Summary

**Date**: 2026-01-01
**Companion**: `via-gent-codebase-context-analysis-2026-01-01.md`

---

## 1. Current Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                          │
│  (295 components, 49,975 lines across 62 directories)          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   SINGLE BOUNDED STORE                          │
│               use-app-store.ts (236 lines)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  6 SLICES (December 2025 Zustand Pattern)                 │  │
│  │  ├─ createAgentCrudSlice              (CRUD ops)          │  │
│  │  ├─ createAgentWorkspaceBindingsSlice (workspace filter) │  │
│  │  ├─ createAgentValidationSlice         (validation)       │  │
│  │  ├─ createAgentEventsSlice             (events)           │  │
│  │  ├─ createAgentUtilsSlice              (selectors)        │  │
│  │  └─ createProviderSlice                (providers)        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  PERSISTENCE: Dexie.js (IndexedDB)                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ PARTIALIZE (Selective Persistence)                      │   │
│  │ ✓ agents, providers, modelSettings                      │   │
│  │ ✗ validationErrors, availableModels, isLoading          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                 THREE CENTRALIZED SYSTEMS                       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ SYSTEM 1: LLM Provider Key Vault (83% Health)           │   │
│  │ credential-vault.ts → Public API                        │   │
│  │   ├── credential-storage.ts (IndexedDB)                 │   │
│  │   └── credential-encryption.ts (AES-256-GCM)            │   │
│  │                                                          │   │
│  │ UI: ProviderSettings, ProviderConfigDialog,             │   │
│  │     ModelLoadingSpinner, ApiKeyInputSection             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ SYSTEM 2: AI Agents Configuration (42% Health)          │   │
│  │ agents-store.ts → 5 slices (refactored from god store)  │   │
│  │                                                          │   │
│  │ UI: AgentConfigDialog (437 lines, extracted from        │   │
│  │     1,256-line god class), WorkspaceToolPermissions,    │   │
│  │     ToolTrustLevelManager, AgentImportExport            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ SYSTEM 3: Tools Use Permissions (83% Health)            │   │
│  │ tool-permission-manager.ts → Facade                     │   │
│  │   ├── tool-permission-store.ts (Zustand + Dexie)        │   │
│  │   └── Session trust cleared on reload (partialize)      │   │
│  │                                                          │   │
│  │ UI: WorkspacePermissionEditor, ToolPermissionsConfig    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                CROSS-WORKSPACE EVENT BUS                        │
│                  cross-workspace-event-bus.ts                   │
│                                                                  │
│  Event Types:                                                   │
│  • PROVIDER_CONFIG_CHANGED, MODELS_UPDATED                      │
│  • AGENT_CREATED, AGENT_CONFIG_UPDATED, AGENT_DELETED          │
│  • WORKSPACE_TRANSITION_STARTED, WORKSPACE_CHANGED             │
│                                                                  │
│  Integration:                                                   │
│  • Provider events → Agent stores                              │
│  • Agent events → Selection store                              │
│  • Workspace events → All stores                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. User Journey Gaps Visualization

### Provider Configuration Flow

```
CURRENT FLOW (Gaps marked with ❌)
┌──────────────┐
│ Provider     │
│ Settings     │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Provider     │  ❌ P0-2: No clear recovery if fetch fails
│ Config       │  ❌ P1-1: No provider status dashboard
│ Dialog       │  ❌ P1-2: No connection test details
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Enter API    │
│ Key          │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Click Save   │  ❌ P0-2: Model fetch fails = dead end
└──────┬───────┘  ❌ P0-2: No retry mechanism
       │           ❌ P0-2: No "skip model loading" option
       ↓
┌──────────────┐
│ Dialog       │  ❌ P0-4: No success confirmation
│ Closes       │  ❌ P1-1: Can't verify provider health
└──────────────┘


IDEAL FLOW (All gaps resolved)
┌──────────────┐
│ Provider     │  ✅ P1-1: See all providers + health status
│ Health       │
│ Dashboard    │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Provider     │  ✅ P1-2: Test connection with details
│ Config       │     (latency, API version, quota)
│ Dialog       │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Enter API    │  ✅ P1-2: See test results before saving
│ Key + Test   │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Click Save   │  ✅ P0-2: ModelLoadingSpinner with progress
└──────┬───────┘  ✅ P0-2: Retry button with exponential backoff
       │           ✅ P0-2: Option to skip model loading
       ↓
┌──────────────┐
│ Success      │  ✅ P0-4: Success state in dialog
│ Confirmation │  ✅ P0-4: "Create Another" option
└──────┬───────┘  ✅ P0-4: Post-creation checklist
       │
       ↓
┌──────────────┐
│ Verify in    │  ✅ P1-1: Provider status dashboard
│ Dashboard    │
└──────────────┘
```

### Agent Creation Flow

```
CURRENT FLOW (Gaps marked with ❌)
┌──────────────┐
│ Agent        │  ❌ P1-4: No preset templates
│ Config       │  ❌ P1-7: No search/filter agents
│ Dialog       │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Enter Name,  │  ❌ P2-6: No description templates
│ Description  │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Select       │  ❌ P0-2: No loading feedback
│ Provider +   │
│ Model        │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Configure    │  ❌ P0-3: No inline validation errors
│ Tools        │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Click Save   │  ❌ P1-8: No "Test Agent" option
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Agent        │  ❌ P0-4: Small toast only
│ Created      │  ❌ P0-4: No "Create Another" option
│ (hot-reload) │  ❌ P0-4: No post-creation checklist
└──────────────┘


IDEAL FLOW (All gaps resolved)
┌──────────────┐
│ Agent        │  ✅ P1-7: Search/filter existing agents
│ Config       │  ✅ P1-4: Choose preset or start from scratch
│ Dialog       │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Enter Name,  │  ✅ P2-6: Description templates
│ Description  │  ✅ P0-3: Inline validation errors
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Select       │  ✅ P0-2: ModelLoadingSpinner
│ Provider +   │
│ Model        │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Configure    │  ✅ P1-9: Permission presets (Trusted/Caution)
│ Tools        │  ✅ P1-10: Tool impact preview
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Test Agent   │  ✅ P1-8: Preview chat before saving
│ (Optional)   │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Click Save   │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Success      │  ✅ P0-4: Success state in dialog
│ State        │  ✅ P0-4: "Create Another" option
│              │  ✅ P0-4: Post-creation checklist:
│              │     - Configure workspace bindings
│              │     - Set tool permissions
│              │     - Test in current workspace
│              │     - Clone agent for variations (P1-5)
└──────────────┘
```

### Tool Permissions Flow

```
CURRENT FLOW (Gaps marked with ❌)
┌──────────────┐
│ Agent Config │
│ Dialog →     │
│ Workspace    │
│ Tab          │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Permission   │  ❌ P1-9: No presets (Trusted/Caution/Blocked)
│ Grid         │
└──────┬───────┘  ❌ P1-10: No tool impact preview
       │           ❌ P1-11: No audit log
       ↓
┌──────────────┐
│ Toggle Tool  │
│ Permissions  │  ❌ P0-5: Changes not reflected until restart
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Click Save   │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Restart      │  ❌ P0-5: Disruptive workflow
│ Agent        │
└──────────────┘


IDEAL FLOW (All gaps resolved)
┌──────────────┐
│ Agent Config │
│ Dialog →     │
│ Workspace    │
│ Tab          │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Choose       │  ✅ P1-9: Permission presets
│ Preset       │     (Trusted/Caution/Blocked)
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Permission   │  ✅ P1-10: Click tool icon → see impact preview
│ Grid         │  ✅ P1-11: Audit log of all changes
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Toggle Tool  │
│ Permissions  │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Click Save   │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Live Update  │  ✅ P0-5: Permission changes reflected immediately
│ in Active    │     (no restart required)
│ Chat         │
└──────────────┘
```

---

## 3. UI Gap Priority Matrix

```
                    ┌─────────────────────────────────────┐
                    │     IMPACT TO USER EXPERIENCE       │
                    │                                     │
                    │  HIGH    │     MEDIUM    │    LOW   │
┌───────────────────┼──────────┼──────────────┼──────────┤
│                   │          │              │          │
│  H   ┌──────────┐ │ P0-1     │ P2-1         │ P3-1     │
│  I   │ Critical │ │ Provider │ Provider     │ Provider │
│  G   │  (P0)    │ │ Dep      │ Usage        │ Icons    │
│  H   │          │ │ P0-2     │ P2-2         │ P3-2     │
│      │          │ │ Model    │ Provider      │ Rename   │
│      │          │ │ Fetch    │ Tags         │ Valid.   │
│      │          │ │ P0-3     │ P2-3         │ P3-3     │
│      │          │ │ Agent    │ Export/      │ Agent    │
│      │          │ │ Valid.   │ Import       │ Avatar   │
│      │          │ │ P0-4     │              │ P3-4     │
│  F   │          │ │ Agent    │              │ Color    │
│  R   │          │ │ Success  │              │ P3-5     │
│  E   │          │ │ P0-5     │              │ Keys     │
│  Q   │          │ │ Perm     │              │          │
│      │          │ │ Live     │              │          │
│  .   ├──────────┤ │          │              │          │
│      │  High    │ │ P1-1     │ P2-4         │ P3-6     │
│  M   │  (P1)    │ │ Provider │ Agent Ver.   │ Perm     │
│  E   │          │ │ Dashboard│ P2-5         │ Icons    │
│  D   │          │ │ P1-2     │ Agent Tags   │          │
│  I   │          │ │ Conn.    │ P2-6         │          │
│  U   │          │ │ Test     │ Templates    │          │
│  M   │          │ │ P1-3     │ P2-7         │          │
│      │          │ │ Bulk     │ Batch Ops    │          │
│      │          │ │ Provider │ P2-8         │          │
│      │          │ │ P1-4     │ Bulk Perms   │          │
│  L   │          │ │ Agent    │              │          │
│  O   │          │ │ Presets  │              │          │
│  W   │          │ │ P1-5     │              │          │
│      │          │ │ Agent    │              │          │
│      │          │ │ Clone    │              │          │
│      │          │ │ P1-6     │              │          │
│      │          │ │ Usage    │              │          │
│      │          │ │ Analytics│              │          │
│      │          │ │ P1-7     │              │          │
│      │          │ │ Search   │              │          │
│      │          │ │ P1-8     │              │          │
│      │          │ │ Test     │              │          │
│      │          │ │ Drive    │              │          │
│      │          │ │ P1-9     │              │          │
│      │          │ │ Perm     │              │          │
│      │          │ │ Presets  │              │          │
│      │          │ │ P1-10    │              │          │
│      │          │ │ Tool     │              │          │
│      │          │ │ Preview  │              │          │
│      │          │ │ P1-11    │              │          │
│      │          │ │ Audit    │              │          │
│      │          │ │ Log      │              │          │
│      │          │ │ C1-C3    │              │          │
│      │          │ │ Consist. │              │          │
│      │          │ │ Feedback │              │          │
│      │          │ │ C4       │              │          │
│      │          │ │ Sync     │              │          │
│      │          │ │          │              │          │
│  L   ├──────────┤ │          │              │          │
│  O   │  Medium  │ │          │              │          │
│  W   │  (P2)    │ │          │              │          │
│      │          │ │          │              │          │
│      │          │ │          │              │          │
│  .   ├──────────┤ │          │              │          │
│      │  Low     │ │          │              │          │
│  L   │  (P3)    │ │          │              │          │
│  O   │          │ │          │              │          │
│  W   │          │ │          │              │          │
│      │          │ │          │              │          │
│      └──────────┘ │          │              │          │
│                     │          │              │          │
└─────────────────────┴──────────┴──────────────┴──────────┘

TOTAL GAPS BY PRIORITY:
├─ P0 (Critical):    8 gaps  (blocks functionality)
├─ P1 (High):       15 gaps  (significantly degrades UX)
├─ P2 (Medium):     22 gaps  (nice to have)
└─ P3 (Low):        12 gaps  (polish)

TOTAL: 57 gaps across 3 systems
```

---

## 4. Store Consolidation Progress

```
BEFORE (December 2025)
┌─────────────────────────────────────────────────────────────┐
│ SCATTERED STORES (50+ files)                                │
│                                                              │
│ src/stores/                              (6 stores)          │
│  ├─ agents-store.ts (430 lines, 3.6x standard)              │
│  ├─ conversation-threads-store.ts (726 lines)               │
│  └─ [4 more stores]                                         │
│                                                              │
│ src/lib/state/                            (25 stores)        │
│  ├─ provider-store.ts (duplicate)                             │
│  ├─ rag-store.ts (1,595 lines duplicated)                    │
│  └─ [23 more stores]                                        │
│                                                              │
│ src/infrastructure/persistence/stores/    (38+ stores)       │
│  └─ [new location]                                             │
│                                                              │
│ PROBLEMS:                                                    │
│ • 17 duplicate stores (30% duplication)                      │
│ • 6,500 lines of redundant code                             │
│ • Circular dependency: agents-store ↔ provider-store        │
│ • No single source of truth                                  │
└─────────────────────────────────────────────────────────────┘


AFTER (January 2026 - Target)
┌─────────────────────────────────────────────────────────────┐
│ SINGLE BOUNDED STORE                                         │
│                                                              │
│ src/infrastructure/persistence/stores/                        │
│  ├─ use-app-store.ts (236 lines)                            │
│  │   └─ 6 SLICES:                                           │
│  │       ├─ createAgentCrudSlice                            │
│  │       ├─ createAgentWorkspaceBindingsSlice               │
│  │       ├─ createAgentValidationSlice                      │
│  │       ├─ createAgentEventsSlice                          │
│  │       ├─ createAgentUtilsSlice                           │
│  │       └─ createProviderSlice                             │
│  │                                                            │
│  ├─ agents/ (5 slices)                                       │
│  ├─ providers/ (1 slice)                                     │
│  └─ [domain stores: rag, knowledge, quiz, etc.]              │
│                                                              │
│ IMPROVEMENTS:                                                │
│ ✓ Zero circular dependencies                                 │
│ ✓ 680 lines removed (3 duplicate stores → 1)                │
│ ✓ Single source of truth                                     │
│ ✓ Dexie persistence with selective partialize                │
│ ✓ Event-driven cross-store communication                     │
└─────────────────────────────────────────────────────────────┘


IN PROGRESS (Epic AC-1)
┌─────────────────────────────────────────────────────────────┐
│ MIGRATION PHASE                                              │
│                                                              │
│ Phase 1: ✓ Create single bounded store                      │
│ Phase 2: ✓ Create agent slices (5)                          │
│ Phase 3: ✓ Create provider slice (1)                        │
│ Phase 4: ⏳ Delete duplicate stores                         │
│ Phase 5: ⏳ Migrate all consumers to useAppStore            │
│ Phase 6: ⏳ Delete deprecated store files                    │
│                                                              │
│ REMAINING:                                                   │
│ • 17 duplicate stores to delete                              │
│ • 25+ files to migrate to useAppStore                       │
│ • Deprecated files to remove                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Integration Points Map

```
┌──────────────────────────────────────────────────────────────┐
│                     AGENT STORE                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ AGENTS (Array<Agent>)                                │    │
│  │ • id, name, description                              │    │
│  │ • providerId ────────┐                              │    │
│  │ • modelId             │                              │    │
│  │ • tools, workspaceBindings                         │    │
│  └──────────────────────┼──────────────────────────────┘    │
│                         │                                    │
│                         │ references                         │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          ↓
┌──────────────────────────────────────────────────────────────┐
│                   PROVIDER STORE                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ PROVIDERS (Array<Provider>)                          │    │
│  │ • id, name, baseURL ←────────────────────────┐       │    │
│  │ • defaultModel                               │       │    │
│  │ • enabled, isCustom                          │       │    │
│  └──────────────────────────────────────────────┼───────┘    │
│                                                  │           │
│  ┌───────────────────────────────────────────────┼───────┐  │
│  │ AVAILABLE_MODELS (Record<ProviderId, Model[]>)│       │  │
│  │ • openai: [{ id, name, isFree }]             │       │  │
│  │ • anthropic: [...]                            │       │  │
│  │ • gemini: [...]                               │       │  │
│  └───────────────────────────────────────────────┼───────┘  │
│                                                  │           │
│                                                  │ fetched  │
│                                                  │ via      │
└──────────────────────────────────────────────────┼───────────┘
                                                   │
                                                   ↓
┌──────────────────────────────────────────────────────────────┐
│                   CREDENTIAL VAULT                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ENCRYPTED STORAGE (localStorage + IndexedDB)        │    │
│  │ • vg_ek_v3 (encrypted key)                         │    │
│  │ • vg_salt_v3 (salt)                                │    │
│  │ • vg_kv_v3 (key version)                           │    │
│  │ • vg_vp_v3 (vault password)                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  AES-256-GCM Encryption                                      │
│  PBKDF2 Key Derivation (100,000 iterations)                 │
└──────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────┐
│                   AGENT ↔ PROVIDER EVENTS                    │
└──────────────────────────────────────────────────────────────┘

Provider Configuration Change:
  ProviderConfigDialog.saveProvider()
    ↓
  credentialVault.storeCredentials(providerId, apiKey)
    ↓
  providerSlice.fetchModels(providerId)
    ↓
  emit('MODELS_UPDATED', { providerId, models })
    ↓
  agentSlice.validateAgentsForProvider(providerId, models)
    ↓
  Agent store re-validates all agents using this provider

Provider Deletion:
  ProviderSettings.removeProvider(providerId, agents)
    ↓
  Check for dependent agents
    ↓
  ❌ NO UI WARNING (Gap P0-1: Provider dependency warning)
    ↓
  if (dependents.length > 0) {
    // Should show modal but doesn't
    blockDeletion();
  }
    ↓
  providerSlice.removeProvider(providerId)
    ↓
  emit('PROVIDER_REMOVED', { providerId })
    ↓
  Agent store handles orphaned agents


┌──────────────────────────────────────────────────────────────┐
│                  AGENT ↔ TOOLS EVENTS                         │
└──────────────────────────────────────────────────────────────┘

Permission Change:
  WorkspaceToolPermissionsConfig.togglePermission(toolId, workspace)
    ↓
  agentSlice.updateToolPermission(agentId, toolId, workspace, enabled)
    ↓
  ❌ NO EVENT EMITTED (Gap P0-5: Permission changes not live)
    ↓
  Agent NOT updated in active chat until restart

Tool Execution:
  useAgentChatWithTools.executeTool(toolId)
    ↓
  ToolPermissionManager.checkPermission(agentId, toolId, workspace)
    ↓
  if (permitted) {
    executeTool();
  } else {
    showPermissionDenied();
  }
```

---

## 6. Metrics Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│                    CODE QUALITY METRICS                       │
├──────────────────────────────────────────────────────────────┤
│  Metric                    │ Current  │ Target   │ Status   │
├────────────────────────────┼──────────┼──────────┼──────────┤
│  God Components (>300)     │    16    │    0     │ ⚠️ In    │
│                            │          │          │   Progress│
│  Circular Dependencies     │    0     │    0     │ ✅ Done  │
│  Duplicate Stores          │   17     │    0     │ ⚠️ In    │
│                            │          │          │   Progress│
│  Test Coverage             │ Unknown  │   80%    │ ⏳ To    │
│                            │          │          │   Measure│
│  TypeScript Errors         │  1253    │    0     │ ⚠️ In    │
│                            │          │          │   Progress│
│  Lines Removed (Refactor)  │   680    │   2000+  │ ⚠️ In    │
│                            │          │          │   Progress│
└──────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────┐
│                     UX METRICS                                │
├──────────────────────────────────────────────────────────────┤
│  Metric                    │ Current  │ Target   │ Status   │
├────────────────────────────┼──────────┼──────────┼──────────┤
│  P0 Gaps Resolved          │   0/8    │   8/8    │ ⏳ Sprint │
│                            │          │          │    1     │
│  P1 Gaps Resolved          │  0/15    │  15/15   │ ⏳ Sprint │
│                            │          │          │    2     │
│  Mobile Responsive         │   20%    │  100%    │ ⏳ Sprint │
│                            │          │          │    3     │
│  Accessibility Score       │ Unknown  │ WCAG AA  │ ⏳ To    │
│                            │          │          │   Audit  │
│  Consistent Feedback       │   40%    │  100%    │ ⏳ Sprint │
│  Patterns                  │          │          │    2     │
└──────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────┐
│                 USER JOURNEY METRICS                          │
├──────────────────────────────────────────────────────────────┤
│  Journey                    │ Complete │ Target  │ Status   │
├────────────────────────────┼──────────┼─────────┼──────────┤
│  Provider Configuration    │   60%    │  100%   │ ⏳ 3 gaps │
│  Agent Creation            │   50%    │  100%   │ ⏳ 5 gaps │
│  Tool Permissions          │   70%    │  100%   │ ⏳ 2 gaps │
└──────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────┐
│                SYSTEM HEALTH SCORES                           │
├──────────────────────────────────────────────────────────────┤
│  System                     │ Health   │ Gaps    │ Status   │
├────────────────────────────┼──────────┼─────────┼──────────┤
│  1. LLM Provider Vault      │   83%    │   8     │ ✅ Good  │
│     (System 1)              │          │         │          │
│  2. AI Agents Configuration  │   42%    │  15     │ ❌ Poor  │
│     (System 2)              │          │         │          │
│  3. Tools Use Permissions   │   83%    │   5     │ ✅ Good  │
│     (System 3)              │          │         │          │
├────────────────────────────┼──────────┼─────────┼──────────┤
│  OVERALL HEALTH             │   69%    │  57     │ ⚠️ Fair  │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Sprint Roadmap

```
SPRINT 1 (2 weeks) - P0 Critical Gaps
┌─────────────────────────────────────────────────────────────┐
│ Focus: Blocking functionality gaps                           │
│                                                              │
│ Stories:                                                     │
│ • P0-1.1: Provider dependency warning dialog                 │
│ • P0-1.2: Model fetch failure recovery UI                    │
│ • P0-2.1: Agent validation inline errors                    │
│ • P0-2.2: Agent creation success flow                       │
│ • P0-3.1: Live permission updates                           │
│                                                              │
│ Deliverables:                                                │
│ • 5 new/revised UI components                                │
│ • Updated user flows with clear feedback                     │
│ • Improved error handling and recovery                       │
└─────────────────────────────────────────────────────────────┘


SPRINT 2 (2 weeks) - High-Impact P1 Gaps
┌─────────────────────────────────────────────────────────────┐
│ Focus: Significantly degrades UX gaps                        │
│                                                              │
│ Provider System (3 gaps):                                   │
│ • P1-1: Provider status dashboard                           │
│ • P1-2: Connection test details                             │
│ • P1-3: Bulk provider operations                            │
│                                                              │
│ Agent System (5 gaps):                                      │
│ • P1-4: Agent presets                                      │
│ • P1-5: Agent clone                                        │
│ • P1-6: Usage analytics                                    │
│ • P1-7: Search/filter                                      │
│ • P1-8: Test drive                                         │
│                                                              │
│ Permissions System (3 gaps):                               │
│ • P1-9: Permission presets                                 │
│ • P1-10: Tool impact preview                               │
│ • P1-11: Audit log                                         │
│                                                              │
│ Cross-System (4 gaps):                                      │
│ • C1-C3: Consistent feedback patterns                       │
│ • C4: Cross-workspace settings sync                         │
│                                                              │
│ Deliverables:                                                │
│ • Provider dashboard component                              │
│ • Agent presets system                                      │
│ • Permission presets                                        │
│ • Unified feedback components                               │
└─────────────────────────────────────────────────────────────┘


SPRINT 3 (2 weeks) - Remaining P1 + Mobile + Accessibility
┌─────────────────────────────────────────────────────────────┐
│ Focus: UX polish + mobile optimization                      │
│                                                              │
│ Store Consolidation:                                        │
│ • Epic AC-1.2: Delete duplicate stores                      │
│ • Epic AC-1.3: Migrate consumers to useAppStore             │
│ • Epic AC-1.4: Delete deprecated files                      │
│                                                              │
│ Mobile Optimization:                                        │
│ • M1: Responsive dialogs (640px breakpoint)                │
│ • M2: Responsive permission grid                           │
│                                                              │
│ Accessibility:                                              │
│ • A1: Screen reader announcements                          │
│ • A2: Keyboard navigation                                  │
│ • A3: Color contrast fixes                                 │
│                                                              │
│ Deliverables:                                                │
│ • Zero duplicate stores                                     │
│ • 100% mobile responsive                                    │
│ • WCAG AA accessibility                                    │
└─────────────────────────────────────────────────────────────┘


SPRINT 4+ (Ongoing) - P3 Polish + Advanced Features
┌─────────────────────────────────────────────────────────────┐
│ Focus: Nice-to-have + polish                                │
│                                                              │
│ P2 Gaps (22):                                               │
│ • Provider usage statistics                                 │
│ • Provider tags/categories                                  │
│ • Provider config export/import                             │
│ • Agent version history                                     │
│ • Agent tags/categories                                     │
│ • Agent description templates                               │
│ • Batch agent operations                                   │
│ • Bulk permission updates                                   │
│ • Unified settings dashboard                               │
│                                                              │
│ P3 Gaps (12):                                               │
│ • Provider icons/logos                                      │
│ • Provider rename validation                                │
│ • Agent avatars                                             │
│ • Agent color coding                                        │
│ • Agent keyboard shortcuts                                  │
│ • Permission icons                                          │
│ • Visual polish, animations, micro-interactions            │
│                                                              │
│ Deliverables:                                                │
│ • Advanced analytics dashboards                             │
│ • Export/import functionality                              │
│ • Visual polish and animations                             │
│ • Keyboard shortcuts                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Quick Reference: Critical Files

```
SINGLE BOUNDED STORE:
├─ src/infrastructure/persistence/stores/use-app-store.ts (236 lines)
├─ src/infrastructure/persistence/stores/agents/slices/ (5 slices)
└─ src/infrastructure/persistence/stores/providers/provider-slice.ts


THREE CENTRALIZED SYSTEMS:
├─ System 1: src/lib/agent/providers/credential-vault.ts
├─ System 2: src/infrastructure/persistence/stores/agents/
└─ System 3: src/lib/agent/tool-permission-manager.ts


CROSS-WORKSPACE EVENTS:
└─ src/infrastructure/events/cross-workspace-event-bus.ts


AGENT CONFIGURATION UI:
├─ src/presentation/components/agent/AgentConfigDialog.tsx (437 lines)
├─ src/presentation/components/agent/AgentBasicConfig.tsx
├─ src/presentation/components/agent/ApiKeyInputSection.tsx
├─ src/presentation/components/agent/WorkspaceToolPermissionsConfig.tsx
└─ src/presentation/components/agent/ToolTrustLevelManager.tsx


PROVIDER CONFIGURATION UI:
├─ src/presentation/components/agent/ProviderSettings.tsx
├─ src/presentation/components/agent/ProviderConfigDialog.tsx
└─ src/presentation/components/ui/ModelLoadingSpinner.tsx


UI PRIMITIVES:
└─ src/presentation/components/ui/ (50+ components)


DEPRECATED STORES (TO DELETE):
├─ src/stores/agents-store.ts (430 lines, god store)
├─ src/stores/provider-store.ts
├─ src/stores/conversation-threads-store.ts
└─ [17 duplicate stores across 3 locations]


ANALYSIS DOCUMENTS:
├─ _bmad-output/via-gent-codebase-context-analysis-2026-01-01.md
├─ _bmad-output/ralph-loop-cycle-13-ui-component-gaps-2026-01-01.md (791 lines)
├─ _bmad-output/ralph-loop-cycle-12-iteration-17-completion-2026-01-01.md
└─ _bmad-output/complete-system-architecture-analysis-2026-01-01.md
```

---

**End of Visual Summary**

**Companion Document**: `via-gent-codebase-context-analysis-2026-01-01.md`
