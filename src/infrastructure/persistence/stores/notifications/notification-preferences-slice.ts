/**
 * Notification Preferences Slice
 *
 * Manages browser notification permissions and user preferences.
 * Part of the December 2025 Zustand slice pattern refactoring.
 *
 * @module stores/notifications/notification-preferences-slice
 * @story S-033 - Notification System with Toast/Badge
 */

import type { StateCreator } from 'zustand';
import type { NotificationStoreActions } from '@/lib/notifications/types';

/**
 * Notification Preferences State
 */
export interface NotificationPreferencesState {
  /** Browser notification permission */
  permission: NotificationPermission;

  /** Sound enabled */
  soundEnabled: boolean;

  /** Native browser notifications enabled */
  nativeEnabled: boolean;
}

/**
 * Notification Preferences Actions
 */
export interface NotificationPreferencesActions {
  /** Request browser notification permission */
  requestPermission: () => Promise<NotificationPermission>;

  /** Update sound preference */
  setSoundEnabled: (enabled: boolean) => void;

  /** Update native notifications preference */
  setNativeEnabled: (enabled: boolean) => void;
}

/**
 * Default preferences
 */
const DEFAULT_PREFERENCES = {
  soundEnabled: false,
  nativeEnabled: false,
};

/**
 * Initial preferences state
 */
const initialPreferencesState: NotificationPreferencesState = {
  permission: 'default' as NotificationPermission,
  soundEnabled: DEFAULT_PREFERENCES.soundEnabled,
  nativeEnabled: DEFAULT_PREFERENCES.nativeEnabled,
};

/**
 * Notification Preferences Slice Creator
 */
export const createNotificationPreferencesSlice: StateCreator<
  NotificationPreferencesState & NotificationPreferencesActions,
  [],
  [],
  NotificationPreferencesState & NotificationPreferencesActions
> = (set) => ({
  ...initialPreferencesState,

  requestPermission: async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('[NotificationStore] Notifications not supported in this browser');
      return 'denied' as NotificationPermission;
    }

    const permission = await Notification.requestPermission();
    set({ permission });

    return permission;
  },

  setSoundEnabled: (enabled: boolean) => {
    set({ soundEnabled: enabled });
  },

  setNativeEnabled: (enabled: boolean) => {
    set({ nativeEnabled: enabled });
  },
});
