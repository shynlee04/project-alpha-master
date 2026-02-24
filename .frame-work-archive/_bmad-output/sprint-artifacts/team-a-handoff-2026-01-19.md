# TEAM A HANDOFF - GOVERNANCE ENFORCEMENT

**Generated**: 2026-01-19T14:30:00+07:00
**From**: BMAD Master Orchestrator (Gatekeeper)
**To**: Team A (Platform & Routing Squad)
**Status**: 🟢 GOOD STANDING - Honest claims

---

## ✅ TEAM STATUS: GOOD STANDING

Team A has demonstrated honest behavior by:
- Not overclaiming work
- Doing silent fixes without false claims
- Correctly marking pending work as PENDING

---

## ✅ CONFIRMED REMEDIATED (Your silent work validated)

| Infection | File | Evidence |
|-----------|------|----------|
| ROUTE-001 | ide.tsx:40-62 | beforeLoad with getPlatformContract() check exists |
| ROUTE-003 | ide.$projectId.tsx:87-124 | Clear separation: beforeLoad=platform only, loader=data only |
| PLAT-002 | notes.lazy.tsx | Browser-mode for /notes is correct by design per ADR-033 |

**Good work!** These were done correctly without overclaiming.

---

## ❌ STILL INFECTED (Correctly marked PENDING - now assigned)

### 1. ROUTE-002: ide.tsx uses window.location
**Status**: PENDING → ASSIGNED TO YOU

**File**: `src/routes/ide.tsx`
**Line**: 114

**Current code (WRONG)**:
```typescript
// Direct DOM access - causes hydration issues
const isOnChildRoute = window.location.pathname !== '/ide';
```

**Required fix**:
```typescript
import { useMatchRoute } from '@tanstack/react-router';

// Inside component:
const matchRoute = useMatchRoute();
const isOnChildRoute = !!matchRoute({ to: '/ide/$projectId', fuzzy: true });
```

**Validation checklist**:
- [ ] `grep 'window.location' src/routes/ide.tsx` returns 0 results
- [ ] Navigation between /ide and /ide/$projectId works correctly
- [ ] No hydration warnings in console

---

### 2. PLAT-001: Temp project button visible on desktop
**Status**: PENDING → ASSIGNED TO YOU

**File**: `src/routes/ide.tsx`
**Lines**: 140-146

**Current code (WRONG)**:
```typescript
// Desktop shows temp project button - violates ADR-033
<button onClick={() => handleCreateTemp(navigate)}>
  <Plus className="h-4 w-4" />
  ⚡ Quick IDE (Temp Project)
</button>
```

**Required fix**:
```typescript
const platform = getPlatformContract();

// Only show temp project on mobile/fallback (when FSA not available)
{!platform.canAccessFSA && (
  <button onClick={() => handleCreateTemp(navigate)}>
    <Plus className="h-4 w-4" />
    ⚡ Quick IDE (Temp Project)
  </button>
)}
```

**Validation checklist**:
- [ ] Desktop /ide: NO "Temp Project" button visible
- [ ] Only "Select Project Folder" and "Browse Projects" shown on desktop
- [ ] Mobile emulation: Temp project button IS visible (fallback)

---

## 📋 REQUIRED ACTIONS

### Immediate (P0):
1. **Fix PLAT-001** (hide temp project on desktop)

### High Priority (P1):
2. **Fix ROUTE-002** (window.location → useMatchRoute)

### Before Submission:
1. Run `pnpm tsc --noEmit` - must be 0 errors
2. Test on desktop: verify temp project button hidden
3. Test on mobile emulation: verify temp project button visible
4. Verify navigation works correctly

### Submission Format:
```
## Team A Submission - [DATE]

### Work Completed:
- PLAT-001: [description of fix]
- ROUTE-002: [description of fix]

### Evidence:
- TypeScript: [paste output]
- Desktop test: [describe what you see]
- Mobile test: [describe what you see]

### Files Modified:
- src/routes/ide.tsx (lines X-Y)
```

---

## 🟢 TEAM A PRIVILEGES (Good Standing)

Since Team A has demonstrated honest behavior:
1. You may submit work with standard evidence
2. Faster validation turnaround
3. Trust extended for accurate claims

**Continue maintaining honest claims!**

---

**Gatekeeper**: BMAD Master Orchestrator
**Submission deadline**: Before next work session
