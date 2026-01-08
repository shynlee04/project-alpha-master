# Re-render Analysis

## Components by Risk Level

### 🔴 High Risk (Re-renders frequently)
| Component | File | Reason | Evidence |
|-----------|------|--------|----------|
| `HubHomePage` | `HubHomePage.tsx` | `useLiveQuery` on projects | `db.projects.toArray()` |
| `NotesPage` | `NotesPage.tsx` | Store subscriptions | `useNoteStore()` (whole store?) |
| `UnifiedChatPanel` | `UnifiedChatPanel.tsx` | Message streams | Streaming updates |

### 🟡 Medium Risk
| Component | File | Reason | Evidence |
|-----------|------|--------|----------|
| `MainSidebar` | `MainSidebar.tsx` | Route/Theme changes | `useLocation`, `useTheme` |
| `AgentManager` | `AgentManager.tsx` | Agent config changes | `useAppStore` selectors |

## useLiveQuery Re-render Risks
- **HubHomePage**: Updates `lastOpened` -> DB Change -> `useLiveQuery` fires -> Re-render.
- **Fix**: Use `useLiveQuery` with specific keys or rely on loader data if possible (though `useLiveQuery` is good for reactivity).

## Store Subscription Analysis
- **useNoteStore**:
  ```typescript
  const { notesArray, ... } = useNoteStore(); // Subscribes to EVERYTHING?
  ```
  **Fix**: Use selectors! `useNoteStore(s => s.notesArray)`.

- **useAppStore**:
  ```typescript
  const { agents } = useAppStore(); // ❌ Bad if default export isn't a hook factory
  ```
  **Correction**: `useAppStore` in `use-app-store.ts` seems to be the store hook itself. If called without selector, it subscribes to entire state.
  **Fix**: Always use selectors: `useAppStore(s => s.agents)`.

## Optimization Recommendations
1. **Selector Pattern**: Enforce `useStore(s => s.slice)` pattern across codebase to prevent re-renders on unrelated state changes.
2. **Virtualization**: Ensure `SourceCardGrid` and `NotesList` use virtualization (`react-window`) for large datasets.
