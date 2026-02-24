# ═════════════════════════════════════════════════════════════════════════════
# EPIC-UXUI-04 COMPONENT REGISTRY
# Created: 2026-01-30T14:45:00+07:00
# Status: PENDING (To be populated during Stories 2-9)
# Purpose: Track all new components created
# ═════════════════════════════════════════════════════════════════════════════

## 📋 REGISTRY INSTRUCTIONS

**This document tracks ALL new components created during EPIC-UXUI-04**
**Update as each component is created**
**Reference for maintenance and future development**

---

## 🗂️ COMPONENT INVENTORY

### Layout Components

| # | Component Name | File Path | Story | Status | Lines | Tests | Docs |
|---|---|----------------|-----------|-------|--------|-------|-------|------|
| 1 | GlobalSidebar | `src/presentation/components/layout/GlobalSidebar.tsx` | UXUI-04-02 | ✅ COMPLETE | 180 | - | - |
| 1a | GlobalSidebarNavItem | `src/presentation/components/layout/GlobalSidebarNavItem.tsx` | UXUI-04-02 | ✅ COMPLETE | 83 | - | - |
| 1b | GlobalSidebarTooltip | `src/presentation/components/layout/GlobalSidebarTooltip.tsx` | UXUI-04-02 | ✅ COMPLETE | 51 | - | - |
| 1c | types | `src/presentation/components/layout/types.ts` | UXUI-04-02 | ✅ COMPLETE | 187 | - | - |
| 2 | ActivityBarLeft | `src/presentation/components/layout/ActivityBarLeft.tsx` | UXUI-04-03 | ✅ COMPLETE | 130 | - | - |
| 3 | ActivityBarMainTop | `src/presentation/components/layout/ActivityBarMainTop.tsx` | UXUI-04-03 | ✅ COMPLETE | 135 | - | - |
| 4 | ActivityBarRight | `src/presentation/components/layout/ActivityBarRight.tsx` | UXUI-04-03 | ✅ COMPLETE | 130 | - | - |
| 4a | activity-bar-types | `src/presentation/components/layout/activity-bar-types.ts` | UXUI-04-03 | ✅ COMPLETE | - | - | - |
| 5 | PluginDocker | `src/presentation/components/layout/PluginDocker.tsx` | UXUI-04-04 | ✅ COMPLETE | 229 | - | - |
| 5a | PluginDockerItem | `src/presentation/components/layout/PluginDockerItem.tsx` | UXUI-04-04 | ✅ COMPLETE | 181 | - | - |
| 5b | docker-types | `src/presentation/components/layout/docker-types.ts` | UXUI-04-04 | ✅ COMPLETE | 163 | - | - |
| 6 | PluginPanelContainer | `src/presentation/components/layout/PluginPanelContainer.tsx` | UXUI-04-05 | ✅ COMPLETE | 167 | - | - |
| 6a | PluginPanelLeft | `src/presentation/components/layout/PluginPanelLeft.tsx` | UXUI-04-05 | ✅ COMPLETE | 38 | - | - |
| 6b | PluginPanelMain | `src/presentation/components/layout/PluginPanelMain.tsx` | UXUI-04-05 | ✅ COMPLETE | 38 | - | - |
| 6c | PluginPanelRight | `src/presentation/components/layout/PluginPanelRight.tsx` | UXUI-04-05 | ✅ COMPLETE | 38 | - | - |
| 6d | plugin-panel-types | `src/presentation/components/layout/plugin-panel-types.ts` | UXUI-04-05 | ✅ COMPLETE | 165 | - | - |
| 6e | plugin-placeholders | `src/presentation/components/layout/plugin-placeholders.tsx` | UXUI-04-05 | ✅ COMPLETE | 186 | - | - |
| 7 | ResponsiveLayout | `src/presentation/components/layout/ResponsiveLayout.tsx` | UXUI-04-07 | ✅ COMPLETE | 267 | - | - |
| 7a | ResponsiveLayout.css | `src/presentation/components/layout/ResponsiveLayout.css` | UXUI-04-07 | ✅ COMPLETE | 267 | - | - |
| 7b | BottomNavigation | `src/presentation/components/layout/BottomNavigation.tsx` | UXUI-04-07 | ✅ COMPLETE | 245 | - | - |
| 7c | BottomNavigation.css | `src/presentation/components/layout/BottomNavigation.css` | UXUI-04-07 | ✅ COMPLETE | 245 | - | - |
| 7d | responsive-types | `src/presentation/components/layout/responsive-types.ts` | UXUI-04-07 | ✅ COMPLETE | 312 | - | - |
| 8 | WriteLockIndicator | `src/presentation/components/layout/WriteLockIndicator.tsx` | UXUI-04-08 | ✅ COMPLETE | 316 | - | - |
| 8a | WriteLockIndicator.css | `src/presentation/components/layout/WriteLockIndicator.css` | UXUI-04-08 | ✅ COMPLETE | 370 | - | - |

### Custom Hooks

| # | Hook Name | File Path | Story | Status | Lines | Tests |
|---|---|-----------|-----------|-------|--------|-------|-------|
| 1 | useGlobalSidebar | `src/presentation/hooks/useGlobalSidebar.ts` | UXUI-04-02 | ✅ COMPLETE | 31 | - |
| 1a | useSidebarState | `src/presentation/hooks/useSidebarState.ts` | UXUI-04-02 | ✅ COMPLETE | 128 | - |
| 2 | useActivityBar | `src/presentation/hooks/useActivityBar.ts` | UXUI-04-03 | ✅ COMPLETE | 165 | - |
| 3 | usePluginDocker | `src/presentation/hooks/usePluginDocker.ts` | UXUI-04-04 | ✅ COMPLETE | 296 | - |
| 4 | usePluginPanel | `src/presentation/hooks/usePluginPanel.ts` | UXUI-04-05 | ✅ COMPLETE | 211 | - |
| 5 | useDragDrop | `src/presentation/hooks/useDragDrop.ts` | UXUI-04-06 | ✅ COMPLETE | 296 | - |
| 6 | useBreakpoint | `src/presentation/hooks/useBreakpoint.ts` | UXUI-04-07 | ✅ COMPLETE | 145 | - |
| 7 | useResponsiveLayout | `src/presentation/hooks/useResponsiveLayout.ts` | UXUI-04-07 | ✅ COMPLETE | 198 | - |
| 8 | usePluginCoordination | `src/presentation/hooks/usePluginCoordination.ts` | UXUI-04-08 | ✅ COMPLETE | 477 | - |

### State Management

| # | Store/Context | File Path | Story | Status | Lines | Tests |
|---|---------------|-----------|-------|--------|-------|-------|
| 1 | layout-store.ts | | UXUI-04-09 | PENDING | | |
| 2 | LayoutContext | | UXUI-04-09 | PENDING | | |

### Utility Functions

| # | Function | File Path | Story | Status | Lines | Tests |
|---|----------|-----------|-------|--------|-------|-------|
| 1 | | | | PENDING | | |

---

## 📊 COMPONENT METRICS

### Code Quality

| Metric | Target | Current |
|--------|--------|---------|
| Max lines per component | 300 | - |
| Test coverage | >80% | - |
| TypeScript strict | Yes | - |
| Documentation | Required | - |

### Design Compliance

| Component | 8-Bit Design | Responsive | Accessible |
|-----------|--------------|------------|------------|
| GlobalSidebar | ✅ | ✅ | ✅ |
| ActivityBarLeft | ✅ | ✅ | ✅ |
| ActivityBarMainTop | ✅ | ✅ | ✅ |
| ActivityBarRight | ✅ | ✅ | ✅ |
| PluginDocker | ✅ | ✅ | ✅ |
| PluginPanelLeft | ✅ | ✅ | ✅ |
| PluginPanelMain | ✅ | ✅ | ✅ |
| PluginPanelRight | ✅ | ✅ | ✅ |

---

## 🔗 DEPENDENCY GRAPH

```
GlobalSidebar
    ↓
ActivityBarLeft ←→ ActivityBarMainTop ←→ ActivityBarRight
    ↓                       ↓                       ↓
PluginPanelLeft      PluginPanelMain      PluginPanelRight
    ↓                       ↓                       ↓
    └──────────────────┬────────────────────┘
                       ↓
                 PluginDocker
                       ↓
                 DragDropSystem
                       ↓
             ResponsiveLayout
                       ↓
         PluginCoordination
                       ↓
            PersistenceLayer
```

---

## 📝 COMPONENT DOCUMENTATION

### GlobalSidebar

**Purpose**: Collapsible global navigation sidebar
**Props**:
- `isExpanded: boolean`
- `onToggle: () => void`
- `projects: Project[]`

**Usage**:
```tsx
<GlobalSidebar 
  isExpanded={isExpanded}
  onToggle={handleToggle}
  projects={projects}
/>
```

---

### ActivityBarLeft

**Purpose**: Left-side activity bar for plugins
**Props**:
- `plugins: PluginInstance[]`
- `activePluginId: string | null`
- `onPluginToggle: (id: string) => void`

**Usage**:
```tsx
<ActivityBarLeft
  plugins={leftPlugins}
  activePluginId={activeLeftPlugin}
  onPluginToggle={handleToggle}
/>
```

---

*(Additional component docs to be added as created)*

---

## ✅ COMPLETION CHECKLIST

**All Components Created**:
- [x] GlobalSidebar
- [x] ActivityBarLeft
- [x] ActivityBarMainTop
- [x] ActivityBarRight
- [x] PluginDocker
- [ ] PluginPanelLeft
- [ ] PluginPanelMain
- [ ] PluginPanelRight

**All Hooks Created**:
- [x] useGlobalSidebar
- [x] useActivityBar
- [x] usePluginDocker
- [ ] usePluginPanel
- [ ] useDragDrop
- [ ] useLayoutState

**All Stores Created**:
- [ ] layout-store.ts
- [ ] LayoutContext

**Quality Checks**:
- [ ] All components <300 lines
- [ ] All components tested
- [ ] All components documented
- [ ] 8-bit design compliance
- [ ] Responsive design
- [ ] Accessibility (WCAG 2.1 AA)

---

*Last Updated: 2026-01-30T22:00:00+07:00*
*Next Update: As components are created*
