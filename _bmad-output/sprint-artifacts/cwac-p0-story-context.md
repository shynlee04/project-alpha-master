## Story Context: CWAC-P0 - Address Critical P0 Issues

**Story ID**: CWAC-P0  
**Priority**: P0 (Critical)  
**Effort**: 24 hours  
**Status**: IN_PROGRESS

### Issue Summary

Per Master Workflow Section 2.2, the following critical issues MUST be fixed before starting Sprint 1 stories:

| Priority | Issue | File | Current Lines | Target |
|----------|-------|------|---------------|--------|
| **P0-1** | God Store | `src/lib/agent/tool-permission-manager.ts` | 860 | ≤300 |
| **P0-2** | God Store | `src/infrastructure/persistence/stores/workspace/unified-workspace-provider.tsx` | 734 | ≤300 |
| **P0-3** | Duplicate Event Bus | `lib/events/` vs `infrastructure/events/` | - | Consolidate |
| **P1-1** | Missing chat i18n | `src/i18n/` | 0 entries | Add chat namespace |

### Context Files

```
src/lib/agent/
├── tool-permission-manager.ts (860 lines) - GOD STORE
├── workspace-permission-manager.ts
├── workspace-execution-context.ts
└── workspace-tool-filter.ts

src/infrastructure/persistence/stores/workspace/
├── unified-workspace-provider.tsx (734 lines) - GOD STORE
├── unified-workspace-context.ts
└── use-workspace.ts

src/lib/events/ (deprecated)
src/infrastructure/events/ (canonical)
```

### Root Cause Analysis

**P0-1 (tool-permission-manager.ts)**:
- Contains 40+ methods for permission management
- Implements singleton pattern with extensive backward compatibility
- YOLO mode, category approvals, session trust all in one file
- Needs: Split into types.ts, store-slice.ts, facade.ts

**P0-2 (unified-workspace-provider.tsx)**:
- Contains 734 lines with workspace context logic
- React provider + state management + hooks all in one file
- Needs: Split into provider.tsx, context.ts, hooks.ts

**P0-3 (Duplicate Event Bus)**:
- Two implementations: `lib/events/` and `infrastructure/events/`
- `lib/events/cross-workspace-event-bus.ts` (14KB)
- `infrastructure/events/cross-workspace-event-bus.ts` (7KB)
- Needs: Consolidate to infrastructure/events/, update imports

**P1-1 (Missing chat i18n)**:
- chat namespace missing from en.json and vi.json
- All chat UI strings should be under "chat" key
- Needs: Add chat namespace to both JSON files

### Implementation Plan

#### Phase 1: Split tool-permission-manager.ts (8h)
1. Create `src/lib/agent/tool-permission/types.ts` (120 lines)
2. Create `src/lib/agent/tool-permission/store-slice.ts` (150 lines)
3. Create `src/lib/agent/tool-permission/facade.ts` (100 lines)
4. Update original file to re-export from facade
5. TypeScript validation

#### Phase 2: Split unified-workspace-provider.tsx (8h)
1. Create `src/infrastructure/persistence/stores/workspace/provider.tsx` (200 lines)
2. Create `src/infrastructure/persistence/stores/workspace/hooks.ts` (150 lines)
3. Create `src/infrastructure/persistence/stores/workspace/context.ts` (100 lines)
4. Update original file to re-export
5. TypeScript validation

#### Phase 3: Consolidate Event Bus (4h)
1. Audit both implementations
2. Keep `infrastructure/events/` as canonical
3. Move functionality from `lib/events/`
4. Update all imports across codebase
5. Delete deprecated `lib/events/` directory

#### Phase 4: Add chat i18n namespace (4h)
1. Add "chat" namespace to en.json
2. Add "chat" namespace to vi.json
3. Extract chat strings from components
4. Update components to use t('chat.xxx')
5. Run i18n:extract

### Dependencies

- None (foundational work)

### Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking changes | HIGH | Use facade pattern for backward compatibility |
| Import conflicts | MEDIUM | Update imports incrementally, run typecheck |
| i18n breakage | MEDIUM | Test UI after adding namespace |

### Gemini 2.5/3.0 Research Notes

Per Master Workflow Section 12, Gemini API research results:

- **gemini-2.5-flash-native-audio**: GA (Dec 12, 2025)
  - Native audio input/output (16kHz PCM in, 24kHz PCM out)
  - 30 HD voices, 24 languages
  - Proactive Audio, Affective Dialog (preview)
  - Max 1000 concurrent sessions
  - Model ID: `gemini-live-2.5-flash-native-audio`

- **gemini-3-flash-preview**: New (Dec 17, 2025)
  - Faster performance, lower cost
  - Multimodal function responses
  - Code execution with images

### Validation Commands

```bash
# TypeScript check (exclude test files)
pnpm exec tsc --noEmit --incremental 2>&1 | grep -v "\.test\." | grep -c "error TS"

# Expected: 0 errors (production code only)
```

### Acceptance Criteria

- [ ] P0-1: tool-permission-manager.ts refactored to ≤300 lines
- [ ] P0-2: unified-workspace-provider.tsx refactored to ≤300 lines
- [ ] P0-3: Event bus consolidated to single location
- [ ] P1-1: Chat i18n namespace added to en.json and vi.json
- [ ] All imports updated to new locations
- [ ] TypeScript validation: 0 errors (production code)
- [ ] No breaking changes (facade pattern)

### Notes

Per Master Workflow Section 4, this follows the Story Development Cycle:
1. ✅ Create story context (this file)
2. ⏳ Validate create-story-context
3. ⏳ Development
4. ⏳ Sweeping validation
5. ⏳ Code review
6. ⏳ Loop until 100%

---
*Generated: 2026-01-05T06:30:00+07:00*
*Master Workflow: _bmad/modules/cross-workspace-chat/workflows/MASTER-WORKFLOW.md*
