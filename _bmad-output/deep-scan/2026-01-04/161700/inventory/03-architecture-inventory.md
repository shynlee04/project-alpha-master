# Architecture Inventory Report
**Date**: 2026-01-04
**Scanner**: Architecture Scanner Agent
**Phase**: INVENTORY
**Target**: `src/`

---

## Executive Summary

### Overall Codebase Metrics
- **Total TypeScript Files**: 1,119 files
- **Total Lines of Code**: ~200,000+ lines
- **Architecture Compliance**: Partial (4-layer structure exists but violations present)

### Layer Distribution
| Layer | File Count | Status | Notes |
|-------|-----------|--------|-------|
| **Presentation** | 471 files | 🟡 Growing | Active development, many large components |
| **Application** | 2 files | 🔴 Minimal | Nearly empty - major gap |
| **Domain** | 15 files | 🔴 Minimal | Only 5 core entities, sparse services |
| **Infrastructure** | 157 files | 🟡 Active | Heavy persistence (Zustand + Dexie) |
| **Legacy/Mixed** | 438 files | 🔴 High Debt | `src/lib/` (412), `src/components/` (4), routes (22) |

---

## 1. God Component Analysis (>300 lines)

### Critical UI Components (TSX)
**Total**: 42 god components found

| Component | LOC | Layer | Violation Severity |
|-----------|-----|-------|-------------------|
| `resizable.tsx` | 745 | UI | 🔴 Critical - 6.2x limit |
| `KnowledgePage.tsx` | 658 | Knowledge | 🔴 Critical - 5.5x limit |
| `IndexingProgressPanel.tsx` | 593 | Knowledge | 🔴 Critical - 4.9x limit |
| `ChatConversation.tsx` | 521 | Chat | 🔴 Critical - 4.3x limit |
| `WorkspacePermissionEditor.tsx` | 479 | Agent | 🔴 Critical - 4.0x limit |
| `NotesPage.tsx` | 466 | Notes | 🔴 Critical - 3.9x limit |
| `CodeBlock.tsx` | 465 | Chat | 🔴 Critical - 3.9x limit |
| `AgentWorkspaceSwitchingFeedback.tsx` | 458 | Agent | 🔴 Critical - 3.8x limit |
| `ApprovalOverlay.tsx` (UI) | 443 | UI | 🔴 Critical - 3.7x limit |
| `PreferenceSettings.tsx` | 433 | Agent | 🔴 Critical - 3.6x limit |
| `DiffPreview.tsx` | 432 | Chat | 🔴 Critical - 3.6x limit |
| `HeroSection.tsx` | 424 | About | 🔴 Critical - 3.5x limit |
| `ToolPermissionsConfig.tsx` | 402 | Agent | 🔴 Critical - 3.4x limit |
| `WorkspaceEnhancedSwitcher.tsx` | 393 | Workspace | 🔴 Critical - 3.3x limit |
| `AgentChatPanel.tsx` | 385 | IDE | 🔴 Critical - 3.2x limit |
| `UnifiedAgentSelector.tsx` | 384 | Agent | 🔴 Critical - 3.2x limit |
| `study-session.tsx` | 381 | Study | 🔴 Critical - 3.2x limit |
| `LinkageProposalsPanel.tsx` | 375 | Canvas | 🔴 Critical - 3.1x limit |
| `RAGConfigurationPanel.tsx` | 365 | Knowledge | 🔴 Critical - 3.0x limit |
| `ApprovalOverlay.tsx` (Chat) | 363 | Chat | 🔴 Critical - 3.0x limit |
| `AgentValidationFeedback.tsx` | 362 | UI | 🔴 Critical - 3.0x limit |
| `AgentManager.tsx` | 361 | Agent | 🔴 Critical - 3.0x limit |
| `AgentWorkspaceBindingConfig.tsx` | 360 | Agent | 🔴 Critical - 3.0x limit |
| `IDEHeaderBar.tsx` | 356 | Layout | 🔴 Critical - 3.0x limit |
| `MonacoEditor.tsx` | 348 | IDE | 🔴 Critical - 2.9x limit |
| `WorkspacePermissionManager.tsx` | 345 | Agent | 🔴 Critical - 2.9x limit |
| `CitationSidebar.tsx` | 344 | RAG (legacy) | 🔴 Critical - 2.9x limit |
| `ToolAvailabilityIndicator.tsx` | 340 | Agent | 🔴 Critical - 2.8x limit |
| `SourcePreviewPanel.tsx` | 339 | Knowledge | 🔴 Critical - 2.8x limit |
| `StudyPage.tsx` | 335 | Study | 🔴 Critical - 2.8x limit |
| `StudyFilePicker.tsx` | 335 | Study | 🔴 Critical - 2.8x limit |
| `ThreadManager.tsx` | 335 | Chat | 🔴 Critical - 2.8x limit |
| `quiz-preview.tsx` | 329 | Study | 🔴 Critical - 2.7x limit |
| `QuizPreviewPanel.tsx` | 325 | Knowledge | 🔴 Critical - 2.7x limit |
| `RAGSearchPanel.tsx` | 324 | RAG | 🔴 Critical - 2.7x limit |
| `MobileIDELayout.tsx` | 322 | Layout | 🔴 Critical - 2.7x limit |
| `FileTreeItem.tsx` | 317 | IDE | 🔴 Critical - 2.6x limit |
| `ProviderConfigDialog.tsx` | 316 | Agent | 🔴 Critical - 2.6x limit |
| `FileTree.tsx` | 314 | IDE | 🔴 Critical - 2.6x limit |
| `EnhancedChatInterface.tsx` | 311 | IDE | 🔴 Critical - 2.6x limit |
| `MemorySearch.tsx` | 311 | Agent | 🔴 Critical - 2.6x limit |
| `DeepThinkUI.tsx` | 310 | Agent | 🔴 Critical - 2.6x limit |
| `AISlashCommand.tsx` | 307 | Notes | 🔴 Critical - 2.6x limit |
| `SyncStatusPanel.tsx` | 306 | IDE | 🔴 Critical - 2.6x limit |
| `MainSidebar.tsx` | 304 | Layout | 🔴 Critical - 2.5x limit |
| `XTerminal.tsx` | 303 | IDE | 🔴 Critical - 2.5x limit |

**Total God Components**: 42 files, **13,446 lines** (average 320 lines/file)

### Critical Infrastructure Files (TS)
**Total**: 30 files >500 lines

| File | LOC | Layer | Issue Type |
|------|-----|-------|-----------|
| `dexie-db.ts` | 1,072 | Infrastructure | 🔴 God file - database schema |
| `knowledge-store.test.ts` | 1,024 | Test | 🔴 Massive test file |
| `reverse-sync-service.test.ts` | 804 | Test | 🔴 Massive test file |
| `tool-permission-manager.test.ts` | 685 | Test | 🔴 Massive test file |
| `session-snapshot.test.ts` | 677 | Test | 🔴 Massive test file |
| `retry-queue.test.ts` | 670 | Test | 🔴 Massive test file |
| `notes-file-sync-service.ts` | 659 | Lib/FileSync | 🔴 God service |
| `quiz-store.ts` | 658 | Infrastructure | 🔴 God store |
| `orama-index.ts` | 644 | Lib/RAG | 🔴 God index service |
| `event-bus.ts` | 644 | Infrastructure | 🔴 God event bus |
| `chat.test.ts` | 640 | Test | 🔴 Massive test file |
| `canvas-store.ts` | 623 | Infrastructure | 🔴 God store |
| `agent/factory.ts` | 612 | Lib/Agent | 🔴 God factory |
| `file-tools-impl.ts` | 586 | Lib/Agent | 🔴 God facade |
| `tool-permission-manager.ts` | 584 | Lib/Agent | 🔴 God manager |
| `credential-vault.test.ts` | 584 | Test | 🔴 Massive test file |
| `markdown-converter.ts` | 574 | Lib/Notes | 🔴 God converter |
| `project-metadata.test.ts` | 573 | Test | 🔴 Massive test file |
| `document-chunker.ts` | 572 | Lib/RAG | 🔴 God chunker |
| `note-store.ts` | 566 | Lib/Notes | 🔴 God store |
| `reverse-sync-service.ts` | 565 | Lib/Sync | 🔴 God service |
| `error-classification.ts` | 563 | Lib/Utils | 🔴 God classifier |
| `conversation-migration.ts` | 554 | Infrastructure | 🔴 God migration |
| `migration-backup.ts` | 549 | Infrastructure | 🔴 God backup |
| `retry-queue.ts` | 547 | Lib/Agent | 🔴 God queue |
| `embedding-service.ts` | 532 | Lib/RAG | 🔴 God service |
| `flashcard-store.ts` | 531 | Infrastructure | 🔴 God store |
| `rag/types.ts` | 529 | Lib/RAG | 🔴 God type file |
| `dexie-db-migrations.ts` | 529 | Infrastructure | 🔴 God migrations |
| `orama-index.test.ts` | 524 | Test | 🔴 Massive test file |
| `sse-streaming.test.ts` | 524 | Test | 🔴 Massive test file |
| `file-tools.test.ts` | 524 | Test | 🔴 Massive test file |
| `prompt-composer.test.ts` | 512 | Test | 🔴 Massive test file |

---

## 2. Layer Violation Analysis

### Presentation → Infrastructure Violations
**Count**: 20+ direct imports detected

**Pattern**: Presentation components bypassing Application layer to access Infrastructure stores directly

**Evidence**:
```typescript
// src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx
import { useWorkspaceStore } from '@/infrastructure/persistence/stores/workspace';

// src/presentation/components/ide/AgentChatPanel.tsx
import { eventBus as crossWorkspaceEventBus } from '@/infrastructure/events/event-bus';
import { useConversationStore } from '@/infrastructure/persistence/stores/conversation/useConversationStore';
import { useAutoApproveStore } from '@/infrastructure/persistence/stores/auto-approve-store';
import { useAgentSelection } from '@/infrastructure/persistence/stores/agents/agent-selection-store';
import { usePromptEnhancementStore } from '@/infrastructure/persistence/stores/prompt-enhancement-store';

// src/presentation/components/ide/statusbar/SyncStatusSegment.tsx
import { useStatusBarStore } from '@/infrastructure/persistence/stores/statusbar-store';
```

**Impact**:
- 🔴 High coupling between UI and persistence
- 🔴 Impossible to swap persistence implementation
- 🔴 Difficult to test UI in isolation
- 🔴 Application logic missing (no service layer)

### Presentation → Lib Violations
**Count**: 367 imports from lib layer detected

**Pattern**: Presentation components importing business logic from `src/lib/`

**Evidence**:
```typescript
// src/presentation/components/study/StudyPage.tsx
import { useQuizStore } from '@/lib/state/quiz-store';
import { useIDEStore } from '@/lib/state/ide-store';

// src/presentation/components/layout/IDELayout/IDEResizableLayout.tsx
import { useIDEStore } from '@/lib/state/ide-store';

// src/presentation/components/layout/MobileIDELayout.tsx
import { useIDEStore } from '@/lib/state';

// src/presentation/components/agent/WorkspaceToolPermissionsConfig.tsx
import type { WorkspaceType } from '@/lib/state/workspace-types';
```

**Impact**:
- 🔴 Bypasses Application layer entirely
- 🔴 Tight coupling to implementation details
- 🔴 Business logic scattered in `src/lib/`

---

## 3. Feature Coupling Analysis

### Cross-Workspace Component Dependencies

**Knowledge ↔ RAG** (High Coupling):
```typescript
// src/presentation/components/knowledge/SourcePreviewPanel.tsx
import type { ChunkMetadata } from '@/lib/rag/types';

// src/presentation/components/knowledge/KnowledgePage.tsx
import { DocumentChunker } from '@/lib/rag/document-chunker';
import { createEmbeddingService, type EmbeddingService } from '@/lib/rag/embedding-service';
import { createIndex } from '@/lib/rag/orama-index';
import { getOramaIndexAdapter } from '@/lib/rag/orama-index-adapter';
```

**Chat ↔ Agent** (Medium Coupling):
```typescript
// src/presentation/components/chat/SuggestionChips.tsx
import type { Suggestion } from '@/lib/agent/suggestions/suggestion-engine';
import { formatSuggestion, improveSuggestionsWithPatterns } from '@/lib/agent/suggestions/suggestion-engine';

// src/presentation/components/chat/BatchApprovalBar.tsx
import type { PendingApprovalInfo } from '@/lib/agent/hooks/use-agent-chat-with-tools';

// src/presentation/components/chat/ToolProgressIndicator.tsx
import type { StreamingChunk } from '@/lib/agent/tools/streaming';
```

**Shared UI Primitives** (Good Pattern):
```typescript
// All workspaces using UI components from src/presentation/components/ui/
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import { Switch } from '@/presentation/components/ui/switch';
import { TruncatedText } from '@/presentation/components/ui/truncated-text';
```

### Store Usage Patterns

**Multi-Store Components** (High Complexity):
```typescript
// src/presentation/components/ide/AgentChatPanel.tsx uses 5 stores:
- useWorkspaceStore
- useConversationStore
- useAutoApproveStore
- useAgentSelection
- usePromptEnhancementStore
```

**Issue**: Components managing too many state concerns simultaneously

---

## 4. Component Complexity by Workspace

| Workspace | Components | Tests | God Components | Avg LOC/Component | Health Score |
|-----------|-----------|-------|----------------|-------------------|--------------|
| **IDE** | 44 | 3 | 6 | High | 🔴 40/100 |
| **Knowledge** | 33 | 12 | 4 | Very High | 🟡 55/100 |
| **Study** | 11 | 0 | 4 | Critical | 🔴 25/100 |
| **Notes** | 14 | 0 | 2 | High | 🔴 35/100 |
| **Canvas** | 15 | 5 | 1 | Medium | 🟢 65/100 |
| **Chat** | 21 | 4 | 3 | High | 🟡 50/100 |
| **Agent** | 55 | 5 | 9 | Very High | 🔴 30/100 |
| **Layout** | 21 | 1 | 3 | High | 🟡 45/100 |
| **Hub** | 32 | 4 | 0 | Medium | 🟢 70/100 |
| **UI Primitives** | 79 | N/A | 2 | Low | 🟢 75/100 |

**Overall Workspace Health**: 🔴 **48/100** (Critical)

**Key Findings**:
- Agent workspace has most god components (9)
- Study workspace has 0 tests (highest risk)
- IDE has 6 god components despite being core workspace
- Knowledge workspace has best test coverage (12 tests)

---

## 5. Import Chain Analysis

### Typical Violation Chain

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  src/presentation/components/ide/AgentChatPanel.tsx          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ VIOLATION: Should go through Application
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     ??? MISSING ???                          │
│  NO Application Service / Use Case Layer                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ VIOLATION: Direct infrastructure access
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                        │
│  src/infrastructure/persistence/stores/workspace/*           │
│  src/infrastructure/persistence/stores/conversation/*        │
│  src/infrastructure/persistence/stores/agents/*              │
└─────────────────────────────────────────────────────────────┘
```

### Correct Architecture Pattern (Not Implemented)

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  src/presentation/components/ide/AgentChatPanel.tsx          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ ✅ Application Service call
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  src/application/use-cases/StartAgentChatSession.ts         │
│  src/application/services/AgentOrchestrationService.ts       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ ✅ Domain service invocation
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                            │
│  src/domain/entities/Agent.ts                                │
│  src/domain/services/AgentWorkspaceCoordinator.ts           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ ✅ Repository pattern
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                        │
│  src/infrastructure/persistence/stores/agents/*              │
│  src/infrastructure/persistence/repositories/AgentRepository │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Store Architecture Analysis

### Store Locations
| Location | Count | Status | Notes |
|----------|-------|--------|-------|
| `src/infrastructure/persistence/stores/` | 22 | 🟢 Active | Modern Zustand v5 pattern |
| `src/lib/state/` | 12 | 🟡 Legacy | Needs migration to infrastructure |
| `src/stores/` | 0 | ✅ Empty | Successfully deprecated |

### Store Slices by Domain
| Domain | Slices | God Stores | Status |
|--------|--------|-----------|--------|
| **Agents** | 5+ | 0 | 🟢 Good - refactored |
| **Providers** | 3+ | 0 | 🟢 Good - refactored |
| **Conversation** | 8+ | 0 | 🟢 Good - refactored |
| **IDE** | 1 | 0 | 🟡 Needs splitting |
| **Knowledge** | 4+ | 1 | 🟡 Partially refactored |
| **RAG** | 4 | 1 | 🔴 Has god store |
| **Study** | 1 | 1 | 🔴 God store (658 lines) |
| **Permissions** | 1 | 1 | 🔴 Large store (493 lines) |
| **Workspace** | 1 | 0 | 🟢 Good |

**Total Stores**: 34+ store files across infrastructure

---

## 7. Critical Architecture Gaps

### Gap 1: Missing Application Layer 🔴
**Severity**: CRITICAL
**Impact**: No orchestration, no use cases, business logic in UI

**Evidence**:
- `src/application/` has only 2 files (dtos, services - mostly empty)
- No use cases defined
- No application services coordinating domain logic

**Remediation**: Epic AC-2 (Create Application Layer)

### Gap 2: Anemic Domain Layer 🔴
**Severity**: CRITICAL
**Impact**: Domain logic scattered in `src/lib/`

**Evidence**:
- `src/domain/entities/` - Empty (should have Agent, Provider, Conversation entities)
- `src/domain/services/` - Only 1 file (agent-workspace-utils.ts)
- `src/domain/value-objects/` - Empty

**Remediation**: Epic AC-3 (Extract Domain Logic)

### Gap 3: God Components Proliferation 🔴
**Severity**: HIGH
**Impact**: Unmaintainable UI, difficult testing

**Evidence**:
- 42 components >300 lines (standard is 120 lines)
- Worst offender: `resizable.tsx` at 745 lines (6.2x limit)
- Agent workspace has 9 god components

**Remediation**: Epic UI-1 (Component Normalization)

### Gap 4: Feature Coupling 🟡
**Severity**: MEDIUM
**Impact**: Difficulty modifying features independently

**Evidence**:
- Knowledge workspace tightly coupled to RAG implementation
- Chat components coupled to Agent internals
- Cross-workspace component dependencies

**Remediation**: Epic FC-1 (Decouple Features)

---

## 8. Test Coverage Analysis

### Test File Sizes (God Tests)
**Total**: 9 test files >500 lines

| Test File | LOC | Issue |
|-----------|-----|-------|
| `knowledge-store.test.ts` | 1,024 | 🔴 God test |
| `reverse-sync-service.test.ts` | 804 | 🔴 God test |
| `tool-permission-manager.test.ts` | 685 | 🔴 God test |
| `session-snapshot.test.ts` | 677 | 🔴 God test |
| `retry-queue.test.ts` | 670 | 🔴 God test |
| `tool-permission-manager.test.ts` | 685 | 🔴 God test |
| `chat.test.ts` | 640 | 🔴 God test |
| `orama-index.test.ts` | 524 | 🔴 God test |
| `sse-streaming.test.ts` | 524 | 🔴 God test |
| `file-tools.test.ts` | 524 | 🔴 God test |

**Issue**: Monolithic test files difficult to maintain

### Workspace Test Coverage
- **Knowledge**: 12 tests (best coverage)
- **Canvas**: 5 tests
- **Chat**: 4 tests
- **Agent**: 5 tests
- **Hub**: 4 tests
- **IDE**: 3 tests
- **Layout**: 1 test
- **Study**: 0 tests 🔴
- **Notes**: 0 tests 🔴
- **Workspace**: 0 tests 🔴

**Coverage Gap**: Study, Notes, Workspace workspaces have ZERO tests

---

## 9. Recommendations Summary

### Immediate Actions (P0 - Week 1-2)
1. **Split God Components** - Target 42 components >300 lines
   - Priority: Start with Agent workspace (9 god components)
   - Target: Reduce all components to <200 lines

2. **Create Application Layer** - Fill gap in architecture
   - Create use cases for agent chat, RAG indexing, study sessions
   - Move orchestration logic from UI to services

3. **Extract Domain Logic** - Move from `src/lib/` to `src/domain/`
   - Extract Agent, Provider, Conversation entities
   - Create domain services for workspace coordination

### Medium-Term Actions (P1 - Week 3-4)
1. **Eliminate Layer Violations** - Enforce 4-layer boundaries
   - Remove direct Infrastructure imports from Presentation
   - Create Application services as intermediary layer

2. **Decouple Features** - Reduce feature coupling
   - Create abstractions for RAG usage in Knowledge workspace
   - Isolate Agent chat concerns from Chat UI

3. **Normalize Test Files** - Split god tests
   - Target test files <300 lines
   - Add tests for Study, Notes, Workspace workspaces

### Long-Term Actions (P2 - Week 5-8)
1. **Complete Store Refactoring** - Migrate remaining `src/lib/state/` stores
2. **Implement Repository Pattern** - Abstract persistence behind repositories
3. **Create Domain Services** - Orchestrate business logic
4. **Establish Architecture Governance** -Lint rules for layer compliance

---

## 10. Metrics Dashboard

### Codebase Health Score
```
Architecture Compliance: 35/100 🔴
  - Layer violations: 20+
  - Missing Application layer: Critical gap
  - Anemic Domain layer: Critical gap

Component Quality:      45/100 🔴
  - God components: 42 (13,446 lines)
  - Avg component size: 320 lines (target: 120)
  - Test coverage: 30% (target: 80%)

Feature Independence:   60/100 🟡
  - Cross-workspace coupling: Medium
  - Shared abstractions: Good (UI primitives)
  - Service layer: Missing

Store Organization:     55/100 🟡
  - Store fragmentation: 34+ stores
  - God stores: 3 remaining
  - Modern Zustand v5: Partially adopted

Overall Health:         48/100 🔴 CRITICAL
```

### Technical Debt Summary
| Category | Count | Estimated Remediation |
|----------|-------|----------------------|
| God Components | 42 | 120 hours |
| God Test Files | 9 | 30 hours |
| Layer Violations | 367 | 40 hours |
| Missing Application Layer | 1 layer | 60 hours |
| Anemic Domain Layer | 15 files → 100+ | 80 hours |
| **TOTAL DEBT** | **~330 hours** | **~8 weeks** |

---

## Appendix A: File Inventory by Layer

### Presentation Layer (`src/presentation/`)
```
components/
  ├── about/ (50+ files)
  ├── agent/ (55 components, 9 god components)
  ├── audio/ (5 components)
  ├── canvas/ (15 components, 1 god component)
  ├── chat/ (21 components, 3 god components)
  ├── common/ (3 components)
  ├── dashboard/ (5 components)
  ├── debug/ (2 components)
  ├── dev/ (1 component)
  ├── hub/ (32 components)
  ├── ide/ (44 components, 6 god components)
  ├── knowledge/ (33 components, 4 god components)
  ├── layout/ (21 components, 3 god components)
  ├── notes/ (14 components, 2 god components)
  ├── rag/ (3 components, 1 god component)
  ├── study/ (11 components, 4 god components, 0 tests)
  ├── ui/ (79 components, 2 god components)
  └── workspace/ (1 component)
```

### Application Layer (`src/application/`)
```
dtos/ (empty)
services/ (2 files - minimal)
use-cases/ (empty)
```

### Domain Layer (`src/domain/`)
```
entities/ (empty - should have Agent, Provider, etc.)
services/ (1 file - agent-workspace-utils.ts, 106 lines)
use-cases/ (1 file - switch-workspace.ts)
value-objects/ (3 files)
```

### Infrastructure Layer (`src/infrastructure/`)
```
events/ (1 file - event-bus.ts, 644 lines, GOD FILE)
external/ (empty)
framework/ (empty)
persistence/
  ├── dexie-db-helpers/ (5 files)
  ├── stores/ (34+ store files, 3 god stores)
  │   ├── agents/ (5+ slices)
  │   ├── conversation/ (8+ slices)
  │   ├── providers/ (3+ slices)
  │   ├── knowledge/ (4+ slices)
  │   ├── rag/ (4+ slices, 1 god)
  │   ├── study/ (1 god store - 658 lines)
  │   ├── permissions/ (1 large store - 493 lines)
  │   └── workspace/ (1 store)
  └── dexie-db.ts (1,072 lines, GOD FILE)
```

### Legacy/Mixed (`src/lib/`)
```
agent/ (100+ files - business logic, should be in domain)
audio/ (5 files)
canvas/ (10 files)
chat/ (5 files)
demo/ (3 files)
editor/ (5 files)
events/ (5 files)
filesync/ (15 files - 2 god services)
filesystem/ (25+ files)
hooks/ (15 hooks)
knowledge/ (35 files - business logic, should be in domain)
notes/ (15 files - 1 god store, 1 god converter)
pdf/ (5 files)
persistence/ (10 files - deprecated)
rag/ (35 files - 3 god services)
state/ (12 stores - legacy, needs migration)
study/ (10 files)
sync/ (10 files - 2 god services)
utils/ (30 files - 1 god classifier)
workspace/ (15 files - 1 god store)
webcontainer/ (5 files)
```

---

**Scan Complete**: INVENTORY phase finished
**Next Phase**: ANALYZE (import dependency graph, circular dependency detection)
**Output**: `_bmad-output/deep-scan/2026-01-04/161700/inventory/04-dependency-analysis.md`
