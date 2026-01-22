/**
 * @fileoverview Platform-First Plugin Defaults
 * @module infrastructure/plugins/platform-defaults
 *
 * **ARCH-03-00**: Platform-First Plugin Defaults - P0 BLOCKING
 *
 * This replaces "ide mode" vs "notes mode" concept.
 * Platform determines what's AVAILABLE, not what "mode" you're in.
 * Nó thay thế khái niệm "IDE mode" và "Notes mode".
 * Nền tảng quyết định những gì có sẵn, không phải "mode" bạn đang ở.
 *
 * @epic EPIC-ARCH-03
 * @story ARCH-03-00
 * @team Team A
 * @created 2026-01-22
 */

import type { PluginId } from '@/domain/types/plugin-types';
import type { PlatformContract } from '@/infrastructure/filesystem/platform-contract';
import type { Project } from '@/domain/entities/project';

// ============================================================================
// Get Default Plugins Based on Platform and Project
// ============================================================================

/**
 * Get default plugins based on platform and project
 * / Lấy các plugin mặc định dựa trên nền tảng và dự án
 *
 * @remarks
 * - This replaces "ide mode" vs "notes mode" concept
 * - Platform determines what's AVAILABLE, not what "mode" you're in
 * - Desktop with FSA: Full development experience (FileTree + Monaco + Chat)
 * - Desktop with IndexedDB: Notes-focused (FileTree + Notes + Chat)
 * - Tablet: Notes-focused (FileTree + Notes + Chat)
 * - Mobile: Minimal (Notes only, chat accessible via sidebar)
 *
 * @param platform - Platform contract from getPlatformContract()
 * @param project - Project entity with storage type
 * @returns Array of plugin IDs to load by default
 */
export function getDefaultPlugins(
  platform: PlatformContract,
  project: Project
): PluginId[] {
  // Desktop with FSA: Full development experience
  if (platform.deviceType === 'desktop' && project.storageType === 'fsa') {
    return ['filetree', 'monaco', 'chat'];
  }

  // Desktop with IndexedDB: Notes-focused (no real files)
  if (platform.deviceType === 'desktop' && project.storageType === 'indexeddb') {
    return ['filetree', 'notes', 'chat'];
  }

  // Tablet: Notes-focused (no terminal)
  if (platform.deviceType === 'tablet') {
    return ['filetree', 'notes', 'chat'];
  }

  // Mobile: Minimal (single plugin at a time)
  if (platform.deviceType === 'mobile') {
    return ['notes'];  // Just notes, chat accessible via sidebar
  }

  // Fallback
  return ['notes', 'chat'];
}

// ============================================================================
// Get Default Layout Mode Based on Platform
// ============================================================================

/**
 * Get default layout mode based on platform
 * / Lấy chế độ layout mặc định dựa trên nền tảng
 *
 * @remarks
 * - Mobile: Always 1-column (single panel)
 * - Tablet: 2-column (max 2 panels)
 * - Desktop: 2-column default, user can change
 *
 * @param platform - Platform contract from getPlatformContract()
 * @returns Layout mode appropriate for platform
 */
export function getDefaultLayoutMode(
  platform: PlatformContract
): '1-column' | '2-column' | '3-column' | '2+1' {
  if (platform.deviceType === 'mobile') {
    return '1-column';  // Always single panel on mobile
  }

  if (platform.deviceType === 'tablet') {
    return '2-column';  // Max 2 panels on tablet
  }

  // Desktop: 2-column default, user can change
  return '2-column';
}

// ============================================================================
// No additional exports - functions exported above
// ============================================================================
