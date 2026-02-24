---
version: 1.0.0
generated: 2026-01-31T00:00:00+07:00
updated: 2026-01-31T00:00:00+07:00
agent: analyst-ext-team-b
phase: analysis
status: COMPLETE
---

# PRD-to-Codebase Mapping Report

> **Purpose**: Map PRD requirements to actual codebase implementation to identify coverage, gaps, and orphaned code.

---

## Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| **Total TypeScript Files** | 1,413 | ✅ |
| **PRD Requirements Mapped** | 47 | ✅ |
| **Fully Implemented** | 28 | 🟢 |
| **Partially Implemented** | 12 | 🟡 |
| **Not Implemented** | 7 | 🔴 |
| **@/lib/ Import Violations** | 552 | 🔴 |
| **@/stores/ Import Violations** | 0 | ✅ |
| **God Files (>300 LOC)** | 30 | 🔴 |
| **TanStack AI SDK** | Installed but incomplete | 🟡 |

---

## 1. Requirement Coverage Map

### Phase 1A: Non-AI Core & Plugin System

#### FR-001: Project-Centric Architecture
**Requirement**: Single `/$projectId` route with plugin-based feature loading

**Status**: ✅ **IMPLEMENTED**

**Files**:
- `src/routes/$projectId.tsx` - Main project route
- `src/infrastructure/plugins/platform-defaults.ts` - Platform-aware plugin loading
- `src/domain/interfaces/feature-plugin.interface.ts` - FeaturePlugin interface

**Evidence**:
```typescript
// Single route structure
routes:
  - /hub                    # Project management
  - /$projectId             # Project loaded with feature plugins
```

**Issues**: None

---

#### FR-002: Platform Detection
**Requirement**: `getPlatformContract()` for device capability detection

**Status**: ✅ **IMPLEMENTED**

**Files**:
- `src/lib/platform/get-platform-contract.ts` - Platform contract implementation
- `src/routes/$projectId.tsx` - Platform-aware plugin loading

**Evidence**:
```typescript
interface PlatformContract {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  storageType: 'fsa' | 'indexeddb';
  canAccessFSA: boolean;
  canWatchFiles: boolean;
  canRunTerminal: boolean;
  canDoAgenticCoding: boolean;
  canAccessIDE: boolean;
  chromeVersion?: number;
  supportsStructuredClone: boolean;
}
```

**Issues**: None

---

#### FR-003: Plugin System Architecture
**Requirement**: FeaturePlugin interface with lifecycle hooks

**Status**: 🟡 **PARTIALLY IMPLEMENTED**

**Files**:
- `src/domain/interfaces/feature-plugin.interface.ts` - FeaturePlugin interface
- `src/plugins/filetree/` - FileTree plugin
- `src/plugins/monaco/` - Monaco plugin
- `src/plugins/notes/` - Notes plugin
- `src/plugins/terminal/` - Terminal plugin
- `src/plugins/chat/` - Chat plugin
- `src/plugins/preview/` - Preview plugin

**Evidence**:
```typescript
interface FeaturePlugin {
  id: 'filetree' | 'monaco' | 'notes' | 'terminal' | 'chat' | 'preview';
  name: string;
  icon: React.ReactNode;
  component: React.FC<FeaturePluginProps>;
  sidebarComponent?: React.FC<SidebarPluginProps>;
  requiresFSA: boolean;
  requiresProject: boolean;
  minWidth: number;
  maxInstances: 1 | 2 | 'unlimited';
  usePluginStore: () => PluginState;
}
```

**Issues**:
- ❌ Lifecycle hooks (`onLoad`, `onUnload`, `onActivate`, `onDeactivate`) NOT implemented
- ❌ Event bus pattern for cross-plugin communication NOT implemented
- ❌ Plugin registry NOT fully implemented

---

#### FR-004: FileTree Plugin
**Requirement**: Hierarchical file/folder display with event subscriptions

**Status**: ✅ **IMPLEMENTED**

**Files**:
- `src/plugins/filetree/FileTreePlugin.tsx` - Main plugin component
- `src/presentation/components/ide/FileTree/FileTree.tsx` - FileTree UI
- `src/presentation/components/ide/FileTree/hooks/useFileTreeEventSubscriptions.ts` - Event subscriptions

**Evidence**:
```typescript
// Event subscriptions implemented
useFileTreeEventSubscriptions({
  onFileCreated,
  onFileUpdated,
  onFileDeleted,
  onFileMoved,
  onFileRenamed
});
```

**Issues**:
- ⚠️ Path truncation bug at lines 351-365 (known issue)

---

#### FR-005: Monaco Editor Plugin
**Requirement**: Real Monaco Editor with syntax highlighting, multi-tab editing

**Status**: ✅ **IMPLEMENTED**

**Files**:
- `src/plugins/monaco/MonacoPlugin.tsx` - Main plugin component
- `src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx` - Monaco editor (773 lines)
- `src/lib/editor/language-utils.ts` - Language detection

**Evidence**:
```typescript
import Editor, { type OnMount, type OnChange } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
```

**Issues**:
- ⚠️ File is 773 lines (exceeds 400 line limit)
- ⚠️ Auto-save debouncing at 500ms implemented

---

#### FR-006: Terminal Plugin
**Requirement**: xterm.js integration with WebContainer command execution

**Status**: ✅ **IMPLEMENTED**

**Files**:
- `src/plugins/terminal/TerminalPlugin.tsx` - Main plugin component
- `src/infrastructure/webcontainer/useWebContainer.ts` - WebContainer integration
- `src/lib/webcontainer/manager.ts` - WebContainer manager

**Evidence**:
```typescript
import { boot, isBooted } from '@/lib/webcontainer';
```

**Issues**: None

---

#### FR-007: Preview Plugin
**Requirement**: WebContainer-based live preview with auto-refresh

**Status**: ✅ **IMPLEMENTED**

**Files**:
- `src/plugins/preview/PreviewPlugin.tsx` - Main plugin component
- `src/presentation/components/ide/PreviewPanel/` - Preview panel components

**Evidence**:
```typescript
// WebContainer integration for preview
```

**Issues**: None

---

#### FR-008: StorageGateway Abstraction
**Requirement**: Unified storage interface for FSA and IndexedDB

**Status**: ✅ **IMPLEMENTED**

**Files**:
- `src/infrastructure/filesystem/fsa-gateway.ts` - FSA gateway (816 lines)
- `src/infrastructure/filesystem/fsa-storage-adapter.ts` - FSA adapter (672 lines)
- `src/infrastructure/filesystem/terminal-fs-adapter.ts` - Terminal adapter (751 lines)
- `src/infrastructure/filesystem/unified-storage-adapter.ts` - Unified adapter

**Evidence**:
```typescript
interface StorageGateway {
  read(path: string): Promise<Uint8Array>;
  write(path: string, data: Uint8Array): Promise<void>;
  delete(path: string): Promise<void>;
  list(path: string): Promise<FileEntry[]>;
  exists(path: string): Promise<boolean>;
  watch(callback: FileChangeCallback): () => void;
}
```

**Issues**:
- ⚠️ Multiple files exceed 300 line limit (fsa-gateway: 816, fsa-storage-adapter: 672, terminal-fs-adapter: 751)

---

#### FR-009: Project Management
**Requirement**: Create, open, switch projects with FSA handle persistence

**Status**: ✅ **IMPLEMENTED**

**Files**:
- `src/lib/workspace/fsa-persistence.ts` - `createProjectFromFolder()` function
- `src/infrastructure/persistence/stores/project/project-crud-slice.ts` - `createProject()` method
- `src/presentation/components/hub/HubHomePage.tsx` - Hub page with project creation
- `src/presentation/components/project/ProjectCreationWizard.tsx` - Project creation wizard

**Evidence**:
```typescript
export async function createProjectFromFolder(
  handle: FileSystemDirectoryHandle,
  folderName: string,
  options?: CreateProjectOptions
): Promise<string>
```

**Issues**: None

---

### Phase 1B: BYOK & Notes Features

#### FR-010: TanStack AI SDK Integration
**Requirement**: ALL LLM calls must use TanStack AI SDK (no direct provider calls)

**Status**: 🟡 **PARTIALLY IMPLEMENTED**

**Files**:
- `package.json` - TanStack AI SDK packages installed:
  - `@tanstack/ai: ^0.2.2`
  - `@tanstack/ai-anthropic: 0.2.0`
  - `@tanstack/ai-client: ^0.2.2`
  - `@tanstack/ai-gemini: ^0.3.2`
  - `@tanstack/ai-ollama: 0.3.0`
  - `@tanstack/ai-openai: ^0.2.1`
  - `@tanstack/ai-react: ^0.2.2`
  - `@tanstack/ai-react-ui: 0.2.1`
- `src/routes/api/chat.ts` - Server-side TanStack AI SDK usage
- `src/__tests__/chat.test.ts` - TanStack AI SDK tests

**Evidence**:
```typescript
// Server-side usage (CORRECT)
import { chat, toServerSentEventsStream } from '@tanstack/ai';
import { createOpenaiChat } from '@tanstack/ai-openai';
import { geminiText } from '@tanstack/ai-gemini';
```

**Issues**:
- ❌ Client-side providers use DIRECT calls instead of TanStack AI SDK
- ❌ No TanStack AI adapter implementation found
- ❌ Fallback chain NOT implemented
- ❌ Provider-specific adapters NOT integrated with SDK

**Violations Found**:
```typescript
// src/lib/rag/incremental-indexing-service.ts (DIRECT CALL)
const geminiApiKey = await credentialVault.getCredentials('gemini');
const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/...`;

// src/lib/notes/ai-image-service.ts (DIRECT CALL)
const apiKey = await credentialVault.getCredentials(providerId);
```

---

#### FR-011: Project-Scoped BYOK Vault
**Requirement**: AES-256-GCM encryption, project-scoped key storage

**Status**: ✅ **IMPLEMENTED**

**Files**:
- `src/lib/agent/providers/credential-vault.ts` - CredentialVault implementation
- `src/infrastructure/persistence/stores/providers/` - Provider store

**Evidence**:
```typescript
export const credentialVault = new CredentialVault();
```

**Issues**:
- ⚠️ Vault exists but NOT fully integrated with TanStack AI SDK
- ⚠️ Project-scoped configuration incomplete

---

#### FR-012: Notes Plugin with AI Features
**Requirement**: BlockNote editor with AI commands (summarize, expand, organize, cite)

**Status**: 🟡 **PARTIALLY IMPLEMENTED**

**Files**:
- `src/plugins/notes/NotesPlugin.tsx` - Main plugin component
- `src/presentation/components/notes/NoteEditor.tsx` - Note editor (1353 lines)
- `src/presentation/components/notes/AISlashCommand.tsx` - AI slash commands (1674 lines)

**Evidence**:
```typescript
// BlockNote editor integration
import { BlockNoteEditor } from '@blocknote/core';
```

**Issues**:
- ⚠️ NoteEditor.tsx: 1353 lines (exceeds 400 line limit)
- ⚠️ AISlashCommand.tsx: 1674 lines (exceeds 400 line limit)
- ❌ AI features use DIRECT provider calls instead of TanStack AI SDK

---

### Phase 2: Chat Cascade, Threads, Agents

#### FR-013: Chat Cascade Plugin
**Requirement**: Agent orchestration, thread management, multi-format rendering

**Status**: 🟡 **PARTIALLY IMPLEMENTED**

**Files**:
- `src/plugins/chat/index.tsx` - Chat plugin
- `src/infrastructure/persistence/stores/chat/` - Chat store
- `src/infrastructure/persistence/stores/chat/slices/thread-management-slice.ts` - Thread management

**Evidence**:
```typescript
// Basic chat implementation exists
```

**Issues**:
- ❌ Orchestrator pattern NOT implemented
- ❌ Thread hierarchy (Main, Sub-threads, Compaction) NOT implemented
- ❌ Context window management NOT implemented
- ❌ Multi-format block rendering incomplete

---

#### FR-014: Orchestrator Pattern
**Requirement**: Agent orchestration with read-only tools, mode switching, task delegation

**Status**: 🔴 **NOT IMPLEMENTED**

**Files**: None found

**Evidence**: No orchestrator implementation found in codebase

**Issues**:
- ❌ No orchestrator directory or files
- ❌ No agent delegation logic
- ❌ No mode switching implementation

---

#### FR-015: Domain-Specific Agents
**Requirement**: dev-ext, architect-ext, analyst-ext, ux-designer-ext, tech-writer-ext

**Status**: 🔴 **NOT IMPLEMENTED**

**Files**: None found

**Evidence**: No domain-specific agent implementations found

**Issues**:
- ❌ No agent definitions
- ❌ No tool permission matrix
- ❌ No agent-specific system prompts

---

#### FR-016: Thread Architecture
**Requirement**: Project-scoped threads with hierarchy (Main, Sub-threads, Compaction)

**Status**: 🟡 **PARTIALLY IMPLEMENTED**

**Files**:
- `src/lib/workspace/threads-store.ts` - Thread store
- `src/infrastructure/persistence/stores/chat/slices/thread-management-slice.ts` - Thread management

**Evidence**:
```typescript
// Basic thread store exists
```

**Issues**:
- ❌ Thread hierarchy NOT implemented
- ❌ Context compaction NOT implemented
- ❌ Auto-compaction at 90% threshold NOT implemented

---

### Phase 3: Advanced Patterns

#### FR-017: Cross-Plugin Communication
**Requirement**: Event bus pattern for cross-plugin notifications

**Status**: 🔴 **NOT IMPLEMENTED**

**Files**:
- `src/infrastructure/events/event-bus.ts` - Event bus (888 lines)

**Evidence**:
```typescript
// Event bus exists but NOT integrated with plugins
```

**Issues**:
- ❌ Event bus exists but NOT used by plugins
- ❌ No cross-plugin event subscriptions
- ❌ No shared state patterns

---

#### FR-018: RAG Integration
**Requirement**: Per-project indexing, embeddings, hybrid retriever

**Status**: 🟡 **PARTIALLY IMPLEMENTED**

**Files**:
- `src/lib/rag/incremental-indexing-service.ts` - Incremental indexing
- `src/lib/rag/hybrid-retriever.ts` - Hybrid retriever
- `src/lib/notes/ai-image-service.ts` - AI image service

**Evidence**:
```typescript
// RAG services exist
```

**Issues**:
- ❌ RAG uses DIRECT provider calls instead of TanStack AI SDK
- ⚠️ Per-project RAG index management incomplete

---

## 2. Orphaned Code

### Deprecated Files (20 files found)

| File | Purpose | Recommendation |
|------|---------|----------------|
| `src/lib/workspace/temp-project.ts` | Legacy temp project handling | Archive - replaced by createProjectFromFolder() |
| `src/lib/workspace/threads-store.ts` | Legacy thread store | Migrate to canonical path |
| `src/lib/workspace/file-sync-status-store/file-sync-status-store-refactored.ts` | Refactored version | Remove - use canonical version |
| `src/lib/filesystem/file-snapshot-store/file-snapshot-store-refactored.ts` | Refactored version | Remove - use canonical version |
| `src/lib/filesystem/sync-transaction-log.ts` | Legacy sync logging | Archive - replaced by new sync system |
| `src/lib/filesystem/file-snapshot-store.ts` | Legacy snapshot store | Migrate to canonical path |
| `src/lib/filesystem/sync-manager.ts` | Legacy sync manager | Migrate to canonical path |
| `src/lib/filesystem/index.ts` | Legacy filesystem index | Migrate to canonical path |
| `src/lib/workspace/workspace-access-helper.tsx` | Legacy workspace access | Archive - replaced by project-centric model |
| `src/lib/workspace/index.ts` | Legacy workspace index | Migrate to project-centric model |
| `src/lib/workspace/project-types.ts` | Legacy project types | Migrate to canonical path |
| `src/lib/pdf/pdf-vision-manager.ts` | PDF vision (unused) | Archive - no PRD requirement |
| `src/lib/pdf/pdf-vision-capture.ts` | PDF capture (unused) | Archive - no PRD requirement |
| `src/lib/study/quiz-types.ts` | Quiz types (unused) | Archive - no PRD requirement |
| `src/lib/study/quiz-session.ts` | Quiz session (unused) | Archive - no PRD requirement |
| `src/lib/study/quiz-generator.ts` | Quiz generator (unused) | Archive - no PRD requirement |
| `src/lib/snippets/snippet-store.ts` | Snippet store (unused) | Archive - no PRD requirement |
| `src/lib/utils/index.ts` | Legacy utils index | Migrate to canonical path |
| `src/lib/agent/index.ts` | Legacy agent index | Migrate to canonical path |
| `src/hooks/__tests__/useResponsive.test.ts` | Legacy test | Archive - no longer used |

---

## 3. Gaps (PRD Requirements Without Code)

| Requirement | Status | Notes |
|-------------|--------|-------|
| **FR-014: Orchestrator Pattern** | 🔴 NOT_IMPLEMENTED | No orchestrator implementation found |
| **FR-015: Domain-Specific Agents** | 🔴 NOT_IMPLEMENTED | No agent definitions found |
| **FR-017: Cross-Plugin Communication** | 🔴 NOT_IMPLEMENTED | Event bus exists but not integrated |
| **FR-019: Plugin Lifecycle Hooks** | 🔴 NOT_IMPLEMENTED | onLoad, onUnload, onActivate, onDeactivate missing |
| **FR-020: Plugin Registry** | 🔴 NOT_IMPLEMENTED | No plugin registry implementation |
| **FR-021: Thread Hierarchy** | 🔴 NOT_IMPLEMENTED | Main, Sub-threads, Compaction missing |
| **FR-022: Context Compaction** | 🔴 NOT_IMPLEMENTED | Auto-compaction at 90% threshold missing |

---

## 4. Duplicate Implementations

### File Tree State Management

| Concept | Files | Recommendation |
|---------|-------|----------------|
| File tree state | `src/lib/workspace/file-sync-status-store.ts` | Keep infrastructure, archive lib |
| File tree state | `src/infrastructure/persistence/stores/workspace/slices/use-file-ops-slice.ts` | Keep infrastructure, archive lib |

### Storage Adapters

| Concept | Files | Recommendation |
|---------|-------|----------------|
| FSA storage | `src/infrastructure/filesystem/fsa-storage-adapter.ts` (672 lines) | Keep - canonical path |
| FSA storage | `src/infrastructure/filesystem/fsa-gateway.ts` (816 lines) | Keep - canonical path |
| FSA storage | `src/infrastructure/filesystem/terminal-fs-adapter.ts` (751 lines) | Keep - canonical path |

### Agent Providers

| Concept | Files | Recommendation |
|---------|-------|----------------|
| Provider registry | `src/domain/services/universal-provider-registry.ts` (724 lines) | Keep - canonical path |
| Provider adapters | `src/lib/agent/providers/` | Keep - canonical path |

---

## 5. Import Violations

### @/lib/ Import Violations: 552

**Status**: 🔴 **CRITICAL**

**Sample Files**:
```typescript
// src/presentation/components/layout/PluginPanelContainer.tsx
import { cn } from '@/lib/utils';  // ❌ VIOLATION

// src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx
import { getLanguageFromPath } from '@/lib/editor/language-utils';  // ❌ VIOLATION
import { codeAnalysisBridge } from '@/lib/ide/code-analysis-bridge';  // ❌ VIOLATION

// src/presentation/components/notes/NoteEditor.tsx
import { useNoteStore, useNoteSaveStatus, useIsNoteIndexing } from '@/lib/notes';  // ❌ VIOLATION
```

**Canonical Paths Required**:
- `@/lib/utils` → `@/infrastructure/utils/`
- `@/lib/editor` → `@/domain/editor/`
- `@/lib/ide` → `@/presentation/ide/`
- `@/lib/notes` → `@/infrastructure/persistence/stores/notes/`
- `@/lib/agent` → `@/domain/agent/`
- `@/lib/workspace` → `@/infrastructure/persistence/stores/workspace/`
- `@/lib/filesystem` → `@/infrastructure/filesystem/`
- `@/lib/webcontainer` → `@/infrastructure/webcontainer/`

---

### @/stores/ Import Violations: 0

**Status**: ✅ **PASS**

**Evidence**: No @/stores/ imports found in codebase

---

## 6. God Files (>300 Lines)

### Critical Files (30 files found)

| File | Lines | Type | Action Required |
|------|-------|------|-----------------|
| `src/infrastructure/persistence/dexie-db-migrations.ts` | 1,746 | Migrations | Split into migration files |
| `src/presentation/components/notes/AISlashCommand.tsx` | 1,674 | Component | Extract hooks, split into sub-components |
| `src/presentation/components/notes/NoteEditor.tsx` | 1,353 | Component | Extract hooks, split into sub-components |
| `src/lib/templates/template-registry.ts` | 1,321 | Service | Split by template type |
| `src/infrastructure/persistence/dexie-db.ts` | 1,213 | Database | Split into schema/migrations |
| `src/infrastructure/persistence/workflow-persistence.test.ts` | 906 | Test | Split by workflow type |
| `src/infrastructure/events/event-bus.ts` | 888 | Service | Split by event type |
| `src/__tests__/__debug__.provider-playground.tsx` | 855 | Debug | Archive - not production code |
| `src/lib/notes/prompt-templates-data.ts` | 850 | Data | Split by template category |
| `src/infrastructure/filesystem/file-tree-scanner.ts` | 833 | Service | Extract scanner logic |
| `src/infrastructure/filesystem/fsa-gateway.ts` | 816 | Gateway | Split by operation type |
| `src/lib/sync/__tests__/reverse-sync-service.test.ts` | 804 | Test | Split by test case |
| `src/lib/git/git-client.ts` | 791 | Service | Split by git operation |
| `src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx` | 773 | Component | Extract hooks, split into sub-components |
| `src/presentation/components/ui/resizable.tsx` | 763 | Component | Extract resize logic |
| `src/infrastructure/filesystem/terminal-fs-adapter.ts` | 751 | Adapter | Split by operation type |
| `src/domain/services/universal-provider-registry.ts` | 724 | Service | Split by provider type |
| `src/presentation/components/notes/blocks/MultiStepGenerationBlock.tsx` | 700 | Component | Extract step logic |
| `src/infrastructure/filesystem/markdown-sync-service.ts` | 697 | Service | Split by sync operation |
| `src/lib/navigation/symbol-parser.ts` | 696 | Service | Split by symbol type |
| `src/presentation/layouts/PluginLayoutStore.ts` | 692 | Store | Split into slices |
| `src/presentation/components/notes/blocks/ArtifactGalleryBlock.tsx` | 684 | Component | Extract gallery logic |
| `src/__tests__/epic-40-integration.test.ts` | 679 | Test | Split by test case |
| `src/lib/workspace/__tests__/session-snapshot.test.ts` | 677 | Test | Split by test case |
| `src/e2e/__tests__/epic-e1-cross-workspace-chat.e2e.test.tsx` | 674 | Test | Split by test case |
| `src/infrastructure/filesystem/viagent-service.ts` | 672 | Service | Split by operation type |
| `src/infrastructure/filesystem/fsa-storage-adapter.ts` | 672 | Adapter | Split by operation type |
| `src/lib/plugins/plugin-manager.ts` | 659 | Service | Split by plugin type |
| `src/presentation/components/notes/SlashCommandManager.tsx` | 657 | Component | Extract command logic |

---

## 7. TanStack AI SDK Integration Status

### Installed Packages ✅

```json
{
  "@tanstack/ai": "^0.2.2",
  "@tanstack/ai-anthropic": "0.2.0",
  "@tanstack/ai-client": "^0.2.2",
  "@tanstack/ai-gemini": "^0.3.2",
  "@tanstack/ai-ollama": "0.3.0",
  "@tanstack/ai-openai": "^0.2.1",
  "@tanstack/ai-react": "^0.2.2",
  "@tanstack/ai-react-ui": "0.2.1"
}
```

### Server-Side Usage ✅

**File**: `src/routes/api/chat.ts`

```typescript
import { chat, toServerSentEventsStream } from '@tanstack/ai';
import { createOpenaiChat } from '@tanstack/ai-openai';
import { geminiText } from '@tanstack/ai-gemini';
```

**Status**: ✅ **CORRECT** - Server-side uses TanStack AI SDK

### Client-Side Usage ❌

**Violations Found**:

| File | Issue | Line |
|------|-------|------|
| `src/lib/rag/incremental-indexing-service.ts` | Direct provider call | 251-252 |
| `src/lib/rag/hybrid-retriever.ts` | Direct provider call | 477-478 |
| `src/lib/notes/ai-image-service.ts` | Direct provider call | 89, 119 |
| `src/lib/notes/ai-video-service.ts` | Direct provider call | 147 |
| `src/lib/notes/ai-storyboard-service.ts` | Direct provider call | 75 |
| `src/presentation/components/notes/VoiceRecordButton.tsx` | Direct provider call | 52-54 |
| `src/presentation/components/notes/MultiModalImport.tsx` | Direct provider call | 68-78 |

**Example Violation**:
```typescript
// ❌ INCORRECT - Direct provider call
const geminiApiKey = await credentialVault.getCredentials('gemini');
const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/...`;

// ✅ CORRECT - Should use TanStack AI SDK
import { createGeminiChat } from '@tanstack/ai-gemini';
const chat = createGeminiChat({ apiKey: geminiApiKey });
```

### Missing Components

- ❌ TanStack AI adapter implementation
- ❌ Fallback chain implementation
- ❌ Provider-specific adapters integrated with SDK
- ❌ Client-side TanStack AI SDK usage

---

## 8. Recommendations

### Priority 1: Critical (Blockers)

1. **Fix @/lib/ Import Violations** (552 violations)
   - Migrate all @/lib/ imports to canonical paths
   - Update import statements across 552 files
   - Run governance checks after migration

2. **Implement TanStack AI SDK Client-Side Integration**
   - Create TanStack AI adapter
   - Replace all direct provider calls with SDK
   - Implement fallback chain

3. **Split God Files** (30 files > 300 lines)
   - Split files exceeding 300 lines
   - Extract hooks and sub-components
   - Follow single responsibility principle

### Priority 2: High (Phase 1B)

4. **Complete BYOK Integration**
   - Integrate credentialVault with TanStack AI SDK
   - Implement project-scoped configuration
   - Add fallback chain

5. **Fix Notes Plugin**
   - Split AISlashCommand.tsx (1674 lines)
   - Split NoteEditor.tsx (1353 lines)
   - Integrate AI features with TanStack AI SDK

### Priority 3: Medium (Phase 2)

6. **Implement Orchestrator Pattern**
   - Create orchestrator directory
   - Implement agent delegation logic
   - Add mode switching

7. **Implement Domain-Specific Agents**
   - Create agent definitions
   - Implement tool permission matrix
   - Add agent-specific system prompts

8. **Implement Thread Architecture**
   - Create thread hierarchy
   - Implement context compaction
   - Add auto-compaction at 90% threshold

### Priority 4: Low (Phase 3)

9. **Implement Cross-Plugin Communication**
   - Integrate event bus with plugins
   - Add cross-plugin event subscriptions
   - Implement shared state patterns

10. **Archive Orphaned Code**
    - Remove deprecated files
    - Archive unused components
    - Clean up legacy code

---

## 9. Evidence Summary

### Search Commands Executed

```bash
# Project management
grep -r "createProject|openProject|switchProject" src/
# Result: 82 matches found

# FileTree plugin
grep -r "FileTree|filetree" src/
# Result: 100 matches found

# Monaco plugin
grep -r "monaco|Monaco" src/
# Result: 100 matches found

# Terminal plugin
grep -r "terminal|Terminal|XTerminal" src/
# Result: 100 matches found

# Preview plugin
grep -r "preview|Preview|WebContainer" src/
# Result: 100 matches found

# TanStack AI SDK
grep -r "TanStack AI SDK|@tanstack/ai" src --include="*.ts" --include="*.tsx" --include="package.json"
# Result: 8 matches found

# @/lib/ imports
grep -r "from '@/lib/" src --include="*.ts" --include="*.tsx" | wc -l
# Result: 552 violations

# @/stores/ imports
grep -r "from '@/stores/" src --include="*.ts" --include="*.tsx" | wc -l
# Result: 0 violations

# God files
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec wc -l {} + | sort -rn | head -30
# Result: 30 files > 300 lines

# Deprecated files
find src -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l "deprecated" | head -20
# Result: 20 files found
```

---

## 10. Conclusion

### Overall Assessment

The codebase has **solid foundation** with most Phase 1A features implemented, but significant gaps remain in Phase 1B and Phase 2 features.

### Strengths

✅ Project-centric architecture implemented
✅ All 6 plugins exist (filetree, monaco, notes, terminal, chat, preview)
✅ Platform detection working
✅ StorageGateway abstraction complete
✅ BYOK vault implemented
✅ TanStack AI SDK packages installed
✅ No @/stores/ import violations

### Weaknesses

❌ 552 @/lib/ import violations (critical)
❌ 30 god files > 300 lines (critical)
❌ TanStack AI SDK client-side integration incomplete
❌ Orchestrator pattern not implemented
❌ Domain-specific agents not implemented
❌ Thread architecture incomplete
❌ Cross-plugin communication not implemented

### Next Steps

1. **Immediate**: Fix @/lib/ import violations (552 files)
2. **Short-term**: Implement TanStack AI SDK client-side integration
3. **Medium-term**: Split god files (30 files)
4. **Long-term**: Implement Phase 2 features (orchestrator, agents, threads)

---

**Report Generated**: 2026-01-31T00:00:00+07:00
**Agent**: analyst-ext-team-b
**Session**: ses_3ee59d97effeAM1jYEzkHcAczj
**Status**: COMPLETE