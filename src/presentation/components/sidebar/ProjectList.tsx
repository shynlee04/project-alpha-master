/**
 * @fileoverview ProjectList - Project list with search/filter
 * @module presentation/components/sidebar/ProjectList
 *
 * **ARCH-03-01**: Create ProjectSidebar Component
 *
 * Displays list of projects with search/filter functionality.
 * Highlights current project and navigates to project on click.
 *
 * @epic EPIC-ARCH-03
 * @story ARCH-03-01
 * @team Team A
 * @created 2026-01-22
 */

import React, { useMemo } from 'react';
import { Folder, Search } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useAllProjects } from '@/infrastructure/persistence/stores/project/useProjectStore';
import type { Project } from '@/domain/entities/project';
import { useSearchQuery } from '@/infrastructure/persistence/stores/sidebar-store';

// ============================================================================
// Props
// ============================================================================

export interface ProjectListProps {
  /** Current project ID to highlight */
  currentProjectId?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ProjectList Component
 *
 * Displays searchable list of projects.
 * Current project is highlighted with different background.
 * Click navigates to project route using TanStack Router.
 */
export function ProjectList({ currentProjectId }: ProjectListProps) {
  const navigate = useNavigate();
  const allProjects = useAllProjects();
  const { searchQuery, setSearchQuery } = useSearchQuery();

  // Filter projects by search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) {
      return allProjects;
    }

    const query = searchQuery.toLowerCase();
    return allProjects.filter((project) =>
      project.name.toLowerCase().includes(query) ||
      project.id.toLowerCase().includes(query)
    );
  }, [allProjects, searchQuery]);

  const handleProjectClick = (project: Project) => {
    navigate({
      to: '/$projectId',
      params: { projectId: project.id },
    });
  };

  return (
    <div className="project-list">
      {/* Search Input */}
      <div className="relative mb-2">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter projects..."
          className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-300 bg-white focus:border-blue-600 focus:outline-none"
        />
      </div>

      {/* Project List */}
      <div className="project-items max-h-96 overflow-y-auto">
        {filteredProjects.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-gray-500">
            {searchQuery ? 'No projects found' : 'No projects yet'}
          </div>
        ) : (
          filteredProjects.map((project) => {
            const isActive = project.id === currentProjectId;

            return (
              <button
                key={project.id}
                type="button"
                onClick={() => handleProjectClick(project)}
                className={`w-full text-left px-3 py-2 text-sm border-b border-gray-200 cursor-pointer transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-800 hover:bg-gray-100'
                }`}
                aria-selected={isActive}
              >
                <Folder
                  size={16}
                  className={isActive ? 'text-white' : 'text-gray-600'}
                />
                <span className="flex-1 truncate">{project.name}</span>
                {project.storageType === 'fsa' && (
                  <span className="text-xs text-gray-400">FSA</span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
