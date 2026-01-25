# Story: CC-AR-06 - Implement Preview Plugin (WebContainer)

**Story ID:** CC-AR-06
**Epic:** EPIC-CC-AR02AR03
**Priority:** P1
**Team:** Team B
**Effort:** 4-6 hours
**Status:** READY
**Created:** 2026-01-26
**Depends On:** CC-AR-03 (Store Hydration Fix)
**Unblocks:** None (end of chain)

---

## Problem Statement

There is NO Preview plugin for displaying running dev server output. Users cannot see their `pnpm dev` output in a preview pane - they must open external browser tabs.

### Expected Behavior

1. User runs `pnpm dev` in Terminal plugin
2. Terminal detects dev server URL (e.g., `http://localhost:5173`)
3. Preview plugin displays the running app in an iframe
4. Refresh button reloads the preview
5. External link button opens in new tab

---

## Solution

Create new Preview plugin following the existing plugin pattern:

```
src/plugins/preview/
  index.ts            (barrel export)
  PreviewPlugin.tsx   (main component)
  usePreviewPlugin.ts (hook - optional)
  types.ts           (types - optional)
```

---

## Files to Create

| File | Description |
|------|-------------|
| `src/plugins/preview/index.ts` | Barrel export |
| `src/plugins/preview/PreviewPlugin.tsx` | Main component + plugin definition |

## Files to Modify

| File | Changes |
|------|---------|
| `src/domain/types/plugin-types.ts` | Add 'preview' to PluginId union |
| `src/infrastructure/plugins/plugin-registry.ts` | Register preview plugin |

---

## Pre-Research Required (MCP Tools)

Before implementation, use MCP tools to research:
1. WebContainer API patterns for dev server URL detection
2. iframe sandbox permissions for localhost preview
3. Event-based communication between Terminal and Preview plugins

---

## Acceptance Criteria

- [ ] **AC1**: Preview plugin created following FeaturePlugin interface
- [ ] **AC2**: 'preview' added to PluginId union type
- [ ] **AC3**: Preview plugin registered in plugin-registry
- [ ] **AC4**: Empty state shows "Run pnpm dev in Terminal to start"
- [ ] **AC5**: Preview renders iframe when dev server URL is available
- [ ] **AC6**: Refresh button reloads iframe
- [ ] **AC7**: External link button opens URL in new tab
- [ ] **AC8**: Header shows current preview URL
- [ ] **AC9**: Plugin requirements: storageType: 'fsa', deviceType: 'desktop'
- [ ] **AC10**: TypeScript: 0 new errors (`pnpm tsc --noEmit`)

---

## Implementation Guide

### Step 1: Create PreviewPlugin.tsx

```typescript
/**
 * @fileoverview Preview Plugin - Dev Server Preview
 * @module plugins/preview/PreviewPlugin
 * 
 * Displays running dev server output in iframe.
 * Listens for 'dev-server-ready' event from Terminal plugin.
 * 
 * @epic EPIC-CC-AR02AR03
 * @story CC-AR-06
 * @team Team B
 * @created 2026-01-26
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Monitor, RefreshCw, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { FeaturePlugin, PluginMainProps } from '@/domain/interfaces/feature-plugin.interface';
import { useProjectContext } from '@/infrastructure/context/project-context';

// ============================================================================
// Main Preview Component
// ============================================================================

function PreviewComponent({ width, height }: PluginMainProps) {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for dev server ready event from Terminal plugin
  useEffect(() => {
    const handleDevServerReady = (event: CustomEvent<{ url: string }>) => {
      console.log('[PreviewPlugin] Dev server ready:', event.detail.url);
      setPreviewUrl(event.detail.url);
      setIsLoading(false);
    };

    window.addEventListener('dev-server-ready', handleDevServerReady as EventListener);
    return () => {
      window.removeEventListener('dev-server-ready', handleDevServerReady as EventListener);
    };
  }, []);

  const handleRefresh = useCallback(() => {
    if (iframeRef.current && previewUrl) {
      setIsLoading(true);
      iframeRef.current.src = previewUrl;
    }
  }, [previewUrl]);

  const handleOpenExternal = useCallback(() => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  }, [previewUrl]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Empty state - no preview available
  if (!previewUrl) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground" style={{ width, height }}>
        <Monitor size={48} className="mb-4 opacity-50" />
        <p className="text-sm font-medium">{t('preview.noPreviewTitle', 'No preview available')}</p>
        <p className="text-xs opacity-70 mt-1">
          {t('preview.runDevServer', 'Run pnpm dev in Terminal to start')}
        </p>
      </div>
    );
  }

  // Main render with iframe
  return (
    <div className="h-full flex flex-col" style={{ width, height }}>
      {/* Preview Header */}
      <div className="h-8 px-3 flex items-center justify-between border-b border-border bg-card shrink-0">
        <span className="text-xs font-mono text-muted-foreground truncate flex-1 mr-2">
          {previewUrl}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground"
            title={t('preview.refresh', 'Refresh')}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenExternal}
            className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground"
            title={t('preview.openExternal', 'Open in new tab')}
          >
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Preview Iframe */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <p className="text-sm text-muted-foreground">{t('preview.loading', 'Loading...')}</p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={previewUrl}
          className="w-full h-full border-none"
          title="Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          onLoad={handleIframeLoad}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Plugin Definition
// ============================================================================

export const previewPlugin: FeaturePlugin = {
  id: 'preview',
  name: 'Preview',
  icon: React.createElement(Monitor, { size: 16 }),
  description: 'Preview running dev server',

  requirements: {
    storageType: 'fsa',  // FSA only (needs real files for dev server)
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

### Step 2: Create index.ts Barrel Export

```typescript
// src/plugins/preview/index.ts
export { previewPlugin } from './PreviewPlugin';
```

### Step 3: Add 'preview' to PluginId Union

```typescript
// In src/domain/types/plugin-types.ts
export type PluginId = 
  | 'filetree' 
  | 'monaco' 
  | 'terminal' 
  | 'chat' 
  | 'notes' 
  | 'agents'
  | 'preview';  // Add this line
```

### Step 4: Register in Plugin Registry

```typescript
// In src/infrastructure/plugins/plugin-registry.ts
import { previewPlugin } from '@/plugins/preview';

// In the registry initialization:
registerPlugin(previewPlugin);
```

---

## Validation Commands

```bash
# TypeScript check
pnpm tsc --noEmit

# Verify preview plugin files exist
ls -la src/plugins/preview/

# Verify PluginId includes 'preview'
grep -n "'preview'" src/domain/types/plugin-types.ts

# Verify plugin registration
grep -n "previewPlugin" src/infrastructure/plugins/plugin-registry.ts
```

---

## i18n Keys to Add (if not done by CC-AR-01)

```json
{
  "preview.noPreviewTitle": "No preview available",
  "preview.runDevServer": "Run pnpm dev in Terminal to start",
  "preview.refresh": "Refresh",
  "preview.openExternal": "Open in new tab",
  "preview.loading": "Loading...",
  "plugins.preview.name": "Preview"
}
```

---

## Testing (Manual - Validation Deferred per User Directive)

1. Add Preview plugin to layout
2. Verify empty state message displays
3. Run `pnpm dev` in Terminal plugin (if Terminal works)
4. Verify Preview shows running app

---

## Evidence Required

- [ ] TypeScript output saved to file (0 errors)
- [ ] ls output showing preview plugin files
- [ ] Grep output showing 'preview' in PluginId

---

## Notes

- The Terminal plugin must dispatch 'dev-server-ready' CustomEvent for full integration
- For now, Preview will show empty state until Terminal integration is complete
- This is desktop-only (requires FSA for real file system)

---

*Created: 2026-01-26*
*Team: Team B*
*Sprint Manager: bmad-sprint-manager*
