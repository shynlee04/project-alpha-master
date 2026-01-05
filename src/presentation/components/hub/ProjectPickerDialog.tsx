/**
 * @fileoverview Project Picker Dialog
 * @module presentation/components/hub/ProjectPickerDialog
 *
 * Dialog for selecting which project to open when navigating to a workspace.
 * Shows all mounted projects with search/filter capabilities.
 *
 * @scenario
 * - User clicks "Notes" in Hub
 * - If 0 projects: Show empty state prompting to create project
 * - If 1 project: Auto-select and navigate
 * - If multiple projects: Show picker dialog
 */

import React, { useState, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { FolderOpen, Search, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { db } from '@/infrastructure/persistence/dexie-db';
import { cn } from '@/lib/utils';
import type { Project, WorkspaceBindings } from '@/infrastructure/persistence/stores/project/project-types';
import type { ProjectRecord } from '@/lib/state/dexie-db-types';

interface ProjectPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetWorkspace: 'ide' | 'notes' | 'knowledge' | 'study' | 'agents';
  onSelectProject?: (projectId: string) => void;
}

export function ProjectPickerDialog({
  open,
  onOpenChange,
  targetWorkspace,
  onSelectProject,
}: ProjectPickerDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Fetch projects from Dexie
  const projects = useMemo(() => {
    // This will be reactive via useLiveQuery in actual component
    return [] as Project[];
  }, []);

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    return projects.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  // Get workspace icon for display
  const workspaceConfig = useMemo(() => {
    const configs = {
      ide: { icon: '💻', label: 'IDE', color: 'text-blue-400' },
      notes: { icon: '📝', label: 'Notes', color: 'text-green-400' },
      knowledge: { icon: '📚', label: 'Knowledge', color: 'text-purple-400' },
      study: { icon: '🎓', label: 'Study', color: 'text-yellow-400' },
      agents: { icon: '🤖', label: 'Agents', color: 'text-red-400' },
    };
    return configs[targetWorkspace];
  }, [targetWorkspace]);

  // Handle project selection
  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  // Handle confirm navigation
  const handleConfirm = async () => {
    if (!selectedProjectId) return;

    // Call callback if provided
    if (onSelectProject) {
      onSelectProject(selectedProjectId);
    } else {
      // Default: navigate to workspace with project
      await navigate({
        to: `/${targetWorkspace}/$projectId`,
        params: { projectId: selectedProjectId },
      });
    }

    // Close dialog and reset state
    onOpenChange(false);
    setSelectedProjectId(null);
    setSearchQuery('');
  };

  // Handle create new project
  const handleCreateProject = () => {
    onOpenChange(false);
    // Trigger new project creation flow
    // This would typically emit an event or call a parent handler
    navigate({ to: '/hub' }); // Refresh to show new project
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg max-h-[80vh] bg-card border border-border rounded-lg shadow-xl z-50 focus:outline-none">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <Dialog.Title className="text-xl font-bold flex items-center gap-3">
              <span className="text-2xl">{workspaceConfig.icon}</span>
              Open in {workspaceConfig.label}
            </Dialog.Title>
            <Dialog.Description className="text-muted-foreground mt-2">
              Select a project to open in the {workspaceConfig.label} workspace
            </Dialog.Description>
          </div>

          {/* Search Input */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Project List */}
          <div className="p-4 max-h-[300px] overflow-y-auto">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? 'No projects found matching your search'
                    : 'No projects mounted yet'}
                </p>
                <button
                  onClick={handleCreateProject}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Mount a Project Folder
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProjects.map((project) => (
                  <ProjectListItem
                    key={project.id}
                    project={project}
                    isSelected={selectedProjectId === project.id}
                    onClick={() => handleSelectProject(project.id)}
                    targetWorkspace={targetWorkspace}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border flex justify-between items-center">
            <button
              onClick={handleCreateProject}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              + Mount New Project
            </button>
            <div className="flex gap-3">
              <Dialog.Close asChild>
                <button
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  onClick={() => {
                    setSelectedProjectId(null);
                    setSearchQuery('');
                  }}
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={handleConfirm}
                disabled={!selectedProjectId}
                className={cn(
                  'px-4 py-2 rounded-lg transition-colors flex items-center gap-2',
                  selectedProjectId
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
              >
                Open Project
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ============================================================================
// Project List Item
// ============================================================================

interface ProjectListItemProps {
  project: Project;
  isSelected: boolean;
  onClick: () => void;
  targetWorkspace: string;
}

function ProjectListItem({
  project,
  isSelected,
  onClick,
  targetWorkspace,
}: ProjectListItemProps) {
  // Format last opened date
  const lastOpened = useMemo(() => {
    if (!project.lastOpened) return 'Never';
    const date = new Date(project.lastOpened);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }, [project.lastOpened]);

  // Check if workspace is enabled for this project
  const isWorkspaceEnabled = useMemo(() => {
    const bindings = project.bindings as unknown as WorkspaceBindings | undefined;
    return bindings?.[targetWorkspace as keyof WorkspaceBindings] ?? true;
  }, [project.bindings, targetWorkspace]);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 rounded-lg border text-left transition-all',
        isSelected
          ? 'border-primary bg-primary/10'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{project.name}</span>
            {!isWorkspaceEnabled && (
              <span className="text-xs px-2 py-0.5 bg-muted rounded text-muted-foreground">
                {targetWorkspace} not enabled
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lastOpened}
            </span>
            {project.folderPath && (
              <span className="truncate opacity-60">{project.folderPath}</span>
            )}
          </div>
        </div>
        {isSelected && (
          <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
        )}
      </div>
    </button>
  );
}
