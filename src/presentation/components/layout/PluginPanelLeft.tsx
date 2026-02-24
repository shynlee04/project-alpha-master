/**
 * @fileoverview PluginPanelLeft - Left Plugin Panel Component
 * @module presentation/components/layout/PluginPanelLeft
 *
 * EPIC-UXUI-04: Plugin Panel System
 * - Width: 2 (grid ratio)
 * - Associated with: ActivityBarLeft
 * - Default plugin: filetree
 *
 * @story UXUI-04-05
 * @created 2026-01-30
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { PluginPanelContainer } from './PluginPanelContainer';
import type { PluginPanelProps } from './plugin-panel-types';
import './PluginPanelLeft.css';

/**
 * PluginPanelLeft Component
 *
 * Left plugin panel with 2 grid unit width.
 * Displays the active plugin from ActivityBarLeft.
 *
 * @example
 * ```tsx
 * <PluginPanelLeft className="custom-class" />
 * ```
 *
 * @param props - Component props
 * @returns React component
 */
export const PluginPanelLeft: React.FC<PluginPanelProps> = ({ className }) => {
  return (
    <PluginPanelContainer
      position="left"
      className={cn('plugin-panel-left', className)}
    />
  );
};

export default PluginPanelLeft;
