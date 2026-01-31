## Architecture & Dependency Analysis

### External Dependencies
**Core Stack:**
- **Framework**: React v19.2.3
- **Routing**: TanStack Router v1.144.0
- **State Management**: Zustand v5.0.9, TanStack Store v0.8.0
- **Persistence**: Dexie v4.2.1 (IndexedDB), Orama v3.1.18 (Search)
- **AI/LLM**: TanStack AI v0.2.0, Anthropic SDK, Google GenAI
- **Environment**: WebContainer API v1.6.1

**Dev Tools:**
- Vite v7.3.0
- Vitest v4.0.16
- Playwright v1.57.0
- Tailwind CSS v4.1.18

### Circular Dependencies
**Status**: ⚠️ 1 Circular Dependency Found
- `src/routeTree.gen.ts` ↔ `src/router.tsx`
  - *Note*: This involves a generated file from TanStack Router, which is often a false positive or acceptable framework behavior, but should be monitored.

### Architectural Layer Violations
**Strict Strictness Check**:
- `Infrastructure` → `Presentation`: ✅ Clean
- `Core` → `Infrastructure`: ✅ Clean
- `Core` → `Lib`: ✅ Clean

**Violations Detected (`Lib` → `Presentation`):**
The `src/lib` layer (Business Logic) should NOT depend on `src/presentation` (UI).
1. `src/lib/command-palette/index.ts`
   - Imports: `CommandPalette` from `@/presentation/components/command-palette/CommandPalette`
   - *Severity*: High (Logic depending on UI component)
2. `src/lib/media/image-attachments.ts`
   - Imports: `FileAttachment` from `@/presentation/components/chat/FileAttachmentInput`
   - *Severity*: Medium (Type import likely, but creates coupling)

### Barrel File Usage
- **Total `index.ts` files**: 135
- **`export *` usages**: 124
- *Observation*: High usage of barrel files. While convenient, indiscriminate `export *` can lead to tree-shaking issues and hidden circular dependencies.

### Recommendations
1. **Refactor `src/lib/command-palette`**: Move the UI component import out of the library logic. The library should define the interface/logic, and the presentation layer should consume it.
2. **Fix `src/lib/media`**: Extract the `FileAttachment` type to a shared `domain` or `types` file to avoid importing from `presentation`.
3. **Monitor `routeTree.gen.ts`**: Ensure this circular dependency doesn't grow to include manual files.
