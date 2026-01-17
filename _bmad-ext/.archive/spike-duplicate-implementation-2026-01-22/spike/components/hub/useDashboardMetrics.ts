/**
 * @fileoverview Dashboard Metrics Hook
 * @module spike/components/hub/useDashboardMetrics
 * @created 2026-01-03T00:30:00+07:00
 *
 * Custom hook for aggregating dashboard metrics from project data.
 * Computes project counts, storage estimates, and activity metrics.
 */

import { useMemo } from 'react';
import type { Project } from '@/spike/infrastructure/persistence/stores/project/project-types';

export interface DashboardMetrics {
  // Project counts
  totalProjects: number;
  activeProjects: number;
  deletedProjects: number;

  // Storage estimates (rough approximation)
  estimatedStorageKB: number;
  estimatedStorageMB: number;

  // Activity metrics
  projectsOpenedToday: number;
  projectsOpenedThisWeek: number;
  recentlyActiveProjects: Project[];

  // Workspace distribution (percentages)
  ideWorkspaceCount: number;
  knowledgeWorkspaceCount: number;
  notesWorkspaceCount: number;
  studyWorkspaceCount: number;
}

export interface UseDashboardMetricsOptions {
  /** Projects to aggregate metrics from */
  projects: Project[];
  /** Number of days to consider "recently active" (default: 7) */
  recentDays?: number;
}

/**
 * Hook for computing dashboard metrics from project data.
 *
 * Features:
 * - Project count aggregation (total, active, deleted)
 * - Storage estimation (rough approximation based on metadata size)
 * - Activity tracking (today, this week, recently active)
 * - Workspace distribution (projects with workspace bindings)
 * - Memoized calculations for performance
 *
 * @example
 * ```tsx
 * const projects = useLiveQuery(() => db.projects.toArray());
 * const metrics = useDashboardMetrics({ projects });
 *
 * <div>Total Projects: {metrics.totalProjects}</div>
 * <div>Storage: {metrics.estimatedStorageMB} MB</div>
 * ```
 */
export function useDashboardMetrics({
  projects,
  recentDays = 7,
}: UseDashboardMetricsOptions): DashboardMetrics {
  return useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();

    // Initialize counters
    let totalProjects = 0;
    let activeProjects = 0;
    let deletedProjects = 0;
    let projectsOpenedToday = 0;
    let projectsOpenedThisWeek = 0;
    let estimatedStorage = 0;

    let ideWorkspaceCount = 0;
    let knowledgeWorkspaceCount = 0;
    let notesWorkspaceCount = 0;
    let studyWorkspaceCount = 0;

    const recentlyActiveProjects: Project[] = [];

    // Aggregate metrics from projects
    if (Array.isArray(projects)) {
      for (const project of projects) {
        // Skip deleted projects from most metrics
        if (project.deletedAt) {
          deletedProjects++;
          continue;
        }

        totalProjects++;
        activeProjects++;

        // Estimate storage (rough approximation: JSON string length / 1024)
        try {
          const jsonSize = JSON.stringify(project).length;
          estimatedStorage += jsonSize;
        } catch (error) {
          // If JSON.stringify fails, estimate 2KB per project
          estimatedStorage += 2048;
        }

        // Activity tracking
        if (project.lastOpened) {
          const lastOpenedTime = new Date(project.lastOpened).getTime();

          if (lastOpenedTime >= startOfToday) {
            projectsOpenedToday++;
          }

          if (lastOpenedTime >= startOfWeek) {
            projectsOpenedThisWeek++;
            recentlyActiveProjects.push(project);
          }
        }

        // Workspace distribution (based on workspaceBindings) - ARC-D03
        if (project.workspaceBindings) {
          if (project.workspaceBindings.ide) ideWorkspaceCount++;
          if (project.workspaceBindings.knowledge) knowledgeWorkspaceCount++;
          if (project.workspaceBindings.notes) notesWorkspaceCount++;
          if (project.workspaceBindings.study) studyWorkspaceCount++;
        }
      }
    }

    // Convert storage to KB/MB
    const estimatedStorageKB = Math.round(estimatedStorage / 1024);
    const estimatedStorageMB = Math.round(estimatedStorageKB / 1024);

    // Sort recently active projects by lastOpened (descending)
    recentlyActiveProjects.sort((a, b) => {
      const timeA = a.lastOpened ? new Date(a.lastOpened).getTime() : 0;
      const timeB = b.lastOpened ? new Date(b.lastOpened).getTime() : 0;
      return timeB - timeA;
    });

    return {
      totalProjects,
      activeProjects,
      deletedProjects,
      estimatedStorageKB,
      estimatedStorageMB,
      projectsOpenedToday,
      projectsOpenedThisWeek,
      recentlyActiveProjects,
      ideWorkspaceCount,
      knowledgeWorkspaceCount,
      notesWorkspaceCount,
      studyWorkspaceCount,
    };
  }, [projects, recentDays]);
}