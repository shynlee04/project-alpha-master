# Phase 2+ Staging Archive Strategy

> **Document ID**: PHASE2-STAGING-PLAN-2026-01-29
> **Version**: 1.0.0
> **Created**: 2026-01-29 05:05:34
> **Status**: READY FOR REVIEW
> **Purpose**: Safe archival strategy for Phase 2+ (AI/Agent) code

---

## Executive Summary

**Total Phase 2+ Code**: ~70,000+ lines across 300+ files
**Total Codebase**: ~306,000 lines
**Percentage**: ~23% of codebase is Phase 2+ (AI-related)

**Decision Required**: This is significant code to stage. Recommend a **phased approach**:
1. Phase 2A: Stage non-critical AI features (multimodal, workflow, advanced agents)
2. Phase 2B: Stage core AI infrastructure (optional, higher risk)

---

## Table of Contents

1. [Complete File Inventory](#1-complete-file-inventory)
2. [Import Dependency Analysis](#2-import-dependency-analysis)
3. [Stub Requirements](#3-stub-requirements)
4. [Archive Structure](#4-archive-structure)
5. [Restoration Procedure](#5-restoration-procedure)
6. [Effort Estimation](#6-effort-estimation)
7. [Risk Assessment](#7-risk-assessment)
8. [Recommendations](#8-recommendations)

---

## 1. Complete File Inventory

### 1.1 Phase 2+ Directory Summary

| Directory | Files | Lines | Priority | Description |
|-----------|-------|-------|----------|-------------|
| `src/presentation/components/chat/` | 47 | 10,934 | P2A | Chat UI components |
| `src/presentation/components/agent/` | 85 | 11,929 | P2A | Agent config UI |
| `src/lib/agent/` | 95+ | 24,946 | P2B | Core AI infrastructure |
| `src/domain/tools/` | 16 | 1,277 | P2B | AI tool definitions |
| `src/infrastructure/tools/` | 6 | 523 | P2B | Tool registry/catalog |
| `src/infrastructure/persistence/stores/agents/` | 14 | 1,486 | P2B | Agent store slices |
| `src/infrastructure/persistence/stores/providers/` | 17 | 3,089 | P2B | Provider store slices |
| `src/infrastructure/persistence/stores/conversation/` | 31 | 3,241 | P2B | Conversation store |
| `src/plugins/chat/` | 3 | 341 | P2A | Chat plugin registration |
| `src/presentation/components/rag/` | 8 | 1,198 | P2A | RAG panel components |
| `src/lib/workflow/` | 20 | 5,938 | P2A | Workflow builder/executor |
| `src/lib/chat/` | 3 | 514 | P2A | Chat utilities |
| `src/lib/notes/*ai*` | 10 | 2,712 | P2A | AI note services |
| `src/presentation/components/notes/*AI*` | 9 | 4,141 | P2A | AI note components |
| `src/presentation/components/ide/*Agent*/*Chat*` | 12 | 3,288 | P2A | IDE AI panels |
| `src/application/services/` | 3 | 2,163 | P2B | Provider/Agent services |
| `src/domain/services/*agent*` | 2 | 314 | P2B | Agent domain services |
| `src/domain/entities/agent.ts` | 1 | ~250 | P2B | Agent entity |
| `src/routes/agents.tsx` | 1 | 49 | P2A | Agents route |
| `src/hooks/useAgents.ts` | 1 | 115 | P2A | Agents hook |

**TOTAL ESTIMATED**: ~70,000+ lines

### 1.2 Detailed File Lists

#### Chat Components (47 files, 10,934 lines)

```
src/presentation/components/chat/
├── workflow/
│   ├── WorkflowCanvas.tsx
│   ├── WorkflowToolbar.tsx
│   ├── WorkflowPalette.tsx
│   ├── WorkflowStepEditor.tsx
│   ├── WorkflowTemplates.tsx
│   ├── useWorkflowDragDrop.ts
│   └── index.ts
├── NoteReference.tsx
├── CodeBlock.tsx
├── DiffPreview.tsx
├── WorkflowBuilder.tsx
├── ImagePreviewDialog.tsx
├── WorkflowVisualizer.tsx
├── ToolCallBadge.tsx
├── AutoApproveSettings.tsx
├── ToolExecutionIndicator.tsx
├── DebateTimeline.tsx
├── TimeoutWarning.tsx
├── UnifiedChatPanel.tsx
├── FileAttachmentInput.tsx
├── ChatBubbleOverlay.tsx
├── ChatHistory.tsx
├── ChatBubble.tsx
├── ChatExportControls.tsx
├── URLInputDialog.tsx
├── RoutingDecision.tsx
├── MessageSearch.tsx
├── ExpandableChatPanel.tsx
├── NoteReferencePicker.tsx
├── ArtifactPreviewModal.tsx
├── ApprovalOverlay.tsx
├── MultiAgentChatPanel.tsx
├── SequentialExpansionOptions.tsx
├── ChatInputControls.tsx
├── StreamdownRenderer.tsx
├── ToolProgressIndicator.tsx
├── BatchApprovalBar.tsx
├── ConversationCard.tsx
├── ThreadManager.tsx
├── CollapsibleSection.tsx
├── SuggestionChips.tsx
├── WorkflowBuilder.refactored.tsx
└── index.ts
```

#### Agent Components (85 files, 11,929 lines)

```
src/presentation/components/agent/
├── AgentConfigForm/
│   ├── ApiKeyStatus.tsx
│   ├── BaseUrlInput.tsx
│   ├── CustomHeadersEditor.tsx
│   ├── OpenAICompatibleSettings.tsx
│   ├── ApiKeyInput.tsx
│   ├── AgentValidation.tsx
│   ├── NativeToolsToggle.tsx
│   ├── CustomModelIdInput.tsx
│   ├── AgentConfigActions.tsx
│   ├── AgentModelSelector.tsx
│   ├── AgentApiKeySection.tsx
│   ├── AgentBasicInfoTab.tsx
│   ├── AgentProviderSelector.tsx
│   ├── ConnectionTestButton.tsx
│   ├── AgentAdvancedSettingsTab.tsx
│   └── index.ts
├── WorkspacePermissions/
│   ├── PermissionBadge.tsx
│   ├── YOLOModeToggle.tsx
│   ├── FilePermissionRow.tsx
│   ├── PermissionLegend.tsx
│   ├── ToolPermissionRow.tsx
│   ├── PermissionGridHeader.tsx
│   ├── CategoryApprovalGrid.tsx
│   ├── PermissionSwitch.tsx
│   ├── hooks/
│   │   ├── useWorkspacePermissions.ts
│   │   └── index.ts
│   ├── types.ts
│   └── index.ts
├── ToolTrustLevels/
│   ├── ToolTrustRow.tsx
│   ├── TrustLevelLegend.tsx
│   ├── hooks/
│   │   ├── useToolTrustLevels.ts
│   │   └── index.ts
│   └── index.ts
├── hooks/
│   ├── useAgentFormState.ts
│   ├── useAgentFormSubmission.ts
│   ├── useAgentFieldUpdate.ts
│   ├── useAgentFormValidation.ts
│   ├── useAgentFormActions.ts
│   ├── useUnsavedChangesWarning.ts
│   └── index.ts
├── MigrationStatus.tsx
├── DeepThinkUI.tsx
├── ToolTrustLevelManager.tsx
├── AgentValidationErrors.tsx
├── ProviderStatusBadge.tsx
├── WorkspacePermissionManager.tsx
├── AgentConfigTabContents.tsx
├── AgentManager.tsx
├── WorkspacePermissionEditor.tsx
├── ProviderDeletionWarningDialog.tsx
├── ProviderConfigDialog.tsx
├── ModelFetchProgress.tsx
├── MemorySearch.tsx
├── ProviderSettings.tsx
├── ToolAvailabilityIndicator.tsx
├── UnifiedAgentSelector.tsx
├── ApiKeyInputSection.tsx
├── VaultStatusCard.tsx
├── ConversationCard.tsx
├── PreferenceSettings.tsx
├── AgentConfigDialog.tsx
├── AgentConfigDialogHeader.tsx
├── WorkspaceToolPermissionsConfig.tsx
├── AgentWorkspaceSwitchingFeedback.tsx
├── AgentWorkspaceBindingConfig.tsx
├── ToolPermissionsConfig.tsx
├── AgentCreationSuccess.tsx
├── AgentImportExport.tsx
├── AgentConfigDialogFooter.tsx
├── useAgentConfigForm.ts
├── useAgentConfigProvider.ts
├── agent-config-types.ts
├── agent-config-dialog-utils.ts
├── memory-index.ts
├── agent-config-validation.ts
├── agent-config-dialog-types.ts
└── index.ts
```

#### Core AI Library (95+ files, 24,946 lines)

```
src/lib/agent/
├── hooks/
│   ├── use-agent-chat-with-tools.ts (CRITICAL)
│   ├── use-multi-agent-chat.ts
│   ├── use-provider-api-key.ts
│   ├── use-voice-output.ts
│   ├── use-voice-input.ts
│   ├── use-prompt-enhancer.ts
│   └── index.ts
├── providers/
│   ├── provider-adapter.ts
│   ├── gemini-adapter.ts
│   ├── mistral-adapter.ts
│   ├── groq-adapter.ts
│   ├── credential-vault.ts (CRITICAL - Used by AppInitializer)
│   ├── credential-encryption.ts
│   ├── credential-storage.ts
│   ├── model-registry.ts
│   ├── hardcoded-models.ts
│   ├── agent-validation-service.ts
│   ├── types.ts
│   └── index.ts
├── facades/
│   ├── note-tools-impl.ts
│   ├── note-tools.ts
│   ├── file-tools-impl.ts
│   ├── file-tools.ts
│   ├── terminal-tools-impl.ts
│   ├── terminal-tools.ts
│   ├── knowledge-tools.ts
│   ├── knowledge-tools-impl.ts
│   ├── command-sanitizer.ts
│   ├── file-lock.ts
│   └── index.ts
├── tools/
│   ├── note-commands.ts
│   ├── process-image-tool.ts
│   ├── tool-execution-logger.ts
│   ├── voice-output-tool.ts
│   ├── search-notes-tool.ts
│   ├── tool-parser.ts
│   ├── retry-queue.ts
│   ├── read-file-tool.ts
│   ├── tool-error.ts
│   ├── streaming.ts
│   ├── execute-command-tool.ts
│   ├── permission-check.ts
│   ├── list-files-tool.ts
│   └── index.ts
├── memory/
│   ├── insight-extractor.ts
│   ├── memory-index.ts
│   ├── conversation-memory.ts
│   └── index.ts
├── multimodal/
│   └── message-builder.ts
├── deep-think/
│   ├── deep-think-prompts.ts
│   ├── deep-think-parsers.ts
│   ├── deep-think-types.ts
│   └── deep-think-hook.ts
├── tool-permission/
│   ├── tool-permission-manager.ts
│   ├── tool-permission-trust.ts
│   ├── tool-permission-queries.ts
│   ├── tool-permission-singleton.ts
│   ├── constants.ts
│   ├── types.ts
│   ├── helpers.ts
│   └── index.ts
├── suggestions/
│   ├── suggestion-tracker.ts
│   ├── suggestion-engine.ts
│   └── index.ts
├── factory.ts
├── prompt-orchestrator.ts
├── prompt-composer.ts
├── prompt-composer-types.ts
├── prompt-composer-config.ts
├── system-prompt.ts
├── mode-classifier.ts
├── mode-classifier-types.ts
├── workspace-tool-filter.ts
├── workspace-permission-manager.ts
├── workspace-execution-context.ts
└── agent-io.ts
```

---

## 2. Import Dependency Analysis

### 2.1 Critical Dependencies (Phase 1A imports Phase 2+)

| Phase 1A File | Imports From | Stub Required |
|---------------|--------------|---------------|
| `src/presentation/components/common/AppInitializer.tsx` | `@/lib/agent/providers/credential-vault` | YES (CRITICAL) |
| `src/presentation/components/common/AppInitializer.tsx` | `@/plugins/chat` | YES (Plugin registration) |
| `src/presentation/components/sidebar/PluginSidebar.tsx` | `@/plugins/chat` | YES |
| `src/infrastructure/persistence/stores/index.ts` | `@/infrastructure/persistence/stores/agents` | YES (Export) |
| `src/infrastructure/persistence/stores/index.ts` | `@/infrastructure/persistence/stores/providers` | YES (Export) |
| `src/infrastructure/persistence/stores/index.ts` | `@/infrastructure/persistence/stores/conversation` | YES (Export) |
| `src/lib/notes/note-ai-service.ts` | `@/application/services/ProviderService` | YES |
| `src/lib/notes/note-ai-service.ts` | Agent selection stores | YES |
| `src/presentation/components/notes/*AI*.tsx` | `@/lib/notes/*ai*` | YES (6+ files) |

### 2.2 Internal Phase 2+ Dependencies (Move Together)

These files only import from other Phase 2+ code - safe to move together:

- All `src/lib/agent/**` files (self-contained)
- All `src/presentation/components/chat/**` files
- All `src/presentation/components/agent/**` files
- All `src/lib/workflow/**` files
- All `src/plugins/chat/**` files
- All `src/infrastructure/persistence/stores/conversation/**` files

### 2.3 Shared Infrastructure (COMPLEX)

These Phase 2+ files are heavily integrated with Phase 1A:

| File | Used By | Complexity |
|------|---------|------------|
| `stores/agents/types.ts` | 20+ files | HIGH |
| `stores/providers/types.ts` | 8+ files | HIGH |
| `domain/entities/agent.ts` | 8+ files | HIGH |
| `domain/tools/tool-definition.ts` | 18+ files | HIGH |

---

## 3. Stub Requirements

### 3.1 Required Stubs (MUST CREATE)

#### 3.1.1 `@/lib/agent/providers/credential-vault` Stub

```typescript
// _phase2-staging-stubs/lib/agent/providers/credential-vault.ts
/**
 * PHASE 2 STAGED: credential-vault
 * Stub provides noop implementation for Phase 1A compatibility
 */
export const credentialVault = {
  initialize: async () => Promise.resolve(),
  getCredentials: async (_providerId: string) => null,
  setCredentials: async (_providerId: string, _key: string) => Promise.resolve(),
  deleteCredentials: async (_providerId: string) => Promise.resolve(),
  hasCredentials: async (_providerId: string) => false,
};
```

#### 3.1.2 `@/plugins/chat` Stub

```typescript
// _phase2-staging-stubs/plugins/chat/index.ts
/**
 * PHASE 2 STAGED: Chat Plugin
 * Stub provides placeholder for plugin registration
 */
import type { FeaturePlugin } from '@/domain/interfaces/feature-plugin.interface';

export const chatPlugin: FeaturePlugin = {
  id: 'chat',
  name: 'Chat (Phase 2)',
  icon: null,
  description: 'AI Chat - Coming in Phase 2',
  requirements: {
    storageType: 'any',
    deviceType: 'any',
    minWidth: 300,
    maxInstances: 1,
  },
  MainComponent: () => null, // Renders nothing
};

export const useChatPlugin = () => ({
  projectId: null,
  projectName: null,
  hasChatService: false,
});

export type ChatPluginContext = ReturnType<typeof useChatPlugin>;
```

#### 3.1.3 Agent/Provider Store Stubs

```typescript
// _phase2-staging-stubs/infrastructure/persistence/stores/agents/index.ts
/**
 * PHASE 2 STAGED: Agent Stores
 * Stub provides empty state and noop actions
 */
export const useAgentsStore = () => ({
  agents: [],
  addAgent: () => {},
  removeAgent: () => {},
  updateAgent: () => {},
  updateAgentStatus: () => {},
});

export const useAgentsStoreHydration = () => true;
export const DEFAULT_AGENT = null;
export type AgentsState = ReturnType<typeof useAgentsStore>;
```

### 3.2 Stub Installation Strategy

1. Create `_phase2-staging-stubs/` directory in project root
2. Configure TypeScript path alias: `@/*: ["_phase2-staging-stubs/*", "src/*"]`
3. Stubs take precedence via path resolution order
4. Original code archived but import paths unchanged

---

## 4. Archive Structure

```
_phase2-staging/
├── README.md                              # This document (retrieval instructions)
├── MANIFEST.yaml                          # Complete file list with original paths
├── IMPORT-STUBS.md                        # Stub documentation
├── RESTORATION-CHECKLIST.md               # Step-by-step restoration guide
│
├── src/
│   ├── presentation/
│   │   └── components/
│   │       ├── chat/                      # 47 files
│   │       ├── agent/                     # 85 files
│   │       ├── rag/                       # 8 files
│   │       ├── ide/
│   │       │   ├── AgentChatPanel.tsx
│   │       │   ├── AgentsPanel.tsx
│   │       │   ├── EnhancedChatInterface.tsx
│   │       │   ├── AgentChatPanel/        # 10 files
│   │       │   └── hooks/*Agent*.ts       # 5 files
│   │       └── notes/*AI*                 # 9 files
│   │
│   ├── lib/
│   │   ├── agent/                         # 95+ files
│   │   ├── workflow/                      # 20 files
│   │   ├── chat/                          # 3 files
│   │   └── notes/*ai*                     # 10 files
│   │
│   ├── domain/
│   │   ├── tools/                         # 16 files
│   │   ├── entities/agent.ts
│   │   ├── services/*agent*               # 2 files
│   │   └── types/viagent-metadata.ts
│   │
│   ├── infrastructure/
│   │   ├── tools/                         # 6 files
│   │   ├── persistence/
│   │   │   ├── stores/
│   │   │   │   ├── agents/                # 14 files
│   │   │   │   ├── providers/             # 17 files
│   │   │   │   └── conversation/          # 31 files
│   │   │   └── dexie-db-ai-types.ts
│   │   └── ui/AgentWorkspaceSync.tsx
│   │
│   ├── application/
│   │   └── services/
│   │       ├── ProviderService.ts
│   │       └── AgentService.ts
│   │
│   ├── plugins/
│   │   └── chat/                          # 3 files
│   │
│   ├── routes/
│   │   └── agents.tsx
│   │
│   └── hooks/
│       └── useAgents.ts
│
└── tests/                                 # All Phase 2+ tests
    └── (mirror structure of src/__tests__)
```

---

## 5. Restoration Procedure

### 5.1 Full Restoration (Phase 2 Readiness)

```bash
# 1. Remove stubs
rm -rf _phase2-staging-stubs/

# 2. Restore archived files
cp -r _phase2-staging/src/* src/

# 3. Remove path alias override from tsconfig.json
# Edit tsconfig.json to remove stub path priority

# 4. Run type check
pnpm typecheck:fast

# 5. Run tests
pnpm test:fast

# 6. Verify app builds
pnpm build
```

### 5.2 Partial Restoration (Feature by Feature)

1. **Restore Chat Only**:
   - Copy `_phase2-staging/src/plugins/chat/` to `src/plugins/chat/`
   - Copy `_phase2-staging/src/presentation/components/chat/` to `src/presentation/components/chat/`
   - Remove chat stub from `_phase2-staging-stubs/plugins/chat/`

2. **Restore Agents Only**:
   - Copy `_phase2-staging/src/presentation/components/agent/` to `src/presentation/components/agent/`
   - Copy `_phase2-staging/src/infrastructure/persistence/stores/agents/` to respective location
   - Update stubs as needed

### 5.3 Verification Checklist

- [ ] TypeScript compiles with 0 errors
- [ ] All existing Phase 1A tests pass
- [ ] App renders without console errors
- [ ] Plugins registry lists expected plugins
- [ ] No broken imports in IDE

---

## 6. Effort Estimation

### 6.1 Staging Effort

| Task | Estimated Time | Risk |
|------|----------------|------|
| Create archive structure | 15 min | Low |
| Move Phase 2A files | 30 min | Low |
| Move Phase 2B files | 45 min | Medium |
| Create all stubs | 2 hours | Medium |
| Update tsconfig paths | 15 min | Low |
| Test Phase 1A functionality | 1 hour | Medium |
| Fix stub issues | 1-2 hours | High |
| Documentation | 30 min | Low |

**TOTAL**: 5-7 hours (one developer)

### 6.2 Restoration Effort

| Task | Estimated Time |
|------|----------------|
| Full restoration | 30 min |
| Partial restoration | 1-2 hours per feature |
| Integration testing | 2-4 hours |

---

## 7. Risk Assessment

### 7.1 High Risk Items

| Risk | Impact | Mitigation |
|------|--------|------------|
| Broken stores/index.ts exports | App fails to start | Careful stub creation for all exports |
| Missing type definitions | TypeScript errors | Export type stubs with any/unknown |
| Hidden dependencies | Runtime errors | Run full test suite after staging |
| Plugin registry gaps | Layout breaks | Stub returns valid but empty plugin |

### 7.2 Medium Risk Items

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI notes features broken | Note editor degraded | Create stubs for AI note services |
| Settings page incomplete | Can't configure agents | Acceptable for Phase 1A |
| RAG search unavailable | Feature missing | Acceptable for Phase 1A |

### 7.3 Low Risk Items

| Risk | Impact | Mitigation |
|------|--------|------------|
| Workflow builder unavailable | Feature missing | N/A |
| Voice features unavailable | Feature missing | N/A |
| Multi-agent chat unavailable | Feature missing | N/A |

---

## 8. Recommendations

### 8.1 Recommended Approach: **Phased Staging**

Instead of staging ALL Phase 2+ code at once, recommend:

**Phase 2A Staging (Lower Risk, 40% of Phase 2+ code)**:
1. `src/presentation/components/chat/` - Chat UI (10,934 lines)
2. `src/plugins/chat/` - Chat plugin (341 lines)
3. `src/lib/workflow/` - Workflow builder (5,938 lines)
4. `src/presentation/components/rag/` - RAG UI (1,198 lines)
5. `src/routes/agents.tsx` - Agents route (49 lines)

**Keep for Now (Phase 2B - Higher Integration Risk)**:
1. `src/lib/agent/` - Core AI (24,946 lines) - Too integrated
2. `src/infrastructure/persistence/stores/agents/` - Agent stores (1,486 lines)
3. `src/infrastructure/persistence/stores/providers/` - Provider stores (3,089 lines)
4. `src/infrastructure/persistence/stores/conversation/` - Conversation store (3,241 lines)
5. `src/presentation/components/agent/` - Agent config (11,929 lines)

### 8.2 Rationale

1. **Phase 2A files are UI-heavy** - Easier to stub (just render nothing)
2. **Phase 2B files are infrastructure** - Deep integration with stores/types
3. **Lower risk first** - Validate staging approach with simpler files
4. **Preserve working stores** - Agent/provider/conversation stores work, don't break them

### 8.3 Alternative: Context Isolation Instead of Staging

Instead of moving files, consider:

1. **Create `.aiexclude` file** listing Phase 2+ directories
2. **Configure AI tools** to ignore those paths
3. **Code stays in place** - no import breakage risk
4. **Context remains clean** - AI doesn't see Phase 2+ code

This is **lower risk** but requires AI tool support.

---

## Appendix A: MANIFEST.yaml Template

```yaml
# _phase2-staging/MANIFEST.yaml
version: "1.0.0"
staged_date: "2026-01-29T05:05:34Z"
staged_by: "analyst-ext"

phase_2a:
  total_files: 95
  total_lines: 18460
  directories:
    - path: src/presentation/components/chat
      files: 47
      lines: 10934
    - path: src/plugins/chat
      files: 3
      lines: 341
    - path: src/lib/workflow
      files: 20
      lines: 5938
    - path: src/presentation/components/rag
      files: 8
      lines: 1198
    - path: src/routes/agents.tsx
      files: 1
      lines: 49

phase_2b:
  total_files: 240+
  total_lines: 51700+
  directories:
    - path: src/lib/agent
      files: 95+
      lines: 24946
    - path: src/presentation/components/agent
      files: 85
      lines: 11929
    # ... (rest of Phase 2B)

stubs_required:
  - path: "@/lib/agent/providers/credential-vault"
    type: "noop"
    critical: true
  - path: "@/plugins/chat"
    type: "empty-plugin"
    critical: true
  - path: "@/infrastructure/persistence/stores/agents"
    type: "empty-store"
    critical: true
```

---

## Appendix B: Decision Matrix

| Approach | Effort | Risk | Context Reduction | Reversibility |
|----------|--------|------|-------------------|---------------|
| Full Staging (All Phase 2+) | HIGH (7h) | HIGH | 23% reduction | MEDIUM |
| Phased Staging (2A only) | MEDIUM (3h) | MEDIUM | 8% reduction | HIGH |
| Context Exclusion (.aiexclude) | LOW (30min) | LOW | Depends on tool | HIGH |
| No Action | NONE | NONE | 0% | N/A |

**Recommendation**: Start with **Context Exclusion** if supported, then **Phased Staging (2A)** if needed.

---

**Document Status**: READY FOR REVIEW
**Next Steps**:
1. Human decision on approach (Full vs Phased vs Exclusion)
2. Create detailed execution plan for chosen approach
3. Execute with proper git branching

---

*Generated by analyst-ext agent | 2026-01-29 05:05:34*
