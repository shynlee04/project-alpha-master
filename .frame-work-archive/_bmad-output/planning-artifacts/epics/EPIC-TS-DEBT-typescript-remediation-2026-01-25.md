# EPIC-TS-DEBT: TypeScript Technical Debt Remediation

**Created**: 2026-01-25
**Priority**: P1 (Not blocking user features, but blocking code quality)
**Estimated Effort**: 8-12 hours
**Status**: READY_FOR_PLANNING
**ADR Reference**: ADR-034-project-centric-architecture-2026-01-20.md

---

## Executive Summary

The codebase has accumulated ~115+ TypeScript errors across multiple domains. These are **pre-existing** errors NOT introduced by recent EPIC-ARCH-03 work. This epic systematically addresses them in priority order.

## Error Inventory (as of 2026-01-25)

### Domain 1: Agent/Tools System (~50 errors)
| File | Error Count | Error Types |
|------|-------------|-------------|
| `src/lib/agent/factory.ts` | 14 | Missing functions, unused imports, property errors |
| `src/lib/agent/tools/process-image-tool.ts` | 6 | Argument count, missing properties |
| `src/lib/agent/tools/process-pdf-tool.ts` | 8 | Missing properties on result type |
| `src/lib/agent/tools/process-url-tool.ts` | 2 | Argument count, missing property |
| `src/lib/agent/tools/synthesize-tool.ts` | 12 | Missing properties on result type |
| `src/lib/agent/tools/note-commands.ts` | 4 | Unused parameters, null vs undefined |

### Domain 2: Notes Sync System (~20 errors)
| File | Error Count | Error Types |
|------|-------------|-------------|
| `src/lib/notes/sync/cache-sync.ts` | 15 | Map vs Array methods (filter/find don't exist on Map) |
| `src/lib/notes/format/note-formatter.ts` | 3 | Type mismatches |
| `src/lib/notes/sync/note-sync-layer.ts` | 1 | Unused property |

### Domain 3: Diagnostics (~9 errors)
| File | Error Count | Error Types |
|------|-------------|-------------|
| `src/lib/diagnostics/trace-system.ts` | 9 | Duplicate export declarations |

### Domain 4: Plugins (~15 errors)
| File | Error Count | Error Types |
|------|-------------|-------------|
| `src/plugins/chat/useChatPlugin.ts` | 6 | Unknown context type |
| `src/plugins/monaco/MonacoPlugin.tsx` | 7 | Unused imports/variables |
| `src/plugins/terminal/TerminalPlugin.tsx` | 1 | Missing property on Project type |

### Domain 5: Presentation Components (~15 errors)
| File | Error Count | Error Types |
|------|-------------|-------------|
| `src/presentation/components/ide/SettingsPanel.tsx` | 4 | Cannot find names |
| `src/presentation/components/project/steps/ReviewStep.tsx` | 10 | Missing properties on types |
| Various sidebar components | 5 | Unused imports |

### Domain 6: Infrastructure (~5 errors)
| File | Error Count | Error Types |
|------|-------------|-------------|
| `src/infrastructure/filesystem/markdown-sync-service.ts` | 1 | Promise vs Array |
| `src/infrastructure/persistence/services/db-consolidation-service.ts` | 1 | Type mismatch |
| `src/lib/workspace/project-repository.ts` | 3 | Type mismatches |

### Domain 7: Scripts (~10 errors)
| File | Error Count | Error Types |
|------|-------------|-------------|
| `src/scripts/rollback-fsa-migration.ts` | 10 | Unused variables |

### Domain 8: Routes/API (~5 errors)
| File | Error Count | Error Types |
|------|-------------|-------------|
| `src/routes/api/*.ts` | 5 | Unused @ts-expect-error directives |

---

## Proposed Stories

### TS-DEBT-01: Agent Tools Type Definitions (P0)
**Effort**: 3-4 hours
**Description**: Fix all type issues in `src/lib/agent/tools/` and `src/lib/agent/factory.ts`
**Root Cause**: TanStack AI SDK return types don't match expected properties
**Solution**: Update tool result types to match actual SDK responses

### TS-DEBT-02: Notes Sync Map/Array Fix (P0)
**Effort**: 2 hours
**Description**: Fix `cache-sync.ts` using Array methods on Map objects
**Root Cause**: Code assumes `notes` is Array, but it's a Map
**Solution**: Convert to `Array.from(notes.values()).filter(...)` pattern

### TS-DEBT-03: Diagnostics Duplicate Exports (P1)
**Effort**: 1 hour
**Description**: Consolidate duplicate exports in `trace-system.ts`
**Root Cause**: Same functions exported multiple times
**Solution**: Remove duplicate export declarations

### TS-DEBT-04: Plugin Context Types (P1)
**Effort**: 2 hours
**Description**: Fix unknown context types in chat plugin
**Root Cause**: Missing type definitions for plugin context
**Solution**: Add proper typing to ChatProvider context

### TS-DEBT-05: Component Type Cleanup (P2)
**Effort**: 2 hours
**Description**: Fix presentation component type errors
**Root Cause**: Missing properties on WizardFormData, unused variables
**Solution**: Update types, remove unused code

### TS-DEBT-06: Infrastructure Type Fixes (P2)
**Effort**: 1 hour
**Description**: Fix remaining infrastructure type errors
**Root Cause**: Promise vs sync return types, missing properties
**Solution**: Align return types with actual implementations

---

## Success Criteria

| Metric | Target |
|--------|--------|
| TypeScript errors | 0 (from current ~115) |
| Build status | SUCCESS |
| No regressions | 0 new errors introduced |
| Test coverage | Maintained or improved |

## Dependencies

| Dependency | Relationship |
|------------|--------------|
| ADR-034 | Architecture reference |
| EPIC-ARCH-03 | Should complete first |
| TanStack AI SDK | May need version upgrade |

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Type fixes break runtime | Medium | High | Run tests after each story |
| SDK incompatibility | Low | Medium | Check TanStack docs first |
| Cascading changes | Medium | Medium | Fix in isolation, test incrementally |

---

## Execution Strategy

1. **Start with P0 stories** - These affect core functionality
2. **Batch similar errors** - Fix all Map/Array issues together
3. **Test incrementally** - Run `pnpm tsc --noEmit` after each file
4. **Document patterns** - Create standards for future prevention

## Notes

This epic is **NOT user-facing**. It improves developer experience and code quality.
Prioritize based on which domains are actively being developed.
