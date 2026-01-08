# Initial Load Performance Analysis

**Date**: 2026-01-09
**Project**: Via-gent (Project Alpha)
**Analyst**: Claude Code

---

## Executive Summary

The Via-gent application has several significant performance bottlenecks during initial page load. The primary culprits are:

1. **Heavy bundle sizes** - Monaco Editor (~5MB), BlockNote (~400KB), XTerm (~300KB), and ML libraries (~800KB)
2. **Synchronous store initialization** - Zustand stores with Dexie persistence hydrate on app startup
3. **Sequential async operations** - AppInitializer runs operations sequentially that could be parallelized
4. **WebContainer boot** - ~3-5 seconds to boot WebContainer on IDE route
5. **No route-level code splitting** - Only lazy route components, not lazy-loaded data

**Estimated Total Load Time**: 8-15 seconds depending on route and network conditions

---

## Load Sequence

### Phase-by-Phase Analysis

| Phase | Duration Est | Blocking? | Files |
|-------|--------------|-----------|-------|
| HTML Document Load | 50-100ms | No | `index.html` |
| CSS Fetch | 100-200ms | No | `src/styles.css`, Google Fonts |
| JS Bundle Fetch | 2-5s | **Yes** | Vite build output (~2MB initial) |
| React Initialization | 100-200ms | **Yes** | `src/routes/__root.tsx` |
| Provider Init | 200-400ms | **Yes** | `ThemeProvider`, `LocaleProvider`, `TooltipProvider` |
| AppInitializer | 500ms-2s | **Yes** | `src/presentation/components/common/AppInitializer.tsx` |
| Zustand Store Hydration | 300-800ms | **Yes** | `useAppStore`, `useProjectStore` |
| Dexie DB Open | 200-500ms | **Yes** | `src/infrastructure/persistence/dexie-db.ts` |
| Route Render | 100-200ms | Partial | TanStack Router |
| IDE Lazy Load | 1-3s | **Yes** | `IDELayoutMain.tsx`, Monaco Editor |
| Notes Lazy Load | 500ms-1s | **Yes** | `NoteEditor.tsx`, BlockNote |
| WebContainer Boot | 3-5s | **Yes** | `src/lib/webcontainer/manager.ts` |
| Data Fetch Complete | 500ms-1s | Partial | Provider models, project list |

### Detailed Timeline

```
Timeline (Hub Route - /):
├── t=0ms: HTML document loads
├── t=50-100ms: CSS + fonts fetch
├── t=200-300ms: JS bundles start loading
├── t=2-3s: JS bundles complete download
├── t=2.2-2.5s: React runtime initializes
├── t=2.3-2.7s: Providers initialize (Theme, Locale, Tooltip)
├── t=2.5-3s: AppInitializer runs
│   ├── CredentialVault initialize (~100-200ms)
│   ├── Dexie DB open + project hydration (~300-500ms)
│   └── Model pre-fetch for all providers (~200-500ms)
├── t=3-4s: Zustand stores hydrate
├── t=3.5-4.5s: Route renders (HubHomePage)
└── t=4-5s: Initial load complete

Timeline (IDE Route - /ide):
├── t=0-5s: Same as Hub route above
├── t=5-6s: IDELayout lazy loads (~1MB JS)
├── t=5-7s: Monaco Editor lazy loads (~5MB)
├── t=7-12s: WebContainer boots (~3-5s)
└── t=12s+: IDE fully interactive

Timeline (Notes Route - /notes):
├── t=0-5s: Same as Hub route above
├── t=5-6s: Notes workspace renders
├── t=6-7s: BlockNote lazy loads (~400KB)
└── t=7-8s: Notes fully interactive
```

---

## Heavy Dependencies

### Bundle Size Breakdown

| Package | Size Est | Used In | Lazy? | Priority |
|---------|----------|---------|-------|----------|
| **monaco-editor** | ~5MB | IDE editor | Yes (route) | High |
| **@xenova/transformers** | ~800KB | ML embeddings | No | Medium |
| **@blocknote/core** | ~400KB | Notes editor | Yes (route) | High |
| **@xyflow/react** | ~200KB | Workflow builder | No | Low |
| **@xterm/xterm** | ~300KB | Terminal | Yes (route) | High |
| **@webcontainer/api** | ~200KB | Browser sandbox | Yes (route) | High |
| **recharts** | ~200KB | Charts | No | Low |
| **mermaid** | ~500KB | Diagrams | No | Low |
| **dexie** | ~100KB | IndexedDB wrapper | No | Medium |
| **zustand** | ~15KB | State management | No | Low |

### Vendor Chunk Analysis

The Vite config (`vite.config.ts:82-220`) explicitly marks these heavy libraries for SSR exclusion:

```typescript
// Heavy client-only libraries
const heavyLibraries = [
  'mermaid',           // ~500KB
  '@blocknote/react',  // ~400KB
  '@blocknote/core',
  '@blocknote/mantine',
  '@xenova/transformers', // ~800KB
  '@monaco-editor/react', // ~5MB
  'monaco-editor',
  '@xterm/xterm',      // ~300KB
  '@xyflow/react',     // ~200KB
  '@webcontainer/api', // ~200KB
  'pdfjs-dist',
  'recharts',          // ~200KB
]
```

### Import Analysis

**Synchronous imports in root:**
- `src/routes/__root.tsx:1-18` - All providers imported synchronously
- `@tanstack/react-router` - Core routing
- `react-i18next` - i18n

**Lazy-loaded routes:**
```typescript
// src/routes/ide.tsx:29-35
const IDELayout = lazy(() =>
  import('@/presentation/components/layout/IDELayoutMain').then(m => ({
    default: m.IDELayout,
  }))
);

// src/routes/notes.lazy.tsx:29
const NoteEditor = lazy(() => import('@/presentation/components/notes/NoteEditor'));
```

---

## Blocking Operations

### 1. Dexie Database Initialization

**File**: `src/infrastructure/persistence/dexie-db.ts:249-264`

```typescript
export function getDb(): ViaGentDatabase | null {
  if (typeof window === 'undefined') return null;
  if (!dbInstance) {
    dbInstance = new ViaGentDatabase();
    if (!dbOpenPromise) {
      dbOpenPromise = initializeDatabaseWithRecovery(async () => {
        await dbInstance!.open();  // BLOCKING - IndexedDB open
        return dbInstance!;
      });
    }
  }
  return dbInstance;
}
```

**Issue**: Database opens synchronously on first access, blocking UI.

**Tables initialized**:
- `projects` - Project metadata
- `ideState` - IDE panel state
- `threads` - Conversation threads
- `sources` - Knowledge sources
- `collections` - Source collections
- `notes` - Notes data
- `fileMetadata` - File metadata cache
- `toolExecutionLogs` - Tool execution history
- `fsaHandles` - FSA permission handles
- `sessionSnapshots` - Session restore data

### 2. Zustand Store Hydration

**File**: `src/infrastructure/persistence/stores/use-app-store.ts:63-256`

```typescript
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({ /* slices composed */ }),
    {
      name: 'app-state',
      storage: createJSONStorage(() => createDexieStorage('providerConfigs')),
      // ...
      onRehydrateStorage: () => async (state) => {
        // Runs migrations
        // Restores default agents/providers
        // Migrates API keys to vault
      }
    }
  )
);
```

**Issue**: Store hydration happens on app mount, blocking until complete.

### 3. AppInitializer Sequential Operations

**File**: `src/presentation/components/common/AppInitializer.tsx:39-116`

```typescript
useEffect(() => {
  const initServices = async () => {
    // 1. Initialize credential vault
    await credentialVault.initialize();
    
    // 2. Hydrate projects from Dexie
    await hydrateProjects();
    
    // 3. Run workspace bindings migration
    const migrationResult = await migrateWorkspaceBindings();
    
    // 4. Register service worker
    await registerServiceWorker();
    
    // 5. Pre-fetch models for ALL providers
    await Promise.all(providers.map(async (provider) => {
      await fetchModels(provider.id);
    }));
  };
  initServices();
}, []);
```

**Issues**:
- Operations 1-4 run sequentially, could be parallelized
- Model pre-fetch (step 5) could be deferred

### 4. WebContainer Boot

**File**: `src/lib/webcontainer/manager.ts:65-118`

```typescript
export async function boot(
    options: WebContainerManagerOptions = {}
): Promise<WebContainer> {
  // ...
  bootPromise = (async () => {
    const startTime = performance.now();
    instance = await WebContainer.boot({  // BLOCKING - 3-5 seconds
      coep: 'require-corp',
      workdirName: 'project',
      forwardPreviewErrors: true,
    });
    const bootTime = Math.round(performance.now() - startTime);
    console.log(`[WebContainer] Booted successfully in ${bootTime}ms`);
    return instance;
  })();
  return bootPromise;
}
```

**Issue**: WebContainer boot is expensive (~3-5 seconds) and synchronous on IDE route.

### 5. Heavy Component Hydration

**File**: `src/presentation/components/layout/IDELayoutMain.tsx:59-266`

The IDELayout component has many hooks that run on mount:
- `useWebContainerBoot` - Triggers WebContainer boot
- `useIDEFileHandlers` - Sets up file handlers
- `useIDEStateRestoration` - Restores IDE state
- `useFileTreeEventSubscriptions` - Subscribes to events
- `useMonacoEditorEventSubscriptions` - Monaco subscriptions

---

## Code Splitting Status

### Route-Level Lazy Loading

| Route | Lazy Loaded? | Dependencies | Chunk Size Est |
|-------|--------------|--------------|----------------|
| `/` (Hub) | No | Main bundle | ~500KB |
| `/ide` | Yes | IDELayoutMain, Monaco, XTerm | ~6MB |
| `/notes` | Yes | BlockNote, NoteEditor | ~800KB |
| `/knowledge` | Yes (placeholder) | - | - |
| `/study` | Yes | - | - |

### Component-Level Lazy Loading

| Component | Lazy? | Loaded With |
|-----------|-------|-------------|
| `IDELayoutMain` | Yes | `/ide` route |
| `NoteEditor` | Yes | `/notes` route |
| `UnifiedChatPanel` | No | Imported directly |
| `BlockNoteView` | No | Inside NoteEditor |
| `MonacoEditor` | No | Inside IDELayout |

### What's NOT Lazy-Loaded

1. **TanStack Router** - Core routing library
2. **Zustand stores** - All state management
3. **Dexie database** - All persistence
4. **Credential vault** - API key encryption
5. **Recharts** - Charting library
6. **Mermaid** - Diagram library
7. **@xenova/transformers** - ML embeddings (loaded eagerly)

---

## Recommendations

### Priority 1: Parallelize AppInitializer (Impact: HIGH)

**Current**: Sequential initialization blocks startup
**Recommendation**: Parallelize independent operations

```typescript
// BEFORE
await credentialVault.initialize();
await hydrateProjects();
await migrateWorkspaceBindings();
await registerServiceWorker();
await Promise.all(providers.map(fetchModels));

// AFTER - Parallelize independent operations
const [_, hydrateResult, migrationResult, swReg] = await Promise.all([
  credentialVault.initialize(),
  hydrateProjects(),
  migrateWorkspaceBindings(),
  registerServiceWorker(),
]);
// Defer model fetching until needed
```

**Effort**: 1-2 hours
**Impact**: 500ms-1s improvement

### Priority 2: Defer Model Pre-fetching (Impact: MEDIUM)

**Current**: AppInitializer pre-fetches models for ALL providers
**Recommendation**: Fetch models on-demand when user selects provider

```typescript
// Remove from AppInitializer
// fetchModels(provider.id) for all providers

// Add to useProviderModelsSlice - fetch only when needed
const fetchModels = useAppStore(s => s.fetchModels);
useEffect(() => {
  if (activeProviderId && !availableModels[activeProviderId]) {
    fetchModels(activeProviderId);
  }
}, [activeProviderId]);
```

**Effort**: 1 hour
**Impact**: 200-500ms improvement on initial load

### Priority 3: Lazy-Load Zustand Slices (Impact: MEDIUM)

**Current**: All slices composed into single store at import time
**Recommendation**: Split store into route-specific slices

```typescript
// BEFORE - Single massive store
export const useAppStore = create<AppState>()(...);

// AFTER - Route-specific stores
const useIDEStore = createIDEStore(); // IDE-specific state
const useNotesStore = createNotesStore(); // Notes-specific state
```

**Effort**: 4-6 hours
**Impact**: 100-300ms improvement

### Priority 4: Implement Suspense Boundaries (Impact: HIGH)

**Current**: No skeleton/loading state for heavy components
**Recommendation**: Add Suspense with skeleton for lazy components

```typescript
// BEFORE
<Suspense fallback={<IDESkeleton />}>
  <IDELayout />
</Suspense>

// AFTER - More granular Suspense
<Suspense fallback={<Skeleton className="h-96" />}>
  <MonacoEditor />
</Suspense>
<Suspense fallback={<Skeleton className="h-64" />}>
  <FileTree />
</Suspense>
```

**Effort**: 2-3 hours
**Impact**: Perceived performance improvement

### Priority 5: Optimize WebContainer Boot (Impact: HIGH)

**Current**: WebContainer boots synchronously when IDELayout mounts
**Recommendation**: Pre-boot WebContainer earlier with user interaction

```typescript
// Option A: Pre-boot on "Enter IDE" button click
const handleEnterIDE = async () => {
  await boot();  // Start boot
  navigate('/ide');  // Navigate (WebContainer already booting)
};

// Option B: Pre-boot in background after Hub loads
useEffect(() => {
  boot().catch(() => {});  // Ignore errors, just start booting
}, []);
```

**Effort**: 2 hours
**Impact**: 2-4s improvement on IDE route

### Priority 6: Add Route Prefetching (Impact: MEDIUM)

**Current**: Routes load only when navigated to
**Recommendation**: Prefetch route chunks on hover/intent

```typescript
// TanStack Router supports preloading
<Link to="/ide" onMouseEnter={() => router.preloadRoute('/ide')}>
  Enter IDE
</Link>
```

**Effort**: 1 hour
**Impact**: 500ms-1s improvement on subsequent navigations

### Priority 7: Code-Split Heavy Components (Impact: MEDIUM)

**Current**: Monaco and BlockNote imported in lazy route files
**Recommendation**: Further split within these components

```typescript
// BEFORE - Single lazy import
const MonacoEditor = lazy(() => import('./MonacoEditor'));

// AFTER - Lazy load editor features
const MonacoEditor = lazy(() => import('./MonacoEditor'));
const EditorToolbar = lazy(() => import('./EditorToolbar'));
const Minimap = lazy(() => import('./Minimap'));
```

**Effort**: 4-6 hours
**Impact**: 200-500ms improvement

### Priority 8: Add Service Worker Caching (Impact: MEDIUM)

**Current**: No service worker caching strategy
**Recommendation**: Cache static assets with service worker

```typescript
// In service-worker-registration.ts
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('static-v1').then((cache) => {
      return cache.addAll([
        '/manifest.json',
        '/favicon.ico',
        // Pre-cache critical assets
      ]);
    })
  );
});
```

**Effort**: 2-3 hours
**Impact**: 50-200ms improvement on repeat visits

---

## Implementation Priority Matrix

| Priority | Optimization | Effort | Impact | Effort/Impact |
|----------|--------------|--------|--------|---------------|
| P1 | Parallelize AppInitializer | 2h | 1s | 2h/s |
| P2 | Defer model pre-fetching | 1h | 500ms | 2h/s |
| P3 | Optimize WebContainer boot | 2h | 3s | 0.67h/s |
| P4 | Add Suspense boundaries | 3h | Perceived | Medium |
| P5 | Route prefetching | 1h | 500ms | 2h/s |
| P6 | Code-split heavy components | 6h | 500ms | 12h/s |
| P7 | Service worker caching | 3h | 200ms | 15h/s |
| P8 | Lazy-load Zustand slices | 6h | 300ms | 20h/s |

**Recommended Order**: P3 → P1 → P2 → P5 → P4 → P6 → P7 → P8

---

## Performance Testing Recommendations

To validate these optimizations, measure:

1. **Lighthouse Performance Score** - Target: 85+
2. **Time to Interactive (TTI)** - Target: <5s for Hub, <10s for IDE
3. **Largest Contentful Paint (LCP)** - Target: <2.5s
4. **First Input Delay (FID)** - Target: <100ms
5. **Bundle Analyzer** - Monitor chunk sizes over time

```bash
# Run bundle analysis
pnpm build:analyze

# Run performance test
pnpm dev && lighthouse http://localhost:3000 --output=json
```

---

## Appendix: Key File References

| File | Purpose | Relevant Lines |
|------|---------|----------------|
| `src/routes/__root.tsx` | Root layout, provider initialization | 1-113 |
| `src/presentation/components/common/AppInitializer.tsx` | App startup initialization | 39-116 |
| `src/infrastructure/persistence/dexie-db.ts` | IndexedDB initialization | 249-264 |
| `src/infrastructure/persistence/stores/use-app-store.ts` | Zustand store with hydration | 63-256 |
| `src/lib/webcontainer/manager.ts` | WebContainer singleton | 65-118 |
| `src/presentation/components/layout/hooks/useWebContainerBoot.ts` | WebContainer boot trigger | 34-79 |
| `src/routes/ide.tsx` | IDE route with lazy loading | 29-35 |
| `src/routes/notes.lazy.tsx` | Notes route with lazy loading | 29, 213-215 |
| `vite.config.ts` | Build configuration, SSR handling | 82-220 |

---

**End of Analysis**
