# Monaco + Notes FSA Synchronization Deep Dive

> **Date**: 2026-01-27
> **Author**: analyst-ext
> **Status**: INVESTIGATION COMPLETE
> **Severity**: P1 (High - Dual-Plugin Data Integrity Risk)

---

## Executive Summary

### Critical Bugs Found: 5

| Bug ID | Severity | Component | Summary |
|--------|----------|-----------|---------|
| **BUG-1** | **P0** | Notes | Missing write-lock acquisition before save |
| **BUG-2** | **P1** | Notes | No re-read from FSA on external FILE_UPDATED - stale reload |
| **BUG-3** | **P1** | Both | Race condition on simultaneous file selection |
| **BUG-4** | **P2** | Notes | External content not updating editor after initial load |
| **BUG-5** | **P2** | Coordination | activeDocument.content not synced after save |

### Impact Assessment

When Monaco and Notes are BOTH loaded and the user selects a `.md` file:
1. **Both plugins receive the same `activeDocument` from coordination** - This works correctly
2. **Both subscribe to FILE_UPDATED events** - Correctly implemented  
3. **CRITICAL GAP**: Notes does NOT acquire write-lock before saving, allowing overwrite race
4. **CRITICAL GAP**: Notes reload from external update is broken (reads from store, not FSA)

---

## Data Flow Diagrams

### Current State (Broken)

```
FileTree click on README.md
          |
          v
+----------------------------------+
| FileTreePlugin.handleSelect()    |
| 1. gateway.read(path) -> content |
| 2. coord.setActiveDocument(path, content)  <-- Content passed ONCE
| 3. coord.openDocument(path, 'filetree')    |
+----------------------------------+
          |
          v  (Zustand store update triggers both plugins)
          |
    +-----+-----+
    |           |
    v           v
+----------------+     +----------------+
| Monaco Effect  |     | Notes Effect   |
| activeDocPath  |     | activeDocPath  |
| activeDocContent|    | activeDocContent|
+----------------+     +----------------+
    |                       |
    |  setActivePath(path)  |  isExternal=true
    |  setContent(content)  |  Pass to NoteEditor
    |                       |    externalContent=content
    |                       |    externalPath=path
    v                       v
+----------------+     +---------------------------+
| Monaco Editor  |     | NoteEditor                |
| content=string |     | markdownToBlocks(content) |
| Auto-save:     |     | blocks -> editor          |
|  debouncedSave |     | onChange:                 |
|  acquireLock   |     |   blocksToMarkdown        |
|  gateway.write |     |   onExternalContentChange |
|  releaseLock   |     |   -> NotesPlugin save     |
+----------------+     +---------------------------+
    |                       |
    |                       | <-- NO WRITE LOCK!
    v                       v
+----------------+     +---------------------------+
| gateway.write  |     | gateway.write             |
| emits FILE_UPD |     | NO emit FILE_UPDATED      |  <-- BUG-5
+----------------+     +---------------------------+
```

### Expected State (Working)

```
FileTree click on README.md
          |
          v
+------------------------------------------+
| FileTreePlugin.handleSelect()            |
| 1. gateway.read(path) -> content         |
| 2. coord.setActiveDocument(path, content)|
| 3. coord.openDocument(path, 'filetree')  |
+------------------------------------------+
          |
          v  (Zustand store update triggers both plugins)
          |
    +-----+-----+
    |           |
    v           v
+----------------+     +----------------+
| Monaco Effect  |     | Notes Effect   |
| - Use coord    |     | - Use coord    |
|   content      |     |   content      |
+----------------+     +----------------+
    |                       |
    v                       v
+-------------------+  +------------------------+
| Monaco onChange:  |  | Notes onChange:        |
| 1. acquireLock    |  | 1. acquireLock  <-- FIX|
| 2. gateway.write  |  | 2. gateway.write       |
| 3. emit FILE_UPD  |  | 3. emit FILE_UPD <-FIX |
| 4. update coord   |  | 4. update coord content|
|    content        |  |                        |
| 5. releaseLock    |  | 5. releaseLock   <-FIX |
+-------------------+  +------------------------+
          |                       |
          v                       v
+-------------------+  +------------------------+
| Other plugin sees |  | Other plugin sees      |
| FILE_UPDATED      |  | FILE_UPDATED           |
| Re-reads from FSA |  | Re-reads from FSA <-FIX|
| Updates editor    |  | Updates editor         |
+-------------------+  +------------------------+
```

---

## Edge Case Matrix

| Edge Case | Monaco Behavior | Notes Behavior | Conflict? | Risk |
|-----------|-----------------|----------------|-----------|------|
| **Same file open in both** | Uses coordination content | Uses coordination content | NO - works | Low |
| **User edits in Monaco, Notes open** | Acquires lock, saves, emits FILE_UPDATED | Receives event, but DOES NOT re-read FSA | **YES** | **HIGH** |
| **User edits in Notes, Monaco open** | Receives FILE_UPDATED, re-reads FSA, updates | NO lock acquired, saves, NO event emitted | **YES** | **HIGH** |
| **Save in Monaco while Notes editing** | Lock held, Notes save blocked? | **NO LOCK CHECK** - overwrites Monaco | **YES** | **CRITICAL** |
| **Save in Notes while Monaco editing** | Monaco has lock, Notes tries save | **Notes ignores lock** - corrupts file | **YES** | **CRITICAL** |
| **FileTree selection changes while editing** | Discards unsaved? Has modified check | Converts to markdown, saves immediately | **MAYBE** | Medium |
| **FSA file changed externally** | FileSystemObserver callback, re-reads | No subscription to FSA watcher | **YES** | Medium |
| **One plugin unmounts while other has file** | closeDocument called | closeDocument called | NO | Low |
| **Write-lock acquired by one, other tries save** | Monaco checks lock, blocks save | **Notes ignores lock** | **YES** | **CRITICAL** |
| **Network/FSA error during save** | Shows toast, keeps content | Shows toast, keeps content | NO | Low |
| **Rapid edits in both plugins** | Debounced 500ms, lock protects | Debounced 500ms, **NO LOCK** | **YES** | **HIGH** |

---

## Monaco vs Notes Feature Comparison

| Feature | Monaco | Notes | Gap Description |
|---------|--------|-------|-----------------|
| **Loads from coordination.activeDocument** | **YES** (line 283-290) | **YES** (line 89-90) | None |
| **Subscribes to FILE_UPDATED** | **YES** (line 315-351) | **YES** (line 999-1036) | Notes reload is broken (see BUG-2) |
| **Uses write-lock before save** | **YES** (line 127-135, 196-205) | **NO** | **CRITICAL GAP** - BUG-1 |
| **Releases write-lock after save** | **YES** (line 152-155, 221-224) | **NO** | **CRITICAL GAP** - BUG-1 |
| **Handles save errors** | **YES** (line 146-149, 216-218) | **YES** (line 140-142) | None |
| **Shows "file changed" notification** | **YES** (line 338) | **YES** (line 1025) | None |
| **Re-reads FSA on external update** | **YES** (line 330-335) | **NO** - reads from store only | **CRITICAL GAP** - BUG-2 |
| **Debounces saves** | **YES** (500ms, line 157) | **YES** (500ms, line 873-884) | None |
| **Emits FILE_UPDATED after save** | **PARTIAL** (via gateway) | **NO** | **GAP** - BUG-5 |
| **Updates coord.content after save** | **NO** | **NO** | Minor gap |
| **Checks lock before save** | **YES** | **NO** | **CRITICAL GAP** |
| **Handles lock held by other** | **YES** (toast warning) | **NO** | **CRITICAL GAP** |

---

## Bugs Identified

### BUG-1: Notes Does NOT Acquire Write-Lock Before Save

- **Severity**: P0 (Critical)
- **Location**: `src/plugins/notes/NotesPlugin.tsx` lines 127-146
- **Also affects**: `src/presentation/components/notes/NoteEditor.tsx` lines 873-906

**Symptom**: When user edits in Notes while Monaco has the same file open, Notes saves without checking if Monaco holds a write-lock. This can overwrite Monaco's pending changes.

**Root Cause**: The `handleExternalSave` function in NotesPlugin and `handleChange` in NoteEditor do NOT call `coordination.acquireWriteLock()` before saving.

**Evidence** (NotesPlugin.tsx lines 127-146):
```typescript
const handleExternalSave = useCallback((markdown: string, path: string) => {
  // Clear any pending save
  if (saveTimeoutRef.current) {
    clearTimeout(saveTimeoutRef.current);
  }
  
  // Debounce the save (500ms)
  saveTimeoutRef.current = setTimeout(async () => {
    if (gateway && path) {
      try {
        const encoder = new TextEncoder();
        await gateway.write(path, encoder.encode(markdown));  // <-- NO LOCK!
        console.log('[NotesPlugin] Saved external file to FSA:', path);
      } catch (error) {
        console.error('[NotesPlugin] Failed to save external file:', error);
        toast.error(t('notes.saveToFileFailed', 'Failed to save to file'));
      }
    }
  }, 500);
}, [gateway, t]);
```

**Compare to Monaco** (MonacoMain.tsx lines 117-160):
```typescript
const debouncedSave = useCallback(
  (newContent: string) => {
    // ...
    saveTimeoutRef.current = setTimeout(async () => {
      if (!activePath || !gateway) return;

      // EPIC-0.6-03: Acquire write lock before saving
      if (coordination) {
        const hasLock = coordination.acquireWriteLock(activePath, 'monaco');
        if (!hasLock) {
          const holder = coordination.getWriteLockHolder(activePath);
          console.warn('[MonacoPlugin] Cannot save - lock held by:', holder);
          toast.warning(t('editor.lockHeldByOther', { plugin: holder }));
          return;  // <-- Monaco properly blocks save if lock held
        }
      }
      // ... save logic
      // EPIC-0.6-03: Release write lock after saving
      if (coordination) {
        coordination.releaseWriteLock(activePath, 'monaco');
      }
    }, 500);
  },
  [activePath, gateway, markClean, coordination, t]
);
```

**Fix**:
```typescript
// In NotesPlugin handleExternalSave:
const handleExternalSave = useCallback((markdown: string, path: string) => {
  if (saveTimeoutRef.current) {
    clearTimeout(saveTimeoutRef.current);
  }
  
  saveTimeoutRef.current = setTimeout(async () => {
    if (gateway && path) {
      // FIX: Acquire write-lock before save
      const coord = coordinationRef.current;
      if (coord) {
        const hasLock = coord.acquireWriteLock(path, 'notes');
        if (!hasLock) {
          const holder = coord.getWriteLockHolder(path);
          console.warn('[NotesPlugin] Cannot save - lock held by:', holder);
          toast.warning(t('notes.lockHeldByOther', { plugin: holder }));
          return;
        }
      }
      
      try {
        const encoder = new TextEncoder();
        await gateway.write(path, encoder.encode(markdown));
        console.log('[NotesPlugin] Saved external file to FSA:', path);
      } catch (error) {
        console.error('[NotesPlugin] Failed to save external file:', error);
        toast.error(t('notes.saveToFileFailed', 'Failed to save to file'));
      } finally {
        // FIX: Release write-lock after save
        if (coord) {
          coord.releaseWriteLock(path, 'notes');
        }
      }
    }
  }, 500);
}, [gateway, t]);
```

---

### BUG-2: Notes FILE_UPDATED Handler Does NOT Re-read from FSA

- **Severity**: P1 (High)
- **Location**: `src/presentation/components/notes/NoteEditor.tsx` lines 999-1036

**Symptom**: When Monaco saves a file and emits FILE_UPDATED, Notes receives the event but attempts to reload from the Zustand note store (which only has internal notes), NOT from FSA. For external files from FileTree, this means Notes shows stale content.

**Root Cause**: The FILE_UPDATED handler checks `event.path === noteId` but for external files `noteId` is undefined. Also, even if it matched, it reads from `notes.get(noteId)` which is the internal note store, not FSA.

**Evidence** (NoteEditor.tsx lines 1004-1031):
```typescript
useEffect(() => {
    if (!projectContext) return;

    const unsubscribe = fileEventBus.onWithFilter(
        'file:updated',
        (event: FileEvent) => {
            // Only reload if it's our note file
            if (event.path === noteId) {  // <-- noteId is UNDEFINED for external files!
                console.log('[NoteEditor] External FILE_UPDATED detected, reloading note:', noteId);

                // Reload note content from store  <-- WRONG! External files aren't in store
                const reloadedNote = notes.get(noteId);
                if (reloadedNote?.blocks) {
                    // Update editor with reloaded content
                    // BlockNote will handle the document change automatically
                    // Trigger a re-render to update blocks from store
                    // Note: We don't directly set blocks in BlockNote to avoid conflicts
                    console.log('[NoteEditor] Note reloaded from external update');
                }

                // Show notification to user
                toast.info('Note was updated externally, content reloaded');
            }
        },
        {
            projectId: projectContext.projectId,
        }
    );

    return () => {
        unsubscribe();
    };
}, [noteId, projectContext?.projectId, notes]);
```

**Compare to Monaco** (MonacoMain.tsx lines 315-351):
```typescript
useEffect(() => {
    if (!activePath) return;

    const unsubscribe = useFileEventBus({
        eventName: 'file:updated',
        projectId: projectContext.projectId,
        handler: (event) => {
            // Skip if this is the file being edited by user
            if (event.path === activePath && !isModified) {
                console.log('[MonacoPlugin] External FILE_UPDATED detected, reloading:', event.path);

                // Reload file content from storage  <-- CORRECT: Re-reads from FSA
                (async () => {
                    try {
                        const data = await gateway.read(event.path);  // <-- Re-read from FSA!
                        const content = new TextDecoder().decode(data);
                        setContent(content);
                        setIsModified(false);

                        toast.info('File was updated externally, content reloaded');
                    } catch (err) {
                        console.error('[MonacoPlugin] Error reloading file:', err);
                        toast.error('Failed to reload file content');
                    }
                })();
            }
        },
    });

    return () => {
        unsubscribe();
    };
}, [activePath, isModified, gateway, projectContext.projectId]);
```

**Fix**: For NoteEditor external mode, listen using `externalPath` and re-read from FSA:
```typescript
// In NoteEditor - separate effect for external mode
useEffect(() => {
    if (!isExternalMode || !externalPath || !projectContext?.gateway) return;

    const unsubscribe = fileEventBus.onWithFilter(
        'file:updated',
        async (event: FileEvent) => {
            if (event.path === externalPath && event.source !== 'user') {
                console.log('[NoteEditor] External FILE_UPDATED detected, reloading:', externalPath);

                try {
                    // FIX: Re-read from FSA, not from store
                    const data = await projectContext.gateway.read(externalPath);
                    const content = new TextDecoder().decode(data);
                    const blocks = await markdownToBlocks(content);
                    
                    // Update editor blocks
                    // Need to replace all blocks in the editor
                    editor.replaceBlocks(editor.document, blocks);
                    
                    toast.info('Note was updated externally, content reloaded');
                } catch (error) {
                    console.error('[NoteEditor] Failed to reload external file:', error);
                    toast.error('Failed to reload file content');
                }
            }
        },
        { projectId: projectContext.projectId }
    );

    return () => unsubscribe();
}, [isExternalMode, externalPath, projectContext?.gateway, projectContext?.projectId, editor]);
```

---

### BUG-3: Race Condition on Simultaneous File Selection

- **Severity**: P1 (High)
- **Location**: FileTree -> Coordination -> Both Plugins

**Symptom**: When user rapidly clicks files in FileTree, both Monaco and Notes receive the coordination update. If the previous file had unsaved changes, they may be lost or saved to the wrong file.

**Root Cause**: 
1. FileTree calls `setActiveDocument(path, content)` which immediately updates the store
2. Both plugins have effects that react to `activeDocPath` and `activeDocContent` changes
3. There's no "pending changes" check before switching activeDocument
4. Monaco has `isModified` check but Notes doesn't for external mode

**Evidence**:
- FileTree (line 147): `coord.setActiveDocument(node.path, decoder.decode(content));`
- No check for unsaved changes in other plugins before switching

**Fix**: Add confirmation dialog when switching files with unsaved changes:
```typescript
// In FileTreePlugin handleSelect:
const handleSelect = useCallback(async (node: FileTreeNode) => {
  if (node.kind === 'file') {
    const coord = coordinationRef.current;
    
    // Check if current active document has unsaved changes
    if (coord?.activeDocument) {
      const currentEditors = coord.getEditorsForPath(coord.activeDocument.path);
      // If editors have the file open, ask for confirmation
      if (currentEditors.length > 0) {
        // Could check isModified state from each plugin
        // For now, just proceed - this is a design decision
      }
    }
    
    selectFile(node.path);
    // ... rest of selection logic
  }
}, [selectFile, openFile, gateway]);
```

---

### BUG-4: External Content Not Updating Editor After Initial Load

- **Severity**: P2 (Medium)
- **Location**: `src/presentation/components/notes/NoteEditor.tsx` line 788

**Symptom**: NoteEditor uses `useCreateBlockNote` with `initialContent`. BlockNote does NOT re-render when `initialContent` changes after mount. So if coordination updates `activeDocContent`, the editor shows stale content.

**Root Cause**: The `useCreateBlockNote` hook only uses `initialContent` on first render. Subsequent changes to `externalBlocks` don't update the editor.

**Evidence** (lines 791-795):
```typescript
const editor = useCreateBlockNote({
    schema,
    initialContent,  // <-- Only used on first render!
});
```

**Fix**: Use `editor.replaceBlocks()` when external content changes:
```typescript
// Add effect to update editor when external content changes
useEffect(() => {
    if (!isExternalMode || !externalBlocks || !editor) return;
    
    // Check if this is a new file (different path)
    // If so, replace all blocks
    const currentBlocks = editor.document;
    
    // Simple check: if first block ID is different, replace all
    if (currentBlocks.length > 0 && externalBlocks.length > 0) {
        if (currentBlocks[0].id !== externalBlocks[0].id) {
            editor.replaceBlocks(currentBlocks, externalBlocks);
        }
    } else if (externalBlocks.length > 0) {
        editor.replaceBlocks(currentBlocks, externalBlocks);
    }
}, [isExternalMode, externalBlocks, editor]);
```

---

### BUG-5: activeDocument.content Not Updated After Save

- **Severity**: P2 (Medium)
- **Location**: Both plugins, coordination store

**Symptom**: After Monaco or Notes saves a file, the `coordination.activeDocument.content` remains at the original value from FileTree. Other plugins relying on this content see stale data.

**Root Cause**: Neither plugin calls `coordination.updateActiveDocumentContent(newContent)` after saving.

**Evidence**: Search for `updateActiveDocumentContent` shows it's defined in the store (line 183-196) but never called by Monaco or Notes after save.

**Fix**: After successful save, update coordination content:
```typescript
// In Monaco debouncedSave after successful gateway.write:
coordination.updateActiveDocumentContent(newContent);

// In Notes handleExternalSave after successful gateway.write:
coordination.updateActiveDocumentContent(markdown);
```

---

## FSA Reactivity Gaps

### What's Missing for Proper FSA Reactivity

| Component | Has FSA Watch? | Has Polling Fallback? | Notes |
|-----------|----------------|----------------------|-------|
| **FileTreePlugin** | Subscribes to fileEventBus | No direct FSA watch | Relies on event emission |
| **MonacoMain** | Subscribes to FILE_UPDATED | No | Works if events are emitted |
| **NotesPlugin** | Subscribes to FILE_UPDATED | No | **Broken** - wrong path match |
| **NoteEditor** | Subscribes to FILE_UPDATED | No | **Broken** - reads from store |
| **FSA Gateway** | FileSystemObserver (Chrome 129+) | Polling fallback | Only emits to internal callback |

### Architecture Gap

The FSA Gateway has FileSystemObserver support (lines 379-476 in `fsa-gateway.ts`) but:
1. It's not connected to the FileEventBus
2. Plugins don't subscribe to the gateway's file watch
3. External changes (outside the app) don't trigger FILE_UPDATED events

**Recommended Architecture**:
```
FSA Gateway FileSystemObserver
          |
          v
FileEventBus.emit('file:updated', { source: 'external' })
          |
    +-----+-----+
    |           |
    v           v
Monaco      Notes
re-reads    re-reads
from FSA    from FSA
```

---

## Recommended Fix Order

### Phase 1: Critical (P0) - 2 hours

1. **BUG-1: Add write-lock to Notes save**
   - Files: `NotesPlugin.tsx`, `NoteEditor.tsx`
   - Add `acquireWriteLock` before save
   - Add `releaseWriteLock` after save
   - Add toast warning when lock held by other

### Phase 2: High Priority (P1) - 3 hours

2. **BUG-2: Fix Notes FILE_UPDATED handler**
   - File: `NoteEditor.tsx`
   - Listen on `externalPath` not `noteId`
   - Re-read from FSA via gateway
   - Update editor with `replaceBlocks`

3. **BUG-3: Race condition mitigation**
   - File: `FileTreePlugin.tsx`
   - Optional: Add unsaved changes confirmation
   - Or: Save before switching (risky)

### Phase 3: Medium Priority (P2) - 2 hours

4. **BUG-4: External content not updating editor**
   - File: `NoteEditor.tsx`
   - Add effect to call `replaceBlocks` when `externalBlocks` changes

5. **BUG-5: Update coordination content after save**
   - Files: `MonacoMain.tsx`, `NotesPlugin.tsx`
   - Call `updateActiveDocumentContent` after save

---

## Code Examples for dev-ext

### Fix 1: NotesPlugin Write-Lock (Critical)

```typescript
// In NotesPlugin.tsx, replace handleExternalSave:

const handleExternalSave = useCallback((markdown: string, path: string) => {
  if (saveTimeoutRef.current) {
    clearTimeout(saveTimeoutRef.current);
  }
  
  saveTimeoutRef.current = setTimeout(async () => {
    if (!gateway || !path) return;
    
    const coord = coordinationRef.current;
    
    // EPIC-0.6-03: Acquire write lock before saving
    if (coord) {
      const hasLock = coord.acquireWriteLock(path, 'notes');
      if (!hasLock) {
        const holder = coord.getWriteLockHolder(path);
        console.warn('[NotesPlugin] Cannot save - lock held by:', holder);
        toast.warning(t('notes.lockHeldByOther', 'File is being edited by ' + holder));
        return;
      }
    }
    
    try {
      const encoder = new TextEncoder();
      await gateway.write(path, encoder.encode(markdown));
      
      // Update coordination content
      if (coord) {
        coord.updateActiveDocumentContent(markdown);
      }
      
      console.log('[NotesPlugin] Saved external file to FSA:', path);
    } catch (error) {
      console.error('[NotesPlugin] Failed to save external file:', error);
      toast.error(t('notes.saveToFileFailed', 'Failed to save to file'));
    } finally {
      // EPIC-0.6-03: Release write lock after saving
      if (coord) {
        coord.releaseWriteLock(path, 'notes');
      }
    }
  }, 500);
}, [gateway, t]);
```

### Fix 2: NoteEditor External FILE_UPDATED (High)

```typescript
// In NoteEditor.tsx, add new effect after line 1036:

// EPIC-0.5-02: Listen for FILE_UPDATED events for EXTERNAL files
useEffect(() => {
    if (!isExternalMode || !externalPath) return;
    if (!projectContext?.gateway) return;

    const gateway = projectContext.gateway;
    const unsubscribe = fileEventBus.onWithFilter(
        'file:updated',
        async (event: FileEvent) => {
            // Only reload if it's our external file and not from our own save
            if (event.path === externalPath && event.source !== 'user') {
                console.log('[NoteEditor] External FILE_UPDATED detected, reloading:', externalPath);

                try {
                    // Re-read from FSA
                    const data = await gateway.read(externalPath);
                    const content = new TextDecoder().decode(data);
                    const blocks = await markdownToBlocks(content);
                    
                    // Replace editor content
                    editor.replaceBlocks(editor.document, blocks as any);
                    
                    toast.info('Note was updated externally, content reloaded');
                } catch (error) {
                    console.error('[NoteEditor] Failed to reload external file:', error);
                    toast.error('Failed to reload file content');
                }
            }
        },
        { projectId: projectContext.projectId }
    );

    return () => unsubscribe();
}, [isExternalMode, externalPath, projectContext?.gateway, projectContext?.projectId, editor]);
```

### Fix 3: Update Coordination Content After Save

```typescript
// In MonacoMain.tsx debouncedSave, after gateway.write:
if (coordination) {
  coordination.updateActiveDocumentContent(newContent);
}

// In NotesPlugin.tsx handleExternalSave, after gateway.write:
if (coord) {
  coord.updateActiveDocumentContent(markdown);
}
```

---

## Test Scenarios for Validation

After implementing fixes, validate with these scenarios:

1. **Open .md file, edit in Monaco, verify Notes updates**
2. **Open .md file, edit in Notes, verify Monaco updates**
3. **Edit in Monaco, immediately switch to Notes tab, verify content synced**
4. **Edit in both simultaneously, verify lock blocks second save**
5. **Save in Monaco, check Notes shows fresh content without manual reload**
6. **Rapidly switch between files, verify no data loss**

---

## Summary

The dual-plugin FSA synchronization has **5 bugs** with **3 critical gaps**:

1. **Notes ignores write-locks** - Can overwrite Monaco's changes
2. **Notes FILE_UPDATED is broken** - Uses wrong path, reads from wrong source
3. **Race condition on file switch** - No unsaved changes protection
4. **Editor doesn't update on content change** - BlockNote limitation
5. **Coordination content stale after save** - Not updated

**Estimated fix time**: 7-8 hours total across Phase 1-3.

**Handoff to dev-ext**: This report contains all necessary code examples and file locations for implementation. All bugs can be fixed in a single session with verification testing.
