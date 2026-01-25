/**
 * @fileoverview SimpleHeader - Minimal header with project name and sidebar toggle
 * @module presentation/components/header/SimpleHeader
 *
 * **ARCH-03-06**: Root Layout Integration
 *
 * Minimal header component for project views with:
 * - Sidebar toggle button (Menu icon)
 * - Logo
 * - Project name
 *
 * 8-bit design: sharp corners, pixel shadows.
 * i18n support: English and Vietnamese.
 *
 * @epic EPIC-ARCH-03
 * @story ARCH-03-06
 * @team Team A
 * @created 2026-01-23
 */

import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// ============================================================================
// Props
// ============================================================================

export interface SimpleHeaderProps {
  /** Toggle sidebar open/closed */
  onToggleSidebar?: () => void;

  /** Current project ID (for future use - display project name) */
  projectId?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * SimpleHeader Component
 *
 * Minimal header with:
 * - Toggle button for sidebar
 * - Logo
 * - Project name placeholder
 *
 * 8-bit design: `border-2`, `border-black`, `bg-gray-50`, sharp corners.
 * i18n support for toggle button aria-label.
 */
export function SimpleHeader({ onToggleSidebar }: SimpleHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="header border-b-2 border-black bg-gray-50 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Toggle button + Logo */}
        <div className="flex items-center gap-4">
          {/* Sidebar toggle button */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="flex items-center justify-center p-2 border-2 border-black bg-gray-50 hover:bg-gray-200 active:bg-gray-300 transition-colors"
              aria-label={t('header.toggleSidebar')}
              aria-expanded={false}
              type="button"
            >
              <Menu size={24} />
            </button>
          )}

          {/* Logo */}
          <img
            src="/via-gent-logo.svg"
            alt="Via-gent Logo"
            className="h-8"
          />
        </div>

        {/* Right side - Project name (placeholder for now) */}
        <div className="flex items-center gap-4">
          {/* TODO: Load project name from store or context in future story */}
          <span className="font-bold text-lg">Via-gent</span>
        </div>
      </div>
    </header>
  );
}
