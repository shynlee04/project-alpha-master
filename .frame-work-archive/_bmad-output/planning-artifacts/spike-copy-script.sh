#!/bin/bash
# Spike Core Files Copy Script
# Purpose: Copy all core code parts to spike for isolation and debugging

set -e  # Exit on error

echo "🚀 Starting spike copy script..."

# Create spike directory structure
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

echo "📁 Created spike directory structure"

# === 1. PROJECT SPACE MATRIX ===
echo "📦 Copying project space matrix..."

# Route guards
cp src/routes/ide.tsx spike/routes/ide/ide-guard.tsx 2>/dev/null || echo "⚠️  src/routes/ide.tsx not found"
cp src/routes/ide.$projectId.tsx spike/routes/ide/ide-loader.tsx 2>/dev/null || echo "⚠️  src/routes/ide.$projectId.tsx not found"
cp src/routes/notes.lazy.tsx spike/routes/notes/notes-base.tsx 2>/dev/null || echo "⚠️  src/routes/notes.lazy.tsx not found"
cp src/routes/notes.$projectId.lazy.tsx spike/routes/notes/notes-loader.tsx 2>/dev/null || echo "⚠️  src/routes/notes.$projectId.lazy.tsx not found"
cp src/routes/__root.tsx spike/routes/root.tsx 2>/dev/null || echo "⚠️  src/routes/__root.tsx not found"
cp src/routes/hub.tsx spike/routes/hub.tsx 2>/dev/null || echo "⚠️  src/routes/hub.tsx not found"

# Platform detection
cp src/infrastructure/filesystem/platform-contract.ts spike/infrastructure/platform-contract.ts 2>/dev/null || echo "⚠️  platform-contract.ts not found"

# Project picker
cp src/presentation/components/hub/ProjectPickerDialog.tsx spike/components/hub/ProjectPickerDialog.tsx 2>/dev/null || echo "⚠️  ProjectPickerDialog.tsx not found"
cp src/presentation/components/hub/HubHomePage.tsx spike/components/hub/HubHomePage.tsx 2>/dev/null || echo "⚠️  HubHomePage.tsx not found"

# Workspace navigation
cp src/presentation/components/common/WorkspaceSwitcher.tsx spike/components/WorkspaceSwitcher.tsx 2>/dev/null || echo "⚠️  WorkspaceSwitcher.tsx not found"
cp src/presentation/components/layout/MainSidebar.tsx spike/components/MainSidebar.tsx 2>/dev/null || echo "⚠️  MainSidebar.tsx not found"

# Project CRUD
cp src/infrastructure/persistence/stores/project/useProjectStore.ts spike/stores/project-store.ts 2>/dev/null || echo "⚠️  useProjectStore.ts not found"
cp src/infrastructure/persistence/stores/project/project-types.ts spike/types/project-types.ts 2>/dev/null || echo "⚠️  project-types.ts not found"
cp src/infrastructure/persistence/dexie-db.ts spike/infrastructure/dexie-db.ts 2>/dev/null || echo "⚠️  dexie-db.ts not found"
cp src/presentation/components/project/ProjectCreationWizard.tsx spike/components/project/Wizard.tsx 2>/dev/null || echo "⚠️  ProjectCreationWizard.tsx not found"
cp src/lib/workspace/ProjectContext.tsx spike/context/ProjectContext.tsx 2>/dev/null || echo "⚠️  ProjectContext.tsx not found"

# === 2. BYOK - VAULT ===
echo "🔐 Copying BYOK/vault..."

cp src/infrastructure/persistence/stores/vault/vault-store.ts spike/stores/vault-store.ts 2>/dev/null || echo "⚠️  vault-store.ts not found"
cp src/infrastructure/persistence/stores/vault/vault-types.ts spike/types/vault-types.ts 2>/dev/null || echo "⚠️  vault-types.ts not found"
cp src/lib/vault/vault-helpers.ts spike/lib/vault-helpers.ts 2>/dev/null || echo "⚠️  vault-helpers.ts not found"
cp src/presentation/components/vault/VaultDialog.tsx spike/components/vault/VaultDialog.tsx 2>/dev/null || echo "⚠️  VaultDialog.tsx not found"

# === 3. CRUD PERMISSIONS ===
echo "🛡️ Copying CRUD permissions..."

cp src/domain/services/permissions.ts spike/services/permissions.ts 2>/dev/null || echo "⚠️  permissions.ts not found"
cp src/infrastructure/persistence/stores/permissions/permission-store.ts spike/stores/permission-store.ts 2>/dev/null || echo "⚠️  permission-store.ts not found"
cp src/lib/auth/auth-helpers.ts spike/lib/auth-helpers.ts 2>/dev/null || echo "⚠️  auth-helpers.ts not found"
cp src/presentation/components/auth/PermissionGuard.tsx spike/components/auth/PermissionGuard.tsx 2>/dev/null || echo "⚠️  PermissionGuard.tsx not found"

# File CRUD
cp src/domain/services/file-service.ts spike/services/file-service.ts 2>/dev/null || echo "⚠️  file-service.ts not found"
cp src/infrastructure/persistence/stores/files/file-store.ts spike/stores/file-store.ts 2>/dev/null || echo "⚠️  file-store.ts not found"
cp src/presentation/components/ide/FileOperations.tsx spike/components/ide/FileOperations.tsx 2>/dev/null || echo "⚠️  FileOperations.tsx not found"
cp src/lib/filesystem/file-helpers.ts spike/lib/file-helpers.ts 2>/dev/null || echo "⚠️  file-helpers.ts not found"

# === 4. FILE SYNC ===
echo "🔄 Copying file sync..."

cp src/infrastructure/persistence/stores/handle-persistence.ts spike/infrastructure/handle-persistence.ts 2>/dev/null || echo "⚠️  handle-persistence.ts not found"
cp src/infrastructure/filesystem/fsa-storage-adapter.ts spike/infrastructure/fsa-adapter.ts 2>/dev/null || echo "⚠️  fsa-storage-adapter.ts not found"
cp src/presentation/components/workspace/FolderPickerDialog.tsx spike/components/workspace/FolderPickerDialog.tsx 2>/dev/null || echo "⚠️  FolderPickerDialog.tsx not found"

cp src/lib/sync/sync-manager.ts spike/lib/sync-manager.ts 2>/dev/null || echo "⚠️  sync-manager.ts not found"
cp src/lib/sync/file-sync.ts spike/lib/file-sync.ts 2>/dev/null || echo "⚠️  file-sync.ts not found"
cp src/lib/sync/dexie-sync.ts spike/lib/dexie-sync.ts 2>/dev/null || echo "⚠️  dexie-sync.ts not found"
cp src/presentation/components/sync/SyncStatus.tsx spike/components/sync/SyncStatus.tsx 2>/dev/null || echo "⚠️  SyncStatus.tsx not found"

# === 5. AGENTS & LLMs ===
echo "🤖 Copying agents & LLMs..."

cp src/domain/services/agent-registry.ts spike/services/agent-registry.ts 2>/dev/null || echo "⚠️  agent-registry.ts not found"
cp src/domain/services/agent-orchestrator.ts spike/services/agent-orchestrator.ts 2>/dev/null || echo "⚠️  agent-orchestrator.ts not found"
cp src/infrastructure/agents/agent-store.ts spike/stores/agent-store.ts 2>/dev/null || echo "⚠️  agent-store.ts not found"
cp src/presentation/components/agents/AgentPanel.tsx spike/components/agents/AgentPanel.tsx 2>/dev/null || echo "⚠️  AgentPanel.tsx not found"

# Tools
cp src/domain/services/tool-registry.ts spike/services/tool-registry.ts 2>/dev/null || echo "⚠️  tool-registry.ts not found"
cp src/domain/services/tool-executor.ts spike/services/tool-executor.ts 2>/dev/null || echo "⚠️  tool-executor.ts not found"
cp src/infrastructure/agents/tools/base-tool.ts spike/agents/tools/base-tool.ts 2>/dev/null || echo "⚠️  base-tool.ts not found"
cp src/presentation/components/tools/ToolPanel.tsx spike/components/tools/ToolPanel.tsx 2>/dev/null || echo "⚠️  ToolPanel.tsx not found"

# === 6. RAG ===
echo "📚 Copying RAG..."

cp src/domain/services/rag-service.ts spike/services/rag-service.ts 2>/dev/null || echo "⚠️  rag-service.ts not found"
cp src/infrastructure/rag/vector-store.ts spike/infrastructure/vector-store.ts 2>/dev/null || echo "⚠️  vector-store.ts not found"
cp src/infrastructure/rag/embedding-service.ts spike/infrastructure/embedding-service.ts 2>/dev/null || echo "⚠️  embedding-service.ts not found"
cp src/lib/rag/rag-helpers.ts spike/lib/rag-helpers.ts 2>/dev/null || echo "⚠️  rag-helpers.ts not found"
cp src/presentation/components/rag/RagPanel.tsx spike/components/rag/RagPanel.tsx 2>/dev/null || echo "⚠️  RagPanel.tsx not found"

# === 7. EDITORS ===
echo "✏️ Copying editors..."

# Monaco
cp src/presentation/components/ide/MonacoEditor.tsx spike/components/ide/MonacoEditor.tsx 2>/dev/null || echo "⚠️  MonacoEditor.tsx not found"
cp src/presentation/components/ide/EditorTabs.tsx spike/components/ide/EditorTabs.tsx 2>/dev/null || echo "⚠️  EditorTabs.tsx not found"
cp src/presentation/components/ide/EditorContext.tsx spike/context/EditorContext.tsx 2>/dev/null || echo "⚠️  EditorContext.tsx not found"

# BlockNote
cp src/presentation/components/notes/BlockNoteEditor.tsx spike/components/notes/BlockNoteEditor.tsx 2>/dev/null || echo "⚠️  BlockNoteEditor.tsx not found"
cp src/presentation/components/notes/NotesSidebar.tsx spike/components/notes/NotesSidebar.tsx 2>/dev/null || echo "⚠️  NotesSidebar.tsx not found"
cp src/presentation/components/notes/NotesContext.tsx spike/context/NotesContext.tsx 2>/dev/null || echo "⚠️  NotesContext.tsx not found"

echo ""
echo "========================================"
echo "✅ Spike copy complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Verify TypeScript compiles: pnpm tsc --noEmit"
echo "2. Run spike dev server: pnpm dev"
echo "3. Test project space matrix"
echo "4. Document findings"
echo ""
