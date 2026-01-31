# CORRECT-COURSE: Phase Separation Fix

**Document ID**: CC-PHASE-SEPARATION-2026-01-26
**Created**: 2026-01-26T14:45:00+07:00
**Author**: bmad-sprint-manager
**Priority**: P0 - BLOCKING

---

## Problem Statement

The `AppInitializer.tsx` registers **6 plugins** but according to `docs/the-3-phase-approach.md`:

| Phase | Plugins | Current State |
|-------|---------|---------------|
| **Phase 1A** | FileTree, Monaco, Terminal, Preview | ✅ Registered |
| **Phase 1B** | Notes | ❌ WRONGLY in Phase 1A |
| **Phase 2** | Chat | ❌ WRONGLY in Phase 1A |

**Root Cause**: EPIC-ARCH-02 marked complete prematurely without phase enforcement.

---

## Evidence from Authoritative Documents

### From `docs/the-3-phase-approach.md` (Lines 345-500):

> **Phase 1A Components:**
> - 3.1 Project Management System
> - 3.2 Terminal Plugin
> - 3.3 Monaco Editor Plugin (CRITICAL)
> - 3.4 FileTree Plugin (Always-Loaded)
> - 3.5 Preview Plugin
> - 3.6 Plugin Layout System

### From `new-fundamental-truths.md` (Lines 93-99):

> | Platform | Storage | Default Plugins | Notes |
> |----------|---------|-----------------|-------|
> | Desktop (FSA) | File System Access | `filetree`, `monaco`, `chat` | Full development experience |
> | Desktop (IndexedDB) | Browser Database | `filetree`, `notes`, `chat` | Notes-focused |

**INTERPRETATION**: The fundamental truths show the **END STATE** architecture (all phases complete), NOT Phase 1A requirements.

---

## BMAD-Aligned Fix Strategy

### Option A: Phase Flag (Recommended - Non-Breaking)

Add phase configuration that controls which plugins load based on current phase.

**File**: `src/infrastructure/plugins/phase-config.ts` (NEW)

```typescript
/**
 * Phase Configuration
 * Controls which plugins load based on current release phase.
 * 
 * @see docs/the-3-phase-approach.md for phase definitions
 */
export const CURRENT_PHASE = '1A' as const;

export const PHASE_PLUGINS = {
  '1A': ['filetree', 'monaco', 'terminal', 'preview'] as const,
  '1B': ['filetree', 'monaco', 'terminal', 'preview', 'notes'] as const,
  '2':  ['filetree', 'monaco', 'terminal', 'preview', 'notes', 'chat'] as const,
} as const;

export function getPhasePlugins(): readonly string[] {
  return PHASE_PLUGINS[CURRENT_PHASE];
}

export function isPluginEnabledForPhase(pluginId: string): boolean {
  return (PHASE_PLUGINS[CURRENT_PHASE] as readonly string[]).includes(pluginId);
}
```

**File**: `src/presentation/components/common/AppInitializer.tsx` (MODIFY)

```diff
+ import { isPluginEnabledForPhase } from '@/infrastructure/plugins/phase-config';
  import { registerPlugin } from '@/infrastructure/plugins/plugin-registry';
  import { fileTreePlugin } from '@/plugins/filetree';
  import { monacoPlugin } from '@/plugins/monaco';
  import { notesPlugin } from '@/plugins/notes';
  import { terminalPlugin } from '@/plugins/terminal';
  import { chatPlugin } from '@/plugins/chat';
  import { previewPlugin } from '@/plugins/preview';

  // 6. Register feature plugins
  console.log('[AppInitializer] Registering feature plugins...');
  
+ // Phase 1A: FileTree, Monaco, Terminal, Preview
  registerPlugin(fileTreePlugin);
  registerPlugin(monacoPlugin);
  registerPlugin(terminalPlugin);
  registerPlugin(previewPlugin);

+ // Phase 1B: Notes (conditionally load based on phase)
+ if (isPluginEnabledForPhase('notes')) {
    registerPlugin(notesPlugin);
+ }

+ // Phase 2: Chat (conditionally load based on phase)
+ if (isPluginEnabledForPhase('chat')) {
    registerPlugin(chatPlugin);
+ }
```

### Option B: Environment Variable Control

Use environment variable for phase control:

```typescript
const PHASE = import.meta.env.VITE_PHASE || '1A';
```

---

## Workspace Files Decision

### DO NOT Mass Delete

The 70 workspace-related files are NOT all safe to remove:

| Category | Count | Action |
|----------|-------|--------|
| **100% Legacy** (no imports) | TBD | Archive after scan |
| **Partial Legacy** (some imports) | TBD | Keep with deprecation marks |
| **Still Active** (used by live code) | TBD | Keep - fix incrementally |

**BMAD Principle**: "deep scanning of project-wide imports, exports, and consumptions... before complete removal"

### Required Analysis Before Archive

Each file needs:
1. Import/export scan
2. Consumer identification
3. Deprecation notice if partial
4. Archive only if 0 consumers

---

## Immediate Action: Create Phase Config

I will now create the phase configuration file and update AppInitializer with phase guards.

**This approach:**
- ✅ Does NOT blindly delete
- ✅ Does NOT break existing functionality
- ✅ Aligns with BMAD 3 Principles (Section from the-3-phase-approach.md line 170)
- ✅ Allows gradual phase progression
- ✅ Provides clear governance

---

## Validation Criteria

After implementation:
1. `pnpm dev` starts without crashes
2. Only 4 plugins visible in toolbar (FileTree, Monaco, Terminal, Preview)
3. No WorkspaceContext crash
4. TypeScript: 0 errors

---

## References

- `docs/the-3-phase-approach.md` (Lines 1-500)
- `new-fundamental-truths.md` (Lines 1-200)
- `_bmad-output/architecture/EPIC-CONSOLIDATION-MAP-2026-01-26.md`
