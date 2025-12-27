# Sprint Change Proposal: Mobile File Access Epic

> **Date**: 2025-12-28T01:53:00+07:00  
> **Type**: Course Correction - New Epic Addition  
> **Impact**: LOW (additive, no breaking changes)  
> **Status**: APPROVED

---

## Change Summary

Adding new **Epic MFA (Mobile File Access)** to enable workspace functionality on mobile devices where File System Access API is unsupported.

**Trigger**: Research revealed WebContainers + FSA API are desktop-only. Mobile users cannot open projects.

---

## New Epic: MFA - Mobile File Access

### Stories

| ID | Title | Effort | Priority | Dependencies |
|----|-------|--------|----------|--------------|
| **MFA-1** | Demo Mode with Templates | 1-2d | P0 | None |
| **MFA-2** | Zip File Upload/Export | 2-3d | P1 | MFA-1 |
| **MFA-3** | Master File Sync | 2-3d | P2 | MFA-2 |

### Phase 1: Demo Mode (MFA-1) - IMMEDIATE

**Implementation:**
- Add template selection on mobile home page
- Pre-loaded project snapshots from server/CDN
- Clear messaging: "Full IDE requires desktop"
- Mobile-optimized read-only code viewer

**Files to Create/Modify:**
- `src/components/hub/MobileProjectSelector.tsx` [NEW]
- `src/components/hub/HubHomePage.tsx` [MODIFY]
- `public/templates/` [NEW - starter templates]

### Phase 2: Zip Upload (MFA-2) - SHORT-TERM

**Implementation:**
- `<input type="file" accept=".zip">` for project upload
- JSZip extraction → IndexedDB storage
- Export modified project as zip download
- Works offline once loaded

### Phase 3: Master File (MFA-3) - FUTURE

**Implementation:**
- Single JSON blob with all project state
- Import/export via cloud storage integration
- Cross-device project continuity

---

## Sprint Impact

| Epic | Before | After |
|------|--------|-------|
| MRT | 82% (9/11) | 82% (9/11) |
| MFA | N/A | 0% (0/3) |
| **Total** | 82% | 69% (9/14) |

---

## Decision Record

- **Approved by**: USER
- **Approach**: Option 4 (All progressive phases)
- **Immediate Priority**: MFA-1 Demo Mode
- **Rationale**: Quick win for mobile UX while building toward full offline capability

---

## Next Steps

1. ✅ Document course correction (this file)
2. [ ] Update sprint-status.yaml with MFA epic
3. [ ] Implement MFA-1 Demo Mode
4. [ ] Verify on mobile device
