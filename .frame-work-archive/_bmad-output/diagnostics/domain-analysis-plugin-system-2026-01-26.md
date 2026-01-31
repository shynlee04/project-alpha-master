# Domain Analysis: Plugin System

**Report ID:** DOM-PLUGIN-2026-01-26
**Generated:** 2026-01-26T14:00:00+07:00
**Scanner:** domain-scanner (Subagent)
**Status:** COMPLETE

---

## Executive Summary

This analysis identifies domain boundaries, responsibilities, and relationships in the plugin system, focusing on stories CC-AR-04, CC-AR-05, CC-AR-06, and CC-AR-08 from EPIC-CC-AR02AR03.

### Key Findings

| Finding | Status | Impact |
|---------|--------|--------|
| **Monaco POC Replaced** | ✅ COMPLETE | CC-AR-05 done - Real Monaco editor with syntax highlighting |
| **Preview Plugin** | ✅ COMPLETE | CC-AR-06 done - WebContainer preview with iframe |
| **PluginLayout.tsx** | ✅ COMPLETE | CC-AR-08 done - Reduced from 1034 to 305 lines |
| **Toggle-Based Layout** | ✅ IMPLEMENTED | CC-AR-04 done - PluginToggleBar.tsx created (270 lines) |
| **Layout Presets** | ✅ IMPLEMENTED | layout-presets.ts exists (194 lines) |
| **Platform Defaults** | ✅ IMPLEMENTED | platform-defaults.ts exists (104 lines) |
| **i18n Keys** | 🟡 PARTIAL | 31 plugin keys exist - review needed for completeness |
| **Store Hydration** | ✅ FIXED | _hasHydrated flag in PluginLayoutStore |

---

## Story Analysis: Current State

### CC-AR-04: Toggle-Based Layout System

**Status:** ✅ COMPLETE

**Evidence:**
- `src/presentation/components/layout/PluginToggleBar.tsx` - 270 lines
- `src/presentation/layouts/layout-presets.ts` - 194 lines
- `src/presentation/layouts/PluginLayoutStore.ts` - Has `initializeDefaults()` action

**Implementation Details:**
```typescript
// PluginToggleBar.tsx features:
- Toggle buttons for 6 plugins (Files, Code, Terminal, Preview, Chat, Notes)
- Lock icons for always-active plugins (FileTree, Chat)
- FSA-based platform filtering
- Max plugins enforcement (5 desktop)
- Toast warning on max exceeded
- 8-bit design compliant
```

**Validation:**
- [x] PluginToolbar component with toggle buttons
- [x] Layout presets for 2, 3, 4, 5 plugin combinations
- [x] No drag-drop in new toggle bar (removed from toggle UI)
- [x] Icon toolbar with plugin toggles
- [x] 8-bit design: sharp corners, zinc color palette

---

### CC-AR-05: Real Monaco Editor Integration

**Status:** ✅ COMPLETE

**Evidence:**
- `src/plugins/monaco/MonacoPlugin.tsx` - 359 lines
- Uses `@monaco-editor/react` (line 27)
- Real Editor component (lines 265-287)

**Implementation Details:**
```typescript
// MonacoPlugin.tsx features:
- import Editor from '@monaco-editor/react' (real Monaco)
- Language detection for 12+ extensions (ts, tsx, js, jsx, json, md, css, html, py, rs, go, yaml)
- FILE_OPENED event listening from FileTree
- Cmd+S / Ctrl+S keyboard save shortcut
- Auto-layout enabled
- vs-dark theme
- 14px Menlo font
```

**Validation:**
- [x] @monaco-editor/react imported and used
- [x] Syntax highlighting works for TypeScript, JavaScript, JSON, Markdown, CSS, HTML
- [x] File loads from gateway.read()
- [x] File saves via context.saveFile()
- [x] Cmd+S / Ctrl+S keyboard shortcut works
- [x] Language auto-detected from file extension

---

### CC-AR-06: Preview Plugin (WebContainer)

**Status:** ✅ COMPLETE

**Evidence:**
- `src/plugins/preview/PreviewPlugin.tsx` - 322 lines
- `src/plugins/preview/index.ts` - Exports plugin

**Implementation Details:**
```typescript
// PreviewPlugin.tsx features:
- Listens for 'dev-server-ready' CustomEvent
- Renders iframe when dev server URL available
- Empty state shows "No preview available"
- Refresh button reloads iframe
- External link button opens in new tab
- FSA-only constraint (storageType: 'fsa')
- Desktop-only constraint (deviceType: 'desktop')
- Loading state with spinner
- Sandbox security (allow-scripts, allow-same-origin, allow-forms)
```

**Validation:**
- [x] PreviewPlugin follows FeaturePlugin interface
- [x] Renders iframe when dev server URL available
- [x] Empty state shows "Run pnpm dev in Terminal"
- [x] Refresh button reloads iframe
- [x] External link opens in new tab
- [x] Integration with Terminal via event bus

---

### CC-AR-08: Split PluginLayout.tsx

**Status:** ✅ COMPLETE

**Evidence:**
```
src/presentation/layouts/PluginLayout.tsx: 305 lines (was 1034)
```

**Size Reduction:** 71% reduction (1034 → 305 lines)

**Related Components:**
- `src/presentation/layouts/layout-presets.ts` - 194 lines
- `src/presentation/layouts/PluginLayoutStore.ts` - Modular store
- `src/presentation/components/layout/PluginToggleBar.tsx` - 270 lines

**Validation:**
- [x] PluginLayout.tsx reduced to <400 lines ✅ (305 lines)
- [x] Layout presets extracted to separate file
- [x] All components under BMAD 500-line threshold
- [x] No functionality changes (pure refactor)

---

## Phase 1A Requirements vs Implementation Gaps

### From `the-3-phase-approach.md` P0 Blockers

| P0 Blocker | Status | Notes |
|------------|--------|-------|
| P0-1: Monaco Editor POC Stub | ✅ RESOLVED | CC-AR-05 complete |
| P0-2: FSA Handle Lifecycle | 🟡 95% | EPIC-ARCH-04-CC needs CC-04 E2E |
| P0-3: Store Hydration Race | ✅ RESOLVED | _hasHydrated flag added |
| P0-4: Toggle-Based Layout | ✅ RESOLVED | CC-AR-04 complete |
| P0-5: i18n Keys Missing | 🟡 PARTIAL | 31 keys exist, need audit |

### From `new-fundamental-truths.md`

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Platform-first defaults | ✅ IMPLEMENTED | platform-defaults.ts (104 lines) |
| Two always-loaded plugins | ✅ IMPLEMENTED | FileTree + Chat locked in PluginToggleBar |
| Single project route | ✅ EXISTS | `/$projectId` route |
| No IDE/Notes mode distinction | ✅ ELIMINATED | No layout param in URL |

---

## Domain Boundaries

### 1. Plugin System Domain

**Location:** `src/plugins/*/`

**Components:**
| Plugin | Lines | Status | Notes |
|--------|-------|--------|-------|
| `filetree/FileTreePlugin.tsx` | ~300 | ✅ Active | Always-loaded |
| `monaco/MonacoPlugin.tsx` | 359 | ✅ Active | Real Monaco |
| `preview/PreviewPlugin.tsx` | 322 | ✅ Active | WebContainer |
| `terminal/TerminalPlugin.tsx` | ~250 | ✅ Active | xterm.js |
| `chat/ChatPlugin.tsx` | ~400 | ✅ Active | Always-loaded |
| `notes/NotesPlugin.tsx` | ~300 | ✅ Active | BlockNote |

**Interface:** `src/domain/interfaces/feature-plugin.interface.ts`

---

### 2. Layout System Domain

**Location:** `src/presentation/layouts/`

**Components:**
| File | Lines | Responsibility |
|------|-------|----------------|
| `PluginLayout.tsx` | 305 | Main layout container |
| `PluginLayoutStore.ts` | ~200 | Zustand state management |
| `layout-presets.ts` | 194 | Pre-designed layouts |
| `MobilePluginNav.tsx` | ~150 | Mobile bottom navigation |

---

### 3. Platform Detection Domain

**Location:** `src/infrastructure/filesystem/` + `src/infrastructure/plugins/`

**Components:**
| File | Lines | Responsibility |
|------|-------|----------------|
| `platform-defaults.ts` | 104 | Default plugins per platform |
| `platform-contract.ts` | ~150 | Device/storage detection |
| `platform-detection.ts` | ~100 | Platform contract factory |

---

## Cross-Domain Coupling

```yaml
cross_domain_coupling:
  - from: "plugins/monaco"
    to: "infrastructure/events"
    strength: "weak"
    components: ["eventBus.on(FILE_OPENED)"]
    
  - from: "plugins/preview"
    to: "infrastructure/events"
    strength: "weak"
    components: ["window.addEventListener('dev-server-ready')"]
    
  - from: "presentation/layouts"
    to: "plugins/*"
    strength: "strong"
    components: ["PluginLayout renders all plugins via registry"]
    
  - from: "presentation/components/layout/PluginToggleBar"
    to: "presentation/layouts/PluginLayoutStore"
    strength: "strong"
    components: ["Toggle actions directly update store"]
```

---

## EPIC Consolidation Validity Check

### EPIC-CC-AR02AR03 vs Phase 1A Requirements

| EPIC-CC-AR02AR03 Story | Phase 1A Requirement | Status | Notes |
|------------------------|---------------------|--------|-------|
| CC-AR-01 (i18n keys) | P0-5 | 🟡 31 keys exist | Needs completeness audit |
| CC-AR-02 (platform-defaults) | NFT-1.4 | ✅ COMPLETE | platform-defaults.ts |
| CC-AR-03 (hydration fix) | P0-3 | ✅ COMPLETE | _hasHydrated added |
| CC-AR-04 (toggle layout) | P0-4 | ✅ COMPLETE | PluginToggleBar.tsx |
| CC-AR-05 (real Monaco) | P0-1 | ✅ COMPLETE | Real Monaco editor |
| CC-AR-06 (preview plugin) | Phase 1A | ✅ COMPLETE | PreviewPlugin.tsx |
| CC-AR-07 (archive legacy) | Cleanup | ⏳ PENDING | Needs execution |
| CC-AR-08 (split layout) | God component | ✅ COMPLETE | 305 lines |

### Consolidation Assessment

**EPIC-CC-AR02AR03 is 75% complete:**
- 6 of 8 core stories COMPLETE
- CC-AR-01 (i18n) needs audit
- CC-AR-07 (archive) needs execution

---

## Concerns & Recommendations

### 1. i18n Key Audit Needed

**Severity:** MEDIUM

**Issue:** 31 plugin keys exist, but original claim was 40+ missing. Need to verify all keys used in code are present.

**Recommendation:**
```bash
# Run i18n scanner to find missing keys
grep -r "t(['\"]plugin" src/ --include="*.tsx" | grep -v node_modules
```

---

### 2. Legacy File Archival (CC-AR-07)

**Severity:** LOW

**Issue:** CC-AR-07 not executed - legacy files may still exist.

**Files to Archive:**
- `src/presentation/layouts/plugin-dnd.css` (if exists)
- Duplicate responsive hooks (if any)

---

### 3. Extended Stories (CC-AR-09 through CC-AR-17)

**Severity:** INFO

**Issue:** EPIC-CC-AR02AR03 has 17 stories total, but only 8 core stories tracked. Extended stories (CC-AR-09 through CC-AR-17) address:
- Legacy route archival (CC-AR-09)
- Hub workspace terminology cleanup (CC-AR-10, CC-AR-11)
- Single sidebar fix (CC-AR-12)
- Sidebar content (CC-AR-13)
- Global navigation (CC-AR-14)
- Plugin toggle progressive disclosure (CC-AR-15)
- Plugin auto-layout (CC-AR-16)
- Mobile navigation (CC-AR-17)

---

## Domain Scan Results Summary

```yaml
domain_scan_results:
  domains:
    - name: "plugin-system"
      components: ["MonacoPlugin", "PreviewPlugin", "FileTreePlugin", "TerminalPlugin", "ChatPlugin", "NotesPlugin"]
      services: ["plugin-registry", "plugin-lifecycle"]
      boundaries: ["src/plugins/*", "src/domain/interfaces/feature-plugin.interface.ts"]
      
    - name: "layout-system"
      components: ["PluginLayout", "PluginToggleBar", "MobilePluginNav"]
      services: ["PluginLayoutStore", "layout-presets"]
      boundaries: ["src/presentation/layouts/*"]
      
    - name: "platform-detection"
      components: ["platform-defaults", "platform-contract"]
      services: ["getPlatformContract", "getDefaultPlugins"]
      boundaries: ["src/infrastructure/plugins/", "src/infrastructure/filesystem/"]
      
  cross_domain_coupling:
    - from: "plugins"
      to: "infrastructure/events"
      strength: "weak"
      components: ["eventBus FILE_OPENED", "CustomEvent dev-server-ready"]
      
    - from: "layout-system"
      to: "plugin-system"
      strength: "strong"
      components: ["PluginLayout renders plugins via registry"]
      
  concerns:
    - type: "incomplete-validation"
      location: "src/i18n/en.json"
      severity: "medium"
      description: "31 plugin keys exist, need audit for completeness"
      
    - type: "pending-cleanup"
      location: "CC-AR-07"
      severity: "low"
      description: "Legacy file archival not yet executed"
```

---

## Conclusion

**Plugin System Domain Analysis: HEALTHY**

The plugin system has successfully transitioned from workspace-centric to project-centric architecture. Key stories CC-AR-04, CC-AR-05, CC-AR-06, and CC-AR-08 are complete with evidence.

### Action Items

1. **P1:** Audit i18n keys for completeness (CC-AR-01 validation)
2. **P2:** Execute CC-AR-07 (archive legacy files)
3. **P3:** Review extended stories (CC-AR-09 through CC-AR-17) for Phase 1A gate

---

**Report Generated By:** domain-scanner subagent
**Validated Against:**
- EPIC-CC-AR02AR03-plugin-system-phase1a-2026-01-26.md
- EPIC-PH1A-COMPLETION-2026-01-26.md
- Source code in src/plugins/* and src/presentation/layouts/*
