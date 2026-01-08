# Initial Load Analysis

## Load Sequence
| Phase | Duration Est | Blocking? | Files |
|-------|--------------|-----------|-------|
| **Bundle fetch** | ~500ms | Yes | `index.html`, `main.tsx` |
| **React init** | ~100ms | Yes | `__root.tsx` providers |
| **Provider init** | ~200ms | Yes | `UnifiedWorkspaceProvider`, `AppInitializer` |
| **Route render** | ~50ms | Yes | `HubHomePage` |
| **Data load** | ~100ms | Partial | `useLiveQuery` (projects) |

## Heavy Dependencies
| Package | Size Est | Used In | Lazy? |
|---------|----------|---------|-------|
| `@xenova/transformers` | ~30MB+ (models) | Knowledge (RAG) | ⚠️ Check |
| `monaco-editor` | ~2MB | IDE | ✅ Lazy loaded |
| `@blocknote` | ~500KB | Notes | ✅ Lazy loaded |
| `pdfjs-dist` | ~300KB | Knowledge | ⚠️ Check |

## Blocking Operations
| Operation | File:Line | Phase | Impact |
|-----------|-----------|-------|--------|
| `initSentry` | `__root.tsx` | Init | Low |
| `AppInitializer` | `__root.tsx` | Init | Medium (Dexie init) |
| `BootSequence` | `HubHomePage.tsx` | Render | High (Artificial 2s delay) |

## Code Splitting Status
| Route | Lazy Loaded? | Dependencies |
|-------|--------------|--------------|
| `/notes` | ✅ Yes | `@blocknote` |
| `/ide` | ✅ Yes | `monaco-editor` |
| `/knowledge` | ✅ Yes | `@xenova/transformers` |
| `/study` | ✅ Yes | - |

## Recommendations
1. **Remove BootSequence**: The artificial delay in `HubHomePage` slows down perceived performance for returning users.
2. **Lazy Load Transformers**: Ensure `@xenova/transformers` is only loaded when RAG features are actually used, not just when Knowledge workspace loads.
