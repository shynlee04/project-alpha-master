# ADR-039: Consolidated Project-Centric Architecture

## Status
**APPROVED** | 2026-01-26

## Context

This ADR consolidates and supersedes:
- ADR-033: Storage Type Selection (superseded 2026-01-25)
- ADR-034: Project-Centric Architecture (superseded 2026-01-25)
- ADR-035: FSA Handle Persistence (superseded 2026-01-25)

Additional decisions added from EPIC-0 learnings.

## Decisions

### 1. Project-Centric Model

**Decision**: All application state is organized around Project entities.

| Concept | Definition |
|---------|------------|
| Project | Root entity with unique ID, storage type, and metadata |
| Storage Type | 'fsa' (desktop) or 'indexeddb' (mobile/tablet) |
| Route Structure | `/hub` (list) and `/$projectId` (single project view) |

**Rationale**: Eliminates workspace-centric pollution found in legacy code.

### 2. Storage Type Auto-Detection

**Decision**: Platform determines storage type automatically.

| Platform | Storage Type | Plugins Available |
|----------|-------------|-------------------|
| Desktop + FSA supported | fsa | All plugins |
| Desktop + no FSA | indexeddb | Notes, Chat only |
| Mobile/Tablet | indexeddb | Notes, Chat only |

**Rationale**: Simplifies UX - no user choice required.

### 3. FSA Handle Lifecycle (EPIC-0 Learning)

**Decision**: FSA handles MUST be persisted to IndexedDB and restored on route mount.

**Anti-Patterns**:
- ❌ NEVER pass handle through router state (not serializable)
- ❌ NEVER assume handle survives page reload

**Correct Flow**:
```
1. Create: persist(projectId, handle) → IndexedDB
2. Access: restoreHandle(projectId) → IndexedDB
3. Validate: queryPermission() before operations
```

### 4. Zustand Store Reactivity (EPIC-0 Learning)

**Decision**: Use individual selectors + useMemo for derived data.

**Anti-Pattern**:
```typescript
// ❌ Creates new array on every render
const items = useStore(s => s.data.map(x => transform(x)));
```

**Correct Pattern**:
```typescript
// ✅ Stable references + memoization
const data = useStore(s => s.data);
const items = useMemo(() => data.map(x => transform(x)), [data]);
```

### 5. Storage Gateway Pattern (EPIC-0 Learning)

**Decision**: Normalize list patterns for recursive traversal.

| Input | Normalized | Result |
|-------|-----------|--------|
| '.' | '**/*' | All files recursively |
| '' | '**/*' | All files recursively |

**Decision**: Return BOTH files AND directories.

```typescript
interface FileEntry {
  path: string;
  kind: 'file' | 'directory';  // REQUIRED
  size: number;
  lastModified: number;
}
```

### 6. Plugin Panel Architecture (EPIC-0.5)

**Decision**: Distinguish sidebar tabs from main panels.

| Panel Type | Location | Examples |
|------------|----------|----------|
| Sidebar Tab | Left sidebar | FileTree, Chat |
| Main Panel | Center area | Monaco, Terminal, Preview |

**Decision**: Progressive loading.

| Loading | Plugins |
|---------|---------|
| Immediate | FileTree, Chat |
| Lazy | Monaco, Terminal, Preview |

### 7. EventBus for File CRUD (EPIC-0.5)

**Decision**: All file CRUD operations MUST emit typed events.

```typescript
type FileEvent = 
  | { type: 'FILE_CREATED'; path: string }
  | { type: 'FILE_UPDATED'; path: string }
  | { type: 'FILE_DELETED'; path: string }
  | { type: 'FILE_MOVED'; from: string; to: string }
  | { type: 'FILE_RENAMED'; from: string; to: string };
```

**Decision**: Plugins MUST subscribe to relevant events.

| Plugin | Subscribes To |
|--------|---------------|
| FileTree | All file events |
| Monaco | FILE_UPDATED (external changes) |
| Notes | FILE_UPDATED (external changes) |

### 8. Auto-Save Contract (EPIC-0.5)

**Decision**: Editing plugins implement debounced auto-save.

| Parameter | Value |
|-----------|-------|
| Debounce | 500ms |
| Visual Indicator | "Saving..." → "Saved" |
| Event | FILE_SAVED emitted after success |

## Consequences

### Positive
- Single source of truth for architecture decisions
- Clear anti-patterns documented from real failures
- Plugin contracts prevent data flow issues

### Negative
- Existing code must be refactored to match decisions
- EPIC-0.5 required before Phase 1A complete

### Risks
- EventBus implementation adds complexity
- Auto-save may cause performance issues on large files

## References

- `new-fundamental-truths.md v2.0.0`
- `architecture.md v3.1.0`
- `EPIC-0-PROJECT-CENTRIC-RESET-2026-01-26.md`
- `EPIC-0.5-FILETREE-PLUGIN-MATURITY-2026-01-26.md`
