/**
 * @fileoverview PlatformLayout - Main layout for project routes
 * @module @/platform/core/platform-layout
 *
 * KEY DESIGN:
 * - FileTree and Chat are HARDCODED here (not store-driven)
 * - Only the center panel (modules) uses activity-bar store
 * - No hydration waiting - if project loads, layout renders
 *
 * PHASE R-0: Foundation layout for Strategic Rebuild
 * R-1: FileTree and Chat operators now wired
 *
 * 8-BIT DESIGN: Sharp corners, pixel shadows, no blur
 *
 * @created 2026-02-02
 */

import React, { type ReactNode } from 'react';
import { usePlatform } from './platform-context';
import { FileTreeOperatorComponent } from '../operators/filetree';
import { ChatOperatorView } from '../operators/chat';
import './platform-layout.css';

interface PlatformLayoutProps {
  /** Module content to render in center panel */
  children: ReactNode;
}

/**
 * PlatformLayout Component
 *
 * The main 3-column layout for project routes:
 * - LEFT: FileTree operator (always present)
 * - CENTER: Module panel (children/Outlet)
 * - RIGHT: Chat operator (always present)
 *
 * @example
 * ```tsx
 * <PlatformLayout>
 *   <Outlet /> // Module content
 * </PlatformLayout>
 * ```
 */
export function PlatformLayout({
  children,
}: PlatformLayoutProps): React.JSX.Element {
  const { isLoading, error, projectId } = usePlatform();

  // Loading state
  if (isLoading) {
    return (
      <div className="platform-layout platform-layout--loading">
        <div className="platform-loading">
          <div className="platform-loading__spinner" aria-hidden="true" />
          <span className="platform-loading__text">Loading project...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="platform-layout platform-layout--error">
        <div className="platform-error" role="alert">
          <h2 className="platform-error__title">Error Loading Project</h2>
          <p className="platform-error__message">{error.message}</p>
          <button
            className="platform-error__button"
            onClick={() => window.location.reload()}
            type="button"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="platform-layout">
      {/* LEFT: FileTree Operator - ALWAYS HERE */}
      <aside
        className="platform-operator platform-operator--filetree"
        data-operator="filetree"
        aria-label="File tree"
      >
        <FileTreeOperatorComponent projectId={projectId} />
      </aside>

      {/* CENTER: Module Panel - store-driven in future */}
      <main
        className="platform-modules"
        id="main-content"
        tabIndex={-1}
        aria-label="Main content"
      >
        {children}
      </main>

      {/* RIGHT: Chat Operator - ALWAYS HERE */}
      <aside
        className="platform-operator platform-operator--chat"
        data-operator="chat"
        aria-label="AI Chat"
      >
        <ChatOperatorView />
      </aside>
    </div>
  );
}
