# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **AUTHORITATIVE SOURCE**: See `AGENTS.md` for complete project documentation.
> CLAUDE.md is a pointer file only - all governance lives in AGENTS.md.

---

## Quick Links to AGENTS.md

| Section | Description |
|---------|-------------|
| [Architecture Reference](./AGENTS.md#-definitive-architecture-reference) | Platform architecture, data flow, ADR-024 |
| [State Management](./AGENTS.md#state-management-architecture-updated-2026-01-01) | December 2025 Zustand patterns, god store refactoring |
| [Zustand v5 Patterns](./AGENTS.md#agent-interaction-patterns--store-access-updated-2026-01-01) | Individual selectors, infinite loop prevention |
| [Agent Configuration](./AGENTS.md#agent-configuration-component-architecture-updated-2026-01-01---ralph-loop-cycle-17) | God component elimination, extracted components |
| [Workspace Architecture](./AGENTS.md#workspace-aware-agent-architecture-cycle-11-verified---95-complete) | Workspace bindings, tool permissions |
| [Key Directories](./AGENTS.md#key-directories--files) | File locations, code structure |
| [Essential Commands](./AGENTS.md#essential-development-commands) | pnpm dev, build, test, typecheck |
| [Troubleshooting](./AGENTS.md#troubleshooting) | Common issues and solutions |

---

## Claude-Specific Quick Reference

### Essential Commands

```bash
# Start development
pnpm dev

# Type checking (production code only, ~3x faster)
pnpm typecheck

# Run tests
pnpm test

# Build for production
pnpm build
```

### Import Pattern (Zustand v5)

```typescript
// ✅ CORRECT - Individual selectors
const providers = useAppStore(s => s.providers)
const removeProvider = useAppStore(s => s.removeProvider)

// ❌ WRONG - Destructuring causes infinite loops in v5
const { providers, removeProvider } = useProviderStore()
```

### Design Constraints

- **8-bit Gaming Style**: Dark-themed, pixel-perfect, NO glassmorphism/blur
- **Mobile**: Touch targets ≥44px, use `dvh` for full-screen containers
- **i18n**: All UI strings via `t()` hook
- **Size Limits**: Components ≤300 lines, slices ≤120 lines

### Active Sprint

**Session**: ASGL-20260105-155500
**Sprint**: Comprehensive Architecture Remediation (Target: 95% Health)
**Phase**: 1 (Critical Blockers Resolution)
**Loop State**: `_bmad/modules/asgl/LOOP_STATE.yaml`

---

## Platform Configuration

All development platforms should read from `AGENTS.md`:

| Platform | Config Location | Points To |
|----------|-----------------|-----------|
| Claude Code | `.claude/` → `CLAUDE.md` | `AGENTS.md` (via this file) |
| OpenCode | `.opencode/` | `AGENTS.md` |
| Gemini | `.gemini/` | `AGENTS.md` |
| BMAD | `_bmad/` | `AGENTS.md` |
| Cursor | `.cursor/` | `AGENTS.md` |
| Windsurf | `.windsurf/` | `AGENTS.md` |

---

## Governance Update Frequency

- **AGENTS.md**: Update every 3 completed stories
- **CLAUDE.md**: Pointer only (minimal updates)
- **Loop State**: Update after each story

---

**Full Documentation**: See [AGENTS.md](./AGENTS.md)
