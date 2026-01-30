/**
 * @fileoverview PluginPanelMain - Main Plugin Panel Component
 * @module presentation/components/layout/PluginPanelMain
 *
 * EPIC-UXUI-04: Plugin Panel System
 * - Width: 4 (grid ratio)
 * - Associated with: ActivityBarMainTop
 * - Default plugin: notes
 *
 * @story UXUI-04-05
 * @created 2026-01-30
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { PluginPanelContainer } from './PluginPanelContainer';
import type { PluginPanelProps } from './plugin-panel-types';
import './PluginPanelMain.css';

/**
 * PluginPanelMain Component
 *
 * Main plugin panel with 4 grid unit width.
 * Displays the active plugin from ActivityBarMainTop.
 *
 * @example
 * ```tsx
 * <PluginPanelMain className="custom-class" />
 * ```
 *
 * @param props - Component props
 * @returns React component
 */
export const PluginPanelMain: React.FC<PluginPanelProps> = ({ className }) => {
  return (
    <PluginPanelContainer
      position="main"
      className={cn('plugin-panel-main', className)}
    />
  );
};

export default PluginPanelMain;
