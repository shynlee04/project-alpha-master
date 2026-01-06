/**
 * Notification Permission Requester
 *
 * Automatically requests browser notification permission on first user interaction.
 * Unobtrusive, respects user choice, and shows permission status.
 *
 * @module components/notifications/NotificationPermissionRequester
 * @story S-033 - Notification System with Toast/Badge
 */

import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotificationManager } from '@/lib/notifications/notification-manager';

/**
 * Notification Permission Requester Component
 *
 * Requests notification permission on first user gesture.
 * Only shows if permission is 'default' (not yet requested).
 */
export function NotificationPermissionRequester() {
  const { t } = useTranslation();
  const notificationManager = useNotificationManager();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [hasInteracted, setHasInteracted] = useState(false);
  const hasRequested = useRef(false);

  // Check current permission status
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Request permission on first user interaction
  useEffect(() => {
    if (hasInteracted && !hasRequested.current && permission === 'default') {
      requestPermission();
    }
  }, [hasInteracted, permission]);

  // Track first user interaction
  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true);
    };

    // Listen for first user gesture
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // Request permission
  const requestPermission = async () => {
    if (hasRequested.current) return;
    hasRequested.current = true;

    try {
      const result = await notificationManager.requestPermission();
      setPermission(result);

      // Show notification based on result
      if (result === 'granted') {
        notificationManager.success(
          t('notifications.permissionGranted.title', 'Notifications Enabled'),
          t('notifications.permissionGranted.message', 'You will receive notifications for important events.')
        );
      } else if (result === 'denied') {
        // Silently accept denial - don't show additional notification
        console.info('[NotificationPermission] User denied notification permission');
      }
    } catch (error) {
      console.error('[NotificationPermission] Failed to request permission:', error);
    }
  };

  // Don't render anything (silent request)
  return null;
}

/**
 * Notification Permission Banner (Optional)
 *
 * Shows a non-intrusive banner if permission is denied,
 * with a link to browser settings.
 */
export function NotificationPermissionBanner() {
  const { t } = useTranslation();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Only show if denied and not dismissed
  if (permission !== 'denied' || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="rounded-sm border-2 border-yellow-700 bg-yellow-950 p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-100">
              {t('notifications.permissionDenied.title', 'Notifications Blocked')}
            </p>
            <p className="mt-1 text-xs text-yellow-200">
              {t('notifications.permissionDenied.message', 'Enable notifications in your browser settings to receive updates.')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 rounded-sm p-1 text-yellow-300 hover:text-yellow-100 hover:bg-yellow-900 transition-colors"
            aria-label={t('notifications.dismiss', 'Dismiss')}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
