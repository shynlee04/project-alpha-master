# State Refactoring Plan - DEFERRED

**Date**: 2025-12-26
**Priority**: P0
**Status**: DEFERRED (to avoid MVP-3 interference)
**Original Issue**: [IDELayout.tsx state duplication](src/components/layout/IDELayout.tsx)

## Executive Summary

[`IDELayout.tsx`](src/components/layout/IDELayout.tsx) contains state that duplicates [`useIDEStore`](src/lib/state/ide-store.ts). This is a P0 issue per the state management audit, but refactoring is **DEFERRED** until after MVP-3 completion to avoid introducing instability during active development.

## Issue Details

### Duplicated State Found
| State Property | Location | Should Be |
|----------------|----------|-----------|
| `isChatVisible` | `useState` (line 86-87) | `useIDEStore(s => s.chatVisible)` |
| `terminalTab` | `useState` (line 88-89) | `useIDEStore(s => s.terminalTab)` |
| `activeFilePath` | `useState` (line 91-92) | `useIDEStore(s => s.activeFile)` |
| `openFiles` | Derived from local state | `useIDEStore(s => s.openFiles)` |

### Current Implementation
```typescript
// src/components/layout/IDELayout.tsx:86-92
const chatVisible = useIDEStore((s) => s.chatVisible);  // ✓ From store
const setChatVisible = useIDEStore((s) => s.setChatVisible); // ✓ From store
const terminalTab = useIDEStore((s) => s.terminalTab);  // ✓ From store
const setTerminalTab = useIDEStore((s) => s.setTerminalTab); // ✓ From store
const openFilePaths = useIDEStore((s) => s.openFiles);  // ✓ From store
const activeFilePath = useIDEStore((s) => s.activeFile); // ✓ From store
const setActiveFilePath = useIDEStore((s) => s.setActiveFile); // ✓ From store

// Lines 97-106: Ephemeral local state (acceptable)
const [selectedFilePath, setSelectedFilePath] = useState<string | undefined>();
const [fileTreeRefreshKey, setFileTreeRefreshKey] = useState(0);
const [fileContentCache, setFileContentCache] = useState<Map<string, string>>(new Map());
```

### Updated Analysis (2025-12-26)
After re-examining [`IDELayout.tsx`](src/components/layout/IDELayout.tsx), the state duplication concern appears to be **already mitigated**:

1. **Persisted state IS from store**: Lines 86-94 correctly use `useIDEStore` for `chatVisible`, `terminalTab`, `openFiles`, and `activeFile`
2. **Ephemeral state is local**: Lines 97-106 use `useState` for truly ephemeral UI state (`selectedFilePath`, `fileTreeRefreshKey`, `fileContentCache`)

This is actually **correct architecture** - persisted state in Zustand, ephemeral UI state in local React state.

## Proposed Refactoring (For Future)

### If Refactoring Is Needed
```typescript
// Replace local selectedFilePath with store
const selectedFilePath = useIDEStore((s) => s.selectedFilePath);
const setSelectedFilePath = useIDEStore((s) => s.setSelectedFilePath);

// fileContentCache remains local (ephemeral, performance optimization)
const [fileContentCache, setFileContentCache] = useState<Map<string, string>>(new Map());
```

### Migration Steps
1. Add `selectedFilePath` and `setSelectedFilePath` to [`useIDEStore`](src/lib/state/ide-store.ts)
2. Replace `useState` in [`IDELayout.tsx`](src/components/layout/IDELayout.tsx) with Zustand selectors
3. Update [`useIDEFileHandlers`](src/components/layout/hooks/useIDEFileHandlers.ts) to use Zustand actions
4. Remove duplicate state sync code (if any remains)
5. Test all file operations still work correctly

## Rationale for Deferral

| Factor | Decision |
|--------|----------|
| **MVP-3 Timeline** | Refactoring risks introducing bugs during active development |
| **Current Stability** | The current hybrid approach works correctly |
| **Risk Assessment** | State sync issues are the primary risk |
| **Effort** | Requires comprehensive testing of file operations |

## Future Work

This refactoring should be completed after:
- [ ] MVP-3 (Tool Execution - File Operations) is DONE
- [ ] MVP-4 (Tool Execution - Terminal Commands) is DONE
- [ ] All file operation tests pass
- [ ] Browser E2E verification completes for MVP stories

## References
- [State Management Audit](_bmad-output/state-management-audit-p1.10-2025-12-26.md)
- [IDE Store Implementation](src/lib/state/ide-store.ts)
- [IDELayout Component](src/components/layout/IDELayout.tsx)
- [IDE File Handlers Hook](src/components/layout/hooks/useIDEFileHandlers.ts)
