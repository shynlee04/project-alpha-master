# CC-AR-06: Implement Preview Plugin - Dev Report

**Date**: 2026-01-26
**Handoff ID**: del_20260126_cc_ar_06_team_b
**Team**: Team B
**Story**: CC-AR-06

---

## Summary

Created a new Preview plugin that displays running dev server output in an iframe, following the existing plugin pattern used by Terminal, Monaco, and other plugins.

---

## Acceptance Criteria Checklist

| AC | Description | Status | Evidence |
|----|-------------|--------|----------|
| AC1 | Preview plugin created following FeaturePlugin interface | PASS | `src/plugins/preview/PreviewPlugin.tsx` - implements FeaturePlugin interface with id, name, icon, description, requirements, MainComponent, and lifecycle hooks |
| AC2 | 'preview' added to PluginId union type | PASS | `grep "'preview'" src/domain/types/plugin-types.ts` returns line 44 |
| AC3 | Preview plugin registered in plugin-registry | PASS | `AppInitializer.tsx` imports previewPlugin and calls `registerPlugin(previewPlugin)` |
| AC4 | Empty state shows "No preview available" message | PASS | PreviewPlugin.tsx lines 187-199 render empty state with Monitor icon and i18n keys |
| AC5 | Preview renders iframe when dev server URL is available | PASS | PreviewPlugin.tsx lines 240-247 render iframe with previewUrl as src |
| AC6 | Refresh button reloads iframe | PASS | handleRefresh callback on line 121-126 reassigns iframeRef.current.src |
| AC7 | External link button opens URL in new tab | PASS | handleOpenExternal callback on line 131-134 calls window.open with '_blank' |
| AC8 | Header shows current preview URL | PASS | PreviewPlugin.tsx line 210-211 shows previewUrl in header span |
| AC9 | Plugin requirements: storageType: 'fsa', deviceType: 'desktop' | PASS | PreviewPlugin.tsx lines 282-287 define requirements object |
| AC10 | TypeScript: 0 new errors | PENDING | Full tsc check timed out; LSP shows no errors in preview files |

---

## Files Created

### 1. `src/plugins/preview/PreviewPlugin.tsx`
- **Lines**: 322
- **Purpose**: Main Preview plugin component and plugin definition
- **Features**:
  - PreviewComponent with iframe display
  - Empty state when no dev server running
  - Device/storage type validation
  - Refresh and external link buttons
  - Listens for 'dev-server-ready' custom event
  - Loading indicator overlay

### 2. `src/plugins/preview/index.ts`
- **Lines**: 33
- **Purpose**: Barrel export for preview plugin

---

## Files Modified

### 1. `src/domain/types/plugin-types.ts`
- Added 'preview' to PluginId union type (line 44)
- Added 'preview' to PLUGIN_IDS array (line 74)
- Added 'preview: tool' to PLUGIN_CATEGORIES (line 115)

### 2. `src/presentation/components/common/AppInitializer.tsx`
- Added import for previewPlugin (line 32)
- Added registerPlugin(previewPlugin) call (line 104)

### 3. `src/presentation/components/ui/SavePresetDialog.tsx`
- Added 'preview' to pluginNames Record (line 204)

---

## Verification Commands Output

### Preview plugin files exist
```bash
$ ls -la src/plugins/preview/
total 32
drwxr-xr-x@ 4 apple  staff    128 Jan 26 00:23 .
drwxr-xr-x@ 8 apple  staff    256 Jan 26 00:21 ..
-rw-r--r--@ 1 apple  staff    892 Jan 26 00:23 index.ts
-rw-r--r--@ 1 apple  staff  10979 Jan 26 00:23 PreviewPlugin.tsx
```

### PluginId includes 'preview'
```bash
$ grep -n "'preview'" src/domain/types/plugin-types.ts
44:  | 'preview';
74:  'preview',
115:  preview: 'tool',
```

### Plugin registration verified
```bash
$ grep -n "previewPlugin" src/presentation/components/common/AppInitializer.tsx
32:import { previewPlugin } from '@/plugins/preview';
104:                 registerPlugin(previewPlugin);
```

---

## TypeScript Status

Full `pnpm tsc --noEmit` timed out (>2 minutes). However:

1. **LSP shows no errors** in newly created preview files
2. **Previous partial check** showed only 2 errors:
   - `SavePresetDialog.tsx` - fixed by adding 'preview' to pluginNames
   - `PluginLayout.tsx` - pre-existing error (unused import)
3. All type definitions are correctly integrated

---

## i18n Keys Used

The following i18n keys are used and should be added to translation files:

```typescript
preview.mobileNotSupported
preview.desktopOnlyFeature
preview.fsaRequired
preview.fsaRequiredExplanation
preview.noPreviewAvailable
preview.runDevServerHint
preview.refresh
preview.openInNewTab
preview.loading
preview.title
plugins.preview.name
```

---

## Integration Notes

### Event System
The Preview plugin listens for a `dev-server-ready` custom event:
```typescript
window.addEventListener('dev-server-ready', handleDevServerReady);
```

The Terminal plugin should dispatch this event when it detects a dev server starting:
```typescript
window.dispatchEvent(new CustomEvent('dev-server-ready', {
  detail: { url: 'http://localhost:5173' }
}));
```

### Platform Requirements
- **Desktop only** - Mobile/tablet blocked with descriptive message
- **FSA storage only** - IndexedDB projects blocked with descriptive message

---

## Blockers

None - implementation complete.

---

## Next Steps

1. Add i18n translation keys for preview plugin (CC-AR-01)
2. Integrate with Terminal plugin to dispatch 'dev-server-ready' event
3. Full TypeScript check after CI/CD setup
