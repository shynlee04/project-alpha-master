/**
 * @fileoverview Project Selector Component
 * @module plugins/filetree/components/ProjectSelector
 *
 * **PLAT-05**: Project switching dropdown for FileTree.
 *
 * Features:
 * - Lists all available projects
 * - Shows active project
 * - Click to switch projects (fires project:switched event)
 * - 8-bit design system styling
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PLAT-05 - Project Switching
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronDown, FolderOpen, Plus } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useFileTreeOperations } from '../hooks/useFileTreeOperations';

// ============================================================================
// ProjectSelector Component
// ============================================================================

/**
 * ProjectSelector - Dropdown for switching between projects
 *
 * Uses 8-bit design system:
 * - Sharp corners (border-radius: 0 or 2px max)
 * - Pixel shadow: box-shadow: 4px 4px 0 0 var(--shadow-color)
 * - Solid colors, no gradients or blur
 *
 * @returns JSX element
 */
export function ProjectSelector(): React.JSX.Element {
  const { listProjects, switchProject, activeProject, activeProjectId } = useFileTreeOperations();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get all projects
  const projects = listProjects();

  /**
   * Toggle dropdown visibility
   */
  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  /**
   * Handle project selection
   */
  const handleSelectProject = useCallback((projectId: string) => {
    switchProject(projectId);
    setIsOpen(false);
  }, [switchProject]);

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected project button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-1 py-0.5 hover:bg-muted/80"
        style={{ borderRadius: 0 }}
      >
        <FolderOpen size={12} />
        <span className="max-w-[120px] truncate">
          {activeProject?.name || 'Select Project'}
        </span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown menu (8-bit design) */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 min-w-[180px] max-h-[300px] overflow-y-auto bg-card border-2 border-border z-50"
          style={{
            boxShadow: '4px 4px 0 0 rgba(0,0,0,0.2)',
            borderRadius: 0,
          }}
        >
          {/* Project list */}
          {projects.length > 0 ? (
            <div className="py-1">
              {projects.map((project) => {
                const isActive = project.id === activeProjectId;
                return (
                  <button
                    key={project.id}
                    onClick={() => handleSelectProject(project.id)}
                    className={`w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 hover:bg-muted ${
                      isActive ? 'bg-primary/10 font-medium' : ''
                    }`}
                    style={{ borderRadius: 0 }}
                  >
                    <FolderOpen
                      size={14}
                      className={isActive ? 'text-primary' : 'text-muted-foreground'}
                    />
                    <span className="truncate flex-1">{project.name}</span>
                    {isActive && (
                      <span className="text-xs text-primary">●</span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground text-center">
              No projects
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-border" />

          {/* New project button */}
          <button
            onClick={() => {
              // Open project creation flow
              // For now, just log - actual creation would open a wizard
              console.log('[ProjectSelector] New project requested');
              setIsOpen(false);
            }}
            className="w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 hover:bg-muted text-muted-foreground"
            style={{ borderRadius: 0 }}
          >
            <Plus size={14} />
            <span>New Project</span>
          </button>
        </div>
      )}
    </div>
  );
}
