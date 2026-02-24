/**
 * @fileoverview PluginPanelRight - Right Plugin Panel Component
 * @module presentation/components/layout/PluginPanelRight
 *
 * EPIC-UXUI-04: Plugin Panel System
 * - Width: 2.5 (grid ratio)
 * - Associated with: ActivityBarRight
 * - Default plugin: chat
 *
 * @story UXUI-04-05
 * @created 2026-01-30
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { PluginPanelContainer } from './PluginPanelContainer';
import type { PluginPanelProps } from './plugin-panel-types';
import './PluginPanelRight.css';

/**
 * PluginPanelRight Component
 *
 * Right plugin panel with 2.5 grid unit width.
 * Displays the active plugin from ActivityBarRight.
 *
 * @example
 * ```tsx
 * <PluginPanelRight className="custom-class" />
 * ```
 *
 * @param props - Component props
 * @returns React component
 */
export const PluginPanelRight: React.FC<PluginPanelProps> = ({ className }) => {
  return (
    <PluginPanelContainer
      position="right"
      className={cn('plugin-panel-right', className)}
    />
  );
};

export default PluginPanelRight;
