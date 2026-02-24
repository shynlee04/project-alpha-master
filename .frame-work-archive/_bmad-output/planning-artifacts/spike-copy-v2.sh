#!/bin/bash
# Spike Core Files Copy Script - Version 2
# Uses correct file paths

set -e  # Exit on error

echo "🚀 Starting spike copy script v2..."

# Create spike directory structure
mkdir -p spike/routes/ide
mkdir -p spike/routes/notes
mkdir -p spike/routes/hub
mkdir -p spike/components/hub
mkdir -p spike/components/project
mkdir -p spike/components/workspace
mkdir -p spike/components/common
mkdir -p spike/components/ide/FileTree
mkdir -p spike/components/ide/AgentChatPanel
mkdir -p spike/components/notes/blocks
mkdir -p spike/components/notes/hooks
mkdir -p spike/context
mkdir -p spike/infrastructure/persistence
mkdir -p spike/infrastructure/persistence/stores
mkdir -p spike/infrastructure/persistence/stores/project
mkdir -p spike/infrastructure/persistence/stores/ide
mkdir -p spike/infrastructure/persistence/stores/notes
mkdir -p spike/infrastructure/filesystem
mkdir -p spike/lib/workspace
mkdir -p spike/lib/agent/tools
mkdir -p spike/lib/agent/preferences
mkdir -p spike/lib/sync
mkdir -p spike/types
mkdir -p spike/presentation

echo "📁 Created spike directory structure"

# === 1. PROJECT SPACE MATRIX ===
echo "📦 Copying project space matrix..."

# Route guards (EXACT PATHS)
cp src/routes/ide.tsx spike/routes/ide/ 2>/dev/null || echo "⚠️  src/routes/ide.tsx not found"
cp src/routes/ide.$projectId.tsx spike/routes/ide/ 2>/dev/null || echo "⚠️  src/routes/ide.\$projectId.tsx not found"
cp src/routes/notes.lazy.tsx spike/routes/notes/ 2>/dev/null || echo "⚠️  src/routes/notes.lazy.tsx not found"
cp src/routes/notes.$projectId.lazy.tsx spike/routes/notes/ 2>/dev/null || echo "⚠️  src/routes/notes.\$projectId.lazy.tsx not found"
cp src/routes/__root.tsx spike/routes/ 2>/dev/null || echo "⚠️  src/routes/__root.tsx not found"
cp src/routes/hub.tsx spike/routes/hub.tsx 2>/dev/null || echo "⚠️  src/routes/hub.tsx not found"

# Platform detection
cp src/infrastructure/filesystem/platform-contract.ts spike/infrastructure/filesystem/ 2>/dev/null || echo "⚠️  platform-contract.ts not found"

# Hub components
cp src/presentation/components/hub/*.tsx spike/components/hub/ 2>/dev/null || echo "⚠️  hub components not found"

# Workspace navigation
cp src/presentation/components/common/WorkspaceSwitcher.tsx spike/components/common/ 2>/dev/null || echo "⚠️  WorkspaceSwitcher.tsx not found"
cp src/presentation/components/layout/MainSidebar.tsx spike/components/ 2>/dev/null || echo "⚠️  MainSidebar.tsx not found"

# Project CRUD (infrastructure/persistence)
cp src/infrastructure/persistence/dexie-db.ts spike/infrastructure/persistence/ 2>/dev/null || echo "⚠️  dexie-db.ts not found"
cp src/infrastructure/persistence/stores/project/*.ts spike/infrastructure/persistence/stores/project/ 2>/dev/null || echo "⚠️  project stores not found"
cp src/infrastructure/persistence/stores/ide/*.ts spike/infrastructure/persistence/stores/ide/ 2>/dev/null || echo "⚠️  ide stores not found"
cp src/infrastructure/persistence/stores/notes/*.ts spike/infrastructure/persistence/stores/notes/ 2>/dev/null || echo "⚠️  notes stores not found"

# Project creation wizard
cp src/presentation/components/project/*.tsx spike/components/project/ 2>/dev/null || echo "⚠️  project components not found"

# Project context
cp src/lib/workspace/ProjectContext.tsx spike/lib/workspace/ 2>/dev/null || echo "⚠️  ProjectContext.tsx not found"
cp src/lib/workspace/*.ts spike/lib/workspace/ 2>/dev/null || echo "⚠️  workspace lib files not found"

# === 2. IDE EDITOR ===
echo "💻 Copying IDE components..."

cp src/presentation/components/ide/*.tsx spike/components/ide/ 2>/dev/null || echo "⚠️  ide components not found"
cp src/presentation/components/ide/FileTree/*.tsx spike/components/ide/FileTree/ 2>/dev/null || echo "⚠️  FileTree components not found"
cp src/presentation/components/ide/AgentChatPanel/*.tsx spike/components/ide/AgentChatPanel/ 2>/dev/null || echo "⚠️  AgentChatPanel not found"

# === 3. NOTES EDITOR ===
echo "📝 Copying Notes components..."

cp src/presentation/components/notes/*.tsx spike/components/notes/ 2>/dev/null || echo "⚠️  notes components not found"
cp src/presentation/components/notes/blocks/*.tsx spike/components/notes/blocks/ 2>/dev/null || echo "⚠️  notes blocks not found"
cp src/presentation/components/notes/hooks/*.ts spike/components/notes/hooks/ 2>/dev/null || echo "⚠️  notes hooks not found"

# === 4. AGENTS & TOOLS ===
echo "🤖 Copying agents & tools..."

cp src/lib/agent/*.ts spike/lib/agent/ 2>/dev/null || echo "⚠️  agent lib files not found"
cp src/lib/agent/tools/*.ts spike/lib/agent/tools/ 2>/dev/null || echo "⚠️  agent tools not found"
cp src/lib/agent/preferences/*.ts spike/lib/agent/preferences/ 2>/dev/null || echo "⚠️  agent preferences not found"
cp src/presentation/components/agent/*.tsx spike/components/ 2>/dev/null || echo "⚠️  agent components not found"

# === 5. SYNC ===
echo "🔄 Copying sync..."

cp src/lib/workspace/file-sync-status-store/*.ts spike/lib/workspace/ 2>/dev/null || echo "⚠️  file-sync-status-store not found"
cp src/lib/sync/*.ts spike/lib/sync/ 2>/dev/null || echo "⚠️  sync lib files not found"
cp src/presentation/components/sync/*.tsx spike/components/ 2>/dev/null || echo "⚠️  sync components not found"

# === 6. TYPES ===
echo "📋 Copying types..."

cp src/types/*.ts spike/types/ 2>/dev/null || echo "⚠️  types not found"

echo ""
echo "========================================"
echo "✅ Spike copy v2 complete!"
echo "========================================"
echo ""
echo "Files copied to: spike/"
echo ""
echo "Next steps:"
echo "1. ls -la spike/ to see what was copied"
echo "2. pnpm tsc --noEmit to check compilation"
echo "3. pnpm dev to test"
echo ""
