# Clean Context: Device Separation + Storage Architecture

**Created**: 2026-01-18
**Status**: APPROVED
**Purpose**: Single source of truth for device separation and storage rules

---

## 1. Device Types (Definitive)

| Device Type | Storage | IDE Access | Route Guard |
|-------------|---------|------------|-------------|
| **Desktop** | FSA (File System Access) | ✅ Full | None |
| **Mobile** | DexieDB (IndexedDB) | ❌ Blocked | Redirect to Notes |
| **Tablet** | DexieDB (IndexedDB) | ❌ Blocked | Redirect to Notes |

**Rule**: Device type is detected at app startup via `PlatformContract`.

---

## 2. Storage Architecture

### Desktop (FSA)
- **Location**: `/project/notes/*.md` in user's chosen directory
- **Primary Storage**: FSA (File System Access API)
- **DexieDB Role**: Reactive cache only (UI state, metadata, preferences)
- **File Watching**: Native FileSystemObserver (Chrome 129+) with polling fallback

### Mobile/Tablet (DexieDB)
- **Location**: IndexedDB (browser storage)
- **Primary Storage**: DexieDB
- **DexieDB Role**: All file storage (no FSA support)
- **No File Watching**: Requires polling if needed

### StorageGateway Abstraction

```typescript
interface StorageGateway {
  read(path: string): Promise<Uint8Array>;
  write(path: string, data: Uint8Array): Promise<void>;
  delete(path: string): Promise<void>;
  list(path: string): Promise<FileEntry[]>;
  exists(path: string): Promise<boolean>;
  watch(path: string, callback: FileChangeCallback): () => void;
}
```

**Usage Rule**: ALWAYS use `StorageGateway` - NEVER call DexieDB directly for file operations on Desktop.

---

## 3. Route Strategy

| Device | Route | Behavior |
|--------|-------|----------|
| Desktop | `/notes/:projectId` | ✅ Opens Notes workspace |
| Desktop | `/ide/:projectId` | ✅ Opens IDE workspace |
| Mobile | `/notes/:projectId` | ✅ Opens Notes workspace |
| Mobile | `/ide/:projectId` | ❌ BLOCKED → Redirect to `/notes/:projectId` |

### Route Guard Implementation

```typescript
// In route definition or layout
const platform = getPlatformContract();

if (!platform.canAccessIDE && route.path.includes('/ide/')) {
  // Redirect to notes
  navigate('/notes/:projectId');
}
```

---

## 4. Terminology (Definitive)

### Type Definitions

```typescript
// Workspace identifier - which workspace type
type WorkspaceType = 'ide' | 'notes' | 'knowledge' | 'study';

// Physical device category
type DeviceType = 'desktop' | 'mobile' | 'tablet';

// Storage mechanism in use
type StorageType = 'fsa' | 'indexeddb';

// Combined platform contract
interface PlatformContract {
  deviceType: DeviceType;
  storageType: StorageType;
  canAccessFSA: boolean;
  canWatchFiles: boolean;
  canRunTerminal: boolean;
  canDoAgenticCoding: boolean;
  canAccessIDE: boolean;
}
```

### What Each Term Means

| Term | Meaning | Example |
|------|---------|---------|
| **WorkspaceType** | Feature area (IDE, Notes, Knowledge, Study) | `'notes'` |
| **DeviceType** | Physical device category | `'desktop'` |
| **StorageType** | Storage mechanism used | `'fsa'` |
| **Project** | Container that holds workspaces + files | Default project or custom |
| **ProjectId** | Identifier for a project | `'notes:browser-mode'` |

---

## 5. What This Means for AI Agents

### ✅ DO

1. **Use StorageGateway for all file operations**
   ```typescript
   // CORRECT
   const gateway = createStorageGateway();
   await gateway.write('/project/notes/my-note.md', content);
   ```

2. **Check PlatformContract before IDE operations**
   ```typescript
   const platform = getPlatformContract();
   if (!platform.canAccessIDE) {
     // Redirect or show message
   }
   ```

3. **Store metadata in DexieDB, files in FSA (Desktop)**
   ```typescript
   // File → FSA
   await gateway.write(path, content);
   // Metadata → DexieDB
   await db.notes.update(id, { updatedAt: now() });
   ```

4. **Handle platform-specific errors**
   ```typescript
   // FSA permission errors
   if (error.name === 'NotAllowedError') {
     // Fallback or user prompt
   }
   // DexieDB quota errors
   if (error.name === 'QuotaExceededError') {
     // Cleanup or user warning
   }
   ```

### ❌ DON'T

1. **Never call DexieDB directly for file storage on Desktop**
   ```typescript
   // WRONG - Bypasses abstraction
   db.notes.add({ content: markdown });
   ```

2. **Never assume FSA works on Mobile**
   ```typescript
   // WRONG - Will fail
   if (canAccessFSA) { ... } // Check first!
   ```

3. **Never share business logic without platform checks**
   ```typescript
   // WRONG - IDE access on mobile
   openIDE(projectId); // Must check canAccessIDE first
   ```

---

## 6. Implementation Checklist

### Priority 1: Immediate (15 min - 2 hours)

| Task | Status | Effort |
|------|--------|--------|
| Rename `WorkspaceId` → `WorkspaceType` | ⏳ | 15 min |
| Fix direct `db.notes.*` calls in note slices | ⏳ | 2 hours |
| Verify PlatformContract detection | ⏳ | 30 min |

### Priority 2: Short-term (1-2 days)

| Task | Status | Effort |
|------|--------|--------|
| Add IDE route guard for mobile | ⏳ | 1 hour |
| Create StorageIndicator component | ⏳ | 2 hours |
| Document DexieDB vs FSA usage rules | ⏳ | 1 hour |

### Priority 3: Deferred (Future Epics)

| Task | Status | Effort |
|------|--------|--------|
| Consolidate 4 sync implementations | ⏳ | 2-3 weeks |
| Split god stores (dexie-db.ts) | ⏳ | 12+ hours |
| Add ESLint rules for contracts | ⏳ | 4 hours |

---

## 7. Quick Reference

### Platform Detection

```typescript
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';

const platform = getPlatformContract();
// platform.deviceType → 'desktop' | 'mobile' | 'tablet'
// platform.storageType → 'fsa' | 'indexeddb'
// platform.canAccessFSA → true only on desktop
// platform.canAccessIDE → true only on desktop
```

### Storage Access

```typescript
import { createStorageGateway } from '@/infrastructure/filesystem/storage-gateway-factory';

const gateway = createStorageGateway();
// gateway.read(), gateway.write(), gateway.delete(), gateway.list()
// Works for both FSA (desktop) and DexieDB (mobile)
```

### File Location

| Device | Notes Location |
|--------|----------------|
| Desktop | `/project/notes/*.md` (user-selected directory) |
| Mobile | DexieDB only (no file path) |

---

## 8. Source Documents

| Document | Purpose |
|----------|---------|
| `synthesis-2026-01-18.md` | Full architecture investigation |
| `consolidated-context-2026-01-18.md` | Storage gateway context |
| `CC-DESKTOP-FSA-2026-01-18.md` | Desktop FSA migration epic |
| `ADR-033-correct-course-architectural-remediation-2026-01-16.md` | Master ADR |

---

**Document Version**: 1.0.0
**Created**: 2026-01-18
**Next Review**: Before next sprint planning
