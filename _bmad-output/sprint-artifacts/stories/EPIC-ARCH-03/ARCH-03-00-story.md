# ARCH-03-00 Story File

**Story ID:** ARCH-03-00
**Epic:** EPIC-ARCH-03 - Layout System & UX
**Created:** 2026-01-22T08:30+07:00
**Updated:** 2026-01-22T08:30+07:00
**Status:** PENDING
**Priority:** P0 - BLOCKING
**Team:** Team A
**Estimated Effort:** 2 hours

---

## 📋 Story Information / Thông tin Story

### Title (English) / Tiêu đề (Tiếng Việt)
**English:** Platform-First Plugin Defaults
**Tiếng Việt:** Mặc định Plugin dựa trên nền tảng

### Dependencies / Phụ thuộc
None (FIX-03 and FIX-04 complete, ARCH-03-01 code review ready)

### Blocks / Chặn
- ARCH-03-01-UPDATE (navigation logic cannot be finalized)
- ARCH-03-02 (mobile layouts depend on correct initialization)
- ARCH-03-03 (layout presets depend on correct defaults)
- ARCH-03-06 (root integration depends on correct navigation)

---

## 🎯 Description / Mô tả

### English
Eliminate "IDE mode" vs "Notes mode" distinction. Platform determines available plugins automatically. This replaces the workspace-centric navigation model with a platform-first approach where:
- Desktop with FSA gets full development experience (FileTree + Monaco + Chat)
- Desktop with IndexedDB gets notes-focused experience (FileTree + Notes + Chat)
- Tablet gets simplified 2-column layout (FileTree + Notes + Chat)
- Mobile gets single-column layout (Notes only, chat accessible via sidebar)
- User can customize which plugins are shown, but platform determines availability

This is a BREAKING CHANGE that requires updating navigation patterns and removing layout query params.

### Tiếng Việt
Loại bỏ sự phân biệt giữa "IDE mode" và "Notes mode". Nền tảng tự động xác định các plugin có sẵn. Điều này thay thế mô hình điều hướng dựa trên workspace bằng phương pháp ưu tiên nền tảng trong đó:
- Desktop với FSA nhận trải nghiệm phát triển đầy đủ (FileTree + Monaco + Chat)
- Desktop với IndexedDB nhận trải nghiệm tập trung ghi chú (FileTree + Notes + Chat)
- Tablet nhận bố cục đơn giản hóa 2 cột (FileTree + Notes + Chat)
- Mobile nhận bố cục một cột (chỉ Notes, chat có thể truy cập qua sidebar)
- Người dùng có thể tùy chỉnh plugin nào được hiển thị, nhưng nền tảng xác định tính sẵn sàng

Đây là THAY ĐỔI PHÁ VỠ yêu cầu cập nhật mẫu điều hướng và xóa tham số truy vấn layout.

---

## 📊 User Story / Câu chuyện người dùng

### English
**As a** user on any platform (desktop, tablet, mobile),
**I want** the application to automatically show the appropriate plugins for my device,
**So that** I don't need to understand technical concepts like "IDE mode" vs "Notes mode" and can just start working with my project.

### Tiếng Việt
**Với tư cách là** người dùng trên bất kỳ nền tảng nào (desktop, tablet, mobile),
**Tôi muốn** ứng dụng tự động hiển thị các plugin phù hợp cho thiết bị của mình,
**Để rằng** tôi không cần hiểu các khái niệm kỹ thuật như "IDE mode" và "Notes mode" và có thể bắt đầu làm việc với dự án của mình ngay.

---

## ✅ Acceptance Criteria / Tiêu chí chấp nhận

| # | Criterion (English) | Tiêu chí (Tiếng Việt) | Validation | Status |
|---|---------------------|------------------------|-----------|--------|
| 1 | Create `src/infrastructure/plugins/platform-defaults.ts` | Tạo file `platform-defaults.ts` | File exists with both functions | [ ] |
| 2 | Implement `getDefaultPlugins(platform, project): PluginId[]` | Thực hiện hàm `getDefaultPlugins` | Returns correct plugins per platform | [ ] |
| 3 | Implement `getDefaultLayoutMode(platform): LayoutMode` | Thực hiện hàm `getDefaultLayoutMode` | Returns correct mode per platform | [ ] |
| 4 | Update `src/routes/$projectId.tsx` to use platform defaults | Cập nhật route `/$projectId` dùng platform defaults | No LayoutPreset type, uses getDefaultPlugins | [ ] |
| 5 | Update `src/routes/ide.$projectId.tsx` redirect (no layout param) | Cập nhật redirect route (không có layout param) | Redirects to `/$projectId` without search params | [ ] |
| 6 | Update `src/routes/notes.$projectId.tsx` redirect (no layout param) | Cập nhật redirect route (không có layout param) | Redirects to `/$projectId` without search params | [ ] |
| 7 | Update `src/presentation/layouts/PluginLayout.tsx` to remove props | Cập nhật PluginLayout để xóa props | Empty interface, no initial plugins | [ ] |
| 8 | TypeScript: 0 compilation errors | TypeScript: 0 lỗi biên dịch | `pnpm tsc --noEmit` returns 0 | [ ] |

---

## 📁 Files to Create / Tệp tin cần tạo

### New File / Tệp tin mới
```
src/infrastructure/plugins/platform-defaults.ts
```

**Purpose / Mục đích:** Implement platform-first default plugins and layout modes

**Content Pattern / Mẫu nội dung:**
```typescript
import type { PluginId } from '@/domain/types/plugin-types';
import type { PlatformContract } from '@/infrastructure/filesystem/platform-detection';
import type { Project } from '@/domain/entities/project';

/**
 * Get default plugins based on platform and project
 * / Lấy các plugin mặc định dựa trên nền tảng và dự án
 *
 * This replaces "ide mode" vs "notes mode" concept.
 * Platform determines what's AVAILABLE, not what "mode" you're in.
 * Nó thay thế khái niệm "IDE mode" và "Notes mode".
 * Nền tảng quyết định những gì có sẵn, không phải "mode" bạn đang ở.
 */
export function getDefaultPlugins(
  platform: PlatformContract,
  project: Project
): PluginId[] {
  // Desktop with FSA: Full development experience
  if (platform.deviceType === 'desktop' && project.storageType === 'fsa') {
    return ['filetree', 'monaco', 'chat'];
  }

  // Desktop with IndexedDB: Notes-focused (no real files)
  if (platform.deviceType === 'desktop' && project.storageType === 'indexeddb') {
    return ['filetree', 'notes', 'chat'];
  }

  // Tablet: Notes-focused (no terminal)
  if (platform.deviceType === 'tablet') {
    return ['filetree', 'notes', 'chat'];
  }

  // Mobile: Minimal (single plugin at a time)
  if (platform.deviceType === 'mobile') {
    return ['notes'];  // Just notes, chat accessible via sidebar
  }

  // Fallback
  return ['notes', 'chat'];
}

/**
 * Get default layout mode based on platform
 * / Lấy chế độ layout mặc định dựa trên nền tảng
 */
export function getDefaultLayoutMode(
  platform: PlatformContract
): '1-column' | '2-column' | '3-column' | '2+1' {
  if (platform.deviceType === 'mobile') {
    return '1-column';  // Always single panel on mobile
  }

  if (platform.deviceType === 'tablet') {
    return '2-column';  // Max 2 panels on tablet
  }

  // Desktop: 2-column default, user can change
  return '2-column';
}
```

---

## 📝 Files to Modify / Tệp tin cần sửa

### 1. src/routes/$projectId.tsx
**Changes Required / Thay đổi cần thiết:**
- [ ] Remove `LayoutPreset` type
- [ ] Remove `PLUGIN_PRESETS` constant
- [ ] Remove `LAYOUT_MODE_PRESETS` constant
- [ ] Import `getDefaultPlugins` and `getDefaultLayoutMode` from platform-defaults
- [ ] Remove `initialPlugins` and `initialLayoutMode` props from `<PluginLayout>`
- [ ] Call `getDefaultPlugins()` when `activePlugins.length === 0`
- [ ] Add `getPlatformContract()` call to detect platform

### 2. src/routes/ide.$projectId.tsx
**Changes Required / Thay đổi cần thiết:**
- [ ] Change redirect from `{ to: '/$projectId', search: { layout: 'ide' } }`
- [ ] To: `{ to: '/$projectId', params: { projectId } }` (NO search params)
- [ ] Add console.warn deprecation message

**Pattern / Mẫu:**
```typescript
beforeLoad: async ({ params }) => {
  const { projectId } = params;

  console.warn(
    '[DEPRECATED] /ide/$projectId route is deprecated. ' +
    'Use /$projectId instead. Platform detection handles plugin availability.'
  );

  throw redirect({
    to: '/$projectId',
    params: { projectId },
    // NO search params - let platform decide
  });
},
```

### 3. src/routes/notes.$projectId.tsx
**Changes Required / Thay đổi cần thiết:**
- [ ] Same changes as ide.$projectId.tsx
- [ ] Change redirect from `{ to: '/$projectId', search: { layout: 'notes' } }`
- [ ] To: `{ to: '/$projectId', params: { projectId } }` (NO search params)
- [ ] Add console.warn deprecation message

### 4. src/presentation/layouts/PluginLayout.tsx
**Changes Required / Thay đổi cần thiết:**
- [ ] Remove `initialPlugins` prop
- [ ] Remove `initialLayoutMode` prop
- [ ] Result: Empty interface or no props at all

**Pattern / Mẫu:**
```typescript
// BEFORE (WRONG)
interface PluginLayoutProps {
  initialPlugins?: PluginId[];
  initialLayoutMode?: LayoutMode;
}

// AFTER (CORRECT)
interface PluginLayoutProps {
  // No props - reads from store
  // Store is initialized by route based on platform
}
```

---

## 🏗️ Implementation Details / Chi tiết thực hiện

### Step 1: Create platform-defaults.ts
**File location:** `src/infrastructure/plugins/platform-defaults.ts`
**Content:** See "Files to Create" section above
**Validation:** File exists and exports both functions

### Step 2: Update $projectId.tsx Route
**Pattern:**
```typescript
// BEFORE (WRONG)
type LayoutPreset = 'ide' | 'notes' | 'custom';
const PLUGIN_PRESETS: Record<LayoutPreset, PluginId[]> = {
  ide: ['filetree', 'monaco', 'terminal', 'chat'],
  notes: ['filetree', 'notes', 'chat'],
  custom: [],
};

// AFTER (CORRECT)
import { getDefaultPlugins, getDefaultLayoutMode } from '@/infrastructure/plugins/platform-defaults';
import { getPlatformContract } from '@/infrastructure/filesystem/platform-detection';

function UnifiedProjectRoute() {
  const { projectId } = Route.useParams();
  const { project } = Route.useLoaderData();
  const platform = getPlatformContract();

  // Initialize layout store with platform-appropriate defaults
  const layoutStore = usePluginLayoutStore();

  useEffect(() => {
    // Only set defaults if user hasn't customized
    if (layoutStore.activePlugins.length === 0) {
      const defaultPlugins = getDefaultPlugins(platform, project);
      const defaultMode = getDefaultLayoutMode(platform);
      layoutStore.initializeDefaults(defaultPlugins, defaultMode);
    }
  }, [project.id]);

  return (
    <ProjectContextProvider projectId={projectId}>
      <PluginLayout />  {/* No props - reads from store */}
    </ProjectContextProvider>
  );
}
```

### Step 3: Update Old Routes (Add Deprecation)
**Files:** `ide.$projectId.tsx`, `notes.$projectId.tsx`
**Pattern:** See "Files to Modify" section above

### Step 4: Update PluginLayout.tsx
**Pattern:** See "Files to Modify" section above

---

## 🚨 Critical Dependencies / Phụ thuộc quan trọng

1. **Platform Detection** - Must use `getPlatformContract()` from infrastructure
2. **TanStack Router** - Must use `navigate()` from `@tanstack/react-router` (NO window.location.href)
3. **Project Types** - Must use correct Project entity type
4. **Plugin Types** - Must use correct PluginId type

---

## 🔍 Verification Commands / Lệnh xác minh

### After Implementation / Sau khi thực hiện

```bash
# 1. Should return 0 matches (no layout params in routes)
grep -rn "layout.*ide\|layout.*notes" src/routes/
# Expected: 0 matches (except deprecation comments)

# 2. Verify unified navigation
grep -rn "to: '/ide/\|to: '/notes/" src/
# Expected: 0 matches (all updated to use /$projectId)

# 3. Verify new platform defaults file exists
ls src/infrastructure/plugins/platform-defaults.ts
# Expected: File exists

# 4. TypeScript check
pnpm tsc --noEmit
# Expected: 0 errors (related to this change)
```

### Manual Testing / Kiểm thử thủ công

1. **Desktop FSA:** Open project → sees FileTree + Monaco + Chat
2. **Desktop IndexedDB:** Open project → sees FileTree + Notes + Chat
3. **Tablet:** Open project → sees 2-column layout
4. **Mobile:** Open project → sees 1-column layout with Notes
5. **Old route:** Navigate to `/ide/$projectId` → redirects to `/$projectId` (no errors)
6. **Console:** Check for deprecation warnings

---

## 📊 Success Metrics / Số liệu thành công

| Metric (English) / Số liệu (Tiếng Việt) | Target (Mục tiêu) | Before (Trước) | After (Sau) |
|--------|---------|---------|--------|
| Platform defaults file exists | Yes | No | Yes |
| getDefaultPlugins implemented | Yes | No | Yes |
| getDefaultLayoutMode implemented | Yes | No | Yes |
| /$projectId uses platform defaults | Yes | No | Yes |
| Old routes redirect correctly | Yes | No | Yes |
| LayoutPreset type removed | Yes | No | Yes |
| PluginLayout props removed | Yes | No | Yes |
| TypeScript errors | 0 | - | 0 |

---

## 🎯 Gatekeeping Checkpoints / Điểm kiểm soát

### Before Implementation / Trước khi thực hiện (STEPS 1-4)
- [ ] ADR-034-AMENDMENT-001 loaded
- [ ] EPIC-ARCH-03 (with ARCH-03-00) loaded
- [ ] Architect handoff loaded
- [ ] Story file created (this file)
- [ ] Story file validated as 100% complete
- [ ] Context file created (next step)
- [ ] Context file validated as 100% complete (next step)

### During Implementation / Trong khi thực hiện (STEP 5-6)
- [ ] Delegate to dev-ext with tool permissions
- [ ] Monitor dev-ext progress (check every 5-10 min)
- [ ] Log any blockers or issues

### After Implementation / Sau khi thực hiện (STEPS 7-9)
- [ ] Code review (check ADR-034-001 compliance)
- [ ] Run TypeScript validation (0 errors)
- [ ] Run build validation (success)
- [ ] Create completion report (dual language)
- [ ] WAIT for Orchestrator authorization

---

## 🚨 Stop Conditions / Điều kiện dừng

**STOP and report to Orchestrator if / DỪNG và báo cáo cho Orchestrator nếu:**
1. TypeScript errors > 5 in platform-defaults or route files
2. Breaking changes introduced (routes no longer work)
3. ADR-034-001 violations detected
4. > 2x estimated time (2 hours) without progress
5. dev-ext blocked > 30 minutes without resolution

---

## 📚 Authority Documents / Tài liệu quyền

- ✅ ADR-034-AMENDMENT-001 (Platform-First Plugin Selection)
- ✅ ADR-034 (Project-Centric Architecture)
- ✅ EPIC-ARCH-03 (Layout System & UX)
- ✅ Architect Handoff: ARCH-03-00
- ✅ AGENTS.md (Governance rules)
- ✅ ADR-033 (Architecture Decisions)

---

## 🎯 Success Definition / Định nghĩa thành công

**ARCH-03-00 is COMPLETE when / ARCH-03-00 HOÀN THÀNH KHI:**
- ✅ All 8 acceptance criteria met (100%)
- ✅ 0 TypeScript errors
- ✅ Application builds successfully
- ✅ Old routes redirect without layout params
- ✅ /$projectId uses platform defaults
- ✅ No ADR-034-001 violations
- ✅ Completion report created (dual language)
- ✅ Ready for Orchestrator authorization before ARCH-03-01-UPDATE

---

## 📅 Timeline / Lịch trình

| Phase | Duration | Description |
|-------|----------|-------------|
| Story Creation | 15 min | Create and validate story file |
| Context Creation | 15 min | Create and validate context file |
| Delegation | 5 min | Delegate to dev-ext with permissions |
| Implementation | 1.5-2 hours | dev-ext implementation |
| Code Review | 15 min | Review compliance |
| Validation | 10 min | TypeScript check, build |
| Reporting | 10 min | Create completion report |
| **Total** | **2-2.5 hours** | **With Orchestrator review** |

---

## 📋 Story Status / Trạng thái Story

**Current Status:** PENDING
**Team:** Team A
**Started:** Not started
**Completed:** Not completed

---

## 📝 Notes / Ghi chú

- This is a BLOCKING story for EPIC-ARCH-03
- ARCH-03-01 navigation logic cannot be finalized until this is complete
- Follow ADR-034-001 strictly - no "IDE mode" or "Notes mode" concepts
- Use dual language (English + Vietnamese) in all artifacts
- Wait for Orchestrator authorization before starting ARCH-03-01-UPDATE

---

## 🎯 Next Steps / Các bước tiếp theo

1. ✅ Create story file (this file) - DONE
2. ⏳ Validate story file (100% complete) - NEXT
3. ⏳ Create context file
4. ⏳ Validate context file (100% complete)
5. ⏳ Delegate to dev-ext with tool permissions
6. ⏳ Monitor dev-ext progress
7. ⏳ Code review (check compliance)
8. ⏳ Validation checklist (TypeScript: 0 errors)
9. ⏳ Report completion and WAIT for Orchestrator authorization

---

**END OF STORY FILE**
