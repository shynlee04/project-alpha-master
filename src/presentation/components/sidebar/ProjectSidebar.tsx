/**
 * @fileoverview ProjectSidebar - Main sidebar component
 * @module presentation/components/sidebar/ProjectSidebar
 *
 * **ARCH-03-01**: Create ProjectSidebar Component
 *
 * Main sidebar component providing project switching and chat thread access.
 * Collapsible, resizable, with persisted state.
 *
 * @epic EPIC-ARCH-03
 * @story ARCH-03-01
 * @team Team A
 * @created 2026-01-22
 */

import React, { useRef, useState, useEffect } from 'react';
import { X, GripHorizontal } from 'lucide-react';
import { useSidebarStore } from '@/infrastructure/persistence/stores/sidebar-store';
import { ProjectList } from './ProjectList';
import { ChatThreadList } from './ChatThreadList';
import { AgentToolsPanel } from './AgentToolsPanel';
import { SidebarSection } from './SidebarSection';

// ============================================================================
// Props
// ============================================================================

export interface ProjectSidebarProps {
  /** Sidebar is open */
  isOpen: boolean;

  /** Toggle sidebar open/closed */
  onToggle: () => void;

  /** Current project ID to highlight */
  currentProjectId?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;
const DRAG_HANDLE_WIDTH = 4;

// ============================================================================
// Component
// ============================================================================

/**
 * ProjectSidebar Component
 *
 * Collapsible sidebar with project list, chat threads, and agent tools.
 * Resizable by dragging the right edge.
 * State persisted to localStorage.
 */
export function ProjectSidebar({
  isOpen,
  onToggle,
  currentProjectId,
}: ProjectSidebarProps) {
  const { width, setWidth, activeSection, setActiveSection } = useSidebarStore();
  const [isDragging, setIsDragging] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  // Handle resize dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = e.clientX;
      const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
      setWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, setWidth]);

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onToggle();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onToggle]);

  // Render null if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={sidebarRef}
      className="project-sidebar flex flex-col bg-gray-50 border-r-2 border-gray-300 shadow-4"
      style={{
        width: `${width}px`,
        minWidth: `${MIN_WIDTH}px`,
        maxWidth: `${MAX_WIDTH}px`,
      }}
      role="complementary"
      aria-label="Project sidebar"
    >
      {/* Header with close button */}
      <div className="flex items-center justify-between px-3 py-3 bg-gray-100 border-b-2 border-gray-300">
        <h2 className="text-sm font-bold text-gray-800">Projects</h2>
        <button
          type="button"
          onClick={onToggle}
          className="p-1 hover:bg-gray-200 transition-colors"
          aria-label="Close sidebar"
        >
          <X size={18} className="text-gray-700" />
        </button>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Projects Section */}
        <SidebarSection
          title="Projects"
          icon={undefined} // No icon needed, already in header
          defaultExpanded={true}
        >
          <ProjectList currentProjectId={currentProjectId} />
        </SidebarSection>

        {/* Chat Threads Section */}
        <SidebarSection
          title="Chat Threads"
          icon={undefined}
          defaultExpanded={true}
        >
          <ChatThreadList currentProjectId={currentProjectId} />
        </SidebarSection>

        {/* Agent Tools Section */}
        <AgentToolsPanel currentProjectId={currentProjectId} />
      </div>

      {/* Resize Handle */}
      <div
        ref={dragHandleRef}
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400 transition-colors"
        style={{ width: `${DRAG_HANDLE_WIDTH}px` }}
        onMouseDown={handleDragStart}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        title="Drag to resize sidebar"
      >
        {isDragging && (
          <div className="absolute inset-0 bg-blue-600" />
        )}
        {!isDragging && (
          <GripHorizontal
            size={16}
            className="absolute top-1/2 right-1/2 -translate-y-1/2 -translate-x-1/2 text-gray-400"
          />
        )}
      </div>

      {/* Width indicator during drag */}
      {isDragging && (
        <div className="absolute top-1/2 right-4 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs font-mono">
          {Math.round(width)}px
        </div>
      )}
    </div>
  );
}
