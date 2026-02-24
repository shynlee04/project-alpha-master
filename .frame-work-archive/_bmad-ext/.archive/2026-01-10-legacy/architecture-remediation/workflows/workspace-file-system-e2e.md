---
name: workspace-file-system-e2e
description: End-to-end workspace file system implementation
version: 1.0.0
created: 2026-01-04
agents: [workspace-architect, file-sync-specialist]
workspaces: [ide, notes, knowledge]
---

# Workspace File System E2E Workflow

// turbo-all

## Overview

Implement complete file system functionality from UI to persistence for each workspace.

## Workspace Priority

1. **IDE** - Harden permissions (already functional)
2. **Notes** - Implement local sync
3. **Knowledge** - Implement source import sync

## E2E Layers

```
UI Component → Hook → Store → Persistence → Sync (optional)
```

## Step 1: Analyze Current State

For each workspace, evaluate:

```bash
# Find workspace components
grep -rn "workspace.*{type}" src/components/

# Find workspace stores
grep -rn "Store" src/stores/ | grep -i "{workspace}"

# Check persistence layer
grep -rn "Dexie\|IndexedDB" src/infrastructure/
```

## Step 2: E2E Validation Checklist

### UI Layer
- [ ] Component renders without errors
- [ ] Loading/error states displayed
- [ ] User actions trigger handlers

### Hook Layer
- [ ] Returns correct data shape
- [ ] Handles loading/error states
- [ ] Triggers store actions

### Store Layer
- [ ] Actions modify state correctly
- [ ] Selectors return expected data
- [ ] Persistence integration works

### Persistence Layer
- [ ] Data persists to IndexedDB
- [ ] Data loads on app start
- [ ] Error handling for failures

### Sync Layer (if applicable)
- [ ] Changes propagate correctly
- [ ] Conflicts detected
- [ ] Offline changes queued

## Step 3: IDE Hardening

Focus areas:
- File System Access API permission handling
- WebContainer error recovery
- Terminal permission safety

```typescript
// Permission request pattern
async function requestAccess(mode: 'read' | 'readwrite') {
  try {
    if (!('showDirectoryPicker' in window)) {
      return null; // Fallback mode
    }
    const handle = await window.showDirectoryPicker({ mode });
    return handle;
  } catch (e) {
    if (e.name === 'AbortError') return null;
    throw e;
  }
}
```

## Step 4: Notes Sync Implementation

Create: `src/stores/notes-sync-store.ts`

Key features:
- Bidirectional sync with local .md files
- Folder structure preservation
- Conflict resolution UI

## Step 5: Knowledge Import Implementation

Key features:
- One-way import (local → IndexedDB)
- Import manifest tracking
- Duplicate detection

## Quality Gates

### Permission Safety
- [ ] No requests without user action
- [ ] Denials handled gracefully
- [ ] Fallback to IndexedDB works

### E2E Completeness
- [ ] All UI actions reach persistence
- [ ] All persistence changes reflect in UI
- [ ] Loading/error always visible

## Handoff

```markdown
## WORKSPACE E2E COMPLETE
Workspace: {type}
Layers validated: 5/5
Permission hardening: ✅
Sync implementation: {yes/no}
```
