# EPIC-CC-AR02AR03: Plugin System Complete Rework for Phase 1A

**Epic ID:** EPIC-CC-AR02AR03
**Type:** Correct-Course (Remediation)
**Created:** 2026-01-26
**Updated:** 2026-01-26
**Status:** APPROVED
**Priority:** P0 (BLOCKING - Phase 1A Cannot Proceed Without This)
**Estimated Duration:** 16-24 hours (2-3 days)
**Target Completion:** 2026-01-28
**Team:** Both (Team A + Team B parallel)

---

## YAML Frontmatter

```yaml
epic_id: EPIC-CC-AR02AR03
name: "Correct-Course: Plugin System Complete Rework for Phase 1A"
type: correct-course
remediates:
  - EPIC-ARCH-02 (Feature Plugins) - TRUE COMPLETION: 70%
  - EPIC-ARCH-03 (Layout System & UX) - TRUE COMPLETION: 45%
priority: P0
blocks: Phase 1A
estimated_effort: 16-24 hours (2-3 days)
target_completion: 2026-01-28

related_documents:
  - new-fundamental-truths.md
  - docs/the-3-phase-approach.md
  - ADR-034: Project-Centric Architecture with Feature Plugins
  - ADR-034-AMENDMENT-001: Platform-First Plugin Selection

file_tracking:
  100_percent_safe_to_archive:
    - src/presentation/layouts/useResponsiveBreakpoint.ts (if duplicate exists)
    - src/presentation/layouts/MobileDetection.tsx (if duplicate exists)
  partially_legacy:
    - src/presentation/layouts/PluginLayout.tsx (1034 lines - needs splitting)
    - src/presentation/layouts/plugin-dnd.css (drag-drop styles - will be replaced)
  type_inconsistencies:
    - LayoutMode type in multiple files - consolidate
    - PluginId union - ensure consistent across all plugins
```

---

## Executive Summary

This Correct-Course EPIC addresses critical deficiencies in EPIC-ARCH-02 and EPIC-ARCH-03 that are blocking Phase 1A completion. The multi-agent audit revealed:

| EPIC | Claimed Completion | TRUE Completion | Key Issues |
|------|-------------------|-----------------|------------|
| **EPIC-ARCH-02** | 100% | **70%** | Monaco is POC stub (textarea), not real Monaco Editor |
| **EPIC-ARCH-03** | 100% | **45%** | 22+ i18n keys missing, drag-drop causes broken layouts |

### What This EPIC Delivers

1. **All missing i18n keys** - UI shows translated text, not raw keys
2. **platform-defaults.ts wiring** - Already exists (104 lines), needs proper integration
3. **Store hydration fix** - Race condition in PluginLayoutStore
4. **Toggle-based layout** - Replaces problematic drag-drop
5. **Real Monaco Editor** - Replaces textarea POC with @monaco-editor/react
6. **Preview plugin** - WebContainer integration for `pnpm dev`
7. **Legacy file cleanup** - Archive duplicates and deprecated files
8. **PluginLayout.tsx split** - 1034 lines down to <500 lines each

---

## Problem Statement

### Evidence from Multi-Agent Audit

#### Problem 1: Monaco is POC Stub
**File**: `src/plugins/monaco/MonacoPlugin.tsx`
**Lines 175-192**:
```tsx
{/* Editor Content (POC: Textarea placeholder for Monaco) */}
{/* In full implementation, this would be <Editor /> from @monaco-editor/react */}
<div className="flex-1 overflow-auto p-4 bg-background">
  <textarea
    value={content}
    onChange={(e) => {
      setContent(e.target.value);
      setIsModified(true);
    }}
    className="w-full h-full bg-transparent text-foreground font-mono text-sm resize-none outline-none border-none"
    ...
  />
</div>
```
**Impact**: No syntax highlighting, no IntelliSense, no real code editing capability.

#### Problem 2: Missing i18n Keys
**Code uses these keys** (from grep scan):
- `plugin.dragToReorder` - MISSING
- `plugin.noPluginsTitle` - MISSING
- `plugin.noPluginsDescription` - MISSING
- `plugin.addPlugin` - MISSING
- `plugin.allPluginsActive` - MISSING
- `plugin.activePlugins` - MISSING
- `plugin.layoutMode` - MISSING
- `plugin.layout1Column` - MISSING
- `plugin.layout2Column` - MISSING
- `plugin.layout3Column` - MISSING
- `plugin.layout2Plus1` - MISSING
- `plugin.add` - MISSING
- `plugin.notFound` - MISSING
- `plugin.closePanel` - MISSING
- `plugins.fileTree.name` - MISSING
- `plugins.monaco.name` - MISSING
- `plugins.terminal.name` - MISSING
- `plugins.chat.name` - MISSING
- `plugins.notes.name` - MISSING
- `plugins.agents.name` - MISSING
- Plus 20+ `plugins.manager.*`, `plugins.settings.*`, `plugins.marketplace.*` keys

**Only 3 keys exist in en.json**:
- `pluginPanel.dragAriaLabel`
- `pluginPanel.dragHandleTooltip`
- `pluginPanel.announcement.moved`

**Impact**: UI shows raw translation keys like `plugin.noPluginsTitle` instead of actual text.

#### Problem 3: Drag-Drop Layout Causes Broken Layouts
**File**: `src/presentation/layouts/PluginLayout.tsx` (1034 lines)
**Issues**:
- `handleDragStart()` function exists but can cause unstable states
- No visual guardrails for invalid drops
- Desktop users accidentally break their layout
- Mobile experience is clunky

**Solution**: Replace with toggle-based plugin selection (progressive disclosure pattern).

#### Problem 4: PluginLayout.tsx is God Component
**Line Count**: 1034 lines
**Contains**:
- Layout rendering (1-col, 2-col, 3-col, 2+1)
- Empty state rendering
- Plugin add dialog
- Mobile navigation
- Screen reader announcements
- Drag-drop logic

**Threshold Violation**: BMAD governance requires <500 lines per component.

#### Problem 5: Store Hydration Race Condition
**File**: `src/presentation/layouts/PluginLayoutStore.ts`
**Issue**: `getCurrentProjectId()` can be called before store hydration completes
**Symptom**: Layout doesn't persist per-project correctly

---

## Solution Architecture

### Design Principle: Progressive Disclosure with Toggle-Based Layout

**NO drag-drop** - Use toggle-based layout switching with pre-designed layouts:

#### Desktop Plugin Toggle Toolbar

```
+----------------------------------------------------------------+
| Via-gent | [=] | [D] [N] [T] [P] [C] [F] | Layout: [2] [3] [4] [5] |
+----------------------------------------------------------------+
              |                              |
              +-- Plugin toggles             +-- Layout mode selector
              
Legend:
[D] = Monaco Editor (Code)
[N] = Notes (BlockNote)
[T] = Terminal
[P] = Preview
[C] = Chat
[F] = FileTree (always visible)
```

#### Pre-Designed Layout Specifications

##### 2-Plugin Layout (Desktop)
```
+--------------------------------------+
| [FileTree 30%] | [Monaco/Notes 70%]  |
+--------------------------------------+
```

##### 3-Plugin Layout (Desktop)
```
+--------------------------------------+
| [FileTree 25%] | [Monaco 45%] | [Chat 30%] |
+--------------------------------------+
```

##### 4-Plugin Layout (2+2)
```
+--------------------------------------+
| [FileTree 25%] | [Monaco 50%] | [Terminal 25%] |
+--------------------------------------+
| [Chat - Full Width]                  |
+--------------------------------------+
```

##### 5-Plugin Layout (3+2)
```
+--------------------------------------+
| [FileTree 20%] | [Monaco 40%] | [Terminal 20%] | [Preview 20%] |
+--------------------------------------+
| [Chat - Full Width]                  |
+--------------------------------------+
```

##### Mobile Layout (Toggle Tabs)
```
+--------------------------------------+
| [Single Panel - Full Height]         |
+--------------------------------------+
| [F] [N] [C]  <- Tab Bar (bottom)    |
+--------------------------------------+
```

---

## Stories

### CC-AR-01: Add All Missing i18n Translation Keys
**Priority:** P0 | **Effort:** 2 hours | **Team:** Team A
**Depends On:** None

Add all 40+ missing `plugin.*` and `plugins.*` keys to both en.json and vi.json.

**Files to Modify:**
```
src/i18n/en.json
src/i18n/vi.json
```

**Keys to Add (English):**
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
  "plugin.closePanel": "Close {{pluginName}}",
  
  "plugins.fileTree.name": "File Tree",
  "plugins.monaco.name": "Code Editor",
  "plugins.terminal.name": "Terminal",
  "plugins.chat.name": "AI Chat",
  "plugins.notes.name": "Notes",
  "plugins.agents.name": "Agents",
  "plugins.preview.name": "Preview",
  
  "plugins.manager.confirmUninstall": "Are you sure you want to uninstall this plugin?",
  "plugins.manager.noPlugins": "No plugins installed",
  "plugins.manager.builtin": "Built-in",
  "plugins.manager.deactivate": "Deactivate",
  "plugins.manager.activate": "Activate",
  "plugins.manager.uninstall": "Uninstall",
  
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
  "plugins.settings.lastError": "Last Error",
  
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

**Acceptance Criteria:**
- [ ] All 40+ keys added to en.json
- [ ] All 40+ keys translated and added to vi.json
- [ ] No raw translation keys visible in UI
- [ ] TypeScript: 0 new errors
- [ ] Manual test: Toggle language, verify translations

**Validation Gate:**
```bash
# Search for any t() calls using keys not in en.json
grep -r "t(['\"]plugin" src/ --include="*.tsx" | grep -v node_modules
# Compare with keys in en.json - should have 0 missing
```

---

### CC-AR-02: Wire platform-defaults.ts to Route
**Priority:** P0 | **Effort:** 2-3 hours | **Team:** Team A
**Depends On:** CC-AR-01

The file `src/infrastructure/plugins/platform-defaults.ts` EXISTS (104 lines) but is NOT wired to the route.

**Files to Modify:**
```
src/routes/$projectId.tsx
src/presentation/layouts/PluginLayoutStore.ts
```

**Current State (platform-defaults.ts):**
```typescript
// Already implemented - functions exist:
export function getDefaultPlugins(platform, project): PluginId[]
export function getDefaultLayoutMode(platform): LayoutMode
```

**What's Missing:**
Route `$projectId.tsx` doesn't call these functions on mount.

**Implementation:**
```typescript
// In $projectId.tsx

import { getDefaultPlugins, getDefaultLayoutMode } from '@/infrastructure/plugins/platform-defaults';
import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';

function ProjectRoute() {
  const { projectId } = useParams();
  const projectContext = useProjectContext();
  const { activePlugins, initializeDefaults } = usePluginLayoutStore();
  
  // Initialize defaults on first load for this project
  useEffect(() => {
    if (activePlugins.length === 0 && projectContext.project) {
      const defaultPlugins = getDefaultPlugins(projectContext.platform, projectContext.project);
      const defaultMode = getDefaultLayoutMode(projectContext.platform);
      initializeDefaults(defaultPlugins, defaultMode);
    }
  }, [projectContext.project?.id]);
  
  return <PluginLayout />;
}
```

**Add to PluginLayoutStore:**
```typescript
interface PluginLayoutState {
  // ...existing
  initializeDefaults: (plugins: PluginId[], mode: LayoutMode) => void;
}

// In store creation:
initializeDefaults: (plugins, mode) => {
  set({ activePlugins: plugins, layoutMode: mode });
}
```

**Acceptance Criteria:**
- [ ] `initializeDefaults()` action added to PluginLayoutStore
- [ ] `$projectId.tsx` calls `getDefaultPlugins()` on mount when empty
- [ ] Platform-first defaults work (desktop FSA = filetree+monaco+chat)
- [ ] Mobile defaults work (notes only)
- [ ] TypeScript: 0 new errors

**Validation Gate:**
```bash
# Start app, open desktop project, verify default plugins load
# Start app in mobile emulation, verify notes-only loads
pnpm tsc --noEmit
```

---

### CC-AR-03: Fix Store Hydration Race Condition
**Priority:** P0 | **Effort:** 2-3 hours | **Team:** Team B
**Depends On:** None

Fix PluginLayoutStore.getCurrentProjectId() race condition where store is read before hydration.

**Files to Modify:**
```
src/presentation/layouts/PluginLayoutStore.ts
src/routes/$projectId.tsx
```

**Problem:**
```typescript
// Current broken pattern:
const projectId = usePluginLayoutStore.getState().getCurrentProjectId();
// This can return undefined before Zustand persist hydration completes
```

**Solution:**
Pass projectId from route params directly instead of reading from store.

```typescript
// PluginLayoutStore.ts
interface PluginLayoutState {
  // Add hydration flag
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
  
  // Layout is now per-project via projectId param, not internal getCurrentProjectId
  getLayoutForProject: (projectId: string) => { activePlugins: PluginId[], layoutMode: LayoutMode };
}

// Add hydration listener
const usePluginLayoutStore = create<PluginLayoutState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      setHasHydrated: (val) => set({ _hasHydrated: val }),
      // ... other state
    }),
    {
      name: 'plugin-layout-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
```

```typescript
// In component - wait for hydration
function PluginLayoutWrapper({ projectId }: { projectId: string }) {
  const hasHydrated = usePluginLayoutStore((s) => s._hasHydrated);
  
  if (!hasHydrated) {
    return <LayoutSkeleton />;
  }
  
  return <PluginLayout projectId={projectId} />;
}
```

**Acceptance Criteria:**
- [ ] `_hasHydrated` flag added to store
- [ ] Components wait for hydration before reading persisted state
- [ ] projectId passed from route params, not read from store
- [ ] Layout persists correctly per-project
- [ ] TypeScript: 0 new errors

**Validation Gate:**
```bash
# Refresh page on project route, verify layout restores correctly
# Switch between projects, verify each has its own layout
pnpm tsc --noEmit
```

---

### CC-AR-04: Replace Drag-Drop with Toggle-Based Layout
**Priority:** P0 | **Effort:** 4-6 hours | **Team:** Team A
**Depends On:** CC-AR-02, CC-AR-03

Remove drag-drop and implement toggle-based plugin selector with pre-designed layouts.

**Files to Create:**
```
src/presentation/components/layout/PluginToolbar.tsx      (toggle toolbar)
src/presentation/layouts/layout-presets.ts               (pre-designed layouts)
```

**Files to Modify:**
```
src/presentation/layouts/PluginLayout.tsx                (remove drag-drop, use presets)
```

**Files to Archive:**
```
src/presentation/layouts/plugin-dnd.css                  -> _bmad-ext/.archive/
```

**PluginToolbar Component:**
```typescript
interface PluginToolbarProps {
  activePlugins: PluginId[];
  availablePlugins: PluginId[];
  layoutMode: LayoutMode;
  onTogglePlugin: (pluginId: PluginId) => void;
  onSetLayoutMode: (mode: LayoutMode) => void;
}

export function PluginToolbar({ ... }: PluginToolbarProps) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 border-b border-border bg-card">
      {/* Plugin toggle buttons */}
      <div className="flex gap-1">
        {availablePlugins.map((pluginId) => (
          <PluginToggleButton
            key={pluginId}
            pluginId={pluginId}
            isActive={activePlugins.includes(pluginId)}
            onToggle={() => onTogglePlugin(pluginId)}
          />
        ))}
      </div>
      
      {/* Layout mode selector */}
      <div className="flex gap-1 ml-auto">
        <LayoutModeButton mode="2-column" current={layoutMode} onClick={onSetLayoutMode} />
        <LayoutModeButton mode="3-column" current={layoutMode} onClick={onSetLayoutMode} />
        <LayoutModeButton mode="2+1" current={layoutMode} onClick={onSetLayoutMode} />
      </div>
    </div>
  );
}
```

**Pre-Designed Layout Presets:**
```typescript
// layout-presets.ts
export interface LayoutPreset {
  mode: LayoutMode;
  pluginCount: number;
  slots: LayoutSlot[];
}

export interface LayoutSlot {
  flex: number;  // flex percentage
  minWidth: number;
  row?: number;  // for 2+1 layouts
}

export const LAYOUT_PRESETS: Record<string, LayoutPreset> = {
  '2-column': {
    mode: '2-column',
    pluginCount: 2,
    slots: [
      { flex: 30, minWidth: 200 },
      { flex: 70, minWidth: 300 },
    ],
  },
  '3-column': {
    mode: '3-column',
    pluginCount: 3,
    slots: [
      { flex: 25, minWidth: 200 },
      { flex: 45, minWidth: 300 },
      { flex: 30, minWidth: 200 },
    ],
  },
  '4-plugin-2+2': {
    mode: '2+1',
    pluginCount: 4,
    slots: [
      { flex: 25, minWidth: 200, row: 1 },
      { flex: 50, minWidth: 300, row: 1 },
      { flex: 25, minWidth: 200, row: 1 },
      { flex: 100, minWidth: 300, row: 2 },
    ],
  },
  '5-plugin-3+2': {
    mode: '2+1',
    pluginCount: 5,
    slots: [
      { flex: 20, minWidth: 150, row: 1 },
      { flex: 40, minWidth: 300, row: 1 },
      { flex: 20, minWidth: 150, row: 1 },
      { flex: 20, minWidth: 150, row: 1 },
      { flex: 100, minWidth: 300, row: 2 },
    ],
  },
};
```

**Acceptance Criteria:**
- [ ] PluginToolbar component created with toggle buttons
- [ ] Layout presets defined for 2, 3, 4, 5 plugin combinations
- [ ] No drag-drop in UI (removed completely)
- [ ] Mobile: Bottom tab navigation for plugin switching
- [ ] Desktop: Icon toolbar with plugin toggles
- [ ] 8-bit design: Sharp corners, pixel shadows
- [ ] TypeScript: 0 new errors

**Validation Gate:**
```bash
# Manual test: Toggle plugins on/off, verify layout adjusts
# Manual test: Switch layout modes (2-col, 3-col, 2+1)
# Manual test: Mobile view uses bottom tabs
pnpm tsc --noEmit
```

---

### CC-AR-05: Replace Monaco POC with Real Monaco Editor
**Priority:** P1 | **Effort:** 4-6 hours | **Team:** Team B
**Depends On:** CC-AR-03

Replace textarea placeholder with actual @monaco-editor/react integration.

**Files to Modify:**
```
src/plugins/monaco/MonacoPlugin.tsx
```

**Current POC (Lines 175-192):**
```tsx
<textarea value={content} onChange={...} />
```

**Target Implementation:**
```tsx
import Editor from '@monaco-editor/react';

function MonacoComponent({ width, height }: PluginMainProps) {
  const { gateway, openFile, saveFile, fileTree } = useProjectContext();
  const [activePath, setActivePath] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [language, setLanguage] = useState<string>('plaintext');
  const [isModified, setIsModified] = useState(false);

  // Detect language from file extension
  const detectLanguage = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescriptreact',
      js: 'javascript',
      jsx: 'javascriptreact',
      json: 'json',
      md: 'markdown',
      css: 'css',
      html: 'html',
      py: 'python',
      rs: 'rust',
      go: 'go',
    };
    return langMap[ext || ''] || 'plaintext';
  };

  // Load file when openFile is called
  useEffect(() => {
    if (!activePath || !gateway) return;
    
    (async () => {
      try {
        const fileContent = await gateway.read(activePath);
        const decoder = new TextDecoder();
        setContent(decoder.decode(fileContent));
        setLanguage(detectLanguage(activePath));
        setIsModified(false);
      } catch (err) {
        console.error('[MonacoPlugin] Failed to load file:', err);
      }
    })();
  }, [activePath, gateway]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
      setIsModified(true);
    }
  };

  const handleSave = async () => {
    if (!activePath) return;
    await saveFile(activePath, content);
    setIsModified(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  return (
    <div className="h-full flex flex-col" style={{ width, height }}>
      {/* File tabs header */}
      <div className="h-8 px-2 flex items-center gap-2 border-b border-border bg-card shrink-0">
        <span className="text-xs font-mono">{activePath?.split('/').pop()}</span>
        {isModified && <span className="text-orange-500">*</span>}
        <button onClick={handleSave} className="ml-auto text-xs px-2 py-0.5 bg-blue-600 text-white">
          Save
        </button>
      </div>
      
      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={content}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'Menlo, Monaco, Consolas, monospace',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] @monaco-editor/react imported and used (not textarea)
- [ ] Syntax highlighting works for TypeScript, JavaScript, JSON, Markdown, CSS, HTML
- [ ] File loads from gateway.read()
- [ ] File saves via context.saveFile()
- [ ] Cmd+S / Ctrl+S keyboard shortcut works
- [ ] Language auto-detected from file extension
- [ ] TypeScript: 0 new errors

**Validation Gate:**
```bash
# Open a .tsx file, verify syntax highlighting
# Open a .json file, verify JSON syntax highlighting
# Edit and Cmd+S, verify file saves
pnpm tsc --noEmit
```

---

### CC-AR-06: Implement Preview Plugin (WebContainer)
**Priority:** P1 | **Effort:** 4-6 hours | **Team:** Team B
**Depends On:** CC-AR-05

Create PreviewPlugin for embedded dev server preview.

**Files to Create:**
```
src/plugins/preview/index.ts
src/plugins/preview/PreviewPlugin.tsx
src/plugins/preview/usePreviewPlugin.ts
```

**PreviewPlugin Implementation:**
```typescript
// PreviewPlugin.tsx
import { useState, useEffect, useRef } from 'react';
import { Monitor, RefreshCw, ExternalLink } from 'lucide-react';
import type { FeaturePlugin, PluginMainProps } from '@/domain/interfaces/feature-plugin.interface';
import { useProjectContext } from '@/infrastructure/context/project-context';

function PreviewComponent({ width, height }: PluginMainProps) {
  const { projectContext } = useProjectContext();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for dev server URL from Terminal plugin via event bus
  useEffect(() => {
    const handleDevServerReady = (event: CustomEvent<{ url: string }>) => {
      setPreviewUrl(event.detail.url);
      setIsLoading(false);
    };
    
    window.addEventListener('dev-server-ready', handleDevServerReady as EventListener);
    return () => {
      window.removeEventListener('dev-server-ready', handleDevServerReady as EventListener);
    };
  }, []);

  const handleRefresh = () => {
    if (iframeRef.current && previewUrl) {
      iframeRef.current.src = previewUrl;
    }
  };

  const handleOpenExternal = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  if (!previewUrl) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
        <Monitor size={48} className="mb-2 opacity-50" />
        <p className="text-sm">No preview available</p>
        <p className="text-xs opacity-70 mt-1">Run `pnpm dev` in Terminal to start</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ width, height }}>
      {/* Preview header */}
      <div className="h-8 px-2 flex items-center gap-2 border-b border-border bg-card shrink-0">
        <span className="text-xs font-mono truncate flex-1">{previewUrl}</span>
        <button onClick={handleRefresh} className="p-1 hover:bg-muted" title="Refresh">
          <RefreshCw size={14} />
        </button>
        <button onClick={handleOpenExternal} className="p-1 hover:bg-muted" title="Open in new tab">
          <ExternalLink size={14} />
        </button>
      </div>
      
      {/* Preview iframe */}
      <iframe
        ref={iframeRef}
        src={previewUrl}
        className="flex-1 w-full border-none"
        title="Preview"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  );
}

export const previewPlugin: FeaturePlugin = {
  id: 'preview',
  name: 'Preview',
  icon: <Monitor size={16} />,
  description: 'Preview running dev server',
  
  requirements: {
    storageType: 'fsa',  // FSA only (needs real files)
    deviceType: 'desktop',  // Desktop only
    minWidth: 300,
    maxInstances: 1,
  },
  
  MainComponent: PreviewComponent,
  
  onMount: async (context) => {
    console.log('[PreviewPlugin] Mounted for project:', context.projectId);
  },
  
  onUnmount: async () => {
    console.log('[PreviewPlugin] Unmounted');
  },
};
```

**Acceptance Criteria:**
- [ ] PreviewPlugin created following FeaturePlugin interface
- [ ] Renders iframe when dev server URL is available
- [ ] Empty state shows "Run pnpm dev in Terminal"
- [ ] Refresh button reloads iframe
- [ ] Open external button opens in new tab
- [ ] Integration with Terminal plugin via event bus
- [ ] TypeScript: 0 new errors

**Validation Gate:**
```bash
# Run pnpm dev in Terminal plugin
# Verify Preview plugin shows running dev server
# Click refresh, verify iframe reloads
pnpm tsc --noEmit
```

---

### CC-AR-07: Archive Legacy/Duplicate Files
**Priority:** P2 | **Effort:** 1 hour | **Team:** Team A
**Depends On:** CC-AR-04

Archive deprecated and duplicate files.

**Files to Archive:**
```
src/presentation/layouts/useResponsiveBreakpoint.ts  (if duplicate)
src/presentation/layouts/MobileDetection.tsx         (if duplicate)
src/presentation/layouts/plugin-dnd.css              (replaced by toggle)
```

**Archive Location:**
```
_bmad-ext/.archive/epic-cc-ar02ar03-2026-01-26/
```

**Archive Process:**
1. Verify no imports from files to be archived
2. Create archive directory with date
3. Move files to archive
4. Create facade re-exports if any imports remain
5. Update any remaining imports

**Acceptance Criteria:**
- [ ] All duplicate files identified and archived
- [ ] No broken imports after archival
- [ ] Archive manifest created with file list
- [ ] TypeScript: 0 new errors

**Validation Gate:**
```bash
# Search for imports from archived files
grep -r "from.*useResponsiveBreakpoint" src/ --include="*.tsx"
grep -r "from.*MobileDetection" src/ --include="*.tsx"
# Should return 0 results (or facade re-exports)
pnpm tsc --noEmit
```

---

### CC-AR-08: Split PluginLayout.tsx (1034 Lines)
**Priority:** P2 | **Effort:** 2-3 hours | **Team:** Team B
**Depends On:** CC-AR-04

Split PluginLayout.tsx into focused components under 500 lines each.

**Current File:**
```
src/presentation/layouts/PluginLayout.tsx (1034 lines)
```

**Target Structure:**
```
src/presentation/layouts/
  PluginLayout.tsx             (~300 lines - main orchestrator)
  PluginPanel.tsx              (already exists - verify <300 lines)
  EmptyPluginState.tsx         (~50 lines - new)
  PluginToolbar.tsx            (~150 lines - from CC-AR-04)
  MobilePluginNav.tsx          (already exists - verify <200 lines)
  layout-renderers/
    OneColumnLayout.tsx        (~80 lines)
    TwoColumnLayout.tsx        (~120 lines)
    ThreeColumnLayout.tsx      (~150 lines)
    TwoPlus1Layout.tsx         (~150 lines)
```

**Extraction Plan:**

1. **EmptyPluginState.tsx** - Extract `renderEmptyState()` function
2. **PluginToolbar.tsx** - Created in CC-AR-04
3. **layout-renderers/** - Extract each layout render function

**Implementation:**
```typescript
// EmptyPluginState.tsx
export function EmptyPluginState({ onAddPlugin }: { onAddPlugin: () => void }) {
  const { t } = useTranslation();
  
  return (
    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
      <LayoutGrid size={48} className="mb-4 opacity-50" />
      <h2 className="text-lg font-medium mb-2">{t('plugin.noPluginsTitle')}</h2>
      <p className="text-sm opacity-70 mb-4">{t('plugin.noPluginsDescription')}</p>
      <button onClick={onAddPlugin} className="px-4 py-2 bg-blue-600 text-white text-sm">
        {t('plugin.addPlugin')}
      </button>
    </div>
  );
}

// layout-renderers/TwoColumnLayout.tsx
interface TwoColumnLayoutProps {
  plugin1Id: PluginId;
  plugin2Id: PluginId | undefined;
  panelSizes: Record<string, number>;
  onRemovePlugin: (id: PluginId, index: number) => void;
}

export function TwoColumnLayout({ plugin1Id, plugin2Id, panelSizes, onRemovePlugin }: TwoColumnLayoutProps) {
  // ... extracted logic from render2Column()
}
```

**Acceptance Criteria:**
- [ ] PluginLayout.tsx reduced to <400 lines
- [ ] EmptyPluginState.tsx created (<100 lines)
- [ ] Layout renderers extracted to separate files (<200 lines each)
- [ ] All components under BMAD 500-line threshold
- [ ] No functionality changes (pure refactor)
- [ ] TypeScript: 0 new errors

**Validation Gate:**
```bash
# Check line counts
wc -l src/presentation/layouts/PluginLayout.tsx
# Should be <400

wc -l src/presentation/layouts/layout-renderers/*.tsx
# Each should be <200

pnpm tsc --noEmit
```

---

## Dependencies Graph

```
CC-AR-01 (i18n Keys)
    |
    v
CC-AR-02 (platform-defaults wiring) ----+
    |                                    |
    v                                    v
CC-AR-04 (Toggle Layout) <--------- CC-AR-03 (Hydration Fix)
    |                                    |
    v                                    v
CC-AR-07 (Archive Legacy)           CC-AR-05 (Real Monaco)
    |                                    |
    v                                    v
CC-AR-08 (Split PluginLayout)       CC-AR-06 (Preview Plugin)
```

---

## Parallel Execution Plan

### Team A (Stories: 01, 02, 04, 07)
| Time | Story | Description |
|------|-------|-------------|
| Day 1 AM (2h) | CC-AR-01 | Add all missing i18n keys |
| Day 1 PM (2-3h) | CC-AR-02 | Wire platform-defaults to route |
| Day 1 PM (4-6h) | CC-AR-04 | Replace drag-drop with toggle |
| Day 2 AM (1h) | CC-AR-07 | Archive legacy files |

### Team B (Stories: 03, 05, 06, 08)
| Time | Story | Description |
|------|-------|-------------|
| Day 1 AM (2-3h) | CC-AR-03 | Fix store hydration race condition |
| Day 1 PM (4-6h) | CC-AR-05 | Real Monaco Editor |
| Day 2 AM (4-6h) | CC-AR-06 | Preview Plugin |
| Day 2 PM (2-3h) | CC-AR-08 | Split PluginLayout.tsx |

### Critical Path
```
CC-AR-01 (2h) → CC-AR-02 (3h) → CC-AR-04 (6h) → CC-AR-08 (3h)

Total Sequential: 14 hours
With Parallelization: ~8-10 hours effective
```

---

## File Tracking (Per BMAD 3 Principles)

### 1. 100% Safe to Archive

| File | Reason | Blocking Check |
|------|--------|----------------|
| `src/presentation/layouts/plugin-dnd.css` | Replaced by toggle UI | No imports after CC-AR-04 |

### 2. Partially Legacy (Forecast)

| File | Current State | Forecast |
|------|---------------|----------|
| `src/presentation/layouts/PluginLayout.tsx` | 1034 lines | Split to <400 lines in CC-AR-08 |
| `src/plugins/monaco/MonacoPlugin.tsx` | POC textarea | Real Monaco in CC-AR-05 |

### 3. Type Inconsistencies to Fix

| Type | Issue | Location |
|------|-------|----------|
| `LayoutMode` | Defined in multiple places | Consolidate to `plugin-types.ts` |
| `PluginId` | Ensure includes 'preview' | Add in CC-AR-06 |

---

## Validation Gates Per Story

| Story | Validation Command | Success Criteria |
|-------|-------------------|------------------|
| CC-AR-01 | `grep -r "t(['\"]plugin" src/` | All keys exist in en.json |
| CC-AR-02 | `pnpm dev` + open project | Default plugins load |
| CC-AR-03 | Refresh page on project | Layout persists |
| CC-AR-04 | Manual toggle plugins | No drag-drop, toggles work |
| CC-AR-05 | Open .tsx file | Syntax highlighting |
| CC-AR-06 | Run pnpm dev in terminal | Preview shows |
| CC-AR-07 | `pnpm tsc --noEmit` | 0 errors, no broken imports |
| CC-AR-08 | `wc -l PluginLayout.tsx` | <400 lines |

---

## Success Metrics

| Metric | Before | After |
|--------|--------|-------|
| Monaco Editor | Textarea POC | Real @monaco-editor/react |
| Missing i18n keys | 40+ | 0 |
| PluginLayout.tsx lines | 1034 | <400 |
| Layout mechanism | Drag-drop (buggy) | Toggle-based (stable) |
| Preview Plugin | None | WebContainer integration |
| Store hydration | Race condition | Proper hydration guard |
| Phase 1A Blocking | YES | NO |

---

## Rollback Strategy

If any story needs rollback:

1. **CC-AR-01** - Remove added keys (no code changes)
2. **CC-AR-02** - Remove `initializeDefaults()` call from route
3. **CC-AR-03** - Remove hydration guard, revert to old pattern
4. **CC-AR-04** - Restore drag-drop from archive (if archived)
5. **CC-AR-05** - Revert to textarea POC
6. **CC-AR-06** - Delete preview plugin folder
7. **CC-AR-07** - Move files back from archive
8. **CC-AR-08** - Keep split files (no functional change)

---

## References

| Document | Path | Relevance |
|----------|------|-----------|
| new-fundamental-truths.md | `/new-fundamental-truths.md` | Core architecture |
| the-3-phase-approach.md | `/docs/the-3-phase-approach.md` | Phase 1A requirements |
| EPIC-ARCH-02 | `_bmad-output/planning-artifacts/epics/EPIC-ARCH-02-*.md` | Original feature plugins |
| EPIC-ARCH-03 | `_bmad-output/planning-artifacts/epics/EPIC-ARCH-03-*.md` | Original layout system |
| ADR-034 | `_bmad-output/planning-artifacts/adr/ADR-034-*.md` | Project-centric architecture |
| ADR-034-AMENDMENT-001 | `_bmad-output/planning-artifacts/adr/ADR-034-AMENDMENT-001-*.md` | Platform-first |

---

## Approval Signatures

- [ ] User (Product Owner)
- [ ] Architect Agent (architect-ext)
- [ ] Sprint Manager (bmad-sprint-manager)

---

**Ready for sprint-manager handoff upon user approval.**

---

*Created: 2026-01-26*
*Epic Type: Correct-Course*
*Related EPICs: EPIC-ARCH-02, EPIC-ARCH-03*
