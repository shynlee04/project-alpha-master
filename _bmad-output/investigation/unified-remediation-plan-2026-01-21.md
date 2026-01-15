# Unified Remediation Plan - ADR Rescue

**Date**: 2026-01-21
**Status**: READY FOR EXECUTION
**Purpose**: Single coordinated plan to fix all remaining issues

---

## Executive Summary

Based on comprehensive deep-dive investigation, this plan defines the unified remediation approach for all ADR-related issues.

**Investigation Summary**:
- Total Infections: 42 (1 new + 41 from ADRs)
- Resolved: 15 (36%)
- Partially Resolved: 4 (9%)
- Active: 4 (9%)
- Pending Investigation: 19 (45%)

---

## Priority Matrix

### P0 - Critical (Block Users)

| # | Issue | Domain | Fix | Effort | Impact |
|---|-------|--------|-----|--------|--------|
| 1 | Bug #1: Chrome version check | FSA Handle | Change exact match to >= 129 | 5 min | Unblocks 20% of users |
| 2 | TypeScript errors | Build | Fix duplicate imports | 10 min | Build failing |

### P1 - High (Affects UX)

| # | Issue | Domain | Fix | Effort | Impact |
|---|-------|--------|-----|--------|--------|
| 3 | STATE-002: projectId persistence | State | Don't persist projectId | 30 min | Correct hydration |
| 4 | STATE-001 verification | State | Verify memory-only pattern | 15 min | Confirm design |
| 5 | Temp project function | Platform | Remove or restrict | 15 min | ADR-033 compliance |

### P2 - Medium (Complete Remediation)

| # | Issue | Domain | Fix | Effort | Impact |
|---|-------|--------|-----|--------|--------|
| 6 | STATE-004 to STATE-012 | State | Complete scan | 2 hours | Full visibility |
| 7 | ROUTE-003 to ROUTE-012 | Routing | Complete scan | 1.5 hours | Full visibility |
| 8 | PLAT-005 verification | Platform | Locate shouldUseTempProject | 15 min | Verify logic |
| 9 | LocalStorage migration | State | Move stores to Dexie | 4 hours | ADR-035 compliance |

---

## Execution Plan

### Phase 1: Critical Fixes (30 min)

**Objective**: Unblock Chrome 130+ users and fix build

**Tasks**:
1. Fix Bug #1 in permission-lifecycle.ts
2. Fix TypeScript errors in notes.lazy.tsx

**Deliverables**:
- Chrome 130+ users can use IDE
- Build passes

**Verification**:
```bash
pnpm tsc --noEmit  # Should pass
# Manual test with Chrome DevTools UA override
```

---

### Phase 2: State Remediation (45 min)

**Objective**: Fix project scoping issues

**Tasks**:
1. Verify STATE-001 (memory-only pattern)
2. Fix STATE-002 (projectId persistence)
3. Restrict temp project function

**Deliverables**:
- Correct project hydration
- No cross-project state contamination

**Verification**:
```typescript
// Check IDE store doesn't persist projectId
// Navigate between projects, verify correct state
```

---

### Phase 3: Complete Investigation (5 hours)

**Objective**: Finish all remaining scans

**Tasks**:
1. Complete STATE-004 to STATE-012 scan
2. Complete ROUTE-003 to ROUTE-012 scan
3. Verify PLAT-005
4. Create missing route files (knowledge.$projectId.tsx, study.$projectId.tsx)
5. Migrate localStorage stores to Dexie

**Deliverables**:
- All infections documented
- Missing files created
- LocalStorage stores migrated

**Verification**:
- All infection scans complete
- No localStorage for project data
- All routes have proper guards

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Breaking existing FSA projects | HIGH | Backup db.fsaHandles before changes |
| State migration failures | HIGH | Version check, migration script |
| Route changes break bookmarks | LOW | Redirect from old routes |
| Chrome version fragmentation | MEDIUM | Feature detection, graceful fallback |

---

## Rollback Strategy

### If Phase 1 Fails

1. Revert changes to permission-lifecycle.ts
2. Revert changes to notes.lazy.tsx
3. Document failure reason

### If Phase 2 Fails

1. Keep STATE-002 as-is (workaround exists via hydration-manager.ts)
2. Keep temp project function (hidden in UI)

### If Phase 3 Fails

1. Defer remaining scans to next sprint
2. Focus on P0 and P1 fixes only

---

## Testing Strategy

### Unit Tests

```bash
# Run TypeScript check
pnpm tsc --noEmit

# Run unit tests
pnpm vitest run
```

### Integration Tests

```typescript
// Test scenarios:
1. Chrome 130+ user opens IDE
2. Navigate between projects
3. Mobile user opens Notes
4. Desktop user opens Notes
5. Page refresh (state restoration)
```

### Manual Testing

| Scenario | Expected | Status |
|----------|----------|--------|
| Chrome 130+ → /ide | IDE loads files | ❌ Before fix |
| Chrome 129 → /ide | IDE loads files | ✅ |
| Desktop → /notes | Project picker shown | ✅ |
| Mobile → /notes | Browser-mode project | ✅ |
| Refresh page | State restored | ❌ Before fix |

---

## Success Criteria

- [ ] TypeScript: 0 errors
- [ ] Chrome 130+ users can use IDE
- [ ] Desktop Notes working
- [ ] Mobile Notes working
- [ ] Project hydration correct
- [ ] All infection scans complete
- [ ] No localStorage for project data

---

## Timeline

| Phase | Duration | Total |
|-------|----------|-------|
| Phase 1: Critical Fixes | 30 min | 30 min |
| Phase 2: State Remediation | 45 min | 1h 15m |
| Phase 3: Complete Investigation | 5 hours | 6h 15m |

---

## Next Steps

1. **Execute Phase 1** (30 min)
2. **Verify Phase 1** (15 min)
3. **Execute Phase 2** (45 min)
4. **Verify Phase 2** (15 min)
5. **Execute Phase 3** (5 hours)
6. **Final verification** (1 hour)

**Total Timeline**: ~8 hours

---

**Document Owner**: BMAD Master Orchestrator
**Created**: 2026-01-21T15:00:00+07:00
**Status**: READY FOR EXECUTION
**Ready to Start**: Upon user approval