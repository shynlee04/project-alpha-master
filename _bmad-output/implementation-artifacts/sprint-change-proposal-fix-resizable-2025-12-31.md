# Sprint Change Proposal: Fix Start/Layout Regression & Restore Resizable UI

**Date:** 2025-12-31
**Author:** Antigravity (Implementation Agent)
**Status:** PROPOSED

## 1. Issue Summary
**Trigger:** Regression in `src/components/ui/resizable.tsx` identified during active sprint, plus user request to restore dynamic layouts in Note/Knowledge spaces.
**Problem:** 
1. The `resizable.tsx` component uses invalid exports (`Group`, `Separator`) for the installed `react-resizable-panels@4.1.0`.
2. The "Notes" and "Knowledge" pages currently use static flex layouts because the resizable implementation was previously broken/disabled.
**Impact:** `CRITICAL` - Blocked IDE layout, broken Permission overlay, and missing feature (resizable panes) in main workspaces.

## 2. Impact Analysis
*   **Epics:** Affects Epic-23 (UX/UI Modernization) and Epic-31 (Ralph Loop).
*   **Artifacts:**
    *   `src/components/ui/resizable.tsx`: Requires API correction.
    *   `src/components/notes/NotesPage.tsx`: Requires refactor to `ResizablePanelGroup`.
    *   `src/components/knowledge/KnowledgePage.tsx`: Requires refactor to `ResizablePanelGroup`.
    *   `src/components/common/ErrorBoundary.tsx`: Recommended wrapper for safety.

## 3. Recommended Approach
**Path Forward:** **Option 4: Batch Hotfix & Feature Restoration**
**Rationale:** Fixing the root cause (`resizable.tsx`) allows us to immediately enable the intended dynamic layouts for Notes and Knowledge pages without risk.

## 4. Detailed Change Proposals

### Artifact: `src/components/ui/resizable.tsx`
**Change:** Restore correct component references.
```tsx
// NEW (Fixed)
<ResizablePrimitive.PanelGroup ...>
<ResizablePrimitive.PanelResizeHandle ...>
```

### Artifact: `src/components/notes/NotesPage.tsx`
**Change:** Replace Flexbox layout with Resizable Panels (Desktop only).
*   **Structure:** `PanelGroup(horizontal)` -> `Panel(sidebar)` -> `Handle` -> `Panel(editor)`
*   **Default Sizes:** Sidebar (20%), Editor (80%)

### Artifact: `src/components/knowledge/KnowledgePage.tsx`
**Change:** Replace 3-column Flex layout with Resizable Panels (Desktop only).
*   **Structure:** `PanelGroup(horizontal)`
    *   `Panel(Source Library)` (20%)
    *   `Handle`
    *   `Panel(Canvas)` (50%)
    *   `Handle`
    *   `Panel(RAG)` (30%)

## 5. Implementation Handoff
*   **Scope:** Moderate (Fix + localized refactor)
*   **Route To:** Development Team (Self)
*   **Success Criteria:**
    1.  IDE Layout renders without errors.
    2.  Notes Page has resizable sidebar.
    3.  Knowledge Page has resizable 3-pane layout.
