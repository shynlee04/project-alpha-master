# Spike Core Manifest - Isolating Project Space Architecture

**Date**: 2026-01-16
**Purpose**: Isolate ALL code parts contributing to core functionality
**Strategy**: Copy everything, fix later, smaller codebase for debugging

---

## 1. PROJECT SPACE MATRIX (PRIORITY 1)

### 1.1 Route Guards & Platform Detection

**Files to Copy**:
```
src/routes/ide.tsx                              → spike/routes/ide/ide-guard.tsx
src/routes/ide.$projectId.tsx                   → spike/routes/ide/ide-loader.tsx
src/routes/notes.lazy.tsx                       → spike/routes/notes/notes-base.tsx
src/routes/notes.$projectId.lazy.tsx            → spike/routes/notes/notes-loader.tsx
src/infrastructure/filesystem/platform-contract.ts → spike/infrastructure/platform-contract.ts
src/presentation/components/hub/ProjectPickerDialog.tsx → spike/components/hub/ProjectPickerDialog.tsx
src/presentation/components/hub/HubHomePage.tsx → spike/components/hub/HubHomePage.tsx
```

**Purpose**:
- Desktop vs Mobile detection
- IDE access guards (desktop only)
- Notes access (all platforms)
- Project picker logic
- Toast messages for blocked access

### 1.2 Project CRUD Operations

**Files to Copy**:
```
src/infrastructure/persistence/stores/project/useProjectStore.ts → spike/stores/project-store.ts
src/infrastructure/persistence/stores/project/project-types.ts → spike/types/project-types.ts
src/infrastructure/persistence/dexie-db.ts             → spike/infrastructure/dexie-db.ts
src/presentation/components/project/ProjectCreationWizard.tsx → spike/components/project/Wizard.tsx
src/lib/workspace/ProjectContext.tsx                  → spike/context/ProjectContext.tsx
```

**Purpose**:
- Create project
- Read project
- Update project
- Delete project
- Project state management

### 1.3 Workspace Navigation & Flow

**Files to Copy**:
```
src/routes/__root.tsx                           → spike/routes/root.tsx
src/routes/hub.tsx                              → spike/routes/hub.tsx
src/presentation/components/common/WorkspaceSwitcher.tsx → spike/components/WorkspaceSwitcher.tsx
src/presentation/components/layout/MainSidebar.tsx → spike/components/MainSidebar.tsx
```

**Purpose**:
- Workspace switching
- Sidebar navigation
- Root route configuration
- Hub page (project list)

---

## 2. BYOK - VAULT OF KEYS (PRIORITY 2)

### 2.1 Key Storage & Management

**Files to Copy**:
```
src/infrastructure/persistence/stores/vault/vault-store.ts → spike/stores/vault-store.ts
src/infrastructure/persistence/stores/vault/vault-types.ts → spike/types/vault-types.ts
src/lib/vault/vault-helpers.ts                     → spike/lib/vault-helpers.ts
src/presentation/components/vault/VaultDialog.tsx → spike/components/vault/VaultDialog.tsx
```

**Purpose**:
- Store API keys securely
- Retrieve keys for providers
- Conditional key usage
- Encryption/decryption

### 2.2 Provider Configuration

**Files to Copy**:
```
src/lib/providers/provider-config.ts             → spike/lib/provider-config.ts
src/lib/providers/provider-registry.ts           → spike/lib/provider-registry.ts
src/presentation/components/settings/ProviderSettings.tsx → spike/components/settings/ProviderSettings.tsx
```

**Purpose**:
- Provider configurations
- Provider registry
- Settings UI

---

## 3. CRUD PERMISSIONS (PRIORITY 3)

### 3.1 Permission Model

**Files to Copy**:
```
src/domain/services/permissions.ts              → spike/services/permissions.ts
src/infrastructure/persistence/stores/permissions/permission-store.ts → spike/stores/permission-store.ts
src/lib/auth/auth-helpers.ts                    → spike/lib/auth-helpers.ts
src/presentation/components/auth/PermissionGuard.tsx → spike/components/auth/PermissionGuard.tsx
```

**Purpose**:
- Human permissions
- AI agent permissions
- Role-based access control
- Permission guards

### 3.2 File CRUD Operations

**Files to Copy**:
```
src/domain/services/file-service.ts             → spike/services/file-service.ts
src/infrastructure/persistence/stores/files/file-store.ts → spike/stores/file-store.ts
src/presentation/components/ide/FileOperations.tsx → spike/components/ide/FileOperations.tsx
src/lib/filesystem/file-helpers.ts              → spike/lib/file-helpers.ts
```

**Purpose**:
- Create file
- Read file
- Update file
- Delete file
- File permissions

---

## 4. FILE SYNC (PRIORITY 4)

### 4.1 FSA Handle Persistence

**Files to Copy**:
```
src/infrastructure/persistence/stores/handle-persistence.ts → spike/infrastructure/handle-persistence.ts
src/infrastructure/filesystem/fsa-storage-adapter.ts → spike/infrastructure/fsa-adapter.ts
src/presentation/components/workspace/FolderPickerDialog.tsx → spike/components/workspace/FolderPickerDialog.tsx
```

**Purpose**:
- Store FSA handles
- Restore FSA handles
- Permission persistence
- Folder selection

### 4.2 Sync Manager

**Files to Copy**:
```
src/lib/sync/sync-manager.ts                    → spike/lib/sync-manager.ts
src/lib/sync/file-sync.ts                       → spike/lib/file-sync.ts
src/lib/sync/dexie-sync.ts                      → spike/lib/dexie-sync.ts
src/presentation/components/sync/SyncStatus.tsx → spike/components/sync/SyncStatus.tsx
```

**Purpose**:
- Sync Dexie ↔ FSA
- Conflict resolution
- Sync status tracking
- Auto-sync on change

---

## 5. AGENTS & LLMs (PRIORITY 5)

### 5.1 Agent Orchestration

**Files to Copy**:
```
src/domain/services/agent-registry.ts           → spike/services/agent-registry.ts
src/domain/services/agent-orchestrator.ts       → spike/services/agent-orchestrator.ts
src/infrastructure/agents/agent-store.ts        → spike/stores/agent-store.ts
src/presentation/components/agents/AgentPanel.tsx → spike/components/agents/AgentPanel.tsx
```

**Purpose**:
- Agent registration
- Agent orchestration
- Agent state management
- Agent UI panel

### 5.2 Tool Registry

**Files to Copy**:
```
src/domain/services/tool-registry.ts            → spike/services/tool-registry.ts
src/domain/services/tool-executor.ts            → spike/services/tool-executor.ts
src/infrastructure/agents/tools/base-tool.ts    → spike/agents/tools/base-tool.ts
src/presentation/components/tools/ToolPanel.tsx → spike/components/tools/ToolPanel.tsx
```

**Purpose**:
- Tool registration
- Tool execution
- Tool permissions
- Tool UI

---

## 6. RAG - RETRIEVAL AUGMENTED GENERATION (PRIORITY 6)

### 6.1 RAG Infrastructure

**Files to Copy**:
```
src/domain/services/rag-service.ts              → spike/services/rag-service.ts
src/infrastructure/rag/vector-store.ts          → spike/infrastructure/vector-store.ts
src/infrastructure/rag/embedding-service.ts     → spike/infrastructure/embedding-service.ts
src/lib/rag/rag-helpers.ts                      → spike/lib/rag-helpers.ts
src/presentation/components/rag/RagPanel.tsx    → spike/components/rag/RagPanel.tsx
```

**Purpose**:
- Vector storage
- Embedding generation
- RAG queries
- RAG UI panel

---

## 7. EDITORS (PRIORITY 7)

### 7.1 Monaco Editor (IDE)

**Files to Copy**:
```
src/presentation/components/ide/MonacoEditor.tsx → spike/components/ide/MonacoEditor.tsx
src/presentation/components/ide/EditorTabs.tsx   → spike/components/ide/EditorTabs.tsx
src/presentation/components/ide/EditorContext.tsx → spike/context/EditorContext.tsx
```

**Purpose**:
- Code editing
- Tab management
- Editor state

### 7.2 BlockNote Editor (Notes)

**Files to Copy**:
```
src/presentation/components/notes/BlockNoteEditor.tsx → spike/components/notes/BlockNoteEditor.tsx
src/presentation/components/notes/NotesSidebar.tsx   → spike/components/notes/NotesSidebar.tsx
src/presentation/components/notes/NotesContext.tsx   → spike/context/NotesContext.tsx
```

**Purpose**:
- Rich text editing
- Note sidebar
- Note state

---

## 8. COPY SCRIPT

```bash
#!/bin/bash
# Copy all core files to spike

mkdir -p spike/routes/ide
mkdir -p spike/routes/notes
mkdir -p spike/routes/hub
mkdir -p spike/components/hub
mkdir -p spike/components/project
mkdir -p spike/components/workspace
mkdir -p spike/components/common
mkdir -p spike/components/ide
mkdir -p spike/components/notes
mkdir -p spike/components/auth
mkdir -p spike/components/vault
mkdir -p spike/components/settings
mkdir -p spike/components/sync
mkdir -p spike/components/agents
mkdir -p spike/components/tools
mkdir -p spike/components/rag
mkdir -p spike/context
mkdir -p spike/stores
mkdir -p spike/stores/project
mkdir -p spike/stores/vault
mkdir -p spike/stores/permissions
mkdir -p spike/stores/files
mkdir -p spike/stores/agents
mkdir -p spike/infrastructure
mkdir -p spike/lib
mkdir -p spike/lib/vault
mkdir -p spike/lib/sync
mkdir -p spike/lib/rag
mkdir -p spike/lib/file-helpers
mkdir -p spike/services
mkdir -p spike/agents
mkdir -p spike/agents/tools
mkdir -p spike/types

# === 1. PROJECT SPACE MATRIX ===

# Route guards
cp src/routes/ide.tsx spike/routes/ide/ide-guard.tsx
cp src/routes/ide.$projectId.tsx spike/routes/ide/ide-loader.tsx
cp src/routes/notes.lazy.tsx spike/routes/notes/notes-base.tsx
cp src/routes/notes.$projectId.lazy.tsx spike/routes/notes/notes-loader.tsx
cp src/routes/__root.tsx spike/routes/root.tsx
cp src/routes/hub.tsx spike/routes/hub.tsx

# Platform detection
cp src/infrastructure/filesystem/platform-contract.ts spike/infrastructure/platform-contract.ts

# Project picker
cp src/presentation/components/hub/ProjectPickerDialog.tsx spike/components/hub/ProjectPickerDialog.tsx
cp src/presentation/components/hub/HubHomePage.tsx spike/components/hub/HubHomePage.tsx

# Workspace navigation
cp src/presentation/components/common/WorkspaceSwitcher.tsx spike/components/WorkspaceSwitcher.tsx
cp src/presentation/components/layout/MainSidebar.tsx spike/components/MainSidebar.tsx

# Project CRUD
cp src/infrastructure/persistence/stores/project/useProjectStore.ts spike/stores/project-store.ts
cp src/infrastructure/persistence/stores/project/project-types.ts spike/types/project-types.ts
cp src/infrastructure/persistence/dexie-db.ts spike/infrastructure/dexie-db.ts
cp src/presentation/components/project/ProjectCreationWizard.tsx spike/components/project/Wizard.tsx
cp src/lib/workspace/ProjectContext.tsx spike/context/ProjectContext.tsx

# === 2. BYOK - VAULT ===

cp src/infrastructure/persistence/stores/vault/vault-store.ts spike/stores/vault-store.ts
cp src/infrastructure/persistence/stores/vault/vault-types.ts spike/types/vault-types.ts
cp src/lib/vault/vault-helpers.ts spike/lib/vault-helpers.ts
cp src/presentation/components/vault/VaultDialog.tsx spike/components/vault/VaultDialog.tsx

# === 3. CRUD PERMISSIONS ===

cp src/domain/services/permissions.ts spike/services/permissions.ts
cp src/infrastructure/persistence/stores/permissions/permission-store.ts spike/stores/permission-store.ts
cp src/lib/auth/auth-helpers.ts spike/lib/auth-helpers.ts
cp src/presentation/components/auth/PermissionGuard.tsx spike/components/auth/PermissionGuard.tsx

# File CRUD
cp src/domain/services/file-service.ts spike/services/file-service.ts
cp src/infrastructure/persistence/stores/files/file-store.ts spike/stores/file-store.ts
cp src/presentation/components/ide/FileOperations.tsx spike/components/ide/FileOperations.tsx
cp src/lib/filesystem/file-helpers.ts spike/lib/file-helpers.ts

# === 4. FILE SYNC ===

cp src/infrastructure/persistence/stores/handle-persistence.ts spike/infrastructure/handle-persistence.ts
cp src/infrastructure/filesystem/fsa-storage-adapter.ts spike/infrastructure/fsa-adapter.ts
cp src/presentation/components/workspace/FolderPickerDialog.tsx spike/components/workspace/FolderPickerDialog.tsx

cp src/lib/sync/sync-manager.ts spike/lib/sync-manager.ts
cp src/lib/sync/file-sync.ts spike/lib/file-sync.ts
cp src/lib/sync/dexie-sync.ts spike/lib/dexie-sync.ts
cp src/presentation/components/sync/SyncStatus.tsx spike/components/sync/SyncStatus.tsx

# === 5. AGENTS & LLMs ===

cp src/domain/services/agent-registry.ts spike/services/agent-registry.ts
cp src/domain/services/agent-orchestrator.ts spike/services/agent-orchestrator.ts
cp src/infrastructure/agents/agent-store.ts spike/stores/agent-store.ts
cp src/presentation/components/agents/AgentPanel.tsx spike/components/agents/AgentPanel.tsx

# Tools
cp src/domain/services/tool-registry.ts spike/services/tool-registry.ts
cp src/domain/services/tool-executor.ts spike/services/tool-executor.ts
cp src/infrastructure/agents/tools/base-tool.ts spike/agents/tools/base-tool.ts
cp src/presentation/components/tools/ToolPanel.tsx spike/components/tools/ToolPanel.tsx

# === 6. RAG ===

cp src/domain/services/rag-service.ts spike/services/rag-service.ts
cp src/infrastructure/rag/vector-store.ts spike/infrastructure/vector-store.ts
cp src/infrastructure/rag/embedding-service.ts spike/infrastructure/embedding-service.ts
cp src/lib/rag/rag-helpers.ts spike/lib/rag-helpers.ts
cp src/presentation/components/rag/RagPanel.tsx spike/components/rag/RagPanel.tsx

# === 7. EDITORS ===

# Monaco
cp src/presentation/components/ide/MonacoEditor.tsx spike/components/ide/MonacoEditor.tsx
cp src/presentation/components/ide/EditorTabs.tsx spike/components/ide/EditorTabs.tsx
cp src/presentation/components/ide/EditorContext.tsx spike/context/EditorContext.tsx

# BlockNote
cp src/presentation/components/notes/BlockNoteEditor.tsx spike/components/notes/BlockNoteEditor.tsx
cp src/presentation/components/notes/NotesSidebar.tsx spike/components/notes/NotesSidebar.tsx
cp src/presentation/components/notes/NotesContext.tsx spike/context/NotesContext.tsx

echo "✅ All core files copied to spike/"
```

---

## 9. DOCUMENTATION TEMPLATE

For each copied file, create `SPIKE-DOC.md`:

```markdown
# File: [filename]

## Source
`src/[original-path]`

## Purpose
What this file does

## Dependencies
- Other spike files it depends on
- External packages

## Issues Known
- [ ] Issue 1
- [ ] Issue 2

## Testing Needed
- [ ] Test 1
- [ ] Test 2
```

---

## 10. VALIDATION CHECKLIST

After copying, verify:

- [ ] All files copied without errors
- [ ] TypeScript compiles (0 errors)
- [ ] All imports resolve
- [ ] No missing dependencies
- [ ] Documentation created for each file
- [ ] Copy script runs without manual intervention

---

**Created**: 2026-01-16T15:00:00+07:00
**Next**: Execute copy script, verify, create documentation
