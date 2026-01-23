/**
 * @fileoverview User Preferences Store - Zustand store for user preferences
 * @module infrastructure/persistence/stores/user-preferences-store
 *
 * **ARCH-03-05**: Progressive Disclosure UI
 *
 * Zustand v5 store for user preferences and advanced feature flags.
 * Persists to localStorage via Zustand persist middleware.
 *
 * **ADR-034 COMPLIANCE:**
 * - User preferences stored per user (localStorage)
 * - showAdvancedLayouts controls progressive disclosure
 * - hasSeenOnboarding tracks first-time user experience
 * - NO "workspace modes" concept (just feature flags)
 *
 * **8-Bit Design Compliance:**
 * - Sharp corners, pixel shadows, solid colors
 * - Import order: React/Framework → Third-party → Infrastructure → Domain → Presentation → Relative
 *
 * @epic EPIC-ARCH-03
 * @story ARCH-03-05
 * @team Team A
 * @created 2026-01-23
 */

// ============================================================================
// 1. React/Framework
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

// ============================================================================
// 2. Third-party
// ============================================================================

// None

// ============================================================================
// 3. Infrastructure (with @/)
// ============================================================================

// None - this IS infrastructure

// ============================================================================
// 4. Domain
// ============================================================================

// None

// ============================================================================
// 5. Presentation
// ============================================================================

// None

// ============================================================================
// 6. Relative
// ============================================================================

// None

// ============================================================================
// Constants
// ============================================================================

const PREFERENCES_STORAGE_KEY = 'via-gent-user-preferences';

// ============================================================================
// User Preferences State Interface
// ============================================================================

/**
 * User preferences state interface
 * Interface trạng thái tùy chọn người dùng
 *
 * @remarks
 * - showAdvancedLayouts: Controls visibility of advanced layout options (3-column, 2+1)
 * - hasSeenOnboarding: Tracks if user has seen onboarding tooltips
 * - defaultPresetId: User's preferred default preset
 *
 * English:
 * - showAdvancedLayouts: Hide/show advanced layout options for progressive disclosure
 * - hasSeenOnboarding: Don't show tooltips to returning users
 * - defaultPresetId: Remember user's favorite preset
 *
 * Tiếng Việt:
 * - showAdvancedLayouts: Ẩn/hiện tùy chọn layout nâng cao cho tiết lộ dần
 * - hasSeenOnboarding: Không hiện gợi ý cho người dùng quay lại
 * - defaultPresetId: Ghi nhớ preset ưa thích của người dùng
 */
interface UserPreferencesState {
  // State / Trạng thái
  showAdvancedLayouts: boolean;     // Show/hide advanced layout options / Hiển thị/ẩn tùy chọn layout nâng cao
  hasSeenOnboarding: boolean;        // Onboarding completed flag / Flag onboarding hoàn tất
  defaultPresetId: string | null;   // User's preferred preset / Preset ưu thích của người dùng

  // Actions / Hành động
  toggleAdvancedLayouts: () => void;                      // Toggle advanced visibility / Chuyển đổi hiển thị nâng cao
  setShowAdvancedLayouts: (show: boolean) => void;         // Set advanced visibility explicitly / Đặt hiển thị nâng cao rõ ràng
  markOnboardingComplete: () => void;                      // Mark onboarding as complete / Đánh dấu onboarding đã hoàn tất
  resetOnboarding: () => void;                             // Reset onboarding (for testing) / Đặt lại onboarding (để kiểm thử)
  setDefaultPreset: (presetId: string) => void;           // Set default preset / Đặt preset mặc định
}

// ============================================================================
// User Preferences Store
// ============================================================================

/**
 * User Preferences Store
 * / Store Tùy Chọn Người Dùng
 *
 * @remarks
 * - Zustand v5 store with persist middleware
 * - Storage key: `via-gent-user-preferences`
 * - Version: 1 (for future migrations)
 * - Initial state: showAdvancedLayouts: false (start simple)
 * - Initial state: hasSeenOnboarding: false (show tooltips on first load)
 *
 * English:
 * - Starts simple for first-time users (progressive disclosure)
 * - Persists to localStorage automatically
 * - Convenience hooks provided: useAdvancedLayouts(), useOnboarding(), useDefaultPreset()
 *
 * Tiếng Việt:
 * - Bắt đầu đơn giản cho người dùng lần đầu (tiết lộ dần)
 * - Tự động lưu vào localStorage
 * - Cung cấp hooks tiện lợi: useAdvancedLayouts(), useOnboarding(), useDefaultPreset()
 */
export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set) => ({
      // Initial State / Trạng thái khởi đầu
      showAdvancedLayouts: false,    // Start simple (first-time user experience) / Bắt đầu đơn giản (trải nghiệm người dùng lần đầu)
      hasSeenOnboarding: false,     // Hasn't seen tooltips yet / Chưa thấy tooltip
      defaultPresetId: null,        // No preset selected yet / Chưa chọn preset

      // Actions / Hành động

      /**
       * Toggle advanced layouts visibility
       * / Chuyển đổi hiển thị layout nâng cao
       *
       * @remarks
       * Flips showAdvancedLayouts between true and false
       */
      toggleAdvancedLayouts: () => {
        set((state) => ({
          showAdvancedLayouts: !state.showAdvancedLayouts,
        }));
      },

      /**
       * Set advanced layouts visibility explicitly
       * / Đặt hiển thị layout nâng cao rõ ràng
       *
       * @param show - Whether to show advanced layouts
       */
      setShowAdvancedLayouts: (show) => {
        set({ showAdvancedLayouts: show });
      },

      /**
       * Mark onboarding as complete
       * / Đánh dấu onboarding đã hoàn tất
       *
       * @remarks
       * Sets hasSeenOnboarding to true (won't show tooltips again)
       */
      markOnboardingComplete: () => {
        set({ hasSeenOnboarding: true });
      },

      /**
       * Reset onboarding (for testing)
       * / Đặt lại onboarding (để kiểm thử)
       *
       * @remarks
       * Sets hasSeenOnboarding to false (will show tooltips again)
       * Use sparingly - only for development/testing
       */
      resetOnboarding: () => {
        set({ hasSeenOnboarding: false });
      },

      /**
       * Set default preset
       * / Đặt preset mặc định
       *
       * @param presetId - ID of the preset to set as default
       */
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

// ============================================================================
// Convenience Hooks / Hooks Tiện Lợi
// ============================================================================

/**
 * useAdvancedLayouts Hook
 * / Hook useAdvancedLayouts
 *
 * @returns { showAdvanced, toggle, setShow }
 *
 * @remarks
 * - showAdvanced: Current value of showAdvancedLayouts
 * - toggle: Function to toggle showAdvancedLayouts
 * - setShow: Function to set showAdvancedLayouts explicitly
 *
 * English:
 * Use this hook when you need to access advanced layouts toggle.
 *
 * Tiếng Việt:
 * Sử dụng hook này khi bạn cần truy cập toggle layout nâng cao.
 */
export function useAdvancedLayouts() {
  return useUserPreferencesStore(
    useShallow((state) => ({
      showAdvanced: state.showAdvancedLayouts,
      toggle: state.toggleAdvancedLayouts,
      setShow: state.setShowAdvancedLayouts,
    }))
  );
}

/**
 * useOnboarding Hook
 * / Hook useOnboarding
 *
 * @returns { hasSeenOnboarding, markComplete, reset }
 *
 * @remarks
 * - hasSeenOnboarding: Whether user has seen onboarding tooltips
 * - markComplete: Function to mark onboarding as complete
 * - reset: Function to reset onboarding (for testing)
 *
 * English:
 * Use this hook when you need to manage onboarding state.
 *
 * Tiếng Việt:
 * Sử dụng hook này khi bạn cần quản lý trạng thái onboarding.
 */
export function useOnboarding() {
  return useUserPreferencesStore(
    useShallow((state) => ({
      hasSeenOnboarding: state.hasSeenOnboarding,
      markComplete: state.markOnboardingComplete,
      reset: state.resetOnboarding,
    }))
  );
}

/**
 * useDefaultPreset Hook
 * / Hook useDefaultPreset
 *
 * @returns { presetId, setPreset }
 *
 * @remarks
 * - presetId: Current default preset ID
 * - setPreset: Function to set default preset ID
 *
 * English:
 * Use this hook when you need to manage user's preferred preset.
 *
 * Tiếng Việt:
 * Sử dụng hook này khi bạn cần quản lý preset ưa thích của người dùng.
 */
export function useDefaultPreset() {
  return useUserPreferencesStore(
    useShallow((state) => ({
      presetId: state.defaultPresetId,
      setPreset: state.setDefaultPreset,
    }))
  );
}

// ============================================================================
// No additional exports - store and hooks already exported above
// ============================================================================
