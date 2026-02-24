# Story: ARCH-03-01-UPDATE - Review and Update ProjectSidebar Navigation / Review và Cập Nhật Điều Hướng Sidebar

**Story ID:** ARCH-03-01-UPDATE
**Date:** 2026-01-22
**Status:** ✅ COMPLETE - All Acceptance Criteria Met
**Priority:** P0 - UNBLOCKS ALL OTHER STORIES / **Ưu tiên cao nhất - Chặn tất cả story khác**
**Team:** Team A (same team that completed ARCH-03-00 and ARCH-03-01)
**Estimated Effort:** 1 hour / **Thời gian ước tính:** 1 giờ (review + update)
**ADR Reference:** ADR-034-AMENDMENT-001 (Platform-First Plugin Selection)

---

## Executive Summary / Tóm tắt điều hành

**English:**
Review ProjectSidebar.tsx and ProjectList.tsx for deprecated navigation patterns from the old "workspace-centric" architecture. Update all navigation to use the platform-first `/$projectId` route as specified in ADR-034-AMENDMENT-001. Add deprecation warnings for any old patterns found.

**Tiếng Việt:**
Review ProjectSidebar.tsx và ProjectList.tsx tìm các mẫu điều hướng cũ từ kiến trúc "workspace-centric" cũ. Cập nhật tất cả điều hướng dùng route platform-first `/$projectId` theo ADR-034-AMENDMENT-001. Thêm cảnh báo deprecated cho các mẫu cũ tìm thấy.

---

## Authority Documents / Tài liệu quyền

### 1. ADR-034-AMENDMENT-001
**Path:** `_bmad-output/planning-artifacts/adr/ADR-034-AMENDMENT-001-platform-first-2026-01-21.md`
**Status:** APPROVED - INTEGRATED ✅
**Critical Sections:**
- "Sidebar Navigation Pattern" (lines 287-298)
- "Integration with ARCH-03-01" (lines 277-298)
- "What ARCH-03-01 Should Do" (lines 283-286)

### 2. EPIC-ARCH-03 (Updated)
**Path:** `_bmad-output/planning-artifacts/epics/EPIC-ARCH-03-layout-ux-2026-01-21.md`
**Status:** APPROVED - ARCH-03-00 COMPLETE ✅
**Critical Sections:**
- ARCH-03-01 story specification (lines 352-430)
- Amendment 001 integration notes (lines 16-33)

### 3. Architect Handoff
**Path:** `_bmad-output/handoffs/2026-01-22/ARCH-03-00-architect-handoff.md`
**Status:** IMPLEMENTED ✅
**Critical Sections:**
- Required Fix Story summary (lines 12-18)
- Files to Review in ARCH-03-01 (lines 129-150)
- Recommended Action Plan (lines 154-169)

### 4. ADR-034 (Reference)
**Path:** `_bmad-output/planning-artifacts/adr/ADR-034-project-centric-architecture-2026-01-20.md`
**Status:** APPROVED - IN PROGRESS

---

## Problem Statement / Tuyên bố vấn đề

**English:**
During session 2026-01-21, ADR-034-AMENDMENT-001 was created which introduced a breaking change to the navigation model. The team completed ARCH-03-01 (ProjectSidebar) BEFORE this amendment was created. Therefore, the completed ARCH-03-01 code likely contains deprecated navigation patterns that must be updated to follow the new platform-first model.

**Tiếng Việt:**
Trong phiên 2026-01-21, ADR-034-AMENDMENT-001 được tạo ra, giới thiệu thay đổi lớn cho mô hình điều hướng. Team đã hoàn thành ARCH-03-01 (ProjectSidebar) TRƯỚC khi amendment này được tạo. Do đó, mã ARCH-03-01 hoàn tất có thể chứa các mẫu điều hướng cũ cần được cập nhật theo mô hình platform-first mới.

### Current Issue / Vấn đề hiện tại

| Issue (English) | Issue (Tiếng Việt) | Location |
|-----------------|---------------------|----------|
| ProjectSidebar may navigate to `/ide/$projectId` | ProjectSidebar có thể điều hướng đến `/ide/$projectId` | `src/presentation/components/sidebar/ProjectSidebar.tsx` |
| ProjectList may navigate to `/notes/$projectId` | ProjectList có thể điều hướng đến `/notes/$projectId` | `src/presentation/components/sidebar/ProjectList.tsx` |
| Conditional routing based on platform | Điều hướng có điều kiện dựa trên platform | Both files |
| Workspace tabs/mode selection UI | Tabs/chế độ chọn workspace UI | Both files |
| Layout query params in navigate() calls | Layout query params trong navigate() | Both files |

---

## Context / Ngữ cảnh

### Previous Work Completed / Công việc trước đã hoàn tất

**ARCH-03-00: Platform-First Plugin Defaults** ✅ COMPLETE (8/8 acceptance criteria met)

**Files Created:**
- `src/infrastructure/plugins/platform-defaults.ts` (103 lines)

**Files Modified:**
- `src/presentation/layouts/PluginLayoutStore.ts` (+22 lines)
- `src/routes/$projectId.tsx` (+10 lines)
- `src/routes/ide.$projectId.tsx` (+3 lines, deprecation warning)
- `src/routes/notes.$projectId.tsx` (+3 lines, deprecation warning)
- `src/presentation/layouts/PluginLayout.tsx` (removed props)

**Result:** Platform-first defaults now implemented, routes redirect without layout params.

### ADR-034-AMENDMENT-001 Key Changes / Thay đổi chính ADR-034-AMENDMENT-001

| OLD (Workspace-Centric / Tâm điểm workspace) | NEW (Platform-First / Tâm điểm platform-first) |
|---------------------------------------------|---------------------------------------------|
| User chooses "IDE mode" or "Notes mode" | Platform determines available plugins |
| `/ide/$projectId` is a separate experience | Single `/$projectId` with platform-filtered plugins |
| Mobile "can't access IDE" | Mobile simply doesn't show IDE-only plugins |
| User picks a workspace, then a project | User picks a project, platform shows available tools |

### Correct Navigation Pattern / Mẫu điều hướng đúng

```typescript
// CORRECT PATTERNS - Update to these:
// MẪU ĐÚNG - Cập nhật sang các mẫu này:

// 1. Single navigation target
const handleProjectClick = (projectId: string) => {
  // Platform defaults will handle plugin selection in route
  // Platform defaults sẽ xử lý plugin selection trong route
  navigate({ to: '/$projectId', params: { projectId } });

  // Store will initialize plugins based on platform if needed
  // Store sẽ khởi tạo plugins dựa trên platform nếu cần
  // User's customizations are preserved per project
  // Tùy chỉnh của user được lưu theo project
};
```

---

## Acceptance Criteria / Tiêu chí chấp nhận

| # | Criterion (English) | Tiêu chí (Tiếng Việt) | Status |
|---|---------------------|------------------------|--------|
| 1 | Review ProjectSidebar.tsx for deprecated navigation patterns | Review ProjectSidebar.tsx tìm các mẫu điều hướng cũ | ✅ COMPLETE |
| 2 | Review ProjectList.tsx for deprecated navigation patterns | Review ProjectList.tsx tìm các mẫu điều hướng cũ | ✅ COMPLETE |
| 3 | Update navigation to use `/$projectId` only (no workspace routes) | Cập nhật điều hướng dùng `/$projectId` (không có route workspace) | ✅ COMPLETE |
| 4 | Add deprecation warnings for any old patterns found | Thêm cảnh báo deprecated cho các mẫu cũ | ✅ COMPLETE |
| 5 | TypeScript: 0 compilation errors | TypeScript: 0 lỗi biên dịch | ✅ COMPLETE |

---

## Tasks / Nhiệm vụ

### Task 1: Review ProjectSidebar.tsx / Review ProjectSidebar.tsx
- [ ] Open `src/presentation/components/sidebar/ProjectSidebar.tsx`
- [ ] Check for `navigate({ to: '/ide/$projectId' })` calls
- [ ] Check for `navigate({ to: '/notes/$projectId' })` calls
- [ ] Check for conditional routing based on `platform.canAccessIDE`
- [ ] Check for `layout: 'ide'` or `layout: 'notes'` query params
- [ ] Check for workspace tabs/mode selection UI

### Task 2: Review ProjectList.tsx / Review ProjectList.tsx
- [ ] Open `src/presentation/components/sidebar/ProjectList.tsx`
- [ ] Check `handleProjectClick()` implementation
- [ ] Check navigation pattern used
- [ ] Check for workspace-specific logic
- [ ] Check for workspace mode UI elements

### Task 3: Update Navigation Patterns / Cập nhật mẫu điều hướng
- [ ] Replace all `/ide/$projectId` with `/$projectId`
- [ ] Replace all `/notes/$projectId` with `/$projectId`
- [ ] Remove conditional routing based on platform
- [ ] Remove workspace tabs/mode selection UI if present
- [ ] Ensure all navigation uses `navigate({ to: '/$projectId', params: { projectId } })`
- [ ] Remove `search: { layout: 'ide' }` or similar params

### Task 4: Add Deprecation Warnings / Thêm cảnh báo deprecated
- [ ] Add console.warn() for any old patterns found during review
- [ ] Document deprecated patterns in code comments
- [ ] Update component documentation to reflect new navigation pattern

### Task 5: Validate / Xác thực
- [ ] Run TypeScript check: `pnpm tsc --noEmit`
- [ ] Run grep checks for deprecated patterns
- [ ] Manual test: Click project in sidebar → navigates to `/$projectId`
- [ ] Verify no workspace routes are called

---

## Files to Review / Các file cần review

### 1. src/presentation/components/sidebar/ProjectSidebar.tsx
**What to Check / Kiểm tra:**
- Navigation calls within component / Các gọi điều hướng trong component
- Any workspace-specific routing logic / Bất kỳ logic điều hướng cụ thể workspace
- Conditional navigation based on platform / Điều hướng có điều kiện dựa trên platform
- Layout query params in navigate() calls / Layout query params trong navigate()

**Expected Change / Thay đổi mong đợi:**
- Ensure all `navigate()` calls use `to: '/$projectId'` / Đảm bảo tất cả `navigate()` dùng `to: '/$projectId'`
- Add deprecation warning if old patterns found / Thêm cảnh báo deprecated nếu tìm thấy mẫu cũ
- Remove any workspace-specific logic / Loại bỏ bất kỳ logic workspace cụ thể nào

### 2. src/presentation/components/sidebar/ProjectList.tsx
**What to Check / Kiểm tra:**
- Project click handler / Handler click project
- Navigation pattern used / Mẫu điều hướng được dùng
- Any workspace mode UI elements / Bất kỳ UI elements chế độ workspace

**Expected Change / Thay đổi mong đợi:**
- Update `handleProjectClick()` to use `to: '/$projectId'` / Cập nhật `handleProjectClick()` dùng `to: '/$projectId'`
- Add deprecation warning if old patterns found / Thêm cảnh báo deprecated nếu tìm thấy mẫu cũ
- Remove any workspace tab/mode selection UI / Loại bỏ bất kỳ UI tab/chế độ workspace nào

---

## Pattern Examples / Ví dụ mẫu

### ❌ WRONG (What to Find and Replace / Cái sai - Cần tìm và thay thế)

```typescript
// DEPRECATED PATTERNS - Check for these in ProjectSidebar and ProjectList:
// MẪU ĐÃ CŨ - Kiểm tra những cái này trong ProjectSidebar và ProjectList:

// 1. Navigation to workspace-specific routes
// Điều hướng đến routes cụ thể workspace
navigate({ to: '/ide/$projectId', params: { projectId } });
navigate({ to: '/notes/$projectId', params: { projectId } });

// 2. Conditional navigation based on platform
// Điều hướng có điều kiện dựa trên platform
if (platform.canAccessIDE) {
  navigate({ to: '/ide/$projectId' });
} else {
  navigate({ to: '/notes/$projectId' });
}

// 3. Workspace selection UI/tabs
// UI/tabs chọn workspace
<TabButton>IDE</TabButton>
<TabButton>Notes</TabButton>

// 4. Layout query params
// Layout query params
navigate({ to: '/$projectId', search: { layout: 'ide' } });
```

### ✅ CORRECT (What to Implement / Cái đúng - Cần triển khai)

```typescript
// CORRECT PATTERNS - Update to these:
// MẪU ĐÚNG - Cập nhật sang các mẫu này:

// 1. Single navigation target
// Đích điều hướng duy nhất
const handleProjectClick = (projectId: string) => {
  // Platform defaults will handle plugin selection in route
  // Platform defaults sẽ xử lý plugin selection trong route
  navigate({ to: '/$projectId', params: { projectId } });

  // Store will initialize plugins based on platform if needed
  // Store sẽ khởi tạo plugins dựa trên platform nếu cần
  // User's customizations are preserved per project
  // Tùy chỉnh của user được lưu theo project
};

// 2. No conditional routing - just navigate
// Không có điều hướng có điều kiện - chỉ điều hướng
// Platform determines what plugins to show
// Platform quyết định plugins nào sẽ hiển thị

// 3. No workspace tabs - just project list
// Không có tabs workspace - chỉ danh sách project

// 4. NO layout query params
// KHÔNG layout query params
navigate({ to: '/$projectId', params: { projectId } });
// NOT: search: { layout: 'ide' }
```

---

## Verification Commands / Lệnh xác thực

```bash
# 1. Check for deprecated navigation patterns
# Kiểm tra các mẫu điều hướng cũ
grep -rn "to: '/ide/\|to: '/notes/" src/presentation/components/sidebar/
# Expected: 0 matches (all updated) / Mong đợi: 0 kết quả (tất cả đã cập nhật)

# 2. Check for layout query params
# Kiểm tra layout query params
grep -rn "layout: 'ide'\|layout: 'notes'" src/presentation/components/sidebar/
# Expected: 0 matches (no layout params) / Mong đợi: 0 kết quả (không có layout params)

# 3. TypeScript check
# Kiểm tra TypeScript
pnpm tsc --noEmit
# Expected: 0 errors in sidebar files / Mong đợi: 0 lỗi trong file sidebar
```

---

## Success Metrics / Số liệu thành công

| Metric (English) / Số liệu (Tiếng Việt) | Target (Mục tiêu) | Before (Trước) | After (Sau) |
|--------|---------|---------|--------|
| Deprecated navigation removed / Điều hướng cũ đã loại bỏ | Yes | Unknown / Chưa biết | Yes |
| Correct navigation pattern used / Mẫu điều hướng đúng được dùng | Yes | No | Yes |
| Deprecation warnings added / Cảnh báo deprecated đã thêm | As needed / Cần thiết | No | Yes |
| TypeScript errors / Lỗi TypeScript | 0 | - | 0 |

---

## Dependencies / Phụ thuộc

**None / Không có**

ARCH-03-00 is complete, so platform defaults file exists and routes are updated. The only remaining work is to update sidebar navigation to follow the new platform-first pattern.

ARCH-03-00 đã hoàn tất, nên file platform defaults tồn tại và routes đã cập nhật. Công việc còn lại duy nhất là cập nhật điều hướng sidebar để theo pattern platform-first mới.

---

## Risk Mitigation / Giảm thiểu rủi ro

| Risk (English) | Rủi ro (Tiếng Việt) | Mitigation (English) | Giảm thiểu (Tiếng Việt) |
|-----------------|----------------------|---------------------|------------------------|
| Breaking navigation changes | Thay đổi điều hướng gây lỗi | Test navigation manually after update | Kiểm tra điều hướng thủ công sau khi cập nhật |
| Missing deprecation warnings | Thiếu cảnh báo deprecated | Add console.warn for old patterns found | Thêm console.warn cho các mẫu cũ tìm thấy |
| TypeScript errors | Lỗi TypeScript | Fix all TS errors before marking complete | Sửa tất cả lỗi TS trước khi đánh dấu hoàn tất |

---

## Time Box / Khung thời gian

**1 hour / 1 giờ**

- Review files: 15 minutes / Review file: 15 phút
- Identify patterns: 10 minutes / Nhận diện mẫu: 10 phút
- Update navigation: 20 minutes / Cập nhật điều hướng: 20 phút
- Add warnings: 5 minutes / Thêm cảnh báo: 5 phút
- Validate: 10 minutes / Xác thực: 10 phút

---

## Handoff Artifacts / Artifacts bàn giao

### Completion Report / Báo cáo hoàn tất
**Location:** `_bmad-output/sprint-artifacts/stories/EPIC-ARCH-03/ARCH-03-01-UPDATE-completion.md`
**Content:**
- Summary of changes / Tóm tắt thay đổi
- Before/after comparison / So sánh trước/sau
- TypeScript validation results / Kết quả xác thực TypeScript
- Verification command outputs / Đầu ra lệnh xác thực

### Code Review Checklist / Checklist review code
- [ ] Navigation follows ADR-034-AMENDMENT-001 / Điều hướng theo ADR-034-AMENDMENT-001
- [ ] No deprecated patterns remaining / Không còn mẫu cũ nào
- [ ] TypeScript: 0 errors / TypeScript: 0 lỗi
- [ ] Deprecation warnings added / Cảnh báo deprecated đã thêm
- [ ] Manual test passed / Kiểm tra thủ công passed

---

## Next Steps / Các bước tiếp theo

**WAIT for Orchestrator authorization before starting ARCH-03-02**

After ARCH-03-01-UPDATE completes:
- ✅ ProjectSidebar navigation reviewed and updated / Review và cập nhật điều hướng Sidebar
- ✅ 5/5 acceptance criteria met / Đạt 5/5 tiêu chí
- ✅ 0 TypeScript errors / 0 lỗi TypeScript
- ✅ No deprecated navigation patterns / Không còn mẫu điều hướng cũ
- ✅ All navigation uses `/$projectId` / Tất cả điều hướng dùng `/$projectId`
- ✅ **Ready for ARCH-03-02 authorization** / **Sẵn sàng để phê duyệt ARCH-03-02**

---

## Completion / Hoàn tất

**Completed:** 2026-01-22 19:16
**Time Taken:** 35 minutes (within 1-hour timebox)
**Completion Report:** `_bmad-output/sprint-artifacts/stories/EPIC-ARCH-03/ARCH-03-01-UPDATE-completion.md`

**Summary of Findings:**
- ✅ No deprecated navigation patterns found in existing code
- ✅ Components already using correct platform-first pattern
- ✅ Minor TypeScript cleanup performed (removed unused imports/variables)
- ✅ Documentation comments added confirming ADR-034-AMENDMENT-001 compliance

## Approval / Phê duyệt

- [x] Sprint Manager - 2026-01-22
- [ ] Dev Team Lead - Date: ________
- [ ] Orchestrator - Date: ________ (Required before next story)

---

**END OF STORY FILE**
