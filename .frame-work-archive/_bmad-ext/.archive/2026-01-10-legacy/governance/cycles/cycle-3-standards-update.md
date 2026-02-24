---
id: CYCLE-3
title: Standards Foundation Update
description: Update agent-os/standards/* to reflect actual project architecture
agent_mode: tech-writer
team: A
duration_hours: 2-3
risk_level: LOW
date: 2026-01-09
---

# CYCLE 3: Standards Foundation Update

**Agent Mode:** Tech Writer
**Team:** A
**Duration:** 2-3 hours
**Context Poisoning Risk:** LOW (reference docs, not auto-consumed)

## OBJECTIVE

Update `agent-os/standards/` directories to reflect the actual project architecture:
- React 19 + TypeScript 5.9 + Vite + TanStack Router + Zustand v5
- Clean Architecture: `src/infrastructure/`, `src/domain/`, `src/presentation/`
- 8-bit design system (NO glassmorphism, NO rounded-lg, sharp corners)
- Dexie for IndexedDB persistence
- WebContainer for browser-based code execution

## PRECONDITIONS

- [ ] CYCLE 1 completed (stale artifacts archived)
- [ ] Access to architecture.md and ux-specification.md
- [ ] Codebase is in stable state

## INPUT ARTIFACTS (Read These First)

```yaml
primary_sources:
  - "_bmad-output/planning-artifacts/architecture.md"  # 44KB, source of truth
  - "_bmad-output/planning-artifacts/ux-specification.md"  # 62KB, design system
  - "AGENTS.md"  # Lines 176-270 for canonical locations

supporting_analysis:
  - "_bmad-output/planning-artifacts/codebase-scan-results/store-analysis.yaml"
  - "_bmad-output/planning-artifacts/codebase-scan-results/component-inventory.yaml"
  - "_bmad-output/planning-artifacts/architecture/codebase-analysis/state-architecture.yaml"
```

## FILES TO UPDATE

### Global Standards (`agent-os/standards/global/`)

| File | Current | Action | Target Lines |
|------|---------|--------|--------------|
| `coding-style.md` | 280 lines | UPDATE - Add Clean Architecture imports | 300+ |
| `conventions.md` | ~500 lines | UPDATE - Add canonical paths | 400+ |
| `error-handling.md` | ~450 lines | UPDATE - Add Sentry integration | 350+ |
| `tech-stack.md` | ~300 lines | UPDATE - 2026 versions | 300+ |
| `validation.md` | ~700 lines | UPDATE - Add Zod patterns | 400+ |
| `mcp-research.md` | ~400 lines | KEEP - Already good | - |
| `commenting.md` | ~600 lines | UPDATE - JSDoc focus | 350+ |

### Backend Standards (`agent-os/standards/backend/`)

| File | Current | Action | Target Lines |
|------|---------|--------|--------------|
| `api.md` | 11 lines | REWRITE - TanStack Start server functions | 250+ |
| `migrations.md` | ~25 lines | REWRITE - Dexie version migrations | 250+ |
| `models.md` | ~30 lines | REWRITE - Domain entity patterns | 250+ |
| `queries.md` | ~30 lines | REWRITE - Dexie query patterns | 250+ |

### Frontend Standards (`agent-os/standards/frontend/`)

| File | Current | Action | Target Lines |
|------|---------|--------|--------------|
| `components.md` | 926 lines | UPDATE - Add Radix + CVA patterns | 500+ |
| `css.md` | ~600 lines | UPDATE - 8-bit design tokens | 400+ |
| `accessibility.md` | ~700 lines | UPDATE - WCAG 2.1 AA target | 400+ |
| `responsive.md` | ~700 lines | UPDATE - Mobile-first patterns | 400+ |

### Testing Standards (`agent-os/standards/testing/`)

| File | Current | Action | Target Lines |
|------|---------|--------|--------------|
| `test-writing.md` | ~700 lines | UPDATE - Vitest + Playwright | 400+ |
| `e2e-testing.md` | NEW | CREATE - Playwright patterns | 300+ |
| `integration-testing.md` | NEW | CREATE - Real API key usage | 250+ |

## CONTENT REQUIREMENTS

### Every Standards File Must Have:

```yaml
frontmatter_required:
  - date: "YYYY-MM-DD"
  - time: "HH:MM:SS"
  - phase: "Standards"
  - team: "Team-A or Team-B"
  - last_updated_by: "agent-mode"

content_requirements:
  - minimum_lines: 200
  - actual_file_references: true  # Must reference src/ paths
  - code_examples: true  # Working examples from codebase
  - anti_patterns: true  # What NOT to do
  - related_standards: true  # Links to other standards
```

### Architecture Paths (Use These)

```typescript
// ✅ CANONICAL PATHS (After ADR-024)
infrastructure:
  stores: "src/infrastructure/persistence/stores/"
  dexie: "src/infrastructure/persistence/dexie-db.ts"
  events: "src/infrastructure/events/"
  sync: "src/infrastructure/sync/"

domain:
  services: "src/domain/services/"
  types: "src/domain/types/"

presentation:
  components: "src/presentation/components/"
  hooks: "src/presentation/hooks/"
  routes: "src/routes/"

// ❌ DEPRECATED PATHS (Show as anti-patterns)
deprecated:
  - "src/lib/state/"  # → Use infrastructure/persistence/stores
  - "src/stores/"     # → Use infrastructure/persistence/stores
  - "src/lib/filesystem/sync-manager"  # → Use infrastructure/sync
```

### 8-bit Design System (CSS Standards)

```css
/* ✅ REQUIRED - 8-bit Design Tokens */
:root {
  --radius-none: 0;        /* Sharp corners only */
  --radius-sm: 2px;        /* Minimal rounding */
  --shadow-pixel: 4px 4px 0 0 var(--shadow-color);  /* Pixel shadow */
}

/* ❌ FORBIDDEN */
.element {
  border-radius: 0.5rem;   /* NO - too rounded */
  border-radius: 9999px;   /* NO - pill shape */
  backdrop-filter: blur(); /* NO - glassmorphism */
  opacity: 0.8;            /* AVOID - use solid colors */
}
```

## EXECUTION STEPS

### Step 1: Archive Old Standards

```bash
mkdir -p agent-os/standards/_archive/2026-01-09
cp -r agent-os/standards/backend agent-os/standards/_archive/2026-01-09/
cp -r agent-os/standards/frontend agent-os/standards/_archive/2026-01-09/
cp -r agent-os/standards/global agent-os/standards/_archive/2026-01-09/
cp -r agent-os/standards/testing agent-os/standards/_archive/2026-01-09/
```

### Step 2: Read Source Documents

1. Load `architecture.md` for canonical paths
2. Load `ux-specification.md` for design system
3. Load codebase analysis YAMLs for current reality

### Step 3: Update Each File

For each standards file:
1. Read current content
2. Identify outdated references
3. Update with accurate paths and patterns
4. Add frontmatter
5. Ensure 200+ lines minimum

### Step 4: Validate Updates

```bash
# Check all files have frontmatter
for f in agent-os/standards/**/*.md; do
  if ! grep -q "^---" "$f"; then
    echo "MISSING FRONTMATTER: $f"
  fi
done

# Check minimum line count
for f in agent-os/standards/**/*.md; do
  lines=$(wc -l < "$f")
  if [ $lines -lt 200 ]; then
    echo "TOO SHORT ($lines lines): $f"
  fi
done
```

## VALIDATION CHECKLIST

- [ ] All files have frontmatter with date, time, phase, team
- [ ] All files are 200+ lines (minimum depth requirement)
- [ ] All file references point to actual `src/` paths
- [ ] No outdated references (no `stores/` → use `infrastructure/persistence/stores/`)
- [ ] Each standard links to related standards
- [ ] 8-bit design system constraints documented in CSS standards
- [ ] Clean Architecture paths documented in coding-style.md

## OUTPUT ARTIFACTS

1. Updated files in `agent-os/standards/`
2. Archive of old versions in `agent-os/standards/_archive/2026-01-09/`
3. Update summary: `_bmad-output/governance/standards-update-2026-01-09.md`

## HANDOFF

Report completion to orchestrator with:
- File list and line counts (before/after)
- Major changes made
- Any gaps identified for future updates
