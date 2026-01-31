# Entity Layer Mapping

**Created:** 2026-01-31T03:04:09Z  
**Source:** `new-fundamental-truths.md` Section 8  
**Companion:** `STATE-CONTRACTS.md`  
**Status:** ACTIVE CONTRACT

---

## Purpose

This document maps every entity type to its canonical state layer. It answers the question: **"Where does this data live?"**

For each entity, you will find:
- Which layer owns it
- Which technology to use
- How to read it
- How to write it
- What is the source of truth

---

## Entity-to-Layer Mapping

### Project Entities

| Entity | Layer | Technology | Read Pattern | Write Pattern | Source of Truth |
|--------|-------|------------|--------------|---------------|-----------------|
| Project metadata (name, created) | L3 | Dexie | `useLiveQuery(() => db.projects.get(id))` | `db.projects.put(project)` | Dexie |
| Project list | L3 | Dexie | `useLiveQuery(() => db.projects.toArray())` | `db.projects.bulkPut(projects)` | Dexie |
| Active project ID | L2 | Zustand | `useSessionStore(useShallow(s => s.activeProjectId))` | `setActiveProject(id)` | Zustand (hydrated from Dexie) |
| Project settings | L3 | Dexie | `useLiveQuery(() => db.projectSettings.get(projectId))` | `db.projectSettings.put(settings)` | Dexie |
| Project directory handle | L4 | FSA | `await db.handles.get(projectId)` | `db.handles.put({ projectId, handle })` | IndexedDB (handle storage) |

---

### Thread/Chat Entities

| Entity | Layer | Technology | Read Pattern | Write Pattern | Source of Truth |
|--------|-------|------------|--------------|---------------|-----------------|
| Thread metadata | L3 | Dexie | `useLiveQuery(() => db.threads.where('projectId').equals(id).toArray())` | `db.threads.put(thread)` | Dexie |
| Thread messages | L3 | Dexie | `useLiveQuery(() => db.messages.where('threadId').equals(id).toArray())` | `db.messages.add(message)` | Dexie |
| Active thread ID | L2 | Zustand | `useSessionStore(useShallow(s => s.activeThreadId))` | `setActiveThread(id)` | Zustand (hydrated from Dexie) |
| Message streaming state | L1 | Zustand | `useChatStore(useShallow(s => s.isStreaming))` | `setStreaming(bool)` | Zustand (transient) |
| Pending message content | L1 | Zustand | `useChatStore(useShallow(s => s.pendingMessage))` | `setPendingMessage(text)` | Zustand (transient) |

---

### Note Entities

| Entity | Layer | Technology | Read Pattern | Write Pattern | Source of Truth |
|--------|-------|------------|--------------|---------------|-----------------|
| Note content | L4 | FSA/OPFS | `await gateway.read(notePath)` | `await gateway.write(notePath, content)` | File system |
| Note metadata (title, path) | L3 | Dexie | `useLiveQuery(() => db.notes.get(noteId))` | `db.notes.put(note)` | Dexie |
| Note list (project) | L3 | Dexie | `useLiveQuery(() => db.notes.where('projectId').equals(id).toArray())` | n/a | Dexie |
| Active note ID | L2 | Zustand | `useSessionStore(useShallow(s => s.activeNoteId))` | `setActiveNote(id)` | Zustand (hydrated) |
| Note editor dirty state | L1 | Zustand | `useNoteEditorStore(useShallow(s => s.isDirty))` | `setDirty(bool)` | Zustand (transient) |

---

### File Entities

| Entity | Layer | Technology | Read Pattern | Write Pattern | Source of Truth |
|--------|-------|------------|--------------|---------------|-----------------|
| File content | L4 | FSA/OPFS | `await gateway.read(filePath)` | `await gateway.write(filePath, content)` | File system |
| File tree structure | L4 | FSA/OPFS | `await gateway.listDirectory(path)` | n/a (derived from FS) | File system |
| File metadata (size, modified) | L4 | FSA/OPFS | `await gateway.stat(filePath)` | n/a (FS metadata) | File system |
| Open files (tabs) | L2 | Zustand | `useSessionStore(useShallow(s => s.openTabs))` | `openTab(path)` / `closeTab(path)` | Zustand (hydrated) |
| Active file path | L2 | Zustand | `useSessionStore(useShallow(s => s.activeFilePath))` | `setActiveFile(path)` | Zustand (hydrated) |
| File selection (in tree) | L1 | Zustand | `useFileTreeStore(useShallow(s => s.selectedPath))` | `selectPath(path)` | Zustand (transient) |
| File tree expanded nodes | L1 | Zustand | `useFileTreeStore(useShallow(s => s.expandedPaths))` | `toggleExpand(path)` | Zustand (transient) |

---

### Settings Entities

| Entity | Layer | Technology | Read Pattern | Write Pattern | Source of Truth |
|--------|-------|------------|--------------|---------------|-----------------|
| User preferences (theme, lang) | L3 | Dexie | `useLiveQuery(() => db.settings.get('user'))` | `db.settings.put({ key: 'user', ...prefs })` | Dexie |
| BYOK API keys | L3 | Dexie | `useLiveQuery(() => db.settings.get('apiKeys'))` | `db.settings.put({ key: 'apiKeys', ...keys })` | Dexie (encrypted) |
| Editor preferences | L3 | Dexie | `useLiveQuery(() => db.settings.get('editor'))` | `db.settings.put({ key: 'editor', ...prefs })` | Dexie |
| Layout preferences | L3 | Dexie | `useLiveQuery(() => db.settings.get('layout'))` | `db.settings.put({ key: 'layout', ...prefs })` | Dexie |

---

### UI State Entities

| Entity | Layer | Technology | Read Pattern | Write Pattern | Source of Truth |
|--------|-------|------------|--------------|---------------|-----------------|
| Panel open/closed | L1 | Zustand | `useLayoutStore(useShallow(s => s.panelStates))` | `togglePanel(panelId)` | Zustand (transient) |
| Panel sizes | L1 | Zustand | `useLayoutStore(useShallow(s => s.panelSizes))` | `setPanelSize(panelId, size)` | Zustand (transient) |
| Modal visibility | L1 | Zustand | `useModalStore(useShallow(s => s.activeModal))` | `openModal(id)` / `closeModal()` | Zustand (transient) |
| Context menu state | L1 | Zustand | `useContextMenuStore(useShallow(s => s.isOpen))` | `showContextMenu(pos, items)` | Zustand (transient) |
| Tooltip visibility | L1 | Zustand | `useTooltipStore(useShallow(s => s.visible))` | `showTooltip(...)` | Zustand (transient) |
| Drag-and-drop state | L1 | Zustand | `useDndStore(useShallow(s => s.dragging))` | `startDrag(item)` / `endDrag()` | Zustand (transient) |
| Selection state | L1 | Zustand | `useSelectionStore(useShallow(s => s.selected))` | `select(id)` / `clearSelection()` | Zustand (transient) |
| Hover state | L1 | Zustand | `useHoverStore(useShallow(s => s.hoveredId))` | `setHovered(id)` | Zustand (transient) |

---

### Plugin State Entities

| Entity | Layer | Technology | Read Pattern | Write Pattern | Source of Truth |
|--------|-------|------------|--------------|---------------|-----------------|
| Plugin capabilities | L1 | Zustand | `usePluginStore(useShallow(s => s.capabilities))` | `registerCapability(...)` | Zustand (transient) |
| Plugin coordination | L1 | Zustand | `usePluginStore(useShallow(s => s.coordination))` | `setActiveDocument(...)` | Zustand (transient) |
| Active document (shared) | L1 | Zustand | `usePluginStore(useShallow(s => s.activeDocument))` | `setActiveDocument(path, content)` | Zustand (transient) |
| Dev server URL | L1 | Zustand | `usePluginStore(useShallow(s => s.devServerUrl))` | `queueDeferredUrl(url)` | Zustand (transient) |
| Plugin preferences | L3 | Dexie | `useLiveQuery(() => db.pluginSettings.get(pluginId))` | `db.pluginSettings.put(prefs)` | Dexie |

---

## Layer Decision Tree

Use this flowchart when adding new data to the system:

```
START: What kind of data is this?
│
├─→ Is it file content (source code, markdown, config)?
│   └─→ YES: L4 (File State) - FSA/OPFS via gateway
│
├─→ Is it user data that must persist forever?
│   (projects, threads, messages, settings, preferences)
│   └─→ YES: L3 (Persisted State) - Dexie
│
├─→ Does it need to survive page refresh?
│   (active project, open tabs, layout)
│   └─→ YES: L2 (Session State) - Zustand + Dexie hydration
│
└─→ Is it transient UI state?
    (panel open, hover, selection, modal)
    └─→ YES: L1 (UI State) - Zustand (NO persist)
```

### Quick Reference

| Question | Answer | Layer |
|----------|--------|-------|
| Does it survive tab close? | No | L1 |
| Does it survive page refresh? | Yes, via hydration | L2 |
| Is it user-created content? | Yes, metadata | L3 |
| Is it file content? | Yes | L4 |
| Is it user preferences? | Yes | L3 |
| Is it UI interaction state? | Yes | L1 |

---

## Examples by Scenario

### Scenario 1: User Opens a Project

1. **L3 Read:** `useLiveQuery(() => db.projects.get(projectId))` - Get project metadata
2. **L2 Write:** `setActiveProject(projectId)` - Set active project in session
3. **L4 Read:** `await gateway.listDirectory(projectPath)` - Load file tree
4. **L1 Write:** `setExpandedPaths([projectPath])` - Expand root in tree

### Scenario 2: User Opens a File

1. **L1 Read:** File selected in tree (selectedPath)
2. **L4 Read:** `await gateway.read(filePath)` - Load file content
3. **L2 Write:** `openTab(filePath)` - Add to open tabs
4. **L2 Write:** `setActiveFile(filePath)` - Set as active

### Scenario 3: User Creates a Thread

1. **L3 Write:** `db.threads.add({ projectId, created: Date.now() })` - Create thread
2. **L2 Write:** `setActiveThread(newThreadId)` - Set as active
3. **L3 Read:** `useLiveQuery()` auto-updates thread list

### Scenario 4: User Changes Theme

1. **L3 Write:** `db.settings.put({ key: 'user', theme: 'dark' })` - Persist preference
2. **L3 Read:** `useLiveQuery()` triggers re-render with new theme

---

## Violation Detection

### Signs of Layer Confusion

1. **Zustand persist middleware** on stores containing project data
2. **useState + useEffect** patterns for Dexie data
3. **Direct FSA access** outside infrastructure layer
4. **File content stored in Zustand** (should be L4, not L1)
5. **Settings stored in localStorage** (should be L3 Dexie)

### Migration Commands

```bash
# Find Zustand persist usage (potential L3 violations)
grep -r "persist(" src/ --include="*.ts" --include="*.tsx"

# Find direct FSA access (should be through gateway)
grep -r "showOpenFilePicker\|showSaveFilePicker\|showDirectoryPicker" src/

# Find useState with db. (should be useLiveQuery)
grep -r "useState.*db\." src/ --include="*.tsx"
```

---

## Source of Truth Summary

| Layer | Source of Truth | Survives Refresh | Survives Tab Close |
|-------|-----------------|------------------|-------------------|
| L1 | Zustand | NO | NO |
| L2 | Zustand (hydrated from Dexie) | YES | NO |
| L3 | Dexie | YES | YES |
| L4 | File System | YES | YES |

---

*This mapping is binding for all entity placement decisions.*
