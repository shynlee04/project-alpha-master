# ADR-040: Layout Architecture Consolidation

## Status
**APPROVED** | 2026-01-28 16:27:37 +07 | **IMPLEMENTED** 2026-01-29 05:30:43 +0700

### Implementation Summary (2026-01-29)

All 10 stories from EPIC-LAYOUT-CONSOLIDATION verified complete:
- LC-01: Legacy layout components archived (only JSDoc comments remain)
- LC-02: Layout stores consolidated (layout-store.ts is now a facade to PluginLayoutStore)
- LC-03: Z-index governance implemented (design-tokens.css:595-619)
- LC-04: Overflow governance implemented (styles.css:33-50)
- LC-05: SystemRail removed (no references in code)
- LC-06: MainSidebar renders in single location via ProjectAwareLayout
- LC-07: PresetSelector route-conditional (returns null outside project routes)
- LC-08: workspace-layout.css cleaned (272 lines with grid collapse utilities)
- LC-09: Routes migrated to WorkspaceLayout (via ProjectAwareLayout)
- LC-10: Governance documentation updated (AGENTS.md section, this ADR)

## Context

During debugging of the "phantom scrollbar / empty space" issue on 2026-01-28, systemic architecture problems were uncovered. The fix required touching 10+ files because the layout system is fragmented, duplicated, and poorly governed.

### Quantified Technical Debt

| Metric | Value | Impact |
|--------|-------|--------|
| Layout references | 1727 | Scattered across 178 files |
| Layout components | 6+ | IDELayout, WorkspaceLayout, MainLayout, PluginLayout, IDEMobileLayout, ProjectAwareLayout |
| Layout stores | 4+ | layout-store, layout-presets-store, PluginLayoutStore, ide-layout-slice |
| CSS z-index declarations | Ungoverned | No single scale |
| Overflow declarations | Ungoverned | Creates nested scrollbars |

### Bugs Discovered

| Bug | Root Cause | Files Affected |
|-----|-----------|----------------|
| FloatingPluginDocker z-index: 1000 | No z-index governance | FloatingPluginDocker.tsx/css |
| PluginDocker always rendered when closed | No conditional rendering | PluginActivityDockerWiring.tsx |
| Empty grid cells showing as black space | CSS Grid fixed columns not collapsing | workspace-layout.css |
| MainSidebar double-rendered | Multiple layouts importing same sidebar | 4+ route files, MainLayout, ProjectAwareLayout |
| SystemRail 32px bottom space | Legacy terminal panel still mounted | ProjectAwareLayout.tsx |
| Preset layout dropdown in wrong places | No route-conditional rendering | GlobalHeader.tsx |
| PluginDocker resize handles active | Custom resize never disabled | PluginDocker.tsx/css |
| overflow:auto on plugin panels | Creates nested scrollbars | workspace-layout.css |
| h-screen (100vh) mobile overflow | Doesn't account for browser chrome | ProjectAwareLayout.tsx, MainSidebar.tsx |
| No document overflow control | html/body missing overflow:hidden | styles.css |

### Contributing Factors

1. **No single source of truth** - Layout logic spread across 178 files
2. **Multiple competing systems** - Old IDELayout, new WorkspaceLayout, hybrid MainLayout
3. **Legacy code not archived** - _bmad-ext/.archive contains old components still referenced
4. **No CSS variable governance** - z-index, spacing, sizing scattered as magic numbers
5. **No overflow strategy** - Each component decides its own overflow behavior

---

## Decision

### 1. ONE Layout Component: WorkspaceLayout

**Decision**: Consolidate all layouts to a single `WorkspaceLayout` component (CSS Grid based).

| Deprecated Component | Replacement | Migration Path |
|---------------------|-------------|----------------|
| IDELayout | WorkspaceLayout | Remove after routes migrated |
| IDEMobileLayout | WorkspaceLayout (responsive) | Use media queries |
| MainLayout | WorkspaceLayout | Remove wrapper |
| PluginLayout | WorkspaceLayout panels | Already integrated |
| ProjectAwareLayout | WorkspaceLayout + hooks | Decompose to hooks |

**Rationale**: Single component reduces cognitive load, eliminates duplication, and provides one place to fix bugs.

### 2. ONE Layout Store: PluginLayoutStore

**Decision**: Merge all layout-related stores into `PluginLayoutStore`.

| Deprecated Store | Merge Into | State Transferred |
|-----------------|------------|-------------------|
| layout-store | PluginLayoutStore | Panel visibility, sizes |
| layout-presets-store | PluginLayoutStore | Preset configurations |
| ide-layout-slice | PluginLayoutStore | IDE-specific layout state |

**Pattern**:
```typescript
// PluginLayoutStore (consolidated)
interface PluginLayoutState {
  // From PluginLayoutStore (existing)
  pluginPlacements: Record<PluginId, PanelPosition>;
  dockerVisible: boolean;
  
  // From layout-store
  panelSizes: Record<PanelPosition, number>;
  collapsedPanels: Set<PanelPosition>;
  
  // From layout-presets-store
  activePreset: PresetId;
  presets: Record<PresetId, LayoutPreset>;
  
  // From ide-layout-slice
  terminalHeight: number;
  sidebarWidth: number;
}
```

**Rationale**: Single store prevents sync bugs between layout states.

### 3. ONE Z-Index Scale

**Decision**: Define all z-index values in `design-tokens.css` with semantic naming.

```css
:root {
  /* Layout layers (0-99) */
  --z-panel-content: 1;
  --z-panel-header: 5;
  --z-panel-resize: 10;
  
  /* Floating UI (100-199) */
  --z-dropdown: 100;
  --z-tooltip: 110;
  --z-popover: 120;
  
  /* Overlays (200-299) */
  --z-plugin-docker: 200;
  --z-command-palette: 210;
  --z-modal-backdrop: 220;
  --z-modal: 230;
  
  /* Critical (300+) */
  --z-toast: 300;
  --z-global-loading: 999;
}
```

**Anti-Pattern**:
```css
/* ❌ NEVER hardcode z-index */
z-index: 1000;
z-index: 50;
z-index: 9999;
```

**Rationale**: Prevents z-index wars between components.

### 4. ONE Overflow Strategy

**Decision**: Root-level hidden, scroll in content areas only.

| Level | Overflow | Rationale |
|-------|----------|-----------|
| html, body | hidden | Prevent document-level scrollbars |
| App root (#root) | hidden | Single viewport app |
| WorkspaceLayout grid | hidden | Grid cells don't scroll |
| Panel content | auto (vertical only) | Individual panels scroll |
| Monaco/Terminal | controlled | Use their internal scrolling |

**Pattern**:
```css
/* Root - ALWAYS hidden */
html, body, #root { overflow: hidden; height: 100%; }

/* Layout grid - hidden */
.workspace-layout { overflow: hidden; }

/* Panel content - controlled scroll */
.panel-content { overflow-y: auto; overflow-x: hidden; }
```

**Rationale**: Prevents nested scrollbar issues discovered in debugging.

### 5. Remove All Legacy Components

**Decision**: Archive and remove:

| Component | Action | Reason |
|-----------|--------|--------|
| SystemRail | Archive + Remove | Creates 32px bottom gap |
| IDELayout | Archive + Remove | Replaced by WorkspaceLayout |
| IDEMobileLayout | Archive + Remove | Use responsive WorkspaceLayout |
| MainLayout wrapper | Archive + Remove | Unnecessary indirection |
| Terminal bottom panel | Archive + Conditional | Not MVP, creates layout bugs |

**Rationale**: Dead code causes confusion and bugs.

---

## Consequences

### Positive

- **Reduced complexity**: ~40% fewer layout-related files
- **Single debugging surface**: All layout bugs in one component
- **Consistent behavior**: One source of truth for z-index, overflow
- **Easier testing**: One layout to test
- **Better DX**: Clear where to make layout changes

### Negative

- **Breaking change**: Routes using old layouts must migrate
- **Store migration**: Consumers of deprecated stores need updates
- **Temporary instability**: During migration period

### Neutral

- **Learning curve**: Team must learn new patterns
- **Documentation update**: Need to update AGENTS.md with new rules

---

## Implementation

See **EPIC-LAYOUT-CONSOLIDATION** for full implementation stories.

### Migration Order

1. **Archive legacy** (no breaking changes)
2. **Consolidate stores** (internal refactor)
3. **Z-index governance** (CSS only)
4. **Overflow governance** (CSS only)
5. **Remove SystemRail** (quick win)
6. **Fix MainSidebar** (reduces duplication)
7. **Route-conditional preset** (UX fix)
8. **CSS cleanup** (reduce bundle)
9. **Route migration** (final step)
10. **Documentation** (governance enforcement)

---

## References

- Debug session: 2026-01-28 (phantom scrollbar issue)
- Related: ADR-039 (Project-Centric Architecture)
- Related: EPIC-UXUI-03 (Plugin Layout System)
- Related: UX-SPEC-GAP-ANALYSIS-2026-01-28.md

---

## Supersedes

None (new decision)

## Amends

- ADR-039: Adds layout governance rules

---

**Lines**: 185
**Last Updated**: 2026-01-28 16:27:37 +07
