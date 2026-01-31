---
name: knowledge-sync-strategy
description: Implement source import sync for Knowledge workspace
version: 1.0.0
created: 2026-01-04
agents: [file-sync-specialist]
workspace: knowledge
---

# Knowledge Sync Strategy Workflow

// turbo-all

## Overview

Implement one-way import sync from local source files to Knowledge workspace.

## Target Structure

```
{source-directory}/
├── .import-manifest.json
├── documents/
│   ├── *.pdf
│   ├── *.md
│   └── *.txt
└── exports/
    └── {vault}/
        └── *.md
```

## Step 1: Create Import Store

File: `src/stores/knowledge-import-store.ts`

State:
- `importDirectory: FileSystemDirectoryHandle | null`
- `importedFiles: Record<path, ImportMetadata>`
- `isImporting: boolean`
- `importQueue: string[]`

Actions:
- `setImportDirectory(handle)`
- `scanForNewFiles()`
- `importFile(path)`
- `importAll()`
- `getImportStatus(path)`

## Step 2: Import Engine

```typescript
async function importFile(
  handle: FileSystemDirectoryHandle, 
  path: string
): Promise<ImportResult> {
  const file = await getFile(handle, path);
  const content = await file.text();
  
  // Add to knowledge vault
  const sourceId = await vaultStore.addSource({
    title: file.name,
    content,
    type: getFileType(file.name),
    importedFrom: path,
    importedAt: Date.now(),
  });
  
  // Trigger RAG indexing
  await ragStore.indexSource(sourceId);
  
  return { status: 'imported', sourceId };
}
```

## Step 3: Duplicate Detection

```typescript
function isDuplicate(path: string, content: string): boolean {
  const existing = importStore.importedFiles[path];
  if (!existing) return false;
  
  // Check content hash
  const hash = computeHash(content);
  return hash === existing.contentHash;
}
```

## Step 4: UI Components

### ImportDirectorySelector
- Choose source directory
- Show file count

### ImportProgressPanel
- Show import queue
- Progress indicator

### SourceImportList
- List imported sources
- Re-import option

## Step 5: Optional Export

```typescript
async function exportVault(
  vault: Vault, 
  handle: FileSystemDirectoryHandle
) {
  const exportDir = await handle.getDirectoryHandle('exports', { create: true });
  const vaultDir = await exportDir.getDirectoryHandle(vault.name, { create: true });
  
  for (const item of vault.items) {
    const content = itemToMarkdown(item);
    await writeFile(vaultDir, `${item.title}.md`, content);
  }
}
```

## Quality Gates

- [ ] Directory selection works
- [ ] New files detected
- [ ] Import triggers RAG indexing
- [ ] Duplicates skipped
- [ ] Import status visible
- [ ] Export works (optional)

## Handoff

```markdown
## KNOWLEDGE SYNC COMPLETE
Store: knowledge-import-store.ts ✅
Import engine: ✅
Duplicate detection: ✅
UI components: ✅
RAG integration: ✅
```
