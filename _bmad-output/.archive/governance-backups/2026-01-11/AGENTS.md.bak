# AGENTS.md - Project Alpha Governance

> **Version:** 2.0.1 | **Updated:** 2026-01-10T18:15+07:00 | **Health:** 85%

---

## ⚡ Quick Reference (Always Read First)

| Key | Value |
|-----|-------|
| **Current Phase** | IMPLEMENTATION |
| **Active Epic** | EPIC-FS (28.6%) |
| **Next Story** | FS-05: FileLockService |
| **Sprint** | phase-2-sprint-status-2026-01-09.yaml |
| **Blocked Epic** | EPIC-38 (waiting on EPIC-FS) |
| **Last Complete Epic** | EPIC-40: Multimodal Chat (100%) |
| **TypeScript Errors** | 0 ✅ |

---

## 📍 Navigation Index

| What You Need | Where To Find It |
|---------------|------------------|
| Workflow Status | `bmm-workflow-status.yaml` |
| Sprint Status | `_bmad-output/sprint-artifacts/sprint-status.yaml` |
| Story Index | `_bmad-output/sprint-artifacts/stories/STORY-INDEX.md` |
| Architecture | `_bmad-output/planning-artifacts/architecture.md` |
| UX Specification | `_bmad-output/planning-artifacts/ux-specification.md` |
| PRD | `_bmad-output/planning-artifacts/prd.md` |
| Epics & Stories | `_bmad-output/planning-artifacts/epics.md` |
| Standards | `agent-os/standards/` |
| Governance Gates | `_bmad/modules/governance/checklists/` |

---

## 🚫 Non-Negotiable Rules

### 1. Never Skip Build Validation

```bash
pnpm tsc --noEmit && pnpm vitest run
```

Run BEFORE claiming any story complete.

### 2. Clean Architecture Paths

```
✅ CORRECT:
  src/infrastructure/persistence/stores/    → Zustand stores
  src/infrastructure/persistence/dexie/     → Dexie DB
  src/infrastructure/sync/                  → File sync logic
  src/domain/services/                      → Domain services
  src/domain/types/                         → Domain types
  src/presentation/components/              → React components
  src/presentation/hooks/                   → Custom hooks
  src/routes/                               → TanStack Router routes

❌ DEPRECATED (Never use):
  src/lib/state/
  src/stores/
  src/lib/filesystem/sync-manager
```

### 3. Import Order

```typescript
// 1. React/Framework
import React from 'react';
import { useParams } from '@tanstack/react-router';

// 2. Third-party
import { useShallow } from 'zustand/react/shallow';

// 3. Infrastructure (with @/)
import { useProjectStore } from '@/infrastructure/persistence/stores/project-store';

// 4. Domain
import type { Project } from '@/domain/types/project';

// 5. Presentation
import { Button } from '@/presentation/components/ui/button';

// 6. Relative
import { localHelper } from './utils';
```

### 4. Zustand Store Pattern

```typescript
// ✅ ALWAYS use useShallow for multiple selectors
const { items, addItem } = useStore(
  useShallow((state) => ({
    items: state.items,
    addItem: state.addItem,
  }))
);

// ❌ NEVER
const items = useStore((s) => s.items);
const addItem = useStore((s) => s.addItem);
```

### 5. 8-bit Design System

```css
/* ✅ REQUIRED */
border-radius: 0;           /* Sharp corners */
border-radius: 2px;         /* Minimal rounding only */
box-shadow: 4px 4px 0 0;    /* Pixel shadows */

/* ❌ FORBIDDEN */
border-radius: 0.5rem;      /* Too rounded */
border-radius: 9999px;      /* Pill shape */
backdrop-filter: blur();    /* Glassmorphism */
opacity: 0.8;               /* Avoid - use solid */
```

### 6. Epic Ordering

Epic numbers are **MONOTONIC**:
- Epic N cannot start until Epic N-1 is 80%+
- Story IDs are sequential within epic
- Never skip story numbers

### 7. Development Standards (Mandatory)

**Before writing any code, consult these standards:**

| Standard | Location | When to Use |
|----------|----------|-------------|
| **API Patterns** | `agent-os/standards/backend/api.md` | Server functions, validation |
| **Migrations** | `agent-os/standards/backend/migrations.md` | Dexie schema changes |
| **Domain Models** | `agent-os/standards/backend/models.md` | Entity definitions |
| **Query Patterns** | `agent-os/standards/backend/queries.md` | Dexie CRUD operations |
| **Components** | `agent-os/standards/frontend/components.md` | React component structure |
| **CSS/8-bit** | `agent-os/standards/frontend/css.md` | Styling rules |
| **Coding Style** | `agent-os/standards/global/coding-style.md` | Import order, naming |
| **Validation** | `agent-os/standards/global/validation.md` | Zod schemas |
| **Testing** | `agent-os/standards/testing/test-writing.md` | Vitest/Playwright |

**Non-compliance = Story Rejection.**

---

## 🏗️ Architecture Overview

### Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript 5.9 |
| Routing | TanStack Router (@tanstack/react-router) |
| State | Zustand v5 + Dexie.js |
| Styling | Tailwind CSS + Radix UI |
| Build | Vite + TanStack Start |
| Testing | Vitest + Playwright |
| AI | Google Gemini (via @tanstack/ai-gemini) |

### Workspaces

| Route | Description |
|-------|-------------|
| `/notes` | Markdown/BlockNote editor |
| `/ide` | WebContainer-based IDE |
| `/study` | Flashcards/Quizzes |
| `/knowledge` | Knowledge base |
| `/marketing` | Landing page builder |
| `/settings` | API keys, Vault, Config |

### Active Epics

| ID | Name | Progress | Priority |
|----|------|----------|----------|
| EPIC-FS | File System Foundation | 28.6% | P0 |
| EPIC-39 | 8-bit Design Compliance | 0% | P1 |
| EPIC-38 | Architecture Extension | BLOCKED | P2 |

---

## 📦 Module References

| Module | Location | Purpose |
|--------|----------|---------|
| Governance | `_bmad/modules/governance/` | Gates, cycles, regulation |
| Integration Testing | `_bmad/modules/integration-testing/` | Playwright, API keys |
| Architecture Remediation | `_bmad/modules/architecture-remediation/` | ARC loop |

---

## 🔗 External References

For detailed documentation:

- **Full BMAD Framework**: `_bmad/FRAMEWORK.md`
- **ADR Decisions**: `_bmad-output/planning-artifacts/architecture/adr/`
- **Historical Content**: `_bmad-output/.archive/`
- **Standards (Full)**: `agent-os/standards/`

---

## 📋 Governance Gates

Before any workflow:

1. **Story Start**: Run `story-start-gate.yaml` checks
2. **Story Done**: Run `story-done-gate.yaml` checks
3. **Epic Done**: Run `epic-done-gate.yaml` (requires human `APPROVED: EPIC-XX`)
4. **Daily**: Run `sprint-rotation-gate.yaml`
5. **All**: Check `artifact-freshness-gate.yaml` TTL tiers

---

## 📊 Context Limits

| Limit | Value |
|-------|-------|
| Max active epics | 4 |
| Max stories per epic | 8 |
| Max active sprint files | 4 |
| YAML file limit in _bmad-output | 25 |
| workflow-status.yaml max lines | 200 |

---

## 🚀 Quick Start for New Agent Session

1. Read this file (AGENTS.md)
2. Check `bmm-workflow-status.yaml` for current story
3. Load `sprint-status.yaml` for active work
4. Load story context: `stories/{story-id}-context.xml`
5. Begin work using dev-story workflow

---

*Compressed from 3,953 lines. Full history: `_bmad-output/.archive/2026-01-09/AGENTS-v1.md`*
