/**
 * @fileoverview Unsaved Changes Warning Hook
 * @module presentation/components/common/hooks/useUnsavedChangesWarning
 *
 * Custom hook to warn users before navigating away with unsaved changes.
 * Prevents accidental data loss during form editing.
 *
 * @December2025Patterns
 * - Reusable across all forms with unsaved state
 * - Type-safe with proper TypeScript interfaces
 * - Accessible with ARIA alerts
 * - Supports custom warning messages
 */

import { useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Configuration for unsaved changes warning
 */
export interface UnsavedChangesConfig {
    /** Whether form has unsaved changes */
    hasUnsavedChanges: boolean;
    /** Custom warning message (defaults to i18n key) */
    message?: string;
    /** Callback when user tries to navigate away */
    onBeforeNavigate?: () => boolean;
}

/**
 * Unsaved Changes Warning Hook
 *
 * Warns users before they:
 * - Close browser tab/window
 * - Refresh page
 * - Navigate away (when integrated with router)
 *
 * @example
 * ```tsx
 * function MyForm() {
 *   const [isDirty, setIsDirty] = useState(false);
 *
 *   useUnsavedChangesWarning({
 *     hasUnsavedChanges: isDirty,
 *     message: 'You have unsaved changes. Are you sure you want to leave?'
 *   });
 *
 *   return (
 *     <form onChange={() => setIsDirty(true)}>
 *       <input name="email" />
 *     </form>
 *   );
 * }
 * ```
 */
export function useUnsavedChangesWarning(config: UnsavedChangesConfig) {
    const { hasUnsavedChanges, message, onBeforeNavigate } = config;
    const { t } = useTranslation();

    const originalHandler = useRef<(event: BeforeUnloadEvent) => void | null>(null);

    /**
     * Handle beforeunload event (browser close/refresh)
     */
    const handleBeforeUnload = useCallback(
        (event: BeforeUnloadEvent) => {
            // Call custom callback if provided
            if (onBeforeNavigate && !onBeforeNavigate()) {
                return;
            }

            if (hasUnsavedChanges) {
                // Standard way to trigger browser's native warning dialog
                const warningMessage =
                    message ||
                    t(
                        'common.unsavedChangesWarning',
                        'You have unsaved changes. Are you sure you want to leave?'
                    );

                // Set the returnValue (required for Chrome)
                event.preventDefault();
                event.returnValue = warningMessage;

                // Return the message (required for some browsers)
                return warningMessage;
            }
        },
        [hasUnsavedChanges, message, onBeforeNavigate, t]
    );

    /**
     * Set up and tear down event listener
     */
    useEffect(() => {
        // Store original handler for cleanup
        originalHandler.current = window.onbeforeunload;

        // Add our handler
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            // Remove our handler
            window.removeEventListener('beforeunload', handleBeforeUnload);

            // Restore original handler if it existed
            if (originalHandler.current) {
                window.onbeforeunload = originalHandler.current;
            }
        };
    }, [handleBeforeUnload]);

    /**
     * Manual check for programmatic navigation (e.g., router transitions)
     * Call this before navigating programmatically
     */
    const confirmNavigation = useCallback((): boolean => {
        if (!hasUnsavedChanges) {
            return true;
        }

        const warningMessage =
            message ||
            t(
                'common.unsavedChangesWarning',
                'You have unsaved changes. Are you sure you want to leave?'
            );

        // Browser will show native confirm dialog
        // Note: Modern browsers may not show custom message due to security
        return window.confirm(warningMessage);
    }, [hasUnsavedChanges, message, t]);

    return {
        confirmNavigation,
    };
}

/**
 * Higher-order component pattern for unsaved changes warning
 * Wraps a component and provides confirmNavigation callback
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [isDirty, setIsDirty] = useState(false);
 *   const { confirmNavigation } = useUnsavedChangesWarning({
 *     hasUnsavedChanges: isDirty
 *   });
 *
 *   const handleNavigate = () => {
 *     if (confirmNavigation()) {
 *       navigate('/other-page');
 *     }
 *   };
 *
 *   return <Button onClick={handleNavigate}>Go</Button>;
 * }
 * ```
 */
