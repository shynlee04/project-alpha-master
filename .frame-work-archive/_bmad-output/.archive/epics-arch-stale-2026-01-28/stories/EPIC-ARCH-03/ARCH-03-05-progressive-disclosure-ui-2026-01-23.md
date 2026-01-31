# ARCH-03-05: Progressive Disclosure UI

**Story ID:** ARCH-03-05
**Epic:** EPIC-ARCH-03 (Layout System & UX)
**Team:** Team A
**Priority:** P2 - Low
**Estimated Effort:** 2 hours
**Status:** IN PROGRESS
**Created:** 2026-01-23
**Start Time:** [To be filled by dev-ext]

---

## 📋 Summary

Implement progressive disclosure UI for first-time users. Simple default layout with advanced options hidden behind a toggle, tooltip hints on first load, and user preferences persisted to localStorage.

**English:**
This story creates a simple onboarding experience for first-time users by:
- Showing a clean 2-column "Notes Mode" layout by default
- Providing non-prominent "Add Plugin" button
- Hiding advanced 3-column and 2+1 layouts behind "More layouts" toggle
- Showing dismissible tooltip hints on first load
- Adding "Show advanced features" toggle in Settings
- Persisting user preferences to localStorage

**Tiếng Việt:**
Story này tạo trải nghiệm onboarding đơn giản cho người dùng lần đầu bằng cách:
- Hiển thị layout "Notes Mode" 2 cột sạch sẽ mặc định
- Cung cấp nút "Add Plugin" không nổi bật
- Ẩn các layout nâng cao 3 cột và 2+1 sau toggle "More layouts"
- Hiển thị tooltip có thể loại bỏ khi tải lần đầu
- Thêm toggle "Show advanced features" trong Cài đặt
- Lưu tùy chọn người dùng vào localStorage

---

## 🎯 Acceptance Criteria (7 items)

| # | Criterion (English) | Tiêu chí (Tiếng Việt) | Status |
|---|---------------------|------------------------|--------|
| 1 | Simple default layout for first-time users - Show 2-column layout (Notes Mode preset) by default | Layout mặc định đơn giản cho người dùng lần đầu - Hiển thị layout 2 cột (preset Notes Mode) mặc định | ⬜ PENDING |
| 2 | "Add Plugin" button visible but not prominent - Simple button in header, not highlighted | Nút "Add Plugin" hiển thị nhưng không nổi bật - Nút đơn giản trong header, không nổi bật | ⬜ PENDING |
| 3 | Advanced options (3-column, 2+1) behind "More layouts" toggle - Collapsible section for advanced layouts | Tùy chọn nâng cao (3 cột, 2+1) sau toggle "More layouts" - Phần thu gọn cho layout nâng cao | ⬜ PENDING |
| 4 | Tooltip hints on first load (dismissible) - Show on first visit, can be dismissed | Gợi ý tooltip khi tải lần đầu (có thể loại bỏ) - Hiển thị khi truy cập lần đầu, có thể đóng | ⬜ PENDING |
| 5 | "Show advanced features" toggle in Settings - Checkbox in settings to enable advanced layouts | Toggle "Show advanced features" trong Cài đặt - Checkbox trong cài đặt để kích hoạt layout nâng cao | ⬜ PENDING |
| 6 | Preferences stored in localStorage - Persist user's advanced features preference | Tùy chọn lưu trữ trong localStorage - Lưu tùy chọn tính năng nâng cao của người dùng | ⬜ PENDING |
| 7 | TypeScript: 0 compilation errors | TypeScript: 0 lỗi biên dịch | ⬜ PENDING |

---

## 📁 Files to Create (2 files)

### 1. User Preferences Store

**File Path:** `src/infrastructure/persistence/stores/user-preferences-store.ts`

**Purpose:** Zustand v5 store for user preferences and advanced feature flags

**Expected Content (~180 lines):**

```typescript
/**
 * User Preferences Store
 *
 * Stores user-level preferences for progressive disclosure features.
 * Persisted to localStorage via Zustand persist middleware.
 *
 * English:
 * - showAdvancedLayouts: Controls visibility of advanced layout options (3-column, 2+1)
 * - hasSeenOnboarding: Tracks if user has seen onboarding tooltips
 * - defaultPresetId: User's preferred default preset
 *
 * Tiếng Việt:
 * - showAdvancedLayouts: Kiểm soát hiển thị tùy chọn layout nâng cao (3 cột, 2+1)
 * - hasSeenOnboarding: Theo dõi xem người dùng đã xem tooltip onboarding chưa
 * - defaultPresetId: Preset mặc định ưu tiên của người dùng
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const PREFERENCES_STORAGE_KEY = 'via-gent-user-preferences';

/**
 * User preferences state interface
 * Interface trạng thái tùy chọn người dùng
 */
interface UserPreferencesState {
  // State / Trạng thái
  showAdvancedLayouts: boolean;  // Show/hide advanced layout options / Hiển thị/ẩn tùy chọn layout nâng cao
  hasSeenOnboarding: boolean;     // Onboarding completed flag / Flag onboarding hoàn tất
  defaultPresetId: string | null; // User's preferred preset / Preset ưu tiên của người dùng

  // Actions / Hành động
  toggleAdvancedLayouts: () => void;                      // Toggle advanced visibility / Chuyển đổi hiển thị nâng cao
  setShowAdvancedLayouts: (show: boolean) => void;         // Set advanced visibility explicitly / Đặt hiển thị nâng cao rõ ràng
  markOnboardingComplete: () => void;                      // Mark onboarding as complete / Đánh dấu onboarding đã hoàn tất
  resetOnboarding: () => void;                             // Reset onboarding (for testing) / Đặt lại onboarding (để kiểm thử)
  setDefaultPreset: (presetId: string) => void;          // Set default preset / Đặt preset mặc định
}

/**
 * User Preferences Store
 * Store Tùy Chọn Người Dùng
 */
export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set) => ({
      // Initial State / Trạng thái khởi đầu
      showAdvancedLayouts: false,    // Start simple (first-time user experience) / Bắt đầu đơn giản (trải nghiệm người dùng lần đầu)
      hasSeenOnboarding: false,     // Hasn't seen tooltips yet / Chưa thấy tooltip
      defaultPresetId: null,        // No preset selected yet / Chưa chọn preset

      // Actions / Hành động
      toggleAdvancedLayouts: () => {
        set((state) => ({
          showAdvancedLayouts: !state.showAdvancedLayouts,
        }));
      },

      setShowAdvancedLayouts: (show) => {
        set({ showAdvancedLayouts: show });
      },

      markOnboardingComplete: () => {
        set({ hasSeenOnboarding: true });
      },

      resetOnboarding: () => {
        set({ hasSeenOnboarding: false });
      },

      setDefaultPreset: (presetId) => {
        set({ defaultPresetId: presetId });
      },
    }),
    {
      name: PREFERENCES_STORAGE_KEY,
      version: 1,
    }
  )
);

// Convenience hooks / Hooks tiện lợi
export function useAdvancedLayouts() {
  return useUserPreferencesStore((state) => ({
    showAdvanced: state.showAdvancedLayouts,
    toggle: state.toggleAdvancedLayouts,
    setShow: state.setShowAdvancedLayouts,
  }));
}

export function useOnboarding() {
  return useUserPreferencesStore((state) => ({
    hasSeenOnboarding: state.hasSeenOnboarding,
    markComplete: state.markOnboardingComplete,
    reset: state.resetOnboarding,
  }));
}

export function useDefaultPreset() {
  return useUserPreferencesStore((state) => ({
    presetId: state.defaultPresetId,
    setPreset: state.setDefaultPreset,
  }));
}
```

---

### 2. Layout Onboarding Component

**File Path:** `src/presentation/components/onboarding/LayoutOnboarding.tsx`

**Purpose:** First-time user tooltips and hints for layout features

**Expected Content (~250 lines):**

```typescript
/**
 * Layout Onboarding Component
 *
 * Provides dismissible tooltip hints for first-time users.
 * Shows progressive hints about layout features.
 *
 * English:
 * - Shows hints on first load (if hasSeenOnboarding is false)
 * - Hints shown progressively (one at a time)
 * - User can dismiss individual hints or all hints
 * - Persists completion state via user preferences store
 *
 * Tiếng Việt:
 * - Hiển thị gợi ý khi tải lần đầu (nếu hasSeenOnboarding là false)
 * - Gợi ý hiển thị theo trình tự (một lần một)
 * - Người dùng có thể loại bỏ gợi ý riêng hoặc tất cả
 * - Lưu trạng thái hoàn tất qua store tùy chọn người dùng
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Info } from 'lucide-react';

import { useUserPreferencesStore } from '@/infrastructure/persistence/stores/user-preferences-store';

interface LayoutOnboardingProps {
  // No props needed - auto-activates based on preferences
  // Không cần props - tự kích hoạt dựa trên tùy chọn
}

export function LayoutOnboarding({}: LayoutOnboardingProps) {
  const { t } = useTranslation();
  const { hasSeenOnboarding, markOnboardingComplete } = useUserPreferencesStore();

  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [showHints, setShowHints] = useState(false);

  const hints = [
    {
      id: 'drag-plugins',
      icon: <Info size={16} />,
      title: t('layoutOnboarding.hints.drag.title'),
      message: t('layoutOnboarding.hints.drag.message'),
    },
    {
      id: 'add-plugin',
      icon: <Info size={16} />,
      title: t('layoutOnboarding.hints.add.title'),
      message: t('layoutOnboarding.hints.add.message'),
    },
    {
      id: 'save-layout',
      icon: <Info size={16} />,
      title: t('layoutOnboarding.hints.save.title'),
      message: t('layoutOnboarding.hints.save.message'),
    },
    {
      id: 'advanced-layouts',
      icon: <Info size={16} />,
      title: t('layoutOnboarding.hints.advanced.title'),
      message: t('layoutOnboarding.hints.advanced.message'),
    },
  ];

  // Show hints on first load only / Chỉ hiển thị gợi ý khi tải lần đầu
  useEffect(() => {
    if (!hasSeenOnboarding) {
      // Small delay to let UI settle first
      // Độ trễ nhỏ để UI ổn định trước
      const timer = setTimeout(() => {
        setShowHints(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenOnboarding]);

  const handleDismiss = () => {
    markOnboardingComplete();
    setShowHints(false);
  };

  const handleNext = () => {
    if (currentHintIndex < hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    } else {
      handleDismiss();
    }
  };

  const handleSkip = () => {
    handleDismiss();
  };

  // Don't render if user has already seen onboarding
  // Không hiển thị nếu người dùng đã xem onboarding
  if (!showHints || hasSeenOnboarding) {
    return null;
  }

  const currentHint = hints[currentHintIndex];

  return (
    <div className="layout-onboarding-container fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="onboarding-tooltip border-2 border-black bg-white shadow-4 p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Hint Content / Nội dung gợi ý */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-blue-600">{currentHint.icon}</div>
              <h3 className="font-bold text-sm">{currentHint.title}</h3>
            </div>
            <p className="text-sm text-gray-700">{currentHint.message}</p>
          </div>

          {/* Close Button / Nút đóng */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-500 hover:text-black transition-colors"
            aria-label={t('layoutOnboarding.close')}
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress Indicator / Chỉ số tiến trình */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t-2 border-gray-200">
          <div className="text-xs text-gray-500">
            {t('layoutOnboarding.progress', {
              current: currentHintIndex + 1,
              total: hints.length,
            })}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSkip}
              className="text-xs text-gray-600 hover:text-black transition-colors px-2 py-1"
            >
              {t('layoutOnboarding.skip')}
            </button>
            <button
              onClick={handleNext}
              className="text-xs bg-blue-600 text-white hover:bg-blue-700 transition-colors px-3 py-1 border-2 border-black"
            >
              {currentHintIndex < hints.length - 1
                ? t('layoutOnboarding.next')
                : t('layoutOnboarding.gotIt')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🏗️ Implementation Pattern

### User Preferences Store Pattern

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const PREFERENCES_STORAGE_KEY = 'user-preferences';

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set) => ({
      showAdvancedLayouts: false,
      hasSeenOnboarding: false,
      defaultPresetId: null,

      toggleAdvancedLayouts: (state) => ({
        showAdvancedLayouts: !state.showAdvancedLayouts,
      }),

      markOnboardingComplete: () => {
        set({ hasSeenOnboarding: true });
      },

      setDefaultPreset: (presetId) => {
        set({ defaultPresetId: presetId });
      },
    }),
    {
      name: 'UserPreferences',
      storage: localStorage,
    }
  )
);
```

### LayoutOnboarding Integration

```typescript
// In PluginLayout.tsx or AppLayout.tsx
import { useEffect } from 'react';
import { LayoutPresetPicker } from '@/presentation/components/ui/LayoutPresetPicker';
import { LayoutOnboarding } from '@/presentation/components/onboarding/LayoutOnboarding';
import { useUserPreferencesStore } from '@/infrastructure/persistence/stores/user-preferences-store';

export function PluginLayout() {
  const { showAdvancedLayouts, toggleAdvancedLayouts } = useUserPreferencesStore();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Show onboarding only on first visit
    // Chỉ hiển thị onboarding khi truy cập lần đầu
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, [hasSeenOnboarding]);

  return (
    <div>
      {/* Onboarding Hints - First Time Only / Gợi ý Onboarding - Chỉ Lần Đầu */}
      {showOnboarding && <LayoutOnboarding />}

      {/* Layout Preset Picker / Trình Chọn Preset Layout */}
      {showAdvancedLayouts && (
        <LayoutPresetPicker showAdvanced={true} />  {/* Advanced layouts unlocked / Layout nâng cao được mở khóa */}
      )}

      {/* Simple preset picker for first-time users / Trình chọn preset đơn giản cho người dùng lần đầu */}
      {!showAdvancedLayouts && (
        <LayoutPresetPicker showAdvanced={false} />
      )}

      {/* "More Layouts" Toggle / Toggle "More Layouts" */}
      <button onClick={toggleAdvancedLayouts}>
        {showAdvancedLayouts
          ? t('layoutPresets.hideAdvanced')
          : t('layoutPresets.showAdvanced')}
      </button>
    </div>
  );
}
```

### Settings Integration

```typescript
// In Settings component (existing or new)
import { useUserPreferencesStore } from '@/infrastructure/persistence/stores/user-preferences-store';

export function SettingsPanel() {
  const { showAdvancedLayouts, setShowAdvancedLayouts } = useUserPreferencesStore();

  return (
    <div className="settings-section">
      <h2>{t('settings.advancedFeatures.title')}</h2>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={showAdvancedLayouts}
          onChange={(e) => setShowAdvancedLayouts(e.target.checked)}
        />
        <span>{t('settings.advancedFeatures.showAdvancedLayouts')}</span>
      </label>
      <p className="text-sm text-gray-600">
        {t('settings.advancedFeatures.description')}
      </p>
    </div>
  );
}
```

---

## 📊 Success Metrics

| Metric | Target | Before | After |
|--------|---------|---------|--------|
| User preferences store | Yes | No | Yes |
| Onboarding component | Yes | No | Yes |
| Show advanced layouts toggle | Yes | No | Yes |
| Simple default layout | Yes | No | Yes |
| Add Plugin button visible | Yes | No | Yes |
| Tooltip hints on first load | Yes | No | Yes |
| Preferences persist | Yes | No | Yes |
| Acceptance criteria | 7/7 | 0/7 | 7/7 |
| TypeScript errors | 0 | - | 0 |

---

## 🎯 Gatekeeping Checkpoints

### Before Implementation (STEPS 1-4)
- [x] Load ADR-034 and EPIC-ARCH-03
- [x] Load ALL previous completion evidence (ARCH-03-00, 01, 01-UPDATE, 02, 03, 04)
- [x] Create ARCH-03-05 story file with all sections
- [ ] Validate story file is 100% complete (NEXT STEP)
- [ ] Create context file with all references
- [ ] Validate context file is 100% complete

### During Implementation (STEP 5-6)
- [ ] Delegate to dev-ext with tool permissions
- [ ] Monitor dev-ext progress (check every 5-10 min)
- [ ] Log any blockers or issues

### After Implementation (STEPS 7-9)
- [ ] Code review (check ADR-034, AGENTS.md compliance)
- [ ] Run TypeScript validation (0 errors)
- [ ] Run verification commands (grep checks)
- [ ] Create completion report
- [ ] **WAIT for Orchestrator authorization**

---

## 🚨 STOP Conditions (NON-NEGOTIABLE)

**STOP and report to Orchestrator if:**
1. TypeScript errors > 3 in preferences or onboarding files
2. Breaking changes introduced (PluginLayout no longer works)
3. ADR-034 violations detected (workspace modes reintroduced)
4. > 2x estimated time (2 hours) without progress
5. dev-ext blocked > 30 minutes without resolution

---

## 📋 Tasks

1. [ ] Create `src/infrastructure/persistence/stores/user-preferences-store.ts` (~180 lines)
2. [ ] Create `src/presentation/components/onboarding/LayoutOnboarding.tsx` (~250 lines)
3. [ ] Update PluginLayout.tsx to integrate LayoutOnboarding component
4. [ ] Add "More Layouts" toggle to LayoutPresetPicker or create separate component
5. [ ] Add "Show advanced features" checkbox to Settings component
6. [ ] Add i18n keys for all user-facing strings (en.json, vi.json)
7. [ ] Verify localStorage persistence works
8. [ ] Verify onboarding shows on first load and dismisses correctly
9. [ ] TypeScript validation: 0 errors
10. [ ] Create completion report

---

## 🔗 References

### Authority Documents (READ-ONLY)
- ✅ ADR-034: Project-Centric Architecture
- ✅ ADR-034-AMENDMENT-001: Platform-First Plugin Selection
- ✅ EPIC-ARCH-03: Layout System & UX
- ✅ AGENTS.md: Governance Rules

### Previous Completion Evidence (READ-ONLY)
- ✅ ARCH-03-00: Platform-First Plugin Defaults
- ✅ ARCH-03-01: ProjectSidebar Component
- ✅ ARCH-03-01-UPDATE: Update ProjectSidebar Navigation
- ✅ ARCH-03-02: Mobile-Responsive Plugin Layouts
- ✅ ARCH-03-03: Layout Presets System
- ✅ ARCH-03-04: Drag-Drop Plugin Reordering

### Architect Handoffs (READ-ONLY)
- [ ] Layout architect handoff (if available)
- [ ] UX designer handoff (if available)

### ARCH-02 Pattern References (READ-ONLY)
- ARCH-02-09: PluginLayout Container (implementation reference)
- Plugin registry patterns (from ARCH-02-02)

---

## 📝 Notes

### Key Design Decisions

1. **First-Time User Experience** / **Trải nghiệm người dùng lần đầu:**
   - Default to "Writing" preset (2-column with FileTree + Notes + Chat)
   - Hide 3-column and 2+1 layouts until user enables advanced features
   - Simple "Add Plugin" button (not prominent in header)

2. **Progressive Disclosure** / **Tiết lộ dần dần:**
   - Show onboarding tooltips on first load only
   - Allow user to skip tooltips if desired
   - Persist completion state to avoid showing again

3. **User Preferences** / **Tùy chọn người dùng:**
   - Store `showAdvancedLayouts` flag in localStorage
   - Allow manual toggle in Settings
   - Track `hasSeenOnboarding` flag

### Non-Negotiable Rules (AGENTS.md)

- ✅ 8-bit design: sharp corners, pixel shadows, solid colors
- ✅ Import order: React/Framework → Third-party → Infrastructure → Domain → Presentation → Relative
- ✅ TypeScript: 0 compilation errors
- ✅ i18n support: All user-facing strings use `t()` function
- ✅ Navigation: Use `navigate({ to: '/$projectId', params: { projectId } })`, NOT `window.location.href`
- ✅ ProjectContext: Import from `@/infrastructure/context/project-context`, NOT `@/lib/workspace/ProjectContext`
- ✅ Zustand v5: Use `useShallow` for multiple selectors
- ✅ File size: Keep components < 400 lines

### ADR-034-001 Compliance

- ✅ Platform determines available plugins (not user-selected "modes")
- ✅ No "IDE mode" vs "Notes mode" concept
- ✅ Single `/$projectId` route (no layout query params)
- ✅ User customizations preserved per project via PluginLayoutStore
- ✅ Preferences stored per user (localStorage)

---

## ✅ Story File Validation Checklist

- [ ] All 7 acceptance criteria documented (with English + Vietnamese)
- [ ] Files to create section complete (2 files with paths and line counts)
- [ ] Implementation pattern section complete (with code examples)
- [ ] Success metrics documented (before/after table)
- [ ] Gatekeeping checkpoints documented (before/during/after)
- [ ] Stop conditions documented (non-negotiable rules)
- [ ] Tasks list complete (10 tasks)
- [ ] References section complete (authority documents + previous completions)
- [ ] Key design decisions documented
- [ ] Non-negotiable rules documented (AGENTS.md compliance)
- [ ] ADR-034-001 compliance documented
- [ ] Dual-language comments in code examples (English + Vietnamese)
- [ ] Story file follows template (summary, criteria, files, patterns, metrics, etc.)

**Story File Validation:** ⬜ PENDING (will be validated in Step 2)

---

## 🚀 Next Steps

1. **Step 2:** Validate story file is 100% complete
2. **Step 3:** Create context file with all references
3. **Step 4:** Validate context file is 100% complete
4. **Step 5:** Delegate to dev-ext with tool permissions
5. **Step 6:** Monitor dev-ext progress
6. **Step 7:** Code review (check ADR-034, AGENTS.md compliance)
7. **Step 8:** Validation checklist (TypeScript: 0 errors)
8. **Step 9:** Report completion and WAIT for Orchestrator authorization

---

**END OF STORY FILE**
