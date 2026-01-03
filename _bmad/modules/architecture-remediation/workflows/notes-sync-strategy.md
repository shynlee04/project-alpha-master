---
name: notes-sync-strategy
description: Implement local filesystem sync for Notes workspace
version: 1.0.0
created: 2026-01-04
agents: [file-sync-specialist]
workspace: notes
---

# Notes Sync Strategy Workflow

// turbo-all

## Overview

Implement bidirectional sync between Notes (IndexedDB) and local .md files.

## Target Structure

```
{sync-directory}/
├── {folder-name}/
│   ├── {note-title}.md
│   └── {note-title}.md
└── .sync-metadata.json
```

## Note File Format

```markdown
---
id: {uuid}
title: {title}
created: {ISO}
modified: {ISO}
folder: {path}
tags: [{tags}]
---

{content}
```

## Step 1: Create Sync Store

File: `src/stores/notes-sync-store.ts`

State:
- `syncEnabled: boolean`
- `syncDirectory: FileSystemDirectoryHandle | null`
- `syncItems: Record<id, SyncMetadata>`
- `isSyncing: boolean`
- `conflicts: ConflictData[]`

Actions:
- `enableSync(directory)`
- `disableSync()`
- `syncNote(id)`
- `syncAll()`
- `resolveConflict(id, resolution)`

## Step 2: Implement Sync Engine

```typescript
async function syncNote(note: Note, handle: FileSystemDirectoryHandle) {
  const fileName = sanitizeFileName(note.title) + '.md';
  const folderHandle = await getOrCreateFolder(handle, note.folder);
  
  // Check for conflicts
  const existing = await readFileIfExists(folderHandle, fileName);
  if (existing && existing.modified > note.localModified) {
    return { status: 'conflict', local: note, remote: existing };
  }
  
  // Write file
  const content = noteToMarkdown(note);
  await writeFile(folderHandle, fileName, content);
  return { status: 'synced' };
}
```

## Step 3: Create UI Components

### SyncStatusIndicator
- Shows sync state (synced/pending/conflict)
- Location: note list, editor header

### SyncSettingsPanel
- Enable/disable sync
- Select sync directory
- View sync history

### ConflictResolutionDialog
- Compare versions
- Choose resolution

## Step 4: Integrate with Notes Store

```typescript
// In notes-store.ts
// After note save:
if (syncStore.getState().syncEnabled) {
  syncStore.getState().syncNote(note.id);
}
```

## Quality Gates

- [ ] Sync toggle works
- [ ] Notes sync to .md files
- [ ] Folder structure preserved
- [ ] Conflicts detected
- [ ] Resolution UI works
- [ ] Offline changes queued

## Handoff

```markdown
## NOTES SYNC COMPLETE
Store: notes-sync-store.ts ✅
UI: SyncStatusIndicator ✅
UI: ConflictResolutionDialog ✅
Integration: notes-store.ts ✅
```
