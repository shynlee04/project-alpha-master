# Story: LT-4.20 Knowledge Workspace Light Theme

## Story Metadata
- **ID:** LT-4.20
- **Title:** Knowledge Workspace Light Theme
- **Priority:** P1
- **Sprint:** Light Theme Sprint
- **Week:** 4
- **Status:** ready-for-dev
- **Component:** Knowledge Workspace (Canvas, Cards)

## Description
Migrate the Knowledge Workspace and its key sub-components (Canvas, Nodes, Source Cards) to fully support the light theme using the new design system tokens.

## Tasks
1.  **Knowledge Page Layout**: Update `KnowledgePage.tsx` to use correct background/text tokens (`bg-background`, `text-foreground`).
2.  **Canvas**: Update `Canvas.tsx` (React Flow) to support light theme:
    -   Update background color to `hsl(var(--background))` or `hsl(var(--muted))`.
    -   Update grid dots/lines color to be visible on light background.
    -   Ensure controls/minimap are themed.
3.  **Nodes**: Update `ConceptNode.tsx`, `SourceNode.tsx`, `CodeConceptNode.tsx`:
    -   Use `bg-card`, `text-card-foreground`.
    -   Update borders (`border-border`).
    -   Update handles for visibility.
4.  **Edges**: Update `RelationshipEdge.tsx` to ensure path color is visible in light theme (e.g., `stroke-foreground` or specific edge color).
5.  **Source Cards**: Update `SourceCard.tsx` and `SourceCardGrid.tsx`:
    -   Ensure cards use `bg-card` and correct shadows/borders.
    -   Update hover states.

## Acceptance Criteria
- [ ] **Knowledge Page**: Background is light in light mode, dark in dark mode.
- [ ] **Canvas**: Grid is visible in both modes. Background contrast is correct.
- [ ] **Nodes**: Node content is readable. Selected state is visible.
- [ ] **Edges**: Connections between nodes are clearly visible in light mode.
- [ ] **Source Cards**: Cards in the list/grid look correct and follow the Card component design.
- [ ] **Accessibility**: Text contrast meets WCAG AA standards.

## Technical Notes
-   React Flow might need a `colorMode` prop or style injection for its internal components (minimap, controls).
-   Canvas background is often set via CSS on the `.react-flow__background` class or via the `Background` component props.
-   Edges usually use SVG stroke; ensure they use a CSS variable or a class that adapts.
