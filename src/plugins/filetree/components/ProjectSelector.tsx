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
 * - Create new projects via dialog
 * - 8-bit design system styling
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PLAT-05 - Project Switching
 * @updated 2026-02-01 - Added createProject dialog (gap closure 01-06)
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronDown, FolderOpen, Plus, X } from 'lucide-react';
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
  const { listProjects, switchProject, activeProject, activeProjectId, createProject } = useFileTreeOperations();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dialogInputRef = useRef<HTMLInputElement>(null);

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

  /**
   * Focus input when dialog opens
   */
  useEffect(() => {
    if (showNameDialog && dialogInputRef.current) {
      dialogInputRef.current.focus();
    }
  }, [showNameDialog]);

  /**
   * Handle opening project creation dialog
   */
  const handleOpenCreateDialog = useCallback(() => {
    setIsOpen(false);
    setNewProjectName('');
    setCreateError(null);
    setShowNameDialog(true);
  }, []);

  /**
   * Handle project creation
   */
  const handleCreateProject = useCallback(async () => {
    if (!newProjectName.trim()) {
      setCreateError('Project name is required');
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const result = await createProject({
        name: newProjectName.trim(),
        folderPath: `/browser/${newProjectName.trim().toLowerCase().replace(/\s+/g, '-')}`,
        storageType: 'indexeddb',
      });

      if (result.success && result.projectId) {
        setShowNameDialog(false);
        setNewProjectName('');
        // Switch to the newly created project
        switchProject(result.projectId);
      } else {
        setCreateError(result.error || 'Failed to create project');
      }
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  }, [newProjectName, createProject, switchProject]);

  /**
   * Handle dialog cancel
   */
  const handleCancelCreate = useCallback(() => {
    setShowNameDialog(false);
    setNewProjectName('');
    setCreateError(null);
  }, []);

  /**
   * Handle Enter key in input
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isCreating) {
      e.preventDefault();
      handleCreateProject();
    } else if (e.key === 'Escape') {
      handleCancelCreate();
    }
  }, [isCreating, handleCreateProject, handleCancelCreate]);

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
            onClick={handleOpenCreateDialog}
            className="w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 hover:bg-muted text-muted-foreground"
            style={{ borderRadius: 0 }}
          >
            <Plus size={14} />
            <span>New Project</span>
          </button>
        </div>
      )}

      {/* New Project Dialog (8-bit design) */}
      {showNameDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-[100]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={handleCancelCreate}
          />
          
          {/* Dialog */}
          <div
            className="relative bg-card border-2 border-border p-4 min-w-[300px] max-w-[400px]"
            style={{
              boxShadow: '4px 4px 0 0 rgba(0,0,0,0.3)',
              borderRadius: 0,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">New Project</h3>
              <button
                onClick={handleCancelCreate}
                className="p-1 hover:bg-muted"
                style={{ borderRadius: 0 }}
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>

            {/* Name input */}
            <div className="mb-4">
              <label className="block text-xs text-muted-foreground mb-1">
                Project Name
              </label>
              <input
                ref={dialogInputRef}
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="My New Project"
                disabled={isCreating}
                className="w-full px-2 py-1.5 text-sm bg-background border-2 border-border focus:border-primary focus:outline-none disabled:opacity-50"
                style={{ borderRadius: 0 }}
              />
            </div>

            {/* Error message */}
            {createError && (
              <div className="mb-4 px-2 py-1 text-xs text-destructive bg-destructive/10 border border-destructive/20">
                {createError}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelCreate}
                disabled={isCreating}
                className="px-3 py-1.5 text-sm border-2 border-border hover:bg-muted disabled:opacity-50"
                style={{ borderRadius: 0 }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={isCreating || !newProjectName.trim()}
                className="px-3 py-1.5 text-sm bg-primary text-primary-foreground border-2 border-primary hover:bg-primary/90 disabled:opacity-50"
                style={{ borderRadius: 0 }}
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
