/**
 * @fileoverview Project Home - Default project index route
 * @module routes/$projectId/index
 *
 * Shows either:
 * - ProjectHome welcome screen (no module selected)
 * - ModulePanel with active module (from activity-bar)
 *
 * PHASE R-3: Modules wired to activity-bar
 * NO workspaceId - use projectId only
 * NO @/lib imports
 *
 * @created 2026-02-02
 * @updated 2026-02-03 R-3-06 Module Panel wiring
 */

import { createFileRoute } from '@tanstack/react-router';
import { usePlatform } from '@/platform/core/platform-context';
import { ModulePanel } from '@/modules';
import type { ModuleType } from '@/modules';
import { useActivityBarStore, selectMainTopBar } from '@/infrastructure/persistence/stores/activity-bar';
import { useShallow } from 'zustand/react/shallow';

/**
 * Valid module types that can be rendered by ModulePanel
 * Only these plugins render in the center panel
 */
const VALID_MODULE_TYPES: readonly ModuleType[] = ['monaco', 'notes', 'terminal', 'preview'];

/**
 * Check if a plugin ID is a valid module type
 */
function isValidModuleType(value: unknown): value is ModuleType {
  return VALID_MODULE_TYPES.includes(value as ModuleType);
}

/**
 * Route definition for /$projectId/ (index)
 */
export const Route = createFileRoute('/$projectId/')({
  component: ProjectView,
});

/**
 * ProjectView Component
 *
 * Renders ModulePanel if a valid module is selected, otherwise ProjectHome
 */
function ProjectView(): React.JSX.Element {
  const { projectId, isLoading, project, platform } = usePlatform();

  // Get active module from activity-bar store (mainTop is center panel)
  // Uses useShallow to prevent unnecessary re-renders
  const mainTopBar = useActivityBarStore(
    useShallow((state) => selectMainTopBar(state))
  );

  const activePluginId = mainTopBar?.activePluginId;

  if (isLoading) {
    return <ProjectLoading />;
  }

  // If a valid module is selected, render ModulePanel
  if (projectId && isValidModuleType(activePluginId)) {
    return (
      <ModulePanel
        projectId={projectId}
        activeModule={activePluginId}
        className="h-full"
      />
    );
  }

  // Otherwise, render welcome screen
  return <ProjectHome projectId={projectId} project={project} platform={platform} />;
}

/**
 * Loading state component
 */
function ProjectLoading(): React.JSX.Element {
  return (
    <div className="project-home project-home--loading">
      <span className="project-home__loading">Loading project...</span>
    </div>
  );
}

/**
 * ProjectHome Component Props
 */
interface ProjectHomeProps {
  projectId: string | undefined;
  project: ReturnType<typeof usePlatform>['project'];
  platform: ReturnType<typeof usePlatform>['platform'];
}

/**
 * ProjectHome Component
 *
 * Default landing page for a project.
 * Displays project info and available modules.
 */
function ProjectHome({ projectId, project, platform }: ProjectHomeProps): React.JSX.Element {
  return (
    <div className="project-home">
      <header className="project-home__header">
        <h1 className="project-home__title">
          {project?.name || `Project ${projectId?.substring(0, 8)}`}
        </h1>
        <p className="project-home__subtitle">
          Select a module from the activity bar to begin.
        </p>
      </header>

      <section className="project-home__info">
        <h2 className="project-home__section-title">Project Info</h2>
        <dl className="project-home__details">
          <div className="project-home__detail">
            <dt>ID</dt>
            <dd>
              <code>{projectId}</code>
            </dd>
          </div>
          <div className="project-home__detail">
            <dt>Storage</dt>
            <dd>{project?.storageType === 'fsa' ? 'File System' : 'IndexedDB'}</dd>
          </div>
          <div className="project-home__detail">
            <dt>Platform</dt>
            <dd>{platform.platform}</dd>
          </div>
        </dl>
      </section>

      <section className="project-home__modules">
        <h2 className="project-home__section-title">Available Modules</h2>
        <ul className="project-home__module-list">
          {project?.settings.enabledModules.map((module) => (
            <li key={module} className="project-home__module">
              <span className="project-home__module-icon">
                {getModuleIcon(module)}
              </span>
              <span className="project-home__module-name">{module}</span>
              {module === project.settings.defaultModule && (
                <span className="project-home__module-badge">default</span>
              )}
            </li>
          )) ?? (
            <li className="project-home__module project-home__module--empty">
              No modules enabled
            </li>
          )}
        </ul>
      </section>

      {/* R-3 Development Note */}
      <footer className="project-home__footer">
        <p className="project-home__note">
          Phase R-3: Module Panel wiring complete.
          Select notes, monaco, terminal, or preview from activity bar.
        </p>
      </footer>

      <style>{`
        .project-home {
          display: flex;
          flex-direction: column;
          gap: var(--space-6, 1.5rem);
          padding: var(--space-8, 2rem);
          max-width: 800px;
          margin: 0 auto;
          color: hsl(var(--foreground, 0 0% 95%));
        }

        .project-home--loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px;
        }

        .project-home__loading {
          font-family: var(--font-mono, monospace);
          color: hsl(var(--muted-foreground, 0 0% 60%));
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .project-home__header {
          text-align: center;
          padding-bottom: var(--space-4, 1rem);
          border-bottom: 1px solid hsl(var(--border, 240 4% 16%));
        }

        .project-home__title {
          margin: 0;
          font-family: var(--font-mono, monospace);
          font-size: var(--text-2xl, 1.5rem);
          font-weight: var(--font-bold, 700);
        }

        .project-home__subtitle {
          margin: var(--space-2, 0.5rem) 0 0;
          font-size: var(--text-sm, 0.875rem);
          color: hsl(var(--muted-foreground, 0 0% 60%));
        }

        .project-home__info,
        .project-home__modules {
          padding: var(--space-4, 1rem);
          background-color: hsl(var(--card, 240 4% 10%));
          border: 1px solid hsl(var(--border, 240 4% 16%));
          /* 8-bit: sharp corners */
          border-radius: 0;
        }

        .project-home__section-title {
          margin: 0 0 var(--space-3, 0.75rem);
          font-family: var(--font-mono, monospace);
          font-size: var(--text-sm, 0.875rem);
          font-weight: var(--font-semibold, 600);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: hsl(var(--primary, 24.6 95% 53.1%));
        }

        .project-home__details {
          display: flex;
          flex-direction: column;
          gap: var(--space-2, 0.5rem);
          margin: 0;
        }

        .project-home__detail {
          display: flex;
          gap: var(--space-4, 1rem);
          font-size: var(--text-sm, 0.875rem);
        }

        .project-home__detail dt {
          min-width: 80px;
          color: hsl(var(--muted-foreground, 0 0% 60%));
        }

        .project-home__detail dd {
          margin: 0;
        }

        .project-home__detail code {
          font-family: var(--font-mono, monospace);
          font-size: var(--text-xs, 0.75rem);
          padding: 2px 4px;
          background-color: hsl(var(--secondary, 240 4% 16%));
          /* 8-bit: sharp corners */
          border-radius: 0;
        }

        .project-home__module-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2, 0.5rem);
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .project-home__module {
          display: flex;
          align-items: center;
          gap: var(--space-2, 0.5rem);
          padding: var(--space-2, 0.5rem);
          background-color: hsl(var(--secondary, 240 4% 16%));
          /* 8-bit: sharp corners */
          border-radius: 0;
          font-size: var(--text-sm, 0.875rem);
        }

        .project-home__module--empty {
          color: hsl(var(--muted-foreground, 0 0% 60%));
          font-style: italic;
        }

        .project-home__module-icon {
          font-size: 1.25rem;
        }

        .project-home__module-name {
          text-transform: capitalize;
        }

        .project-home__module-badge {
          margin-left: auto;
          padding: 2px 6px;
          font-size: var(--text-xs, 0.75rem);
          background-color: hsl(var(--primary, 24.6 95% 53.1%));
          color: hsl(var(--primary-foreground, 0 0% 100%));
          /* 8-bit: sharp corners */
          border-radius: 0;
        }

        .project-home__footer {
          margin-top: auto;
          padding-top: var(--space-4, 1rem);
          border-top: 1px dashed hsl(var(--border, 240 4% 16%));
        }

        .project-home__note {
          margin: 0;
          font-size: var(--text-xs, 0.75rem);
          color: hsl(var(--muted-foreground, 0 0% 60%));
          text-align: center;
        }
      `}</style>
    </div>
  );
}

/**
 * Get icon for a module type
 */
function getModuleIcon(module: string): string {
  const icons: Record<string, string> = {
    monaco: '💻',
    notes: '📝',
    terminal: '⌨️',
    preview: '👁️',
  };
  return icons[module] ?? '📦';
}
