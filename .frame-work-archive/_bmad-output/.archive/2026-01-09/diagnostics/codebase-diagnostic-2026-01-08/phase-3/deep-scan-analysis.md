## Deep Scan: Patterns & Practices

### State Management
**Dominant Pattern**: Zustand
- **Zustand Imports**: 179 files (Heavy usage)
- **Persisted Stores**: 35 (Significant state persistence)
- **React Context**: 15 (Used sparingly, likely for dependency injection or theme)

*Analysis*: The project is heavily invested in Zustand for global state. The high number of persisted stores (35) aligns with the "Local-First" architecture mentioned in the project context, but requires careful schema management (Dexie/LocalStorage) to avoid migration issues.

### Security & Storage
| Pattern | Count | Risk | Analysis |
|---------|-------|------|----------|
| `dangerouslySetInnerHTML` | 4 | 🟠 Medium | Low usage, but each instance requires manual audit for XSS vulnerabilities. |
| `eval()` | 4 | 🔴 Critical | `eval()` is generally unsafe. Verify if this is essential (e.g., for the WebContainer/Terminal logic) or technical debt. |
| `localStorage` | 313 | 🟡 Caution | Very high usage. Direct `localStorage` access bypasses state management abstraction and can lead to hydration mismatches in SSR/SSG. |
| `sessionStorage` | 13 | 🟢 Low | Minimal usage. |

### React Performance
| Hook/Pattern | Count | Analysis |
|--------------|-------|----------|
| `useEffect` | 524 | High usage. Common source of re-render loops if dependencies aren't managed. |
| `useCallback` | 721 | Very high usage. Indicates a strong focus on referential stability, likely to prevent unnecessary re-renders in child components. |
| `useMemo` | 226 | Moderate usage for expensive calculations. |
| `React.memo` | 1 | Extremely low. Suggests components are not being memoized at the component level, relying instead on hook memoization or fast re-renders. |

### Data Fetching
- **TanStack Query (`useQuery`)**: 2 usages (Surprisingly low for a modern stack).
- **Raw `fetch`**: 35 usages.
- *Analysis*: The low usage of TanStack Query (2) vs raw `fetch` (35) is unexpected given `package.json` includes `@tanstack/react-query` (via `react-router-ssr-query` or similar). This suggests the project might be using a custom data fetching layer or relying heavily on local state/WebContainer interactions rather than traditional REST/GraphQL APIs.

### Recommendations
1.  **Audit `eval()`**: Locate the 4 instances of `eval()` and determine if they can be replaced with `Function` constructor or a safer sandboxing mechanism (though WebContainers might require it).
2.  **LocalStorage Abstraction**: Refactor direct `localStorage` calls into a unified storage adapter (or strictly use the existing `dexie-storage` / Zustand persist middleware) to ensure type safety and consistency.
3.  **Effect Cleanup**: With 524 `useEffect` hooks, ensure cleanup functions are returned where necessary to prevent memory leaks, especially in the "Agent" and "WebContainer" logic.
4.  **XSS Audit**: Manually review the 4 `dangerouslySetInnerHTML` usages.
