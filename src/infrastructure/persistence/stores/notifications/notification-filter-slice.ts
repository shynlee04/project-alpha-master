/**
 * @fileoverview Notification Filter Slice
 *
 * Manages notification filtering, searching, and querying.
 * Part of the December 2025 Zustand slice pattern refactoring.
 *
 * @module stores/notifications/notification-filter-slice
 * @story S-033 - Notification System with Toast/Badge
 */

import { StateCreator } from 'zustand';
import type { Notification, NotificationFilter } from '@/lib/notifications/types';
import type { NotificationCrudState } from './notification-crud-slice';

/**
 * Notification Filter State (empty, uses computed methods)
 */
export interface NotificationFilterState {}

/**
 * Notification Filter Actions
 */
export interface NotificationFilterActions {
  /** Get unread count */
  getUnreadCount: () => number;

  /** Get notifications by type */
  getByType: (type: Notification['type'] | Notification['type'][]) => Notification[];

  /** Get filtered notifications */
  getFiltered: (filter: NotificationFilter) => Notification[];
}

/**
 * Notification Filter Slice Creator
 *
 * StateCreator needs to include NotificationCrudState so that get()
 * can access the notifications property from the combined store.
 * The return type is only NotificationFilterState & NotificationFilterActions
 * because this slice doesn't own the CRUD state - it only reads from it.
 */
export const createNotificationFilterSlice: StateCreator<
  NotificationCrudState & NotificationFilterState & NotificationFilterActions,
  [],
  [],
  NotificationFilterState & NotificationFilterActions
> = (_set, get) => ({
  getUnreadCount: () => {
    const { notifications } = get();
    return notifications.filter((n: Notification) => !n.read).length;
  },

  getByType: (type: Notification['type'] | Notification['type'][]) => {
    const { notifications } = get();
    if (Array.isArray(type)) {
      return notifications.filter((n: Notification) => type.includes(n.type));
    }
    return notifications.filter((n: Notification) => n.type === type);
  },

  getFiltered: (filter: NotificationFilter) => {
    const results = get().notifications;

    // Filter by type
    if (filter.type) {
      const types = Array.isArray(filter.type) ? filter.type : [filter.type];
      return results.filter((n: Notification) => types.includes(n.type));
    }

    // Filter by priority
    if (filter.priority) {
      const priorities = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
      return results.filter((n: Notification) => priorities.includes(n.priority));
    }

    // Filter by read status
    if (filter.read !== undefined) {
      return results.filter((n: Notification) => n.read === filter.read);
    }

    // Filter by date range
    if (filter.startDate) {
      return results.filter((n: Notification) => n.createdAt >= filter.startDate!);
    }
    if (filter.endDate) {
      return results.filter((n: Notification) => n.createdAt <= filter.endDate!);
    }

    // Search query
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return results.filter(
        (n: Notification) =>
          n.title.toLowerCase().includes(searchLower) ||
          n.message.toLowerCase().includes(searchLower)
      );
    }

    // Limit results
    if (filter.limit) {
      return results.slice(0, filter.limit);
    }

    return results;
  },
});
