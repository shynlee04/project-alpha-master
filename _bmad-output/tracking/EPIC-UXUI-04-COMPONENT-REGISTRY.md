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
|---|----------------|-----------|-------|--------|-------|-------|------|
| 1 | GlobalSidebar | | UXUI-04-02 | PENDING | | | |
| 2 | ActivityBarLeft | | UXUI-04-03 | PENDING | | | |
| 3 | ActivityBarMainTop | | UXUI-04-03 | PENDING | | | |
| 4 | ActivityBarRight | | UXUI-04-03 | PENDING | | | |
| 5 | PluginDocker | | UXUI-04-04 | PENDING | | | |
| 6 | PluginPanelLeft | | UXUI-04-05 | PENDING | | | |
| 7 | PluginPanelMain | | UXUI-04-05 | PENDING | | | |
| 8 | PluginPanelRight | | UXUI-04-05 | PENDING | | | |

### Custom Hooks

| # | Hook Name | File Path | Story | Status | Lines | Tests |
|---|-----------|-----------|-------|--------|-------|-------|
| 1 | useGlobalSidebar | | UXUI-04-02 | PENDING | | |
| 2 | useActivityBar | | UXUI-04-03 | PENDING | | |
| 3 | usePluginDocker | | UXUI-04-04 | PENDING | | |
| 4 | usePluginPanel | | UXUI-04-05 | PENDING | | |
| 5 | useDragDrop | | UXUI-04-06 | PENDING | | |
| 6 | useLayoutState | | UXUI-04-09 | PENDING | | |

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
| GlobalSidebar | ⬜ | ⬜ | ⬜ |
| ActivityBarLeft | ⬜ | ⬜ | ⬜ |
| ActivityBarMainTop | ⬜ | ⬜ | ⬜ |
| ActivityBarRight | ⬜ | ⬜ | ⬜ |
| PluginDocker | ⬜ | ⬜ | ⬜ |
| PluginPanelLeft | ⬜ | ⬜ | ⬜ |
| PluginPanelMain | ⬜ | ⬜ | ⬜ |
| PluginPanelRight | ⬜ | ⬜ | ⬜ |

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
- [ ] GlobalSidebar
- [ ] ActivityBarLeft
- [ ] ActivityBarMainTop
- [ ] ActivityBarRight
- [ ] PluginDocker
- [ ] PluginPanelLeft
- [ ] PluginPanelMain
- [ ] PluginPanelRight

**All Hooks Created**:
- [ ] useGlobalSidebar
- [ ] useActivityBar
- [ ] usePluginDocker
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

*Last Updated: 2026-01-30T14:45:00+07:00*
*Next Update: As components are created*
