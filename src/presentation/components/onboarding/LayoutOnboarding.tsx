/**
 * @fileoverview Layout Onboarding Component - First-time user tooltips
 * @module presentation/components/onboarding/LayoutOnboarding
 *
 * **ARCH-03-05**: Progressive Disclosure UI
 *
 * Provides dismissible tooltip hints for first-time users.
 * Shows progressive hints about layout features.
 *
 * **ADR-034 COMPLIANCE:**
 * - NO "workspace modes" concept (just hints about features)
 * - Platform determines available plugins (hints just explain)
 *
 * **8-Bit Design Compliance:**
 * - Sharp corners (border-radius: 0)
 * - Pixel shadows (box-shadow: 4px 4px 0 0)
 * - Solid colors (no glassmorphism)
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

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// ============================================================================
// 2. Third-party
// ============================================================================

import { X, Info } from 'lucide-react';

// ============================================================================
// 3. Infrastructure (with @/)
// ============================================================================

import { useUserPreferencesStore } from '@/infrastructure/persistence/stores/user-preferences-store';

// ============================================================================
// 4. Domain
// ============================================================================

// None

// ============================================================================
// 5. Presentation
// ============================================================================

// None (no UI components needed)

// ============================================================================
// 6. Relative
// ============================================================================

// None

// ============================================================================
// Component Props
// ============================================================================

/**
 * Layout Onboarding Props
 * / Props Layout Onboarding
 *
 * @remarks
 * No props needed - auto-activates based on preferences.
 * / Không cần props - tự kích hoạt dựa trên tùy chọn.
 */
interface LayoutOnboardingProps {
  // No props needed - auto-activates based on preferences
  // Không cần props - tự kích hoạt dựa trên tùy chọn
}

// ============================================================================
// LayoutOnboarding Component
// ============================================================================

/**
 * Layout Onboarding Component
 * / Component Layout Onboarding
 *
 * @returns Layout onboarding JSX element
 *
 * @remarks
 * - Shows hints on first load (if hasSeenOnboarding is false)
 * - Hints shown progressively (one at a time)
 * - User can dismiss individual hints or all hints
 * - Persists completion state via user preferences store
 * - Fixed position: bottom-4 right-4, z-50
 * - Max width: max-w-sm (384px)
 * - 8-bit design compliant (sharp corners, pixel shadows, solid colors)
 * - i18n support (all strings use t() function)
 * - ARIA attributes: aria-label, role="status"
 *
 * English:
 * First-time users see tooltips explaining layout features:
 * - Hint 1: Drag plugins to reorder
 * - Hint 2: Add plugins to your layout
 * - Hint 3: Save layouts as presets
 * - Hint 4: Advanced layouts available in Settings
 *
 * Tiếng Việt:
 * Người dùng lần đầu thấy tooltip giải thích tính năng layout:
 * - Gợi ý 1: Kéo plugins để sắp xếp lại
 * - Gợi ý 2: Thêm plugins vào layout
 * - Gợi ý 3: Lưu layout thành presets
 * - Gợi ý 4: Layout nâng cao có sẵn trong Cài đặt
 */
export function LayoutOnboarding({}: LayoutOnboardingProps) {
  const { t } = useTranslation();

  // Get onboarding state from preferences store
  const hasSeenOnboarding = useUserPreferencesStore((s) => s.hasSeenOnboarding);
  const markOnboardingComplete = useUserPreferencesStore((s) => s.markOnboardingComplete);

  // Local state for hint progression
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [showHints, setShowHints] = useState(false);

  /**
   * Hint definitions
   * / Định nghĩa gợi ý
   *
   * @remarks
   * - Each hint has an ID, icon, title, and message
   * - Hints shown progressively (one at a time)
   */
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

  /**
   * Show hints on first load only
   * / Chỉ hiển thị gợi ý khi tải lần đầu
   *
   * @remarks
   * - Small delay to let UI settle first (1 second)
   * - Only shows if hasSeenOnboarding is false
   * - Returning users won't see tooltips
   */
  useEffect(() => {
    if (!hasSeenOnboarding) {
      // Small delay to let UI settle first / Độ trễ nhỏ để UI ổn định trước
      const timer = setTimeout(() => {
        setShowHints(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenOnboarding]);

  /**
   * Handle dismiss all hints
   * / Xử lý khi loại bỏ tất cả gợi ý
   *
   * @remarks
   * - Marks onboarding as complete
   * - Hides all hints
   * - Won't show again unless user resets
   */
  const handleDismiss = () => {
    markOnboardingComplete();
    setShowHints(false);
  };

  /**
   * Handle next hint (or dismiss on last hint)
   * / Xử lý gợi ý tiếp theo (hoặc loại bỏ ở gợi ý cuối)
   *
   * @remarks
   * - If not last hint: advance to next hint
   * - If last hint: dismiss all hints
   */
  const handleNext = () => {
    if (currentHintIndex < hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    } else {
      handleDismiss();
    }
  };

  /**
   * Handle skip all hints
   * / Xử lý khi bỏ qua tất cả gợi ý
   *
   * @remarks
   * - Immediately dismisses all hints
   * - Marks onboarding as complete
   */
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
    <div
      className="layout-onboarding-container fixed bottom-4 right-4 z-50 max-w-sm"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Tooltip Card / Thẻ Tooltip */}
      <div className="onboarding-tooltip border-2 border-black bg-white shadow-4 p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Hint Content / Nội dung gợi ý */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-blue-600">{currentHint.icon}</div>
              <h3 className="font-bold text-sm">
                {currentHint.title}
              </h3>
            </div>
            <p className="text-sm text-gray-700">
              {currentHint.message}
            </p>
          </div>

          {/* Close Button / Nút đóng */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-500 hover:text-black transition-colors border-0 bg-transparent p-1"
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
              className="text-xs text-gray-600 hover:text-black transition-colors px-2 py-1 border-0 bg-transparent"
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

// ============================================================================
// No additional exports - component already exported above
// ============================================================================
