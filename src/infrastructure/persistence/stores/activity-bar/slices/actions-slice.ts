/**
 * @fileoverview Activity Bar Actions Slice
 * @module infrastructure/persistence/stores/activity-bar/slices/actions-slice
 */

import type { StateCreator } from 'zustand';
import type { ActivityBarPosition } from '@/presentation/components/layout/activity-bar-types';
import { MAX_PLUGINS_PER_BAR } from '@/presentation/components/layout/activity-bar-types';
import type { PluginId } from '@/domain/types/plugin-types';
import type { ActivityBarStateSlice } from './state-slice';
import { getBarKey } from './state-slice';

export interface ActivityBarActionsSlice {
  setBarPlugins: (position: ActivityBarPosition, plugins: PluginId[]) => void;
  setActivePlugin: (position: ActivityBarPosition, pluginId: PluginId | null) => void;
  togglePlugin: (position: ActivityBarPosition, pluginId: PluginId) => void;
  movePlugin: (pluginId: PluginId, from: ActivityBarPosition, to: ActivityBarPosition) => void;
  addPluginToBar: (position: ActivityBarPosition, pluginId: PluginId) => boolean;
  removePluginFromBar: (position: ActivityBarPosition, pluginId: PluginId) => void;
}

export const createActionsSlice: StateCreator<
  ActivityBarStateSlice & ActivityBarActionsSlice,
  [],
  [],
  ActivityBarActionsSlice
> = (set, get) => ({
  setBarPlugins: (position, plugins) =>
    set((state) => {
      const barKey = getBarKey(position);
      const trimmedPlugins = plugins.slice(0, MAX_PLUGINS_PER_BAR);
      const newState = { ...state };

      (['left', 'mainTop', 'right'] as const).forEach((key) => {
        if (key !== barKey) {
          newState[key] = {
            ...state[key],
            plugins: state[key].plugins.filter((p) => !trimmedPlugins.includes(p)),
            activePluginId: trimmedPlugins.includes(state[key].activePluginId as PluginId)
              ? null
              : state[key].activePluginId,
          };
        }
      });

      newState[barKey] = {
        ...state[barKey],
        plugins: trimmedPlugins,
        activePluginId: trimmedPlugins.includes(state[barKey].activePluginId as PluginId)
          ? state[barKey].activePluginId
          : trimmedPlugins[0] || null,
      };

      return newState;
    }),

  setActivePlugin: (position, pluginId) =>
    set((state) => {
      const barKey = getBarKey(position);
      const bar = state[barKey];

      if (pluginId && !bar.plugins.includes(pluginId)) {
        console.warn(`[ActivityBarStore] Plugin ${pluginId} not in ${position} bar`);
        return state;
      }

      return { ...state, [barKey]: { ...bar, activePluginId: pluginId } };
    }),

  togglePlugin: (position, pluginId) =>
    set((state) => {
      const barKey = getBarKey(position);
      const bar = state[barKey];

      if (!bar.plugins.includes(pluginId)) {
        console.warn(`[ActivityBarStore] Cannot toggle: ${pluginId} not in ${position} bar`);
        return state;
      }

      const isActive = bar.activePluginId === pluginId;
      return { ...state, [barKey]: { ...bar, activePluginId: isActive ? null : pluginId } };
    }),

  movePlugin: (pluginId, from, to) =>
    set((state) => {
      const fromKey = getBarKey(from);
      const toKey = getBarKey(to);

      if (!state[fromKey].plugins.includes(pluginId)) {
        console.warn(`[ActivityBarStore] Plugin ${pluginId} not in ${from} bar`);
        return state;
      }

      if (state[toKey].plugins.length >= MAX_PLUGINS_PER_BAR) {
        console.warn(`[ActivityBarStore] ${to} bar is full`);
        return state;
      }

      const newFromPlugins = state[fromKey].plugins.filter((p) => p !== pluginId);
      const newFromActive = state[fromKey].activePluginId === pluginId
        ? null
        : state[fromKey].activePluginId;

      const newToPlugins = [...state[toKey].plugins, pluginId];
      const newToActive = state[toKey].activePluginId || pluginId;

      return {
        ...state,
        [fromKey]: { plugins: newFromPlugins, activePluginId: newFromActive },
        [toKey]: { plugins: newToPlugins, activePluginId: newToActive },
      };
    }),

  addPluginToBar: (position, pluginId) => {
    const state = get();
    const barKey = getBarKey(position);

    if (state[barKey].plugins.includes(pluginId)) return true;
    if (state[barKey].plugins.length >= MAX_PLUGINS_PER_BAR) return false;

    (['left', 'mainTop', 'right'] as const).forEach((key) => {
      if (key !== barKey && state[key].plugins.includes(pluginId)) {
        const newPlugins = state[key].plugins.filter((p) => p !== pluginId);
        const newActive = state[key].activePluginId === pluginId
          ? null
          : state[key].activePluginId;
        set((s) => ({ ...s, [key]: { plugins: newPlugins, activePluginId: newActive } }));
      }
    });

    set((s) => ({
      ...s,
      [barKey]: {
        plugins: [...s[barKey].plugins, pluginId],
        activePluginId: s[barKey].activePluginId || pluginId,
      },
    }));

    return true;
  },

  removePluginFromBar: (position, pluginId) =>
    set((state) => {
      const barKey = getBarKey(position);
      if (!state[barKey].plugins.includes(pluginId)) return state;

      const newPlugins = state[barKey].plugins.filter((p) => p !== pluginId);
      const newActive = state[barKey].activePluginId === pluginId
        ? newPlugins[0] || null
        : state[barKey].activePluginId;

      return { ...state, [barKey]: { plugins: newPlugins, activePluginId: newActive } };
    }),
});
