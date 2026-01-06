/**
 * Notification Filter Slice
 *
 * Manages notification filtering, searching, and querying.
 * Part of the December 2025 Zustand slice pattern refactoring.
 *
 * @module stores/notifications/notification-filter-slice
 * @story S-033 - Notification System with Toast/Badge
 */

import type { StateCreator } from 'zustand';
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
 */
export const createNotificationFilterSlice: StateCreator<
  NotificationCrudState & NotificationFilterState & NotificationFilterActions,
  [],
  [],
  NotificationFilterState & NotificationFilterActions
> = (set, get) => ({
  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },

  getByType: (type: Notification['type'] | Notification['type'][]) => {
    const notifications = get().notifications;
    if (Array.isArray(type)) {
      return notifications.filter((n) => type.includes(n.type));
    }
    return notifications.filter((n) => n.type === type);
  },

  getFiltered: (filter: NotificationFilter) => {
    let results = get().notifications;

    // Filter by type
    if (filter.type) {
      const types = Array.isArray(filter.type) ? filter.type : [filter.type];
      results = results.filter((n) => types.includes(n.type));
    }

    // Filter by priority
    if (filter.priority) {
      const priorities = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
      results = results.filter((n) => priorities.includes(n.priority));
    }

    // Filter by read status
    if (filter.read !== undefined) {
      results = results.filter((n) => n.read === filter.read);
    }

    // Filter by date range
    if (filter.startDate) {
      results = results.filter((n) => n.createdAt >= filter.startDate!);
    }
    if (filter.endDate) {
      results = results.filter((n) => n.createdAt <= filter.endDate!);
    }

    // Search query
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      results = results.filter(
        (n) =>
          n.title.toLowerCase().includes(searchLower) ||
          n.message.toLowerCase().includes(searchLower)
      );
    }

    // Limit results
    if (filter.limit) {
      results = results.slice(0, filter.limit);
    }

    return results;
  },
});
