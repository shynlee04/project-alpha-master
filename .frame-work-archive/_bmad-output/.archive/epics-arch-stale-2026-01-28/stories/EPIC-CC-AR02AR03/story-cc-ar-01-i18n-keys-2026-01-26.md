# Story CC-AR-01: Add All Missing i18n Translation Keys

**Story ID:** CC-AR-01
**Epic:** EPIC-CC-AR02AR03
**Type:** Correct-Course
**Created:** 2026-01-26
**Status:** IN_PROGRESS
**Priority:** P0
**Team:** Team A
**Effort:** 2 hours
**Depends On:** None

---

## YAML Frontmatter

```yaml
story_id: CC-AR-01
epic_id: EPIC-CC-AR02AR03
title: "Add All Missing i18n Translation Keys"
priority: P0
status: IN_PROGRESS
team: A
effort_hours: 2
depends_on: []
blocks: [CC-AR-02, CC-AR-04]
```

---

## Problem Statement

The codebase uses ~40+ plugin-related i18n translation keys that DO NOT exist in en.json or vi.json.

**Evidence (from grep scan):**
- `t('plugin.dragToReorder')` - MISSING
- `t('plugin.noPluginsTitle')` - MISSING
- `t('plugin.noPluginsDescription')` - MISSING
- `t('plugin.addPlugin')` - MISSING
- `t('plugin.allPluginsActive')` - MISSING
- `t('plugin.activePlugins')` - MISSING
- `t('plugin.layoutMode')` - MISSING
- `t('plugin.layout1Column')` through `t('plugin.layout2Plus1')` - ALL MISSING
- `t('plugins.fileTree.name')`, `t('plugins.monaco.name')`, etc. - ALL MISSING
- `t('plugins.manager.*')`, `t('plugins.settings.*')`, `t('plugins.marketplace.*')` - ALL MISSING

**Current State:**
Only 3 keys exist in en.json:
- `pluginPanel.dragAriaLabel`
- `pluginPanel.dragHandleTooltip`
- `pluginPanel.announcement.moved`

**Impact:** UI shows raw translation keys like `plugin.noPluginsTitle` instead of actual text.

---

## Files to Modify

```
src/i18n/en.json
src/i18n/vi.json
```

---

## Required Keys to Add

### plugin.* Keys (English)

```json
{
  "plugin.dragToReorder": "Drag to reorder",
  "plugin.noPluginsTitle": "No plugins loaded",
  "plugin.noPluginsDescription": "Add plugins to start working",
  "plugin.addPlugin": "Add Plugin",
  "plugin.allPluginsActive": "All plugins are active",
  "plugin.activePlugins": "active plugins",
  "plugin.layoutMode": "Layout",
  "plugin.layout1Column": "1 Column",
  "plugin.layout2Column": "2 Columns",
  "plugin.layout3Column": "3 Columns",
  "plugin.layout2Plus1": "2 + 1",
  "plugin.add": "Add",
  "plugin.notFound": "Plugin not found",
  "plugin.closePanel": "Close {{pluginName}}"
}
```

### plugins.*.name Keys (English)

```json
{
  "plugins.fileTree.name": "File Tree",
  "plugins.monaco.name": "Code Editor",
  "plugins.terminal.name": "Terminal",
  "plugins.chat.name": "AI Chat",
  "plugins.notes.name": "Notes",
  "plugins.agents.name": "Agents",
  "plugins.preview.name": "Preview"
}
```

### plugins.manager.* Keys (English)

```json
{
  "plugins.manager.confirmUninstall": "Are you sure you want to uninstall this plugin?",
  "plugins.manager.noPlugins": "No plugins installed",
  "plugins.manager.builtin": "Built-in",
  "plugins.manager.deactivate": "Deactivate",
  "plugins.manager.activate": "Activate",
  "plugins.manager.uninstall": "Uninstall"
}
```

### plugins.settings.* Keys (English)

```json
{
  "plugins.settings.confirmClearData": "Are you sure you want to clear all plugin data?",
  "plugins.settings.permissions": "Permissions",
  "plugins.settings.granted": "Granted",
  "plugins.settings.denied": "Denied",
  "plugins.settings.dataManagement": "Data Management",
  "plugins.settings.clearDataDescription": "Clear all data stored by this plugin. This action cannot be undone.",
  "plugins.settings.clearData": "Clear Data",
  "plugins.settings.statistics": "Statistics",
  "plugins.settings.timesActivated": "Times Activated",
  "plugins.settings.lastActivated": "Last Activated",
  "plugins.settings.installedAt": "Installed At",
  "plugins.settings.lastError": "Last Error"
}
```

### plugins.marketplace.* Keys (English)

```json
{
  "plugins.marketplace.title": "Plugin Marketplace",
  "plugins.marketplace.filters": "Filters",
  "plugins.marketplace.searchPlaceholder": "Search plugins...",
  "plugins.marketplace.allCategories": "All",
  "plugins.marketplace.loading": "Loading plugins...",
  "plugins.marketplace.noResults": "No plugins found",
  "plugins.marketplace.clearFilters": "Clear Filters",
  "plugins.marketplace.downloads": "downloads",
  "plugins.marketplace.installed": "Installed",
  "plugins.marketplace.install": "Install"
}
```

---

## Vietnamese Translations

### plugin.* Keys (Vietnamese)

```json
{
  "plugin.dragToReorder": "Keo de sap xep lai",
  "plugin.noPluginsTitle": "Khong co plugin nao",
  "plugin.noPluginsDescription": "Them plugin de bat dau lam viec",
  "plugin.addPlugin": "Them Plugin",
  "plugin.allPluginsActive": "Tat ca plugin dang hoat dong",
  "plugin.activePlugins": "plugin dang hoat dong",
  "plugin.layoutMode": "Bo cuc",
  "plugin.layout1Column": "1 Cot",
  "plugin.layout2Column": "2 Cot",
  "plugin.layout3Column": "3 Cot",
  "plugin.layout2Plus1": "2 + 1",
  "plugin.add": "Them",
  "plugin.notFound": "Khong tim thay plugin",
  "plugin.closePanel": "Dong {{pluginName}}"
}
```

### plugins.*.name Keys (Vietnamese)

```json
{
  "plugins.fileTree.name": "Cay thu muc",
  "plugins.monaco.name": "Trinh soan thao",
  "plugins.terminal.name": "Terminal",
  "plugins.chat.name": "Chat AI",
  "plugins.notes.name": "Ghi chu",
  "plugins.agents.name": "Agents",
  "plugins.preview.name": "Xem truoc"
}
```

### plugins.manager.* Keys (Vietnamese)

```json
{
  "plugins.manager.confirmUninstall": "Ban co chac chan muon go plugin nay?",
  "plugins.manager.noPlugins": "Chua co plugin nao",
  "plugins.manager.builtin": "Co san",
  "plugins.manager.deactivate": "Vo hieu hoa",
  "plugins.manager.activate": "Kich hoat",
  "plugins.manager.uninstall": "Go bo"
}
```

### plugins.settings.* Keys (Vietnamese)

```json
{
  "plugins.settings.confirmClearData": "Ban co chac chan muon xoa tat ca du lieu plugin?",
  "plugins.settings.permissions": "Quyen",
  "plugins.settings.granted": "Da cap",
  "plugins.settings.denied": "Tu choi",
  "plugins.settings.dataManagement": "Quan ly du lieu",
  "plugins.settings.clearDataDescription": "Xoa tat ca du lieu cua plugin nay. Hanh dong nay khong the hoan tac.",
  "plugins.settings.clearData": "Xoa du lieu",
  "plugins.settings.statistics": "Thong ke",
  "plugins.settings.timesActivated": "So lan kich hoat",
  "plugins.settings.lastActivated": "Kich hoat lan cuoi",
  "plugins.settings.installedAt": "Ngay cai dat",
  "plugins.settings.lastError": "Loi gan nhat"
}
```

### plugins.marketplace.* Keys (Vietnamese)

```json
{
  "plugins.marketplace.title": "Cho Plugin",
  "plugins.marketplace.filters": "Bo loc",
  "plugins.marketplace.searchPlaceholder": "Tim kiem plugin...",
  "plugins.marketplace.allCategories": "Tat ca",
  "plugins.marketplace.loading": "Dang tai plugin...",
  "plugins.marketplace.noResults": "Khong tim thay plugin",
  "plugins.marketplace.clearFilters": "Xoa bo loc",
  "plugins.marketplace.downloads": "luot tai",
  "plugins.marketplace.installed": "Da cai dat",
  "plugins.marketplace.install": "Cai dat"
}
```

---

## Acceptance Criteria

- [ ] AC1: All 40+ keys added to en.json
- [ ] AC2: All 40+ keys translated and added to vi.json
- [ ] AC3: No raw translation keys visible in UI
- [ ] AC4: TypeScript: 0 new errors
- [ ] AC5: Manual test: Toggle language, verify translations

---

## Validation Gate

```bash
# After implementation, run:
pnpm tsc --noEmit

# Verify all keys exist (should find all used keys in en.json):
grep -c "plugin\." src/i18n/en.json
# Should return count > 40
```

---

## Implementation Notes

1. Add keys at the END of the JSON file (before the closing `}`)
2. Keep existing keys unchanged
3. Use proper Vietnamese diacritics for vi.json translations
4. Test by switching language in the UI

---

## Handoff Artifact

After completion, create:
- `_bmad-output/handoffs/2026-01-26/CC-AR-01-COMPLETION-2026-01-26.md`

---

*Created: 2026-01-26*
*Story Type: Correct-Course*
*Related Stories: CC-AR-02, CC-AR-04*
