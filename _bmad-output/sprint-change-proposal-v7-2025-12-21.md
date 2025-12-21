# Sprint Change Proposal v7: Production Regression Fix
**Date:** 2025-12-21  
**Triggered By:** Multiple critical regressions detected in production (Cloudflare) and local dev  
**Affected Since:** Epic 22 + Epic 23 implementation

---

## 1. Issue Summary

### 🚨 Change Trigger
After deploying Epic 22 (Production Hardening) and Epic 23 (UX/UI Modernization), multiple critical features that were working before are now broken in both:
- ✅ Cloudflare deployment (`dev-via-gent.shynlee04.workers.dev`)
- ✅ Local development server (`pnpm dev`)

**Evidence:** User screenshot showing "Something went wrong" error page on production.

### 🔴 Critical Regressions Detected

| # | Bug ID | Issue | Severity | Epic Reference |
|---|--------|-------|----------|----------------|
| 1 | **BUG-10** | Persistence broken - File sync state, FileTree status not persisting on reload | CRITICAL | Epic 5 |
| 2 | **BUG-11** | Context menu missing - Right-click create/edit/rename/delete not working | HIGH | Epic 4 |
| 3 | **BUG-12** | Terminal pnpm version - `ERR_PNPM_UNSUPPORTED_ENGINE` (8.15.6 vs ^9) | HIGH | Epic 2 |
| 4 | **BUG-13** | "Something went wrong" - Production crash (see screenshot) | CRITICAL | SSR/Deployment |
| 5 | **BUG-14** | FileTree collapse state resets on file edit + triggers resync | HIGH | Epic 3/10 |

---

## 2. Impact Analysis

### Epic Impact

| Epic | Status | Impact |
|------|--------|--------|
| **Epic 3** (File System Access) | DONE | Regression: Sync state not persisting |
| **Epic 4** (IDE Components) | DONE | Regression: Context menu not functional |
| **Epic 5** (Persistence Layer) | DONE | Regression: IndexedDB not being read on load |
| **Epic 10** (Event Bus) | DONE | Regression: File changes triggering full tree collapse |
| **Epic 22** (Production Hardening) | DONE | May have introduced: SSR/server entry issues |
| **Epic 23** (UX/UI Modernization) | IN_PROGRESS | May have introduced: Component import/rendering issues |

### Story Impact
- All previously completed stories in Epic 3, 4, 5 are affected
- Need regression test suite

### Artifact Conflicts

| Artifact | Issue |
|----------|-------|
| `src/server.ts` | New custom server entry for COOP/COEP headers - may break SSR |
| `wrangler.jsonc` | Entry point changed to custom server |
| TailwindCSS 4.x migration | Style/component changes may affect rendering |
| ShadcnUI integration | New component library may have side effects |

---

## 3. Root Cause Analysis

### BUG-10: Persistence Layer Not Working

**Hypothesis:**
1. `useIdeStatePersistence` hook is connected but `projectId` may be null/undefined on initial load
2. IndexedDB operations may be failing silently
3. The `persistenceSuppressedRef` may be staying true

**Investigation Needed:**
```tsx
// Check in useIdeStatePersistence.ts line 104
if (!projectId || persistenceSuppressedRef.current) return;
```

### BUG-11: Context Menu Not Working

**Hypothesis:**
1. CSS z-index issue with new TailwindCSS 4.x styles
2. Event handlers (`handleContextMenu`) not being called
3. Portal rendering issue with ShadcnUI integration

**Investigation Needed:**
- Check if `contextMenu.visible` is being set to true
- Verify CSS positioning is correct

### BUG-12: Terminal pnpm Version

**Root Cause:**
WebContainer ships with pnpm 8.15.6. The project's `package.json` has no `engines` field, but dependencies may require pnpm ^9.

**Fix:**
Add to `package.json`:
```json
"engines": {
  "node": ">=18",
  "pnpm": "^8.15.0 || ^9 || ^10"
}
```

Or update WebContainer boot to use specific pnpm version.

### BUG-13: "Something went wrong" Error

**Hypothesis:**
1. SSR error in `src/server.ts` custom entry
2. Missing environment variable
3. Sentry initialization failing

**Investigation Needed:**
- Check Cloudflare logs
- Check Sentry dashboard for error details
- Verify `src/server.ts` error handling

### BUG-14: FileTree Collapse on Edit

**Hypothesis:**
1. `expandedPaths` is React state only - not persisted
2. File sync event triggers `loadRootDirectory()` which resets tree
3. Event bus publishing file changes causes unnecessary re-renders

---

## 4. Recommended Approach

### Classification: **MAJOR** ⚠️
This requires fundamental investigation and potentially reverting parts of Epic 22/23.

### Recommended Path

1. **Immediate (P0):** Fix "Something went wrong" error - production is broken
2. **High (P1):** Fix persistence layer - core functionality broken
3. **High (P1):** Fix context menu - core functionality broken
4. **Medium (P2):** Fix terminal pnpm version
5. **Medium (P2):** Fix FileTree collapse state

### Action Plan

#### Step 1: Diagnose Production Error (1-2 hours)
- Check Cloudflare deployment logs
- Add error logging to `src/server.ts`
- Check if SSR is failing

#### Step 2: Create Epic 27 - Regression Fixes (New)
Create new stories for each bug:

| Story | Title | Priority | Points |
|-------|-------|----------|--------|
| 27-1 | Fix Production SSR Error | P0 | 3 |
| 27-2 | Fix Persistence Layer Regression | P0 | 5 |
| 27-3 | Fix Context Menu Functionality | P1 | 3 |
| 27-4 | Fix Terminal pnpm Version | P2 | 2 |
| 27-5 | Fix FileTree State Persistence | P2 | 3 |

#### Step 3: Consider Rollback
If fixes take >1 day, consider:
- Reverting to last known good commit (before Epic 22/23)
- Applying Epic 22/23 changes incrementally with testing

---

## 5. Implementation Handoff

### Scope: MAJOR

**Route To:** Platform A (Current Agent)

### Immediate Actions

1. **Debug production error locally:**
   ```bash
   pnpm build
   pnpm preview  # Test SSR locally
   ```

2. **Check Sentry for error details:**
   - Login to Sentry dashboard
   - Check recent errors from production

3. **Add console.log debugging:**
   ```tsx
   // In AppErrorBoundary.tsx
   console.error('[AppErrorBoundary]', error.message, error.stack)
   ```

4. **Test persistence layer:**
   - Open browser DevTools → Application → IndexedDB
   - Check if `via-gent-persistence` database exists
   - Check if `ideState` store has records

### Success Criteria

- [ ] Production site loads without error
- [ ] FileTree state persists across page reload
- [ ] Context menu works (right-click shows options)
- [ ] Terminal can run `pnpm dev` without engine error
- [ ] FileTree doesn't collapse on file edit
