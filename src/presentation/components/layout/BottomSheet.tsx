/**
 * @fileoverview BottomSheet Component
 * @module components/layout/BottomSheet
 * @created 2026-01-28
 * @epic EPIC-UXUI-03
 * @story UXUI-03-12
 *
 * Pull-up bottom sheet for mobile "More" actions.
 * 8-bit design compliant with sharp corners and pixel shadows.
 *
 * Features:
 * - Swipe-down to close
 * - Backdrop click to close
 * - Keyboard accessible (Escape to close)
 * - Focus trap when open
 * - Safe area inset handling
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

import './BottomSheet.css';

// ============================================================================
// Types
// ============================================================================

export interface BottomSheetProps {
  /** Whether the sheet is open */
  isOpen: boolean;
  /** Callback when sheet should close */
  onClose: () => void;
  /** Optional title for the sheet header */
  title?: string;
  /** Content to render inside the sheet */
  children: React.ReactNode;
  /** Additional CSS classes for the sheet container */
  className?: string;
  /** Whether to show the close button (default: true) */
  showCloseButton?: boolean;
  /** Whether to close on backdrop click (default: true) */
  closeOnBackdrop?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * BottomSheet - Pull-up sheet for mobile actions
 *
 * @example
 * ```tsx
 * <BottomSheet
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="More Options"
 * >
 *   <ul className="bottom-sheet__menu">
 *     <li>
 *       <button className="bottom-sheet__menu-item">
 *         <Settings className="bottom-sheet__menu-item-icon" />
 *         <span className="bottom-sheet__menu-item-label">Settings</span>
 *       </button>
 *     </li>
 *   </ul>
 * </BottomSheet>
 * ```
 */
export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className,
  showCloseButton = true,
  closeOnBackdrop = true,
}: BottomSheetProps): React.JSX.Element | null {
  const { t } = useTranslation();
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // ========================================================================
  // Keyboard handling (Escape to close)
  // ========================================================================

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        onClose();
      }
    },
    [isOpen, onClose]
  );

  // ========================================================================
  // Focus management
  // ========================================================================

  useEffect(() => {
    if (isOpen) {
      // Save current focus
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the sheet
      sheetRef.current?.focus();

      // Add keyboard listener
      document.addEventListener('keydown', handleKeyDown);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus
      previousActiveElement.current?.focus();

      // Remove keyboard listener
      document.removeEventListener('keydown', handleKeyDown);

      // Restore body scroll
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // ========================================================================
  // Backdrop click handler
  // ========================================================================

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      // Only close if clicking the backdrop itself
      if (event.target === event.currentTarget && closeOnBackdrop) {
        onClose();
      }
    },
    [closeOnBackdrop, onClose]
  );

  // ========================================================================
  // Touch drag-to-close
  // ========================================================================

  const dragStartY = useRef<number | null>(null);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    dragStartY.current = event.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (dragStartY.current === null) return;

      const dragEndY = event.changedTouches[0].clientY;
      const dragDistance = dragEndY - dragStartY.current;

      // If dragged down more than 100px, close the sheet
      if (dragDistance > 100) {
        onClose();
      }

      dragStartY.current = null;
    },
    [onClose]
  );

  // ========================================================================
  // Render
  // ========================================================================

  // Don't render if not open (for performance)
  if (!isOpen) {
    return null;
  }

  const content = (
    <>
      {/* Backdrop overlay */}
      <div
        className="bottom-sheet-overlay"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Sheet container */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || t('bottomSheet.label', 'Actions menu')}
        tabIndex={-1}
        className={cn(
          'bottom-sheet',
          isOpen && 'bottom-sheet--open',
          className
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle indicator */}
        <div className="bottom-sheet__handle" aria-hidden="true">
          <div className="bottom-sheet__handle-bar" />
        </div>

        {/* Header with title and close button */}
        {(title || showCloseButton) && (
          <header className="bottom-sheet__header">
            {title && (
              <h2 className="bottom-sheet__title">{title}</h2>
            )}

            {showCloseButton && (
              <button
                type="button"
                className="bottom-sheet__close"
                onClick={onClose}
                aria-label={t('bottomSheet.close', 'Close menu')}
              >
                <X size={20} />
              </button>
            )}
          </header>
        )}

        {/* Content area */}
        <div className="bottom-sheet__content">
          {children}
        </div>
      </div>
    </>
  );

  // Render in portal for z-index stacking
  return createPortal(content, document.body);
}

export default BottomSheet;
