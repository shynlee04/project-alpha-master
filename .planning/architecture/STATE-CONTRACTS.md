# State Layer Contracts

**Created:** 2026-01-31T03:04:09Z  
**Source:** `new-fundamental-truths.md` Section 8  
**Status:** ACTIVE CONTRACT

---

## Purpose

This document defines the 4-layer state architecture as **enforceable rules**. It answers the question: "Where does this data live?" and establishes boundaries that prevent state fragmentation.

Every piece of data has ONE canonical home. Violations of these contracts cause:
- Race conditions between state sources
- Stale data in UI
- Unpredictable re-render cascades
- Data loss on refresh

---

## Layer Definitions

### L1: UI State

| Property | Value |
|----------|-------|
| **Technology** | Zustand v5 (NO persist middleware) |
| **Purpose** | Transient UI state that doesn't survive refresh |
| **TTL** | Session (cleared on tab close) |
| **Scope** | Component tree |

**Contains:**
- Panel open/closed states
- Selection state (which item is highlighted)
- Hover/focus states
- Modal open/closed
- Transient form values (before submission)
- Drag-and-drop state
- Tooltip visibility

**Read Pattern:** `useStore(useShallow(s => s.uiValue))`  
**Write Pattern:** `useStore.getState().setUiValue(value)`

---

### L2: Session State

| Property | Value |
|----------|-------|
| **Technology** | Zustand + Dexie Hydration |
| **Purpose** | Active context that persists within session |
| **TTL** | Session (survives refresh via hydration) |
| **Scope** | Tab/Window |

**Contains:**
- Active project ID
- Open editor tabs
- Panel layout preferences
- Active thread ID
- Current file path
- Last accessed timestamps (in-memory)

**Read Pattern:** `useStore(useShallow(s => s.sessionValue))`  
**Write Pattern:** `useStore.getState().setSessionValue(value)`  
**Hydration Pattern:** On mount, read from L3 (Dexie) and populate L2

```typescript
// Hydration example
useEffect(() => {
  const hydrate = async () => {
    const lastProject = await db.projects.orderBy('lastAccessed').last();
    if (lastProject) {
      useSessionStore.getState().setActiveProject(lastProject.id);
    }
  };
  hydrate();
}, []);
```

---

### L3: Persisted State

| Property | Value |
|----------|-------|
| **Technology** | Dexie.js (IndexedDB) |
| **Purpose** | Long-term storage, source of truth |
| **TTL** | Permanent (until explicit delete) |
| **Scope** | All projects, settings |

**Contains:**
- Project metadata (name, created, lastAccessed)
- Conversation threads and messages
- User preferences (theme, language)
- BYOK API keys (encrypted)
- Note metadata
- Plugin preferences

**Read Pattern:** `useLiveQuery(() => db.collection.toArray())`  
**Write Pattern:** `await db.collection.put(entity)`  
**Source of Truth:** YES - Dexie owns this data

```typescript
// Correct Dexie read
const projects = useLiveQuery(() => db.projects.toArray()) ?? [];

// Correct Dexie write
await db.projects.put({ id, name, lastAccessed: Date.now() });
```

---

### L4: File State

| Property | Value |
|----------|-------|
| **Technology** | FSA (desktop) / SQLite+OPFS (mobile) |
| **Purpose** | Actual file content |
| **TTL** | Permanent (file system) |
| **Scope** | Project files |

**Contains:**
- Source code files
- Markdown notes
- Configuration files
- Any user-created content

**Read Pattern:** `await gateway.read(path)`  
**Write Pattern:** `await gateway.write(path, content)`  
**Source of Truth:** YES - File system is authoritative

**Critical:** All file operations MUST go through the sync engine. Never access FSA or IndexedDB directly for file content.

---

## Boundary Rules (NON-NEGOTIABLE)

### Rule 1: No Zustand Persist for Dexie-Owned Data

**NEVER** use Zustand's persist middleware for data that belongs in Dexie.

**Why:** Creates dual source of truth. Zustand persist writes to localStorage, Dexie writes to IndexedDB. They will diverge.

**Enforcement:** Lint rule in Phase 09

---

### Rule 2: Always useShallow() for Zustand Selectors

**ALWAYS** wrap Zustand selectors with `useShallow()`.

**Why:** Prevents re-render cascades when unrelated state changes.

```typescript
// ❌ WRONG: Re-renders on ANY state change
const { panelOpen, activeTab } = useLayoutStore();

// ✅ CORRECT: Only re-renders when panelOpen or activeTab change
const { panelOpen, activeTab } = useLayoutStore(
  useShallow((s) => ({ panelOpen: s.panelOpen, activeTab: s.activeTab }))
);
```

**Enforcement:** ESLint rule + custom lint rule in Phase 09

---

### Rule 3: Always useLiveQuery() for Dexie Data

**ALWAYS** use `useLiveQuery()` when reading Dexie data in components.

**Why:** Ensures reactivity. Dexie data can change from other tabs, other components, or background sync. Without `useLiveQuery()`, your component shows stale data.

```typescript
// ❌ WRONG: Stale data after any external update
const [projects, setProjects] = useState([]);
useEffect(() => {
  db.projects.toArray().then(setProjects);
}, []);

// ✅ CORRECT: Reactive to all Dexie changes
const projects = useLiveQuery(() => db.projects.toArray()) ?? [];
```

**Enforcement:** Custom lint rule in Phase 09

---

### Rule 4: File Operations Through Sync Engine

**ALWAYS** use the sync engine (gateway) for file operations. Never access FSA or IndexedDB directly.

**Why:** The sync engine:
- Handles platform detection (FSA vs IndexedDB)
- Manages write locks
- Triggers UI updates
- Handles errors consistently

```typescript
// ❌ WRONG: Direct FSA access
const handle = await window.showOpenFilePicker();
const file = await handle[0].getFile();

// ✅ CORRECT: Through gateway
const content = await gateway.read(filePath);
await gateway.write(filePath, newContent);
```

**Enforcement:** Import restrictions in Phase 09

---

## Anti-Patterns

### Anti-Pattern 1: Zustand Persist for Projects

```typescript
// ❌ WRONG: Projects in Zustand with persist
const useProjectStore = create(
  persist(
    (set) => ({
      projects: [],
      addProject: (p) => set((s) => ({ projects: [...s.projects, p] })),
    }),
    { name: 'projects' }
  )
);
```

**Problem:** Projects now live in localStorage AND need to sync with Dexie. Two sources of truth = data loss.

---

### Anti-Pattern 2: Direct State Access Without Selector

```typescript
// ❌ WRONG: Destructuring without useShallow
const { isOpen, position, size, config } = useLayoutStore();
```

**Problem:** Component re-renders when ANY of these values change, even if you only use `isOpen`.

---

### Anti-Pattern 3: Await in Component Body

```typescript
// ❌ WRONG: Fetching Dexie data with useState
function ProjectList() {
  const [projects, setProjects] = useState([]);
  
  useEffect(() => {
    db.projects.toArray().then(setProjects);
  }, []);
  
  return <>{projects.map(p => <div>{p.name}</div>)}</>;
}
```

**Problem:** If projects change in another tab or via sync, this component shows stale data.

---

### Anti-Pattern 4: Mixing Layers

```typescript
// ❌ WRONG: Reading file content and storing in Zustand
const useEditorStore = create((set) => ({
  fileContent: '', // This should be in L4!
  loadFile: async (path) => {
    const content = await gateway.read(path);
    set({ fileContent: content });
  },
}));
```

**Problem:** File content is duplicated. Changes via sync engine don't update Zustand. Edits in Zustand don't persist to file.

---

## Correct Patterns

### Pattern 1: L2 Session with L3 Hydration

```typescript
// Session store (L2)
const useSessionStore = create<SessionState>((set) => ({
  activeProjectId: null,
  setActiveProject: (id: string | null) => set({ activeProjectId: id }),
}));

// Hydration hook
function useHydrateSession() {
  useEffect(() => {
    const hydrate = async () => {
      const lastProject = await db.projects.orderBy('lastAccessed').last();
      if (lastProject) {
        useSessionStore.getState().setActiveProject(lastProject.id);
      }
    };
    hydrate();
  }, []);
}
```

---

### Pattern 2: Reactive Dexie Read

```typescript
function ProjectList() {
  // L3 read with reactivity
  const projects = useLiveQuery(() => db.projects.toArray()) ?? [];
  
  // L2 read with useShallow
  const activeId = useSessionStore(useShallow((s) => s.activeProjectId));
  
  return (
    <>
      {projects.map((p) => (
        <ProjectItem key={p.id} project={p} isActive={p.id === activeId} />
      ))}
    </>
  );
}
```

---

### Pattern 3: File Content via Gateway

```typescript
function EditorContent({ filePath }: { filePath: string }) {
  // L4 read via TanStack Query + gateway
  const { data: content, isLoading } = useQuery({
    queryKey: ['file', filePath],
    queryFn: () => gateway.read(filePath),
    staleTime: 0, // Always fresh
  });
  
  const mutation = useMutation({
    mutationFn: (newContent: string) => gateway.write(filePath, newContent),
    onSuccess: () => queryClient.invalidateQueries(['file', filePath]),
  });
  
  // ...
}
```

---

## Migration Path

### Identifying Violations

1. **Search for Zustand persist with data that should be in Dexie:**
   ```bash
   grep -r "persist(" src/ | grep -v "node_modules"
   ```

2. **Search for Zustand selectors without useShallow:**
   ```bash
   grep -r "useStore(" src/ | grep -v "useShallow"
   ```

3. **Search for Dexie reads without useLiveQuery:**
   ```bash
   grep -r "db\." src/ | grep -v "useLiveQuery"
   ```

4. **Search for direct FSA access:**
   ```bash
   grep -r "showOpenFilePicker\|showSaveFilePicker\|showDirectoryPicker" src/
   ```

### Fixing Violations

1. **Move persisted data from Zustand to Dexie:**
   - Create Dexie table if not exists
   - Migrate existing localStorage data to Dexie
   - Remove persist middleware from Zustand store
   - Add hydration on mount

2. **Add useShallow to selectors:**
   - Wrap selector function with useShallow
   - Return object with only needed properties
   - Test that unrelated state changes don't trigger re-render

3. **Switch to useLiveQuery:**
   - Replace useState + useEffect with useLiveQuery
   - Handle loading state (useLiveQuery returns undefined initially)
   - Remove manual refetch logic

4. **Route through gateway:**
   - Replace direct FSA calls with gateway methods
   - Update imports to use infrastructure layer
   - Test both desktop and mobile paths

---

## Decision Tree

Use this to determine the correct layer for new data:

```
Is this UI-only? (hover, focus, modal open)
├── YES → L1 (Zustand NO persist)
└── NO → Does it need to survive refresh?
          ├── NO → L1 (Zustand NO persist)
          └── YES → Is it user data/content?
                    ├── YES → Is it file content?
                    │         ├── YES → L4 (FSA/OPFS)
                    │         └── NO → L3 (Dexie)
                    └── NO → Is it session context?
                              ├── YES → L2 (Zustand + hydration)
                              └── NO → L3 (Dexie for preferences/settings)
```

---

## Enforcement

Phase 09 will introduce lint rules to enforce these contracts:

- [ ] ESLint rule: Zustand persist only for specific stores
- [ ] ESLint rule: useShallow required for Zustand selectors
- [ ] Custom rule: useLiveQuery required for Dexie reads in components
- [ ] Import restriction: No direct FSA imports outside infrastructure layer

Until then, code review must manually verify compliance.

---

*This contract is binding for all state management decisions.*
