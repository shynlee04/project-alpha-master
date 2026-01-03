---
date: 2026-01-03
time: 23:30:00
phase: Phase 0-B - Circular Dependency Fix
story: 51-corrective-course
team: Team A
agent_mode: bmad-bmm-dev
iteration: 463
previous: iteration-1063 (corrective course plan)
---

# Phase 0-B: Fix Circular Dependency Bug

**Generated**: 2026-01-03T23:30:00+07:00
**Previous Completion**: Phase 0-A (Grand Cycle 4) - All production errors fixed
**Current Focus**: Eliminate circular dependency between legacy stores
**Target**: 19 components using deprecated `@/stores/agents-store` path

---

## Executive Summary

**Critical Issue**: Circular dependency exists between:
- `src/stores/agents-store.ts` (deprecated legacy path)
- `src/lib/state/provider-store.ts` (deprecated legacy path)

**Impact**: 19 components across all workspaces at risk of infinite loops in Zustand v5

**Solution**: Migrate all 19 components to modern store path:
- `@/infrastructure/persistence/stores/use-app-store`

**Estimated Effort**: 6-8 hours (per corrective course plan)

---

## Migration Strategy

### Step 1: Audit All Deprecated Imports (1 hour)

Find all components using legacy `@/stores/agents-store` path.

### Step 2: Update Import Paths (3-4 hours)

Migrate from deprecated paths to modern unified store.

### Step 3: Verify Component Functionality (2-3 hours)

Test agent/provider CRUD across all workspaces.

---

## Files to Update (19 components)

### Core UI Components (2)
- [ ] AgentConfigDialog.tsx
- [ ] ProviderConfigDialog.tsx
- [ ] ProviderSettings.tsx
- [ ] AgentsPanel.tsx

### Agent Chat Components (1)
- [ ] AgentChatPanel.tsx

### Workspace Components (9)
- [ ] Knowledge workspace (3 files)
- [ ] Notes workspace (3 files)
- [ ] Study workspace (3 files)

### Other Consumers (4)
- [ ] Additional components consuming deprecated stores

---

## Validation Checklist

Before marking Phase 0-B complete:

- [ ] Zero circular dependency warnings (`pnpm madge --circular src/`)
- [ ] All 19 components use modern store paths
- [ ] AgentConfigDialog functional (create/edit/delete agents)
- [ ] ProviderConfigDialog functional (add/remove providers)
- [ ] UnifiedAgentSelector functional (select agents)
- [ ] Zero production TypeScript errors
- [ ] Development server runs without errors

---

## Progress Tracking

**Started**: 2026-01-03T23:30:00+07:00
**Components Audited**: 0/19
**Components Migrated**: 0/19
**Components Verified**: 0/19

**Next Action**: Begin audit by finding all deprecated imports.
