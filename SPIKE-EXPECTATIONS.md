# Spike Expectations Report

**Generated:** 2026-01-16
**Spike Version:** 1.0.0

---

## What Works (Should Function)

### Project Space Entry

- [x] Can access `/spike`
  - **Expected behavior:** Shows navigation grid with links to Notes, IDE, and Project Creation
  - **Implementation:** `spike/spike.tsx` with SpikeNavItem components
  
- [x] Can see project list
  - **Expected behavior:** Dexie queries return all projects from `db.projects`
  - **Implementation:** `ProjectList` component uses `db.projects.toArray()`
  
- [x] Can create new project
  - **Expected behavior:** Form creates project in Dexie with auto-generated ID
  - **Implementation:** `SpikeProjectCreation` wizard with 2-step flow
  
- [x] Can select existing project
  - **Expected behavior:** Click project to navigate to workspace
  - **Implementation:** `ProjectList` with `navigate({ to: '/spike/.../$projectId' })`

### Notes Workspace (/spike/notes/$projectId)

- [x] Loads project from Dexie
  - **Expected behavior:** `db.projects.get(projectId)` returns project
  - **Implementation:** `useEffect` in `SpikeNotesWorkspace`
  
- [x] Shows editor placeholder
  - **Expected behavior:** Minimal UI with project info and storage type
  - **Implementation:** `SpikeEditorContent` component
  
- [x] Mobile can access
  - **Expected behavior:** No platform guard, all devices allowed
  - **Implementation:** No `beforeLoad` redirect for Notes

### IDE Workspace (/spike/ide/$projectId)

- [x] Loads project from Dexie
  - **Expected behavior:** `db.projects.get(projectId)` returns project
  - **Implementation:** `useEffect` in `SpikeIDEWorkspace`
  
- [x] Shows file tree placeholder
  - **Expected behavior:** Minimal file tree UI with folders and files
  - **Implementation:** `SpikeFileTree` component
  
- [x] Desktop only (mobile blocked)
  - **Expected behavior:** `beforeLoad` throws redirect if `!platform.canAccessIDE`
  - **Implementation:** Route guard in `spike/routes/spike-ide.tsx`
  
- [x] FSA indicator shown
  - **Expected behavior:** Green "FSA" badge for FSA projects
  - **Implementation:** `span className="text-xs px-2 py-1 bg-green-500/20 text-green-500 rounded"`

### Project Creation

- [x] Project name input
  - **Expected behavior:** Text input with validation
  - **Implementation:** `input type="text"` with required check
  
- [x] Storage type selection
  - **Expected behavior:** FSA or IndexedDB options, auto-recommended
  - **Implementation:** `StorageOption` components with recommended badge
  
- [x] Project creation in Dexie
  - **Expected behavior:** `db.projects.add({...})` stores project
  - **Implementation:** `handleCreate` function in `SpikeProjectCreation`

### Platform Guards

- [x] Mobile blocked from IDE
  - **Expected behavior:** Redirects to `/spike/notes?reason=mobile-not-supported`
  - **Implementation:** `beforeLoad` in `spike/routes/spike-ide.tsx`
  
- [x] Desktop can access both
  - **Expected behavior:** No redirect for desktop with FSA
  - **Implementation:** `platform.canAccessIDE` check passes

---

## What Doesn't Work (Known Issues)

### Project Creation

- [ ] FSA handle storage may not persist
  - **Current behavior:** Uses placeholder path `/selected/folder`
  - **Issue:** No actual FSA handle picker integration
  - **Fix needed:** Integrate `showDirectoryPicker` for real FSA projects
  
- [ ] Project ID generation may have issues
  - **Current behavior:** Simple timestamp + random string
  - **Issue:** No collision checking with existing projects
  - **Fix needed:** Add ID uniqueness validation

### Routing

- [ ] Route guards may have race conditions
  - **Current behavior:** `beforeLoad` runs before component
  - **Issue:** On fast navigation, state may not be ready
  - **Fix needed:** Add loading state handling
  
- [ ] Hydration may fail on first load
  - **Current behavior:** SSR renders different content than client
  - **Issue:** Platform detection runs differently on server
  - **Fix needed:** Add proper SSR/CSR handling

### State Management

- [ ] Stores may not hydrate correctly
  - **Current behavior:** Direct Dexie queries, no store abstraction
  - **Issue:** Spike uses direct DB access, not the Zustand stores
  - **Design decision:** Intentional - spike uses minimal state

### UI Components

- [ ] No BlockNote integration
  - **Current behavior:** Placeholder editor content
  - **Issue:** BlockNote requires full setup (schema, providers, etc.)
  - **Fix needed:** Import and configure BlockNoteEditor from spike/components
  
- [ ] No Monaco integration
  - **Current behavior:** Static preformatted text
  - **Issue:** Monaco requires WebContainer or standalone build
  - **Fix needed:** Import Monaco from spike/components

---

## Debugging Plan

For each issue, follow this debugging sequence:

### 1. Check Console Logs

```bash
# Look for these log patterns:
[SpikeNotes] - Notes workspace logs
[SpikeIDE] - IDE workspace logs
[SpikeProjectCreation] - Project creation logs
[spike-ide] - Route guard logs
```

### 2. Verify Dexie Queries Work

```typescript
// In browser console:
const db = await import('./src/infrastructure/persistence/dexie-db').then(m => m.db);
const projects = await db.projects.toArray();
console.log('Projects:', projects);
```

### 3. Verify FSA Handles Restore

```typescript
// In browser console:
const hasFSA = 'showDirectoryPicker' in window;
console.log('FSA supported:', hasFSA);
```

### 4. Verify State Hydrates

```typescript
// Check component state:
console.log('Project loaded:', project);
console.log('Storage type:', storageType);
```

---

## Next Steps

After fixing known issues:

### Phase 1: Core Features

1. **Add BlockNote Integration**
   - Import `NoteEditor` from spike/components/notes
   - Configure BlockNote schema
   - Connect to Dexie for note persistence

2. **Add Monaco Integration**
   - Import `MonacoEditor` from spike/components/ide
   - Configure file content loading
   - Connect to FSA for file operations

3. **Implement FSA Handle Picker**
   - Add `showDirectoryPicker` integration
   - Store handle in Dexie
   - Restore handle on project load

### Phase 2: Sync Features

1. **Add File Watching**
   - Implement `FileSystemObserver` (Chrome 129+)
   - Add polling fallback
   - Connect to editor refresh

2. **Add Sync Status**
   - Integrate `SyncStatusIndicator`
   - Show pending/-synced counts
   - Add retry UI

### Phase 3: Enhancement

1. **Add AI Features**
   - Integrate Gemini provider
   - Add AI sidebar
   - Connect to BlockNote AI blocks

2. **Add Agent Features**
   - Integrate agent store
   - Add agent panel
   - Connect to tool execution

---

## File Structure

```
spike/
├── spike.tsx                          # Entry point with navigation
├── routes/
│   ├── spike-notes.tsx                # Notes route (/spike/notes)
│   ├── spike-notes.$projectId.tsx     # Notes with project
│   ├── spike-ide.tsx                  # IDE route (/spike/ide)
│   ├── spike-ide.$projectId.tsx       # IDE with project
│   └── spike-project-creation.tsx     # Creation route
├── notes/
│   └── SpikeNotesWorkspace.tsx        # Notes workspace UI
├── ide/
│   └── SpikeIDEWorkspace.tsx          # IDE workspace UI
└── project-creation/
    └── SpikeProjectCreation.tsx       # Creation wizard UI
```

---

## Dependencies Used

| Package | Purpose |
|---------|---------|
| `@tanstack/react-router` | File-based routing |
| `dexie` | IndexedDB wrapper |
| `@infrastructure/filesystem/platform-contract` | Platform detection |

---

## Success Criteria Summary

| Criterion | Status |
|-----------|--------|
| Spike entry point loads | ✅ |
| Routes are registered | ✅ |
| Can navigate to /spike/notes/$projectId | ✅ |
| Can navigate to /spike/ide/$projectId | ✅ |
| Can navigate to /spike/project-creation | ✅ |
| Report generated with expectations | ✅ |

---

**End of Report**
