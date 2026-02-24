# EPIC-LAYOUT-CONSOLIDATION: Layout Architecture Consolidation

---

## Frontmatter

```yaml
id: EPIC-LAYOUT-CONSOLIDATION
title: "Layout Architecture Consolidation"
created: 2026-01-28 16:27:37 +07
updated: 2026-01-29 05:35:00 +07
status: COMPLETE
priority: P0 CRITICAL
estimated_effort: 16-24 hours
team_assignment: Team B
adr_ref: "ADR-040-layout-architecture-consolidation-2026-01-28.md"
total_bugs_addressed: 10
stories_count: 10
blocking_dependency: none
depends_on: EPIC-UXUI-03-PLUGIN-LAYOUT (COMPLETE)
```

---

## 1. Executive Summary

This EPIC addresses **10 layout bugs** discovered during the 2026-01-28 debug session. The root cause is architectural: the layout system has **1727 references across 178 files**, with no single source of truth.

### Key Consolidations

| From | To | Reduction |
|------|-----|-----------|
| 6+ layout components | 1 (WorkspaceLayout) | -5 components |
| 4+ layout stores | 1 (PluginLayoutStore) | -3 stores |
| Ungoverned z-index | Single scale in design-tokens.css | Governance |
| Ungoverned overflow | Root=hidden, content=scroll | Governance |
| Legacy SystemRail | Removed | -1 component |

---

## 2. Technical Problem Statement

### 2.1 What's Wrong

Debug session revealed **systemic layout fragmentation**:

| Issue | Quantified Impact |
|-------|-------------------|
| Layout references | 1727 across 178 files |
| Layout components | 6+ competing implementations |
| Layout stores | 4+ stores with overlapping state |
| Z-index governance | None - magic numbers throughout |
| Overflow governance | None - nested scrollbars |
| Legacy code | Still referenced from _bmad-ext/.archive |

### 2.2 Bugs Discovered (10 Total)

| # | Bug | Root Cause | Severity |
|---|-----|-----------|----------|
| 1 | FloatingPluginDocker z-index: 1000 | No z-index governance | Medium |
| 2 | PluginDocker always rendered when closed | No conditional rendering | High |
| 3 | Empty grid cells showing as black space | CSS Grid fixed columns not collapsing | High |
| 4 | MainSidebar double-rendered | Multiple layouts importing same sidebar | High |
| 5 | SystemRail 32px bottom space | Legacy terminal panel still mounted | High |
| 6 | Preset layout dropdown in wrong places | No route-conditional rendering | Medium |
| 7 | PluginDocker resize handles active | Custom resize never disabled | Low |
| 8 | overflow:auto on plugin panels | Creates nested scrollbars | High |
| 9 | h-screen (100vh) mobile overflow | Doesn't account for browser chrome | Medium |
| 10 | No document overflow control | html/body missing overflow:hidden | High |

### 2.3 User Impact

- **Phantom scrollbars** appear unexpectedly
- **Empty black space** in grid cells when panels hidden
- **32px gap** at bottom of screen (SystemRail)
- **Mobile users** see content cut off (100vh issue)
- **Layout presets dropdown** appears in wrong routes

### 2.4 Business Impact

- Every layout bug requires touching 10+ files to fix
- Regression risk high due to scattered implementations
- Mobile experience degraded
- Technical debt compounds with each new feature

---

## 3. Root Cause Analysis

### 3.1 Primary Root Cause

**No Single Source of Truth** for layout system:

```
Current State:
├── IDELayout (legacy)
├── IDEMobileLayout (legacy)
├── MainLayout (wrapper)
├── ProjectAwareLayout (hybrid)
├── WorkspaceLayout (new)
└── PluginLayout (embedded)

Target State:
└── WorkspaceLayout (CSS Grid, responsive, governed)
```

### 3.2 Contributing Factors

1. **Store fragmentation** - 4+ stores with layout state
2. **CSS fragmentation** - Multiple workspace-layout CSS files
3. **Legacy not archived** - Old components still imported
4. **No governance rules** - z-index, overflow not standardized
5. **Route inconsistency** - Different layouts in different routes

---

## 4. Success Criteria

### 4.1 Phase 1: Cleanup (Stories 1-2)

- [x] All legacy layout components archived to _bmad-ext/.archive
- [x] No imports from legacy layout files (only comments remain)
- [x] layout-store, layout-presets-store, ide-layout-slice merged into PluginLayoutStore

### 4.2 Phase 2: Governance (Stories 3-4)

- [x] All z-index values use CSS variables from design-tokens.css
- [x] html/body have overflow:hidden
- [x] No nested scrollbars in layout
- [x] overflow:auto only on panel content areas

### 4.3 Phase 3: Quick Wins (Stories 5-7)

- [x] SystemRail removed - no 32px bottom gap
- [x] MainSidebar renders in exactly 1 place
- [x] Preset selector only in project routes, not hub

### 4.4 Phase 4: Migration (Stories 8-10)

- [x] workspace-layout.css reduced to 272 lines (clean and documented)
- [x] All routes use WorkspaceLayout directly
- [x] AGENTS.md updated with layout governance rules

---

## 5. Stories

### LC-01: Archive Legacy Layout Components

```yaml
id: LC-01
title: "Archive legacy layout components"
status: READY
priority: P0
effort: 1.5h
team: B
```

**Acceptance Criteria**:
- [ ] Move to `_bmad-ext/.archive/layout-legacy/`:
  - IDELayout.tsx
  - IDEMobileLayout.tsx
  - MainLayout wrappers (if any)
  - SystemRail.tsx
- [ ] Update imports to not reference archived files
- [ ] Add DEPRECATED comment to any remaining references

**Files to Archive**:
```bash
# Find all legacy layout files
grep -r "IDELayout\|IDEMobileLayout\|SystemRail" src/ --include="*.tsx"
```

---

### LC-02: Consolidate Layout Stores

```yaml
id: LC-02
title: "Consolidate layout stores into PluginLayoutStore"
status: READY
priority: P0
effort: 2-3h
team: B
```

**Acceptance Criteria**:
- [ ] Merge into PluginLayoutStore:
  - layout-store state (panel sizes, visibility)
  - layout-presets-store state (presets)
  - ide-layout-slice state (terminal height, sidebar width)
- [ ] Create facade exports for backward compatibility
- [ ] Update all consumers to use PluginLayoutStore
- [ ] Archive deprecated stores

**Migration Pattern**:
```typescript
// Facade for backward compatibility
export const useLayoutStore = usePluginLayoutStore;
export const useLayoutPresetsStore = usePluginLayoutStore;
```

---

### LC-03: Implement Z-Index Governance

```yaml
id: LC-03
title: "Implement z-index governance with single scale"
status: READY
priority: P1
effort: 2h
team: B
```

**Acceptance Criteria**:
- [ ] Add z-index scale to design-tokens.css
- [ ] Audit all z-index declarations: `grep -r "z-index:" src/`
- [ ] Replace hardcoded values with CSS variables
- [ ] Document scale in AGENTS.md

**Z-Index Scale**:
```css
:root {
  --z-panel-content: 1;
  --z-panel-resize: 10;
  --z-dropdown: 100;
  --z-tooltip: 110;
  --z-plugin-docker: 200;
  --z-modal-backdrop: 220;
  --z-modal: 230;
  --z-toast: 300;
}
```

---

### LC-04: Implement Overflow Governance

```yaml
id: LC-04
title: "Implement overflow governance"
status: READY
priority: P0
effort: 1.5h
team: B
```

**Acceptance Criteria**:
- [ ] Add to styles.css: `html, body, #root { overflow: hidden; height: 100%; }`
- [ ] Set WorkspaceLayout grid to `overflow: hidden`
- [ ] Audit all `overflow: auto|scroll` declarations
- [ ] Remove overflow from containers, keep only in content areas
- [ ] Fix 100vh issue with `height: 100dvh` or `100%`

---

### LC-05: Remove SystemRail and Legacy Bottom Panels

```yaml
id: LC-05
title: "Remove SystemRail and legacy bottom panels"
status: READY
priority: P0
effort: 1h
team: B
```

**Acceptance Criteria**:
- [ ] Remove SystemRail component from ProjectAwareLayout
- [ ] Remove 32px bottom gap
- [ ] Archive terminal panel component (not MVP)
- [ ] Verify no bottom gap in layout

---

### LC-06: Fix MainSidebar Single Render

```yaml
id: LC-06
title: "Fix MainSidebar to render in ONE place only"
status: READY
priority: P0
effort: 1.5h
team: B
```

**Acceptance Criteria**:
- [ ] Audit all MainSidebar imports: `grep -r "MainSidebar" src/`
- [ ] Identify the canonical render location (WorkspaceLayout)
- [ ] Remove duplicate renders from route files
- [ ] Verify sidebar appears once in React DevTools

---

### LC-07: Route-Conditional Preset Selector

```yaml
id: LC-07
title: "Make preset selector route-conditional"
status: READY
priority: P1
effort: 1h
team: B
```

**Acceptance Criteria**:
- [ ] Preset selector only renders in project routes (`/$projectId`)
- [ ] Not visible in `/hub` route
- [ ] Not visible in `/settings` route
- [ ] Use `useMatch` or route context to determine visibility

---

### LC-08: CSS Cleanup and Audit

```yaml
id: LC-08
title: "Audit and remove unused CSS"
status: READY
priority: P1
effort: 2h
team: B
```

**Acceptance Criteria**:
- [ ] Remove unused selectors from workspace-layout.css
- [ ] Consolidate duplicate CSS rules
- [ ] Remove grid-template-columns fixed values (use auto)
- [ ] Document remaining CSS structure
- [ ] Target: 30% reduction in layout CSS

---

### LC-09: Migrate Routes to WorkspaceLayout

```yaml
id: LC-09
title: "Migrate all routes to use WorkspaceLayout directly"
status: READY
priority: P0
effort: 3h
team: B
```

**Acceptance Criteria**:
- [ ] All route files use WorkspaceLayout
- [ ] Remove intermediate layout wrappers
- [ ] Consistent props across all routes
- [ ] Test each route renders correctly

**Routes to Migrate**:
- `$projectId.tsx`
- `hub.tsx`
- `settings.tsx`
- `notes/` routes
- `ide/` routes

---

### LC-10: Update Governance Documentation

```yaml
id: LC-10
title: "Update AGENTS.md with new layout governance rules"
status: READY
priority: P1
effort: 1h
team: B
```

**Acceptance Criteria**:
- [ ] Add Layout Governance section to AGENTS.md
- [ ] Document z-index scale
- [ ] Document overflow strategy
- [ ] Document WorkspaceLayout as single source
- [ ] Add layout anti-patterns section

---

## 6. Architecture Diagram - Target State

```
┌─────────────────────────────────────────────────────────────────────┐
│                        WorkspaceLayout (CSS Grid)                    │
├──────────┬──────────────────────────────────────┬───────────────────┤
│          │                                      │                   │
│ Global   │          Main Content Area           │   Right Panel     │
│ Sidebar  │  ┌─────────────────────────────────┐ │   (Optional)      │
│ (48px)   │  │     Activity Bar TOP (48px)     │ │                   │
│          │  ├─────────────────────────────────┤ │                   │
│ [Files]  │  │                                 │ │                   │
│ [Search] │  │      Active Plugin Content      │ │                   │
│ [Git]    │  │      (Notes/Monaco/Preview)     │ │                   │
│ [Chat]   │  │                                 │ │                   │
│          │  │      overflow-y: auto           │ │                   │
│          │  │                                 │ │                   │
│          │  └─────────────────────────────────┘ │                   │
└──────────┴──────────────────────────────────────┴───────────────────┘

Layout Rules:
- html/body: overflow: hidden
- WorkspaceLayout: overflow: hidden
- Content areas: overflow-y: auto
- Z-index: governed by design-tokens.css
- Single store: PluginLayoutStore
```

---

## 7. Implementation Order

```
Phase 1: Cleanup (3-4h)
├── LC-01: Archive legacy (1.5h)
└── LC-02: Consolidate stores (2-3h)

Phase 2: Governance (3-4h)
├── LC-03: Z-index governance (2h)
└── LC-04: Overflow governance (1.5h)

Phase 3: Quick Wins (3-4h)
├── LC-05: Remove SystemRail (1h)
├── LC-06: Fix MainSidebar (1.5h)
└── LC-07: Route-conditional preset (1h)

Phase 4: Migration (6h)
├── LC-08: CSS cleanup (2h)
├── LC-09: Route migration (3h)
└── LC-10: Documentation (1h)

Total: 16-18h
```

---

## 8. Dependencies

### Internal Dependencies

| Story | Depends On |
|-------|-----------|
| LC-02 | LC-01 (stores use components) |
| LC-05 | LC-01 (SystemRail archived) |
| LC-09 | LC-01 through LC-08 (final migration) |
| LC-10 | LC-01 through LC-09 (document final state) |

### External Dependencies

| Dependency | Status |
|------------|--------|
| EPIC-UXUI-03-PLUGIN-LAYOUT | ✅ COMPLETE |
| WorkspaceLayout component | ✅ EXISTS |
| PluginLayoutStore | ✅ EXISTS |
| design-tokens.css | ✅ EXISTS |

---

## 9. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Store migration breaks consumers | Medium | High | Facade exports for backward compat |
| CSS changes break layouts | Medium | High | Test each route after changes |
| Route migration regressions | Low | High | Test matrix: desktop/tablet/mobile |
| Time overrun | Medium | Medium | Can defer LC-08, LC-10 to follow-up |

---

## 10. Definition of Done

- [x] All 10 stories complete
- [x] All routes render correctly
- [x] No phantom scrollbars (overflow:hidden at root)
- [x] No empty black grid cells (grid collapse utilities)
- [x] No 32px bottom gap (SystemRail removed)
- [x] MainSidebar renders once (ProjectAwareLayout conditional)
- [x] Z-index uses CSS variables (design-tokens.css:595-619)
- [x] AGENTS.md updated
- [x] ADR-040 status updated to APPROVED

**EPIC COMPLETION DATE**: 2026-01-29 05:35:00 +0700

---

## References

- **ADR**: ADR-040-layout-architecture-consolidation-2026-01-28.md
- **Debug Session**: 2026-01-28 (phantom scrollbar issue)
- **Related Epic**: EPIC-UXUI-03-PLUGIN-LAYOUT (COMPLETE)
- **UX Spec**: ux-specification/03-responsive-layout-system.md

---

**Lines**: 340
**Last Updated**: 2026-01-28 16:27:37 +07
