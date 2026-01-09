# CLAUDE.md - AI Agent Instructions

> **Version:** 2.0.0 | **Updated:** 2026-01-09T20:50+07:00

---

## Context Loading Priority

**Order of reading (most important first):**

1. **This file** (CLAUDE.md) - Essential patterns
2. **AGENTS.md** - Project state & navigation
3. **bmm-workflow-status.yaml** - Current workflow
4. **sprint-status.yaml** - Active sprint details
5. **Story context** - Task-specific (e.g., `FS-05-context.xml`)
6. **Relevant standards** - From `agent-os/standards/` (see below)

### Mandatory Standards (Read Before Coding)

| Standard | Path | When Required |
|----------|------|---------------|
| API | `agent-os/standards/backend/api.md` | Any server function |
| Models | `agent-os/standards/backend/models.md` | New/modified entities |
| Queries | `agent-os/standards/backend/queries.md` | Dexie operations |
| Components | `agent-os/standards/frontend/components.md` | New/modified React |
| CSS | `agent-os/standards/frontend/css.md` | Any styling |
| Coding Style | `agent-os/standards/global/coding-style.md` | All code |
| Testing | `agent-os/standards/testing/test-writing.md` | Tests |

---

## 📅 Recent Updates (Rolling 7 days)

| Date | Update |
|------|--------|
| 2026-01-09 | Governance Overhaul: 6-cycle context poison reduction |
| 2026-01-09 | YAML files: 44 → 20 (55% reduction) |
| 2026-01-09 | workflow-status.yaml compressed: 3,059 → 136 lines |
| 2026-01-09 | Phase 2 sprint started: EPIC-FS + EPIC-39 |
| 2026-01-08 | EPIC-38 completed (Architecture Remediation) |
| 2026-01-08 | Phase 1.5 stabilization completed |

---

## 🚫 Critical Anti-Patterns

### Never Do These

```typescript
// ❌ WRONG: Multiple separate selectors
const items = useStore((s) => s.items);
const addItem = useStore((s) => s.addItem);

// ❌ WRONG: Deprecated path
import { something } from '@/lib/state/store';

// ❌ WRONG: Non-8-bit styling
<div className="rounded-lg backdrop-blur opacity-80">

// ❌ WRONG: Direct Dexie in components
const db = new Dexie('MyDB');

// ❌ WRONG: Untyped async handlers
const handleClick = async () => { ... }
```

### Always Do These

```typescript
// ✅ RIGHT: useShallow for multiple selectors
const { items, addItem } = useStore(
  useShallow((state) => ({
    items: state.items,
    addItem: state.addItem,
  }))
);

// ✅ RIGHT: Clean Architecture import
import { useProjectStore } from '@/infrastructure/persistence/stores/project-store';

// ✅ RIGHT: 8-bit styling
<div className="rounded-none shadow-[4px_4px_0_0]">

// ✅ RIGHT: Use store facades
import { db } from '@/infrastructure/persistence/dexie-db';

// ✅ RIGHT: Typed handlers with try-catch
const handleClick = async (): Promise<void> => {
  try { ... } catch (e) { ... }
}
```

---

## ✅ Import Pattern Reference

```typescript
// Framework imports
import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';

// Third-party
import { useShallow } from 'zustand/react/shallow';
import { toast } from 'sonner';

// Infrastructure (always @/)
import { useNoteStore } from '@/infrastructure/persistence/stores/note-store';
import { db } from '@/infrastructure/persistence/dexie-db';
import type { Note } from '@/domain/types/note';

// Presentation
import { Button } from '@/presentation/components/ui/button';
import { useAI } from '@/presentation/hooks/use-ai';

// Relative (same module only)
import { formatDate } from './utils';
```

---

## 🗂️ File System Architecture (Current Focus)

**Epic:** EPIC-FS (File System Foundation)
**Progress:** 28.6%
**Current Story:** FS-05 (FileLockService)

### Key Files

| File | Purpose |
|------|---------|
| `src/infrastructure/persistence/file-adapters/` | FSA/IDB adapters |
| `src/infrastructure/persistence/stores/note-store.ts` | Notes state |
| `src/infrastructure/sync/file-sync-service.ts` | Sync orchestration |
| `src/domain/services/file-lock-service.ts` | Lock management |
| `src/routes/notes.lazy.tsx` | Notes route |

### Storage Types

```typescript
type StorageType = 'fsa' | 'indexeddb';

// FSA = File System Access API (native folders)
// IndexedDB = Browser storage (always available)
```

---

## 🏗️ Architecture Layers

```
src/
├── routes/              # TanStack Router routes
├── presentation/        # React components, hooks
│   ├── components/     
│   └── hooks/          
├── domain/              # Business logic
│   ├── services/       
│   └── types/          
└── infrastructure/      # External interfaces
    ├── persistence/     # Stores, Dexie, adapters
    ├── sync/           
    └── events/         
```

---

## 🎨 8-bit Design Tokens

```css
/* Sharp corners only */
--radius-none: 0;
--radius-sm: 2px;

/* Pixel shadows */
--shadow-pixel: 4px 4px 0 0 var(--shadow-color);

/* Solid colors - no transparency */
--bg-solid: hsl(var(--background));
```

---

## 📋 Before Completing Any Story

```bash
# 1. TypeScript check
pnpm tsc --noEmit

# 2. Unit tests
pnpm vitest run

# 3. Lint check
pnpm lint

# 4. (If Epic complete) E2E
pnpm test:e2e
```

---

## 🔗 Full Reference

| Resource | Location |
|----------|----------|
| Complete project state | `AGENTS.md` |
| Architecture decisions | `_bmad-output/planning-artifacts/architecture.md` |
| UX system | `_bmad-output/planning-artifacts/ux-specification.md` |
| All standards | `agent-os/standards/` |
| Governance gates | `_bmad/modules/governance/checklists/` |
| Historical archives | `_bmad-output/.archive/` |

---

## 🚀 Session Quick Start

```
1. Read CLAUDE.md (done)
2. Read AGENTS.md (project state)
3. Check bmm-workflow-status.yaml (current epic/story)
4. Load story context if assigned
5. Begin work
```

---

*Compressed from 4,132 lines. Full history: `_bmad-output/.archive/2026-01-09/CLAUDE-v1.md`*
